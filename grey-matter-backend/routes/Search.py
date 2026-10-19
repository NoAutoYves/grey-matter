"""
routes/Search.py — public search across subjects, topics, and exercises.

Handles natural-language queries with grade, subject, structural keyword,
and free-text extraction, then runs hybrid FTS + ILIKE matching.

Examples:
    "grade 10"                  → all grade 10 topics + subject cards
    "physics"                   → Physics subject card, all its topics,
                                   plus its most-completed exercises
    "grade 10 physics"          → Physics topics and exercises at grade 10
    "circuits"                  → topics + exercises matching "circuits"
    "grade 12 economics budget" → grade 12 economics topics and exercises
                                   matching "budget"
    "notes on vectors"          → topics matching "vectors", exercises skipped
    "budget exercise"           → exercises matching "budget", topics skipped
    "maths lit"                 → Mathematical Literacy
    "mathemetics grade 10"      → Physics-like fuzzy match (typo tolerance)
    "section 12"                → NOT parsed as grade 12 (bound protection)
"""

from flask import Blueprint, jsonify, request
from routes.db import get_db_connection, return_db_connection
from routes.Extensions import limiter
from difflib import SequenceMatcher
import re


search_bp = Blueprint("search", __name__)


# ── Subject aliases → canonical DB subject_name ─────────────────────
SUBJECT_ALIASES = {
    "accounting": "Accounting",
    "accounts": "Accounting",
    "business": "Business",
    "business studies": "Business",
    "economics": "Economics",
    "econ": "Economics",
    "geography": "Geography",
    "geo": "Geography",
    "life science": "Life Science",
    "life sciences": "Life Science",
    "life-science": "Life Science",
    "biology": "Life Science",
    "physics": "Physics",
    "physical science": "Physics",
    "physical sciences": "Physics",
    "physical-sciences": "Physics",
    "mathematics": "Mathematics",
    "maths": "Mathematics",
    "math": "Mathematics",
    "mathematical literacy": "Mathematical Literacy",
    "maths literacy": "Mathematical Literacy",
    "maths lit": "Mathematical Literacy",
    "math lit": "Mathematical Literacy",
    "maths-lit": "Mathematical Literacy",
}
_ALIASES_SORTED = sorted(SUBJECT_ALIASES.keys(), key=len, reverse=True)


SUBJECT_SLUGS = {
    "Accounting": "accounting",
    "Business": "business",
    "Economics": "economics",
    "Geography": "geography",
    "Life Science": "life-science",
    "Physics": "physics",
    "Mathematics": "mathematics",
    "Mathematical Literacy": "maths-literacy",
}

GRADE_LEVEL_TO_ID = {10: 3, 11: 4, 12: 5}
GRADE_ID_TO_LEVEL = {3: 10, 4: 11, 5: 12}

_STOPWORDS = {
    "a", "an", "the", "of", "in", "on", "at", "by", "for", "to",
    "from", "with", "and", "or", "about", "over",
}


# ── Fuzzy subject matching ─────────────────────────────────────────

def _fuzzy_match_subject(q, threshold=0.82, min_len=6):
    """
    Fallback when no exact alias matched. Tries each query token against
    single-word aliases using SequenceMatcher. Returns (matched_token, subject)
    or (None, None).

    Threshold 0.82 catches:
      "physic"     → physics    (0.92)
      "mathemetics"→ mathematics (0.91)
      "economic"   → economics  (0.94)
    Rejects:
      "circuit"    → physics    (0.57)
      "budget"     → business   (0.57)
    """
    tokens = re.findall(r"[a-z]+", q.lower())
    for token in tokens:
        if len(token) < min_len:
            continue
        for alias in _ALIASES_SORTED:
            if " " in alias or "-" in alias:
                continue
            if abs(len(token) - len(alias)) > 2:
                continue
            if SequenceMatcher(None, token, alias).ratio() >= threshold:
                return token, SUBJECT_ALIASES[alias]
    return None, None


# ── Query parsing ──────────────────────────────────────────────────

def _extract_structural(q):
    """
    Strip 'notes'/'exercises' as structural keywords with position awareness.
    Returns (remaining_query, only_notes, only_exercises).

    Rules (per critique):
      - Leading position: strip ('notes on X', 'notes X')
      - Trailing position: strip ('X notes')
      - Adjacent to preposition ('on'/'about'/'for'): strip
      - Mid-query without preposition: keep as content term
    """
    only_notes = False
    only_exercises = False

    notes_patterns = [
        r"^\s*notes?\s+(?:on|about|for|in)\s+",
        r"^\s*notes?\s+",
        r"\s+notes?\s+(?:on|about|for|in)\s+",
        r"\s+notes?\s*$",
    ]
    for pat in notes_patterns:
        if re.search(pat, q):
            only_notes = True
            q = re.sub(pat, " ", q, count=1)
            break
    if not only_notes and re.fullmatch(r"\s*notes?\s*", q):
        only_notes = True
        q = ""

    exercises_patterns = [
        r"^\s*exercises?\s+(?:on|about|for|in)\s+",
        r"^\s*exercises?\s+",
        r"\s+exercises?\s+(?:on|about|for|in)\s+",
        r"\s+exercises?\s*$",
    ]
    for pat in exercises_patterns:
        if re.search(pat, q):
            only_exercises = True
            q = re.sub(pat, " ", q, count=1)
            break
    if not only_exercises and re.fullmatch(r"\s*exercises?\s*", q):
        only_exercises = True
        q = ""

    return q, only_notes, only_exercises


def _parse_query(raw):
    """Extract grade, subject, structural flags, and free-text terms."""
    q = (raw or "").strip().lower()
    parsed = {
        "grade": None,
        "subject": None,
        "terms": [],
        "only_notes": False,
        "only_exercises": False,
        "raw": raw,
    }
    if not q:
        return parsed

    # ── 1. Grade with explicit prefix: "grade 10", "gr. 10", "g10" ──
    m = re.search(r"\b(?:grade|gr\.?|g)\s*(\d{1,2})\b", q)
    if m:
        candidate = int(m.group(1))
        if candidate in (10, 11, 12):
            parsed["grade"] = candidate
            q = q[: m.start()] + " " + q[m.end():]
        # Non-10-12 numbers left as words — platform only covers 10-12.

    # ── 2. Subject exact match (longest alias wins) ─────────────
    for alias in _ALIASES_SORTED:
        pattern = r"\b" + re.escape(alias) + r"\b"
        if re.search(pattern, q):
            parsed["subject"] = SUBJECT_ALIASES[alias]
            q = re.sub(pattern, " ", q)
            break

    # ── 3. Subject fuzzy match (typo tolerance) ─────────────────
    if parsed["subject"] is None:
        matched_token, subject = _fuzzy_match_subject(q)
        if subject:
            parsed["subject"] = subject
            q = re.sub(r"\b" + re.escape(matched_token) + r"\b", " ", q, count=1)

    # ── 4. Bare grade number — bound-protected ──────────────────
    # Only accepts a bare 10/11/12 if after removing the subject and
    # stopwords, the number is the only remaining token. This prevents
    # "section 12 of the constitution" from becoming grade 12.
    if parsed["grade"] is None:
        tokens = re.findall(r"[a-z0-9]+", q)
        content_tokens = [t for t in tokens if t not in _STOPWORDS]
        if len(content_tokens) == 1 and content_tokens[0] in ("10", "11", "12"):
            parsed["grade"] = int(content_tokens[0])
            q = re.sub(r"\b(?:10|11|12)\b", " ", q)

    # ── 5. Structural keywords (position-aware) ─────────────────
    q, parsed["only_notes"], parsed["only_exercises"] = _extract_structural(q)

    # ── 6. Free-text terms ──────────────────────────────────────
    words = re.findall(r"[a-z0-9]+", q)
    parsed["terms"] = [
        w for w in words if len(w) >= 2 and w not in _STOPWORDS
    ]

    return parsed


# ── Query building helpers ────────────────────────────────────────

def _subject_slug(name):
    return SUBJECT_SLUGS.get(name, name.lower().replace(" ", "-"))


def _notes_slug(name):
    if name == "Life Science":
        return "life_science"
    if name == "Mathematical Literacy":
        return "maths_literacy"
    return SUBJECT_SLUGS.get(name, name.lower().replace(" ", "-"))


def _apply_grade_subject_filters(where, params, parsed, grade_col, subject_col):
    if parsed["grade"]:
        grade_id = GRADE_LEVEL_TO_ID.get(parsed["grade"])
        if grade_id:
            where.append(f"{grade_col} = %s")
            params.append(grade_id)
    if parsed["subject"]:
        where.append(f"{subject_col} = %s")
        params.append(parsed["subject"])


def _apply_term_filter(where, params, parsed, name_col):
    """
    Apply free-text terms using hybrid FTS + ILIKE.

    FTS handles word-stem and ordering. ILIKE handles substrings and short
    partial words that FTS would miss. The two are OR-ed at the top level,
    AND-ed per term within ILIKE. Result: a topic matches if EITHER the
    full term list matches via tsquery OR every term matches via substring.
    """
    if not parsed["terms"]:
        return

    fts_clause = (
        f"to_tsvector('english', coalesce({name_col}, '')) "
        f"@@ plainto_tsquery('english', %s)"
    )
    ilike_and = " AND ".join(
        [f"{name_col} ILIKE %s" for _ in parsed["terms"]]
    )

    where.append(f"({fts_clause} OR ({ilike_and}))")
    params.append(" ".join(parsed["terms"]))
    params.extend(f"%{t}%" for t in parsed["terms"])


# ── Queries ────────────────────────────────────────────────────────

def _search_subjects(cursor, parsed):
    if not (parsed["subject"] or parsed["grade"]):
        return []

    where = ["1=1"]
    params = []
    if parsed["subject"]:
        where.append("s.subject_name = %s")
        params.append(parsed["subject"])
    if parsed["grade"]:
        grade_id = GRADE_LEVEL_TO_ID.get(parsed["grade"])
        if grade_id:
            where.append("t.grade_id = %s")
            params.append(grade_id)

    sql = f"""
        SELECT
            s.subject_id,
            s.subject_name,
            COUNT(DISTINCT t.topic_id) AS topic_count,
            COUNT(DISTINCT e.exercise_id)
                FILTER (WHERE e.is_published = TRUE) AS exercise_count
        FROM subjects s
        LEFT JOIN topics t ON t.subject_id = s.subject_id
        LEFT JOIN exercises e ON e.topic_id = t.topic_id
        WHERE {' AND '.join(where)}
        GROUP BY s.subject_id, s.subject_name
        HAVING COUNT(DISTINCT t.topic_id) > 0
        ORDER BY s.subject_name ASC
    """
    cursor.execute(sql, params)
    return cursor.fetchall()


def _search_topics(cursor, parsed, limit=40):
    where = ["1=1"]
    params = []
    _apply_grade_subject_filters(where, params, parsed, "t.grade_id", "s.subject_name")
    _apply_term_filter(where, params, parsed, "t.topic_name")

    sql = f"""
        SELECT
            t.topic_id,
            t.topic_name,
            t.topic_url,
            t.grade_id,
            s.subject_id,
            s.subject_name,
            COUNT(e.exercise_id)
                FILTER (WHERE e.is_published = TRUE) AS exercise_count
        FROM topics t
        JOIN subjects s ON t.subject_id = s.subject_id
        LEFT JOIN exercises e ON e.topic_id = t.topic_id
        WHERE {' AND '.join(where)}
        GROUP BY t.topic_id, t.topic_name, t.topic_url,
                 t.grade_id, s.subject_id, s.subject_name
        ORDER BY
            CASE
                WHEN LOWER(t.topic_name) = %s THEN 0
                WHEN LOWER(t.topic_name) LIKE %s THEN 1
                ELSE 2
            END,
            t.grade_id ASC,
            t.topic_name ASC
        LIMIT %s
    """
    exact = " ".join(parsed["terms"]).strip() or ""
    params.extend([exact, f"{exact}%", limit])
    cursor.execute(sql, params)
    return cursor.fetchall()


def _search_exercises(cursor, parsed, limit=40):
    """
    Search exercises with two modes:

    1. Term search (normal): filter by grade/subject, then AND-match every
       term via FTS+ILIKE on the exercise title.
    2. Fallback when no free-text terms remain: return the most-completed
       exercises for the parsed subject/grade so bare subject queries
       ("physics") never return an empty exercise list.
    """
    where = ["e.is_published = TRUE"]
    params = []
    _apply_grade_subject_filters(where, params, parsed, "e.grade_id", "s.subject_name")

    if parsed["terms"]:
        _apply_term_filter(where, params, parsed, "e.exercise_title")

        sql = f"""
            SELECT
                e.exercise_id,
                e.exercise_title,
                e.exercise_name,
                e.grade_id,
                e.topic_id,
                t.topic_name,
                s.subject_id,
                s.subject_name
            FROM exercises e
            JOIN subjects s ON e.subject_id = s.subject_id
            LEFT JOIN topics t ON e.topic_id = t.topic_id
            WHERE {' AND '.join(where)}
            ORDER BY e.exercise_id ASC
            LIMIT %s
        """
        params.append(limit)
        cursor.execute(sql, params)
        return cursor.fetchall()

    # Fallback path — only when subject or only_exercises was parsed.
    if not (parsed["subject"] or parsed["only_exercises"]):
        return []

    sql = f"""
        SELECT
            e.exercise_id,
            e.exercise_title,
            e.exercise_name,
            e.grade_id,
            e.topic_id,
            t.topic_name,
            s.subject_id,
            s.subject_name
        FROM exercises e
        JOIN subjects s ON e.subject_id = s.subject_id
        LEFT JOIN topics t ON e.topic_id = t.topic_id
        LEFT JOIN user_progress up ON e.exercise_id = up.exercise_id
        WHERE {' AND '.join(where)}
        GROUP BY
            e.exercise_id, e.exercise_title, e.exercise_name,
            e.grade_id, e.topic_id, t.topic_name,
            s.subject_id, s.subject_name
        ORDER BY COUNT(up.progress_id) DESC, e.exercise_id ASC
        LIMIT %s
    """
    params.append(limit)
    cursor.execute(sql, params)
    return cursor.fetchall()


# ── Serialisers ────────────────────────────────────────────────────

def _serialise_subject(row):
    subject_id, subject_name, topic_count, exercise_count = row
    slug = _subject_slug(subject_name)
    return {
        "type": "subject",
        "subject_id": subject_id,
        "subject_name": subject_name,
        "subject_slug": slug,
        "topic_count": topic_count,
        "exercise_count": exercise_count,
        "url": f"/{slug}/",
    }


def _serialise_topic(row):
    (topic_id, topic_name, topic_url, grade_id,
     subject_id, subject_name, exercise_count) = row
    slug = _subject_slug(subject_name)
    return {
        "type": "topic",
        "topic_id": topic_id,
        "topic_name": topic_name,
        "topic_url": topic_url,
        "subject_id": subject_id,
        "subject_name": subject_name,
        "subject_slug": slug,
        "grade": GRADE_ID_TO_LEVEL.get(grade_id),
        "exercise_count": exercise_count,
        "url": f"/{slug}/topic/{topic_id}/",
        "notes_url": f"/notes/{_notes_slug(subject_name)}/{topic_id}/",
    }


def _serialise_exercise(row):
    (exercise_id, exercise_title, exercise_name, grade_id,
     topic_id, topic_name, subject_id, subject_name) = row
    slug = _subject_slug(subject_name)
    return {
        "type": "exercise",
        "exercise_id": exercise_id,
        "exercise_title": exercise_title,
        "exercise_name": exercise_name,
        "topic_id": topic_id,
        "topic_name": topic_name,
        "subject_id": subject_id,
        "subject_name": subject_name,
        "subject_slug": slug,
        "grade": GRADE_ID_TO_LEVEL.get(grade_id),
        "url": f"/{slug}/exercise?exercise_id={exercise_id}",
    }


# ── Endpoint ───────────────────────────────────────────────────────

@search_bp.route("/search", methods=["GET"])
@limiter.limit("60 per minute")
def search():
    """Public search across subjects, topics, and exercises.

    Query params:
      q      — the search string (1–100 chars)
      limit  — optional cap per category (default 40, max 100)
    """
    raw_q = (request.args.get("q") or "").strip()

    if not raw_q:
        return jsonify({
            "query": "",
            "parsed": {"grade": None, "subject": None, "terms": [],
                       "only_notes": False, "only_exercises": False},
            "subjects": [],
            "topics": [],
            "exercises": [],
            "total": 0,
            "truncated": False,
        }), 200

    if len(raw_q) > 100:
        return jsonify({"error": "Query too long (max 100 characters)"}), 400

    try:
        limit = int(request.args.get("limit", 40))
    except (ValueError, TypeError):
        limit = 40
    limit = max(1, min(limit, 100))

    parsed = _parse_query(raw_q)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        subject_rows = _search_subjects(cursor, parsed)

        # Short-circuit: only_exercises skips topics.
        if parsed["only_exercises"]:
            topic_rows = []
        else:
            topic_rows = _search_topics(cursor, parsed, limit=limit)

        # Short-circuit: only_notes skips exercises.
        if parsed["only_notes"]:
            exercise_rows = []
        else:
            exercise_rows = _search_exercises(cursor, parsed, limit=limit)

        subjects = [_serialise_subject(r) for r in subject_rows]
        topics = [_serialise_topic(r) for r in topic_rows]
        exercises = [_serialise_exercise(r) for r in exercise_rows]

        truncated = len(topic_rows) >= limit or len(exercise_rows) >= limit

        return jsonify({
            "query": raw_q,
            "parsed": {
                "grade": parsed["grade"],
                "subject": parsed["subject"],
                "terms": parsed["terms"],
                "only_notes": parsed["only_notes"],
                "only_exercises": parsed["only_exercises"],
            },
            "subjects": subjects,
            "topics": topics,
            "exercises": exercises,
            "total": len(subjects) + len(topics) + len(exercises),
            "truncated": truncated,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_db_connection(conn)