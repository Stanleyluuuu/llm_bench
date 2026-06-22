import { useEffect, useState } from 'react'
import { fetchConfig } from '@/api/client'
import type { ConfigResponse } from '@/types/benchmark'

export function useConfig() {
  const [config, setConfig] = useState<ConfigResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConfig()
      .then(setConfig)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg)
      })
  }, [])

  return { config, error }
}
