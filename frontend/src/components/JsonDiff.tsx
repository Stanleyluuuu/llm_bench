import { memo, useMemo } from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DiffOp = 'equal' | 'added' | 'removed' | 'changed'

interface DiffEntry {
  key: string
  path: string
  op: DiffOp
  left?: unknown
  right?: unknown
}

// ---------------------------------------------------------------------------
// Deep JSON diff engine
// ---------------------------------------------------------------------------

function flattenForDiff(obj: unknown, path: string = ''): Map<string, unknown> {
  const result = new Map<string, unknown>()

  if (obj === null || obj === undefined || typeof obj !== 'object') {
    result.set(path || '$', obj)
    return result
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      result.set(path || '$', obj)
    } else {
      obj.forEach((item, i) => {
        const childPath = path ? `${path}[${i}]` : `[${i}]`
        for (const [k, v] of flattenForDiff(item, childPath)) {
          result.set(k, v)
        }
      })
    }
    return result
  }

  const entries = Object.entries(obj)
  if (entries.length === 0) {
    result.set(path || '$', obj)
  } else {
    for (const [key, val] of entries) {
      const childPath = path ? `${path}.${key}` : key
      for (const [k, v] of flattenForDiff(val, childPath)) {
        result.set(k, v)
      }
    }
  }
  return result
}

function computeDiff(left: unknown, right: unknown): DiffEntry[] {
  const leftFlat = flattenForDiff(left)
  const rightFlat = flattenForDiff(right)
  const allKeys = new Set([...leftFlat.keys(), ...rightFlat.keys()])
  const diffs: DiffEntry[] = []

  for (const key of Array.from(allKeys).sort()) {
    const hasLeft = leftFlat.has(key)
    const hasRight = rightFlat.has(key)
    const leftVal = leftFlat.get(key)
    const rightVal = rightFlat.get(key)

    if (hasLeft && hasRight) {
      if (JSON.stringify(leftVal) === JSON.stringify(rightVal)) {
        diffs.push({ key, path: key, op: 'equal', left: leftVal, right: rightVal })
      } else {
        diffs.push({ key, path: key, op: 'changed', left: leftVal, right: rightVal })
      }
    } else if (hasLeft && !hasRight) {
      diffs.push({ key, path: key, op: 'removed', left: leftVal })
    } else {
      diffs.push({ key, path: key, op: 'added', right: rightVal })
    }
  }

  return diffs
}

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

function formatValue(val: unknown): string {
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (typeof val === 'string') return `"${val}"`
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

const OP_STYLES: Record<DiffOp, string> = {
  equal: 'text-slate-500 dark:text-slate-400',
  added: 'bg-emerald-100/60 dark:bg-emerald-900/15 text-emerald-700 dark:text-emerald-400 underline underline-offset-2',
  removed: 'bg-rose-100/60 dark:bg-rose-900/15 text-rose-700 dark:text-rose-400 line-through',
  changed: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
}

const OP_LABELS: Record<DiffOp, string> = {
  equal: ' ',
  added: '+',
  removed: '-',
  changed: '~',
}

// ---------------------------------------------------------------------------
// JsonDiff Component
// ---------------------------------------------------------------------------

interface JsonDiffProps {
  /** Ground truth / expected value (stringified or object) */
  expected: string | object
  /** Model output / actual value (stringified or object) */
  actual: string | object
  /** Only show differences (hide equal entries) */
  changesOnly?: boolean
  className?: string
}

/**
 * Visual JSON diff between expected and actual values.
 * Shows additions, removals, and changes at the leaf level.
 * Safe — no dangerouslySetInnerHTML.
 */
export const JsonDiff = memo(function JsonDiff({ expected, actual, changesOnly = false, className }: JsonDiffProps) {
  const parsedExpected = useMemo(() => {
    if (typeof expected === 'string') {
      try { return JSON.parse(expected) } catch { return expected }
    }
    return expected
  }, [expected])

  const parsedActual = useMemo(() => {
    if (typeof actual === 'string') {
      try { return JSON.parse(actual) } catch { return actual }
    }
    return actual
  }, [actual])

  const diffs = useMemo(() => computeDiff(parsedExpected, parsedActual), [parsedExpected, parsedActual])

  const visibleDiffs = changesOnly ? diffs.filter(d => d.op !== 'equal') : diffs
  const changeCount = diffs.filter(d => d.op !== 'equal').length

  if (changeCount === 0) {
    return (
      <div className={cn('text-xs text-emerald-600 dark:text-emerald-400 font-mono px-2 py-1', className)}>
        ✓ 完全一致
      </div>
    )
  }

  return (
    <div className={cn('rounded border border-border overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-muted/50 border-b border-border">
        <span className="text-[10px] font-mono text-muted-foreground">
          {changeCount} 處差異
        </span>
        <div className="flex gap-2 text-[10px] font-mono">
          <span className="text-emerald-600">+新增</span>
          <span className="text-rose-600">-移除</span>
          <span className="text-amber-600">~修改</span>
        </div>
      </div>

      {/* Diff lines */}
      <div className="max-h-60 overflow-y-auto scrollbar-thin">
        {visibleDiffs.map((entry) => (
          <div
            key={entry.key}
            className={cn(
              'flex items-start gap-1 px-2 py-0.5 text-[11px] font-mono border-b border-border/50 last:border-b-0',
              OP_STYLES[entry.op],
            )}
          >
            <span className="w-3 flex-shrink-0 text-center font-bold opacity-70">
              {OP_LABELS[entry.op]}
            </span>
            <span className="text-muted-foreground flex-shrink-0 min-w-[80px] truncate">
              {entry.path}
            </span>
            <span className="flex-1 break-all">
              {entry.op === 'changed' ? (
                <>
                  <span className="line-through opacity-60">{formatValue(entry.left)}</span>
                  <span className="mx-1">→</span>
                  <span className="font-semibold">{formatValue(entry.right)}</span>
                </>
              ) : entry.op === 'removed' ? (
                formatValue(entry.left)
              ) : entry.op === 'added' ? (
                formatValue(entry.right)
              ) : (
                formatValue(entry.left)
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
