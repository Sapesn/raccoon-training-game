import { TEMPLATE_MODULES } from '../../config/templateModules'

interface ModuleTagProps {
  moduleId: string
  size?: 'sm' | 'md'
}

const CATEGORY_COLORS: Record<string, string> = {
  input: 'bg-blue-50 text-blue-600 border-blue-100',
  process: 'bg-purple-50 text-purple-600 border-purple-100',
  output: 'bg-green-50 text-green-600 border-green-100',
  style: 'bg-pink-50 text-pink-600 border-pink-100',
  optimize: 'bg-amber-50 text-amber-600 border-amber-100',
}

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
}

export function ModuleTag({ moduleId, size = 'sm' }: ModuleTagProps) {
  const mod = TEMPLATE_MODULES.find((m) => m.id === moduleId)
  if (!mod) {
    return (
      <span className={`inline-flex rounded-full border bg-gray-50 text-gray-400 border-gray-100 ${sizeStyles[size]}`}>
        {moduleId}
      </span>
    )
  }
  const colorClass = CATEGORY_COLORS[mod.category] ?? 'bg-gray-50 text-gray-500 border-gray-100'
  return (
    <span className={`inline-flex rounded-full border font-medium ${colorClass} ${sizeStyles[size]}`}>
      {mod.name}
    </span>
  )
}

export default ModuleTag
