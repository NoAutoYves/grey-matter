#!/usr/bin/env python3
r"""
upload_exercises.py — upload notes and exercises to GreyMatter using the
VPS naming convention (see: Rules for Uploading Exercises to the GreyMatter VPS).

Naming produced:
  topic_name     : '<Name> (Grade X Subject)'          e.g. 'Business Cycles (Grade 12 Economics)'
  topic_url      : '<slug>_<subject>_grade_<n>'         e.g. 'business_cycles_economics_grade_12'
  exercise_name  : '<topic_url>_exercise_<n>'           (globally unique)
  exercise_title : '<Name> (Grade X Subject) - Exercise N'
  image_url      : '<exercise_name>_question_<n>.<ext>' e.g. '..._question_1.jpg'

Reads:
  <topic> - NOTES.md   (preferred — preserves ##, **, ==, $KaTeX$)
  <topic> - NOTES.docx (fallback)
  <topic> - Exercises.docx

Writes (idempotent, per-topic transaction):
  topics   upsert (subject_id, topic_name) -> update notes, topic_url, grade_id
  exercises DELETE old rows for topic, INSERT new (5 x 10)
  questions INSERT 10 per exercise with display_order 1..10

Also emits per-file manifest:
  <topic> - image_manifest.json   (filename <-> image query mapping for image-gen)

Usage:
  upload_exercises.py --path "C:\...\GRADE 12" --subject Economics --grade 12 --dry-run
  upload_exercises.py --path "C:\...\GRADE 12" --subject Economics --grade 12 --commit
  upload_exercises.py --path "C:\...\GRADE 12" --subject Economics --grade 12 --commit --skip-existing
  upload_exercises.py --path "C:\...\GRADE 12" --notes-only --commit
  upload_exercises.py --path "C:\...\GRADE 12" --exercises-only --commit
  upload_exercises.py --path "C:\...\GRADE 12" --image-ext .png --commit
  upload_exercises.py --path "C:\...\GRADE 12" --strict --commit
"""

import argparse
import json
import re
import sys
from pathlib import Path

import psycopg2
from docx import Document


DB = dict(host="localhost", dbname="greymatter_db", user="greymatter_user",
          password="GreyMatter2025", port="5432")

VALID_SUBJECTS = {
    "Accounting", "Business", "Economics", "Geography",
    "Life Science", "Physics", "Mathematics", "Mathematical Literacy",
}

# Folder-name -> DB subject_name
SUBJECT_ALIASES = {
    "PHYSICS": "Physics",
    "PHYSICAL SCIENCES": "Physics",
    "ACCOUNTING": "Accounting",
    "BUSINESS": "Business",
    "BUSINESS STUDIES": "Business",
    "ECONOMICS": "Economics",
    "GEOGRAPHY": "Geography",
    "LIFE SCIENCE": "Life Science",
    "LIFE SCIENCES": "Life Science",
    "MATH": "Mathematics",
    "MATHS": "Mathematics",
    "MATHEMATICS": "Mathematics",
    "MATH LIT": "Mathematical Literacy",
    "MATHS LIT": "Mathematical Literacy",
    "MATHEMATICAL LITERACY": "Mathematical Literacy",
}

GRADE_LEVEL_TO_ID = {10: 3, 11: 4, 12: 5}

IMAGE_EXT_DEFAULT = ".jpg"
PASSING_SCORE = 70
MARKS_PER_Q = 1
REQUIRED_EXERCISES = 5
REQUIRED_QUESTIONS = 10

# Unicode math chars that should be inside $KaTeX$ instead
BAD_UNICODE = [
    "\u00b2", "\u00b3", "\u00b9", "\u2070", "\u2074", "\u2075", "\u2076",
    "\u00bd", "\u00bc", "\u00be", "\u00d7", "\u00f7",
    "\u03c0", "\u03b8", "\u03b1", "\u03b2", "\u0394",
    "\u00b0", "\u2192", "\u2190", "\u221a", "\u00b1",
]


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #

def slug_underscore(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_")


def normalize_topic_base(name: str) -> str:
    """Strip file suffixes like ' - NOTES', ' - Exercises', grade parens."""
    n = name.strip()
    n = re.sub(r"\.(docx|md|txt|doc)$", "", n, flags=re.I)
    n = re.sub(r"\s*-\s*(notes|exercises?|copy)\s*$", "", n, flags=re.I)
    n = re.sub(r"\s*\(?\s*-?\s*grade\s*\d+\s*[a-z]*\s*\)?", "", n, flags=re.I)
    return n.strip()


def parse_subject(user_input: str) -> str:
    u = user_input.strip().upper()
    if u in SUBJECT_ALIASES:
        return SUBJECT_ALIASES[u]
    for s in VALID_SUBJECTS:
        if s.upper() == u:
            return s
    raise SystemExit(f"Unknown subject: {user_input!r}. "
                     f"Valid: {sorted(VALID_SUBJECTS)}")


def infer_subject_grade_from_path(path: Path):
    subject = None
    grade = None
    for anc in path.parents:
        n = anc.name.strip()
        if not n:
            continue
        if not grade:
            m = re.match(r"^(?:grade|gr)\.?\s*(\d{1,2})\b", n, re.I)
            if m:
                grade = int(m.group(1))
        if not subject:
            up = n.upper()
            if up in SUBJECT_ALIASES:
                subject = SUBJECT_ALIASES[up]
            else:
                for k, v in SUBJECT_ALIASES.items():
                    if re.search(rf"\b{re.escape(k)}\b", up):
                        subject = v
                        break
        if subject and grade:
            break
    return subject, grade


def validate_katex(text: str) -> list[str]:
    """Return list of issues with $ delimiter balance."""
    issues = []
    # count of $ must be even (a lone $ is unbalanced)
    if text.count("$") % 2 != 0:
        issues.append(f"unbalanced $ in text: {text[:80]!r}")
    # unclosed $$: count of $$ occurrences must divide cleanly
    return issues


def check_bad_unicode(text: str) -> list[str]:
    found = [c for c in BAD_UNICODE if c in text]
    if found:
        return [f"unicode math char(s) {found} in: {text[:80]!r}"]
    return []


# --------------------------------------------------------------------------- #
# Parsers
# --------------------------------------------------------------------------- #

def read_notes(notes_docx: Path) -> tuple[str, str]:
    """Return (text, source_label). Prefer .md sibling."""
    md = notes_docx.with_suffix(".md")
    if md.exists():
        return md.read_text(encoding="utf-8"), md.name
    doc = Document(str(notes_docx))
    text = "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
    return text, notes_docx.name


def parse_exercises(path: Path) -> dict[int, list[dict]]:
    """Return {exercise_number: [{q, opts[A-D], ans, image_query}, ...]}"""
    doc = Document(str(path))
    paras = doc.paragraphs
    n = len(paras)
    out: dict[int, list[dict]] = {}
    current: int | None = None
    pending_image: str | None = None

    def strip_pfx(s: str, p: str) -> str:
        s = s.strip()
        return s[len(p):].strip() if s.startswith(p) else s

    def find_stem(a_i: int, header_i: int) -> str:
        """Walk backward from option A) to find the question stem.
        Skip blank paragraphs. Stop if we hit the Question header or an
        Image query line, meaning there is genuinely no stem."""
        j = a_i - 1
        while j > header_i:
            t = paras[j].text.strip()
            if t:
                if re.match(r"^Question\s+\d+\s*:?\s*$", t, re.I):
                    return ""
                if t.lower().startswith("image query:"):
                    return ""
                return t
            j -= 1
        return ""

    i = 0
    while i < n:
        text = paras[i].text.strip()

        m = re.match(r"^.+?\s*-\s*Exercise\s+(\d+)\s*$", text, re.I)
        if m:
            current = int(m.group(1))
            out.setdefault(current, [])
            pending_image = None
            i += 1
            continue

        if text.lower().startswith("image query:"):
            pending_image = text.split(":", 1)[1].strip()
            i += 1
            continue

        if current is not None and text.startswith("Question "):
            header_i = i
            a_i = b_i = c_i = d_i = ans_i = None
            j = i + 1
            while j < n:
                t = paras[j].text.strip()
                if t.startswith("A)") and a_i is None:
                    a_i = j
                elif t.startswith("B)") and b_i is None:
                    b_i = j
                elif t.startswith("C)") and c_i is None:
                    c_i = j
                elif t.startswith("D)") and d_i is None:
                    d_i = j
                elif t.startswith("Answer:") and d_i is not None:
                    ans_i = j
                    break
                j += 1
            if a_i and b_i and c_i and d_i and ans_i:
                qtext = find_stem(a_i, header_i)
                opts = [
                    strip_pfx(paras[a_i].text, "A)"),
                    strip_pfx(paras[b_i].text, "B)"),
                    strip_pfx(paras[c_i].text, "C)"),
                    strip_pfx(paras[d_i].text, "D)"),
                ]
                ans = paras[ans_i].text.split(":", 1)[1].strip().upper()
                out[current].append({
                    "q": qtext,
                    "opts": opts,
                    "ans": ans,
                    "image_query": pending_image or "",
                })
                pending_image = None
                i = ans_i + 1
                continue
        i += 1
    return out


# --------------------------------------------------------------------------- #
# Pre-flight validation
# --------------------------------------------------------------------------- #

def validate_exercises(exercises: dict[int, list[dict]]) -> list[str]:
    issues: list[str] = []
    if sorted(exercises.keys()) != list(range(1, REQUIRED_EXERCISES + 1)):
        issues.append(f"expected exercises [1..{REQUIRED_EXERCISES}], got {sorted(exercises.keys())}")
    for exn, qs in sorted(exercises.items()):
        if len(qs) != REQUIRED_QUESTIONS:
            issues.append(f"Exercise {exn}: expected {REQUIRED_QUESTIONS} questions, got {len(qs)}")
        for qi, q in enumerate(qs, start=1):
            tag = f"Ex{exn} Q{qi}"
            if not q["q"]:
                issues.append(f"{tag}: empty question text")
            if any(not o for o in q["opts"]):
                issues.append(f"{tag}: empty option")
            if q["ans"] not in ("A", "B", "C", "D"):
                issues.append(f"{tag}: invalid answer {q['ans']!r}")
            if not q["image_query"]:
                issues.append(f"{tag}: missing Image query")
            for text in [q["q"], *q["opts"]]:
                issues.extend(f"{tag}: {msg}" for msg in validate_katex(text))
    return issues


def validate_unicode(exercises: dict[int, list[dict]]) -> list[str]:
    issues: list[str] = []
    for exn, qs in sorted(exercises.items()):
        for qi, q in enumerate(qs, start=1):
            tag = f"Ex{exn} Q{qi}"
            for text in [q["q"], *q["opts"]]:
                issues.extend(f"{tag}: {msg}" for msg in check_bad_unicode(text))
    return issues


# --------------------------------------------------------------------------- #
# DB
# --------------------------------------------------------------------------- #

def lookup_subject_id(cur, subject_name: str) -> int:
    cur.execute("SELECT subject_id FROM subjects WHERE subject_name = %s",
                (subject_name,))
    r = cur.fetchone()
    if not r:
        raise SystemExit(f"Subject not in DB: {subject_name!r}")
    return r[0]


def topic_exists(cur, subject_id: int, topic_name: str) -> int | None:
    cur.execute("""
        SELECT topic_id FROM topics
        WHERE subject_id = %s AND topic_name = %s
    """, (subject_id, topic_name))
    r = cur.fetchone()
    return r[0] if r else None


def upsert_topic(cur, subject_id: int, grade_id: int,
                 topic_name: str, topic_url: str,
                 notes: str) -> int:
    cur.execute("""
        INSERT INTO topics (subject_id, grade_id, topic_name, topic_url, notes, updated_at)
        VALUES (%s, %s, %s, %s, %s, NOW())
        ON CONFLICT (subject_id, topic_name) DO UPDATE
        SET grade_id   = EXCLUDED.grade_id,
            topic_url  = EXCLUDED.topic_url,
            notes      = EXCLUDED.notes,
            updated_at = NOW()
        RETURNING topic_id
    """, (subject_id, grade_id, topic_name, topic_url, notes))
    return cur.fetchone()[0]


def clear_exercises_for_topic(cur, topic_id: int) -> None:
    cur.execute("""
        DELETE FROM questions WHERE exercise_id IN
            (SELECT exercise_id FROM exercises WHERE topic_id = %s)
    """, (topic_id,))
    cur.execute("DELETE FROM exercises WHERE topic_id = %s", (topic_id,))


def insert_exercise(cur, subject_id: int, grade_id: int, topic_id: int,
                    exercise_name: str, exercise_title: str,
                    display_order: int,
                    questions: list[dict],
                    image_ext: str) -> int:
    cur.execute("""
        INSERT INTO exercises
            (subject_id, grade_id, topic_id, exercise_name, exercise_title,
             total_questions, passing_score, is_published, display_order)
        VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE, %s)
        RETURNING exercise_id
    """, (subject_id, grade_id, topic_id,
          exercise_name, exercise_title,
          len(questions), PASSING_SCORE, display_order))
    ex_id = cur.fetchone()[0]

    for qno, q in enumerate(questions, start=1):
        image_url = f"{exercise_name}_question_{qno}{image_ext}"
        cur.execute("""
            INSERT INTO questions
                (exercise_id, question_text,
                 option_a, option_b, option_c, option_d,
                 correct_answer, marks, display_order, image_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (ex_id, q["q"],
              q["opts"][0], q["opts"][1], q["opts"][2], q["opts"][3],
              q["ans"], MARKS_PER_Q, qno, image_url))
    return ex_id


# --------------------------------------------------------------------------- #
# Manifest
# --------------------------------------------------------------------------- #

def write_manifest(path: Path, topic_name: str, topic_url: str,
                   subject: str, grade: int,
                   exercises: dict[int, list[dict]],
                   image_ext: str) -> None:
    entries = []
    for exn in sorted(exercises.keys()):
        exercise_name = f"{topic_url}_exercise_{exn}"
        for qno, q in enumerate(exercises[exn], start=1):
            entries.append({
                "exercise_name": exercise_name,
                "exercise_number": exn,
                "question_number": qno,
                "image_url": f"{exercise_name}_question_{qno}{image_ext}",
                "image_query": q["image_query"],
            })
    manifest = {
        "topic_name": topic_name,
        "topic_url": topic_url,
        "subject": subject,
        "grade": grade,
        "entries": entries,
    }
    path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False),
                    encoding="utf-8")


# --------------------------------------------------------------------------- #
# Per-topic processing
# --------------------------------------------------------------------------- #

def process_topic(cur, exercises_docx: Path,
                  subject: str, grade: int,
                  image_ext: str,
                  commit: bool,
                  skip_existing: bool,
                  notes_only: bool,
                  exercises_only: bool,
                  strict: bool) -> dict:
    base = normalize_topic_base(exercises_docx.name)
    notes_docx = exercises_docx.with_name(f"{base} - NOTES.docx")
    notes_md = exercises_docx.with_name(f"{base} - NOTES.md")
    notes_source = notes_md if notes_md.exists() else notes_docx
    notes_available = notes_source.exists()

    subject_id = lookup_subject_id(cur, subject)
    grade_id = GRADE_LEVEL_TO_ID.get(grade)
    if grade_id is None:
        raise SystemExit(f"Grade {grade} not in {{10, 11, 12}}")

    topic_name = f"{base} (Grade {grade} {subject})"
    topic_url = f"{slug_underscore(base)}_{slug_underscore(subject)}_grade_{grade}"

    print(f"\n[{base}]")
    print(f"  topic_name: {topic_name}")
    print(f"  topic_url:  {topic_url}")

    existing_topic_id = topic_exists(cur, subject_id, topic_name)
    if skip_existing and existing_topic_id and not notes_only and not exercises_only:
        print(f"  [skip-existing] topic_id={existing_topic_id}")
        return {"skipped": True, "base": base}

    exercises = parse_exercises(exercises_docx)
    issues = validate_exercises(exercises) if not notes_only else []
    unicode_issues = validate_unicode(exercises) if not notes_only else []

    if issues:
        print(f"  [VALIDATION FAILED] {len(issues)} issue(s):")
        for s in issues[:12]:
            print(f"    - {s}")
        if len(issues) > 12:
            print(f"    ... and {len(issues) - 12} more")
        if strict:
            raise SystemExit(f"Strict mode: aborting on {base}")

    if unicode_issues:
        print(f"  [WARN] {len(unicode_issues)} unicode math issue(s) "
              f"(should be KaTeX):")
        for s in unicode_issues[:6]:
            print(f"    ! {s}")
        if len(unicode_issues) > 6:
            print(f"    ... and {len(unicode_issues) - 6} more")

    notes_text = ""
    notes_src_label = "(none)"
    if notes_available and not exercises_only:
        notes_text, notes_src_label = read_notes(notes_source)
        print(f"  notes: {len(notes_text):,} chars from {notes_src_label}")

    total_q = sum(len(v) for v in exercises.values())
    print(f"  exercises: {sorted(exercises.keys())}   total_q={total_q}")

    if not commit:
        print(f"  [dry-run]")
        return {"base": base, "topic_url": topic_url,
                "total_q": total_q, "dry_run": True}

    topic_id = upsert_topic(cur, subject_id, grade_id,
                            topic_name, topic_url, notes_text)
    print(f"  topic_id={topic_id}")

    if not notes_only:
        clear_exercises_for_topic(cur, topic_id)
        for exn in sorted(exercises.keys()):
            exercise_name = f"{topic_url}_exercise_{exn}"
            exercise_title = f"{topic_name} - Exercise {exn}"
            ex_id = insert_exercise(cur, subject_id, grade_id, topic_id,
                                    exercise_name, exercise_title,
                                    exn, exercises[exn], image_ext)
            print(f"    Exercise {exn}: exercise_id={ex_id}  "
                  f"name={exercise_name}")

        manifest_path = exercises_docx.with_name(f"{base} - image_manifest.json")
        write_manifest(manifest_path, topic_name, topic_url,
                       subject, grade, exercises, image_ext)
        print(f"    manifest: {manifest_path.name}")

    return {"base": base, "topic_url": topic_url,
            "total_q": total_q, "topic_id": topic_id}


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--path", required=True)
    ap.add_argument("--subject", help="e.g. Economics (default: infer from path)")
    ap.add_argument("--grade", type=int, help="10, 11 or 12 (default: infer from path)")
    ap.add_argument("--dry-run", action="store_true", default=False)
    ap.add_argument("--commit", action="store_true")
    ap.add_argument("--skip-existing", action="store_true")
    ap.add_argument("--notes-only", action="store_true")
    ap.add_argument("--exercises-only", action="store_true")
    ap.add_argument("--strict", action="store_true",
                    help="Abort whole run on first validation failure")
    ap.add_argument("--image-ext", default=IMAGE_EXT_DEFAULT)
    args = ap.parse_args()

    if not args.commit and not args.dry_run:
        print("Provide --dry-run (default) or --commit. Exiting.")
        sys.exit(1)

    folder = Path(args.path).expanduser().resolve()
    if not folder.is_dir():
        raise SystemExit(f"Not a folder: {folder}")

    # Subject / grade: explicit overrides take priority; otherwise infer.
    subject = parse_subject(args.subject) if args.subject else None
    grade = args.grade

    if subject is None or grade is None:
        inf_subj, inf_grade = infer_subject_grade_from_path(folder)
        subject = subject or inf_subj
        grade = grade or inf_grade

    if not subject:
        raise SystemExit("Could not infer subject. Pass --subject explicitly.")
    if not grade:
        raise SystemExit("Could not infer grade. Pass --grade explicitly.")

    ex_files = sorted(p for p in folder.rglob("*- Exercises.docx")
                      if not p.name.startswith("~$"))

    if not ex_files:
        print(f"No ' - Exercises.docx' files in {folder}")
        sys.exit(0)

    print(f"Folder:   {folder}")
    print(f"Subject:  {subject}   Grade: {grade}   Image ext: {args.image_ext}")
    print(f"Files:    {len(ex_files)} exercises file(s)")
    print(f"Mode:     {'COMMIT' if args.commit else 'DRY-RUN'}"
          + ("  [skip-existing]" if args.skip_existing else "")
          + ("  [notes-only]" if args.notes_only else "")
          + ("  [exercises-only]" if args.exercises_only else ""))

    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    processed = skipped = 0
    total_topics = total_q = 0

    try:
        for ex_path in ex_files:
            r = process_topic(cur, ex_path, subject, grade,
                              args.image_ext, args.commit,
                              args.skip_existing, args.notes_only,
                              args.exercises_only, args.strict)
            if r.get("skipped"):
                skipped += 1
            else:
                processed += 1
                if not r.get("dry_run"):
                    total_q += r.get("total_q", 0)
                total_topics += 1

        if args.commit:
            conn.commit()
            print(f"\nCOMMITTED: {processed - skipped} topic(s), "
                  f"{total_q} questions, {skipped} skipped")
        else:
            conn.rollback()
            print(f"\nDRY-RUN: {processed - skipped} topic(s) would be written, "
                  f"{skipped} skipped")

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()