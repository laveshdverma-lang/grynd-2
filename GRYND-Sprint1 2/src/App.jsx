import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import { useAuth } from './hooks/useAuth'
import BottomNav from './components/BottomNav'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import ProgramPage from './pages/ProgramPage'
import StatsPage from './pages/StatsPage'
import LogPage from './pages/LogPage'
import ProfilePage from './pages/ProfilePage'

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">GRYND</div>
      <div className="loading-bar-wrap"><div className="loading-bar" /></div>
    </div>
  )
}

export default function App() {
  const { loading } = useAuth()
  const user = useStore(s => s.user)
  const onboardingComplete = useStore(s => s.onboardingComplete)

  if (loading) return <LoadingScreen />

  // No auth required for demo mode — user can skip login
  // Comment out the auth gate below if you want to allow offline-first usage
  // if (!user) return <AuthPage />

  if (!onboardingComplete) return <OnboardingPage />

  return (
    <div className="app-shell">
      <div className="app-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/program" element={<ProgramPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/log" element={<LogPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}
