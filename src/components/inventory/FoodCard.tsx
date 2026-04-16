import { useState } from 'react'
import { FOODS } from '../../config/foods'
import { Button } from '../common/Button'

interface FoodCardProps {
  foodId: string
  quantity: number
  onUse: (foodId: string) => void
}

const RARITY_COLORS: Record<string, string> = {
  common: 'text-gray-500',
  uncommon: 'text-blue-600',
  rare: 'text-purple-600',
}

export function FoodCard({ foodId, quantity, onUse }: FoodCardProps) {
  const [showEffects, setShowEffects] = useState(false)
  const food = FOODS.find((f) => f.id === foodId)
  if (!food) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{food.emoji}</span>
          <div>
            <div className={`text-xs font-medium ${RARITY_COLORS[food.rarity] ?? 'text-gray-600'}`}>
              {food.name}
            </div>
            <div className="text-xs text-gray-400">×{quantity}</div>
          </div>
        </div>
        <button
          onClick={() => setShowEffects(!showEffects)}
          className="text-xs text-gray-400 hover:text-amber-600"
        >
          {showEffects ? '▲' : '▼'}
        </button>
      </div>

      {showEffects && (
        <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-500 space-y-0.5">
          {Object.entries(food.effects)
            .filter(([k]) => k !== 'statBoost')
            .map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span>{k}</span>
                <span className={Number(v) > 0 ? 'text-green-600' : 'text-red-500'}>
                  {Number(v) > 0 ? '+' : ''}{String(v)}
                </span>
              </div>
            ))}
          {food.effects.statBoost &&
            Object.entries(food.effects.statBoost).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span>{k} (技能)</span>
                <span className="text-blue-600">+{v}</span>
              </div>
            ))}
        </div>
      )}

      <Button variant="primary" size="sm" fullWidth disabled={quantity <= 0} onClick={() => onUse(foodId)}>
        喂食
      </Button>
    </div>
  )
}

export default FoodCard
