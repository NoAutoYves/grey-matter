#!/usr/bin/env python3
"""
Grey Matter - Notes Expander

Reads Word documents containing raw topic notes (filenames WITHOUT the
"exercise" suffix, e.g. " - EXERCISE" or " - EXERCISES"), expands them
via Google Gemini, and writes structured, styled Word documents with
KaTeX formulas, coloured callouts, and inline highlights.

Each source file produces two outputs in the same folder:
    <topic_name> - NOTES.docx   (formatted, styled for Word)
    <topic_name> - NOTES.md     (raw marker text, for web upload)

Usage:
    python expand_notes.py --path "C:/path/to/folder"

Requires:
    - GEMINI_API_KEY in tools/.env or as an environment variable
    - pip install google-genai python-docx
"""

import argparse
import os
import re
import sys
import time
from pathlib import Path
from datetime import datetime

try:
    from docx import Document
    from docx.shared import Pt, Inches, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
except ImportError:
    print("ERROR: python-docx is not installed. Run: pip install python-docx")
    sys.exit(1)

try:
    from google import genai
    from google.genai import types as genai_types
except ImportError:
    print("ERROR: google-genai is not installed. Run: pip install google-genai")
    sys.exit(1)


# ============================================================
# Configuration
# ============================================================

SCRIPT_DIR = Path(__file__).resolve().parent
ENV_FILE = SCRIPT_DIR / ".env"

# Gemini model options (free tier, verified working with AQ. keys):
#   gemini-3.5-flash-lite  — 15 RPM, 500 RPD  (recommended, high daily cap)
#   gemini-3.5-flash       —  5 RPM,  20 RPD  (better quality, very low RPD)
#   gemini-3.6-flash       —  5 RPM,  20 RPD
#   gemini-3.7-flash       —  5 RPM,  20 RPD
MODEL = "gemini-3.5-flash-lite"

TARGET_WORDS = 3000
MIN_WORDS = 2400
MAX_WORDS = 3600
MAX_RETRIES = 3
RETRY_DELAY = 10
DEFAULT_DELAY = 5

# Grey Matter colour palette
COLOR_PURPLE = "6846FF"
COLOR_PURPLE_BG = "F4F0FF"
COLOR_BLUE = "0B6FCC"
COLOR_BLUE_BG = "EEF5FC"
COLOR_RED = "C0392B"
COLOR_RED_BG = "FDECEA"
COLOR_GREEN = "1E8E3E"
COLOR_GREEN_BG = "E8F5EC"
COLOR_GREY = "CCCCCC"

HIGHLIGHT_YELLOW = "FFF59D"

INLINE_TOKEN_RE = re.compile(
    r"(\$\$[^$]+\$\$|\$[^$]+\$|==[^=]+==|\*\*[^*]+\*\*|\*[^*]+\*)"
)


# ============================================================
# The prompt
# ============================================================

SYSTEM_PROMPT = """You are an expert educational content writer for South African high school students (Grades 10-12, CAPS curriculum).

I will give you raw notes from a textbook. Expand them into comprehensive, beautifully structured study notes of approximately 3000 words.

You MUST follow every rule below exactly. Do not deviate.

=== STRUCTURE RULES ===

1. HEADINGS
   - Use ## for main section headings
   - Use ### for sub-section headings
   - Do NOT use # (that is reserved for the title)

2. LISTS
   - Use - for bullet points
   - Use 1. 2. 3. for numbered lists
   - Do not nest deeper than two levels

3. ABSOLUTELY NO TABLES
   - Do NOT use pipe tables: | col | col |
   - Do NOT use markdown tables of any kind
   - Do NOT use aligned columns or tab-separated layouts
   - To compare items, use bullets: - **Term**: definition
   - Tables will be counted and rejected. If you produce a table, the output is wrong.

4. CALLOUTS - MANDATORY FORMAT
   You must include at least 6 callouts spread through the document.
   Each callout is a single line that STARTS with one of these exact markers:

   **Key Point:** definition or rule that must be memorised
   **Worked Example:** a fully solved problem showing the method
   **Common Mistake:** an error students repeatedly make
   **Exam Tip:** practical advice for the exam

   The marker and the colon must be inside the double asterisks, exactly as shown.
   Follow it with the content on the same line. Do NOT put the content on a new line.

   Correct:  **Key Point:** The ceteris paribus assumption means all other factors are held constant.
   Wrong:    Key Point: The ceteris paribus assumption...
   Wrong:    **Key Point** - The ceteris paribus assumption...
   Wrong:    **Key Point:**
             The ceteris paribus assumption...

5. INLINE HIGHLIGHTS
   - Wrap key terms, formula names, and critical phrases in ==double equals==
   - These render as a yellow highlight in the final document
   - Use 1 to 3 per major section. Not every sentence.
   - Good candidates: defined terms on first use, formula names, exact wording of exam-relevant rules

6. INLINE BOLD AND ITALIC
   - Use **bold** for emphasis on individual words or short phrases
   - Use *italic* for technical terms, Latin names, or mild emphasis
   - Do not overuse

7. SEPARATORS
   - Use --- on its own line to separate major sections visually

8. PARAGRAPHS
   - Maximum 3 to 4 sentences per paragraph
   - Leave a blank line between every paragraph
   - Never write a wall of text

=== MATHEMATICAL NOTATION (APPLIES TO EVERY SUBJECT) ===

This is non-negotiable. ANY formula, equation, ratio, calculation, or mathematical expression, in EVERY subject, must use KaTeX notation. If a concept has a formula, show the formula.

Subject-specific examples:

  - Accounting: VAT, depreciation, financial ratios
    e.g. $\\text{Current Ratio} = \\frac{\\text{Current Assets}}{\\text{Current Liabilities}}$
    e.g. $\\text{VAT} = \\text{Price} \\times 0.15$

  - Economics: GDP, inflation, elasticity
    e.g. $\\text{GDP} = C + I + G + (X - M)$
    e.g. $\\text{Inflation Rate} = \\frac{\\text{CPI}_{\\text{current}} - \\text{CPI}_{\\text{previous}}}{\\text{CPI}_{\\text{previous}}} \\times 100$

  - Business Studies: break-even, mark-up, profit
    e.g. $\\text{Break-Even} = \\frac{\\text{Fixed Costs}}{\\text{Selling Price} - \\text{Variable Cost}}$

  - Life Science: Punnett ratios, magnification, genetic probability
    e.g. $\\text{Magnification} = \\frac{\\text{Image Size}}{\\text{Actual Size}}$

  - Geography: gradient, area, scale
    e.g. $\\text{Gradient} = \\frac{\\text{Vertical Difference}}{\\text{Horizontal Distance}}$

  - Physics, Mathematics, Maths Literacy: everything numeric uses KaTeX

Notation rules:
  - Inline math: single dollar signs — $x^2 + y^2 = r^2$
  - Display math on its own line: $$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
  - NEVER escape backslashes in the output
  - Use proper LaTeX: \\frac, \\sqrt, \\times, \\div, \\pm, \\leq, \\geq, \\text{}, \\sum, \\int, \\Delta, \\theta

=== CONTENT RULES ===

1. Define every key term clearly on first use
2. Include at least 3 **Worked Example:** callouts
3. Include at least 1 **Common Mistake:** callout per major section
4. End with a ## Exam Tips section containing 5 to 8 concrete strategies
5. Use South African context, currency (R), and examples
6. Be exam-focused. Every sentence must earn its place.

=== STYLE ===

  - Write for a 16 to 18 year old South African student
  - Direct. Clear. No filler.
  - Friendly but not casual
  - Prefer active voice

=== LENGTH ===

  - Target: 3000 words
  - Minimum: 2500 words
  - Maximum: 3500 words
  - Distribute evenly across sections

=== FINAL CHECK BEFORE YOU RETURN ===

Before returning, verify:
  1. Zero tables of any kind
  2. At least 6 callouts, each starting with a valid marker
  3. At least 2500 words
  4. Every formula is in KaTeX
  5. At least 10 inline highlights

Return ONLY the notes. No preamble. No sign-off.
"""

USER_PROMPT_TEMPLATE = """Topic: {topic_name}

Raw notes from the textbook:

---
{raw_notes}
---

Expand these into full study notes following every rule above. Approximately 3000 words."""


# ============================================================
# Environment loading
# ============================================================

def load_env_file(path: Path):
    if not path.exists():
        return
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                os.environ.setdefault(key, value)
    except Exception as e:
        print(f"WARNING: could not read {path}: {e}")


# ============================================================
# Source file detection
# ============================================================

def is_notes_doc(filename: str) -> bool:
    """
    Return True if this file is a raw notes source we should expand.

    Skip rules:
      - Not a .docx
      - Word lock files (~$...)
      - Generated outputs (* - NOTES.docx)
      - Exercise files (any case of " - EXERCISE", " - EXERCISES",
        " - exercise", " - exercises", " - Exercises")
    """
    if not filename.lower().endswith(".docx"):
        return False
    if filename.startswith("~$"):
        return False

    # Strip the .docx extension so we can compare suffixes cleanly
    base = filename[:-5]
    base_lower = base.lower()

    # Generated output
    if base_lower.endswith(" - notes"):
        return False

    # Exercise files (any case of singular or plural)
    if base_lower.endswith(" - exercise") or base_lower.endswith(" - exercises"):
        return False

    return True


def topic_name_from_filename(filename: str) -> str:
    return filename[:-5].strip() if filename.lower().endswith(".docx") else filename


# ============================================================
# Reading source .docx
# ============================================================

def read_docx_text(path: Path) -> str:
    doc = Document(str(path))
    paragraphs = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            paragraphs.append(text)
    return "\n\n".join(paragraphs)


# ============================================================
# LLM call (Gemini)
# ============================================================

def expand_notes(client, topic_name: str, raw_notes: str) -> str:
    user_prompt = USER_PROMPT_TEMPLATE.format(
        topic_name=topic_name,
        raw_notes=raw_notes,
    )

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=user_prompt,
                config=genai_types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.5,
                    max_output_tokens=8192,
                ),
            )
            text = getattr(response, "text", None)
            if text and text.strip():
                return text.strip()
            raise ValueError("Empty response from model")
        except Exception as e:
            last_error = e
            err_str = str(e)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "rate" in err_str.lower():
                wait = RETRY_DELAY * attempt * 3
                print(f"        Attempt {attempt} hit rate limit. Waiting {wait}s...")
                time.sleep(wait)
            elif attempt < MAX_RETRIES:
                wait = RETRY_DELAY * attempt
                print(f"        Attempt {attempt} failed ({e}). Retrying in {wait}s...")
                time.sleep(wait)

    raise RuntimeError(f"All {MAX_RETRIES} attempts failed. Last error: {last_error}")


# ============================================================
# Word formatting helpers
# ============================================================

def set_paragraph_shading(paragraph, fill_hex: str):
    pPr = paragraph._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), fill_hex)
    pPr.append(shd)


def set_run_highlight(run, fill_hex: str):
    rPr = run._element.get_or_add_rPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), fill_hex)
    rPr.append(shd)


def set_paragraph_border(paragraph, edges: dict):
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    for edge, color in edges.items():
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "24" if edge == "left" else "6")
        el.set(qn("w:space"), "8")
        el.set(qn("w:color"), color)
        pBdr.append(el)
    pPr.append(pBdr)


def add_run_with_math(paragraph, text: str, base_color: str = None):
    parts = INLINE_TOKEN_RE.split(text)
    for part in parts:
        if not part:
            continue

        if part.startswith("$$") and part.endswith("$$") and len(part) > 4:
            run = paragraph.add_run(part[2:-2])
            run.font.name = "Cambria Math"
            run.italic = True
            if base_color:
                run.font.color.rgb = RGBColor.from_string(base_color)
            continue

        if part.startswith("$") and part.endswith("$") and len(part) > 2:
            run = paragraph.add_run(part)
            run.font.name = "Cambria Math"
            run.italic = True
            if base_color:
                run.font.color.rgb = RGBColor.from_string(base_color)
            continue

        if part.startswith("==") and part.endswith("==") and len(part) > 4:
            run = paragraph.add_run(part[2:-2])
            set_run_highlight(run, HIGHLIGHT_YELLOW)
            if base_color:
                run.font.color.rgb = RGBColor.from_string(base_color)
            continue

        if part.startswith("**") and part.endswith("**") and len(part) > 4:
            run = paragraph.add_run(part[2:-2])
            run.bold = True
            if base_color:
                run.font.color.rgb = RGBColor.from_string(base_color)
            continue

        if part.startswith("*") and part.endswith("*") and len(part) > 2:
            run = paragraph.add_run(part[1:-1])
            run.italic = True
            if base_color:
                run.font.color.rgb = RGBColor.from_string(base_color)
            continue

        run = paragraph.add_run(part)
        if base_color:
            run.font.color.rgb = RGBColor.from_string(base_color)


def add_heading(doc, text: str, level: int):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        if level == 1:
            run.font.color.rgb = RGBColor.from_string(COLOR_PURPLE)
            run.font.size = Pt(18)
        elif level == 2:
            run.font.color.rgb = RGBColor.from_string("1A1A2E")
            run.font.size = Pt(14)
        else:
            run.font.color.rgb = RGBColor.from_string("333333")
            run.font.size = Pt(12)
    return h


def add_horizontal_rule(doc):
    p = doc.add_paragraph()
    set_paragraph_border(p, {"bottom": COLOR_GREY})
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)


def add_callout(doc, label: str, body: str, color: str, bg: str):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.left_indent = Inches(0.15)
    p.paragraph_format.right_indent = Inches(0.15)
    set_paragraph_border(p, {"left": color})
    set_paragraph_shading(p, bg)

    label_run = p.add_run(f"{label}  ")
    label_run.bold = True
    label_run.font.color.rgb = RGBColor.from_string(color)

    add_run_with_math(p, body)
    return p


def add_bullet(doc, content: str):
    p = doc.add_paragraph(style="List Bullet")
    add_run_with_math(p, content)
    return p


def add_numbered(doc, content: str):
    p = doc.add_paragraph(style="List Number")
    add_run_with_math(p, content)
    return p


def add_body_paragraph(doc, content: str):
    p = doc.add_paragraph()
    add_run_with_math(p, content)
    p.paragraph_format.space_after = Pt(6)
    return p


def add_display_math(doc, content: str):
    p = doc.add_paragraph()
    run = p.add_run(content)
    run.font.name = "Cambria Math"
    run.italic = True
    run.font.size = Pt(12)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    return p


# ============================================================
# Parsing the LLM output into Word
# ============================================================

CALL_OUT_PATTERNS = [
    (
        re.compile(
            r"^(?:\*\*)?Key\s*Point\s*:?(?:\*\*)?\s*[:\-]?\s*(.*)$",
            re.IGNORECASE | re.MULTILINE,
        ),
        "Key Point", COLOR_PURPLE, COLOR_PURPLE_BG,
    ),
    (
        re.compile(
            r"^(?:\*\*)?Worked\s*Example\s*:?(?:\*\*)?\s*[:\-]?\s*(.*)$",
            re.IGNORECASE | re.MULTILINE,
        ),
        "Worked Example", COLOR_BLUE, COLOR_BLUE_BG,
    ),
    (
        re.compile(
            r"^(?:\*\*)?Common\s*Mistake\s*:?(?:\*\*)?\s*[:\-]?\s*(.*)$",
            re.IGNORECASE | re.MULTILINE,
        ),
        "Common Mistake", COLOR_RED, COLOR_RED_BG,
    ),
    (
        re.compile(
            r"^(?:\*\*)?Exam\s*Tip\s*:?(?:\*\*)?\s*[:\-]?\s*(.*)$",
            re.IGNORECASE | re.MULTILINE,
        ),
        "Exam Tip", COLOR_GREEN, COLOR_GREEN_BG,
    ),
]


def write_notes_docx(topic_name: str, notes_markdown: str, out_path: Path):
    doc = Document()

    title = doc.add_heading(topic_name, level=0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in title.runs:
        run.font.color.rgb = RGBColor.from_string(COLOR_PURPLE)

    sub = doc.add_paragraph()
    sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = sub.add_run("Grey Matter Study Notes")
    sub_run.italic = True
    sub_run.font.size = Pt(11)
    sub_run.font.color.rgb = RGBColor.from_string("666666")

    add_horizontal_rule(doc)

    lines = notes_markdown.split("\n")
    in_display_math = False
    display_buffer = []

    for raw_line in lines:
        line = raw_line.rstrip()
        stripped = line.strip()

        if not stripped:
            continue

        if stripped.startswith("$$"):
            if stripped.endswith("$$") and len(stripped) > 4:
                add_display_math(doc, stripped[2:-2].strip())
                continue
            if not in_display_math:
                in_display_math = True
                display_buffer = [stripped[2:]]
                continue
            else:
                display_buffer.append(stripped[:-2])
                add_display_math(doc, "\n".join(display_buffer).strip())
                in_display_math = False
                display_buffer = []
                continue

        if in_display_math:
            display_buffer.append(stripped)
            continue

        if stripped == "---":
            add_horizontal_rule(doc)
            continue

        callout_matched = False
        for pattern, label, color, bg in CALL_OUT_PATTERNS:
            m = pattern.match(stripped)
            if m:
                body = m.group(1).strip()
                add_callout(doc, label, body, color, bg)
                callout_matched = True
                break
        if callout_matched:
            continue

        if stripped.startswith("### "):
            add_heading(doc, stripped[4:], level=3)
            continue
        if stripped.startswith("## "):
            add_heading(doc, stripped[3:], level=1)
            continue
        if stripped.startswith("# "):
            add_heading(doc, stripped[2:], level=1)
            continue

        if stripped.startswith("- ") or stripped.startswith("* "):
            add_bullet(doc, stripped[2:])
            continue

        numbered_match = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if numbered_match:
            num = numbered_match.group(1)
            content = numbered_match.group(2)
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.4)
            p.paragraph_format.first_line_indent = Inches(-0.28)
            p.paragraph_format.space_after = Pt(4)
            add_run_with_math(p, f"{num}.\u2003{content}")
            continue

        add_body_paragraph(doc, stripped)

    doc.save(str(out_path))


# ============================================================
# Stats
# ============================================================

def count_stats(text: str) -> dict:
    return {
        "words": len(text.split()),
        "headings": len(re.findall(r"^#{1,3}\s", text, re.MULTILINE)),
        "bullets": len(re.findall(r"^[-*]\s", text, re.MULTILINE)),
        "numbered": len(re.findall(r"^\d+\.\s", text, re.MULTILINE)),
        "callouts": sum(len(p.findall(text)) for p, *_ in CALL_OUT_PATTERNS),
        "highlights": len(re.findall(r"==[^=]+==", text)),
        "tables": len(re.findall(r"^\s*\|.*\|\s*$", text, re.MULTILINE)),
        "inline_math": len(re.findall(r"\$[^$]+\$", text)),
        "display_math": len(re.findall(r"\$\$[^$]+\$\$", text, re.DOTALL)),
    }


def print_stats(label: str, stats: dict, elapsed: float = None):
    print(f"    {label}:")
    print(f"      Words:          {stats['words']}")
    print(f"      Headings:       {stats['headings']}")
    print(f"      Bullets:        {stats['bullets']}")
    print(f"      Numbered:       {stats['numbered']}")
    print(f"      Callouts:       {stats['callouts']}")
    print(f"      Highlights:     {stats['highlights']}")
    print(f"      Tables:         {stats['tables']}   (should be 0)")
    print(f"      Inline math:    {stats['inline_math']}")
    print(f"      Display math:   {stats['display_math']}")
    if elapsed is not None:
        print(f"      Time:           {elapsed:.1f}s")


# ============================================================
# Main
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="Expand raw topic notes into full study notes.")
    parser.add_argument("--path", required=True, help="Folder containing source .docx files")
    parser.add_argument("--limit", type=int, default=None, help="Process only the first N files")
    parser.add_argument("--skip-existing", action="store_true", help="Skip files that already have a NOTES output")
    parser.add_argument("--delay", type=int, default=DEFAULT_DELAY, help=f"Seconds between files (default: {DEFAULT_DELAY})")
    args = parser.parse_args()

    load_env_file(ENV_FILE)

    api_key = (
        os.environ.get("GEMINI_API_KEY")
        or os.environ.get("GOOGLE_API_KEY")
    )
    if not api_key:
        print("ERROR: GEMINI_API_KEY is not set.")
        print(f"Add it to {ENV_FILE} or set the environment variable.")
        print("Get a free key at https://aistudio.google.com/apikey")
        sys.exit(1)

    folder = Path(args.path)
    if not folder.exists() or not folder.is_dir():
        print(f"ERROR: Folder does not exist: {folder}")
        sys.exit(1)

    files = sorted([f for f in folder.iterdir() if f.is_file() and is_notes_doc(f.name)])

    if args.skip_existing:
        files = [
            f for f in files
            if not (folder / f"{topic_name_from_filename(f.name)} - NOTES.docx").exists()
        ]

    if args.limit:
        files = files[:args.limit]

    if not files:
        print(f"No notes documents found in {folder}")
        return

    print()
    print("=" * 60)
    print(" GREY MATTER - Notes Expander")
    print("=" * 60)
    print(f" Folder:  {folder}")
    print(f" Model:   {MODEL}")
    print(f" Files:   {len(files)}")
    print(f" Delay:   {args.delay}s between files")
    print(f" Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()

    client = genai.Client(api_key=api_key)

    totals = {"words_in": 0, "words_out": 0, "processed": 0, "failed": 0, "start": time.time()}

    for idx, src_path in enumerate(files, start=1):
        topic_name = topic_name_from_filename(src_path.name)
        out_docx = folder / f"{topic_name} - NOTES.docx"
        out_md = folder / f"{topic_name} - NOTES.md"

        print(f"[{idx}/{len(files)}] {src_path.name}")

        try:
            raw = read_docx_text(src_path)
            if not raw.strip():
                print("    SKIPPED: no text content")
                totals["failed"] += 1
                continue

            stats_in = count_stats(raw)
            print(f"    Input: {stats_in['words']} words")

            print(f"    Calling {MODEL}...")
            t0 = time.time()
            expanded = expand_notes(client, topic_name, raw)
            elapsed = time.time() - t0

            stats_out = count_stats(expanded)
            print_stats("Output", stats_out, elapsed)

            if stats_out["words"] < MIN_WORDS:
                print(f"    WARNING: output under {MIN_WORDS} words")
            if stats_out["tables"] > 0:
                print(f"    WARNING: model produced {stats_out['tables']} tables (should be 0)")

            write_notes_docx(topic_name, expanded, out_docx)
            print(f"    Saved: {out_docx.name}")

            with open(out_md, "w", encoding="utf-8") as f:
                f.write(expanded)
            print(f"    Saved: {out_md.name}")

            totals["words_in"] += stats_in["words"]
            totals["words_out"] += stats_out["words"]
            totals["processed"] += 1

        except Exception as e:
            print(f"    FAILED: {e}")
            totals["failed"] += 1

        if idx < len(files) and args.delay > 0:
            print(f"    Waiting {args.delay}s before next file...")
            time.sleep(args.delay)

        print()

    total_time = time.time() - totals["start"]
    print("=" * 60)
    print(" SUMMARY")
    print("=" * 60)
    print(f" Processed:  {totals['processed']}")
    print(f" Failed:     {totals['failed']}")
    print(f" Words in:   {totals['words_in']}")
    print(f" Words out:  {totals['words_out']}")
    if totals["words_in"] > 0:
        print(f" Expansion:  {totals['words_out'] / totals['words_in']:.1f}x")
    print(f" Total time: {total_time:.1f}s")
    print("=" * 60)
    print()


if __name__ == "__main__":
    main()