import { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import katex from "katex";
import "katex/dist/katex.min.css";
import { api } from "../../utils/api";
import notesIcon from "../../assets/images/func-images/notes-icon.png";
import "../../styles/NotesSection.css";

// Callout labels emitted by expand_notes.py
const CALL_HEAD_RE = /^\*\*(Key Point|Worked Example|Common Mistake|Exam Tip):\*\*/i;

// ---------------------------------------------------------------------------
// Inline renderer — highlights, bold, italic, KaTeX (inline + display)
// ---------------------------------------------------------------------------
function renderInline(text, keyPrefix = "i") {
  if (!text) return null;

  const out = [];
  // Order matters: $$display$$ before $inline$, then ==highlight==,
  // then **bold**, then *italic*. Bold is tried before italic so that
  // **...** does not get consumed by the single-asterisk rule.
  const regex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+)\$|==([^=]+)==|\*\*([^*]+)\*\*|\*([^*\n]+)\*/g;
  let lastIndex = 0;
  let m;
  let k = 0;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      out.push(
        <span key={`${keyPrefix}-t${k++}`}>{text.slice(lastIndex, m.index)}</span>
      );
    }

    if (m[1] !== undefined) {
      // Display math embedded inline
      try {
        const html = katex.renderToString(m[1].trim(), {
          throwOnError: false,
          displayMode: true,
        });
        out.push(
          <span
            key={`${keyPrefix}-dm${k++}`}
            className="notes-inline-display-math"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        out.push(<span key={`${keyPrefix}-dm${k++}`}>{m[1]}</span>);
      }
    } else if (m[2] !== undefined) {
      try {
        const html = katex.renderToString(m[2], {
          throwOnError: false,
          displayMode: false,
        });
        out.push(
          <span
            key={`${keyPrefix}-m${k++}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        out.push(<span key={`${keyPrefix}-m${k++}`}>{m[2]}</span>);
      }
    } else if (m[3] !== undefined) {
      out.push(
        <mark key={`${keyPrefix}-h${k++}`} className="notes-highlight">
          {m[3]}
        </mark>
      );
    } else if (m[4] !== undefined) {
      out.push(
        <strong key={`${keyPrefix}-b${k++}`}>{m[4]}</strong>
      );
    } else if (m[5] !== undefined) {
      out.push(
        <em key={`${keyPrefix}-i${k++}`}>{m[5]}</em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    out.push(<span key={`${keyPrefix}-t${k++}`}>{text.slice(lastIndex)}</span>);
  }

  return out.length ? out : text;
}

// ---------------------------------------------------------------------------
// Block parser — converts raw notes text into a structured block list
// ---------------------------------------------------------------------------
function parseBlocks(text) {
  if (!text) return [];
  // Strip leading blockquote markers ("&gt; " from DOCX-derived sources)
  // so callouts and paragraphs render the same regardless of source.
  const lines = text.split("\n").map((l) => l.replace(/^>\s?/, ""));
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Blank line
    if (!trimmed) {
      i++;
      continue;
    }

    // Horizontal rule separator (---, ----, etc.) — skip silently.
    if (/^-{3,}$/.test(trimmed)) {
      i++;
      continue;
    }

    // Markdown heading: #, ##, ###, ####
    const hMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      blocks.push({
        type: "heading",
        level: hMatch[1].length,
        value: hMatch[2].trim(),
      });
      i++;
      continue;
    }

    // Legacy prefixes from older notes imports
    if (/^(Chapter|Section)\b/i.test(trimmed)) {
      blocks.push({ type: "heading", level: 3, value: trimmed });
      i++;
      continue;
    }

    // Display math on its own line
    if (/^\$\$.+\$\$$/.test(trimmed)) {
      blocks.push({ type: "display-math", value: trimmed.slice(2, -2).trim() });
      i++;
      continue;
    }

    // Callout: **Key Point:** ... (may span multiple lines)
    const cMatch = trimmed.match(CALL_HEAD_RE);
    if (cMatch) {
      const variant = cMatch[1].toLowerCase().replace(/\s+/g, "-");
      const headMatch = trimmed.match(/^\*\*([^*]+):\*\*\s*(.*)$/);
      const label = headMatch ? headMatch[1].trim() : cMatch[1];
      const firstPart = headMatch ? headMatch[2] : "";
      const parts = [firstPart];

      let j = i + 1;
      while (j < lines.length) {
        const next = lines[j].trim();
        if (!next) break;
        if (
          /^(#{1,4}\s+)/.test(next) ||
          /^[-*•]\s+/.test(next) ||
          /^\d+\.\s+/.test(next) ||
          CALL_HEAD_RE.test(next) ||
          /^\$\$.+\$\$$/.test(next)
        ) {
          break;
        }
        parts.push(next);
        j++;
      }

      blocks.push({
        type: "callout",
        variant,
        label,
        value: parts.join(" ").trim(),
      });
      i = j;
      continue;
    }

    // Bullet list
    if (/^[-*•]\s+/.test(trimmed)) {
      const items = [];
      let j = i;
      while (j < lines.length) {
        const l = lines[j].trim();
        if (/^[-*•]\s+/.test(l)) {
          items.push(l.replace(/^[-*•]\s+/, ""));
          j++;
        } else if (!l) {
          let k = j + 1;
          while (k < lines.length && !lines[k].trim()) k++;
          if (k < lines.length && /^[-*•]\s+/.test(lines[k].trim())) {
            j = k;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      blocks.push({ type: "bullet-list", items });
      i = j;
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      let j = i;
      while (j < lines.length) {
        const l = lines[j].trim();
        if (/^\d+\.\s+/.test(l)) {
          items.push(l.replace(/^\d+\.\s+/, ""));
          j++;
        } else if (!l) {
          let k = j + 1;
          while (k < lines.length && !lines[k].trim()) k++;
          if (k < lines.length && /^\d+\.\s+/.test(lines[k].trim())) {
            j = k;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      blocks.push({ type: "ordered-list", items });
      i = j;
      continue;
    }

    // Plain paragraph — collect consecutive plain lines
    const paraLines = [trimmed];
    let j = i + 1;
    while (j < lines.length) {
      const l = lines[j].trim();
      if (!l) break;
      if (
        /^(#{1,4}\s+)/.test(l) ||
        /^[-*•]\s+/.test(l) ||
        /^\d+\.\s+/.test(l) ||
        CALL_HEAD_RE.test(l) ||
        /^\$\$.+\$\$$/.test(l) ||
        /^-{3,}$/.test(l)
      ) {
        break;
      }
      paraLines.push(l);
      j++;
    }
    blocks.push({ type: "paragraph", value: paraLines.join(" ") });
    i = j;
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Block renderer
// ---------------------------------------------------------------------------
function renderBlock(block, index) {
  const key = `b${index}`;

  switch (block.type) {
    case "heading": {
      // Map # levels to h2..h5 (h1 is reserved for page title)
      const Level = `h${Math.min(block.level + 1, 5)}`;
      return (
        <Level key={key} className={`notes-heading notes-heading-${block.level}`}>
          {renderInline(block.value, key)}
        </Level>
      );
    }

    case "paragraph":
      return (
        <p key={key} className="notes-paragraph">
          {renderInline(block.value, key)}
        </p>
      );

    case "bullet-list":
      return (
        <ul key={key} className="notes-ul">
          {block.items.map((item, i) => (
            <li key={i} className="notes-list-item">
              {renderInline(item, `${key}-${i}`)}
            </li>
          ))}
        </ul>
      );

    case "ordered-list":
      return (
        <ol key={key} className="notes-ol">
          {block.items.map((item, i) => (
            <li key={i} className="notes-list-item">
              {renderInline(item, `${key}-${i}`)}
            </li>
          ))}
        </ol>
      );

    case "callout":
      return (
        <div key={key} className={`notes-callout notes-callout-${block.variant}`}>
          <span className="notes-callout-label">{block.label}:</span>{" "}
          <span className="notes-callout-body">
            {renderInline(block.value, key)}
          </span>
        </div>
      );

    case "display-math":
      try {
        const html = katex.renderToString(block.value, {
          throwOnError: false,
          displayMode: true,
        });
        return (
          <div
            key={key}
            className="notes-display-math"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return (
          <div key={key} className="notes-display-math">
            {block.value}
          </div>
        );
      }

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// NotesSection
// ---------------------------------------------------------------------------
const NotesSection = ({ exerciseId, subject }) => {
  const [chapterNotes, setChapterNotes] = useState(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [showFullNotes, setShowFullNotes] = useState(false);

  useEffect(() => {
    if (!exerciseId || !subject) return;

    let cancelled = false;
    const fetchNotes = async () => {
      setNotesLoading(true);
      try {
        const response = await api.get(`/api/exercise/notes/${exerciseId}`);
        const data = await response.json();
        if (!cancelled && response.ok && data.notes) {
          setChapterNotes(data.notes);
        }
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      } finally {
        if (!cancelled) setNotesLoading(false);
      }
    };

    fetchNotes();
    return () => {
      cancelled = true;
    };
  }, [exerciseId, subject]);

  const blocks = chapterNotes ? parseBlocks(chapterNotes) : [];
  const shouldCollapse = chapterNotes && chapterNotes.length > 300;

  const getPreviewBlocks = (allBlocks) => {
    let chars = 0;
    const preview = [];
    for (const b of allBlocks) {
      const len = (b.value || (b.items ? b.items.join(" ") : "")).length;
      if (preview.length > 0 && chars + len > 200) break;
      preview.push(b);
      chars += len;
    }
    return preview;
  };

  return (
    <aside className="notes-sidebar">
      <div className="notes-box">
        <div className="notes-header">
          <img src={notesIcon} alt="Notes" className="notes-icon" />
          <h4>Chapter Notes</h4>
        </div>

        {notesLoading ? (
          <Skeleton count={5} height={20} style={{ marginBottom: "10px" }} />
        ) : chapterNotes ? (
          <div className="chapter-notes-content">
            {shouldCollapse ? (
              <>
                {showFullNotes ? (
                  <div className="notes-full">
                    {blocks.map(renderBlock)}
                  </div>
                ) : (
                  <div className="notes-preview">
                    {getPreviewBlocks(blocks).map(renderBlock)}
                    <span className="notes-ellipsis">…</span>
                  </div>
                )}
                <button
                  className="notes-toggle-btn"
                  onClick={() => setShowFullNotes((v) => !v)}
                >
                  {showFullNotes ? "Show Less ↑" : "Read More ↓"}
                </button>
              </>
            ) : (
              <>{blocks.map(renderBlock)}</>
            )}
          </div>
        ) : (
          <p className="no-notes-message">
            No chapter notes available for this exercise.
            <br />
            <small>Check back later as we add more content.</small>
          </p>
        )}
      </div>
    </aside>
  );
};

export default NotesSection;