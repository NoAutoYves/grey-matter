import { useState } from "react";
import YouTubePreview from "./YouTubePreview";
import { CATEGORIES, VISIBILITY, PLAYLISTS } from "./dummyYoutube";

const MAX_TITLE = 100;
const MAX_DESC = 5000;
const MAX_TAGS = 500;

function Check({ ok, label }) {
  return (
    <li className={`yt-check-item ${ok ? "ok" : ""}`}>
      <span className="yt-check-icon">{ok ? "✓" : "○"}</span>
      <span>{label}</span>
    </li>
  );
}

function YouTubeUpload() {
  const [file, setFile] = useState(null);
  const [thumb, setThumb] = useState(null);
  const [stage, setStage] = useState("idle"); // idle | uploading | processing | ready | failed
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [category, setCategory] = useState("Education");
  const [visibility, setVisibility] = useState("private");
  const [playlist, setPlaylist] = useState("");
  const [schedule, setSchedule] = useState("");
  const [premiere, setPremiere] = useState(false);

  // HOOK: real chunked upload to /api/admin/social/youtube/upload.
  // Stages: uploading (progress %) -> processing (YouTube transcodes) -> ready.
  const pickFile = () => {
    setFile({ name: "redox_explainer_final.mp4", size: "248 MB", duration: "08:12" });
    setStage("uploading");
    setTimeout(() => setStage("processing"), 1200);
    setTimeout(() => setStage("ready"), 2600);
  };

  // HOOK: real thumbnail upload
  const pickThumb = () => setThumb({ name: "redox_thumb.jpg", color: "#6846ff" });

  const addTag = (e) => {
    e.preventDefault();
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput("");
  };

  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  const tagsLength = tags.join(", ").length;
  const canPublish = file && stage === "ready" && title.trim() && visibility;

  return (
    <div className="yt-upload">
      <div className="yt-upload-left">
        <section className="social-card">
          <h3 className="admin-section-title">Video file</h3>
          {!file ? (
            <button type="button" className="yt-drop" onClick={pickFile}>
              <span className="yt-drop-icon">▶</span>
              <span className="yt-drop-label">Drop a video or click to browse</span>
              <span className="yt-drop-hint">MP4, MOV, MKV · up to 2 GB · long-form</span>
            </button>
          ) : (
            <div className="yt-file">
              <div className="yt-file-head">
                <span className="yt-file-name">{file.name}</span>
                <span className={`admin-badge ${stage === "ready" ? "admin-badge-success" : stage === "failed" ? "admin-badge-danger" : "admin-badge-warn"}`}>
                  {stage}
                </span>
              </div>
              <div className="yt-file-meta">{file.size} · {file.duration}</div>
              {stage === "uploading" && (
                <div className="yt-progress"><div className="yt-progress-fill" style={{ width: "62%" }} /></div>
              )}
              {stage === "processing" && (
                <div className="yt-progress"><div className="yt-progress-fill yt-progress-indet" /></div>
              )}
              <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => { setFile(null); setStage("idle"); }}>
                Remove
              </button>
            </div>
          )}
        </section>

        <section className="social-card">
          <h3 className="admin-section-title">Thumbnail</h3>
          {!thumb ? (
            <button type="button" className="yt-thumb-drop" onClick={pickThumb}>
              <span>Upload 1280×720 JPG or PNG</span>
              <span className="yt-drop-hint">Max 2 MB</span>
            </button>
          ) : (
            <div className="yt-thumb-set">
              <div className="yt-thumb-img" style={{ background: thumb.color }} />
              <div className="yt-thumb-info">
                <span className="yt-file-name">{thumb.name}</span>
                <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setThumb(null)}>Replace</button>
              </div>
            </div>
          )}
        </section>

        <section className="social-card">
          <h3 className="admin-section-title">Details</h3>

          <div className="admin-field">
            <label>Title <span className="yt-count">{title.length}/{MAX_TITLE}</span></label>
            <input className="admin-input" maxLength={MAX_TITLE} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Redox Reactions Explained in 8 Minutes" />
          </div>

          <div className="admin-field">
            <label>Description <span className="yt-count">{description.length}/{MAX_DESC}</span></label>
            <textarea className="admin-textarea" rows={6} maxLength={MAX_DESC} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What the video covers, timestamps, links to exercises..." />
          </div>

          <div className="admin-field">
            <label>Tags <span className="yt-count">{tagsLength}/{MAX_TAGS}</span></label>
            {tags.length > 0 && (
              <div className="yt-tags">
                {tags.map((t) => (
                  <span key={t} className="yt-tag">
                    {t}
                    <button type="button" onClick={() => removeTag(t)}>×</button>
                  </span>
                ))}
              </div>
            )}
            <form onSubmit={addTag} className="yt-tag-input">
              <input className="admin-input" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add a tag and press Enter" />
              <button type="submit" className="admin-btn admin-btn-secondary admin-btn-sm">Add</button>
            </form>
          </div>

          <div className="admin-field-row">
            <div className="admin-field">
              <label>Category</label>
              <select className="admin-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>Playlist</label>
              <select className="admin-select" value={playlist} onChange={(e) => setPlaylist(e.target.value)}>
                <option value="">None</option>
                {PLAYLISTS.map((p) => <option key={p.id} value={p.name}>{p.name} ({p.count})</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="social-card">
          <h3 className="admin-section-title">Visibility</h3>
          <div className="yt-vis">
            {VISIBILITY.map((v) => (
              <label key={v.value} className={`yt-vis-opt ${visibility === v.value ? "on" : ""}`}>
                <input type="radio" checked={visibility === v.value} onChange={() => setVisibility(v.value)} />
                <span className="yt-vis-label">{v.label}</span>
                <span className="yt-vis-desc">{v.desc}</span>
              </label>
            ))}
          </div>

          <label className="yt-check">
            <input type="checkbox" checked={premiere} onChange={(e) => setPremiere(e.target.checked)} />
            <span>Set as Premiere (live countdown, live chat)</span>
          </label>

          <div className="admin-field" style={{ marginTop: "0.85rem" }}>
            <label>Schedule (leave blank to publish on save)</label>
            <input type="datetime-local" className="admin-input" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
          </div>

          <div className="yt-publish-actions">
            <button className="admin-btn admin-btn-secondary">Save draft</button>
            <button className="admin-btn admin-btn-primary" disabled={!canPublish}>
              {schedule ? "Schedule" : "Publish"}
            </button>
          </div>
        </section>
      </div>

      <div className="yt-upload-right">
        <h3 className="admin-section-title">Preview</h3>
        <YouTubePreview
          title={title}
          thumbnailColor={thumb?.color}
          visibility={visibility}
          duration={file?.duration}
        />

        <div className="social-card yt-checklist">
          <h3 className="admin-section-title">Ready to publish?</h3>
          <ul className="yt-checklist-list">
            <Check ok={!!file} label="Video uploaded" />
            <Check ok={stage === "ready"} label="Processing complete" />
            <Check ok={!!thumb} label="Thumbnail set" />
            <Check ok={title.trim().length > 0} label="Title added" />
            <Check ok={description.trim().length > 0} label="Description added" />
            <Check ok={visibility !== "private" || !!schedule} label="Visibility chosen" />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default YouTubeUpload;