import { STATS } from "./dummySocial";

function SocialStats() {
  return (
    <div className="social-stats">
      {STATS.map((s) => (
        <div key={s.label} className="social-stat">
          <span className="admin-stat-label">{s.label}</span>
          <span className={`admin-stat-value ${s.danger ? "social-stat-danger" : ""}`}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}

export default SocialStats;