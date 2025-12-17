from google.cloud.firestore_v1.base_query import FieldFilter
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import google.generativeai as genai
import os
from typing import Optional, List, Dict, Any
from datetime import datetime
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
    company: str
    location: str
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
    Returns dict: {'keywords': str, 'location': str, 'intent': 'search'|'general'}
    """
    if not GEMINI_API_KEY:
        return {"intent": "general"}
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        prompt = f"""
        Analyze this job search query and extract structured filters.
        Output ONLY valid JSON.
        
        Query: "{user_query}"
        
        Keys:
        - intent: "search" if user is looking for a job, else "general"
        - keywords: job titles, skills, or roles (e.g. "waiter", "python developer")
        - location: city or region (e.g. "Jerusalem", "Tel Aviv")
        
        JSON:
        """
        response = model.generate_content(prompt)
        text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(text)
    except Exception as e:
        print(f"Filter extraction failed: {e}")
        return {"intent": "general"}

def search_jobs_in_db(filters: dict) -> List[dict]:
    """
    Searches Firestore 'jobs' collection based on filters.
    Performs in-memory filtering on recent jobs to avoid complex indexes.
    """
    database = get_db()
    jobs_ref = database.collection("jobs")
    
    # optimize: fetch last 100 jobs (most recent)
    # Ideally we'd use a composite index, but to avoid setup issues we fetch and filter.
    docs = jobs_ref.order_by("post_time", direction=firestore.Query.DESCENDING).limit(50).stream()
    
    found_jobs = []
    keywords = filters.get("keywords", "").lower()
    location = filters.get("location", "").lower()
    
    for doc in docs:
        data = doc.to_dict()
        title = data.get("job_title", "").lower()
        if not title: continue
        
        # Simple match logic
        match_score = 0
        if keywords and keywords in title:
            match_score += 2
        elif keywords and any(k in title for k in keywords.split()):
            match_score += 1
            
        if location and location in data.get("location", "").lower():
            match_score += 1
            
        # If no specific filters, maybe show recent? No, only show if match or if intent is vague but asking for jobs.
        # Strict mode: must match at least one if filters exist
        if (keywords and match_score == 0) and (location and location not in data.get("location", "").lower()):
            continue

        if match_score > 0 or (not keywords and not location):
            # Map to JobResult structure
            found_jobs.append({
                "id": doc.id,
                "title": data.get("job_title"),
                "company": data.get("company", "Unknown"), # Schema might not have company, use Source/Group?
                "location": data.get("location", "Not specified"),
                "salary": data.get("wage_per_hour", "Not specified"),
                "link": data.get("post_link") or data.get("contact_info")
            })
            
    return found_jobs[:5] # Return top 5

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
        
        found_jobs = []
        if intent == "search":
            found_jobs = search_jobs_in_db(analysis)
            print(f"DEBUG: Found {len(found_jobs)} jobs for query '{request.message}'")

        # 2. Generate AI Response with Context
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        jobs_context = ""
        if found_jobs:
            jobs_context = "I found these relevant jobs in the database:\n"
            for job in found_jobs:
                jobs_context += f"- {job['title']} at {job['location']} (Pay: {job['salary']})\n"
        elif intent == "search":
            jobs_context = "I searched the database but found no exact matches. Advise the user to try broader keywords or different locations."

        system_prompt = f"""
        You are an intelligent job assistant for JobScout.
        
        User Query: "{request.message}"
        
        Search Intent: {intent}
        Search Filters Extracted: {analysis}
        
        Database Results:
        {jobs_context}
        
        Instructions:
        1. If jobs were found, present them enthusiastically. Summarize why they match.
        2. If NO jobs were found but intent was search, explain that you checked but couldn't find exact matches. Suggest how to search better (e.g. "Try saying 'Waiter in Jerusalem' or 'Python Developer'").
        3. If intent is 'general', answer the user's question helpfully.
        4. Always be encouraging and brief.
        5. remind the user that he can ask for a specific job title or location.
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
            response="Error processing request.",
            intent="error",
            sessionId=session_id if 'session_id' in locals() else ""
        )

@router.get("/health")
async def health_check():
    return {"status": "healthy", "gemini": bool(GEMINI_API_KEY)}
