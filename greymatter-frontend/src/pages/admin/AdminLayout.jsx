import { NavLink, Outlet, Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/AdminLayout.css";

function AdminLayout() {
  const { logout } = useContext(UserContext);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const linkClass = ({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h2>Grey Matter</h2>
          <span>Admin</span>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={linkClass}>Dashboard</NavLink>
          <NavLink to="/admin/users" className={linkClass}>Users</NavLink>
          <NavLink to="/admin/exercises" className={linkClass}>Exercises</NavLink>
          <NavLink to="/admin/analytics" className={linkClass}>Analytics</NavLink>
          <NavLink to="/admin/activity" className={linkClass}>Activity</NavLink>
          <NavLink to="/admin/feedback" className={linkClass}>Feedback</NavLink>
          <NavLink to="/admin/errors" className={linkClass}>Errors</NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-link">← Back to site</Link>
          <button className="admin-nav-link admin-nav-logout" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;