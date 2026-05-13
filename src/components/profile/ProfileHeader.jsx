import default_avatar from "../../assets/images/func-images/default_avatar.jpeg";

function ProfileHeader({ profileData, isEditing, editForm, setEditForm, selectedFile, setSelectedFile, handleAvatarUpload, avatarUrl }) {
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div className="profile-header">
      <div className="profile-avatar-section">
        <img 
          src={selectedFile ? URL.createObjectURL(selectedFile) : avatarUrl} 
          alt="User Avatar" 
          className="profile-avatar" 
        />
        {isEditing && (
          <div className="avatar-upload">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              id="avatar-input"
              hidden
            />
            <label htmlFor="avatar-input" className="upload-avatar-btn">Choose Image</label>
            {selectedFile && (
              <button onClick={handleAvatarUpload} className="upload-avatar-btn">
                Upload
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="profile-info">
        <h2>{profileData.first_name} {profileData.last_name}</h2>
        
        {isEditing ? (
          <input 
            type="text"
            className="edit-username"
            value={editForm.username}
            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
            placeholder="Username"
          />
        ) : (
          <p className="profile-username">@{profileData.username || "username"}</p>
        )}
        
        {isEditing ? (
          <textarea 
            className="edit-bio"
            value={editForm.bio}
            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
            placeholder="Write your bio..."
            rows="3"
          />
        ) : (
          <p className="profile-bio">{profileData.bio || "No bio yet"}</p>
        )}
      </div>
    </div>
  );
}

export default ProfileHeader;