/**
 * Horizontal progress bar. Animates fill on mount.
 *
 * @example
 * <Progress value={85} />
 * <Progress value={4.2} max={5} variant="success" />
 * <Progress value={23} variant="score-low" height={4} />
 */
export interface ProgressProps {
  /** Current value */
  value: number
  /** Maximum value (default 100) */
  max?: number
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'score-high' | 'score-mid' | 'score-low'
  /** Bar height in px (default 6) */
  height?: number
  /** Run grow animation on mount (default true) */
  animated?: boolean
}
