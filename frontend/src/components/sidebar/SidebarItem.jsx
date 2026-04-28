import React from 'react';
import { InitialsAvatar } from '../ui/InitialsAvatar';

const SidebarItem = ({ 
    id, 
    onClick, 
    isSelected, 
    avatar, 
    name, 
    isOnline, 
    lastMsg, 
    unseen, 
    formatTime, 
    subtitle,
    isNewChat
}) => {
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', cursor: 'pointer',
                background: isSelected ? 'var(--bg-selected)' : 'transparent',
                borderBottom: '1px solid var(--border-color)',
                transition: 'background 0.15s'
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
        >
            <div style={{ position: 'relative', flexShrink: 0 }}>
                {avatar
                    ? <img src={avatar} style={{ width: 49, height: 49, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                    : <InitialsAvatar name={name} size={49} />
                }
                {isOnline && (
                    <span style={{
                        position: 'absolute', bottom: 1, right: 1,
                        width: 11, height: 11, borderRadius: '50%',
                        background: 'var(--app-accent)', border: '2px solid var(--bg-primary)'
                    }} />
                )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {name}
                    </span>
                    {lastMsg && !isNewChat && (
                        <span style={{ fontSize: 11, color: unseen > 0 ? 'var(--app-accent)' : 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
                            {formatTime(lastMsg.createdAt)}
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{
                        fontSize: 13, color: 'var(--text-secondary)', margin: 0,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%'
                    }}>
                        {subtitle}
                    </p>
                    {unseen > 0 && !isNewChat && (
                        <span style={{
                            background: 'var(--app-accent)', color: '#fff', borderRadius: 999,
                            fontSize: 11, fontWeight: 600, minWidth: 18, height: 18,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px'
                        }}>
                            {unseen}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SidebarItem;
