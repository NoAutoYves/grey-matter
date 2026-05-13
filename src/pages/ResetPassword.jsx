import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import SocialMedia from "../components/Landing/LandingSocialMedia";
import MessageModal from "../components/modal-components/MessageModal";
import { apiRequest } from "../utils/api";

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
      const response = await apiRequest(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
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
        <div className="login-page">
          <FuncHeader />
          <div className="login-container">
            <h2 className="login-title">Invalid Reset Link</h2>
            <p className="login-subtitle">The password reset link is invalid or missing.</p>
            <a href="/login" className="login-button">Back to Login</a>
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
      <div className="login-page">
        <FuncHeader />
        <div className="login-container">
          <h2 className="login-title">Reset Password</h2>
          <p className="login-subtitle">Enter your new password below</p>

          {error && <div className="error_message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label htmlFor="newPassword">New Password</label>
            <input 
              type="password" 
              id="newPassword" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required 
            />

            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <p className="login-link">
              <a href="/login">Back to Login</a>
            </p>
          </form>
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