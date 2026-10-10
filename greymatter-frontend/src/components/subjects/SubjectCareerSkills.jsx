import "../../styles/subjects/SubjectCareerSkills.css";

import businessFinanceIcon from "../../assets/images/func-images/business_and_finance.png";
import scienceHealthcareIcon from "../../assets/images/func-images/science_and_healthcare.png";
import dataTechnologyIcon from "../../assets/images/func-images/data_and_technology.png";

function SubjectCareerSkills() {
  return (
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
  );
}

export default SubjectCareerSkills;