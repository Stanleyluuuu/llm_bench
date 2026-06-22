import type { ConfigResponse, EvaluateResultMap, MetricOverrides, ModelIn, ProjectPrompts, ValidateResponse } from '@/types/benchmark'
import type { ManifestResponse, RunFile } from '@/types/history'
import type { JobInfo } from '@/types/judge'

// API base: configurable via VITE_API_BASE for non-same-origin deployments.
// Defaults to '' (relative path) so Vite proxy + same-origin prod both work.
const BASE: string =
  (import.meta.env?.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? ''

function friendlyHttpMessage(status: number, path: string): string {
  if (status === 401) return `未授權 (401) — 請確認登入狀態：${path}`
  if (status === 403) return `沒有權限存取 (403)：${path}`
  if (status === 404) return `資源不存在 (404)：${path}`
  if (status === 408 || status === 504) return `伺服器逾時 (${status})：${path}`
  if (status === 429) return `請求過於頻繁 (429)，請稍候再試：${path}`
  if (status >= 500) return `伺服器錯誤 (${status})：${path}`
  return `HTTP ${status}: ${path}`
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, init)
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    throw new Error(`網路無法連線：${reason}`)
  }
  if (!res.ok) throw new Error(friendlyHttpMessage(res.status, path))
  return res.json() as Promise<T>
}

export async function fetchConfig(): Promise<ConfigResponse> {
  return apiFetch<ConfigResponse>('/api/config')
}

export async function fetchProjects(): Promise<{ projects: Array<string | { name: string; type: 'LLM' | 'VLM'; project?: string; capability?: string; description?: string; estimated_minutes?: number }> }> {
  return apiFetch('/api/projects')
}

/**
 * POST /api/models/validate — best-effort connectivity check.
 * Tries GET {base_url}/ping then /health. Always resolves (never throws for
 * reachability failures; only throws on fetch-level errors).
 */
export async function validateModel(baseUrl: string): Promise<ValidateResponse> {
  return apiFetch<ValidateResponse>('/api/models/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base_url: baseUrl }),
  })
}

/**
 * POST /api/evaluate — returns a job_id immediately (202 Accepted).
 * Use `pollEvaluateStatus` + `fetchEvaluateResult` to retrieve the outcome.
 */
export async function runEvaluate(
  projects: string[],
  models: ModelIn[],
  metricOverrides?: MetricOverrides,
): Promise<{ job_id: string }> {
  return apiFetch('/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projects, models, metric_overrides: metricOverrides ?? null }),
  })
}

/** GET /api/evaluate/status/{job_id} */
export async function pollEvaluateStatus(jobId: string): Promise<JobInfo> {
  return apiFetch<JobInfo>(`/api/evaluate/status/${encodeURIComponent(jobId)}`)
}

/** GET /api/evaluate/result/{job_id} — call only when status === 'done' */
export async function fetchEvaluateResult(jobId: string): Promise<{ success: boolean; schema_version: number; results: EvaluateResultMap }> {
  return apiFetch(`/api/evaluate/result/${encodeURIComponent(jobId)}`)
}

export async function fetchHistory(
  project: string,
): Promise<{ history: { filename: string }[] }> {
  return apiFetch(`/api/history/${encodeURIComponent(project)}`)
}

/** Returns model-major history detail. Legacy files produce a 410 which is caught as an error. */
export async function fetchHistoryDetail(
  project: string,
  filename: string,
): Promise<{ success: boolean; schema_version: number; timestamp?: string; models: EvaluateResultMap }> {
  return apiFetch(
    `/api/history/${encodeURIComponent(project)}/${encodeURIComponent(filename)}`,
  )
}

/** GET /api/projects/{name}/prompts — returns system + user prompt config for a project. */
export async function fetchProjectPrompts(projectName: string): Promise<ProjectPrompts> {
  return apiFetch<ProjectPrompts>(`/api/projects/${encodeURIComponent(projectName)}/prompts`)
}

// ─── Run-based history (new layer) ──────────────────────────────────────────

/** GET /api/projects/{project}/runs — returns the manifest (lightweight run index). */
export async function fetchRunsManifest(project: string): Promise<ManifestResponse> {
  return apiFetch<ManifestResponse>(`/api/projects/${encodeURIComponent(project)}/runs`)
}

/** GET /api/projects/{project}/runs/{run_id} — returns a single run's full snapshot. */
export async function fetchRunDetail(project: string, runId: string): Promise<RunFile> {
  return apiFetch<RunFile>(
    `/api/projects/${encodeURIComponent(project)}/runs/${encodeURIComponent(runId)}`,
  )
}

/** DELETE /api/projects/{project}/runs/{run_id} — removes the run JSON and manifest entry. */
export async function deleteRun(project: string, runId: string): Promise<{ deleted: string }> {
  return apiFetch<{ deleted: string }>(
    `/api/projects/${encodeURIComponent(project)}/runs/${encodeURIComponent(runId)}`,
    { method: 'DELETE' },
  )
}
