function PrivacyTab({ 
  showPasswordForm, setShowPasswordForm, 
  currentPassword, setCurrentPassword,
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  handlePasswordSubmit,
  handleDeleteClick 
}) {
  return (
    <div className="tab-content">
      <div className="settings-section">
        <h3>Password</h3>
        {!showPasswordForm ? (
          <button onClick={() => setShowPasswordForm(true)} className="action-btn">Change Password</button>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              placeholder="Current password" 
            />
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="New password" 
            />
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Confirm password" 
            />
            <div className="form-buttons">
              <button type="submit" className="save-btn">Save</button>
              <button type="button" onClick={() => setShowPasswordForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        )}
      </div>
      <div className="settings-section danger">
        <h3>Delete Account</h3>
        <p>This action is permanent. Please confirm before proceeding.</p>
        <button onClick={handleDeleteClick} className="delete-btn">Delete Account</button>
      </div>
    </div>
  );
}

export default PrivacyTab;