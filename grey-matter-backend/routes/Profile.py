from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection
from routes.Extensions import limiter
import os
from utils.sanitise import sanitize_text, sanitize_username, sanitize_bio

# Get the absolute path to the backend directory (fixed - now goes up one more level)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads', 'avatars')

profile_bp = Blueprint('profile', __name__)

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

@profile_bp.route("/profile", methods=["GET"])
def get_profile():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    # Check if user is logged in
    if 'user_id' not in session:
        log_activity(None, "profile_view_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch user data from database (added is_admin)
    cursor.execute("""
        SELECT first_name, last_name, username, bio, avatar, phone, country, is_admin
        FROM users 
        WHERE user_id = %s
    """, (user_id,))
    
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        conn.close()
        log_activity(user_id, "profile_view_failed", "User not found", ip, ua)
        return jsonify({"error": "User not found"}), 404
    
    first_name, last_name, username, bio, avatar, phone, country, is_admin = user
    
    # Fetch user stats from user_progress
    cursor.execute("""
        SELECT COUNT(*) as total_exercises, 
               COALESCE(AVG(percentage), 0) as avg_score,
               COALESCE(AVG(time_taken_seconds), 0) as avg_time
        FROM user_progress 
        WHERE user_id = %s
    """, (user_id,))
    
    stats = cursor.fetchone()
    total_exercises = stats[0] or 0
    average_score = round(stats[1], 2) if stats[1] else 0
    average_time = int(stats[2]) if stats[2] else 0
    
    # Format average time as minutes:seconds
    avg_time_formatted = f"{average_time // 60}:{average_time % 60:02d}" if average_time > 0 else "0:00"
    
    # Fetch saved notes from user_notes
    cursor.execute("""
        SELECT un.note_text, un.created_at, e.exercise_title
        FROM user_notes un
        JOIN exercises e ON un.exercise_id = e.exercise_id
        WHERE un.user_id = %s 
        ORDER BY un.created_at DESC 
        LIMIT 10
    """, (user_id,))
    notes_rows = cursor.fetchall()
    
    saved_notes = []
    for note in notes_rows:
        saved_notes.append({
            "note": note[0],
            "exercise_title": note[2],
            "created_at": note[1].strftime("%Y-%m-%d %H:%M") if note[1] else None
        })
    
    # Fetch recent activities from user_progress joined with exercises
    cursor.execute("""
        SELECT e.exercise_title, up.score, up.total_questions, up.completed_at 
        FROM user_progress up
        JOIN exercises e ON up.exercise_id = e.exercise_id
        WHERE up.user_id = %s 
        ORDER BY up.completed_at DESC 
        LIMIT 10
    """, (user_id,))
    activities_rows = cursor.fetchall()
    
    recent_activities = []
    for activity in activities_rows:
        exercise_title, score, total_questions, completed_at = activity
        action = f"{exercise_title} - Score: {score}/{total_questions}"
        recent_activities.append({
            "action": action,
            "created_at": completed_at.strftime("%Y-%m-%d %H:%M") if completed_at else None
        })
    
    cursor.close()
    conn.close()
    
    log_activity(user_id, "profile_view", f"Profile viewed - {total_exercises} exercises completed", ip, ua)
    
    return jsonify({
        "first_name": first_name or "",
        "last_name": last_name or "",
        "username": username or "",
        "bio": bio or "",
        "avatar": avatar or "",
        "phone": phone or "",
        "country": country or "",
        "is_admin": is_admin or False,
        "total_exercises": total_exercises,
        "average_score": average_score,
        "average_time": avg_time_formatted,
        "saved_notes": saved_notes,
        "recent_activities": recent_activities
    }), 200

@profile_bp.route("/profile/edit", methods=["POST"])
def edit_profile():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    # Check if user is logged in
    if 'user_id' not in session:
        log_activity(None, "profile_edit_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    
    # Get form data and SANITIZE
    bio = sanitize_bio(request.form.get("bio", ""), max_length=500)
    username = sanitize_username(request.form.get("username", ""), max_length=50)
    first_name = sanitize_text(request.form.get("first_name", ""), max_length=50)
    last_name = sanitize_text(request.form.get("last_name", ""), max_length=50)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    updated_fields = []
    
    # Validate username if provided
    if username:
        if len(username) < 3:
            cursor.close()
            conn.close()
            log_activity(user_id, "profile_edit_failed", f"Username too short: {username}", ip, ua)
            return jsonify({"error": "Username must be at least 3 characters"}), 400
        
        # Check if username already taken by another user
        cursor.execute("SELECT user_id FROM users WHERE username = %s AND user_id != %s", (username, user_id))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            log_activity(user_id, "profile_edit_failed", f"Username already taken: {username}", ip, ua)
            return jsonify({"error": "Username already taken"}), 400
        
        cursor.execute("UPDATE users SET username = %s WHERE user_id = %s", (username, user_id))
        updated_fields.append(f"username={username}")
    
    # Validate bio if provided
    if bio:
        if len(bio.strip()) < 5:
            cursor.close()
            conn.close()
            log_activity(user_id, "profile_edit_failed", "Bio too short", ip, ua)
            return jsonify({"error": "Bio must be at least 5 characters"}), 400
        cursor.execute("UPDATE users SET bio = %s WHERE user_id = %s", (bio.strip(), user_id))
        updated_fields.append("bio_updated")
    
    # Update first name and last name if provided
    if first_name:
        cursor.execute("UPDATE users SET first_name = %s WHERE user_id = %s", (first_name, user_id))
        updated_fields.append(f"first_name={first_name}")
    if last_name:
        cursor.execute("UPDATE users SET last_name = %s WHERE user_id = %s", (last_name, user_id))
        updated_fields.append(f"last_name={last_name}")
    
    conn.commit()
    cursor.close()
    conn.close()
    
    log_activity(user_id, "profile_edit_success", f"Updated: {', '.join(updated_fields)}", ip, ua)
    
    return jsonify({"success": True, "message": "Profile updated successfully"}), 200

@profile_bp.route("/profile/avatar", methods=["POST"])
def update_avatar():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    # Check if user is logged in
    if 'user_id' not in session:
        log_activity(None, "avatar_update_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    
    # Check if file was uploaded
    if 'avatar' not in request.files:
        log_activity(user_id, "avatar_update_failed", "No file uploaded", ip, ua)
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['avatar']
    
    if file.filename == '':
        log_activity(user_id, "avatar_update_failed", "No file selected", ip, ua)
        return jsonify({"error": "No file selected"}), 400
    
    # Validate file type
    allowed_extensions = {'.png', '.jpg', '.jpeg', '.gif'}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        log_activity(user_id, "avatar_update_failed", f"Invalid file type: {ext}", ip, ua)
        return jsonify({"error": "Invalid file type. Use PNG, JPG, JPEG, or GIF"}), 400
    
    # Sanitize filename to prevent path traversal
    safe_filename = os.path.basename(file.filename)
    safe_filename = sanitize_text(safe_filename, max_length=100).replace(' ', '_')
    
    # Create uploads folder using absolute path
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    # Generate unique filename (fixed - removed extra underscore)
    new_filename = f"user_{user_id}_avatar{ext}"
    save_path = os.path.join(UPLOAD_FOLDER, new_filename)
    
    # Save file
    file.save(save_path)
    
    # Store path in database (relative URL for browser access)
    db_path = f"/uploads/avatars/{new_filename}"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET avatar = %s WHERE user_id = %s", (db_path, user_id))
    conn.commit()
    cursor.close()
    conn.close()
    
    log_activity(user_id, "avatar_update_success", f"Uploaded avatar: {db_path}", ip, ua)
    
    return jsonify({"success": True, "avatar": db_path}), 200

# ============================================================
# BATCH ENDPOINTS
# ============================================================

@profile_bp.route("/profile/batch-stats", methods=["GET"])
@limiter.limit("30 per minute")
def batch_profile_stats():
    """Get profile, stats, notes, and activities in one request"""
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get user data
    cursor.execute("""
        SELECT first_name, last_name, username, bio, avatar, phone, country, is_admin
        FROM users WHERE user_id = %s
    """, (user_id,))
    
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        conn.close()
        return jsonify({"error": "User not found"}), 404
    
    first_name, last_name, username, bio, avatar, phone, country, is_admin = user
    
    # Get stats
    cursor.execute("""
        SELECT COUNT(*) as total_exercises, 
               COALESCE(AVG(percentage), 0) as avg_score,
               COALESCE(AVG(time_taken_seconds), 0) as avg_time
        FROM user_progress WHERE user_id = %s
    """, (user_id,))
    
    stats = cursor.fetchone()
    total_exercises = stats[0] or 0
    average_score = round(stats[1], 2) if stats[1] else 0
    average_time = int(stats[2]) if stats[2] else 0
    avg_time_formatted = f"{average_time // 60}:{average_time % 60:02d}" if average_time > 0 else "0:00"
    
    # Get saved notes
    cursor.execute("""
        SELECT un.note_text, un.created_at, e.exercise_title
        FROM user_notes un
        JOIN exercises e ON un.exercise_id = e.exercise_id
        WHERE un.user_id = %s 
        ORDER BY un.created_at DESC LIMIT 10
    """, (user_id,))
    
    notes_rows = cursor.fetchall()
    saved_notes = []
    for note in notes_rows:
        saved_notes.append({
            "note": note[0],
            "exercise_title": note[2],
            "created_at": note[1].strftime("%Y-%m-%d %H:%M") if note[1] else None
        })
    
    # Get recent activities
    cursor.execute("""
        SELECT e.exercise_title, up.score, up.total_questions, up.completed_at 
        FROM user_progress up
        JOIN exercises e ON up.exercise_id = e.exercise_id
        WHERE up.user_id = %s 
        ORDER BY up.completed_at DESC LIMIT 10
    """, (user_id,))
    
    activities_rows = cursor.fetchall()
    recent_activities = []
    for activity in activities_rows:
        exercise_title, score, total_questions, completed_at = activity
        recent_activities.append({
            "action": f"{exercise_title} - Score: {score}/{total_questions}",
            "created_at": completed_at.strftime("%Y-%m-%d %H:%M") if completed_at else None
        })
    
    cursor.close()
    conn.close()
    
    log_activity(user_id, "batch_profile_stats", "Fetched batch profile stats", ip, ua)
    
    return jsonify({
        "user": {
            "first_name": first_name or "",
            "last_name": last_name or "",
            "username": username or "",
            "bio": bio or "",
            "avatar": avatar or "",
            "phone": phone or "",
            "country": country or "",
            "is_admin": is_admin or False
        },
        "stats": {
            "total_exercises": total_exercises,
            "average_score": average_score,
            "average_time": avg_time_formatted
        },
        "saved_notes": saved_notes,
        "recent_activities": recent_activities
    }), 200

@profile_bp.route("/profile/batch-avatars", methods=["POST"])
@limiter.limit("20 per minute")
def batch_get_avatars():
    """Get avatars for multiple users in one request"""
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    data = request.get_json()
    user_ids = data.get('user_ids', [])
    
    if not user_ids:
        return jsonify({"error": "No user IDs provided"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT user_id, avatar, username
        FROM users
        WHERE user_id = ANY(%s)
    """, (user_ids,))
    
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    
    avatars = {}
    for user_id, avatar, username in results:
        avatars[user_id] = {
            "avatar": avatar or "",
            "username": username
        }
    
    log_activity(user_id, "batch_avatars_fetched", f"Fetched avatars for {len(user_ids)} users", ip, ua)
    
    return jsonify({
        "avatars": avatars
    }), 200