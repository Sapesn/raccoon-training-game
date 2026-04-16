import { motion } from 'framer-motion'
import type { StatusKey } from '../../types/raccoon'

interface StatusBarProps {
  statusKey: StatusKey
  value: number
}

const STATUS_CONFIG: Record<StatusKey, { label: string; emoji: string; color: string }> = {
  hunger: { label: '饥饿', emoji: '🍖', color: 'bg-orange-400' },
  mood: { label: '心情', emoji: '😊', color: 'bg-pink-400' },
  energy: { label: '体力', emoji: '⚡', color: 'bg-yellow-400' },
  focus: { label: '专注', emoji: '🎯', color: 'bg-blue-400' },
  cleanliness: { label: '清洁', emoji: '✨', color: 'bg-teal-400' },
  trust: { label: '信任', emoji: '💜', color: 'bg-purple-400' },
}

export function StatusBar({ statusKey, value }: StatusBarProps) {
  const config = STATUS_CONFIG[statusKey]
  const pct = Math.min(100, Math.max(0, value))

  const textColor =
    pct <= 20 ? 'text-red-500' : pct <= 40 ? 'text-amber-500' : 'text-gray-600'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-1 text-xs text-gray-600">
          <span>{config.emoji}</span>
          <span>{config.label}</span>
        </span>
        <span className={`text-xs font-medium ${textColor}`}>{Math.round(pct)}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${config.color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default StatusBar
