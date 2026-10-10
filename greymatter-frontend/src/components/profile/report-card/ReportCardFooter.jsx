import "../../../styles/profile/report-card/ReportCardFooter.css";

function ReportCardFooter({ totalDays, activeDays, attendance }) {
  return (
    <div className="rc-footer">
      <div className="rc-footer-row">
        <span className="rc-footer-label">Total School Days:</span>
        <span className="rc-footer-value">{totalDays}</span>
      </div>
      <div className="rc-footer-row">
        <span className="rc-footer-label">Days Present:</span>
        <span className="rc-footer-value">{activeDays}</span>
      </div>
      <div className="rc-footer-row">
        <span className="rc-footer-label">Attendance:</span>
        <span className="rc-footer-value">{attendance}%</span>
      </div>
    </div>
  );
}

export default ReportCardFooter;