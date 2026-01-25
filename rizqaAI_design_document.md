# RizqaAI Design Document

This document outlines the Use Cases, Requirements, and System Design (תיכון) for the RizqaAI platform.

---

## 1. Use Cases

### 1.1 Actors
*   **Job Seeker (User)**: An individual looking for employment opportunities.
*   **Administrator (Admin)**: A platform manager responsible for data sources and system health.
*   **System (Automation)**: The background processes (Scheduler, Pipeline) that run without human intervention.
*   **Siri/External Trigger**: An external automation tool triggering system actions.

### 1.2 Use Case Descriptions

#### **For Job Seeker**
*   **UC-01: Search for Jobs (Chat)**
    *   **Description**: User interacts with the AI Chatbot using natural language to find jobs.
    *   **Flow**: User sends "I need a driver job in Haifa" -> System parses intent -> System queries DB -> System returns conversational response with job cards.
*   **UC-02: View Job Details**
    *   **Description**: User views full details of a specific job offer, including contact info and original post link.

#### **For Administrator**
*   **UC-03: Manage Data Sources**
    *   **Description**: Admin adds, updates, or deletes Facebook Groups in the `platformGroups` collection to control where the system scrapes data from.
*   **UC-04: Monitor Pipelines**
    *   **Description**: Admin views the status of active or scheduled data pipelines via the Dashboard.
*   **UC-05: Manual Pipeline Trigger**
    *   **Description**: Admin forces a scrape-and-extract cycle for a specific group immediately.

#### **For System**
*   **UC-06: Scheduled Data Injection**
    *   **Description**: The `AutoFill` scheduler triggers the pipeline at set intervals (e.g., every 24 hours) to fetch new content.
*   **UC-07: External Trigger (Siri)**
    *   **Description**: An authorized external request triggers the pipeline or adds a new group via the API.

---

## 2. Requirements

### 2.1 Functional Requirements
1.  **Data Acquisition**:
    *   The system DOES NOT use Selenium. It **MUST** use the **Apify API** to scrape content from Facebook Groups.
    *   The system must support extraction of text, images, and timestamps from posts.
2.  **AI Processing**:
    *   The system **MUST** use **Google Gemini** (pro/flash models) to analyze unstructured post text.
    *   It must correctly classify posts as "Job Offer" or "Other".
    *   It must extract: Title, Location, Salary, Shifts, and Contact Info.
3.  **Search & Retrieval**:
    *   The system must support **Natural Language Understanding (NLU)** to interpret user queries in Hebrew, Arabic, and English.
    *   The search algorithm should prioritize matches by Keyword (+2 score) and Location (+1 score).
4.  **User Interface**:
    *   **Frontend**: A responsive React application with a Chat interface and Admin Dashboard.
    *   **Admin**: Secured routes for managing pipeline configurations.

### 2.2 Non-Functional Requirements
1.  **Reliability**: The data pipeline must handle failures (e.g., Apify errors) gracefully and report them via logs or email.
2.  **Scalability**: The modular pipeline design should allow adding new data sources (e.g., WhatsApp, Telegram) in the future.
3.  **Performance**: Chatbot responses should be generated within 2-4 seconds.
4.  **Data Freshness**: Job offers should be updated at least daily via the Scheduler.

---

## 3. Design (תיכון)

### 3.1 High-Level Architecture
The system follows a **Client-Server** architecture with a serverless database.

*   **Client (Frontend)**: React + Vite + TailwindCSS. Handles UI and user interaction.
*   **Server (Backend)**: Python FastAPI. Handles business logic, AI integration, and API endpoints.
*   **Database**: Google Firestore (NoSQL). Stores all persistent data.
*   **External Services**:
    *   **Apify**: For scraping social media.
    *   **Google Gemini**: For NLP and extraction.
    *   **Firebase Auth**: For user and admin authentication.

### 3.2 Database Schema (Firestore)
The database is structured into the following collections:

#### `jobs`
*   **Document ID**: Unique hash or Post ID.
*   **Fields**:
    *   `job_title` (string)
    *   `location` (string)
    *   `description` (string)
    *   `wage_per_hour` (string)
    *   `contact_info` (string)
    *   `post_link` (string)
    *   `created_at` (timestamp)
    *   `source_id` (string) - Link to `platformGroups`.

#### `platformGroups`
*   **Document ID**: Group ID (e.g., Facebook Group ID).
*   **Fields**:
    *   `name` (string)
    *   `platformType` (string) - e.g., "Facebook".
    *   `APIFY_API_TOKEN` (string) - Specific token for this source (optional).
    *   `status` (string) - Active/Inactive.

#### `chatSessions`
*   **Document ID**: UUID.
*   **Fields**:
    *   `userId` (string)
    *   `messages` (Sub-collection):
        *   `text` (string)
        *   `sender` (user/bot)
        *   `timestamp` (timestamp)

#### `schedulingPipelines`
*   **Document ID**: Pipeline ID.
*   **Fields**:
    *   `groupID` (string)
    *   `interval` (number) - Minutes between runs.
    *   `lastRunMetadata` (map) - Status of the last execution.

### 3.3 Component Design

#### **Backend Components**
1.  **`api/chatbot.py`**:
    *   **`extract_search_filters()`**: Uses Gemini to convert text -> JSON filters.
    *   **`search_jobs_in_db()`**: Implements the scoring logic (Keyword/Location).
2.  **`core/pipeline.py`**:
    *   Orchestrates the sequential execution of scripts.
    *   **Generator Pattern**: Streams logs back to the client in real-time.
3.  **`scripts/postsExtraction.py`**:
    *   Wraps the **ApifyClient**.
    *   Fetches posts and normalizes them into a standard dictionary format.
4.  **`scripts/JobExtraction.py`**:
    *   Batches posts for Gemini.
    *   Enforces the strictly typed JSON schema for job offers.

#### **Frontend Components**
1.  **`ChatBot.jsx`**:
    *   Manages chat state (messages array).
    *   Renders `JobCard` components dynamically based on API response.
2.  **`Admin/Pipeline.jsx`**:
    *   Displays `platformGroups`.
    *   Provides "Run Now" button to trigger `POST /api/run-pipeline`.
