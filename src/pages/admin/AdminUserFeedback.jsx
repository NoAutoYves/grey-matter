import { useState, useEffect, useContext } from "react";
import { api } from "../../utils/api";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './AdminUserFeedback.module.css';

function AdminUserFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avg_rating: 0,
    rating_counts: {}
  });
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await api.get('/api/admin/feedback');
      const data = await response.json();
      
      if (response.ok) {
        setFeedback(data.feedback || []);
        setStats({
          total: data.total || 0,
          avg_rating: data.avg_rating || 0,
          rating_counts: data.rating_counts || {}
        });
      }
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedFeedback = () => {
    let result = [...feedback];
    
    if (filter !== 'all') {
      result = result.filter(f => f.rating === parseInt(filter));
    }
    
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'rating_high':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating_low':
        result.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    
    return result;
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Very Poor',
      2: 'Poor',
      3: 'Average',
      4: 'Good',
      5: 'Excellent'
    };
    return labels[rating] || '';
  };

  const getRatingClass = (rating) => {
    const classes = {
      1: styles.ratingVeryPoor,
      2: styles.ratingPoor,
      3: styles.ratingAverage,
      4: styles.ratingGood,
      5: styles.ratingExcellent
    };
    return classes[rating] || '';
  };

  const getScoreClass = (percentage) => {
    if (percentage >= 80) return styles.scoreHigh;
    if (percentage >= 50) return styles.scoreMedium;
    return styles.scoreLow;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>User Feedback</h2>
        <div className={styles.statsGrid}>
          <Skeleton count={3} height={80} style={{ marginRight: '10px' }} />
        </div>
        <Skeleton count={5} height={60} style={{ marginBottom: '10px' }} />
      </div>
    );
  }

  const filteredFeedback = getFilteredAndSortedFeedback();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>User Feedback</h2>
      
      {/* Stats Summary */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Feedback</h3>
          <div className={styles.statNumber}>{stats.total}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Average Rating</h3>
          <div className={styles.statNumber}>{stats.avg_rating ? stats.avg_rating.toFixed(1) : 'N/A'}</div>
          <div className={styles.statStars}>{renderStars(Math.round(stats.avg_rating || 0))}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Rating Breakdown</h3>
          <div className={styles.ratingBreakdown}>
            {[5, 4, 3, 2, 1].map(r => (
              <div key={r} className={styles.ratingRow}>
                <span className={styles.ratingLabel}>{r}⭐</span>
                <div className={styles.ratingBarTrack}>
                  <div 
                    className={styles.ratingBarFill} 
                    style={{ 
                      width: stats.total > 0 
                        ? `${((stats.rating_counts[r] || 0) / stats.total) * 100}%` 
                        : '0%' 
                    }}
                  />
                </div>
                <span className={styles.ratingCount}>{stats.rating_counts[r] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Filter by Rating:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Ratings</option>
            <option value="5">5 ⭐ - Excellent</option>
            <option value="4">4 ⭐ - Good</option>
            <option value="3">3 ⭐ - Average</option>
            <option value="2">2 ⭐ - Poor</option>
            <option value="1">1 ⭐ - Very Poor</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating_high">Highest Rating</option>
            <option value="rating_low">Lowest Rating</option>
          </select>
        </div>
        <button onClick={fetchFeedback} className={styles.refreshBtn}>🔄 Refresh</button>
      </div>

      {/* Feedback Table */}
      {filteredFeedback.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Exercise</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Score</th>
                <th>Time</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedback.map((item) => (
                <tr key={item.id}>
                  <td className={styles.userColumn}>
                    <strong>{item.user_email || 'Deleted User'}</strong>
                    <br />
                    <small style={{ color: '#888', fontSize: '12px' }}>ID: {item.user_id}</small>
                  </td>
                  <td className={styles.exerciseColumn}>
                    <strong>{item.exercise_title || 'Unknown Exercise'}</strong>
                  </td>
                  <td className={styles.ratingColumn}>
                    <span className={styles.stars}>{renderStars(item.rating)}</span>
                    <br />
                    <span className={`${styles.ratingLabel} ${getRatingClass(item.rating)}`}>
                      {getRatingLabel(item.rating)}
                    </span>
                  </td>
                  <td className={styles.feedbackColumn}>
                    {item.feedback ? (
                      <div className={styles.feedbackText}>"{item.feedback}"</div>
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>No feedback</span>
                    )}
                  </td>
                  <td className={styles.scoreColumn}>
                    <span className={`${styles.scoreBadge} ${getScoreClass(item.percentage || 0)}`}>
                      {item.score}/{item.total_questions}
                      <br />
                      <small>{item.percentage?.toFixed(1) || 'N/A'}%</small>
                    </span>
                  </td>
                  <td className={styles.timeColumn}>
                    {item.time_taken_seconds ? (
                      <>
                        {Math.floor(item.time_taken_seconds / 60)}m
                        <br />
                        <small>{item.time_taken_seconds % 60}s</small>
                      </>
                    ) : (
                      <span style={{ color: '#999' }}>N/A</span>
                    )}
                  </td>
                  <td className={styles.dateColumn}>
                    {item.created_at ? (
                      <>
                        {new Date(item.created_at).toLocaleDateString()}
                        <br />
                        <small>{new Date(item.created_at).toLocaleTimeString()}</small>
                      </>
                    ) : (
                      'Unknown'
                    )}
                    <br />
                    <small style={{ color: '#999', fontSize: '11px' }}>IP: {item.ip_address || 'N/A'}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.noFeedback}>No feedback found.</div>
      )}
    </div>
  );
}

export default AdminUserFeedback;