import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContextInstance';
import { InitialsAvatar } from '../ui/InitialsAvatar';
import toast from 'react-hot-toast';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const GroupInfo = ({ group, onClose }) => {
    const { axios, authUser } = useContext(AuthContext);
    const { setSelectedGroup, getGroups } = useContext(ChatContext);
    const [loading, setLoading] = useState(false);

    const isAdmin = group.members.some(m => m.userId?._id === authUser._id && m.role === 'admin');

    const handleUpdateRole = async (targetUserId, newRole) => {
        try {
            const { data } = await axios.put(`/api/groups/${group._id}/update-role`, { userId: targetUserId, role: newRole });
            if (data.success) {
                toast.success(`Updated role to ${newRole}`);
                getGroups(); // Refresh groups
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to update role");
        }
    };

    const handleRemoveMember = async (targetUserId) => {
        if (!window.confirm("Remove this member?")) return;
        try {
            const { data } = await axios.put(`/api/groups/${group._id}/remove-member`, { userId: targetUserId });
            if (data.success) {
                toast.success("Member removed");
                getGroups();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to remove member");
        }
    };

    const handleDeleteGroup = async () => {
        if (!window.confirm("Permanently delete this group? All messages will be lost.")) return;
        setLoading(true);
        try {
            const { data } = await axios.delete(`/api/groups/${group._id}`);
            if (data.success) {
                toast.success("Group deleted");
                setSelectedGroup(null);
                getGroups();
                onClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to delete group");
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveGroup = async () => {
        if (!window.confirm("Leave this group?")) return;
        try {
            const { data } = await axios.put(`/api/groups/${group._id}/leave`);
            if (data.success) {
                toast.success("Left group");
                setSelectedGroup(null);
                getGroups();
                onClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to leave group");
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
            <div style={{
                background: 'var(--bg-primary)', borderRadius: 16, width: 420, maxHeight: '85vh',
                display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ background: 'var(--bg-header)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 18 }}>Group Info</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                </div>

                <div className="hover-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        {group.avatar
                            ? <img src={group.avatar} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', border: '4px solid var(--border-color)' }} />
                            : <div style={{ margin: '0 auto 12px' }}><InitialsAvatar name={group.name} size={120} /></div>
                        }
                        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 24 }}>{group.name}</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>{group.description || 'No description'}</p>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <h4 style={{ color: 'var(--app-accent)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Members · {group.members.length}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {group.members.map((m) => {
                                const user = m.userId;
                                const isMe = user?._id === authUser._id;
                                return (
                                    <div key={user?._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {user?.profilePic
                                            ? <img src={user.profilePic} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                                            : <InitialsAvatar name={user?.fullName || 'User'} size={44} />
                                        }
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: 15, color: 'var(--text-primary)', fontWeight: 500 }}>
                                                {user?.fullName}{isMe && ' (You)'}
                                            </p>
                                            <p style={{ margin: 0, fontSize: 12, color: m.role === 'admin' ? 'var(--app-accent)' : 'var(--text-secondary)' }}>
                                                {m.role === 'admin' ? 'Group Admin' : 'Member'}
                                            </p>
                                        </div>

                                        {isAdmin && !isMe && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)' }}>
                                                    <DropdownMenuItem onClick={() => handleUpdateRole(user._id, m.role === 'admin' ? 'member' : 'admin')}>
                                                        {m.role === 'admin' ? 'Dismiss as Admin' : 'Make Group Admin'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRemoveMember(user._id)} style={{ color: 'var(--danger)' }}>
                                                        Remove Member
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 32 }}>
                        <button 
                            onClick={handleLeaveGroup}
                            style={{ 
                                width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--danger)', 
                                color: 'var(--danger)', background: 'none', cursor: 'pointer', fontWeight: 500,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
                            Leave Group
                        </button>
                        
                        {isAdmin && (
                            <button 
                                onClick={handleDeleteGroup}
                                disabled={loading}
                                style={{ 
                                    width: '100%', padding: '12px', borderRadius: 8, border: 'none', 
                                    background: 'var(--danger)', color: '#fff', cursor: 'pointer', fontWeight: 500,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    opacity: loading ? 0.6 : 1
                                }}
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                Delete Group
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupInfo;
