import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/AdminActivity.css";

function AdminActivity() {
  const [activities, setActivities] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(100);
  const [actionFilter, setActionFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const load = async (opts = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", opts.page ?? page);
      params.set("per_page", perPage);
      if ((opts.action ?? actionFilter) !== "all") params.set("action", opts.action ?? actionFilter);
      const q = (opts.search ?? search).trim();
      if (q) params.set("search", q);

      const res = await api.get(`/api/admin/activity?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load activity");

      setActivities(data.activities || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
    } catch (e) {
      setError(e.message || "Failed to load activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadActions = async () => {
      try {
        const res = await api.get("/api/admin/activity/actions");
        const data = await res.json();
        if (res.ok) setActions(data.actions || []);
      } catch {
        // Non-fatal — filter dropdown just won't populate.
      }
    };
    loadActions();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applySearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    load({ page: 1, search: searchInput });
  };

  const changeAction = (value) => {
    setActionFilter(value);
    load({ page: 1, action: value });
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const gotoPage = (p) => {
    const clamped = Math.min(Math.max(1, p), totalPages);
    load({ page: clamped });
  };

  const formatTime = (iso) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-ZA", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso;
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Activity</h1>
          <p className="admin-page-subtitle">{total.toLocaleString()} total entries</p>
        </div>
      </header>

      <div className="admin-activity-toolbar">
        <form onSubmit={applySearch} className="admin-activity-search">
          <input
            className="admin-input"
            placeholder="Search details, email, or IP..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="admin-btn admin-btn-primary">Search</button>
          {search && (
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => { setSearchInput(""); setSearch(""); load({ page: 1, search: "" }); }}
            >
              Clear
            </button>
          )}
        </form>

        <label className="admin-activity-filter">
          <span>Action</span>
          <select className="admin-select" value={actionFilter} onChange={(e) => changeAction(e.target.value)}>
            <option value="all">All actions</option>
            {actions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading activity...</div>
      ) : activities.length === 0 ? (
        <div className="admin-empty">No activity matching your filters</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a) => (
                  <tr
                    key={a.log_id}
                    className="admin-activity-row"
                    onClick={() => setExpandedId(expandedId === a.log_id ? null : a.log_id)}
                  >
                    <td className="admin-cell-num">{formatTime(a.created_at)}</td>
                    <td>{a.user_email}</td>
                    <td><span className="admin-badge admin-badge-neutral">{a.action}</span></td>
                    <td className="admin-cell-details">{a.details}</td>
                    <td className="admin-cell-num">{a.ip_address || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {expandedId !== null && (() => {
            const sel = activities.find((a) => a.log_id === expandedId);
            if (!sel) return null;
            return (
              <div className="admin-activity-expand">
                <h3 className="admin-section-title">Full entry</h3>
                <dl className="admin-activity-detail">
                  <dt>Time</dt><dd>{formatTime(sel.created_at)}</dd>
                  <dt>User</dt><dd>{sel.user_email} (ID: {sel.user_id ?? "—"})</dd>
                  <dt>Action</dt><dd>{sel.action}</dd>
                  <dt>Details</dt><dd>{sel.details}</dd>
                  <dt>IP address</dt><dd>{sel.ip_address || "—"}</dd>
                  <dt>User agent</dt><dd className="admin-activity-ua">{sel.user_agent || "—"}</dd>
                </dl>
              </div>
            );
          })()}

          <div className="admin-pagination">
            <button className="admin-btn admin-btn-secondary" disabled={page <= 1} onClick={() => gotoPage(page - 1)}> Prev</button>
            <span className="admin-pagination-info">Page {page} of {totalPages}</span>
            <button className="admin-btn admin-btn-secondary" disabled={page >= totalPages} onClick={() => gotoPage(page + 1)}>Next </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminActivity;