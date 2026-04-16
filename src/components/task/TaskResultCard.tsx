import { motion } from 'framer-motion'
import type { TaskResult } from '../../types/task'

interface TaskResultCardProps {
  result: TaskResult
}

const GRADE_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  perfect: { label: '完美', color: 'text-purple-700', bg: 'bg-purple-50', emoji: '🌟' },
  excellent: { label: '优秀', color: 'text-blue-700', bg: 'bg-blue-50', emoji: '⭐' },
  good: { label: '良好', color: 'text-green-700', bg: 'bg-green-50', emoji: '✅' },
  partial: { label: '勉强', color: 'text-amber-700', bg: 'bg-amber-50', emoji: '🆗' },
  fail: { label: '失败', color: 'text-red-700', bg: 'bg-red-50', emoji: '❌' },
}

const SCORE_LABELS: Record<string, string> = {
  accuracy: '准确性', completeness: '完整度', expression: '表达力',
  timeliness: '时效性', stability: '稳定性',
}

export function TaskResultCard({ result }: TaskResultCardProps) {
  const grade = GRADE_CONFIG[result.grade] ?? GRADE_CONFIG.fail

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
    >
      <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl ${grade.bg}`}>
        <span className="text-3xl">{grade.emoji}</span>
        <div>
          <div className={`text-lg font-bold ${grade.color}`}>
            {result.success ? grade.label : '任务失败'}
          </div>
          <div className="text-sm text-gray-500">得分：{result.score}/100</div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1 mb-4">
        {Object.entries(result.scoreBreakdown).map(([key, val]) => (
          <div key={key} className="text-center">
            <div className="text-xs font-medium text-gray-700">{Math.round(val)}</div>
            <div className="text-[10px] text-gray-400">{SCORE_LABELS[key] ?? key}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 text-sm">
        <span className="text-amber-600 font-medium">🪙 +{result.coinsEarned}</span>
        <span className="text-blue-500 font-medium">+{result.expEarned} EXP</span>
      </div>

      {Object.keys(result.statusChanges).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Object.entries(result.statusChanges).map(([key, val]) => (
            <span
              key={key}
              className={`text-xs px-2 py-0.5 rounded-full ${val >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
            >
              {key} {val >= 0 ? '+' : ''}{val}
            </span>
          ))}
        </div>
      )}

      {result.aiOutput && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <div className="text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">AI 执行成果</div>
          <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-3 max-h-44 overflow-y-auto font-mono">
            {result.aiOutput}
          </div>
          {result.aiScore !== undefined && (
            <div className="text-[10px] text-gray-400 mt-1.5 text-right">
              AI 自评：{result.aiScore}/100
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default TaskResultCard
