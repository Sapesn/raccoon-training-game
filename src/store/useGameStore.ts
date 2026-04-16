/**
 * Root Zustand store.
 * Composes all slices with immer + persist middleware.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { createGamePhaseSlice, type GamePhaseSlice } from './slices/gamePhaseSlice'
import { createPlayerSlice, type PlayerSlice } from './slices/playerSlice'
import { createRaccoonSlice, type RaccoonSlice } from './slices/raccoonSlice'
import { createTaskSlice, type TaskSlice } from './slices/taskSlice'
import { createTemplateSlice, type TemplateSlice } from './slices/templateSlice'
import { createInventorySlice, type InventorySlice } from './slices/inventorySlice'
import { createAchievementSlice, type AchievementSlice } from './slices/achievementSlice'
import { createEventSlice, type EventSlice } from './slices/eventSlice'
import { isNewDay as checkIsNewDay } from '../utils/dateUtils'
import { getTodayString, getLoginStreak } from '../utils/dateUtils'
import { ACHIEVEMENTS } from '../config/achievements'
import { INITIAL_TEMPLATES } from '../config/initialTemplates'

// ---------------------------------------------------------------------------
// Combined store type
// ---------------------------------------------------------------------------

export type AllSlices =
  & GamePhaseSlice
  & PlayerSlice
  & RaccoonSlice
  & TaskSlice
  & TemplateSlice
  & InventorySlice
  & AchievementSlice
  & EventSlice

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGameStore = create<AllSlices>()(
  persist(
    immer((set, get, store) => ({
      // Spread all slices
      ...createGamePhaseSlice(set, get, store),
      ...createPlayerSlice(set, get, store),
      ...createRaccoonSlice(set as never, get as never, store as never),
      ...createTaskSlice(set as never, get as never, store as never),
      ...createTemplateSlice(set, get, store),
      ...createInventorySlice(set, get, store),
      ...createAchievementSlice(set as never, get as never, store as never),
      ...createEventSlice(set as never, get as never, store as never),

      // Override startNewDay to coordinate all slices
      startNewDay: () => {
        const store = get()
        const today = getTodayString()
        const newStreak = getLoginStreak(store.player.lastLoginDate, store.player.loginStreak)

        set((state) => {
          // Restore AP
          state.currentAP = state.maxAP
          state.isNewDay = false
          state.daySummary = null
          state.gameDay = state.gameDay + 1

          // Update player login info
          state.player.lastLoginDate = today
          state.player.loginStreak = newStreak
          state.player.totalDaysPlayed += 1
        })

        // Apply status decay from the new day
        store.applyDecay()

        // Refresh daily task pool
        store.refreshDailyTasks()

        // Reset repeating daily events
        store.resetDailyEvents()

        // Check for random daily events
        store.checkAndTriggerEvents('daily_random')

        // Check status-based events
        store.checkAndTriggerEvents('status')
      },
    })),
    {
      name: 'raccoon-game-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        player: state.player,
        raccoon: state.raccoon,
        gameDay: state.gameDay,
        templates: state.templates,
        inventory: state.inventory,
        dynamicTasks: state.dynamicTasks,
        taskStats: state.taskStats,
        taskHistory: state.taskHistory,
        triggeredEventIds: state.triggeredEventIds,
        achievements: state.achievements,
        completedTodayTaskIds: state.completedTodayTaskIds,
        totalCompletedTaskCount: state.totalCompletedTaskCount,
        lastEventCheckDay: state.lastEventCheckDay,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return

        // Determine if this is a new calendar day
        const isNew = state.player?.lastLoginDate
          ? checkIsNewDay(state.player.lastLoginDate)
          : true

        state.isNewDay = isNew

        // Always reset transient phase state on reload
        state.gamePhase = 'INIT'
        state.popupQueue = []
        state.lastTaskResult = null

        // Init achievements and templates if this is first load
        if (!state.achievements || state.achievements.length === 0) {
          state.achievements = ACHIEVEMENTS.map(a => ({ ...a }))
        }

        if (!state.templates || state.templates.length === 0) {
          state.templates = INITIAL_TEMPLATES.map(t => ({ ...t }))
        }
      },
    },
  ),
)
