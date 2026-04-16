import { motion } from 'framer-motion'
import { DifficultyBadge } from './DifficultyBadge'
import type { Task } from '../../types/task'

interface TaskCardProps {
  task: Task
  onSelect: (task: Task) => void
  disabled?: boolean
}

const URGENCY_STYLES: Record<string, string> = {
  urgent: 'bg-red-100 text-red-600',
  high: 'bg-orange-100 text-orange-600',
  normal: 'bg-gray-100 text-gray-500',
  low: 'bg-green-100 text-green-600',
}

const URGENCY_LABELS: Record<string, string> = {
  urgent: '紧急',
  high: '较高',
  normal: '普通',
  low: '宽松',
}

export function TaskCard({ task, onSelect, disabled = false }: TaskCardProps) {
  return (
    <motion.div
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={() => !disabled && onSelect(task)}
      className={`bg-white rounded-2xl shadow-sm border p-4 ${
        disabled ? 'opacity-50 cursor-not-allowed border-gray-100' : 'cursor-pointer border-gray-100 hover:border-amber-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <DifficultyBadge difficulty={task.difficulty} />
          <span className="text-xs text-gray-400 bg-gray-50 rounded px-2 py-0.5">{task.category}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${URGENCY_STYLES[task.urgency] ?? URGENCY_STYLES.normal}`}>
            {URGENCY_LABELS[task.urgency] ?? task.urgency}
          </span>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-gray-800 mb-1">{task.name}</h3>
      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{task.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="text-amber-500">●</span>
            <span>×{task.apCost} AP</span>
          </span>
          <span className="text-amber-600">🪙 {task.rewards.coins}</span>
          <span className="text-blue-500">+{task.rewards.exp} EXP</span>
        </div>
        <span className="text-gray-400">{task.baseSuccessRate}% 基础</span>
      </div>
    </motion.div>
  )
}

export default TaskCard
