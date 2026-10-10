import "../../styles/landing-css/TrustSection.css";

function TrustSection() {
  return (
    <section className="trust-section">
      <div className="trust-item">
        <span className="trust-number">8</span>
        <span className="trust-label">Subjects</span>
      </div>
      <div className="trust-divider"></div>
      <div className="trust-item">
        <span className="trust-number">1400+</span>
        <span className="trust-label">Exercises</span>
      </div>
      <div className="trust-divider"></div>
      <div className="trust-item">
        <span className="trust-number">100%</span>
        <span className="trust-label">Free Access</span>
      </div>
      <div className="trust-divider"></div>
      <div className="trust-item">
        <span className="trust-number">24/7</span>
        <span className="trust-label">Availability</span>
      </div>
    </section>
  );
}

export default TrustSection;