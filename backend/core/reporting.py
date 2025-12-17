import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

import socket

class ForceIPv4:
    def __enter__(self):
        self._original_getaddrinfo = socket.getaddrinfo
        socket.getaddrinfo = self._get_addrinfo
        return self

    def __exit__(self, *args):
        socket.getaddrinfo = self._original_getaddrinfo

    def _get_addrinfo(self, host, port, family=0, type=0, proto=0, flags=0):
        # Force the address family to AF_INET (IPv4)
        return self._original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)

def send_email_report(job_count: int, job_titles: list, receiver_email: str = "yenaby3@gmail.com"):
    """
    Sends an email report about the collected jobs.
    """
    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASS")
    
    # Try to load from secrets if not in env
    if not sender_email or not sender_password:
        try:
            from core.secrets import EMAIL_USER, EMAIL_PASS
            if not sender_email: sender_email = EMAIL_USER
            if not sender_password: sender_password = EMAIL_PASS
        except ImportError:
            pass

    if not sender_email or not sender_password:
        logging.warning("EMAIL_USER or EMAIL_PASS not set in environment or core.secrets. Skipping email report.")
        return False

    subject = f"RizqaAI Report: {job_count} Jobs Collected"
    
    body = f"Successfully collected {job_count} jobs at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}.\n\n"
    body += "Job Titles:\n"
    if job_titles:
        for title in job_titles:
            body += f"- {title}\n"
    else:
        body += "No titles found.\n"
    
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    # Use the ForceIPv4 context manager to ensure we only use IPv4
    # This fixes [Errno 101] Network is unreachable on some IPv6-enabled environments (like Railway)
    with ForceIPv4():
        try:
            # Try SSL first (Port 465)
            logging.info("Attempting to send email via SMTP_SSL (Port 465)...")
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(sender_email, sender_password)
                server.send_message(msg)
            logging.info(f"Email report sent successfully to {receiver_email}")
            return True
        except OSError as e:
            # Fallback to STARTTLS (Port 587) if 465 is blocked
            logging.warning(f"Port 465 failed ({e}). Retrying with STARTTLS (Port 587)...")
            try:
                with smtplib.SMTP('smtp.gmail.com', 587) as server:
                    server.starttls()
                    server.login(sender_email, sender_password)
                    server.send_message(msg)
                logging.info(f"Email report sent successfully via (Port 587) to {receiver_email}")
                return True
            except Exception as e2:
                 logging.error(f"Failed to send email report via fallback (Port 587): {e2}")
                 return False
        except Exception as e:
            logging.error(f"Failed to send email report: {e}")
            return False
