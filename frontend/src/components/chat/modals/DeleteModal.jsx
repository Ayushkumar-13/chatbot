import React from 'react';

const DeleteModal = ({ selectedMessages, messages, authUser, onDelete, onClose }) => {
    const canDeleteForEveryone = selectedMessages.every(id => {
        const m = messages.find(x => x._id === id);
        return m && (m.senderId === authUser?._id || m.senderId?._id === authUser?._id);
    });

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg-panel)', width: 340, padding: 24, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ margin: '0', color: 'var(--text-primary)', fontSize: 18, fontWeight: 400 }}>Delete message?</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                    {canDeleteForEveryone && (
                        <button onClick={() => onDelete('everyone')} style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', padding: '12px', borderRadius: 8, textAlign: 'right', fontSize: 15 }}>Delete for everyone</button>
                    )}
                    <button onClick={() => onDelete('me')} style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', padding: '12px', borderRadius: 8, textAlign: 'right', fontSize: 15 }}>Delete for me</button>
                    <button onClick={onClose} style={{ background: 'var(--app-accent)', border: 'none', color: '#fff', cursor: 'pointer', padding: '12px', borderRadius: 8, textAlign: 'center', fontSize: 15, fontWeight: 500, marginTop: 8 }}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
