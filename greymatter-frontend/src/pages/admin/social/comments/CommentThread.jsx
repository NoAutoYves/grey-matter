import { useState } from "react";

function CommentThread({ comment, onClose, onReply, onStatus }) {
  const [reply, setReply] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    onReply(reply.trim());
    setReply("");
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal admin-modal-lg comment-thread" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Comment thread</h3>
          <button className="admin-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="admin-modal-body">
          <div className="thread-meta">
            <span className="comment-user">{comment.user.name}</span>
            <span className="comment-email">{comment.user.email}</span>
            <span className="comment-time">{comment.created_at}</span>
          </div>

          <p className="thread-content">{comment.content}</p>
          <div className="thread-exercise">{comment.exercise}</div>

          {comment.replies.length > 0 && (
            <div className="thread-replies">
              {comment.replies.map((r) => (
                <div key={r.id} className="thread-reply">
                  <div className="thread-reply-head">
                    <span className="thread-reply-author">{r.author}</span>
                    <span className="comment-time">{r.created_at}</span>
                  </div>
                  <p className="thread-reply-content">{r.content}</p>
                </div>
              ))}
            </div>
          )}

          <form className="thread-reply-form" onSubmit={submit}>
            <textarea
              className="admin-textarea"
              placeholder="Reply as Madon..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
            />
            <div className="thread-reply-actions">
              <button type="submit" className="admin-btn admin-btn-primary" disabled={!reply.trim()}>
                Post reply
              </button>
            </div>
          </form>
        </div>

        <div className="admin-modal-footer comment-thread-footer">
          <div className="thread-status-actions">
            {comment.status !== "approved" && (
              <button className="admin-btn admin-btn-secondary" onClick={() => onStatus("approved")}>Approve</button>
            )}
            {comment.status !== "flagged" && (
              <button className="admin-btn admin-btn-secondary" onClick={() => onStatus("flagged")}>Flag</button>
            )}
            {comment.status !== "hidden" && (
              <button className="admin-btn admin-btn-secondary" onClick={() => onStatus("hidden")}>Hide</button>
            )}
          </div>
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default CommentThread;