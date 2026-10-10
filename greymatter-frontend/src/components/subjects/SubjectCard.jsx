import { Link } from "react-router-dom";
import "../../styles/subjects/SubjectCard.css";

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

function getSubjectKey(subjectName) {
  const key = subjectName.toLowerCase();
  if (key === 'maths literacy' || key === 'mathematical literacy') {
    return 'mathematical literacy';
  }
  return key;
}

function getSubjectClass(subjectName) {
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
}

function getSubjectPath(subjectName) {
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
}

function SubjectCard({ subject, variant }) {
  const subjectKey = getSubjectKey(subject.subject_name);
  const wrapperClass = variant === "carousel" ? "subject-carousel-card" : "subject-page-card";

  return (
    <div className={`${wrapperClass} ${getSubjectClass(subject.subject_name)}`}>
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
      <Link to={`/${getSubjectPath(subject.subject_name)}/`} className="subject-btn">
        Start {subject.subject_name}
      </Link>
    </div>
  );
}

export default SubjectCard;