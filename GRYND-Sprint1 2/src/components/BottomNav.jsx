import { useLocation, useNavigate } from 'react-router-dom'

const TABS = [
  { path: '/', label: 'HOME', icon: (active) => (
    <svg viewBox="0 0 24 24" fill={active ? 'var(--lime)' : 'none'} stroke={active ? 'var(--lime)' : 'var(--grey)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )},
  { path: '/program', label: 'PROGRAM', icon: (active) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--lime)' : 'var(--grey)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      {active && <><line x1="8" y1="14" x2="8" y2="14" strokeWidth="3"/><line x1="12" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="8" y2="18" strokeWidth="3"/><line x1="12" y1="18" x2="16" y2="18"/></>}
    </svg>
  )},
  { path: '/stats', label: 'STATS', icon: (active) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--lime)' : 'var(--grey)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )},
  { path: '/log', label: 'LOG', icon: (active) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--lime)' : 'var(--grey)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
    </svg>
  )},
  { path: '/profile', label: 'PROFILE', icon: (active) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--lime)' : 'var(--grey)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )},
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="bottom-nav">
      {TABS.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button key={tab.path} className={`nav-item ${active ? 'active' : ''}`} onClick={() => navigate(tab.path)}>
            {tab.icon(active)}
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
