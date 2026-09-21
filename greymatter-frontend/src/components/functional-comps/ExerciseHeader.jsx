import { useLocation, useNavigate } from "react-router-dom";
import { useModal } from "../../context/ModalContext";
import '../../styles/ExerciseHeader.css';

function ExerciseHeader({ hasAnswered }) {
  const { showModal } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  const getExerciseId = () =>
    new URLSearchParams(location.search).get("exercise_id");

  const handleExit = (e) => {
    e.preventDefault();

    if (hasAnswered) {
      const exerciseId = getExerciseId();
      showModal(
        "Your exercise progress will be lost. Are you sure you want to leave?",
        () => {
          if (exerciseId) {
            localStorage.removeItem(`exercise_progress_${exerciseId}`);
          }
          navigate(-1);
        },
        () => {}
      );
    } else {
      navigate(-1);
    }
  };

  const handleNotes = (e) => {
    e.preventDefault();
    const notesEl = document.querySelector(".notes-sidebar");
    if (notesEl) {
      notesEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="exercise-header">
      <h1 className="exercise-header-title">GREY MATTER</h1>
      <nav className="exercise-header-nav">
        <button
          type="button"
          onClick={handleExit}
          className="exercise-header-link"
        >
          EXIT
        </button>
        <button
          type="button"
          onClick={handleNotes}
          className="exercise-header-link"
        >
          NOTES
        </button>
      </nav>
    </header>
  );
}

export default ExerciseHeader;