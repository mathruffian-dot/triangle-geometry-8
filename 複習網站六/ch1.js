/* ============ 第 1 章　二次函數 ============
   依康軒版第六冊：1-1 二次函數的意義、1-2 二次函數的圖形與極值
   課綱代碼 F-9-1、F-9-2。
   ⚠ F-9-2 備註：「二次函數的配方法」與「二次函數的應用問題」屬 10 年級（F-10-1），
     本章聚焦「圖形的特性」——不做配方法、不做應用問題、不出現判別式。
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#2563eb';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }
  const TX = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" ${o.anchor ? `text-anchor="${o.anchor}"` : ''} font-size="${o.fs || 15}" font-weight="${o.fw || 800}" fill="${o.c || '#172033'}"${o.op != null ? ` opacity="${o.op}"` : ''}>${s}</text>`;
  const BOX = (x, y, w, hgt, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${hgt}" rx="${o.r || 12}" fill="${o.fill || '#fff'}" stroke="${o.stroke || '#dce3ee'}" stroke-width="${o.sw || 1.8}"/>`;
  const sgn = n => (n < 0 ? `−${Math.abs(n)}` : `${n}`);

  // 小型坐標平面（自繪，回傳 {g, X, Y}），比 SV.plane 更省高度
  function grid(opt) {
    const { x0 = 40, y0 = 22, w = 360, h = 218, xmin = -5, xmax = 5, ymin = -6, ymax = 8 } = opt;
    const sx = w / (xmax - xmin), sy = h / (ymax - ymin);
    const X = mx => x0 + (mx - xmin) * sx;
    const Y = my => y0 + (ymax - my) * sy;
    let g = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#fff"/>`;
    for (let x = Math.ceil(xmin); x <= xmax; x++)
      g += `<line x1="${X(x).toFixed(1)}" y1="${y0}" x2="${X(x).toFixed(1)}" y2="${y0 + h}" stroke="${x === 0 ? '#b9c3d4' : '#eef2f8'}" stroke-width="${x === 0 ? 1.6 : 1}"/>`;
    for (let y = Math.ceil(ymin); y <= ymax; y++)
      g += `<line x1="${x0}" y1="${Y(y).toFixed(1)}" x2="${x0 + w}" y2="${Y(y).toFixed(1)}" stroke="${y === 0 ? '#b9c3d4' : '#eef2f8'}" stroke-width="${y === 0 ? 1.6 : 1}"/>`;
    g += TX(x0 + w - 4, Y(0) - 6, 'x', { fs: 12, c: '#8a94a6', anchor: 'end' });
    g += TX(X(0) + 8, y0 + 12, 'y', { fs: 12, c: '#8a94a6' });
    g += TX(X(0) - 6, Y(0) + 14, 'O', { fs: 11.5, c: '#96a0b3', anchor: 'end' });
    return { g, X, Y, box: { x0, y0, w, h, xmin, xmax, ymin, ymax } };
  }
  // 依 y=a(x-h)^2+k 產生拋物線路徑（自動裁掉超出畫框的部分）
  function para(P, a, hh, k, color, wdt = 3) {
    const { xmin, xmax, ymin, ymax } = P.box;
    let d = '', on = false;
    for (let t = 0; t <= 200; t++) {
      const x = xmin + (xmax - xmin) * t / 200;
      const y = a * (x - hh) * (x - hh) + k;
      if (y < ymin - 0.4 || y > ymax + 0.4) { on = false; continue; }
      d += (on ? 'L' : 'M') + P.X(x).toFixed(1) + ',' + P.Y(y).toFixed(1) + ' ';
      on = true;
    }
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${wdt}" stroke-linecap="round"/>`;
  }
  const dotAt = (P, x, y, c, r = 5) => `<circle cx="${P.X(x)}" cy="${P.Y(y)}" r="${r}" fill="${c}"/>`;

  window.DECK.push({
    ch: 1,
    title: '二次函數',
    color: C,
    sections: ['1-1 二次函數的意義', '1-2 二次函數的圖形與極值'],
    slides: [

      /* ---------- 1-1 二次函數的意義 ---------- */
      {
        sec: '1-1', secName: '二次函數的意義',
        title: '二次函數：\\(y\\) 是 \\(x\\) 的<b>二次</b>式',
        points: [
          '兩個變數 \\(x,y\\)，每給一個 \\(x\\) 就<b>恰好</b>配一個 \\(y\\)，就是<span class="k">函數</span>。',
          '若關係式能寫成 \\(y=ax^2+bx+c\\) 且 <b>\\(a\\neq0\\)</b>，就叫<span class="k">二次函數</span>。',
          '關鍵在 <b>\\(a\\neq0\\)</b>：\\(a=0\\) 就退化成一次函數，不算二次。'
        ],
        formula: { label: '二次函數一般式', tex: 'y=ax^{2}+bx+c\\quad(a\\neq0)' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '✓ 是二次函數', tex: 'y=3x^{2}-2x+1', color: GRN, fill: '#eef7f2', border: '#bfe0d1', size: 19, note: '最高次是 2 次，a=3≠0' },
            { label: '✗ 不是二次函數', tex: 'y=5x-4', color: RED, border: '#f0c9d3', size: 18, note: '最高次只有 1 次 → 一次函數' },
            { label: '✗ 不是二次函數', tex: 'y=\\dfrac{2}{x^{2}}', color: RED, border: '#f0c9d3', size: 18, note: 'x 在分母，不是多項式' }
          ]);
        },
        caption: '先看<b>最高次是不是 2</b>，再確認 \\(x^2\\) 的係數<b>不是 0</b>。',
        example: {
          q: '\\(y=(k-2)x^{2}+3x-1\\) 是二次函數，\\(k\\) 要滿足什麼條件？',
          steps: ['二次項係數是 \\(k-2\\)，必須不為 \\(0\\)。', '\\(k-2\\neq0\\Rightarrow k\\neq2\\)。'],
          ans: '\\(k\\neq2\\)'
        }
      },

      {
        sec: '1-1', secName: '二次函數的意義',
        title: '從情境列出二次函數：面積最容易長出平方',
        points: [
          '<b>兩個長度相乘</b>就會出現 \\(x^2\\)——面積問題最常見。',
          '先把「另一邊」用 \\(x\\) 表示，再相乘化簡。',
          '拖滑桿改變 \\(x\\)，看長方形形狀與面積 \\(y\\) 怎麼一起變。'
        ],
        formula: { label: '周長 40 的長方形', tex: 'y=x(20-x)=-x^{2}+20x' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>一邊長 x ＝ <span class="ival" id="xv">6</span></label>
            <input type="range" id="xs" min="2" max="18" step="1" value="6"></div></div>`;
          const draw = () => {
            const x = +h.querySelector('#xs').value;
            h.querySelector('#xv').textContent = x;
            const other = 20 - x, area = x * other;
            const sc = 8.4, w = x * sc, hh = other * sc;
            const ox = 120 - w / 2, oy = 158 - hh / 2;
            const best = (x === 10);
            let s = TX(220, 20, '周長固定 40 ⇒ 兩邊和永遠是 20', { fs: 14, c: C, anchor: 'middle' });
            s += BOX(ox, oy, Math.max(4, w), Math.max(4, hh), { fill: best ? 'rgba(5,150,105,.12)' : 'rgba(37,99,235,.10)', stroke: best ? GRN : C, sw: 2.4, r: 4 });
            s += TX(ox + w / 2, oy - 8, `x = ${x}`, { fs: 13, c: C, anchor: 'middle' });
            s += TX(ox - 8, oy + hh / 2 + 4, `${other}`, { fs: 13, c: VIO, anchor: 'end' });
            // 右側：面積隨 x 的變化（拋物線取樣點）
            const P = grid({ x0: 236, y0: 40, w: 168, h: 150, xmin: 0, xmax: 20, ymin: 0, ymax: 110 });
            s += P.g;
            let d = '', on = false;
            for (let t = 0; t <= 100; t++) {
              const xx = t * 0.2, yy = xx * (20 - xx);
              if (yy < 0) { on = false; continue; }
              d += (on ? 'L' : 'M') + P.X(xx).toFixed(1) + ',' + P.Y(yy).toFixed(1) + ' '; on = true;
            }
            s += `<path d="${d}" fill="none" stroke="${C}" stroke-width="2.6"/>`;
            s += dotAt(P, x, area, best ? GRN : RED, 5);
            s += TX(320, 30, '面積 y 隨 x 變化', { fs: 12, c: '#657187', anchor: 'middle' });
            s += BOX(24, 236, 392, 48, { fill: best ? '#eef7f2' : '#f6f8fc', stroke: best ? '#bfe0d1' : '#dce3ee' });
            s += TX(220, 258, `y ＝ ${x} × ${other} ＝ ${area}`, { fs: 15, anchor: 'middle', c: best ? GRN : '#172033' });
            s += TX(220, 276, best ? '★ x = 10 時面積最大（正方形）' : '再拖拖看，哪個 x 讓面積最大？',
              { fs: 12.5, c: best ? GRN : '#657187', anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 292', s);
          };
          h.querySelector('#xs').oninput = draw; draw();
        },
        caption: '把「另一邊 \\(=20-x\\)」代進去相乘，二次函數就自然跑出來了。',
        example: {
          q: '周長 \\(40\\) 公分的長方形，一邊長 \\(x\\)，面積 \\(y\\) 與 \\(x\\) 的關係式為何？',
          steps: ['兩邊和 \\(=40\\div2=20\\)，另一邊為 \\(20-x\\)。', '\\(y=x(20-x)=-x^{2}+20x\\)。'],
          ans: '\\(y=-x^{2}+20x\\)'
        }
      },

      {
        sec: '1-1', secName: '二次函數的意義',
        title: '易錯：\\(a\\neq0\\)、\\(x\\) 不能在分母或根號裡',
        points: [
          '\\(a=0\\) 就<b>不是</b>二次函數——含參數時一定要把這個條件寫出來。',
          '\\(x\\) 出現在<b>分母</b>或<b>根號</b>裡，都不是多項式，也就不是二次函數。',
          '展開後才看得出真正的最高次，別只看表面。'
        ],
        visual: (h) => {
          const row = (bad, good, note) => `<div style="display:flex;gap:8px;align-items:stretch;margin-bottom:9px">
            <div style="flex:1;background:#fdeef2;border:1.5px solid #f3c4d0;border-radius:12px;padding:8px 11px">
              <div style="font-size:11.5px;font-weight:900;color:${RED};margin-bottom:3px">✗ 常見誤判</div>
              <div style="font-size:14px;line-height:1.6">${bad}</div></div>
            <div style="flex:1;background:#eef7f2;border:1.5px solid #bfe0d1;border-radius:12px;padding:8px 11px">
              <div style="font-size:11.5px;font-weight:900;color:${GRN};margin-bottom:3px">✓ 正確判斷</div>
              <div style="font-size:14px;line-height:1.6">${good}</div></div></div>
            ${note ? `<div style="text-align:center;font-size:12.5px;color:#657187;margin:-4px 0 10px">${note}</div>` : ''}`;
          h.innerHTML = `<div style="width:97%;margin:0 auto">
            ${row('\\(y=kx^{2}+1\\) 一定是二次函數', '要加上 \\(k\\neq0\\) 才是', '\\(k=0\\) 時變成 \\(y=1\\)，是常數函數')}
            ${row('\\(y=\\dfrac{1}{x^{2}}\\) 有平方所以是二次', '\\(x\\) 在<b>分母</b> ⇒ 不是二次函數', '不是多項式')}
            ${row('\\(y=(x+1)^{2}-x^{2}\\) 是二次', '展開得 \\(y=2x+1\\) ⇒ <b>一次</b>函數', '二次項互相抵消了')}
          </div>`;
          MJ(h);
        },
        caption: '三個陷阱：<b>參數可能為 0</b>、<b>x 在分母</b>、<b>展開後二次項抵消</b>。',
        example: {
          q: '\\(y=(x-3)^{2}-(x^{2}+5)\\) 是二次函數嗎？',
          steps: ['展開：\\((x^2-6x+9)-(x^2+5)\\)。', '\\(=-6x+4\\)，二次項抵消了。'],
          ans: '不是，它是一次函數'
        }
      },

      /* ---------- 1-2 二次函數的圖形與極值 ---------- */
      {
        sec: '1-2', secName: '二次函數的圖形與極值',
        title: '\\(y=ax^{2}\\) 的圖形是<b>拋物線</b>，頂點在原點',
        points: [
          '\\(y=ax^{2}\\) 的圖形叫<span class="k">拋物線</span>，一定通過<b>原點</b> \\((0,0)\\)。',
          '\\(a>0\\) <b>開口向上</b>，原點是<b>最低點</b>；\\(a<0\\) <b>開口向下</b>，原點是<b>最高點</b>。',
          '拖滑桿改變 \\(a\\)：\\(|a|\\) 愈大開口愈<b>窄</b>，愈小愈<b>寬</b>。'
        ],
        formula: { label: '最基本的二次函數', tex: 'y=ax^{2}\\quad\\text{頂點}(0,0),\\ \\text{對稱軸}\\ x=0' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>a ＝ <span class="ival" id="av">1</span></label>
            <input type="range" id="as" min="-3" max="3" step="0.5" value="1"></div></div>`;
          const draw = () => {
            let a = +h.querySelector('#as').value;
            if (a === 0) a = 0.5;                       // a≠0：跳過 0
            h.querySelector('#av').textContent = a;
            const P = grid({ x0: 44, y0: 20, w: 352, h: 208, xmin: -4, xmax: 4, ymin: -7, ymax: 7 });
            let s = P.g;
            s += para(P, 1, 0, 0, '#c7d0de', 2);        // 參考線 y=x²
            s += para(P, a, 0, 0, a > 0 ? C : RED, 3.2);
            s += dotAt(P, 0, 0, '#172033', 5);
            s += TX(P.X(0) + 10, P.Y(0) + 18, '頂點 (0,0)', { fs: 12, c: '#172033' });
            s += `<line x1="${P.X(0)}" y1="20" x2="${P.X(0)}" y2="228" stroke="${AMB}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
            s += TX(P.X(0) + 8, 34, '對稱軸 x=0', { fs: 11.5, c: AMB });
            s += TX(220, 254, `y = ${a}x²　→　開口${a > 0 ? '向上，有最小值 0' : '向下，有最大值 0'}`,
              { fs: 15, c: a > 0 ? C : RED, anchor: 'middle' });
            s += TX(220, 274, `|a| = ${Math.abs(a)}　${Math.abs(a) > 1 ? '＞1 ⇒ 比 y=x² 窄' : (Math.abs(a) < 1 ? '＜1 ⇒ 比 y=x² 寬' : '＝1 ⇒ 就是 y=x²')}`,
              { fs: 12.5, c: '#657187', anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 288', s);
          };
          h.querySelector('#as').oninput = draw; draw();
        },
        caption: '灰線是基準 \\(y=x^{2}\\)。<b>正負決定開口方向，絕對值決定胖瘦</b>。',
        example: {
          q: '\\(y=-2x^{2}\\) 的開口方向、頂點與極值各是什麼？',
          steps: ['\\(a=-2<0\\) ⇒ 開口向下。', '頂點在原點 \\((0,0)\\)，且是最高點。'],
          ans: '開口向下；頂點 \\((0,0)\\)；最大值 \\(0\\)'
        }
      },

      {
        sec: '1-2', secName: '二次函數的圖形與極值',
        title: '\\(y=ax^{2}+k\\)：整條拋物線<b>上下</b>移動',
        points: [
          '\\(+k\\) 把 \\(y=ax^{2}\\) 整條往<b>上</b>移 \\(k\\) 格；\\(-k\\) 往<b>下</b>移。',
          '形狀完全不變，只有位置換了 ⇒ <b>頂點變成 \\((0,k)\\)</b>。',
          '對稱軸還是 \\(x=0\\)（上下移動不影響左右位置）。'
        ],
        formula: { label: '上下平移', tex: 'y=ax^{2}+k\\quad\\text{頂點}(0,k),\\ \\text{對稱軸}\\ x=0' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>k ＝ <span class="ival" id="kv">2</span></label>
            <input type="range" id="ks" min="-4" max="4" step="1" value="2"></div></div>`;
          const draw = () => {
            const k = +h.querySelector('#ks').value;
            h.querySelector('#kv').textContent = k;
            const P = grid({ x0: 44, y0: 20, w: 352, h: 208, xmin: -4, xmax: 4, ymin: -6, ymax: 8 });
            let s = P.g;
            s += para(P, 1, 0, 0, '#c7d0de', 2);
            s += para(P, 1, 0, k, C, 3.2);
            s += dotAt(P, 0, k, RED, 5.5);
            s += TX(P.X(0) + 10, P.Y(k) - 8, `頂點 (0, ${sgn(k)})`, { fs: 12, c: RED });
            // 平移箭頭
            if (k !== 0) {
              s += `<line x1="${P.X(0.9)}" y1="${P.Y(0.81)}" x2="${P.X(0.9)}" y2="${P.Y(0.81 + k)}" stroke="${GRN}" stroke-width="2.4" marker-end="url(#ar1)"/>`;
              s += `<defs><marker id="ar1" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="${GRN}"/></marker></defs>`;
              s += TX(P.X(1.05), (P.Y(0.81) + P.Y(0.81 + k)) / 2, `${k > 0 ? '上' : '下'}移 ${Math.abs(k)}`, { fs: 12, c: GRN });
            }
            s += TX(220, 256, `y = x² ${k >= 0 ? '+ ' + k : '− ' + Math.abs(k)}　⇒ 頂點 (0, ${sgn(k)})`, { fs: 15, c: C, anchor: 'middle' });
            s += TX(220, 276, k >= 0 ? '最小值 = ' + k : '最小值 = ' + k, { fs: 12.5, c: '#657187', anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 288', s);
          };
          h.querySelector('#ks').oninput = draw; draw();
        },
        caption: '\\(k\\) 是<b>直接加在 \\(y\\) 上</b>的，所以圖形往 \\(y\\) 方向（上下）移。',
        example: {
          q: '\\(y=3x^{2}-5\\) 的頂點、對稱軸與最小值？',
          steps: ['\\(k=-5\\)，由 \\(y=3x^2\\) 向下移 \\(5\\)。', '頂點 \\((0,-5)\\)，對稱軸 \\(x=0\\)。'],
          ans: '頂點 \\((0,-5)\\)；對稱軸 \\(x=0\\)；最小值 \\(-5\\)'
        }
      },

      {
        sec: '1-2', secName: '二次函數的圖形與極值',
        title: '\\(y=a(x-h)^{2}\\)：整條拋物線<b>左右</b>移動',
        points: [
          '\\((x-h)^2\\) 把圖形往<b>右</b>移 \\(h\\) 格；\\((x+h)^2\\) 往<b>左</b>移。',
          '<b>括號裡是減，就往正方向移</b>——符號最容易看反。',
          '頂點變成 \\((h,0)\\)，對稱軸跟著變成 \\(x=h\\)。'
        ],
        formula: { label: '左右平移', tex: 'y=a(x-h)^{2}\\quad\\text{頂點}(h,0),\\ \\text{對稱軸}\\ x=h' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>h ＝ <span class="ival" id="hv">2</span></label>
            <input type="range" id="hs" min="-3" max="3" step="1" value="2"></div></div>`;
          const draw = () => {
            const hh = +h.querySelector('#hs').value;
            h.querySelector('#hv').textContent = hh;
            const P = grid({ x0: 44, y0: 20, w: 352, h: 208, xmin: -5, xmax: 5, ymin: -2, ymax: 9 });
            let s = P.g;
            s += para(P, 1, 0, 0, '#c7d0de', 2);
            s += para(P, 1, hh, 0, C, 3.2);
            s += dotAt(P, hh, 0, RED, 5.5);
            s += `<line x1="${P.X(hh)}" y1="20" x2="${P.X(hh)}" y2="228" stroke="${AMB}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
            s += TX(P.X(hh) + 7, 36, `對稱軸 x=${sgn(hh)}`, { fs: 11.5, c: AMB });
            s += TX(P.X(hh), P.Y(0) + 20, `(${sgn(hh)}, 0)`, { fs: 12, c: RED, anchor: 'middle' });
            s += TX(220, 256, `y = (x ${hh >= 0 ? '− ' + hh : '+ ' + Math.abs(hh)})²　⇒ 向${hh >= 0 ? '右' : '左'}移 ${Math.abs(hh)}`,
              { fs: 15, c: C, anchor: 'middle' });
            s += TX(220, 276, '括號裡寫 −h，圖形就往 +h 方向跑（符號相反）', { fs: 12.5, c: '#657187', anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 288', s);
          };
          h.querySelector('#hs').oninput = draw; draw();
        },
        caption: '記法：<b>讓括號等於 0 的那個 \\(x\\)，就是頂點的 \\(x\\) 坐標</b>。',
        example: {
          q: '\\(y=2(x+3)^{2}\\) 的頂點與對稱軸？',
          steps: ['\\(x+3=0\\Rightarrow x=-3\\)，這就是頂點的 \\(x\\)。', '頂點 \\((-3,0)\\)，對稱軸 \\(x=-3\\)。'],
          ans: '頂點 \\((-3,0)\\)；對稱軸 \\(x=-3\\)'
        }
      },

      {
        sec: '1-2', secName: '二次函數的圖形與極值',
        title: '頂點式 \\(y=a(x-h)^{2}+k\\)：頂點一眼看出 \\((h,k)\\)',
        points: [
          '<b>先左右移 \\(h\\)、再上下移 \\(k\\)</b>，頂點就落在 \\((h,k)\\)。',
          '對稱軸是通過頂點的<b>鉛垂線</b> \\(x=h\\)。',
          '兩個滑桿一起拖，看頂點怎麼被 \\(h\\)、\\(k\\) 牽著走。'
        ],
        formula: { label: '頂點式', tex: 'y=a(x-h)^{2}+k\\quad\\text{頂點}(h,k),\\ \\text{對稱軸}\\ x=h' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>h ＝ <span class="ival" id="hv">2</span></label>
            <input type="range" id="hs" min="-3" max="3" step="1" value="2">
            <label>k ＝ <span class="ival" id="kv">-2</span></label>
            <input type="range" id="ks" min="-4" max="4" step="1" value="-2"></div></div>`;
          const draw = () => {
            const hh = +h.querySelector('#hs').value, k = +h.querySelector('#ks').value;
            h.querySelector('#hv').textContent = hh; h.querySelector('#kv').textContent = k;
            const P = grid({ x0: 44, y0: 18, w: 352, h: 196, xmin: -5, xmax: 5, ymin: -6, ymax: 8 });
            let s = P.g;
            s += para(P, 1, 0, 0, '#dde3ec', 1.8);
            s += para(P, 1, hh, k, C, 3.2);
            s += `<line x1="${P.X(hh)}" y1="18" x2="${P.X(hh)}" y2="214" stroke="${AMB}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
            s += dotAt(P, hh, k, RED, 5.5);
            s += TX(P.X(hh) + 8, P.Y(k) - 8, `(${sgn(hh)}, ${sgn(k)})`, { fs: 12.5, c: RED });
            s += TX(P.X(hh) + 7, 32, `x=${sgn(hh)}`, { fs: 11.5, c: AMB });
            s += BOX(24, 226, 392, 56, { fill: '#f6f8fc' });
            s += TX(220, 248, `y = (x ${hh >= 0 ? '− ' + hh : '+ ' + Math.abs(hh)})² ${k >= 0 ? '+ ' + k : '− ' + Math.abs(k)}`, { fs: 16, c: C, anchor: 'middle' });
            s += TX(220, 270, `頂點 (${sgn(hh)}, ${sgn(k)})　對稱軸 x = ${sgn(hh)}　最小值 ${sgn(k)}`, { fs: 13, c: '#657187', anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 290', s);
          };
          h.querySelector('#hs').oninput = draw; h.querySelector('#ks').oninput = draw; draw();
        },
        caption: '頂點式最好用——<b>\\(h\\)、\\(k\\) 直接就是頂點坐標</b>，不必再算。',
        example: {
          q: '\\(y=-2(x-1)^{2}+8\\) 的頂點、對稱軸、開口方向與極值？',
          steps: ['頂點 \\((1,8)\\)，對稱軸 \\(x=1\\)。', '\\(a=-2<0\\) ⇒ 開口向下，頂點是最高點。'],
          ans: '頂點 \\((1,8)\\)；\\(x=1\\)；開口向下；最大值 \\(8\\)'
        }
      },

      {
        sec: '1-2', secName: '二次函數的圖形與極值',
        title: '開口向上找<b>最小值</b>，開口向下找<b>最大值</b>',
        points: [
          '極值一定發生在<b>頂點</b>，而且極值就是頂點的 <b>\\(y\\) 坐標 \\(k\\)</b>。',
          '\\(a>0\\)：頂點是<b>最低點</b> ⇒ 有<b>最小值</b> \\(k\\)，沒有最大值。',
          '\\(a<0\\)：頂點是<b>最高點</b> ⇒ 有<b>最大值</b> \\(k\\)，沒有最小值。'
        ],
        formula: { label: '極值', tex: 'y=a(x-h)^{2}+k\\ \\Rightarrow\\ \\text{極值}=k\\ (\\text{發生在}\\ x=h)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>a ＝ <span class="ival" id="av">1</span></label>
            <input type="range" id="as" min="-2" max="2" step="1" value="1"></div></div>`;
          const draw = () => {
            let a = +h.querySelector('#as').value; if (a === 0) a = 1;
            h.querySelector('#av').textContent = a;
            const hh = 1, k = 3;
            const P = grid({ x0: 44, y0: 20, w: 352, h: 200, xmin: -3, xmax: 5, ymin: -5, ymax: 8 });
            let s = P.g;
            s += para(P, a, hh, k, a > 0 ? C : RED, 3.2);
            s += dotAt(P, hh, k, a > 0 ? C : RED, 6);
            s += TX(P.X(hh) + 9, P.Y(k) + (a > 0 ? 18 : -8), `頂點 (1, 3)`, { fs: 12.5, c: a > 0 ? C : RED });
            s += `<line x1="${P.X(P.box.xmin)}" y1="${P.Y(k)}" x2="${P.X(P.box.xmax)}" y2="${P.Y(k)}" stroke="${GRN}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
            s += TX(52, P.Y(k) - 7, `y = 3`, { fs: 11.5, c: GRN });
            s += BOX(24, 232, 392, 52, { fill: a > 0 ? '#eef4ff' : '#fdeef2', stroke: a > 0 ? '#cfe0ff' : '#f3c4d0' });
            s += TX(220, 254, a > 0 ? '開口向上：頂點是最低點' : '開口向下：頂點是最高點', { fs: 15, c: a > 0 ? C : RED, anchor: 'middle' });
            s += TX(220, 274, a > 0 ? '有最小值 3，沒有最大值（往上無限延伸）' : '有最大值 3，沒有最小值（往下無限延伸）',
              { fs: 12.5, c: '#657187', anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 292', s);
          };
          h.querySelector('#as').oninput = draw; draw();
        },
        caption: '拋物線只有<b>一端</b>是封閉的——所以只會有最大值<b>或</b>最小值，不會兩個都有。',
        example: {
          q: '\\(y=\\dfrac{1}{2}(x+4)^{2}-6\\) 有最大值還是最小值？是多少？',
          steps: ['\\(a=\\dfrac12>0\\) ⇒ 開口向上 ⇒ 有最小值。', '最小值就是 \\(k=-6\\)，發生在 \\(x=-4\\)。'],
          ans: '有最小值 \\(-6\\)（在 \\(x=-4\\) 時）'
        }
      },

      {
        sec: '1-2', secName: '二次函數的圖形與極值',
        title: '對稱軸：拋物線<b>對摺後完全重合</b>的那條線',
        points: [
          '對稱軸是<b>通過頂點的鉛垂線</b>，方程式為 \\(x=h\\)。',
          '對稱軸兩側<b>等距</b>的兩點，\\(y\\) 值一定<b>相等</b>。',
          '拖滑桿看左右兩個對稱點：離對稱軸一樣遠，高度就一樣。'
        ],
        formula: { label: '對稱點', tex: '\\text{若 }y(h+d)=y(h-d)\\text{，則對稱軸為 }x=h' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>離對稱軸的距離 d ＝ <span class="ival" id="dv">2</span></label>
            <input type="range" id="ds" min="0.5" max="3" step="0.5" value="2"></div></div>`;
          const draw = () => {
            const d = +h.querySelector('#ds').value;
            h.querySelector('#dv').textContent = d;
            const hh = 1, k = -3, a = 1;
            const P = grid({ x0: 44, y0: 20, w: 352, h: 200, xmin: -3, xmax: 5, ymin: -4, ymax: 8 });
            let s = P.g;
            s += para(P, a, hh, k, C, 3.2);
            s += `<line x1="${P.X(hh)}" y1="20" x2="${P.X(hh)}" y2="220" stroke="${AMB}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
            const yv = a * d * d + k;
            s += `<line x1="${P.X(hh - d)}" y1="${P.Y(yv)}" x2="${P.X(hh + d)}" y2="${P.Y(yv)}" stroke="${GRN}" stroke-width="2" stroke-dasharray="4 3"/>`;
            s += dotAt(P, hh - d, yv, VIO, 5.5) + dotAt(P, hh + d, yv, VIO, 5.5);
            s += dotAt(P, hh, k, RED, 5);
            s += TX(P.X(hh - d) - 6, P.Y(yv) - 9, `(${(hh - d)}, ${yv})`, { fs: 11.5, c: VIO, anchor: 'end' });
            s += TX(P.X(hh + d) + 6, P.Y(yv) - 9, `(${(hh + d)}, ${yv})`, { fs: 11.5, c: VIO });
            s += TX(P.X(hh) + 7, 34, 'x = 1', { fs: 11.5, c: AMB });
            s += TX(220, 246, `左右各離對稱軸 ${d} ⇒ 兩點的 y 都是 ${yv}`, { fs: 14.5, c: GRN, anchor: 'middle' });
            s += TX(220, 268, '兩個對稱點的 x 坐標平均，就是對稱軸', { fs: 12.5, c: '#657187', anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 282', s);
          };
          h.querySelector('#ds').oninput = draw; draw();
        },
        caption: '反過來用：<b>已知兩點 \\(y\\) 值相同，對稱軸就在它們正中間</b>。',
        example: {
          q: '某二次函數圖形通過 \\((-1,5)\\) 與 \\((7,5)\\)，對稱軸是什麼？',
          steps: ['兩點 \\(y\\) 值相同 ⇒ 對稱軸在正中間。', '\\(\\dfrac{-1+7}{2}=3\\)。'],
          ans: '對稱軸為 \\(x=3\\)'
        }
      },

      {
        sec: '1-2', secName: '二次函數的圖形與極值',
        title: '平移總整理：\\(y=ax^{2}\\) 怎麼變成 \\(y=a(x-h)^{2}+k\\)',
        points: [
          '<b>形狀由 \\(a\\) 決定</b>——平移完全不會改變開口方向與胖瘦。',
          '\\(h\\) 管左右、\\(k\\) 管上下，兩者互不干擾。',
          '所以只要 \\(a\\) 相同，兩條拋物線一定可以<b>平移重合</b>。'
        ],
        formula: { label: '平移關係', tex: 'y=ax^{2}\\ \\xrightarrow[\\ \\text{上下移}k\\ ]{\\ \\text{左右移}h\\ }\\ y=a(x-h)^{2}+k' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '① 基本型', tex: 'y=ax^{2}', color: '#8a94a6', border: '#dde3ec', size: 17, note: '頂點 (0,0)、對稱軸 x=0' },
            { label: '② 上下移 k', tex: 'y=ax^{2}+k', color: GRN, border: '#cfe8dd', size: 17, note: '頂點 (0,k)、對稱軸不變' },
            { label: '③ 左右移 h', tex: 'y=a(x-h)^{2}', color: VIO, border: '#ddd0f5', size: 17, note: '頂點 (h,0)、對稱軸 x=h' },
            { label: '④ 兩個都移', tex: 'y=a(x-h)^{2}+k', color: C, fill: '#eef4ff', border: C, size: 18, note: '頂點 (h,k)、對稱軸 x=h' }
          ], { gap: 9 });
        },
        caption: '四個式子只差在<b>頂點跑到哪裡</b>——形狀從頭到尾都一樣。',
        example: {
          q: '把 \\(y=3x^{2}\\) 向左移 \\(2\\)、向上移 \\(5\\)，新的關係式為何？',
          steps: ['向左移 2 ⇒ 括號寫成 \\((x+2)\\)。', '向上移 5 ⇒ 尾巴 \\(+5\\)。'],
          ans: '\\(y=3(x+2)^{2}+5\\)'
        }
      },

      {
        sec: '1-2', secName: '二次函數的圖形與極值',
        title: '由圖形讀出頂點式：先看頂點，再用一點求 \\(a\\)',
        points: [
          '第一步：從圖上讀<b>頂點 \\((h,k)\\)</b>，先寫下 \\(y=a(x-h)^2+k\\)。',
          '第二步：再找圖上<b>另一個好讀的點</b>代進去，解出 \\(a\\)。',
          '拖滑桿調 \\(a\\)，看曲線什麼時候剛好穿過那個紅點。'
        ],
        formula: { label: '兩步驟', tex: '\\text{頂點}(h,k)\\Rightarrow y=a(x-h)^{2}+k\\ \\xrightarrow{\\ \\text{代入另一點}\\ }\\ a' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>試 a ＝ <span class="ival" id="av">1</span></label>
            <input type="range" id="as" min="-1" max="3" step="0.5" value="1"></div></div>`;
          const draw = () => {
            let a = +h.querySelector('#as').value; if (a === 0) a = 0.5;
            h.querySelector('#av').textContent = a;
            const hh = 2, k = -1;
            const tx = 4, ty = 7;                        // 目標點 (4,7) ⇒ a=2
            const ok = Math.abs(a * 4 + k - ty) < 1e-6;
            const P = grid({ x0: 44, y0: 20, w: 352, h: 200, xmin: -2, xmax: 6, ymin: -3, ymax: 9 });
            let s = P.g;
            s += para(P, a, hh, k, ok ? GRN : C, 3.2);
            s += dotAt(P, hh, k, '#172033', 5);
            s += TX(P.X(hh) + 8, P.Y(k) + 18, '頂點 (2, −1)', { fs: 12, c: '#172033' });
            s += dotAt(P, tx, ty, RED, 6);
            s += TX(P.X(tx) + 8, P.Y(ty) + 4, '(4, 7)', { fs: 12.5, c: RED });
            s += BOX(24, 232, 392, 52, { fill: ok ? '#eef7f2' : '#f6f8fc', stroke: ok ? '#bfe0d1' : '#dce3ee' });
            s += TX(220, 253, `y = ${a}(x − 2)² − 1　→　代 x=4：y = ${a * 4 - 1}`, { fs: 14.5, anchor: 'middle', c: ok ? GRN : '#172033' });
            s += TX(220, 273, ok ? '★ 剛好通過 (4, 7)，所以 a = 2' : '還沒通過紅點，再調 a', { fs: 12.5, c: ok ? GRN : '#657187', anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 292', s);
          };
          h.querySelector('#as').oninput = draw; draw();
        },
        caption: '頂點決定 \\(h,k\\)，另一點決定 \\(a\\)——<b>兩個資訊剛好定出一條拋物線</b>。',
        example: {
          q: '拋物線頂點為 \\((2,-1)\\) 且通過 \\((4,7)\\)，求其關係式。',
          steps: ['先寫 \\(y=a(x-2)^{2}-1\\)。', '代入 \\((4,7)\\)：\\(7=a(4-2)^{2}-1=4a-1\\)。', '\\(4a=8\\Rightarrow a=2\\)。'],
          ans: '\\(y=2(x-2)^{2}-1\\)'
        }
      },

      {
        sec: '1-2', secName: '二次函數的圖形與極值',
        title: '易錯：\\(h\\) 的符號、極值報錯、把頂點的 \\(x\\) 當成極值',
        points: [
          '\\((x+3)^2\\) 的頂點 \\(x\\) 是 <b>\\(-3\\)</b> 不是 \\(+3\\)——括號裡的符號要<b>反過來</b>。',
          '開口向下只有<b>最大值</b>，不能說「最小值是 \\(k\\)」。',
          '<b>極值是頂點的 \\(y\\) 坐標 \\(k\\)</b>，不是 \\(h\\)。'
        ],
        visual: (h) => {
          const row = (bad, good) => `<div style="display:flex;gap:8px;align-items:stretch;margin-bottom:10px">
            <div style="flex:1;background:#fdeef2;border:1.5px solid #f3c4d0;border-radius:12px;padding:9px 12px">
              <div style="font-size:11.5px;font-weight:900;color:${RED};margin-bottom:3px">✗ 常見錯誤</div>
              <div style="font-size:14.5px;line-height:1.6">${bad}</div></div>
            <div style="flex:1;background:#eef7f2;border:1.5px solid #bfe0d1;border-radius:12px;padding:9px 12px">
              <div style="font-size:11.5px;font-weight:900;color:${GRN};margin-bottom:3px">✓ 正確</div>
              <div style="font-size:14.5px;line-height:1.6">${good}</div></div></div>`;
          h.innerHTML = `<div style="width:97%;margin:0 auto">
            ${row('\\(y=(x+3)^2\\) 頂點 \\((3,0)\\)', '頂點 \\((-3,0)\\)')}
            ${row('\\(y=-2(x-1)^2+5\\) 最小值 5', '開口向下 ⇒ <b>最大值</b> 5')}
            ${row('\\(y=(x-4)^2+2\\) 最小值 4', '最小值是 <b>2</b>（\\(k\\)），4 是對稱軸')}
          </div>
          <div style="text-align:center;font-size:12.5px;color:#657187;margin-top:4px">
            口訣：<b>括號歸括號（管左右）、尾巴歸尾巴（管上下、就是極值）</b></div>`;
          MJ(h);
        },
        caption: '三個坑：<b>括號符號反過來</b>、<b>最大最小看 \\(a\\)</b>、<b>極值看 \\(k\\)</b>。',
        example: {
          q: '\\(y=-(x+2)^{2}+9\\) 的頂點、對稱軸與極值？',
          steps: ['\\(x+2=0\\Rightarrow x=-2\\)，頂點 \\((-2,9)\\)。', '\\(a=-1<0\\) ⇒ 開口向下 ⇒ 最大值 \\(9\\)。'],
          ans: '頂點 \\((-2,9)\\)；\\(x=-2\\)；最大值 \\(9\\)'
        }
      }

    ]
  });
})();
