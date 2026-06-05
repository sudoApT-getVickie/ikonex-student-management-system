import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Landing from './Landing.jsx'
import Streams from './Streams.jsx'
import Students from './Students.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<App />} />
        <Route path="/streams" element={<Streams />} />
        <Route path="/students" element={<Students />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)