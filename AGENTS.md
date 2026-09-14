# AGENTS.md — 給接手這個專案的 AI agent

> 這份是**入口文件**。無論是 Codex、Claude Code 或其他 agent，開工前先讀完，再依需要跳到細節文件。
> 語言：所有回應、文件、程式註解一律**繁體中文**。

---

## 接手第一天：先做這五件事

1. `python scripts/config.py`（在 `會考題庫/`）——印出所有設定值與來源，**確認收卷網址不是空的**
2. `python scripts/selftest_all.py --quick`——確認環境跑得起來（缺套件會在這裡爆）
3. 讀 `會考題庫/handoff.md` **最後三段**（逐次紀錄，最新在檔尾），知道上一個 agent 做到哪
4. 掃一遍下面第 5 章「硬性規則」與 Obsidian `04 踩坑總表`
5. 確認你**動得了哪些東西**（見第 10 章「外部服務與權限」）——
   有些事只有老師本人能做（GAS 重新部署、Cloudflare 登入），你只能請他做

**最容易誤判的三件事**（新 agent 幾乎都會踩）：
- 一班一網址時**卷名帶班級後綴**（`…｜科資班`），批改指令的 `--quiz` 少了後綴會一筆都撈不到
- `0` 是合法級分，`0 or ""` 會把它吃掉
- 改 `Code.gs` 只存檔不會生效，**一定要重新部署新版本**（而且只有老師能做）

---

## 0. 六十秒摘要

**專案**：國中九年級（809／909 班）數學會考準備的數位工具總成。
**位置**：`G:\我的雲端硬碟\2026數學809\`，主要工作都在子資料夾 `會考題庫\`。
**版控**：`mathruffian-dot/triangle-geometry-8`（私有；repo 名與專案不符，是早期沿用）。

六個子系統：

| 子系統 | 一句話 | 進入點 |
|---|---|---|
| 題庫 | 103–115 官方試題 358 題（逐題切圖＋課綱標記＋詳解），連同模擬卷與自編題共 485 題 | `data/questions_*.json` |
| 線上作答站 | 學生用 iPad 作答，選擇題自動批改，非選可站內手寫或拍照上傳 | `scripts/build_quiz_site.py` |
| AI 批改閉環 | 交卷→圖存 Drive→AI 依評分規準初評→老師覆核→學生看紅筆批改 | `scripts/grade_essays.py` |
| 自動命題 | 模板卡＋生成器，無限產出風格與官方一致的新題（含配圖、詳解、評分規準） | `scripts/gen_choice.py`／`gen_essay.py` |
| 複習簡報 | 一～六冊全冊複習互動網頁，364 頁、169 頁可拖滑桿演示，六個獨立站台 | `複習網站*/index.html` |
| 教學影片 | PPTX 講義 → HTML5+GSAP 動畫 → 渲染成 mp4（含克隆語音配音） | `scripts/generator.py` |

前四個都在 `會考題庫/`，後兩個在專案根目錄，彼此獨立、不共用程式碼。

**沒有後端伺服器**：動態功能靠 Google Apps Script（免費）＋ Google 試算表（資料庫）＋ Google Drive（圖檔），
前端是純靜態 HTML 部署在 Cloudflare Pages。

---

## 1. 開工前先讀這些

| 什麼時候 | 讀哪一份 |
|---|---|
| **每次開工** | 本檔 ＋ `會考題庫/handoff.md` 的「⚡ 現況總覽」段 |
| 要動題庫／出卷／批改 | `會考題庫/handoff.md` 的待辦（有幾項要老師手動操作）|
| 要動命題模板 | `會考題庫/命題模板/命題公式分析報告.md` |
| **動手前掃一遍地雷** | Obsidian `2026數學809/04 踩坑總表.md` |
| 換電腦／交接／對外分享 | Obsidian `2026數學809/01 系統重建指南.md` |
| 命題系統技術細節 | Obsidian `2026數學809/02 自動命題系統.md` |
| 批改與評分規準 | Obsidian `2026數學809/03 非選AI批改與評分規準.md` |

Obsidian vault 在 `C:\Users\user\Documents\secondbrain\`，五份文件都在 `2026數學809/` 底下。
沒裝 Obsidian 也沒關係——那些就是純 Markdown 檔，直接開就能看。

**文件分工**：`CLAUDE.md` 放規劃藍圖／`handoff.md` 放進度交接／Obsidian 放系統文件。別放錯地方。

---

## 2. 環境

### 執行環境
- Windows 11 ＋ Python 3.14（`python` 可直接用）
- Shell：Git Bash 與 PowerShell 都可。**路徑含中文與空白，一律加引號**
- 慣例：先 `cd "G:/我的雲端硬碟/2026數學809/會考題庫"` 再跑腳本

### 套件
```bash
pip install -r requirements.txt
```
sympy／cairosvg／matplotlib／pillow／reportlab／pymupdf（import 名為 `fitz`）／requests／openai／fonttools

### 設定檔（重要）
所有「換人就要改」的值集中在 `scripts/config.py`：

```bash
python scripts/config.py
```

會印出每個值與**來源**。讀取順序：環境變數 `MATH809_*` → `data/config.json`（gitignore） → 內建預設。

管的東西：`submit_url`（GAS 收卷網址）、`quiz_project`／`bank_project`（Cloudflare 專案名）、
`quiz_site_url`／`bank_site_url`、`openai_env_file`、`grade_model`、`font_files`。

⚠ **不要把新的網址、專案名、字型路徑寫死在腳本裡**——加進 `config.py` 的 `DEFAULTS` 再從那裡取。
這件事踩過：GAS 網址曾寫死在 8 支腳本、字型路徑寫死在 4 支共 11 行。

### 字型（踩過很多次）
清單在 `config.json` 的 `font_files`。微軟正黑體**缺這些字**，用了會變 □ 方框：

```
⁴~⁹ 上標、≈、∼、⅔、−(U+2212)、✓、✗、≤、≥、⇒
```

**PIL 與 cairosvg 都不會自動 fallback**（兩個都實測過）。指數寫「10 的 n 次方」、約等於寫「約」。
可安全使用：`² ³ ° ∠ △ ≦ √ ×`

### 幾何渲染器
`scripts/vendor/geometry_renderer.py`（已隨專案附帶）。`figures.py` 先找 `vendor/`，
找不到才回頭找 `~/.claude-skills/jh-math-geometry/scripts/`。
⚠ **不要改 `~/.claude-skills/` 底下那份**——那是 chezmoi 管理的全域技能，更新會被蓋回去。

### API key
`~/.openai.env` 內含 `OPENAI_API_KEY=sk-...`（只有 AI 批改需要）。沒進版控。

---

## 3. 專案地圖

```
2026數學809/
├── AGENTS.md                    ← 你正在讀的這份
├── CLAUDE.md                    規劃藍圖、語言風格、地雷提醒
├── 會考題庫/                     ← 主要專案
│   ├── handoff.md               進度交接（逐次紀錄，最新在最下面）
│   ├── requirements.txt
│   ├── index.html               題庫網站（build 產物，不要手改）
│   ├── data/                    45 個 JSON
│   ├── scripts/                 39 支 Python（頂層）
│   ├── 01_題目圖片/              逐題切圖（103~115／HL*／GEN）
│   ├── 00_原始試題PDF/           官方試題
│   ├── 00_非選評分規準PDF/        官方評分指引
│   ├── 命題模板/                 分析報告；`_草稿/` 是設計中的卡（gitignore）
│   ├── apps_script/Code.gs      後端（貼到 Google Apps Script）
│   ├── quiz_site/ bank_site/    部署用資料夾（build 產物）
│   ├── redpen_out/              紅筆批改圖（**含學生個資**，gitignore）
│   └── backup/                  工具自動備份（gitignore）
├── 複習網站一〜六/                各冊複習簡報（第四冊資料夾名是「複習網站」沒有數字）
│   └── engine.js svg.js style.css index.html chN.js
├── 複習卷/                       老師丟進來的模擬卷 PDF（來源檔，未整理）
├── scripts/ working/ output/     教學影片製作（與會考題庫的 scripts/ 無關）
├── 出題/                        題庫匯出的 PDF
└── 01〜06_114國中數學2下*PDF/     課本／習作等原始 PDF（gitignore）
```

### 主要資料檔
| 檔案 | 內容 |
|---|---|
| `questions_103~115.json` | 官方歷屆題（課綱代碼、冊別章節、難度、詳解、逐步引導、陷阱）|
| `questions_HL1/HL2.json` | 翰林模擬卷（**版權屬翰林，勿散布**）|
| `questions_G*/M*/SIM*.json` | 自編生成題（`year` 欄＝批次代碼）|
| `text_104~115.json` | 官方題幹全文（PDF 抽取，供分析）|
| `curriculum_108.json` | 108 課綱學習表現／學習內容／冊別章節對照 |
| `essay_rubrics.json` | 非選評分規準（官方 26 題＋自編生成 8 題）|
| `templates_choice.json` | 選擇題模板卡 **29 張**（易 9／中 10／難 10）|
| `templates_essay.json` | 非選模板卡 **12 張**（每冊各 2、八種問法）|
| `concepts.json` | 觀念補強 56 單元 336 題 |
| `quizzes.json` | 卷的登錄檔（code／title／qids／classes）|
| `gen_log.json` | 已用過的生成參數簽章（避免出重複題）|
| `grade_cutoffs.json` | 會考等級門檻（7 個年度平均）|
| `config.json` | **本機設定，gitignore**（範本 `config.example.json`）|

---

## 4. 常用指令

先 `cd "G:/我的雲端硬碟/2026數學809/會考題庫"`。

### 題庫
```bash
python scripts/build_html.py        # 重建題庫網站（含單檔版）
python scripts/validate.py          # 題庫資料驗證
```

### 派卷給學生
```bash
python scripts/build_quiz_site.py
npx wrangler pages deploy quiz_site --project-name math809-quiz --branch main --commit-dirty=true
```
派卷前要先編 `data/quizzes.json` 加一筆（可加 `"classes":["909"]` 自動展開成各班專屬網址）。

### 自動命題
```bash
python scripts/gen_choice.py --list                   # 看模板卡
python scripts/gen_choice.py --paper 25 --tag M0901   # 依卷面藍圖生 25 題
python scripts/gen_choice.py --books B1,B2 --n 6      # 依進度限定冊別
python scripts/gen_essay.py --books B4,B5 --n 2       # 非選兩題
python scripts/try_card.py "命題模板/_草稿/新卡.json" --n 6   # 單卡自測
python scripts/merge_cards.py --all                   # 草稿併入正式庫（備份＋驗證）
python scripts/validate_templates_choice.py --n 30    # 改過模板卡就要跑
python scripts/validate_templates_essay.py --n 30
python scripts/figures.py --demo out                  # 17 種配圖元件自測
python scripts/selftest_all.py                        # 端到端自測
```

### AI 批改非選
```bash
python scripts/grade_essays.py --quiz "卷名"                # 增量，只批沒批過的
python scripts/grade_essays.py --quiz "卷名" --transcribe   # 只補 AI 辨識內容
python scripts/make_redpen.py --quiz "卷名"                 # 紅筆圖＋續寫解答，自動上傳
python scripts/make_feedback_pdf.py --quiz "卷名"           # 個人回饋單 PDF
python scripts/make_review_sheet.py --quiz "卷名"           # 覆核彙整頁
```
⚠ 一班一網址時卷名會帶「｜<班級>班」後綴，`--quiz` 要用**完整名稱**，且**一個班跑一次**。

### 部署
```bash
npx wrangler pages deploy quiz_site --project-name math809-quiz --branch main --commit-dirty=true
npx wrangler pages deploy bank_site --project-name math809-bank --branch main --commit-dirty=true
```
❌ 不要用 Netlify（免費改 credit 制，每月 300、每次部署扣 15）。`deploy_bank.py` 已停用。

### 新增一份模擬卷：從 PDF 到上線（做過兩次，照這個順序走）

老師會丟三份 PDF（題本／解答篇／非選樣卷說明）。整套走完約 40 分鐘，其中大半是逐題寫詳解。

**① 先確認這份是什麼、有沒有做過**
```bash
python -c "import fitz; d=fitz.open(r'題本.pdf'); d[0].get_pixmap(dpi=110).save('p1.png')"
```
看封面：**年度**（如「113 國中教育會考模擬測驗」）、**左下角出版社**、**條碼末碼**
（翰林：110→-30、111→-31、113→-33）。
⚠ 翰林各年度的**檔名完全一樣**，只能靠封面辨識；資料夾名不可信（曾出現寫「113平孚」其實是翰林，
「平浮」是印刷版本標記不是出版社）。再比對 `data/questions_HL*.json` 確認沒建過。

**② 題號前綴用年度：`HL<年度>`**
現有 `HL1`＝110 年、`HL2`＝111 年是早期命名，**新的一律 `HL113` 這種形式**
（若用流水號，跳過的年度會讓序號和年度對不上）。
非第1次的卷加次數：`HL110T3`＝110 年第3次（1~4冊）。前綴**不可含「-」**（程式用 `-` 切 qid）。
題組題幹（「請閱讀下列敘述後，回答第24、25題」）若在頁中，裁切腳本會讓前一題在題幹前截止（2026-09-14 修正）。

**③ 切圖**（AI 逐頁定位題號 y 座標，再依座標裁切；共用題幹會自動併到相關各題）
```bash
python scripts/crop_hanlin.py --prefix HL113 --book "…/題本.pdf" --probe   # 先定位，存 data/hanlin_layout_HL113.json
python scripts/crop_hanlin.py --prefix HL113 --book "…/題本.pdf"           # 再切圖 → 01_題目圖片/HL113/
```
定位結果會印出來（`p2: header@0.079 1@0.135 …`），**確認 1~25＋N1＋N2 都在**再切。
切完**每張都要目視**（順便取得題目內容寫詳解）。

**④ 讀解答篇**：渲染成圖後**目視**讀標準答案表與逐題解析
（⚠ PDF 文字層解析曾在 113 年錯位 5 題，一律以圖為準）。非選的官方逐級分評分指引在解答篇末與樣卷說明裡。

**⑤ 寫 `data/questions_HL113.json`**：欄位照既有檔案
（`id/year/num/type/img/answer/codes/perf/book/chapter/topic/difficulty/solution/steps/trap/source`）。
- `codes`／`perf` 要對得上 `data/curriculum_108.json`，`chapter` 必須是該冊的標準章名（validate 會擋）
- **答案要逐題和標準答案表核對，解法自己重算一遍**（別只抄解析）

**⑥ 非選評分規準**：把官方逐級分指引原文寫進 `data/essay_rubrics.json`
（`guide.l3/l2/l1/l0` ＋ 自行拆解的 `checkpoints`），AI 批改與覆核頁才吃得到。

**⑦ 註冊到系統**（來源標籤與自動掃描）
- `scripts/build_html.py` 的 `SRCLBL` 與 `YRLBL` 各加一筆 `HL113:'翰林模擬 113'`
  （否則學生卷與題庫選單會顯示「HL113年」）
- `scripts/validate.py` 自動掃描所有 `questions_*.json`，新增來源不需另列清單
- 題目檔本身不必註冊，`build_html.py` 會自動 glob 掃描 `data/questions_*.json`

**⑧ 派卷**：`data/quizzes.json` 加一筆
```json
{"code":"hanlin-113","title":"翰林模擬會考 113年第1次（第1~2冊）",
 "qids":["HL113-01",...,"HL113-N2"],"print":true,"listed":true,
 "classes":["kz"],"class_labels":{"kz":"科資"}}
```
`classes` 會展開成一班一網址（班級內建鎖定，學生只填座號）；
`class_labels` 只美化標題顯示，**寫進試算表的班級值仍是代號**。
⚠ 卷名是試算表的 key，**上線後不要改**，否則對不上既有紀錄。

**⑨ 驗證 → 建置 → 部署**
```bash
python scripts/validate.py && python scripts/validate_essay_rubrics.py
python scripts/build_quiz_site.py
# 部署前用 node --check 驗 JS（題庫站要排除 base64／json 那兩個 script 區塊，它們不是 JS）
npx wrangler pages deploy quiz_site --project-name math809-quiz --branch main --commit-dirty=true
```
部署後 CDN 要幾十秒才切換，**用檔案大小確認**（回傳大小和首頁一樣＝還沒切到新版）：
```bash
until [ "$(curl -s -o /dev/null -w '%{size_download}' https://math809-quiz.pages.dev/q/<代碼>/)" -gt 100000 ]; do sleep 10; done
```

**⑩ 來源 PDF** 複製一份到 `00_原始試題PDF/<出版社><年度>/`。
該資料夾被 `.gitignore` 的 `*.pdf` 排除（版權：試題屬出版社，僅供班級教學）。

### 考試中即時批改（學生陸續交卷時）

批改腳本是**增量**的（只批 `AI級分` 為空的），所以可以放心重複跑。要邊考邊批就輪詢：
每 2 分鐘查一次未批份數，有就批改＋產紅筆圖，跑完立刻再查一次（接住批改期間新交的卷）。

**平行度用 `--jobs`，不要開 subagent。** 瓶頸是 OpenAI 的視覺推理呼叫（I/O bound），
兩支腳本都內建 `ThreadPoolExecutor`；開多個 subagent 只會各自跑同一支腳本、
**重複批到同一批資料**還互相搶著寫試算表。

| 待批份數 | `grade_essays --jobs` | `make_redpen --jobs` |
|---|---|---|
| ≥24 | 8 | 5 |
| ≥12 | 6 | 4 |
| ≥5 | 4 | 3 |
| <5 | 2 | 2 |

上限壓在 8 是因為**沒有 429 重試機制**。但有天然保險：單次呼叫失敗只是那一票作廢，
三票全掛才算失敗，而**失敗的份數不會回寫**，下一輪輪詢會自動重批 → 不會漏，只會慢一輪。
30 人（60 份、180 次呼叫）用 8 條線約 10~15 分鐘，序列跑要 1.5 小時。

---

## 4.5 另外兩個子系統（不在 `會考題庫/` 底下）

前面講的都是會考題庫。專案根目錄還有兩塊獨立的東西，**接手時容易漏掉**。

### 複習簡報（一～六冊，六個站台）

| 冊別 | 資料夾 | 章節檔 | 網址 |
|---|---|---|---|
| 一（七上） | `複習網站一/` | 3 | https://math809-review1.pages.dev |
| 二（七下） | `複習網站二/` | 6 | https://math809-review2.pages.dev |
| 三（八上） | `複習網站三/` | 5 | https://math809-review3.pages.dev |
| 四（八下） | `複習網站/` ⚠**沒有數字** | 4 | https://math809-review.pages.dev |
| 五（九上） | `複習網站五/` | 3 | https://math809-review5.pages.dev |
| 六（九下） | `複習網站六/` | 3 | https://math809-review6.pages.dev |

合計 364 頁、約 169 頁有滑桿互動。**可以直接發給學生**（沒有答案外洩問題）。

**架構**：純前端靜態網頁，零建置、零金鑰。唯一外部相依是 MathJax（數學排版，需連網）。
```
index.html   外殼＋目錄＋載入 chN.js
engine.js    簡報引擎 508 行（翻頁、縮放、雷射筆、畫筆、放大）
svg.js       173 行，共用繪圖工具
style.css    544 行
chN.js       各章內容（一頁一物件，改內容只動這裡）
```

⚠ **六冊共用同一套引擎**：改 `engine.js`／`svg.js`／`style.css` 要**六個資料夾一起複製**，再各自部署。
⚠ **改完 `chN.js` 一定要 bump `index.html` 的 `?v=` 版本號**（目前六冊都是 `?v=20260723`，
每冊約 49 處），否則學生的瀏覽器會拿到快取的舊章節，看起來像沒改到。

**部署**（Cloudflare 為主，一冊一個專案）：
```bash
npx wrangler pages deploy "複習網站六" --project-name math809-review6 --branch main --commit-dirty=true
```
⚠ 各冊 README 裡寫的 Netlify 兩段式部署（`restoreSiteDeploy`）是**舊做法**，Netlify 站僅作備援、不再更新。
⚠ 首次部署後 20～60 秒可能回 522（邊緣節點傳播中），稍候重整即可。

**要新增或大改一冊**：有現成的 `math-review-deck` 技能（全域 skill），
說「做一份第 N 冊的複習簡報」就會走完整流程，不必從零刻。

### 教學影片製作（PPTX → 動畫影片）

| 檔案 | 作用 |
|---|---|
| `教學影片製作規格書.md`（根目錄，85 行） | 視覺／語音／動畫的完整規格 |
| `scripts/SPECIFICATION.md`（86 行） | 技術規格 |
| `scripts/generator.py`（408 行） | 產生器 |
| `scripts/video_configs.json` | 影片設定（目前 2 個：`q1`、`q2`）|
| `working/` `output/` | 中間產物與成品（`output/` 下有 10 個 render_* 資料夾）|

**流程**：HTML5＋GSAP 動畫 → `npx hyperframes render` 渲染 →
FFmpeg 無損混音（`-c:v copy -c:a aac`）→ 1920×1080 mp4。配音用「三師爸」克隆聲音，
但**口白人設是「數學老師」**（規格書明訂，不可自稱三師爸）。**不上字幕**（避免擋住幾何圖）。

影片的機器路徑集中在根目錄 `scripts/config.py`，與會考題庫的設定互相獨立。
覆寫順序：`MATH809_VIDEO_*` 環境變數 → `scripts/video_runtime.local.json` → 目前使用者／專案相對位置預設。
範本為 `scripts/video_runtime.example.json`；原始 PPTX 必須指定 `pptx_path`，有快取底圖時可免匯出。
製作前跑 `python scripts/generator.py q1 --check`；通過只代表路徑與快取可用，尚不代表語音模型或渲染已驗證。

---

## 5. 硬性規則（違反會出事）

1. **AI 生圖不可用於批改**。實測 gpt-image-2 會「重畫」整張圖，4 份樣本 2 份**竄改學生內容**
   （等號被改成 ≠、手寫被抹除）。一律用 `annotate_redpen.py` 程式化疊加，原圖逐位元不動（`--verify` 可驗）。
2. **產生 HTML/JS 後要 `node --check`**，不要只靠肉眼。曾因跳脫字元寫錯導致整頁 JS 失效。
3. **`0` 是合法級分**。JS 的 `0 || ''`、Python 的 `0 or ""` 都會把 0 當空值，要顯式判斷。
4. **班級／座號要正規化**（去前導零）再比對。Google Sheets 會把 `"09"` 轉成數字 9。
5. **改了 `apps_script/Code.gs` 一定要重新部署新版本**（部署→管理部署作業→編輯→新版本→部署）。
   只存檔不會生效，網址不變。貼檔給老師時直接傳檔案，並請他確認行數與關鍵字數量（Drive 同步會給舊版）。
6. **自動生成的選擇題要防「多重正解」**。干擾項可能也符合題意（夾擠型踩過一次，四個選項三個都對）。
   驗證器抓不到 → 新模板卡上線前**要人工或請另一個 AI 逐題審**。
7. **干擾項池要有大有小**（比正解大的至少 3 個、比正解小的也至少 3 個），
   否則某個字母永遠出不來，全卷 A/B/C/D 會失衡。
8. **要湊整數解時，由結果反推參數**。讓多個參數各自隨機再篩，命中率會低到 1% 以下
   （民調加權卡踩過，400 次抽樣只生出 2 題；改成反推後拉到 40%）。
9. **判斷型題目要讓兩種結論都可能出現**，否則學生用猜的就對。
   驗證器的「結論恆為 X」警告就是在抓這個。
10. **GDrive 幽靈檔**：commit 失敗時刪 `.git/index.lock` 再試。
    同理 `.git/objects/` 會累積 `tmp_obj_*` 殘留（Google Drive 同步打斷 git 寫入所致，
    `git count-objects -v` 會報 garbage found）。**無害**，要清就在同步完成時跑
    `git gc --prune=now`；⚠ 不要在 Drive 正在同步時做，中途被打斷可能弄壞 repo。
11. **學生個資**：`redpen_out/`、回饋單 PDF 含姓名座號與手寫作答，**不可上傳公開處**。
12. **版權**：官方試題屬心測中心、翰林模擬卷屬翰林，僅供班級教學使用，勿散布樣卷影像。

更完整的 40+ 條見 Obsidian `04 踩坑總表`。

---

## 6. 多 agent 協作規則

這個專案**常有多個 agent 同時工作**（例如一個做命題系統、一個做批改功能）。

1. **開工先讀 `會考題庫/handoff.md`**，看別人做到哪。
2. **動共用檔案前先讀最新內容**（`build_html.py`、`handoff.md`、`data/*.json` 最常被同時改）。
3. **有進度就往 `handoff.md` 檔尾追加一段**（格式 `### ✅ 日期 標題`），寫清楚：
   做了什麼、為什麼這樣做、踩到什麼坑、怎麼驗證的。**不要改別人寫的段落**。
4. **commit 時只 add 自己動過的檔案**。共用檔案（如 `handoff.md`）若混了別人的變更，
   用「取 HEAD 版本 ＋ 自己新增的段落 → `git hash-object -w` → `git update-index --cacheinfo`」
   的方式只提交自己那一段（`handoff.md` 裡有實際用過的腳本可參考）。
5. commit 訊息用繁體中文，說清楚「為什麼」而不只是「改了什麼」。

---

## 7. 目前狀態（2026-09-06）

### 規模
題庫 539 題（官方 358＋翰林 135＋自編 46）｜選擇模板 29 張｜非選模板 12 張｜配圖元件 17 種｜
評分規準 42 題（官方 26＋翰林 10＋自編 6）｜觀念補強 56 單元 336 題｜Python 腳本頂層 39 支（另有 vendor）
翰林卷：HL1（110年）、HL2（111年）、HL112（112年）、HL113（113年）、HL110T3（110年第3次・1~4冊）各 27 題

### 最近一次實戰（2026-08-31，翰林 113 科資班）
9 人 18 份非選，邊考邊批（每 2 分鐘輪詢一次，交卷後約 2 分鐘出批改與紅筆圖）。
AI 初評平均 5.22/6，五人滿分。全程 0 份漏批、0 份缺紅筆圖。
這是目前驗證過的完整閉環：**交卷 → AI 批改 → 紅筆圖含續寫解答 → 老師覆核 → 學生查成績看等級**。

### 線上網址
| 網址 | 用途 |
|---|---|
| https://math809-quiz.pages.dev | 學生作答站（`/q/<卷代碼>/`）|
| https://math809-bank.pages.dev | 題庫＋出卷＋非選覆核（**含詳解，勿發學生**）|
| https://math809-review1〜6.pages.dev | 一～六冊複習簡報（第四冊為 `math809-review`）|
| 收卷試算表（連結見 Obsidian `2026數學809/` 系統文件，不進公開 repo） | 作答紀錄／逐題明細／非選作答／出題紀錄 |

### 待辦
- [ ] 把 `data/questions_SIM115.json`（25 選擇＋2 非選的完整模擬卷）派給學生試作，
      **開始累積評分規準的校準資料**——這是目前唯一能補上「官方樣卷那一層」的路徑
- [ ] 回饋單已可合併選擇題並顯示參考等級；待老師使用實際完整覆核卷驗收（離線回歸已涵蓋零分／缺漏／跨卷配對）
- [ ] 觀察 AI 初評與老師覆核的差異，反過來修模板卡的錨點與 `common_errors`
- [ ] 座號格式不一致：翰林 113 那場 9 人裡，5 人填 1~2 位數、4 人填 5 位數（原班級＋座號）。
      **影響學生查成績要填一模一樣的座號**才查得到，尚未統一（老師說先不動）
- [ ] 翰林 113 卷的老師覆核尚未進行（AI 初評已完成，6 份低信心待確認，最低 0.46）

---

## 8. 驗收方式

改完任何東西，跑這一支：

```bash
python scripts/selftest_all.py        # 加 --quick 可跳過重建題庫那步
```

依序檢查：所有題庫 JSON → 非選評分規準 → 離線回歸 → 七支批改 CLI 啟動 → 17 種圖元件 → 模板驗證 →
生成 25 題選擇卷與 2 題非選卷（dry run）→ 建題庫 → 題庫、根目錄與六冊網頁的 `node --check`。
`--quick` 只跳過重建，其他檢查照跑；模板警告需另外審查。
**看到「✓ 全部通過」才算完成。**

---

---

## 9. 外部服務與權限（交接必看）

這套系統**沒有自己的伺服器**，所有動態功能都掛在老師的個人帳號下。
接手的 agent **不會自動擁有這些權限**，動手前先確認哪些做得到。

| 服務 | 用途 | 帳號／位置 | agent 能不能自己來 |
|---|---|---|---|
| **GitHub** | 版控備份 `mathruffian-dot/triangle-geometry-8`（私有）| `mathruffian-dot` | ✅ 可（gh CLI 已登入）|
| **Cloudflare Pages** | 八個站台：quiz／bank／review1~6 | mathruffian@gmail.com | ✅ 可（wrangler 已登入）|
| **Google Apps Script** | 後端「會考題庫收卷 v1」，`apps_script/Code.gs` 的線上版 | mathruffian@gmail.com | ❌ **只有老師能重新部署** |
| **Google 試算表** | 資料庫：作答紀錄／逐題明細／非選作答／出題紀錄 | 同上 | ⚠ 可透過 GAS 讀寫，但**沒有刪除接口** |
| **Google Drive** | 學生手寫圖與紅筆批改圖（「會考題庫非選作答」資料夾）| 同上 | ⚠ 只能透過 GAS 寫入，agent 無直接刪除權 |
| **OpenAI API** | AI 批改與紅筆標註定位 | `~/.openai.env`（未進版控）| ✅ 可（有 key 就能用，**會花錢**）|
| Netlify（舊） | 早期站台，**保留不動、不再更新** | 另一個帳號 gameruffian@gmail.com | ❌ 不要碰 |

### 換一台電腦要手動補的
`~/.openai.env`（AI 批改）、`~/.groq_api_key`、`~/.kie.env`。
其餘設定走 chezmoi 同步；專案檔案走 Google Drive 自動同步。
⚠ 兩台電腦的使用者名稱不同（`user`／`mathr`），**路徑不要寫死 `C:\Users\<名稱>`**。

### 要「整套搬給別人用」
讀 Obsidian `01 系統重建指南.md`。重點：複製 `data/config.example.json` 成 `config.json`
填自己的 GAS 網址與 Cloudflare 專案名即可，程式不必改
（這件事已經整理過——收卷網址原本寫死在 8 支腳本裡，現在集中在 `scripts/config.py`）。

### 花錢的地方
只有 OpenAI：批改一份約 NT$0.3（3 次投票），紅筆標註每份再一次。
一場 30 人的考試（60 份非選）約 NT$40~60。其餘全部免費（GAS、試算表、Drive、Cloudflare Pages 都在免費額度內）。

---

## 10. 禁止事項

- ❌ 把 GAS 網址、Cloudflare 專案名、字型路徑寫死在腳本裡（一律走 `config.py`）
- ❌ 改 `~/.claude-skills/` 底下的檔案（chezmoi 管理，更新會被蓋掉）
- ❌ commit `data/config.json`、`redpen_out/`、`命題模板/_草稿/`、`backup/*_備份_*.json`
- ❌ 用 AI 生圖去改學生的作答圖
- ❌ 未經老師確認就部署到線上、或動 Google 試算表的既有資料
- ❌ 把含詳解的題庫站網址發給學生
