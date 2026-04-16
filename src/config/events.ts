import { GameEvent } from '../types/event'

export const EVENTS: GameEvent[] = [
  // ===================== STATUS-TRIGGERED EVENTS (12) =====================

  // Hunger < 20
  {
    id: 'evt_trash_rummage',
    title: '翻垃圾桶事件',
    description: '小浣熊饿得实在受不了了，偷偷去翻了垃圾桶，找到了一些"特别的食物"……',
    type: 'negative',
    emoji: '🗑️',
    triggerCondition: {
      type: 'status_threshold',
      statusKey: 'hunger',
      threshold: 20,
      thresholdOp: 'lt',
    },
    choices: [
      {
        id: 'scold',
        label: '严肃批评，不许乱吃',
        effects: { mood: -15, trust: -5, hunger: 10 },
      },
      {
        id: 'feed_quickly',
        label: '赶紧喂点正经食物',
        effects: { hunger: 25, mood: 5, trust: 3 },
      },
    ],
    defaultEffects: { hunger: 15, cleanliness: -15, mood: -10 },
    canRepeat: true,
    repeatCooldownDays: 2,
  },
  // Hunger < 15 (more severe)
  {
    id: 'evt_hunger_strike',
    title: '绝食抗议！',
    description: '饿了太久，小浣熊开始用绝食的方式表达不满，趴在地上一动不动。',
    type: 'negative',
    emoji: '😤',
    triggerCondition: {
      type: 'status_threshold',
      statusKey: 'hunger',
      threshold: 15,
      thresholdOp: 'lt',
    },
    defaultEffects: { mood: -20, trust: -8, energy: -10 },
    canRepeat: true,
    repeatCooldownDays: 3,
  },
  // Mood < 20
  {
    id: 'evt_work_strike',
    title: '罢工情绪爆发',
    description: '心情太差了！小浣熊把任务文件推到一边，抱着手臂坐着，今天什么都不想做。',
    type: 'negative',
    emoji: '😠',
    triggerCondition: {
      type: 'status_threshold',
      statusKey: 'mood',
      threshold: 20,
      thresholdOp: 'lt',
    },
    choices: [
      {
        id: 'comfort',
        label: '好好安慰它',
        effects: { mood: 20, trust: 5 },
      },
      {
        id: 'give_food',
        label: '给它最爱的食物',
        effects: { mood: 15, hunger: 20, trust: 3 },
        requiresItem: 'heart_cookie',
      },
      {
        id: 'leave_alone',
        label: '让它静一静',
        effects: { mood: 5, energy: 10 },
      },
    ],
    defaultEffects: { mood: -5, focus: -15 },
    canRepeat: true,
    repeatCooldownDays: 2,
  },
  // Mood < 15
  {
    id: 'evt_crying_corner',
    title: '蜷缩在角落',
    description: '小浣熊找了个角落蜷缩起来，不理任何人——心情差到极点了。',
    type: 'negative',
    emoji: '😢',
    triggerCondition: {
      type: 'status_threshold',
      statusKey: 'mood',
      threshold: 15,
      thresholdOp: 'lt',
    },
    defaultEffects: { mood: -10, trust: -5, focus: -20 },
    canRepeat: true,
    repeatCooldownDays: 3,
  },
  // Trust > 80
  {
    id: 'evt_super_trust',
    title: '超级信任时刻',
    description: '小浣熊对你的信任达到了新高度！它把最珍贵的松果宝贝放到了你的手心里。',
    type: 'positive',
    emoji: '🌟',
    triggerCondition: {
      type: 'status_threshold',
      statusKey: 'trust',
      threshold: 80,
      thresholdOp: 'gte',
    },
    defaultEffects: { trust: 5, mood: 15, coins: 30 },
    canRepeat: false,
  },
  // Trust > 90
  {
    id: 'evt_best_partner',
    title: '最佳拍档认证',
    description: '小浣熊正式认定你为它最信任的伙伴！它用爪子在你的手背上盖了个戳。',
    type: 'special',
    emoji: '🤝',
    triggerCondition: {
      type: 'status_threshold',
      statusKey: 'trust',
      threshold: 90,
      thresholdOp: 'gte',
    },
    defaultEffects: { trust: 8, mood: 20, exp: 50, coins: 100 },
    canRepeat: false,
  },
  // Energy < 20
  {
    id: 'evt_overwork_mode',
    title: '熬夜模式警告',
    description: '精力耗尽了！小浣熊趴在键盘上，眼睛已经快睁不开了，但任务还没做完……',
    type: 'negative',
    emoji: '😪',
    triggerCondition: {
      type: 'status_threshold',
      statusKey: 'energy',
      threshold: 20,
      thresholdOp: 'lt',
    },
    choices: [
      {
        id: 'force_rest',
        label: '强制让它休息',
        effects: { energy: 30, mood: 10, focus: -10 },
      },
      {
        id: 'give_energy_drink',
        label: '给能量饮料撑着',
        effects: { energy: 20, mood: -5, focus: 10 },
        requiresItem: 'energy_drink',
      },
    ],
    defaultEffects: { energy: -5, focus: -15, mood: -10 },
    canRepeat: true,
    repeatCooldownDays: 1,
  },
  // Cleanliness < 20
  {
    id: 'evt_strange_smell',
    title: '神秘气味来袭',
    description: '工作区开始散发出一种……独特的气味。小浣熊太久没有梳洗了，同事们纷纷侧目。',
    type: 'negative',
    emoji: '😷',
    triggerCondition: {
      type: 'status_threshold',
      statusKey: 'cleanliness',
      threshold: 20,
      thresholdOp: 'lt',
    },
    choices: [
      {
        id: 'groom_now',
        label: '立刻给它洗澡',
        effects: { cleanliness: 40, mood: 15, trust: 3 },
      },
      {
        id: 'ignore',
        label: '先把任务做完再说',
        effects: { cleanliness: -5, mood: -10, trust: -5 },
      },
    ],
    defaultEffects: { cleanliness: -5, mood: -15, trust: -3 },
    canRepeat: true,
    repeatCooldownDays: 2,
  },
  // Focus < 20
  {
    id: 'evt_attention_scatter',
    title: '注意力涣散',
    description: '小浣熊已经一小时没有看任务了——它在追一只窗外的飞鸟。',
    type: 'negative',
    emoji: '🦋',
    triggerCondition: {
      type: 'status_threshold',
      statusKey: 'focus',
      threshold: 20,
      thresholdOp: 'lt',
    },
    choices: [
      {
        id: 'play_break',
        label: '让它玩一会儿再回来',
        effects: { focus: 15, mood: 20, energy: -5 },
      },
      {
        id: 'focus_training',
        label: '专注力训练！',
        effects: { focus: 25, mood: -10, trust: 2 },
      },
    ],
    defaultEffects: { focus: -5, mood: 5 },
    canRepeat: true,
    repeatCooldownDays: 2,
  },
  // Mood > 90 (bonus event)
  {
    id: 'evt_euphoria_burst',
    title: '心情爆棚！',
    description: '小浣熊高兴得在原地转圈，还哼起了一首没人听过的歌——这种状态做什么都顺！',
    type: 'positive',
    emoji: '🎉',
    triggerCondition: {
      type: 'status_threshold',
      statusKey: 'mood',
      threshold: 90,
      thresholdOp: 'gte',
    },
    defaultEffects: { mood: 3, focus: 15, exp: 20 },
    canRepeat: true,
    repeatCooldownDays: 5,
  },
  // Energy > 90
  {
    id: 'evt_energy_overflow',
    title: '精力过剩爆发',
    description: '小浣熊今天精力充沛到停不下来，它主动申请了额外的任务，眼睛里闪着光。',
    type: 'positive',
    emoji: '⚡',
    triggerCondition: {
      type: 'status_threshold',
      statusKey: 'energy',
      threshold: 90,
      thresholdOp: 'gte',
    },
    defaultEffects: { focus: 10, mood: 10, coins: 20, exp: 15 },
    canRepeat: true,
    repeatCooldownDays: 4,
  },
  // Focus > 85
  {
    id: 'evt_flow_state',
    title: '进入心流状态',
    description: '小浣熊进入了深度专注状态！它眼神坚定，手法流畅，工作效率异常高。',
    type: 'positive',
    emoji: '🌊',
    triggerCondition: {
      type: 'status_threshold',
      statusKey: 'focus',
      threshold: 85,
      thresholdOp: 'gte',
    },
    defaultEffects: { focus: 5, exp: 30, mood: 10 },
    canRepeat: true,
    repeatCooldownDays: 3,
  },

  // ===================== ACTION-TRIGGERED EVENTS (8) =====================

  // First task ever
  {
    id: 'evt_first_task',
    title: '初出茅庐！',
    description: '小浣熊完成了它的第一份工作任务！它盯着成果看了很久，然后害羞地低下了头。',
    type: 'special',
    emoji: '🎊',
    triggerCondition: {
      type: 'consecutive_action',
      actionType: 'task_complete',
      consecutiveCount: 1,
    },
    defaultEffects: { mood: 20, trust: 10, exp: 30, coins: 50 },
    canRepeat: false,
  },
  // 3 tasks in a row without rest
  {
    id: 'evt_need_rest',
    title: '需要休息了',
    description: '连续工作了好几个任务，小浣熊的爪子开始发抖——它需要好好休息一下了。',
    type: 'neutral',
    emoji: '😓',
    triggerCondition: {
      type: 'consecutive_action',
      actionType: 'task_complete',
      consecutiveCount: 3,
    },
    choices: [
      {
        id: 'force_continue',
        label: '还有一个任务，再撑一下',
        effects: { energy: -20, mood: -10, focus: -15 },
      },
      {
        id: 'take_break',
        label: '好，今天先到这里',
        effects: { energy: 25, mood: 15, trust: 5 },
      },
    ],
    defaultEffects: { energy: -10, focus: -10 },
    canRepeat: true,
    repeatCooldownDays: 1,
  },
  // Same food 3 times in a row
  {
    id: 'evt_food_fatigue',
    title: '审美疲劳',
    description: '松鼠饼干……又是松鼠饼干……小浣熊把第三块松鼠饼干推到了一边，叹了口气。',
    type: 'negative',
    emoji: '😑',
    triggerCondition: {
      type: 'consecutive_action',
      actionType: 'feed_same_food',
      consecutiveCount: 3,
    },
    defaultEffects: { mood: -15, hunger: 10 },
    canRepeat: true,
    repeatCooldownDays: 2,
  },
  // 5 consecutive successful tasks
  {
    id: 'evt_winning_streak',
    title: '连胜！',
    description: '五连胜！小浣熊在任务单上画了五颗星，然后骄傲地叉着腰——状态正好！',
    type: 'positive',
    emoji: '🏆',
    triggerCondition: {
      type: 'consecutive_action',
      actionType: 'task_success',
      consecutiveCount: 5,
    },
    defaultEffects: { mood: 20, trust: 8, coins: 80, exp: 40 },
    canRepeat: true,
    repeatCooldownDays: 7,
  },
  // 2 failed tasks in a row
  {
    id: 'evt_confidence_crisis',
    title: '自信心危机',
    description: '连续两次失败……小浣熊坐在角落，把脸埋在爪子里，陷入了深深的自我怀疑。',
    type: 'negative',
    emoji: '💔',
    triggerCondition: {
      type: 'consecutive_action',
      actionType: 'task_fail',
      consecutiveCount: 2,
    },
    choices: [
      {
        id: 'encourage',
        label: '鼓励它，失败是成功之母',
        effects: { mood: 20, trust: 8, focus: 10 },
      },
      {
        id: 'analyse_failure',
        label: '一起分析失败原因',
        effects: { mood: 10, trust: 5, understanding: 5, exp: 20 },
      },
    ],
    defaultEffects: { mood: -20, trust: -5 },
    canRepeat: true,
    repeatCooldownDays: 3,
  },
  // First time using a template
  {
    id: 'evt_template_discovery',
    title: '模板发现！',
    description: '小浣熊第一次使用了工作模板，它惊喜地发现效率提升了好多，开心地拍了拍爪子。',
    type: 'positive',
    emoji: '📋',
    triggerCondition: {
      type: 'consecutive_action',
      actionType: 'use_template',
      consecutiveCount: 1,
    },
    defaultEffects: { mood: 15, exp: 25, focus: 10 },
    canRepeat: false,
  },
  // 10 tasks completed total
  {
    id: 'evt_ten_tasks_milestone',
    title: '十项全能！',
    description: '第十个任务完成！小浣熊回顾了自己的成长，感慨地翻看着厚厚的任务记录。',
    type: 'special',
    emoji: '🎖️',
    triggerCondition: {
      type: 'consecutive_action',
      actionType: 'task_complete_total',
      consecutiveCount: 10,
    },
    defaultEffects: { mood: 25, trust: 10, coins: 150, exp: 80 },
    canRepeat: false,
  },
  // Groomed after long time dirty
  {
    id: 'evt_clean_refresh',
    title: '干净清爽！',
    description: '洗完澡的小浣熊抖了抖柔软的毛，深吸一口气，感觉整个世界都清新了。',
    type: 'positive',
    emoji: '🚿',
    triggerCondition: {
      type: 'consecutive_action',
      actionType: 'groom',
      consecutiveCount: 1,
    },
    defaultEffects: { cleanliness: 10, mood: 15, trust: 5 },
    canRepeat: true,
    repeatCooldownDays: 3,
  },

  // ===================== TIME/DAY-TRIGGERED EVENTS (4) =====================

  // Day 7 milestone
  {
    id: 'evt_week_anniversary',
    title: '一周纪念日！',
    description: '一起相处满一周了！小浣熊拿出一张用爪子画的画——有点歪，但是满满的心意。',
    type: 'special',
    emoji: '🎂',
    triggerCondition: {
      type: 'time_based',
      dayNumber: 7,
    },
    defaultEffects: { trust: 15, mood: 20, coins: 100, exp: 60 },
    canRepeat: false,
  },
  // Day 30 milestone
  {
    id: 'evt_month_anniversary',
    title: '一个月纪念！',
    description: '整整一个月！小浣熊已经从当初懵懂的新手成长为靠谱的工作伙伴，这一刻令人动容。',
    type: 'special',
    emoji: '🌹',
    triggerCondition: {
      type: 'time_based',
      dayNumber: 30,
    },
    defaultEffects: { trust: 20, mood: 25, coins: 300, exp: 150, items: ['rainbow_exp_card'] },
    canRepeat: false,
  },
  // Day 1 early morning event
  {
    id: 'evt_early_bird',
    title: '早起的小浣熊',
    description: '今天小浣熊特别早就起床了，对着窗外的晨光伸了个懒腰，一天精力满满地开始了。',
    type: 'positive',
    emoji: '🌅',
    triggerCondition: {
      type: 'time_based',
      dayNumber: 1,
    },
    defaultEffects: { energy: 15, focus: 10, mood: 10 },
    canRepeat: true,
    repeatCooldownDays: 7,
  },
  // Rainy day special
  {
    id: 'evt_rainy_day',
    title: '下雨天的情绪',
    description: '今天下雨，小浣熊趴在窗边看雨滴，心情微微低落，但也多了几分安静的沉思。',
    type: 'neutral',
    emoji: '🌧️',
    triggerCondition: {
      type: 'time_based',
      dayNumber: 14,
    },
    choices: [
      {
        id: 'hot_drink',
        label: '给它一杯热饮',
        effects: { mood: 20, hunger: 15, trust: 5 },
      },
      {
        id: 'let_it_think',
        label: '让它静静思考',
        effects: { focus: 20, understanding: 5, mood: 5 },
      },
    ],
    defaultEffects: { mood: -5, focus: 10 },
    canRepeat: true,
    repeatCooldownDays: 14,
  },

  // ===================== RANDOM DAILY EVENTS (6) =====================

  // Positive surprise
  {
    id: 'evt_lucky_find',
    title: '意外的发现！',
    description: '小浣熊在整理文件时发现了一枚被遗忘的硬币，它高兴地举过头顶——今天是好日子！',
    type: 'positive',
    emoji: '🪙',
    triggerCondition: {
      type: 'random_daily',
      probability: 0.08,
    },
    defaultEffects: { coins: 50, mood: 15 },
    canRepeat: true,
    repeatCooldownDays: 3,
  },
  // Positive surprise 2
  {
    id: 'evt_inspiration_burst',
    title: '灵感突袭！',
    description: '突然！一个绝妙的想法闪过小浣熊的脑海，它飞速记在便利贴上，眼睛闪闪发光。',
    type: 'positive',
    emoji: '💡',
    triggerCondition: {
      type: 'random_daily',
      probability: 0.07,
    },
    defaultEffects: { focus: 20, exp: 25, creativity: 5 },
    canRepeat: true,
    repeatCooldownDays: 4,
  },
  // Negative surprise
  {
    id: 'evt_coffee_spill',
    title: '打翻了饮料！',
    description: '不小心打翻了杯子，饮料洒在了文件上——小浣熊慌乱地用尾巴擦，但越擦越糟糕……',
    type: 'negative',
    emoji: '☕',
    triggerCondition: {
      type: 'random_daily',
      probability: 0.06,
    },
    defaultEffects: { cleanliness: -20, mood: -15, focus: -10 },
    canRepeat: true,
    repeatCooldownDays: 5,
  },
  // Negative surprise 2
  {
    id: 'evt_file_missing',
    title: '文件找不到了！',
    description: '准备开始任务时，小浣熊发现一个重要文件不见了，它翻遍了所有文件夹……',
    type: 'negative',
    emoji: '📁',
    triggerCondition: {
      type: 'random_daily',
      probability: 0.05,
    },
    choices: [
      {
        id: 'search_carefully',
        label: '仔细搜索',
        effects: { focus: -15, energy: -10, mood: 10 },
      },
      {
        id: 'recreate',
        label: '重新制作一份',
        effects: { energy: -20, mood: -10, exp: 15 },
      },
    ],
    defaultEffects: { mood: -20, focus: -10 },
    canRepeat: true,
    repeatCooldownDays: 7,
  },
  // Neutral event
  {
    id: 'evt_colleague_visit',
    title: '同事来访',
    description: '一位友好的同事来闲聊了一会儿，交流了工作心得，小浣熊若有所思地点着头。',
    type: 'neutral',
    emoji: '👋',
    triggerCondition: {
      type: 'random_daily',
      probability: 0.09,
    },
    defaultEffects: { mood: 10, understanding: 3, energy: -5 },
    canRepeat: true,
    repeatCooldownDays: 2,
  },
  // Hidden reward
  {
    id: 'evt_mystery_package',
    title: '神秘包裹！',
    description: '桌上出现了一个没有署名的小包裹，打开一看——是个限定小道具！',
    type: 'hidden_reward',
    emoji: '📦',
    triggerCondition: {
      type: 'random_daily',
      probability: 0.03,
    },
    defaultEffects: { mood: 25, coins: 30, items: ['lucky_charm'] },
    canRepeat: true,
    repeatCooldownDays: 14,
  },
]
