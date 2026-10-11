import { Link } from "react-router-dom";
import { useContext } from "react";
import { useModal } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";
import { apiRequest } from "../../utils/api";
import SearchTrigger from "../functional-comps/SearchTrigger";
import "../../styles/landing-css/LandingNav.css";

import loginIcon from "../../assets/images/func-images/login.png";
import subjectIcon from "../../assets/images/func-images/subjects.png";
import profileIcon from "../../assets/images/func-images/profile.png";
import logoutIcon from "../../assets/images/func-images/logout.png";

function LandingNav() {
  const { showModal } = useModal();
  const { logout } = useContext(UserContext);

  const handleLogout = () => {
    showModal(
      "Are you sure you want to log out?",
      async () => {
        await apiRequest(`/auth/logout`, { method: "POST" });
        logout();
        window.location.href = "/";
      },
      () => {}
    );
  };

  return (
    <nav className="landing-nav">
      <Link to="/login"><img src={loginIcon} alt="Login" className="nav-img"/>LOGIN</Link>
      <Link to="/subjects/"><img src={subjectIcon} alt="Topics" className="nav-img"/>TOPICS</Link>
      <SearchTrigger className="landing-nav-search" label="SEARCH" />
      <Link to="/persona"><img src={profileIcon} alt="Profile" className="nav-img"/>PROFILE</Link>
      <button onClick={handleLogout}><img src={logoutIcon} alt="Logout" className="nav-img"/>LOGOUT</button>
    </nav>
  );
}

export default LandingNav;