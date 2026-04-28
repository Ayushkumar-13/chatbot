import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const ProfileForm = ({ initialData, onSubmit, saving, onLogout }) => {
    const [name, setName] = useState(initialData.fullName);
    const [bio, setBio] = useState(initialData.bio || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ fullName: name, bio });
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Name */}
            <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--app-accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Your name
                </label>
                <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    style={{ borderRadius: 8, padding: '11px 14px' }}
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
                        width: '100%',
                        background: 'var(--bg-input)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '11px 14px',
                        fontSize: 14,
                        color: 'var(--text-primary)',
                        resize: 'none',
                        fontFamily: 'inherit',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Save */}
            <Button 
                type="submit" 
                disabled={saving}
                style={{
                    background: 'var(--app-accent)',
                    borderRadius: 24,
                    padding: '13px',
                    fontSize: 15,
                    fontWeight: 600,
                    height: 'auto'
                }}
            >
                {saving ? 'Saving…' : 'Save Profile'}
            </Button>

            {/* Logout */}
            <Button 
                type="button" 
                variant="outline"
                onClick={onLogout}
                style={{
                    border: '1px solid var(--border-color)',
                    color: 'var(--danger)',
                    borderRadius: 24,
                    padding: '12px',
                    fontSize: 14,
                    height: 'auto',
                    background: 'none'
                }}
            >
                Log out
            </Button>
        </form>
    );
};

export default ProfileForm;
