import type { TaskDifficulty } from '../../types/task'

interface DifficultyBadgeProps {
  difficulty: TaskDifficulty
}

const DIFFICULTY_STYLES: Record<TaskDifficulty, string> = {
  E: 'bg-green-100 text-green-700 border border-green-200',
  D: 'bg-blue-100 text-blue-700 border border-blue-200',
  C: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  B: 'bg-orange-100 text-orange-700 border border-orange-200',
  A: 'bg-red-100 text-red-700 border border-red-200',
  S: 'bg-purple-100 text-purple-700 border border-purple-200',
  SS: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0',
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${DIFFICULTY_STYLES[difficulty]}`}>
      {difficulty}
    </span>
  )
}

export default DifficultyBadge
