import LandingSubjects from "../components/Landing/LandingSubjects";
import SocialMedia from "../components/Landing/LandingSocialMedia";
import { Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { useModal } from "../context/ModalContext";
import { UserContext } from "../context/UserContext";
import { apiRequest } from "../utils/api";
import '../styles/Landing.css';

import loginIcon from "../assets/images/func-images/login.png";
import subjectIcon from "../assets/images/func-images/subjects.png";
import profileIcon from "../assets/images/func-images/profile.png";
import logoutIcon from "../assets/images/func-images/logout.png";

// Why Grey Matter Icons
import realPracticeIcon from "../assets/images/func-images/real_practice.png";
import instantFeedbackIcon from "../assets/images/func-images/instant_feedback.png";
import saveAndReviewIcon from "../assets/images/func-images/save_and_review.png";
import alwaysFreeIcon from "../assets/images/func-images/always_free.png";

// Feature Icons
import comprehensiveSubjectsIcon from "../assets/images/func-images/comprehensive_subjects.png";
import engagingExercisesIcon from "../assets/images/func-images/engaging_exercises.png";
import progressTrackingIcon from "../assets/images/func-images/progress_tracking.png";
import examPrepIcon from "../assets/images/func-images/exam_prep.png";

function LandingPage() {
  const { showModal } = useModal();
  const { logout } = useContext(UserContext);
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

  const handleLogout = () => {
    showModal(
      "Are you sure you want to log out?",
      async () => {
        await apiRequest(`/auth/logout`, { method: "POST" });
        logout();
        window.location.href = "/";
      },
      () => {}
    );
  };

  // Hero description text
  const heroDescription = `Choose from 8 high school subjects, practice with interactive exercises, and watch your understanding grow. Get instant feedback, save notes, and track your progress — all at no cost. Whether you're preparing for exams or simply reinforcing what you've learned in class, Grey Matter provides the tools you need to succeed.`;

  // Get truncated description for mobile
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
    <>
      <div className="index-page">
        {/* AD 1 - BILLBOARD (970x250) - ABOVE NAV */}
        {/* <div className="sponsor-container-landing sponsor-top">
          <div className="sponsor-placeholder">Advertisement</div>
        </div> */}

        <nav className="landing-nav">
          <Link to="/login"><img src={loginIcon} alt="Login" className="nav-img"/>LOGIN</Link>
          <Link to="/subjects"><img src={subjectIcon} alt="Topics" className="nav-img"/>TOPICS</Link>
          <Link to="/persona"><img src={profileIcon} alt="Profile" className="nav-img"/>PROFILE</Link>
          <button onClick={handleLogout}><img src={logoutIcon} alt="Logout" className="nav-img"/>LOGOUT</button>
        </nav>

        <header className="logo">
          <h1>GREY MATTER</h1>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-box">
            <h2>
              {isLoggedIn 
                ? "Welcome back! Ready to learn?" 
                : "Your Path to Academic Excellence Starts Here"}
            </h2>
            
            {/* Description with expand/collapse */}
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
            
            <Link to={isLoggedIn ? "/subjects" : "/signup"} className="hero-cta">
              {isLoggedIn ? "Continue Learning →" : "Get Started Free →"}
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="features-grid">
          <div className="feature-card">
            <img src={comprehensiveSubjectsIcon} alt="8 Comprehensive Subjects" className="feature-icon-img" />
            <h3>8 Comprehensive Subjects</h3>
            <p>From Commerce and Science to Mathematics, covering the full high school curriculum with focused, interactive exercises designed to build deep understanding.</p>
          </div>
          <div className="feature-card">
            <img src={engagingExercisesIcon} alt="Engaging Exercises" className="feature-icon-img" />
            <h3>Engaging Exercises</h3>
            <p>Each exercise features 10 carefully crafted questions with detailed solutions and instant feedback to reinforce learning and address misconceptions.</p>
          </div>
          <div className="feature-card">
            <img src={progressTrackingIcon} alt="Progress Tracking" className="feature-icon-img" />
            <h3>Progress Tracking</h3>
            <p>Monitor your performance, review past results, save notes for future reference, and watch your understanding grow over time with clear metrics.</p>
          </div>
          <div className="feature-card">
            <img src={examPrepIcon} alt="Exam Preparation" className="feature-icon-img" />
            <h3>Exam Preparation</h3>
            <p>Practice questions mirror exam-style formats, helping you build the confidence and skills needed to excel in your assessments and final exams.</p>
          </div>
        </section>

        {/* Subject Showcase */}
        <section className="subject-showcase">
          <h2>Explore Our Subjects</h2>
          <p className="showcase-description">
            Choose a subject below and begin mastering key concepts with our interactive exercises designed to prepare you for success.
          </p>
          <LandingSubjects />
        </section>

        {/* Trust Section */}
        <section className="trust-section">
          <div className="trust-item">
            <span className="trust-number">8</span>
            <span className="trust-label">Subjects</span>
          </div>
          <div className="trust-divider"></div>
          <div className="trust-item">
            <span className="trust-number">1000+</span>
            <span className="trust-label">Exercises</span>
          </div>
          <div className="trust-divider"></div>
          <div className="trust-item">
            <span className="trust-number">100%</span>
            <span className="trust-label">Free Access</span>
          </div>
          <div className="trust-divider"></div>
          <div className="trust-item">
            <span className="trust-number">24/7</span>
            <span className="trust-label">Availability</span>
          </div>
        </section>

        {/* Why Grey Matter Section */}
        <section className="why-greymatter">
          <div className="why-container">
            <h2>Why Students Choose Grey Matter</h2>
            <div className="why-grid">
              <div className="why-item">
                <img src={realPracticeIcon} alt="Real Practice" className="why-icon-img" />
                <div>
                  <h4>Real Practice for Real Results</h4>
                  <p>Every exercise is designed to prepare you for actual tests and exams. You'll encounter questions that challenge your understanding and help you build the skills you need to succeed in the classroom and beyond.</p>
                </div>
              </div>
              <div className="why-item">
                <img src={instantFeedbackIcon} alt="Instant Feedback" className="why-icon-img" />
                <div>
                  <h4>Instant Feedback That Teaches</h4>
                  <p>Know exactly what you got wrong — and why — right away. Our detailed feedback helps you learn from mistakes, correct misconceptions, and reinforce what you've learned.</p>
                </div>
              </div>
              <div className="why-item">
                <img src={saveAndReviewIcon} alt="Save and Review" className="why-icon-img" />
                <div>
                  <h4>Save and Review What You Learn</h4>
                  <p>Take notes on every exercise and store them for later review. Revisit challenging topics, track your progress, and build a personalized study resource that grows with you.</p>
                </div>
              </div>
              <div className="why-item">
                <img src={alwaysFreeIcon} alt="Always Free" className="why-icon-img" />
                <div>
                  <h4>Always Free, Always Accessible</h4>
                  <p>No paywalls, no subscriptions, no hidden fees. Every subject, every exercise, every feature is available to every student at no cost — because learning should never be a privilege.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AD 2 - LARGE RECTANGLE */}
        {/* <div className="sponsor-container-landing sponsor-billboard">
          <div className="sponsor-placeholder">Advertisement</div>
        </div> */}

        <SocialMedia />

        {/* AD 3 - LEADERBOARD */}
        {/* <div className="sponsor-container-landing sponsor-footer">
          <div className="sponsor-placeholder">Advertisement</div>
        </div> */}

        <footer>
          <div className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/help">Help &amp; FAQ</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
          <p className="copyright">&copy; {new Date().getFullYear()} GREY MATTER. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}

export default LandingPage;