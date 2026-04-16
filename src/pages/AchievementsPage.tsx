import { useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { AchievementCard } from '../components/achievement/AchievementCard'
import { CategoryFilter } from '../components/achievement/CategoryFilter'
import { EmptyState } from '../components/common/EmptyState'

const CATEGORY_LABELS: Record<string, string> = {
  all: '全部',
  progression: '进阶',
  task_master: '任务',
  raccoon_bonds: '情感',
  collector: '收集',
  template_expert: '模板',
  hidden: '隐藏',
}

export default function AchievementsPage() {
  const { achievements, player } = useGameStore()
  const store = useGameStore()
  const [category, setCategory] = useState('all')

  const categories = ['all', ...Object.keys(CATEGORY_LABELS).filter(k => k !== 'all')]

  const filtered = achievements.filter(a => {
    if (category === 'all') return true
    return a.category === category
  })

  const unlockedCount = achievements.filter(a => a.unlockedAt).length
  const totalRewardCoins = achievements
    .filter(a => a.claimed)
    .reduce((sum, a) => sum + (a.rewards.coins ?? 0), 0)

  const handleClaim = (id: string) => {
    store.claimAchievement(id)
  }

  return (
    <div className="px-4 py-4 pb-6">
      <h1 className="text-lg font-bold text-gray-800 mb-2">成就</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: '已解锁', value: `${unlockedCount}/${achievements.length}`, emoji: '🏆' },
          { label: '已领取金币', value: totalRewardCoins.toString(), emoji: '🪙' },
          { label: '游戏天数', value: player.totalDaysPlayed.toString(), emoji: '📅' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
            <div className="text-lg">{stat.emoji}</div>
            <div className="text-base font-bold text-gray-800">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <CategoryFilter
        categories={categories}
        selected={category}
        onChange={setCategory}
      />

      {/* Achievement list */}
      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState emoji="🔒" title="暂无成就" description="继续游戏来解锁成就吧" />
        ) : (
          filtered.map(ach => (
            <AchievementCard
              key={ach.id}
              achievement={ach}
              onClaim={handleClaim}
            />
          ))
        )}
      </div>
    </div>
  )
}
