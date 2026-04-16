import { NavLink } from 'react-router-dom'
import { Home, CheckSquare, Layers, ShoppingBag, Trophy } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/home', icon: Home, label: '主页' },
  { to: '/tasks', icon: CheckSquare, label: '任务' },
  { to: '/templates', icon: Layers, label: '技能' },
  { to: '/shop', icon: ShoppingBag, label: '商城' },
  { to: '/achievements', icon: Trophy, label: '成就' },
]

export function BottomNav() {
  return (
    <nav className="bg-white border-t border-gray-100 pb-safe-bottom">
      <div className="flex">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                isActive ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-amber-600' : ''}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
