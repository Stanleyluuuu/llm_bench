/**
 * Inline label for status, model source type, capabilities, and score bands.
 *
 * @example
 * <Badge variant="success" dot>Pass</Badge>
 * <Badge variant="error">Fail</Badge>
 * <Badge variant="builtin" dot>Builtin</Badge>
 * <Badge variant="custom" dot>Custom</Badge>
 * <Badge variant="score-high">92%</Badge>
 * <Badge variant="grounding">Grounding</Badge>
 * <Badge variant="pending" dot>Running</Badge>
 */
export interface BadgeProps {
  /** Label text */
  children: React.ReactNode
  /**
   * Visual style.
   * Status: 'success' | 'warning' | 'error' | 'pending'
   * Model: 'builtin' | 'custom'
   * Score: 'score-high' | 'score-mid' | 'score-low'
   * Capability: 'grounding' | 'ocr' | 'detection' | 'vlm'
   * Fallback: 'default'
   */
  variant?: 'success' | 'warning' | 'error' | 'pending' | 'builtin' | 'custom' | 'score-high' | 'score-mid' | 'score-low' | 'grounding' | 'ocr' | 'detection' | 'vlm' | 'default'
  /** Show a small dot before the label */
  dot?: boolean
  /** Pill shape (default true) vs square chip */
  pill?: boolean
}
