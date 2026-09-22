"""
generate_images.py

Read CSVs produced by extract_queries.py and generate one image per row
using Gemini's image generation model.

- Rows with filter_decision == "SKIP" are skipped (no API call, no cost).
- Rows whose target file already exists are skipped -> safe to re-run.
- Gemini returns PNG; converted to JPEG when save_url ends in .jpg/.jpeg.

Requires billing enabled on the Google Cloud project.
Estimated cost (gemini-3.1-flash-image @ 1K): ~$0.039 per image.

Requires:
    pip install python-docx google-genai python-dotenv Pillow
"""

import argparse
import base64
import csv
import os
import sys
import time
from io import BytesIO
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from PIL import Image

TOOLS_ENV = Path(r"C:\Users\madon\Documents\GREY MATTER\tools\.env")
if TOOLS_ENV.exists():
    load_dotenv(TOOLS_ENV)
load_dotenv()

MODEL_NAME = "gemini-3.1-flash-image"
DEFAULT_DELAY = 2.0
MAX_RETRIES = 3
COST_PER_IMAGE_USD = 0.039
JPEG_QUALITY = 90


def call_model(client, query: str) -> bytes:
    interaction = client.interactions.create(model=MODEL_NAME, input=query)
    image = getattr(interaction, "output_image", None)
    if image is None:
        raise RuntimeError("No image in response")
    return base64.b64decode(image.data)


def save_image(image_bytes: bytes, out_path: Path, quality: int = JPEG_QUALITY) -> None:
    if out_path.suffix.lower() in (".jpg", ".jpeg"):
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        img.save(out_path, "JPEG", quality=quality)
    else:
        out_path.write_bytes(image_bytes)


def read_csv_rows(path: Path):
    with path.open("r", newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def find_csvs(input_path: Path):
    if input_path.is_file():
        return [input_path]
    return sorted(p for p in input_path.rglob("*.csv")
                  if not p.name.startswith("_"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", help="CSV file or folder of CSVs")
    ap.add_argument("--output", required=True)
    ap.add_argument("--limit", type=int, default=None,
                    help="Cap TOTAL images across all CSVs")
    ap.add_argument("--delay", type=float, default=DEFAULT_DELAY)
    ap.add_argument("--include-skipped", action="store_true",
                    help="Ignore the filter and generate everything")
    args = ap.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY / GOOGLE_API_KEY not set.", file=sys.stderr)
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    csv_files = find_csvs(Path(args.input))
    if not csv_files:
        print(f"No CSV files found in {args.input}")
        sys.exit(1)

    output_root = Path(args.output)
    output_root.mkdir(parents=True, exist_ok=True)

    # ---- Flatten all jobs, apply global --limit ----------------------------
    all_jobs = []
    for cpath in csv_files:
        for row in read_csv_rows(cpath):
            all_jobs.append((cpath, row))
    if args.limit:
        all_jobs = all_jobs[: args.limit]

    # ---- Pre-flight --------------------------------------------------------
    pending = already = filtered = 0
    for _, row in all_jobs:
        decision = row.get("filter_decision", "").strip().upper()
        if decision == "SKIP" and not args.include_skipped:
            filtered += 1
            continue
        if (output_root / row["save_url"].strip()).exists():
            already += 1
        else:
            pending += 1

    print(f"CSV files : {len(csv_files)}")
    print(f"Rows      : {len(all_jobs)}"
          + (f"  (capped by --limit {args.limit})" if args.limit else ""))
    if args.include_skipped:
        print("Filter    : IGNORED (--include-skipped)")
    else:
        print(f"Filtered  : {filtered}  (SKIP rows, no API call)")
    print(f"Already   : {already}  (will skip)")
    print(f"To create : {pending}")
    print(f"Est. cost : ${pending * COST_PER_IMAGE_USD:.2f}")
    print(f"Output    : {output_root}\n")

    total_ok = total_skip = total_filtered = total_fail = 0
    failures = []

    # Group jobs back by CSV for readable output
    by_csv = {}
    for cpath, row in all_jobs:
        by_csv.setdefault(cpath, []).append(row)

    for cpath in csv_files:
        rows = by_csv.get(cpath, [])
        if not rows:
            continue
        print(f"{cpath.name}  ({len(rows)} rows)")

        for i, row in enumerate(rows, 1):
            save_url = row["save_url"].strip()
            query = row["image_query"].strip()
            out_path = output_root / save_url

            decision = row.get("filter_decision", "").strip().upper()
            if decision == "SKIP" and not args.include_skipped:
                print(f"  [{i}/{len(rows)}] {save_url}  skip (filtered)")
                total_filtered += 1
                continue

            if out_path.exists():
                print(f"  [{i}/{len(rows)}] {save_url}  skip (exists)")
                total_skip += 1
                continue

            if not query:
                print(f"  [{i}/{len(rows)}] {save_url}  SKIP (empty query)")
                total_fail += 1
                failures.append({**row, "error": "empty image query"})
                continue

            print(f"  [{i}/{len(rows)}] {save_url} ...", end="", flush=True)

            image_bytes = None
            error = None
            for attempt in range(MAX_RETRIES + 1):
                try:
                    image_bytes = call_model(client, query)
                    break
                except Exception as e:
                    error = str(e)
                    if attempt < MAX_RETRIES:
                        wait = 3 * (2 ** attempt)
                        print(f" retry in {wait}s ...", end="", flush=True)
                        time.sleep(wait)

            if image_bytes:
                try:
                    save_image(image_bytes, out_path)
                    print(" ok")
                    total_ok += 1
                except Exception as e:
                    print(f" FAIL (save): {e}")
                    total_fail += 1
                    failures.append({**row, "error": f"save failed: {e}"})
            else:
                print(f" FAIL: {error}")
                total_fail += 1
                failures.append({**row, "error": error})

            time.sleep(args.delay)

    if failures:
        fail_path = output_root / "_failures.csv"
        with fail_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(
                f,
                fieldnames=["exercise_name", "exercise_question",
                            "image_query", "save_url", "error"],
            )
            writer.writeheader()
            writer.writerows(failures)
        print(f"\nWrote {fail_path} ({len(failures)} failures)")

    print()
    print("=" * 60)
    print(f"OK: {total_ok}   Filtered: {total_filtered}   "
          f"Exists: {total_skip}   Failed: {total_fail}")
    print("=" * 60)


if __name__ == "__main__":
    main()