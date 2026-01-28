from fastapi import Header, HTTPException, Depends
from firebase_admin import auth, firestore
from core.firebase import db

async def get_current_user(authorization: str = Header(...)):
    """
    Validates Firebase ID token from Authorization header.
    Format: "Bearer <token>"
    """
    try:
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header format")
        
        token = authorization.split("Bearer ")[1]
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {str(e)}")

async def verify_admin(user: dict = Depends(get_current_user)):
    """
    Verifies that the user has the 'admin' role in Firestore.
    """
    uid = user['uid']
    
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        user_doc = db.collection("users").document(uid).get()
        if not user_doc.exists:
             raise HTTPException(status_code=403, detail="User profile not found")
        
        user_data = user_doc.to_dict()
        role = user_data.get("role")
        
        if role != "admin":
            raise HTTPException(status_code=403, detail="Access denied: Admin role required")
            
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authorization check failed: {str(e)}")
