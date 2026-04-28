import React, { useState } from 'react';
import toast from 'react-hot-toast';

const PollModal = ({ onClose, onCreate }) => {
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState(["", ""]);

    const handleCreatePoll = () => {
        const validOptions = pollOptions.filter(o => o.trim());
        if (!pollQuestion.trim() || validOptions.length < 2) {
            return toast.error("Question and at least 2 options required");
        }
        onCreate(pollQuestion.trim(), validOptions);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg-panel)', width: 320, padding: 24, borderRadius: 12 }}>
                <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)' }}>Create Poll</h3>
                <input 
                    value={pollQuestion} 
                    onChange={e => setPollQuestion(e.target.value)} 
                    placeholder="Ask a question..." 
                    style={{ width: '100%', padding: '10px', marginBottom: 12, borderRadius: 6, border: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)' }} 
                />
                {pollOptions.map((opt, i) => (
                    <input 
                        key={i} 
                        value={opt} 
                        onChange={e => {
                            const newOpts = [...pollOptions];
                            newOpts[i] = e.target.value;
                            setPollOptions(newOpts);
                        }} 
                        placeholder={`Option ${i + 1}`} 
                        style={{ width: '100%', padding: '8px', marginBottom: 8, borderRadius: 6, border: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)' }} 
                    />
                ))}
                <button 
                    onClick={() => setPollOptions([...pollOptions, ''])} 
                    style={{ background: 'none', border: 'none', color: 'var(--app-accent)', cursor: 'pointer', padding: '8px 0', fontSize: 14 }}
                >
                    + Add Option
                </button>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px 16px' }}>Cancel</button>
                    <button onClick={handleCreatePoll} style={{ background: 'var(--app-accent)', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px 16px', borderRadius: 20 }}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default PollModal;
