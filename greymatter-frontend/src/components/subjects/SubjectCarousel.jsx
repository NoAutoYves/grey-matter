import { useState, useEffect, useRef } from "react";
import SubjectCard from "./SubjectCard";
import "../../styles/subjects/SubjectCarousel.css";

function SubjectCarousel({ subjects }) {
  const scrollContainerRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setAtStart(scrollLeft <= 1);
      setAtEnd(scrollLeft + clientWidth >= scrollWidth - 2);
    };

    container.addEventListener('scroll', checkScroll);
    setTimeout(checkScroll, 100);

    return () => container.removeEventListener('scroll', checkScroll);
  }, [subjects]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector('.subject-carousel-card')?.offsetWidth || 280;
      const gap = 16;
      container.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector('.subject-carousel-card')?.offsetWidth || 280;
      const gap = 16;
      container.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
    }
  };

  return (
    <div className="subject-carousel-controls">
      <button
        className="carousel-btn prev"
        onClick={scrollLeft}
        aria-label="Scroll left"
        disabled={atStart}
        style={{ opacity: atStart ? 0.4 : 1, pointerEvents: atStart ? 'none' : 'auto' }}
      >
        ‹
      </button>
      <div className="subjects-carousel" ref={scrollContainerRef}>
        {subjects.map((subject) => (
          <SubjectCard key={subject.subject_id} subject={subject} variant="carousel" />
        ))}
      </div>
      <button
        className="carousel-btn next"
        onClick={scrollRight}
        aria-label="Scroll right"
        disabled={atEnd}
        style={{ opacity: atEnd ? 0.4 : 1, pointerEvents: atEnd ? 'none' : 'auto' }}
      >
        ›
      </button>
    </div>
  );
}

export default SubjectCarousel;