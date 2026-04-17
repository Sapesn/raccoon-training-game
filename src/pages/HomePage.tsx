import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Sun, Gift } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'
import { FOODS } from '../config/foods'
import { RaccoonAvatar } from '../components/raccoon/RaccoonAvatar'
import { RaccoonMood } from '../components/raccoon/RaccoonMood'
import { StatusPanel } from '../components/raccoon/StatusPanel'
import { APCounter } from '../components/common/APCounter'
import { CoinDisplay } from '../components/common/CoinDisplay'
import { TaskCard } from '../components/task/TaskCard'
import { Button } from '../components/common/Button'
import { getTodayString } from '../utils/dateUtils'
import { getStageForLevel } from '../config/raccoonEvolutions'
import type { CheckinResult } from '../store/slices/playerSlice'

export default function HomePage() {
  const navigate = useNavigate()
  const store = useGameStore()
  const { raccoon, player, currentAP, maxAP, gameDay, availableTasks, completedTodayTaskIds, inventory } = store
  const [statusExpanded, setStatusExpanded] = useState(false)
  const [feedPickerOpen, setFeedPickerOpen] = useState(false)
  const [actionMsg, setActionMsg] = useState('')
  const [checkinResult, setCheckinResult] = useState<CheckinResult | null>(null)

  if (!raccoon || !player.onboardingComplete) {
    navigate('/onboarding')
    return null
  }

  const todayStr = getTodayString()
  const canCheckin = player.lastCheckinDate !== todayStr

  const showMsg = (msg: string) => {
    setActionMsg(msg)
    setTimeout(() => setActionMsg(''), 2000)
  }

  const handleCheckin = () => {
    const result = store.checkin()
    if (!result) return
    if (result.foodId) store.addFood(result.foodId, 1)
    if (result.itemId) store.addItem(result.itemId, 1)
    setCheckinResult(result)
    setTimeout(() => setCheckinResult(null), 4000)
  }

  const handleFeed = (foodId: string) => {
    const ok = store.feedRaccoon(foodId)
    store.removeFood(foodId, 1)
    setFeedPickerOpen(false)
    if (ok) showMsg('喂食成功！小浣熊吃得很开心 🍴')
    else showMsg('行动点不足！')
  }

  const handlePlay = () => {
    const ok = store.playWithRaccoon()
    if (ok) showMsg('陪玩成功！小浣熊心情好多了 🎮')
    else showMsg('行动点不足！')
  }

  const handleGroom = () => {
    const ok = store.groomRaccoon()
    if (ok) showMsg('梳洗完成！小浣熊干净多了 🚿')
    else showMsg('行动点不足！')
  }

  const handleRest = () => {
    const ok = store.restRaccoon()
    if (ok) showMsg('休息好了！体力恢复 😴')
    else showMsg('行动点不足！')
  }

  const handleEndDay = () => {
    store.endDay()
    store.pushPopup({
      type: 'day_end',
      priority: 'normal',
      data: store.daySummary ?? { day: gameDay, tasksCompleted: completedTodayTaskIds.length, coinsEarned: 0, expEarned: 0, achievementsUnlocked: [], statusChanges: {}, eventsSeen: 0 },
    })
  }

  const recommendedTasks = availableTasks
    .filter(t => !completedTodayTaskIds.includes(t.id))
    .slice(0, 3)

  const availableFoods = inventory.foods
    .filter(f => f.quantity > 0)
    .map(f => ({ food: FOODS.find(fd => fd.id === f.foodId)!, quantity: f.quantity }))
    .filter(f => f.food)

  const canEndDay = currentAP === 0 || completedTodayTaskIds.length > 0

  return (
    <div className="px-4 py-4 pb-6 space-y-4">
      {/* Day header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-700">
          <Sun size={16} />
          <span className="text-sm font-medium">第 {gameDay} 天</span>
        </div>
        <div className="flex items-center gap-3">
          <CoinDisplay amount={player.coins} />
          <div className="flex flex-col items-end gap-0.5">
            <APCounter current={currentAP} max={maxAP} />
            {currentAP < maxAP && (
              <span className="text-[10px] text-amber-400">每20分钟+1</span>
            )}
          </div>
        </div>
      </div>

      {/* Check-in card */}
      <AnimatePresence>
        {canCheckin && !checkinResult && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 text-white shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm flex items-center gap-1.5">
                  <Gift size={15} /> 每日签到
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  {player.checkinStreak > 0 ? `已连续签到 ${player.checkinStreak} 天` : '今日尚未签到'}
                </div>
              </div>
              <button
                onClick={handleCheckin}
                className="bg-white text-amber-600 font-semibold text-sm px-4 py-1.5 rounded-xl shadow-sm hover:bg-amber-50 transition-colors"
              >
                签到领奖
              </button>
            </div>
          </motion.div>
        )}

        {checkinResult && (
          <motion.div
            key="checkin-reward"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-amber-50 border border-amber-300 rounded-2xl p-4"
          >
            <div className="text-sm font-semibold text-amber-800 mb-1">{checkinResult.message}</div>
            <div className="flex flex-wrap gap-2 text-xs text-amber-700">
              <span className="bg-amber-100 px-2 py-0.5 rounded-full">🪙 +{checkinResult.coinsEarned} 金币</span>
              {checkinResult.foodId && (() => {
                const food = FOODS.find(f => f.id === checkinResult.foodId)
                return food ? <span className="bg-amber-100 px-2 py-0.5 rounded-full">{food.emoji} {food.name} ×1</span> : null
              })()}
              {checkinResult.itemId && (
                <span className="bg-amber-100 px-2 py-0.5 rounded-full">🎁 道具奖励 ×1</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action feedback */}
      <AnimatePresence>
        {actionMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-2 text-center"
          >
            {actionMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Raccoon card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-4">
          <RaccoonAvatar size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-800 text-base">{raccoon.name}</span>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                Lv.{raccoon.level} {getStageForLevel(raccoon.level).badge ?? ''}
              </span>
            </div>
            <RaccoonMood />
            {/* Quick status mini bars */}
            <div className="mt-2 flex gap-2 flex-wrap">
              {(['hunger', 'mood', 'energy'] as const).map(key => {
                const val = raccoon[key] as number
                const colors: Record<string, string> = { hunger: 'bg-orange-400', mood: 'bg-pink-400', energy: 'bg-yellow-400' }
                const labels: Record<string, string> = { hunger: '饥', mood: '情', energy: '力' }
                return (
                  <div key={key} className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">{labels[key]}</span>
                    <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[key]}`} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* EXP / Stage strip */}
        {(() => {
          const stage = getStageForLevel(raccoon.level)
          const pct = Math.min(100, Math.round((raccoon.exp / raccoon.expToNext) * 100))
          return (
            <div className="mt-3 pt-3 border-t border-gray-50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-500">{stage.name}</span>
                <span className="text-xs text-gray-400">{raccoon.exp} / {raccoon.expToNext} EXP</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${stage.themeFrom}, ${stage.themeTo})` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          )
        })()}

        {/* Expand status */}
        <button
          onClick={() => setStatusExpanded(v => !v)}
          className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-amber-600 transition-colors"
        >
          {statusExpanded ? <><ChevronUp size={12} />收起详情</> : <><ChevronDown size={12} />查看详情</>}
        </button>
        <AnimatePresence>
          {statusExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3">
                <StatusPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">今日行动</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '喂食', emoji: '🍖', action: () => setFeedPickerOpen(true), disabled: currentAP < 1 },
            { label: '玩耍', emoji: '🎮', action: handlePlay, disabled: currentAP < 1 },
            { label: '梳洗', emoji: '🚿', action: handleGroom, disabled: currentAP < 1 },
            { label: '休息', emoji: '😴', action: handleRest, disabled: currentAP < 1 },
          ].map(btn => (
            <motion.button
              key={btn.label}
              whileTap={btn.disabled ? {} : { scale: 0.93 }}
              onClick={btn.disabled ? undefined : btn.action}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-colors ${
                btn.disabled
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <span className="text-xl">{btn.emoji}</span>
              <span>{btn.label}</span>
              <span className="text-gray-300 text-[10px]">1 AP</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Food picker */}
      <AnimatePresence>
        {feedPickerOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-white rounded-2xl shadow-sm border border-amber-200 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">选择食物</h3>
              <button onClick={() => setFeedPickerOpen(false)} className="text-gray-400 text-xs">取消</button>
            </div>
            {availableFoods.length === 0 ? (
              <div className="text-center py-2">
                <p className="text-xs text-gray-400 mb-2">背包里没有食物了</p>
                <button
                  onClick={() => { setFeedPickerOpen(false); navigate('/shop') }}
                  className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-colors"
                >
                  🛒 去商城购买食物
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableFoods.map(({ food, quantity }) => (
                  <motion.button
                    key={food.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFeed(food.id)}
                    className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm"
                  >
                    <span className="text-lg">{food.emoji}</span>
                    <span className="text-gray-700">{food.name}</span>
                    <span className="text-gray-400 text-xs">×{quantity}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommended tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">今日推荐任务</h3>
          <button
            onClick={() => navigate('/tasks')}
            className="text-xs text-amber-600 hover:text-amber-700"
          >
            查看全部 →
          </button>
        </div>
        {recommendedTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center text-gray-400 text-sm">
            今天的任务都完成了！🎉
          </div>
        ) : (
          <div className="space-y-2">
            {recommendedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onSelect={() => navigate(`/tasks/${task.id}/execute`)}
                disabled={currentAP < task.apCost}
              />
            ))}
          </div>
        )}
      </div>

      {/* Today summary */}
      {completedTodayTaskIds.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-sm text-green-700 font-medium">
            今天已完成 {completedTodayTaskIds.length} 个任务 ✅
          </p>
        </div>
      )}

      {/* End day */}
      {canEndDay && (
        <Button variant="secondary" fullWidth onClick={handleEndDay}>
          🌙 结束今天
        </Button>
      )}
    </div>
  )
}
