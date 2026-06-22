import { useCallback, useEffect, useState } from 'react'
import { fetchProjects } from '@/api/client'
import type { ModelTab, ProjectItem } from '@/types/benchmark'

export function useProjects() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProjects()
      const items: ProjectItem[] = (data.projects ?? []).map((p) => {
        if (typeof p === 'string') return { name: p, type: 'LLM' as ModelTab }
        return {
          name: p.name,
          type: (p.type ?? 'LLM') as ModelTab,
          project: p.project ?? undefined,
          capability: p.capability ?? undefined,
          description: p.description ?? undefined,
          estimatedMinutes: typeof p.estimated_minutes === 'number' ? p.estimated_minutes : undefined,
        }
      })
      setProjects(items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  return { projects, loading, error, reload: load }
}
