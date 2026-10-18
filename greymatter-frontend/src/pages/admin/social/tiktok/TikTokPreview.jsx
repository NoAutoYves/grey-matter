function renderCaption(text) {
  if (!text) return null;
  return text.split(/(#[a-zA-Z0-9_]+)/g).map((part, i) =>
    part.startsWith("#")
      ? <span key={i} className="tt-hashtag">{part}</span>
      : <span key={i}>{part}</span>
  );
}

function TikTokPreview({
  title,
  videoUrl,
  coverColor,
  duration,
  privacy,
  tags,
  username = "greymatter",
}) {
  const privacyLabel = {
    PUBLIC_TO_EVERYONE: null,
    MUTUAL_FOLLOW_FRIENDS: "Friends",
    FOLLOWER_OF_CREATOR: "Followers",
    SELF_ONLY: "Private",
  }[privacy];

  const fullCaption = title
    ? title + (tags?.length ? " " + tags.map((t) => `#${t}`).join(" ") : "")
    : "";

  return (
    <div className="tt-preview">
      <div className="tt-phone">
        <div className="tt-viewport">
          {videoUrl ? (
            <video
              className="tt-video"
              src={videoUrl}
              loop
              muted
              autoPlay
              playsInline
            />
          ) : (
            <div
              className="tt-video tt-video-empty"
              style={{
                background:
                  coverColor ||
                  "linear-gradient(135deg, #1a1a2e 0%, #6846ff 100%)",
              }}
            >
              <span className="tt-video-empty-text">9:16 preview</span>
            </div>
          )}

          {duration && <span className="tt-duration">{duration}</span>}

          {/* Top tabs */}
          <div className="tt-tabs">
            <span className="tt-tab">Following</span>
            <span className="tt-tab active">For You</span>
          </div>

          <div className="tt-search-icon">⌕</div>

          {/* Right sidebar — avatar + engagement */}
          <div className="tt-sidebar">
            <div className="tt-avatar-wrap">
              <div className="tt-avatar">{username[0].toUpperCase()}</div>
              <div className="tt-avatar-plus">+</div>
            </div>
            <div className="tt-action">
              <div className="tt-action-icon">♥</div>
              <span className="tt-action-count">124K</span>
            </div>
            <div className="tt-action">
              <div className="tt-action-icon">💬</div>
              <span className="tt-action-count">1,042</span>
            </div>
            <div className="tt-action">
              <div className="tt-action-icon">🔖</div>
              <span className="tt-action-count">5,820</span>
            </div>
            <div className="tt-action">
              <div className="tt-action-icon">↗</div>
              <span className="tt-action-count">412</span>
            </div>
          </div>

          {/* Bottom info — user / caption / sound */}
          <div className="tt-info">
            <div className="tt-info-user">
              @{username}
              <span className="tt-info-badge">Creator</span>
            </div>
            <div className="tt-info-caption">
              {fullCaption ? (
                renderCaption(fullCaption)
              ) : (
                <span className="tt-info-empty">
                  Your caption will appear here…
                </span>
              )}
            </div>
            <div className="tt-info-music">
              <span className="tt-music-icon">♪</span>
              <span className="tt-music-text">
                original sound — Grey Matter
              </span>
            </div>
          </div>

          {/* Spinning vinyl */}
          <div className="tt-vinyl">
            <div className="tt-vinyl-center" />
          </div>

          {/* Vignette */}
          <div className="tt-vignette" />
        </div>
      </div>

      <div className="tt-preview-meta">
        <span className="tt-preview-ratio">9:16 vertical</span>
        {privacyLabel && (
          <span className="tt-preview-badge">{privacyLabel}</span>
        )}
      </div>
    </div>
  );
}

export default TikTokPreview;