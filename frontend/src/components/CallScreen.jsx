import React, { useContext, useEffect, useRef, useState } from 'react';
import { CallContext } from '../context/CallContext';
import { AuthContext } from '../context/AuthContext';
import { InitialsAvatar } from './Sidebar';

const CallScreen = () => {
    const {
        callState, localStream, remoteStream,
        localVideoRef, remoteVideoRef,
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
    const remoteUser = callState?.remoteUser;

    // Timer for call duration
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

    // Attach streams to video elements
    useEffect(() => {
        if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    }, [localStream]);
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
    }, [remoteStream]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: isVideo ? '#000' : '#1f2c33',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '40px 20px'
        }}>
            {/* ── Video streams ─────────────────────────────────────── */}
            {isVideo && (
                <>
                    {/* Remote video (full screen) */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        style={{
                            position: 'absolute', inset: 0, width: '100%', height: '100%',
                            objectFit: 'cover', display: isInCall ? 'block' : 'none'
                        }}
                    />
                    {/* Local video (pip) */}
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            position: 'absolute', bottom: 120, right: 16,
                            width: 100, height: 140, objectFit: 'cover',
                            borderRadius: 12, border: '2px solid rgba(255,255,255,0.3)',
                            transform: 'scaleX(-1)', // Mirrored effect
                            display: localStream ? 'block' : 'none', zIndex: 10
                        }}
                    />
                </>
            )}

            {/* ── Caller Info (non-video or waiting) ──────────────────── */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                zIndex: 10
            }}>
                <div style={{ position: 'relative' }}>
                    {remoteUser?.profilePic
                        ? <img src={remoteUser.profilePic} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                        : <InitialsAvatar name={remoteUser?.fullName || '?'} size={96} />
                    }
                    {(isCalling || isIncoming) && (
                        <span className="ring" style={{ position: 'absolute', inset: -8, borderRadius: '50%' }} />
                    )}
                </div>
                <h2 style={{ color: '#fff', margin: 0, fontSize: 24, fontWeight: 500 }}>
                    {remoteUser?.fullName || 'Unknown'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.65)', margin: 0, fontSize: 15 }}>
                    {isIncoming
                        ? `Incoming ${isVideo ? 'video' : 'voice'} call…`
                        : isCalling
                            ? 'Calling…'
                            : isInCall
                                ? formatDuration(callDuration)
                                : ''}
                </p>
            </div>

            {/* ── Control Buttons ──────────────────────────────────────── */}
            <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}>

                {/* In-call controls */}
                {isInCall && (
                    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                        <ControlBtn icon={isMuted ? '🔇' : '🎤'} label={isMuted ? 'Unmute' : 'Mute'} onClick={handleMute} color="#374248" />
                        {isVideo && <ControlBtn icon={isCameraOff ? '📵' : '📷'} label={isCameraOff ? 'Show' : 'Hide'} onClick={handleCamera} color="#374248" />}
                        <ControlBtn icon="📞" label="End" onClick={endCall} color="#f15c6d" size={64} />
                    </div>
                )}

                {/* Incoming call controls */}
                {isIncoming && (
                    <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <button onClick={rejectCall} style={{
                                width: 64, height: 64, borderRadius: '50%', background: '#f15c6d',
                                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: 26
                            }}>
                                📵
                            </button>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Decline</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <button onClick={answerCall} style={{
                                width: 64, height: 64, borderRadius: '50%', background: 'var(--app-accent)',
                                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: 26
                            }}>
                                📞
                            </button>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Accept</span>
                        </div>
                    </div>
                )}

                {/* Calling controls (just hang up) */}
                {isCalling && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <button onClick={endCall} style={{
                            width: 64, height: 64, borderRadius: '50%', background: '#f15c6d',
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 26
                        }}>
                            📵
                        </button>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Cancel</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const ControlBtn = ({ icon, label, onClick, color = '#374248', size = 52 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <button onClick={onClick} style={{
            width: size, height: size, borderRadius: '50%', background: color,
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: size * 0.45, transition: 'opacity 0.15s'
        }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
            {icon}
        </button>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{label}</span>
    </div>
);

export default CallScreen;
