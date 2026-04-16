/**
 * Game phase slice: phase transitions, AP management, day lifecycle, popup queue.
 */

import type { StateCreator } from 'zustand'
import type { GamePhase, PopupItem, DaySummary } from '../../types/game'
import { MAX_AP } from '../../config/gameConstants'
import { range } from '../../utils/randomUtils'

export interface GamePhaseSlice {
  gamePhase: GamePhase
  currentAP: number
  maxAP: number
  gameDay: number
  isNewDay: boolean
  popupQueue: PopupItem[]
  daySummary: DaySummary | null

  setPhase: (phase: GamePhase) => void
  spendAP: (amount: number) => boolean
  addAP: (amount: number) => void
  startNewDay: () => void
  endDay: () => void
  pushPopup: (popup: Omit<PopupItem, 'id'>) => void
  dismissPopup: (id: string) => void
  clearPopupQueue: () => void
}

export const createGamePhaseSlice: StateCreator<
  GamePhaseSlice,
  [['zustand/immer', never]],
  [],
  GamePhaseSlice
> = (set, get) => ({
  gamePhase: 'INIT',
  currentAP: MAX_AP,
  maxAP: MAX_AP,
  gameDay: 1,
  isNewDay: false,
  popupQueue: [],
  daySummary: null,

  setPhase: (phase) => {
    set((state) => {
      state.gamePhase = phase
    })
  },

  spendAP: (amount) => {
    const { currentAP } = get()
    if (currentAP < amount) return false
    set((state) => {
      state.currentAP = Math.max(0, state.currentAP - amount)
    })
    return true
  },

  addAP: (amount) => {
    set((state) => {
      state.currentAP = Math.min(state.maxAP, state.currentAP + amount)
    })
  },

  startNewDay: () => {
    set((state) => {
      state.currentAP = state.maxAP
      state.gameDay = state.gameDay + 1
      state.isNewDay = false
      state.daySummary = null
    })
  },

  endDay: () => {
    const current = get()
    const summary: DaySummary = {
      day: current.gameDay,
      tasksCompleted: 0,   // filled in by store combiner / taskSlice
      coinsEarned: 0,
      expEarned: 0,
      achievementsUnlocked: [],
      statusChanges: {},
      eventsSeen: 0,
    }
    set((state) => {
      state.daySummary = summary
      state.gamePhase = 'DAY_END'
    })
  },

  pushPopup: (popup) => {
    set((state) => {
      const newPopup: PopupItem = {
        ...popup,
        id: `popup_${Date.now()}_${range(1000, 9999)}`,
      }
      // Insert sorted by priority: critical > high > normal > low
      const priorityOrder: Record<string, number> = {
        critical: 0, high: 1, normal: 2, low: 3,
      }
      const insertIdx = state.popupQueue.findIndex(
        (p) => priorityOrder[p.priority] > priorityOrder[newPopup.priority],
      )
      if (insertIdx === -1) {
        state.popupQueue.push(newPopup)
      } else {
        state.popupQueue.splice(insertIdx, 0, newPopup)
      }
    })
  },

  dismissPopup: (id) => {
    set((state) => {
      state.popupQueue = state.popupQueue.filter((p) => p.id !== id)
    })
  },

  clearPopupQueue: () => {
    set((state) => {
      state.popupQueue = []
    })
  },
})
