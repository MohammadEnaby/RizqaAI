from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
from typing import Optional, List
import json

router = APIRouter()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class ChatMessage(BaseModel):
    message: str
    userId: Optional[str] = None

class JobResult(BaseModel):
    title: str
    company: str
    location: str
    salary: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    jobs: List[JobResult] = []
    intent: str = "general"

@router.post("/query", response_model=ChatResponse)
async def chat_query(request: ChatMessage):
    """
    Process user's chat message with Gemini AI and return intelligent response
    """
    try:
        if not GEMINI_API_KEY:
            return ChatResponse(
                response="AI features are currently unavailable. Please configure Gemini API key.",
                intent="error"
            )

        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-pro')

        # Create context-aware prompt for job-related queries
        system_context = """You are an intelligent job search assistant for JobScout platform. 
        Your role is to help users find jobs, understand salary information, and learn about companies.
        
        When answering:
        - Be concise and friendly
        - If asked about specific jobs, provide clear details
        - For salary queries, give realistic ranges
        - For company questions, provide helpful insights
        - Always be positive and encouraging
        
        Database Context: You have access to a job database with:
        - Job titles, companies, locations, salaries
        - Skills and requirements
        - Remote/onsite information
        - Application deadlines
        
        If the user query is about finding jobs, extracting specific information, or needs database data,
        respond naturally but indicate what data would be retrieved.
        """

        # Combine context with user message
        full_prompt = f"{system_context}\n\nUser Query: {request.message}\n\nResponse:"

        # Get response from Gemini
        response = model.generate_content(full_prompt)

        # Parse intent (simple keyword matching for now)
        message_lower = request.message.lower()
        intent = "general"
        
        if any(word in message_lower for word in ["find", "search", "show", "get", "list"]):
            intent = "search"
        elif any(word in message_lower for word in ["salary", "pay", "compensation", "wage"]):
            intent = "salary"
        elif any(word in message_lower for word in ["company", "employer", "organization"]):
            intent = "company"

        # Mock job results (integrate with actual database later)
        mock_jobs = []
        if intent == "search" and any(word in message_lower for word in ["python", "developer", "engineer"]):
            mock_jobs = [
                JobResult(
                    title="Senior Python Developer",
                    company="Tech Corp",
                    location="Jerusalem",
                    salary="₪20,000-25,000/month"
                ),
                JobResult(
                    title="Full Stack Engineer",
                    company="StartupXYZ",
                    location="Tel Aviv (Remote)",
                    salary="₪18,000-22,000/month"
                )
            ]

        return ChatResponse(
            response=response.text,
            jobs=mock_jobs,
            intent=intent
        )

    except Exception as e:
        print(f"Error in chat_query: {str(e)}")
        return ChatResponse(
            response="I apologize, but I encountered an error processing your request. Please try again.",
            intent="error"
        )

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "gemini_configured": bool(GEMINI_API_KEY)
    }
