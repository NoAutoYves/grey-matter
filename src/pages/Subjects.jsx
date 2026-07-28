import { useState, useEffect, useContext, useRef } from "react";
import FuncHeader from "../components/functional-comps/FuncHeader";
import FuncFooter from "../components/functional-comps/FuncFooter";
import { Link } from "react-router-dom";
import SocialMedia from "../components/Landing/LandingSocialMedia";
import { UserContext } from "../context/UserContext";
import { api } from "../utils/api";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '../styles/Subject.css';

// Import image icons
import businessFinanceIcon from "../assets/images/func-images/business_and_finance.png";
import scienceHealthcareIcon from "../assets/images/func-images/science_and_healthcare.png";
import dataTechnologyIcon from "../assets/images/func-images/data_and_technology.png";
import buildRetentionIcon from "../assets/images/func-images/build_retention.png";
import identifyWeaknessesIcon from "../assets/images/func-images/identify_weaknesses.png";
import buildConfidenceIcon from "../assets/images/func-images/build_confidence.png";
import developSpeedIcon from "../assets/images/func-images/develop_speed.png";

function Subjects() {
  const { user } = useContext(UserContext);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalExercises, setTotalExercises] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollContainerRef = useRef(null);
  
  // ========== ADDED: State for scroll boundaries ==========
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  // ========== END ADDED ==========

  // ========== FIX: Use exact database names ==========
  const subjectDescriptions = {
    'accounting': 'Master the language of business. Learn to record, analyze, and interpret financial information — essential for careers in finance, auditing, and business management.',
    'business': 'Explore marketing, management, finance, and entrepreneurship. Build skills for careers in business leadership, consulting, and enterprise.',
    'economics': 'Understand how markets work, supply and demand, and economic forces. Prepare for careers in economics, policy-making, banking, and finance.',
    'geography': 'Study physical geography, human geography, and environmental systems. Careers include urban planning, environmental science, GIS, and teaching.',
    'life science': 'Explore life sciences — from cells and genetics to ecosystems and evolution. Pathways to careers in medicine, healthcare, research, and environmental science.',
    'physics': 'Master the laws of nature — mechanics, energy, waves, and motion. Build a foundation for careers in engineering, technology, research, and education.',
    'mathematical literacy': 'Apply mathematical concepts to real-world situations. Develop skills for careers in business, finance, data analysis, and everyday decision-making.',
    'mathematics': 'Build a strong foundation in algebra, calculus, and mathematical reasoning. Essential for careers in data science, engineering, finance, and technology.'
  };

  const subjectSkills = {
    'accounting': ['Financial statements', 'Double-entry bookkeeping', 'Analysis'],
    'business': ['Marketing', 'Management', 'Entrepreneurship'],
    'economics': ['Supply & demand', 'Market structures', 'Economic indicators'],
    'geography': ['Map reading', 'Climate systems', 'Population studies'],
    'life science': ['Genetics', 'Ecology', 'Human anatomy'],
    'physics': ['Mechanics', 'Energy', 'Wave theory'],
    'mathematical literacy': ['Financial maths', 'Data analysis', 'Measurement'],
    'mathematics': ['Algebra', 'Calculus', 'Statistics']
  };

  const subjectCareers = {
    'accounting': ['Accountant', 'Auditor', 'Financial Analyst', 'Tax Consultant'],
    'business': ['Business Manager', 'Entrepreneur', 'Marketing Manager', 'Consultant'],
    'economics': ['Economist', 'Policy Analyst', 'Investment Banker', 'Financial Advisor'],
    'geography': ['Urban Planner', 'Environmental Scientist', 'GIS Specialist', 'Teacher'],
    'life science': ['Doctor', 'Medical Researcher', 'Healthcare Professional'],
    'physics': ['Engineer', 'Physicist', 'Technology Specialist', 'Teacher'],
    'mathematical literacy': ['Business Analyst', 'Data Analyst', 'Financial Planner'],
    'mathematics': ['Data Scientist', 'Software Engineer', 'Quantitative Analyst', 'Statistician']
  };
  // ========== END FIX ==========

  // Helper function to get the correct key
  const getSubjectKey = (subjectName) => {
    const key = subjectName.toLowerCase();
    if (key === 'maths literacy' || key === 'mathematical literacy') {
      return 'mathematical literacy';
    }
    return key;
  };

  // ========== UPDATED: Scroll functions with boundary checks ==========
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector('.subject-carousel-card')?.offsetWidth || 280;
      const gap = 16;
      const scrollAmount = cardWidth + gap;
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector('.subject-carousel-card')?.offsetWidth || 280;
      const gap = 16;
      const scrollAmount = cardWidth + gap;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  // ========== END UPDATED ==========

  // ========== ADDED: Scroll listener to track position ==========
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setAtStart(scrollLeft <= 1);
      setAtEnd(scrollLeft + clientWidth >= scrollWidth - 2);
    };

    container.addEventListener('scroll', checkScroll);
    // Check on mount and when subjects change
    setTimeout(checkScroll, 100);

    return () => container.removeEventListener('scroll', checkScroll);
  }, [subjects]);
  // ========== END ADDED ==========

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/exercises/batch/subject-stats');
        const data = await response.json();
        
        if (response.ok) {
          setSubjects(data.subjects || []);
          let totalEx = 0;
          let totalComp = 0;
          data.subjects.forEach(s => {
            totalEx += s.total_exercises || 0;
            totalComp += s.completed_exercises || 0;
          });
          setTotalExercises(totalEx);
          setTotalCompleted(totalComp);
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [user]);

  const getSubjectClass = (subjectName) => {
    const classMap = {
      'accounting': 'accounting',
      'business': 'business',
      'economics': 'economics',
      'geography': 'geography',
      'life science': 'life-science',
      'physics': 'physics',
      'maths literacy': 'mathslit',
      'mathematical literacy': 'mathslit',
      'mathematics': 'maths'
    };
    return classMap[subjectName.toLowerCase()] || '';
  };

  const getSubjectPath = (subjectName) => {
    const pathMap = {
      'accounting': 'accounting',
      'business': 'business',
      'economics': 'economics',
      'geography': 'geography',
      'life science': 'life-science',
      'physics': 'physics',
      'maths literacy': 'maths-lit',
      'mathematical literacy': 'maths-lit',
      'mathematics': 'mathematics'
    };
    return pathMap[subjectName.toLowerCase()] || subjectName.toLowerCase();
  };

  // Hero description text
  const heroDescription = `Grey Matter offers curriculum-aligned interactive exercises across 8 high school subjects: Accounting, Business, Economics, Geography, Life Science, Physics, Maths Literacy, and Mathematics. Each exercise is designed to reinforce core concepts, develop critical thinking skills, and prepare students for exam success. Whether you're studying for tests, revising topics, or aiming to excel, our online practice platform provides the tools you need to succeed.`;

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

  if (loading) {
    return (
      <div className="subject-page">
        <FuncHeader />
        <section className="subjects-container">
          <Skeleton width={250} height={40} />
          <Skeleton width={400} height={20} style={{ marginBottom: '20px' }} />
          <div className="subjects-grid">
            <Skeleton count={8} height={220} style={{ marginBottom: '10px' }} />
          </div>
        </section>
        <FuncFooter />
      </div>
    );
  }

  return (
    <>
      <div className="subject-page">
        <FuncHeader />

        <section className="subjects-container">
          {/* Hero Content - SEO Optimized */}
          <div className="subjects-hero">
            <h1 className="subjects-title">High School Subject Practice for Exam Success</h1>
            
            {/* Description with expand/collapse */}
            <div className="subjects-description-wrapper">
              <p className="subjects-subtitle">
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
          </div>

          {/* Career & Skills Section */}
          <section className="career-skills-section">
            <h2>Build Skills for Your Future Career</h2>
            <p>
              Every subject you study at Grey Matter builds skills that are valuable in the workplace. 
              Whether you're aiming for a career in <strong>finance, healthcare, technology, business, or science</strong>, 
              our interactive exercises help you develop the knowledge and confidence you need.
            </p>
            <div className="career-skills-grid">
              <div className="career-skill-card">
                <img src={businessFinanceIcon} alt="Business & Finance" className="career-skill-image" />
                <h4>Business & Finance</h4>
                <p>Accounting, Business, Economics</p>
                <ul>
                  <li>Financial analysis</li>
                  <li>Market understanding</li>
                  <li>Entrepreneurial thinking</li>
                </ul>
              </div>
              <div className="career-skill-card">
                <img src={scienceHealthcareIcon} alt="Science & Healthcare" className="career-skill-image" />
                <h4>Science & Healthcare</h4>
                <p>Life Science, Physics, Geography</p>
                <ul>
                  <li>Scientific inquiry</li>
                  <li>Problem solving</li>
                  <li>Environmental awareness</li>
                </ul>
              </div>
              <div className="career-skill-card">
                <img src={dataTechnologyIcon} alt="Data & Technology" className="career-skill-image" />
                <h4>Data & Technology</h4>
                <p>Mathematics, Maths Literacy</p>
                <ul>
                  <li>Analytical thinking</li>
                  <li>Quantitative reasoning</li>
                  <li>Data interpretation</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ========== UPDATED: Mobile Subject Carousel with boundary buttons ========== */}
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
            <div 
              className="subjects-carousel" 
              ref={scrollContainerRef}
            >
              {subjects.map((subject) => {
                const subjectKey = getSubjectKey(subject.subject_name);
                return (
                  <div key={subject.subject_id} className={`subject-carousel-card ${getSubjectClass(subject.subject_name)}`}>
                    <h3>{subject.subject_name}</h3>
                    <p className="subject-description">
                      {subjectDescriptions[subjectKey] || 
                       `Practice and master ${subject.subject_name} with interactive exercises.`}
                    </p>
                    <div className="subject-skills">
                      {(subjectSkills[subjectKey] || []).map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                    <div className="career-pathways">
                      <h4>Career Pathways</h4>
                      <div className="career-tags">
                        {(subjectCareers[subjectKey] || []).map((career, idx) => (
                          <span key={idx} className="career-tag">{career}</span>
                        ))}
                      </div>
                    </div>
                    <p className="exercise-count">
                      {subject.total_exercises > 0 
                        ? `${subject.total_exercises} exercises available` 
                        : 'Exercises coming soon'}
                    </p>
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: subject.total_exercises > 0 
                              ? `${(subject.completed_exercises / subject.total_exercises) * 100}%` 
                              : '0%' 
                          }}
                        />
                      </div>
                      <span className="progress-text">
                        {subject.total_exercises > 0 
                          ? `${subject.completed_exercises || 0} completed (${subject.progress_percentage || 0}%)`
                          : ''}
                      </span>
                    </div>
                    <Link to={`/${getSubjectPath(subject.subject_name)}`} className="subject-btn">
                      Start {subject.subject_name}
                    </Link>
                  </div>
                );
              })}
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
          {/* ========== END UPDATED ========== */}

          {/* Desktop Grid */}
          <div className="subjects-grid">
            {subjects.map((subject) => {
              const subjectKey = getSubjectKey(subject.subject_name);
              return (
                <div key={subject.subject_id} className={`subject-page-card ${getSubjectClass(subject.subject_name)}`}>
                  <h3>{subject.subject_name}</h3>
                  <p className="subject-description">
                    {subjectDescriptions[subjectKey] || 
                     `Practice and master ${subject.subject_name} with interactive exercises.`}
                  </p>
                  <div className="subject-skills">
                    {(subjectSkills[subjectKey] || []).map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                  <div className="career-pathways">
                    <h4>Career Pathways</h4>
                    <div className="career-tags">
                      {(subjectCareers[subjectKey] || []).map((career, idx) => (
                        <span key={idx} className="career-tag">{career}</span>
                      ))}
                    </div>
                  </div>
                  <p className="exercise-count">
                    {subject.total_exercises > 0 
                      ? `${subject.total_exercises} exercises available` 
                      : 'Exercises coming soon'}
                  </p>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: subject.total_exercises > 0 
                            ? `${(subject.completed_exercises / subject.total_exercises) * 100}%` 
                            : '0%' 
                        }}
                      />
                    </div>
                    <span className="progress-text">
                      {subject.total_exercises > 0 
                        ? `${subject.completed_exercises || 0} completed (${subject.progress_percentage || 0}%)`
                        : ''}
                    </span>
                  </div>
                  <Link to={`/${getSubjectPath(subject.subject_name)}`} className="subject-btn">
                    Start {subject.subject_name}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Why Practice Section */}
          <section className="why-practice">
            <h2>Why Practice Matters</h2>
            <div className="practice-grid">
              <div className="practice-card">
                <img src={buildRetentionIcon} alt="Build Retention" className="practice-image" />
                <h4>Build Retention</h4>
                <p>Regular practice strengthens neural pathways, helping you retain information longer and recall it more easily during exams.</p>
              </div>
              <div className="practice-card">
                <img src={identifyWeaknessesIcon} alt="Identify Weaknesses" className="practice-image" />
                <h4>Identify Weaknesses</h4>
                <p>Practice reveals gaps in your understanding so you can focus your study efforts where they're needed most.</p>
              </div>
              <div className="practice-card">
                <img src={buildConfidenceIcon} alt="Build Confidence" className="practice-image" />
                <h4>Build Confidence</h4>
                <p>As you complete exercises and see your scores improve, your confidence grows — leading to better exam performance.</p>
              </div>
              <div className="practice-card">
                <img src={developSpeedIcon} alt="Develop Speed" className="practice-image" />
                <h4>Develop Speed</h4>
                <p>Regular practice improves your speed and efficiency, helping you complete exams with time to spare.</p>
              </div>
            </div>
          </section>

          {/* How to Succeed Section */}
          <section className="success-guide">
            <h2>How to Succeed with Grey Matter</h2>
            <div className="steps-grid">
              <div className="step">
                <span className="step-number">1</span>
                <h4>Start with Your Weakest Subject</h4>
                <p>Focus on the areas that need the most improvement. Our exercises help you build a strong foundation.</p>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <h4>Practice Consistently</h4>
                <p>Short, daily practice sessions are more effective than long, infrequent study sessions.</p>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <h4>Track Your Progress</h4>
                <p>Monitor your scores and completion rates to see how much you're improving over time.</p>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <h4>Review and Retake</h4>
                <p>Retake exercises to reinforce learning and improve your scores. The more you practice, the better you'll perform.</p>
              </div>
            </div>
          </section>
        </section>

        <SocialMedia />
        <FuncFooter />
      </div>
    </>
  );
}

export default Subjects;