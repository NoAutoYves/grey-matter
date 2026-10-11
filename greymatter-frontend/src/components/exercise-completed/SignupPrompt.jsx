import { Link } from "react-router-dom";
import "../../styles/exercise-completed/SignupPrompt.css";

function SignupPrompt() {
  return (
    <div className="signup-prompt">
      <div className="signup-prompt-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      </div>
      <div className="signup-prompt-body">
        <h3 className="signup-prompt-title">Nice work!</h3>
        <p className="signup-prompt-text">
          Sign up free to save this score, track your progress over time, and access your exercise history from any device.
        </p>
        <div className="signup-prompt-actions">
          <Link to="/signup" className="signup-prompt-btn-primary">Sign up free</Link>
          <Link to="/login" className="signup-prompt-btn-secondary">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPrompt;