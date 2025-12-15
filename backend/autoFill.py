
import os
import sys
import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

# Add the parent directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from core.firebase import db
    from firebase_admin import firestore
except ImportError as e:
    print(f"[ERROR] Failed to import firebase client: {e}")
    db = None

from core.pipeline import pipeline_generator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

async def process_pipeline_background(doc_id: str, config: dict) -> tuple[bool, str]:
    """
    Runs the pipeline for a scheduled task and captures output.
    """
    group_id = config.get("groupID")
    max_scrolls = config.get("maxScrolls", 100)
    
    if not group_id:
        return False, "Missing groupID"

    logging.info(f"Starting pipeline for Group: {group_id} (Doc ID: {doc_id})")
    
    output_log = []
    success = True
    
    try:
        async for line in pipeline_generator(group_id, max_scrolls):
            # Log significant lines or errors
            if "[ERROR]" in line or "[EXCEPTION]" in line:
                logging.error(f"Pipeline {doc_id}: {line.strip()}")
                success = False
            elif "Completed" in line or "Success" in line:
                logging.info(f"Pipeline {doc_id}: {line.strip()}")
            
            output_log.append(line)
            
            # Stop if we detect failure signal in logs (naive check)
            if "failed with return code" in line:
                success = False
                
    except Exception as e:
        logging.error(f"Exception in pipeline {doc_id}: {e}")
        return False, str(e)

    full_log = "".join(output_log)
    return success, full_log[-1000:] # Return last 1000 chars of log

async def check_schedules():
    """
    Checks the 'schedulingPipelines' collection for due tasks.
    """
    if not db:
        logging.error("Database not initialized, skipping schedule check.")
        return

    logging.info("Checking schedules...")
    try:
        # Get all scheduling pipelines
        # Note: In async context, stream() is still synchronous in firebase-admin usually, 
        # but we run it in executor if needed. For now, direct call is okay if not too heavy.
        docs = db.collection("schedulingPipelines").stream()
        
        for doc in docs:
            data = doc.to_dict()
            interval_minutes = data.get("interval", 1440)
            last_run_stats = data.get("lastRunStats")
            
            should_run = False
            
            if not last_run_stats:
                logging.info(f"Pipeline {doc.id} never ran. Scheduling now.")
                should_run = True
            else:
                last_ts = last_run_stats.get("timestamp")
                if last_ts:
                    # Ensure timezone awareness
                    last_run_dt = last_ts
                    if last_run_dt.tzinfo is None:
                         last_run_dt = last_run_dt.replace(tzinfo=timezone.utc)
                    
                    next_run = last_run_dt + timedelta(minutes=interval_minutes)
                    
                    now = datetime.now(timezone.utc)
                    
                    if now >= next_run:
                        logging.info(f"Pipeline {doc.id} is due (Next run was: {next_run}). Scheduling now.")
                        should_run = True
                    else:
                        pass # logging.debug(f"Pipeline {doc.id} not due yet.")
                else:
                    should_run = True

            if should_run:
                start_time = datetime.now(timezone.utc)
                success, message = await process_pipeline_background(doc.id, data)
                end_time = datetime.now(timezone.utc)
                duration = (end_time - start_time).total_seconds()
                
                # Update Firestore with run results
                db.collection("schedulingPipelines").document(doc.id).update({
                    "lastRunStats": {
                        "timestamp": firestore.SERVER_TIMESTAMP,
                        "success": success,
                        "message": message,
                        "durationSeconds": duration
                    }
                })
                logging.info(f"Pipeline {doc.id} finished. Success: {success}")

    except Exception as e:
        logging.error(f"Error in scheduler loop: {e}")

async def scheduler_loop():
    """
    The main infinite loop for the scheduler.
    """
    logging.info("--- Starting AutoFill Scheduler (Async) ---")
    while True:
        await check_schedules()
        await asyncio.sleep(60)

if __name__ == "__main__":
    # Allow running standalone
    try:
        asyncio.run(scheduler_loop())
    except KeyboardInterrupt:
        print("Stopped.")
