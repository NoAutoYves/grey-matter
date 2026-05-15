import { useState } from "react";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";

function Help() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: "What is Grey Matter?", 
      a: "Grey Matter is an interactive e-learning platform designed to help high school students practice and improve their understanding of key academic subjects through targeted multiple-choice exercises. The platform covers subjects including Accounting, Business Studies, Economics, Geography, Biology, Physics, Mathematics, and Mathematical Literacy. Grey Matter is a supplementary learning tool and does not replace formal education or guarantee academic results." },
    
    { q: "How does Grey Matter work?", 
      a: "Users can: Select a subject, complete multiple-choice exercises, receive immediate feedback on answers, track their performance over time, and review past exercisezes and saved notes. The platform is designed to support consistent practice and self-assessment." },
    
    { q: "Do I need an account to use Grey Matter?", 
      a: "Yes. You need to create an account to access exercises, track your progress, save notes, and view exercise history. You are responsible for maintaining the confidentiality of your login details." },
    
    { q: "Can I update my profile?", 
      a: "Yes. You can update your profile information and avatar at any time through your dashboard. Avatar images may be cropped to fit platform requirements." },
    
    { q: "Are the answers and results always accurate?", 
      a: "We strive to ensure that all content and answers are accurate and up to date. However, Grey Matter does not guarantee that all answers, explanations, or results are free from errors. Users are encouraged to verify information with teachers, textbooks, or official learning materials." },
    
    { q: "How is my performance calculated?", 
      a: "Your performance is based on your responses to each exercise. After completing a exercise, you will receive a breakdown of your results by question. Performance insights are provided for guidance only and should not be considered official academic assessments." },
    
    { q: "Can I review my past exercises?", 
      a: "Yes. Your exercise history is stored in your account, allowing you to revisit previous exercises, review your answers, and track your improvement over time." },
    
    { q: "What is the notes feature?", 
      a: "Grey Matter includes a built-in notes section where you can save study reminders or key points while completing exercises. You are responsible for the content you save. While we aim to maintain reliable storage, Grey Matter is not responsible for any loss of user-generated content." },
    
    { q: "What data does Grey Matter collect?", 
      a: "Grey Matter collects basic account and usage data to provide and improve the platform experience. For full details on how your data is collected, used, and protected, please refer to our Privacy Policy, in line with the Protection of Personal Information Act." },
    
    { q: "Is Grey Matter suitable for students under 18?", 
      a: "Grey Matter is designed for high school students. If you are under the age of 18, you should use the platform with the knowledge and consent of a parent or guardian." },
    
    { q: "What should I do if something isn't working?", 
      a: "If you experience technical issues such as exercises not loading, progress not saving, or errors in the app, please contact our support team at support@greymatterschool.co.za." },
    
    { q: "Can my account be suspended?", 
      a: "Yes. Grey Matter reserves the right to suspend or terminate accounts that violate platform rules, attempt to manipulate results, or misuse the platform in any way." },
    
    { q: "How can I contact support?", 
      a: "If you have questions, feedback, or need assistance, you can contact us at support@greymatterschool.co.za. We aim to respond as quickly as possible." }
  ];

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
        <h1>Help & Frequently Asked Questions (FAQ)</h1>
        <p>Find answers to common questions below. Can't find what you're looking for? <a href="/contact">Contact our support team</a>.</p>
        
        <div className="faq-section">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button className="faq-question" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                {faq.q}
                <span>{openFaq === index ? "−" : "+"}</span>
              </button>
              {openFaq === index && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
        
        <div className="help-contact">
          <h3>Still need help?</h3>
          <p>Our support team is available Monday-Friday, 8am-4pm SAST.</p>
          <a href="/contact" className="help-btn">Contact Support</a>
        </div>
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

export default Help;