/** Status of an async evaluate job returned by POST /api/evaluate */
export type JobStatus = 'pending' | 'running' | 'done' | 'error'
export type JobStage = 'preflight' | 'inference' | 'scoring' | 'project_done' | null

export interface JobProgress {
  completed: number
  total: number
}

export interface JobInfo {
  job_id: string
  status: JobStatus
  created_at?: string
  error?: string
  stage?: JobStage
  progress?: JobProgress | null
}
