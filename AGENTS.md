# AGENTS.md — 給接手這個專案的 AI agent

> 這份是**入口文件**。無論是 Codex、Claude Code 或其他 agent，開工前先讀完，再依需要跳到細節文件。
> 語言：所有回應、文件、程式註解一律**繁體中文**。

---

## 0. 六十秒摘要

**專案**：國中九年級（809／909 班）數學會考準備的數位工具總成。
**位置**：`G:\我的雲端硬碟\2026數學809\`，主要工作都在子資料夾 `會考題庫\`。
**版控**：`mathruffian-dot/triangle-geometry-8`（私有；repo 名與專案不符，是早期沿用）。

四個子系統：

| 子系統 | 一句話 | 進入點 |
|---|---|---|
| 題庫 | 103–115 官方試題 358 題（逐題切圖＋課綱標記＋詳解），連同模擬卷與自編題共 456 題 | `data/questions_*.json` |
| 線上作答站 | 學生用 iPad 作答，選擇題自動批改，非選可站內手寫或拍照上傳 | `scripts/build_quiz_site.py` |
| AI 批改閉環 | 交卷→圖存 Drive→AI 依評分規準初評→老師覆核→學生看紅筆批改 | `scripts/grade_essays.py` |
| 自動命題 | 模板卡＋生成器，無限產出風格與官方一致的新題（含配圖、詳解、評分規準） | `scripts/gen_choice.py`／`gen_essay.py` |

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
│   ├── scripts/                 38 支 Python
│   ├── 01_題目圖片/              逐題切圖（103~115／HL*／GEN）
│   ├── 00_原始試題PDF/           官方試題
│   ├── 00_非選評分規準PDF/        官方評分指引
│   ├── 命題模板/                 分析報告；`_草稿/` 是設計中的卡（gitignore）
│   ├── apps_script/Code.gs      後端（貼到 Google Apps Script）
│   ├── quiz_site/ bank_site/    部署用資料夾（build 產物）
│   ├── redpen_out/              紅筆批改圖（**含學生個資**，gitignore）
│   └── backup/                  工具自動備份（gitignore）
├── 複習網站一〜六/                各冊複習簡報（共用引擎，改引擎要六份一起改）
└── 出題/                        題庫匯出的 PDF
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
10. **GDrive 幽靈鎖檔**：commit 失敗時刪 `.git/index.lock` 再試。
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

## 7. 目前狀態（2026-08-07）

### 規模
題庫 456 題（官方 358＋翰林 54＋自編 44）｜選擇模板 29 張｜非選模板 12 張｜配圖元件 17 種｜
評分規準 34 題（官方 26＋自編 8）｜觀念補強 56 單元 336 題｜Python 腳本 38 支

### 線上網址
| 網址 | 用途 |
|---|---|
| https://math809-quiz.pages.dev | 學生作答站（`/q/<卷代碼>/`）|
| https://math809-bank.pages.dev | 題庫＋出卷＋非選覆核（**含詳解，勿發學生**）|
| https://math809-review1〜6.pages.dev | 一～六冊複習簡報（第四冊為 `math809-review`）|
| [收卷試算表](https://docs.google.com/spreadsheets/d/1vZg5vVUTym__8Fhht5vWeDq1Y6v5QOavIr-E-06DvDY/edit) | 作答紀錄／逐題明細／非選作答／出題紀錄 |

### 待辦
- [ ] 把 `data/questions_SIM115.json`（25 選擇＋2 非選的完整模擬卷）派給學生試作，
      **開始累積評分規準的校準資料**——這是目前唯一能補上「官方樣卷那一層」的路徑
- [ ] 題庫站與學生站尚未重新部署（自編生成題目前只在本機 `index.html`）
- [ ] 觀察 AI 初評與老師覆核的差異，反過來修模板卡的錨點與 `common_errors`

---

## 8. 驗收方式

改完任何東西，跑這一支：

```bash
python scripts/selftest_all.py        # 加 --quick 可跳過重建題庫那步
```

依序檢查：17 種圖元件都渲染得出來 → 非選模板驗證 → 選擇題模板驗證 →
生成 25 題選擇卷與 2 題非選卷（dry run）→ 建題庫 → `node --check` 驗 JS。
**看到「✓ 全部通過」才算完成。**

---

## 9. 禁止事項

- ❌ 把 GAS 網址、Cloudflare 專案名、字型路徑寫死在腳本裡（一律走 `config.py`）
- ❌ 改 `~/.claude-skills/` 底下的檔案（chezmoi 管理，更新會被蓋掉）
- ❌ commit `data/config.json`、`redpen_out/`、`命題模板/_草稿/`、`backup/*_備份_*.json`
- ❌ 用 AI 生圖去改學生的作答圖
- ❌ 未經老師確認就部署到線上、或動 Google 試算表的既有資料
- ❌ 把含詳解的題庫站網址發給學生
