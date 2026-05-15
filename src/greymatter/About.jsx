import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";

function About() {
  return (
    <div className="info-page">
      <FuncHeader />
      {/* AD 1 - LEADERBOARD (below header, above profile container) */}
      <div className="sponsor-container-profile sponsor-top">
        <div className="sponsor-placeholder">
          Advertisement (Leaderboard - 728x90)
        </div>
      </div>
      <div className="info-container policy-container">
        <h1>About Grey Matter</h1>
        
        <h2>Who We Are</h2>
        <p>Grey Matter is an interactive e-learning platform designed to help high school students practice and improve their understanding of academic subjects through structured multiple-choice exercises.</p>
        
        <h2>Our Mission</h2>
        <p>To provide an accessible, engaging study tool that supports consistent practice and self-assessment across key academic subjects.</p>
        
        <h2>What We Offer</h2>
        <p>• Subject-specific exercises across multiple subjects<br />• Immediate feedback on answers<br />• Performance tracking and exercise history<br />• Built-in notes for study reminders</p>

        <h1 style={{ marginTop: '2rem' }}>Disclaimer</h1>

        <h2>1. General Information</h2>
        <p>The information and content provided on Grey Matter are intended for educational and informational purposes only. While we aim to support learning through structured exercises, Grey Matter is a supplementary tool and does not replace formal education, teaching, or professional academic guidance.</p>

        <h2>2. No Guarantee of Results</h2>
        <p>Grey Matter does not guarantee any specific academic outcomes, including improved grades, test performance, or subject mastery.</p>
        <p>User performance on exercises reflects individual input and should not be interpreted as a definitive measure of academic ability or future results.</p>

        <h2>3. Content Accuracy</h2>
        <p>We make reasonable efforts to ensure that all exercise content, answers, and related materials are accurate and up to date. However, Grey Matter does not warrant or guarantee that all content is free from errors, omissions, or inaccuracies.</p>
        <p>Users are encouraged to verify information with teachers, textbooks, and official academic resources.</p>

        <h2>4. Educational Use Only</h2>
        <p>All content on Grey Matter is designed to assist with revision and practice. It should not be relied upon as the sole source of learning or academic preparation.</p>

        <h2>5. User Responsibility</h2>
        <p>Users are responsible for how they use the platform and interpret the results of exercises. Any decisions made based on information provided by Grey Matter are at the user's own discretion and risk.</p>

        <h2>6. Platform Availability</h2>
        <p>Grey Matter does not guarantee uninterrupted or error-free access to the platform. We may modify, suspend, or discontinue any part of the service at any time without prior notice.</p>

        <h2>7. Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, Grey Matter and its operators shall not be held liable for any direct, indirect, incidental, or consequential damages arising from:</p>
        <p>• Use or inability to use the platform<br />• Reliance on exercise content or results<br />• Errors or omissions in content<br />• Loss of data, including saved notes or progress</p>

        <h2>8. External Resources</h2>
        <p>Grey Matter may reference or integrate external tools or resources. We are not responsible for the accuracy, availability, or content of third-party services.</p>

        <h2>9. Use by Minors</h2>
        <p>Grey Matter is intended for use by high school students. Users under the age of 18 should use the platform with the knowledge and consent of a parent or guardian.</p>

        <h2>10. Changes to This Disclaimer</h2>
        <p>We reserve the right to update or modify this Disclaimer at any time. Continued use of Grey Matter constitutes acceptance of any changes.</p>

        <h2>11. Contact Information</h2>
        <p>If you have any questions regarding this Disclaimer, please contact us at: legal@greymatterschool.co.za</p>
      </div>

      {/* AD 2 - BILLBOARD (after profile container, before footer) */}
      <div className="sponsor-container-profile sponsor-billboard">
        <div className="sponsor-placeholder">
          Advertisement (Large Rectangle - 336x280)
        </div>
      </div>
      <FuncFooter />
    </div>
  );
}

export default About;