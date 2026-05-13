function Skeleton({ type = "quiz" }) {
  if (type === "quiz") {
    return (
      <div className="skeleton-quiz">
        <div className="skeleton-header"></div>
        <div className="skeleton-info-row">
          <div className="skeleton-box"></div>
          <div className="skeleton-box"></div>
          <div className="skeleton-box"></div>
        </div>
        <div className="skeleton-question"></div>
        <div className="skeleton-options">
          <div className="skeleton-option"></div>
          <div className="skeleton-option"></div>
          <div className="skeleton-option"></div>
          <div className="skeleton-option"></div>
        </div>
      </div>
    );
  }

  if (type === "subjects") {
    return (
      <div className="skeleton-subjects">
        <div className="skeleton-title"></div>
        <div className="skeleton-grid">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      </div>
    );
  }

  if (type === "profile") {
    return (
      <div className="skeleton-profile">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-name"></div>
        <div className="skeleton-bio"></div>
        <div className="skeleton-stats">
          <div className="skeleton-stat"></div>
          <div className="skeleton-stat"></div>
          <div className="skeleton-stat"></div>
        </div>
      </div>
    );
  }

  if (type === "quizlist") {
    return (
      <div className="skeleton-quizlist">
        <div className="skeleton-title"></div>
        <div className="skeleton-list">
          <div className="skeleton-list-item"></div>
          <div className="skeleton-list-item"></div>
          <div className="skeleton-list-item"></div>
          <div className="skeleton-list-item"></div>
        </div>
      </div>
    );
  }

  return null;
}

export default Skeleton;