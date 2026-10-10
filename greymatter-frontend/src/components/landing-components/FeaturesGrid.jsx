import "../../styles/landing-css/FeaturesGrid.css";

import comprehensiveSubjectsIcon from "../../assets/images/func-images/comprehensive_subjects.png";
import engagingExercisesIcon from "../../assets/images/func-images/engaging_exercises.png";
import progressTrackingIcon from "../../assets/images/func-images/progress_tracking.png";
import examPrepIcon from "../../assets/images/func-images/exam_prep.png";

function FeaturesGrid() {
  return (
    <section className="features-grid">
      <div className="feature-card">
        <img src={comprehensiveSubjectsIcon} alt="8 Comprehensive Subjects" className="feature-icon-img" />
        <h3>8 Comprehensive Subjects</h3>
        <p>From Commerce and Science to Mathematics, covering the full high school curriculum with focused, interactive exercises designed to build deep understanding.</p>
      </div>
      <div className="feature-card">
        <img src={engagingExercisesIcon} alt="Engaging Exercises" className="feature-icon-img" />
        <h3>Engaging Exercises</h3>
        <p>Each exercise features 10 carefully crafted questions with detailed solutions and instant feedback to reinforce learning and address misconceptions.</p>
      </div>
      <div className="feature-card">
        <img src={progressTrackingIcon} alt="Progress Tracking" className="feature-icon-img" />
        <h3>Progress Tracking</h3>
        <p>Monitor your performance, review past results, save notes for future reference, and watch your understanding grow over time with clear metrics.</p>
      </div>
      <div className="feature-card">
        <img src={examPrepIcon} alt="Exam Preparation" className="feature-icon-img" />
        <h3>Exam Preparation</h3>
        <p>Practice questions mirror exam-style formats, helping you build the confidence and skills needed to excel in your assessments and final exams.</p>
      </div>
    </section>
  );
}

export default FeaturesGrid;