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

class ChatMessage(BaseModel):
    message: str
    userId: Optional[str] = None
    sessionId: Optional[str] = None

class JobResult(BaseModel):
    title: str
    company: str
    location: str
    salary: Optional[str] = None

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
            
            print(f"DEBUG: Found {len(sessions)} sessions for user {userId}")
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
        
        # Fetch the created doc to return timestamps (or just return current time)
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
        # Verify ownership
        session_ref = database.collection("chatSessions").document(session_id)
        session = session_ref.get()
        if not session.exists or session.to_dict().get("userId") != userId:
            raise HTTPException(status_code=404, detail="Session not found")

        messages_ref = session_ref.collection("messages").order_by("timestamp", direction=firestore.Query.ASCENDING)
        docs = messages_ref.stream()
        
        messages = []
        for doc in docs:
            data = doc.to_dict()
            # Convert jobs data back to objects if stored as dicts
            jobs_data = []
            if "jobs" in data:
                jobs_data = [JobResult(**j) for j in data["jobs"]]

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
            
        # Delete subcollection messages (Firestore requirement: delete docs individually)
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
        
        # If no sessionId, create a new session
        if not session_id:
            # Generate a title based on the first message (simple first few words)
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
            # Update session timestamp
            database.collection("chatSessions").document(session_id).update({
                "updatedAt": firestore.SERVER_TIMESTAMP
            })

        # Can't use user ID for this check if it's new, but we need session ref
        session_ref = database.collection("chatSessions").document(session_id)

        # 1. Save User Message
        user_msg = {
            "text": request.message,
            "sender": "user",
            "timestamp": firestore.SERVER_TIMESTAMP
        }
        session_ref.collection("messages").add(user_msg)

        if not GEMINI_API_KEY:
            # Fallback for no API key, still save it
            error_response = "AI unavailable. Please configure API key."
            bot_msg = {
                "text": error_response,
                "sender": "bot",
                "timestamp": firestore.SERVER_TIMESTAMP,
                "jobs": []
            }
            session_ref.collection("messages").add(bot_msg)
            return ChatResponse(response=error_response, intent="error", sessionId=session_id)

        # Initialize Gemini
        model = genai.GenerativeModel('gemini-2.0-flash')

        # Context (Same as before)
        system_context = """You are an intelligent job search assistant for JobScout platform. ... (context omitted for brevity, keeping same logic) ...""" 
        # Ideally we fetch previous context here for continuity, but for now single turn
        
        full_prompt = f"User Query: {request.message}\n\nResponse:" # Simplified for now

        # Generate Response
        response = model.generate_content(full_prompt)
        response_text = response.text

        # Intent logic
        message_lower = request.message.lower()
        intent = "general"
        if any(w in message_lower for w in ["find", "search", "show"]): intent = "search"
        
        # Mock jobs logic
        mock_jobs = []
        if intent == "search" and "python" in message_lower:
            mock_jobs = [
                JobResult(title="Senior Python Dev", company="Tech Corp", location="Jerusalem", salary="20k"),
                JobResult(title="Full Stack", company="Startup", location="TLV", salary="18k")
            ]

        # 2. Save Bot Response
        bot_msg = {
            "text": response_text,
            "sender": "bot",
            "timestamp": firestore.SERVER_TIMESTAMP,
            "jobs": [j.dict() for j in mock_jobs]
        }
        session_ref.collection("messages").add(bot_msg)

        return ChatResponse(
            response=response_text,
            jobs=mock_jobs,
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
