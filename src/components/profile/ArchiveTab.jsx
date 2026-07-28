import { useNavigate } from 'react-router-dom';

function ArchiveTab({ profileData }) {
  const navigate = useNavigate();

  const handleExerciseClick = (topicId, exerciseId, subjectName) => {
    if (!topicId || !exerciseId) {
      console.error("Missing IDs:", { topicId, exerciseId });
      return;
    }

    // Convert subject name to URL slug
    const subjectSlug = subjectName ? subjectName.toLowerCase().replace(/\s+/g, '-') : '';
    
    // Navigate to: /{subject}/topic/{topicId}
    navigate(`/${subjectSlug}/topic/${topicId}`);
  };

  return (
    <div className="tab-content">
      {/* Notes Section */}
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
          <p>0 created notes</p>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="archive-section">
        <h3>Recent Activity</h3>
        {profileData.recent_activities && profileData.recent_activities.length > 0 ? (
          profileData.recent_activities.map((activity, index) => {
            const hasValidIds = activity.topic_id && activity.exercise_id;
            
            return (
              <div 
                key={index} 
                className={`activity-item ${hasValidIds ? 'clickable' : ''}`}
                onClick={() => hasValidIds && handleExerciseClick(
                  activity.topic_id, 
                  activity.exercise_id,
                  activity.subject
                )}
                style={{ cursor: hasValidIds ? 'pointer' : 'default' }}
              >
                <div className="activity-action">{activity.action}</div>
                <div className="activity-meta">
                  <span className="activity-subject">
                    {activity.subject || 'Unknown Subject'} • Grade {activity.grade || 'N/A'}
                  </span>
                  <small className="activity-date">{activity.created_at}</small>
                </div>
              </div>
            );
          })
        ) : (
          <p>0 recent activities</p>
        )}
      </div>
    </div>
  );
}

export default ArchiveTab;