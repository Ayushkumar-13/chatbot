import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PhotoCropper from '../components/profile/PhotoCropper';
import { Card } from '../components/ui/card';
import AvatarUpload from '../components/profile/AvatarUpload';
import ProfileForm from '../components/profile/ProfileForm';

const ProfilePage = () => {
    const { authUser, updateProfile, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [selectedImgURL, setSelectedImgURL] = useState(null); // URL for cropper
    const [croppedImgBase64, setCroppedImgBase64] = useState(null); // final cropped image
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = () => {
                setSelectedImgURL(reader.result);
                setRemoveAvatar(false);
            };
        }
        e.target.value = null; // reset input
    };

    const handleCropComplete = (croppedBase64) => {
        setCroppedImgBase64(croppedBase64);
        setSelectedImgURL(null); // close cropper
    };

    const handleProfileUpdate = async (formData) => {
        setSaving(true);
        try {
            const payload = { ...formData };
            if (removeAvatar) {
                payload.profilePic = '';
            } else if (croppedImgBase64) {
                payload.profilePic = croppedImgBase64;
            }
            await updateProfile(payload);
            navigate('/');
        } finally {
            setSaving(false);
        }
    };

    const displayPic = removeAvatar ? null : (croppedImgBase64 || authUser?.profilePic || null);

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
            {selectedImgURL && (
                <PhotoCropper
                    imageSrc={selectedImgURL}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setSelectedImgURL(null)}
                />
            )}

            <Card style={{ maxWidth: 420, borderRadius: 16 }}>
                {/* Header */}
                <div style={{ background: 'var(--bg-header)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                    </button>
                    <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 18, fontWeight: 500 }}>Profile</h2>
                </div>

                <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <AvatarUpload
                        displayPic={displayPic}
                        name={authUser.fullName}
                        onFileSelect={handleFileSelect}
                        onRemove={() => { setRemoveAvatar(true); setCroppedImgBase64(null); }}
                        showRemove={(authUser.profilePic || croppedImgBase64) && !removeAvatar}
                    />

                    <ProfileForm
                        initialData={authUser}
                        onSubmit={handleProfileUpdate}
                        saving={saving}
                        onLogout={logout}
                    />
                </div>
            </Card>
        </div>
    );
};

export default ProfilePage;
