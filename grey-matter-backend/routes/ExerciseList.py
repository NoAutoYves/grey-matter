from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection

exercise_list_bp = Blueprint("exercise_list", __name__)

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

def get_subject_id(subject_name):
    """Get subject_id from subject name"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT subject_id FROM subjects WHERE subject_name ILIKE %s", (subject_name,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return result[0] if result else None

def check_user_completion(user_id, exercise_id):
    """Check if user has completed a specific exercise"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT progress_id FROM user_progress 
        WHERE user_id = %s AND exercise_id = %s
    """, (user_id, exercise_id))
    
    completed = cursor.fetchone() is not None
    cursor.close()
    conn.close()
    
    return completed

@exercise_list_bp.route("/exercises/<subject>", methods=["GET"])
def subject_exercise_list(subject):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if "user_id" not in session:
        log_activity(None, "exercise_list_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session["user_id"]
    
    subject_id = get_subject_id(subject)
    if not subject_id:
        log_activity(user_id, "exercise_list_failed", f"Subject not found: {subject}", ip, ua)
        return jsonify({"error": "Subject not found"}), 404
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get exercises with grade information
    cursor.execute("""
        SELECT e.exercise_id, e.exercise_name, e.exercise_title, 
               g.grade_level, g.display_name
        FROM exercises e
        JOIN grades g ON e.grade_id = g.grade_id
        WHERE e.subject_id = %s AND e.is_published = TRUE
        ORDER BY g.grade_level, e.display_order, e.exercise_id
    """, (subject_id,))
    
    exercises_data = cursor.fetchall()
    cursor.close()
    conn.close()
    
    # Group by grade
    exercises_by_grade = {}
    for ex in exercises_data:
        exercise_id, exercise_name, exercise_title, grade_level, grade_display = ex
        completed = check_user_completion(user_id, exercise_id)
        
        exercise = {
            "exercise_id": exercise_id,
            "exercise_name": exercise_name,
            "exercise_title": exercise_title or exercise_name.replace("_", " ").title(),
            "completed": completed
        }
        
        if grade_level not in exercises_by_grade:
            exercises_by_grade[grade_level] = {
                "grade_level": grade_level,
                "grade_display": grade_display,
                "exercises": []
            }
        exercises_by_grade[grade_level]["exercises"].append(exercise)
    
    # Convert to sorted list
    result = {
        "subject_name": subject.capitalize(),
        "grades": [exercises_by_grade[g] for g in sorted(exercises_by_grade.keys())]
    }
    
    total_exercises = sum(len(grade["exercises"]) for grade in result["grades"])
    completed_exercises = sum(1 for grade in result["grades"] for ex in grade["exercises"] if ex["completed"])
    
    log_activity(user_id, "exercise_list_view", f"Viewed {subject} exercises: {completed_exercises}/{total_exercises} completed", ip, ua)
    
    return jsonify(result), 200