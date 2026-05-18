import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { apiRequest } from "../../utils/api";

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    daily_active: [],
    popular_exercises: [],
    score_distribution: [],
    subject_performance: [],
    avg_time_minutes: 0,
    active_users: 0,
    total_users: 0,
    total_exercises: 0,
    total_completions: 0,
    completion_rate: 0,
    top_performers: [],
    recent_activity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiRequest(`/api/admin/analytics`);
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Colors for pie chart
  const COLORS = ['#6846ff', '#8a6eff', '#a58eff', '#c0b0ff', '#6846ff'];

  if (loading) return <div className="admin-loading">Loading analytics...</div>;

  return (
    <div className="admin-analytics">
      <h1>Analytics Dashboard</h1>
      
      {/* Key Metrics Cards */}
      <div className="analytics-summary">
        <div className="summary-card">
          <h3>Total Users</h3>
          <p>{analytics.total_users || 0}</p>
          <span>Registered accounts</span>
        </div>
        <div className="summary-card">
          <h3>Active Users</h3>
          <p>{analytics.active_users || 0}</p>
          <span>Completed at least one exercise</span>
        </div>
        <div className="summary-card">
          <h3>Total Exercises</h3>
          <p>{analytics.total_exercises || 0}</p>
          <span>Available exercises</span>
        </div>
        <div className="summary-card">
          <h3>Total Completions</h3>
          <p>{analytics.total_completions || 0}</p>
          <span>Exercises completed</span>
        </div>
        <div className="summary-card">
          <h3>Completion Rate</h3>
          <p>{analytics.completion_rate || 0}%</p>
          <span>Users who completed exercises</span>
        </div>
        <div className="summary-card">
          <h3>Avg Time per Exercise</h3>
          <p>{analytics.avg_time_minutes || 0} min</p>
          <span>Across all users</span>
        </div>
      </div>

      {/* Daily Active Users - Line Chart */}
      <div className="analytics-section">
        <h2>Daily Active Users (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.daily_active}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#a0a0a0" tick={{ fill: '#a0a0a0' }} />
            <YAxis stroke="#a0a0a0" tick={{ fill: '#a0a0a0' }} />
            <Tooltip contentStyle={{ backgroundColor: '#2a2a2e', border: '1px solid #6846ff', color: '#fff' }} />
            <Line type="monotone" dataKey="count" stroke="#6846ff" strokeWidth={2} dot={{ fill: '#6846ff' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Score Distribution - Pie Chart */}
      <div className="analytics-section">
        <h2>Score Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={analytics.score_distribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="range"
            >
              {analytics.score_distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#2a2a2e', border: '1px solid #6846ff' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Subject Performance - Horizontal Bar Chart */}
      <div className="analytics-section">
        <h2>Completions by Subject</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={analytics.subject_performance}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis type="number" stroke="#a0a0a0" tick={{ fill: '#a0a0a0' }} />
            <YAxis type="category" dataKey="subject" stroke="#a0a0a0" tick={{ fill: '#a0a0a0' }} />
            <Tooltip contentStyle={{ backgroundColor: '#2a2a2e', border: '1px solid #6846ff' }} />
            <Bar dataKey="completions" fill="#6846ff" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Popular Exercises - Bar Chart */}
      <div className="analytics-section">
        <h2>Most Popular Exercises</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={analytics.popular_exercises}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="title" stroke="#a0a0a0" tick={{ fill: '#a0a0a0' }} angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#a0a0a0" tick={{ fill: '#a0a0a0' }} />
            <Tooltip contentStyle={{ backgroundColor: '#2a2a2e', border: '1px solid #6846ff' }} />
            <Bar dataKey="count" fill="#8a6eff" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performers Table */}
      <div className="analytics-section">
        <h2>Top Performing Users</h2>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Avg Score</th>
              <th>Exercises Completed</th>
            </tr>
          </thead>
          <tbody>
            {analytics.top_performers.map((user, idx) => (
              <tr key={idx}>
                <td>#{idx + 1}</td>
                <td>{user.email}</td>
                <td>{user.avg_score}%</td>
                <td>{user.completions}</td>
              </tr>
            ))}
            {analytics.top_performers.length === 0 && (
              <tr><td colSpan="4">No data available</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Activity Table */}
      <div className="analytics-section">
        <h2>Recent User Activity</h2>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {analytics.recent_activity.map((activity, idx) => (
              <tr key={idx}>
                <td>{activity.created_at}</td>
                <td>{activity.user_email}</td>
                <td>{activity.action}</td>
                <td>{activity.details || "-"}</td>
              </tr>
            ))}
            {analytics.recent_activity.length === 0 && (
              <tr><td colSpan="4">No recent activity</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminAnalytics;