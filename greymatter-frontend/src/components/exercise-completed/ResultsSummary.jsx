import "../../styles/exercise-completed/ResultsSummary.css";

function ResultsSummary({ score, total, percentage, formattedTime }) {
  return (
    <div className="results-summary">
      <div className="summary-box">
        <h3>Final Score</h3>
        <p>{score} / {total}</p>
      </div>
      <div className="summary-box">
        <h3>Percentage</h3>
        <p>{percentage}%</p>
      </div>
      <div className="summary-box">
        <h3>Time Taken</h3>
        <p>{formattedTime}</p>
      </div>
    </div>
  );
}

export default ResultsSummary;