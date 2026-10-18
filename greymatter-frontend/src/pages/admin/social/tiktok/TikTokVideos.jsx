import { VIDEOS } from "./dummyTikTok";

const STATUS_BADGE = {
  posted:     "admin-badge-success",
  processing: "admin-badge-warn",
  failed:     "admin-badge-danger",
  scheduled:  "admin-badge-info",
};

const PRIVACY_LABEL = {
  PUBLIC_TO_EVERYONE: "Everyone",
  MUTUAL_FOLLOW_FRIENDS: "Friends",
  FOLLOWER_OF_CREATOR: "Followers",
  SELF_ONLY: "Private",
};

function TikTokVideos() {
  if (VIDEOS.length === 0) return <div className="admin-empty">No videos yet</div>;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Video</th>
            <th>Status</th>
            <th>Privacy</th>
            <th>Views</th>
            <th>Likes</th>
            <th>Comments</th>
            <th>Shares</th>
            <th>Posted</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {VIDEOS.map((v) => (
            <tr key={v.id}>
              <td>
                <div className="tt-video-cell">
                  <div className="tt-video-thumb" style={{ background: v.cover_color }}>
                    <span className="tt-video-duration">{v.duration}</span>
                    <span className="tt-video-ratio">9:16</span>
                  </div>
                  <div>
                    <div className="tt-video-title">{v.title}</div>
                    {v.error && <div className="tt-video-error">{v.error}</div>}
                    <div className="tt-video-flags">
                      {v.allow_comments && <span>Comments</span>}
                      {v.allow_duet && <span>Duet</span>}
                      {v.allow_stitch && <span>Stitch</span>}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <span className={`admin-badge ${STATUS_BADGE[v.status] || "admin-badge-neutral"}`}>
                  {v.status}
                </span>
              </td>
              <td>
                <span className="admin-badge admin-badge-neutral">
                  {PRIVACY_LABEL[v.privacy] || v.privacy}
                </span>
              </td>
              <td className="admin-cell-num">{v.views.toLocaleString()}</td>
              <td className="admin-cell-num">{v.likes.toLocaleString()}</td>
              <td className="admin-cell-num">{v.comments}</td>
              <td className="admin-cell-num">{v.shares}</td>
              <td className="admin-cell-num">{v.posted_at}</td>
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

export default TikTokVideos;