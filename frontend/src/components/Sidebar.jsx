import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import CreateGroup from './CreateGroup';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


// ── Initials Avatar ───────────────────────────────────────────────────────────
const InitialsAvatar = ({ name = '', size = 40, className = '' }) => {
    const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];
    const color = colors[(name.charCodeAt(0) || 0) % colors.length];
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
        <div className={className} style={{
            width: size, height: size, borderRadius: '50%', background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.38, fontWeight: 600, color: '#fff', flexShrink: 0
        }}>
            {initials}
        </div>
    );
};

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
    const [showMenu, setShowMenu] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => { getUsers(); getGroups(); }, [onlineUsers]);

    // Close menu on outside click
    useEffect(() => {
        const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    const activeChats = users.filter(u => lastMessages[u._id]);

    const filteredUsers = search
        ? users.filter(u => u.fullName.toLowerCase().includes(search.toLowerCase()))
        : activeChats.sort((a, b) => new Date(lastMessages[b._id]?.createdAt || 0) - new Date(lastMessages[a._id]?.createdAt || 0));

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
                {/* ── Header ──────────────────────────────────────────────── */}
                <div style={{ background: 'var(--bg-header)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* User avatar → profile page */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', flexShrink: 0 }}>
                                <Avatar style={{ width: 40, height: 40 }}>
                                    <AvatarImage src={authUser?.profilePic} />
                                    <AvatarFallback style={{ background: '#6366f1', color: '#fff', fontSize: 16, fontWeight: 600 }}>
                                        {authUser?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">View Profile</TooltipContent>
                    </Tooltip>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {/* New group shortcut */}
                        {tab === 'groups' && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setShowCreateGroup(true)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 6, borderRadius: '50%' }}
                                    >
                                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">New Group</TooltipContent>
                            </Tooltip>
                        )}

                        {/* shadcn DropdownMenu — replaces custom dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 6, borderRadius: '50%' }}>
                                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: 8, minWidth: 160 }}>
                                <DropdownMenuItem onClick={() => navigate('/profile')} style={{ color: 'var(--text-primary)', cursor: 'pointer' }}>
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setShowCreateGroup(true); setTab('groups'); }} style={{ color: 'var(--text-primary)', cursor: 'pointer' }}>
                                    New Group
                                </DropdownMenuItem>
                                <DropdownMenuSeparator style={{ background: 'var(--border-color)' }} />
                                <DropdownMenuItem onClick={logout} style={{ color: 'var(--danger)', cursor: 'pointer' }}>
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>


                {/* ── Search ──────────────────────────────────────────────── */}
                <div style={{ padding: '8px 12px', background: 'var(--bg-primary)' }}>
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
                            placeholder="Search or start new chat"
                            style={{ flex: 1, fontSize: 14, background: 'none', border: 'none' }}
                        />
                    </div>
                </div>

                {/* ── Tabs ────────────────────────────────────────────────── */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
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

                {/* ── List ────────────────────────────────────────────────── */}
                <div className="hover-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>

                    {/* Chats Tab */}
                    {tab === 'chats' && filteredUsers.map(user => {
                        const lastMsg = lastMessages[user._id];
                        const unseen = unseenMessages[user._id] || 0;
                        const isOnline = onlineUsers.includes(user._id);
                        const isSelected = selectedUser?._id === user._id;

                        return (
                            <div
                                key={user._id}
                                onClick={() => handleSelectUser(user)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '10px 16px', cursor: 'pointer',
                                    background: isSelected ? 'var(--bg-selected)' : 'transparent',
                                    borderBottom: '1px solid var(--border-color)',
                                    transition: 'background 0.15s'
                                }}
                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    {user.profilePic
                                        ? <img src={user.profilePic} style={{ width: 49, height: 49, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                        : <InitialsAvatar name={user.fullName} size={49} />
                                    }
                                    {isOnline && (
                                        <span style={{
                                            position: 'absolute', bottom: 1, right: 1,
                                            width: 11, height: 11, borderRadius: '50%',
                                            background: 'var(--app-accent)', border: '2px solid var(--bg-primary)'
                                        }} />
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                                        <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user.fullName}
                                        </span>
                                        {lastMsg && (
                                            <span style={{ fontSize: 11, color: unseen > 0 ? 'var(--app-accent)' : 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
                                                {formatTime(lastMsg.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{
                                            fontSize: 13, color: 'var(--text-secondary)', margin: 0,
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%'
                                        }}>
                                            {lastMsg ? (lastMsg.image ? '📷 Photo' : lastMsg.text) : (isOnline ? 'Online' : formatLastSeen(user.lastSeen))}
                                        </p>
                                        {unseen > 0 && (
                                            <span style={{
                                                background: 'var(--app-accent)', color: '#fff', borderRadius: 999,
                                                fontSize: 11, fontWeight: 600, minWidth: 18, height: 18,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px'
                                            }}>
                                                {unseen}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Groups Tab */}
                    {tab === 'groups' && (
                        <>
                            {filteredGroups.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: 14 }}>
                                    No groups yet.<br />
                                    <span
                                        onClick={() => setShowCreateGroup(true)}
                                        style={{ color: 'var(--app-accent)', cursor: 'pointer' }}
                                    >
                                        Create a group
                                    </span>
                                </div>
                            )}
                            {filteredGroups.map(group => {
                                const unseen = unseenMessages[`group_${group._id}`] || 0;
                                const isSelected = selectedGroup?._id === group._id;
                                const memberCount = group.members?.length || 0;
                                return (
                                    <div
                                        key={group._id}
                                        onClick={() => handleSelectGroup(group)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '10px 16px', cursor: 'pointer',
                                            background: isSelected ? 'var(--bg-selected)' : 'transparent',
                                            borderBottom: '1px solid var(--border-color)',
                                            transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <div style={{ flexShrink: 0 }}>
                                            {group.avatar
                                                ? <img src={group.avatar} style={{ width: 49, height: 49, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                                : <InitialsAvatar name={group.name} size={49} />
                                            }
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                                <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--text-primary)' }}>
                                                    {group.name}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                                                    {memberCount} member{memberCount !== 1 ? 's' : ''}
                                                </p>
                                                {unseen > 0 && (
                                                    <span style={{
                                                        background: 'var(--app-accent)', color: '#fff', borderRadius: 999,
                                                        fontSize: 11, fontWeight: 600, minWidth: 18, height: 18,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px'
                                                    }}>
                                                        {unseen}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {/* Calls Tab */}
                    {tab === 'calls' && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--text-muted)" style={{ marginBottom: 12 }}>
                                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                            </svg>
                            <p style={{ fontSize: 14 }}>No recent calls</p>
                            <p style={{ fontSize: 12, marginTop: 4 }}>Start a voice or video call from a chat</p>
                        </div>
                    )}
                </div>
            </div>

            {showCreateGroup && (
                <CreateGroup
                    users={users}
                    onClose={() => setShowCreateGroup(false)}
                    onCreate={async (data) => {
                        await createGroup(data);
                        setShowCreateGroup(false);
                        setTab('groups');
                    }}
                />
            )}
        </>
    );
};

export { InitialsAvatar };
export default Sidebar;
