import { useState, useEffect, useRef } from "react";
import "../../styles/exercise-list/GradeTopicsSection.css";

function GradeTopicsSection({ groupedTopics, onTopicClick }) {
  const [activeGradeIdx, setActiveGradeIdx] = useState(0);
  const [gradeAtStart, setGradeAtStart] = useState(true);
  const [gradeAtEnd, setGradeAtEnd] = useState(false);
  const gradeScrollerRef = useRef(null);

  useEffect(() => {
    const container = gradeScrollerRef.current;
    if (!container) return;

    const update = () => {
      const { scrollLeft, clientWidth, scrollWidth } = container;
      if (clientWidth === 0) return;

      const idx = Math.round(scrollLeft / clientWidth);
      const maxIdx = Math.max(0, groupedTopics.length - 1);
      setActiveGradeIdx(Math.min(Math.max(idx, 0), maxIdx));

      setGradeAtStart(scrollLeft <= 2);
      setGradeAtEnd(scrollLeft + clientWidth >= scrollWidth - 2);
    };

    const initialTimer = setTimeout(update, 50);

    container.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update);
      ro.observe(container);
    }

    return () => {
      clearTimeout(initialTimer);
      container.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      if (ro) ro.disconnect();
    };
  }, [groupedTopics]);

  const scrollToGrade = (idx) => {
    const container = gradeScrollerRef.current;
    if (!container) return;
    const sections = container.querySelectorAll('.grade-list-section');
    const target = sections[idx];
    if (!target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const offset = targetRect.left - containerRect.left + container.scrollLeft;

    container.scrollTo({ left: offset, behavior: 'smooth' });
  };

  if (groupedTopics.length === 0) {
    return (
      <p className="no-list-quizzes">
        No topics available for this subject yet. Check back soon!
      </p>
    );
  }

  return (
    <>
      <div className="grade-section-header">
        <h2 className="grade-section-title">Topics by Grade</h2>

        {groupedTopics.length > 1 && (
          <div className="grade-indicator" aria-label="Grade navigation">
            <button
              type="button"
              className="grade-nav-btn"
              onClick={() => scrollToGrade(Math.max(activeGradeIdx - 1, 0))}
              disabled={gradeAtStart}
              aria-label="Previous grade"
            >
              ‹
            </button>

            <div className="grade-dots">
              {groupedTopics.map((grade, idx) => (
                <button
                  key={grade.grade_level}
                  type="button"
                  className={`grade-dot ${activeGradeIdx === idx ? 'active' : ''}`}
                  onClick={() => scrollToGrade(idx)}
                  aria-label={`Go to ${grade.grade_display}`}
                />
              ))}
            </div>

            <button
              type="button"
              className="grade-nav-btn"
              onClick={() => scrollToGrade(Math.min(activeGradeIdx + 1, groupedTopics.length - 1))}
              disabled={gradeAtEnd}
              aria-label="Next grade"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="topic-scroller-wrapper">
        <div className="topic-list-by-grade" ref={gradeScrollerRef}>
          {groupedTopics.map((gradeGroup) => (
            <div key={gradeGroup.grade_level} className="grade-list-section">
              <h2 className="grade-list-header">{gradeGroup.grade_display}</h2>
              <div className="topics-list-grid">
                {gradeGroup.topics.map((topic) => (
                  <div
                    key={topic.topic_id}
                    className="topic-list-card"
                    onClick={() => onTopicClick(topic.topic_id)}
                  >
                    <h3 className="topic-list-title">{topic.topic_name}</h3>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default GradeTopicsSection;