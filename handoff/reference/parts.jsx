/* ════════════════════════════════════════════════════════════════
   Benchmark — presentational components → window globals
   Reads data + helpers from window.BM
   ════════════════════════════════════════════════════════════════ */
const { MC, CAP_CLR, S, sc, sb, isRegr } = window.BM;
const { card, mono, muted, lbl } = S;

/* ── TAG CHIP ────────────────────────────────────────────── */
function Tag({t}) {
  const warn = t.includes('案件')||t.includes('Edge');
  return <span style={{display:'inline-flex',padding:'1px 7px',borderRadius:'var(--radius-full)',fontSize:10,...mono,background:warn?'hsl(38 92% 50%/.1)':'hsl(var(--secondary))',color:warn?'hsl(38 80% 28%)':'hsl(var(--muted-foreground))',border:'1px solid hsl(var(--border))'}}>{t}</span>;
}

/* ── JUDGE PANEL (LLM per-model reasoning) ───────────────── */
function JudgePanel({modelLabel, reasoning, isWinner}) {
  return (
    <div style={{marginTop:8,padding:'10px 12px',background:'hsl(var(--primary)/.06)',border:'1px solid hsl(var(--primary)/.2)',borderRadius:'var(--radius-md)'}}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
        <span style={{fontSize:11,...mono,color:'hsl(var(--primary))',fontWeight:600}}>⚖ 裁判對 {modelLabel} 的評語</span>
        {isWinner && <span style={{fontSize:10,padding:'0 6px',borderRadius:'var(--radius-full)',background:'hsl(var(--success)/.12)',color:'hsl(160 70% 28%)',border:'1px solid hsl(var(--success)/.3)',...mono}}>裁定勝出</span>}
      </div>
      <p style={{margin:0,fontSize:'var(--text-xs)',...mono,lineHeight:1.75,color:'hsl(var(--foreground))'}}>{reasoning}</p>
    </div>
  );
}

/* ── LLM CASE ROW ────────────────────────────────────────── */
function LlmCaseRow({c, baseId, candId, enabledModels, layout, judgeOpen, onJudge}) {
  const reg = isRegr(c, baseId, candId);
  const modelIds = enabledModels.map(m=>m.id).filter(id=>c.models[id]);
  const winner   = modelIds.reduce((b,id)=>(c.models[id]?.score||0)>(c.models[b]?.score||0)?id:b, modelIds[0]);

  const AnswerCol = ({id}) => {
    const r = c.models[id]; if(!r) return null;
    const col = MC[id]||'#14b8a6';
    const m   = enabledModels.find(m=>m.id===id);
    return (
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5,flexWrap:'wrap'}}>
          <span style={{width:8,height:8,borderRadius:'50%',background:col,flexShrink:0}}/>
          <span style={{...mono,fontSize:'var(--text-xs)',fontWeight:700}}>{m?.label||id}</span>
          <span style={{...mono,fontSize:13,fontWeight:900,color:sc(r.score/5)}}>{r.score}/5</span>
          <span style={{fontSize:10,padding:'1px 7px',borderRadius:'var(--radius-full)',background:r.pass?'hsl(var(--success)/.1)':'hsl(var(--destructive)/.1)',color:r.pass?'hsl(160 70% 28%)':'hsl(0 72% 38%)',border:`1px solid ${r.pass?'hsl(var(--success)/.3)':'hsl(var(--destructive)/.3)'}`,...mono}}>{r.pass?'✓ Pass':'✗ Fail'}</span>
        </div>
        <p style={{margin:0,fontSize:'var(--text-xs)',lineHeight:1.7,color:'hsl(var(--foreground))'}}>{r.answer}</p>
      </div>
    );
  };

  return (
    <div style={{...card,marginBottom:10,overflow:'hidden',borderColor:reg?'hsl(var(--destructive)/.4)':'hsl(var(--border))'}}>
      <div style={{height:3,background:reg?'hsl(var(--destructive))':'hsl(var(--border))'}}/>
      <div style={{padding:'12px 16px'}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:10}}>
          <span style={{...mono,fontSize:10,...muted,flexShrink:0,paddingTop:2}}>Q{c.id}</span>
          <p style={{margin:0,flex:1,fontSize:'var(--text-sm)',fontWeight:500,lineHeight:1.5}}>{c.question}</p>
          <div style={{display:'flex',gap:4,flexShrink:0,flexWrap:'wrap',alignItems:'center'}}>
            {c.tags?.map(t=><Tag key={t} t={t}/>)}
            {reg && <span style={{...mono,fontSize:10,padding:'1px 8px',borderRadius:'var(--radius-full)',background:'hsl(var(--destructive)/.1)',color:'hsl(0 72% 38%)',border:'1px solid hsl(var(--destructive)/.35)',fontWeight:700}}>⚠ 退步</span>}
          </div>
        </div>
        <div style={{display:'flex',gap:10,marginBottom:10,flexDirection:layout==='three'?'column':'row'}}>
          <div style={{flex:layout==='three'?'none':'0 0 190px',padding:'8px 10px',background:'hsl(var(--secondary))',borderRadius:'var(--radius-sm)'}}>
            <span style={{...lbl,fontWeight:700,display:'block',marginBottom:4}}>標準答案</span>
            <p style={{margin:0,fontSize:'var(--text-xs)',lineHeight:1.7}}>{c.gt}</p>
          </div>
          <div style={{flex:2,display:'flex',gap:10}}>
            {modelIds.map(id=><AnswerCol key={id} id={id}/>)}
          </div>
        </div>
        <button onClick={onJudge} style={{...mono,fontSize:10,padding:'3px 11px',border:`1px solid ${judgeOpen?'hsl(var(--primary))':'hsl(var(--primary)/.35)'}`,borderRadius:'var(--radius-full)',background:judgeOpen?'hsl(var(--primary)/.1)':'transparent',color:'hsl(var(--primary))',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:4}}>
          <span>⚖</span> AI 裁判評語 <span style={{opacity:.7}}>{judgeOpen?'▲':'▼'}</span>
        </button>
        {judgeOpen && modelIds.map(id=>(
          c.models[id]?.reasoning &&
          <JudgePanel key={id} modelLabel={enabledModels.find(m=>m.id===id)?.label||id} reasoning={c.models[id].reasoning} isWinner={id===winner}/>
        ))}
      </div>
    </div>
  );
}

/* ── BBOX VIEWER (locate) ────────────────────────────────── */
function BBoxViewer({img, gt, preds}) {
  const [hov, setHov] = React.useState(null); // 'gt' | model id
  const pct = (b,axis) => ((axis==='x'?b[0]:b[1]) / (axis==='x'?img.w:img.h))*100;
  const pctw = b => (b[2]/img.w)*100, pcth = b => (b[3]/img.h)*100;

  const Box = ({box, color, k, label, dashed}) => {
    const active = hov===k;
    return (
      <div onMouseEnter={()=>setHov(k)} onMouseLeave={()=>setHov(null)}
        style={{position:'absolute',left:pct(box,'x')+'%',top:pct(box,'y')+'%',width:pctw(box)+'%',height:pcth(box)+'%',
          border:`2px ${dashed?'dashed':'solid'} ${color}`,borderRadius:2,boxShadow:active?`0 0 0 2px ${color}55`:'none',
          background:active?color+'22':'transparent',transition:'background .12s, box-shadow .12s',cursor:'crosshair',zIndex:active?5:2}}>
        <span style={{position:'absolute',top:-17,left:-2,fontSize:9,...mono,fontWeight:700,color:'#fff',background:color,padding:'0 5px',borderRadius:2,whiteSpace:'nowrap'}}>{label}</span>
        {active && <span style={{position:'absolute',bottom:-17,left:-2,fontSize:9,...mono,color:'#fff',background:'hsl(var(--tooltip-bg))',padding:'1px 5px',borderRadius:2,whiteSpace:'nowrap',zIndex:9}}>x{box[0]} y{box[1]} · {box[2]}×{box[3]}px</span>}
      </div>
    );
  };

  return (
    <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
      <div style={{position:'relative',flex:'1 1 360px',minWidth:300,maxWidth:460,aspectRatio:`${img.w} / ${img.h}`,borderRadius:'var(--radius-md)',overflow:'hidden',border:'1px solid hsl(var(--border))',
        backgroundColor:'hsl(var(--secondary))',
        backgroundImage:'repeating-linear-gradient(45deg, hsl(var(--border)/.5) 0 1px, transparent 1px 11px)'}}>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{...mono,fontSize:11,...muted,opacity:.7,textAlign:'center',padding:8}}>PCB 檢測影像<br/>{img.w}×{img.h}<br/><span style={{opacity:.7}}>（拖入實際影像）</span></span>
        </div>
        <Box box={gt} color="#00E676" k="gt" label="標準框 GT"/>
        {preds.map(p=><Box key={p.id} box={p.box} color={p.color} k={p.id} label={p.label} dashed/>)}
      </div>
      <div style={{flex:'1 1 200px',minWidth:200,display:'flex',flexDirection:'column',gap:7}}>
        <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,...mono}}>
          <span style={{width:14,height:0,borderTop:'2px solid var(--bbox-gt)'}}/> 標準框 (Ground Truth)
          <span style={{...muted,marginLeft:'auto'}}>{gt[0]},{gt[1]} · {gt[2]}×{gt[3]}</span>
        </div>
        {preds.map(p=>(
          <div key={p.id} onMouseEnter={()=>setHov(p.id)} onMouseLeave={()=>setHov(null)}
            style={{padding:'8px 10px',borderRadius:'var(--radius-md)',border:`1px solid ${hov===p.id?p.color:'hsl(var(--border))'}`,background:hov===p.id?p.color+'12':'hsl(var(--secondary))',transition:'all .12s',cursor:'crosshair'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
              <span style={{width:14,height:0,borderTop:`2px dashed ${p.color}`}}/>
              <span style={{...mono,fontSize:11,fontWeight:700}}>{p.label}</span>
              <span style={{...mono,fontSize:12,fontWeight:900,marginLeft:'auto',color:sc(p.iou)}}>IoU {(p.iou*100).toFixed(0)}%</span>
            </div>
            <div style={{...mono,fontSize:10,...muted}}>預測座標 {p.box[0]},{p.box[1]} · {p.box[2]}×{p.box[3]}px</div>
            {p.note && <div style={{fontSize:10,...muted,marginTop:3,lineHeight:1.5}}>{p.note}</div>}
          </div>
        ))}
        <p style={{margin:'2px 0 0',fontSize:10,...lbl,lineHeight:1.6}}>滑過框線或卡片可高亮對應區域並顯示原始像素座標。</p>
      </div>
    </div>
  );
}

/* ── VLM CASE ROW ────────────────────────────────────────── */
function normRecog(s){ return (s||'').trim().toLowerCase(); }
function normOcr(s){ return (s||'').toUpperCase().replace(/[^A-Z0-9]/g,''); }

function VlmCaseRow({c, baseId, candId, enabledModels}) {
  const reg = isRegr(c, baseId, candId);
  const modelIds = enabledModels.map(m=>m.id).filter(id=>c.models[id]);

  return (
    <div style={{...card,marginBottom:10,overflow:'hidden',borderColor:reg?'hsl(var(--destructive)/.4)':'hsl(var(--border))'}}>
      <div style={{height:3,background:reg?'hsl(var(--destructive))':'hsl(var(--border))'}}/>
      <div style={{padding:'12px 16px'}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:10}}>
          <span style={{...mono,fontSize:10,...muted,flexShrink:0,paddingTop:2}}>Q{c.id}</span>
          <p style={{margin:0,flex:1,fontSize:'var(--text-sm)',fontWeight:500,lineHeight:1.5}}>{c.question}</p>
          <div style={{display:'flex',gap:4,flexShrink:0,flexWrap:'wrap',alignItems:'center'}}>
            {c.tags?.map(t=><Tag key={t} t={t}/>)}
            {reg && <span style={{...mono,fontSize:10,padding:'1px 8px',borderRadius:'var(--radius-full)',background:'hsl(var(--destructive)/.1)',color:'hsl(0 72% 38%)',border:'1px solid hsl(var(--destructive)/.35)',fontWeight:700}}>⚠ 退步</span>}
          </div>
        </div>

        {c.task==='locate'
          ? <BBoxViewer img={c.img} gt={c.gt}
              preds={modelIds.map(id=>({id,label:enabledModels.find(m=>m.id===id)?.label||id,color:MC[id]||'#14b8a6',box:c.models[id].box,iou:c.models[id].iou,note:c.models[id].note}))}/>
          : (() => {
              const norm = c.task==='ocr'?normOcr:normRecog;
              return (
                <div>
                  <div style={{display:'inline-flex',alignItems:'center',gap:7,marginBottom:9,padding:'5px 11px',background:'hsl(var(--secondary))',borderRadius:'var(--radius-sm)'}}>
                    <span style={{...lbl,fontWeight:700}}>標準答案</span>
                    <span style={{...mono,fontSize:'var(--text-sm)',fontWeight:700}}>{c.expected}</span>
                  </div>
                  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                    {modelIds.map(id=>{
                      const r=c.models[id]; const m=enabledModels.find(m=>m.id===id);
                      const normd = norm(r.response);
                      return (
                        <div key={id} style={{flex:'1 1 220px',minWidth:200,border:`1px solid ${r.pass?'hsl(var(--success)/.3)':'hsl(var(--destructive)/.3)'}`,borderRadius:'var(--radius-md)',padding:'9px 11px',background:r.pass?'hsl(var(--success)/.04)':'hsl(var(--destructive)/.04)'}}>
                          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                            <span style={{width:8,height:8,borderRadius:'50%',background:MC[id]||'#14b8a6'}}/>
                            <span style={{...mono,fontSize:'var(--text-xs)',fontWeight:700,flex:1}}>{m?.label||id}</span>
                            <span style={{fontSize:10,padding:'1px 7px',borderRadius:'var(--radius-full)',background:r.pass?'hsl(var(--success)/.12)':'hsl(var(--destructive)/.12)',color:r.pass?'hsl(160 70% 28%)':'hsl(0 72% 38%)',border:`1px solid ${r.pass?'hsl(var(--success)/.3)':'hsl(var(--destructive)/.3)'}`,...mono}}>{r.pass?'✓ Match':'✗ Mismatch'}</span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:6,...mono,fontSize:'var(--text-xs)',flexWrap:'wrap'}}>
                            <span style={{...muted}}>原始輸出</span>
                            <span style={{fontWeight:600}}>{r.response}</span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:6,...mono,fontSize:'var(--text-xs)',marginTop:4,flexWrap:'wrap'}}>
                            <span style={{...muted}}>正規化後</span>
                            <span style={{fontWeight:700,color:r.pass?'hsl(160 70% 28%)':'hsl(0 72% 38%)'}}>{normd}</span>
                            <span style={{...muted}}>{r.pass?'＝':'≠'}</span>
                            <span style={{fontWeight:700}}>{norm(c.expected)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()
        }
      </div>
    </div>
  );
}

/* ── CASE INSPECTOR ──────────────────────────────────────── */
function methodNote(task){
  if(task==='recognition') return '評分方式：whole-match — 將輸出與標準答案正規化（去空白、轉小寫）後比對 output == expected。';
  if(task==='ocr')         return '評分方式：精確比對 — 轉大寫並移除分隔符（- / 空白）後比對字串是否完全一致。';
  if(task==='locate')      return '評分方式：IoU — 預測框與標準框的交集 / 聯集面積比；以 0.5 為通過門檻。';
  return null;
}
function CaseInspector({cases, enabledModels, baseId}) {
  const [filter, setFilter] = React.useState('all');
  const [layout, setLayout] = React.useState('split');
  const [openJdg, setOpenJdg] = React.useState(null);
  const isVlm = !!cases[0]?.task;

  const modelIds = enabledModels.map(m=>m.id).filter(id=>cases[0]?.models[id]);
  const candId   = modelIds.find(id=>id!==baseId) || modelIds[0];

  const counts = {
    all: cases.length,
    any_wrong: cases.filter(c=>modelIds.some(id=>!c.models[id]?.pass)).length,
    all_wrong: cases.filter(c=>modelIds.every(id=>!c.models[id]?.pass)).length,
    regression: cases.filter(c=>isRegr(c,baseId,candId)).length,
  };
  const filtered = cases.filter(c=>{
    if(filter==='regression') return isRegr(c,baseId,candId);
    if(filter==='any_wrong')  return modelIds.some(id=>!c.models[id]?.pass);
    if(filter==='all_wrong')  return modelIds.every(id=>!c.models[id]?.pass);
    return true;
  });
  const wrongLabel = isVlm ? '有模型答錯' : '有模型答錯';

  const fbtn = (k,label) => (
    <button key={k} onClick={()=>setFilter(k)} style={{...mono,fontSize:'var(--text-xs)',padding:'4px 12px',borderRadius:'var(--radius-full)',border:`1px solid ${filter===k?'hsl(var(--primary))':'hsl(var(--border))'}`,background:filter===k?'hsl(var(--primary))':'hsl(var(--card))',color:filter===k?'#fff':'hsl(var(--muted-foreground))',cursor:'pointer',fontWeight:filter===k?600:400,transition:'all .12s'}}>
      {label} <span style={{opacity:.75}}>{counts[k]}</span>
    </button>
  );
  const note = isVlm ? methodNote(cases[0].task) : null;

  return (
    <div style={{padding:'4px 20px 20px'}}>
      {note && <div style={{display:'flex',gap:7,alignItems:'flex-start',marginBottom:12,padding:'8px 11px',background:'hsl(var(--accent)/.4)',borderRadius:'var(--radius-md)',border:'1px solid hsl(var(--border))'}}>
        <span style={{fontSize:12,color:'hsl(var(--primary))'}}>ⓘ</span>
        <span style={{fontSize:'var(--text-xs)',...mono,lineHeight:1.6,color:'hsl(var(--foreground))'}}>{note}</span>
      </div>}

      <div style={{display:'flex',flexWrap:'wrap',gap:6,alignItems:'center',marginBottom:14}}>
        {fbtn('all','全部案例')}
        {fbtn('any_wrong',wrongLabel)}
        {fbtn('all_wrong','全部答錯')}
        <button onClick={()=>setFilter('regression')} style={{...mono,fontSize:'var(--text-xs)',padding:'4px 12px',borderRadius:'var(--radius-full)',border:`1px solid ${filter==='regression'?'hsl(var(--destructive))':'hsl(var(--destructive)/.4)'}`,background:filter==='regression'?'hsl(var(--destructive))':'hsl(var(--destructive)/.08)',color:filter==='regression'?'#fff':'hsl(0 72% 38%)',cursor:'pointer',fontWeight:600,transition:'all .12s',display:'inline-flex',alignItems:'center',gap:4}}>
          ⚠ 退步 <span style={{opacity:.8}}>{counts.regression}</span>
        </button>
        {!isVlm && <div style={{marginLeft:'auto',display:'inline-flex',border:'1px solid hsl(var(--border))',borderRadius:'var(--radius-full)',overflow:'hidden',background:'hsl(var(--secondary))'}}>
          {[['split','⊟ 並排'],['three','⊞ 直列']].map(([k,t])=>(
            <button key={k} onClick={()=>setLayout(k)} style={{...mono,fontSize:'var(--text-xs)',padding:'4px 12px',border:'none',cursor:'pointer',background:layout===k?'hsl(var(--primary))':'transparent',color:layout===k?'hsl(var(--primary-foreground))':'hsl(var(--muted-foreground))',transition:'all .12s'}}>{t}</button>
          ))}
        </div>}
      </div>

      {filtered.length===0
        ? <div style={{textAlign:'center',padding:'20px 0',...lbl}}>{filter==='regression'?'✓ 沒有退步案例，新模型完全相容':'沒有符合篩選條件的案例'}</div>
        : filtered.map(c=> isVlm
            ? <VlmCaseRow key={c.id} c={c} baseId={baseId} candId={candId} enabledModels={enabledModels}/>
            : <LlmCaseRow key={c.id} c={c} baseId={baseId} candId={candId} enabledModels={enabledModels} layout={layout} judgeOpen={openJdg===c.id} onJudge={()=>setOpenJdg(p=>p===c.id?null:c.id)}/>
          )
      }
    </div>
  );
}

/* ── MODEL RESULT COLUMN ─────────────────────────────────── */
function ModelCol({label, data, modelId, champion, isBaseline, metricType}) {
  if(!data) return null;
  const pct = (data.score*100).toFixed(1)+'%';          // 分數條寬度（0–100%）
  const isJudge = metricType==='llm';                    // LLM = judge 0–5 制
  const headline = isJudge ? (data.score*5).toFixed(1)+'/5' : pct;
  const col = MC[modelId]||'#14b8a6';
  return (
    <div style={{flex:1,minWidth:210,maxWidth:330,...card,padding:'12px 14px 12px 17px',position:'relative',
      background:data.score>=.85?'hsl(160 84% 39%/.05)':data.score>=.4?'hsl(38 92% 50%/.05)':'hsl(0 84% 60%/.05)',
      borderColor:data.score>=.85?'hsl(160 84% 39%/.3)':data.score>=.4?'hsl(38 92% 50%/.3)':'hsl(0 84% 60%/.3)'}}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:sb(data.score),borderRadius:'var(--radius-lg) 0 0 var(--radius-lg)'}}/>
      {champion && <span style={{position:'absolute',top:-10,right:10,fontSize:11,fontWeight:600,background:'hsl(var(--success))',color:'#fff',padding:'1px 8px',borderRadius:'var(--radius-full)'}}>🏆 WINNER</span>}
      {isBaseline && <span style={{position:'absolute',top:7,right:8,...mono,fontSize:9,padding:'1px 6px',borderRadius:'var(--radius-sm)',background:'hsl(var(--secondary))',color:'hsl(var(--muted-foreground))',border:'1px solid hsl(var(--border))'}}>基準</span>}
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
        <span style={{width:10,height:10,borderRadius:'50%',background:col,flexShrink:0}}/>
        <span style={{...mono,fontSize:'var(--text-sm)',fontWeight:600,flex:1}}>{label}</span>
        <span style={{...mono,fontSize:26,fontWeight:900,color:sc(data.score),fontVariantNumeric:'tabular-nums'}}>{headline}</span>
      </div>
      <div style={{height:6,borderRadius:'var(--radius-full)',background:'hsl(var(--secondary))',overflow:'hidden',marginBottom:9}}>
        <div className="animate-bar-grow" style={{width:pct,height:'100%',background:sb(data.score),borderRadius:'var(--radius-full)'}}/>
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
        {metricType==='locate'
          ? <span style={{...mono,fontSize:11,...muted}}>mean IoU {(data.iou*100).toFixed(1)}%</span>
          : (metricType==='recognition'||metricType==='ocr')
            ? <>
                <span style={{...mono,fontSize:11,color:'hsl(160 60% 30%)',fontWeight:500}}>✓ 正確 {data.correct}/{data.total}</span>
                <span style={{...lbl,...mono}}>{(metricType==='ocr'?'精確比對':'whole-match')}</span>
              </>
            : <>
                {data.wins!=null && <span style={{...mono,fontSize:11,color:'hsl(160 60% 30%)',fontWeight:500}}>↑ 贏了 {data.wins} 題</span>}
                {data.total && <span style={{...lbl,...mono}}>{data.wins}/{data.total}（{((data.wins/data.total)*100).toFixed(0)}% 勝率）</span>}
              </>
        }
        {data.regressions>0 && <span style={{...mono,fontSize:11,fontWeight:700,color:'hsl(0 72% 38%)',background:'hsl(var(--destructive)/.08)',padding:'0 6px',borderRadius:'var(--radius-sm)',border:'1px solid hsl(var(--destructive)/.3)'}}>⚠ 退步 {data.regressions} 題</span>}
      </div>
    </div>
  );
}

/* ── PROJECT ROW ─────────────────────────────────────────── */
function ProjRow({p, sel, onToggle}) {
  const cap = CAP_CLR[p.cap]||{bg:'hsl(var(--secondary))',color:'hsl(var(--muted-foreground))'};
  return (
    <div onClick={onToggle} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:'var(--radius-md)',border:`1px solid ${sel?'hsl(var(--primary)/.5)':'hsl(var(--border))'}`,background:sel?'hsl(var(--primary)/.05)':'transparent',cursor:'pointer',marginBottom:6,transition:'all .12s'}}>
      <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${sel?'hsl(var(--primary))':'hsl(var(--border))'}`,background:sel?'hsl(var(--primary))':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .14s'}}>
        {sel&&<svg width={11} height={11} viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span style={{flex:1,fontSize:'var(--text-sm)'}}>{p.label}</span>
      <span style={{fontSize:10,padding:'2px 8px',borderRadius:'var(--radius-full)',...mono,fontWeight:500,...cap}}>{p.cap}</span>
      {p.est&&<span style={{...lbl,fontSize:10,whiteSpace:'nowrap'}}>~{p.est}m</span>}
    </div>
  );
}

Object.assign(window, { Tag, JudgePanel, LlmCaseRow, VlmCaseRow, BBoxViewer, CaseInspector, ModelCol, ProjRow });
