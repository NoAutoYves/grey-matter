import FuncHeader from "../components/functional-comps/FuncHeader";
import FuncFooter from "../components/functional-comps/FuncFooter";
import { Link } from "react-router-dom";
import SocialMedia from "../components/Landing/LandingSocialMedia";

function Subjects() {
  // Hardcoded subjects
  const subjects = [
    { id: 1, name: "Accounting", path: "accounting", class: "accounting" },
    { id: 2, name: "Business", path: "business", class: "business" },
    { id: 4, name: "Economics", path: "economics", class: "economics" },
    { id: 5, name: "Geography", path: "geography", class: "geography" },
    { id: 6, name: "Biology", path: "biology", class: "biology" },
    { id: 7, name: "Physics", path: "physics", class: "physics" },
    { id: 8, name: "Maths Literacy", path: "maths-lit", class: "mathslit" },
    { id: 9, name: "Mathematics", path: "maths", class: "maths" }
  ];

  return (
    <>
      <div className="subject-page">
        <FuncHeader />

        <section className="subjects-container">
          <h2 className="subjects-title">Choose an Exercise</h2>
          <p className="subjects-subtitle">
            Select a subject below to begin an exercise. Each activity is designed to help you practice, reinforce, and expand your understanding of key concepts in a fun and interactive way.
          </p><br />

          <div className="subjects-grid">
            {subjects.map((subject) => (
              <div key={subject.id} className={`subject-page-card ${subject.class}`}>
                <h3>{subject.name}</h3>
                <p>
                  Work through exercises that challenge your grasp of {subject.name.toLowerCase()} principles.
                </p>
                <Link to={`/exercises/${subject.path}`} className="subject-btn">
                  {subject.name.toUpperCase()}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <SocialMedia />
        <FuncFooter />
      </div>
    </>
  );
}

export default Subjects;