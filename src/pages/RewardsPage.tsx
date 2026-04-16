import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { REWARDS } from '../config/rewards'
import { ConfirmModal } from '../components/popup/ConfirmModal'
import { EmptyState } from '../components/common/EmptyState'
import type { Reward } from '../types/reward'

export default function RewardsPage() {
  const { player } = useGameStore()
  const store = useGameStore()
  const [confirmReward, setConfirmReward] = useState<Reward | null>(null)
  const [claimedIds, setClaimedIds] = useState<string[]>([])
  const [claimMsg, setClaimMsg] = useState('')

  const handleClaim = (reward: Reward) => {
    if (player.rewardTickets < reward.cost) return
    setConfirmReward(reward)
  }

  const confirmClaim = () => {
    if (!confirmReward) return
    const ok = store.spendRewardTickets(confirmReward.cost)
    if (ok) {
      setClaimedIds(prev => [...prev, confirmReward.id])
      if (confirmReward.type === 'in_game') {
        // Grant in-game reward
        store.addCoins(200)
        setClaimMsg('已获得游戏内奖励！金币 +200')
      } else {
        setClaimMsg('奖励已记录，我们将在活动期间联系您兑换！')
      }
      setTimeout(() => setClaimMsg(''), 3000)
    }
    setConfirmReward(null)
  }

  const activeRewards = REWARDS.filter(r => r.isActive)

  return (
    <div className="px-4 py-4 pb-6">
      <h1 className="text-lg font-bold text-gray-800 mb-2">奖励中心</h1>

      {/* Balance */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-2xl p-4 mb-4 text-white">
        <div className="text-sm opacity-90 mb-1">当前奖励券</div>
        <div className="text-3xl font-bold flex items-center gap-2">
          🎫 {player.rewardTickets}
          <span className="text-base font-normal opacity-80">张</span>
        </div>
        <div className="text-xs opacity-70 mt-1">通过解锁成就获得奖励券</div>
      </div>

      {/* Claim message */}
      {claimMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4"
        >
          {claimMsg}
        </motion.div>
      )}

      {/* Reward cards */}
      {activeRewards.length === 0 ? (
        <EmptyState emoji="🎁" title="暂无可用奖励" description="活动期间会有更多奖励上架" />
      ) : (
        <div className="space-y-3">
          {activeRewards.map(reward => {
            const claimed = claimedIds.includes(reward.id)
            const canAfford = player.rewardTickets >= reward.cost
            const soldOut = reward.remaining <= 0

            return (
              <div
                key={reward.id}
                className={`bg-white rounded-2xl border shadow-sm p-4 ${
                  claimed ? 'border-green-200 opacity-75' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl shrink-0">{reward.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{reward.name}</span>
                      {reward.type === 'in_game' && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">游戏内</span>
                      )}
                      {reward.needLogin && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">需登录</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
                        🎫 {reward.cost} 张
                      </span>
                      {reward.remaining < 10 && !soldOut && (
                        <span className="text-xs text-red-400">仅剩 {reward.remaining} 个</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  {claimed ? (
                    <div className="text-center text-xs text-green-600 py-2">✅ 已兑换</div>
                  ) : soldOut ? (
                    <div className="text-center text-xs text-gray-400 py-2">已售罄</div>
                  ) : (
                    <button
                      onClick={() => handleClaim(reward)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
                        canAfford
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? '立即兑换' : '奖励券不足'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* How to earn */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">如何获得奖励券？</h3>
        <ul className="space-y-1 text-xs text-amber-700">
          <li>🏆 解锁指定成就后自动发放</li>
          <li>📅 连续登录 7 天奖励</li>
          <li>🎯 完成 S 级及以上任务</li>
          <li>🎉 参与限时活动</li>
        </ul>
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        isOpen={confirmReward !== null}
        title={`兑换 ${confirmReward?.name ?? ''}`}
        message={`确认花费 🎫 ${confirmReward?.cost} 张奖励券兑换「${confirmReward?.name}」吗？${confirmReward?.needLogin ? '\n\n提示：该奖励需要登录账号，我们将联系您兑换。' : ''}`}
        confirmLabel="确认兑换"
        onConfirm={confirmClaim}
        onCancel={() => setConfirmReward(null)}
      />
    </div>
  )
}
