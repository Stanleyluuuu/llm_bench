# update.md — 把評測平台設計套用到 React + Vite 專案

這份文件是給 Copilot（搭配 Sonnet）的操作手冊。
目標：把現有 React + Vite 專案的畫面改成 `handoff/` 裡的這套設計（排版、顏色、字體、間距、元件）。
請按順序執行，每個步驟完成後驗證再往下。

---

## 前置：理解 handoff/ 的結構

```
handoff/
├── design-guidelines.md      ← 設計邏輯、規則、元件說明（本文的上層文件）
├── copilot-instructions.md   ← Tailwind / shadcn 速查表（顏色、元件 snippet）
├── update.md                 ← 本文件（套用步驟）
├── styles.css                ← 設計系統入口（只需 @import 這一個）
├── tokens/
│   ├── colors.css            ← 所有 CSS 變數（亮色 :root + 暗色 .dark）
│   ├── typography.css        ← 字體 + 字級 + @import Google Fonts
│   ├── spacing.css           ← 間距 / 圓角 / 陰影
│   ├── animation.css         ← keyframes + utility class
│   └── components.css        ← 共用 class（scrollbar、glass、segmented-control …）
└── reference/
    ├── index.html            ← 主畫面參考實作（完整可執行）
    ├── parts.jsx             ← 元件：ModelCol、CaseInspector、ProjRow …
    ├── history.jsx           ← HistoryPanel
    └── data.js               ← 資料結構 + 共用 helper（MC、sc、sb、S、isRegr …）
```

---

## 步驟 1：複製 token 檔到專案

把 `handoff/tokens/` 整個資料夾複製到你的 `src/styles/` 下（或你慣用的 styles 路徑），
再把 `handoff/styles.css` 也複製過去：

```
src/styles/
├── styles.css        ← 入口，只需改裡面的相對路徑
└── tokens/
    ├── colors.css
    ├── typography.css
    ├── spacing.css
    ├── animation.css
    └── components.css
```

修改 `styles.css` 裡的 `@import` 路徑（預設已是相對路徑，複製後通常不需改）：

```css
@import './tokens/colors.css';
@import './tokens/typography.css';
@import './tokens/spacing.css';
@import './tokens/animation.css';
@import './tokens/components.css';
```

---

## 步驟 2：在 Vite 入口匯入 styles.css

找到 `src/main.tsx`（或 `main.jsx`），在最頂端加：

```ts
import './styles/styles.css';
```

確認這一行在所有元件 import **之前**，避免 token 比元件晚載入。

---

## 步驟 3：確認 Tailwind（如果有用）同樣套用 token

若專案使用 Tailwind，在 `tailwind.config.ts` 的 `theme.extend` 加上對應映射，
讓 `bg-card`、`text-primary` 等 class 指向同一組 CSS 變數：

```ts
theme: {
  extend: {
    colors: {
      background: 'hsl(var(--background))',
      card:       'hsl(var(--card))',
      primary: {
        DEFAULT:    'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary:  'hsl(var(--secondary))',
      accent:     'hsl(var(--accent))',
      border:     'hsl(var(--border))',
      foreground: 'hsl(var(--foreground))',
      muted: {
        DEFAULT:    'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      destructive: 'hsl(var(--destructive))',
      success:     'hsl(var(--success))',
      warning:     'hsl(var(--warning))',
    },
    borderRadius: {
      sm:   'var(--radius-sm)',
      md:   'var(--radius-md)',
      lg:   'var(--radius-lg)',
      xl:   'var(--radius-xl)',
      '2xl':'var(--radius-2xl)',
      full: 'var(--radius-full)',
    },
    fontFamily: {
      sans: ['var(--font-sans)'],
      mono: ['var(--font-mono)'],
    },
    boxShadow: {
      sm: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
      xl: 'var(--shadow-xl)',
    },
  },
},
```

---

## 步驟 4：全域 body 樣式

`tokens/typography.css` 已有 body reset，但若你的 Vite 專案有 `index.css` 或 `App.css`
覆寫了 `background` / `color` / `font-family`，請把它們刪掉或改成：

```css
body {
  font-family: var(--font-sans);
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

---

## 步驟 5：暗色模式切換

設計用 `.dark` class 在 `<html>` 或 `<body>` 上切換暗色 token。
在 App 的 dark mode toggle 裡：

```tsx
// 加 dark class
document.documentElement.classList.toggle('dark', isDark);
// 或（如用 state）
React.useEffect(() => {
  document.documentElement.className = isDark ? 'dark' : '';
}, [isDark]);
```

若你的專案已有 `next-themes` / `@radix-ui/themes`，設定 `attribute="class"` 即可。

---

## 步驟 6：元件逐一套用設計

對照 `handoff/copilot-instructions.md` 的 snippet，逐元件修改。
優先順序（從影響面最大的開始）：

### 6-A：卡片 / 容器
```tsx
// 把 rounded-xl shadow-md 等自訂值換成
className="bg-card border border-border rounded-md shadow-sm"
// hover
className="... hover:-translate-y-0.5 hover:shadow-md transition-all"
```

### 6-B：按鈕
```tsx
// Primary
<Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono">
// Secondary
<Button variant="outline" className="border-border font-mono">
```

### 6-C：所有數字 / 分數 → font-mono + tabular-nums
```tsx
<span className="font-mono tabular-nums font-bold">
  {(score * 5).toFixed(1)}/5   {/* LLM 分數 */}
</span>
<span className="font-mono tabular-nums">
  {(accuracy * 100).toFixed(1)}%   {/* VLM accuracy / IoU */}
</span>
```

### 6-D：分數顏色（直接對應 `sc(score)` helper）
```tsx
function scoreColor(score: number) {
  if (score >= 0.85) return 'text-emerald-700 dark:text-emerald-400';
  if (score >= 0.40) return 'text-amber-700  dark:text-amber-400';
  return 'text-destructive';
}
```

### 6-E：分數條（對應 `animate-bar-grow`）
```tsx
<div className="h-1.5 rounded-full bg-secondary overflow-hidden">
  <div
    className="h-full rounded-full animate-bar-grow"
    style={{
      width: `${score * 100}%`,
      background: score>=0.85 ? 'hsl(var(--score-high))'
                : score>=0.40 ? 'hsl(var(--score-mid))'
                :               'hsl(var(--score-low))',
    }}
  />
</div>
```

### 6-F：Pass / Fail 徽章
```tsx
<span className={cn(
  'text-xs font-mono px-2 py-0.5 rounded-full border',
  pass
    ? 'bg-success/10 text-emerald-700 border-success/30'
    : 'bg-destructive/10 text-destructive border-destructive/30'
)}>
  {pass ? '✓ Pass' : '✗ Fail'}
</span>
```

### 6-G：退步徽章
```tsx
<span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full
  bg-destructive/10 text-destructive border border-destructive/35">
  ⚠ 退步
</span>
```

### 6-H：分段控制（tab 切換）
直接加 `className="segmented-control"`（已在 `components.css` 定義），
或用 Tailwind 手刻：
```tsx
<div className="inline-flex border border-border rounded-lg overflow-hidden bg-secondary">
  {['LLM', 'VLM'].map(t => (
    <button key={t}
      data-active={tab === t}
      onClick={() => setTab(t)}
      className="px-3 py-1 text-xs font-mono
        data-[active=true]:bg-primary data-[active=true]:text-primary-foreground
        data-[active=false]:text-muted-foreground
        transition-all"
    >
      {t}
    </button>
  ))}
</div>
```

---

## 步驟 7：LLM vs VLM 分數顯示（最近一次修改）

在顯示「整體分數 headline」的元件裡加這個判斷：

```tsx
// metricType: 'llm' | 'recognition' | 'ocr' | 'locate'
const isLLMJudge = metricType === 'llm';
const headline = isLLMJudge
  ? `${(score * 5).toFixed(1)}/5`
  : `${(score * 100).toFixed(1)}%`;
```

分數條寬度仍統一用 `score * 100 + '%'`（不受 headline 影響）。

---

## 步驟 8：模態相容性 gate

把原來的前端邏輯還原，只擋「LLM 模型 + VLM 任務」這個方向：

```ts
const vlmTaskSelected = selectedProjects.some(p => p.type === 'VLM');
const llmModelsEnabled = enabledModels.some(m => m.type === 'LLM');
const modalityConflict = vlmTaskSelected && llmModelsEnabled;
```

- `modalityConflict === true` → 顯示紅色警告、停用「開始評估」按鈕。
- 反向（VLM 模型跑 LLM 任務）不擋。
- 若結果列表沒顯示 VLM 模型的 LLM 分數，原因是後端 / demo 資料沒回傳，不是前端擋掉的。

---

## 步驟 9：底部固定動作列

```tsx
<div className="fixed bottom-0 inset-x-0 z-30
  border-t border-border bg-card/95 backdrop-blur-sm
  px-6 py-2.5 flex items-center justify-between gap-3
  shadow-lg">
  {/* 左：任務數 + 預估時間 */}
  {/* 右：歷史趨勢 / 重新載入 / 開始評估 */}
</div>
```

給 main content 加 `pb-32` 避免被遮住。

---

## 步驟 10：新增模型 Modal

參考 `reference/index.html` 的 `showAdd` 區塊。重點：
- Backdrop：`fixed inset-0 bg-foreground/50 backdrop-blur-sm`
- Modal 本體：`bg-card border border-border rounded-xl shadow-xl w-96`
- 連線測試流程：填 URL → 點「測試連線」（模擬或真實 ping）→ 驗證通過後才能「新增模型」。

---

## 驗證 checklist

完成後逐項確認：

- [ ] 頁面背景是 `hsl(210 17% 98%)`（近白，非純白）
- [ ] 卡片是純白底 + 細邊框 + 小陰影
- [ ] 主色按鈕是鋼藍（#41659b），沒有紫色
- [ ] LLM headline 顯示 `X.X/5`，VLM 顯示 `NN.N%`
- [ ] 所有數字用 JetBrains Mono + tabular-nums
- [ ] 分數條從左生長（`animate-bar-grow`）
- [ ] 暗色模式切換正常（`.dark` class）
- [ ] `prefers-reduced-motion` 下動畫全部關閉
- [ ] VLM 模型跑 LLM 任務時，前端**不**彈警告
- [ ] LLM 模型選了 VLM 任務，出現紅色不相容警告
