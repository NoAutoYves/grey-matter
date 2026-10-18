import { useState } from "react";
import TikTokUpload from "./TikTokUpload";
import TikTokVideos from "./TikTokVideos";
import TikTokAnalytics from "./TikTokAnalytics";

const SUB_TABS = [
  { id: "upload",    label: "Upload" },
  { id: "videos",    label: "Videos" },
  { id: "analytics", label: "Analytics" },
];

function SocialTikTok() {
  const [sub, setSub] = useState("upload");

  return (
    <div className="tt-panel">
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

      {sub === "upload"    && <TikTokUpload />}
      {sub === "videos"    && <TikTokVideos />}
      {sub === "analytics" && <TikTokAnalytics />}
    </div>
  );
}

export default SocialTikTok;