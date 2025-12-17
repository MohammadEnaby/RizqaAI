from fastapi import APIRouter, HTTPException, Header, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import Optional
from typing import Union
import os
import sys

# Add parent dir to sys.path to ensure imports work
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from core.firebase import db, firestore # Assuming firestore is exported or available via firebase-admin
from core.reporting import send_email_report # Import the shared reporting function

router = APIRouter()

# --- Configuration ---
try:
    from core.secrets import SIRI_API_KEY
except ImportError:
    # User should set this in their environment or secrets
    # For now, we default to a placeholder if not set, but warn.
    SIRI_API_KEY = os.environ.get("SIRI_API_KEY", "rizqa-siri-secret-key-123")


# --- Models ---
class SiriAddGroupRequest(BaseModel):
    group_name: str
    group_id: Union[str, int]
    platform: str = "facebook"

class SiriAutomationRequest(BaseModel):
    group_name_or_id: str
    max_scrolls: int = 50

# --- Dependencies ---
async def verify_siri_key(x_api_key: str = Header(...)):
    if x_api_key != SIRI_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid Siri API Key")
    return x_api_key

# --- Helpers ---
async def consume_pipeline(generator):
    """Consumes the pipeline generator to ensure it runs."""
    async for _ in generator:
        pass # Just let it run

# --- Endpoints ---

@router.post("/siri/add-group", dependencies=[Depends(verify_siri_key)])
async def siri_add_group(request: SiriAddGroupRequest):
    """
    Adds a new group to the platformGroups collection.
    Expects explicit 'group_id' and 'group_name' from Siri.
    """
    if not db:
        raise HTTPException(status_code=503, detail="Database not initialized")

    group_id = str(request.group_id).strip()
    
    doc_ref = db.collection("platformGroups").document(group_id)
    if doc_ref.get().exists:
        return {"message": f"Group '{request.group_name}' already exists.", "id": group_id}

    new_group = {
        "name": request.group_name,
        "platformType": request.platform,
        "groupID": group_id,
        "createdAt": firestore.SERVER_TIMESTAMP,
        "metadata": {
            "added_via": "Siri"
        }
    }
    
    doc_ref.set(new_group)
    return {"message": f"Added '{request.group_name}' to Rizqa.", "id": group_id}


@router.post("/siri/trigger-automation", dependencies=[Depends(verify_siri_key)])
async def siri_trigger_automation(request: SiriAutomationRequest):
    """
    Triggers the automation pipeline for a specific group synchronously.
    Returns a detailed report of the jobs found.
    """
    if not db:
        raise HTTPException(status_code=503, detail="Database not initialized")

    target_id = request.group_name_or_id
    
    # 1. Resolve Group ID
    doc_ref = db.collection("platformGroups").document(target_id)
    doc = doc_ref.get()
    
    found_group_name = target_id
    
    if not doc.exists:
        # Search by name
        query = db.collection("platformGroups").where(field_path="name", op_string="==", value=target_id).limit(1).stream()
        found = list(query)
        if found:
            doc = found[0]
            target_id = doc.id
            found_group_name = doc.to_dict().get("name")
        else:
             return {"message": f"Could not find group named '{target_id}'. Try ID?", "status": "error"}
    else:
        found_group_name = doc.to_dict().get("name", target_id)

    # 2. Run Pipeline Synchronously (Wait for it)
    try:
        from core.pipeline import pipeline_generator
    except ImportError:
         raise HTTPException(status_code=500, detail="Cannot access pipeline logic")

    # Limit scrolls for Siri to avoid timeouts if not specified
    # User can override, but we default to a safe low number for voice interactions
    safe_scrolls = request.max_scrolls 
    print(f"[*] Siri Trigger: Running for {found_group_name} with {safe_scrolls} scrolls...")

    logs = []
    async for line in pipeline_generator(target_id, safe_scrolls):
        logs.append(line) # Capture logs if needed for debug

    # 3. Analyze Results
    # Read the structured jobs file to see what was found
    import json
    from collections import Counter

    data_dir = os.path.join(current_dir, "Data")
    results_path = os.path.join(data_dir, "structuered_jobs.json")
    
    jobs_summary = "No jobs found."
    
    if os.path.exists(results_path):
        try:
            with open(results_path, 'r', encoding='utf-8') as f:
                jobs_data = json.load(f)
            
            if jobs_data:
                total_jobs = len(jobs_data)
                # Count by titles
                titles = [j.get("job_title", "Unknown") for j in jobs_data]
                title_counts = Counter(titles)
                
                # Format: "1 Cashier, 2 Drivers"
                # Get top 3 common titles to keep it brief for Siri
                details = []
                for title, count in title_counts.most_common(3):
                    details.append(f"{count} {title}")
                
                detail_str = ", ".join(details)
                if len(title_counts) > 3:
                     detail_str += ", and more"

                jobs_summary = f"Added {total_jobs} new jobs: {detail_str}."
                
                # Send email report
                send_email_report(total_jobs, titles)
                
            else:
                jobs_summary = "Pipeline finished, but found 0 new valid job offers."
                
        except Exception as e:
            jobs_summary = f"Pipeline finished, but could not read report: {str(e)}"
    else:
        jobs_summary = "Pipeline run complete (Report file missing)."

    return {
        "message": f"{jobs_summary}",
        "group": found_group_name,
        "detail": jobs_summary # Alias for clarity if needed
    }
