/* ============================================================
   SV：共用 SVG 幾何工具（皆回傳 SVG 字串片段）
   座標採「數學慣例」：y 向上為正；helper 內部自動翻轉成螢幕座標。
   ============================================================ */
const SV = (() => {
  const RAD = Math.PI / 180;

  // 極座標 → 螢幕座標（y 向下）；deg 為數學角度（逆時針為正）
  const pt = (cx, cy, r, deg) => [cx + r * Math.cos(deg * RAD), cy - r * Math.sin(deg * RAD)];

  // 兩點連線角度（數學角度 0~360）
  const angleOf = (cx, cy, x, y) => {
    let d = Math.atan2(-(y - cy), x - cx) / RAD;
    return (d + 360) % 360;
  };

  // 以「取樣折線」畫角弧（避免 SVG arc 的 sweep 方向 bug）
  // 從 d0 沿逆時針到 d1（若 d1<d0 自動 +360）
  const arcPoints = (cx, cy, r, d0, d1, steps = 40) => {
    if (d1 < d0) d1 += 360;
    let s = '';
    for (let i = 0; i <= steps; i++) {
      const d = d0 + (d1 - d0) * (i / steps);
      const [x, y] = pt(cx, cy, r, d);
      s += `${x.toFixed(1)},${y.toFixed(1)} `;
    }
    return s.trim();
  };

  // 角弧 + 角度標記文字；color 顏色；label 文字（可含度數）
  const angle = (cx, cy, r, d0, d1, color, label, opt = {}) => {
    const pts = arcPoints(cx, cy, r, d0, d1);
    let dm = (d0 + ((d1 < d0 ? d1 + 360 : d1) - d0) / 2);
    const lr = r + (opt.lr || 20);
    const [lx, ly] = pt(cx, cy, lr, dm);
    let out = `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${opt.w || 2.5}"/>`;
    if (opt.fill) {
      const [x0, y0] = pt(cx, cy, r, d0);
      const [x1, y1] = pt(cx, cy, r, d1);
      out = `<path d="M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 0 0 ${x1.toFixed(1)},${y1.toFixed(1)} Z" fill="${color}" opacity="0.14"/>` + out;
    }
    if (label) out += `<text x="${lx.toFixed(1)}" y="${(ly + 5).toFixed(1)}" text-anchor="middle" class="lbl" font-size="${opt.fs || 16}" fill="${color}">${label}</text>`;
    return out;
  };

  // 直角小方框（在頂點 V，介於方向 d0、d1 之間）
  const rightAngle = (cx, cy, d0, d1, size = 14, color = '#657187') => {
    const [ax, ay] = pt(cx, cy, size, d0);
    const [bx, by] = pt(cx, cy, size, d1);
    const dx = (ax - cx) + (bx - cx), dy = (ay - cy) + (by - cy);
    return `<path d="M${ax.toFixed(1)},${ay.toFixed(1)} L${(cx + dx).toFixed(1)},${(cy + dy).toFixed(1)} L${bx.toFixed(1)},${by.toFixed(1)}" fill="none" stroke="${color}" stroke-width="2"/>`;
  };

  // 邊上的等邊刻度記號（tick），n 條；p、q 為端點，用於標「相等的邊」
  const ticks = (x1, y1, x2, y2, n = 1, color = '#e11d48', len = 7) => {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const nx = Math.cos(ang + Math.PI / 2), ny = Math.sin(ang + Math.PI / 2);
    const tx = Math.cos(ang), ty = Math.sin(ang);
    let out = '';
    const gap = 5;
    const start = -(n - 1) * gap / 2;
    for (let i = 0; i < n; i++) {
      const off = start + i * gap;
      const bx = mx + tx * off, by = my + ty * off;
      out += `<line x1="${(bx - nx * len).toFixed(1)}" y1="${(by - ny * len).toFixed(1)}" x2="${(bx + nx * len).toFixed(1)}" y2="${(by + ny * len).toFixed(1)}" stroke="${color}" stroke-width="2.4"/>`;
    }
    return out;
  };

  // 端點小圓點
  const dot = (x, y, color = '#172033', r = 4.5) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;

  // 頂點標籤
  const vlabel = (x, y, text, color = '#172033', fs = 17) =>
    `<text x="${x}" y="${y}" class="lbl" font-size="${fs}" fill="${color}">${text}</text>`;

  // 線段
  const seg = (x1, y1, x2, y2, color = '#172033', w = 2.6, dash = '') =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`;

  // 多邊形（給頂點陣列 [[x,y],...]）
  const poly = (points, fill = 'rgba(37,99,235,0.08)', stroke = '#2563eb', w = 2.6) =>
    `<polygon points="${points.map(p => p.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"/>`;

  // 箭頭定義（在 svg 開頭放一次）
  const arrowDefs = (color = '#2563eb', id = 'arrow') =>
    `<defs><marker id="${id}" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="${color}"/></marker></defs>`;

  // 坐標平面：回傳 {svg內容, X, Y} —— X(mathx)、Y(mathy) 轉螢幕座標
  const plane = (opt) => {
    const { x0 = 60, y0 = 40, w = 420, h = 360, xmin = -6, xmax = 6, ymin = -6, ymax = 6, step = 1 } = opt;
    const sx = w / (xmax - xmin), sy = h / (ymax - ymin);
    const X = mx => x0 + (mx - xmin) * sx;
    const Y = my => y0 + (ymax - my) * sy;
    let g = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#fff" stroke="none"/>`;
    // 格線
    for (let x = Math.ceil(xmin); x <= xmax; x += step) {
      const px = X(x);
      g += `<line x1="${px}" y1="${y0}" x2="${px}" y2="${y0 + h}" stroke="${x === 0 ? '#c3ccdb' : '#e9eef6'}" stroke-width="${x === 0 ? 0 : 1}"/>`;
    }
    for (let y = Math.ceil(ymin); y <= ymax; y += step) {
      const py = Y(y);
      g += `<line x1="${x0}" y1="${py}" x2="${x0 + w}" y2="${py}" stroke="${y === 0 ? '#c3ccdb' : '#e9eef6'}" stroke-width="${y === 0 ? 0 : 1}"/>`;
    }
    // 軸
    g += `<line x1="${x0}" y1="${Y(0)}" x2="${x0 + w}" y2="${Y(0)}" stroke="#5b6478" stroke-width="2" marker-end="url(#axArrow)"/>`;
    g += `<line x1="${X(0)}" y1="${y0 + h}" x2="${X(0)}" y2="${y0}" stroke="#5b6478" stroke-width="2" marker-end="url(#axArrow)"/>`;
    g += `<text x="${x0 + w - 2}" y="${Y(0) + 20}" text-anchor="end" class="mth" font-size="15" fill="#5b6478">x</text>`;
    g += `<text x="${X(0) + 12}" y="${y0 + 12}" class="mth" font-size="15" fill="#5b6478">y</text>`;
    // 刻度數字
    for (let x = Math.ceil(xmin); x <= xmax; x += step) {
      if (x === 0) continue;
      g += `<text x="${X(x)}" y="${Y(0) + 16}" text-anchor="middle" font-size="11" fill="#96a0b3">${x}</text>`;
    }
    for (let y = Math.ceil(ymin); y <= ymax; y += step) {
      if (y === 0) continue;
      g += `<text x="${X(0) - 8}" y="${Y(y) + 4}" text-anchor="end" font-size="11" fill="#96a0b3">${y}</text>`;
    }
    g += `<text x="${X(0) - 8}" y="${Y(0) + 16}" text-anchor="end" font-size="11" fill="#96a0b3">O</text>`;
    return { svg: g, X, Y, defs: `<defs><marker id="axArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#5b6478"/></marker></defs>` };
  };

  // MathJax 公式卡（HTML，交由 slide 的 typeset 排版）
  // rows: [{label, tex, note, color, fill, border, size}]
  const fbox = (rows, opt = {}) => {
    return `<div style="width:100%;display:flex;flex-direction:column;gap:${opt.gap || 12}px;align-items:center;justify-content:center">` +
      rows.map(r => {
        const ac = r.color || '#2563eb';
        return `<div style="width:${r.w || opt.w || '90%'};background:${r.fill || '#fff'};border:1.5px solid ${r.border || '#dce3ee'};border-radius:14px;padding:${r.pad || '11px 16px'};text-align:center;box-shadow:0 4px 14px rgba(30,42,68,.06)">` +
          (r.label ? `<div style="font-size:12px;font-weight:900;letter-spacing:.04em;color:${ac};margin-bottom:3px">${r.label}</div>` : '') +
          `<div style="font-size:${r.size || 17}px;color:#172033">\\(${r.tex}\\)</div>` +
          (r.note ? `<div style="font-size:12.5px;color:#657187;margin-top:4px">${r.note}</div>` : '') +
          `</div>`;
      }).join('') + `</div>`;
  };

  // 步驟講解器：滑桿逐步展示一個性質的推理過程
  // steps: [{ t: '步驟說明(HTML)', d: (k)=>SVG片段 }]，k 為該步驟內 0~1 的連續進度
  // opt.acc=false 時每步只畫自己（d 需畫出完整場景）；預設 true＝疊加之前所有步驟
  const stepper = (h, vb, steps, opt = {}) => {
    const acc = opt.acc !== false;
    const N = steps.length;
    h.innerHTML = `<div style="width:100%;text-align:center">
      <svg viewBox="${vb}" style="max-width:100%"><g class="stepg"></g></svg>
      <div class="ictrl">
        <div class="step-txt"></div>
        <label>步驟 <span class="ival stepv">1</span> / ${N}　<span class="step-hint">→ 拖滑桿</span></label>
        <input class="steps-r" type="range" min="0" max="${N}" step="0.01" value="1">
      </div></div>`;
    const g = h.querySelector('.stepg'), txt = h.querySelector('.step-txt'),
      vEl = h.querySelector('.stepv'), sl = h.querySelector('.steps-r');
    const draw = () => {
      const v = +sl.value;
      const i = Math.max(0, Math.min(N - 1, Math.ceil(v) - 1));
      const k = Math.max(0, Math.min(1, v - i));
      vEl.textContent = i + 1;
      txt.innerHTML = `<b>步驟 ${i + 1}</b>｜${steps[i].t || ''}`;
      let s = '';
      if (acc) for (let j = 0; j < i; j++) { if (steps[j].d) s += steps[j].d(1); }
      if (steps[i].d) s += steps[i].d(k);
      g.innerHTML = s;
    };
    sl.oninput = draw; draw();
  };

  return { pt, angleOf, arcPoints, angle, rightAngle, ticks, dot, vlabel, seg, poly, arrowDefs, plane, RAD, fbox, stepper };
})();

// 互動視覺更新後，重新排版該區塊的 MathJax
window.MJ = (el) => { if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise(el ? [el] : undefined).catch(() => {}); };

