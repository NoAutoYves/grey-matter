import { useMemo } from "react";
import katex from "katex";
import "../../styles/notes/NotesRenderer.css";

const CALLOUTS = [
  { prefix: "**Key Point:**",      cls: "notes-callout-key-point",      label: "Key Point" },
  { prefix: "**Worked Example:**", cls: "notes-callout-worked-example", label: "Worked Example" },
  { prefix: "**Common Mistake:**", cls: "notes-callout-common-mistake", label: "Common Mistake" },
  { prefix: "**Exam Tip:**",       cls: "notes-callout-exam-tip",       label: "Exam Tip" },
];

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatText(text) {
  return escapeHtml(text)
    .replace(/==([^=]+)==/g, '<mark class="notes-highlight">$1</mark>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function splitInlineMath(text) {
  const parts = [];
  let i = 0;
  while (i < text.length) {
    const start = text.indexOf("$", i);
    if (start === -1) { parts.push({ t: "text", v: text.slice(i) }); break; }
    if (text[start + 1] === "$") { parts.push({ t: "text", v: text.slice(i, start + 1) }); i = start + 1; continue; }
    const end = text.indexOf("$", start + 1);
    if (end === -1) { parts.push({ t: "text", v: text.slice(i) }); break; }
    if (start > i) parts.push({ t: "text", v: text.slice(i, start) });
    parts.push({ t: "math", v: text.slice(start + 1, end) });
    i = end + 1;
  }
  return parts;
}

function renderInline(text) {
  return splitInlineMath(text).map((p, i) => {
    if (p.t === "math") {
      try {
        const html = katex.renderToString(p.v, { throwOnError: false, displayMode: false });
        return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      } catch {
        return <span key={i}>{p.v}</span>;
      }
    }
    return <span key={i} dangerouslySetInnerHTML={{ __html: formatText(p.v) }} />;
  });
}

function renderBlock(block, i) {
  // Display math
  if (block.startsWith("$$") && block.endsWith("$$") && block.length > 4) {
    const math = block.slice(2, -2).trim();
    try {
      const html = katex.renderToString(math, { throwOnError: false, displayMode: true });
      return <div key={i} className="notes-display-math" dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      return <div key={i} className="notes-display-math">{math}</div>;
    }
  }

  // Callouts — strip leading "> " if present
  const calloutCandidate = block.replace(/^>\s?/gm, "").trim();
  for (const c of CALLOUTS) {
    if (calloutCandidate.startsWith(c.prefix)) {
      const rest = calloutCandidate.slice(c.prefix.length).trim();
      return (
        <div key={i} className={`notes-callout ${c.cls}`}>
          <span className="notes-callout-label">{c.label}:</span>{" "}
          {renderInline(rest)}
        </div>
      );
    }
  }

  // Headings
  const h = block.match(/^(#{1,4})\s+(.+)$/);
  if (h) {
    const level = h[1].length;
    const Tag = `h${level + 1}`;
    return (
      <Tag
        key={i}
        className={`notes-heading notes-heading-${level}`}
        dangerouslySetInnerHTML={{ __html: formatText(h[2]) }}
      />
    );
  }

  // Unordered list
  if (/^[-*]\s/m.test(block)) {
    const items = block.split("\n").filter((l) => /^[-*]\s/.test(l)).map((l) => l.replace(/^[-*]\s+/, ""));
    return (
      <ul key={i} className="notes-ul">
        {items.map((it, j) => (
          <li key={j} className="notes-list-item">{renderInline(it)}</li>
        ))}
      </ul>
    );
  }

  // Ordered list
  if (/^\d+\.\s/m.test(block)) {
    const items = block.split("\n").filter((l) => /^\d+\.\s/.test(l)).map((l) => l.replace(/^\d+\.\s+/, ""));
    return (
      <ol key={i} className="notes-ol">
        {items.map((it, j) => (
          <li key={j} className="notes-list-item">{renderInline(it)}</li>
        ))}
      </ol>
    );
  }

  // Paragraph
  return <p key={i} className="notes-paragraph">{renderInline(block)}</p>;
}

function NotesRenderer({ content }) {
  const blocks = useMemo(() => {
    if (!content) return [];
    return content.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  }, [content]);

  if (!content) return null;

  // If the API returns pre-rendered HTML, trust it as-is.
  if (/^\s*</.test(content)) {
    return (
      <div
        className="chapter-notes-content notes-renderer"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className="chapter-notes-content notes-renderer">
      {blocks.map(renderBlock)}
    </div>
  );
}

export default NotesRenderer;