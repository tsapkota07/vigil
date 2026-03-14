import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { loginApi, signup } from '../api'

/**
 * Full-screen modal for sign-in / sign-up.
 * - Backdrop click or Esc key closes it.
 * - onSuccess() is called after a successful auth.
 */
export default function AuthModal({ onClose, onSuccess, defaultTab = 'login' }) {
  const { login }  = useAuth()
  const [tab, setTab]           = useState(defaultTab)
  const [identifier, setIdentifier] = useState('')
  const [username,   setUsername]   = useState('')
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [error,      setError]      = useState(null)
  const [loading,    setLoading]    = useState(false)
  const cardRef = useRef(null)

  // Close on Esc
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Reset error when switching tabs
  const switchTab = (t) => { setTab(t); setError(null) }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { token, user } = await loginApi(identifier, password)
      login(token, user)
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { token, user } = await signup(username, email, password)
      login(token, user)
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(8,12,20,0.75)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={cardRef}
        className="bg-[#0d1520] border border-white/[0.1] rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1">
            <button
              onClick={() => switchTab('login')}
              className={`text-xs px-4 py-1.5 rounded-lg font-mono transition-all ${
                tab === 'login' ? 'bg-blue-500 text-white' : 'text-[#4a6070] hover:text-[#8899aa]'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => switchTab('signup')}
              className={`text-xs px-4 py-1.5 rounded-lg font-mono transition-all ${
                tab === 'signup' ? 'bg-blue-500 text-white' : 'text-[#4a6070] hover:text-[#8899aa]'
              }`}
            >
              Sign up
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-[#3a5068] hover:text-[#8899aa] text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Sign In Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-[#7a9ab8] font-mono block mb-1">Username or Email</label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#e8edf5] placeholder-[#3a4f63] outline-none focus:border-blue-500/50 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-[#7a9ab8] font-mono block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#e8edf5] placeholder-[#3a4f63] outline-none focus:border-blue-500/50 transition-colors font-mono"
              />
            </div>

            {error && (
              <div className="bg-red-500/[0.06] border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 font-mono">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-3 rounded-xl transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="text-center text-xs text-[#3a5068] font-mono">
              <button
                type="button"
                onClick={() => switchTab('signup')}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                No account? Sign up free →
              </button>
            </p>
          </form>
        )}

        {/* Sign Up Form */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-xs text-[#7a9ab8] font-mono block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="yourname"
                required
                minLength={3}
                autoFocus
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#e8edf5] placeholder-[#3a4f63] outline-none focus:border-blue-500/50 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-[#7a9ab8] font-mono block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#e8edf5] placeholder-[#3a4f63] outline-none focus:border-blue-500/50 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-[#7a9ab8] font-mono block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="min. 8 characters"
                required
                minLength={8}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#e8edf5] placeholder-[#3a4f63] outline-none focus:border-blue-500/50 transition-colors font-mono"
              />
            </div>

            {error && (
              <div className="bg-red-500/[0.06] border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 font-mono">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-3 rounded-xl transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p className="text-center text-xs text-[#3a5068] font-mono">
              <button
                type="button"
                onClick={() => switchTab('login')}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Already have an account? Sign in →
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
