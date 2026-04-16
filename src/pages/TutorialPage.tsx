import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Section {
  id: string
  emoji: string
  title: string
  content: React.ReactNode
}

function Accordion({ section }: { section: Section }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{section.emoji}</span>
          <span className="font-semibold text-gray-800 text-sm">{section.title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-sm text-gray-600 space-y-2 border-t border-gray-50 pt-3">
              {section.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return <div className="bg-amber-50 rounded-xl px-3 py-2 text-xs text-amber-800">{children}</div>
}

function StatRow({ emoji, name, desc, how }: { emoji: string; name: string; desc: string; how: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-lg shrink-0">{emoji}</span>
      <div>
        <div className="font-medium text-gray-800 text-xs">{name}</div>
        <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
        <div className="text-[11px] text-green-600 mt-1">↑ {how}</div>
      </div>
    </div>
  )
}

function SkillRow({ emoji, name, desc, how }: { emoji: string; name: string; desc: string; how: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-lg shrink-0">{emoji}</span>
      <div>
        <div className="font-medium text-gray-800 text-xs">{name}</div>
        <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
        <div className="text-[11px] text-blue-600 mt-1">↑ {how}</div>
      </div>
    </div>
  )
}

const SECTIONS: Section[] = [
  {
    id: 'status',
    emoji: '❤️',
    title: '六维状态 — 如何提升',
    content: (
      <div>
        <p className="mb-3 text-xs text-gray-500">状态影响任务成功率，越高越好。每天都会自然衰减，需要通过日常照料来维持。</p>
        <StatRow emoji="🍱" name="饱腹度" desc="代表小浣熊有多饱，低于20会影响专注和心情。" how="喂食（消耗1 AP），选择营养价值高的食物效果更好" />
        <StatRow emoji="😊" name="心情" desc="影响任务时的表现力和创造力加成。心情好=发挥更稳定。" how="玩耍（+20，消耗1 AP）、梳洗（+10）、完成任务成功（+10）" />
        <StatRow emoji="⚡" name="精力" desc="精力低时任务成功率下降，会触发「疲惫」事件。" how="休息（+35，消耗1 AP），是回复精力最有效的方式" />
        <StatRow emoji="🎯" name="专注度" desc="直接影响任务成功率的计算，专注低则表现飘忽。" how="休息（+15）、减少连续失败、保持心情和精力双高状态" />
        <StatRow emoji="✨" name="清洁度" desc="低于40会有心情惩罚；影响信任的积累速度。" how="梳洗（+30，消耗1 AP），每2-3天梳洗一次即可维持" />
        <StatRow emoji="🤝" name="信任度" desc="影响委托任务的成功率加成，也是解锁高级功能的关键。" how="持续照料（玩耍+5、梳洗+3）、任务成功（+3~8）、不让任何状态降到0" />
        <Tip>💡 技巧：每天先检查最低的状态，优先补充，再执行任务，效率最高。</Tip>
      </div>
    ),
  },
  {
    id: 'skills',
    emoji: '🧠',
    title: '六项技能 — 如何提升',
    content: (
      <div>
        <p className="mb-3 text-xs text-gray-500">技能影响对应类型任务的成功率。执行任务会自动训练相关技能，也可以通过探索和道具加速。</p>
        <SkillRow emoji="🖐️" name="灵巧度 (Dexterity)" desc="提升数据处理类、细节操作类任务的成功率。" how="执行数据类任务（data），探索「服务器机房」，食用「专注饼干」" />
        <SkillRow emoji="📖" name="理解力 (Understanding)" desc="帮助小浣熊读懂复杂信息，提升研究类任务表现。" how="执行研究类任务（research），阅读书架区域，食用「知识茶」" />
        <SkillRow emoji="✍️" name="表达力 (Expression)" desc="影响写作、沟通类任务。AI任务的输出质量也受此影响。" how="执行写作（writing）和沟通（communication）类任务，多用写作模板" />
        <SkillRow emoji="🔍" name="分析力 (Analysis)" desc="提升分析、规划类任务成功率，也影响数据解读能力。" how="执行分析（analysis）和规划（planning）类任务，探索「资料室」" />
        <SkillRow emoji="🎨" name="创造力 (Creativity)" desc="影响创意类任务的发挥，技能越高成果越出色。" how="执行创意类任务（creative），心情高时做任务有额外创造力加成" />
        <SkillRow emoji="🧘" name="稳定性 (Stability)" desc="减少随机波动，让成功率更稳定，失败惩罚更小。" how="执行需要稳定性的任务，保持连续成功记录（不间断积累）" />
        <Tip>💡 技巧：AI推送的任务会优先针对最弱技能，让小浣熊的成长更有方向。</Tip>
      </div>
    ),
  },
  {
    id: 'ap',
    emoji: '🔋',
    title: '行动点 (AP) 系统',
    content: (
      <div className="space-y-2">
        <p>每天开始时回满 <strong>6点AP</strong>，不同行动消耗不同：</p>
        <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1.5">
          <div className="flex justify-between"><span>🍖 喂食 / 🎮 玩耍 / 🚿 梳洗 / 😴 休息</span><span className="text-amber-600 font-medium">各 1 AP</span></div>
          <div className="flex justify-between"><span>📋 普通任务 (E/D/C)</span><span className="text-amber-600 font-medium">2 AP</span></div>
          <div className="flex justify-between"><span>📋 高难任务 (B/A/S/SS)</span><span className="text-amber-600 font-medium">3 AP</span></div>
          <div className="flex justify-between"><span>🗺️ 探索区域</span><span className="text-amber-600 font-medium">2 AP</span></div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-xs text-green-800">
          ⏰ <strong>自动回复</strong>：每隔20分钟现实时间，自动回复 <strong>+1 AP</strong>（不超过上限），挂机也能积累行动点。
        </div>
        <Tip>💡 建议：每天先用2-4 AP照料小浣熊（保持状态高位），再用剩余AP执行高价值任务。</Tip>
      </div>
    ),
  },
  {
    id: 'tasks',
    emoji: '📋',
    title: '任务类型与玩法',
    content: (
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="font-medium text-blue-800 text-xs mb-1">🔵 常驻任务</div>
            <div className="text-xs text-blue-700">每天都可以做，可重复执行。适合碎片时间练技能、积累经验。难度较低，奖励也相对少。</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3">
            <div className="font-medium text-amber-800 text-xs mb-1">🟡 日常任务</div>
            <div className="text-xs text-amber-700">每天从任务池中随机刷新。覆盖多种类型，每日结算后更新，不要拖到最后。</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-3">
            <div className="font-medium text-orange-800 text-xs mb-1">🟠 委托任务</div>
            <div className="text-xs text-orange-700">奖励丰厚但难度更高，建议先提升相关技能和状态再挑战，失败有惩罚。</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-3">
            <div className="font-medium text-purple-800 text-xs mb-1">🟣 AI推送任务</div>
            <div className="text-xs text-purple-700">由AI根据小浣熊当前最弱技能动态生成。执行时AI会真正完成任务内容，你能看到实际的工作成果。任务完成后自动从列表移除。</div>
          </div>
        </div>
        <Tip>💡 成功率公式：基础率 + 技能加成 + 模板加成 + 状态加成 + 道具加成 - 难度惩罚 ± 性格修正，最终限制在5%-95%。</Tip>
      </div>
    ),
  },
  {
    id: 'ai_execution',
    emoji: '🤖',
    title: 'AI任务执行机制',
    content: (
      <div className="space-y-2">
        <p>当你执行任何任务时，小浣熊会调用AI真正完成这个工作任务：</p>
        <div className="space-y-2 text-xs">
          <div className="flex gap-2"><span className="text-amber-500 font-bold">1.</span><span>AI根据小浣熊的技能水平生成实际工作成果（邮件、分析报告、创意文案等）</span></div>
          <div className="flex gap-2"><span className="text-amber-500 font-bold">2.</span><span>AI对自己的输出质量打分（0-100），结合技能骰子结果计算最终得分（AI占60%，骰子占40%）</span></div>
          <div className="flex gap-2"><span className="text-amber-500 font-bold">3.</span><span>结果页会展示AI实际产出的内容，越高的技能水平带来越高质量的输出</span></div>
        </div>
        <Tip>💡 提升表达力（Expression）和分析力（Analysis）会让AI产出的内容质量明显提升！</Tip>
      </div>
    ),
  },
  {
    id: 'templates',
    emoji: '📄',
    title: '模板系统',
    content: (
      <div className="space-y-2">
        <p>模板是小浣熊的"工作方法论"，使用后会随经验提升熟练度：</p>
        <div className="text-xs space-y-1.5">
          <div>• 执行任务时选择匹配的模板可提升成功率</div>
          <div>• 熟练度越高，模板的加成越强（最多+20%成功率）</div>
          <div>• 在「模板库」页面查看和管理所有模板</div>
          <div>• 探索区域也可能发现新模板</div>
        </div>
        <Tip>💡 找到和自己常做任务类别匹配的模板，反复使用到熟练，效率大幅提升。</Tip>
      </div>
    ),
  },
  {
    id: 'tips',
    emoji: '💡',
    title: '新手核心策略',
    content: (
      <div className="space-y-2 text-xs">
        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
          <p className="font-medium text-gray-700">🌅 每日开局建议：</p>
          <div>1. 先喂食（保持饱腹 &gt; 60）</div>
          <div>2. 检查精力和专注（低于40就先休息）</div>
          <div>3. 每隔2-3天梳洗一次（保持清洁 &gt; 50）</div>
          <div>4. 用剩余AP执行适合当前状态的任务</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
          <p className="font-medium text-gray-700">📈 长期成长建议：</p>
          <div>• 专注培养1-2个技能到50+，再扩展其他技能</div>
          <div>• AI推送的任务会自动瞄准弱点，定期刷新查看</div>
          <div>• 信任度是关键资源，不要让任何状态归零</div>
          <div>• 成就系统有奖励，偶尔去看看完成进度</div>
        </div>
        <Tip>💡 即使AP为0也可以每20分钟回来检查一次，积累AP后再行动！</Tip>
      </div>
    ),
  },
]

export default function TutorialPage() {
  const navigate = useNavigate()

  return (
    <div className="px-4 py-4 pb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-amber-600 mb-4"
      >
        <ArrowLeft size={16} /> 返回
      </button>

      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-800 mb-1">游戏教程</h1>
        <p className="text-xs text-gray-400">了解如何培养你的小浣熊助理，让它越来越强！</p>
      </div>

      <div className="space-y-2">
        {SECTIONS.map(section => (
          <Accordion key={section.id} section={section} />
        ))}
      </div>
    </div>
  )
}
