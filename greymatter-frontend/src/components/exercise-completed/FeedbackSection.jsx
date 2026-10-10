import { useState } from "react";
import { api } from "../../utils/api";
import "../../styles/exercise-completed/FeedbackSection.css";
import writingIcon from "../../assets/images/func-images/writing-icon.png";

function FeedbackSection({ exerciseId, score, total, timeTaken }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const submitFeedback = async () => {
    if (rating === 0) {
      setFeedbackError("Please select a rating");
      return;
    }

    setFeedbackError("");

    try {
      const response = await api.post('/api/feedback', {
        exercise_id: exerciseId,
        rating: rating,
        feedback: feedbackText,
        score: score,
        total_questions: total,
        time_taken_seconds: timeTaken
      });

      if (response.ok) {
        setFeedbackSubmitted(true);
        setTimeout(() => {
          setShowFeedback(false);
          setFeedbackSubmitted(false);
        }, 3000);
      } else {
        const data = await response.json();
        setFeedbackError(data.error || "Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setFeedbackError("Network error. Please try again.");
    }
  };

  if (feedbackSubmitted) {
    return (
      <div className="feedback-thanks">
        <span>✅</span> Thanks for your feedback! It helps us improve.
      </div>
    );
  }

  return (
    <div className="feedback-section">
      <button
        onClick={() => setShowFeedback(!showFeedback)}
        className="feedback-toggle-btn"
      >
        <img
          src={writingIcon}
          alt="Rate this exercise"
          className="feedback-icon"
        />
        {showFeedback ? "− Hide Feedback" : "Rate This Exercise"}
      </button>

      {showFeedback && (
        <div className="feedback-form">
          <h4>How was this exercise?</h4>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`star ${(hoverRating || rating) >= star ? 'active' : ''}`}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            placeholder="What did you think? Suggestions for improvement? (Optional)"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows="3"
          />
          {feedbackError && <p className="feedback-error">{feedbackError}</p>}
          <button onClick={submitFeedback} className="submit-feedback-btn">
            Submit Feedback
          </button>
        </div>
      )}
    </div>
  );
}

export default FeedbackSection;