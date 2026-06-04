from flask import Blueprint, request, jsonify, session
from datetime import timedelta, datetime
import bcrypt
import secrets
import os
from routes.db import get_db_connection
from email_validator import validate_email, EmailNotValidError
from password_validator import PasswordValidator
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from routes.Extensions import limiter, csrf
from utils.sanitise import sanitize_text, sanitize_email, sanitize_username

auth_bp = Blueprint('auth', __name__)

# Hardcoded for production - DO NOT USE IPs
FRONTEND_URL = "https://greymatterschool.co.za"

# SMTP credentials - use environment variables for security
BREVO_SMTP_USERNAME = os.environ.get("BREVO_SMTP_USERNAME")
BREVO_SMTP_PASSWORD = os.environ.get("BREVO_SMTP_PASSWORD")
BREVO_SMTP_SERVER = os.environ.get("BREVO_SMTP_SERVER", "smtp-relay.brevo.com")
BREVO_SMTP_PORT = int(os.environ.get("BREVO_SMTP_PORT", 587))
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "info@greymatterschool.co.za")

password_schema = PasswordValidator()
password_schema \
    .min(8) \
    .max(100) \
    .has().uppercase() \
    .has().lowercase() \
    .has().digits() \
    .has().no().spaces()

def log_activity(user_id, action, details, ip_address, user_agent):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
        VALUES (%s, %s, %s, %s, %s)
    """, (user_id, action, details, ip_address, user_agent))
    conn.commit()
    cursor.close()
    conn.close()

@auth_bp.route("/signup", methods=["POST"])
@limiter.limit("3 per hour")
@limiter.limit("10 per day")
@csrf.exempt
def signup():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    data = request.json
    
    # SANITIZE INPUTS
    first_name = sanitize_text(data.get("first_name", ""), max_length=50)
    last_name = sanitize_text(data.get("last_name", ""), max_length=50)
    email = sanitize_email(data.get("email", ""))
    password = data.get("password")
    confirm_password = data.get("confirm_password")
    agree = data.get("privacy_p")
    username = sanitize_username(data.get("username") or email.split('@')[0] if email else "", max_length=50)

    if not first_name or not last_name or not email or not password:
        log_activity(None, "signup_failed", "Missing required fields", ip, ua)
        return jsonify({"error": "All fields are required"}), 400

    try:
        valid = validate_email(email)
        email = valid.email  
    except EmailNotValidError as e:
        log_activity(None, "signup_failed", f"Invalid email: {email}", ip, ua)
        return jsonify({"error": str(e)}), 400

    if password != confirm_password:
        log_activity(None, "signup_failed", f"Password mismatch for {email}", ip, ua)
        return jsonify({"error": "Passwords do not match"}), 400

    if not agree:
        log_activity(None, "signup_failed", f"Privacy policy not accepted for {email}", ip, ua)
        return jsonify({"error": "Privacy policy must be accepted"}), 400
        
    errors = []
    if not password_schema.validate(password):
        if len(password) < 8:
            errors.append("min length 8")
        if len(password) > 100:
            errors.append("max length 100")
        if not any(c.isupper() for c in password):
            errors.append("uppercase required")
        if not any(c.islower() for c in password):
            errors.append("lowercase required")
        if not any(c.isdigit() for c in password):
            errors.append("digit required")
        if " " in password:
            errors.append("no spaces allowed")

        log_activity(None, "signup_failed", f"Weak password for {email}", ip, ua)
        return jsonify({
            "error": "Password does not meet requirements",
            "failed_rules": errors
        }), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    existing = cursor.fetchone()

    if existing:
        cursor.close()
        conn.close()
        log_activity(None, "signup_failed", f"Email already exists: {email}", ip, ua)
        return jsonify({"error": "Email already exists"}), 400
    
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    cursor.execute("""
        INSERT INTO users (email, first_name, last_name, password_hash, username)
        VALUES (%s, %s, %s, %s, %s) RETURNING user_id
    """, (email, first_name, last_name, hashed.decode('utf-8'), username))
    
    user_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()

    log_activity(user_id, "signup_success", f"User created with email {email}", ip, ua)
    return jsonify({"message": "User created successfully", "user_id": user_id}), 201

@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
@limiter.limit("20 per hour")
@csrf.exempt
def login():   
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    try:
        email = sanitize_email(request.form.get("email", ""))
        password = request.form.get("password")
        remember = request.form.get("remember") == "on"

        if not email or not password:
            log_activity(None, "login_failed", "Missing email or password", ip, ua)
            return jsonify({"error": "Email and password required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT user_id, password_hash, email FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            log_activity(None, "login_failed", f"User not found: {email}", ip, ua)
            return jsonify({"error": "Invalid email or password"}), 401

        user_id, hashed_pw, email = user

        if bcrypt.checkpw(password.encode('utf-8'), hashed_pw.encode('utf-8')):
            if remember:
                session.permanent = True
                session.permanent_session_lifetime = timedelta(days=30)
            else:
                session.permanent = False
            
            session['user_id'] = user_id
            log_activity(user_id, "login_success", f"User {email} logged in", ip, ua)
            return jsonify({"message": "Login successful", "user_id": user_id, "email": email}), 200
        else:
            log_activity(None, "login_failed", f"Invalid password for {email}", ip, ua)
            return jsonify({"error": "Invalid email or password"}), 401
        
    except Exception:
        import traceback
        traceback.print_exc()
        log_activity(None, "login_error", "Server error", ip, ua)
        return jsonify({"error": "Server error"}), 500
            
@auth_bp.route("/logout", methods=["POST"])
@csrf.exempt
def logout():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    user_id = session.get('user_id')
    
    if user_id:
        log_activity(user_id, "logout", "User logged out", ip, ua)
    
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

@auth_bp.route("/forgot-password", methods=["POST"])
@limiter.limit("3 per hour")
@limiter.limit("10 per day")
@csrf.exempt
def forgot_password():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    email = sanitize_email(request.form.get("email", ""))
    
    if not email:
        log_activity(None, "forgot_password_failed", "No email provided", ip, ua)
        return jsonify({"error": "Email is required"}), 400
    
    try:
        valid = validate_email(email)
        email = valid.email
    except EmailNotValidError as e:
        log_activity(None, "forgot_password_failed", f"Invalid email format: {email}", ip, ua)
        return jsonify({"error": str(e)}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        conn.close()
        log_activity(None, "forgot_password_request", f"Email not found: {email}", ip, ua)
        return jsonify({"message": "If an account exists, a reset link will be sent"}), 200
    
    user_id = user[0]
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    reset_token_expires = datetime.now() + timedelta(hours=1)
    
    cursor.execute("""
        UPDATE users 
        SET reset_token = %s, reset_token_expires = %s 
        WHERE user_id = %s
    """, (reset_token, reset_token_expires, user_id))
    conn.commit()
    cursor.close()
    conn.close()
    
    # Use HARDCODED frontend URL (no IPs)
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    
    log_activity(user_id, "forgot_password_request", f"Reset token generated for {email}", ip, ua)
    
    try:
        smtp_server = BREVO_SMTP_SERVER
        smtp_port = BREVO_SMTP_PORT
        smtp_username = BREVO_SMTP_USERNAME
        smtp_password = BREVO_SMTP_PASSWORD
        sender_email = SENDER_EMAIL
        
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = email
        msg['Subject'] = "Reset Your Grey Matter Password"
        
        body = f"""Hello,

You requested to reset your password for your Grey Matter account.

Click the link below to reset your password (valid for 1 hour):

{reset_link}

If you did not request this, please ignore this email.

Regards,
Grey Matter Team"""
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        
        log_activity(user_id, "reset_email_sent", f"Reset email sent to {email}", ip, ua)
        
    except Exception as e:
        log_activity(user_id, "reset_email_failed", f"Failed to send email to {email}: {str(e)}", ip, ua)
        print(f"Email error: {e}")
    
    return jsonify({"message": "If an account exists, a reset link will be sent"}), 200

@auth_bp.route("/reset-password", methods=["POST"])
@limiter.limit("5 per hour")
@csrf.exempt
def reset_password():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("new_password")
    confirm_password = data.get("confirm_password")
    
    if not token or not new_password or not confirm_password:
        log_activity(None, "reset_password_failed", "Missing fields", ip, ua)
        return jsonify({"error": "All fields are required"}), 400
    
    if new_password != confirm_password:
        log_activity(None, "reset_password_failed", "Password mismatch", ip, ua)
        return jsonify({"error": "Passwords do not match"}), 400
    
    errors = []
    if not password_schema.validate(new_password):
        if len(new_password) < 8:
            errors.append("min length 8")
        if len(new_password) > 100:
            errors.append("max length 100")
        if not any(c.isupper() for c in new_password):
            errors.append("uppercase required")
        if not any(c.islower() for c in new_password):
            errors.append("lowercase required")
        if not any(c.isdigit() for c in new_password):
            errors.append("digit required")
        if " " in new_password:
            errors.append("no spaces allowed")
        
        log_activity(None, "reset_password_failed", "Weak password attempt", ip, ua)
        return jsonify({
            "error": "Password does not meet requirements",
            "failed_rules": errors
        }), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT user_id FROM users 
        WHERE reset_token = %s AND reset_token_expires > NOW()
    """, (token,))
    
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        conn.close()
        log_activity(None, "reset_password_failed", "Invalid or expired token", ip, ua)
        return jsonify({"error": "Invalid or expired reset token"}), 400
    
    user_id = user[0]
    
    hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    
    cursor.execute("""
        UPDATE users 
        SET password_hash = %s, reset_token = NULL, reset_token_expires = NULL
        WHERE user_id = %s
    """, (hashed.decode('utf-8'), user_id))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    log_activity(user_id, "reset_password_success", "Password reset successfully", ip, ua)
    return jsonify({"message": "Password reset successfully"}), 200

@auth_bp.route("/check-session", methods=["GET"])
def check_session():
    if "user_id" in session:
        return jsonify({"authenticated": True, "user_id": session["user_id"]}), 200
    else:
        return jsonify({"authenticated": False}), 401

@auth_bp.route("/check-admin", methods=["GET"])
def check_admin():
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session["user_id"]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT is_admin FROM users WHERE user_id = %s", (user_id,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    
    is_admin = result[0] if result else False
    return jsonify({"is_admin": is_admin}), 200