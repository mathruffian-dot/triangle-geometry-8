# 2026 數學 809｜教材與工具總覽

本專案（Google Drive `2026數學809`）彙整 809 班的數學教學數位工具：會考題庫、線上測驗、
全冊複習互動簡報等。以下為**線上網址總覽**與各子專案索引，方便日後查找。

---

## 🔗 線上網址總覽

### 📝 線上測驗／練習（可發學生）
| 用途 | 網址 |
|------|------|
| 會考題庫・學生作答卷 | https://math809-quiz.netlify.app |
| 觀念補強・學生練習頁（56 單元、即時回饋） | https://math809-quiz.netlify.app/practice.html |

### 📖 全冊複習簡報（可發學生）

**主要網址（Cloudflare Pages，建議發這一組）**

| 冊別 | 內容 | 頁數 | 網址 |
|------|------|------|------|
| 第一冊（七上） | 整數的運算／分數的運算／一元一次方程式 | 60 | https://math809-review1.pages.dev |
| 第二冊（七下） | 聯立方程式／直角坐標／比與比例式／不等式／統計／生活中的幾何 | 85 | https://math809-review2.pages.dev |
| 第三冊（八上） | 乘法公式與多項式／平方根與畢氏定理／因式分解／一元二次方程式／統計資料處理 | 71 | https://math809-review3.pages.dev |
| 第四冊（八下） | 數列與級數／函數／三角形的基本性質／平行與四邊形 | 67 | https://math809-review.pages.dev |
| 第五冊（九上） | 相似形／圓／幾何與證明 | 42 | https://math809-review5.pages.dev |
| 第六冊（九下） | 二次函數／統計與機率／立體圖形 | 39 | https://math809-review6.pages.dev |

**備援網址（Netlify，同內容）**：把上表網址的 `.pages.dev` 換成 `.netlify.app` 即可
（`math809-review1.netlify.app`⋯⋯）。兩邊都會保留，Netlify 版本仍可用。

> 六冊**各自獨立網址**，可單獨發給學生。全部同一套規格：一頁一重點、視覺化演示＋範例、
> 一頁一螢幕自動縮放、範例／圖解可放大成整頁（HTML 內容會等比放大字級）、
> 授課教具（雷射筆＋畫筆）。合計 **364 頁、約 169 頁互動**。

### 🔒 老師專用（⚠️ 勿發學生）
| 用途 | 網址 |
|------|------|
| 題庫系統（含全部詳解、出卷、統計、個人分析） | https://math809-bank.netlify.app |
| 收卷試算表（學生作答紀錄） | <收卷試算表連結，見 Obsidian 系統文件> |
| 收卷紀錄短網址（人工瀏覽用） | https://tinyurl.com/23739jgz |

### ⚙️ 系統串接（非人工點閱）
- 收卷 API（題庫 CONFIG／submitUrl 用，須帶 `?token=math809`）：
  `https://script.google.com/macros/s/AKfycbw-ePEfCoTB3SpwOh4g0IcfwsQWanQm8bvXgOGDdIECkK2845qIoKhH9xtRNuxu29wN/exec?token=math809`
  ⚠️ 短網址經 301 轉址會把 POST 變 GET，**不可**填進系統設定或 submitUrl。

> ⚠️ **題庫系統 `math809-bank` 含所有詳解，是公開連結——請只留給老師，勿轉發學生。**

### Cloudflare Pages（主要，部署用）
Cloudflare 帳號與 Account ID 見 Obsidian 系統文件，
用 wrangler OAuth 登入，專案名即網址前綴。**改版後重新部署**（在專案根目錄）：

```bash
npx wrangler pages deploy "複習網站二" --project-name math809-review2 --branch main --commit-dirty=true
```

| Pages 專案 | 網址 |
|------|------|
| math809-review1 / 2 / 3 / review / review5 / review6 | `https://<專案名>.pages.dev` |
| math809-quiz、math809-bank | 同上（由非選題批改系統維護） |

> ⚠️ 若 wrangler 報 **Project not found** 或帳號不對，先確認環境變數
> `CLOUDFLARE_API_TOKEN` 沒有指向別的帳號；wrangler 的 OAuth 憑證在
> `%APPDATA%\xdg.config\.wrangler\config\default.toml`。
>
> ⚠️ 首次部署後約 20～60 秒內 `*.pages.dev` 可能回 **522**（邊緣節點還在傳播），
> 稍候重整即可；瀏覽器若已快取錯誤頁，加上 `?r=1` 之類參數強制重取。

### Netlify 站台 ID（備援，部署用）
| 站台 | Site ID |
|------|---------|
| math809-quiz（學生作答卷） | `05be96f6-da95-4687-b3d5-39329a05220d` |
| math809-bank（題庫系統） | `afba03cf-46f7-4ab5-8b0d-54d6523fe98d` |
| math809-review1（第一冊複習） | `f4af3cbd-9a75-49cf-bfe5-220f74b4e639` |
| math809-review2（第二冊複習） | `b2b63e02-5301-4c61-9fe1-16d75f723ce0` |
| math809-review3（第三冊複習） | `6f56bec2-f044-424e-9dc2-6e11a2542a29` |
| math809-review（第四冊複習） | `3f28584a-030d-4f9f-8ef7-bea8c71e9235` |
| math809-review5（第五冊複習） | `67ac2ec1-45ba-476f-b0d4-15327819ef26` |
| math809-review6（第六冊複習） | `fdd55719-e0d0-4d40-9b44-b94a3f3beace` |

> 複習簡報改版後重新部署（`--prod` 自 2026-07-16 起回 403，一律兩段式）：
> ```bash
> netlify deploy --dir "複習網站二" --site <SITE_ID> --json
> netlify api restoreSiteDeploy --data '{"site_id":"<SITE_ID>","deploy_id":"<上一步 deploy_id>"}'
> ```

---

## 🧭 派卷流程：題庫系統 → 學生作答卷

題庫「🌐 匯出線上試卷」只是**下載一個可作答的 HTML 檔**（自帶收卷設定），
不會自動上線，要**部署**到 quiz 站才會到學生手上：

1. 題庫系統（bank）篩選 → 勾選題目 →「🌐 匯出線上試卷」下載 HTML 檔。
   ⚠️ 匯出前先確認該瀏覽器的「試算表收卷設定」已儲存，否則卷子的 submitUrl 為空、交卷不會上傳。
2. **路線 A｜用固定網址** `math809-quiz.netlify.app`（學生網址不變，一次一份卷）：
   把檔案改名 `index.html` 覆蓋 `會考題庫/netlify_deploy/index.html`，在 `會考題庫/` 執行兩段式部署
   （`--prod` 自 2026-07-16 起回 403）：
   ```bash
   netlify deploy --dir netlify_deploy --site 05be96f6-da95-4687-b3d5-39329a05220d --json
   netlify api restoreSiteDeploy --data '{"site_id":"05be96f6-da95-4687-b3d5-39329a05220d","deploy_id":"<上一步 deploy_id>"}'
   ```
3. **路線 B｜每卷各自網址**（多份並存）：把匯出的 HTML 直接拖進
   [app.netlify.com/drop](https://app.netlify.com/drop)，取得新網址發給學生。
4. 學生 iPad 填班級/座號/姓名作答 → 交卷自動批改選擇題 → 作答紀錄依收卷設定上傳試算表。

> **每次推卷都會留底**：因路線 A 會覆蓋 `netlify_deploy/index.html`（只留最新一份），
> 所以每次部署時另存一份 `會考題庫/卷子存檔/<卷名>.html` 並 commit 到 GitHub，
> 讓每一份派出去的卷子都永久保存（雲端硬碟＋GitHub）。要重掛舊卷見 `會考題庫/卷子存檔/README.md`。

> 出卷當下即記錄「出題紀錄」（防重複出題）；收卷、出題紀錄、個人分析詳見 `會考題庫/handoff.md`。

---

## 📂 子專案索引

| 子專案 | 說明 | 文件 |
|--------|------|------|
| 會考題庫 | 103–115 會考數學 358 題題庫＋線上測驗＋觀念補強 | [`會考題庫/README.md`](會考題庫/README.md)、[`會考題庫/handoff.md`](會考題庫/handoff.md) |
| 第一冊複習簡報 | 七上全冊複習互動簡報（複習網站一/） | [`複習網站一/README.md`](複習網站一/README.md) |
| 第二冊複習簡報 | 七下全冊複習互動簡報（複習網站二/） | [`複習網站二/README.md`](複習網站二/README.md) |
| 第三冊複習簡報 | 八上全冊複習互動簡報（複習網站三/） | [`複習網站三/README.md`](複習網站三/README.md) |
| 第四冊複習簡報 | 八下全冊複習互動簡報（複習網站/） | [`複習網站/README.md`](複習網站/README.md) |
| 第五冊複習簡報 | 九上全冊複習互動簡報（複習網站五/） | [`複習網站五/README.md`](複習網站五/README.md) |
| 第六冊複習簡報 | 九下全冊複習互動簡報（複習網站六/） | [`複習網站六/README.md`](複習網站六/README.md) |
| 複習簡報製作規格 | chN.js 撰寫規格（欄位、SV 工具、互動、版面） | [`複習網站五/SLIDE_SPEC.md`](複習網站五/SLIDE_SPEC.md) |
| 康軒 B1–B3 單元藍圖 | 第1~3冊章節／節次／學習目標／課綱代碼與邊界 | [`康軒版B1-B3單元藍圖.md`](康軒版B1-B3單元藍圖.md) |
| 4-1 平行互動簡報 | 根目錄 `index.html`（單元教學簡報，見下） | 本檔下方 |

---

## 4-1 平行互動視覺化簡報（根目錄 index.html）

聚焦「114 國中數學 2 下 4-1 平行」的原創互動 HTML 簡報。

**使用方式**：直接開啟 `index.html`；點選或拖拉左側教學重點卡到右側焦點區；
用「截線角度」「平行距離」「保持平行」控制圖形；左右方向鍵切換重點。

**涵蓋重點**：什麼是平行線、截線切出八個角、同位角相等、內錯角相等、同側內角互補、
反過來判斷平行、求未知角、平行推理地圖。

> 公開版只使用單元教學概念與原創視覺化圖形，不上傳教科書 PDF 或頁面截圖。
