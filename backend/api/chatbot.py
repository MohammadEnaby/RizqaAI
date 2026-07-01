
from google.cloud.firestore_v1.base_query import FieldFilter
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import google.generativeai as genai
import os
import re  # Added for robust JSON extraction
import json # Added for robust JSON extraction
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import firestore

# Try to import db from core.firebase, handle if not initialized yet
try:
    from core.firebase import db
except ImportError:
    db = None

router = APIRouter()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Try to import from secrets
try:
    from core.secrets import API_KEY_Gimini
    if not GEMINI_API_KEY and API_KEY_Gimini:
        GEMINI_API_KEY = API_KEY_Gimini
except ImportError:
    pass

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# --- Models ---

# --- Models ---

class ChatMessage(BaseModel):
    message: str
    userId: Optional[str] = None
    sessionId: Optional[str] = None

class JobResult(BaseModel):
    id: Optional[str] = None
    title: str
    company: Optional[str] = "Unknown"
    location: Optional[str] = "Not specified"
    salary: Optional[str] = None
    link: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    jobs: List[JobResult] = []
    intent: str = "general"
    sessionId: str

class SessionCreate(BaseModel):
    userId: str
    title: Optional[str] = "New Chat"

class SessionResponse(BaseModel):
    id: str
    title: str
    createdAt: datetime
    updatedAt: datetime

class MessageResponse(BaseModel):
    id: str
    text: str
    sender: str
    timestamp: datetime
    jobs: Optional[List[JobResult]] = []

# --- Helpers ---

def get_db():
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
    return db

def extract_search_filters(user_query: str) -> dict:
    """
    Uses Gemini to extract search filters from natural language.
    Returns dict: {'keywords': List[str], 'location': str, 'intent': 'search'|'general'}
    """
    if not GEMINI_API_KEY:
        return {"intent": "general"}
    
    try:
        model = genai.GenerativeModel('gemini-3.1-flash-lite')
        prompt = f"""
        Analyze this job search query and extract structured filters.
        Output ONLY valid JSON.
        
        Query: "{user_query}"
        
        Keys:
        - intent: "search" if user mentions a job role, looking for work, or job related keywords. Default to "general" if it is just a greeting, a question not about jobs, or unclear.
        - language: "en", "ar", or "he". Detect the language of the user's query.
        - keywords: List of strings. Include the exact term, plus SYNONYMS, RELATED ROLES, and TRANSLATIONS (Hebrew/Arabic). 
          Example: "Food" -> ["food", "waiter", "chef", "cook", "restaurant", "מלצר", "טבח", "מסעדה"]
        - location: String or List. The main city/region. If a major city is mentioned, also include nearby cities in the same district.
          Example: "Jerusalem" -> ["Jerusalem", "ירושלים", "القدس", "Mevaseret", "Abu Ghosh", "Ma'ale Adumim"]
          Example: "Tel Aviv" -> ["Tel Aviv", "תל אביב", "Ramat Gan", "Givatayim", "Holon", "Bat Yam"]
        
        JSON:
        """
        response = model.generate_content(prompt)
        text = response.text
        
        # Robust JSON extraction
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            text = match.group(0)
            
        result = json.loads(text)
        
        # Debug: Print extracted filters
        print(f"DEBUG [extract_search_filters]: Query='{user_query}'")
        print(f"DEBUG [extract_search_filters]: Extracted={result}")
        
        # Trust Gemini's intent detection
        return result
    except Exception as e:
        print(f"Filter extraction failed: {e}")
        # print(f"Raw Gemini Output: {response.text if 'response' in locals() else 'No response'}") 
        return {"intent": "general"}

def search_jobs_in_db(filters: dict) -> List[dict]:
    """
    Searches Firestore 'jobs' collection based on filters.
    Performs in-memory filtering on all recent/active jobs to avoid complex indexes.
    """
    database = get_db()
    jobs_ref = database.collection("jobs")
    
    # Fetch all jobs to perform in-memory filtering across all sources (scraped & user-submitted)
    docs = jobs_ref.stream()
    
    all_processed_jobs = []
    found_jobs = []
    
    # Keywords is now a list
    keyword_list = filters.get("keywords", [])
    if isinstance(keyword_list, str): keyword_list = [keyword_list]
    # Normalize list and remove generic noise words
    noise_words = {"job", "jobs", "work", "working", "looking", "seek", "seeking", "position", "role", "career"}
    keyword_list = [k.lower() for k in keyword_list if k and k.lower() not in noise_words]
    
    # Handle location as string or list
    raw_location = filters.get("location")
    location_list = []
    if isinstance(raw_location, list):
        location_list = [str(l).lower() for l in raw_location if l]
    elif isinstance(raw_location, str):
        location_list = [raw_location.lower()]
    
    # Debug: Print search parameters
    print(f"DEBUG [search_jobs_in_db]: keyword_list={keyword_list}")
    print(f"DEBUG [search_jobs_in_db]: location_list={location_list}")
    
    user_lang = filters.get("language", "en")
    
    for doc in docs:
        data = doc.to_dict()
        
        # Support both 'job_title' (scraped) and 'title' (user submission)
        job_title_data = data.get("job_title") or data.get("title")
        if not job_title_data:
            continue
        
        if isinstance(job_title_data, dict):
            titles_to_check = [str(v).lower() for v in job_title_data.values() if v]
            display_title = job_title_data.get(user_lang) or job_title_data.get("en") or list(job_title_data.values())[0] if job_title_data else ""
        else:
            titles_to_check = [str(job_title_data).lower()]
            display_title = str(job_title_data)
            
        if not display_title:
            continue
        
        # Smart match logic
        match_score = 0
        
        # Check against ALL related keywords
        if keyword_list:
            for k in keyword_list:
                if any(k in t for t in titles_to_check):
                    match_score += 2
                    break # Matched one keyword, good enough for keyword score
        
        # Support string/dictionary location fields
        location_data = data.get("location")
        if isinstance(location_data, dict):
            locations_to_check = [str(v).lower() for v in location_data.values() if v]
            display_location = location_data.get(user_lang) or location_data.get("en") or list(location_data.values())[0] if location_data else "Not specified"
        elif location_data:
            locations_to_check = [str(location_data).lower()]
            display_location = str(location_data)
        else:
            locations_to_check = []
            display_location = "Not specified"
 
        if location_list:
            # Flexible location match - check against all locations in the list
            for loc in location_list:
                if any(loc in doc_loc or doc_loc in loc for doc_loc in locations_to_check):
                    match_score += 1
                    break  # One match is enough
            
        # Support both 'company' (scraped) and 'companyName' (user submission)
        company_data = data.get("company") or data.get("companyName")
        if isinstance(company_data, dict):
            display_company = company_data.get(user_lang) or company_data.get("en") or list(company_data.values())[0] if company_data else "Unknown"
        elif company_data:
            display_company = str(company_data)
        else:
            display_company = "Unknown"
 
        # Support contact info/links for user submission (phone / email)
        contact_link = data.get("post_link") or data.get("contact_info")
        if not contact_link:
            phone = data.get("phone")
            email = data.get("email")
            if phone:
                contact_link = f"tel:{phone}"
            elif email:
                contact_link = f"mailto:{email}"
            else:
                contact_link = "Not specified"

        # Get timestamp for in-memory sorting
        ts = data.get("post_time") or data.get("createdAt") or data.get("scraped_at")
        if isinstance(ts, datetime):
            # Ensure timezone-aware UTC
            doc_timestamp = ts if ts.tzinfo else ts.replace(tzinfo=timezone.utc)
        elif isinstance(ts, str):
            try:
                doc_timestamp = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                if not doc_timestamp.tzinfo:
                    doc_timestamp = doc_timestamp.replace(tzinfo=timezone.utc)
            except ValueError:
                doc_timestamp = datetime.min.replace(tzinfo=timezone.utc)
        else:
            doc_timestamp = datetime.min.replace(tzinfo=timezone.utc)

        job_entry = {
            "score": match_score,
            "timestamp": doc_timestamp,
            "id": doc.id,
            "title": display_title,
            "company": display_company, 
            "location": display_location,
            "salary": data.get("wage_per_hour") or data.get("salary") or "Not specified",
            "link": contact_link
        }
        
        all_processed_jobs.append(job_entry)

        # Decision Logic:
        # 1. User provided Keywords AND Location
        if keyword_list and location_list:
             if match_score > 0:
                 found_jobs.append(job_entry)
        # 2. User provided ONLY Keywords (e.g. "Selling")
        elif keyword_list and not location_list:
             if match_score > 0:
                 found_jobs.append(job_entry)
        # 3. User provided ONLY Location (e.g. "Holon")
        elif location_list and not keyword_list:
             if match_score > 0:
                 found_jobs.append(job_entry)
        # 4. User provided NOTHING (e.g. "I want a job")
        else:
             found_jobs.append(job_entry)

    # Sort matches by score descending, then by timestamp descending
    found_jobs.sort(key=lambda x: (x["score"], x["timestamp"]), reverse=True)
            
    # Fallback: if no matches were found, return the 5 most recent jobs from all processed jobs
    if not found_jobs and all_processed_jobs:
        all_processed_jobs.sort(key=lambda x: x["timestamp"], reverse=True)
        found_jobs = all_processed_jobs[:5]
 
    # Clean up fields that do not exist on Pydantic's JobResult model
    for job in found_jobs:
        job.pop("timestamp", None)
        job.pop("score", None)

    return found_jobs  # Return all matching jobs

# --- Endpoints ---

@router.get("/sessions", response_model=List[SessionResponse])
async def list_sessions(userId: str):
    """List all chat sessions for a user"""
    database = get_db()
    try:
        # Query sessions for user, ordered by updatedAt desc
        sessions_ref = database.collection("chatSessions")
        try:
            query = sessions_ref.where(filter=FieldFilter("userId", "==", userId))
            docs = query.stream()
            
            sessions = []
            for doc in docs:
                data = doc.to_dict()
                sessions.append(SessionResponse(
                    id=doc.id,
                    title=data.get("title", "New Chat"),
                    createdAt=data.get("createdAt"),
                    updatedAt=data.get("updatedAt")
                ))
            
            # Sort in memory (descending by updatedAt)
            sessions.sort(key=lambda x: x.updatedAt or x.createdAt, reverse=True)
            
            # print(f"DEBUG: Found {len(sessions)} sessions for user {userId}")
            return sessions
        except Exception as query_error:
            print(f"DEBUG: Query error: {query_error}")
            return []
    except Exception as e:
        print(f"Error listing sessions: {e}")
        return []

@router.post("/sessions", response_model=SessionResponse)
async def create_session(session: SessionCreate):
    """Create a new chat session"""
    database = get_db()
    try:
        new_session = {
            "userId": session.userId,
            "title": session.title,
            "createdAt": firestore.SERVER_TIMESTAMP,
            "updatedAt": firestore.SERVER_TIMESTAMP
        }
        update_time, doc_ref = database.collection("chatSessions").add(new_session)
        
        doc = doc_ref.get()
        data = doc.to_dict()
        
        return SessionResponse(
            id=doc.id,
            title=data.get("title"),
            createdAt=data.get("createdAt", datetime.now()),
            updatedAt=data.get("updatedAt", datetime.now())
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}/messages", response_model=List[MessageResponse])
async def get_session_messages(session_id: str, userId: str):
    """Get message history for a session"""
    database = get_db()
    try:
        session_ref = database.collection("chatSessions").document(session_id)
        session = session_ref.get()
        if not session.exists or session.to_dict().get("userId") != userId:
            raise HTTPException(status_code=404, detail="Session not found")

        messages_ref = session_ref.collection("messages").order_by("timestamp", direction=firestore.Query.ASCENDING)
        docs = messages_ref.stream()
        
        messages = []
        for doc in docs:
            data = doc.to_dict()
            jobs_data = []
            if "jobs" in data:
                # Handle inconsistent field names if any
                for j in data["jobs"]:
                    jobs_data.append(JobResult(**j))

            messages.append(MessageResponse(
                id=doc.id,
                text=data.get("text", ""),
                sender=data.get("sender", "user"),
                timestamp=data.get("timestamp"),
                jobs=jobs_data
            ))
        return messages
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, userId: str):
    """Delete a chat session"""
    database = get_db()
    try:
        session_ref = database.collection("chatSessions").document(session_id)
        session = session_ref.get()
        if not session.exists or session.to_dict().get("userId") != userId:
            raise HTTPException(status_code=404, detail="Session not found")
            
        messages = session_ref.collection("messages").stream()
        for msg in messages:
            msg.reference.delete()
            
        session_ref.delete()
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query", response_model=ChatResponse)
async def chat_query(request: ChatMessage):
    """
    Process user's chat message, save to history, and return AI response
    """
    database = get_db()
    
    try:
        session_id = request.sessionId
        
        if not session_id:
            title = request.message[:30] + "..." if len(request.message) > 30 else request.message
            new_session = {
                "userId": request.userId,
                "title": title,
                "createdAt": firestore.SERVER_TIMESTAMP,
                "updatedAt": firestore.SERVER_TIMESTAMP
            }
            _, doc_ref = database.collection("chatSessions").add(new_session)
            session_id = doc_ref.id
        else:
            database.collection("chatSessions").document(session_id).update({
                "updatedAt": firestore.SERVER_TIMESTAMP
            })

        session_ref = database.collection("chatSessions").document(session_id)

        # 1. Save User Message
        user_msg = {
            "text": request.message,
            "sender": "user",
            "timestamp": firestore.SERVER_TIMESTAMP
        }
        session_ref.collection("messages").add(user_msg)

        if not GEMINI_API_KEY:
            error_response = "AI unavailable. Please configure API key."
            bot_msg = {
                "text": error_response,
                "sender": "bot",
                "timestamp": firestore.SERVER_TIMESTAMP,
                "jobs": []
            }
            session_ref.collection("messages").add(bot_msg)
            return ChatResponse(response=error_response, intent="error", sessionId=session_id)

        # --- INTELLIGENT SEARCH LOGIC ---
        
        # 1. Analyze Intent & Extract Filters
        analysis = extract_search_filters(request.message)
        intent = analysis.get("intent", "general")
        
        # Override: Force intent to "search" if user uses job seeking phrases
        msg_lower = request.message.lower()
        job_seeking_phrases = ["need a job", "looking for a job", "find a job", "looking for work", "any job", "show me jobs", "jobs available", "available jobs", "search jobs", "dneed a job"]
        if any(phrase in msg_lower for phrase in job_seeking_phrases):
            intent = "search"
        
        found_jobs = []
        if intent == "search":
            found_jobs = search_jobs_in_db(analysis)
            print(f"DEBUG: Found {len(found_jobs)} jobs for query '{request.message}'")

        # 2. Generate AI Response with Context
        model = genai.GenerativeModel('gemini-3.1-flash-lite')
        
        jobs_context = ""
        is_fallback = False
        if found_jobs:
            is_fallback = all(job.get("score", 0) == 0 for job in found_jobs)
            if is_fallback:
                jobs_context = "NO EXACT MATCHES FOUND. However, here are the most recent job listings from the database:\n"
            else:
                jobs_context = f"Found {len(found_jobs)} matches:\n"
            for job in found_jobs:
                jobs_context += f"- Job: {job['title']}\n  Location: {job['location']}\n  Pay: {job['salary']}\n  Link: {job['link']}\n"
        elif intent == "search":
             jobs_context = f"NO MATCHES FOUND. The user searched for: {analysis}. I checked the database but found nothing."

        # System Prompt for natural, helpful responses
        user_lang = analysis.get("language", "en")
        
        system_prompt = f"""
        Result of database search:
        {jobs_context}

        User Query: "{request.message}"
        Detected Language: "{user_lang}"

        Task: Provide a brief, conversational response in the SAME LANGUAGE as the user's query.
        
        CRITICAL RULES:
        - DO NOT create markdown tables or lists of jobs
        - DO NOT repeat job details (the UI will show job cards automatically)
        - If jobs were found, say something like "I found X jobs for you!" or "Here are the available positions"
        - If NO EXACT MATCHES were found but recent jobs are shown, explain that you couldn't find exact matches but present these recent openings as alternatives
        - If this is a GREETING, respond warmly and ask how you can help
        - If NO jobs were found, apologize briefly and suggest trying different keywords or locations
        - Keep your response SHORT (1-2 sentences maximum)
        - YOU MUST RESPOND IN THE DETECTED LANGUAGE ({user_lang}). If 'ar', respond in Arabic. If 'he', respond in Hebrew. If 'en', respond in English.
        """
        
        response = model.generate_content(system_prompt)
        response_text = response.text

        # 3. Save Bot Response
        bot_msg = {
            "text": response_text,
            "sender": "bot",
            "timestamp": firestore.SERVER_TIMESTAMP,
            "jobs": [j for j in found_jobs] # Store found jobs in the message
        }
        session_ref.collection("messages").add(bot_msg)

        return ChatResponse(
            response=response_text,
            jobs=[JobResult(**j) for j in found_jobs],
            intent=intent,
            sessionId=session_id
        )

    except Exception as e:
        import traceback
        print(f"Error in chat_query: {str(e)}")
        print(traceback.format_exc())
        return ChatResponse(
            response=f"Error processing request: {str(e)}", # Specific error for debugging
            intent="error",
            sessionId=session_id if 'session_id' in locals() else ""
        )

@router.get("/health")
async def health_check():
    models = []
    try:
        if GEMINI_API_KEY:
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    models.append(m.name)
    except Exception as e:
        models = [f"Error listing models: {str(e)}"]

    return {
        "status": "healthy", 
        "gemini_connected": bool(GEMINI_API_KEY),
        "available_models": models
    }
