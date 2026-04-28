import React, { useContext, useEffect, useRef, useState } from 'react';
import { ChatContext } from '../../context/ChatContextInstance';
import { AuthContext } from '../../context/AuthContext';
import { CallContext } from '../../context/CallContext';
import useAudioRecorder from '../../hooks/useAudioRecorder';

// New Modular Components
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageItem from './MessageItem';
import MessageInfo from './MessageInfo';
import GroupInfo from './GroupInfo';
import CameraCapture from './CameraCapture';

// Modals
import PollModal from './modals/PollModal';
import DeleteModal from './modals/DeleteModal';
import PollDetailsModal from './modals/PollDetailsModal';
import ImagePreviewOverlay from './modals/ImagePreviewOverlay';

// ── Main ChatContainer ────────────────────────────────────────────────────────
const ChatContainer = () => {
    const {
        messages, setMessages, selectedUser, setSelectedUser,
        sendMessage, getMessages, selectedGroup, getGroupMessages, sendGroupMessage, users, deleteMessagesAction,
        setSelectedGroup 
    } = useContext(ChatContext);
    const { authUser, onlineUsers, axios } = useContext(AuthContext);
    const { startCall } = useContext(CallContext);

    const [input, setInput] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [viewVotesMessage, setViewVotesMessage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // base64 before sending
    const [showMsgInfo, setShowMsgInfo] = useState(null); // message _id
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [contextMenu, setContextMenu] = useState(null); // { x, y, msg }
    const [selectedMessages, setSelectedMessages] = useState([]);
    const scrollEnd = useRef();

    const isSelectionMode = selectedMessages.length > 0;
    const isGroup = !!selectedGroup;
    const activeChat = selectedUser || selectedGroup;

    // Audio Hook
    const {
        isRecording, recordingTime, visualizerData,
        startRecording, stopAndSendRecording, cancelRecording, formatDuration
    } = useAudioRecorder((payload) => {
        if (selectedGroup) sendGroupMessage(payload);
        else sendMessage(payload);
    });

    useEffect(() => {
        if (selectedUser) getMessages(selectedUser._id);
        else if (selectedGroup) getGroupMessages(selectedGroup._id);
    }, [selectedUser, selectedGroup]);

    useEffect(() => {
        scrollEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const fn = () => setContextMenu(null);
        document.addEventListener('click', fn);
        return () => document.removeEventListener('click', fn);
    }, []);

    if (!authUser) return null;

    const handleSendText = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const payload = { text: input.trim() };
        if (isGroup) await sendGroupMessage(payload);
        else await sendMessage(payload);
        setInput('');
        setShowEmojiPicker(false);
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

    const handleCreatePoll = (question, options) => {
        const payload = { text: "Poll", poll: { question, options } };
        if (isGroup) sendGroupMessage(payload);
        else sendMessage(payload);
        setShowPollModal(false);
    };

    const handleVotePoll = async (msgId, optionIndex) => {
        try {
            setMessages(prev => prev.map(m => {
                if (m._id === msgId && m.poll?.options) {
                    const newPoll = JSON.parse(JSON.stringify(m.poll));
                    newPoll.options.forEach(opt => {
                        opt.votes = (opt.votes || []).filter(v => v !== authUser?._id);
                    });
                    newPoll.options[optionIndex].votes.push(authUser?._id);
                    return { ...m, poll: newPoll };
                }
                return m;
            }));
            await axios.put(`api/messages/poll/${msgId}/vote`, { optionIndex });
        } catch (error) {
            console.error("Failed to vote", error);
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', gap: 16, borderLeft: '1px solid var(--border-color)' }}>
                <div style={{ textAlign: 'center', padding: '0 20px' }}>
                    <svg viewBox="0 0 303 172" width="280" fill="none" style={{ margin: '0 auto 16px' }}><rect width="303" height="172" rx="8" fill="#202c33" /><circle cx="151" cy="86" r="46" fill="#2a3942" /><path d="M133 82c0-9.9 8.1-18 18-18s18 8.1 18 18-8.1 18-18 18-18-8.1-18-18z" fill="#374248" /><rect x="139" y="110" width="24" height="2" rx="1" fill="#374248" /></svg>
                    <h2 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 300, margin: 0 }}>ChatApp</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', margin: '8px 0 0', maxWidth: 320 }}>Select a chat to start messaging.<br />Send text, images, and make voice & video calls.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {showCamera && <CameraCapture onCapture={(base64) => { setShowCamera(false); setImagePreview(base64); }} onClose={() => setShowCamera(false)} />}
            {showMsgInfo && <MessageInfo messageId={showMsgInfo} onClose={() => setShowMsgInfo(null)} />}
            {showGroupInfo && <GroupInfo groupId={selectedGroup?._id} onClose={() => setShowGroupInfo(false)} />}

            {contextMenu && (
                <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 1000, background: 'var(--bg-panel)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', overflow: 'hidden', padding: '8px 0', minWidth: 160 }}>
                    <button onClick={() => setShowMsgInfo(contextMenu.msg._id)} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', fontSize: 14 }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>Message info</button>
                    {(contextMenu.msg.senderId === authUser?._id || contextMenu.msg.senderId?._id === authUser?._id) && (
                        <button onClick={() => setShowDeleteModal(true)} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: '#ef4444', textAlign: 'left', cursor: 'pointer', fontSize: 14 }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>Delete message</button>
                    )}
                </div>
            )}

            <ImagePreviewOverlay imagePreview={imagePreview} onCancel={() => setImagePreview(null)} onConfirm={confirmSendImage} />

            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%', background: 'var(--bg-chat)', position: 'relative' }}>
                {isSelectionMode ? (
                    <div style={{ background: 'var(--bg-header)', height: 60, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 24, borderBottom: '1px solid var(--border-color)', color: '#fff' }}>
                        <button onClick={() => setSelectedMessages([])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>✕</button>
                        <span style={{ fontSize: 18, fontWeight: 500 }}>{selectedMessages.length} selected</span>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
                            <button onClick={() => setShowDeleteModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    <ChatHeader 
                        activeChat={activeChat} isGroup={isGroup} onlineUsers={onlineUsers}
                        formatLastSeen={formatLastSeen} users={users} setSelectedUser={setSelectedUser}
                        setSelectedGroup={setSelectedGroup} setShowGroupInfo={setShowGroupInfo}
                        startCall={startCall} selectedUser={selectedUser}
                    />
                )}

                <div className="hover-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px 7%', display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>
                    <div className="chat-bg" style={{ position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none' }} />
                    {Array.isArray(messages) && messages.map((msg, i) => {
                        if (!msg) return null;
                        const isMine = (msg.senderId === authUser?._id) || (msg.senderId?._id === authUser?._id);
                        const prevMsg = i > 0 ? messages[i-1] : null;
                        const isFirstInSequence = !prevMsg || (prevMsg.senderId !== msg.senderId && prevMsg.senderId?._id !== msg.senderId && prevMsg.senderId !== msg.senderId?._id);
                        const senderUser = isGroup && !isMine ? (selectedGroup?.members || []).find(m => m.userId?._id === msg.senderId || m.userId === msg.senderId)?.userId : null;

                        return (
                            <MessageItem 
                                key={msg._id || i} msg={msg} i={i} isMine={isMine} isGroup={isGroup} senderUser={senderUser}
                                isFirstInSequence={isFirstInSequence}
                                selectedMessages={selectedMessages} isSelectionMode={isSelectionMode}
                                handleTouchStart={(m) => { if (!isSelectionMode) setTimeout(() => setSelectedMessages(prev => [...prev, m._id]), 500); }}
                                handleTouchEnd={() => {}} handleMessageClick={(e, m) => { if (isSelectionMode) { e.preventDefault(); setSelectedMessages(prev => prev.includes(m._id) ? prev.filter(id => id !== m._id) : [...prev, m._id]); } }}
                                handleRightClick={(e, m) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, msg: m }); }}
                                formatTime={(d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                setViewVotesMessage={setViewVotesMessage} handleVotePoll={handleVotePoll}
                                authUser={authUser} users={users} activeChat={activeChat}
                            />
                        );
                    })}
                    <div ref={scrollEnd} />
                </div>

                <ChatInput 
                    showEmojiPicker={showEmojiPicker} setShowEmojiPicker={setShowEmojiPicker}
                    input={input} setInput={setInput} handleSendText={handleSendText}
                    handleSendDocument={handleSendDocument} handleSendImage={handleSendImage}
                    setShowCamera={setShowCamera} setShowPollModal={setShowPollModal}
                    isRecording={isRecording} cancelRecording={cancelRecording}
                    recordingTime={recordingTime} formatDuration={formatDuration}
                    visualizerData={visualizerData} stopAndSendRecording={stopAndSendRecording}
                    startRecording={startRecording}
                />
            </div>

            {showPollModal && <PollModal onClose={() => setShowPollModal(false)} onCreate={handleCreatePoll} />}
            {showDeleteModal && <DeleteModal selectedMessages={selectedMessages} messages={messages} authUser={authUser} onDelete={handleDeleteMessages} onClose={() => setShowDeleteModal(false)} />}
            {viewVotesMessage && <PollDetailsModal message={viewVotesMessage} authUser={authUser} users={users} onClose={() => setViewVotesMessage(null)} />}
        </>
    );
};

export default ChatContainer;
