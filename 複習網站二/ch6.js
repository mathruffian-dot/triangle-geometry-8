/* ============ 第 6 章　生活中的幾何 ============
   依康軒版第 2 冊（七下）：6-1 簡單幾何圖形、6-2 線對稱、6-3 三視圖
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#0891b2';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }
  const txt = (x, y, s, color = '#172033', fs = 13, anchor = 'middle') =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${fs}" font-weight="800" fill="${color}">${s}</text>`;

  /* ---- 等角投影：小正方體堆疊（觀察者站在「右前上方」）----
     i 向右、j 向前（j 越大越靠近觀察者）、k 向上；
     因此看得到的是 前面(+j，畫在左下)、右面(+i，畫在右下)、上面(+k) 三個面。 */
  const ISO = (ox, oy, W, Hh, Hz) => (i, j, k) => [ox + (i - j) * W, oy + (i + j) * Hh - k * Hz];
  function isoCube(P, i, j, k) {
    const p = (a, b, c) => P(a, b, c).map(v => v.toFixed(1)).join(',');
    const top = `${p(i, j, k + 1)} ${p(i + 1, j, k + 1)} ${p(i + 1, j + 1, k + 1)} ${p(i, j + 1, k + 1)}`;
    const fr = `${p(i, j + 1, k)} ${p(i + 1, j + 1, k)} ${p(i + 1, j + 1, k + 1)} ${p(i, j + 1, k + 1)}`;
    const rt = `${p(i + 1, j, k)} ${p(i + 1, j + 1, k)} ${p(i + 1, j + 1, k + 1)} ${p(i + 1, j, k + 1)}`;
    const st = `stroke="#0e7490" stroke-width="1.6" stroke-linejoin="round"`;
    return `<polygon points="${fr}" fill="#c9edf6" ${st}/><polygon points="${rt}" fill="#93d8e8" ${st}/><polygon points="${top}" fill="#eafaff" ${st}/>`;
  }
  // 畫家演算法：越靠近觀察者（i+j 越大、k 越高）越後畫，才不會被後面的方塊蓋住
  function isoStack(cubes, P) {
    const key = c => c[0] + c[1] + 0.9 * c[2];
    return cubes.slice().sort((a, b) => key(a) - key(b))
      .map(c => isoCube(P, c[0], c[1], c[2])).join('');
  }
  // hs[j][i] = 該位置的高度（hs[0] 為前排；內部轉成「j 越大越前面」）
  function stackFrom(hs) {
    const out = [], R = hs.length;
    hs.forEach((row, j) => row.forEach((n, i) => { for (let k = 0; k < n; k++) out.push([i, R - 1 - j, k]); }));
    return out;
  }
  // 視圖方格：cells=[[col, rowFromBottom]]
  function vgrid(x0, y0, rows, cells, cs, color, fill) {
    return cells.map(([c, r]) =>
      `<rect x="${x0 + c * cs}" y="${y0 + (rows - 1 - r) * cs}" width="${cs}" height="${cs}" fill="${fill}" stroke="${color}" stroke-width="2"/>`).join('');
  }
  const fullCells = (w, hgt) => { const a = []; for (let c = 0; c < w; c++) for (let r = 0; r < hgt; r++) a.push([c, r]); return a; };

  window.DECK.push({
    ch: 6,
    title: '生活中的幾何',
    color: C,
    sections: ['6-1 簡單幾何圖形', '6-2 線對稱', '6-3 三視圖'],
    slides: [

      /* ---------- 6-1 簡單幾何圖形 ---------- */
      {
        sec: '6-1', secName: '簡單幾何圖形',
        title: '直線、線段、射線：符號一改，圖形就不同',
        points: [
          '<span class="k">直線</span> \\(\\overleftrightarrow{AB}\\)：兩端都<b>無限延伸</b>，量不出長度。',
          '<span class="k">線段</span> \\(\\overline{AB}\\)：有<b>兩個端點</b>，只有它能量長度、能比大小。',
          '<span class="k">射線</span> \\(\\overrightarrow{AB}\\)：以 \\(A\\) 為<b>端點</b>往 \\(B\\) 的方向延伸，所以 \\(\\overrightarrow{AB}\\ne\\overrightarrow{BA}\\)。'
        ],
        formula: { label: '三個符號', tex: '\\overleftrightarrow{AB}\\;(\\text{直線})\\quad\\overline{AB}\\;(\\text{線段})\\quad\\overrightarrow{AB}\\;(\\text{射線})' },
        visual: (h) => {
          const dd = `<defs>
            <marker id="c6a1" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#5b6478"/></marker>
            <marker id="c6a2" markerWidth="10" markerHeight="10" refX="1" refY="5" orient="auto"><path d="M10,0 L0,5 L10,10 Z" fill="#5b6478"/></marker>
            <marker id="c6a3" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="${AMB}"/></marker>
          </defs>`;
          const ax = 130, bx = 250;
          let s = dd;
          s += `<line x1="42" y1="62" x2="398" y2="62" stroke="#5b6478" stroke-width="3" marker-start="url(#c6a2)" marker-end="url(#c6a1)"/>`;
          s += SV.dot(ax, 62, '#172033', 5) + SV.dot(bx, 62, '#172033', 5);
          s += SV.vlabel(ax - 5, 48, 'A') + SV.vlabel(bx - 5, 48, 'B');
          s += txt(220, 94, '直線 AB：兩端無限延伸，沒有長度', '#5b6478', 13);
          s += SV.seg(ax, 152, bx, 152, C, 6);
          s += SV.dot(ax, 152, '#172033', 5) + SV.dot(bx, 152, '#172033', 5);
          s += SV.vlabel(ax - 5, 138, 'A') + SV.vlabel(bx - 5, 138, 'B');
          s += txt(220, 184, '線段 AB：兩個端點，只有它能量長度', C, 13);
          s += `<line x1="${ax}" y1="242" x2="398" y2="242" stroke="${AMB}" stroke-width="3" marker-end="url(#c6a3)"/>`;
          s += SV.dot(ax, 242, '#172033', 5) + SV.dot(bx, 242, '#172033', 5);
          s += SV.vlabel(ax - 5, 228, 'A') + SV.vlabel(bx - 5, 228, 'B');
          s += txt(220, 274, '射線 AB：端點是 A，往 B 的方向延伸', AMB, 13);
          s += txt(220, 300, '把 A、B 對調，就換成另一條射線了！', RED, 13);
          h.innerHTML = svg('0 0 440 312', s);
        },
        caption: '同樣是 \\(A\\)、\\(B\\) 兩點，符號不同畫出來的圖就不同——先看符號再動筆。',
        example: {
          q: '\\(\\overrightarrow{AB}\\) 與 \\(\\overrightarrow{BA}\\) 是同一條射線嗎？\\(\\overline{AB}\\) 與 \\(\\overline{BA}\\) 呢？',
          steps: ['射線看<b>端點</b>：\\(\\overrightarrow{AB}\\) 端點是 \\(A\\)，\\(\\overrightarrow{BA}\\) 端點是 \\(B\\)，方向相反。', '線段只看兩個端點，順序不影響。'],
          ans: '射線不同；線段相同'
        }
      },

      {
        sec: '6-1', secName: '簡單幾何圖形',
        title: '中點：把線段切成等長的兩段',
        points: [
          '\\(M\\) 是 \\(\\overline{AB}\\) 的<span class="k">中點</span> \\(\\Longleftrightarrow\\overline{AM}=\\overline{MB}=\\dfrac12\\overline{AB}\\)。',
          '\\(P\\) 在線段上時，長度可以<b>相加減</b>：\\(\\overline{AB}=\\overline{AP}+\\overline{PB}\\)。',
          '拖滑桿移動 \\(P\\)，只有走到<b>正中間</b>那一刻兩段才等長。'
        ],
        formula: { label: '中點', tex: '\\overline{AM}=\\overline{MB}=\\tfrac12\\,\\overline{AB}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="mid"></div>
            <div class="ictrl"><label>\\(\\overline{AP}\\) 的長度 <span class="ival" id="mv">4</span></label>
            <input type="range" id="ms" min="1" max="11" step="1" value="4"></div></div>`;
          const x0 = 55, x1 = 385, y = 128, L = 12;
          const draw = () => {
            const t = +h.querySelector('#ms').value;
            h.querySelector('#mv').textContent = t;
            const px = x0 + (x1 - x0) * t / L;
            let s = '';
            for (let i = 0; i <= L; i++) { const x = x0 + (x1 - x0) * i / L; s += SV.seg(x, y - 8, x, y + 8, '#dbe2ec', 1.6); }
            s += SV.seg(x0, y, px, y, BLU, 8) + SV.seg(px, y, x1, y, AMB, 8);
            s += SV.dot(x0, y, '#172033', 6) + SV.dot(x1, y, '#172033', 6) + SV.dot(px, y, RED, 6.5);
            s += SV.vlabel(x0 - 6, y - 24, 'A') + SV.vlabel(x1 - 6, y - 24, 'B') + SV.vlabel(px - 6, y - 24, 'P', RED);
            s += txt(220, 58, 'AB = 12', '#172033', 15);
            s += txt((x0 + px) / 2, y + 32, 'AP = ' + t, BLU, 14);
            s += txt((px + x1) / 2, y + 32, 'PB = ' + (L - t), AMB, 14);
            s += (t === 6) ? txt(220, 200, 'AP = PB ✓　P 正好是中點 M', GRN, 15)
              : txt(220, 200, 'AP ≠ PB，P 還不是中點', '#657187', 14);
            h.querySelector('#mid').innerHTML = svg('0 0 440 226', s);
          };
          h.querySelector('#ms').oninput = draw; draw();
        },
        caption: '中點是「兩段等長」的那一點，會考常拿它做線段長的加減。',
        example: {
          q: '\\(\\overline{AB}=12\\)，\\(M\\) 為 \\(\\overline{AB}\\) 中點，\\(N\\) 為 \\(\\overline{AM}\\) 中點，求 \\(\\overline{NB}\\)。',
          steps: ['\\(\\overline{AM}=\\tfrac12\\times12=6\\)。', '\\(N\\) 為 \\(\\overline{AM}\\) 中點 \\(\\Rightarrow\\overline{AN}=3\\)。', '\\(\\overline{NB}=12-3\\)。'],
          ans: '\\(\\overline{NB}=9\\)'
        }
      },

      {
        sec: '6-1', secName: '簡單幾何圖形',
        title: '角：中間的字母才是頂點',
        points: [
          '角由<b>一個頂點</b>與<b>兩條邊</b>組成；\\(\\angle ABC\\) 的頂點是<b>中間</b>的 \\(B\\)。',
          '一個頂點若有好幾個角，<b>不能只寫 \\(\\angle B\\)</b>，要寫三個字母才不會弄錯。',
          '分類：<b>銳角</b> \\(<90^\\circ\\)、<b>直角</b> \\(=90^\\circ\\)、<b>鈍角</b> 介於 \\(90^\\circ\\) 與 \\(180^\\circ\\)、<b>平角</b> \\(=180^\\circ\\)。'
        ],
        formula: { label: '角的分類', tex: '0^\\circ<\\text{銳角}<90^\\circ(\\text{直角})<\\text{鈍角}<180^\\circ(\\text{平角})' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="ang"></div>
            <div class="ictrl"><label>\\(\\angle ABC\\) ＝ <span class="ival" id="av">55</span>°</label>
            <input type="range" id="as" min="10" max="180" step="5" value="55"></div></div>`;
          const B = [230, 230], R = 170;
          const draw = () => {
            const d = +h.querySelector('#as').value;
            h.querySelector('#av').textContent = d;
            const Cc = SV.pt(B[0], B[1], R, 0), A = SV.pt(B[0], B[1], R, d);
            let kind = '銳角', col = GRN;
            if (d === 90) { kind = '直角'; col = BLU; }
            else if (d === 180) { kind = '平角'; col = VIO; }
            else if (d > 90) { kind = '鈍角'; col = AMB; }
            let s = SV.seg(B[0], B[1], Cc[0], Cc[1], '#334', 3.2);
            s += SV.seg(B[0], B[1], A[0], A[1], '#334', 3.2);
            s += (d === 90) ? SV.rightAngle(B[0], B[1], 0, 90, 24, col)
              : SV.angle(B[0], B[1], 44, 0, d, col, d + '°', { w: 3, fs: 14, lr: 22 });
            s += SV.dot(B[0], B[1], '#172033', 5.5) + SV.vlabel(B[0] - 8, B[1] + 26, 'B');
            s += SV.vlabel(Cc[0] + 6, Cc[1] + 6, 'C') + SV.vlabel(A[0] + (d > 100 ? -24 : 8), A[1] - 6, 'A');
            s += txt(220, 34, '∠ABC = ' + d + '°　→　' + kind, col, 17);
            h.querySelector('#ang').innerHTML = svg('0 0 440 266', s);
          };
          h.querySelector('#as').oninput = draw; draw();
        },
        caption: '拖滑桿看角度跨過 \\(90^\\circ\\) 與 \\(180^\\circ\\) 時，名稱怎麼換。',
        example: {
          q: '\\(D\\) 在 \\(\\angle ABC\\) 內部，\\(\\angle ABD=35^\\circ\\)、\\(\\angle DBC=70^\\circ\\)，則 \\(\\angle ABC\\) 是什麼角？',
          steps: ['\\(\\angle ABC=35^\\circ+70^\\circ=105^\\circ\\)。', '\\(105^\\circ\\) 介於 \\(90^\\circ\\) 與 \\(180^\\circ\\) 之間。'],
          ans: '鈍角（\\(105^\\circ\\)）'
        }
      },

      {
        sec: '6-1', secName: '簡單幾何圖形',
        title: '點到直線的距離＝垂線段的長',
        points: [
          '兩直線相交成 \\(90^\\circ\\) 就是<span class="k">垂直</span>，記作 \\(\\overline{AB}\\perp\\overline{CD}\\)。',
          '由 \\(P\\) 向直線 \\(L\\) 作<b>垂線段</b> \\(\\overline{PH}\\)，\\(H\\) 叫<b>垂足</b>。',
          '<b>點到直線的距離就是 \\(\\overline{PH}\\)</b>：所有連到 \\(L\\) 的線段中，垂線段<b>最短</b>。'
        ],
        formula: { label: '垂線段最短', tex: '\\overline{PH}\\perp L\\;\\Rightarrow\\;\\overline{PH}\\le\\overline{PQ}\\quad(Q\\ \\text{在}\\ L\\ \\text{上})' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="dst"></div>
            <div class="ictrl"><label>\\(\\overline{PQ}\\) 的長 <span class="ival" id="qv">6.1</span></label>
            <input type="range" id="qs" min="60" max="405" step="5" value="365"></div></div>`;
          const yL = 234, P = [225, 69], U = 33;
          const draw = () => {
            const qx = +h.querySelector('#qs').value;
            const len = Math.hypot(qx - P[0], yL - P[1]) / U;
            h.querySelector('#qv').textContent = len.toFixed(1);
            let s = SV.seg(30, yL, 415, yL, '#5b6478', 3);
            s += txt(404, yL + 24, 'L', '#5b6478', 15);
            s += SV.seg(P[0], P[1], qx, yL, RED, 2.6, '6 5');
            s += SV.seg(P[0], P[1], P[0], yL, GRN, 3.4);
            s += SV.rightAngle(P[0], yL, 90, 180, 13, GRN);
            s += SV.dot(P[0], P[1], '#172033', 5.5) + SV.vlabel(P[0] - 6, P[1] - 12, 'P');
            s += SV.dot(P[0], yL, GRN, 5) + SV.vlabel(P[0] - 26, yL + 22, 'H', GRN);
            s += SV.dot(qx, yL, RED, 5) + SV.vlabel(qx - 5, yL + 22, 'Q', RED);
            s += txt(P[0] - 34, (P[1] + yL) / 2, 'PH = 5', GRN, 13);
            s += txt(340, 58, 'PQ = ' + len.toFixed(1), RED, 14);
            s += (Math.abs(qx - P[0]) < 6) ? txt(220, 26, 'Q 走到垂足 H → 這時最短！', GRN, 15)
              : txt(220, 26, '斜的線段永遠比垂線段長', '#657187', 14);
            h.querySelector('#dst').innerHTML = svg('0 0 440 272', s);
          };
          h.querySelector('#qs').oninput = draw; draw();
        },
        caption: '拖 \\(Q\\) 走遍整條 \\(L\\)，\\(\\overline{PQ}\\) 的最小值就出現在垂足 \\(H\\)。',
        example: {
          q: '\\(\\overline{PH}\\perp L\\) 於 \\(H\\)，\\(\\overline{PH}=5\\)，另有 \\(A\\) 在 \\(L\\) 上且 \\(\\overline{PA}=13\\)。點 \\(P\\) 到 \\(L\\) 的距離是多少？',
          steps: ['距離只認<b>垂線段</b>，就是 \\(\\overline{PH}\\)。', '\\(\\overline{PA}=13\\) 是斜線段，不是距離。'],
          ans: '距離 \\(=5\\)'
        }
      },

      {
        sec: '6-1', secName: '簡單幾何圖形',
        title: '中垂線：到兩端等距的點全在上面',
        points: [
          '<span class="k">中垂線</span>（垂直平分線）＝<b>通過中點</b>又<b>與線段垂直</b>的直線，兩個條件缺一不可。',
          '性質：中垂線上<b>任何一點</b>到兩端點等距，\\(\\overline{PA}=\\overline{PB}\\)。',
          '逆敘述也成立：只要 \\(\\overline{PA}=\\overline{PB}\\)，\\(P\\) 一定落在 \\(\\overline{AB}\\) 的中垂線上。',
          '生活題翻譯：「到兩地距離相等的位置」＝兩地連線的<b>中垂線</b>。'
        ],
        formula: { label: '中垂線性質', tex: 'P\\ \\text{在}\\ \\overline{AB}\\ \\text{的中垂線上}\\iff\\overline{PA}=\\overline{PB}' },
        visual: (h) => {
          const A = [108, 198], B = [332, 198], M = [220, 198];
          const P1 = [220, 90], P2 = [220, 284];
          SV.stepper(h, '0 0 440 318', [
            {
              t: '畫出線段 AB，找出中點 M（AM ＝ MB）。',
              d: () => SV.seg(A[0], A[1], B[0], B[1], '#334', 3.4) +
                SV.ticks(A[0], A[1], M[0], M[1], 1, VIO) + SV.ticks(M[0], M[1], B[0], B[1], 1, VIO) +
                SV.dot(A[0], A[1], '#172033', 5) + SV.dot(B[0], B[1], '#172033', 5) + SV.dot(M[0], M[1], VIO, 5) +
                SV.vlabel(A[0] - 22, A[1] + 6, 'A') + SV.vlabel(B[0] + 8, B[1] + 6, 'B') + SV.vlabel(M[0] - 6, M[1] + 26, 'M', VIO)
            },
            {
              t: '過 M 作一條垂直 AB 的直線 —— 這就是中垂線。',
              d: () => SV.seg(220, 44, 220, 304, C, 2.6, '8 6') + SV.rightAngle(M[0], M[1], 0, 90, 15, C) + txt(310, 60, '中垂線', C, 14)
            },
            {
              t: '在中垂線上任取一點 P，PA 與 PB 一定等長。',
              d: () => SV.seg(P1[0], P1[1], A[0], A[1], RED, 2.6) + SV.seg(P1[0], P1[1], B[0], B[1], RED, 2.6) +
                SV.ticks(P1[0], P1[1], A[0], A[1], 2, RED) + SV.ticks(P1[0], P1[1], B[0], B[1], 2, RED) +
                SV.dot(P1[0], P1[1], RED, 5) + SV.vlabel(P1[0] + 10, P1[1] - 4, 'P', RED)
            },
            {
              t: '反過來也對：只要 QA ＝ QB，這個點就落在中垂線上。',
              d: () => SV.seg(P2[0], P2[1], A[0], A[1], GRN, 2.4) + SV.seg(P2[0], P2[1], B[0], B[1], GRN, 2.4) +
                SV.ticks(P2[0], P2[1], A[0], A[1], 3, GRN) + SV.ticks(P2[0], P2[1], B[0], B[1], 3, GRN) +
                SV.dot(P2[0], P2[1], GRN, 5) + SV.vlabel(P2[0] + 10, P2[1] + 6, 'Q', GRN) +
                txt(220, 26, '到 A、B 等距的點，全都在中垂線上', GRN, 14)
            }
          ]);
        },
        caption: '中垂線＝「到兩端等距」的所有點集合，正反兩個方向都能用。',
        example: {
          q: '\\(P\\) 在 \\(\\overline{AB}\\) 的中垂線上，\\(\\overline{PA}=3x-1\\)、\\(\\overline{PB}=x+7\\)，求 \\(x\\)。',
          steps: ['中垂線上的點到兩端等距：\\(3x-1=x+7\\)。', '\\(2x=8\\)。'],
          ans: '\\(x=4\\)'
        }
      },

      {
        sec: '6-1', secName: '簡單幾何圖形',
        title: '6-1 易錯：這四個地方最常被扣分',
        points: [
          '✗ 把 \\(\\overrightarrow{AB}\\) 與 \\(\\overrightarrow{BA}\\) 當成同一條；✓ 射線<b>先看端點</b>寫在前面。',
          '✗ 一個頂點好幾個角還只寫 \\(\\angle B\\)；✓ 寫<b>三個字母</b> \\(\\angle ABD\\)、\\(\\angle DBC\\)。',
          '✗ 拿斜線段當點到直線的距離；✓ <b>只認垂線段</b>。',
          '✗ 中垂線只記得「垂直」；✓ 還必須<b>通過中點</b>，兩個條件都要。'
        ],
        visual: (h) => {
          let s = `<defs>
            <marker id="c6e1" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="${AMB}"/></marker>
            <marker id="c6e2" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="${VIO}"/></marker>
          </defs>`;
          s += `<line x1="55" y1="46" x2="205" y2="46" stroke="${AMB}" stroke-width="3" marker-end="url(#c6e1)"/>`;
          s += SV.dot(55, 46, '#172033', 5) + SV.vlabel(48, 32, 'A', '#172033', 14) + SV.dot(150, 46, '#172033', 4.5) + SV.vlabel(144, 32, 'B', '#172033', 14);
          s += txt(216, 51, '射線 AB', AMB, 13, 'start');
          s += `<line x1="150" y1="90" x2="16" y2="90" stroke="${VIO}" stroke-width="3" marker-end="url(#c6e2)"/>`;
          s += SV.dot(55, 90, '#172033', 4.5) + SV.vlabel(48, 112, 'A', '#172033', 14) + SV.dot(150, 90, '#172033', 5) + SV.vlabel(144, 112, 'B', '#172033', 14);
          s += txt(216, 95, '射線 BA（方向相反）', VIO, 13, 'start');
          const V = [108, 200];
          const pA = SV.pt(V[0], V[1], 70, 118), pD = SV.pt(V[0], V[1], 74, 62), pC = SV.pt(V[0], V[1], 84, 8);
          s += SV.seg(V[0], V[1], pA[0], pA[1], '#334', 2.6) + SV.seg(V[0], V[1], pD[0], pD[1], '#334', 2.6) + SV.seg(V[0], V[1], pC[0], pC[1], '#334', 2.6);
          s += SV.angle(V[0], V[1], 30, 62, 118, BLU, '', { w: 2.6 }) + SV.angle(V[0], V[1], 50, 8, 62, GRN, '', { w: 2.6 });
          s += SV.dot(V[0], V[1], '#172033', 4.5) + SV.vlabel(V[0] - 18, V[1] + 18, 'B', '#172033', 14);
          s += SV.vlabel(pA[0] - 18, pA[1] - 4, 'A', '#172033', 14) + SV.vlabel(pD[0] + 4, pD[1] - 6, 'D', '#172033', 14) + SV.vlabel(pC[0] + 4, pC[1] + 8, 'C', '#172033', 14);
          s += txt(240, 172, '✗ 只寫 ∠B：到底是哪一個？', RED, 13, 'start');
          s += txt(240, 196, '✓ 寫 ∠ABD、∠DBC', GRN, 13, 'start');
          const yL = 300, P = [110, 244];
          s += SV.seg(40, yL, 228, yL, '#5b6478', 2.6) + txt(236, yL + 5, 'L', '#5b6478', 14, 'start');
          s += SV.seg(P[0], P[1], 200, yL, RED, 2.4, '5 4');
          s += SV.seg(P[0], P[1], P[0], yL, GRN, 3) + SV.rightAngle(P[0], yL, 90, 180, 11, GRN);
          s += SV.dot(P[0], P[1], '#172033', 5) + SV.vlabel(P[0] - 6, P[1] - 10, 'P', '#172033', 14);
          s += txt(240, 264, '✓ 綠色垂線段＝距離', GRN, 13, 'start');
          s += txt(240, 290, '✗ 紅色斜線段不是', RED, 13, 'start');
          h.innerHTML = svg('0 0 440 318', s);
        },
        caption: '三張小圖分別對應三個常見的失分點：射線方向、角的記法、距離的定義。',
        example: {
          q: '\\(M\\) 是 \\(\\overline{AB}\\) 的中點且 \\(\\overline{PM}\\perp\\overline{AB}\\)，已知 \\(\\overline{PA}=7\\)，求 \\(\\overline{PB}\\)。',
          steps: ['\\(\\overleftrightarrow{PM}\\) 同時「過中點」又「垂直」\\(\\Rightarrow\\) 是 \\(\\overline{AB}\\) 的中垂線。', '中垂線上的點到兩端等距。'],
          ans: '\\(\\overline{PB}=7\\)'
        }
      },

      /* ---------- 6-2 線對稱 ---------- */
      {
        sec: '6-2', secName: '線對稱',
        title: '線對稱：對摺之後要「完全疊合」',
        points: [
          '沿一條直線<b>對摺</b>後兩側能<b>完全疊合</b>，就是<span class="k">線對稱圖形</span>，那條直線叫<span class="k">對稱軸</span>。',
          '重點在「疊合」，不是「看起來很像」——要真的一模一樣蓋住。',
          '一個圖形的對稱軸可能有 <b>0 條、1 條或很多條</b>；拖滑桿把右半邊摺過去試試看。'
        ],
        formula: { label: '線對稱', tex: '\\text{沿對稱軸對摺}\\;\\Longrightarrow\\;\\text{兩側完全疊合}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fold"></div>
            <div class="ictrl"><label>對摺進度 <span class="ival" id="fv">0%</span></label>
            <input type="range" id="fs" min="0" max="1" step="0.02" value="0"></div></div>`;
          const AX = 220;
          const Lp = [[220, 56], [150, 122], [172, 122], [172, 236], [220, 236]];
          const Rp = Lp.map(p => [2 * AX - p[0], p[1]]);
          const draw = () => {
            const t = +h.querySelector('#fs').value;
            h.querySelector('#fv').textContent = Math.round(t * 100) + '%';
            const cur = Rp.map(p => [AX + (p[0] - AX) * (1 - 2 * t), p[1]]);
            let s = SV.seg(AX, 30, AX, 262, '#7c8797', 2, '7 6') + txt(AX, 22, '對稱軸', '#7c8797', 12);
            s += SV.poly(Lp, 'rgba(8,145,178,0.18)', C, 2.4);
            s += SV.poly(cur, 'rgba(217,119,6,0.32)', AMB, 2.4);
            s += (t > 0.96) ? txt(220, 288, '兩側完全疊合 ✓ 是線對稱圖形', GRN, 15)
              : txt(220, 288, '把右半邊沿著對稱軸摺過去', '#657187', 13);
            h.querySelector('#fold').innerHTML = svg('0 0 440 300', s);
          };
          h.querySelector('#fs').oninput = draw; draw();
        },
        caption: '摺到 100% 時橘色完全蓋住藍色，這才叫線對稱。',
        example: {
          q: '英文字母 A、B、H、N 之中，哪些是線對稱圖形？',
          steps: ['A 有一條鉛直對稱軸；B 有一條水平對稱軸；H 兩條都有。', 'N 要轉半圈才重合，對摺不會疊合。'],
          ans: 'A、B、H（N 不是）'
        }
      },

      {
        sec: '6-2', secName: '線對稱',
        title: '線對稱的兩個性質：等長、等角、被平分',
        points: [
          '對應線段<b>等長</b>、對應角<b>相等</b>——摺過去的圖形大小完全一樣。',
          '<b>對稱軸是任兩個對應點連線段的中垂線</b>：連線<b>垂直</b>對稱軸，而且被<b>平分</b>。',
          '所以一組對應點到對稱軸的<b>距離相等</b>，求邊長、角度就靠這兩條。'
        ],
        formula: { label: '關鍵性質', tex: 'L\\perp\\overline{AA\'}\\ \\text{且}\\ L\\ \\text{平分}\\ \\overline{AA\'}' },
        visual: (h) => {
          const AX = 220;
          const A = [150, 66], B = [96, 212], Cc = [178, 174];
          const mir = p => [2 * AX - p[0], p[1]];
          const A2 = mir(A), B2 = mir(B), C2 = mir(Cc);
          let s = SV.seg(AX, 32, AX, 266, '#7c8797', 2, '7 6') + txt(AX, 24, '對稱軸 L', '#7c8797', 12);
          s += SV.poly([A, B, Cc], 'rgba(8,145,178,0.12)', C, 2.6);
          s += SV.poly([A2, B2, C2], 'rgba(217,119,6,0.12)', AMB, 2.6);
          [[A, A2], [B, B2]].forEach(([p, q]) => {
            s += SV.seg(p[0], p[1], q[0], q[1], RED, 1.8, '5 4');
            s += SV.ticks(p[0], p[1], AX, p[1], 2, RED, 6) + SV.ticks(AX, p[1], q[0], q[1], 2, RED, 6);
            s += SV.rightAngle(AX, p[1], 0, 90, 10, RED);
          });
          s += SV.vlabel(A[0] - 18, A[1] - 6, 'A') + SV.vlabel(B[0] - 22, B[1] + 8, 'B') + SV.vlabel(Cc[0] - 20, Cc[1] + 4, 'C');
          s += SV.vlabel(A2[0] + 6, A2[1] - 6, "A'") + SV.vlabel(B2[0] + 8, B2[1] + 8, "B'") + SV.vlabel(C2[0] + 6, C2[1] + 4, "C'");
          s += txt(220, 292, '對應點連線 ⊥ 對稱軸，且被對稱軸平分', RED, 13);
          h.innerHTML = svg('0 0 440 306', s);
        },
        caption: '\\(\\overline{AA\'}\\)、\\(\\overline{BB\'}\\) 都被對稱軸垂直平分——這正是 6-1 學過的中垂線。',
        example: {
          q: '\\(\\triangle ABC\\) 與 \\(\\triangle A\'B\'C\'\\) 對稱於直線 \\(L\\)，\\(\\overline{AB}=8\\)、\\(\\angle B=50^\\circ\\)，求 \\(\\overline{A\'B\'}\\) 與 \\(\\angle B\'\\)。',
          steps: ['對應線段等長 \\(\\Rightarrow\\overline{A\'B\'}=\\overline{AB}\\)。', '對應角相等 \\(\\Rightarrow\\angle B\'=\\angle B\\)。'],
          ans: '\\(\\overline{A\'B\'}=8\\)、\\(\\angle B\'=50^\\circ\\)'
        }
      },

      {
        sec: '6-2', secName: '線對稱',
        title: '常見圖形各有幾條對稱軸',
        points: [
          '<b>正 \\(n\\) 邊形有 \\(n\\) 條</b>對稱軸；<b>圓</b>有<b>無限多</b>條（每條直徑所在的直線）。',
          '三角形：一般 0 條、等腰 1 條、正三角形 3 條。',
          '四邊形：正方形 4 條、長方形 2 條、菱形 2 條、箏形 1 條、等腰梯形 1 條、<b>平行四邊形 0 條</b>。'
        ],
        formula: { label: '正多邊形', tex: '\\text{正 }n\\text{ 邊形恰有 }n\\text{ 條對稱軸}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="pn"></div>
            <div class="ictrl"><label>正 n 邊形　n ＝ <span class="ival" id="nv">5</span></label>
            <input type="range" id="ns" min="3" max="10" step="1" value="5"></div></div>`;
          const cx = 220, cy = 148, R = 100;
          const draw = () => {
            const n = +h.querySelector('#ns').value;
            h.querySelector('#nv').textContent = n;
            const V = [];
            for (let i = 0; i < n; i++) V.push(SV.pt(cx, cy, R, 90 + i * 360 / n));
            let s = '';
            for (let k = 0; k < n; k++) {
              const a = SV.pt(cx, cy, R * 1.18, 90 + k * 180 / n);
              const b = SV.pt(cx, cy, R * 1.18, 90 + k * 180 / n + 180);
              s += SV.seg(a[0], a[1], b[0], b[1], RED, 1.6, '6 5');
            }
            s += SV.poly(V, 'rgba(8,145,178,0.12)', C, 2.8);
            s += txt(220, 288, '正 ' + n + ' 邊形 → ' + n + ' 條對稱軸', C, 16);
            h.querySelector('#pn').innerHTML = svg('0 0 440 300', s);
          };
          h.querySelector('#ns').oninput = draw; draw();
        },
        caption: '拖滑桿加邊數，紅色虛線就多一條——正 \\(n\\) 邊形永遠是 \\(n\\) 條。',
        example: {
          q: '正八邊形與圓各有幾條對稱軸？',
          steps: ['正 \\(n\\) 邊形有 \\(n\\) 條。', '圓的每一條直徑所在直線都是對稱軸。'],
          ans: '正八邊形 8 條；圓有無限多條'
        }
      },

      {
        sec: '6-2', secName: '線對稱',
        title: '6-2 易錯：對角線不是對稱軸',
        points: [
          '✗ 以為長方形的<b>對角線</b>是對稱軸；✓ 沿對角線摺會歪掉，長方形只有 <b>2 條</b>。',
          '✗ 把平行四邊形當成線對稱；✓ 它要<b>轉半圈</b>才重合，對稱軸 <b>0 條</b>。',
          '✗ 只想到左右對摺；✓ 對稱軸也可能是<b>水平</b>或<b>斜的</b>（如字母 B、D）。'
        ],
        visual: (h) => {
          let s = '';
          s += SV.poly([[42, 46], [186, 46], [186, 140], [42, 140]], 'rgba(8,145,178,0.08)', C, 2.4);
          s += SV.seg(114, 38, 114, 148, GRN, 2, '7 5') + SV.seg(34, 93, 194, 93, GRN, 2, '7 5');
          s += txt(114, 168, '✓ 長方形：2 條', GRN, 14);
          s += txt(114, 188, '（各過一組對邊中點）', '#657187', 12);
          s += SV.poly([[252, 46], [396, 46], [396, 140], [252, 140]], 'rgba(8,145,178,0.08)', C, 2.4);
          s += SV.seg(252, 46, 396, 140, RED, 2, '7 5') + SV.seg(252, 140, 396, 46, RED, 2, '7 5');
          s += txt(324, 168, '✗ 對角線不是對稱軸', RED, 14);
          s += txt(324, 188, '（摺過去角會歪掉）', '#657187', 12);
          s += SV.poly([[62, 288], [182, 288], [230, 222], [110, 222]], 'rgba(124,58,237,0.08)', VIO, 2.4);
          s += SV.seg(110, 222, 182, 288, RED, 2, '7 5') + SV.seg(62, 288, 230, 222, RED, 2, '7 5');
          s += txt(340, 248, '✗ 平行四邊形', RED, 15);
          s += txt(340, 270, '0 條對稱軸', RED, 14);
          s += txt(340, 292, '轉半圈才會重合', '#657187', 12);
          h.innerHTML = svg('0 0 440 306', s);
        },
        caption: '紅色虛線都不是對稱軸；判斷方法一律回到「摺起來會不會完全疊合」。',
        example: {
          q: '長方形（非正方形）與平行四邊形各有幾條對稱軸？',
          steps: ['長方形：各過一組對邊中點，共 2 條。', '平行四邊形：怎麼摺都無法疊合。'],
          ans: '長方形 2 條；平行四邊形 0 條'
        }
      },

      /* ---------- 6-3 三視圖 ---------- */
      {
        sec: '6-3', secName: '三視圖',
        title: '三視圖：從三個方向正對著看',
        points: [
          '<span class="k">三視圖</span>＝把立體分別從<b>正前方、正上方、右側</b>看到的<b>平面形狀</b>。',
          '每個方向都要<b>正對著看</b>，看到的是<b>平面形狀</b>，不是斜斜地看那種立體感。',
          '<b>前視圖</b>看左右與高低、<b>上視圖</b>看左右與前後、<b>右視圖</b>看前後與高低。'
        ],
        formula: { label: '三個方向', tex: '\\text{前視圖}\\;/\\;\\text{上視圖}\\;/\\;\\text{右視圖}' },
        visual: (h) => {
          const P = ISO(200, 170, 30, 16, 33);
          let s = isoStack([[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1]], P);
          s += `<defs><marker id="c6v11" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="${RED}"/></marker></defs>`;
          const arw = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${RED}" stroke-width="2.4" marker-end="url(#c6v11)"/>`;
          s += arw(200, 44, 200, 92) + txt(200, 32, '① 從正上方看 → 上視圖', RED, 13);
          s += arw(92, 248, 152, 216) + txt(6, 276, '② 從正前方看 → 前視圖', RED, 13, 'start');
          s += arw(322, 254, 252, 216) + txt(434, 276, '③ 從右邊看 → 右視圖', RED, 13, 'end');
          h.innerHTML = svg('0 0 440 288', s);
        },
        caption: '同一個堆疊體，三個方向看到的平面形狀通常不一樣。',
        example: {
          q: '把 2 個小正方體<b>左右並排</b>，前視圖與右視圖各是什麼形狀？',
          steps: ['正前方看：左右各一格 → 1 列 2 格的長方形。', '右邊看：右邊的方塊把左邊的擋住 → 只看到 1 個正方形。'],
          ans: '前視圖 1×2 長方形；右視圖 1 個正方形'
        }
      },

      {
        sec: '6-3', secName: '三視圖',
        title: '由堆疊圖畫出前、上、右三張視圖',
        points: [
          '畫視圖只畫<b>看得到的外輪廓</b>，被前面方塊擋住的部分<b>不另外畫線</b>。',
          '同一直行有高有低時，前視圖只留<b>最高的那個輪廓</b>。',
          '拖步驟滑桿，一次看懂三張圖各自是怎麼投影出來的。'
        ],
        formula: { label: '作圖原則', tex: '\\text{只畫外輪廓：看不到的不畫}' },
        visual: (h) => {
          const P = ISO(100, 179, 24, 13, 27);
          const cubes = stackFrom([[3, 1, 1], [3, 1, 1]]);
          const cs = 22;
          SV.stepper(h, '0 0 440 280', [
            {
              t: '先看清楚立體：前後各一排，左邊那疊 3 層、其餘 1 層。',
              d: () => isoStack(cubes, P)
            },
            {
              t: '前視圖：正前方看，每一直行只留最高的輪廓。',
              d: () => txt(265, 50, '前視圖', C, 13) +
                vgrid(232, 58, 3, [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]], cs, C, '#d8f2f8')
            },
            {
              t: '上視圖：正上方往下看，底面佔了哪些格子就畫哪些。',
              d: () => txt(373, 50, '上視圖', GRN, 13) +
                vgrid(340, 58, 2, fullCells(3, 2), cs, GRN, '#dcf2ea')
            },
            {
              t: '右視圖：從右邊看，前後方向變成視圖的左右。',
              d: () => txt(254, 160, '右視圖', AMB, 13) +
                vgrid(232, 168, 3, fullCells(2, 3), cs, AMB, '#fbeed8') +
                txt(300, 200, '（左＝前排、右＝後排）', '#657187', 11, 'start')
            }
          ]);
        },
        caption: '右視圖是滿滿的 2×3 長方形——因為前後兩排一樣高，正好示範「輪廓不等於方塊數」。',
        example: {
          q: '（如圖）這個堆疊體共用了幾個小正方體？它的前視圖有幾個小方格？',
          steps: ['前後兩排各 \\(3+1+1=5\\) 個，共 \\(5\\times2\\)。', '前視圖只看輪廓：底列 3 格＋左側再往上 2 格。'],
          ans: '10 個方塊；前視圖 5 格'
        }
      },

      {
        sec: '6-3', secName: '三視圖',
        title: '由三視圖反推：最少幾個、最多幾個',
        points: [
          '第一步用<b>上視圖</b>決定底面佔哪些格子，<b>每格至少放 1 個</b>。',
          '第二步用<b>前視圖／右視圖</b>定出每一直行、每一橫列<b>最高幾層</b>。',
          '<b>最多</b>：每格都堆到上限；<b>最少</b>：只要每行每列各有一格達到上限就好。'
        ],
        formula: { label: '答案是一個範圍', tex: '\\text{最少個數}\\le\\text{方塊總數}\\le\\text{最多個數}' },
        visual: (h) => {
          const cs = 40;
          const base = txt(88, 46, '上視圖', GRN, 13) + vgrid(48, 54, 2, fullCells(2, 2), cs, GRN, '#dcf2ea') +
            txt(220, 46, '前視圖', C, 13) + vgrid(180, 54, 2, fullCells(2, 2), cs, C, '#d8f2f8') +
            txt(352, 46, '右視圖', AMB, 13) + vgrid(312, 54, 2, fullCells(2, 2), cs, AMB, '#fbeed8');
          const table = (vals, col) => {
            let s = txt(178, 162, '各格要堆幾層', col, 13);
            for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
              const x = 130 + c * 48, y = 170 + (1 - r) * 48;
              s += `<rect x="${x}" y="${y}" width="48" height="48" fill="#f4fbfd" stroke="${col}" stroke-width="2"/>`;
              s += txt(x + 24, y + 32, vals[r][c], col, 20);
            }
            return s;
          };
          SV.stepper(h, '0 0 440 296', [
            {
              t: '上視圖有 4 格 → 底面 4 格，每一格至少要放 1 個。',
              d: () => base + table([['≥1', '≥1'], ['≥1', '≥1']], '#657187') + txt(320, 214, '每格至少 1 個', '#657187', 13)
            },
            {
              t: '前視圖、右視圖都是 2 層高 → 每格最多 2 層。最多就是 4 格全堆滿。',
              d: () => base + table([['2', '2'], ['2', '2']], RED) +
                txt(330, 210, '最多', RED, 14) + txt(330, 234, '2×4 ＝ 8 個', RED, 15)
            },
            {
              t: '最少：只要每一行、每一列各有一格達到 2 層，其餘放 1 個就好。',
              d: () => base + table([['2', '1'], ['1', '2']], GRN) +
                txt(330, 210, '最少', GRN, 14) + txt(330, 234, '2+1+1+2 ＝ 6 個', GRN, 15)
            }
          ], { acc: false });
        },
        caption: '同一組三視圖可以對應好幾種立體，所以題目才會問「最少／最多」。',
        example: {
          q: '上視圖為 \\(2\\times2\\) 全滿，前視圖與右視圖都是「兩格寬、兩層高」的長方形，這個立體最少、最多各用幾個小正方體？',
          steps: ['每格至少 1 個，且都不超過 2 層。', '最多：\\(4\\) 格都堆 2 層 \\(=8\\)。', '最少：對角兩格堆 2 層、其餘各 1 層 \\(=6\\)。'],
          ans: '最少 6 個、最多 8 個'
        }
      },

      {
        sec: '6-3', secName: '三視圖',
        title: '6-3 易錯：視圖只畫輪廓，看不出深度',
        points: [
          '✗ 看到幾個方塊就畫幾格；✓ 視圖只畫<b>外輪廓</b>，深度方向根本看不出來。',
          '✗ 幫被擋住的方塊補上線；✓ <b>擋住就不畫</b>，看不到的不畫。',
          '✗ 右視圖左右畫反；✓ 從右邊看時，<b>前後</b>會變成視圖的左右，先確定哪邊是「前」。',
          '✗ 由三視圖只反推出一種立體；✓ 通常有<b>好幾種</b>，所以才問最少／最多。'
        ],
        visual: (h) => {
          const P1 = ISO(96, 80, 26, 14, 30), P2 = ISO(96, 204, 26, 14, 30);
          let s = isoStack([[0, 0, 0]], P1);
          s += txt(96, 138, '立體甲：1 個方塊', '#657187', 12);
          s += isoStack([[0, 0, 0], [0, 1, 0]], P2);
          s += txt(96, 276, '立體乙：2 個，一前一後', '#657187', 12);
          s += `<rect x="262" y="42" width="52" height="52" fill="#d8f2f8" stroke="${C}" stroke-width="2.4"/>`;
          s += txt(288, 30, '甲的前視圖', C, 12);
          s += `<rect x="262" y="180" width="52" height="52" fill="#d8f2f8" stroke="${C}" stroke-width="2.4"/>`;
          s += txt(288, 168, '乙的前視圖', C, 12);
          s += txt(380, 140, '一模一樣！', RED, 15);
          s += txt(380, 164, '前視圖看不出', '#657187', 12);
          s += txt(380, 182, '前後有幾層', '#657187', 12);
          s += SV.seg(288, 104, 288, 150, RED, 2, '6 5');
          h.innerHTML = svg('0 0 440 296', s);
        },
        caption: '1 個方塊與前後排成一列的 2 個方塊，前視圖完全相同——這就是「看不出深度」。',
        example: {
          q: '兩個立體的前視圖都是一個正方形，它們一定是同一個立體嗎？',
          steps: ['前視圖看不出<b>前後</b>方向的深度。', '1 個方塊、前後排 2 個方塊，前視圖都是一個正方形。'],
          ans: '不一定'
        }
      }
    ]
  });
})();
