import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { apiRequest } from "../utils/api";

function ViewResults() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const exerciseId = queryParams.get("exercise_id");
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(1);
  const [timeTaken, setTimeTaken] = useState(0);
  const [notes, setNotes] = useState("");
  const [breakdown, setBreakdown] = useState([]);

  const formatTimeFromSeconds = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await apiRequest(`${import.meta.env.VITE_API_URL}/api/results/${exerciseId}`);
        const data = await response.json();
        
        if (response.ok) {
          setScore(data.score);
          setTotal(data.total_questions);
          setTimeTaken(data.time_taken_seconds || 0);
          setNotes(data.notes || "No notes taken.");
          setBreakdown(data.breakdown || []);
        } else {
          console.error("Failed to fetch results:", data.error);
        }
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (exerciseId) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [exerciseId]);

  if (loading) {
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

        <div className="results-breakdown">
          <h2>Question Breakdown</h2>
          {breakdown.length > 0 ? (
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
          ) : (
            <p>No breakdown available.</p>
          )}
        </div>

        <div className="results-notes">
          <h2>Your Notes</h2>
          <pre>{notes}</pre>
        </div>
        
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

export default ViewResults;