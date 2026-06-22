Use for all numeric KPI displays: accuracy %, avg score, response time, IoU, win/loss counts.

```jsx
// Three states
<MetricCard label="準確率" value="92.4" unit="%" />        // data
<MetricCard label="mean IoU" loading />                     // skeleton
<MetricCard label="RAGAS Score" value={null} />             // empty dash

// Status accents (left-border color)
<MetricCard label="Latency" value="8.4" unit="s" status="warning" />
<MetricCard label="Parse Errors" value={3} status="error" />
<MetricCard label="Running" value="…" status="active" />

// Sparkline
<MetricCard label="Trend" value="87%" trend={[72,78,81,85,83,87,87]} />
```

Grid layout (2–4 cols) using CSS grid with `gap: var(--space-3)`.
