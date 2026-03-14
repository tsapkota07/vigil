import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Landing        from './pages/Landing'
import AuditResults   from './pages/AuditResults'
import Dashboard      from './pages/Dashboard'
import Settings       from './pages/Settings'
import Scanning       from './pages/Scanning'
import NotFound       from './pages/NotFound'
import Features       from './pages/Features'
import Login          from './pages/Login'
import Register       from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                element={<Landing />} />
          <Route path="/scanning"        element={<Scanning />} />
          <Route path="/results"         element={<AuditResults />} />
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/settings"        element={<Settings />} />
          <Route path="/features"        element={<Features />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="*"                element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
