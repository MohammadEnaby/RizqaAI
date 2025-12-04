import json
import os
import subprocess
import sys
import time
from typing import Sequence


# Determine the absolute path to the 'backend' directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Data file paths
JOBS_PATH = os.path.join(BASE_DIR, "Data", "jobs.json")
STRUCTURED_PATH = os.path.join(BASE_DIR, "Data", "structuered_jobs.json")


def file_has_data(path: str) -> bool:
    """Return True if the file exists and is non-empty."""
    return os.path.exists(path) and os.path.getsize(path) > 0


def run_script(script_name: str, label: str) -> bool:
    """Run a Python script located in the 'scripts' directory."""
    print(f"[>] Starting step: {label}")
    start = time.time()

    script_path = os.path.join(BASE_DIR, "scripts", script_name)
    python_bin = sys.executable

    try:
        subprocess.run([python_bin, script_path], check=True)
        elapsed = time.time() - start
        print(f"[OK] Step '{label}' finished in {elapsed:.1f}s")
        return True
    except subprocess.CalledProcessError as exc:
        print(f"[X] Step '{label}' failed (exit {exc.returncode}).")
        return False


def ensure_jobs_ready() -> bool:
    """Confirm that scraping produced data before moving on."""
    if not file_has_data(JOBS_PATH):
        print(f"[!] '{JOBS_PATH}' is missing or empty. Aborting pipeline.")
        return False
    try:
        with open(JOBS_PATH, "r", encoding="utf-8") as fh:
            jobs = json.load(fh)
        if not jobs:
            print(f"[!] '{JOBS_PATH}' contains zero items. Aborting pipeline.")
            return False
    except json.JSONDecodeError as err:
        print(f"[X] Could not parse '{JOBS_PATH}': {err}")
        return False

    print(f"[i] {len(jobs)} raw posts ready for structuring.")
    return True


def ensure_structured_ready() -> bool:
    """Confirm that structuring produced data before uploading."""
    if not file_has_data(STRUCTURED_PATH):
        print(f"[!] '{STRUCTURED_PATH}' is missing or empty. Aborting upload.")
        return False
    try:
        with open(STRUCTURED_PATH, "r", encoding="utf-8") as fh:
            structured = json.load(fh)
        if not structured:
            print(f"[!] '{STRUCTURED_PATH}' contains zero items. Aborting upload.")
            return False
    except json.JSONDecodeError as err:
        print(f"[X] Could not parse '{STRUCTURED_PATH}': {err}")
        return False

    print(f"[i] {len(structured)} structured jobs ready for Firebase.")
    return True


def clear_data_files() -> None:
    """Remove pipeline artifacts once data is uploaded."""
    for path in (STRUCTURED_PATH,):
        try:
            # Write an empty list to clear the file
            with open(path, "w", encoding="utf-8") as fh:
                json.dump([], fh, ensure_ascii=False, indent=4)
            print(f"[~] Cleared '{path}'.")
        except OSError as err:
            print(f"[!] Could not clear '{path}': {err}")


def main():
    if not run_script("postsExtraction.py", "Scrape Posts"):
        return

    if not ensure_jobs_ready():
        return

    if not run_script("JobExtraction.py", "Structure Jobs"):
        return

    if not ensure_structured_ready():
        return

    if run_script("firebaseUploader.py", "Firebase Upload"):
        clear_data_files()


if __name__ == "__main__":
    main()

