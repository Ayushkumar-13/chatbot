import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import assets from '../assets/chat-app-assets/assets';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

const LoginPage = () => {
    const [mode, setMode] = useState('signup'); // 'signup' | 'login'
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleAuth = async (formData) => {
        setLoading(true);
        try {
            const result = await login(mode, formData);
            if (result?.success) {
                navigate('/');
            } else {
                toast.error(result?.message || 'Something went wrong. Try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            backgroundImage: 'radial-gradient(ellipse at top, #1f2c33 0%, var(--bg-secondary) 70%)'
        }}>
            <Card style={{ maxWidth: 420 }}>
                <CardHeader>
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
                </CardHeader>

                <CardContent>
                    {mode === 'login' ? (
                        <LoginForm onSubmit={handleAuth} loading={loading} />
                    ) : (
                        <SignupForm onSubmit={handleAuth} loading={loading} />
                    )}
                </CardContent>

                <CardFooter>
                    <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                        {mode === 'signup' ? 'Already have an account? ' : "New to ChatApp? "}
                        <span
                            onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                            style={{ color: 'var(--app-accent)', cursor: 'pointer', fontWeight: 600, transition: 'color 0.2s' }}
                            onMouseEnter={e => e.target.style.color = 'var(--app-accent-hover)'}
                            onMouseLeave={e => e.target.style.color = 'var(--app-accent)'}
                        >
                            {mode === 'signup' ? 'Sign in' : 'Create an account'}
                        </span>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;
