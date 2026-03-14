const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// Reads auth state from localStorage to build the right identity header.
// If a JWT token exists → Authorization: Bearer. Otherwise → X-Session-ID.
function authHeaders() {
  const token = localStorage.getItem('vigil_token')
  if (token) return { Authorization: `Bearer ${token}` }
  const sessionId = localStorage.getItem('vigil_session_id')
  if (sessionId) return { 'X-Session-ID': sessionId }
  return {}
}

export async function runAudit(url, signal) {
  const res = await fetch(`${BASE}/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ url }),
    signal,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Audit failed')
  }
  return res.json()
}

export async function getHistory(url, limit = 20) {
  const res = await fetch(
    `${BASE}/history?url=${encodeURIComponent(url)}&limit=${limit}`,
    { headers: authHeaders() }
  )
  if (!res.ok) throw new Error('No history found')
  return res.json()
}

export async function getRecentAudits(limit = 30) {
  const res = await fetch(`${BASE}/audits/recent?limit=${limit}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Could not load recent audits')
  return res.json()
}

export async function createSchedule({ url, interval_hours, alert_email, alert_threshold }) {
  const res = await fetch(`${BASE}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ url, interval_hours, alert_email, alert_threshold }),
  })
  if (!res.ok) throw new Error('Failed to save schedule')
  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function signup(username, email, password) {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Signup failed')
  return data
}

export async function loginApi(identifier, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Login failed')
  return data
}

export async function forgotPassword(identifier) {
  const res = await fetch(`${BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}

export async function resetPassword(token, new_password) {
  const res = await fetch(`${BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Reset failed')
  return data
}
