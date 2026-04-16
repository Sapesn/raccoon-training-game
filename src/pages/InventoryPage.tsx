import { useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { FOODS } from '../config/foods'
import { ITEMS } from '../config/items'
import { ItemGrid } from '../components/inventory/ItemGrid'
import { FoodCard } from '../components/inventory/FoodCard'
import { EmptyState } from '../components/common/EmptyState'
import { useNavigate } from 'react-router-dom'

type Tab = 'food' | 'items'

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>('food')
  const navigate = useNavigate()
  const store = useGameStore()
  const { inventory } = store

  const handleUseFood = (foodId: string) => {
    const ok = store.feedRaccoon(foodId)
    if (ok) store.removeFood(foodId, 1)
  }

  const handleUseItem = (itemId: string) => {
    // Items that work outside of tasks
    const item = ITEMS.find(i => i.id === itemId)
    if (!item) return
    if (item.usableIn === 'task') {
      // redirect to task center
      navigate('/tasks')
      return
    }
    // Apply effects
    if (item.effects.statusRestore) {
      for (const [key, val] of Object.entries(item.effects.statusRestore)) {
        if (val !== undefined) store.updateStatus(key as never, val)
      }
    }
    store.removeItem(itemId, 1)
  }

  const foodSlots = inventory.foods.filter(f => f.quantity > 0)
  const itemSlots = inventory.items.filter(i => i.quantity > 0)

  return (
    <div className="px-4 py-4 pb-6">
      <h1 className="text-lg font-bold text-gray-800 mb-4">背包</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {([['food', '🍖 食物'], ['items', '🎒 道具']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'food' ? (
        foodSlots.length === 0 ? (
          <EmptyState
            emoji="🍴"
            title="没有食物了"
            description="去探索地图寻找食物吧"
            action={{ label: '去探索', onClick: () => navigate('/explore') }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {foodSlots.map(slot => {
              const food = FOODS.find(f => f.id === slot.foodId)
              if (!food) return null
              return (
                <FoodCard
                  key={slot.foodId}
                  foodId={slot.foodId}
                  quantity={slot.quantity}
                  onUse={handleUseFood}
                />
              )
            })}
          </div>
        )
      ) : (
        <>
          {itemSlots.length === 0 ? (
            <EmptyState
              emoji="🎒"
              title="背包空空的"
              description="通过探索、成就解锁或活动获得道具"
            />
          ) : (
            <ItemGrid
              items={itemSlots.map(s => ({ id: s.itemId, quantity: s.quantity }))}
              type="item"
              onUse={handleUseItem}
            />
          )}
        </>
      )}

      {/* Template shards */}
      <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧩</span>
          <div>
            <div className="text-sm font-medium text-gray-700">模板碎片</div>
            <div className="text-xs text-gray-400">用于合成新模板</div>
          </div>
        </div>
        <span className="text-xl font-bold text-amber-600">×{inventory.templateShards}</span>
      </div>
    </div>
  )
}
