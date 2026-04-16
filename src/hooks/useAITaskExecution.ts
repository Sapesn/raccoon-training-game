/**
 * useAITaskExecution — drives the async AI task execution state machine.
 * Flow: preview → loading_options → choosing → ai_executing → result
 */

import { useState, useCallback } from 'react'
import { useGameStore } from '../store/useGameStore'
import { executeTaskWithAI, generateTaskOptions } from '../services/llmService'
import type { TaskOption } from '../services/llmService'
import type { Task, TaskResult, ExecutionParams } from '../types/task'

export type AIExecStep = 'preview' | 'loading_options' | 'choosing' | 'ai_executing' | 'result'

export interface AIExecState {
  step: AIExecStep
  options: TaskOption[]
  streamingText: string
  isStreaming: boolean
  error: string | null
  result: TaskResult | null
  aiOutput: string | null
}

const INITIAL_STATE: AIExecState = {
  step: 'preview',
  options: [],
  streamingText: '',
  isStreaming: false,
  error: null,
  result: null,
  aiOutput: null,
}

export function useAITaskExecution(task: Task) {
  const store = useGameStore()
  const [state, setState] = useState<AIExecState>(INITIAL_STATE)

  /** Load AI-generated options so user can choose an approach */
  const loadOptions = useCallback(async () => {
    setState(prev => ({ ...prev, step: 'loading_options', error: null }))
    const options = await generateTaskOptions(task, store.raccoon)
    setState(prev => ({
      ...prev,
      step: 'choosing',
      options,
    }))
  }, [task, store.raccoon])

  /** Execute with user's chosen answer */
  const run = useCallback(async (params: Omit<ExecutionParams, 'aiScoreOverride'>, userChoice: string) => {
    if (store.currentAP < task.apCost) return

    setState(prev => ({ ...INITIAL_STATE, step: 'ai_executing', isStreaming: true, options: prev.options }))

    let aiOutput = ''
    let aiScore: number | undefined

    try {
      const execResult = await executeTaskWithAI(
        task,
        store.raccoon,
        (chunk) => {
          aiOutput += chunk
          setState(prev => ({ ...prev, streamingText: prev.streamingText + chunk }))
        },
        userChoice,
      )
      aiOutput = execResult.output
      aiScore  = execResult.aiScore
    } catch (err) {
      console.warn('[useAITaskExecution] AI call failed, falling back to dice roll', err)
    }

    try {
      const result = store.executeTask({ ...params, aiScoreOverride: aiScore })
      const enrichedResult: TaskResult = { ...result, aiOutput: aiOutput || undefined, aiScore }

      store.pushTaskHistory({
        id:             `hist_${Date.now()}`,
        taskId:         task.id,
        taskName:       task.name,
        taskCategory:   task.category,
        taskDifficulty: task.difficulty,
        grade:          result.grade,
        score:          enrichedResult.score,
        coinsEarned:    result.coinsEarned,
        expEarned:      result.expEarned,
        aiOutput:       aiOutput || undefined,
        aiScore,
        completedAt:    new Date().toISOString(),
        gameDay:        store.gameDay,
      })

      setState({
        step: 'result',
        options: [],
        streamingText: aiOutput,
        isStreaming: false,
        error: null,
        result: enrichedResult,
        aiOutput: aiOutput || null,
      })
    } catch {
      setState(prev => ({
        ...prev,
        step: 'preview',
        isStreaming: false,
        error: '行动点不足或执行失败',
      }))
    }
  }, [task, store])

  const reset = useCallback(() => setState(INITIAL_STATE), [])

  return { state, loadOptions, run, reset }
}
