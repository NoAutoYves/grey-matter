import { PLATFORMS } from "./dummySocial";
import "../../../styles/admin/social/PlatformPreview.css";

function PlatformPreview({ platformId, content, media }) {
  const p = PLATFORMS.find((x) => x.id === platformId);
  if (!p) return null;

  const over = content.length > p.charLimit;

  return (
    <div className="social-preview" style={{ borderTopColor: p.color }}>
      <header className="social-preview-head">
        <span className="social-preview-dot" style={{ background: p.color }} />
        <span className="social-preview-name">{p.label}</span>
        <span className={`social-preview-count ${over ? "over" : ""}`}>
          {content.length}/{p.charLimit}
        </span>
      </header>

      <div className="social-preview-body">
        {media && (
          <div className="social-preview-media">
            {media.type === "video" ? "▶ " : "🖼 "}{media.name}
          </div>
        )}
        <p className="social-preview-text">
          {content || <em className="social-preview-placeholder">Nothing written yet…</em>}
        </p>
      </div>
    </div>
  );
}

export default PlatformPreview;