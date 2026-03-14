import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import AuditResults from './pages/AuditResults'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/results" element={<AuditResults />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App