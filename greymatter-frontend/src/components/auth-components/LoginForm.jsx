import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import SignUpLink from "./SignUp";
import AuthField from "./AuthField";
import { UserContext } from "../../context/UserContext";
import { apiRequest } from "../../utils/api";
import { flushPendingExercise } from "../../utils/pendingExercise";
import "../../styles/Auth/LoginForm.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { login } = useContext(UserContext);

  useEffect(() => {
    const expiredMessage = sessionStorage.getItem('sessionExpiredMessage');
    if (expiredMessage) {
      setErrors({ form: expiredMessage });
      sessionStorage.removeItem('sessionExpiredMessage');
    }
  }, []);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    return next;
  };

  const markTouched = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const handleBlur = (field) => {
    markTouched(field);
    const validation = validate();
    setErrors((prev) => ({ ...prev, form: undefined, [field]: validation[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validate();
    setErrors(validation);
    setTouched({ email: true, password: true });

    if (Object.keys(validation).length > 0) return;

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

      // If this session had a guest exercise waiting, save it now.
      try {
        await flushPendingExercise();
      } catch (err) {
        console.error("Pending exercise flush failed:", err);
      }

      window.location.href = "/";
      return;
    }

    let msg = "Login failed";
    try {
      const errorData = await response.json();
      msg = errorData.error || msg;
    } catch {
      // Non-JSON response (e.g. 429 rate limit, or 500). Fall through with default.
    }

    if (msg === "Email and password required") {
      setErrors({ email: "Email is required", password: "Password is required" });
      return;
    }

    setErrors({ form: msg });
  };

  const fieldError = (field) => (touched[field] && errors[field] ? errors[field] : null);

  return (
    <>
      {errors.form && <div className="login-error-message">{errors.form}</div>}

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur("email")}
          error={fieldError("email")}
        />

        <AuthField
          id="password"
          label="Password"
          type="password"
          showToggle
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur("password")}
          error={fieldError("password")}
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
    </>
  );
}

export default LoginForm;