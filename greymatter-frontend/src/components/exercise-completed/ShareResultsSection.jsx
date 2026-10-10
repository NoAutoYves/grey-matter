import "../../styles/exercise-completed/ShareResultsSection.css";
import shareIcon from "../../assets/images/func-images/share-icon.png";

function ShareResultsSection({ onShare }) {
  return (
    <div className="share-results-section">
      <button
        type="button"
        className="share-results-btn"
        onClick={onShare}
      >
        <img
          src={shareIcon}
          alt=""
          className="share-results-icon"
          aria-hidden="true"
        />
        Share with your class
      </button>
      <p className="share-results-hint">
        Challenge a classmate to beat your score.
      </p>
    </div>
  );
}

export default ShareResultsSection;