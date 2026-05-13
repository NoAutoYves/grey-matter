import LandingSubjects from "../components/Landing/LandingSubjects";
import SocialMedia from "../components/Landing/LandingSocialMedia";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { useModal } from "../context/ModalContext";
import { UserContext } from "../context/UserContext";
import { apiRequest } from "../utils/api";

import loginIcon from "../assets/images/func-images/login.png";
import subjectIcon from "../assets/images/func-images/subjects.png";
import profileIcon from "../assets/images/func-images/profile.png";
import logoutIcon from "../assets/images/func-images/logout.png";

function LandingPage(){
    const { showModal } = useModal();
    const { logout } = useContext(UserContext);
    
    const handleLogout = () => {
        showModal(
            "Are you sure you want to log out?",
            async () => {
                await apiRequest(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                    method: "POST",
                });
                logout();
                window.location.href = "/";
            },
            () => {}
        );
    };

    return(
        <>
        <div className="index-page">

        <nav className="landing-nav">
            <Link to="/login"><img src={loginIcon} alt="Login" className="nav-img"/>LOGIN</Link>
            <Link to="/subjects"><img src={subjectIcon} alt="Topics" className="nav-img"/>TOPICS</Link>
            <Link to="/persona"><img src={profileIcon} alt="Profile" className="nav-img"/>PROFILE</Link>
            <button onClick={handleLogout}><img src={logoutIcon} alt="Logout" className="nav-img" />LOGOUT</button>
        </nav>

        <header className="logo">
            <h1>GREY MATTER</h1>
        </header>

        <LandingSubjects/>

        <SocialMedia/>

        <footer>
            <div className="footer-links">
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/careers">Careers</Link>
                <Link to="/help">Help & FAQ</Link>
                <Link to="/terms">Terms of Use</Link>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/cookies">Cookie Policy</Link>
            </div>
            <p className="copyright">&copy; {new Date().getFullYear()} GREY MATTER. ALL RIGHTS RESERVED.</p>
        </footer>

        </div>
        </>
    );
}

export default LandingPage;