import { Link } from "react-router-dom";
import "../../styles/landing-css/LandingFooter.css";

function LandingFooter() {
  return (
    <footer>
      <div className="landing-footer-links">
        <Link to="/how-it-works/">How It Works</Link>
        <Link to="/about/">About</Link>
        <Link to="/contact/">Contact</Link>
        <Link to="/careers/">Careers</Link>
        <Link to="/help/">Help &amp; FAQ</Link>
        <Link to="/terms/">Terms</Link>
        <Link to="/privacy/">Privacy</Link>
        <Link to="/cookies/">Cookies</Link>
      </div>
      <p className="landing-copyright">&copy; {new Date().getFullYear()} GREY MATTER. All rights reserved.</p>
    </footer>
  );
}

export default LandingFooter;