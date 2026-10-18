import { useState } from "react";
import SocialStats from "./social/SocialStats";
import SocialComposer from "./social/SocialComposer";
import SocialQueue from "./social/SocialQueue";
import SocialHistory from "./social/SocialHistory";
import SocialAccounts from "./social/SocialAccounts";
import SocialComments from "./social/comments/SocialComments";
import SocialAnalytics from "./social/analytics/SocialAnalytics";
import SocialYoutube from "./social/youtube/SocialYoutube";
import SocialTikTok from "./social/tiktok/SocialTikTok";
import SocialTwitter from "./social/twitter/SocialTwitter";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/AdminSocial.css";
import "../../styles/admin/social/SocialComments.css";
import "../../styles/admin/social/SocialAnalytics.css";
import "../../styles/admin/social/YouTube.css";
import "../../styles/admin/social/TikTok.css";
import "../../styles/admin/social/Twitter.css";

const TABS = [
  { id: "compose",   label: "Compose" },
  { id: "queue",     label: "Queue" },
  { id: "history",   label: "History" },
  { id: "youtube",   label: "YouTube" },
  { id: "tiktok",    label: "TikTok" },
  { id: "twitter",   label: "Twitter" },
  { id: "analytics", label: "Analytics" },
  { id: "comments",  label: "Comments" },
  { id: "accounts",  label: "Accounts" },
];

function AdminSocial() {
  const [tab, setTab] = useState("compose");

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Social Media</h1>
          <p className="admin-page-subtitle">Compose, schedule, and track posts</p>
        </div>
      </header>

      <SocialStats />

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "compose"   && <SocialComposer />}
      {tab === "queue"     && <SocialQueue />}
      {tab === "history"   && <SocialHistory />}
      {tab === "youtube"   && <SocialYoutube />}
      {tab === "tiktok"    && <SocialTikTok />}
      {tab === "twitter"   && <SocialTwitter />}
      {tab === "analytics" && <SocialAnalytics />}
      {tab === "comments"  && <SocialComments />}
      {tab === "accounts"  && <SocialAccounts />}
    </div>
  );
}

export default AdminSocial;