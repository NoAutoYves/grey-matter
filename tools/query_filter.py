"""
query_filter.py

Classify image queries as KEEP or SKIP using a FREE text model.

Default provider: Groq (free, no card, 30 RPM / 1,000 RPD per model).
Alternatives: openrouter (free tier) or ollama (fully local).

Used by extract_queries.py before the CSV is written.

Requires:
    pip install openai python-dotenv
"""

import json
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

TOOLS_ENV = Path(r"C:\Users\madon\Documents\GREY MATTER\tools\.env")
if TOOLS_ENV.exists():
    load_dotenv(TOOLS_ENV)
load_dotenv()

PROVIDERS = {
    "groq": {
        "base_url": "https://api.groq.com/openai/v1",
        "api_key_env": "GROQ_API_KEY",
        "model": "openai/gpt-oss-120b",
        "note": "Free, no card. 30 RPM / 1,000 RPD per model.",
    },
    "openrouter": {
        "base_url": "https://openrouter.ai/api/v1",
        "api_key_env": "OPENROUTER_API_KEY",
        "model": "meta-llama/llama-3.3-70b-instruct:free",
        "note": "Free tier: 20 RPM / 50 RPD.",
    },
    "ollama": {
        "base_url": "http://localhost:11434/v1",
        "api_key_env": None,
        "model": "llama3.1:8b",
        "note": "Fully local, no account, no rate limit.",
    },
}

# Groq retires models regularly. If one 404s, the next is tried automatically.
GROQ_MODEL_CHAIN = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.6-27b",
    "llama-3.1-8b-instant",
]

BATCH_SIZE = 20
MAX_RETRIES = 4

SYSTEM_PROMPT = """You are reviewing image-generation queries for a math/science education website.

Each query below will be sent to an AI image generator. We only want to keep queries that add real pedagogical value, because generation costs money.

For each numbered query, decide KEEP or SKIP.

KEEP if the image would:
- Show a diagram, graph, geometric figure, circuit, chemical structure, illustration, or labeled visual the student needs to see
- Visualize a word-problem scenario (shapes, physical setups, real-world contexts)
- Provide a visual aid that meaningfully helps understanding

SKIP if the image would:
- Just restate a formula, equation, or definition already in the question text
- Duplicate information the student can read directly
- Show an abstract concept with no clear visual representation
- Be decoration with no teaching value

Respond ONLY with a JSON object of the form:
{"results": [{"id": 1, "decision": "KEEP", "reason": "short reason"}, ...]}

No other text. One result per query, in order."""


def check_provider(provider_name: str) -> None:
    """Fail fast if the provider's API key isn't set."""
    cfg = PROVIDERS[provider_name]
    if cfg["api_key_env"] and not os.environ.get(cfg["api_key_env"]):
        print(f"{cfg['api_key_env']} not set in .env "
              f"(needed for provider '{provider_name}')", file=sys.stderr)
        sys.exit(1)


def _build_client(provider_name: str) -> OpenAI:
    cfg = PROVIDERS[provider_name]
    api_key = "ollama" if cfg["api_key_env"] is None else os.environ[cfg["api_key_env"]]
    return OpenAI(base_url=cfg["base_url"], api_key=api_key)


def _is_model_missing(err: str) -> bool:
    """True for 404 / 'model does not exist' / 'no access' style errors."""
    e = err.lower()
    return ("404" in e
            or "does not exist" in e
            or "model_not_found" in e
            or "no access" in e)


def _classify_batch(client: OpenAI, model: str, batch: list) -> dict:
    lines = []
    for item in batch:
        lines.append(
            f'{item["id"]}. [Exercise: {item["exercise_name"]}] '
            f'[{item["exercise_question"]}] Query: {item["image_query"]}'
        )
    user_text = "\n".join(lines)

    last_error = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            resp = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_text},
                ],
                temperature=0.0,
                response_format={"type": "json_object"},
            )
            data = json.loads(resp.choices[0].message.content.strip())
            results = data.get("results", data)
            if isinstance(results, dict):
                results = list(results.values())
            return {
                int(item["id"]): (
                    item["decision"].strip().upper(),
                    item.get("reason", "").strip(),
                )
                for item in results
            }
        except Exception as e:
            last_error = e
            # Don't bother retrying a model that doesn't exist
            if _is_model_missing(str(e)):
                raise
            if attempt < MAX_RETRIES:
                time.sleep(3 * (2 ** attempt))
    raise last_error


def classify_queries(entries, provider="groq", model=None, verbose=True):
    """
    entries: list of dicts, each with exercise_name, exercise_question, image_query.
    Returns the same list with filter_decision and filter_reason added.

    For groq, tries a chain of model IDs — a retired model (404) falls through
    to the next one instead of crashing the run.

    If every model in the chain fails, rows default to KEEP (fail-safe).
    """
    cfg = PROVIDERS[provider]
    client = _build_client(provider)

    # Build the model chain to try
    if model:
        chain = [model]
    elif provider == "groq":
        chain = list(GROQ_MODEL_CHAIN)
    else:
        chain = [cfg["model"]]

    # Resolve the working model once, so we don't 404 on every batch
    working_model = None
    decisions = {}
    total = len(entries)

    for start in range(0, total, BATCH_SIZE):
        batch = [
            {
                "id": start + i + 1,
                "exercise_name": e["exercise_name"],
                "exercise_question": e["exercise_question"],
                "image_query": e["image_query"],
            }
            for i, e in enumerate(entries[start:start + BATCH_SIZE])
        ]
        if verbose:
            print(f"    filtering {start+1}-{start+len(batch)}/{total} ...",
                  end="", flush=True)

        batch_done = False
        candidates = [working_model] if working_model else chain
        for model_id in candidates:
            try:
                decisions.update(_classify_batch(client, model_id, batch))
                working_model = model_id
                if verbose:
                    print(f" ok ({model_id})")
                batch_done = True
                break
            except Exception as e:
                err = str(e)
                if _is_model_missing(err):
                    if verbose:
                        print(f" {model_id} unavailable, trying next ...",
                              end="", flush=True)
                    # If it was the cached working model, drop it
                    if model_id == working_model:
                        working_model = None
                    continue
                if verbose:
                    print(f" error on {model_id}: {err}", end="", flush=True)
                continue

        if not batch_done:
            if verbose:
                print(" ALL MODELS FAILED — defaulting these rows to KEEP")
            for b in batch:
                decisions[b["id"]] = ("KEEP", "classifier unavailable")

        if provider == "groq":
            time.sleep(2.0)   # stay under 30 RPM

    out = []
    for i, e in enumerate(entries, 1):
        decision, reason = decisions.get(i, ("KEEP", "no decision returned"))
        out.append({
            **e,
            "filter_decision": decision,
            "filter_reason": reason,
        })
    return out