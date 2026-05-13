import { Link } from "react-router-dom";

function FuncFooter() {
  return (
    <footer className="func-footer">
      <div className="footer-links">
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/careers">Careers</Link>
        <Link to="/help">Help & FAQ</Link>
        <Link to="/terms">Terms of Use</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/cookies">Cookie Policy</Link>
      </div>
      <p className="copyright">&copy; {new Date().getFullYear()} GREY MATTER. All rights reserved.</p>
    </footer>
  );
}

export default FuncFooter;