/* @ds-bundle: {"format":3,"namespace":"GarminLLMBenchmark_d1bc28","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"MetricCard","sourcePath":"components/core/MetricCard.jsx"},{"name":"ModelChip","sourcePath":"components/core/ModelChip.jsx"},{"name":"Progress","sourcePath":"components/core/Progress.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"2298feca1c3e","components/core/Button.jsx":"68170fb89178","components/core/MetricCard.jsx":"93c1709b6ee3","components/core/ModelChip.jsx":"c9f84a22aef5","components/core/Progress.jsx":"10e67a3f8572","handoff/reference/data.js":"6899f4a3d102","handoff/reference/history.jsx":"5a47a9c3b742","handoff/reference/parts.jsx":"577a8ef48e00","ui_kits/benchmark/data.js":"6899f4a3d102","ui_kits/benchmark/history.jsx":"5a47a9c3b742","ui_kits/benchmark/parts.jsx":"577a8ef48e00"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.GarminLLMBenchmark_d1bc28 = window.GarminLLMBenchmark_d1bc28 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
/* Variant → style map */
const BADGE_STYLES = {
  /* Semantic status */
  success: {
    bg: 'hsl(160 84% 39% / 0.12)',
    color: 'hsl(160 70% 28%)',
    border: '1px solid hsl(160 84% 39% / 0.3)'
  },
  warning: {
    bg: 'hsl(38 92% 50% / 0.12)',
    color: 'hsl(38 80% 32%)',
    border: '1px solid hsl(38 92% 50% / 0.3)'
  },
  error: {
    bg: 'hsl(0 84% 60% / 0.12)',
    color: 'hsl(0 72% 42%)',
    border: '1px solid hsl(0 84% 60% / 0.3)'
  },
  pending: {
    bg: 'hsl(var(--primary) / 0.1)',
    color: 'hsl(var(--primary))',
    border: '1px solid hsl(var(--primary) / 0.3)'
  },
  /* Model source */
  builtin: {
    bg: 'hsl(var(--model-builtin-soft))',
    color: 'hsl(var(--model-builtin))',
    border: 'none'
  },
  custom: {
    bg: 'hsl(var(--model-custom-soft))',
    color: 'hsl(var(--model-custom))',
    border: 'none'
  },
  /* Score bands */
  'score-high': {
    bg: 'hsl(160 84% 39% / 0.1)',
    color: 'hsl(160 70% 30%)',
    border: 'none'
  },
  'score-mid': {
    bg: 'hsl(38 92% 50% / 0.1)',
    color: 'hsl(38 80% 32%)',
    border: 'none'
  },
  'score-low': {
    bg: 'hsl(0 84% 60% / 0.1)',
    color: 'hsl(0 72% 42%)',
    border: 'none'
  },
  /* Capability chips */
  grounding: {
    bg: 'hsl(243 80% 60% / 0.1)',
    color: 'hsl(243 75% 45%)',
    border: 'none'
  },
  ocr: {
    bg: 'hsl(195 80% 50% / 0.1)',
    color: 'hsl(195 80% 30%)',
    border: 'none'
  },
  detection: {
    bg: 'hsl(160 60% 40% / 0.1)',
    color: 'hsl(160 60% 28%)',
    border: 'none'
  },
  vlm: {
    bg: 'hsl(270 60% 55% / 0.1)',
    color: 'hsl(270 60% 38%)',
    border: 'none'
  },
  /* Default */
  default: {
    bg: 'hsl(var(--secondary))',
    color: 'hsl(var(--muted-foreground))',
    border: '1px solid hsl(var(--border))'
  }
};

/**
 * Inline label for status, model source, capabilities, and score bands.
 */
function Badge({
  children,
  variant = 'default',
  dot = false,
  pill = true
}) {
  const styles = BADGE_STYLES[variant] || BADGE_STYLES.default;
  return React.createElement('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: pill ? '2px 8px' : '1px 6px',
      borderRadius: pill ? 'var(--radius-full)' : 'var(--radius-sm)',
      fontSize: '0.6875rem',
      fontWeight: '500',
      fontFamily: 'var(--font-mono)',
      lineHeight: '1.4',
      background: styles.bg,
      color: styles.color,
      border: styles.border,
      whiteSpace: 'nowrap',
      flexShrink: 0
    }
  }, dot && React.createElement('span', {
    style: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: 'currentColor',
      opacity: 0.7,
      flexShrink: 0
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const VARIANTS = {
  primary: {
    bg: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
    border: 'none'
  },
  secondary: {
    bg: 'hsl(var(--secondary))',
    color: 'hsl(var(--foreground))',
    border: '1px solid hsl(var(--border))'
  },
  outline: {
    bg: 'transparent',
    color: 'hsl(var(--primary))',
    border: '1px solid hsl(var(--primary))'
  },
  ghost: {
    bg: 'transparent',
    color: 'hsl(var(--foreground))',
    border: 'none'
  },
  destructive: {
    bg: 'hsl(var(--destructive))',
    color: 'hsl(var(--destructive-foreground))',
    border: 'none'
  }
};
const SIZES = {
  sm: {
    padding: '5px 12px',
    fontSize: '0.75rem',
    height: '30px'
  },
  md: {
    padding: '7px 16px',
    fontSize: '0.875rem',
    height: '36px'
  },
  lg: {
    padding: '9px 24px',
    fontSize: '0.875rem',
    height: '42px',
    fontWeight: '600'
  }
};

/**
 * Primary interaction element. Uses font-mono like the app's action buttons.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  style: extraStyle = {}
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;
  return React.createElement('button', {
    type,
    onClick,
    disabled: isDisabled,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      fontFamily: 'var(--font-mono)',
      fontWeight: s.fontWeight || '500',
      borderRadius: 'var(--radius-md)',
      border: v.border,
      background: v.bg,
      color: v.color,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.4 : 1,
      transition: 'all var(--duration-base) var(--ease-smooth)',
      outline: 'none',
      lineHeight: '1',
      whiteSpace: 'nowrap',
      ...s,
      height: undefined,
      minHeight: s.height,
      ...extraStyle
    }
  }, loading ? React.createElement(React.Fragment, null, React.createElement('span', {
    style: {
      width: 14,
      height: 14,
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'spin 0.6s linear infinite'
    }
  }), children) : children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/MetricCard.jsx
try { (() => {
/**
 * Metric display card with three states: loading (skeleton), empty (dash), data.
 * Mirrors the MetricCard pattern established in the benchmark frontend notes.
 */
function MetricCard({
  label,
  value,
  unit,
  status = 'normal',
  loading = false,
  trend
}) {
  const base = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius-md)',
    padding: '12px',
    boxShadow: 'var(--shadow-sm)',
    transition: 'background var(--duration-base) var(--ease-smooth)',
    position: 'relative',
    overflow: 'hidden'
  };
  const statusLeftBorder = {
    normal: undefined,
    warning: '3px solid hsl(var(--warning))',
    error: '3px solid hsl(var(--destructive))',
    active: '3px solid hsl(var(--primary))'
  };

  /* ── Loading state ── */
  if (loading) {
    return React.createElement('div', {
      style: base
    }, React.createElement('div', {
      className: 'skeleton-shimmer',
      style: {
        width: '60%',
        height: '10px',
        marginBottom: '8px'
      }
    }), React.createElement('div', {
      className: 'skeleton-shimmer',
      style: {
        width: '40%',
        height: '22px'
      }
    }));
  }

  /* ── Empty / error state ── */
  if (value === undefined || value === null) {
    return React.createElement('div', {
      style: base
    }, React.createElement('span', {
      style: {
        color: 'hsl(var(--muted-foreground))',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)'
      }
    }, '—'));
  }

  /* ── Data state ── */
  const leftBorderStyle = statusLeftBorder[status] ? {
    borderLeft: statusLeftBorder[status],
    paddingLeft: '9px'
  } : {};
  return React.createElement('div', {
    style: {
      ...base,
      ...leftBorderStyle,
      cursor: 'default'
    },
    className: 'hover-lift'
  }, React.createElement('p', {
    style: {
      color: 'hsl(var(--muted-foreground))',
      fontSize: 'var(--text-xs)',
      marginBottom: '4px',
      fontFamily: 'var(--font-sans)'
    }
  }, label), React.createElement('p', {
    style: {
      color: 'hsl(var(--foreground))',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-lg)',
      fontWeight: '700',
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1.2,
      display: 'flex',
      alignItems: 'baseline',
      gap: '3px'
    }
  }, String(value), unit && React.createElement('span', {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: '400',
      color: 'hsl(var(--muted-foreground))'
    }
  }, unit)), /* Mini sparkline */
  trend && trend.length >= 2 && React.createElement('svg', {
    width: '48',
    height: '16',
    viewBox: `0 0 48 16`,
    style: {
      position: 'absolute',
      bottom: '10px',
      right: '12px',
      opacity: 0.5
    }
  }, React.createElement('polyline', {
    points: trend.map((v, i) => {
      const max = Math.max(...trend);
      const min = Math.min(...trend);
      const range = max - min || 1;
      const x = i / (trend.length - 1) * 48;
      const y = 16 - (v - min) / range * 14;
      return `${x},${y}`;
    }).join(' '),
    fill: 'none',
    stroke: 'hsl(var(--primary))',
    strokeWidth: '1.5',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  })));
}
Object.assign(__ds_scope, { MetricCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/MetricCard.jsx", error: String((e && e.message) || e) }); }

// components/core/ModelChip.jsx
try { (() => {
/**
 * Model selector chip — matches the BenchmarkModelsCard chip from the app.
 * Left toggle zone enables/disables. Clicking the right info zone expands a
 * detail panel (API endpoint, size, context length, provider, doc link).
 * Custom models show a color accent on the left border.
 */
function ModelChip({
  label,
  name,
  kind = 'builtin',
  enabled = false,
  modelType = 'LLM',
  onToggle,
  accentColor,
  details
}) {
  const [hovered, setHovered] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const hasDetails = Array.isArray(details) && details.length > 0;
  const outer = {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '12px',
    overflow: 'hidden',
    minWidth: '170px',
    maxWidth: open ? '300px' : '280px',
    transition: 'transform 0.18s var(--ease-spring), box-shadow 0.18s var(--ease-smooth)',
    transform: hovered && !open ? 'translateY(-2px)' : 'none',
    boxShadow: open ? 'var(--shadow-md)' : hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
    border: enabled ? `2px solid hsl(var(--primary))` : `2px solid hsl(var(--border))`,
    background: enabled ? 'hsl(var(--primary) / 0.05)' : 'hsl(var(--card))',
    opacity: enabled ? 1 : 0.78,
    alignSelf: 'flex-start',
    ...(kind === 'custom' && accentColor ? {
      borderLeftColor: accentColor,
      borderLeftWidth: '3px'
    } : {})
  };
  const row = {
    display: 'flex',
    alignItems: 'stretch',
    height: '72px'
  };
  const toggleZone = {
    width: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRight: `1px solid ${enabled ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--border))'}`,
    background: enabled ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--secondary))',
    flexShrink: 0,
    transition: 'background var(--duration-fast) var(--ease-smooth)'
  };
  const checkBox = {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: `2px solid ${enabled ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}`,
    background: enabled ? 'hsl(var(--primary))' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--duration-fast) var(--ease-smooth)'
  };
  return React.createElement('div', {
    style: outer,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false)
  }, React.createElement('div', {
    style: row
  }, /* Toggle zone */
  React.createElement('div', {
    onClick: onToggle,
    style: toggleZone,
    role: 'checkbox',
    'aria-checked': enabled,
    tabIndex: 0
  }, React.createElement('div', {
    style: checkBox
  }, enabled && React.createElement('svg', {
    width: 12,
    height: 12,
    viewBox: '0 0 12 12',
    fill: 'none'
  }, React.createElement('path', {
    d: 'M2 6l3 3 5-5',
    stroke: 'hsl(var(--primary-foreground))',
    strokeWidth: '2.5',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  })))), /* Info zone — click to expand */
  React.createElement('div', {
    onClick: hasDetails ? () => setOpen(o => !o) : undefined,
    title: hasDetails ? '點擊查看模型細節' : undefined,
    style: {
      flex: 1,
      padding: '8px 10px 8px 12px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '2px',
      minWidth: 0,
      cursor: hasDetails ? 'pointer' : 'default',
      background: open ? 'hsl(var(--accent) / 0.4)' : 'transparent',
      transition: 'background var(--duration-fast) var(--ease-smooth)'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '2px'
    }
  }, React.createElement('span', {
    style: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: enabled ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, label), React.createElement('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '3px',
      padding: '1px 6px',
      borderRadius: '4px',
      fontSize: '0.625rem',
      fontWeight: '500',
      fontFamily: 'var(--font-mono)',
      background: kind === 'builtin' ? 'hsl(var(--model-builtin-soft))' : 'hsl(var(--model-custom-soft))',
      color: kind === 'builtin' ? 'hsl(var(--model-builtin))' : 'hsl(var(--model-custom))',
      flexShrink: 0
    }
  }, React.createElement('span', {
    style: {
      width: '5px',
      height: '5px',
      borderRadius: '50%',
      background: 'currentColor',
      opacity: 0.7
    }
  }), kind === 'builtin' ? 'Builtin' : 'Custom')), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      minWidth: 0
    }
  }, React.createElement('span', {
    style: {
      fontSize: '0.75rem',
      color: 'hsl(var(--muted-foreground))',
      fontFamily: 'var(--font-mono)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      flex: 1
    }
  }, name || modelType), hasDetails && React.createElement('svg', {
    width: 12,
    height: 12,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'hsl(var(--muted-foreground))',
    strokeWidth: 2,
    style: {
      flexShrink: 0,
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'transform var(--duration-base) var(--ease-smooth)'
    }
  }, React.createElement('polyline', {
    points: '6 9 12 15 18 9'
  }))))), /* Detail panel */
  hasDetails && open && React.createElement('div', {
    className: 'animate-fade-in',
    style: {
      borderTop: '1px solid hsl(var(--border))',
      padding: '9px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      background: 'hsl(var(--secondary) / 0.5)'
    }
  }, details.map((d, i) => React.createElement('div', {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '8px',
      fontSize: '0.6875rem',
      fontFamily: 'var(--font-mono)'
    }
  }, React.createElement('span', {
    style: {
      color: 'hsl(var(--muted-foreground))',
      flexShrink: 0,
      minWidth: '54px'
    }
  }, d.label), d.href ? React.createElement('a', {
    href: d.href,
    target: '_blank',
    rel: 'noreferrer',
    onClick: e => e.stopPropagation(),
    style: {
      color: 'hsl(var(--primary))',
      textDecoration: 'none',
      wordBreak: 'break-all',
      borderBottom: '1px solid hsl(var(--primary) / 0.3)'
    }
  }, d.value) : React.createElement('span', {
    style: {
      color: 'hsl(var(--foreground))',
      wordBreak: 'break-all',
      fontWeight: 500
    }
  }, d.value)))));
}
Object.assign(__ds_scope, { ModelChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ModelChip.jsx", error: String((e && e.message) || e) }); }

// components/core/Progress.jsx
try { (() => {
/**
 * Animated horizontal progress bar with semantic color variants.
 */
function Progress({
  value = 0,
  max = 100,
  variant = 'default',
  height = 6,
  animated = true
}) {
  const pct = Math.min(Math.max(value / max * 100, 0), 100);
  const FILL_COLORS = {
    default: 'hsl(var(--primary))',
    success: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))',
    destructive: 'hsl(var(--destructive))',
    'score-high': 'hsl(var(--score-high))',
    'score-mid': 'hsl(var(--score-mid))',
    'score-low': 'hsl(var(--score-low))'
  };
  return React.createElement('div', {
    role: 'progressbar',
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    style: {
      width: '100%',
      height: `${height}px`,
      background: 'hsl(var(--secondary))',
      borderRadius: 'var(--radius-full)',
      overflow: 'hidden'
    }
  }, React.createElement('div', {
    className: animated ? 'animate-bar-grow' : '',
    style: {
      width: `${pct}%`,
      height: '100%',
      background: FILL_COLORS[variant] || FILL_COLORS.default,
      borderRadius: 'var(--radius-full)',
      transition: 'width 0.5s var(--ease-spring)'
    }
  }));
}
Object.assign(__ds_scope, { Progress });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Progress.jsx", error: String((e && e.message) || e) }); }

// handoff/reference/data.js
try { (() => {
/* ════════════════════════════════════════════════════════════════
   Garmin LLM/VLM Benchmark — demo data
   Exposes window.BM = { models, projects, results, cases, history, … }
   ════════════════════════════════════════════════════════════════ */
(function () {
  /* ── MODELS (with click-to-expand detail rows) ──────────────────── */
  const INIT_MODELS = [{
    id: 'llm_large',
    label: 'LLM Large',
    name: 'qwen3-72b',
    kind: 'builtin',
    type: 'LLM',
    enabled: true,
    details: [{
      label: '端點',
      value: 'infer.garmin.io/v1/llm-large',
      href: 'http://infer.garmin.io/v1/llm-large'
    }, {
      label: '參數量',
      value: '72B'
    }, {
      label: '內容長度',
      value: '32,768 tokens'
    }, {
      label: '供應',
      value: 'Qwen3 · 自架 vLLM'
    }, {
      label: '模型卡',
      value: '查看文件',
      href: 'https://qwenlm.github.io/'
    }]
  }, {
    id: 'llm_small',
    label: 'LLM Small',
    name: 'qwen3-14b',
    kind: 'builtin',
    type: 'LLM',
    enabled: true,
    details: [{
      label: '端點',
      value: 'infer.garmin.io/v1/llm-small',
      href: 'http://infer.garmin.io/v1/llm-small'
    }, {
      label: '參數量',
      value: '14B'
    }, {
      label: '內容長度',
      value: '32,768 tokens'
    }, {
      label: '供應',
      value: 'Qwen3 · 自架 vLLM'
    }, {
      label: '模型卡',
      value: '查看文件',
      href: 'https://qwenlm.github.io/'
    }]
  }, {
    id: 'vlm_large',
    label: 'VLM Large',
    name: 'qwen-vl-72b',
    kind: 'builtin',
    type: 'VLM',
    enabled: false,
    details: [{
      label: '端點',
      value: 'infer.garmin.io/v1/vlm-large',
      href: 'http://infer.garmin.io/v1/vlm-large'
    }, {
      label: '參數量',
      value: '72B'
    }, {
      label: '解析度',
      value: '最高 1280×1280'
    }, {
      label: '供應',
      value: 'Qwen2.5-VL · 自架'
    }, {
      label: '模型卡',
      value: '查看文件',
      href: 'https://qwenlm.github.io/'
    }]
  }, {
    id: 'vlm_small',
    label: 'VLM Small',
    name: 'qwen-vl-7b',
    kind: 'builtin',
    type: 'VLM',
    enabled: false,
    details: [{
      label: '端點',
      value: 'infer.garmin.io/v1/vlm-small',
      href: 'http://infer.garmin.io/v1/vlm-small'
    }, {
      label: '參數量',
      value: '7B'
    }, {
      label: '解析度',
      value: '最高 896×896'
    }, {
      label: '供應',
      value: 'Qwen2.5-VL · 自架'
    }, {
      label: '模型卡',
      value: '查看文件',
      href: 'https://qwenlm.github.io/'
    }]
  }, {
    id: 'custom_1',
    label: 'Llama3-8B',
    name: 'Llama-3-8B',
    kind: 'custom',
    type: 'LLM',
    enabled: false,
    color: '#14b8a6',
    details: [{
      label: '端點',
      value: '10.0.4.27:8000/v1',
      href: 'http://10.0.4.27:8000/v1'
    }, {
      label: '參數量',
      value: '8B'
    }, {
      label: '內容長度',
      value: '8,192 tokens'
    }, {
      label: '供應',
      value: '使用者上傳 · 2026-06-12'
    }, {
      label: '權重',
      value: 'meta-llama/Llama-3-8B',
      href: 'https://huggingface.co/meta-llama'
    }]
  }];

  /* ── PROJECTS ───────────────────────────────────────────────────── */
  const LLM_PROJECTS = [{
    name: 'general_qa',
    label: '通用問答',
    cap: 'Text Gen',
    est: 5,
    type: 'LLM'
  }, {
    name: 'code_review',
    label: '程式碼審查',
    cap: 'Code',
    est: 8,
    type: 'LLM'
  }, {
    name: 'translation',
    label: '中英翻譯',
    cap: 'Translation',
    est: 4,
    type: 'LLM'
  }];
  const VLM_PROJECTS = [{
    name: 'flame_detect',
    label: '影像辨識（是非）',
    cap: 'Recognition',
    est: 6,
    type: 'VLM',
    vlmType: 'recognition'
  }, {
    name: 'serial_ocr',
    label: '裝置序號 OCR',
    cap: 'OCR',
    est: 5,
    type: 'VLM',
    vlmType: 'ocr'
  }, {
    name: 'part_locate',
    label: '零件定位（Grounding）',
    cap: 'Grounding',
    est: 15,
    type: 'VLM',
    vlmType: 'locate'
  }];

  /* ── HEADLINE RESULTS ───────────────────────────────────────────── */
  const RESULTS = {
    general_qa: {
      llm_large: {
        score: .881,
        wins: 2,
        total: 4,
        regressions: 1
      },
      llm_small: {
        score: .746,
        wins: 2,
        total: 4,
        regressions: 0
      }
    },
    code_review: {
      llm_large: {
        score: .871,
        wins: 13,
        total: 18,
        regressions: 2
      },
      llm_small: {
        score: .634,
        wins: 5,
        total: 18,
        regressions: 0
      }
    },
    translation: {
      llm_large: {
        score: .956,
        wins: 20,
        total: 24,
        regressions: 0
      },
      llm_small: {
        score: .812,
        wins: 4,
        total: 24,
        regressions: 0
      }
    },
    flame_detect: {
      vlm_large: {
        score: .92,
        acc: .92,
        correct: 23,
        total: 25,
        regressions: 1
      },
      vlm_small: {
        score: .84,
        acc: .84,
        correct: 21,
        total: 25,
        regressions: 0
      }
    },
    serial_ocr: {
      vlm_large: {
        score: .97,
        acc: .97,
        correct: 29,
        total: 30,
        regressions: 0
      },
      vlm_small: {
        score: .88,
        acc: .88,
        correct: 26,
        total: 30,
        regressions: 0
      }
    },
    part_locate: {
      vlm_large: {
        score: .86,
        iou: .86,
        regressions: 0
      },
      vlm_small: {
        score: .49,
        iou: .49,
        regressions: 1
      }
    }
  };

  /* ── LLM PER-CASE DETAIL ────────────────────────────────────────── */
  const CASES_GQA = [{
    id: 1,
    question: '如何修改 Garmin 裝置的語言設定？',
    gt: '前往「設定」→「系統」→「語言」，選擇語言後重新啟動裝置。',
    tags: ['設定操作'],
    models: {
      llm_large: {
        pass: true,
        score: 4.5,
        answer: '請至 Garmin Connect App，進入裝置管理，點擊「設定」→「系統」→「語言」，配對後裝置將自動同步語言偏好。',
        reasoning: '答案完整描述操作路徑，涵蓋 App 入口及裝置設定路徑，用語清晰。扣分原因：未提及「重啟裝置」步驟（-0.5）。最終評分 4.5/5。'
      },
      llm_small: {
        pass: false,
        score: 1.8,
        answer: '語言設定在系統選單裡面，您可以直接更改。',
        reasoning: '答案過於簡略，僅指出方向但缺乏具體步驟，使用者難以依此操作。最終評分 1.8/5。'
      }
    }
  }, {
    id: 2,
    question: '心率監測不準確時如何校正？',
    gt: '保持手腕清潔、手環貼緊皮膚，避免運動後立即量測。若持續不準，可在 Garmin Connect 感測器設定執行重新校正。',
    tags: ['感測器', '健康數據'],
    models: {
      llm_large: {
        pass: true,
        score: 4.0,
        answer: '確保手環貼緊手腕，清潔皮膚後重新配戴，避免配戴過鬆。運動後請靜候 5 分鐘再量測。',
        reasoning: '正確提及配戴方式與運動後等待時間，但未提及 Garmin Connect 重新校正選項（-1.0）。最終評分 4.0/5。'
      },
      llm_small: {
        pass: true,
        score: 4.2,
        answer: '請確認手環是否貼緊手腕，並在 Garmin Connect 感測器設定中選擇「心率感測器校正」依步驟操作。',
        reasoning: '本題 LLM Small 表現優於 LLM Large，明確提及 Garmin Connect 校正功能，資訊更完整（+0.2）。最終評分 4.2/5。'
      }
    }
  }, {
    id: 3,
    question: '藍牙已開啟但同步仍失敗，下一步如何排除？',
    gt: '在手機藍牙設定中刪除裝置後重新配對。若仍失敗，清除 Garmin Connect App 快取或重新安裝。',
    tags: ['故障排除', '邊緣案件'],
    models: {
      llm_large: {
        pass: false,
        score: 1.9,
        answer: '請重新啟動手機藍牙，靠近裝置後重新嘗試同步。',
        reasoning: '⚠ Regression：LLM Large 僅重複了已確認無效的基礎步驟（重啟藍牙），未提供進階排除方案。對「藍牙已開啟仍失敗」的情境，此回答完全不足。最終評分 1.9/5。'
      },
      llm_small: {
        pass: true,
        score: 4.5,
        answer: '若藍牙已開啟仍無法同步，請在手機藍牙設定刪除裝置後重新配對。若問題持續，清除 Garmin Connect 快取（設定→應用程式→Garmin Connect→清除快取）或重新安裝。',
        reasoning: 'LLM Small 正確理解問題脈絡（藍牙已開啟），提供有效的進階排除步驟與具體路徑，是本題明顯更優的回答。最終評分 4.5/5。'
      }
    }
  }, {
    id: 4,
    question: '如何設定每日步數目標？',
    gt: '在 Garmin Connect App 進入「更多」→「健身統計」→「目標」→「步數目標」，輸入每日目標。',
    tags: ['設定操作'],
    models: {
      llm_large: {
        pass: true,
        score: 4.1,
        answer: '在 Garmin Connect App 底部點擊「更多」→「目標」→「每日步數」，輸入目標後儲存。',
        reasoning: '路徑描述正確且實用，稍有簡化但使用者可依此找到設定頁面。最終評分 4.1/5。'
      },
      llm_small: {
        pass: false,
        score: 1.4,
        answer: '您可以在 Garmin Connect App 設定步數目標。',
        reasoning: '回答極度簡略，未提供任何導航路徑，對使用者毫無幫助。最終評分 1.4/5。'
      }
    }
  }];
  const CASES_CODE = [{
    id: 1,
    question: '審查此函式的記憶體洩漏風險（C，malloc 後缺少 free）',
    gt: '指出未釋放的 buffer，建議在所有 return 路徑前 free，或改用 RAII / cleanup goto。',
    tags: ['記憶體', 'C'],
    models: {
      llm_large: {
        pass: true,
        score: 4.6,
        answer: '第 14 行 malloc 配置的 buf 在 error 分支提前 return，未被釋放，造成洩漏。建議使用 `goto cleanup;` 統一釋放，或在每個 return 前加上 free(buf)。',
        reasoning: '準確定位洩漏行號與錯誤分支，並給出兩種慣用修法。最終評分 4.6/5。'
      },
      llm_small: {
        pass: false,
        score: 2.1,
        answer: '程式碼看起來沒有明顯問題，記得釋放記憶體即可。',
        reasoning: '未指出具體洩漏位置，泛泛而談，無法協助修正。最終評分 2.1/5。'
      }
    }
  }, {
    id: 2,
    question: '此 SQL 查詢是否有注入風險？',
    gt: '字串拼接使用者輸入存在 SQL injection，應改用參數化查詢 / prepared statement。',
    tags: ['安全', 'SQL', '邊緣案件'],
    models: {
      llm_large: {
        pass: false,
        score: 2.4,
        answer: '查詢邏輯正確，效能上可加索引以加速。',
        reasoning: '⚠ Regression：完全忽略了明顯的字串拼接注入風險，僅談效能。安全審查嚴重失格。最終評分 2.4/5。'
      },
      llm_small: {
        pass: true,
        score: 4.3,
        answer: '第 8 行直接把 request.name 拼進 SQL 字串，有注入風險。請改用參數化查詢（`cursor.execute(sql, (name,))`）。',
        reasoning: '正確識別注入點並給出參數化修法，安全意識佳。最終評分 4.3/5。'
      }
    }
  }, {
    id: 3,
    question: '這段 React useEffect 為何造成無限重繪？',
    gt: '依賴陣列遺漏 / 物件每次新建導致 effect 反覆觸發，應 memo 化或修正依賴。',
    tags: ['React', '邊緣案件'],
    models: {
      llm_large: {
        pass: false,
        score: 2.0,
        answer: '把 useEffect 移到 component 外層就好了。',
        reasoning: '⚠ Regression：建議在語法上不可行（Hook 不可移出元件），且未指出真正成因（依賴物件每次重建）。最終評分 2.0/5。'
      },
      llm_small: {
        pass: true,
        score: 4.0,
        answer: 'options 物件在每次 render 都重新建立，作為依賴使 effect 每次都觸發。請用 useMemo 包住 options 或改用其原始值作依賴。',
        reasoning: '正確診斷重建依賴問題並給出 useMemo 修法。最終評分 4.0/5。'
      }
    }
  }];
  const CASES_TRANS = [{
    id: 1,
    question: '翻譯：「請在配對前確認裝置韌體已更新至最新版本。」',
    gt: 'Please ensure the device firmware is updated to the latest version before pairing.',
    tags: ['術語'],
    models: {
      llm_large: {
        pass: true,
        score: 4.8,
        answer: 'Please make sure the device firmware is updated to the latest version before pairing.',
        reasoning: '語意精準、術語（firmware / pairing）正確，語氣自然。最終評分 4.8/5。'
      },
      llm_small: {
        pass: true,
        score: 3.9,
        answer: 'Please confirm the device software is newest before connecting.',
        reasoning: '語意可懂但術語不精確（software vs firmware、newest 用詞生硬）。最終評分 3.9/5。'
      }
    }
  }, {
    id: 2,
    question: '翻譯：「血氧感測器在高海拔環境下讀數可能偏低。」',
    gt: 'Pulse Ox readings may be lower at high altitude.',
    tags: ['術語', '健康數據'],
    models: {
      llm_large: {
        pass: true,
        score: 4.7,
        answer: 'Pulse Ox readings may read lower in high-altitude environments.',
        reasoning: '正確使用 Garmin 官方術語 Pulse Ox，語句通順。最終評分 4.7/5。'
      },
      llm_small: {
        pass: false,
        score: 2.6,
        answer: 'The blood oxygen sensor number maybe low when you are high place.',
        reasoning: '文法錯誤（maybe / high place），且未使用標準術語。最終評分 2.6/5。'
      }
    }
  }];

  /* ── VLM PER-CASE DETAIL ────────────────────────────────────────── */
  /* recognition: whole-match yes/no after lower-case normalization      */
  const CASES_FLAME = [{
    id: 1,
    task: 'recognition',
    question: '影像中是否出現明火 / 火焰？',
    expected: 'yes',
    tags: ['是非題'],
    models: {
      vlm_large: {
        response: 'Yes',
        pass: true
      },
      vlm_small: {
        response: 'yes',
        pass: true
      }
    }
  }, {
    id: 2,
    task: 'recognition',
    question: '裝置外殼是否有可見裂痕？',
    expected: 'no',
    tags: ['是非題'],
    models: {
      vlm_large: {
        response: 'No',
        pass: true
      },
      vlm_small: {
        response: 'NO',
        pass: true
      }
    }
  }, {
    id: 3,
    task: 'recognition',
    question: '影像中是否有水損痕跡（水漬 / 鏽蝕）？',
    expected: 'yes',
    tags: ['是非題', '邊緣案件'],
    models: {
      vlm_large: {
        response: 'No',
        pass: false
      },
      vlm_small: {
        response: 'Yes',
        pass: true
      }
    }
  }, {
    id: 4,
    task: 'recognition',
    question: '電池是否有膨脹變形？',
    expected: 'yes',
    tags: ['是非題'],
    models: {
      vlm_large: {
        response: 'Yes',
        pass: true
      },
      vlm_small: {
        response: 'No',
        pass: false
      }
    }
  }];
  /* ocr: exact match after uppercase + strip of separators              */
  const CASES_OCR = [{
    id: 1,
    task: 'ocr',
    question: '讀取機背序號標籤',
    expected: 'GRM7X428841',
    tags: ['OCR'],
    models: {
      vlm_large: {
        response: 'GRM-7X42-8841',
        pass: true
      },
      vlm_small: {
        response: 'grm-7x42-8841',
        pass: true
      }
    }
  }, {
    id: 2,
    task: 'ocr',
    question: '讀取充電座型號',
    expected: 'DCB10EU',
    tags: ['OCR'],
    models: {
      vlm_large: {
        response: 'DCB10-EU',
        pass: true
      },
      vlm_small: {
        response: 'DCBI0-EU',
        pass: false
      }
    }
  }, {
    id: 3,
    task: 'ocr',
    question: '讀取電池規格標籤',
    expected: '380MAH37V',
    tags: ['OCR', '邊緣案件'],
    models: {
      vlm_large: {
        response: '380mAh 3.7V',
        pass: true
      },
      vlm_small: {
        response: '380mAh 37V',
        pass: false
      }
    }
  }];
  /* locate: bbox grounding scored by IoU. boxes are pixel [x,y,w,h]      */
  const CASES_LOC = [{
    id: 1,
    task: 'locate',
    question: '請定位主機板上的電池接點 (battery connector)',
    img: {
      w: 640,
      h: 480
    },
    gt: [210, 150, 180, 96],
    tags: ['Grounding'],
    models: {
      vlm_large: {
        box: [219, 158, 170, 86],
        iou: .86,
        pass: true,
        note: '框選準確，輕微外擴'
      },
      vlm_small: {
        box: [150, 118, 150, 150],
        iou: .41,
        pass: false,
        note: '框過大且左偏，誤含周邊元件'
      }
    }
  }, {
    id: 2,
    task: 'locate',
    question: '請定位螢幕排線接頭 (display FPC connector)',
    img: {
      w: 640,
      h: 480
    },
    gt: [300, 250, 120, 70],
    tags: ['Grounding', '邊緣案件'],
    models: {
      vlm_large: {
        box: [296, 244, 128, 80],
        iou: .79,
        pass: true,
        note: '準確涵蓋接頭範圍'
      },
      vlm_small: {
        box: [330, 270, 150, 110],
        iou: .38,
        pass: false,
        note: '整體右下偏移，超出接頭'
      }
    }
  }];
  const CASES_BY_PROJECT = {
    general_qa: CASES_GQA,
    code_review: CASES_CODE,
    translation: CASES_TRANS,
    flame_detect: CASES_FLAME,
    serial_ocr: CASES_OCR,
    part_locate: CASES_LOC
  };

  /* ── HISTORY ────────────────────────────────────────────────────── */
  const LLM_METHODS = {
    llm_judge: {
      label: 'LLM-as-Judge',
      tone: 'builtin',
      desc: '以 LLM Large 當裁判，逐題給 0–5 分並附評語'
    },
    ragas: {
      label: 'RAGAS',
      tone: 'custom',
      desc: 'faithfulness · answer-relevancy · context-precision 綜合分'
    },
    deepeval: {
      label: 'DeepEval',
      tone: 'primary',
      desc: 'G-Eval + DAG 自訂指標，可寫單元測試式斷言',
      badge: '評估中',
      href: 'https://github.com/confident-ai/deepeval'
    }
  };
  /* task label lookup (history detail shows per-task breakdown) */
  const TASK_LABELS = {
    general_qa: '通用問答',
    code_review: '程式碼審查',
    translation: '中英翻譯',
    flame_detect: '影像辨識',
    serial_ocr: '序號 OCR',
    part_locate: '零件定位'
  };
  /* VLM history metrics — recognition/OCR are accuracy; grounding is mean IoU */
  const VLM_METRICS = [{
    key: 'recog',
    label: '影像辨識',
    unit: 'accuracy',
    hint: 'whole-match · output == expected'
  }, {
    key: 'ocr',
    label: '序號 OCR',
    unit: 'accuracy',
    hint: '精確比對 · 正規化字串相等'
  }, {
    key: 'iou',
    label: '零件定位',
    unit: 'mean IoU',
    hint: 'grounding · 交集 / 聯集'
  }];

  /* HISTORY_LLM — each run records the exact set of models that ran (varies run
     to run: a model may be added or dropped), each with overall judge score,
     regression count, and per-task scores. */
  const HISTORY_LLM = [{
    ts: 'Jun 18 14:30',
    method: 'deepeval',
    scope: '3 任務 · 70 題',
    current: true,
    baseline: {
      ts: 'Jun 11 09:02',
      method: 'ragas'
    },
    models: [{
      id: 'llm_large',
      label: 'LLM Large',
      score: .881,
      reg: 1,
      tasks: [{
        key: 'general_qa',
        score: .85
      }, {
        key: 'code_review',
        score: .84
      }, {
        key: 'translation',
        score: .95
      }]
    }, {
      id: 'llm_small',
      label: 'LLM Small',
      score: .731,
      reg: 0,
      tasks: [{
        key: 'general_qa',
        score: .66
      }, {
        key: 'code_review',
        score: .63
      }, {
        key: 'translation',
        score: .90
      }]
    }, {
      id: 'custom_1',
      label: 'Llama3-8B',
      score: .802,
      reg: 0,
      isNew: true,
      tasks: [{
        key: 'general_qa',
        score: .78
      }, {
        key: 'code_review',
        score: .74
      }, {
        key: 'translation',
        score: .89
      }]
    }]
  }, {
    ts: 'Jun 11 09:02',
    method: 'ragas',
    scope: '3 任務 · 70 題',
    baseline: {
      ts: 'Jun 04 16:32',
      method: 'ragas'
    },
    models: [{
      id: 'llm_large',
      label: 'LLM Large',
      score: .842,
      reg: 0,
      tasks: [{
        key: 'general_qa',
        score: .83
      }, {
        key: 'code_review',
        score: .80
      }, {
        key: 'translation',
        score: .90
      }]
    }, {
      id: 'llm_small',
      label: 'LLM Small',
      score: .726,
      reg: 0,
      tasks: [{
        key: 'general_qa',
        score: .67
      }, {
        key: 'code_review',
        score: .62
      }, {
        key: 'translation',
        score: .89
      }]
    }]
  }, {
    ts: 'Jun 04 16:32',
    method: 'ragas',
    scope: '3 任務 · 68 題',
    baseline: {
      ts: 'May 28 10:11',
      method: 'llm_judge'
    },
    models: [{
      id: 'llm_large',
      label: 'LLM Large',
      score: .836,
      reg: 2,
      tasks: [{
        key: 'general_qa',
        score: .82
      }, {
        key: 'code_review',
        score: .79
      }, {
        key: 'translation',
        score: .90
      }]
    }, {
      id: 'llm_small',
      label: 'LLM Small',
      score: .704,
      reg: 0,
      tasks: [{
        key: 'general_qa',
        score: .65
      }, {
        key: 'code_review',
        score: .60
      }, {
        key: 'translation',
        score: .86
      }]
    }]
  }, {
    ts: 'May 28 10:11',
    method: 'llm_judge',
    scope: '2 任務 · 52 題',
    baseline: {
      ts: 'May 21 09:40',
      method: 'llm_judge'
    },
    models: [{
      id: 'llm_large',
      label: 'LLM Large',
      score: .808,
      reg: 1,
      tasks: [{
        key: 'general_qa',
        score: .81
      }, {
        key: 'code_review',
        score: .76
      }]
    }, {
      id: 'llm_small',
      label: 'LLM Small',
      score: .688,
      reg: 0,
      tasks: [{
        key: 'general_qa',
        score: .70
      }, {
        key: 'code_review',
        score: .67
      }]
    }]
  }, {
    ts: 'May 21 09:40',
    method: 'llm_judge',
    scope: '2 任務 · 52 題',
    baseline: null,
    models: [{
      id: 'llm_large',
      label: 'LLM Large',
      score: .791,
      reg: 0,
      tasks: [{
        key: 'general_qa',
        score: .80
      }, {
        key: 'code_review',
        score: .78
      }]
    }]
  }];

  /* HISTORY_VLM — per run, per model: recognition accuracy, OCR accuracy, and
     grounding mean IoU. Model set AND task set vary: grounding (part_locate) was
     added Jun 05; vlm_small joined the same run; iou:null = task not run. */
  const HISTORY_VLM = [{
    ts: 'Jun 18 11:00',
    scope: '3 任務 · 80 題',
    current: true,
    baseline: {
      ts: 'Jun 12 15:20'
    },
    models: [{
      id: 'vlm_large',
      label: 'VLM Large',
      recog: .92,
      ocr: .97,
      iou: .86,
      counts: {
        recog: [23, 25],
        ocr: [29, 30],
        iou: 2
      }
    }, {
      id: 'vlm_small',
      label: 'VLM Small',
      recog: .84,
      ocr: .88,
      iou: .49,
      counts: {
        recog: [21, 25],
        ocr: [26, 30],
        iou: 2
      }
    }]
  }, {
    ts: 'Jun 12 15:20',
    scope: '3 任務 · 80 題',
    baseline: {
      ts: 'Jun 05 09:30'
    },
    models: [{
      id: 'vlm_large',
      label: 'VLM Large',
      recog: .90,
      ocr: .95,
      iou: .81,
      counts: {
        recog: [22, 25],
        ocr: [28, 30],
        iou: 2
      }
    }, {
      id: 'vlm_small',
      label: 'VLM Small',
      recog: .82,
      ocr: .86,
      iou: .44,
      counts: {
        recog: [20, 25],
        ocr: [25, 30],
        iou: 2
      }
    }]
  }, {
    ts: 'Jun 05 09:30',
    scope: '3 任務 · 78 題',
    baseline: {
      ts: 'May 29 14:05'
    },
    models: [{
      id: 'vlm_large',
      label: 'VLM Large',
      recog: .88,
      ocr: .96,
      iou: .74,
      counts: {
        recog: [22, 25],
        ocr: [28, 30],
        iou: 2
      }
    }, {
      id: 'vlm_small',
      label: 'VLM Small',
      recog: .80,
      ocr: .90,
      iou: null,
      counts: {
        recog: [20, 25],
        ocr: [27, 30]
      }
    }]
  }, {
    ts: 'May 29 14:05',
    scope: '2 任務 · 55 題',
    baseline: null,
    models: [{
      id: 'vlm_large',
      label: 'VLM Large',
      recog: .86,
      ocr: .93,
      iou: null,
      counts: {
        recog: [21, 25],
        ocr: [28, 30]
      }
    }]
  }];

  /* ── SHARED CONSTANTS & HELPERS ─────────────────────────────────── */
  const STAGES = ['連接模型…', '載入測試案例…', '執行推論中…', '評分 / 比對中…', '完成！'];
  const MC = {
    llm_large: '#3b82f6',
    llm_small: '#60a5fa',
    vlm_large: '#a855f7',
    vlm_small: '#c084fc',
    custom_1: '#14b8a6'
  };
  const CAP_CLR = {
    'Text Gen': {
      bg: 'hsl(243 80% 60%/.1)',
      color: 'hsl(243 75% 40%)'
    },
    'Code': {
      bg: 'hsl(195 80% 50%/.1)',
      color: 'hsl(195 80% 30%)'
    },
    'Translation': {
      bg: 'hsl(340 70% 55%/.1)',
      color: 'hsl(340 70% 38%)'
    },
    'Recognition': {
      bg: 'hsl(160 60% 40%/.1)',
      color: 'hsl(160 60% 28%)'
    },
    'OCR': {
      bg: 'hsl(265 60% 55%/.12)',
      color: 'hsl(265 55% 45%)'
    },
    'Grounding': {
      bg: 'hsl(243 80% 60%/.1)',
      color: 'hsl(243 75% 40%)'
    }
  };
  const S = {
    card: {
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)'
    },
    mono: {
      fontFamily: 'var(--font-mono)'
    },
    muted: {
      color: 'hsl(var(--muted-foreground))'
    },
    lbl: {
      fontSize: 'var(--text-xs)',
      fontFamily: 'var(--font-mono)',
      color: 'hsl(var(--muted-foreground))'
    }
  };
  const sc = v => v >= .85 ? 'hsl(160 70% 28%)' : v >= .4 ? 'hsl(38 80% 30%)' : 'hsl(0 72% 38%)';
  const sb = v => v >= .85 ? 'hsl(var(--score-high))' : v >= .4 ? 'hsl(var(--score-mid))' : 'hsl(var(--score-low))';
  const isRegr = (c, bId, nId) => !!(c.models[bId]?.pass && !c.models[nId]?.pass);
  window.BM = {
    INIT_MODELS,
    LLM_PROJECTS,
    VLM_PROJECTS,
    RESULTS,
    CASES_BY_PROJECT,
    LLM_METHODS,
    HISTORY_LLM,
    HISTORY_VLM,
    VLM_METRICS,
    TASK_LABELS,
    STAGES,
    MC,
    CAP_CLR,
    S,
    sc,
    sb,
    isRegr
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "handoff/reference/data.js", error: String((e && e.message) || e) }); }

// handoff/reference/history.jsx
try { (() => {
/* ════════════════════════════════════════════════════════════════
   History — each run is an expandable row. Click to drill into every
   model that ran (the model set varies run to run: one may be added or
   dropped). LLM shows per-task judge scores; VLM shows recognition /
   OCR accuracy and grounding mean IoU.
   ════════════════════════════════════════════════════════════════ */
const {
  LLM_METHODS,
  HISTORY_LLM,
  HISTORY_VLM,
  VLM_METRICS,
  TASK_LABELS,
  MC
} = window.BM;
const H_S = window.BM.S,
  hsc = window.BM.sc,
  hsb = window.BM.sb;
const hmono = H_S.mono,
  hmuted = H_S.muted,
  hlbl = H_S.lbl,
  hcard = H_S.card;
function MethodBadge({
  method
}) {
  const m = LLM_METHODS[method];
  if (!m) return null;
  const tone = m.tone === 'primary' ? {
    bg: 'hsl(var(--primary)/.12)',
    fg: 'hsl(var(--primary))',
    bd: 'hsl(var(--primary)/.35)'
  } : m.tone === 'custom' ? {
    bg: 'hsl(var(--model-custom-soft))',
    fg: 'hsl(var(--model-custom))',
    bd: 'hsl(var(--model-custom)/.4)'
  } : {
    bg: 'hsl(var(--model-builtin-soft))',
    fg: 'hsl(var(--model-builtin))',
    bd: 'hsl(var(--border))'
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 9px',
      borderRadius: 'var(--radius-full)',
      ...hmono,
      fontSize: 10,
      fontWeight: 600,
      background: tone.bg,
      color: tone.fg,
      border: `1px solid ${tone.bd}`
    }
  }, m.label, m.badge && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      opacity: .8,
      fontWeight: 400
    }
  }, "\xB7 ", m.badge));
}

/* small colored model dot + label, used in the collapsed row */
function ModelDot({
  id,
  label,
  isNew
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      ...hmono,
      fontSize: 10,
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--secondary))',
      border: '1px solid hsl(var(--border))',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: 'hsl(var(--muted-foreground))',
      flexShrink: 0
    }
  }), label, isNew && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 8,
      fontWeight: 700,
      color: 'hsl(var(--model-custom))',
      background: 'hsl(var(--model-custom-soft))',
      padding: '0 4px',
      borderRadius: 3
    }
  }, "\u65B0\u589E"));
}

/* a thin score/metric bar with a value chip */
function MiniBar({
  value,
  width = null
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 60,
      height: 7,
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: value * 100 + '%',
      height: '100%',
      background: hsb(value),
      borderRadius: 'var(--radius-full)'
    }
  }));
}

/* delta vs a baseline value: ▲ up (green) / ▼ down (red) / ＝ flat / 新 if none */
function Delta({
  cur,
  base,
  w = 52
}) {
  if (base == null) return /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 9,
      fontWeight: 700,
      color: 'hsl(var(--model-custom))',
      width: w,
      textAlign: 'right',
      flexShrink: 0
    }
  }, "\u65B0\u589E");
  const d = cur - base,
    flat = Math.abs(d) < 0.005;
  const col = flat ? 'hsl(var(--muted-foreground))' : d > 0 ? 'hsl(160 70% 28%)' : 'hsl(0 72% 38%)';
  const arr = flat ? '＝' : d > 0 ? '▲' : '▼';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 9,
      fontWeight: 700,
      color: col,
      width: w,
      textAlign: 'right',
      flexShrink: 0,
      fontVariantNumeric: 'tabular-nums'
    }
  }, arr, flat ? '' : (Math.abs(d) * 100).toFixed(1));
}

/* "compared against" reference banner shown at the top of an expanded run */
function BaselineNote({
  baseline,
  methodLabel,
  comparable = true
}) {
  if (!baseline) return /*#__PURE__*/React.createElement("div", {
    style: {
      ...hmono,
      fontSize: 10,
      ...hlbl,
      margin: '9px 0 4px',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11
    }
  }, "\u25F7"), " \u9996\u6B21\u57F7\u884C \xB7 \u7121\u6BD4\u8F03\u57FA\u6E96");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...hmono,
      fontSize: 10,
      margin: '9px 0 4px',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      color: 'hsl(var(--muted-foreground))',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11
    }
  }, "\u21C4"), "\u6BD4\u8F03\u57FA\u6E96\uFF1A", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: 'hsl(var(--foreground))',
      padding: '1px 7px',
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--secondary))',
      border: '1px solid hsl(var(--border))'
    }
  }, baseline.ts, methodLabel ? ` · ${methodLabel}` : ''), comparable ? /*#__PURE__*/React.createElement("span", {
    style: {
      ...hlbl,
      fontSize: 9
    }
  }, "\uFF08\u540C\u4E00\u6A21\u578B\u9010\u984C\u6BD4\u8F03\uFF0C\u25B3 \u70BA\u8207\u57FA\u6E96\u5DEE\u8DDD\uFF09") : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 600,
      color: 'hsl(0 72% 38%)'
    }
  }, "\u8DE8\u8A55\u5206\u6CD5\uFF1A\u50C5\u6BD4\u8F03\u901A\u904E / \u9000\u6B65\uFF0C\u5206\u6578\u4E0D\u53EF\u76F4\u63A5\u76F8\u6E1B"));
}
const findRun = (list, ts) => ts ? list.find(r => r.ts === ts) : null;
const baseEntry = (run, id) => run ? run.models.find(m => m.id === id) : null;

/* expandable run shell shared by LLM + VLM */
function RunRow({
  open,
  onToggle,
  current,
  summary,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${current ? 'hsl(var(--primary)/.4)' : 'hsl(var(--border))'}`,
      background: current ? 'hsl(var(--primary)/.04)' : 'hsl(var(--secondary))',
      overflow: 'hidden',
      transition: 'border-color .15s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onToggle,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '9px 12px',
      cursor: 'pointer'
    }
  }, summary, /*#__PURE__*/React.createElement("svg", {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "hsl(var(--muted-foreground))",
    strokeWidth: 2,
    style: {
      flexShrink: 0,
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'transform .2s'
    }
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "6 9 12 15 18 9"
  }))), open && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 12px 12px',
      borderTop: '1px solid hsl(var(--border))'
    }
  }, children));
}
function HistoryPanel() {
  const [tab, setTab] = React.useState('LLM');
  const Tabs = /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'var(--radius-full)',
      overflow: 'hidden',
      background: 'hsl(var(--secondary))'
    }
  }, ['LLM', 'VLM'].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setTab(t),
    style: {
      ...hmono,
      fontSize: 'var(--text-xs)',
      padding: '4px 16px',
      border: 'none',
      cursor: 'pointer',
      background: tab === t ? 'hsl(var(--primary))' : 'transparent',
      color: tab === t ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
      fontWeight: tab === t ? 600 : 400,
      transition: 'all .12s'
    }
  }, t)));
  return /*#__PURE__*/React.createElement("div", {
    className: "animate-slide-up",
    style: {
      ...hcard,
      padding: 18,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "hsl(var(--primary))",
    strokeWidth: 2
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 3v5h5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3.05 13A9 9 0 106 5.3L3 8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l4 2"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 'var(--text-sm)'
    }
  }, "\u6B77\u53F2\u8DA8\u52E2"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...hlbl,
      fontSize: 10
    }
  }, "\u9EDE\u4EFB\u4E00\u7B46\u7D00\u9304\u53EF\u5C55\u958B\u8A72\u6B21\u8DD1\u7684\u5404\u6A21\u578B\u8868\u73FE"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto'
    }
  }, Tabs)), tab === 'LLM' ? /*#__PURE__*/React.createElement(LlmHistory, null) : /*#__PURE__*/React.createElement(VlmHistory, null));
}

/* ── LLM history ─────────────────────────────────────────── */
function LlmHistory() {
  const [open, setOpen] = React.useState(0); // first (current) run open
  const meanOf = r => r.models.reduce((s, m) => s + m.score, 0) / r.models.length;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      alignItems: 'flex-start',
      marginBottom: 14,
      padding: '10px 12px',
      background: 'hsl(var(--accent)/.4)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid hsl(var(--border))'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'hsl(var(--primary))'
    }
  }, "\u24D8"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      ...hmono,
      lineHeight: 1.7,
      color: 'hsl(var(--foreground))'
    }
  }, "LLM \u8A55\u5206\u65B9\u5F0F\u5F9E\u65E9\u671F\u7684 ", /*#__PURE__*/React.createElement("b", null, "LLM-as-Judge"), " \u2192 ", /*#__PURE__*/React.createElement("b", null, "RAGAS"), "\uFF0C\u76EE\u524D\u6B63\u8A55\u4F30\u6539\u7528", ' ', /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/confident-ai/deepeval",
    target: "_blank",
    rel: "noreferrer",
    style: {
      color: 'hsl(var(--primary))',
      fontWeight: 700,
      borderBottom: '1px solid hsl(var(--primary)/.4)',
      textDecoration: 'none'
    }
  }, "DeepEval"), "\uFF08G-Eval / DAG\uFF0C\u53EF\u5BEB\u55AE\u5143\u6E2C\u8A66\u5F0F\u65B7\u8A00\uFF09\u3002", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'hsl(0 72% 38%)',
      fontWeight: 600
    }
  }, "\u6CE8\u610F\uFF1A\u4E0D\u540C\u8A55\u5206\u6CD5\u7684\u5206\u6578\u6A19\u6E96\u4E0D\u540C\uFF0C\u8DE8\u65B9\u6CD5\u7684\u7D55\u5C0D\u6578\u503C\u4E0D\u53EF\u76F4\u63A5\u6BD4\u8F03"), "\uFF0C\u8ACB\u4EE5\u540C\u4E00\u65B9\u6CD5\u5167\u7684\u76F8\u5C0D\u8DA8\u52E2\u70BA\u6E96\u3002")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap',
      marginBottom: 12
    }
  }, Object.keys(LLM_METHODS).map(k => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      fontSize: 'var(--text-xs)',
      ...hmuted
    }
  }, /*#__PURE__*/React.createElement(MethodBadge, {
    method: k
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      lineHeight: 1.5
    }
  }, LLM_METHODS[k].desc)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, HISTORY_LLM.map((r, i) => {
    const mean = meanOf(r);
    const totalReg = r.models.reduce((s, m) => s + (m.reg || 0), 0);
    const summary = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 88,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...hmono,
        fontSize: 10,
        ...hmuted
      }
    }, r.ts), /*#__PURE__*/React.createElement("div", {
      style: {
        ...hlbl,
        fontSize: 9,
        marginTop: 1
      }
    }, r.scope)), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 118,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(MethodBadge, {
      method: r.method
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        ...hlbl,
        fontSize: 9,
        flexShrink: 0,
        width: 40
      }
    }, r.models.length, " \u6A21\u578B"), /*#__PURE__*/React.createElement("span", {
      style: {
        ...hlbl,
        fontSize: 9,
        flexShrink: 0,
        width: 24
      }
    }, "\u5E73\u5747"), /*#__PURE__*/React.createElement(MiniBar, {
      value: mean
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...hmono,
        fontSize: 'var(--text-sm)',
        fontWeight: 900,
        color: hsc(mean),
        width: 50,
        textAlign: 'right',
        flexShrink: 0
      }
    }, (mean * 100).toFixed(1), "%"), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 58,
        textAlign: 'right',
        flexShrink: 0,
        ...hmono,
        fontSize: 10,
        fontWeight: totalReg > 0 ? 700 : 400,
        color: totalReg > 0 ? 'hsl(0 72% 38%)' : 'hsl(var(--muted-foreground))'
      }
    }, totalReg > 0 ? `⚠ ${totalReg} 退步` : '無退步'));
    const baseRun = findRun(HISTORY_LLM, r.baseline && r.baseline.ts);
    const comparable = !!(r.baseline && r.baseline.method === r.method);
    return /*#__PURE__*/React.createElement(RunRow, {
      key: i,
      current: r.current,
      open: open === i,
      onToggle: () => setOpen(open === i ? -1 : i),
      summary: summary
    }, /*#__PURE__*/React.createElement(BaselineNote, {
      baseline: r.baseline,
      comparable: comparable,
      methodLabel: r.baseline ? (LLM_METHODS[r.baseline.method] || {}).label : ''
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginTop: 4
      }
    }, r.models.map(m => /*#__PURE__*/React.createElement(LlmModelDetail, {
      key: m.id,
      m: m,
      base: baseEntry(baseRun, m.id),
      baseRef: r.baseline,
      comparable: comparable
    }))));
  })));
}
function LlmModelDetail({
  m,
  base,
  baseRef,
  comparable
}) {
  const taskBase = key => base ? (base.tasks.find(t => t.key === key) || {}).score : null;
  const showDelta = comparable && !!base;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...hcard,
      padding: '10px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 9,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: hsb(m.score),
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 'var(--text-sm)',
      fontWeight: 700
    }
  }, m.label), m.isNew && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 700,
      color: 'hsl(var(--model-custom))',
      background: 'hsl(var(--model-custom-soft))',
      padding: '1px 6px',
      borderRadius: 'var(--radius-full)',
      border: '1px solid hsl(var(--model-custom)/.4)'
    }
  }, "\u672C\u6B21\u65B0\u589E"), base ? /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 9,
      ...hlbl
    }
  }, "\u57FA\u6E96 ", baseRef ? baseRef.ts : '', comparable ? ` · ${(base.score * 100).toFixed(1)}%` : '') : !m.isNew && baseRef && /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 9,
      ...hlbl
    }
  }, "\u57FA\u6E96\u672A\u57F7\u884C\u6B64\u6A21\u578B"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'baseline',
      gap: 7
    }
  }, showDelta && /*#__PURE__*/React.createElement(Delta, {
    cur: m.score,
    base: base.score,
    w: 44
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 20,
      fontWeight: 900,
      color: hsc(m.score),
      fontVariantNumeric: 'tabular-nums'
    }
  }, (m.score * 100).toFixed(1), "%")), m.reg > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 10,
      fontWeight: 700,
      color: 'hsl(0 72% 38%)',
      background: 'hsl(var(--destructive)/.08)',
      padding: '1px 7px',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid hsl(var(--destructive)/.3)'
    }
  }, "\u26A0 \u9000\u6B65 ", m.reg, baseRef ? ` · vs ${baseRef.ts}` : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, m.tasks.map(t => {
    const bt = taskBase(t.key);
    return /*#__PURE__*/React.createElement("div", {
      key: t.key,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...hmono,
        fontSize: 11,
        width: 96,
        flexShrink: 0,
        color: 'hsl(var(--foreground))'
      }
    }, TASK_LABELS[t.key] || t.key), /*#__PURE__*/React.createElement(MiniBar, {
      value: t.score
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...hmono,
        fontSize: 11,
        fontWeight: 700,
        color: hsc(t.score),
        width: 40,
        textAlign: 'right',
        flexShrink: 0
      }
    }, (t.score * 100).toFixed(0), "%"), showDelta && /*#__PURE__*/React.createElement(Delta, {
      cur: t.score,
      base: bt == null ? null : bt,
      w: 44
    }));
  })));
}

/* ── VLM history ─────────────────────────────────────────── */
function VlmHistory() {
  const [open, setOpen] = React.useState(0);
  /* mean of a metric across the models that actually ran it (null → skipped) */
  const meanMetric = (r, key) => {
    const vals = r.models.map(m => m[key]).filter(v => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      alignItems: 'flex-start',
      marginBottom: 14,
      padding: '10px 12px',
      background: 'hsl(var(--accent)/.4)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid hsl(var(--border))'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'hsl(var(--primary))'
    }
  }, "\u24D8"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      ...hmono,
      lineHeight: 1.7,
      color: 'hsl(var(--foreground))'
    }
  }, "VLM \u4EE5\u53EF\u91CD\u73FE\u7684\u5BA2\u89C0\u6307\u6A19\u8A55\u5206\uFF1A\u8FA8\u8B58\u984C\u8207 OCR \u7528 ", /*#__PURE__*/React.createElement("b", null, "accuracy"), "\uFF08whole-match / \u7CBE\u78BA\u6BD4\u5C0D\uFF09\uFF0C\u5B9A\u4F4D\u984C\uFF08grounding\uFF09\u7528 ", /*#__PURE__*/React.createElement("b", null, "mean IoU"), "\u3002\u6307\u6A19\u6A19\u6E96\u56FA\u5B9A\uFF0C\u6578\u503C\u53EF\u76F4\u63A5\u8DE8\u6642\u9593\u6BD4\u8F03\u3002", /*#__PURE__*/React.createElement("span", {
    style: {
      ...hlbl
    }
  }, "\u4E0D\u540C\u6B21\u8DD1\u7684\u6A21\u578B / \u4EFB\u52D9\u7D44\u53EF\u80FD\u4E0D\u540C\uFF0C", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'hsl(var(--foreground))'
    }
  }, "\u2014"), " \u8868\u793A\u8A72\u6B21\u672A\u57F7\u884C\u3002"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap',
      marginBottom: 12
    }
  }, VLM_METRICS.map(mt => /*#__PURE__*/React.createElement("div", {
    key: mt.key,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 'var(--text-xs)',
      ...hmuted
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 11,
      fontWeight: 700,
      color: 'hsl(var(--foreground))'
    }
  }, mt.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      padding: '1px 6px',
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--secondary))',
      border: '1px solid hsl(var(--border))',
      ...hmono,
      fontWeight: 600
    }
  }, mt.unit)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, HISTORY_VLM.map((r, i) => {
    const summary = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 88,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...hmono,
        fontSize: 10,
        ...hmuted
      }
    }, r.ts), /*#__PURE__*/React.createElement("div", {
      style: {
        ...hlbl,
        fontSize: 9,
        marginTop: 1
      }
    }, r.scope)), /*#__PURE__*/React.createElement("span", {
      style: {
        ...hlbl,
        fontSize: 9,
        flexShrink: 0,
        width: 40
      }
    }, r.models.length, " \u6A21\u578B"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        minWidth: 0
      }
    }, VLM_METRICS.map(mt => {
      const v = meanMetric(r, mt.key);
      return /*#__PURE__*/React.createElement("span", {
        key: mt.key,
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          ...hmono,
          fontSize: 10,
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          ...hmuted,
          fontSize: 9
        }
      }, mt.label), v == null ? /*#__PURE__*/React.createElement("span", {
        style: {
          ...hlbl
        }
      }, "\u2014") : /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 800,
          color: hsc(v)
        }
      }, (v * 100).toFixed(0), "%"));
    })));
    return /*#__PURE__*/React.createElement(RunRow, {
      key: i,
      current: r.current,
      open: open === i,
      onToggle: () => setOpen(open === i ? -1 : i),
      summary: summary
    }, /*#__PURE__*/React.createElement(BaselineNote, {
      baseline: r.baseline
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginTop: 4
      }
    }, r.models.map(m => /*#__PURE__*/React.createElement(VlmModelDetail, {
      key: m.id,
      m: m,
      base: baseEntry(findRun(HISTORY_VLM, r.baseline && r.baseline.ts), m.id),
      baseRef: r.baseline
    }))));
  })));
}
function VlmModelDetail({
  m,
  base,
  baseRef
}) {
  const _vals = VLM_METRICS.map(mt => m[mt.key]).filter(v => v != null);
  const _mean = _vals.length ? _vals.reduce((a, b) => a + b, 0) / _vals.length : 0;
  const isNewModel = baseRef && !base;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...hcard,
      padding: '10px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 9,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: hsb(_mean),
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 'var(--text-sm)',
      fontWeight: 700
    }
  }, m.label), isNewModel && /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 9,
      ...hlbl
    }
  }, "\u57FA\u6E96\u672A\u57F7\u884C\u6B64\u6A21\u578B"), base && baseRef && /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 9,
      ...hlbl,
      marginLeft: 'auto'
    }
  }, "\u57FA\u6E96 ", baseRef.ts)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
      gap: 8
    }
  }, VLM_METRICS.map(mt => {
    const v = m[mt.key];
    const ran = v != null;
    const cnt = m.counts && m.counts[mt.key];
    const bv = base ? base[mt.key] : null;
    return /*#__PURE__*/React.createElement("div", {
      key: mt.key,
      style: {
        padding: '8px 10px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${ran ? 'hsl(var(--border))' : 'hsl(var(--border))'}`,
        background: ran ? 'hsl(var(--secondary))' : 'hsl(var(--muted)/.4)',
        opacity: ran ? 1 : .7
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...hmono,
        fontSize: 11,
        fontWeight: 700,
        color: 'hsl(var(--foreground))'
      }
    }, mt.label), /*#__PURE__*/React.createElement("span", {
      style: {
        ...hlbl,
        fontSize: 8
      }
    }, mt.unit)), ran ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...hmono,
        fontSize: 20,
        fontWeight: 900,
        color: hsc(v),
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1
      }
    }, (v * 100).toFixed(0), "%"), mt.key !== 'iou' && Array.isArray(cnt) && /*#__PURE__*/React.createElement("span", {
      style: {
        ...hlbl,
        fontSize: 9
      }
    }, cnt[0], "/", cnt[1], " \u6B63\u78BA"), mt.key === 'iou' && cnt != null && /*#__PURE__*/React.createElement("span", {
      style: {
        ...hlbl,
        fontSize: 9
      }
    }, cnt, " \u6846"), baseRef && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto'
      }
    }, /*#__PURE__*/React.createElement(Delta, {
      cur: v,
      base: bv,
      w: 40
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 6,
        borderRadius: 'var(--radius-full)',
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: v * 100 + '%',
        height: '100%',
        background: hsb(v),
        borderRadius: 'var(--radius-full)'
      }
    }))) : /*#__PURE__*/React.createElement("div", {
      style: {
        ...hmono,
        fontSize: 11,
        ...hlbl,
        padding: '6px 0 2px'
      }
    }, "\u2014 \u6B64\u6B21\u672A\u57F7\u884C"));
  })));
}
Object.assign(window, {
  HistoryPanel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "handoff/reference/history.jsx", error: String((e && e.message) || e) }); }

// handoff/reference/parts.jsx
try { (() => {
/* ════════════════════════════════════════════════════════════════
   Benchmark — presentational components → window globals
   Reads data + helpers from window.BM
   ════════════════════════════════════════════════════════════════ */
const {
  MC,
  CAP_CLR,
  S,
  sc,
  sb,
  isRegr
} = window.BM;
const {
  card,
  mono,
  muted,
  lbl
} = S;

/* ── TAG CHIP ────────────────────────────────────────────── */
function Tag({
  t
}) {
  const warn = t.includes('案件') || t.includes('Edge');
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      padding: '1px 7px',
      borderRadius: 'var(--radius-full)',
      fontSize: 10,
      ...mono,
      background: warn ? 'hsl(38 92% 50%/.1)' : 'hsl(var(--secondary))',
      color: warn ? 'hsl(38 80% 28%)' : 'hsl(var(--muted-foreground))',
      border: '1px solid hsl(var(--border))'
    }
  }, t);
}

/* ── JUDGE PANEL (LLM per-model reasoning) ───────────────── */
function JudgePanel({
  modelLabel,
  reasoning,
  isWinner
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      padding: '10px 12px',
      background: 'hsl(var(--primary)/.06)',
      border: '1px solid hsl(var(--primary)/.2)',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      ...mono,
      color: 'hsl(var(--primary))',
      fontWeight: 600
    }
  }, "\u2696 \u88C1\u5224\u5C0D ", modelLabel, " \u7684\u8A55\u8A9E"), isWinner && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      padding: '0 6px',
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--success)/.12)',
      color: 'hsl(160 70% 28%)',
      border: '1px solid hsl(var(--success)/.3)',
      ...mono
    }
  }, "\u88C1\u5B9A\u52DD\u51FA")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xs)',
      ...mono,
      lineHeight: 1.75,
      color: 'hsl(var(--foreground))'
    }
  }, reasoning));
}

/* ── LLM CASE ROW ────────────────────────────────────────── */
function LlmCaseRow({
  c,
  baseId,
  candId,
  enabledModels,
  layout,
  judgeOpen,
  onJudge
}) {
  const reg = isRegr(c, baseId, candId);
  const modelIds = enabledModels.map(m => m.id).filter(id => c.models[id]);
  const winner = modelIds.reduce((b, id) => (c.models[id]?.score || 0) > (c.models[b]?.score || 0) ? id : b, modelIds[0]);
  const AnswerCol = ({
    id
  }) => {
    const r = c.models[id];
    if (!r) return null;
    const col = MC[id] || '#14b8a6';
    const m = enabledModels.find(m => m.id === id);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 5,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: col,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono,
        fontSize: 'var(--text-xs)',
        fontWeight: 700
      }
    }, m?.label || id), /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono,
        fontSize: 13,
        fontWeight: 900,
        color: sc(r.score / 5)
      }
    }, r.score, "/5"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        padding: '1px 7px',
        borderRadius: 'var(--radius-full)',
        background: r.pass ? 'hsl(var(--success)/.1)' : 'hsl(var(--destructive)/.1)',
        color: r.pass ? 'hsl(160 70% 28%)' : 'hsl(0 72% 38%)',
        border: `1px solid ${r.pass ? 'hsl(var(--success)/.3)' : 'hsl(var(--destructive)/.3)'}`,
        ...mono
      }
    }, r.pass ? '✓ Pass' : '✗ Fail')), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 'var(--text-xs)',
        lineHeight: 1.7,
        color: 'hsl(var(--foreground))'
      }
    }, r.answer));
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      marginBottom: 10,
      overflow: 'hidden',
      borderColor: reg ? 'hsl(var(--destructive)/.4)' : 'hsl(var(--border))'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 3,
      background: reg ? 'hsl(var(--destructive))' : 'hsl(var(--border))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 10,
      ...muted,
      flexShrink: 0,
      paddingTop: 2
    }
  }, "Q", c.id), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      flex: 1,
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      lineHeight: 1.5
    }
  }, c.question), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      flexShrink: 0,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, c.tags?.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    t: t
  })), reg && /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 10,
      padding: '1px 8px',
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--destructive)/.1)',
      color: 'hsl(0 72% 38%)',
      border: '1px solid hsl(var(--destructive)/.35)',
      fontWeight: 700
    }
  }, "\u26A0 \u9000\u6B65"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 10,
      flexDirection: layout === 'three' ? 'column' : 'row'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: layout === 'three' ? 'none' : '0 0 190px',
      padding: '8px 10px',
      background: 'hsl(var(--secondary))',
      borderRadius: 'var(--radius-sm)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...lbl,
      fontWeight: 700,
      display: 'block',
      marginBottom: 4
    }
  }, "\u6A19\u6E96\u7B54\u6848"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xs)',
      lineHeight: 1.7
    }
  }, c.gt)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 2,
      display: 'flex',
      gap: 10
    }
  }, modelIds.map(id => /*#__PURE__*/React.createElement(AnswerCol, {
    key: id,
    id: id
  })))), /*#__PURE__*/React.createElement("button", {
    onClick: onJudge,
    style: {
      ...mono,
      fontSize: 10,
      padding: '3px 11px',
      border: `1px solid ${judgeOpen ? 'hsl(var(--primary))' : 'hsl(var(--primary)/.35)'}`,
      borderRadius: 'var(--radius-full)',
      background: judgeOpen ? 'hsl(var(--primary)/.1)' : 'transparent',
      color: 'hsl(var(--primary))',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u2696"), " AI \u88C1\u5224\u8A55\u8A9E ", /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .7
    }
  }, judgeOpen ? '▲' : '▼')), judgeOpen && modelIds.map(id => c.models[id]?.reasoning && /*#__PURE__*/React.createElement(JudgePanel, {
    key: id,
    modelLabel: enabledModels.find(m => m.id === id)?.label || id,
    reasoning: c.models[id].reasoning,
    isWinner: id === winner
  }))));
}

/* ── BBOX VIEWER (locate) ────────────────────────────────── */
function BBoxViewer({
  img,
  gt,
  preds
}) {
  const [hov, setHov] = React.useState(null); // 'gt' | model id
  const pct = (b, axis) => (axis === 'x' ? b[0] : b[1]) / (axis === 'x' ? img.w : img.h) * 100;
  const pctw = b => b[2] / img.w * 100,
    pcth = b => b[3] / img.h * 100;
  const Box = ({
    box,
    color,
    k,
    label,
    dashed
  }) => {
    const active = hov === k;
    return /*#__PURE__*/React.createElement("div", {
      onMouseEnter: () => setHov(k),
      onMouseLeave: () => setHov(null),
      style: {
        position: 'absolute',
        left: pct(box, 'x') + '%',
        top: pct(box, 'y') + '%',
        width: pctw(box) + '%',
        height: pcth(box) + '%',
        border: `2px ${dashed ? 'dashed' : 'solid'} ${color}`,
        borderRadius: 2,
        boxShadow: active ? `0 0 0 2px ${color}55` : 'none',
        background: active ? color + '22' : 'transparent',
        transition: 'background .12s, box-shadow .12s',
        cursor: 'crosshair',
        zIndex: active ? 5 : 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: -17,
        left: -2,
        fontSize: 9,
        ...mono,
        fontWeight: 700,
        color: '#fff',
        background: color,
        padding: '0 5px',
        borderRadius: 2,
        whiteSpace: 'nowrap'
      }
    }, label), active && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        bottom: -17,
        left: -2,
        fontSize: 9,
        ...mono,
        color: '#fff',
        background: 'hsl(var(--tooltip-bg))',
        padding: '1px 5px',
        borderRadius: 2,
        whiteSpace: 'nowrap',
        zIndex: 9
      }
    }, "x", box[0], " y", box[1], " \xB7 ", box[2], "\xD7", box[3], "px"));
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: '1 1 360px',
      minWidth: 300,
      maxWidth: 460,
      aspectRatio: `${img.w} / ${img.h}`,
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: '1px solid hsl(var(--border))',
      backgroundColor: 'hsl(var(--secondary))',
      backgroundImage: 'repeating-linear-gradient(45deg, hsl(var(--border)/.5) 0 1px, transparent 1px 11px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 11,
      ...muted,
      opacity: .7,
      textAlign: 'center',
      padding: 8
    }
  }, "PCB \u6AA2\u6E2C\u5F71\u50CF", /*#__PURE__*/React.createElement("br", null), img.w, "\xD7", img.h, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .7
    }
  }, "\uFF08\u62D6\u5165\u5BE6\u969B\u5F71\u50CF\uFF09"))), /*#__PURE__*/React.createElement(Box, {
    box: gt,
    color: "#00E676",
    k: "gt",
    label: "\u6A19\u6E96\u6846 GT"
  }), preds.map(p => /*#__PURE__*/React.createElement(Box, {
    key: p.id,
    box: p.box,
    color: p.color,
    k: p.id,
    label: p.label,
    dashed: true
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 200px',
      minWidth: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 11,
      ...mono
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 14,
      height: 0,
      borderTop: '2px solid var(--bbox-gt)'
    }
  }), " \u6A19\u6E96\u6846 (Ground Truth)", /*#__PURE__*/React.createElement("span", {
    style: {
      ...muted,
      marginLeft: 'auto'
    }
  }, gt[0], ",", gt[1], " \xB7 ", gt[2], "\xD7", gt[3])), preds.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    onMouseEnter: () => setHov(p.id),
    onMouseLeave: () => setHov(null),
    style: {
      padding: '8px 10px',
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${hov === p.id ? p.color : 'hsl(var(--border))'}`,
      background: hov === p.id ? p.color + '12' : 'hsl(var(--secondary))',
      transition: 'all .12s',
      cursor: 'crosshair'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 14,
      height: 0,
      borderTop: `2px dashed ${p.color}`
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 11,
      fontWeight: 700
    }
  }, p.label), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 12,
      fontWeight: 900,
      marginLeft: 'auto',
      color: sc(p.iou)
    }
  }, "IoU ", (p.iou * 100).toFixed(0), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono,
      fontSize: 10,
      ...muted
    }
  }, "\u9810\u6E2C\u5EA7\u6A19 ", p.box[0], ",", p.box[1], " \xB7 ", p.box[2], "\xD7", p.box[3], "px"), p.note && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      ...muted,
      marginTop: 3,
      lineHeight: 1.5
    }
  }, p.note))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontSize: 10,
      ...lbl,
      lineHeight: 1.6
    }
  }, "\u6ED1\u904E\u6846\u7DDA\u6216\u5361\u7247\u53EF\u9AD8\u4EAE\u5C0D\u61C9\u5340\u57DF\u4E26\u986F\u793A\u539F\u59CB\u50CF\u7D20\u5EA7\u6A19\u3002")));
}

/* ── VLM CASE ROW ────────────────────────────────────────── */
function normRecog(s) {
  return (s || '').trim().toLowerCase();
}
function normOcr(s) {
  return (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}
function VlmCaseRow({
  c,
  baseId,
  candId,
  enabledModels
}) {
  const reg = isRegr(c, baseId, candId);
  const modelIds = enabledModels.map(m => m.id).filter(id => c.models[id]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      marginBottom: 10,
      overflow: 'hidden',
      borderColor: reg ? 'hsl(var(--destructive)/.4)' : 'hsl(var(--border))'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 3,
      background: reg ? 'hsl(var(--destructive))' : 'hsl(var(--border))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 10,
      ...muted,
      flexShrink: 0,
      paddingTop: 2
    }
  }, "Q", c.id), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      flex: 1,
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      lineHeight: 1.5
    }
  }, c.question), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      flexShrink: 0,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, c.tags?.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    t: t
  })), reg && /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 10,
      padding: '1px 8px',
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--destructive)/.1)',
      color: 'hsl(0 72% 38%)',
      border: '1px solid hsl(var(--destructive)/.35)',
      fontWeight: 700
    }
  }, "\u26A0 \u9000\u6B65"))), c.task === 'locate' ? /*#__PURE__*/React.createElement(BBoxViewer, {
    img: c.img,
    gt: c.gt,
    preds: modelIds.map(id => ({
      id,
      label: enabledModels.find(m => m.id === id)?.label || id,
      color: MC[id] || '#14b8a6',
      box: c.models[id].box,
      iou: c.models[id].iou,
      note: c.models[id].note
    }))
  }) : (() => {
    const norm = c.task === 'ocr' ? normOcr : normRecog;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        marginBottom: 9,
        padding: '5px 11px',
        background: 'hsl(var(--secondary))',
        borderRadius: 'var(--radius-sm)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...lbl,
        fontWeight: 700
      }
    }, "\u6A19\u6E96\u7B54\u6848"), /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono,
        fontSize: 'var(--text-sm)',
        fontWeight: 700
      }
    }, c.expected)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap'
      }
    }, modelIds.map(id => {
      const r = c.models[id];
      const m = enabledModels.find(m => m.id === id);
      const normd = norm(r.response);
      return /*#__PURE__*/React.createElement("div", {
        key: id,
        style: {
          flex: '1 1 220px',
          minWidth: 200,
          border: `1px solid ${r.pass ? 'hsl(var(--success)/.3)' : 'hsl(var(--destructive)/.3)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '9px 11px',
          background: r.pass ? 'hsl(var(--success)/.04)' : 'hsl(var(--destructive)/.04)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 6
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: MC[id] || '#14b8a6'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          ...mono,
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          flex: 1
        }
      }, m?.label || id), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          padding: '1px 7px',
          borderRadius: 'var(--radius-full)',
          background: r.pass ? 'hsl(var(--success)/.12)' : 'hsl(var(--destructive)/.12)',
          color: r.pass ? 'hsl(160 70% 28%)' : 'hsl(0 72% 38%)',
          border: `1px solid ${r.pass ? 'hsl(var(--success)/.3)' : 'hsl(var(--destructive)/.3)'}`,
          ...mono
        }
      }, r.pass ? '✓ Match' : '✗ Mismatch')), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          ...mono,
          fontSize: 'var(--text-xs)',
          flexWrap: 'wrap'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          ...muted
        }
      }, "\u539F\u59CB\u8F38\u51FA"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600
        }
      }, r.response)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          ...mono,
          fontSize: 'var(--text-xs)',
          marginTop: 4,
          flexWrap: 'wrap'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          ...muted
        }
      }, "\u6B63\u898F\u5316\u5F8C"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700,
          color: r.pass ? 'hsl(160 70% 28%)' : 'hsl(0 72% 38%)'
        }
      }, normd), /*#__PURE__*/React.createElement("span", {
        style: {
          ...muted
        }
      }, r.pass ? '＝' : '≠'), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700
        }
      }, norm(c.expected))));
    })));
  })()));
}

/* ── CASE INSPECTOR ──────────────────────────────────────── */
function methodNote(task) {
  if (task === 'recognition') return '評分方式：whole-match — 將輸出與標準答案正規化（去空白、轉小寫）後比對 output == expected。';
  if (task === 'ocr') return '評分方式：精確比對 — 轉大寫並移除分隔符（- / 空白）後比對字串是否完全一致。';
  if (task === 'locate') return '評分方式：IoU — 預測框與標準框的交集 / 聯集面積比；以 0.5 為通過門檻。';
  return null;
}
function CaseInspector({
  cases,
  enabledModels,
  baseId
}) {
  const [filter, setFilter] = React.useState('all');
  const [layout, setLayout] = React.useState('split');
  const [openJdg, setOpenJdg] = React.useState(null);
  const isVlm = !!cases[0]?.task;
  const modelIds = enabledModels.map(m => m.id).filter(id => cases[0]?.models[id]);
  const candId = modelIds.find(id => id !== baseId) || modelIds[0];
  const counts = {
    all: cases.length,
    any_wrong: cases.filter(c => modelIds.some(id => !c.models[id]?.pass)).length,
    all_wrong: cases.filter(c => modelIds.every(id => !c.models[id]?.pass)).length,
    regression: cases.filter(c => isRegr(c, baseId, candId)).length
  };
  const filtered = cases.filter(c => {
    if (filter === 'regression') return isRegr(c, baseId, candId);
    if (filter === 'any_wrong') return modelIds.some(id => !c.models[id]?.pass);
    if (filter === 'all_wrong') return modelIds.every(id => !c.models[id]?.pass);
    return true;
  });
  const wrongLabel = isVlm ? '有模型答錯' : '有模型答錯';
  const fbtn = (k, label) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setFilter(k),
    style: {
      ...mono,
      fontSize: 'var(--text-xs)',
      padding: '4px 12px',
      borderRadius: 'var(--radius-full)',
      border: `1px solid ${filter === k ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
      background: filter === k ? 'hsl(var(--primary))' : 'hsl(var(--card))',
      color: filter === k ? '#fff' : 'hsl(var(--muted-foreground))',
      cursor: 'pointer',
      fontWeight: filter === k ? 600 : 400,
      transition: 'all .12s'
    }
  }, label, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .75
    }
  }, counts[k]));
  const note = isVlm ? methodNote(cases[0].task) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 20px 20px'
    }
  }, note && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      alignItems: 'flex-start',
      marginBottom: 12,
      padding: '8px 11px',
      background: 'hsl(var(--accent)/.4)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid hsl(var(--border))'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'hsl(var(--primary))'
    }
  }, "\u24D8"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      ...mono,
      lineHeight: 1.6,
      color: 'hsl(var(--foreground))'
    }
  }, note)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      alignItems: 'center',
      marginBottom: 14
    }
  }, fbtn('all', '全部案例'), fbtn('any_wrong', wrongLabel), fbtn('all_wrong', '全部答錯'), /*#__PURE__*/React.createElement("button", {
    onClick: () => setFilter('regression'),
    style: {
      ...mono,
      fontSize: 'var(--text-xs)',
      padding: '4px 12px',
      borderRadius: 'var(--radius-full)',
      border: `1px solid ${filter === 'regression' ? 'hsl(var(--destructive))' : 'hsl(var(--destructive)/.4)'}`,
      background: filter === 'regression' ? 'hsl(var(--destructive))' : 'hsl(var(--destructive)/.08)',
      color: filter === 'regression' ? '#fff' : 'hsl(0 72% 38%)',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all .12s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, "\u26A0 \u9000\u6B65 ", /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .8
    }
  }, counts.regression)), !isVlm && /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'inline-flex',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'var(--radius-full)',
      overflow: 'hidden',
      background: 'hsl(var(--secondary))'
    }
  }, [['split', '⊟ 並排'], ['three', '⊞ 直列']].map(([k, t]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setLayout(k),
    style: {
      ...mono,
      fontSize: 'var(--text-xs)',
      padding: '4px 12px',
      border: 'none',
      cursor: 'pointer',
      background: layout === k ? 'hsl(var(--primary))' : 'transparent',
      color: layout === k ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
      transition: 'all .12s'
    }
  }, t)))), filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '20px 0',
      ...lbl
    }
  }, filter === 'regression' ? '✓ 沒有退步案例，新模型完全相容' : '沒有符合篩選條件的案例') : filtered.map(c => isVlm ? /*#__PURE__*/React.createElement(VlmCaseRow, {
    key: c.id,
    c: c,
    baseId: baseId,
    candId: candId,
    enabledModels: enabledModels
  }) : /*#__PURE__*/React.createElement(LlmCaseRow, {
    key: c.id,
    c: c,
    baseId: baseId,
    candId: candId,
    enabledModels: enabledModels,
    layout: layout,
    judgeOpen: openJdg === c.id,
    onJudge: () => setOpenJdg(p => p === c.id ? null : c.id)
  })));
}

/* ── MODEL RESULT COLUMN ─────────────────────────────────── */
function ModelCol({
  label,
  data,
  modelId,
  champion,
  isBaseline,
  metricType
}) {
  if (!data) return null;
  const pct = (data.score * 100).toFixed(1) + '%'; // 分數條寬度（0–100%）
  const isJudge = metricType === 'llm'; // LLM = judge 0–5 制
  const headline = isJudge ? (data.score * 5).toFixed(1) + '/5' : pct;
  const col = MC[modelId] || '#14b8a6';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 210,
      maxWidth: 330,
      ...card,
      padding: '12px 14px 12px 17px',
      position: 'relative',
      background: data.score >= .85 ? 'hsl(160 84% 39%/.05)' : data.score >= .4 ? 'hsl(38 92% 50%/.05)' : 'hsl(0 84% 60%/.05)',
      borderColor: data.score >= .85 ? 'hsl(160 84% 39%/.3)' : data.score >= .4 ? 'hsl(38 92% 50%/.3)' : 'hsl(0 84% 60%/.3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      background: sb(data.score),
      borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)'
    }
  }), champion && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -10,
      right: 10,
      fontSize: 11,
      fontWeight: 600,
      background: 'hsl(var(--success))',
      color: '#fff',
      padding: '1px 8px',
      borderRadius: 'var(--radius-full)'
    }
  }, "\uD83C\uDFC6 WINNER"), isBaseline && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 7,
      right: 8,
      ...mono,
      fontSize: 9,
      padding: '1px 6px',
      borderRadius: 'var(--radius-sm)',
      background: 'hsl(var(--secondary))',
      color: 'hsl(var(--muted-foreground))',
      border: '1px solid hsl(var(--border))'
    }
  }, "\u57FA\u6E96"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: col,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      flex: 1
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 26,
      fontWeight: 900,
      color: sc(data.score),
      fontVariantNumeric: 'tabular-nums'
    }
  }, headline)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--secondary))',
      overflow: 'hidden',
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "animate-bar-grow",
    style: {
      width: pct,
      height: '100%',
      background: sb(data.score),
      borderRadius: 'var(--radius-full)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, metricType === 'locate' ? /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 11,
      ...muted
    }
  }, "mean IoU ", (data.iou * 100).toFixed(1), "%") : metricType === 'recognition' || metricType === 'ocr' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 11,
      color: 'hsl(160 60% 30%)',
      fontWeight: 500
    }
  }, "\u2713 \u6B63\u78BA ", data.correct, "/", data.total), /*#__PURE__*/React.createElement("span", {
    style: {
      ...lbl,
      ...mono
    }
  }, metricType === 'ocr' ? '精確比對' : 'whole-match')) : /*#__PURE__*/React.createElement(React.Fragment, null, data.wins != null && /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 11,
      color: 'hsl(160 60% 30%)',
      fontWeight: 500
    }
  }, "\u2191 \u8D0F\u4E86 ", data.wins, " \u984C"), data.total && /*#__PURE__*/React.createElement("span", {
    style: {
      ...lbl,
      ...mono
    }
  }, data.wins, "/", data.total, "\uFF08", (data.wins / data.total * 100).toFixed(0), "% \u52DD\u7387\uFF09")), data.regressions > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 11,
      fontWeight: 700,
      color: 'hsl(0 72% 38%)',
      background: 'hsl(var(--destructive)/.08)',
      padding: '0 6px',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid hsl(var(--destructive)/.3)'
    }
  }, "\u26A0 \u9000\u6B65 ", data.regressions, " \u984C")));
}

/* ── PROJECT ROW ─────────────────────────────────────────── */
function ProjRow({
  p,
  sel,
  onToggle
}) {
  const cap = CAP_CLR[p.cap] || {
    bg: 'hsl(var(--secondary))',
    color: 'hsl(var(--muted-foreground))'
  };
  return /*#__PURE__*/React.createElement("div", {
    onClick: onToggle,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 12px',
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${sel ? 'hsl(var(--primary)/.5)' : 'hsl(var(--border))'}`,
      background: sel ? 'hsl(var(--primary)/.05)' : 'transparent',
      cursor: 'pointer',
      marginBottom: 6,
      transition: 'all .12s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 18,
      height: 18,
      borderRadius: 4,
      border: `2px solid ${sel ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
      background: sel ? 'hsl(var(--primary))' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all .14s'
    }
  }, sel && /*#__PURE__*/React.createElement("svg", {
    width: 11,
    height: 11,
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 6l3 3 5-5",
    stroke: "hsl(var(--primary-foreground))",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 'var(--text-sm)'
    }
  }, p.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      ...mono,
      fontWeight: 500,
      ...cap
    }
  }, p.cap), p.est && /*#__PURE__*/React.createElement("span", {
    style: {
      ...lbl,
      fontSize: 10,
      whiteSpace: 'nowrap'
    }
  }, "~", p.est, "m"));
}
Object.assign(window, {
  Tag,
  JudgePanel,
  LlmCaseRow,
  VlmCaseRow,
  BBoxViewer,
  CaseInspector,
  ModelCol,
  ProjRow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "handoff/reference/parts.jsx", error: String((e && e.message) || e) }); }

// ui_kits/benchmark/data.js
try { (() => {
/* ════════════════════════════════════════════════════════════════
   Garmin LLM/VLM Benchmark — demo data
   Exposes window.BM = { models, projects, results, cases, history, … }
   ════════════════════════════════════════════════════════════════ */
(function () {
  /* ── MODELS (with click-to-expand detail rows) ──────────────────── */
  const INIT_MODELS = [{
    id: 'llm_large',
    label: 'LLM Large',
    name: 'qwen3-72b',
    kind: 'builtin',
    type: 'LLM',
    enabled: true,
    details: [{
      label: '端點',
      value: 'infer.garmin.io/v1/llm-large',
      href: 'http://infer.garmin.io/v1/llm-large'
    }, {
      label: '參數量',
      value: '72B'
    }, {
      label: '內容長度',
      value: '32,768 tokens'
    }, {
      label: '供應',
      value: 'Qwen3 · 自架 vLLM'
    }, {
      label: '模型卡',
      value: '查看文件',
      href: 'https://qwenlm.github.io/'
    }]
  }, {
    id: 'llm_small',
    label: 'LLM Small',
    name: 'qwen3-14b',
    kind: 'builtin',
    type: 'LLM',
    enabled: true,
    details: [{
      label: '端點',
      value: 'infer.garmin.io/v1/llm-small',
      href: 'http://infer.garmin.io/v1/llm-small'
    }, {
      label: '參數量',
      value: '14B'
    }, {
      label: '內容長度',
      value: '32,768 tokens'
    }, {
      label: '供應',
      value: 'Qwen3 · 自架 vLLM'
    }, {
      label: '模型卡',
      value: '查看文件',
      href: 'https://qwenlm.github.io/'
    }]
  }, {
    id: 'vlm_large',
    label: 'VLM Large',
    name: 'qwen-vl-72b',
    kind: 'builtin',
    type: 'VLM',
    enabled: false,
    details: [{
      label: '端點',
      value: 'infer.garmin.io/v1/vlm-large',
      href: 'http://infer.garmin.io/v1/vlm-large'
    }, {
      label: '參數量',
      value: '72B'
    }, {
      label: '解析度',
      value: '最高 1280×1280'
    }, {
      label: '供應',
      value: 'Qwen2.5-VL · 自架'
    }, {
      label: '模型卡',
      value: '查看文件',
      href: 'https://qwenlm.github.io/'
    }]
  }, {
    id: 'vlm_small',
    label: 'VLM Small',
    name: 'qwen-vl-7b',
    kind: 'builtin',
    type: 'VLM',
    enabled: false,
    details: [{
      label: '端點',
      value: 'infer.garmin.io/v1/vlm-small',
      href: 'http://infer.garmin.io/v1/vlm-small'
    }, {
      label: '參數量',
      value: '7B'
    }, {
      label: '解析度',
      value: '最高 896×896'
    }, {
      label: '供應',
      value: 'Qwen2.5-VL · 自架'
    }, {
      label: '模型卡',
      value: '查看文件',
      href: 'https://qwenlm.github.io/'
    }]
  }, {
    id: 'custom_1',
    label: 'Llama3-8B',
    name: 'Llama-3-8B',
    kind: 'custom',
    type: 'LLM',
    enabled: false,
    color: '#14b8a6',
    details: [{
      label: '端點',
      value: '10.0.4.27:8000/v1',
      href: 'http://10.0.4.27:8000/v1'
    }, {
      label: '參數量',
      value: '8B'
    }, {
      label: '內容長度',
      value: '8,192 tokens'
    }, {
      label: '供應',
      value: '使用者上傳 · 2026-06-12'
    }, {
      label: '權重',
      value: 'meta-llama/Llama-3-8B',
      href: 'https://huggingface.co/meta-llama'
    }]
  }];

  /* ── PROJECTS ───────────────────────────────────────────────────── */
  const LLM_PROJECTS = [{
    name: 'general_qa',
    label: '通用問答',
    cap: 'Text Gen',
    est: 5,
    type: 'LLM'
  }, {
    name: 'code_review',
    label: '程式碼審查',
    cap: 'Code',
    est: 8,
    type: 'LLM'
  }, {
    name: 'translation',
    label: '中英翻譯',
    cap: 'Translation',
    est: 4,
    type: 'LLM'
  }];
  const VLM_PROJECTS = [{
    name: 'flame_detect',
    label: '影像辨識（是非）',
    cap: 'Recognition',
    est: 6,
    type: 'VLM',
    vlmType: 'recognition'
  }, {
    name: 'serial_ocr',
    label: '裝置序號 OCR',
    cap: 'OCR',
    est: 5,
    type: 'VLM',
    vlmType: 'ocr'
  }, {
    name: 'part_locate',
    label: '零件定位（Grounding）',
    cap: 'Grounding',
    est: 15,
    type: 'VLM',
    vlmType: 'locate'
  }];

  /* ── HEADLINE RESULTS ───────────────────────────────────────────── */
  const RESULTS = {
    general_qa: {
      llm_large: {
        score: .881,
        wins: 2,
        total: 4,
        regressions: 1
      },
      llm_small: {
        score: .746,
        wins: 2,
        total: 4,
        regressions: 0
      }
    },
    code_review: {
      llm_large: {
        score: .871,
        wins: 13,
        total: 18,
        regressions: 2
      },
      llm_small: {
        score: .634,
        wins: 5,
        total: 18,
        regressions: 0
      }
    },
    translation: {
      llm_large: {
        score: .956,
        wins: 20,
        total: 24,
        regressions: 0
      },
      llm_small: {
        score: .812,
        wins: 4,
        total: 24,
        regressions: 0
      }
    },
    flame_detect: {
      vlm_large: {
        score: .92,
        acc: .92,
        correct: 23,
        total: 25,
        regressions: 1
      },
      vlm_small: {
        score: .84,
        acc: .84,
        correct: 21,
        total: 25,
        regressions: 0
      }
    },
    serial_ocr: {
      vlm_large: {
        score: .97,
        acc: .97,
        correct: 29,
        total: 30,
        regressions: 0
      },
      vlm_small: {
        score: .88,
        acc: .88,
        correct: 26,
        total: 30,
        regressions: 0
      }
    },
    part_locate: {
      vlm_large: {
        score: .86,
        iou: .86,
        regressions: 0
      },
      vlm_small: {
        score: .49,
        iou: .49,
        regressions: 1
      }
    }
  };

  /* ── LLM PER-CASE DETAIL ────────────────────────────────────────── */
  const CASES_GQA = [{
    id: 1,
    question: '如何修改 Garmin 裝置的語言設定？',
    gt: '前往「設定」→「系統」→「語言」，選擇語言後重新啟動裝置。',
    tags: ['設定操作'],
    models: {
      llm_large: {
        pass: true,
        score: 4.5,
        answer: '請至 Garmin Connect App，進入裝置管理，點擊「設定」→「系統」→「語言」，配對後裝置將自動同步語言偏好。',
        reasoning: '答案完整描述操作路徑，涵蓋 App 入口及裝置設定路徑，用語清晰。扣分原因：未提及「重啟裝置」步驟（-0.5）。最終評分 4.5/5。'
      },
      llm_small: {
        pass: false,
        score: 1.8,
        answer: '語言設定在系統選單裡面，您可以直接更改。',
        reasoning: '答案過於簡略，僅指出方向但缺乏具體步驟，使用者難以依此操作。最終評分 1.8/5。'
      }
    }
  }, {
    id: 2,
    question: '心率監測不準確時如何校正？',
    gt: '保持手腕清潔、手環貼緊皮膚，避免運動後立即量測。若持續不準，可在 Garmin Connect 感測器設定執行重新校正。',
    tags: ['感測器', '健康數據'],
    models: {
      llm_large: {
        pass: true,
        score: 4.0,
        answer: '確保手環貼緊手腕，清潔皮膚後重新配戴，避免配戴過鬆。運動後請靜候 5 分鐘再量測。',
        reasoning: '正確提及配戴方式與運動後等待時間，但未提及 Garmin Connect 重新校正選項（-1.0）。最終評分 4.0/5。'
      },
      llm_small: {
        pass: true,
        score: 4.2,
        answer: '請確認手環是否貼緊手腕，並在 Garmin Connect 感測器設定中選擇「心率感測器校正」依步驟操作。',
        reasoning: '本題 LLM Small 表現優於 LLM Large，明確提及 Garmin Connect 校正功能，資訊更完整（+0.2）。最終評分 4.2/5。'
      }
    }
  }, {
    id: 3,
    question: '藍牙已開啟但同步仍失敗，下一步如何排除？',
    gt: '在手機藍牙設定中刪除裝置後重新配對。若仍失敗，清除 Garmin Connect App 快取或重新安裝。',
    tags: ['故障排除', '邊緣案件'],
    models: {
      llm_large: {
        pass: false,
        score: 1.9,
        answer: '請重新啟動手機藍牙，靠近裝置後重新嘗試同步。',
        reasoning: '⚠ Regression：LLM Large 僅重複了已確認無效的基礎步驟（重啟藍牙），未提供進階排除方案。對「藍牙已開啟仍失敗」的情境，此回答完全不足。最終評分 1.9/5。'
      },
      llm_small: {
        pass: true,
        score: 4.5,
        answer: '若藍牙已開啟仍無法同步，請在手機藍牙設定刪除裝置後重新配對。若問題持續，清除 Garmin Connect 快取（設定→應用程式→Garmin Connect→清除快取）或重新安裝。',
        reasoning: 'LLM Small 正確理解問題脈絡（藍牙已開啟），提供有效的進階排除步驟與具體路徑，是本題明顯更優的回答。最終評分 4.5/5。'
      }
    }
  }, {
    id: 4,
    question: '如何設定每日步數目標？',
    gt: '在 Garmin Connect App 進入「更多」→「健身統計」→「目標」→「步數目標」，輸入每日目標。',
    tags: ['設定操作'],
    models: {
      llm_large: {
        pass: true,
        score: 4.1,
        answer: '在 Garmin Connect App 底部點擊「更多」→「目標」→「每日步數」，輸入目標後儲存。',
        reasoning: '路徑描述正確且實用，稍有簡化但使用者可依此找到設定頁面。最終評分 4.1/5。'
      },
      llm_small: {
        pass: false,
        score: 1.4,
        answer: '您可以在 Garmin Connect App 設定步數目標。',
        reasoning: '回答極度簡略，未提供任何導航路徑，對使用者毫無幫助。最終評分 1.4/5。'
      }
    }
  }];
  const CASES_CODE = [{
    id: 1,
    question: '審查此函式的記憶體洩漏風險（C，malloc 後缺少 free）',
    gt: '指出未釋放的 buffer，建議在所有 return 路徑前 free，或改用 RAII / cleanup goto。',
    tags: ['記憶體', 'C'],
    models: {
      llm_large: {
        pass: true,
        score: 4.6,
        answer: '第 14 行 malloc 配置的 buf 在 error 分支提前 return，未被釋放，造成洩漏。建議使用 `goto cleanup;` 統一釋放，或在每個 return 前加上 free(buf)。',
        reasoning: '準確定位洩漏行號與錯誤分支，並給出兩種慣用修法。最終評分 4.6/5。'
      },
      llm_small: {
        pass: false,
        score: 2.1,
        answer: '程式碼看起來沒有明顯問題，記得釋放記憶體即可。',
        reasoning: '未指出具體洩漏位置，泛泛而談，無法協助修正。最終評分 2.1/5。'
      }
    }
  }, {
    id: 2,
    question: '此 SQL 查詢是否有注入風險？',
    gt: '字串拼接使用者輸入存在 SQL injection，應改用參數化查詢 / prepared statement。',
    tags: ['安全', 'SQL', '邊緣案件'],
    models: {
      llm_large: {
        pass: false,
        score: 2.4,
        answer: '查詢邏輯正確，效能上可加索引以加速。',
        reasoning: '⚠ Regression：完全忽略了明顯的字串拼接注入風險，僅談效能。安全審查嚴重失格。最終評分 2.4/5。'
      },
      llm_small: {
        pass: true,
        score: 4.3,
        answer: '第 8 行直接把 request.name 拼進 SQL 字串，有注入風險。請改用參數化查詢（`cursor.execute(sql, (name,))`）。',
        reasoning: '正確識別注入點並給出參數化修法，安全意識佳。最終評分 4.3/5。'
      }
    }
  }, {
    id: 3,
    question: '這段 React useEffect 為何造成無限重繪？',
    gt: '依賴陣列遺漏 / 物件每次新建導致 effect 反覆觸發，應 memo 化或修正依賴。',
    tags: ['React', '邊緣案件'],
    models: {
      llm_large: {
        pass: false,
        score: 2.0,
        answer: '把 useEffect 移到 component 外層就好了。',
        reasoning: '⚠ Regression：建議在語法上不可行（Hook 不可移出元件），且未指出真正成因（依賴物件每次重建）。最終評分 2.0/5。'
      },
      llm_small: {
        pass: true,
        score: 4.0,
        answer: 'options 物件在每次 render 都重新建立，作為依賴使 effect 每次都觸發。請用 useMemo 包住 options 或改用其原始值作依賴。',
        reasoning: '正確診斷重建依賴問題並給出 useMemo 修法。最終評分 4.0/5。'
      }
    }
  }];
  const CASES_TRANS = [{
    id: 1,
    question: '翻譯：「請在配對前確認裝置韌體已更新至最新版本。」',
    gt: 'Please ensure the device firmware is updated to the latest version before pairing.',
    tags: ['術語'],
    models: {
      llm_large: {
        pass: true,
        score: 4.8,
        answer: 'Please make sure the device firmware is updated to the latest version before pairing.',
        reasoning: '語意精準、術語（firmware / pairing）正確，語氣自然。最終評分 4.8/5。'
      },
      llm_small: {
        pass: true,
        score: 3.9,
        answer: 'Please confirm the device software is newest before connecting.',
        reasoning: '語意可懂但術語不精確（software vs firmware、newest 用詞生硬）。最終評分 3.9/5。'
      }
    }
  }, {
    id: 2,
    question: '翻譯：「血氧感測器在高海拔環境下讀數可能偏低。」',
    gt: 'Pulse Ox readings may be lower at high altitude.',
    tags: ['術語', '健康數據'],
    models: {
      llm_large: {
        pass: true,
        score: 4.7,
        answer: 'Pulse Ox readings may read lower in high-altitude environments.',
        reasoning: '正確使用 Garmin 官方術語 Pulse Ox，語句通順。最終評分 4.7/5。'
      },
      llm_small: {
        pass: false,
        score: 2.6,
        answer: 'The blood oxygen sensor number maybe low when you are high place.',
        reasoning: '文法錯誤（maybe / high place），且未使用標準術語。最終評分 2.6/5。'
      }
    }
  }];

  /* ── VLM PER-CASE DETAIL ────────────────────────────────────────── */
  /* recognition: whole-match yes/no after lower-case normalization      */
  const CASES_FLAME = [{
    id: 1,
    task: 'recognition',
    question: '影像中是否出現明火 / 火焰？',
    expected: 'yes',
    tags: ['是非題'],
    models: {
      vlm_large: {
        response: 'Yes',
        pass: true
      },
      vlm_small: {
        response: 'yes',
        pass: true
      }
    }
  }, {
    id: 2,
    task: 'recognition',
    question: '裝置外殼是否有可見裂痕？',
    expected: 'no',
    tags: ['是非題'],
    models: {
      vlm_large: {
        response: 'No',
        pass: true
      },
      vlm_small: {
        response: 'NO',
        pass: true
      }
    }
  }, {
    id: 3,
    task: 'recognition',
    question: '影像中是否有水損痕跡（水漬 / 鏽蝕）？',
    expected: 'yes',
    tags: ['是非題', '邊緣案件'],
    models: {
      vlm_large: {
        response: 'No',
        pass: false
      },
      vlm_small: {
        response: 'Yes',
        pass: true
      }
    }
  }, {
    id: 4,
    task: 'recognition',
    question: '電池是否有膨脹變形？',
    expected: 'yes',
    tags: ['是非題'],
    models: {
      vlm_large: {
        response: 'Yes',
        pass: true
      },
      vlm_small: {
        response: 'No',
        pass: false
      }
    }
  }];
  /* ocr: exact match after uppercase + strip of separators              */
  const CASES_OCR = [{
    id: 1,
    task: 'ocr',
    question: '讀取機背序號標籤',
    expected: 'GRM7X428841',
    tags: ['OCR'],
    models: {
      vlm_large: {
        response: 'GRM-7X42-8841',
        pass: true
      },
      vlm_small: {
        response: 'grm-7x42-8841',
        pass: true
      }
    }
  }, {
    id: 2,
    task: 'ocr',
    question: '讀取充電座型號',
    expected: 'DCB10EU',
    tags: ['OCR'],
    models: {
      vlm_large: {
        response: 'DCB10-EU',
        pass: true
      },
      vlm_small: {
        response: 'DCBI0-EU',
        pass: false
      }
    }
  }, {
    id: 3,
    task: 'ocr',
    question: '讀取電池規格標籤',
    expected: '380MAH37V',
    tags: ['OCR', '邊緣案件'],
    models: {
      vlm_large: {
        response: '380mAh 3.7V',
        pass: true
      },
      vlm_small: {
        response: '380mAh 37V',
        pass: false
      }
    }
  }];
  /* locate: bbox grounding scored by IoU. boxes are pixel [x,y,w,h]      */
  const CASES_LOC = [{
    id: 1,
    task: 'locate',
    question: '請定位主機板上的電池接點 (battery connector)',
    img: {
      w: 640,
      h: 480
    },
    gt: [210, 150, 180, 96],
    tags: ['Grounding'],
    models: {
      vlm_large: {
        box: [219, 158, 170, 86],
        iou: .86,
        pass: true,
        note: '框選準確，輕微外擴'
      },
      vlm_small: {
        box: [150, 118, 150, 150],
        iou: .41,
        pass: false,
        note: '框過大且左偏，誤含周邊元件'
      }
    }
  }, {
    id: 2,
    task: 'locate',
    question: '請定位螢幕排線接頭 (display FPC connector)',
    img: {
      w: 640,
      h: 480
    },
    gt: [300, 250, 120, 70],
    tags: ['Grounding', '邊緣案件'],
    models: {
      vlm_large: {
        box: [296, 244, 128, 80],
        iou: .79,
        pass: true,
        note: '準確涵蓋接頭範圍'
      },
      vlm_small: {
        box: [330, 270, 150, 110],
        iou: .38,
        pass: false,
        note: '整體右下偏移，超出接頭'
      }
    }
  }];
  const CASES_BY_PROJECT = {
    general_qa: CASES_GQA,
    code_review: CASES_CODE,
    translation: CASES_TRANS,
    flame_detect: CASES_FLAME,
    serial_ocr: CASES_OCR,
    part_locate: CASES_LOC
  };

  /* ── HISTORY ────────────────────────────────────────────────────── */
  const LLM_METHODS = {
    llm_judge: {
      label: 'LLM-as-Judge',
      tone: 'builtin',
      desc: '以 LLM Large 當裁判，逐題給 0–5 分並附評語'
    },
    ragas: {
      label: 'RAGAS',
      tone: 'custom',
      desc: 'faithfulness · answer-relevancy · context-precision 綜合分'
    },
    deepeval: {
      label: 'DeepEval',
      tone: 'primary',
      desc: 'G-Eval + DAG 自訂指標，可寫單元測試式斷言',
      badge: '評估中',
      href: 'https://github.com/confident-ai/deepeval'
    }
  };
  /* task label lookup (history detail shows per-task breakdown) */
  const TASK_LABELS = {
    general_qa: '通用問答',
    code_review: '程式碼審查',
    translation: '中英翻譯',
    flame_detect: '影像辨識',
    serial_ocr: '序號 OCR',
    part_locate: '零件定位'
  };
  /* VLM history metrics — recognition/OCR are accuracy; grounding is mean IoU */
  const VLM_METRICS = [{
    key: 'recog',
    label: '影像辨識',
    unit: 'accuracy',
    hint: 'whole-match · output == expected'
  }, {
    key: 'ocr',
    label: '序號 OCR',
    unit: 'accuracy',
    hint: '精確比對 · 正規化字串相等'
  }, {
    key: 'iou',
    label: '零件定位',
    unit: 'mean IoU',
    hint: 'grounding · 交集 / 聯集'
  }];

  /* HISTORY_LLM — each run records the exact set of models that ran (varies run
     to run: a model may be added or dropped), each with overall judge score,
     regression count, and per-task scores. */
  const HISTORY_LLM = [{
    ts: 'Jun 18 14:30',
    method: 'deepeval',
    scope: '3 任務 · 70 題',
    current: true,
    baseline: {
      ts: 'Jun 11 09:02',
      method: 'ragas'
    },
    models: [{
      id: 'llm_large',
      label: 'LLM Large',
      score: .881,
      reg: 1,
      tasks: [{
        key: 'general_qa',
        score: .85
      }, {
        key: 'code_review',
        score: .84
      }, {
        key: 'translation',
        score: .95
      }]
    }, {
      id: 'llm_small',
      label: 'LLM Small',
      score: .731,
      reg: 0,
      tasks: [{
        key: 'general_qa',
        score: .66
      }, {
        key: 'code_review',
        score: .63
      }, {
        key: 'translation',
        score: .90
      }]
    }, {
      id: 'custom_1',
      label: 'Llama3-8B',
      score: .802,
      reg: 0,
      isNew: true,
      tasks: [{
        key: 'general_qa',
        score: .78
      }, {
        key: 'code_review',
        score: .74
      }, {
        key: 'translation',
        score: .89
      }]
    }]
  }, {
    ts: 'Jun 11 09:02',
    method: 'ragas',
    scope: '3 任務 · 70 題',
    baseline: {
      ts: 'Jun 04 16:32',
      method: 'ragas'
    },
    models: [{
      id: 'llm_large',
      label: 'LLM Large',
      score: .842,
      reg: 0,
      tasks: [{
        key: 'general_qa',
        score: .83
      }, {
        key: 'code_review',
        score: .80
      }, {
        key: 'translation',
        score: .90
      }]
    }, {
      id: 'llm_small',
      label: 'LLM Small',
      score: .726,
      reg: 0,
      tasks: [{
        key: 'general_qa',
        score: .67
      }, {
        key: 'code_review',
        score: .62
      }, {
        key: 'translation',
        score: .89
      }]
    }]
  }, {
    ts: 'Jun 04 16:32',
    method: 'ragas',
    scope: '3 任務 · 68 題',
    baseline: {
      ts: 'May 28 10:11',
      method: 'llm_judge'
    },
    models: [{
      id: 'llm_large',
      label: 'LLM Large',
      score: .836,
      reg: 2,
      tasks: [{
        key: 'general_qa',
        score: .82
      }, {
        key: 'code_review',
        score: .79
      }, {
        key: 'translation',
        score: .90
      }]
    }, {
      id: 'llm_small',
      label: 'LLM Small',
      score: .704,
      reg: 0,
      tasks: [{
        key: 'general_qa',
        score: .65
      }, {
        key: 'code_review',
        score: .60
      }, {
        key: 'translation',
        score: .86
      }]
    }]
  }, {
    ts: 'May 28 10:11',
    method: 'llm_judge',
    scope: '2 任務 · 52 題',
    baseline: {
      ts: 'May 21 09:40',
      method: 'llm_judge'
    },
    models: [{
      id: 'llm_large',
      label: 'LLM Large',
      score: .808,
      reg: 1,
      tasks: [{
        key: 'general_qa',
        score: .81
      }, {
        key: 'code_review',
        score: .76
      }]
    }, {
      id: 'llm_small',
      label: 'LLM Small',
      score: .688,
      reg: 0,
      tasks: [{
        key: 'general_qa',
        score: .70
      }, {
        key: 'code_review',
        score: .67
      }]
    }]
  }, {
    ts: 'May 21 09:40',
    method: 'llm_judge',
    scope: '2 任務 · 52 題',
    baseline: null,
    models: [{
      id: 'llm_large',
      label: 'LLM Large',
      score: .791,
      reg: 0,
      tasks: [{
        key: 'general_qa',
        score: .80
      }, {
        key: 'code_review',
        score: .78
      }]
    }]
  }];

  /* HISTORY_VLM — per run, per model: recognition accuracy, OCR accuracy, and
     grounding mean IoU. Model set AND task set vary: grounding (part_locate) was
     added Jun 05; vlm_small joined the same run; iou:null = task not run. */
  const HISTORY_VLM = [{
    ts: 'Jun 18 11:00',
    scope: '3 任務 · 80 題',
    current: true,
    baseline: {
      ts: 'Jun 12 15:20'
    },
    models: [{
      id: 'vlm_large',
      label: 'VLM Large',
      recog: .92,
      ocr: .97,
      iou: .86,
      counts: {
        recog: [23, 25],
        ocr: [29, 30],
        iou: 2
      }
    }, {
      id: 'vlm_small',
      label: 'VLM Small',
      recog: .84,
      ocr: .88,
      iou: .49,
      counts: {
        recog: [21, 25],
        ocr: [26, 30],
        iou: 2
      }
    }]
  }, {
    ts: 'Jun 12 15:20',
    scope: '3 任務 · 80 題',
    baseline: {
      ts: 'Jun 05 09:30'
    },
    models: [{
      id: 'vlm_large',
      label: 'VLM Large',
      recog: .90,
      ocr: .95,
      iou: .81,
      counts: {
        recog: [22, 25],
        ocr: [28, 30],
        iou: 2
      }
    }, {
      id: 'vlm_small',
      label: 'VLM Small',
      recog: .82,
      ocr: .86,
      iou: .44,
      counts: {
        recog: [20, 25],
        ocr: [25, 30],
        iou: 2
      }
    }]
  }, {
    ts: 'Jun 05 09:30',
    scope: '3 任務 · 78 題',
    baseline: {
      ts: 'May 29 14:05'
    },
    models: [{
      id: 'vlm_large',
      label: 'VLM Large',
      recog: .88,
      ocr: .96,
      iou: .74,
      counts: {
        recog: [22, 25],
        ocr: [28, 30],
        iou: 2
      }
    }, {
      id: 'vlm_small',
      label: 'VLM Small',
      recog: .80,
      ocr: .90,
      iou: null,
      counts: {
        recog: [20, 25],
        ocr: [27, 30]
      }
    }]
  }, {
    ts: 'May 29 14:05',
    scope: '2 任務 · 55 題',
    baseline: null,
    models: [{
      id: 'vlm_large',
      label: 'VLM Large',
      recog: .86,
      ocr: .93,
      iou: null,
      counts: {
        recog: [21, 25],
        ocr: [28, 30]
      }
    }]
  }];

  /* ── SHARED CONSTANTS & HELPERS ─────────────────────────────────── */
  const STAGES = ['連接模型…', '載入測試案例…', '執行推論中…', '評分 / 比對中…', '完成！'];
  const MC = {
    llm_large: '#3b82f6',
    llm_small: '#60a5fa',
    vlm_large: '#a855f7',
    vlm_small: '#c084fc',
    custom_1: '#14b8a6'
  };
  const CAP_CLR = {
    'Text Gen': {
      bg: 'hsl(243 80% 60%/.1)',
      color: 'hsl(243 75% 40%)'
    },
    'Code': {
      bg: 'hsl(195 80% 50%/.1)',
      color: 'hsl(195 80% 30%)'
    },
    'Translation': {
      bg: 'hsl(340 70% 55%/.1)',
      color: 'hsl(340 70% 38%)'
    },
    'Recognition': {
      bg: 'hsl(160 60% 40%/.1)',
      color: 'hsl(160 60% 28%)'
    },
    'OCR': {
      bg: 'hsl(265 60% 55%/.12)',
      color: 'hsl(265 55% 45%)'
    },
    'Grounding': {
      bg: 'hsl(243 80% 60%/.1)',
      color: 'hsl(243 75% 40%)'
    }
  };
  const S = {
    card: {
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)'
    },
    mono: {
      fontFamily: 'var(--font-mono)'
    },
    muted: {
      color: 'hsl(var(--muted-foreground))'
    },
    lbl: {
      fontSize: 'var(--text-xs)',
      fontFamily: 'var(--font-mono)',
      color: 'hsl(var(--muted-foreground))'
    }
  };
  const sc = v => v >= .85 ? 'hsl(160 70% 28%)' : v >= .4 ? 'hsl(38 80% 30%)' : 'hsl(0 72% 38%)';
  const sb = v => v >= .85 ? 'hsl(var(--score-high))' : v >= .4 ? 'hsl(var(--score-mid))' : 'hsl(var(--score-low))';
  const isRegr = (c, bId, nId) => !!(c.models[bId]?.pass && !c.models[nId]?.pass);
  window.BM = {
    INIT_MODELS,
    LLM_PROJECTS,
    VLM_PROJECTS,
    RESULTS,
    CASES_BY_PROJECT,
    LLM_METHODS,
    HISTORY_LLM,
    HISTORY_VLM,
    VLM_METRICS,
    TASK_LABELS,
    STAGES,
    MC,
    CAP_CLR,
    S,
    sc,
    sb,
    isRegr
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/benchmark/data.js", error: String((e && e.message) || e) }); }

// ui_kits/benchmark/history.jsx
try { (() => {
/* ════════════════════════════════════════════════════════════════
   History — each run is an expandable row. Click to drill into every
   model that ran (the model set varies run to run: one may be added or
   dropped). LLM shows per-task judge scores; VLM shows recognition /
   OCR accuracy and grounding mean IoU.
   ════════════════════════════════════════════════════════════════ */
const {
  LLM_METHODS,
  HISTORY_LLM,
  HISTORY_VLM,
  VLM_METRICS,
  TASK_LABELS,
  MC
} = window.BM;
const H_S = window.BM.S,
  hsc = window.BM.sc,
  hsb = window.BM.sb;
const hmono = H_S.mono,
  hmuted = H_S.muted,
  hlbl = H_S.lbl,
  hcard = H_S.card;
function MethodBadge({
  method
}) {
  const m = LLM_METHODS[method];
  if (!m) return null;
  const tone = m.tone === 'primary' ? {
    bg: 'hsl(var(--primary)/.12)',
    fg: 'hsl(var(--primary))',
    bd: 'hsl(var(--primary)/.35)'
  } : m.tone === 'custom' ? {
    bg: 'hsl(var(--model-custom-soft))',
    fg: 'hsl(var(--model-custom))',
    bd: 'hsl(var(--model-custom)/.4)'
  } : {
    bg: 'hsl(var(--model-builtin-soft))',
    fg: 'hsl(var(--model-builtin))',
    bd: 'hsl(var(--border))'
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 9px',
      borderRadius: 'var(--radius-full)',
      ...hmono,
      fontSize: 10,
      fontWeight: 600,
      background: tone.bg,
      color: tone.fg,
      border: `1px solid ${tone.bd}`
    }
  }, m.label, m.badge && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      opacity: .8,
      fontWeight: 400
    }
  }, "\xB7 ", m.badge));
}

/* small colored model dot + label, used in the collapsed row */
function ModelDot({
  id,
  label,
  isNew
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      ...hmono,
      fontSize: 10,
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--secondary))',
      border: '1px solid hsl(var(--border))',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: 'hsl(var(--muted-foreground))',
      flexShrink: 0
    }
  }), label, isNew && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 8,
      fontWeight: 700,
      color: 'hsl(var(--model-custom))',
      background: 'hsl(var(--model-custom-soft))',
      padding: '0 4px',
      borderRadius: 3
    }
  }, "\u65B0\u589E"));
}

/* a thin score/metric bar with a value chip */
function MiniBar({
  value,
  width = null
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 60,
      height: 7,
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: value * 100 + '%',
      height: '100%',
      background: hsb(value),
      borderRadius: 'var(--radius-full)'
    }
  }));
}

/* delta vs a baseline value: ▲ up (green) / ▼ down (red) / ＝ flat / 新 if none */
function Delta({
  cur,
  base,
  w = 52
}) {
  if (base == null) return /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 9,
      fontWeight: 700,
      color: 'hsl(var(--model-custom))',
      width: w,
      textAlign: 'right',
      flexShrink: 0
    }
  }, "\u65B0\u589E");
  const d = cur - base,
    flat = Math.abs(d) < 0.005;
  const col = flat ? 'hsl(var(--muted-foreground))' : d > 0 ? 'hsl(160 70% 28%)' : 'hsl(0 72% 38%)';
  const arr = flat ? '＝' : d > 0 ? '▲' : '▼';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 9,
      fontWeight: 700,
      color: col,
      width: w,
      textAlign: 'right',
      flexShrink: 0,
      fontVariantNumeric: 'tabular-nums'
    }
  }, arr, flat ? '' : (Math.abs(d) * 100).toFixed(1));
}

/* "compared against" reference banner shown at the top of an expanded run */
function BaselineNote({
  baseline,
  methodLabel,
  comparable = true
}) {
  if (!baseline) return /*#__PURE__*/React.createElement("div", {
    style: {
      ...hmono,
      fontSize: 10,
      ...hlbl,
      margin: '9px 0 4px',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11
    }
  }, "\u25F7"), " \u9996\u6B21\u57F7\u884C \xB7 \u7121\u6BD4\u8F03\u57FA\u6E96");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...hmono,
      fontSize: 10,
      margin: '9px 0 4px',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      color: 'hsl(var(--muted-foreground))',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11
    }
  }, "\u21C4"), "\u6BD4\u8F03\u57FA\u6E96\uFF1A", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: 'hsl(var(--foreground))',
      padding: '1px 7px',
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--secondary))',
      border: '1px solid hsl(var(--border))'
    }
  }, baseline.ts, methodLabel ? ` · ${methodLabel}` : ''), comparable ? /*#__PURE__*/React.createElement("span", {
    style: {
      ...hlbl,
      fontSize: 9
    }
  }, "\uFF08\u540C\u4E00\u6A21\u578B\u9010\u984C\u6BD4\u8F03\uFF0C\u25B3 \u70BA\u8207\u57FA\u6E96\u5DEE\u8DDD\uFF09") : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 600,
      color: 'hsl(0 72% 38%)'
    }
  }, "\u8DE8\u8A55\u5206\u6CD5\uFF1A\u50C5\u6BD4\u8F03\u901A\u904E / \u9000\u6B65\uFF0C\u5206\u6578\u4E0D\u53EF\u76F4\u63A5\u76F8\u6E1B"));
}
const findRun = (list, ts) => ts ? list.find(r => r.ts === ts) : null;
const baseEntry = (run, id) => run ? run.models.find(m => m.id === id) : null;

/* expandable run shell shared by LLM + VLM */
function RunRow({
  open,
  onToggle,
  current,
  summary,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${current ? 'hsl(var(--primary)/.4)' : 'hsl(var(--border))'}`,
      background: current ? 'hsl(var(--primary)/.04)' : 'hsl(var(--secondary))',
      overflow: 'hidden',
      transition: 'border-color .15s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onToggle,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '9px 12px',
      cursor: 'pointer'
    }
  }, summary, /*#__PURE__*/React.createElement("svg", {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "hsl(var(--muted-foreground))",
    strokeWidth: 2,
    style: {
      flexShrink: 0,
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'transform .2s'
    }
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "6 9 12 15 18 9"
  }))), open && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 12px 12px',
      borderTop: '1px solid hsl(var(--border))'
    }
  }, children));
}
function HistoryPanel() {
  const [tab, setTab] = React.useState('LLM');
  const Tabs = /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'var(--radius-full)',
      overflow: 'hidden',
      background: 'hsl(var(--secondary))'
    }
  }, ['LLM', 'VLM'].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setTab(t),
    style: {
      ...hmono,
      fontSize: 'var(--text-xs)',
      padding: '4px 16px',
      border: 'none',
      cursor: 'pointer',
      background: tab === t ? 'hsl(var(--primary))' : 'transparent',
      color: tab === t ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
      fontWeight: tab === t ? 600 : 400,
      transition: 'all .12s'
    }
  }, t)));
  return /*#__PURE__*/React.createElement("div", {
    className: "animate-slide-up",
    style: {
      ...hcard,
      padding: 18,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "hsl(var(--primary))",
    strokeWidth: 2
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 3v5h5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3.05 13A9 9 0 106 5.3L3 8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l4 2"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 'var(--text-sm)'
    }
  }, "\u6B77\u53F2\u8DA8\u52E2"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...hlbl,
      fontSize: 10
    }
  }, "\u9EDE\u4EFB\u4E00\u7B46\u7D00\u9304\u53EF\u5C55\u958B\u8A72\u6B21\u8DD1\u7684\u5404\u6A21\u578B\u8868\u73FE"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto'
    }
  }, Tabs)), tab === 'LLM' ? /*#__PURE__*/React.createElement(LlmHistory, null) : /*#__PURE__*/React.createElement(VlmHistory, null));
}

/* ── LLM history ─────────────────────────────────────────── */
function LlmHistory() {
  const [open, setOpen] = React.useState(0); // first (current) run open
  const meanOf = r => r.models.reduce((s, m) => s + m.score, 0) / r.models.length;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      alignItems: 'flex-start',
      marginBottom: 14,
      padding: '10px 12px',
      background: 'hsl(var(--accent)/.4)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid hsl(var(--border))'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'hsl(var(--primary))'
    }
  }, "\u24D8"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      ...hmono,
      lineHeight: 1.7,
      color: 'hsl(var(--foreground))'
    }
  }, "LLM \u8A55\u5206\u65B9\u5F0F\u5F9E\u65E9\u671F\u7684 ", /*#__PURE__*/React.createElement("b", null, "LLM-as-Judge"), " \u2192 ", /*#__PURE__*/React.createElement("b", null, "RAGAS"), "\uFF0C\u76EE\u524D\u6B63\u8A55\u4F30\u6539\u7528", ' ', /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/confident-ai/deepeval",
    target: "_blank",
    rel: "noreferrer",
    style: {
      color: 'hsl(var(--primary))',
      fontWeight: 700,
      borderBottom: '1px solid hsl(var(--primary)/.4)',
      textDecoration: 'none'
    }
  }, "DeepEval"), "\uFF08G-Eval / DAG\uFF0C\u53EF\u5BEB\u55AE\u5143\u6E2C\u8A66\u5F0F\u65B7\u8A00\uFF09\u3002", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'hsl(0 72% 38%)',
      fontWeight: 600
    }
  }, "\u6CE8\u610F\uFF1A\u4E0D\u540C\u8A55\u5206\u6CD5\u7684\u5206\u6578\u6A19\u6E96\u4E0D\u540C\uFF0C\u8DE8\u65B9\u6CD5\u7684\u7D55\u5C0D\u6578\u503C\u4E0D\u53EF\u76F4\u63A5\u6BD4\u8F03"), "\uFF0C\u8ACB\u4EE5\u540C\u4E00\u65B9\u6CD5\u5167\u7684\u76F8\u5C0D\u8DA8\u52E2\u70BA\u6E96\u3002")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap',
      marginBottom: 12
    }
  }, Object.keys(LLM_METHODS).map(k => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      fontSize: 'var(--text-xs)',
      ...hmuted
    }
  }, /*#__PURE__*/React.createElement(MethodBadge, {
    method: k
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      lineHeight: 1.5
    }
  }, LLM_METHODS[k].desc)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, HISTORY_LLM.map((r, i) => {
    const mean = meanOf(r);
    const totalReg = r.models.reduce((s, m) => s + (m.reg || 0), 0);
    const summary = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 88,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...hmono,
        fontSize: 10,
        ...hmuted
      }
    }, r.ts), /*#__PURE__*/React.createElement("div", {
      style: {
        ...hlbl,
        fontSize: 9,
        marginTop: 1
      }
    }, r.scope)), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 118,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(MethodBadge, {
      method: r.method
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        ...hlbl,
        fontSize: 9,
        flexShrink: 0,
        width: 40
      }
    }, r.models.length, " \u6A21\u578B"), /*#__PURE__*/React.createElement("span", {
      style: {
        ...hlbl,
        fontSize: 9,
        flexShrink: 0,
        width: 24
      }
    }, "\u5E73\u5747"), /*#__PURE__*/React.createElement(MiniBar, {
      value: mean
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...hmono,
        fontSize: 'var(--text-sm)',
        fontWeight: 900,
        color: hsc(mean),
        width: 50,
        textAlign: 'right',
        flexShrink: 0
      }
    }, (mean * 100).toFixed(1), "%"), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 58,
        textAlign: 'right',
        flexShrink: 0,
        ...hmono,
        fontSize: 10,
        fontWeight: totalReg > 0 ? 700 : 400,
        color: totalReg > 0 ? 'hsl(0 72% 38%)' : 'hsl(var(--muted-foreground))'
      }
    }, totalReg > 0 ? `⚠ ${totalReg} 退步` : '無退步'));
    const baseRun = findRun(HISTORY_LLM, r.baseline && r.baseline.ts);
    const comparable = !!(r.baseline && r.baseline.method === r.method);
    return /*#__PURE__*/React.createElement(RunRow, {
      key: i,
      current: r.current,
      open: open === i,
      onToggle: () => setOpen(open === i ? -1 : i),
      summary: summary
    }, /*#__PURE__*/React.createElement(BaselineNote, {
      baseline: r.baseline,
      comparable: comparable,
      methodLabel: r.baseline ? (LLM_METHODS[r.baseline.method] || {}).label : ''
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginTop: 4
      }
    }, r.models.map(m => /*#__PURE__*/React.createElement(LlmModelDetail, {
      key: m.id,
      m: m,
      base: baseEntry(baseRun, m.id),
      baseRef: r.baseline,
      comparable: comparable
    }))));
  })));
}
function LlmModelDetail({
  m,
  base,
  baseRef,
  comparable
}) {
  const taskBase = key => base ? (base.tasks.find(t => t.key === key) || {}).score : null;
  const showDelta = comparable && !!base;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...hcard,
      padding: '10px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 9,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: hsb(m.score),
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 'var(--text-sm)',
      fontWeight: 700
    }
  }, m.label), m.isNew && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 700,
      color: 'hsl(var(--model-custom))',
      background: 'hsl(var(--model-custom-soft))',
      padding: '1px 6px',
      borderRadius: 'var(--radius-full)',
      border: '1px solid hsl(var(--model-custom)/.4)'
    }
  }, "\u672C\u6B21\u65B0\u589E"), base ? /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 9,
      ...hlbl
    }
  }, "\u57FA\u6E96 ", baseRef ? baseRef.ts : '', comparable ? ` · ${(base.score * 100).toFixed(1)}%` : '') : !m.isNew && baseRef && /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 9,
      ...hlbl
    }
  }, "\u57FA\u6E96\u672A\u57F7\u884C\u6B64\u6A21\u578B"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'baseline',
      gap: 7
    }
  }, showDelta && /*#__PURE__*/React.createElement(Delta, {
    cur: m.score,
    base: base.score,
    w: 44
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 20,
      fontWeight: 900,
      color: hsc(m.score),
      fontVariantNumeric: 'tabular-nums'
    }
  }, (m.score * 100).toFixed(1), "%")), m.reg > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 10,
      fontWeight: 700,
      color: 'hsl(0 72% 38%)',
      background: 'hsl(var(--destructive)/.08)',
      padding: '1px 7px',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid hsl(var(--destructive)/.3)'
    }
  }, "\u26A0 \u9000\u6B65 ", m.reg, baseRef ? ` · vs ${baseRef.ts}` : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, m.tasks.map(t => {
    const bt = taskBase(t.key);
    return /*#__PURE__*/React.createElement("div", {
      key: t.key,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...hmono,
        fontSize: 11,
        width: 96,
        flexShrink: 0,
        color: 'hsl(var(--foreground))'
      }
    }, TASK_LABELS[t.key] || t.key), /*#__PURE__*/React.createElement(MiniBar, {
      value: t.score
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...hmono,
        fontSize: 11,
        fontWeight: 700,
        color: hsc(t.score),
        width: 40,
        textAlign: 'right',
        flexShrink: 0
      }
    }, (t.score * 100).toFixed(0), "%"), showDelta && /*#__PURE__*/React.createElement(Delta, {
      cur: t.score,
      base: bt == null ? null : bt,
      w: 44
    }));
  })));
}

/* ── VLM history ─────────────────────────────────────────── */
function VlmHistory() {
  const [open, setOpen] = React.useState(0);
  /* mean of a metric across the models that actually ran it (null → skipped) */
  const meanMetric = (r, key) => {
    const vals = r.models.map(m => m[key]).filter(v => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      alignItems: 'flex-start',
      marginBottom: 14,
      padding: '10px 12px',
      background: 'hsl(var(--accent)/.4)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid hsl(var(--border))'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'hsl(var(--primary))'
    }
  }, "\u24D8"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      ...hmono,
      lineHeight: 1.7,
      color: 'hsl(var(--foreground))'
    }
  }, "VLM \u4EE5\u53EF\u91CD\u73FE\u7684\u5BA2\u89C0\u6307\u6A19\u8A55\u5206\uFF1A\u8FA8\u8B58\u984C\u8207 OCR \u7528 ", /*#__PURE__*/React.createElement("b", null, "accuracy"), "\uFF08whole-match / \u7CBE\u78BA\u6BD4\u5C0D\uFF09\uFF0C\u5B9A\u4F4D\u984C\uFF08grounding\uFF09\u7528 ", /*#__PURE__*/React.createElement("b", null, "mean IoU"), "\u3002\u6307\u6A19\u6A19\u6E96\u56FA\u5B9A\uFF0C\u6578\u503C\u53EF\u76F4\u63A5\u8DE8\u6642\u9593\u6BD4\u8F03\u3002", /*#__PURE__*/React.createElement("span", {
    style: {
      ...hlbl
    }
  }, "\u4E0D\u540C\u6B21\u8DD1\u7684\u6A21\u578B / \u4EFB\u52D9\u7D44\u53EF\u80FD\u4E0D\u540C\uFF0C", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'hsl(var(--foreground))'
    }
  }, "\u2014"), " \u8868\u793A\u8A72\u6B21\u672A\u57F7\u884C\u3002"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap',
      marginBottom: 12
    }
  }, VLM_METRICS.map(mt => /*#__PURE__*/React.createElement("div", {
    key: mt.key,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 'var(--text-xs)',
      ...hmuted
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 11,
      fontWeight: 700,
      color: 'hsl(var(--foreground))'
    }
  }, mt.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      padding: '1px 6px',
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--secondary))',
      border: '1px solid hsl(var(--border))',
      ...hmono,
      fontWeight: 600
    }
  }, mt.unit)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, HISTORY_VLM.map((r, i) => {
    const summary = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 88,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...hmono,
        fontSize: 10,
        ...hmuted
      }
    }, r.ts), /*#__PURE__*/React.createElement("div", {
      style: {
        ...hlbl,
        fontSize: 9,
        marginTop: 1
      }
    }, r.scope)), /*#__PURE__*/React.createElement("span", {
      style: {
        ...hlbl,
        fontSize: 9,
        flexShrink: 0,
        width: 40
      }
    }, r.models.length, " \u6A21\u578B"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        minWidth: 0
      }
    }, VLM_METRICS.map(mt => {
      const v = meanMetric(r, mt.key);
      return /*#__PURE__*/React.createElement("span", {
        key: mt.key,
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          ...hmono,
          fontSize: 10,
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          ...hmuted,
          fontSize: 9
        }
      }, mt.label), v == null ? /*#__PURE__*/React.createElement("span", {
        style: {
          ...hlbl
        }
      }, "\u2014") : /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 800,
          color: hsc(v)
        }
      }, (v * 100).toFixed(0), "%"));
    })));
    return /*#__PURE__*/React.createElement(RunRow, {
      key: i,
      current: r.current,
      open: open === i,
      onToggle: () => setOpen(open === i ? -1 : i),
      summary: summary
    }, /*#__PURE__*/React.createElement(BaselineNote, {
      baseline: r.baseline
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginTop: 4
      }
    }, r.models.map(m => /*#__PURE__*/React.createElement(VlmModelDetail, {
      key: m.id,
      m: m,
      base: baseEntry(findRun(HISTORY_VLM, r.baseline && r.baseline.ts), m.id),
      baseRef: r.baseline
    }))));
  })));
}
function VlmModelDetail({
  m,
  base,
  baseRef
}) {
  const _vals = VLM_METRICS.map(mt => m[mt.key]).filter(v => v != null);
  const _mean = _vals.length ? _vals.reduce((a, b) => a + b, 0) / _vals.length : 0;
  const isNewModel = baseRef && !base;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...hcard,
      padding: '10px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 9,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: hsb(_mean),
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 'var(--text-sm)',
      fontWeight: 700
    }
  }, m.label), isNewModel && /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 9,
      ...hlbl
    }
  }, "\u57FA\u6E96\u672A\u57F7\u884C\u6B64\u6A21\u578B"), base && baseRef && /*#__PURE__*/React.createElement("span", {
    style: {
      ...hmono,
      fontSize: 9,
      ...hlbl,
      marginLeft: 'auto'
    }
  }, "\u57FA\u6E96 ", baseRef.ts)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
      gap: 8
    }
  }, VLM_METRICS.map(mt => {
    const v = m[mt.key];
    const ran = v != null;
    const cnt = m.counts && m.counts[mt.key];
    const bv = base ? base[mt.key] : null;
    return /*#__PURE__*/React.createElement("div", {
      key: mt.key,
      style: {
        padding: '8px 10px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${ran ? 'hsl(var(--border))' : 'hsl(var(--border))'}`,
        background: ran ? 'hsl(var(--secondary))' : 'hsl(var(--muted)/.4)',
        opacity: ran ? 1 : .7
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...hmono,
        fontSize: 11,
        fontWeight: 700,
        color: 'hsl(var(--foreground))'
      }
    }, mt.label), /*#__PURE__*/React.createElement("span", {
      style: {
        ...hlbl,
        fontSize: 8
      }
    }, mt.unit)), ran ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...hmono,
        fontSize: 20,
        fontWeight: 900,
        color: hsc(v),
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1
      }
    }, (v * 100).toFixed(0), "%"), mt.key !== 'iou' && Array.isArray(cnt) && /*#__PURE__*/React.createElement("span", {
      style: {
        ...hlbl,
        fontSize: 9
      }
    }, cnt[0], "/", cnt[1], " \u6B63\u78BA"), mt.key === 'iou' && cnt != null && /*#__PURE__*/React.createElement("span", {
      style: {
        ...hlbl,
        fontSize: 9
      }
    }, cnt, " \u6846"), baseRef && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto'
      }
    }, /*#__PURE__*/React.createElement(Delta, {
      cur: v,
      base: bv,
      w: 40
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 6,
        borderRadius: 'var(--radius-full)',
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: v * 100 + '%',
        height: '100%',
        background: hsb(v),
        borderRadius: 'var(--radius-full)'
      }
    }))) : /*#__PURE__*/React.createElement("div", {
      style: {
        ...hmono,
        fontSize: 11,
        ...hlbl,
        padding: '6px 0 2px'
      }
    }, "\u2014 \u6B64\u6B21\u672A\u57F7\u884C"));
  })));
}
Object.assign(window, {
  HistoryPanel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/benchmark/history.jsx", error: String((e && e.message) || e) }); }

// ui_kits/benchmark/parts.jsx
try { (() => {
/* ════════════════════════════════════════════════════════════════
   Benchmark — presentational components → window globals
   Reads data + helpers from window.BM
   ════════════════════════════════════════════════════════════════ */
const {
  MC,
  CAP_CLR,
  S,
  sc,
  sb,
  isRegr
} = window.BM;
const {
  card,
  mono,
  muted,
  lbl
} = S;

/* ── TAG CHIP ────────────────────────────────────────────── */
function Tag({
  t
}) {
  const warn = t.includes('案件') || t.includes('Edge');
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      padding: '1px 7px',
      borderRadius: 'var(--radius-full)',
      fontSize: 10,
      ...mono,
      background: warn ? 'hsl(38 92% 50%/.1)' : 'hsl(var(--secondary))',
      color: warn ? 'hsl(38 80% 28%)' : 'hsl(var(--muted-foreground))',
      border: '1px solid hsl(var(--border))'
    }
  }, t);
}

/* ── JUDGE PANEL (LLM per-model reasoning) ───────────────── */
function JudgePanel({
  modelLabel,
  reasoning,
  isWinner
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      padding: '10px 12px',
      background: 'hsl(var(--primary)/.06)',
      border: '1px solid hsl(var(--primary)/.2)',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      ...mono,
      color: 'hsl(var(--primary))',
      fontWeight: 600
    }
  }, "\u2696 \u88C1\u5224\u5C0D ", modelLabel, " \u7684\u8A55\u8A9E"), isWinner && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      padding: '0 6px',
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--success)/.12)',
      color: 'hsl(160 70% 28%)',
      border: '1px solid hsl(var(--success)/.3)',
      ...mono
    }
  }, "\u88C1\u5B9A\u52DD\u51FA")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xs)',
      ...mono,
      lineHeight: 1.75,
      color: 'hsl(var(--foreground))'
    }
  }, reasoning));
}

/* ── LLM CASE ROW ────────────────────────────────────────── */
function LlmCaseRow({
  c,
  baseId,
  candId,
  enabledModels,
  layout,
  judgeOpen,
  onJudge
}) {
  const reg = isRegr(c, baseId, candId);
  const modelIds = enabledModels.map(m => m.id).filter(id => c.models[id]);
  const winner = modelIds.reduce((b, id) => (c.models[id]?.score || 0) > (c.models[b]?.score || 0) ? id : b, modelIds[0]);
  const AnswerCol = ({
    id
  }) => {
    const r = c.models[id];
    if (!r) return null;
    const col = MC[id] || '#14b8a6';
    const m = enabledModels.find(m => m.id === id);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 5,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: col,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono,
        fontSize: 'var(--text-xs)',
        fontWeight: 700
      }
    }, m?.label || id), /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono,
        fontSize: 13,
        fontWeight: 900,
        color: sc(r.score / 5)
      }
    }, r.score, "/5"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        padding: '1px 7px',
        borderRadius: 'var(--radius-full)',
        background: r.pass ? 'hsl(var(--success)/.1)' : 'hsl(var(--destructive)/.1)',
        color: r.pass ? 'hsl(160 70% 28%)' : 'hsl(0 72% 38%)',
        border: `1px solid ${r.pass ? 'hsl(var(--success)/.3)' : 'hsl(var(--destructive)/.3)'}`,
        ...mono
      }
    }, r.pass ? '✓ Pass' : '✗ Fail')), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 'var(--text-xs)',
        lineHeight: 1.7,
        color: 'hsl(var(--foreground))'
      }
    }, r.answer));
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      marginBottom: 10,
      overflow: 'hidden',
      borderColor: reg ? 'hsl(var(--destructive)/.4)' : 'hsl(var(--border))'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 3,
      background: reg ? 'hsl(var(--destructive))' : 'hsl(var(--border))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 10,
      ...muted,
      flexShrink: 0,
      paddingTop: 2
    }
  }, "Q", c.id), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      flex: 1,
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      lineHeight: 1.5
    }
  }, c.question), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      flexShrink: 0,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, c.tags?.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    t: t
  })), reg && /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 10,
      padding: '1px 8px',
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--destructive)/.1)',
      color: 'hsl(0 72% 38%)',
      border: '1px solid hsl(var(--destructive)/.35)',
      fontWeight: 700
    }
  }, "\u26A0 \u9000\u6B65"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 10,
      flexDirection: layout === 'three' ? 'column' : 'row'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: layout === 'three' ? 'none' : '0 0 190px',
      padding: '8px 10px',
      background: 'hsl(var(--secondary))',
      borderRadius: 'var(--radius-sm)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...lbl,
      fontWeight: 700,
      display: 'block',
      marginBottom: 4
    }
  }, "\u6A19\u6E96\u7B54\u6848"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xs)',
      lineHeight: 1.7
    }
  }, c.gt)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 2,
      display: 'flex',
      gap: 10
    }
  }, modelIds.map(id => /*#__PURE__*/React.createElement(AnswerCol, {
    key: id,
    id: id
  })))), /*#__PURE__*/React.createElement("button", {
    onClick: onJudge,
    style: {
      ...mono,
      fontSize: 10,
      padding: '3px 11px',
      border: `1px solid ${judgeOpen ? 'hsl(var(--primary))' : 'hsl(var(--primary)/.35)'}`,
      borderRadius: 'var(--radius-full)',
      background: judgeOpen ? 'hsl(var(--primary)/.1)' : 'transparent',
      color: 'hsl(var(--primary))',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u2696"), " AI \u88C1\u5224\u8A55\u8A9E ", /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .7
    }
  }, judgeOpen ? '▲' : '▼')), judgeOpen && modelIds.map(id => c.models[id]?.reasoning && /*#__PURE__*/React.createElement(JudgePanel, {
    key: id,
    modelLabel: enabledModels.find(m => m.id === id)?.label || id,
    reasoning: c.models[id].reasoning,
    isWinner: id === winner
  }))));
}

/* ── BBOX VIEWER (locate) ────────────────────────────────── */
function BBoxViewer({
  img,
  gt,
  preds
}) {
  const [hov, setHov] = React.useState(null); // 'gt' | model id
  const pct = (b, axis) => (axis === 'x' ? b[0] : b[1]) / (axis === 'x' ? img.w : img.h) * 100;
  const pctw = b => b[2] / img.w * 100,
    pcth = b => b[3] / img.h * 100;
  const Box = ({
    box,
    color,
    k,
    label,
    dashed
  }) => {
    const active = hov === k;
    return /*#__PURE__*/React.createElement("div", {
      onMouseEnter: () => setHov(k),
      onMouseLeave: () => setHov(null),
      style: {
        position: 'absolute',
        left: pct(box, 'x') + '%',
        top: pct(box, 'y') + '%',
        width: pctw(box) + '%',
        height: pcth(box) + '%',
        border: `2px ${dashed ? 'dashed' : 'solid'} ${color}`,
        borderRadius: 2,
        boxShadow: active ? `0 0 0 2px ${color}55` : 'none',
        background: active ? color + '22' : 'transparent',
        transition: 'background .12s, box-shadow .12s',
        cursor: 'crosshair',
        zIndex: active ? 5 : 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: -17,
        left: -2,
        fontSize: 9,
        ...mono,
        fontWeight: 700,
        color: '#fff',
        background: color,
        padding: '0 5px',
        borderRadius: 2,
        whiteSpace: 'nowrap'
      }
    }, label), active && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        bottom: -17,
        left: -2,
        fontSize: 9,
        ...mono,
        color: '#fff',
        background: 'hsl(var(--tooltip-bg))',
        padding: '1px 5px',
        borderRadius: 2,
        whiteSpace: 'nowrap',
        zIndex: 9
      }
    }, "x", box[0], " y", box[1], " \xB7 ", box[2], "\xD7", box[3], "px"));
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: '1 1 360px',
      minWidth: 300,
      maxWidth: 460,
      aspectRatio: `${img.w} / ${img.h}`,
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: '1px solid hsl(var(--border))',
      backgroundColor: 'hsl(var(--secondary))',
      backgroundImage: 'repeating-linear-gradient(45deg, hsl(var(--border)/.5) 0 1px, transparent 1px 11px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 11,
      ...muted,
      opacity: .7,
      textAlign: 'center',
      padding: 8
    }
  }, "PCB \u6AA2\u6E2C\u5F71\u50CF", /*#__PURE__*/React.createElement("br", null), img.w, "\xD7", img.h, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .7
    }
  }, "\uFF08\u62D6\u5165\u5BE6\u969B\u5F71\u50CF\uFF09"))), /*#__PURE__*/React.createElement(Box, {
    box: gt,
    color: "#00E676",
    k: "gt",
    label: "\u6A19\u6E96\u6846 GT"
  }), preds.map(p => /*#__PURE__*/React.createElement(Box, {
    key: p.id,
    box: p.box,
    color: p.color,
    k: p.id,
    label: p.label,
    dashed: true
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 200px',
      minWidth: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 11,
      ...mono
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 14,
      height: 0,
      borderTop: '2px solid var(--bbox-gt)'
    }
  }), " \u6A19\u6E96\u6846 (Ground Truth)", /*#__PURE__*/React.createElement("span", {
    style: {
      ...muted,
      marginLeft: 'auto'
    }
  }, gt[0], ",", gt[1], " \xB7 ", gt[2], "\xD7", gt[3])), preds.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    onMouseEnter: () => setHov(p.id),
    onMouseLeave: () => setHov(null),
    style: {
      padding: '8px 10px',
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${hov === p.id ? p.color : 'hsl(var(--border))'}`,
      background: hov === p.id ? p.color + '12' : 'hsl(var(--secondary))',
      transition: 'all .12s',
      cursor: 'crosshair'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 14,
      height: 0,
      borderTop: `2px dashed ${p.color}`
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 11,
      fontWeight: 700
    }
  }, p.label), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 12,
      fontWeight: 900,
      marginLeft: 'auto',
      color: sc(p.iou)
    }
  }, "IoU ", (p.iou * 100).toFixed(0), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono,
      fontSize: 10,
      ...muted
    }
  }, "\u9810\u6E2C\u5EA7\u6A19 ", p.box[0], ",", p.box[1], " \xB7 ", p.box[2], "\xD7", p.box[3], "px"), p.note && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      ...muted,
      marginTop: 3,
      lineHeight: 1.5
    }
  }, p.note))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontSize: 10,
      ...lbl,
      lineHeight: 1.6
    }
  }, "\u6ED1\u904E\u6846\u7DDA\u6216\u5361\u7247\u53EF\u9AD8\u4EAE\u5C0D\u61C9\u5340\u57DF\u4E26\u986F\u793A\u539F\u59CB\u50CF\u7D20\u5EA7\u6A19\u3002")));
}

/* ── VLM CASE ROW ────────────────────────────────────────── */
function normRecog(s) {
  return (s || '').trim().toLowerCase();
}
function normOcr(s) {
  return (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}
function VlmCaseRow({
  c,
  baseId,
  candId,
  enabledModels
}) {
  const reg = isRegr(c, baseId, candId);
  const modelIds = enabledModels.map(m => m.id).filter(id => c.models[id]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      marginBottom: 10,
      overflow: 'hidden',
      borderColor: reg ? 'hsl(var(--destructive)/.4)' : 'hsl(var(--border))'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 3,
      background: reg ? 'hsl(var(--destructive))' : 'hsl(var(--border))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 10,
      ...muted,
      flexShrink: 0,
      paddingTop: 2
    }
  }, "Q", c.id), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      flex: 1,
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      lineHeight: 1.5
    }
  }, c.question), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      flexShrink: 0,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, c.tags?.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    t: t
  })), reg && /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 10,
      padding: '1px 8px',
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--destructive)/.1)',
      color: 'hsl(0 72% 38%)',
      border: '1px solid hsl(var(--destructive)/.35)',
      fontWeight: 700
    }
  }, "\u26A0 \u9000\u6B65"))), c.task === 'locate' ? /*#__PURE__*/React.createElement(BBoxViewer, {
    img: c.img,
    gt: c.gt,
    preds: modelIds.map(id => ({
      id,
      label: enabledModels.find(m => m.id === id)?.label || id,
      color: MC[id] || '#14b8a6',
      box: c.models[id].box,
      iou: c.models[id].iou,
      note: c.models[id].note
    }))
  }) : (() => {
    const norm = c.task === 'ocr' ? normOcr : normRecog;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        marginBottom: 9,
        padding: '5px 11px',
        background: 'hsl(var(--secondary))',
        borderRadius: 'var(--radius-sm)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...lbl,
        fontWeight: 700
      }
    }, "\u6A19\u6E96\u7B54\u6848"), /*#__PURE__*/React.createElement("span", {
      style: {
        ...mono,
        fontSize: 'var(--text-sm)',
        fontWeight: 700
      }
    }, c.expected)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap'
      }
    }, modelIds.map(id => {
      const r = c.models[id];
      const m = enabledModels.find(m => m.id === id);
      const normd = norm(r.response);
      return /*#__PURE__*/React.createElement("div", {
        key: id,
        style: {
          flex: '1 1 220px',
          minWidth: 200,
          border: `1px solid ${r.pass ? 'hsl(var(--success)/.3)' : 'hsl(var(--destructive)/.3)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '9px 11px',
          background: r.pass ? 'hsl(var(--success)/.04)' : 'hsl(var(--destructive)/.04)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 6
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: MC[id] || '#14b8a6'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          ...mono,
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          flex: 1
        }
      }, m?.label || id), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          padding: '1px 7px',
          borderRadius: 'var(--radius-full)',
          background: r.pass ? 'hsl(var(--success)/.12)' : 'hsl(var(--destructive)/.12)',
          color: r.pass ? 'hsl(160 70% 28%)' : 'hsl(0 72% 38%)',
          border: `1px solid ${r.pass ? 'hsl(var(--success)/.3)' : 'hsl(var(--destructive)/.3)'}`,
          ...mono
        }
      }, r.pass ? '✓ Match' : '✗ Mismatch')), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          ...mono,
          fontSize: 'var(--text-xs)',
          flexWrap: 'wrap'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          ...muted
        }
      }, "\u539F\u59CB\u8F38\u51FA"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600
        }
      }, r.response)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          ...mono,
          fontSize: 'var(--text-xs)',
          marginTop: 4,
          flexWrap: 'wrap'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          ...muted
        }
      }, "\u6B63\u898F\u5316\u5F8C"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700,
          color: r.pass ? 'hsl(160 70% 28%)' : 'hsl(0 72% 38%)'
        }
      }, normd), /*#__PURE__*/React.createElement("span", {
        style: {
          ...muted
        }
      }, r.pass ? '＝' : '≠'), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700
        }
      }, norm(c.expected))));
    })));
  })()));
}

/* ── CASE INSPECTOR ──────────────────────────────────────── */
function methodNote(task) {
  if (task === 'recognition') return '評分方式：whole-match — 將輸出與標準答案正規化（去空白、轉小寫）後比對 output == expected。';
  if (task === 'ocr') return '評分方式：精確比對 — 轉大寫並移除分隔符（- / 空白）後比對字串是否完全一致。';
  if (task === 'locate') return '評分方式：IoU — 預測框與標準框的交集 / 聯集面積比；以 0.5 為通過門檻。';
  return null;
}
function CaseInspector({
  cases,
  enabledModels,
  baseId
}) {
  const [filter, setFilter] = React.useState('all');
  const [layout, setLayout] = React.useState('split');
  const [openJdg, setOpenJdg] = React.useState(null);
  const isVlm = !!cases[0]?.task;
  const modelIds = enabledModels.map(m => m.id).filter(id => cases[0]?.models[id]);
  const candId = modelIds.find(id => id !== baseId) || modelIds[0];
  const counts = {
    all: cases.length,
    any_wrong: cases.filter(c => modelIds.some(id => !c.models[id]?.pass)).length,
    all_wrong: cases.filter(c => modelIds.every(id => !c.models[id]?.pass)).length,
    regression: cases.filter(c => isRegr(c, baseId, candId)).length
  };
  const filtered = cases.filter(c => {
    if (filter === 'regression') return isRegr(c, baseId, candId);
    if (filter === 'any_wrong') return modelIds.some(id => !c.models[id]?.pass);
    if (filter === 'all_wrong') return modelIds.every(id => !c.models[id]?.pass);
    return true;
  });
  const wrongLabel = isVlm ? '有模型答錯' : '有模型答錯';
  const fbtn = (k, label) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setFilter(k),
    style: {
      ...mono,
      fontSize: 'var(--text-xs)',
      padding: '4px 12px',
      borderRadius: 'var(--radius-full)',
      border: `1px solid ${filter === k ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
      background: filter === k ? 'hsl(var(--primary))' : 'hsl(var(--card))',
      color: filter === k ? '#fff' : 'hsl(var(--muted-foreground))',
      cursor: 'pointer',
      fontWeight: filter === k ? 600 : 400,
      transition: 'all .12s'
    }
  }, label, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .75
    }
  }, counts[k]));
  const note = isVlm ? methodNote(cases[0].task) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 20px 20px'
    }
  }, note && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      alignItems: 'flex-start',
      marginBottom: 12,
      padding: '8px 11px',
      background: 'hsl(var(--accent)/.4)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid hsl(var(--border))'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'hsl(var(--primary))'
    }
  }, "\u24D8"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      ...mono,
      lineHeight: 1.6,
      color: 'hsl(var(--foreground))'
    }
  }, note)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      alignItems: 'center',
      marginBottom: 14
    }
  }, fbtn('all', '全部案例'), fbtn('any_wrong', wrongLabel), fbtn('all_wrong', '全部答錯'), /*#__PURE__*/React.createElement("button", {
    onClick: () => setFilter('regression'),
    style: {
      ...mono,
      fontSize: 'var(--text-xs)',
      padding: '4px 12px',
      borderRadius: 'var(--radius-full)',
      border: `1px solid ${filter === 'regression' ? 'hsl(var(--destructive))' : 'hsl(var(--destructive)/.4)'}`,
      background: filter === 'regression' ? 'hsl(var(--destructive))' : 'hsl(var(--destructive)/.08)',
      color: filter === 'regression' ? '#fff' : 'hsl(0 72% 38%)',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all .12s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, "\u26A0 \u9000\u6B65 ", /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .8
    }
  }, counts.regression)), !isVlm && /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'inline-flex',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'var(--radius-full)',
      overflow: 'hidden',
      background: 'hsl(var(--secondary))'
    }
  }, [['split', '⊟ 並排'], ['three', '⊞ 直列']].map(([k, t]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setLayout(k),
    style: {
      ...mono,
      fontSize: 'var(--text-xs)',
      padding: '4px 12px',
      border: 'none',
      cursor: 'pointer',
      background: layout === k ? 'hsl(var(--primary))' : 'transparent',
      color: layout === k ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
      transition: 'all .12s'
    }
  }, t)))), filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '20px 0',
      ...lbl
    }
  }, filter === 'regression' ? '✓ 沒有退步案例，新模型完全相容' : '沒有符合篩選條件的案例') : filtered.map(c => isVlm ? /*#__PURE__*/React.createElement(VlmCaseRow, {
    key: c.id,
    c: c,
    baseId: baseId,
    candId: candId,
    enabledModels: enabledModels
  }) : /*#__PURE__*/React.createElement(LlmCaseRow, {
    key: c.id,
    c: c,
    baseId: baseId,
    candId: candId,
    enabledModels: enabledModels,
    layout: layout,
    judgeOpen: openJdg === c.id,
    onJudge: () => setOpenJdg(p => p === c.id ? null : c.id)
  })));
}

/* ── MODEL RESULT COLUMN ─────────────────────────────────── */
function ModelCol({
  label,
  data,
  modelId,
  champion,
  isBaseline,
  metricType
}) {
  if (!data) return null;
  const pct = (data.score * 100).toFixed(1) + '%'; // 分數條寬度（0–100%）
  const isJudge = metricType === 'llm'; // LLM = judge 0–5 制
  const headline = isJudge ? (data.score * 5).toFixed(1) + '/5' : pct;
  const col = MC[modelId] || '#14b8a6';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 210,
      maxWidth: 330,
      ...card,
      padding: '12px 14px 12px 17px',
      position: 'relative',
      background: data.score >= .85 ? 'hsl(160 84% 39%/.05)' : data.score >= .4 ? 'hsl(38 92% 50%/.05)' : 'hsl(0 84% 60%/.05)',
      borderColor: data.score >= .85 ? 'hsl(160 84% 39%/.3)' : data.score >= .4 ? 'hsl(38 92% 50%/.3)' : 'hsl(0 84% 60%/.3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      background: sb(data.score),
      borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)'
    }
  }), champion && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -10,
      right: 10,
      fontSize: 11,
      fontWeight: 600,
      background: 'hsl(var(--success))',
      color: '#fff',
      padding: '1px 8px',
      borderRadius: 'var(--radius-full)'
    }
  }, "\uD83C\uDFC6 WINNER"), isBaseline && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 7,
      right: 8,
      ...mono,
      fontSize: 9,
      padding: '1px 6px',
      borderRadius: 'var(--radius-sm)',
      background: 'hsl(var(--secondary))',
      color: 'hsl(var(--muted-foreground))',
      border: '1px solid hsl(var(--border))'
    }
  }, "\u57FA\u6E96"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: col,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      flex: 1
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 26,
      fontWeight: 900,
      color: sc(data.score),
      fontVariantNumeric: 'tabular-nums'
    }
  }, headline)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      borderRadius: 'var(--radius-full)',
      background: 'hsl(var(--secondary))',
      overflow: 'hidden',
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "animate-bar-grow",
    style: {
      width: pct,
      height: '100%',
      background: sb(data.score),
      borderRadius: 'var(--radius-full)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, metricType === 'locate' ? /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 11,
      ...muted
    }
  }, "mean IoU ", (data.iou * 100).toFixed(1), "%") : metricType === 'recognition' || metricType === 'ocr' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 11,
      color: 'hsl(160 60% 30%)',
      fontWeight: 500
    }
  }, "\u2713 \u6B63\u78BA ", data.correct, "/", data.total), /*#__PURE__*/React.createElement("span", {
    style: {
      ...lbl,
      ...mono
    }
  }, metricType === 'ocr' ? '精確比對' : 'whole-match')) : /*#__PURE__*/React.createElement(React.Fragment, null, data.wins != null && /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 11,
      color: 'hsl(160 60% 30%)',
      fontWeight: 500
    }
  }, "\u2191 \u8D0F\u4E86 ", data.wins, " \u984C"), data.total && /*#__PURE__*/React.createElement("span", {
    style: {
      ...lbl,
      ...mono
    }
  }, data.wins, "/", data.total, "\uFF08", (data.wins / data.total * 100).toFixed(0), "% \u52DD\u7387\uFF09")), data.regressions > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 11,
      fontWeight: 700,
      color: 'hsl(0 72% 38%)',
      background: 'hsl(var(--destructive)/.08)',
      padding: '0 6px',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid hsl(var(--destructive)/.3)'
    }
  }, "\u26A0 \u9000\u6B65 ", data.regressions, " \u984C")));
}

/* ── PROJECT ROW ─────────────────────────────────────────── */
function ProjRow({
  p,
  sel,
  onToggle
}) {
  const cap = CAP_CLR[p.cap] || {
    bg: 'hsl(var(--secondary))',
    color: 'hsl(var(--muted-foreground))'
  };
  return /*#__PURE__*/React.createElement("div", {
    onClick: onToggle,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 12px',
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${sel ? 'hsl(var(--primary)/.5)' : 'hsl(var(--border))'}`,
      background: sel ? 'hsl(var(--primary)/.05)' : 'transparent',
      cursor: 'pointer',
      marginBottom: 6,
      transition: 'all .12s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 18,
      height: 18,
      borderRadius: 4,
      border: `2px solid ${sel ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
      background: sel ? 'hsl(var(--primary))' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all .14s'
    }
  }, sel && /*#__PURE__*/React.createElement("svg", {
    width: 11,
    height: 11,
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 6l3 3 5-5",
    stroke: "hsl(var(--primary-foreground))",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 'var(--text-sm)'
    }
  }, p.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      ...mono,
      fontWeight: 500,
      ...cap
    }
  }, p.cap), p.est && /*#__PURE__*/React.createElement("span", {
    style: {
      ...lbl,
      fontSize: 10,
      whiteSpace: 'nowrap'
    }
  }, "~", p.est, "m"));
}
Object.assign(window, {
  Tag,
  JudgePanel,
  LlmCaseRow,
  VlmCaseRow,
  BBoxViewer,
  CaseInspector,
  ModelCol,
  ProjRow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/benchmark/parts.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.MetricCard = __ds_scope.MetricCard;

__ds_ns.ModelChip = __ds_scope.ModelChip;

__ds_ns.Progress = __ds_scope.Progress;

})();
