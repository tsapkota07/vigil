import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import AuditResults from './pages/AuditResults'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Scanning from './pages/Scanning'
import NotFound from './pages/NotFound'
import Features from './pages/Features'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/scanning" element={<Scanning />} />
        <Route path="/results" element={<AuditResults />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/features" element={<Features />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App