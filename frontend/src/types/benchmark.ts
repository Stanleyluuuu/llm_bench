export type ModelTab = 'LLM' | 'VLM'
export type ModelKind = 'builtin' | 'custom'

export interface MetricOverrides {
  use_ragas: boolean
}

export interface ProjectItem {
  name: string
  type: ModelTab
  project?: string
  capability?: string
  description?: string
  estimatedMinutes?: number
}

/** One entry in POST /api/evaluate body — builtin or custom model. */
export interface ModelIn {
  id: string
  kind: ModelKind
  model_type: ModelTab
  display_name: string
  name: string
  api_base: string
  max_token: number
  resize?: [number, number]
  model_space?: string
}

/** Response from POST /api/models/validate */
export interface ValidateResponse {
  ok: boolean
  reachable_via: 'ping' | 'health' | null
  error: string | null
}

/** GET /api/config response shape (v2). */
export interface ConfigResponse {
  schema_version: number
  builtins: ModelIn[]
}

/** Per-(project, model) result from the backend. */
export interface ProjectRun {
  status: 'ok' | 'error' | 'skipped' | 'running'
  scores?: Record<string, number | number[]>
  performance?: { avg_response_time?: number }
  performance_display?: string
  results?: {
    question: string[]
    ground_truth: string[]
    answer: string[]
    resize_size?: [number, number]
    resized_answer?: string[]
    model_space?: string
    coord_label?: string
    image_path?: (string | null)[]
    per_sample_iou_detail?: Array<Record<string, {
      iou: number
      gt_bbox: number[]
      pred_bbox: number[]
      matched: boolean
    } | { _parse_error: string }>>
    llm_judgement?: Array<{
      winner: string | null
      reason: string | null
      scores?: { accuracy: number; completeness: number; relevance_clarity: number }
      average_score?: number
    }>
    /** Prompts actually used at evaluation time (openai source only). */
    system_prompt?: string
    user_prompt_template?: string
    filled_user_prompts?: string[]
    messages?: Array<Array<{ role: string; content: string | unknown[] }>>
  }
  error?: string
  reason?: string
}

/** Model-major result envelope from GET /api/evaluate/result/{job_id}. */
export interface ModelOutcome {
  spec: ModelIn
  projects: Record<string, ProjectRun>
}

/** Full model-major result map: {model_id: ModelOutcome}. */
export type EvaluateResultMap = Record<string, ModelOutcome>

/** GET /api/projects/{name}/prompts response shape. */
export interface ProjectPrompts {
  system_prompt: string | null
  user_prompt_template: string | null
  source: string
}
