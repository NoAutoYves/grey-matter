import { useState } from "react";

function PersonalInfoTab({ editForm, setEditForm, handleSave }) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <div className="tab-content">
        <div className="personal-info-display">
          <div className="info-row">
            <span className="info-label">First Name:</span>
            <span className="info-value">{editForm.first_name || "Not set"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Last Name:</span>
            <span className="info-value">{editForm.last_name || "Not set"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Username:</span>
            <span className="info-value">@{editForm.username || "Not set"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Bio:</span>
            <span className="info-value">{editForm.bio || "No bio yet"}</span>
          </div>
          <button className="edit-personal-btn" onClick={() => setIsEditing(true)}>Edit Personal Info</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <form className="personal-info-form" onSubmit={(e) => { e.preventDefault(); handleSave(); setIsEditing(false); }}>
        <label>First Name</label>
        <input 
          type="text" 
          value={editForm.first_name} 
          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} 
          placeholder="First name" 
        />
        <label>Last Name</label>
        <input 
          type="text" 
          value={editForm.last_name} 
          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} 
          placeholder="Last name" 
        />
        <label>Username</label>
        <input 
          type="text" 
          value={editForm.username} 
          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} 
          placeholder="Username" 
        />
        <label>Bio</label>
        <textarea 
          value={editForm.bio} 
          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} 
          placeholder="Write your bio..."
          rows="3"
        />
        <div className="form-buttons">
          <button type="submit" className="save-btn">Save Changes</button>
          <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default PersonalInfoTab;