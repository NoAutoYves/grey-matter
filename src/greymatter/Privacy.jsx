import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";

function Privacy() {
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
        <h1>Privacy Policy</h1>

        <h2>1. Introduction</h2>
        <p>Grey Matter ("we", "us", or "our") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform.</p>
        <p>This policy is in accordance with applicable data protection laws, including the Protection of Personal Information Act (POPIA).</p>

        <h2>2. Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <p><strong>a. Personal Information</strong><br />• Name<br />• Email address<br />• Profile details (e.g., avatar)</p>
        <p><strong>b. Account Information</strong><br />• Login credentials (stored securely and encrypted where applicable)<br />• User preferences</p>
        <p><strong>c. Usage Data</strong><br />• Exercises completed<br />• Scores and performance data<br />• Notes created and saved<br />• Interaction with features</p>
        <p><strong>d. Technical Data</strong><br />• IP address<br />• Device type<br />• Browser type<br />• App usage statistics</p>

        <h2>3. How We Collect Information</h2>
        <p>We collect information:<br />• Directly from you when you create an account or use the platform<br />• Automatically through cookies and similar technologies<br />• Through interactions with features such as exercises, notes, and dashboards</p>

        <h2>4. How We Use Your Information</h2>
        <p>We use your information to:<br />• Create and manage user accounts<br />• Provide and improve platform functionality<br />• Track and display performance insights<br />• Store notes and user-generated content<br />• Communicate important updates or support responses<br />• Monitor and improve user experience</p>

        <h2>5. Legal Basis for Processing</h2>
        <p>We process your information based on:<br />• Your consent (when you sign up and use the platform)<br />• The need to provide our services to you<br />• Legitimate interests, such as improving the platform and ensuring security</p>

        <h2>6. Sharing of Information</h2>
        <p>We do not sell your personal information.</p>
        <p>We may share information with trusted third parties, including:<br />• Hosting and cloud service providers<br />• Analytics providers<br />• Technical service providers</p>
        <p>These parties are required to protect your information and use it only for agreed purposes.</p>

        <h2>7. Cookies and Tracking</h2>
        <p>We use cookies and similar technologies to:<br />• Maintain user sessions<br />• Improve functionality<br />• Analyse usage patterns</p>
        <p>For more details, please refer to our <a href="/cookies">Cookie Policy</a>.</p>

        <h2>8. Data Storage and Security</h2>
        <p>We implement reasonable technical and organisational measures to protect your information from unauthorised access, loss, or misuse.</p>
        <p>However, no system is completely secure, and we cannot guarantee absolute security of your data.</p>

        <h2>9. Data Retention</h2>
        <p>We retain your personal information for as long as your account is active or as necessary to provide our services.</p>
        <p>We may retain certain information for legal, security, or operational purposes even after account closure.</p>

        <h2>10. Your Rights</h2>
        <p>In accordance with applicable laws, you have the right to:<br />• Access your personal information<br />• Request correction of inaccurate information<br />• Request deletion of your data<br />• Object to or restrict certain processing</p>
        <p>To exercise these rights, please contact us using the details below.</p>

        <h2>11. Children's Privacy</h2>
        <p>Grey Matter is intended for high school students.</p>
        <p>If you are under the age of 18, you should use the platform with the knowledge and consent of a parent or guardian.</p>
        <p>We do not knowingly collect personal information from minors without appropriate consent where required.</p>

        <h2>12. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page, and continued use of the platform constitutes acceptance of the updated policy.</p>

        <h2>13. Contact Information</h2>
        <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at: privacy@greymatterschool.co.za</p>
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

export default Privacy;