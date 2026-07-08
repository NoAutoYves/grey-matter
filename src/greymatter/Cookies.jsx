import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";

function Cookies() {
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
        <h1>Cookie Policy</h1>
        
        <h2>1. Introduction</h2>
        <p>This Cookie Policy explains how Grey Matter uses cookies and similar technologies to recognise you when you visit or use our platform. It explains what these technologies are, why we use them, and your rights to control their use.</p>
        <p>This policy should be read together with our Privacy Policy.</p>

        <h2>2. What Are Cookies?</h2>
        <p>Cookies are small data files that are placed on your device when you visit a website or use an application. Cookies help improve user experience by remembering preferences, enabling functionality, and collecting usage data.</p>

        <h2>3. Why We Use Cookies</h2>
        <p>Grey Matter uses cookies and similar technologies for the following purposes:</p>
        <p><strong>Essential Cookies:</strong> Required for the platform to function properly, such as logging in, maintaining sessions, and securing accounts.</p>
        <p><strong>Performance & Analytics Cookies:</strong> Help us understand how users interact with the platform (e.g., which exercises are used most, performance trends, and feature usage). This allows us to improve the platform.</p>
        <p><strong>Functionality Cookies:</strong> Remember your preferences and settings to enhance your experience.</p>

        <h2>4. Information Collected Through Cookies</h2>
        <p>Cookies may collect information such as:</p>
        <p>• Device type and browser<br />• IP address<br />• Pages or features accessed<br />• Time spent on the platform<br />• General usage patterns</p>
        <p>This data is typically aggregated and does not directly identify you, but may be linked to your account where necessary to provide services.</p>

        <h2>5. Third-Party Cookies</h2>
        <p>Grey Matter may use trusted third-party services (such as analytics providers) that place cookies on your device to help us understand platform usage and improve performance.</p>
        <p>These third parties have their own privacy policies governing how they use your information.</p>

        <h2>6. Managing Cookies</h2>
        <p>You have the right to accept or reject non-essential cookies.</p>
        <p>You can manage your cookie preferences by:</p>
        <p>• Adjusting your browser settings to block or delete cookies<br />• Using any cookie consent tools provided on our platform</p>
        <p>Please note that disabling certain cookies may affect the functionality of Grey Matter.</p>

        <h2>7. Legal Compliance</h2>
        <p>Grey Matter uses cookies in accordance with applicable data protection laws, including the Protection of Personal Information Act.</p>
        <p>Where required, we will request your consent before placing non-essential cookies on your device.</p>

        <h2>8. Changes to This Cookie Policy</h2>
        <p>We may update this Cookie Policy from time to time. Any changes will be reflected on this page, and continued use of the platform constitutes acceptance of the updated policy.</p>

        <h2>9. Contact Us</h2>
        <p>If you have any questions about our use of cookies or this policy, please contact us at: privacy@greymatterschool.co.za</p>
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

export default Cookies;