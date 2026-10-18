function renderRichText(text) {
  if (!text) return null;
  // Split on hashtags, mentions, URLs — order matters (URLs first).
  const parts = text.split(/(https?:\/\/[^\s]+|#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("#") || part.startsWith("@")) {
      return <span key={i} className="tw-mention">{part}</span>;
    }
    if (part.startsWith("http")) {
      return <span key={i} className="tw-link">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

function TwitterPreview({ text, mediaCount, poll, username = "greymatter", displayName = "Grey Matter" }) {
  const initial = displayName[0].toUpperCase();

  return (
    <div className="tw-preview">
      <div className="tw-card">
        <div className="tw-card-avatar">{initial}</div>

        <div className="tw-card-body">
          <div className="tw-card-head">
            <span className="tw-card-name">{displayName}</span>
            <span className="tw-card-verified">✓</span>
            <span className="tw-card-handle">@{username}</span>
            <span className="tw-card-dot">·</span>
            <span className="tw-card-time">now</span>
          </div>

          <div className="tw-card-text">
            {text ? renderRichText(text) : (
              <span className="tw-card-empty">What's happening?</span>
            )}
          </div>

          {mediaCount > 0 && (
            <div className={`tw-card-media tw-card-media-${Math.min(mediaCount, 4)}`}>
              {Array.from({ length: Math.min(mediaCount, 4) }).map((_, i) => (
                <div key={i} className="tw-card-media-tile">
                  {i === 3 && mediaCount > 4 && (
                    <span className="tw-card-media-overflow">+{mediaCount - 3}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {poll && poll.options?.length > 0 && (
            <div className="tw-card-poll">
              {poll.options.map((opt, i) => {
                const total = (poll.votes || []).reduce((a, b) => a + b, 0) || 1;
                const pct = poll.votes ? Math.round(((poll.votes[i] || 0) / total) * 100) : 0;
                return (
                  <div key={i} className="tw-card-poll-option">
                    <div className="tw-card-poll-bar" style={{ width: `${pct}%` }} />
                    <span className="tw-card-poll-label">{opt || `Option ${i + 1}`}</span>
                    {poll.votes && <span className="tw-card-poll-pct">{pct}%</span>}
                  </div>
                );
              })}
              <div className="tw-card-poll-meta">
                {poll.votes
                  ? `${poll.votes.reduce((a, b) => a + b, 0)} votes · closed`
                  : "Poll · ends when posted"}
              </div>
            </div>
          )}

          <div className="tw-card-actions">
            <span className="tw-card-action">💬</span>
            <span className="tw-card-action">🔁</span>
            <span className="tw-card-action">♥</span>
            <span className="tw-card-action">🔖</span>
            <span className="tw-card-action">↗</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwitterPreview;