#!/usr/bin/env python3
"""
geometry_renderer.py — 國中數學幾何圖形 SVG 產生器
支援：三角形、四邊形、圓、坐標平面、立體圖形、平行線、三角形三心

Usage:
  python3 geometry_renderer.py <spec.json> <output_dir/>

Spec JSON:
  {
    "figures": [
      {"id": "fig1", "type": "triangle", "config": {...}, "canvas": {...}},
      ...
    ],
    "options": {"format": "svg|png", "dpi": 150}
  }

Output:
  <output_dir>/fig1.svg  (and .png if format=png)
  <output_dir>/manifest.json
"""

import math, json, sys
from pathlib import Path


# ══════════════════════════════════════════════════════
# SVGCanvas — 低階 SVG 繪圖原語
# ══════════════════════════════════════════════════════

class SVGCanvas:
    def __init__(self, width=280, height=220, bg='white'):
        self.w = width
        self.h = height
        self.bg = bg
        self._els = []

    def _f(self, v):
        s = f"{float(v):.3f}".rstrip('0').rstrip('.')
        return s or '0'

    def _pt(self, x, y):
        return f"{self._f(x)},{self._f(y)}"

    # ── 形狀 ───────────────────────────────────────────
    def line(self, x1, y1, x2, y2, color='#222', width=1.8, dash=''):
        d = f' stroke-dasharray="{dash}"' if dash else ''
        self._els.append(
            f'<line x1="{self._f(x1)}" y1="{self._f(y1)}" x2="{self._f(x2)}" y2="{self._f(y2)}" '
            f'stroke="{color}" stroke-width="{width}" stroke-linecap="round"{d}/>'
        )

    def polygon(self, pts, fill='none', stroke='#222', width=1.8):
        s = ' '.join(self._pt(x, y) for x, y in pts)
        self._els.append(
            f'<polygon points="{s}" fill="{fill}" stroke="{stroke}" '
            f'stroke-width="{width}" stroke-linejoin="round"/>'
        )

    def polyline(self, pts, stroke='#222', width=1.8, dash='', fill='none'):
        s = ' '.join(self._pt(x, y) for x, y in pts)
        d = f' stroke-dasharray="{dash}"' if dash else ''
        self._els.append(
            f'<polyline points="{s}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"{d}/>'
        )

    def circle(self, cx, cy, r, fill='none', stroke='#222', width=1.8):
        self._els.append(
            f'<circle cx="{self._f(cx)}" cy="{self._f(cy)}" r="{self._f(r)}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
        )

    def ellipse(self, cx, cy, rx, ry, fill='none', stroke='#222', width=1.8, dash=''):
        d = f' stroke-dasharray="{dash}"' if dash else ''
        self._els.append(
            f'<ellipse cx="{self._f(cx)}" cy="{self._f(cy)}" rx="{self._f(rx)}" ry="{self._f(ry)}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{width}"{d}/>'
        )

    def arc_path(self, cx, cy, r, a1_deg, a2_deg, stroke='#222', width=1.5, fill='none'):
        """畫弧：math 角度（CCW，from +x），SVG y 軸反轉"""
        a1 = math.radians(a1_deg)
        a2 = math.radians(a2_deg)
        x1 = cx + r * math.cos(a1);  y1 = cy - r * math.sin(a1)
        x2 = cx + r * math.cos(a2);  y2 = cy - r * math.sin(a2)
        diff = (a2_deg - a1_deg) % 360
        large = 1 if diff > 180 else 0
        self._els.append(
            f'<path d="M {self._f(x1)} {self._f(y1)} '
            f'A {self._f(r)} {self._f(r)} 0 {large} 0 {self._f(x2)} {self._f(y2)}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
        )

    def sector(self, cx, cy, r, a1_deg, a2_deg, fill='#ddeeff', stroke='#222', width=1.5):
        a1 = math.radians(a1_deg);  a2 = math.radians(a2_deg)
        x1 = cx + r * math.cos(a1);  y1 = cy - r * math.sin(a1)
        x2 = cx + r * math.cos(a2);  y2 = cy - r * math.sin(a2)
        diff = (a2_deg - a1_deg) % 360
        large = 1 if diff > 180 else 0
        self._els.append(
            f'<path d="M {self._f(cx)} {self._f(cy)} L {self._f(x1)} {self._f(y1)} '
            f'A {self._f(r)} {self._f(r)} 0 {large} 0 {self._f(x2)} {self._f(y2)} Z" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
        )

    def dot(self, x, y, r=3, color='#222'):
        self._els.append(f'<circle cx="{self._f(x)}" cy="{self._f(y)}" r="{r}" fill="{color}"/>')

    def arrow(self, x1, y1, x2, y2, color='#333', width=1.5, head=8):
        angle = math.atan2(y2 - y1, x2 - x1)
        ax1 = x2 - head * math.cos(angle - math.pi / 7)
        ay1 = y2 - head * math.sin(angle - math.pi / 7)
        ax2 = x2 - head * math.cos(angle + math.pi / 7)
        ay2 = y2 - head * math.sin(angle + math.pi / 7)
        self.line(x1, y1, x2, y2, color=color, width=width)
        self._els.append(
            f'<polygon points="{self._pt(x2,y2)} {self._pt(ax1,ay1)} {self._pt(ax2,ay2)}" fill="{color}"/>'
        )

    # ── 文字 ───────────────────────────────────────────
    def text(self, x, y, s, size=13, anchor='middle', color='#222', bold=False, italic=False):
        style = []
        if bold:   style.append('font-weight:bold')
        if italic: style.append('font-style:italic')
        sa = f' style="{";".join(style)}"' if style else ''
        self._els.append(
            f'<text x="{self._f(x)}" y="{self._f(y)}" font-size="{size}" '
            f'text-anchor="{anchor}" dominant-baseline="middle" fill="{color}"{sa}>{s}</text>'
        )

    # ── 幾何輔助標記 ────────────────────────────────────
    def right_angle_mark(self, vx, vy, px, py, qx, qy, size=11):
        """在頂點 V 畫直角方塊，兩邊指向 P 和 Q"""
        def unit(dx, dy):
            d = math.hypot(dx, dy)
            return (dx/d, dy/d) if d > 1e-9 else (0, 0)
        ux, uy = unit(px - vx, py - vy)
        wx, wy = unit(qx - vx, qy - vy)
        ax, ay = vx + ux*size, vy + uy*size
        bx, by = ax + wx*size, ay + wy*size
        cx2, cy2 = vx + wx*size, vy + wy*size
        self.polyline([(ax,ay),(bx,by),(cx2,cy2)], stroke='#222', width=1.3)

    def angle_arc(self, vx, vy, px, py, qx, qy, r=18, n=1, color='#444', width=1.3):
        """在頂點 V 的兩邊 VP、VQ 之間畫角弧（n 條）"""
        a1 = math.degrees(math.atan2(-(py-vy), px-vx))
        a2 = math.degrees(math.atan2(-(qy-vy), qx-vx))
        if (a2 - a1) % 360 > 180:
            a1, a2 = a2, a1
        for i in range(n):
            self.arc_path(vx, vy, r + i*5, a1, a2, stroke=color, width=width)

    def tick_mark(self, x1, y1, x2, y2, n=1, size=6, color='#333', width=1.5):
        """在線段中點畫 n 條刻度（等邊標記）"""
        mx, my = (x1+x2)/2, (y1+y2)/2
        angle = math.atan2(y2-y1, x2-x1)
        perp = angle + math.pi/2
        for i in range(n):
            offset = (i - (n-1)/2) * 4
            cx = mx + offset * math.cos(angle)
            cy = my + offset * math.sin(angle)
            self.line(cx + size*math.cos(perp), cy + size*math.sin(perp),
                      cx - size*math.cos(perp), cy - size*math.sin(perp),
                      color=color, width=width)

    def render(self):
        bg_el = f'\n  <rect width="{self.w}" height="{self.h}" fill="{self.bg}"/>' if self.bg else ''
        body = '\n  '.join(self._els)
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'width="{self.w}" height="{self.h}" '
            f'viewBox="0 0 {self.w} {self.h}" '
            f'font-family="serif">'
            f'{bg_el}\n  {body}\n</svg>'
        )


# ══════════════════════════════════════════════════════
# 幾何輔助函式
# ══════════════════════════════════════════════════════

def label_pos(vx, vy, cx, cy, dist=20):
    """從形心往頂點方向延伸 dist，回傳標籤位置"""
    dx, dy = vx - cx, vy - cy
    d = math.hypot(dx, dy)
    if d < 1e-9:
        return vx, vy - dist
    return vx + (dx/d)*dist, vy + (dy/d)*dist

def side_label_pos(p1, p2, offset=16):
    """邊中點垂直偏移 offset，回傳 (lx, ly)"""
    mx, my = (p1[0]+p2[0])/2, (p1[1]+p2[1])/2
    dx, dy = p2[0]-p1[0], p2[1]-p1[1]
    d = math.hypot(dx, dy)
    if d < 1e-9:
        return mx, my - offset
    nx, ny = -dy/d, dx/d
    return mx + nx*offset, my + ny*offset

def fit_pts(pts, W, H, padding=35):
    """將正規化座標點縮放置入畫布，回傳 (scaled_pts, scale)"""
    xs = [p[0] for p in pts];  ys = [p[1] for p in pts]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    rx = max_x - min_x or 1;   ry = max_y - min_y or 1
    aw = W - 2*padding;  ah = H - 2*padding
    scale = min(aw/rx, ah/ry)
    ox = padding + (aw - rx*scale)/2 - min_x*scale
    oy = padding + (ah - ry*scale)/2 - min_y*scale
    return [(p[0]*scale + ox, p[1]*scale + oy) for p in pts], scale


# ══════════════════════════════════════════════════════
# 圖形渲染函式
# ══════════════════════════════════════════════════════

def render_triangle(c, cfg):
    """
    三角形
    subtype: general | right | isosceles | equilateral
    config:
      vertex_labels: ['A','B','C']
      right_angle_at: 'C'
      angle_arcs: {'A':1, 'B':2}   (頂點: 弧數)
      side_labels: {'AB':'5', 'BC':'3', 'CA':'4'}
      equal_marks: {'AB':1, 'BC':1, 'CA':2}
      altitude_from: 'A'
      median_from: 'A'
      dashed_sides: ['AB']
      show_dots: True
    """
    W, H = c.w, c.h
    labels = cfg.get('vertex_labels', ['A', 'B', 'C'])
    sub = cfg.get('subtype', 'general')

    # 頂點正規化座標（SVG 座標，y 向下）
    if 'vertices' in cfg and cfg['vertices']:
        raw = cfg['vertices']
        pts_norm = [raw.get(la, [0, 0]) for la in labels]
    elif sub == 'right':
        # C 在左下角，CA 水平、CB 垂直 → 幾何真正 90°，右角在 C
        pts_norm = [[1, 1], [0, 0], [0, 1]]
    elif sub == 'isosceles':
        pts_norm = [[0, 1], [1, 1], [0.5, 0.05]]
    elif sub == 'equilateral':
        h = math.sqrt(3)/2
        pts_norm = [[0, 1], [1, 1], [0.5, 1 - h]]
    else:  # general
        pts_norm = [[0.05, 0.95], [1, 1], [0.72, 0.05]]

    pts, _ = fit_pts(pts_norm, W, H, padding=38)
    verts = {labels[i]: pts[i] for i in range(len(labels))}
    cx = sum(p[0] for p in pts)/3
    cy = sum(p[1] for p in pts)/3

    dashed_sides = cfg.get('dashed_sides', [])
    n = len(labels)

    # ─ 畫邊 ─
    for i in range(n):
        a, b = labels[i], labels[(i+1) % n]
        key1, key2 = a+b, b+a
        is_dash = key1 in dashed_sides or key2 in dashed_sides
        p1, p2 = verts[a], verts[b]
        c.line(p1[0], p1[1], p2[0], p2[1], dash='5,4' if is_dash else '')

    # ─ 直角標記 ─
    ra = cfg.get('right_angle_at')
    if ra and ra in verts:
        others = [l for l in labels if l != ra]
        v = verts[ra]
        c.right_angle_mark(v[0], v[1], verts[others[0]][0], verts[others[0]][1],
                           verts[others[1]][0], verts[others[1]][1])

    # ─ 角弧 ─
    arc_cfg = cfg.get('angle_arcs', {})
    if isinstance(arc_cfg, list):
        arc_cfg = {la: 1 for la in arc_cfg}
    for la, n_arcs in arc_cfg.items():
        if la in verts:
            others = [l for l in labels if l != la]
            v = verts[la]
            c.angle_arc(v[0], v[1], verts[others[0]][0], verts[others[0]][1],
                        verts[others[1]][0], verts[others[1]][1], r=16, n=int(n_arcs))

    # ─ 高 ─
    af = cfg.get('altitude_from')
    if af and af in verts:
        v = verts[af]
        others = [l for l in labels if l != af]
        p1, p2 = verts[others[0]], verts[others[1]]
        dx, dy = p2[0]-p1[0], p2[1]-p1[1]
        t = ((v[0]-p1[0])*dx + (v[1]-p1[1])*dy) / (dx*dx+dy*dy)
        fx, fy = p1[0]+t*dx, p1[1]+t*dy
        c.line(v[0], v[1], fx, fy, color='#666', width=1.2, dash='4,3')
        c.right_angle_mark(fx, fy, v[0], v[1], p2[0], p2[1], size=9)

    # ─ 中線 ─
    mf = cfg.get('median_from')
    if mf and mf in verts:
        v = verts[mf]
        others = [l for l in labels if l != mf]
        p1, p2 = verts[others[0]], verts[others[1]]
        mx, my = (p1[0]+p2[0])/2, (p1[1]+p2[1])/2
        c.line(v[0], v[1], mx, my, color='#558', width=1.2, dash='4,3')
        c.dot(mx, my, r=2.5, color='#558')

    # ─ 等邊刻度 ─
    for sk, ntick in cfg.get('equal_marks', {}).items():
        a, b = sk[0], sk[-1]
        if a in verts and b in verts:
            p1, p2 = verts[a], verts[b]
            c.tick_mark(p1[0], p1[1], p2[0], p2[1], n=int(ntick))

    # ─ 邊長標籤 ─
    for sk, slabel in cfg.get('side_labels', {}).items():
        a, b = sk[0], sk[-1]
        if a in verts and b in verts:
            p1, p2 = verts[a], verts[b]
            lx, ly = side_label_pos(p1, p2, offset=15)
            c.text(lx, ly, slabel, size=12, italic=True)

    # ─ 頂點標籤 ─
    if cfg.get('show_dots', True):
        for la, (vx, vy) in verts.items():
            c.dot(vx, vy, r=2.5)
    for la, (vx, vy) in verts.items():
        lx, ly = label_pos(vx, vy, cx, cy, dist=20)
        c.text(lx, ly, la, size=13, italic=True)


# ─────────────────────────────────────────────────────

def render_quadrilateral(c, cfg):
    """
    四邊形
    subtype: parallelogram | rectangle | rhombus | square | trapezoid | right_trapezoid | general
    config:
      vertex_labels: ['A','B','C','D']
      side_labels: {'AB':'5', 'BC':'3', ...}
      equal_marks: {'AB':1, 'CD':1, 'BC':2, 'AD':2}
      right_angles: ['A','B']  (auto for rectangle/square)
      diagonals: True
      show_dots: True
    """
    W, H = c.w, c.h
    sub = cfg.get('subtype', 'parallelogram')
    labels = cfg.get('vertex_labels', ['A', 'B', 'C', 'D'])

    if sub in ('rectangle', 'square'):
        asp = 1.0 if sub == 'square' else 1.7
        pts_norm = [[0,1],[asp,1],[asp,0],[0,0]]
    elif sub == 'rhombus':
        pts_norm = [[0.5,0],[1,0.5],[0.5,1],[0,0.5]]
    elif sub == 'trapezoid':
        pts_norm = [[0.15,1],[0.85,1],[0.72,0],[0.28,0]]
    elif sub == 'right_trapezoid':
        pts_norm = [[0,1],[1,1],[1,0.28],[0,0]]
    elif sub == 'general':
        pts_norm = [[0.1,0.9],[0.9,1],[0.8,0.1],[0.05,0.05]]
    else:  # parallelogram
        pts_norm = [[0.15,1],[1,1],[0.85,0],[0,0]]

    pts, _ = fit_pts(pts_norm, W, H, padding=38)
    verts = {labels[i]: pts[i] for i in range(min(len(labels),len(pts)))}
    n = len(pts)
    cx = sum(p[0] for p in pts)/n
    cy = sum(p[1] for p in pts)/n

    # ─ 畫邊 ─
    c.polygon(pts)

    # ─ 對角線 ─
    if cfg.get('diagonals') and n == 4:
        c.line(pts[0][0],pts[0][1],pts[2][0],pts[2][1], color='#888', width=1.2, dash='4,3')
        c.line(pts[1][0],pts[1][1],pts[3][0],pts[3][1], color='#888', width=1.2, dash='4,3')
        # 對角線標籤
        for sk, slabel in cfg.get('diagonal_labels', {}).items():
            a, b = sk[0], sk[-1]
            if a in verts and b in verts:
                p1, p2 = verts[a], verts[b]
                lx, ly = side_label_pos(p1, p2, offset=12)
                c.text(lx, ly, slabel, size=11, italic=True, color='#666')

    # ─ 直角標記 ─
    ra_list = cfg.get('right_angles', [])
    if sub in ('rectangle', 'square') and not ra_list:
        ra_list = labels[:4]
    if sub == 'right_trapezoid' and not ra_list:
        ra_list = [labels[0], labels[1]]
    for la in ra_list:
        if la in verts:
            idx = labels.index(la)
            v = verts[la]
            prev_l = labels[(idx-1) % n]
            next_l = labels[(idx+1) % n]
            c.right_angle_mark(v[0],v[1],verts[prev_l][0],verts[prev_l][1],
                               verts[next_l][0],verts[next_l][1], size=10)

    # ─ 等邊刻度 ─
    for sk, ntick in cfg.get('equal_marks', {}).items():
        a, b = sk[0], sk[-1]
        if a in verts and b in verts:
            p1, p2 = verts[a], verts[b]
            c.tick_mark(p1[0],p1[1],p2[0],p2[1], n=int(ntick))

    # ─ 邊長標籤 ─
    for sk, slabel in cfg.get('side_labels', {}).items():
        a, b = sk[0], sk[-1]
        if a in verts and b in verts:
            p1, p2 = verts[a], verts[b]
            lx, ly = side_label_pos(p1, p2, offset=15)
            c.text(lx, ly, slabel, size=12, italic=True)

    # ─ 頂點 ─
    if cfg.get('show_dots', True):
        for la, (vx, vy) in verts.items():
            c.dot(vx, vy, r=2.5)
    for la, (vx, vy) in verts.items():
        lx, ly = label_pos(vx, vy, cx, cy, dist=20)
        c.text(lx, ly, la, size=13, italic=True)


# ─────────────────────────────────────────────────────

def render_circle(c, cfg):
    """
    圓形
    config:
      center_label: 'O'
      radius_label: 'r'
      points: {'A':60, 'B':160, 'C':280}   (標籤: 角度，math CCW from +x)
      radius_lines: ['A','B']   畫半徑 OA、OB
      chords: [['A','B'],['B','C']]
      diameter: ['A','B']
      tangent_at: 'A'
      central_angle: ['A','B']   扇形填色 + 圓心角弧
      inscribed_angle: {'vertex':'C', 'arc':['A','B']}
      show_center: True
      arc_labels: {'A_to_B': '⌢AB'}
    """
    W, H = c.w, c.h
    cx, cy = W/2, H/2
    r = min(W, H)/2 - 32

    # 圓周上的點
    pts = {}
    for label, angle in cfg.get('points', {}).items():
        a = math.radians(angle)
        pts[label] = (cx + r*math.cos(a), cy - r*math.sin(a))

    center_label = cfg.get('center_label', 'O')

    # ─ 扇形（圓心角）─
    ca = cfg.get('central_angle')
    if ca and len(ca) == 2 and all(p in cfg.get('points',{}) for p in ca):
        a1 = cfg['points'][ca[0]]
        a2 = cfg['points'][ca[1]]
        c.sector(cx, cy, r, a1, a2, fill='#ddeeff')

    # ─ 圓 ─
    c.circle(cx, cy, r)

    # ─ 圓心 ─
    if cfg.get('show_center', True):
        c.dot(cx, cy, r=3)
        c.text(cx - 14, cy + 5, center_label, size=12, italic=True)

    # ─ 半徑線 ─
    for rl in cfg.get('radius_lines', []):
        if rl in pts:
            c.line(cx, cy, pts[rl][0], pts[rl][1], width=1.5)
    # 半徑標籤
    rl_at = cfg.get('radius_label_at')
    if rl_at and rl_at in pts:
        mid_x = (cx + pts[rl_at][0])/2
        mid_y = (cy + pts[rl_at][1])/2
        c.text(mid_x + 8, mid_y - 8, cfg.get('radius_label', 'r'), size=11, italic=True)

    # ─ 弦 ─
    for chord in cfg.get('chords', []):
        if len(chord) == 2 and all(p in pts for p in chord):
            p1, p2 = pts[chord[0]], pts[chord[1]]
            c.line(p1[0], p1[1], p2[0], p2[1], width=1.5)

    # ─ 直徑 ─
    diam = cfg.get('diameter')
    if diam and len(diam) == 2 and all(p in pts for p in diam):
        p1, p2 = pts[diam[0]], pts[diam[1]]
        c.line(p1[0], p1[1], p2[0], p2[1], width=1.5)

    # ─ 切線 ─
    tan_at = cfg.get('tangent_at')
    if tan_at and tan_at in cfg.get('points', {}):
        angle = math.radians(cfg['points'][tan_at])
        px, py = pts[tan_at]
        # 切線方向 = 半徑方向旋轉 90°
        tx, ty = math.sin(angle), math.cos(angle)
        tlen = 50
        c.line(px - tx*tlen, py - ty*tlen, px + tx*tlen, py + ty*tlen,
               color='#444', width=1.5)

    # ─ 圓周角 ─
    ia = cfg.get('inscribed_angle')
    if ia:
        v_label = ia.get('vertex')
        arc_pts = ia.get('arc', [])
        if v_label in pts:
            vp = pts[v_label]
            for ap in arc_pts:
                if ap in pts:
                    c.line(vp[0], vp[1], pts[ap][0], pts[ap][1], width=1.5)

    # ─ 點與標籤 ─
    for label, (px, py) in pts.items():
        c.dot(px, py, r=3)
        dx, dy = px - cx, py - cy
        d = math.hypot(dx, dy)
        lx = px + (dx/d)*15 if d > 1e-9 else px
        ly = py + (dy/d)*15 if d > 1e-9 else py - 15
        c.text(lx, ly, label, size=12, italic=True)


# ─────────────────────────────────────────────────────

def render_coordinate_plane(c, cfg):
    """
    坐標平面
    config:
      x_range: [-5, 5]
      y_range: [-4, 4]
      show_grid: False
      tick_interval: 1
      points: [{'x':1,'y':2,'label':'A','color':'#cc0000'}]
      lines: [{'slope':2,'intercept':-1,'color':'#3366cc','label':'y=2x-1'}]
      parabolas: [{'a':1,'b':0,'c':-2,'color':'#cc3300','label':'y=x²-2'}]
      segments: [{'x1':0,'y1':0,'x2':3,'y2':4,'label':''}]
      x_label: 'x'   y_label: 'y'
    """
    W, H = c.w, c.h
    xr = cfg.get('x_range', [-5, 5])
    yr = cfg.get('y_range', [-4, 4])
    pl, pr, pt_, pb = 38, 18, 18, 28

    def to_px(x, y):
        sx = (x - xr[0]) / (xr[1]-xr[0]) * (W-pl-pr) + pl
        sy = (1 - (y - yr[0]) / (yr[1]-yr[0])) * (H-pt_-pb) + pt_
        return sx, sy

    ox, oy = to_px(0, 0)

    # ─ 格線 ─
    if cfg.get('show_grid', False):
        ti = cfg.get('tick_interval', 1)
        for xi in range(int(xr[0]), int(xr[1])+1):
            if xi % ti == 0:
                px, _ = to_px(xi, yr[0]); _, py2 = to_px(xi, yr[1])
                c.line(px, H-pb, px, pt_, color='#ddd', width=0.8)
        for yi in range(int(yr[0]), int(yr[1])+1):
            if yi % ti == 0:
                _, py = to_px(xr[0], yi)
                c.line(pl, py, W-pr, py, color='#ddd', width=0.8)

    # ─ 座標軸 ─
    c.arrow(pl, oy, W-pr+6, oy, color='#333', width=1.5)
    c.arrow(ox, H-pb, ox, pt_-6, color='#333', width=1.5)
    c.text(W-pr+14, oy, cfg.get('x_label','x'), size=12, italic=True)
    c.text(ox, pt_-16, cfg.get('y_label','y'), size=12, italic=True)

    # ─ 刻度 ─
    ti = cfg.get('tick_interval', 1)
    for xi in range(int(xr[0]), int(xr[1])+1):
        if xi == 0 or xi % ti != 0: continue
        px, _ = to_px(xi, 0)
        c.line(px, oy-4, px, oy+4, color='#333', width=1.2)
        c.text(px, oy+13, str(xi), size=9, color='#555')
    for yi in range(int(yr[0]), int(yr[1])+1):
        if yi == 0 or yi % ti != 0: continue
        _, py = to_px(0, yi)
        c.line(ox-4, py, ox+4, py, color='#333', width=1.2)
        c.text(ox-10, py, str(yi), size=9, color='#555', anchor='end')
    c.text(ox-9, oy+13, 'O', size=10, color='#555')

    # ─ 直線 ─
    for lc in cfg.get('lines', []):
        slope = lc.get('slope', 0); intercept = lc.get('intercept', 0)
        color = lc.get('color', '#3366cc')
        x1, x2 = xr
        y1 = slope*x1 + intercept; y2 = slope*x2 + intercept
        p1, p2 = to_px(x1, y1), to_px(x2, y2)
        c.line(p1[0], p1[1], p2[0], p2[1], color=color, width=1.8)
        if lc.get('label'):
            lx, ly = to_px(x2*0.75, slope*x2*0.75 + intercept)
            c.text(lx+16, ly-10, lc['label'], size=10, color=color, anchor='start')

    # ─ 拋物線 ─
    for par in cfg.get('parabolas', []):
        a = par.get('a',1); b = par.get('b',0); cc = par.get('c',0)
        color = par.get('color', '#cc3300')
        step = (xr[1]-xr[0])/80
        par_pts = [to_px(xr[0]+i*step, a*(xr[0]+i*step)**2 + b*(xr[0]+i*step) + cc) for i in range(81)]
        vis = [p for p in par_pts if -5 <= p[0] <= W+5 and -5 <= p[1] <= H+5]
        if len(vis) >= 2:
            c.polyline(par_pts, stroke=color, width=1.8)
        if par.get('label'):
            # 頂點處標籤
            vx_coord = -b/(2*a)
            vy_coord = a*vx_coord**2 + b*vx_coord + cc
            lx, ly = to_px(vx_coord, vy_coord)
            c.text(lx+18, ly, par['label'], size=10, color=color, anchor='start')

    # ─ 線段 ─
    for seg in cfg.get('segments', []):
        p1 = to_px(seg['x1'], seg['y1']); p2 = to_px(seg['x2'], seg['y2'])
        c.line(p1[0], p1[1], p2[0], p2[1], color=seg.get('color','#555'), width=1.8)

    # ─ 點 ─
    for pt in cfg.get('points', []):
        px, py = to_px(pt['x'], pt['y'])
        color = pt.get('color', '#222')
        c.dot(px, py, r=4, color=color)
        if pt.get('label'):
            c.text(px+11, py-9, pt['label'], size=11, color=color, anchor='start')


# ─────────────────────────────────────────────────────

def render_solid_3d(c, cfg):
    """立體圖形，subtype 選擇子函式"""
    sub = cfg.get('subtype', 'rectangular_prism')
    fns = {
        'rectangular_prism': _prism_rect,
        'cylinder': _cylinder,
        'cone': _cone,
        'triangular_prism': _prism_tri,
        'square_pyramid': _pyramid_sq,
        'triangular_pyramid': _pyramid_tri,
    }
    fn = fns.get(sub)
    if fn:
        fn(c, cfg)


def _prism_rect(c, cfg):
    """
    四角柱（長方體）— 斜二測畫法（45°方向）
    從「前右上」方向觀察，三個可見面：前面、上面、右面。

    頂點命名（課本慣例）：
      上面 ABCD：A=左前上, B=右前上, C=右後上, D=左後上
      下面 EFGH：E=左前下, F=右前下, G=右後下, H=左後下

    實線（可見稜線，共9條）：
      前面 ABFE：AE, AB, BF, EF
      上面 ABCD：BC, CD, DA  （AB 已畫）
      右面 BCGF：CG, GF       （BC, BF 已畫）

    虛線（被遮住的稜線，共3條，皆連接 H）：
      DH（左後垂直）、HG（後底橫向）、HE（左底橫向）
    """
    W, H = c.w, c.h
    fw = 90          # 前面寬
    fh = 95          # 前面高
    ddx = 32         # 斜深水平分量（→右）
    ddy = -18        # 斜深垂直分量（↑，SVG y 向下故取負）

    # 前面四頂點（以畫布置中）
    fx0 = W/2 - fw/2 - ddx/2
    fy0 = H/2 - fh/2 + abs(ddy)/2

    A  = (fx0,       fy0)         # 左前上
    B  = (fx0 + fw,  fy0)         # 右前上
    E  = (fx0,       fy0 + fh)    # 左前下
    F  = (fx0 + fw,  fy0 + fh)    # 右前下

    # 後面四頂點（沿斜向偏移）
    D  = (A[0]+ddx, A[1]+ddy)    # 左後上
    C  = (B[0]+ddx, B[1]+ddy)    # 右後上
    H_ = (E[0]+ddx, E[1]+ddy)    # 左後下
    G  = (F[0]+ddx, F[1]+ddy)    # 右後下

    # ─ 虛線：DH, HG, HE（H 完全被遮住）─
    for p1, p2 in [(D, H_), (H_, G), (H_, E)]:
        c.line(p1[0],p1[1],p2[0],p2[1], color='#aaa', width=1.2, dash='4,3')

    # ─ 實線：前面 ABFE ─
    c.polygon([A, B, F, E])

    # ─ 實線：上面額外稜線 BC, CD, DA ─
    c.line(B[0],B[1],C[0],C[1])
    c.line(C[0],C[1],D[0],D[1])
    c.line(D[0],D[1],A[0],A[1])

    # ─ 實線：右面額外稜線 CG, GF ─
    c.line(C[0],C[1],G[0],G[1])
    c.line(G[0],G[1],F[0],F[1])

    # ─ 頂點標籤 ─
    labels  = cfg.get('vertex_labels', ['A','B','C','D','E','F','G','H'])
    pos_map = [A,    B,    C,    D,    E,    F,    G,    H_]
    offs    = [(-14,-12),(12,-12),(13,-11),(-14,-11),
               (-14, 13),(12, 13),(13, 11),(-14, 11)]
    for lab, pos, off in zip(labels, pos_map, offs):
        c.text(pos[0]+off[0], pos[1]+off[1], lab, size=11, italic=True)

    # ─ 邊長標籤 ─
    for sk, sl in cfg.get('side_labels', {}).items():
        if len(sk) < 2: continue
        vmap = dict(zip('ABCDEFGH', [A,B,C,D,E,F,G,H_]))
        a_l, b_l = sk[0], sk[-1]
        if a_l in vmap and b_l in vmap:
            lx, ly = side_label_pos(vmap[a_l], vmap[b_l], offset=14)
            c.text(lx, ly, sl, size=11, italic=True)

def _cylinder(c, cfg):
    W, H = c.w, c.h
    cx = W/2;  cy_top = 52;  rx, ry = 60, 18;  ht = 120
    cy_bot = cy_top + ht
    c.ellipse(cx, cy_top, rx, ry)
    c.ellipse(cx, cy_bot, rx, ry, fill='#f0f0f0')
    c.line(cx-rx, cy_top, cx-rx, cy_bot)
    c.line(cx+rx, cy_top, cx+rx, cy_bot)
    lab = cfg.get('labels', {})
    if lab.get('top'):    c.text(cx, cy_top-ry-10, lab['top'], size=11, italic=True)
    if lab.get('bottom'): c.text(cx, cy_bot+ry+10, lab['bottom'], size=11, italic=True)
    if lab.get('radius'):
        c.line(cx, cy_top, cx+rx, cy_top, color='#666', width=1.2, dash='3,2')
        c.text((cx+cx+rx)/2, cy_top-12, lab['radius'], size=11, italic=True)
    if lab.get('height'):
        hx = cx + rx + 20
        c.line(hx, cy_top, hx, cy_bot, color='#666', width=1.2)
        c.line(hx-5, cy_top, hx+5, cy_top, color='#666', width=1.2)
        c.line(hx-5, cy_bot, hx+5, cy_bot, color='#666', width=1.2)
        c.text(hx+14, (cy_top+cy_bot)/2, lab['height'], size=11, italic=True)

def _cone(c, cfg):
    W, H = c.w, c.h
    cx = W/2;  cy_apex = 45;  rx, ry = 60, 18;  cy_bot = cy_apex + 135
    c.ellipse(cx, cy_bot, rx, ry, fill='#f0f0f0')
    c.line(cx-rx, cy_bot, cx, cy_apex)
    c.line(cx+rx, cy_bot, cx, cy_apex)
    # 隱藏半弧
    c.arc_path(cx, cy_bot, rx, 0, 180, stroke='#bbb', width=1)
    lab = cfg.get('labels', {})
    if lab.get('apex'):      c.text(cx, cy_apex-13, lab['apex'], size=11, italic=True)
    if lab.get('base'):      c.text(cx+rx+8, cy_bot+ry+6, lab['base'], size=11, italic=True)
    if lab.get('radius'):
        c.line(cx, cy_bot, cx+rx, cy_bot, color='#666', width=1.2, dash='3,2')
        c.text((cx+cx+rx)/2, cy_bot+12, lab['radius'], size=11, italic=True)
    if lab.get('slant'):
        lx = (cx + cx+rx)/2 + 10;  ly = (cy_apex + cy_bot)/2
        c.text(lx, ly, lab['slant'], size=11, italic=True)
    if lab.get('height'):
        c.line(cx, cy_apex, cx, cy_bot, color='#666', width=1.2, dash='3,2')
        c.text(cx-16, (cy_apex+cy_bot)/2, lab['height'], size=11, italic=True)

def _prism_tri(c, cfg):
    W, H = c.w, c.h
    d = 65  # 深度偏移
    A = (W/2-22, 55);  B = (W/2-68, H-48);  C = (W/2+22, H-48)
    D = (A[0]+d, A[1]+22);  E = (B[0]+d, B[1]);  F = (C[0]+d, C[1])
    if cfg.get('show_hidden', True):
        c.polygon([A,B,C], stroke='#bbb', width=1.2)
    for p1,p2 in [(A,D),(B,E),(C,F)]:
        c.line(p1[0],p1[1],p2[0],p2[1], color='#aaa' if cfg.get('show_hidden',True) else '#222',
               width=1.2, dash='4,3' if cfg.get('show_hidden',True) else '')
    c.polygon([D,E,F])
    c.line(A[0],A[1],D[0],D[1]); c.line(B[0],B[1],E[0],E[1]); c.line(C[0],C[1],F[0],F[1])
    labels = cfg.get('vertex_labels', ['A','B','C','D','E','F'])
    pos_list = [A,B,C,D,E,F]
    offs = [(-13,-10),(-13,10),(10,10),(10,-10),(10,10),(-4,10)]
    for lab, pos, off in zip(labels, pos_list, offs):
        c.text(pos[0]+off[0], pos[1]+off[1], lab, size=11, italic=True)

def _pyramid_sq(c, cfg):
    W, H = c.w, c.h
    cx = W/2;  bw = 95;  bd = 32;  cy_ap = 45;  by_c = H-50
    A=(cx-bw/2, by_c); B=(cx+bw/2, by_c)
    C=(cx+bw/2+bd, by_c-bd); D=(cx-bw/2+bd, by_c-bd)
    apex=(cx+bd/2, cy_ap)
    c.polygon([A,B,C,D])
    c.line(B[0],B[1],apex[0],apex[1]); c.line(C[0],C[1],apex[0],apex[1])
    if cfg.get('show_hidden', True):
        for p in [A,D]:
            c.line(p[0],p[1],apex[0],apex[1], color='#aaa', width=1.2, dash='4,3')
    else:
        c.line(A[0],A[1],apex[0],apex[1]); c.line(D[0],D[1],apex[0],apex[1])
    labels = cfg.get('vertex_labels', ['A','B','C','D','P'])
    pos_list=[A,B,C,D,apex]
    offs=[(-13,10),(10,10),(10,10),(-13,10),(0,-12)]
    for lab,pos,off in zip(labels,pos_list,offs):
        c.text(pos[0]+off[0],pos[1]+off[1],lab,size=11,italic=True)

def _pyramid_tri(c, cfg):
    W, H = c.w, c.h
    cx = W/2
    A=(cx-52,H-45); B=(cx+52,H-45); C=(cx+14,H-88); apex=(cx-8,50)
    c.polygon([A,B,apex]); c.polygon([B,C,apex])
    if cfg.get('show_hidden', True):
        c.line(A[0],A[1],C[0],C[1], color='#aaa', width=1.2, dash='4,3')
        c.line(C[0],C[1],apex[0],apex[1], color='#aaa', width=1.2, dash='4,3')
    c.line(A[0],A[1],apex[0],apex[1]); c.line(B[0],B[1],apex[0],apex[1])
    c.line(A[0],A[1],B[0],B[1])
    labels = cfg.get('vertex_labels', ['A','B','C','D'])
    pos_list=[A,B,C,apex]
    offs=[(-13,10),(10,10),(10,0),(0,-12)]
    for lab,pos,off in zip(labels,pos_list,offs):
        c.text(pos[0]+off[0],pos[1]+off[1],lab,size=11,italic=True)


# ─────────────────────────────────────────────────────

def render_parallel_lines(c, cfg):
    """
    平行線
    config:
      n_parallel: 2
      line_labels: ['l','m']
      transversal_angle: 55   (與水平線的夾角，度)
      transversal_labels: ['t']
      angle_marks: [
        {'line':0,'position':'upper_left','label':'α','n_arcs':1},
        {'line':1,'position':'lower_right','label':'α','n_arcs':1}
      ]
      equal_angle_groups: [['α','β']]   (同樣標籤 → 暗示相等)
    """
    W, H = c.w, c.h
    n = cfg.get('n_parallel', 2)
    pad = 30
    line_ys = [H*(i+1)/(n+1) for i in range(n)]
    angle_deg = cfg.get('transversal_angle', 55)
    tan_a = math.tan(math.radians(angle_deg))

    # ─ 平行線 ─
    for i, ly in enumerate(line_ys):
        c.line(pad, ly, W-pad, ly)
        ll = cfg.get('line_labels', [])
        if i < len(ll):
            c.text(W-pad+14, ly, ll[i], size=12, italic=True, anchor='start')

    # ─ 截線 ─
    tx_center = W/2
    intersections = []
    for ly in line_ys:
        ix = tx_center - (ly - H/2) / tan_a if tan_a != 0 else tx_center
        intersections.append((ix, ly))

    # 延長截線到畫布邊緣
    if tan_a != 0:
        x_top = tx_center - (pad - H/2) / tan_a
        x_bot = tx_center - (H-pad - H/2) / tan_a
    else:
        x_top = x_bot = tx_center
    c.line(x_top, pad, x_bot, H-pad, color='#555', width=1.8)

    tl = cfg.get('transversal_labels', [])
    if tl:
        c.text(x_top - 12, pad - 6, tl[0], size=12, italic=True)

    # ─ 角度標記 ─
    for am in cfg.get('angle_marks', []):
        line_i = am.get('line', 0)
        if line_i >= len(intersections): continue
        ix, iy = intersections[line_i]
        label = am.get('label', '')
        pos = am.get('position', 'upper_left')
        pos_offsets = {
            'upper_left':  (-22, -14),
            'upper_right': ( 18, -14),
            'lower_left':  (-22,  16),
            'lower_right': ( 18,  16),
        }
        ox, oy_ = pos_offsets.get(pos, (0, 0))
        if label:
            c.text(ix+ox, iy+oy_, label, size=11, italic=True, color='#333')


# ─────────────────────────────────────────────────────

def render_triangle_center(c, cfg):
    """
    三角形的心
    config:
      center_type: 'centroid'|'circumcenter'|'incenter'
      triangle: {subtype, vertex_labels, ...}  (同 render_triangle 的 config)
      center_label: 'G'|'O'|'I'
    """
    W, H = c.w, c.h
    tri_cfg = cfg.get('triangle', {'subtype': 'general'})
    render_triangle(c, tri_cfg)

    # 重新計算頂點位置（與 render_triangle 一致）
    sub = tri_cfg.get('subtype', 'general')
    if sub == 'right':       pts_norm = [[1,1],[0,0],[0,1]]
    elif sub == 'isosceles': pts_norm = [[0,1],[1,1],[0.5,0.05]]
    elif sub == 'equilateral':
        h = math.sqrt(3)/2
        pts_norm = [[0,1],[1,1],[0.5,1-h]]
    else:
        pts_norm = [[0.05,0.95],[1,1],[0.72,0.05]]
    pts, _ = fit_pts(pts_norm, W, H, padding=38)
    A, B, Cv = pts[0], pts[1], pts[2]

    ctype = cfg.get('center_type', 'centroid')
    c_label = cfg.get('center_label', {'centroid':'G','circumcenter':'O','incenter':'I'}.get(ctype,'P'))

    if ctype == 'centroid':
        ma = ((B[0]+Cv[0])/2, (B[1]+Cv[1])/2)
        mb = ((A[0]+Cv[0])/2, (A[1]+Cv[1])/2)
        mc = ((A[0]+B[0])/2,  (A[1]+B[1])/2)
        gx = (A[0]+B[0]+Cv[0])/3;  gy = (A[1]+B[1]+Cv[1])/3
        for v, m in [(A,ma),(B,mb),(Cv,mc)]:
            c.line(v[0],v[1],m[0],m[1], color='#5566aa', width=1.3, dash='4,3')
            c.dot(m[0],m[1], r=2.5, color='#5566aa')
        c.dot(gx, gy, r=5, color='#dd4400')
        c.text(gx+13, gy-9, c_label, size=12, bold=True, color='#dd4400')

    elif ctype == 'circumcenter':
        ax,ay = A; bx,by = B; ccx,ccy = Cv
        D = 2*(ax*(by-ccy)+bx*(ccy-ay)+ccx*(ay-by))
        if abs(D) > 1e-6:
            ux = ((ax**2+ay**2)*(by-ccy)+(bx**2+by**2)*(ccy-ay)+(ccx**2+ccy**2)*(ay-by))/D
            uy = ((ax**2+ay**2)*(ccx-bx)+(bx**2+by**2)*(ax-ccx)+(ccx**2+ccy**2)*(bx-ax))/D
            R = math.hypot(ax-ux, ay-uy)
            c.circle(ux, uy, R, stroke='#5566aa', width=1.3)
            c.dot(ux, uy, r=4, color='#dd4400')
            c.text(ux+12, uy-10, c_label, size=12, bold=True, color='#dd4400')

    elif ctype == 'incenter':
        ax,ay = A; bx,by = B; ccx,ccy = Cv
        a = math.hypot(bx-ccx, by-ccy)
        b = math.hypot(ax-ccx, ay-ccy)
        cv = math.hypot(ax-bx, ay-by)
        s = a+b+cv
        ix = (a*ax+b*bx+cv*ccx)/s;  iy = (a*ay+b*by+cv*ccy)/s
        area = abs((bx-ax)*(ccy-ay)-(ccx-ax)*(by-ay))/2
        inr = area/(s/2) if s > 0 else 0
        c.circle(ix, iy, inr, stroke='#5566aa', width=1.3)
        c.dot(ix, iy, r=4, color='#dd4400')
        c.text(ix+12, iy-10, c_label, size=12, bold=True, color='#dd4400')


# ─────────────────────────────────────────────────────

def render_similar_triangles(c, cfg):
    """
    相似三角形（並排顯示）
    config:
      triangle1: {vertex_labels:['A','B','C'], side_labels:{...}, angle_arcs:{...}}
      triangle2: {vertex_labels:['D','E','F'], side_labels:{...}, angle_arcs:{...}}
      ratio_label: 'k'   (在兩三角形之間顯示比例)
    """
    W, H = c.w, c.h

    # 左半畫布給 tri1，右半給 tri2
    class HalfCanvas:
        def __init__(self, canvas, x_offset, width):
            self._c = canvas
            self._ox = x_offset
            self._w = width
        def __getattr__(self, name):
            orig = getattr(self._c, name)
            if name in ('w',): return self._w
            return orig

    # 建立左右子畫布（共用 SVGCanvas 但座標偏移）
    # 做法：直接用兩組不同的 pts_norm，左右各佔 40% 寬度
    tri1_cfg = cfg.get('triangle1', {'vertex_labels': ['A','B','C']})
    tri2_cfg = cfg.get('triangle2', {'vertex_labels': ['D','E','F'],
                                      'subtype': tri1_cfg.get('subtype','general')})

    sub = tri1_cfg.get('subtype', 'general')
    if sub == 'right':       pts_norm = [[1,1],[0,0],[0,1]]
    elif sub == 'isosceles': pts_norm = [[0,1],[1,1],[0.5,0.05]]
    elif sub == 'equilateral':
        h = math.sqrt(3)/2
        pts_norm = [[0,1],[1,1],[0.5,1-h]]
    else:
        pts_norm = [[0.05,0.95],[1,1],[0.72,0.05]]

    # 左右各佔畫布約 43%/50%，中間留符號空間；增加 padding 防標籤截斷
    half_W = int(W * 0.43)
    pts1, _ = fit_pts(pts_norm, half_W, H, padding=34)
    pts2_raw, _ = fit_pts(pts_norm, int(W * 0.50), H, padding=30)
    x_offset = W * 0.50
    pts2 = [(p[0] + x_offset, p[1]) for p in pts2_raw]
    # 確保 pts2 不超出右邊界（留 24px 給標籤）
    max_x2 = max(p[0] for p in pts2)
    if max_x2 > W - 24:
        shift = max_x2 - (W - 24)
        pts2 = [(p[0] - shift, p[1]) for p in pts2]

    def draw_tri(pts, labels, tri_cfg):
        verts = {labels[i]: pts[i] for i in range(min(len(labels),3))}
        cx2 = sum(p[0] for p in pts)/3
        cy2 = sum(p[1] for p in pts)/3
        n = 3
        for i in range(n):
            a, b = labels[i], labels[(i+1)%n]
            p1, p2 = verts[a], verts[b]
            c.line(p1[0],p1[1],p2[0],p2[1])
        # 等邊刻度
        for sk, ntick in tri_cfg.get('equal_marks',{}).items():
            a, b = sk[0], sk[-1]
            if a in verts and b in verts:
                p1,p2 = verts[a],verts[b]
                c.tick_mark(p1[0],p1[1],p2[0],p2[1],n=int(ntick))
        # 角弧
        arc_cfg2 = tri_cfg.get('angle_arcs',{})
        if isinstance(arc_cfg2, list): arc_cfg2 = {la:1 for la in arc_cfg2}
        for la, n_arcs in arc_cfg2.items():
            if la in verts:
                others = [l for l in labels if l!=la]
                v = verts[la]
                c.angle_arc(v[0],v[1],verts[others[0]][0],verts[others[0]][1],
                            verts[others[1]][0],verts[others[1]][1], r=14, n=int(n_arcs))
        # 邊長標籤
        for sk, sl in tri_cfg.get('side_labels',{}).items():
            a, b = sk[0], sk[-1]
            if a in verts and b in verts:
                p1, p2 = verts[a], verts[b]
                lx, ly = side_label_pos(p1, p2, offset=14)
                c.text(lx, ly, sl, size=11, italic=True)
        # 頂點
        for la, (vx, vy) in verts.items():
            c.dot(vx, vy, r=2.5)
            lx, ly = label_pos(vx, vy, cx2, cy2, dist=18)
            c.text(lx, ly, la, size=12, italic=True)

    labels1 = tri1_cfg.get('vertex_labels', ['A','B','C'])
    labels2 = tri2_cfg.get('vertex_labels', ['D','E','F'])
    draw_tri(pts1, labels1, tri1_cfg)
    draw_tri(pts2, labels2, tri2_cfg)

    # 中間比例符號
    if cfg.get('ratio_label'):
        c.text(W*0.44, H/2, '∼', size=18, color='#555')


# ══════════════════════════════════════════════════════
# 主分派器
# ══════════════════════════════════════════════════════

RENDERERS = {
    'triangle':         render_triangle,
    'quadrilateral':    render_quadrilateral,
    'circle':           render_circle,
    'coordinate_plane': render_coordinate_plane,
    'solid_3d':         render_solid_3d,
    'parallel_lines':   render_parallel_lines,
    'triangle_center':  render_triangle_center,
    'similar_triangles':render_similar_triangles,
}


def render_figure(spec):
    """輸入單一圖形 spec，回傳 SVG 字串"""
    fig_type = spec.get('type', 'triangle')
    cfg = spec.get('config', {})
    canvas_opts = spec.get('canvas', {})
    cv = SVGCanvas(
        width=canvas_opts.get('width', 280),
        height=canvas_opts.get('height', 220),
        bg=canvas_opts.get('bg', 'white')
    )
    renderer = RENDERERS.get(fig_type)
    if renderer is None:
        raise ValueError(f"未知圖形類型：{fig_type}")
    renderer(cv, cfg)
    return cv.render()


# ══════════════════════════════════════════════════════
# CLI 主程式
# ══════════════════════════════════════════════════════

def main():
    if len(sys.argv) < 3:
        print("Usage: geometry_renderer.py <spec.json> <output_dir/>")
        sys.exit(1)

    spec_path = Path(sys.argv[1])
    out_dir   = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)

    with open(spec_path, 'r', encoding='utf-8') as f:
        batch = json.load(f)

    figures = batch.get('figures', [batch])   # 支援單圖或批次
    options = batch.get('options', {})
    fmt = options.get('format', 'svg')
    dpi = options.get('dpi', 150)

    results = []
    for fig in figures:
        fig_id = fig.get('id', 'figure')
        try:
            svg = render_figure(fig)
            svg_path = out_dir / f"{fig_id}.svg"
            svg_path.write_text(svg, encoding='utf-8')
            entry = {'id': fig_id, 'svg': str(svg_path)}

            if fmt == 'png':
                try:
                    import cairosvg
                    png_path = out_dir / f"{fig_id}.png"
                    cairosvg.svg2png(bytestring=svg.encode(), write_to=str(png_path), dpi=dpi)
                    entry['png'] = str(png_path)
                    print(f"✅ {fig_id} → {png_path}")
                except ImportError:
                    print(f"⚠️  cairosvg 未安裝，僅輸出 SVG: {svg_path}")
            else:
                print(f"✅ {fig_id} → {svg_path}")
            results.append(entry)
        except Exception as e:
            import traceback; traceback.print_exc()
            print(f"❌ {fig_id}: {e}")
            results.append({'id': fig_id, 'error': str(e)})

    manifest = out_dir / 'manifest.json'
    with open(manifest, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\n📄 Manifest: {manifest}")


if __name__ == '__main__':
    main()
