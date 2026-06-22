/* ════════════════════════════════════════════════════════════════
   History — each run is an expandable row. Click to drill into every
   model that ran (the model set varies run to run: one may be added or
   dropped). LLM shows per-task judge scores; VLM shows recognition /
   OCR accuracy and grounding mean IoU.
   ════════════════════════════════════════════════════════════════ */
const { LLM_METHODS, HISTORY_LLM, HISTORY_VLM, VLM_METRICS, TASK_LABELS, MC } = window.BM;
const H_S = window.BM.S, hsc = window.BM.sc, hsb = window.BM.sb;
const hmono = H_S.mono, hmuted = H_S.muted, hlbl = H_S.lbl, hcard = H_S.card;

function MethodBadge({method}) {
  const m = LLM_METHODS[method]; if(!m) return null;
  const tone = m.tone==='primary'
    ? {bg:'hsl(var(--primary)/.12)',fg:'hsl(var(--primary))',bd:'hsl(var(--primary)/.35)'}
    : m.tone==='custom'
      ? {bg:'hsl(var(--model-custom-soft))',fg:'hsl(var(--model-custom))',bd:'hsl(var(--model-custom)/.4)'}
      : {bg:'hsl(var(--model-builtin-soft))',fg:'hsl(var(--model-builtin))',bd:'hsl(var(--border))'};
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 9px',borderRadius:'var(--radius-full)',...hmono,fontSize:10,fontWeight:600,background:tone.bg,color:tone.fg,border:`1px solid ${tone.bd}`}}>
      {m.label}{m.badge && <span style={{fontSize:9,opacity:.8,fontWeight:400}}>· {m.badge}</span>}
    </span>
  );
}

/* small colored model dot + label, used in the collapsed row */
function ModelDot({id, label, isNew}) {
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:5,...hmono,fontSize:10,padding:'2px 8px',borderRadius:'var(--radius-full)',background:'hsl(var(--secondary))',border:'1px solid hsl(var(--border))',whiteSpace:'nowrap'}}>
      <span style={{width:7,height:7,borderRadius:'50%',background:'hsl(var(--muted-foreground))',flexShrink:0}}/>
      {label}
      {isNew && <span style={{fontSize:8,fontWeight:700,color:'hsl(var(--model-custom))',background:'hsl(var(--model-custom-soft))',padding:'0 4px',borderRadius:3}}>新增</span>}
    </span>
  );
}

/* a thin score/metric bar with a value chip */
function MiniBar({value, width=null}) {
  return (
    <div style={{flex:1,minWidth:60,height:7,borderRadius:'var(--radius-full)',background:'hsl(var(--card))',border:'1px solid hsl(var(--border))',overflow:'hidden'}}>
      <div style={{width:(value*100)+'%',height:'100%',background:hsb(value),borderRadius:'var(--radius-full)'}}/>
    </div>
  );
}

/* delta vs a baseline value: ▲ up (green) / ▼ down (red) / ＝ flat / 新 if none */
function Delta({cur, base, w=52}) {
  if(base==null) return <span style={{...hmono,fontSize:9,fontWeight:700,color:'hsl(var(--model-custom))',width:w,textAlign:'right',flexShrink:0}}>新增</span>;
  const d = cur-base, flat = Math.abs(d)<0.005;
  const col = flat?'hsl(var(--muted-foreground))':d>0?'hsl(160 70% 28%)':'hsl(0 72% 38%)';
  const arr = flat?'＝':d>0?'▲':'▼';
  return <span style={{...hmono,fontSize:9,fontWeight:700,color:col,width:w,textAlign:'right',flexShrink:0,fontVariantNumeric:'tabular-nums'}}>{arr}{flat?'':(Math.abs(d)*100).toFixed(1)}</span>;
}

/* "compared against" reference banner shown at the top of an expanded run */
function BaselineNote({baseline, methodLabel, comparable=true}) {
  if(!baseline) return (
    <div style={{...hmono,fontSize:10,...hlbl,margin:'9px 0 4px',display:'flex',alignItems:'center',gap:6}}>
      <span style={{fontSize:11}}>◷</span> 首次執行 · 無比較基準
    </div>
  );
  return (
    <div style={{...hmono,fontSize:10,margin:'9px 0 4px',display:'flex',alignItems:'center',gap:6,color:'hsl(var(--muted-foreground))',flexWrap:'wrap'}}>
      <span style={{fontSize:11}}>⇄</span>
      比較基準：
      <span style={{fontWeight:700,color:'hsl(var(--foreground))',padding:'1px 7px',borderRadius:'var(--radius-full)',background:'hsl(var(--secondary))',border:'1px solid hsl(var(--border))'}}>
        {baseline.ts}{methodLabel?` · ${methodLabel}`:''}
      </span>
      {comparable
        ? <span style={{...hlbl,fontSize:9}}>（同一模型逐題比較，△ 為與基準差距）</span>
        : <span style={{fontSize:9,fontWeight:600,color:'hsl(0 72% 38%)'}}>跨評分法：僅比較通過 / 退步，分數不可直接相減</span>}
    </div>
  );
}

const findRun = (list, ts) => ts ? list.find(r=>r.ts===ts) : null;
const baseEntry = (run, id) => run ? run.models.find(m=>m.id===id) : null;

/* expandable run shell shared by LLM + VLM */
function RunRow({open, onToggle, current, summary, children}) {
  return (
    <div style={{borderRadius:'var(--radius-md)',border:`1px solid ${current?'hsl(var(--primary)/.4)':'hsl(var(--border))'}`,background:current?'hsl(var(--primary)/.04)':'hsl(var(--secondary))',overflow:'hidden',transition:'border-color .15s'}}>
      <div onClick={onToggle} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 12px',cursor:'pointer'}}>
        {summary}
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={2} style={{flexShrink:0,transform:open?'rotate(180deg)':'none',transition:'transform .2s'}}><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      {open && <div style={{padding:'4px 12px 12px',borderTop:'1px solid hsl(var(--border))'}}>{children}</div>}
    </div>
  );
}

function HistoryPanel() {
  const [tab, setTab] = React.useState('LLM');

  const Tabs = (
    <div style={{display:'inline-flex',border:'1px solid hsl(var(--border))',borderRadius:'var(--radius-full)',overflow:'hidden',background:'hsl(var(--secondary))'}}>
      {['LLM','VLM'].map(t=>(
        <button key={t} onClick={()=>setTab(t)} style={{...hmono,fontSize:'var(--text-xs)',padding:'4px 16px',border:'none',cursor:'pointer',background:tab===t?'hsl(var(--primary))':'transparent',color:tab===t?'hsl(var(--primary-foreground))':'hsl(var(--muted-foreground))',fontWeight:tab===t?600:400,transition:'all .12s'}}>{t}</button>
      ))}
    </div>
  );

  return (
    <div className="animate-slide-up" style={{...hcard,padding:18,marginTop:12}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,flexWrap:'wrap'}}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth={2}><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 106 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
        <span style={{fontWeight:600,fontSize:'var(--text-sm)'}}>歷史趨勢</span>
        <span style={{...hlbl,fontSize:10}}>點任一筆紀錄可展開該次跑的各模型表現</span>
        <span style={{marginLeft:'auto'}}>{Tabs}</span>
      </div>
      {tab==='LLM' ? <LlmHistory/> : <VlmHistory/>}
    </div>
  );
}

/* ── LLM history ─────────────────────────────────────────── */
function LlmHistory() {
  const [open, setOpen] = React.useState(0); // first (current) run open
  const meanOf = r => r.models.reduce((s,m)=>s+m.score,0)/r.models.length;

  return (
    <div>
      <div style={{display:'flex',gap:7,alignItems:'flex-start',marginBottom:14,padding:'10px 12px',background:'hsl(var(--accent)/.4)',borderRadius:'var(--radius-md)',border:'1px solid hsl(var(--border))'}}>
        <span style={{fontSize:12,color:'hsl(var(--primary))'}}>ⓘ</span>
        <span style={{fontSize:'var(--text-xs)',...hmono,lineHeight:1.7,color:'hsl(var(--foreground))'}}>
          LLM 評分方式從早期的 <b>LLM-as-Judge</b> → <b>RAGAS</b>，目前正評估改用{' '}
          <a href="https://github.com/confident-ai/deepeval" target="_blank" rel="noreferrer" style={{color:'hsl(var(--primary))',fontWeight:700,borderBottom:'1px solid hsl(var(--primary)/.4)',textDecoration:'none'}}>DeepEval</a>
          （G-Eval / DAG，可寫單元測試式斷言）。<span style={{color:'hsl(0 72% 38%)',fontWeight:600}}>注意：不同評分法的分數標準不同，跨方法的絕對數值不可直接比較</span>，請以同一方法內的相對趨勢為準。
        </span>
      </div>

      {/* method legend */}
      <div style={{display:'flex',gap:14,flexWrap:'wrap',marginBottom:12}}>
        {Object.keys(LLM_METHODS).map(k=>(
          <div key={k} style={{display:'flex',alignItems:'center',gap:7,fontSize:'var(--text-xs)',...hmuted}}>
            <MethodBadge method={k}/><span style={{...hmono,lineHeight:1.5}}>{LLM_METHODS[k].desc}</span>
          </div>
        ))}
      </div>

      {/* run rows */}
      <div style={{display:'flex',flexDirection:'column',gap:7}}>
        {HISTORY_LLM.map((r,i)=>{
          const mean = meanOf(r);
          const totalReg = r.models.reduce((s,m)=>s+(m.reg||0),0);
          const summary = (
            <>
              <div style={{width:88,flexShrink:0}}>
                <div style={{...hmono,fontSize:10,...hmuted}}>{r.ts}</div>
                <div style={{...hlbl,fontSize:9,marginTop:1}}>{r.scope}</div>
              </div>
              <div style={{width:118,flexShrink:0}}><MethodBadge method={r.method}/></div>
              <span style={{...hlbl,fontSize:9,flexShrink:0,width:40}}>{r.models.length} 模型</span>
              <span style={{...hlbl,fontSize:9,flexShrink:0,width:24}}>平均</span>
              <MiniBar value={mean}/>
              <span style={{...hmono,fontSize:'var(--text-sm)',fontWeight:900,color:hsc(mean),width:50,textAlign:'right',flexShrink:0}}>{(mean*100).toFixed(1)}%</span>
              <span style={{width:58,textAlign:'right',flexShrink:0,...hmono,fontSize:10,fontWeight:totalReg>0?700:400,color:totalReg>0?'hsl(0 72% 38%)':'hsl(var(--muted-foreground))'}}>{totalReg>0?`⚠ ${totalReg} 退步`:'無退步'}</span>
            </>
          );
          const baseRun = findRun(HISTORY_LLM, r.baseline && r.baseline.ts);
          const comparable = !!(r.baseline && r.baseline.method === r.method);
          return (
            <RunRow key={i} current={r.current} open={open===i} onToggle={()=>setOpen(open===i?-1:i)} summary={summary}>
              <BaselineNote baseline={r.baseline} comparable={comparable} methodLabel={r.baseline ? (LLM_METHODS[r.baseline.method]||{}).label : ''}/>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:4}}>
                {r.models.map(m=><LlmModelDetail key={m.id} m={m} base={baseEntry(baseRun, m.id)} baseRef={r.baseline} comparable={comparable}/>)}
              </div>
            </RunRow>
          );
        })}
      </div>
    </div>
  );
}

function LlmModelDetail({m, base, baseRef, comparable}) {
  const taskBase = key => base ? (base.tasks.find(t=>t.key===key)||{}).score : null;
  const showDelta = comparable && !!base;
  return (
    <div style={{...hcard,padding:'10px 12px'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:9,flexWrap:'wrap'}}>
        <span style={{width:10,height:10,borderRadius:'50%',background:hsb(m.score),flexShrink:0}}/>
        <span style={{...hmono,fontSize:'var(--text-sm)',fontWeight:700}}>{m.label}</span>
        {m.isNew && <span style={{fontSize:9,fontWeight:700,color:'hsl(var(--model-custom))',background:'hsl(var(--model-custom-soft))',padding:'1px 6px',borderRadius:'var(--radius-full)',border:'1px solid hsl(var(--model-custom)/.4)'}}>本次新增</span>}
        {/* baseline reference for this model */}
        {base
          ? <span style={{...hmono,fontSize:9,...hlbl}}>基準 {baseRef ? baseRef.ts : ''}{comparable ? ` · ${(base.score*100).toFixed(1)}%` : ''}</span>
          : !m.isNew && baseRef && <span style={{...hmono,fontSize:9,...hlbl}}>基準未執行此模型</span>}
        <span style={{marginLeft:'auto',display:'flex',alignItems:'baseline',gap:7}}>
          {showDelta && <Delta cur={m.score} base={base.score} w={44}/>}
          <span style={{...hmono,fontSize:20,fontWeight:900,color:hsc(m.score),fontVariantNumeric:'tabular-nums'}}>{(m.score*100).toFixed(1)}%</span>
        </span>
        {m.reg>0 && <span style={{...hmono,fontSize:10,fontWeight:700,color:'hsl(0 72% 38%)',background:'hsl(var(--destructive)/.08)',padding:'1px 7px',borderRadius:'var(--radius-sm)',border:'1px solid hsl(var(--destructive)/.3)'}}>⚠ 退步 {m.reg}{baseRef?` · vs ${baseRef.ts}`:''}</span>}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {m.tasks.map(t=>{
          const bt = taskBase(t.key);
          return (
            <div key={t.key} style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{...hmono,fontSize:11,width:96,flexShrink:0,color:'hsl(var(--foreground))'}}>{TASK_LABELS[t.key]||t.key}</span>
              <MiniBar value={t.score}/>
              <span style={{...hmono,fontSize:11,fontWeight:700,color:hsc(t.score),width:40,textAlign:'right',flexShrink:0}}>{(t.score*100).toFixed(0)}%</span>
              {showDelta && <Delta cur={t.score} base={bt==null?null:bt} w={44}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── VLM history ─────────────────────────────────────────── */
function VlmHistory() {
  const [open, setOpen] = React.useState(0);
  /* mean of a metric across the models that actually ran it (null → skipped) */
  const meanMetric = (r,key) => {
    const vals = r.models.map(m=>m[key]).filter(v=>v!=null);
    return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
  };

  return (
    <div>
      <div style={{display:'flex',gap:7,alignItems:'flex-start',marginBottom:14,padding:'10px 12px',background:'hsl(var(--accent)/.4)',borderRadius:'var(--radius-md)',border:'1px solid hsl(var(--border))'}}>
        <span style={{fontSize:12,color:'hsl(var(--primary))'}}>ⓘ</span>
        <span style={{fontSize:'var(--text-xs)',...hmono,lineHeight:1.7,color:'hsl(var(--foreground))'}}>
          VLM 以可重現的客觀指標評分：辨識題與 OCR 用 <b>accuracy</b>（whole-match / 精確比對），定位題（grounding）用 <b>mean IoU</b>。指標標準固定，數值可直接跨時間比較。<span style={{...hlbl}}>不同次跑的模型 / 任務組可能不同，<b style={{color:'hsl(var(--foreground))'}}>—</b> 表示該次未執行。</span>
        </span>
      </div>

      {/* metric legend */}
      <div style={{display:'flex',gap:14,flexWrap:'wrap',marginBottom:12}}>
        {VLM_METRICS.map(mt=>(
          <div key={mt.key} style={{display:'flex',alignItems:'center',gap:6,fontSize:'var(--text-xs)',...hmuted}}>
            <span style={{...hmono,fontSize:11,fontWeight:700,color:'hsl(var(--foreground))'}}>{mt.label}</span>
            <span style={{fontSize:9,padding:'1px 6px',borderRadius:'var(--radius-full)',background:'hsl(var(--secondary))',border:'1px solid hsl(var(--border))',...hmono,fontWeight:600}}>{mt.unit}</span>
          </div>
        ))}
      </div>

      {/* run rows */}
      <div style={{display:'flex',flexDirection:'column',gap:7}}>
        {HISTORY_VLM.map((r,i)=>{
          const summary = (
            <>
              <div style={{width:88,flexShrink:0}}>
                <div style={{...hmono,fontSize:10,...hmuted}}>{r.ts}</div>
                <div style={{...hlbl,fontSize:9,marginTop:1}}>{r.scope}</div>
              </div>
              <span style={{...hlbl,fontSize:9,flexShrink:0,width:40}}>{r.models.length} 模型</span>
              <div style={{flex:1,display:'flex',gap:6,flexWrap:'wrap',minWidth:0}}>
                {VLM_METRICS.map(mt=>{
                  const v = meanMetric(r,mt.key);
                  return (
                    <span key={mt.key} style={{display:'inline-flex',alignItems:'center',gap:5,...hmono,fontSize:10,padding:'2px 8px',borderRadius:'var(--radius-full)',background:'hsl(var(--card))',border:'1px solid hsl(var(--border))'}}>
                      <span style={{...hmuted,fontSize:9}}>{mt.label}</span>
                      {v==null
                        ? <span style={{...hlbl}}>—</span>
                        : <span style={{fontWeight:800,color:hsc(v)}}>{(v*100).toFixed(0)}%</span>}
                    </span>
                  );
                })}
              </div>
            </>
          );
          return (
            <RunRow key={i} current={r.current} open={open===i} onToggle={()=>setOpen(open===i?-1:i)} summary={summary}>
              <BaselineNote baseline={r.baseline}/>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:4}}>
                {r.models.map(m=><VlmModelDetail key={m.id} m={m} base={baseEntry(findRun(HISTORY_VLM, r.baseline && r.baseline.ts), m.id)} baseRef={r.baseline}/>)}
              </div>
            </RunRow>
          );
        })}
      </div>
    </div>
  );
}

function VlmModelDetail({m, base, baseRef}) {
  const _vals = VLM_METRICS.map(mt=>m[mt.key]).filter(v=>v!=null);
  const _mean = _vals.length ? _vals.reduce((a,b)=>a+b,0)/_vals.length : 0;
  const isNewModel = baseRef && !base;
  return (
    <div style={{...hcard,padding:'10px 12px'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:9,flexWrap:'wrap'}}>
        <span style={{width:10,height:10,borderRadius:'50%',background:hsb(_mean),flexShrink:0}}/>
        <span style={{...hmono,fontSize:'var(--text-sm)',fontWeight:700}}>{m.label}</span>
        {isNewModel && <span style={{...hmono,fontSize:9,...hlbl}}>基準未執行此模型</span>}
        {base && baseRef && <span style={{...hmono,fontSize:9,...hlbl,marginLeft:'auto'}}>基準 {baseRef.ts}</span>}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:8}}>
        {VLM_METRICS.map(mt=>{
          const v = m[mt.key];
          const ran = v!=null;
          const cnt = m.counts && m.counts[mt.key];
          const bv = base ? base[mt.key] : null;
          return (
            <div key={mt.key} style={{padding:'8px 10px',borderRadius:'var(--radius-md)',border:`1px solid ${ran?'hsl(var(--border))':'hsl(var(--border))'}`,background:ran?'hsl(var(--secondary))':'hsl(var(--muted)/.4)',opacity:ran?1:.7}}>
              <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:6}}>
                <span style={{...hmono,fontSize:11,fontWeight:700,color:'hsl(var(--foreground))'}}>{mt.label}</span>
                <span style={{...hlbl,fontSize:8}}>{mt.unit}</span>
              </div>
              {ran ? (
                <>
                  <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:6}}>
                    <span style={{...hmono,fontSize:20,fontWeight:900,color:hsc(v),fontVariantNumeric:'tabular-nums',lineHeight:1}}>{(v*100).toFixed(0)}%</span>
                    {mt.key!=='iou' && Array.isArray(cnt) && <span style={{...hlbl,fontSize:9}}>{cnt[0]}/{cnt[1]} 正確</span>}
                    {mt.key==='iou' && cnt!=null && <span style={{...hlbl,fontSize:9}}>{cnt} 框</span>}
                    {baseRef && <span style={{marginLeft:'auto'}}><Delta cur={v} base={bv} w={40}/></span>}
                  </div>
                  <div style={{height:6,borderRadius:'var(--radius-full)',background:'hsl(var(--card))',border:'1px solid hsl(var(--border))',overflow:'hidden'}}>
                    <div style={{width:(v*100)+'%',height:'100%',background:hsb(v),borderRadius:'var(--radius-full)'}}/>
                  </div>
                </>
              ) : (
                <div style={{...hmono,fontSize:11,...hlbl,padding:'6px 0 2px'}}>— 此次未執行</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { HistoryPanel });
