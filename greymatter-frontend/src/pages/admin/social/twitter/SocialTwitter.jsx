import { useState } from "react";
import TwitterCompose from "./TwitterCompose";
import TwitterPosts from "./TwitterPosts";
import TwitterAnalytics from "./TwitterAnalytics";

const SUB_TABS = [
  { id: "compose",   label: "Compose" },
  { id: "posts",     label: "Posts" },
  { id: "analytics", label: "Analytics" },
];

function SocialTwitter() {
  const [sub, setSub] = useState("compose");

  return (
    <div className="tw-panel">
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

      {sub === "compose"   && <TwitterCompose />}
      {sub === "posts"     && <TwitterPosts />}
      {sub === "analytics" && <TwitterAnalytics />}
    </div>
  );
}

export default SocialTwitter;