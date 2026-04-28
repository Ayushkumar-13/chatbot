import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const LoginForm = ({ onSubmit, loading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ email, password });
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

            <div style={{ marginTop: 12 }}>
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
                    {loading ? 'Please wait…' : 'Sign In'}
                </Button>
            </div>
        </form>
    );
};

export default LoginForm;
