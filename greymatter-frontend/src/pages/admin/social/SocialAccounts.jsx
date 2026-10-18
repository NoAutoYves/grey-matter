import { ACCOUNTS, PLATFORMS } from "./dummySocial";

const badgeFor = (status) =>
  status === "connected" ? "admin-badge-success"
  : status === "expiring" ? "admin-badge-warn"
  : "admin-badge-neutral";

function SocialAccounts() {
  return (
    <div className="social-accounts">
      {ACCOUNTS.map((a) => {
        const p = PLATFORMS.find((x) => x.id === a.platform);
        return (
          <div key={a.id} className="social-account-card">
            <div className="social-account-head">
              <span className="social-preview-dot" style={{ background: p?.color }} />
              <span className="social-account-platform">{p?.label}</span>
              <span className={`admin-badge ${badgeFor(a.status)}`}>{a.status}</span>
            </div>
            <div className="social-account-handle">{a.handle}</div>
            <div className="social-account-expiry">
              Token expires: {a.expires}
            </div>
            <div className="social-account-actions">
              {a.status === "disconnected" ? (
                <button className="admin-btn admin-btn-primary admin-btn-sm">Connect</button>
              ) : (
                <>
                  <button className="admin-btn admin-btn-secondary admin-btn-sm">Reconnect</button>
                  <button className="admin-btn admin-btn-danger admin-btn-sm">Disconnect</button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SocialAccounts;