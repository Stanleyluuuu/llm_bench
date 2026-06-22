import { create } from 'zustand'
import { useEffect } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Lightweight toast system — no external deps, uses Zustand for store.
 *
 * Usage:
 *   import { toast } from '@/components/Toaster'
 *   toast.error('Network failed')
 *   toast.success('Saved')
 *
 * Mount <Toaster /> once at app root.
 */

export type ToastVariant = 'error' | 'success' | 'info'

interface ToastItem {
  id: number
  variant: ToastVariant
  message: string
  /** Auto-dismiss after this many ms; 0 = sticky */
  durationMs: number
}

interface ToastState {
  toasts: ToastItem[]
  push: (variant: ToastVariant, message: string, durationMs?: number) => number
  dismiss: (id: number) => void
}

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (variant, message, durationMs = 6000) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    set((s) => ({ toasts: [...s.toasts, { id, variant, message, durationMs }] }))
    return id
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  error: (msg: string, durationMs?: number) =>
    useToastStore.getState().push('error', msg, durationMs ?? 8000),
  success: (msg: string, durationMs?: number) =>
    useToastStore.getState().push('success', msg, durationMs ?? 4000),
  info: (msg: string, durationMs?: number) =>
    useToastStore.getState().push('info', msg, durationMs ?? 5000),
  dismiss: (id: number) => useToastStore.getState().dismiss(id),
}

const ICONS = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
} as const

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  error:
    'border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200',
  success:
    'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200',
  info:
    'border-sky-200 dark:border-sky-900/60 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200',
}

function ToastRow({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss)
  const Icon = ICONS[item.variant]

  useEffect(() => {
    if (item.durationMs <= 0) return
    const id = window.setTimeout(() => dismiss(item.id), item.durationMs)
    return () => window.clearTimeout(id)
  }, [item.id, item.durationMs, dismiss])

  return (
    <div
      role={item.variant === 'error' ? 'alert' : 'status'}
      aria-live={item.variant === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'pointer-events-auto flex items-start gap-2.5 rounded-md border px-3.5 py-2.5 shadow-md text-sm',
        'animate-slide-up max-w-sm w-[calc(100vw-2rem)] sm:w-auto',
        VARIANT_CLASSES[item.variant],
      )}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <p className="flex-1 leading-snug break-words">{item.message}</p>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        className="flex-shrink-0 rounded p-0.5 text-current/70 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40"
        aria-label="關閉提示"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  if (toasts.length === 0) return null
  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-label="通知區域"
    >
      {toasts.map((t) => (
        <ToastRow key={t.id} item={t} />
      ))}
    </div>
  )
}
