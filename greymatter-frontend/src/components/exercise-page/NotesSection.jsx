import { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "katex/dist/katex.min.css";
import { api } from "../../utils/api";
import notesIcon from "../../assets/images/func-images/notes-icon.png";
import NotesRenderer from "../notes/NotesRenderer";
import "../../styles/exercise-page/NotesSection.css";

const PREVIEW_LIMIT = 200;
const COLLAPSE_THRESHOLD = 300;

const NotesSection = ({ exerciseId, subject }) => {
  const [chapterNotes, setChapterNotes] = useState(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [showFullNotes, setShowFullNotes] = useState(false);

  useEffect(() => {
    if (!exerciseId || !subject) return;

    let cancelled = false;
    const fetchNotes = async () => {
      setNotesLoading(true);
      try {
        const response = await api.get(`/api/exercise/notes/${exerciseId}`);
        const data = await response.json();
        if (!cancelled && response.ok && data.notes) {
          setChapterNotes(data.notes);
        }
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      } finally {
        if (!cancelled) setNotesLoading(false);
      }
    };

    fetchNotes();
    return () => { cancelled = true; };
  }, [exerciseId, subject]);

  const shouldCollapse = chapterNotes && chapterNotes.length > COLLAPSE_THRESHOLD;
  const previewLimit = shouldCollapse && !showFullNotes ? PREVIEW_LIMIT : null;

  return (
    <aside className="notes-sidebar">
      <div className="notes-box">
        <div className="notes-header">
          <img src={notesIcon} alt="Notes" className="notes-icon" />
          <h4>Chapter Notes</h4>
        </div>

        {notesLoading ? (
          <Skeleton count={5} height={20} style={{ marginBottom: "10px" }} />
        ) : chapterNotes ? (
          <div className="chapter-notes-content">
            <NotesRenderer content={chapterNotes} previewLimit={previewLimit} />
            {shouldCollapse && (
              <button
                className="notes-toggle-btn"
                onClick={() => setShowFullNotes((v) => !v)}
              >
                {showFullNotes ? "Show Less " : "Read More "}
              </button>
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
  );
};

export default NotesSection;