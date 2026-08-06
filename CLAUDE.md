# 2026 數學 809

## 專案簡介
809 班（九年級）的數學教學數位工具總成，主軸是**會考準備**：
歷屆＋模擬試題題庫、線上作答卷（含非選手寫／拍照上傳）、AI 批改與紅筆回饋、
以及一～六冊全冊複習互動簡報。

## 語言與風格
- 所有回應、文件、程式註解皆使用**繁體中文**
- 修改前先確認計畫；優先保留原有資料結構
- 動到共用檔案前先讀最新內容，避免蓋掉其他 Agent 的變更

---

## 🚦 每次對話開始請先做

1. **讀 `會考題庫/handoff.md`** ← 最重要，裡面有「現況總覽」段（線上網址、常用指令、待辦）
2. 若使用者說「開工」→ 依全域 SOP 讀交接、看 git 狀態、報告下一步
3. 若要動會考題庫相關的東西，**務必先看 handoff.md 的待辦清單**（有幾項需要老師手動操作）

---

## 🔗 線上網址（現行主力）

| 網址 | 用途 | 給誰 |
|---|---|---|
| https://math809-quiz.pages.dev | 學生作答站入口 | 👨‍🎓 學生 |
| └ `/q/<卷代碼>/` | 各份卷（如 `/q/hanlin-1-902/` 為 902 班專屬） | 👨‍🎓 學生 |
| https://math809-bank.pages.dev | 題庫＋出卷＋**✍ 非選覆核** | 🔒 **老師專用，含詳解，勿發學生** |
| [收卷試算表](https://docs.google.com/spreadsheets/d/1vZg5vVUTym__8Fhht5vWeDq1Y6v5QOavIr-E-06DvDY/edit) | 作答紀錄／逐題明細／非選作答／出題紀錄 | 🔒 老師 |
| https://math809-review1〜6.pages.dev | 一～六冊複習簡報（第四冊為 `math809-review`） | 👨‍🎓 學生 |

> 舊的 Netlify 站（math809-quiz/bank/essay、review1~5）保留不動、勿更新；
> 主力已全數搬到 Cloudflare Pages（Netlify 免費改 credit 制，每月僅 300、每次正式部署扣 15）。

---

## 📂 資料夾結構

| 路徑 | 內容 |
|---|---|
| `會考題庫/` | **主要專案**：題庫、作答卷、AI 批改、紅筆回饋。細節見其 `handoff.md` |
| `複習網站一〜六/`（第四冊為 `複習網站/`） | 各冊複習互動簡報（共用同一套引擎，改引擎要六份一起改） |
| `出題/` | 題庫匯出的 PDF |
| `scripts/`、`working/`、`output/` | 教學影片製作（見 `教學影片製作規格書.md`） |
| `01〜06_114國中數學2下*PDF/` | 課本／習作等原始 PDF（已 gitignore） |
| `README.md` | 線上網址總覽與各子專案索引 |

---

## ⚙️ 會考題庫常用指令

```bash
# 派新卷：先編 data/quizzes.json 加一筆（可加 "classes":["902","904"] 自動展開成各班專屬網址）
python scripts/build_quiz_site.py
npx wrangler pages deploy quiz_site --project-name math809-quiz --branch main --commit-dirty=true

# 更新題庫站
python scripts/build_html.py
# → 複製 index.html + 01_題目圖片 到 bank_site/ 後
npx wrangler pages deploy bank_site --project-name math809-bank --branch main --commit-dirty=true

# 自編題（依模板生成，每次都不一樣；模板卡＝data/templates_essay.json／templates_choice.json）
python scripts/gen_essay.py --books B1,B4 --n 2     # 非選：依冊別生一份卷（N1+N2）
python scripts/gen_choice.py --paper 12 --tag M0806 # 選擇：依卷面藍圖生 12 題（易中難自動配比）
python scripts/gen_choice.py --books B1,B2 --n 6    # 選擇：限定冊別
python scripts/validate_templates_essay.py --n 40   # 改過模板卡就要跑
python scripts/validate_templates_choice.py --n 30
python scripts/figures.py --demo <資料夾>            # 配圖元件庫自測（13 個元件出圖）
# → 生成後 build_html.py 即進題庫；派卷把 M0806-01 之類 id 加進 data/quizzes.json

# 批改（增量，只批沒批過的；學生陸續交就陸續跑）
python scripts/grade_essays.py --quiz "卷名"
python scripts/make_redpen.py --quiz "卷名"        # 產紅筆批改圖並自動上傳
python scripts/make_feedback_pdf.py --quiz "卷名"  # 個人回饋單 PDF
```

---

## ⚠️ 這個專案的地雷（踩過的，別再踩）

- **AI 生圖批改不可用**：實測 gpt-image-2 改圖會「重畫」整張圖，4 份樣本 2 份**竄改學生內容**
  （等號被改成 ≠、手寫被抹除）。一律用 `annotate_redpen.py` 程式化疊加（原圖逐位元不動）。
- **產生 HTML/JS 後要用 `node --check` 驗語法**，不要只靠肉眼。曾因跳脫字元寫錯導致整頁 JS 失效。
- **題目圖的字型缺字**：微軟正黑體沒有 ⁴~⁹ 上標、∼、≈、⅔（渲染成方框，PIL 與 cairosvg 都不會自動 fallback）。
  指數寫「10 的 n 次方」、約等於寫「約」。可安全使用：² ³ ° ∠ △ ≦ √ ×
- **自動生成的選擇題要防「多重正解」**：干擾項可能也符合題意（夾擠型踩過一次）。
  驗證器抓不到這種錯，新模板卡上線前要人工或請另一個 AI 逐題審。
- **0 是合法級分**：JS 的 `0 || ''`、Python 的 `0 or ""` 都會把 0 級當成空值，務必顯式判斷。
- **Google Sheets 會把 "09" 自動轉成數字 9**：班級／座號一律正規化（去前導零）再比對。
- **Drive 同步延遲**：老師從雲端開檔可能拿到舊版。要老師貼 Code.gs 時，**直接用 SendUserFile 把檔案傳給他**，並請他確認行數與關鍵字數量。
- **學生個資**：`redpen_out/`、回饋單 PDF 含姓名座號與手寫作答，已 gitignore，**不可上傳公開處**。
- **版權**：官方試題屬心測中心、翰林模擬卷屬翰林，僅供班級教學使用，勿散布。
- **GDrive 幽靈鎖檔**：commit 失敗時刪 `.git/index.lock` 再試。

---

## 三處同步指引

| 平台 | 路徑 | 用途 |
|---|---|---|
| Google Drive | `G:\我的雲端硬碟\2026數學809\` | 主要工作目錄 |
| GitHub | `mathruffian-dot/triangle-geometry-8`（私有） | 版本控制備份。⚠ repo 名稱與專案不符，是早期沿用 |
| Cloudflare Pages | math809-quiz／math809-bank／math809-review* | 線上部署 |

## 敏感檔案（未進版控，換電腦要手動建）
`~/.openai.env`（AI 批改用）、`~/.groq_api_key`、`~/.kie.env`
