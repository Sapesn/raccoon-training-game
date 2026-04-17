/**
 * TaskCompletionModal — full-screen overlay shown after task execution completes.
 * Replaces the inline result card with a focused, dismissible summary.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../common/Button'
import type { TaskResult } from '../../types/task'
import type { Task } from '../../types/task'

interface TaskCompletionModalProps {
  result: TaskResult
  task: Task
  onDownloadReport: () => void
  onGoToTasks: () => void
  onGoHome: () => void
}

const GRADE_CONFIG = {
  perfect:   { label: '完美完成！',  color: '#7c3aed', bg: '#f5f3ff', emoji: '🌟', particle: 'bg-purple-400' },
  excellent: { label: '优秀！',       color: '#1d4ed8', bg: '#eff6ff', emoji: '⭐', particle: 'bg-blue-400' },
  good:      { label: '良好完成',     color: '#15803d', bg: '#f0fdf4', emoji: '✅', particle: 'bg-green-400' },
  partial:   { label: '勉强完成',     color: '#b45309', bg: '#fffbeb', emoji: '🆗', particle: 'bg-amber-400' },
  fail:      { label: '任务失败',     color: '#dc2626', bg: '#fef2f2', emoji: '❌', particle: 'bg-red-400' },
}

const SCORE_LABELS: Record<string, string> = {
  accuracy: '准确性', completeness: '完整度',
  expression: '表达力', timeliness: '时效性', stability: '稳定性',
}

const FAILURE_REASONS: Record<string, string> = {
  accuracy:     '输出内容存在明显偏差，未能准确完成任务要求',
  completeness: '任务完成度不够，部分要求未被覆盖',
  expression:   '成果的表达与呈现有所欠缺，难以达到预期效果',
  timeliness:   '执行效率不足，响应速度拖累了整体质量',
  stability:    '执行过程波动较大，结果质量不稳定',
}

const STATUS_LABELS: Record<string, string> = {
  hunger: '饱食度', mood: '心情', energy: '体力',
  focus: '专注度', cleanliness: '清洁度', trust: '信任度',
}

function getFailureReason(result: TaskResult): { key: string; msg: string } {
  const entries = Object.entries(result.scoreBreakdown) as [string, number][]
  const sorted = entries.sort((a, b) => a[1] - b[1])
  const [worstKey] = sorted[0]
  return { key: worstKey, msg: FAILURE_REASONS[worstKey] ?? '综合能力有待提升' }
}

// Confetti particles (fixed positions to avoid random flicker)
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 53 + 11) % 100,
  delay: i * 0.06,
  color: ['bg-amber-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i % 5],
}))

export function TaskCompletionModal({
  result, task, onDownloadReport, onGoToTasks, onGoHome,
}: TaskCompletionModalProps) {
  const [outputExpanded, setOutputExpanded] = useState(false)
  const grade = GRADE_CONFIG[result.grade] ?? GRADE_CONFIG.fail
  const showConfetti = result.success && result.grade !== 'partial'
  const failureReason = !result.success ? getFailureReason(result) : null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${p.color}`}
              style={{ left: `${p.left}%`, top: '40%' }}
              initial={{ y: 0, opacity: 0, scale: 0 }}
              animate={{ y: [-10, -100, 80], opacity: [0, 1, 0], scale: [0, 1.2, 0.5] }}
              transition={{ delay: p.delay, duration: 1.4 }}
            />
          ))}
        </div>
      )}

      {/* Modal card */}
      <motion.div
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ y: 80, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      >
        {/* Colored top band */}
        <div className="h-1.5 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${grade.color}80, ${grade.color})` }} />

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Grade hero */}
          <div className="text-center pt-2 pb-1">
            <motion.div
              className="text-5xl mb-2 inline-block"
              animate={result.success
                ? { rotate: [0, -12, 12, -6, 0], scale: [1, 1.2, 1] }
                : { rotate: [0, -5, 5, 0] }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              {grade.emoji}
            </motion.div>
            <div className="text-xl font-bold" style={{ color: grade.color }}>{grade.label}</div>
            <div className="text-sm text-gray-400 mt-0.5">{task.name}</div>
          </div>

          {/* Score bar */}
          <div className="rounded-2xl p-4" style={{ background: grade.bg }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">综合得分</span>
              <span className="text-2xl font-bold" style={{ color: grade.color }}>{result.score}<span className="text-sm font-normal text-gray-400">/100</span></span>
            </div>
            <div className="h-2 bg-white/70 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: grade.color }}
                initial={{ width: 0 }}
                animate={{ width: `${result.score}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
            {/* Score breakdown */}
            <div className="grid grid-cols-5 gap-1 mt-3">
              {Object.entries(result.scoreBreakdown).map(([key, val]) => (
                <div key={key} className="text-center">
                  <div className="text-xs font-semibold text-gray-700">{Math.round(val)}</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">{SCORE_LABELS[key]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Failure reason — only on fail */}
          {failureReason && (
            <motion.div
              className="rounded-2xl p-4 bg-red-50 border border-red-100"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg shrink-0">⚠️</span>
                <div>
                  <div className="text-sm font-semibold text-red-700 mb-0.5">失败原因</div>
                  <div className="text-xs text-red-600 leading-relaxed">{failureReason.msg}</div>
                  <div className="text-xs text-red-400 mt-1.5">
                    最薄弱项：{SCORE_LABELS[failureReason.key]} ({Math.round(result.scoreBreakdown[failureReason.key as keyof typeof result.scoreBreakdown])}/100)
                    {task.recommendedStats.length > 0 && (
                      <> · 建议提升：{task.recommendedStats.slice(0, 2).join('、')}</>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Rewards / penalties */}
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="text-xs font-semibold text-gray-500 mb-2.5">
              {result.success ? '任务奖励' : '任务结算'}
            </div>
            <div className="flex gap-4 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🪙</span>
                <span className="text-sm font-bold text-amber-600">+{result.coinsEarned}</span>
                <span className="text-xs text-gray-400">金币</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">✨</span>
                <span className="text-sm font-bold text-blue-500">+{result.expEarned}</span>
                <span className="text-xs text-gray-400">EXP</span>
              </div>
            </div>
            {Object.keys(result.statusChanges).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(result.statusChanges)
                  .filter(([, v]) => v !== 0)
                  .map(([key, val]) => (
                    <span
                      key={key}
                      className={`text-xs px-2 py-0.5 rounded-full ${val >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                    >
                      {STATUS_LABELS[key] ?? key} {val >= 0 ? '+' : ''}{val}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* AI output — collapsible */}
          {result.aiOutput && (
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setOutputExpanded(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                  📄 AI 执行成果
                  {result.aiScore !== undefined && (
                    <span className="text-gray-400 font-normal">（自评 {result.aiScore}/100）</span>
                  )}
                </span>
                {outputExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </button>
              {outputExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto bg-white font-mono">
                    {result.aiOutput}
                  </div>
                </motion.div>
              )}
            </div>
          )}

        </div>

        {/* Fixed action bar */}
        <div className="shrink-0 px-5 pb-6 pt-3 space-y-2 border-t border-gray-100 bg-white">
          <button
            onClick={onDownloadReport}
            className="w-full py-2.5 rounded-2xl border border-amber-300 bg-amber-50 text-amber-800 text-sm font-medium hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
          >
            📄 下载完整报告
          </button>
          <div className="flex gap-2">
            <Button variant="primary" fullWidth onClick={onGoToTasks}>
              返回任务中心
            </Button>
            <Button variant="ghost" fullWidth onClick={onGoHome}>
              回到主页
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default TaskCompletionModal
