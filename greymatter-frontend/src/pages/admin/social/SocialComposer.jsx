import { useState } from "react";
import PlatformPreview from "./PlatformPreview";
import { PLATFORMS } from "./dummySocial";
import "../../../styles/admin/social/SocialComposer.css";

const DEFAULT_PLATFORMS = ["facebook", "instagram", "twitter"];

function SocialComposer() {
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState(DEFAULT_PLATFORMS);
  const [schedule, setSchedule] = useState("");
  const [mode, setMode] = useState("now"); // "now" | "schedule"
  const [media, setMedia] = useState(null);
  const [generating, setGenerating] = useState(false);

  const toggle = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  // HOOK: replace body with fetch to /api/admin/social/generate-caption
  // which proxies Gemini. Dummy response for design pass.
  const generateCaption = () => {
    setGenerating(true);
    setTimeout(() => {
      setContent("Matric finals are around the corner. Free Grade 12 exercises aligned to CAPS — start now at greymatterschool.co.za #Matric2026 #StudySmart");
      setGenerating(false);
    }, 700);
  };

  const attachMedia = () => {
    // HOOK: real upload. Dummy for design pass.
    setMedia({ name: "electric_circuits_thumb.jpg", type: "image" });
  };

  return (
    <div className="social-composer">
      <div className="social-composer-left">
        <section className="social-card">
          <h3 className="admin-section-title">Compose</h3>

          <div className="social-platform-chips">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`social-chip ${selected.includes(p.id) ? "on" : ""}`}
                style={selected.includes(p.id) ? { borderColor: p.color, color: p.color } : undefined}
                onClick={() => toggle(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <textarea
            className="admin-textarea social-textarea"
            placeholder="What do you want to say?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />

          <div className="social-ai-row">
            <button className="admin-btn admin-btn-secondary" onClick={generateCaption} disabled={generating}>
              {generating ? "Generating…" : "✦ Generate caption"}
            </button>
            <button className="admin-btn admin-btn-secondary" disabled={generating}>
              ✦ Generate hashtags
            </button>
            <button className="admin-btn admin-btn-secondary" onClick={attachMedia}>
              + Attach media
            </button>
            {media && (
              <span className="social-media-pill">
                {media.name}
                <button type="button" onClick={() => setMedia(null)}>×</button>
              </span>
            )}
          </div>
        </section>

        <section className="social-card">
          <h3 className="admin-section-title">Publish</h3>

          <div className="social-mode-row">
            <label className={`social-mode ${mode === "now" ? "on" : ""}`}>
              <input type="radio" checked={mode === "now"} onChange={() => setMode("now")} /> Post now
            </label>
            <label className={`social-mode ${mode === "schedule" ? "on" : ""}`}>
              <input type="radio" checked={mode === "schedule"} onChange={() => setMode("schedule")} /> Schedule
            </label>
          </div>

          {mode === "schedule" && (
            <input
              type="datetime-local"
              className="admin-input"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
          )}

          <div className="social-publish-actions">
            <button className="admin-btn admin-btn-secondary">Save as draft</button>
            <button
              className="admin-btn admin-btn-primary"
              disabled={!content.trim() || selected.length === 0}
            >
              {mode === "now" ? "Publish now" : "Add to queue"}
            </button>
          </div>
        </section>
      </div>

      <div className="social-composer-right">
        <h3 className="admin-section-title">Preview</h3>
        {selected.length === 0 ? (
          <div className="admin-empty">Select at least one platform</div>
        ) : (
          <div className="social-preview-grid">
            {selected.map((id) => (
              <PlatformPreview key={id} platformId={id} content={content} media={media} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SocialComposer;