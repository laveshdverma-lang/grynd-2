import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'

const DAYS_OF_WEEK = ['SUN','MON','TUE','WED','THU','FRI','SAT']

function getDayName() {
  return DAYS_OF_WEEK[new Date().getDay()]
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'GOOD MORNING'
  if (h < 17) return 'GOOD AFTERNOON'
  return 'GOOD EVENING'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const profile = useStore(s => s.profile)
  const program = useStore(s => s.program)
  const stats = useStore(s => s.stats)
  const currentPhase = useStore(s => s.currentPhase)
  const currentWeek = useStore(s => s.currentWeek)
  const streak = useStore(s => s.streak)
  const races = useStore(s => s.races)
  const incrementStreak = useStore(s => s.incrementStreak)

  const today = getDayName()
  const phase = program?.phases?.[currentPhase - 1]
  const todaySession = phase?.weeklyStructure?.[today]

  const statItems = [
    { label: 'VO2MAX', value: stats.vo2, color: 'var(--lime)', goal: 60 },
    { label: 'REST HR', value: stats.hr, unit: 'bpm', color: 'var(--red)', goal: 40 },
    { label: 'WEIGHT', value: stats.weight, unit: 'kg', color: 'var(--orange)', goal: 76 },
    { label: 'BF%', value: stats.bf, unit: '%', color: 'var(--blue)', goal: 12 },
  ]

  const nextRace = races?.find(r => !r.result)
  const daysToRace = nextRace?.date ? Math.max(0, Math.round((new Date(nextRace.date) - new Date()) / 86400000)) : null

  function handleStartSession() {
    incrementStreak()
    navigate('/program')
  }

  return (
    <div>
      {/* Header */}
      <div className="dash-header">
        <div className="dash-greeting">{getGreeting()}</div>
        <div className="dash-name">{profile?.name?.toUpperCase() || 'ATHLETE'}</div>
        <div className="dash-streak">
          <span className="streak-fire">🔥</span>
          <span className="streak-num">{streak}</span>
          <span className="streak-lbl">DAY STREAK</span>
          <span style={{ marginLeft: 10, fontSize: 10, color: 'var(--grey)' }}>
            WEEK {currentWeek}/12 · {phase?.name || 'BASE'}
          </span>
        </div>
      </div>

      <div className="page" style={{ paddingTop: 8 }}>

        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: 16 }}>
          {statItems.map(item => (
            <div key={item.label} className="stat-card">
              <div className="stat-card-bar" style={{ background: item.color }} />
              <div className="stat-label">{item.label}</div>
              <div className="stat-value" style={{ color: item.color }}>
                {item.value ?? '—'}
                {item.value && item.unit && <span className="stat-unit">{item.unit}</span>}
              </div>
              {item.value && <div className="stat-target">→ {item.goal}{item.unit || ''}</div>}
              {!item.value && <div style={{ fontSize: 10, color: 'var(--grey)', marginTop: 4 }}>Tap Stats to set</div>}
            </div>
          ))}
        </div>

        {/* Race countdown */}
        {nextRace && daysToRace !== null && (
          <div className="card card-lime" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: 'var(--lime)', marginBottom: 3 }}>NEXT RACE</div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 18, lineHeight: 1 }}>{nextRace.name}</div>
              <div style={{ fontSize: 11, color: 'var(--grey)', marginTop: 2 }}>{nextRace.target}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 40, color: 'var(--lime)', lineHeight: 1 }}>{daysToRace}</div>
              <div style={{ fontSize: 9, color: 'var(--grey)', letterSpacing: 1 }}>DAYS</div>
            </div>
          </div>
        )}

        {/* Today's session */}
        {todaySession ? (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--grey)', marginBottom: 8 }}>TODAY'S SESSION</div>
            <div className="card" style={{ borderLeft: `3px solid ${todaySession.color || 'var(--lime)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, color: todaySession.color }}>{today}</span>
                    <span className={`tag tag-${(todaySession.tag || 'MODERATE').toLowerCase()}`}>{todaySession.tag}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{todaySession.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--grey)' }}>{todaySession.duration} · {todaySession.location} · {todaySession.time}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--grey)', lineHeight: 1.5, marginBottom: 12 }}>{todaySession.note}</div>
              <button className="btn btn-primary" onClick={handleStartSession}>START SESSION →</button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 16, textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 20, marginBottom: 4 }}>REST DAY</div>
            <div style={{ fontSize: 12, color: 'var(--grey)' }}>Recovery is where adaptation happens. Sleep, eat, hydrate.</div>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/stats')} style={{ flexDirection: 'column', gap: 4, padding: '14px 8px', height: 'auto' }}>
            <span style={{ fontSize: 20 }}>📊</span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Update Stats</span>
            <span style={{ fontSize: 10, color: 'var(--grey)' }}>Log InBody data</span>
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/log')} style={{ flexDirection: 'column', gap: 4, padding: '14px 8px', height: 'auto' }}>
            <span style={{ fontSize: 20 }}>✏️</span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Log Workout</span>
            <span style={{ fontSize: 10, color: 'var(--grey)' }}>Track today's session</span>
          </button>
        </div>

        {/* Program phase overview */}
        {phase && (
          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--grey)', marginBottom: 6 }}>CURRENT PHASE</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 24 }}>{phase.name} PHASE</div>
              <div style={{ fontSize: 11, color: 'var(--grey)' }}>Weeks {phase.weeks}</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--grey)', lineHeight: 1.5, marginBottom: 10 }}>{phase.focus}</div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${((currentWeek - 1) % 4) / 4 * 100}%`, background: 'var(--lime)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 9, color: 'var(--grey)' }}>WEEK {currentWeek}</span>
              <span style={{ fontSize: 9, color: 'var(--lime)', fontWeight: 700 }}>{((currentWeek - 1) % 4) + 1} OF 4 WEEKS</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
