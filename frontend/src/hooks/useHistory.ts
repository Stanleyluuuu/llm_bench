import { useCallback, useEffect, useRef, useState } from 'react'
import { deleteRun as apiDeleteRun, fetchRunDetail, fetchRunsManifest } from '@/api/client'
import type { ManifestResponse, RunFile, RunMetadata } from '@/types/history'

interface UseHistoryState {
  manifest: ManifestResponse | null
  runs: RunMetadata[]
  manifestLoading: boolean
  manifestError: string | null
  selectedRunId: string | null
  selectedRun: RunFile | null
  runLoading: boolean
  runError: string | null
}

export function useHistory(project: string | null) {
  const [state, setState] = useState<UseHistoryState>({
    manifest: null,
    runs: [],
    manifestLoading: false,
    manifestError: null,
    selectedRunId: null,
    selectedRun: null,
    runLoading: false,
    runError: null,
  })

  const detailCacheRef = useRef<Map<string, RunFile>>(new Map())

  // Load manifest whenever the project changes.
  useEffect(() => {
    if (!project) {
      setState({
        manifest: null,
        runs: [],
        manifestLoading: false,
        manifestError: null,
        selectedRunId: null,
        selectedRun: null,
        runLoading: false,
        runError: null,
      })
      return
    }

    let cancelled = false
    detailCacheRef.current = new Map()
    setState(s => ({ ...s, manifestLoading: true, manifestError: null, selectedRun: null, selectedRunId: null }))

    fetchRunsManifest(project)
      .then((data) => {
        if (cancelled) return
        const sorted = [...data.runs].sort((a, b) => a.run_id.localeCompare(b.run_id))
        const latest = sorted.length > 0 ? sorted[sorted.length - 1]!.run_id : null
        setState(s => ({
          ...s,
          manifest: data,
          runs: sorted,
          manifestLoading: false,
          selectedRunId: latest,
        }))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : String(err)
        setState(s => ({ ...s, manifestLoading: false, manifestError: msg }))
      })

    return () => {
      cancelled = true
    }
  }, [project])

  // Load detail when selectedRunId changes.
  useEffect(() => {
    const { selectedRunId } = state
    if (!project || !selectedRunId) {
      setState(s => ({ ...s, selectedRun: null }))
      return
    }
    const cached = detailCacheRef.current.get(selectedRunId)
    if (cached) {
      setState(s => ({ ...s, selectedRun: cached, runError: null, runLoading: false }))
      return
    }

    let cancelled = false
    setState(s => ({ ...s, runLoading: true, runError: null }))
    fetchRunDetail(project, selectedRunId)
      .then((data) => {
        if (cancelled) return
        detailCacheRef.current.set(selectedRunId, data)
        setState(s => ({ ...s, selectedRun: data, runLoading: false }))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : String(err)
        setState(s => ({ ...s, runLoading: false, runError: msg }))
      })

    return () => {
      cancelled = true
    }
    // selectedRun is intentionally not in deps — we only react to selectedRunId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, state.selectedRunId])

  const selectRun = useCallback((runId: string | null) => {
    setState(s => ({ ...s, selectedRunId: runId }))
  }, [])

  /** Delete a run: calls the backend, then removes the entry from local state. */
  const deleteRun = useCallback(async (runId: string) => {
    if (!project) return
    await apiDeleteRun(project, runId)
    detailCacheRef.current.delete(runId)
    setState(s => {
      const nextRuns = s.runs.filter(r => r.run_id !== runId)
      // If we just deleted the selected run, select the latest remaining one.
      const nextSelectedId =
        s.selectedRunId === runId
          ? (nextRuns.length > 0 ? nextRuns[nextRuns.length - 1]!.run_id : null)
          : s.selectedRunId
      return {
        ...s,
        runs: nextRuns,
        selectedRunId: nextSelectedId,
        selectedRun: s.selectedRunId === runId ? null : s.selectedRun,
      }
    })
  }, [project])

  /** Batch delete multiple runs in parallel, then reconcile local state once. */
  const batchDeleteRuns = useCallback(async (runIds: string[]) => {
    if (!project || runIds.length === 0) return
    await Promise.all(runIds.map(id => apiDeleteRun(project, id)))
    runIds.forEach(id => detailCacheRef.current.delete(id))
    setState(s => {
      const idSet = new Set(runIds)
      const nextRuns = s.runs.filter(r => !idSet.has(r.run_id))
      const nextSelectedId = idSet.has(s.selectedRunId ?? '')
        ? (nextRuns.length > 0 ? nextRuns[nextRuns.length - 1]!.run_id : null)
        : s.selectedRunId
      return {
        ...s,
        runs: nextRuns,
        selectedRunId: nextSelectedId,
        selectedRun: idSet.has(s.selectedRunId ?? '') ? null : s.selectedRun,
      }
    })
  }, [project])

  return {
    ...state,
    selectRun,
    deleteRun,
    batchDeleteRuns,
  }
}
