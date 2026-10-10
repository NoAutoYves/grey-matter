import { useState } from "react";
import "../../styles/Auth/AuthField.css";

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  showToggle = false,
  children,
}) {
  const [revealed, setRevealed] = useState(false);
  const effectiveType = showToggle && revealed ? "text" : type;

  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-label">{label}</label>

      <div className={`auth-input-wrap ${showToggle ? "auth-input-wrap--with-toggle" : ""}`}>
        <input
          type={effectiveType}
          id={id}
          name={id}
          className={`auth-input ${error ? "auth-input-error" : ""}`}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
        {showToggle && (
          <button
            type="button"
            className="auth-input-toggle"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            tabIndex={-1}
          >
            <EyeIcon open={revealed} />
          </button>
        )}
      </div>

      {children}
      {error && <span className="auth-field-error">{error}</span>}
    </div>
  );
}

export default AuthField;