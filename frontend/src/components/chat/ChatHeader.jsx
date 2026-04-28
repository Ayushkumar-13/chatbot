import React, { useContext } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InitialsAvatar } from '../ui/InitialsAvatar';
import { ChatContext } from '../../context/ChatContextInstance';
import toast from 'react-hot-toast';

const ChatHeader = ({ 
    activeChat, 
    isGroup, 
    onlineUsers, 
    formatLastSeen, 
    users, 
    setSelectedUser, 
    setSelectedGroup, 
    setShowGroupInfo,
    startCall,
    selectedUser
}) => {
    const { setShowRightSidebar, showRightSidebar } = useContext(ChatContext);

    return (
        <div style={{
            background: 'var(--bg-header)', padding: '8px 16px', display: 'flex',
            alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border-color)',
            flexShrink: 0
        }}>
            <button
                onClick={() => { setSelectedUser(null); setSelectedGroup(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}
                className="md:hidden flex items-center justify-center mr-2"
            >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
            </button>

            <div 
                onClick={() => setShowRightSidebar(!showRightSidebar)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: 'pointer' }}
            >
                {activeChat?.profilePic || activeChat?.avatar
                    ? <img src={activeChat.profilePic || activeChat.avatar} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                    : <InitialsAvatar name={activeChat?.fullName || activeChat?.name} size={40} />
                }

                <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 500, fontSize: 15, color: 'var(--text-primary)' }}>
                        {activeChat?.fullName || activeChat?.name || 'Unknown'}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                        {isGroup
                            ? `${activeChat?.members?.length || 0} members`
                            : (activeChat?._id && onlineUsers?.includes(activeChat._id) ? 'online' : formatLastSeen(
                                (activeChat?._id ? (users?.find(u => u._id === activeChat._id) || activeChat) : activeChat)?.lastSeen
                            ))
                        }
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => {
                                console.log("Audio call clicked", { isGroup, selectedUser, activeChat });
                                if (isGroup) {
                                    const members = activeChat?.members?.map(m => m.userId).filter(u => u?._id !== undefined) || [];
                                    startCall(members, 'audio');
                                } else {
                                    startCall(selectedUser || activeChat, 'audio');
                                }
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 8, borderRadius: '50%', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" /></svg>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Voice call</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => {
                                console.log("Video call clicked", { isGroup, selectedUser, activeChat });
                                if (isGroup) {
                                    const members = activeChat?.members?.map(m => m.userId).filter(u => u?._id !== undefined) || [];
                                    startCall(members, 'video');
                                } else {
                                    startCall(selectedUser || activeChat, 'video');
                                }
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 8, borderRadius: '50%', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" /></svg>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Video call</TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
};

export default ChatHeader;
