import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import ReportCardHeader from "./ReportCardHeader";
import ReportCardTable from "./ReportCardTable";
import ReportCardSummary from "./ReportCardSummary";
import ReportCardFooter from "./ReportCardFooter";
import "../../../styles/profile/report-card/ReportCard.css";

function ReportCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/persona/profile/report-card");
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "Failed to load report card");
        setData(d);
      } catch (e) {
        setError(e.message || "Failed to load report card");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="report-card-loading">Loading report card…</div>;
  if (error) return <div className="report-card-error">{error}</div>;
  if (!data) return null;

  return (
    <div className="report-card">
      <ReportCardHeader data={data} />
      <ReportCardTable subjects={data.subjects} />
      <ReportCardSummary
        subjects={data.subjects}
        overallAvg={data.overall_average}
        overallGrade={data.overall_grade}
      />
      <ReportCardFooter
        totalDays={data.total_school_days}
        activeDays={data.active_days}
        attendance={data.attendance_percent}
      />
    </div>
  );
}

export default ReportCard;