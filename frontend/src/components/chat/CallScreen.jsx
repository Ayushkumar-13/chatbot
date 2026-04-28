import React, { useContext, useEffect, useRef, useState } from 'react';
import { CallContext } from '../../context/CallContext';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContextInstance';
import { InitialsAvatar } from '../ui/InitialsAvatar';

const CallScreen = () => {
    const {
        callState, localStream, remoteStreams, remoteUsers,
        localVideoRef,
        startCall, answerCall, rejectCall, endCall,
        toggleMute, toggleCamera
    } = useContext(CallContext);
    const { authUser } = useContext(AuthContext);

    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const timerRef = useRef(null);

    const isVideo = callState?.type === 'video';
    const isInCall = callState?.status === 'in-call';
    const isIncoming = callState?.status === 'incoming';
    const isCalling = callState?.status === 'calling';
    const remoteUser = callState?.remoteUser; // Initial user for calling status

    const allStreams = [
        { id: 'local', stream: localStream, user: authUser, isLocal: true },
        ...Object.entries(remoteStreams).map(([userId, stream]) => ({
            id: userId,
            stream,
            user: remoteUsers[userId],
            isLocal: false
        }))
    ];

    useEffect(() => {
        if (isInCall) {
            timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
        }
        return () => {
            clearInterval(timerRef.current);
            setCallDuration(0);
        };
    }, [isInCall]);

    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleMute = () => {
        toggleMute();
        setIsMuted(p => !p);
    };

    const handleCamera = () => {
        toggleCamera();
        setIsCameraOff(p => !p);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: '#0b141a',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '20px'
        }}>
            {/* ── Grid Header ────────────────────────────────────────── */}
            <div style={{ zIndex: 10, textAlign: 'center', width: '100%', marginBottom: 20 }}>
                {isInCall && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0 }}>{formatDuration(callDuration)}</p>}
            </div>

            {/* ── Multi-User Video Grid ───────────────────────────────── */}
            <div style={{
                flex: 1, width: '100%', maxWidth: 1200,
                display: 'grid',
                gridTemplateColumns: allStreams.length === 1 ? '1fr' : allStreams.length === 2 ? 'repeat(auto-fit, minmax(300px, 1fr))' : 'repeat(auto-fit, minmax(240px, 1fr))',
                gridTemplateRows: allStreams.length <= 2 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12, overflow: 'hidden', padding: 10
            }}>
                {allStreams.map((item) => (
                    <VideoBox key={item.id} item={item} isVideo={isVideo} />
                ))}

                {/* Waiting State Overlay */}
                {(isCalling || isIncoming) && allStreams.length <= 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                        <div style={{ position: 'relative' }}>
                            {remoteUser?.profilePic
                                ? <img src={remoteUser.profilePic} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                : <InitialsAvatar name={remoteUser?.fullName || '?'} size={120} />
                            }
                            <span className="ring" style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: '2px solid var(--app-accent)', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                        </div>
                        <h2 style={{ color: '#fff', margin: 0, fontSize: 24 }}>{remoteUser?.fullName || 'Call'}</h2>
                        <p style={{ color: 'var(--app-accent)', margin: 0, fontWeight: 500 }}>{isCalling ? 'Calling...' : 'Incoming Call...'}</p>
                    </div>
                )}
            </div>

            {/* ── Controls ────────────────────────────────────────────── */}
            <div style={{ zIndex: 10, display: 'flex', gap: 16, padding: '20px 0', width: '100%', justifyContent: 'center', background: 'rgba(11,20,26,0.8)', backdropFilter: 'blur(8px)', borderRadius: '24px 24px 0 0' }}>
                {isInCall && (
                    <>
                        <ControlBtn icon={isMuted ? '🔇' : '🎤'} label={isMuted ? 'Unmute' : 'Mute'} onClick={handleMute} color={isMuted ? '#f15c6d' : '#374248'} />
                        {isVideo && <ControlBtn icon={isCameraOff ? '📵' : '📷'} label={isCameraOff ? 'Show' : 'Hide'} onClick={handleCamera} color={isCameraOff ? '#f15c6d' : '#374248'} />}
                        
                        <InviteButton onInvite={(user) => startCall(user, callState.type)} />

                        <ControlBtn icon="📞" label="End" onClick={endCall} color="#f15c6d" size={60} />
                    </>
                )}

                {isIncoming && (
                    <div style={{ display: 'flex', gap: 40 }}>
                        <ControlBtn icon="📵" label="Decline" onClick={rejectCall} color="#f15c6d" size={60} />
                        <ControlBtn icon="📞" label="Accept" onClick={answerCall} color="var(--app-accent)" size={60} />
                    </div>
                )}

                {isCalling && (
                    <ControlBtn icon="📵" label="Cancel" onClick={endCall} color="#f15c6d" size={60} />
                )}
            </div>
        </div>
    );
};

const VideoBox = ({ item, isVideo }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && item.stream) {
            videoRef.current.srcObject = item.stream;
        }
    }, [item.stream]);

    return (
        <div style={{
            position: 'relative', background: '#202c33', borderRadius: 16, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)'
        }}>
            {isVideo && item.stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={item.isLocal}
                    style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        transform: item.isLocal ? 'scaleX(-1)' : 'none'
                    }}
                />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    {item.user?.profilePic
                        ? <img src={item.user.profilePic} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                        : <InitialsAvatar name={item.user?.fullName || '?'} size={80} />
                    }
                    <span style={{ color: '#fff', fontSize: 14 }}>{item.user?.fullName}</span>
                </div>
            )}
            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#fff', fontSize: 12 }}>{item.isLocal ? 'You' : item.user?.fullName}</span>
                {item.isLocal && <span style={{ width: 6, height: 6, background: 'var(--app-accent)', borderRadius: '50%' }} />}
            </div>
        </div>
    );
};

const InviteButton = ({ onInvite }) => {
    const { users } = useContext(ChatContext);
    const { onlineUsers, authUser } = useContext(AuthContext);
    const { remoteStreams } = useContext(CallContext);
    const [showList, setShowList] = useState(false);

    const availableUsers = users.filter(u => 
        u._id !== authUser?._id && 
        onlineUsers.includes(u._id) && 
        !remoteStreams[u._id]
    );

    return (
        <div style={{ position: 'relative' }}>
            <ControlBtn 
                icon="➕" label="Invite" 
                onClick={() => setShowList(!showList)} 
                color={showList ? 'var(--app-accent)' : '#374248'} 
            />
            
            {showList && (
                <div style={{
                    position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                    marginBottom: 16, background: '#233138', borderRadius: 12, width: 240,
                    maxHeight: 300, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    padding: '8px 0', zIndex: 100, border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, padding: '8px 16px', margin: 0 }}>Invite to call</p>
                    {availableUsers.length === 0 ? (
                        <p style={{ color: '#fff', fontSize: 13, padding: '12px 16px', margin: 0 }}>No online users available</p>
                    ) : (
                        availableUsers.map(u => (
                            <div 
                                key={u._id}
                                onClick={() => { onInvite(u); setShowList(false); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#182229'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                                {u.profilePic ? <img src={u.profilePic} style={{ width: 32, height: 32, borderRadius: '50%' }} alt="" /> : <InitialsAvatar name={u.fullName} size={32} />}
                                <span style={{ color: '#fff', fontSize: 14 }}>{u.fullName}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const ControlBtn = ({ icon, label, onClick, color = '#374248', size = 52 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <button onClick={onClick} style={{
            width: size, height: size, borderRadius: '50%', background: color,
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: size * 0.45, transition: 'all 0.2s'
        }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
            {icon}
        </button>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{label}</span>
    </div>
);

export default CallScreen;
