import { motion } from 'framer-motion'

interface ProficiencyBarProps {
  proficiency: number
  showLabel?: boolean
}

const MILESTONES = [25, 50, 75, 100]

export function ProficiencyBar({ proficiency, showLabel = true }: ProficiencyBarProps) {
  const pct = Math.min(100, Math.max(0, proficiency))

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">熟练度</span>
          <span className="text-xs font-medium text-amber-600">{pct}/100</span>
        </div>
      )}
      <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-visible">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        {MILESTONES.filter((m) => m < 100).map((m) => (
          <div
            key={m}
            className={`absolute top-1/2 -translate-y-1/2 w-1 h-3 rounded-full ${
              pct >= m ? 'bg-white/80' : 'bg-gray-300'
            }`}
            style={{ left: `calc(${m}% - 2px)` }}
          />
        ))}
      </div>
    </div>
  )
}

export default ProficiencyBar
