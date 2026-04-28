import React from 'react';
import { InitialsAvatar } from '../ui/InitialsAvatar';

const AvatarUpload = ({ displayPic, name, onFileSelect, onRemove, showRemove }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
                {displayPic
                    ? <img src={displayPic} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--app-accent)' }} alt="" />
                    : <InitialsAvatar name={name} size={100} />
                }
                <label style={{
                    position: 'absolute', bottom: 0, right: 0, width: 30, height: 30,
                    background: 'var(--app-accent)', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-primary)'
                }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
                    <input type="file" accept="image/*" hidden onChange={onFileSelect} />
                </label>
            </div>

            {showRemove && (
                <button type="button" onClick={onRemove} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 13
                }}>
                    Remove profile picture
                </button>
            )}
        </div>
    );
};

export default AvatarUpload;
