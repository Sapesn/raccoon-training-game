/**
 * LLM service — all API calls to the OpenAI-compatible endpoint.
 * Task generation and AI task execution (with streaming).
 */

import type { Task, TaskCategory, TaskDifficulty } from '../types/task'
import type { Raccoon, SkillKey } from '../types/raccoon'

const API_BASE = import.meta.env.VITE_API_BASE as string || 'https://cld.ppapi.vip/v1'
const API_KEY  = import.meta.env.VITE_API_KEY  as string || ''
const MODEL    = import.meta.env.VITE_MODEL    as string || 'claude-opus-4-6'

// Skill display names
const SKILL_NAMES: Record<SkillKey, string> = {
  dexterity:     '灵巧度',
  understanding: '理解力',
  expression:    '表达力',
  analysis:      '分析力',
  creativity:    '创造力',
  stability:     '稳定性',
}

// Category → recommended skills mapping
const CATEGORY_SKILLS: Record<TaskCategory, SkillKey[]> = {
  writing:       ['expression', 'stability'],
  analysis:      ['analysis', 'understanding'],
  creative:      ['creativity', 'expression'],
  research:      ['understanding', 'analysis'],
  planning:      ['analysis', 'stability'],
  communication: ['expression', 'stability'],
  data:          ['analysis', 'dexterity'],
  social:        ['stability', 'expression'],
}

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function chatCompletion(
  messages: Array<{ role: string; content: string }>,
  stream = false,
  maxTokens = 1200,
  signal?: AbortSignal,
): Promise<Response> {
  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.8,
      stream,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res
}

// ---------------------------------------------------------------------------
// Task generation
// ---------------------------------------------------------------------------

/** Returns raccoon's weakest skills (sorted ascending). */
function getWeakestSkills(raccoon: Raccoon): SkillKey[] {
  const skills: SkillKey[] = ['dexterity', 'understanding', 'expression', 'analysis', 'creativity', 'stability']
  return [...skills].sort((a, b) => raccoon.stats[a] - raccoon.stats[b]).slice(0, 3)
}

/** Build a default Task from a raw LLM-generated object (with safe fallbacks). */
function buildTask(raw: Record<string, unknown>, index: number): Task {
  const id = `dyn_${Date.now()}_${index}`
  const validCategories: TaskCategory[] = ['writing', 'analysis', 'creative', 'research', 'planning', 'communication', 'data', 'social']
  const validDifficulties: TaskDifficulty[] = ['E', 'D', 'C', 'B', 'A']
  const validUrgencies = ['low', 'normal', 'high', 'urgent']

  const category = validCategories.includes(raw.category as TaskCategory)
    ? (raw.category as TaskCategory)
    : 'writing'
  const difficulty = validDifficulties.includes(raw.difficulty as TaskDifficulty)
    ? (raw.difficulty as TaskDifficulty)
    : 'D'
  const urgency = validUrgencies.includes(raw.urgency as string) ? (raw.urgency as Task['urgency']) : 'normal'
  const baseSuccessRate = typeof raw.baseSuccessRate === 'number'
    ? Math.max(30, Math.min(90, raw.baseSuccessRate))
    : 65
  const apCost = typeof raw.apCost === 'number' ? Math.max(1, Math.min(3, raw.apCost)) : 2

  const rawRewards = (raw.rewards ?? {}) as Record<string, number>

  return {
    id,
    name:       typeof raw.name === 'string' ? raw.name : `AI任务 #${index + 1}`,
    description: typeof raw.description === 'string' ? raw.description : '一个由AI生成的工作任务。',
    flavorText:  typeof raw.flavorText === 'string' ? raw.flavorText : '小浣熊接过任务单，认真地看了又看。',
    type:        'commission',
    category,
    difficulty,
    urgency,
    baseSuccessRate,
    apCost,
    recommendedStats: CATEGORY_SKILLS[category],
    recommendedTemplates: [],
    supportsDecompose:   false,
    rewards: {
      coins: typeof rawRewards.coins === 'number' ? rawRewards.coins : 40,
      exp:   typeof rawRewards.exp   === 'number' ? rawRewards.exp   : 30,
    },
    penalties:   { mood: -8 },
    isRepeatable: false,
    isDynamic: true,
  } as Task & { isDynamic: true }
}

/**
 * Calls the LLM to generate N dynamic tasks tailored to the raccoon's weakest skills.
 * Returns [] on any failure so the game is never blocked.
 */
export async function generateDynamicTasks(
  raccoon: Raccoon,
  existingTaskIds: string[],
  count = 5,
): Promise<Task[]> {
  const weak = getWeakestSkills(raccoon)
  const skillLines = (Object.entries(raccoon.stats) as [SkillKey, number][])
    .map(([k, v]) => `  - ${SKILL_NAMES[k]}(${k}): ${v}`)
    .join('\n')
  const weakNames = weak.map(k => SKILL_NAMES[k]).join('、')

  const prompt = `你是"办公小浣熊"AI助理的任务派发系统。根据小浣熊当前技能，生成${count}个真实职场工作任务，包装成动物研究所的工作场景。

小浣熊当前技能：
${skillLines}

最需要练习的技能：${weakNames}

任务设计要求：
1. 每个任务必须是具体的真实工作场景（如：分析某动物园近3个月游客数据、起草濒危物种合作邮件、设计野生动物追踪系统PRD等）
2. 任务描述要说明具体对象、工作内容和预期产出（不要笼统描述）
3. 任务包装在"野生动物研究所/动物保护机构/动物园运营"场景中
4. 优先生成与 ${weakNames} 相关的任务类型
5. 难度和AP消耗要与技能水平匹配

返回JSON数组（只返回数组，不要其他文字）：
[
  {
    "name": "任务名称（6-12字，包含具体对象）",
    "description": "详细描述：任务背景 + 具体工作内容 + 预期产出，2-3句话",
    "flavorText": "小浣熊第一视角的有趣旁白，不超过40字",
    "category": "writing|analysis|creative|research|planning|communication|data|social",
    "difficulty": "E|D|C|B",
    "urgency": "low|normal|high|urgent",
    "baseSuccessRate": 55,
    "apCost": 2,
    "recommendedStats": ["expression", "stability"],
    "rewards": {"coins": 50, "exp": 35}
  }
]`

  try {
    const res = await chatCompletion([{ role: 'user', content: prompt }], false, 1500)
    const data = await res.json() as { choices: Array<{ message: { content: string } }> }
    const text = data.choices[0]?.message?.content?.trim() ?? ''

    // Extract JSON array
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return []
    const parsed = JSON.parse(match[0]) as Array<Record<string, unknown>>
    if (!Array.isArray(parsed)) return []

    return parsed
      .slice(0, count)
      .map((raw, i) => buildTask(raw, i))
      .filter(t => !existingTaskIds.includes(t.id))
  } catch (err) {
    console.warn('[llmService] generateDynamicTasks failed:', err)
    return []
  }
}

// ---------------------------------------------------------------------------
// Task option generation (user chooses before execution)
// ---------------------------------------------------------------------------

export interface TaskOption {
  label: string   // short title
  detail: string  // 1-2 sentence description
}

/**
 * Generates 3 solution options for the user to choose from.
 * Returns [] on failure so the game degrades gracefully.
 */
export async function generateTaskOptions(
  task: Task,
  raccoon: Raccoon,
): Promise<TaskOption[]> {
  const skillContext = (Object.entries(raccoon.stats) as [SkillKey, number][])
    .map(([k, v]) => `${SKILL_NAMES[k]}: ${v}/100`)
    .join('，')

  const prompt = `你是"办公小浣熊"AI助理，正在帮助完成一个具体工作任务。请为这个任务生成3种不同的解决方案，供用户选择执行路径。

任务：${task.name}
任务描述：${task.description}
当前技能：${skillContext}

要求：
1. 三个方案在方法论上有明显差异（如：数据驱动 vs 访谈调研 vs 框架分析）
2. 方案标题要简洁有力（4-8字），描述要说清楚具体做什么、怎么做
3. 结合任务的实际场景（动物研究所/动物园/保护机构）

返回JSON数组（只返回数组）：
[
  {"label": "方案名称（4-8字）", "detail": "具体执行路径，1-2句话说明方法和产出"},
  {"label": "方案名称（4-8字）", "detail": "具体执行路径，1-2句话说明方法和产出"},
  {"label": "方案名称（4-8字）", "detail": "具体执行路径，1-2句话说明方法和产出"}
]`

  try {
    const res = await chatCompletion([{ role: 'user', content: prompt }], false, 600)
    const data = await res.json() as { choices: Array<{ message: { content: string } }> }
    const text = data.choices[0]?.message?.content?.trim() ?? ''
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return []
    const parsed = JSON.parse(match[0]) as Array<{ label: string; detail: string }>
    if (!Array.isArray(parsed)) return []
    return parsed.slice(0, 3).filter(o => o.label && o.detail)
  } catch (err) {
    console.warn('[llmService] generateTaskOptions failed:', err)
    return []
  }
}

// ---------------------------------------------------------------------------
// Task execution (streaming)
// ---------------------------------------------------------------------------

export interface AIExecutionResult {
  output: string
  aiScore: number
  error?: string   // set when AI call failed, so UI can show the real reason
}

/**
 * Has the LLM "execute" the task as the raccoon, streaming tokens back via onChunk.
 * Takes the user's chosen approach and evaluates it.
 * Appends self-evaluation score on the final line as JSON.
 */
export async function executeTaskWithAI(
  task: Task,
  raccoon: Raccoon,
  onChunk: (text: string) => void,
  userChoice?: string,
): Promise<AIExecutionResult> {
  const skillContext = (Object.entries(raccoon.stats) as [SkillKey, number][])
    .map(([k, v]) => `${SKILL_NAMES[k]}: ${v}/100`)
    .join('，')

  const choiceContext = userChoice
    ? `\n\n主人选择的解决方案：${userChoice}\n请基于这个方案来执行任务，并给出具体成果。`
    : ''

  const messages = [
    {
      role: 'system',
      content: `你是"办公小浣熊"AI助理，正在帮用户完成真实的职场工作任务。当前技能水平：${skillContext}。

输出要求（非常重要）：
- 产出真实、有信息量的工作成果，不要空洞或套话
- 使用具体数字、真实场景细节、有依据的分析（可以合理虚构但要真实可信）
- 根据任务类型选择合适格式：分析报告用表格/分节；PPT用幻灯片标题+要点；邮件用完整邮件格式；数据分析用数据+解读；计划用时间线/责任表
- 技能较低时，内容中可以体现少量瑕疵（如某个分析不够深入），但整体仍要有价值
- 总字数控制在300-600字，信息密度要高

最后一行必须单独输出自我评分JSON（不要其他文字）：{"score": 75}`,
    },
    {
      role: 'user',
      content: `任务：${task.name}\n\n${task.description}${choiceContext}\n\n请直接输出完整工作成果，不要写"好的，我来"之类的开场白。`,
    },
  ]

  let fullText = ''
  let timedOut = false

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, 60000)

  try {
    const res = await chatCompletion(messages, true, 1000, controller.signal)
    const reader = res.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') break

        try {
          const parsed = JSON.parse(data) as {
            choices: Array<{ delta: { content?: string }; finish_reason: string | null }>
          }
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            fullText += content
            onChunk(content)
          }
        } catch {
          // Ignore parse errors on individual SSE lines
        }
      }
    }
  } catch (err) {
    const isAbort = err instanceof DOMException && err.name === 'AbortError'
    if (!isAbort) console.warn('[llmService] executeTaskWithAI error:', err)
    if (!fullText) {
      const errMsg = timedOut
        ? '执行超时（60s）'
        : err instanceof Error ? err.message : String(err)
      return { output: '（AI执行出错，使用骰子结果）', aiScore: 50, error: errMsg }
    }
  } finally {
    clearTimeout(timeoutId)
  }

  // Extract score from last JSON line
  let aiScore = 60
  const lines = fullText.trimEnd().split('\n')
  const lastLine = lines[lines.length - 1].trim()
  try {
    const scoreObj = JSON.parse(lastLine) as { score?: number }
    if (typeof scoreObj.score === 'number') {
      aiScore = Math.max(0, Math.min(100, scoreObj.score))
      // Remove the score line from output
      fullText = lines.slice(0, -1).join('\n').trim()
    }
  } catch {
    // No valid JSON score line — use default
  }

  return { output: fullText.trim() || '（无输出）', aiScore }
}
