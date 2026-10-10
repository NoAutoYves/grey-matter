import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/AdminUsers.css";

function ConfirmModal({ title, text, confirmLabel = "Confirm", danger, onConfirm, onCancel, busy }) {
  return (
    <div className="admin-modal-backdrop" onClick={busy ? undefined : onCancel}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{title}</h3>
          <button className="admin-modal-close" onClick={onCancel} disabled={busy}>×</button>
        </div>
        <div className="admin-modal-body">
          <p>{text}</p>
        </div>
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

function ActivityModal({ user, activities, loading, onClose }) {
  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Activity — {user.email}</h3>
          <button className="admin-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="admin-modal-body">
          {loading ? (
            <div className="admin-loading">Loading activity...</div>
          ) : activities.length === 0 ? (
            <div className="admin-empty">No activity recorded</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a, i) => (
                    <tr key={i}>
                      <td className="admin-cell-num">{a.created_at || "—"}</td>
                      <td><span className="admin-badge admin-badge-neutral">{a.action}</span></td>
                      <td className="admin-cell-details">{a.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [activityTarget, setActivityTarget] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const loadUsers = async () => {
    try {
      const res = await api.get("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      setUsers(data.users || []);
    } catch (e) {
      setError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const updateRole = async (user, nextAdmin) => {
    setBusyId(user.user_id);
    try {
      const res = await api.put(`/api/admin/users/${user.user_id}/role`, { is_admin: nextAdmin });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");
      setUsers((prev) => prev.map((u) => u.user_id === user.user_id ? { ...u, is_admin: nextAdmin } : u));
      setMessage(`Role updated for ${user.email}`);
    } catch (e) {
      setError(e.message || "Failed to update role");
    } finally {
      setBusyId(null);
    }
  };

  const updateVerified = async (user, nextVerified) => {
    setBusyId(user.user_id);
    try {
      const res = await api.put(`/api/admin/users/${user.user_id}/verify`, { is_verified: nextVerified });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update verification");
      setUsers((prev) => prev.map((u) => u.user_id === user.user_id ? { ...u, is_verified: nextVerified } : u));
      setMessage(`Verification updated for ${user.email}`);
    } catch (e) {
      setError(e.message || "Failed to update verification");
    } finally {
      setBusyId(null);
    }
  };

  const resetPassword = (user) => {
    setConfirm({
      title: "Reset password?",
      text: `Send a password reset email to ${user.email}?`,
      confirmLabel: "Send reset email",
      onConfirm: async () => {
        setBusyId(user.user_id);
        try {
          const res = await api.post(`/api/admin/users/${user.user_id}/reset-password`, {});
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to send reset");
          setMessage(`Reset email sent to ${user.email}`);
          setConfirm(null);
        } catch (e) {
          setError(e.message || "Failed to send reset");
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const deleteUser = (user) => {
    setConfirm({
      title: "Delete user?",
      text: `Permanently delete ${user.email}? All progress, notes, activity, and feedback will be removed. This cannot be undone.`,
      confirmLabel: "Delete user",
      danger: true,
      onConfirm: async () => {
        setBusyId(user.user_id);
        try {
          const res = await api.delete(`/api/admin/users/${user.user_id}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to delete user");
          setUsers((prev) => prev.filter((u) => u.user_id !== user.user_id));
          setMessage(`Deleted ${user.email}`);
          setConfirm(null);
        } catch (e) {
          setError(e.message || "Failed to delete user");
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const openActivity = async (user) => {
    setActivityTarget(user);
    setActivityData([]);
    setActivityLoading(true);
    try {
      const res = await api.get(`/api/admin/users/${user.user_id}/activity`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load activity");
      setActivityData(data.activities || []);
    } catch (e) {
      setError(e.message || "Failed to load activity");
    } finally {
      setActivityLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading users...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Users</h1>
          <p className="admin-page-subtitle">{users.length} registered</p>
        </div>
      </header>

      {error && <div className="admin-error-banner">{error}</div>}
      {message && <div className="admin-success-banner">{message}</div>}

      {users.length === 0 ? (
        <div className="admin-empty">No users yet</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Username</th>
                <th>Admin</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Last login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id}>
                  <td className="admin-cell-num">{u.user_id}</td>
                  <td>{u.email}</td>
                  <td>{u.first_name} {u.last_name}</td>
                  <td>@{u.username || "—"}</td>
                  <td>
                    <button
                      type="button"
                      className={`admin-toggle ${u.is_admin ? "on" : "off"}`}
                      disabled={busyId === u.user_id}
                      onClick={() => updateRole(u, !u.is_admin)}
                      title={u.is_admin ? "Demote" : "Promote"}
                    >
                      {u.is_admin ? "Admin" : "User"}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`admin-toggle ${u.is_verified ? "on" : "off"}`}
                      disabled={busyId === u.user_id}
                      onClick={() => updateVerified(u, !u.is_verified)}
                      title={u.is_verified ? "Unverify" : "Verify"}
                    >
                      {u.is_verified ? "Verified" : "Unverified"}
                    </button>
                  </td>
                  <td className="admin-cell-num">{u.created_at || "—"}</td>
                  <td className="admin-cell-num">{u.last_login || "—"}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => resetPassword(u)}>Reset pwd</button>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openActivity(u)}>Activity</button>
                      <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => deleteUser(u)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          text={confirm.text}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          busy={busyId !== null}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {activityTarget && (
        <ActivityModal
          user={activityTarget}
          activities={activityData}
          loading={activityLoading}
          onClose={() => setActivityTarget(null)}
        />
      )}
    </div>
  );
}

export default AdminUsers;