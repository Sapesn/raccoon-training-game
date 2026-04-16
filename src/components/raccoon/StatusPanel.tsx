import { useGameStore } from '../../store/useGameStore'
import { StatusBar } from './StatusBar'
import type { StatusKey } from '../../types/raccoon'

const STATUS_KEYS: StatusKey[] = ['hunger', 'mood', 'energy', 'focus', 'cleanliness', 'trust']

export function StatusPanel() {
  const { raccoon } = useGameStore()

  return (
    <div className="grid grid-cols-2 gap-3">
      {STATUS_KEYS.map((key) => (
        <StatusBar key={key} statusKey={key} value={raccoon[key]} />
      ))}
    </div>
  )
}

export default StatusPanel
