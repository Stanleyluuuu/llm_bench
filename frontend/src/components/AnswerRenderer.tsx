import { memo, useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Detect content type
// ---------------------------------------------------------------------------

type ContentType = 'json' | 'markdown' | 'plain'

function detectContentType(text: string): ContentType {
  const trimmed = text.trim()
  if (trimmed.length > 1 && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch { /* not JSON */ }
  }
  // Simple heuristics for markdown-like content
  if (
    /^#{1,6}\s/m.test(trimmed) ||
    /\*\*.+\*\*/m.test(trimmed) ||
    /^\s*[-*]\s/m.test(trimmed) ||
    /\[.+\]\(.+\)/m.test(trimmed) ||
    /```/m.test(trimmed) ||
    /^\|.+\|$/m.test(trimmed)
  ) {
    return 'markdown'
  }
  return 'plain'
}

// ---------------------------------------------------------------------------
// Smart JSON tree: zero-dependency, collapsible, bbox-aware inline chips
// ---------------------------------------------------------------------------

/**
 * Coordinate array: all numbers, even length 2–8.
 * e.g. [908, 54, 1123, 336] → render as inline chips instead of expanding.
 */
function isCoordArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    value.length <= 8 &&
    value.length % 2 === 0 &&
    (value as unknown[]).every((n) => typeof n === 'number')
  )
}

/** Inline chips for a coord/bbox array */
function CoordChips({ value }: { value: number[] }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="text-slate-400">[</span>
      {value.map((n, i) => (
        <span
          key={i}
          className="rounded bg-indigo-50 dark:bg-indigo-950/40 px-1 font-mono text-indigo-700 dark:text-indigo-300"
        >
          {n}
        </span>
      ))}
      <span className="text-slate-400">]</span>
    </span>
  )
}

/** A single scalar value rendered with syntax colouring */
function ScalarValue({ value }: { value: unknown }) {
  if (value === null)
    return <span className="text-slate-400">null</span>
  if (typeof value === 'boolean')
    return <span className="text-amber-500 dark:text-amber-400">{String(value)}</span>
  if (typeof value === 'number')
    return <span className="text-amber-600 dark:text-amber-400">{value}</span>
  if (typeof value === 'string')
    return <span className="text-emerald-600 dark:text-emerald-400">"{value}"</span>
  return <span className="text-slate-500">{String(value)}</span>
}

const ARRAY_COLLAPSE_THRESHOLD = 20

interface JsonNodeProps {
  /** Display label (key name or array index) */
  label?: string
  value: unknown
  depth: number
  /** Auto-expand if depth < this */
  defaultInspectDepth: number
  isLast: boolean
}

function JsonNode({ label, value, depth, defaultInspectDepth, isLast }: JsonNodeProps) {
  const isExpandable =
    value !== null &&
    typeof value === 'object' &&
    !isCoordArray(value)

  const childCount = isExpandable
    ? Array.isArray(value)
      ? (value as unknown[]).length
      : Object.keys(value as object).length
    : 0

  const [open, setOpen] = useState(depth < defaultInspectDepth)

  const indent = depth * 12

  // Coord array: always inline
  if (isCoordArray(value)) {
    return (
      <div style={{ paddingLeft: indent }} className="flex items-center gap-1 py-0.5 leading-snug">
        {label != null && (
          <span className="text-indigo-500 dark:text-indigo-400">"{label}"</span>
        )}
        {label != null && <span className="text-slate-400">: </span>}
        <CoordChips value={value} />
        {!isLast && <span className="text-slate-400">,</span>}
      </div>
    )
  }

  // Scalar
  if (!isExpandable) {
    return (
      <div style={{ paddingLeft: indent }} className="flex items-center gap-1 py-0.5 leading-snug">
        {label != null && (
          <span className="text-indigo-500 dark:text-indigo-400">"{label}"</span>
        )}
        {label != null && <span className="text-slate-400">: </span>}
        <ScalarValue value={value} />
        {!isLast && <span className="text-slate-400">,</span>}
      </div>
    )
  }

  // Object / Array
  const isArr = Array.isArray(value)
  const entries = isArr
    ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
    : Object.entries(value as Record<string, unknown>)

  // Large plain-number arrays: show collapsed summary even when open,
  // showing only up to ARRAY_COLLAPSE_THRESHOLD items
  const isBigNumArray =
    isArr &&
    (value as unknown[]).length > ARRAY_COLLAPSE_THRESHOLD &&
    (value as unknown[]).every((n) => typeof n === 'number')

  const openBracket = isArr ? '[' : '{'
  const closeBracket = isArr ? ']' : '}'
  const summary = isArr
    ? `Array(${childCount})`
    : `{${Object.keys(value as object).slice(0, 3).join(', ')}${childCount > 3 ? '…' : ''}}`

  return (
    <div style={{ paddingLeft: depth === 0 ? 0 : indent }} className="leading-snug">
      {/* Toggle row */}
      <div
        className="flex items-center gap-1 py-0.5 cursor-pointer select-none group"
        onClick={() => setOpen((v) => !v)}
        role="button"
        aria-expanded={open}
      >
        <span className="w-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 text-center text-[9px]">
          {open ? '▾' : '▸'}
        </span>
        {label != null && (
          <span className="text-indigo-500 dark:text-indigo-400">"{label}"</span>
        )}
        {label != null && <span className="text-slate-400">: </span>}
        {open ? (
          <span className="text-slate-500">{openBracket}</span>
        ) : (
          <>
            <span className="text-slate-500">{openBracket}</span>
            <span className="text-slate-400 text-[10px] italic ml-0.5">{summary}</span>
            <span className="text-slate-500">{closeBracket}</span>
            {!isLast && <span className="text-slate-400">,</span>}
          </>
        )}
      </div>

      {/* Children */}
      {open && (
        <>
          {isBigNumArray ? (
            <div style={{ paddingLeft: 12 }} className="py-0.5 flex flex-wrap gap-0.5">
              {(value as number[]).slice(0, ARRAY_COLLAPSE_THRESHOLD).map((n, i) => (
                <span key={i} className="rounded bg-amber-50 dark:bg-amber-950/30 px-1 font-mono text-amber-700 dark:text-amber-300">
                  {n}
                </span>
              ))}
              {(value as number[]).length > ARRAY_COLLAPSE_THRESHOLD && (
                <span className="text-slate-400 text-[10px] italic">
                  +{(value as number[]).length - ARRAY_COLLAPSE_THRESHOLD} more…
                </span>
              )}
            </div>
          ) : (
            entries.map(([k, v], i) => (
              <JsonNode
                key={k}
                label={isArr ? undefined : k}
                value={v}
                depth={depth + 1}
                defaultInspectDepth={defaultInspectDepth}
                isLast={i === entries.length - 1}
              />
            ))
          )}
          <div style={{ paddingLeft: depth === 0 ? 0 : indent }} className="flex items-center gap-1 py-0.5">
            <span className="w-3" />
            <span className="text-slate-500">{closeBracket}</span>
            {!isLast && <span className="text-slate-400">,</span>}
          </div>
        </>
      )}
    </div>
  )
}

function SmartJsonViewer({ data }: { data: unknown }) {
  return (
    <div className="max-h-64 overflow-y-auto scrollbar-thin font-mono text-[11px] leading-relaxed">
      <JsonNode value={data} depth={0} defaultInspectDepth={2} isLast />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Markdown renderer (lightweight, no rehype-raw to avoid XSS)
// ---------------------------------------------------------------------------

function MarkdownRenderer({ content }: { content: string }) {
  // Lightweight markdown renderer without external dependencies
  // Renders headings, bold, italic, code blocks, lists, links
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let inCodeBlock = false
  let codeLines: string[] = []
  let codeKey = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${codeKey++}`} className="bg-slate-100 dark:bg-slate-800 rounded px-2 py-1.5 text-[11px] font-mono overflow-x-auto my-1">
            {codeLines.join('\n')}
          </pre>
        )
        codeLines = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1]!.length as 1 | 2 | 3 | 4 | 5 | 6
      const text = headingMatch[2]!
      const Tag = `h${level}` as const
      elements.push(<Tag key={i} className="font-semibold text-foreground mt-1">{renderInline(text)}</Tag>)
      continue
    }

    // Unordered list
    const listMatch = line.match(/^\s*[-*]\s+(.+)$/)
    if (listMatch) {
      elements.push(
        <li key={i} className="ml-3 text-[11px] text-foreground list-disc">{renderInline(listMatch[1]!)}</li>
      )
      continue
    }

    // Ordered list
    const olMatch = line.match(/^\s*(\d+)\.\s+(.+)$/)
    if (olMatch) {
      elements.push(
        <li key={i} className="ml-3 text-[11px] text-foreground list-decimal">{renderInline(olMatch[2]!)}</li>
      )
      continue
    }

    // Table row (simple)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.split('|').filter(Boolean).map(c => c.trim())
      if (cells.every(c => /^[-:]+$/.test(c))) continue // separator row
      elements.push(
        <div key={i} className="flex gap-2 text-[11px] font-mono">
          {cells.map((cell, ci) => (
            <span key={ci} className="px-1 border-r border-border last:border-r-0">{cell}</span>
          ))}
        </div>
      )
      continue
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />)
      continue
    }

    // Regular paragraph
    elements.push(<p key={i} className="text-[11px] text-foreground leading-relaxed">{renderInline(line)}</p>)
  }

  // Flush remaining code block
  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre key={`code-${codeKey}`} className="bg-slate-100 dark:bg-slate-800 rounded px-2 py-1.5 text-[11px] font-mono overflow-x-auto my-1">
        {codeLines.join('\n')}
      </pre>
    )
  }

  return <div className="space-y-0.5">{elements}</div>
}

/** Render inline markdown (bold, italic, code, links) */
function renderInline(text: string): React.ReactNode {
  // Process inline patterns: **bold**, *italic*, `code`, [link](url)
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/)
    if (boldMatch) {
      if (boldMatch[1]) parts.push(<span key={key++}>{boldMatch[1]}</span>)
      parts.push(<strong key={key++} className="font-semibold">{boldMatch[2]}</strong>)
      remaining = boldMatch[3] ?? ''
      continue
    }

    // Inline code
    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)$/)
    if (codeMatch) {
      if (codeMatch[1]) parts.push(<span key={key++}>{codeMatch[1]}</span>)
      parts.push(<code key={key++} className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-[10px] font-mono">{codeMatch[2]}</code>)
      remaining = codeMatch[3] ?? ''
      continue
    }

    // Link [text](url) - render text only (no navigable links to avoid XSS)
    const linkMatch = remaining.match(/^(.*?)\[(.+?)\]\((.+?)\)(.*)$/)
    if (linkMatch) {
      if (linkMatch[1]) parts.push(<span key={key++}>{linkMatch[1]}</span>)
      parts.push(<span key={key++} className="text-primary underline">{linkMatch[2]}</span>)
      remaining = linkMatch[4] ?? ''
      continue
    }

    // No more patterns
    parts.push(<span key={key++}>{remaining}</span>)
    break
  }

  return <>{parts}</>
}

// ---------------------------------------------------------------------------
// Main AnswerRenderer component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Output normaliser — strips Markdown fences, then extracts first JSON block
// ---------------------------------------------------------------------------

interface NormalizeOk { ok: true; data: unknown; raw: string }
interface NormalizeFail { ok: false; raw: string; hadFence: boolean }
type NormalizeResult = NormalizeOk | NormalizeFail

function normalizeModelOutput(raw: string): NormalizeResult {
  if (!raw) return { ok: false, raw: '', hadFence: false }
  let text = raw.trim()
  const hadFence = /```/.test(text)

  // a. strip markdown fences (```json ... ``` or ``` ... ```)
  text = text.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1').trim()

  const tryParse = (s: string): unknown | undefined => {
    try { return JSON.parse(s) } catch { return undefined }
  }

  // b. try direct parse
  let data = tryParse(text)

  // c. fallback: extract first { ... } or [ ... ] block
  if (data === undefined) {
    const m = text.match(/[{[][ \S\s]*[}\]]/);
    if (m) data = tryParse(m[0])
  }

  if (data === undefined) return { ok: false, raw: text, hadFence }
  return { ok: true, data, raw: text }
}

// ---------------------------------------------------------------------------
// Main AnswerRenderer component
// ---------------------------------------------------------------------------

interface AnswerRendererProps {
  content: string
  className?: string
}

/**
 * Multi-format answer renderer.
 * Normalises model output first (strips Markdown fences, extracts JSON),
 * then renders as JsonTree + raw-toggle, Markdown, or plain text.
 * Never uses dangerouslySetInnerHTML — safe from XSS.
 */
export const AnswerRenderer = memo(function AnswerRenderer({ content, className }: AnswerRendererProps) {
  const safeContent = content == null ? '' : typeof content === 'string' ? content : JSON.stringify(content)
  const trimmed = safeContent.trim()
  const [showRaw, setShowRaw] = useState(false)
  const normalized = useMemo(() => normalizeModelOutput(trimmed), [trimmed])

  if (!trimmed) {
    return <span className={cn('text-muted-foreground italic text-[11px]', className)}>（空白）</span>
  }

  // Successfully parsed as JSON → show JsonTree with raw toggle
  if (normalized.ok) {
    return (
      <div className={cn('', className)}>
        <div className="flex justify-end mb-0.5">
          <button
            type="button"
            onClick={() => setShowRaw((v) => !v)}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            {showRaw ? '格式化' : '原始'}
          </button>
        </div>
        {showRaw ? (
          <pre className="font-mono text-[11px] text-foreground whitespace-pre-wrap break-all">
            {normalized.raw}
          </pre>
        ) : (
          <SmartJsonViewer data={normalized.data} />
        )}
      </div>
    )
  }

  // Normalize failed — had Markdown fences but could not extract valid JSON
  if (normalized.hadFence) {
    return (
      <div className={cn('', className)}>
        <div className="flex items-center gap-1 mb-1 text-[10px] text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          <span>輸出含格式標記但無法解析</span>
        </div>
        <span className="font-mono text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap break-all">
          {normalized.raw}
        </span>
      </div>
    )
  }

  // Fallback: detect content type on the stripped text
  const contentType = detectContentType(normalized.raw)
  switch (contentType) {
    case 'markdown':
      return (
        <div className={cn('', className)}>
          <MarkdownRenderer content={normalized.raw} />
        </div>
      )
    case 'plain':
    default:
      return (
        <span className={cn('font-mono text-[11px] leading-relaxed text-foreground whitespace-pre-wrap break-all', className)}>
          {normalized.raw}
        </span>
      )
  }
})
