import React from 'react';

export const InitialsAvatar = ({ name = '', size = 40, className = '' }) => {
    const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];
    const color = colors[(name && name.length > 0 ? name.charCodeAt(0) : 0) % colors.length];
    const safeName = name || '';
    const initials = safeName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    return (
        <div className={className} style={{
            width: size, height: size, borderRadius: '50%', background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.38, fontWeight: 600, color: '#fff', flexShrink: 0
        }}>
            {initials}
        </div>
    );
};
