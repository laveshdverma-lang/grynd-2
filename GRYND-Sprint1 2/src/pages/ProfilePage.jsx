import { useState } from 'react'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/useToast'
import { generateProgram } from '../lib/claude'

export default function ProfilePage() {
  const profile = useStore(s => s.profile)
  const user = useStore(s => s.user)
  const races = useStore(s => s.races)
  const updateRaceResult = useStore(s => s.updateRaceResult)
  const setProgram = useStore(s => s.setProgram)
  const setRaces = useStore(s => s.setRaces)
  const resetAll = useStore(s => s.resetAll)
  const workoutLog = useStore(s => s.workoutLog)
  const { toast, showToast } = useToast()

  const [regenLoading, setRegenLoading] = useState(false)
  const [raceInputs, setRaceInputs] = useState({})

  async function handleSignOut() {
    await supabase.auth.signOut()
    resetAll()
  }

  async function handleRegenerate() {
    if (!profile) return
    setRegenLoading(true)
    try {
      const program = await generateProgram(profile)
      setProgram(program)
      if (program.races) setRaces(program.races)
      showToast('PROGRAM REGENERATED ✓')
    } catch {
      showToast('ERROR — TRY AGAIN')
    } finally {
      setRegenLoading(false)
    }
  }

  function saveRaceResult(i) {
    const val = raceInputs[i]
    if (!val) return
    updateRaceResult(i, val)
    showToast('RACE RESULT SAVED ✓')
    setRaceInputs(r => ({...r, [i]: ''}))
  }

  const stats = [
    { l: 'Total Workouts', v: workoutLog.length },
    { l: 'Training Level', v: profile?.fitnessLevel || '—' },
    { l: 'Primary Goal', v: profile?.goals?.[0] || '—' },
    { l: 'Race Target', v: profile?.raceTarget || '—' },
  ]

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}
      <div className="page">

        {/* Profile header */}
        <div className="card" style={{ marginBottom: 16, textAlign: 'center', padding: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontFamily: 'Bebas Neue', fontSize: 28, color: 'var(--black)' }}>
            {profile?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, marginBottom: 4 }}>{profile?.name?.toUpperCase() || 'ATHLETE'}</div>
          <div style={{ fontSize: 12, color: 'var(--grey)' }}>{user?.email || 'Offline mode'}</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {stats.map(s => (
            <div key={s.l} className="card" style={{ padding: '10px 12px' }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--grey)', marginBottom: 3 }}>{s.l.toUpperCase()}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)', textTransform: 'capitalize' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Races */}
        {races?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, fontWeight: 700, color: 'var(--grey)', marginBottom: 10 }}>RACE RESULTS</div>
            {races.map((r, i) => (
              <div key={i} className="race-card" style={{ borderColor: `${r.color}44` }}>
                <div className="race-event-label" style={{ color: r.color }}>RACE EVENT</div>
                <div className="race-name">{r.name}</div>
                <div className="race-date">{r.date}</div>
                <div className="race-target" style={{ background: `${r.color}20` }}>
                  <span style={{ color: r.color }}>{r.result ? `✓ ${r.result}` : r.target}</span>
                </div>
                {!r.result && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" placeholder="Log result e.g. 44:32"
                      value={raceInputs[i] || ''} onChange={e => setRaceInputs(r => ({...r,[i]:e.target.value}))}
                      style={{ flex: 1, fontSize: 13, padding: '8px 12px' }} />
                    <button onClick={() => saveRaceResult(i)} style={{ background: r.color, color: '#080A0F', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>SAVE</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleRegenerate} disabled={regenLoading}>
            {regenLoading ? <span className="spinner" /> : '🔄 Regenerate Program with AI'}
          </button>
          <button className="btn btn-secondary" onClick={() => { if (confirm('Reset all data and start over?')) { resetAll() } }}>
            ⚠️ Reset & Start Over
          </button>
          {user && (
            <button className="btn btn-danger" onClick={handleSignOut}>Sign Out</button>
          )}
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 10, color: 'var(--grey)', lineHeight: 1.8 }}>
          GRYND v0.1.0 · Sprint 1<br />
          Built with Claude AI · Powered by Anthropic
        </div>
      </div>
    </div>
  )
}
