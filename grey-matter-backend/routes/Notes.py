from flask import Blueprint, jsonify, session, request
from routes.db import get_db_connection, return_db_connection
from routes.Extensions import limiter

notes_bp = Blueprint('notes', __name__)


@notes_bp.route("/exercise/notes/<int:exercise_id>", methods=["GET"])
@limiter.limit("120 per minute")
def get_exercise_notes(exercise_id):
    """Get chapter notes for a specific exercise"""
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')

    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user_id = session['user_id']

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT e.subject_id, e.grade_id, e.topic_id,
                   s.subject_name, g.grade_level, t.topic_name,
                   t.notes as topic_notes
            FROM exercises e
            JOIN subjects s ON e.subject_id = s.subject_id
            JOIN grades g ON e.grade_id = g.grade_id
            LEFT JOIN topics t ON e.topic_id = t.topic_id
            WHERE e.exercise_id = %s AND e.is_published = TRUE
        """, (exercise_id,))

        result = cursor.fetchone()

        if not result:
            cursor.close()
            conn.close()
            return jsonify({"error": "Exercise not found"}), 404

        subject_id, grade_id, topic_id, subject_name, grade_level, topic_name, topic_notes = result

        if topic_notes:
            notes_content = topic_notes
            notes_source = "topic"
        else:
            cursor.execute("""
                SELECT notes FROM subject_grade_notes
                WHERE subject_id = %s AND grade_id = %s
            """, (subject_id, grade_id))

            fallback = cursor.fetchone()
            if fallback:
                notes_content = fallback[0]
                notes_source = "subject_grade"
            else:
                notes_content = None
                notes_source = None

        cursor.close()
        conn.close()

        return jsonify({
            "notes": notes_content,
            "source": notes_source,
            "subject": subject_name,
            "grade": grade_level,
            "topic": topic_name,
        }), 200

    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({"error": str(e)}), 500


@notes_bp.route("/notes/topic/<int:topic_id>", methods=["GET"])
@limiter.limit("120 per minute")
def get_topic_notes(topic_id):
    """Get notes for a specific topic"""
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT topic_name, notes
            FROM topics
            WHERE topic_id = %s
        """, (topic_id,))

        result = cursor.fetchone()

        if not result:
            cursor.close()
            conn.close()
            return jsonify({"error": "Topic not found"}), 404

        topic_name, notes = result

        cursor.close()
        conn.close()

        return jsonify({
            "topic_name": topic_name,
            "notes": notes,
        }), 200

    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({"error": str(e)}), 500


@notes_bp.route("/notes/subject/<int:subject_id>/grade/<int:grade_id>", methods=["GET"])
@limiter.limit("120 per minute")
def get_subject_grade_notes(subject_id, grade_id):
    """Get notes for a specific subject and grade combination"""
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT notes FROM subject_grade_notes
            WHERE subject_id = %s AND grade_id = %s
        """, (subject_id, grade_id))

        result = cursor.fetchone()

        cursor.close()
        conn.close()

        if result:
            return jsonify({"notes": result[0]}), 200
        return jsonify({"notes": None, "message": "No notes available"}), 404

    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({"error": str(e)}), 500


@notes_bp.route("/admin/notes/update", methods=["POST"])
def update_topic_notes():
    """Admin endpoint to update notes for a topic"""
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', '')

    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT is_admin FROM users WHERE user_id = %s", (session['user_id'],))
    is_admin = cursor.fetchone()
    cursor.close()
    conn.close()

    if not is_admin or not is_admin[0]:
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    topic_id = data.get('topic_id')
    notes = data.get('notes')

    if not topic_id:
        return jsonify({"error": "Topic ID required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE topics
            SET notes = %s, updated_at = NOW()
            WHERE topic_id = %s
            RETURNING topic_id
        """, (notes, topic_id))

        result = cursor.fetchone()
        conn.commit()

        if result:
            cursor.close()
            conn.close()
            return jsonify({"success": True, "topic_id": topic_id}), 200
        cursor.close()
        conn.close()
        return jsonify({"error": "Topic not found"}), 404

    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": str(e)}), 500