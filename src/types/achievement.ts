export type AchievementCategory = 'progression' | 'task_master' | 'raccoon_bonds' | 'collector' | 'template_expert' | 'hidden'

export interface AchievementCondition {
  type: string
  // various condition fields
  count?: number
  level?: number
  statusKey?: string
  statusValue?: number
  taskCategory?: string
  taskDifficulty?: string
  itemType?: string
  consecutive?: number
  templateId?: string
  traitId?: string
  dayCount?: number
}

export interface AchievementRewards {
  coins?: number
  exp?: number
  rewardTickets?: number
  items?: string[]
  realRewardEligible?: boolean
  unlockContent?: string  // e.g. special trait, hidden template
}

export interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  category: AchievementCategory
  hidden: boolean
  conditions: AchievementCondition[]  // all must be met
  rewards: AchievementRewards
  claimed: boolean
  unlockedAt?: string
  progress?: number   // 0-100 for trackable achievements
}
