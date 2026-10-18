import { useMemo } from "react";
import "katex/dist/katex.min.css";
import { parseBlocks, renderBlock } from "./notesParser";
import "../../styles/notes/NotesRenderer.css";

function NotesRenderer({ content, previewLimit = null }) {
  const blocks = useMemo(() => parseBlocks(content || ""), [content]);

  if (!content) return null;

  // API may return pre-rendered HTML — trust it.
  if (/^\s*</.test(content)) {
    return (
      <div
        className="notes-renderer"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  let displayBlocks = blocks;
  let showEllipsis = false;

  if (previewLimit != null && previewLimit > 0) {
    displayBlocks = [];
    let chars = 0;
    for (const b of blocks) {
      const len = (b.value || (b.items ? b.items.join(" ") : "")).length;
      if (displayBlocks.length > 0 && chars + len > previewLimit) {
        showEllipsis = true;
        break;
      }
      displayBlocks.push(b);
      chars += len;
    }
  }

  return (
    <div className="notes-renderer">
      {displayBlocks.map(renderBlock)}
      {showEllipsis && <span className="notes-ellipsis">…</span>}
    </div>
  );
}

export default NotesRenderer;