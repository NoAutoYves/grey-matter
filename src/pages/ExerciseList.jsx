import { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import { UserContext } from "../context/UserContext";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import SocialMedia from "../components/Landing/LandingSocialMedia";
import { apiRequest } from "../utils/api";

function ExerciseList() {
  const { subject } = useParams();
  const { user } = useContext(UserContext);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await apiRequest(`/api/exercises/${subject}`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok) {
          setGrades(data.grades || []);
          setSubjectName(data.subject_name);
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
  }, [subject, user]);

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
      
      {/* AD 1 - TOP LEADERBOARD */}
      <div className="sponsor-container-list sponsor-top">
        <div className="sponsor-placeholder">
          Advertisement
        </div>
      </div>
      
      <section className="quiz-list-container">
        <h2 className="quiz-list-title">{subjectName} Exercises</h2>
        <p className="quiz-list-subtitle">Available exercises for this subject:</p>

        {grades.length > 0 ? (
          grades.map((gradeGroup) => (
            <div key={gradeGroup.grade_level} className="grade-section">
              <h3 className="grade-title">{gradeGroup.grade_display}</h3>
              
              {/* Loop through topics within the grade */}
              {gradeGroup.topics && gradeGroup.topics.map((topic) => (
                <div key={topic.topic_id} className="topic-section">
                  <h4 className="topic-title">{topic.topic_name}</h4>
                  <ul className="quiz-list">
                    {topic.exercises.map((exercise) => (
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
                </div>
              ))}
              
              {/* LEADERBOARD AD AFTER EVERY GRADE */}
              <div className="sponsor-container-list sponsor-leaderboard">
                <div className="sponsor-placeholder">
                  Advertisement
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-quizzes">No exercises available for this subject yet.</p>
        )}
      </section>

      <SocialMedia />
      {/* BILLBOARD AD AFTER SOCIAL MEDIA */}
      <div className="sponsor-container-list sponsor-billboard">
          <div className="sponsor-placeholder">
              Advertisement
          </div>
      </div>
      <FuncFooter />
    </div>
  );
}

export default ExerciseList;