import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CRED_PATH = os.path.join(BASE_DIR, "serviceAccountKey.json")

if not firebase_admin._apps:
    try:
        # 1. Try to load from file (Local Development)
        if os.path.exists(CRED_PATH):
            cred = credentials.Certificate(CRED_PATH)
            firebase_admin.initialize_app(cred)
            print("[OK] Firebase initialized from local key file.")
            
        # 2. Try to load from Environment Variable (Production / Railway)
        elif os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON"):
            print("[*] Loading Firebase credentials from environment variable...")
            cred_json = json.loads(os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON"))
            cred = credentials.Certificate(cred_json)
            firebase_admin.initialize_app(cred)
            print("[OK] Firebase initialized from environment variable.")

        else:
            print(f"[X] Error: 'serviceAccountKey.json' not found and 'FIREBASE_SERVICE_ACCOUNT_JSON' env var not set.")
            print(f"   -> Path checked: {CRED_PATH}")

    except Exception as e:
        print(f"[X] Failed to initialize Firebase: {e}")

try:
    if firebase_admin._apps:
        db = firestore.client()
    else:
        print("[X] Firebase app not initialized. Firestore client cannot be created.")
        db = None
except Exception as e:
    print(f"[X] Failed to create Firestore client: {e}")
    db = None
