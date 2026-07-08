from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection, return_db_connection
import json
from utils.sanitise import sanitize_text
from routes.Extensions import limiter
import signal
from functools import wraps
import sys

exercise_bp = Blueprint('exercise', __name__)

processing_submissions = set()
SUBMISSION_TIMEOUT = 45

# Only define signal handlers on Unix systems
if sys.platform != 'win32':
    def timeout_handler(signum, frame):
        raise TimeoutError("Submission timed out")

def with_timeout(seconds):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if sys.platform != 'win32':
                signal.signal(signal.SIGALRM, timeout_handler)
                signal.alarm(seconds)
                try:
                    result = func(*args, **kwargs)
                finally:
                    signal.alarm(0)
            else:
                # On Windows, just run the function without timeout
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

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

@exercise_bp.route("/exercise/<subject>/<int:exercise_id>", methods=["GET"])
def get_exercise(subject, exercise_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "get_exercise_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    
    subject = sanitize_text(subject, max_length=50)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT subject_id FROM subjects WHERE LOWER(subject_name) = LOWER(%s)", (subject,))
        subject_result = cursor.fetchone()
        
        if not subject_result:
            log_activity(user_id, "get_exercise_failed", f"Subject not found: {subject}", ip, ua)
            return jsonify({"error": "Subject not found"}), 404
        
        cursor.execute("""
            SELECT exercise_id FROM exercises 
            WHERE exercise_id = %s AND subject_id = %s AND is_published = TRUE
        """, (exercise_id, subject_result[0]))
        
        exercise = cursor.fetchone()
        if not exercise:
            log_activity(user_id, "get_exercise_failed", f"Exercise {exercise_id} not found for subject {subject}", ip, ua)
            return jsonify({"error": "Exercise not found"}), 404
        
        cursor.execute("""
            SELECT question_text, option_a, option_b, option_c, option_d, correct_answer, 
                   encode(image_data, 'base64') as image_base64, image_mime_type
            FROM questions
            WHERE exercise_id = %s
            ORDER BY display_order, question_id
        """, (exercise_id,))
        
        questions_data = cursor.fetchall()
        
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
            
            if image_base64 and image_mime_type:
                question_obj["image_data"] = f"data:{image_mime_type};base64,{image_base64}"
            
            questions.append(question_obj)
        
        log_activity(user_id, "exercise_started", f"Started exercise {exercise_id} for subject {subject}", ip, ua)
        
        return jsonify(questions), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)

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
    
    if notes and notes != "No notes taken.":
        notes = sanitize_text(notes, max_length=5000)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        percentage = (score / total_questions) * 100 if total_questions > 0 else 0
        
        answers_json = json.dumps({
            "answers": answers,
            "breakdown": breakdown
        })
        
        cursor.execute("""
            SELECT progress_id, retake_count FROM user_progress 
            WHERE user_id = %s AND exercise_id = %s
        """, (user_id, exercise_id))
        
        existing = cursor.fetchone()
        
        if existing:
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
            cursor.execute("""
                INSERT INTO user_progress (user_id, exercise_id, score, total_questions, 
                                           percentage, time_taken_seconds, answers, retake_count)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (user_id, exercise_id, score, total_questions, percentage, 
                  time_taken_seconds, answers_json, 0))
            
            log_activity(user_id, "exercise_completed", f"Completed exercise {exercise_id} - Score: {score}/{total_questions}", ip, ua)
        
        if notes and notes != "No notes taken.":
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
        
        return jsonify({"success": True}), 200
    
    except Exception as e:
        conn.rollback()
        log_activity(user_id, "save_results_failed", f"Error: {str(e)}", ip, ua)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_db_connection(conn)

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
    
    try:
        cursor.execute("""
            SELECT score, total_questions, percentage, time_taken_seconds, answers, 
                   completed_at, retake_count
            FROM user_progress 
            WHERE user_id = %s AND exercise_id = %s
        """, (user_id, exercise_id))
        
        result = cursor.fetchone()
        
        if not result:
            log_activity(user_id, "get_results_failed", f"No results found for exercise {exercise_id}", ip, ua)
            return jsonify({"error": "No results found for this exercise"}), 404
        
        score, total_questions, percentage, time_taken_seconds, answers, completed_at, retake_count = result
        
        cursor.execute("""
            SELECT note_text FROM user_notes 
            WHERE user_id = %s AND exercise_id = %s
        """, (user_id, exercise_id))
        note_result = cursor.fetchone()
        notes = note_result[0] if note_result else "No notes taken."
        
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
    
    finally:
        cursor.close()
        return_db_connection(conn)

@exercise_bp.route("/exercise/batch-data/<int:exercise_id>", methods=["GET"])
def get_exercise_batch_data(exercise_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "batch_data_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT exercise_id, exercise_name, exercise_title, total_questions, passing_score
            FROM exercises 
            WHERE exercise_id = %s AND is_published = TRUE
        """, (exercise_id,))
        
        exercise = cursor.fetchone()
        if not exercise:
            return jsonify({"error": "Exercise not found"}), 404
        
        cursor.execute("""
            SELECT question_id, question_text, option_a, option_b, option_c, option_d, 
                   correct_answer, marks, display_order,
                   encode(image_data, 'base64') as image_base64, image_mime_type
            FROM questions
            WHERE exercise_id = %s
            ORDER BY display_order, question_id
        """, (exercise_id,))
        
        questions_data = cursor.fetchall()
        
        cursor.execute("""
            SELECT score, total_questions, percentage, time_taken_seconds, answers, 
                   completed_at, retake_count
            FROM user_progress 
            WHERE user_id = %s AND exercise_id = %s
        """, (user_id, exercise_id))
        
        progress = cursor.fetchone()
        
        questions = []
        for q in questions_data:
            (q_id, q_text, opt_a, opt_b, opt_c, opt_d, correct, marks, 
             display_order, image_base64, image_mime_type) = q
            
            question_obj = {
                "question_id": q_id,
                "question_text": q_text,
                "options": [opt_a, opt_b, opt_c, opt_d],
                "correct_answer": correct,
                "marks": marks,
                "display_order": display_order
            }
            
            if image_base64 and image_mime_type:
                question_obj["image_data"] = f"data:{image_mime_type};base64,{image_base64}"
            
            questions.append(question_obj)
        
        progress_data = None
        if progress:
            score, total_q, percentage, time_taken, answers, completed_at, retake_count = progress
            progress_data = {
                "score": score,
                "total_questions": total_q,
                "percentage": percentage,
                "time_taken_seconds": time_taken,
                "completed_at": completed_at.isoformat() if completed_at else None,
                "retake_count": retake_count
            }
        
        log_activity(user_id, "batch_data_fetched", f"Fetched batch data for exercise {exercise_id}", ip, ua)
        
        return jsonify({
            "exercise": {
                "exercise_id": exercise[0],
                "exercise_name": exercise[1],
                "exercise_title": exercise[2],
                "total_questions": exercise[3],
                "passing_score": exercise[4]
            },
            "questions": questions,
            "progress": progress_data
        }), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)

@exercise_bp.route("/exercise/batch-submit", methods=["POST"])
#@limiter.limit("5 per minute")
def batch_submit_exercise():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        log_activity(None, "batch_submit_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    data = request.get_json()
    
    required = ['exercise_id', 'answers', 'time_taken_seconds']
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400
    
    exercise_id = data['exercise_id']
    answers = data['answers']
    time_taken_seconds = data.get('time_taken_seconds', 0)
    notes = data.get('notes')
    breakdown = data.get('breakdown', [])
    
    submission_key = f"{user_id}_{exercise_id}"
    
    if submission_key in processing_submissions:
        log_activity(user_id, "duplicate_submission_blocked", f"Duplicate submission for exercise {exercise_id}", ip, ua)
        return jsonify({
            "error": "Your submission is already being processed",
            "degraded": True,
            "message": "Please wait a moment and try again"
        }), 409
    
    processing_submissions.add(submission_key)
    
    try:
        # Set timeout on Unix systems only
        if sys.platform != 'win32':
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(SUBMISSION_TIMEOUT)
        
        if notes and notes != "No notes taken.":
            notes = sanitize_text(notes, max_length=5000)
        
        total_questions = len(answers)
        correct_count = 0
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            question_ids = [a['question_id'] for a in answers]
            
            cursor.execute("""
                SELECT question_id, correct_answer 
                FROM questions 
                WHERE question_id = ANY(%s)
            """, (question_ids,))
            
            correct_answers = {row[0]: row[1] for row in cursor.fetchall()}
            
            for answer in answers:
                q_id = answer['question_id']
                selected = answer.get('selected_option', '')
                if q_id in correct_answers and selected == correct_answers[q_id]:
                    correct_count += 1
            
            score = correct_count
            percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0
            
            answers_json = json.dumps({
                "answers": {a['question_id']: a.get('selected_option', '') for a in answers},
                "breakdown": breakdown
            })
            
            cursor.execute("""
                SELECT progress_id, retake_count FROM user_progress 
                WHERE user_id = %s AND exercise_id = %s
            """, (user_id, exercise_id))
            
            existing = cursor.fetchone()
            
            if existing:
                progress_id = existing[0]
                retake_count = existing[1] + 1
                
                cursor.execute("""
                    UPDATE user_progress 
                    SET score = %s, total_questions = %s, percentage = %s, 
                        time_taken_seconds = %s, answers = %s, completed_at = NOW(), 
                        retake_count = %s
                    WHERE progress_id = %s
                """, (score, total_questions, percentage, time_taken_seconds, 
                      answers_json, retake_count, progress_id))
                
                log_activity(user_id, "exercise_retake_batch", 
                            f"Retake #{retake_count} of exercise {exercise_id} - Score: {score}/{total_questions}", ip, ua)
            else:
                cursor.execute("""
                    INSERT INTO user_progress (user_id, exercise_id, score, total_questions, 
                                               percentage, time_taken_seconds, answers, retake_count)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, 1)
                    RETURNING progress_id
                """, (user_id, exercise_id, score, total_questions, percentage, 
                      time_taken_seconds, answers_json))
                
                progress_id = cursor.fetchone()[0]
                
                log_activity(user_id, "exercise_completed_batch", 
                            f"Completed exercise {exercise_id} - Score: {score}/{total_questions}", ip, ua)
            
            if notes and notes != "No notes taken.":
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
                
                log_activity(user_id, "notes_saved_batch", f"Saved notes for exercise {exercise_id}", ip, ua)
            
            conn.commit()
            
            if sys.platform != 'win32':
                signal.alarm(0)
            
            return jsonify({
                "success": True,
                "progress_id": progress_id,
                "score": score,
                "total_questions": total_questions,
                "percentage": round(percentage, 2)
            }), 200
            
        except TimeoutError:
            log_activity(user_id, "batch_submit_timeout", f"Submission timed out for exercise {exercise_id}", ip, ua)
            return jsonify({
                "error": "Submission took too long",
                "degraded": True,
                "message": "Please try again"
            }), 408
        except Exception as e:
            conn.rollback()
            log_activity(user_id, "batch_submit_failed", f"Error: {str(e)}", ip, ua)
            return jsonify({"error": str(e)}), 500
        finally:
            if sys.platform != 'win32':
                signal.alarm(0)
            cursor.close()
            return_db_connection(conn)
    
    finally:
        processing_submissions.discard(submission_key)

@exercise_bp.route("/exercise/batch-results", methods=["POST"])
def batch_get_results():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session['user_id']
    data = request.get_json()
    
    exercise_ids = data.get('exercise_ids', [])
    
    if not exercise_ids:
        return jsonify({"error": "No exercise IDs provided"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT exercise_id, score, total_questions, percentage, time_taken_seconds, 
                   answers, completed_at, retake_count
            FROM user_progress 
            WHERE user_id = %s AND exercise_id = ANY(%s)
        """, (user_id, exercise_ids))
        
        results = cursor.fetchall()
        
        results_dict = {}
        for r in results:
            (ex_id, score, total_q, percentage, time_taken, answers, 
             completed_at, retake_count) = r
            
            results_dict[ex_id] = {
                "score": score,
                "total_questions": total_q,
                "percentage": percentage,
                "time_taken_seconds": time_taken,
                "completed_at": completed_at.isoformat() if completed_at else None,
                "retake_count": retake_count
            }
        
        final_results = {}
        for ex_id in exercise_ids:
            final_results[ex_id] = results_dict.get(ex_id, None)
        
        log_activity(user_id, "batch_results_viewed", f"Viewed results for {len(exercise_ids)} exercises", ip, ua)
        
        return jsonify({
            "results": final_results
        }), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)