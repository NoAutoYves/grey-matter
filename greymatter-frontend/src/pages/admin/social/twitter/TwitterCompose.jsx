import { useMemo, useState } from "react";
import TwitterPreview from "./TwitterPreview";
import { CHAR_LIMITS, MEDIA_LIMITS, POLL_LIMITS, POLL_DURATIONS } from "./dummyTwitter";

// Weighted character count: URLs = 23, emoji = 2, everything else = 1.
function weightedLength(text) {
  if (!text) return 0;
  // Replace URLs with 23-char placeholder
  const noUrls = text.replace(/https?:\/\/[^\s]+/g, "x".repeat(23));
  // Count emoji as 2 (basic surrogate pair detection)
  let count = 0;
  for (const char of noUrls) {
    count += char.codePointAt(0) > 0xffff ? 2 : 1;
  }
  return count;
}

function ModeChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`tw-mode-chip ${active ? "on" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function TwitterCompose() {
  const [mode, setMode] = useState("single"); // single | thread | poll
  const [text, setText] = useState("");
  const [threadParts, setThreadParts] = useState(["", ""]);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDuration, setPollDuration] = useState(1440);
  const [media, setMedia] = useState([]); // { type, name, preview }
  const [mediaInputKey, setMediaInputKey] = useState(0);
  const [schedule, setSchedule] = useState("");

  const currentText = mode === "thread" ? threadParts[0] : text;
  const weighted = weightedLength(currentText);
  const overLimit = weighted > CHAR_LIMITS.threadPart;

  const addThreadPart = () => {
    if (threadParts.length >= 25) return;
    setThreadParts([...threadParts, ""]);
  };

  const updateThreadPart = (i, val) => {
    setThreadParts((prev) => prev.map((p, idx) => (idx === i ? val : p)));
  };

  const removeThreadPart = (i) => {
    if (threadParts.length <= 2) return;
    setThreadParts((prev) => prev.filter((_, idx) => idx !== i));
  };

  const addPollOption = () => {
    if (pollOptions.length >= POLL_LIMITS.maxOptions) return;
    setPollOptions([...pollOptions, ""]);
  };

  const updatePollOption = (i, val) => {
    setPollOptions((prev) => prev.map((o, idx) => (idx === i ? val : o)));
  };

  const removePollOption = (i) => {
    if (pollOptions.length <= POLL_LIMITS.minOptions) return;
    setPollOptions((prev) => prev.filter((_, idx) => idx !== i));
  };

  // HOOK: replace with real file picker + upload.
  const attachMedia = (type) => {
    if (type === "image" && media.filter((m) => m.type === "image").length >= MEDIA_LIMITS.image.max) return;
    if ((type === "video" || type === "gif") && media.some((m) => m.type === type)) return;
    if (media.some((m) => m.type === "video" || m.type === "gif")) return;

    const names = { image: "circuits_diagram.png", video: "redox_explainer.mp4", gif: "electron_flow.gif" };
    setMedia([...media, { type, name: names[type] }]);
  };

  const removeMedia = (i) => {
    setMedia(media.filter((_, idx) => idx !== i));
  };

  const canPost = useMemo(() => {
    if (overLimit) return false;
    if (mode === "thread") return threadParts.some((p) => p.trim());
    if (mode === "poll") {
      if (!text.trim()) return false;
      return pollOptions.filter((o) => o.trim()).length >= POLL_LIMITS.minOptions;
    }
    return text.trim().length > 0;
  }, [mode, text, threadParts, pollOptions, overLimit]);

  const previewPoll = mode === "poll"
    ? { options: pollOptions.filter((o) => o.trim()), votes: null }
    : null;

  return (
    <div className="tw-compose">
      <div className="tw-compose-left">
        {/* Mode switcher */}
        <div className="tw-mode-row">
          <ModeChip active={mode === "single"} onClick={() => setMode("single")}>Single post</ModeChip>
          <ModeChip active={mode === "thread"} onClick={() => setMode("thread")}>Thread</ModeChip>
          <ModeChip active={mode === "poll"}   onClick={() => setMode("poll")}>Poll</ModeChip>
        </div>

        {/* Composer card */}
        <section className="social-card">
          {mode === "single" && (
            <>
              <textarea
                className="admin-textarea tw-textarea"
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's happening?"
              />
              <div className={`tw-count ${overLimit ? "over" : weighted > 260 ? "warn" : ""}`}>
                {weighted}/{CHAR_LIMITS.standard}
                {overLimit && <span className="tw-count-note"> · thread parts cap at 280</span>}
              </div>
            </>
          )}

          {mode === "thread" && (
            <div className="tw-thread">
              {threadParts.map((part, i) => {
                const w = weightedLength(part);
                return (
                  <div key={i} className="tw-thread-part">
                    <div className="tw-thread-rail">
                      <div className="tw-thread-avatar">{i + 1}</div>
                      {i < threadParts.length - 1 && <div className="tw-thread-line" />}
                    </div>
                    <div className="tw-thread-input">
                      <textarea
                        className="admin-textarea"
                        rows={3}
                        value={part}
                        onChange={(e) => updateThreadPart(i, e.target.value)}
                        placeholder={i === 0 ? "Start your thread…" : "Add to thread…"}
                      />
                      <div className={`tw-count ${w > CHAR_LIMITS.threadPart ? "over" : ""}`}>
                        {w}/{CHAR_LIMITS.threadPart}
                      </div>
                      {threadParts.length > 2 && (
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-sm tw-thread-remove"
                          onClick={() => removeThreadPart(i)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm tw-add-part"
                onClick={addThreadPart}
                disabled={threadParts.length >= 25}
              >
                + Add part {threadParts.length < 25 && `(${threadParts.length}/25)`}
              </button>
            </div>
          )}

          {mode === "poll" && (
            <>
              <textarea
                className="admin-textarea tw-textarea"
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ask a question…"
              />
              <div className={`tw-count ${weighted > CHAR_LIMITS.pollText ? "over" : ""}`}>
                {weighted}/{CHAR_LIMITS.pollText}
              </div>

              <div className="tw-poll-builder">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="tw-poll-option">
                    <input
                      className="admin-input"
                      maxLength={POLL_LIMITS.maxChars}
                      value={opt}
                      onChange={(e) => updatePollOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                    />
                    {pollOptions.length > POLL_LIMITS.minOptions && (
                      <button
                        type="button"
                        className="tw-poll-remove"
                        onClick={() => removePollOption(i)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < POLL_LIMITS.maxOptions && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={addPollOption}
                  >
                    + Add option
                  </button>
                )}
              </div>

              <div className="admin-field" style={{ marginTop: "0.85rem" }}>
                <label>Duration</label>
                <select
                  className="admin-select"
                  value={pollDuration}
                  onChange={(e) => setPollDuration(Number(e.target.value))}
                >
                  {POLL_DURATIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </section>

        {/* Media */}
        {mode !== "poll" && (
          <section className="social-card">
            <h3 className="admin-section-title">Media</h3>
            <p className="tw-hint">
              Up to 4 images (5 MB each) · 1 GIF (15 MB) · 1 video (512 MB) — media cannot mix with polls
            </p>

            {media.length > 0 && (
              <div className="tw-media-grid">
                {media.map((m, i) => (
                  <div key={i} className={`tw-media-tile tw-media-${m.type}`}>
                    <span className="tw-media-type">{m.type}</span>
                    <span className="tw-media-name">{m.name}</span>
                    <button type="button" className="tw-media-remove" onClick={() => removeMedia(i)}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="tw-media-buttons">
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => attachMedia("image")}
                disabled={media.some((m) => m.type === "video" || m.type === "gif") || media.filter((m) => m.type === "image").length >= 4}
              >
                + Image
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => attachMedia("gif")}
                disabled={media.length > 0}
              >
                + GIF
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => attachMedia("video")}
                disabled={media.length > 0}
              >
                + Video
              </button>
            </div>
          </section>
        )}

        {/* Schedule + publish */}
        <section className="social-card">
          <div className="admin-field">
            <label>Schedule (leave blank to post now)</label>
            <input
              type="datetime-local"
              className="admin-input"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
          </div>
          <div className="tw-publish-actions">
            <button className="admin-btn admin-btn-secondary">Save draft</button>
            <button className="admin-btn admin-btn-primary" disabled={!canPost}>
              {mode === "thread" ? `Post thread (${threadParts.filter((p) => p.trim()).length})`
                : schedule ? "Schedule" : "Post"}
            </button>
          </div>
        </section>
      </div>

      <div className="tw-compose-right">
        <h3 className="admin-section-title">Preview</h3>

        {mode === "thread" ? (
          <div className="tw-preview-thread">
            {threadParts.map((part, i) => (
              part.trim() ? (
                <div key={i} className="tw-preview-thread-part">
                  <span className="tw-preview-thread-num">{i + 1}/{threadParts.length}</span>
                  <TwitterPreview text={part} mediaCount={0} poll={null} />
                </div>
              ) : null
            ))}
          </div>
        ) : (
          <TwitterPreview
            text={text}
            mediaCount={media.length}
            poll={previewPoll}
          />
        )}

        <div className="social-card tw-checklist">
          <h3 className="admin-section-title">Ready to post?</h3>
          <ul className="tw-checklist-list">
            {mode === "single" && (
              <li className={text.trim() && !overLimit ? "ok" : ""}>
                <span>{text.trim() && !overLimit ? "✓" : "○"}</span> Text within 280 chars
              </li>
            )}
            {mode === "thread" && (
              <li className={threadParts.filter((p) => p.trim()).length >= 2 && !overLimit ? "ok" : ""}>
                <span>{threadParts.filter((p) => p.trim()).length >= 2 && !overLimit ? "✓" : "○"}</span> At least 2 parts
              </li>
            )}
            {mode === "poll" && (
              <li className={pollOptions.filter((o) => o.trim()).length >= 2 ? "ok" : ""}>
                <span>{pollOptions.filter((o) => o.trim()).length >= 2 ? "✓" : "○"}</span> At least 2 poll options
              </li>
            )}
            <li className={!overLimit ? "ok" : ""}>
              <span>{!overLimit ? "✓" : "○"}</span> Character limit
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TwitterCompose;