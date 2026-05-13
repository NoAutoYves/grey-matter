function StatsTab({ profileData }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Exercises Completed</h3>
        <p>{profileData.total_exercises || 0}</p>
      </div>
      <div className="stat-card">
        <h3>Average Score</h3>
        <p>{profileData.average_score}%</p>
      </div>
      <div className="stat-card">
        <h3>Average Time per Exercise</h3>
        <p>{profileData.average_time || "0:00"}</p>
      </div>
    </div>
  );
}

export default StatsTab;