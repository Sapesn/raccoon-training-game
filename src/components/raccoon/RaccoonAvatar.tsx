import { motion } from 'framer-motion'
import { useGameStore } from '../../store/useGameStore'

interface RaccoonAvatarProps {
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'text-4xl',
  md: 'text-6xl',
  lg: 'text-8xl',
}

function getExpression(mood: number, trust: number): string {
  if (trust > 80 && mood > 70) return '🦝✨'
  if (mood > 70) return '🦝😊'
  if (mood > 50) return '🦝'
  if (mood > 30) return '🦝😕'
  return '🦝😢'
}

export function RaccoonAvatar({ size = 'md' }: RaccoonAvatarProps) {
  const { raccoon } = useGameStore()
  const expression = getExpression(raccoon.mood, raccoon.trust)

  return (
    <motion.div
      className={`select-none ${sizeMap[size]}`}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {expression}
    </motion.div>
  )
}

export default RaccoonAvatar
