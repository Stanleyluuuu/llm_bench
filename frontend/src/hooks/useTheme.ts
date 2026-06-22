import { useEffect, useState, useCallback } from 'react'

/**
 * Theme preference — the user's explicit choice.
 * - 'light' / 'dark': force that mode
 * - 'system': follow the OS / browser setting (prefers-color-scheme)
 */
export type ThemePreference = 'light' | 'dark' | 'system'

/** The resolved (applied) theme is always light or dark. */
export type ResolvedTheme = 'light' | 'dark'

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  return pref === 'system' ? getSystemTheme() : pref
}

function applyTheme(resolved: ResolvedTheme): void {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

const STORAGE_KEY = 'theme'

/** Safe localStorage read — returns undefined in private-browsing or storage-disabled contexts. */
function safeGetItem(key: string): string | undefined {
  try {
    return localStorage.getItem(key) ?? undefined
  } catch {
    return undefined
  }
}

/** Safe localStorage write — silently no-ops when storage is unavailable. */
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* private browsing / quota exceeded — ignore */
  }
}

function readStoredPref(): ThemePreference {
  const v = safeGetItem(STORAGE_KEY)
  if (v === 'light' || v === 'dark' || v === 'system') return v
  // First visit or storage unavailable: default to system preference
  return 'system'
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readStoredPref)
  const resolved = resolveTheme(preference)

  // Apply theme class on mount and when preference changes
  useEffect(() => {
    applyTheme(resolved)
    safeSetItem(STORAGE_KEY, preference)
  }, [preference, resolved])

  // Listen for OS dark-mode changes when preference is 'system'
  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    function onChange() { applyTheme(getSystemTheme()) }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  const setTheme = useCallback((pref: ThemePreference) => {
    setPreference(pref)
  }, [])

  return { preference, resolved, setTheme }
}
