/**
 * Player slice: currency, exp, leveling, onboarding, daily check-in.
 */

import type { StateCreator } from 'zustand'
import type { Player } from '../../types/player'
import { LEVEL_EXP_TABLE } from '../../config/gameConstants'
import { getTodayString } from '../../utils/dateUtils'
import { range } from '../../utils/randomUtils'

export interface CheckinResult {
  coinsEarned: number
  foodId?: string      // bonus food to add to inventory
  itemId?: string      // bonus item to add to inventory
  streakDay: number
  message: string
}

export interface PlayerSlice {
  player: Player

  initPlayer: (nickname: string) => void
  updatePlayer: (updates: Partial<Player>) => void
  addCoins: (amount: number) => void
  spendCoins: (amount: number) => boolean
  addExp: (amount: number) => void
  addRewardTickets: (amount: number) => void
  spendRewardTickets: (amount: number) => boolean
  completeOnboarding: () => void
  /** Perform daily check-in. Returns null if already checked in today. */
  checkin: () => CheckinResult | null
}

const DEFAULT_PLAYER: Player = {
  id: '',
  nickname: '训练师',
  level: 1,
  exp: 0,
  expToNext: LEVEL_EXP_TABLE[1] ?? 100,
  coins: 100,
  researchPoints: 0,
  rewardTickets: 0,
  trustStars: 0,
  onboardingComplete: false,
  createdAt: '',
  lastLoginDate: '',
  loginStreak: 0,
  totalDaysPlayed: 0,
  lastCheckinDate: '',
  checkinStreak: 0,
}

function getExpToNext(level: number): number {
  return LEVEL_EXP_TABLE[level] ?? LEVEL_EXP_TABLE[LEVEL_EXP_TABLE.length - 1]
}

/** Returns the check-in reward for a given streak day (1-indexed). */
function getCheckinReward(streak: number): Omit<CheckinResult, 'streakDay'> {
  // Milestone bonuses
  if (streak >= 30) return { coinsEarned: 150, itemId: 'rainbow_exp_card', message: `🏆 连续签到 ${streak} 天！获得传说奖励！` }
  if (streak >= 14) return { coinsEarned: 80,  itemId: 'lucky_charm',      message: `🌟 连续签到 ${streak} 天！获得幸运符！` }
  if (streak >= 7)  return { coinsEarned: 50,  itemId: 'glow_sticker',     message: `⭐ 连续签到 7 天！获得荧光贴纸！` }
  if (streak >= 5)  return { coinsEarned: 35,  foodId: 'energy_bar',       message: `✨ 连续签到 5 天！获得能量棒！` }
  if (streak >= 3)  return { coinsEarned: 30,  foodId: 'dried_fish',       message: `🎉 连续签到 3 天！获得小鱼干！` }
  return { coinsEarned: 20, message: `☀️ 今日签到 +20 金币` }
}

export const createPlayerSlice: StateCreator<
  PlayerSlice,
  [['zustand/immer', never]],
  [],
  PlayerSlice
> = (set, get) => ({
  player: { ...DEFAULT_PLAYER },

  initPlayer: (nickname) => {
    const today = getTodayString()
    set((state) => {
      state.player = {
        ...DEFAULT_PLAYER,
        id: `player_${Date.now()}_${range(1000, 9999)}`,
        nickname,
        createdAt: today,
        lastLoginDate: today,
        loginStreak: 1,
        totalDaysPlayed: 1,
      }
    })
  },

  updatePlayer: (updates) => {
    set((state) => {
      Object.assign(state.player, updates)
    })
  },

  addCoins: (amount) => {
    set((state) => {
      state.player.coins = Math.max(0, state.player.coins + amount)
    })
  },

  spendCoins: (amount) => {
    const { player } = get()
    if (player.coins < amount) return false
    set((state) => {
      state.player.coins = state.player.coins - amount
    })
    return true
  },

  addExp: (amount) => {
    set((state) => {
      state.player.exp += amount

      const maxLevel = LEVEL_EXP_TABLE.length - 1
      while (
        state.player.level < maxLevel &&
        state.player.exp >= getExpToNext(state.player.level)
      ) {
        state.player.exp -= getExpToNext(state.player.level)
        state.player.level += 1
        state.player.expToNext = getExpToNext(state.player.level)
      }

      if (state.player.level >= maxLevel) {
        state.player.exp = 0
        state.player.expToNext = 0
      }
    })
  },

  addRewardTickets: (amount) => {
    set((state) => {
      state.player.rewardTickets = Math.max(0, state.player.rewardTickets + amount)
    })
  },

  spendRewardTickets: (amount) => {
    const { player } = get()
    if (player.rewardTickets < amount) return false
    set((state) => {
      state.player.rewardTickets -= amount
    })
    return true
  },

  completeOnboarding: () => {
    set((state) => {
      state.player.onboardingComplete = true
    })
  },

  checkin: () => {
    const today = getTodayString()
    const { player } = get()

    // Already checked in today
    if (player.lastCheckinDate === today) return null

    // Calculate new streak
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const newStreak = player.lastCheckinDate === yesterdayStr
      ? player.checkinStreak + 1
      : 1

    const reward = getCheckinReward(newStreak)

    set((state) => {
      state.player.lastCheckinDate = today
      state.player.checkinStreak = newStreak
      state.player.coins += reward.coinsEarned
    })

    return { ...reward, streakDay: newStreak }
  },
})
