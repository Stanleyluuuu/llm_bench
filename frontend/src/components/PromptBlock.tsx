import { useState, useCallback } from 'react'
import { ChevronDown, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PromptBlockProps {
  label: string
  subLabel?: string
  content: string
  variant: 'user' | 'system' | 'ground-truth'
  defaultOpen?: boolean
  className?: string
}

/** Highlight {variable} template placeholders in prompt text. */
function HighlightedContent({ text }: { text: string }) {
  const parts = text.split(/(\{[^{}]+\})/g)
  return (
    <>
      {parts.map((part, i) =>
        /^\{[^{}]+\}$/.test(part) ? (
          <mark
            key={i}
            className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded px-0.5 not-italic"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

export function PromptBlock({
  label,
  subLabel,
  content,
  variant,
  defaultOpen = false,
  className,
}: PromptBlockProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available — silently ignore
    }
  }, [content])

  const borderColorClass = {
    user: 'border-l-blue-400 dark:border-l-blue-500',
    system: 'border-l-slate-400 dark:border-l-slate-500',
    'ground-truth': 'border-l-emerald-400 dark:border-l-emerald-500',
  }[variant]

  const badgeClass = {
    user: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    system:
      'bg-slate-100 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
    'ground-truth':
      'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  }[variant]

  return (
    <div
      className={cn(
        'border border-border border-l-4 rounded-r-md bg-card',
        borderColorClass,
        className,
      )}
    >
      {/* Header row — click to toggle */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none hover:bg-accent/20 transition-colors rounded-r-md"
        onClick={() => setIsOpen((v) => !v)}
        role="button"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border flex-shrink-0',
            badgeClass,
          )}
        >
          {label}
        </span>
        {subLabel && (
          <span className="text-[11px] text-muted-foreground truncate">{subLabel}</span>
        )}
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleCopy()
            }}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-accent"
            aria-label="複製內容"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">{copied ? '已複製' : '複製'}</span>
          </button>
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-muted-foreground transition-transform duration-200',
              isOpen ? 'rotate-180' : 'rotate-0',
            )}
          />
        </div>
      </div>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-3 pb-3">
              <div className="max-h-[40vh] sm:max-h-52 overflow-y-auto rounded bg-muted/60 p-2.5 scrollbar-thin">
                <pre className="font-mono text-[11px] leading-relaxed text-foreground whitespace-pre-wrap break-words">
                  <HighlightedContent text={content} />
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
