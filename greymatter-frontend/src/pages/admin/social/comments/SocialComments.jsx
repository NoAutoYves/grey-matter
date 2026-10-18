import { useMemo, useState } from "react";
import { COMMENTS, STATUS_FILTERS } from "./dummyComments";
import CommentRow from "./CommentRow";
import CommentThread from "./CommentThread";

function ConfirmModal({ title, text, onConfirm, onCancel }) {
  return (
    <div className="admin-modal-backdrop" onClick={onCancel}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{title}</h3>
          <button className="admin-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="admin-modal-body"><p>{text}</p></div>
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="admin-btn admin-btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function SocialComments() {
  const [comments, setComments] = useState(COMMENTS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const filtered = useMemo(() => {
    return comments.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.content.toLowerCase().includes(q) ||
          c.user.name.toLowerCase().includes(q) ||
          c.user.email.toLowerCase().includes(q) ||
          c.exercise.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [comments, statusFilter, search]);

  const setStatus = (id, status) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const addReply = (id, content) => {
    setComments((prev) => prev.map((c) => (c.id === id ? {
      ...c,
      replies: [
        ...c.replies,
        {
          id: Date.now(),
          author: "Madon",
          content,
          created_at: new Date().toISOString().slice(0, 16).replace("T", " "),
        },
      ],
    } : c)));
  };

  const bulkStatus = (status) => {
    setComments((prev) => prev.map((c) => (selected.includes(c.id) ? { ...c, status } : c)));
    setSelected([]);
  };

  const requestDelete = (ids) => {
    setConfirm({
      title: ids.length === 1 ? "Delete comment?" : `Delete ${ids.length} comments?`,
      text: ids.length === 1
        ? "This permanently removes the comment and all its replies."
        : `This permanently removes ${ids.length} comments and all their replies.`,
      onConfirm: () => {
        setComments((prev) => prev.filter((c) => !ids.includes(c.id)));
        setSelected([]);
        setOpenId(null);
        setConfirm(null);
      },
    });
  };

  const openComment = comments.find((c) => c.id === openId) || null;

  return (
    <div className="social-comments">
      <div className="comments-chips">
        {STATUS_FILTERS.map((s) => {
          const count = s.value === "all"
            ? comments.length
            : comments.filter((c) => c.status === s.value).length;
          return (
            <button
              key={s.value}
              type="button"
              className={`comments-chip ${statusFilter === s.value ? "on" : ""}`}
              onClick={() => { setStatusFilter(s.value); setSelected([]); }}
            >
              {s.label}
              <span className="comments-chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="comments-toolbar">
        <div className="comments-search">
          <input
            className="admin-input"
            placeholder="Search comments, users, exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {selected.length > 0 && (
          <div className="comments-bulk">
            <span className="comments-bulk-count">{selected.length} selected</span>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => bulkStatus("approved")}>Approve</button>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => bulkStatus("hidden")}>Hide</button>
            <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => requestDelete(selected)}>Delete</button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="admin-empty">No comments match your filters</div>
      ) : (
        <div className="comments-list">
          {filtered.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              selected={selected.includes(c.id)}
              onToggleSelect={() =>
                setSelected((prev) =>
                  prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                )
              }
              onOpen={() => setOpenId(c.id)}
              onStatus={(s) => setStatus(c.id, s)}
              onDelete={() => requestDelete([c.id])}
            />
          ))}
        </div>
      )}

      {openComment && (
        <CommentThread
          comment={openComment}
          onClose={() => setOpenId(null)}
          onReply={(content) => addReply(openComment.id, content)}
          onStatus={(s) => setStatus(openComment.id, s)}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          text={confirm.text}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

export default SocialComments;