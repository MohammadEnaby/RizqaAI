import json
import os
import sys
from typing import List, Dict
from datetime import datetime, timedelta

# Add the parent directory (backend) to sys.path so we can import core.firebase
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

try:
    from core.firebase import db
except ImportError as e:
    print(f"[ERROR] Failed to import firebase client: {e}")
    print("   Make sure you are running this script from the correct environment.")
    raise SystemExit(1)


STRUCTURED_PATH = os.path.join(parent_dir, "Data", "structuered_jobs.json")


def load_structured_jobs(path: str = STRUCTURED_PATH) -> List[Dict]:
    if not os.path.exists(path):
        print(f"[*] '{path}' does not exist. No jobs to upload.")
        return []
        
    if os.path.getsize(path) == 0:
        print(f"[*] '{path}' is empty. No jobs to upload.")
        return []

    with open(path, "r", encoding="utf-8") as fh:
        try:
            data = json.load(fh)
        except json.JSONDecodeError:
            print(f"[ERROR] Failed to decode JSON from '{path}'.")
            return []

    if not isinstance(data, list):
        print(f"[ERROR] '{path}' must contain a list of jobs.")
        return []

    return data


def upload_to_firebase(jobs: List[Dict]) -> None:
    """
    Uploads the list of jobs to the 'jobs' collection in Firestore.
    """
    if not jobs:
        print("[*] No jobs to upload.")
        return

    print(f"[>] Uploading {len(jobs)} jobs to Firebase...")
    
    collection_ref = db.collection("jobs")
    
    count = 0
    for job in jobs:
        try:
            # Use a unique ID if available, otherwise let Firestore generate one
            # Assuming 'id' or 'job_id' might be in the dict, or we just add.
            # If we want to avoid duplicates, we should pick a stable ID.
            # For now, we'll just add them.
            
            # Convert post_time to datetime object if it exists
            expire_base = datetime.now()
            if "post_time" in job and job["post_time"]:
                try:
                    # Handle ISO 8601 strings
                    job["post_time"] = datetime.fromisoformat(job["post_time"])
                    expire_base = job["post_time"]
                except ValueError:
                    print(f"[!] Could not parse post_time '{job['post_time']}' for job '{job.get('job_title')}'. Keeping as string.")

            # Add TTL (expireAt) - 7 days from post_time (or now if invalid/missing)
            job["expireAt"] = expire_base + timedelta(days=7)

            # If the job has an 'id', use it as the document ID
            doc_id = job.get("id")
            if doc_id:
                collection_ref.document(str(doc_id)).set(job)
            else:
                collection_ref.add(job)
            
            count += 1
            # Optional: Print progress every 10 jobs
            if count % 10 == 0:
                print(f"   ... uploaded {count} jobs")
                
        except Exception as e:
            print(f"[ERROR] Error uploading job {job.get('title', 'Unknown')}: {e}")

    print(f"[SUCCESS] Successfully uploaded {count} jobs to Firestore.")


def main():
    print(f"[DEBUG] Python: {sys.executable}")
    print(f"[DEBUG] Script: {os.path.abspath(__file__)}")
    
    try:
        jobs = load_structured_jobs()
    except Exception as err:
        print(f"[ERROR] Cannot upload: {err}")
        raise SystemExit(1)

    if not jobs:
        print("[*] No jobs found to upload.")
        # Exit with 0 because this is a valid state (nothing to do)
        return

    try:
        upload_to_firebase(jobs)
    except Exception as err:
        print(f"[ERROR] Firebase upload failed: {err}")
        raise SystemExit(1)

    print("[SUCCESS] Firebase upload step completed.")


if __name__ == "__main__":
    main()

