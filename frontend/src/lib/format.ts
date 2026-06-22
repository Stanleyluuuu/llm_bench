/** Format a 0–1 ratio as a percentage string with 1 decimal place. e.g. 0.873 → "87.3%" */
export function fmtPct(v: number): string {
  if (!isFinite(v)) return '—'
  return `${(v * 100).toFixed(1)}%`
}

/** Format a rubric score (e.g. 0–5 range) with 1 decimal place. e.g. 4.2 → "4.2" */
export function fmtScore(v: number): string {
  return v.toFixed(1)
}
