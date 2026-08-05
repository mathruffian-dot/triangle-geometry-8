# 會考題庫建置 — 進度交接

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
- Apps Script 專案：「會考題庫收卷」（帳號 mathruffian@gmail.com，執行身分：我、存取：所有人）
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
| └ `/q/hanlin-1-<班級>/` | 翰林模擬卷**各班專屬**（班級內建鎖定，學生只填座號）902/904/906/907/908/909/910 |
| └ `/q/hanlin-1/` | 翰林卷原始網址（保留，已發出去的不失效） |
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

**題庫現況**：385 題（103-115 官方 358 ＋ 翰林模擬 27）。評分規準 28 題（103-114 官方 ＋ HL1-N1/N2 取自翰林解答篇的評分指引）。

**翰林卷成績（8人，平均87.6）**：902-9陳昱翔100 ／904-8 95 ／910-5邱楷翔95 ／904-16 89.1 ／908-5洪宣典88.2 ／908-13謝沛翰87.5 ／906-16沈淳迦79.8 ／307-1王敦珩66.2。
教學觀察：4人選擇滿分但非選平均僅3.25/6；908-13 選擇25/25、非選僅1/6（會算但寫不出過程）。

**⚠ 未完成／待辦**
1. **GAS 尚未部署最新版**（本機 apps_script/Code.gs 312行、含 `_nid()` ×9）。老師多次貼上失敗：Drive 同步延遲拿到舊檔、或複製被截斷（曾只貼到第100行）。**建議做法：請 Claude 直接把檔案傳給老師**（SendUserFile），用記事本開啟複製，貼完確認**最後行號是 312**、搜 `_nid` 有 9 個。
   - 未部署只差「後端寫入時再正規化一次」這層保險，前端已上線、現有功能全部正常。
2. **髒資料待老師手動刪**（後端無刪除接口，老師指示先不加）：試算表刪「非選端對端測試卷」全部、以及 809-9／915-38（試玩）。
3. **307-1 王敦珩**為真實學生填錯班級 → 待老師告知正班級後改試算表班級欄。309-1／309-12（B1_B2卷）也待確認。
4. 908-13 的 HL1-N1 曾上傳成 0 bytes，已重交補批（現有空圖防護擋下此情形）。

### ✅ 2026-08-05 已搬家到 Cloudflare Pages（正式啟用）
- wrangler 已登入 mathruffian@gmail.com。建立兩個 Pages 專案並部署成功：
  - **https://math809-quiz.pages.dev** ← 學生站（單站多卷）：`/`入口頁、`/q/0723/`、`/q/essay-all/`、各卷 `print.pdf`、`/practice.html`。全部實測 200。
  - **https://math809-bank.pages.dev** ← 老師題庫（含覆核頁/一鍵套用AI/抽題/新UI快捷鍵），359 檔含題目圖片。
- 部署指令（之後派新卷就這兩行）：
  `python scripts/build_quiz_site.py` → `npx wrangler pages deploy quiz_site --project-name math809-quiz --branch main --commit-dirty=true`
  題庫：`python scripts/build_html.py` → 複製 index.html+01_題目圖片 到 bank_site → `npx wrangler pages deploy bank_site --project-name math809-bank --branch main --commit-dirty=true`
- 派新卷流程：編輯 `data/quizzes.json` 加一筆（code/title/qids/note）→ build_quiz_site → deploy。**所有卷一起部署＝1次部署**，不再有 Netlify credit 問題。
- GAS 已部署 v3：去重生效（40→36）、AI辨識內容欄可寫入。
- Netlify 舊站保留不動（math809-essay 已發出去的網址繼續有效；math809-quiz 舊複習卷）。⚠ math809-review4 為 404（第四冊簡報掛了，待修）。

**⚠ 待辦（需老師操作）**
- Netlify CLI 目前登入 `gameruffian@gmail.com`，但 math809-* 站台在 `mathruffian@gmail.com` → 要部署得先 `netlify logout` 再 `netlify login` 切回。
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
