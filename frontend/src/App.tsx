import { useState, useEffect, useCallback, useMemo } from 'react'
import { BarChart2, Clock, History } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { BenchmarkModelsCard } from '@/components/BenchmarkModelsCard'
import { EnhancedProjectSelectionCard } from '@/components/EnhancedProjectSelectionCard'
import { ResultsSection } from '@/components/ResultsSection'
import { LoadingModal } from '@/components/LoadingModal'
import { EvaluateGuard } from '@/components/EvaluateGuard'
import { HistoryPanel } from '@/components/history/HistoryPanel'
import { ThemeSwitch } from '@/components/ThemeSwitch'
import { Toaster, toast } from '@/components/Toaster'
import { useProjects } from '@/hooks/useProjects'
import { useModels } from '@/hooks/useModels'
import { useEvaluate } from '@/hooks/useEvaluate'
import { useCompatibility } from '@/hooks/useCompatibility'
import { useTheme } from '@/hooks/useTheme'
import { useBenchmarkStore } from '@/stores/benchmark-store'
import type { MetricOverrides, ModelTab } from '@/types/benchmark'

export default function App() {
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [guardOpen, setGuardOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [useSmartRouting, setUseSmartRouting] = useState(true)
  const [scoringEngine, setScoringEngine] = useState<'custom' | 'deepeval'>('custom')
  const [manualMetrics, setManualMetrics] = useState({
    accuracy: true,
    completeness: true,
    relevance_clarity: true,
    ragas_faithfulness: false,
    ragas_answer_relevancy: false,
  })

  const { preference, setTheme } = useTheme()
  const { projects, loading: projectsLoading, reload: reloadProjects } = useProjects()
  const { allModels, configError, addCustomModel, toggleEnabled, removeCustomModel, updateCustomModel, getEnabledModels } = useModels()
  const { results, resultType, loading: evaluating, error: evaluateError, evaluate, stage, progress } = useEvaluate()

  // ── Surface silent errors via toast ───────────────────────────────────
  useEffect(() => {
    if (configError) toast.error(`載入模型設定失敗：${configError}`)
  }, [configError])
  useEffect(() => {
    if (evaluateError) toast.error(`評估失敗：${evaluateError}`)
  }, [evaluateError])

  // ── Zustand store — load config on mount ────────────────────────────────
  const storeLoadConfig = useBenchmarkStore(s => s.loadConfig)
  useEffect(() => {
    void storeLoadConfig().catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`無法載入評測設定：${msg}`)
    })
  }, [storeLoadConfig])

  // ── beforeunload guard: warn if evaluation is running ──────────────────────
  useEffect(() => {
    if (!evaluating) return
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [evaluating])

  // ── Derived counts ──────────────────────────────────────────────────────────
  const llmProjects = projects.filter((p) => p.type === 'LLM')
  const vlmProjects = projects.filter((p) => p.type === 'VLM')

  const enabledModels = allModels.filter((m) => m.enabled)
  const hasModels = enabledModels.length > 0
  const hasVlmModels = enabledModels.some((m) => m.model_type === 'VLM')

  // ── Compatibility gate (LLM model + VLM project is the only blocked combo) ─
  const { validationError } = useCompatibility(enabledModels, projects, selectedProjects)

  // ── Store unverified models for guard ───────────────────────────────────────
  const storeModels = useBenchmarkStore(s => s.models)
  const unverifiedModels = storeModels.filter(m => m.enabled && m.connectionStatus !== 'verified')

  // ── Estimated total time (per-task × model count, only tasks that have estimatedMinutes) ──
  const totalEstimatedMinutes = useMemo(() => {
    const selected = projects.filter(p => selectedProjects.has(p.name) && p.estimatedMinutes !== undefined)
    if (selected.length === 0) return null
    const perTaskSum = selected.reduce((sum, p) => sum + (p.estimatedMinutes ?? 0), 0)
    return perTaskSum * enabledModels.length
  }, [projects, selectedProjects, enabledModels])

  // ── Project toggle handlers ─────────────────────────────────────────────────
  function toggleProject(name: string) {
    setSelectedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function handleSelectAll(tab: ModelTab, checked: boolean) {
    const tabProjects = projects.filter((p) => p.type === tab).map((p) => p.name)
    setSelectedProjects((prev) => {
      const next = new Set(prev)
      if (checked) tabProjects.forEach((n) => next.add(n))
      else tabProjects.forEach((n) => next.delete(n))
      return next
    })
  }

  // ── Metric overrides derived from advanced settings ─────────────────────────
  const metricOverrides = useMemo((): MetricOverrides | undefined => {
    const useRagas = !useSmartRouting && (manualMetrics.ragas_faithfulness || manualMetrics.ragas_answer_relevancy)
    // engine applies regardless of smart routing so both backends are comparable.
    if (useSmartRouting && scoringEngine === 'custom') return undefined
    return { use_ragas: useRagas, engine: scoringEngine }
  }, [useSmartRouting, manualMetrics, scoringEngine])

  // ── Evaluate ─────────────────────────────────────────────────────────────────
  const doEvaluate = useCallback(async () => {
    const models = getEnabledModels()
    await evaluate(Array.from(selectedProjects), models, metricOverrides)
  }, [evaluate, getEnabledModels, selectedProjects, metricOverrides])

  async function handleEvaluate() {
    if (!hasModels || validationError) return
    // Guard: check for unverified/failed models
    if (unverifiedModels.length > 0) {
      setGuardOpen(true)
      return
    }
    await doEvaluate()
  }

  function handleGuardConfirm() {
    setGuardOpen(false)
    void doEvaluate()
  }

  const hasSelection = selectedProjects.size > 0

  const evaluateDisabledReason =
    evaluating ? undefined :
    !hasModels ? '請先選擇至少一個模型' :
    !hasSelection ? '請先選擇至少一個測試項目' :
    validationError ? validationError :
    undefined

  return (
    <>
      <Layout headerRight={<ThemeSwitch preference={preference} onSetTheme={setTheme} />}>
        <BenchmarkModelsCard
        allModels={allModels}
        onToggle={toggleEnabled}
        onAdd={(type, fields) => {
          addCustomModel({
            display_name: fields.display_name,
            name: fields.name,
            api_base: fields.api_base,
            model_type: type,
            max_token: fields.max_token,
            resize: fields.resize_enabled && fields.resize_x > 0 && fields.resize_y > 0
              ? [fields.resize_x, fields.resize_y]
              : undefined,
          })
        }}
        onRemove={removeCustomModel}
        onUpdate={updateCustomModel}
      />

      <EnhancedProjectSelectionCard
        llmProjects={llmProjects}
        vlmProjects={vlmProjects}
        selectedProjects={selectedProjects}
        loading={projectsLoading}
        hasSelection={hasSelection}
        hasVlmModels={hasVlmModels}
        isEvaluating={evaluating}
        validationError={validationError}
        useSmartRouting={useSmartRouting}
        manualMetrics={manualMetrics}
        scoringEngine={scoringEngine}
        onScoringEngineChange={setScoringEngine}
        onSmartRoutingChange={setUseSmartRouting}
        onManualMetricsChange={(key) => setManualMetrics(prev => ({ ...prev, [key]: !prev[key] }))}
        onToggleProject={toggleProject}
        onSelectAll={handleSelectAll}
        onReload={reloadProjects}
      />

      {results ? (
        <ResultsSection results={results} type={resultType} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 lg:py-20 gap-4 text-muted-foreground animate-fade-in">
          <div className="relative">
            <BarChart2 className="w-12 h-12 opacity-25" />
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground/60">尚無評測結果</p>
            <p className="text-xs text-muted-foreground">選擇模型與測試項目以開始評估</p>
          </div>
        </div>
      )}

      {historyOpen && projects.length > 0 && (
        <HistoryPanel
          projects={projects.map(p => p.name)}
          initialProject={selectedProjects.size > 0 ? Array.from(selectedProjects)[0]! : null}
        />
      )}

      <LoadingModal open={evaluating} stage={stage} progress={progress} />
      </Layout>

      {/* Evaluate guard dialog */}
      <EvaluateGuard
        open={guardOpen}
        unverifiedModels={unverifiedModels}
        onConfirm={handleGuardConfirm}
        onCancel={() => setGuardOpen(false)}
      />

      {/* Global toast notifications */}
      <Toaster />

      {/* Sticky action bar — always visible regardless of scroll position */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-sm shadow-lg">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: selection summary */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground min-w-0 flex-wrap">
          {hasSelection && (
            <>
              <span className="font-medium text-foreground">
                已選 <span className="text-primary font-semibold">{selectedProjects.size}</span> 個任務
              </span>
              {totalEstimatedMinutes !== null && (
                <>
                  <span className="hidden sm:block w-px h-4 bg-border" />
                  <span className="hidden sm:flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    約 {totalEstimatedMinutes % 1 === 0
                      ? `${totalEstimatedMinutes} 分鐘`
                      : `${totalEstimatedMinutes.toFixed(1)} 分鐘`}
                  </span>
                </>
              )}
            </>
          )}
        </div>
        {/* Right: action buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={() => setHistoryOpen(v => !v)}
          disabled={evaluating}
          className="px-3 py-2 text-sm font-mono inline-flex items-center gap-1.5 border border-border text-foreground/80 bg-transparent rounded-md hover:bg-accent hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0"
          aria-pressed={historyOpen}
        >
          <History className="w-3.5 h-3.5" />
          {historyOpen ? '收起歷史' : '歷史趨勢'}
        </button>
        <button
          type="button"
          onClick={reloadProjects}
          disabled={evaluating}
          className="px-4 py-2 text-sm font-mono border border-primary text-primary bg-transparent rounded-md hover:bg-accent hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0"
        >
          重新載入
        </button>
        <button
          type="button"
          onClick={() => void handleEvaluate()}
          disabled={!hasModels || !hasSelection || evaluating || !!validationError}
          title={evaluateDisabledReason}
          className="px-6 py-2.5 text-sm font-mono font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0 active:scale-[0.98]"
        >
          {evaluating ? '評估中…' : '開始評估'}
        </button>
        </div>
        </div>
      </div>
    </>
  )
}
