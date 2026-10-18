import { useEffect, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import { api } from "../utils/api";
import { UserContext } from "../context/UserContext";
import ShareModal from "../components/functional-comps/ShareModal";

import ExerciseCompletedSkeleton from "../components/exercise-completed/ExerciseCompletedSkeleton";
import ResultsSummary from "../components/exercise-completed/ResultsSummary";
import ShareResultsSection from "../components/exercise-completed/ShareResultsSection";
import QuestionBreakdown from "../components/exercise-completed/QuestionBreakdown";
import FeedbackSection from "../components/exercise-completed/FeedbackSection";
import ResultsActions from "../components/exercise-completed/ResultsActions";
import SignupPrompt from "../components/exercise-completed/SignupPrompt";

import '../styles/exercise-completed/ExerciseCompleted.css';

function ExerciseCompleted() {
  const location = useLocation();
  const { user } = useContext(UserContext);
  const queryParams = new URLSearchParams(location.search);
  const exerciseId = queryParams.get("exercise_id");
  const subjectFromUrl = queryParams.get("subject") || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(true);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(1);
  const [timeTaken, setTimeTaken] = useState(0);
  const [notes, setNotes] = useState("");
  const [breakdown, setBreakdown] = useState([]);
  const [saveError, setSaveError] = useState(false);

  const [subjectName, setSubjectName] = useState("");
  const [topicName, setTopicName] = useState("");

  const [showShareModal, setShowShareModal] = useState(false);

  const isGuest = !user;

  const formatTimeFromSeconds = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!exerciseId) return;
    let cancelled = false;

    const fetchMeta = async () => {
      try {
        const response = await api.get(`/api/exercise/results/${exerciseId}`);
        if (!response.ok || cancelled) return;
        const data = await response.json();
        if (data.subject) setSubjectName(data.subject);
        if (data.topic_name) setTopicName(data.topic_name);
      } catch {
        // Silent - share fallback uses subjectFromUrl or generic text.
      }
    };

    fetchMeta();
    return () => { cancelled = true; };
  }, [exerciseId]);

  useEffect(() => {
    let isMounted = true;

    // Read score data written by Exercise.jsx.
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

    // Guests: no server save. Straight to the results view.
    if (isGuest) {
      setSaving(false);
      setLoading(false);
      return () => { isMounted = false; };
    }

    const hasSaved = sessionStorage.getItem(`exercise_saved_${exerciseId}`);

    if (hasSaved === "true") {
      setSaving(false);
      setLoading(false);
      return () => { isMounted = false; };
    }

    const saveResults = async (retryCount = 0) => {
      const maxRetries = 3;

      try {
        const formattedAnswers = storedBreakdown.map((item, index) => ({
          question_id: index + 1,
          selected_option: item.selected || ''
        }));

        const response = await api.batch.submitExercise(
          parseInt(exerciseId),
          formattedAnswers,
          storedTime,
          storedNotes,
          storedBreakdown
        );

        const result = await response.json();

        if (response.ok && result.success && isMounted) {
          sessionStorage.setItem(`exercise_saved_${exerciseId}`, "true");
          setSaveError(false);
        } else {
          throw new Error(result.error || "Save failed - server returned error");
        }
      } catch (error) {
        console.error(`Save attempt ${retryCount + 1} failed:`, error);

        if (retryCount < maxRetries - 1 && isMounted) {
          const delay = (retryCount + 1) * 1000;
          setTimeout(() => saveResults(retryCount + 1), delay);
        } else if (isMounted) {
          console.error("Failed to save results after all retries");
          setSaveError(true);
        }
      } finally {
        if (isMounted) {
          setSaving(false);
          setLoading(false);
        }
      }
    };

    saveResults();

    return () => {
      isMounted = false;
    };
  }, [exerciseId, isGuest]);

  if (loading || saving) {
    return <ExerciseCompletedSkeleton />;
  }

  const percentage = Math.round((score / total) * 100);
  const formattedTime = formatTimeFromSeconds(timeTaken);

  return (
    <div className="results-page">
      <Helmet htmlAttributes={{ lang: "en-ZA" }}>
        <title>Exercise Complete | Grey Matter</title>
        <meta
          name="description"
          content="Your exercise results and question-by-question breakdown on Grey Matter."
        />
        <meta name="theme-color" content="#6846ff" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <FuncHeader />

      <div className="sponsor-container-results sponsor-top">
        <div className="sponsor-placeholder">
          {/* Advertisement (Leaderboard - 728x90) */}
        </div>
      </div>

      <section className="results-container">
        <h2 className="results-title">Exercise Completed</h2>
        <p className="results-subtitle">Here's how you did:</p>

        {isGuest && <SignupPrompt />}

        {!isGuest && saveError && (
          <div className="save-error-warning">
            <span>⚠️</span> Your results may not have been saved. Please contact support if this persists.
          </div>
        )}

        <ResultsSummary
          score={score}
          total={total}
          percentage={percentage}
          formattedTime={formattedTime}
        />

        <ShareResultsSection onShare={() => setShowShareModal(true)} />

        <QuestionBreakdown breakdown={breakdown} />

        {!isGuest && (
          <FeedbackSection
            exerciseId={exerciseId}
            score={score}
            total={total}
            timeTaken={timeTaken}
          />
        )}

        <ResultsActions />
      </section>

      <div className="sponsor-container-results sponsor-billboard">
        <div className="sponsor-placeholder">
          {/* Advertisement (Large Rectangle - 336x280) */}
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        subject={subjectName || subjectFromUrl}
        topic={topicName}
        score={score}
        total={total}
        percentage={percentage}
      />

      <FuncFooter />
    </div>
  );
}

export default ExerciseCompleted;