# -*- coding: utf-8 -*-
"""
題目配圖元件庫（非選／選擇題生成器共用）。

一個 spec dict → SVG 字串 → PNG。所有圖都由參數驅動（邊長改了，圖上標註跟著改），
不是固定貼圖。分兩批來源：

【接現成】jh-math-geometry 技能的 geometry_renderer.py（純 Python SVG 渲染器）
  triangle / quad / circle / coord / solid / parallel / center / similar
【本檔自建】會考常見但幾何渲染器沒有的
  table（資料表、列聯表）／notice（公告卡、價目表、標語框）／dialog（對話框）
  numberline（數線）／chart（長條‧折線‧直方‧盒狀）／pattern（規律圖形序列）
  polygon（正 n 邊形＋邊心距／內切圓）／rectpath（長方形雙路線）

用法：
    from figures import render_svg, render_png, svg_to_image
    render_png({"kind": "polygon", "n": 6, "side_label": "22 公分",
                "apothem": True}, Path("out.png"))

自測（產出總覽圖到 scratchpad）：
    python scripts/figures.py --demo <輸出資料夾>
"""
from __future__ import annotations

import io
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

import cairosvg
from PIL import Image

# 幾何渲染器：優先用隨專案附帶的 scripts/vendor/，沒有才回頭找開發者本機的全域技能目錄。
# （別人拿到專案時沒有全域技能，8 種幾何配圖會壞在 import，所以 vendor 一份進來）
for _geo_dir in (Path(__file__).resolve().parent / "vendor",
                 Path("C:/Users/user/.claude-skills/jh-math-geometry/scripts")):
    if (_geo_dir / "geometry_renderer.py").exists():
        if str(_geo_dir) not in sys.path:
            sys.path.insert(0, str(_geo_dir))
        break

CJK = "Microsoft JhengHei, PMingLiU, Noto Sans CJK TC, sans-serif"
INK = "#111827"
LINE = "#334155"
GRAY = "#e5e7eb"
RED = "#c0392b"

# geometry_renderer 的 kind 對照（本檔用短名，技能用長名）
GEO_KINDS = {
    "triangle": "triangle", "quad": "quadrilateral", "circle": "circle",
    "coord": "coordinate_plane", "solid": "solid_3d", "parallel": "parallel_lines",
    "center": "triangle_center", "similar": "similar_triangles",
}


# ───────────────────────────────────────────── 共用小工具


def tw(s: str, size: float) -> float:
    """粗估字串寬度（中文字約一個字寬，英數約 0.55）。"""
    return sum(size if ord(ch) > 0x2E80 else size * 0.55 for ch in str(s))


def esc(s) -> str:
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def text(x, y, s, size=17, anchor="start", color=INK, weight="normal", style="normal"):
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-family="{CJK}" font-size="{size}" '
            f'fill="{color}" text-anchor="{anchor}" font-weight="{weight}" '
            f'font-style="{style}">{esc(s)}</text>')


def wrap(s: str, size: float, max_w: float):
    """SVG 用的中文換行（逐字，英數不拆詞）。"""
    import re
    toks = re.findall(r"[0-9A-Za-z]+(?:[.,][0-9]+)*|.", s)
    lines, cur = [], ""
    for t in toks:
        if tw(cur + t, size) > max_w and cur:
            lines.append(cur); cur = t
        else:
            cur += t
    if cur:
        lines.append(cur)
    return lines


def svg_doc(w, h, body, bg="white"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:.0f}" height="{h:.0f}" '
            f'viewBox="0 0 {w:.0f} {h:.0f}">'
            f'<rect width="{w:.0f}" height="{h:.0f}" fill="{bg}"/>{body}</svg>')


def _fix_font(svg: str) -> str:
    """幾何渲染器預設 serif（中文會變方框）→ 換成中文字型。"""
    return svg.replace('font-family="serif"', f'font-family="{CJK}"')


# ───────────────────────────────────────────── 自建元件


def _polygon(sp):
    """正 n 邊形，可標邊長／邊心距／內切圓／外接圓／一個內角。"""
    import math
    n = int(sp.get("n", 6))
    R = float(sp.get("r", 108))
    W = H = int(R * 2 + 150)
    cx = cy = W / 2
    rot = math.pi / 2 + (math.pi / n if n % 2 == 0 else 0)   # 讓底邊水平
    pts = [(cx + R * math.cos(rot + 2 * math.pi * i / n),
            cy - R * math.sin(rot + 2 * math.pi * i / n)) for i in range(n)]
    body = ('<polygon points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in pts) +
            f'" fill="{sp.get("fill", "#f1f5f9")}" stroke="{LINE}" stroke-width="2"/>')

    mids = [((pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2)
            for i in range(n)]
    apo = math.dist((cx, cy), mids[0])
    i_side = max(range(n), key=lambda i: mids[i][1])    # 邊長標在最底下那條邊
    i_apo = (i_side + max(1, n // 3)) % n               # 邊心距畫到另一條邊，兩個標籤不打架
    sx, sy = mids[i_side]
    mx, my = mids[i_apo]
    ux, uy = (mx - cx) / apo, (my - cy) / apo           # 中心→邊中點的單位向量
    sux, suy = (sx - cx) / apo, (sy - cy) / apo
    if sp.get("incircle"):
        body += f'<circle cx="{cx}" cy="{cy}" r="{apo:.1f}" fill="none" stroke="#2563eb" stroke-width="1.6" stroke-dasharray="5 4"/>'
    if sp.get("circumcircle"):
        body += f'<circle cx="{cx}" cy="{cy}" r="{R:.1f}" fill="none" stroke="#2563eb" stroke-width="1.4" stroke-dasharray="5 4"/>'
    if sp.get("center_label", "O"):
        body += f'<circle cx="{cx}" cy="{cy}" r="3" fill="{INK}"/>'
        body += text(cx + 8, cy + 16, sp.get("center_label", "O"), 17)
    def boxed(x, y, s, size, color):
        """先鋪白底再寫字，避免壓到線。"""
        w = tw(s, size)
        return (f'<rect x="{x - w/2 - 4:.1f}" y="{y - size:.1f}" width="{w + 8:.1f}" '
                f'height="{size + 8:.1f}" fill="white"/>' + text(x, y, s, size, "middle", color))

    if sp.get("apothem"):
        body += f'<line x1="{cx}" y1="{cy}" x2="{mx:.1f}" y2="{my:.1f}" stroke="{RED}" stroke-width="2"/>'
        lx, ly = (cx + mx) / 2 - uy * 38, (cy + my) / 2 + ux * 38
        body += boxed(lx, ly, sp.get("apothem_label", "邊心距"), 16, RED)
    if sp.get("side_label"):
        body += boxed(sx + sux * 30, sy + suy * 30 + 6, sp["side_label"], 16, INK)
    if sp.get("angle_label"):                          # 內角標在頂點內側
        v = pts[i_side]
        dx, dy = cx - v[0], cy - v[1]
        L = math.hypot(dx, dy) or 1
        body += boxed(v[0] + dx / L * 40, v[1] + dy / L * 40, sp["angle_label"], 15, RED)
    return svg_doc(W, H, body)


def _rectpath(sp):
    """長方形場地＋兩種走法（對角線 vs 折線），標長寬。"""
    W, H = 520, 300
    a, b = 320, 170
    x0, y0 = (W - a) / 2 + 26, (H - b) / 2 - 10
    body = f'<rect x="{x0}" y="{y0}" width="{a}" height="{b}" fill="#f8fafc" stroke="{LINE}" stroke-width="2"/>'
    A = (x0, y0 + b); B = (x0 + a, y0 + b); C = (x0 + a, y0); D = (x0, y0)
    body += f'<line x1="{A[0]}" y1="{A[1]}" x2="{C[0]}" y2="{C[1]}" stroke="{RED}" stroke-width="2.6"/>'
    body += (f'<polyline points="{A[0]},{A[1]} {B[0]},{B[1]} {C[0]},{C[1]}" fill="none" '
             f'stroke="#2563eb" stroke-width="2.6" stroke-dasharray="8 5"/>')
    for (p, lab, dx, dy) in [(A, sp.get("p_a", "A"), -16, 16), (B, sp.get("p_b", "B"), 10, 18),
                             (C, sp.get("p_c", "C"), 10, -6), (D, sp.get("p_d", "D"), -16, -6)]:
        body += f'<circle cx="{p[0]}" cy="{p[1]}" r="3" fill="{INK}"/>' + text(p[0] + dx, p[1] + dy, lab, 16)
    if sp.get("w_label"):
        body += text((A[0] + B[0]) / 2, A[1] + 26, sp["w_label"], 16, "middle")
    if sp.get("h_label"):
        body += text(x0 - 10, (y0 + y0 + b) / 2, sp["h_label"], 16, "end")
    # 圖例畫在圖形下方（放在框內會壓到邊與頂點標籤）
    l1, l2 = sp.get("legend1", "走法一"), sp.get("legend2", "走法二")
    ly = y0 + b + 58
    lx = x0
    body += f'<line x1="{lx}" y1="{ly}" x2="{lx + 34}" y2="{ly}" stroke="{RED}" stroke-width="3"/>'
    body += text(lx + 42, ly + 6, l1, 15, "start", RED)
    lx2 = lx + 52 + tw(l1, 15) + 24
    body += (f'<line x1="{lx2}" y1="{ly}" x2="{lx2 + 34}" y2="{ly}" stroke="#2563eb" '
             f'stroke-width="3" stroke-dasharray="7 4"/>')
    body += text(lx2 + 42, ly + 6, l2, 15, "start", "#2563eb")
    return svg_doc(W, H + 30, body)


def _table(sp):
    """資料表／列聯表。headers 為表頭列；rows 為資料列；corner 為左上角斜線標題。"""
    headers = sp.get("headers", [])
    rows = sp.get("rows", [])
    title = sp.get("title", "")
    note = sp.get("note", "")
    fs = float(sp.get("font_size", 17))
    pad = 14
    ncol = max(len(headers), max((len(r) for r in rows), default=0))
    grid = ([headers] if headers else []) + [list(r) for r in rows]
    colw = []
    for j in range(ncol):
        w = max(tw(g[j], fs) if j < len(g) else 0 for g in grid) if grid else 40
        colw.append(max(w + pad * 2, 56))
    rowh = fs + 18
    tw_all = sum(colw)
    W = tw_all + 40
    top = 34 if title else 12
    H = top + rowh * len(grid) + (28 if note else 0) + 16
    x0, y0 = 20, top
    body = ""
    if title:
        body += text(W / 2, 24, title, fs + 1, "middle", INK, "bold")
    y = y0
    for i, g in enumerate(grid):
        x = x0
        head = bool(headers) and i == 0
        for j in range(ncol):
            cell = g[j] if j < len(g) else ""
            body += (f'<rect x="{x:.1f}" y="{y:.1f}" width="{colw[j]:.1f}" height="{rowh:.1f}" '
                     f'fill="{"#f1f5f9" if head or (sp.get("head_col") and j == 0) else "white"}" '
                     f'stroke="{LINE}" stroke-width="1.2"/>')
            body += text(x + colw[j] / 2, y + rowh / 2 + fs * 0.36, cell, fs, "middle",
                         INK, "bold" if head else "normal")
            x += colw[j]
        y += rowh
    if sp.get("corner_diagonal") and grid:
        body += f'<line x1="{x0}" y1="{y0}" x2="{x0 + colw[0]:.1f}" y2="{y0 + rowh:.1f}" stroke="{LINE}" stroke-width="1.2"/>'
    if note:
        body += text(W - 20, y + 20, note, fs - 2, "end", "#475569")
    return svg_doc(W, H, body)


def _notice(sp):
    """公告卡／價目表／標語框：圓角外框＋標題＋條列。"""
    title = sp.get("title", "")
    lines = sp.get("lines", [])
    foot = sp.get("footnote", "")
    fs = float(sp.get("font_size", 17))
    W = float(sp.get("width", 470))
    inner = W - 56
    wrapped = []
    for ln in lines:
        mark = ln.get("mark", "") if isinstance(ln, dict) else ""
        s = ln.get("text", "") if isinstance(ln, dict) else str(ln)
        parts = wrap(s, fs, inner - (tw(mark, fs) + 8 if mark else 0))
        for i, p in enumerate(parts):
            wrapped.append((mark if i == 0 else "", p))
    lh = fs + 12
    H = 26 + (34 if title else 0) + lh * len(wrapped) + (28 if foot else 0) + 22
    body = (f'<rect x="6" y="6" width="{W - 12}" height="{H - 12}" rx="14" fill="#fffdf7" '
            f'stroke="{LINE}" stroke-width="2"/>')
    y = 26
    if title:
        body += text(W / 2, y + fs, title, fs + 2, "middle", INK, "bold")
        y += 34
    y += 10
    for mark, s in wrapped:
        x = 30
        if mark:
            body += (f'<circle cx="{x + 9}" cy="{y + fs * 0.35:.1f}" r="11" fill="{INK}"/>'
                     + text(x + 9, y + fs * 0.35 + 5, mark, fs - 4, "middle", "white", "bold"))
            x += 28
        body += text(x, y + fs, s, fs)
        y += lh
    if foot:
        body += text(W - 26, y + 16, foot, fs - 3, "end", "#475569")
    return svg_doc(W, H, body)


def _dialog(sp):
    """對話框：左右交錯的人物剪影＋對話氣泡（會考常見的兩人對話圖）。"""
    turns = sp.get("turns", [])
    fs = float(sp.get("font_size", 17))
    W = float(sp.get("width", 560))
    bubble_w = W - 210
    rows, H = [], 16
    for t in turns:
        who = t.get("who", "")
        lines = wrap(t.get("text", ""), fs, bubble_w - 34)
        h = len(lines) * (fs + 9) + 26
        rows.append((who, t.get("side", "left"), lines, h))
        H += h + 18
    body = ""
    y = 16
    for who, side, lines, h in rows:
        left = side == "left"
        px = 46 if left else W - 46                      # 人物中心
        bx = 96 if left else W - 96 - bubble_w
        body += (f'<circle cx="{px}" cy="{y + h / 2 - 12:.1f}" r="17" fill="#cbd5e1" stroke="{LINE}"/>'
                 f'<path d="M {px - 24} {y + h / 2 + 26:.1f} a 24 20 0 0 1 48 0 z" fill="#cbd5e1" stroke="{LINE}"/>')
        body += text(px, y + h / 2 + 46, who, fs - 3, "middle", "#475569")
        body += (f'<rect x="{bx:.1f}" y="{y:.1f}" width="{bubble_w:.1f}" height="{h:.1f}" rx="12" '
                 f'fill="white" stroke="{LINE}" stroke-width="1.8"/>')
        tipx = bx if left else bx + bubble_w
        sgn = -1 if left else 1
        body += (f'<path d="M {tipx} {y + h / 2 - 10:.1f} l {sgn * 14} {10} l {-sgn * 14} {10} z" '
                 f'fill="white" stroke="{LINE}" stroke-width="1.8"/>')
        body += f'<rect x="{tipx - 2 if left else tipx - 2}" y="{y + h / 2 - 8:.1f}" width="4" height="16" fill="white"/>'
        ty = y + 22
        for ln in lines:
            body += text(bx + 17, ty, ln, fs)
            ty += fs + 9
        y += h + 18
    return svg_doc(W, H, body)


def _numberline(sp):
    """數線：刻度、點與標籤（支援 a、b 這類文字標籤）。"""
    lo, hi = sp.get("range", [-5, 5])
    W = float(sp.get("width", 520))
    H = 130
    m = 40
    def X(v):
        return m + (v - lo) / (hi - lo) * (W - 2 * m)
    y = 62
    body = (f'<line x1="{m - 22}" y1="{y}" x2="{W - m + 22}" y2="{y}" stroke="{INK}" stroke-width="2"/>'
            f'<path d="M {W - m + 22} {y} l -12 -6 l 0 12 z" fill="{INK}"/>'
            f'<path d="M {m - 22} {y} l 12 -6 l 0 12 z" fill="{INK}"/>')
    step = sp.get("tick", 1)
    if step:
        v = lo
        while v <= hi + 1e-9:
            body += f'<line x1="{X(v):.1f}" y1="{y - 6}" x2="{X(v):.1f}" y2="{y + 6}" stroke="{INK}" stroke-width="1.4"/>'
            if sp.get("tick_labels"):
                body += text(X(v), y + 26, f"{v:g}", 15, "middle", "#475569")
            v += step
    for p in sp.get("points", []):
        x = X(p["x"])
        body += f'<circle cx="{x:.1f}" cy="{y}" r="4.5" fill="{p.get("color", RED)}"/>'
        body += text(x, y - 16, p.get("label", ""), 17, "middle", p.get("color", INK), "bold")
        if p.get("sub"):
            body += text(x, y + 30, p["sub"], 15, "middle", "#475569")
    return svg_doc(W, H, body)


def _chart(sp):
    """統計圖：bar／line／hist／box（matplotlib 產 SVG，字型設中文）。"""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    plt.rcParams["font.sans-serif"] = ["Microsoft JhengHei", "PMingLiU"]
    plt.rcParams["axes.unicode_minus"] = False

    kind = sp.get("chart", "bar")
    labels = sp.get("labels", [])
    data = sp.get("data", [])
    fig, ax = plt.subplots(figsize=sp.get("figsize", (5.4, 3.1)), dpi=110)
    if kind == "bar":
        ax.bar(labels, data, color=sp.get("color", "#94a3b8"), edgecolor="#334155", width=.62)
        if sp.get("value_labels", True):
            for i, v in enumerate(data):
                ax.text(i, v, f"{v:g}", ha="center", va="bottom", fontsize=9)
    elif kind == "line":
        ax.plot(labels, data, marker="o", color=sp.get("color", "#2563eb"))
        if sp.get("value_labels", True):
            for i, v in enumerate(data):
                ax.annotate(f"{v:g}", (i, v), textcoords="offset points", xytext=(0, 7),
                            ha="center", fontsize=9)
    elif kind == "hist":                       # data = 各組次數，labels = 組界文字
        ax.bar(range(len(data)), data, width=1.0, color=sp.get("color", "#94a3b8"),
               edgecolor="#334155")
        ax.set_xticks(range(len(data))); ax.set_xticklabels(labels, fontsize=9)
    elif kind == "box":                        # data = [[五數或原始資料], ...]
        ax.boxplot(data, tick_labels=labels, patch_artist=True,
                   boxprops=dict(facecolor="#e2e8f0", color="#334155"),
                   medianprops=dict(color="#c0392b"))
    ax.set_title(sp.get("title", ""), fontsize=12)
    ax.set_xlabel(sp.get("xlabel", ""), fontsize=10)
    ax.set_ylabel(sp.get("ylabel", ""), fontsize=10)
    ax.grid(axis="y", alpha=.3)
    fig.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="svg")
    plt.close(fig)
    return buf.getvalue().decode("utf-8")


def _pattern(sp):
    """規律圖形序列：第 1、2、3… 個圖形（方塊或圓點）。"""
    kind = sp.get("layout", "row")             # row／staircase／square
    k = int(sp.get("count", 3))
    a1 = int(sp.get("a1", 1)); d = int(sp.get("d", 1))
    cell = 22
    figs = []
    for i in range(1, k + 1):
        if kind == "row":
            n = a1 + (i - 1) * d
            cells = [(0, c) for c in range(n)]
        elif kind == "staircase":
            cells = [(r, c) for r in range(i) for c in range(r + 1)]
        else:                                   # square
            cells = [(r, c) for r in range(i) for c in range(i)]
        figs.append(cells)
    widths = [(max(c for _, c in f) + 1) * cell for f in figs]
    heights = [(max(r for r, _ in f) + 1) * cell for f in figs]
    gap = 46
    W = sum(widths) + gap * (k + 1)
    H = max(heights) + 76
    body, x = "", gap
    for i, cells in enumerate(figs):
        base_y = 24 + (max(heights) - heights[i])
        for (r, c) in cells:
            cx, cy = x + c * cell, base_y + r * cell
            if sp.get("shape") == "dot":
                body += f'<circle cx="{cx + cell/2:.1f}" cy="{cy + cell/2:.1f}" r="{cell*0.36:.1f}" fill="#94a3b8" stroke="{LINE}"/>'
            else:
                body += f'<rect x="{cx:.1f}" y="{cy:.1f}" width="{cell}" height="{cell}" fill="#e2e8f0" stroke="{LINE}" stroke-width="1.4"/>'
        body += text(x + widths[i] / 2, H - 26, f"第 {i+1} 個", 16, "middle")
        x += widths[i] + gap
    return svg_doc(W, H, body)


def _annulus(sp):
    """同心圓環：內圓＋外圓，環狀區域填色，可標內外半徑。"""
    import math
    R = float(sp.get("outer_px", 130))
    ratio = float(sp.get("ratio", 0.6))          # 內圓 / 外圓
    r = R * max(0.2, min(0.9, ratio))
    pad = 76
    W = H = int(R * 2 + pad * 2)
    cx = cy = W / 2
    body = (f'<circle cx="{cx}" cy="{cy}" r="{R:.1f}" fill="#dbeafe" stroke="{LINE}" stroke-width="2"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r:.1f}" fill="#dcfce7" stroke="{LINE}" stroke-width="2"/>'
            f'<circle cx="{cx}" cy="{cy}" r="3" fill="{INK}"/>'
            + text(cx + 9, cy + 18, sp.get("center_label", "O"), 17))

    def radius_line(deg, length, label, color):
        """從圓心畫一條半徑並在末端外側標字（先鋪白底，避免壓線）。"""
        a = math.radians(deg)
        ex, ey = cx + length * math.cos(a), cy - length * math.sin(a)
        out = f'<line x1="{cx}" y1="{cy}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="{color}" stroke-width="1.8"/>'
        lx, ly = cx + (length + 34) * math.cos(a), cy - (length + 34) * math.sin(a)
        w = tw(label, 16)
        out += (f'<rect x="{lx - w/2 - 4:.1f}" y="{ly - 15:.1f}" width="{w + 8:.1f}" height="24" fill="white"/>'
                + text(lx, ly + 3, label, 16, "middle", color))
        return out

    # 兩條半徑線刻意不共線，否則看起來像一條通過圓心的直線
    if sp.get("inner_label"):
        body += radius_line(228, r, sp["inner_label"], "#166534")
    if sp.get("outer_label"):
        body += radius_line(52, R, sp["outer_label"], "#1d4ed8")
    if sp.get("ring_label"):
        body += text(cx, cy - R - 22, sp["ring_label"], 16, "middle", "#1d4ed8")
    if sp.get("core_label"):
        body += text(cx, cy - 14, sp["core_label"], 16, "middle", "#166534")
    return svg_doc(W, H, body)


def _kite(sp):
    """鳶形（AB=AD、CB=CD）：左右對稱，可畫對角線與等邊刻度。全等證明題用。"""
    import math
    # 給了 ∠BAC 與 ∠BCA 就照真實比例畫（正弦定理定出 B 的位置），沒給則用預設外形
    a_deg = float(sp.get("angle_a", 34))
    c_deg = float(sp.get("angle_c", 26))
    h = 300.0
    t = h * math.sin(math.radians(c_deg)) / max(math.sin(math.radians(a_deg + c_deg)), 1e-6)
    bx_off = t * math.sin(math.radians(a_deg))
    by_off = t * math.cos(math.radians(a_deg))
    pad = 56
    W = 2 * bx_off + pad * 2
    H = h + pad * 2
    cx = W / 2
    ay, cy2 = pad, pad + h
    A, B, C, D = (cx, ay), (cx + bx_off, ay + by_off), (cx, cy2), (cx - bx_off, ay + by_off)
    body = (f'<polygon points="{A[0]},{A[1]} {B[0]},{B[1]} {C[0]},{C[1]} {D[0]},{D[1]}" '
            f'fill="#f8fafc" stroke="{LINE}" stroke-width="2"/>')
    if sp.get("diagonal", True):        # 對角線 AC（兩個三角形的公共邊）
        body += (f'<line x1="{A[0]}" y1="{A[1]}" x2="{C[0]}" y2="{C[1]}" stroke="{LINE}" '
                 f'stroke-width="2" stroke-dasharray="{sp.get("dash","")}"/>')

    def tick(p, q, n, off=0):
        """在線段中點畫 n 條等長刻度。"""
        import math
        mx, my = (p[0] + q[0]) / 2, (p[1] + q[1]) / 2
        dx, dy = q[0] - p[0], q[1] - p[1]
        L = math.hypot(dx, dy) or 1
        ux, uy = dx / L, dy / L
        nx, ny = -uy, ux
        out = ""
        for i in range(n):
            s0 = (i - (n - 1) / 2) * 7
            out += (f'<line x1="{mx + ux*s0 - nx*7:.1f}" y1="{my + uy*s0 - ny*7:.1f}" '
                    f'x2="{mx + ux*s0 + nx*7:.1f}" y2="{my + uy*s0 + ny*7:.1f}" '
                    f'stroke="{LINE}" stroke-width="2"/>')
        return out

    body += tick(A, B, 1) + tick(A, D, 1) + tick(B, C, 2) + tick(D, C, 2)
    for (pt, lab, dx, dy) in [(A, sp.get("la", "A"), 0, -12), (B, sp.get("lb", "B"), 16, 6),
                              (C, sp.get("lc", "C"), 0, 26), (D, sp.get("ld", "D"), -16, 6)]:
        body += f'<circle cx="{pt[0]}" cy="{pt[1]}" r="3.5" fill="{INK}"/>'
        body += text(pt[0] + dx, pt[1] + dy, lab, 19, "middle", INK, "bold")
    labs = dict(sp.get("angle_labels") or {})
    for key, pos in (("label_a", "BAC"), ("label_c", "BCA"),
                     ("label_a2", "DAC"), ("label_c2", "DCA")):
        if sp.get(key):
            labs[sp[key]] = pos
    if labs:
        for lab, pos in labs.items():
            # 標在該角的角平分線方向上，角度大小不同也不會壓到邊
            ra, rc = math.radians(a_deg / 2), math.radians(c_deg / 2)
            r = 54
            px, py = {"BAC": (cx + r * math.sin(ra), ay + r * math.cos(ra)),
                      "DAC": (cx - r * math.sin(ra), ay + r * math.cos(ra)),
                      "BCA": (cx + r * math.sin(rc), cy2 - r * math.cos(rc)),
                      "DCA": (cx - r * math.sin(rc), cy2 - r * math.cos(rc))}.get(pos, (cx, (ay + cy2) / 2))
            body += text(px, py, lab, 16, "middle", RED)
    return svg_doc(W, H, body)


def _iso(sp):
    """等角投影的正方體堆疊（會考「積木＋前視圖」那類題目）。

    cubes: [[x, y, z], ...]  x 向右後、y 向左後、z 向上（單位格）
    marks: {"甲": [x,y,z], ...} 在該積木的頂面標字
    front_arrow: 是否畫「前面」箭頭
    """
    import math
    cubes = [tuple(c) for c in sp.get("cubes", [[0, 0, 0]])]
    s = float(sp.get("size", 42))
    cos30, sin30 = math.cos(math.radians(30)), 0.5

    def proj(x, y, z):
        return ((x - y) * s * cos30, (x + y) * s * sin30 - z * s)

    pts = [proj(x + dx, y + dy, z + dz) for (x, y, z) in cubes
           for dx in (0, 1) for dy in (0, 1) for dz in (0, 1)]
    minx = min(p[0] for p in pts); maxx = max(p[0] for p in pts)
    miny = min(p[1] for p in pts); maxy = max(p[1] for p in pts)
    pad = 46
    W = maxx - minx + pad * 2 + (90 if sp.get("front_arrow", True) else 0)
    H = maxy - miny + pad * 2
    ox, oy = pad - minx, pad - miny

    def P(x, y, z):
        px, py = proj(x, y, z)
        return f"{px + ox:.1f},{py + oy:.1f}"

    body = ""
    for (x, y, z) in sorted(cubes, key=lambda c: (c[0] + c[1] + c[2])):   # 遠的先畫
        top = f"{P(x,y,z+1)} {P(x+1,y,z+1)} {P(x+1,y+1,z+1)} {P(x,y+1,z+1)}"
        right = f"{P(x+1,y,z)} {P(x+1,y+1,z)} {P(x+1,y+1,z+1)} {P(x+1,y,z+1)}"
        left = f"{P(x,y+1,z)} {P(x+1,y+1,z)} {P(x+1,y+1,z+1)} {P(x,y+1,z+1)}"
        for poly, fill in ((top, "#f8fafc"), (left, "#e2e8f0"), (right, "#cbd5e1")):
            body += f'<polygon points="{poly}" fill="{fill}" stroke="{LINE}" stroke-width="1.6"/>'
    for label, c in (sp.get("marks") or {}).items():
        x, y, z = c
        cx = (proj(x, y, z + 1)[0] + proj(x + 1, y + 1, z + 1)[0]) / 2 + ox
        cy = (proj(x, y, z + 1)[1] + proj(x + 1, y + 1, z + 1)[1]) / 2 + oy
        body += text(cx, cy + 6, label, 19, "middle", INK, "bold")
    if sp.get("front_arrow", True):
        ay = H - pad + 6
        ax = pad + 10
        body += (f'<line x1="{ax}" y1="{ay}" x2="{ax + 66}" y2="{ay - 26}" stroke="{INK}" stroke-width="3"/>'
                 f'<path d="M {ax + 66} {ay - 26} l -14 1 l 5 12 z" fill="{INK}"/>')
        body += text(ax - 6, ay + 8, sp.get("front_label", "前面"), 17, "end")
    return svg_doc(W, H, body)


def _net(sp):
    """展開圖：長方體（十字型）或直三角柱，可在指定面上標字。"""
    kind = sp.get("solid", "cuboid")
    u = float(sp.get("size", 74))
    labels = sp.get("labels", {})           # {"甲": "top", ...} 面名 → 標字
    body = ""

    def face(x, y, w, h, name):
        nonlocal body
        body += (f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" '
                 f'fill="#f8fafc" stroke="{LINE}" stroke-width="1.8"/>')
        lab = next((k for k, v in labels.items() if v == name), None)
        if lab:
            body += text(x + w / 2, y + h / 2 + 7, lab, 20, "middle", INK, "bold")

    if kind == "cuboid":
        a, b, c = u * 1.35, u, u * 0.85          # 長、寬、高
        W, H = a * 2 + b * 2 + 60, b * 2 + c + 60
        x0, y0 = 30, 30
        face(x0 + b, y0, a, b, "top")
        face(x0, y0 + b, b, c, "left")
        face(x0 + b, y0 + b, a, c, "front")
        face(x0 + b + a, y0 + b, b, c, "right")
        face(x0 + b + a + b, y0 + b, a, c, "back")
        face(x0 + b, y0 + b + c, a, b, "bottom")
    else:                                        # 直三角柱：三個長方形＋兩個三角形
        import math
        w, h = u, u * 1.6
        W, H = w * 3 + u * 1.9, h + u * 2.6
        x0, y0 = 40, 40 + u * 0.85
        for i, nm in enumerate(["side1", "side2", "side3"]):
            face(x0 + i * w, y0, w, h, nm)
        tri_h = w * math.sqrt(3) / 2
        t_up = f"{x0+w},{y0} {x0+2*w},{y0} {x0+1.5*w},{y0-tri_h}"
        t_dn = f"{x0+w},{y0+h} {x0+2*w},{y0+h} {x0+1.5*w},{y0+h+tri_h}"
        for poly, nm in ((t_up, "topface"), (t_dn, "bottomface")):
            body += f'<polygon points="{poly}" fill="#eef2f7" stroke="{LINE}" stroke-width="1.8"/>'
            lab = next((k for k, v in labels.items() if v == nm), None)
            if lab:
                cy = (y0 - tri_h * 0.45) if nm == "topface" else (y0 + h + tri_h * 0.45)
                body += text(x0 + 1.5 * w, cy + 7, lab, 20, "middle", INK, "bold")
    return svg_doc(W, H, body)


BUILTIN = {"polygon": _polygon, "rectpath": _rectpath, "table": _table, "notice": _notice,
           "dialog": _dialog, "numberline": _numberline, "chart": _chart, "pattern": _pattern,
           "iso": _iso, "net": _net, "kite": _kite,
           "annulus": _annulus}


# ───────────────────────────────────────────── 對外 API


def render_svg(spec: dict) -> str:
    kind = spec.get("kind")
    if kind in BUILTIN:
        return BUILTIN[kind](spec)
    if kind in GEO_KINDS:
        from geometry_renderer import render_figure
        svg = render_figure({"type": GEO_KINDS[kind],
                             "config": spec.get("config", {}),
                             "canvas": spec.get("canvas", {"width": spec.get("width", 360),
                                                           "height": spec.get("height", 300)})})
        return _fix_font(svg)
    raise ValueError(f"未知的圖形 kind：{kind}（可用：{sorted(BUILTIN) + sorted(GEO_KINDS)}）")


def svg_to_image(svg: str, width: int | None = None, scale: float = 1.0) -> Image.Image:
    kw = {"output_width": width} if width else {"scale": scale}
    png = cairosvg.svg2png(bytestring=svg.encode("utf-8"), background_color="white", **kw)
    return Image.open(io.BytesIO(png)).convert("RGB")


def render_png(spec: dict, out: Path, width: int | None = None, scale: float = 1.6) -> Path:
    im = svg_to_image(render_svg(spec), width=width, scale=scale)
    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, "PNG")
    return out


def render_image(spec: dict, max_width: int) -> Image.Image:
    """給題目卡排版用：算好寬度上限，回傳 PIL 影像。"""
    im = svg_to_image(render_svg(spec), scale=1.7)
    if im.width > max_width:
        h = round(im.height * max_width / im.width)
        im = im.resize((max_width, h), Image.LANCZOS)
    return im


# ───────────────────────────────────────────── 題目卡渲染（非選／選擇題共用）

from PIL import ImageDraw, ImageFont  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import get as _cfg  # noqa: E402  字型清單集中在 data/config.json
FONT_FILES = [(fp, 0) for fp in _cfg("font_files")]


def load_font(size):
    for fp, idx in FONT_FILES:
        try:
            return ImageFont.truetype(fp, size, index=idx)
        except Exception:
            continue
    return ImageFont.load_default()


def wrap_px(draw, s, font, max_w):
    """PIL 版換行：中文逐字，英數字（含小數）不拆詞。"""
    import re
    toks = re.findall(r"[0-9A-Za-z]+(?:[.,][0-9]+)*|\n|.", s)
    TAIL = "。，、；：？！）」』%"          # 避頭尾：這些字不落在行首，寧可讓該行稍微超寬
    lines, cur = [], ""
    for t in toks:
        if t == "\n":
            lines.append(cur); cur = ""; continue
        if draw.textlength(cur + t, font=font) > max_w and cur and t not in TAIL:
            lines.append(cur); cur = t
        else:
            cur += t
    lines.append(cur)
    return lines


def render_question_png(out: Path, num, stem, items, figure=None, lead=None,
                        width=1000, font_size=27, indent_items=True,
                        passage=None, passage_title=None, passage_figure=None):
    """把一題（題號＋題幹＋圖＋小題／選項）畫成 PNG，沿用題庫既有的 <img> 顯示管線。

    items：非選＝兩個小題；選擇題＝四個選項（短選項會自動排成一行）。
    figure：figures 的 spec dict（None 代表無圖）。
    passage：題組的共用選文（會考 23–25 題那種），畫成有外框的區塊放在題幹上方；
             passage_figure 是選文自己的附圖（例如費率表）。
    """
    pad = 44
    font = load_font(font_size)
    tmp = Image.new("RGB", (10, 10))
    d0 = ImageDraw.Draw(tmp)
    max_w = width - pad * 2
    lh = int(font_size * 1.72)

    # ── 題組選文區塊（先量高度，稍後畫）
    pass_lines, pass_font, pass_lh, pass_fig = [], None, 0, None
    if passage:
        pass_font = load_font(font_size - 3)
        pass_lh = int((font_size - 3) * 1.66)
        for para in passage.split("\n"):
            pass_lines += wrap_px(d0, para, pass_font, max_w - 44) if para else [""]
        if passage_figure:
            pass_fig = render_image(passage_figure, int(max_w * 0.78))
    pass_h = (len(pass_lines) * pass_lh + 40 + (pass_fig.height + 18 if pass_fig else 0)) if passage else 0
    title_h = lh if passage_title else 0

    # 選項若都很短，排成一行（會考的純數值選項就是這樣）
    one_line_opts = None
    if items and all(len(str(i)) <= 14 for i in items) and len(items) == 4 \
            and str(items[0]).startswith("("):
        joined = "　".join(str(i) for i in items)
        if d0.textlength(joined, font=font) <= max_w:
            one_line_opts = joined

    blocks = [f"{num}."] if num else []
    if stem:
        blocks.append(stem)
    body_lines = []
    for b in blocks:
        body_lines += wrap_px(d0, b, font, max_w) + [""]

    tail_lines = []
    if lead:
        tail_lines += wrap_px(d0, lead, font, max_w) + [""]
    if one_line_opts:
        tail_lines += [one_line_opts]
    else:
        for it in items or []:
            wrapped = wrap_px(d0, str(it), font, max_w - (34 if indent_items else 0))
            tail_lines += [("" if k == 0 else "　　") + w for k, w in enumerate(wrapped)]
            tail_lines.append("")

    fig_im = render_image(figure, int(max_w * 0.86)) if figure else None
    fig_h = (fig_im.height + 26) if fig_im else 0
    H = pad * 2 + lh * (len(body_lines) + len(tail_lines)) + fig_h + pass_h + title_h + (18 if passage else 0)
    im = Image.new("RGB", (width, H), "white")
    d = ImageDraw.Draw(im)

    y = pad
    if passage_title:
        d.text((pad, y), passage_title, font=font, fill="black")
        y += lh
    if passage:                                   # 選文區塊：淺色底＋外框，與題幹區隔
        box_top = y
        d.rounded_rectangle([pad, box_top, width - pad, box_top + pass_h], radius=12,
                            fill="#f8fafc", outline="#94a3b8", width=2)
        ty = box_top + 20
        for ln in pass_lines:
            d.text((pad + 22, ty), ln, font=pass_font, fill="black")
            ty += pass_lh
        if pass_fig:
            im.paste(pass_fig, ((width - pass_fig.width) // 2, ty + 6))
        y = box_top + pass_h + 18

    for ln in body_lines:
        d.text((pad, y), ln, font=font, fill="black")
        y += lh
    if fig_im:
        im.paste(fig_im, ((width - fig_im.width) // 2, y))
        y += fig_im.height + 26
    for ln in tail_lines:
        d.text((pad, y), ln, font=font, fill="black")
        y += lh

    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, "PNG")
    return out


# ───────────────────────────────────────────── 自測

DEMOS = [
    ("polygon", {"kind": "polygon", "n": 6, "side_label": "邊長 22 公分", "apothem": True,
                 "incircle": True}),
    ("rectpath", {"kind": "rectpath", "w_label": "長 200 公尺", "h_label": "寬 45 公尺"}),
    ("table", {"kind": "table", "title": "表(一)", "corner_diagonal": True, "head_col": True,
               "headers": ["", "良級", "優級", "特級", "合計"],
               "rows": [["小果", 50, 180, 270, 500], ["中果", 20, 100, 80, 200],
                        ["大果", 10, 40, 50, 100], ["合計", 80, 320, 400, 800]],
               "note": "（單位：公斤）"}),
    ("notice", {"kind": "notice", "title": "夏日特展 票價資訊",
                "lines": [{"mark": "1", "text": "全票 250 元，適用一般民眾"},
                          {"mark": "2", "text": "學生票 180 元，需出示學生證"},
                          {"mark": "3", "text": "團體 20 人以上，每張再折 30 元"}],
                "footnote": "＊每人限用一種優惠"}),
    ("dialog", {"kind": "dialog", "turns": [
        {"who": "哥哥", "text": "我要買的書原價只有 720 元，沒辦法折扣。", "side": "left"},
        {"who": "妹妹", "text": "我要買的書原價也不到 1100 元，我們一起買的話，就能折扣 200 元。", "side": "right"}]}),
    ("numberline", {"kind": "numberline", "range": [-5, 5], "tick": 1,
                    "points": [{"x": -3, "label": "A"}, {"x": 1, "label": "B"}, {"x": 4, "label": "P"}]}),
    ("chart_bar", {"kind": "chart", "chart": "bar", "labels": ["小果", "中果", "大果"],
                   "data": [500, 200, 100], "title": "各類別總重量", "ylabel": "公斤"}),
    ("chart_line", {"kind": "chart", "chart": "line", "labels": ["2021", "2022", "2023", "2024"],
                    "data": [12.5, 14.2, 16.8, 18.1], "title": "高齡人口比率", "ylabel": "%"}),
    ("pattern", {"kind": "pattern", "layout": "row", "a1": 3, "d": 2, "count": 3}),
    ("triangle", {"kind": "triangle", "config": {"subtype": "right", "vertex_labels": ["A", "B", "C"],
                  "right_angle_at": "B", "side_labels": {"AB": "200 公尺", "BC": "45 公尺"}}}),
    ("circle", {"kind": "circle", "config": {"center_label": "O", "points": {"A": 30, "B": 150, "C": 270},
                "radius_lines": ["A", "B"], "central_angle": ["A", "B"],
                "inscribed_angle": {"vertex": "C", "arc": ["A", "B"]}}}),
    ("solid", {"kind": "solid", "config": {"subtype": "rectangular_prism", "show_hidden": True,
               "vertex_labels": ["A", "B", "C", "D", "E", "F", "G", "H"]}}),
    ("coord", {"kind": "coord", "config": {"x_range": [-3, 5], "y_range": [-4, 8],
               "lines": [{"slope": 2, "intercept": -1, "label": "y=2x-1"}]}}),
    ("kite", {"kind": "kite", "angle_labels": {"{x}°": "BAC", "{y}°": "BCA"}}),
    ("iso", {"kind": "iso", "cubes": [[0,0,0],[1,0,0],[1,1,0],[0,0,1],[1,1,1],[1,0,1]],
             "marks": {"甲": [0,0,1], "乙": [1,1,1], "丙": [1,0,1]}}),
    ("net_cuboid", {"kind": "net", "solid": "cuboid",
                    "labels": {"甲": "top", "乙": "front", "丙": "right"}}),
    ("net_prism", {"kind": "net", "solid": "tri_prism",
                   "labels": {"甲": "topface", "乙": "side2", "丙": "side3"}}),
]


def _demo(outdir):
    outdir = Path(outdir); outdir.mkdir(parents=True, exist_ok=True)
    ims = []
    for name, spec in DEMOS:
        try:
            p = render_png(spec, outdir / f"fig_{name}.png")
            ims.append((name, Image.open(p)))
            print(f"  ✓ {name}")
        except Exception as e:
            print(f"  ✗ {name}: {type(e).__name__}: {e}")
    # 併成一張總覽圖方便檢視
    if ims:
        pad, colw = 16, max(i.width for _, i in ims)
        W = colw * 2 + pad * 3
        rows = [(ims[i], ims[i + 1] if i + 1 < len(ims) else None) for i in range(0, len(ims), 2)]
        H = pad + sum(max(a[1].height, b[1].height if b else 0) + pad for a, b in rows)
        sheet = Image.new("RGB", (W, H), "white")
        y = pad
        for a, b in rows:
            sheet.paste(a[1], (pad, y))
            if b:
                sheet.paste(b[1], (pad * 2 + colw, y))
            y += max(a[1].height, b[1].height if b else 0) + pad
        sheet.save(outdir / "元件總覽.png")
        print(f"  → 總覽圖：{outdir / '元件總覽.png'}")


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "--demo":
        _demo(sys.argv[2])
    else:
        print(__doc__)
