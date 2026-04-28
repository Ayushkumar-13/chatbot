import React from 'react';
import EmojiPicker from 'emoji-picker-react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const ChatInput = ({
    showEmojiPicker,
    setShowEmojiPicker,
    input,
    setInput,
    handleSendText,
    handleSendDocument,
    handleSendImage,
    setShowCamera,
    setShowPollModal,
    isRecording,
    cancelRecording,
    recordingTime,
    formatDuration,
    visualizerData,
    stopAndSendRecording,
    startRecording
}) => {
    return (
        <div style={{
            background: 'var(--bg-panel)', padding: '8px 12px',
            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, position: 'relative'
        }}>
            {showEmojiPicker && (
                <div style={{ position: 'absolute', bottom: '60px', left: '12px', zIndex: 50 }}>
                    <EmojiPicker theme="dark" onEmojiClick={(e) => setInput(prev => prev + e.emoji)} />
                </div>
            )}
            
            <form onSubmit={handleSendText} style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-input)', borderRadius: 24, padding: '4px 16px', gap: 6 }}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button type="button" title="Attach" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top" sideOffset={10} style={{ background: 'var(--bg-panel)', border: 'none', borderRadius: 16, padding: '12px 8px', minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 100 }}>
                        <DropdownMenuItem asChild style={{ cursor: 'pointer', padding: '10px 12px', gap: 12, borderRadius: 8 }}>
                            <label style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12, margin: 0 }}>
                                <div style={{ background: '#7f66ff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                                </div>
                                <span style={{ fontSize: 16, color: 'var(--text-primary)' }}>Document</span>
                                <input type="file" hidden onChange={e => { if (e.target.files[0]) handleSendDocument(e.target.files[0]); e.target.value = ''; }} />
                            </label>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild style={{ cursor: 'pointer', padding: '10px 12px', gap: 12, borderRadius: 8 }}>
                            <label style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12, margin: 0 }}>
                                <div style={{ background: '#007bfc', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>
                                </div>
                                <span style={{ fontSize: 16, color: 'var(--text-primary)' }}>Photos & videos</span>
                                <input type="file" accept="image/*,video/*" hidden onChange={e => { if (e.target.files[0]) handleSendImage(e.target.files[0]); e.target.value = ''; }} />
                            </label>
                        </DropdownMenuItem>

                        <DropdownMenuItem onSelect={() => setShowCamera(true)} style={{ cursor: 'pointer', padding: '10px 12px', gap: 12, borderRadius: 8 }}>
                            <div style={{ background: '#ff2e74', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" /><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" /></svg>
                            </div>
                            <span style={{ fontSize: 16, color: 'var(--text-primary)' }}>Camera</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onSelect={() => setShowPollModal(true)} style={{ cursor: 'pointer', padding: '10px 12px', gap: 12, borderRadius: 8 }}>
                            <div style={{ background: '#ffbc38', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14h-2V7h2v10zm-4 0h-2v-4h2v4zm-4 0H7v-7h2v7z" /></svg>
                            </div>
                            <span style={{ fontSize: 16, color: 'var(--text-primary)' }}>Poll</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {isRecording ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button type="button" onClick={cancelRecording} style={{ background: 'none', border: 'none', color: '#ff2e74', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h1V4h-5zm2 15H7V6h10v13zM9 8h2v9H9zm4 0h2v9h-2z" /></svg>
                            </button>
                            <span style={{ color: 'var(--text-primary)', fontSize: 13, minWidth: 35, fontWeight: 500 }}>{formatDuration(recordingTime)}</span>
                        </div>

                        <div style={{ flex: 1, height: 35, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, margin: '0 16px', overflow: 'hidden' }}>
                            {visualizerData.map((v, i) => (
                                <div key={i} style={{
                                    width: 3,
                                    height: `${Math.max(5, v * 100)}%`,
                                    background: '#25D366',
                                    borderRadius: 2,
                                    transition: 'height 0.1s ease-out'
                                }} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button type="button" onClick={stopAndSendRecording} style={{ background: '#25D366', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                                Send
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <button type="button" title="Emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                            </svg>
                        </button>

                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onFocus={() => setShowEmojiPicker(false)}
                            placeholder="Type a message"
                            style={{ flex: 1, fontSize: 16, background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', padding: '8px 4px' }}
                        />

                        {input.trim() ? (
                            <button type="submit" title="Send" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        ) : (
                            <button type="button" title="Voice message" onClick={startRecording} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                </svg>
                            </button>
                        )}
                    </>
                )}
            </form>
        </div>
    );
};

export default ChatInput;
