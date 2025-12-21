import os
import json
import sys
import time
from apify_client import ApifyClient

# Add backend root to sys.path to allow imports from core
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(current_dir)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

# --- CONFIGURATION ---
GROUP_ID = os.getenv("FB_GROUP_ID", "1942419502675158")
# Construct the full URL for the group
GROUP_URL = f"https://www.facebook.com/groups/{GROUP_ID}/"

OUTPUT_FILE = os.path.join(backend_root, "Data", "jobs.json")

# Import Firestore DB
try:
    from core.firebase import db
    from firebase_admin import firestore
except ImportError:
    print("[!] Warning: Could not import core.firebase. Firestore features will fail.")
    db = None

try:
    from core.reporting import send_alert_email
except ImportError:
    print("[!] Warning: Could not import core.reporting. Email alerts will fail.")
    send_alert_email = None

def get_group_api_token(group_id: str):
    """
    Fetches the 'APIFI_API_TOKEN' (or 'APIFY_API_TOKEN') from the group's Firestore document.
    """
    if not db:
        print("[!] DB not initialized, cannot fetch API token.")
        return None
    
    try:
        doc_ref = db.collection("platformGroups").document(str(group_id))
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            # User mentioned 'APIFI_API_TOKEN', checking that first, then correct spelling, then env fallback
            token = data.get("APIFY_API_TOKEN") or data.get("APIFI_API_TOKEN")
            if token:
                return token
        return None
    except Exception as e:
        print(f"[!] Error fetching API token from DB: {e}")
        return None

def scrape_group_posts(group_url: str, api_token: str):
    """
    Uses Apify to scrape posts from the Facebook Group URL.
    """
    if not api_token:
        raise ValueError("No Apify API Token provided.")

    print(f"[*] Initializing ApifyClient with token...")
    client = ApifyClient(api_token)

    # Prepare the Actor input
    # apify/facebook-groups-scraper options
    run_input = {
        "startUrls": [{"url": group_url}],
        "maxItems": 10,
        "resultsLimit": 10,
        "viewPort": {"width": 1920, "height": 1080},
    }

    print(f"[*] Calling Apify Actor (apify/facebook-groups-scraper) for URL: {group_url}")
    
    try:
        # Run the actor and wait for it to finish
        run = client.actor("apify/facebook-groups-scraper").call(run_input=run_input)
    except Exception as e:
        print(f"[!] Apify Actor Call Failed: {e}")
        if send_alert_email:
             send_alert_email(
                subject="RizqaAI Alert: Apify Scraping Failed",
                body=f"Apify scraping failed for group {group_url}.\nError: {e}"
            )
        return []

    print(f"[*] Actor finished. Fetching results from dataset {run['defaultDatasetId']}...")
    
    # Fetch results
    clean_posts = []
    
    try:
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            # Map raw item to clean dictionary
            # Fields vary by actor, but commonly: text, url, timestamp, likes, imageUrl
            
            # Robust extraction with fallbacks
            post_text = item.get("text") or item.get("postText") or item.get("content", "")
            post_url = item.get("url") or item.get("postUrl") or item.get("link", "")
            timestamp = item.get("time") or item.get("timestamp") or item.get("date", "")
            likes_count = item.get("likes") or item.get("likesCount") or 0
            
            # Image URL: check 'imageUrl', 'images' list, or 'attachments'
            image_url = item.get("imageUrl")
            if not image_url and item.get("images") and isinstance(item.get("images"), list):
                 if len(item["images"]) > 0:
                     image_url = item["images"][0]
            
            if not post_text and not image_url:
                # If there's absolutely no content, skip
                continue

            entry = {
                "post_text": post_text,
                "post_url": post_url,
                "image_url": image_url,
                "timestamp": timestamp,
                "likes_count": likes_count,
                # Add extra fields to match previous logic expected by 'save_data' or pipeline
                "source_id": GROUP_ID,
                "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
            }
            clean_posts.append(entry)
            
    except Exception as e:
        print(f"[!] Error processing dataset items: {e}")

    return clean_posts[:10]

def save_data(posts):
    """Saves the scraped posts to the JSON file."""
    if not posts:
        print("[*] No new posts to save.")
        return

    # Load existing data
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        except (json.JSONDecodeError, ValueError):
            existing_data = []
    else:
        existing_data = []

    # Simple append. 
    existing_data.extend(posts)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(existing_data, f, indent=4, ensure_ascii=False)
    
    print(f"[+] Saved {len(posts)} new posts to {OUTPUT_FILE}")

def main():
    try:
        # 1. Get API Token from Firestore or Env
        db_token = get_group_api_token(GROUP_ID)
        # Fallback to Env if not in DB
        api_token = db_token or os.getenv("APIFY_API_TOKEN") 
        
        if not api_token:
            print("[!] No API Token found in Firestore (platformGroups) or Environment (APIFY_API_TOKEN).")
            sys.exit(1)
            
        # 2. Scrape
        posts = scrape_group_posts(GROUP_URL, api_token)
        
        if not posts:
            print("[*] No posts found by Apify.")
            return

        # 3. Save
        save_data(posts)

    except ValueError as ve:
        print(f"[!] Configuration Error: {ve}")
        sys.exit(1)
    except Exception as e:
        print(f"[!] Unexpected Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()