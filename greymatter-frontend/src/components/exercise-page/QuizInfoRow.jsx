import "../../styles/exercise-page/QuizInfoRow.css";

function QuizInfoRow({ score, progress, time }) {
  return (
    <div className="quiz-info-row">
      <div className="info-box"><h4>Score</h4><p>{score}</p></div>
      <div className="info-box"><h4>Progress</h4><p>{progress}</p></div>
      <div className="info-box"><h4>Timer</h4><p>{time}</p></div>
    </div>
  );
}

export default QuizInfoRow;