import React from 'react'
import { Routes,Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import assets from './assets/chat-app-assets/assets'
const App = () => {
  return (
    <div className= "min-h-screen bg-cover bg-no-repeat"
    style={{backgroundImage: `url(${assets.bgImage})`}}
    >
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/profile" element={<ProfilePage/>} />
      </Routes>
      
    </div>
  )
}

export default App
