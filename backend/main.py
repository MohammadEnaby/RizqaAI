import os
import sys
import subprocess
import asyncio
from typing import AsyncGenerator, Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from firebase_admin import firestore
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from google.cloud.firestore_v1.base_query import FieldFilter

# Add the parent directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)



from api.chatbot import router as chatbot_router

# Import pipeline logic from core
from core.pipeline import pipeline_generator

app = FastAPI()

# Include chatbot router
app.include_router(chatbot_router, prefix="/api/chatbot", tags=["chatbot"])

from api.siri import router as siri_router
app.include_router(siri_router, prefix="/api", tags=["siri"])

# Import scheduler
from scripts.autoFill import scheduler_loop

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PipelineRequest(BaseModel):
    groupID: str
    maxScrolls: int = 100

# --- Pydantic Models for Platform Groups ---
class PlatformGroupBase(BaseModel):
    groupID: str
    name: str
    platformType: str
    metadata: Optional[Dict[str, Any]] = {}

class PlatformGroupCreate(PlatformGroupBase):
    pass

class PlatformGroupUpdate(BaseModel):
    name: Optional[str] = None
    platformType: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

@app.on_event("startup")
async def startup_event():
    # Start the scheduler in the background
    asyncio.create_task(scheduler_loop())
    print("[INFO] AutoFill Scheduler started in background.")

@app.post("/api/run-pipeline")
async def run_pipeline(request: PipelineRequest):
    return StreamingResponse(
        pipeline_generator(request.groupID),
        media_type="text/plain"
    )

@app.get("/")
def read_root():
    return {"message": "JobScout API is running"}

# Import Firestore instance
try:
    from core.firebase import db
except ImportError:
    db = None

# --- CRUD Endpoints for Platform Groups ---

@app.get("/api/platform-groups", response_model=List[Dict[str, Any]])
async def get_platform_groups():
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
    try:
        docs = db.collection("platformGroups").stream()
        groups = []
        for doc in docs:
            data = doc.to_dict()
            # Ensure groupID is in the response, fallback to doc ID
            data["groupID"] = doc.id
            groups.append(data)
        return groups
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/platform-groups")
async def create_platform_group(group: PlatformGroupCreate):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
    try:
        doc_ref = db.collection("platformGroups").document(group.groupID)
        if doc_ref.get().exists:
             raise HTTPException(status_code=400, detail="Group already exists")
        
        data = group.dict()
        data["updatedAt"] = firestore.SERVER_TIMESTAMP
        doc_ref.set(data)
        return {"message": "Group created successfully", "groupID": group.groupID}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/platform-groups/{group_id}")
async def update_platform_group(group_id: str, group_update: PlatformGroupUpdate):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
    try:
        doc_ref = db.collection("platformGroups").document(group_id)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Filter out None values
        update_data = {k: v for k, v in group_update.dict().items() if v is not None}
        if update_data:
            update_data["updatedAt"] = firestore.SERVER_TIMESTAMP
            doc_ref.update(update_data)
            
        return {"message": "Group updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/platform-groups/{group_id}")
async def delete_platform_group(group_id: str):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
    try:
        doc_ref = db.collection("platformGroups").document(group_id)
        doc_ref.delete()
        return {"message": "Group deleted successfully"}
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
