import type { ModelIn } from './benchmark'

export type ValidateStatus = 'idle' | 'pending' | 'ok' | 'failed'

/** Frontend local model entry (includes UI state). */
export interface LocalModel extends ModelIn {
  color: string
  enabled: boolean
  // Custom-model validate state:
  validate_status: ValidateStatus
  validate_error?: string
  validate_path?: 'ping' | 'health'
}

export interface MetricDisplayInfo {
  displayName: string
  displayValue: string
  barWidth: number
  colorClass: string
}
