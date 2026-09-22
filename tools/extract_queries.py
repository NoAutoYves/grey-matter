"""
extract_queries.py

Walk a folder of exercise .docx files, extract image queries, filter them
via query_filter.py (free Groq model), and write ONE combined CSV.

CSV columns:
    exercise_name, exercise_question, image_query, save_url, filter_decision

filter_decision is KEEP or SKIP — generate_images.py honours it.

Run:
    python extract_queries.py "C:/.../MATH/GRADE 12"
    python extract_queries.py "C:/.../MATH/GRADE 12" --no-filter
    python extract_queries.py "C:/.../MATH/GRADE 12" --provider ollama
"""

import argparse
import csv
import re
import sys
from pathlib import Path

from docx import Document

import query_filter

SOURCE_ROOT = Path(r"C:\Users\madon\Documents\GM")
OUTPUT_ROOT = Path(r"C:\Users\madon\Documents\GM\Image Queries")

EXERCISE_FILE_RE = re.compile(r"-\s*exercises?\.docx$", re.IGNORECASE)
EXERCISE_HEADER_RE = re.compile(r"^(.*?)\s*[-–—]\s*Exercise\s+(\d+)\s*$", re.IGNORECASE)
QUESTION_RE = re.compile(r"^Question\s+(\d+)\s*:", re.IGNORECASE)
IMAGE_RE = re.compile(r"^Image query:\s*(.+)$", re.IGNORECASE)
SKIP_RE = re.compile(r"^Pattern used:", re.IGNORECASE)
EXPECTED_PER_EXERCISE = 10

CSV_FIELDS = ["exercise_name", "exercise_question", "image_query",
              "save_url", "filter_decision"]


def slugify_exercise_title(title: str) -> str:
    s = title.lower()
    s = s.replace("\u2013", "-").replace("\u2014", "-")
    s = s.replace("'", "").replace("\u2019", "")
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return re.sub(r"_+", "_", s).strip("_")


def extract_from_docx(path: Path):
    """Returns (entries, warnings) for a single .docx file."""
    doc = Document(str(path))
    paragraphs = [p.text.strip() for p in doc.paragraphs]

    current_exercise = None
    pending_query = None
    entries, warnings = [], []
    seen = {}

    for text in paragraphs:
        if not text or SKIP_RE.match(text):
            continue

        if EXERCISE_HEADER_RE.match(text) and not text.lower().startswith("image query"):
            current_exercise = text
            pending_query = None
            seen.setdefault(current_exercise, set())
            continue

        m = IMAGE_RE.match(text)
        if m:
            pending_query = m.group(1).strip()
            continue

        m = QUESTION_RE.match(text)
        if m:
            qnum = int(m.group(1))
            key = current_exercise or "(unknown exercise)"

            if qnum in seen.get(key, set()):
                warnings.append(f"{key}: duplicate Question {qnum}")
            seen.setdefault(key, set()).add(qnum)

            if pending_query is None:
                warnings.append(f"{key}: Q{qnum} skipped (no image query)")
                continue

            save_url = f"{slugify_exercise_title(key)}_question_{qnum}.jpg"
            entries.append({
                "exercise_name": key,
                "exercise_question": f"Question {qnum}",
                "image_query": pending_query,
                "save_url": save_url,
            })
            pending_query = None

    for ex, nums in seen.items():
        missing = [n for n in range(1, EXPECTED_PER_EXERCISE + 1) if n not in nums]
        if missing:
            warnings.append(f"{ex}: missing question numbers {missing}")

    return entries, warnings


def write_csv(entries, out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        writer.writeheader()
        for e in entries:
            writer.writerow({k: e.get(k, "") for k in CSV_FIELDS})


def _find_root(p: Path) -> Path:
    parts = p.parts
    for i, part in enumerate(parts):
        if re.match(r"^GRADE\s+\d+$", part, re.IGNORECASE):
            if i >= 2:
                return Path(*parts[: i - 1])
            break
    return p if p.is_dir() else p.parent


def resolve_files(input_path: Path):
    input_path = input_path.resolve()
    if input_path.is_file():
        return [input_path], _find_root(input_path)
    files = sorted(p for p in input_path.rglob("*.docx")
                   if EXERCISE_FILE_RE.search(p.name))
    return files, _find_root(input_path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", nargs="?", default=str(SOURCE_ROOT))
    ap.add_argument("--output", default=str(OUTPUT_ROOT))
    ap.add_argument("--no-filter", action="store_true")
    ap.add_argument("--provider", default="groq",
                    choices=list(query_filter.PROVIDERS.keys()))
    ap.add_argument("--csv-name", default="image queries.csv")
    args = ap.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Not found: {input_path}")
        sys.exit(1)

    if not args.no_filter:
        query_filter.check_provider(args.provider)
        cfg = query_filter.PROVIDERS[args.provider]
        print(f"Filter   : ON  ({args.provider} / {cfg['model']})")
    else:
        print("Filter   : OFF (--no-filter)")

    files, input_root = resolve_files(input_path)
    if not files:
        print(f"No ' - Exercises.docx' files found in {input_path}")
        sys.exit(1)

    print(f"Found {len(files)} exercise file(s) under {input_root}\n")

    all_entries = []
    all_warnings = []

    for path in files:
        topic_name = re.sub(r"\s*-\s*exercises?$", "", path.stem,
                            flags=re.IGNORECASE)
        entries, warnings = extract_from_docx(path)
        for w in warnings:
            all_warnings.append(f"{topic_name}: {w}")
        print(f"  parsed  {topic_name}  ({len(entries)} queries)")
        all_entries.extend(entries)

    print(f"\nParsed {len(all_entries)} queries across {len(files)} file(s).")

    if not args.no_filter and all_entries:
        print(f"Filtering {len(all_entries)} queries ...")
        all_entries = query_filter.classify_queries(
            all_entries, provider=args.provider)
        keep = sum(1 for e in all_entries if e["filter_decision"] == "KEEP")
        skip = sum(1 for e in all_entries if e["filter_decision"] == "SKIP")
        print(f"  KEEP: {keep}   SKIP: {skip}")

    try:
        rel = input_path.relative_to(input_root)
    except ValueError:
        rel = Path(input_path.name)

    out_dir = Path(args.output) / rel
    csv_path = out_dir / args.csv_name
    write_csv(all_entries, csv_path)
    print(f"\nWrote {csv_path}")

    if all_warnings:
        for w in all_warnings:
            print(f"  - {w}")

    print()
    print("=" * 60)
    if not args.no_filter:
        keep = sum(1 for e in all_entries if e.get("filter_decision") == "KEEP")
        skip = sum(1 for e in all_entries if e.get("filter_decision") == "SKIP")
        print(f"Total: {len(all_entries)}   KEEP: {keep}   SKIP: {skip}")
        if skip:
            print(f"Image-gen saved: {skip} x $0.039 = ${skip * 0.039:.2f}")
    else:
        print(f"Total: {len(all_entries)}  (unfiltered)")
    print("=" * 60)


if __name__ == "__main__":
    main()