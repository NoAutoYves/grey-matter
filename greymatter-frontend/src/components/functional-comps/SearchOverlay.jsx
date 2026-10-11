import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { api } from "../../utils/api";
import searchIcon from "../../assets/images/func-images/search-icon.png";
import "../../styles/SearchOverlay.css";

function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ topics: [], exercises: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults({ topics: [], exercises: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (res.ok) {
          setResults({
            topics: data.topics || [],
            exercises: data.exercises || [],
          });
        }
      } catch (e) {
        console.error("Search failed:", e);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const goToTopic = (t) => {
    navigate(`/${t.subject_slug}/topic/${t.topic_id}/`);
    onClose();
  };

  const goToExercise = (e) => {
    navigate(`/${e.subject_slug}/exercise?exercise_id=${e.exercise_id}`);
    onClose();
  };

  const totalResults = results.topics.length + results.exercises.length;
  const hasQuery = query.trim().length >= 2;

  return createPortal(
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrap">
          <img src={searchIcon} alt="" className="search-input-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search topics and exercises..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
          <kbd className="search-kbd">Esc</kbd>
        </div>

        <div className="search-results">
          {!hasQuery && (
            <div className="search-hint">
              Type at least 2 characters to search across all subjects.
            </div>
          )}

          {hasQuery && loading && (
            <div className="search-hint">Searching…</div>
          )}

          {hasQuery && !loading && totalResults === 0 && (
            <div className="search-hint">No results for "{query}"</div>
          )}

          {hasQuery && !loading && results.topics.length > 0 && (
            <>
              <div className="search-section-label">Topics</div>
              {results.topics.map((t) => (
                <button
                  key={`topic-${t.topic_id}`}
                  type="button"
                  className="search-result"
                  onClick={() => goToTopic(t)}
                >
                  <span className="search-result-main">
                    <span className="search-result-title">{t.topic_name}</span>
                    <span className="search-result-meta">
                      {t.subject_name} · Grade {t.grade_level}
                    </span>
                  </span>
                  <span className="search-result-tag">Topic</span>
                </button>
              ))}
            </>
          )}

          {hasQuery && !loading && results.exercises.length > 0 && (
            <>
              <div className="search-section-label">Exercises</div>
              {results.exercises.map((e) => (
                <button
                  key={`exercise-${e.exercise_id}`}
                  type="button"
                  className="search-result"
                  onClick={() => goToExercise(e)}
                >
                  <span className="search-result-main">
                    <span className="search-result-title">{e.exercise_title}</span>
                    <span className="search-result-meta">
                      {e.subject_name} · Grade {e.grade_level}
                    </span>
                  </span>
                  <span className="search-result-tag search-result-tag-exercise">Exercise</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SearchOverlay;