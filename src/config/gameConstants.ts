export const AP_COSTS = {
  FEED: 1, PLAY: 1, GROOM: 1, REST: 1,
  TRAIN_BASIC: 2, TRAIN_ADVANCED: 3,
  EXECUTE_TASK_NORMAL: 2, EXECUTE_TASK_HARD: 3,
  EXPLORE: 2, FIX_ERROR: 1, SOCIAL: 1,
} as const

export const STATUS_DECAY_PER_DAY: Record<string, number> = {
  hunger: 15, mood: 10, energy: 12, focus: 8, cleanliness: 10, trust: 3,
}

export const STATUS_THRESHOLDS = {
  CRITICAL: 20, LOW: 40, HIGH: 80, MAX: 100,
} as const

export const DIFFICULTY_PENALTY: Record<string, number> = {
  E: 0, D: 5, C: 10, B: 15, A: 20, S: 30, SS: 45,
}

export const DIFFICULTY_AP_MODIFIER: Record<string, number> = {
  E: 0, D: 0, C: 0, B: 1, A: 1, S: 1, SS: 1,
}

export const LEVEL_EXP_TABLE = [0, 100, 250, 500, 900, 1500, 2400, 3700, 5500, 8000, 12000]

export const MAX_AP = 6
export const PROFICIENCY_GAIN_SUCCESS = 4  // per use
export const PROFICIENCY_GAIN_FAIL = 1
export const PROFICIENCY_MAX_AP_REDUCTION_THRESHOLD = 100

export const TASK_GRADE_THRESHOLDS = {
  perfect: 90,
  excellent: 75,
  good: 60,
  partial: 40,
} as const

export const OUTPUT_SCORE_WEIGHTS = {
  accuracy: 0.35,
  completeness: 0.25,
  expression: 0.20,
  timeliness: 0.10,
  stability: 0.10,
} as const

export const INITIAL_RACCOON_STATS = {
  hunger: 70, mood: 70, energy: 80, focus: 60, cleanliness: 75, trust: 20,
}

export const INITIAL_RACCOON_SKILLS = {
  dexterity: 10, understanding: 10, expression: 10,
  analysis: 10, creativity: 10, stability: 10,
}
