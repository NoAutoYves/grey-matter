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
import AdUnit from "../components/functional-comps/AdUnit";

function LandingPage(){
    const { showModal } = useModal();
    const { logout } = useContext(UserContext);
    
    const handleLogout = () => {
        showModal(
            "Are you sure you want to log out?",
            async () => {
                await apiRequest(`/auth/logout`, {
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

        {/* AD 1 - BILLBOARD (970x250) - ABOVE NAV (PREMIUM) */}
        <div className="sponsor-container-list sponsor-top">
            <AdUnit adSlot="5743773116" />
        </div>

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

        {/* AD 2 - LARGE RECTANGLE (336x280) - BETWEEN SUBJECTS AND SOCIAL MEDIA */}
        <div className="sponsor-container-landing sponsor-billboard">
            <div className="sponsor-placeholder">
                Advertisement (Large Rectangle - 336x280)
            </div>
        </div>

        <SocialMedia/>

        {/* AD 3 - LEADERBOARD (728x90) - BEFORE FOOTER LINKS */}
        <div className="sponsor-container-landing sponsor-footer">
            <div className="sponsor-placeholder">
                Advertisement (Leaderboard - 728x90)
            </div>
        </div>

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