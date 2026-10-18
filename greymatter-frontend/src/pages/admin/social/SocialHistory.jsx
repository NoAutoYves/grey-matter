import { HISTORY, PLATFORMS } from "./dummySocial";

function SocialHistory() {
  if (HISTORY.length === 0) return <div className="admin-empty">No posts yet</div>;

  return (
    <div className="social-list">
      {HISTORY.map((h) => (
        <div key={h.id} className="social-list-row">
          <div className="social-list-main">
            <div className="social-list-meta">
              <span className="social-list-time">{h.when}</span>
              <span className={`admin-badge ${h.status === "posted" ? "admin-badge-success" : "admin-badge-danger"}`}>
                {h.status}
              </span>
              <span className="social-list-reach">{h.reach} reach</span>
            </div>
            <p className="social-list-content">{h.content}</p>
            {h.error && <p className="social-list-error">{h.error}</p>}
            <div className="social-list-platforms">
              {h.platforms.map((id) => {
                const p = PLATFORMS.find((x) => x.id === id);
                return (
                  <span key={id} className="social-platform-tag" style={{ color: p?.color, borderColor: p?.color }}>
                    {p?.label}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="social-list-actions">
            <button className="admin-btn admin-btn-ghost admin-btn-sm">Duplicate</button>
            {h.status === "failed" && (
              <button className="admin-btn admin-btn-secondary admin-btn-sm">Retry</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SocialHistory;