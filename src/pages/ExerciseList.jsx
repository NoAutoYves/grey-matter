import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import { UserContext } from "../context/UserContext";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import SocialMedia from "../components/Landing/LandingSocialMedia";
import { api } from "../utils/api";
import { getSubjectName } from "../utils/subjectMap";
import '../styles/List.css';

// Import image icons
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

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const subjectDbName = getSubjectName(subject);
        console.log(`Fetching topics for: ${subject} → ${subjectDbName}`);
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
    
    if (user) {
      fetchTopics();
    } else {
      setLoading(false);
    }
  }, [subject, user]);

  // ========== FIX: Convert subject slug to database name for navigation ==========
  const handleTopicClick = (topicId) => {
    const subjectDbName = getSubjectName(subject);
    navigate(`/${encodeURIComponent(subjectDbName)}/topic/${topicId}`);
  };
  // ========== END FIX ==========

  // Comprehensive subject descriptions - 500+ unique words across all sections
  const subjectDescriptions = {
    'accounting': 'Accounting is the language of business — a systematic process of identifying, recording, measuring, classifying, verifying, summarizing, interpreting, and communicating financial information. Through our interactive accounting exercises, you will master the fundamental principles that underpin financial reporting, including double-entry bookkeeping, trial balances, income statements, balance sheets, cash flow statements, and financial ratio analysis. These exercises prepare you for careers in auditing, taxation, financial consulting, corporate finance, and management accounting by building a strong foundation in analytical thinking, attention to detail, and ethical financial practice.',
    
    'business': 'Business studies explore the dynamic world of commerce, enterprise, and organizational management. Our comprehensive business exercises cover essential topics including marketing strategy, consumer behavior, human resource management, operations management, financial planning, business law, and entrepreneurship. You will develop critical skills in strategic thinking, problem-solving, decision-making, leadership, and effective communication. These exercises provide a solid foundation for careers in business management, consulting, marketing, human resources, and entrepreneurship, helping you understand how organizations create value, compete in markets, and adapt to changing economic environments.',
    
    'economics': 'Economics is the study of how individuals, businesses, governments, and societies allocate scarce resources to satisfy unlimited wants and needs. Our interactive economics exercises explore both microeconomics and macroeconomics, covering supply and demand analysis, market structures (perfect competition, monopoly, oligopoly, and monopolistic competition), price determination, elasticity, consumer behavior, production theory, market failure, national income accounting, inflation, unemployment, fiscal policy, monetary policy, international trade, exchange rates, and economic development. These exercises build analytical skills essential for careers in economics, banking, finance, policy analysis, and government service.',
    
    'geography': 'Geography bridges the natural and social sciences, exploring the relationships between people, places, and environments. Our geography exercises cover physical geography (landforms, climate systems, weather patterns, biomes, ecosystems, and natural hazards), human geography (population dynamics, migration, urbanization, settlement patterns, cultural landscapes, economic activities, and political geography), and environmental geography (resource management, sustainability, conservation, climate change, and environmental impact assessment). These exercises develop spatial awareness, critical thinking, and analytical skills for careers in urban planning, environmental science, GIS, teaching, and international development.',
    
    'life science': 'Life Science is the study of living organisms — their structure, function, growth, evolution, distribution, and interactions with their environment. Our comprehensive life science exercises cover cell biology (cell structure, organelles, cell division, and cellular processes), genetics (DNA, genes, inheritance, genetic variation, and biotechnology), ecology (ecosystems, food webs, biodiversity, population dynamics, and conservation), human anatomy and physiology (body systems, homeostasis, and health), evolution (natural selection, adaptation, speciation, and evolutionary relationships), and microbiology. These exercises build knowledge essential for careers in medicine, healthcare, research, pharmaceuticals, environmental science, and biotechnology.',
    
    'physics': 'Physics is the fundamental science that explores the laws governing matter, energy, space, and time. Our physics exercises cover mechanics (kinematics, dynamics, forces, motion, work, energy, power, momentum, and gravitation), waves and optics (wave properties, sound, light, reflection, refraction, diffraction, and interference), electricity and magnetism (electric circuits, current, voltage, resistance, magnetic fields, and electromagnetic induction), thermodynamics (heat, temperature, entropy, and thermodynamic processes), and modern physics (quantum mechanics, relativity, and nuclear physics). These exercises develop problem-solving, analytical, and mathematical skills essential for careers in engineering, technology, research, education, and applied sciences.',
    
    'maths literacy': 'Maths Literacy focuses on applying mathematical concepts to real-world situations, developing practical numeracy skills that are essential for everyday life, work, and informed citizenship. Our exercises cover financial maths (budgeting, interest calculations, loans, investments, taxation, and financial planning), data analysis (statistics, probability, graphs, and data interpretation), measurement (units, conversions, area, volume, and scale), and mathematical reasoning (logical thinking, problem-solving, and decision-making). These exercises build practical skills for careers in business, finance, data analysis, retail, hospitality, and general management, as well as informed personal financial management.',
    
    'mathematics': 'Mathematics is the language of pattern, structure, and logical reasoning — a discipline that underpins science, technology, engineering, and virtually every field of human endeavor. Our comprehensive mathematics exercises cover algebra (equations, inequalities, functions, polynomials, and sequences), calculus (limits, derivatives, integration, optimization, and applications), statistics and probability (data analysis, distributions, hypothesis testing, and probabilistic reasoning), geometry (properties of shapes, transformations, and spatial reasoning), trigonometry (ratios, identities, equations, and applications), and number theory. These exercises build rigorous analytical thinking, problem-solving, and quantitative reasoning skills essential for careers in data science, engineering, finance, technology, research, and academia.',
    
    'maths': 'Mathematics is the language of pattern, structure, and logical reasoning — a discipline that underpins science, technology, engineering, and virtually every field of human endeavor. Our comprehensive mathematics exercises cover algebra (equations, inequalities, functions, polynomials, and sequences), calculus (limits, derivatives, integration, optimization, and applications), statistics and probability (data analysis, distributions, hypothesis testing, and probabilistic reasoning), geometry (properties of shapes, transformations, and spatial reasoning), trigonometry (ratios, identities, equations, and applications), and number theory. These exercises build rigorous analytical thinking, problem-solving, and quantitative reasoning skills essential for careers in data science, engineering, finance, technology, research, and academia.'
  };

  // Topic-specific content
  const topicBenefits = {
    'accounting': ['Financial literacy', 'Analytical thinking', 'Ethical financial practice', 'Decision-making skills'],
    'business': ['Strategic thinking', 'Problem-solving', 'Leadership skills', 'Communication skills'],
    'economics': ['Analytical skills', 'Policy understanding', 'Market awareness', 'Global perspective'],
    'geography': ['Spatial awareness', 'Critical thinking', 'Environmental literacy', 'Global understanding'],
    'life science': ['Scientific inquiry', 'Research skills', 'Health literacy', 'Environmental awareness'],
    'physics': ['Problem-solving', 'Analytical thinking', 'Mathematical skills', 'Scientific reasoning'],
    'maths literacy': ['Practical numeracy', 'Financial literacy', 'Data literacy', 'Decision-making'],
    'mathematics': ['Critical thinking', 'Problem-solving', 'Analytical reasoning', 'Quantitative skills'],
    'maths': ['Critical thinking', 'Problem-solving', 'Analytical reasoning', 'Quantitative skills']
  };

  // Map benefits to icons
  const benefitIconMap = {
    'Financial literacy': scientificReasoningIcon,
    'Analytical thinking': analyticalThinkingIcon,
    'Ethical financial practice': problemSolvingIcon,
    'Decision-making skills': mathematicalSkillsIcon,
    'Strategic thinking': scientificReasoningIcon,
    'Problem-solving': problemSolvingIcon,
    'Leadership skills': analyticalThinkingIcon,
    'Communication skills': mathematicalSkillsIcon,
    'Analytical skills': analyticalThinkingIcon,
    'Policy understanding': scientificReasoningIcon,
    'Market awareness': problemSolvingIcon,
    'Global perspective': mathematicalSkillsIcon,
    'Spatial awareness': scientificReasoningIcon,
    'Critical thinking': analyticalThinkingIcon,
    'Environmental literacy': problemSolvingIcon,
    'Global understanding': mathematicalSkillsIcon,
    'Scientific inquiry': scientificReasoningIcon,
    'Research skills': problemSolvingIcon,
    'Health literacy': analyticalThinkingIcon,
    'Environmental awareness': mathematicalSkillsIcon,
    'Mathematical skills': mathematicalSkillsIcon,
    'Scientific reasoning': scientificReasoningIcon,
    'Practical numeracy': problemSolvingIcon,
    'Data literacy': mathematicalSkillsIcon,
    'Quantitative skills': mathematicalSkillsIcon,
    'Analytical reasoning': analyticalThinkingIcon,
    'Knowledge building': scientificReasoningIcon,
    'Skill development': problemSolvingIcon,
    'Exam preparation': analyticalThinkingIcon,
    'Confidence building': mathematicalSkillsIcon
  };

  const getSubjectDescription = () => {
    const key = subject?.toLowerCase() || '';
    return subjectDescriptions[key] || `${subjectName} exercises designed to reinforce key concepts and prepare you for exams.`;
  };

  const getTopicBenefits = () => {
    const key = subject?.toLowerCase() || '';
    return topicBenefits[key] || ['Knowledge building', 'Skill development', 'Exam preparation', 'Confidence building'];
  };

  const getBenefitIcon = (benefit) => {
    return benefitIconMap[benefit] || scientificReasoningIcon;
  };

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

  const fullDescription = getSubjectDescription();
  const truncatedDescription = getTruncatedDescription(fullDescription);

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

  const benefits = getTopicBenefits();

  return (
    <div className={`quiz-list-page ${subject}`}>
      <FuncHeader />
      
      <section className="quiz-list-container">
        {/* Hero Content */}
        <div className="list-hero">
          <h1 className="list-title">{subjectName} Topics</h1>
          
          {/* Description with expand/collapse */}
          <div className="list-description-wrapper">
            <p className="list-description">
              <span className="desktop-full">{fullDescription}</span>
              <span className="mobile-truncated">{isExpanded ? fullDescription : truncatedDescription}</span>
            </p>
            <button 
              className="expand-toggle" 
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Show less" : "Read more"}
            >
              {isExpanded ? 'Show less ↑' : 'Read more ↓'}
            </button>
          </div>
          
          {totalExercises > 0 && (
            <div className="list-stats">
              <span className="stat-badge">
                📚 {totalExercises} exercises
              </span>
              <span className="stat-badge">
                ✅ {completedExercises} completed
              </span>
            </div>
          )}
        </div>

        {/* Why Practice Section */}
        <section className="practice-benefits">
          <h2>What You'll Gain from Practicing {subjectName}</h2>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <img 
                  src={getBenefitIcon(benefit)} 
                  alt={benefit} 
                  className="benefit-image"
                />
                <h4>{benefit}</h4>
                <p>Develop essential skills that will serve you beyond the classroom, in exams, further education, and your future career.</p>
              </div>
            ))}
          </div>
        </section>

        {/* Topic Grid */}
        {groupedTopics.length > 0 ? (
          <div className="topics-by-grade">
            {groupedTopics.map((gradeGroup) => (
              <div key={gradeGroup.grade_level} className="grade-section">
                <h2 className="grade-header">{gradeGroup.grade_display}</h2>
                <div className="topics-grid">
                  {gradeGroup.topics.map((topic) => (
                    <div 
                      key={topic.topic_id} 
                      className="topic-card"
                      onClick={() => handleTopicClick(topic.topic_id)}
                    >
                      <h3 className="topic-title">{topic.topic_name}</h3>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-quizzes">No topics available for this subject yet. Check back soon!</p>
        )}

        {/* How It Works */}
        <section className="how-it-works">
          <h2>Your Learning Journey</h2>
          <div className="steps-row">
            <div className="step-item">
              <span className="step-num">1</span>
              <p>Select a topic</p>
            </div>
            <span className="step-arrow">→</span>
            <div className="step-item">
              <span className="step-num">2</span>
              <p>Answer 10 questions</p>
            </div>
            <span className="step-arrow">→</span>
            <div className="step-item">
              <span className="step-num">3</span>
              <p>View your results</p>
            </div>
            <span className="step-arrow">→</span>
            <div className="step-item">
              <span className="step-num">4</span>
              <p>Track progress</p>
            </div>
          </div>
          <p className="learning-note">
            Each exercise is designed to challenge your understanding, reinforce key concepts, and build the confidence you need to succeed in assessments and beyond.
          </p>
        </section>
      </section>

      <SocialMedia />
      <FuncFooter />
    </div>
  );
}

export default ExerciseList;