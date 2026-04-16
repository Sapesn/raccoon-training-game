export type ModuleCategory = 'input' | 'process' | 'output' | 'style' | 'optimize'

export interface TemplateModule {
  id: string
  name: string
  category: ModuleCategory
  description: string
  successBonus: number   // % bonus to success rate when module is in template
  tags: string[]         // task category tags this module is good for
}

export interface Template {
  id: string
  name: string
  description: string
  category: string       // 'report' | 'analysis' | 'writing' | 'planning' | etc
  modules: string[]      // TemplateModule ids
  level: number
  proficiency: number    // 0-100
  stabilityBonus: number
  successHistory: number
  failHistory: number
  version: number
  isHidden: boolean
  isUserCreated: boolean
  taskTags: string[]     // task categories this template applies to
  createdAt: string
}
