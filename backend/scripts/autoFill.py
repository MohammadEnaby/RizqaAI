import os
import sys
import json
import asyncio
import logging
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Optional

# Add the parent directory to sys.path
# Add the backend directory (parent) to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from core.firebase import db
    from firebase_admin import firestore
except ImportError as e:
    print(f"[ERROR] Failed to import firebase client: {e}")
    db = None

from core.pipeline import pipeline_generator
from core.reporting import send_email_report

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)


async def process_pipeline_background(doc_id: str, config: dict) -> tuple[bool, str, dict]:
    """
    Runs the pipeline for a scheduled task and captures output.
    Returns: (success, log_snippet, run_stats_dict)
    """
    group_id = config.get("groupID")
    
    if not group_id:
        return False, "Missing groupID", {}

    logging.info(f"Starting pipeline for Group: {group_id} (Doc ID: {doc_id})")
    
    output_log = []
    success = True
    stats = {"totalJobs": 0, "breakdown": {}}
    
    try:
        async for line in pipeline_generator(group_id):
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
        return False, str(e), {}

    full_log = "".join(output_log)

    if success:
        # Read the structured jobs file to generate report
        # The path should be consistent with where JobExtraction.py saves it.
        # JobExtraction.py uses: os.path.join(backend_root, "Data", "structuered_jobs.json")
        jobs_file_path = os.path.join(backend_dir, "Data", "structuered_jobs.json")
        
        if os.path.exists(jobs_file_path):
            try:
                with open(jobs_file_path, 'r', encoding='utf-8') as f:
                    jobs_data = json.load(f)
                    
                if isinstance(jobs_data, list):
                    job_count = len(jobs_data)
                    job_titles = [job.get("job_title", "Unknown Title") for job in jobs_data]
                    
                    # Update stats
                    stats["totalJobs"] = job_count
                    if job_titles:
                         # Top 5 most common titles
                         counts = Counter(job_titles)
                         stats["breakdown"] = dict(counts.most_common(5))

                    # Fetch group name for better reporting
                    group_name = None
                    if db and group_id:
                        try:
                            group_doc = db.collection("platformGroups").document(str(group_id)).get()
                            if group_doc.exists:
                                group_name = group_doc.to_dict().get("name")
                        except Exception as e:
                            logging.warning(f"Could not fetch group name for {group_id}: {e}")

                    # Send the email
                    send_email_report(job_count, job_titles, group_name=group_name)
                else:
                    logging.warning(f"structured_jobs.json has invalid format: {type(jobs_data)}")

            except Exception as e:
                logging.error(f"Failed to read jobs file for reporting: {e}")
        else:
            logging.warning(f"structured_jobs.json not found at {jobs_file_path}. Skipping report.")

    return success, full_log[-1000:], stats # Return last 1000 chars of log and stats

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
            
            # Check for timestamp in new location first, then old
            last_run_metadata = data.get("lastRunMetadata")
            last_ts = None
            
            if last_run_metadata:
                 last_ts = last_run_metadata.get("timestamp")
            elif isinstance(last_run_stats, dict):
                 # Fallback for old format
                 last_ts = last_run_stats.get("timestamp")

            if not last_ts:
                logging.info(f"Pipeline {doc.id} never ran (or no timestamp found). Scheduling now.")
                should_run = True
            else:
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
                success, message, run_stats = await process_pipeline_background(doc.id, data)
                end_time = datetime.now(timezone.utc)
                duration = (end_time - start_time).total_seconds()
                
                # Update Firestore with run results
                db.collection("schedulingPipelines").document(doc.id).update({
                    "lastRunStats": run_stats.get("totalJobs", 0),  # Now just an integer
                    "lastRunMetadata": {
                        "timestamp": firestore.SERVER_TIMESTAMP,
                        "success": success,
                        "message": message,
                        "durationSeconds": duration,
                        "breakdown": run_stats.get("breakdown", {})
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
