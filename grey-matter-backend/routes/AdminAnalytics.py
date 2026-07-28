from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection, return_db_connection
from routes.Extensions import limiter

admin_analytics_bp = Blueprint('admin_analytics', __name__)

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

@admin_analytics_bp.route("/admin/analytics", methods=["GET"])
@limiter.limit("30 per minute")
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