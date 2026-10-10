import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiRequest } from "../../utils/api";
import "../../styles/landing-css/HeroSection.css";

function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("/auth/check-session");
        if (response.ok) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const heroDescription = `Over 1,300 practice exercises across eight South African high school subjects for Grades 10, 11, and 12. Each exercise is 10 multiple-choice questions with instant feedback, a per-question breakdown, and chapter notes for the topic. Track every attempt, retake as many times as you want, and see exactly where you are losing marks before the exam does. Free, and no sign-up needed to browse.`;

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

  const truncatedDescription = getTruncatedDescription(heroDescription);

  return (
    <section className="hero-section">
      <div className="hero-box">
        <h2>
          {isLoggedIn
            ? "Welcome back! Ready to learn?"
            : "Your Path to Academic Excellence Starts Here"}
        </h2>

        <div className="hero-description-wrapper">
          <p className="hero-description">
            <span className="desktop-full">{heroDescription}</span>
            <span className="mobile-truncated">{isExpanded ? heroDescription : truncatedDescription}</span>
          </p>
          <button
            className="expand-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Show less" : "Read more"}
          >
            {isExpanded ? 'Show less ↑' : 'Read more ↓'}
          </button>
        </div>

        <Link to={isLoggedIn ? "/subjects/" : "/signup"} className="hero-cta">
          {isLoggedIn ? "Continue Learning →" : "Get Started Free →"}
        </Link>
      </div>
    </section>
  );
}

export default HeroSection;