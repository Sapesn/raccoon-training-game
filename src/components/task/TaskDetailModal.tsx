import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { DifficultyBadge } from './DifficultyBadge'
import { Button } from '../common/Button'
import type { Task } from '../../types/task'

interface TaskDetailModalProps {
  task: Task
  onExecute: () => void
  onClose: () => void
  isOpen: boolean
}

const SKILL_LABELS: Record<string, string> = {
  dexterity: '灵巧', understanding: '理解', expression: '表达',
  analysis: '分析', creativity: '创意', stability: '稳定性',
}

export function TaskDetailModal({ task, onExecute, onClose, isOpen }: TaskDetailModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={task.difficulty} />
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{task.category}</span>
                </div>
                <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-1">{task.name}</h2>
              <p className="text-sm text-gray-500 mb-2">{task.description}</p>
              <p className="text-xs text-gray-400 italic mb-4">"{task.flavorText}"</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-amber-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">AP 消耗</div>
                  <div className="text-base font-bold text-amber-600">×{task.apCost}</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">基础成功率</div>
                  <div className="text-base font-bold text-green-600">{Math.round(task.baseSuccessRate * 100)}%</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <div className="text-xs font-medium text-gray-600 mb-2">任务奖励</div>
                <div className="flex gap-4">
                  <span className="text-sm text-amber-600 font-medium">🪙 {task.rewards.coins} 金币</span>
                  <span className="text-sm text-blue-500 font-medium">+{task.rewards.exp} EXP</span>
                </div>
              </div>

              {task.recommendedStats.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-600 mb-2">推荐能力</div>
                  <div className="flex gap-2 flex-wrap">
                    {task.recommendedStats.map((s) => (
                      <span key={s} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-lg">
                        {SKILL_LABELS[s] ?? s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="primary" size="lg" fullWidth onClick={onExecute}>
                开始执行任务
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TaskDetailModal
