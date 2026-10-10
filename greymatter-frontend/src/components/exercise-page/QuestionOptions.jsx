import MathRenderer from "../functional-comps/MathRenderer";
import "../../styles/exercise-page/QuestionOptions.css";

function QuestionOptions({
  options,
  correctAnswer,
  userAnswer,
  showFeedback,
  isCorrectAnswer,
  onSelect,
}) {
  return (
    <div className="options-grid">
      {options.map((option, idx) => {
        const letter = String.fromCharCode(65 + idx);
        const isAnswered = userAnswer;
        const isSelected = isAnswered === letter;

        const showHighlight =
          showFeedback &&
          letter === correctAnswer &&
          !isSelected &&
          !isAnswered;

        const userAnswerClass =
          isSelected && isAnswered
            ? letter === correctAnswer
              ? "correct"
              : "incorrect"
            : "";

        const highlightClass =
          isAnswered &&
          letter === correctAnswer &&
          isAnswered !== correctAnswer
            ? "highlight"
            : "";

        const feedbackClass =
          showFeedback && isSelected && !isAnswered
            ? isCorrectAnswer
              ? "correct"
              : "incorrect"
            : "";

        return (
          <button
            key={idx}
            type="button"
            className={`option ${userAnswerClass} ${feedbackClass} ${highlightClass} ${showHighlight ? "highlight" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isAnswered && !showFeedback) onSelect(letter);
            }}
            disabled={!!isAnswered || showFeedback}
          >
            <MathRenderer text={option} />
          </button>
        );
      })}
    </div>
  );
}

export default QuestionOptions;