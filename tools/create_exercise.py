# tools/create_exercise.py
"""
create_exercise.py — Grey Matter exercise generator.

Reads '<topic> - NOTES.docx' files, sends the notes to Gemini with a
CAPS-examiner system prompt, writes '<topic> - Exercises.docx' back to the
same folder.

Output is plain-text paragraphs + KaTeX only, and is guaranteed parseable
by redistribute.py (validated after generation using the same block-walk
redistribute.py uses).

Hard requirements enforced by the prompt and post-validated:
  - exactly 5 exercises per topic
  - exactly 10 questions per exercise
  - every question has an Image query line
  - every question has exactly 4 options A) B) C) D)
  - every question has exactly one "Answer: X" line
  - every question grounded in the supplied notes
  - no markdown, no tables, no bullets, no pipes
  - KaTeX rules per subject

Companion to expand_notes.py. Same conventions: .env next to the script,
google-genai, gemini-3.5-flash-lite, retry-on-429, per-file stats.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path

from docx import Document

try:
    from google import genai
    from google.genai import types as genai_types
except ImportError:
    print("ERROR: google-genai is not installed. Run: pip install google-genai")
    sys.exit(1)


# --------------------------------------------------------------------------- #
# Config
# --------------------------------------------------------------------------- #

MODEL_NAME = "gemini-3.5-flash-lite"
SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_DELAY = 4.5  # seconds between API calls (free tier 15 RPM)

REQUIRED_EXERCISES = 5
REQUIRED_QUESTIONS_PER_EXERCISE = 10

BROAD_KATEX_SUBJECTS = {
    "MATHEMATICS", "MATHS", "MATH",
    "MATHEMATICAL LITERACY", "MATHS LIT",
    "PHYSICAL SCIENCES", "PHYSICS",
}

KNOWN_SUBJECTS = BROAD_KATEX_SUBJECTS | {
    "ACCOUNTING", "BUSINESS STUDIES", "ECONOMICS", "GEOGRAPHY",
    "LIFE SCIENCE", "LIFE SCIENCES",
}

# Longest-first so "MATHEMATICAL LITERACY" matches before "MATHEMATICS".
_SUBJECTS_BY_LEN = sorted(KNOWN_SUBJECTS, key=len, reverse=True)


# --------------------------------------------------------------------------- #
# .env loading (matches expand_notes.py)
# --------------------------------------------------------------------------- #

def load_env(env_path: Path) -> None:
    if not env_path.exists():
        return
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


# --------------------------------------------------------------------------- #
# System prompt — this is where quality comes from
# --------------------------------------------------------------------------- #

SYSTEM_PROMPT = r"""You are a senior South African CAPS curriculum examiner writing exam-style
multiple-choice exercises for Grades 10-12.

You will be given a set of study notes for ONE topic, plus the subject and
grade. READ THE NOTES CAREFULLY. Produce exactly 5 exercises, each with
exactly 10 questions, testing that topic at exam standard.

=== GROUNDING — MOST IMPORTANT RULE ===

Every question you write MUST be answerable from the supplied notes alone.
Do NOT invent facts, figures, examples, definitions, formulas or sub-topics
that are not present in the notes. Do NOT draw on general CAPS knowledge
beyond what the notes contain. If the notes only cover three sub-topics,
your 50 questions must come from those three sub-topics — not from
neighbouring topics you happen to know about. Every correct answer and
every distractor must trace back to specific content in the notes.

=== HARD REQUIREMENTS (non-negotiable) ===

1. EXACTLY 5 exercises. Never more, never fewer.
2. Each exercise has EXACTLY 10 questions. Never more, never fewer.
3. EVERY question has an "Image query:" line immediately above it. No
   exceptions — even conceptual questions must have one.
4. Output ONLY the exercises. No preamble, no commentary, no closing remarks,
   no "Pattern used:" line, no headings. Start directly with the first
   exercise title line.

=== OUTPUT STRUCTURE — FOLLOW EXACTLY ===

<topic> - Exercise 1

Image query: <one sentence describing the diagram>. Use clean black lines on a white background.

Question 1:
<stem — one single paragraph, may contain $KaTeX$>
A) <option>
B) <option>
C) <option>
D) <option>

Answer: <A|B|C|D>

Image query: <description>. Use clean black lines on a white background.

Question 2:
...
(through Question 10)

<topic> - Exercise 2

Image query: ...
Question 1:
...
(through Exercise 5)

=== FORMATTING RULES ===

- NO markdown. No bold (**), no italics, no headings (#), no bullets
  (- or *), no horizontal rules.
- NO tables. No pipe characters, no aligned columns.
- Plain text paragraphs only, plus KaTeX inside $...$ or $$...$$.
- The question stem is ONE paragraph, on ONE line. No internal line breaks,
  even for scenario questions.
- Options on consecutive lines labelled A) B) C) D) in that order.
- "Answer: X" on its own line immediately after option D). One letter only.
- Blank line between the "Answer:" line and the next "Image query:" line.
- Image query line must end with the exact phrase:
  "Use clean black lines on a white background."

=== KATEX RULES ===

For MATHEMATICS, MATHEMATICAL LITERACY and PHYSICAL SCIENCES:
- Wrap EVERY formula, symbol, unit, mathematical expression and equation in
  $...$ (inline) or $$...$$ (display, on its own line).
- Examples: $x^2 + 3x - 4$, $\frac{1}{2}mv^2$, $9.8\,\text{m/s}^2$,
  $30^\circ$, $\pi$, $\sqrt{3}$, $[\text{H}^+] = 1 \times 10^{-3}\,\text{mol/dm}^3$,
  $\text{CO}_2$.

For ACCOUNTING, BUSINESS STUDIES, ECONOMICS, GEOGRAPHY and LIFE SCIENCES:
- Use plain text for everything except genuinely mathematical formulas.
- Formulas go in KaTeX:
  $\text{Assets} = \text{Liabilities} + \text{Equity}$,
  $\text{Break-even} = \frac{\text{Fixed costs}}{\text{Selling price} - \text{Variable cost}}$,
  $MV = PT$.
- Do NOT wrap plain English words, company names, dates or ordinary numbers.

Global KaTeX rules:
- Never escape backslashes: write \frac, not \\frac.
- Never use unicode symbols: write $\pi$ not the pi glyph, $\times$ not the
  multiplication glyph, $^\circ$ not the degree glyph, $\rightarrow$ not the
  arrow glyph.
- Use a DECIMAL POINT, not a comma: $0.01$, $1.7$, $9.8$.
- Units inside \text{}: $\text{mol/dm}^3$, $\text{m/s}^2$, $\text{cm}^3$.
- Chemical formulas: $\text{H}_2\text{O}$, $\text{CO}_2$, $\text{CH}_3\text{COOH}$.

=== QUESTION QUALITY ===

- Exam-realistic. Not trivia, not trick questions. Aim for roughly
  4 straightforward, 4 medium, 2 stretch per exercise.
- Every wrong option is a plausible distractor tied to a real student error
  (sign slip, wrong formula, confused concept, unit error, off-by-one).
  No random noise.
- Numeric questions must be fully solvable from the numbers given.
- Spread coverage across the whole of the supplied notes. If the notes have
  5 sections, every section is represented across the 5 exercises. Do not
  over-index on the first section of the notes.
- South African contexts where the notes allow it: currency (R), units,
  places ("a small business in Soweto", "a farmer in the Free State",
  "Eskom", "the Reserve Bank"). Do not import SA examples that the notes
  do not support.
- South African English spellings: colour, recognise, centre, analyse,
  programme.
- Do NOT force a balanced A/B/C/D distribution. Write the correct answer
  wherever it naturally falls. A separate tool balances later.
- Exercises 1–5 must test DIFFERENT angles of the notes. No near-duplicate
  questions.

=== FINAL CHECKLIST — VERIFY BEFORE RETURNING ===

[ ] Every question traces back to specific content in the supplied notes.
[ ] Exactly 5 exercises, each with exactly 10 questions.
[ ] Every question has an Image query line ending with
    "Use clean black lines on a white background."
[ ] Every question has exactly 4 options A) B) C) D).
[ ] Every question has exactly one "Answer: X" line.
[ ] Stems are single paragraphs, no internal line breaks.
[ ] No markdown, no tables, no bullets, no pipes, no "Pattern used:" line.
[ ] KaTeX rules followed for this subject.
[ ] No preamble before Exercise 1, no closing text after the final Answer.

Return the 5 exercises now.
"""


USER_PROMPT_TEMPLATE = """Subject: {subject}
Grade: {grade}
Topic: {topic}

KaTeX scope for this subject: {katex_scope}

Read the notes below carefully. Every one of the 50 questions you produce
must be grounded in this content. Do not use outside knowledge.

--- BEGIN NOTES ---
{notes}
--- END NOTES ---

Produce exactly 5 exercises, each with exactly 10 questions, following every
rule in the system prompt. Every question MUST have an Image query line above
it ending with "Use clean black lines on a white background."
"""


# --------------------------------------------------------------------------- #
# Data model
# --------------------------------------------------------------------------- #

@dataclass
class Question:
    number: int
    image_query: str | None = None
    text: str = ""
    options: dict[str, str] = field(default_factory=dict)
    answer: str = ""


@dataclass
class Exercise:
    number: int
    questions: list[Question] = field(default_factory=list)


# --------------------------------------------------------------------------- #
# File helpers
# --------------------------------------------------------------------------- #

def is_notes_file(path: Path) -> bool:
    if path.suffix.lower() != ".docx":
        return False
    if path.name.startswith("~$"):
        return False
    stem = path.stem.lower()
    return bool(re.search(r"\s*-\s*notes\s*$", stem))


def extract_topic(filename: str) -> str:
    stem = Path(filename).stem
    m = re.match(r"^(.*?)\s*-\s*notes\s*$", stem, re.IGNORECASE)
    return m.group(1).strip() if m else stem


def read_docx_text(path: Path) -> str:
    doc = Document(str(path))
    parts: list[str] = []
    for p in doc.paragraphs:
        if p.text and p.text.strip():
            parts.append(p.text)
    for tbl in doc.tables:
        for row in tbl.rows:
            cells = [c.text.strip() for c in row.cells]
            if any(cells):
                parts.append(" | ".join(cells))
    return "\n".join(parts)


# Matches "Grade 12", "GRADE 12", "Gr 12", "Grade12" as a prefix of a folder
# name — so both "GRADE 12" and "GRADE 12 PHYSICS" work.
_GRADE_RE = re.compile(r"^(?:grade|gr)\.?\s*(\d{1,2})\b", re.IGNORECASE)


def _extract_grade_from_name(name: str) -> str | None:
    m = _GRADE_RE.match(name.strip())
    if not m:
        return None
    return f"Grade {int(m.group(1))}"


def _extract_subject_from_name(name: str) -> str | None:
    """Match either an exact subject folder name or a known subject word
    inside a composite folder name like 'GRADE 12 PHYSICS'."""
    upper = name.strip().upper()
    if upper in KNOWN_SUBJECTS:
        return name.strip()
    for subj in _SUBJECTS_BY_LEN:
        if re.search(rf"\b{re.escape(subj)}\b", upper):
            return subj.title()
    return None


def infer_subject_grade(path: Path) -> tuple[str | None, str | None]:
    """Walk parent folder names looking for a subject and a grade.

    Handles both layouts:
      ...\\PHYSICS\\GRADE 12\\topic - NOTES.docx
      ...\\GRADE 12 PHYSICS\\topic - NOTES.docx
    """
    subject: str | None = None
    grade: str | None = None
    for ancestor in path.parents:
        name = ancestor.name.strip()
        if not name:
            continue
        if not grade:
            g = _extract_grade_from_name(name)
            if g:
                grade = g
        if not subject:
            s = _extract_subject_from_name(name)
            if s:
                subject = s
        if grade and subject:
            break
    return subject, grade


def katex_scope_for(subject: str | None) -> str:
    if subject and subject.upper() in BROAD_KATEX_SUBJECTS:
        return "BROAD — wrap every formula, symbol, unit and mathematical expression in $...$"
    return "NARROW — plain text except genuinely mathematical formulas"


# --------------------------------------------------------------------------- #
# Gemini call with retry-on-429
# --------------------------------------------------------------------------- #

RETRY_WAITS = [5, 20, 60]


def call_gemini(client: genai.Client, system_prompt: str, user_prompt: str) -> str:
    last_err: Exception | None = None
    attempts = len(RETRY_WAITS) + 1
    for attempt in range(attempts):
        try:
            resp = client.models.generate_content(
                model=MODEL_NAME,
                contents=user_prompt,
                config=genai_types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.85,
                    max_output_tokens=32768,
                ),
            )
            text = getattr(resp, "text", None)
            if text and text.strip():
                return text
            last_err = RuntimeError("empty response from model")
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            msg = str(exc).lower()
            retryable = any(
                s in msg
                for s in ("429", "rate", "quota", "resource_exhausted", "unavailable")
            )
            if attempt == attempts - 1:
                break
            wait = RETRY_WAITS[attempt] if retryable else 3
            print(f"    retry {attempt + 1}/{attempts - 1} in {wait}s: {exc}")
            time.sleep(wait)
    raise RuntimeError(f"Gemini call failed after {attempts} attempts: {last_err}")


# --------------------------------------------------------------------------- #
# Parser
# --------------------------------------------------------------------------- #

SEP_RE = re.compile(r"^-{3,}$")
EX_TOPIC_RE = re.compile(r"^(.+?)\s*-\s*Exercise\s+(\d+)\s*$", re.IGNORECASE)
EX_BARE_RE = re.compile(r"^Exercise\s+(\d+)\s*$", re.IGNORECASE)
QUESTION_RE = re.compile(r"^Question\s+(\d+)\s*:?\s*(.*)$", re.IGNORECASE)
OPTION_RE = re.compile(r"^([A-D])[\)\.\:]\s*(.+)$")
ANSWER_RE = re.compile(r"^Answer\s*:\s*([A-D])\s*$", re.IGNORECASE)
IMAGE_RE = re.compile(r"^Image\s+query\s*:\s*(.+)$", re.IGNORECASE)


def strip_code_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    return text


def strip_md(line: str) -> str:
    s = line.strip()
    s = s.replace("**", "").replace("__", "")
    s = re.sub(r"^#{1,6}\s*", "", s)
    s = re.sub(r"^>\s*", "", s)
    s = re.sub(r"^[-*]\s+", "", s)
    return s.strip()


def parse_output(text: str) -> list[Exercise]:
    text = strip_code_fences(text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [strip_md(ln) for ln in text.split("\n")]

    exercises: list[Exercise] = []
    current_ex: Exercise | None = None
    current_q: Question | None = None
    section: str | None = None
    text_buf: list[str] = []
    pending_image: str | None = None

    def commit() -> None:
        nonlocal current_q, text_buf
        if current_q is not None and current_ex is not None:
            current_q.text = " ".join(t for t in text_buf if t.strip()).strip()
            current_ex.questions.append(current_q)
        current_q = None
        text_buf = []

    for raw in lines:
        line = raw.strip()
        if not line:
            continue
        if SEP_RE.match(line):
            continue

        if section in (None, "answer"):
            m = EX_TOPIC_RE.match(line)
            if m and len(line) < 200:
                commit()
                current_ex = Exercise(number=int(m.group(2)))
                exercises.append(current_ex)
                section = None
                pending_image = None
                continue
            m2 = EX_BARE_RE.match(line)
            if m2:
                commit()
                current_ex = Exercise(number=int(m2.group(1)))
                exercises.append(current_ex)
                section = None
                pending_image = None
                continue

        m = IMAGE_RE.match(line)
        if m:
            pending_image = m.group(1).strip()
            continue

        m = QUESTION_RE.match(line)
        if m:
            commit()
            if current_ex is None:
                current_ex = Exercise(number=1)
                exercises.append(current_ex)
            current_q = Question(
                number=int(m.group(1)),
                image_query=pending_image,
            )
            pending_image = None
            section = "text"
            inline = (m.group(2) or "").strip()
            if inline:
                text_buf.append(inline)
            continue

        if current_q is None:
            continue

        if section == "answer":
            continue

        m = ANSWER_RE.match(line)
        if m:
            current_q.answer = m.group(1).upper()
            section = "answer"
            continue

        m = OPTION_RE.match(line)
        if m:
            current_q.options[m.group(1).upper()] = m.group(2).strip()
            section = "options"
            continue

        if section == "text":
            text_buf.append(line)

    commit()
    return [ex for ex in exercises if ex.questions]


# --------------------------------------------------------------------------- #
# Validation
# --------------------------------------------------------------------------- #

IMAGE_TAIL = "use clean black lines on a white background"


def validate_exercises(exercises: list[Exercise]) -> list[str]:
    issues: list[str] = []
    if len(exercises) != REQUIRED_EXERCISES:
        issues.append(
            f"expected {REQUIRED_EXERCISES} exercises, got {len(exercises)}"
        )
    for ex in exercises:
        if len(ex.questions) != REQUIRED_QUESTIONS_PER_EXERCISE:
            issues.append(
                f"Exercise {ex.number}: expected {REQUIRED_QUESTIONS_PER_EXERCISE} "
                f"questions, got {len(ex.questions)}"
            )
        for q in ex.questions:
            tag = f"Ex{ex.number} Q{q.number}"
            if not q.image_query:
                issues.append(f"{tag}: missing Image query")
            elif IMAGE_TAIL not in q.image_query.lower():
                issues.append(
                    f"{tag}: image query missing 'Use clean black lines on a white background'"
                )
            if not q.text.strip():
                issues.append(f"{tag}: empty question text")
            missing = [k for k in "ABCD" if k not in q.options]
            if missing:
                issues.append(f"{tag}: missing options {missing}")
            elif any(not q.options[k].strip() for k in "ABCD"):
                issues.append(f"{tag}: empty option text")
            if q.answer not in ("A", "B", "C", "D"):
                issues.append(f"{tag}: missing/invalid Answer")
    return issues


def roundtrip_check_docx(docx_path: Path) -> list[str]:
    """Re-parse the DOCX using the same block-walk redistribute.py uses,
    and report any 'Question' block it would fail to parse."""
    doc = Document(str(docx_path))
    paragraphs = doc.paragraphs
    issues: list[str] = []
    i = 0
    n = len(paragraphs)
    while i < n:
        text = paragraphs[i].text.strip()
        if not text.startswith("Question "):
            i += 1
            continue
        label = text
        a_i = b_i = c_i = d_i = ans_i = None
        j = i + 1
        while j < n:
            t = paragraphs[j].text.strip()
            if t.startswith("A)") and a_i is None:
                a_i = j
            elif t.startswith("B)") and a_i is not None and b_i is None:
                b_i = j
            elif t.startswith("C)") and b_i is not None and c_i is None:
                c_i = j
            elif t.startswith("D)") and c_i is not None and d_i is None:
                d_i = j
            elif t.startswith("Answer:") and d_i is not None and ans_i is None:
                ans_i = j
                break
            elif t.startswith("Question ") and a_i is None:
                break
            j += 1
        if a_i is None or b_i is None or c_i is None or d_i is None or ans_i is None:
            issues.append(f"redistribute.py would skip: {label}")
        i = j + 1 if j < n else n
    return issues


def count_katex(text: str) -> tuple[int, int]:
    display = re.findall(r"\$\$(.+?)\$\$", text, re.DOTALL)
    without_display = re.sub(r"\$\$.+?\$\$", "", text, flags=re.DOTALL)
    inline = re.findall(r"\$([^$\n]+)\$", without_display)
    return len(inline), len(display)


# --------------------------------------------------------------------------- #
# DOCX writer — plain paragraphs only, no styling
# --------------------------------------------------------------------------- #

def write_docx(path: Path, topic: str, exercises: list[Exercise]) -> None:
    doc = Document()

    first_exercise = True
    for ex in exercises:
        if not first_exercise:
            doc.add_paragraph()
            doc.add_paragraph()
        first_exercise = False

        doc.add_paragraph(f"{topic} - Exercise {ex.number}")
        doc.add_paragraph()

        for q in ex.questions:
            if q.image_query:
                doc.add_paragraph(f"Image query: {q.image_query}")
                doc.add_paragraph()

            doc.add_paragraph(f"Question {q.number}:")
            doc.add_paragraph(q.text)
            for letter in "ABCD":
                doc.add_paragraph(f"{letter}) {q.options.get(letter, '')}")
            doc.add_paragraph()
            doc.add_paragraph(f"Answer: {q.answer}")
            doc.add_paragraph()

    doc.save(str(path))


# --------------------------------------------------------------------------- #
# Per-file processing
# --------------------------------------------------------------------------- #

def process_file(
    client: genai.Client,
    path: Path,
    skip_existing: bool,
    index: int,
    total: int,
) -> dict | None:
    topic = extract_topic(path.name)
    out_docx = path.with_name(f"{topic} - Exercises.docx")
    progress = f"[{index}/{total}]"

    if skip_existing and out_docx.exists():
        print(f"{progress} SKIP (exists): {path.name}")
        return None

    print(f"\n{progress} -> {path.name}")

    notes = read_docx_text(path)
    if not notes.strip():
        print("   notes are empty, skipping")
        return None
    print(f"   notes: {len(notes):,} chars")

    subject, grade = infer_subject_grade(path)
    print(f"   subject: {subject or '(unknown)'}   grade: {grade or '(unknown)'}")

    katex_scope = katex_scope_for(subject)
    user_prompt = USER_PROMPT_TEMPLATE.format(
        subject=subject or "(not specified)",
        grade=grade or "(not specified)",
        topic=topic,
        katex_scope=katex_scope,
        notes=notes,
    )

    t0 = time.time()
    try:
        output = call_gemini(client, SYSTEM_PROMPT, user_prompt)
    except Exception as exc:  # noqa: BLE001
        print(f"   FAILED: {exc}")
        return {"failed": True, "file": path.name}
    elapsed = time.time() - t0

    exercises = parse_output(output)
    if not exercises:
        print("   ERROR: no exercises parsed from model output")
        raw_dump = path.with_name(f"{topic} - Exercises.raw.txt")
        raw_dump.write_text(output, encoding="utf-8")
        print(f"   raw output written to {raw_dump.name}")
        return {"failed": True, "file": path.name}

    issues = validate_exercises(exercises)

    write_docx(out_docx, topic, exercises)

    rt_issues = roundtrip_check_docx(out_docx)
    if rt_issues:
        issues.extend(rt_issues)

    total_q = sum(len(ex.questions) for ex in exercises)
    total_opts = sum(len(q.options) for ex in exercises for q in ex.questions)
    inline_kx, display_kx = count_katex(output)
    n_images = sum(1 for ex in exercises for q in ex.questions if q.image_query)
    avg_opts = (total_opts / total_q) if total_q else 0.0

    print(f"   exercises: {len(exercises)}   questions: {total_q}")
    print(f"   options: {total_opts} (avg {avg_opts:.2f} / question)")
    print(f"   image queries: {n_images}")
    print(f"   katex: {inline_kx} inline, {display_kx} display")
    print(f"   wrote: {out_docx.name}")
    print(f"   time: {elapsed:.1f}s")

    if issues:
        print(f"   WARN: {len(issues)} issue(s):")
        for i in issues[:15]:
            print(f"     - {i}")
        if len(issues) > 15:
            print(f"     ... and {len(issues) - 15} more")
        raw_dump = path.with_name(f"{topic} - Exercises.raw.txt")
        raw_dump.write_text(output, encoding="utf-8")
        print(f"   raw output written to {raw_dump.name} for inspection")

    return {
        "failed": False,
        "file": path.name,
        "exercises": len(exercises),
        "questions": total_q,
        "images": n_images,
        "inline_kx": inline_kx,
        "display_kx": display_kx,
        "issues": len(issues),
        "seconds": elapsed,
    }


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #

def main() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    parser = argparse.ArgumentParser(
        description="Generate Grey Matter multiple-choice exercises from NOTES docx files.",
    )
    parser.add_argument(
        "--path",
        required=True,
        help="Folder containing '<topic> - NOTES.docx' files.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Process at most N files.",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip files whose Exercises.docx already exists.",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=DEFAULT_DELAY,
        help=f"Seconds between API calls (default {DEFAULT_DELAY}).",
    )
    args = parser.parse_args()

    load_env(SCRIPT_DIR / ".env")

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY not set. Add it to tools/.env")
        sys.exit(1)

    folder = Path(args.path).expanduser().resolve()
    if not folder.is_dir():
        print(f"ERROR: not a folder: {folder}")
        sys.exit(1)

    all_files = sorted(p for p in folder.iterdir() if p.is_file() and is_notes_file(p))
    if args.limit:
        all_files = all_files[: args.limit]

    if not all_files:
        print(f"No ' - NOTES.docx' files found in {folder}")
        return

    print(f"Folder: {folder}")
    print(f"Files to process: {len(all_files)}")
    print(f"Model: {MODEL_NAME}")
    print(f"Delay between calls: {args.delay}s")

    client = genai.Client(api_key=api_key)

    processed = skipped = failed = 0
    agg_ex = agg_q = agg_img = agg_ikx = agg_dkx = agg_issues = 0
    run_start = time.time()

    total_files = len(all_files)
    for idx, f in enumerate(all_files, start=1):
        result = process_file(
            client, f,
            skip_existing=args.skip_existing,
            index=idx,
            total=total_files,
        )
        if result is None:
            skipped += 1
        elif result.get("failed"):
            failed += 1
        else:
            processed += 1
            agg_ex += result["exercises"]
            agg_q += result["questions"]
            agg_img += result["images"]
            agg_ikx += result["inline_kx"]
            agg_dkx += result["display_kx"]
            agg_issues += result["issues"]

        if idx < total_files and args.delay > 0:
            time.sleep(args.delay)

    total_time = time.time() - run_start

    print("\n===== SUMMARY =====")
    print(f"Files processed:      {processed}")
    print(f"Files skipped:        {skipped}")
    print(f"Files failed:         {failed}")
    print(f"Exercises generated:  {agg_ex}")
    print(f"Questions generated:  {agg_q}")
    print(f"Image queries:        {agg_img}")
    print(f"KaTeX inline/display: {agg_ikx} / {agg_dkx}")
    print(f"Validation issues:    {agg_issues}")
    print(f"Total time:           {total_time:.1f}s")
    if agg_issues:
        print("\nReview flagged files before running redistribute.py.")


if __name__ == "__main__":
    main()


# ============================================================================
# FIRST-TIME SETUP
# ============================================================================
#
# 1. Activate the venv you already use for expand_notes.py:
#
#       cd "C:\Users\madon\Documents\GREY MATTER\tools"
#       .\.venv\Scripts\Activate.ps1
#
# 2. tools\.env already contains GEMINI_API_KEY from expand_notes.py.
#    Nothing new to install — google-genai and python-docx are both present.
#
#
# ============================================================================
# HOW TO RUN
# ============================================================================
#
# Test on a single file:
#
#       python create_exercise.py --path "C:\Users\madon\Documents\GM\PHYSICS\GRADE 12 PHYSICS" --limit 1
#
# Full folder:
#
#       python create_exercise.py --path "C:\Users\madon\Documents\GM\PHYSICS\GRADE 12 PHYSICS"
#
# Idempotent reruns (skip files already generated):
#
#       python create_exercise.py --path "..." --skip-existing
#
# Override the API pacing (free tier is 15 RPM; 4.5s is safe):
#
#       python create_exercise.py --path "..." --delay 5
#
#
# ============================================================================
# WHAT IT DOES
# ============================================================================
#
# - Scans the folder for files ending in ' - NOTES.docx' (case-insensitive).
#   Skips ' - Exercises.docx' and anything else.
# - Infers subject and grade from folder names (handles 'PHYSICS\GRADE 12',
#   'GRADE 12 PHYSICS', 'GR 12', etc.) and injects them into the prompt
#   (never into the output text).
# - Reads each notes file and sends it to Gemini with a CAPS-examiner system
#   prompt that REQUIRES every question to be grounded in the supplied notes.
# - Produces exactly 5 exercises of exactly 10 questions, every question
#   preceded by an Image query line, plain text + KaTeX only.
# - Writes '<topic> - Exercises.docx' (plural — matches redistribute.py's
#   NAME_FILTER) next to the input. No markdown companion.
# - Post-validates: re-parses the DOCX using the same block-walk
#   redistribute.py uses, so any question it couldn't handle is reported
#   immediately rather than surfacing later.
# - Prints '[n/total]' progress on every file, plus per-file stats and an
#   end-of-run summary.
#
# What it deliberately does NOT do:
#   - No 'Pattern used:' line (redistribute.py would invalidate it anyway).
#   - No answer-distribution balancing — run redistribute.py afterwards.
#   - No markdown companion file.
#   - No SQL. No DB writes. No reformatting of the notes.
#
# Pipeline:  expand_notes.py  ->  create_exercise.py  ->  redistribute.py  ->  SQL