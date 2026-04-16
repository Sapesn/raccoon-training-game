/**
 * Random utilities for game mechanics.
 * Uses Math.random() for all rolls (no seeded implementation needed at runtime).
 */

/** Returns a random integer in [min, max] (inclusive on both ends). */
export function range(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Returns a random float in [min, max). */
export function rangeFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/** Picks a uniformly random element from a non-empty array. */
export function pickRandom<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error('pickRandom: empty array')
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Picks an element by weighted probability. Weights need not sum to 1. */
export function pickWeighted<T>(items: { item: T; weight: number }[]): T {
  if (items.length === 0) throw new Error('pickWeighted: empty items')

  const totalWeight = items.reduce((sum, entry) => sum + entry.weight, 0)
  let roll = Math.random() * totalWeight

  for (const entry of items) {
    roll -= entry.weight
    if (roll <= 0) return entry.item
  }

  // Fallback (floating-point edge case)
  return items[items.length - 1].item
}

/**
 * Rolls a d100 and returns true if the roll is <= chance.
 * @param chance  percentage value (e.g. 65 means 65% success)
 */
export function rollPercent(chance: number): boolean {
  const roll = Math.random() * 100
  return roll <= chance
}

/** Returns a random integer in [1, 100]. */
export function rollD100(): number {
  return range(1, 100)
}
