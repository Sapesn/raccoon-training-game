import { motion } from 'framer-motion'
import { useGameStore } from '../../store/useGameStore'
import { getStageForLevel } from '../../config/raccoonEvolutions'
import type { EvolutionStage } from '../../config/raccoonEvolutions'

interface RaccoonAvatarProps {
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'text-4xl',
  md: 'text-6xl',
  lg: 'text-8xl',
}

function getExpression(stage: EvolutionStage, mood: number, trust: number): string {
  const e = stage.expressions
  if (trust > 80 && mood > 70) return e.trust_happy
  if (mood > 70) return e.happy
  if (mood > 50) return e.neutral
  if (mood > 30) return e.sad
  return e.very_sad
}

/** Returns Framer Motion animate/transition props per animation style. */
function getAnimVariant(style: EvolutionStage['animStyle']) {
  switch (style) {
    case 'gentle':
      return {
        animate: { y: [0, -4, 0], scale: [1, 0.97, 1] },
        transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
      }
    case 'normal':
      return {
        animate: { y: [0, -6, 0] },
        transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
      }
    case 'energetic':
      return {
        animate: { y: [0, -8, 0], rotate: [0, 3, -3, 0] },
        transition: { duration: 2.0, repeat: Infinity, ease: 'easeInOut' },
      }
    case 'majestic':
      return {
        animate: { y: [0, -10, 0], scale: [1, 1.05, 1] },
        transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
      }
    case 'legendary':
      return {
        animate: { y: [0, -12, 0], scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] },
        transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
      }
  }
}

export function RaccoonAvatar({ size = 'md' }: RaccoonAvatarProps) {
  const { raccoon } = useGameStore()
  const stage = getStageForLevel(raccoon.level)
  const expression = getExpression(stage, raccoon.mood, raccoon.trust)
  const anim = getAnimVariant(stage.animStyle)

  // Aura wrapper style
  const auraStyle = stage.aura
    ? { boxShadow: stage.aura, borderRadius: '50%', padding: '6px' }
    : {}

  // Legend stage gets rainbow-rotating aura via CSS animation keyframes
  const legendStyle: React.CSSProperties =
    stage.id === 'legend'
      ? {
          animation: 'raccoon-rainbow 3s linear infinite',
          borderRadius: '50%',
          padding: '8px',
        }
      : {}

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Aura ring — pulsing for elite/legend */}
      {stage.aura && stage.id !== 'legend' && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: stage.aura, borderRadius: '50%' }}
          animate={
            stage.id === 'elite'
              ? { opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] }
              : { opacity: [0.7, 1, 0.7] }
          }
          transition={{ duration: stage.id === 'elite' ? 1.6 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Rainbow style tag for legend — injected once */}
      {stage.id === 'legend' && (
        <style>{`
          @keyframes raccoon-rainbow {
            0%   { box-shadow: 0 0 40px 12px rgba(239,68,68,.7),   0 0 80px 24px rgba(245,158,11,.4); }
            25%  { box-shadow: 0 0 40px 12px rgba(245,158,11,.7),  0 0 80px 24px rgba(99,102,241,.4); }
            50%  { box-shadow: 0 0 40px 12px rgba(99,102,241,.7),  0 0 80px 24px rgba(16,185,129,.4); }
            75%  { box-shadow: 0 0 40px 12px rgba(16,185,129,.7),  0 0 80px 24px rgba(239,68,68,.4); }
            100% { box-shadow: 0 0 40px 12px rgba(239,68,68,.7),   0 0 80px 24px rgba(245,158,11,.4); }
          }
          @keyframes raccoon-legend-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      )}

      {/* Main emoji */}
      <motion.div
        className={`select-none ${sizeMap[size]}`}
        style={stage.id === 'legend' ? legendStyle : auraStyle}
        {...anim}
      >
        {expression}
      </motion.div>

      {/* Floating badge top-right */}
      {stage.badge && size !== 'sm' && (
        <motion.span
          className="absolute -top-1 -right-2 text-lg leading-none select-none"
          animate={{ rotate: [0, 10, -5, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        >
          {stage.badge}
        </motion.span>
      )}

      {/* Sparkle particles for elite/legend */}
      {(stage.id === 'elite' || stage.id === 'legend') && size === 'lg' && (
        <>
          {[...Array(stage.id === 'legend' ? 5 : 3)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-xs select-none pointer-events-none"
              style={{
                left: `${[10, 75, 20, 85, 50][i]}%`,
                top: `${[-15, -10, 90, 80, -20][i]}%`,
              }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], y: [0, -8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4 }}
            >
              ✨
            </motion.span>
          ))}
        </>
      )}
    </div>
  )
}

export default RaccoonAvatar
