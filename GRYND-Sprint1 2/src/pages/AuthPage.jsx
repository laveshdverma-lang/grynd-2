import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState('login') // login | signup | magic
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } }
        })
        if (error) throw error
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) throw error
        setSent(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  if (sent) return (
    <div className="auth-wrap" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
      <div className="display-lg" style={{ marginBottom: 8 }}>CHECK YOUR EMAIL</div>
      <div style={{ color: 'var(--grey)', fontSize: 14, lineHeight: 1.6 }}>
        We sent a magic link to <strong style={{ color: 'var(--white)' }}>{email}</strong>.<br />
        Click it to sign in instantly.
      </div>
    </div>
  )

  return (
    <div className="auth-wrap">
      <div className="auth-logo">GRYND</div>
      <div className="auth-tagline">Train smarter. Race harder.</div>

      <div className="auth-title">
        {mode === 'login' ? 'WELCOME BACK' : mode === 'signup' ? 'CREATE ACCOUNT' : 'MAGIC LINK'}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {mode === 'signup' && (
          <div className="form-group">
            <label className="form-label">YOUR NAME</label>
            <input className="form-input" type="text" placeholder="Arjun" value={name} onChange={e => setName(e.target.value)} required />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">EMAIL</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        {mode !== 'magic' && (
          <div className="form-group">
            <label className="form-label">PASSWORD</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
        )}

        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginBottom: 12 }}>
          {loading ? <span className="spinner" /> : mode === 'login' ? 'SIGN IN' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SEND MAGIC LINK'}
        </button>
      </form>

      <div className="divider-text"><span>OR</span></div>

      <button className="btn btn-secondary" onClick={handleGoogle} style={{ marginBottom: 12 }}>
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Continue with Google
      </button>

      <div className="divider-text"><span>OR</span></div>

      {mode !== 'magic' ? (
        <button className="btn btn-ghost" onClick={() => setMode('magic')} style={{ fontSize: 13, color: 'var(--grey)' }}>
          Sign in with magic link (no password)
        </button>
      ) : (
        <button className="btn btn-ghost" onClick={() => setMode('login')} style={{ fontSize: 13 }}>
          Back to password sign in
        </button>
      )}

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--grey)' }}>
        {mode === 'login' ? (
          <>Don't have an account? <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--lime)', fontWeight: 600, cursor: 'pointer' }}>Sign up</button></>
        ) : (
          <>Already have an account? <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--lime)', fontWeight: 600, cursor: 'pointer' }}>Sign in</button></>
        )}
      </div>
    </div>
  )
}
