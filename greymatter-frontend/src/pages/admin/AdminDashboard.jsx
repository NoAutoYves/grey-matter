import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";
import styles from './AdminDashboard.module.css';

function relativeTime(iso) {
  if (!iso) return "—";
  const seconds = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_exercises: 0,
    total_completions: 0,
    avg_score: 0,
    new_users_this_week: 0,
    completions_this_week: 0,
    active_users_this_week: 0,
    recent_activity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/admin/stats');
        const data = await res.json();
        if (res.ok) setStats(prev => ({ ...prev, ...data }));
      } catch (e) {
        console.error("Failed to fetch stats:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="adm-loading">
        <div className="adm-loading__spinner" />
        <div>Loading dashboard…</div>
      </div>
    );
  }

  const cards = [
    { label: "Total users", value: stats.total_users, delta: stats.new_users_this_week > 0 ? `+${stats.new_users_this_week} this week` : null, accent: "brand" },
    { label: "Exercises", value: stats.total_exercises, delta: null, accent: "neutral" },
    { label: "Completions", value: stats.total_completions, delta: stats.completions_this_week > 0 ? `+${stats.completions_this_week} this week` : null, accent: "success" },
    { label: "Avg score", value: `${stats.avg_score}%`, delta: null, accent: "neutral" },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Overview of site activity at a glance.</p>
      </header>

      <div className={styles.statsGrid}>
        {cards.map(c => (
          <div key={c.label} className={`${styles.statCard} ${styles[`accent${c.accent.charAt(0).toUpperCase() + c.accent.slice(1)}`]}`}>
            <div className={styles.statLabel}>{c.label}</div>
            <div className={styles.statValue}>{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</div>
            {c.delta && <div className={styles.statDelta}>{c.delta}</div>}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        <section className={styles.activityCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Recent activity</h2>
              <p className={styles.cardSubtitle}>Last 20 events</p>
            </div>
            <Link to="/admin/analytics" className="adm-btn adm-btn--sm">View all →</Link>
          </div>
          {stats.recent_activity.length === 0 ? (
            <div className="adm-empty">
              <div className="adm-empty__icon">◌</div>
              <div className="adm-empty__title">No recent activity</div>
              <div className="adm-empty__body">Events will appear here as users interact with the site.</div>
            </div>
          ) : (
            <ul className={styles.activityList}>
              {stats.recent_activity.map((a, i) => (
                <li key={i} className={styles.activityItem}>
                  <div className={styles.activityText}>
                    <strong>{a.user_email}</strong>
                    <span>{(a.action || '').replace(/_/g, ' ')}</span>
                    {a.details && <div className={styles.activityDetails}>{a.details}</div>}
                  </div>
                  <span className={styles.activityTime}>{relativeTime(a.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className={styles.side}>
          <div className={styles.weekCard}>
            <h2 className={styles.cardTitle}>This week</h2>
            <div className={styles.weekRow}><span>New users</span><strong>{stats.new_users_this_week}</strong></div>
            <div className={styles.weekRow}><span>Completed</span><strong>{stats.completions_this_week}</strong></div>
            <div className={styles.weekRow}><span>Active learners</span><strong>{stats.active_users_this_week}</strong></div>
          </div>

          <div className={styles.quickCard}>
            <h2 className={styles.cardTitle}>Quick actions</h2>
            <Link to="/admin/exercises" className={styles.quickLink}>
              <span className={styles.quickIcon}>▤</span>
              <div>
                <div className={styles.quickTitle}>Exercises</div>
                <div className={styles.quickSub}>Create, edit, publish</div>
              </div>
            </Link>
            <Link to="/admin/users" className={styles.quickLink}>
              <span className={styles.quickIcon}>◉</span>
              <div>
                <div className={styles.quickTitle}>Users</div>
                <div className={styles.quickSub}>Roles, verification</div>
              </div>
            </Link>
            <Link to="/admin/feedback" className={styles.quickLink}>
              <span className={styles.quickIcon}>◐</span>
              <div>
                <div className={styles.quickTitle}>Feedback</div>
                <div className={styles.quickSub}>See what students say</div>
              </div>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AdminDashboard;