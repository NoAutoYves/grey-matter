import { useState } from "react";
import PhoneNoInput from "../functional-comps/PhoneNoInput";

function SettingsTab({ email, setEmail, handleEmailSubmit}) {
  return (
    <div className="tab-content">
      <div className="settings-section">
        <h3>Phone Number</h3>
        <PhoneNoInput />
      </div>
      <div className="settings-section">
        <h3>Email</h3>
        <form onSubmit={handleEmailSubmit}>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Email" 
          />
          <button type="submit" className="save-btn">Update Email</button>
        </form>
      </div>
    </div>
  );
}

export default SettingsTab;