import { useState } from "react";
import YouTubeUpload from "./YouTubeUpload";
import YouTubeVideos from "./YouTubeVideos";
import YouTubeAnalytics from "./YouTubeAnalytics";

const SUB_TABS = [
  { id: "upload",    label: "Upload" },
  { id: "videos",    label: "Videos" },
  { id: "analytics", label: "Analytics" },
];

function SocialYoutube() {
  const [sub, setSub] = useState("upload");

  return (
    <div className="yt-panel">
      <div className="comments-chips">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`comments-chip ${sub === t.id ? "on" : ""}`}
            onClick={() => setSub(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === "upload"    && <YouTubeUpload />}
      {sub === "videos"    && <YouTubeVideos />}
      {sub === "analytics" && <YouTubeAnalytics />}
    </div>
  );
}

export default SocialYoutube;