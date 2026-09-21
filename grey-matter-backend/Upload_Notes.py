#!/usr/bin/env python3
"""
Upload_Notes.py - Upload notes from Word documents to the database
Usage: python Upload_Notes.py --path /var/www/greymatter/NOTES
       python Upload_Notes.py --path /var/www/greymatter/NOTES --dry-run
"""

import os
import sys
import re
import psycopg2
from docx import Document
from pathlib import Path
import logging
from datetime import datetime
import argparse
from difflib import SequenceMatcher

# 
# CONFIGURATION
# 

LOCAL_NOTES_PATH = r"/var/www/greymatter/NOTES"

DB_NAME = "greymatter_db"
DB_USER = "greymatter_user"
DB_PASSWORD = "GreyMatter2025"
DB_HOST = "localhost"
DB_PORT = "5432"

LOG_FILE = "upload_notes.log"

# Minimum similarity score (0.0 - 1.0) for fuzzy fallback matching
FUZZY_THRESHOLD = 0.80

# 
# SETUP LOGGING
# 

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# 
# NORMALIZATION HELPERS
# 

def normalize_name(name):
    """
    Normalize a topic/file name for fuzzy matching.
    - Lowercase
    - Remove grade suffixes like (Grade 10), (Grade 10 Business), - Grade 11
    - Remove "The " prefix
    - Replace dashes/underscores with spaces
    - Remove punctuation (except spaces and alphanumerics)
    - Collapse multiple spaces
    """
    if not name:
        return ""
    
    n = name.lower().strip()
    
    # Remove extensions
    n = re.sub(r'\.(docx|txt|doc)$', '', n)
    
    # Remove exercise/copy suffixes
    n = re.sub(r'\s*-\s*(exercise|exercises|copy|exercisies)\s*$', '', n)
    n = re.sub(r'\s+(exercise|exercises|copy|exercisies)\s*$', '', n)
    
    # Remove grade suffixes like "(grade 10)", "(grade 10 business)", "- grade 11"
    n = re.sub(r'\s*\(?\s*-?\s*grade\s*\d+\s*[a-z]*\s*\)?', '', n)
    n = re.sub(r'\s*\(\s*grade\s*\d+\s*[a-z]*\s*\)', '', n)
    
    # Remove "the " prefix
    n = re.sub(r'^the\s+', '', n)
    
    # Replace dashes/underscores with spaces
    n = re.sub(r'[-_&]+', ' ', n)
    
    # Remove all punctuation except spaces
    n = re.sub(r'[^\w\s]', '', n)
    
    # Collapse whitespace
    n = re.sub(r'\s+', ' ', n).strip()
    
    return n


def similarity(a, b):
    """Return similarity ratio between two strings (0.0 - 1.0)"""
    return SequenceMatcher(None, a, b).ratio()


def get_grade_id_from_level(grade_level):
    grade_map = {8: 1, 9: 2, 10: 3, 11: 4, 12: 5}
    return grade_map.get(grade_level)


def get_subject_name_mapping(subject_name):
    mapping = {
        'PHYSICS': 'Physics',
        'ACCOUNTING': 'Accounting',
        'BUSINESS': 'Business',
        'ECONOMICS': 'Economics',
        'GEOGRAPHY': 'Geography',
        'LIFE SCIENCE': 'Life Science',
        'MATH': 'Mathematics',
        'MATHS': 'Mathematics',
        'MATHEMATICS': 'Mathematics',
        'MATH LIT': 'Mathematical Literacy',
        'MATHS LIT': 'Mathematical Literacy',
        'MATHEMATICAL LITERACY': 'Mathematical Literacy',
    }
    return mapping.get(subject_name.upper(), subject_name)

# 
# DATABASE
# 

def connect_db():
    try:
        return psycopg2.connect(
            host=DB_HOST, database=DB_NAME,
            user=DB_USER, password=DB_PASSWORD, port=DB_PORT
        )
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return None


def clean_text(text):
    if not text:
        return ""
    text = re.sub(r'\n\s*\n', '\n\n', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()


def read_docx_file(file_path):
    try:
        doc = Document(file_path)
        text = [p.text for p in doc.paragraphs if p.text.strip()]
        return clean_text("\n\n".join(text))
    except Exception as e:
        logger.error(f"Failed to read {file_path}: {e}")
        return None


def extract_from_path(file_path):
    parts = Path(file_path).parts
    notes_index = -1
    for i, part in enumerate(parts):
        if part.upper() == 'NOTES':
            notes_index = i
            break

    if notes_index == -1:
        return None, None, None

    subject = parts[notes_index + 1] if len(parts) > notes_index + 1 else None

    grade = None
    if len(parts) > notes_index + 2:
        grade_folder = parts[notes_index + 2]
        m = re.search(r'(\d+)', grade_folder)
        grade = int(m.group(1)) if m else None

    filename = os.path.basename(file_path)
    topic = re.sub(r'\.(docx|txt|doc)$', '', filename).strip()

    return subject, grade, topic


# 
# TOPIC MATCHING
# 

def fetch_all_topics_for_subject(cursor, db_subject_name, grade_id):
    """
    Fetch all topics for a subject (and grade) so we can do fuzzy matching in Python.
    Falls back to all grades for the subject if grade filter returns nothing.
    """
    cursor.execute("""
        SELECT t.topic_id, t.topic_name, s.subject_id, s.subject_name, t.grade_id
        FROM topics t
        JOIN subjects s ON t.subject_id = s.subject_id
        WHERE LOWER(s.subject_name) = LOWER(%s)
          AND t.grade_id = %s
    """, (db_subject_name, grade_id))
    rows = cursor.fetchall()

    if rows:
        return rows

    # Fallback: all grades for this subject
    cursor.execute("""
        SELECT t.topic_id, t.topic_name, s.subject_id, s.subject_name, t.grade_id
        FROM topics t
        JOIN subjects s ON t.subject_id = s.subject_id
        WHERE LOWER(s.subject_name) = LOWER(%s)
    """, (db_subject_name,))
    return cursor.fetchall()


def find_topic_in_db(cursor, subject_name, topic_name, grade_level):
    """
    Find the best matching topic using:
      1. Exact normalized match
      2. Substring match
      3. Fuzzy match (SequenceMatcher)
    """
    if not subject_name or not topic_name:
        return None

    db_subject_name = get_subject_name_mapping(subject_name)
    grade_id = get_grade_id_from_level(grade_level)

    if not grade_id:
        logger.warning(f"  Unknown grade level: {grade_level}")
        return None

    normalized_query = normalize_name(topic_name)

    rows = fetch_all_topics_for_subject(cursor, db_subject_name, grade_id)

    if not rows:
        logger.warning(f"  No topics found in DB for subject {db_subject_name}")
        return None

    # 1. Exact normalized match
    for row in rows:
        topic_id, db_topic_name, subject_id, db_sub_name, row_grade_id = row
        if normalize_name(db_topic_name) == normalized_query:
            return (topic_id, db_topic_name, subject_id, db_sub_name)

    # 2. Substring match (either direction)
    for row in rows:
        topic_id, db_topic_name, subject_id, db_sub_name, row_grade_id = row
        n = normalize_name(db_topic_name)
        if normalized_query in n or n in normalized_query:
            return (topic_id, db_topic_name, subject_id, db_sub_name)

    # 3. Fuzzy match
    best_row = None
    best_score = 0.0
    for row in rows:
        topic_id, db_topic_name, subject_id, db_sub_name, row_grade_id = row
        score = similarity(normalize_name(db_topic_name), normalized_query)
        if score > best_score:
            best_score = score
            best_row = row

    if best_row and best_score >= FUZZY_THRESHOLD:
        topic_id, db_topic_name, subject_id, db_sub_name, _ = best_row
        logger.info(f"  Fuzzy match ({best_score:.2f}): '{topic_name}' -> '{db_topic_name}'")
        return (topic_id, db_topic_name, subject_id, db_sub_name)

    if best_row:
        logger.warning(
            f"  Best fuzzy match only {best_score:.2f} for '{topic_name}' "
            f"(closest: '{best_row[1]}') - below threshold {FUZZY_THRESHOLD}"
        )

    return None



# UPLOAD

def upload_notes_file(file_path, cursor, dry_run=False):
    logger.info(f"Processing: {file_path}")

    content = read_docx_file(file_path)
    if not content:
        logger.warning(f"  No content extracted from: {file_path}")
        return False

    subject_name, grade_level, topic_name = extract_from_path(file_path)

    if not subject_name or not topic_name:
        logger.warning(f"  Could not extract subject/topic from path: {file_path}")
        return False

    logger.info(f"  Subject: {subject_name}, Grade: {grade_level}, Topic: {topic_name}")

    result = find_topic_in_db(cursor, subject_name, topic_name, grade_level)

    if not result:
        logger.warning(f"  ❌ Topic not found: {subject_name} / {topic_name} (Grade {grade_level})")
        return False

    topic_id, db_topic_name, subject_id, db_subject_name = result
    logger.info(f"  ✅ Matched: {db_subject_name} -> {db_topic_name} (ID: {topic_id})")

    cursor.execute("SELECT notes FROM topics WHERE topic_id = %s", (topic_id,))
    existing = cursor.fetchone()

    if dry_run:
        logger.info(f"  DRY RUN: Would {'update' if existing and existing[0] else 'insert'} notes for topic {topic_id}")
        return True

    cursor.execute("UPDATE topics SET notes = %s WHERE topic_id = %s", (content, topic_id))

    if existing and existing[0]:
        logger.info(f"  Updated notes for: {db_subject_name} -> {db_topic_name}")
    else:
        logger.info(f"  Inserted notes for: {db_subject_name} -> {db_topic_name}")

    return True


def upload_notes_bulk(notes_path, dry_run=False):
    conn = connect_db()
    if not conn:
        return False

    cursor = conn.cursor()

    try:
        count = 0
        errors = 0
        skipped = 0
        total = 0

        for root, dirs, files in os.walk(notes_path):
            for file in files:
                if file.endswith(('.docx', '.txt')):
                    total += 1
                    file_path = os.path.join(root, file)

                    success = upload_notes_file(file_path, cursor, dry_run)
                    if success:
                        count += 1
                    else:
                        skipped += 1

        if not dry_run:
            conn.commit()

        logger.info("=" * 50)
        logger.info("SUMMARY:")
        logger.info(f"   Total files found: {total}")
        logger.info(f"   Successfully processed: {count}")
        logger.info(f"   Skipped: {skipped}")
        logger.info(f"   Errors: {errors}")
        logger.info("=" * 50)

        return True

    except Exception as e:
        logger.error(f"Error during bulk upload: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


# MAIN
def main():
    parser = argparse.ArgumentParser(description="Upload notes to database")
    parser.add_argument("--path", help="Path to notes folder")
    parser.add_argument("--dry-run", action="store_true", help="Preview without uploading")

    args = parser.parse_args()

    if args.dry_run:
        pass

    notes_path = args.path or LOCAL_NOTES_PATH

    if not os.path.exists(notes_path):
        return

    success = upload_notes_bulk(notes_path, args.dry_run)
    if success:
        pass
    else:
        pass


if __name__ == "__main__":
    main()