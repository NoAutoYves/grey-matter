import SubjectCard from "./SubjectCard";
import "../../styles/subjects/SubjectsGrid.css";

function SubjectsGrid({ subjects }) {
  return (
    <div className="subjects-grid">
      {subjects.map((subject) => (
        <SubjectCard key={subject.subject_id} subject={subject} variant="grid" />
      ))}
    </div>
  );
}

export default SubjectsGrid;