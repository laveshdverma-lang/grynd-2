import { useState } from 'react'
import { useStore } from '../store'
import { useToast } from '../hooks/useToast'

const TYPES = ['STRENGTH','TEMPO','Z2','LONG','INTERVALS','HYROX','YOGA','RACE','RECOVERY','OTHER']
const TYPE_COLORS = { STRENGTH:'#8B5CF6',TEMPO:'#FF7B35',Z2:'#22C55E',LONG:'#22C55E',INTERVALS:'#FF3B5C',HYROX:'#FF3B5C',YOGA:'#3B82F6',RACE:'#C8F135',RECOVERY:'#3B82F6',OTHER:'#4A5270' }

function today() {
  return new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
}

export default function LogPage() {
  const workoutLog = useStore(s => s.workoutLog)
  const addWorkoutLog = useStore(s => s.addWorkoutLog)
  const deleteWorkoutLog = useStore(s => s.deleteWorkoutLog)
  const { toast, showToast } = useToast()

  const [sheet, setSheet] = useState(false)
  const [form, setForm] = useState({ type:'STRENGTH', date:today(), note:'', rpe:7, duration:'', distance:'' })

  function handleSave() {
    if (!form.note) return showToast('ADD A NOTE FIRST')
    addWorkoutLog({ ...form, loggedAt: new Date().toISOString() })
    setSheet(false)
    setForm({ type:'STRENGTH', date:today(), note:'', rpe:7, duration:'', distance:'' })
    showToast('WORKOUT LOGGED ✓')
  }

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}

      <div className="page">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:3, color:'var(--grey)', fontWeight:700 }}>TRAINING HISTORY</div>
            <div style={{ fontFamily:'Bebas Neue', fontSize:32 }}>WORKOUT LOG</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setSheet(true)}>+ LOG</button>
        </div>

        {workoutLog.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:40 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📓</div>
            <div style={{ fontFamily:'Bebas Neue', fontSize:22, marginBottom:8 }}>NO WORKOUTS YET</div>
            <div style={{ fontSize:13, color:'var(--grey)' }}>Log your first session to start building your history</div>
          </div>
        ) : (
          workoutLog.map((w, i) => {
            const c = TYPE_COLORS[w.type] || 'var(--grey)'
            return (
              <div key={i} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 14px', marginBottom:8, display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ background:`${c}20`, borderRadius:8, padding:'6px 10px', flexShrink:0, minWidth:72, textAlign:'center' }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:1, color:c }}>{w.type}</div>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{w.note}</div>
                  <div style={{ fontSize:10, color:'var(--grey)' }}>
                    {w.date}{w.duration && ` · ${w.duration}`}{w.distance && ` · ${w.distance}`}
                  </div>
                </div>
                <div style={{ textAlign:'center', flexShrink:0 }}>
                  <div style={{ fontFamily:'Bebas Neue', fontSize:20, color:c, lineHeight:1 }}>{w.rpe}</div>
                  <div style={{ fontSize:8, color:'var(--grey)' }}>RPE</div>
                </div>
                <button onClick={() => deleteWorkoutLog(i)} style={{ background:'none', border:'none', color:'var(--border2)', fontSize:18, cursor:'pointer', padding:4, flexShrink:0 }}>×</button>
              </div>
            )
          })
        )}
      </div>

      {sheet && (
        <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && setSheet(false)}>
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-title">LOG WORKOUT</div>
            <div className="sheet-sub">Record today's session</div>

            <div className="form-group">
              <label className="form-label">TYPE</label>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:4 }}>
                {TYPES.map(t => (
                  <button key={t} onClick={() => setForm(f=>({...f,type:t}))}
                    style={{ background: form.type===t ? `${TYPE_COLORS[t]}22` : 'var(--surface2)', border: `1px solid ${form.type===t ? TYPE_COLORS[t] : 'var(--border)'}`, borderRadius:6, padding:'5px 10px', fontSize:10, fontWeight:700, color: form.type===t ? TYPE_COLORS[t] : 'var(--grey)', cursor:'pointer', letterSpacing:1 }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">DATE</label>
              <input className="form-input" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} />
            </div>

            <div className="form-group">
              <label className="form-label">NOTES</label>
              <input className="form-input" placeholder="e.g. 8km @ 4:22/km · felt strong" value={form.note} onChange={e => setForm(f=>({...f,note:e.target.value}))} />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">DURATION</label>
                <input className="form-input" placeholder="90 min" value={form.duration} onChange={e => setForm(f=>({...f,duration:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">DISTANCE (if run)</label>
                <input className="form-input" placeholder="8km" value={form.distance} onChange={e => setForm(f=>({...f,distance:e.target.value}))} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">RPE (1–10): <span style={{ color:'var(--lime)', fontWeight:700 }}>{form.rpe}</span></label>
              <input type="range" min={1} max={10} value={form.rpe} onChange={e => setForm(f=>({...f,rpe:Number(e.target.value)}))}
                style={{ width:'100%', accentColor:'var(--lime)' }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'var(--grey)', marginTop:2 }}>
                <span>1 EASY</span><span>5 MODERATE</span><span>10 MAX</span>
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleSave} style={{ marginBottom:8 }}>SAVE WORKOUT</button>
            <button className="btn btn-ghost" onClick={() => setSheet(false)} style={{ color:'var(--grey)' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
