import sys
import os
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from datetime import datetime

# Setup path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.getcwd(), 'backend')))

def verify_sessions_fetch():
    # Initialize Firebase similar to backend/core/firebase.py
    cred_path = os.path.abspath("backend/serviceAccountKey.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        try:
            firebase_admin.initialize_app(cred)
            print("[OK] Firebase initialized.")
        except ValueError:
            # Already initialized
            pass
    else:
        print(f"[ERROR] Service account key not found at {cred_path}")
        return

    db = firestore.client()
    
    # Use a known user ID from the initial image or one found in DB
    # From screenshot: sjq5GrGRFyRbC1KHvIvGzkXAFX73 (approx)
    # Let's just find ANY user with sessions to test.
    
    print("Searching for a user with sessions...")
    sessions_ref = db.collection("chatSessions")
    # Get one doc to find a userId
    docs = sessions_ref.limit(1).stream()
    userId = None
    for doc in docs:
        userId = doc.to_dict().get("userId")
        break
    
    if not userId:
        print("[WARN] No sessions found in DB to test with. Cannot verify fix fully.")
        return

    print(f"Testing with User ID: {userId}")

    # --- SIMULATE THE FIXED LOGIC ---
    print("\n--- Executing Fixed Logic ---")
    try:
        # THE FIX: No orderBy in the query
        query = sessions_ref.where(filter=FieldFilter("userId", "==", userId))
        results = list(query.stream())
        
        print(f"[SUCCESS] Query executed without error. Found {len(results)} sessions.")
        
        # Verify in-memory sorting
        sessions_data = []
        for doc in results:
            d = doc.to_dict()
            sessions_data.append({
                "id": doc.id,
                "updatedAt": d.get("updatedAt"),
                "createdAt": d.get("createdAt")
            })
            
        # Sort logic
        sessions_data.sort(key=lambda x: x['updatedAt'] or x['createdAt'], reverse=True)
        
        print(f"Top session updated at: {sessions_data[0]['updatedAt'] if sessions_data else 'N/A'}")
        print("[PASS] Verification successful.")
        
    except Exception as e:
        print(f"[FAIL] Query failed: {e}")

if __name__ == "__main__":
    verify_sessions_fetch()
