from flask import Blueprint, jsonify, request, session
from email_validator import validate_email, EmailNotValidError
from password_validator import PasswordValidator
from routes.db import get_db_connection, return_db_connection
import bcrypt
import phonenumbers
import os  
from datetime import datetime
from utils.sanitise import sanitize_text, sanitize_username, sanitize_email, sanitize_bio, sanitize_phone

settings_bp = Blueprint('settings', __name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads', 'avatars')

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

@settings_bp.route("/changePassword", methods=["POST"])
def changePassword():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    # Check if user is logged in
    if 'user_id' not in session:
        log_activity(None, "change_password_failed", "Not logged in attempt", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session["user_id"]
    
    # Get form data (no sanitization needed for passwords - they are hashed)
    current_password = request.form.get('current_password')
    new_password = request.form.get('new_password')
    
    # Validate both passwords provided
    if not current_password or not new_password:
        log_activity(user_id, "change_password_failed", "Missing current or new password", ip, ua)
        return jsonify({"error": "Both current and new password are required"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT password_hash FROM users WHERE user_id = %s", (user_id,))
        result = cursor.fetchone()
        
        # Check if user exists
        if not result:
            log_activity(user_id, "change_password_failed", "User not found in database", ip, ua)
            return jsonify({"error": "User not found"}), 404
        
        stored_hash = result[0]
        
        # Validate new password strength
        schema = PasswordValidator().min(8).has().uppercase().has().lowercase().has().digits()
        errors = []
        if not schema.validate(new_password):
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
            
            log_activity(user_id, "change_password_failed", f"Weak password attempt - rules failed: {errors}", ip, ua)
            return jsonify({
                "error": "Password does not meet requirements",
                "failed_rules": errors
            }), 400
        
        # Verify current password matches stored hash
        if not bcrypt.checkpw(current_password.encode('utf-8'), stored_hash.encode('utf-8')):
            log_activity(user_id, "change_password_failed", "Incorrect current password provided", ip, ua)
            return jsonify({"error": "Current password is incorrect"}), 401
        
        # Hash the new password
        new_hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        
        # Update database
        cursor.execute("UPDATE users SET password_hash = %s, updated_at = NOW() WHERE user_id = %s", (new_hashed.decode('utf-8'), user_id))
        conn.commit()
        
        log_activity(user_id, "change_password_success", "Password changed successfully", ip, ua)
        return jsonify({"success": True, "message": "Password changed successfully"}), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)

@settings_bp.route('/deleteAccount', methods=['POST'])
def deleteAccount():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "delete_account_failed", "Not logged in attempt", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get user email for logging before deletion
        cursor.execute("SELECT email FROM users WHERE user_id = %s", (user_id,))
        user_result = cursor.fetchone()
        user_email = user_result[0] if user_result else "unknown"
        
        # Delete related records in the correct order (child tables first)
        cursor.execute("DELETE FROM user_progress WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM user_notes WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM activity_logs WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM admin_logs WHERE admin_id = %s", (user_id,))
        
        # Then delete the user
        cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
        conn.commit()
        
        # Log before clearing session
        log_activity(user_id, "delete_account_success", f"Account for {user_email} permanently deleted", ip, ua)
        
        # Clear session
        session.pop('user_id', None)
        
        return jsonify({"success": True, "message": "Account deleted successfully"}), 200
    except Exception as e:
        conn.rollback()
        log_activity(user_id, "delete_account_failed", f"Error during deletion: {str(e)}", ip, ua)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_db_connection(conn)
        
@settings_bp.route('/updateEmail', methods=['POST'])
def updateEmail():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "update_email_failed", "Not logged in attempt", ip, ua)
        return jsonify({'error': 'Not logged in'}), 401
    
    user_id = session['user_id']
    
    # SANITIZE EMAIL
    new_email = sanitize_email(request.form.get('email', ''))
    
    if not new_email:
        log_activity(user_id, "update_email_failed", "No email provided", ip, ua)
        return jsonify({"error": "Email is required"}), 400
    
    try:
        valid = validate_email(new_email)
        new_email = valid.email
    except EmailNotValidError as e:
        log_activity(user_id, "update_email_failed", f"Invalid email format: {new_email}", ip, ua)
        return jsonify({"error": str(e)}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT user_id FROM users WHERE email = %s AND user_id != %s", (new_email, user_id))
        if cursor.fetchone():
            log_activity(user_id, "update_email_failed", f"Email already in use: {new_email}", ip, ua)
            return jsonify({"error": "Email already in use"}), 400
        
        cursor.execute("UPDATE users SET email = %s, updated_at = NOW() WHERE user_id = %s", (new_email, user_id))
        conn.commit()
        
        log_activity(user_id, "update_email_success", f"Email changed to {new_email}", ip, ua)
        return jsonify({"success": True, "email": new_email}), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)

@settings_bp.route('/changeUsername', methods=['POST'])
def changeUsername():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "change_username_failed", "Not logged in attempt", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session["user_id"]
    
    # SANITIZE USERNAME
    new_username = sanitize_username(request.form.get("username", ""), max_length=50)
    
    if not new_username or len(new_username) < 3:
        log_activity(user_id, "change_username_failed", f"Username too short: {new_username}", ip, ua)
        return jsonify({"error": "Username must be at least 3 characters"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT user_id FROM users WHERE username = %s AND user_id != %s", (new_username, user_id))
        if cursor.fetchone():
            log_activity(user_id, "change_username_failed", f"Username already taken: {new_username}", ip, ua)
            return jsonify({"error": "Username already taken"}), 400
        
        cursor.execute("UPDATE users SET username = %s, updated_at = NOW() WHERE user_id = %s", (new_username, user_id))
        conn.commit()
        
        log_activity(user_id, "change_username_success", f"Username changed to {new_username}", ip, ua)
        return jsonify({"success": True, "username": new_username}), 200
    except Exception as e:
        log_activity(user_id, "change_username_failed", f"Database error: {str(e)}", ip, ua)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_db_connection(conn)

@settings_bp.route("/editAvatar", methods=["POST"])
def editAvatar():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "edit_avatar_failed", "Not logged in attempt", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    
    if 'avatar' not in request.files:
        log_activity(user_id, "edit_avatar_failed", "No file in request", ip, ua)
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['avatar']
    
    if file.filename == '':
        log_activity(user_id, "edit_avatar_failed", "Empty filename", ip, ua)
        return jsonify({"error": "No file selected"}), 400
    
    allowed_extensions = {'.png', '.jpg', '.jpeg', '.gif'}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        log_activity(user_id, "edit_avatar_failed", f"Invalid file type: {ext}", ip, ua)
        return jsonify({"error": "Invalid file type. Use PNG, JPG, JPEG, or GIF"}), 400
    
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    new_filename = f"user_{user_id}_avatar_{int(datetime.now().timestamp())}{ext}"
    save_path = os.path.join(UPLOAD_FOLDER, new_filename)
    file.save(save_path)
    
    db_path = f"/uploads/avatars/{new_filename}"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("UPDATE users SET avatar = %s, updated_at = NOW() WHERE user_id = %s", (db_path, user_id))
        conn.commit()
        
        log_activity(user_id, "edit_avatar_success", f"Avatar uploaded: {db_path}", ip, ua)
        return jsonify({"success": True, "avatar": db_path}), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@settings_bp.route("/updateInfo", methods=["POST"])
def updateInfo():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if "user_id" not in session:
        log_activity(None, "update_info_failed", "Not logged in attempt", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    
    # SANITIZE INPUTS
    f_name = sanitize_text(request.form.get("first_name", ""), max_length=50)
    l_name = sanitize_text(request.form.get("last_name", ""), max_length=50)
    bio = sanitize_bio(request.form.get("bio", ""), max_length=500)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        updated_fields = []
        if f_name:
            cursor.execute("UPDATE users SET first_name = %s WHERE user_id = %s", (f_name, user_id))
            updated_fields.append(f"first_name={f_name}")
        if l_name:
            cursor.execute("UPDATE users SET last_name = %s WHERE user_id = %s", (l_name, user_id))
            updated_fields.append(f"last_name={l_name}")
        if bio:
            cursor.execute("UPDATE users SET bio = %s WHERE user_id = %s", (bio, user_id))
            updated_fields.append(f"bio={bio[:50]}...")
        
        cursor.execute("UPDATE users SET updated_at = NOW() WHERE user_id = %s", (user_id,))
        conn.commit()
        
        log_activity(user_id, "update_info_success", f"Updated: {', '.join(updated_fields) if updated_fields else 'nothing'}", ip, ua)
        return jsonify({"success": True, "message": "Profile updated"}), 200
    except Exception as e:
        log_activity(user_id, "update_info_failed", f"Database error: {str(e)}", ip, ua)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_db_connection(conn)

@settings_bp.route("/updatePhoneNumber", methods=['POST'])
def updatePhoneNumber():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "update_phone_failed", "Not logged in attempt", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    
    # SANITIZE PHONE NUMBER
    phone = sanitize_phone(request.form.get("phone", ""))
    
    if not phone:
        log_activity(user_id, "update_phone_failed", "No phone number provided", ip, ua)
        return jsonify({"error": "Phone number is required"}), 400
    
    try:
        parsed = phonenumbers.parse(phone, None)
        
        if not phonenumbers.is_valid_number(parsed):
            log_activity(user_id, "update_phone_failed", f"Invalid phone number: {phone}", ip, ua)
            return jsonify({"error": "Invalid phone number"}), 400
        
        formatted_phone = phonenumbers.format_number(
            parsed, phonenumbers.PhoneNumberFormat.E164
        )
        
        country_code = phonenumbers.region_code_for_number(parsed)
        
    except Exception as e:
        log_activity(user_id, "update_phone_failed", f"Phone parsing error: {str(e)}", ip, ua)
        return jsonify({"error": f"Invalid phone number: {str(e)}"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "UPDATE users SET phone = %s, country = %s, updated_at = NOW() WHERE user_id = %s",
            (formatted_phone, country_code, user_id)
        )
        conn.commit()
        
        log_activity(user_id, "update_phone_success", f"Phone updated to {formatted_phone} (country: {country_code})", ip, ua)
        return jsonify({"success": True, "message": "Phone number updated"}), 200
    except Exception as e:
        log_activity(user_id, "update_phone_failed", f"Database error: {str(e)}", ip, ua)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_db_connection(conn)