import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { api } from "../../utils/api";
import styles from './AdminAnalytics.module.css';

const COLORS = ['#6846ff', '#8a6eff', '#a58eff', '#c0b0ff', '#d4ccff'];

function AdminAnalytics() {
  const [data, setData] = useState({
    daily_active: [], popular_exercises: [], score_distribution: [],
    subject_performance: [], avg_time_minutes: 0, active_users: 0,
    total_users: 0, total_exercises: 0, total_completions: 0,
    completion_rate: 0, top_performers: [], recent_activity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/admin/analytics');
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return <div className="adm-loading"><div className="adm-loading__spinner" /><div>Loading analytics…</div></div>;
  }

  const summary = [
    { label: "Total users", value: data.total_users },
    { label: "Active users", value: data.active_users },
    { label: "Exercises", value: data.total_exercises },
    { label: "Completions", value: data.total_completions },
    { label: "Completion rate", value: `${data.completion_rate}%` },
    { label: "Avg time", value: `${data.avg_time_minutes} min` },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Analytics</h1>
        <p className={styles.subtitle}>Site performance and learner activity</p>
      </header>

      <div className={styles.summaryGrid}>
        {summary.map(s => (
          <div key={s.label} className={styles.summaryCard}>
            <div className={styles.summaryLabel}>{s.label}</div>
            <div className={styles.summaryValue}>{s.value}</div>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Daily active users</h2>
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.daily_active}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e3db" />
              <XAxis dataKey="date" stroke="#a8a5a0" tick={{ fill: '#797976', fontSize: 12 }} />
              <YAxis stroke="#a8a5a0" tick={{ fill: '#797976', fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6846ff" strokeWidth={2} dot={{ fill: '#6846ff', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className={styles.twoCol}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Score distribution</h2>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.score_distribution}
                  cx="50%" cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  dataKey="count"
                  nameKey="range"
                >
                  {data.score_distribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Completions by subject</h2>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.subject_performance} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e3db" />
                <XAxis type="number" stroke="#a8a5a0" tick={{ fill: '#797976', fontSize: 12 }} />
                <YAxis type="category" dataKey="subject" stroke="#a8a5a0" tick={{ fill: '#797976', fontSize: 12 }} width={110} />
                <Tooltip />
                <Bar dataKey="completions" fill="#6846ff" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Most popular exercises</h2>
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.popular_exercises}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e3db" />
              <XAxis dataKey="title" stroke="#a8a5a0" tick={{ fill: '#797976', fontSize: 11 }}
                angle={-30} textAnchor="end" height={90} />
              <YAxis stroke="#a8a5a0" tick={{ fill: '#797976', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8a6eff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Top performers</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>#</th><th>User</th><th>Avg score</th><th>Completions</th></tr>
            </thead>
            <tbody>
              {data.top_performers.length === 0 ? (
                <tr><td colSpan="4" className={styles.empty}>No data yet</td></tr>
              ) : data.top_performers.map((u, i) => (
                <tr key={i}>
                  <td className={styles.rank}>#{i + 1}</td>
                  <td className={styles.email}>{u.email}</td>
                  <td>
                    <span className={`adm-badge ${u.avg_score >= 80 ? 'adm-badge--success' : u.avg_score >= 50 ? 'adm-badge--warning' : 'adm-badge--danger'}`}>
                      {u.avg_score}%
                    </span>
                  </td>
                  <td className={styles.muted}>{u.completions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminAnalytics;