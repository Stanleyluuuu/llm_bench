/**
 * Unified model state hook.
 *
 * - 4 builtins come from GET /api/config on startup; they are enabled by default.
 * - Custom models are added by the user, stored in localStorage (7-day TTL).
 * - All models (builtin + custom) are represented as `LocalModel` with
 *   `enabled: boolean` so the user can toggle any of them.
 * - Validate-on-add: when a custom model is saved, call POST /api/models/validate.
 *   The save is allowed immediately but the validate_status is reflected in the UI.
 */

import { useState, useCallback, useEffect } from 'react'
import { fetchConfig, validateModel } from '@/api/client'
import type { ConfigResponse, ModelIn, ModelTab } from '@/types/benchmark'
import type { LocalModel, ValidateStatus } from '@/types/ui'

const STORAGE_KEY = 'customModels_v2'
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
]

function slugId(displayName: string, index: number): string {
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32) || `model-${index}`
  return `custom:${slug}`
}

function loadCustomFromStorage(): LocalModel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as { models: LocalModel[]; timestamp: number }
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

function saveCustomToStorage(models: LocalModel[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ models, timestamp: Date.now() }))
  } catch {
    /* private browsing / quota exceeded — ignore */
  }
}

export function useModels() {
  const [builtins, setBuiltins] = useState<LocalModel[]>([])
  const [custom, setCustom] = useState<LocalModel[]>(loadCustomFromStorage)
  const [configError, setConfigError] = useState<string | null>(null)

  // Load builtins from /api/config on mount.
  useEffect(() => {
    fetchConfig()
      .then((cfg: ConfigResponse) => {
        setBuiltins(
          cfg.builtins.map((b) => ({
            ...b,
            color: BUILTIN_COLORS[b.id] ?? '#3b82f6',
            enabled: true,
            validate_status: 'ok' as ValidateStatus,
          })),
        )
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setConfigError(msg)
      })
  }, [])

  const allModels = [...builtins, ...custom]

  /** Toggle enabled state for any model (builtin or custom). */
  const toggleEnabled = useCallback((id: string) => {
    setBuiltins((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)),
    )
    setCustom((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
      saveCustomToStorage(next)
      return next
    })
  }, [])

  /**
   * Add and save a custom model. Immediately added as enabled.
   * Triggers validate-on-add asynchronously.
   */
  const addCustomModel = useCallback(
    (fields: {
      display_name: string
      name: string
      api_base: string
      model_type: ModelTab
      max_token: number
      resize?: [number, number]
    }) => {
      const index = custom.length
      const id = slugId(fields.display_name, index)
      const colorIndex = custom.filter((m) => m.model_type === fields.model_type).length
      const model: LocalModel = {
        id,
        kind: 'custom',
        model_type: fields.model_type,
        display_name: fields.display_name,
        name: fields.name,
        api_base: fields.api_base,
        max_token: fields.max_token,
        resize: fields.resize,
        color: EXTRA_COLORS[colorIndex % EXTRA_COLORS.length] ?? EXTRA_COLORS[0]!,
        enabled: true,
        validate_status: 'pending',
      }
      setCustom((prev) => {
        const next = [...prev, model]
        saveCustomToStorage(next)
        return next
      })

      // Kick off validation — update status when it resolves.
      const baseUrl = fields.api_base.replace(/\/v1\/?$/, '')
      validateModel(baseUrl)
        .then((res) => {
          setCustom((prev) => {
            const next = prev.map((m) =>
              m.id === id
                ? {
                    ...m,
                    validate_status: res.ok ? ('ok' as ValidateStatus) : ('failed' as ValidateStatus),
                    validate_error: res.ok ? undefined : (res.error ?? 'unreachable'),
                    validate_path: res.reachable_via ?? undefined,
                  }
                : m,
            )
            saveCustomToStorage(next)
            return next
          })
        })
        .catch(() => {
          setCustom((prev) => {
            const next = prev.map((m) =>
              m.id === id
                ? { ...m, validate_status: 'failed' as ValidateStatus, validate_error: 'network error' }
                : m,
            )
            saveCustomToStorage(next)
            return next
          })
        })
    },
    [custom],
  )

  /** Remove a custom model by id. */
  const removeCustomModel = useCallback((id: string) => {
    setCustom((prev) => {
      const next = prev.filter((m) => m.id !== id)
      saveCustomToStorage(next)
      return next
    })
  }, [])

  /** Update a custom model's fields in-place; re-validates api_base. */
  const updateCustomModel = useCallback(
    (
      id: string,
      fields: {
        display_name: string
        name: string
        api_base: string
        max_token: number
        resize?: [number, number]
      },
    ) => {
      setCustom((prev) => {
        const next = prev.map((m) =>
          m.id === id
            ? {
                ...m,
                display_name: fields.display_name,
                name: fields.name,
                api_base: fields.api_base,
                max_token: fields.max_token,
                resize: fields.resize,
                validate_status: 'pending' as ValidateStatus,
                validate_error: undefined,
              }
            : m,
        )
        saveCustomToStorage(next)
        return next
      })

      const baseUrl = fields.api_base.replace(/\/v1\/?$/, '')
      validateModel(baseUrl)
        .then((res) => {
          setCustom((prev) => {
            const next = prev.map((m) =>
              m.id === id
                ? {
                    ...m,
                    validate_status: res.ok ? ('ok' as ValidateStatus) : ('failed' as ValidateStatus),
                    validate_error: res.ok ? undefined : (res.error ?? 'unreachable'),
                    validate_path: res.reachable_via ?? undefined,
                  }
                : m,
            )
            saveCustomToStorage(next)
            return next
          })
        })
        .catch(() => {
          setCustom((prev) => {
            const next = prev.map((m) =>
              m.id === id
                ? { ...m, validate_status: 'failed' as ValidateStatus, validate_error: 'network error' }
                : m,
            )
            saveCustomToStorage(next)
            return next
          })
        })
    },
    [],
  )

  /** Return enabled models as ModelIn[] (for the evaluate payload). */
  const getEnabledModels = useCallback((): ModelIn[] => {
    return allModels
      .filter((m) => m.enabled)
      .map(({ color: _c, enabled: _e, validate_status: _v, validate_error: _ve, validate_path: _vp, ...rest }) => rest)
  }, [allModels])

  return {
    allModels,
    builtins,
    custom,
    configError,
    toggleEnabled,
    addCustomModel,
    updateCustomModel,
    removeCustomModel,
    getEnabledModels,
  }
}
