import { memo, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, Loader2, Check, Info } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { Separator } from '@/components/ui/separator'
import type { ModelTab } from '@/types/benchmark'
import type { LocalModel, ValidateStatus } from '@/types/ui'
import { validateModel } from '@/api/client'

const BUILTIN_LABELS: Record<string, string> = {
  llm_large: 'LLM Large',
  llm_small: 'LLM Small',
  vlm_large: 'VLM Large',
  vlm_small: 'VLM Small',
}

function ValidateBadge({ status, path }: { status: ValidateStatus; path?: string }) {
  if (status === 'pending') return <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" aria-label="驗證中" />
  if (status === 'ok') return <CheckCircle className="w-3 h-3 text-emerald-500" aria-label={`✓ ${path ?? ''}`} />
  if (status === 'failed') return <XCircle className="w-3 h-3 text-destructive" aria-label="URL 無法連線" />
  return null
}

function SourceBadge({ kind }: { kind: 'builtin' | 'custom' }) {
  if (kind === 'builtin') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-model-builtin-soft text-model-builtin flex-shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
        Builtin
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-model-custom-soft text-model-custom flex-shrink-0">
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      Custom
    </span>
  )
}

// ── ModelDetailDialog ─────────────────────────────────────────────────────────

interface EditModelFields {
  display_name: string
  name: string
  api_base: string
  max_token: number
  resize_enabled: boolean
  resize_x: number
  resize_y: number
}

function fieldsFromModel(model: LocalModel): EditModelFields {
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

function ModelDetailDialog({
  model,
  open,
  onClose,
  onUpdate,
}: {
  model: LocalModel
  open: boolean
  onClose: () => void
  onUpdate?: (id: string, fields: { display_name: string; name: string; api_base: string; max_token: number; resize?: [number, number] }) => void
}) {
  const isBuiltin = model.kind === 'builtin'
  const [fields, setFields] = useState<EditModelFields>(() => fieldsFromModel(model))
  const [testStatus, setTestStatus] = useState<'idle' | 'pending' | 'ok' | 'failed'>('idle')
  const [testError, setTestError] = useState<string | null>(null)

  // Reset fields whenever the model changes or dialog reopens
  useEffect(() => {
    if (open) {
      setFields(fieldsFromModel(model))
      setTestStatus('idle')
      setTestError(null)
    }
  }, [open, model])

  // Reset test status when api_base changes
  useEffect(() => {
    setTestStatus('idle')
    setTestError(null)
  }, [fields.api_base])

  async function handleTest() {
    const target = isBuiltin ? (model.api_base ?? '') : fields.api_base
    if (!target.trim()) return
    setTestStatus('pending')
    setTestError(null)
    try {
      const baseUrl = target.trim().replace(/\/v1\/?$/, '')
      const res = await validateModel(baseUrl)
      setTestStatus(res.ok ? 'ok' : 'failed')
      if (!res.ok) setTestError(res.error ?? '無法連線')
    } catch (err: unknown) {
      setTestStatus('failed')
      setTestError(err instanceof Error ? err.message : '連線失敗')
    }
  }

  function handleConfirm() {
    if (!onUpdate) return
    onUpdate(model.id, {
      display_name: fields.display_name,
      name: fields.name,
      api_base: fields.api_base,
      max_token: fields.max_token,
      resize:
        fields.resize_enabled && fields.resize_x > 0 && fields.resize_y > 0
          ? [fields.resize_x, fields.resize_y]
          : undefined,
    })
    onClose()
  }

  const canConfirm =
    !isBuiltin &&
    fields.display_name.trim() !== '' &&
    fields.name.trim() !== '' &&
    fields.api_base.trim() !== ''

  // Fields to display for builtin (read-only) — only surface meaningful values
  const builtinRows: { label: string; value: string; mono?: boolean; badge?: boolean }[] = [
    { label: 'ID', value: model.id, mono: true },
    { label: 'Kind', value: model.kind, badge: true },
    { label: 'Type', value: model.model_type, badge: true },
    { label: 'Max Token', value: model.max_token.toLocaleString() },
  ]

  const testTarget = isBuiltin ? (model.api_base ?? '') : fields.api_base

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="bg-card border border-border rounded-md shadow-xl w-full max-w-md overflow-hidden relative z-10"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
              <div>
                <h3 className="font-bold text-foreground text-base">
                  {isBuiltin ? '模型資訊' : '編輯模型'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isBuiltin
                    ? 'Builtin 模型由後端 settings 控制，僅供檢視。'
                    : '修改欄位後按「確認」儲存，系統會重新驗證連線。'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="關閉"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            {isBuiltin ? (
              <div className="p-5 flex flex-col gap-3.5">
                {builtinRows.map((row, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start text-sm border-b border-border/50 pb-2.5 last:border-0 last:pb-0"
                  >
                    <span className="text-muted-foreground flex-shrink-0 w-32">{row.label}</span>
                    <span
                      className={[
                        'text-right text-foreground break-all',
                        row.mono ? 'font-mono text-xs bg-secondary px-1.5 py-0.5 rounded' : '',
                        row.badge ? 'bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 space-y-3">
                {[
                  { label: '顯示名稱 *', key: 'display_name' as const, placeholder: '例: Qwen3-27B' },
                  { label: '模型名稱 (API) *', key: 'name' as const, placeholder: '例: Qwen3-27B' },
                  { label: 'API Base URL *', key: 'api_base' as const, placeholder: 'http://host:9292/v1' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs text-muted-foreground mb-1 font-mono">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={fields[key]}
                      onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full bg-background border border-border rounded-sm px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-mono">MAX TOKEN</label>
                  <input
                    type="number"
                    value={fields.max_token}
                    onChange={(e) => setFields((f) => ({ ...f, max_token: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-background border border-border rounded-sm px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {model.model_type === 'VLM' && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fields.resize_enabled}
                        onChange={(e) =>
                          setFields((f) => ({
                            ...f,
                            resize_enabled: e.target.checked,
                            ...(!e.target.checked && { resize_x: 0, resize_y: 0 }),
                          }))
                        }
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-xs font-mono text-muted-foreground">Locate Resize</span>
                    </label>
                    {fields.resize_enabled && (
                      <div className="flex items-center gap-2">
                        {([{ k: 'resize_x' as const, label: 'W' }, { k: 'resize_y' as const, label: 'H' }]).map(({ k, label }) => (
                          <div key={k} className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">{label}</span>
                            <input
                              type="number"
                              placeholder="px"
                              value={fields[k] || ''}
                              onChange={(e) => setFields((f) => ({ ...f, [k]: parseInt(e.target.value) || 0 }))}
                              className="w-20 bg-background border border-border rounded-sm px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="p-4 bg-secondary/30 border-t border-border flex flex-col gap-2">
              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-md transition-colors"
                >
                  {isBuiltin ? '關閉' : '取消'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleTest()}
                  disabled={!testTarget.trim() || testStatus === 'pending'}
                  className="px-3 py-2 text-xs font-mono border border-border rounded-md bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {testStatus === 'pending' && <Loader2 className="w-3 h-3 animate-spin" />}
                  {testStatus === 'ok' && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                  {testStatus === 'failed' && <XCircle className="w-3 h-3 text-red-500" />}
                  測試連線
                </button>
                {!isBuiltin && (
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                    className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    確認
                  </button>
                )}
              </div>
              {testStatus === 'failed' && testError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-mono text-right">連線失敗: {testError}</p>
              )}
              {testStatus === 'ok' && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono text-right">✓ API 可達</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

// ── ModelChip ─────────────────────────────────────────────────────────────────

const ModelChip = memo(function ModelChip({
  model, onToggle, onRemove, onUpdate,
}: {
  model: LocalModel
  onToggle: () => void
  onRemove?: () => void
  onUpdate?: (id: string, fields: { display_name: string; name: string; api_base: string; max_token: number; resize?: [number, number] }) => void
}) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [removeConfirm, setRemoveConfirm] = useState(false)
  const label = BUILTIN_LABELS[model.id] ?? (model.display_name || model.name || model.id)
  return (
    <>
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
        className={[
          'flex items-stretch rounded-md border-2 transition-all duration-200 overflow-hidden',
          'bg-card h-[4.5rem] min-w-[160px] sm:min-w-[200px] max-w-[280px]',
          model.enabled
            ? 'border-primary dark:border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-1 ring-primary/30 dark:ring-primary/40'
            : 'border-border opacity-70 hover:opacity-100',
        ].join(' ')}
        style={model.kind === 'custom' ? { borderLeftColor: model.color, borderLeftWidth: 3 } : {}}
      >
        {/* Left: toggle zone — lighter fill so it's not so heavy */}
        <div
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          className={[
            'w-12 flex items-center justify-center cursor-pointer border-r transition-colors flex-shrink-0',
            model.enabled
              ? 'bg-primary/10 border-primary/20'
              : 'bg-secondary border-border hover:bg-accent',
          ].join(' ')}
          title={model.enabled ? '停用模型' : '啟用模型'}
          role="checkbox"
          aria-checked={model.enabled}
          aria-label={`${model.enabled ? '停用' : '啟用'} ${label}`}
        >
          <div
            className={[
              'w-5 h-5 rounded flex items-center justify-center transition-all border-2',
              model.enabled
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-muted-foreground bg-card',
            ].join(' ')}
          >
            {model.enabled && <Check size={13} className="stroke-[3]" />}
          </div>
        </div>

        {/* Right: info / open detail zone */}
        <div
          onClick={() => { if (!removeConfirm) setDetailOpen(true) }}
          className="flex-1 px-3 py-2 flex items-center justify-between cursor-pointer group hover:bg-accent/40 transition-colors min-w-0"
        >
          <div className="truncate pr-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`text-sm font-semibold truncate ${model.enabled ? 'text-indigo-700 dark:text-indigo-300' : 'text-foreground'}`}>{label}</span>
              <SourceBadge kind={model.kind} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-mono truncate">{model.name}</span>
              {model.kind === 'custom' && (
                <ValidateBadge status={model.validate_status} path={model.validate_path} />
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-1">
            {onRemove && !removeConfirm && (
              <button
                onClick={(e) => { e.stopPropagation(); setRemoveConfirm(true) }}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded-sm opacity-0 group-hover:opacity-100"
                title="移除模型"
                aria-label="移除模型"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            {removeConfirm && (
              <div
                className="flex items-center gap-1 text-[11px]"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-muted-foreground">移除？</span>
                <button
                  onClick={() => { onRemove!(); setRemoveConfirm(false) }}
                  className="text-destructive hover:underline font-medium"
                >確定</button>
                <button
                  onClick={() => setRemoveConfirm(false)}
                  className="text-muted-foreground hover:underline"
                >取消</button>
              </div>
            )}
            {!removeConfirm && (
              <Info size={15} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            )}
          </div>
        </div>
      </motion.div>
      <ModelDetailDialog
        model={model}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  )
})

interface AddModelFields {
  display_name: string
  name: string
  api_base: string
  max_token: number
  resize_enabled: boolean
  resize_x: number
  resize_y: number
}

const EMPTY_FIELDS: AddModelFields = {
  display_name: '',
  name: '',
  api_base: '',
  max_token: 100000,
  resize_enabled: false,
  resize_x: 0,
  resize_y: 0,
}

function AddModelDialog({ onAdd }: {
  onAdd: (type: ModelTab, fields: AddModelFields) => void
}) {
  const [open, setOpen] = useState(false)
  const [modelType, setModelType] = useState<ModelTab>('LLM')
  const [fields, setFields] = useState<AddModelFields>(EMPTY_FIELDS)
  const [testStatus, setTestStatus] = useState<'idle' | 'pending' | 'ok' | 'failed'>('idle')
  const [testError, setTestError] = useState<string | null>(null)
  const [urlDirty, setUrlDirty] = useState(false)

  function isValidApiUrl(url: string): boolean {
    return /^https?:\/\/.+\/v1\/?$/.test(url.trim())
  }

  // Reset test status whenever api_base changes
  useEffect(() => {
    setTestStatus('idle')
    setTestError(null)
  }, [fields.api_base])

  async function handleTest() {
    if (!fields.api_base.trim()) return
    setTestStatus('pending')
    setTestError(null)
    try {
      // User provides /v1 URL; strip /v1 so we probe the server root (/health)
      const baseUrl = fields.api_base.trim().replace(/\/v1\/?$/, '')
      const res = await validateModel(baseUrl)
      setTestStatus(res.ok ? 'ok' : 'failed')
      if (!res.ok) setTestError(res.error ?? '無法連線')
    } catch (err: unknown) {
      setTestStatus('failed')
      setTestError(err instanceof Error ? err.message : '連線失敗')
    }
  }

  const canSubmit =
    fields.display_name.trim() !== '' &&
    fields.name.trim() !== '' &&
    isValidApiUrl(fields.api_base) &&
    (modelType === 'LLM' || !fields.resize_enabled || (fields.resize_x > 0 && fields.resize_y > 0))

  function handleSubmit() {
    if (!canSubmit) return
    onAdd(modelType, fields)
    setOpen(false)
    setModelType('LLM')
    setFields(EMPTY_FIELDS)
    setTestStatus('idle')
    setTestError(null)
    setUrlDirty(false)
  }

  return (
    <>
      {/* .amb-btn styles live in index.css */}
      <Dialog.Root open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setModelType('LLM'); setFields(EMPTY_FIELDS); setTestStatus('idle'); setTestError(null); setUrlDirty(false) } }}>
      <Dialog.Trigger asChild>
        <button className="amb-btn" aria-label="新增模型">
          <span className="amb-sign">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14M5 12h14" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="amb-text">新增模型</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-card border border-border rounded-md shadow-xl p-6 space-y-5"
          aria-describedby="add-model-desc"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-foreground">新增模型</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 -m-1 text-muted-foreground hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background" aria-label="關閉">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description id="add-model-desc" className="text-xs text-muted-foreground">
            填寫後儲存。系統會自動嘗試連線驗證 API URL。
          </Dialog.Description>

          <div className="flex gap-2">
            {(['LLM', 'VLM'] as const).map((t) => (
              <button key={t} type="button" onClick={() => {
                setModelType(t)
                setFields((f) => ({ ...f, max_token: t === 'VLM' ? 4096 : 100000 }))
              }}
                className={['flex-1 py-2 text-sm rounded-md border font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  modelType === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-foreground border-border hover:bg-accent'].join(' ')}
              >{t}</button>
            ))}
          </div>

          <div className="space-y-3">
            {[
              { label: '顯示名稱 *', key: 'display_name' as const, placeholder: '例: Qwen3-27B', hint: '' },
              { label: '模型名稱 (API) *', key: 'name' as const, placeholder: '例: Qwen3-27B', hint: '' },
            ].map(({ label, key, placeholder, hint }) => (
              <div key={key}>
                <label className="block text-xs text-muted-foreground mb-1 font-mono">{label}</label>
                <input type="text" placeholder={placeholder} value={fields[key]}
                  onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-background border border-border rounded-sm px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {hint && <p className="text-[11px] text-muted-foreground/70 mt-0.5 font-mono">{hint}</p>}
              </div>
            ))}

            <div>
              <label className="block text-xs text-muted-foreground mb-1 font-mono">API Base URL *</label>
              <input
                type="text"
                placeholder="http://host:9292/v1"
                value={fields.api_base}
                onChange={(e) => setFields((f) => ({ ...f, api_base: e.target.value }))}
                onBlur={() => setUrlDirty(true)}
                className={`w-full bg-background border rounded-sm px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 ${
                  urlDirty && fields.api_base && !isValidApiUrl(fields.api_base)
                    ? 'border-red-400 focus:ring-red-300'
                    : 'border-border focus:ring-primary'
                }`}
              />
              {urlDirty && fields.api_base && !isValidApiUrl(fields.api_base) && (
                <p className="text-xs text-red-500 mt-1">請填寫含 /v1 的完整路徑，例如 http://host:9292/v1</p>
              )}
            </div>

            {modelType === 'LLM' ? (
              <div>
                <label className="block text-xs text-muted-foreground mb-1 font-mono">MAX TOKEN</label>
                <input type="number" value={fields.max_token}
                  onChange={(e) => setFields((f) => ({ ...f, max_token: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-background border border-border rounded-sm px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-mono">MAX TOKEN</label>
                  <input type="number" value={fields.max_token}
                    onChange={(e) => setFields((f) => ({ ...f, max_token: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-background border border-border rounded-sm px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={fields.resize_enabled}
                    onChange={(e) => setFields((f) => ({ ...f, resize_enabled: e.target.checked, ...(!e.target.checked && { resize_x: 0, resize_y: 0 }) }))}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-xs font-mono text-muted-foreground">Locate Resize</span>
                  <span className="relative group inline-flex">
                    <button
                      type="button"
                      className="w-4 h-4 rounded-full bg-secondary text-muted-foreground text-[10px] font-bold leading-none flex items-center justify-center hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Locate Resize 說明"
                      tabIndex={0}
                    >
                      i
                    </button>
                    <span className="pointer-events-none invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-tooltip text-tooltip-foreground text-[11px] rounded-md px-2.5 py-2 shadow-lg z-50 text-center leading-relaxed whitespace-normal">
                      控制 VLM 推理時是否對圖片進行縮放，影響準確率與推理速度
                      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-tooltip" />
                    </span>
                  </span>
                </label>
                {fields.resize_enabled && (
                  <div className="flex items-center gap-2">
                    {[{ k: 'resize_x' as const, label: 'W' }, { k: 'resize_y' as const, label: 'H' }].map(({ k, label }) => (
                      <div key={k} className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <input type="number" placeholder="px" value={fields[k] || ''}
                          onChange={(e) => setFields((f) => ({ ...f, [k]: parseInt(e.target.value) || 0 }))}
                          className="w-20 bg-background border border-border rounded-sm px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                取消
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={() => void handleTest()}
              disabled={!isValidApiUrl(fields.api_base) || testStatus === 'pending'}
              className="px-3 py-2 text-xs font-mono border border-border rounded-md bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {testStatus === 'pending' && <Loader2 className="w-3 h-3 animate-spin" />}
              {testStatus === 'ok' && <CheckCircle className="w-3 h-3 text-emerald-500" />}
              {testStatus === 'failed' && <XCircle className="w-3 h-3 text-red-500" />}
              測試連線
            </button>
            <button onClick={handleSubmit} disabled={!canSubmit}
              aria-label="確認新增模型"
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              新增
            </button>
          </div>
          {testStatus === 'failed' && testError && (
            <p className="text-xs text-red-600 dark:text-red-400 font-mono -mt-1">連線失敗: {testError}</p>
          )}
          {testStatus === 'ok' && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono -mt-1">✓ API 可達</p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
    </>
  )
}

type UpdateModelFn = (id: string, fields: { display_name: string; name: string; api_base: string; max_token: number; resize?: [number, number] }) => void

interface ModelGroupProps {
  type: ModelTab
  models: LocalModel[]
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onUpdate: UpdateModelFn
}

const ModelGroup = memo(function ModelGroup({ type, models, onToggle, onRemove, onUpdate }: ModelGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">{type}</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {models.map((m) => (
          <ModelChip
            key={m.id}
            model={m}
            onToggle={() => onToggle(m.id)}
            onRemove={m.kind === 'custom' ? () => onRemove(m.id) : undefined}
            onUpdate={onUpdate}
          />
        ))}
        {models.length === 0 && <span className="text-xs text-muted-foreground">點擊右上角「+」新增自訂模型</span>}
      </div>
    </div>
  )
})

interface BenchmarkModelsCardProps {
  allModels: LocalModel[]
  onToggle: (id: string) => void
  onAdd: (type: ModelTab, fields: AddModelFields) => void
  onRemove: (id: string) => void
  onUpdate: UpdateModelFn
}

export function BenchmarkModelsCard({ allModels, onToggle, onAdd, onRemove, onUpdate }: BenchmarkModelsCardProps) {
  const llmModels = allModels.filter((m) => m.model_type === 'LLM')
  const vlmModels = allModels.filter((m) => m.model_type === 'VLM')

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-3 border-b border-border gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-base font-semibold text-foreground flex-shrink-0">Benchmark 模型</h2>
          <span className="text-xs text-muted-foreground hidden sm:block">點模型右側可展開端點 / 連結等細節</span>
        </div>
        <AddModelDialog onAdd={onAdd} />
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <ModelGroup type="LLM" models={llmModels} onToggle={onToggle} onRemove={onRemove} onUpdate={onUpdate} />
        <Separator />
        <ModelGroup type="VLM" models={vlmModels} onToggle={onToggle} onRemove={onRemove} onUpdate={onUpdate} />
      </div>
    </div>
  )
}
