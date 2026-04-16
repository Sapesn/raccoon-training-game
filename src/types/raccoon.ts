export type StatusKey = 'hunger' | 'mood' | 'energy' | 'focus' | 'cleanliness' | 'trust'
export type SkillKey = 'dexterity' | 'understanding' | 'expression' | 'analysis' | 'creativity' | 'stability'
export type TraitId = string

export interface RaccoonStats {
  dexterity: number
  understanding: number
  expression: number
  analysis: number
  creativity: number
  stability: number
}

export interface Raccoon {
  name: string
  level: number
  hunger: number       // 0-100, higher = more hungry
  mood: number         // 0-100, higher = happier
  energy: number       // 0-100, higher = more energetic
  focus: number        // 0-100
  cleanliness: number  // 0-100
  trust: number        // 0-100
  traits: TraitId[]
  stats: RaccoonStats
  exp: number
  expToNext: number
}

export interface Trait {
  id: TraitId
  name: string
  emoji: string
  description: string
  statModifiers: Partial<RaccoonStats>
  taskCategoryBonus: Record<string, number>  // category -> success rate delta
  statusDecayModifiers: Partial<Record<StatusKey, number>>  // e.g. glutton: hunger decays faster
  flavorText: string
}
