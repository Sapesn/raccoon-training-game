import { FoodCard } from './FoodCard'
import { ItemCard } from './ItemCard'
import { EmptyState } from '../common/EmptyState'

interface ItemGridProps {
  items: { id: string; quantity: number }[]
  type: 'food' | 'item'
  onUse: (id: string) => void
}

export function ItemGrid({ items, type, onUse }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        emoji={type === 'food' ? '🍖' : '🎒'}
        title={type === 'food' ? '背包里没有食物' : '背包里没有道具'}
        description="去商店购买一些吧"
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ id, quantity }) =>
        type === 'food' ? (
          <FoodCard key={id} foodId={id} quantity={quantity} onUse={onUse} />
        ) : (
          <ItemCard key={id} itemId={id} quantity={quantity} onUse={onUse} />
        )
      )}
    </div>
  )
}

export default ItemGrid
