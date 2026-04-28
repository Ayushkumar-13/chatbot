import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const SidebarHeader = ({
    isNewChat,
    setIsNewChat,
    authUser,
    navigate,
    setShowCreateGroup,
    logout
}) => {
    return (
        <div style={{ 
            background: 'var(--bg-header)', 
            padding: isNewChat ? '16px 20px' : '10px 16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            minHeight: 59,
            transition: 'all 0.2s',
            flexShrink: 0
        }}>
            {isNewChat ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <button 
                        onClick={() => setIsNewChat(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 0 }}
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
                    </button>
                    <span style={{ fontSize: 19, fontWeight: 500, color: 'var(--text-primary)' }}>New Chat</span>
                </div>
            ) : (
                <>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button 
                            onClick={() => setIsNewChat(true)}
                            title="New chat" 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 8, borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                        </button>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button 
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 8, borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" side="bottom" sideOffset={10} style={{ background: 'var(--bg-panel)', border: 'none', borderRadius: 8, padding: '8px 0', minWidth: 160, boxShadow: '0 4px 12px rgba(0,0,0,0.4)', zIndex: 100 }}>
                                <DropdownMenuItem onClick={() => setShowCreateGroup(true)} style={{ color: 'var(--text-primary)', cursor: 'pointer', padding: '10px 16px' }}>New group</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/profile')} style={{ color: 'var(--text-primary)', cursor: 'pointer', padding: '10px 16px' }}>Settings</DropdownMenuItem>
                                <DropdownMenuSeparator style={{ background: 'var(--border-color)' }} />
                                <DropdownMenuItem onClick={logout} style={{ color: '#ef4444', cursor: 'pointer', padding: '10px 16px' }}>Log out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </>
            )}
        </div>
    );
};

export default SidebarHeader;
