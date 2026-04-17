/**
 * Evolution stages — 6 forms tied to raccoon level ranges.
 * Each stage has distinct visuals, expressions, and aura effects.
 */

export interface EvolutionStage {
  id: string
  name: string           // 形态名称, e.g. "职场小浣熊"
  title: string          // 职称, e.g. "办公助理"
  description: string    // flavor description
  minLevel: number       // inclusive
  maxLevel: number       // inclusive
  /** Base raccoon emoji for neutral expression */
  baseEmoji: string
  expressions: {
    trust_happy: string  // trust > 80 && mood > 70
    happy: string        // mood > 70
    neutral: string      // mood > 50
    sad: string          // mood > 30
    very_sad: string     // mood <= 30
  }
  /** Floating badge emoji shown top-right of avatar, null = none */
  badge: string | null
  /** CSS box-shadow string for the aura glow, null = no aura */
  aura: string | null
  /** Animation variant key */
  animStyle: 'gentle' | 'normal' | 'energetic' | 'majestic' | 'legendary'
  /** Tailwind color token for theming the evolution popup */
  themeFrom: string
  themeTo: string
  unlockMessage: string
}

export const EVOLUTION_STAGES: EvolutionStage[] = [
  {
    id: 'cub',
    name: '幼崽小浣熊',
    title: '懵懂新人',
    description: '刚刚入职的小浣熊，对研究所的一切都充满好奇，有时还会被文件绊倒。',
    minLevel: 1,
    maxLevel: 2,
    baseEmoji: '🦝',
    expressions: {
      trust_happy: '🦝✨',
      happy:       '🦝😊',
      neutral:     '🦝',
      sad:         '🦝😕',
      very_sad:    '🦝😢',
    },
    badge: null,
    aura: null,
    animStyle: 'gentle',
    themeFrom: '#fef3c7',
    themeTo: '#fde68a',
    unlockMessage: '小浣熊踏上了成长的旅程！',
  },
  {
    id: 'trainee',
    name: '见习小浣熊',
    title: '见习助理',
    description: '已经掌握基础技能，开始独立完成任务，偶尔还会在便利贴上画小动物。',
    minLevel: 3,
    maxLevel: 4,
    baseEmoji: '🦝',
    expressions: {
      trust_happy: '🦝🌿✨',
      happy:       '🦝🌿',
      neutral:     '🦝',
      sad:         '🦝😕',
      very_sad:    '🦝😢',
    },
    badge: '🌿',
    aura: '0 0 16px 4px rgba(134, 239, 172, 0.5)',
    animStyle: 'normal',
    themeFrom: '#d1fae5',
    themeTo: '#6ee7b7',
    unlockMessage: '小浣熊完成见习期，正式成为研究所助理！',
  },
  {
    id: 'office',
    name: '职场小浣熊',
    title: '办公助理',
    description: '已能独当一面，背着标志性小公文包穿梭于研究所各部门，是公认的得力助手。',
    minLevel: 5,
    maxLevel: 6,
    baseEmoji: '🦝',
    expressions: {
      trust_happy: '🦝💼✨',
      happy:       '🦝💼😊',
      neutral:     '🦝💼',
      sad:         '🦝😕',
      very_sad:    '🦝😢',
    },
    badge: '💼',
    aura: '0 0 22px 6px rgba(251, 191, 36, 0.55)',
    animStyle: 'normal',
    themeFrom: '#fef3c7',
    themeTo: '#f59e0b',
    unlockMessage: '小浣熊背起公文包，正式晋升职场达人！',
  },
  {
    id: 'senior',
    name: '资深小浣熊',
    title: '资深分析师',
    description: '经验丰富，头顶金色星章，各类复杂任务都能从容应对，是年轻助理们的榜样。',
    minLevel: 7,
    maxLevel: 8,
    baseEmoji: '🦝',
    expressions: {
      trust_happy: '🦝⭐✨',
      happy:       '🦝⭐😊',
      neutral:     '🦝⭐',
      sad:         '🦝😕',
      very_sad:    '🦝😢',
    },
    badge: '⭐',
    aura: '0 0 28px 8px rgba(99, 102, 241, 0.5)',
    animStyle: 'energetic',
    themeFrom: '#ede9fe',
    themeTo: '#8b5cf6',
    unlockMessage: '小浣熊头顶星章，晋升资深分析师！',
  },
  {
    id: 'elite',
    name: '精英小浣熊',
    title: '首席研究员',
    description: '已臻精英境界，散发着神秘金芒，令同事们心生敬仰，连所长都要请教它的意见。',
    minLevel: 9,
    maxLevel: 9,
    baseEmoji: '🦝',
    expressions: {
      trust_happy: '🌟🦝🌟',
      happy:       '🦝🌟😊',
      neutral:     '🦝🌟',
      sad:         '🦝😕',
      very_sad:    '🦝😢',
    },
    badge: '🌟',
    aura: '0 0 36px 10px rgba(245, 158, 11, 0.7), 0 0 60px 16px rgba(251, 191, 36, 0.3)',
    animStyle: 'majestic',
    themeFrom: '#fffbeb',
    themeTo: '#f59e0b',
    unlockMessage: '小浣熊金芒乍现，晋升首席研究员！',
  },
  {
    id: 'legend',
    name: '传说小浣熊',
    title: '传说级助理',
    description: '已超越常规，头戴神圣王冠，是野生动物研究所有史以来最伟大的助理。传说永不落幕。',
    minLevel: 10,
    maxLevel: 10,
    baseEmoji: '🦝',
    expressions: {
      trust_happy: '👑🦝✨✨',
      happy:       '👑🦝😊',
      neutral:     '👑🦝',
      sad:         '🦝👑',
      very_sad:    '🦝😢',
    },
    badge: '👑',
    aura: '0 0 40px 12px rgba(239, 68, 68, 0.4), 0 0 70px 20px rgba(245, 158, 11, 0.4), 0 0 90px 28px rgba(99, 102, 241, 0.3)',
    animStyle: 'legendary',
    themeFrom: '#1e1b4b',
    themeTo: '#7c3aed',
    unlockMessage: '传说降临！小浣熊达到了最终形态！',
  },
]

/** Returns the evolution stage for a given raccoon level. */
export function getStageForLevel(level: number): EvolutionStage {
  for (const stage of EVOLUTION_STAGES) {
    if (level >= stage.minLevel && level <= stage.maxLevel) return stage
  }
  return EVOLUTION_STAGES[EVOLUTION_STAGES.length - 1]
}

/**
 * Returns the level at which the next evolution happens,
 * or null if already at max stage.
 */
export function nextEvolutionLevel(currentLevel: number): number | null {
  for (const stage of EVOLUTION_STAGES) {
    if (stage.minLevel > currentLevel) return stage.minLevel
  }
  return null
}

/** Set of levels that trigger an evolution (crossing into a new stage). */
export const EVOLUTION_THRESHOLDS = new Set(
  EVOLUTION_STAGES.slice(1).map(s => s.minLevel),
) // {3, 5, 7, 9, 10}
