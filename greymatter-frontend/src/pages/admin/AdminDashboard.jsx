import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/admin/stats");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load dashboard");
        setStats(data);
      } catch (e) {
        setError(e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="admin-loading">Loading dashboard...</div>;

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error-banner">{error}</div>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: "Total Users", value: stats.total_users, sub: `+${stats.new_users_this_week} this week`, to: "/admin/users" },
    { label: "Published Exercises", value: stats.total_exercises, to: "/admin/exercises" },
    { label: "Completions", value: stats.total_completions, sub: `+${stats.completions_this_week} this week`, to: "/admin/analytics" },
    { label: "Average Score", value: `${stats.avg_score}%`, to: "/admin/analytics" },
    { label: "Active Users (7d)", value: stats.active_users_this_week, to: "/admin/analytics" },
  ];

  // Show the most recent 5 on the dashboard; the full list lives on /admin/activity.
  const recentPreview = (stats.recent_activity || []).slice(0, 5);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Platform overview</p>
        </div>
      </header>

      <div className="admin-stats-grid">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="admin-stat-card admin-stat-card-link">
            <span className="admin-stat-label">{c.label}</span>
            <span className="admin-stat-value">{c.value}</span>
            {c.sub && <span className="admin-stat-sub">{c.sub}</span>}
          </Link>
        ))}
      </div>

      <section className="admin-activity-panel">
        <div className="admin-panel-header">
          <h2 className="admin-section-title">Recent Activity</h2>
          <Link to="/admin/activity" className="admin-panel-link">
            View all activity →
          </Link>
        </div>

        {recentPreview.length > 0 ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {recentPreview.map((a, i) => (
                  <tr key={i}>
                    <td className="admin-cell-num">{a.created_at || "—"}</td>
                    <td>{a.user_email}</td>
                    <td><span className="admin-badge admin-badge-neutral">{a.action}</span></td>
                    <td className="admin-cell-details">{a.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">No recent activity</div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;