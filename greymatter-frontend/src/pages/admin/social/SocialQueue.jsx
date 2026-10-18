import { QUEUE, PLATFORMS } from "./dummySocial";

const badgeFor = (status) =>
  status === "scheduled" ? "admin-badge-info"
  : status === "posting" ? "admin-badge-warn"
  : status === "failed"  ? "admin-badge-danger"
  : "admin-badge-neutral";

function SocialQueue() {
  if (QUEUE.length === 0) return <div className="admin-empty">Nothing scheduled</div>;

  return (
    <div className="social-list">
      {QUEUE.map((q) => (
        <div key={q.id} className="social-list-row">
          <div className="social-list-main">
            <div className="social-list-meta">
              <span className="social-list-time">{q.when}</span>
              <span className={`admin-badge ${badgeFor(q.status)}`}>{q.status}</span>
            </div>
            <p className="social-list-content">{q.content}</p>
            <div className="social-list-platforms">
              {q.platforms.map((id) => {
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
            <button className="admin-btn admin-btn-ghost admin-btn-sm">Edit</button>
            <button className="admin-btn admin-btn-danger admin-btn-sm">Cancel</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SocialQueue;