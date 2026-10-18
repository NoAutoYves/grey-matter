const STATUS_BADGE = {
  pending:  "admin-badge-info",
  approved: "admin-badge-success",
  flagged:  "admin-badge-danger",
  hidden:   "admin-badge-neutral",
};

function CommentRow({ comment, selected, onToggleSelect, onOpen, onStatus, onDelete }) {
  const c = comment;

  return (
    <div className={`comment-row ${selected ? "selected" : ""}`}>
      <input
        type="checkbox"
        className="comment-check"
        checked={selected}
        onChange={onToggleSelect}
        onClick={(e) => e.stopPropagation()}
      />

      <div className="comment-main" onClick={onOpen}>
        <div className="comment-meta">
          <span className="comment-user">{c.user.name}</span>
          <span className="comment-email">{c.user.email}</span>
          <span className={`admin-badge ${STATUS_BADGE[c.status] || "admin-badge-neutral"}`}>{c.status}</span>
          {c.flag_reason && <span className="comment-flag">⚑ {c.flag_reason}</span>}
          <span className="comment-time">{c.created_at}</span>
        </div>

        <p className="comment-content">{c.content}</p>

        <div className="comment-footer">
          <span className="comment-exercise">{c.exercise}</span>
          {c.replies.length > 0 && (
            <span className="comment-replies-count">
              {c.replies.length} {c.replies.length === 1 ? "reply" : "replies"}
            </span>
          )}
        </div>
      </div>

      <div className="comment-actions" onClick={(e) => e.stopPropagation()}>
        {c.status !== "approved" && (
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => onStatus("approved")}>Approve</button>
        )}
        {c.status !== "flagged" && (
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => onStatus("flagged")}>Flag</button>
        )}
        {c.status !== "hidden" && (
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => onStatus("hidden")}>Hide</button>
        )}
        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}

export default CommentRow;