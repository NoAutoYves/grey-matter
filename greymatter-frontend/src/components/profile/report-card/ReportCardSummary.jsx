import "../../../styles/profile/report-card/ReportCardSummary.css";

const TERMS = [1, 2, 3, 4];
const PASS_THRESHOLD = 40;

function fmt(v) {
  if (v === null || v === undefined) return "—";
  return `${v}%`;
}

function resultClass(avg) {
  if (avg === null || avg === undefined) return "rc-result-none";
  return avg >= PASS_THRESHOLD ? "rc-result-pass" : "rc-result-fail";
}

function resultLabel(avg) {
  if (avg === null || avg === undefined) return "—";
  return avg >= PASS_THRESHOLD ? "PASS" : "FAIL";
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
        <span className={`rc-summary-wide rc-result-badge ${resultClass(overallAvg)}`}>
          {resultLabel(overallAvg)}
        </span>
      </div>
    </div>
  );
}

export default ReportCardSummary;