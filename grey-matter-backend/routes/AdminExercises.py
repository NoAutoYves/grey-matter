from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection, return_db_connection
from routes.Extensions import limiter
import base64
import time

admin_exercises_bp = Blueprint('admin_exercises', __name__)

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

def get_topics_data(subject_id, grade_id, topic_name, topic_url):
    """Helper function to handle topic creation/lookup"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        print(f"DEBUG: topic_url='{topic_url}', topic_name='{topic_name}'")
        
        # If topic_url is not provided, generate one
        if not topic_url:
            topic_url = f"topic_{grade_id}_{subject_id}_{int(time.time())}"
            print(f"DEBUG: Generated topic_url='{topic_url}'")
        
        # If topic_name is not provided, use "General"
        if not topic_name:
            topic_name = "General"
        
        # Check if topic_url already exists
        cursor.execute("SELECT topic_id FROM topics WHERE topic_url = %s", (topic_url,))
        existing = cursor.fetchone()
        if existing:
            topic_id = existing[0]
            print(f"DEBUG: Found existing topic {topic_id}")
            return topic_id
        
        # Create new topic
        cursor.execute("""
            INSERT INTO topics (subject_id, grade_id, topic_name, topic_url)
            VALUES (%s, %s, %s, %s) RETURNING topic_id
        """, (subject_id, grade_id, topic_name, topic_url))
        topic_id = cursor.fetchone()[0]
        conn.commit()
        print(f"DEBUG: Created new topic {topic_id}")
        return topic_id
        
    except Exception as e:
        print(f"DEBUG: Error in get_topics_data: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_exercises_bp.route("/admin/exercises", methods=["POST"])
@limiter.limit("10 per minute")
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
    topic_name = data.get('topic_name')
    topic_url = data.get('topic_url')
    exercise_name = data.get('exercise_name')
    exercise_title = data.get('exercise_title')
    questions = data.get('questions', [])
    
    print(f"DEBUG: grade_id={grade_id}, subject_id={subject_id}, topic_name={topic_name}, topic_url={topic_url}")
    
    if not grade_id or not subject_id or not exercise_name or not questions:
        log_activity(session['user_id'], "admin_create_exercise_failed", "Missing required fields", ip, ua)
        return jsonify({"error": "Missing required fields"}), 400
    
    if len(questions) != 10:
        log_activity(session['user_id'], "admin_create_exercise_failed", f"Wrong question count: {len(questions)}", ip, ua)
        return jsonify({"error": "Must have exactly 10 questions"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Handle topic creation with grade_id and topic_url
        topic_id = get_topics_data(subject_id, grade_id, topic_name, topic_url)
        
        cursor.execute("""
            INSERT INTO exercises (grade_id, subject_id, topic_id, exercise_name, exercise_title, total_questions)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING exercise_id
        """, (grade_id, subject_id, topic_id, exercise_name, exercise_title, 10))
        
        exercise_id = cursor.fetchone()[0]
        print(f"DEBUG: Created exercise {exercise_id}")
        
        for i, q in enumerate(questions):
            image_data = None
            image_mime_type = None
            image_url = q.get('image_url')
            
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
                INSERT INTO questions (exercise_id, question_text, option_a, option_b, option_c, option_d, correct_answer, image_data, image_mime_type, image_url, display_order)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (exercise_id, q['text'], q['option_a'], q['option_b'], q['option_c'], q['option_d'], q['answer'], image_data, image_mime_type, image_url, i))
        
        conn.commit()
        
        log_activity(session['user_id'], "admin_create_exercise", f"Created exercise '{exercise_name}' (ID: {exercise_id}) with {len(questions)} questions", ip, ua)
        
        return jsonify({"success": True, "exercise_id": exercise_id}), 201
        
    except Exception as e:
        conn.rollback()
        print(f"ERROR: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_exercises_bp.route("/admin/exercises", methods=["GET"])
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
                   s.subject_name, g.grade_level,
                   COUNT(q.question_id) as question_count
            FROM exercises e
            JOIN subjects s ON e.subject_id = s.subject_id
            JOIN grades g ON e.grade_id = g.grade_id
            LEFT JOIN questions q ON e.exercise_id = q.exercise_id
            GROUP BY e.exercise_id, s.subject_name, g.grade_level
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
                "question_count": ex[6] or 0
            })
        
        log_activity(session['user_id'], "admin_list_exercises", f"Listed {len(exercise_list)} exercises", ip, ua)
        
        return jsonify({"exercises": exercise_list}), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_exercises_bp.route("/admin/exercises/<int:exercise_id>/publish", methods=["PUT"])
def toggle_publish(exercise_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403
    
    data = request.get_json()
    is_published = data.get('is_published', False)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE exercises SET is_published = %s WHERE exercise_id = %s", (is_published, exercise_id))
        conn.commit()
        
        log_activity(session['user_id'], "admin_toggle_publish", f"Exercise {exercise_id} published: {is_published}", ip, ua)
        
        return jsonify({"success": True}), 200
    finally:
        cursor.close()
        return_db_connection(conn)

@admin_exercises_bp.route("/admin/exercises/<int:exercise_id>", methods=["DELETE"])
def delete_exercise(exercise_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM questions WHERE exercise_id = %s", (exercise_id,))
        cursor.execute("DELETE FROM exercises WHERE exercise_id = %s", (exercise_id,))
        conn.commit()
        
        log_activity(session['user_id'], "admin_delete_exercise", f"Deleted exercise {exercise_id}", ip, ua)
        
        return jsonify({"success": True}), 200
    finally:
        cursor.close()
        return_db_connection(conn)