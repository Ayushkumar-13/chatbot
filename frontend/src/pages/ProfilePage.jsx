import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { InitialsAvatar } from '../components/Sidebar';
import PhotoCropper from '../components/PhotoCropper';

const ProfilePage = () => {
    const { authUser, updateProfile, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState(authUser.fullName);
    const [bio, setBio] = useState(authUser.bio || '');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (removeAvatar) {
                await updateProfile({ fullName: name, bio, profilePic: '' });
            } else if (croppedImgBase64) {
                await updateProfile({ profilePic: croppedImgBase64, fullName: name, bio });
            } else {
                await updateProfile({ fullName: name, bio });
            }
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

            <div style={{
                background: 'var(--bg-primary)', borderRadius: 16, width: '100%', maxWidth: 420,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)', overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{ background: 'var(--bg-header)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                    </button>
                    <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 18, fontWeight: 500 }}>Profile</h2>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Avatar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{ position: 'relative' }}>
                            {displayPic
                                ? <img src={displayPic} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--app-accent)' }} alt="" />
                                : <InitialsAvatar name={name || authUser.fullName} size={100} />
                            }
                            <label style={{
                                position: 'absolute', bottom: 0, right: 0, width: 30, height: 30,
                                background: 'var(--app-accent)', borderRadius: '50%', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-primary)'
                            }}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
                                <input type="file" accept="image/*" hidden onChange={handleFileSelect} />
                            </label>
                        </div>

                        {(authUser.profilePic || croppedImgBase64) && !removeAvatar && (
                            <button type="button" onClick={() => { setRemoveAvatar(true); setCroppedImgBase64(null); }} style={{
                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 13
                            }}>
                                Remove profile picture
                            </button>
                        )}
                    </div>

                    {/* Name */}
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--app-accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Your name
                        </label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            style={{
                                width: '100%', background: 'var(--bg-input)', border: 'none',
                                borderRadius: 8, padding: '11px 14px', fontSize: 15, color: 'var(--text-primary)'
                            }}
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--app-accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            About
                        </label>
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            rows={3}
                            placeholder="Write something about yourself…"
                            style={{
                                width: '100%', background: 'var(--bg-input)', border: 'none',
                                borderRadius: 8, padding: '11px 14px', fontSize: 14,
                                color: 'var(--text-primary)', resize: 'none', fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    {/* Save */}
                    <button type="submit" disabled={saving} style={{
                        background: 'var(--app-accent)', border: 'none', color: '#fff',
                        borderRadius: 24, padding: '13px', fontSize: 15, fontWeight: 600,
                        cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
                        opacity: saving ? 0.7 : 1
                    }}
                        onMouseEnter={e => { if (!saving) e.target.style.background = 'var(--app-accent-hover)'; }}
                        onMouseLeave={e => e.target.style.background = 'var(--app-accent)'}
                    >
                        {saving ? 'Saving…' : 'Save Profile'}
                    </button>

                    {/* Logout */}
                    <button type="button" onClick={logout} style={{
                        background: 'none', border: '1px solid var(--border-color)', color: 'var(--danger)',
                        borderRadius: 24, padding: '12px', fontSize: 14, cursor: 'pointer', transition: 'background 0.2s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(241,92,109,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                        Log out
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
