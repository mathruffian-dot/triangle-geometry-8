# 會考題庫建置 — 進度交接

> ⚡ **新接手的 agent（Codex／Claude Code／其他）先讀專案根目錄的 `AGENTS.md`**，那是入口文件。
> 本檔是**逐次工作紀錄，時間序由上而下、最新在最下面**。
> ⚠ 底下最前面幾段是 2026-07-13 的舊狀態（**當時還在用 Netlify、也還沒有自動命題系統**），
> 保留是為了追溯歷史，**不代表現況**。要看現況請讀下面這一段。

---

## ⚡ 現況總覽（2026-08-07）

### 這個專案是什麼
809／909 班數學會考準備的數位工具總成，四塊：**題庫**、**線上作答站**、**AI 批改閉環**、**自動命題系統**。
沒有後端伺服器——靠 Google Apps Script ＋ Google 試算表 ＋ Drive，前端是靜態 HTML 部署在 Cloudflare Pages。

### 規模
| 項目 | 數量 |
|---|---|
| 題庫題目 | 456（官方歷屆 358＋翰林模擬 54＋自編生成 44）|
| 命題模板卡 | 選擇 29 張（易 9／中 10／難 10）、非選 12 張（每冊各 2、八種問法）|
| 配圖元件 | 17 種 |
| 非選評分規準 | 34 題（官方 26＋自編生成 8）|
| 觀念補強 | 56 單元 336 題 |
| Python 腳本 | 38 支 |

### 線上網址（現行主力，都在 Cloudflare Pages）
| 網址 | 用途 | 給誰 |
|---|---|---|
| https://math809-quiz.pages.dev | 學生作答站（`/q/<卷代碼>/`）| 學生 |
| https://math809-bank.pages.dev | 題庫＋出卷＋非選覆核（**含詳解，勿發學生**）| 老師 |
| https://math809-review1〜6.pages.dev | 一～六冊複習簡報（第四冊為 `math809-review`）| 學生 |
| [收卷試算表](https://docs.google.com/spreadsheets/d/1vZg5vVUTym__8Fhht5vWeDq1Y6v5QOavIr-E-06DvDY/edit) | 作答紀錄／逐題明細／非選作答／出題紀錄 | 老師 |

> 舊的 Netlify 站保留不動、勿更新（免費改 credit 制，每月 300、每次正式部署扣 15）。

### 最常用的指令
```bash
cd "G:/我的雲端硬碟/2026數學809/會考題庫"

python scripts/config.py                              # 先確認設定（GAS 網址、專案名、字型）
python scripts/selftest_all.py                        # 端到端自測，改完任何東西都跑這個

python scripts/gen_choice.py --paper 25 --tag M0901   # 生一份 25 題模擬卷
python scripts/gen_essay.py --books B4,B5 --n 2       # 生兩題非選
python scripts/build_html.py                          # 重建題庫網站
python scripts/build_quiz_site.py                     # 建學生作答站

python scripts/grade_essays.py --quiz "卷名"           # AI 批改非選（增量）
python scripts/make_redpen.py --quiz "卷名"            # 紅筆批改圖＋續寫解答
```

### 目前待辦
- [ ] 把 `data/questions_SIM115.json`（25 選擇＋2 非選的完整模擬卷）派給學生試作，
      **開始累積評分規準的校準資料**——這是目前唯一能補上「官方樣卷那一層」的路徑
- [ ] 題庫站與學生站尚未重新部署（自編生成題目前只在本機 `index.html`）
- [ ] 觀察 AI 初評與老師覆核的差異，反過來修模板卡的錨點與 `common_errors`

### 需要老師手動操作的事（agent 做不到）
- 改了 `apps_script/Code.gs` → 老師要在 Apps Script 網頁按「部署→管理部署作業→編輯→新版本→部署」
- 部署到線上（`npx wrangler pages deploy`）建議先問過老師
- OpenAI API key 在 `~/.openai.env`，換電腦要自己建

### 其他文件
| 放哪 | 內容 |
|---|---|
| `../AGENTS.md` | **入口文件**：環境、地圖、指令、硬性規則、多 agent 協作規則 |
| `../CLAUDE.md` | 規劃藍圖、語言風格、地雷提醒 |
| 本檔（下方） | 逐次工作紀錄，最新在最下面 |
| Obsidian `2026數學809/` | 系統文件五份：專案工作流程／01 系統重建指南／02 自動命題系統／03 非選AI批改與評分規準／04 踩坑總表 |

---

## 📜 以下是逐次工作紀錄（時間序，最舊在上）


## 狀態：✅ 全部完成（2026-07-13，Claude）

103–115 年會考數學 358 題（選擇 332＋非選 26）題庫已建置完成：

- [x] 官方 PDF 下載（26 檔）→ `00_原始試題PDF/`
- [x] 逐題切圖 358 張（103–106 去浮水印）→ `01_題目圖片/`
- [x] 官方答案逐年目視核對 → `data/official_answers.json`
- [x] 108課綱對照表 → `data/curriculum_108.json`
- [x] 逐題標記＋詳解＋逐步引導 → `data/questions_{103..115}.json`
- [x] HTML 題庫（篩選/出卷列印/統計）→ `index.html`
- [x] 檢查兩遍：validate.py 全過 ×2、瀏覽器功能實測、切圖對位抽查

## 重要教訓（後續維護必讀）
1. 官方答案 PDF 的文字解析在 113 年錯位 5 題 → 已全部改以「答案表圖片目視」為準
2. crop_questions.py 曾有跨年度頁面快取污染 bug（id(doc) 重複）→ 已修復；新增年度務必抽查切圖
3. 103–106 官方檔為「新聞用試題本」含粉紅浮水印 → 以像素規則去除（scripts/crop_103.py 的 clean_page 邏輯）
4. 106 Q24 的隔板是「斜的」（左區平均寬 120、右區 80）→ 這類圖形陷阱要看圖驗證

## 2026-07-13 增修（第二輪）
- 篩選新增「最近N屆」（R3/R5/R10）與「題號範圍」（1-10、3,5,7-9 格式）
- 「🌐 匯出線上試卷」：勾選題目 → 產生 iPad 可作答單檔（班級/座號/姓名、自動批改選擇題、
  作答紀錄 base64/JSON 輸出、localStorage 防斷線、CONFIG.submitUrl 預留後端 POST 接口）
- `netlify_deploy/index.html` = 示範卷（最近5屆1-10題）
- **兩個線上網址**（帳號 mathruffian）：
  - 學生作答卷：https://math809-quiz.netlify.app （math809-quiz，ID 05be96f6-da95-4687-b3d5-39329a05220d）
  - 題庫系統：https://math809-bank.netlify.app （math809-bank，ID afba03cf-46f7-4ab5-8b0d-54d6523fe98d，含全部詳解，**公開網址勿發給學生**）
- 換新卷：新試卷放進 netlify_deploy/index.html → 在會考題庫資料夾 `netlify deploy --dir netlify_deploy --prod`
  （資料夾 netlify link 綁的是 quiz 站）
- 更新題庫網站：`python scripts/deploy_bank.py`（暫存區組裝 index.html+圖片，--site 明確指定 bank 站）
- 圖片全面優化 33MB→9.6MB；index.html 加缺圖提示與 0 題提示；列印前強制載圖
- 作答紀錄 schema 見 README「預留後端接口」段

## 2026-07-15 試算表收卷已正式部署 ✅
- Apps Script 專案：「會考題庫收卷」（帳號見 Obsidian，執行身分：我、存取：所有人）
- **收卷網址（系統用，題庫設定與 CONFIG.submitUrl 一律貼這個完整網址）**：
  `https://script.google.com/macros/s/AKfycbw-ePEfCoTB3SpwOh4g0IcfwsQWanQm8bvXgOGDdIECkK2845qIoKhH9xtRNuxu29wN/exec?token=math809`
- 短網址（僅供人工用瀏覽器開來看紀錄）：https://tinyurl.com/23739jgz
  ⚠️ 短網址經 301 轉址會把 POST 變 GET，**不可**填入題庫設定或 submitUrl，否則學生交卷上傳會失敗
- 收卷試算表「會考題庫作答紀錄」（作答紀錄＋逐題明細兩張表，setup 已初始化完成）：
  https://docs.google.com/spreadsheets/d/1vZg5vVUTym__8Fhht5vWeDq1Y6v5QOavIr-E-06DvDY/edit
- 常用查詢：`…exec?token=math809&list=1`（全部紀錄 JSON）、`&quiz=卷名`、`&cls=班級` 可過濾
- 改 Code.gs 後要「部署 → 管理部署作業 → 編輯 → 新版本 → 部署」網址內容才會更新
- ⚠️ Apps Script 專案裡有**兩個**部署作業：「會考題庫收卷 v1」（上面的正式網址）和「未命名」
  （7/15 授權時多按出來的，`AKfycbwD-6…` 開頭，沒人在用）——更新版本時認明「會考題庫收卷 v1」，
  「未命名」可以在管理部署作業中封存

## 2026-07-15 出題紀錄（防重複出題）✅
出卷當下即記錄，不用等學生交卷；已端對端測試（記錄→試算表→徽章→篩選→清除）。
- **記錄時機**：「🌐 匯出線上試卷」與「🖨 列印勾選題目（題目卷）」（含詳解版視為老師自用、不記）
- **儲存**：本機 localStorage `assignedLog` ＋ POST `{kind:'assign', quiz, mode, ids}` 寫入試算表
  「出題紀錄」表（一列一題）；開頁自動 `?assigned=1` 同步回來，跨裝置不漏
- **畫面**：題目標「🖊 已出過」（tooltip 列出卷名）；篩選勾「排除已出過/已做過」＝已出過∪已做過都排除
- **取消已出過**：試算表「出題紀錄」表刪該列 → 題庫「錯題分析」頁按「🧹 清除本機出題紀錄」重新同步
- 後端 doPost 支援 `kind:'assign'`、doGet 支援 `&assigned=1`（部署版本 3 版起）
- 題庫的收卷網址設定（cfgUrl）**必須含 `?token=math809`**——7/15 曾誤存「未命名」部署的裸網址導致 token 錯誤，已修正

## 2026-07-15 個人作答分析（指定班級/座號）✅
學生交卷自動進試算表後，**不再需要學生手動交紀錄**（貼上作答紀錄框只是備援）。
- 「☁ 從試算表載入紀錄」旁新增**班級、座號**篩選欄（班級走後端 `&cls=`，座號前端過濾）
- 「學生摘要」表**每列可點** → 展開該學生「個人分析」：
  - 做題履歷：作答卷數、選擇題總數、答對率、各卷得分表（就目前載入的紀錄計算）
  - 錯題清單（跨卷去重、含詳解）＋每題「(a) 精熟練習 / (b) 類題推薦」＋勾選出**個人補強卷**
- 已用模擬紀錄端對端測試（分組、答對率、錯題卡、推薦、座號過濾），未污染試算表
- 前端改動都在 scripts/build_html.py（搜 `showStudent` / `stuCard` / `STU`），後端 Code.gs 這輪沒動

## 2026-07-15 觀念補強題庫（打樣）✅
針對學習落後學生的「單一學習表現」補強：白話說明＋簡單單選精熟練習（立即回饋），與歷屆試題**分開建置**。
- 資料檔：`data/concepts.json`（一單元＝說明 HTML＋SVG 配圖＋題目陣列；檔案不存在時網站正常運作）
- 打樣單元：畢氏定理（s-IV-7 / S-8-6），基礎 3 題＋進階 3 題，已上線於題庫「觀念補強」分頁
- 鏈結：錯題分析（全班卡＋個人分析卡）若題目掛有已建置單元的學習表現 → 自動出現「📘 觀念補強」按鈕，一鍵跳到對應單元
- 設計決策：診斷軸用**學習表現**，但一個表現可拆多個觀念單元（每單元另標學習內容代碼）；粗代碼如 s-IV-8 之後要拆
- 審題流程：每單元輸出 `觀念補強/審題_<代碼>_<名稱>.md` 給另一個 AI 審，審過才算定稿
- **打樣已審過定稿（2026-07-15）**：6 題全過＋SVG／課綱／難度全過；修正 1 處（逆定理句補「c 是最長的那條邊」），
  已 build＋deploy_bank 上線；審題結果全文附在審題檔文末
- 配圖：用 jh-math-geometry 技能渲染 SVG（真實比例，`vertices` 參數控制），以單引號屬性內嵌進 JSON
- 前端程式：build_html.py 搜 `CONCEPTS` / `openConcept` / `cAnswer`；改完照舊 build → deploy_bank.py
- ~~待辦：批量建置其餘單元、學生端獨立練習頁、依錯誤率排優先序~~ → **已於 2026-07-16 全部完成，見下方**

## 2026-07-15 換卷：複習卷B1 上架學生作答站 ✅
- math809-quiz 現掛「會考數學複習卷B1_30題_0715」（30 題，103–109 年選擇題），已驗證 30 張題圖全載入
- ⚠️ 該卷匯出時 submitUrl 為空（出卷瀏覽器沒存收卷設定）→ 上架前已手動把正式收卷網址補進
  netlify_deploy/index.html；同理**這卷的出題紀錄可能沒寫進試算表**
- 原示範卷備份於 `backup/示範卷_最近5屆1-10題_index.html`（要換回：複製回 netlify_deploy/index.html 再 deploy）
- 教訓：匯出線上試卷前，先確認該瀏覽器的題庫「試算表收卷設定」已儲存，匯出才會自動內嵌收卷網址
- 收卷鏈路已端對端驗證（線上卷 submitUrl → POST ok:true → list=1 讀回），測試資料已刪、試算表乾淨待收

## 2026-07-15 build_html.py 地雷修復 ⚠️必讀
- 原本每次 `build_html.py` 都會把「示範卷」寫回 `netlify_deploy/index.html`，**蓋掉目前上架中的學生卷**
  （本日曾把複習卷B1蓋掉，靠 git 還原）
- 已修復：示範卷改固定輸出到 `backup/示範卷_最近5屆1-10題_index.html`；`netlify_deploy/index.html`
  只在「匯出線上試卷」或手動換卷時才變動
- 換卷 SOP 不變：新卷放進 netlify_deploy/index.html → `netlify deploy --dir netlify_deploy --prod`

## 2026-07-16 觀念補強全面鋪開（56 單元）＋學生端練習頁 ✅
- `data/concepts.json`：1 → **56 單元、336 題**，涵蓋題庫出現的全部 35 個學習表現
  - 優先序：B1 卷 20 筆實測錯誤率（n-IV-7 錯 85% 最優先）→ 題庫出題頻率；清單見 `觀念補強/單元清單.md`
  - 每單元：白話說明＋配圖（33 張，jh-math-geometry 渲染＋手工 SVG）＋基礎 3 題＋進階 3 題＋審題檔
- 工具鏈（scripts/）：`validate_concepts.py` 結構驗證、`merge_concepts.py` 批次合併＋正解位置洗牌
  （詳解/誘答文字一律引用選項內容而非字母，洗牌才安全）、`gen_reviews.py` 審題檔生成（不覆蓋既有）
- **自審全部通過**（2026-07-16）：336 題逐題數學重驗、洗牌完整性與原稿比對、課綱代碼核對、
  正解分布 A80/B94/C81/D81、33 張配圖轉 PNG 目視檢查（修正 1 張：等腰三角形刻度標錯邊）；
  審核結果已附在各審題檔文末
- **學生端練習頁上線**：https://math809-quiz.netlify.app/practice.html
  - 由 build_html.py 自動生成 `netlify_deploy/practice.html`（每次 build 重新生成，可安全覆蓋；掛卷的 index.html 不受影響）
  - 流程：填班級座號姓名 → 選單元（六領域分組）→ 說明＋6 題立即回饋 → 做完自動 POST 試算表，
    卷名「觀念-<代碼>-<名稱>」（如 觀念-n-IV-7-1-等差數列）；沒填班級姓名就不上傳（方便老師試玩）
  - 本機留最佳成績標籤（localStorage best_<單元id>）
- 題庫站「觀念補強」分頁改依六領域分組；單檔版修復（原本 payload 漏了 concepts）
- ⚠ **Netlify `--prod` 部署自 7/16 起回 403 Forbidden**（draft 正常、帳號登入正常，原因不明）。
  已改兩段式：draft 部署取 deploy_id → `netlify api restoreSiteDeploy` 發布。
  `deploy_bank.py` 已內建此流程；學生站（quiz）手動部署也照此：
  `netlify deploy --dir netlify_deploy --site 05be96f6-… --json` → restoreSiteDeploy

## 新年度（116）擴充 SOP
1. `download_exams.py` 年份範圍改 116 → 下載
2. `probe_anchors.py` 確認錨點 → `crop_questions.py` 切圖 → 抽查 2–3 張
3. 答案表用「目視」讀，寫入 official_answers.json
4. 手寫 `data/questions_116.json`（欄位格式見 README 或既有檔案）
5. `validate.py` → `build_html.py`

## 2026-07-23 新專案：非選題手寫作答＋AI自動批改（Phase 1 建置中）
方向定案（見記憶 kaokao-essay-grading）：Phase 1 零成本＝沿用 GAS+Google Drive+試算表；批改先用 OpenAI（引擎可換）；站內 canvas 手寫；定位「AI 初評＋老師覆核」，不當會考成績。

### ✅ 步驟1完成：非選評分規準資料庫
- `scripts/fetch_essay_rubrics.py`：抓心測中心官方整合PDF（含試題+評分指引+樣卷說明）。檔名規則：**104–113=`正式試題(Y年第X題).pdf`、114=`Y年第X題.pdf`、115官方評分指引尚未上架**。下載至 `00_非選評分規準PDF/`，抽文字到 `txt/`。
- **`data/essay_rubrics.json`**（成品）：24題（104–114 共22題官方逐級分指引＋148條二元判準；115兩題待補位）。每題含 title/answer_points/guide{l3,l2,l1,l0官方原文}/checkpoints[{id,text,primary_level}]/source_pdf。meta 含通用評分規準與版權聲明。
- 建置法：`fetch_essay_rubrics.py` 抓22份 → Workflow 44 agent（每題抽取+獨立核對忠實度，全 faithful=true）→ 組裝腳本（scratchpad/assemble_rubrics.py）灌入。
- `scripts/validate_essay_rubrics.py`：結構＋與題庫一致性驗證（目前 0錯0警）。
- ⚠ 115 逐級分指引每年考後才上架，需 SOP 補：官網 exam/115/ 有樣卷後，比照 fetch 腳本補 guide/checkpoints。
- ⚠ 版權：官方題目與樣卷屬心測中心，僅教學用、勿散布樣卷影像。

### ✅ 步驟2完成：題庫出非選卷
- 題型篩選本就含「非選擇題」→ 老師在題庫勾題型＝非選即可只出非選卷（免改）。
- build_html.py 另生成現成 `backup/非選練習卷_index.html`（104-115 全26題非選手寫卷，供部署或測試）。

### ✅ 2026-07-23 完成閉環：老師覆核頁 ＋ 學生查成績（已建置測試，待批次交卷後啟用）
- **後端 Code.gs 再加兩接口**（含在待重新部署版本）：doPost `kind:'essay_review'`（回寫老師覆核級分/備註）、doGet `?myresult=1&quiz&cls&seat`（學生查自己，必帶班座號，只回老師覆核級分＝未覆核顯示批改中）。
- **題庫加「✍ 非選覆核」分頁**：載入 `?essays=1` → 每份顯示 學生手寫圖＋AI初評(級分/理由/信心)＋官方評分指引(details)＋參考答案 → 點 0-3 級分鈕或「套用AI級分」→ POST essay_review 回寫。「只看未覆核」篩選。essay_rubrics.json 已併入 bank payload（build_html.py：payload/payload2 加 essay_rubrics；JS 搜 ESSAY_RUBRICS/reviewCard/saveReview）。
- **學生卷加「🔍 查我的非選批改結果」**：填班座號→`?myresult=1`→每題顯示 老師覆核級分/3＋評語＋參考答案＋詳解＋看自己作答；未覆核＝「批改中…」。JS 搜 btnMyResult/renderMyResult。
- 覆核頁加「⚡ 一鍵套用全部 AI 級分」（btnApplyAllAI）：把「未覆核且已有AI初評」的整批 level=AI級分 一次 POST essay_review 放行，可再個別改；沒AI分的跳過。實測正確（4份中只1份有AI分→只套用該1份）。
- 瀏覽器實測：覆核頁載入真實後端4份、規準24題、級分鈕/圖/指引都在；學生查詢 mock 測（已覆核顯示3級+評語、未覆核顯示批改中）都正常。
- 學生查成績時序：學生卷重部署後，正在作答的舊頁面照舊交卷；晚點回來查＝重新開頁自然拿到新版（有查成績鈕）；只一直開著同分頁的人要重整一次。
- ⚠ **部署時序（重要）**：`essay_review`/`myresult` 兩接口舊後端沒有→老師若在GAS重部署前按「儲存覆核」會被舊 doPost 誤當交卷寫入垃圾列且假成功。故**全部 deploy 都等「這批學生交完卷」再一起做**：①老師重部署 GAS（貼新 Code.gs→新版本）②再 deploy 題庫(bank)＋學生卷(essay)。目前 handoff 時學生正在作答，尚未 deploy 這批新功能。

### ✅ 2026-07-23 題庫出題新增「指定題數＋範圍隨機抽題」
- 題庫工具列加「抽 [N] 題　🎲 依範圍隨機抽題」：範圍＝目前所有篩選（年度／冊別／章節／代碼／難度／題型／題號範圍），題數＝輸入的 N。按鈕→清空現有勾選→從 filtered() 洗牌隨機抽 min(N,池大小) 題入 picked→render。題數超過範圍會全抽並提示。程式在 build_html.py 搜 btnDraw/drawN。
- 已瀏覽器實測（全庫抽15→15、設題號範圍後抽10→10 受限於池、範圍13題抽999→全抽13）。已 deploy_bank.py 上線 math809-bank。

### ✅ 2026-07-23 新增「文件掃描（自動抓正+增強對比）」＋紙本 PDF 下載
- **拍照掃描升級成掃描 App 效果**：選照片後 lazy-load OpenCV.js(4.8.0, docs.opencv.org)+jscanify(1.3.0, jsdelivr) → 偵測紙張四角 → 透視校正抓正 → adaptiveThreshold 增強對比成乾淨黑白掃描件 → 預設用掃描版，附「🔁 原圖／掃描」切換。**優雅降級**：載不到/偵測失敗/逾時30s → 用原圖（照樣可交）。iPad 坑已處理：accept="image/*"（不加 heic/capture，自動轉JPEG＋跳相簿/相機選單）、靠 <img> 自動套 EXIF 方向、downscale 到 2048 且避開 iOS canvas 16.7MP 面積上限。函式：onPhoto/loadPhoto/loadCV/scanCanvas/enhance/toggleScanView。
  - 瀏覽器實測通過：OpenCV+jscanify 2.5s 載入；傾斜白紙→抓正成 1240×977 矩形、增強後 98.9%白/1.1%黑字；完整 onPhoto 串接（掃描→切換鈕）OK。
- **紙本 PDF 下載**：`scripts/make_essay_print.py`（reportlab，A4 每題一頁：題目圖＋作答區框＋版權，中文用 msjh）。build 時自動生成 backup/非選練習卷_紙本.pdf（26頁3MB）。線上卷標題下有「🖨 下載紙本作答卷（PDF）」鈕（make_quiz 的 print_pdf 參數＋模板 __PRINTPDF__）。essay_deploy/ 已含 PDF，隨站部署可下載。
- 研究依據：workflow 查證瀏覽器文件掃描庫（jscanify/OpenCV.js vs Scanic）與 iPad Safari 坑，CDN 皆實測可用。

### ✅ 2026-07-23 部署測試站＋新增「拍照/上傳」作答
- 非選手寫測試卷部署於**新站 math809-essay**（https://math809-essay.netlify.app ，site_id 21ea9b5a-edc1-4913-ab64-2b6de64babae，account slug mathruffian，收卷網址已烤入）。**不影響 math809-quiz 複習卷**。
- ⚠ Netlify `--prod` 仍 403；部署 SOP：`netlify deploy --dir essay_deploy --site 21ea9b5a-… --no-build --json` 取 deploy_id → `netlify api restoreSiteDeploy --data '{"site_id":"…","deploy_id":"…"}'`。（`--no-build` 必加，否則報 build error）
- **非選題新增「📷 拍照／上傳」**：學生可站內手寫，或按鈕拍照/從相簿/掃描檔上傳紙本計算過程（`<input type=file accept=image/*>`，前端 downscale 到長邊1600、JPEG 0.82）。兩模式切換（MODE pen/photo）、可「改回手寫」、草稿含 mode 一起還原。兩種產生的圖都走同一 imgs→essay_imgs 管線，後端/批改不用改。已瀏覽器實測（上傳/切換/交卷/照片標記[照片]）。
- essay_deploy/ = 部署用資料夾（index.html = backup/非選練習卷 副本）。

### ✅ 步驟3完成：學生端 canvas 手寫＋拍照上傳（build_html.py QUIZ_TEMPLATE）
- 非選題 <textarea> → 手寫畫布：Pointer Events（支援 Apple Pencil，getCoalescedEvents 平滑）、上一步/清除、hi-DPI backing store、選填「最後答案」欄。
- 筆跡 toDataURL('image/jpeg',0.72) 存 imgs[id]，ans[id]='[手寫]'；localStorage 草稿含手寫圖，重整可還原（baseImg 重繪）。
- 交卷：主紀錄不塞大圖（顯示/下載版 ~1KB）；手寫圖走 postJson 的 rec.essay_imgs 一併 POST；rec 新增 n_essay。
- **已在瀏覽器端對端實測通過**：畫→匯出、undo/clear、草稿還原、交卷（非選卷得分列「非選N題已送出」、訂正區「待批改」）。
- 改動只在 build_html.py 模板 → 影響 index.html/單檔版/backup樣卷/practice.html；**未動線上卷 netlify_deploy/index.html**。

### ✅ 步驟4完成：後端存圖（apps_script/Code.gs，⚠需老師重新部署才生效）
- doPost 收 rec.essay_imgs → 抽出後 base64 decode → DriveApp 存「會考題庫非選作答/<卷名>/」→ 檔案設 ANYONE_WITH_LINK → 寫「非選作答」表（欄：時間/卷/班/座號/姓名/題目ID/圖片連結/檔案ID/最後答案/AI級分/AI理由/AI信心/老師覆核級分/老師備註）。essay_imgs 於存表前刪除，避免塞爆 5萬字元儲存格。
- doGet 新增 `?essays=1(&quiz=&cls=)` 回非選作答陣列（供步驟5批改腳本與步驟6覆核）。
- **⚠ 老師須重新部署 GAS**：Apps Script 專案「會考題庫收卷 v1」→ 貼上新 Code.gs → 部署→管理部署作業→編輯→新版本→部署（網址不變）。首次會要求授權 Drive 權限。
- ⚠ 隱私：手寫圖含姓名座號，設 ANYONE_WITH_LINK（不可猜但公開）；Phase2 改 Firebase 權限控管。

### ✅ 2026-08-05 紅筆批改＋UI改造＋單站多卷架構
**1. 程式化紅筆批改（取代生圖方案）**
- ⚠ **實測結論：gpt-image-2 生圖批改不可用**。4份樣本 0安全/2份竄改學生內容（910-5 等號「＝」被改成「≠」、904-8 手寫「ABCD」被抹除），且長寬比 4:3→1:1、解析度砍半。生圖是「重畫」不是「疊加」，不能當成績佐證。**已放棄此路線**。
- ✅ 改用 `scripts/annotate_redpen.py`（程式化疊加，原圖**逐位元不動**，--verify 可驗證）＋ `scripts/make_redpen.py`（AI 依批改結果產標註座標→畫紅筆）。
- 實測座標定位可用：行級/區域級準（列舉行、結論行、空白區都對），小字級誤差約3%。
- 36份全生成於 `redpen_out/`，全部通過原圖未更動驗證。
- 修正兩 bug：批註溢出畫布（annotate_redpen 加夾邊界）、**0級分被當空值**（Python `0 or ""` 陷阱，make_redpen 與 make_feedback_pdf 都修）。
- 回饋單 PDF 已改用紅筆批改版當作答圖。

**2. UI 改造（三頁）**
- 設計 token 升級：陰影階層(--sh/--sh-md/--sh-lg)、圓角、--tap 觸控目標、更精緻漸層 header。
- 學生卷：選項 56px、交卷鈕 48px、手寫畫布 340px＋淡格線(34px間距)、底部進度條、safe-area-inset。
  ⚠ 修 bug：setupCanvas 高度寫死 300 → 改讀 clientHeight，否則筆跡被垂直拉伸。
- 覆核頁：**進度條 ＋ 鍵盤快捷鍵**（0-3 給分並存、A 套用AI、J/K 上下份）、目前卡片高亮、已覆核變淡、存檔後自動跳下一份。

**3. 單站 × 路徑即卷（解決 Netlify 部署上限）**
- 查證：**Netlify 免費已改 credit 制，每月300、每次 --prod 扣15 → 一個月只能部署20次**，用完全帳號站台一起暫停。頻寬不是瓶頸（1MB×30人=0.6 credits）。
- `scripts/build_quiz_site.py` ＋ `data/quizzes.json`：一個站、每卷一路徑 `/q/<代碼>/`，全部卷一起部署＝1次部署。含入口頁（輸卷代碼或點清單）。已本機驗證。
- 建議主機：**Cloudflare Pages + Direct Upload**（靜態頻寬免費無上限、免repo所以不必公開、`npx wrangler pages deploy` 一行、100專案）。wrangler 已可用但**未登入**。
- ❌ GAS 當主機：實測空回應 0.89-1.36s 比 Netlify 傳完整 2.2MB(0.41-0.87s) 還慢；30併發上限＝一班人數；多帳號登入會打不開。**不要**。
- ❌ GitHub Pages：免費強制 public；付費 Pro 用 private repo **網站仍公開**，私有站只有 Enterprise。
- ❌ GAS 每次建新試算表：不需要，用「試卷名稱」欄位區分即可。

### 📌 2026-08-05 現況總覽（最新，接手先看這段）

**線上網址**
| 網址 | 用途 |
|---|---|
| https://math809-quiz.pages.dev | 學生站入口（輸卷代碼／點清單） |
| └ `/q/hanlin-2-kz/`、`/q/hanlin-2-909/` | **翰林 111 年第1次（1~2冊）**，科資班／909 班專屬（2026-08-05 新派） |
| └ `/q/hanlin-1-<班級>/` | 翰林模擬卷（110年）**各班專屬**（班級內建鎖定，學生只填座號）902/904/906/907/908/909/910 |
| └ `/q/hanlin-1/`、`/q/hanlin-2/` | 翰林卷原始網址（保留，已發出去的不失效） |
| └ `/q/0723/`、`/q/b1b2-0722/`、`/q/sim-115/`、`/q/sim-114/`、`/q/essay-all/` | 其餘卷 |
| https://math809-bank.pages.dev | 🔒 老師題庫＋「✍ 非選覆核」（含詳解，勿發學生） |
| [收卷試算表](https://docs.google.com/spreadsheets/d/1vZg5vVUTym__8Fhht5vWeDq1Y6v5QOavIr-E-06DvDY/edit) | 作答紀錄／逐題明細／非選作答／出題紀錄 |
- Netlify 舊站（math809-essay/quiz/bank、review1~5）保留不動；math809-review4 為 404 待修。

**常用指令**（派新卷：編 data/quizzes.json 加一筆，可加 "classes":["902",…] 自動展開各班）
```
python scripts/build_quiz_site.py
npx wrangler pages deploy quiz_site --project-name math809-quiz --branch main --commit-dirty=true
# 題庫：python scripts/build_html.py → 複製 index.html+01_題目圖片 到 bank_site → 同上 deploy --project-name math809-bank
python scripts/grade_essays.py --quiz "卷名"            # 只批未批過的（增量）
python scripts/grade_essays.py --quiz "卷名" --transcribe  # 只補 AI辨識內容
python scripts/make_redpen.py --quiz "卷名"             # 產紅筆圖並自動上傳 Drive
python scripts/make_feedback_pdf.py --quiz "卷名"        # 個人回饋單 PDF
```

**題庫現況**：412 題（103-115 官方 358 ＋ 翰林模擬 HL1 27 ＋ HL2 27）。評分規準 30 題（103-114 官方 ＋ HL1／HL2 各 2 題取自翰林解答篇與樣卷說明的評分指引）。

**翰林卷成績（8人，平均87.6）**：902-9陳昱翔100 ／904-8 95 ／910-5邱楷翔95 ／904-16 89.1 ／908-5洪宣典88.2 ／908-13謝沛翰87.5 ／906-16沈淳迦79.8 ／307-1王敦珩66.2。
教學觀察：4人選擇滿分但非選平均僅3.25/6；908-13 選擇25/25、非選僅1/6（會算但寫不出過程）。

**⚠ 未完成／待辦**
1. **GAS 尚未部署最新版**（本機 apps_script/Code.gs 312行、含 `_nid()` ×9）。老師多次貼上失敗：Drive 同步延遲拿到舊檔、或複製被截斷（曾只貼到第100行）。**建議做法：請 Claude 直接把檔案傳給老師**（SendUserFile），用記事本開啟複製，貼完確認**最後行號是 312**、搜 `_nid` 有 9 個。
   - 未部署只差「後端寫入時再正規化一次」這層保險，前端已上線、現有功能全部正常。
2. **髒資料待老師手動刪**（後端無刪除接口，老師指示先不加）：試算表刪「非選端對端測試卷」全部、以及 809-9／915-38（試玩）。
3. **307-1 王敦珩**為真實學生填錯班級 → 待老師告知正班級後改試算表班級欄。309-1／309-12（B1_B2卷）也待確認。
4. 908-13 的 HL1-N1 曾上傳成 0 bytes，已重交補批（現有空圖防護擋下此情形）。

### ✅ 2026-08-05 已搬家到 Cloudflare Pages（正式啟用）
- wrangler 已登入（帳號見 Obsidian）。建立兩個 Pages 專案並部署成功：
  - **https://math809-quiz.pages.dev** ← 學生站（單站多卷）：`/`入口頁、`/q/0723/`、`/q/essay-all/`、各卷 `print.pdf`、`/practice.html`。全部實測 200。
  - **https://math809-bank.pages.dev** ← 老師題庫（含覆核頁/一鍵套用AI/抽題/新UI快捷鍵），359 檔含題目圖片。
- 部署指令（之後派新卷就這兩行）：
  `python scripts/build_quiz_site.py` → `npx wrangler pages deploy quiz_site --project-name math809-quiz --branch main --commit-dirty=true`
  題庫：`python scripts/build_html.py` → 複製 index.html+01_題目圖片 到 bank_site → `npx wrangler pages deploy bank_site --project-name math809-bank --branch main --commit-dirty=true`
- 派新卷流程：編輯 `data/quizzes.json` 加一筆（code/title/qids/note）→ build_quiz_site → deploy。**所有卷一起部署＝1次部署**，不再有 Netlify credit 問題。
- GAS 已部署 v3：去重生效（40→36）、AI辨識內容欄可寫入。
- Netlify 舊站保留不動（math809-essay 已發出去的網址繼續有效；math809-quiz 舊複習卷）。⚠ math809-review4 為 404（第四冊簡報掛了，待修）。

**⚠ 待辦（需老師操作）**
- Netlify CLI 目前登入 `另一個 Google 帳號`，但 math809-* 站台在 `主要 Google 帳號` → 要部署得先 `netlify logout` 再 `netlify login` 切回。
- GAS 需再部署一次（去重 _dedupeLatest ＋ AI辨識內容欄 ＋ myresult 回 transcript）。目前覆核頁顯示40份（含重複），部署後會去重成36。
- Cloudflare 要 `npx wrangler login`（瀏覽器授權）才能部署。
- ⚠ 選擇題答案是 base64 藏在 qdata 的 k 欄位，學生可解碼；非選題不受影響（無答案鍵）。

### ✅ 2026-07-23 增強：AI辨識內容(OCR對照)＋回饋單PDF＋自動去重
- **AI辨識內容**：grade_essays.py 批改時存 transcript；新增 `--transcribe` 模式（只補 AI辨識內容、不動級分，供已批完的批次補）。Code.gs essay_grade 改**部分更新**（只寫 updates 內有的欄）＋ `_ensureCol` 自動補「AI辨識內容」欄；myresult 也回 transcript。覆核頁與學生端都顯示「AI 讀到的內容」對照OCR。
- **自動去重**：Code.gs `_dedupeLatest`——?essays=1 與 myresult 預設同「班+座+題」只留上傳時間最新一筆（&dupes=1 看全部）。解決 908-5 重交造成的重複。
- **回饋單 PDF**：scripts/make_feedback_pdf.py（reportlab platypus）：每人一份，每題＝題目圖＋學生作答圖(Drive下載)＋AI辨識內容＋得分(綠/藍/橙/紅)＋評分說明框＋老師評語。已測：902-9 頁面完整、真實手寫清晰。⚠回饋單含全班資料，**勿放公開站**（只在本機/發個人）。
- ⚠ **時序**：辨識回填(--transcribe)與去重都要**新版 GAS**才安全（舊 essay_grade 非部分更新，會清掉分數）。前端已部署(辨識缺就不顯示，安全)。待老師重部署GAS後→跑 --transcribe→重生回饋單。

### ✅ 2026-07-23 學生端顯示「為什麼得這個分數」＋閉環正式站驗收通過
- 需求：學生要看得到得分理由。做法：Code.gs myresult 多回傳 ai_level+reason；學生卷 renderMyResult 顯示「為什麼得這個分數（依官方評分規準）」＝清掉[AI初評…]標籤的 AI理由，且僅在 老師覆核級分==AI級分 時顯示（老師改分未留言不顯示舊理由，避免對不上）。老師改分時以老師備註為準。
- 老師已第三次重部署 GAS（myresult 回 reason 驗證OK）。學生卷已重部署。
- **正式站真人驗收**：學生 902-9 在 math809-essay 查成績 → 4題級分＋「為什麼得這個分數」＋參考答案＋詳解全部正確顯示、無AI內部標籤殘留。老師已在覆核頁定分（902-9四題老師覆核級分皆設）。**整條閉環（手寫/拍照/掃描交卷→gpt-5.6-luna批改→覆核頁一鍵定分→學生查成績看理由）在正式環境運轉中。**

### ✅ 2026-07-23 首次真實批改＋閉環全上線
- 補建 103-N1/N2 官方評分規準（103首年也有評分指引，同URL規則抓；essay_rubrics.json 現26題）。
- 卷「會考數學複習卷_非選0723」9生×4題=36份，用 gpt-5.6-luna 批完寫回試算表（updated:36）；分數落差4~11/12（有鑑別），最低信心0.68。
- 老師已重部署 GAS（myresult/essay_review 生效驗證OK）。
- 已部署：題庫(覆核頁)＋學生卷(查成績鈕，用 make_one_quiz.py 以最新模板重生同名卷)到 math809-essay。myresult 現回「批改中」（老師未覆核）。
- scripts/make_one_quiz.py：匯入 build_html 後呼叫 make_quiz 產生單一份最新模板線上卷。
- ⏭️ 待老師：math809-bank →「✍ 非選覆核」→ 載入 →「⚡ 一鍵套用AI級分」或逐份改 → 學生即可查。務必抽看低分/低信心（AI初評未經人工，真實手寫可能讀錯）。

### ✅ 2026-07-23 批改模型改用 gpt-5.6（推理型）
- grade_essays.py 預設 MODEL 從 gpt-4o 改為 **gpt-5.6-luna**（使用者指定）。可用 --model 或 env KAOKAO_GRADE_MODEL 換。
- ⚠ gpt-5.x／o系列是推理型：API 參數不同——用 **max_completion_tokens（非 max_tokens）、不吃 temperature**、需較大 token 額度（含 reasoning_tokens）。grade_once() 已依 model 前綴自動切換（gpt-5/o1/o3/o4 走推理型參數，max_completion_tokens=5000；gpt-4o/gpt-4.1 走舊參數＋temperature）。
- 帳號實際可用模型：gpt-4o/4.1、gpt-5～gpt-5.5、gpt-5.6-luna/sol/terra（無裸 gpt-5.6）、o3/o4-mini 等。5模型比較（demo正解/部分作答）全判對(3級/1級)，gpt-5.x 輸出 tokens 約 gpt-4o 的 2-3 倍。真實手寫待校準。

### ✅ 步驟5完成：本機批改腳本 scripts/grade_essays.py（已煙霧測試）
- 流程：GET `?essays=1` 抓手寫作答 → 由檔案ID 下載 Drive 圖 → 依 essay_rubrics.json（guide+checkpoints+answer_points）餵 OpenAI 視覺 → 逐條二元判準+綜合級分(0-3)+理由+信心 → 多次投票取共識(平手取低)、低信心/邊界/115待補→標需覆核 → POST kind:'essay_grade' 回寫「非選作答」表 AI欄。
- 讀 ~/.openai.env 的 OPENAI_API_KEY；MODEL 預設 gpt-4o（環境變數 KAOKAO_GRADE_MODEL 或 --model 可換）；REVIEW_CONF=0.6。
- 用法：`python scripts/grade_essays.py --quiz "卷名" [--cls 809] [--votes 3] [--regrade] [--dry]`；離線試批 `--demo --qid 111-N1 --img x.jpg`。
- Code.gs 已加 doPost `kind:'essay_grade'`（依檔案ID回寫 AI級分/AI理由/AI信心）——**含在待重新部署的版本內**。
- **煙霧測試（真打 OpenAI）**：111-N1 完整正解→3級/信心1.0/5判準全達成；只對第(1)小題→1級/信心0.9（對上官方1級「以算式推得k=18」）。單題約 input2.6k+output0.3k tokens ≈ NT$0.3。鑑別度正常。

### ✅ 2026-07-23 後端已重新部署＋真實端對端驗證通過
- GAS 已重部署（老師端），`?essays=1` 回 `[]`（新碼生效）。收卷網址不變（AKfycbw-ePEf…）。
- 端對端實測（直接以 essay_imgs 格式 POST 模擬交卷）：交卷→`{ok:true,n_essay:1}`→圖進 Drive「會考題庫非選作答/非選端對端測試卷/」＋非選作答表→grade_essays.py 抓圖批改 3級/信心1→essay_grade 回寫→試算表 AI級分=3。全綠。
- ⚠ **測試資料待清**：試算表「非選作答」表有 1 列（班級=測試、試卷=非選端對端測試卷）＋ Drive 同名資料夾 1 張圖，老師可手動刪（我無 Drive 寫入權限無法代刪）。

### ⏭️ 下一步
步驟6 題庫「✍ 非選覆核」頁（唯一未做的建置）：載入 ?essays=1 → 顯示手寫圖＋AI初評（級分/理由/信心）＋官方guide對照 → 老師一鍵確認/改分（需 Code.gs 再加 kind:'essay_review' 回寫老師欄＋把 essay_rubrics 併進 bank payload）。目前沒有覆核頁也能用（老師直接看試算表「非選作答」表）。
步驟7 真實校準：用真班學生手寫樣本跑一輪，看 AI 對齊率與辨識率（手寫比印刷難，需實測調整）。

### ✅ 2026-08-05（晚）新增翰林 111 年第1次模擬卷（HL2）＋派兩班網址
**這份卷是什麼**：翰林 111 學年度第一次國中教育會考模擬測驗（範圍 1~2 冊），選擇 25＋非選 2，共 27 題。
⚠ 檔名與去年那份 HL1 **完全相同**（`01-紙筆模擬會考／數學【第1次第1~2冊】題本(平浮).pdf`），
差別在封面年度（111 vs 110）與條碼末碼（-31 vs -30）。來源 PDF 存於
`G:/我的雲端硬碟/2026會考歷屆試題/翰林模擬試題/111/`（題本＋解答篇＋非選樣卷說明三份）。

**學生網址（已上線驗證 200）**
- 科資班：https://math809-quiz.pages.dev/q/hanlin-2-kz/ （班級鎖定 kz）
- 909 班：https://math809-quiz.pages.dev/q/hanlin-2-909/ （班級鎖定 909）
- 各卷都有「🖨 下載紙本作答卷（PDF）」11 頁，封面帶該班網址 QR code。

**建置內容**
- 切圖 27 張 → `01_題目圖片/HL2/`（沿用 crop_hanlin.py，已參數化：`--prefix HL2 --book <路徑>`，
  定位快取存 `data/hanlin_layout_HL2.json`；HL1 行為不變）。
- `data/questions_HL2.json`：27 題全含答案、108 課綱雙代碼、冊別章節、topic、難度、詳解、逐步引導、陷阱提示。
  答案已與解答篇標準答案表逐題核對，27 題解法全部自行驗算過。
- `data/essay_rubrics.json` 加 HL2-N1／HL2-N2：官方逐級分評分指引原文（取自解答篇＋非選樣卷說明）＋各 5 條 checkpoints。
  → AI 批改（grade_essays.py）與覆核頁可直接用，不必再補。
- `data/quizzes.json` 加 `hanlin-2`（classes: kz／909）；卷名「翰林模擬會考 111年第1次（第1~2冊）」。
  ⚠ 卷名是試算表的 key，**不要事後改**，否則對不上既有紀錄。

**順手修掉的既有 bug（都影響 HL1，非本次新增）**
1. **年度篩選對翰林卷完全失效**：`mfToggle` 內 `if(key==='year') v = +v` 把 "HL1"/"HL2" 轉成 NaN，
   勾了等於沒篩。已改成只有純數字才轉型。實測 HL1／HL2 各篩出 27 題、115 年不受影響。
2. **HL1 兩題章節名稱與課綱對照表不符**（HL1-18「第1章 比與比例式（正比與反比）」、HL1-N1「第2章 因數與倍數」），
   導致章節篩選漏題。已更正為 curriculum_108.json 的標準名稱。
3. 年度顯示「HL1年／HL2年」→ 改為「翰林模擬 110／翰林模擬 111」（學生卷題目標示與題庫年度選單皆改，
   對照表在 build_html.py 搜 `SRCLBL`／`YRLBL`，之後新增翰林卷要記得加一筆）。
4. `validate.py` 原本只驗 103-115，翰林卷從未被驗過 → 已補驗 HL1／HL2（圖片、課綱代碼、冊章、必要欄位；
   官方答案表不涵蓋模擬卷，故改驗 answer 非空）。目前 412 題全過。
5. `build_quiz_site.py` 新增可選欄位 `class_labels`（如 `{"kz":"科資"}`）：只美化標題顯示成「科資班」，
   寫進試算表的班級值仍是代號 `kz`。

**驗證方式（都做過）**
- `node --check` 驗學生卷與題庫站的 JS 區塊（題庫的 base64／json 區塊要排除，不是 JS）。
- 瀏覽器實測學生卷：27 題圖全載入、班級鎖定且唯讀、選項可點且進度更新、手寫畫布 836×338（高度沒被拉伸）、
  submitUrl 已內嵌正式收卷網址、非選兩題都有畫布＋拍照鈕＋答案欄。測完已清 localStorage，**未送出任何測試交卷**。
- ⚠ 題庫站在無頭瀏覽器下題圖顯示為「未載入」是假警報：圖是 `loading="lazy"`，面板沒顯示就不觸發，
  既有的 115 年題目同樣是 0 張；直接 fetch 圖檔為 200、強制 new Image() 可解碼 1717×975。

**⏭️ 下一步（學生交卷後）**
```
python scripts/grade_essays.py --quiz "翰林模擬會考 111年第1次（第1~2冊）"
python scripts/make_redpen.py   --quiz "翰林模擬會考 111年第1次（第1~2冊）"
python scripts/make_feedback_pdf.py --quiz "翰林模擬會考 111年第1次（第1~2冊）"
```
→ 再到 math809-bank「✍ 非選覆核」逐份定分（務必抽看低分／低信心的）。

### ✅ 2026-08-05 非選題「命題模板庫＋自動生成器」（新功能，第一版完成）
需求：分析近五年會考非選題的命題公式，做成模板，之後可依六冊內容不斷生成新題。

**分析報告**：`命題模板/命題公式分析報告.md`（非選近5年為主／近10年為輔＋選擇題 255 題統計）
- 非選公式＝**生活情境 ＋ 題目現場定義的新規則 ＋ (1)單步套用 ＋ (2)建模→推理→下判斷**
- 近10年固定：N1 一定是數／代數／統計（10/10），N2 以幾何為主（7/10）；每題兩小題、3級分
- 第(2)小題只有六型：足夠／一定（反例）／可能（不存在性）／能否／比較／最值
- **官方評分規準是套模子的**（103–114 逐級分指引比對）→ 只要標出四個錨點 A/B/C/D，L3/L2/L1/L0 與 checkpoints 可自動生成

**新檔案**
| 檔案 | 用途 |
|---|---|
| `data/templates_essay.json` | 模板卡（目前 6 張：B1~B6 各 1，六種問法各 1） |
| `scripts/gen_essay.py` | 生成器：抽情境／參數→檢查約束→算答案→產題幹圖＋詳解＋評分規準 |
| `scripts/validate_templates_essay.py` | 模板品質關卡（每卡試生 N 組，檢查殘留變數／級分／結論多樣性／課綱代碼） |
| `data/gen_log.json` | 已用過的參數簽章，**確保每次生出不一樣的題** |
| `01_題目圖片/GEN/` | 題幹渲染 PNG（前端一律用 `<img>`，故生成題也走同一管線） |

**指令**
```
python scripts/gen_essay.py --list                 # 看模板卡
python scripts/gen_essay.py --n 2                  # 生一份卷（N1+N2）
python scripts/gen_essay.py --books B1,B4 --n 2    # 限定冊別（複習到哪冊就出哪冊）
python scripts/gen_essay.py --n 2 --dry            # 只看不寫檔
python scripts/validate_templates_essay.py --n 40  # 改模板卡後必跑
```
生成後：`python scripts/build_html.py` → 題庫就看得到（year 欄＝批次代碼如 `G0805`）；
派卷＝把 `G0805-N1` 之類 id 加進 `data/quizzes.json` 的 qids → `build_quiz_site.py` → deploy。

**已驗證**
- 6 張卡各試生 40 組全過（0 錯 0 警）；答案結論兩種都會出現（「一定型」正解本來就固定為「不一定」，已標 `conclusion_fixed`）
- 生成題寫入 `data/questions_G0805.json`（2 題示範）＋ 併入 `data/essay_rubrics.json`（會自動備份原檔到 `backup/`）
- `make_one_quiz.py` 產 `backup/自編非選卷_G0805_index.html`，瀏覽器實測：兩張題圖 1000×840 正常載入、手寫 canvas 正常
- `build_html.py` 兩處小修：①自動掃描 `questions_*.json`（HL*／G* 都會載入，不用再改清單）②單檔版缺圖不再整支崩潰

**注意**
- 生成題的評分規準是「依官方結構套模生成」，**非官方原件**（`confidence: generated`），AI 初評後一樣要老師覆核
- 目前模板卡只有 6 張（每冊 1 張）。要更耐用建議每冊 3–5 張、覆蓋六種問法 → 可長期輪用不重複
- 選擇題模板（`templates_choice.json` ＋ 生成器）尚未做，報告裡已有卷面藍圖、18 條必考清單、八大題幹骨架與干擾項法則可直接實作

### ✅ 2026-08-06 選擇題模板庫 ＋ 共用配圖元件庫（第一版完成）
接續非選模板，把「圖」與「選擇題」一起做完——因為六成題目有圖，元件庫做一次兩邊共用。

**1. 配圖元件庫 `scripts/figures.py`（非選／選擇題共用）**
一個 spec dict → SVG → PNG，所有標註都由參數帶入（改邊長，圖上的數字跟著改）。
- **接現成**：jh-math-geometry 技能的 `geometry_renderer.py` 可直接 import
  → triangle／quad／circle／coord（坐標平面）／solid（立體）／parallel／center（三心）／similar
  ⚠ 它預設字型是 serif，中文會變方框 → `_fix_font()` 換成正黑體（已處理）
- **本檔自建**：table（列聯表／資料表）、notice（公告卡／價目表／標語框）、dialog（對話框）、
  numberline（數線）、chart（長條／折線／直方／盒狀，matplotlib）、pattern（規律圖形序列）、
  polygon（正 n 邊形＋邊心距／內切圓）、rectpath（長方形雙路線）
- `render_question_png()`：題號＋題幹＋圖＋選項／小題 → 一張 PNG（**兩個生成器共用**）
- 自測：`python scripts/figures.py --demo <資料夾>` → 13 個元件全出圖＋總覽圖
- ⚠ **字型缺字**：微軟正黑體沒有 ⁴~⁹ 上標、∼、≈、⅔ → 會渲染成方框。指數一律寫「10 的 n 次方」，
  約等於寫「約」。已測 cairosvg 與 PIL 都不會自動 fallback。可用：² ³ ° ∠ △ ≦ √ ×

**2. 選擇題模板庫 `data/templates_choice.json`（12 張）＋ `scripts/gen_choice.py`**
| 卡 | 冊 | 難 | 骨架 | 主題 |
|---|---|---|---|---|
| C-B1-01／03 | B1 | 易／中 | 純計算 | 科學記號比大小（下界型／夾擠型）|
| C-B1-02 | B1 | 難 | 甲乙判斷 | 最大真因數與質因數分解 |
| C-B2-01 | B2 | 易 | 圖表判讀 | 列聯表＋排容 |
| C-B2-02 | B2 | 中 | 生活列式 | 逐年成長選算式（等比 vs 等差）|
| C-B2-03 | B2 | 難 | 對話框 | 滿額折扣依原價比分攤 |
| C-B2-04 | B2 | 中 | 圖表判讀 | 長條圖＋成長百分率 |
| C-B3-01 | B3 | 易 | 純計算 | 最簡根式 |
| C-B4-01 | B4 | 易 | 圖形求值 | 三角形內角和與外角 |
| C-B4-02 | B4 | 中 | 圖形求值 | 圖形規律（等差）|
| C-B5-01 | B5 | 難 | 圖形求值 | 弦心距與畢氏定理 |
| C-B6-01 | B6 | 易 | 純計算 | 兩袋抽球的和與機率 |

**關鍵設計：干擾項池＋目標字母**
- 每張卡寫 5～7 個干擾項（每個綁一種可預測錯誤），生成時**挑出能讓正解落在指定位置的三個**
  → 數學完全不動（干擾項本來就都是合法設計），但全卷 A/B/C/D 可以均衡
- 沒有這層機制時實測：正解幾乎固定（列聯表永遠 B、最簡根式永遠 A、D 只佔 5%）
- 現在整卷實測分布約 A3 B4 C2 D3（12 題），接近官方的均勻

**3. 指令**
```
python scripts/gen_choice.py --list                    # 看模板卡
python scripts/gen_choice.py --n 5                     # 生 5 題
python scripts/gen_choice.py --books B1,B2 --n 6       # 限定冊別（複習到哪冊就出哪冊）
python scripts/gen_choice.py --paper 12 --tag M0806    # 依卷面藍圖生一份 12 題（易中難自動配比）
python scripts/validate_templates_choice.py --n 30     # 改模板卡後必跑
```
非選同理（gen_essay.py）。生成後 `python scripts/build_html.py` 即進題庫；派卷把 id 加進 `data/quizzes.json`。

**4. 驗證與現況**
- `validate_templates_choice.py`：12 張卡各試生 30 組 → **0 錯**、1 警告（C-B1-01 的正解本質固定在 A，
  因為「比其他都小」的選項只能有一個；已用 C-B1-03 夾擠型互補）
- 已生成範例：`data/questions_M0806.json`（12 題選擇）、`data/questions_G0805.json`（2 題非選）
- `build_html.py` 已重建，題庫可見這些題（年度欄＝批次代碼 M0806／G0805），index.html JS `node --check` 通過
- ⚠ **驗證器抓不到「多重正解」**（干擾項其實也符合題意）。實測踩過一次：夾擠型原本有兩個合法答案，
  已修。**新模板卡上線前務必人工或請另一個 AI 逐題審過**（比照觀念補強的審題流程）

**5. 還沒做**
- 題組（23–25 題共用選文）尚未模板化；敘述判斷骨架也還沒有卡
- 選擇題目前 12 張卡、非選 6 張卡；要長期輪用不重複，建議各擴到每冊 3～5 張
- 圖的第二批元件：等角投影積木、展開圖、盒狀圖情境、選項本身是圖（美術字辨識類建議不做）

### ✅ 2026-08-06（續）題組模板（會考 23–25 題那種）
- `C-G-01` 資費方案題組：一份**共用選文**（含自訂計費公式＋費率表）＋**三個小題**（易→中→難）
  1. 易：代入分段計費算月費　2. 中：兩方案費用差　3. 難：解出臨界用量（令兩式相等）
- `figures.render_question_png()` 新增 `passage／passage_title／passage_figure`：
  選文畫成圓角外框區塊，每個小題的圖都會重印選文（與官方卷面一致）；
  另加中文避頭尾（句號、逗號不落行首）
- `gen_choice.py` 新增 `make_group()`：題組一次產生多題、題號連號、`gen.group` 記錄組別；
  `--paper N` 遇到題組會自動佔用多個題號
- 驗證器會把題組的每個小題展開成虛擬卡（`C-G-01#1`…）逐一驗
- 參數設計要訣：**臨界點 t 當參數、反推月租費差**（原本讓 t 自己算，幾乎湊不到整數解，
  5832 組參數中 0 組可用；改成反推後有 3405 組）
- 目前模板卡：選擇 12 張 ＋ 題組 1 張（＝3 小題）、非選 6 張

### ✅ 2026-08-06（三）第二批圖元件＋立體題型卡＋排卷邏輯改善
**1. 圖元件加兩種（figures.py）**
- `iso`：**等角投影積木堆疊**（會考 112-3 那型）。參數 `cubes: [[x,y,z],…]`、`marks: {"甲":[x,y,z]}`、
  `front_arrow`。畫的是共用「最靠近觀察者那個角」的三個可見面（第一版畫成背面三面，已修）。
- `net`：**展開圖**。`solid: cuboid`（十字型，面名 top/front/bottom/back/left/right）
  或 `tri_prism`（三矩形＋兩三角形，面名 side1~3/topface/bottomface），`labels` 在指定面標甲乙丙。
- 圖 spec 新增 `"$變數名"` 語法：直接取 env 裡的原始物件（cubes、marks、labels 這種巢狀結構，
  走 render_text 會被轉成字串而壞掉）。

**2. 兩張用新元件的卡**
- `C-B6-03` 積木堆疊與前視圖（中）：拿走哪一個積木前視圖會變。
  正解由程式判定（前視圖＝ (x,z) 投影集合），配置是**離線搜出來的 16 組**，每組保證：
  恰好一個標記積木「拿走會改變前視圖」、四個標記都畫在**看得見且沒被上方積木蓋住**的頂面。
- `C-B6-04` 長方體展開圖的面關係（中）：摺起來後甲與乙、甲與丙是平行還是垂直，四種組合都會出現。

**3. `--paper` 排卷邏輯改善**（原本 25 題會出現同一張卡連出 4 次）
- 題組固定排在**卷尾**（與官方 23–25 題一致），一份卷最多一組
- 同難度內優先選「本卷用得最少的卡」，同分再選「本卷該冊題數最少」的 → 卡片與冊別自動分散
- 實測 25 題卷：易 7／中 8／難 7＋題組 3，字母 A7 B7 C8 D3
- ⚠ 難卡目前只有 4 張，25 題卷仍會重複 2 次；補難卡是下一步

**4. 新工具 `scripts/try_card.py`**
單張卡的試生成器（命題者／AI 在併進模板庫前自我檢查用）：掃參數空間、生 N 題、
檢查殘留變數／選項互異／字母傾向／圖能否渲染。用法：
`python scripts/try_card.py "命題模板/_草稿/C-B6-03.json" --n 6`

### ✅ 2026-08-06（四）非選模板擴充到 9 張（每冊都有）
| 卡 | 冊 | 問法型 | 骨架 |
|---|---|---|---|
| E-B1-N1-01 | B1 | 足夠型 | 指數律＋同底夾擠 |
| E-B2-N1-02 | B2 | 一定型 | 比率公式＋舉反例 |
| E-B2-N1-05 | B2 | 列式求值型 | **民調加權**（仿 114-N1，三組倍率＋聯立） |
| E-B3-N2-01 | B3 | 比較型 | 畢氏＋兩走法比較 |
| E-B4-N1-03 | B4 | 最值型 | 等差數列＋最早達標 |
| E-B4-N2-04 | B4 | **證明型** | 鳶形中的**三角形全等證明**（仿 103-N2） |
| E-B5-N2-02 | B5 | 能否型 | 正六邊形邊心距 vs 圓半徑 |
| E-B5-N2-06 | B5 | 最值型 | **環形步道面積＋箱數無條件進位** |
| E-B6-N2-03 | B6 | 可能型 | 計分規則＋聯立＋機率 |

- **證明型是新增的第七種問法**：近五年未考，但屬歷屆重要題型（103-N2）。評分結構＝
  「寫出性質所需的三個條件 ＋ 每個條件的適當理由 ＋ 正確引用該性質」，一樣能用四錨點自動生成規準。
  卡片的 L1 錨點特別放「AC 為公共邊」這種最常被漏掉的條件。
- **參數命中率的坑**：E-B2-N1-05 原本讓人口占比與調查比率各自隨機，
  「倍率剛好是 2 和 1」的機率不到 1%（400 次抽樣只生出 2 題）。
  改成**由調查比率反推人口占比**後命中率拉到 ~40%。同類「要湊出整數解」的卡都該這樣設計。
- 新圖元件：`kite`（鳶形，依兩個角用正弦定理**真實作圖**）、`annulus`（同心圓環）。

### ✅ 2026-08-06（五）難題卡補齊：多 agent 設計＋獨立審題（7 張全過）
用 14 個 agent 跑一輪「設計 → 獨立審題」：6 張難卡＋1 張題組卡，每張設計完立刻由另一個 agent
**不看原詳解自己重算八題**、逐一驗證每個干擾項是否可能也是正解。7 張全部 `FIXED`（審出問題並修好），全部建議併入。

| 新卡 | 冊 | 難 | 考點（那把鑰匙） |
|---|---|---|---|
| C-B5-02 | B5 相似形 | 難 | 面積比＝相似比平方 → 再用同高換底切 △ABC |
| C-B5-03 | B5 三心 | 難 | 重心分三等積 → 等腰才有三線合一 → 中線 2:1 |
| C-B4-03 | B4 平行四邊形 | 難 | 角平分線＋平行 → 造出等腰 |
| C-B3-02 | B3 畢氏 | 難 | 長方體表面最短路徑：展開後比較三種走法 |
| C-B2-05 | B2 不等式 | 難 | 團體票門檻：未達人數仍以門檻計價的臨界人數 |
| C-B6-02 | B6 二次函數 | 難 | 兩交點距離只由 a 與頂點 y 決定，左右平移不影響 |
| C-G-02 | B1 整數運算 | 難 | **題組**：分段累進計費（水電費），合併計費時「省一次基本費」與「用量被推進更貴的段」方向相反 |

**審題揪出來的問題（都已修）——這幾類坑值得記住**
- **圖標籤被線壓住**：C-B5-02 的頂點 E 距離 AC 只有 1.9px（字半寬就有 4px），印出來就是被劃掉。
  成因是 `geometry_renderer.render_triangle` 算形心固定除以 3，但那張圖有 8 個點 → 假形心跑到畫布外，
  害所有標籤被統一往左上推。解法是把三角形整個往左傾，順著推的方向擺（沒有改共用的技能檔，
  因為 chezmoi 一更新就會被蓋回去，卡片必須自己站得住）。
- **干擾項被題幹前提白刪**：C-B2-05 原本題幹寫死「人數未滿 k 人」，但有三個干擾項恆 ≥ k，
  學生只要看懂前提就能先刪三個。改成不寫上界，把分段規則全部交給公告承擔。
- **課綱代碼掛錯**：C-G-02 原掛 A-7-3（一元一次方程式應用），但三個小題全是照選文規則代入四則運算，
  沒有未知數也沒列式 → 改掛 N-7-3。
- **圖形比例失真**：C-B5-03 的 `center` 元件是固定示意圖（高:底 0.95），但原約束允許 0.5～2.0，
  最壞差 2.1 倍 → 收緊約束到 0.6～1.667。（上游 `render_triangle_center` 不吃 vertices，只能靠約束補救）
- **除數不友善**：C-B5-03 原本會出現「9612 ÷ 89」這種無計算機難做的長除法 → 加約束讓除數必含 2/3/5 因數。
- **文字重覆**：C-B5-02 在 u=1 時會印出「相似比 AD：AB = 7：16 = 7：16」→ 參數改為 u ≥ 2。

**模板庫現況：選擇 22 張（易5／中7／難10）＋非選 9 張**，冊別 B1 4／B2 6／B3 2／B4 3／B5 3／B6 4。
`scripts/selftest_all.py` 端到端全過。

**完整模擬卷範例**：`data/questions_SIM115.json`（25 選擇＋2 非選，與會考卷面同構）
- 難度 易7／中8／難7＋題組 3（固定在 23–25 題）
- 正解字母 A7 B6 C7 D5
- 七題難題**全部用不同的卡**（相似／三心／圓／畢氏／平行四邊形／甲乙判斷／二次函數）

### ✅ 2026-08-06（六）非選擴充到 12 張（每冊各 2 張、八種問法）
| 新增卡 | 冊 | 問法 | 骨架 |
|---|---|---|---|
| E-B1-N1-07 | B1 | 可能型 | 拼貼紙片：最小公倍數定每層片數 → 比例式解層數 k，**k 不是正整數就不可能** |
| E-B3-N2-08 | B3 | 能否型 | 螢幕尺寸：4:3:5 直角三角形 → 吋換公分 → 加散熱空間比寬度 |
| E-B6-N1-09 | B6 | 可能型 | 平均數範圍換算成總和範圍 → 後兩回合 16 種等可能 → 求機率 |

三張都刻意讓**兩種結論都會出現**（不像官方原題只有一種答案），學生非算不可：
- E-B1-N1-07：可能 78 組／不可能 540 組
- E-B3-N2-08：能 62 組／不能 42 組
- E-B6-N1-09：可能 116 組／不可能 28 組（不可能＝後兩回合最多 8 分卻需要 9 分以上）

⚠ 設計「兩種結論都要出現」時，第一版常常只生得出一種。E-B6-N1-09 第一版加了 `cnt >= 3`
（保證有解）就永遠是「可能」；放行 `cnt == 0` 的情形、並把前 8 回合的總分下限從 16 放寬到 13
之後才兩種都有。驗證器的「結論恆為 X」警告就是抓這個。

### ✅ 2026-08-06 補齊舊批次的「紅筆圖連結」欄
- 症狀：7/23「會考數學複習卷_非選0723」36 份只有「紅筆圖ID」、「紅筆圖連結」是空的
  （那批跑的時候連結欄還沒加），老師在試算表點不開圖。
- 根因：`make_redpen.py` 的補上傳判斷只看「紅筆圖ID 是否為空」→ 有 ID 沒連結的舊資料永遠補不到。
  已改成**兩欄任一為空就補傳**。
- 修法：本機 `redpen_out/` 52 張圖都還在 → 直接重跑 `make_redpen.py --quiz "會考數學複習卷_非選0723"`，
  走「已存在，略過」分支（**不會重新呼叫 AI、不重畫圖、零成本**），只把圖重新上傳並回寫兩欄。
- 結果：36/36 補齊；連兩卷共 52 份現在都有可點的 Drive 連結（實測 200、image/png）。
  GAS 上傳時會先刪同名舊檔再建新檔，Drive 不會留垃圾；檔案ID 會更新，但覆核頁／學生端都是即時讀試算表，不受影響。
- ⚠ 時機安全性：Code.gs **沒有用 LockService**，且此操作只 setValue 既有列、學生交卷是 appendRow 新列，
  兩者不衝突，所以考試進行中也能安全補寫。

### ✅ 2026-08-06（七）評分規準補上「等價解法」與「典型錯誤」兩層
**起因**：把生成的規準與官方 114-N1 逐級分指引並排比對後，找出兩個實質落差
（結構、L0/L1 用語、L3 收尾句都已一致，落差在內容層）：
1. **官方 L3 會列多條解法路徑**（列方程式／文字說明含符號推導／列舉檢驗），生成的只寫一條
   → 學生換方法解對，AI 可能誤判。
2. **官方 L2 帶著真實學生的錯誤樣態**（「誤以 2 為調整倍率」這種從樣卷歸納的具體誤答），
   生成的只有抽象的「出現計算錯誤」。

**做法**：模板卡新增兩個欄位，`build_rubric()` 生成規準時併入
- `alt_paths`：等價解法路徑 → 寫進 L3（「改用下列任一等價解法並得到正確結果，同樣給三級分」），
  同時各生一條 checkpoint（id 為 a1、a2，與 c2/c3 同等效力）
- `common_errors`：`[{text, level}]` → level 2 的寫進 L2「本題常見的二級分情形」、level 1 的寫進 L1
- `grade_essays.py` 也會把這兩段餵給批改模型，並明講「學生改用等價解法且結果正確，不可因方法不同扣分」

**12 張非選卡全部補齊**（每張 2 條等價解法 ＋ 4 項典型錯誤，內容依各卡數學骨架量身寫）。
例：E-B2-N1-05（民調加權）的 L2 現在會寫出「誤以 2 為 60 歲以上組的調整倍率（把另一組的套過來）」、
「調整後的式子漏乘倍率」、「算出數值但沒寫百分比符號」——與官方樣卷歸納出來的那層同性質。

**還是做不到的（必須誠實記著）**
- 真實學生的錯誤分布與邊界裁量，只有樣卷（真人答案）才有。生成的規準是「結構正確、內容合理」，
  但**沒有經過真實學生答案校準**。
- 定位不變：**AI 初評 → 老師覆核**。覆核頁可一鍵套用或逐份改，最後定分的是老師。
- 下一步的校準路徑：等生成題收到真實作答，比對 AI 初評與老師覆核的差異，反過來修錨點與 common_errors。

### ✅ 2026-08-06 紅筆批改新增「續寫解答」＋數學式真排版
**需求**：紅筆不只圈對錯，要**接著學生自己的思路把解答補完**，0 級分則直接給完整解答，讓學生能檢討訂正。

**做法：原圖下方延伸白區**（`annotate_redpen.py`）
- 新標註類型 `solution`：畫在**原圖下方自動延伸出來的白區**，不佔用學生作答空間、不會壓到手寫字。
  高度依內容自動計算（`--extend` 可手動指定比例）。
- **原圖像素依然逐位元不動**：延伸區是新增畫布，`--verify` 只比對原圖區域，實測仍「無差異」。
- 相對座標基準仍是**原圖**尺寸（`self.H`），所以既有標註的座標完全不受延伸影響；
  畫布實際高度另存 `self.CH`（get_overlay／note 夾邊界都改用它）。

**數學式改用真排版（回答「能不能用 OMML」）**
- ⚠ **OMML 不可行**：那是 Word 文件內的 XML，只有 Office 排版引擎認得，PIL 畫不出來。
- ✅ 改用 **matplotlib 內建 mathtext**（LaTeX 子集，**不需安裝 LaTeX**）把數學式渲染成透明紅色 PNG 再貼進紅筆層。
  AI 只要把數學式用 `$...$` 包起來寫 LaTeX（`\frac{}{}`、`^{}`、`\sqrt{}`、`\ge`…），
  就會排成真正的分數線與上標。字級換算：`FontProperties(size=字級px)` 配 `dpi=72`，與中文字級相配。
- `layout_rich()` 做中文與數學式混排斷行（中文可逐字斷、數學式視為不可切開的一塊），
  `solution` 與 `note` **共用**這套排版——note 裡的 `$a+b$` 也會正確渲染（第一版漏了 note，實測才抓到）。
- 渲染在**超取樣尺度**進行，數學式是原生高解析度，不是放大的模糊圖。
- 失敗防護：mathtext 渲染失敗 → 該段退回純文字，不讓整張圖掛掉。

**字型缺字防護（既有隱藏問題，順手修掉）**
- 用 fontTools 讀 msjh.ttc 的 cmap 實測：**缺 `−`(U+2212)、`✓`、`✔`、`✗`、`⇒`、`≤`、`≥`**，
  直接畫會變成「□」方框——現有那 52 份紅筆圖只要 AI 寫了這些符號就已經是方框。
- `safe_text()` 依 cmap 自動替換成同義且有字形的字元（`−`→`-`、`✓`→`√`、`≤`→`≦`…）；
  缺字又無替換時印警告，不靜默吞掉內容。note／solution／標題都會過這層。

**AI 端（`make_redpen.py`）**
- prompt 依級分決定續寫程度（`solution_rule()`）：
  **0 級**＝直接給完整解答（從設未知數寫到答案）／**1 級**＝從他做對的最後一步接下去／
  **2 級**＝從他卡住算錯的那一步接下去／**3 級**＝不重寫，改寫「延伸提醒」。
- 明確要求「**接著學生自己的思路與符號**，不要另起一套標準解法」（他設 x 就繼續用 x、用列舉就順著列舉），
  開頭先承接他哪裡對，過程要完整可抄寫、要有「答：」，結尾一句「提醒：」。
- `sanitize()`：solution 不吃座標、不列入標註數量上限；非滿分卻沒產出 solution 會印警告。
- token 上限提高（推理型 9000／一般 3500），續寫是整段文字比純標註耗 token。

**實測**（真打 OpenAI，輸出只留本機、未上傳、未動試算表）
- 0 級分那份：完整解答含 `\frac{0.6a+0.5b}{a+b}=0.55` 等分數、有「答：」與「提醒：」，原圖未更動 ✓
- 舊的 `--demo`（沒有 solution）仍正常 → 向下相容 ✓
- ⚠ 寫測試資料時反斜線要用 raw string：Python 會把 `\f`(換頁)、`\t`(tab) 吃掉，
  導致 `\frac`→`rac`、`\times`→`imes`。**正式流程走 json.loads 不受影響**，只有手寫測試腳本要注意。
- ⚠ 考試期間打 GAS 抓資料曾 60s 逾時（學生同時在交卷）→ 重跑即可；
  要重畫已批過的圖可直接用 `redpen_out/<班-座>_<題號>.json` ＋ Drive 原圖，不必再經 GAS。

### ⚠ 2026-08-06 踩坑：一班一網址時，覆核頁／批改腳本的「卷名」要含班級後綴
- `build_quiz_site.py` 展開 classes 時，卷名會變成 `<卷名>｜<班級>班`（如
  「翰林模擬會考 111年第1次（第1~2冊）｜科資班」），**寫進試算表「試卷」欄的就是這個帶後綴的名稱**。
- 後端 `doGet ?essays=1&quiz=` 是**完全等值比對**（Code.gs 約 262 行 `r['試卷'] === p.quiz`），
  少了「｜科資班」就一筆都撈不到，覆核頁會顯示「沒有資料」。
- **當下解法**：覆核頁卷名欄**留白**（＝全部）＋勾「只看未覆核」；或貼完整含後綴的卷名。
- 批改腳本同理：`--quiz "翰林模擬會考 111年第1次（第1~2冊）｜科資班"`，
  **一個班一次**（909 班交卷後要再跑一次它自己的卷名）。
- 💡 待改善（未做，需要時再說）：把覆核頁的卷名比對改成「部分符合」——
  前端不傳 quiz 給後端、改在前端 filter（只需重新部署 bank 站，**不必請老師重新部署 GAS**）。

### ✅ 2026-08-06（八）易／中卡補齊到 29 張，並修好生成器的字母均衡缺陷
7 張新卡（多 agent 設計＋獨立審題，全部 FIXED 併入），補的是「每年必考清單」裡還沒建卡的考點：

| 卡 | 冊 | 難 | 考點 |
|---|---|---|---|
| C-B1-04 | B1 | 易 | 數線上兩點的中點（負數相加除以 2）|
| C-B3-03 | B3 | 易 | 二次多項式除以一次式求餘式 |
| C-B2-06 | B2 | 易 | 點的平移與水平線方程式 |
| C-B4-04 | B4 | 易 | 平行線截角（同位角／內錯角／同側內角）|
| C-B3-04 | B3 | 中 | 提共同因式解一元二次方程式（**審題改標中**：本庫 115-09 就標中，且本卡多了兩根同號要比大小的分支）|
| C-B5-04 | B5 | 中 | 圓心角、圓周角與弧度加總 |
| C-B2-07 | B2 | 中 | 直方圖判讀與中位數所在組 |

**⚠ 審題揪出的系統性缺陷（影響全庫，已修）**
C-B1-04 的審題 agent 發現：`gen_choice.make_question` 拿到 `build_options` 的 fallback 就 break，
**target_idx 落空時不會重抽參數**——等於有機率靜默破壞全卷 A/B/C/D 均衡（該卡實測 8 題出現 D=0）。
修法：
- `make_question` 不再負責畫圖，改回傳圖 spec；畫圖延後到「這組結果被採用」之後
- main 迴圈改成：目標字母沒達成就換一組參數重試（最多 40 次），最後才退回 fallback
- 這樣重試不會白畫圖，成本很低

同時審題也普遍指出「干擾項池結構性偏斜」：某些卡的干擾項恆在正解同一側，導致某個字母**根本放不到**。
各卡都補了「相對正解位移方向與其他項不同」的干擾項（例如 C-B3-03 補了 `d_e`、`d_negq0`；
C-B3-04 補了 `d_onlyb`；C-B1-04 補了 `d_leftmid`）。設計新卡時要主動檢查：
**池子裡比正解大的至少 3 個、比正解小的也至少 3 個**，否則 A 或 D 永遠出不來。

**其他審出的問題**：C-B3-04 的參數空間會生出與官方 115-09 逐字相同的題（已加約束排除）；
全形半形負號混用（已統一全形）；干擾項的 error 說明與該數值的算法對不上（已改寫）。

**模板庫現況：選擇 29 張（易 9／中 10／難 10）＋非選 12 張**，冊別 B1 5／B2 8／B3 4／B4 4／B5 4／B6 4。
25 題卷實測：前 8 題全部不同卡、字母分布 A6 B5 C9 D5。`selftest_all.py` 端到端全過。

### ✅ 2026-08-06 成績自動顯示會考等級（A++ ~ C）
**依據**：會考數學的等級**不是看答對幾題，而是看加權分數**（與本專案 100 分制同一公式）：
`(選擇答對/選擇題數)×85 + (非選級分/非選總分)×15`。心測中心每年在「各科等級加標示與答對題數
對照表」PDF 的備註裡，會公布該年 A++/A+/A/B++/B+/B/C 各自對應的**加權分數區間**。

- `scripts/fetch_grade_cutoffs.py`：自動抓歷年 PDF、解析數學科加權分數門檻、取平均 → `data/grade_cutoffs.json`。
  - 取得 **7 個年度：108、109、111、112、113、114、115**。
    未取得 106、107（官網找不到檔）、110（該年 PDF 沒有加權分數表）。
  - ⚠ 各年檔名規則不一：108 年標題多了「能力」二字（數學科**能力**等級加標示…），
    111／112 年收在「各科計分與閱卷結果說明」PDF 裡。腳本已逐一嘗試多組 URL 與措辭。
  - 解析後有自我驗證：A 的下限須等於「精熟」整體下限、B 須等於「基礎」整體下限，且門檻必須遞減，
    任一不符就整年捨棄，避免抓到英語科的同款表。
- **平均門檻（加權分數 ≥）**：A++ 93.41／A+ 87.31／A 78.08／B++ 68.39／B+ 59.14／B 39.15／C 以下。
- 學生卷「🔍 查我的非選批改結果」的加權總分底下，會自動顯示等級徽章（精熟綠／基礎橘／待加強紅），
  並註明「依 7 個年度平均換算，模考難度與正式會考不同，僅供參考」。程式搜 `__CUTOFFS__`／`gradeOf`／`gradeBadge`。
- 交叉驗證：選擇 23＋非選 0 → 78.2 分 → A，與 115 年官方對照表一致。
  用多年平均會比 115 年單年略嚴格（108–114 門檻較高），這正是取平均的用意——標準不被單一年份難易度帶走。
- 要更新門檻（例如 116 年考完）：重跑 `python scripts/fetch_grade_cutoffs.py` 即可，會自動納入新年度重算平均。
- ⚠ 回饋單 PDF 目前**沒有**等級：它只讀「非選作答」表（沒有選擇題分數），要加得另外併「作答紀錄」表。

### ✅ 2026-08-06（九）專案初始化：Obsidian 系統文件建置
需求：這幾個 session 的更動很大，要讓「日後分享專案時有足夠資訊，能在任何地方重建這個系統」。

**Obsidian `2026數學809/` 建立五份文件**
| 筆記 | 內容 |
|---|---|
| `專案工作流程.md` | 主索引：上次做到哪／下一步／規模／網址／三處同步（**開工 SOP 會讀這一份，檔名不要改**）|
| `01 系統重建指南.md` | 從零重建：環境需求（套件版本、字型缺字清單、外部技能）、外部服務設定（GAS 部署、試算表四張表、Cloudflare、OpenAI）、檔案地圖、資料檔與腳本用途、日常 SOP、驗收清單 |
| `02 自動命題系統.md` | 命題公式（非選四段式／選擇卷面藍圖）、模板卡 schema、生成器三件事、干擾項池＋目標字母、17 種圖元件、四道品質防線、擴充流程與設計要訣 |
| `03 非選AI批改與評分規準.md` | 批改閉環、官方規準三層、四錨點生成法、等價解法與典型錯誤兩層補強、能與不能的誠實評估、紅筆續寫、成績等級門檻 |
| `04 踩坑總表.md` | 五類共 40+ 條坑與根因（AI 與生成／字型與渲染／資料與程式／線上服務／教學內容）|

**文件分工定調**（避免內容散在三處）
- 專案 `CLAUDE.md`：規劃藍圖、語言風格、地雷提醒
- `handoff.md`：進度交接（每次對話必讀，逐次工作紀錄）
- Obsidian：系統文件（換電腦、交接、對外分享時看）

`CLAUDE.md` 已補上 Obsidian 那一列與「文件分工」表，並在「每次對話開始請先做」加第 4 條。

### ✅ 2026-08-06（十）可分享化：集中設定、vendor 幾何渲染器、重建指南改寫
需求：讓別的老師能用**自己的 OpenAI key、自己的 Google 試算表**建立屬於他的題庫系統。
用 4 個 agent 稽核重建文件，找到 3 個 blocking＋6 個 major，全部修掉。

**1. 集中設定 `scripts/config.py`（新）**
原本 GAS 收卷網址寫死在 **8 支腳本**、字型路徑寫死在 **4 支共 11 行**，換人要逐支改。
現在讀取順序：環境變數 `MATH809_*` → `data/config.json` → 內建預設（＝本班現值，**行為完全不變**）。
- `data/config.example.json` 是範本，`config.json` 已 gitignore
- `python scripts/config.py` 印出每個值與**來源**，並在必改項目還停在預設值時警告
  → 這條警告專門擋「沒建 config.json 就靜默把資料送進原作者試算表」這個坑
- 已收斂：`submit_url`／`quiz_project`／`bank_project`／`quiz_site_url`／`bank_site_url`／
  `openai_env_file`／`grade_model`／`font_files`
- 改吃 config 的腳本：build_html（含前端 `__SUBMIT_URL__` 佔位）、build_quiz_site（`--project`／`--site-url`，
  **紙本 QR code 就是取這裡**）、grade_essays、make_redpen、make_feedback_pdf、make_review_sheet、
  reset_review、gen_reviews、figures、annotate_redpen、make_essay_print

**2. 幾何渲染器 vendor 進專案**
`scripts/vendor/geometry_renderer.py`（附 README 說明來源與更新方式）。
原本 `figures.py` 指向 `~/.claude-skills/jh-math-geometry/scripts/`——那是開發者本機的全域技能，
別人拿到專案時**沒有那個檔案**，8 種幾何配圖會在渲染當下才丟 ModuleNotFoundError。
現在載入順序：先找 `vendor/`，找不到才回頭找全域技能。

**3. 其他修正**
- `requirements.txt`（新）：套件與版本對照，`pymupdf` 的 import 名稱是 `fitz` 有註明
- `netlify_deploy/index.html`／`practice.html` 從版控移除（`git rm --cached`）——
  這兩個建置產物**烤入了收卷網址與 token**，別人誤部署會把學生資料寫進原作者的試算表
- `deploy_bank.py` 加停用警告（Netlify 時期的腳本，SITE_ID 是原作者的站）
- **參數空間枯竭修正**：`gen_one` 第一輪跳過用過的簽章，全部撞完時第二輪允許重用
  → 之前 C-B5-01 的 27 組全被 gen_log 用光，整份 25 題卷就生不出來。
  同時加大 C-B5-01（27→41）、C-B1-01（→640）、C-B6-01（→90）的參數空間

**4. Obsidian `01 系統重建指南` 大改寫**
新增：五分鐘版、GAS 從零部署（**強調 token 要自己改**、試算表是 `?setup=1` 自動建的不要手建）、
輕量路線（只用題庫不用 AI 批改需要什麼）、**打包分享前必刪清單**（.wrangler 含帳號、redpen_out 含個資、
翰林卷版權、config.json）、對方拿到後要清空 quizzes.json 的提醒、字型症狀對照表。

`selftest_all.py` 全過。

### ✅ 2026-08-13 派新卷：自編非選 2 題（第1~2冊）給 909 班
**這份卷是什麼**：用非選模板庫生成的自編卷，2 題非選、範圍 B1＋B2。老師先看過題目才定案。
- `G0813-N1`（E-B1-N1-01 足夠型／B1 指數律）：綠藻培養，每 24 小時分裂成 4 個、15 天 → 4 的 15 次方；
  已知 10 億介於 2 的 29～30 次方，判斷是否足夠做 8 公克。**答：k = 15／不足夠**（要用**下界** 2 的 32 次方 才判得出來）。
- `G0813-N2`（E-B2-N1-02 一定型／B2 比與比例式）：保護效力公式，甲公司 40／200 → 80%；
  問乙公司效力更高時，使用組碰傷數是否一定較少。**答：80%／不一定**（反例 80、4000 → 98%）。
- 兩題結論都反直覺（不足夠／不一定），亂猜過不了，呼應「會算但寫不出過程」的教學觀察。

**生成方式（可完全重現）**
```
python scripts/gen_essay.py --template E-B1-N1-01,E-B2-N1-02 --n 2 --seed 20260825
```
⚠ 定案前一律先加 `--dry` 給老師看；同一個 `--seed` 才會生出同一題。

**上線內容**
- `data/questions_G0813.json`（2 題）＋題幹圖 `01_題目圖片/GEN/G0813-N*.png`；規準併入 `data/essay_rubrics.json`（現 36 題）
- 手動微調一處：詳解「兩者指數 30 ≤ 32」→「30 < 32」（模板通式用 ≤ 沒錯，但本題實際是嚴格小於，讀起來才順）。
  questions 檔與 essay_rubrics 的 answer_points 兩處都改了
- `data/quizzes.json` 加 `b1b2-essay-0813`（`classes: ["909"]`、`print: true`），
  卷名「**數學非選練習卷 第1~2冊（0813）**」——⚠ 試算表 key 是 `數學非選練習卷 第1~2冊（0813）｜909班`，**不要改**
- **學生網址**：https://math809-quiz.pages.dev/q/b1b2-essay-0813-909/ （含紙本 PDF 3 頁，封面 QR 指向同一網址）
- 兩站都已 deploy（quiz／bank）。⚠ 順手補上：`bank_site/01_題目圖片/GEN/` 原本**不存在**，
  所以題庫站上 G0805／M0806／SIM115 這些生成題一直是缺圖狀態；這次把 46 張 GEN 圖一起複製並部署，已修好。

**驗證**：題幹圖目視（無缺字方框）／`node --check` 兩個 script 區塊全過／線上作答頁、print.pdf、入口頁皆 200／
瀏覽器實測 909 班鎖定唯讀、兩張題圖載入（1000×778、1000×870）、2 個手寫畫布與拍照鈕都在；測完清 localStorage，**未送出任何測試交卷**。

**⏭️ 學生交卷後**
```
python scripts/grade_essays.py     --quiz "數學非選練習卷 第1~2冊（0813）｜909班"
python scripts/make_redpen.py      --quiz "數學非選練習卷 第1~2冊（0813）｜909班"
python scripts/make_feedback_pdf.py --quiz "數學非選練習卷 第1~2冊（0813）｜909班"
```
→ 再到 math809-bank「✍ 非選覆核」定分。⚠ 這兩題的規準是**生成的**（`confidence: generated`），非官方原件，務必逐份看過。

**新工具 `scripts/make_essay_solution.py`（詳解卷 PDF）**
每題＝題目圖＋參考答案＋詳解＋解題步驟＋陷阱＋0～3 級分給分標準，A4 platypus 排版。
```
python scripts/make_essay_solution.py --ids G0813-N1 G0813-N2 --title "卷名" --out "輸出.pdf"
```
- 本卷成品放在 `數學非選練習卷 第1~2冊（0813）/`（詳解＋紙本各一份）。⚠ `.gitignore` 排除 `*.pdf`，**這資料夾不會進版控**，換電腦要重跑指令。
- ⚠ **詳解卷含答案，不可放進學生站**。
- 踩到的兩個坑：reportlab `ParagraphStyle` 的 `leading` 不能同時出現在 `**base` 與具名參數；規準文字含 `<` `>` 必須跳脫，但自己寫的 `<b>` 要用 `raw=True` 放行（第一版印出字面的 `<b>三級分</b>`）。
- 字型：實測 msjh 缺 `≤` `≥` `⟺` → `safe()` 自動換成 `≦` `≧`「等價於」。

### 🐛 2026-08-13 修復：批改鏈路 5 支腳本全部無法啟動（漏 import）
**症狀**：`grade_essays` / `make_redpen` / `make_feedback_pdf` / `make_review_sheet` / `reset_review`
一執行就 `NameError: _CFG_SUBMIT_URL is not defined`（`make_feedback_pdf` 是 `_cfg`）——**連 `--help` 都跑不起來**。
**根因**：8/6「集中設定 config.py」重構時，這 5 支改用了 `_CFG_SUBMIT_URL()`／`_cfg()`，
但**只有 `build_html.py`／`build_quiz_site.py` 補了 import**。派卷鏈路正常，所以一直沒被發現；
真正會炸的時間點是「學生交完卷、老師要批改」的那一刻。
**修法**：每支在 `HERE` 之後補
`sys.path.insert(0, str(HERE))` ＋ `from config import SUBMIT_URL as _CFG_SUBMIT_URL, get as _cfg`
（`reset_review` 原本連 `pathlib.Path` 都沒 import，一併補上）。
**驗證**：5 支 `--help` 全 OK；解析出的收卷網址都等於正式網址（含 `?token=math809`）；
`make_review_sheet` 實跑一次唯讀查詢，後端正常回「查無資料」（該卷還沒人交卷）。
**教訓**：這類「模組層級才會執行」的錯誤，`selftest_all.py` 沒涵蓋到 → 值得加一條「每支 CLI 腳本跑 `--help`」的煙霧測試。

### ✅ 2026-08-13 現場實戰：909 班 23 人交卷 → 批改 → 覆核 → 紅筆，全程 25 分鐘
**時程**：學生 10:45–11:05 交卷；`watch_grade.py` 輪詢 6 輪（10:45–11:09）全部批完；紅筆 46 份 11:05–11:15。

**結果**：23 人 46 筆，AI 批改 46／覆核 46／紅筆圖 46（原圖全部驗證逐位元未更動）。
**非選平均 2.83/6**　N1：0級5／1級3／2級14／3級1　N2：0級1／1級13／2級9
- 教學觀察一：N1 有 **14 人卡在 2 級**——算得出 4¹⁵ = 2³⁰，但忘了把「8 公克」乘進所需個數就下結論。同一個錯誤集體出現，適合全班講一次。
- 教學觀察二：N2 有 **13 人停在 1 級**——算得出 80%，但舉不出反例、或舉了反例沒代回公式驗證。「舉反例要驗證」全班都需要練。
- 只有 1 個 3 級（座號 26 的 N1）。⚠ 待抽查：座號 6 的 N1（0 級但信心 0.32）、座號 13（兩題皆 0）、座號 26 的 N1（唯一 3 級但信心 0.62）。

**新增／改動的工具**
| 檔案 | 內容 |
|---|---|
| `scripts/watch_grade.py`（新）| 交卷期間定時輪詢增量批改。`--start/--end/--interval/--jobs/--votes`，結束後再補跑 2 輪收尾 |
| `scripts/apply_ai_review.py`（新）| 命令列版「一鍵套用全部 AI 級分」。預設只處理老師還沒覆核的，**不會蓋掉已改過的分數**（`--force` 才會）|
| `grade_essays.py` | 加 `--jobs`（平行）、`--chunk`（每 N 筆回寫一次，預設 8）、`--limit`；三次投票全失敗改列「未完成」不回寫空值 |
| `make_redpen.py` | 加 `--jobs`，matplotlib 繪圖上鎖。**46 份從 30–45 分鐘縮到 8 分鐘** |

**避免 Google 寫入阻擋的設計（實測全程沒逾時、沒衝突）**
- 平行只發生在 **OpenAI 呼叫**，Google 那邊維持「一輪 1 次 GET ＋ 少量批次 POST」
- 學生交卷是 `appendRow`、我們回寫是 `setValue` 既有列，兩者不衝突（Code.gs 沒有 LockService）
- 紅筆圖上傳固定 6 份一批
- ❌ **不要用 sub-agent 平行批改**：瓶頸是 OpenAI 的網路等待，執行緒就解決了；多行程反而變成多個來源同時對 Google 寫入，正是要避免的

**收工時踩到的兩個坑（已寫進 Obsidian 踩坑總表）**
1. `git push` 無參數會推到 **`visual-deck/main`**（另一個專案的 repo，領先 51 個 commit）。
   已 `git branch --set-upstream-to=origin/main main` 修好；**以後一律寫明 `git push origin main`**。
   當時該推送已被中止，`git ls-remote visual-deck main` 確認遠端沒被改到。
2. `.git/index.lock` 幽靈鎖檔時，`Get-Process git` 看到的可能是 **`git fsmonitor--daemon`（常駐檔案監控服務）**，
   那不是卡住的操作，看到它不代表不能刪鎖檔。要確認的是有沒有 `git commit`／`push` 之類的程序。

**⏭️ 下一步**
- `make_feedback_pdf.py` 個人回饋單尚未產（不必再花 AI 費用）
- **用這批真實作答校準規準**：比對 AI 初評與老師改分的差異，回頭修模板卡錨點與 `common_errors`（等很久的校準資料到手了）
- `selftest_all.py` 建議加「每支 CLI 腳本跑 `--help`」的煙霧測試
- `會考題庫單檔版.html` 是 28MB 建置產物卻在版控裡，每次 commit 都塞進歷史 → 考慮 `git rm --cached`


---

### ✅ 2026-08-31 交接檔體系：新增 AGENTS.md，handoff 加現況總覽

**背景**：之後會有 Codex 或其他 agent 接手，需要一份「讀完就能動手」的入口文件。
原本只有 `CLAUDE.md`（規劃藍圖）＋本檔（逐次紀錄）＋ Obsidian 五份（系統文件），
但新 agent 不知道該先讀哪份，而且本檔開頭停在 2026-07-13 的 Netlify 時期，**會直接誤導**。

**做了什麼**

1. **新增 `../AGENTS.md`（根目錄，270 行）**——Codex 的慣例入口檔名，Claude Code 也讀得到。九節：
   0 六十秒摘要（四個子系統一表看完、沒有後端伺服器）／1 開工先讀哪份（依情境分流到 handoff／
   命題報告／Obsidian 四份）／2 環境（Python 3.14、requirements、`config.py`、字型缺字清單、
   vendor 幾何渲染器）／3 專案地圖＋主要資料檔一覽／4 常用指令（題庫／派卷／命題／批改／部署）／
   5 硬性規則 12 條／6 多 agent 協作／7 目前狀態與待辦／8 驗收（`selftest_all.py`）／9 禁止事項。
2. **新增 `AGENTS.md`（本目錄，29 行）**——agent 若直接在 `會考題庫/` 起手也接得住，指回上層。
3. **本檔開頭加「⚡ 現況總覽」**，並在最上面明講「底下最前面幾段是 7/13 的舊狀態，不代表現況」。
4. `../CLAUDE.md` 加一行指向 AGENTS.md；順手修掉「配圖元件 13 個」（實際 17 種）。

**踩到的坑**

- **heredoc 不能包 heredoc**：原本想用 `cat > AGENTS.md <<EOF` 寫檔，但內容第 6 節有
  `python - <<PY` 的示範，bash 解析外層時炸掉（`unexpected EOF while looking for matching`）。
  → 改用 Write 工具直接寫檔。**要寫「內容含 shell 語法」的文件，別用 heredoc。**
- **python heredoc 裡的 Windows 路徑要用 raw string**：`C:\Users\...` 的 `\U` 被當成
  unicode escape，噴 `SyntaxError: truncated \U escape`。→ 字串前面加 `r`。這個坑踩了兩次。
- **寫進文件的數字要現查**：憑印象寫的「data 43 個 JSON／scripts 36 支」實際是 45／38；
  Obsidian vault 路徑也寫錯（不是 `Documents\Obsidian Vault`，是 `Documents\secondbrain`）。
  → 都用指令核對過才留下。交接檔寫錯數字比不寫更糟，會讓接手的人以為自己漏了東西。

**⏭️ 下一步**（延續上一段，未變）
- 用 909 班那批真實作答校準評分規準
- `data/questions_SIM115.json` 派出去試作
