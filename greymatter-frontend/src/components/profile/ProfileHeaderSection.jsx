import default_avatar from "../../assets/images/func-images/default_avatar.jpeg";
import editIcon from "../../assets/images/func-images/edit-icon.png";
import "../../styles/profile/ProfileHeaderSection.css";

function ProfileHeaderSection({
  profileData,
  previewUrl,
  avatarUrl,
  isEditingAvatar,
  setIsEditingAvatar,
  selectedFile,
  handleFileChange,
  handleAvatarUpload,
  handleCancelAvatar,
}) {
  return (
    <div className="profile-header-wrapper">
      <div className="profile-avatar-section">
        <img
          src={previewUrl || avatarUrl || default_avatar}
          alt="User Avatar"
          className="profile-avatar"
        />
        {!isEditingAvatar ? (
          <button className="edit-avatar-icon" onClick={() => setIsEditingAvatar(true)}>
            <img src={editIcon} alt="Edit" className="edit-icon-img" />
          </button>
        ) : (
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
              <button onClick={handleAvatarUpload} className="save-avatar-btn">Upload</button>
            )}
            <button onClick={handleCancelAvatar} className="cancel-avatar-btn">Cancel</button>
          </div>
        )}
      </div>
      <div className="profile-info">
        <h2>{profileData.first_name} {profileData.last_name}</h2>
        <p className="profile-username">@{profileData.username || "username"}</p>
        <p className="profile-bio">{profileData.bio || "No bio yet"}</p>
      </div>
    </div>
  );
}

export default ProfileHeaderSection;