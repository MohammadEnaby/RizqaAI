import os
import sys
import google.generativeai as genai

# Add backend to path to find secrets
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from core.secrets import API_KEY_Gimini
    os.environ["GEMINI_API_KEY"] = "AIzaSyBXNHcrbbJIggISSGukf-5XYMyUJx03eXQ"
except ImportError:
    pass

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # Try hardcoded path if env var fails
    print("No API key found in env, checking secrets directly...")

if api_key:
    genai.configure(api_key=api_key)
    print("Listing available models...")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("No API Key configured.")
