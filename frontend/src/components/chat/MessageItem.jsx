import React from 'react';
import MessageTick from './MessageTick';
import VoicePlay from './VoicePlay';

const MessageItem = ({
    msg,
    i,
    isMine,
    isGroup,
    senderUser,
    isFirstInSequence,
    selectedMessages,
    isSelectionMode,
    handleTouchStart,
    handleTouchEnd,
    handleMessageClick,
    handleRightClick,
    formatTime,
    setViewVotesMessage,
    handleVotePoll,
    authUser,
    users,
    activeChat
}) => {
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
                padding: '1px 5%', margin: '0 -5%',
                transition: 'background 0.2s', cursor: isSelectionMode ? 'pointer' : 'default'
            }}>
            <div
                onContextMenu={(e) => {
                    if (isSelectionMode) { e.preventDefault(); return; }
                    handleRightClick(e, msg);
                }}
                className={isMine ? 'msg-sent' : 'msg-recv'}
                style={{
                    display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start',
                    marginBottom: isFirstInSequence ? 4 : 2,
                    marginTop: isFirstInSequence ? 8 : 0
                }}
            >
                <div style={{
                    maxWidth: '65%', minWidth: 60,
                    background: isMine ? 'var(--bg-bubble-sent)' : 'var(--bg-bubble-recv)',
                    borderRadius: isMine 
                        ? (isFirstInSequence ? '8px 0px 8px 8px' : '8px 8px 8px 8px') 
                        : (isFirstInSequence ? '0px 8px 8px 8px' : '8px 8px 8px 8px'),
                    padding: msg.image ? 4 : (msg.messageType === 'poll' ? '8px 10px 4px' : '6px 10px'),
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    position: 'relative'
                }}>
                    {isFirstInSequence && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            [isMine ? 'right' : 'left']: -8,
                            width: 8,
                            height: 12,
                            background: isMine ? 'var(--bg-bubble-sent)' : 'var(--bg-bubble-recv)',
                            clipPath: isMine 
                                ? 'polygon(0 0, 0 100%, 100% 0)' 
                                : 'polygon(0 0, 100% 100%, 100% 0)',
                        }} />
                    )}
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
                    ) : msg.messageType === 'audio' ? (
                        <div style={{ padding: '2px 4px' }}>
                            <VoicePlay 
                                audioUrl={msg.audio} 
                                waveform={msg.waveform} 
                                isMine={isMine} 
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, padding: '0 6px 2px' }}>
                                <span style={{ fontSize: 10, color: isMine ? 'rgba(233,237,239,0.6)' : 'var(--text-secondary)' }}>{formatTime(msg.createdAt)}</span>
                                {isMine && <MessageTick status={msg.status || 'sent'} />}
                            </div>
                        </div>
                    ) : msg.messageType === 'document' ? (
                        <div style={{ width: 240 }}>
                            <a download={msg.document?.name} href={msg.document?.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, textDecoration: 'none' }}>
                                <div style={{ background: 'var(--app-accent)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
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
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                <span>Select one</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {Array.isArray(msg.poll?.options) && msg.poll.options.map((opt, idx) => {
                                    const hasVoted = opt.votes?.includes(authUser?._id);
                                    const totalVotes = (msg.poll?.options || []).reduce((acc, o) => acc + (o.votes?.length || 0), 0) || 0;
                                    const percent = totalVotes > 0 ? Math.round(((opt.votes?.length || 0) / totalVotes) * 100) : 0;

                                    const lastVoterId = (opt.votes && opt.votes.length > 0) ? opt.votes[opt.votes.length - 1] : null;
                                    let lastVoterAvatar = null;
                                    let lastVoterName = 'U';
                                    if (lastVoterId) {
                                        if (lastVoterId === authUser?._id) {
                                            lastVoterAvatar = authUser?.profilePic;
                                            lastVoterName = authUser?.fullName || 'U';
                                        }
                                        else {
                                            const voterUser = (Array.isArray(users) ? users.find(u => u._id === lastVoterId) : null) || (activeChat?._id === lastVoterId ? activeChat : null);
                                            lastVoterAvatar = voterUser?.profilePic || voterUser?.avatar;
                                            lastVoterName = voterUser?.fullName || 'U';
                                        }
                                    }

                                    return (
                                        <div key={idx} onClick={(e) => {
                                            if (isSelectionMode) return;
                                            e.stopPropagation();
                                            handleVotePoll(msg._id, idx);
                                        }} style={{ cursor: 'pointer' }}>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    {hasVoted ? (
                                                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="#111"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
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
                                                            {lastVoterName[0]}
                                                        </div>
                                                    ) : null}
                                                    <span style={{ fontSize: 13, color: '#e9edef' }}>{opt.votes?.length || 0}</span>
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
                            <div onClick={(e) => { e.stopPropagation(); setViewVotesMessage(msg); }} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 8, paddingTop: 10, textAlign: 'center', cursor: 'pointer', color: '#25D366', fontSize: 14, fontWeight: 500 }}>
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
};

export default MessageItem;
