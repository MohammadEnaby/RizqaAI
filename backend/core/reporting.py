import os
import logging
from datetime import datetime
import resend

def send_email_report(job_count: int, job_titles: list, receiver_email: str = "yenaby3@gmail.com"):
    """
    Sends an email report about the collected jobs using Resend.
    """

    api_key = os.getenv("RESEND_API")
    
    if not api_key:
        try:
            from core.secrets import RESEND_API
            api_key = RESEND_API
        except ImportError:
            pass

    if not api_key:
        logging.warning("RESEND_API not set in environment or core.secrets. Skipping email report.")
        return False

    resend.api_key = api_key

    subject = f"RizqaAI Report: {job_count} Jobs Collected"
    
    # Simple text body for now, can be upgraded to HTML
    body = f"Successfully collected {job_count} jobs at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}.\n\n"
    body += "Job Titles:\n"
    if job_titles:
        for title in job_titles:
            body += f"- {title}\n"
    else:
        body += "No titles found.\n"

    # Use a default sender if not configured. 
    # Note: Resend requires a verified domain or use of onboarding@resend.dev for testing.
    sender_email = os.getenv("EMAIL_USER", "onboarding@resend.dev")

    params = {
        "from": f"RizqaAI <{sender_email}>",
        "to": [receiver_email],
        "subject": subject,
        "text": body,
    }

    try:
        email = resend.Emails.send(params)
        logging.info(f"Email report sent successfully using Resend. ID: {email.get('id')}")
        return True
    except Exception as e:
        logging.error(f"Failed to send email report via Resend: {e}")
        return False
