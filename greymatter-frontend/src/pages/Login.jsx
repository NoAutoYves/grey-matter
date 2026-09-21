import FuncHeader from "../components/functional-comps/FuncHeader";
import SignUpLink from "../components/functional-comps/SignUp";
import FuncFooter from "../components/functional-comps/FuncFooter";
import SocialMedia from "../components/functional-comps/LandingSocialMedia";
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { apiRequest } from "../utils/api";
import '../styles/Auth/Login.css';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(UserContext);

  useEffect(() => {
    const expiredMessage = sessionStorage.getItem('sessionExpiredMessage');
    if (expiredMessage) {
      setError(expiredMessage);
      sessionStorage.removeItem('sessionExpiredMessage');
    }
  }, []);

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
      login({ user_id: data.user_id, email: data.email });
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

  return (
    <>
      <div className="login-page">
        <FuncHeader />

        <div className="login-wrapper">
          <div className="login-container">
            <h2 className="login-title">Login</h2>
            <p className="login-subtitle">Welcome back, please login to your account</p>

            {error && <div className="login-error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <label htmlFor="email" className="login-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label htmlFor="password" className="login-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="login-input"
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
                  <label htmlFor="remember" className="login-remember-label">Remember me</label>
                </div>
                <Link to="/forgot-password" className="login-forgot-password-link">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="login-button">LOGIN</button>

              <p className="login-link">
                Don't have an account? <SignUpLink />
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

export default Login;