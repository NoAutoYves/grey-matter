import "../../../styles/profile/report-card/ReportCardTable.css";

const TERMS = [
  { key: 1, label: "Term 1", months: "Jan – Mar" },
  { key: 2, label: "Term 2", months: "Apr – Jun" },
  { key: 3, label: "Term 3", months: "Jul – Sep" },
  { key: 4, label: "Term 4", months: "Oct – Dec" },
];

const PASS_THRESHOLD = 40;

function fmt(v) {
  if (v === null || v === undefined) return "—";
  return `${v}%`;
}

function resultClass(avg) {
  if (avg === null || avg === undefined) return "rc-td-result-none";
  return avg >= PASS_THRESHOLD ? "rc-td-result-pass" : "rc-td-result-fail";
}

function resultLabel(avg) {
  if (avg === null || avg === undefined) return "—";
  return avg >= PASS_THRESHOLD ? "PASS" : "FAIL";
}

function ReportCardTable({ subjects }) {
  return (
    <div className="rc-table-wrap">
      <table className="rc-table">
        <thead>
          <tr>
            <th className="rc-col-subject">Subjects</th>
            {TERMS.map((t) => (
              <th key={t.key}>
                <span className="rc-th-term">{t.label}</span>
                <span className="rc-th-months">{t.months}</span>
              </th>
            ))}
            <th>Average</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((s) => (
            <tr key={s.subject_id}>
              <td className="rc-subject">{s.subject_name.toUpperCase()}</td>
              {!s.enrolled ? (
                <td className="rc-not-enrolled" colSpan={6}>Not enrolled</td>
              ) : (
                <>
                  {TERMS.map((t) => (
                    <td key={t.key} className="rc-term-cell">{fmt(s.terms[t.key])}</td>
                  ))}
                  <td className="rc-avg">{fmt(s.average)}</td>
                  <td className="rc-result-cell">
                    <span className={`rc-td-result ${resultClass(s.average)}`}>
                      {resultLabel(s.average)}
                    </span>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReportCardTable;