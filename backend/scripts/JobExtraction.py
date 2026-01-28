import os
import json
import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import time
from datetime import datetime
import sys

# Add backend root to sys.path to allow imports from core
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(current_dir)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

try:
    from core.secrets import API_KEY_Gimini
    API_KEY = API_KEY_Gimini
except ImportError:
    # Verify if API_KEY is available via Environment Variable (Railway/Cloud)
    API_KEY = os.getenv("GEMINI_API_KEY")
    if not API_KEY:
        print("[ERROR] No Gemini API Key found in secrets.py OR environment variables.")
        raise SystemExit(1)
    print("[*] Using Gemini API Key from environment variables.")


genai.configure(api_key=API_KEY)

# UPDATED: We use the model available in your specific environment list.
MODEL_NAME = 'gemini-2.5-flash'

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
    target_audience: Optional[str]

def extract_post_id_from_url(post_url: str) -> str:
    """
    Attempts to extract a numeric ID from the post URL.
    """
    if not post_url:
        return ""
    import re
    # Try /posts/(\d+)
    match = re.search(r"/posts/(\d+)", post_url)
    if match:
        return match.group(1)
        
    # Try /permalink/(\d+)
    match = re.search(r"/permalink/(\d+)", post_url)
    if match:
        return match.group(1)
        
    return ""

def extract_jobs_batch(posts_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Takes a list of post objects (id, content, created_at) and uses Google Gemini 
    to extract structured JSON data for all of them in one request.
    """
    
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # 3. Prompt Engineering for Batch
    prompt = f"""
    You are an expert data extraction AI for the Israeli/Palestinian job market.
    I will provide a JSON list of posts. Each post has an 'id', 'content', and 'created_at'.
    
    Your task is to analyze each post and extract structured job data.
    
    The Output MUST be a JSON LIST of objects. Each object must strictly follow this schema:
    - id (integer): The same 'id' from the input post. THIS IS CRITICAL to map back to the original post.
    - job_title (string): e.g., 'Cashier'
    - location (string): e.g., 'Jerusalem'
    - wage_per_hour (string/null): e.g., '36-40'
    - shifts (string/null): e.g., 'Morning', 'Evening'
    - requirements (string/null): e.g., 'Experience', 'Education', 'Skills'
    - features (string/null): e.g., 'Transportation available', 'Food available'
    - contact_info (string/null): Phone numbers and names
    - post_time (string): ISO 8601 format (YYYY-MM-DDTHH:MM:SS). Use 'created_at' from input as reference.
    - is_job_offer (bool): true if it's a job, false if spam/question
    - target_audience (string/null): e.g., 'men', 'women', 'students', 'not specified'
    
    Current Date and Time: {current_time}

    Important:
    - Handle Hebrew/Arabic slang (e.g., 'مشميروت' = shifts).
    - post_time MUST be in ISO 8601 format.
    - If info is missing, use null.
    - RETURN AN ENTRY FOR EVERY ID IN THE INPUT, even if it is not a job offer.
    
    Input Data:
    {json.dumps(posts_data, ensure_ascii=False)}
    """

    try:
        # 4. Call Gemini
        print(f"[DEBUG] Sending request to Gemini with {len(posts_data)} posts...")
        response = model.generate_content(prompt)
        
        # 5. Parse Result
        # Clean up potential markdown formatting if present (just in case)
        text_response = response.text.replace('```json', '').replace('```', '').strip()
        json_data = json.loads(text_response)
        
        # Ensure we got a list
        if isinstance(json_data, list):
            return json_data
        elif isinstance(json_data, dict):
            # Try to find a list inside
            for k, v in json_data.items():
                if isinstance(v, list):
                    return v
            return [json_data]
            
        print(f"[!] Warning: Unexpected return structure: {type(json_data)}")
        return []

    except Exception as e:
        print(f"[ERROR] Gemini Batch Extraction Error: {e}")
        # If model is not found, list available models to help debug
        if "404" in str(e) or "not found" in str(e).lower():
            print("\n[!] Debug: Listing available models for your API Key...")
            try:
                for m in genai.list_models():
                    if 'generateContent' in m.supported_generation_methods:
                        print(f"- {m.name}")
            except Exception as list_err:
                print(f"Could not list models: {list_err}")
                
        return []

def main():
    jobs_path = os.path.join(backend_root, "Data", "jobs.json")
    print(f"[DEBUG] jobs_path = {jobs_path}")

    if not os.path.exists(jobs_path):
        print(f"[!] '{jobs_path}' not found. Nothing to structure.")
        return

    if os.path.getsize(jobs_path) == 0:
        print(f"[!] '{jobs_path}' is empty. Waiting for scraper to populate it.")
        return

    # Read scraped posts from jobs.json
    with open(jobs_path, 'r', encoding='utf-8') as file:
        jobs = json.load(file)
    
    print(f"[DEBUG] Loaded {len(jobs)} jobs from {jobs_path}")

    batch_input = []
    job_map = {} # Map our temp ID to the original job index/object

    for i, job in enumerate(jobs):
        # Prepare lightweight object for LLM
        # We use 'i' as the unique ID for this batch session
        batch_input.append({
            "id": i,
            "content": job.get('post_text', ''),
            "created_at": job.get('timestamp', '')
        })
        job_map[i] = job

    if not batch_input:
        print("No jobs to process.")
        return

    # Call Gemini with the batch
    extracted_results = extract_jobs_batch(batch_input)
    
    print(f"[DEBUG] Received {len(extracted_results)} results from Gemini.")

    structured_results = []
    processed_indices = []

    for item in extracted_results:
        if not isinstance(item, dict):
            continue
            
        # Match back to original job using ID
        temp_id = item.get('id')
        if temp_id is None or temp_id not in job_map:
            print(f"[!] Warning: Result received with unknown ID: {temp_id}")
            continue
            
        processed_indices.append(temp_id)
        original_job = job_map[temp_id]
        
        # Only process if it's a valid job offer
        if not item.get("is_job_offer", False):
            # We still mark it as processed so we don't retry non-jobs forever
            continue

        # Inject Metadata from original job
        post_link = original_job.get('post_url', '')
        source_id = original_job.get('source_id')
        post_id = extract_post_id_from_url(post_link)

        item['post_link'] = post_link
        
        if post_id:
            item['id'] = post_id # Use real post ID for final output
        else:
            # If we don't have a real post ID, remove the temp ID to avoid confusion
            if 'id' in item:
                del item['id']
        
        if source_id:
            item['groupID'] = source_id

        # Fallback for contact_info
        if not item.get('contact_info'):
            item['contact_info'] = post_link

        if not item.get("job_title"):
            print(f"[*] Skipped job {temp_id}: job_title is missing.")
            continue

        structured_results.append(item)

    # Write all structured job offers as a proper JSON array to structuered_jobs.json
    output_path = os.path.join(backend_root, "Data", "structuered_jobs.json")
    with open(output_path, 'w', encoding='utf-8') as fw:
        json.dump(structured_results, fw, ensure_ascii=False, indent=4)

    # Update jobs.json to remove processed items
    # processed_indices contains all IDs that the model returned a result for (even if not a job)
    remaining_jobs = [job for i, job in enumerate(jobs) if i not in processed_indices]
    
    with open(jobs_path, 'w', encoding='utf-8') as f:
        json.dump(remaining_jobs, f, ensure_ascii=False, indent=4)
    
    print(f"[DEBUG] Removed {len(processed_indices)} processed jobs from {jobs_path}. {len(remaining_jobs)} remaining.")

if __name__ == "__main__":
    main()