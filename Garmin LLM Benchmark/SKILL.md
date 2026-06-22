---
name: garmin-llm-benchmark-design
description: Use this skill to generate well-branded interfaces and assets for the Garmin LLM Benchmark platform — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping the AI 模型評測平台 dashboard.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

**Tech stack:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui + Lucide React

**Primary color:** Indigo-600 `#4f46e5` (`--primary: 243 75% 59%`) — dark mode softens to indigo-400

**Font sans:** Inter (Google Fonts)  
**Font mono:** JetBrains Mono (Google Fonts) — ALL numbers and metrics use this

**Key rule:** Every numeric value (scores, percentages, counts, timestamps) must use `font-mono` / `var(--font-tabular)` with `font-variant-numeric: tabular-nums`.

**Score color scale:**
- ≥ 85% → emerald-500 (`hsl(var(--score-high))`)
- 40–84% → amber-500 (`hsl(var(--score-mid))`)
- < 40% → red-500 (`hsl(var(--score-low))`)

**Dark mode:** opt-in via `.dark` on `<html>`. All tokens flip via CSS custom properties.

**Components available in `window.GarminLLMBenchmark_d1bc28`:**
- `Button` — variants: primary, secondary, outline, ghost, destructive; sizes: sm, md, lg
- `Badge` — variants: success, error, warning, pending, builtin, custom, score-high/mid/low, grounding, ocr, detection, vlm
- `Progress` — animated fill bar, variants match score colors
- `MetricCard` — 3 states: loading (skeleton), empty (dash), data (with optional sparkline)
- `ModelChip` — toggle chip with builtin/custom styling and left-border accent

**To use in a prototype (HTML+React+Babel):**
```html
<link rel="stylesheet" href="./_ds/<folder>/styles.css">
<script src="./_ds/<folder>/_ds_bundle.js"></script>
<script type="text/babel">
  const { Button, Badge, MetricCard } = window.GarminLLMBenchmark_d1bc28;
  // use components...
</script>
```
