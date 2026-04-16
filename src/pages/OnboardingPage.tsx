import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { TRAITS } from '../config/traits'

const TOTAL_STEPS = 7

// Show only first 5 traits in onboarding
const ONBOARDING_TRAITS = TRAITS.slice(0, 5)

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { initPlayer, initRaccoon, completeOnboarding } = useGameStore()

  const [step, setStep] = useState(1)
  const [raccoonName, setRaccoonName] = useState('小浣')
  const [selectedTrait, setSelectedTrait] = useState<string>('')

  const canProceed = () => {
    if (step === 3) return raccoonName.trim().length > 0
    if (step === 4) return selectedTrait !== ''
    return true
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      // Complete onboarding
      initPlayer(raccoonName.trim() || '训练师')
      initRaccoon(raccoonName.trim() || '小浣', selectedTrait || 'curious')
      completeOnboarding()
      navigate('/home')
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-amber-100">
        <motion.div
          className="h-full bg-amber-400 rounded-full"
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Step counter */}
      <div className="flex items-center justify-between px-5 pt-4">
        <button
          onClick={handleBack}
          className="text-amber-500 text-sm disabled:opacity-0"
          disabled={step === 1}
        >
          ← 返回
        </button>
        <span className="text-amber-500 text-xs">{step} / {TOTAL_STEPS}</span>
        <div className="w-10" />
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm"
          >
            <StepContent
              step={step}
              raccoonName={raccoonName}
              setRaccoonName={setRaccoonName}
              selectedTrait={selectedTrait}
              setSelectedTrait={setSelectedTrait}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-amber-50 via-amber-50/90 to-transparent">
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white font-semibold py-3 rounded-2xl shadow transition-colors"
        >
          {step === TOTAL_STEPS ? '完成，开始养殖！' : '下一步 →'}
        </button>
      </div>
    </div>
  )
}

interface StepContentProps {
  step: number
  raccoonName: string
  setRaccoonName: (v: string) => void
  selectedTrait: string
  setSelectedTrait: (v: string) => void
}

function StepContent({ step, raccoonName, setRaccoonName, selectedTrait, setSelectedTrait }: StepContentProps) {
  switch (step) {
    case 1:
      return (
        <div className="text-center">
          <div className="text-8xl mb-6">🦝</div>
          <h2 className="text-2xl font-bold text-amber-900 mb-4">欢迎来到小浣熊养殖计划</h2>
          <p className="text-amber-700 leading-relaxed">
            你在某天翻到了一只特别的小浣熊——它不是宠物店买来的，也不是在公园里捡的。
          </p>
          <p className="mt-3 text-amber-600 leading-relaxed">
            它从哪来的？没人知道。但它就这么出现了，坐在你的桌子上，用黑溜溜的眼睛看着你。
          </p>
        </div>
      )
    case 2:
      return (
        <div className="text-center">
          <div className="text-7xl mb-6">🔍</div>
          <h2 className="text-2xl font-bold text-amber-900 mb-4">一只不寻常的浣熊</h2>
          <p className="text-amber-700 leading-relaxed">
            它看起来像普通浣熊，贪吃、机灵、爱翻箱倒柜，但还带着一种奇怪的"工作使命感"……
          </p>
          <p className="mt-3 text-amber-600 leading-relaxed">
            桌上散落的文件它会主动整理。遇到复杂任务它会认真思考。它似乎真的想要帮你做点什么。
          </p>
          <div className="mt-5 bg-amber-100 rounded-2xl p-4 text-sm text-amber-800">
            💡 也许，这就是你一直在等的助手？
          </div>
        </div>
      )
    case 3:
      return (
        <div className="text-center">
          <div className="text-7xl mb-5">✏️</div>
          <h2 className="text-2xl font-bold text-amber-900 mb-2">给它起个名字</h2>
          <p className="text-amber-600 mb-6 text-sm">这将是它的正式称呼</p>
          <input
            type="text"
            value={raccoonName}
            onChange={(e) => setRaccoonName(e.target.value)}
            placeholder="小浣"
            maxLength={10}
            className="w-full text-center text-xl font-semibold bg-white border-2 border-amber-300 focus:border-amber-500 rounded-2xl py-3 px-4 outline-none text-amber-900 placeholder-amber-300"
          />
          <p className="mt-2 text-xs text-amber-400">最多10个字符</p>
        </div>
      )
    case 4:
      return (
        <div>
          <div className="text-center mb-5">
            <div className="text-6xl mb-3">🎭</div>
            <h2 className="text-xl font-bold text-amber-900">选择它的性格</h2>
            <p className="text-sm text-amber-600 mt-1">性格会影响技能和任务偏好</p>
          </div>
          <div className="flex flex-col gap-2">
            {ONBOARDING_TRAITS.map((trait) => (
              <button
                key={trait.id}
                onClick={() => setSelectedTrait(trait.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-2xl border-2 text-left transition-all ${
                  selectedTrait === trait.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-transparent bg-white hover:border-amber-200'
                }`}
              >
                <span className="text-2xl">{trait.emoji}</span>
                <div>
                  <div className="font-semibold text-amber-900 text-sm">{trait.name}</div>
                  <div className="text-xs text-amber-600 mt-0.5 leading-relaxed">{trait.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    case 5:
      return (
        <div className="text-center">
          <div className="text-7xl mb-5">⚡</div>
          <h2 className="text-xl font-bold text-amber-900 mb-4">行动点（AP）系统</h2>
          <div className="bg-white rounded-2xl p-5 text-left shadow-sm border border-amber-100">
            <p className="text-amber-800 leading-relaxed mb-4">
              每天你有 <span className="font-bold text-amber-500">6个行动点</span>，用来：
            </p>
            <div className="flex flex-col gap-2 text-sm">
              {[
                { emoji: '🍖', label: '照顾它', desc: '喂食 / 玩耍 / 梳洗 / 休息' },
                { emoji: '📋', label: '布置任务', desc: '执行工作任务赚取金币' },
                { emoji: '🗺️', label: '探索地图', desc: '发现新道具和食物' },
              ].map((item) => (
                <div key={item.emoji} className="flex items-center gap-3 bg-amber-50 rounded-xl p-3">
                  <span className="text-xl">{item.emoji}</span>
                  <div>
                    <div className="font-medium text-amber-900">{item.label}</div>
                    <div className="text-amber-500 text-xs">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    case 6:
      return (
        <div className="text-center">
          <div className="text-7xl mb-5">📊</div>
          <h2 className="text-xl font-bold text-amber-900 mb-4">状态系统</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
            <p className="text-amber-700 text-sm mb-4">小浣熊有6个核心状态，需要你来维护：</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: '🍴 饱食度', desc: '要定期喂食' },
                { label: '😊 心情', desc: '玩耍提升心情' },
                { label: '⚡ 精力', desc: '影响任务表现' },
                { label: '🎯 专注度', desc: '专注任务才高效' },
                { label: '🧹 整洁度', desc: '定期梳洗' },
                { label: '🤝 信任度', desc: '长期累积建立' },
              ].map((s) => (
                <div key={s.label} className="bg-amber-50 rounded-xl p-2.5 text-left">
                  <div className="font-semibold text-amber-800">{s.label}</div>
                  <div className="text-amber-500 mt-0.5">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    case 7:
      return (
        <div className="text-center">
          <motion.div
            className="text-8xl mb-5"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            🦝
          </motion.div>
          <h2 className="text-2xl font-bold text-amber-900 mb-3">
            你的小浣熊 <span className="text-amber-500">{raccoonName}</span> 在等你了！
          </h2>
          <p className="text-amber-600 leading-relaxed">
            开始你们的日常生活吧。照顾好它，让它完成任务，一起收集成就！
          </p>
          <div className="mt-6 bg-amber-100 rounded-2xl p-4">
            <p className="text-sm text-amber-700">💡 小提示：每天要记得给它补充食物，状态低落会影响任务成功率哦。</p>
          </div>
        </div>
      )
    default:
      return null
  }
}
