/**
 * Primary action button. Use for all interactive triggers in the benchmark UI.
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleEvaluate}>開始評估</Button>
 * <Button variant="secondary" size="sm">重新載入</Button>
 * <Button variant="outline" size="md">歷史趨勢</Button>
 * <Button variant="destructive" size="sm" disabled>刪除</Button>
 * <Button variant="ghost" size="sm" loading>評估中…</Button>
 *
 * @startingPoint section="Components" subtitle="Action button with 5 variants and 3 sizes" viewport="700x220"
 */
export interface ButtonProps {
  /** Button label / content */
  children: React.ReactNode
  /** Visual treatment */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  /** Compact / default / large */
  size?: 'sm' | 'md' | 'lg'
  /** Disables interaction */
  disabled?: boolean
  /** Shows a spinner and disables the button */
  loading?: boolean
  /** Click handler */
  onClick?: () => void
  /** HTML type attribute */
  type?: 'button' | 'submit' | 'reset'
  /** Additional inline styles */
  style?: React.CSSProperties
}
