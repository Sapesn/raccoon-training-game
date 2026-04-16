import { motion } from 'framer-motion'
import { useGameStore } from '../../store/useGameStore'
import type { SkillKey } from '../../types/raccoon'

const SKILL_CONFIG: Record<SkillKey, { label: string; color: string }> = {
  dexterity: { label: '灵巧', color: 'bg-orange-400' },
  understanding: { label: '理解', color: 'bg-blue-400' },
  expression: { label: '表达', color: 'bg-pink-400' },
  analysis: { label: '分析', color: 'bg-indigo-400' },
  creativity: { label: '创意', color: 'bg-purple-400' },
  stability: { label: '稳定性', color: 'bg-teal-400' },
}

const SKILL_KEYS: SkillKey[] = ['dexterity', 'understanding', 'expression', 'analysis', 'creativity', 'stability']

export function SkillsPanel() {
  const { raccoon } = useGameStore()

  return (
    <div className="grid grid-cols-2 gap-3">
      {SKILL_KEYS.map((key) => {
        const config = SKILL_CONFIG[key]
        const val = raccoon.stats[key] ?? 0
        return (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">{config.label}</span>
              <span className="text-xs font-medium text-gray-500">{val}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${config.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, val)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SkillsPanel
