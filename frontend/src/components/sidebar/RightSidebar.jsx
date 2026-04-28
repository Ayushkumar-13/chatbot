import React, { useContext, useEffect, useState } from 'react';
import { ChatContext } from '../../context/ChatContextInstance';
import { AuthContext } from '../../context/AuthContext';
import { CallContext } from '../../context/CallContext';
import { InitialsAvatar } from '../ui/InitialsAvatar';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';

const RightSidebar = () => {
    const { setSelectedGroup, getGroups, selectedUser, selectedGroup, messages } = useContext(ChatContext);
    const { onlineUsers, authUser, axios } = useContext(AuthContext);
    const { startCall } = useContext(CallContext);

    const [mediaImages, setMediaImages] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMediaImages(messages.filter(m => m.image).map(m => m.image));
    }, [messages]);

    const active = selectedUser || selectedGroup;
    const isGroup = !!selectedGroup;

    if (!active) return null;

    const isOnline = !isGroup && onlineUsers.includes(selectedUser._id);
    const name = active.fullName || active.name;
    const avatar = active.profilePic || active.avatar;

    return (
        <div style={{
            background: 'var(--bg-primary)', height: '100%', display: 'flex', flexDirection: 'column',
            borderLeft: '1px solid var(--border-color)', overflow: 'hidden'
        }} className="max-md:hidden">
            {/* ── Profile Section ───────────────────────────────────── */}
            <div style={{ background: 'var(--bg-secondary)', padding: '40px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                {avatar
                    ? <img src={avatar} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                    : <InitialsAvatar name={name} size={88} />
                }
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>{name}</h2>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: isOnline ? 'var(--app-accent)' : 'var(--text-secondary)' }}>
                        {isGroup
                            ? `${active.members?.length || 0} members`
                            : (isOnline ? 'Online' : 'Offline')
                        }
                    </p>
                </div>

                {/* Bio / Description */}
                {(active.bio || active.description) && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', margin: '4px 0 0', lineHeight: 1.5 }}>
                        {active.bio || active.description}
                    </p>
                )}

                {/* Call buttons */}
                <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
                    {[
                        { type: 'audio', icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>, label: 'Audio' },
                        { type: 'video', icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>, label: 'Video' }
                    ].map(({ type, icon, label }) => (
                        <button
                            key={type}
                            onClick={() => isGroup ? toast(`Group ${label} call started`) : startCall(selectedUser, type)}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                background: 'var(--bg-input)', border: 'none', cursor: 'pointer',
                                borderRadius: 12, padding: '12px 20px', color: 'var(--app-accent)',
                                transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-input)'}
                        >
                            {icon}
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                        </button>
                    ))}
                </div>

            </div>

            <div className="hover-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 0 20px' }}>
                {/* Group Members & Actions */}
                {isGroup && active.members && (
                    <div style={{ padding: '0 0 8px' }}>
                        <p style={{ margin: 0, padding: '14px 20px 8px', fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid var(--border-color)' }}>
                            Members
                        </p>
                        {active.members.map((m, i) => {
                            const user = m.userId;
                            if (!user) return null;
                            const isMe = user._id === authUser._id;
                            const isAdmin = active.members.some(am => am.userId?._id === authUser._id && am.role === 'admin');

                            const handleUpdateRole = async (targetId, newRole) => {
                                try {
                                    const { data } = await axios.put(`/api/groups/${active._id}/update-role`, { userId: targetId, role: newRole });
                                    if (data.success) { toast.success(`Role updated to ${newRole}`); getGroups(); }
                                    else toast.error(data.message);
                                } catch (e) { toast.error("Failed to update role"); }
                            };

                            const handleRemove = async (targetId) => {
                                if (!window.confirm("Remove member?")) return;
                                try {
                                    const { data } = await axios.put(`/api/groups/${active._id}/remove-member`, { userId: targetId });
                                    if (data.success) { toast.success("Removed member"); getGroups(); }
                                    else toast.error(data.message);
                                } catch (e) { toast.error("Failed to remove member"); }
                            };

                            return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px' }}>
                                    {user.profilePic
                                        ? <img src={user.profilePic} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                        : <InitialsAvatar name={user.fullName} size={40} />
                                    }
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{user.fullName}{isMe && ' (You)'}</p>
                                        {m.role === 'admin' && <p style={{ margin: 0, fontSize: 11, color: 'var(--app-accent)' }}>Admin</p>}
                                    </div>
                                    {isAdmin && !isMe && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)' }}>
                                                <DropdownMenuItem onClick={() => handleUpdateRole(user._id, m.role === 'admin' ? 'member' : 'admin')}>
                                                    {m.role === 'admin' ? 'Dismiss as Admin' : 'Make Admin'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRemove(user._id)} style={{ color: 'var(--danger)' }}>
                                                    Remove
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            );
                        })}

                        {/* Leave / Delete buttons */}
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <button
                                onClick={async () => {
                                    if (!window.confirm("Leave group?")) return;
                                    try {
                                        const { data } = await axios.put(`/api/groups/${active._id}/leave`);
                                        if (data.success) { toast.success("Left group"); setSelectedGroup(null); getGroups(); }
                                        else toast.error(data.message);
                                    } catch (e) { toast.error("Failed to leave group"); }
                                }}
                                style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--danger)', color: 'var(--danger)', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                            >
                                Leave Group
                            </button>
                            {active.members.find(m => m.userId?._id === authUser._id)?.role === 'admin' && (
                                <button
                                    disabled={loading}
                                    onClick={async () => {
                                        if (!window.confirm("Permanently delete group?")) return;
                                        setLoading(true);
                                        try {
                                            const { data } = await axios.delete(`/api/groups/${active._id}`);
                                            if (data.success) { toast.success("Deleted group"); setSelectedGroup(null); getGroups(); }
                                            else toast.error(data.message);
                                        } catch (e) { toast.error("Failed to delete group"); } finally { setLoading(false); }
                                    }}
                                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: 'var(--danger)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, opacity: loading ? 0.6 : 1 }}
                                >
                                    Delete Group
                                </button>
                            )}
                        </div>
                    </div>
                )}


                {/* Media Gallery */}
                {mediaImages.length > 0 && (
                    <div style={{ padding: '0 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 4px 10px', borderTop: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Media ({mediaImages.length})
                            </span>
                            {mediaImages.length > 6 && (
                                <button onClick={() => setExpanded(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--app-accent)', fontSize: 12 }}>
                                    {expanded ? 'See less' : 'See all'}
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                            {(expanded ? mediaImages : mediaImages.slice(-6)).map((url, i) => (
                                <div key={i} onClick={() => window.open(url)} style={{ aspectRatio: '1', cursor: 'pointer', borderRadius: 6, overflow: 'hidden', background: 'var(--bg-input)' }}>
                                    <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s' }}
                                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                        alt=""
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RightSidebar;
