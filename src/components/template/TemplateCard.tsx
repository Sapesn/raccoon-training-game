import { motion } from 'framer-motion'
import { ModuleTag } from './ModuleTag'
import { ProficiencyBar } from './ProficiencyBar'
import type { Template } from '../../types/template'

interface TemplateCardProps {
  template: Template
  onSelect?: (t: Template) => void
  selected?: boolean
}

export function TemplateCard({ template, onSelect, selected = false }: TemplateCardProps) {
  return (
    <motion.div
      whileTap={onSelect ? { scale: 0.97 } : {}}
      onClick={() => onSelect?.(template)}
      className={`bg-white rounded-2xl border p-4 transition-colors ${
        selected
          ? 'border-amber-400 shadow-md shadow-amber-100'
          : 'border-gray-100 shadow-sm'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{template.name}</h3>
          <span className="text-xs text-gray-400">{template.category}</span>
        </div>
        {selected && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">已选</span>
        )}
      </div>

      <ProficiencyBar proficiency={template.proficiency} showLabel={false} />

      <div className="flex justify-between text-xs text-gray-400 mt-1 mb-3">
        <span>熟练度 {template.proficiency}</span>
        <span className="text-green-600">✓{template.successHistory} ✗{template.failHistory}</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {template.modules.slice(0, 4).map((m) => (
          <ModuleTag key={m} moduleId={m} size="sm" />
        ))}
        {template.modules.length > 4 && (
          <span className="text-xs text-gray-400 px-1">+{template.modules.length - 4}</span>
        )}
      </div>
    </motion.div>
  )
}

export default TemplateCard
