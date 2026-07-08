from flask import Blueprint, request, jsonify, session
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from routes.db import get_db_connection, return_db_connection
from utils.sanitise import sanitize_text, sanitize_email
import os

contact_bp = Blueprint('contact', __name__)

# SMTP credentials from environment
BREVO_SMTP_USERNAME = os.environ.get("BREVO_SMTP_USERNAME")
BREVO_SMTP_PASSWORD = os.environ.get("BREVO_SMTP_PASSWORD")
BREVO_SMTP_SERVER = os.environ.get("BREVO_SMTP_SERVER", "smtp-relay.brevo.com")
BREVO_SMTP_PORT = int(os.environ.get("BREVO_SMTP_PORT", 587))
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "info@greymatterschool.co.za")

def log_activity(user_id, action, details, ip_address, user_agent):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, action, details, ip_address, user_agent))
        conn.commit()
    finally:
        cursor.close()
        return_db_connection(conn)

@contact_bp.route("/contact", methods=["POST"])
def contact():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    data = request.get_json()
    
    # SANITIZE INPUTS
    name = sanitize_text(data.get('name', ''), max_length=100)
    email = sanitize_email(data.get('email', ''))
    message = sanitize_text(data.get('message', ''), max_length=5000)
    
    user_id = session.get('user_id')
    
    if not name or not email or not message:
        log_activity(user_id, "contact_failed", f"Missing fields - name: {bool(name)}, email: {bool(email)}, message: {bool(message)}", ip, ua)
        return jsonify({"error": "All fields are required"}), 400
    
    # Additional validation
    if len(name) < 2:
        log_activity(user_id, "contact_failed", "Name too short", ip, ua)
        return jsonify({"error": "Name must be at least 2 characters"}), 400
    
    if len(message) < 10:
        log_activity(user_id, "contact_failed", "Message too short", ip, ua)
        return jsonify({"error": "Message must be at least 10 characters"}), 400
    
    # Validate Brevo credentials
    if not BREVO_SMTP_USERNAME or not BREVO_SMTP_PASSWORD:
        log_activity(user_id, "contact_failed", "Brevo credentials not configured", ip, ua)
        return jsonify({"error": "Email service not configured"}), 500
    
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = SENDER_EMAIL  # Send to yourself
        msg['Subject'] = f"Contact Form: {name}"
        msg['Reply-To'] = email
        
        body = f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}"
        msg.attach(MIMEText(body, 'plain'))
        
        # Use Brevo SMTP with timeout
        server = smtplib.SMTP(BREVO_SMTP_SERVER, BREVO_SMTP_PORT, timeout=10)
        server.starttls()
        server.login(BREVO_SMTP_USERNAME, BREVO_SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        log_activity(user_id, "contact_success", f"Contact form submitted by {name} ({email})", ip, ua)
        return jsonify({"success": True, "message": "Email sent successfully"}), 200
        
    except smtplib.SMTPAuthenticationError as e:
        log_activity(user_id, "contact_failed", f"SMTP Authentication error: {str(e)}", ip, ua)
        return jsonify({"error": "Email service authentication failed"}), 500
    except smtplib.SMTPException as e:
        log_activity(user_id, "contact_failed", f"SMTP error: {str(e)}", ip, ua)
        return jsonify({"error": "Failed to send email"}), 500
    except Exception as e:
        log_activity(user_id, "contact_failed", f"Email error: {str(e)}", ip, ua)
        print(f"Email error: {e}")
        return jsonify({"error": "Failed to send email"}), 500

@contact_bp.route("/feedback", methods=["POST"])
def submit_feedback():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    data = request.get_json()
    
    user_id = session.get('user_id')
    exercise_id = data.get('exercise_id')
    rating = data.get('rating')
    feedback = data.get('feedback', '')
    score = data.get('score')
    total_questions = data.get('total_questions')
    time_taken_seconds = data.get('time_taken_seconds')
    
    if not rating or rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400
    
    # Sanitize feedback text
    feedback = sanitize_text(feedback, max_length=1000) if feedback else None
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO user_feedback (user_id, exercise_id, rating, feedback, score, total_questions, time_taken_seconds, ip_address, user_agent)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (user_id, exercise_id, rating, feedback, score, total_questions, time_taken_seconds, ip, ua))
        
        conn.commit()
        
        log_activity(user_id, "feedback_submitted", f"Rated exercise {exercise_id}: {rating}/5", ip, ua)
        
        return jsonify({"success": True}), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)