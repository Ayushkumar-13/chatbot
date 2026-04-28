import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContextInstance';
import { useNavigate } from 'react-router-dom';
import CreateGroup from '../chat/CreateGroup';

// New Modular Components
import { InitialsAvatar } from '../ui/InitialsAvatar';
import SidebarHeader from './SidebarHeader';
import SidebarItem from './SidebarItem';

const Sidebar = () => {
    const {
        getUsers, users, getGroups, groups, createGroup,
        selectedUser, setSelectedUser, selectedGroup, setSelectedGroup,
        unseenMessages, setUnseenMessages, lastMessages
    } = useContext(ChatContext);
    const { logout, onlineUsers, authUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [tab, setTab] = useState('chats'); // 'chats' | 'groups' | 'calls'
    const [search, setSearch] = useState('');
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [isNewChat, setIsNewChat] = useState(false); 

    useEffect(() => { getUsers(); getGroups(); }, [onlineUsers]);

    const activeChatsUsers = users.filter(u => lastMessages[u._id]);
    const baseUserList = isNewChat ? users : activeChatsUsers;

    const filteredUsers = search
        ? baseUserList.filter(u => u.fullName.toLowerCase().includes(search.toLowerCase()))
        : baseUserList.sort((a, b) => new Date(lastMessages[b._id]?.createdAt || 0) - new Date(lastMessages[a._id]?.createdAt || 0));

    const filteredGroups = search
        ? groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
        : groups;

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;
        if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    };

    const formatLastSeen = (dateStr) => {
        if (!dateStr) return 'Offline';
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

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setSelectedGroup(null);
        setUnseenMessages(prev => ({ ...prev, [user._id]: 0 }));
        setIsNewChat(false); 
        setSearch('');
    };

    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
        setSelectedUser(null);
        setUnseenMessages(prev => ({ ...prev, [`group_${group._id}`]: 0 }));
    };

    return (
        <>
            <div style={{
                background: 'var(--bg-primary)', height: '100%', display: 'flex',
                flexDirection: 'column', borderRight: '1px solid var(--border-color)',
                overflow: 'hidden'
            }}>
                <SidebarHeader 
                    isNewChat={isNewChat}
                    setIsNewChat={setIsNewChat}
                    authUser={authUser}
                    navigate={navigate}
                    setShowCreateGroup={setShowCreateGroup}
                    logout={logout}
                />

                {/* ── Search ──────────────────────────────────────────────── */}
                <div style={{ padding: '8px 12px', background: 'var(--bg-primary)', flexShrink: 0 }}>
                    <div style={{
                        background: 'var(--bg-input)', borderRadius: 8, display: 'flex',
                        alignItems: 'center', gap: 8, padding: '6px 12px'
                    }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-secondary)">
                            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={isNewChat ? "Search users..." : "Search or start new chat"}
                            style={{ flex: 1, fontSize: 14, background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none' }}
                        />
                    </div>
                </div>

                {/* ── Tabs (Hidden in New Chat mode) ────────────────────── */}
                {!isNewChat && (
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)', flexShrink: 0 }}>
                        {[
                            { id: 'chats', label: 'Chats' },
                            { id: 'groups', label: 'Groups' },
                            { id: 'calls', label: 'Calls' },
                        ].map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)} style={{
                                flex: 1, padding: '10px 0', background: 'none', border: 'none',
                                cursor: 'pointer', color: tab === t.id ? 'var(--app-accent)' : 'var(--text-secondary)',
                                fontSize: 13, fontWeight: 600, letterSpacing: 0.3,
                                borderBottom: tab === t.id ? '2px solid var(--app-accent)' : '2px solid transparent',
                                transition: 'all 0.2s'
                            }}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── List ────────────────────────────────────────────────── */}
                <div className="hover-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>

                    {/* Chats Tab / New Chat List */}
                    {(tab === 'chats' || isNewChat) && (
                        <>
                            {!isNewChat && filteredUsers.length === 0 && !search && (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)', fontSize: 14 }}>
                                    <p>No active chats</p>
                                    <p style={{ fontSize: 12, marginTop: 4 }}>Click the + icon to start messaging</p>
                                </div>
                            )}
                            {filteredUsers.map(user => {
                                const lastMsg = lastMessages[user._id];
                                const unseen = unseenMessages[user._id] || 0;
                                const isOnline = onlineUsers.includes(user._id);
                                const isSelected = selectedUser?._id === user._id;
                                const subtitle = isNewChat 
                                    ? (isOnline ? 'Online' : 'Global User')
                                    : lastMsg 
                                        ? (lastMsg.image ? '📷 Photo' : lastMsg.text) 
                                        : (isOnline ? 'Online' : formatLastSeen(user.lastSeen));

                                return (
                                    <SidebarItem 
                                        key={user._id}
                                        id={user._id}
                                        onClick={() => handleSelectUser(user)}
                                        isSelected={isSelected}
                                        avatar={user.profilePic}
                                        name={user.fullName}
                                        isOnline={isOnline}
                                        lastMsg={lastMsg}
                                        unseen={unseen}
                                        formatTime={formatTime}
                                        subtitle={subtitle}
                                        isNewChat={isNewChat}
                                    />
                                );
                            })}
                        </>
                    )}

                    {/* Groups Tab */}
                    {tab === 'groups' && !isNewChat && (
                        <>
                            {filteredGroups.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: 14 }}>
                                    No groups yet.<br />
                                    <span onClick={() => setShowCreateGroup(true)} style={{ color: 'var(--app-accent)', cursor: 'pointer' }}>Create a group</span>
                                </div>
                            )}
                            {filteredGroups.map(group => {
                                const unseen = unseenMessages[`group_${group._id}`] || 0;
                                const isSelected = selectedGroup?._id === group._id;
                                const memberCount = group.members?.length || 0;
                                return (
                                    <SidebarItem 
                                        key={group._id}
                                        id={group._id}
                                        onClick={() => handleSelectGroup(group)}
                                        isSelected={isSelected}
                                        avatar={group.avatar}
                                        name={group.name}
                                        isOnline={false}
                                        lastMsg={null}
                                        unseen={unseen}
                                        formatTime={formatTime}
                                        subtitle={`${memberCount} member${memberCount !== 1 ? 's' : ''}`}
                                        isNewChat={false}
                                    />
                                );
                            })}
                        </>
                    )}

                    {/* Calls Tab */}
                    {tab === 'calls' && !isNewChat && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--text-muted)" style={{ marginBottom: 12 }}>
                                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                            </svg>
                            <p style={{ fontSize: 16, margin: 0 }}>No recent calls</p>
                        </div>
                    )}
                </div>
            </div>

            {showCreateGroup && <CreateGroup onClose={() => setShowCreateGroup(false)} />}
        </>
    );
};

export default Sidebar;
