import FuncHeader from "../components/functional-comps/FuncHeader";
import FuncFooter from "../components/functional-comps/FuncFooter";
import SocialMedia from "../components/functional-comps/LandingSocialMedia";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../utils/api";
import '../styles/Auth/ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const response = await apiRequest(`/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email }),
    });

    if (response.ok) {
      setMessage("If an account exists with that email, you will receive a password reset link.");
      setEmail("");
    } else {
      try {
        const errorData = await response.json();
        setError(errorData.error || "Something went wrong. Please try again.");
      } catch {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="forgot-password-page">
        <FuncHeader />

        <div className="forgot-password-wrapper">
          <div className="forgot-password-container">
            <h2 className="forgot-password-title">Forgot Password</h2>
            <p className="forgot-password-subtitle">Enter your email to receive a reset link</p>

            {message && <div className="forgot-password-success-message">{message}</div>}
            {error && <div className="forgot-password-error-message">{error}</div>}

            <form className="forgot-password-form" onSubmit={handleSubmit}>
              <label htmlFor="email" className="forgot-password-label">Email Address</label>
              <input
                type="email"
                id="email"
                className="forgot-password-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button type="submit" className="forgot-password-button">Send Reset Link</button>

              <p className="forgot-password-link">
                <Link to="/login">Back to Login</Link>
              </p>
            </form>
          </div>
        </div>

        <SocialMedia />
        <FuncFooter />
      </div>
    </>
  );
}

export default ForgotPassword;