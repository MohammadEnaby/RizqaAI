
NOISE_PHRASES_LIST = [
    "see translation", "see more", "view insights", "write a comment",
    "like", "comment", "share", "sponsored", "reply",
    "عرض الترجمة", "أعجبني", "تعليق", "مشاركة", 
    "أرسل تعليقك الأول...", "تمت المشاركة مع مجموعة عامة", 
    "תגובה", "שתף", "אהבתי", "דקות", "تمت ال  مع مجموعة عامة", "أرسل  ك الأول...", "كل التفاعلات"
]

import os
import json
import time
import random
import re
import shutil
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.common.exceptions import ElementClickInterceptedException, StaleElementReferenceException
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import sys

# Add backend root to sys.path to allow imports from core
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(current_dir)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)


try:
    from core.secrets import facebook_cookies
    print("[*] Loaded facebook_cookies from core.secrets")
except ImportError:
    facebook_cookies = None
    print("[!] Warning: Could not import core.secrets and no 'facebook_cookies' env var found.")


# --- CONFIGURATION ---
# Replace with the Group ID (found in the URL of the group)
# Example: https://www.facebook.com/groups/123456789 -> ID is 123456789

GROUP_ID = os.getenv("FB_GROUP_ID", "1942419502675158")

COOKIES_FILE = facebook_cookies
OUTPUT_FILE = os.path.join(backend_root, "Data", "jobs.json")
SEEN_POSTS_FILE = os.path.join(backend_root, "Data", "last_post_seen.py")
LOCAL_COOKIES_PATH = os.path.join(backend_root, "Data", "cookies.json")


def normalize_post_text(text: str) -> str:
    """Normalize whitespace so comparisons are consistent."""
    if not text:
        return ""
    return " ".join(text.split())


# Import Firestore DB
try:
    from core.firebase import db
    from firebase_admin import firestore
except ImportError:
    print("[!] Warning: Could not import core.firebase. Firestore features will fail.")
    db = None

def load_seen_posts(group_id: str):
    """Load the last seen post ID for the given group from Firestore (platformGroups collection)."""
    if not db:
        print("[!] DB not initialized, cannot load seen posts.")
        return None
        
    try:
        doc_ref = db.collection("platformGroups").document(str(group_id))
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict().get("lastPostId")
        return None
    except Exception as e:
        print(f"[!] Error loading seen posts from DB: {e}")
        return None


def save_last_seen_post(group_id: str, post_id: str):
    """Persist the newest post ID for the group to Firestore (platformGroups collection)."""
    if not post_id:
        return
    if not db:
        print("[!] DB not initialized, cannot save seen posts.")
        return
    
    try:
        doc_ref = db.collection("platformGroups").document(str(group_id))
        doc_ref.set({
            "lastPostId": str(post_id),
            "updatedAt": firestore.SERVER_TIMESTAMP
        }, merge=True)
        print(f"[+] Updated last seen post for {group_id} in DB.")
    except Exception as e:
        print(f"[!] Error saving seen post to DB: {e}")


def is_one_day_marker(post_time: str) -> bool:
    """Returns True if the time label indicates ~1 day old (e.g., '1d', '1 D', '١ د')."""
    if not post_time:
        return False

    lowered = post_time.strip().lower()
    lowered_no_space = lowered.replace(" ", "")
    lowered_no_space = lowered_no_space.replace("١", "1")  # normalize Arabic numeral

    direct_markers = {
        "1d",
        "1day",
        "1יום",
        "1يوم",
    }

    if lowered_no_space in direct_markers:
        return True

    arabic_variants = {"١د", "١يوم"}
    if lowered_no_space in arabic_variants:
        return True

    patterns = [
        r"^1\s*d$",
        r"^1\s*day$",
        r"^1\s*יום$",
        r"^1\s*يوم$",
    ]

    for pattern in patterns:
        if re.match(pattern, lowered):
            return True

    return False


def extract_post_id(post_href: str) -> str:
    """Extract the numeric post ID from common Facebook href formats."""
    if not post_href:
        return ""

    # Direct /posts/{id}/ structure
    match = re.search(r"/posts/(\d+)", post_href)
    if match:
        return match.group(1)

    # story.php?story_fbid=...&id=...
    match = re.search(r"story_fbid=(\d+)", post_href)
    if match:
        return match.group(1)

    # Permalink style ?id=...&story_fbid=...
    match = re.search(r"id=(\d+)", post_href)
    if match:
        return match.group(1)

    return ""

def setup_driver():
    """Sets up the Chrome Browser to look like a real user."""
    chrome_options = Options()
    
    # Check for HEADLESS environment variable (common in CI/CD and Cloud)
    if os.getenv("HEADLESS", "false").lower() == "true":
        print("[*] Running in Headless Mode")
        chrome_options.add_argument("--headless")
    
    chrome_options.add_argument("--disable-notifications")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    # Use a standard User Agent so FB thinks we are a normal laptop
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36")

    # Debug: Print PATH to see where things might be
    print(f"[DEBUG] PATH: {os.environ.get('PATH')}")

    # Check for system-installed Chromium (Dynamic lookup with shutil.which)
    chromium_path = shutil.which("chromium") or shutil.which("chromium-browser") or shutil.which("google-chrome")

    if chromium_path:
        print(f"[*] Found system Chromium binary at: {chromium_path}")
        chrome_options.binary_location = chromium_path

    # Check for system-installed ChromeDriver
    chromedriver_path = shutil.which("chromedriver")

    if chromedriver_path and chromium_path:
        print(f"[*] Found system ChromeDriver at: {chromedriver_path}")
        service = Service(chromedriver_path)
    else:
        # Fallback to webdriver_manager if system binaries are not found
        print(f"[*] System binaries not found (Chromium={chromium_path}, Driver={chromedriver_path}). Attempting to use webdriver_manager...")
        try:
            service = Service(ChromeDriverManager().install())
        except Exception as e:
            print(f"[!] webdriver_manager failed: {e}")
            raise

    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def save_cookies(driver, path):
    """Saves current cookies to a file."""
    try:
        cookies = driver.get_cookies()
        with open(path, 'w') as file:
            json.dump(cookies, file, indent=4)
        print(f"[+] Cookies saved to {path}")
    except Exception as e:
        print(f"[!] Error saving cookies: {e}")

def load_cookies(driver, cookies_data_env):
    """Injects cookies. Prioritizes local file, falls back to env var."""
    cookies = None
    used_local = False
    
    # 1. Try local file first
    if os.path.exists(LOCAL_COOKIES_PATH):
        print(f"[*] Found local cookies at {LOCAL_COOKIES_PATH}. Using them.")
        try:
            with open(LOCAL_COOKIES_PATH, 'r') as file:
                cookies = json.load(file)
            used_local = True
        except Exception as e:
            print(f"[!] Error reading local cookies: {e}")
    
    # 2. Fallback to Env / Argument
    if not cookies and cookies_data_env:
        print("[*] Using cookies from environment/argument.")
        try:
            # If cookies_data_env is a list, use it directly.
            if isinstance(cookies_data_env, list):
                cookies = cookies_data_env
            # If it's a string, checks if it is a JSON string or a file path.
            elif isinstance(cookies_data_env, str):
                if cookies_data_env.strip().startswith("["):
                    cookies = json.loads(cookies_data_env)
                else:
                    if os.path.exists(cookies_data_env):
                        with open(cookies_data_env, 'r') as file:
                            cookies = json.load(file)
                    else:
                        print("[!] Env cookie file not found.")
        except Exception as e:
             print(f"[!] Error parsing env cookies: {e}")

    if not cookies:
        print("[!] No cookies available (Local or Env). Skipping login.")
        return

    try:
        # We must be on the domain before adding cookies
        driver.get("https://mbasic.facebook.com")

        for cookie in cookies:
            if "sameSite" in cookie:
                if cookie["sameSite"] not in ["Strict", "Lax", "None"]:
                    cookie["sameSite"] = "Lax"
            
            if "expirationDate" in cookie and "expiry" not in cookie:
                cookie["expiry"] = int(cookie["expirationDate"])
                del cookie["expirationDate"]

            try:
                driver.add_cookie(cookie)
            except Exception as e:
                pass
                # print(f"[!] Warning: Failed to add cookie {cookie.get('name')}: {e}")

        print("[+] Cookies injected successfully.")
        driver.refresh() # Refresh to apply login
        
        # Save fresh cookies immediately after successful injection + refresh
        save_cookies(driver, LOCAL_COOKIES_PATH)
        
    except Exception as e:
        print(f"[!] Error loading cookies: {e}")
        # If we failed with local cookies, and we have env cookies, maybe we should try those?
        # For simplicity, we just exit or return here.
        exit()

def scrape_group(driver, group_id):
    """Navigates to group and extracts posts."""
    url = f"https://mbasic.facebook.com/groups/{group_id}"
    print(f"[DEBUG] Navigating to: {url}")
    driver.get(url)
    time.sleep(random.uniform(3, 5))  # Random sleep to act human

    # [Check] Validate if we are logged in
    if "login" in driver.current_url.lower():
        print(f"[!] Critical: Redirected to login page ({driver.current_url}).")
        print("[!] Your cookies are likely expired or invalid. Please populate 'facebook_cookies' with fresh cookies.")
        return []

    posts_data = []
    seen_post_keys = set()
    # Read max_scrolls from env, default to 100 if not set or invalid
    try:
        max_scrolls = int(os.getenv("MAX_SCROLLS", "100"))
    except ValueError:
        max_scrolls = 100
    
    print(f"[*] Max scrolls set to: {max_scrolls}")
    scroll_count = 0
    last_seen_post_id = load_seen_posts(group_id)
    stop_scraping = False
    newest_post_id_this_run = None

    if last_seen_post_id:
        print(f"[*] Last processed post ID: {last_seen_post_id}")
    else:
        print("[*] No last post ID found; full scan until 1-day marker.")

    while scroll_count <= max_scrolls and not stop_scraping:
        # Try to expand "show more" / "عرض المزيد" buttons before extracting
        try:
            show_more_buttons = driver.find_elements(
                By.XPATH,
                "//div[@role='button' and (contains(., 'عرض المزيد') or contains(., 'See more') or contains(., 'see more'))]"
            )
            for btn in show_more_buttons:
                try:
                    driver.execute_script("arguments[0].click();", btn)
                    time.sleep(random.uniform(0.5, 1.0))
                except (ElementClickInterceptedException, StaleElementReferenceException):
                    continue
        except Exception as e:
            print(f"[!] Could not click 'show more' buttons: {e}")

        # Parse the page content
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # --- EXTRACTION LOGIC (The 'mbasic' structure) ---
        # In mbasic, posts are usually inside <article> or specific <div> tags
        potential_posts = soup.find_all('div', role='article')

        if not potential_posts:
            # Fallback for mbasic structure if 'article' role isn't found
            potential_posts = soup.select('div[data-ft]')
        
        
        for post in potential_posts:
            # Prefer the main text span (like the one you showed: <span dir="auto"> ... )
            main_text_container = post.select_one('span[dir="auto"]') or post

            # Join all text nodes with spaces so every line/part of the post is kept
            text_content = main_text_container.get_text(separator=" ", strip=True)

            # Clean control characters but keep spaces for readability
            for ch in ["\n", "\t", "\r", "\f", "\v", "\b", "\a", "\0"]:
                text_content = text_content.replace(ch, " ")

            for noise_phrase in NOISE_PHRASES_LIST:
                text_content = text_content.replace(noise_phrase, " ")

            # Try to extract the post time (e.g. '٥٩ د', '1 h', etc.)
            post_time = None
            post_href = ""
            try:
                time_link = post.find("a", href=lambda h: h and "/posts/" in h)
                if time_link:
                    post_time = time_link.get_text(strip=True)
                    post_href = time_link.get("href") or ""
            except Exception:
                post_time = None

            if post_time is not None: 
                text_content = text_content.replace(post_time, " ")

            normalized_text = normalize_post_text(text_content)
            post_id = extract_post_id(post_href)

            if not newest_post_id_this_run and post_id:
                newest_post_id_this_run = post_id

            # Build a strong de-duplication key:
            # combine the (possibly empty) href with the full cleaned text.
            post_key = f"{post_href}|{normalized_text}"

            if post_key in seen_post_keys:
                continue

            # Stop if we reached the last processed post ID
            if last_seen_post_id and post_id and post_id == last_seen_post_id:
                print(f"[*] Reached last processed post ID {last_seen_post_id}. Stopping.")
                stop_scraping = True
                break

            # Simple filter: Ignore short posts or system messages
            if len(normalized_text) > 30:
                seen_post_keys.add(post_key)
                
                # Normalize post_link
                full_post_link = post_href
                if post_href and not post_href.startswith("http"):
                    full_post_link = f"https://www.facebook.com{post_href}"

                job_entry = {
                    "source_id": group_id,
                    "raw_text": normalized_text,
                    "post_time": post_time,
                    "post_link": full_post_link,
                    "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
                }
                posts_data.append(job_entry)

                # Stop once we reach posts that are ~1 day old
                if is_one_day_marker(post_time):
                    print(f"[*] Reached a post with time marker '{post_time}'. Stopping.")
                    stop_scraping = True
                    break

        if stop_scraping:
            break

        scroll_count += 1
        if scroll_count > max_scrolls:
            print("[!] Reached maximum scroll limit.")
            break

        print(f"[*] Smooth scrolling down... (scroll {scroll_count}/{max_scrolls})")

        # Perform several small scroll steps instead of one big jump,
        # to avoid skipping posts that load progressively.
        small_steps = 3
        for _ in range(small_steps):
            driver.execute_script(
                "window.scrollBy(0, Math.max(window.innerHeight * 0.5, 300));"
            )
            time.sleep(random.uniform(0.8, 1.4))
            
    return posts_data


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

    # Append new data
    existing_data.extend(posts)

    # Write back to file
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(existing_data, f, indent=4, ensure_ascii=False)
    
    print(f"[+] Saved {len(posts)} new posts to {OUTPUT_FILE}")


if __name__ == "__main__":
    driver = setup_driver()
    try:
        load_cookies(driver, COOKIES_FILE)
        
        print(f"[*] Starting scrape for group {GROUP_ID}...")
        new_jobs = scrape_group(driver, GROUP_ID)
        
        if new_jobs:
            save_data(new_jobs)
            
            # Find the newest post ID to update the marker
            newest_id = None
            for job in new_jobs:
                pid = extract_post_id(job.get('post_link', ''))
                if pid:
                    newest_id = pid
                    break
            
            if newest_id:
                print(f"[*] Updating last seen post ID to: {newest_id}")
                save_last_seen_post(GROUP_ID, newest_id)
            else:
                print("[!] Could not determine a new post ID to save.")
        else:
            print("[*] No posts collected.")

    except Exception as e:
        print(f"[!] Critical Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("[~] Closing driver...")
        if 'driver' in locals():
            try:
                # Save cookies one last time before quitting
                save_cookies(driver, LOCAL_COOKIES_PATH)
                driver.quit()
            except Exception as e:
                print(f"[!] Warning: Error closing driver: {e}")
            except KeyboardInterrupt:
                print("[!] Warning: Driver close interrupted.")