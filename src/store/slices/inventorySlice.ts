/**
 * Inventory slice: food, items, and template shard management.
 */

import type { StateCreator } from 'zustand'
import type { Inventory } from '../../types/inventory'
import type { PlayerSlice } from './playerSlice'
import { FOODS } from '../../config/foods'
import { ITEMS } from '../../config/items'

export interface InventorySlice {
  inventory: Inventory

  addFood: (foodId: string, quantity: number) => void
  removeFood: (foodId: string, quantity: number) => boolean
  addItem: (itemId: string, quantity: number) => void
  removeItem: (itemId: string, quantity: number) => boolean
  addTemplateShards: (amount: number) => void
  spendTemplateShards: (amount: number) => boolean
  /** Purchase food with coins. Returns true on success. */
  buyFood: (foodId: string, quantity?: number) => boolean
  /** Purchase item with coins. Returns true on success. */
  buyItem: (itemId: string, quantity?: number) => boolean
}

type CombinedStore = InventorySlice & PlayerSlice

const DEFAULT_INVENTORY: Inventory = {
  foods: [
    { foodId: 'squirrel_biscuit', quantity: 3 },
    { foodId: 'banana', quantity: 2 },
  ],
  items: [],
  templateShards: 0,
  collectedFoodIds: ['squirrel_biscuit', 'banana'],
  collectedItemIds: [],
}

export const createInventorySlice: StateCreator<
  CombinedStore,
  [['zustand/immer', never]],
  [],
  InventorySlice
> = (set, get) => ({
  inventory: { ...DEFAULT_INVENTORY, foods: [...DEFAULT_INVENTORY.foods.map(f => ({ ...f }))] },

  addFood: (foodId, quantity) => {
    set((state) => {
      const existing = state.inventory.foods.find(f => f.foodId === foodId)
      if (existing) {
        existing.quantity += quantity
      } else {
        state.inventory.foods.push({ foodId, quantity })
      }
      if (!state.inventory.collectedFoodIds.includes(foodId)) {
        state.inventory.collectedFoodIds.push(foodId)
      }
    })
  },

  removeFood: (foodId, quantity) => {
    const slot = get().inventory.foods.find(f => f.foodId === foodId)
    if (!slot || slot.quantity < quantity) return false
    set((state) => {
      const s = state.inventory.foods.find(f => f.foodId === foodId)
      if (!s) return
      s.quantity -= quantity
      if (s.quantity <= 0) {
        state.inventory.foods = state.inventory.foods.filter(f => f.foodId !== foodId)
      }
    })
    return true
  },

  addItem: (itemId, quantity) => {
    set((state) => {
      const existing = state.inventory.items.find(i => i.itemId === itemId)
      if (existing) {
        existing.quantity += quantity
      } else {
        state.inventory.items.push({ itemId, quantity })
      }
      if (!state.inventory.collectedItemIds.includes(itemId)) {
        state.inventory.collectedItemIds.push(itemId)
      }
    })
  },

  removeItem: (itemId, quantity) => {
    const slot = get().inventory.items.find(i => i.itemId === itemId)
    if (!slot || slot.quantity < quantity) return false
    set((state) => {
      const s = state.inventory.items.find(i => i.itemId === itemId)
      if (!s) return
      s.quantity -= quantity
      if (s.quantity <= 0) {
        state.inventory.items = state.inventory.items.filter(i => i.itemId !== itemId)
      }
    })
    return true
  },

  addTemplateShards: (amount) => {
    set((state) => {
      state.inventory.templateShards = Math.max(0, state.inventory.templateShards + amount)
    })
  },

  spendTemplateShards: (amount) => {
    if (get().inventory.templateShards < amount) return false
    set((state) => {
      state.inventory.templateShards -= amount
    })
    return true
  },

  buyFood: (foodId, quantity = 1) => {
    const food = FOODS.find(f => f.id === foodId)
    if (!food) return false
    const totalCost = food.price * quantity
    const spent = get().spendCoins(totalCost)
    if (!spent) return false
    get().addFood(foodId, quantity)
    return true
  },

  buyItem: (itemId, quantity = 1) => {
    const item = ITEMS.find(i => i.id === itemId)
    if (!item) return false
    const totalCost = item.price * quantity
    const spent = get().spendCoins(totalCost)
    if (!spent) return false
    get().addItem(itemId, quantity)
    return true
  },
})
