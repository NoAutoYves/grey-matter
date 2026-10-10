import MathRenderer from "../functional-comps/MathRenderer";
import QuestionOptions from "./QuestionOptions";
import QuizNav from "./QuizNav";
import { BASE_URL } from "../../utils/api";
import "../../styles/exercise-page/QuestionCard.css";

function QuestionCard({
  currentQ,
  userAnswer,
  showFeedback,
  isCorrectAnswer,
  onSelect,
  onPrev,
  onNext,
  currentQuestion,
  totalQuestions,
}) {
  return (
    <div className="quiz-box">
      <h2><MathRenderer text={currentQ.question_text} /></h2>

      {currentQ.image_url && (
        <div className="question-image-container">
          <img
            src={`${BASE_URL}${currentQ.image_url}`}
            alt="Question diagram"
            className="question-image"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      <QuestionOptions
        options={currentQ.options}
        correctAnswer={currentQ.correct_answer}
        userAnswer={userAnswer}
        showFeedback={showFeedback}
        isCorrectAnswer={isCorrectAnswer}
        onSelect={onSelect}
      />

      <QuizNav
        onPrev={onPrev}
        onNext={onNext}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        showFeedback={showFeedback}
      />
    </div>
  );
}

export default QuestionCard;