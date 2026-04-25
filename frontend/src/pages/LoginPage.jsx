import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import assets from '../assets/chat-app-assets/assets';

const LoginPage = () => {
    const [mode, setMode] = useState('signup'); // 'signup' | 'login'
    const [step, setStep] = useState(1); // signup step 1 = name/email/pass, step 2 = bio
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode === 'signup' && step === 1) { setStep(2); return; }

        setLoading(true);
        try {
            const result = await login(mode, { fullName, email, password, bio });
            if (result?.success) {
                navigate('/');
            } else {
                toast.error(result?.message || 'Something went wrong. Try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        background: 'var(--bg-input)',
        border: '1px solid transparent',
        borderRadius: 12,
        padding: '14px 16px',
        fontSize: 15,
        color: 'var(--text-primary)',
        transition: 'all 0.2s ease',
        outline: 'none',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
    };

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            backgroundImage: 'radial-gradient(ellipse at top, #1f2c33 0%, var(--bg-secondary) 70%)'
        }}>
            <div style={{
                background: 'var(--bg-primary)', borderRadius: 24, width: '100%', maxWidth: 420,
                boxShadow: '0 24px 64px rgba(0,0,0,0.4)', overflow: 'hidden', border: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column'
            }}>
                {/* Logo header */}
                <div style={{
                    padding: '40px 32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                    <img 
                        src={assets.logo_icon} 
                        alt="ChatApp Logo" 
                        style={{ width: 64, height: 64, marginBottom: 20, filter: 'drop-shadow(0 4px 12px rgba(0, 168, 132, 0.4))' }} 
                    />
                    <h1 style={{ color: 'var(--text-primary)', margin: '0 0 8px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
                        Welcome to ChatApp
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 15, lineHeight: 1.5 }}>
                        {mode === 'signup' 
                            ? "Create an account to connect with your friends and family."
                            : "Sign in to continue to your account."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '16px 32px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    
                    {/* Step 1 — Name / Email / Password */}
                    {(mode === 'login' || step === 1) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {mode === 'signup' && (
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Full Name</label>
                                    <input
                                        value={fullName} onChange={e => setFullName(e.target.value)}
                                        placeholder="e.g. John Doe" required
                                        style={inputStyle}
                                        onFocus={e => e.target.style.border = '1px solid var(--app-accent)'}
                                        onBlur={e => e.target.style.border = '1px solid transparent'}
                                    />
                                </div>
                            )}
                            <div>
                                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Email Address</label>
                                <input
                                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com" required
                                    style={inputStyle}
                                    onFocus={e => e.target.style.border = '1px solid var(--app-accent)'}
                                    onBlur={e => e.target.style.border = '1px solid transparent'}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Password</label>
                                <input
                                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••" required minLength={6}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.border = '1px solid var(--app-accent)'}
                                    onBlur={e => e.target.style.border = '1px solid transparent'}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2 — Bio */}
                    {mode === 'signup' && step === 2 && (
                        <div>
                            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>About You (Bio)</label>
                            <textarea
                                value={bio} onChange={e => setBio(e.target.value)}
                                placeholder="I am using ChatApp!"
                                rows={3} required
                                style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
                                onFocus={e => e.target.style.border = '1px solid var(--app-accent)'}
                                onBlur={e => e.target.style.border = '1px solid transparent'}
                            />
                        </div>
                    )}

                    <div style={{ marginTop: 12 }}>
                        <button type="submit" disabled={loading} style={{
                            width: '100%', background: 'var(--app-accent)', border: 'none', color: '#fff',
                            borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                            transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0,168,132,0.3)'
                        }}
                            onMouseEnter={e => { if(!loading) e.target.style.background = 'var(--app-accent-hover)'; }}
                            onMouseLeave={e => { if(!loading) e.target.style.background = 'var(--app-accent)'; }}
                        >
                            {loading ? 'Please wait…' : mode === 'signup' ? (step === 1 ? 'Continue' : 'Create Account') : 'Sign In'}
                        </button>
                    </div>

                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                            {mode === 'signup' ? 'Already have an account? ' : "New to ChatApp? "}
                            <span
                                onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setStep(1); }}
                                style={{ color: 'var(--app-accent)', cursor: 'pointer', fontWeight: 600, transition: 'color 0.2s' }}
                                onMouseEnter={e => e.target.style.color = 'var(--app-accent-hover)'}
                                onMouseLeave={e => e.target.style.color = 'var(--app-accent)'}
                            >
                                {mode === 'signup' ? 'Sign in' : 'Create an account'}
                            </span>
                        </p>

                        {mode === 'signup' && step === 2 && (
                            <button type="button" onClick={() => setStep(1)} style={{ 
                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', 
                                fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s'
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
            </div>
        </div>
    );
};

export default LoginPage;
