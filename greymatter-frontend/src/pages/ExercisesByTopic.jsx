import { useState, useEffect, useContext, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import { UserContext } from "../context/UserContext";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import SocialMedia from "../components/functional-comps/LandingSocialMedia";
import { apiRequest } from "../utils/api";
import '../styles/exercises-by-topic/ExercisesByTopic.css';
import '../styles/exercises-by-topic/QuizActionsMenu.css';
import '../styles/exercises-by-topic/QuizList.css';

function ExercisesByTopic() {
  const { subject, topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicName, setTopicName] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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

    fetchExercises();
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

  const subjectDisplay = subject
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

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
      <Helmet htmlAttributes={{ lang: "en-ZA" }}>
        <title>{topicName ? `${topicName} | Grey Matter` : "Topic | Grey Matter"}</title>
        <meta
          name="description"
          content={
            topicName
              ? `Practice exercises for ${topicName} on Grey Matter. 5 exercises, 10 questions each, with instant feedback and full chapter notes.`
              : "Practice exercises on Grey Matter."
          }
        />
        <meta name="theme-color" content="#6846ff" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://greymatterschool.co.za/${subject}/topic/${topicId}/`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": topicName ? `${topicName} | Grey Matter` : "Topic | Grey Matter",
            "url": `https://greymatterschool.co.za/${subject}/topic/${topicId}/`,
            "about": topicName || subject,
            "inLanguage": "en-ZA"
          })}
        </script>
      </Helmet>
      
      <FuncHeader />

      <section className="quiz-list-container">
        <button className="back-button" onClick={() => navigate(`/${subject}/`)}>
           Back to Topics
        </button>

        <p className="quiz-list-overline">{subjectDisplay}</p>
        <h2 className="quiz-list-title">{topicName}</h2>
        <p className="quiz-list-subtitle">
          {exercises.length > 0
            ? `${exercises.length} ${exercises.length === 1 ? 'exercise' : 'exercises'}, 10 questions each. Read the notes, take the exercise, retake after a few days.`
            : 'Select an exercise to begin.'}
        </p>

        {exercises.length > 0 ? (
          <ul className="quiz-list">
            {exercises.map((exercise, index) => {
              const number = String(index + 1).padStart(2, '0');
              return (
                <li
                  key={exercise.exercise_id}
                  className={`quiz-item ${exercise.completed ? 'completed' : 'not-taken'} ${openDropdown === exercise.exercise_id ? 'dropdown-open' : ''}`}
                >
                  {exercise.completed ? (
                    <div className="quiz-completed-actions">
                      <div className="quiz-item-row">
                        <span className="quiz-number">{number}</span>
                        <span className="quiz-title">{exercise.exercise_title}</span>
                      </div>
                      <div
                        className="dropdown-container"
                        ref={openDropdown === exercise.exercise_id ? dropdownRef : null}
                      >
                        <button
                          type="button"
                          className={`actions-btn ${openDropdown === exercise.exercise_id ? 'actions-btn-open' : ''}`}
                          onClick={() => toggleDropdown(exercise.exercise_id)}
                          aria-expanded={openDropdown === exercise.exercise_id}
                          aria-haspopup="menu"
                        >
                          <span className="actions-btn-label">Actions</span>
                          <span className="actions-chevron">▾</span>
                        </button>
                        {openDropdown === exercise.exercise_id && (
                          <div className="dropdown-menu" role="menu">
                            <Link
                              to={`/${subject}/exercise?exercise_id=${exercise.exercise_id}`}
                              className="dropdown-item"
                              role="menuitem"
                              onClick={() => handleRetake(exercise.exercise_id)}
                            >
                              <span className="dropdown-item-label">Retake</span>
                            </Link>
                            <Link
                              to={`/view-results?exercise_id=${exercise.exercise_id}`}
                              className="dropdown-item"
                              role="menuitem"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <span className="dropdown-item-label">View Results</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={`/${subject}/exercise?exercise_id=${exercise.exercise_id}`}
                      className="quiz-link"
                    >
                      <span className="quiz-number">{number}</span>
                      <span className="quiz-title">{exercise.exercise_title}</span>
                      <span className="quiz-status">Start</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="no-quizzes">No exercises available for this topic yet.</p>
        )}
      </section>

      <SocialMedia />
      <FuncFooter />
    </div>
  );
}

export default ExercisesByTopic;