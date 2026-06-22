/**
 * Metric display card. Handles loading, empty, and data states automatically.
 * Left-border accent for warning/error/active status.
 *
 * @example
 * // Normal
 * <MetricCard label="準確率" value="92.4" unit="%" status="normal" />
 * // Loading skeleton
 * <MetricCard label="Avg Score" loading />
 * // Empty
 * <MetricCard label="mean IoU" value={null} />
 * // With mini sparkline
 * <MetricCard label="7-day trend" value="87.1" unit="%" trend={[72, 78, 81, 85, 83, 87, 87.1]} />
 * // Status variants
 * <MetricCard label="Response time" value="4.2" unit="s" status="warning" />
 *
 * @startingPoint section="Components" subtitle="Metric display with loading, empty, and data states" viewport="700x180"
 */
export interface MetricCardProps {
  /** Card label */
  label?: string
  /** Display value (null/undefined triggers empty state) */
  value?: number | string | null
  /** Unit suffix shown in smaller text */
  unit?: string
  /** Left-border accent and border color */
  status?: 'normal' | 'warning' | 'error' | 'active'
  /** Show skeleton shimmer placeholder */
  loading?: boolean
  /** Optional array of numbers for a mini sparkline */
  trend?: number[]
}
