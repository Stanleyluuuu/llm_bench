import { memo, useState, useEffect, useCallback } from 'react'
import { Info, Loader2, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BenchModel, ConnectionStatus } from '@/types/store'

// ---------------------------------------------------------------------------
// ConnectionBadge — visual indicator for connection state machine
// ---------------------------------------------------------------------------

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  switch (status) {
    case 'verifying':
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" />
          驗證中
        </span>
      )
    case 'verified':
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="w-3 h-3" />
          已連線
        </span>
      )
    case 'failed':
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono text-rose-600 dark:text-rose-400">
          <XCircle className="w-3 h-3" />
          連線失敗
        </span>
      )
    case 'unverified':
    default:
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono text-amber-600 dark:text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          未驗證
        </span>
      )
  }
}

// ---------------------------------------------------------------------------
// ModelConfigPopover — inline config editor with connection verification
// ---------------------------------------------------------------------------

interface ModelConfigPopoverProps {
  model: BenchModel
  open: boolean
  onClose: () => void
  onUpdate: (id: string, fields: {
    display_name: string
    name: string
    api_base: string
    max_token: number
    resize?: [number, number]
  }) => void
  onVerify: (id: string) => void
}

interface EditFields {
  display_name: string
  name: string
  api_base: string
  max_token: number
  resize_enabled: boolean
  resize_x: number
  resize_y: number
}

function fieldsFromModel(model: BenchModel): EditFields {
  return {
    display_name: model.display_name,
    name: model.name,
    api_base: model.api_base,
    max_token: model.max_token,
    resize_enabled: !!model.resize,
    resize_x: model.resize?.[0] ?? 0,
    resize_y: model.resize?.[1] ?? 0,
  }
}

function fieldsChanged(original: BenchModel, fields: EditFields): boolean {
  if (fields.display_name !== original.display_name) return true
  if (fields.name !== original.name) return true
  if (fields.api_base !== original.api_base) return true
  if (fields.max_token !== original.max_token) return true
  const origResize = original.resize
  const newResize = fields.resize_enabled && fields.resize_x > 0 && fields.resize_y > 0
    ? [fields.resize_x, fields.resize_y] as [number, number]
    : undefined
  if (JSON.stringify(origResize) !== JSON.stringify(newResize)) return true
  return false
}

export const ModelConfigPopover = memo(function ModelConfigPopover({
  model,
  open,
  onClose,
  onUpdate,
  onVerify,
}: ModelConfigPopoverProps) {
  const isBuiltin = model.kind === 'builtin'
  const [fields, setFields] = useState<EditFields>(() => fieldsFromModel(model))
  const [localDirty, setLocalDirty] = useState(false)

  // Sync fields when model changes or popover opens
  useEffect(() => {
    if (open) {
      setFields(fieldsFromModel(model))
      setLocalDirty(false)
    }
  }, [open, model])

  // Track if fields have been edited
  useEffect(() => {
    setLocalDirty(fieldsChanged(model, fields))
  }, [model, fields])

  const handleFieldChange = useCallback((key: keyof EditFields, value: string | number | boolean) => {
    setFields(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleSave = useCallback(() => {
    onUpdate(model.id, {
      display_name: fields.display_name,
      name: fields.name,
      api_base: fields.api_base,
      max_token: fields.max_token,
      resize: fields.resize_enabled && fields.resize_x > 0 && fields.resize_y > 0
        ? [fields.resize_x, fields.resize_y]
        : undefined,
    })
    setLocalDirty(false)
    onClose()
  }, [model.id, fields, onUpdate, onClose])

  const handleVerify = useCallback(() => {
    onVerify(model.id)
  }, [model.id, onVerify])

  const canSave = !isBuiltin &&
    fields.display_name.trim() !== '' &&
    fields.name.trim() !== '' &&
    fields.api_base.trim() !== '' &&
    localDirty

  if (!open) return null

  // Builtin read-only view
  const builtinRows: { label: string; value: string }[] = isBuiltin
    ? [
        { label: 'ID', value: model.id },
        { label: 'Type', value: model.model_type },
        { label: '模型名稱', value: model.display_name },
        { label: 'API name', value: model.name },
        { label: 'API Base', value: model.api_base || '（後端控制）' },
        { label: 'Max Token', value: String(model.max_token) },
      ]
    : []

  return (
    <div
      className="fixed inset-0 z-40"
      onClick={(e) => { e.stopPropagation(); onClose() }}
    >
      <div
        className="absolute z-50 w-80 bg-card border border-border rounded-md shadow-xl p-4 space-y-3"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            {isBuiltin ? '模型資訊' : '模型設定'}
          </h3>
          <ConnectionBadge status={model.connectionStatus} />
        </div>

        {isBuiltin ? (
          // Builtin: read-only
          <div className="space-y-1.5">
            {builtinRows.map(({ label, value }) => (
              <div key={label} className="flex gap-2 text-xs">
                <span className="w-24 shrink-0 font-mono text-muted-foreground">{label}</span>
                <span className="font-mono text-foreground break-all">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          // Custom: editable form
          <div className="space-y-2.5">
            {([
              { label: '顯示名稱', key: 'display_name' as const, placeholder: 'Qwen3-27B' },
              { label: '模型 (API)', key: 'name' as const, placeholder: 'Qwen3-27B' },
              { label: 'API Base', key: 'api_base' as const, placeholder: 'http://host:9292/v1' },
            ] as const).map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-[10px] text-muted-foreground mb-0.5 font-mono">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={fields[key]}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="w-full bg-background border border-border rounded-sm px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}

            <div>
              <label className="block text-[10px] text-muted-foreground mb-0.5 font-mono">Max Token</label>
              <input
                type="number"
                value={fields.max_token}
                onChange={(e) => handleFieldChange('max_token', parseInt(e.target.value) || 0)}
                className="w-full bg-background border border-border rounded-sm px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {model.model_type === 'VLM' && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fields.resize_enabled}
                    onChange={(e) => {
                      handleFieldChange('resize_enabled', e.target.checked)
                      if (!e.target.checked) {
                        setFields(prev => ({ ...prev, resize_x: 0, resize_y: 0 }))
                      }
                    }}
                    className="w-3.5 h-3.5 accent-primary"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground">Locate Resize</span>
                </label>
                {fields.resize_enabled && (
                  <div className="flex items-center gap-2">
                    {([{ k: 'resize_x' as const, label: 'W' }, { k: 'resize_y' as const, label: 'H' }] as const).map(({ k, label }) => (
                      <div key={k} className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">{label}</span>
                        <input
                          type="number"
                          placeholder="px"
                          value={fields[k] || ''}
                          onChange={(e) => handleFieldChange(k, parseInt(e.target.value) || 0)}
                          className="w-16 bg-background border border-border rounded-sm px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Dirty indicator */}
        {localDirty && (
          <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            未儲存的變更
          </div>
        )}

        {/* Validation error */}
        {model.validate_error && model.connectionStatus === 'failed' && (
          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">
            ❌ {model.validate_error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
          <button
            type="button"
            onClick={handleVerify}
            disabled={model.connectionStatus === 'verifying'}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono border border-border rounded bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {model.connectionStatus === 'verifying'
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <RotateCcw className="w-3 h-3" />
            }
            測試連線
          </button>
          {!isBuiltin && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="px-3 py-1 text-[10px] bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                儲存
              </button>
            </>
          )}
          {isBuiltin && (
            <button
              type="button"
              onClick={onClose}
              className="px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              關閉
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

// ---------------------------------------------------------------------------
// Info button (used next to checkbox, with stopPropagation)
// ---------------------------------------------------------------------------

interface ModelInfoButtonProps {
  onClick: (e: React.MouseEvent) => void
  connectionStatus: ConnectionStatus
}

export const ModelInfoButton = memo(function ModelInfoButton({ onClick, connectionStatus }: ModelInfoButtonProps) {
  const statusDot = connectionStatus === 'verified'
    ? 'bg-emerald-500'
    : connectionStatus === 'failed'
    ? 'bg-rose-500'
    : connectionStatus === 'verifying'
    ? 'bg-amber-500 animate-pulse'
    : 'bg-slate-400'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick(e)
      }}
      className="relative p-0.5 rounded hover:bg-accent transition-colors"
      aria-label="模型設定"
    >
      <Info className="w-3.5 h-3.5 text-muted-foreground" />
      <span className={cn('absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-card', statusDot)} />
    </button>
  )
})
