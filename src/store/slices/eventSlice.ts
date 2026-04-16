/**
 * Event slice: tracking triggered events and firing new ones.
 */

import type { StateCreator } from 'zustand'
import { EVENTS } from '../../config/events'
import { checkStatusTriggers, checkRandomEvents, applyEventEffects } from '../../utils/eventUtils'
import type { RaccoonSlice } from './raccoonSlice'
import type { PlayerSlice } from './playerSlice'
import type { GamePhaseSlice } from './gamePhaseSlice'
import { clampStatus } from '../../utils/statusUtils'
import type { StatusKey } from '../../types/raccoon'

export interface EventSlice {
  triggeredEventIds: string[]
  lastEventCheckDay: number

  checkAndTriggerEvents: (triggerType: string, context?: Record<string, unknown>) => void
  markEventTriggered: (eventId: string) => void
  resetDailyEvents: () => void
}

type CombinedStore = EventSlice & RaccoonSlice & PlayerSlice & GamePhaseSlice

const STATUS_KEYS: StatusKey[] = ['hunger', 'mood', 'energy', 'focus', 'cleanliness', 'trust']

export const createEventSlice: StateCreator<
  CombinedStore,
  [['zustand/immer', never]],
  [],
  EventSlice
> = (set, get) => ({
  triggeredEventIds: [],
  lastEventCheckDay: 0,

  checkAndTriggerEvents: (triggerType, _context) => {
    const store = get()

    let eventsToCheck = EVENTS.filter(e => {
      if (!e.canRepeat && store.triggeredEventIds.includes(e.id)) return false
      return true
    })

    let triggered: typeof EVENTS = []

    if (triggerType === 'status') {
      triggered = checkStatusTriggers(store.raccoon, store.triggeredEventIds, eventsToCheck)
    } else if (triggerType === 'daily_random') {
      triggered = checkRandomEvents(eventsToCheck, store.gameDay, store.triggeredEventIds)
    } else if (triggerType === 'task_complete') {
      // Task-related events: check status thresholds that may be newly relevant
      triggered = checkStatusTriggers(store.raccoon, store.triggeredEventIds, eventsToCheck)
    }

    for (const event of triggered) {
      // Apply default effects immediately (choices are handled by UI)
      const { raccoonUpdates, playerUpdates } = applyEventEffects(
        event.defaultEffects,
        { raccoon: store.raccoon, player: store.player },
      )

      set((state) => {
        // Mark as triggered
        if (!state.triggeredEventIds.includes(event.id)) {
          state.triggeredEventIds.push(event.id)
        }

        // Apply raccoon updates
        for (const [key, value] of Object.entries(raccoonUpdates)) {
          if (STATUS_KEYS.includes(key as StatusKey)) {
            ;(state.raccoon as unknown as Record<string, number>)[key] = value as number
          }
        }

        // Apply player currency updates
        if (playerUpdates.coins !== undefined) {
          state.player.coins = Math.max(0, playerUpdates.coins)
        }
        if (playerUpdates.exp !== undefined) {
          state.player.exp = Math.max(0, playerUpdates.exp)
        }
      })

      // Push the event as a popup
      store.pushPopup({
        type: 'event',
        priority: event.type === 'negative' ? 'high' : 'normal',
        data: event,
      })
    }
  },

  markEventTriggered: (eventId) => {
    set((state) => {
      if (!state.triggeredEventIds.includes(eventId)) {
        state.triggeredEventIds.push(eventId)
      }
    })
  },

  resetDailyEvents: () => {
    set((state) => {
      // Only remove events that are NOT canRepeat=false (i.e. remove day-scoped ones)
      const keepIds = EVENTS
        .filter(e => !e.canRepeat)
        .map(e => e.id)
        .filter(id => state.triggeredEventIds.includes(id))

      state.triggeredEventIds = keepIds
      state.lastEventCheckDay = state.gameDay
    })
  },
})
