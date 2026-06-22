# Garmin AI 模型評測平台 — 前端設計準則

這份文件是這個評測平台前端的「唯一事實來源」。把整個 `handoff/` 資料夾交給 Copilot / Sonnet，
要求它依此把 React + Vite 專案的畫面改成這個設計（排版、顏色、字體、間距、元件樣式、互動）。

實作時請對照 `reference/` 內的實際程式碼，那是這份準則的可執行版本：
- `reference/index.html` — 主畫面：Header、模型卡、任務卡、結果卡、底部固定列、新增模型 modal、loading
- `reference/parts.jsx` — 結果欄、逐題檢視（LLM 並排答案 / VLM 比對 / bbox 定位）、案件篩選
- `reference/history.jsx` — 歷史趨勢面板
- `reference/data.js` — 資料結構與共用 helper（`MC`、`sc`、`sb`、`isRegr`、`S` 樣式物件）
- `styles.css` + `tokens/*.css` — 所有設計 token

> 同目錄另有 `copilot-instructions.md`（Tailwind / shadcn 版的速查表）與 `update.md`（套用步驟）。

---

## 0. 給 AI 的一句話指令

> 「請依 `design-guidelines.md` 與 `tokens/*.css` 的 token，把現有畫面改成這個設計。
> 先把 `styles.css` 匯入專案，所有顏色 / 間距 / 圓角 / 字體都改用 CSS 變數，不要自創顏色，
> 不要用紫色與漸層背景。數字一律 `font-mono` + `tabular-nums`。LLM 分數顯示為 `X.X/5`，
> VLM 的 accuracy / IoU 才用百分比。」

---

## 1. 色彩 Token（HSL，無 `hsl()` 包裝，用 `hsl(var(--x))`）

定義在 `tokens/colors.css`，亮 / 暗色雙主題都有。**永遠用變數，不要寫死色碼。**

| Token | 亮色值 | 用途 |
|---|---|---|
| `--primary` | `216 41% 43%`（鋼藍 #41659b） | 按鈕、連結、啟用狀態、focus ring、選中邊框 |
| `--primary-foreground` | `0 0% 98%` | primary 上的文字 |
| `--background` | `210 17% 98%` | 頁面底色 |
| `--card` | `0 0% 100%` | 卡片底色 |
| `--secondary` | `214 22% 93%` | 面板 / 輸入框 / chip 底色 |
| `--accent` | `214 100% 93%` | hover / 展開高亮 |
| `--border` | `214 16% 85%` | 所有邊框 |
| `--foreground` | `215 41% 17%` | 主文字 |
| `--muted-foreground` | `215 16% 37%` | 次要文字、標籤 |
| `--destructive` | `0 84% 60%` | 錯誤、退步、Fail |
| `--success` | `160 84% 39%` | 通過、高分、Pass、WINNER |
| `--warning` | `38 92% 50%` | 中等分數 |

模型來源色：
- builtin（內建）→ `--model-builtin`（slate `215 19% 47%`）
- custom（使用者新增）→ `--model-custom`（鋼藍系 `205 55% 42%`）

各模型在圖表中的識別色（`data.js` 的 `MC`）：`llm_large #3b82f6`、`llm_small #60a5fa`、
`vlm_large #a855f7`、`vlm_small #c084fc`、custom `#14b8a6`。**這是資料視覺化的識別點色，
不是 UI 主題色** — UI 元件一律用上面的 token。

### 分數色階（`sc` / `sb`，輸入為 0–1 的 score）
- `score ≥ 0.85` → success（綠）
- `0.40 ≤ score < 0.85` → warning（琥珀）
- `score < 0.40` → destructive（紅）

`sc(v)` 回傳文字色，`sb(v)` 回傳分數條 / 邊條的背景色（用 `--score-high/mid/low` token）。

### 禁止
- ❌ 任何紫色 / violet（`#8b5cf6`、`purple-*`、`violet-*`）當 **UI 主題色**。VLM 標籤、OCR/Grounding
  的 capability 標籤用到的淡紫是既有例外，照 `CAP_CLR` / VLM 標籤的既有寫法即可，不要外擴。
- ❌ 背景大面積漸層。
- ❌ 寫死的 hex 色碼當主題色（資料識別色 `MC` 除外）。

---

## 2. 字體與排版（`tokens/typography.css`）

- 介面字體 `--font-sans`：**Inter**
- 數字 / 程式碼 / 標籤字體 `--font-mono`：**JetBrains Mono**
- 字級：`--text-xs .75rem` / `--text-sm .875rem` / `--text-base 1rem` / `--text-xl 1.25rem` …
- 字重：normal 400 / medium 500 / semibold 600 / bold 700 / **black 900**（大數字用）

**鐵則：**
1. **所有數字**（分數、百分比、題數、run ID、座標、IoU）→ `font-mono`。
2. **會變動的數字**再加 `tabular-nums`（`font-variant-numeric`），避免跳動。
3. UI 標籤 → `text-xs` + `muted-foreground` + mono（即 `S.lbl`）。
4. 最小字級 12px（`--text-xs`）。

---

## 3. 分數顯示規則（重要 — 最近一次更新）

LLM 與 VLM 用**不同的計分制**，顯示方式必須分開：

| 任務類型 | `metricType` | headline 顯示 | 底下副指標 |
|---|---|---|---|
| LLM 問答 / 程式審查 / 翻譯 | `'llm'` | **`X.X/5`**（`(score*5).toFixed(1)+'/5'`） | `贏了 N 題` + `N/total（NN% 勝率）` |
| VLM 影像辨識 | `'recognition'` | `NN.N%` | `✓ 正確 correct/total` · whole-match |
| VLM 序號 OCR | `'ocr'` | `NN.N%` | `✓ 正確 correct/total` · 精確比對 |
| VLM 零件定位 | `'locate'` | `NN.N%` | `mean IoU NN.N%` |

- 資料層 `score` 一律存 **0–1**。LLM 是 judge 0–5 分正規化來的；顯示時再 `×5` 還原成 `X.X/5`。
- **分數條寬度**仍用 `score*100+'%'`（0–100% 的視覺長度），與 headline 文字無關。
- per-case 逐題 LLM 分數本來就是 0–5 制，直接顯示 `r.score + '/5'`。

> winner（🏆）一律取 **score 最高**者，與「勝率 wins/total」無關 —— 兩者是不同維度，可能不一致。

實作參考 `reference/parts.jsx` 的 `ModelCol`：
```jsx
const isJudge = metricType==='llm';
const headline = isJudge ? (data.score*5).toFixed(1)+'/5' : (data.score*100).toFixed(1)+'%';
```

---

## 4. 間距、圓角、陰影（`tokens/spacing.css`）

- 間距走 `--space-*`（4px 級距）。chip 之間 `gap 8px`、卡片之間 `12px`、區塊之間 `20px`。
- 圓角：輸入/小 chip `--radius-sm 4px`、按鈕/卡片 `--radius-md 6px`、面板 `--radius-lg 8px`、
  modal `--radius-xl 12px`、pill/dot `--radius-full`。**卡片不要用 2xl/3xl 大圓角。**
- 陰影：卡片預設 `--shadow-sm`，hover `--shadow-md`，modal / 固定列 `--shadow-lg`、`--shadow-xl`。
- 資訊密度高：用**邊框**分隔區塊，少用大留白。

---

## 5. 動畫（`tokens/animation.css`）

- 緩動：`--ease-spring`（進場）、`--ease-smooth`（一般過渡）。時長 `--duration-fast .15s` 起。
- 既有 class：`animate-fade-in` / `animate-slide-up` / `animate-scale-in` / `animate-bar-grow`
  （分數條長出）/ `skeleton-shimmer`（骨架）/ `hover-lift`（卡片浮起）。
- 已內建 `prefers-reduced-motion: reduce` 的關閉規則 —— 沿用即可。

---

## 6. 核心元件樣式

共用樣式物件在 `data.js` 的 `S`：`card` / `mono` / `muted` / `lbl`。新元件沿用這套。

- **卡片**：`background hsl(var(--card))` + `1px border` + `--radius-lg` + `--shadow-sm`。
- **按鈕（主）**：`background hsl(var(--primary))` + `primary-foreground` 文字 + mono。
- **按鈕（次）**：透明底 + `1px border` + `foreground` 文字。
- **Pass/Fail 徽章**：pill（`--radius-full`），Pass 用 `success/.1` 底 + 綠字，Fail 用 `destructive/.1` 底 + 紅字。
- **退步徽章**：`⚠ 退步`，`destructive/.1` 底 + 紅邊 + 700 字重。
- **分段控制 / tab**：`segmented-control` —— 灰底外框，啟用段 primary 底 + 白字。
- **模型 chip**：來自 design system 的 `ModelChip`（`window.GarminLLMBenchmark_d1bc28.ModelChip`），
  啟用態 primary 邊框 + 淡 primary 底，可點右側展開端點 / 連結等 detail。
- **Loading**：雙環 spinner（旋轉 + 呼吸），底下進度條。
- **圖示**：用 Lucide（inline SVG 即可），14–16px，`strokeWidth 1.5–2`。
  **UI 不放 emoji**，例外只有 logo 的 ⚡、winner 的 🏆、裁判的 ⚖、退步的 ⚠、資訊的 ⓘ。

---

## 7. 版面與互動骨架

- 最外層 `min-height:100vh`，內容 `max-width 1100px` 置中，底部留 130px 給固定列。
- 區塊順序：**Header → Benchmark 模型卡 → 測試專案卡 → （不相容警告）→ 評測結果 → 歷史面板**，
  底部 sticky 動作列（已選任務數 / 預估時間 / 歷史 / 重新載入 / 開始評估）。
- 模型分 LLM / VLM 兩組；任務分 LLM / VLM 兩個 tab，但**已選任務橫跨兩類**可一起評估。

### 模態相容性 gate（邏輯重點）
- 規則：**VLM 模型可跑 LLM + VLM 任務；LLM 模型只能跑純文字 LLM 任務。**
- 前端只擋一個方向：`modalityConflict = vlmSel>0 && llmEnabled.length>0`
  —— 有選 VLM 任務又啟用了 LLM 模型時，跳紅色不相容警告並停用「開始評估」。
- 反向（VLM 模型跑 LLM 任務）**不擋**。注意：結果欄 `ResultCard` 只渲染 `RESULTS[task]` 裡
  **有對應資料列的模型**（`enabledModels.filter(m=>data[m.id])`），所以 demo 資料若缺某模型在某任務的
  分數，那一欄不會出現 —— 這是資料缺口，不是 gate。真實後端接上後每個（模型×任務）都應回傳分數。

---

## 8. 「退步 / Regression」定義（產品語彙）

以「比較基準模型」為準，**基準答對、但新模型答錯**的題目即為一筆退步。
- helper：`isRegr(c, baseId, newId) = c.models[baseId].pass && !c.models[newId].pass`
- 比較基準在 Header 右上可分別為 LLM / VLM 設定（同類型需 ≥2 個啟用模型）。
- 它代表新模型整體分數雖可能提升，卻在原本能答對的案例上倒退，是上線前最該檢查的風險。
