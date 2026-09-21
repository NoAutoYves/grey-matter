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
import { api } from "../../utils/api";
import styles from './AdminAnalytics.module.css';

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
      const response = await api.get('/api/admin/analytics');
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

  const COLORS = ['#6846ff', '#8a6eff', '#a58eff', '#c0b0ff', '#6846ff'];

  if (loading) return <div className={styles.loading}>Loading analytics...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Analytics Dashboard</h1>
      
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <h3>Total Users</h3>
          <div className={styles.number}>{analytics.total_users || 0}</div>
          <div className={styles.label}>Registered accounts</div>
        </div>
        <div className={styles.summaryCard}>
          <h3>Active Users</h3>
          <div className={styles.number}>{analytics.active_users || 0}</div>
          <div className={styles.label}>Completed at least one exercise</div>
        </div>
        <div className={styles.summaryCard}>
          <h3>Total Exercises</h3>
          <div className={styles.number}>{analytics.total_exercises || 0}</div>
          <div className={styles.label}>Available exercises</div>
        </div>
        <div className={styles.summaryCard}>
          <h3>Total Completions</h3>
          <div className={styles.number}>{analytics.total_completions || 0}</div>
          <div className={styles.label}>Exercises completed</div>
        </div>
        <div className={styles.summaryCard}>
          <h3>Completion Rate</h3>
          <div className={styles.number}>{analytics.completion_rate || 0}%</div>
          <div className={styles.label}>Users who completed exercises</div>
        </div>
        <div className={styles.summaryCard}>
          <h3>Avg Time per Exercise</h3>
          <div className={styles.number}>{analytics.avg_time_minutes || 0} min</div>
          <div className={styles.label}>Across all users</div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Daily Active Users (Last 7 Days)</h2>
        <div className={styles.chartContainer}>
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
      </div>

      <div className={styles.section}>
        <h2>Score Distribution</h2>
        <div className={styles.chartContainer}>
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
      </div>

      <div className={styles.section}>
        <h2>Completions by Subject</h2>
        <div className={styles.chartContainer}>
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
      </div>

      <div className={styles.section}>
        <h2>Most Popular Exercises</h2>
        <div className={styles.chartContainer}>
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
      </div>

      <div className={styles.section}>
        <h2>Top Performing Users</h2>
        <table className={styles.table}>
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
                <td className={styles.rankColumn}>#{idx + 1}</td>
                <td className={styles.userEmail}>{user.email}</td>
                <td><span className={`${styles.scoreBadge} ${user.avg_score >= 80 ? styles.scoreHigh : user.avg_score >= 50 ? styles.scoreMedium : styles.scoreLow}`}>{user.avg_score}%</span></td>
                <td>{user.completions}</td>
              </tr>
            ))}
            {analytics.top_performers.length === 0 && (
              <tr><td colSpan="4" className={styles.noData}>No data available</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.section}>
        <h2>Recent User Activity</h2>
        <table className={styles.table}>
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
                <td className={styles.timeColumn}>{activity.created_at}</td>
                <td className={styles.userEmail}>{activity.user_email}</td>
                <td><span className={styles.actionBadge}>{activity.action}</span></td>
                <td className={styles.detailsText}>{activity.details || "-"}</td>
              </tr>
            ))}
            {analytics.recent_activity.length === 0 && (
              <tr><td colSpan="4" className={styles.noData}>No recent activity</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminAnalytics;