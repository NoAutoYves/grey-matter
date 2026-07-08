from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection, return_db_connection
from routes.Extensions import limiter
import time

exercise_list_bp = Blueprint("exercise_list", __name__)

# Simple in-memory cache for exercise data
exercise_cache = {}
CACHE_TTL = 300  # 5 minutes

def get_cached_or_fetch(cache_key, fetch_function, *args, **kwargs):
    """Get data from cache or fetch and store it"""
    current_time = time.time()
    
    if cache_key in exercise_cache:
        cached_data, cached_time = exercise_cache[cache_key]
        if current_time - cached_time < CACHE_TTL:
            return cached_data
    
    data = fetch_function(*args, **kwargs)
    if data is not None:
        exercise_cache[cache_key] = (data, current_time)
    return data

def clear_exercise_cache():
    """Clear the exercise cache"""
    exercise_cache.clear()

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

def get_subject_id(subject_name):
    """Get subject_id from subject name"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT subject_id FROM subjects WHERE subject_name ILIKE %s", (subject_name,))
        result = cursor.fetchone()
        return result[0] if result else None
    finally:
        cursor.close()
        return_db_connection(conn)

def check_user_completion(user_id, exercise_id):
    """Check if user has completed a specific exercise"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT progress_id FROM user_progress 
            WHERE user_id = %s AND exercise_id = %s
        """, (user_id, exercise_id))
        
        completed = cursor.fetchone() is not None
        return completed
    finally:
        cursor.close()
        return_db_connection(conn)

def fetch_subject_exercises(subject_id):
    """Fetch exercises for a subject - used with caching"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT e.exercise_id, e.exercise_name, e.exercise_title, 
                   g.grade_level, g.display_name,
                   t.topic_id, t.topic_name, t.display_order as topic_order
            FROM exercises e
            JOIN grades g ON e.grade_id = g.grade_id
            LEFT JOIN topics t ON e.topic_id = t.topic_id
            WHERE e.subject_id = %s AND e.is_published = TRUE
            ORDER BY g.grade_level, t.display_order, e.display_order, e.exercise_id
        """, (subject_id,))
        return cursor.fetchall()
    finally:
        cursor.close()
        return_db_connection(conn)

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
    
    try:
        # Try to get from cache first
        cache_key = f"subject_exercises_{subject_id}"
        exercises_data = get_cached_or_fetch(cache_key, fetch_subject_exercises, subject_id)
        
        if exercises_data is None:
            # If cache returned None, fetch directly
            exercises_data = fetch_subject_exercises(subject_id)
            if exercises_data is None:
                return jsonify({"error": "Unable to load exercises", "degraded": True}), 503
        
        # Group by grade, then by topic
        result = []
        grades_dict = {}
        
        for ex in exercises_data:
            exercise_id, exercise_name, exercise_title, grade_level, grade_display, topic_id, topic_name, topic_order = ex
            
            if not exercise_title:
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
            
            if grade_level not in grades_dict:
                grades_dict[grade_level] = {
                    "grade_level": grade_level,
                    "grade_display": grade_display,
                    "topics": {}
                }
            
            topic_key = topic_id if topic_id else 0
            topic_display = topic_name if topic_name else "General"
            
            if topic_key not in grades_dict[grade_level]["topics"]:
                grades_dict[grade_level]["topics"][topic_key] = {
                    "topic_id": topic_key,
                    "topic_name": topic_display,
                    "exercises": []
                }
            
            grades_dict[grade_level]["topics"][topic_key]["exercises"].append(exercise)
        
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
    
    except Exception as e:
        log_activity(user_id, "exercise_list_error", f"Error: {str(e)}", ip, ua)
        # Return cached data if available
        cache_key = f"subject_exercises_{subject_id}"
        if cache_key in exercise_cache:
            cached_data, _ = exercise_cache[cache_key]
            return jsonify({
                "subject_name": subject.capitalize(),
                "grades": cached_data,
                "degraded": True,
                "message": "Using cached data - some information may be outdated"
            }), 200
        return jsonify({"error": "Unable to load exercises", "degraded": True}), 503

@exercise_list_bp.route("/exercises/<subject>/topics", methods=["GET"])
def subject_topics_list(subject):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if "user_id" not in session:
        log_activity(None, "topics_list_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session["user_id"]
    
    subject_id = get_subject_id(subject)
    if not subject_id:
        log_activity(user_id, "topics_list_failed", f"Subject not found: {subject}", ip, ua)
        return jsonify({"error": "Subject not found"}), 404
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT DISTINCT t.topic_id, t.topic_name, t.display_order,
                   g.grade_level, g.display_name as grade_display
            FROM topics t
            JOIN exercises e ON t.topic_id = e.topic_id
            JOIN grades g ON e.grade_id = g.grade_id
            WHERE e.subject_id = %s AND e.is_published = TRUE
            ORDER BY g.grade_level, t.display_order, t.topic_name
        """, (subject_id,))
        
        topics_data = cursor.fetchall()
        
        grouped_topics = {}
        for topic in topics_data:
            topic_id, topic_name, display_order, grade_level, grade_display = topic
            
            if grade_level not in grouped_topics:
                grouped_topics[grade_level] = {
                    "grade_level": grade_level,
                    "grade_display": grade_display,
                    "topics": []
                }
            
            grouped_topics[grade_level]["topics"].append({
                "topic_id": topic_id,
                "topic_name": topic_name
            })
        
        result = [grouped_topics[grade] for grade in sorted(grouped_topics.keys())]
        
        log_activity(user_id, "topics_list_view", f"Viewed {subject} topics", ip, ua)
        
        return jsonify({
            "subject_name": subject.capitalize(),
            "grouped_topics": result
        }), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)

@exercise_list_bp.route("/exercises/<subject>/topic/<int:topic_id>", methods=["GET"])
def exercises_by_topic(subject, topic_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if "user_id" not in session:
        log_activity(None, "exercises_by_topic_failed", "Not logged in", ip, ua)
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session["user_id"]
    
    subject_id = get_subject_id(subject)
    if not subject_id:
        log_activity(user_id, "exercises_by_topic_failed", f"Subject not found: {subject}", ip, ua)
        return jsonify({"error": "Subject not found"}), 404
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT topic_name FROM topics WHERE topic_id = %s
        """, (topic_id,))
        
        topic_result = cursor.fetchone()
        if not topic_result:
            return jsonify({"error": "Topic not found"}), 404
        
        topic_name = topic_result[0]
        
        cursor.execute("""
            SELECT e.exercise_id, e.exercise_name, e.exercise_title
            FROM exercises e
            WHERE e.subject_id = %s AND e.topic_id = %s AND e.is_published = TRUE
            ORDER BY e.display_order, e.exercise_id
        """, (subject_id, topic_id))
        
        exercises_data = cursor.fetchall()
        
        exercises = []
        for ex in exercises_data:
            exercise_id, exercise_name, exercise_title = ex
            
            if not exercise_title:
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
            
            exercises.append({
                "exercise_id": exercise_id,
                "exercise_name": exercise_name,
                "exercise_title": formatted_title,
                "completed": completed
            })
        
        log_activity(user_id, "exercises_by_topic_view", f"Viewed {topic_name} exercises", ip, ua)
        
        return jsonify({
            "subject_name": subject.capitalize(),
            "topic_name": topic_name,
            "exercises": exercises
        }), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)

@exercise_list_bp.route("/exercises/batch/progress", methods=["POST"])
@limiter.limit("30 per minute")
def batch_get_exercise_progress():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session["user_id"]
    data = request.get_json()
    
    exercise_ids = data.get('exercise_ids', [])
    
    if not exercise_ids:
        return jsonify({"error": "No exercise IDs provided"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT exercise_id, score, total_questions, percentage, completed_at, retake_count
            FROM user_progress 
            WHERE user_id = %s AND exercise_id = ANY(%s)
        """, (user_id, exercise_ids))
        
        results = cursor.fetchall()
        
        progress_dict = {}
        for r in results:
            exercise_id, score, total_q, percentage, completed_at, retake_count = r
            progress_dict[exercise_id] = {
                "score": score,
                "total_questions": total_q,
                "percentage": percentage,
                "completed_at": completed_at.isoformat() if completed_at else None,
                "retake_count": retake_count,
                "completed": True
            }
        
        final_results = {}
        for ex_id in exercise_ids:
            if ex_id in progress_dict:
                final_results[ex_id] = progress_dict[ex_id]
            else:
                final_results[ex_id] = {
                    "completed": False,
                    "score": None,
                    "total_questions": None,
                    "percentage": None,
                    "completed_at": None,
                    "retake_count": 0
                }
        
        log_activity(user_id, "batch_progress_fetched", f"Fetched progress for {len(exercise_ids)} exercises", ip, ua)
        
        return jsonify({
            "progress": final_results
        }), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)

@exercise_list_bp.route("/exercises/batch/subject-stats", methods=["GET"])
def batch_subject_stats():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')
    
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    user_id = session["user_id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT s.subject_id, s.subject_name, s.subject_code, s.icon,
                   COUNT(e.exercise_id) as total_exercises
            FROM subjects s
            LEFT JOIN exercises e ON s.subject_id = e.subject_id AND e.is_published = TRUE
            WHERE s.is_active = TRUE
            GROUP BY s.subject_id, s.subject_name, s.subject_code, s.icon
            ORDER BY s.display_order, s.subject_name
        """)
        
        subjects_data = cursor.fetchall()
        
        cursor.execute("""
            SELECT e.subject_id, COUNT(up.progress_id) as completed_count
            FROM user_progress up
            JOIN exercises e ON up.exercise_id = e.exercise_id
            WHERE up.user_id = %s AND e.is_published = TRUE
            GROUP BY e.subject_id
        """, (user_id,))
        
        progress_data = cursor.fetchall()
        
        progress_map = {}
        for p in progress_data:
            progress_map[p[0]] = p[1]
        
        subjects = []
        for s in subjects_data:
            subject_id, subject_name, subject_code, icon, total_exercises = s
            completed_count = progress_map.get(subject_id, 0)
            
            subjects.append({
                "subject_id": subject_id,
                "subject_name": subject_name,
                "subject_code": subject_code,
                "icon": icon,
                "total_exercises": total_exercises,
                "completed_exercises": completed_count,
                "progress_percentage": round((completed_count / total_exercises * 100), 1) if total_exercises > 0 else 0
            })
        
        log_activity(user_id, "batch_subject_stats", "Fetched subject stats", ip, ua)
        
        return jsonify({
            "subjects": subjects
        }), 200
    
    finally:
        cursor.close()
        return_db_connection(conn)