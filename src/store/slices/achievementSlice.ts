/**
 * Achievement slice: loading, unlocking, and claiming achievements.
 */

import type { StateCreator } from 'zustand'
import type { Achievement } from '../../types/achievement'
import { ACHIEVEMENTS } from '../../config/achievements'
import { checkAchievements } from '../../utils/achievementUtils'
import type { AchievementGameState } from '../../utils/achievementUtils'
import { getTodayString } from '../../utils/dateUtils'
import type { PlayerSlice } from './playerSlice'
import type { RaccoonSlice } from './raccoonSlice'
import type { TaskSlice } from './taskSlice'
import type { TemplateSlice } from './templateSlice'
import type { InventorySlice } from './inventorySlice'
import type { EventSlice } from './eventSlice'

export interface AchievementSlice {
  achievements: Achievement[]

  initAchievements: () => void
  checkAndUnlockAchievements: () => string[]
  claimAchievement: (id: string) => boolean
  getAchievementById: (id: string) => Achievement | undefined
}

type CombinedStore = AchievementSlice & PlayerSlice & RaccoonSlice & TaskSlice & TemplateSlice & InventorySlice & EventSlice

export const createAchievementSlice: StateCreator<
  CombinedStore,
  [['zustand/immer', never]],
  [],
  AchievementSlice
> = (set, get) => ({
  achievements: [],

  initAchievements: () => {
    set((state) => {
      if (state.achievements.length === 0) {
        state.achievements = ACHIEVEMENTS.map(a => ({ ...a }))
      }
    })
  },

  checkAndUnlockAchievements: () => {
    const store = get()

    const gameState: AchievementGameState = {
      player: store.player,
      raccoon: store.raccoon,
      totalCompletedTaskCount: store.totalCompletedTaskCount,
      taskStats: store.taskStats,
      templates: store.templates,
      inventory: store.inventory,
      triggeredEventIds: store.triggeredEventIds,
      achievements: store.achievements,
    }

    const newlyUnlockedIds = checkAchievements(gameState, store.achievements)

    if (newlyUnlockedIds.length > 0) {
      const today = getTodayString()
      set((state) => {
        for (const id of newlyUnlockedIds) {
          const ach = state.achievements.find(a => a.id === id)
          if (ach && !ach.unlockedAt) {
            ach.unlockedAt = today
          }
        }
      })
    }

    return newlyUnlockedIds
  },

  claimAchievement: (id) => {
    const ach = get().achievements.find(a => a.id === id)
    if (!ach || !ach.unlockedAt || ach.claimed) return false

    set((state) => {
      const a = state.achievements.find(x => x.id === id)
      if (!a) return
      a.claimed = true

      // Grant rewards
      if (a.rewards.coins)         state.player.coins += a.rewards.coins
      if (a.rewards.rewardTickets) state.player.rewardTickets += a.rewards.rewardTickets
    })

    return true
  },

  getAchievementById: (id) => {
    return get().achievements.find(a => a.id === id)
  },
})
