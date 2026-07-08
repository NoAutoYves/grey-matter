import { useState, useEffect, useContext } from "react";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import default_avatar from "../assets/images/func-images/default_avatar.jpeg";
import { UserContext } from "../context/UserContext";
import { useModal } from "../context/ModalContext";
import MessageModal from "../components/modal-components/MessageModal";
import ProfileTabs from "../components/profile/ProfileTabs";
import StatsTab from "../components/profile/StatsTab";
import ArchiveTab from "../components/profile/ArchiveTab";
import ContactTab from "../components/profile/ContactTab";
import PersonalInfoTab from "../components/profile/PersonalInfoTab";
import PrivacyTab from "../components/profile/PrivacyTab";
import editIcon from "../assets/images/func-images/edit-icon.png";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ImageCropper from "../components/functional-comps/ImageCropper";
import { api } from "../utils/api";

function Profile() {
  const { user } = useContext(UserContext);
  const { showModal } = useModal();
  
  const [activeTab, setActiveTab] = useState("stats");
  const [profileData, setProfileData] = useState({
    first_name: "", last_name: "", username: "", bio: "", avatar: "",
    total_exercises: 0, average_score: 0, average_time: 0,
    saved_notes: [], recent_activities: []
  });
  const [loading, setLoading] = useState(true);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", bio: "", first_name: "", last_name: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [avatarRefreshKey, setAvatarRefreshKey] = useState(Date.now());
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageFile, setTempImageFile] = useState(null);
  
  // Contact tab states
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Privacy tab states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");

  const showMessage = (msg) => {
    setMessageText(msg);
    setMessageModalOpen(true);
  };

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/persona/profile/batch-stats');
        const data = await response.json();
        
        if (response.ok) {
          setProfileData({
            first_name: data.user.first_name || "", 
            last_name: data.user.last_name || "",
            username: data.user.username || "", 
            bio: data.user.bio || "", 
            avatar: data.user.avatar || "",
            total_exercises: data.stats.total_exercises || 0, 
            average_score: data.stats.average_score || 0,
            average_time: data.stats.average_time || "0:00", 
            saved_notes: data.saved_notes || [],
            recent_activities: data.recent_activities || []
          });
          setEditForm({ 
            username: data.user.username || "", 
            bio: data.user.bio || "",
            first_name: data.user.first_name || "",
            last_name: data.user.last_name || ""
          });
          setEmail(data.user.email || "");
          setPhoneNumber(data.user.phone || "");
          setAvatarRefreshKey(Date.now());
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
    else setLoading(false);
  }, [user]);

  // Avatar upload with cropping
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTempImageFile(file);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedFile) => {
    setSelectedFile(croppedFile);
    setShowCropper(false);
    // Create preview URL for the cropped image
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(croppedFile));
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("avatar", selectedFile);
    const response = await api.post('/api/persona/profile/avatar', formData);
    const data = await response.json();
    if (response.ok) {
      setProfileData(prev => ({ ...prev, avatar: data.avatar }));
      setAvatarRefreshKey(Date.now());
      // Clean up preview URL
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsEditingAvatar(false);
      showMessage("Avatar updated successfully");
    } else {
      showMessage(data.error || "Failed to update avatar");
    }
  };

  // Personal info save
  const handlePersonalInfoSave = async () => {
    // Save username and bio
    const response1 = await api.post('/api/persona/profile/edit', 
      new URLSearchParams({ username: editForm.username, bio: editForm.bio }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );
    
    // Save first name and last name
    const response2 = await api.post('/api/updateInfo',
      new URLSearchParams({ first_name: editForm.first_name, last_name: editForm.last_name, bio: editForm.bio }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );
    
    if (response1.ok && response2.ok) {
      setProfileData(prev => ({ 
        ...prev, 
        username: editForm.username, 
        bio: editForm.bio,
        first_name: editForm.first_name,
        last_name: editForm.last_name
      }));
      setIsEditingPersonal(false);
      showMessage("Profile updated successfully");
    } else {
      showMessage("Failed to update profile");
    }
  };

  // Email update
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const response = await api.post('/api/updateEmail',
      new URLSearchParams({ email }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );
    const data = await response.json();
    showMessage(data.success ? "Email updated successfully" : (data.error || "Failed to update email"));
  };

  // Phone update
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    const response = await api.post('/api/updatePhoneNumber',
      new URLSearchParams({ phone: phoneNumber }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );
    const data = await response.json();
    showMessage(data.success ? "Phone number updated successfully" : (data.error || "Failed to update phone"));
  };

  // Password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showMessage("New passwords do not match");
      return;
    }
    const response = await api.post('/api/changePassword',
      new URLSearchParams({ current_password: currentPassword, new_password: newPassword }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );
    const data = await response.json();
    if (response.ok) {
      showMessage("Password changed successfully");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      showMessage(data.error || "Failed to change password");
    }
  };

  // Delete account
  const handleDeleteClick = () => {
    showModal(
      "Are you sure you want to permanently delete your account?",
      async () => {
        const response = await api.post('/api/deleteAccount');
        if (response.ok) window.location.href = "/login";
        else showMessage((await response.json()).error || "Failed to delete account");
      },
      () => {}
    );
  };

  const avatarUrl = profileData.avatar && profileData.avatar !== "null" 
    ? `${profileData.avatar}?t=${avatarRefreshKey}` 
    : default_avatar;

  if (loading) {
    return (
      <div className="profile-page">
        <FuncHeader />
        <section className="profile-container">
          <div className="profile-header-wrapper">
            <div className="profile-avatar-section">
              <Skeleton circle width={120} height={120} />
            </div>
            <div className="profile-info">
              <Skeleton width={200} height={30} />
              <Skeleton width={150} height={20} />
              <Skeleton width={180} height={20} />
            </div>
          </div>
          <Skeleton height={40} style={{ marginBottom: '20px' }} />
          <Skeleton count={3} height={80} style={{ marginBottom: '10px' }} />
        </section>
        <FuncFooter />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <FuncHeader />
      
      <section className="profile-container">
        {/* Profile Header with Edit Avatar Icon */}
        <div className="profile-header-wrapper">
          <div className="profile-avatar-section">
            <img 
              src={previewUrl || avatarUrl} 
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
                <button onClick={() => {
                  setIsEditingAvatar(false);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }} className="cancel-avatar-btn">Cancel</button>
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2>{profileData.first_name} {profileData.last_name}</h2>
            <p className="profile-username">@{profileData.username || "username"}</p>
            <p className="profile-bio">{profileData.bio || "No bio yet"}</p>
          </div>
        </div>

        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "stats" && <StatsTab profileData={profileData} />}
        {activeTab === "archive" && <ArchiveTab profileData={profileData} />}
        {activeTab === "contact" && (
          <ContactTab 
            email={email} setEmail={setEmail}
            handleEmailSubmit={handleEmailSubmit}
            phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
            handlePhoneSubmit={handlePhoneSubmit}
          />
        )}
        {activeTab === "personal" && (
          <PersonalInfoTab 
            editForm={editForm} setEditForm={setEditForm}
            isEditing={isEditingPersonal}
            setIsEditing={setIsEditingPersonal}
            handleSave={handlePersonalInfoSave}
          />
        )}
        {activeTab === "privacy" && (
          <PrivacyTab 
            showPasswordForm={showPasswordForm} setShowPasswordForm={setShowPasswordForm}
            currentPassword={currentPassword} setCurrentPassword={setCurrentPassword}
            newPassword={newPassword} setNewPassword={setNewPassword}
            confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
            handlePasswordSubmit={handlePasswordSubmit}
            handleDeleteClick={handleDeleteClick}
          />
        )}
      </section>
      
      <FuncFooter />
      <MessageModal isOpen={messageModalOpen} message={messageText} onClose={() => setMessageModalOpen(false)} />
      
      {/* Image Cropper Modal */}
      {showCropper && tempImageFile && (
        <ImageCropper
          imageFile={tempImageFile}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setTempImageFile(null);
          }}
        />
      )}
    </div>
  );
}

export default Profile;