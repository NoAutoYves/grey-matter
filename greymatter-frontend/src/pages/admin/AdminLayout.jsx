import { useState, useEffect, useContext } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { apiRequest } from "../../utils/api";
import styles from './AdminLayout.module.css';
import "./Admin.css";

const NAV = [
  { name: "Dashboard", path: "/admin", icon: "◧" },
  { name: "Users", path: "/admin/users", icon: "◉" },
  { name: "Exercises", path: "/admin/exercises", icon: "▤" },
  { name: "Analytics", path: "/admin/analytics", icon: "◫" },
  { name: "Feedback", path: "/admin/feedback", icon: "◐" },
];

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(UserContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    try { await apiRequest('/auth/logout', { method: 'POST' }); } catch {}
    logout();
    navigate('/', { replace: true });
  };

  const isActive = (path) =>
    path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  return (
    <div className={styles.layout}>
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <Link to="/admin" className={styles.brandLink}>
            <span className={styles.brandName}>GREY MATTER</span>
            <span className={styles.brandBadge}>Admin</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          {NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${isActive(item.path) ? styles.navActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className={styles.footer}>
          <Link to="/" className={styles.footerLink}><span>⌂</span>Back to site</Link>
          <Link to="/persona" className={styles.footerLink}><span>◉</span>My profile</Link>
          <button type="button" onClick={handleLogout} className={`${styles.footerLink} ${styles.danger}`}>
            <span>⏻</span>Logout
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.mobileBar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <span className={styles.mobileTitle}>GREY MATTER Admin</span>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;