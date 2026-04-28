import React from 'react';

const PollDetailsModal = ({ message, authUser, users, onClose }) => {
    if (!message) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg-panel)', width: 340, maxHeight: '80vh', overflowY: 'auto', padding: 24, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: '0', color: 'var(--text-primary)', fontSize: 18, fontWeight: 500 }}>Poll details</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                    </button>
                </div>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, wordBreak: 'break-word' }}>{message.poll?.question || "Poll"}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                    {Array.isArray(message.poll?.options) && message.poll.options.map((opt, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, color: 'var(--text-primary)' }}>
                                <span style={{ fontSize: 15, fontWeight: 500, wordBreak: 'break-word' }}>{opt.option}</span>
                                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{opt.votes?.length || 0}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {(!opt.votes || opt.votes.length === 0) ? (
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>No votes yet</span>
                                ) : opt.votes.map((voterId, i) => {
                                    const voterIsMe = voterId === authUser?._id;
                                    const voterData = voterIsMe ? authUser : (Array.isArray(users) ? users.find(u => u._id === voterId) : null);
                                    const avatar = voterData?.profilePic || voterData?.avatar;
                                    const name = voterIsMe ? 'You' : (voterData?.fullName || 'Unknown');
                                    return (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            {avatar ? (
                                                <img src={avatar} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                            ) : (
                                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#667781', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff' }}>
                                                    {name[0]}
                                                </div>
                                            )}
                                            <span style={{ fontSize: 15, color: 'var(--text-primary)' }}>{name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            {idx < message.poll.options.length - 1 && <div style={{ borderBottom: '1px solid var(--border-color)', margin: '16px 0 0' }} />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PollDetailsModal;
