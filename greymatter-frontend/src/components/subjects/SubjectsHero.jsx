import { useState } from "react";
import "../../styles/subjects/SubjectsHero.css";

const heroDescription = `Grey Matter has over 1,400 practice exercises across eight South African high school subjects for Grades 10, 11, and 12. Every exercise is 10 multiple-choice questions with instant feedback and a full per-question breakdown. Read the chapter notes alongside the questions, retake the exercise as many times as you want, and see exactly which topics are costing you marks before the exam does. Built for the phone you already have. Free, and no sign-up needed to browse.`;

function getTruncatedDescription(text) {
  if (!text) return '';
  const words = text.split(' ');
  let result = '';
  for (let i = 0; i < words.length; i++) {
    if ((result + words[i]).length > 100) break;
    result += (i === 0 ? '' : ' ') + words[i];
  }
  return result + '...';
}

function SubjectsHero() {
  const [isExpanded, setIsExpanded] = useState(false);
  const truncatedDescription = getTruncatedDescription(heroDescription);

  return (
    <div className="subjects-hero">
      <h1 className="subjects-title">Practice for Grades 10, 11 and 12</h1>

      <div className="subjects-description-wrapper">
        <p className="subjects-subtitle">
          <span className="subjects-desktop-full">{heroDescription}</span>
          <span className="subjects-mobile-truncated">
            {isExpanded ? heroDescription : truncatedDescription}
          </span>
        </p>
        <button
          className="subjects-expand-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Show less" : "Read more"}
        >
          {isExpanded ? 'Show less ' : 'Read more '}
        </button>
      </div>
    </div>
  );
}

export default SubjectsHero;