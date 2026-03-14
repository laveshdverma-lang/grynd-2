import { useState } from 'react'
import { useStore } from '../store'
import { useToast } from '../hooks/useToast'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const GOALS = { vo2: 60, hr: 40, bf: 12, muscle: 42, weight: 76 }
const STARTS = { vo2: 50, hr: 50, bf: 20, muscle: 36, weight: 81 }

export default function StatsPage() {
  const stats = useStore(s => s.stats)
  const statHistory = useStore(s => s.statHistory)
  const currentWeek = useStore(s => s.currentWeek)
  const currentPhase = useStore(s => s.currentPhase)
  const setCurrentWeek = useStore(s => s.setCurrentWeek)
  const setCurrentPhase = useStore(s => s.setCurrentPhase)
  const updateStats = useStore(s => s.updateStats)
  const { toast, showToast } = useToast()

  const [sheet, setSheet] = useState(false)
  const [form, setForm] = useState({
    label: '', vo2: '', hr: '', bf: '', muscle: '', weight: '', fiveK: '', bench: '', squat: ''
  })

  function pct(cur, key) {
    if (!cur) return 0
    const start = STARTS[key] || cur
    const goal = GOALS[key] || cur
    return Math.min(100, Math.max(0, Math.round(Math.abs((cur - start) / (goal - start)) * 100)))
  }

  function handleSave() {
    const updates = {}
    Object.entries(form).forEach(([k, v]) => { if (v && k !== 'label') updates[k] = isNaN(v) ? v : Number(v) })
    if (Object.keys(updates).length === 0) return showToast('NO CHANGES TO SAVE')
    updateStats(updates, form.label || `Wk${currentWeek}`)
    setSheet(false)
    setForm({ label:'',vo2:'',hr:'',bf:'',muscle:'',weight:'',fiveK:'',bench:'',squat:'' })
    showToast('STATS UPDATED ✓')
  }

  const statItems = [
    { key: 'vo2', label: 'VO2MAX', value: stats.vo2, unit: '', color: 'var(--lime)', goal: GOALS.vo2 },
    { key: 'hr', label: 'RESTING HR', value: stats.hr, unit: 'bpm', color: 'var(--red)', goal: GOALS.hr },
    { key: 'bf', label: 'BODY FAT', value: stats.bf, unit: '%', color: 'var(--blue)', goal: GOALS.bf },
    { key: 'muscle', label: 'MUSCLE', value: stats.muscle, unit: 'kg', color: 'var(--orange)', goal: GOALS.muscle },
    { key: 'weight', label: 'WEIGHT', value: stats.weight, unit: 'kg', color: 'var(--purple)', goal: GOALS.weight },
  ]

  const chartData = statHistory.map(h => ({
    name: h.label || h.date?.split('T')[0],
    vo2: h.vo2, hr: h.hr, bf: h.bf, weight: h.weight, muscle: h.muscle
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 11 }}>
        <div style={{ color: 'var(--grey)', marginBottom: 4 }}>{label}</div>
        {payload.map(p => <div key={p.dataKey} style={{ color: p.color }}>{p.dataKey.toUpperCase()}: {p.value}</div>)}
      </div>
    )
  }

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}

      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--grey)', fontWeight: 700 }}>PERFORMANCE METRICS</div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 32 }}>STATS TRACKER</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setSheet(true)}>+ UPDATE</button>
        </div>

        {/* Week / Phase controls */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--grey)', marginBottom: 10 }}>CURRENT WEEK / PHASE</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--grey)' }}>WEEK</span>
              <input type="number" min={1} max={12} value={currentWeek}
                onChange={e => setCurrentWeek(Math.min(12, Math.max(1, Number(e.target.value))))}
                style={{ width: 56, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', color: 'var(--white)', fontSize: 16, fontWeight: 700, textAlign: 'center', outline: 'none', fontFamily: 'Bebas Neue' }} />
            </div>
            {[{p:1,n:'BASE',c:'#3B82F6'},{p:2,n:'BUILD',c:'#FF7B35'},{p:3,n:'PEAK',c:'#A855F7'}].map(({p,n,c})=>(
              <button key={p} onClick={() => setCurrentPhase(p)} style={{
                background: currentPhase===p ? c : 'var(--surface2)',
                color: currentPhase===p ? '#080A0F' : 'var(--grey)',
                border: `1px solid ${currentPhase===p ? c : 'var(--border)'}`,
                borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer'
              }}>{n}</button>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          {statItems.map(item => {
            const p = pct(item.value, item.key)
            return (
              <div key={item.key} className="stat-card">
                <div className="stat-card-bar" style={{ background: item.color }} />
                <div className="stat-label">{item.label}</div>
                <div className="stat-value" style={{ color: item.color }}>
                  {item.value ?? '—'}
                  {item.value && <span className="stat-unit">{item.unit}</span>}
                </div>
                <div className="stat-target">→ {item.goal}{item.unit}</div>
                <div className="progress-track" style={{ marginTop: 6 }}>
                  <div className="progress-fill" style={{ width: `${p}%`, background: item.color }} />
                </div>
                <div style={{ fontSize: 9, color: item.color, fontWeight: 700, marginTop: 3 }}>{p}% COMPLETE</div>
              </div>
            )
          })}
        </div>

        {/* Charts */}
        {chartData.length > 1 && (
          <>
            {[
              { key: 'vo2', label: 'VO2MAX TREND', color: 'var(--lime)' },
              { key: 'hr', label: 'RESTING HR TREND', color: 'var(--red)' },
              { key: 'weight', label: 'WEIGHT TREND', color: 'var(--purple)' },
            ].map(({ key, label, color }) => (
              <div key={key} className="card" style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, fontWeight: 700, marginBottom: 12, color }}>{label}</div>
                <ResponsiveContainer width="100%" height={100}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fill: 'var(--grey)', fontSize: 9, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--grey)', fontSize: 9, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey={key} stroke={color} strokeWidth={2} fill={`url(#grad-${key})`} dot={{ fill: color, r: 3 }} connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ))}
          </>
        )}

        {chartData.length <= 1 && (
          <div className="card" style={{ textAlign: 'center', padding: 24, color: 'var(--grey)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📈</div>
            <div style={{ fontSize: 13 }}>Charts appear after your second check-in. Log your InBody data regularly to track progress.</div>
          </div>
        )}
      </div>

      {/* Update stats sheet */}
      {sheet && (
        <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && setSheet(false)}>
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-title">UPDATE STATS</div>
            <div className="sheet-sub">Enter your latest InBody + Coros numbers</div>
            <div className="form-group">
              <label className="form-label">CHECK-IN LABEL (e.g. "Wk4 InBody")</label>
              <input className="form-input" placeholder="Wk4" value={form.label} onChange={e => setForm(f=>({...f,label:e.target.value}))} />
            </div>
            <div className="form-grid">
              {[
                {k:'vo2',l:'VO2MAX',p:'52'},{k:'hr',l:'RESTING HR',p:'47'},
                {k:'bf',l:'BODY FAT %',p:'18'},{k:'muscle',l:'MUSCLE (kg)',p:'37'},
                {k:'weight',l:'WEIGHT (kg)',p:'80'},{k:'fiveK',l:'5K TIME',p:'22:15'},
                {k:'bench',l:'BENCH (kg)',p:'75'},{k:'squat',l:'SQUAT (kg)',p:'120'},
              ].map(({k,l,p}) => (
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" placeholder={p} value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} />
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={handleSave} style={{ marginBottom: 8 }}>SAVE & UPDATE CHARTS</button>
            <button className="btn btn-ghost" onClick={() => setSheet(false)} style={{ color: 'var(--grey)' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
