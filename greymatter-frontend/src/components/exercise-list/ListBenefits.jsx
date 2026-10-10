import "../../styles/exercise-list/ListBenefits.css";
import scientificReasoningIcon from "../../assets/images/func-images/scientific_reasoning.png";

function ListBenefits({ subjectName, benefits }) {
  const getBenefitIcon = (benefit) => benefit.icon || scientificReasoningIcon;

  return (
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
  );
}

export default ListBenefits;