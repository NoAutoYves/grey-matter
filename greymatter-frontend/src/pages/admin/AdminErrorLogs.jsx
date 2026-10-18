import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/AdminErrorLogs.css";

const LEVELS = [
  { value: "all", label: "All levels" },
  { value: "error", label: "Error" },
  { value: "warn", label: "Warning" },
];

const SOURCES = [
  { value: "all", label: "All sources" },
  { value: "app", label: "App" },
  { value: "db", label: "Database" },
  { value: "timeout", label: "Timeout" },
];

function ConfirmModal({ title, text, confirmLabel, danger, onConfirm, onCancel, busy }) {
  return (
    <div className="admin-modal-backdrop" onClick={busy ? undefined : onCancel}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{title}</h3>
          <button className="admin-modal-close" onClick={onCancel} disabled={busy}>×</button>
        </div>
        <div className="admin-modal-body"><p>{text}</p></div>
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
          <button
            className={`admin-btn ${danger ? "admin-btn-danger" : "admin-btn-primary"}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ErrorDetailModal({ log, onClose }) {
  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Error #{log.error_id}</h3>
          <button className="admin-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="admin-modal-body">
          <dl className="admin-error-detail">
            <dt>Level</dt>
            <dd>
              <span className={`admin-badge ${log.level === "error" ? "admin-badge-danger" : "admin-badge-warn"}`}>
                {log.level}
              </span>
            </dd>
            <dt>Source</dt><dd>{log.source}</dd>
            <dt>Time</dt><dd>{log.created_at?.replace("T", " ").slice(0, 19) || "—"}</dd>
            <dt>User ID</dt><dd>{log.user_id ?? "—"}</dd>
            <dt>Endpoint</dt><dd>{log.endpoint || "—"}</dd>
            <dt>Method</dt><dd>{log.method || "—"}</dd>
            <dt>IP</dt><dd>{log.ip_address || "—"}</dd>
            <dt>Message</dt><dd>{log.message}</dd>
          </dl>

          {log.stack_trace && (
            <>
              <h4 className="admin-section-title" style={{ marginTop: "1.5rem" }}>Stack trace</h4>
              <pre className="admin-error-stack">{log.stack_trace}</pre>
            </>
          )}

          {log.user_agent && (
            <>
              <h4 className="admin-section-title" style={{ marginTop: "1.5rem" }}>User agent</h4>
              <pre className="admin-error-ua">{log.user_agent}</pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DbErrorPanel() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(50);
  const [level, setLevel] = useState("all");
  const [source, setSource] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async (opts = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", opts.page ?? page);
      params.set("per_page", perPage);
      if ((opts.level ?? level) !== "all") params.set("level", opts.level ?? level);
      if ((opts.source ?? source) !== "all") params.set("source", opts.source ?? source);
      const q = (opts.search ?? search).trim();
      if (q) params.set("search", q);

      const res = await api.get(`/api/admin/error-logs?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load logs");
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
    } catch (e) {
      setError(e.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const deleteOne = (log) => {
    setConfirm({
      title: "Delete log entry?",
      text: `Delete error #${log.error_id} permanently?`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        setBusy(true);
        try {
          const res = await api.delete(`/api/admin/error-logs/${log.error_id}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to delete");
          setMessage("Log entry deleted");
          setConfirm(null);
          load();
        } catch (e) {
          setError(e.message || "Failed to delete");
        } finally {
          setBusy(false);
        }
      },
    });
  };

  const clearAll = () => {
    setConfirm({
      title: "Clear all error logs?",
      text: "Permanently delete every entry in the error_logs table. This cannot be undone.",
      confirmLabel: "Clear all",
      danger: true,
      onConfirm: async () => {
        setBusy(true);
        try {
          const res = await api.delete("/api/admin/error-logs");
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to clear");
          setMessage(`Cleared ${data.deleted} entries`);
          setConfirm(null);
          load({ page: 1 });
        } catch (e) {
          setError(e.message || "Failed to clear");
        } finally {
          setBusy(false);
        }
      },
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <>
      <div className="admin-error-toolbar">
        <form
          className="admin-error-search"
          onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); load({ page: 1, search: searchInput }); }}
        >
          <input
            className="admin-input"
            placeholder="Search message or stack trace..."
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

        <div className="admin-error-filters">
          <select
            className="admin-select"
            value={level}
            onChange={(e) => { setLevel(e.target.value); load({ page: 1, level: e.target.value }); }}
          >
            {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>

          <select
            className="admin-select"
            value={source}
            onChange={(e) => { setSource(e.target.value); load({ page: 1, source: e.target.value }); }}
          >
            {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <button className="admin-btn admin-btn-danger" onClick={clearAll} disabled={total === 0}>
            Clear all
          </button>
        </div>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}
      {message && <div className="admin-success-banner">{message}</div>}

      {loading ? (
        <div className="admin-loading">Loading errors...</div>
      ) : logs.length === 0 ? (
        <div className="admin-empty">No errors recorded</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Level</th>
                  <th>Source</th>
                  <th>Message</th>
                  <th>Endpoint</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.error_id} onClick={() => setDetail(l)} className="admin-error-row">
                    <td className="admin-cell-num">{l.created_at?.replace("T", " ").slice(0, 19) || "—"}</td>
                    <td>
                      <span className={`admin-badge ${l.level === "error" ? "admin-badge-danger" : "admin-badge-warn"}`}>
                        {l.level}
                      </span>
                    </td>
                    <td><span className="admin-badge admin-badge-neutral">{l.source}</span></td>
                    <td className="admin-cell-details">{l.message}</td>
                    <td className="admin-cell-num">{l.endpoint || "—"}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => deleteOne(l)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <button className="admin-btn admin-btn-secondary" disabled={page <= 1} onClick={() => load({ page: page - 1 })}> Prev</button>
            <span className="admin-pagination-info">Page {page} of {totalPages}</span>
            <button className="admin-btn admin-btn-secondary" disabled={page >= totalPages} onClick={() => load({ page: page + 1 })}>Next </button>
          </div>
        </>
      )}

      {detail && <ErrorDetailModal log={detail} onClose={() => setDetail(null)} />}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          text={confirm.text}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          busy={busy}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}

function NginxPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    setHint("");
    try {
      const res = await api.get("/api/admin/error-logs/nginx");
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "Failed to load nginx log");
        if (d.hint) setHint(d.hint);
      } else {
        setData(d);
      }
    } catch (e) {
      setError(e.message || "Failed to load nginx log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = data
    ? data.lines.filter((ln) => !search || ln.toLowerCase().includes(search.toLowerCase()))
    : [];

  if (loading) return <div className="admin-loading">Reading nginx log...</div>;

  if (error) {
    return (
      <div className="admin-error-banner">
        <div>{error}</div>
        {hint && <pre className="admin-error-hint">{hint}</pre>}
        <button className="admin-btn admin-btn-secondary" style={{ marginTop: "0.75rem" }} onClick={load}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <div className="admin-error-toolbar">
        <div className="admin-error-search">
          <input
            className="admin-input"
            placeholder="Filter lines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="admin-error-filters">
          <span className="admin-nginx-meta">
            {filtered.length} of {data.returned} lines · {data.total_lines} total
          </span>
          <button className="admin-btn admin-btn-secondary" onClick={load}>Refresh</button>
        </div>
      </div>

      <div className="admin-nginx-log">
        {filtered.length === 0 ? (
          <div className="admin-empty">No matching lines</div>
        ) : (
          filtered.map((ln, i) => (
            <div key={i} className="admin-nginx-line">{ln}</div>
          ))
        )}
      </div>
    </>
  );
}

function AdminErrorLogs() {
  const [tab, setTab] = useState("db"); // "db" | "nginx"

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Error Logs</h1>
          <p className="admin-page-subtitle">Application and server errors</p>
        </div>
      </header>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === "db" ? "active" : ""}`} onClick={() => setTab("db")}>
          Application
        </button>
        <button className={`admin-tab ${tab === "nginx" ? "active" : ""}`} onClick={() => setTab("nginx")}>
          Nginx
        </button>
      </div>

      {tab === "db" ? <DbErrorPanel /> : <NginxPanel />}
    </div>
  );
}

export default AdminErrorLogs;