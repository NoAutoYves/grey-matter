import katex from "katex";

const CALLOUT_LABELS = {
  "key point": "notes-callout-key-point",
  "worked example": "notes-callout-worked-example",
  "common mistake": "notes-callout-common-mistake",
  "exam tip": "notes-callout-exam-tip",
};

const CALLOUT_LOWER = new Set(Object.keys(CALLOUT_LABELS));

// One pass. Positions:
//   1 display math | 2 inline math | 3 code | 4 highlight
//   5 bold         | 6 underline   | 7 italic
// Inline math requires non-whitespace on both edges so "R$50 and $100" is not
// mistaken for math.
const INLINE_PATTERN =
  /\$\$([\s\S]+?)\$\$|\$(?=\S)([^$\n]*?\S)\$|`([^`\n]+)`|==([^=\n]+?)==|\*\*([^*\n]+?)\*\*|__([^_\n]+?)__|\*([^*\n]+?)\*/g;

function renderMath(source, displayMode) {
  try {
    const html = katex.renderToString(source, { throwOnError: false, displayMode });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <span>{source}</span>;
  }
}

/**
 * Render inline markdown + KaTeX in a single pass, with recursion for
 * containers (bold, highlight, underline, italic) so math inside those works.
 * Returns an array of React nodes (or the raw string if nothing to parse).
 */
export function renderInline(text, keyPrefix = "i") {
  if (text == null) return null;
  const s = String(text);
  if (!s) return null;

  const re = new RegExp(INLINE_PATTERN.source, INLINE_PATTERN.flags);
  const out = [];
  let last = 0;
  let k = 0;
  let m;

  while ((m = re.exec(s)) !== null) {
    if (m.index > last) {
      out.push(<span key={`${keyPrefix}-t${k++}`}>{s.slice(last, m.index)}</span>);
    }

    if (m[1] !== undefined) {
      out.push(
        <span key={`${keyPrefix}-dm${k++}`} className="notes-inline-display-math">
          {renderMath(m[1].trim(), true)}
        </span>
      );
    } else if (m[2] !== undefined) {
      out.push(<span key={`${keyPrefix}-m${k++}`}>{renderMath(m[2], false)}</span>);
    } else if (m[3] !== undefined) {
      out.push(<code key={`${keyPrefix}-c${k++}`} className="notes-inline-code">{m[3]}</code>);
    } else if (m[4] !== undefined) {
      out.push(
        <mark key={`${keyPrefix}-h${k++}`} className="notes-highlight">
          {renderInline(m[4], `${keyPrefix}-h${k}`)}
        </mark>
      );
    } else if (m[5] !== undefined) {
      const bold = m[5];
      // Definition lead-in: **Term:** — highlight, not bold.
      if (bold.endsWith(":") && bold.length < 80) {
        const term = bold.slice(0, -1).trim();
        if (!CALLOUT_LOWER.has(term.toLowerCase())) {
          out.push(
            <mark key={`${keyPrefix}-l${k++}`} className="notes-lead-in">
              {renderInline(bold, `${keyPrefix}-l${k}`)}
            </mark>
          );
        } else {
          out.push(
            <mark key={`${keyPrefix}-e${k++}`} className="notes-emphasis">
              {renderInline(bold, `${keyPrefix}-e${k}`)}
            </mark>
          );
        }
      } else {
        out.push(
          <mark key={`${keyPrefix}-e${k++}`} className="notes-emphasis">
            {renderInline(bold, `${keyPrefix}-e${k}`)}
          </mark>
        );
      }
    } else if (m[6] !== undefined) {
      out.push(
        <span key={`${keyPrefix}-u${k++}`} className="notes-underline">
          {renderInline(m[6], `${keyPrefix}-u${k}`)}
        </span>
      );
    } else if (m[7] !== undefined) {
      out.push(
        <em key={`${keyPrefix}-i${k++}`}>
          {renderInline(m[7], `${keyPrefix}-i${k}`)}
        </em>
      );
    }

    last = re.lastIndex;
  }

  if (last < s.length) {
    out.push(<span key={`${keyPrefix}-t${k++}`}>{s.slice(last)}</span>);
  }

  return out.length ? out : s;
}

/**
 * Split notes text into blocks. Handles:
 *   - Markdown tables (| a | b |)
 *   - '''...''' blockquotes (single- or multi-line)
 *   - # ## ### #### headings
 *   - $$...$$ display math (single- and multi-line)
 *   - **Label:** callouts (Key Point, Worked Example, Common Mistake, Exam Tip)
 *   - - / * bullets and 1. 2. ordered lists
 *   - Paragraphs
 */
export function parseBlocks(text) {
  if (!text) return [];

  const lines = String(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const blocks = [];
  const n = lines.length;
  let i = 0;

  while (i < n) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) { i++; continue; }
    if (/^-{3,}$/.test(trimmed)) { i++; continue; }

    // ── Table ────────────────────────────────────────────────
    if (/^\|.*\|$/.test(trimmed)) {
      const rows = [];
      let j = i;
      while (j < n && /^\|.*\|$/.test(lines[j].trim())) {
        rows.push(lines[j].trim());
        j++;
      }
      blocks.push({ type: "table", rows });
      i = j;
      continue;
    }

    // ── Triple-single-quote blockquote ───────────────────────
    if (/^'''\s*$/.test(trimmed)) {
      const parts = [];
      let j = i + 1;
      while (j < n && !/^'''\s*$/.test(lines[j].trim())) {
        parts.push(lines[j]);
        j++;
      }
      blocks.push({ type: "quote", value: parts.join("\n").trim() });
      i = j + 1;
      continue;
    }
    if (/^'''.+'''$/.test(trimmed)) {
      blocks.push({ type: "quote", value: trimmed.slice(3, -3).trim() });
      i++;
      continue;
    }

    // ── Heading ──────────────────────────────────────────────
    const h = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (h) {
      blocks.push({ type: "heading", level: h[1].length, value: h[2].trim() });
      i++;
      continue;
    }

    // ── Multi-line display math ──────────────────────────────
    if (/^\$\$\s*$/.test(trimmed)) {
      const parts = [];
      let j = i + 1;
      while (j < n && !/^\$\$\s*$/.test(lines[j].trim())) {
        parts.push(lines[j]);
        j++;
      }
      blocks.push({ type: "displayMath", value: parts.join("\n").trim() });
      i = j + 1;
      continue;
    }

    // ── Single-line display math ─────────────────────────────
    if (/^\$\$.+\$\$$/.test(trimmed)) {
      blocks.push({ type: "displayMath", value: trimmed.slice(2, -2).trim() });
      i++;
      continue;
    }

    // ── Callout (Key Point / Worked Example / Common Mistake / Exam Tip) ──
    const c = trimmed.match(/^\*\*([^*:\n]{2,30}):\*\*\s*(.*)$/);
    if (c) {
      const label = c[1].trim();
      const cls = CALLOUT_LABELS[label.toLowerCase()];
      if (cls) {
        const parts = [c[2] || ""];
        let j = i + 1;
        while (j < n) {
          const t = lines[j].trim();
          if (!t) break;
          if (
            /^#{1,4}\s+/.test(t) ||
            /^[-*•]\s+/.test(t) ||
            /^\d+\.\s+/.test(t) ||
            /^\*\*[^*:]+:\*\*/.test(t) ||
            /^\$\$/.test(t) ||
            /^'''.*'''$/.test(t) ||
            /^'''\s*$/.test(t) ||
            /^\|.*\|$/.test(t)
          ) break;
          parts.push(t);
          j++;
        }
        blocks.push({ type: "callout", cls, label, value: parts.join(" ").trim() });
        i = j;
        continue;
      }
    }

    // ── Unordered list ───────────────────────────────────────
    if (/^[-*•]\s+/.test(trimmed)) {
      const items = [];
      let j = i;
      while (j < n) {
        const t = lines[j].trim();
        if (/^[-*•]\s+/.test(t)) {
          items.push(t.replace(/^[-*•]\s+/, ""));
          j++;
        } else if (!t) {
          let kk = j + 1;
          while (kk < n && !lines[kk].trim()) kk++;
          if (kk < n && /^[-*•]\s+/.test(lines[kk].trim())) j = kk;
          else break;
        } else break;
      }
      blocks.push({ type: "ul", items });
      i = j;
      continue;
    }

    // ── Ordered list ─────────────────────────────────────────
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      let j = i;
      while (j < n) {
        const t = lines[j].trim();
        if (/^\d+\.\s+/.test(t)) {
          items.push(t.replace(/^\d+\.\s+/, ""));
          j++;
        } else if (!t) {
          let kk = j + 1;
          while (kk < n && !lines[kk].trim()) kk++;
          if (kk < n && /^\d+\.\s+/.test(lines[kk].trim())) j = kk;
          else break;
        } else break;
      }
      blocks.push({ type: "ol", items });
      i = j;
      continue;
    }

    // ── Paragraph ────────────────────────────────────────────
    const para = [trimmed];
    let j = i + 1;
    while (j < n) {
      const t = lines[j].trim();
      if (!t) break;
      if (/^#{1,4}\s+/.test(t)) break;
      if (/^[-*•]\s+/.test(t)) break;
      if (/^\d+\.\s+/.test(t)) break;
      if (/^\*\*[^*:]+:\*\*/.test(t)) break;
      if (/^\$\$/.test(t)) break;
      if (/^'''.*'''$/.test(t)) break;
      if (/^'''\s*$/.test(t)) break;
      if (/^\|.*\|$/.test(t)) break;
      if (/^-{3,}$/.test(t)) break;
      para.push(t);
      j++;
    }
    blocks.push({ type: "paragraph", value: para.join(" ") });
    i = j;
  }

  return blocks;
}

function parseTableRows(rows) {
  if (!rows || rows.length === 0) return null;
  const cells = rows.map((r) => r.split("|").slice(1, -1).map((c) => c.trim()));
  const isSep = (row) => row.every((c) => c === "" || /^:?-{2,}:?$/.test(c));

  let header = null;
  let body = cells;
  if (cells.length >= 2 && isSep(cells[1])) {
    header = cells[0];
    body = cells.slice(2);
  } else if (cells.length > 0) {
    header = cells[0];
    body = cells.slice(1);
  }
  return { header, body };
}

export function renderBlock(block, index) {
  const key = `b${index}`;

  switch (block.type) {
    case "heading": {
      const Level = `h${Math.min(block.level + 1, 5)}`;
      return (
        <Level key={key} className={`notes-heading notes-heading-${block.level}`}>
          {renderInline(block.value, key)}
        </Level>
      );
    }

    case "paragraph":
      return <p key={key} className="notes-paragraph">{renderInline(block.value, key)}</p>;

    case "ul":
      return (
        <ul key={key} className="notes-ul">
          {block.items.map((it, i) => (
            <li key={i} className="notes-list-item">{renderInline(it, `${key}-${i}`)}</li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol key={key} className="notes-ol">
          {block.items.map((it, i) => (
            <li key={i} className="notes-list-item">{renderInline(it, `${key}-${i}`)}</li>
          ))}
        </ol>
      );

    case "callout":
      return (
        <div key={key} className={`notes-callout ${block.cls}`}>
          <span className="notes-callout-label">{block.label}:</span>{" "}
          {renderInline(block.value, key)}
        </div>
      );

    case "displayMath":
      return (
        <div key={key} className="notes-display-math">
          {renderMath(block.value, true)}
        </div>
      );

    case "quote":
      return (
        <blockquote key={key} className="notes-quote">
          {renderInline(block.value, key)}
        </blockquote>
      );

    case "table": {
      const parsed = parseTableRows(block.rows);
      if (!parsed) return <pre key={key}>{block.rows.join("\n")}</pre>;
      return (
        <div key={key} className="notes-table-wrap">
          <table className="notes-table">
            {parsed.header && (
              <thead>
                <tr>
                  {parsed.header.map((h, ci) => (
                    <th key={ci}>{renderInline(h, `${key}-h${ci}`)}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {parsed.body.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{renderInline(cell, `${key}-${ri}-${ci}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    default:
      return null;
  }
}