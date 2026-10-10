import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ExerciseHeader from "../functional-comps/ExerciseHeader";
import FuncFooter from "../functional-comps/FuncFooter";
import NotesSection from "./NotesSection";
import "../../styles/exercise-page/Exercise.css";
import "../../styles/exercise-page/QuizInfoRow.css";
import "../../styles/exercise-page/QuestionCard.css";
import "../../styles/exercise-page/QuestionOptions.css";
import "../../styles/exercise-page/NotesSection.css";

function ExerciseSkeleton({ exerciseId, subject }) {
  return (
    <div className="quiz-page">
      <ExerciseHeader />
      <div className="main-layout">
        <section className="quiz-container">
          <div className="quiz-info-row">
            <div className="info-box"><h4>Score</h4><Skeleton /></div>
            <div className="info-box"><h4>Progress</h4><Skeleton /></div>
            <div className="info-box"><h4>Timer</h4><Skeleton /></div>
          </div>
          <div className="quiz-box">
            <Skeleton height={80} />
            <div className="options-grid">
              <Skeleton count={4} height={50} style={{ marginBottom: "10px" }} />
            </div>
          </div>
        </section>
        <NotesSection exerciseId={exerciseId} subject={subject} />
      </div>
      <FuncFooter />
    </div>
  );
}

export default ExerciseSkeleton;