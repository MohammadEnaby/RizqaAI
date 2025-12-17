import os
import sys
import json

# Add backend root to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(current_dir)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

try:
    from core.secrets import facebook_cookies
    
    output_path = os.path.join(backend_root, "Data", "cookies.json")
    
    print(f"[*] Loaded {len(facebook_cookies)} cookies from secrets.py")
    
    with open(output_path, "w") as f:
        json.dump(facebook_cookies, f, indent=4)
        
    print(f"[+] Successfully initialized {output_path}")
    
except ImportError:
    print("[!] Could not import core.secrets. Please ensure secrets.py exists.")
except Exception as e:
    print(f"[!] Error: {e}")
