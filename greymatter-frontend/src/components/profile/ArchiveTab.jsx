import { useNavigate } from 'react-router-dom';
import '../../styles/profile/ArchiveTab.css';

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

  // Get up to 20 recent activities
  const recentActivities = profileData.recent_activities 
    ? profileData.recent_activities.slice(0, 20) 
    : [];

  return (
    <div className="tab-content">
      {/* Recent Activity Section */}
      <div className="archive-section">
        <h3>Recent Activity</h3>
        {recentActivities.length > 0 ? (
          recentActivities.map((activity, index) => {
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
          <p className="no-activity">No recent activity yet. Start practicing to see your progress here!</p>
        )}
      </div>
    </div>
  );
}

export default ArchiveTab;