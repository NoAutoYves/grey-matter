import { Link } from "react-router-dom";
import "../../styles/exercise-completed/ResultsActions.css";

function ResultsActions() {
  return (
    <div className="results-actions">
      <Link to="/subjects/" className="action-btn">Try Another Exercise</Link>
      <Link to="/persona" className="action-btn">View Profile</Link>
      <Link to="/" className="action-btn">Return Home</Link>
    </div>
  );
}

export default ResultsActions;