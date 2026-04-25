import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const MessageInfo = ({ messageId, onClose }) => {
    const { axios } = useContext(AuthContext);
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/messages/info/${messageId}`)
            .then(r => { if (r.data.success) setInfo(r.data.message); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [messageId]);

    const formatTime = (d) => d ? new Date(d).toLocaleString('en-US', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }) : '—';

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 150,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: 'var(--bg-primary)', borderRadius: 12, width: 360, maxHeight: '70vh',
                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}>
                <div style={{ background: 'var(--bg-header)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 17, fontWeight: 500 }}>Message Info</h3>
                </div>

                <div className="hover-scrollbar" style={{ overflowY: 'auto', padding: 16 }}>
                    {loading && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>Loading...</p>}

                    {info && (
                        <>
                            {/* Message preview */}
                            <div style={{ background: 'var(--bg-bubble-sent)', borderRadius: 8, padding: '8px 12px', marginBottom: 20 }}>
                                {info.image
                                    ? <img src={info.image} style={{ maxWidth: '100%', borderRadius: 6 }} alt="" />
                                    : <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 14 }}>{info.text}</p>
                                }
                            </div>

                            {/* Status */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {[
                                    {
                                        label: 'Read by',
                                        icon: (
                                            <svg viewBox="0 0 16 15" width="18" height="14" style={{ flexShrink: 0 }}>
                                                <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.364.364 0 0 0-.51.062l-.424.434a.364.364 0 0 0 .006.514l1.21 1.128a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="var(--tick-blue)" />
                                            </svg>
                                        ),
                                        people: info.seenBy || []
                                    },
                                    {
                                        label: 'Delivered to',
                                        icon: (
                                            <svg viewBox="0 0 16 15" width="18" height="14" style={{ flexShrink: 0 }}>
                                                <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.364.364 0 0 0-.51.062l-.424.434a.364.364 0 0 0 .006.514l1.21 1.128a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="var(--tick-grey)" />
                                            </svg>
                                        ),
                                        people: info.deliveredTo?.map(u => ({ userId: u })) || []
                                    }
                                ].map(section => (
                                    <div key={section.label}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0 8px', borderTop: '1px solid var(--border-color)' }}>
                                            {section.icon}
                                            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{section.label}</span>
                                        </div>
                                        {section.people.length === 0
                                            ? <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '4px 0 12px 28px' }}>None</p>
                                            : section.people.map((entry, i) => {
                                                const user = entry.userId || entry;
                                                return (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0 6px 28px' }}>
                                                        {user.profilePic
                                                            ? <img src={user.profilePic} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                                            : <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 14 }}>{(user.fullName || 'U')[0]}</div>
                                                        }
                                                        <div>
                                                            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{user.fullName || 'User'}</p>
                                                            {entry.seenAt && <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{formatTime(entry.seenAt)}</p>}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                ))}
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-color)', padding: '12px 0 0', marginTop: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-secondary)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                        Sent: {formatTime(info.createdAt)} &nbsp;·&nbsp; Status: <span style={{ color: info.status === 'seen' ? 'var(--tick-blue)' : 'var(--text-muted)', fontWeight: 500 }}>{info.status || 'sent'}</span>
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageInfo;
