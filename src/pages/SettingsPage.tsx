import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { ConfirmModal } from '../components/popup/ConfirmModal'
import { Button } from '../components/common/Button'

export default function SettingsPage() {
  const navigate = useNavigate()
  const store = useGameStore()
  const { player, raccoon } = store
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [nickname, setNickname] = useState(player.nickname)
  const [nicknameEditing, setNicknameEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSaveNickname = () => {
    if (nickname.trim()) {
      store.updatePlayer({ nickname: nickname.trim() })
      setNicknameEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }
  }

  const handleReset = () => {
    setShowResetConfirm(false)
    // Re-navigate to onboarding with reset
    store.updatePlayer({ onboardingComplete: false })
    navigate('/onboarding')
  }

  const handleClear = () => {
    setShowClearConfirm(false)
    localStorage.removeItem('raccoon-game-v1')
    window.location.reload()
  }

  return (
    <div className="px-4 py-4 pb-6 space-y-4">
      <h1 className="text-lg font-bold text-gray-800">设置</h1>

      {/* Tutorial entry */}
      <button
        onClick={() => navigate('/tutorial')}
        className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-left hover:bg-amber-100 transition-colors"
      >
        <span className="text-2xl">📖</span>
        <div>
          <div className="font-semibold text-amber-800 text-sm">游戏教程</div>
          <div className="text-xs text-amber-600">学习如何提升专注度、技能等各项属性</div>
        </div>
        <span className="ml-auto text-amber-400 text-lg">›</span>
      </button>

      {/* Character info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">角色信息</h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">玩家昵称</label>
            {nicknameEditing ? (
              <div className="flex gap-2">
                <input
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="flex-1 border border-amber-300 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  maxLength={12}
                />
                <Button size="sm" variant="primary" onClick={handleSaveNickname}>保存</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">{player.nickname}</span>
                <button
                  onClick={() => setNicknameEditing(true)}
                  className="text-xs text-amber-600 hover:text-amber-700"
                >
                  修改
                </button>
              </div>
            )}
            {saved && <p className="text-xs text-green-500 mt-1">已保存</p>}
          </div>

          <div className="border-t border-gray-100 pt-3">
            <label className="text-xs text-gray-400 mb-2 block">浣熊信息</label>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🦝</span>
              <div>
                <div className="font-medium text-gray-800">{raccoon.name}</div>
                <div className="text-xs text-gray-400">Lv.{raccoon.level} · {player.totalDaysPlayed} 天</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <label className="text-xs text-gray-400 mb-2 block">游戏进度</label>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: '游戏天数', value: player.totalDaysPlayed },
                { label: '总金币', value: player.coins },
                { label: '玩家等级', value: `Lv.${player.level}` },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-2">
                  <div className="font-bold text-gray-800 text-sm">{item.value}</div>
                  <div className="text-xs text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Game settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">游戏设置</h2>
        <div className="space-y-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowResetConfirm(true)}
          >
            🔄 重新开始游戏
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => setShowClearConfirm(true)}
          >
            🗑️ 清除所有存档
          </Button>
        </div>
      </div>

      {/* Dev tools */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-amber-700 mb-3">🔧 测试工具</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => store.addCoins(50)}
            className="bg-white border border-amber-200 text-amber-700 text-sm py-2 rounded-xl hover:bg-amber-50"
          >
            +50 硬币
          </button>
          <button
            onClick={() => store.addExp(100)}
            className="bg-white border border-amber-200 text-amber-700 text-sm py-2 rounded-xl hover:bg-amber-50"
          >
            +100 EXP
          </button>
          <button
            onClick={() => store.addAP(1)}
            className="bg-white border border-amber-200 text-amber-700 text-sm py-2 rounded-xl hover:bg-amber-50"
          >
            +1 AP
          </button>
          <button
            onClick={() => { store.refreshDailyTasks() }}
            className="bg-white border border-amber-200 text-amber-700 text-sm py-2 rounded-xl hover:bg-amber-50"
          >
            刷新任务
          </button>
          <button
            onClick={() => { store.addItem('lucky_charm', 1); store.addFood('squirrel_biscuit', 3) }}
            className="bg-white border border-amber-200 text-amber-700 text-sm py-2 rounded-xl hover:bg-amber-50 col-span-2"
          >
            获取测试物品
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-2">关于游戏</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          小浣熊养殖计划 V1.0<br />
          一款把「养宠物」与「训练 AI 助理」融合在一起的网页文字养成游戏。
        </p>
        <p className="text-xs text-gray-300 mt-2">🦝 小浣熊出没注意</p>
      </div>

      {/* Confirm modals */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="重新开始游戏"
        message="将回到新手引导，但不会清除存档数据。确定吗？"
        confirmLabel="确定重置"
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
      <ConfirmModal
        isOpen={showClearConfirm}
        title="清除所有存档"
        message="这将永久删除所有游戏数据，包括角色、成就、道具。此操作无法撤销！"
        confirmLabel="清除存档"
        onConfirm={handleClear}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  )
}
