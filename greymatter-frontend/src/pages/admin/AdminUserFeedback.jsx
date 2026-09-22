import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import styles from './AdminUserFeedback.module.css';

const ROWS_PER_PAGE = 15;

function Stars({ count, max = 5 }) {
  return (
    <span className={styles.stars}>
      {'★'.repeat(count)}{'☆'.repeat(max - count)}
    </span>
  );
}

function AdminUserFeedback() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, avg_rating: 0, rating_counts: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => { fetchFeedback(); }, []);
  useEffect(() => { setPage(1); }, [search, ratingFilter, sortBy]);

  const fetchFeedback = async () => {
    try {
      const res = await api.get('/api/admin/feedback');
      const data = await res.json();
      if (res.ok) {
        setItems(data.feedback || []);
        setStats({
          total: data.total || 0,
          avg_rating: data.avg_rating || 0,
          rating_counts: data.rating_counts || {},
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const deleteFeedback = async (id) => {
    if (!confirm("Delete this feedback? Cannot be undone.")) return;
    try {
      const res = await api.delete(`/api/admin/feedback/${id}`);
      if (res.ok) fetchFeedback();
    } catch (e) { console.error(e); }
  };

  let filtered = items.filter((f) => {
    if (ratingFilter !== "all" && f.rating !== parseInt(ratingFilter)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      f.user_email?.toLowerCase().includes(q) ||
      f.exercise_title?.toLowerCase().includes(q) ||
      f.feedback?.toLowerCase().includes(q)
    );
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === "rating_high") return b.rating - a.rating;
    if (sortBy === "rating_low") return a.rating - b.rating;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  if (loading) {
    return <div className="adm-loading"><div className="adm-loading__spinner" /><div>Loading feedback…</div></div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Feedback</h1>
        <p className={styles.subtitle}>{stats.total} total responses</p>
      </header>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total</div>
          <div className={styles.summaryValue}>{stats.total}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Average rating</div>
          <div className={styles.summaryValue}>{stats.avg_rating.toFixed(1)}</div>
          <Stars count={Math.round(stats.avg_rating)} />
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryWide}`}>
          <div className={styles.summaryLabel}>Rating breakdown</div>
          <div className={styles.breakdown}>
            {[5, 4, 3, 2, 1].map(r => {
              const count = stats.rating_counts[r] || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={r} className={styles.breakdownRow}>
                  <span className={styles.breakdownLabel}>{r}★</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={styles.breakdownCount}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <span className={styles.searchIcon}>⌕</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, exercise, or text…" className="adm-input" />
        </div>
        <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="adm-select">
          <option value="all">All ratings</option>
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="adm-select">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="rating_high">Highest rating</option>
          <option value="rating_low">Lowest rating</option>
        </select>
      </div>

      {pageItems.length === 0 ? (
        <div className="adm-empty">
          <div className="adm-empty__icon">◐</div>
          <div className="adm-empty__title">No feedback found</div>
          <div className="adm-empty__body">Try a different filter or search term.</div>
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th><th>Exercise</th><th>Rating</th>
                  <th>Feedback</th><th>Score</th><th>Date</th><th></th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((f) => (
                  <tr key={f.id}>
                    <td className={styles.emailCell}>{f.user_email}</td>
                    <td>{f.exercise_title}</td>
                    <td><Stars count={f.rating} /></td>
                    <td className={styles.feedbackCell}>
                      {f.feedback ? <em>"{f.feedback}"</em> : <span className={styles.muted}>No comment</span>}
                    </td>
                    <td className={styles.muted}>
                      {f.score}/{f.total_questions} ({Math.round(f.percentage)}%)
                    </td>
                    <td className={styles.muted}>{new Date(f.created_at).toLocaleDateString()}</td>
                    <td className={styles.actionsCell}>
                      <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => deleteFeedback(f.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.pageInfo}>Page {page} of {totalPages}</div>
              <div className={styles.pageControls}>
                <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(page - 1)}>←</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1}
                    className={`${styles.pageBtn} ${page === i + 1 ? styles.pageActive : ''}`}
                    onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(page + 1)}>→</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminUserFeedback;