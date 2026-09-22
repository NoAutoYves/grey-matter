import { useState, useEffect, useRef } from "react";
import { api } from "../../utils/api";
import styles from './AdminUsers.module.css';

const ROWS_PER_PAGE = 15;

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [activities, setActivities] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setPage(1); }, [search, filter]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      const data = await res.json();
      if (res.ok) setUsers(data.users);
    } catch (e) { console.error("Failed to fetch users:", e); }
    finally { setLoading(false); }
  };

  const filtered = users.filter((u) => {
    if (filter === "admins" && !u.is_admin) return false;
    if (filter === "verified" && !u.is_verified) return false;
    if (filter === "unverified" && u.is_verified) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageUsers = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const toggleRole = async (u) => {
    const msg = u.is_admin
      ? `Remove admin access from ${u.email}?`
      : `Grant admin access to ${u.email}? Admins can manage users, exercises, and see all data.`;
    if (!confirm(msg)) return;
    try {
      const res = await api.put(`/api/admin/users/${u.user_id}/role`, { is_admin: !u.is_admin });
      if (res.ok) { fetchUsers(); setOpenMenu(null); }
    } catch (e) { console.error(e); }
  };

  const toggleVerify = async (u) => {
    try {
      const res = await api.put(`/api/admin/users/${u.user_id}/verify`, { is_verified: !u.is_verified });
      if (res.ok) { fetchUsers(); setOpenMenu(null); }
    } catch (e) { console.error(e); }
  };

  const resetPassword = async (u) => {
    if (!confirm(`Send password reset link to ${u.email}?`)) return;
    try {
      const res = await api.post(`/api/admin/users/${u.user_id}/reset-password`);
      alert(res.ok ? "Reset link sent." : "Failed to send link.");
      setOpenMenu(null);
    } catch (e) { console.error(e); }
  };

  const deleteUser = async (u) => {
    if (!confirm(
      `Permanently delete ${u.email}?\n\n` +
      `This deletes their account, all progress, notes, and feedback. Cannot be undone.`
    )) return;
    try {
      const res = await api.delete(`/api/admin/users/${u.user_id}`);
      if (res.ok) { fetchUsers(); setOpenMenu(null); }
      else { const err = await res.json(); alert(err.error || "Failed to delete"); }
    } catch (e) { console.error(e); }
  };

  const viewDetails = (u) => { setSelectedUser(u); setShowDetails(true); setOpenMenu(null); };

  const viewActivity = async (u) => {
    try {
      const res = await api.get(`/api/admin/users/${u.user_id}/activity`);
      const data = await res.json();
      if (res.ok) { setActivities(data.activities); setShowActivity(true); setOpenMenu(null); }
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return <div className="adm-loading"><div className="adm-loading__spinner" /><div>Loading users…</div></div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Users</h1>
        <p className={styles.subtitle}>{filtered.length} of {users.length} users</p>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            type="text"
            placeholder="Search email, name, username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="adm-input"
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`adm-select ${styles.filterSelect}`}>
          <option value="all">All users</option>
          <option value="admins">Admins only</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {pageUsers.length === 0 ? (
        <div className="adm-empty">
          <div className="adm-empty__icon">◉</div>
          <div className="adm-empty__title">No users found</div>
          <div className="adm-empty__body">Try a different search or filter.</div>
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th><th>Email</th><th>Name</th><th>Username</th>
                  <th>Role</th><th>Verified</th><th>Joined</th><th></th>
                </tr>
              </thead>
              <tbody>
                {pageUsers.map((u) => (
                  <tr key={u.user_id}>
                    <td className={styles.idCell}>#{u.user_id}</td>
                    <td className={styles.emailCell}>{u.email}</td>
                    <td>{u.first_name} {u.last_name}</td>
                    <td className={styles.muted}>{u.username || "—"}</td>
                    <td>
                      <span className={`adm-badge ${u.is_admin ? 'adm-badge--brand' : 'adm-badge--neutral'}`}>
                        {u.is_admin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td>
                      <span className={`adm-badge ${u.is_verified ? 'adm-badge--success' : 'adm-badge--neutral'}`}>
                        {u.is_verified ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className={styles.muted}>{u.created_at || "—"}</td>
                    <td className={styles.actionsCell}>
                      <div className={styles.menuWrap} ref={openMenu === u.user_id ? menuRef : null}>
                        <button
                          className={styles.menuBtn}
                          onClick={() => setOpenMenu(openMenu === u.user_id ? null : u.user_id)}
                        >⋯</button>
                        {openMenu === u.user_id && (
                          <div className={styles.menu}>
                            <button onClick={() => viewDetails(u)} className={styles.menuItem}>View details</button>
                            <button onClick={() => viewActivity(u)} className={styles.menuItem}>View activity</button>
                            <button onClick={() => toggleRole(u)} className={styles.menuItem}>
                              {u.is_admin ? "Remove admin" : "Make admin"}
                            </button>
                            <button onClick={() => toggleVerify(u)} className={styles.menuItem}>
                              {u.is_verified ? "Unverify" : "Verify"}
                            </button>
                            <button onClick={() => resetPassword(u)} className={styles.menuItem}>Send reset link</button>
                            <button onClick={() => deleteUser(u)} className={`${styles.menuItem} ${styles.menuDanger}`}>Delete user</button>
                          </div>
                        )}
                      </div>
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
                  <button
                    key={i + 1}
                    className={`${styles.pageBtn} ${page === i + 1 ? styles.pageActive : ''}`}
                    onClick={() => setPage(i + 1)}
                  >{i + 1}</button>
                ))}
                <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(page + 1)}>→</button>
              </div>
            </div>
          )}
        </>
      )}

      {showDetails && selectedUser && (
        <div className={styles.overlay} onClick={() => setShowDetails(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>User details</h2>
              <button className={styles.modalClose} onClick={() => setShowDetails(false)}>✕</button>
            </header>
            <div className={styles.detailGrid}>
              <div><span>ID</span><strong>#{selectedUser.user_id}</strong></div>
              <div><span>Email</span><strong>{selectedUser.email}</strong></div>
              <div><span>First name</span><strong>{selectedUser.first_name || "—"}</strong></div>
              <div><span>Last name</span><strong>{selectedUser.last_name || "—"}</strong></div>
              <div><span>Username</span><strong>{selectedUser.username || "—"}</strong></div>
              <div><span>Role</span><strong>{selectedUser.is_admin ? "Admin" : "User"}</strong></div>
              <div><span>Verified</span><strong>{selectedUser.is_verified ? "Yes" : "No"}</strong></div>
              <div><span>Joined</span><strong>{selectedUser.created_at || "—"}</strong></div>
              <div className={styles.detailFull}><span>Last login</span><strong>{selectedUser.last_login || "Never"}</strong></div>
            </div>
          </div>
        </div>
      )}

      {showActivity && (
        <div className={styles.overlay} onClick={() => setShowActivity(false)}>
          <div className={`${styles.modal} ${styles.modalLarge}`} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>User activity</h2>
              <button className={styles.modalClose} onClick={() => setShowActivity(false)}>✕</button>
            </header>
            {activities.length === 0 ? (
              <div className="adm-empty">
                <div className="adm-empty__title">No activity recorded</div>
                <div className="adm-empty__body">This user hasn't done anything yet.</div>
              </div>
            ) : (
              <div className={styles.activityList}>
                {activities.map((a, i) => (
                  <div key={i} className={styles.activityRow}>
                    <span className={styles.activityAction}>{a.action?.replace(/_/g, " ")}</span>
                    <span className={styles.activityDetails}>{a.details || "—"}</span>
                    <span className={styles.activityTime}>{a.created_at}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;