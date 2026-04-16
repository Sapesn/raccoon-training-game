/**
 * useAP — exposes AP state and a guarded spend helper.
 */

import { useGameStore } from '../store/useGameStore'

export function useAP() {
  const currentAP = useGameStore(s => s.currentAP)
  const maxAP     = useGameStore(s => s.maxAP)
  const spendAP   = useGameStore(s => s.spendAP)

  /** Attempts to spend AP. Returns false (without spending) if insufficient. */
  const trySpendAP = (amount: number): boolean => {
    if (currentAP < amount) return false
    return spendAP(amount)
  }

  return {
    currentAP,
    maxAP,
    trySpendAP,
    isExhausted: currentAP === 0,
    apPercent: maxAP > 0 ? (currentAP / maxAP) * 100 : 0,
  }
}
