import { Outlet, Link, useLocation } from "react-router-dom";

function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Users", path: "/admin/users", icon: "👥" },
    { name: "Exercises", path: "/admin/exercises", icon: "📚" },
    { name: "Analytics", path: "/admin/analytics", icon: "📈" }
  ];

  return (
    <div className="admin-layout">
      {/* Custom Admin Header */}
      <header className="admin-header-custom">
        <div className="admin-header-left">
          <h1>GREY MATTER</h1>
          <span className="admin-badge">ADMIN PANEL</span>
        </div>
        <div className="admin-header-right">
          <Link to="/" className="admin-header-link">Home</Link>
          <Link to="/persona" className="admin-header-link">Profile</Link>
          <Link to="/logout" className="admin-header-link logout">Logout</Link>
        </div>
      </header>

      <div className="admin-container">
        <aside className="admin-sidebar">
          <nav>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <footer className="admin-footer">
        <p>&copy; {new Date().getFullYear()} GREY MATTER. All rights reserved.</p>
        <p className="admin-footer-version">Admin Panel v1.0</p>
      </footer>
    </div>
  );
}

export default AdminLayout;