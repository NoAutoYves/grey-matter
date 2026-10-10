import { useState } from "react";
import ReportCardModal from "./report-card/ReportCardModal";
import reportCardIcon from "../../assets/images/func-images/report-card-icon.png";
import "../../styles/profile/StatsTab.css";

function StatsTab({ profileData }) {
  const [showReportCard, setShowReportCard] = useState(false);

  return (
    <div className="stats-tab-content">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Exercises Completed</h3>
          <p>{profileData.total_exercises || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Average Score</h3>
          <p>{profileData.average_score}%</p>
        </div>
        <div className="stat-card">
          <h3>Average Time per Exercise</h3>
          <p>{profileData.average_time || "0:00"}</p>
        </div>
      </div>

      <button
        type="button"
        className="view-report-card-btn"
        onClick={() => setShowReportCard(true)}
      >
        <img src={reportCardIcon} alt="" className="view-report-card-icon" aria-hidden="true" />
        View your report card
      </button>

      {showReportCard && (
        <ReportCardModal onClose={() => setShowReportCard(false)} />
      )}
    </div>
  );
}

export default StatsTab;