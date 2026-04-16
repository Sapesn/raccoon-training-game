import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { generateTaskReport } from '../utils/reportGenerator'
import type { TaskHistoryEntry } from '../store/slices/taskSlice'

const GRADE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  perfect:   { label: '完美', color: 'text-purple-700', bg: 'bg-purple-50' },
  excellent: { label: '优秀', color: 'text-blue-700',   bg: 'bg-blue-50'   },
  good:      { label: '良好', color: 'text-green-700',  bg: 'bg-green-50'  },
  partial:   { label: '勉强', color: 'text-amber-700',  bg: 'bg-amber-50'  },
  fail:      { label: '失败', color: 'text-red-700',    bg: 'bg-red-50'    },
}

const CATEGORY_LABEL: Record<string, string> = {
  writing: '写作', analysis: '分析', creative: '创意',
  research: '研究', planning: '规划', communication: '沟通',
  data: '数据', social: '社交',
}

function HistoryCard({ entry, raccoonName, raccoonLevel }: {
  entry: TaskHistoryEntry
  raccoonName: string
  raccoonLevel: number
}) {
  const [expanded, setExpanded] = useState(false)
  const grade = GRADE_CONFIG[entry.grade] ?? GRADE_CONFIG.fail
  const date = new Date(entry.completedAt)
  const dateStr = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const handleReport = () => {
    generateTaskReport(
      {
        taskId: entry.taskId,
        success: entry.grade !== 'fail',
        grade: entry.grade,
        score: entry.score,
        scoreBreakdown: { accuracy: entry.score, completeness: entry.score, expression: entry.score, timeliness: entry.score, stability: entry.score },
        coinsEarned: entry.coinsEarned,
        expEarned: entry.expEarned,
        itemsEarned: [],
        statusChanges: {},
        roll: 0,
        variance: 0,
        aiOutput: entry.aiOutput,
        aiScore: entry.aiScore,
      },
      {
        taskName:        entry.taskName,
        taskDescription: '',
        taskCategory:    entry.taskCategory,
        taskDifficulty:  entry.taskDifficulty,
        raccoonName,
        raccoonLevel,
        gameDay:         entry.gameDay,
      }
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50"
      >
        <div className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${grade.bg} ${grade.color}`}>
          {grade.label}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-800 truncate">{entry.taskName}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            {CATEGORY_LABEL[entry.taskCategory] ?? entry.taskCategory} · {entry.taskDifficulty} · 第{entry.gameDay}天
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-bold text-gray-700">{entry.score}</div>
          <div className="text-[10px] text-gray-400">{dateStr}</div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-50 px-4 pb-4">
          <div className="flex gap-3 py-3 text-xs text-gray-500">
            <span className="text-amber-600 font-medium">🪙 +{entry.coinsEarned}</span>
            <span className="text-blue-500 font-medium">+{entry.expEarned} EXP</span>
            {entry.aiScore !== undefined && (
              <span className="text-purple-500">AI自评 {entry.aiScore}/100</span>
            )}
          </div>

          {entry.aiOutput && (
            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-mono max-h-36 overflow-y-auto mb-3">
              {entry.aiOutput}
            </div>
          )}

          <button
            onClick={e => { e.stopPropagation(); handleReport() }}
            className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-colors"
          >
            <FileText size={12} /> 下载报告
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default function TaskHistoryPage() {
  const navigate = useNavigate()
  const { taskHistory, raccoon } = useGameStore()

  return (
    <div className="px-4 py-4 pb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-amber-600 mb-4"
      >
        <ArrowLeft size={16} /> 返回
      </button>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-800">任务历史</h1>
          <p className="text-xs text-gray-400 mt-0.5">最近 {taskHistory.length} 条记录</p>
        </div>
      </div>

      {taskHistory.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <div className="text-sm">还没有完成任何任务</div>
          <div className="text-xs mt-1">去任务中心执行一个任务吧</div>
        </div>
      ) : (
        <div className="space-y-2">
          {taskHistory.map(entry => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              raccoonName={raccoon.name}
              raccoonLevel={raccoon.level}
            />
          ))}
        </div>
      )}
    </div>
  )
}
