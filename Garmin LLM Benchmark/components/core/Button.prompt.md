Use for all interactive triggers — evaluate, reload, history, delete.

```jsx
// Variants
<Button variant="primary">開始評估</Button>
<Button variant="secondary">重新載入</Button>
<Button variant="outline">歷史趨勢</Button>
<Button variant="ghost">取消</Button>
<Button variant="destructive">刪除</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>評估中…</Button>
```

Notable: all buttons use `font-mono` matching the app's action bar style.
The `loading` prop swaps in a CSS spinner inline — no extra icon import needed.
Hover/active states use CSS transitions; no JS state needed for visual feedback.
