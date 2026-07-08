import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";

function Careers() {
  const positions = [
    { title: "Full Stack Developer", type: "Remote", description: "Help us build and maintain our learning platform." },
    { title: "Content Creator", type: "Hybrid", description: "Create engaging exercise content for commerce subjects." },
    { title: "Customer Support Specialist", type: "Remote", description: "Assist students and educators with platform questions." },
    { title: "Marketing Manager", type: "On-site", description: "Lead our growth and outreach initiatives." }
  ];

  const handleApply = (jobTitle) => {
    const subject = encodeURIComponent(`Application for ${jobTitle}`);
    const body = encodeURIComponent(
      `Dear Grey Matter Team,\n\nI am writing to apply for the position of ${jobTitle}. I have attached my CV for your review.\n\nPlease find my details below:\n\nName: \nEmail: \nPhone: \n\nWhy I'm a good fit:\n\n\nLooking forward to your response.\n\nRegards,`
    );
    window.location.href = `mailto:careers@greymatterschool.co.za?subject=${subject}&body=${body}`;
  };

  return (
    <div className="info-page">
      <FuncHeader />

      {/* AD 1 - LEADERBOARD (below header, above profile container) */}
      {/* <div className="sponsor-container-profile sponsor-top">
        <div className="sponsor-placeholder">
          Advertisement (Leaderboard - 728x90)
        </div>
      </div> */}
      
      <div className="info-container">
        <h1>Careers at Grey Matter</h1>
        <p>Join us in revolutionizing education. We're looking for passionate individuals who believe in the power of learning.</p>
        
        <h2>Why Work With Us?</h2>
        <p>• Flexible working hours and remote options<br />
        • Competitive salary and benefits<br />
        • Opportunity to impact thousands of students<br />
        • Collaborative and innovative culture<br />
        • Professional development budget</p>
        
        <h2>Open Positions</h2>
        {positions.map((job, index) => (
          <div key={index} className="job-listing">
            <h3>{job.title}</h3>
            <span className="job-type">{job.type}</span>
            <p>{job.description}</p>
            <button className="apply-btn" onClick={() => handleApply(job.title)}>
              Apply Now
            </button>
          </div>
        ))}
        
        <p className="careers-note">Don't see a role that fits? Send your resume to careers@greymatterschool.co.za</p>
      </div>

      {/* AD 2 - BILLBOARD (after profile container, before footer) */}
      {/* <div className="sponsor-container-profile sponsor-billboard">
        <div className="sponsor-placeholder">
          Advertisement (Large Rectangle - 336x280)
        </div>
      </div> */}

      <FuncFooter />
    </div>
  );
}

export default Careers;