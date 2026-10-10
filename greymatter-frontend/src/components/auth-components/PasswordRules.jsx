import "../../styles/Auth/PasswordRules.css";

function PasswordRules({ rules }) {
  return (
    <ul className="signup-password-rules" aria-live="polite">
      {rules.map((rule) => (
        <li key={rule.key} className={rule.passed ? "rule-pass" : "rule-pending"}>
          <span className="rule-mark" aria-hidden="true">
            {rule.passed ? "✓" : "○"}
          </span>
          {rule.label}
        </li>
      ))}
    </ul>
  );
}

export default PasswordRules;