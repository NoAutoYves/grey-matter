import { useState } from "react";
import LoginLink from "../components/functional-comps/LoginLink";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import SocialMedia from "../components/functional-comps/LandingSocialMedia";
import { apiRequest } from "../utils/api";
import '../styles/Auth/Signup.css';

function Signup() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [privacy_p, setPrivacyP] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const response = await apiRequest(`/auth/signup`, {
      method: "POST",
      body: JSON.stringify({
        first_name,
        last_name,
        email,
        password,
        confirm_password,
        privacy_p
      }),
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = "/login";
    } else {
      setError(data.error || "Signup failed");
    }
  };

  return (
    <>
      <div className="signup-page">
        <FuncHeader />

        <div className="signup-wrapper">
          <div className="signup-container">
            <h2 className="signup-title">Sign Up</h2>
            <p className="signup-subtitle">Create your account, please sign up today</p>

            {error && <div className="signup-error-message">{error}</div>}

            <form className="signup-form" onSubmit={handleSubmit}>
              <label htmlFor="first_name" className="signup-label">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                className="signup-input"
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />

              <label htmlFor="last_name" className="signup-label">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                className="signup-input"
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
                required
              />

              <label htmlFor="email" className="signup-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="signup-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label htmlFor="password" className="signup-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="signup-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <label htmlFor="confirm_password" className="signup-label">Confirm Password</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                className="signup-input"
                value={confirm_password}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <div className="signup-remember">
                <input
                  type="checkbox"
                  id="privacy_p"
                  name="privacy_p"
                  checked={privacy_p}
                  onChange={(e) => setPrivacyP(e.target.checked)}
                />
                <label htmlFor="privacy_p" className="signup-remember-label">I agree to the Privacy Policy</label>
              </div>

              <button type="submit" className="signup-button">SIGN UP</button>

              <p className="signup-link">
                Already have an account? <LoginLink />
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

export default Signup;