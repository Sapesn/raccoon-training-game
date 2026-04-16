import { useGameStore } from '../../store/useGameStore'

function getMoodText(raccoon: {
  mood: number; energy: number; hunger: number; focus: number; trust: number
}): { text: string; color: string } {
  const { mood, energy, hunger, focus } = raccoon

  if (hunger < 20) return { text: '非常饥饿', color: 'text-red-500' }
  if (energy < 20) return { text: '精疲力竭', color: 'text-gray-500' }
  if (mood < 20) return { text: '需要关爱', color: 'text-pink-500' }
  if (mood >= 80 && energy >= 70) return { text: '精神饱满', color: 'text-green-600' }
  if (mood >= 70) return { text: '心情愉快', color: 'text-amber-600' }
  if (focus >= 70) return { text: '全神贯注', color: 'text-blue-600' }
  if (energy < 40) return { text: '有些疲惫', color: 'text-yellow-600' }
  if (mood < 40) return { text: '闷闷不乐', color: 'text-pink-400' }
  if (hunger < 40) return { text: '有点饿了', color: 'text-orange-500' }
  return { text: '状态稳定', color: 'text-gray-500' }
}

export function RaccoonMood() {
  const { raccoon } = useGameStore()
  const { text, color } = getMoodText(raccoon)

  return (
    <span className={`text-sm font-medium ${color}`}>
      {text}
    </span>
  )
}

export default RaccoonMood
