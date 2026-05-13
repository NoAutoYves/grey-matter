from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection
import json

results_bp = Blueprint('results', __name__)

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
    
    # Get progress from user_progress
    cursor.execute("""
        SELECT score, total_questions, percentage, time_taken_seconds, answers, 
               completed_at, retake_count
        FROM user_progress 
        WHERE user_id = %s AND exercise_id = %s
    """, (user_id, exercise_id))
    
    result = cursor.fetchone()
    
    if not result:
        cursor.close()
        conn.close()
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
    
    cursor.close()
    conn.close()
    
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