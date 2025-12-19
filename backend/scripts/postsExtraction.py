
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


import pyotp
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

# Add backend root to sys.path to allow imports from core
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(current_dir)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)


# --- CONFIGURATION ---
# Replace with the Group ID (found in the URL of the group)
# Example: https://www.facebook.com/groups/123456789 -> ID is 123456789

GROUP_ID = os.getenv("FB_GROUP_ID", "1942419502675158")

GROUP_ID = os.getenv("FB_GROUP_ID", "1942419502675158")

OUTPUT_FILE = os.path.join(backend_root, "Data", "jobs.json")
SEEN_POSTS_FILE = os.path.join(backend_root, "Data", "last_post_seen.py")
# Cookies file path removed


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

try:
    from core.reporting import send_alert_email
except ImportError:
    print("[!] Warning: Could not import core.reporting. Email alerts will fail.")
    send_alert_email = None

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
    """Sets up the Chrome Browser with authorized headers and options."""
    chrome_options = Options()
    
    # Check for HEADLESS environment variable or Linux OS
    is_headless = os.getenv("HEADLESS", "false").lower() == "true"
    is_headless = False
    if is_headless:
        print("[*] Running in Headless Mode")
        chrome_options.add_argument("--headless=new")
    
    chrome_options.add_argument("--disable-notifications")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    # Anti-Detection
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option("useAutomationExtension", False)
    
    # Realistic User Agent
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

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
    
    # Additional anti-detection property removal
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    return driver

def handle_popups(driver):
    """Closes common Facebook popups like 'Allow Notifications' or 'Save Info'."""
    try:
        # Basic approach: Press Escape to close active modals
        webdriver.ActionChains(driver).send_keys(Keys.ESCAPE).perform()
        time.sleep(1)
        
        # Look for 'Allow' or 'Block' notification buttons by text (Arabic/English)
        # Using a very generic catch-all click for specific known selectors if needed
        # But usually ESC works for modals.
        pass
    except Exception:
        pass

def login_securely(driver):
    """Logs in using Email/Password + 2FA (TOTP) from environment variables."""
    email = os.getenv("FB_EMAIL")
    password = os.getenv("FB_PASSWORD")
    totp_secret = os.getenv("FB_2FA_SECRET")
    
    if not email or not password:
        print("[!] FB_EMAIL or FB_PASSWORD not set. Cannot login.")
        sys.exit(1)
        
    print("[*] Navigating to Facebook Login...")
    driver.get("https://www.facebook.com/")
    time.sleep(random.uniform(2, 4))
    
    handle_popups(driver)
    
    try:
        # 1. Fill Email
        email_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "email"))
        )
        email_field.clear()
        email_field.send_keys(email)
        time.sleep(random.uniform(1, 2))
        
        # 2. Fill Password
        pass_field = driver.find_element(By.NAME, "pass")
        pass_field.send_keys(password)
        time.sleep(random.uniform(0.5, 1.5))
        
        # 3. Click Login
        try:
            login_btn = driver.find_element(By.NAME, "login")
        except:
            login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            
        login_btn.click()
        print("[*] Credentials submitted. Waiting for next step...")
        time.sleep(random.uniform(4, 6))
        
        # 4. Check for 2FA / Checkpoint
        current_url = driver.current_url.lower()
        if "checkpoint" in current_url or "two_step_verification" in current_url:
            print("[*] 2FA Checkpoint detected.")
            
            if not totp_secret:
                print("[!] 2FA required but FB_2FA_SECRET not set.")
                sys.exit(1)
                
            # Generate code
            totp = pyotp.TOTP(totp_secret.replace(" ", ""))
            code = totp.now()
            print(f"[*] Generated 2FA Code: {code}")
            
            # Find input field for code. Usually it has specific IDs/names
            # Common structure: input[type="number"] or input[type="text"] inside the form
            try:
                code_field = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "input"))
                )
                
                # Sometimes there's more than one input. We need the one for the code.
                # Facebook often uses inputs like 'approvals_code', 'codes', etc.
                inputs = driver.find_elements(By.TAG_NAME, "input")
                target_input = None
                for inp in inputs:
                     if inp.get_attribute("type") in ["text", "number", "tel"]:
                         target_input = inp
                         break
                
                if target_input:
                    target_input.send_keys(code)
                    time.sleep(1)
                    
                    # Submit 2FA
                    # Keep hitting Enter or find the continue button
                    target_input.send_keys(Keys.ENTER)
                    
                    # Alternatively look for 'Continue' button
                    # driver.find_element(By.ID, "checkpointSubmitButton").click()
                    
                    print("[*] 2FA Code submitted.")
                    time.sleep(random.uniform(5, 8))
                else:
                    print("[!] Could not find 2FA input field.")
                    
            except Exception as e:
                print(f"[!] Error entering 2FA code: {e}")
                
        # 5. Verify Login Success
        handle_popups(driver)
        if "login" not in driver.current_url.lower():
            print("[+] Login successful!")
        else:
            print("[!] Login might have failed. Current URL:", driver.current_url)
            
    except Exception as e:
        print(f"[!] Error during login process: {e}")
        # Capture screenshot if needed in future
        sys.exit(1)

def scrape_group(driver, group_id):
    """Navigates to group and extracts posts."""
    url = f"https://mbasic.facebook.com/groups/{group_id}"
    print(f"[DEBUG] Navigating to: {url}")
    driver.get(url)
    time.sleep(random.uniform(3, 5))  # Random sleep to act human

    # [Check] Validate if we are logged in
    if "login" in driver.current_url.lower():
        print(f"[!] Critical: Redirected to login page ({driver.current_url}). Login must have failed.")
        
        if send_alert_email:
            send_alert_email(
                subject="RizqaAI Alert: Login Failed",
                body=f"The scraper was redirected to the login page for group {GROUP_ID}. \n\nCheck credentials and 2FA secrets."
            )
            
        sys.exit(1)

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

    stop_reason = None

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
                stop_reason = "last_seen"
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
                    stop_reason = "one_day"
                    break

        if stop_scraping:
            print("[*] Stopping scraping.")
            break

        scroll_count += 1
        if scroll_count > max_scrolls:
            print("[!] Reached maximum scroll limit.")
            stop_reason = "max_scrolls"
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
            
    return posts_data, stop_reason


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
        login_securely(driver)
        
        print(f"[*] Starting scrape for group {GROUP_ID}...")
        new_jobs, stop_reason = scrape_group(driver, GROUP_ID)
        
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
            if stop_reason in ["last_seen", "one_day"]:
                 print(f"[INFO] No new posts found (Stop Reason: {stop_reason}). Up to date.")
                 # Exit with 0 to indicate success to the pipeline
                 sys.exit(0)
            else:
                print("[*] No posts collected.")
                sys.exit(1)

    except Exception as e:
        print(f"[!] Critical Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("[~] Closing driver...")
        if 'driver' in locals():
            try:
                driver.quit()
            except Exception as e:
                print(f"[!] Warning: Error closing driver: {e}")
            except KeyboardInterrupt:
                print("[!] Warning: Driver close interrupted.")