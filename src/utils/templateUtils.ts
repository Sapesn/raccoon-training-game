/**
 * Template utilities: bonus calculation, proficiency, and factory.
 */

import type { Template } from '../types/template'
import {
  PROFICIENCY_GAIN_SUCCESS,
  PROFICIENCY_GAIN_FAIL,
} from '../config/gameConstants'
import { getTodayString } from './dateUtils'
import { range } from './randomUtils'

// We can't import module data at runtime without a module registry, so callers
// that need per-module data should provide it. For the functions that only use
// template-level fields, no extra imports are needed.

/**
 * Returns the sum of stabilityBonus plus a flat per-module bonus (5 per module,
 * since we don't have a module registry at this layer).
 */
export function getTemplateTotalBonus(template: Template): number {
  // Each module contributes a nominal 5% bonus; stabilityBonus is on top
  const moduleBonus = template.modules.length * 5
  return moduleBonus + template.stabilityBonus
}

/** Returns proficiency gain for one task use. */
export function calculateProficiencyGain(success: boolean): number {
  return success ? PROFICIENCY_GAIN_SUCCESS : PROFICIENCY_GAIN_FAIL
}

/**
 * A template can reduce AP cost once proficiency reaches 100.
 */
export function canReduceAPCost(template: Template): boolean {
  return template.proficiency >= 100
}

/**
 * Returns the success-rate bonus percentage for this template when applied to
 * a task in the given category. Uses proficiency + task category match.
 */
export function getTemplateSuccessRate(template: Template, taskCategory: string): number {
  const categoryMatch = template.taskTags.includes(taskCategory)
  const proficiencyContribution = (template.proficiency / 100) * 20

  // Extra 5% if the template is tagged for this category
  return proficiencyContribution + (categoryMatch ? 5 : 0)
}

/** Creates a fresh Template object with default values. */
export function createNewTemplate(
  name: string,
  modules: string[],
  category: string,
): Template {
  return {
    id: `tpl_${Date.now()}_${range(1000, 9999)}`,
    name,
    description: '',
    category,
    modules: [...modules],
    level: 1,
    proficiency: 0,
    stabilityBonus: 0,
    successHistory: 0,
    failHistory: 0,
    version: 1,
    isHidden: false,
    isUserCreated: true,
    taskTags: [category],
    createdAt: getTodayString(),
  }
}
