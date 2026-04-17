export type GamePhase =
  | 'INIT' | 'LANDING' | 'ONBOARDING' | 'HOME'
  | 'TASK_CENTER' | 'TASK_EXECUTING' | 'TASK_RESULT'
  | 'TRAINING' | 'EXPLORING' | 'INVENTORY'
  | 'ACHIEVEMENT' | 'REWARD_CENTER' | 'EVENT_POPUP' | 'DAY_END' | 'SETTINGS'

export type PopupType = 'event' | 'task_result' | 'achievement' | 'day_end' | 'evolution' | 'confirm' | 'info'
export type PopupPriority = 'critical' | 'high' | 'normal' | 'low'

export interface PopupItem {
  id: string
  type: PopupType
  priority: PopupPriority
  data: unknown
}

export interface DaySummary {
  day: number
  tasksCompleted: number
  coinsEarned: number
  expEarned: number
  achievementsUnlocked: string[]
  statusChanges: Record<string, number>
  eventsSeen: number
}
