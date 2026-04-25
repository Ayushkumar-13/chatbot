import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { CallProvider } from './context/CallContext.jsx'
import { TooltipProvider } from '@/components/ui/tooltip'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <ChatProvider>
        <CallProvider>
          <TooltipProvider delayDuration={300}>
            <App />
          </TooltipProvider>
        </CallProvider>
      </ChatProvider>
    </AuthProvider>
  </BrowserRouter>
)
