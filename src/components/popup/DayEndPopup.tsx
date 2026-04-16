import { motion } from 'framer-motion'
import { Button } from '../common/Button'
import { CoinDisplay } from '../common/CoinDisplay'

interface DaySummary {
  day: number
  tasksCompleted: number
  coinsEarned: number
  expEarned: number
  achievementsUnlocked: string[]
  statusChanges: Record<string, number>
}

interface DayEndPopupProps {
  summary: DaySummary
  onConfirm: () => void
}

export function DayEndPopup({ summary, onConfirm }: DayEndPopupProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="text-5xl mb-4"
        >
          🌙
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-gray-800 mb-1"
        >
          第 {summary.day} 天结束了
        </motion.h1>
        <p className="text-sm text-gray-400 mb-8">今天也辛苦了！</p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-5 space-y-3 mb-6"
        >
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">完成任务</span>
            <span className="font-semibold text-gray-700">{summary.tasksCompleted} 个</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-500">获得金币</span>
            <CoinDisplay amount={summary.coinsEarned} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">获得经验</span>
            <span className="font-semibold text-blue-600">+{summary.expEarned} EXP</span>
          </div>
          {summary.achievementsUnlocked.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">解锁成就</span>
              <span className="font-semibold text-purple-600">{summary.achievementsUnlocked.length} 个 🏆</span>
            </div>
          )}
        </motion.div>

        {Object.keys(summary.statusChanges).length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-sm mb-6"
          >
            <div className="text-xs text-gray-400 text-center mb-2">状态变化</div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {Object.entries(summary.statusChanges).map(([k, v]) => (
                <span
                  key={k}
                  className={`text-xs px-2 py-0.5 rounded-full ${v >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                >
                  {k} {v >= 0 ? '+' : ''}{v}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-5">
        <Button variant="primary" size="lg" fullWidth onClick={onConfirm}>
          迎接新的一天 🌅
        </Button>
      </div>
    </motion.div>
  )
}

export default DayEndPopup
