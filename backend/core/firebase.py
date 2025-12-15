import os
import firebase_admin
from firebase_admin import credentials, firestore

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CRED_PATH = os.path.join(BASE_DIR, "serviceAccountKey.json")

db = None

try:
    if not firebase_admin._apps:
        if os.path.exists(CRED_PATH):
            cred = credentials.Certificate(CRED_PATH)
            firebase_admin.initialize_app(cred)
            print("[OK] Firebase initialized successfully.")
        else:
            print(f"[X] Error: 'serviceAccountKey.json' not found at {CRED_PATH}")

    # Initialize Firestore client
    db = firestore.client()
except Exception as e:
    print(f"[X] Failed to initialize Firebase DB: {e}")
    db = None