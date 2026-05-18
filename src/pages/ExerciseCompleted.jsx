import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { apiRequest } from "../utils/api";

function ExerciseCompleted() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const exerciseId = queryParams.get("exercise_id");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(true);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(1);
  const [timeTaken, setTimeTaken] = useState(0);
  const [notes, setNotes] = useState("");
  const [breakdown, setBreakdown] = useState([]);
  const [saveError, setSaveError] = useState(false);
  
  // Feedback states
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  // Format seconds to MM:SS
  const formatTimeFromSeconds = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const submitFeedback = async () => {
    if (rating === 0) {
      setFeedbackError("Please select a rating");
      return;
    }
    
    setFeedbackError("");
    
    try {
      const response = await apiRequest(`/api/feedback`, {
        method: "POST",
        body: JSON.stringify({
          exercise_id: exerciseId,
          rating: rating,
          feedback: feedbackText,
          score: score,
          total_questions: total,
          time_taken_seconds: timeTaken
        })
      });
      
      if (response.ok) {
        setFeedbackSubmitted(true);
        setTimeout(() => {
          setShowFeedback(false);
          setFeedbackSubmitted(false);
        }, 3000);
      } else {
        setFeedbackError("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setFeedbackError("Network error. Please try again.");
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Check if already saved in this session
    const hasSaved = sessionStorage.getItem(`exercise_saved_${exerciseId}`);
    
    if (hasSaved === "true") {
      // Just load data without saving
      const storedScore = parseInt(localStorage.getItem("finalScore")) || 0;
      const storedTotal = parseInt(localStorage.getItem("totalQuestions")) || 1;
      const storedTime = parseInt(localStorage.getItem("timeTaken")) || 0;
      const storedNotes = localStorage.getItem("notes") || "No notes taken.";
      const storedBreakdown = JSON.parse(localStorage.getItem("breakdown")) || [];

      setScore(storedScore);
      setTotal(storedTotal);
      setTimeTaken(storedTime);
      setNotes(storedNotes);
      setBreakdown(storedBreakdown);
      setSaving(false);
      setLoading(false);
      return;
    }

    const storedScore = parseInt(localStorage.getItem("finalScore")) || 0;
    const storedTotal = parseInt(localStorage.getItem("totalQuestions")) || 1;
    const storedTime = parseInt(localStorage.getItem("timeTaken")) || 0;
    const storedNotes = localStorage.getItem("notes") || "No notes taken.";
    const storedBreakdown = JSON.parse(localStorage.getItem("breakdown")) || [];

    setScore(storedScore);
    setTotal(storedTotal);
    setTimeTaken(storedTime);
    setNotes(storedNotes);
    setBreakdown(storedBreakdown);
    
    // Save results to database with retry logic
    const saveResults = async (retryCount = 0) => {
      const maxRetries = 3;
      
      try {
        const response = await apiRequest(`/api/exercise/save-results`, {
          method: "POST",
          body: JSON.stringify({
            exercise_id: exerciseId,
            score: storedScore,
            total_questions: storedTotal,
            time_taken_seconds: storedTime,
            notes: storedNotes,
            answers: {}
          })
        });
        
        if (response.ok && isMounted) {
          // Verify the response contains success
          const result = await response.json();
          if (result.success === true) {
            // Only mark as saved after successful DB save and confirmation
            sessionStorage.setItem(`exercise_saved_${exerciseId}`, "true");
            console.log("Results saved successfully");
            setSaveError(false);
          } else {
            throw new Error("Save failed - server returned error");
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Save attempt ${retryCount + 1} failed:`, error);
        
        if (retryCount < maxRetries - 1 && isMounted) {
          // Wait longer between retries (1s, 2s, 3s)
          const delay = (retryCount + 1) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          setTimeout(() => saveResults(retryCount + 1), delay);
        } else if (isMounted) {
          // All retries failed
          console.error("Failed to save results after all retries");
          setSaveError(true);
        }
      } finally {
        if (isMounted && !sessionStorage.getItem(`exercise_saved_${exerciseId}`)) {
          // Only set saving false if we're not waiting for a save that hasn't happened yet
          // Wait a bit before giving up
          setTimeout(() => {
            if (isMounted && !sessionStorage.getItem(`exercise_saved_${exerciseId}`)) {
              setSaving(false);
              setLoading(false);
            }
          }, 2000);
        } else if (isMounted) {
          setSaving(false);
          setLoading(false);
        }
      }
    };
    
    saveResults();
    
    return () => {
      isMounted = false;
    };
  }, [exerciseId]);

  if (loading || saving) {
    return (
      <div className="results-page">
        <FuncHeader />
        <section className="results-container">
          <Skeleton width={200} height={30} />
          <Skeleton width={150} height={20} style={{ marginBottom: '20px' }} />
          <div className="results-summary">
            <Skeleton count={3} height={80} style={{ marginRight: '10px' }} />
          </div>
          <Skeleton height={20} style={{ marginBottom: '10px' }} />
          <Skeleton height={150} style={{ marginBottom: '20px' }} />
          <Skeleton count={3} height={50} style={{ marginBottom: '10px' }} />
        </section>
        <FuncFooter />
      </div>
    );
  }

  const percentage = Math.round((score / total) * 100);
  const formattedTime = formatTimeFromSeconds(timeTaken);

  return (
    <div className="results-page">
      <FuncHeader />
      
      <section className="results-container">
        <h2 className="results-title">Exercise Completed</h2>
        <p className="results-subtitle">Here’s how you did:</p>

        {/* Save Error Warning */}
        {saveError && (
          <div className="save-error-warning">
            <span>⚠️</span> Your results may not have been saved. Please contact support if this persists.
          </div>
        )}

        {/* Score Summary */}
        <div className="results-summary">
          <div className="summary-box">
            <h3>Final Score</h3>
            <p>{score} / {total}</p>
          </div>
          <div className="summary-box">
            <h3>Percentage</h3>
            <p>{percentage}%</p>
          </div>
          <div className="summary-box">
            <h3>Time Taken</h3>
            <p>{formattedTime}</p>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="results-breakdown">
          <h2>Question Breakdown</h2>
          <div className="breakdown-list">
            {breakdown.map((item, i) => (
              <div key={i} className="breakdown-item">
                <div className="question-header">
                  <span className="question-icon">{item.isCorrect ? "✅" : "❌"}</span>
                  <span className="question-text">Q{i + 1}: {item.question}</span>
                </div>
                <div className="answer-details">
                  <p className={`your-answer ${item.isCorrect ? 'correct-text' : 'incorrect-text'}`}>
                    You chose: {item.selected}
                  </p>
                  <p className="correct-answer">
                    Correct answer: {item.correct}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="results-notes">
          <h2>Your Notes</h2>
          <pre>{notes}</pre>
        </div>
        
        {/* Feedback Section */}
        {!feedbackSubmitted ? (
          <div className="feedback-section">
            <button 
              onClick={() => setShowFeedback(!showFeedback)} 
              className="feedback-toggle-btn"
            >
              {showFeedback ? "− Hide Feedback" : "📝 Rate This Exercise"}
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
        ) : (
          <div className="feedback-thanks">
            <span>✅</span> Thanks for your feedback! It helps us improve.
          </div>
        )}
        
        {/* Next Actions */}
        <div className="results-actions">
          <Link to="/subjects" className="action-btn">Try Another Exercise</Link>
          <Link to="/persona" className="action-btn">View Profile</Link>
          <Link to="/" className="action-btn">Return Home</Link>
        </div>
      </section>
      
      <FuncFooter />
    </div>
  );
}

export default ExerciseCompleted;