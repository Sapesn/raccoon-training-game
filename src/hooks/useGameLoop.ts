/**
 * useGameLoop — mounted once in App.tsx.
 * Handles init-phase routing, achievement polling, and AP time recovery.
 */

import { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'

/** Recover +1 AP every 20 minutes of real time (1 200 000 ms). */
const AP_RECOVERY_INTERVAL_MS = 20 * 60 * 1000

export function useGameLoop() {
  const store = useGameStore()

  // One-time initialization on mount
  useEffect(() => {
    if (store.gamePhase !== 'INIT') return

    // Ensure templates and achievements are seeded
    store.initTemplates()
    store.initAchievements()

    if (!store.player.onboardingComplete) {
      store.setPhase('ONBOARDING')
      return
    }

    // Player has played before — handle new-day logic then go home
    if (store.isNewDay) {
      store.startNewDay()
    }

    store.setPhase('HOME')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Check achievements whenever key progression values change
  useEffect(() => {
    if (store.gamePhase === 'INIT') return   // don't fire during init

    const newlyUnlocked = store.checkAndUnlockAchievements()

    newlyUnlocked.forEach((id) => {
      const ach = store.getAchievementById(id)
      if (ach) {
        store.pushPopup({
          type: 'achievement',
          priority: 'high',
          data: ach,
        })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.totalCompletedTaskCount,
    store.raccoon.trust,
    store.raccoon.level,
    store.player.level,
    store.player.totalDaysPlayed,
    store.player.loginStreak,
  ])

  // Suggest day-end when AP is fully exhausted
  useEffect(() => {
    if (
      store.currentAP === 0
      && store.gamePhase === 'HOME'
      && store.completedTodayTaskIds.length > 0
    ) {
      store.pushPopup({
        type: 'info',
        priority: 'low',
        data: { message: '今天的行动点已耗尽，要结束今天了吗？' },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentAP])

  // Auto-generate AI tasks when the non-permanent pool is thin
  useEffect(() => {
    if (store.gamePhase !== 'HOME') return
    store.generateDynamicTasksIfNeeded()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.gamePhase, store.availableTasks.length, store.dynamicTasks.length])

  // AP time-based recovery: +1 AP every 20 minutes (up to maxAP)
  useEffect(() => {
    const interval = setInterval(() => {
      const { currentAP, maxAP, gamePhase, addAP } = useGameStore.getState()
      if (gamePhase === 'HOME' && currentAP < maxAP) {
        addAP(1)
      }
    }, AP_RECOVERY_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [])
}
