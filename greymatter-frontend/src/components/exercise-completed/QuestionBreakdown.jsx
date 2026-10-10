import MathRenderer from "../functional-comps/MathRenderer";
import "../../styles/exercise-completed/QuestionBreakdown.css";

import correctIcon from "../../assets/images/func-images/correct-icon.png";
import incorrectIcon from "../../assets/images/func-images/incorrect-icon.png";

function QuestionBreakdown({ breakdown }) {
  return (
    <div className="results-breakdown">
      <h2>Question Breakdown</h2>
      <div className="breakdown-list">
        {breakdown.map((item, i) => (
          <div key={i} className="breakdown-item">
            <div className="question-header">
              <img
                src={item.isCorrect ? correctIcon : incorrectIcon}
                alt={item.isCorrect ? "Correct" : "Incorrect"}
                className="question-icon"
              />
              <span className="question-text">
                Q{i + 1}: <MathRenderer text={item.question} />
              </span>
            </div>
            <div className="answer-details">
              <p className={`your-answer ${item.isCorrect ? 'correct-text' : 'incorrect-text'}`}>
                You chose: <MathRenderer text={item.selected} />
              </p>
              <p className="correct-answer">
                Correct answer: <MathRenderer text={item.correct} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuestionBreakdown;