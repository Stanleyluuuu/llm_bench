/* ════════════════════════════════════════════════════════════════
   Garmin LLM/VLM Benchmark — demo data
   Exposes window.BM = { models, projects, results, cases, history, … }
   ════════════════════════════════════════════════════════════════ */
(function () {

/* ── MODELS (with click-to-expand detail rows) ──────────────────── */
const INIT_MODELS = [
  { id:'llm_large', label:'LLM Large', name:'qwen3-72b', kind:'builtin', type:'LLM', enabled:true, details:[
      {label:'端點', value:'infer.garmin.io/v1/llm-large', href:'http://infer.garmin.io/v1/llm-large'},
      {label:'參數量', value:'72B'},
      {label:'內容長度', value:'32,768 tokens'},
      {label:'供應', value:'Qwen3 · 自架 vLLM'},
      {label:'模型卡', value:'查看文件', href:'https://qwenlm.github.io/'},
  ]},
  { id:'llm_small', label:'LLM Small', name:'qwen3-14b', kind:'builtin', type:'LLM', enabled:true, details:[
      {label:'端點', value:'infer.garmin.io/v1/llm-small', href:'http://infer.garmin.io/v1/llm-small'},
      {label:'參數量', value:'14B'},
      {label:'內容長度', value:'32,768 tokens'},
      {label:'供應', value:'Qwen3 · 自架 vLLM'},
      {label:'模型卡', value:'查看文件', href:'https://qwenlm.github.io/'},
  ]},
  { id:'vlm_large', label:'VLM Large', name:'qwen-vl-72b', kind:'builtin', type:'VLM', enabled:false, details:[
      {label:'端點', value:'infer.garmin.io/v1/vlm-large', href:'http://infer.garmin.io/v1/vlm-large'},
      {label:'參數量', value:'72B'},
      {label:'解析度', value:'最高 1280×1280'},
      {label:'供應', value:'Qwen2.5-VL · 自架'},
      {label:'模型卡', value:'查看文件', href:'https://qwenlm.github.io/'},
  ]},
  { id:'vlm_small', label:'VLM Small', name:'qwen-vl-7b', kind:'builtin', type:'VLM', enabled:false, details:[
      {label:'端點', value:'infer.garmin.io/v1/vlm-small', href:'http://infer.garmin.io/v1/vlm-small'},
      {label:'參數量', value:'7B'},
      {label:'解析度', value:'最高 896×896'},
      {label:'供應', value:'Qwen2.5-VL · 自架'},
      {label:'模型卡', value:'查看文件', href:'https://qwenlm.github.io/'},
  ]},
  { id:'custom_1', label:'Llama3-8B', name:'Llama-3-8B', kind:'custom', type:'LLM', enabled:false, color:'#14b8a6', details:[
      {label:'端點', value:'10.0.4.27:8000/v1', href:'http://10.0.4.27:8000/v1'},
      {label:'參數量', value:'8B'},
      {label:'內容長度', value:'8,192 tokens'},
      {label:'供應', value:'使用者上傳 · 2026-06-12'},
      {label:'權重', value:'meta-llama/Llama-3-8B', href:'https://huggingface.co/meta-llama'},
  ]},
];

/* ── PROJECTS ───────────────────────────────────────────────────── */
const LLM_PROJECTS = [
  { name:'general_qa',  label:'通用問答',   cap:'Text Gen',    est:5, type:'LLM' },
  { name:'code_review', label:'程式碼審查', cap:'Code',        est:8, type:'LLM' },
  { name:'translation', label:'中英翻譯',   cap:'Translation', est:4, type:'LLM' },
];
const VLM_PROJECTS = [
  { name:'flame_detect', label:'影像辨識（是非）', cap:'Recognition', est:6,  type:'VLM', vlmType:'recognition' },
  { name:'serial_ocr',   label:'裝置序號 OCR',     cap:'OCR',         est:5,  type:'VLM', vlmType:'ocr' },
  { name:'part_locate',  label:'零件定位（Grounding）', cap:'Grounding', est:15, type:'VLM', vlmType:'locate' },
];

/* ── HEADLINE RESULTS ───────────────────────────────────────────── */
const RESULTS = {
  general_qa:   { llm_large:{score:.881, wins:2, total:4, regressions:1}, llm_small:{score:.746, wins:2, total:4, regressions:0} },
  code_review:  { llm_large:{score:.871, wins:13, total:18, regressions:2}, llm_small:{score:.634, wins:5, total:18, regressions:0} },
  translation:  { llm_large:{score:.956, wins:20, total:24, regressions:0}, llm_small:{score:.812, wins:4, total:24, regressions:0} },
  flame_detect: { vlm_large:{score:.92, acc:.92, correct:23, total:25, regressions:1}, vlm_small:{score:.84, acc:.84, correct:21, total:25, regressions:0} },
  serial_ocr:   { vlm_large:{score:.97, acc:.97, correct:29, total:30, regressions:0}, vlm_small:{score:.88, acc:.88, correct:26, total:30, regressions:0} },
  part_locate:  { vlm_large:{score:.86, iou:.86, regressions:0}, vlm_small:{score:.49, iou:.49, regressions:1} },
};

/* ── LLM PER-CASE DETAIL ────────────────────────────────────────── */
const CASES_GQA = [
  { id:1, question:'如何修改 Garmin 裝置的語言設定？',
    gt:'前往「設定」→「系統」→「語言」，選擇語言後重新啟動裝置。', tags:['設定操作'],
    models:{
      llm_large:{ pass:true, score:4.5, answer:'請至 Garmin Connect App，進入裝置管理，點擊「設定」→「系統」→「語言」，配對後裝置將自動同步語言偏好。',
        reasoning:'答案完整描述操作路徑，涵蓋 App 入口及裝置設定路徑，用語清晰。扣分原因：未提及「重啟裝置」步驟（-0.5）。最終評分 4.5/5。' },
      llm_small:{ pass:false, score:1.8, answer:'語言設定在系統選單裡面，您可以直接更改。',
        reasoning:'答案過於簡略，僅指出方向但缺乏具體步驟，使用者難以依此操作。最終評分 1.8/5。' },
    }},
  { id:2, question:'心率監測不準確時如何校正？',
    gt:'保持手腕清潔、手環貼緊皮膚，避免運動後立即量測。若持續不準，可在 Garmin Connect 感測器設定執行重新校正。', tags:['感測器','健康數據'],
    models:{
      llm_large:{ pass:true, score:4.0, answer:'確保手環貼緊手腕，清潔皮膚後重新配戴，避免配戴過鬆。運動後請靜候 5 分鐘再量測。',
        reasoning:'正確提及配戴方式與運動後等待時間，但未提及 Garmin Connect 重新校正選項（-1.0）。最終評分 4.0/5。' },
      llm_small:{ pass:true, score:4.2, answer:'請確認手環是否貼緊手腕，並在 Garmin Connect 感測器設定中選擇「心率感測器校正」依步驟操作。',
        reasoning:'本題 LLM Small 表現優於 LLM Large，明確提及 Garmin Connect 校正功能，資訊更完整（+0.2）。最終評分 4.2/5。' },
    }},
  { id:3, question:'藍牙已開啟但同步仍失敗，下一步如何排除？',
    gt:'在手機藍牙設定中刪除裝置後重新配對。若仍失敗，清除 Garmin Connect App 快取或重新安裝。', tags:['故障排除','邊緣案件'],
    models:{
      llm_large:{ pass:false, score:1.9, answer:'請重新啟動手機藍牙，靠近裝置後重新嘗試同步。',
        reasoning:'⚠ Regression：LLM Large 僅重複了已確認無效的基礎步驟（重啟藍牙），未提供進階排除方案。對「藍牙已開啟仍失敗」的情境，此回答完全不足。最終評分 1.9/5。' },
      llm_small:{ pass:true, score:4.5, answer:'若藍牙已開啟仍無法同步，請在手機藍牙設定刪除裝置後重新配對。若問題持續，清除 Garmin Connect 快取（設定→應用程式→Garmin Connect→清除快取）或重新安裝。',
        reasoning:'LLM Small 正確理解問題脈絡（藍牙已開啟），提供有效的進階排除步驟與具體路徑，是本題明顯更優的回答。最終評分 4.5/5。' },
    }},
  { id:4, question:'如何設定每日步數目標？',
    gt:'在 Garmin Connect App 進入「更多」→「健身統計」→「目標」→「步數目標」，輸入每日目標。', tags:['設定操作'],
    models:{
      llm_large:{ pass:true, score:4.1, answer:'在 Garmin Connect App 底部點擊「更多」→「目標」→「每日步數」，輸入目標後儲存。',
        reasoning:'路徑描述正確且實用，稍有簡化但使用者可依此找到設定頁面。最終評分 4.1/5。' },
      llm_small:{ pass:false, score:1.4, answer:'您可以在 Garmin Connect App 設定步數目標。',
        reasoning:'回答極度簡略，未提供任何導航路徑，對使用者毫無幫助。最終評分 1.4/5。' },
    }},
];

const CASES_CODE = [
  { id:1, question:'審查此函式的記憶體洩漏風險（C，malloc 後缺少 free）', gt:'指出未釋放的 buffer，建議在所有 return 路徑前 free，或改用 RAII / cleanup goto。', tags:['記憶體','C'],
    models:{
      llm_large:{ pass:true, score:4.6, answer:'第 14 行 malloc 配置的 buf 在 error 分支提前 return，未被釋放，造成洩漏。建議使用 `goto cleanup;` 統一釋放，或在每個 return 前加上 free(buf)。',
        reasoning:'準確定位洩漏行號與錯誤分支，並給出兩種慣用修法。最終評分 4.6/5。' },
      llm_small:{ pass:false, score:2.1, answer:'程式碼看起來沒有明顯問題，記得釋放記憶體即可。',
        reasoning:'未指出具體洩漏位置，泛泛而談，無法協助修正。最終評分 2.1/5。' },
    }},
  { id:2, question:'此 SQL 查詢是否有注入風險？', gt:'字串拼接使用者輸入存在 SQL injection，應改用參數化查詢 / prepared statement。', tags:['安全','SQL','邊緣案件'],
    models:{
      llm_large:{ pass:false, score:2.4, answer:'查詢邏輯正確，效能上可加索引以加速。',
        reasoning:'⚠ Regression：完全忽略了明顯的字串拼接注入風險，僅談效能。安全審查嚴重失格。最終評分 2.4/5。' },
      llm_small:{ pass:true, score:4.3, answer:'第 8 行直接把 request.name 拼進 SQL 字串，有注入風險。請改用參數化查詢（`cursor.execute(sql, (name,))`）。',
        reasoning:'正確識別注入點並給出參數化修法，安全意識佳。最終評分 4.3/5。' },
    }},
  { id:3, question:'這段 React useEffect 為何造成無限重繪？', gt:'依賴陣列遺漏 / 物件每次新建導致 effect 反覆觸發，應 memo 化或修正依賴。', tags:['React','邊緣案件'],
    models:{
      llm_large:{ pass:false, score:2.0, answer:'把 useEffect 移到 component 外層就好了。',
        reasoning:'⚠ Regression：建議在語法上不可行（Hook 不可移出元件），且未指出真正成因（依賴物件每次重建）。最終評分 2.0/5。' },
      llm_small:{ pass:true, score:4.0, answer:'options 物件在每次 render 都重新建立，作為依賴使 effect 每次都觸發。請用 useMemo 包住 options 或改用其原始值作依賴。',
        reasoning:'正確診斷重建依賴問題並給出 useMemo 修法。最終評分 4.0/5。' },
    }},
];

const CASES_TRANS = [
  { id:1, question:'翻譯：「請在配對前確認裝置韌體已更新至最新版本。」', gt:'Please ensure the device firmware is updated to the latest version before pairing.', tags:['術語'],
    models:{
      llm_large:{ pass:true, score:4.8, answer:'Please make sure the device firmware is updated to the latest version before pairing.',
        reasoning:'語意精準、術語（firmware / pairing）正確，語氣自然。最終評分 4.8/5。' },
      llm_small:{ pass:true, score:3.9, answer:'Please confirm the device software is newest before connecting.',
        reasoning:'語意可懂但術語不精確（software vs firmware、newest 用詞生硬）。最終評分 3.9/5。' },
    }},
  { id:2, question:'翻譯：「血氧感測器在高海拔環境下讀數可能偏低。」', gt:'Pulse Ox readings may be lower at high altitude.', tags:['術語','健康數據'],
    models:{
      llm_large:{ pass:true, score:4.7, answer:'Pulse Ox readings may read lower in high-altitude environments.',
        reasoning:'正確使用 Garmin 官方術語 Pulse Ox，語句通順。最終評分 4.7/5。' },
      llm_small:{ pass:false, score:2.6, answer:'The blood oxygen sensor number maybe low when you are high place.',
        reasoning:'文法錯誤（maybe / high place），且未使用標準術語。最終評分 2.6/5。' },
    }},
];

/* ── VLM PER-CASE DETAIL ────────────────────────────────────────── */
/* recognition: whole-match yes/no after lower-case normalization      */
const CASES_FLAME = [
  { id:1, task:'recognition', question:'影像中是否出現明火 / 火焰？', expected:'yes', tags:['是非題'],
    models:{ vlm_large:{response:'Yes', pass:true}, vlm_small:{response:'yes', pass:true} } },
  { id:2, task:'recognition', question:'裝置外殼是否有可見裂痕？', expected:'no', tags:['是非題'],
    models:{ vlm_large:{response:'No', pass:true}, vlm_small:{response:'NO', pass:true} } },
  { id:3, task:'recognition', question:'影像中是否有水損痕跡（水漬 / 鏽蝕）？', expected:'yes', tags:['是非題','邊緣案件'],
    models:{ vlm_large:{response:'No', pass:false}, vlm_small:{response:'Yes', pass:true} } },
  { id:4, task:'recognition', question:'電池是否有膨脹變形？', expected:'yes', tags:['是非題'],
    models:{ vlm_large:{response:'Yes', pass:true}, vlm_small:{response:'No', pass:false} } },
];
/* ocr: exact match after uppercase + strip of separators              */
const CASES_OCR = [
  { id:1, task:'ocr', question:'讀取機背序號標籤', expected:'GRM7X428841', tags:['OCR'],
    models:{ vlm_large:{response:'GRM-7X42-8841', pass:true}, vlm_small:{response:'grm-7x42-8841', pass:true} } },
  { id:2, task:'ocr', question:'讀取充電座型號', expected:'DCB10EU', tags:['OCR'],
    models:{ vlm_large:{response:'DCB10-EU', pass:true}, vlm_small:{response:'DCBI0-EU', pass:false} } },
  { id:3, task:'ocr', question:'讀取電池規格標籤', expected:'380MAH37V', tags:['OCR','邊緣案件'],
    models:{ vlm_large:{response:'380mAh 3.7V', pass:true}, vlm_small:{response:'380mAh 37V', pass:false} } },
];
/* locate: bbox grounding scored by IoU. boxes are pixel [x,y,w,h]      */
const CASES_LOC = [
  { id:1, task:'locate', question:'請定位主機板上的電池接點 (battery connector)', img:{w:640,h:480},
    gt:[210,150,180,96], tags:['Grounding'],
    models:{ vlm_large:{box:[219,158,170,86], iou:.86, pass:true, note:'框選準確，輕微外擴'},
             vlm_small:{box:[150,118,150,150], iou:.41, pass:false, note:'框過大且左偏，誤含周邊元件'} } },
  { id:2, task:'locate', question:'請定位螢幕排線接頭 (display FPC connector)', img:{w:640,h:480},
    gt:[300,250,120,70], tags:['Grounding','邊緣案件'],
    models:{ vlm_large:{box:[296,244,128,80], iou:.79, pass:true, note:'準確涵蓋接頭範圍'},
             vlm_small:{box:[330,270,150,110], iou:.38, pass:false, note:'整體右下偏移，超出接頭'} } },
];

const CASES_BY_PROJECT = {
  general_qa: CASES_GQA, code_review: CASES_CODE, translation: CASES_TRANS,
  flame_detect: CASES_FLAME, serial_ocr: CASES_OCR, part_locate: CASES_LOC,
};

/* ── HISTORY ────────────────────────────────────────────────────── */
const LLM_METHODS = {
  llm_judge: { label:'LLM-as-Judge', tone:'builtin', desc:'以 LLM Large 當裁判，逐題給 0–5 分並附評語' },
  ragas:     { label:'RAGAS',        tone:'custom',  desc:'faithfulness · answer-relevancy · context-precision 綜合分' },
  deepeval:  { label:'DeepEval',     tone:'primary', desc:'G-Eval + DAG 自訂指標，可寫單元測試式斷言', badge:'評估中', href:'https://github.com/confident-ai/deepeval' },
};
/* task label lookup (history detail shows per-task breakdown) */
const TASK_LABELS = {
  general_qa:'通用問答', code_review:'程式碼審查', translation:'中英翻譯',
  flame_detect:'影像辨識', serial_ocr:'序號 OCR', part_locate:'零件定位',
};
/* VLM history metrics — recognition/OCR are accuracy; grounding is mean IoU */
const VLM_METRICS = [
  { key:'recog', label:'影像辨識', unit:'accuracy', hint:'whole-match · output == expected' },
  { key:'ocr',   label:'序號 OCR', unit:'accuracy', hint:'精確比對 · 正規化字串相等' },
  { key:'iou',   label:'零件定位', unit:'mean IoU', hint:'grounding · 交集 / 聯集' },
];

/* HISTORY_LLM — each run records the exact set of models that ran (varies run
   to run: a model may be added or dropped), each with overall judge score,
   regression count, and per-task scores. */
const HISTORY_LLM = [
  { ts:'Jun 18 14:30', method:'deepeval', scope:'3 任務 · 70 題', current:true, baseline:{ts:'Jun 11 09:02', method:'ragas'},
    models:[
      { id:'llm_large', label:'LLM Large', score:.881, reg:1, tasks:[ {key:'general_qa',score:.85},{key:'code_review',score:.84},{key:'translation',score:.95} ] },
      { id:'llm_small', label:'LLM Small', score:.731, reg:0, tasks:[ {key:'general_qa',score:.66},{key:'code_review',score:.63},{key:'translation',score:.90} ] },
      { id:'custom_1',  label:'Llama3-8B', score:.802, reg:0, isNew:true, tasks:[ {key:'general_qa',score:.78},{key:'code_review',score:.74},{key:'translation',score:.89} ] },
    ]},
  { ts:'Jun 11 09:02', method:'ragas', scope:'3 任務 · 70 題', baseline:{ts:'Jun 04 16:32', method:'ragas'},
    models:[
      { id:'llm_large', label:'LLM Large', score:.842, reg:0, tasks:[ {key:'general_qa',score:.83},{key:'code_review',score:.80},{key:'translation',score:.90} ] },
      { id:'llm_small', label:'LLM Small', score:.726, reg:0, tasks:[ {key:'general_qa',score:.67},{key:'code_review',score:.62},{key:'translation',score:.89} ] },
    ]},
  { ts:'Jun 04 16:32', method:'ragas', scope:'3 任務 · 68 題', baseline:{ts:'May 28 10:11', method:'llm_judge'},
    models:[
      { id:'llm_large', label:'LLM Large', score:.836, reg:2, tasks:[ {key:'general_qa',score:.82},{key:'code_review',score:.79},{key:'translation',score:.90} ] },
      { id:'llm_small', label:'LLM Small', score:.704, reg:0, tasks:[ {key:'general_qa',score:.65},{key:'code_review',score:.60},{key:'translation',score:.86} ] },
    ]},
  { ts:'May 28 10:11', method:'llm_judge', scope:'2 任務 · 52 題', baseline:{ts:'May 21 09:40', method:'llm_judge'},
    models:[
      { id:'llm_large', label:'LLM Large', score:.808, reg:1, tasks:[ {key:'general_qa',score:.81},{key:'code_review',score:.76} ] },
      { id:'llm_small', label:'LLM Small', score:.688, reg:0, tasks:[ {key:'general_qa',score:.70},{key:'code_review',score:.67} ] },
    ]},
  { ts:'May 21 09:40', method:'llm_judge', scope:'2 任務 · 52 題', baseline:null,
    models:[
      { id:'llm_large', label:'LLM Large', score:.791, reg:0, tasks:[ {key:'general_qa',score:.80},{key:'code_review',score:.78} ] },
    ]},
];

/* HISTORY_VLM — per run, per model: recognition accuracy, OCR accuracy, and
   grounding mean IoU. Model set AND task set vary: grounding (part_locate) was
   added Jun 05; vlm_small joined the same run; iou:null = task not run. */
const HISTORY_VLM = [
  { ts:'Jun 18 11:00', scope:'3 任務 · 80 題', current:true, baseline:{ts:'Jun 12 15:20'},
    models:[
      { id:'vlm_large', label:'VLM Large', recog:.92, ocr:.97, iou:.86,
        counts:{recog:[23,25],ocr:[29,30],iou:2} },
      { id:'vlm_small', label:'VLM Small', recog:.84, ocr:.88, iou:.49,
        counts:{recog:[21,25],ocr:[26,30],iou:2} },
    ]},
  { ts:'Jun 12 15:20', scope:'3 任務 · 80 題', baseline:{ts:'Jun 05 09:30'},
    models:[
      { id:'vlm_large', label:'VLM Large', recog:.90, ocr:.95, iou:.81,
        counts:{recog:[22,25],ocr:[28,30],iou:2} },
      { id:'vlm_small', label:'VLM Small', recog:.82, ocr:.86, iou:.44,
        counts:{recog:[20,25],ocr:[25,30],iou:2} },
    ]},
  { ts:'Jun 05 09:30', scope:'3 任務 · 78 題', baseline:{ts:'May 29 14:05'},
    models:[
      { id:'vlm_large', label:'VLM Large', recog:.88, ocr:.96, iou:.74,
        counts:{recog:[22,25],ocr:[28,30],iou:2} },
      { id:'vlm_small', label:'VLM Small', recog:.80, ocr:.90, iou:null,
        counts:{recog:[20,25],ocr:[27,30]} },
    ]},
  { ts:'May 29 14:05', scope:'2 任務 · 55 題', baseline:null,
    models:[
      { id:'vlm_large', label:'VLM Large', recog:.86, ocr:.93, iou:null,
        counts:{recog:[21,25],ocr:[28,30]} },
    ]},
];

/* ── SHARED CONSTANTS & HELPERS ─────────────────────────────────── */
const STAGES = ['連接模型…','載入測試案例…','執行推論中…','評分 / 比對中…','完成！'];
const MC = { llm_large:'#3b82f6', llm_small:'#60a5fa', vlm_large:'#a855f7', vlm_small:'#c084fc', custom_1:'#14b8a6' };
const CAP_CLR = {
  'Text Gen':{bg:'hsl(243 80% 60%/.1)',color:'hsl(243 75% 40%)'},
  'Code':{bg:'hsl(195 80% 50%/.1)',color:'hsl(195 80% 30%)'},
  'Translation':{bg:'hsl(340 70% 55%/.1)',color:'hsl(340 70% 38%)'},
  'Recognition':{bg:'hsl(160 60% 40%/.1)',color:'hsl(160 60% 28%)'},
  'OCR':{bg:'hsl(265 60% 55%/.12)',color:'hsl(265 55% 45%)'},
  'Grounding':{bg:'hsl(243 80% 60%/.1)',color:'hsl(243 75% 40%)'},
};
const S = {
  card:{background:'hsl(var(--card))',border:'1px solid hsl(var(--border))',borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow-sm)'},
  mono:{fontFamily:'var(--font-mono)'},
  muted:{color:'hsl(var(--muted-foreground))'},
  lbl:{fontSize:'var(--text-xs)',fontFamily:'var(--font-mono)',color:'hsl(var(--muted-foreground))'},
};
const sc = v => v>=.85?'hsl(160 70% 28%)':v>=.4?'hsl(38 80% 30%)':'hsl(0 72% 38%)';
const sb = v => v>=.85?'hsl(var(--score-high))':v>=.4?'hsl(var(--score-mid))':'hsl(var(--score-low))';
const isRegr = (c,bId,nId) => !!(c.models[bId]?.pass && !c.models[nId]?.pass);

window.BM = {
  INIT_MODELS, LLM_PROJECTS, VLM_PROJECTS, RESULTS, CASES_BY_PROJECT,
  LLM_METHODS, HISTORY_LLM, HISTORY_VLM, VLM_METRICS, TASK_LABELS,
  STAGES, MC, CAP_CLR, S, sc, sb, isRegr,
};
})();
