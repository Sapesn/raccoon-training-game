import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ModuleTag } from './ModuleTag'
import { ProficiencyBar } from './ProficiencyBar'
import { Button } from '../common/Button'
import type { Template } from '../../types/template'

interface TemplateDetailModalProps {
  template: Template
  onClose: () => void
  isOpen: boolean
  onUpgrade?: () => void
}

export function TemplateDetailModal({ template, onClose, isOpen, onUpgrade }: TemplateDetailModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{template.category}</span>
                <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-1">{template.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{template.description}</p>

              <ProficiencyBar proficiency={template.proficiency} />

              <div className="grid grid-cols-3 gap-2 my-4 text-center">
                <div className="bg-gray-50 rounded-xl p-2">
                  <div className="text-base font-bold text-green-600">{template.successHistory}</div>
                  <div className="text-xs text-gray-400">成功次数</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-2">
                  <div className="text-base font-bold text-red-500">{template.failHistory}</div>
                  <div className="text-xs text-gray-400">失败次数</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-2">
                  <div className="text-base font-bold text-amber-600">+{template.stabilityBonus}%</div>
                  <div className="text-xs text-gray-400">稳定加成</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs font-medium text-gray-600 mb-2">模块列表</div>
                <div className="flex flex-wrap gap-1.5">
                  {template.modules.map((m) => (
                    <ModuleTag key={m} moduleId={m} size="md" />
                  ))}
                </div>
              </div>

              {template.taskTags.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-600 mb-2">适用任务类型</div>
                  <div className="flex flex-wrap gap-1.5">
                    {template.taskTags.map((tag) => (
                      <span key={tag} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {onUpgrade && (
                <Button variant="primary" fullWidth onClick={onUpgrade}>
                  升级模板
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TemplateDetailModal
