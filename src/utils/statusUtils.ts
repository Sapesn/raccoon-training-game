/**
 * Status utilities: clamping, level classification, display helpers, decay.
 */

import type { StatusKey } from '../types/raccoon'
import type { Raccoon } from '../types/raccoon'
import { STATUS_THRESHOLDS, STATUS_DECAY_PER_DAY } from '../config/gameConstants'
import { TRAITS } from '../config/traits'

/** Clamps a status value to [0, 100]. */
export function clampStatus(value: number): number {
  return Math.max(0, Math.min(100, value))
}

/** Returns a named level based on a 0-100 value. */
export function getStatusLevel(value: number): 'critical' | 'low' | 'normal' | 'high' {
  if (value <= STATUS_THRESHOLDS.CRITICAL) return 'critical'
  if (value <= STATUS_THRESHOLDS.LOW) return 'low'
  if (value >= STATUS_THRESHOLDS.HIGH) return 'high'
  return 'normal'
}

/**
 * Returns a Tailwind color class for the given status key and value.
 * All status values: higher = better.
 */
export function getStatusColor(key: StatusKey, value: number): string {
  const level = getStatusLevel(value)
  switch (level) {
    case 'critical': return 'text-red-500'
    case 'low':      return 'text-orange-400'
    case 'high':     return 'text-green-400'
    default:         return 'text-yellow-300'
  }
}

const STATUS_LABELS: Record<StatusKey, string> = {
  hunger:      '饱腹',
  mood:        '心情',
  energy:      '精力',
  focus:       '专注',
  cleanliness: '清洁',
  trust:       '信任',
}

/** Returns the Chinese label for a status key. */
export function getStatusLabel(key: StatusKey): string {
  return STATUS_LABELS[key]
}

/** Returns an appropriate emoji based on status key and current value. */
export function getStatusEmoji(key: StatusKey, value: number): string {
  const level = getStatusLevel(value)

  const emojiMap: Record<StatusKey, Record<string, string>> = {
    hunger: {
      critical: '😤', // very hungry (low satiety)
      low:      '🤤',
      normal:   '😊',
      high:     '🍱', // well-fed
    },
    mood: {
      critical: '😭',
      low:      '😞',
      normal:   '😊',
      high:     '🥰',
    },
    energy: {
      critical: '😵',
      low:      '😪',
      normal:   '😄',
      high:     '⚡',
    },
    focus: {
      critical: '😵‍💫',
      low:      '🥱',
      normal:   '🧐',
      high:     '🎯',
    },
    cleanliness: {
      critical: '🤢',
      low:      '😬',
      normal:   '🧹',
      high:     '✨',
    },
    trust: {
      critical: '😰',
      low:      '😑',
      normal:   '😌',
      high:     '🤝',
    },
  }

  return emojiMap[key][level] ?? '❓'
}

/**
 * Applies per-day status decay to a raccoon, respecting trait modifiers.
 * @param multiplier  1.0 for a full day, 0.5 for half-day, etc.
 */
export function applyDecay(raccoon: Raccoon, multiplier: number = 1): Raccoon {
  // Collect trait-based decay modifiers
  const traitDecayModifiers: Partial<Record<StatusKey, number>> = {}
  for (const traitId of raccoon.traits) {
    const trait = TRAITS.find(t => t.id === traitId)
    if (!trait) continue
    for (const [key, delta] of Object.entries(trait.statusDecayModifiers)) {
      const k = key as StatusKey
      traitDecayModifiers[k] = (traitDecayModifiers[k] ?? 0) + (delta ?? 0)
    }
  }

  const statusKeys: StatusKey[] = ['hunger', 'mood', 'energy', 'focus', 'cleanliness', 'trust']
  const updates: Partial<Record<StatusKey, number>> = {}

  for (const key of statusKeys) {
    const baseDecay = (STATUS_DECAY_PER_DAY[key] ?? 0) * multiplier
    const traitDelta = (traitDecayModifiers[key] ?? 0) * multiplier

    // Hunger (satiety): decreases over time like other stats
    if (key === 'hunger') {
      updates[key] = clampStatus(raccoon[key] - baseDecay - traitDelta)
    } else {
      updates[key] = clampStatus(raccoon[key] - baseDecay - traitDelta)
    }
  }

  return { ...raccoon, ...updates }
}

export interface ThresholdCrossing {
  key: StatusKey
  level: 'critical' | 'low' | 'normal' | 'high'
  value: number
}

/**
 * Returns any status thresholds that are in a noteworthy state (critical or low).
 * All stats: higher = better.
 */
export function checkThresholds(raccoon: Raccoon): ThresholdCrossing[] {
  const statusKeys: StatusKey[] = ['hunger', 'mood', 'energy', 'focus', 'cleanliness', 'trust']
  const results: ThresholdCrossing[] = []

  for (const key of statusKeys) {
    const value = raccoon[key]
    const level = getStatusLevel(value)

    // Report only if attention is needed
    if (level === 'critical' || level === 'low') {
      results.push({ key, level, value })
    }
  }

  return results
}
