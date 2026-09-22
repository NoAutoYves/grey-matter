"""Pull rows for one exercise out of the combined image queries CSV."""
import csv
import sys
from pathlib import Path

SRC = Path(r"C:\Users\madon\Documents\GM\Image Queries\MATH\GRADE 12\image queries.csv")
OUT = Path(r"C:\Users\madon\Documents\GM\Image Queries\MATH\GRADE 12\_euclidean.csv")
MATCH = "euclidean geometry"

with SRC.open("r", newline="", encoding="utf-8") as f:
    rows = [r for r in csv.DictReader(f)
            if MATCH in r["exercise_name"].lower()]

with OUT.open("w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["exercise_name", "exercise_question",
                                      "image_query", "save_url",
                                      "filter_decision"])
    w.writeheader()
    w.writerows(rows)

keep = sum(1 for r in rows if r["filter_decision"] == "KEEP")
skip = sum(1 for r in rows if r["filter_decision"] == "SKIP")
print(f"{len(rows)} rows -> {OUT.name}")
print(f"KEEP: {keep}   SKIP: {skip}")