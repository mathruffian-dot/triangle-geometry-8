# -*- coding: utf-8 -*-
"""將 data/questions_*.json 與課綱資料嵌入 HTML 模板，產生離線可用的 index.html"""
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data"

questions = []
for y in range(103, 116):
    questions += json.loads((DATA / f"questions_{y}.json").read_text(encoding="utf-8"))
curr = json.loads((DATA / "curriculum_108.json").read_text(encoding="utf-8"))

payload = json.dumps({"questions": questions, "curriculum": curr}, ensure_ascii=False)

TEMPLATE = r"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>國中會考數學歷屆試題題庫（103–115）</title>
<style>
:root{
  --ink:#1f2937; --sub:#6b7280; --bg:#f5f6f8; --card:#ffffff; --line:#e5e7eb;
  --blue:#2563eb; --blue-bg:#eff6ff; --green:#059669; --green-bg:#ecfdf5;
  --amber:#d97706; --amber-bg:#fffbeb; --red:#dc2626; --red-bg:#fef2f2;
  --purple:#7c3aed; --purple-bg:#f5f3ff;
}
*{box-sizing:border-box}
body{margin:0;font-family:"Microsoft JhengHei","PingFang TC",system-ui,sans-serif;color:var(--ink);background:var(--bg);line-height:1.65}
header{background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;padding:18px 24px}
header h1{margin:0;font-size:1.35rem}
header p{margin:4px 0 0;font-size:.85rem;opacity:.85}
.wrap{max-width:1180px;margin:0 auto;padding:16px}
.panel{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin-bottom:14px}
.filters{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}
.filters label{display:block;font-size:.75rem;color:var(--sub);margin-bottom:3px}
.filters select,.filters input[type=text]{padding:7px 10px;border:1px solid var(--line);border-radius:8px;font-size:.9rem;background:#fff;min-width:120px}
.filters .grow{flex:1;min-width:180px}
.btn{cursor:pointer;border:none;border-radius:8px;padding:8px 14px;font-size:.88rem;font-weight:600}
.btn-blue{background:var(--blue);color:#fff}
.btn-ghost{background:#fff;color:var(--blue);border:1px solid var(--blue)}
.btn-green{background:var(--green);color:#fff}
.btn:disabled{opacity:.4;cursor:not-allowed}
.tabs{display:flex;gap:8px;margin-bottom:12px}
.tab{padding:8px 16px;border-radius:999px;border:1px solid var(--line);background:#fff;cursor:pointer;font-size:.9rem;font-weight:600;color:var(--sub)}
.tab.active{background:var(--blue);border-color:var(--blue);color:#fff}
.count{font-size:.85rem;color:var(--sub);margin:6px 2px 10px}
.qcard{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin-bottom:16px}
.qhead{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:8px}
.badge{display:inline-block;padding:2px 9px;border-radius:999px;font-size:.74rem;font-weight:700}
.b-year{background:#1e3a5f;color:#fff}
.b-book{background:var(--purple-bg);color:var(--purple)}
.b-chap{background:var(--blue-bg);color:var(--blue)}
.b-code{background:var(--green-bg);color:var(--green)}
.b-perf{background:var(--amber-bg);color:var(--amber)}
.b-diff-易{background:var(--green-bg);color:var(--green)}
.b-diff-中{background:var(--amber-bg);color:var(--amber)}
.b-diff-難{background:var(--red-bg);color:var(--red)}
.b-type{background:#f3f4f6;color:var(--sub)}
.topic{font-size:.85rem;color:var(--sub);margin-left:auto}
.qimg{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff}
.qacts{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center}
.pickbox{margin-left:auto;display:flex;align-items:center;gap:5px;font-size:.85rem;color:var(--sub)}
.guide,.sol{margin-top:10px;border-radius:10px;padding:12px 14px;display:none}
.guide{background:var(--blue-bg);border:1px solid #bfdbfe}
.sol{background:var(--green-bg);border:1px solid #a7f3d0}
.step{background:#fff;border:1px solid #bfdbfe;border-left:4px solid var(--blue);border-radius:8px;padding:8px 12px;margin:8px 0;display:none}
.step .sn{font-weight:700;color:var(--blue);font-size:.8rem}
.trap{margin-top:8px;background:var(--red-bg);border:1px solid #fecaca;border-radius:8px;padding:8px 12px;font-size:.88rem}
.trap b{color:var(--red)}
.ansline{font-weight:700;color:var(--green);margin-bottom:6px}
.stats table{border-collapse:collapse;width:100%;font-size:.88rem}
.stats th,.stats td{border:1px solid var(--line);padding:6px 10px;text-align:left}
.stats th{background:#f9fafb}
.bar{height:14px;background:var(--blue);border-radius:4px;display:inline-block;vertical-align:middle}
.toolbar{position:sticky;top:0;z-index:50;background:rgba(245,246,248,.95);backdrop-filter:blur(4px);padding:10px 0;border-bottom:1px solid var(--line);margin-bottom:12px}
.pagebtns{display:flex;gap:6px;justify-content:center;margin:18px 0;flex-wrap:wrap}
.pagebtns button{min-width:36px;padding:6px 8px;border:1px solid var(--line);background:#fff;border-radius:8px;cursor:pointer}
.pagebtns button.cur{background:var(--blue);color:#fff;border-color:var(--blue)}
footer{color:var(--sub);font-size:.78rem;text-align:center;padding:20px}
@media print{
  body{background:#fff}
  header,.toolbar,.panel,.tabs,.count,.qacts,.guide,.pagebtns,footer,#statsView{display:none !important}
  .qcard{border:none;page-break-inside:avoid;padding:6px 0;margin-bottom:8px}
  .qcard.notpicked{display:none}
  .sol{display:none !important}
  body.print-with-sol .sol{display:block !important}
  body.print-with-sol .qimg{max-width:75%}
  .qhead .b-perf,.qhead .b-code{display:none}
  body.print-clean .qhead{display:none}
}
</style>
</head>
<body>
<header>
  <h1>📚 國中教育會考數學歷屆試題題庫（103–115 年）</h1>
  <p>共 <span id="totalN"></span> 題｜每題含 108 課綱學習內容／學習表現標記、冊別章節、逐步解題引導與詳解｜資料來源：國中教育會考網站（臺師大心測中心）</p>
</header>
<div class="wrap">
  <div class="tabs">
    <div class="tab active" data-view="bank">題庫瀏覽</div>
    <div class="tab" data-view="stats">命題分析統計</div>
    <div class="tab" data-view="about">使用說明</div>
  </div>

  <div id="bankView">
    <div class="panel">
      <div class="filters">
        <div><label>年度／屆數</label><select id="fYear">
          <option value="">全部</option>
          <option value="R3">最近3屆（113–115）</option>
          <option value="R5">最近5屆（111–115）</option>
          <option value="R10">最近10屆（106–115）</option>
        </select></div>
        <div><label>題號範圍（如 1-10 或 3,5,7-9）</label><input type="text" id="fNum" placeholder="全部" style="min-width:150px"></div>
        <div><label>冊別</label><select id="fBook"><option value="">全部</option></select></div>
        <div><label>章節</label><select id="fChap"><option value="">全部</option></select></div>
        <div><label>學習內容</label><select id="fCode"><option value="">全部</option></select></div>
        <div><label>難度</label><select id="fDiff"><option value="">全部</option><option>易</option><option>中</option><option>難</option></select></div>
        <div><label>題型</label><select id="fType"><option value="">全部</option><option value="choice">選擇題</option><option value="essay">非選擇題</option></select></div>
        <div class="grow"><label>關鍵字（主題／代碼／文字）</label><input type="text" id="fKw" placeholder="例如：畢氏定理、相似、S-9-2"></div>
        <button class="btn btn-ghost" id="btnReset">清除條件</button>
      </div>
    </div>
    <div class="toolbar">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center" class="wrap-inner">
        <button class="btn btn-blue" id="btnAllGuide">全部收合</button>
        <button class="btn btn-green" id="btnPrint">🖨 列印勾選題目（題目卷）</button>
        <button class="btn btn-ghost" id="btnPrintSol">🖨 列印勾選（含詳解）</button>
        <button class="btn btn-blue" id="btnQuiz">🌐 匯出線上試卷</button>
        <button class="btn btn-ghost" id="btnPickPage">勾選本頁全部</button>
        <button class="btn btn-ghost" id="btnClearPick">清除勾選</button>
        <span class="count" style="margin:0">已勾選 <b id="pickN">0</b> 題</span>
      </div>
    </div>
    <div class="count" id="countLine"></div>
    <div id="qlist"></div>
    <div class="pagebtns" id="pager"></div>
  </div>

  <div id="statsView" style="display:none">
    <div class="panel stats" id="statBook"></div>
    <div class="panel stats" id="statChap"></div>
    <div class="panel stats" id="statCode"></div>
  </div>

  <div id="aboutView" style="display:none">
    <div class="panel">
      <h3>這個題庫是什麼？</h3>
      <p>本題庫收錄 103～115 年國中教育會考數學科全部試題（含非選擇題），每題均已比對
      <b>108 課綱數學領域</b>之學習內容（如 N-7-1、S-9-2）與學習表現（如 n-IV-1、s-IV-10）代碼，
      並標記冊別（B1～B6）與章節，方便依單元出題。</p>
      <h3>怎麼用它出題？</h3>
      <ol>
        <li>用上方篩選器選出想要的<b>冊別／章節／難度</b>（例如 B3 第2章、難度「中」）。</li>
        <li>逐題勾選右上角「選入試卷」。</li>
        <li>按「🖨 列印勾選題目」印出<b>題目卷</b>（不含解答），或按「列印勾選（含詳解）」印<b>教師卷</b>。</li>
      </ol>
      <h3>線上試卷（學生 iPad 作答）</h3>
      <ol>
        <li>篩選（可用「最近N屆」＋「題號範圍」，例如最近5屆的第1-10題）並勾選題目。</li>
        <li>按「🌐 匯出線上試卷」→ 輸入卷名 → 下載一個 HTML 檔。</li>
        <li>把檔案改名 <b>index.html</b> 放進新資料夾，拖進 <b>app.netlify.com/drop</b> → 得到網址發給學生。</li>
        <li>學生填班級／座號／姓名作答，交卷後畫面出現「作答紀錄」：可複製、分享（LINE/AirDrop）或下載 JSON 檔，收回給老師。</li>
        <li>選擇題自動批改；作答中途重新整理不會遺失（自動暫存）。</li>
        <li>預留接口：試卷檔內 <code>CONFIG.submitUrl</code> 填入網址後，交卷會自動 POST 作答紀錄 JSON（之後接後端／試算表用，不需改其他程式）。</li>
      </ol>
      <h3>逐步解題引導</h3>
      <p>每題的「💡 逐步引導」按一次顯示一步，讓學生想一步、看一步；「📖 完整詳解」直接展開答案與說明，
      並附「⚠ 易錯提醒」。</p>
      <h3>兩種檔案版本</h3>
      <ul>
        <li><b>index.html</b>：需與「01_題目圖片」資料夾放在一起（在會考題庫資料夾內開啟）。</li>
        <li><b>會考題庫單檔版.html</b>：圖片已內嵌，單一檔案即可離線使用、可單獨複製到隨身碟或傳給別人（檔案較大，開啟稍慢）。</li>
      </ul>
      <h3>資料說明</h3>
      <ul>
        <li>103～110 年為舊課綱時期試題，已對映至 108 課綱最接近的學習內容代碼。</li>
        <li>103～106 年官方檔案為「新聞用試題本」掃描版，浮水印已以影像處理移除。</li>
        <li>選擇題答案皆與官方參考答案逐題核對；非選擇題為自撰詳解（經二次驗算）。</li>
        <li>冊別章節依通行版教科書架構（與本專案 909 複習細項表一致）。</li>
      </ul>
    </div>
  </div>
</div>
<footer>會考題庫・由 Claude Code 產生｜題目版權屬臺師大心測中心，僅供教學使用</footer>
<script id="quiz-tpl" type="application/octet-stream">__QUIZB64__</script>
<script id="bank-data" type="application/json">__PAYLOAD__</script>
<script>
const DB = JSON.parse(document.getElementById('bank-data').textContent);
const QS = DB.questions, CURR = DB.curriculum;
const PAGE = 10;
let page = 1, picked = new Set(), openSteps = {};

document.getElementById('totalN').textContent = QS.length;

// ---- 篩選器初始化 ----
const years = [...new Set(QS.map(q=>q.year))].sort();
const fYear=el('fYear'), fBook=el('fBook'), fChap=el('fChap'), fCode=el('fCode'),
      fDiff=el('fDiff'), fType=el('fType'), fKw=el('fKw'), fNum=el('fNum');
const MAXYEAR = Math.max(...years);
years.forEach(y=>fYear.add(new Option(y+'年', y)));
function parseNums(s){
  const set = new Set();
  s.split(/[,，、\s]+/).forEach(part=>{
    if(!part) return;
    const m = part.match(/^(\d+)\s*[-~～–—]\s*(\d+)$/);
    if(m){ for(let i=+m[1]; i<=+m[2]; i++) set.add(i); }
    else if(/^\d+$/.test(part)) set.add(+part);
  });
  return set;
}
Object.keys(CURR['冊別章節']).forEach(b=>fBook.add(new Option(b, b)));
function fillChap(){
  fChap.innerHTML='<option value="">全部</option>';
  const b=fBook.value;
  const chaps = b ? CURR['冊別章節'][b] : [...new Set(QS.map(q=>q.book+'｜'+q.chapter))].sort().map(s=>s.split('｜')[1]);
  (b?chaps:[...new Set(chaps)]).forEach(c=>fChap.add(new Option(c,c)));
}
fillChap();
[...new Set(QS.flatMap(q=>q.codes))].sort().forEach(c=>{
  fCode.add(new Option(c+'　'+(CURR['學習內容'][c]?CURR['學習內容'][c].desc.slice(0,12):''), c));
});
function el(id){return document.getElementById(id);}

function filtered(){
  const y=fYear.value, b=fBook.value, c=fChap.value, code=fCode.value,
        d=fDiff.value, t=fType.value, kw=fKw.value.trim(), nums=fNum.value.trim();
  const numSet = nums ? parseNums(nums) : null;
  return QS.filter(q=>{
    let yearOk = true;
    if(y){
      if(y[0]==='R'){ yearOk = q.year > MAXYEAR - (+y.slice(1)); }
      else yearOk = q.year == y;
    }
    return yearOk && (!b||q.book===b) && (!c||q.chapter===c) &&
    (!code||q.codes.includes(code)) && (!d||q.difficulty===d) && (!t||q.type===t) &&
    (!numSet || numSet.has(q.num)) &&
    (!kw || (q.topic+q.solution+q.codes.join(',')+q.perf.join(',')+q.chapter+(q.trap||'')).includes(kw));
  });
}

function render(){
  const list = filtered();
  el('countLine').textContent = `符合條件：${list.length} 題（選擇 ${list.filter(q=>q.type==='choice').length}、非選 ${list.filter(q=>q.type==='essay').length}）`;
  const pages = Math.max(1, Math.ceil(list.length/PAGE));
  if(page>pages) page=pages;
  const slice = list.slice((page-1)*PAGE, page*PAGE);
  el('qlist').innerHTML = slice.length ? slice.map(card).join('') :
    '<div class="panel" style="text-align:center;color:var(--sub);padding:40px">😅 沒有符合這組條件的題目。<br>請放寬條件（例如清掉「學習內容」或「章節」其中一項），或按「清除條件」重來。</div>';
  // pager
  let pb='', ell=false;
  for(let i=1;i<=pages;i++){
    if(pages>15 && Math.abs(i-page)>3 && i!==1 && i!==pages){
      if(!ell){ pb+='<span style="padding:6px">…</span>'; ell=true; }
      continue;
    }
    ell=false;
    pb+=`<button class="${i===page?'cur':''}" onclick="goPage(${i})">${i}</button>`;
  }
  el('pager').innerHTML=pb;
  el('pickN').textContent = picked.size;
  slice.forEach(q=>{ (openSteps[q.id]||0) && showSteps(q.id, openSteps[q.id]); });
}
function goPage(i){ page=i; render(); window.scrollTo({top:0,behavior:'smooth'}); }

function badge(cls, txt, title){ return `<span class="badge ${cls}" title="${title||''}">${txt}</span>`; }

function card(q){
  const perfT = q.perf.map(p=>`${p} ${CURR['學習表現'][p]||''}`).join('&#10;');
  const codeT = q.codes.map(c=>`${c} ${CURR['學習內容'][c]?CURR['學習內容'][c].desc:''}`).join('&#10;');
  return `<div class="qcard ${picked.has(q.id)?'':'notpicked'}" id="card-${q.id}">
    <div class="qhead">
      ${badge('b-year', q.year+'年 第'+(q.type==='essay'?'非選'+q.id.split('N')[1]:q.num)+'題')}
      ${badge('b-type', q.type==='choice'?'選擇':'非選')}
      ${badge('b-book', q.book)}
      ${badge('b-chap', q.chapter)}
      ${q.codes.map(c=>badge('b-code', c, (CURR['學習內容'][c]||{}).desc)).join('')}
      ${q.perf.map(p=>badge('b-perf', p, CURR['學習表現'][p])).join('')}
      ${badge('b-diff-'+q.difficulty, q.difficulty)}
      <span class="topic">${q.topic}</span>
    </div>
    <img class="qimg" loading="lazy" src="${q.img}" alt="${q.id} 題目" onerror="imgFail(this)">
    <div class="qacts">
      <button class="btn btn-blue" onclick="nextStep('${q.id}', ${q.steps.length})">💡 逐步引導</button>
      <button class="btn btn-ghost" onclick="toggleSol('${q.id}')">📖 完整詳解</button>
      <label class="pickbox"><input type="checkbox" ${picked.has(q.id)?'checked':''} onchange="togglePick('${q.id}',this.checked)">選入試卷</label>
    </div>
    <div class="guide" id="guide-${q.id}">
      <b style="color:var(--blue)">解題引導</b>（每按一次「逐步引導」多顯示一步）
      ${q.steps.map((s,i)=>`<div class="step" id="step-${q.id}-${i}"><span class="sn">步驟 ${i+1}</span>　${s}</div>`).join('')}
    </div>
    <div class="sol" id="sol-${q.id}">
      <div class="ansline">✅ 答案：${q.answer}</div>
      <div>${q.solution}</div>
      ${q.trap?`<div class="trap"><b>⚠ 易錯提醒：</b>${q.trap}</div>`:''}
    </div>
  </div>`;
}

function imgFail(im){
  if(im.dataset.failed) return; im.dataset.failed = 1;
  const d = document.createElement('div');
  d.style.cssText = 'padding:24px;border:2px dashed #dc2626;border-radius:8px;color:#dc2626;background:#fef2f2;font-size:.92rem;line-height:1.8';
  d.innerHTML = '⚠ <b>找不到題目圖片</b>（' + im.getAttribute('src') + '）<br>' +
    '此檔案必須與 <b>01_題目圖片</b> 資料夾放在同一個資料夾（會考題庫/）中開啟。<br>' +
    '若想單獨一個檔案離線使用，請改開 <b>會考題庫單檔版.html</b>（圖片已內嵌，免資料夾）。';
  im.replaceWith(d);
}

function nextStep(id, total){
  const n = Math.min((openSteps[id]||0)+1, total);
  openSteps[id]=n; showSteps(id,n);
}
function showSteps(id,n){
  const g = el('guide-'+id); if(!g) return;
  g.style.display='block';
  for(let i=0;i<n;i++){ const s=el(`step-${id}-${i}`); if(s)s.style.display='block'; }
}
function toggleSol(id){
  const s = el('sol-'+id); s.style.display = s.style.display==='block'?'none':'block';
}
function togglePick(id,on){
  on?picked.add(id):picked.delete(id);
  el('pickN').textContent=picked.size;
  const c=el('card-'+id); if(c) c.classList.toggle('notpicked', !on);
}

// ---- 工具列 ----
el('btnAllGuide').onclick=()=>{ openSteps={}; document.querySelectorAll('.guide,.sol').forEach(x=>x.style.display='none'); document.querySelectorAll('.step').forEach(x=>x.style.display='none'); };
el('btnPickPage').onclick=()=>{ filtered().slice((page-1)*PAGE,page*PAGE).forEach(q=>picked.add(q.id)); render(); };
el('btnClearPick').onclick=()=>{ picked.clear(); render(); };
async function doPrint(withSol){
  if(picked.size===0){ alert('請先勾選題目（每題右下角「選入試卷」）'); return; }
  // 印出所有已勾選（跨頁面）：暫時渲染全部勾選題
  const list = QS.filter(q=>picked.has(q.id));
  el('qlist').innerHTML = list.map(card).join('');
  document.querySelectorAll('#qlist .qcard').forEach(c=>c.classList.remove('notpicked'));
  // 關鍵：列印前強制載入所有題目圖片（否則延遲載入的圖在列印時是空白）
  const imgs = [...document.querySelectorAll('#qlist .qimg')];
  imgs.forEach(im=>{ im.loading='eager'; });
  await Promise.all(imgs.map(im=>im.decode ? im.decode().catch(()=>{}) : Promise.resolve()));
  document.body.classList.toggle('print-with-sol', withSol);
  window.print();
  document.body.classList.remove('print-with-sol');
  render();
}
el('btnPrint').onclick=()=>doPrint(false);
el('btnPrintSol').onclick=()=>doPrint(true);
el('btnQuiz').onclick=()=>exportQuiz();
el('btnReset').onclick=()=>{ fYear.value=fBook.value=fChap.value=fCode.value=fDiff.value=fType.value=''; fKw.value=''; fNum.value=''; fillChap(); page=1; render(); };
[fYear,fBook,fCode,fDiff,fType].forEach(s=>s.onchange=()=>{ if(s===fBook)fillChap(); page=1; render(); });
fChap.onchange=()=>{page=1;render();};
fKw.oninput=()=>{page=1;render();};
fNum.oninput=()=>{page=1;render();};

// ---- 線上試卷匯出 ----
const QUIZ_TPL = decodeURIComponent(escape(atob(document.getElementById('quiz-tpl').textContent.trim())));
async function exportQuiz(){
  if(picked.size===0){ alert('請先勾選題目（每題右下角「選入試卷」）'); return; }
  const title = prompt('試卷名稱（會顯示在學生頁面上方）', '會考數學複習卷');
  if(title===null) return;
  const list = QS.filter(q=>picked.has(q.id));
  const items = [];
  for(const q of list){
    let src = q.img;
    if(!src.startsWith('data:')){
      try{
        const b = await (await fetch(src)).blob();
        src = await new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(b); });
      }catch(e){
        alert('無法內嵌題目圖片（'+q.img+'）。\n請改用「會考題庫單檔版.html」匯出線上試卷，或以本機伺服器開啟本頁。');
        return;
      }
    }
    items.push({id:q.id, year:q.year, num:q.num, type:q.type, img:src,
                k: q.type==='choice' ? btoa(q.answer+'|'+q.id) : ''});
  }
  const safeTitle = title.replace(/[<>&"]/g,'');
  const html = QUIZ_TPL.split('__TITLE__').join(safeTitle)
      .replace('__QUIZDATA__', JSON.stringify(items).replace(/<\//g,'<\\/'));
  const blob = new Blob([html], {type:'text/html;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '線上試卷_'+safeTitle+'.html';
  a.click();
  alert('已下載「線上試卷_'+safeTitle+'.html」。\n\n上架 Netlify：\n1. 把檔案改名為 index.html，放進一個新資料夾\n2. 打開 app.netlify.com/drop\n3. 把整個資料夾拖進去 → 取得網址發給學生');
}

// ---- 統計 ----
function statTable(title, rows, total){
  const max = Math.max(...rows.map(r=>r[1]), 1);
  return `<h3 style="margin-top:0">${title}</h3><table>
    <tr><th style="width:45%">項目</th><th style="width:12%">題數</th><th>分布</th></tr>
    ${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}（${(100*r[1]/total).toFixed(1)}%）</td>
      <td><span class="bar" style="width:${(100*r[1]/max).toFixed(1)}%"></span></td></tr>`).join('')}
  </table>`;
}
function buildStats(){
  const total=QS.length;
  const byBook={}, byChap={}, byCode={};
  QS.forEach(q=>{
    byBook[q.book]=(byBook[q.book]||0)+1;
    const key=q.book+' '+q.chapter;
    byChap[key]=(byChap[key]||0)+1;
    q.codes.slice(0,1).forEach(c=>byCode[c]=(byCode[c]||0)+1);
  });
  el('statBook').innerHTML = statTable('各冊別出題數（103–115 全部試題）',
    Object.entries(byBook).sort(), total);
  el('statChap').innerHTML = statTable('各章節出題數',
    Object.entries(byChap).sort((a,b)=>b[1]-a[1]), total);
  el('statCode').innerHTML = statTable('主要學習內容代碼出題數（每題取第一碼）',
    Object.entries(byCode).sort((a,b)=>b[1]-a[1]), total);
}
buildStats();

// ---- 分頁籤 ----
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  el('bankView').style.display = t.dataset.view==='bank'?'':'none';
  el('statsView').style.display = t.dataset.view==='stats'?'':'none';
  el('aboutView').style.display = t.dataset.view==='about'?'':'none';
});

render();
</script>
</body>
</html>"""

# =====================================================================
# 線上試卷模板（學生作答頁）：iPad 友善、無後端、作答紀錄可複製/分享/下載
# 預留接口：CONFIG.submitUrl 填入網址後會自動 POST 作答紀錄 JSON
# =====================================================================
QUIZ_TEMPLATE = r"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<title>__TITLE__</title>
<style>
:root{--ink:#1f2937;--sub:#6b7280;--line:#e5e7eb;--blue:#2563eb;--green:#059669;--red:#dc2626}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;font-family:"Microsoft JhengHei","PingFang TC",system-ui,sans-serif;color:var(--ink);background:#f5f6f8;line-height:1.6}
header{background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;padding:16px 20px}
header h1{margin:0;font-size:1.15rem}
.wrap{max-width:860px;margin:0 auto;padding:14px}
.panel{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px;margin-bottom:14px}
.idrow{display:flex;gap:10px;flex-wrap:wrap}
.idrow div{flex:1;min-width:110px}
.idrow label{display:block;font-size:.8rem;color:var(--sub);margin-bottom:4px}
.idrow input{width:100%;padding:12px;border:1px solid var(--line);border-radius:10px;font-size:1.05rem}
.qcard{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:14px}
.qtitle{font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:8px}
.qtag{font-size:.72rem;color:var(--sub);font-weight:400}
.qimg{width:100%;border:1px solid var(--line);border-radius:10px;background:#fff}
.opts{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}
.opt{padding:16px 0;font-size:1.25rem;font-weight:700;text-align:center;border:2px solid var(--line);
     border-radius:12px;background:#fff;cursor:pointer;user-select:none}
.opt.sel{background:var(--blue);border-color:var(--blue);color:#fff}
textarea.essay{width:100%;min-height:110px;padding:12px;border:1px solid var(--line);border-radius:10px;font-size:1rem;margin-top:12px}
.donebar{position:sticky;bottom:0;background:rgba(255,255,255,.96);border-top:1px solid var(--line);padding:12px;text-align:center;backdrop-filter:blur(4px)}
.btn{cursor:pointer;border:none;border-radius:12px;padding:14px 26px;font-size:1.05rem;font-weight:700}
.btn-blue{background:var(--blue);color:#fff}
.btn-ghost{background:#fff;border:2px solid var(--blue);color:var(--blue);padding:12px 20px}
.progress{font-size:.9rem;color:var(--sub);margin-bottom:8px}
#result{display:none}
.score{font-size:2rem;font-weight:800;color:var(--green);text-align:center;margin:6px 0}
table.res{border-collapse:collapse;width:100%;font-size:.9rem;margin-top:10px}
table.res th,table.res td{border:1px solid var(--line);padding:6px 8px;text-align:center}
.ok{color:var(--green);font-weight:700}.ng{color:var(--red);font-weight:700}
#recBox{width:100%;min-height:90px;font-size:.75rem;margin-top:8px;word-break:break-all}
.hint{font-size:.82rem;color:var(--sub)}
.locked .opt,.locked textarea{pointer-events:none;opacity:.85}
</style>
</head>
<body>
<header><h1>📝 __TITLE__</h1></header>
<div class="wrap">
  <div class="panel">
    <div class="idrow">
      <div><label>班級</label><input id="stuClass" placeholder="例：309" inputmode="numeric"></div>
      <div><label>座號</label><input id="stuSeat" placeholder="例：12" inputmode="numeric"></div>
      <div><label>姓名</label><input id="stuName" placeholder="姓名"></div>
    </div>
    <p class="hint" style="margin:10px 0 0">共 <b id="totalQ"></b> 題。選擇題點選 A/B/C/D，非選擇題請將計算過程寫在紙上、把答案輸入文字框。作答完按最下方「交卷」。</p>
  </div>
  <div id="qwrap"></div>
  <div class="donebar" id="donebar">
    <div class="progress">已作答 <b id="doneN">0</b> / <span id="doneT"></span></div>
    <button class="btn btn-blue" id="btnSubmit">✅ 交卷</button>
  </div>
  <div class="panel" id="result">
    <h2 style="margin:0 0 4px">作答結果</h2>
    <div class="score" id="scoreLine"></div>
    <div id="resTable"></div>
    <h3 style="margin:14px 0 4px">📋 作答紀錄（請交給老師）</h3>
    <p class="hint">按「複製紀錄」後貼到老師指定的地方（LINE／Classroom），或用「分享」「下載」。</p>
    <textarea id="recBox" readonly></textarea>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
      <button class="btn btn-blue" onclick="copyRec()">📋 複製紀錄</button>
      <button class="btn btn-ghost" onclick="shareRec()">📤 分享</button>
      <button class="btn btn-ghost" onclick="dlRec()">⬇ 下載紀錄檔</button>
    </div>
    <p class="hint" id="postStatus" style="margin-bottom:0"></p>
  </div>
</div>
<script id="qdata" type="application/json">__QUIZDATA__</script>
<script>
// ====== 預留接口：之後有後端時，把 submitUrl 填上（POST JSON），其餘不用改 ======
const CONFIG = { submitUrl: "" };
const ITEMS = JSON.parse(document.getElementById('qdata').textContent);
const ans = {};   // id -> 'A'~'D' 或 文字
let submitted = false;
const tsStart = Date.now();
const LSKEY = 'quiz-__TITLE__';

document.getElementById('totalQ').textContent = ITEMS.length;
document.getElementById('doneT').textContent = ITEMS.length;

document.getElementById('qwrap').innerHTML = ITEMS.map((q,i)=>`
  <div class="qcard" id="q-${q.id}">
    <div class="qtitle">第 ${i+1} 題 <span class="qtag">（${q.year}年會考 ${q.type==='choice'?'第'+q.num+'題':'非選擇題'}）</span></div>
    <img class="qimg" src="${q.img}" alt="第${i+1}題">
    ${q.type==='choice'
      ? `<div class="opts">${['A','B','C','D'].map(o=>`<div class="opt" data-q="${q.id}" data-o="${o}" onclick="pick('${q.id}','${o}',this)">${o}</div>`).join('')}</div>`
      : `<textarea class="essay" placeholder="請輸入你的答案（計算過程寫在紙上）" oninput="essay('${q.id}',this.value)"></textarea>`}
  </div>`).join('');

function pick(id,o,elm){
  if(submitted) return;
  ans[id]=o;
  document.querySelectorAll(`.opt[data-q="${id}"]`).forEach(x=>x.classList.remove('sel'));
  elm.classList.add('sel');
  refresh(); save();
}
function essay(id,v){ if(submitted)return; if(v.trim())ans[id]=v.trim(); else delete ans[id]; refresh(); save(); }
function refresh(){ document.getElementById('doneN').textContent = Object.keys(ans).length; }
function save(){
  try{ localStorage.setItem(LSKEY, JSON.stringify({ans,
    cls:val('stuClass'), seat:val('stuSeat'), name:val('stuName')})); }catch(e){}
}
function val(id){ return document.getElementById(id).value.trim(); }
// 還原草稿
try{
  const d = JSON.parse(localStorage.getItem(LSKEY)||'null');
  if(d){
    Object.assign(ans, d.ans||{});
    ['stuClass','stuSeat','stuName'].forEach((k,i)=>{ document.getElementById(k).value = [d.cls,d.seat,d.name][i]||''; });
    for(const [id,a] of Object.entries(ans)){
      const btn = document.querySelector(`.opt[data-q="${id}"][data-o="${a}"]`);
      if(btn) btn.classList.add('sel');
      else { const ta = document.querySelector(`#q-${CSS.escape(id)} textarea`); if(ta) ta.value = a; }
    }
    refresh();
  }
}catch(e){}
['stuClass','stuSeat','stuName'].forEach(k=>document.getElementById(k).addEventListener('input', save));

function grade(q){
  if(q.type!=='choice') return null;
  try{ return atob(q.k).split('|')[0] === (ans[q.id]||''); }catch(e){ return null; }
}
document.getElementById('btnSubmit').onclick = () => {
  if(submitted) return;
  if(!val('stuClass')||!val('stuSeat')||!val('stuName')){ alert('請先填寫 班級、座號、姓名'); window.scrollTo({top:0,behavior:'smooth'}); return; }
  const blank = ITEMS.filter(q=>!(q.id in ans)).length;
  if(blank>0 && !confirm(`還有 ${blank} 題未作答，確定要交卷嗎？`)) return;
  submitted = true;
  document.body.classList.add('locked');
  const rows = ITEMS.map((q,i)=>{
    const ok = grade(q);
    return {id:q.id, n:i+1, a:ans[q.id]||'', ok};
  });
  const auto = rows.filter(r=>r.ok!==null);
  const score = auto.filter(r=>r.ok).length;
  const rec = {
    v:1, quiz:"__TITLE__", cls:val('stuClass'), seat:val('stuSeat'), name:val('stuName'),
    ts_start:new Date(tsStart).toISOString(), ts_submit:new Date().toISOString(),
    dur_s:Math.round((Date.now()-tsStart)/1000),
    score, total_auto:auto.length,
    answers:rows.map(r=>({id:r.id, a:r.a, ok:r.ok}))
  };
  document.getElementById('scoreLine').textContent = `選擇題 ${score} / ${auto.length}`;
  document.getElementById('resTable').innerHTML = '<table class="res"><tr><th>題</th>'+rows.map(r=>`<th>${r.n}</th>`).join('')+'</tr>'+
    '<tr><td>結果</td>'+rows.map(r=>`<td class="${r.ok===null?'':(r.ok?'ok':'ng')}">${r.ok===null?'—':(r.ok?'○':'✕')}</td>`).join('')+'</tr></table>';
  const json = JSON.stringify(rec);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  window._rec = {json, b64, fname:`作答紀錄_${rec.cls}_${rec.seat}_${rec.name}.json`};
  document.getElementById('recBox').value = b64;
  document.getElementById('result').style.display = 'block';
  document.getElementById('donebar').style.display = 'none';
  document.getElementById('result').scrollIntoView({behavior:'smooth'});
  try{ localStorage.removeItem(LSKEY); }catch(e){}
  if(CONFIG.submitUrl){
    fetch(CONFIG.submitUrl, {method:'POST', headers:{'Content-Type':'application/json'}, body:json})
      .then(r=>{ document.getElementById('postStatus').textContent = r.ok ? '✅ 紀錄已自動上傳' : '⚠ 自動上傳失敗，請改用複製/分享'; })
      .catch(()=>{ document.getElementById('postStatus').textContent = '⚠ 自動上傳失敗，請改用複製/分享'; });
  }
};
function copyRec(){
  const t = document.getElementById('recBox');
  t.select(); t.setSelectionRange(0, 999999);
  (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject())
    .then(()=>alert('已複製！請貼給老師'))
    .catch(()=>{ document.execCommand('copy'); alert('已複製！請貼給老師'); });
}
function shareRec(){
  if(navigator.share){ navigator.share({title:'作答紀錄', text:window._rec.b64}).catch(()=>{}); }
  else alert('此裝置不支援分享，請用「複製紀錄」');
}
function dlRec(){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([window._rec.json], {type:'application/json'}));
  a.download = window._rec.fname; a.click();
}
</script>
</body>
</html>"""

import base64 as _b64
quiz_b64 = _b64.b64encode(QUIZ_TEMPLATE.encode("utf-8")).decode()

html = TEMPLATE.replace("__PAYLOAD__", payload.replace("</", "<\\/")).replace("__QUIZB64__", quiz_b64)
out = BASE / "index.html"
out.write_text(html, encoding="utf-8")
print("written", out, f"{out.stat().st_size/1024:.0f} KB")

# ---- 單檔版：圖片以 base64 內嵌，單一檔案即可離線使用 ----
import base64
q_embed = json.loads(json.dumps(questions, ensure_ascii=False))
for q in q_embed:
    img_path = BASE / q["img"]
    q["img"] = "data:image/png;base64," + base64.b64encode(img_path.read_bytes()).decode()
payload2 = json.dumps({"questions": q_embed, "curriculum": curr}, ensure_ascii=False)
html2 = TEMPLATE.replace("__PAYLOAD__", payload2.replace("</", "<\\/")).replace("__QUIZB64__", quiz_b64)
out2 = BASE / "會考題庫單檔版.html"
out2.write_text(html2, encoding="utf-8")
print("written", out2, f"{out2.stat().st_size/1024/1024:.1f} MB")


def make_quiz(question_ids, title, out_path):
    """由 Python 端直接產生線上試卷（與網頁匯出功能同一模板）"""
    idx = {q["id"]: q for q in questions}
    items = []
    for qid in question_ids:
        q = idx[qid]
        b64 = base64.b64encode((BASE / q["img"]).read_bytes()).decode()
        items.append({
            "id": q["id"], "year": q["year"], "num": q["num"], "type": q["type"],
            "img": "data:image/png;base64," + b64,
            "k": base64.b64encode(f"{q['answer']}|{q['id']}".encode()).decode() if q["type"] == "choice" else "",
        })
    data = json.dumps(items, ensure_ascii=False).replace("</", "<\\/")
    html = QUIZ_TEMPLATE.replace("__TITLE__", title).replace("__QUIZDATA__", data)
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    Path(out_path).write_text(html, encoding="utf-8")
    print("written", out_path, f"{Path(out_path).stat().st_size/1024/1024:.1f} MB")


# ---- 示範卷＋Netlify 部署資料夾：最近5屆（111–115）第1–10題 ----
sample_ids = [q["id"] for q in questions if q["year"] >= 111 and q["type"] == "choice" and q["num"] <= 10]
make_quiz(sample_ids, "會考數學示範卷（最近5屆 第1-10題）", BASE / "netlify_deploy" / "index.html")
