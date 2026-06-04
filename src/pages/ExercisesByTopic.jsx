import { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import { UserContext } from "../context/UserContext";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import SocialMedia from "../components/Landing/LandingSocialMedia";
import { apiRequest } from "../utils/api";

function ExercisesByTopic() {
  const { subject, topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicName, setTopicName] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await apiRequest(`/api/exercises/${subject}/topic/${topicId}`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok) {
          setExercises(data.exercises || []);
          setTopicName(data.topic_name || "");
        }
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchExercises();
    } else {
      setLoading(false);
    }
  }, [subject, topicId, user]);

  const handleRetake = (exerciseId) => {
    localStorage.removeItem("finalScore");
    localStorage.removeItem("breakdown");
    localStorage.removeItem("notes");
    localStorage.removeItem("timeTaken");
    localStorage.removeItem("totalQuestions");
    setOpenDropdown(null);
  };

  const toggleDropdown = (exerciseId) => {
    if (openDropdown === exerciseId) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(exerciseId);
    }
  };

  if (loading) {
    return (
      <div className="quiz-list-page">
        <FuncHeader />
        <section className="quiz-list-container">
          <Skeleton width={200} height={30} />
          <Skeleton width={180} height={20} style={{ marginBottom: '20px' }} />
          <Skeleton count={6} height={60} style={{ marginBottom: '10px' }} />
        </section>
        <FuncFooter />
      </div>
    );
  }

  return (
    <div className={`quiz-list-page ${subject}`}>
      <FuncHeader />
      
      <div className="sponsor-container-list sponsor-top">
        <div className="sponsor-placeholder">
          Advertisement
        </div>
      </div>
      
      <section className="quiz-list-container">
        <button className="back-button" onClick={() => navigate(`/${subject}`)}>
          ← Back to Topics
        </button>
        
        <h2 className="quiz-list-title">{topicName}</h2>
        <p className="quiz-list-subtitle">Select an exercise to begin:</p>

        {exercises.length > 0 ? (
          <ul className="quiz-list">
            {exercises.map((exercise) => (
              <li 
                key={exercise.exercise_id} 
                className={`quiz-item ${exercise.completed ? 'completed' : 'not-taken'}`}
              >
                {exercise.completed ? (
                  <div className="quiz-completed-actions">
                    <span className="quiz-title">{exercise.exercise_title}</span>
                    <div className="dropdown-container">
                      <button 
                        className="actions-btn"
                        onClick={() => toggleDropdown(exercise.exercise_id)}
                      >
                        Actions ▼
                      </button>
                      {openDropdown === exercise.exercise_id && (
                        <div className="dropdown-menu">
                          <Link 
                            to={`/${subject}/exercise?exercise_id=${exercise.exercise_id}`} 
                            className="dropdown-item"
                            onClick={() => handleRetake(exercise.exercise_id)}
                          >
                            Retake
                          </Link>
                          <Link 
                            to={`/view-results?exercise_id=${exercise.exercise_id}`} 
                            className="dropdown-item"
                            onClick={() => setOpenDropdown(null)}
                          >
                            View Results
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link to={`/${subject}/exercise?exercise_id=${exercise.exercise_id}`} className="quiz-link">
                    <span className="quiz-title">{exercise.exercise_title}</span>
                    <span className="quiz-status">Not Taken</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-quizzes">No exercises available for this topic yet.</p>
        )}
      </section>

      <SocialMedia />
      
      <div className="sponsor-container-list sponsor-billboard">
        <div className="sponsor-placeholder">
          Advertisement
        </div>
      </div>
      
      <FuncFooter />
    </div>
  );
}

export default ExercisesByTopic;