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
| 冊別 | 網址 |
|------|------|
| 第四冊（二下）數列/函數/三角形/平行四邊形 | https://math809-review.netlify.app |
| 第五冊（九上）相似形/圓/幾何與證明 | https://math809-review5.netlify.app |

### 🔒 老師專用（⚠️ 勿發學生）
| 用途 | 網址 |
|------|------|
| 題庫系統（含全部詳解、出卷、統計、個人分析） | https://math809-bank.netlify.app |
| 收卷試算表（學生作答紀錄） | https://docs.google.com/spreadsheets/d/1vZg5vVUTym__8Fhht5vWeDq1Y6v5QOavIr-E-06DvDY/edit |
| 收卷紀錄短網址（人工瀏覽用） | https://tinyurl.com/23739jgz |

### ⚙️ 系統串接（非人工點閱）
- 收卷 API（題庫 CONFIG／submitUrl 用，須帶 `?token=math809`）：
  `https://script.google.com/macros/s/AKfycbw-ePEfCoTB3SpwOh4g0IcfwsQWanQm8bvXgOGDdIECkK2845qIoKhH9xtRNuxu29wN/exec?token=math809`
  ⚠️ 短網址經 301 轉址會把 POST 變 GET，**不可**填進系統設定或 submitUrl。

> ⚠️ **題庫系統 `math809-bank` 含所有詳解，是公開連結——請只留給老師，勿轉發學生。**

### Netlify 站台 ID（部署用）
| 站台 | Site ID |
|------|---------|
| math809-quiz（學生作答卷） | `05be96f6-da95-4687-b3d5-39329a05220d` |
| math809-bank（題庫系統） | `afba03cf-46f7-4ab5-8b0d-54d6523fe98d` |
| math809-review（第四冊複習） | `3f28584a-030d-4f9f-8ef7-bea8c71e9235` |
| math809-review5（第五冊複習） | `67ac2ec1-45ba-476f-b0d4-15327819ef26` |

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
| 第四冊複習簡報 | 二下全冊複習互動簡報（複習網站/） | [`複習網站/README.md`](複習網站/README.md) |
| 第五冊複習簡報 | 九上全冊複習互動簡報（複習網站五/） | [`複習網站五/README.md`](複習網站五/README.md) |
| 4-1 平行互動簡報 | 根目錄 `index.html`（單元教學簡報，見下） | 本檔下方 |

---

## 4-1 平行互動視覺化簡報（根目錄 index.html）

聚焦「114 國中數學 2 下 4-1 平行」的原創互動 HTML 簡報。

**使用方式**：直接開啟 `index.html`；點選或拖拉左側教學重點卡到右側焦點區；
用「截線角度」「平行距離」「保持平行」控制圖形；左右方向鍵切換重點。

**涵蓋重點**：什麼是平行線、截線切出八個角、同位角相等、內錯角相等、同側內角互補、
反過來判斷平行、求未知角、平行推理地圖。

> 公開版只使用單元教學概念與原創視覺化圖形，不上傳教科書 PDF 或頁面截圖。
