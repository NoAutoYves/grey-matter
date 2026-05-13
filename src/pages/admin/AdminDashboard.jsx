import { useState, useEffect } from "react";
import { apiRequest } from "../../utils/api";

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
        const response = await apiRequest(`${import.meta.env.VITE_API_URL}/api/admin/stats`);
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

  if (loading) return <div className="admin-loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <h3>Total Users</h3>
          <p>{stats.total_users}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Total Exercises</h3>
          <p>{stats.total_exercises}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Exercises Completed</h3>
          <p>{stats.total_completions}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Average Score</h3>
          <p>{stats.avg_score}%</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;