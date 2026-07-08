import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import styles from './AdminDashboard.module.css';

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_exercises: 0,
    total_completions: 0,
    avg_score: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/admin/stats');
        const data = await response.json();
        if (response.ok) {
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className={styles.loading}>Loading dashboard...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Users</h3>
          <p className={styles.number}>{stats.total_users}</p>
          <div className={styles.subtext}>Registered accounts</div>
        </div>
        <div className={styles.statCard}>
          <h3>Total Exercises</h3>
          <p className={styles.number}>{stats.total_exercises}</p>
          <div className={styles.subtext}>Available exercises</div>
        </div>
        <div className={styles.statCard}>
          <h3>Exercises Completed</h3>
          <p className={styles.number}>{stats.total_completions}</p>
          <div className={styles.subtext}>Total completions</div>
        </div>
        <div className={styles.statCard}>
          <h3>Average Score</h3>
          <p className={styles.number}>{stats.avg_score}%</p>
          <div className={styles.subtext}>Across all exercises</div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;