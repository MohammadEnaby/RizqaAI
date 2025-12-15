import os
import sys
import asyncio
import subprocess
from typing import AsyncGenerator

# Determine paths
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # backend/

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
        # Use Popen directly
        process = subprocess.Popen(
            [python_executable, script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            env=env_vars,
            bufsize=0 # Unbuffered
        )
        
        loop = asyncio.get_running_loop()
        
        while True:
            # Run the blocking readline in a thread
            line = await loop.run_in_executor(None, process.stdout.readline)
            if not line:
                break
            # Decode with replacement
            decoded_line = line.decode('utf-8', errors='replace')
            
            # Filter logs
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
