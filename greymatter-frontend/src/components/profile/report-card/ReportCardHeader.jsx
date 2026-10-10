import "../../../styles/profile/report-card/ReportCardHeader.css";

function ReportCardHeader({ data }) {
  return (
    <header className="report-card-header">
      <h2 className="rc-title">REPORT CARD</h2>
      <p className="rc-school">Grey Matter High School</p>

      <div className="rc-sheet">
        <span>Sheet No:</span>
        <span className="rc-sheet-value">{data.sheet_no}</span>
      </div>

      <div className="rc-info-row">
        <div className="rc-info-left">
          <span className="rc-label">Student Name:</span>
          <span className="rc-value">{data.student_name}</span>
        </div>
        <div className="rc-info-right">
          <span className="rc-label">Class/Section:</span>
          <span className="rc-value">{data.class_section}</span>
        </div>
      </div>

      <div className="rc-info-row">
        <div className="rc-info-left">
          <span className="rc-label">School Year:</span>
          <span className="rc-value">{data.school_year}</span>
        </div>
      </div>
    </header>
  );
}

export default ReportCardHeader;