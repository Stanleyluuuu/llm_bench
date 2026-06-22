/** Continuous color scale for 1–5 rubric scores. */
export interface ScoreColors {
  /** Tailwind text colour class */
  fg: string
  /** Tailwind background bar class */
  bar: string
  /** Tailwind soft background class */
  soft: string
  /** Tailwind border colour class (for left-border accents) */
  border: string
}

/**
 * Maps a 1–5 rubric score to a semantic colour set.
 * ≥4.25 (85%) → emerald
 * ≥2.0 (40%)  → amber
 * <2.0 (40%)  → red
 */
export function scoreColor(s: number): ScoreColors {
  if (s >= 4.25) return { fg: 'text-emerald-600', bar: 'bg-emerald-500', soft: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-500' }
  if (s >= 2.0) return { fg: 'text-amber-600', bar: 'bg-amber-500', soft: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-500' }
  return { fg: 'text-red-500', bar: 'bg-red-500', soft: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-500' }
}
