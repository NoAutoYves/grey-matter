import "../../styles/subjects/SubjectsSuccessGuide.css";

function SubjectsSuccessGuide() {
  return (
    <section className="success-guide">
      <h2>How to Use Grey Matter</h2>
      <div className="steps-grid">
        <div className="step">
          <span className="step-number">1</span>
          <h4>Read the notes first</h4>
          <p>Every topic has chapter notes on Grey Matter. Spend three minutes reading them before you start the exercise. You will get more out of the questions.</p>
        </div>
        <div className="step">
          <span className="step-number">2</span>
          <h4>Take the exercise</h4>
          <p>Answer all 10 questions. You will get immediate feedback on each one, so you know before you finish whether the topic is solid or shaky.</p>
        </div>
        <div className="step">
          <span className="step-number">3</span>
          <h4>Review what you got wrong</h4>
          <p>Scroll through the per-question breakdown on the results page. Focus on the questions you missed, not the ones you got right.</p>
        </div>
        <div className="step">
          <span className="step-number">4</span>
          <h4>Retake after a few days</h4>
          <p>Come back to the same exercise two or three days later. If you can hit 8 out of 10 on the retake, the topic is solid. If not, revisit the notes and try again.</p>
        </div>
      </div>
    </section>
  );
}

export default SubjectsSuccessGuide;