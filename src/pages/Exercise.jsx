import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { apiRequest } from "../utils/api";
import MathRenderer from "../components/functional-comps/MathRenderer";

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
  const timerRef = useRef(null);
  const notesRef = useRef(null);
  const answeredRef = useRef(answered);

  // Save progress to localStorage
  const saveProgress = () => {
    const progress = {
      answered,
      currentQuestion,
      score,
      secondsElapsed,
      exerciseId,
      subject
    };
    localStorage.setItem(`exercise_progress_${exerciseId}`, JSON.stringify(progress));
  };

  // Load progress from localStorage
  const loadProgress = () => {
    const saved = localStorage.getItem(`exercise_progress_${exerciseId}`);
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        setAnswered(progress.answered || {});
        setCurrentQuestion(progress.currentQuestion || 0);
        setScore(progress.score || 0);
        setSecondsElapsed(progress.secondsElapsed || 0);
      } catch (e) {
        console.error("Failed to load progress:", e);
      }
    }
  };

  // Clear progress after quiz completion
  const clearProgress = () => {
    localStorage.removeItem(`exercise_progress_${exerciseId}`);
  };

  // Warn before leaving if quiz is in progress
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (Object.keys(answered).length > 0 && !dataLoaded) {
        e.preventDefault();
        e.returnValue = "Your quiz progress will be lost. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [answered, dataLoaded]);

  // Save progress whenever state changes
  useEffect(() => {
    if (exerciseId && exerciseData.length > 0 && Object.keys(answered).length > 0) {
      saveProgress();
    }
  }, [answered, currentQuestion, score, secondsElapsed, exerciseId, exerciseData.length]);

  useEffect(() => {
    answeredRef.current = answered;
  }, [answered]);

  // Timer
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

  // Fetch exercise data - UPDATED to use apiRequest
  useEffect(() => {
    const fetchExercise = async () => {
      const response = await apiRequest(`/api/exercise/${subject}/${exerciseId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setExerciseData(data);
      
      // Load saved progress after data is loaded
      loadProgress();
      setDataLoaded(true);
    };
    fetchExercise();
  }, [subject, exerciseId]);

  const handleAnswer = (selectedLetter, correctLetter) => {
    if (answered[currentQuestion]) return;
    
    const isCorrect = selectedLetter === correctLetter;
    setIsCorrectAnswer(isCorrect);
    setShowFeedback(true);
    
    const newAnswered = { ...answered, [currentQuestion]: selectedLetter };
    setAnswered(newAnswered);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    const isLastQuestion = currentQuestion === exerciseData.length - 1;
    
    setTimeout(() => {
      setShowFeedback(false);
      
      if (isLastQuestion) {
        let firstUnanswered = -1;
        for (let i = 0; i < exerciseData.length; i++) {
          if (!newAnswered[i]) {
            firstUnanswered = i;
            break;
          }
        }
        
        if (firstUnanswered !== -1) {
          setCurrentQuestion(firstUnanswered);
        } else {
          const finalScore = isCorrect ? score + 1 : score;
          const totalQuestions = exerciseData.length;
          const timeTaken = secondsElapsed;
          const notes = notesRef.current?.value || "";
          
          const breakdown = exerciseData.map((q, idx) => {
            const selectedLetter = newAnswered[idx];
            const options = q.options;
            const selectedText = selectedLetter ? options[selectedLetter.charCodeAt(0) - 65] : "No answer";
            const correctLetter = q.correct_answer;
            const correctText = options[correctLetter.charCodeAt(0) - 65];
            return {
              question: q.question_text,
              selected: selectedText,
              correct: correctText,
              isCorrect: newAnswered[idx] === q.correct_answer
            };
          });
          
          const answersObj = {};
          for (let i = 0; i < newAnswered.length; i++) {
            answersObj[i] = newAnswered[i];
          }
          
          // Save results - UPDATED to use apiRequest
          const saveToDatabase = async () => {
            try {
              const response = await apiRequest(`/api/exercise/save-results`, {
                method: "POST",
                body: JSON.stringify({
                  exercise_id: exerciseId,
                  score: finalScore,
                  total_questions: totalQuestions,
                  time_taken_seconds: timeTaken,
                  notes: notes,
                  breakdown: breakdown,
                  answers: answersObj
                })
              });
              if (!response.ok) console.error("Failed to save results");
            } catch (error) {
              console.error("Error saving results:", error);
            }
          };
          saveToDatabase();
          
          localStorage.setItem("finalScore", finalScore);
          localStorage.setItem("totalQuestions", totalQuestions);
          localStorage.setItem("timeTaken", timeTaken);
          localStorage.setItem("notes", notes);
          localStorage.setItem("breakdown", JSON.stringify(breakdown));
          
          clearProgress();
          
          navigate(`/exercise-completed?exercise_id=${exerciseId}`);
        }
      } else {
        if (currentQuestion < exerciseData.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
        }
      }
    }, 1000);
  };

  const handleNext = () => {
    if (currentQuestion < exerciseData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
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
        <FuncHeader />
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
      <FuncHeader showWarning={hasAnswered} />
      <div className="main-layout">
        <section className="quiz-container">
          <div className="quiz-info-row">
            <div className="info-box"><h4>Score</h4><p>{score}</p></div>
            <div className="info-box"><h4>Progress</h4><p>{progress}</p></div>
            <div className="info-box"><h4>Timer</h4><p>{formatTime()}</p></div>
          </div>

          <div className="quiz-box">
            {/* Question text with math rendering */}
            <h2><MathRenderer text={currentQ.question_text} /></h2>
            
            {/* Question image (if exists) */}
            {currentQ.image_url && (
              <div className="question-image-container">
                <img 
                  src={currentQ.image_url} 
                  alt="Question diagram" 
                  className="question-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    console.error('Failed to load image:', currentQ.image_url);
                  }}
                />
              </div>
            )}
            
            {/* Options grid with math rendering */}
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
                    className={`option ${userAnswerClass} ${feedbackClass} ${highlightClass} ${showHighlight ? 'highlight' : ''}`}
                    onClick={() => {
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
              <button onClick={handlePrev} className="nav-button" disabled={currentQuestion === 0}>⬅ Prev</button>
              <button onClick={handleNext} className="nav-button">Next ➡</button>
            </div>
          </div>
        </section>

        <aside className="notes-sidebar">
          <div className="notes-box">
            <h4>Notes</h4>
            <textarea 
              ref={notesRef}
              id="notes" 
              placeholder="Write your notes here..."
              onKeyDown={handleNotesKeyDown}>
            </textarea>
          </div>
        </aside>
      </div>
      <FuncFooter />
    </div>
  );
}

export default Exercise;