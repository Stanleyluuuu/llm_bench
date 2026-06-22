import { useState, useMemo, useCallback, useEffect } from 'react'
import { RefreshCw, Clock, AlertTriangle, FolderSearch, Search, X, Settings, Folder } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { NeonCheckbox } from '@/components/NeonCheckbox'
import { formatProjectName } from '@/lib/utils'
import type { ModelTab, ProjectItem } from '@/types/benchmark'

interface EnhancedProjectSelectionCardProps {
  llmProjects: ProjectItem[]
  vlmProjects: ProjectItem[]
  selectedProjects: Set<string>
  loading: boolean
  hasSelection: boolean
  hasVlmModels: boolean
  isEvaluating: boolean
  validationError: string | null
  useSmartRouting: boolean
  manualMetrics: {
    accuracy: boolean
    completeness: boolean
    relevance_clarity: boolean
    ragas_faithfulness: boolean
    ragas_answer_relevancy: boolean
  }
  onSmartRoutingChange: (v: boolean) => void
  onManualMetricsChange: (key: 'accuracy' | 'completeness' | 'relevance_clarity' | 'ragas_faithfulness' | 'ragas_answer_relevancy') => void
  onToggleProject: (name: string) => void
  onSelectAll: (tab: ModelTab, checked: boolean) => void
  onReload: () => void
}

interface ProjectGridProps {
  type: ModelTab
  typeLabel: string
  projects: ProjectItem[]
  selectedProjects: Set<string>
  allSelected: boolean
  searchTerm: string
  disabled?: boolean
  onToggleProject: (name: string) => void
  onSelectAll: (checked: boolean) => void
}

// Capability chip: maps keyword → consistent colour (same saturation/lightness across hues)
function getCapabilityStyle(capability: string): string {
  const lower = capability.toLowerCase()
  if (lower.includes('grounding') || lower.includes('locate')) return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
  if (lower.includes('ocr') || lower.includes('text recog')) return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300'
  if (lower.includes('detect') || lower.includes('classif')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
  if (lower.includes('vlm') || lower.includes('vision')) return 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
  if (lower.includes('translat')) return 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300'
  if (lower.includes('judge') || lower.includes('eval')) return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
  return 'bg-primary/10 text-primary'
}

function CapabilityChip({ capability }: { capability: string }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full leading-none ${getCapabilityStyle(capability)}`}>
      {capability}
    </span>
  )
}

function ProjectGrid({
  type, typeLabel, projects, selectedProjects, allSelected, searchTerm, disabled, onToggleProject, onSelectAll,
}: ProjectGridProps) {
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects
    const term = searchTerm.toLowerCase()
    return projects.filter(p =>
      p.name.toLowerCase().includes(term) ||
      formatProjectName(p.name).toLowerCase().includes(term)
    )
  }, [projects, searchTerm])

  const selectedCount = filteredProjects.filter(p => selectedProjects.has(p.name)).length

  if (projects.length === 0) {
    return (
      <div className={disabled ? 'opacity-40 pointer-events-none select-none' : ''}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
            {type}
          </span>
          <span className="text-sm font-medium text-foreground">{typeLabel}</span>
        </div>
        <div className="flex items-center gap-2 py-3 pl-1">
          <FolderSearch className="w-4 h-4 text-muted-foreground opacity-60" />
          <p className="text-sm text-muted-foreground">此分類沒有任何測試 — 請在 Project-jsonl 目錄下新增</p>
        </div>
      </div>
    )
  }

  return (
    <div className={disabled ? 'opacity-40 pointer-events-none select-none relative' : 'relative'}>
      {disabled && (
        <div className="absolute inset-0 z-10 flex items-center justify-center" aria-hidden="true" />
      )}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
            {type}
          </span>
          <span className="text-sm font-medium text-foreground">{typeLabel}</span>
          <span className="text-xs text-muted-foreground">
            ({filteredProjects.length} 個測試
            {selectedCount > 0 && <span className="text-primary font-semibold"> · 已選 {selectedCount}</span>}
            )
          </span>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground">
          <NeonCheckbox
            checked={allSelected}
            onChange={() => onSelectAll(!allSelected)}
            aria-label="全選"
          />
          全選
        </label>
      </div>

      {filteredProjects.length === 0 && searchTerm.trim() && (
        <div className="flex items-center gap-2 py-4 pl-1">
          <Search className="w-4 h-4 text-muted-foreground opacity-60" />
          <p className="text-sm text-muted-foreground">無符合「{searchTerm}」的測試</p>
        </div>
      )}

      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filteredProjects.map((project, index) => {
          const selected = selectedProjects.has(project.name)
          return (
            <div
              key={project.name}
              onClick={() => onToggleProject(project.name)}
              tabIndex={0}
              onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onToggleProject(project.name)}
              className={[
                'flex flex-col gap-1.5 p-3 rounded-md border cursor-pointer',
                'animate-slide-up focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                'transition-all duration-[180ms] hover:-translate-y-px',
                selected
                  ? 'bg-card border-primary ring-2 ring-primary/50 shadow-sm'
                  : 'bg-card border-border shadow-sm hover:border-primary hover:shadow-md',
              ].join(' ')}
              style={{ animationDelay: `${Math.min(index * 18, 280)}ms` }}
            >
              {/* Row 1: Checkbox + Task name */}
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex-shrink-0">
                  <NeonCheckbox
                    checked={selected}
                    onChange={() => onToggleProject(project.name)}
                    aria-label={`選取 ${project.name}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[15px] font-semibold text-foreground leading-tight line-clamp-2" title={formatProjectName(project.name)}>
                    {formatProjectName(project.name)}
                  </span>
                  {project.estimatedMinutes !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-[11px] font-mono text-muted-foreground">
                        ~{project.estimatedMinutes % 1 === 0 ? project.estimatedMinutes : project.estimatedMinutes.toFixed(1)} 分鐘
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Row 2: Capability chip — the "這題測什麼" highlight */}
              {project.capability && (
                <div className="pl-[26px]">
                  <CapabilityChip capability={project.capability} />
                </div>
              )}
              {/* Row 3: Project + description — de-emphasised metadata */}
              {(project.project || project.description) && (
                <div className="pl-[26px] flex flex-col gap-0.5">
                  {project.project && (
                    <div className="flex items-center gap-1">
                      <Folder className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                      <span className="text-[11px] text-muted-foreground/70 truncate">{project.project}</span>
                    </div>
                  )}
                  {project.description && (
                    <span className="text-[12px] text-muted-foreground/80 truncate">{project.description}</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function EnhancedProjectSelectionCard({
  llmProjects, vlmProjects, selectedProjects, loading, hasSelection: _hasSelection, hasVlmModels, isEvaluating: _isEvaluating,
  validationError, useSmartRouting, manualMetrics, onSmartRoutingChange, onManualMetricsChange,
  onToggleProject, onSelectAll, onReload,
}: EnhancedProjectSelectionCardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const toggleMetric = useCallback((key: keyof typeof manualMetrics) => {
    onManualMetricsChange(key)
  }, [onManualMetricsChange])

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = advancedOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [advancedOpen])

  const llmAllSelected = llmProjects.length > 0 && llmProjects.every((p) => selectedProjects.has(p.name))
  const vlmAllSelected = vlmProjects.length > 0 && vlmProjects.every((p) => selectedProjects.has(p.name))
  const totalSelected = selectedProjects.size

  const handleClearSearch = useCallback(() => setSearchTerm(''), [])

  return (
    <>
      {/* ── 進階評測設定 Drawer (右側滑出) ── */}
      <div
        className={[
          'fixed inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity z-40',
          advancedOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={() => setAdvancedOpen(false)}
        aria-hidden="true"
      />
      <div
        className={[
          'fixed inset-y-0 right-0 w-96 bg-card shadow-2xl border-l border-border z-50 transition-transform duration-300 ease-out flex flex-col',
          advancedOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="進階評測設定"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h3 className="text-base font-semibold text-foreground">進階評測設定</h3>
          <button
            type="button"
            onClick={() => setAdvancedOpen(false)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <p className="text-xs text-muted-foreground">自訂 LLM 測試的評分方式。預設由系統選用 LLM judge 或 RAGAS，可在此手動指定評分指標。</p>
          {/* 智慧路由開關 */}
          <div className="flex items-center justify-between rounded-md bg-muted/60 p-3">
            <div>
              <p className="text-sm font-medium text-foreground">自動智慧路由評測指標</p>
              <p className="text-xs text-muted-foreground mt-0.5">開啟後系統自動依資料集內容選擇最適合的評估方式</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={useSmartRouting}
              onClick={() => onSmartRoutingChange(!useSmartRouting)}
              className={['relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                useSmartRouting ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600',
              ].join(' ')}
            >
              <span
                className={['pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
                  useSmartRouting ? 'translate-x-4' : 'translate-x-0',
                ].join(' ')}
              />
            </button>
          </div>
          {/* 手動指標 */}
          <fieldset
            disabled={useSmartRouting}
            className={['space-y-4 transition-opacity', useSmartRouting ? 'opacity-40 pointer-events-none' : ''].filter(Boolean).join(' ')}
          >
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">通用指標 (LLM Judge)</p>
              <div className="flex flex-wrap gap-3">
                {([
                  { key: 'accuracy' as const, label: '準確性' },
                  { key: 'completeness' as const, label: '完整性' },
                  { key: 'relevance_clarity' as const, label: '流暢度' },
                ] as const).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={manualMetrics[key]}
                      onChange={() => toggleMetric(key)}
                      className="w-3.5 h-3.5 rounded border-border accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">RAG 專用指標 (Ragas)</p>
              <div className="flex flex-wrap gap-3">
                {([
                  { key: 'ragas_faithfulness' as const, label: '知識庫忠實度' },
                  { key: 'ragas_answer_relevancy' as const, label: '答案相關性' },
                ] as const).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={manualMetrics[key]}
                      onChange={() => toggleMetric(key)}
                      className="w-3.5 h-3.5 rounded border-border accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </fieldset>
        </div>
      </div>

      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-border gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-foreground">選擇測試</h2>
            {totalSelected > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                {totalSelected} 已選
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋測試..."
                className="pl-7 pr-7 py-1.5 text-xs w-40 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="清除搜尋"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setAdvancedOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-secondary border border-border rounded-md hover:bg-accent transition-colors text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              title="自訂 LLM 測試的評分方式"
            >
              <Settings className="w-4 h-4" />
              進階評測設定
            </button>
            <button
              type="button"
              onClick={onReload}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-secondary border border-border rounded-md hover:bg-accent transition-colors text-foreground disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <RefreshCw className={['w-4 h-4', loading ? 'animate-spin' : ''].filter(Boolean).join(' ')} />
              重新載入
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>載入測試中...</span>
            </div>
          ) : (
            <>
              <ProjectGrid
                type="LLM"
                typeLabel="大型語言模型測試"
                projects={llmProjects}
                selectedProjects={selectedProjects}
                allSelected={llmAllSelected}
                searchTerm={searchTerm}
                onToggleProject={onToggleProject}
                onSelectAll={(checked) => onSelectAll('LLM', checked)}
              />

              <Separator />

              {!hasVlmModels && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-md border border-amber-400/50 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-600/30 px-3 py-2 text-xs text-amber-700 dark:text-amber-400"
                >
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span>請先啟用至少一個 <strong>VLM</strong> 模型，才能勾選視覺語言模型測試。</span>
                </div>
              )}
              <ProjectGrid
                type="VLM"
                typeLabel="視覺語言模型 / Locate 測試"
                projects={vlmProjects}
                selectedProjects={selectedProjects}
                allSelected={vlmAllSelected}
                searchTerm={searchTerm}
                disabled={!hasVlmModels}
                onToggleProject={onToggleProject}
                onSelectAll={(checked) => onSelectAll('VLM', checked)}
              />
            </>
          )}

          {/* Validation error */}
          {validationError && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/15 px-3 py-2 text-sm text-destructive"
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>{validationError}</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
