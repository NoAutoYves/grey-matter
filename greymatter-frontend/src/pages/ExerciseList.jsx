import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import { UserContext } from "../context/UserContext";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import SocialMedia from "../components/functional-comps/LandingSocialMedia";
import { api } from "../utils/api";
import { getSubjectName } from "../utils/subjectMap";
import { subjectContent, getSubjectContentKey } from "../data/subjectContent";
import '../styles/ExerciseList.css';

import scientificReasoningIcon from "../assets/images/func-images/scientific_reasoning.png";
import problemSolvingIcon from "../assets/images/func-images/problem_solving.png";
import analyticalThinkingIcon from "../assets/images/func-images/analytical_thinking.png";
import mathematicalSkillsIcon from "../assets/images/func-images/mathematical_skills.png";

function ExerciseList() {
  const { subject } = useParams();
  const { user } = useContext(UserContext);
  const [groupedTopics, setGroupedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState("");
  const [totalExercises, setTotalExercises] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const [activeGradeIdx, setActiveGradeIdx] = useState(0);
  const [gradeAtStart, setGradeAtStart] = useState(true);
  const [gradeAtEnd, setGradeAtEnd] = useState(false);
  const gradeScrollerRef = useRef(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const subjectDbName = getSubjectName(subject);
        const response = await api.get(`/api/exercises/${encodeURIComponent(subjectDbName)}/topics`);

        const data = await response.json();

        if (response.ok) {
          setGroupedTopics(data.grouped_topics || []);
          setSubjectName(data.subject_name || subjectDbName);

          let total = 0;
          let completed = 0;
          data.grouped_topics.forEach(grade => {
            grade.topics.forEach(topic => {
              if (topic.exercise_count) {
                total += topic.exercise_count;
              }
            });
          });
          setTotalExercises(total);
          setCompletedExercises(completed);
        }
      } catch (error) {
        console.error("Failed to fetch topics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [subject, user]);

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

  const handleTopicClick = (topicId) => {
    navigate(`/${subject}/topic/${topicId}`);
  };

  const subjectDescriptions = {
    'accounting': 'Accounting is the language of business. It is the systematic process of identifying, recording, measuring, classifying, verifying, summarizing, interpreting, and communicating financial information. Through our interactive accounting exercises, you will master the fundamental principles that underpin financial reporting, including double-entry bookkeeping, trial balances, income statements, balance sheets, cash flow statements, and financial ratio analysis. These exercises prepare you for careers in auditing, taxation, financial consulting, corporate finance, and management accounting by building a strong foundation in analytical thinking, attention to detail, and ethical financial practice.',

    'business': 'Business studies explore the dynamic world of commerce, enterprise, and organizational management. Our comprehensive business exercises cover essential topics including marketing strategy, consumer behavior, human resource management, operations management, financial planning, business law, and entrepreneurship. You will develop critical skills in strategic thinking, problem-solving, decision-making, leadership, and effective communication. These exercises provide a solid foundation for careers in business management, consulting, marketing, human resources, and entrepreneurship, helping you understand how organizations create value, compete in markets, and adapt to changing economic environments.',

    'economics': 'Economics is the study of how individuals, businesses, governments, and societies allocate scarce resources to satisfy unlimited wants and needs. Our interactive economics exercises explore both microeconomics and macroeconomics, covering supply and demand analysis, market structures (perfect competition, monopoly, oligopoly, and monopolistic competition), price determination, elasticity, consumer behavior, production theory, market failure, national income accounting, inflation, unemployment, fiscal policy, monetary policy, international trade, exchange rates, and economic development. These exercises build analytical skills essential for careers in economics, banking, finance, policy analysis, and government service.',

    'geography': 'Geography bridges the natural and social sciences, exploring the relationships between people, places, and environments. Our geography exercises cover physical geography (landforms, climate systems, weather patterns, biomes, ecosystems, and natural hazards), human geography (population dynamics, migration, urbanization, settlement patterns, cultural landscapes, economic activities, and political geography), and environmental geography (resource management, sustainability, conservation, climate change, and environmental impact assessment). These exercises develop spatial awareness, critical thinking, and analytical skills for careers in urban planning, environmental science, GIS, teaching, and international development.',

    'life science': 'Life Science is the study of living organisms, their structure, function, growth, evolution, distribution, and interactions with their environment. Our comprehensive life science exercises cover cell biology (cell structure, organelles, cell division, and cellular processes), genetics (DNA, genes, inheritance, genetic variation, and biotechnology), ecology (ecosystems, food webs, biodiversity, population dynamics, and conservation), human anatomy and physiology (body systems, homeostasis, and health), evolution (natural selection, adaptation, speciation, and evolutionary relationships), and microbiology. These exercises build knowledge essential for careers in medicine, healthcare, research, pharmaceuticals, environmental science, and biotechnology.',

    'physics': 'Physics is the fundamental science that explores the laws governing matter, energy, space, and time. Our physics exercises cover mechanics (kinematics, dynamics, forces, motion, work, energy, power, momentum, and gravitation), waves and optics (wave properties, sound, light, reflection, refraction, diffraction, and interference), electricity and magnetism (electric circuits, current, voltage, resistance, magnetic fields, and electromagnetic induction), thermodynamics (heat, temperature, entropy, and thermodynamic processes), and modern physics (quantum mechanics, relativity, and nuclear physics). These exercises develop problem-solving, analytical, and mathematical skills essential for careers in engineering, technology, research, education, and applied sciences.',

    'maths literacy': 'Maths Literacy focuses on applying mathematical concepts to real-world situations, developing practical numeracy skills that are essential for everyday life, work, and informed citizenship. Our exercises cover financial maths (budgeting, interest calculations, loans, investments, taxation, and financial planning), data analysis (statistics, probability, graphs, and data interpretation), measurement (units, conversions, area, volume, and scale), and mathematical reasoning (logical thinking, problem-solving, and decision-making). These exercises build practical skills for careers in business, finance, data analysis, retail, hospitality, and general management, as well as informed personal financial management.',

    'mathematics': 'Mathematics is the language of pattern, structure, and logical reasoning. It is a discipline that underpins science, technology, engineering, and virtually every field of human endeavor. Our comprehensive mathematics exercises cover algebra (equations, inequalities, functions, polynomials, and sequences), calculus (limits, derivatives, integration, optimization, and applications), statistics and probability (data analysis, distributions, hypothesis testing, and probabilistic reasoning), geometry (properties of shapes, transformations, and spatial reasoning), trigonometry (ratios, identities, equations, and applications), and number theory. These exercises build rigorous analytical thinking, problem-solving, and quantitative reasoning skills essential for careers in data science, engineering, finance, technology, research, and academia.',

    'maths': 'Mathematics is the language of pattern, structure, and logical reasoning. It is a discipline that underpins science, technology, engineering, and virtually every field of human endeavor. Our comprehensive mathematics exercises cover algebra (equations, inequalities, functions, polynomials, and sequences), calculus (limits, derivatives, integration, optimization, and applications), statistics and probability (data analysis, distributions, hypothesis testing, and probabilistic reasoning), geometry (properties of shapes, transformations, and spatial reasoning), trigonometry (ratios, identities, equations, and applications), and number theory. These exercises build rigorous analytical thinking, problem-solving, and quantitative reasoning skills essential for careers in data science, engineering, finance, technology, research, and academia.'
  };

  const getTopicBenefits = () => {
    const key = subject?.toLowerCase() || '';

    const benefitsMap = {
      'accounting': [
        { name: 'Financial Literacy', icon: scientificReasoningIcon, description: 'Understand financial statements, cash flow, and accounting principles to make informed business decisions.' },
        { name: 'Analytical Thinking', icon: analyticalThinkingIcon, description: 'Develop the ability to analyze financial data, identify patterns, and draw meaningful conclusions.' },
        { name: 'Ethical Practice', icon: problemSolvingIcon, description: 'Learn the importance of ethics, transparency, and accountability in financial reporting and business.' },
        { name: 'Decision-Making Skills', icon: mathematicalSkillsIcon, description: 'Build confidence in making sound financial decisions based on accurate data and professional judgment.' }
      ],
      'business': [
        { name: 'Strategic Thinking', icon: scientificReasoningIcon, description: 'Develop the ability to formulate long-term plans and make decisions that drive organizational success.' },
        { name: 'Problem-Solving', icon: problemSolvingIcon, description: 'Learn to identify business challenges and develop effective, innovative solutions.' },
        { name: 'Leadership Skills', icon: analyticalThinkingIcon, description: 'Build the skills needed to lead teams, manage resources, and inspire others to achieve shared goals.' },
        { name: 'Communication Skills', icon: mathematicalSkillsIcon, description: 'Master professional communication, negotiation, and presentation skills essential in business.' }
      ],
      'economics': [
        { name: 'Analytical Skills', icon: analyticalThinkingIcon, description: 'Learn to analyze economic data, understand market behavior, and evaluate policy impacts.' },
        { name: 'Policy Understanding', icon: scientificReasoningIcon, description: 'Gain insight into how government policies, monetary systems, and trade affect national and global economies.' },
        { name: 'Market Awareness', icon: problemSolvingIcon, description: 'Understand supply and demand, market structures, and how competition drives economic efficiency.' },
        { name: 'Global Perspective', icon: mathematicalSkillsIcon, description: 'Develop a global outlook on international trade, exchange rates, and economic development.' }
      ],
      'geography': [
        { name: 'Spatial Awareness', icon: scientificReasoningIcon, description: 'Develop the ability to interpret maps, understand spatial patterns, and analyze geographic data.' },
        { name: 'Critical Thinking', icon: analyticalThinkingIcon, description: 'Learn to evaluate environmental issues, understand human-environment interactions, and propose solutions.' },
        { name: 'Environmental Literacy', icon: problemSolvingIcon, description: 'Build understanding of ecosystems, climate change, sustainability, and natural resource management.' },
        { name: 'Global Understanding', icon: mathematicalSkillsIcon, description: 'Appreciate global diversity, cultural landscapes, urbanization, and international development challenges.' }
      ],
      'life science': [
        { name: 'Scientific Inquiry', icon: scientificReasoningIcon, description: 'Develop skills in observation, hypothesis formation, experimentation, and data analysis in biology.' },
        { name: 'Research Skills', icon: problemSolvingIcon, description: 'Learn to conduct biological research, analyze findings, and present scientific conclusions effectively.' },
        { name: 'Health Literacy', icon: analyticalThinkingIcon, description: 'Understand human anatomy, physiology, and the biological basis of health and disease.' },
        { name: 'Environmental Awareness', icon: mathematicalSkillsIcon, description: 'Build knowledge of ecosystems, biodiversity, conservation, and human impact on the environment.' }
      ],
      'physics': [
        { name: 'Problem-Solving', icon: problemSolvingIcon, description: 'Learn systematic approaches to solving complex physical problems using mathematical and logical reasoning.' },
        { name: 'Analytical Thinking', icon: analyticalThinkingIcon, description: 'Develop skills in breaking down physical systems, analyzing forces, and predicting outcomes.' },
        { name: 'Mathematical Skills', icon: mathematicalSkillsIcon, description: 'Apply algebra, geometry, calculus, and quantitative analysis to understand physical phenomena.' },
        { name: 'Scientific Reasoning', icon: scientificReasoningIcon, description: 'Build understanding of the scientific method, experimental design, and the laws governing the universe.' }
      ],
      'maths literacy': [
        { name: 'Practical Numeracy', icon: problemSolvingIcon, description: 'Apply mathematical skills to real-world scenarios including budgeting, finance, and data analysis.' },
        { name: 'Financial Literacy', icon: scientificReasoningIcon, description: 'Understand interest calculations, loans, investments, and personal financial planning.' },
        { name: 'Data Literacy', icon: mathematicalSkillsIcon, description: 'Learn to interpret charts, graphs, statistics, and make data-driven decisions.' },
        { name: 'Decision-Making', icon: analyticalThinkingIcon, description: 'Build confidence in making practical, informed decisions based on quantitative analysis.' }
      ],
      'mathematics': [
        { name: 'Critical Thinking', icon: analyticalThinkingIcon, description: 'Learn to approach problems logically, identify patterns, and develop rigorous mathematical arguments.' },
        { name: 'Problem-Solving', icon: problemSolvingIcon, description: 'Master strategies for tackling complex mathematical problems across algebra, calculus, and geometry.' },
        { name: 'Analytical Reasoning', icon: scientificReasoningIcon, description: 'Build the ability to analyze structures, prove theorems, and understand mathematical relationships.' },
        { name: 'Quantitative Skills', icon: mathematicalSkillsIcon, description: 'Develop strong quantitative abilities essential for science, engineering, finance, and technology careers.' }
      ],
      'maths': [
        { name: 'Critical Thinking', icon: analyticalThinkingIcon, description: 'Learn to approach problems logically, identify patterns, and develop rigorous mathematical arguments.' },
        { name: 'Problem-Solving', icon: problemSolvingIcon, description: 'Master strategies for tackling complex mathematical problems across algebra, calculus, and geometry.' },
        { name: 'Analytical Reasoning', icon: scientificReasoningIcon, description: 'Build the ability to analyze structures, prove theorems, and understand mathematical relationships.' },
        { name: 'Quantitative Skills', icon: mathematicalSkillsIcon, description: 'Develop strong quantitative abilities essential for science, engineering, finance, and technology careers.' }
      ]
    };

    return benefitsMap[key] || [
      { name: 'Knowledge Building', icon: scientificReasoningIcon, description: 'Build a strong foundation in key concepts and principles.' },
      { name: 'Skill Development', icon: problemSolvingIcon, description: 'Develop practical skills that apply to real-world scenarios.' },
      { name: 'Exam Preparation', icon: analyticalThinkingIcon, description: 'Prepare effectively for assessments and examinations.' },
      { name: 'Confidence Building', icon: mathematicalSkillsIcon, description: 'Gain confidence through practice and mastery of content.' }
    ];
  };

  const getSubjectDescription = () => {
    const key = subject?.toLowerCase() || '';
    return subjectDescriptions[key] || `${subjectName} exercises designed to reinforce key concepts and prepare you for exams.`;
  };

  const getBenefitIcon = (benefit) => {
    return benefit.icon || scientificReasoningIcon;
  };

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

  const renderInline = (text) => {
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
  };

  const fullDescription = getSubjectDescription();
  const truncatedDescription = getTruncatedDescription(fullDescription);
  const benefits = getTopicBenefits();

  const guideKey = getSubjectContentKey(subject);
  const guide = guideKey ? subjectContent[guideKey] : null;

  if (loading) {
    return (
      <div className="quiz-list-page">
        <FuncHeader />
        <section className="quiz-list-container">
          <Skeleton width={250} height={40} />
          <Skeleton width={400} height={20} style={{ marginBottom: '20px' }} />
          <div className="topics-grid">
            <Skeleton count={6} height={100} style={{ marginBottom: '10px' }} />
          </div>
        </section>
        <FuncFooter />
      </div>
    );
  }

  return (
    <div className={`quiz-list-page ${subject}`}>
      <Helmet>
        <title>{subjectName ? `${subjectName} Topics | Grey Matter` : "Topics | Grey Matter"}</title>
        <meta
          name="description"
          content={
            subjectName
              ? `Practice ${subjectName} with free interactive exercises on Grey Matter. Choose a topic, answer 10 questions, get instant feedback and track your progress.`
              : "Practice high school subjects with free interactive exercises on Grey Matter."
          }
        />
      </Helmet>

      <FuncHeader />

      <section className="quiz-list-container">
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

        <section className="list-practice-benefits">
          <h2>What You'll Gain from Practicing {subjectName}</h2>
          <div className="list-benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="list-benefit-card">
                <img
                  src={getBenefitIcon(benefit)}
                  alt={benefit.name}
                  className="list-benefit-image"
                />
                <h4>{benefit.name}</h4>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {groupedTopics.length > 0 ? (
          <>
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
                          onClick={() => handleTopicClick(topic.topic_id)}
                        >
                          <h3 className="topic-list-title">{topic.topic_name}</h3>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
          </>
        ) : (
          <p className="no-list-quizzes">No topics available for this subject yet. Check back soon!</p>
        )}

        {guide && (
          <section className="subject-guide">
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
          </section>
        )}

        <section className="list-how-it-works">
          <h2>How to Use These Exercises</h2>
          <div className="list-steps-row">
            <div className="list-step-item">
              <span className="list-step-num">1</span>
              <p>Read the chapter notes</p>
            </div>
            <span className="list-step-arrow">→</span>
            <div className="list-step-item">
              <span className="list-step-num">2</span>
              <p>Answer the 10 questions</p>
            </div>
            <span className="list-step-arrow">→</span>
            <div className="list-step-item">
              <span className="list-step-num">3</span>
              <p>Review the breakdown</p>
            </div>
            <span className="list-step-arrow">→</span>
            <div className="list-step-item">
              <span className="list-step-num">4</span>
              <p>Retake in a few days</p>
            </div>
          </div>
          <p className="list-learning-note">
            Most learners need two or three passes through a topic before it sticks. Read the notes, take the exercise, review the per-question breakdown, then come back to the same exercise in two or three days. If you can hit 8 out of 10 on the retake, the topic is solid.
          </p>
        </section>

      </section>

      <SocialMedia />
      <FuncFooter />
    </div>
  );
}

export default ExerciseList;