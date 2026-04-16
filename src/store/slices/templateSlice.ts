/**
 * Template slice: template management, proficiency tracking, upgrade.
 */

import type { StateCreator } from 'zustand'
import type { Template } from '../../types/template'
import { INITIAL_TEMPLATES } from '../../config/initialTemplates'
import { calculateProficiencyGain, createNewTemplate } from '../../utils/templateUtils'
import { range } from '../../utils/randomUtils'

export interface TemplateSlice {
  templates: Template[]

  initTemplates: () => void
  useTemplate: (templateId: string, success: boolean) => void
  saveTemplate: (name: string, modules: string[], category: string, taskTags: string[]) => string
  upgradeTemplate: (templateId: string) => void
  repairTemplate: (templateId: string) => void
  getTemplatesForTask: (taskCategory: string) => Template[]
}

export const createTemplateSlice: StateCreator<
  TemplateSlice,
  [['zustand/immer', never]],
  [],
  TemplateSlice
> = (set, get) => ({
  templates: [],

  initTemplates: () => {
    set((state) => {
      if (state.templates.length === 0) {
        state.templates = INITIAL_TEMPLATES.map(t => ({ ...t }))
      }
    })
  },

  useTemplate: (templateId, success) => {
    set((state) => {
      const template = state.templates.find(t => t.id === templateId)
      if (!template) return

      const gain = calculateProficiencyGain(success)
      template.proficiency = Math.min(100, template.proficiency + gain)

      if (success) {
        template.successHistory += 1
      } else {
        template.failHistory += 1
      }
    })
  },

  saveTemplate: (name, modules, category, taskTags) => {
    const newTemplate = createNewTemplate(name, modules, category)
    newTemplate.taskTags = taskTags.length > 0 ? taskTags : [category]

    set((state) => {
      state.templates.push(newTemplate)
    })

    return newTemplate.id
  },

  upgradeTemplate: (templateId) => {
    set((state) => {
      const template = state.templates.find(t => t.id === templateId)
      if (!template) return

      // Upgrade requires proficiency >= 80
      if (template.proficiency < 80) return

      template.level += 1
      template.proficiency = Math.max(0, template.proficiency - 50)
      template.stabilityBonus += 3
      template.version += 1
    })
  },

  repairTemplate: (templateId) => {
    set((state) => {
      const template = state.templates.find(t => t.id === templateId)
      if (!template) return

      // Reset fail history; small proficiency penalty for repair
      template.failHistory = 0
      template.proficiency = Math.max(0, template.proficiency - 5)
    })
  },

  getTemplatesForTask: (taskCategory) => {
    return get().templates.filter(
      t => !t.isHidden && t.taskTags.includes(taskCategory),
    )
  },
})
