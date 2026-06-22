# Garmin LLM Benchmark — Design System

> Internal design system for the **Garmin LLM Benchmark Platform** — a tool for comparing LLM, VLM, Flowise, and Custom API model variants on per-project text and vision benchmarks.

**Source materials used to build this system:**
- GitHub repo: `garmin-tw-mfg-eng/LLM-Benchmark` (mounted as `LLM-Benchmark/`)
- Codebase path: `LLM-Benchmark/frontend/` (React + Vite + TypeScript + Tailwind CSS + shadcn/ui)
- No Figma files were provided.

---

## Product Context

The **AI 模型評測平台** (AI Model Evaluation Platform) is an internal Garmin Manufacturing Engineering tool. Users select LLM/VLM models and benchmark test projects, run evaluations, and compare model performance via scores, metric bars, and trend charts. The UI is information-dense and data-focused — closer to a developer dashboard than a consumer product.

**Core surfaces:**
1. **Benchmark Models Card** — toggle/add/remove models to evaluate
2. **Project Selection Card** — choose LLM/VLM benchmark tasks with capability tags
3. **Results Section** — per-project model comparison cards with score metrics, W/T/L rows, progress bars
4. **History Panel** — trend charts, model leaderboard, case inspector for past runs
5. **Sticky Action Bar** — selection count, time estimate, "開始評估" button

---

## Content Fundamentals

**Language:** Primarily Traditional Chinese (繁體中文) for UI labels and feedback messages. Technical identifiers (model names, API paths, metric keys) remain in English/ASCII. Code/numeric values are never translated.

**Tone:** Direct, technical, low-ceremony. No marketing copy. State facts and counts.
- ✓ `已選 3 個任務` (Selected 3 tasks)
- ✓ `評估失敗：連線逾時` (Evaluation failed: connection timeout)
- ✗ `🎉 Great job! Your benchmark is ready!`

**Casing:** Title case for English component names (`Benchmark 模型`, `Run JSON`). Lowercase for status labels. ALL CAPS for short technical tokens (`LLM`, `VLM`, `W/T/L`).

**Emoji:** Not used in UI copy. The one exception is `⚡` in the header logo and `🏆 WINNER` badge for champion model — both intentional.

**Numbers:** Always `font-mono` (`var(--font-tabular)`) with `font-variant-numeric: tabular-nums`. Scores display as `92.4%` or `4.2 / 5`; never rounded to integers unless they are integers.

**Error messages:** Bilingual pattern — Chinese user-facing message + English technical detail in monospace. E.g. `評估失敗：${error}`.

---

## Interaction Patterns

### Endpoint / connection validation (REQUIRED)

Any form that registers a model **connection** (URL endpoint) must verify reachability before persisting — an unreachable endpoint is never saved.

- **Explicit "測試連線" (Test connection) button** sits beside the URL field. It runs an async probe and renders an inline status row: spinner → `● 連線成功 · 端點回應正常` (emerald) or `⚠ 無法連線：…` (red), following the bilingual error pattern.
- **Validate on save, always.** The primary action re-verifies before committing: if the URL has already passed it commits immediately; otherwise it triggers the same probe and only saves on success. A failed/unverified endpoint blocks the save — it does not save-then-warn.
- **Status reset on edit.** Any change to the URL clears the verified state, forcing a fresh test.
- **Button affordance:** the save button reads `驗證並新增` until the endpoint is verified, then `新增模型`; it shows the testing state as disabled with the spinner.
- This applies to add-model, edit-connection, and any future endpoint-bearing form. Treat "validated before persist" as the default for connection inputs, the same way required fields block submit.

---

## Visual Foundations

### Colors
- **Primary:** Indigo-600 (`#4f46e5`) in light mode; softened to indigo-400 in dark mode. Used for brand accent, active states, focus rings, primary buttons, enabled model chips.
- **Surfaces:** Cool blue-gray neutrals (not warm). `--background` is a pale near-white (`#F9FAFB`); `--card` is pure white; `--secondary` is a blue-tinted gray used for sidebars and secondary panels.
- **Dark mode:** Deep navy (`#0A1120`) background, GitHub-dark-style cards (`#161B22`). Opt-in via `.dark` class on `<html>`.
- **Semantic:** Emerald-500 (success/pass), Amber-500 (warning/mid score), Red-500 (error/fail/low score). These are identical in both themes.
- **Score bands:** Three-tier — ≥85% emerald, 40–84% amber, <40% red. Applied to progress bars, score text, card bg tint.
- **Model source:** Slate (builtin) vs soft-indigo (custom) — shown on chips and badges.

### Typography
- **Sans:** Inter — all UI text, labels, descriptions.
- **Mono:** JetBrains Mono — ALL numeric values, scores, run IDs, API paths, metric keys, W/T/L rows, timestamps. This is a core design rule: numbers are always mono.
- Font source: Google Fonts CDN. No local font files in the repository.
- Minimum size: `--text-xs` (12px) for labels. Metric hero numbers go up to 30px bold.

### Spacing
- 4-point grid (`--space-1` = 4px … `--space-16` = 64px).
- Component padding: cards use `p-4` (16px) / `p-6` (24px). Dense lists use `p-3` (12px).
- Gaps: between chips `gap-2` (8px); between sections `gap-5` / `gap-6`.

### Borders & Radius
- Border: `1px solid hsl(var(--border))` on all cards and inputs. Dividers use the same token.
- Radius: `--radius-md` (6px) for cards, buttons, inputs; `--radius-xl` (12px) for modals; `--radius-full` for badges and status dots. No large decorative rounding.
- No borderless cards — everything has a 1px border.

### Shadows
- Material 3–style: `--shadow-sm` as baseline card elevation; `--shadow-md` on hover (`hover-lift` utility); `--shadow-xl` for modals/dialogs.
- Shadow color uses `--shadow-color` token (foreground hue) so it adapts to dark mode without separate overrides.

### Backgrounds
- Flat colored surfaces — no images, no gradients on backgrounds.
- Glass panel (`var(--glass-panel)`) with `backdrop-filter: blur(12px)` is used sparingly for the History panel overlay.
- One brand gradient exists (`linear-gradient(135deg, #6366f1, #a855f7)`) but is only used for `.text-gradient` decorative text.

### Animation
- Easing: `--ease-spring` (`cubic-bezier(0.16,1,0.3,1)`) for element entrances; `--ease-smooth` for color transitions.
- Durations: 0.15s (hover color), 0.18s (entrances), 0.25s (modal scale-in), 0.5s (progress bar fills).
- Entrance animations: `fadeIn`, `slideUpFade`, `scaleIn` — all gate on the component mounting.
- Skeleton shimmer: `skeleton-shimmer` utility — used for all loading placeholders.
- Progress bars animate from 0% width on mount (`animate-bar-grow`).
- Reduced motion: all animations disabled via `@media (prefers-reduced-motion: reduce)`.

### Hover / Active States
- Cards: `hover-lift` — translateY(-2px) + shadow-md on hover.
- Buttons: `hover:bg-primary/90` (primary); `hover:bg-accent` (secondary/ghost); `active:scale-[0.98]`.
- Model chips: `translateY(-2px)` + shadow on hover.
- No opacity-fade hover states — always color-based.

### Cards
- White bg + 1px border + `--shadow-sm`. Hover lifts 2px.
- Selected state: `box-shadow: var(--card-selected-ring)` (2px indigo ring).
- Status accent: 4px left-border in semantic color (error=red, warning=amber, active=primary).
- Result cards tint bg with score color at 50% opacity (emerald/amber/red-50 on light, /20 on dark).

---

## Iconography

**Icon library:** [Lucide React](https://lucide.dev/) — stroke-based, 24px default, `strokeWidth={1.5}` to `2`. Used throughout via named imports.

**Common icons in use:**
- `BarChart2` — results/analytics
- `Clock` — time estimate
- `History` — history panel toggle
- `CheckCircle` / `XCircle` — pass/fail project status
- `AlertTriangle` — warnings
- `ChevronDown` — collapse/expand
- `Eye` / `EyeOff` — model visibility toggle
- `X` — close/remove
- `Download` — export
- `RefreshCw` — reload/spinner
- `Loader2` — async loading spinner (with `animate-spin`)
- `Search` — search input
- `Settings` — advanced options
- `PanelLeftClose` / `PanelLeft` — sidebar toggle

**No custom icon SVGs** were found in the source. All icons are Lucide — link from CDN or install `lucide-react`.

**Emoji:** Only `⚡` (header logo) and `🏆` (winner badge) — intentional exceptions.

---

## Assets

No logo images, illustrations, or brand imagery were found in the frontend source. The header uses a plain `⚡` emoji as a logo mark. Icons are fully Lucide-based (CDN).

---

## History Record Format (saved runs)

Every evaluation run is persisted as **one JSON file** (e.g. `runs/2026-06-18T1430_deepeval.json`). The History panel reads a list of these and renders each as an expandable row → per-model detail. The schema is **model-set-agnostic**: each run records exactly which models ran, so adding or dropping a model between runs needs no migration — the reader iterates `models[]`.

### Top-level shape

```json
{
  "schemaVersion": 1,
  "runId": "2026-06-18T14:30:00Z_deepeval",
  "timestamp": "2026-06-18T14:30:00Z",
  "type": "LLM",                     // "LLM" | "VLM"
  "method": "deepeval",             // LLM only: llm_judge | ragas | deepeval
  "scope": { "taskCount": 3, "caseCount": 70 },
  "tasks": ["general_qa", "code_review", "translation"],
  "baselineRunId": "2026-06-11T09:02:00Z_ragas",  // run compared against for regressions; null if none
  "models": [ /* see below */ ]
}
```

### Per-model entry — LLM

```json
{
  "id": "custom_1",                 // stable model id (key into model registry)
  "label": "Llama3-8B",            // display name at run time (snapshot)
  "kind": "custom",                // builtin | custom — snapshot, for color/badge
  "isNew": true,                    // true if absent from baselineRun (renders ＋本次新增)
  "score": 0.802,                   // overall judge score 0–1
  "regressions": 0,                 // task/case count that dropped vs baseline
  "tasks": [
    { "key": "general_qa",  "score": 0.78 },
    { "key": "code_review", "score": 0.74 },
    { "key": "translation", "score": 0.89 }
  ]
}
```

### Per-model entry — VLM

VLM reports **objective, reproducible** metrics. Recognition and OCR are reported as `accuracy` (whole-match / exact string compare); grounding (locate) is reported as **mean IoU**. A metric is `null` when that task did not run that time (e.g. grounding was only added on 2026-06-05) — the reader shows `—`, never `0`.

```json
{
  "id": "vlm_large",
  "label": "VLM Large",
  "kind": "builtin",
  "isNew": false,
  "metrics": {
    "recog": { "unit": "accuracy", "value": 0.92, "correct": 23, "total": 25 },
    "ocr":   { "unit": "accuracy", "value": 0.97, "correct": 29, "total": 30 },
    "iou":   { "unit": "mean_iou", "value": 0.86, "boxes": 2 }      // null if not run
  }
}
```

### Rules

- **Snapshot, don't reference.** Store `label`/`kind` as they were at run time so an old run still renders correctly after a model is renamed or deleted from the registry.
- **`null` means "not run", `0` means "ran and scored zero".** Keep them distinct — the UI relies on it to show `—` vs a red bar.
- **Score bands are read at render time**, not stored: ≥85% green (`--score-high`), 40–84% yellow (`--score-mid`), <40% red (`--score-low`). Don't bake colors into the file.
- **Cross-method LLM scores are not comparable** (llm_judge vs ragas vs deepeval use different scales). `method` is stored so the UI can warn; never average or trend across methods.
- **Regressions are computed against `baselineRunId`**, stored as a count per model so the row can show `⚠ N 退步` without re-reading the baseline file.
- Append-only: never mutate a saved run. A re-run is a new file with a new `runId`.

---

## File Index

```
styles.css                    ← Design system entry point (@import only)

tokens/
  colors.css                  ← All color custom properties (light + dark)
  typography.css              ← Font imports + scale tokens + body defaults
  spacing.css                 ← Space scale, border-radius, shadow tokens
  animation.css               ← Easing, duration, keyframes, utility classes
  components.css              ← Shared component CSS (scrollbar, glass, segmented-control…)

guidelines/                   ← Foundation specimen cards (DS tab: Colors, Type, Spacing)
  colors-brand.card.html
  colors-surface.card.html
  colors-semantic.card.html
  colors-score.card.html
  colors-model.card.html
  colors-dark.card.html
  type-sans.card.html
  type-mono.card.html
  spacing.card.html
  radius.card.html
  shadows.card.html
  animations.card.html

components/core/              ← Reusable UI primitives (DS tab: Components)
  Button.jsx + .d.ts + .prompt.md
  Badge.jsx + .d.ts + .prompt.md
  Progress.jsx + .d.ts
  MetricCard.jsx + .d.ts + .prompt.md
  ModelChip.jsx + .d.ts
  core.card.html              ← Component showcase card

ui_kits/benchmark/            ← Full dashboard recreation (DS tab: LLM Benchmark)
  index.html

SKILL.md                      ← Claude Code skill definition
readme.md                     ← This file
```
