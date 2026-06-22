export const EXTRA_COLORS = [
  '#0284c7', '#ec4899', '#14b8a6', '#f97316',
  '#06b6d4', '#84cc16', '#e11d48', '#0d9488',
  '#0891b2', '#ca8a04',
] as const

export const BUILTIN_COLORS: Record<string, string> = {
  llm_large: '#3b82f6',
  llm_small: '#60a5fa',
  vlm_large: '#0ea5e9',
  vlm_small: '#38bdf8',
}

export function modelColor(modelId: string, colorIndex: number): string {
  return BUILTIN_COLORS[modelId] ?? EXTRA_COLORS[colorIndex % EXTRA_COLORS.length] ?? '#41659b'
}
