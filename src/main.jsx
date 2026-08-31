import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import App from './App.jsx'

// ── Office sign-in (Versa-Docs Supabase accounts, staff role only) ──────────
// App.jsx stays untouched: this gate renders <App/> only after a staff
// sign-in, and the fetch patch below carries the session token on every
// inventory-API call so the API's auth gate recognizes the user.
const API_URL = 'https://versa-inventory-api.onrender.com'
const sb = createClient(
  'https://api.versa-docs.com',
  'sb_publishable_zKJbBUqAFcqZzuaOhGWL0A_miIpnHio',
  { auth: { flowType: 'implicit', detectSessionInUrl: false, persistSession: true, autoRefreshToken: true } }
)

const origFetch = window.fetch.bind(window)
window.fetch = async function (input, opts) {
  let url = ''
  try { url = typeof input === 'string' ? input : ((input && input.url) || '') } catch (e) { /* noop */ }
  if (url.indexOf(API_URL) === 0) {
    try {
      const { data: { session } } = await sb.auth.getSession()
      if (session && session.access_token) {
        opts = opts || {}
        const h = new Headers(opts.headers || {})
        if (!h.has('Authorization')) h.set('Authorization', 'Bearer ' + session.access_token)
        opts.headers = h
      }
    } catch (e) { /* send without token; server decides */ }
  }
  return origFetch(input, opts)
}

window.versaSignOut = async () => {
  try { await sb.auth.signOut() } catch (e) { /* noop */ }
  try { localStorage.removeItem('versa_inventory_v2') } catch (e) { /* noop */ }
  window.location.reload()
}

const box = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'linear-gradient(135deg,#0f172a,#1e293b)', padding: 20,
}
const card = {
  background: '#fff', borderRadius: 16, padding: '32px 26px', width: '100%',
  maxWidth: 360, boxShadow: '0 24px 64px rgba(0,0,0,.45)', fontFamily: 'system-ui, sans-serif',
}
const inp = {
  width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: 8,
  fontSize: 15, marginBottom: 10, boxSizing: 'border-box',
}

// Three states: 'staff' (verified office), 'denied' (verified NOT office),
// 'unknown' (network/Supabase failure). Only 'denied' may sign the user out —
// a flaky connection must never wipe a legitimate staff member's session.
async function staffRole() {
  let sawAnswer = false
  for (let i = 0; i < 3; i++) {
    try {
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return 'denied'
      const { data: prof, error } = await sb.from('profiles').select('role').eq('id', user.id).single()
      if (!error) {
        sawAnswer = true
        return (prof && prof.role === 'staff') ? 'staff' : 'denied'
      }
    } catch (e) { /* retry */ }
    await new Promise(r => setTimeout(r, 800))
  }
  return sawAnswer ? 'denied' : 'unknown'
}

function AuthGate() {
  const [phase, setPhase] = useState('checking') // checking | login | busy | ok
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await sb.auth.getSession()
        if (session) {
          const role = await staffRole()
          if (role === 'staff' || role === 'unknown') { setPhase('ok'); return }
          // 'unknown' keeps the existing session working offline-ish; the API
          // enforces server-side anyway, so this cannot over-grant access.
          try { await sb.auth.signOut() } catch (e) { /* noop */ }
          try { localStorage.removeItem('versa_inventory_v2') } catch (e) { /* noop */ }
        }
      } catch (e) { /* fall through to login */ }
      setPhase('login')
    })()
  }, [])

  const doLogin = async () => {
    if (!email.trim() || !pass) return
    setPhase('busy'); setError('')
    try {
      const { error: err } = await sb.auth.signInWithPassword({ email: email.trim(), password: pass })
      if (err) throw new Error('Wrong email or password.')
      const role = await staffRole()
      if (role === 'denied') {
        try { await sb.auth.signOut() } catch (e) { /* noop */ }
        try { localStorage.removeItem('versa_inventory_v2') } catch (e) { /* noop */ }
        throw new Error('This app is for office accounts only.')
      }
      if (role === 'unknown') {
        throw new Error('Could not verify your account. Check your connection and try again.')
      }
      setPhase('ok')
    } catch (e) {
      setError(e.message || 'Sign in failed. Please try again.')
      setPhase('login')
    }
  }

  if (phase === 'ok') return <App />
  if (phase === 'checking') {
    return (
      <div style={box}>
        <div style={{ color: '#94a3b8', fontFamily: 'system-ui, sans-serif', fontSize: 15 }}>Checking sign-in…</div>
      </div>
    )
  }
  return (
    <div style={box}>
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 32 }}>🔐</div>
          <h1 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', margin: '8px 0 2px' }}>Versa Inventory</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Office sign in</p>
        </div>
        {error ? (
          <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        ) : null}
        <input style={inp} type="email" placeholder="Email" autoComplete="username"
          value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') doLogin() }} />
        <input style={inp} type="password" placeholder="Password" autoComplete="current-password"
          value={pass} onChange={e => setPass(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') doLogin() }} />
        <button
          onClick={doLogin} disabled={phase === 'busy'}
          style={{
            width: '100%', padding: 13, background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
            color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15,
            cursor: 'pointer', opacity: phase === 'busy' ? 0.7 : 1,
          }}>
          {phase === 'busy' ? 'Signing in…' : 'Sign In'}
        </button>
        <p style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
          Use your Versa Docs email and password.<br />
          Forgot it? <a href="https://versa-docs.com" target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>Reset it on Versa Docs</a>.
        </p>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthGate />
  </React.StrictMode>
)
