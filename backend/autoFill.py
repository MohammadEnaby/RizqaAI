
import os
import sys
import time
import subprocess
import logging
from datetime import datetime, timedelta, timezone

# Add the parent directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from core.firebase import db
    from firebase_admin import firestore
except ImportError as e:
    print(f"[ERROR] Failed to import firebase client: {e}")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

def run_script(script_name, env_vars):
    """
    Runs a script located in the 'scripts' directory.
    Returns (success: bool, output: str)
    """
    script_path = os.path.join(current_dir, "scripts", script_name)
    if not os.path.exists(script_path):
        return False, f"Script not found: {script_path}"

    logging.info(f"Running {script_name}...")
    try:
        # Inherit environment but update with specific vars
        process = subprocess.run(
            [sys.executable, script_path],
            env=env_vars,
            capture_output=True,
            text=True,
            encoding='utf-8',
            check=False # Don't raise exception on non-zero exit, handle manually
        )
        
        output = process.stdout + "\n" + process.stderr
        
        if process.returncode != 0:
            logging.error(f"{script_name} failed with code {process.returncode}")
            return False, output
            
        logging.info(f"{script_name} completed successfully.")
        return True, output

    except Exception as e:
        logging.error(f"Exception running {script_name}: {e}")
        return False, str(e)

def process_pipeline(doc_id, config):
    """
    Executes the full pipeline: Scrape -> Extract -> Upload
    """
    group_id = config.get("groupID")
    max_scrolls = config.get("maxScrolls", 100)
    
    if not group_id:
        return False, "Missing groupID"

    logging.info(f"Starting pipeline for Group: {group_id} (Doc ID: {doc_id})")
    
    # Prepare environment variables
    env = os.environ.copy()
    env["FB_GROUP_ID"] = str(group_id)
    env["MAX_SCROLLS"] = str(max_scrolls)
    # Ensure correct python path for subprocesses
    env["PYTHONPATH"] = current_dir

    # 1. Scrape Posts
    ok, log = run_script("postsExtraction.py", env)
    if not ok:
        return False, f"Scraping failed: {log[-200:]}..." # Return last 200 chars of error

    # 2. Extract Jobs
    ok, log = run_script("JobExtraction.py", env)
    if not ok:
        return False, f"Extraction failed: {log[-200:]}..."

    # 3. Upload to Firebase
    ok, log = run_script("firebaseUploader.py", env)
    if not ok:
        return False, f"Upload failed: {log[-200:]}..."
        
    return True, "Pipeline completed successfully"

def check_schedules():
    """
    Checks the 'schedulingPipelines' collection for due tasks.
    """
    logging.info("Checking schedules...")
    try:
        # Get all scheduling pipelines
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
                        logging.debug(f"Pipeline {doc.id} not due yet. Next run: {next_run}")
                else:
                    should_run = True

            if should_run:
                start_time = datetime.now(timezone.utc)
                success, message = process_pipeline(doc.id, data)
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

if __name__ == "__main__":
    logging.info("--- Starting AutoFill Scheduler (Interval-based Database Filler) ---")
    print("Press Ctrl+C to stop.")
    
    try:
        while True:
            check_schedules()
            # Wait for 60 seconds before next check
            time.sleep(60)
    except KeyboardInterrupt:
        logging.info("Scheduler stopped by user.")
