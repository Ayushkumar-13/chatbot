import React, { useContext } from 'react'
import { Routes,Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import assets from './assets/chat-app-assets/assets'
import {Toaster} from "react-hot-toast"
import { AuthContext } from './context/AuthContext'

const App = () => {
  const {authUser} = useContext(AuthContext)
  return (
    <div className= "min-h-screen bg-cover bg-no-repeat"
    style={{backgroundImage: `url(${assets.bgImage})`}}
    >
      <Toaster/>
      <Routes>
        <Route path="/" element={ authUser ? <HomePage/> : <Navigate to="/login"/>} />
        <Route path="/login" element={ !authUser ? <LoginPage/> : <Navigate to="/"/>} />
        <Route path="/profile" element={ authUser ? <ProfilePage/> : <Navigate to="/" />} />
      </Routes>
      
    </div>
  )
}

export default App
