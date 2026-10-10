import { useState } from "react";
import "../../styles/exercise-list/ListHero.css";

function ListHero({ subjectName, fullDescription, totalExercises, completedExercises }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTruncatedDescription = (text) => {
    if (!text) return '';
    const words = text.split(' ');
    let result = '';
    for (let i = 0; i < words.length; i++) {
      if ((result + words[i]).length > 100) break;
      result += (i === 0 ? '' : ' ') + words[i];
    }
    return result + '...';
  };

  const truncatedDescription = getTruncatedDescription(fullDescription);

  return (
    <div className="list-hero">
      <h1 className="list-title">{subjectName} Topics</h1>

      <div className="list-description-wrapper">
        <p className="list-description">
          <span className="list-desktop-full">{fullDescription}</span>
          <span className="list-mobile-truncated">{isExpanded ? fullDescription : truncatedDescription}</span>
        </p>
        <button
          className="list-expand-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Show less" : "Read more"}
        >
          {isExpanded ? 'Show less ↑' : 'Read more ↓'}
        </button>
      </div>

      {totalExercises > 0 && (
        <div className="list-stats">
          <span className="list-stat-badge">
            {totalExercises} exercises
          </span>
          <span className="list-stat-badge">
            {completedExercises} completed
          </span>
        </div>
      )}
    </div>
  );
}

export default ListHero;