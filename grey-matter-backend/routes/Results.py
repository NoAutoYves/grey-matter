from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection, return_db_connection
from routes.Extensions import limiter
import json

results_bp = Blueprint('results', __name__)

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

@results_bp.route("/results/<int:exercise_id>", methods=["GET"])
def get_exercise_results(exercise_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "results_view_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get progress from user_progress
        cursor.execute("""
            SELECT score, total_questions, percentage, time_taken_seconds, answers, 
                   completed_at, retake_count
            FROM user_progress 
            WHERE user_id = %s AND exercise_id = %s
        """, (user_id, exercise_id))
        
        result = cursor.fetchone()
        
        if not result:
            log_activity(user_id, "results_view_failed", f"No results found for exercise {exercise_id}", ip, ua)
            return jsonify({"error": "No results found for this exercise"}), 404
        
        score, total_questions, percentage, time_taken_seconds, answers, completed_at, retake_count = result
        
        # Get notes from user_notes
        cursor.execute("""
            SELECT note_text FROM user_notes 
            WHERE user_id = %s AND exercise_id = %s
        """, (user_id, exercise_id))
        note_result = cursor.fetchone()
        notes = note_result[0] if note_result else "No notes taken."
        
        # Parse breakdown from answers JSON
        breakdown = []
        if answers:
            answers_data = json.loads(answers) if isinstance(answers, str) else answers
            breakdown = answers_data.get('breakdown', [])
        
        log_activity(user_id, "results_view", f"Viewed results for exercise {exercise_id} - Score: {score}/{total_questions}", ip, ua)
        
        return jsonify({
            "score": score,
            "total_questions": total_questions,
            "percentage": percentage,
            "time_taken_seconds": time_taken_seconds,
            "breakdown": breakdown,
            "notes": notes,
            "completed_at": completed_at.strftime("%Y-%m-%d %H:%M") if completed_at else None,
            "retake_count": retake_count
        }), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)

# ============================================================
# BATCH ENDPOINTS
# ============================================================

@results_bp.route("/results/batch", methods=["POST"])
@limiter.limit("30 per minute")
def batch_get_results():
    """Get results for multiple exercises in one request"""
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "batch_results_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    data = request.get_json()
    
    exercise_ids = data.get('exercise_ids', [])
    
    if not exercise_ids:
        return jsonify({"error": "No exercise IDs provided"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get progress for all exercises in one query
        cursor.execute("""
            SELECT exercise_id, score, total_questions, percentage, time_taken_seconds, 
                   answers, completed_at, retake_count
            FROM user_progress 
            WHERE user_id = %s AND exercise_id = ANY(%s)
        """, (user_id, exercise_ids))
        
        results = cursor.fetchall()
        
        # Get notes for all exercises in one query
        cursor.execute("""
            SELECT exercise_id, note_text
            FROM user_notes 
            WHERE user_id = %s AND exercise_id = ANY(%s)
        """, (user_id, exercise_ids))
        
        notes_results = cursor.fetchall()
        
        # Build notes map
        notes_map = {}
        for note in notes_results:
            notes_map[note[0]] = note[1]
        
        # Build results map
        results_dict = {}
        for r in results:
            exercise_id, score, total_q, percentage, time_taken, answers, completed_at, retake_count = r
            
            # Parse breakdown from answers JSON
            breakdown = []
            if answers:
                answers_data = json.loads(answers) if isinstance(answers, str) else answers
                breakdown = answers_data.get('breakdown', [])
            
            results_dict[exercise_id] = {
                "score": score,
                "total_questions": total_q,
                "percentage": percentage,
                "time_taken_seconds": time_taken,
                "breakdown": breakdown,
                "notes": notes_map.get(exercise_id, "No notes taken."),
                "completed_at": completed_at.strftime("%Y-%m-%d %H:%M") if completed_at else None,
                "retake_count": retake_count
            }
        
        # Include exercises with no results
        final_results = {}
        for ex_id in exercise_ids:
            if ex_id in results_dict:
                final_results[ex_id] = results_dict[ex_id]
            else:
                final_results[ex_id] = {
                    "score": None,
                    "total_questions": None,
                    "percentage": None,
                    "time_taken_seconds": None,
                    "breakdown": [],
                    "notes": "No results found for this exercise.",
                    "completed_at": None,
                    "retake_count": 0,
                    "has_results": False
                }
        
        log_activity(user_id, "batch_results_view", f"Viewed results for {len(exercise_ids)} exercises", ip, ua)
        
        return jsonify({
            "results": final_results
        }), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)

@results_bp.route("/results/recent", methods=["GET"])
@limiter.limit("30 per minute")
def get_recent_results():
    """Get recent exercise results for dashboard in one request"""
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "recent_results_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    
    limit = request.args.get('limit', 10, type=int)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get recent completed exercises with exercise details
        cursor.execute("""
            SELECT up.exercise_id, e.exercise_title, e.subject_id, s.subject_name,
                   up.score, up.total_questions, up.percentage, 
                   up.time_taken_seconds, up.completed_at, up.retake_count,
                   up.answers
            FROM user_progress up
            JOIN exercises e ON up.exercise_id = e.exercise_id
            JOIN subjects s ON e.subject_id = s.subject_id
            WHERE up.user_id = %s
            ORDER BY up.completed_at DESC
            LIMIT %s
        """, (user_id, limit))
        
        results = cursor.fetchall()
        
        recent_results = []
        for r in results:
            (exercise_id, exercise_title, subject_id, subject_name, 
             score, total_q, percentage, time_taken, completed_at, 
             retake_count, answers) = r
            
            # Parse breakdown
            breakdown = []
            if answers:
                answers_data = json.loads(answers) if isinstance(answers, str) else answers
                breakdown = answers_data.get('breakdown', [])
            
            recent_results.append({
                "exercise_id": exercise_id,
                "exercise_title": exercise_title,
                "subject_id": subject_id,
                "subject_name": subject_name,
                "score": score,
                "total_questions": total_q,
                "percentage": percentage,
                "time_taken_seconds": time_taken,
                "completed_at": completed_at.strftime("%Y-%m-%d %H:%M") if completed_at else None,
                "retake_count": retake_count,
                "breakdown_summary": {
                    "correct": sum(1 for b in breakdown if b.get('isCorrect', False)),
                    "incorrect": sum(1 for b in breakdown if not b.get('isCorrect', False))
                } if breakdown else None
            })
        
        log_activity(user_id, "recent_results_view", f"Viewed {len(recent_results)} recent results", ip, ua)
        
        return jsonify({
            "recent_results": recent_results
        }), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)

@results_bp.route("/results/summary", methods=["GET"])
@limiter.limit("30 per minute")
def get_results_summary():
    """Get overall results summary for dashboard in one request"""
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "summary_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get overall stats
        cursor.execute("""
            SELECT 
                COUNT(*) as total_completed,
                AVG(percentage) as avg_percentage,
                SUM(score) as total_score,
                SUM(total_questions) as total_questions_attempted,
                MAX(percentage) as best_percentage,
                MIN(percentage) as worst_percentage
            FROM user_progress
            WHERE user_id = %s
        """, (user_id,))
        
        stats = cursor.fetchone()
        
        # Get subject breakdown
        cursor.execute("""
            SELECT s.subject_name, 
                   COUNT(up.progress_id) as completed_count,
                   AVG(up.percentage) as avg_percentage
            FROM user_progress up
            JOIN exercises e ON up.exercise_id = e.exercise_id
            JOIN subjects s ON e.subject_id = s.subject_id
            WHERE up.user_id = %s
            GROUP BY s.subject_id, s.subject_name
            ORDER BY completed_count DESC
        """, (user_id,))
        
        subject_breakdown = cursor.fetchall()
        
        subject_stats = []
        for sb in subject_breakdown:
            subject_stats.append({
                "subject_name": sb[0],
                "completed_count": sb[1],
                "avg_percentage": round(sb[2], 2) if sb[2] else 0
            })
        
        log_activity(user_id, "results_summary_view", "Viewed results summary", ip, ua)
        
        return jsonify({
            "overall": {
                "total_completed": stats[0] or 0,
                "avg_percentage": round(stats[1], 2) if stats[1] else 0,
                "total_score": stats[2] or 0,
                "total_questions_attempted": stats[3] or 0,
                "best_percentage": round(stats[4], 2) if stats[4] else 0,
                "worst_percentage": round(stats[5], 2) if stats[5] else 0
            },
            "subject_breakdown": subject_stats
        }), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)