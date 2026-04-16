import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { FOODS } from '../config/foods'
import { ITEMS } from '../config/items'
import type { Food } from '../types/inventory'
import type { Item } from '../types/inventory'

type ShopTab = 'food' | 'items'

const RARITY_CONFIG = {
  common:    { label: '普通', color: 'text-gray-500',   bg: 'bg-gray-100' },
  uncommon:  { label: '优质', color: 'text-green-600',  bg: 'bg-green-50' },
  rare:      { label: '稀有', color: 'text-purple-600', bg: 'bg-purple-50' },
  legendary: { label: '传说', color: 'text-amber-600',  bg: 'bg-amber-50' },
}

const ITEM_TYPE_LABEL: Record<string, string> = {
  boost:      '任务加成',
  recovery:   '状态恢复',
  grooming:   '清洁护理',
  special:    '特殊',
  consumable: '消耗品',
}

function Toast({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 10, x: '-50%' }}
      className="fixed bottom-24 left-1/2 z-50 bg-gray-800 text-white text-xs px-4 py-2 rounded-full shadow-lg whitespace-nowrap"
    >
      {message}
    </motion.div>
  )
}

function FoodCard({ food, onBuy }: { food: Food; onBuy: (id: string) => void }) {
  const store = useGameStore()
  const canAfford = store.player.coins >= food.price
  const rarity = RARITY_CONFIG[food.rarity]
  const ownedQty = store.inventory.foods.find(f => f.foodId === food.id)?.quantity ?? 0

  const effectLines = Object.entries(food.effects)
    .filter(([k]) => k !== 'statBoost')
    .map(([k, v]) => {
      const labels: Record<string, string> = {
        hunger: '饱腹', mood: '心情', energy: '体力', focus: '专注', cleanliness: '清洁', trust: '信任',
      }
      const val = v as number
      return `${labels[k] ?? k} ${val > 0 ? '+' : ''}${val}`
    })

  const statBoost = food.effects.statBoost
  if (statBoost) {
    Object.entries(statBoost).forEach(([k, v]) => {
      effectLines.push(`${k} +${v}`)
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start gap-3">
        <div className="text-3xl shrink-0">{food.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-gray-800 text-sm">{food.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${rarity.bg} ${rarity.color}`}>
              {rarity.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-1.5">{food.description}</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {effectLines.map(line => (
              <span key={line} className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                {line}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 italic mb-3">"{food.flavorText}"</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-amber-600">🪙 {food.price}</span>
              {ownedQty > 0 && (
                <span className="text-[10px] text-gray-400">已有 ×{ownedQty}</span>
              )}
            </div>
            <button
              onClick={() => onBuy(food.id)}
              disabled={!canAfford}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                canAfford
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canAfford ? '购买' : '金币不足'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ItemCard({ item, onBuy }: { item: Item; onBuy: (id: string) => void }) {
  const store = useGameStore()
  const canAfford = store.player.coins >= item.price
  const rarity = RARITY_CONFIG[item.rarity] ?? RARITY_CONFIG.common
  const ownedQty = store.inventory.items.find(i => i.itemId === item.id)?.quantity ?? 0

  const effectLines: string[] = []
  const e = item.effects
  if (e.successRateBonus)        effectLines.push(`成功率 +${e.successRateBonus}%`)
  if (e.apCostReduction)         effectLines.push(`AP消耗 −${e.apCostReduction}`)
  if (e.expMultiplier)           effectLines.push(`经验 ×${e.expMultiplier}`)
  if (e.templateProficiencyBonus) effectLines.push(`模板熟练 +${e.templateProficiencyBonus}`)
  if (e.statusRestore) {
    const labels: Record<string, string> = {
      energy: '体力', mood: '心情', focus: '专注', cleanliness: '清洁', trust: '信任',
    }
    Object.entries(e.statusRestore).forEach(([k, v]) => {
      effectLines.push(`${labels[k] ?? k} +${v}`)
    })
  }

  const usableLabel: Record<string, string> = {
    task: '任务中使用', care: '护理时使用', anytime: '随时使用',
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start gap-3">
        <div className="text-3xl shrink-0">{item.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${rarity.bg} ${rarity.color}`}>
              {rarity.label}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
              {ITEM_TYPE_LABEL[item.type] ?? item.type}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-1.5">{item.description}</p>
          {effectLines.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {effectLines.map(line => (
                <span key={line} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                  {line}
                </span>
              ))}
            </div>
          )}
          <div className="text-[10px] text-gray-400 mb-2">使用场景：{usableLabel[item.usableIn]}</div>
          <p className="text-[10px] text-gray-400 italic mb-3">"{item.flavorText}"</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-amber-600">🪙 {item.price}</span>
              {ownedQty > 0 && (
                <span className="text-[10px] text-gray-400">已有 ×{ownedQty}</span>
              )}
            </div>
            <button
              onClick={() => onBuy(item.id)}
              disabled={!canAfford}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                canAfford
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canAfford ? '购买' : '金币不足'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  const store = useGameStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ShopTab>('food')
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const handleBuyFood = (foodId: string) => {
    const food = FOODS.find(f => f.id === foodId)
    if (!food) return
    const ok = store.buyFood(foodId)
    if (ok) {
      showToast(`✅ 购买成功：${food.emoji} ${food.name} ×1`)
    } else {
      showToast('❌ 金币不足')
    }
  }

  const handleBuyItem = (itemId: string) => {
    const item = ITEMS.find(i => i.id === itemId)
    if (!item) return
    const ok = store.buyItem(itemId)
    if (ok) {
      showToast(`✅ 购买成功：${item.emoji} ${item.name} ×1`)
    } else {
      showToast('❌ 金币不足')
    }
  }

  return (
    <div className="px-4 py-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-800">商城</h1>
          <p className="text-xs text-gray-400">用金币购买食物和道具</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-amber-600 px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors"
          >
            <Package size={13} /> 背包
          </button>
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
            <span className="text-sm">🪙</span>
            <span className="text-sm font-bold text-amber-700">{store.player.coins}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['food', 'items'] as ShopTab[]).map(key => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-amber-500 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-amber-300'
            }`}
          >
            {key === 'food' ? '🍎 食物' : '🎒 道具'}
          </button>
        ))}
      </div>

      {/* Purchased hint */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
        <CheckCircle2 size={12} />
        <span>购买后自动加入背包</span>
      </div>

      {/* Item grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-3"
        >
          {tab === 'food'
            ? FOODS.map(food => (
                <FoodCard key={food.id} food={food} onBuy={handleBuyFood} />
              ))
            : ITEMS.map(item => (
                <ItemCard key={item.id} item={item} onBuy={handleBuyItem} />
              ))
          }
        </motion.div>
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key="toast" message={toast} />}
      </AnimatePresence>
    </div>
  )
}
