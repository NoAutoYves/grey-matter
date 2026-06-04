from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection
import json
from utils.sanitise import sanitize_text

exercise_bp = Blueprint('exercise', __name__)

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

@exercise_bp.route("/exercise/<subject>/<int:exercise_id>", methods=["GET"])
def get_exercise(subject, exercise_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "get_exercise_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    
    # Sanitize subject parameter
    subject = sanitize_text(subject, max_length=50)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get subject_id from subject name
    cursor.execute("SELECT subject_id FROM subjects WHERE LOWER(subject_name) = LOWER(%s)", (subject,))
    subject_result = cursor.fetchone()
    
    if not subject_result:
        cursor.close()
        conn.close()
        log_activity(user_id, "get_exercise_failed", f"Subject not found: {subject}", ip, ua)
        return jsonify({"error": "Subject not found"}), 404
    
    # Verify exercise exists and belongs to this subject
    cursor.execute("""
        SELECT exercise_id FROM exercises 
        WHERE exercise_id = %s AND subject_id = %s AND is_published = TRUE
    """, (exercise_id, subject_result[0]))
    
    exercise = cursor.fetchone()
    if not exercise:
        cursor.close()
        conn.close()
        log_activity(user_id, "get_exercise_failed", f"Exercise {exercise_id} not found for subject {subject}", ip, ua)
        return jsonify({"error": "Exercise not found"}), 404
    
    # Get all questions for this exercise including image data
    cursor.execute("""
        SELECT question_text, option_a, option_b, option_c, option_d, correct_answer, 
               encode(image_data, 'base64') as image_base64, image_mime_type
        FROM questions
        WHERE exercise_id = %s
        ORDER BY display_order, question_id
    """, (exercise_id,))
    
    questions_data = cursor.fetchall()
    cursor.close()
    conn.close()
    
    if not questions_data:
        log_activity(user_id, "get_exercise_failed", f"No questions found for exercise {exercise_id}", ip, ua)
        return jsonify({"error": "No questions found"}), 404
    
    questions = []
    for q in questions_data:
        question_text, opt_a, opt_b, opt_c, opt_d, correct_answer, image_base64, image_mime_type = q
        
        question_obj = {
            "question_text": question_text,
            "options": [opt_a, opt_b, opt_c, opt_d],
            "correct_answer": correct_answer
        }
        
        # Add image as data URL if exists
        if image_base64 and image_mime_type:
            question_obj["image_data"] = f"data:{image_mime_type};base64,{image_base64}"
        
        questions.append(question_obj)
    
    log_activity(user_id, "exercise_started", f"Started exercise {exercise_id} for subject {subject}", ip, ua)
    
    return jsonify(questions), 200

@exercise_bp.route("/exercise/save-results", methods=["POST"])
def save_results():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "save_results_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    data = request.get_json()
    
    exercise_id = data.get('exercise_id')
    score = data.get('score')
    total_questions = data.get('total_questions')
    time_taken_seconds = data.get('time_taken_seconds', 0)
    notes = data.get('notes')
    breakdown = data.get('breakdown', [])
    answers = data.get('answers', {})
    
    # SANITIZE NOTES - this is user input
    if notes and notes != "No notes taken.":
        notes = sanitize_text(notes, max_length=5000)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    percentage = (score / total_questions) * 100 if total_questions > 0 else 0
    
    answers_json = json.dumps({
        "answers": answers,
        "breakdown": breakdown
    })
    
    # Check if record exists
    cursor.execute("""
        SELECT progress_id, retake_count FROM user_progress 
        WHERE user_id = %s AND exercise_id = %s
    """, (user_id, exercise_id))
    
    existing = cursor.fetchone()
    
    if existing:
        # Update existing record
        progress_id = existing[0]
        retake_count = existing[1] + 1
        
        cursor.execute("""
            UPDATE user_progress 
            SET score = %s, total_questions = %s, percentage = %s, 
                time_taken_seconds = %s, answers = %s, completed_at = NOW(), 
                retake_count = %s
            WHERE progress_id = %s
        """, (score, total_questions, percentage, time_taken_seconds, answers_json, retake_count, progress_id))
        
        log_activity(user_id, "exercise_retake", f"Retake #{retake_count} of exercise {exercise_id} - Score: {score}/{total_questions}", ip, ua)
    else:
        # Insert new record
        cursor.execute("""
            INSERT INTO user_progress (user_id, exercise_id, score, total_questions, 
                                       percentage, time_taken_seconds, answers, retake_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (user_id, exercise_id, score, total_questions, percentage, 
              time_taken_seconds, answers_json, 0))
        
        log_activity(user_id, "exercise_completed", f"Completed exercise {exercise_id} - Score: {score}/{total_questions}", ip, ua)
    
    # Save notes (already sanitized)
    if notes and notes != "No notes taken.":
        # Check if note exists
        cursor.execute("""
            SELECT note_id FROM user_notes 
            WHERE user_id = %s AND exercise_id = %s
        """, (user_id, exercise_id))
        
        note_exists = cursor.fetchone()
        
        if note_exists:
            cursor.execute("""
                UPDATE user_notes 
                SET note_text = %s, created_at = NOW()
                WHERE user_id = %s AND exercise_id = %s
            """, (notes, user_id, exercise_id))
        else:
            cursor.execute("""
                INSERT INTO user_notes (user_id, exercise_id, note_text, created_at)
                VALUES (%s, %s, %s, NOW())
            """, (user_id, exercise_id, notes))
        
        log_activity(user_id, "notes_saved", f"Saved notes for exercise {exercise_id}", ip, ua)
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({"success": True}), 200

@exercise_bp.route("/exercise/results/<int:exercise_id>", methods=["GET"])
def get_exercise_results(exercise_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "get_results_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get progress
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
        log_activity(user_id, "get_results_failed", f"No results found for exercise {exercise_id}", ip, ua)
        return jsonify({"error": "No results found for this exercise"}), 404
    
    score, total_questions, percentage, time_taken_seconds, answers, completed_at, retake_count = result
    
    # Get notes
    cursor.execute("""
        SELECT note_text FROM user_notes 
        WHERE user_id = %s AND exercise_id = %s
    """, (user_id, exercise_id))
    note_result = cursor.fetchone()
    notes = note_result[0] if note_result else "No notes taken."
    
    cursor.close()
    conn.close()
    
    # Parse answers JSON
    breakdown = []
    if answers:
        answers_data = json.loads(answers) if isinstance(answers, str) else answers
        breakdown = answers_data.get('breakdown', [])
    
    log_activity(user_id, "results_viewed", f"Viewed results for exercise {exercise_id} - Score: {score}/{total_questions}", ip, ua)
    
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