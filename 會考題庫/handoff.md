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
