import { useState } from "react";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        setName("");
        setEmail("");
        setMessage("");
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="info-page">
      <FuncHeader />

      {/* AD 1 - LEADERBOARD (below header, above profile container) */}
      <div className="sponsor-container-profile sponsor-top">
        <div className="sponsor-placeholder">
          Advertisement (Leaderboard - 728x90)
        </div>
      </div>

      <div className="info-container">
        <h1>Contact Us</h1>
        <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        
        <div className="contact-info">
          <div>
            <h3>📍 Address</h3>
            <p>3600 Darwin Street<br />Sandton, 2148<br />South Africa</p>
          </div>
          <div>
            <h3>📧 Email</h3>
            <p>info@greymatterschool.co.za</p>
            <p>support@greymatterschool.co.za</p>
          </div>
          <div>
            <h3>📞 Phone</h3>
            <p>+27 (0) 00 000 0000</p>
            <p>Mon-Fri, 8am-4pm</p>
          </div>
        </div>
        
        <h2>Send us a message</h2>
        {submitted && <div className="success-message">Thank you! We'll get back to you soon.</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="contact-form">
          <label>Your Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          
          <label>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          
          <label>Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="5" required></textarea>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
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

export default Contact;