import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import FuncFooter from "../components/functional-comps/FuncFooter";
import ExerciseHeader from "../components/functional-comps/ExerciseHeader";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { api, BASE_URL } from "../utils/api";
import MathRenderer from "../components/functional-comps/MathRenderer";
import notesIcon from "../assets/images/func-images/notes-icon.png";
import '../styles/Exercise.css';

function Exercise() {
  const { subject } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const exerciseId = queryParams.get("exercise_id");

  const [exerciseData, setExerciseData] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState({});
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [chapterNotes, setChapterNotes] = useState(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [showFullNotes, setShowFullNotes] = useState(false);

  const timerRef = useRef(null);
  const notesRef = useRef(null);

  const answeredRef = useRef({});
  const currentQuestionRef = useRef(0);
  const scoreRef = useRef(0);
  const exerciseDataRef = useRef([]);
  const secondsElapsedRef = useRef(0);
  const finishedRef = useRef(false);

  useEffect(() => { answeredRef.current = answered; }, [answered]);
  useEffect(() => { currentQuestionRef.current = currentQuestion; }, [currentQuestion]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { exerciseDataRef.current = exerciseData; }, [exerciseData]);
  useEffect(() => { secondsElapsedRef.current = secondsElapsed; }, [secondsElapsed]);

  const saveProgress = () => {
    const progress = {
      answered: answeredRef.current,
      currentQuestion: currentQuestionRef.current,
      score: scoreRef.current,
      secondsElapsed: secondsElapsedRef.current,
      exerciseId,
      subject
    };
    localStorage.setItem(`exercise_progress_${exerciseId}`, JSON.stringify(progress));
  };

  const clearProgress = () => {
    localStorage.removeItem(`exercise_progress_${exerciseId}`);
  };

  useEffect(() => {
    const fetchNotes = async () => {
      if (!exerciseId || !subject) return;
      setNotesLoading(true);
      try {
        const response = await api.get(`/api/exercise/notes/${exerciseId}`);
        const data = await response.json();
        if (response.ok && data.notes) setChapterNotes(data.notes);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      } finally {
        setNotesLoading(false);
      }
    };
    fetchNotes();
  }, [exerciseId, subject]);

  const formatNotes = (text) => {
    if (!text) return null;
    return text.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return <br key={index} />;
      if (paragraph.startsWith('#') || paragraph.startsWith('Chapter') || paragraph.startsWith('Section')) {
        return <h3 key={index} className="notes-heading">{paragraph.replace(/^#+\s*/, '')}</h3>;
      }
      if (paragraph.startsWith('•') || paragraph.startsWith('-') || paragraph.startsWith('*')) {
        return <li key={index} className="notes-list-item">{paragraph.replace(/^[•\-\*]\s*/, '')}</li>;
      }
      return <p key={index} className="notes-paragraph">{paragraph}</p>;
    });
  };

  const getPreviewNotes = (text) => {
    if (!text) return '';
    const words = text.split(' ');
    let result = '';
    for (let i = 0; i < words.length; i++) {
      if ((result + words[i]).length > 150) break;
      result += (i === 0 ? '' : ' ') + words[i];
    }
    return result + '...';
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (Object.keys(answeredRef.current).length > 0 && !finishedRef.current) {
        e.preventDefault();
        e.returnValue = "Your exercise progress will be lost. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (exerciseId && exerciseData.length > 0 && Object.keys(answered).length > 0) {
      saveProgress();
    }
  }, [answered, currentQuestion, score, secondsElapsed, exerciseId, exerciseData.length]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = () => {
    const minutes = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
    const seconds = String(secondsElapsed % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await api.batch.getExerciseData(parseInt(exerciseId));
        const data = await response.json();
        if (response.ok) {
          const formattedQuestions = data.questions.map(q => ({
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            image_url: q.image_url || null,
            question_id: q.question_id
          }));
          setExerciseData(formattedQuestions);
          exerciseDataRef.current = formattedQuestions;
          setDataLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching exercise:", error);
      }
    };
    if (exerciseId) fetchExercise();
  }, [exerciseId]);

  const finishExercise = (finalAnswered, finalScore) => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const data = exerciseDataRef.current;
    const totalQuestions = data.length;
    const timeTaken = secondsElapsedRef.current;
    const notes = notesRef.current?.value || "";

    const breakdown = data.map((q, idx) => {
      const selected = finalAnswered[idx];
      const options = q.options;
      const selectedText = selected ? options[selected.charCodeAt(0) - 65] : "No answer";
      const correctLetter = q.correct_answer;
      const correctText = options[correctLetter.charCodeAt(0) - 65];
      return {
        question: q.question_text,
        selected: selectedText,
        correct: correctText,
        isCorrect: finalAnswered[idx] === q.correct_answer
      };
    });

    const formattedAnswers = Object.entries(finalAnswered)
      .map(([index, letter]) => {
        const qid = data[parseInt(index)]?.question_id;
        if (!qid) return null;
        return { question_id: qid, selected_option: letter };
      })
      .filter(Boolean);

    api.batch.submitExercise(
      parseInt(exerciseId),
      formattedAnswers,
      timeTaken,
      notes,
      breakdown
    ).catch(err => console.error("Error submitting exercise:", err));

    localStorage.setItem("finalScore", finalScore);
    localStorage.setItem("totalQuestions", totalQuestions);
    localStorage.setItem("timeTaken", timeTaken);
    localStorage.setItem("notes", notes);
    localStorage.setItem("breakdown", JSON.stringify(breakdown));

    clearProgress();
    navigate(`/exercise-completed?exercise_id=${exerciseId}`);
  };

  const handleAnswer = (selectedLetter, correctLetter) => {
    if (showFeedback) return;

    const qIndex = currentQuestionRef.current;

    if (answeredRef.current[qIndex]) return;

    const isCorrect = selectedLetter === correctLetter;
    setIsCorrectAnswer(isCorrect);
    setShowFeedback(true);

    const newAnswered = { ...answeredRef.current, [qIndex]: selectedLetter };
    answeredRef.current = newAnswered;
    setAnswered(newAnswered);

    let newScore = scoreRef.current;
    if (isCorrect) {
      newScore = newScore + 1;
      scoreRef.current = newScore;
      setScore(newScore);
    }

    setTimeout(() => {
      setShowFeedback(false);

      const total = exerciseDataRef.current.length;
      const answeredCount = Object.keys(newAnswered).length;

      if (answeredCount >= total) {
        finishExercise(newAnswered, newScore);
        return;
      }

      for (let i = qIndex + 1; i < total; i++) {
        if (!newAnswered[i]) {
          currentQuestionRef.current = i;
          setCurrentQuestion(i);
          return;
        }
      }

      for (let i = 0; i <= qIndex; i++) {
        if (!newAnswered[i]) {
          currentQuestionRef.current = i;
          setCurrentQuestion(i);
          return;
        }
      }
    }, 1000);
  };

  const handleNext = () => {
    if (showFeedback) return;
    setCurrentQuestion(prev => {
      const next = Math.min(prev + 1, exerciseDataRef.current.length - 1);
      currentQuestionRef.current = next;
      return next;
    });
  };

  const handlePrev = () => {
    if (showFeedback) return;
    setCurrentQuestion(prev => {
      const next = Math.max(prev - 1, 0);
      currentQuestionRef.current = next;
      return next;
    });
  };

  const handleNotesKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const textarea = notesRef.current;
      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPos);
      const textAfter = textarea.value.substring(cursorPos);
      textarea.value = textBefore + "\n• " + textAfter;
      textarea.selectionStart = textarea.selectionEnd = cursorPos + 3;
    }
  };

  if (exerciseData.length === 0) {
    return (
      <div className="quiz-page">
        <ExerciseHeader />
        <div className="main-layout">
          <section className="quiz-container">
            <div className="quiz-info-row">
              <div className="info-box"><h4>Score</h4><Skeleton /></div>
              <div className="info-box"><h4>Progress</h4><Skeleton /></div>
              <div className="info-box"><h4>Timer</h4><Skeleton /></div>
            </div>
            <div className="quiz-box">
              <Skeleton height={80} />
              <div className="options-grid">
                <Skeleton count={4} height={50} style={{ marginBottom: '10px' }} />
              </div>
            </div>
          </section>
          <aside className="notes-sidebar">
            <Skeleton height={200} />
          </aside>
        </div>
        <FuncFooter />
      </div>
    );
  }

  const currentQ = exerciseData[currentQuestion];
  const progress = `${currentQuestion + 1} / ${exerciseData.length}`;
  const hasAnswered = Object.keys(answered).length > 0;

  return (
    <div className="quiz-page">
      <ExerciseHeader hasAnswered={hasAnswered} />
      <div className="main-layout">
        <section className="quiz-container">
          <div className="quiz-info-row">
            <div className="info-box"><h4>Score</h4><p>{score}</p></div>
            <div className="info-box"><h4>Progress</h4><p>{progress}</p></div>
            <div className="info-box"><h4>Timer</h4><p>{formatTime()}</p></div>
          </div>

          <div className="quiz-box">
            <h2><MathRenderer text={currentQ.question_text} /></h2>

            {currentQ.image_url && (
              <div className="question-image-container">
                <img
                  src={`${BASE_URL}${currentQ.image_url}`}
                  alt="Question diagram"
                  className="question-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="options-grid">
              {currentQ.options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isAnswered = answered[currentQuestion];
                const isSelected = isAnswered === letter;
                const showHighlight = showFeedback && letter === currentQ.correct_answer && !isSelected && !isAnswered;
                const userAnswerClass = isSelected && isAnswered
                  ? (letter === currentQ.correct_answer ? 'correct' : 'incorrect')
                  : '';
                const highlightClass = (isAnswered && letter === currentQ.correct_answer && isAnswered !== currentQ.correct_answer) ? 'highlight' : '';
                const feedbackClass = showFeedback && isSelected && !isAnswered ? (isCorrectAnswer ? 'correct' : 'incorrect') : '';

                return (
                  <button
                    key={idx}
                    type="button"
                    className={`option ${userAnswerClass} ${feedbackClass} ${highlightClass} ${showHighlight ? 'highlight' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isAnswered && !showFeedback) {
                        setSelectedOption(letter);
                        handleAnswer(letter, currentQ.correct_answer);
                      }
                    }}
                    disabled={!!isAnswered || showFeedback}
                  >
                    <MathRenderer text={option} />
                  </button>
                );
              })}
            </div>
            <div className="quiz-nav">
              <button type="button" onClick={handlePrev} className="nav-button" disabled={currentQuestion === 0 || showFeedback}>⬅ Prev</button>
              <button type="button" onClick={handleNext} className="nav-button" disabled={currentQuestion === exerciseData.length - 1 || showFeedback}>Next ➡</button>
            </div>
          </div>
        </section>

        <aside className="notes-sidebar">
          <div className="notes-box">
            <div className="notes-header">
              <img src={notesIcon} alt="Notes" className="notes-icon" />
              <h4>Chapter Notes</h4>
            </div>

            {notesLoading ? (
              <Skeleton count={5} height={20} style={{ marginBottom: '10px' }} />
            ) : chapterNotes ? (
              <div className="chapter-notes-content">
                {chapterNotes.length > 300 ? (
                  <>
                    <div className="notes-preview">
                      {formatNotes(getPreviewNotes(chapterNotes))}
                    </div>
                    {showFullNotes && (
                      <div className="notes-full">
                        {formatNotes(chapterNotes)}
                      </div>
                    )}
                    <button
                      className="notes-toggle-btn"
                      onClick={() => setShowFullNotes(!showFullNotes)}
                    >
                      {showFullNotes ? 'Show Less ↑' : 'Read More ↓'}
                    </button>
                  </>
                ) : (
                  formatNotes(chapterNotes)
                )}
              </div>
            ) : (
              <p className="no-notes-message">
                No chapter notes available for this exercise.
                <br />
                <small>Check back later as we add more content.</small>
              </p>
            )}
          </div>
        </aside>
      </div>
      <FuncFooter />
    </div>
  );
}

export default Exercise;