import os
import sys
import logging
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import firestore

# Add backend to path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

try:
    from core.firebase import db
except ImportError as e:
    logging.error(f"Failed to import firebase client: {e}")
    db = None

def delete_expired_jobs():
    """
    Deletes jobs from Firestore where expireAt is in the past.
    Returns the number of deleted jobs.
    """
    if not db:
        logging.error("Database not initialized, skipping cleanup.")
        return 0

    now = datetime.now()
    logging.info(f"Running cleanup for jobs expired before: {now}")

    try:
        jobs_ref = db.collection("jobs")
        # Query for jobs where expireAt < now
        query = jobs_ref.where(field_path="expireAt", op_string="<", value=now)
        
        # Use stream() to get all matching documents
        # Note: For large datasets, we should delete in batches to avoid OOM or timeouts
        docs = query.stream()
        
        batch = db.batch()
        count = 0
        deleted_count = 0
        BATCH_SIZE = 400  # Firestore batch limit is 500
        
        for doc in docs:
            batch.delete(doc.reference)
            count += 1
            
            if count >= BATCH_SIZE:
                batch.commit()
                deleted_count += count
                logging.info(f"committed batch of {count} deletions...")
                batch = db.batch() # Start new batch
                count = 0
                
        # Commit remaining
        if count > 0:
            batch.commit()
            deleted_count += count
            
        logging.info(f"Cleanup complete. Total expired jobs deleted: {deleted_count}")
        return deleted_count

    except Exception as e:
        logging.error(f"Error during job cleanup: {e}")
        return 0

if __name__ == "__main__":
    delete_expired_jobs()
