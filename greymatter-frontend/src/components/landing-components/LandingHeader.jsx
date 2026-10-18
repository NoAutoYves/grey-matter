import { useContext } from "react";
import { useModal } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";
import { apiRequest } from "../../utils/api";
import BurgerMenu from "../functional-comps/BurgerMenu";
import SearchTrigger from "../functional-comps/SearchTrigger";
import "../../styles/landing-css/LandingHeader.css";
import "../../styles/BurgerMenu.css";

import loginIcon from "../../assets/images/func-images/login.png";
import subjectIcon from "../../assets/images/func-images/subjects.png";
import profileIcon from "../../assets/images/func-images/profile.png";
import logoutIcon from "../../assets/images/func-images/logout.png";
import notesIcon from "../../assets/images/func-images/notes.png";

function LandingHeader() {
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

  const burgerItems = [
    { type: "link", path: "/login", label: "LOGIN", icon: loginIcon },
    { type: "link", path: "/subjects/", label: "TOPICS", icon: subjectIcon },
    { type: "link", path: "/notes/", label: "NOTES", icon: notesIcon },
    { type: "link", path: "/persona", label: "PROFILE", icon: profileIcon },
    { type: "button", label: "LOGOUT", icon: logoutIcon, danger: true, onClick: handleLogout },
  ];

  return (
    <header className="logo">
      <h1>GREY MATTER</h1>
      <div className="header-mobile-actions">
        <SearchTrigger className="mobile-search-trigger" iconClassName="mobile-search-icon" />
        <BurgerMenu items={burgerItems} />
      </div>
    </header>
  );
}

export default LandingHeader;