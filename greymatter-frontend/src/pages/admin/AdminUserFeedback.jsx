import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/AdminUserFeedback.css";

function ConfirmModal({ title, text, confirmLabel, danger, onConfirm, onCancel, busy }) {
  return (
    <div className="admin-modal-backdrop" onClick={busy ? undefined : onCancel}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{title}</h3>
          <button className="admin-modal-close" onClick={onCancel} disabled={busy}>×</button>
        </div>
        <div className="admin-modal-body"><p>{text}</p></div>
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
          <button
            className={`admin-btn ${danger ? "admin-btn-danger" : "admin-btn-primary"}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stars({ rating }) {
  return (
    <span className="admin-rating-stars" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? "filled" : "empty"}>★</span>
      ))}
    </span>
  );
}

function AdminUserFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [filterRating, setFilterRating] = useState("all");

  const load = async () => {
    try {
      const res = await api.get("/api/admin/feedback");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load feedback");
      setFeedback(data.feedback || []);
      setStats({
        total: data.total,
        avg_rating: data.avg_rating,
        rating_counts: data.rating_counts,
      });
    } catch (e) {
      setError(e.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const deleteFeedback = (item) => {
    setConfirm({
      title: "Delete feedback?",
      text: `Permanently delete feedback from ${item.user_email} on "${item.exercise_title}"?`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        setBusyId(item.id);
        try {
          const res = await api.delete(`/api/admin/feedback/${item.id}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to delete");
          setMessage("Feedback deleted");
          setConfirm(null);
          load();
        } catch (e) {
          setError(e.message || "Failed to delete");
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const filtered = filterRating === "all"
    ? feedback
    : feedback.filter((f) => String(f.rating) === filterRating);

  if (loading) return <div className="admin-loading">Loading feedback...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Feedback</h1>
          <p className="admin-page-subtitle">Ratings and comments from users</p>
        </div>
      </header>

      {error && <div className="admin-error-banner">{error}</div>}
      {message && <div className="admin-success-banner">{message}</div>}

      {stats && (
        <div className="admin-feedback-stats">
          <div className="admin-feedback-stat">
            <span className="admin-stat-label">Total</span>
            <span className="admin-stat-value">{stats.total}</span>
          </div>
          <div className="admin-feedback-stat">
            <span className="admin-stat-label">Average rating</span>
            <span className="admin-stat-value">{stats.avg_rating.toFixed(2)}</span>
            <Stars rating={Math.round(stats.avg_rating)} />
          </div>
          <div className="admin-feedback-dist">
            {[5, 4, 3, 2, 1].map((r) => (
              <div key={r} className="admin-feedback-dist-row">
                <span>{r}★</span>
                <div className="admin-bar-track">
                  <div
                    className="admin-bar-fill"
                    style={{
                      width: stats.total > 0
                        ? `${(stats.rating_counts[String(r)] / stats.total) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
                <span className="admin-bar-value">{stats.rating_counts[String(r)] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="admin-feedback-toolbar">
        <label className="admin-feedback-filter">
          <span>Filter by rating</span>
          <select className="admin-select" value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
            <option value="all">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="admin-empty">No feedback to show</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Exercise</th>
                <th>Rating</th>
                <th>Score</th>
                <th>Time</th>
                <th>Comment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td className="admin-cell-num">{f.created_at?.slice(0, 16).replace("T", " ") || "—"}</td>
                  <td>{f.user_email}</td>
                  <td>{f.exercise_title}</td>
                  <td><Stars rating={f.rating} /></td>
                  <td className="admin-cell-num">{f.score} / {f.total_questions} ({f.percentage}%)</td>
                  <td className="admin-cell-num">{Math.round((f.time_taken_seconds || 0) / 60)}m</td>
                  <td className="admin-cell-details">{f.feedback || <em>—</em>}</td>
                  <td>
                    <button
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => deleteFeedback(f)}
                      disabled={busyId === f.id}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          text={confirm.text}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          busy={busyId !== null}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

export default AdminUserFeedback;