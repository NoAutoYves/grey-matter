import "../../styles/Auth/PasswordStrength.css";

function PasswordStrength({ passed, total }) {
  const ratio = total > 0 ? passed / total : 0;
  const percent = Math.round(ratio * 100);

  let tier = "weak";
  let label = "Weak";
  if (passed >= total) {
    tier = "strong";
    label = "Strong";
  } else if (passed >= Math.ceil(total * 0.6)) {
    tier = "fair";
    label = "Fair";
  }

  return (
    <div className="password-strength" data-tier={tier}>
      <div className="password-strength-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Password strength">
        <div className="password-strength-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="password-strength-label">{label}</span>
    </div>
  );
}

export default PasswordStrength;