import "../../styles/landing-css/WhyGreymatter.css";

import realPracticeIcon from "../../assets/images/func-images/real_practice.png";
import instantFeedbackIcon from "../../assets/images/func-images/instant_feedback.png";
import saveAndReviewIcon from "../../assets/images/func-images/save_and_review.png";
import alwaysFreeIcon from "../../assets/images/func-images/always_free.png";

function WhyGreymatter() {
  return (
    <section className="why-greymatter">
      <div className="why-container">
        <h2>Why Students Choose Grey Matter</h2>
        <div className="why-grid">
          <div className="why-item">
            <img src={realPracticeIcon} alt="Real Practice" className="why-icon-img" />
            <div>
              <h4>Real Practice for Real Results</h4>
              <p>Every exercise is designed to prepare you for actual tests and exams. You'll encounter questions that challenge your understanding and help you build the skills you need to succeed in the classroom and beyond.</p>
            </div>
          </div>
          <div className="why-item">
            <img src={instantFeedbackIcon} alt="Instant Feedback" className="why-icon-img" />
            <div>
              <h4>Instant Feedback That Teaches</h4>
              <p>Know exactly what you got wrong - and why, right away. Our detailed feedback helps you learn from mistakes, correct misconceptions, and reinforce what you've learned.</p>
            </div>
          </div>
          <div className="why-item">
            <img src={saveAndReviewIcon} alt="Save and Review" className="why-icon-img" />
            <div>
              <h4>Save and Review What You Learn</h4>
              <p>Take notes on every exercise and store them for later review. Revisit challenging topics, track your progress, and build a personalized study resource that grows with you.</p>
            </div>
          </div>
          <div className="why-item">
            <img src={alwaysFreeIcon} alt="Always Free" className="why-icon-img" />
            <div>
              <h4>Always Free, Always Accessible</h4>
              <p>No paywalls, no subscriptions, no hidden fees. Every subject, every exercise, every feature is available to every student at no cost - because learning should never be a privilege.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyGreymatter;