/**
 * Event trigger checking and effect application.
 */

import type { GameEvent, EventEffects } from '../types/event'
import type { Raccoon, StatusKey } from '../types/raccoon'
import type { Player } from '../types/player'
import { clampStatus } from './statusUtils'
import { rollPercent } from './randomUtils'

// ---------------------------------------------------------------------------
// Status-based trigger checking
// ---------------------------------------------------------------------------

/**
 * Checks raccoon statuses against status_threshold events.
 * Returns events whose conditions are met and that haven't been triggered yet today.
 */
export function checkStatusTriggers(
  raccoon: Raccoon,
  triggeredIds: string[],
  events: GameEvent[],
): GameEvent[] {
  return events.filter((event) => {
    if (event.triggerCondition.type !== 'status_threshold') return false
    if (!event.canRepeat && triggeredIds.includes(event.id)) return false

    const { statusKey, threshold, thresholdOp } = event.triggerCondition
    if (!statusKey || threshold === undefined) return false

    const raccoonValue = raccoon[statusKey as StatusKey]
    if (raccoonValue === undefined) return false

    switch (thresholdOp) {
      case 'lt':  return raccoonValue < threshold
      case 'lte': return raccoonValue <= threshold
      case 'gt':  return raccoonValue > threshold
      case 'gte': return raccoonValue >= threshold
      default:    return raccoonValue < threshold   // default: lt
    }
  })
}

// ---------------------------------------------------------------------------
// Random daily event checking
// ---------------------------------------------------------------------------

/**
 * Probabilistically selects random_daily events that should fire today.
 * Respects canRepeat and the day-scoped triggeredIds.
 */
export function checkRandomEvents(
  events: GameEvent[],
  _dayNumber: number,
  triggeredIds: string[],
): GameEvent[] {
  return events.filter((event) => {
    if (event.triggerCondition.type !== 'random_daily') return false
    if (!event.canRepeat && triggeredIds.includes(event.id)) return false

    const probability = event.triggerCondition.probability ?? 0
    return rollPercent(probability * 100)  // probability is 0-1, rollPercent expects 0-100
  })
}

// ---------------------------------------------------------------------------
// Effect application
// ---------------------------------------------------------------------------

export interface EventApplicationResult {
  raccoonUpdates: Partial<Raccoon>
  playerUpdates: Partial<Player>
}

const STATUS_KEYS: StatusKey[] = ['hunger', 'mood', 'energy', 'focus', 'cleanliness', 'trust']

/**
 * Converts an EventEffects record into separate raccoon and player update patches.
 */
export function applyEventEffects(
  effects: EventEffects | Record<string, unknown>,
  state: { raccoon: Raccoon; player: Player },
): EventApplicationResult {
  const raccoonUpdates: Partial<Raccoon> = {}
  const playerUpdates: Partial<Player> = {}

  for (const [key, rawValue] of Object.entries(effects)) {
    if (rawValue === undefined || rawValue === null) continue
    const value = rawValue as number | string[]

    // Status updates
    if (STATUS_KEYS.includes(key as StatusKey) && typeof value === 'number') {
      const current = state.raccoon[key as StatusKey] as number
      raccoonUpdates[key as StatusKey] = clampStatus(current + value) as never
      continue
    }

    // Player currency / stat updates
    if (key === 'coins' && typeof value === 'number') {
      playerUpdates.coins = Math.max(0, (state.player.coins ?? 0) + value)
      continue
    }
    if (key === 'exp' && typeof value === 'number') {
      playerUpdates.exp = Math.max(0, (state.player.exp ?? 0) + value)
      continue
    }

    // Item grants are handled by the calling store
    // (items: string[] — left in playerUpdates for caller to process)
    if (key === 'items' && Array.isArray(value)) {
      // Items are returned inside playerUpdates.  Caller must handle distribution.
      // We attach them as a non-standard field so the caller can inspect them.
      (playerUpdates as Record<string, unknown>)['_items'] = value
    }
  }

  return { raccoonUpdates, playerUpdates }
}
