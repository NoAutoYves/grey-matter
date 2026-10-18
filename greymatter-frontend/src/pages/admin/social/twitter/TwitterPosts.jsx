import { POSTS } from "./dummyTwitter";

const STATUS_BADGE = {
  posted:     "admin-badge-success",
  processing: "admin-badge-warn",
  failed:     "admin-badge-danger",
  scheduled:  "admin-badge-info",
};

const TYPE_LABEL = {
  single: "Post",
  thread: "Thread",
  poll:   "Poll",
};

function TwitterPosts() {
  if (POSTS.length === 0) return <div className="admin-empty">No posts yet</div>;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Post</th>
            <th>Type</th>
            <th>Status</th>
            <th>Impressions</th>
            <th>Likes</th>
            <th>Retweets</th>
            <th>Replies</th>
            <th>Posted</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {POSTS.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="tw-post-cell">
                  <div className="tw-post-text">{p.text}</div>
                  {p.error && <div className="tw-post-error">{p.error}</div>}
                  {p.media_count > 0 && (
                    <span className="tw-post-tag">{p.media_count} media</span>
                  )}
                  {p.thread_length && (
                    <span className="tw-post-tag">{p.thread_length} parts</span>
                  )}
                  {p.poll && (
                    <span className="tw-post-tag">Poll · {p.poll.options.length} options</span>
                  )}
                </div>
              </td>
              <td><span className="admin-badge admin-badge-neutral">{TYPE_LABEL[p.type]}</span></td>
              <td>
                <span className={`admin-badge ${STATUS_BADGE[p.status] || "admin-badge-neutral"}`}>
                  {p.status}
                </span>
              </td>
              <td className="admin-cell-num">{p.impressions.toLocaleString()}</td>
              <td className="admin-cell-num">{p.likes}</td>
              <td className="admin-cell-num">{p.retweets}</td>
              <td className="admin-cell-num">{p.replies}</td>
              <td className="admin-cell-num">{p.posted_at}</td>
              <td>
                <div className="admin-row-actions">
                  <button className="admin-btn admin-btn-ghost admin-btn-sm">Edit</button>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm">Copy link</button>
                  <button className="admin-btn admin-btn-danger admin-btn-sm">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TwitterPosts;