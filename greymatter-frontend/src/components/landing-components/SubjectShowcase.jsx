import LandingSubjects from "../functional-comps/LandingSubjects";
import "../../styles/landing-css/SubjectShowcase.css";

function SubjectShowcase() {
  return (
    <section className="subject-showcase">
      <h2>Explore Our Subjects</h2>
      <p className="showcase-description">
        Choose a subject below and begin mastering key concepts with our interactive exercises designed to prepare you for success.
      </p>
      <LandingSubjects />
    </section>
  );
}

export default SubjectShowcase;