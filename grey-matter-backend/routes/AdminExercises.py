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


def get_or_create_topic(cursor, subject_id, grade_id, topic_name, topic_url):
    if not topic_url:
        topic_url = f"topic_{grade_id}_{subject_id}_{int(time.time())}"
    if not topic_name:
        topic_name = "General"

    cursor.execute("SELECT topic_id FROM topics WHERE topic_url = %s", (topic_url,))
    existing = cursor.fetchone()
    if existing:
        return existing[0]

    cursor.execute("""
        INSERT INTO topics (subject_id, grade_id, topic_name, topic_url)
        VALUES (%s, %s, %s, %s) RETURNING topic_id
    """, (subject_id, grade_id, topic_name, topic_url))
    return cursor.fetchone()[0]


@admin_exercises_bp.route("/admin/exercises", methods=["POST"])
@limiter.limit("10 per minute")
def create_exercise():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')

    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json() or {}
    grade_id = data.get('grade_id')
    subject_id = data.get('subject_id')
    topic_name = data.get('topic_name')
    topic_url = data.get('topic_url')
    exercise_name = data.get('exercise_name')
    exercise_title = data.get('exercise_title')
    questions = data.get('questions', [])

    if not grade_id or not subject_id or not exercise_name or not questions:
        return jsonify({"error": "Missing required fields"}), 400

    if len(questions) != 10:
        return jsonify({"error": "Must have exactly 10 questions"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        topic_id = get_or_create_topic(cursor, subject_id, grade_id, topic_name, topic_url)

        cursor.execute("""
            INSERT INTO exercises (grade_id, subject_id, topic_id, exercise_name, exercise_title, total_questions)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING exercise_id
        """, (grade_id, subject_id, topic_id, exercise_name, exercise_title, 10))

        exercise_id = cursor.fetchone()[0]

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

        log_activity(session['user_id'], "admin_create_exercise",
                     f"Created exercise '{exercise_name}' (ID: {exercise_id}) with {len(questions)} questions", ip, ua)

        return jsonify({"success": True, "exercise_id": exercise_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_db_connection(conn)


@admin_exercises_bp.route("/admin/exercises", methods=["GET"])
def get_admin_exercises():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')

    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    if not admin_required():
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
        return jsonify({
            "exercises": [
                {
                    "exercise_id": ex[0],
                    "exercise_name": ex[1],
                    "exercise_title": ex[2],
                    "is_published": ex[3],
                    "subject_name": ex[4],
                    "grade_level": ex[5],
                    "question_count": ex[6] or 0
                } for ex in exercises
            ]
        }), 200
    finally:
        cursor.close()
        return_db_connection(conn)


@admin_exercises_bp.route("/admin/exercises/<int:exercise_id>/usage", methods=["GET"])
@limiter.limit("120 per minute")
def get_exercise_usage(exercise_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')

    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM user_progress WHERE exercise_id = %s", (exercise_id,))
        progress = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM user_notes WHERE exercise_id = %s", (exercise_id,))
        notes = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM user_feedback WHERE exercise_id = %s", (exercise_id,))
        feedback = cursor.fetchone()[0]

        return jsonify({
            "user_progress": progress,
            "user_notes": notes,
            "user_feedback": feedback,
            "total": progress + notes + feedback,
        }), 200
    finally:
        cursor.close()
        return_db_connection(conn)


@admin_exercises_bp.route("/admin/exercises/<int:exercise_id>", methods=["PUT"])
@limiter.limit("30 per minute")
def update_exercise(exercise_id):
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')

    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json() or {}
    new_name = data.get('exercise_name')
    new_title = data.get('exercise_title')

    if not new_name or not new_title:
        return jsonify({"error": "exercise_name and exercise_title are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE exercises
            SET exercise_name = %s, exercise_title = %s, updated_at = NOW()
            WHERE exercise_id = %s
            RETURNING exercise_id
        """, (new_name, new_title, exercise_id))

        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Exercise not found"}), 404
        conn.commit()

        log_activity(session['user_id'], "admin_update_exercise",
                     f"Updated exercise {exercise_id}: name={new_name}, title={new_title}", ip, ua)

        return jsonify({"success": True}), 200
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

    data = request.get_json() or {}
    is_published = data.get('is_published', False)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE exercises SET is_published = %s WHERE exercise_id = %s", (is_published, exercise_id))
        conn.commit()

        log_activity(session['user_id'], "admin_toggle_publish",
                     f"Exercise {exercise_id} published: {is_published}", ip, ua)

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
        cursor.execute("SELECT COUNT(*) FROM user_progress WHERE exercise_id = %s", (exercise_id,))
        progress_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM user_notes WHERE exercise_id = %s", (exercise_id,))
        notes_count = cursor.fetchone()[0]

        cursor.execute("DELETE FROM questions WHERE exercise_id = %s", (exercise_id,))
        cursor.execute("DELETE FROM exercises WHERE exercise_id = %s", (exercise_id,))
        conn.commit()

        log_activity(session['user_id'], "admin_delete_exercise",
                     f"Deleted exercise {exercise_id} (cascaded: {progress_count} progress, {notes_count} notes)", ip, ua)

        return jsonify({
            "success": True,
            "cascaded": {"user_progress": progress_count, "user_notes": notes_count}
        }), 200
    finally:
        cursor.close()
        return_db_connection(conn)