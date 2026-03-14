import { createContext, useContext, useState, useEffect } from 'react'
import { getOrCreateSessionId } from '../utils/session'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('vigil_token'))
  const [ready, setReady] = useState(false)

  // Ensure session ID exists immediately on mount
  getOrCreateSessionId()

  // Validate stored token on mount
  useEffect(() => {
    if (!token) {
      setReady(true)
      return
    }
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setUser(data)
        } else {
          localStorage.removeItem('vigil_token')
          setToken(null)
        }
      })
      .catch(() => {
        localStorage.removeItem('vigil_token')
        setToken(null)
      })
      .finally(() => setReady(true))
  }, [])

  function login(tokenValue, userData) {
    localStorage.setItem('vigil_token', tokenValue)
    setToken(tokenValue)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('vigil_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      sessionId: getOrCreateSessionId(),
      login,
      logout,
      isLoggedIn: !!user,
      ready,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
