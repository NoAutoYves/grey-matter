import { useState, useEffect, useContext, useRef } from "react";
import FuncHeader from "../components/functional-comps/FuncHeader";
import FuncFooter from "../components/functional-comps/FuncFooter";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import SocialMedia from "../components/functional-comps/LandingSocialMedia";
import { UserContext } from "../context/UserContext";
import { api } from "../utils/api";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '../styles/Subjects.css';

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

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const subjectDescriptions = {
    'accounting': 'Master the language of business. Learn to record, analyze, and interpret financial information - essential for careers in finance, auditing, and business management.',
    'business': 'Explore marketing, management, finance, and entrepreneurship. Build skills for careers in business leadership, consulting, and enterprise.',
    'economics': 'Understand how markets work, supply and demand, and economic forces. Prepare for careers in economics, policy-making, banking, and finance.',
    'geography': 'Study physical geography, human geography, and environmental systems. Careers include urban planning, environmental science, GIS, and teaching.',
    'life science': 'Explore life sciences - from cells and genetics to ecosystems and evolution. Pathways to careers in medicine, healthcare, research, and environmental science.',
    'physics': 'Master the laws of nature - mechanics, energy, waves, and motion. Build a foundation for careers in engineering, technology, research, and education.',
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

  const getSubjectKey = (subjectName) => {
    const key = subjectName.toLowerCase();
    if (key === 'maths literacy' || key === 'mathematical literacy') {
      return 'mathematical literacy';
    }
    return key;
  };

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

  useEffect(() => {
    const fetchSubjects = async () => {
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
        } else {
          console.error("Failed to fetch subjects:", data.error || response.status);
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

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

  const heroDescription = `Grey Matter has over 1,300 practice exercises across eight South African high school subjects for Grades 10, 11, and 12. Every exercise is 10 multiple-choice questions with instant feedback and a full per-question breakdown. Read the chapter notes alongside the questions, retake the exercise as many times as you want, and see exactly which topics are costing you marks before the exam does. Built for the phone you already have. Free, and no sign-up needed to browse.`;

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
      <Helmet>
        <title>All Subjects | Grey Matter</title>
        <meta
          name="description"
          content="Browse all 8 subjects on Grey Matter: Accounting, Business, Economics, Geography, Life Science, Physical Sciences, Maths Literacy and Mathematics. Free interactive exercises for Grades 10, 11 and 12 with instant feedback."
        />
      </Helmet>

      <div className="subject-page">
        <FuncHeader />

        <section className="subjects-container">
          <div className="subjects-hero">
            <h1 className="subjects-title">Practice for Grades 10, 11 and 12</h1>

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

          <section className="career-skills-section">
            <h2>Where Each Subject Leads</h2>
            <p>
              Every subject on Grey Matter connects to real pathways after school. Whether you are heading into
              commerce, science, healthcare, or technology, the exercises on this platform are built around the
              same topics you will be assessed on for matric and beyond.
            </p>
            <div className="career-skills-grid">
              <div className="career-skill-card">
                <img src={businessFinanceIcon} alt="Business & Finance" className="career-skill-image" />
                <h4>Commerce</h4>
                <p>Accounting, Business Studies, Economics</p>
                <ul>
                  <li>Financial statements and ratio analysis</li>
                  <li>Business environments and legislation</li>
                  <li>Market structures and economic policy</li>
                </ul>
              </div>
              <div className="career-skill-card">
                <img src={scienceHealthcareIcon} alt="Science & Healthcare" className="career-skill-image" />
                <h4>Science and Healthcare</h4>
                <p>Life Science, Physical Sciences, Geography</p>
                <ul>
                  <li>Genetics and human systems</li>
                  <li>Mechanics, electricity, and organic chemistry</li>
                  <li>Climate, geomorphology, and settlement</li>
                </ul>
              </div>
              <div className="career-skill-card">
                <img src={dataTechnologyIcon} alt="Data & Technology" className="career-skill-image" />
                <h4>Data and Technology</h4>
                <p>Mathematics, Mathematical Literacy</p>
                <ul>
                  <li>Algebra, calculus, and trigonometry</li>
                  <li>Financial maths and data handling</li>
                  <li>Measurement and probability</li>
                </ul>
              </div>
            </div>
          </section>

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

          <section className="why-practice">
            <h2>What You Get on Grey Matter</h2>
            <div className="practice-grid">
              <div className="practice-card">
                <img src={buildRetentionIcon} alt="Instant feedback" className="practice-image" />
                <h4>10 Questions, Instant Feedback</h4>
                <p>Every exercise is exactly 10 multiple-choice questions. You see whether each answer is correct the moment you submit it, and the right answer is highlighted so you learn on the spot.</p>
              </div>
              <div className="practice-card">
                <img src={identifyWeaknessesIcon} alt="Per-question breakdown" className="practice-image" />
                <h4>Per-Question Breakdown</h4>
                <p>After the exercise, you get a full breakdown of every question: what you chose, what the correct answer was, and whether you got it right. No guessing where the marks went.</p>
              </div>
              <div className="practice-card">
                <img src={buildConfidenceIcon} alt="Chapter notes" className="practice-image" />
                <h4>Chapter Notes for Every Topic</h4>
                <p>Every topic has revision notes: definitions, key concepts, and worked examples. Read them before you start, keep them open while you answer, or come back to them after.</p>
              </div>
              <div className="practice-card">
                <img src={developSpeedIcon} alt="Retake unlimited" className="practice-image" />
                <h4>Retake, Unlimited</h4>
                <p>Every exercise can be retaken as many times as you want. Your best score is kept, every attempt is saved to your profile, and no exercise is ever locked after you complete it.</p>
              </div>
            </div>
          </section>

          <section className="success-guide">
            <h2>How to Use Grey Matter</h2>
            <div className="steps-grid">
              <div className="step">
                <span className="step-number">1</span>
                <h4>Read the notes first</h4>
                <p>Every topic has chapter notes on Grey Matter. Spend three minutes reading them before you start the exercise. You will get more out of the questions.</p>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <h4>Take the exercise</h4>
                <p>Answer all 10 questions. You will get immediate feedback on each one, so you know before you finish whether the topic is solid or shaky.</p>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <h4>Review what you got wrong</h4>
                <p>Scroll through the per-question breakdown on the results page. Focus on the questions you missed, not the ones you got right.</p>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <h4>Retake after a few days</h4>
                <p>Come back to the same exercise two or three days later. If you can hit 8 out of 10 on the retake, the topic is solid. If not, revisit the notes and try again.</p>
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