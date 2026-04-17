import { motion } from 'framer-motion'
import { Button } from '../common/Button'
import type { EvolutionStage } from '../../config/raccoonEvolutions'

export interface EvolutionData {
  fromStage: EvolutionStage
  toStage:   EvolutionStage
  newLevel:  number
}

interface EvolutionPopupProps {
  data: EvolutionData
  onClose: () => void
}

const PARTICLE_COLORS = [
  'bg-amber-400', 'bg-pink-400', 'bg-purple-400',
  'bg-blue-400', 'bg-green-400', 'bg-rose-400', 'bg-indigo-400',
]

export function EvolutionPopup({ data, onClose }: EvolutionPopupProps) {
  const { fromStage, toStage, newLevel } = data

  // Seeded positions (avoid Math.random in render)
  const particles = Array.from({ length: 24 }, (_, i) => ({
    left: ((i * 41 + 7) % 100),
    top:  ((i * 37 + 13) % 60 + 20),
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    delay: i * 0.05,
    size: i % 3 === 0 ? 'w-3 h-3' : 'w-2 h-2',
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop with radial burst */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${toStage.themeFrom}55 0%, rgba(0,0,0,0.85) 70%)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        onClick={onClose}
      />

      {/* Particle confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${p.size} ${p.color}`}
            style={{ left: `${p.left}%`, top: `${p.top}%` }}
            initial={{ y: 0, opacity: 0, scale: 0, rotate: 0 }}
            animate={{
              y: [-20, -120, 60],
              opacity: [0, 1, 0],
              scale: [0, 1.3, 0.4],
              rotate: [0, 180, 360],
            }}
            transition={{ delay: p.delay, duration: 1.6, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* Glow burst behind card */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 320, height: 320,
          background: `radial-gradient(circle, ${toStage.themeTo}80 0%, transparent 70%)`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2.5, 1.8], opacity: [0, 0.8, 0.4] }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
      />

      {/* Main card */}
      <motion.div
        className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center overflow-hidden"
        initial={{ scale: 0.5, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 16, stiffness: 260, delay: 0.15 }}
      >
        {/* Colored top stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl"
          style={{
            background: `linear-gradient(90deg, ${toStage.themeFrom}, ${toStage.themeTo}, ${toStage.themeFrom})`,
          }}
        />

        {/* Label */}
        <motion.div
          className="text-xs font-bold tracking-widest uppercase mb-3 mt-1"
          style={{ color: toStage.themeTo }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          ✦ 进化！ ✦
        </motion.div>

        {/* Before → After */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {/* From stage */}
          <motion.div
            className="flex flex-col items-center gap-1 opacity-50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.45, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-3xl">{fromStage.expressions.neutral}</span>
            <span className="text-xs text-gray-400">{fromStage.title}</span>
          </motion.div>

          {/* Arrow */}
          <motion.div
            className="text-2xl font-bold"
            style={{ color: toStage.themeTo }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.4, 1] }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            →
          </motion.div>

          {/* To stage — large + bouncy */}
          <motion.div
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, x: 20, scale: 0.6 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.55, type: 'spring', damping: 14, stiffness: 300 }}
          >
            <motion.span
              className="text-5xl"
              animate={{ rotate: [0, -8, 8, -4, 0] }}
              transition={{ delay: 0.85, duration: 0.7 }}
            >
              {toStage.expressions.trust_happy}
            </motion.span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: `${toStage.themeFrom}`,
                color: toStage.themeTo,
              }}
            >
              {toStage.title}
            </span>
          </motion.div>
        </div>

        {/* Stage name */}
        <motion.h2
          className="text-xl font-bold text-gray-900 mb-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          {toStage.name}
        </motion.h2>

        {/* Level badge */}
        <motion.div
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-3 px-3 py-1 rounded-full"
          style={{ background: `${toStage.themeFrom}`, color: toStage.themeTo }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
        >
          <span>Lv.{newLevel}</span>
          {toStage.badge && <span>{toStage.badge}</span>}
        </motion.div>

        {/* Description */}
        <motion.p
          className="text-sm text-gray-500 mb-5 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {toStage.description}
        </motion.p>

        {/* Unlock message */}
        <motion.p
          className="text-xs font-medium mb-4"
          style={{ color: toStage.themeTo }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          🎉 {toStage.unlockMessage}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Button variant="primary" fullWidth onClick={onClose}>
            太棒了！继续成长！
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default EvolutionPopup
