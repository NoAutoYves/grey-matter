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
    
    # Get exercises with grade and topic information (no term)
    cursor.execute("""
        SELECT e.exercise_id, e.exercise_name, e.exercise_title, 
               g.grade_level, g.display_name,
               tp.topic_id, tp.topic_name, tp.display_order as topic_order
        FROM exercises e
        JOIN grades g ON e.grade_id = g.grade_id
        LEFT JOIN topics tp ON e.topic_id = tp.topic_id
        WHERE e.subject_id = %s AND e.is_published = TRUE
        ORDER BY g.grade_level, tp.display_order, e.display_order, e.exercise_id
    """, (subject_id,))
    
    exercises_data = cursor.fetchall()
    cursor.close()
    conn.close()
    
    # Group by grade, then by topic
    result = []
    grades_dict = {}
    
    for ex in exercises_data:
        exercise_id, exercise_name, exercise_title, grade_level, grade_display, topic_id, topic_name, topic_order = ex
        
        # Format exercise title
        if not exercise_title:
            # Convert exercise_name like "breathing_exercise_1" to "Breathing - Exercise 1"
            parts = exercise_name.split('_')
            if len(parts) >= 3 and parts[-2] == 'exercise':
                topic_part = ' '.join(parts[:-2]).title()
                exercise_num = parts[-1]
                formatted_title = f"{topic_part} - Exercise {exercise_num}"
            else:
                formatted_title = exercise_name.replace('_', ' ').title()
        else:
            formatted_title = exercise_title
        
        completed = check_user_completion(user_id, exercise_id)
        
        exercise = {
            "exercise_id": exercise_id,
            "exercise_name": exercise_name,
            "exercise_title": formatted_title,
            "completed": completed
        }
        
        # Create grade structure
        if grade_level not in grades_dict:
            grades_dict[grade_level] = {
                "grade_level": grade_level,
                "grade_display": grade_display,
                "topics": {}
            }
        
        # Handle topic (if no topic, put in "General" topic)
        topic_key = topic_id if topic_id else 0
        topic_display = topic_name if topic_name else "General"
        
        if topic_key not in grades_dict[grade_level]["topics"]:
            grades_dict[grade_level]["topics"][topic_key] = {
                "topic_id": topic_key,
                "topic_name": topic_display,
                "exercises": []
            }
        
        grades_dict[grade_level]["topics"][topic_key]["exercises"].append(exercise)
    
    # Convert nested dictionaries to lists for JSON response
    for grade_level in sorted(grades_dict.keys()):
        grade = grades_dict[grade_level]
        topics_list = []
        
        for topic_id in sorted(grade["topics"].keys()):
            topic = grade["topics"][topic_id]
            topics_list.append({
                "topic_id": topic["topic_id"],
                "topic_name": topic["topic_name"],
                "exercises": topic["exercises"]
            })
        
        result.append({
            "grade_level": grade["grade_level"],
            "grade_display": grade["grade_display"],
            "topics": topics_list
        })
    
    total_exercises = sum(
        len(ex)
        for grade in result
        for topic in grade["topics"]
        for ex in topic["exercises"]
    )
    completed_exercises = sum(
        1
        for grade in result
        for topic in grade["topics"]
        for ex in topic["exercises"]
        if ex["completed"]
    )
    
    log_activity(user_id, "exercise_list_view", f"Viewed {subject} exercises: {completed_exercises}/{total_exercises} completed", ip, ua)
    
    return jsonify({
        "subject_name": subject.capitalize(),
        "grades": result
    }), 200