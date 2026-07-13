# -*- coding: utf-8 -*-
"""103年題本為掃描檔（含粉紅浮水印）：
1. 以像素規則去除粉紅浮水印（灰階內容 R≈G≈B 不受影響）
2. 在左緣題號欄位（x 55~83pt）偵測深色像素列叢集 → 題號錨點
3. 區分節標頭（橫向延伸寬）與題號（窄），依錨點切割
輸出 01_題目圖片/103/ 與錨點報告
"""
import numpy as np
import fitz
from pathlib import Path
from PIL import Image
import io, json

BASE = Path(__file__).resolve().parent.parent
ZOOM = 2.2
DOC = fitz.open(BASE / "00_原始試題PDF/103_數學科題本.pdf")

def clean_page(pno):
    pix = DOC[pno].get_pixmap(matrix=fitz.Matrix(ZOOM, ZOOM), colorspace=fitz.csRGB)
    img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
    a = np.asarray(img).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    pink = (r - g > 18) & (r - b > 10) & (r > 120)
    a[pink] = 255
    gray = (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]).astype(np.uint8)
    return Image.fromarray(gray, "L")

def find_anchors(gray_img):
    """回傳 [(y_px, kind)] kind: 'q'=題號, 'h'=節標頭"""
    a = np.asarray(gray_img)
    h, w = a.shape
    x0, x1 = int(55 * ZOOM), int(83 * ZOOM)      # 題號欄
    xh0, xh1 = int(100 * ZOOM), int(220 * ZOOM)  # 標頭延伸檢查欄
    top, bot = int(40 * ZOOM), int(755 * ZOOM)
    dark = a < 128
    col = dark[:, x0:x1].sum(axis=1)
    rows = (col > 1)
    rows[:top] = False
    rows[bot:] = False
    anchors = []
    y = 0
    while y < h:
        if rows[y]:
            y2 = y
            while y2 < h and (rows[y2:y2 + 8].any()):
                y2 += 1
            seg = dark[y:y2]
            ext = seg[:, xh0:xh1].sum()
            own = seg[:, x0:x1].sum()
            kind = "h" if ext > own * 2.5 else "q"
            anchors.append((y, kind))
            y = y2 + 5
        else:
            y += 1
    return anchors

def content_bottom(gray_img):
    a = np.asarray(gray_img)
    dark = a < 128
    top, bot = int(40 * ZOOM), int(760 * ZOOM)
    # 排除頁碼（底部中央）與「請翻頁繼續作答」框（底部右側）：只掃到 bot
    rowsum = dark[:bot].sum(axis=1)
    ys = np.nonzero(rowsum > 2)[0]
    return int(ys.max()) + 8 if len(ys) else bot

if __name__ == "__main__":
    out = BASE / "01_題目圖片" / "103"
    out.mkdir(parents=True, exist_ok=True)
    report = {}
    pages = {}
    for pno in range(1, DOC.page_count):
        g = clean_page(pno)
        pages[pno] = g
        anc = find_anchors(g)
        report[pno] = anc
        print(pno, anc, "bottom:", content_bottom(g))
    (BASE / "data").mkdir(exist_ok=True)
    (BASE / "data" / "anchors_103.json").write_text(json.dumps(report), encoding="utf-8")
    # 儲存去浮水印整頁供人工檢視
    dbg = Path(r"C:\Users\user\AppData\Local\Temp\claude\G---------2026--809\c721aab2-ead5-48cc-aa72-890b6182ff0b\scratchpad")
    for pno, g in pages.items():
        g.resize((g.width // 2, g.height // 2)).save(dbg / f"103clean_p{pno}.png")
