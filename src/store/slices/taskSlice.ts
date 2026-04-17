/**
 * Task slice: daily task pool, execution, result storage, statistics.
 * Supports AI-generated dynamic tasks and AI score blending.
 */

import type { StateCreator } from 'zustand'
import type { Task, TaskResult, ExecutionParams, TaskDifficulty } from '../../types/task'
import type { Template } from '../../types/template'
import { TASKS, PERMANENT_TASKS } from '../../config/tasks'
import { ITEMS } from '../../config/items'
import { AP_COSTS, DIFFICULTY_AP_MODIFIER } from '../../config/gameConstants'
import {
  calculateSuccessRate,
  executeTask as executeTaskRoll,
  calculateRewards,
  getTraitModifier,
} from '../../utils/taskFormula'
import { clampStatus } from '../../utils/statusUtils'
import { pickRandom } from '../../utils/randomUtils'
import { calculateProficiencyGain } from '../../utils/templateUtils'
import { generateDynamicTasks } from '../../services/llmService'
import type { GamePhaseSlice } from './gamePhaseSlice'
import type { PlayerSlice } from './playerSlice'
import type { RaccoonSlice } from './raccoonSlice'
import type { TemplateSlice } from './templateSlice'

export interface TaskStats {
  byDifficulty: Record<TaskDifficulty, number>
  byCategory: Record<string, number>
  perfectCount: number
  excellentCount: number
  consecutiveSuccessCount: number
  consecutiveFailCount: number
}

const DEFAULT_TASK_STATS: TaskStats = {
  byDifficulty: { E: 0, D: 0, C: 0, B: 0, A: 0, S: 0, SS: 0 },
  byCategory: {},
  perfectCount: 0,
  excellentCount: 0,
  consecutiveSuccessCount: 0,
  consecutiveFailCount: 0,
}

export interface TaskHistoryEntry {
  id: string                // unique per record
  taskId: string
  taskName: string
  taskCategory: string
  taskDifficulty: string
  grade: TaskResult['grade']
  score: number
  coinsEarned: number
  expEarned: number
  aiOutput?: string
  aiScore?: number
  completedAt: string       // ISO date string
  gameDay: number
}

const MAX_HISTORY = 30     // keep last 30 entries

export interface TaskSlice {
  availableTasks: Task[]
  dynamicTasks: Task[]
  isGeneratingTasks: boolean
  completedTodayTaskIds: string[]
  totalCompletedTaskCount: number
  lastTaskResult: TaskResult | null
  taskStats: TaskStats
  taskHistory: TaskHistoryEntry[]

  refreshDailyTasks: () => void
  addDynamicTasks: (tasks: Task[]) => void
  clearDynamicTasks: () => void
  generateDynamicTasksIfNeeded: () => Promise<void>
  forceGenerateDynamicTasks: () => Promise<void>
  executeTask: (params: ExecutionParams) => TaskResult
  pushTaskHistory: (entry: TaskHistoryEntry) => void
  clearLastResult: () => void
}

// Combined store type for cross-slice access
type CombinedStore = TaskSlice & GamePhaseSlice & PlayerSlice & RaccoonSlice & TemplateSlice

const DAILY_TASK_COUNT = 9   // pick 9 tasks from the daily pool

export const createTaskSlice: StateCreator<
  CombinedStore,
  [['zustand/immer', never]],
  [],
  TaskSlice
> = (set, get) => ({
  availableTasks: [],
  dynamicTasks: [],
  isGeneratingTasks: false,
  completedTodayTaskIds: [],
  totalCompletedTaskCount: 0,
  lastTaskResult: null,
  taskStats: { ...DEFAULT_TASK_STATS },
  taskHistory: [],

  refreshDailyTasks: () => {
    const dailyPool = TASKS.filter(t => t.type === 'daily' || t.type === 'commission')
    const shuffled = [...dailyPool].sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, DAILY_TASK_COUNT)
    set((state) => {
      // Keep dynamic tasks across daily refresh, reset daily completions
      state.availableTasks = [...PERMANENT_TASKS, ...picked]
      state.completedTodayTaskIds = []
    })
  },

  addDynamicTasks: (tasks) => {
    set((state) => {
      const existingIds = new Set([
        ...state.availableTasks.map(t => t.id),
        ...state.dynamicTasks.map(t => t.id),
      ])
      const fresh = tasks.filter(t => !existingIds.has(t.id))
      state.dynamicTasks = [...state.dynamicTasks, ...fresh]
    })
  },

  clearDynamicTasks: () => {
    set((state) => {
      state.dynamicTasks = []
    })
  },

  generateDynamicTasksIfNeeded: async () => {
    const store = get()
    // Only count existing dynamic tasks — static daily tasks don't block generation
    if (store.dynamicTasks.length >= 5 || store.isGeneratingTasks) return

    set((state) => { state.isGeneratingTasks = true })
    try {
      const allIds = [
        ...store.availableTasks.map(t => t.id),
        ...store.dynamicTasks.map(t => t.id),
      ]
      const newTasks = await generateDynamicTasks(store.raccoon, allIds, 5)
      if (newTasks.length > 0) {
        get().addDynamicTasks(newTasks)
      }
    } catch (err) {
      console.warn('[taskSlice] generateDynamicTasksIfNeeded failed:', err)
    } finally {
      set((state) => { state.isGeneratingTasks = false })
    }
  },

  forceGenerateDynamicTasks: async () => {
    const store = get()
    if (store.isGeneratingTasks) return

    set((state) => { state.isGeneratingTasks = true })
    try {
      const allIds = [
        ...store.availableTasks.map(t => t.id),
        ...store.dynamicTasks.map(t => t.id),
      ]
      const newTasks = await generateDynamicTasks(store.raccoon, allIds, 5)
      if (newTasks.length > 0) {
        get().addDynamicTasks(newTasks)
      }
    } catch (err) {
      console.warn('[taskSlice] forceGenerateDynamicTasks failed:', err)
    } finally {
      set((state) => { state.isGeneratingTasks = false })
    }
  },

  executeTask: (params: ExecutionParams): TaskResult => {
    const store = get()
    const { taskId, templateId, itemIds, isDecomposed, aiScoreOverride } = params

    // Look up task in all sources
    const task = [...TASKS, ...PERMANENT_TASKS, ...store.dynamicTasks].find(t => t.id === taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    // Determine AP cost
    const difficultyModifier = DIFFICULTY_AP_MODIFIER[task.difficulty] ?? 0
    let apCost = task.apCost + difficultyModifier
    if (isDecomposed) apCost = Math.ceil(apCost * 1.5)

    const apSpent = store.spendAP(apCost)
    if (!apSpent) {
      throw new Error('Insufficient AP')
    }

    // Gather item bonuses
    let itemBonusTotal = 0
    const itemsUsed: string[] = []
    for (const itemId of itemIds) {
      const itemData = ITEMS.find(i => i.id === itemId)
      if (itemData?.effects.successRateBonus) {
        itemBonusTotal += itemData.effects.successRateBonus
        itemsUsed.push(itemId)
      }
    }

    const template: Template | undefined = templateId
      ? store.templates.find(t => t.id === templateId)
      : undefined

    const traitModifier = getTraitModifier(store.raccoon, task.category)

    const rateBreakdown = calculateSuccessRate({
      task,
      raccoon: store.raccoon,
      template,
      itemBonuses: itemBonusTotal,
      traitModifier,
    })

    const rollResult = executeTaskRoll(rateBreakdown.finalRate, store.raccoon)

    // Blend AI score if provided (60% AI, 40% dice)
    const blendedScore = aiScoreOverride !== undefined
      ? Math.round(rollResult.finalScore * 0.4 + aiScoreOverride * 0.6)
      : rollResult.finalScore

    const rewards = calculateRewards(task, rollResult.grade)

    const statusChanges: Record<string, number> = {}
    if (rollResult.success) {
      statusChanges.mood = 10
      statusChanges.trust = rollResult.grade === 'perfect' ? 8 : rollResult.grade === 'excellent' ? 5 : 3
    } else {
      statusChanges.mood  = task.penalties.mood  ?? -10
      statusChanges.trust = task.penalties.trust ?? -5
    }
    statusChanges.energy = -(apCost * 5)
    statusChanges.focus  = rollResult.success ? -5 : -10

    const result: TaskResult = {
      taskId,
      success: rollResult.success,
      grade: rollResult.grade,
      score: blendedScore,
      scoreBreakdown: rollResult.scoreBreakdown,
      coinsEarned: rewards.coins,
      expEarned: rewards.exp,
      itemsEarned: rewards.items,
      statusChanges,
      roll: rollResult.roll,
      variance: rollResult.variance,
      aiScore: aiScoreOverride,
    }

    set((state) => {
      if (!state.completedTodayTaskIds.includes(taskId)) {
        state.completedTodayTaskIds.push(taskId)
      }
      state.totalCompletedTaskCount += 1
      state.lastTaskResult = result

      state.taskStats.byDifficulty[task.difficulty] =
        (state.taskStats.byDifficulty[task.difficulty] ?? 0) + 1
      state.taskStats.byCategory[task.category] =
        (state.taskStats.byCategory[task.category] ?? 0) + 1

      if (rollResult.grade === 'perfect')   state.taskStats.perfectCount += 1
      if (rollResult.grade === 'excellent') state.taskStats.excellentCount += 1

      if (rollResult.success) {
        state.taskStats.consecutiveSuccessCount += 1
        state.taskStats.consecutiveFailCount = 0
      } else {
        state.taskStats.consecutiveFailCount += 1
        state.taskStats.consecutiveSuccessCount = 0
      }

      for (const [key, delta] of Object.entries(statusChanges)) {
        if (key in state.raccoon) {
          const raccoonRecord = state.raccoon as unknown as Record<string, number>
          raccoonRecord[key] = clampStatus((raccoonRecord[key] ?? 0) + delta)
        }
      }

      if (rewards.coins > 0) state.player.coins += rewards.coins
      if (rewards.exp > 0)   state.player.exp   += rewards.exp

      // Remove used dynamic task after completion (not repeatable)
      if (!task.isRepeatable && task.isDynamic) {
        state.dynamicTasks = state.dynamicTasks.filter(t => t.id !== taskId)
      }
    })

    // Raccoon gains EXP from task completion (handles level-up + evolution popup)
    if (rewards.exp > 0) get().gainExp(Math.ceil(rewards.exp * 0.6))

    if (template) {
      store.useTemplate(template.id, rollResult.success)
    }

    return result
  },

  pushTaskHistory: (entry) => {
    set((state) => {
      state.taskHistory.unshift(entry)          // newest first
      if (state.taskHistory.length > MAX_HISTORY) {
        state.taskHistory.length = MAX_HISTORY  // trim oldest
      }
    })
  },

  clearLastResult: () => {
    set((state) => {
      state.lastTaskResult = null
    })
  },
})
