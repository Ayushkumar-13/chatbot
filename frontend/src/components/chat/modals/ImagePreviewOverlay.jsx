import React from 'react';

const ImagePreviewOverlay = ({ imagePreview, onCancel, onConfirm }) => {
    if (!imagePreview) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', marginBottom: 20 }}>
                <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 24 }}>✕</button>
                <span style={{ fontSize: 16, fontWeight: 500 }}>Preview</span>
                <div style={{ width: 24 }} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={imagePreview} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }} alt="" />
            </div>
            <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
                <button onClick={onConfirm} style={{ background: 'var(--app-accent)', color: '#fff', border: 'none', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                </button>
            </div>
        </div>
    );
};

export default ImagePreviewOverlay;
