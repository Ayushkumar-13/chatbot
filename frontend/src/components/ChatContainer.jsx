import React, { useContext, useEffect, useRef, useState } from 'react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { CallContext } from '../context/CallContext';
import { InitialsAvatar } from './Sidebar';
import MessageInfo from './MessageInfo';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// ── Message Tick Component ────────────────────────────────────────────────────
const MessageTick = ({ status }) => {
    if (status === 'sent') return (
        <svg viewBox="0 0 16 15" width="14" height="14" style={{ flexShrink: 0 }}>
            <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="var(--tick-grey)" />
        </svg>
    );
    const color = status === 'seen' ? 'var(--tick-blue)' : 'var(--tick-grey)';
    return (
        <svg viewBox="0 0 16 15" width="16" height="14" style={{ flexShrink: 0 }}>
            <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.364.364 0 0 0-.51.062l-.424.434a.364.364 0 0 0 .006.514l1.21 1.128a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill={color} />
        </svg>
    );
};

// ── Image Preview & Camera Components ────────────────────────────────────────
const CameraCapture = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(s => { setStream(s); if (videoRef.current) videoRef.current.srcObject = s; })
            .catch(() => toast.error('Camera not accessible'));
        return () => stream?.getTracks().forEach(t => t.stop());
    }, []);

    const capture = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        // Mirror the canvas before drawing so the captured image matches the mirrored video
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        onCapture(canvas.toDataURL('image/jpeg', 0.8));
        stream?.getTracks().forEach(t => t.stop());
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: '#000', zIndex: 100,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            <video ref={videoRef} autoPlay style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8, transform: 'scaleX(-1)' }} />
            <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
                <button onClick={onClose} style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 999, padding: '12px 28px', cursor: 'pointer', fontSize: 15 }}>Cancel</button>
                <button onClick={capture} style={{ background: 'var(--app-accent)', color: '#fff', border: 'none', borderRadius: 999, padding: '12px 28px', cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>Capture</button>
            </div>
        </div>
    );
};

// ── Main ChatContainer ────────────────────────────────────────────────────────
const ChatContainer = () => {
    const {
        messages, setMessages, selectedUser, setSelectedUser,
        sendMessage, getMessages, selectedGroup, getGroupMessages, sendGroupMessage, users, deleteMessagesAction
    } = useContext(ChatContext);
    const { authUser, onlineUsers, axios } = useContext(AuthContext);
    const { startCall } = useContext(CallContext);

    const [input, setInput] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState(["", ""]);
    const [imagePreview, setImagePreview] = useState(null); // base64 before sending
    const [showMsgInfo, setShowMsgInfo] = useState(null); // message _id
    const [contextMenu, setContextMenu] = useState(null); // { x, y, msg }
    const scrollEnd = useRef();

    const [selectedMessages, setSelectedMessages] = useState([]);
    const isSelectionMode = selectedMessages.length > 0;
    const longPressTimerRef = useRef(null);

    const handleTouchStart = (msg) => {
        if (isSelectionMode) return;
        longPressTimerRef.current = setTimeout(() => {
            setSelectedMessages(prev => [...prev, msg._id]);
        }, 500);
    };

    const handleTouchEnd = () => {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };

    const handleMessageClick = (e, msg) => {
        if (isSelectionMode) {
            e.preventDefault();
            e.stopPropagation();
            setSelectedMessages(prev =>
                prev.includes(msg._id) ? prev.filter(id => id !== msg._id) : [...prev, msg._id]
            );
        }
    };

    const isGroup = !!selectedGroup;
    const activeChat = selectedUser || selectedGroup;

    useEffect(() => {
        if (selectedUser) getMessages(selectedUser._id);
        else if (selectedGroup) getGroupMessages(selectedGroup._id);
    }, [selectedUser, selectedGroup]);

    useEffect(() => {
        scrollEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Close context menu on click
    useEffect(() => {
        const fn = () => setContextMenu(null);
        document.addEventListener('click', fn);
        return () => document.removeEventListener('click', fn);
    }, []);

    const handleSendText = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        if (isGroup) sendGroupMessage({ text: input.trim() });
        else sendMessage({ text: input.trim() });
        setInput('');
    };

    const handleSendDocument = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
            const payload = { document: { url: reader.result, name: file.name, size: file.size } };
            if (isGroup) sendGroupMessage(payload);
            else sendMessage(payload);
        };
        reader.readAsDataURL(file);
    };

    const handleCreatePoll = () => {
        const validOptions = pollOptions.filter(o => o.trim());
        if (!pollQuestion.trim() || validOptions.length < 2) return toast.error("Question and at least 2 options required");
        
        const payload = { text: "Poll", poll: { question: pollQuestion.trim(), options: validOptions } };
        if (isGroup) sendGroupMessage(payload);
        else sendMessage(payload);
        
        setShowPollModal(false);
        setPollQuestion("");
        setPollOptions(["", ""]);
    };

    const handleVotePoll = async (msgId, optionIndex) => {
        try {
            // Eagerly update UI to bypass socket lag
            setMessages(prev => prev.map(m => {
                if (m._id === msgId) {
                    const newPoll = JSON.parse(JSON.stringify(m.poll)); // Deep copy
                    const targetOption = newPoll.options[optionIndex];
                    const hasVotedIndex = targetOption.votes.findIndex(v => v === authUser._id);
                    
                    newPoll.options.forEach(opt => {
                        opt.votes = opt.votes.filter(v => v !== authUser._id);
                    });

                    if (hasVotedIndex === -1) {
                        newPoll.options[optionIndex].votes.push(authUser._id);
                    }
                    return { ...m, poll: newPoll };
                }
                return m;
            }));

            const { data } = await axios.put(`api/messages/poll/${msgId}/vote`, { optionIndex });
            if (!data.success) {
                toast.error(data.message || "Failed to vote");
            }
        } catch (error) {
            toast.error("Network error: Failed to vote");
            console.error(error);
        }
    };

    const handleDeleteMessages = async (type) => {
        const success = await deleteMessagesAction(selectedMessages, type);
        if (success) {
            setSelectedMessages([]);
            setShowDeleteModal(false);
        }
    };

    const handleSendImage = async (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const confirmSendImage = async () => {
        if (!imagePreview) return;
        if (isGroup) await sendGroupMessage({ image: imagePreview });
        else await sendMessage({ image: imagePreview });
        setImagePreview(null);
    };

    const handleCameraCapture = (base64) => {
        setShowCamera(false);
        setImagePreview(base64);
    };

    const handleRightClick = (e, msg) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, msg });
    };

    const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: false
    });

    const formatLastSeen = (dateStr) => {
        if (!dateStr) return 'offline';
        const d = new Date(dateStr);
        const today = new Date();
        const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        if (isToday) return `last seen today at ${time}`;
        
        const yesterday = new Date(today.getTime() - 86400000);
        const isYesterday = yesterday.getDate() === d.getDate() && yesterday.getMonth() === d.getMonth() && yesterday.getFullYear() === d.getFullYear();
        if (isYesterday) return `last seen yesterday at ${time}`;
        
        return `last seen ${d.toLocaleDateString()} at ${time}`;
    };

    if (!activeChat) {
        return (
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', background: 'var(--bg-secondary)', gap: 16,
                borderLeft: '1px solid var(--border-color)'
            }} className="max-md:hidden">
                <svg viewBox="0 0 303 172" width="280" fill="none">
                    <rect width="303" height="172" rx="8" fill="#202c33"/>
                    <circle cx="151" cy="86" r="46" fill="#2a3942"/>
                    <path d="M133 82c0-9.9 8.1-18 18-18s18 8.1 18 18-8.1 18-18 18-18-8.1-18-18z" fill="#374248"/>
                    <rect x="139" y="110" width="24" height="2" rx="1" fill="#374248"/>
                </svg>
                <h2 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 300, margin: 0 }}>
                    ChatApp
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', margin: 0, maxWidth: 320 }}>
                    Select a chat to start messaging.<br />
                    Send text, images, and make voice &amp; video calls.
                </p>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="var(--app-accent)"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13zm.75-9.25v4.5h-1.5v-4.5h1.5zm0-2v1.5h-1.5V3.25h1.5z"/></svg>
                    Your personal messages are end-to-end encrypted
                </div>
            </div>
        );
    }

    return (
        <>
            {showCamera && <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}

            {/* Image preview before sending */}
            {imagePreview && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 50,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20
                }}>
                    <img src={imagePreview} style={{ maxWidth: '85vw', maxHeight: '70vh', borderRadius: 8 }} alt="preview" />
                    <div style={{ display: 'flex', gap: 16 }}>
                        <button onClick={() => setImagePreview(null)} style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 28px', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={confirmSendImage} style={{ background: 'var(--app-accent)', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 28px', cursor: 'pointer', fontWeight: 600 }}>Send</button>
                    </div>
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <div style={{
                    position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 200,
                    background: 'var(--bg-panel)', borderRadius: 8, boxShadow: 'var(--shadow)',
                    border: '1px solid var(--border-color)', minWidth: 140, overflow: 'hidden', animation: 'fadeIn 0.1s'
                }}>
                    {[
                        {
                            label: 'Copy', icon: '📋',
                            onClick: () => { navigator.clipboard.writeText(contextMenu.msg.text || ''); setContextMenu(null); }
                        },
                    ].map(item => (
                        <div key={item.label} onClick={item.onClick} style={{
                            padding: '11px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                            fontSize: 14, color: 'var(--text-primary)', transition: 'background 0.1s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            {item.icon} {item.label}
                        </div>
                    ))}
                </div>
            )}

            {showMsgInfo && <MessageInfo messageId={showMsgInfo} onClose={() => setShowMsgInfo(null)} />}

            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)' }}>
                {/* ── Header ────────────────────────────────────────────── */}
                {isSelectionMode ? (
                    <div style={{
                        background: 'var(--bg-header)', padding: '12px 24px', display: 'flex',
                        alignItems: 'center', gap: 24, borderBottom: '1px solid var(--border-color)',
                        flexShrink: 0
                    }}>
                        <button onClick={() => setSelectedMessages([])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        </button>
                        <span style={{ fontSize: 18, color: 'var(--text-primary)', fontWeight: 400 }}>{selectedMessages.length} Selected</span>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
                            {selectedMessages.length === 1 && !selectedGroup && (
                                <button onClick={() => setShowMsgInfo(selectedMessages[0])} title="Message Info" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                                </button>
                            )}
                            <button onClick={() => setShowDeleteModal(true)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h1V4h-5zm2 15H7V6h10v13zM9 8h2v9H9zm4 0h2v9h-2z"/></svg>
                            </button>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            </button>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        background: 'var(--bg-header)', padding: '8px 16px', display: 'flex',
                        alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border-color)',
                        flexShrink: 0
                    }}>
                    <button
                        onClick={() => { setSelectedUser(null); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'none', padding: 4 }}
                        className="md:hidden"
                    >
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                    </button>

                    {activeChat.profilePic || activeChat.avatar
                        ? <img src={activeChat.profilePic || activeChat.avatar} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                        : <InitialsAvatar name={activeChat.fullName || activeChat.name} size={40} />
                    }

                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 500, fontSize: 15, color: 'var(--text-primary)' }}>
                            {activeChat.fullName || activeChat.name}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                            {isGroup
                                ? `${activeChat.members?.length || 0} members`
                                : (onlineUsers.includes(activeChat._id) ? 'online' : formatLastSeen(
                                    (users.find(u => u._id === activeChat._id) || activeChat).lastSeen
                                ))
                            }
                        </p>
                    </div>

                    {/* Call buttons with shadcn Tooltips (only for 1:1) */}
                    {!isGroup && (
                        <div style={{ display: 'flex', gap: 4 }}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => startCall(selectedUser, 'audio')}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 8, borderRadius: '50%', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                    >
                                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Voice call</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => startCall(selectedUser, 'video')}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 8, borderRadius: '50%', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                    >
                                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                                    </button>
                                </TooltipTrigger>
                            <TooltipContent side="bottom">Video call</TooltipContent>
                        </Tooltip>
                    </div>
                )}
                </div>
            )}

                {/* ── Messages Area ──────────────────────────────────────── */}
                <div className="chat-bg hover-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '12px 5%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {messages.map((msg, i) => {
                        const isMine = msg.senderId === authUser._id || msg.senderId?._id === authUser._id;
                        const senderUser = isGroup && !isMine
                            ? selectedGroup?.members?.find(m => m.userId?._id === msg.senderId || m.userId === msg.senderId)?.userId
                            : null;

                        return (
                            <div key={msg._id || i}
                                 onMouseDown={() => handleTouchStart(msg)}
                                 onMouseUp={handleTouchEnd}
                                 onMouseLeave={handleTouchEnd}
                                 onTouchStart={() => handleTouchStart(msg)}
                                 onTouchEnd={handleTouchEnd}
                                 onClick={(e) => handleMessageClick(e, msg)}
                                 style={{
                                     background: selectedMessages.includes(msg._id) ? 'rgba(0, 168, 132, 0.2)' : 'transparent',
                                     padding: '2px 5%', margin: '0 -5%',
                                     transition: 'background 0.2s', cursor: isSelectionMode ? 'pointer' : 'default'
                                 }}>
                                <div
                                    onContextMenu={(e) => {
                                        if(isSelectionMode) { e.preventDefault(); return; }
                                        handleRightClick(e, msg);
                                    }}
                                    className={isMine ? 'msg-sent' : 'msg-recv'}
                                    style={{
                                        display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start',
                                        marginBottom: 2
                                    }}
                                >
                                <div style={{
                                    maxWidth: '65%', minWidth: 60,
                                    background: isMine ? 'var(--bg-bubble-sent)' : 'var(--bg-bubble-recv)',
                                    borderRadius: isMine ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
                                    padding: msg.image ? 4 : (msg.messageType === 'poll' ? '8px 10px 4px' : '6px 10px'),
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                    position: 'relative'
                                }}>
                                    {/* Group sender name */}
                                    {isGroup && !isMine && senderUser && (
                                        <p style={{
                                            margin: '0 0 3px', fontSize: 12, fontWeight: 600,
                                            color: '#53bdeb'
                                        }}>
                                            {senderUser.fullName || 'Unknown'}
                                        </p>
                                    )}

                                    {msg.isDeletedForEveryone ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 14 }}>🚫</span>
                                            <span style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                                                {isMine ? 'You deleted this message' : 'This message was deleted'}
                                            </span>
                                        </div>
                                    ) : msg.image ? (
                                        <div>
                                            <img
                                                src={msg.image}
                                                style={{ maxWidth: '100%', borderRadius: 6, display: 'block', cursor: 'pointer' }}
                                                onClick={() => window.open(msg.image)}
                                                alt=""
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, padding: '3px 6px 2px' }}>
                                                <span style={{ fontSize: 10, color: 'rgba(233,237,239,0.6)' }}>{formatTime(msg.createdAt)}</span>
                                                {isMine && <MessageTick status={msg.status || 'sent'} />}
                                            </div>
                                        </div>
                                    ) : msg.messageType === 'document' ? (
                                        <div style={{ width: 240 }}>
                                            <a download={msg.document?.name} href={msg.document?.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, textDecoration: 'none' }}>
                                                <div style={{ background: 'var(--app-accent)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                                                </div>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{msg.document?.name}</p>
                                                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)' }}>{(msg.document?.size / 1024 / 1024).toFixed(2)} MB • Document</p>
                                                </div>
                                            </a>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, padding: '6px 6px 2px' }}>
                                                <span style={{ fontSize: 10, color: 'rgba(233,237,239,0.6)' }}>{formatTime(msg.createdAt)}</span>
                                                {isMine && <MessageTick status={msg.status || 'sent'} />}
                                            </div>
                                        </div>
                                    ) : msg.messageType === 'poll' ? (
                                        <div style={{ background: 'transparent', width: 280, color: '#e9edef' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                                                <span style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.3 }}>{msg.poll?.question}</span>
                                            </div>
                                            <div style={{ fontSize: 13, color: '#8696a0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> 
                                                <span>Select one</span>
                                            </div>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                                {msg.poll?.options.map((opt, idx) => {
                                                    const hasVoted = opt.votes.includes(authUser._id);
                                                    const totalVotes = msg.poll.options.reduce((acc, o) => acc + o.votes.length, 0);
                                                    const percent = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                                                    
                                                    const lastVoterId = opt.votes.length > 0 ? opt.votes[opt.votes.length - 1] : null;
                                                    let lastVoterAvatar = null;
                                                    if (lastVoterId) {
                                                        if (lastVoterId === authUser._id) { lastVoterAvatar = authUser.profilePic; }
                                                        else { const voterUser = users.find(u => u._id === lastVoterId); lastVoterAvatar = voterUser?.profilePic || voterUser?.avatar; }
                                                    }

                                                    return (
                                                        <div key={idx} onClick={(e) => {
                                                            if(isSelectionMode) return;
                                                            e.stopPropagation();
                                                            handleVotePoll(msg._id, idx);
                                                        }} style={{ cursor: 'pointer' }}>
                                                            
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                                    {hasVoted ? (
                                                                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="#111"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #8696a0', flexShrink: 0 }} />
                                                                    )}
                                                                    <span style={{ fontSize: 15, color: '#e9edef', fontWeight: hasVoted ? 500 : 400 }}>{opt.option}</span>
                                                                </div>
                                                                
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                    {lastVoterAvatar ? (
                                                                        <img src={lastVoterAvatar} style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                                                    ) : lastVoterId ? (
                                                                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#667781', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>
                                                                            {((lastVoterId === authUser._id ? authUser.fullName : users.find(u => u._id === lastVoterId)?.fullName) || 'U')[0]}
                                                                        </div>
                                                                    ) : null}
                                                                    <span style={{ fontSize: 13, color: '#e9edef' }}>{opt.votes.length}</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div style={{ marginLeft: 32, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                                                                <div style={{ height: '100%', width: `${percent}%`, background: '#25D366', borderRadius: 4, transition: 'width 0.3s' }} />
                                                            </div>
                                                            
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{formatTime(msg.createdAt)} <MessageTick status={msg.status || 'sent'} /></span>
                                            </div>
                                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 8, paddingTop: 10, textAlign: 'center', cursor: 'pointer', color: '#25D366', fontSize: 14, fontWeight: 500 }}>
                                                View votes
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.4, wordBreak: 'break-word' }}>
                                                {msg.text}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 'auto', flexShrink: 0, paddingLeft: 8 }}>
                                                <span style={{ fontSize: 10, color: 'rgba(233,237,239,0.6)', whiteSpace: 'nowrap' }}>
                                                    {formatTime(msg.createdAt)}
                                                </span>
                                                {isMine && <MessageTick status={msg.status || 'sent'} />}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollEnd} />
                </div>

                {/* ── Input Bar ─────────────────────────────────────────── */}
                <div style={{
                    background: 'var(--bg-panel)', padding: '8px 12px',
                    display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, position: 'relative'
                }}>
                    {showEmojiPicker && (
                        <div style={{ position: 'absolute', bottom: '60px', left: '12px', zIndex: 50 }}>
                            <EmojiPicker theme="dark" onEmojiClick={(e) => setInput(prev => prev + e.emoji)} />
                        </div>
                    )}
                    {/* Text input with attachments inside */}
                    <form onSubmit={handleSendText} style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-input)', borderRadius: 24, padding: '4px 16px', gap: 6 }}>
                        
                        {/* + Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button type="button" title="Attach" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                    </svg>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" side="top" sideOffset={10} style={{ background: 'var(--bg-panel)', border: 'none', borderRadius: 16, padding: '12px 8px', minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 100 }}>
                                <DropdownMenuItem asChild style={{ cursor: 'pointer', padding: '10px 12px', gap: 12, borderRadius: 8 }}>
                                    <label style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12, margin: 0 }}>
                                        <div style={{ background: '#7f66ff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                                        </div>
                                        <span style={{ fontSize: 16, color: 'var(--text-primary)' }}>Document</span>
                                        <input type="file" hidden onChange={e => { if (e.target.files[0]) handleSendDocument(e.target.files[0]); e.target.value = ''; }} />
                                    </label>
                                </DropdownMenuItem>
                                
                                {/* PHOTOS & VIDEOS trigger */}
                                <DropdownMenuItem asChild style={{ cursor: 'pointer', padding: '10px 12px', gap: 12, borderRadius: 8 }}>
                                    <label style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12, margin: 0 }}>
                                        <div style={{ background: '#007bfc', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                                        </div>
                                        <span style={{ fontSize: 16, color: 'var(--text-primary)' }}>Photos & videos</span>
                                        <input type="file" accept="image/*,video/*" hidden onChange={e => { if (e.target.files[0]) handleSendImage(e.target.files[0]); e.target.value = ''; }} />
                                    </label>
                                </DropdownMenuItem>

                                {/* CAMERA trigger */}
                                <DropdownMenuItem onSelect={() => setShowCamera(true)} style={{ cursor: 'pointer', padding: '10px 12px', gap: 12, borderRadius: 8 }}>
                                    <div style={{ background: '#ff2e74', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
                                    </div>
                                    <span style={{ fontSize: 16, color: 'var(--text-primary)' }}>Camera</span>
                                </DropdownMenuItem>

                                
                                {/* Poll */}
                                <DropdownMenuItem onSelect={() => setShowPollModal(true)} style={{ cursor: 'pointer', padding: '10px 12px', gap: 12, borderRadius: 8 }}>
                                    <div style={{ background: '#ffbc38', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14h-2V7h2v10zm-4 0h-2v-4h2v4zm-4 0H7v-7h2v7z"/></svg>
                                    </div>
                                    <span style={{ fontSize: 16, color: 'var(--text-primary)' }}>Poll</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Emoji Button */}
                        <button type="button" title="Emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                            </svg>
                        </button>

                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onFocus={() => setShowEmojiPicker(false)}
                            placeholder="Type a message"
                            style={{ flex: 1, fontSize: 16, background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', padding: '8px 4px' }}
                        />

                        {/* Microphone / Send Button inside the pill */}
                        {input.trim() ? (
                            <button type="submit" title="Send" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                            </button>
                        ) : (
                            <button type="button" title="Voice message" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                                </svg>
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Poll Creation Modal */}
            {showPollModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'var(--bg-panel)', width: 320, padding: 24, borderRadius: 12 }}>
                        <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)' }}>Create Poll</h3>
                        <input
                            value={pollQuestion}
                            onChange={e => setPollQuestion(e.target.value)}
                            placeholder="Ask a question..."
                            style={{ width: '100%', padding: '10px', marginBottom: 12, borderRadius: 6, border: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                        />
                        {pollOptions.map((opt, i) => (
                            <input
                                key={i}
                                value={opt}
                                onChange={e => {
                                    const newOpts = [...pollOptions];
                                    newOpts[i] = e.target.value;
                                    setPollOptions(newOpts);
                                }}
                                placeholder={`Option ${i + 1}`}
                                style={{ width: '100%', padding: '8px', marginBottom: 8, borderRadius: 6, border: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                            />
                        ))}
                        <button onClick={() => setPollOptions([...pollOptions, ''])} style={{ background: 'none', border: 'none', color: 'var(--app-accent)', cursor: 'pointer', padding: '8px 0', fontSize: 14 }}>+ Add Option</button>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                            <button onClick={() => setShowPollModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px 16px' }}>Cancel</button>
                            <button onClick={handleCreatePoll} style={{ background: 'var(--app-accent)', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px 16px', borderRadius: 20 }}>Send</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Modal */}
            {showDeleteModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'var(--bg-panel)', width: 340, padding: 24, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h3 style={{ margin: '0', color: 'var(--text-primary)', fontSize: 18, fontWeight: 400 }}>Delete message?</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                            {selectedMessages.every(id => {
                                const m = messages.find(x => x._id === id);
                                return m && (m.senderId === authUser._id || m.senderId?._id === authUser._id);
                            }) && (
                                <button onClick={() => handleDeleteMessages('everyone')} style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', padding: '12px', borderRadius: 8, textAlign: 'right', fontSize: 15 }}>
                                    Delete for everyone
                                </button>
                            )}
                            <button onClick={() => handleDeleteMessages('me')} style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', padding: '12px', borderRadius: 8, textAlign: 'right', fontSize: 15 }}>
                                Delete for me
                            </button>
                            <button onClick={() => setShowDeleteModal(false)} style={{ background: 'var(--app-accent)', border: 'none', color: '#fff', cursor: 'pointer', padding: '12px', borderRadius: 8, textAlign: 'center', fontSize: 15, fontWeight: 500, marginTop: 8 }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatContainer;
