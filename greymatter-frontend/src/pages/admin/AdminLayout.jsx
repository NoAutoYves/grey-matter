import { Outlet, Link, useLocation } from "react-router-dom";
import styles from './AdminLayout.module.css';

function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Users", path: "/admin/users", icon: "👥" },
    { name: "Exercises", path: "/admin/exercises", icon: "📚" },
    { name: "Analytics", path: "/admin/analytics", icon: "📈" },
    { name: "Feedback", path: "/admin/feedback", icon: "💬" }
  ];

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>GREY MATTER</h1>
          <span className={styles.badge}>ADMIN PANEL</span>
        </div>
        <div className={styles.headerRight}>
          <Link to="/" className={styles.headerLink}>Home</Link>
          <Link to="/persona" className={styles.headerLink}>Profile</Link>
          <Link to="/logout" className={`${styles.headerLink} ${styles.headerLinkLogout}`}>Logout</Link>
        </div>
      </header>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <nav>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navLink} ${location.pathname === item.path ? styles.navLinkActive : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navText}>{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} GREY MATTER. All rights reserved.</p>
        <p className={styles.footerVersion}>Admin Panel v1.0</p>
      </footer>
    </div>
  );
}

export default AdminLayout;