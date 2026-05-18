import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { useModal } from "../../context/ModalContext";
import { apiRequest } from "../../utils/api";

import home from "../../assets/images/func-images/home.png";
import topics from "../../assets/images/func-images/subjects.png";
import profile from "../../assets/images/func-images/profile.png";
import logout from "../../assets/images/func-images/logout.png";

function FuncHeader({ showWarning = false }) {
  const { logout: logoutUser } = useContext(UserContext);
  const { showModal } = useModal();

  // Get exercise ID from URL if on exercise page
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
        await apiRequest(`/auth/logout`, {
          method: "POST",
        });
        logoutUser();
        window.location.href = "/";
      },
      () => {}
    );
  };

  // Fixed navigation - same on all pages
  const navLinks = [
    { name: "HOME", path: "/", icon: home },
    { name: "TOPICS", path: "/subjects", icon: topics },
    { name: "PROFILE", path: "/persona", icon: profile }
  ];

  return (
    <header className="func-header">
      <h1>GREY MATTER</h1>
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
        <button onClick={handleLogout} className="func-nav-links">
          <img src={logout} alt="LOGOUT" className="nav-img" />
          LOG OUT
        </button>
      </nav>
    </header>
  );
}

export default FuncHeader;