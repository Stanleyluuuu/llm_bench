/**
 * Model selector chip used in the Benchmark Models card.
 * Left zone toggles enabled state; right zone shows model info.
 *
 * @example
 * <ModelChip label="LLM Large" name="qwen3-72b" kind="builtin" enabled modelType="LLM" />
 * <ModelChip label="Qwen3-27B" name="Qwen3-27B" kind="custom" accentColor="#8b5cf6" modelType="LLM" />
 */
export interface ModelChipProps {
  /** Display name */
  label: string
  /** Model ID / API name shown in smaller mono text */
  name?: string
  /** Builtin (server-configured) or user-added custom model */
  kind?: 'builtin' | 'custom'
  /** Whether this model is selected for evaluation */
  enabled?: boolean
  /** LLM or VLM */
  modelType?: 'LLM' | 'VLM'
  /** Toggle enabled callback */
  onToggle?: () => void
  /** Left-border accent color (custom models only) */
  accentColor?: string
  /** Detail rows revealed when the info zone is clicked (endpoint, size, provider, doc link…) */
  details?: { label: string; value: string; href?: string }[]
}
