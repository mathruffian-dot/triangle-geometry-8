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

from PIL import Image, ImageChops, ImageDraw, ImageFont

# --------------------------------------------------------------------------
# 常數
# --------------------------------------------------------------------------

RED = (224, 49, 49)          # #E03131 老師紅筆
SUPERSAMPLE = 3              # 超取樣倍率（畫完再縮小 → 線條自然平滑）
PEN_ALPHA = 242              # 紅筆不透明度（略低於 255，看起來像有滲墨）
PANEL_ALPHA = 178            # 批註白底不透明度（讓底下手寫字仍隱約可見）
HALO_ALPHA = 232             # 文字白色描邊不透明度

FONT_REGULAR = [
    r"C:/Windows/Fonts/msjh.ttc",
    r"C:/Windows/Fonts/msjhl.ttc",
    r"C:/Windows/Fonts/mingliu.ttc",
]
FONT_BOLD = [
    r"C:/Windows/Fonts/msjhbd.ttc",
    r"C:/Windows/Fonts/msjh.ttc",
]


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

    def __init__(self, base_img, supersample=SUPERSAMPLE, pen_scale=1.0):
        self.base = base_img.convert("RGB")
        self.W, self.H = self.base.size
        self.ss = max(1, int(supersample))
        self.overlay = Image.new("RGBA", (self.W * self.ss, self.H * self.ss), (0, 0, 0, 0))
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
        text = str(a.get("text", ""))
        if not text:
            return
        fs = self.U(a.get("size", 0.024))
        font = load_font(fs, bold=bool(a.get("bold", True)))
        col = parse_color(a.get("color"))
        anchor = a.get("anchor", "lt")
        spacing = fs * 0.34
        halo = max(1, int(fs * 0.10))

        d = self.draw
        bb = d.multiline_textbbox((0, 0), text, font=font, spacing=spacing,
                                  align="left", stroke_width=halo)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        ox, oy = self.P(a.get("at", [0.5, 0.5]))
        h, v = (anchor + "lt")[0], (anchor + "lt")[1]
        if h == "c":
            ox -= tw / 2
        elif h == "r":
            ox -= tw
        if v == "m":
            oy -= th / 2
        elif v == "b":
            oy -= th

        # 夾在畫布內：避免批註文字（含面板與左側紅槓）被切出畫面外
        CW, CH = self.W * self.ss, self.H * self.ss
        pad_ = fs * 0.34
        margin = fs * 0.75            # 左側紅槓 + 面板留白
        ox = min(max(ox, margin), max(margin, CW - tw - pad_ - fs * 0.3))
        oy = min(max(oy, pad_), max(pad_, CH - th - pad_))

        if a.get("panel", True):
            pad = fs * 0.34
            rad = fs * 0.32
            d.rounded_rectangle([ox - pad, oy - pad * 0.75, ox + tw + pad, oy + th + pad * 0.75],
                                radius=rad, fill=(255, 255, 255, PANEL_ALPHA))

        d.multiline_text((ox - bb[0], oy - bb[1]), text, font=font, fill=col + (250,),
                         spacing=spacing, align="left",
                         stroke_width=halo, stroke_fill=(255, 255, 255, HALO_ALPHA))

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
        sub.W = sub.H = box
        sub.ss = 1

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
        size = (self.W, self.H)
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
    diff = ImageChops.difference(annot.base, result).convert("L")
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

    ann = RedPenAnnotator(base, supersample=args.supersample, pen_scale=args.pen_scale)
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
