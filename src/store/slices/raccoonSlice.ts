/**
 * Raccoon slice: status management, care actions, skills, traits.
 */

import type { StateCreator } from 'zustand'
import type { Raccoon, StatusKey, SkillKey } from '../../types/raccoon'
import {
  INITIAL_RACCOON_STATS,
  INITIAL_RACCOON_SKILLS,
  AP_COSTS,
  LEVEL_EXP_TABLE,
} from '../../config/gameConstants'
import { TRAITS } from '../../config/traits'
import { FOODS } from '../../config/foods'
import { clampStatus, applyDecay as applyDecayUtil } from '../../utils/statusUtils'
import type { GamePhaseSlice } from './gamePhaseSlice'

export interface RaccoonSlice {
  raccoon: Raccoon

  initRaccoon: (name: string, traitId: string) => void
  updateStatus: (key: StatusKey, delta: number) => void
  setStatus: (key: StatusKey, value: number) => void
  applyDecay: () => void
  feedRaccoon: (foodId: string) => boolean
  playWithRaccoon: () => boolean
  groomRaccoon: () => boolean
  restRaccoon: () => boolean
  improveSkill: (skill: SkillKey, delta: number) => void
  setTrait: (traitId: string) => void
}

const DEFAULT_RACCOON: Raccoon = {
  name: '小浣熊',
  level: 1,
  ...INITIAL_RACCOON_STATS,
  traits: [],
  stats: { ...INITIAL_RACCOON_SKILLS },
  exp: 0,
  expToNext: LEVEL_EXP_TABLE[1] ?? 100,
}

function getRaccoonExpToNext(level: number): number {
  return LEVEL_EXP_TABLE[level] ?? LEVEL_EXP_TABLE[LEVEL_EXP_TABLE.length - 1]
}

// Combined state type needed to access spendAP
type RaccoonSliceWithPhase = RaccoonSlice & GamePhaseSlice

export const createRaccoonSlice: StateCreator<
  RaccoonSliceWithPhase,
  [['zustand/immer', never]],
  [],
  RaccoonSlice
> = (set, get) => ({
  raccoon: { ...DEFAULT_RACCOON },

  initRaccoon: (name, traitId) => {
    set((state) => {
      const trait = TRAITS.find(t => t.id === traitId)
      const statMods = trait?.statModifiers ?? {}

      state.raccoon = {
        ...DEFAULT_RACCOON,
        name,
        traits: traitId ? [traitId] : [],
        stats: {
          dexterity:     INITIAL_RACCOON_SKILLS.dexterity + (statMods.dexterity ?? 0),
          understanding: INITIAL_RACCOON_SKILLS.understanding + (statMods.understanding ?? 0),
          expression:    INITIAL_RACCOON_SKILLS.expression + (statMods.expression ?? 0),
          analysis:      INITIAL_RACCOON_SKILLS.analysis + (statMods.analysis ?? 0),
          creativity:    INITIAL_RACCOON_SKILLS.creativity + (statMods.creativity ?? 0),
          stability:     INITIAL_RACCOON_SKILLS.stability + (statMods.stability ?? 0),
        },
      }
    })
  },

  updateStatus: (key, delta) => {
    set((state) => {
      state.raccoon[key] = clampStatus((state.raccoon[key] as number) + delta)
    })
  },

  setStatus: (key, value) => {
    set((state) => {
      state.raccoon[key] = clampStatus(value)
    })
  },

  applyDecay: () => {
    set((state) => {
      const decayed = applyDecayUtil(state.raccoon)
      Object.assign(state.raccoon, {
        hunger:      decayed.hunger,
        mood:        decayed.mood,
        energy:      decayed.energy,
        focus:       decayed.focus,
        cleanliness: decayed.cleanliness,
        trust:       decayed.trust,
      })
    })
  },

  feedRaccoon: (foodId) => {
    const spendOk = get().spendAP(AP_COSTS.FEED)
    if (!spendOk) return false

    const food = FOODS.find(f => f.id === foodId)
    if (!food) return false

    set((state) => {
      const { effects } = food
      if (effects.hunger !== undefined)
        state.raccoon.hunger = clampStatus(state.raccoon.hunger + effects.hunger) // feeding increases satiety (hunger = satiety: higher = more full)
      if (effects.mood !== undefined)
        state.raccoon.mood = clampStatus(state.raccoon.mood + effects.mood)
      if (effects.energy !== undefined)
        state.raccoon.energy = clampStatus(state.raccoon.energy + effects.energy)
      if (effects.focus !== undefined)
        state.raccoon.focus = clampStatus(state.raccoon.focus + effects.focus)
      if (effects.cleanliness !== undefined)
        state.raccoon.cleanliness = clampStatus(state.raccoon.cleanliness + effects.cleanliness)
      if (effects.trust !== undefined)
        state.raccoon.trust = clampStatus(state.raccoon.trust + effects.trust)

      // Temporary stat boosts (stored alongside for reference; real skill boost handled separately)
      if (effects.statBoost) {
        for (const [skill, bonus] of Object.entries(effects.statBoost)) {
          const k = skill as SkillKey
          if (state.raccoon.stats[k] !== undefined) {
            state.raccoon.stats[k] = Math.max(0, state.raccoon.stats[k] + (bonus ?? 0))
          }
        }
      }
    })
    return true
  },

  playWithRaccoon: () => {
    const spendOk = get().spendAP(AP_COSTS.PLAY)
    if (!spendOk) return false

    set((state) => {
      state.raccoon.mood     = clampStatus(state.raccoon.mood + 20)
      state.raccoon.trust    = clampStatus(state.raccoon.trust + 5)
      state.raccoon.energy   = clampStatus(state.raccoon.energy - 10)
      state.raccoon.hunger   = clampStatus(state.raccoon.hunger + 5)
    })
    return true
  },

  groomRaccoon: () => {
    const spendOk = get().spendAP(AP_COSTS.GROOM)
    if (!spendOk) return false

    set((state) => {
      state.raccoon.cleanliness = clampStatus(state.raccoon.cleanliness + 30)
      state.raccoon.mood        = clampStatus(state.raccoon.mood + 10)
      state.raccoon.trust       = clampStatus(state.raccoon.trust + 3)
    })
    return true
  },

  restRaccoon: () => {
    const spendOk = get().spendAP(AP_COSTS.REST)
    if (!spendOk) return false

    set((state) => {
      state.raccoon.energy = clampStatus(state.raccoon.energy + 35)
      state.raccoon.focus  = clampStatus(state.raccoon.focus + 15)
      state.raccoon.mood   = clampStatus(state.raccoon.mood + 5)
    })
    return true
  },

  improveSkill: (skill, delta) => {
    set((state) => {
      state.raccoon.stats[skill] = Math.max(0, state.raccoon.stats[skill] + delta)

      // Raccoon exp from training
      state.raccoon.exp += Math.abs(delta) * 5
      const maxLevel = LEVEL_EXP_TABLE.length - 1
      while (
        state.raccoon.level < maxLevel &&
        state.raccoon.exp >= getRaccoonExpToNext(state.raccoon.level)
      ) {
        state.raccoon.exp -= getRaccoonExpToNext(state.raccoon.level)
        state.raccoon.level += 1
        state.raccoon.expToNext = getRaccoonExpToNext(state.raccoon.level)
      }
    })
  },

  setTrait: (traitId) => {
    set((state) => {
      if (!state.raccoon.traits.includes(traitId)) {
        state.raccoon.traits.push(traitId)
      }
    })
  },
})
