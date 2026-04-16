import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { PopupManager } from '../popup/PopupManager'

export function AppShell() {
  return (
    <div className="flex flex-col h-screen max-w-[430px] mx-auto bg-[#f9f5f0]">
      <TopBar />
      <main className="flex-1 overflow-y-auto hide-scrollbar">
        <Outlet />
      </main>
      <BottomNav />
      <PopupManager />
    </div>
  )
}

export default AppShell
