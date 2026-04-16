import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../common/Button'
import { CoinDisplay } from '../common/CoinDisplay'
import type { Achievement } from '../../types/achievement'

interface AchievementPopupProps {
  achievement: Achievement
  onClose: () => void
}

export function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      {/* confetti dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              ['bg-amber-400','bg-pink-400','bg-blue-400','bg-green-400','bg-purple-400'][i % 5]
            }`}
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 40 + 30}%` }}
            initial={{ y: -20, opacity: 0, scale: 0 }}
            animate={{ y: [0, -80, 120], opacity: [0, 1, 0], scale: [0, 1, 0.5] }}
            transition={{ delay: i * 0.06, duration: 1.2 }}
          />
        ))}
      </div>

      <motion.div
        className="relative bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm text-center"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <motion.div
          className="text-5xl mb-3"
          animate={{ rotate: [0, -10, 10, -5, 0] }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {achievement.emoji}
        </motion.div>

        <div className="text-xs font-medium text-amber-500 mb-1">成就解锁！</div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">{achievement.name}</h2>
        <p className="text-sm text-gray-400 mb-4">{achievement.description}</p>

        {(achievement.rewards.coins || achievement.rewards.rewardTickets) && (
          <div className="bg-amber-50 rounded-xl p-3 mb-4 flex justify-center gap-4">
            {achievement.rewards.coins && <CoinDisplay amount={achievement.rewards.coins} />}
            {achievement.rewards.rewardTickets && (
              <span className="text-purple-600 text-sm font-medium">🎫×{achievement.rewards.rewardTickets}</span>
            )}
          </div>
        )}

        <Button variant="primary" fullWidth onClick={onClose}>
          太棒了！
        </Button>
      </motion.div>
    </div>
  )
}

export default AchievementPopup
