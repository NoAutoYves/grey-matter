import base64
from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection, return_db_connection
import os
from datetime import datetime, timedelta
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from routes.Extensions import limiter

admin_bp = Blueprint('admin', __name__)

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

def log_admin_activity(admin_id, action, details, ip_address, target_user_id=None, target_exercise_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO admin_logs (admin_id, action, details, ip_address, target_user_id, target_exercise_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (admin_id, action, details, ip_address, target_user_id, target_exercise_id))
        conn.commit()
    finally:
        cursor.close()
        return_db_connection(conn)

def check_admin():
    if 'user_id' not in session:
        return None, jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT is_admin, email FROM users WHERE user_id = %s", (user_id,))
        result = cursor.fetchone()
        if not result or not result[0]:
            return None, jsonify({"error": "Admin access required"}), 403
        return user_id, None, None
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

@admin_bp.route("/admin/stats", methods=["GET"])
def get_admin_stats():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_stats_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_stats_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM exercises WHERE is_published = TRUE")
        total_exercises = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM user_progress")
        total_completions = cursor.fetchone()[0]
        
        cursor.execute("SELECT COALESCE(AVG(percentage), 0) FROM user_progress")
        avg_score = round(cursor.fetchone()[0], 2)
        
        log_activity(session['user_id'], "admin_stats_view", f"Stats: {total_users} users, {total_exercises} exercises", ip, ua)
        
        return jsonify({
            "total_users": total_users,
            "total_exercises": total_exercises,
            "total_completions": total_completions,
            "avg_score": avg_score
        }), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_bp.route("/admin/users", methods=["GET"])
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

@admin_bp.route("/admin/users/<int:user_id>/role", methods=["PUT"])
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

@admin_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
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

@admin_bp.route("/admin/grades", methods=["GET"])
def get_grades():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_grades_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_grades_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT grade_id, grade_level FROM grades ORDER BY grade_level")
        grades = cursor.fetchall()
        
        log_activity(session['user_id'], "admin_grades_view", f"Viewed {len(grades)} grades", ip, ua)
        
        return jsonify({"grades": [{"grade_id": g[0], "grade_level": g[1]} for g in grades]}), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_bp.route("/admin/subjects", methods=["GET"])
def get_subjects():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_subjects_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_subjects_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT subject_id, subject_name FROM subjects ORDER BY subject_name")
        subjects = cursor.fetchall()
        
        log_activity(session['user_id'], "admin_subjects_view", f"Viewed {len(subjects)} subjects", ip, ua)
        
        return jsonify({"subjects": [{"subject_id": s[0], "subject_name": s[1]} for s in subjects]}), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_bp.route("/admin/terms", methods=["GET"])
def get_terms():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_terms_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_terms_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT term_id, term_name FROM terms ORDER BY display_order")
        terms = cursor.fetchall()
        
        log_activity(session['user_id'], "admin_terms_view", f"Viewed {len(terms)} terms", ip, ua)
        
        return jsonify({"terms": [{"term_id": t[0], "term_name": t[1]} for t in terms]}), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_bp.route("/admin/topics/<int:subject_id>", methods=["GET"])
def get_topics(subject_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_topics_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_topics_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT topic_id, topic_name FROM topics WHERE subject_id = %s ORDER BY topic_name", (subject_id,))
        topics = cursor.fetchall()
        
        log_activity(session['user_id'], "admin_topics_view", f"Viewed {len(topics)} topics for subject {subject_id}", ip, ua)
        
        return jsonify({"topics": [{"topic_id": t[0], "topic_name": t[1]} for t in topics]}), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_bp.route("/admin/analytics", methods=["GET"])
def get_analytics():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_analytics_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_analytics_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Daily active users (last 7 days)
        cursor.execute("""
            SELECT DATE(created_at) as date, COUNT(DISTINCT user_id) as active_users
            FROM activity_logs
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY date
        """)
        daily_active = [{"date": str(row[0]), "count": row[1]} for row in cursor.fetchall()]
        
        # Most popular exercises
        cursor.execute("""
            SELECT e.exercise_title, COUNT(up.progress_id) as completion_count
            FROM user_progress up
            JOIN exercises e ON up.exercise_id = e.exercise_id
            GROUP BY e.exercise_id, e.exercise_title
            ORDER BY completion_count DESC
            LIMIT 10
        """)
        popular_exercises = [{"title": row[0], "count": row[1]} for row in cursor.fetchall()]
        
        # Score distribution
        cursor.execute("""
            SELECT 
                CASE 
                    WHEN percentage >= 90 THEN '90-100%'
                    WHEN percentage >= 75 THEN '75-89%'
                    WHEN percentage >= 50 THEN '50-74%'
                    WHEN percentage >= 25 THEN '25-49%'
                    ELSE '0-24%'
                END as range,
                COUNT(*) as count
            FROM user_progress
            GROUP BY range
            ORDER BY range DESC
        """)
        score_distribution = [{"range": row[0], "count": row[1]} for row in cursor.fetchall()]
        
        # Subject performance
        cursor.execute("""
            SELECT s.subject_name, COUNT(up.progress_id) as completions
            FROM user_progress up
            JOIN exercises e ON up.exercise_id = e.exercise_id
            JOIN subjects s ON e.subject_id = s.subject_id
            GROUP BY s.subject_name
            ORDER BY completions DESC
        """)
        subject_performance = [{"subject": row[0], "completions": row[1]} for row in cursor.fetchall()]
        
        # Average time per exercise
        cursor.execute("SELECT COALESCE(AVG(time_taken_seconds), 0) FROM user_progress WHERE time_taken_seconds > 0")
        avg_time = cursor.fetchone()[0] or 0
        avg_time_minutes = round(avg_time / 60, 1)
        
        # Total users who have completed at least one exercise
        cursor.execute("SELECT COUNT(DISTINCT user_id) FROM user_progress")
        active_users = cursor.fetchone()[0] or 0
        
        # Total users
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        
        # Total exercises
        cursor.execute("SELECT COUNT(*) FROM exercises WHERE is_published = TRUE")
        total_exercises = cursor.fetchone()[0]
        
        # Total completions
        cursor.execute("SELECT COUNT(*) FROM user_progress")
        total_completions = cursor.fetchone()[0]
        
        # Completion rate
        completion_rate = round((active_users / total_users) * 100, 1) if total_users > 0 else 0
        
        # Top performers
        cursor.execute("""
            SELECT u.email, AVG(up.percentage) as avg_score, COUNT(up.progress_id) as completions
            FROM user_progress up
            JOIN users u ON up.user_id = u.user_id
            GROUP BY u.user_id, u.email
            ORDER BY avg_score DESC
            LIMIT 10
        """)
        top_performers = [{"email": row[0], "avg_score": round(row[1], 1), "completions": row[2]} for row in cursor.fetchall()]
        
        # Recent activity
        cursor.execute("""
            SELECT al.created_at, u.email, al.action, al.details
            FROM activity_logs al
            JOIN users u ON al.user_id = u.user_id
            ORDER BY al.created_at DESC
            LIMIT 20
        """)
        recent_activity = [{
            "created_at": row[0].strftime("%Y-%m-%d %H:%M") if row[0] else None,
            "user_email": row[1],
            "action": row[2],
            "details": row[3]
        } for row in cursor.fetchall()]
        
        log_activity(session['user_id'], "admin_analytics_view", "Viewed analytics dashboard", ip, ua)
        
        return jsonify({
            "daily_active": daily_active,
            "popular_exercises": popular_exercises,
            "score_distribution": score_distribution,
            "subject_performance": subject_performance,
            "avg_time_minutes": avg_time_minutes,
            "active_users": active_users,
            "total_users": total_users,
            "total_exercises": total_exercises,
            "total_completions": total_completions,
            "completion_rate": completion_rate,
            "top_performers": top_performers,
            "recent_activity": recent_activity
        }), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_bp.route("/admin/exercises", methods=["POST"])
def create_exercise():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_create_exercise_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_create_exercise_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    data = request.get_json()
    
    grade_id = data.get('grade_id')
    subject_id = data.get('subject_id')
    term_id = data.get('term_id')
    topic_name = data.get('topic_name')
    exercise_name = data.get('exercise_name')
    exercise_title = data.get('exercise_title')
    questions = data.get('questions', [])
    
    if not grade_id or not subject_id or not term_id or not exercise_name or not questions:
        log_activity(session['user_id'], "admin_create_exercise_failed", "Missing required fields", ip, ua)
        return jsonify({"error": "Missing required fields"}), 400
    
    if len(questions) != 10:
        log_activity(session['user_id'], "admin_create_exercise_failed", f"Wrong question count: {len(questions)}", ip, ua)
        return jsonify({"error": "Must have exactly 10 questions"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Handle topic: create new or get existing
        topic_id = None
        if topic_name:
            cursor.execute("SELECT topic_id FROM topics WHERE subject_id = %s AND topic_name ILIKE %s", (subject_id, topic_name))
            existing = cursor.fetchone()
            if existing:
                topic_id = existing[0]
            else:
                cursor.execute("INSERT INTO topics (subject_id, topic_name) VALUES (%s, %s) RETURNING topic_id", (subject_id, topic_name))
                topic_id = cursor.fetchone()[0]
        
        cursor.execute("""
            INSERT INTO exercises (grade_id, subject_id, term_id, topic_id, exercise_name, exercise_title, total_questions)
            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING exercise_id
        """, (grade_id, subject_id, term_id, topic_id, exercise_name, exercise_title, 10))
        
        exercise_id = cursor.fetchone()[0]
        
        for i, q in enumerate(questions):
            # Handle image data (base64)
            image_data = None
            image_mime_type = None
            
            if q.get('image_base64'):
                img_data = q['image_base64']
                if ',' in img_data:
                    header, encoded = img_data.split(',', 1)
                    image_mime_type = header.split(':')[1].split(';')[0]
                    image_data = base64.b64decode(encoded)
                else:
                    image_data = base64.b64decode(img_data)
                    image_mime_type = 'image/png'
            
            cursor.execute("""
                INSERT INTO questions (exercise_id, question_text, option_a, option_b, option_c, option_d, correct_answer, image_data, image_mime_type, display_order)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (exercise_id, q['text'], q['option_a'], q['option_b'], q['option_c'], q['option_d'], q['answer'], image_data, image_mime_type, i))
        
        conn.commit()
        
        log_activity(session['user_id'], "admin_create_exercise", f"Created exercise '{exercise_name}' (ID: {exercise_id}) with {len(questions)} questions", ip, ua)
        
        return jsonify({"success": True, "exercise_id": exercise_id}), 201
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_bp.route("/admin/exercises", methods=["GET"])
def get_admin_exercises():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "admin_list_exercises_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        log_activity(session['user_id'], "admin_list_exercises_failed", "Non-admin access attempt", ip, ua)
        return jsonify({"error": "Admin access required"}), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT e.exercise_id, e.exercise_name, e.exercise_title, e.is_published,
                   s.subject_name, g.grade_level, t.term_name,
                   COUNT(q.question_id) as question_count
            FROM exercises e
            JOIN subjects s ON e.subject_id = s.subject_id
            JOIN grades g ON e.grade_id = g.grade_id
            JOIN terms t ON e.term_id = t.term_id
            LEFT JOIN questions q ON e.exercise_id = q.exercise_id
            GROUP BY e.exercise_id, s.subject_name, g.grade_level, t.term_name
            ORDER BY e.exercise_id DESC
        """)
        
        exercises = cursor.fetchall()
        
        exercise_list = []
        for ex in exercises:
            exercise_list.append({
                "exercise_id": ex[0],
                "exercise_name": ex[1],
                "exercise_title": ex[2],
                "is_published": ex[3],
                "subject_name": ex[4],
                "grade_level": ex[5],
                "term_name": ex[6],
                "question_count": ex[7] or 0
            })
        
        log_activity(session['user_id'], "admin_list_exercises", f"Listed {len(exercise_list)} exercises", ip, ua)
        
        return jsonify({"exercises": exercise_list}), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_bp.route("/admin/users/<int:user_id>/verify", methods=["PUT"])
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

@admin_bp.route("/admin/users/<int:user_id>/reset-password", methods=["POST"])
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
        smtp_server = "pro.turbo-smtp.com"
        smtp_port = 465
        smtp_username = "c949f9c2c570ecac36ac"
        smtp_password = "FB5aCJisfMTrYopwW4dD"
        sender_email = "info@greymatterschool.co.za"
        
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
        
        server = smtplib.SMTP_SSL(smtp_server, smtp_port)
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        
        log_activity(session['user_id'], "admin_reset_password", f"Sent reset link to {email}", ip, ua)
    except Exception as e:
        log_activity(session['user_id'], "admin_reset_password_failed", f"Email error for {email}: {str(e)}", ip, ua)
        print(f"Email error: {e}")
    
    return jsonify({"success": True}), 200

@admin_bp.route("/admin/users/<int:user_id>/activity", methods=["GET"])
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

@admin_bp.route("/admin/feedback", methods=["GET"])
#@limiter.limit("30 per minute")
def admin_get_feedback():
    user_id, error_response, status_code = check_admin()
    if error_response:
        return error_response, status_code
    
    ip = request.remote_addr
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT uf.id, uf.user_id, u.email, uf.exercise_id, e.exercise_title,
                   uf.rating, uf.feedback, uf.score, uf.total_questions, 
                   uf.time_taken_seconds, uf.ip_address, uf.created_at,
                   ROUND((uf.score::float / NULLIF(uf.total_questions, 0) * 100), 1) as percentage
            FROM user_feedback uf
            LEFT JOIN users u ON uf.user_id = u.user_id
            LEFT JOIN exercises e ON uf.exercise_id = e.exercise_id
            ORDER BY uf.created_at DESC
        """)
        
        feedback_rows = cursor.fetchall()
        
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                COALESCE(AVG(rating), 0) as avg_rating,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1
            FROM user_feedback
        """)
        stats = cursor.fetchone()
        
        log_admin_activity(user_id, "view_feedback", "Viewed user feedback", ip)
        
        return jsonify({
            "feedback": [
                {
                    "id": row[0],
                    "user_id": row[1],
                    "user_email": row[2] or "Deleted User",
                    "exercise_id": row[3],
                    "exercise_title": row[4] or "Unknown Exercise",
                    "rating": row[5],
                    "feedback": row[6] or "No feedback provided",
                    "score": row[7],
                    "total_questions": row[8],
                    "time_taken_seconds": row[9],
                    "ip_address": row[10],
                    "created_at": row[11].isoformat() if row[11] else None,
                    "percentage": row[12] or 0
                }
                for row in feedback_rows
            ],
            "total": stats[0] or 0,
            "avg_rating": round(stats[1] or 0, 2),
            "rating_counts": {
                "5": stats[2] or 0,
                "4": stats[3] or 0,
                "3": stats[4] or 0,
                "2": stats[5] or 0,
                "1": stats[6] or 0
            }
        }), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)