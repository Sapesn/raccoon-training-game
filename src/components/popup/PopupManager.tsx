import { AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/useGameStore'
import { EventPopup } from './EventPopup'
import { TaskResultPopup } from './TaskResultPopup'
import { AchievementPopup } from './AchievementPopup'
import { DayEndPopup } from './DayEndPopup'
import type { TaskResult } from '../../types/task'
import type { GameEvent } from '../../types/event'
import type { Achievement } from '../../types/achievement'
import type { DaySummary } from '../../types/game'

export function PopupManager() {
  const { popupQueue, dismissPopup } = useGameStore()

  const current = popupQueue[0]
  if (!current) return null

  const dismiss = () => dismissPopup(current.id)

  return (
    <AnimatePresence>
      {current.type === 'event' && (
        <EventPopup
          key={current.id}
          event={current.data as GameEvent}
          onChoice={dismiss}
          onDismiss={dismiss}
        />
      )}
      {current.type === 'task_result' && (
        <TaskResultPopup
          key={current.id}
          result={current.data as TaskResult}
          onClose={dismiss}
        />
      )}
      {current.type === 'achievement' && (
        <AchievementPopup
          key={current.id}
          achievement={current.data as Achievement}
          onClose={dismiss}
        />
      )}
      {current.type === 'day_end' && (
        <DayEndPopup
          key={current.id}
          summary={current.data as DaySummary}
          onConfirm={dismiss}
        />
      )}
    </AnimatePresence>
  )
}

export default PopupManager
