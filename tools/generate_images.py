"""
generate_images.py

Read an image-queries .docx and generate a PNG for each query using
Gemini's image generation model.

Input:
  A queries .docx (produced by extract_queries.py), e.g.
  C:/Users/madon/Documents/GM/Image Queries/MATH/GRADE 10/Algebraic expressions - image queries.docx

Output:
  <output>/<SUBJECT>/<GRADE N>/<topic>/<topic_slug>_exercise_<N>_question_<N>.jpg

Requires:
  pip install python-docx google-genai python-dotenv Pillow
"""

import argparse
import base64
import os
import re
import sys
import time
from pathlib import Path

from docx import Document
from dotenv import load_dotenv
from google import genai


TOOLS_DIR = Path(r"C:\Users\madon\Documents\GREY MATTER\tools")
QUERIES_ROOT = Path(r"C:\Users\madon\Documents\GM\Image Queries")
IMAGES_ROOT = Path(r"C:\Users\madon\Documents\GM\Image Queries\questions")

MODEL_NAME = "gemini-3.1-flash-image"   # Nano Banana 2
DELAY_BETWEEN_CALLS = 2.0
MAX_RETRIES = 3

EXERCISE_RE = re.compile(r"^(.*?)\s*-\s*Exercise\s+(\d+)\s*$", re.IGNORECASE)
LINE_RE = re.compile(r"^(?P<exercise>.+?),\s*Question\s+(?P<qnum>\d+),\s*(?P<query>.+)$")


def safe_name(name):
    return re.sub(r'[<>:"/\\|?*]', "_", name).strip()


def topic_slug(topic_name):
    """Convert 'Algebraic expressions' -> 'algebraic_expressions'."""
    return topic_name.lower().replace(" ", "_").replace("-", "_")


def read_queries_docx(path):
    """
    Read a plain-text queries docx.
    Returns a list of dicts:
        {"exercise": "...", "exercise_num": N, "question_num": N, "query": "..."}
    """
    doc = Document(str(path))
    entries = []
    for p in doc.paragraphs:
        text = p.text.strip()
        if not text:
            continue
        m = LINE_RE.match(text)
        if not m:
            continue
        exercise = m.group("exercise").strip()
        ex_match = EXERCISE_RE.match(exercise)
        ex_num = int(ex_match.group(2)) if ex_match else 0
        entries.append({
            "exercise": exercise,
            "exercise_num": ex_num,
            "question_num": int(m.group("qnum")),
            "query": m.group("query").strip(),
        })
    return entries


def call_model(client, query):
    """Send the image query to Gemini. Returns raw PNG bytes."""
    interaction = client.interactions.create(
        model=MODEL_NAME,
        input=query,
    )
    image = getattr(interaction, "output_image", None)
    if not image:
        raise RuntimeError("No image in response")
    return base64.b64decode(image.data)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", help="Path to a queries .docx file or a folder of them")
    ap.add_argument(
        "--output",
        default=str(IMAGES_ROOT),
        help="Root folder for generated images",
    )
    ap.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Only generate the first N images (for testing)",
    )
    args = ap.parse_args()

    load_dotenv(TOOLS_DIR / ".env")
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY not set in tools/.env", file=sys.stderr)
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Not found: {input_path}")
        sys.exit(1)

    if input_path.is_file():
        query_files = [input_path]
    else:
        query_files = sorted(input_path.rglob("*.docx"))

    if not query_files:
        print(f"No .docx files found in {input_path}")
        sys.exit(1)

    output_root = Path(args.output)
    total_ok = 0
    total_fail = 0
    grand_tokens = 0

    for qpath in query_files:
        # Topic name = filename minus " - image queries.docx"
        topic_name = qpath.stem.replace(" - image queries", "")
        slug = topic_slug(topic_name)

        # Preserve folder structure if input was a folder
        try:
            rel = qpath.relative_to(QUERIES_ROOT)
            topic_dir = output_root / rel.parent / topic_name
        except ValueError:
            topic_dir = output_root / topic_name

        topic_dir.mkdir(parents=True, exist_ok=True)

        print(f"\n{qpath.name}")
        entries = read_queries_docx(qpath)
        if args.limit:
            entries = entries[: args.limit]
        print(f"  {len(entries)} queries")

        failures = []

        for i, e in enumerate(entries, 1):
            ex = e["exercise_num"]
            qn = e["question_num"]
            query = e["query"]

            out_name = f"{slug}_exercise_{ex}_question_{qn}.jpg"
            out_path = topic_dir / out_name

            print(f"  [{i}/{len(entries)}] ex{ex}_q{qn} ...", end="", flush=True)

            image_bytes = None
            error = None

            for attempt in range(MAX_RETRIES + 1):
                try:
                    image_bytes = call_model(client, query)
                    break
                except Exception as ex_err:
                    error = str(ex_err)
                    if attempt < MAX_RETRIES:
                        wait = 3 * (attempt + 1)
                        print(f" retry in {wait}s ...", end="", flush=True)
                        time.sleep(wait)
                        continue

            if image_bytes:
                out_path.write_bytes(image_bytes)
                print(" ok")
                total_ok += 1
            else:
                print(f" FAIL: {error}")
                failures.append(f"ex{ex}_q{qn}: {error}\n  Query: {query}\n")
                total_fail += 1

            time.sleep(DELAY_BETWEEN_CALLS)

        if failures:
            fail_path = topic_dir / "generation_failures.txt"
            fail_path.write_text("\n".join(failures), encoding="utf-8")
            print(f"  wrote {fail_path.name} ({len(failures)} failures)")

    print()
    print("=" * 60)
    print(f"OK: {total_ok}   FAIL: {total_fail}")
    print("=" * 60)


if __name__ == "__main__":
    main()