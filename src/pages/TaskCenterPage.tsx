import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Sparkles, Clock } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'
import { TaskCard } from '../components/task/TaskCard'
import { TaskDetailModal } from '../components/task/TaskDetailModal'
import { APCounter } from '../components/common/APCounter'
import { EmptyState } from '../components/common/EmptyState'
import type { Task } from '../types/task'

type FilterTab = 'all' | 'permanent' | 'daily' | 'commission' | 'ai' | 'urgent'

const FILTER_LABELS: Record<FilterTab, string> = {
  all: '全部',
  permanent: '常驻',
  daily: '日常',
  commission: '委托',
  ai: 'AI任务',
  urgent: '紧急',
}

export default function TaskCenterPage() {
  const navigate = useNavigate()
  const {
    availableTasks, dynamicTasks, isGeneratingTasks,
    completedTodayTaskIds, currentAP, maxAP,
    forceGenerateDynamicTasks,
  } = useGameStore()
  const [filter, setFilter] = useState<FilterTab>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchText, setSearchText] = useState('')

  // Merge static + dynamic, deduplicate
  const allTasks = [...availableTasks, ...dynamicTasks]

  const filtered = allTasks.filter(t => {
    if (filter === 'permanent') return t.type === 'permanent'
    if (filter === 'daily') return t.type === 'daily'
    if (filter === 'commission') return t.type === 'commission' && !t.isDynamic
    if (filter === 'ai') return t.isDynamic === true
    if (filter === 'urgent') return t.urgency === 'urgent' || t.urgency === 'immediate'
    return true
  }).filter(t =>
    searchText === '' || t.name.includes(searchText) || t.category.includes(searchText)
  )

  return (
    <div className="px-4 py-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">任务中心</h1>
        <div className="flex items-center gap-2">
          {isGeneratingTasks && (
            <span className="text-[10px] text-purple-500 animate-pulse flex items-center gap-1">
              <Sparkles size={10} /> AI生成中
            </span>
          )}
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-amber-600 px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors"
          >
            <Clock size={13} /> 历史
          </button>
          <APCounter current={currentAP} max={maxAP} />
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="搜索任务..."
          className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-amber-300"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
        {(Object.keys(FILTER_LABELS) as FilterTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === tab
                ? 'bg-amber-500 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-amber-300'
            }`}
          >
            {FILTER_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Refresh AI tasks button — always visible */}
      <button
        onClick={() => !isGeneratingTasks && forceGenerateDynamicTasks()}
        disabled={isGeneratingTasks}
        className={`w-full mb-3 py-2 rounded-xl border border-dashed text-xs flex items-center justify-center gap-1.5 transition-colors ${
          isGeneratingTasks
            ? 'border-purple-200 text-purple-300 cursor-not-allowed'
            : 'border-purple-300 text-purple-500 hover:bg-purple-50 cursor-pointer'
        }`}
      >
        <Sparkles size={12} className={isGeneratingTasks ? 'animate-spin' : ''} />
        {isGeneratingTasks ? 'AI正在生成任务...' : '让AI为小浣熊推送新任务'}
      </button>

      {/* Task list */}
      {filtered.length === 0 ? (
        <EmptyState emoji="📋" title="暂无任务" description="换个筛选条件，或让AI推送新任务" />
      ) : (
        <div className="space-y-2">
          {filtered.map(task => {
            const doneToday = completedTodayTaskIds.includes(task.id)
            const isDisabled = doneToday && !task.isRepeatable
            return (
              <div key={task.id} className="relative">
                {doneToday && (
                  <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {task.isRepeatable ? '已做一次' : '已完成'}
                  </div>
                )}
                {!doneToday && task.type === 'permanent' && (
                  <div className="absolute top-2 right-2 z-10 bg-blue-400 text-white text-[10px] px-2 py-0.5 rounded-full">
                    常驻
                  </div>
                )}
                {!doneToday && task.isDynamic && (
                  <div className="absolute top-2 right-2 z-10 bg-purple-400 text-white text-[10px] px-2 py-0.5 rounded-full">
                    AI推送
                  </div>
                )}
                <TaskCard
                  task={task}
                  onSelect={() => setSelectedTask(task)}
                  disabled={isDisabled}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Detail modal */}
      {selectedTask && <TaskDetailModal
        task={selectedTask}
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        onExecute={() => {
          if (selectedTask) {
            navigate(`/tasks/${selectedTask.id}/execute`)
            setSelectedTask(null)
          }
        }}
      />}
    </div>
  )
}
