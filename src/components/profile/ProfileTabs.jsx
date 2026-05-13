function ProfileTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "stats", label: "Stats" },
    { id: "archive", label: "Archive" },
    { id: "contact", label: "Contact Info" },
    { id: "personal", label: "Personal Info" },
    { id: "privacy", label: "Privacy" }
  ];

  return (
    <div className="profile-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default ProfileTabs;