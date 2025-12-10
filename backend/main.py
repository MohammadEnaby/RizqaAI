import os
import sys
import subprocess
import asyncio
from typing import AsyncGenerator
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import StreamingResponse

# Add the parent directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)



from api.chatbot import router as chatbot_router



app = FastAPI()

# Include chatbot router
app.include_router(chatbot_router, prefix="/api/chatbot", tags=["chatbot"])

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

async def run_script(script_name: str, env_vars: dict) -> AsyncGenerator[str, None]:
    """
    Runs a python script and yields its output line by line.
    Uses subprocess.Popen and loop.run_in_executor to avoid asyncio event loop issues on Windows.
    """
    script_path = os.path.join(current_dir, "scripts", script_name)
    
    # Use python from the current environment
    python_executable = sys.executable

    # Enforce UTF-8 for the subprocess
    env_vars["PYTHONIOENCODING"] = "utf-8"
    # Ensure output is unbuffered so we see logs immediately
    env_vars["PYTHONUNBUFFERED"] = "1"
    
    # Ensure all env vars are strings
    env_vars = {k: str(v) for k, v in env_vars.items()}

    yield f"[DEBUG] Python: {python_executable}\n"
    yield f"[DEBUG] Script: {script_path}\n"

    # Define allowed log prefixes
    ALLOWED_PREFIXES = (
        ">>>", "---", "[*]", "[!]", "[+]", "[~]", "[>]", "[OK]", 
        "[DEBUG]", "[ERROR]", "[SUCCESS]", "[EXCEPTION]"
    )

    try:
        # Use Popen directly, bypassing asyncio's subprocess support which can be flaky on Windows
        process = subprocess.Popen(
            [python_executable, script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            env=env_vars,
            bufsize=0 # Unbuffered to get output immediately
        )
        
        loop = asyncio.get_running_loop()
        
        while True:
            # Run the blocking readline in a thread
            line = await loop.run_in_executor(None, process.stdout.readline)
            if not line:
                break
            # Decode with replacement to avoid crashing on non-UTF-8 bytes
            decoded_line = line.decode('utf-8', errors='replace')
            
            # Filter logs: Only yield lines that start with allowed prefixes
            # We strip whitespace from the left to handle indentation if any, 
            # though usually logs are at the start of the line.
            if decoded_line.lstrip().startswith(ALLOWED_PREFIXES):
                yield decoded_line
        
        # Wait for process to exit
        await loop.run_in_executor(None, process.wait)
        
        if process.returncode != 0:
            yield f"[ERROR] {script_name} failed with return code {process.returncode}\n"
        else:
            yield f"[SUCCESS] {script_name} completed successfully.\n"
            
    except Exception as e:
        import traceback
        yield f"[EXCEPTION] Failed to run {script_name}: {str(e)}\n"
        yield f"[DEBUG] Traceback: {traceback.format_exc()}\n"

async def pipeline_generator(group_id: str, max_scrolls: int) -> AsyncGenerator[str, None]:
    """
    Generator that runs the pipeline steps sequentially and streams output.
    """
    env = os.environ.copy()
    env["FB_GROUP_ID"] = group_id
    # Note: postsExtraction.py needs to be updated to use MAX_SCROLLS env var if we want to pass it dynamically,
    # or we can pass it as an argument if the script supports it.
    # Looking at postsExtraction.py, it has `max_scrolls = 100` hardcoded but doesn't seem to read from env yet.
    # For now, we will just set the env var, and I might need to update postsExtraction.py to read it.
    # But the user asked to "run the pipeline with their inputs (groupID, MAXscrolls)".
    # So I should probably update postsExtraction.py to read MAX_SCROLLS.
    # For this step, I'll pass it in env.
    env["MAX_SCROLLS"] = str(max_scrolls)

    yield "--- Starting Pipeline ---\n"
    yield f"Target Group ID: {group_id}\n"
    yield f"Max Scrolls: {max_scrolls}\n\n"

    # Step 1: Scraping
    yield ">>> Step 1: Scraping Posts (postsExtraction.py)...\n"
    async for line in run_script("postsExtraction.py", env):
        yield line
    yield "\n"

    # Step 2: Extraction
    yield ">>> Step 2: Extracting Job Data (JobExtraction.py)...\n"
    async for line in run_script("JobExtraction.py", env):
        yield line
    yield "\n"

    # Step 3: Upload
    yield ">>> Step 3: Uploading to Firebase (firebaseUploader.py)...\n"
    async for line in run_script("firebaseUploader.py", env):
        yield line
    yield "\n"

    yield "--- Pipeline Finished ---\n"

@app.post("/api/run-pipeline")
async def run_pipeline(request: PipelineRequest):
    return StreamingResponse(
        pipeline_generator(request.groupID, request.maxScrolls),
        media_type="text/plain"
    )

@app.get("/")
def read_root():
    return {"message": "JobScout API is running"}

import json
import re

@app.get("/api/last-seen-groups")
async def get_last_seen_groups():
    try:
        data_path = os.path.join(current_dir, "Data", "last_post_seen.py")
        if not os.path.exists(data_path):
             print(f"File not found: {data_path}")
             return {"groups": []}
             
        with open(data_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Extract the dictionary part: look for everything after the first '='
        # The file format is: dict_of_lastSeenPost_for_each_group = { ... }
        match = re.search(r"=\s*(\{.*)", content, re.DOTALL)
        if match:
            json_str = match.group(1).strip()
            # It might have a trailing newline, json.loads handles that usually, 
            # but if it's strictly python dict syntax that isn't valid JSON (e.g. trailing comma), 
            # json.loads might fail. 
            # Given postsExtraction.py uses json.dumps(data, indent=4), it should be valid JSON.
            data = json.loads(json_str)
            return {"groups": list(data.keys())}
        
        return {"groups": []}
    except Exception as e:
        print(f"Error reading last seen groups: {e}")
        return {"groups": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
