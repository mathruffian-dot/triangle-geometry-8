# vendor/ — 隨專案附帶的第三方程式

## geometry_renderer.py
來源：`jh-math-geometry` 技能（原路徑 `~/.claude-skills/jh-math-geometry/scripts/`）。
純 Python 的 SVG 幾何渲染器，`scripts/figures.py` 直接 import 它，
支撐 triangle／quad／circle／coord／solid／parallel／center／similar 共 8 種配圖。

**為什麼複製一份進來**：原路徑是開發者本機的全域技能目錄，別人拿到專案時沒有那個檔案，
8 種幾何配圖會在渲染當下才丟 ModuleNotFoundError（import 寫在函式內）。放這裡才能隨專案分享。

**更新方式**：若上游技能有更新，重新複製一份覆蓋即可。
`figures.py` 的載入順序是：先找本資料夾，找不到才回頭找 `~/.claude-skills/...`。
