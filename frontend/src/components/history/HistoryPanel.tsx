import { useEffect, useMemo, useState } from 'react'
import { Download, History as HistoryIcon, RefreshCw, PanelLeftClose, PanelLeft } from 'lucide-react'
import { useHistory } from '@/hooks/useHistory'
import type { ModelSummary, RunMetadata, TrendMetric } from '@/types/history'
import { TrendChart, DASH_PATTERNS } from './TrendChart'
import { ModelChips } from './ModelChips'
import { RunSelector } from './RunSelector'
import { CaseInspector } from './CaseInspector'
import { HistoryRunCard } from './HistoryRunCard'
import { ModelLeaderboard } from './ModelLeaderboard'
import { DeleteConfirmModal } from './DeleteConfirmModal'

interface HistoryPanelProps {
  projects: string[]
  initialProject?: string | null
}

const PALETTE = [
  '#3b82f6', '#0284c7', '#10b981', '#f59e0b',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
  '#0d9488', '#e11d48',
] as const

function buildModelColorMap(allModels: string[]): Map<string, string> {
  const map = new Map<string, string>()
  allModels.forEach((m, i) => map.set(m, PALETTE[i % PALETTE.length]!))
  return map
}

function buildModelDashMap(allModels: string[]): Map<string, string> {
  const map = new Map<string, string>()
  allModels.forEach((m, i) => map.set(m, DASH_PATTERNS[i % DASH_PATTERNS.length] ?? ''))
  return map
}

function unionModelsFromRuns(runs: RunMetadata[]): string[] {
  const seen: string[] = []
  for (const r of runs) for (const m of r.models) if (!seen.includes(m)) seen.push(m)
  return seen
}

function previousMetadata(runs: RunMetadata[], currentRunId: string | null): RunMetadata | undefined {
  if (!currentRunId) return undefined
  const idx = runs.findIndex(r => r.run_id === currentRunId)
  if (idx <= 0) return undefined
  return runs[idx - 1]
}

function chooseInitialMetric(taskType: 'text_gen' | 'vlm_detection' | undefined): TrendMetric {
  return taskType === 'vlm_detection' ? 'pass_rate' : 'avg_score'
}

function computeRunAvgScore(run: RunMetadata, metric: TrendMetric): number {
  const values = run.models
    .map(m => run.summary[m]?.[metric])
    .filter((v): v is number => typeof v === 'number')
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function getLeaderboardScore(summary: ModelSummary, metric: TrendMetric): number {
  const v = summary[metric]
  if (typeof v !== 'number') return 0
  // Normalize avg_score (0-5) to 0-1 range for the leaderboard bar
  if (metric === 'avg_score') return v / 5
  return v
}

function buildRunExport(run: import('@/types/history').RunFile): string {
  return JSON.stringify(run, null, 2)
}

function buildManifestCsv(runs: RunMetadata[], metric: TrendMetric): string {
  const models = unionModelsFromRuns(runs)
  const header = ['run_id', 'timestamp', ...models].map(s => `"${s}"`).join(',')
  const rows = runs.map(r => {
    const cells = models.map(m => {
      if (!r.models.includes(m)) return ''
      const v = r.summary[m]?.[metric]
      return typeof v === 'number' ? v.toFixed(4) : ''
    })
    return [`"${r.run_id}"`, `"${r.timestamp}"`, ...cells].join(',')
  })
  return [header, ...rows].join('\n')
}

function downloadBlob(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function HistoryPanel({ projects, initialProject }: HistoryPanelProps) {
  const [project, setProject] = useState<string | null>(initialProject ?? projects[0] ?? null)
  useEffect(() => {
    if (!project && projects.length > 0) setProject(projects[0]!)
  }, [projects, project])

  const { runs, manifestLoading, manifestError, selectedRunId, selectedRun, runLoading, runError, selectRun, deleteRun, batchDeleteRuns } = useHistory(project)

  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false)
  const [batchDeleting, setBatchDeleting] = useState(false)

  const allModels = useMemo(() => unionModelsFromRuns(runs), [runs])
  const colors = useMemo(() => buildModelColorMap(allModels), [allModels])
  const dashes = useMemo(() => buildModelDashMap(allModels), [allModels])

  const [visible, setVisible] = useState<Set<string>>(new Set())
  useEffect(() => {
    // Default: show every model that has ever participated.
    setVisible(new Set(allModels))
  }, [allModels])

  // Metric depends on task type; flip when latest run is VLM.
  const taskType = runs[runs.length - 1]?.task_type
  const [metric, setMetric] = useState<TrendMetric>(chooseInitialMetric(taskType))
  useEffect(() => {
    setMetric(chooseInitialMetric(taskType))
  }, [taskType])

  function toggleModel(mid: string) {
    setVisible((prev) => {
      const next = new Set(prev)
      if (next.has(mid)) next.delete(mid)
      else next.add(mid)
      return next
    })
  }

  const [baselineModel, setBaselineModel] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const currentMeta = runs.find(r => r.run_id === selectedRunId) ?? null
  const prevMeta = previousMetadata(runs, selectedRunId)

  const addedModels = currentMeta && prevMeta ? currentMeta.models.filter(m => !prevMeta.models.includes(m)) : []
  const removedModels = currentMeta && prevMeta ? prevMeta.models.filter(m => !currentMeta.models.includes(m)) : []

  return (
    <section className="animate-fade-in bg-platform-bg rounded-md p-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-platform-fg">
          <HistoryIcon className="w-4 h-4 text-brand-primary" />
          歷史趨勢
        </h2>
        <label className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span>專案</span>
          <select
            value={project ?? ''}
            onChange={(e) => setProject(e.target.value || null)}
            className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground"
          >
            {projects.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <RunSelector runs={runs} selectedRunId={selectedRunId} onSelect={selectRun} />
        {taskType === 'vlm_detection' && (
          <div className="inline-flex rounded border border-border overflow-hidden text-xs font-mono">
            {(['pass_rate', 'mean_iou'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={`px-2.5 py-1 transition-colors ${
                  metric === m ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {m === 'pass_rate' ? 'Pass Rate' : 'Mean IoU'}
              </button>
            ))}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(p => !p)}
            className="export-btn"
            title={sidebarOpen ? '收合側邊欄' : '展開側邊欄'}
          >
            {sidebarOpen ? <PanelLeftClose className="w-3 h-3" /> : <PanelLeft className="w-3 h-3" />}
          </button>
          <button
            type="button"
            disabled={!selectedRun}
            onClick={() => selectedRun && downloadBlob(`${project ?? 'run'}_${selectedRun.run_id}.json`, 'application/json', buildRunExport(selectedRun))}
            className="export-btn disabled:opacity-40 disabled:cursor-not-allowed"
            title="匯出選定 run 為 JSON"
          >
            <Download className="w-3 h-3" /> Run JSON
          </button>
          <button
            type="button"
            disabled={runs.length === 0}
            onClick={() => downloadBlob(`${project ?? 'history'}_trend_${metric}.csv`, 'text/csv;charset=utf-8;', buildManifestCsv(runs, metric))}
            className="export-btn disabled:opacity-40 disabled:cursor-not-allowed"
            title="匯出整段歷史趨勢為 CSV"
          >
            <Download className="w-3 h-3" /> 趨勢 CSV
          </button>
        </div>
      </div>

      {manifestLoading && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <RefreshCw className="w-3 h-3 animate-spin" /> 載入歷史索引…
        </div>
      )}
      {manifestError && (
        <div className="text-xs text-red-500">載入失敗:{manifestError}</div>
      )}
      {!manifestLoading && !manifestError && runs.length === 0 && (
        <div className="border border-dashed border-platform-border/40 rounded-md p-8 text-center space-y-2 bg-platform-secondary/30 backdrop-blur-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-platform-card flex items-center justify-center">
            <HistoryIcon className="w-5 h-5 text-platform-muted" />
          </div>
          <p className="text-sm text-platform-fg">尚無歷史紀錄</p>
          <p className="text-xs text-muted-foreground">跑一次 benchmark 後會出現</p>
        </div>
      )}

      {runs.length > 0 && (
        <div className="flex gap-3">
          {/* Left Sidebar — Run Cards (collapsible) */}
          {sidebarOpen && (
            <aside className="w-[220px] shrink-0 flex flex-col bg-platform-card border border-platform-border rounded-md overflow-hidden">
              {/* Sidebar header with edit toggle */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-platform-border/60">
                <span className="text-[11px] font-mono text-platform-muted uppercase tracking-wider">
                  Runs ({runs.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode(v => !v)
                    setSelectedIds(new Set())
                  }}
                  className="text-xs text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                >
                  {isEditMode ? '完成' : '編輯'}
                </button>
              </div>

              {/* Run card list */}
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-260px)] scrollbar-thin p-2 space-y-1.5">
                {[...runs].reverse().map((r, idx, arr) => {
                  const prevRun = arr[idx + 1]
                  const avgScore = computeRunAvgScore(r, metric)
                  const prevAvgScore = prevRun ? computeRunAvgScore(prevRun, metric) : avgScore
                  return (
                    <HistoryRunCard
                      key={r.run_id}
                      run={{
                        id: r.run_id,
                        timestamp: r.timestamp,
                        avgScore,
                        prevAvgScore,
                        modelCount: r.models.length,
                        status: 'success',
                      }}
                      isSelected={r.run_id === selectedRunId}
                      onSelect={() => selectRun(r.run_id)}
                      onDelete={() => deleteRun(r.run_id)}
                      compact
                      isEditMode={isEditMode}
                      isChecked={selectedIds.has(r.run_id)}
                      onToggle={(id) => setSelectedIds(prev => {
                        const next = new Set(prev)
                        if (next.has(id)) next.delete(id)
                        else next.add(id)
                        return next
                      })}
                    />
                  )
                })}
              </div>

              {/* Bottom action bar — visible only in edit mode */}
              {isEditMode && (
                <div className="border-t border-platform-border/60 px-3 py-2.5 bg-platform-card space-y-2">
                  {/* Select all row */}
                  <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === runs.length && runs.length > 0}
                      onChange={e =>
                        setSelectedIds(e.target.checked
                          ? new Set(runs.map(r => r.run_id))
                          : new Set()
                        )
                      }
                      className="w-3.5 h-3.5 rounded accent-red-500 cursor-pointer"
                    />
                    全選（{runs.length} 筆）
                  </label>

                  {/* Delete button row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {selectedIds.size > 0 ? `已選 ${selectedIds.size} 筆` : '請勾選要刪除的紀錄'}
                    </span>
                    <button
                      type="button"
                      disabled={selectedIds.size === 0 || batchDeleting}
                      onClick={() => setShowBatchDeleteConfirm(true)}
                      className="px-3 py-1 rounded-md text-[11px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {batchDeleting ? '刪除中…' : `刪除${selectedIds.size > 0 ? ` ${selectedIds.size} 筆` : ''}`}
                    </button>
                  </div>
                </div>
              )}

              {/* Batch delete confirm modal */}
              {showBatchDeleteConfirm && (
                <DeleteConfirmModal
                  count={selectedIds.size}
                  deleting={batchDeleting}
                  onConfirm={async () => {
                    setBatchDeleting(true)
                    try {
                      await batchDeleteRuns([...selectedIds])
                      setSelectedIds(new Set())
                      setIsEditMode(false)
                      setShowBatchDeleteConfirm(false)
                    } finally {
                      setBatchDeleting(false)
                    }
                  }}
                  onCancel={() => setShowBatchDeleteConfirm(false)}
                />
              )}
            </aside>
          )}

          {/* Right Main Content */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Trend Chart */}
            <div className="rounded-md border border-platform-border/60 bg-platform-card backdrop-blur-sm p-3 space-y-2 shadow-sm">
              <ModelChips models={allModels} visible={visible} colors={colors} onToggle={toggleModel} />
              <TrendChart
                runs={runs}
                visibleModels={visible}
                metric={metric}
                modelColors={colors}
                modelDashes={dashes}
                selectedRunId={selectedRunId}
                onSelectRun={selectRun}
              />
            </div>

            {currentMeta && (addedModels.length > 0 || removedModels.length > 0) && (
              <div className="text-xs font-mono text-muted-foreground space-x-2">
                {addedModels.length > 0 && (
                  <span className="text-emerald-500">本次新增: {addedModels.join(', ')}</span>
                )}
                {removedModels.length > 0 && (
                  <span className="text-amber-500">本次移除: {removedModels.join(', ')}</span>
                )}
              </div>
            )}

            {/* Model Leaderboard */}
            {currentMeta && (
              <ModelLeaderboard
                models={currentMeta.models.filter(m => visible.has(m)).map((mid) => {
                  const summary = currentMeta.summary[mid]
                  const score = summary ? getLeaderboardScore(summary, metric) : 0
                  return { name: mid, score, isBaseline: mid === baselineModel }
                })}
                selectedModelName={baselineModel ?? undefined}
                onModelSelect={(name) => setBaselineModel(prev => prev === name ? null : name)}
              />
            )}

            {/* Case Inspector */}
            {selectedRun && (
              <div className="rounded-md border border-platform-border bg-platform-card backdrop-blur-sm p-3 space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-platform-fg">單次 run 回顧{taskType === 'vlm_detection' ? ' · 逐題 IoU' : ''} · {selectedRun.run_id} · <span className="text-platform-muted">{selectedRun.cases.length} cases</span></span>
                  {taskType !== 'vlm_detection' && <span className="text-platform-muted">judge: {selectedRun.judge}</span>}
                </div>
                {runLoading ? (
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 animate-spin" /> 載入 run…
                  </div>
                ) : runError ? (
                  <div className="text-xs text-red-500">{runError}</div>
                ) : (
                  <CaseInspector run={selectedRun} visibleModels={visible} modelColors={colors} />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
