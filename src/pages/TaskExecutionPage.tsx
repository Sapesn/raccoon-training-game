import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Zap, CheckCircle2 } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'
import { TASKS, PERMANENT_TASKS } from '../config/tasks'
import { ITEMS } from '../config/items'
import { calculateSuccessRate, getTraitModifier } from '../utils/taskFormula'
import { SuccessRatePreview } from '../components/task/SuccessRatePreview'
import { TemplateCard } from '../components/template/TemplateCard'
import { Button } from '../components/common/Button'
import { TaskCompletionModal } from '../components/task/TaskCompletionModal'
import { useAITaskExecution } from '../hooks/useAITaskExecution'
import { generateTaskReport } from '../utils/reportGenerator'

export default function TaskExecutionPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const store = useGameStore()
  const { raccoon, currentAP, templates, inventory, dynamicTasks } = store

  const task = [...TASKS, ...PERMANENT_TASKS, ...dynamicTasks].find(t => t.id === taskId)
  const { state: exec, loadOptions, run } = useAITaskExecution(task!)

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined)
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [cursor, setCursor] = useState(true)

  // For the choosing step
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null)
  const [customAnswer, setCustomAnswer] = useState('')

  // Stash execution params so we can pass them when user submits choice
  const [pendingParams, setPendingParams] = useState<{
    taskId: string; templateId?: string; itemIds: string[]; isDecomposed: boolean
  } | null>(null)

  useEffect(() => {
    if (!task) navigate('/tasks')
  }, [task, navigate])

  useEffect(() => {
    if (!exec.isStreaming) return
    const id = setInterval(() => setCursor(c => !c), 500)
    return () => clearInterval(id)
  }, [exec.isStreaming])

  if (!task) return null

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
  const itemBonusTotal = selectedItemIds.reduce((sum, id) => {
    const item = ITEMS.find(i => i.id === id)
    return sum + (item?.effects.successRateBonus ?? 0)
  }, 0)
  const traitModifier = getTraitModifier(raccoon, task.category)
  const rateBreakdown = calculateSuccessRate({
    task, raccoon, template: selectedTemplate, itemBonuses: itemBonusTotal, traitModifier,
  })

  const compatibleTemplates = templates.filter(t =>
    t.taskTags.includes(task.category) || t.category === task.category
  )
  const taskItems = inventory.items
    .filter(s => s.quantity > 0)
    .map(s => ({ item: ITEMS.find(i => i.id === s.itemId)!, qty: s.quantity }))
    .filter(s => s.item && s.item.usableIn === 'task')

  const handleStartChoosing = () => {
    if (currentAP < task.apCost) return
    const params = {
      taskId: task.id,
      templateId: selectedTemplateId,
      itemIds: selectedItemIds,
      isDecomposed: false,
    }
    setPendingParams(params)
    loadOptions()
  }

  const handleSubmitChoice = () => {
    if (!pendingParams) return
    const choice = selectedOptionIdx !== null
      ? `${exec.options[selectedOptionIdx].label}：${exec.options[selectedOptionIdx].detail}`
      : customAnswer.trim()
    if (!choice) return
    run(pendingParams, choice)
  }

  const toggleItem = (itemId: string) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    )
  }

  const choiceReady = selectedOptionIdx !== null || customAnswer.trim().length > 0

  return (
    <div className="px-4 py-4 pb-8">
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-amber-600 mb-4"
      >
        <ArrowLeft size={16} /> 返回任务中心
      </button>

      <AnimatePresence mode="wait">

        {/* ── PREVIEW ── */}
        {exec.step === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between mb-1">
                <h2 className="font-bold text-gray-800 text-base">{task.name}</h2>
                {task.isDynamic && (
                  <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full shrink-0 ml-2">AI任务</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-2">{task.description}</p>
              <p className="text-xs italic text-gray-400">"{task.flavorText}"</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Zap size={12} className="text-amber-500" />需要 {task.apCost} AP</span>
                <span className="text-amber-600">🪙 {task.rewards.coins}</span>
                <span className="text-blue-500">+{task.rewards.exp} EXP</span>
              </div>
            </div>

            {exec.error && (
              <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{exec.error}</div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">成功率预估</h3>
              <SuccessRatePreview successRate={rateBreakdown.finalRate} breakdown={rateBreakdown} />
            </div>

            {compatibleTemplates.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">
                  选择模板 <span className="text-gray-400 font-normal text-xs">（可选）</span>
                </h3>
                <div className="space-y-2">
                  {compatibleTemplates.map(tpl => (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(prev => prev === tpl.id ? undefined : tpl.id)}
                      className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                        selectedTemplateId === tpl.id
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-gray-100 hover:border-amber-200'
                      }`}
                    >
                      <TemplateCard template={tpl} selected={selectedTemplateId === tpl.id} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {taskItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">
                  使用道具 <span className="text-gray-400 font-normal text-xs">（可选）</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {taskItems.map(({ item, qty }) => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors ${
                        selectedItemIds.includes(item.id)
                          ? 'border-amber-400 bg-amber-50 text-amber-700'
                          : 'border-gray-200 text-gray-600 hover:border-amber-200'
                      }`}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                      <span className="text-gray-400 text-xs">×{qty}</span>
                      {item.effects.successRateBonus && (
                        <span className="text-green-500 text-xs">+{item.effects.successRateBonus}%</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="primary"
              fullWidth
              disabled={currentAP < task.apCost}
              onClick={handleStartChoosing}
            >
              {currentAP < task.apCost
                ? `行动点不足（需要 ${task.apCost} AP）`
                : `🚀 开始执行 (−${task.apCost} AP)`
              }
            </Button>
          </motion.div>
        )}

        {/* ── LOADING OPTIONS ── */}
        {exec.step === 'loading_options' && (
          <motion.div
            key="loading_options"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="text-5xl animate-bounce">🦝</div>
            <div className="text-sm font-medium text-gray-700">小浣熊正在思考解题方案...</div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── CHOOSING ── */}
        {exec.step === 'choosing' && (
          <motion.div
            key="choosing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-sm font-semibold text-gray-700 mb-1">{task.name}</div>
              <div className="text-xs text-gray-400">{task.description}</div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                🤔 选择你的解决方案
              </h3>
              <p className="text-xs text-gray-400 mb-4">选择一个方案，或在下方输入自己的想法</p>

              {exec.options.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {exec.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedOptionIdx(i); setCustomAnswer('') }}
                      className={`w-full text-left rounded-xl border p-3 transition-all ${
                        selectedOptionIdx === i
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-gray-100 hover:border-amber-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedOptionIdx === i ? 'border-amber-500 bg-amber-500' : 'border-gray-300'
                        }`}>
                          {selectedOptionIdx === i && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">{opt.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{opt.detail}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-400 mb-4 py-2">（AI未能生成选项，请直接输入你的方案）</div>
              )}

              <div className="relative">
                <textarea
                  value={customAnswer}
                  onChange={e => { setCustomAnswer(e.target.value); setSelectedOptionIdx(null) }}
                  placeholder="或者输入你自己的解决方案..."
                  rows={3}
                  className={`w-full rounded-xl border text-sm p-3 resize-none focus:outline-none transition-colors ${
                    customAnswer.trim()
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-gray-200 focus:border-amber-300'
                  }`}
                />
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              disabled={!choiceReady}
              onClick={handleSubmitChoice}
            >
              ✅ 提交方案，开始执行
            </Button>
          </motion.div>
        )}

        {/* ── AI EXECUTING ── */}
        {exec.step === 'ai_executing' && (
          <motion.div
            key="ai_executing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 text-center">
              <div className="text-4xl mb-3 animate-bounce">🦝</div>
              <div className="font-semibold text-gray-700 text-base mb-1">小浣熊正在全力执行中...</div>
              <div className="text-xs text-gray-400">{task.name}</div>
              <div className="mt-3 h-1 bg-amber-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full animate-pulse w-full" />
              </div>
            </div>

            {exec.streamingText && (
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
                <div className="text-[10px] text-gray-400 mb-2 uppercase tracking-wide">执行输出</div>
                <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-mono max-h-64 overflow-y-auto">
                  {exec.streamingText}
                  {cursor && <span className="text-amber-500">▌</span>}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── RESULT ── background stays as the final stream output */}
        {exec.step === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 text-center">
              <div className="text-4xl mb-3">🦝</div>
              <div className="font-semibold text-gray-700 text-base mb-1">执行完成</div>
              <div className="text-xs text-gray-400">{task.name}</div>
            </div>
            {exec.streamingText && (
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
                <div className="text-[10px] text-gray-400 mb-2 uppercase tracking-wide">执行成果</div>
                <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-mono max-h-64 overflow-y-auto">
                  {exec.streamingText}
                </div>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── COMPLETION MODAL — overlays on top when result is ready ── */}
      {exec.step === 'result' && exec.result && (
        <TaskCompletionModal
          result={exec.result}
          task={task}
          onDownloadReport={() =>
            generateTaskReport(exec.result!, {
              taskName:        task.name,
              taskDescription: task.description,
              taskCategory:    task.category,
              taskDifficulty:  task.difficulty,
              raccoonName:     raccoon.name,
              raccoonLevel:    raccoon.level,
              gameDay:         store.gameDay,
            })
          }
          onGoToTasks={() => navigate('/tasks')}
          onGoHome={() => navigate('/home')}
        />
      )}
    </div>
  )
}
