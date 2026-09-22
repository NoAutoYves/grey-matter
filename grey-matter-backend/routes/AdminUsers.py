from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection, return_db_connection
from routes.Extensions import limiter
from datetime import datetime, timedelta
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import threading

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


def send_email_in_background(to_email, subject, body, log_context=None):
    def _send():
        try:
            smtp_server = os.environ.get("BREVO_SMTP_SERVER", "smtp-relay.brevo.com")
            smtp_port = int(os.environ.get("BREVO_SMTP_PORT", 587))
            smtp_username = os.environ.get("BREVO_SMTP_USERNAME")
            smtp_password = os.environ.get("BREVO_SMTP_PASSWORD")
            sender_email = os.environ.get("SENDER_EMAIL", "info@greymatterschool.co.za")

            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP(smtp_server, smtp_port, timeout=15)
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
            server.quit()
        except Exception as e:
            print(f"[email] Failed to send to {to_email} ({log_context}): {e}", flush=True)

    t = threading.Thread(target=_send, daemon=True)
    t.start()


@admin_users_bp.route("/admin/users", methods=["GET"])
@limiter.limit("120 per minute")
def get_users():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')

    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    if not admin_required():
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

        return jsonify({
            "users": [
                {
                    "user_id": u[0],
                    "email": u[1],
                    "first_name": u[2] or "",
                    "last_name": u[3] or "",
                    "username": u[4] or "",
                    "is_admin": u[5],
                    "is_verified": u[6],
                    "created_at": u[7].strftime("%Y-%m-%d %H:%M") if u[7] else None,
                    "last_login": u[8].strftime("%Y-%m-%d %H:%M") if u[8] else None
                } for u in users
            ]
        }), 200
    finally:
        cursor.close()
        return_db_connection(conn)


@admin_users_bp.route("/admin/users/<int:user_id>/role", methods=["PUT"])
@limiter.limit("20 per minute")
def update_user_role(user_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json() or {}
    is_admin = data.get('is_admin', False)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET is_admin = %s WHERE user_id = %s", (is_admin, user_id))
        conn.commit()
        return jsonify({"success": True}), 200
    finally:
        cursor.close()
        return_db_connection(conn)


@admin_users_bp.route("/admin/users/<int:user_id>/verify", methods=["PUT"])
@limiter.limit("20 per minute")
def verify_user(user_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json() or {}
    is_verified = data.get('is_verified', False)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET is_verified = %s WHERE user_id = %s", (is_verified, user_id))
        conn.commit()
        return jsonify({"success": True}), 200
    finally:
        cursor.close()
        return_db_connection(conn)


@admin_users_bp.route("/admin/users/<int:user_id>/reset-password", methods=["POST"])
@limiter.limit("10 per minute")
def admin_reset_password(user_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT email FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
        email = user[0]

        reset_token = secrets.token_urlsafe(32)
        reset_token_expires = datetime.now() + timedelta(hours=1)

        cursor.execute(
            "UPDATE users SET reset_token = %s, reset_token_expires = %s WHERE user_id = %s",
            (reset_token, reset_token_expires, user_id)
        )
        conn.commit()
    finally:
        cursor.close()
        return_db_connection(conn)

    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    body = f"""Hello,

An administrator has requested a password reset for your Grey Matter account.

Click the link below to reset your password (valid for 1 hour):

{reset_link}

If you did not request this, please ignore this email.

Regards,
Grey Matter Team"""

    send_email_in_background(
        to_email=email,
        subject="Password Reset Request",
        body=body,
        log_context=f"admin_reset_password user_id={user_id}"
    )

    return jsonify({"success": True}), 200


@admin_users_bp.route("/admin/users/<int:user_id>/activity", methods=["GET"])
@limiter.limit("120 per minute")
def get_user_activity(user_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    if not admin_required():
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
        return jsonify({
            "activities": [
                {
                    "action": a[0],
                    "details": a[1],
                    "created_at": a[2].strftime("%Y-%m-%d %H:%M") if a[2] else None
                } for a in activities
            ]
        }), 200
    finally:
        cursor.close()
        return_db_connection(conn)


@admin_users_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
@limiter.limit("10 per minute")
def delete_user(user_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403
    if user_id == session['user_id']:
        return jsonify({"error": "Cannot delete your own account"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT email FROM users WHERE user_id = %s", (user_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "User not found"}), 404
        user_email = row[0]

        cursor.execute("DELETE FROM user_feedback WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM user_progress WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM user_notes WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM activity_logs WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM admin_logs WHERE target_user_id = %s", (user_id,))
        cursor.execute("DELETE FROM email_queue WHERE to_email = %s", (user_email,))
        cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
        conn.commit()

        return jsonify({"success": True}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_db_connection(conn)