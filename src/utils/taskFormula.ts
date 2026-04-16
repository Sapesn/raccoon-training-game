/**
 * Task success-rate formula, execution rolling, and reward calculation.
 */

import type { Task, TaskResult } from '../types/task'
import type { Raccoon, SkillKey } from '../types/raccoon'
import type { Template } from '../types/template'
import {
  DIFFICULTY_PENALTY,
  TASK_GRADE_THRESHOLDS,
  OUTPUT_SCORE_WEIGHTS,
} from '../config/gameConstants'
import { TRAITS } from '../config/traits'
import { rangeFloat, rollD100 } from './randomUtils'

// ---------------------------------------------------------------------------
// Success rate calculation
// ---------------------------------------------------------------------------

export interface SuccessRateBreakdown {
  baseRate: number
  statBonus: number
  templateBonus: number
  statusBonus: number
  itemBonus: number
  difficultyPenalty: number
  traitModifier: number
  finalRate: number
  /** Displayed uncertainty band (finalRate - 5) */
  displayMin: number
  /** Displayed uncertainty band (finalRate + 5) */
  displayMax: number
}

interface SuccessRateParams {
  task: Task
  raccoon: Raccoon
  template?: Template
  itemBonuses: number     // sum of successRateBonus from equipped items
  traitModifier: number   // caller computes this from traits × taskCategory
}

/**
 * Calculates the full success-rate breakdown for a pending task execution.
 */
export function calculateSuccessRate(params: SuccessRateParams): SuccessRateBreakdown {
  const { task, raccoon, template, itemBonuses, traitModifier } = params

  // Stat bonus: sum of raccoon.stats[stat] / 10 for each recommended stat
  const statBonus = task.recommendedStats.reduce((sum, stat: SkillKey) => {
    return sum + (raccoon.stats[stat] ?? 0) / 10
  }, 0)

  // Template bonus: proficiency/100 * 20
  const templateBonus = template
    ? (template.proficiency / 100) * 20
    : 0

  // Status bonus
  let statusBonus = 0
  if (raccoon.focus > 70)       statusBonus += 5
  else if (raccoon.focus < 30)  statusBonus -= 10

  if (raccoon.energy > 60)      statusBonus += 3
  else if (raccoon.energy < 25) statusBonus -= 15

  if (raccoon.mood > 70)        statusBonus += 5
  else if (raccoon.mood < 30)   statusBonus -= 10

  const difficultyPenalty = DIFFICULTY_PENALTY[task.difficulty] ?? 0

  const rawRate =
    task.baseSuccessRate
    + statBonus
    + templateBonus
    + statusBonus
    + itemBonuses
    - difficultyPenalty
    + traitModifier

  const finalRate = Math.max(5, Math.min(95, rawRate))

  return {
    baseRate: task.baseSuccessRate,
    statBonus,
    templateBonus,
    statusBonus,
    itemBonus: itemBonuses,
    difficultyPenalty,
    traitModifier,
    finalRate,
    displayMin: Math.max(5, Math.round(finalRate - 5)),
    displayMax: Math.min(95, Math.round(finalRate + 5)),
  }
}

// ---------------------------------------------------------------------------
// Execution (dice roll → score breakdown → grade)
// ---------------------------------------------------------------------------

/** Computes the trait modifier for a given raccoon/task combination. */
export function getTraitModifier(raccoon: Raccoon, taskCategory: string): number {
  let modifier = 0
  for (const traitId of raccoon.traits) {
    const trait = TRAITS.find(t => t.id === traitId)
    if (trait?.taskCategoryBonus[taskCategory] !== undefined) {
      modifier += trait.taskCategoryBonus[taskCategory]
    }
  }
  return modifier
}

export interface ExecutionResult {
  success: boolean
  roll: number
  variance: number
  scoreBreakdown: {
    accuracy: number
    completeness: number
    expression: number
    timeliness: number
    stability: number
  }
  grade: 'fail' | 'partial' | 'good' | 'excellent' | 'perfect'
  finalScore: number
}

/**
 * Runs the dice roll against successRate and builds the score breakdown.
 */
export function executeTask(successRate: number, raccoon: Raccoon): ExecutionResult {
  const roll = rollD100()
  const success = roll <= successRate

  // Variance: ±10 centred on 0, scaled slightly by stability stat
  const stabilityFactor = (raccoon.stats.stability ?? 10) / 100  // 0-1
  const maxVariance = 10 - stabilityFactor * 4  // [6, 10]
  const variance = rangeFloat(-maxVariance, maxVariance)

  // Base subscores: higher on success, lower on failure
  const baseScore = success
    ? 60 + (successRate - roll) / successRate * 35  // scales up with margin
    : 20 + (roll - successRate) / (100 - successRate) * -15

  const clamp = (v: number) => Math.max(0, Math.min(100, v))

  const scoreBreakdown = {
    accuracy:     clamp(baseScore + rangeFloat(-8, 8) + variance),
    completeness: clamp(baseScore + rangeFloat(-6, 6) + variance),
    expression:   clamp(baseScore + rangeFloat(-10, 10) + variance * 1.2),
    timeliness:   clamp(baseScore + rangeFloat(-5, 5) + variance),
    stability:    clamp(baseScore + stabilityFactor * 15 + rangeFloat(-5, 5)),
  }

  const finalScore =
    scoreBreakdown.accuracy     * OUTPUT_SCORE_WEIGHTS.accuracy
    + scoreBreakdown.completeness * OUTPUT_SCORE_WEIGHTS.completeness
    + scoreBreakdown.expression   * OUTPUT_SCORE_WEIGHTS.expression
    + scoreBreakdown.timeliness   * OUTPUT_SCORE_WEIGHTS.timeliness
    + scoreBreakdown.stability    * OUTPUT_SCORE_WEIGHTS.stability

  const grade = getGrade(finalScore, success)

  return { success, roll, variance, scoreBreakdown, grade, finalScore }
}

function getGrade(score: number, success: boolean): ExecutionResult['grade'] {
  if (!success) return 'fail'
  if (score >= TASK_GRADE_THRESHOLDS.perfect)   return 'perfect'
  if (score >= TASK_GRADE_THRESHOLDS.excellent) return 'excellent'
  if (score >= TASK_GRADE_THRESHOLDS.good)      return 'good'
  if (score >= TASK_GRADE_THRESHOLDS.partial)   return 'partial'
  return 'fail'
}

// ---------------------------------------------------------------------------
// Reward calculation
// ---------------------------------------------------------------------------

const GRADE_MULTIPLIERS: Record<string, number> = {
  perfect:   1.5,
  excellent: 1.2,
  good:      1.0,
  partial:   0.5,
  fail:      0,
}

export interface TaskRewardsResult {
  coins: number
  exp: number
  items: string[]
}

/**
 * Returns scaled rewards based on task base rewards and achieved grade.
 */
export function calculateRewards(task: Task, grade: string): TaskRewardsResult {
  const multiplier = GRADE_MULTIPLIERS[grade] ?? 0

  const coins = Math.floor((task.rewards.coins ?? 0) * multiplier)
  const exp   = Math.floor((task.rewards.exp   ?? 0) * multiplier)

  // Items are granted only on partial+
  const items: string[] = (multiplier > 0 && task.rewards.items) ? [...task.rewards.items] : []

  return { coins, exp, items }
}
