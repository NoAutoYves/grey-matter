import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { useModal } from "../../context/ModalContext";
import { apiRequest } from "../../utils/api";
import SearchTrigger from "./SearchTrigger";
import BurgerMenu from "./BurgerMenu";

import home from "../../assets/images/func-images/home.png";
import topics from "../../assets/images/func-images/subjects.png";
import profile from "../../assets/images/func-images/profile.png";
import logout from "../../assets/images/func-images/logout.png";
import notesIcon from "../../assets/images/func-images/notes.png";

import '../../styles/HeaderFooter.css';
import '../../styles/BurgerMenu.css';

function FuncHeader({ showWarning = false }) {
  const { logout: logoutUser } = useContext(UserContext);
  const { showModal } = useModal();

  const getExerciseId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("exercise_id");
  };

  const handleNavigation = (e, path) => {
    if (showWarning) {
      e.preventDefault();
      const exerciseId = getExerciseId();

      showModal(
        "Your exercise progress will be lost. Are you sure you want to leave?",
        () => {
          if (exerciseId) {
            localStorage.removeItem(`exercise_progress_${exerciseId}`);
          }
          window.location.href = path;
        },
        () => {}
      );
    }
  };

  const handleLogout = () => {
    const exerciseId = getExerciseId();

    showModal(
      "Are you sure you want to log out?",
      async () => {
        if (exerciseId) {
          localStorage.removeItem(`exercise_progress_${exerciseId}`);
        }
        await apiRequest(`/auth/logout`, { method: "POST" });
        logoutUser();
        window.location.href = "/";
      },
      () => {}
    );
  };

  const navLinks = [
    { name: "HOME", path: "/", icon: home },
    { name: "TOPICS", path: "/subjects/", icon: topics },
    { name: "NOTES", path: "/notes/", icon: notesIcon },
    { name: "PROFILE", path: "/persona", icon: profile },
  ];

  const burgerItems = [
    { type: "link", path: "/", label: "HOME", icon: home, onClick: (e) => handleNavigation(e, "/") },
    { type: "link", path: "/subjects/", label: "TOPICS", icon: topics, onClick: (e) => handleNavigation(e, "/subjects/") },
    { type: "link", path: "/notes/", label: "NOTES", icon: notesIcon, onClick: (e) => handleNavigation(e, "/notes/") },
    { type: "link", path: "/persona", label: "PROFILE", icon: profile, onClick: (e) => handleNavigation(e, "/persona") },
    { type: "button", label: "LOG OUT", icon: logout, danger: true, onClick: handleLogout },
  ];

  return (
    <header className="func-header">
      <Link to="/" className="func-header-logo">
        <h1>GREY MATTER</h1>
      </Link>

      <nav className="func-header-nav">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className="func-nav-links"
            onClick={(e) => handleNavigation(e, link.path)}
          >
            <img src={link.icon} alt={link.name} className="header-nav-img" />
            {link.name}
          </Link>
        ))}
        <SearchTrigger className="func-nav-links" iconClassName="header-nav-img" />
        <button onClick={handleLogout} className="func-nav-links">
          <img src={logout} alt="LOGOUT" className="header-nav-img" />
          LOG OUT
        </button>
      </nav>

      <div className="header-mobile-actions">
        <SearchTrigger className="mobile-search-trigger" iconClassName="mobile-search-icon" />
        <BurgerMenu items={burgerItems} />
      </div>
    </header>
  );
}

export default FuncHeader;