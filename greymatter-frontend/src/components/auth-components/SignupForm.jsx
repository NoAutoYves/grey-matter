import { useState } from "react";
import LoginLink from "./LoginLink";
import AuthField from "./AuthField";
import PasswordRules from "./PasswordRules";
import PasswordStrength from "./PasswordStrength";
import { apiRequest } from "../../utils/api";
import "../../styles/Auth/SignupForm.css";

const PASSWORD_RULES = [
  { key: "min_length", label: "Between 8 and 100 characters", test: (pw) => pw.length >= 8 && pw.length <= 100 },
  { key: "uppercase",  label: "At least one uppercase letter",  test: (pw) => /[A-Z]/.test(pw) },
  { key: "lowercase",  label: "At least one lowercase letter",  test: (pw) => /[a-z]/.test(pw) },
  { key: "digit",      label: "At least one number",            test: (pw) => /\d/.test(pw) },
  { key: "no_spaces",  label: "No spaces",                      test: (pw) => pw.length > 0 && !/\s/.test(pw) },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignupForm() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [privacy_p, setPrivacyP] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const passwordChecks = PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) }));
  const passedCount = passwordChecks.filter((c) => c.passed).length;
  const allPasswordRulesPass = passedCount === passwordChecks.length;

  const validate = () => {
    const next = {};
    if (!first_name.trim()) next.first_name = "First name is required";
    if (!last_name.trim()) next.last_name = "Last name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    else if (!allPasswordRulesPass) next.password = "Password does not meet all requirements";
    if (!confirm_password) next.confirm_password = "Please confirm your password";
    else if (confirm_password !== password) next.confirm_password = "Passwords do not match";
    if (!privacy_p) next.privacy_p = "You must accept the Privacy Policy";
    return next;
  };

  const markTouched = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const handleBlur = (field) => {
    markTouched(field);
    const validation = validate();
    setErrors((prev) => ({ ...prev, [field]: validation[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validate();
    setErrors(validation);
    setTouched({
      first_name: true,
      last_name: true,
      email: true,
      password: true,
      confirm_password: true,
      privacy_p: true,
    });

    if (Object.keys(validation).length > 0) return;

    const response = await apiRequest(`/auth/signup`, {
      method: "POST",
      body: JSON.stringify({
        first_name,
        last_name,
        email,
        password,
        confirm_password,
        privacy_p,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = "/login";
      return;
    }

    const msg = data.error || "Signup failed";
    const backendErrors = {};

    if (msg.includes("Email already exists")) {
      backendErrors.email = "This email is already registered";
    } else if (msg.includes("Passwords do not match")) {
      backendErrors.confirm_password = "Passwords do not match";
    } else if (msg.includes("Privacy policy")) {
      backendErrors.privacy_p = "You must accept the Privacy Policy";
    } else if (msg.toLowerCase().includes("password does not meet")) {
      backendErrors.password = "Password does not meet all requirements";
    } else if (msg.toLowerCase().includes("email")) {
      backendErrors.email = msg;
    } else {
      backendErrors.form = msg;
    }

    setErrors(backendErrors);
  };

  const fieldError = (field) => (touched[field] && errors[field] ? errors[field] : null);

  return (
    <>
      {errors.form && <div className="signup-error-message">{errors.form}</div>}

      <form className="signup-form" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="first_name"
          label="First Name"
          value={first_name}
          onChange={(e) => setFirstName(e.target.value)}
          onBlur={() => handleBlur("first_name")}
          error={fieldError("first_name")}
        />

        <AuthField
          id="last_name"
          label="Last Name"
          value={last_name}
          onChange={(e) => setLastName(e.target.value)}
          onBlur={() => handleBlur("last_name")}
          error={fieldError("last_name")}
        />

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
        >
          <PasswordStrength passed={passedCount} total={passwordChecks.length} />
          <PasswordRules rules={passwordChecks} />
        </AuthField>

        <AuthField
          id="confirm_password"
          label="Confirm Password"
          type="password"
          showToggle
          value={confirm_password}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => handleBlur("confirm_password")}
          error={fieldError("confirm_password")}
        />

        <div className="auth-field">
          <div className="signup-remember">
            <input
              type="checkbox"
              id="privacy_p"
              name="privacy_p"
              checked={privacy_p}
              onChange={(e) => {
                setPrivacyP(e.target.checked);
                markTouched("privacy_p");
              }}
            />
            <label htmlFor="privacy_p" className="signup-remember-label">
              I agree to the Privacy Policy
            </label>
          </div>
          {fieldError("privacy_p") && (
            <span className="auth-field-error">{errors.privacy_p}</span>
          )}
        </div>

        <button type="submit" className="signup-button">SIGN UP</button>

        <p className="signup-link">
          Already have an account? <LoginLink />
        </p>
      </form>
    </>
  );
}

export default SignupForm;