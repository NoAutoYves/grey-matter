"""
extract_queries.py

Walk a source folder of exercise .docx files, extract image queries,
and write one plain-text .docx per topic.

Input:  a file path OR a folder path.
Output: <output>/<SUBJECT>/<GRADE N>/<topic> - image queries.docx

Each output file is plain text, one line per question:
  <exercise name>, Question <n>, <image query>

Use --limit N to cap the number of queries per topic (for testing).
"""

import argparse
import re
import sys
from pathlib import Path

from docx import Document


SOURCE_ROOT = Path(r"C:\Users\madon\Documents\GM")
OUTPUT_ROOT = Path(r"C:\Users\madon\Documents\GM\Image Queries")

EXERCISE_FILE_SUFFIX = " - Exercises.docx"
EXERCISE_RE = re.compile(r"^(.*?)\s*-\s*Exercise\s+(\d+)\s*$", re.IGNORECASE)
QUESTION_RE = re.compile(r"^Question\s+(\d+):", re.IGNORECASE)
IMAGE_RE = re.compile(r"Image query:\s*(.+)", re.IGNORECASE | re.DOTALL)


def safe_name(name):
    return re.sub(r'[<>:"/\\|?*]', "_", name).strip()


def extract_from_docx(path):
    """Returns (entries, warnings)."""
    doc = Document(str(path))
    paragraphs = [p.text.strip() for p in doc.paragraphs]

    current_exercise = None
    pending_query = None
    results = []
    warnings = []
    seen_questions = {}

    for text in paragraphs:
        if not text:
            continue

        m = EXERCISE_RE.match(text)
        if (
            m
            and not text.lower().startswith("image query")
            and "Question" not in text
        ):
            current_exercise = text
            pending_query = None
            seen_questions.setdefault(current_exercise, set())
            continue

        m = IMAGE_RE.search(text)
        if m:
            pending_query = m.group(1).strip()

        m = QUESTION_RE.match(text)
        if m:
            qnum = int(m.group(1))
            key = current_exercise or "(unknown exercise)"

            if qnum in seen_questions.get(key, set()):
                warnings.append(
                    f"{key}: duplicate 'Question {qnum}:' label in source docx"
                )

            seen_questions.setdefault(key, set()).add(qnum)

            results.append({
                "exercise": current_exercise or "(unknown exercise)",
                "question_num": qnum,
                "query": pending_query,
            })
            pending_query = None

    for ex, seen in seen_questions.items():
        missing = [n for n in range(1, 11) if n not in seen]
        if missing:
            warnings.append(f"{ex}: missing question numbers {missing}")

    return results, warnings


def write_queries_docx(entries, out_path):
    doc = Document()
    for e in entries:
        query = e["query"] if e["query"] else "(no image query)"
        doc.add_paragraph(
            f'{e["exercise"]}, Question {e["question_num"]}, {query}'
        )
    doc.save(str(out_path))


def write_warnings_docx(topic_name, warnings, out_path):
    doc = Document()
    doc.add_heading(f"{topic_name} - warnings", level=1)
    if not warnings:
        doc.add_paragraph("No warnings.")
    else:
        for w in warnings:
            doc.add_paragraph(w, style="List Bullet")
    doc.save(str(out_path))


def resolve_files(input_path):
    """
    Given a file or folder, return (file_list, input_root).

    For a file, input_root is the folder above the SUBJECT folder, so
    relative paths reconstruct <SUBJECT>/<GRADE N>/<file>.
    For a folder, input_root is the folder itself.
    """
    input_path = Path(input_path).resolve()

    if input_path.is_file():
        parts = input_path.parts
        grade_idx = None
        for i, part in enumerate(parts):
            if re.match(r"^GRADE\s+\d+$", part, re.IGNORECASE):
                grade_idx = i
                break
        if grade_idx is not None and grade_idx >= 2:
            root = Path(*parts[: grade_idx - 1])
        else:
            root = input_path.parent.parent
        return [input_path], root

    files = sorted(
        p for p in input_path.rglob("*.docx")
        if p.name.endswith(EXERCISE_FILE_SUFFIX)
    )
    return files, input_path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", nargs="?", default=str(SOURCE_ROOT))
    ap.add_argument("--output", default=str(OUTPUT_ROOT))
    ap.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Cap the number of queries per topic (for testing)",
    )
    args = ap.parse_args()

    if not Path(args.input).exists():
        print(f"Not found: {args.input}")
        sys.exit(1)

    files, input_root = resolve_files(args.input)
    output_root = Path(args.output)

    if not files:
        print(f"No '{EXERCISE_FILE_SUFFIX}' files found.")
        sys.exit(1)

    print(f"Found {len(files)} exercise file(s).")
    print(f"Input root: {input_root}")
    warnings_root = output_root / "warnings"

    for path in files:
        try:
            rel = path.relative_to(input_root)
        except ValueError:
            rel = Path(path.name)

        topic_dir = output_root / rel.parent
        topic_dir.mkdir(parents=True, exist_ok=True)

        topic_name = path.stem.replace(" - Exercises", "")
        out_path = topic_dir / f"{safe_name(topic_name)} - image queries.docx"

        print(f"\n{rel}")
        entries, warnings = extract_from_docx(path)

        if args.limit:
            entries = entries[: args.limit]

        write_queries_docx(entries, out_path)
        print(f"  wrote {out_path.relative_to(output_root)} ({len(entries)} entries)")

        if warnings:
            warn_dir = warnings_root / rel.parent
            warn_dir.mkdir(parents=True, exist_ok=True)
            warn_path = warn_dir / f"{safe_name(topic_name)} - warnings.docx"
            write_warnings_docx(topic_name, warnings, warn_path)
            print(f"  WARNINGS: {len(warnings)}")
            for w in warnings:
                print(f"    - {w}")


if __name__ == "__main__":
    main()