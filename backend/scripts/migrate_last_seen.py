import os
import sys
import re
import ast
import firebase_admin
from firebase_admin import firestore
from datetime import datetime

# Add backend directory to path to import core.firebase if needed, 
# but for a standalone migration script, it is safer to init firebase explicitly 
# or reuse the core module if available. Let's try to reuse core.

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

try:
    from core.firebase import db
except ImportError:
    print("[!] Could not import core.firebase. Please ensure you are running from backend/scripts context.")
    sys.exit(1)

LAST_SEEN_FILE = os.path.join(parent_dir, "Data", "last_post_seen.py")

def migrate():
    if not os.path.exists(LAST_SEEN_FILE):
        print(f"[!] {LAST_SEEN_FILE} not found. Nothing to migrate.")
        return

    print(f"[*] Reading {LAST_SEEN_FILE}...")
    with open(LAST_SEEN_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # robustly extract the dictionary
    # The file format is likely: dict_of_lastSeenPost_for_each_group = { ... }
    match = re.search(r"=\s*(\{.*)", content, re.DOTALL)
    if not match:
        print("[!] Could not find dictionary in file.")
        return

    dict_str = match.group(1).strip()
    try:
        # ast.literal_eval is safer than eval
        data = ast.literal_eval(dict_str)
    except Exception as e:
        print(f"[!] Failed to parse dictionary: {e}")
        return

    if not data:
        print("[*] Dictionary is empty.")
        return

    print(f"[*] Found {len(data)} groups to migrate.")
    
    collection_ref = db.collection("platformGroups")
    
    count = 0
    for group_id, post_id in data.items():
        doc_ref = collection_ref.document(str(group_id))
        
        # Check if exists to avoid overwriting newer data if any (though unlikely for migration)
        # For migration, we usually assume local file is source of truth if DB is empty.
        
        doc_data = {
            "groupID": str(group_id),
            "lastPostId": str(post_id),
            "name": f"Group {group_id}", # Placeholder name
            "platformType": "Facebook Group",
            "updatedAt": firestore.SERVER_TIMESTAMP
        }
        
        try:
            doc_ref.set(doc_data, merge=True)
            print(f"   -> Migrated Group {group_id} : {post_id}")
            count += 1
        except Exception as e:
            print(f"   [!] Failed to migrate {group_id}: {e}")

    print(f"[SUCCESS] Migrated {count} entries to 'platformGroups'.")

if __name__ == "__main__":
    migrate()
