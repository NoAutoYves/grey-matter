import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import SocialMedia from "../components/functional-comps/LandingSocialMedia";
import MessageModal from '../components/functional-comps/MessageModal';

import { apiRequest } from "../utils/api";
import '../styles/Auth/ResetPassword.css';

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);

  const showMessage = (msg) => {
    setMessageText(msg);
    setMessageModalOpen(true);
  };

  useEffect(() => {
    if (!token) {
      showMessage("Invalid or missing reset token");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      showMessage("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest(`/auth/reset-password`, {
        method: "POST",
        body: JSON.stringify({
          token: token,
          new_password: newPassword,
          confirm_password: confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        showMessage(data.error || "Failed to reset password");
      }
    } catch (err) {
      showMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token && !messageModalOpen) {
    return (
      <>
        <div className="reset-password-page">
          <FuncHeader />
          <div className="reset-password-container">
            <h2 className="reset-password-title">Invalid Reset Link</h2>
            <p className="reset-password-subtitle">The password reset link is invalid or missing.</p>
            <a href="/login" className="reset-password-button">Back to Login</a>
          </div>
          <SocialMedia />
          <FuncFooter />
        </div>
        <MessageModal
          isOpen={messageModalOpen}
          message={messageText}
          onClose={() => setMessageModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="reset-password-page">
        <FuncHeader />
        <div className="reset-password-wrapper">
          <div className="reset-password-container">
            <h2 className="reset-password-title">Reset Password</h2>
            <p className="reset-password-subtitle">Enter your new password below</p>

            {error && <div className="reset-password-error-message">{error}</div>}

            <form className="reset-password-form" onSubmit={handleSubmit}>
              <label htmlFor="newPassword" className="reset-password-label">New Password</label>
              <input
                type="password"
                id="newPassword"
                className="reset-password-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <label htmlFor="confirmPassword" className="reset-password-label">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="reset-password-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <button type="submit" className="reset-password-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="reset-password-spinner" aria-hidden="true"></span>
                    <span>Resetting...</span>
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>

              <p className="reset-password-link">
                <a href="/login">Back to Login</a>
              </p>
            </form>
          </div>
        </div>
        <SocialMedia />
        <FuncFooter />
      </div>
      <MessageModal
        isOpen={messageModalOpen}
        message={messageText}
        onClose={() => setMessageModalOpen(false)}
      />
    </>
  );
}

export default ResetPassword;