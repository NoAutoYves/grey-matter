import "../../styles/exercise-list/ListHowItWorks.css";

function ListHowItWorks() {
  return (
    <section className="list-how-it-works">
      <h2>How to Use These Exercises</h2>
      <div className="list-steps-row">
        <div className="list-step-item">
          <span className="list-step-num">1</span>
          <p>Read the chapter notes</p>
        </div>
        <span className="list-step-arrow">→</span>
        <div className="list-step-item">
          <span className="list-step-num">2</span>
          <p>Answer the 10 questions</p>
        </div>
        <span className="list-step-arrow">→</span>
        <div className="list-step-item">
          <span className="list-step-num">3</span>
          <p>Review the breakdown</p>
        </div>
        <span className="list-step-arrow">→</span>
        <div className="list-step-item">
          <span className="list-step-num">4</span>
          <p>Retake in a few days</p>
        </div>
      </div>
      <p className="list-learning-note">
        Most learners need two or three passes through a topic before it sticks. Read the notes, take the exercise, review the per-question breakdown, then come back to the same exercise in two or three days. If you can hit 8 out of 10 on the retake, the topic is solid.
      </p>
    </section>
  );
}

export default ListHowItWorks;