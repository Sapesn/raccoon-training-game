export type ItemType = 'food' | 'boost' | 'recovery' | 'grooming' | 'special' | 'consumable'

export interface Food {
  id: string
  name: string
  emoji: string
  description: string
  rarity: 'common' | 'uncommon' | 'rare'
  price: number   // coin cost in shop
  effects: {
    hunger?: number
    mood?: number
    energy?: number
    focus?: number
    cleanliness?: number
    trust?: number
    statBoost?: Partial<Record<string, number>>  // temporary skill bonus
  }
  flavorText: string
}

export interface Item {
  id: string
  name: string
  emoji: string
  description: string
  type: ItemType
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  price: number   // coin cost in shop
  effects: {
    successRateBonus?: number
    apCostReduction?: number
    statusRestore?: Partial<Record<string, number>>
    expMultiplier?: number
    coinMultiplier?: number
    templateProficiencyBonus?: number
  }
  usableIn: 'task' | 'care' | 'anytime'
  flavorText: string
}

export interface InventorySlotFood {
  foodId: string
  quantity: number
}

export interface InventorySlotItem {
  itemId: string
  quantity: number
}

export interface Inventory {
  foods: InventorySlotFood[]
  items: InventorySlotItem[]
  templateShards: number
  collectedFoodIds: string[]   // for achievement tracking
  collectedItemIds: string[]
}
