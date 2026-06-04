import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import { UserContext } from "../context/UserContext";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import SocialMedia from "../components/Landing/LandingSocialMedia";
import { apiRequest } from "../utils/api";

function ExerciseList() {
  const { subject } = useParams();
  const { user } = useContext(UserContext);
  const [groupedTopics, setGroupedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await apiRequest(`/api/exercises/${subject}/topics`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok) {
          setGroupedTopics(data.grouped_topics || []);
          setSubjectName(data.subject_name);
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

  const handleTopicClick = (topicId) => {
    navigate(`/${subject}/topic/${topicId}`);
  };

  if (loading) {
    return (
      <div className="quiz-list-page">
        <FuncHeader />
        <section className="quiz-list-container">
          <Skeleton width={200} height={30} />
          <Skeleton width={180} height={20} style={{ marginBottom: '20px' }} />
          <Skeleton count={6} height={60} style={{ marginBottom: '10px' }} />
        </section>
        <FuncFooter />
      </div>
    );
  }

  return (
    <div className={`quiz-list-page ${subject}`}>
      <FuncHeader />
      
      <div className="sponsor-container-list sponsor-top">
        <div className="sponsor-placeholder">
          Advertisement
        </div>
      </div>
      
      <section className="quiz-list-container">
        <h2 className="quiz-list-title">{subjectName} Topics</h2>
        <p className="quiz-list-subtitle">Select a topic to view exercises:</p>

        {groupedTopics.length > 0 ? (
          <div className="topics-by-grade">
            {groupedTopics.map((gradeGroup) => (
              <div key={gradeGroup.grade_level} className="grade-section">
                <h3 className="grade-header">{gradeGroup.grade_display}</h3>
                <div className="topics-grid">
                  {gradeGroup.topics.map((topic) => (
                    <div 
                      key={topic.topic_id} 
                      className="topic-card"
                      onClick={() => handleTopicClick(topic.topic_id)}
                    >
                      <h4 className="topic-title">{topic.topic_name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-quizzes">No topics available for this subject yet.</p>
        )}
      </section>

      <SocialMedia />
      
      <div className="sponsor-container-list sponsor-billboard">
        <div className="sponsor-placeholder">
          Advertisement
        </div>
      </div>
      
      <FuncFooter />
    </div>
  );
}

export default ExerciseList;