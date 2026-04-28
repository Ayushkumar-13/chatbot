import React from 'react';

class ChatErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('=== ChatContainer Crash ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        console.error('Component Stack:', errorInfo.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', background: '#111b21', padding: 24, gap: 16
                }}>
                    <div style={{
                        background: '#202c33', borderRadius: 12, padding: 24,
                        maxWidth: 600, width: '100%', border: '1px solid #2a3942'
                    }}>
                        <h3 style={{ color: '#ef4444', margin: '0 0 12px', fontSize: 16 }}>
                            ⚠️ Chat Error (see console for details)
                        </h3>
                        <p style={{ color: '#e9edef', fontSize: 14, margin: '0 0 8px' }}>
                            <b>Error:</b> {this.state.error?.message}
                        </p>
                        <pre style={{
                            color: '#8696a0', fontSize: 11, overflow: 'auto',
                            maxHeight: 200, background: '#0b141a', padding: 12,
                            borderRadius: 6, margin: '8px 0 16px', whiteSpace: 'pre-wrap'
                        }}>
                            {this.state.errorInfo?.componentStack}
                        </pre>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                            style={{
                                background: '#00a884', color: '#fff', border: 'none',
                                borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ChatErrorBoundary;
