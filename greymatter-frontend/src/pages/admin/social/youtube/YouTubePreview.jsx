function YouTubePreview({ title, thumbnailColor, visibility, duration }) {
  return (
    <div className="yt-preview">
      <div className="yt-preview-thumb" style={{ background: thumbnailColor || "#6846ff" }}>
        {!thumbnailColor && <span className="yt-preview-thumb-empty">No thumbnail</span>}
        {duration && <span className="yt-preview-duration">{duration}</span>}
      </div>
      <div className="yt-preview-meta">
        <div className="yt-preview-title">{title || "Untitled video"}</div>
        <div className="yt-preview-channel">Grey Matter</div>
        <div className="yt-preview-info">
          <span>0 views</span>
          <span>·</span>
          <span>Just now</span>
          {visibility && visibility !== "public" && (
            <>
              <span>·</span>
              <span className="yt-preview-vis">{visibility}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default YouTubePreview;