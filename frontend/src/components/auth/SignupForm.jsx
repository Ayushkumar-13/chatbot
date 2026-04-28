import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const SignupForm = ({ onSubmit, loading }) => {
    const [step, setStep] = useState(1);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step === 1) {
            setStep(2);
            return;
        }
        onSubmit({ fullName, email, password, bio });
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {step === 1 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Full Name</label>
                        <Input
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="e.g. John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Email Address</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Password</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>
                </div>
            ) : (
                <div>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>About You (Bio)</label>
                    <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="I am using ChatApp!"
                        rows={3}
                        required
                        style={{
                            width: '100%',
                            background: 'var(--bg-input)',
                            border: '1px solid transparent',
                            borderRadius: 12,
                            padding: '14px 16px',
                            fontSize: 15,
                            color: 'var(--text-primary)',
                            transition: 'all 0.2s ease',
                            outline: 'none',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                            resize: 'none',
                            fontFamily: 'inherit'
                        }}
                        onFocus={e => e.target.style.border = '1px solid var(--app-accent)'}
                        onBlur={e => e.target.style.border = '1px solid transparent'}
                    />
                </div>
            )}

            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        width: '100%', 
                        height: 'auto', 
                        padding: '14px', 
                        fontSize: 15, 
                        fontWeight: 600,
                        background: 'var(--app-accent)',
                        borderRadius: 12,
                        color: '#fff',
                        boxShadow: '0 4px 12px rgba(0,168,132,0.3)'
                    }}
                >
                    {loading ? 'Please wait…' : (step === 1 ? 'Continue' : 'Create Account')}
                </Button>

                {step === 2 && (
                    <button 
                        type="button" 
                        onClick={() => setStep(1)} 
                        style={{ 
                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', 
                            fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'color 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                        onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                        Back
                    </button>
                )}
            </div>
        </form>
    );
};

export default SignupForm;
