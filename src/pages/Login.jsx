import FuncHeader from "../components/functional-comps/FuncHeader";
import SignUpLink from "../components/functional-comps/SignUp";
import FuncFooter from "../components/functional-comps/FuncFooter";
import SocialMedia from "../components/Landing/LandingSocialMedia";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Link } from "react-router-dom";
import { apiRequest } from "../utils/api";

function Login(){
  // Store email and password as user types
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(UserContext);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  // Check for session expired message on component mount
  useEffect(() => {
    const expiredMessage = sessionStorage.getItem('sessionExpiredMessage');
    if (expiredMessage) {
      setError(expiredMessage);
      sessionStorage.removeItem('sessionExpiredMessage');
    }
  }, []);

  // Runs when form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const response = await apiRequest(`/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ 
        email, 
        password, 
        remember: remember ? "on" : "off" 
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      login({user_id: data.user_id, email: data.email});
      window.location.href = "/";
    } else {
      try {
        const errorData = await response.json();
        setError(errorData.error || "Login failed");
      } catch {
        setError("Login failed");
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetMessage("");
    setError("");

    const response = await apiRequest(`/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email: resetEmail }),
    });

    if (response.ok) {
      setResetMessage("If an account exists with that email, you will receive a password reset link.");
      setTimeout(() => {
        setForgotPasswordMode(false);
        setResetEmail("");
        setResetMessage("");
      }, 3000);
    } else {
      try {
        const errorData = await response.json();
        setError(errorData.error || "Something went wrong. Please try again.");
      } catch {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  if (forgotPasswordMode) {
    return (
      <>
        <div className="login-page">
          <FuncHeader />
          
          {/* AD 1 - LEADERBOARD (below header) */}
          <div className="sponsor-container sponsor-top">
            <div className="sponsor-placeholder">
              Advertisement (Leaderboard - 728x90)
            </div>
          </div>
          
          <div className="login-container">
            <h2 className="login-title">Reset Password</h2>
            <p className="login-subtitle">Enter your email to receive a reset link</p>

            {resetMessage && <div className="success-message">{resetMessage}</div>}
            {error && <div className="error_message">{error}</div>}

            <form onSubmit={handleForgotPassword}>
              <label htmlFor="resetEmail">Email Address</label>
              <input 
                type="email" 
                id="resetEmail" 
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required 
              />

              <button type="submit" className="login-button">Send Reset Link</button>

              <p className="login-link">
                <button 
                  type="button" 
                  onClick={() => {
                    setForgotPasswordMode(false);
                    setError("");
                    setResetMessage("");
                  }}
                  className="link-button"
                >
                  Back to Login
                </button>
              </p>
            </form>
          </div>
          <SocialMedia/>
          <FuncFooter />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="login-page">
        <FuncHeader />

        {/* AD 1 - LEADERBOARD (below header) */}
        <div className="sponsor-container sponsor-top">
          <div className="sponsor-placeholder">
            Advertisement (Leaderboard - 728x90)
          </div>
        </div>
        {/* AD 2 - LEADERBOARD (for tablets) */}
        <div className="sponsor-container-login sponsor-top">
          <div className="sponsor-placeholder">
            Advertisement (Leaderboard - 728x90)
          </div>
        </div>
        
        <div className="login-wrapper">
          <div className="login-container">
            <h2 className="login-title">Login</h2>
            <p className="login-subtitle">Welcome back, please login to your account</p>

            {error && <div className="error_message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />

              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />

              <div className="login-options">
                <div className="login-remember">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    name="remember" 
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <button 
                  type="button" 
                  onClick={() => setForgotPasswordMode(true)}
                  className="forgot-password-btn"
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="login-button">LOGIN</button>

              <p className="login-link">
                Don't have an account? <SignUpLink/>
              </p>
            </form>
          </div>

          {/* AD 2 - SKYSCRAPER (right sidebar) */}
          <div className="sponsor-container sponsor-skyscraper-right">
            <div className="sponsor-placeholder">
              Advertisement (Skyscraper - 160x600)
            </div>
          </div>
        </div>

        <SocialMedia/>

        {/* AD 1 - BILLBOARD (970x250) - ABOVE NAV (PREMIUM) */}
        <div className="sponsor-container-login sponsor-billboard">
            <div className="sponsor-placeholder">
                Advertisement (Billboard - 970x250)
            </div>
        </div>

        <FuncFooter />
      </div>
    </>
  );
}

export default Login;