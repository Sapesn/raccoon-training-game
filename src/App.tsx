import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useGameStore } from './store/useGameStore'
import { useGameLoop } from './hooks/useGameLoop'
import { AppShell } from './components/layout/AppShell'

// Pages
import LandingPage from './pages/LandingPage'
import OnboardingPage from './pages/OnboardingPage'
import HomePage from './pages/HomePage'
import TaskCenterPage from './pages/TaskCenterPage'
import TaskExecutionPage from './pages/TaskExecutionPage'
import TemplatesPage from './pages/TemplatesPage'
import ExplorePage from './pages/ExplorePage'
import InventoryPage from './pages/InventoryPage'
import AchievementsPage from './pages/AchievementsPage'
import RewardsPage from './pages/RewardsPage'
import SettingsPage from './pages/SettingsPage'
import TutorialPage from './pages/TutorialPage'
import TaskHistoryPage from './pages/TaskHistoryPage'
import ShopPage from './pages/ShopPage'

function RequireOnboarding() {
  const onboardingComplete = useGameStore(s => s.player?.onboardingComplete)
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }
  return <Outlet />
}

function GameApp() {
  useGameLoop()

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Protected game routes */}
      <Route element={<RequireOnboarding />}>
        <Route element={<AppShell />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/tasks" element={<TaskCenterPage />} />
          <Route path="/tasks/:taskId/execute" element={<TaskExecutionPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/tutorial" element={<TutorialPage />} />
          <Route path="/history" element={<TaskHistoryPage />} />
          <Route path="/shop" element={<ShopPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <GameApp />
    </BrowserRouter>
  )
}
