import { useState, useEffect, useRef, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import FuncFooter from "../components/functional-comps/FuncFooter";
import ExerciseHeader from "../components/functional-comps/ExerciseHeader";
import { api } from "../utils/api";
import { UserContext } from "../context/UserContext";
import { storePendingExercise } from "../utils/pendingExercise";
import ExerciseSkeleton from "../components/exercise-page/ExerciseSkeleton";
import QuizInfoRow from "../components/exercise-page/QuizInfoRow";
import QuestionCard from "../components/exercise-page/QuestionCard";
import NotesSection from "../components/exercise-page/NotesSection";
import "../styles/exercise-page/Exercise.css";

function Exercise() {
  const { subject } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
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
      subject,
    };
    localStorage.setItem(`exercise_progress_${exerciseId}`, JSON.stringify(progress));
  };

  const clearProgress = () => {
    localStorage.removeItem(`exercise_progress_${exerciseId}`);
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
      setSecondsElapsed((prev) => prev + 1);
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
          const formattedQuestions = data.questions.map((q) => ({
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            image_url: q.image_url || null,
            question_id: q.question_id,
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
    const notes = "";

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
        isCorrect: finalAnswered[idx] === q.correct_answer,
      };
    });

    const formattedAnswers = Object.entries(finalAnswered)
      .map(([index, letter]) => {
        const qid = data[parseInt(index)]?.question_id;
        if (!qid) return null;
        return { question_id: qid, selected_option: letter };
      })
      .filter(Boolean);

    if (user) {
      // Logged in: POST immediately.
      api.batch
        .submitExercise(parseInt(exerciseId), formattedAnswers, timeTaken, notes, breakdown)
        .catch((err) => console.error("Error submitting exercise:", err));

      sessionStorage.setItem(`exercise_guest_${exerciseId}`, "false");
    } else {
      // Guest: stash the payload so it can be POSTed after signup or login.
      storePendingExercise({
        exercise_id: parseInt(exerciseId),
        answers: formattedAnswers,
        time_taken_seconds: timeTaken,
        notes: notes,
        breakdown: breakdown,
        stored_at: Date.now(),
      });

      sessionStorage.setItem(`exercise_guest_${exerciseId}`, "true");
    }

    localStorage.setItem("finalScore", finalScore);
    localStorage.setItem("totalQuestions", totalQuestions);
    localStorage.setItem("timeTaken", timeTaken);
    localStorage.setItem("notes", notes);
    localStorage.setItem("breakdown", JSON.stringify(breakdown));

    clearProgress();
    navigate(`/exercise-completed?exercise_id=${exerciseId}&subject=${encodeURIComponent(subject)}`);
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
    setCurrentQuestion((prev) => {
      const next = Math.min(prev + 1, exerciseDataRef.current.length - 1);
      currentQuestionRef.current = next;
      return next;
    });
  };

  const handlePrev = () => {
    if (showFeedback) return;
    setCurrentQuestion((prev) => {
      const next = Math.max(prev - 1, 0);
      currentQuestionRef.current = next;
      return next;
    });
  };

  if (exerciseData.length === 0) {
    return <ExerciseSkeleton exerciseId={exerciseId} subject={subject} />;
  }

  const currentQ = exerciseData[currentQuestion];
  const progress = `${currentQuestion + 1} / ${exerciseData.length}`;
  const hasAnswered = Object.keys(answered).length > 0;

  return (
    <div className="quiz-page">
      <ExerciseHeader hasAnswered={hasAnswered} />
      <div className="main-layout">
        <section className="quiz-container">
          <QuizInfoRow score={score} progress={progress} time={formatTime()} />
          <QuestionCard
            currentQ={currentQ}
            userAnswer={answered[currentQuestion]}
            showFeedback={showFeedback}
            isCorrectAnswer={isCorrectAnswer}
            onSelect={(letter) => handleAnswer(letter, currentQ.correct_answer)}
            onPrev={handlePrev}
            onNext={handleNext}
            currentQuestion={currentQuestion}
            totalQuestions={exerciseData.length}
          />
        </section>
        <NotesSection exerciseId={exerciseId} subject={subject} />
      </div>
      <FuncFooter />
    </div>
  );
}

export default Exercise;