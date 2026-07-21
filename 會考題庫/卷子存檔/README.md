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
