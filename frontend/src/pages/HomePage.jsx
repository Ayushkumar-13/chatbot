import React, { useContext, useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';
import { ChatContext } from '../context/ChatContext';

const HomePage = () => {
    const { selectedUser, selectedGroup } = useContext(ChatContext);
    const hasSelection = !!(selectedUser || selectedGroup);

    // ── Resizable sidebar ─────────────────────────────────────────────────────
    const [sidebarWidth, setSidebarWidth] = useState(340);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(0);

    const onDividerMouseDown = (e) => {
        e.preventDefault();
        isDragging.current = true;
        startX.current = e.clientX;
        startWidth.current = sidebarWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    };

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isDragging.current) return;
            const diff = e.clientX - startX.current;
            const maxSidebarWidth = window.innerWidth * 0.5;
            const next = Math.min(Math.max(startWidth.current + diff, 220), maxSidebarWidth);
            setSidebarWidth(next);
        };
        const onMouseUp = () => {
            if (!isDragging.current) return;
            isDragging.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    return (
        <div style={{
            width: '100vw', height: '100vh',
            display: 'flex', background: '#0b141a', overflow: 'hidden'
        }}>
            {/* ── Sidebar (resizable) ───────────────────────────────── */}
            <div style={{ width: sidebarWidth, flexShrink: 0, height: '100%', overflow: 'hidden' }}>
                <Sidebar />
            </div>

            {/* ── Drag Handle ───────────────────────────────────────── */}
            <div
                onMouseDown={onDividerMouseDown}
                title="Drag to resize"
                style={{
                    width: 4,
                    flexShrink: 0,
                    cursor: 'col-resize',
                    background: '#233138',
                    position: 'relative',
                    zIndex: 10,
                    transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#00a884'}
                onMouseLeave={e => {
                    if (!isDragging.current) e.currentTarget.style.background = '#233138';
                }}
            />

            {/* ── Chat Area ─────────────────────────────────────────── */}
            <div style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex' }}>
                <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
                    <ChatContainer />
                </div>

                {/* Right info panel */}
                {hasSelection && (
                    <>
                        {/* Subtle divider */}
                        <div style={{ width: 1, background: '#233138', flexShrink: 0 }} />
                        <div style={{ width: 280, flexShrink: 0, height: '100%', overflow: 'hidden' }}>
                            <RightSidebar />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;
