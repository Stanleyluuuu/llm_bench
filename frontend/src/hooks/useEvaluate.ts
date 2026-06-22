import { useState, useCallback, useRef } from 'react'
import { runEvaluate, pollEvaluateStatus, fetchEvaluateResult, fetchHistory, fetchHistoryDetail } from '@/api/client'
import type { EvaluateResultMap, MetricOverrides, ModelIn, ModelOutcome } from '@/types/benchmark'
import type { JobProgress, JobStage } from '@/types/judge'

const POLL_INTERVAL_MS = 5_000

// ---------------------------------------------------------------------------
// Pure module-level helpers (extracted to reduce cyclomatic complexity)
// ---------------------------------------------------------------------------

async function fetchHistoryEntry(
  project: string,
): Promise<readonly [string, Record<string, unknown> | null]> {
  try {
    const histData = await fetchHistory(project)
    if (!histData.history?.length) return [project, null] as const
    const latestFile = histData.history[0]!.filename
    const detail = await fetchHistoryDetail(project, latestFile)
    return [project, detail.models] as const
  } catch {
    return [project, null] as const
  }
}

function mergeHistoryEntries(
  entries: ReadonlyArray<readonly [string, Record<string, unknown> | null]>,
): EvaluateResultMap {
  const merged: EvaluateResultMap = {}
  for (const [project, modelsMap] of entries) {
    if (!modelsMap || !project) continue
    for (const [mid, rawOutcome] of Object.entries(modelsMap)) {
      const outcome = rawOutcome as unknown as { spec?: ModelOutcome['spec']; status: string; [k: string]: unknown }
      if (!merged[mid]) {
        const spec: ModelOutcome['spec'] = outcome.spec ?? {
          id: mid, kind: 'builtin' as const, model_type: 'LLM' as const,
          display_name: mid, name: mid, api_base: '', max_token: 0,
        }
        merged[mid] = { spec, projects: {} }
      }
      const { spec: _s, ...runFields } = outcome
      merged[mid]!.projects[project] = runFields as EvaluateResultMap[string]['projects'][string]
    }
  }
  return merged
}

export function useEvaluate() {
  const [results, setResults] = useState<EvaluateResultMap | null>(null)
  const [resultType, setResultType] = useState<'new' | 'history'>('new')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stage, setStage] = useState<JobStage>(null)
  const [progress, setProgress] = useState<JobProgress | null>(null)

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const _stopPolling = () => {
    if (pollTimerRef.current !== null) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }

  const evaluate = useCallback(async (projects: string[], models: ModelIn[], metricOverrides?: MetricOverrides) => {
    _stopPolling()
    setLoading(true)
    setError(null)
    setStage(null)
    setProgress(null)

    try {
      const { job_id } = await runEvaluate(projects, models, metricOverrides)

      const poll = async (): Promise<void> => {
        try {
          const jobInfo = await pollEvaluateStatus(job_id)

          if (jobInfo.stage !== undefined) setStage(jobInfo.stage ?? null)
          if (jobInfo.progress !== undefined) setProgress(jobInfo.progress ?? null)

          if (jobInfo.status === 'done') {
            const data = await fetchEvaluateResult(job_id)
            setResults(data.results)
            setResultType('new')
            setStage(null)
            setProgress(null)
            setLoading(false)
            return
          }

          if (jobInfo.status === 'error') {
            setError(jobInfo.error ?? 'Evaluation failed')
            setStage(null)
            setProgress(null)
            setLoading(false)
            return
          }

          pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          setError(msg)
          setStage(null)
          setProgress(null)
          setLoading(false)
        }
      }

      pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setStage(null)
      setProgress(null)
      setLoading(false)
    }
  }, [])

  const viewHistory = useCallback(async (projects: string[]) => {
    _stopPolling()
    setLoading(true)
    setError(null)
    try {
      const entries = await Promise.all(projects.map(fetchHistoryEntry))
      const merged = mergeHistoryEntries(entries)
      setResults(Object.keys(merged).length > 0 ? merged : null)
      setResultType('history')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, resultType, loading, error, stage, progress, evaluate, viewHistory }
}
