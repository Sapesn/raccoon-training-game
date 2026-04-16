export type TaskDifficulty = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS'
export type TaskUrgency = 'low' | 'normal' | 'urgent' | 'immediate'
export type TaskCategory = 'writing' | 'analysis' | 'creative' | 'research' | 'planning' | 'communication' | 'data' | 'social'
export type TaskType = 'daily' | 'commission' | 'activity' | 'achievement_task' | 'special' | 'permanent'

export interface TaskRewards {
  coins: number
  exp: number
  researchPoints?: number
  rewardTickets?: number
  items?: string[]  // itemId[]
}

export interface TaskPenalties {
  mood?: number
  trust?: number
  coins?: number
}

import { SkillKey } from './raccoon'

export interface Task {
  id: string
  name: string
  description: string
  flavorText: string
  type: TaskType
  category: TaskCategory
  difficulty: TaskDifficulty
  urgency: TaskUrgency
  baseSuccessRate: number
  apCost: number
  recommendedStats: SkillKey[]
  recommendedTemplates: string[]  // template ids
  supportsDecompose: boolean
  decomposedSteps?: string[]
  rewards: TaskRewards
  penalties: TaskPenalties
  unlockCondition?: string
  isRepeatable?: boolean
  isDynamic?: boolean  // true = AI-generated at runtime
}

export interface SubTask {
  id: string
  parentTaskId: string
  name: string
  apCost: number
  successRate: number
  order: number
}

export interface TaskResult {
  taskId: string
  success: boolean
  grade: 'fail' | 'partial' | 'good' | 'excellent' | 'perfect'
  score: number  // 0-100
  scoreBreakdown: {
    accuracy: number
    completeness: number
    expression: number
    timeliness: number
    stability: number
  }
  coinsEarned: number
  expEarned: number
  itemsEarned: string[]
  statusChanges: Record<string, number>
  templateSuggestion?: string
  roll: number
  variance: number
  aiOutput?: string   // work product produced by LLM
  aiScore?: number    // LLM self-evaluation 0-100
}

export interface ExecutionParams {
  taskId: string
  templateId?: string
  itemIds: string[]
  isDecomposed: boolean
  aiScoreOverride?: number  // blended into final score when AI execution is used
}
