from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection, return_db_connection
from routes.Extensions import limiter
from datetime import datetime, timedelta
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

admin_users_bp = Blueprint('admin_users', __name__)

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

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

def admin_required():
    if 'user_id' not in session:
        return False
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT is_admin FROM users WHERE user_id = %s", (session['user_id'],))
        result = cursor.fetchone()
        return result and result[0]
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_users_bp.route("/admin/users", methods=["GET"])
@limiter.limit("30 per minute")
def get_users():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_users_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_users_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT user_id, email, first_name, last_name, username, is_admin, is_verified, created_at, last_login
            FROM users
            ORDER BY user_id
        """)
        
        users = cursor.fetchall()
        
        user_list = []
        for user in users:
            user_list.append({
                "user_id": user[0],
                "email": user[1],
                "first_name": user[2] or "",
                "last_name": user[3] or "",
                "username": user[4] or "",
                "is_admin": user[5],
                "is_verified": user[6],
                "created_at": user[7].strftime("%Y-%m-%d %H:%M") if user[7] else None,
                "last_login": user[8].strftime("%Y-%m-%d %H:%M") if user[8] else None
            })
        
        log_activity(session['user_id'], "admin_users_view", f"Viewed {len(user_list)} users", ip, ua)
        
        return jsonify({"users": user_list}), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_users_bp.route("/admin/users/<int:user_id>/role", methods=["PUT"])
@limiter.limit("20 per minute")
def update_user_role(user_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_role_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_role_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    data = request.get_json()
    is_admin = data.get('is_admin', False)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET is_admin = %s WHERE user_id = %s", (is_admin, user_id))
        conn.commit()
        
        log_activity(session['user_id'], "admin_role_update", f"User {user_id} admin set to {is_admin}", ip, ua)
        
        return jsonify({"success": True}), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_users_bp.route("/admin/users/<int:user_id>/verify", methods=["PUT"])
@limiter.limit("20 per minute")
def verify_user(user_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_verify_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_verify_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    data = request.get_json()
    is_verified = data.get('is_verified', False)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET is_verified = %s WHERE user_id = %s", (is_verified, user_id))
        conn.commit()
        
        log_activity(session['user_id'], "admin_verify_user", f"User {user_id} verified set to {is_verified}", ip, ua)
        
        return jsonify({"success": True}), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_users_bp.route("/admin/users/<int:user_id>/reset-password", methods=["POST"])
@limiter.limit("10 per minute")
def admin_reset_password(user_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_reset_password_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_reset_password_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT email FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            log_activity(session['user_id'], "admin_reset_password_failed", f"User {user_id} not found", ip, ua)
            return jsonify({"error": "User not found"}), 404
        
        email = user[0]
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        reset_token_expires = datetime.now() + timedelta(hours=1)
        
        cursor.execute("UPDATE users SET reset_token = %s, reset_token_expires = %s WHERE user_id = %s", 
                       (reset_token, reset_token_expires, user_id))
        conn.commit()
    finally:
        cursor.close()
        return_db_connection(conn)
    
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    
    try:
        # Use Brevo SMTP from environment
        smtp_server = os.environ.get("BREVO_SMTP_SERVER", "smtp-relay.brevo.com")
        smtp_port = int(os.environ.get("BREVO_SMTP_PORT", 587))
        smtp_username = os.environ.get("BREVO_SMTP_USERNAME")
        smtp_password = os.environ.get("BREVO_SMTP_PASSWORD")
        sender_email = os.environ.get("SENDER_EMAIL", "info@greymatterschool.co.za")
        
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = email
        msg['Subject'] = "Password Reset Request"
        
        body = f"""Hello,

An administrator has requested a password reset for your Grey Matter account.

Click the link below to reset your password (valid for 1 hour):

{reset_link}

If you did not request this, please ignore this email.

Regards,
Grey Matter Team"""
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        
        log_activity(session['user_id'], "admin_reset_password", f"Sent reset link to {email}", ip, ua)
    except Exception as e:
        log_activity(session['user_id'], "admin_reset_password_failed", f"Email error for {email}: {str(e)}", ip, ua)
        print(f"Email error: {e}")
    
    return jsonify({"success": True}), 200

@admin_users_bp.route("/admin/users/<int:user_id>/activity", methods=["GET"])
@limiter.limit("30 per minute")
def get_user_activity(user_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_view_activity_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_view_activity_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT action, details, created_at 
            FROM activity_logs 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT 50
        """, (user_id,))
        
        activities = cursor.fetchall()
        
        activity_list = []
        for act in activities:
            activity_list.append({
                "action": act[0],
                "details": act[1],
                "created_at": act[2].strftime("%Y-%m-%d %H:%M") if act[2] else None
            })
        
        log_activity(session['user_id'], "admin_view_activity", f"Viewed activity for user {user_id}", ip, ua)
        
        return jsonify({"activities": activity_list}), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_users_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
@limiter.limit("10 per minute")
def delete_user(user_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_delete_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_delete_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    if user_id == session['user_id']:
        log_activity(session['user_id'], "admin_delete_failed", "Attempted self-deletion", ip, ua)
        return jsonify({"error": "Cannot delete your own account"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM user_progress WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM user_notes WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM activity_logs WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
        conn.commit()
        
        log_activity(session['user_id'], "admin_delete_user", f"Deleted user {user_id}", ip, ua)
        
        return jsonify({"success": True}), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_users_bp.route("/admin/users/<int:user_id>/details", methods=["GET"])
@limiter.limit("30 per minute")
def get_user_details(user_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_user_details_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_user_details_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT user_id, email, first_name, last_name, username, bio, avatar, phone, country,
                   is_admin, is_verified, is_active, created_at, last_login, updated_at
            FROM users
            WHERE user_id = %s
        """, (user_id,))
        
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "user_id": user[0],
            "email": user[1],
            "first_name": user[2] or "",
            "last_name": user[3] or "",
            "username": user[4] or "",
            "bio": user[5] or "",
            "avatar": user[6] or "",
            "phone": user[7] or "",
            "country": user[8] or "",
            "is_admin": user[9],
            "is_verified": user[10],
            "is_active": user[11],
            "created_at": user[12].strftime("%Y-%m-%d %H:%M") if user[12] else None,
            "last_login": user[13].strftime("%Y-%m-%d %H:%M") if user[13] else None,
            "updated_at": user[14].strftime("%Y-%m-%d %H:%M") if user[14] else None
        }), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_users_bp.route("/admin/users/<int:user_id>/activate", methods=["PUT"])
@limiter.limit("20 per minute")
def toggle_user_active(user_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_activate_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_activate_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    if user_id == session['user_id']:
        return jsonify({"error": "Cannot deactivate your own account"}), 400
    
    data = request.get_json()
    is_active = data.get('is_active', False)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET is_active = %s WHERE user_id = %s", (is_active, user_id))
        conn.commit()
        
        log_activity(session['user_id'], "admin_activate_user", f"User {user_id} active set to {is_active}", ip, ua)
        
        return jsonify({"success": True}), 200
    finally:
        cursor.close()
        return_db_connection(conn)