from flask import Blueprint, jsonify, request
from routes.db import get_db_connection, return_db_connection
from routes.Extensions import limiter

search_bp = Blueprint('search', __name__)

SUBJECT_SLUGS = {
    'accounting': 'accounting',
    'business': 'business',
    'economics': 'economics',
    'geography': 'geography',
    'life science': 'life-science',
    'physics': 'physics',
    'mathematical literacy': 'maths-lit',
    'maths literacy': 'maths-lit',
    'mathematics': 'mathematics',
}


def slug_for(subject_name):
    if not subject_name:
        return ''
    key = subject_name.lower()
    return SUBJECT_SLUGS.get(key, key.replace(' ', '-'))


@search_bp.route("/search", methods=["GET"])
@limiter.limit("60 per minute")
def search():
    """Public search across topics and exercises. Minimum 2 characters."""
    q = (request.args.get("q") or "").strip()
    if len(q) < 2:
        return jsonify({"topics": [], "exercises": []}), 200

    pattern = f"%{q}%"

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT DISTINCT t.topic_id, t.topic_name, s.subject_name, g.grade_level
            FROM topics t
            JOIN subjects s ON t.subject_id = s.subject_id
            JOIN grades g ON t.grade_id = g.grade_id
            WHERE t.topic_name ILIKE %s AND s.is_active = TRUE
            ORDER BY s.subject_name, g.grade_level, t.topic_name
            LIMIT 15
        """, (pattern,))
        topics = cursor.fetchall()

        cursor.execute("""
            SELECT DISTINCT e.exercise_id, e.exercise_title, t.topic_id,
                   t.topic_name, s.subject_name, g.grade_level
            FROM exercises e
            JOIN topics t ON e.topic_id = t.topic_id
            JOIN subjects s ON e.subject_id = s.subject_id
            JOIN grades g ON e.grade_id = g.grade_id
            WHERE e.exercise_title ILIKE %s AND e.is_published = TRUE
            ORDER BY s.subject_name, g.grade_level, e.exercise_title
            LIMIT 15
        """, (pattern,))
        exercises = cursor.fetchall()

        return jsonify({
            "topics": [
                {
                    "topic_id": t[0],
                    "topic_name": t[1],
                    "subject_name": t[2],
                    "subject_slug": slug_for(t[2]),
                    "grade_level": t[3],
                }
                for t in topics
            ],
            "exercises": [
                {
                    "exercise_id": e[0],
                    "exercise_title": e[1],
                    "topic_id": e[2],
                    "topic_name": e[3],
                    "subject_name": e[4],
                    "subject_slug": slug_for(e[4]),
                    "grade_level": e[5],
                }
                for e in exercises
            ],
        }), 200

    finally:
        cursor.close()
        return_db_connection(conn)