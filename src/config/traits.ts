import { Trait } from '../types/raccoon'

export const TRAITS: Trait[] = [
  {
    id: 'greedy',
    name: '贪吃',
    emoji: '🍖',
    description: '对食物有超乎寻常的热情，吃东西速度极快，饱腹感消退也特别快。',
    statModifiers: {
      dexterity: 2,
      stability: -1,
    },
    taskCategoryBonus: {
      data: 3,
      analysis: -2,
    },
    statusDecayModifiers: {
      hunger: 8,   // hunger decays faster (+8 per day on top of base)
      mood: 2,
    },
    flavorText: '只要有好吃的，什么困难都能克服——至少小浣熊是这么认为的。',
  },
  {
    id: 'curious',
    name: '好奇',
    emoji: '🔍',
    description: '对未知事物充满好奇，喜欢探索新领域，但有时会因为分心而忘记手头的工作。',
    statModifiers: {
      understanding: 4,
      creativity: 3,
      stability: -2,
    },
    taskCategoryBonus: {
      research: 8,
      creative: 5,
      data: -3,
    },
    statusDecayModifiers: {
      focus: 3,   // focus decays slightly faster due to distraction
      energy: -1,
    },
    flavorText: '世界上有那么多有趣的事情，怎么可能专心做一件呢？',
  },
  {
    id: 'diligent',
    name: '认真',
    emoji: '📋',
    description: '做任何事情都一丝不苟，对细节极其敏感，输出质量稳定且高。',
    statModifiers: {
      analysis: 3,
      stability: 4,
      creativity: -1,
    },
    taskCategoryBonus: {
      planning: 8,
      writing: 6,
      analysis: 5,
      social: -2,
    },
    statusDecayModifiers: {
      energy: 3,   // burns more energy due to thoroughness
      focus: -2,
    },
    flavorText: '如果值得做，就值得做好。小浣熊总是把文件整理得整整齐齐。',
  },
  {
    id: 'lazy',
    name: '慵懒',
    emoji: '😴',
    description: '精力恢复特别快，但启动困难，AP成本略有上升。在舒适状态下工作效率反而最高。',
    statModifiers: {
      stability: 3,
      dexterity: -2,
      understanding: -1,
    },
    taskCategoryBonus: {
      writing: 3,
      planning: -4,
      research: -3,
    },
    statusDecayModifiers: {
      energy: -5,   // energy decays slower (recovers well)
      mood: -2,
    },
    flavorText: '能躺着绝不坐着，能坐着绝不站着——但躺着想出来的方案，说不定最省力。',
  },
  {
    id: 'genius',
    name: '天才',
    emoji: '🧠',
    description: '智力超群，理解和分析能力远超同类，对复杂任务有天生的直觉。',
    statModifiers: {
      understanding: 6,
      analysis: 5,
      creativity: 4,
      stability: -3,
    },
    taskCategoryBonus: {
      analysis: 10,
      research: 8,
      creative: 6,
      communication: -4,
    },
    statusDecayModifiers: {
      focus: -3,   // focus decays slower
      mood: 2,     // gets bored easily, mood decays faster
    },
    flavorText: '普通问题对它来说太简单，但偶尔会因为想得太多而走神。',
  },
  {
    id: 'artistic',
    name: '艺术家',
    emoji: '🎨',
    description: '拥有卓越的表达能力和审美，创意工作尤为出色，但对枯燥数据不感兴趣。',
    statModifiers: {
      expression: 6,
      creativity: 5,
      analysis: -3,
    },
    taskCategoryBonus: {
      creative: 12,
      writing: 7,
      communication: 5,
      data: -6,
      planning: -3,
    },
    statusDecayModifiers: {
      mood: 2,    // mood swings more
      cleanliness: 2,
    },
    flavorText: '它的报告总是附带精心手绘的配图，尽管没人要求这么做。',
  },
  {
    id: 'social',
    name: '社交达人',
    emoji: '💬',
    description: '天生擅长与人沟通，信任度提升更快，在需要协作的任务中表现优异。',
    statModifiers: {
      expression: 4,
      stability: 2,
      analysis: -1,
    },
    taskCategoryBonus: {
      communication: 10,
      social: 12,
      writing: 4,
      data: -5,
    },
    statusDecayModifiers: {
      trust: -4,   // trust decays slower
      mood: -3,    // mood maintained better through interaction
    },
    flavorText: '它认识工作区里所有人的名字，包括那株绿萝。',
  },
  {
    id: 'perfectionist',
    name: '完美主义',
    emoji: '✨',
    description: '追求极致品质，完美分数大幅提升，但能量消耗也更多，心情波动较大。',
    statModifiers: {
      stability: 5,
      expression: 3,
      understanding: 2,
      creativity: -2,
    },
    taskCategoryBonus: {
      writing: 10,
      planning: 8,
      analysis: 6,
      social: -5,
    },
    statusDecayModifiers: {
      energy: 5,    // burns more energy
      mood: 4,      // mood drops faster when output isn't perfect
      focus: -3,
    },
    flavorText: '它提交报告前会检查七遍，然后再检查一遍确保没有检查错误。',
  },
  {
    id: 'adventurous',
    name: '冒险家',
    emoji: '🗺️',
    description: '喜欢尝试新事物，探索任务奖励翻倍，对未知挑战充满干劲，稳定性略低。',
    statModifiers: {
      dexterity: 4,
      creativity: 3,
      stability: -4,
    },
    taskCategoryBonus: {
      research: 7,
      creative: 5,
      planning: -3,
      data: -4,
    },
    statusDecayModifiers: {
      energy: 4,   // burns more energy exploring
      mood: -4,    // mood stays higher through adventure
    },
    flavorText: '每次新委托对它来说都是一场冒险，风险越高，眼睛就越亮。',
  },
  {
    id: 'calm',
    name: '沉稳',
    emoji: '🌿',
    description: '情绪稳定，不受紧急任务干扰，能量消耗极低，是长期稳定输出的最佳性格。',
    statModifiers: {
      stability: 6,
      understanding: 2,
      creativity: -1,
      expression: -1,
    },
    taskCategoryBonus: {
      planning: 6,
      data: 8,
      analysis: 5,
      creative: -4,
      social: -3,
    },
    statusDecayModifiers: {
      energy: -6,   // energy decays much slower
      mood: -2,     // mood stable
      focus: -4,    // focus decays slower
    },
    flavorText: '即使截止日期只剩一小时，它也能泡一杯茶，然后按时交付完美的报告。',
  },
]
