import { useMemo, useState, useEffect, useCallback } from 'react'
import { Zap, Clock, Download, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { ResultCard } from './ResultCard'
import { cn } from '@/lib/utils'
import { fmtPct } from '@/lib/format'
import type { EvaluateResultMap, ModelOutcome } from '@/types/benchmark'

interface ResultsSectionProps {
  results: EvaluateResultMap
  type: 'new' | 'history'
}

/**
 * Transpose model-major {model_id: ModelOutcome} into project-major so each
 * ResultCard shows one project with all models side-by-side.
 */
function toProjectMajor(
  results: EvaluateResultMap,
): Array<{ projectName: string; modelRuns: Array<{ modelId: string; outcome: ModelOutcome; colorIndex: number }> }> {
  const projectSet = new Set<string>()
  for (const outcome of Object.values(results)) {
    for (const p of Object.keys(outcome.projects)) {
      projectSet.add(p)
    }
  }

  const modelEntries = Object.entries(results)

  return Array.from(projectSet).map((projectName) => ({
    projectName,
    modelRuns: modelEntries
      .filter(([, outcome]) => projectName in outcome.projects)
      .map(([modelId, outcome], i) => ({ modelId, outcome, colorIndex: i })),
  }))
}

function getPrimaryScore(scores: Record<string, number | number[]>): number | null {
  if (typeof scores['mean_iou'] === 'number') return scores['mean_iou'] as number
  if (typeof scores['accuracy'] === 'number') return scores['accuracy'] as number
  if (typeof scores['avg_score'] === 'number') return (scores['avg_score'] as number) / 10
  const entry = Object.entries(scores).find(([, v]) => typeof v === 'number' && (v as number) >= 0 && (v as number) <= 1)
  return entry ? entry[1] as number : null
}

function buildCsvContent(results: EvaluateResultMap): string {
  const modelIds = Object.keys(results)
  const modelNames = modelIds.map(id => results[id].spec.display_name || results[id].spec.name || id)
  const projectSet = new Set<string>()
  for (const outcome of Object.values(results)) {
    for (const p of Object.keys(outcome.projects)) projectSet.add(p)
  }
  const projects = Array.from(projectSet)

  const header = ['項目', ...modelNames].map(c => `"${c}"`).join(',')
  const rows = projects.map(project => {
    const cols = modelIds.map(mid => {
      const run = results[mid].projects[project]
      if (!run || run.status !== 'ok') return '"—"'
      const score = getPrimaryScore(run.scores ?? {})
      return score != null ? `"${fmtPct(score)}"` : '"—"'
    })
    return [`"${project}"`, ...cols].join(',')
  })
  return [header, ...rows].join('\n')
}

function buildMarkdownTable(results: EvaluateResultMap): string {
  const modelIds = Object.keys(results)
  const modelNames = modelIds.map(id => results[id].spec.display_name || results[id].spec.name || id)
  const projectSet = new Set<string>()
  for (const outcome of Object.values(results)) {
    for (const p of Object.keys(outcome.projects)) projectSet.add(p)
  }
  const projects = Array.from(projectSet)

  const header = `| 項目 | ${modelNames.join(' | ')} |`
  const divider = `| --- | ${modelIds.map(() => '---').join(' | ')} |`
  const rows = projects.map(project => {
    const cols = modelIds.map(mid => {
      const run = results[mid].projects[project]
      if (!run || run.status !== 'ok') return '—'
      const score = getPrimaryScore(run.scores ?? {})
      return score != null ? fmtPct(score) : '—'
    })
    return `| ${project} | ${cols.join(' | ')} |`
  })
  return [header, divider, ...rows].join('\n')
}

export function ResultsSection({ results, type }: ResultsSectionProps) {
  const Icon = type === 'new' ? Zap : Clock
  const label = type === 'new' ? '新測試' : '歷史記錄'
  const title = type === 'new' ? '評估結果' : '歷史記錄'

  const projectCards = useMemo(() => toProjectMajor(results), [results])

  // ── Model order & visibility state ─────────────────────────────────────────
  const [modelOrder, setModelOrder] = useState<string[]>([])
  // Per-project hidden model sets: Map<projectName, Set<modelId>>
  const [hiddenByProject, setHiddenByProject] = useState<Map<string, Set<string>>>(new Map())
  const [copiedMd, setCopiedMd] = useState(false)

  // Sync modelOrder when results change; reset hidden state on new evaluation
  useEffect(() => {
    const ids = Object.keys(results)
    setModelOrder((prev) => {
      const existing = prev.filter((id) => ids.includes(id))
      const newIds = ids.filter((id) => !existing.includes(id))
      return [...existing, ...newIds]
    })
    setHiddenByProject(new Map())
  }, [results])

  function handleToggleVisibility(projectName: string, modelId: string) {
    setHiddenByProject((prev) => {
      const next = new Map(prev)
      const projectSet = new Set(next.get(projectName) ?? [])
      if (projectSet.has(modelId)) {
        projectSet.delete(modelId)
      } else {
        projectSet.add(modelId)
      }
      next.set(projectName, projectSet)
      return next
    })
  }

  function handleReorder(newOrder: string[]) {
    setModelOrder(newOrder)
  }

  const handleExportCsv = useCallback(() => {
    const csv = buildCsvContent(results)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `benchmark_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [results])

  const handleCopyMarkdown = useCallback(async () => {
    const md = buildMarkdownTable(results)
    await navigator.clipboard.writeText(md)
    setCopiedMd(true)
    setTimeout(() => setCopiedMd(false), 2000)
  }, [results])

  const totalHidden = Array.from(hiddenByProject.values()).reduce((sum, s) => sum + s.size, 0)

  return (
    <section className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded font-mono">
          <Icon className="w-3 h-3" />
          {label}
        </span>
        <button
          type="button"
          onClick={() => setHiddenByProject(new Map())}
          className={cn(
            'text-xs font-mono transition-colors',
            totalHidden > 0
              ? 'text-primary hover:underline'
              : 'text-muted-foreground/50 cursor-default',
          )}
          disabled={totalHidden === 0}
        >
          全部顯示{totalHidden > 0 ? `（已隱藏 ${totalHidden}）` : ''}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="export-btn"
            title="匯出 CSV"
          >
            <Download className="w-3 h-3" />
            匯出 CSV
          </button>
          <button
            type="button"
            onClick={() => void handleCopyMarkdown()}
            className="export-btn"
            title="複製為 Markdown 表格"
          >
            {copiedMd ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            {copiedMd ? '已複製' : 'Markdown'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {projectCards.map(({ projectName, modelRuns }, index) => {
          // Sort by modelOrder — do NOT filter hidden models; they stay visible but greyed out
          const sortedRuns =
            modelOrder.length > 0
              ? [...modelRuns].sort((a, b) => {
                  const ai = modelOrder.indexOf(a.modelId)
                  const bi = modelOrder.indexOf(b.modelId)
                  return (ai === -1 ? 9999 : ai) - (bi === -1 ? 9999 : bi)
                })
              : modelRuns

          return (
            <motion.div
              key={projectName}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07, duration: 0.3, ease: 'easeOut' }}
            >
              <ResultCard
                projectName={projectName}
                modelRuns={sortedRuns}
                modelOrder={modelOrder}
                hiddenModelIds={hiddenByProject.get(projectName) ?? new Set()}
                onToggleVisibility={handleToggleVisibility}
                onReorder={handleReorder}
              />
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

