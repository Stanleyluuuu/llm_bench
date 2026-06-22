import type { ModelIn } from './benchmark'
import type { ValidateStatus } from './ui'

/**
 * Connection status state machine for model endpoints.
 * unverified → verifying → verified | failed
 * Any config edit resets to unverified (isDirty = true).
 */
export type ConnectionStatus = 'unverified' | 'verifying' | 'verified' | 'failed'

/**
 * Extended model type used in the zustand store.
 * Combines ModelIn fields with UI state (color, enabled, connection tracking).
 */
export interface BenchModel extends ModelIn {
  color: string
  enabled: boolean
  validate_status: ValidateStatus
  validate_error?: string
  validate_path?: 'ping' | 'health'
  /** Connection state machine status */
  connectionStatus: ConnectionStatus
  /** Whether config has been edited since last successful verification */
  isDirty: boolean
}
