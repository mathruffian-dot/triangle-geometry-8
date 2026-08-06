# -*- coding: utf-8 -*-
"""
annotate_redpen.py — 程式化「紅筆批改」標註器

用途
----
老師批改學生手寫數學作答照片時，由 AI（視覺模型）回傳「要在哪裡標註、標註什麼」
的結構化 JSON（座標一律用相對值 0~1），本腳本負責把這些指令畫成紅筆標記，
疊在原圖上層。

核心原則：**原圖像素不重繪**
--------------------------------
1. 所有紅筆筆跡都畫在一張「透明疊圖層（overlay）」上，解析度為原圖的 SS 倍（預設 3x）。
2. 縮回原尺寸時採用「預乘 alpha」的正確合成公式：
       out = overlay_premultiplied + original * (1 - alpha)
   在 alpha == 0 的區域，(1 - alpha) == 255/255，運算結果與原圖「逐位元完全相同」。
   （可用 --verify 驗證：會逐像素比對未被筆跡覆蓋的區域是否 0 差異。）
3. 輸出一律 PNG（無失真），避免 JPEG 重新壓縮把原筆跡糊掉。

支援的標註類型
--------------
  check      紅色勾勾（這裡對／寫得好）
  circle     紅色圈選（ellipse 橢圓 或 rect 圓角方框），圈住有問題的區域
  underline  紅色底線（wave 波浪 / line 直線 / double 雙線）
  note       紅色中文批註（微軟正黑體；白色描邊 + 半透明白底，壓在手寫字上也看得清）
  score      右上角分數印章（例如 2/3，紅圈圈起來，微微傾斜像蓋章）
  arrow      紅色引線箭頭（把批註連到對應位置，非必要但很好用）
  solution   「續寫解答」區塊：畫在原圖**下方延伸出來的白區**，讓老師接著學生的思路把解答補完
             （0 級分則直接寫完整解答）。文字會自動換行，延伸高度由內容自動計算。

JSON 格式（list of dict，座標皆為相對值 0~1）
--------------------------------------------
[
  {"type":"score",     "at":[0.885,0.07], "text":"2/3", "size":0.048},
  {"type":"check",     "at":[0.90,0.185], "size":0.030},
  {"type":"note",      "at":[0.60,0.232], "text":"等差和公式運用正確", "size":0.024, "anchor":"lt"},
  {"type":"circle",    "bbox":[0.085,0.288,0.965,0.408], "shape":"rect"},
  {"type":"underline", "from":[0.393,0.482], "to":[0.727,0.482], "style":"wave"},
  {"type":"arrow",     "from":[0.26,0.523], "to":[0.20,0.418], "bow":0.35}
]

共用可選欄位：color（"#E03131" 或 [r,g,b]）、width（筆畫粗細倍率，預設 1.0）、seed（手繪抖動亂數種子）

用法
----
  python annotate_redpen.py --image 原圖.jpg --json 標註.json --out 成品.png
  python annotate_redpen.py --image 原圖.jpg --demo --out 成品.png --verify
  python annotate_redpen.py --image 原圖.jpg --json-str '[{"type":"check","at":[0.5,0.5]}]' --out 成品.png

  可選：--overlay-out 疊圖層.png   （只輸出透明紅筆層，證明原圖沒被動過）
"""

from __future__ import annotations

import argparse
import json
import math
import os
import random
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

# --------------------------------------------------------------------------
# 常數
# --------------------------------------------------------------------------

RED = (224, 49, 49)          # #E03131 老師紅筆
SUPERSAMPLE = 3              # 超取樣倍率（畫完再縮小 → 線條自然平滑）
PEN_ALPHA = 242              # 紅筆不透明度（略低於 255，看起來像有滲墨）
PANEL_ALPHA = 178            # 批註白底不透明度（讓底下手寫字仍隱約可見）
HALO_ALPHA = 232             # 文字白色描邊不透明度

# 字型清單集中在 data/config.json（換 macOS／Linux 只要改那裡）
sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import get as _cfg  # noqa: E402

_FONTS = _cfg("font_files")
FONT_REGULAR = [f for f in _FONTS if "bd" not in Path(f).name.lower()]
FONT_BOLD = ([f for f in _FONTS if "bd" in Path(f).name.lower()]
             + [f for f in _FONTS if "bd" not in Path(f).name.lower()])


# --------------------------------------------------------------------------
# 小工具
# --------------------------------------------------------------------------

def parse_color(c, default=RED):
    """接受 "#E03131" / [224,49,49] / None。"""
    if c is None:
        return default
    if isinstance(c, (list, tuple)):
        return tuple(int(v) for v in c[:3])
    s = str(c).strip().lstrip("#")
    if len(s) == 6:
        return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))
    return default


# 微軟正黑體缺這些常用數學符號的字形，直接畫會變成「□」方框。
# 一律換成同義且該字型有的字元（實測 msjh.ttc cmap 確認過）。
GLYPH_FALLBACK = {
    "−": "-", "⇒": "→", "⟹": "→", "⩽": "≦", "⩾": "≧",
    "≤": "≦", "≥": "≧", "✓": "√", "✔": "√", "✗": "×", "✘": "×",
    "∈": "屬於", "⌒": "弧", "㎥": "立方公尺",
}
_CMAP_CACHE = {}


def font_cmap():
    """讀出實際會用到的中文字型有哪些字元（缺字偵測用）。取不到就回 None（跳過檢查）。"""
    path = next((p for p in FONT_REGULAR if os.path.exists(p)), None)
    if path is None:
        return None
    if path in _CMAP_CACHE:
        return _CMAP_CACHE[path]
    chars = None
    try:
        from fontTools.ttLib import TTCollection, TTFont
        f = (TTCollection(path).fonts[0] if path.lower().endswith(".ttc") else TTFont(path))
        chars = set()
        for t in f["cmap"].tables:
            chars |= set(t.cmap.keys())
    except Exception:
        chars = None
    _CMAP_CACHE[path] = chars
    return chars


def safe_text(s):
    """把字型畫不出來的字元換成同義字，避免輸出「□」。"""
    if not s:
        return s
    out = []
    cmap = font_cmap()
    for ch in str(s):
        if ch in "\n\r\t":                     # 控制字元由排版處理，不是缺字
            out.append(ch)
            continue
        if cmap is not None and ord(ch) in cmap:
            out.append(ch)
            continue
        rep = GLYPH_FALLBACK.get(ch)
        if rep is not None:
            out.append(rep)
        elif cmap is None:
            out.append(ch)                     # 無法檢查就原樣輸出
        else:
            out.append(ch)                     # 缺字但無替換：保留並提醒，不靜默吞掉內容
            print(f"  [警告] 字型缺字 {ch!r} (U+{ord(ch):04X})，可能顯示為方框", file=sys.stderr)
    return "".join(out)


def load_font(size_px, bold=False):
    """載入支援繁體中文的字型（微軟正黑體）。"""
    size_px = max(6, int(size_px))
    for path in (FONT_BOLD if bold else FONT_REGULAR):
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size_px, index=0)
            except Exception:
                continue
    # 最後保底（可能無中文字，僅避免整支腳本掛掉）
    return ImageFont.load_default()


def densify(pts, step):
    """在折線上補點，讓後續的抖動 / 平滑有足夠取樣密度。"""
    out = []
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        d = math.hypot(x1 - x0, y1 - y0)
        n = max(1, int(d / max(1e-6, step)))
        for k in range(n):
            t = k / n
            out.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t))
    out.append(pts[-1])
    return out


def wobble(pts, amp, rnd, closed=False):
    """加入低頻手抖（用隨機相位的正弦疊加，比純亂數自然）。"""
    if amp <= 0:
        return list(pts)
    n = len(pts)
    ph1, ph2 = rnd.uniform(0, 6.28), rnd.uniform(0, 6.28)
    f1, f2 = rnd.uniform(1.2, 2.4), rnd.uniform(3.5, 6.5)
    out = []
    for i, (x, y) in enumerate(pts):
        t = i / max(1, n - 1)
        off = (math.sin(t * f1 * 6.283 + ph1) * 0.7 +
               math.sin(t * f2 * 6.283 + ph2) * 0.3) * amp
        # 取法線方向偏移
        j = min(i + 1, n - 1)
        k = max(i - 1, 0)
        dx, dy = pts[j][0] - pts[k][0], pts[j][1] - pts[k][1]
        L = math.hypot(dx, dy) or 1.0
        nx, ny = -dy / L, dx / L
        out.append((x + nx * off, y + ny * off))
    if not closed:
        # 端點不要飄，回貼原位
        out[0] = pts[0]
        out[-1] = pts[-1]
    return out


def chaikin(pts, iterations=2):
    """Chaikin 角切平滑，讓筆畫轉折圓潤。"""
    for _ in range(iterations):
        if len(pts) < 3:
            break
        new = [pts[0]]
        for i in range(len(pts) - 1):
            (x0, y0), (x1, y1) = pts[i], pts[i + 1]
            new.append((0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1))
            new.append((0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1))
        new.append(pts[-1])
        pts = new
    return pts


_MATH_CACHE = {}


def math_img(latex, fs_px, color=RED):
    """把 LaTeX 數學式渲染成透明底的紅色圖片（分數、次方、根號才排得漂亮）。

    用 matplotlib 內建的 mathtext（LaTeX 子集），不需要安裝 LaTeX。
    渲染失敗就回 None，由呼叫端退回純文字，不讓整張批改圖掛掉。
    """
    key = (latex, int(fs_px), tuple(color))
    if key in _MATH_CACHE:
        return _MATH_CACHE[key]
    im = None
    try:
        import io
        import matplotlib
        matplotlib.use("Agg")
        from matplotlib import mathtext
        from matplotlib.font_manager import FontProperties
        buf = io.BytesIO()
        mathtext.math_to_image("$" + latex + "$", buf,
                               prop=FontProperties(size=max(6.0, fs_px)),
                               dpi=72, format="png", color="#%02X%02X%02X" % tuple(color))
        buf.seek(0)
        im = Image.open(buf).convert("RGBA")
    except Exception as e:
        print(f"  [警告] 數學式渲染失敗 {latex!r}：{e}", file=sys.stderr)
        im = None
    _MATH_CACHE[key] = im
    return im


def split_math(text):
    """把 "設 $x=\\frac{a}{2}$ 則…" 拆成 [(kind, 內容)]，kind 為 't'(文字) 或 'm'(數學式)。"""
    parts, segs = [], str(text).split("$")
    for i, seg in enumerate(segs):
        if seg == "":
            continue
        parts.append(("m" if i % 2 else "t", seg))
    # $ 數量為奇數 → 有沒關好的，最後一段當純文字處理
    if len(segs) % 2 == 0 and parts and parts[-1][0] == "m":
        parts[-1] = ("t", parts[-1][1])
    return parts


def layout_rich(text, font, fs, max_w, draw, color=RED):
    """中文與數學式混排的斷行計算。

    回傳 [(行高, [item…])]，item = ("t", 字串, 寬, 高) 或 ("m", 圖, 寬, 高)。
    中文可逐字斷行；數學式視為不可切開的一整塊。
    """
    lines = []
    for para in str(text).split("\n"):
        if not para.strip():
            lines.append((fs * 0.6, []))
            continue
        cur, cur_w, cur_h = [], 0.0, fs
        for kind, seg in split_math(para):
            if kind == "m":
                im = math_img(seg.strip(), fs, color)
                if im is None:                       # 渲染失敗 → 當純文字排（至少內容不遺失）
                    kind, seg = "t", seg
                else:
                    if cur_w + im.width > max_w and cur:
                        lines.append((cur_h, cur)); cur, cur_w, cur_h = [], 0.0, fs
                    cur.append(("m", im, im.width, im.height))
                    cur_w += im.width
                    cur_h = max(cur_h, im.height)
                    continue
            buf = ""
            for ch in seg:
                w = draw.textlength(buf + ch, font=font)
                if cur_w + w > max_w and (buf or cur):
                    if buf:
                        cur.append(("t", buf, draw.textlength(buf, font=font), fs))
                    lines.append((cur_h, cur))
                    cur, cur_w, cur_h, buf = [], 0.0, fs, ch
                else:
                    buf += ch
            if buf:
                w = draw.textlength(buf, font=font)
                cur.append(("t", buf, w, fs))
                cur_w += w
        if cur:
            lines.append((cur_h, cur))
    return lines


def solution_metrics(W, a, color=RED):
    """算出 solution 區塊需要的高度（原圖像素單位），供自動延伸畫布使用。

    回傳 (需要高度, 字級px, 行距px, 排版後的行陣列)。
    """
    fs = max(10.0, float(a.get("size", 0.026)) * W)
    font = load_font(fs, bold=False)
    d = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    pad = fs * 1.0
    max_w = W - pad * 2 - fs * 0.6
    lines = layout_rich(safe_text(a.get("text", "")), font, fs, max_w, d, color)
    gap = fs * 0.62                                   # 行距（行高之外的額外留白）
    head = fs * 2.3                                   # 標題列 + 分隔線
    total = head + sum(h + gap for h, _ in lines) + pad * 1.8
    return int(total), fs, gap, lines


def quad_bezier(p0, p1, p2, n=48):
    out = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        out.append((u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
                    u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]))
    return out


# --------------------------------------------------------------------------
# 主體
# --------------------------------------------------------------------------

class RedPenAnnotator:
    """在透明圖層上畫紅筆標記，最後以正確 alpha 合成疊回原圖。"""

    def __init__(self, base_img, supersample=SUPERSAMPLE, pen_scale=1.0, extend_px=0):
        src = base_img.convert("RGB")
        self.W, self.H = src.size          # W/H 一律是「原圖」尺寸：相對座標的基準不因延伸而改變
        self.ext = max(0, int(extend_px))  # 原圖下方額外延伸的白區高度（供 solution 續寫用）
        if self.ext:
            # 原圖貼在上方，下方補白；原圖區域的像素完全沒被改動
            canvas = Image.new("RGB", (self.W, self.H + self.ext), (255, 255, 255))
            canvas.paste(src, (0, 0))
            self.base = canvas
        else:
            self.base = src
        self.CH = self.H + self.ext        # 實際畫布高度
        self.ss = max(1, int(supersample))
        self.overlay = Image.new("RGBA", (self.W * self.ss, self.CH * self.ss), (0, 0, 0, 0))
        self.draw = ImageDraw.Draw(self.overlay)
        # 基準筆畫粗細：以圖寬為準，1x 約為寬度的 1/280（2048px → 約 7.3px）
        self.pen = self.W * self.ss / 280.0 * pen_scale
        self.color = RED

    # ---- 座標換算 ----
    def P(self, xy):
        """相對座標 (0~1) → 超取樣像素座標。"""
        return (float(xy[0]) * self.W * self.ss, float(xy[1]) * self.H * self.ss)

    def U(self, v):
        """相對長度（以圖寬為基準）→ 超取樣像素長度。"""
        return float(v) * self.W * self.ss

    # ---- 筆畫繪製 ----
    def ink(self, pts, w_start, w_end=None, color=None, alpha=PEN_ALPHA):
        """沿折線畫出可漸變粗細、帶圓頭的筆畫。"""
        if len(pts) < 2:
            return
        w_end = w_start if w_end is None else w_end
        col = (color or self.color) + (alpha,)
        seg = [math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
               for i in range(len(pts) - 1)]
        total = sum(seg) or 1.0
        acc = 0.0
        d = self.draw
        for i, L in enumerate(seg):
            t = (acc + L / 2) / total
            acc += L
            w = max(1.0, w_start + (w_end - w_start) * t)
            d.line([pts[i], pts[i + 1]], fill=col, width=int(round(w)))
            r = w / 2.0
            x, y = pts[i]
            d.ellipse([x - r, y - r, x + r, y + r], fill=col)
        r = max(1.0, w_end) / 2.0
        x, y = pts[-1]
        d.ellipse([x - r, y - r, x + r, y + r], fill=col)

    def hand_stroke(self, pts, w_start, w_end=None, color=None,
                    wob=0.5, rnd=None, closed=False, alpha=PEN_ALPHA):
        """手繪感筆畫：補點 → 抖動 → 平滑 → 上墨。"""
        rnd = rnd or random.Random(0)
        pts = densify(pts, max(4.0, self.pen * 1.2))
        pts = wobble(pts, self.pen * wob, rnd, closed=closed)
        pts = chaikin(pts, 2)
        self.ink(pts, w_start, w_end, color=color, alpha=alpha)

    # ------------------------------------------------------------------
    # 各種標註
    # ------------------------------------------------------------------

    def a_check(self, a, rnd):
        """紅色勾勾。at = 勾勾的視覺重心。"""
        cx, cy = self.P(a.get("at", [0.5, 0.5]))
        s = self.U(a.get("size", 0.030))
        w = self.pen * float(a.get("width", 1.0))
        col = parse_color(a.get("color"))
        pts = [(cx - 0.62 * s, cy + 0.02 * s),
               (cx - 0.42 * s, cy + 0.22 * s),
               (cx - 0.16 * s, cy + 0.50 * s),
               (cx + 0.20 * s, cy - 0.18 * s),
               (cx + 0.62 * s, cy - 0.62 * s)]
        # 起筆細、轉折粗、收筆細 → 拆兩段畫
        self.hand_stroke(pts[:3], w * 0.75, w * 1.25, color=col, wob=0.25, rnd=rnd)
        self.hand_stroke(pts[2:], w * 1.25, w * 0.45, color=col, wob=0.25, rnd=rnd)

    def a_circle(self, a, rnd):
        """圈選：shape = ellipse（預設）或 rect（圓角方框，適合圈整行）。"""
        x0, y0 = self.P(a["bbox"][0:2])
        x1, y1 = self.P(a["bbox"][2:4])
        w = self.pen * float(a.get("width", 1.0))
        col = parse_color(a.get("color"))
        shape = a.get("shape", "ellipse")
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        ax, by = abs(x1 - x0) / 2, abs(y1 - y0) / 2

        if shape == "rect":
            r = min(ax, by) * 0.55
            pts = []
            corners = [(x0 + r, y0 + r, 180, 270),   # 左上
                       (x1 - r, y0 + r, 270, 360),   # 右上
                       (x1 - r, y1 - r, 0, 90),      # 右下
                       (x0 + r, y1 - r, 90, 180)]    # 左下
            for (ccx, ccy, a0, a1) in corners:
                for k in range(13):
                    ang = math.radians(a0 + (a1 - a0) * k / 12)
                    pts.append((ccx + r * math.cos(ang), ccy + r * math.sin(ang)))
            # 收筆時多繞一小段，像一筆畫完沒對齊
            pts.append((x0 + r * 0.15, y0 + r * 0.62))
            pts.append((x0 + r * 0.55, y0 + r * 0.10))
        else:
            pts = []
            start = rnd.uniform(-0.35, -0.15)
            span = 6.283 + rnd.uniform(0.25, 0.55)
            n = 96
            for k in range(n + 1):
                t = start + span * k / n
                rr = 1.0 + 0.015 * math.sin(t * 3 + rnd.random())
                pts.append((cx + ax * rr * math.cos(t), cy + by * rr * math.sin(t)))

        self.hand_stroke(pts, w * 0.85, w * 1.05, color=col, wob=0.35, rnd=rnd, closed=True)

    def a_underline(self, a, rnd):
        """底線：style = wave（波浪，預設）/ line（直線）/ double（雙直線）。"""
        p0 = self.P(a.get("from", a.get("p0")))
        p1 = self.P(a.get("to", a.get("p1")))
        w = self.pen * float(a.get("width", 1.0))
        col = parse_color(a.get("color"))
        style = a.get("style", "wave")
        L = math.hypot(p1[0] - p0[0], p1[1] - p0[1]) or 1.0
        ux, uy = (p1[0] - p0[0]) / L, (p1[1] - p0[1]) / L
        nx, ny = -uy, ux

        if style == "wave":
            lam = max(w * 6.0, self.U(0.020))
            amp = lam * 0.20
            n = max(24, int(L / lam * 12))
            pts = []
            for k in range(n + 1):
                t = k / n
                off = math.sin(t * (L / lam) * 6.283) * amp
                pts.append((p0[0] + ux * L * t + nx * off,
                            p0[1] + uy * L * t + ny * off))
            self.hand_stroke(pts, w * 0.85, w * 0.85, color=col, wob=0.12, rnd=rnd)
        elif style == "double":
            for k, gap in enumerate((-w * 0.9, w * 0.9)):
                self.hand_stroke([(p0[0] + nx * gap, p0[1] + ny * gap),
                                  (p1[0] + nx * gap, p1[1] + ny * gap)],
                                 w * 0.7, w * 0.7, color=col, wob=0.3,
                                 rnd=random.Random(rnd.random()))
        else:
            self.hand_stroke([p0, p1], w * 0.8, w * 0.95, color=col, wob=0.35, rnd=rnd)

    def a_note(self, a, rnd):
        """中文批註：白色描邊 + 半透明白底，確保壓在手寫字上也看得清。"""
        text = safe_text(str(a.get("text", "")))
        if not text:
            return
        fs = self.U(a.get("size", 0.024))
        font = load_font(fs, bold=bool(a.get("bold", True)))
        col = parse_color(a.get("color"))
        anchor = a.get("anchor", "lt")
        halo = max(1, int(fs * 0.10))

        d = self.draw
        # 與 solution 共用混排排版：批註裡的 $...$ 也要排成真正的分數／上標
        max_w = self.W * self.ss * float(a.get("maxw", 0.62))
        lines = layout_rich(text, font, fs, max_w, d, col)
        gap = fs * 0.30
        tw = max([sum(it[2] for it in items) for _, items in lines] or [0])
        th = sum(h + gap for h, _ in lines) - gap if lines else 0
        ox, oy = self.P(a.get("at", [0.5, 0.5]))
        ah, v = (anchor + "lt")[0], (anchor + "lt")[1]
        if ah == "c":
            ox -= tw / 2
        elif ah == "r":
            ox -= tw
        if v == "m":
            oy -= th / 2
        elif v == "b":
            oy -= th

        # 夾在畫布內：避免批註文字（含面板與左側紅槓）被切出畫面外
        CW, CH = self.W * self.ss, self.CH * self.ss
        pad_ = fs * 0.34
        margin = fs * 0.75            # 左側紅槓 + 面板留白
        ox = min(max(ox, margin), max(margin, CW - tw - pad_ - fs * 0.3))
        oy = min(max(oy, pad_), max(pad_, CH - th - pad_))

        if a.get("panel", True):
            pad = fs * 0.34
            rad = fs * 0.32
            d.rounded_rectangle([ox - pad, oy - pad * 0.75, ox + tw + pad, oy + th + pad * 0.75],
                                radius=rad, fill=(255, 255, 255, PANEL_ALPHA))

        y = oy
        for line_h, items in lines:
            x = ox
            for kind, payload, iw, ih in items:
                if kind == "t":
                    d.text((x, y + (line_h - fs) / 2), payload, font=font, fill=col + (250,),
                           stroke_width=halo, stroke_fill=(255, 255, 255, HALO_ALPHA))
                else:
                    self.overlay.alpha_composite(payload, (int(x), int(y + (line_h - ih) / 2)))
                x += iw
            y += line_h + gap

        # 左側小紅槓，像老師批註的起頭記號
        if a.get("bullet", True):
            bx = ox - fs * 0.52
            self.ink([(bx, oy + fs * 0.12), (bx, oy + th - fs * 0.05)],
                     self.pen * 0.7, self.pen * 0.7, color=col)

    def a_score(self, a, rnd):
        """右上角分數印章：紅圈 + 分數，微微傾斜像手蓋上去。"""
        text = str(a.get("text", "0/0"))
        fs = self.U(a.get("size", 0.048))
        col = parse_color(a.get("color"))
        w = self.pen * float(a.get("width", 1.0)) * 1.15
        font = load_font(fs, bold=True)

        # 先畫在小圖層上，方便整體旋轉
        pad = fs * float(a.get("pad", 0.62))
        tmp_d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
        bb = tmp_d.textbbox((0, 0), text, font=font)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        box = int(max(tw, th) + pad * 2.0 + w * 6 + max(tw, th) * 0.5)
        tmp = Image.new("RGBA", (box, box), (0, 0, 0, 0))
        sub = RedPenAnnotator.__new__(RedPenAnnotator)
        sub.overlay, sub.draw, sub.pen, sub.color = tmp, ImageDraw.Draw(tmp), self.pen, col
        sub.W = sub.H = sub.CH = box
        sub.ss = 1
        sub.ext = 0

        cx = cy = box / 2
        # 兩圈手繪橢圓
        for ring, mul in ((0, 1.00), (1, 1.20)):
            rx, ry = (tw / 2 + pad) * mul, (th / 2 + pad * 0.80) * mul
            pts = []
            start = rnd.uniform(-0.4, -0.1)
            span = 6.283 + rnd.uniform(0.2, 0.5)
            for k in range(97):
                t = start + span * k / 96
                pts.append((cx + rx * math.cos(t), cy + ry * math.sin(t)))
            sub.hand_stroke(pts, w * (0.95 if ring == 0 else 0.62),
                            w * (1.05 if ring == 0 else 0.62),
                            color=col, wob=0.3, rnd=rnd, closed=True)
        sub.draw.text((cx - tw / 2 - bb[0], cy - th / 2 - bb[1]), text, font=font,
                      fill=col + (250,), stroke_width=max(1, int(fs * 0.045)),
                      stroke_fill=(255, 255, 255, HALO_ALPHA))

        tmp = tmp.rotate(float(a.get("angle", -8)), resample=Image.BICUBIC,
                         expand=True, fillcolor=(0, 0, 0, 0))
        px, py = self.P(a.get("at", [0.88, 0.07]))
        self.overlay.alpha_composite(tmp, (int(px - tmp.width / 2), int(py - tmp.height / 2)))

    def a_solution(self, a, rnd):
        """續寫解答：畫在原圖下方延伸出來的白區，讓學生看得到「接下去該怎麼寫」。

        位置不由 AI 指定——一律從原圖底線下方開始，往下排版，避免壓到學生字跡。
        """
        col = parse_color(a.get("color"))
        # 直接以超取樣尺度重新排版，數學式才會是高解析度（不是放大的模糊圖）
        _, fs, gap, lines = solution_metrics(self.W * self.ss, a, col)
        font = load_font(fs, bold=False)
        font_t = load_font(fs * 1.06, bold=True)
        d = self.draw
        pad = fs * 1.0
        x0 = pad
        y = self.H * self.ss + pad * 0.9            # 從原圖底部下方開始

        # 頂部分隔線（手繪感），標示這是老師補寫的區域
        self.hand_stroke([(x0, y), (self.W * self.ss - pad, y)],
                         self.pen * 0.7, self.pen * 0.7, color=col, wob=0.25, rnd=rnd)
        y += fs * 0.55

        title = safe_text(str(a.get("title", "訂正參考")))
        d.text((x0, y), title, font=font_t, fill=col + (250,))
        y += fs * 1.45

        for line_h, items in lines:
            x = x0 + fs * 0.15
            for kind, payload, w, h in items:
                if kind == "t":
                    # 文字以行高垂直置中（同一行若有分數，文字不會被頂到上緣）
                    d.text((x, y + (line_h - fs) / 2), payload, font=font, fill=col + (248,))
                else:
                    self.overlay.alpha_composite(payload, (int(x), int(y + (line_h - h) / 2)))
                x += w
            y += line_h + gap

    def a_arrow(self, a, rnd):
        """引線箭頭：把批註連到對應位置。bow 控制弧度。"""
        p0 = self.P(a.get("from"))
        p1 = self.P(a.get("to"))
        w = self.pen * float(a.get("width", 1.0)) * 0.85
        col = parse_color(a.get("color"))
        bow = float(a.get("bow", 0.25))
        mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
        dx, dy = p1[0] - p0[0], p1[1] - p0[1]
        L = math.hypot(dx, dy) or 1.0
        ctrl = (mx - dy / L * L * bow, my + dx / L * L * bow)
        pts = quad_bezier(p0, ctrl, p1, 48)
        self.hand_stroke(pts, w * 0.6, w * 0.95, color=col, wob=0.2, rnd=rnd)

        # 箭頭：依末端切線方向
        tx, ty = p1[0] - pts[-6][0], p1[1] - pts[-6][1]
        ang = math.atan2(ty, tx)
        hl = max(self.U(0.012), w * 4.2)
        for sign in (+1, -1):
            a2 = ang + sign * math.radians(154)
            self.ink([p1, (p1[0] + hl * math.cos(a2), p1[1] + hl * math.sin(a2))],
                     w * 0.95, w * 0.35, color=col)

    # ------------------------------------------------------------------

    DISPATCH = {
        "check": a_check,
        "circle": a_circle,
        "ellipse": a_circle,
        "underline": a_underline,
        "note": a_note,
        "text": a_note,
        "score": a_score,
        "arrow": a_arrow,
        "solution": a_solution,
    }

    def annotate(self, annotations):
        for i, a in enumerate(annotations):
            t = str(a.get("type", "")).lower()
            fn = self.DISPATCH.get(t)
            if fn is None:
                print(f"  [警告] 第 {i} 筆：未知的標註類型 {t!r}，已略過", file=sys.stderr)
                continue
            rnd = random.Random(a.get("seed", 1000 + i * 37))
            fn(self, a, rnd)
        return self

    # ------------------------------------------------------------------

    def get_overlay(self):
        """回傳縮回原尺寸的透明紅筆層（預乘 alpha 版本 + alpha 通道）。"""
        r, g, b, alp = self.overlay.split()
        prem = [ImageChops.multiply(c, alp) for c in (r, g, b)]
        size = (self.W, self.CH)
        if self.ss > 1:
            resample = Image.LANCZOS
            prem = [c.resize(size, resample) for c in prem]
            alp = alp.resize(size, resample)
            # LANCZOS 會有輕微振鈴（ringing），可能讓預乘值超過 alpha。
            # 預乘色 = C*A/255 必定 <= A，故以 alpha 為上限夾住，
            # 同時保證 alpha == 0 之處預乘值也一定是 0（原圖絕對不被動到）。
            prem = [ImageChops.darker(c, alp) for c in prem]
        return prem, alp

    def compose(self):
        """把紅筆層合成到原圖上。

        out = premultiplied_overlay + original * (1 - alpha)
        alpha == 0 的像素 → original * 255/255 + 0 → 與原圖逐位元相同。
        """
        prem, alp = self.get_overlay()
        inv = ImageChops.invert(alp)
        base_ch = self.base.split()
        out = [ImageChops.add(ImageChops.multiply(base_ch[i], inv), prem[i]) for i in range(3)]
        return Image.merge("RGB", out)


# --------------------------------------------------------------------------
# 驗證：未被筆跡覆蓋的區域必須與原圖完全相同
# --------------------------------------------------------------------------

def verify_untouched(annot: RedPenAnnotator, result: Image.Image):
    _, alp = annot.get_untouched_alpha() if hasattr(annot, "get_untouched_alpha") else annot.get_overlay()
    mask_zero = alp.point(lambda v: 255 if v == 0 else 0)      # 完全沒動到的區域
    # 只驗「原圖區域」：下方延伸的白區是新增的畫布，本來就不屬於原圖
    if getattr(annot, "ext", 0):
        box = (0, 0, annot.W, annot.H)
        mask_zero = mask_zero.crop(box)
        result = result.crop(box)
    diff = ImageChops.difference(annot.base.crop((0, 0, annot.W, annot.H))
                                 if getattr(annot, "ext", 0) else annot.base,
                                 result).convert("L")
    diff_in_zero = ImageChops.multiply(diff, mask_zero.point(lambda v: 255 if v else 0))
    bad = diff_in_zero.getbbox()
    total = annot.W * annot.H
    zero_px = sum(i * c for i, c in enumerate(mask_zero.histogram())) // 255
    touched = total - zero_px
    return {
        "總像素": total,
        "被紅筆覆蓋(alpha>0)": touched,
        "覆蓋比例": f"{touched / total * 100:.2f}%",
        "未覆蓋區域與原圖差異": "無（逐位元相同）" if bad is None else f"有差異，bbox={bad}",
        "ok": bad is None,
    }


# --------------------------------------------------------------------------
# 內建示範標註（針對 104-N1 學生作答：2/3 級分，漏列兩種情形）
# --------------------------------------------------------------------------

DEMO_ANNOTATIONS = [
    {"type": "score", "at": [0.868, 0.086], "text": "2/3", "size": 0.038, "angle": -9},

    {"type": "check", "at": [0.818, 0.189], "size": 0.030},
    {"type": "note", "at": [0.600, 0.232], "text": "等差和公式運用正確", "size": 0.023, "anchor": "lt"},

    {"type": "circle", "bbox": [0.082, 0.286, 0.968, 0.410], "shape": "rect"},

    {"type": "arrow", "from": [0.255, 0.524], "to": [0.183, 0.421], "bow": 0.30},
    {"type": "note", "at": [0.118, 0.534],
     "text": "漏列 (一)+(二)、(二)+(三)\n七種相鄰情形需全部討論才完整",
     "size": 0.024, "anchor": "lt"},

    {"type": "underline", "from": [0.392, 0.481], "to": [0.728, 0.481], "style": "wave"},
    {"type": "note", "at": [0.752, 0.452], "text": "答案正確", "size": 0.023, "anchor": "lt"},
]


# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------

def main(argv=None):
    try:  # 讓中文訊息在 Windows 主控台正常顯示
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass
    ap = argparse.ArgumentParser(description="程式化紅筆批改標註（原圖像素不重繪）")
    ap.add_argument("--image", required=True, help="原圖路徑")
    ap.add_argument("--out", required=True, help="輸出 PNG 路徑")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--json", help="標註 JSON 檔路徑")
    g.add_argument("--json-str", help="直接給 JSON 字串")
    g.add_argument("--demo", action="store_true", help="使用內建示範標註")
    ap.add_argument("--overlay-out", help="另存透明紅筆層 PNG（證明原圖未被重繪）")
    ap.add_argument("--extend", type=float, default=0.0,
                    help="畫布下方延伸高度（原圖高的比例，如 0.4）；留 0 則依 solution 內容自動計算")
    ap.add_argument("--pen-scale", type=float, default=1.0, help="筆畫粗細倍率，預設 1.0")
    ap.add_argument("--supersample", type=int, default=SUPERSAMPLE, help="超取樣倍率，預設 3")
    ap.add_argument("--verify", action="store_true", help="驗證未覆蓋區域與原圖是否逐位元相同")
    args = ap.parse_args(argv)

    if args.demo:
        annotations = DEMO_ANNOTATIONS
    elif args.json:
        with open(args.json, "r", encoding="utf-8") as f:
            annotations = json.load(f)
    else:
        annotations = json.loads(args.json_str)
    if isinstance(annotations, dict):
        annotations = annotations.get("annotations", [])

    base = Image.open(args.image)
    print(f"原圖：{args.image}  尺寸 {base.size[0]}x{base.size[1]}  模式 {base.mode}")

    # 有 solution 續寫區就自動把畫布往下延伸到剛好容納（--extend 可手動覆寫，單位為原圖高的比例）
    ext_px = int(args.extend * base.size[1]) if args.extend else 0
    if not ext_px:
        need = [solution_metrics(base.size[0], a)[0]
                for a in annotations if str(a.get("type", "")).lower() == "solution"]
        if need:
            # 實際繪製是在超取樣尺度重新排版，斷行可能微幅不同 → 多留 8% 餘裕，避免最後一行被切掉
            ext_px = int(max(need) * 1.08)
            print(f"續寫解答區：畫布下方自動延伸 {ext_px}px")

    ann = RedPenAnnotator(base, supersample=args.supersample, pen_scale=args.pen_scale,
                          extend_px=ext_px)
    ann.annotate(annotations)
    result = ann.compose()

    os.makedirs(os.path.dirname(os.path.abspath(args.out)) or ".", exist_ok=True)
    result.save(args.out, "PNG")
    print(f"已輸出：{args.out}（{len(annotations)} 筆標註）")

    if args.overlay_out:
        prem, alp = ann.get_overlay()
        Image.merge("RGBA", (prem[0], prem[1], prem[2], alp)).save(args.overlay_out, "PNG")
        print(f"已輸出透明紅筆層：{args.overlay_out}")

    if args.verify:
        rep = verify_untouched(ann, result)
        print("--- 原圖完整性驗證 ---")
        for k, v in rep.items():
            if k != "ok":
                print(f"  {k}：{v}")
        if not rep["ok"]:
            return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
