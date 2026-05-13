function ArchiveTab({ profileData }) {
  return (
    <div className="tab-content">
      <div className="archive-section">
        <h3>Notes Taken</h3>
        {profileData.saved_notes && profileData.saved_notes.length > 0 ? (
          profileData.saved_notes.map((note, index) => (
            <div key={index} className="note-item">
              <p>{note.note}</p>
              <small>{note.created_at}</small>
            </div>
          ))
        ) : (
          <p>No notes yet</p>
        )}
      </div>
      <div className="archive-section">
        <h3>Recent Activity</h3>
        {profileData.recent_activities && profileData.recent_activities.length > 0 ? (
          profileData.recent_activities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-action">{activity.action}</div>
              <small className="activity-date">{activity.created_at}</small>
            </div>
          ))
        ) : (
          <p>No recent activity</p>
        )}
      </div>
    </div>
  );
}

export default ArchiveTab;