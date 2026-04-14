import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GlobalStateProvider } from './context/GlobalStateContext' // 1. Import this
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GlobalStateProvider> {/* 2. Wrap the app! */}
          <App />
        </GlobalStateProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)