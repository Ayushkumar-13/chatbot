import React, { useEffect, useRef, useState } from 'react';

const ResizablePanel = ({ 
    leftPanel, 
    rightPanel, 
    initialWidth = 340, 
    minWidth = 220, 
    maxWidthPercent = 0.5,
    hideLeftOnMobile = false
}) => {
    const [sidebarWidth, setSidebarWidth] = useState(initialWidth);
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
            const maxSidebarWidth = window.innerWidth * maxWidthPercent;
            const next = Math.min(Math.max(startWidth.current + diff, minWidth), maxSidebarWidth);
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
    }, [maxWidthPercent, minWidth]);

    return (
        <div style={{
            width: '100vw', height: '100vh',
            display: 'flex', background: '#0b141a', overflow: 'hidden'
        }}>
            {/* ── Left Panel (resizable) ───────────────────────────────── */}
            <div 
                className={`panel-left ${hideLeftOnMobile ? 'hidden-on-mobile' : ''}`}
                style={{ 
                    width: sidebarWidth, 
                    flexShrink: 0, 
                    height: '100%', 
                    overflow: 'hidden',
                }}
            >
                {leftPanel}
            </div>

            {/* ── Drag Handle (desktop only) ─────────────────────────── */}
            <div
                onMouseDown={onDividerMouseDown}
                title="Drag to resize"
                className="divider-handle"
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

            {/* ── Right Panel (fills remaining space) ──────────────────── */}
            <div 
                className={`panel-right ${hideLeftOnMobile ? 'visible-on-mobile' : ''}`}
                style={{ 
                    flex: 1, 
                    height: '100%', 
                    overflow: 'hidden',
                }}
            >
                {rightPanel}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .panel-left.hidden-on-mobile {
                        display: none !important;
                    }
                    .panel-right {
                        display: none !important;
                    }
                    .panel-right.visible-on-mobile {
                        display: flex !important;
                    }
                    .divider-handle {
                        display: none !important;
                    }
                    .panel-left {
                        width: 100% !important;
                    }
                }
                @media (min-width: 769px) {
                    .panel-left {
                        display: block !important;
                    }
                    .panel-right {
                        display: flex !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ResizablePanel;
