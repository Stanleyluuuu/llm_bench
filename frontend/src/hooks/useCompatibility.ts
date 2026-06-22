import { useMemo } from 'react'
import type { ModelIn, ProjectItem } from '@/types/benchmark'

/**
 * Compatibility gate between selected models and selected projects.
 *
 * Rule (single direction): an enabled **LLM** model is incompatible with a
 * selected **VLM** project. The reverse is allowed — a VLM model may run
 * an LLM project.
 *
 * Returns a precomputed `validationError` (Traditional Chinese) and
 * incompatible-model / project lists for downstream UI use.
 */
export interface CompatibilityResult {
  /** Human-readable zh-TW error message; null when no conflict. */
  validationError: string | null
  /** IDs of enabled LLM models that conflict with current project selection. */
  incompatibleModelIds: string[]
  /** Names of selected VLM projects (the source of incompatibility). */
  conflictingProjectNames: string[]
}

export function useCompatibility(
  enabledModels: ModelIn[],
  projects: ProjectItem[],
  selectedProjects: Set<string>,
): CompatibilityResult {
  return useMemo(() => {
    const selectedVLMProjects = projects.filter(
      (p) => p.type === 'VLM' && selectedProjects.has(p.name),
    )
    const enabledLLMModels = enabledModels.filter((m) => m.model_type === 'LLM')

    const hasConflict = selectedVLMProjects.length > 0 && enabledLLMModels.length > 0
    if (!hasConflict) {
      return {
        validationError: null,
        incompatibleModelIds: [],
        conflictingProjectNames: [],
      }
    }

    const modelLabels = enabledLLMModels.map((m) => m.display_name).join('、')
    const projectLabels = selectedVLMProjects.map((p) => p.name).join('、')
    return {
      validationError: `LLM 模型（${modelLabels}）無法執行 VLM 專案（${projectLabels}），請取消勾選該模型或該專案。`,
      incompatibleModelIds: enabledLLMModels.map((m) => m.id),
      conflictingProjectNames: selectedVLMProjects.map((p) => p.name),
    }
  }, [enabledModels, projects, selectedProjects])
}
