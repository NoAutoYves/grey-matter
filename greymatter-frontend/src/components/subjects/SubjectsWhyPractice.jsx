import "../../styles/subjects/SubjectsWhyPractice.css";

import buildRetentionIcon from "../../assets/images/func-images/build_retention.png";
import identifyWeaknessesIcon from "../../assets/images/func-images/identify_weaknesses.png";
import buildConfidenceIcon from "../../assets/images/func-images/build_confidence.png";
import developSpeedIcon from "../../assets/images/func-images/develop_speed.png";

function SubjectsWhyPractice() {
  return (
    <section className="why-practice">
      <h2>What You Get on Grey Matter</h2>
      <div className="practice-grid">
        <div className="practice-card">
          <img src={buildRetentionIcon} alt="Instant feedback" className="practice-image" />
          <h4>10 Questions, Instant Feedback</h4>
          <p>Every exercise is exactly 10 multiple-choice questions. You see whether each answer is correct the moment you submit it, and the right answer is highlighted so you learn on the spot.</p>
        </div>
        <div className="practice-card">
          <img src={identifyWeaknessesIcon} alt="Per-question breakdown" className="practice-image" />
          <h4>Per-Question Breakdown</h4>
          <p>After the exercise, you get a full breakdown of every question: what you chose, what the correct answer was, and whether you got it right. No guessing where the marks went.</p>
        </div>
        <div className="practice-card">
          <img src={buildConfidenceIcon} alt="Chapter notes" className="practice-image" />
          <h4>Chapter Notes for Every Topic</h4>
          <p>Every topic has revision notes: definitions, key concepts, and worked examples. Read them before you start, keep them open while you answer, or come back to them after.</p>
        </div>
        <div className="practice-card">
          <img src={developSpeedIcon} alt="Retake unlimited" className="practice-image" />
          <h4>Retake, Unlimited</h4>
          <p>Every exercise can be retaken as many times as you want. Your best score is kept, every attempt is saved to your profile, and no exercise is ever locked after you complete it.</p>
        </div>
      </div>
    </section>
  );
}

export default SubjectsWhyPractice;