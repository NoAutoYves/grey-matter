import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";

function Terms() {
  return (
    <div className="info-page">
      <FuncHeader />

      {/* AD 1 - LEADERBOARD (below header, above profile container) */}
      {/* <div className="sponsor-container-profile sponsor-top">
        <div className="sponsor-placeholder">
          Advertisement (Leaderboard - 728x90)
        </div>
      </div> */}
      
      <div className="info-container policy-container">
        <h1>Terms and Conditions</h1>

        <h2>1. Introduction & Acceptance</h2>
        <p>Welcome to Grey Matter. By accessing or using this platform, you agree to be bound by these Terms and Conditions.</p>
        <p>If you do not agree with any part of these terms, you must not use the platform.</p>

        <h2>2. Company Details</h2>
        <p>Grey Matter is operated by Grey Matter (Pty) Ltd, a company registered in accordance with the laws of South Africa.</p>
        <p>For any queries, you may contact us at: legal@greymatterschool.co.za</p>

        <h2>3. Description of Service</h2>
        <p>Grey Matter is an interactive e-learning platform designed to help high school students practice and improve their understanding of academic subjects through structured multiple-choice exercises.</p>
        <p>The platform provides:</p>
        <p>• Subject-specific exercises<br />• Immediate answer feedback<br />• Performance tracking<br />• Notes and study tools<br />• User dashboards</p>
        <p>Grey Matter is a supplementary educational tool and does not replace formal education.</p>

        <h2>4. User Obligations</h2>
        <p>By using Grey Matter, you agree:</p>
        <p>• To use the platform for lawful purposes only<br />• Not to misuse, disrupt, or attempt to gain unauthorised access<br />• Not to manipulate exercise results or system functionality<br />• To provide accurate information when creating an account</p>

        <h2>5. Accounts</h2>
        <p>To access certain features, you must create an account.</p>
        <p>You agree:</p>
        <p>• To keep your login details confidential<br />• To be responsible for all activity under your account<br />• To notify us of any unauthorised access</p>
        <p>Grey Matter reserves the right to suspend or terminate accounts that violate these terms.</p>

        <h2>6. Payments & Refunds</h2>
        <p>Grey Matter currently offers its services free of charge. If paid features are introduced in the future, pricing will be clearly displayed, and refunds will be handled in accordance with our stated refund policy.</p>

        <h2>7. Intellectual Property</h2>
        <p>All content on Grey Matter, including exercises, text, design, and functionality, is the property of Grey Matter or its licensors.</p>
        <p>You may not:</p>
        <p>• Copy, reproduce, or distribute content<br />• Reverse-engineer or exploit the platform<br />• Use content for commercial purposes without permission</p>

        <h2>8. Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, Grey Matter shall not be liable for any direct, indirect, incidental, or consequential damages arising from:</p>
        <p>• Use or inability to use the platform<br />• Reliance on exercise content or results<br />• Errors or inaccuracies in content<br />• Loss of data or user-generated content</p>

        <h2>9. Disclaimer</h2>
        <p>Grey Matter provides educational content for practice purposes only.</p>
        <p>We do not guarantee:</p>
        <p>• Accuracy of all content<br />• Improvement in academic performance<br />• Uninterrupted or error-free service</p>
        <p>Users are encouraged to verify information with official educational resources.</p>

        <h2>10. Privacy</h2>
        <p>Your use of Grey Matter is also governed by our <a href="/privacy">Privacy Policy</a>, which explains how we collect and use your data.</p>
        <p>We process personal information in accordance with the Protection of Personal Information Act.</p>

        <h2>11. Termination</h2>
        <p>We reserve the right to suspend or terminate your access to Grey Matter at any time if you:</p>
        <p>• Violate these Terms<br />• Misuse the platform<br />• Engage in harmful or unlawful behaviour</p>

        <h2>12. Governing Law</h2>
        <p>These Terms and Conditions are governed by the laws of South Africa.</p>
        <p>Any disputes arising from the use of Grey Matter shall be subject to the jurisdiction of South African courts.</p>

        <h2>13. Updates to Terms</h2>
        <p>We may update these Terms and Conditions from time to time.</p>
        <p>Continued use of Grey Matter after changes are made constitutes acceptance of the updated terms.</p>

        <h2>Contact Information</h2>
        <p>If you have any questions about these Terms and Conditions, please contact us at: legal@greymatterschool.co.za</p>
      </div>

      {/* AD 2 - BILLBOARD (after profile container, before footer) */}
      {/* <div className="sponsor-container-profile sponsor-billboard">
        <div className="sponsor-placeholder">
          Advertisement (Large Rectangle - 336x280)
        </div>
      </div> */}

      <FuncFooter />
    </div>
  );
}

export default Terms;