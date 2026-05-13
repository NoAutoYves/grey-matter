import { useState, useEffect } from "react";
import { apiRequest } from "../../utils/api";

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
      const response = await apiRequest(`${import.meta.env.VITE_API_URL}/api/admin/users`);
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
      const response = await apiRequest(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ is_admin: !isAdmin })
      });
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
      const response = await apiRequest(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/verify`, {
        method: "PUT",
        body: JSON.stringify({ is_verified: !isVerified })
      });
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
        const response = await apiRequest(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/reset-password`, {
          method: "POST"
        });
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
      const response = await apiRequest(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/activity`);
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
        const response = await apiRequest(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, {
          method: "DELETE"
        });
        if (response.ok) {
          fetchUsers();
          setOpenAdminDropdown(null);
        }
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  if (loading) return <div className="admin-loading">Loading users...</div>;

  return (
    <div className="admin-users">
      <h1>User Management</h1>
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>{user.user_id}</td>
              <td>{user.email}</td>
              <td>{user.first_name} {user.last_name}</td>
              <td>{user.username}</td>
              <td>{user.is_admin ? "Yes" : "No"}</td>
              <td>{user.is_verified ? "Yes" : "No"}</td>
              <td>{user.created_at || "N/A"}</td>
              <td className="admin-user-actions-cell">
                <div className="admin-user-dropdown">
                  <button 
                    className="admin-user-actions-btn" 
                    onClick={() => toggleDropdown(user.user_id)}
                  >
                    Actions
                  </button>
                  {openAdminDropdown === user.user_id && (
                    <div className="admin-user-dropdown-menu">
                      <button onClick={() => viewUserDetails(user)} className="admin-user-dropdown-item">
                        👁️ View Details
                      </button>
                      <button onClick={() => viewUserActivity(user.user_id)} className="admin-user-dropdown-item">
                        📋 View Activity
                      </button>
                      <button onClick={() => toggleAdminStatus(user.user_id, user.is_admin)} className="admin-user-dropdown-item">
                        {user.is_admin ? "❌ Remove Admin" : "✅ Make Admin"}
                      </button>
                      <button onClick={() => toggleVerification(user.user_id, user.is_verified)} className="admin-user-dropdown-item">
                        {user.is_verified ? "❌ Unverify" : "✅ Verify"}
                      </button>
                      <button onClick={() => resetUserPassword(user.user_id, user.email)} className="admin-user-dropdown-item">
                        🔑 Send Reset Link
                      </button>
                      <button onClick={() => deleteUser(user.user_id, user.email)} className="admin-user-dropdown-item delete">
                        🗑️ Delete User
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>User Details</h2>
            <div className="user-details">
              <p><strong>ID:</strong> {selectedUser.user_id}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>First Name:</strong> {selectedUser.first_name || "Not set"}</p>
              <p><strong>Last Name:</strong> {selectedUser.last_name || "Not set"}</p>
              <p><strong>Username:</strong> {selectedUser.username || "Not set"}</p>
              <p><strong>Admin:</strong> {selectedUser.is_admin ? "Yes" : "No"}</p>
              <p><strong>Verified:</strong> {selectedUser.is_verified ? "Yes" : "No"}</p>
              <p><strong>Joined:</strong> {selectedUser.created_at || "N/A"}</p>
              <p><strong>Last Login:</strong> {selectedUser.last_login || "Never"}</p>
            </div>
            <button className="modal-close" onClick={() => setShowUserModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* User Activity Modal */}
      {showActivityModal && (
        <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>User Activity Log</h2>
            {userActivities.length === 0 ? (
              <p>No activity recorded.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Time</th><th>Action</th><th>Details</th></tr>
                </thead>
                <tbody>
                  {userActivities.map((activity, idx) => (
                    <tr key={idx}>
                      <td>{activity.created_at}</td>
                      <td>{activity.action}</td>
                      <td>{activity.details || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="modal-close" onClick={() => setShowActivityModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;