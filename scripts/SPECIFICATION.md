# 數學教學影片自動化生成規格書 (Workspace Specifications)

本專案定義了將國中數學 PPTX 講義自動化轉化為動態教學影片的完整技術與設計規格。

---

## 1. 語音配音規格 (Voice Specification)
- **語意腳本角色**：發言者一律設定為**「數學老師」**（如：「各位同學大家好，我是數學老師...」）。
- **語音合成模型**：使用「三師爸」的複製聲音模型。
- **執行環境環境**：
  - Python 解譯器：`C:\Users\mathr\voxcpm\Scripts\python.exe`
  - 克隆腳本路徑：`G:\我的雲端硬碟\2026Agents\voxcpm2-voice-cloner\clone.py`

---

## 2. 影片渲染與混音引擎 (Rendering & Audio Engine)
- **動態渲染引擎**：使用 HeyGen HyperFrames (基於 HTML5 + CSS3 + GSAP 網頁動畫技術)。
- **渲染指令**：`npx hyperframes render --output <output_path>`
- **FFmpeg 混音指令**（無損串流混合）：
  ```bash
  ffmpeg -y -i <video_path> -i <audio_path> -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest <output_path>
  ```

---

## 3. 視覺設計與排版規格 (Layout & CSS Styling)
- **解析度**：固定為 `1920x1080` (16:9 比例)。
- **字幕規則**：**完全不使用字幕**，避免干擾學生觀看幾何圖形。
- **解題步驟卡片 (Solution Boxes)**：
  - **基礎樣式**：
    - 背景：`rgba(255, 255, 255, 0.95)` 毛玻璃質感。
    - 邊框：`1px solid rgba(226, 232, 240, 0.8)`。
    - 字體大小：最低 **`32px`** (確保行動裝置清晰可讀)。
    - 字型：`'Noto Sans TC', system-ui, sans-serif`。
  - **公式序號標籤 (`.eq`)**：圓形背景容器，寬高 `40px`，字體 `22px`，居中對齊。背景 `#f1f5f9`，邊框 `#cbd5e1`。
  - **公式掃抹高亮動畫 (`.highlight-eq`)**：黃色半透明背景漸層 `rgba(254, 240, 138, 0.7)`，藉由 GSAP 動態將 `backgroundSize` 從 `0% 100%` 掃描展開至 `100% 100%`。
  - **卡片左側邊條顏色代碼**：
    - 開頭與解題起手 (`解`)：紅色 `#ef4444`
    - 推導中段步驟：藍色 `#3b82f6`
    - 代入與計算步驟：綠色 `#10b981`
    - 最終答案卡 (`答`)：橙色 `#f59e0b`（字體加粗，文字顏色 `#d97706`）

---

## 4. 動態放大鏡規格 (Viewport Centering Zoom)
- **原理解析**：透過將背景圖與雷射筆 SVG 包覆於 `#viewport` 容器中進行縮放，維持圖形與雷射筆的相對位置。
- **縮放基準點**：`transform-origin: 0 0` (左上角)。
- **畫面居中平移公式 (Screen-Centering Math)**：
  當需要以某幾何中心 $(\text{cx}, \text{cy})$ 為焦點進行縮放（放大倍率 $S = 2.2$）時，在 GSAP 中同時進行縮放與位移：
  $$\text{Tx} = 960 - \text{cx} \times S$$
  $$\text{Ty} = 540 - \text{cy} \times S$$
  當縮小回全景時：
  $$\text{scale} = 1.0, \text{x} = 0, \text{y} = 0$$
  *此公式保證放大後的幾何焦點精準平移至螢幕正中央 $(960, 540)$，絕不發生邊界與雷射筆被剪裁的情形。*

---

## 5. 雷射筆動畫規格 (Laser Pointer Animation)
- **視覺外觀**： glowing 半透明紅色圓圈。
  - `stroke="#ef4444"`, `stroke-width="4"`
  - `fill="rgba(239, 68, 68, 0.15)"`
  - 陰影濾鏡：`filter: drop-shadow(0 0 8px #ef4444)`
- **GSAP 動畫行為**：
  - **淡入畫圓 (0.4s)**：`opacity` 從 `0` 升至 `0.9`，`strokeDashoffset` 從 `252` 縮至 `0` 順時針畫圓。
  - **脈衝呼吸 (Lingering Pulse)**：半徑 $r$ 在 `40` 到 `50` 之間以 `yoyo: true` 往復縮放。
    - 單次週期：`0.35s`
    - 重複次數：`repeat: 11` (共進行 12 次呼吸)
    - 停留時間長度：**約 `4.2 秒`**
  - **淡出擴散 (0.3s)**：半徑 scale 至 `1.2` 倍，`opacity` 降至 `0`。
  - **總生命週期**：約 **`4.9 秒`**。

---

## 6. PPTX 座標轉換與自動去背景規則 (COM Slide Export)
- **比例尺對齊**：
  - PPTX 原始頁面：`12,192,000 x 6,858,000` EMUs。
  - HTML 渲染畫布：`1920 x 1080` 像素。
  - 坐標轉換公式：
    $$\text{px\_left} = \text{EMU} \times \frac{1920}{12192000}$$
    $$\text{px\_top} = \text{EMU} \times \frac{1080}{6858000}$$
- **PowerPoint COM 隱藏解題步驟規則**：
  - 注意：PowerPoint COM 傳回的 `shape.Top` 單位為**點數 (Points)**而非 EMUs。
  - **判定為解題步驟（需隱藏）的條件**：
    1. 垂直高度 `shape.Top > 270` 點（即下半部解題區域）。
    2. 文字框中包含關鍵字 `"解"`、`"答："`、`"代入"`、`"得到"`，且不含問號 `"？"`。
    3. 圖形寬度 `shape.Width < 100` 點，且文字僅為單一數字（如 `"1"`、`"2"`、`"3"`、`"4"` 等輔助角標籤）。
