import { Button } from '../common/Button'
import { CoinDisplay } from '../common/CoinDisplay'
import type { Achievement } from '../../types/achievement'

interface AchievementCardProps {
  achievement: Achievement
  onClaim?: (id: string) => void
}

export function AchievementCard({ achievement, onClaim }: AchievementCardProps) {
  const isLocked = !achievement.unlockedAt
  const isHiddenLocked = isLocked && achievement.hidden

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 ${isLocked ? 'opacity-60 border-gray-100' : 'border-amber-100'}`}>
      <div className="flex items-start gap-3">
        <span className={`text-2xl ${isHiddenLocked ? 'blur-sm grayscale' : ''}`}>
          {isHiddenLocked ? '❓' : achievement.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className={`text-sm font-semibold ${isHiddenLocked ? 'blur-sm select-none' : 'text-gray-800'}`}>
              {isHiddenLocked ? '????' : achievement.name}
            </h3>
            {achievement.claimed && (
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">已领取</span>
            )}
          </div>
          <p className={`text-xs text-gray-400 ${isHiddenLocked ? 'blur-sm select-none' : ''}`}>
            {isHiddenLocked ? '完成特殊条件解锁' : achievement.description}
          </p>

          {achievement.progress !== undefined && !achievement.unlockedAt && (
            <div className="mt-2 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, achievement.progress)}%` }}
              />
            </div>
          )}

          {achievement.unlockedAt && !achievement.claimed && onClaim && (
            <div className="mt-2 flex items-center gap-2">
              {achievement.rewards.coins && (
                <CoinDisplay amount={achievement.rewards.coins} />
              )}
              {achievement.rewards.rewardTickets && (
                <span className="text-xs text-purple-600">🎫×{achievement.rewards.rewardTickets}</span>
              )}
              <Button variant="primary" size="sm" onClick={() => onClaim(achievement.id)}>
                领取奖励
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AchievementCard
