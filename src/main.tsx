import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import StickyLife from './pages/sticky-life.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/sticky-life" element={<StickyLife />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)
