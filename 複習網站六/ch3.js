/* ============ 第 3 章　立體圖形 ============
   依康軒版第六冊：3-1 空間中的線與平面、3-2 表面積與體積
   課綱代碼 S-9-12、S-9-13。
   ⚠ 邊界：S-9-13 條文為「直角柱、直圓錐、正角錐的展開圖與表面積；**直角柱的體積**」，
     錐體體積公式不在條文內，本章以「柱體體積」為主，錐體只做展開圖與表面積。
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#059669';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }
  const TX = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" ${o.anchor ? `text-anchor="${o.anchor}"` : ''} font-size="${o.fs || 15}" font-weight="${o.fw || 800}" fill="${o.c || '#172033'}"${o.op != null ? ` opacity="${o.op}"` : ''}>${s}</text>`;
  const BOX = (x, y, w, hgt, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${hgt}" rx="${o.r || 12}" fill="${o.fill || '#fff'}" stroke="${o.stroke || '#dce3ee'}" stroke-width="${o.sw || 1.8}"/>`;
  const LN = (a, b, c = '#334', w = 2.2, dash = '') =>
    `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`;

  // 長方體：回傳 8 個頂點的螢幕座標（斜投影）
  // 下底 A B C D（前左、前右、後右、後左），上底 E F G H 對應其正上方
  function cuboid(cx, cy, w, hgt, dep) {
    const dx = dep * 0.52, dy = -dep * 0.34;
    const A = [cx - w / 2, cy + hgt / 2], B = [cx + w / 2, cy + hgt / 2];
    const C2 = [B[0] + dx, B[1] + dy], D = [A[0] + dx, A[1] + dy];
    const E = [A[0], A[1] - hgt], F = [B[0], B[1] - hgt];
    const G = [C2[0], C2[1] - hgt], H = [D[0], D[1] - hgt];
    return { A, B, C: C2, D, E, F, G, H };
  }
  function drawCuboid(P, opt = {}) {
    const dim = opt.dim || '#9aa4b6';
    let s = '';
    // 後方隱藏邊（虛線）
    s += LN(P.D, P.C, dim, 1.6, '5 4') + LN(P.D, P.A, dim, 1.6, '5 4') + LN(P.D, P.H, dim, 1.6, '5 4');
    // 可見邊
    [[P.A, P.B], [P.B, P.C], [P.E, P.F], [P.F, P.G], [P.G, P.H], [P.H, P.E],
     [P.A, P.E], [P.B, P.F], [P.C, P.G]].forEach(([a, b]) => { s += LN(a, b, dim, 2); });
    return s;
  }
  const vlab = (p, t, c = '#172033', dx = 0, dy = 0) => TX(p[0] + dx, p[1] + dy, t, { fs: 12.5, c });

  window.DECK.push({
    ch: 3,
    title: '立體圖形',
    color: C,
    sections: ['3-1 空間中的線與平面', '3-2 表面積與體積'],
    slides: [

      /* ---------- 3-1 空間中的線與平面 ---------- */
      {
        sec: '3-1', secName: '空間中的線與平面',
        title: '用<b>長方體</b>當地圖，看清楚空間裡的線與面',
        points: [
          '長方體有 <b>8 個頂點、12 條稜、6 個面</b>，是討論空間關係最好的模型。',
          '每一條稜都是一條<b>線段</b>，每一個面都在一個<b>平面</b>上。',
          '空間中的兩條直線，關係只有三種：<b>平行、相交（含垂直）、歪斜</b>。'
        ],
        formula: { label: '兩直線的三種關係', tex: '\\text{平行}\\;/\\;\\text{相交}\\;/\\;\\text{歪斜}' },
        visual: (h) => {
          h.innerHTML = (() => {
            const P = cuboid(190, 130, 150, 96, 86);
            let s = drawCuboid(P);
            [['A', P.A, -14, 14], ['B', P.B, 6, 14], ['C', P.C, 8, 6], ['D', P.D, -6, -2],
             ['E', P.E, -14, -6], ['F', P.F, 6, -6], ['G', P.G, 8, -6], ['H', P.H, -6, -8]]
              .forEach(([t, p, dx, dy]) => { s += vlab(p, t, '#172033', dx, dy); });
            Object.values(P).forEach(p => { s += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.2" fill="#172033"/>`; });
            s += BOX(300, 44, 124, 170, { fill: '#f6f8fc' });
            s += TX(362, 68, '長方體', { fs: 14, c: C, anchor: 'middle' });
            [['8 個頂點', 92], ['12 條稜', 116], ['6 個面', 140]].forEach(([t, y]) => {
              s += TX(362, y, t, { fs: 13, c: '#172033', anchor: 'middle' });
            });
            s += TX(362, 172, '每條稜＝線', { fs: 12, c: '#657187', anchor: 'middle' });
            s += TX(362, 192, '每個面＝平面', { fs: 12, c: '#657187', anchor: 'middle' });
            return svg('0 0 440 236', s);
          })();
        },
        caption: '接下來的每個關係，都用這個長方體<b>指出實際的例子</b>。',
        example: {
          q: '長方體中，與稜 \\(\\overline{AB}\\) 平行的稜共有幾條？',
          steps: ['同一個面上的對邊 \\(\\overline{DC}\\)、\\(\\overline{EF}\\)。', '再加上最遠的 \\(\\overline{HG}\\)。'],
          ans: '\\(3\\) 條'
        }
      },

      {
        sec: '3-1', secName: '空間中的線與平面',
        title: '兩直線：平行、相交、<b>歪斜</b>',
        points: [
          '<b>平行</b>：在同一平面上且<b>永不相交</b>。',
          '<b>相交</b>：有一個共同點；若夾角 \\(90^\\circ\\) 就是<b>垂直</b>。',
          '<b>歪斜</b>：<b>不平行也不相交</b>——只有空間中才會發生，平面上沒有。'
        ],
        formula: { label: '關鍵差別', tex: '\\text{歪斜}=\\text{不相交}\\ \\textbf{且}\\ \\text{不在同一平面上}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>看關係：<span class="ival" id="rv">平行</span></label>
            <input type="range" id="rs" min="0" max="2" step="1" value="0"></div></div>`;
          const draw = () => {
            const i = +h.querySelector('#rs').value;
            const names = ['平行', '垂直（相交）', '歪斜'];
            h.querySelector('#rv').textContent = names[i];
            const P = cuboid(160, 118, 148, 92, 84);
            let s = drawCuboid(P, { dim: '#d3dae5' });
            const pairs = [
              [[P.A, P.B], [P.H, P.G], BLU, '\\(\\overline{AB}\\) ∥ \\(\\overline{HG}\\)', '在同一平面上，永不相交'],
              [[P.A, P.B], [P.A, P.E], GRN, '\\(\\overline{AB}\\) ⊥ \\(\\overline{AE}\\)', '交於 A 點，夾角 90°'],
              [[P.A, P.B], [P.C, P.G], RED, '\\(\\overline{AB}\\) 與 \\(\\overline{CG}\\) 歪斜', '不相交，也不在同一平面上']
            ];
            const [l1, l2, col, lab, note] = pairs[i];
            s += LN(l1[0], l1[1], col, 4.6);
            s += LN(l2[0], l2[1], col, 4.6);
            [['A', P.A, -14, 14], ['B', P.B, 6, 14], ['C', P.C, 8, 6], ['E', P.E, -14, -6],
             ['G', P.G, 8, -6], ['H', P.H, -6, -8]].forEach(([t, p, dx, dy]) => { s += vlab(p, t, '#657187', dx, dy); });
            s += BOX(24, 190, 392, 62, { fill: i === 2 ? '#fdeef2' : '#f6f8fc', stroke: i === 2 ? '#f3c4d0' : '#dce3ee' });
            s += TX(220, 213, names[i], { fs: 16, c: col, anchor: 'middle' });
            s += TX(220, 238, note, { fs: 13, c: '#657187', anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 262', s);
            const cap = h.querySelector('#lab'); if (cap) cap.innerHTML = lab;
          };
          h.querySelector('#rs').oninput = draw; draw();
        },
        caption: '<b>歪斜</b>是空間才有的新關係：不相交，但也絕不平行。',
        example: {
          q: '長方體中，\\(\\overline{AB}\\) 與 \\(\\overline{CG}\\) 是什麼關係？',
          steps: ['兩者延長也不會相交。', '但它們不在同一個平面上，所以不是平行。'],
          ans: '歪斜'
        }
      },

      {
        sec: '3-1', secName: '空間中的線與平面',
        title: '不相交<b>不一定</b>平行——這就是歪斜的陷阱',
        points: [
          '平面上：不相交 <b>就是</b> 平行。空間中：不相交<b>可能是歪斜</b>。',
          '判斷平行要多一個條件：<b>兩線必須在同一平面上</b>。',
          '找歪斜的訣竅：兩條稜<b>沒有共同頂點</b>，且<b>找不到一個面同時含這兩條</b>。'
        ],
        formula: { label: '判斷流程', tex: '\\text{有共同點?}\\ \\to\\ \\text{相交}\\;;\\quad\\text{無共同點且共面?}\\ \\to\\ \\text{平行}\\;;\\quad\\text{否則}\\ \\to\\ \\text{歪斜}' },
        visual: (h) => {
          h.innerHTML = (() => {
            const P = cuboid(150, 108, 140, 88, 80);
            let s = drawCuboid(P, { dim: '#d3dae5' });
            s += LN(P.A, P.B, '#172033', 4.4);
            s += TX((P.A[0] + P.B[0]) / 2, P.A[1] + 20, '基準：AB', { fs: 12.5, c: '#172033', anchor: 'middle' });
            // 對 AB 而言：平行的 HG、相交的 AE、歪斜的 CG
            s += LN(P.H, P.G, BLU, 3.6);
            s += LN(P.A, P.E, GRN, 3.6);
            s += LN(P.C, P.G, RED, 3.6);
            const leg = (y, col, t1, t2) => BOX(258, y, 166, 42, { fill: col + '18', stroke: col, sw: 1.8, r: 10 })
              + TX(268, y + 18, t1, { fs: 12.5, c: col })
              + TX(268, y + 34, t2, { fs: 11.5, c: '#657187', fw: 700 });
            s += leg(30, BLU, 'HG：平行', '共面、不相交');
            s += leg(80, GRN, 'AE：相交（垂直）', '有共同點 A');
            s += leg(130, RED, 'CG：歪斜', '不共面、不相交');
            s += BOX(24, 194, 400, 44, { fill: '#fff7ed', stroke: '#f2d5ab' });
            s += TX(224, 221, '⚠ 只說「不相交」還不夠 —— 要再確認是否共面', { fs: 13.5, c: AMB, anchor: 'middle' });
            return svg('0 0 448 250', s);
          })();
        },
        caption: '同一條 \\(\\overline{AB}\\)，對不同的稜可以是<b>平行、垂直、歪斜</b>三種關係。',
        example: {
          q: '長方體中，與 \\(\\overline{AB}\\) <b>歪斜</b>的稜有哪些？',
          steps: ['先排除與 AB 相交的（含 A 或 B 的稜）。', '再排除與 AB 平行的 \\(\\overline{DC},\\overline{EF},\\overline{HG}\\)。', '剩下 \\(\\overline{DH},\\overline{CG}\\)。'],
          ans: '\\(\\overline{DH}\\)、\\(\\overline{CG}\\)（共 2 條）'
        }
      },

      {
        sec: '3-1', secName: '空間中的線與平面',
        title: '線與平面：平行、垂直、線在面上',
        points: [
          '<b>線與面平行</b>：直線與平面<b>沒有交點</b>（例：\\(\\overline{EF}\\) 與底面 \\(ABCD\\)）。',
          '<b>線與面垂直</b>：直線與平面內<b>所有</b>直線都垂直（例：\\(\\overline{AE}\\) 垂直底面）。',
          '<b>線在面上</b>：直線整條都落在該平面內（例：\\(\\overline{AB}\\) 在底面上）。'
        ],
        formula: { label: '線垂直於面', tex: 'L\\perp\\text{平面}\\iff L\\ \\text{與面內每一條直線都垂直}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>看關係：<span class="ival" id="rv">線在面上</span></label>
            <input type="range" id="rs" min="0" max="2" step="1" value="0"></div></div>`;
          const draw = () => {
            const i = +h.querySelector('#rs').value;
            const names = ['線在面上', '線與面平行', '線與面垂直'];
            h.querySelector('#rv').textContent = names[i];
            const P = cuboid(158, 116, 148, 92, 84);
            let s = '';
            // 底面塗色
            s += `<polygon points="${P.A.join(',')} ${P.B.join(',')} ${P.C.join(',')} ${P.D.join(',')}" fill="rgba(5,150,105,.14)" stroke="${C}" stroke-width="2"/>`;
            s += drawCuboid(P, { dim: '#d3dae5' });
            const lines = [[P.A, P.B], [P.E, P.F], [P.A, P.E]];
            const cols = [C, BLU, RED];
            s += LN(lines[i][0], lines[i][1], cols[i], 4.6);
            if (i === 2) {   // 直角記號
              s += `<path d="M${P.A[0] + 12},${P.A[1]} L${P.A[0] + 12},${P.A[1] - 12} L${P.A[0]},${P.A[1] - 12}" fill="none" stroke="${RED}" stroke-width="2"/>`;
            }
            [['A', P.A, -14, 14], ['B', P.B, 6, 14], ['E', P.E, -14, -6], ['F', P.F, 6, -6]]
              .forEach(([t, p, dx, dy]) => { s += vlab(p, t, '#657187', dx, dy); });
            s += TX((P.A[0] + P.C[0]) / 2, P.A[1] - 18, '底面 ABCD', { fs: 12, c: C, anchor: 'middle' });
            const notes = ['\\(\\overline{AB}\\) 整條都在底面內',
              '\\(\\overline{EF}\\) 在上面，與底面永不相交',
              '\\(\\overline{AE}\\) 與底面內每條直線都垂直'];
            s += BOX(24, 196, 392, 60, { fill: '#f6f8fc' });
            s += TX(220, 220, names[i], { fs: 16, c: cols[i], anchor: 'middle' });
            s += TX(220, 243, ['線整條落在平面內', '直線與平面沒有交點', '直線垂直於平面內每一條線'][i],
              { fs: 12.5, c: '#657187', anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 266', s);
          };
          h.querySelector('#rs').oninput = draw; draw();
        },
        caption: '判斷「線與面垂直」只要找到面內<b>兩條相交</b>的直線都與它垂直即可。',
        example: {
          q: '長方體中，哪些稜與底面 \\(ABCD\\) 垂直？',
          steps: ['底面是水平的，鉛直方向的稜都與它垂直。', '共有 \\(\\overline{AE},\\overline{BF},\\overline{CG},\\overline{DH}\\)。'],
          ans: '\\(\\overline{AE},\\overline{BF},\\overline{CG},\\overline{DH}\\) 共 4 條'
        }
      },

      {
        sec: '3-1', secName: '空間中的線與平面',
        title: '正四面體：四個面都是<b>正三角形</b>',
        points: [
          '正四面體有 <b>4 個頂點、6 條稜、4 個面</b>，每個面都是正三角形。',
          '任兩條稜若<b>沒有共同頂點</b>，就一定是<b>歪斜</b>（正四面體沒有平行的稜）。',
          '正四面體是課綱指定的另一個空間模型，常拿來考歪斜。'
        ],
        formula: { label: '正四面體', tex: '4\\ \\text{頂點},\\;6\\ \\text{稜},\\;4\\ \\text{個正三角形面}' },
        visual: (h) => {
          h.innerHTML = (() => {
            const A = [130, 46], B = [64, 176], C2 = [206, 176], D = [140, 128];
            let s = '';
            s += `<polygon points="${A.join(',')} ${B.join(',')} ${C2.join(',')}" fill="rgba(5,150,105,.10)" stroke="${C}" stroke-width="2.4"/>`;
            s += LN(A, D, '#9aa4b6', 1.8, '5 4') + LN(B, D, '#9aa4b6', 1.8, '5 4') + LN(C2, D, '#9aa4b6', 1.8, '5 4');
            [[A, 'A', -6, -10], [B, 'B', -16, 10], [C2, 'C', 8, 10], [D, 'D', 8, 6]].forEach(([p, t, dx, dy]) => {
              s += `<circle cx="${p[0]}" cy="${p[1]}" r="3.6" fill="#172033"/>` + vlab(p, t, '#172033', dx, dy);
            });
            // 標一組歪斜：AB 與 CD
            s += LN(A, B, RED, 4.2);
            s += LN(C2, D, RED, 4.2, '');
            s += TX(130, 206, '紅色兩條稜 AB 與 CD：沒有共同頂點 ⇒ 歪斜', { fs: 12.5, c: RED, anchor: 'middle' });
            s += BOX(250, 44, 176, 152, { fill: '#f6f8fc' });
            s += TX(338, 68, '正四面體', { fs: 14, c: C, anchor: 'middle' });
            [['4 個頂點', 94], ['6 條稜', 118], ['4 個正三角形面', 142]].forEach(([t, y]) => {
              s += TX(338, y, t, { fs: 13, anchor: 'middle' });
            });
            s += TX(338, 174, '沒有任何兩稜平行', { fs: 12, c: AMB, anchor: 'middle' });
            return svg('0 0 448 220', s);
          })();
        },
        caption: '正四面體的六條稜，<b>兩兩不是相交就是歪斜</b>——完全沒有平行。',
        example: {
          q: '正四面體 \\(ABCD\\) 中，與稜 \\(\\overline{AB}\\) 歪斜的稜有幾條？',
          steps: ['含 A 或 B 的稜都與它相交，要排除。', '剩下只有 \\(\\overline{CD}\\) 沒有共同頂點。'],
          ans: '\\(1\\) 條（\\(\\overline{CD}\\)）'
        }
      },

      /* ---------- 3-2 表面積與體積 ---------- */
      {
        sec: '3-2', secName: '表面積與體積',
        title: '直角柱的展開圖：<b>兩個底面 ＋ 一片側面</b>',
        points: [
          '把柱體<b>攤平</b>就是展開圖：上下兩個<b>全等的底面</b>，加中間一長條<b>側面</b>。',
          '側面攤開是一個<b>長方形</b>：長 ＝ 底面<b>周長</b>，寬 ＝ 柱<b>高</b>。',
          '拖滑桿看柱體慢慢攤平的過程。'
        ],
        formula: { label: '側面長方形', tex: '\\text{側面積}=\\text{底面周長}\\times\\text{高}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>攤平程度 <span class="ival" id="tv">0</span>%</label>
            <input type="range" id="ts" min="0" max="100" step="10" value="0"></div></div>`;
          const draw = () => {
            const t = +h.querySelector('#ts').value / 100;
            h.querySelector('#tv').textContent = Math.round(t * 100);
            let s = '';
            if (t < 0.5) {   // 立體
              const P = cuboid(120, 120, 84, 92, 56);
              s += drawCuboid(P, { dim: '#657187' });
              s += `<polygon points="${P.A.join(',')} ${P.B.join(',')} ${P.C.join(',')} ${P.D.join(',')}" fill="rgba(5,150,105,.18)" stroke="${C}" stroke-width="2"/>`;
              s += `<polygon points="${P.E.join(',')} ${P.F.join(',')} ${P.G.join(',')} ${P.H.join(',')}" fill="rgba(5,150,105,.18)" stroke="${C}" stroke-width="2"/>`;
              s += TX(120, 196, '長方柱（直角柱）', { fs: 13, c: '#657187', anchor: 'middle' });
            }
            // 展開圖（隨 t 淡入）
            const op = Math.max(0, (t - 0.2) / 0.8);
            if (op > 0) {
              const bx = 232, by = 66, bw = 36, bd = 24, hh = 84;
              // 上底
              s += `<rect x="${bx}" y="${by - 30}" width="${bw}" height="${bd}" fill="rgba(5,150,105,.20)" stroke="${C}" stroke-width="2" opacity="${op}"/>`;
              // 側面四片（長 = 周長）
              const segs = [bw, bd, bw, bd];
              let x = bx;
              segs.forEach((w2, i) => {
                s += `<rect x="${x}" y="${by}" width="${w2}" height="${hh}" fill="rgba(37,99,235,.12)" stroke="${BLU}" stroke-width="1.8" opacity="${op}"/>`;
                x += w2;
              });
              // 下底
              s += `<rect x="${bx}" y="${by + hh + 6}" width="${bw}" height="${bd}" fill="rgba(5,150,105,.20)" stroke="${C}" stroke-width="2" opacity="${op}"/>`;
              s += TX(bx + (bw + bd) - 6, by + hh + 46, `側面長 ＝ 底面周長`, { fs: 12.5, c: BLU, anchor: 'middle', op });
              s += TX(bx - 8, by + hh / 2, '高', { fs: 12.5, c: BLU, anchor: 'end', op });
              s += TX(bx + bw / 2, by - 38, '上底', { fs: 11.5, c: C, anchor: 'middle', op });
              s += TX(bx + bw / 2, by + hh + 44, '下底', { fs: 11.5, c: C, anchor: 'middle', op });
            }
            s += BOX(24, 214, 400, 44, { fill: '#f6f8fc' });
            s += TX(224, 241, t < 0.3 ? '拖滑桿把柱體攤平看看' : '表面積 ＝ 2 × 底面積 ＋ 底面周長 × 高',
              { fs: 14, c: t < 0.3 ? '#657187' : C, anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 448 270', s);
          };
          h.querySelector('#ts').oninput = draw; draw();
        },
        caption: '側面攤開後是一整片長方形——<b>長就是底面繞一圈的周長</b>。',
        example: {
          q: '底面為 \\(3\\times4\\) 長方形、高 \\(10\\) 的長方柱，側面積是多少？',
          steps: ['底面周長 \\(=2(3+4)=14\\)。', '側面積 \\(=14\\times10\\)。'],
          ans: '\\(140\\)'
        }
      },

      {
        sec: '3-2', secName: '表面積與體積',
        title: '直角柱表面積 ＝ <b>2×底面積 ＋ 側面積</b>',
        points: [
          '表面積是<b>所有面</b>的面積總和：兩個底面 ＋ 一整片側面。',
          '<b>先算底面積與底面周長</b>，兩個數字準備好，公式就套得出來。',
          '拖滑桿改變高，看側面積怎麼變、底面積為何不變。'
        ],
        formula: { label: '直角柱表面積', tex: '\\text{表面積}=2\\times\\text{底面積}+\\text{底面周長}\\times\\text{高}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>柱高 h ＝ <span class="ival" id="hv">10</span></label>
            <input type="range" id="hs" min="2" max="16" step="2" value="10"></div></div>`;
          const draw = () => {
            const hgt = +h.querySelector('#hs').value;
            h.querySelector('#hv').textContent = hgt;
            const a = 3, b = 4;
            const base = a * b, peri = 2 * (a + b), side = peri * hgt, total = 2 * base + side;
            const P = cuboid(112, 128, 74, Math.max(30, hgt * 6.6), 50);
            let s = drawCuboid(P, { dim: '#657187' });
            s += `<polygon points="${P.E.join(',')} ${P.F.join(',')} ${P.G.join(',')} ${P.H.join(',')}" fill="rgba(5,150,105,.22)" stroke="${C}" stroke-width="2"/>`;
            s += `<polygon points="${P.A.join(',')} ${P.B.join(',')} ${P.F.join(',')} ${P.E.join(',')}" fill="rgba(37,99,235,.14)" stroke="${BLU}" stroke-width="1.8"/>`;
            s += TX(112, 214, `底 ${a}×${b}、高 ${hgt}`, { fs: 12.5, c: '#657187', anchor: 'middle' });
            const line = (y, lab, val, col) => BOX(214, y, 210, 34, { fill: col + '14', stroke: col, sw: 1.6, r: 9 })
              + TX(224, y + 22, lab, { fs: 12.5, c: col })
              + TX(414, y + 22, val, { fs: 13.5, c: col, anchor: 'end' });
            s += line(36, '底面積 = 3×4', `${base}`, C);
            s += line(76, '底面周長 = 2(3+4)', `${peri}`, VIO);
            s += line(116, `側面積 = ${peri}×${hgt}`, `${side}`, BLU);
            s += BOX(214, 156, 210, 42, { fill: '#eef7f2', stroke: C, sw: 2, r: 10 });
            s += TX(224, 182, `表面積 = 2×${base} + ${side}`, { fs: 12.5, c: C });
            s += TX(414, 182, `${total}`, { fs: 16, c: C, anchor: 'end' });
            h.querySelector('#fig').innerHTML = svg('0 0 448 228', s);
          };
          h.querySelector('#hs').oninput = draw; draw();
        },
        caption: '高只影響<b>側面積</b>；底面積永遠是同一個數字。',
        example: {
          q: '底面為邊長 \\(5\\) 的正方形、高 \\(8\\) 的正四角柱，表面積是多少？',
          steps: ['底面積 \\(=5^2=25\\)，底面周長 \\(=4\\times5=20\\)。', '側面積 \\(=20\\times8=160\\)。', '表面積 \\(=2\\times25+160\\)。'],
          ans: '\\(210\\)'
        }
      },

      {
        sec: '3-2', secName: '表面積與體積',
        title: '直角柱體積 ＝ <b>底面積 × 高</b>',
        points: [
          '把底面<b>往上疊高</b>就是柱體 ⇒ 體積 ＝ 底面積 × 高。',
          '不管底面是三角形、長方形還是圓，<b>柱體都用同一個公式</b>。',
          '拖滑桿看一層一層疊上去，體積怎麼倍增。'
        ],
        formula: { label: '直角柱體積', tex: 'V=\\text{底面積}\\times\\text{高}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>疊幾層（高） <span class="ival" id="nv">4</span></label>
            <input type="range" id="ns" min="1" max="8" step="1" value="4"></div></div>`;
          const draw = () => {
            const n = +h.querySelector('#ns').value;
            h.querySelector('#nv').textContent = n;
            const base = 12, lay = 18;
            let s = TX(220, 20, '底面積固定 12，每疊一層就多 12', { fs: 13.5, c: C, anchor: 'middle' });
            // 疊層示意
            const cx = 130, byBottom = 200;
            for (let i = 0; i < n; i++) {
              const y = byBottom - i * lay;
              const P = cuboid(cx, y - lay / 2, 84, lay, 52);
              s += `<polygon points="${P.A.join(',')} ${P.B.join(',')} ${P.C.join(',')} ${P.D.join(',')}" fill="rgba(5,150,105,${0.10 + i * 0.03})" stroke="${C}" stroke-width="1.6"/>`;
              s += `<polygon points="${P.A.join(',')} ${P.B.join(',')} ${P.F.join(',')} ${P.E.join(',')}" fill="rgba(5,150,105,${0.16 + i * 0.03})" stroke="${C}" stroke-width="1.4"/>`;
              s += `<polygon points="${P.B.join(',')} ${P.C.join(',')} ${P.G.join(',')} ${P.F.join(',')}" fill="rgba(5,150,105,${0.24 + i * 0.03})" stroke="${C}" stroke-width="1.4"/>`;
            }
            s += TX(cx, byBottom + 26, `高 ＝ ${n}`, { fs: 13, c: '#657187', anchor: 'middle' });
            s += BOX(246, 52, 180, 116, { fill: '#f6f8fc' });
            s += TX(336, 78, '底面積 × 高', { fs: 13.5, c: '#657187', anchor: 'middle' });
            s += TX(336, 112, `${base} × ${n}`, { fs: 20, c: C, anchor: 'middle' });
            s += TX(336, 148, `＝ ${base * n}`, { fs: 22, c: C, anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 448 236', s);
          };
          h.querySelector('#ns').oninput = draw; draw();
        },
        caption: '柱體體積的核心就是「<b>把底面積疊高</b>」——三角柱、圓柱通通適用。',
        example: {
          q: '底面半徑 \\(3\\)、高 \\(10\\) 的圓柱，體積是多少？（用 \\(\\pi\\) 表示）',
          steps: ['底面積 \\(=\\pi\\times3^{2}=9\\pi\\)。', '體積 \\(=9\\pi\\times10\\)。'],
          ans: '\\(90\\pi\\)'
        }
      },

      {
        sec: '3-2', secName: '表面積與體積',
        title: '直圓錐的展開圖：一個<b>扇形</b> ＋ 一個<b>圓</b>',
        points: [
          '圓錐攤開後，側面是<b>扇形</b>，底面是<b>圓</b>。',
          '扇形的<b>半徑</b>就是圓錐的<b>母線 \\(l\\)</b>（不是高！）。',
          '扇形的<b>弧長</b>剛好等於底面圓的<b>周長</b> \\(2\\pi r\\)。'
        ],
        formula: { label: '關鍵對應', tex: '\\text{扇形半徑}=l\\;(\\text{母線})\\;,\\qquad \\text{扇形弧長}=2\\pi r' },
        visual: (h) => {
          h.innerHTML = (() => {
            let s = '';
            // 左：圓錐
            const cx = 106, apex = [cx, 48], bl = [cx - 52, 158], br = [cx + 52, 158];
            s += `<ellipse cx="${cx}" cy="158" rx="52" ry="17" fill="rgba(5,150,105,.16)" stroke="${C}" stroke-width="2"/>`;
            s += `<path d="M${apex.join(',')} L${bl.join(',')} A52,17 0 0 0 ${br.join(',')} Z" fill="rgba(5,150,105,.10)" stroke="${C}" stroke-width="2.2"/>`;
            s += LN(apex, [cx, 158], '#9aa4b6', 1.8, '5 4');
            s += TX(cx + 6, 112, 'h（高）', { fs: 11.5, c: '#9aa4b6' });
            s += LN(apex, br, VIO, 2.6);
            s += TX(cx + 40, 96, 'l（母線）', { fs: 12, c: VIO });
            s += LN([cx, 158], br, BLU, 2.2);
            s += TX(cx + 24, 174, 'r', { fs: 12, c: BLU });
            s += TX(cx, 196, '直圓錐', { fs: 12.5, c: '#657187', anchor: 'middle' });
            // 右：展開圖（扇形＋圓）
            const sx = 300, sy = 62, R = 74;
            const a0 = 200, a1 = 340;                       // 扇形角度範圍
            const pt = (deg, rad) => [sx + rad * Math.cos(deg * Math.PI / 180), sy - rad * Math.sin(deg * Math.PI / 180)];
            const p0 = pt(a0, R), p1 = pt(a1, R);
            s += `<path d="M${sx},${sy} L${p0.join(',')} A${R},${R} 0 0 1 ${p1.join(',')} Z" fill="rgba(124,58,237,.14)" stroke="${VIO}" stroke-width="2.2"/>`;
            s += TX(sx + 4, sy + 30, 'l', { fs: 12.5, c: VIO });
            s += TX(sx, sy + 96, '弧長 = 2πr', { fs: 12, c: VIO, anchor: 'middle' });
            s += `<circle cx="${sx + 6}" cy="190" r="26" fill="rgba(37,99,235,.14)" stroke="${BLU}" stroke-width="2"/>`;
            s += TX(sx + 6, 194, 'r', { fs: 12.5, c: BLU, anchor: 'middle' });
            s += TX(sx + 6, 226, '底面圓', { fs: 11.5, c: BLU, anchor: 'middle' });
            s += BOX(24, 208, 200, 44, { fill: '#fff7ed', stroke: '#f2d5ab' });
            s += TX(124, 236, '⚠ 母線 l ≠ 高 h', { fs: 13.5, c: AMB, anchor: 'middle' });
            return svg('0 0 448 262', s);
          })();
        },
        caption: '最常錯的地方：<b>扇形半徑是母線 \\(l\\)，不是圓錐的高 \\(h\\)</b>。',
        example: {
          q: '圓錐底面半徑 \\(3\\)、母線 \\(5\\)，其側面展開扇形的弧長是多少？',
          steps: ['弧長等於底面圓周長。', '\\(2\\pi r=2\\pi\\times3\\)。'],
          ans: '\\(6\\pi\\)'
        }
      },

      {
        sec: '3-2', secName: '表面積與體積',
        title: '直圓錐表面積 ＝ \\(\\pi r^{2}+\\pi r l\\)',
        points: [
          '底面積 \\(=\\pi r^{2}\\)；側面（扇形）面積 \\(=\\pi r l\\)。',
          '母線、半徑、高三者滿足<b>畢氏定理</b> \\(l^{2}=r^{2}+h^{2}\\)。',
          '拖滑桿改變母線 \\(l\\)，看側面積與總表面積怎麼變。'
        ],
        formula: { label: '直圓錐表面積', tex: '\\text{表面積}=\\pi r^{2}+\\pi r l\\quad(l^{2}=r^{2}+h^{2})' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>母線 l ＝ <span class="ival" id="lv">5</span>（r 固定 3）</label>
            <input type="range" id="ls" min="4" max="10" step="1" value="5"></div></div>`;
          const draw = () => {
            const l = +h.querySelector('#ls').value, r = 3;
            h.querySelector('#lv').textContent = l;
            const hh = Math.sqrt(l * l - r * r);
            const cx = 106, topY = 172 - hh * 13, apex = [cx, topY];
            let s = '';
            s += `<ellipse cx="${cx}" cy="172" rx="${r * 15}" ry="15" fill="rgba(37,99,235,.16)" stroke="${BLU}" stroke-width="2"/>`;
            s += `<path d="M${apex.join(',')} L${cx - r * 15},172 A${r * 15},15 0 0 0 ${cx + r * 15},172 Z" fill="rgba(124,58,237,.12)" stroke="${VIO}" stroke-width="2.2"/>`;
            s += LN(apex, [cx, 172], '#9aa4b6', 1.6, '5 4');
            s += TX(cx + 5, (topY + 172) / 2, `h≈${hh.toFixed(1)}`, { fs: 11, c: '#9aa4b6' });
            s += TX(cx + r * 15 * 0.6, (topY + 172) / 2 - 6, `l=${l}`, { fs: 12, c: VIO });
            s += TX(cx, 196, `r = ${r}`, { fs: 12, c: BLU, anchor: 'middle' });
            const line = (y, lab, val, col) => BOX(214, y, 212, 36, { fill: col + '14', stroke: col, sw: 1.6, r: 9 })
              + TX(224, y + 23, lab, { fs: 12.5, c: col })
              + TX(416, y + 23, val, { fs: 14, c: col, anchor: 'end' });
            s += line(30, 'π r² = π×3²', `${r * r}π`, BLU);
            s += line(74, `π r l = π×3×${l}`, `${r * l}π`, VIO);
            s += BOX(214, 122, 212, 44, { fill: '#eef7f2', stroke: C, sw: 2, r: 10 });
            s += TX(224, 150, `表面積 = ${r * r}π + ${r * l}π`, { fs: 13, c: C });
            s += TX(416, 150, `${r * r + r * l}π`, { fs: 17, c: C, anchor: 'end' });
            s += TX(320, 190, `檢查：l² = r² + h² ⇒ ${l * l} = ${r * r} + ${(hh * hh).toFixed(0)}`, { fs: 11.5, c: '#657187', anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 448 212', s);
          };
          h.querySelector('#ls').oninput = draw; draw();
        },
        caption: '側面積公式 \\(\\pi r l\\) 用的是<b>母線 \\(l\\)</b>；要先用畢氏定理把它算出來。',
        example: {
          q: '直圓錐底面半徑 \\(3\\)、高 \\(4\\)，求表面積。',
          steps: ['先求母線：\\(l=\\sqrt{3^{2}+4^{2}}=5\\)。', '底面積 \\(=9\\pi\\)，側面積 \\(=\\pi\\times3\\times5=15\\pi\\)。'],
          ans: '\\(24\\pi\\)'
        }
      },

      {
        sec: '3-2', secName: '表面積與體積',
        title: '正角錐的展開圖：底面多邊形 ＋ 幾個<b>等腰三角形</b>',
        points: [
          '正 \\(n\\) 角錐攤開 ＝ 一個正 \\(n\\) 邊形底面 ＋ <b>\\(n\\) 個全等的等腰三角形</b>。',
          '每個三角形的<b>高</b>叫<b>斜高</b>（側面三角形的高），不是角錐的高。',
          '側面積 ＝ \\(\\dfrac12\\times\\)底面周長\\(\\times\\)斜高。'
        ],
        formula: { label: '正角錐側面積', tex: '\\text{側面積}=\\dfrac{1}{2}\\times\\text{底面周長}\\times\\text{斜高}' },
        visual: (h) => {
          h.innerHTML = (() => {
            let s = '';
            // 左：正四角錐
            const cx = 108, apex = [cx, 44];
            const A = [cx - 50, 156], B = [cx + 50, 156], C2 = [cx + 76, 132], D = [cx - 24, 132];
            s += `<polygon points="${A.join(',')} ${B.join(',')} ${C2.join(',')} ${D.join(',')}" fill="rgba(5,150,105,.16)" stroke="${C}" stroke-width="2"/>`;
            s += `<polygon points="${apex.join(',')} ${A.join(',')} ${B.join(',')}" fill="rgba(217,119,6,.14)" stroke="${AMB}" stroke-width="2"/>`;
            s += LN(apex, C2, '#657187', 1.8) + LN(apex, D, '#9aa4b6', 1.6, '5 4');
            const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
            s += LN(apex, mid, RED, 2.2, '4 3');
            s += TX(cx + 8, 106, '斜高', { fs: 11.5, c: RED });
            s += TX(cx, 184, '正四角錐', { fs: 12.5, c: '#657187', anchor: 'middle' });
            // 右：展開圖
            const ox = 314, oy = 116, hw = 30;
            s += `<rect x="${ox - hw}" y="${oy - hw}" width="${hw * 2}" height="${hw * 2}" fill="rgba(5,150,105,.18)" stroke="${C}" stroke-width="2"/>`;
            const tri = (x1, y1, x2, y2, x3, y3) =>
              `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="rgba(217,119,6,.16)" stroke="${AMB}" stroke-width="1.8"/>`;
            s += tri(ox - hw, oy - hw, ox + hw, oy - hw, ox, oy - hw - 40);
            s += tri(ox - hw, oy + hw, ox + hw, oy + hw, ox, oy + hw + 40);
            s += tri(ox - hw, oy - hw, ox - hw, oy + hw, ox - hw - 40, oy);
            s += tri(ox + hw, oy - hw, ox + hw, oy + hw, ox + hw + 40, oy);
            s += TX(ox, oy + 5, '底面', { fs: 11.5, c: C, anchor: 'middle' });
            s += TX(ox, oy - hw - 48, '4 個全等等腰三角形', { fs: 11.5, c: AMB, anchor: 'middle' });
            s += BOX(24, 200, 400, 44, { fill: '#f6f8fc' });
            s += TX(224, 227, '側面積 ＝ ½ × 底面周長 × 斜高', { fs: 14, c: C, anchor: 'middle' });
            return svg('0 0 448 256', s);
          })();
        },
        caption: '正角錐的側面全部<b>全等</b>，所以算一個三角形再乘以邊數也可以。',
        example: {
          q: '正四角錐底面邊長 \\(6\\)、斜高 \\(5\\)，側面積是多少？',
          steps: ['底面周長 \\(=4\\times6=24\\)。', '側面積 \\(=\\dfrac12\\times24\\times5\\)。'],
          ans: '\\(60\\)'
        }
      },

      {
        sec: '3-2', secName: '表面積與體積',
        title: '易錯：母線／斜高／高分不清，柱與錐公式混用',
        points: [
          '圓錐側面積用<b>母線 \\(l\\)</b>、角錐側面積用<b>斜高</b>——都<b>不是</b>立體的高。',
          '柱體體積才是「<b>底面積 × 高</b>」；本章<b>只要求柱體的體積</b>。',
          '表面積要記得<b>加底面</b>；只算側面是最常見的失分。'
        ],
        visual: (h) => {
          const row = (bad, good) => `<div style="display:flex;gap:8px;align-items:stretch;margin-bottom:10px">
            <div style="flex:1;background:#fdeef2;border:1.5px solid #f3c4d0;border-radius:12px;padding:9px 12px">
              <div style="font-size:11.5px;font-weight:900;color:${RED};margin-bottom:3px">✗ 常見錯誤</div>
              <div style="font-size:14px;line-height:1.6">${bad}</div></div>
            <div style="flex:1;background:#eef7f2;border:1.5px solid #bfe0d1;border-radius:12px;padding:9px 12px">
              <div style="font-size:11.5px;font-weight:900;color:${GRN};margin-bottom:3px">✓ 正確</div>
              <div style="font-size:14px;line-height:1.6">${good}</div></div></div>`;
          h.innerHTML = `<div style="width:97%;margin:0 auto">
            ${row('圓錐側面積 \\(=\\pi r h\\)', '\\(=\\pi r l\\)，\\(l\\) 是<b>母線</b>')}
            ${row('直接把高當母線代進去', '先用 \\(l=\\sqrt{r^{2}+h^{2}}\\) 求母線')}
            ${row('算完側面積就當表面積', '表面積<b>還要加底面</b>')}
            ${row('角錐側面積用角錐的高', '要用<b>斜高</b>（側面三角形的高）')}
          </div>`;
          MJ(h);
        },
        caption: '看到「側面積」先問自己：<b>該用母線、斜高，還是柱高？</b>',
        example: {
          q: '直圓錐底面半徑 \\(6\\)、高 \\(8\\)，求<b>表面積</b>。',
          steps: ['母線 \\(l=\\sqrt{6^{2}+8^{2}}=10\\)。', '側面積 \\(=\\pi\\times6\\times10=60\\pi\\)。', '底面積 \\(=\\pi\\times6^{2}=36\\pi\\)，相加。'],
          ans: '\\(96\\pi\\)'
        }
      }

    ]
  });
})();
