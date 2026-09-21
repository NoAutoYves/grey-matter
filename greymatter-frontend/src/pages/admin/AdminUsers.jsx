import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import styles from './AdminUsers.module.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [userActivities, setUserActivities] = useState([]);
  const [openAdminDropdown, setOpenAdminDropdown] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (userId) => {
    if (openAdminDropdown === userId) {
      setOpenAdminDropdown(null);
    } else {
      setOpenAdminDropdown(userId);
    }
  };

  const toggleAdminStatus = async (userId, isAdmin) => {
    try {
      const response = await api.put(`/api/admin/users/${userId}/role`, { is_admin: !isAdmin });
      if (response.ok) {
        fetchUsers();
        setOpenAdminDropdown(null);
      }
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const toggleVerification = async (userId, isVerified) => {
    try {
      const response = await api.put(`/api/admin/users/${userId}/verify`, { is_verified: !isVerified });
      if (response.ok) {
        fetchUsers();
        setOpenAdminDropdown(null);
      }
    } catch (error) {
      console.error("Failed to update verification:", error);
    }
  };

  const resetUserPassword = async (userId, email) => {
    if (confirm(`Send password reset link to ${email}?`)) {
      try {
        const response = await api.post(`/api/admin/users/${userId}/reset-password`);
        if (response.ok) {
          alert("Password reset link sent to user's email");
          setOpenAdminDropdown(null);
        } else {
          alert("Failed to send reset link");
        }
      } catch (error) {
        console.error("Failed to reset password:", error);
      }
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setOpenAdminDropdown(null);
  };

  const viewUserActivity = async (userId) => {
    try {
      const response = await api.get(`/api/admin/users/${userId}/activity`);
      const data = await response.json();
      if (response.ok) {
        setUserActivities(data.activities);
        setShowActivityModal(true);
        setOpenAdminDropdown(null);
      }
    } catch (error) {
      console.error("Failed to fetch user activity:", error);
    }
  };

  const deleteUser = async (userId, email) => {
    if (confirm(`Permanently delete user ${email}? This cannot be undone.`)) {
      try {
        const response = await api.delete(`/api/admin/users/${userId}`);
        if (response.ok) {
          fetchUsers();
          setOpenAdminDropdown(null);
        }
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  if (loading) return <div className={styles.loading}>Loading users...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Management</h1>
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Username</th>
              <th>Admin</th>
              <th>Verified</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td className={styles.idColumn}>{user.user_id}</td>
                <td className={styles.emailColumn}>{user.email}</td>
                <td className={styles.nameColumn}>{user.first_name} {user.last_name}</td>
                <td className={styles.usernameColumn}>{user.username}</td>
                <td>
                  <span className={`${styles.badge} ${user.is_admin ? styles.badgeAdmin : styles.badgeNo}`}>
                    {user.is_admin ? "Yes" : "No"}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${user.is_verified ? styles.badgeYes : styles.badgeNo}`}>
                    {user.is_verified ? "Yes" : "No"}
                  </span>
                </td>
                <td className={styles.dateColumn}>{user.created_at || "N/A"}</td>
                <td className={styles.actionsCell}>
                  <div className={styles.dropdown}>
                    <button 
                      className={styles.dropdownBtn} 
                      onClick={() => toggleDropdown(user.user_id)}
                    >
                      Actions ▼
                    </button>
                    {openAdminDropdown === user.user_id && (
                      <div className={styles.dropdownMenu}>
                        <button onClick={() => viewUserDetails(user)} className={styles.dropdownItem}>
                          <span className={styles.icon}>👁️</span> View Details
                        </button>
                        <button onClick={() => viewUserActivity(user.user_id)} className={styles.dropdownItem}>
                          <span className={styles.icon}>📋</span> View Activity
                        </button>
                        <button onClick={() => toggleAdminStatus(user.user_id, user.is_admin)} className={styles.dropdownItem}>
                          <span className={styles.icon}>{user.is_admin ? "❌" : "✅"}</span>
                          {user.is_admin ? "Remove Admin" : "Make Admin"}
                        </button>
                        <button onClick={() => toggleVerification(user.user_id, user.is_verified)} className={styles.dropdownItem}>
                          <span className={styles.icon}>{user.is_verified ? "❌" : "✅"}</span>
                          {user.is_verified ? "Unverify" : "Verify"}
                        </button>
                        <button onClick={() => resetUserPassword(user.user_id, user.email)} className={styles.dropdownItem}>
                          <span className={styles.icon}>🔑</span> Send Reset Link
                        </button>
                        <button onClick={() => deleteUser(user.user_id, user.email)} className={`${styles.dropdownItem} ${styles.dropdownItemDelete}`}>
                          <span className={styles.icon}>🗑️</span> Delete User
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setShowUserModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>User Details</h2>
            <div className={styles.userDetails}>
              <p><strong>ID:</strong> {selectedUser.user_id}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>First Name:</strong> {selectedUser.first_name || "Not set"}</p>
              <p><strong>Last Name:</strong> {selectedUser.last_name || "Not set"}</p>
              <p className={styles.fullWidth}><strong>Username:</strong> {selectedUser.username || "Not set"}</p>
              <p><strong>Admin:</strong> {selectedUser.is_admin ? "Yes" : "No"}</p>
              <p><strong>Verified:</strong> {selectedUser.is_verified ? "Yes" : "No"}</p>
              <p className={styles.fullWidth}><strong>Joined:</strong> {selectedUser.created_at || "N/A"}</p>
              <p className={styles.fullWidth}><strong>Last Login:</strong> {selectedUser.last_login || "Never"}</p>
            </div>
            <button className={styles.modalClose} onClick={() => setShowUserModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* User Activity Modal */}
      {showActivityModal && (
        <div className={styles.modalOverlay} onClick={() => setShowActivityModal(false)}>
          <div className={`${styles.modalContent} ${styles.modalLarge}`} onClick={(e) => e.stopPropagation()}>
            <h2>User Activity Log</h2>
            {userActivities.length === 0 ? (
              <p style={{ color: '#888' }}>No activity recorded.</p>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>Time</th><th>Action</th><th>Details</th></tr>
                  </thead>
                  <tbody>
                    {userActivities.map((activity, idx) => (
                      <tr key={idx}>
                        <td className={styles.dateColumn}>{activity.created_at}</td>
                        <td><span className={`${styles.badge} ${styles.badgeAdmin}`}>{activity.action}</span></td>
                        <td style={{ color: '#888' }}>{activity.details || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button className={styles.modalClose} onClick={() => setShowActivityModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;