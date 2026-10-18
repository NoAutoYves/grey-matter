import { VIDEOS } from "./dummyYoutube";

const STATUS_BADGE = {
  published:  "admin-badge-success",
  processing: "admin-badge-warn",
  failed:     "admin-badge-danger",
  scheduled:  "admin-badge-info",
};

function YouTubeVideos() {
  if (VIDEOS.length === 0) return <div className="admin-empty">No videos yet</div>;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Video</th>
            <th>Status</th>
            <th>Visibility</th>
            <th>Playlist</th>
            <th>Views</th>
            <th>Watch (h)</th>
            <th>CTR</th>
            <th>Published</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {VIDEOS.map((v) => (
            <tr key={v.id}>
              <td>
                <div className="yt-video-cell">
                  <div className="yt-video-thumb" style={{ background: v.thumbnail_color }}>
                    <span className="yt-video-duration">{v.duration}</span>
                  </div>
                  <div>
                    <div className="yt-video-title">{v.title}</div>
                    {v.error && <div className="yt-video-error">{v.error}</div>}
                  </div>
                </div>
              </td>
              <td><span className={`admin-badge ${STATUS_BADGE[v.status] || "admin-badge-neutral"}`}>{v.status}</span></td>
              <td><span className="admin-badge admin-badge-neutral">{v.visibility}</span></td>
              <td className="admin-cell-details">{v.playlist}</td>
              <td className="admin-cell-num">{v.views.toLocaleString()}</td>
              <td className="admin-cell-num">{v.watch_hours}</td>
              <td className="admin-cell-num">{v.ctr ? `${v.ctr}%` : "—"}</td>
              <td className="admin-cell-num">{v.published_at}</td>
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

export default YouTubeVideos;