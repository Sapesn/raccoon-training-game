/**
 * useTaskExecution — preview success rates and execute tasks.
 */

import { useGameStore } from '../store/useGameStore'
import type { Task } from '../types/task'
import type { ExecutionParams } from '../types/task'
import type { TaskResult } from '../types/task'
import { calculateSuccessRate, getTraitModifier, type SuccessRateBreakdown } from '../utils/taskFormula'
import { ITEMS } from '../config/items'

export interface ExecutionPreview {
  breakdown: SuccessRateBreakdown
  apCost: number
  canAffordAP: boolean
}

export function useTaskExecution() {
  const store = useGameStore()

  /**
   * Calculates a success-rate preview for display before committing.
   */
  const prepareExecution = (
    task: Task,
    templateId?: string,
    itemIds: string[] = [],
  ): ExecutionPreview => {
    const template = templateId
      ? store.templates.find(t => t.id === templateId)
      : undefined

    const itemBonuses = itemIds.reduce((sum, id) => {
      const item = ITEMS.find(i => i.id === id)
      return sum + (item?.effects.successRateBonus ?? 0)
    }, 0)

    const traitModifier = getTraitModifier(store.raccoon, task.category)

    const breakdown = calculateSuccessRate({
      task,
      raccoon: store.raccoon,
      template,
      itemBonuses,
      traitModifier,
    })

    const apCost = task.apCost
    const canAffordAP = store.currentAP >= apCost

    return { breakdown, apCost, canAffordAP }
  }

  /**
   * Executes the task, pushes a result popup, fires post-task events.
   */
  const execute = (params: ExecutionParams): TaskResult => {
    const result = store.executeTask(params)

    store.pushPopup({
      type: 'task_result',
      priority: 'high',
      data: result,
    })

    store.checkAndTriggerEvents('task_complete', {
      taskId: params.taskId,
      success: result.success,
    })

    return result
  }

  return {
    prepareExecution,
    execute,
    lastResult: store.lastTaskResult,
  }
}
