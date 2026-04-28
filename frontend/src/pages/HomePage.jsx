import React, { useContext } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import ChatContainer from '../components/chat/ChatContainer';
import RightSidebar from '../components/sidebar/RightSidebar';
import ChatErrorBoundary from '../components/chat/ChatErrorBoundary';
import ResizablePanel from '../components/layout/ResizablePanel';
import { ChatContext } from '../context/ChatContextInstance';

const HomePage = () => {
    const { selectedUser, selectedGroup, showRightSidebar } = useContext(ChatContext);
    const hasSelection = !!(selectedUser || selectedGroup);

    return (
        <ResizablePanel
            hideLeftOnMobile={hasSelection}
            leftPanel={<Sidebar />}
            rightPanel={
                <div style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden' }}>
                    <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
                        <ChatErrorBoundary>
                            <ChatContainer />
                        </ChatErrorBoundary>
                    </div>

                    {/* Right info panel (desktop only) */}
                    {hasSelection && showRightSidebar && (
                        <div className="max-lg:hidden" style={{ display: 'flex' }}>
                            {/* Subtle divider */}
                            <div style={{ width: 1, background: '#233138', flexShrink: 0 }} />
                            <div style={{ width: 320, flexShrink: 0, height: '100%', overflow: 'hidden' }}>
                                <RightSidebar />
                            </div>
                        </div>
                    )}
                </div>
            }
        />
    );
};

export default HomePage;
