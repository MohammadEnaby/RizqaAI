import os
import json
import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import Optional
import time
from datetime import datetime
import sys

# Add the parent directory (backend) to sys.path so we can import core.secrets
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

try:
    from core.secrets import API_KEY_Gimini
except ImportError as e:
    print(f"[ERROR] Failed to import secrets: {e}")
    raise SystemExit(1)

API_KEY = API_KEY_Gimini

genai.configure(api_key=API_KEY)

# UPDATED: We use the model available in your specific environment list.
# 'gemini-2.5-flash-preview-09-2025' is the current supported model for this environment.
MODEL_NAME = 'gemini-2.5-flash-preview-09-2025'

model = genai.GenerativeModel(
    MODEL_NAME,
    generation_config={"response_mime_type": "application/json"}
)

# 2. Define the Schema (For documentation and structure reference)
class JobOffer(BaseModel):
    job_title: str
    location: str
    wage_per_hour: Optional[str]
    shifts: Optional[str]
    requirements: Optional[str]
    features: Optional[str]
    contact_info: Optional[str]
    is_job_offer: bool
    post_link: Optional[str]

def extract_job_data(raw_text: str) -> dict:
    """
    Takes unstructured text and uses Google Gemini to extract structured JSON data.
    """
    
    # 3. Prompt Engineering
    prompt = f"""
    You are an expert data extraction AI for the Israeli/Palestinian job market.
    Extract structured job data from the following Arabic/Hebrew text.
    
    The Output MUST be a valid JSON object with these exact keys:
    - job_title (string): e.g., 'Cashier'
    - location (string): e.g., 'Jerusalem'
    - wage_per_hour (string/null): e.g., '36-40'
    - shifts (string/null): e.g., 'Morning', 'Evening'
    - requirements (string/null): e.g., 'Experience', 'Education', 'Skills'
    - features (string/null): e.g., 'Transportation available', 'Food available'
    - contact_info (string/null): Phone numbers and names
    - post_time (string): ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
    - is_job_offer (bool): true if it's a job, false if spam/question

    Current Date and Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

    Important:
    - Handle Hebrew/Arabic slang (e.g., 'مشميروت' = shifts).
    - post_time MUST be in ISO 8601 format (YYYY-MM-DDTHH:MM:SS). Convert relative times (e.g., '2 hours ago') to absolute timestamp based on the Current Date and Time provided above.
    - If info is missing, use null.
    
    Text to analyze:
    {raw_text}
    """

    try:
        # 4. Call Gemini
        response = model.generate_content(prompt)
        
        # 5. Parse Result
        # Clean up potential markdown formatting if present (just in case)
        text_response = response.text.replace('```json', '').replace('```', '').strip()
        json_data = json.loads(text_response)
        return json_data

    except Exception as e:
        print(f"[ERROR] Gemini Extraction Error: {e}")
        # If model is not found, list available models to help debug
        if "404" in str(e) or "not found" in str(e).lower():
            print("\n[!] Debug: Listing available models for your API Key...")
            try:
                for m in genai.list_models():
                    if 'generateContent' in m.supported_generation_methods:
                        print(f"- {m.name}")
            except Exception as list_err:
                print(f"Could not list models: {list_err}")
                
        return None

def main():
    jobs_path = os.path.join(parent_dir, "Data", "jobs.json")
    print(f"[DEBUG] jobs_path = {jobs_path}")

    if not os.path.exists(jobs_path):
        print(f"[!] '{jobs_path}' not found. Nothing to structure.")
        return

    if os.path.getsize(jobs_path) == 0:
        print(f"[!] '{jobs_path}' is empty. Waiting for scraper to populate it.")
        return

    # if the result is not a job offer do not save it into the file.
    # Read scraped posts from jobs.json
    # Use UTF-8 so Hebrew/Arabic characters load correctly on Windows
    with open(jobs_path, 'r', encoding='utf-8') as file:
        jobs = json.load(file)
    
    print(f"[DEBUG] Loaded {len(jobs)} jobs from {jobs_path}")

    structured_results = []
    processed_indices = []

    for i, job in enumerate(jobs):
        # Rate limiting: 15 RPM = 1 request every 4 seconds. Using 5s to be safe.
        if i > 0:
            print("Waiting 5 seconds to respect API rate limit...")
            time.sleep(5)
            
        raw_text = job.get('raw_text', '')
        post_time = job.get('post_time', '')
        post_link = job.get('post_link', '')
        print(f"[DEBUG] Processing job {i+1}/{len(jobs)}")
        # print(raw_text)

        result = extract_job_data(raw_text + post_time)

        if result:
            # Inject post_link
            result['post_link'] = post_link

            # Convert post_time to timestamp
            # result["post_time"] = datetime.strptime(result["post_time"], "%Y-%m-%dT%H:%M:%S%z").timestamp()


            # Fallback for contact_info
            if not result.get('contact_info'):
                result['contact_info'] = post_link


            # Only keep entries that are actual job offers
            if result.get("is_job_offer", False):
                structured_results.append(result)
            else:
                print("[*] Skipped: model marked this as not a job offer.")
            
            # Mark as processed regardless of whether it's a job offer or not,
            # because we successfully analyzed it.
            processed_indices.append(i)
        else:
            print("Failed to get result. Will retry next time.")

    # Write all structured job offers as a proper JSON array to structuered_jobs.json
    output_path = os.path.join(parent_dir, "Data", "structuered_jobs.json")
    with open(output_path, 'w', encoding='utf-8') as fw:
        json.dump(structured_results, fw, ensure_ascii=False, indent=4)

    # Update jobs.json to remove processed items
    remaining_jobs = [job for i, job in enumerate(jobs) if i not in processed_indices]
    
    with open(jobs_path, 'w', encoding='utf-8') as f:
        json.dump(remaining_jobs, f, ensure_ascii=False, indent=4)
    
    print(f"[DEBUG] Removed {len(processed_indices)} processed jobs from {jobs_path}. {len(remaining_jobs)} remaining.")

if __name__ == "__main__":
    main()