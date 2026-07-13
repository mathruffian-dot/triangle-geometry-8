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

## 新年度（116）擴充 SOP
1. `download_exams.py` 年份範圍改 116 → 下載
2. `probe_anchors.py` 確認錨點 → `crop_questions.py` 切圖 → 抽查 2–3 張
3. 答案表用「目視」讀，寫入 official_answers.json
4. 手寫 `data/questions_116.json`（欄位格式見 README 或既有檔案）
5. `validate.py` → `build_html.py`
