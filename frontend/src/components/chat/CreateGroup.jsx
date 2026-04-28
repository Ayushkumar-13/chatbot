import React, { useContext, useState } from 'react';
import PhotoCropper from '../profile/PhotoCropper';

const CreateGroup = ({ users, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    
    // For Avatar Cropper
    const [avatarPreviewURL, setAvatarPreviewURL] = useState(null); // Before crop
    const [finalAvatarBase64, setFinalAvatarBase64] = useState(null); // After crop

    const [loading, setLoading] = useState(false);

    const toggleMember = (userId) => {
        setSelectedMembers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleAvatarSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreviewURL(reader.result);
        };
        reader.readAsDataURL(file);
        e.target.value = null;
    };

    const handleCropComplete = (croppedBase64) => {
        setFinalAvatarBase64(croppedBase64);
        setAvatarPreviewURL(null); // close cropper
    };

    const handleCreate = async () => {
        if (!name.trim() || selectedMembers.length === 0) return;
        setLoading(true);
        await onCreate({ name: name.trim(), description, members: selectedMembers, avatar: finalAvatarBase64 });
        setLoading(false);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            {avatarPreviewURL && (
                <PhotoCropper
                    imageSrc={avatarPreviewURL}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setAvatarPreviewURL(null)}
                />
            )}

            <div style={{
                background: 'var(--bg-primary)', borderRadius: 12, width: '90%', maxWidth: 440,
                maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}>
                {/* Header */}
                <div style={{ background: 'var(--bg-header)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>
                    </button>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 18, fontWeight: 500 }}>New Group</h3>
                </div>

                <div className="hover-scrollbar" style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Group avatar + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <label style={{ cursor: 'pointer', flexShrink: 0 }}>
                            <input type="file" accept="image/*" hidden onChange={handleAvatarSelect} />
                            {finalAvatarBase64
                                ? <img src={finalAvatarBase64} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                : (
                                    <div style={{
                                        width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-input)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--text-secondary)', fontSize: 11, gap: 2, border: '1px dashed var(--border-color)'
                                    }}>
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                                        Photo
                                    </div>
                                )
                            }
                        </label>
                        <div style={{ flex: 1 }}>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Group name (required)"
                                maxLength={60}
                                style={{
                                    width: '100%', background: 'var(--bg-input)', border: 'none',
                                    borderRadius: 8, padding: '10px 14px', fontSize: 15, color: 'var(--text-primary)'
                                }}
                            />
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Group description (optional)"
                                rows={2}
                                style={{
                                    width: '100%', background: 'var(--bg-input)', border: 'none',
                                    borderRadius: 8, padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)',
                                    marginTop: 8, resize: 'none', fontFamily: 'inherit'
                                }}
                            />
                        </div>
                    </div>

                    {/* Members selection */}
                    <div>
                        <p style={{ margin: '0 0 10px', color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Add Members ({selectedMembers.length})
                        </p>
                        <div className="hover-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 260, overflowY: 'auto' }}>
                            {users.map(user => {
                                const selected = selectedMembers.includes(user._id);
                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => toggleMember(user._id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                                            background: selected ? 'var(--bg-selected)' : 'transparent',
                                            transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                        onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        {user.profilePic
                                            ? <img src={user.profilePic} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                            : (
                                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 16 }}>
                                                    {user.fullName[0]?.toUpperCase()}
                                                </div>
                                            )
                                        }
                                        <span style={{ flex: 1, fontSize: 15, color: 'var(--text-primary)' }}>{user.fullName}</span>
                                        <div style={{
                                            width: 22, height: 22, borderRadius: '50%',
                                            border: `2px solid ${selected ? 'var(--app-accent)' : 'var(--text-secondary)'}`,
                                            background: selected ? 'var(--app-accent)' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s'
                                        }}>
                                            {selected && <svg viewBox="0 0 24 24" width="13" height="13" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontSize: 14 }}>
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={loading || !name.trim() || selectedMembers.length === 0}
                        style={{
                            background: name.trim() && selectedMembers.length > 0 ? 'var(--app-accent)' : 'var(--bg-input)',
                            border: 'none', color: '#fff', borderRadius: 8, padding: '9px 24px',
                            cursor: loading || !name.trim() || selectedMembers.length === 0 ? 'not-allowed' : 'pointer',
                            fontSize: 14, fontWeight: 600, transition: 'background 0.2s'
                        }}
                    >
                        {loading ? 'Creating...' : 'Create Group'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroup;
