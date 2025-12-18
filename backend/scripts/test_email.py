import sys
import os
import logging

# Add backend directory to path so we can import core modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.reporting import send_email_report

# Configure logging to show info
logging.basicConfig(level=logging.INFO)

def test_email():
    print("Testing Resend Email Integration...")
    
    # Fake job data
    job_count = 3
    job_titles = ["Software Engineer", "Data Scientist", "Product Manager"]
    
    # Attempt to send email
    success = send_email_report(job_count, job_titles)
    
    if success:
        print("\u2705 Email sent successfully!")
    else:
        print("\u274c Failed to send email. Check logs for details.")

if __name__ == "__main__":
    test_email()
