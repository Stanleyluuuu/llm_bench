# Garmin LLM Benchmark — Copilot Design Instructions

## Color Tokens (CSS variables, HSL no wrapper)
- `--primary: 216 41% 43%`  → #41659b muted blue  (use for buttons, links, active states)
- `--background: 210 17% 98%`  → #F9FAFB cool near-white
- `--card: 0 0% 100%`  → #FFFFFF
- `--secondary: 214 22% 93%`  → #E8EDF5 sidebar/panel bg
- `--border: 214 16% 85%`  → #CDD5E0
- `--foreground: 215 41% 17%`  → #1E293B slate
- `--muted-foreground: 215 16% 37%`  → #4B5768

Score colors:
- ≥85% success → `text-emerald-700 bg-emerald-100` (light) / `text-emerald-500 bg-emerald-500/10` (dark)
- 40–84% warning → `text-amber-700 bg-amber-100`
- <40% error → `text-destructive bg-red-100`

## Typography Rules (ALWAYS enforce)
- ALL numeric values, scores, percentages, run IDs → `font-mono` class
- Add `tabular-nums` (font-variant-numeric) to any number that changes
- UI labels → `text-xs text-muted-foreground`
- Minimum font size: 12px (text-xs)

## Color Rules
- Primary brand color: #41659b — use for buttons, active model chips, focus rings
- NO purple (`#8b5cf6`, `violet-*`, `purple-*`) anywhere in the UI
- NO large gradients on backgrounds
- Model source: builtin → slate-500 / custom → steel-blue (same hue as primary)

## Component Patterns

### Buttons
```tsx
// Primary
<Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono">
// Secondary  
<Button variant="secondary" className="border border-border font-mono">
```

### Cards
```tsx
<div className="bg-card border border-border rounded-md p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
```

### Badges (status)
```tsx
// Pass
<span className="text-xs font-mono bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Pass</span>
// Fail
<span className="text-xs font-mono bg-red-100 text-destructive px-2 py-0.5 rounded-full">Fail</span>
// Model: Builtin
<span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Builtin</span>
// Model: Custom
<span className="text-xs font-mono bg-blue-50 text-[#41659b] px-2 py-0.5 rounded">Custom</span>
```

### Score display
```tsx
<span className={cn(
  "font-mono font-bold tabular-nums",
  score >= 0.85 ? "text-emerald-700" : score >= 0.40 ? "text-amber-700" : "text-destructive"
)}>
  {(score * 100).toFixed(1)}%
</span>
```

### Progress bars
```tsx
<Progress value={score * 100} className={
  score >= 0.85 ? "[&>div]:bg-emerald-500" :
  score >= 0.40 ? "[&>div]:bg-amber-500"   : "[&>div]:bg-destructive"
} />
```

### MetricCard (3 states)
```tsx
// Loading
<div className="bg-card border border-border rounded-md p-3">
  <div className="h-2.5 w-24 rounded bg-secondary animate-pulse mb-2" />
  <div className="h-5 w-16 rounded bg-secondary animate-pulse" />
</div>
// Empty
<span className="text-muted-foreground text-xs font-mono">—</span>
// Data
<div className="bg-card border border-border rounded-md p-3 hover:bg-accent transition-colors">
  <p className="text-muted-foreground text-xs mb-1">{label}</p>
  <p className="text-foreground font-mono text-lg font-bold tabular-nums">{value}{unit}</p>
</div>
```

## Layout Rules
- Fixed `h-screen` layout with sticky header + sticky bottom action bar
- Sidebar: `bg-secondary border-r border-border`, fixed width
- Main content: `ScrollArea` (shadcn), not `overflow-y-auto`
- Information-dense: reduce whitespace, use borders not padding to separate sections
- Gaps: `gap-2` (8px) between chips; `gap-3` (12px) between cards; `gap-5` (20px) between sections

## Border Radius
- Inputs, small chips: `rounded-sm` (4px)
- Buttons, cards, most components: `rounded-md` (6px)
- Modals, large panels: `rounded-lg` (8px) or `rounded-xl` (12px)
- Badges, pills, dots: `rounded-full`
- NO large `rounded-2xl` or `rounded-3xl` on cards

## Iconography
- Use Lucide React ONLY (`import { X } from 'lucide-react'`)
- Default size: 16px or 14px for inline; strokeWidth={1.5}
- NO emoji in UI (except ⚡ in the logo and 🏆 for the winner badge)

## TypeScript Types (from types/benchmark.ts)
```ts
interface MetricItem {
  id: string; label: string; value: number | string;
  unit?: string; status: 'normal' | 'warning' | 'error' | 'active'; trend?: number[]
}
```

## What NOT to do
- No `purple-*`, `violet-*` Tailwind classes
- No `rounded-2xl` / `rounded-3xl` on cards
- No inline `any` types — define in `types/`
- No `overflow-y-auto` — use shadcn `<ScrollArea>`
- No gradient backgrounds
- No font-sans on numbers/metrics — always font-mono
