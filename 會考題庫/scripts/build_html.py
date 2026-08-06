# -*- coding: utf-8 -*-
"""將 data/questions_*.json 與課綱資料嵌入 HTML 模板，產生離線可用的 index.html"""
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data"

questions = []
for y in range(103, 116):
    questions += json.loads((DATA / f"questions_{y}.json").read_text(encoding="utf-8"))
# 非歷屆來源：模擬卷（HL*）與自編生成題（G*，gen_essay.py 產出），year 為非數字字串
# 自動掃描 data/questions_*.json，凡檔名不是 103–115 者一律載入（新增來源不必再改這裡）
for _f in sorted(DATA.glob("questions_*.json")):
    _stem = _f.stem.replace("questions_", "")
    if _stem.isdigit() and 103 <= int(_stem) <= 115:
        continue                                    # 歷屆已於上面載入
    questions += json.loads(_f.read_text(encoding="utf-8"))
curr = json.loads((DATA / "curriculum_108.json").read_text(encoding="utf-8"))
# 觀念補強單元（學習表現補強題庫，與歷屆試題分開維護；檔案不存在則為空）
_concepts_file = DATA / "concepts.json"
concepts = json.loads(_concepts_file.read_text(encoding="utf-8")) if _concepts_file.exists() else []
# 非選評分規準（老師覆核時對照官方逐級分指引；檔案不存在則為空）
_rubrics_file = DATA / "essay_rubrics.json"
essay_rubrics = json.loads(_rubrics_file.read_text(encoding="utf-8")) if _rubrics_file.exists() else {}

payload = json.dumps({"questions": questions, "curriculum": curr, "concepts": concepts,
                      "essay_rubrics": essay_rubrics}, ensure_ascii=False)

TEMPLATE = r"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>國中會考數學歷屆試題題庫（103–115）</title>
<style>
:root{
  --ink:#111827; --sub:#6b7280; --bg:#f1f5f9; --card:#ffffff; --line:#e2e8f0;
  --blue:#2563eb; --blue-bg:#eff6ff; --green:#059669; --green-bg:#ecfdf5;
  --amber:#d97706; --amber-bg:#fffbeb; --red:#dc2626; --red-bg:#fef2f2;
  --purple:#7c3aed; --purple-bg:#f5f3ff;
  --r:14px; --r-sm:10px;
  --sh:0 1px 2px rgba(16,24,40,.05),0 1px 3px rgba(16,24,40,.06);
  --sh-md:0 4px 12px rgba(16,24,40,.08);
  --sh-lg:0 12px 32px rgba(16,24,40,.14);
  --tap:44px;   /* iPad/手機最小觸控目標 */
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:"Microsoft JhengHei","PingFang TC",system-ui,-apple-system,sans-serif;color:var(--ink);background:var(--bg);line-height:1.65;
     -webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
header{background:linear-gradient(135deg,#0f2942,#1e40af 55%,#2563eb);color:#fff;padding:18px 24px;box-shadow:var(--sh-md)}
header h1{margin:0;font-size:1.35rem;letter-spacing:.01em}
header p{margin:4px 0 0;font-size:.85rem;opacity:.85}
.wrap{max-width:1180px;margin:0 auto;padding:16px}
.panel{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:16px 18px;margin-bottom:14px;box-shadow:var(--sh)}
.filters{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}
.filters label{display:block;font-size:.75rem;color:var(--sub);margin-bottom:3px}
.filters select,.filters input[type=text]{padding:7px 10px;border:1px solid var(--line);border-radius:8px;font-size:.9rem;background:#fff;min-width:120px}
.filters .grow{flex:1;min-width:180px}
.hintline{font-size:.76rem;color:var(--sub);margin-top:8px}
.mf{position:relative;min-width:130px}
.mfbtn{width:100%;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:#fff;font-size:.9rem;cursor:pointer;text-align:left}
.mfbtn.on{border-color:var(--blue);color:var(--blue);font-weight:700;background:var(--blue-bg)}
.mfmenu{display:none;position:absolute;z-index:99;top:100%;left:0;margin-top:4px;background:#fff;border:1px solid var(--line);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.15);max-height:340px;overflow:auto;min-width:250px;padding:8px}
.mfmenu.open{display:block}
.mfitem{display:block;padding:6px 8px;border-radius:6px;font-size:.87rem;cursor:pointer;white-space:nowrap}
.mfitem:hover{background:#f3f4f6}
.mfitem input{margin-right:6px}
.mfhead{font-size:.74rem;color:var(--sub);font-weight:700;margin:8px 4px 2px;border-top:1px solid var(--line);padding-top:6px}
.mfops{display:flex;gap:6px;margin-bottom:6px}
.mfops button{flex:1;padding:5px;border:1px solid var(--line);background:#f9fafb;border-radius:6px;cursor:pointer;font-size:.8rem}
.mfops button:hover{background:var(--blue-bg);color:var(--blue)}
.btn{cursor:pointer;border:none;border-radius:var(--r-sm);padding:10px 16px;font-size:.9rem;font-weight:700;min-height:40px;
     transition:transform .06s,box-shadow .15s,background .15s;box-shadow:var(--sh)}
.btn:hover{box-shadow:var(--sh-md)}
.btn:active{transform:translateY(1px)}
.btn-blue{background:var(--blue);color:#fff}
.btn-blue:hover{background:#1d4ed8}
.btn-ghost{background:#fff;color:var(--blue);border:1.5px solid #bfdbfe}
.btn-ghost:hover{background:var(--blue-bg);border-color:var(--blue)}
.btn-green{background:var(--green);color:#fff}
.btn-green:hover{background:#047857}
.btn:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
.tabs{display:flex;gap:8px;margin-bottom:14px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch}
.tab{padding:10px 18px;border-radius:999px;border:1px solid var(--line);background:#fff;cursor:pointer;font-size:.92rem;font-weight:700;color:var(--sub);
     white-space:nowrap;min-height:var(--tap);display:flex;align-items:center;transition:all .15s;box-shadow:var(--sh)}
.tab:hover{color:var(--blue);border-color:#bfdbfe}
.tab.active{background:var(--blue);border-color:var(--blue);color:#fff;box-shadow:var(--sh-md)}
.lvbtns{display:inline-flex;gap:8px;vertical-align:middle}
.lvbtn{width:var(--tap);height:var(--tap);border-radius:12px;border:2px solid var(--line);background:#fff;font-weight:800;font-size:1.15rem;cursor:pointer;color:var(--ink);
       transition:all .12s}
.lvbtn:hover{border-color:var(--green);color:var(--green);background:var(--green-bg)}
.lvbtn:active{transform:scale(.94)}
.lvbtn.on{background:var(--green);border-color:var(--green);color:#fff;box-shadow:0 0 0 3px rgba(5,150,105,.18)}
/* 覆核頁：進度列與鍵盤提示 */
.rvbar{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.97);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);
       padding:10px 14px;margin:-16px -18px 12px;border-radius:var(--r) var(--r) 0 0;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.rvprog{flex:1;min-width:120px;height:8px;border-radius:99px;background:#e2e8f0;overflow:hidden}
.rvprog i{display:block;height:100%;background:linear-gradient(90deg,#059669,#10b981);transition:width .3s}
.kbd{display:inline-block;padding:1px 7px;border:1px solid var(--line);border-bottom-width:2px;border-radius:6px;background:#f8fafc;
     font-size:.78rem;font-weight:700;color:var(--sub);font-family:ui-monospace,monospace}
.rvcard.done{opacity:.55}
.rvcard.cur{box-shadow:0 0 0 3px rgba(37,99,235,.35),var(--sh-md)}
@media(max-width:640px){.rvgrid{grid-template-columns:1fr !important}}
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
.b-done{background:#fde68a;color:#92400e}
.b-out{background:#e0e7ff;color:#3730a3}
.copt{display:block;width:100%;text-align:left;padding:10px 12px;margin:6px 0;border:1.5px solid var(--line);border-radius:10px;background:#fff;cursor:pointer;font-size:.95rem;font-family:inherit}
.copt:hover:not(:disabled){border-color:var(--blue)}
.copt.c-right{border-color:var(--green);background:var(--green-bg);font-weight:700}
.copt.c-wrong{border-color:var(--red);background:var(--red-bg)}
.copt:disabled{cursor:default}
.cfeedback{margin:8px 0 2px;font-weight:700}
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
  header,.toolbar,.panel,.tabs,.count,.qacts,.guide,.pagebtns,footer,#statsView,#conceptView,#reviewView,#anaView{display:none !important}
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
    <div class="tab" data-view="ana">錯題分析</div>
    <div class="tab" data-view="review">✍ 非選覆核</div>
    <div class="tab" data-view="concept">觀念補強</div>
    <div class="tab" data-view="stats">命題分析統計</div>
    <div class="tab" data-view="about">使用說明</div>
  </div>

  <div id="bankView">
    <div class="panel">
      <div class="filters">
        <div class="mf" id="mfYear"></div>
        <div class="mf" id="mfBook"></div>
        <div class="mf" id="mfChap"></div>
        <div class="mf" id="mfCode"></div>
        <div class="mf" id="mfPerf"></div>
        <div class="mf" id="mfDiff"></div>
        <div class="mf" id="mfType"></div>
        <div><label>題號範圍（如 1-10 或 3,5,7-9）</label><input type="text" id="fNum" placeholder="全部" style="min-width:150px"></div>
        <div class="grow"><label>關鍵字（主題／代碼／文字）</label><input type="text" id="fKw" placeholder="例如：畢氏定理、相似、S-9-2"></div>
        <div><label>&nbsp;</label><label style="display:flex;align-items:center;gap:5px;font-size:.85rem;color:var(--sub);padding:7px 0"><input type="checkbox" id="fExclDone">排除已出過/已做過</label></div>
        <button class="btn btn-ghost" id="btnReset">清除條件</button>
      </div>
      <div class="hintline">各選單皆可<b>複選</b>（打勾多個即取聯集）；不勾＝該項不限。</div>
    </div>
    <div class="toolbar">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center" class="wrap-inner">
        <button class="btn btn-blue" id="btnAllGuide">全部收合</button>
        <button class="btn btn-green" id="btnPrint">🖨 列印勾選題目（題目卷）</button>
        <button class="btn btn-ghost" id="btnPrintSol">🖨 列印勾選（含詳解）</button>
        <button class="btn btn-blue" id="btnQuiz">🌐 匯出線上試卷</button>
        <button class="btn btn-ghost" id="btnPickAll">☑ 全選符合條件的題目</button>
        <button class="btn btn-ghost" id="btnPickPage">勾選本頁全部</button>
        <button class="btn btn-ghost" id="btnClearPick">清除勾選</button>
        <span style="display:inline-flex;align-items:center;gap:6px;border-left:1px solid var(--line);padding-left:10px;margin-left:2px">
          抽 <input type="number" id="drawN" min="1" placeholder="20" style="width:62px;padding:6px;border:1px solid var(--line);border-radius:8px">
          題 <button class="btn btn-green" id="btnDraw">🎲 依範圍隨機抽題</button>
        </span>
        <span class="count" style="margin:0">已勾選 <b id="pickN">0</b> 題</span>
      </div>
    </div>
    <div class="count" id="countLine"></div>
    <div id="qlist"></div>
    <div class="pagebtns" id="pager"></div>
  </div>

  <div id="anaView" style="display:none">
    <div class="panel">
      <h3 style="margin-top:0">☁ 試算表收卷設定</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input type="text" id="cfgUrl" placeholder="貼上 Apps Script 收卷網址（含 ?token=…），設定一次即可" style="flex:1;min-width:280px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;font-size:.85rem">
        <button class="btn btn-ghost" id="btnSaveUrl">儲存</button>
        <input type="text" id="cfgQuiz" placeholder="試卷名稱篩選（留白＝全部）" style="min-width:190px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;font-size:.85rem">
        <input type="text" id="cfgCls" placeholder="班級（留白＝全部）" style="width:140px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;font-size:.85rem">
        <input type="text" id="cfgSeat" placeholder="座號（留白＝全部）" style="width:140px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;font-size:.85rem">
        <button class="btn btn-blue" id="btnLoadRecs">☁ 從試算表載入紀錄</button>
        <span class="hint" id="assignedInfo" style="white-space:nowrap"></span>
        <button class="btn btn-ghost" id="btnClearAssign">🧹 清除本機出題紀錄</button>
      </div>
      <p class="hint" style="margin:8px 0 0">設定後：匯出線上試卷會<b>自動內嵌收卷網址</b>（學生交卷自動上傳）；載入紀錄後題庫每題會標「⚑ 已考過」，並可在篩選列勾「排除已出過/已做過」。首次設定方式見「使用說明」或 apps_script/試算表串接說明.md。</p>
      <p class="hint" style="margin:6px 0 0">🖊 <b>出題紀錄</b>：匯出線上試卷或列印題目卷時，題目自動記為「已出過」（存本機＋試算表「出題紀錄」表，開頁自動同步），出新卷勾「排除已出過/已做過」就不會重複。要取消個別題目，請到試算表「出題紀錄」工作表刪除該列，再按「清除本機出題紀錄」重新同步。</p>
    </div>
    <div class="panel">
      <h3 style="margin-top:0">📥 貼上作答紀錄</h3>
      <p class="hint" style="margin:4px 0 8px">支援學生交回的 <b>base64 字串</b>（每行一筆，可多位學生）或下載的 <b>JSON 檔內容</b>。貼好按「分析錯題」。</p>
      <textarea id="recInput" style="width:100%;min-height:120px;font-size:.78rem;border:1px solid var(--line);border-radius:8px;padding:10px" placeholder="每行貼一筆作答紀錄…"></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center">
        <button class="btn btn-blue" id="btnAnalyze">🔍 分析錯題</button>
        <button class="btn btn-green" id="btnQuizFromAna">🌐 匯出補強卷（用已勾選的題目）</button>
        <button class="btn btn-ghost" id="btnPrintFromAna">🖨 列印補強卷</button>
        <span class="count" style="margin:0">已勾選 <b id="pickN2">0</b> 題</span>
      </div>
    </div>
    <div id="anaOut"></div>
  </div>

  <div id="reviewView" style="display:none">
    <div class="panel">
      <h3 style="margin-top:0">✍ 非選覆核（AI 初評 → 你一鍵確認／改分）</h3>
      <p class="hint" style="margin:0 0 8px">先到「錯題分析」頁設定並儲存收卷網址。輸入卷名（留白＝全部）載入學生手寫作答與 AI 初評，逐份確認或改分。<b>學生查成績只會看到你覆核過的級分</b>（沒覆核的顯示「批改中」）。批改前先在本機跑 <code>python scripts/grade_essays.py --quiz "卷名"</code> 產生 AI 初評。</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input type="text" id="rvQuiz" placeholder="卷名（留白＝全部）" style="min-width:220px;padding:10px;border:1px solid var(--line);border-radius:10px;font-size:.92rem">
        <input type="text" id="rvCls" placeholder="班級（留白＝全部）" style="width:130px;padding:10px;border:1px solid var(--line);border-radius:10px;font-size:.92rem">
        <button class="btn btn-blue" id="btnLoadReview">☁ 載入待覆核</button>
        <button class="btn btn-green" id="btnApplyAllAI">⚡ 一鍵套用全部 AI 級分</button>
        <label style="font-size:.88rem;color:var(--sub);display:flex;align-items:center;gap:5px;cursor:pointer"><input type="checkbox" id="rvOnlyTodo" checked style="width:18px;height:18px">只看未覆核</label>
      </div>
      <div class="rvbar" style="margin:12px -18px -16px;border-radius:0 0 var(--r) var(--r);border-bottom:none;border-top:1px solid var(--line);position:static">
        <span class="count" id="rvCount" style="margin:0;font-weight:700"></span>
        <div class="rvprog"><i id="rvProgBar" style="width:0%"></i></div>
        <span class="hint" style="margin:0">快捷鍵：<span class="kbd">0</span><span class="kbd">1</span><span class="kbd">2</span><span class="kbd">3</span> 給分並存　<span class="kbd">A</span> 套用AI　<span class="kbd">J</span>/<span class="kbd">K</span> 下/上一份</span>
      </div>
    </div>
    <div id="reviewOut"></div>
  </div>

  <div id="conceptView" style="display:none">
    <div class="panel">
      <h3 style="margin-top:0">📘 觀念補強（依學習表現，給需要打底的學生）</h3>
      <p class="hint" style="margin:0">每個單元＝一個觀念：先看白話說明，再做幾題簡單的單選題<b>立即對答案</b>。從錯題分析的「📘 觀念補強」按鈕也會跳到對應單元。</p>
    </div>
    <div id="conceptList"></div>
    <div id="conceptDetail"></div>
  </div>

  <div id="statsView" style="display:none">
    <div class="panel stats" id="statBook"></div>
    <div class="panel stats" id="statChap"></div>
    <div class="panel stats" id="statCode"></div>
    <div class="panel stats" id="statPerf"></div>
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
        <li>🖊 <b>出題紀錄（防重複出題）</b>：匯出線上試卷、列印題目卷時，題目自動標「已出過」並寫入試算表「出題紀錄」表（含詳解版列印視為老師自用、不記錄）。出新卷時勾「排除已出過/已做過」即可避開。紀錄跨裝置同步（開頁自動從試算表載回）。</li>
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
// 收卷網址：預設值內建（換網域／換電腦都免再設定）；老師若在設定頁另存，以其為準
const DEFAULT_SUBMIT_URL = "https://script.google.com/macros/s/AKfycbw-ePEfCoTB3SpwOh4g0IcfwsQWanQm8bvXgOGDdIECkK2845qIoKhH9xtRNuxu29wN/exec?token=math809";
function submitUrl(){ return ((localStorage.getItem('submitUrl')||'').trim()) || DEFAULT_SUBMIT_URL; }
const CONCEPTS = DB.concepts || [];                    // 觀念補強單元
const CONCEPT_PERF = {};                               // 學習表現代碼 -> 單元索引
CONCEPTS.forEach((c,i)=>(c.perf||[]).forEach(p=>{ if(!(p in CONCEPT_PERF)) CONCEPT_PERF[p]=i; }));
// 錯題卡若掛有已建置觀念單元的學習表現 → 顯示「觀念補強」按鈕
function conceptBtn(q){
  const p = (q.perf||[]).find(x=>x in CONCEPT_PERF);
  return p ? `<button class="btn btn-ghost" onclick="gotoConceptByPerf('${p}')">📘 觀念補強</button>` : '';
}
const PAGE = 10;
let page = 1, picked = new Set(), openSteps = {};

document.getElementById('totalN').textContent = QS.length;

// ---- 篩選器（全面複選）----
function el(id){return document.getElementById(id);}
const years = [...new Set(QS.map(q=>q.year))].sort();
const MAXYEAR = Math.max(...years.map(Number).filter(y=>!isNaN(y)));
const fKw=el('fKw'), fNum=el('fNum');
// F：各條件的已選集合；空集合＝該項不限
const F = { year:new Set(), book:new Set(), chap:new Set(), code:new Set(), perf:new Set(), diff:new Set(), type:new Set() };
const MF = {};

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

function chapOptions(){
  const books = F.book.size ? Object.keys(CURR['冊別章節']).filter(b=>F.book.has(b)) : Object.keys(CURR['冊別章節']);
  const opts = [];
  books.forEach(b=>{
    CURR['冊別章節'][b].forEach((c,i)=>opts.push({v:c, t:c, header: i===0 ? b : null}));
  });
  return opts;
}
function registerMF(key, mountId, label, getOptions, presets){
  MF[key] = {mount:el(mountId), label, getOptions, presets};
  drawMF(key);
}
function drawMF(key, keepOpen){
  const {mount, label, getOptions, presets} = MF[key];
  const sel = F[key];
  const opts = getOptions();
  const valid = new Set(opts.map(o=>String(o.v)));
  [...sel].forEach(v=>{ if(!valid.has(String(v))) sel.delete(v); });
  const wasOpen = keepOpen && mount.querySelector('.mfmenu.open');
  mount.innerHTML = `<label>${label}</label>
    <button class="mfbtn ${sel.size?'on':''}" onclick="toggleMenu('${key}',event)">${sel.size?('已選 '+sel.size+' 項'):'全部'} ▾</button>
    <div class="mfmenu" id="menu-${key}" onclick="event.stopPropagation()">
      <div class="mfops">
        ${(presets||[]).map(p=>`<button onclick="mfPreset('${key}','${p.v}')">${p.t}</button>`).join('')}
        <button onclick="mfSetAll('${key}',true)">全選</button>
        <button onclick="mfSetAll('${key}',false)">清除</button>
      </div>
      ${opts.map(o=>`${o.header?`<div class="mfhead">${o.header}</div>`:''}
        <label class="mfitem"><input type="checkbox" ${sel.has(o.v)?'checked':''}
          onchange="mfToggle('${key}', this.dataset.v, this.checked)" data-v="${String(o.v).replace(/"/g,'&quot;')}"> ${o.t}</label>`).join('')}
    </div>`;
  if(wasOpen) mount.querySelector('.mfmenu').classList.add('open');
}
function toggleMenu(key, ev){
  ev.stopPropagation();
  const menu = el('menu-'+key);
  const isOpen = menu.classList.contains('open');
  document.querySelectorAll('.mfmenu').forEach(m=>m.classList.remove('open'));
  if(!isOpen) menu.classList.add('open');
}
document.addEventListener('click', ()=>document.querySelectorAll('.mfmenu').forEach(m=>m.classList.remove('open')));
function mfToggle(key, v, on){
  // 歷屆年度在資料中是數字，需轉型才比對得到；模擬卷（HL1/HL2…）是字串，轉了會變 NaN 而篩不到
  if(key==='year' && /^\d+$/.test(v)) v = +v;
  on ? F[key].add(v) : F[key].delete(v);
  drawMF(key, true);
  if(key==='book') drawMF('chap');   // 冊別變動 → 章節清單連動
  page=1; render();
}
function mfSetAll(key, on){
  F[key].clear();
  if(on) MF[key].getOptions().forEach(o=>F[key].add(o.v));
  drawMF(key, true);
  if(key==='book') drawMF('chap');
  page=1; render();
}
function mfPreset(key, v){   // 年度快選：最近N屆
  const n = +v.slice(1);
  F.year = new Set(years.filter(y=>y > MAXYEAR-n));
  drawMF('year', true);
  page=1; render();
}
// 非歷屆來源（模擬卷）的 year 不是年份數字，選單顯示可讀名稱
const YRLBL = {HL1:'翰林模擬 110', HL2:'翰林模擬 111'};
registerMF('year','mfYear','年度／屆數（可複選）',
  ()=>years.map(y=>({v:y, t:YRLBL[y]||(y+'年')})),
  [{v:'R3',t:'最近3屆'},{v:'R5',t:'最近5屆'},{v:'R10',t:'最近10屆'}]);
registerMF('book','mfBook','冊別（可複選）',
  ()=>Object.keys(CURR['冊別章節']).map(b=>({v:b, t:b})));
registerMF('chap','mfChap','章節（可複選）', chapOptions);
registerMF('code','mfCode','學習內容（可複選）',
  ()=>[...new Set(QS.flatMap(q=>q.codes))].sort().map(c=>({v:c, t:c+'　'+(CURR['學習內容'][c]?CURR['學習內容'][c].desc.slice(0,12):'')})));
registerMF('perf','mfPerf','學習表現（可複選）',
  ()=>[...new Set(QS.flatMap(q=>q.perf))].sort().map(p=>({v:p, t:p+'　'+(CURR['學習表現'][p]||'').slice(0,14)})));
registerMF('diff','mfDiff','難度（可複選）',
  ()=>['易','中','難'].map(d=>({v:d, t:d})));
registerMF('type','mfType','題型',
  ()=>[{v:'choice',t:'選擇題'},{v:'essay',t:'非選擇題'}]);

function filtered(){
  const kw=fKw.value.trim(), nums=fNum.value.trim();
  const numSet = nums ? parseNums(nums) : null;
  return QS.filter(q=>
    (!F.year.size || F.year.has(q.year)) &&
    (!F.book.size || F.book.has(q.book)) &&
    (!F.chap.size || F.chap.has(q.chapter)) &&
    (!F.code.size || q.codes.some(c=>F.code.has(c))) &&
    (!F.perf.size || q.perf.some(p=>F.perf.has(p))) &&
    (!F.diff.size || F.diff.has(q.difficulty)) &&
    (!F.type.size || F.type.has(q.type)) &&
    (!numSet || numSet.has(q.num)) &&
    (!el('fExclDone').checked || (!doneIds.has(q.id) && !assignedIds.has(q.id))) &&
    (!kw || (q.topic+q.solution+q.codes.join(',')+q.perf.join(',')+q.chapter+(q.trap||'')).includes(kw))
  );
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
  updPickN();
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
      ${doneIds.has(q.id)?badge('b-done','⚑ 已考過','此題出現在已載入的作答紀錄中'):''}
      ${assignedIds.has(q.id)?badge('b-out','🖊 已出過','曾出在：'+(assignedIds.get(q.id).length?assignedIds.get(q.id).join('、'):'（未命名卷）')):''}
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
function updPickN(){
  el('pickN').textContent = picked.size;
  const p2 = el('pickN2'); if(p2) p2.textContent = picked.size;
}
function togglePick(id,on){
  on?picked.add(id):picked.delete(id);
  updPickN();
  const c=el('card-'+id); if(c) c.classList.toggle('notpicked', !on);
}

// ---- 錯題分析 ----
let uidc = 0;
const DR = {'易':0,'中':1,'難':2};
const QIDX = {}; QS.forEach(q=>QIDX[q.id]=q);
const doneIds = new Set();   // 載入紀錄後：學生曾做過的題目 id

// ---- 出題紀錄（出卷當下即記錄，防重複出題）----
const assignedIds = new Map();   // 題目id -> [卷名,…]（本機 localStorage ＋ 試算表聯集）
function mergeAssigned(id, quizzes){
  if(!QIDX[id]) return;
  const a = assignedIds.get(id) || [];
  (quizzes||[]).forEach(q=>{ if(q && !a.includes(q)) a.push(q); });
  assignedIds.set(id, a);
}
function loadAssignedLocal(){
  try{
    const m = JSON.parse(localStorage.getItem('assignedLog')||'{}');
    Object.entries(m).forEach(([id,qs])=>mergeAssigned(id, qs));
  }catch(e){}
}
function saveAssignedLocal(){
  const m = {}; assignedIds.forEach((qs,id)=>m[id]=qs);
  try{ localStorage.setItem('assignedLog', JSON.stringify(m)); }catch(e){}
}
function updAssignedInfo(){
  const n = el('assignedInfo'); if(n) n.textContent = assignedIds.size ? ('🖊 已出過 '+assignedIds.size+' 題') : '';
}
// 出卷（匯出線上試卷／列印題目卷）時呼叫：記本機＋回報試算表
function logAssign(quiz, mode, ids){
  ids.forEach(id=>mergeAssigned(id, [quiz]));
  saveAssignedLocal();
  const su = submitUrl();
  if(su){
    fetch(su, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({kind:'assign', quiz:quiz, mode:mode, ids:ids})}).catch(()=>{});
  }
  updAssignedInfo(); render();
}
// 開頁時從試算表把出題紀錄同步回來（換裝置／換瀏覽器也不漏）
function syncAssigned(){
  const su = submitUrl();
  if(!su) return;
  fetch(su + (su.includes('?')?'&':'?') + 'assigned=1')
    .then(r=>r.json())
    .then(m=>{
      if(!m || typeof m!=='object' || Array.isArray(m)) return;
      Object.keys(m).forEach(id=>{
        if(!QIDX[id]) return;
        if(!assignedIds.has(id)) assignedIds.set(id, []);
        mergeAssigned(id, m[id]);
      });
      saveAssignedLocal(); updAssignedInfo(); render();
    }).catch(()=>{});
}

function parseRecords(text){
  const recs = [];
  let whole = null;
  try{ whole = JSON.parse(text); }catch(e){}
  if(whole){
    (Array.isArray(whole)?whole:[whole]).forEach(o=>{ if(o && o.answers) recs.push(o); });
    return {recs, bad:0};
  }
  let bad = 0;
  text.split(/\n+/).map(s=>s.trim()).filter(Boolean).forEach(line=>{
    let obj = null;
    try{ obj = JSON.parse(line); }catch(e){
      try{ obj = JSON.parse(decodeURIComponent(escape(atob(line)))); }catch(e2){}
    }
    if(obj && obj.answers) recs.push(obj); else bad++;
  });
  return {recs, bad};
}

function cardMini(q){
  const uid = 'u' + (uidc++);
  return `<div class="qcard" style="margin:8px 0 12px">
    <div class="qhead">
      ${badge('b-year', q.year+'年 第'+(q.type==='essay'?'非選'+q.id.split('N')[1]:q.num)+'題')}
      ${badge('b-book', q.book)}${badge('b-chap', q.chapter)}
      ${q.codes.map(c=>badge('b-code', c, (CURR['學習內容'][c]||{}).desc)).join('')}
      ${q.perf.map(p=>badge('b-perf', p, CURR['學習表現'][p])).join('')}
      ${badge('b-diff-'+q.difficulty, q.difficulty)}
      <span class="topic">${q.topic}</span>
    </div>
    <img class="qimg" loading="lazy" src="${q.img}" alt="${q.id}" onerror="imgFail(this)">
    <div class="qacts">
      <button class="btn btn-ghost" onclick="miniSol('${uid}')">📖 詳解</button>
      <label class="pickbox"><input type="checkbox" ${picked.has(q.id)?'checked':''} onchange="togglePick('${q.id}',this.checked)">選入補強卷</label>
    </div>
    <div class="sol" id="msol-${uid}">
      <div class="ansline">✅ 答案：${q.answer}</div><div>${q.solution}</div>
      ${q.trap?`<div class="trap"><b>⚠ 易錯提醒：</b>${q.trap}</div>`:''}
    </div>
  </div>`;
}
function miniSol(uid){ const s=el('msol-'+uid); s.style.display = s.style.display==='block'?'none':'block'; }

function masteryHTML(q){
  const used = new Set([q.id]);
  let html = '';
  q.perf.forEach(p=>{
    const pool = QS.filter(o=>!used.has(o.id) && o.perf.includes(p))
      .sort((a,b)=> DR[a.difficulty]-DR[b.difficulty] || ((Number(b.year)||0)-(Number(a.year)||0)))
      .slice(0,4);
    pool.forEach(o=>used.add(o.id));
    html += `<div class="mfhead" style="font-size:.86rem;margin-top:10px">🎯 ${p}｜${CURR['學習表現'][p]||''}<span style="font-weight:400">（由易到難 ${pool.length} 題）</span></div>`
          + (pool.length ? pool.map(cardMini).join('') : '<p class="hint">題庫無其他同表現題目</p>');
  });
  return html;
}
function similarHTML(q){
  const pool = QS.filter(o=>o.id!==q.id).map(o=>{
    let s = 0;
    s += o.codes.filter(c=>q.codes.includes(c)).length * 10;
    if(o.chapter===q.chapter) s += 4;
    if(o.book===q.book) s += 1;
    s += o.perf.filter(p=>q.perf.includes(p)).length * 2;
    if(o.topic===q.topic) s += 6;
    return {o, s};
  }).filter(x=>x.s>=10).sort((a,b)=>b.s-a.s).slice(0,6);
  return pool.length ? pool.map(x=>cardMini(x.o)).join('') : '<p class="hint">題庫中找不到足夠相似的類題</p>';
}
function showRec(qid, kind, prefix){
  const target = el((prefix||'rec')+'-'+kind+'-'+qid);
  if(!target) return;
  if(target.dataset.done){ target.style.display = target.style.display==='none'?'block':'none'; return; }
  const q = QIDX[qid];
  target.innerHTML = (kind==='m'
    ? '<b style="color:var(--blue)">🎯 學習表現精熟練習</b>（涵蓋此題全部學習表現，含複合）' + masteryHTML(q)
    : '<b style="color:var(--green)">🔁 類題練習</b>（同學習內容／章節，相似度排序）' + similarHTML(q));
  target.dataset.done = 1;
  target.style.display = 'block';
}

// ---- 個人作答分析（點「學生摘要」任一列展開）----
let STU = {};   // 'cls|seat' -> {cls, seat, names:[], recs:[]}
function stuSol(qid){ const s=el('ssol-'+qid); if(s) s.style.display = s.style.display==='block'?'none':'block'; }
function stuCard(q){
  return `<div class="qcard">
    <div class="qhead">
      ${badge('b-year', q.year+'年 第'+(q.type==='essay'?'非選'+q.id.split('N')[1]:q.num)+'題')}
      ${badge('b-book', q.book)}${badge('b-chap', q.chapter)}
      ${q.codes.map(c=>badge('b-code', c, (CURR['學習內容'][c]||{}).desc)).join('')}
      ${q.perf.map(p=>badge('b-perf', p, CURR['學習表現'][p])).join('')}
      ${badge('b-diff-'+q.difficulty, q.difficulty)}
      <span class="topic">${q.topic}</span>
    </div>
    <img class="qimg" loading="lazy" src="${q.img}" onerror="imgFail(this)">
    <div class="qacts">
      <button class="btn btn-blue" onclick="showRec('${q.id}','m','srec')">🎯 (a) 學習表現精熟練習</button>
      <button class="btn btn-blue" onclick="showRec('${q.id}','s','srec')">🔁 (b) 類題練習</button>
      ${conceptBtn(q)}
      <button class="btn btn-ghost" onclick="stuSol('${q.id}')">📖 本題詳解</button>
      <label class="pickbox"><input type="checkbox" ${picked.has(q.id)?'checked':''} onchange="togglePick('${q.id}',this.checked)">選入補強卷</label>
    </div>
    <div class="sol" id="ssol-${q.id}">
      <div class="ansline">✅ 答案：${q.answer}</div><div>${q.solution}</div>
      ${q.trap?`<div class="trap"><b>⚠ 易錯提醒：</b>${q.trap}</div>`:''}
    </div>
    <div id="srec-m-${q.id}" style="display:none;background:var(--blue-bg);border-radius:10px;padding:8px 12px;margin-top:8px"></div>
    <div id="srec-s-${q.id}" style="display:none;background:var(--green-bg);border-radius:10px;padding:8px 12px;margin-top:8px"></div>
  </div>`;
}
function showStudent(key){
  const s = STU[key]; const box = el('stuDetail');
  if(!s || !box) return;
  let tot=0, okN=0; const wrongIds=[], essaySet=new Set(), seen=new Set();
  s.recs.forEach(r=>(r.answers||[]).forEach(a=>{
    if(a.ok===true){ tot++; okN++; }
    else if(a.ok===false){ tot++; if(QIDX[a.id] && !seen.has(a.id)){ seen.add(a.id); wrongIds.push(a.id); } }
    else { essaySet.add(a.id); }
  }));
  const rate = tot ? Math.round(100*okN/tot) : 0;
  let html = `<div style="background:var(--blue-bg);border-radius:10px;padding:12px 14px;margin-top:10px">
    <h3 style="margin:0 0 6px">📋 ${s.cls} 班 ${s.seat} 號 ${s.names.join('/')||''} 的個人分析</h3>
    <p class="hint" style="margin:0 0 8px">做題履歷（就目前載入的紀錄）：作答 <b>${s.recs.length}</b> 卷、選擇題 <b>${tot}</b> 題、答對率 <b>${rate}%</b>${essaySet.size?`、非選 ${essaySet.size} 題（需人工批閱）`:''}</p>
    <div class="stats"><table><tr><th>試卷</th><th>得分</th><th>交卷時間</th></tr>`
    + s.recs.map(r=>`<tr><td>${r.quiz||'（未命名卷）'}</td><td>${r.score}/${r.total_auto}</td><td>${r.ts_submit||''}</td></tr>`).join('')
    + '</table></div>';
  if(!wrongIds.length){
    html += '<p style="margin:10px 0 0">🎉 載入的紀錄中，這位學生選擇題全對！</p>';
  } else {
    html += `<p style="margin:10px 0 6px"><b>❌ 錯題 ${wrongIds.length} 題</b>（勾「選入補強卷」後，用上方「匯出補強卷／列印補強卷」出個人卷）</p>`
      + wrongIds.map(id=>stuCard(QIDX[id])).join('');
  }
  html += '</div>';
  box.innerHTML = html;
  box.scrollIntoView({behavior:'smooth'});
  updPickN();
}

function analyze(){
  const {recs, bad} = parseRecords(el('recInput').value);
  const out = el('anaOut');
  if(!recs.length){
    out.innerHTML = '<div class="panel" style="color:var(--red)">讀不到任何作答紀錄——請確認貼的是學生交回的 base64 字串（每行一筆）或 JSON 檔內容。</div>';
    return;
  }
  // 更新「曾做過的題目」集合（供 ⚑已考過 標記與「排除已做過」篩選）
  doneIds.clear();
  recs.forEach(r=>r.answers.forEach(a=>{ if(QIDX[a.id]) doneIds.add(a.id); }));
  let html = '';
  if(bad) html += `<div class="panel" style="color:var(--amber)">⚠ 有 ${bad} 行無法解析，已略過。</div>`;
  html += `<div class="panel">📌 已記錄 <b>${doneIds.size}</b> 題為「曾做過」：題庫瀏覽中會標 <span class="badge b-done">⚑ 已考過</span>，篩選列可勾「排除已出過/已做過」出新卷不重複。</div>`;
  // 學生摘要（點列展開個人分析）
  STU = {};
  recs.forEach(r=>{
    const key = (String(r.cls||'')+'|'+String(r.seat||'')).replace(/['"<>]/g,'');
    if(!STU[key]) STU[key] = {cls:String(r.cls||''), seat:String(r.seat||''), names:[], recs:[]};
    if(r.name && !STU[key].names.includes(r.name)) STU[key].names.push(r.name);
    STU[key].recs.push(r);
  });
  html += `<div class="panel"><h3 style="margin-top:0">👥 學生摘要（${recs.length} 筆）</h3>
    <p class="hint" style="margin:4px 0 8px">👆 點任一列 → 展開該學生的<b>個人作答分析</b>（做題履歷、錯題清單、精熟練習／類題推薦、個人補強卷）。</p>
    <div class="stats"><table><tr><th>班級</th><th>座號</th><th>姓名</th><th>選擇題得分</th><th>錯題數</th><th>作答時間</th></tr>`
    + recs.map(r=>{
        const wrong = r.answers.filter(a=>a.ok===false).length;
        const key = (String(r.cls||'')+'|'+String(r.seat||'')).replace(/['"<>]/g,'');
        return `<tr style="cursor:pointer" title="點我展開個人分析" onclick="showStudent('${key}')"><td>${r.cls||''}</td><td>${r.seat||''}</td><td>${r.name||''}</td>
          <td>${r.score}/${r.total_auto}</td><td>${wrong}</td><td>${Math.round((r.dur_s||0)/60)} 分</td></tr>`;
      }).join('') + '</table></div><div id="stuDetail"></div></div>';
  // 錯題聚合
  const wrongMap = {};
  const essayIds = new Set();
  recs.forEach(r=>{
    r.answers.forEach(a=>{
      if(!QIDX[a.id]) return;
      if(a.ok===false){
        (wrongMap[a.id] = wrongMap[a.id] || []).push(`${r.cls||''}-${r.seat||''} ${r.name||''}（答 ${a.a||'未答'}）`);
      } else if(a.ok===null){ essayIds.add(a.id); }
    });
  });
  const wrongs = Object.entries(wrongMap).sort((a,b)=>b[1].length-a[1].length);
  if(!wrongs.length){
    html += '<div class="panel">🎉 這些紀錄中的選擇題全對，沒有錯題！</div>';
  } else {
    html += `<div class="panel"><h3 style="margin-top:0">❌ 錯題分析（共 ${wrongs.length} 題，依錯誤人數排序）</h3>
      <p class="hint">每題可展開「(a) 學習表現精熟練習」（含複合表現，逐一由易到難）與「(b) 類題練習」（同學習內容/章節）。勾選推薦題後，用上方「匯出補強卷／列印補強卷」。</p></div>`;
    wrongs.forEach(([qid, students])=>{
      const q = QIDX[qid];
      html += `<div class="qcard">
        <div class="qhead">
          <span class="badge" style="background:var(--red);color:#fff">✕ ${students.length}/${recs.length} 人錯</span>
          ${badge('b-year', q.year+'年 第'+(q.type==='essay'?'非選'+q.id.split('N')[1]:q.num)+'題')}
          ${badge('b-book', q.book)}${badge('b-chap', q.chapter)}
          ${q.codes.map(c=>badge('b-code', c, (CURR['學習內容'][c]||{}).desc)).join('')}
          ${q.perf.map(p=>badge('b-perf', p, CURR['學習表現'][p])).join('')}
          ${badge('b-diff-'+q.difficulty, q.difficulty)}
          <span class="topic">${q.topic}</span>
        </div>
        <div class="hint" style="margin-bottom:6px">錯誤學生：${students.join('、')}</div>
        <div class="hint" style="margin-bottom:6px">此題學習表現：${q.perf.map(p=>`<b>${p}</b> ${CURR['學習表現'][p]||''}`).join('<br>')}</div>
        <img class="qimg" loading="lazy" src="${q.img}" onerror="imgFail(this)">
        <div class="qacts">
          <button class="btn btn-blue" onclick="showRec('${qid}','m')">🎯 (a) 學習表現精熟練習</button>
          <button class="btn btn-blue" onclick="showRec('${qid}','s')">🔁 (b) 類題練習</button>
          ${conceptBtn(q)}
          <button class="btn btn-ghost" onclick="miniSolQ('${qid}',this)">📖 本題詳解</button>
        </div>
        <div class="sol" id="wsol-${qid}">
          <div class="ansline">✅ 答案：${q.answer}</div><div>${q.solution}</div>
          ${q.trap?`<div class="trap"><b>⚠ 易錯提醒：</b>${q.trap}</div>`:''}
        </div>
        <div id="rec-m-${qid}" style="display:none;background:var(--blue-bg);border-radius:10px;padding:8px 12px;margin-top:8px"></div>
        <div id="rec-s-${qid}" style="display:none;background:var(--green-bg);border-radius:10px;padding:8px 12px;margin-top:8px"></div>
      </div>`;
    });
  }
  if(essayIds.size){
    html += `<div class="panel"><h3 style="margin-top:0">✍ 非選擇題（需人工批閱）</h3><p class="hint">${[...essayIds].map(id=>{const q=QIDX[id];return q.year+'年 非選'+id.split('N')[1];}).join('、')}——學生輸入的文字答案在各筆紀錄的 answers 內。</p></div>`;
  }
  out.innerHTML = html;
  updPickN();
}
function miniSolQ(qid){ const s=el('wsol-'+qid); s.style.display = s.style.display==='block'?'none':'block'; }

// ---- 工具列 ----
el('btnAllGuide').onclick=()=>{ openSteps={}; document.querySelectorAll('.guide,.sol').forEach(x=>x.style.display='none'); document.querySelectorAll('.step').forEach(x=>x.style.display='none'); };
el('btnPickAll').onclick=()=>{
  const list = filtered();
  if(!list.length){ alert('目前沒有符合條件的題目'); return; }
  list.forEach(q=>picked.add(q.id));
  render();
};
el('btnPickPage').onclick=()=>{ filtered().slice((page-1)*PAGE,page*PAGE).forEach(q=>picked.add(q.id)); render(); };
el('btnClearPick').onclick=()=>{ picked.clear(); render(); };
// 指定題數＋範圍：範圍＝目前篩選條件，題數＝輸入的 N，從範圍內隨機抽 N 題入試卷
el('btnDraw').onclick=()=>{
  const pool = filtered();
  if(!pool.length){ alert('目前範圍內沒有符合條件的題目，請先用上方篩選（年度／冊別／章節／題號範圍等）設定範圍'); return; }
  const n = parseInt(el('drawN').value, 10);
  if(!n || n<1){ alert('請先在「抽 __ 題」欄位輸入要抽的題數'); el('drawN').focus(); return; }
  const arr = pool.slice();
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=arr[i]; arr[i]=arr[j]; arr[j]=t; }  // 洗牌
  const take = Math.min(n, arr.length);
  picked.clear();
  arr.slice(0, take).forEach(q=>picked.add(q.id));
  render();
  alert(take<n ? `此範圍內只有 ${arr.length} 題，已全部抽入（${take} 題）` : `已從範圍內隨機抽 ${take} 題（可再手動勾選增減）`);
};
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
  if(!withSol){
    // 題目卷（發給學生的）記入出題紀錄；含詳解版視為老師自用，不記
    const d = new Date();
    const name = '列印卷 '+d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    logAssign(name, '列印', list.map(q=>q.id));
  }
  render();
}
el('btnPrint').onclick=()=>doPrint(false);
el('btnPrintSol').onclick=()=>doPrint(true);
el('btnQuiz').onclick=()=>exportQuiz();
el('btnReset').onclick=()=>{
  Object.values(F).forEach(s=>s.clear());
  fKw.value=''; fNum.value='';
  Object.keys(MF).forEach(k=>drawMF(k));
  page=1; render();
};
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
                k: q.type==='choice' ? btoa(q.answer+'|'+q.id) : '',
                // e：交卷後訂正用（正解＋詳解＋逐步引導＋易錯提醒），base64 以免直接被看到
                e: btoa(unescape(encodeURIComponent(JSON.stringify({
                     a: q.answer||'', s: q.solution||'', st: q.steps||[], tp: q.trap||''
                   }))))});
  }
  const safeTitle = title.replace(/[<>&"]/g,'');
  const su = submitUrl();
  const html = QUIZ_TPL.split('__TITLE__').join(safeTitle)
      .split('__SUBMITURL__').join(su)
      .split('__PRINTPDF__').join('').split('__FIXEDCLS__').join('')
      .replace('__QUIZDATA__', JSON.stringify(items).replace(/<\//g,'<\\/'));
  const blob = new Blob([html], {type:'text/html;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '線上試卷_'+safeTitle+'.html';
  a.click();
  logAssign(safeTitle, '線上試卷', items.map(i=>i.id));
  alert('已下載「線上試卷_'+safeTitle+'.html」。\n'
    + '🖊 本卷 '+items.length+' 題已記入出題紀錄（題庫會標「已出過」）。\n'
    + (su ? '✅ 已內嵌收卷網址：學生交卷會自動上傳你的試算表。\n' : '⚠ 尚未設定收卷網址（錯題分析頁可設定），此卷交卷後只能手動複製紀錄。\n')
    + '\n上架 Netlify：\n1. 檔案改名 index.html 放進新資料夾\n2. 開 app.netlify.com/drop\n3. 資料夾拖進去 → 網址發給學生');
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
  const byPerf = {};
  QS.forEach(q=>q.perf.forEach(p=>byPerf[p]=(byPerf[p]||0)+1));
  el('statPerf').innerHTML = statTable('學習表現出題數（複合學習表現逐碼計入，一題可計多碼）',
    Object.entries(byPerf).sort((a,b)=>b[1]-a[1]).map(([p,n])=>[p+'　'+(CURR['學習表現'][p]||'').slice(0,28)+'…', n]), total);
}
buildStats();

// ---- 分頁籤 ----
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  el('bankView').style.display = t.dataset.view==='bank'?'':'none';
  el('anaView').style.display = t.dataset.view==='ana'?'':'none';
  el('reviewView').style.display = t.dataset.view==='review'?'':'none';
  el('conceptView').style.display = t.dataset.view==='concept'?'':'none';
  el('statsView').style.display = t.dataset.view==='stats'?'':'none';
  el('aboutView').style.display = t.dataset.view==='about'?'':'none';
  if(t.dataset.view==='ana') updPickN();
  if(t.dataset.view==='review' && el('rvQuiz') && !el('rvQuiz').value){ const su=submitUrl(); if(!su) el('reviewOut').innerHTML='<div class="panel">請先到「錯題分析」頁貼上並儲存收卷網址，再回來載入。</div>'; }
});
el('btnAnalyze').onclick = analyze;
el('btnQuizFromAna').onclick = ()=>exportQuiz();
el('btnPrintFromAna').onclick = ()=>doPrint(false);

// ---- 非選覆核 ----
function escR(s){ return String(s==null?'':s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
const ESSAY_RUBRICS = (DB.essay_rubrics && DB.essay_rubrics.questions) || {};
let reviewData = [], rvPick = {};
el('btnLoadReview').onclick = async ()=>{
  const u = submitUrl();
  if(!u){ alert('請先到「錯題分析」頁貼上並儲存收卷網址（含 ?token=…）'); return; }
  const quiz = el('rvQuiz').value.trim(), cls = el('rvCls').value.trim();
  const url = u + (u.includes('?')?'&':'?') + 'essays=1' + (quiz?('&quiz='+encodeURIComponent(quiz)):'') + (cls?('&cls='+encodeURIComponent(cls)):'');
  el('reviewOut').innerHTML = '<div class="panel">⏳ 載入中…</div>';
  try{ const j = await (await fetch(url)).json(); reviewData = Array.isArray(j)?j:[]; rvPick={}; renderReviewList(); }
  catch(e){ el('reviewOut').innerHTML = '<div class="panel">載入失敗：'+escR(e)+'</div>'; }
};
if(el('rvOnlyTodo')) el('rvOnlyTodo').onchange = renderReviewList;
el('btnApplyAllAI').onclick = async ()=>{
  const u = submitUrl();
  if(!u){ alert('請先設定收卷網址並「載入待覆核」'); return; }
  const todo = reviewData.filter(r=>!hasLv(r['老師覆核級分']) && hasLv(r['AI級分']));
  if(!todo.length){ alert('沒有「未覆核且已有 AI 初評」的作答可套用。\n（若都還沒 AI 初評，請先跑批改腳本 grade_essays.py。）'); return; }
  if(!confirm('把 '+todo.length+' 份未覆核的作答，直接採用 AI 級分當你的覆核分數？\n\n之後仍可個別修改；建議至少抽看幾份「低信心」的再放行。')) return;
  const updates = todo.map(r=>({fileId:r['檔案ID'], level:parseInt(r['AI級分'],10), comment:(r['老師備註']||'')}));
  const oldCount = el('rvCount').textContent; el('rvCount').textContent = '⏳ 套用中…';
  try{
    const j = await (await fetch(u, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({kind:'essay_review', updates})})).json();
    if(j.ok){ todo.forEach(r=>{ r['老師覆核級分']=parseInt(r['AI級分'],10); });
      alert('✅ 已套用 '+(j.updated!=null?j.updated:todo.length)+' 份 AI 級分。可再個別調整；學生現在就查得到這些成績。');
      renderReviewList();
    } else { el('rvCount').textContent=oldCount; alert('⚠ 套用失敗：'+(j.error||'')); }
  }catch(e){ el('rvCount').textContent=oldCount; alert('⚠ 套用失敗：'+e); }
};
// 級分 0 是合法值：不可用 (v||'') 判空，否則 0 級會被當成「未覆核」
function hasLv(v){ return v === 0 || (v != null && String(v).trim() !== ''); }
let rvCur = 0;   // 目前聚焦的卡片索引（鍵盤操作用）
function renderReviewList(){
  const onlyTodo = el('rvOnlyTodo').checked;
  let rows = reviewData.slice();
  if(onlyTodo) rows = rows.filter(r=>!hasLv(r['老師覆核級分']));
  const total = reviewData.length, done = reviewData.filter(r=>hasLv(r['老師覆核級分'])).length;
  el('rvCount').textContent = `已覆核 ${done} / ${total}` + (rows.length?`　（顯示 ${rows.length} 份）`:'');
  const bar = el('rvProgBar'); if(bar) bar.style.width = total ? Math.round(done/total*100)+'%' : '0%';
  el('reviewOut').innerHTML = rows.length ? rows.map(reviewCard).join('')
    : '<div class="panel">沒有資料——可能都覆核完了、卷名/班級沒對上、或學生還沒交卷。（記得先跑批改腳本產生 AI 初評。）</div>';
  rvCur = Math.min(rvCur, Math.max(0, rows.length-1));
  focusCard(rvCur, false);
}
function rvCards(){ return [...document.querySelectorAll('#reviewOut .rvcard')]; }
function focusCard(i, scroll){
  const cs = rvCards(); if(!cs.length) return;
  rvCur = Math.max(0, Math.min(i, cs.length-1));
  cs.forEach((c,k)=>c.classList.toggle('cur', k===rvCur));
  if(scroll!==false) cs[rvCur].scrollIntoView({behavior:'smooth', block:'center'});
}
// 鍵盤快捷鍵：0~3 給分並存、A 套用AI、J/K 下/上一份
document.addEventListener('keydown', (e)=>{
  if(el('reviewView').style.display === 'none') return;
  const t = e.target.tagName;
  if(t==='INPUT' || t==='TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
  const cs = rvCards(); if(!cs.length) return;
  const card = cs[rvCur]; if(!card) return;
  const fid = card.id.replace(/^rv-/, '');
  if('0123'.includes(e.key)){
    e.preventDefault();
    const btn = [...card.querySelectorAll('.lvbtn')].find(b=>b.textContent.trim()===e.key);
    if(btn){ setLv(fid, parseInt(e.key,10), btn); saveReview(fid); }
  } else if(e.key==='a' || e.key==='A'){
    e.preventDefault();
    const b = card.querySelector('button[onclick^="acceptAI"]'); if(b) b.click();
  } else if(e.key==='j' || e.key==='J' || e.key==='ArrowDown'){
    e.preventDefault(); focusCard(rvCur+1, true);
  } else if(e.key==='k' || e.key==='K' || e.key==='ArrowUp'){
    e.preventDefault(); focusCard(rvCur-1, true);
  }
});
function reviewCard(r){
  const fid = escR(r['檔案ID']), qid = r['題目ID'], q = QIDX[qid] || {}, rub = ESSAY_RUBRICS[qid];
  const aiLv = r['AI級分'], aiReason = r['AI理由']||'', aiConf = r['AI信心'], tLv = r['老師覆核級分'];
  // Drive 存的是「檢視頁」網址，不能直接放進 <img>；用檔案ID組直連縮圖網址才顯示得出來
  const fid0 = String(r['檔案ID']||'');
  const rpid = String(r['紅筆圖ID']||'');
  const link = escR(r['圖片連結']);                                   // 點擊放大用（檢視頁）
  const dImg = (id)=> 'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w1600';
  const img = rpid ? dImg(rpid) : (fid0 ? dImg(fid0) : link);        // 有紅筆版就先顯示紅筆版
  const num = (String(qid).split('N')[1]||'');
  const guide = (rub && rub.guide) ? '<details style="margin-top:6px"><summary style="cursor:pointer;color:var(--blue);font-weight:700;font-size:.85rem">📋 官方評分指引（0–3級分）</summary><div style="background:#fff;border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:.82rem;white-space:pre-wrap;margin-top:4px">3級分：'+escR(rub.guide.l3)+'\n\n2級分：'+escR(rub.guide.l2)+'\n\n1級分：'+escR(rub.guide.l1)+'\n\n0級分：'+escR(rub.guide.l0)+'</div></details>' : '';
  const btns = [0,1,2,3].map(lv=>'<button class="lvbtn '+(String(tLv)===String(lv)?'on':'')+'" onclick="setLv(\''+fid+'\','+lv+',this)">'+lv+'</button>').join('');
  return '<div class="panel rvcard'+(hasLv(tLv)?' done':'')+'" id="rv-'+fid+'" onclick="focusCardById(\''+fid+'\')">'
    +'<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:baseline">'
    +'<b>'+escR(r['班級'])+'-'+escR(r['座號'])+' '+escR(r['姓名']||'')+'</b>'
    +'<span style="color:var(--sub);font-size:.8rem">'+(q.year||'')+'年 非選第'+num+'題　'+escR(q.topic||'')+(hasLv(tLv)?'　✅已覆核 '+escR(tLv)+'級':'')+'</span></div>'
    +'<div class="rvgrid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px">'
    +'<div><div class="hint">'+(rpid?'紅筆批改版（原圖未被更動）':'學生作答')+'（點可放大）'
    +(rpid?' <button class="hwbtn" style="padding:2px 10px;font-size:.78rem" data-fid="'+fid0+'" data-rp="'+rpid+'" onclick="toggleRedpen(this)">看原圖</button>':'')+'</div>'
    +'<a href="'+(link||img)+'" target="_blank" rel="noopener"><img src="'+img+'" loading="lazy" referrerpolicy="no-referrer" '
    +'onerror="this.onerror=null;this.src=\'https://lh3.googleusercontent.com/d/'+encodeURIComponent(fid0)+'=w1600\'" '
    +'style="width:100%;border:1px solid var(--line);border-radius:8px;background:#fff"></a>'
    +(r['最後答案']?'<div class="hint" style="margin-top:4px">學生填的最後答案：<b>'+escR(r['最後答案'])+'</b></div>':'')
    +(r['AI辨識內容']?'<details open style="margin-top:6px"><summary style="cursor:pointer;color:var(--blue);font-weight:700;font-size:.85rem">🔎 AI 讀到的內容（對照左圖，檢查有無讀錯）</summary><div style="background:#fffdf5;border:1px solid #fde68a;border-radius:8px;padding:8px;font-size:.82rem;white-space:pre-wrap;margin-top:4px">'+escR(r['AI辨識內容'])+'</div></details>':'')+'</div>'
    +'<div><div style="background:#f8fafc;border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:.88rem"><b>🤖 AI 初評：'+escR(aiLv)+' 級</b>（信心 '+escR(aiConf)+'）<br><span style="font-size:.82rem;white-space:pre-wrap">'+escR(aiReason)+'</span></div>'
    +'<div class="hint" style="margin-top:6px">官方參考答案：<b>'+escR(q.answer||'')+'</b></div>'+guide
    +'<div style="margin-top:10px"><b>你的覆核級分：</b><span class="lvbtns">'+btns+'</span></div>'
    +'<input type="text" id="note-'+fid+'" placeholder="給學生的評語（選填）" value="'+escR(r['老師備註']||'')+'" style="width:100%;margin-top:8px;padding:8px;border:1px solid var(--line);border-radius:8px">'
    +'<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
    +'<button class="btn btn-green" onclick="saveReview(\''+fid+'\')">✔ 儲存這份</button>'
    +'<button class="btn btn-ghost" onclick="acceptAI(\''+fid+'\',\''+escR(aiLv)+'\')">套用 AI 級分</button>'
    +'<span class="hint" id="rvst-'+fid+'"></span></div></div></div></div>';
}
function setLv(fid, lv, btn){ rvPick[fid]=lv; btn.parentElement.querySelectorAll('.lvbtn').forEach(b=>b.classList.remove('on')); btn.classList.add('on'); }
function toggleRedpen(btn){
  const fid = btn.dataset.fid, rpid = btn.dataset.rp;
  const im = btn.closest('.rvcard').querySelector('img'); if(!im) return;
  const D = (id)=>'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w1600';
  const showingRed = im.dataset.mode !== 'orig';
  im.src = showingRed ? D(fid) : D(rpid);
  im.dataset.mode = showingRed ? 'orig' : 'red';
  btn.textContent = showingRed ? '看紅筆版' : '看原圖';
}
function focusCardById(fid){ const i = rvCards().findIndex(c=>c.id==='rv-'+fid); if(i>=0) focusCard(i, false); }
function acceptAI(fid, aiLv){
  if(aiLv===''||aiLv==null){ alert('這份還沒有 AI 初評（先跑批改腳本），請自行點選級分'); return; }
  const card = el('rv-'+fid); const btn = [...card.querySelectorAll('.lvbtn')].find(b=>b.textContent===String(aiLv));
  if(btn) setLv(fid, parseInt(aiLv,10), btn);
  saveReview(fid);
}
async function saveReview(fid){
  const lv = (fid in rvPick) ? rvPick[fid] : null;
  if(lv===null){ alert('請先點選覆核級分（0–3），或按「套用 AI 級分」'); return; }
  const comment = (el('note-'+fid)||{}).value || '';
  const u = submitUrl();
  if(!u){ alert('沒有收卷網址'); return; }
  const st = el('rvst-'+fid); if(st) st.textContent='⏳ 儲存中…';
  try{
    const j = await (await fetch(u, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({kind:'essay_review', updates:[{fileId:fid, level:lv, comment}]})})).json();
    if(j.ok){ if(st) st.textContent='✅ 已存（'+lv+'級）';
      const row = reviewData.find(r=>String(r['檔案ID'])===String(fid)); if(row){ row['老師覆核級分']=lv; row['老師備註']=comment; }
      const card = el('rv-'+fid); if(card) card.classList.add('done');
      // 更新進度列
      const total = reviewData.length, done = reviewData.filter(r=>hasLv(r['老師覆核級分'])).length;
      el('rvCount').textContent = `已覆核 ${done} / ${total}`;
      const bar = el('rvProgBar'); if(bar) bar.style.width = total ? Math.round(done/total*100)+'%' : '0%';
      if(el('rvOnlyTodo').checked) setTimeout(renderReviewList, 700);
      else setTimeout(()=>focusCard(rvCur+1, true), 300);   // 自動跳下一份，批改更順
    } else if(st) st.textContent='⚠ '+escR(j.error||'失敗');
  }catch(e){ if(st) st.textContent='⚠ '+escR(e); }
}

// ---- 試算表收卷設定與載入 ----
el('cfgUrl').value = localStorage.getItem('submitUrl') || DEFAULT_SUBMIT_URL;
el('btnSaveUrl').onclick = ()=>{
  localStorage.setItem('submitUrl', el('cfgUrl').value.trim());
  alert('已儲存收卷網址。之後「匯出線上試卷」會自動內嵌，學生交卷即自動上傳試算表。');
  syncAssigned();
};
el('btnClearAssign').onclick = ()=>{
  if(!confirm('清除「本機」的出題紀錄？\n\n試算表上的「出題紀錄」不受影響；若已設定收卷網址，會立即從試算表重新同步。\n（要永久取消某題的「已出過」→ 先到試算表「出題紀錄」工作表刪除該列，再按這裡。）')) return;
  try{ localStorage.removeItem('assignedLog'); }catch(e){}
  assignedIds.clear(); updAssignedInfo(); render();
  syncAssigned();
};
el('btnLoadRecs').onclick = async ()=>{
  const u = el('cfgUrl').value.trim();
  if(!u){ alert('請先貼上收卷網址（含 ?token=…）'); return; }
  localStorage.setItem('submitUrl', u);
  const quiz = el('cfgQuiz').value.trim();
  const cls = el('cfgCls').value.trim();
  const seat = el('cfgSeat').value.trim();
  const url = u + (u.includes('?')?'&':'?') + 'list=1' + (quiz ? ('&quiz='+encodeURIComponent(quiz)) : '') + (cls ? ('&cls='+encodeURIComponent(cls)) : '');
  el('anaOut').innerHTML = '<div class="panel">⏳ 從試算表載入中…</div>';
  try{
    const resp = await fetch(url);
    const j = await resp.json();
    if(!Array.isArray(j)) throw new Error((j && j.error) || '回應格式錯誤');
    let list = j;
    if(seat) list = list.filter(r=>String(r.seat||'').trim()===seat);
    if(!list.length){ el('anaOut').innerHTML = '<div class="panel">試算表目前沒有符合條件的紀錄。</div>'; return; }
    el('recInput').value = JSON.stringify(list);
    analyze();
  }catch(e){
    el('anaOut').innerHTML = '<div class="panel" style="color:var(--red)">載入失敗：'+e+'<br>請確認網址正確（含 ?token=）、Apps Script 已部署為「任何人可存取」。</div>';
  }
};
el('fExclDone').onchange = ()=>{ page=1; render(); };

// ---- 觀念補強（單一學習表現：白話說明＋簡單單選精熟練習，立即回饋）----
let cState = {};   // 單元索引 -> {done, right}
function renderConcepts(){
  const DOMS = [['n','🔢 數與量'],['a','🧮 代數'],['f','📈 函數'],['g','📍 坐標幾何'],['s','📐 圖形與空間'],['d','📊 統計與機率']];
  el('conceptList').innerHTML = CONCEPTS.length ? DOMS.map(([pfx,label])=>{
    const items = CONCEPTS.map((c,i)=>[c,i]).filter(([c])=>((c.perf||[])[0]||'').startsWith(pfx+'-'));
    if(!items.length) return '';
    return `<h2 style="margin:18px 0 8px">${label}<span class="hint" style="font-weight:400">（${items.length} 單元）</span></h2>` + items.map(([c,i])=>`
    <div class="panel">
      <h3 style="margin:0 0 4px">📘 ${c.name}</h3>
      <div style="margin-bottom:6px">${(c.perf||[]).map(p=>badge('b-perf', p, CURR['學習表現'][p])).join('')}${(c.codes||[]).map(cd=>badge('b-code', cd, (CURR['學習內容'][cd]||{}).desc)).join('')}</div>
      <p class="hint" style="margin:0 0 8px">${c.brief||''}</p>
      <button class="btn btn-blue" onclick="openConcept(${i})">進入單元（說明＋${c.questions.length} 題精熟練習）</button>
    </div>`).join('');
  }).join('') : '<div class="panel">尚未建置任何觀念單元（data/concepts.json）。</div>';
}
function openConcept(i){
  const c = CONCEPTS[i];
  cState[i] = {done:0, right:0};
  el('conceptDetail').innerHTML = `
    <div class="panel">
      <button class="btn btn-ghost" onclick="closeConcept()">← 回單元列表</button>
      <h2 style="margin:10px 0 4px">📘 ${c.name}</h2>
      <div>${(c.perf||[]).map(p=>badge('b-perf', p, CURR['學習表現'][p])).join('')}${(c.codes||[]).map(cd=>badge('b-code', cd, (CURR['學習內容'][cd]||{}).desc)).join('')}</div>
      <div style="margin:12px 0 4px;line-height:1.9">${c.explain||''}</div>
      <div style="text-align:center;margin:6px 0">${c.figure||''}</div>
    </div>
    <div class="panel">
      <h3 style="margin-top:0">✏️ 精熟練習（${c.questions.length} 題，點選項立即對答案）</h3>
      <p class="hint" id="cprog-${i}" style="margin:0 0 8px"></p>
      ${c.questions.map((q,qi)=>conceptQHtml(i,qi)).join('')}
      <button class="btn btn-blue" onclick="openConcept(${i})">🔄 重做本單元</button>
    </div>`;
  el('conceptList').style.display='none';
  updCProgress(i);
  window.scrollTo({top:0,behavior:'smooth'});
}
function closeConcept(){ el('conceptDetail').innerHTML=''; el('conceptList').style.display=''; }
function gotoConceptByPerf(p){
  const i = CONCEPT_PERF[p];
  if(i===undefined) return;
  document.querySelector('.tab[data-view="concept"]').click();
  openConcept(i);
}
function conceptQHtml(ci, qi){
  const q = CONCEPTS[ci].questions[qi];
  return `<div class="qcard" id="cq-${ci}-${qi}">
    <div class="qhead">${badge(q.level==='基礎'?'b-diff-易':'b-diff-中', q.level)}<b style="margin-left:4px">第 ${qi+1} 題</b></div>
    <div style="font-size:1rem;margin:6px 0 4px">${q.stem}</div>
    ${['A','B','C','D'].map((L,k)=>`<button class="copt" onclick="cAnswer(${ci},${qi},'${L}',this)">(${L}) ${q.options[k]}</button>`).join('')}
    <div class="cfeedback" id="cfb-${ci}-${qi}"></div>
    <div class="sol" id="csol-${ci}-${qi}">
      <div class="ansline">✅ 答案：(${q.answer})</div><div>${q.solution}</div>
      ${q.trap?`<div class="trap"><b>⚠ 易錯提醒：</b>${q.trap}</div>`:''}
    </div>
  </div>`;
}
function cAnswer(ci, qi, L, btn){
  const box = el('cq-'+ci+'-'+qi);
  if(box.dataset.done) return;
  box.dataset.done = 1;
  const q = CONCEPTS[ci].questions[qi];
  box.querySelectorAll('.copt').forEach(b=>{
    b.disabled = true;
    if(b.textContent.trim().startsWith('('+q.answer+')')) b.classList.add('c-right');
  });
  const fb = el('cfb-'+ci+'-'+qi);
  if(L===q.answer){ fb.textContent='✅ 答對了！'; fb.style.color='var(--green)'; cState[ci].right++; }
  else { btn.classList.add('c-wrong'); fb.textContent='❌ 正確答案是 ('+q.answer+')，看看下面的說明'; fb.style.color='var(--red)'; }
  el('csol-'+ci+'-'+qi).style.display='block';
  cState[ci].done++;
  updCProgress(ci);
}
function updCProgress(i){
  const n = el('cprog-'+i); if(!n) return;
  const c = CONCEPTS[i], s = cState[i];
  let t = `已作答 ${s.done}/${c.questions.length}｜答對 ${s.right} 題`;
  if(s.done===c.questions.length){
    t += s.right===c.questions.length ? '　🎉 全對！這個觀念過關了' : '　💪 看完詳解後按「重做本單元」再練一次';
  }
  n.textContent = t;
}
renderConcepts();

loadAssignedLocal(); updAssignedInfo(); syncAssigned();
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
:root{--ink:#111827;--sub:#6b7280;--line:#e2e8f0;--blue:#2563eb;--green:#059669;--red:#dc2626;
      --sh:0 1px 3px rgba(16,24,40,.07);--sh-md:0 4px 14px rgba(16,24,40,.09);--tap:48px}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:"Microsoft JhengHei","PingFang TC",system-ui,-apple-system,sans-serif;color:var(--ink);background:#f1f5f9;line-height:1.6;
     -webkit-font-smoothing:antialiased}
header{background:linear-gradient(135deg,#0f2942,#1e40af 55%,#2563eb);color:#fff;padding:16px 20px;box-shadow:var(--sh-md)}
header h1{margin:0;font-size:1.18rem;letter-spacing:.01em}
.printpdf{display:inline-block;margin-top:10px;color:#fff;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.45);border-radius:999px;
          padding:9px 16px;font-size:.86rem;font-weight:700;text-decoration:none;min-height:40px;line-height:22px}
.printpdf:active{background:rgba(255,255,255,.3)}
.wrap{max-width:900px;margin:0 auto;padding:14px}
.panel{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px;margin-bottom:14px;box-shadow:var(--sh)}
.idrow{display:flex;gap:10px;flex-wrap:wrap}
.idrow div{flex:1;min-width:110px}
.idrow label{display:block;font-size:.82rem;color:var(--sub);margin-bottom:5px;font-weight:600}
.idrow input{width:100%;padding:13px;border:1.5px solid var(--line);border-radius:12px;font-size:1.05rem;min-height:var(--tap);transition:border-color .15s}
.idrow input:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.12)}
.qcard{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:16px;box-shadow:var(--sh)}
.qtitle{font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:8px}
.qtag{font-size:.72rem;color:var(--sub);font-weight:400}
.qimg{width:100%;border:1px solid var(--line);border-radius:10px;background:#fff}
.opts{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}
.opt{padding:18px 0;font-size:1.3rem;font-weight:800;text-align:center;border:2px solid var(--line);
     border-radius:14px;background:#fff;cursor:pointer;user-select:none;min-height:56px;transition:all .12s}
.opt:active{transform:scale(.96)}
.opt.sel{background:var(--blue);border-color:var(--blue);color:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.18)}
textarea.essay{width:100%;min-height:110px;padding:12px;border:1px solid var(--line);border-radius:10px;font-size:1rem;margin-top:12px}
/* ---- 非選手寫作答 ---- */
.hwwrap{margin-top:12px}
.hwbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.hwhint{font-size:.82rem;color:var(--sub)}
.hwbtn{background:#fff;border:1.5px solid var(--line);border-radius:999px;padding:9px 16px;font-size:.88rem;font-weight:700;color:var(--ink);cursor:pointer;
       min-height:40px;transition:all .12s}
.hwbtn:active{background:#eef2ff;transform:scale(.96)}
.hwbtn-cam{border-color:#bfdbfe;color:var(--blue);background:#f8fbff}
.hwcanvas{width:100%;height:340px;border:1.5px solid #cbd5e1;border-radius:14px;background:#fff;touch-action:none;display:block;cursor:crosshair;
          box-shadow:inset 0 1px 3px rgba(16,24,40,.05)}
.hwans{width:100%;margin-top:8px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;font-size:1rem}
.hwbtn-cam{border-color:var(--blue);color:var(--blue)}
.hwphoto{width:100%;max-height:72vh;object-fit:contain;border:1px solid var(--line);border-radius:10px;background:#fff;display:block}
.scanbusy{margin-top:8px;padding:8px 12px;border-radius:10px;background:#eff6ff;border:1px solid #bfdbfe;color:#1e40af;font-size:.85rem;text-align:center}
.donebar{position:sticky;bottom:0;background:rgba(255,255,255,.97);border-top:1px solid var(--line);padding:12px 14px calc(12px + env(safe-area-inset-bottom));
         text-align:center;backdrop-filter:blur(10px);box-shadow:0 -4px 16px rgba(16,24,40,.07);z-index:40}
.btn{cursor:pointer;border:none;border-radius:14px;padding:15px 28px;font-size:1.06rem;font-weight:800;min-height:var(--tap);
     transition:transform .06s,box-shadow .15s;box-shadow:var(--sh-md)}
.btn:active{transform:translateY(1px) scale(.99)}
.btn-blue{background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff}
.btn-ghost{background:#fff;border:2px solid #bfdbfe;color:var(--blue);padding:13px 22px;box-shadow:var(--sh)}
.progress{font-size:.92rem;color:var(--sub);margin-bottom:9px;font-weight:600}
.pbar{height:7px;border-radius:99px;background:#e2e8f0;overflow:hidden;margin:0 auto 10px;max-width:420px}
.pbar i{display:block;height:100%;background:linear-gradient(90deg,#2563eb,#3b82f6);width:0;transition:width .3s}
#result{display:none}
.score{font-size:2rem;font-weight:800;color:var(--green);text-align:center;margin:6px 0}
table.res{border-collapse:collapse;width:100%;font-size:.9rem;margin-top:10px}
table.res th,table.res td{border:1px solid var(--line);padding:6px 8px;text-align:center}
.ok{color:var(--green);font-weight:700}.ng{color:var(--red);font-weight:700}
#recBox{width:100%;min-height:90px;font-size:.75rem;margin-top:8px;word-break:break-all}
.hint{font-size:.82rem;color:var(--sub)}
.locked .opt,.locked textarea,.locked .hwcanvas,.locked .hwbtn,.locked .hwans{pointer-events:none;opacity:.85}
/* ---- 交卷後的錯題訂正區 ---- */
.review{margin-top:12px;border-radius:12px;padding:12px 14px;font-size:.95rem}
.rv-ok{background:#ecfdf5;border:1px solid #a7f3d0}
.rv-ng{background:#fef2f2;border:1px solid #fecaca}
.rv-na{background:#f8fafc;border:1px solid var(--line)}
.rv-head{font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.rv-ok .rv-head{color:var(--green)}.rv-ng .rv-head{color:var(--red)}.rv-na .rv-head{color:var(--sub)}
.rv-ansline{font-size:1rem;margin-bottom:8px}
.rv-ansline b{font-size:1.15rem}
.rv-sec{margin-top:8px}
.rv-sec h4{margin:0 0 4px;font-size:.82rem;color:var(--sub);font-weight:800;letter-spacing:.04em}
.rv-sol{background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.rv-steps{margin:0;padding-left:1.3em}
.rv-steps li{margin-bottom:4px}
.rv-trap{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:8px 12px;font-size:.9rem}
.rv-toggle{background:#fff;border:1.5px solid var(--line);color:var(--sub);border-radius:999px;padding:5px 14px;font-size:.82rem;font-weight:700;cursor:pointer}
.qcard.wrong{border-color:#fca5a5;box-shadow:0 0 0 2px #fee2e2}
.wrongnav{margin-top:12px;font-size:.95rem;background:#fff7f7;border:1px solid #fecaca;border-radius:10px;padding:10px 12px}
.wrongnav a{color:var(--red);font-weight:800;text-decoration:none;border-bottom:1px dashed;margin-right:12px;white-space:nowrap}
</style>
</head>
<body>
<header><h1>📝 __TITLE__</h1>__PRINTPDF__</header>
<div class="wrap">
  <div class="panel">
    <div class="idrow">
      <div><label>班級（必填）</label><input id="stuClass" placeholder="例：309" inputmode="numeric"></div>
      <div><label>座號（必填）</label><input id="stuSeat" placeholder="例：12" inputmode="numeric"></div>
      <div><label>姓名（選填）</label><input id="stuName" placeholder="可留白"></div>
    </div>
    <p class="hint" style="margin:10px 0 0">共 <b id="totalQ"></b> 題。選擇題點選 A/B/C/D；非選擇題可<b>用 Apple Pencil／手指在框內手寫</b>，或按 <b>「📷 拍照／上傳」把紙上算好的計算過程拍照／掃描繳交</b>，最後答案可另填欄位。作答完按最下方「交卷」。</p>
    <div style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <button class="btn btn-ghost" id="btnMyResult" style="padding:8px 16px">🔍 查我的非選批改結果</button>
      <span class="hint" id="myResultHint">（交卷後、老師批改完可回來查）</span>
    </div>
  </div>
  <div id="myResultBox"></div>
  <div id="qwrap"></div>
  <div class="donebar" id="donebar">
    <div class="progress">已作答 <b id="doneN">0</b> / <span id="doneT"></span> 題</div>
    <div class="pbar"><i id="pbarFill"></i></div>
    <button class="btn btn-blue" id="btnSubmit">✅ 交卷</button>
  </div>
  <div class="panel" id="result">
    <h2 style="margin:0 0 4px">作答結果</h2>
    <div class="score" id="scoreLine"></div>
    <div id="resTable"></div>
    <div class="wrongnav" id="wrongNav"></div>
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
// ====== 收卷網址：由題庫「匯出線上試卷」時自動內嵌（Apps Script 網頁應用程式 URL 含 ?token=）======
const CONFIG = { submitUrl: "__SUBMITURL__" };
const FIXED_CLS = "__FIXEDCLS__";   // 派卷時指定班級則自動帶入並鎖定，學生只需填座號
const SUBMIT = (CONFIG.submitUrl && CONFIG.submitUrl.indexOf('http') === 0) ? CONFIG.submitUrl : '';
const ITEMS = JSON.parse(document.getElementById('qdata').textContent);
const ans = {};        // id -> 'A'~'D'（選擇）或 '[手寫]'（非選）
const imgs = {};       // 非選 id -> 作答圖 JPEG dataURL（手寫或拍照）
const essayText = {};  // 非選 id -> 最後答案文字（選填）
const HW = {};         // 非選 id -> 手寫畫布狀態
const MODE = {};       // 非選 id -> 'pen'（手寫）或 'photo'（拍照上傳）
const SCAN = {};       // 非選 id -> {origUrl, scannedUrl, view}
let _cvPromise = null; // OpenCV.js（文件掃描）延遲載入
let submitted = false;
const tsStart = Date.now();
const LSKEY = 'quiz-__TITLE__';

// 一班一網址：指定班級時自動帶入並鎖定，學生只填座號（避免填錯班級）
if(FIXED_CLS){
  const ci=document.getElementById('stuClass');
  ci.value=FIXED_CLS; ci.readOnly=true;
  ci.style.background='#f1f5f9'; ci.style.color='var(--sub)'; ci.style.fontWeight='700';
  const lb=ci.previousElementSibling; if(lb) lb.textContent='班級（本卷專屬）';
  setTimeout(()=>{ const si=document.getElementById('stuSeat'); if(si && !si.value) si.focus(); },300);
}
document.getElementById('totalQ').textContent = ITEMS.length;
document.getElementById('doneT').textContent = ITEMS.length;

// 非歷屆來源（模擬卷）的題目標示：year 不是年份數字，需另給可讀名稱
const SRCLBL = {HL1:'翰林模擬 110', HL2:'翰林模擬 111'};

document.getElementById('qwrap').innerHTML = ITEMS.map((q,i)=>`
  <div class="qcard" id="q-${q.id}">
    <div class="qtitle">第 ${i+1} 題 <span class="qtag">（${SRCLBL[q.year]||(q.year+'年會考')} ${q.type==='choice'?'第'+q.num+'題':'非選擇題'}）</span></div>
    <img class="qimg" src="${q.img}" alt="第${i+1}題">
    ${q.type==='choice'
      ? `<div class="opts">${['A','B','C','D'].map(o=>`<div class="opt" data-q="${q.id}" data-o="${o}" onclick="pick('${q.id}','${o}',this)">${o}</div>`).join('')}</div>`
      : `<div class="hwwrap" data-q="${q.id}">
           <div class="hwbar">
             <span class="hwhint" id="hwhint-${q.id}">✍ 手寫作答，或改用拍照／掃描上傳</span>
             <span style="flex:1"></span>
             <button type="button" class="hwbtn" data-role="pen" onclick="hwUndo('${q.id}')">↶ 上一步</button>
             <button type="button" class="hwbtn" data-role="pen" onclick="hwClear('${q.id}')">🗑 清除</button>
             <button type="button" class="hwbtn scantoggle" style="display:none" onclick="toggleScanView('${q.id}')">🔁 看原圖</button>
             <button type="button" class="hwbtn" data-role="photo" style="display:none" onclick="backToPen('${q.id}')">✍ 改回手寫</button>
             <button type="button" class="hwbtn hwbtn-cam" onclick="pickPhoto('${q.id}')">📷 拍照／上傳</button>
             <input type="file" accept="image/*" id="file-${q.id}" style="display:none" onchange="onPhoto('${q.id}',this)">
           </div>
           <canvas class="hwcanvas" id="hw-${q.id}"></canvas>
           <div class="scanbusy" id="busy-${q.id}" style="display:none"></div>
           <img class="hwphoto" id="photo-${q.id}" alt="上傳的計算過程" style="display:none">
           <input class="hwans" id="hwa-${q.id}" placeholder="最後答案（選填，例：(1) 9圈 (2) 第17週星期四）" oninput="essayAns('${q.id}',this.value)">
         </div>`}
  </div>`).join('');
document.querySelectorAll('.hwcanvas').forEach(setupCanvas);

function pick(id,o,elm){
  if(submitted) return;
  ans[id]=o;
  document.querySelectorAll(`.opt[data-q="${id}"]`).forEach(x=>x.classList.remove('sel'));
  elm.classList.add('sel');
  refresh(); save();
}
function essayAns(id,v){ if(submitted) return; if(v.trim()) essayText[id]=v.trim(); else delete essayText[id]; save(); }
// ---- 手寫畫布 ----
function setupCanvas(canvas){
  const id = canvas.id.slice(3);                 // 'hw-<id>' -> <id>
  const ratio = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 600, cssH = canvas.clientHeight || 340;   // 取實際 CSS 高度，避免筆跡被拉伸
  canvas.width = Math.round(cssW*ratio); canvas.height = Math.round(cssH*ratio);
  const ctx = canvas.getContext('2d'); ctx.scale(ratio,ratio);
  const st = {canvas, ctx, cssW, cssH, strokes:[], cur:null, baseImg:null};
  HW[id] = st; redraw(st);
  const pos = e=>{ const r=canvas.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top}; };
  canvas.addEventListener('pointerdown', e=>{ if(submitted) return; e.preventDefault();
    try{ canvas.setPointerCapture(e.pointerId); }catch(_){} st.cur=[pos(e)]; redraw(st); });
  canvas.addEventListener('pointermove', e=>{ if(submitted||!st.cur) return; e.preventDefault();
    const co = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
    const evs = (co && co.length) ? co : [e];
    for(const ev of evs) st.cur.push(pos(ev)); redraw(st); });
  const end = ()=>{ if(!st.cur) return; if(st.cur.length) st.strokes.push(st.cur); st.cur=null; commitCanvas(id); };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', end);
}
function redraw(st){
  const {ctx,cssW,cssH} = st;
  ctx.fillStyle='#fff'; ctx.fillRect(0,0,cssW,cssH);
  // 淡格線：幫助寫整齊（顏色極淡，不影響辨識）
  ctx.strokeStyle='#eef2f7'; ctx.lineWidth=1;
  for(let y=34; y<cssH; y+=34){ ctx.beginPath(); ctx.moveTo(8,y+.5); ctx.lineTo(cssW-8,y+.5); ctx.stroke(); }
  if(st.baseImg) ctx.drawImage(st.baseImg,0,0,cssW,cssH);
  ctx.strokeStyle='#111827'; ctx.fillStyle='#111827'; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineWidth=2.4;
  const all = st.cur ? st.strokes.concat([st.cur]) : st.strokes;
  for(const s of all){
    if(s.length===1){ ctx.beginPath(); ctx.arc(s[0].x,s[0].y,1.3,0,7); ctx.fill(); continue; }
    ctx.beginPath(); ctx.moveTo(s[0].x,s[0].y);
    for(let i=1;i<s.length;i++) ctx.lineTo(s[i].x,s[i].y);
    ctx.stroke();
  }
}
function commitCanvas(id){
  if(MODE[id]==='photo') return;      // 照片模式不由畫布決定作答
  const st = HW[id]; if(!st) return;
  if(st.strokes.length===0 && !st.baseImg){ delete imgs[id]; delete ans[id]; }
  else { imgs[id] = st.canvas.toDataURL('image/jpeg', 0.72); ans[id] = '[手寫]'; }
  refresh(); save();
}
function hwClear(id){ const st=HW[id]; if(!st||submitted||MODE[id]==='photo') return; st.strokes=[]; st.cur=null; st.baseImg=null; redraw(st); commitCanvas(id); }
function hwUndo(id){ const st=HW[id]; if(!st||submitted||MODE[id]==='photo') return; st.strokes.pop(); redraw(st); commitCanvas(id); }
// ---- 拍照／掃描上傳 ----
function pickPhoto(id){ if(submitted) return; document.getElementById('file-'+id).click(); }
function setPhotoImage(id, url){ const ph=document.getElementById('photo-'+id); ph.src=url; ph.style.display='block'; }
function showScanBusy(id, msg){
  const el = (id!=null) && document.getElementById('busy-'+id); if(!el) return;
  if(msg){ el.textContent = '⏳ '+msg; el.style.display='block'; } else el.style.display='none';
}
function setScanToggle(id, show){
  const btn = document.querySelector(`.hwwrap[data-q="${id}"] .scantoggle`);
  if(btn) btn.style.display = show ? '' : 'none';
}
// 選了照片：讀圖(套EXIF方向+downscale) → 顯示原圖 → 背景做文件掃描(抓正+增強) → 成功則切成掃描版
function onPhoto(id, input){
  if(submitted) return;
  const f = input.files && input.files[0]; if(!f) return; input.value='';
  MODE[id]='photo'; ans[id]='[照片]';
  document.getElementById('hw-'+id).style.display='none';
  setEssayMode(id,'photo'); setScanToggle(id,false);
  showScanBusy(id,'讀取照片…');
  loadPhoto(f, 2048, (origCnv, origUrl)=>{
    SCAN[id] = {origUrl, scannedUrl:null, view:'orig'};
    setPhotoImage(id, origUrl); imgs[id]=origUrl; refresh(); save();
    showScanBusy(id,'掃描抓正中…（首次需載入掃描元件，請稍候）');
    loadCV().then(()=>{
      let r=null; try{ r=scanCanvas(origCnv); }catch(e){ r=null; }
      if(r && r.ok){
        SCAN[id].scannedUrl=r.url; SCAN[id].view='scan'; imgs[id]=r.url;
        setPhotoImage(id, r.url); setScanToggle(id,true);
        const btn=document.querySelector(`.hwwrap[data-q="${id}"] .scantoggle`); if(btn) btn.textContent='🔁 看原圖';
      }
      showScanBusy(id,false); save();
    }).catch(()=>{ showScanBusy(id,false); });   // 掃描元件載不到 → 保留原圖（一樣可交卷）
  });
}
// 讀圖到 canvas：<img> 會自動套 EXIF 方向；downscale 到 maxEdge 並避開 iOS canvas 面積上限(16.7MP)
function loadPhoto(file, maxEdge, cb){
  const img = new Image(); img.decoding='async';
  img.onload = ()=>{
    const sw=img.naturalWidth, sh=img.naturalHeight;
    const AREA=16000000;
    let s=Math.min(1, maxEdge/Math.max(sw,sh));
    if(sw*s*sh*s>AREA) s=Math.sqrt(AREA/(sw*sh));
    const cw=Math.max(1,Math.round(sw*s)), ch=Math.max(1,Math.round(sh*s));
    const cnv=document.createElement('canvas'); cnv.width=cw; cnv.height=ch;
    cnv.getContext('2d').drawImage(img,0,0,cw,ch);
    URL.revokeObjectURL(img.src);
    cb(cnv, cnv.toDataURL('image/jpeg',0.85));
  };
  img.onerror=()=>{ alert('讀取照片失敗，請再試一次'); showScanBusy(null,false); };
  img.src=URL.createObjectURL(file);
}
// 延遲載入 OpenCV.js(~8MB) + jscanify，只在第一次拍照時載
function loadCV(){
  if(_cvPromise) return _cvPromise;
  _cvPromise = new Promise((resolve,reject)=>{
    setTimeout(()=>reject(new Error('timeout')), 30000);   // 逾時退場（用原圖）
    const loadJscanify=()=>{
      if(window.jscanify) return resolve();
      const j=document.createElement('script');
      j.src='https://cdn.jsdelivr.net/npm/jscanify@1.3.0/src/jscanify.min.js';
      j.onload=()=>resolve(); j.onerror=reject; document.body.appendChild(j);
    };
    if(window.cv && cv.Mat) return loadJscanify();
    const s=document.createElement('script');
    s.src='https://docs.opencv.org/4.8.0/opencv.js'; s.async=true;
    s.onload=()=>{ if(window.cv && cv.Mat) loadJscanify(); else cv['onRuntimeInitialized']=loadJscanify; };
    s.onerror=reject; document.body.appendChild(s);
  });
  return _cvPromise;
}
// 用 jscanify 偵測紙張四角 → 透視校正 → adaptiveThreshold 增強對比；回 {ok,url}
function scanCanvas(srcCnv){
  const scanner=new jscanify();
  let mat; try{ mat=cv.imread(srcCnv); }catch(e){ return {ok:false}; }
  let corners=null;
  try{ corners=scanner.getCornerPoints(scanner.findPaperContour(mat)); }
  catch(e){ mat.delete(); return {ok:false}; }
  mat.delete();
  const c=corners||{}, tl=c.topLeftCorner, tr=c.topRightCorner, bl=c.bottomLeftCorner, br=c.bottomRightCorner;
  if(!tl||!tr||!bl||!br) return {ok:false};
  const D=(a,b)=>Math.hypot(a.x-b.x, a.y-b.y);
  const wTop=D(tl,tr), wBot=D(bl,br), hL=D(tl,bl), hR=D(tr,br);
  if(Math.max(wTop,wBot) < srcCnv.width*0.35 || Math.max(hL,hR) < srcCnv.height*0.35) return {ok:false}; // 框太小＝沒抓到
  const outW=1240, outH=Math.max(1, Math.round(outW*((hL+hR)/(wTop+wBot))));
  let warped; try{ warped=scanner.extractPaper(srcCnv, outW, outH, corners); }catch(e){ return {ok:false}; }
  let enhanced; try{ enhanced=enhance(warped); }catch(e){ enhanced=warped; }
  return {ok:true, url: enhanced.toDataURL('image/jpeg',0.85)};
}
function enhance(canvas){
  const src=cv.imread(canvas), gray=new cv.Mat(), dst=new cv.Mat();
  cv.cvtColor(src,gray,cv.COLOR_RGBA2GRAY);
  cv.adaptiveThreshold(gray,dst,255,cv.ADAPTIVE_THRESH_GAUSSIAN_C,cv.THRESH_BINARY,25,12);
  const out=document.createElement('canvas'); cv.imshow(out,dst);
  src.delete(); gray.delete(); dst.delete();
  return out;
}
function toggleScanView(id){
  const s=SCAN[id]; if(!s||!s.scannedUrl) return;
  s.view = s.view==='scan' ? 'orig' : 'scan';
  const url = s.view==='scan' ? s.scannedUrl : s.origUrl;
  imgs[id]=url; setPhotoImage(id,url); save();
  const btn=document.querySelector(`.hwwrap[data-q="${id}"] .scantoggle`);
  if(btn) btn.textContent = s.view==='scan' ? '🔁 看原圖' : '🔁 看掃描版';
}
function setEssayMode(id, mode){
  MODE[id] = mode;
  const wrap = document.querySelector(`.hwwrap[data-q="${id}"]`); if(!wrap) return;
  wrap.querySelectorAll('[data-role="pen"]').forEach(b=>b.style.display = mode==='pen' ? '' : 'none');
  wrap.querySelectorAll('[data-role="photo"]').forEach(b=>b.style.display = mode==='photo' ? '' : 'none');
  const hint = document.getElementById('hwhint-'+id);
  if(hint) hint.textContent = mode==='photo' ? '📷 已上傳計算過程照片（可改回手寫）' : '✍ 手寫作答，或改用拍照／掃描上傳';
}
function backToPen(id){
  if(submitted) return;
  const ph = document.getElementById('photo-'+id); ph.style.display = 'none'; ph.src = '';
  document.getElementById('hw-'+id).style.display = 'block';
  setScanToggle(id, false); showScanBusy(id, false); delete SCAN[id];
  setEssayMode(id, 'pen');
  commitCanvas(id);   // 依畫布現況重算（無筆跡則清空該題作答）
}
function refresh(){
  const n = Object.keys(ans).length;
  document.getElementById('doneN').textContent = n;
  const bar = document.getElementById('pbarFill');
  if(bar) bar.style.width = ITEMS.length ? Math.round(n/ITEMS.length*100)+'%' : '0%';
}
function save(){
  const base = {ans, essayText, mode:MODE, cls:valCls(), seat:valSeat(), name:val('stuName')};
  try{ localStorage.setItem(LSKEY, JSON.stringify({...base, imgs})); }
  catch(e){ try{ localStorage.setItem(LSKEY, JSON.stringify(base)); }catch(_){} }  // 作答圖太大存不下時，至少保住文字與選擇
}
function val(id){ return document.getElementById(id).value.trim(); }
// 班級／座號正規化：只留數字、去前導零（避免 03 與 3 被當成兩個人）
function numId(v){ const d=String(v||'').replace(/[^0-9]/g,''); return d.replace(/^0+(?=\d)/,''); }
function valCls(){ return FIXED_CLS || numId(val('stuClass')) || val('stuClass'); }
function valSeat(){ return numId(val('stuSeat')) || val('stuSeat'); }
// 還原草稿
try{
  const d = JSON.parse(localStorage.getItem(LSKEY)||'null');
  if(d){
    Object.assign(ans, d.ans||{});
    Object.assign(imgs, d.imgs||{});
    Object.assign(essayText, d.essayText||{});
    Object.assign(MODE, d.mode||{});
    ['stuClass','stuSeat','stuName'].forEach((k,i)=>{ document.getElementById(k).value = [d.cls,d.seat,d.name][i]||''; });
    for(const [id,a] of Object.entries(ans)){
      const btn = document.querySelector(`.opt[data-q="${id}"][data-o="${a}"]`);
      if(btn){ btn.classList.add('sel'); continue; }
      if(!imgs[id]) continue;
      if(MODE[id]==='photo'){                      // 還原拍照上傳
        const ph = document.getElementById('photo-'+id);
        if(ph){ ph.src = imgs[id]; ph.style.display = 'block'; }
        const cv = document.getElementById('hw-'+id); if(cv) cv.style.display = 'none';
        setEssayMode(id, 'photo');
      } else if(HW[id]){                            // 還原手寫圖到畫布
        const im = new Image();
        im.onload = ()=>{ HW[id].baseImg = im; redraw(HW[id]); };
        im.src = imgs[id];
      }
    }
    for(const [id,t] of Object.entries(essayText)){ const inp=document.getElementById('hwa-'+id); if(inp) inp.value=t; }
    refresh();
  }
}catch(e){}
['stuClass','stuSeat','stuName'].forEach(k=>document.getElementById(k).addEventListener('input', save));
['stuClass','stuSeat'].forEach(k=>document.getElementById(k).addEventListener('blur', e=>{
  if(k==='stuClass' && FIXED_CLS) return;
  const n=numId(e.target.value); if(n) e.target.value=n;   // 離開欄位即正規化（03 → 3）
}));

function grade(q){
  if(q.type!=='choice') return null;
  try{ return atob(q.k).split('|')[0] === (ans[q.id]||''); }catch(e){ return null; }
}
document.getElementById('btnSubmit').onclick = () => {
  if(submitted) return;
  if(!val('stuClass')||!val('stuSeat')){ alert('請先填寫 班級、座號'); window.scrollTo({top:0,behavior:'smooth'}); return; }
  const blank = ITEMS.filter(q=>!(q.id in ans)).length;
  if(blank>0 && !confirm(`還有 ${blank} 題未作答，確定要交卷嗎？`)) return;
  submitted = true;
  document.body.classList.add('locked');
  const rows = ITEMS.map((q,i)=>{
    const ok = grade(q);
    let a = ans[q.id]||'';
    if(q.type!=='choice') a = essayText[q.id] || (imgs[q.id] ? (ans[q.id]||'[手寫]') : '');
    return {id:q.id, n:i+1, a, ok};
  });
  const auto = rows.filter(r=>r.ok!==null);
  const score = auto.filter(r=>r.ok).length;
  // 防護：只送出「確實有內容」的圖（曾發生上傳成 0 bytes 空檔，老師端就取不到圖）
  const MIN_IMG = 2000;   // dataURL 至少要這麼長才算有效（空白/失敗的會遠小於此）
  const badImgs = [];
  const essay_imgs = ITEMS.filter(q=>q.type!=='choice' && imgs[q.id])
    .filter(q=>{ const ok = String(imgs[q.id]||'').length >= MIN_IMG; if(!ok) badImgs.push(q); return ok; })
    .map(q=>({id:q.id, img:imgs[q.id], ans:essayText[q.id]||''}));
  if(badImgs.length){
    alert('有 '+badImgs.length+' 題的作答圖片看起來是空的或沒有存成功，\n請回去重新手寫或重新拍照上傳後再交卷。');
    submitted = false; document.body.classList.remove('locked');
    const c = document.getElementById('q-'+badImgs[0].id); if(c) c.scrollIntoView({behavior:'smooth', block:'center'});
    return;
  }
  const rec = {
    v:1, quiz:"__TITLE__", cls:valCls(), seat:valSeat(), name:val('stuName'),
    ts_start:new Date(tsStart).toISOString(), ts_submit:new Date().toISOString(),
    dur_s:Math.round((Date.now()-tsStart)/1000),
    score, total_auto:auto.length, n_essay:essay_imgs.length,
    answers:rows.map(r=>({id:r.id, a:r.a, ok:r.ok}))
  };
  const parts = [];
  if(auto.length) parts.push(`選擇題 ${score} / ${auto.length}`);
  if(essay_imgs.length) parts.push(`非選 ${essay_imgs.length} 題已送出（待批改）`);
  document.getElementById('scoreLine').textContent = parts.join('　｜　') || '已交卷';
  document.getElementById('resTable').innerHTML = '<table class="res"><tr><th>題</th>'+rows.map(r=>`<th>${r.n}</th>`).join('')+'</tr>'+
    '<tr><td>結果</td>'+rows.map(r=>`<td class="${r.ok===null?'':(r.ok?'ok':'ng')}">${r.ok===null?'—':(r.ok?'○':'✕')}</td>`).join('')+'</tr></table>';
  renderReview(rows);
  const showJson = JSON.stringify(rec);                    // 給學生複製/下載（不含大圖）
  const postJson = JSON.stringify({...rec, essay_imgs});   // 上傳用（含手寫圖，後端存 Drive）
  const b64 = btoa(unescape(encodeURIComponent(showJson)));
  window._rec = {json: showJson, b64, fname:`作答紀錄_${rec.cls}_${rec.seat}_${rec.name}.json`};
  document.getElementById('recBox').value = b64;
  document.getElementById('result').style.display = 'block';
  document.getElementById('donebar').style.display = 'none';
  document.getElementById('result').scrollIntoView({behavior:'smooth'});
  try{ localStorage.removeItem(LSKEY); }catch(e){}
  if(SUBMIT){
    const st = document.getElementById('postStatus');
    st.textContent = '⏳ 紀錄上傳中…';
    // Apps Script 需用 text/plain 避免預檢請求
    fetch(SUBMIT, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:postJson})
      .then(r=>r.json())
      .then(j=>{ st.textContent = j.ok ? '✅ 已自動上傳老師的試算表（含手寫作答；仍建議保留上方紀錄以備援）' : '⚠ 上傳失敗：'+(j.error||'')+'，請改用複製/分享交給老師'; })
      .catch(()=>{ st.textContent = '⚠ 自動上傳失敗（可能沒有網路），請用「複製紀錄」交給老師'; });
  }
};
// ---- 交卷後：錯題訂正（正確答案＋詳解）----
function esc(s){ return String(s==null?'':s).replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function b64json(s){ try{ return JSON.parse(decodeURIComponent(escape(atob(s||'')))) || {}; }catch(e){ return {}; } }
function tgSol(btn){
  const b = btn.closest('.review').querySelector('.rv-body');
  const on = b.style.display === 'none';
  b.style.display = on ? 'block' : 'none';
  btn.textContent = on ? '收起詳解' : '看詳解';
}
function jumpQ(n){
  const q = ITEMS[n-1]; if(!q) return;
  const el = document.getElementById('q-'+q.id);
  if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
}
function renderReview(rows){
  const wrongNs = [];
  ITEMS.forEach((q,i)=>{
    const r = rows[i];
    const card = document.getElementById('q-'+q.id);
    if(!card || card.querySelector('.review')) return;
    const ex = b64json(q.e);
    let correct = ex.a || '';
    if(!correct && q.k){ try{ correct = atob(q.k).split('|')[0]; }catch(e){} }
    const mine = r.a || '（未作答）';
    const detail =
      (ex.s ? `<div class="rv-sec"><h4>詳解</h4><div class="rv-sol">${esc(ex.s)}</div></div>` : '') +
      ((ex.st && ex.st.length) ? `<div class="rv-sec"><h4>逐步引導</h4><ol class="rv-steps">${ex.st.map(t=>`<li>${esc(t)}</li>`).join('')}</ol></div>` : '') +
      (ex.tp ? `<div class="rv-sec"><h4>易錯提醒</h4><div class="rv-trap">⚠ ${esc(ex.tp)}</div></div>` : '');
    const div = document.createElement('div');
    if(r.ok === false){
      wrongNs.push(r.n); card.classList.add('wrong');
      div.className = 'review rv-ng';
      div.innerHTML = `<div class="rv-head">✗ 答錯</div>
        <div class="rv-ansline">你的答案：<b>${esc(mine)}</b>　→　正確答案：<b style="color:var(--green)">${esc(correct)}</b></div>${detail}`;
    }else if(r.ok === true){
      div.className = 'review rv-ok';
      div.innerHTML = `<div class="rv-head">✓ 答對<span style="font-weight:400;color:var(--sub)">正確答案 ${esc(correct)}</span>${detail?'<button class="rv-toggle" onclick="tgSol(this)">看詳解</button>':''}</div>
        <div class="rv-body" style="display:none">${detail}</div>`;
    }else{
      div.className = 'review rv-na';
      const mineTxt = (mine==='[手寫]'||mine==='[照片]') ? '（已'+(mine==='[照片]'?'上傳照片':'手寫')+'作答，等待老師／AI 批改）' : mine;
      div.innerHTML = `<div class="rv-head">✍ 非選擇題（作答已送出，待批改）</div>
        <div class="rv-ansline">你的作答：<b>${esc(mineTxt)}</b>${correct?`　→　參考答案：<b style="color:var(--green)">${esc(correct)}</b>`:''}</div>${detail}`;
    }
    card.appendChild(div);
  });
  const wn = document.getElementById('wrongNav');
  if(!wn) return;
  if(wrongNs.length){
    wn.innerHTML = `<b style="color:var(--red)">錯 ${wrongNs.length} 題</b>：` +
      wrongNs.map(n=>`<a href="#" onclick="jumpQ(${n});return false;">第${n}題</a>`).join('') +
      `<div class="hint" style="margin-top:6px">點題號跳到該題，題目下方有<b>正確答案與詳解</b>可以訂正。</div>`;
  }else{
    wn.style.background = '#ecfdf5'; wn.style.borderColor = '#a7f3d0';
    wn.innerHTML = '<b style="color:var(--green)">全部答對，太棒了！</b><div class="hint" style="margin-top:4px">每題下方可按「看詳解」複習解法。</div>';
  }
}
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
// ---- 查我的非選批改結果（只顯示老師覆核完的級分；沒批到＝批改中）----
document.getElementById('btnMyResult').onclick = async ()=>{
  const cls = valCls(), seat = valSeat();
  const hint = document.getElementById('myResultHint');
  if(!cls || !seat){ alert('請先填「班級、座號」再查'); return; }
  if(!SUBMIT){ hint.textContent = '（此卷沒有設定收卷網址，無法查詢）'; return; }
  const box = document.getElementById('myResultBox');
  box.innerHTML = '<div class="panel">⏳ 查詢中…</div>';
  const url = SUBMIT + (SUBMIT.indexOf('?')>=0?'&':'?') + 'myresult=1&quiz=' + encodeURIComponent("__TITLE__") + '&cls=' + encodeURIComponent(cls) + '&seat=' + encodeURIComponent(seat);
  try{ const j = await (await fetch(url)).json();
        renderMyResult(Array.isArray(j)?j:(j.items||[]), Array.isArray(j)?null:(j.choice||null)); }
  catch(e){ box.innerHTML = '<div class="panel">查詢失敗，請稍後再試。</div>'; }
};
function renderMyResult(rows, choice){
  const box = document.getElementById('myResultBox');
  if(!rows.length){ box.innerHTML = '<div class="panel review rv-na">查不到你的非選作答紀錄——確認班級座號正確、而且已經交卷。</div>'; return; }
  const byId = {}; ITEMS.forEach(q=>byId[q.id]=q);
  const cards = rows.map(r=>{
    const q = byId[r.qid] || {}, ex = b64json(q.e);
    const graded = String(r.level==null?'':r.level)!=='';
    const num = (String(r.qid).split('N')[1]||'');
    const lvHtml = graded ? '<b style="color:var(--green);font-size:1.25rem">'+esc(r.level)+' 級</b><span style="color:var(--sub)"> / 3</span>'
                          : '<b style="color:#b45309">批改中…</b>';
    let detail = '';
    if(graded){
      const cleanReason = String(r.reason||'').replace(/^\[[^\]]*\]\s*/,'').trim();  // 去掉 [AI初評…] 內部標籤
      if(r.redpen) detail += '<div class="rv-sec"><h4>老師批改（紅筆為批改標註，你的原作答沒有被更動）</h4>'
        + '<a href="https://drive.google.com/file/d/'+encodeURIComponent(r.redpen)+'/view" target="_blank" rel="noopener">'
        + '<img src="https://drive.google.com/thumbnail?id='+encodeURIComponent(r.redpen)+'&sz=w1600" referrerpolicy="no-referrer" '
        + 'style="width:100%;border:1px solid var(--line);border-radius:10px;background:#fff"></a></div>';
      if(r.transcript) detail += '<div class="rv-sec"><h4>AI 讀到你的作答（若讀錯，跟老師說）</h4><div class="rv-sol" style="white-space:pre-wrap">'+esc(r.transcript)+'</div></div>';
      if(r.comment) detail += '<div class="rv-sec"><h4>老師評語</h4><div class="rv-trap">'+esc(r.comment)+'</div></div>';
      // 為什麼得這個分數：老師採用AI級分時才顯示AI判讀（改過分又沒留言就不顯示，避免對不上）
      if(cleanReason && String(r.level)===String(r.ai_level))
        detail += '<div class="rv-sec"><h4>為什麼得這個分數（依官方評分規準）</h4><div class="rv-sol">'+esc(cleanReason)+'</div></div>';
      if(ex.a) detail += '<div class="rv-sec"><h4>參考答案</h4><div class="rv-sol">'+esc(ex.a)+'</div></div>';
      if(ex.s) detail += '<div class="rv-sec"><h4>詳解</h4><div class="rv-sol">'+esc(ex.s)+'</div></div>';
    }
    return '<div class="review rv-na" style="margin-top:10px"><div class="rv-head">'+(q.year||'')+'年 非選第'+num+'題　'+lvHtml+'</div>'
      + (r.img?'<div style="margin:4px 0"><a href="'+esc(r.img)+'" target="_blank" rel="noopener" class="hint">🖼 看我當初交的作答</a></div>':'')
      + detail + '</div>';
  }).join('');
  // 會考加權換算：非選(級分和/總級分)×15 ＋ 選擇(答對/題數)×85，滿分 100
  let weighted = '';
  const gradedRows = rows.filter(r=>r.level===0 || (r.level!=null && String(r.level).trim()!==''));
  if(rows.length && gradedRows.length === rows.length){
    const eGot = gradedRows.reduce((a,r)=>a+Number(r.level||0),0), eMax = rows.length*3;
    const ePart = eMax ? (eGot/eMax)*15 : 0;
    if(choice && Number(choice.total)>0){
      const cPart = (Number(choice.score)/Number(choice.total))*85;
      weighted = '<div style="background:linear-gradient(135deg,#eff6ff,#e0f2fe);border:1px solid #bfdbfe;border-radius:14px;padding:14px 16px;margin:4px 0 12px">'
        + '<div style="font-size:.85rem;color:var(--sub);font-weight:700">會考加權總分（滿分 100）</div>'
        + '<div style="font-size:2.1rem;font-weight:800;color:var(--blue);line-height:1.25">'+(ePart+cPart).toFixed(1)
        + '<span style="font-size:1rem;color:var(--sub);font-weight:600"> / 100</span></div>'
        + '<div class="hint" style="margin-top:4px">選擇題 '+choice.score+'/'+choice.total+' × 85% ＝ '+cPart.toFixed(1)+' 分'
        + '　＋　非選 '+eGot+'/'+eMax+' 級分 × 15% ＝ '+ePart.toFixed(1)+' 分</div>'
        + '<div class="hint" style="margin-top:2px">＊依國中教育會考計分方式換算（選擇佔 85%、非選佔 15%）</div></div>';
    } else {
      weighted = '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:12px 14px;margin:4px 0 12px">'
        + '<b>非選得分：'+eGot+' / '+eMax+' 級分</b><div class="hint">占會考加權 15%，換算 '+ePart.toFixed(1)+' 分</div></div>';
    }
  }
  box.innerHTML = '<div class="panel"><h3 style="margin:0 0 4px">📋 我的批改結果</h3>'
    + '<p class="hint" style="margin:0 0 8px">「批改中」＝老師還沒批到，晚點再回來查；級分 0–3（會考制），最終以老師為準。</p>'
    + weighted + cards + '</div>';
  box.scrollIntoView({behavior:'smooth'});
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
    if not img_path.exists():                       # 缺圖不中斷（前端已有缺圖提示）
        print(f"⚠ 缺題目圖，單檔版將顯示缺圖提示：{q['id']} → {q['img']}")
        continue
    q["img"] = "data:image/png;base64," + base64.b64encode(img_path.read_bytes()).decode()
payload2 = json.dumps({"questions": q_embed, "curriculum": curr, "concepts": concepts,
                       "essay_rubrics": essay_rubrics}, ensure_ascii=False)
html2 = TEMPLATE.replace("__PAYLOAD__", payload2.replace("</", "<\\/")).replace("__QUIZB64__", quiz_b64)
out2 = BASE / "會考題庫單檔版.html"
out2.write_text(html2, encoding="utf-8")
print("written", out2, f"{out2.stat().st_size/1024/1024:.1f} MB")


def make_quiz(question_ids, title, out_path, submit_url="", print_pdf="", fixed_cls=""):
    """由 Python 端直接產生線上試卷（與網頁匯出功能同一模板）
    print_pdf：紙本作答卷 PDF 的相對路徑（放同一部署資料夾），空字串＝不顯示下載鈕"""
    idx = {q["id"]: q for q in questions}
    items = []
    for qid in question_ids:
        q = idx[qid]
        b64 = base64.b64encode((BASE / q["img"]).read_bytes()).decode()
        items.append({
            "id": q["id"], "year": q["year"], "num": q["num"], "type": q["type"],
            "img": "data:image/png;base64," + b64,
            "k": base64.b64encode(f"{q['answer']}|{q['id']}".encode()).decode() if q["type"] == "choice" else "",
            # e：交卷後訂正用（正解＋詳解＋逐步引導＋易錯提醒）
            "e": base64.b64encode(json.dumps({
                "a": q.get("answer", ""), "s": q.get("solution", ""),
                "st": q.get("steps", []), "tp": q.get("trap", ""),
            }, ensure_ascii=False).encode("utf-8")).decode(),
        })
    data = json.dumps(items, ensure_ascii=False).replace("</", "<\\/")
    pdf_html = (f'<a class="printpdf" href="{print_pdf}" download>🖨 下載紙本作答卷（PDF，可印出來寫再拍照上傳）</a>'
                if print_pdf else "")
    html = (QUIZ_TEMPLATE.replace("__TITLE__", title)
            .replace("__SUBMITURL__", submit_url)
            .replace("__PRINTPDF__", pdf_html)
            .replace("__FIXEDCLS__", str(fixed_cls or ""))
            .replace("__QUIZDATA__", data))
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    Path(out_path).write_text(html, encoding="utf-8")
    print("written", out_path, f"{Path(out_path).stat().st_size/1024/1024:.1f} MB")


# ---- 示範卷：最近5屆（111–115）第1–10題 ----
# 注意：netlify_deploy/index.html 是「目前上架中的學生卷」，build 不得覆蓋
# （2026-07-15 曾把已上架的複習卷B1蓋掉）；示範卷固定輸出到 backup/，要上架時再手動複製過去
sample_ids = [q["id"] for q in questions
               if isinstance(q["year"], int) and q["year"] >= 111 and q["type"] == "choice" and q["num"] <= 10]
make_quiz(sample_ids, "會考數學示範卷（最近5屆 第1-10題）", BASE / "backup" / "示範卷_最近5屆1-10題_index.html")

# ---- 非選練習卷：104–115 全部非選題（手寫作答卷，收卷網址已烤入，可直接部署測試）----
ESSAY_SUBMIT_URL = "https://script.google.com/macros/s/AKfycbw-ePEfCoTB3SpwOh4g0IcfwsQWanQm8bvXgOGDdIECkK2845qIoKhH9xtRNuxu29wN/exec?token=math809"
essay_ids = [q["id"] for q in questions if q["type"] == "essay"]
# 同步產生紙本作答卷 PDF（放 backup/，部署時一起複製到 essay_deploy/）
import subprocess as _sp, sys as _sys
_sp.run([_sys.executable, str(Path(__file__).resolve().parent / "make_essay_print.py"),
         "--out", str(BASE / "backup" / "非選練習卷_紙本.pdf")], check=False)
make_quiz(essay_ids, "會考數學非選題練習卷（104-115）", BASE / "backup" / "非選練習卷_index.html",
          submit_url=ESSAY_SUBMIT_URL, print_pdf="非選練習卷_紙本.pdf")

# =====================================================================
# 學生端觀念補強練習頁：netlify_deploy/practice.html
# 每次 build 從 concepts.json 重新生成（與掛卷用的 index.html 無關，可安全覆蓋）
# 做完一個單元自動 POST 成績到試算表，卷名「觀念-<代碼>-<名稱>」
# =====================================================================
PRACTICE_SUBMIT_URL = "https://script.google.com/macros/s/AKfycbw-ePEfCoTB3SpwOh4g0IcfwsQWanQm8bvXgOGDdIECkK2845qIoKhH9xtRNuxu29wN/exec?token=math809"

PRACTICE_TEMPLATE = r"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>觀念補強練習</title>
<style>
:root{--ink:#1f2937;--sub:#6b7280;--bg:#f5f6f8;--card:#fff;--line:#e5e7eb;--blue:#2563eb;--blue-bg:#eff6ff;--green:#059669;--red:#dc2626;--red-bg:#fef2f2;--amber:#d97706}
*{box-sizing:border-box} body{margin:0;font-family:system-ui,-apple-system,"Noto Sans TC",sans-serif;background:var(--bg);color:var(--ink);line-height:1.7}
.wrap{max-width:820px;margin:0 auto;padding:14px}
.panel{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-bottom:12px}
h1{font-size:1.25rem;margin:4px 0 10px} h2{font-size:1.05rem;margin:10px 0 6px}
.btn{display:inline-block;border:none;border-radius:10px;padding:10px 16px;font-size:1rem;cursor:pointer;margin-right:8px}
.btn-blue{background:var(--blue);color:#fff}.btn-ghost{background:#eef1f5;color:var(--ink)}
input{font-size:1rem;padding:8px 10px;border:1px solid var(--line);border-radius:8px;width:100%}
.idrow{display:flex;gap:8px}.idrow>div{flex:1}
.copt{display:block;width:100%;text-align:left;margin:6px 0;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;background:#fff;font-size:1rem;cursor:pointer}
.copt:disabled{opacity:.85}.c-right{border-color:var(--green);background:#ecfdf5}.c-wrong{border-color:var(--red);background:var(--red-bg)}
.sol{display:none;background:#f8fafc;border:1px dashed var(--line);border-radius:10px;padding:10px 12px;margin-top:8px;font-size:.95rem}
.trap{color:var(--amber);margin-top:6px}.hint{color:var(--sub);font-size:.9rem}
.qcard{border-top:1px solid var(--line);padding:12px 0}
.lv{display:inline-block;font-size:.78rem;padding:2px 8px;border-radius:99px;background:var(--blue-bg);color:var(--blue);margin-right:6px}
.ubtn{display:block;width:100%;text-align:left;margin:6px 0;padding:12px;border:1.5px solid var(--line);border-radius:12px;background:#fff;font-size:1rem;cursor:pointer}
.done-tag{color:var(--green);font-size:.85rem;margin-left:6px}
.cfb{font-weight:700;margin-top:6px}
</style>
</head>
<body><div class="wrap">
<div class="panel">
  <h1>📘 觀念補強練習</h1>
  <p class="hint" style="margin:0 0 8px">先填基本資料（做完會自動回傳老師），再選一個單元開始。每個單元＝白話說明＋6 題精熟練習，點選項立即對答案。</p>
  <div class="idrow">
    <div><input id="cls" placeholder="班級（如 909）"></div>
    <div><input id="seat" placeholder="座號"></div>
    <div><input id="name" placeholder="姓名"></div>
  </div>
</div>
<div id="unitList"></div>
<div id="unitView"></div>
</div>
<script>
const DB = __CONCEPTS__;
const SUBMIT = "__SUBMITURL__";
const DOMS = [['n','🔢 數與量'],['a','🧮 代數'],['f','📈 函數'],['g','📍 坐標幾何'],['s','📐 圖形與空間'],['d','📊 統計與機率']];
const el = id => document.getElementById(id);
['cls','seat','name'].forEach(k=>{ el(k).value = localStorage.getItem('stu_'+k)||''; el(k).oninput = ()=>localStorage.setItem('stu_'+k, el(k).value.trim()); });
function doneTag(c){ const s = localStorage.getItem('best_'+c.id); return s ? `✅ 最佳 ${s}/${c.questions.length}` : ''; }
function renderList(){
  el('unitView').innerHTML = '';
  el('unitList').innerHTML = DOMS.map(([pfx,label])=>{
    const items = DB.map((c,i)=>[c,i]).filter(([c])=>((c.perf||[])[0]||'').startsWith(pfx+'-'));
    if(!items.length) return '';
    return `<div class="panel"><h2>${label}<span class="hint" style="font-weight:400">（${items.length} 單元）</span></h2>` +
      items.map(([c,i])=>`<button class="ubtn" onclick="openU(${i})">📘 ${c.name}<span class="done-tag" id="tag-${i}">${doneTag(c)}</span><br><span class="hint">${c.brief||''}</span></button>`).join('') + '</div>';
  }).join('');
  el('unitList').style.display = '';
  window.scrollTo(0,0);
}
let cur = null;
function openU(i){
  const c = DB[i];
  cur = {i, right:0, done:0, t0:new Date(), ans:[]};
  el('unitList').style.display = 'none';
  el('unitView').innerHTML = `<div class="panel"><button class="btn btn-ghost" onclick="renderList()">← 回單元列表</button>
    <h1 style="margin-top:10px">📘 ${c.name}</h1><div>${c.explain||''}</div><div style="text-align:center;margin:6px 0">${c.figure||''}</div></div>
    <div class="panel"><h2>✏️ 精熟練習（${c.questions.length} 題）</h2><p class="hint" id="prog" style="margin:0"></p>
    ${c.questions.map((q,qi)=>qHtml(i,qi)).join('')}
    <div id="finish" style="display:none"></div></div>`;
  upd();
  window.scrollTo(0,0);
}
function qHtml(ci,qi){
  const q = DB[ci].questions[qi];
  return `<div class="qcard" id="q-${qi}"><span class="lv">${q.level}</span><b>第 ${qi+1} 題</b>
    <div style="margin:6px 0">${q.stem}</div>
    ${['A','B','C','D'].map((L,k)=>`<button class="copt" onclick="pick(${qi},'${L}',this)">(${L}) ${q.options[k]}</button>`).join('')}
    <div class="cfb" id="fb-${qi}"></div>
    <div class="sol" id="sol-${qi}"><div>✅ 答案：(${q.answer})</div><div>${q.solution}</div>${q.trap?`<div class="trap">⚠ ${q.trap}</div>`:''}</div></div>`;
}
function pick(qi,L,btn){
  const c = DB[cur.i], q = c.questions[qi], box = el('q-'+qi);
  if(box.dataset.done) return;
  box.dataset.done = 1;
  box.querySelectorAll('.copt').forEach(b=>{ b.disabled = true; if(b.textContent.trim().startsWith('('+q.answer+')')) b.classList.add('c-right'); });
  const ok = (L === q.answer);
  if(ok){ el('fb-'+qi).textContent = '✅ 答對了！'; el('fb-'+qi).style.color = 'var(--green)'; cur.right++; }
  else { btn.classList.add('c-wrong'); el('fb-'+qi).textContent = '❌ 正確答案是 ('+q.answer+')，看看下面的說明'; el('fb-'+qi).style.color = 'var(--red)'; }
  el('sol-'+qi).style.display = 'block';
  cur.ans[qi] = {id: c.id+'-Q'+(qi+1), a: L, ok: ok};
  cur.done++;
  upd();
  if(cur.done === c.questions.length) finish();
}
function upd(){ const c = DB[cur.i]; el('prog').textContent = `已作答 ${cur.done}/${c.questions.length}｜答對 ${cur.right} 題`; }
function finish(){
  const c = DB[cur.i];
  const best = +(localStorage.getItem('best_'+c.id)||0);
  if(cur.right > best) localStorage.setItem('best_'+c.id, cur.right);
  const f = el('finish');
  f.style.display = 'block';
  f.innerHTML = `<div style="margin-top:10px;padding:12px;border-radius:10px;background:${cur.right===c.questions.length?'#ecfdf5':'#fffbeb'}">
    ${cur.right===c.questions.length?'🎉 全對！這個觀念過關了':'💪 看完詳解後可以「再練一次」'}（答對 ${cur.right}/${c.questions.length}）
    <div id="postStatus" class="hint" style="margin-top:6px"></div></div>
    <div style="margin-top:10px"><button class="btn btn-blue" onclick="openU(${cur.i})">🔄 再練一次</button>
    <button class="btn btn-ghost" onclick="renderList()">← 回單元列表</button></div>`;
  submitRec(c);
  f.scrollIntoView({behavior:'smooth'});
}
function submitRec(c){
  if(!SUBMIT || SUBMIT.indexOf('http') !== 0) return;
  const st = el('postStatus');
  const rec = {v:1, quiz:'觀念-'+c.id.replace('CU-','')+'-'+c.name,
    cls:el('cls').value.trim(), seat:el('seat').value.trim(), name:el('name').value.trim(),
    ts_start:cur.t0.toISOString(), ts_submit:new Date().toISOString(),
    dur_s:Math.round((Date.now()-cur.t0.getTime())/1000),
    score:cur.right, total_auto:c.questions.length, answers:cur.ans.filter(Boolean)};
  if(!rec.cls && !rec.name){ st.textContent = 'ℹ 沒填班級姓名，這次成績只留在本機'; return; }
  st.textContent = '⏳ 成績上傳中…';
  // Apps Script 需用 text/plain 避免預檢請求
  fetch(SUBMIT, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(rec)})
    .then(r=>r.json())
    .then(j=>{ st.textContent = j.ok ? '✅ 成績已自動回傳老師' : '⚠ 上傳失敗：'+(j.error||''); })
    .catch(()=>{ st.textContent = '⚠ 上傳失敗（可能沒網路），成績仍留在本機'; });
}
renderList();
</script>
</body>
</html>"""

practice_html = (PRACTICE_TEMPLATE
                 .replace("__CONCEPTS__", json.dumps(concepts, ensure_ascii=False).replace("</", "<\\/"))
                 .replace("__SUBMITURL__", PRACTICE_SUBMIT_URL))
outp = BASE / "netlify_deploy" / "practice.html"
outp.write_text(practice_html, encoding="utf-8")
print("written", outp, f"{outp.stat().st_size/1024:.0f} KB")
