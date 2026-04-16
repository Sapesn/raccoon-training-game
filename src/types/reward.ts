export type RewardType = 'membership' | 'voucher' | 'physical' | 'digital' | 'in_game'
export type DeliveryType = 'code' | 'link' | 'address' | 'in_game_grant'

export interface Reward {
  id: string
  name: string
  description: string
  emoji: string
  type: RewardType
  cost: number  // rewardTickets
  stock: number
  remaining: number
  claimCondition?: string  // achievement id or ''
  needLogin: boolean
  needServerValidation: boolean
  deliveryType: DeliveryType
  isActive: boolean
  expiresAt?: string
}

export interface ClaimRecord {
  rewardId: string
  claimedAt: string
  deliveryInfo?: string
  status: 'pending' | 'delivered' | 'failed'
}
