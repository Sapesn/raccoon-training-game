interface LevelBadgeProps {
  level: number
  type?: 'player' | 'raccoon' | 'skill'
}

const typeStyles: Record<string, string> = {
  player: 'bg-amber-500 text-white',
  raccoon: 'bg-orange-400 text-white',
  skill: 'bg-blue-100 text-blue-700',
}

export function LevelBadge({ level, type = 'player' }: LevelBadgeProps) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${typeStyles[type]}`}>
      <span className="text-[10px]">Lv</span>
      <span>{level}</span>
    </div>
  )
}

export default LevelBadge
