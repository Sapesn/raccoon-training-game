import { useState } from 'react'
import { useTaskExecution } from '../../hooks/useTaskExecution'
import { useGameStore } from '../../store/useGameStore'
import { SuccessRatePreview } from './SuccessRatePreview'
import { TemplateCard } from '../template/TemplateCard'
import { Button } from '../common/Button'
import type { Task } from '../../types/task'

interface TaskExecutionFlowProps {
  task: Task
  onComplete: (result: unknown) => void
  onCancel: () => void
}

type Step = 'preview' | 'template' | 'confirm'

export function TaskExecutionFlow({ task, onComplete, onCancel }: TaskExecutionFlowProps) {
  const [step, setStep] = useState<Step>('preview')
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const { prepareExecution, execute } = useTaskExecution()
  const { templates, currentAP } = useGameStore()

  const preview = prepareExecution(task, selectedTemplate, [])
  const canAfford = currentAP >= task.apCost

  const handleExecute = () => {
    setLoading(true)
    try {
      const result = execute({ taskId: task.id, templateId: selectedTemplate, itemIds: [], isDecomposed: false })
      onComplete(result)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'template') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setStep('preview')} className="text-sm text-gray-500">← 返回</button>
          <h2 className="text-base font-semibold text-gray-800">选择模板（可选）</h2>
          <button onClick={() => setStep('confirm')} className="text-sm text-amber-600 font-medium">跳过</button>
        </div>
        <div className="space-y-3 overflow-y-auto flex-1">
          {templates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">暂无可用模板</p>
          ) : (
            templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                selected={selectedTemplate === t.id}
                onSelect={(tmpl) => {
                  setSelectedTemplate(tmpl.id === selectedTemplate ? undefined : tmpl.id)
                }}
              />
            ))
          )}
        </div>
        <Button variant="primary" fullWidth onClick={() => setStep('confirm')} className="mt-4">
          确认选择
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-amber-50 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">成功率预览</h3>
        <SuccessRatePreview
          successRate={preview.breakdown.finalRate}
          breakdown={preview.breakdown}
        />
      </div>

      {selectedTemplate && (
        <div className="bg-blue-50 rounded-xl px-3 py-2 text-sm text-blue-700">
          已选模板：{templates.find(t => t.id === selectedTemplate)?.name}
        </div>
      )}

      <div className="flex gap-3">
        {step === 'preview' && (
          <>
            <Button variant="secondary" onClick={() => setStep('template')} className="flex-1">
              选择模板
            </Button>
            <Button variant="primary" onClick={() => setStep('confirm')} className="flex-1">
              下一步
            </Button>
          </>
        )}
        {step === 'confirm' && (
          <>
            <Button variant="ghost" onClick={onCancel}>取消</Button>
            <Button
              variant="primary"
              fullWidth
              disabled={!canAfford}
              loading={loading}
              onClick={handleExecute}
            >
              {canAfford ? `消耗 ${task.apCost} AP，确认执行` : 'AP 不足'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default TaskExecutionFlow
