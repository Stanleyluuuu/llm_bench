import { create } from 'zustand'
import { fetchConfig, validateModel } from '@/api/client'
import type { ConfigResponse, EvaluateResultMap, ModelTab } from '@/types/benchmark'
import type { LocalModel, ValidateStatus } from '@/types/ui'
import type { ConnectionStatus, BenchModel } from '@/types/store'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'customModels_v3'
const TTL_MS = 7 * 24 * 60 * 60 * 1000

const BUILTIN_COLORS: Record<string, string> = {
  llm_large: '#3b82f6',
  llm_small: '#60a5fa',
  vlm_large: '#0ea5e9',
  vlm_small: '#38bdf8',
}

const EXTRA_COLORS = [
  '#0284c7', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
  '#84cc16', '#e11d48', '#0d9488', '#0891b2', '#ca8a04',
] as const

// ---------------------------------------------------------------------------
// LocalStorage helpers
// ---------------------------------------------------------------------------

function loadCustomFromStorage(): BenchModel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as { models: BenchModel[]; timestamp: number }
    if (Date.now() - data.timestamp > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return []
    }
    return data.models ?? []
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

function saveCustomToStorage(models: BenchModel[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ models, timestamp: Date.now() }))
}

function slugId(displayName: string, index: number): string {
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32) || `model-${index}`
  return `custom:${slug}`
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface BenchmarkState {
  // ── Models ──────────────────────────────────────────────────────────────────
  models: BenchModel[]
  configLoading: boolean
  configError: string | null

  // ── Selected tasks ──────────────────────────────────────────────────────────
  selectedTasks: Set<string>

  // ── Results ─────────────────────────────────────────────────────────────────
  results: EvaluateResultMap | null
  resultType: 'new' | 'history'

  // ── Actions: Models ─────────────────────────────────────────────────────────
  loadConfig: () => Promise<void>
  toggleEnabled: (id: string) => void
  addCustomModel: (fields: {
    display_name: string
    name: string
    api_base: string
    model_type: ModelTab
    max_token: number
    resize?: [number, number]
  }) => void
  removeCustomModel: (id: string) => void
  updateCustomModel: (id: string, fields: {
    display_name: string
    name: string
    api_base: string
    max_token: number
    resize?: [number, number]
  }) => void
  verifyConnection: (id: string) => Promise<void>
  setConnectionStatus: (id: string, status: ConnectionStatus) => void

  // ── Actions: Tasks ──────────────────────────────────────────────────────────
  toggleTask: (name: string) => void
  selectAllTasks: (names: string[]) => void
  deselectAllTasks: (names: string[]) => void
  clearTasks: () => void

  // ── Actions: Results ────────────────────────────────────────────────────────
  setResults: (results: EvaluateResultMap, type: 'new' | 'history') => void
  clearResults: () => void

  // ── Derived ─────────────────────────────────────────────────────────────────
  getEnabledModels: () => BenchModel[]
  getUnverifiedModels: () => BenchModel[]
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

export const useBenchmarkStore = create<BenchmarkState>((set, get) => ({
  // ── Initial state ───────────────────────────────────────────────────────────
  models: loadCustomFromStorage(),
  configLoading: false,
  configError: null,
  selectedTasks: new Set(),
  results: null,
  resultType: 'new',

  // ── Actions: Models ─────────────────────────────────────────────────────────
  loadConfig: async () => {
    set({ configLoading: true, configError: null })
    try {
      const cfg: ConfigResponse = await fetchConfig()
      const existingCustom = get().models.filter(m => m.kind === 'custom')
      const builtins: BenchModel[] = cfg.builtins.map(b => ({
        ...b,
        color: BUILTIN_COLORS[b.id] ?? '#3b82f6',
        enabled: true,
        validate_status: 'ok' as ValidateStatus,
        connectionStatus: 'verified' as ConnectionStatus,
        isDirty: false,
      }))
      set({ models: [...builtins, ...existingCustom], configLoading: false })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      set({ configError: msg, configLoading: false })
    }
  },

  toggleEnabled: (id) => {
    set(state => {
      const models = state.models.map(m =>
        m.id === id ? { ...m, enabled: !m.enabled } : m,
      )
      const customModels = models.filter(m => m.kind === 'custom')
      saveCustomToStorage(customModels)
      return { models }
    })
  },

  addCustomModel: (fields) => {
    const state = get()
    const customCount = state.models.filter(m => m.kind === 'custom').length
    const id = slugId(fields.display_name, customCount)
    const colorIndex = state.models.filter(m => m.kind === 'custom' && m.model_type === fields.model_type).length
    const model: BenchModel = {
      id,
      kind: 'custom',
      model_type: fields.model_type,
      display_name: fields.display_name,
      name: fields.name,
      api_base: fields.api_base,
      max_token: fields.max_token,
      resize: fields.resize,
      color: EXTRA_COLORS[colorIndex % EXTRA_COLORS.length] ?? EXTRA_COLORS[0],
      enabled: true,
      validate_status: 'pending',
      connectionStatus: 'unverified',
      isDirty: false,
    }

    set(state => {
      const models = [...state.models, model]
      saveCustomToStorage(models.filter(m => m.kind === 'custom'))
      return { models }
    })

    // Kick off validation
    void get().verifyConnection(id)
  },

  removeCustomModel: (id) => {
    set(state => {
      const models = state.models.filter(m => m.id !== id)
      saveCustomToStorage(models.filter(m => m.kind === 'custom'))
      return { models }
    })
  },

  updateCustomModel: (id, fields) => {
    set(state => {
      const models = state.models.map(m =>
        m.id === id
          ? {
              ...m,
              display_name: fields.display_name,
              name: fields.name,
              api_base: fields.api_base,
              max_token: fields.max_token,
              resize: fields.resize,
              isDirty: true,
              connectionStatus: 'unverified' as ConnectionStatus,
              validate_status: 'pending' as ValidateStatus,
              validate_error: undefined,
            }
          : m,
      )
      saveCustomToStorage(models.filter(m => m.kind === 'custom'))
      return { models }
    })

    // Auto-verify after update
    void get().verifyConnection(id)
  },

  verifyConnection: async (id) => {
    const model = get().models.find(m => m.id === id)
    if (!model?.api_base) return

    set(state => ({
      models: state.models.map(m =>
        m.id === id
          ? { ...m, connectionStatus: 'verifying' as ConnectionStatus, validate_status: 'pending' as ValidateStatus }
          : m,
      ),
    }))

    try {
      const baseUrl = model.api_base.replace(/\/v1\/?$/, '')
      const res = await validateModel(baseUrl)
      set(state => ({
        models: state.models.map(m =>
          m.id === id
            ? {
                ...m,
                connectionStatus: (res.ok ? 'verified' : 'failed') as ConnectionStatus,
                validate_status: (res.ok ? 'ok' : 'failed') as ValidateStatus,
                validate_error: res.ok ? undefined : (res.error ?? 'unreachable'),
                validate_path: res.reachable_via ?? undefined,
                isDirty: false,
              }
            : m,
        ),
      }))
    } catch {
      set(state => ({
        models: state.models.map(m =>
          m.id === id
            ? {
                ...m,
                connectionStatus: 'failed' as ConnectionStatus,
                validate_status: 'failed' as ValidateStatus,
                validate_error: 'network error',
                isDirty: false,
              }
            : m,
        ),
      }))
    }

    // Persist after verification
    const updated = get().models.filter(m => m.kind === 'custom')
    saveCustomToStorage(updated)
  },

  setConnectionStatus: (id, status) => {
    set(state => ({
      models: state.models.map(m =>
        m.id === id ? { ...m, connectionStatus: status } : m,
      ),
    }))
  },

  // ── Actions: Tasks ──────────────────────────────────────────────────────────
  toggleTask: (name) => {
    set(state => {
      const next = new Set(state.selectedTasks)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return { selectedTasks: next }
    })
  },

  selectAllTasks: (names) => {
    set(state => {
      const next = new Set(state.selectedTasks)
      names.forEach(n => next.add(n))
      return { selectedTasks: next }
    })
  },

  deselectAllTasks: (names) => {
    set(state => {
      const next = new Set(state.selectedTasks)
      names.forEach(n => next.delete(n))
      return { selectedTasks: next }
    })
  },

  clearTasks: () => set({ selectedTasks: new Set() }),

  // ── Actions: Results ────────────────────────────────────────────────────────
  setResults: (results, type) => set({ results, resultType: type }),
  clearResults: () => set({ results: null }),

  // ── Derived ─────────────────────────────────────────────────────────────────
  getEnabledModels: () => get().models.filter(m => m.enabled),
  getUnverifiedModels: () =>
    get().models.filter(m => m.enabled && m.connectionStatus !== 'verified'),
}))

// ---------------------------------------------------------------------------
// Convenience selectors
// ---------------------------------------------------------------------------

export const selectModels = (state: BenchmarkState) => state.models
export const selectSelectedTasks = (state: BenchmarkState) => state.selectedTasks
export const selectResults = (state: BenchmarkState) => state.results
export const selectResultType = (state: BenchmarkState) => state.resultType

// For backward compat: convert BenchModel to LocalModel shape
export function toLocalModel(m: BenchModel): LocalModel {
  return {
    id: m.id,
    kind: m.kind,
    model_type: m.model_type,
    display_name: m.display_name,
    name: m.name,
    api_base: m.api_base,
    max_token: m.max_token,
    resize: m.resize,
    color: m.color,
    enabled: m.enabled,
    validate_status: m.validate_status,
    validate_error: m.validate_error,
    validate_path: m.validate_path,
  }
}
