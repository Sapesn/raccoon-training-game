import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { Button } from '../components/common/Button'
import { APCounter } from '../components/common/APCounter'

interface ExploreArea {
  id: string
  name: string
  emoji: string
  description: string
  risk: 'low' | 'medium' | 'high'
  riskLabel: string
  riskColor: string
  possibleLoot: string
  apCost: number
}

const EXPLORE_AREAS: ExploreArea[] = [
  {
    id: 'living_room', name: '客厅', emoji: '🛋️',
    description: '宽敞的客厅里散落着各种小东西，角落里可能藏着好东西。',
    risk: 'low', riskLabel: '低风险', riskColor: 'text-green-500',
    possibleLoot: '零食、道具碎片', apCost: 2,
  },
  {
    id: 'bookshelf', name: '书架', emoji: '📚',
    description: '满满的书架，翻翻看能找到有用的资料或者隐藏的笔记。',
    risk: 'low', riskLabel: '低风险', riskColor: 'text-green-500',
    possibleLoot: '模板碎片、笔记', apCost: 2,
  },
  {
    id: 'kitchen', name: '厨房', emoji: '🍳',
    description: '各种食材和零食的圣地，但也可能有你不想见到的东西。',
    risk: 'medium', riskLabel: '中等风险', riskColor: 'text-yellow-500',
    possibleLoot: '食物、道具', apCost: 2,
  },
  {
    id: 'archive_room', name: '资料室', emoji: '🗄️',
    description: '堆满了文件和数据的神秘房间，也许有价值的委托在等着你。',
    risk: 'medium', riskLabel: '中等风险', riskColor: 'text-yellow-500',
    possibleLoot: '委托任务、模板碎片', apCost: 2,
  },
  {
    id: 'server_room', name: '服务器机房', emoji: '🖥️',
    description: '嗡嗡作响的服务器，小浣熊有些紧张——但稀有道具也许就在这里。',
    risk: 'high', riskLabel: '高风险', riskColor: 'text-red-500',
    possibleLoot: '稀有道具、升级材料', apCost: 2,
  },
  {
    id: 'secret_stash', name: '小浣熊的秘密仓库', emoji: '🔒',
    description: '不知道从哪里找来的宝贝全都藏在这里，就是打开需要运气。',
    risk: 'high', riskLabel: '高风险', riskColor: 'text-red-500',
    possibleLoot: '隐藏奖励、特殊道具', apCost: 2,
  },
]

interface ExploreResult {
  areaId: string
  success: boolean
  loot: string[]
  message: string
}

export default function ExplorePage() {
  const store = useGameStore()
  const { currentAP, maxAP } = store
  const [exploring, setExploring] = useState<string | null>(null)
  const [results, setResults] = useState<ExploreResult[]>([])

  const handleExplore = (area: ExploreArea) => {
    const ok = store.spendAP(area.apCost)
    if (!ok) return

    setExploring(area.id)
    setTimeout(() => {
      const success = Math.random() > 0.25
      let loot: string[] = []
      let message = ''

      if (success) {
        const lootOptions: Record<string, { items: string[]; messages: string[] }> = {
          living_room: { items: ['🍪 松鼠饼干 ×1'], messages: ['小浣熊在沙发缝里找到了饼干！'] },
          bookshelf: { items: ['📄 模板碎片 ×2'], messages: ['书架后面藏着一张折叠的笔记！'] },
          kitchen: { items: ['🍌 香蕉 ×2', '🍪 零食 ×1'], messages: ['橱柜里装着好多吃的！'] },
          archive_room: { items: ['📋 委托线索 ×1'], messages: ['找到了一份来历不明的委托文件！'] },
          server_room: { items: ['✨ 荧光贴纸 ×1'], messages: ['服务器后面掉落了一个奇怪的东西。'] },
          secret_stash: { items: ['🍀 幸运符 ×1'], messages: ['仓库门打开了，里面有好东西！'] },
        }
        const data = lootOptions[area.id] ?? { items: ['🎁 神秘物品 ×1'], messages: ['找到了一些东西！'] }
        loot = data.items
        message = data.messages[0]

        // Actually add items to inventory for food items
        if (area.id === 'living_room') store.addFood('squirrel_biscuit', 1)
        if (area.id === 'kitchen') { store.addFood('banana', 2) }
        if (area.id === 'bookshelf') store.addTemplateShards(2)
        if (area.id === 'server_room') store.addItem('glow_sticker', 1)
        if (area.id === 'secret_stash') store.addItem('lucky_charm', 1)
      } else {
        message = ['什么也没找到，白跑一趟。', '小浣熊翻了半天，什么都没发现。', '运气不好，下次再来。'][Math.floor(Math.random() * 3)]
      }

      const result: ExploreResult = { areaId: area.id, success, loot, message }
      setResults(prev => [result, ...prev].slice(0, 5))
      setExploring(null)
    }, 1200)
  }

  return (
    <div className="px-4 py-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">探索</h1>
        <APCounter current={currentAP} max={maxAP} />
      </div>

      <p className="text-xs text-gray-400 mb-4">派小浣熊去探索不同地点，寻找食物、道具和秘密委托。</p>

      <div className="space-y-3 mb-6">
        {EXPLORE_AREAS.map(area => {
          const isExploring = exploring === area.id
          const disabled = currentAP < area.apCost || exploring !== null

          return (
            <motion.div
              key={area.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-3xl shrink-0">{area.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{area.name}</span>
                      <span className={`text-xs ${area.riskColor}`}>{area.riskLabel}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{area.description}</p>
                    <p className="text-xs text-amber-600">可能获得：{area.possibleLoot}</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={disabled}
                  loading={isExploring}
                  onClick={() => handleExplore(area)}
                >
                  探索 −{area.apCost}AP
                </Button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Recent results */}
      {results.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3">最近探索记录</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {results.map((r, i) => {
                const area = EXPLORE_AREAS.find(a => a.id === r.areaId)
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border p-3 text-xs ${
                      r.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{area?.emoji}</span>
                      <span className="font-medium text-gray-700">{area?.name}</span>
                      <span className={r.success ? 'text-green-600' : 'text-gray-400'}>
                        {r.success ? '✅ 成功' : '❌ 失败'}
                      </span>
                    </div>
                    <p className="text-gray-500">{r.message}</p>
                    {r.loot.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {r.loot.map((l, j) => (
                          <span key={j} className="bg-white border border-green-200 text-green-700 px-2 py-0.5 rounded-full">
                            {l}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
