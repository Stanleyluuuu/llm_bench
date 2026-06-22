Use for: model source labels (Builtin/Custom), evaluation status, score bands (high/mid/low), capability tags on project cards.

```jsx
// Status
<Badge variant="success" dot>Pass</Badge>
<Badge variant="error" dot>Fail</Badge>
<Badge variant="warning">Parse Error</Badge>
<Badge variant="pending" dot>Running</Badge>

// Model source
<Badge variant="builtin" dot>Builtin</Badge>
<Badge variant="custom" dot>Custom</Badge>

// Score bands
<Badge variant="score-high">92.4%</Badge>
<Badge variant="score-mid">61.2%</Badge>
<Badge variant="score-low">23.7%</Badge>

// Capability chips
<Badge variant="grounding" pill={false}>Grounding</Badge>
<Badge variant="ocr" pill={false}>OCR</Badge>
<Badge variant="detection" pill={false}>Detection</Badge>
<Badge variant="vlm" pill={false}>VLM</Badge>
```

Dark-mode safe: all colors use CSS vars and alpha-channel bg so they invert correctly.
