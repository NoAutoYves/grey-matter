import { useState, useEffect, useRef } from "react";
import "../../styles/exercise-list/SubjectGuide.css";

const COLLAPSED_MAX_HEIGHT = 480;

function renderInline(text) {
  if (!text) return null;
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

function SubjectGuide({ guide }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    const check = () => {
      if (window.innerWidth >= 1024) {
        setIsOverflowing(false);
        return;
      }
      // scrollHeight returns the natural content height regardless of max-height,
      // so this test is stable across collapsed/expanded states.
      setIsOverflowing(el.scrollHeight > COLLAPSED_MAX_HEIGHT + 4);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [guide, isExpanded]);

  const showToggle = isOverflowing;

  return (
    <section className="subject-guide">
      <div
        ref={bodyRef}
        className={[
          "subject-guide-body",
          isOverflowing ? "subject-guide-body--clampable" : "",
          isExpanded ? "subject-guide-body--expanded" : "",
        ].filter(Boolean).join(" ")}
      >
        {guide.sections.map((section, idx) => (
          <div key={idx} className="subject-guide-section">
            <h2 className="subject-guide-heading">{section.heading}</h2>

            {section.paragraphs && section.paragraphs.map((para, pIdx) => (
              <p key={pIdx} className="subject-guide-paragraph">
                {renderInline(para)}
              </p>
            ))}

            {section.subsections && section.subsections.map((sub, sIdx) => (
              <div key={sIdx} className="subject-guide-subsection">
                <h3 className="subject-guide-subheading">{sub.subheading}</h3>
                {sub.paragraphs.map((para, pIdx) => (
                  <p key={pIdx} className="subject-guide-paragraph">
                    {renderInline(para)}
                  </p>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {showToggle && (
        <button
          type="button"
          className="subject-guide-toggle"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Show less " : "Read more "}
        </button>
      )}
    </section>
  );
}

export default SubjectGuide;