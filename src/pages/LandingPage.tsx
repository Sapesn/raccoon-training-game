import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

export default function LandingPage() {
  const navigate = useNavigate()
  const player = useGameStore((s) => s.player)
  const gameStarted = player?.onboardingComplete === true

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center px-4">
      {/* Raccoon emoji with bounce */}
      <motion.div
        className="text-8xl mb-6 select-none"
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        🦝
      </motion.div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-amber-900 mb-3 text-center">
        小浣熊养殖计划
      </h1>

      {/* Tagline */}
      <p className="text-amber-700 text-center text-base mb-10 max-w-xs leading-relaxed">
        一只会翻垃圾桶的小助理，正在等你来驯化
      </p>

      {/* Feature taglines */}
      <div className="flex gap-3 mb-10 flex-wrap justify-center">
        {['🎯 完成任务', '📈 训练技能', '🏆 解锁成就'].map((tag) => (
          <span
            key={tag}
            className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full border border-amber-200"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {gameStarted && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/home')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-2xl shadow-md transition-colors text-base"
          >
            继续游戏
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/onboarding')}
          className={`w-full font-semibold py-3 rounded-2xl shadow transition-colors text-base ${
            gameStarted
              ? 'bg-white text-amber-600 border border-amber-300 hover:bg-amber-50'
              : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
          }`}
        >
          {gameStarted ? '重新开始' : '开始游戏'}
        </motion.button>
      </div>

      <p className="mt-10 text-xs text-amber-400">V1.0 · 小浣熊出没注意</p>
    </div>
  )
}
