/**
 * Achievement checking and progress utilities.
 */

import type { Achievement, AchievementCondition } from '../types/achievement'
import type { Raccoon } from '../types/raccoon'
import type { Player } from '../types/player'
import type { TaskDifficulty } from '../types/task'
import { getTodayString } from './dateUtils'

// ---------------------------------------------------------------------------
// Game-state shape expected by achievement checkers
// ---------------------------------------------------------------------------

export interface AchievementGameState {
  player: Player
  raccoon: Raccoon
  totalCompletedTaskCount: number
  taskStats: {
    byDifficulty: Record<TaskDifficulty, number>
    byCategory: Record<string, number>
    perfectCount: number
    excellentCount: number
    consecutiveSuccessCount: number
    consecutiveFailCount: number
  }
  templates: Array<{ proficiency: number; level: number }>
  inventory: {
    collectedFoodIds: string[]
    collectedItemIds: string[]
  }
  triggeredEventIds: string[]
  achievements: Achievement[]
}

// ---------------------------------------------------------------------------
// Single condition checker
// ---------------------------------------------------------------------------

function checkCondition(
  condition: AchievementCondition,
  state: AchievementGameState,
): boolean {
  const { type } = condition

  switch (type) {
    case 'tasks_completed':
      return state.totalCompletedTaskCount >= (condition.count ?? 0)

    case 'raccoon_level':
      return state.raccoon.level >= (condition.level ?? 0)

    case 'player_level':
      return state.player.level >= (condition.level ?? 0)

    case 'raccoon_status': {
      if (!condition.statusKey || condition.statusValue === undefined) return false
      const value = (state.raccoon as unknown as Record<string, number>)[condition.statusKey]
      return typeof value === 'number' && value >= condition.statusValue
    }

    case 'tasks_by_difficulty':
      if (!condition.taskDifficulty) return false
      return (
        (state.taskStats.byDifficulty[condition.taskDifficulty as TaskDifficulty] ?? 0) >=
        (condition.count ?? 0)
      )

    case 'tasks_by_category':
      if (!condition.taskCategory) return false
      return (
        (state.taskStats.byCategory[condition.taskCategory] ?? 0) >= (condition.count ?? 0)
      )

    case 'perfect_tasks':
      return state.taskStats.perfectCount >= (condition.count ?? 0)

    case 'excellent_tasks':
      return state.taskStats.excellentCount >= (condition.count ?? 0)

    case 'consecutive_success':
      return state.taskStats.consecutiveSuccessCount >= (condition.consecutive ?? 0)

    case 'template_proficiency':
      return state.templates.some(t => t.proficiency >= (condition.count ?? 100))

    case 'template_count':
      return state.templates.length >= (condition.count ?? 0)

    case 'food_collected':
      return state.inventory.collectedFoodIds.length >= (condition.count ?? 0)

    case 'item_collected':
      return state.inventory.collectedItemIds.length >= (condition.count ?? 0)

    case 'days_played':
      return state.player.totalDaysPlayed >= (condition.dayCount ?? 0)

    case 'login_streak':
      return state.player.loginStreak >= (condition.consecutive ?? condition.count ?? 0)

    case 'trust_level':
      return state.raccoon.trust >= (condition.statusValue ?? 0)

    case 'coins_total':
      return state.player.coins >= (condition.count ?? 0)

    default:
      return false
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Checks all achievements against the current game state.
 * Returns the ids of achievements that are newly unlocked (not previously claimed/unlocked).
 */
export function checkAchievements(
  gameState: AchievementGameState,
  achievements: Achievement[],
): string[] {
  const newlyUnlocked: string[] = []

  for (const ach of achievements) {
    if (ach.unlockedAt) continue  // already unlocked
    if (ach.conditions.length === 0) continue  // no conditions = never auto-unlock

    const allMet = ach.conditions.every(c => checkCondition(c, gameState))
    if (allMet) {
      newlyUnlocked.push(ach.id)
    }
  }

  return newlyUnlocked
}

/**
 * Returns a 0-100 progress value for a single achievement.
 * Uses the first trackable condition (one with a numeric target).
 */
export function getAchievementProgress(
  achievement: Achievement,
  gameState: AchievementGameState,
): number {
  if (achievement.unlockedAt) return 100

  // Find the first numeric condition and compute progress ratio
  for (const condition of achievement.conditions) {
    const target = condition.count ?? condition.level ?? condition.statusValue ?? condition.dayCount ?? condition.consecutive
    if (target === undefined || target === 0) continue

    let current = 0

    switch (condition.type) {
      case 'tasks_completed':           current = gameState.totalCompletedTaskCount; break
      case 'raccoon_level':             current = gameState.raccoon.level; break
      case 'player_level':              current = gameState.player.level; break
      case 'perfect_tasks':             current = gameState.taskStats.perfectCount; break
      case 'excellent_tasks':           current = gameState.taskStats.excellentCount; break
      case 'consecutive_success':       current = gameState.taskStats.consecutiveSuccessCount; break
      case 'template_count':            current = gameState.templates.length; break
      case 'food_collected':            current = gameState.inventory.collectedFoodIds.length; break
      case 'item_collected':            current = gameState.inventory.collectedItemIds.length; break
      case 'days_played':               current = gameState.player.totalDaysPlayed; break
      case 'login_streak':              current = gameState.player.loginStreak; break
      case 'trust_level':               current = gameState.raccoon.trust; break
      case 'coins_total':               current = gameState.player.coins; break
      case 'tasks_by_difficulty':
        current = condition.taskDifficulty
          ? (gameState.taskStats.byDifficulty[condition.taskDifficulty as TaskDifficulty] ?? 0)
          : 0
        break
      case 'tasks_by_category':
        current = condition.taskCategory
          ? (gameState.taskStats.byCategory[condition.taskCategory] ?? 0)
          : 0
        break
    }

    return Math.min(100, Math.floor((current / target) * 100))
  }

  return 0
}

/** Returns a human-readable Chinese description of an achievement condition. */
export function formatConditionText(condition: AchievementCondition): string {
  const n = condition.count ?? condition.level ?? condition.statusValue ?? condition.dayCount ?? condition.consecutive ?? 0

  switch (condition.type) {
    case 'tasks_completed':       return `完成 ${n} 个任务`
    case 'raccoon_level':         return `小浣熊达到 ${n} 级`
    case 'player_level':          return `玩家达到 ${n} 级`
    case 'raccoon_status':        return `${condition.statusKey} 达到 ${condition.statusValue}`
    case 'tasks_by_difficulty':   return `完成 ${n} 个 ${condition.taskDifficulty} 难度任务`
    case 'tasks_by_category':     return `完成 ${n} 个 ${condition.taskCategory} 类型任务`
    case 'perfect_tasks':         return `获得 ${n} 次完美评级`
    case 'excellent_tasks':       return `获得 ${n} 次优秀评级`
    case 'consecutive_success':   return `连续成功 ${n} 次`
    case 'template_proficiency':  return `模板熟练度达到 ${n}`
    case 'template_count':        return `拥有 ${n} 个模板`
    case 'food_collected':        return `收集 ${n} 种食物`
    case 'item_collected':        return `收集 ${n} 种道具`
    case 'days_played':           return `游玩 ${n} 天`
    case 'login_streak':          return `连续登录 ${n} 天`
    case 'trust_level':           return `信任度达到 ${n}`
    case 'coins_total':           return `积累 ${n} 金币`
    default:                      return `满足条件: ${condition.type}`
  }
}

// Re-export for convenience
export { getTodayString }
