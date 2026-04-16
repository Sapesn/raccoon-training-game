export interface Player {
  id: string
  nickname: string
  level: number
  exp: number
  expToNext: number
  coins: number
  researchPoints: number
  rewardTickets: number
  trustStars: number
  onboardingComplete: boolean
  createdAt: string
  lastLoginDate: string
  loginStreak: number
  totalDaysPlayed: number
  lastCheckinDate: string    // ISO date string, YYYY-MM-DD
  checkinStreak: number      // consecutive daily check-ins
}
