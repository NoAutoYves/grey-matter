import "../../../styles/profile/report-card/ReportCardSummary.css";

const TERMS = [1, 2, 3, 4];

function fmt(v) {
  if (v === null || v === undefined) return "—";
  return `${v}%`;
}

function gradeClass(grade) {
  if (!grade) return "rc-grade-none";
  const g = String(grade).toUpperCase();
  if (g === "A") return "rc-grade-a";
  if (g === "B") return "rc-grade-b";
  if (g === "C") return "rc-grade-c";
  if (g === "D") return "rc-grade-d";
  if (g === "E") return "rc-grade-e";
  if (g === "F") return "rc-grade-f";
  if (g === "G") return "rc-grade-g";
  return "rc-grade-none";
}

function ReportCardSummary({ subjects, overallAvg, overallGrade }) {
  const termAverages = TERMS.map((t) => {
    const scores = subjects
      .filter((s) => s.enrolled && s.terms[t] !== null && s.terms[t] !== undefined)
      .map((s) => s.terms[t]);
    if (scores.length === 0) return null;
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  });

  return (
    <div className="rc-summary">
      <div className="rc-summary-row rc-summary-header">
        <span className="rc-summary-label">Terms Based Grade</span>
        {TERMS.map((t) => (
          <span key={t} className="rc-summary-cell">{t}</span>
        ))}
      </div>

      <div className="rc-summary-row">
        <span className="rc-summary-label">Term Average</span>
        {termAverages.map((v, i) => (
          <span key={i} className="rc-summary-cell">{fmt(v)}</span>
        ))}
      </div>

      <div className="rc-summary-row rc-summary-final">
        <span className="rc-summary-label">Average Grade</span>
        <span className="rc-summary-wide">{fmt(overallAvg)}</span>
      </div>

      <div className="rc-summary-row rc-summary-final">
        <span className="rc-summary-label">Overall Grade</span>
        <span className={`rc-summary-wide rc-grade-badge ${gradeClass(overallGrade)}`}>
          {overallGrade || "—"}
        </span>
      </div>
    </div>
  );
}

export default ReportCardSummary;