from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection, return_db_connection
from routes.Extensions import limiter

admin_feedback_bp = Blueprint('admin_feedback', __name__)

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

@admin_feedback_bp.route("/admin/feedback", methods=["GET"])
@limiter.limit("30 per minute")
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
        
        # Calculate stats
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

@admin_feedback_bp.route("/admin/feedback/stats", methods=["GET"])
@limiter.limit("30 per minute")
def admin_feedback_stats():
    user_id, error_response, status_code = check_admin()
    if error_response:
        return error_response, status_code
    
    ip = request.remote_addr
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Overall stats
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                COALESCE(AVG(rating), 0) as avg_rating,
                COALESCE(AVG(score), 0) as avg_score,
                COALESCE(AVG(time_taken_seconds), 0) as avg_time
            FROM user_feedback
        """)
        overall = cursor.fetchone()
        
        # Rating distribution
        cursor.execute("""
            SELECT rating, COUNT(*) as count
            FROM user_feedback
            GROUP BY rating
            ORDER BY rating DESC
        """)
        rating_distribution = [{"rating": row[0], "count": row[1]} for row in cursor.fetchall()]
        
        # Feedback by exercise
        cursor.execute("""
            SELECT e.exercise_title, COUNT(uf.id) as feedback_count, AVG(uf.rating) as avg_rating
            FROM user_feedback uf
            JOIN exercises e ON uf.exercise_id = e.exercise_id
            GROUP BY e.exercise_id, e.exercise_title
            ORDER BY feedback_count DESC
            LIMIT 10
        """)
        exercise_feedback = [{
            "exercise_title": row[0],
            "feedback_count": row[1],
            "avg_rating": round(row[2], 2) if row[2] else 0
        } for row in cursor.fetchall()]
        
        log_admin_activity(user_id, "view_feedback_stats", "Viewed feedback statistics", ip)
        
        return jsonify({
            "overall": {
                "total_feedback": overall[0] or 0,
                "avg_rating": round(overall[1] or 0, 2),
                "avg_score": round(overall[2] or 0, 2),
                "avg_time_seconds": round(overall[3] or 0, 2)
            },
            "rating_distribution": rating_distribution,
            "exercise_feedback": exercise_feedback
        }), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_feedback_bp.route("/admin/feedback/<int:feedback_id>", methods=["DELETE"])
@limiter.limit("10 per minute")
def delete_feedback(feedback_id):
    user_id, error_response, status_code = check_admin()
    if error_response:
        return error_response, status_code
    
    ip = request.remote_addr
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM user_feedback WHERE id = %s RETURNING id", (feedback_id,))
        deleted = cursor.fetchone()
        
        if not deleted:
            return jsonify({"error": "Feedback not found"}), 404
        
        conn.commit()
        
        log_admin_activity(user_id, "delete_feedback", f"Deleted feedback {feedback_id}", ip)
        
        return jsonify({"success": True}), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)