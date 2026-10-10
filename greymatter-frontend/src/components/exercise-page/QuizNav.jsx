import "../../styles/exercise-page/QuizNav.css";

function QuizNav({ onPrev, onNext, currentQuestion, totalQuestions, showFeedback }) {
  return (
    <div className="quiz-nav">
      <button
        type="button"
        onClick={onPrev}
        className="nav-button"
        disabled={currentQuestion === 0 || showFeedback}
      >
        ⬅ Prev
      </button>
      <button
        type="button"
        onClick={onNext}
        className="nav-button"
        disabled={currentQuestion === totalQuestions - 1 || showFeedback}
      >
        Next ➡
      </button>
    </div>
  );
}

export default QuizNav;