# RizqaAI Services Overview

This document details the core services operating within the RizqaAI platform. These services handle everything from user interaction to automated data acquisition.

## 1. 🤖 AI Chatbot Service
**Endpoint:** `/api/chatbot`  
**Purpose:** Provides an intelligent, conversational interface for job seekers to find relevant opportunities using natural language.

### **How it Works**
1.  **Intent Recognition (Gemini AI)**:
    *   When a user sends a message, the system uses **Google Gemini** to analyze the intent.
    *   It extracts structured **keywords** (including synonyms and translations) and **location** filters.
    *   *Example:* "I want to work as a driver in Jerusalem" -> `{"keywords": ["driver", "nahag"], "location": "Jerusalem"}`.
2.  **Smart Database Search**:
    *   The backend queries the **Firestore** `jobs` collection.
    *   It applies a scoring algorithm to rank jobs:
        *   **+2 points** for Keyword match.
        *   **+1 point** for Location match.
    *   This allows for flexible matching (e.g., showing a driver job in a nearby city if the exact city isn't found).
3.  **Contextual Response**:
    *   The search results are fed back into **Gemini** as context.
    *   Gemini generates a natural language response in the user's language (Hebrew, Arabic, or English), summarizing the findings or politely apologizing if nothing is found.

### **Key Components**
-   **Conversation History**: Stores all messages in `chatSessions` (Firestore) for context continuity.
-   **Multi-language Support**: Inherently supported by Gemini's generation capabilities.

---

## 2. 🔄 AutoFill Scheduler
**Script:** `scripts/autoFill.py`  
**Purpose:** A background service that ensures the job database is constantly updated without manual intervention.

### **How it Works**
-   **Infinite Loop**: Runs continuously in the background using Python's `asyncio`.
-   **Schedule Checking**:
    *   Monitors the `schedulingPipelines` collection in Firestore.
    *   Checks if a pipeline's `interval` has passed since the last run.
-   **Execution**:
    *   If a task is due, it triggers the **Data Pipeline**.
    *   Updates the database with run statistics (Success/Fail, Duration, Job Count).
    *   Sends an **Email Report** to admins summarizing the new jobs found.
-   **Maintenance**:
    *   Periodically runs `cleanup_jobs.py` to remove expired job listings.

---

## 3. 🏭 Data Ingestion Pipeline
**Core Logic:** `core/pipeline.py`  
**Purpose:** The "engine" that converts unstructured social media posts into structured job data. It follows a strict 3-step ETL process.

### **Step 1: Scraping (`postsExtraction.py`)**
-   Uses **Apify** (Actor: `apify/facebook-groups-scraper`) to scrape posts from Facebook Groups.
-   Fetches raw post text, images, URLs, and timestamps via the Apify API.
-   Saves raw data to a temporary JSON file.

### **Step 2: AI Extraction (`JobExtraction.py`)**
-   **Batch Processing**: Reads the raw posts and sends them to **Gemini Pro/Flash** in batches.
-   **Structured Parsing**: The AI analyzes the text to extract:
    *   Job Title
    *   Location
    *   Salary/Wage
    *   Contact Info (Phone/Email)
    *   Shifts & Requirements
-   **Filtering**: Determines `is_job_offer` (True/False) to discard spam or non-job posts.

### **Step 3: Upload (`firebaseUploader.py`)**
-   Takes the clean, structured JSON from Step 2.
-   Uploads new entries to the global **Firestore** `jobs` collection.
-   Prevents duplicates based on Post ID.

---

## 📊 Summary of Data Flow
1.  **Source**: Facebook Groups (defined in `platformGroups`).
2.  **Trigger**: `AutoFill` (Scheduled) or `ManualFill` (Manual).
3.  **Process**: Pipeline (Scrape -> AI Extract -> Upload).
4.  **Storage**: Firestore (`jobs` collection).
5.  **Access**: Users search via **Chatbot** or browse on the **Frontend**.
