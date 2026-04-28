import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import { Toaster } from "react-hot-toast"
import { AuthContext } from './context/AuthContext'
import CallScreen from './components/chat/CallScreen'
import { CallContext } from './context/CallContext'

const App = () => {
  const { authUser, loading } = useContext(AuthContext);
  const { callState } = useContext(CallContext);

  if (loading) return (
    <div style={{ background: '#111b21', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #00a884', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#111b21' }}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#202c33', color: '#e9edef', border: '1px solid #2a3942' }
        }}
      />
      {/* Global call screen overlay */}
      {callState && <CallScreen />}

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
