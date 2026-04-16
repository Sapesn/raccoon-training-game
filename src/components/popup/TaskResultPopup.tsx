import { motion } from 'framer-motion'
import { TaskResultCard } from '../task/TaskResultCard'
import { Button } from '../common/Button'
import type { TaskResult } from '../../types/task'

interface TaskResultPopupProps {
  result: TaskResult
  onClose: () => void
}

export function TaskResultPopup({ result, onClose }: TaskResultPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full bg-gray-50 rounded-t-3xl p-5 pb-8"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <h2 className="text-base font-bold text-gray-700 mb-4 text-center">任务结算</h2>
        <TaskResultCard result={result} />
        <div className="mt-4">
          <Button variant="primary" fullWidth onClick={onClose}>
            确认
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default TaskResultPopup
