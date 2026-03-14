export function getOrCreateSessionId() {
  let id = localStorage.getItem('vigil_session_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('vigil_session_id', id)
  }
  return id
}
