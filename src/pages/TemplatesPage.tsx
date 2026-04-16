import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { TRAITS } from '../config/traits'
import { TemplateCard } from '../components/template/TemplateCard'
import { TemplateDetailModal } from '../components/template/TemplateDetailModal'
import { SkillsPanel } from '../components/raccoon/SkillsPanel'
import { ProgressBar } from '../components/common/ProgressBar'
import { EmptyState } from '../components/common/EmptyState'
import type { Template } from '../types/template'

type Tab = 'templates' | 'skills'

const CATEGORY_LABELS: Record<string, string> = {
  all: '全部', report: '报告', analysis: '分析', writing: '写作',
  planning: '规划', presentation: '演示', general: '通用', education: '教育',
}

export default function TemplatesPage() {
  const { raccoon, templates } = useGameStore()
  const [tab, setTab] = useState<Tab>('templates')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))]

  const filteredTemplates = categoryFilter === 'all'
    ? templates
    : templates.filter(t => t.category === categoryFilter)

  const trait = raccoon.traits[0] ? TRAITS.find(t => t.id === raccoon.traits[0]) : null

  return (
    <div className="px-4 py-4 pb-6">
      <h1 className="text-lg font-bold text-gray-800 mb-4">技能 & 模板</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {([['templates', '模板库'], ['skills', '技能属性']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'templates' ? (
        <div>
          {/* Category filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-amber-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-500'
                }`}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>

          {/* Template grid */}
          {filteredTemplates.length === 0 ? (
            <EmptyState emoji="📁" title="暂无模板" description="完成任务后可以保存模板" />
          ) : (
            <div className="space-y-3">
              {filteredTemplates.map(tpl => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className="cursor-pointer"
                >
                  <TemplateCard template={tpl} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Raccoon level & exp */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🦝</span>
              <div>
                <div className="font-bold text-gray-800">{raccoon.name}</div>
                <div className="text-xs text-gray-400">Lv.{raccoon.level} 浣熊助理</div>
              </div>
            </div>
            <div className="mb-1 flex justify-between text-xs text-gray-400">
              <span>经验值</span>
              <span>{raccoon.exp} / {raccoon.expToNext}</span>
            </div>
            <ProgressBar value={raccoon.exp} max={raccoon.expToNext} color="bg-amber-400" animated />
          </div>

          {/* Trait */}
          {trait && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">性格特征</h3>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{trait.emoji}</span>
                <div>
                  <div className="font-medium text-gray-800">{trait.name}</div>
                  <div className="text-xs text-gray-400">{trait.description}</div>
                </div>
              </div>
              <p className="text-xs italic text-gray-300 mt-2">"{trait.flavorText}"</p>
            </div>
          )}

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">技能属性</h3>
            <SkillsPanel />
          </div>
        </div>
      )}

      {/* Template detail modal */}
      {selectedTemplate && <TemplateDetailModal
        template={selectedTemplate}
        isOpen={selectedTemplate !== null}
        onClose={() => setSelectedTemplate(null)}
      />}
    </div>
  )
}
