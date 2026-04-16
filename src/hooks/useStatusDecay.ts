/**
 * useStatusDecay — status display helpers for rendering the raccoon's current state.
 */

import { useGameStore } from '../store/useGameStore'
import type { StatusKey } from '../types/raccoon'
import {
  getStatusLabel,
  getStatusColor,
  getStatusEmoji,
  getStatusLevel,
} from '../utils/statusUtils'

export interface StatusDisplay {
  value: number
  label: string
  color: string
  emoji: string
  level: 'critical' | 'low' | 'normal' | 'high'
}

export function useStatusDecay() {
  const raccoon = useGameStore(s => s.raccoon)

  const getStatusDisplay = (key: StatusKey): StatusDisplay => ({
    value: raccoon[key] as number,
    label: getStatusLabel(key),
    color: getStatusColor(key, raccoon[key] as number),
    emoji: getStatusEmoji(key, raccoon[key] as number),
    level: key === 'hunger'
      ? getStatusLevel(100 - (raccoon[key] as number))
      : getStatusLevel(raccoon[key] as number),
  })

  return { getStatusDisplay }
}
