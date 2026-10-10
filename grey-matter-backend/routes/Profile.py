from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection, return_db_connection
from routes.Extensions import limiter
import os
from datetime import datetime
from utils.sanitise import sanitize_text, sanitize_username, sanitize_bio

# Get the absolute path to the backend directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads', 'avatars')

profile_bp = Blueprint('profile', __name__)

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

@profile_bp.route("/profile", methods=["GET"])
def get_profile():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')

    if 'user_id' not in session:
        log_activity(None, "profile_view_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401

    user_id = session['user_id']

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT first_name, last_name, username, bio, avatar, phone, country, is_admin, grade
            FROM users
            WHERE user_id = %s
        """, (user_id,))

        user = cursor.fetchone()

        if not user:
            log_activity(user_id, "profile_view_failed", "User not found", ip, ua)
            return jsonify({"error": "User not found"}), 404

        first_name, last_name, username, bio, avatar, phone, country, is_admin, user_grade = user

        cursor.execute("""
            SELECT
                COUNT(*) as total_exercises,
                COALESCE(AVG(percentage), 0) as avg_score,
                COALESCE(AVG(time_taken_seconds), 0) as avg_time
            FROM (
                SELECT DISTINCT ON (exercise_id)
                    exercise_id,
                    percentage,
                    time_taken_seconds
                FROM user_progress
                WHERE user_id = %s
                ORDER BY exercise_id, completed_at DESC
            ) as latest_attempts
        """, (user_id,))

        stats = cursor.fetchone()
        total_exercises = stats[0] or 0
        average_score = round(stats[1], 2) if stats[1] else 0
        average_time = int(stats[2]) if stats[2] else 0

        avg_time_formatted = f"{average_time // 60}:{average_time % 60:02d}" if average_time > 0 else "0:00"

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

        cursor.execute("""
            SELECT
                e.exercise_title,
                up.score,
                up.total_questions,
                up.completed_at,
                e.exercise_id,
                e.topic_id,
                g.grade_level,
                s.subject_name
            FROM user_progress up
            JOIN exercises e ON up.exercise_id = e.exercise_id
            JOIN topics t ON e.topic_id = t.topic_id
            JOIN grades g ON t.grade_id = g.grade_id
            JOIN subjects s ON t.subject_id = s.subject_id
            WHERE up.user_id = %s
            ORDER BY up.completed_at DESC
            LIMIT 10
        """, (user_id,))

        activities_rows = cursor.fetchall()

        recent_activities = []
        for activity in activities_rows:
            exercise_title, score, total_questions, completed_at, exercise_id, topic_id, grade_level, subject_name = activity
            action = f"{exercise_title} - Score: {score}/{total_questions}"
            recent_activities.append({
                "action": action,
                "created_at": completed_at.strftime("%Y-%m-%d %H:%M") if completed_at else None,
                "exercise_id": exercise_id,
                "topic_id": topic_id,
                "grade": grade_level,
                "subject": subject_name,
                "exercise_title": exercise_title,
                "score": score,
                "total_questions": total_questions
            })

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
            "grade": user_grade,
            "total_exercises": total_exercises,
            "average_score": average_score,
            "average_time": avg_time_formatted,
            "saved_notes": saved_notes,
            "recent_activities": recent_activities
        }), 200

    finally:
        cursor.close()
        return_db_connection(conn)

@profile_bp.route("/profile/edit", methods=["POST"])
def edit_profile():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')

    if 'user_id' not in session:
        log_activity(None, "profile_edit_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401

    user_id = session['user_id']

    bio = sanitize_bio(request.form.get("bio", ""), max_length=500)
    username = sanitize_username(request.form.get("username", ""), max_length=50)
    first_name = sanitize_text(request.form.get("first_name", ""), max_length=50)
    last_name = sanitize_text(request.form.get("last_name", ""), max_length=50)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        updated_fields = []

        if username:
            if len(username) < 3:
                log_activity(user_id, "profile_edit_failed", f"Username too short: {username}", ip, ua)
                return jsonify({"error": "Username must be at least 3 characters"}), 400

            cursor.execute("SELECT user_id FROM users WHERE username = %s AND user_id != %s", (username, user_id))
            if cursor.fetchone():
                log_activity(user_id, "profile_edit_failed", f"Username already taken: {username}", ip, ua)
                return jsonify({"error": "Username already taken"}), 400

            cursor.execute("UPDATE users SET username = %s WHERE user_id = %s", (username, user_id))
            updated_fields.append(f"username={username}")

        if bio:
            if len(bio.strip()) < 5:
                log_activity(user_id, "profile_edit_failed", "Bio too short", ip, ua)
                return jsonify({"error": "Bio must be at least 5 characters"}), 400
            cursor.execute("UPDATE users SET bio = %s WHERE user_id = %s", (bio.strip(), user_id))
            updated_fields.append("bio_updated")

        if first_name:
            cursor.execute("UPDATE users SET first_name = %s WHERE user_id = %s", (first_name, user_id))
            updated_fields.append(f"first_name={first_name}")
        if last_name:
            cursor.execute("UPDATE users SET last_name = %s WHERE user_id = %s", (last_name, user_id))
            updated_fields.append(f"last_name={last_name}")

        conn.commit()

        log_activity(user_id, "profile_edit_success", f"Updated: {', '.join(updated_fields)}", ip, ua)

        return jsonify({"success": True, "message": "Profile updated successfully"}), 200

    finally:
        cursor.close()
        return_db_connection(conn)

@profile_bp.route("/profile/avatar", methods=["POST"])
def update_avatar():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')

    if 'user_id' not in session:
        log_activity(None, "avatar_update_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401

    user_id = session['user_id']

    if 'avatar' not in request.files:
        log_activity(user_id, "avatar_update_failed", "No file uploaded", ip, ua)
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['avatar']

    if file.filename == '':
        log_activity(user_id, "avatar_update_failed", "No file selected", ip, ua)
        return jsonify({"error": "No file selected"}), 400

    allowed_extensions = {'.png', '.jpg', '.jpeg', '.gif'}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        log_activity(user_id, "avatar_update_failed", f"Invalid file type: {ext}", ip, ua)
        return jsonify({"error": "Invalid file type. Use PNG, JPG, JPEG, or GIF"}), 400

    safe_filename = os.path.basename(file.filename)
    safe_filename = sanitize_text(safe_filename, max_length=100).replace(' ', '_')

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    new_filename = f"user_{user_id}_avatar{ext}"
    save_path = os.path.join(UPLOAD_FOLDER, new_filename)

    file.save(save_path)

    db_path = f"/uploads/avatars/{new_filename}"

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("UPDATE users SET avatar = %s WHERE user_id = %s", (db_path, user_id))
        conn.commit()

        log_activity(user_id, "avatar_update_success", f"Uploaded avatar: {db_path}", ip, ua)

        return jsonify({"success": True, "avatar": db_path}), 200

    finally:
        cursor.close()
        return_db_connection(conn)

# 
# BATCH ENDPOINTS
# 

@profile_bp.route("/profile/batch-stats", methods=["GET"])
@limiter.limit("120 per minute")
def batch_profile_stats():
    """Get profile, stats, notes, and activities in one request"""
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')

    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user_id = session['user_id']

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT first_name, last_name, username, bio, avatar, phone, country, is_admin, grade
            FROM users WHERE user_id = %s
        """, (user_id,))

        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        first_name, last_name, username, bio, avatar, phone, country, is_admin, user_grade = user

        cursor.execute("""
            SELECT
                COUNT(*) as total_exercises,
                COALESCE(AVG(percentage), 0) as avg_score,
                COALESCE(AVG(time_taken_seconds), 0) as avg_time
            FROM (
                SELECT DISTINCT ON (exercise_id)
                    exercise_id,
                    percentage,
                    time_taken_seconds
                FROM user_progress
                WHERE user_id = %s
                ORDER BY exercise_id, completed_at DESC
            ) as latest_attempts
        """, (user_id,))

        stats = cursor.fetchone()
        total_exercises = stats[0] or 0
        average_score = round(stats[1], 2) if stats[1] else 0
        average_time = int(stats[2]) if stats[2] else 0
        avg_time_formatted = f"{average_time // 60}:{average_time % 60:02d}" if average_time > 0 else "0:00"

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

        cursor.execute("""
            SELECT
                e.exercise_title,
                up.score,
                up.total_questions,
                up.completed_at,
                e.exercise_id,
                e.topic_id,
                g.grade_level,
                s.subject_name
            FROM user_progress up
            JOIN exercises e ON up.exercise_id = e.exercise_id
            JOIN topics t ON e.topic_id = t.topic_id
            JOIN grades g ON t.grade_id = g.grade_id
            JOIN subjects s ON t.subject_id = s.subject_id
            WHERE up.user_id = %s
            ORDER BY up.completed_at DESC
            LIMIT 10
        """, (user_id,))

        activities_rows = cursor.fetchall()
        recent_activities = []
        for activity in activities_rows:
            exercise_title, score, total_questions, completed_at, exercise_id, topic_id, grade_level, subject_name = activity
            recent_activities.append({
                "action": f"{exercise_title} - Score: {score}/{total_questions}",
                "created_at": completed_at.strftime("%Y-%m-%d %H:%M") if completed_at else None,
                "exercise_id": exercise_id,
                "topic_id": topic_id,
                "grade": grade_level,
                "subject": subject_name,
                "exercise_title": exercise_title,
                "score": score,
                "total_questions": total_questions
            })

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
                "is_admin": is_admin or False,
                "grade": user_grade
            },
            "stats": {
                "total_exercises": total_exercises,
                "average_score": average_score,
                "average_time": avg_time_formatted
            },
            "saved_notes": saved_notes,
            "recent_activities": recent_activities
        }), 200

    finally:
        cursor.close()
        return_db_connection(conn)

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

    try:
        cursor.execute("""
            SELECT user_id, avatar, username
            FROM users
            WHERE user_id = ANY(%s)
        """, (user_ids,))

        results = cursor.fetchall()

        avatars = {}
        for uid, avatar, username in results:
            avatars[uid] = {
                "avatar": avatar or "",
                "username": username
            }

        log_activity(session['user_id'], "batch_avatars_fetched", f"Fetched avatars for {len(user_ids)} users", ip, ua)

        return jsonify({
            "avatars": avatars
        }), 200

    finally:
        cursor.close()
        return_db_connection(conn)

@profile_bp.route("/profile/grade", methods=["GET"])
@limiter.limit("120 per minute")
def get_user_grade():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT grade FROM users WHERE user_id = %s", (session['user_id'],))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"grade": row[0]}), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@profile_bp.route("/profile/grade", methods=["POST"])
@limiter.limit("20 per minute")
def update_user_grade():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json() or {}
    grade = data.get("grade")

    if grade is not None:
        try:
            grade = int(grade)
        except (ValueError, TypeError):
            return jsonify({"error": "Grade must be an integer"}), 400
        if grade < 1 or grade > 12:
            return jsonify({"error": "Grade must be between 1 and 12"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET grade = %s WHERE user_id = %s", (grade, session['user_id']))
        conn.commit()
        return jsonify({"success": True, "grade": grade}), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@profile_bp.route("/profile/report-card", methods=["GET"])
@limiter.limit("60 per minute")
def get_report_card():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user_id = session['user_id']
    current_year = datetime.now().year

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT subject_id, subject_name FROM subjects "
            "WHERE is_active = TRUE ORDER BY display_order, subject_name"
        )
        all_subjects = cursor.fetchall()

        # Fetch user's name, grade, and their ordinal in signup order.
        # Ordinal drives the sheet number without exposing user_id.
        cursor.execute("""
            SELECT first_name, last_name, username, grade,
                   (SELECT COUNT(*) FROM users u2 WHERE u2.user_id <= u1.user_id) AS ordinal
            FROM users u1
            WHERE user_id = %s
        """, (user_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "User not found"}), 404
        student_name = f"{row[0] or ''} {row[1] or ''}".strip() or (row[2] or "Student")
        user_grade = row[3]
        ordinal = row[4] or 1
        sheet_no = f"{current_year}-{ordinal:04d}"

        # Per subject, per month, average score across all exercises that month.
        cursor.execute("""
            SELECT
                e.subject_id,
                EXTRACT(MONTH FROM up.completed_at)::int AS month,
                AVG(up.percentage) AS avg_score
            FROM user_progress up
            JOIN exercises e ON up.exercise_id = e.exercise_id
            WHERE up.user_id = %s
              AND EXTRACT(YEAR FROM up.completed_at) = %s
            GROUP BY e.subject_id, EXTRACT(MONTH FROM up.completed_at)
        """, (user_id, current_year))
        monthly_rows = cursor.fetchall()

        subject_buckets = {}
        for subj_id, month, avg in monthly_rows:
            term = ((month - 1) // 3) + 1   # 1..4
            subject_buckets.setdefault(subj_id, {1: [], 2: [], 3: [], 4: []})
            subject_buckets[subj_id][term].append(float(avg))

        def grade_letter(pct):
            if pct is None: return None
            if pct >= 80: return "A"
            if pct >= 70: return "B"
            if pct >= 60: return "C"
            if pct >= 50: return "D"
            if pct >= 40: return "E"
            if pct >= 30: return "F"
            return "G"

        subjects_out = []
        overall_scores = []

        for subj_id, subj_name in all_subjects:
            if subj_id not in subject_buckets:
                subjects_out.append({
                    "subject_id": subj_id,
                    "subject_name": subj_name,
                    "enrolled": False,
                    "terms": {1: None, 2: None, 3: None, 4: None},
                    "average": None,
                    "grade": None,
                })
                continue

            terms = {}
            term_avgs = []
            for t in (1, 2, 3, 4):
                bucket = subject_buckets[subj_id][t]
                if bucket:
                    avg = sum(bucket) / len(bucket)
                    terms[t] = round(avg, 1)
                    term_avgs.append(avg)
                else:
                    terms[t] = None

            subj_avg = round(sum(term_avgs) / len(term_avgs), 1) if term_avgs else None
            if subj_avg is not None:
                overall_scores.append(subj_avg)

            subjects_out.append({
                "subject_id": subj_id,
                "subject_name": subj_name,
                "enrolled": True,
                "terms": terms,
                "average": subj_avg,
                "grade": grade_letter(subj_avg),
            })

        overall_avg = (
            round(sum(overall_scores) / len(overall_scores), 1)
            if overall_scores else None
        )

        cursor.execute("""
            SELECT COUNT(DISTINCT DATE(created_at))
            FROM activity_logs
            WHERE user_id = %s AND EXTRACT(YEAR FROM created_at) = %s
        """, (user_id, current_year))
        active_days = cursor.fetchone()[0] or 0
        total_days = 200
        attendance = round((active_days / total_days) * 100, 1) if active_days else 0

        class_section = f"Grade {user_grade}" if user_grade else "—"

        return jsonify({
            "sheet_no": sheet_no,
            "student_name": student_name,
            "class_section": class_section,
            "school_year": str(current_year),
            "subjects": subjects_out,
            "overall_average": overall_avg,
            "overall_grade": grade_letter(overall_avg),
            "total_school_days": total_days,
            "active_days": active_days,
            "attendance_percent": attendance,
        }), 200
    finally:
        cursor.close()
        return_db_connection(conn)