# 卷子存檔

每一份「派到學生作答卷（quiz 站）」的線上試卷，都在這裡留一份**永久備份**，
避免被下一份卷覆蓋 `netlify_deploy/index.html` 而遺失。

## 慣例
- 檔名：`<卷名>.html`（卷名沿用題庫匯出時的卷名，含日期）
- 每次推卷時，除了部署到 quiz 站，也複製一份到本資料夾並一起 commit 到 GitHub。
- 這樣每一份派出去的卷子都同時留底於：Google 雲端硬碟（本地同步）＋ GitHub（版本）。

## 要重新掛回某一份舊卷
把該檔複製回 `../netlify_deploy/index.html`，再兩段式部署到 quiz 站即可：
```bash
cp "卷子存檔/<卷名>.html" netlify_deploy/index.html
netlify deploy --dir netlify_deploy --site 05be96f6-da95-4687-b3d5-39329a05220d --json
netlify api restoreSiteDeploy --data '{"site_id":"05be96f6-da95-4687-b3d5-39329a05220d","deploy_id":"<deploy_id>"}'
```

## 存檔清單
| 卷名 | 歸檔日期 | 備註 |
|------|----------|------|
| 會考數學複習卷B1_30題_0715 | 2026-07-21 | 建立慣例時歸檔，為當時 quiz 站掛著的卷 |
| 會考數學複習卷B4_B5_0721 | 2026-07-21 | 30 題。⚠️ 匯出時 submitUrl 誤設為「試算表編輯網址」，上架前已改回 Apps Script `/exec?token=math809`。後以新模板重生成（含錯題詳解） |
| 會考數學複習卷B5_難_5題 | 2026-07-21 | 5 題（103-16, 103-21, 104-23, 105-16, 108-17）。⚠️ 匯出檔 submitUrl 同樣誤設為試算表網址、且為舊模板無詳解 → 已用 `make_quiz` 以新模板重生成（正確收卷網址＋錯題訂正詳解） |
| 會考數學複習卷B1_B2_0722 | 2026-07-22 | 20 題選擇（103–108 年，103-06 起至 108-07）。✅ 匯出檔即為新模板、submitUrl 正確，直接上架不需重生成 |

> ⚠️ **匯出前務必檢查題庫的「試算表收卷設定」**：要填 Apps Script 的 `…/exec?token=math809`，
> **不是**試算表的 `docs.google.com/spreadsheets/…/edit` 網址，否則學生交卷收不到紀錄。
