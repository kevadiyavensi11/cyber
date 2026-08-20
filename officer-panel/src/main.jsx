import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import "leaflet/dist/leaflet.css";
import { Toaster } from 'react-hot-toast'

import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider>
            <App />
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'font-bold text-sm rounded-2xl shadow-xl',
                    duration: 4000
                }}
            />
        </ThemeProvider>
    </React.StrictMode>,
)
