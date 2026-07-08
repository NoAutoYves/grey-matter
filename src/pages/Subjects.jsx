import { useState, useEffect, useContext } from "react";
import FuncHeader from "../components/functional-comps/FuncHeader";
import FuncFooter from "../components/functional-comps/FuncFooter";
import { Link } from "react-router-dom";
import SocialMedia from "../components/Landing/LandingSocialMedia";
import { UserContext } from "../context/UserContext";
import { api } from "../utils/api";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function Subjects() {
  const { user } = useContext(UserContext);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

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
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [user]);

  // Map subject names to CSS classes for styling
  const getSubjectClass = (subjectName) => {
    const classMap = {
      'accounting': 'accounting',
      'business': 'business',
      'economics': 'economics',
      'geography': 'geography',
      'biology': 'biology',
      'physics': 'physics',
      'maths literacy': 'mathslit',
      'mathematics': 'maths'
    };
    return classMap[subjectName.toLowerCase()] || '';
  };

  // Map subject names to paths
  const getSubjectPath = (subjectName) => {
    const pathMap = {
      'accounting': 'accounting',
      'business': 'business',
      'economics': 'economics',
      'geography': 'geography',
      'biology': 'biology',
      'physics': 'physics',
      'maths literacy': 'maths-lit',
      'mathematics': 'mathematics'
    };
    return pathMap[subjectName.toLowerCase()] || subjectName.toLowerCase();
  };

  if (loading) {
    return (
      <div className="subject-page">
        <FuncHeader />
        <section className="subjects-container">
          <Skeleton width={250} height={40} />
          <Skeleton width={400} height={20} style={{ marginBottom: '20px' }} />
          <div className="subjects-grid">
            <Skeleton count={8} height={200} style={{ marginBottom: '10px' }} />
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

        {/* AD 1 - TOP BANNER (after header, before main container) */}
        {/* <div className="sponsor-container-subjects sponsor-top">
          <div className="sponsor-placeholder">
            Advertisement
          </div>
        </div> */}

        <section className="subjects-container">
          <h2 className="subjects-title">Choose an Exercise</h2>
          <p className="subjects-subtitle">
            Select a subject below to begin an exercise. Each activity is designed to help you practice, reinforce, and expand your understanding of key concepts in a fun and interactive way.
          </p><br />

          <div className="subjects-grid">
            {subjects.map((subject) => (
              <div key={subject.subject_id} className={`subject-page-card ${getSubjectClass(subject.subject_name)}`}>
                <h3>{subject.subject_name}</h3>
                <p>
                  {subject.total_exercises > 0 
                    ? `${subject.total_exercises} exercises available` 
                    : 'Exercises coming soon'}
                </p>
                <p className="subject-progress">
                  {subject.total_exercises > 0 
                    ? `${subject.completed_exercises || 0} completed (${subject.progress_percentage || 0}%)`
                    : ''}
                </p>
                <Link to={`/${getSubjectPath(subject.subject_name)}`} className="subject-btn">
                  {subject.subject_name.toUpperCase()}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* AD 2 - LARGE RECTANGLE (after main container, before social media) */}
        {/* <div className="sponsor-container-subjects sponsor-billboard">
          <div className="sponsor-placeholder">
            Advertisement
          </div>
        </div> */}

        <SocialMedia />

        {/* AD 3 - FOOTER BANNER (after social media, before footer) */}
        {/* <div className="sponsor-container-subjects sponsor-footer">
          <div className="sponsor-placeholder">
            Advertisement
          </div>
        </div> */}

        <FuncFooter />
      </div>
    </>
  );
}

export default Subjects;