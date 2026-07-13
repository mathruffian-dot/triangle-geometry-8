/* ============ 第 2 章　函數 ============ */
window.DECK = window.DECK || [];
(function () {
  const C = '#7c3aed';

  // 互動繪圖器：畫 y = a x + b，附 a、b 滑桿
  function plotter(h, opt) {
    const { a0 = 1, b0 = 0, aMin = -3, aMax = 3, bMin = -5, bMax = 5, lockA = false, lockB = false, color = C } = opt;
    const P = SV.plane({ x0: 48, y0: 24, w: 340, h: 300, xmin: -6, xmax: 6, ymin: -6, ymax: 6 });
    const vbW = 48 + 340 + 26, vbH = 24 + 300 + 34;
    h.innerHTML = `<div style="width:100%;text-align:center">
      <svg id="plot" viewBox="0 0 ${vbW} ${vbH}" style="max-width:100%">
        ${P.defs}${P.svg}
        <polyline id="graph" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
        <circle id="yint" r="5.5" fill="${color}"/>
        <text id="yintlbl" font-size="12" font-weight="800" fill="${color}"></text>
        <text id="eqlbl" x="${vbW - 8}" y="20" text-anchor="end" class="mth" font-size="16" fill="${color}"></text>
      </svg>
      <div class="ictrl">
        ${lockA ? '' : `<label>斜率 a <span class="ival" id="va">${a0}</span></label><input type="range" id="sa" min="${aMin}" max="${aMax}" step="0.5" value="${a0}">`}
        ${lockB ? '' : `<label>${'常數'} b <span class="ival" id="vb">${b0}</span></label><input type="range" id="sb" min="${bMin}" max="${bMax}" step="1" value="${b0}">`}
      </div></div>`;
    const graph = h.querySelector('#graph'), yint = h.querySelector('#yint'), lbl = h.querySelector('#eqlbl');
    const draw = () => {
      const a = lockA ? a0 : +h.querySelector('#sa').value;
      const b = lockB ? b0 : +h.querySelector('#sb').value;
      if (h.querySelector('#va')) h.querySelector('#va').textContent = a;
      if (h.querySelector('#vb')) h.querySelector('#vb').textContent = b;
      const p1 = `${P.X(-6)},${P.Y(a * -6 + b)}`, p2 = `${P.X(6)},${P.Y(a * 6 + b)}`;
      graph.setAttribute('points', `${p1} ${p2}`);
      yint.setAttribute('cx', P.X(0)); yint.setAttribute('cy', P.Y(b));
      const yl = h.querySelector('#yintlbl');
      if (yl) { yl.setAttribute('x', P.X(0) + 12); yl.setAttribute('y', P.Y(b) - 8); yl.textContent = 'y截距'; }
      const bs = b === 0 ? '' : (b > 0 ? '+' + b : '' + b);
      lbl.textContent = `y = ${a === 1 ? '' : a === -1 ? '−' : a}x ${bs}`;
    };
    if (!lockA) h.querySelector('#sa').oninput = draw;
    if (!lockB) h.querySelector('#sb').oninput = draw;
    draw();
  }

  window.DECK.push({
    ch: 2,
    title: '函數',
    color: C,
    sections: ['2-1 函數與函數圖形'],
    slides: [

      {
        sec: '2-1', secName: '函數與函數圖形',
        title: '函數：一個輸入配一個輸出',
        points: [
          '把 \\(x\\) 丟進一台機器，它吐出對應的 \\(y\\)——這就是<span class="k">函數</span>。',
          '關鍵條件：每個輸入 \\(x\\)，只能對應<b>唯一一個</b>輸出 \\(y\\)。',
          '\\(x\\) 叫<b>自變數</b>，\\(y\\)（隨 \\(x\\) 決定）叫<b>因變數</b>。'
        ],
        visual: (h) => {
          h.innerHTML = `<div style="width:100%;text-align:center"><svg viewBox="0 0 420 220" style="max-width:100%">
            <defs><marker id="fm" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#7c3aed"/></marker></defs>
            <text x="55" y="118" text-anchor="middle" class="mth" font-size="26" fill="#172033">x</text>
            <line x1="80" y1="110" x2="150" y2="110" stroke="#7c3aed" stroke-width="3" marker-end="url(#fm)"/>
            <rect x="155" y="60" width="110" height="100" rx="16" fill="#f3eefe" stroke="#7c3aed" stroke-width="2.5"/>
            <text x="210" y="100" text-anchor="middle" class="mth" font-size="22" fill="#7c3aed">f</text>
            <text x="210" y="128" text-anchor="middle" font-size="13" fill="#657187">規則</text>
            <line x1="270" y1="110" x2="340" y2="110" stroke="#7c3aed" stroke-width="3" marker-end="url(#fm)"/>
            <text x="368" y="118" text-anchor="middle" class="mth" font-size="26" fill="#172033">y</text>
            <text x="210" y="40" text-anchor="middle" font-size="13" fill="#657187">一個 x → 唯一的 y</text>
            <text x="210" y="195" text-anchor="middle" font-size="13" fill="#657187">y = f(x)</text>
          </svg></div>`;
        },
        caption: '像自動販賣機：投同一個鈕，一定出同一種飲料。',
        example: {
          q: '下列何者 y 是 x 的函數？(甲) y=2x+1　(乙) 一個 x 對到兩個 y。',
          steps: ['(甲) 每個 x 算出唯一的 y ⇒ 是函數。', '(乙) 一個 x 對到兩個 y ⇒ 不是函數。'],
          ans: '(甲) 是函數'
        }
      },

      {
        sec: '2-1', secName: '函數與函數圖形',
        title: '判斷「是不是函數」：垂直線檢驗',
        points: [
          '同一個 \\(x\\) 只能有<b>一個</b> \\(y\\)——這是函數的鐵則。',
          '<span class="k">垂直線檢驗法</span>：任何一條鉛直線，最多只能和圖形交<b>一個</b>點。',
          '若交超過一點 ⇒ 同一個 x 對到多個 y ⇒ <b>不是</b>函數。'
        ],
        visual: (h) => {
          const L = SV.plane({ x0: 36, y0: 18, w: 150, h: 150, xmin: -4, xmax: 4, ymin: -4, ymax: 4 });
          const R = SV.plane({ x0: 262, y0: 18, w: 150, h: 150, xmin: -4, xmax: 4, ymin: -4, ymax: 4 });
          let s = L.defs + L.svg;
          s += `<line x1="${L.X(-3)}" y1="${L.Y(-4)}" x2="${L.X(3)}" y2="${L.Y(2)}" stroke="${C}" stroke-width="3"/>`;
          s += `<line x1="${L.X(1)}" y1="${L.Y(-4)}" x2="${L.X(1)}" y2="${L.Y(4)}" stroke="#059669" stroke-width="2" stroke-dasharray="5 4"/>`;
          s += SV.dot(L.X(1), L.Y(0), '#059669', 5);
          s += `<text x="111" y="212" text-anchor="middle" font-size="13" font-weight="900" fill="#059669">✓ 只交一次 → 是函數</text>`;
          s += R.svg;
          s += `<line x1="${R.X(2)}" y1="${R.Y(-4)}" x2="${R.X(2)}" y2="${R.Y(4)}" stroke="#e11d48" stroke-width="2" stroke-dasharray="5 4"/>`;
          s += SV.dot(R.X(2), R.Y(1), '#e11d48', 5) + SV.dot(R.X(2), R.Y(3), '#e11d48', 5) + SV.dot(R.X(-2), R.Y(-1), '#e11d48', 5) + SV.dot(R.X(-2), R.Y(-3), '#e11d48', 5);
          s += `<text x="337" y="212" text-anchor="middle" font-size="13" font-weight="900" fill="#e11d48">✗ 交兩點 → 不是函數</text>`;
          h.innerHTML = `<div style="width:100%;text-align:center"><svg viewBox="0 0 448 228" style="max-width:100%">${s}</svg></div>`;
        },
        caption: '左：每條垂直線只交一次；右：同一個 x（虛線）對到兩個 y。',
        example: {
          q: '一個「躺著的拋物線」（一個 x 對到上下兩個 y），是函數嗎？',
          steps: ['畫一條垂直線，會交到兩點。', '同一個 x 有兩個 y ⇒ 不是函數。'],
          ans: '不是函數'
        }
      },

      {
        sec: '2-1', secName: '函數與函數圖形',
        title: '函數值 f(x)：代進去算',
        points: [
          '\\(f(x)\\) 表示「把 \\(x\\) 代入規則後算出的值」。',
          '\\(f(3)\\) 就是把式子裡的 \\(x\\) 全部換成 3。',
          '代入是本章最基本、也最常考的動作。'
        ],
        formula: { label: '例', tex: 'f(x)=2x+1 \\Rightarrow f(3)=2\\times3+1=7' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '函數規則', tex: 'f(x)=2x+1', color: C, fill: '#f3eefe', border: C, size: 20 },
            { label: '把 x = 3 代入', tex: 'f(3)=2\\times 3+1=7', color: '#059669', border: '#cfe8dd' }
          ]);
        },
        example: {
          q: '設 \\(f(x)=x^2-4x\\)，求 \\(f(5)\\) 與 \\(f(-1)\\)。',
          steps: ['\\(f(5)=5^2-4\\times5=25-20=5\\)', '\\(f(-1)=(-1)^2-4\\times(-1)=1+4=5\\)'],
          ans: '\\(f(5)=5,\\ f(-1)=5\\)'
        }
      },

      {
        sec: '2-1', secName: '函數與函數圖形',
        title: '函數的三種表示法',
        points: [
          '同一個函數可以用三種方式描述，彼此互通：',
          '① <b>式子（規則）</b>：\\(y=2x+1\\)。',
          '② <b>表格</b>：列出幾組對應的 \\(x,\\ y\\)。',
          '③ <b>圖形</b>：把每組 \\((x,y)\\) 描點連線。'
        ],
        visual: (h) => {
          const P = SV.plane({ x0: 40, y0: 14, w: 150, h: 150, xmin: -3, xmax: 3, ymin: -3, ymax: 5 });
          const g = P.defs + P.svg + `<line x1="${P.X(-2)}" y1="${P.Y(-3)}" x2="${P.X(2)}" y2="${P.Y(5)}" stroke="${C}" stroke-width="3"/>`;
          const pts = [[-1, -1], [0, 1], [1, 3], [2, 5]];
          const table = `<table style="border-collapse:collapse;font-size:14px;font-weight:700">
            <tr><td style="border:1px solid #dce3ee;padding:5px 12px;background:#f3eefe">x</td>${pts.map(p => `<td style="border:1px solid #dce3ee;padding:5px 12px">${p[0]}</td>`).join('')}</tr>
            <tr><td style="border:1px solid #dce3ee;padding:5px 12px;background:#f3eefe">y</td>${pts.map(p => `<td style="border:1px solid #dce3ee;padding:5px 12px;color:${C}">${p[1]}</td>`).join('')}</tr></table>`;
          h.innerHTML = `<div style="width:100%;display:flex;flex-direction:column;gap:12px;align-items:center">
            <div style="width:80%;background:#f3eefe;border:1.5px solid ${C};border-radius:12px;padding:8px 14px;text-align:center">
              <span style="font-size:12px;font-weight:900;color:${C}">① 式子</span>　<span style="font-size:18px">\\(y=2x+1\\)</span></div>
            <div style="display:flex;gap:18px;align-items:center;justify-content:center;flex-wrap:wrap">
              <div style="text-align:center"><div style="font-size:12px;font-weight:900;color:${C};margin-bottom:5px">② 表格</div>${table}</div>
              <div style="text-align:center"><div style="font-size:12px;font-weight:900;color:${C};margin-bottom:2px">③ 圖形</div><svg viewBox="0 0 216 190" style="width:190px">${g}</svg></div>
            </div></div>`;
        },
        caption: '式子、表格、圖形描述的是<b>同一個</b>函數，可互相轉換。',
        example: {
          q: '由表格 x：1,2,3 對應 y：3,5,7，寫出這個一次函數。',
          steps: ['x 每加 1，y 加 2 ⇒ 斜率 a=2。', '代 (1,3)：\\(3=2\\times1+b\\Rightarrow b=1\\)。', '所以 \\(y=2x+1\\)。'],
          ans: '\\(y=2x+1\\)'
        }
      },

      {
        sec: '2-1', secName: '函數與函數圖形',
        title: '常數函數 y = c',
        points: [
          '不管 \\(x\\) 是多少，\\(y\\) 永遠等於同一個數 \\(c\\)。',
          '圖形是一條<b>水平</b>直線，通過 \\((0,\\,c)\\)。',
          '例：\\(y=3\\) 就是高度固定在 3 的橫線。'
        ],
        formula: { label: '常數函數', tex: 'y=c\\quad(\\text{水平線})' },
        visual: (h) => plotter(h, { a0: 0, b0: 3, lockA: true, bMin: -5, bMax: 5, color: C }),
        caption: '拖動 b：整條水平線上下平移，但永遠保持水平。',
        example: {
          q: '函數 \\(y=-2\\) 的圖形長什麼樣？點 (7, −2) 在上面嗎？',
          steps: ['\\(y=-2\\) 是通過 (0,−2) 的水平線。', '任何 x 的 y 都是 −2，故 (7,−2) 在線上。'],
          ans: '水平線；(7,−2) 在線上'
        }
      },

      {
        sec: '2-1', secName: '函數與函數圖形',
        title: '正比函數 y = ax',
        points: [
          '\\(y\\) 與 \\(x\\) 成<b>正比</b>：\\(y=ax\\)（\\(a\\neq0\\)）。',
          '圖形是通過<b>原點</b>的斜直線；\\(a\\) 是<span class="k">斜率</span>。',
          '\\(a>0\\) 往右上、\\(a<0\\) 往右下；\\(|a|\\) 越大越陡。'
        ],
        formula: { label: '正比函數', tex: 'y=ax\\quad(\\text{過原點})' },
        visual: (h) => plotter(h, { a0: 1, b0: 0, lockB: true, aMin: -3, aMax: 3, color: C }),
        caption: '拖動斜率 a：直線繞著原點轉，永遠通過 (0,0)。',
        example: {
          q: '正比函數通過 (2, 6)，求關係式。',
          steps: ['設 \\(y=ax\\)，代入 (2,6)：\\(6=a\\times2\\)。', '\\(a=3\\)，所以 \\(y=3x\\)。'],
          ans: '\\(y=3x\\)'
        }
      },

      {
        sec: '2-1', secName: '函數與函數圖形',
        title: '一次函數 y = ax + b',
        points: [
          '正比函數上下平移 \\(b\\)，就是<span class="k">一次函數</span> \\(y=ax+b\\)。',
          '\\(a\\)＝<b>斜率</b>（決定傾斜方向與陡度）；\\(b\\)＝<b>y 截距</b>（線和 y 軸的交點）。',
          '圖形一定是一條<b>直線</b>。'
        ],
        formula: { label: '一次函數', tex: 'y=ax+b\\quad(a\\neq0)' },
        visual: (h) => plotter(h, { a0: 1, b0: 2, color: C }),
        caption: '兩個滑桿：a 控傾斜、b 控高低。同時玩玩看。',
        example: {
          q: '一次函數 \\(y=2x-3\\)，求它與 x 軸、y 軸的交點。',
          steps: ['與 y 軸：令 \\(x=0\\)，\\(y=-3\\) → (0, −3)。', '與 x 軸：令 \\(y=0\\)，\\(0=2x-3\\Rightarrow x=\\tfrac32\\) → (1.5, 0)。'],
          ans: '(0, −3) 與 (1.5, 0)'
        }
      },

      {
        sec: '2-1', secName: '函數與函數圖形',
        title: '由圖形求一次函數（線型函數）',
        points: [
          '常數函數與一次函數合稱<span class="k">線型函數</span>，圖形都是直線。',
          '看圖求式子兩步驟：',
          '① 讀 <b>y 截距 b</b>：直線和 y 軸的交點。',
          '② 求 <b>斜率 a</b>：向右 1 格，直線上升幾格。'
        ],
        formula: { label: '斜率＝上升÷右移', tex: 'a=\\dfrac{\\text{上升量}}{\\text{右移量}}' },
        visual: (h) => {
          const P = SV.plane({ x0: 44, y0: 18, w: 300, h: 300, xmin: -4, xmax: 4, ymin: -4, ymax: 6 });
          let g = P.defs + P.svg;
          g += `<line x1="${P.X(-2.5)}" y1="${P.Y(2 * -2.5 + 1)}" x2="${P.X(2.5)}" y2="${P.Y(2 * 2.5 + 1)}" stroke="${C}" stroke-width="3"/>`;
          g += SV.seg(P.X(0), P.Y(1), P.X(1), P.Y(1), '#059669', 2.6) + SV.seg(P.X(1), P.Y(1), P.X(1), P.Y(3), '#059669', 2.6);
          g += `<text x="${P.X(0.5)}" y="${P.Y(1) + 16}" text-anchor="middle" font-size="12" font-weight="800" fill="#059669">右1</text>`;
          g += `<text x="${P.X(1) + 8}" y="${P.Y(2) + 4}" font-size="12" font-weight="800" fill="#059669">上2</text>`;
          g += SV.dot(P.X(0), P.Y(1), '#e11d48', 6) + `<text x="${P.X(0) - 8}" y="${P.Y(1) - 8}" text-anchor="end" font-size="12" font-weight="800" fill="#e11d48">b=1</text>`;
          h.innerHTML = `<div style="width:100%;text-align:center"><svg viewBox="0 0 ${44 + 300 + 30} ${18 + 300 + 26}" style="max-width:100%">${g}</svg>` +
            SV.fbox([{ label: '讀截距、數斜率', tex: 'a=\\dfrac{2}{1}=2,\\ b=1\\ \\Rightarrow\\ y=2x+1', color: C, size: 16 }]) + `</div>`;
        },
        caption: 'y 截距＝1、斜率＝2，直接寫出 \\(y=2x+1\\)。',
        example: {
          q: '一直線交 y 軸於 (0, 3)，向右 1 格下降 1 格，求式子。',
          steps: ['y 截距 \\(b=3\\)。', '向右 1、下降 1 ⇒ 斜率 \\(a=-1\\)。', '所以 \\(y=-x+3\\)。'],
          ans: '\\(y=-x+3\\)'
        }
      },

      {
        sec: '2-1', secName: '函數與函數圖形',
        title: '描點作圖：從表格到直線',
        points: [
          '取幾個 \\(x\\) 值，算出對應 \\(y\\)，列成<b>對應表</b>。',
          '把每組 \\((x,y)\\) 標在坐標平面上成為<b>點</b>。',
          '一次函數的點會<b>連成一條直線</b>——兩點就能定線。'
        ],
        visual: (h) => {
          const P = SV.plane({ x0: 48, y0: 24, w: 300, h: 300, xmin: -5, xmax: 5, ymin: -5, ymax: 5 });
          const pts = [[-1, -1], [0, 1], [1, 3], [2, 5]];
          let dots = pts.map(([x, y]) => x > 4 || y > 5 ? '' : `<circle cx="${P.X(x)}" cy="${P.Y(y)}" r="5" fill="${C}"/><text x="${P.X(x) + 8}" y="${P.Y(y) - 6}" font-size="11" fill="${C}">(${x},${y})</text>`).join('');
          h.innerHTML = `<div style="width:100%;text-align:center"><svg viewBox="0 0 ${48 + 300 + 26} ${24 + 300 + 34}" style="max-width:100%">
            ${P.defs}${P.svg}
            <line x1="${P.X(-3)}" y1="${P.Y(-5)}" x2="${P.X(2)}" y2="${P.Y(5)}" stroke="${C}" stroke-width="3"/>
            ${dots}
          </svg>
          <div style="margin-top:6px;display:inline-flex;gap:0;border:1px solid #dce3ee;border-radius:8px;overflow:hidden;font-size:13px">
            <div><div style="padding:5px 12px;background:#f3eefe;font-weight:800;border-bottom:1px solid #dce3ee">x</div><div style="padding:5px 12px;font-weight:800">y</div></div>
            ${pts.map(([x, y]) => `<div><div style="padding:5px 12px;border-left:1px solid #dce3ee;border-bottom:1px solid #dce3ee">${x}</div><div style="padding:5px 12px;border-left:1px solid #dce3ee;color:${C};font-weight:800">${y}</div></div>`).join('')}
          </div></div>`;
        },
        caption: '\\(y=2x+1\\) 的對應表與圖形：所有點恰好連成一直線。',
        example: {
          q: '用描點法畫 \\(y=-x+2\\)，至少取兩點。',
          steps: ['取 \\(x=0\\Rightarrow y=2\\)；\\(x=2\\Rightarrow y=0\\)。', '標出 (0,2)、(2,0) 兩點，連成直線即可。'],
          ans: '過 (0,2) 與 (2,0) 的直線'
        }
      },

      {
        sec: '2-1', secName: '函數與函數圖形',
        title: '函數圖形的應用：看圖說故事',
        points: [
          '生活中很多關係可用函數圖形表示，例如<b>時間–距離</b>圖。',
          '<b>斜率</b>代表快慢：越陡走越快；<b>水平線</b>表示停住不動。',
          '學會「從圖讀資訊」，比背公式更重要。'
        ],
        visual: (h) => {
          const P = SV.plane({ x0: 48, y0: 18, w: 320, h: 280, xmin: 0, xmax: 6, ymin: 0, ymax: 6, step: 1 });
          const pts = [[0, 0], [2, 4], [4, 4], [6, 6]];
          let g = P.defs + P.svg;
          g += `<polyline points="${pts.map(([x, y]) => `${P.X(x)},${P.Y(y)}`).join(' ')}" fill="none" stroke="${C}" stroke-width="3.5" stroke-linejoin="round"/>`;
          pts.forEach(([x, y]) => g += SV.dot(P.X(x), P.Y(y), C, 4));
          g += `<text x="${P.X(6)}" y="${P.Y(0) + 30}" text-anchor="end" font-size="12" fill="#657187">時間（分）</text>`;
          g += `<text x="${P.X(0) - 6}" y="${P.Y(6) - 2}" text-anchor="end" font-size="12" fill="#657187">距離</text>`;
          g += `<text x="${P.X(1)}" y="${P.Y(2) - 12}" text-anchor="middle" font-size="11" font-weight="800" fill="#2563eb">等速前進</text>`;
          g += `<text x="${P.X(3)}" y="${P.Y(4) - 12}" text-anchor="middle" font-size="11" font-weight="800" fill="#e11d48">靜止休息</text>`;
          g += `<text x="${P.X(5)}" y="${P.Y(5) - 14}" text-anchor="middle" font-size="11" font-weight="800" fill="#059669">繼續前進</text>`;
          h.innerHTML = `<div style="width:100%;text-align:center"><svg viewBox="0 0 ${48 + 320 + 30} ${18 + 280 + 34}" style="max-width:100%">${g}</svg></div>`;
        },
        caption: '時間–距離圖：斜線＝移動、平線＝靜止，看斜率就知道快慢。',
        example: {
          q: '上圖第 2～4 分鐘（中間平坦段），這個人在做什麼？',
          steps: ['該段圖形水平，距離沒有變化。', '距離不變 ⇒ 靜止不動（休息）。'],
          ans: '靜止休息'
        }
      }
    ]
  });
})();
