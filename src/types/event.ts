export type EventType = 'positive' | 'negative' | 'neutral' | 'special' | 'hidden_reward'
export type EventTriggerType = 'status_threshold' | 'consecutive_action' | 'achievement' | 'time_based' | 'random_daily'

export interface EventTriggerCondition {
  type: EventTriggerType
  statusKey?: string
  threshold?: number
  thresholdOp?: 'lt' | 'gt' | 'lte' | 'gte'
  actionType?: string
  consecutiveCount?: number
  achievementId?: string
  dayNumber?: number
  probability?: number   // 0-1, for random events
}

export interface EventChoice {
  id: string
  label: string
  effects: EventEffects
  requiresItem?: string
}

export interface EventEffects {
  hunger?: number
  mood?: number
  energy?: number
  focus?: number
  cleanliness?: number
  trust?: number
  coins?: number
  exp?: number
  // Temporary skill/stat bonuses granted by events
  dexterity?: number
  understanding?: number
  expression?: number
  analysis?: number
  creativity?: number
  stability?: number
  items?: string[]
  triggerEvent?: string
}

export interface GameEvent {
  id: string
  title: string
  description: string
  type: EventType
  emoji: string
  triggerCondition: EventTriggerCondition
  choices?: EventChoice[]   // if undefined, just an "OK" button
  defaultEffects: EventEffects
  canRepeat: boolean
  repeatCooldownDays?: number
}

export interface ActiveEvent {
  eventId: string
  triggeredAt: string
  dismissed: boolean
}
