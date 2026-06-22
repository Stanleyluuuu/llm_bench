// Run-based history types — mirror llm_benchmark/history/schema.py

export type HistoryTaskType = 'text_gen' | 'vlm_detection'
export type CaseInputType = 'text' | 'multimodal'
export type VerdictOutcome = 'single_winner' | 'tie' | 'all_pass'

export interface CaseInput {
  type: CaseInputType
  prompt: string
  images: string[]
}

export interface ModelOutput {
  answer: string
  score: number | null
  latency_ms: number | null
}

export interface Verdict {
  outcome: VerdictOutcome
  winner_model_ids: string[]
  rationale: string
}

export interface CaseResult {
  case_id: string
  input: CaseInput
  ground_truth: string
  model_outputs: Record<string, ModelOutput>
  verdict: Verdict
}

export interface ModelSummary {
  w: number
  t: number
  l: number
  avg_score: number | null
  pass_rate: number | null
  mean_iou: number | null
  threshold: number | null
}

export interface RunMetadata {
  run_id: string
  timestamp: string
  task_type: HistoryTaskType
  models: string[]
  judge: string
  summary: Record<string, ModelSummary>
  file: string
}

export interface ManifestResponse {
  task: string
  schema_version: number
  runs: RunMetadata[]
}

export interface RunFile {
  run_id: string
  timestamp: string
  task: string
  task_type: HistoryTaskType
  schema_version: number
  models: string[]
  judge: string
  cases: CaseResult[]
  summary: Record<string, ModelSummary>
}

/** Metric keys exposed in the trend chart. */
export type TrendMetric = 'avg_score' | 'pass_rate' | 'mean_iou'
