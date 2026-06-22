import { useMemo, useState } from 'react'
import type { CaseResult } from '@/types/history'

export type CaseFilterType = 'all' | 'pass' | 'fail' | 'diff'

export interface CaseFilterCounts {
  all: number
  pass: number
  fail: number
  diff: number
}

function isCasePass(c: CaseResult, visibleModels: Set<string>, threshold: number | null): boolean {
  if (threshold !== null) {
    // VLM detection: pass = all visible models meet IoU threshold
    const visibleList = Array.from(visibleModels)
    return visibleList.every((m) => {
      const score = c.model_outputs[m]?.score
      return typeof score === 'number' && score >= threshold
    })
  }
  return c.verdict.outcome === 'all_pass'
}

function isCaseDiff(c: CaseResult, visibleModels: Set<string>, threshold: number | null): boolean {
  const visibleList = Array.from(visibleModels)
  if (threshold !== null) {
    // VLM detection: diff = models disagree on pass/fail
    const results = visibleList.map((m) => {
      const score = c.model_outputs[m]?.score
      return typeof score === 'number' ? score >= threshold : false
    })
    return results.length > 1 && results.some((r) => r !== results[0])
  }
  const answers = visibleList
    .map((m) => c.model_outputs[m]?.answer)
    .filter((a): a is string => a !== undefined)
  return answers.length > 1 && answers.some((a) => a !== answers[0])
}

export function useCaseFilter(
  cases: CaseResult[],
  visibleModels: Set<string>,
  threshold: number | null = null,
) {
  const [filter, setFilter] = useState<CaseFilterType>('all')

  const counts: CaseFilterCounts = useMemo(() => {
    let pass = 0
    let fail = 0
    let diff = 0

    for (const c of cases) {
      const isPass = isCasePass(c, visibleModels, threshold)
      if (isPass) pass++
      else fail++
      if (isCaseDiff(c, visibleModels, threshold)) diff++
    }

    return { all: cases.length, pass, fail, diff }
  }, [cases, visibleModels, threshold])

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (filter === 'all') return true
      if (filter === 'pass') return isCasePass(c, visibleModels, threshold)
      if (filter === 'fail') return !isCasePass(c, visibleModels, threshold)
      if (filter === 'diff') return isCaseDiff(c, visibleModels, threshold)
      return true
    })
  }, [cases, filter, visibleModels, threshold])

  return { filter, setFilter, filteredCases, counts }
}
