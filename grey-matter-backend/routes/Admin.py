from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection, return_db_connection
from routes.Extensions import limiter

admin_bp = Blueprint('admin', __name__)

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

@admin_bp.route("/admin/stats", methods=["GET"])
@limiter.limit("30 per minute")
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

@admin_bp.route("/admin/grades", methods=["GET"])
@limiter.limit("30 per minute")
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
        cursor.execute("SELECT grade_id, grade_level, display_name FROM grades ORDER BY grade_level")
        grades = cursor.fetchall()
        
        log_activity(session['user_id'], "admin_grades_view", f"Viewed {len(grades)} grades", ip, ua)
        
        return jsonify({
            "grades": [
                {
                    "grade_id": g[0],
                    "grade_level": g[1],
                    "display_name": g[2] or f"Grade {g[1]}"
                } for g in grades
            ]
        }), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_bp.route("/admin/subjects", methods=["GET"])
@limiter.limit("30 per minute")
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
        cursor.execute("""
            SELECT subject_id, subject_name, subject_code, description, is_active 
            FROM subjects 
            ORDER BY display_order, subject_name
        """)
        subjects = cursor.fetchall()
        
        log_activity(session['user_id'], "admin_subjects_view", f"Viewed {len(subjects)} subjects", ip, ua)
        
        return jsonify({
            "subjects": [
                {
                    "subject_id": s[0],
                    "subject_name": s[1],
                    "subject_code": s[2] or "",
                    "description": s[3] or "",
                    "is_active": s[4]
                } for s in subjects
            ]
        }), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_bp.route("/admin/topics/<int:subject_id>", methods=["GET"])
@limiter.limit("30 per minute")
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
        cursor.execute("""
            SELECT t.topic_id, t.topic_name, t.topic_url, t.grade_id, g.grade_level
            FROM topics t
            LEFT JOIN grades g ON t.grade_id = g.grade_id
            WHERE t.subject_id = %s
            ORDER BY g.grade_level, t.topic_name
        """, (subject_id,))
        topics = cursor.fetchall()
        
        log_activity(session['user_id'], "admin_topics_view", f"Viewed {len(topics)} topics for subject {subject_id}", ip, ua)
        
        return jsonify({
            "topics": [
                {
                    "topic_id": t[0],
                    "topic_name": t[1],
                    "topic_url": t[2] or "",
                    "grade_id": t[3],
                    "grade_level": t[4]
                } for t in topics
            ]
        }), 200
    finally:
        cursor.close()
        return_db_connection(conn)