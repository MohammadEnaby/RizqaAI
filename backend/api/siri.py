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
async def siri_trigger_automation(request: SiriAutomationRequest, background_tasks: BackgroundTasks):
    """
    Triggers the automation pipeline for a specific group.
    Resolves name to ID if needed.
    """
    if not db:
        raise HTTPException(status_code=503, detail="Database not initialized")

    target_id = request.group_name_or_id
    
    # Check if it's a name, if so find ID
    # This is a simple exact match or "contains" search could be better for voice
    # For now, let's try direct ID fetch, then search by name
    
    doc = db.collection("platformGroups").document(target_id).get()
    
    found_group_name = target_id
    
    if not doc.exists:
        # Search by name
        # Note: Firestore doesn't do "contains" easily without external engines, 
        # but we can do exact match on 'name' field
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

    # Import pipeline_generator here to avoid circular imports if possible, 
    # or rely on main importing this router.
    # Actually, importing pipeline_generator from main might cause circular import since main imports this router on init.
    # To avoid this, we should move pipeline_generator to a separate file (e.g. backend/core/pipeline.py)
    # OR, we can import it inside the function.
    # Import pipeline_generator from core directory
    try:
        from core.pipeline import pipeline_generator
    except ImportError:
         raise HTTPException(status_code=500, detail="Cannot access pipeline logic")

    # Run in background
    # We need to wrap the async generator in an awaitable function
    async def run_in_bg():
        async for _ in pipeline_generator(target_id, request.max_scrolls):
            pass # We just consume it so it runs

    background_tasks.add_task(run_in_bg)

    return {
        "message": f"Started automation for '{found_group_name}'!",
        "details": f"ID: {target_id}, Scrolls: {request.max_scrolls}"
    }
