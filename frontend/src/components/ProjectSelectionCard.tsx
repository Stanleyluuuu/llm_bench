import { RefreshCw, Play, AlertTriangle, FolderSearch } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { NeonCheckbox } from '@/components/NeonCheckbox'
import { formatProjectName } from '@/lib/utils'
import type { ModelTab, ProjectItem } from '@/types/benchmark'

interface ProjectSelectionCardProps {
  llmProjects: ProjectItem[]
  vlmProjects: ProjectItem[]
  selectedProjects: Set<string>
  loading: boolean
  hasSelection: boolean
  hasModels: boolean
  isEvaluating: boolean
  validationError: string | null
  onToggleProject: (name: string) => void
  onSelectAll: (tab: ModelTab, checked: boolean) => void
  onReload: () => void
  onEvaluate: () => void
}

interface ProjectGridProps {
  type: ModelTab
  typeLabel: string
  projects: ProjectItem[]
  selectedProjects: Set<string>
  allSelected: boolean
  onToggleProject: (name: string) => void
  onSelectAll: (checked: boolean) => void
}

function ProjectGrid({
  type, typeLabel, projects, selectedProjects, allSelected, onToggleProject, onSelectAll,
}: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div>
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
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
            {type}
          </span>
          <span className="text-sm font-medium text-foreground">{typeLabel}</span>
          <span className="text-xs text-muted-foreground">({projects.length} 個測試)</span>
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

      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.map((project, index) => {
          const selected = selectedProjects.has(project.name)
          return (
            <div
              key={project.name}
              onClick={() => onToggleProject(project.name)}
              tabIndex={0}
              onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onToggleProject(project.name)}
              className={[
                'flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all hover:-translate-y-px hover:shadow-sm',
                'animate-slide-up focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                selected
                  ? 'bg-primary/10 border-primary'
                  : 'bg-secondary border-border hover:bg-accent',
              ].join(' ')}
              style={{ animationDelay: `${Math.min(index * 18, 280)}ms` }}
            >
              <NeonCheckbox
                checked={selected}
                onChange={() => onToggleProject(project.name)}
                aria-label={`選取 ${project.name}`}
              />
              <span className="text-sm text-foreground truncate">{formatProjectName(project.name)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ProjectSelectionCard({
  llmProjects, vlmProjects, selectedProjects, loading, hasSelection, hasModels, isEvaluating,
  validationError, onToggleProject, onSelectAll, onReload, onEvaluate,
}: ProjectSelectionCardProps) {
  const llmAllSelected = llmProjects.length > 0 && llmProjects.every((p) => selectedProjects.has(p.name))
  const vlmAllSelected = vlmProjects.length > 0 && vlmProjects.every((p) => selectedProjects.has(p.name))
  const canEvaluate = hasSelection && hasModels && !isEvaluating && !validationError

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">選擇測試</h2>
        <button
          onClick={onReload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-secondary border border-border rounded-md hover:bg-accent transition-colors text-foreground"
        >
          <RefreshCw className="w-4 h-4" />
          重新載入測試
        </button>
      </div>

      <div className="p-6 space-y-5">
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
              onToggleProject={onToggleProject}
              onSelectAll={(checked) => onSelectAll('LLM', checked)}
            />

            <Separator />

            <ProjectGrid
              type="VLM"
              typeLabel="視覺語言模型 / Locate 測試"
              projects={vlmProjects}
              selectedProjects={selectedProjects}
              allSelected={vlmAllSelected}
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

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
          <button
            onClick={onEvaluate}
            disabled={!canEvaluate}
            title={
              validationError ??
              (!hasModels ? '請先在上方啟用至少一個模型' :
               !hasSelection ? '請先在下方勾選至少一個測試' : undefined)
            }
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Play className="w-4 h-4" />
            開始評估
          </button>
        </div>
      </div>
    </div>
  )
}
