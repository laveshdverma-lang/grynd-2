import { useState } from 'react'
import { useStore } from '../store'
import { useToast } from '../hooks/useToast'

const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN']

export default function ProgramPage() {
  const program = useStore(s => s.program)
  const currentPhase = useStore(s => s.currentPhase)
  const currentWeek = useStore(s => s.currentWeek)
  const setCurrentPhase = useStore(s => s.setCurrentPhase)
  const setCurrentWeek = useStore(s => s.setCurrentWeek)
  const ticks = useStore(s => s.ticks)
  const toggleTick = useStore(s => s.toggleTick)
  const programEdits = useStore(s => s.programEdits)
  const saveExerciseEdit = useStore(s => s.saveExerciseEdit)
  const resetExerciseEdit = useStore(s => s.resetExerciseEdit)

  const todayIdx = [0,1,2,3,4,5,6].indexOf(new Date().getDay())
  const todayDay = DAYS[todayIdx === 0 ? 6 : todayIdx - 1] // shift Sun=0 to end
  const [activeDay, setActiveDay] = useState(todayDay)
  const [openBlock, setOpenBlock] = useState(null)
  const [editSheet, setEditSheet] = useState(null)
  const [editForm, setEditForm] = useState({})
  const { toast, showToast } = useToast()

  const phases = program?.phases || []
  const phase = phases[currentPhase - 1]
  const session = phase?.weeklyStructure?.[activeDay]

  if (!program) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, marginBottom: 8 }}>NO PROGRAM YET</div>
      <div style={{ color: 'var(--grey)', fontSize: 13 }}>Complete onboarding to generate your AI program</div>
    </div>
  )

  function getBlockKey(bi) { return `${activeDay}-${currentPhase}-${bi}` }
  function getTickKey(bi, ei) { return `${getBlockKey(bi)}-${ei}` }

  function getBlockDoneCount(block, bi) {
    return block.exercises?.filter((_, ei) => ticks[getTickKey(bi, ei)]).length || 0
  }

  function openEdit(bi, ei, ex) {
    const editKey = `${activeDay}-${currentPhase}-${bi}-${ei}`
    const existing = programEdits[editKey] || {}
    setEditForm({ bi, ei, editKey, name: existing.name || ex.name, sets: existing.sets || ex.sets, reps: existing.reps || ex.reps, note: existing.note || ex.note || '' })
    setEditSheet('exercise')
  }

  function saveEdit() {
    saveExerciseEdit(editForm.editKey, { name: editForm.name, sets: editForm.sets, reps: editForm.reps, note: editForm.note })
    setEditSheet(null)
    showToast('EXERCISE UPDATED ✓')
  }

  function resetEdit() {
    resetExerciseEdit(editForm.editKey)
    setEditSheet(null)
    showToast('RESET TO DEFAULT ✓')
  }

  const tagClass = (tag) => {
    const map = { HARD: 'tag-hard', MODERATE: 'tag-moderate', EASY: 'tag-easy', RECOVERY: 'tag-recovery' }
    return map[tag] || 'tag-lime'
  }

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}

      {/* Phase selector */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {phases.map((ph, i) => {
            const colors = ['#3B82F6','#FF7B35','#A855F7']
            const active = currentPhase === i + 1
            return (
              <button key={i} onClick={() => setCurrentPhase(i + 1)} style={{
                flexShrink: 0, background: active ? colors[i] : 'var(--surface2)',
                color: active ? '#080A0F' : 'var(--grey)', border: `1px solid ${active ? colors[i] : 'var(--border)'}`,
                borderRadius: 'var(--r-md)', padding: '6px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: 'pointer'
              }}>
                {ph.name}<span style={{ display: 'block', fontSize: 9, opacity: 0.7 }}>WK {ph.weeks}</span>
              </button>
            )
          })}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>
            <span style={{ fontSize: 10, color: 'var(--grey)' }}>WK</span>
            <select value={currentWeek} onChange={e => setCurrentWeek(Number(e.target.value))}
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--white)', fontSize: 12, fontWeight: 700, outline: 'none' }}>
              {Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}
            </select>
          </div>
        </div>

        {/* Day selector */}
        <div className="day-scroll" style={{ paddingBottom: 12 }}>
          {DAYS.map(day => {
            const daySession = phase?.weeklyStructure?.[day]
            const active = day === activeDay
            return (
              <div key={day} className={`day-pill ${active ? 'active' : ''}`}
                style={active ? { background: daySession?.color || 'var(--lime)', borderColor: daySession?.color || 'var(--lime)' } : {}}
                onClick={() => { setActiveDay(day); setOpenBlock(null) }}>
                <span className="dp-label" style={active ? { color: '#080A0F' } : {}}>{day}</span>
                <span className="dp-sub" style={active ? { color: '#080A0F' } : {}}>{daySession?.duration?.split(' ')[0] || '—'}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="page" style={{ paddingTop: 16 }}>
        {session ? (
          <>
            {/* Session header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: session.color }}>{session.label || activeDay}</span>
                  <span className={`tag ${tagClass(session.tag)}`}>{session.tag}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{session.title}</div>
                <div style={{ fontSize: 11, color: 'var(--grey)', lineHeight: 1.5 }}>{session.note}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[{l:'TIME',v:session.time},{l:'DUR',v:session.duration},{l:'WHERE',v:session.location}].map(({l,v})=>(
                  <div key={l} className="meta-pill">
                    <div className="ml">{l}</div>
                    <div className="mv" style={{ color: session.color }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blocks */}
            {(session.blocks || []).length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--grey)', padding: 24 }}>
                See Phase 1 for full exercise details
              </div>
            ) : (
              (session.blocks || []).map((block, bi) => {
                const isOpen = openBlock === bi
                const done = getBlockDoneCount(block, bi)
                const total = block.exercises?.length || 0
                const allDone = done === total && total > 0

                return (
                  <div key={bi} className="block-card" style={{ borderColor: isOpen ? block.color : 'var(--border)' }}>
                    <button className="block-header" onClick={() => setOpenBlock(isOpen ? null : bi)}>
                      <div className="block-dot" style={{ background: block.color }} />
                      <div style={{ flex: 1 }}>
                        <div className="block-title" style={{ color: block.color }}>{block.name}</div>
                        <div className="block-meta">{block.duration}{block.duration && ' · '}{total} exercises{done > 0 ? ` · ${done}/${total} done` : ''}</div>
                      </div>
                      {allDone && <span style={{ fontSize: 11, color: 'var(--lime)', marginRight: 8, fontWeight: 700 }}>✓ DONE</span>}
                      <span className={`block-toggle ${isOpen ? 'open' : ''}`} style={{ color: block.color }}>+</span>
                    </button>

                    {isOpen && (
                      <div className="exercise-table">
                        <div className="exercise-head">
                          <span>EXERCISE</span><span>SETS</span><span>REPS</span><span></span>
                        </div>
                        {(block.exercises || []).map((ex, ei) => {
                          const tickKey = getTickKey(bi, ei)
                          const done = ticks[tickKey]
                          const editKey = `${activeDay}-${currentPhase}-${bi}-${ei}`
                          const edit = programEdits[editKey] || {}
                          const name = edit.name || ex.name
                          const sets = edit.sets || ex.sets
                          const reps = edit.reps || ex.reps
                          const note = edit.note || ex.note || ex.weekProgression || ''

                          return (
                            <div key={ei}>
                              <div className={`exercise-row ${done ? 'completed' : ''}`} style={{ background: ei % 2 === 1 ? '#0A0D14' : 'transparent' }}>
                                <div className={`exercise-name ${done ? 'crossed' : ''}`}>{name}</div>
                                <div className="exercise-sets" style={{ color: block.color }}>{sets}</div>
                                <div className="exercise-reps">{reps}</div>
                                <button className={`tick-btn ${done ? 'done' : ''}`} onClick={() => toggleTick(tickKey)}>
                                  {done && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#080A0F" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>}
                                </button>
                              </div>
                              {note && (
                                <div className="exercise-note" style={{ background: ei % 2 === 1 ? '#0A0D14' : 'transparent', opacity: done ? 0.4 : 1 }}>
                                  {note}
                                  <button onClick={() => openEdit(bi, ei, { name, sets, reps, note })}
                                    style={{ float: 'right', background: 'none', border: 'none', color: 'var(--border2)', fontSize: 9, letterSpacing: 1, cursor: 'pointer', fontFamily: 'DM Sans' }}>
                                    ✏ EDIT
                                  </button>
                                </div>
                              )}
                              {!note && (
                                <div style={{ textAlign: 'right', padding: '0 16px 6px', background: ei % 2 === 1 ? '#0A0D14' : 'transparent' }}>
                                  <button onClick={() => openEdit(bi, ei, { name, sets, reps, note })}
                                    style={{ background: 'none', border: 'none', color: 'var(--border2)', fontSize: 9, letterSpacing: 1, cursor: 'pointer', fontFamily: 'DM Sans' }}>
                                    ✏ EDIT
                                  </button>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>😴</div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, marginBottom: 8 }}>REST DAY</div>
            <div style={{ color: 'var(--grey)', fontSize: 13 }}>Recovery is training. Sleep, eat, repeat.</div>
          </div>
        )}
      </div>

      {/* Edit exercise sheet */}
      {editSheet === 'exercise' && (
        <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && setEditSheet(null)}>
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-title">EDIT EXERCISE</div>
            <div className="sheet-sub" style={{ color: 'var(--lime)' }}>{editForm.name}</div>
            <div className="form-group">
              <label className="form-label">EXERCISE NAME</label>
              <input className="form-input" value={editForm.name} onChange={e => setEditForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">SETS</label>
                <input className="form-input" value={editForm.sets} onChange={e => setEditForm(f => ({...f, sets: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">REPS / TIME</label>
                <input className="form-input" value={editForm.reps} onChange={e => setEditForm(f => ({...f, reps: e.target.value}))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">COACHING NOTE</label>
              <input className="form-input" value={editForm.note} onChange={e => setEditForm(f => ({...f, note: e.target.value}))} />
            </div>
            <button className="btn btn-primary" onClick={saveEdit} style={{ marginBottom: 8 }}>SAVE CHANGES</button>
            <button className="btn btn-ghost" onClick={resetEdit} style={{ marginBottom: 8, color: 'var(--grey)' }}>Reset to default</button>
            <button className="btn btn-ghost" onClick={() => setEditSheet(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
