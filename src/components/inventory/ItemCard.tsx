import { ITEMS } from '../../config/items'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'

interface ItemCardProps {
  itemId: string
  quantity: number
  onUse?: (itemId: string) => void
}

const RARITY_VARIANT: Record<string, 'default' | 'info' | 'warning' | 'success'> = {
  common: 'default',
  uncommon: 'info',
  rare: 'warning',
}

const RARITY_LABELS: Record<string, string> = {
  common: '普通',
  uncommon: '稀有',
  rare: '珍稀',
}

export function ItemCard({ itemId, quantity, onUse }: ItemCardProps) {
  const item = ITEMS.find((i) => i.id === itemId)
  if (!item) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{item.emoji}</span>
          <div>
            <div className="text-xs font-semibold text-gray-800">{item.name}</div>
            <div className="text-xs text-gray-400">×{quantity}</div>
          </div>
        </div>
        <Badge label={RARITY_LABELS[item.rarity] ?? item.rarity} variant={RARITY_VARIANT[item.rarity] ?? 'default'} />
      </div>

      <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>

      {onUse && (
        <Button variant="secondary" size="sm" fullWidth disabled={quantity <= 0} onClick={() => onUse(itemId)}>
          使用
        </Button>
      )}
    </div>
  )
}

export default ItemCard
