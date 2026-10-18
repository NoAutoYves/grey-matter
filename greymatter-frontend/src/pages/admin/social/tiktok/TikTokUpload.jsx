import { useState } from "react";
import TikTokPreview from "./TikTokPreview";
import { PRIVACY_LEVELS, VIDEO_LIMITS, CHUNK_LIMITS } from "./dummyTikTok";

const MAX_CAPTION = 2200;

function Check({ ok, label }) {
  return (
    <li className={`tt-check-item ${ok ? "ok" : ""}`}>
      <span className="tt-check-icon">{ok ? "✓" : "○"}</span>
      <span>{label}</span>
    </li>
  );
}

function TikTokUpload() {
  const [file, setFile] = useState(null);
  const [coverFrame, setCoverFrame] = useState(null);
  const [stage, setStage] = useState("idle"); // idle | uploading | processing | ready | failed
  const [chunksDone, setChunksDone] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [privacy, setPrivacy] = useState("SELF_ONLY");
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(false);
  const [allowStitch, setAllowStitch] = useState(false);
  const [schedule, setSchedule] = useState("");

  // HOOK: real chunked upload to /api/admin/social/tiktok/upload.
  // Flow: init (fetch upload_url + chunk info) -> PUT each chunk -> publish.
  const pickFile = () => {
    const sizeMB = 248;
    const totalBytes = sizeMB * 1024 * 1024;
    const chunks = Math.ceil(totalBytes / CHUNK_LIMITS.max);
    setFile({
      name: "redox_60s_vertical.mp4",
      size: `${sizeMB} MB`,
      duration: "00:58",
      resolution: "1080x1920",
    });
    setTotalChunks(chunks);
    setChunksDone(0);
    setStage("uploading");

    // Simulate chunk-by-chunk upload.
    let done = 0;
    const timer = setInterval(() => {
      done++;
      setChunksDone(done);
      if (done >= chunks) {
        clearInterval(timer);
        setStage("processing");
        setTimeout(() => setStage("ready"), 1800);
      }
    }, 400);
  };

  // HOOK: real call to TikTok API to fetch cover frame.
  const pickCover = () => {
    setCoverFrame({ color: "#6846ff", frame: "Frame 12" });
  };

  const addTag = (e) => {
    e.preventDefault();
    const t = tagInput.trim().replace(/^#/, "");
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput("");
  };

  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  const captionLength = caption.length + tags.map((t) => `#${t}`).length;
  const canPublish = file && stage === "ready" && caption.trim() && privacy;

  const chunkProgress = totalChunks > 0 ? Math.round((chunksDone / totalChunks) * 100) : 0;

  return (
    <div className="tt-upload">
      <div className="tt-upload-left">
        {/* Video file — chunked upload */}
        <section className="social-card">
          <h3 className="admin-section-title">Video file</h3>
          <p className="tt-hint">
            9:16 vertical · {VIDEO_LIMITS.formats.join(" / ")} · max 4 GB · 3s–10min
          </p>

          {!file ? (
            <button type="button" className="tt-drop" onClick={pickFile}>
              <span className="tt-drop-icon">▶</span>
              <span className="tt-drop-label">Drop a video or click to browse</span>
              <span className="tt-drop-hint">Must be 9:16 vertical — other ratios get cropped</span>
            </button>
          ) : (
            <div className="tt-file">
              <div className="tt-file-head">
                <span className="tt-file-name">{file.name}</span>
                <span className={`admin-badge ${
                  stage === "ready" ? "admin-badge-success"
                  : stage === "failed" ? "admin-badge-danger"
                  : "admin-badge-warn"
                }`}>{stage}</span>
              </div>
              <div className="tt-file-meta">
                {file.size} · {file.duration} · {file.resolution}
              </div>

              {stage === "uploading" && (
                <>
                  <div className="tt-progress">
                    <div className="tt-progress-fill" style={{ width: `${chunkProgress}%` }} />
                  </div>
                  <div className="tt-chunk-info">
                    Chunk {chunksDone}/{totalChunks} · 5–64 MB per chunk
                  </div>
                </>
              )}

              {stage === "processing" && (
                <div className="tt-progress">
                  <div className="tt-progress-fill tt-progress-indet" />
                </div>
              )}

              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => { setFile(null); setStage("idle"); setChunksDone(0); }}
              >
                Remove
              </button>
            </div>
          )}
        </section>

        {/* Cover frame — no thumbnail upload, pick from video frames */}
        <section className="social-card">
          <h3 className="admin-section-title">Cover frame</h3>
          <p className="tt-hint">TikTok does not accept thumbnail uploads — cover is picked from video frames</p>

          {!coverFrame ? (
            <button type="button" className="tt-thumb-drop" onClick={pickCover}>
              <span>Pick a cover frame</span>
              <span className="tt-drop-hint">Choose a frame with a clear face or readable text</span>
            </button>
          ) : (
            <div className="tt-thumb-set">
              <div className="tt-thumb-img" style={{ background: coverFrame.color }} />
              <div className="tt-thumb-info">
                <span className="tt-file-name">{coverFrame.frame}</span>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  onClick={() => setCoverFrame(null)}
                >
                  Replace
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Caption + hashtags */}
        <section className="social-card">
          <h3 className="admin-section-title">Caption & hashtags</h3>

          <div className="admin-field">
            <label>
              Caption <span className="tt-count">{captionLength}/{MAX_CAPTION}</span>
            </label>
            <textarea
              className="admin-textarea"
              rows={5}
              maxLength={MAX_CAPTION}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Redox reactions explained in 60 seconds #chemistry #Grade12"
            />
            <p className="tt-hint">Caption and hashtags share one field, 2,200 character cap total</p>
          </div>

          <div className="admin-field">
            <label>Hashtags</label>
            {tags.length > 0 && (
              <div className="tt-tags">
                {tags.map((t) => (
                  <span key={t} className="tt-tag">
                    #{t}
                    <button type="button" onClick={() => removeTag(t)}>×</button>
                  </span>
                ))}
              </div>
            )}
            <form onSubmit={addTag} className="tt-tag-input">
              <input
                className="admin-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Type a tag and press Enter"
              />
              <button type="submit" className="admin-btn admin-btn-secondary admin-btn-sm">Add</button>
            </form>
          </div>
        </section>

        {/* Privacy and interactions */}
        <section className="social-card">
          <h3 className="admin-section-title">Privacy & interactions</h3>
          <p className="tt-hint">
            Privacy options depend on creator account permissions — non-public accounts may not see "Everyone"
          </p>

          <div className="tt-privacy">
            {PRIVACY_LEVELS.map((p) => (
              <label key={p.value} className={`tt-privacy-opt ${privacy === p.value ? "on" : ""}`}>
                <input
                  type="radio"
                  checked={privacy === p.value}
                  onChange={() => setPrivacy(p.value)}
                />
                <span className="tt-privacy-label">{p.label}</span>
                <span className="tt-privacy-desc">{p.desc}</span>
              </label>
            ))}
          </div>

          <div className="tt-interactions">
            <label className="tt-check">
              <input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} />
              <span>Allow comments</span>
            </label>
            <label className="tt-check">
              <input type="checkbox" checked={allowDuet} onChange={(e) => setAllowDuet(e.target.checked)} />
              <span>Allow duet</span>
            </label>
            <label className="tt-check">
              <input type="checkbox" checked={allowStitch} onChange={(e) => setAllowStitch(e.target.checked)} />
              <span>Allow stitch</span>
            </label>
          </div>

          <div className="admin-field" style={{ marginTop: "0.85rem" }}>
            <label>Schedule (leave blank to publish now)</label>
            <input
              type="datetime-local"
              className="admin-input"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
          </div>

          <div className="tt-publish-actions">
            <button className="admin-btn admin-btn-secondary">Save draft</button>
            <button className="admin-btn admin-btn-primary" disabled={!canPublish}>
              {schedule ? "Schedule" : "Publish now"}
            </button>
          </div>
        </section>
      </div>

      <div className="tt-upload-right">
        <h3 className="admin-section-title">Preview</h3>
        <TikTokPreview
          title={caption}
          coverColor={coverFrame?.color}
          duration={file?.duration}
          privacy={privacy}
          tags={tags}
        />

        <div className="social-card tt-checklist">
          <h3 className="admin-section-title">Ready to publish?</h3>
          <ul className="tt-checklist-list">
            <Check ok={!!file} label="Video selected" />
            <Check ok={file?.resolution === "1080x1920"} label="9:16 vertical" />
            <Check ok={stage === "ready"} label="Chunked upload complete" />
            <Check ok={!!coverFrame} label="Cover frame picked" />
            <Check ok={caption.trim().length > 0} label="Caption added" />
            <Check ok={privacy !== "SELF_ONLY" || !!schedule} label="Privacy set" />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TikTokUpload;