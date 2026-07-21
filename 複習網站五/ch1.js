/* ============ 第 1 章　相似形 ============
   依康軒115學年第五冊課程計畫：1-1 連比例、1-2 比例線段、1-3 縮放與相似、1-4 相似三角形的應用
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#2563eb';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }
  const lerp = (P, Q, t) => [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t];
  // 連比色塊列：items = [{v, sub, color}]，中間以 ":" 相連
  function ratioStrip(items, sep = ':') {
    return `<div style="display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:4px">` +
      items.map((it, i) => {
        const col = it.color || C;
        const sepEl = i > 0 ? `<div style="font-size:24px;font-weight:900;color:#657187;padding:0 4px">${sep}</div>` : '';
        return sepEl + `<div style="text-align:center">
          <div style="min-width:52px;padding:12px 10px;border-radius:12px;background:#fff;color:#172033;border:2px solid ${col};font-weight:900;font-size:20px;box-shadow:0 4px 10px rgba(37,99,235,.12)">${it.v}</div>
          ${it.sub ? `<div style="font-size:12px;color:#657187;margin-top:5px;font-weight:700">${it.sub}</div>` : ''}</div>`;
      }).join('') + `</div>`;
  }

  window.DECK.push({
    ch: 1,
    title: '相似形',
    color: C,
    sections: ['1-1 連比例', '1-2 比例線段', '1-3 縮放與相似', '1-4 相似三角形的應用'],
    slides: [

      /* ---------- 1-1 連比例 ---------- */
      {
        sec: '1-1', secName: '連比例',
        title: '複習：比例式與交叉相乘',
        points: [
          '兩個相等的比排在一起就是<span class="k">比例式</span>：\\(a:b=c:d\\)。',
          '\\(a,d\\) 是<b>外項</b>、\\(b,c\\) 是<b>內項</b>。',
          '成立的關鍵：<b>外項相乘＝內項相乘</b>（交叉相乘）\\(\\;ad=bc\\)。'
        ],
        formula: { label: '交叉相乘', tex: 'a:b=c:d\\;\\Longleftrightarrow\\;ad=bc' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '比例式', tex: 'a:b=c:d', color: C, fill: '#eef4ff', border: C, size: 20 },
            { label: '交叉相乘', tex: 'a\\times d=b\\times c', color: GRN, border: '#cfe8dd', size: 18 }
          ]);
        },
        caption: '比例式是本冊相似形的共同語言，交叉相乘是求未知數的萬用第一步。',
        example: {
          q: '若 \\(3:5=x:20\\)，求 \\(x\\)。',
          steps: ['交叉相乘：\\(5x=3\\times20=60\\)。', '\\(x=12\\)。'],
          ans: '\\(x=12\\)'
        }
      },

      {
        sec: '1-1', secName: '連比例',
        title: '連比 a : b : c',
        points: [
          '<b>三個以上</b>的量互相比較，用「:」連起來寫成<span class="k">連比</span>。',
          '\\(a:b:c\\) 代表 \\(a:b\\)、\\(b:c\\)、\\(a:c\\) <b>同時</b>成立。',
          '例：一杯飲料 糖 : 水 : 冰 \\(=2:5:3\\)，就是把總量分成 \\(2+5+3=10\\) 份。'
        ],
        formula: { label: '連比', tex: 'a:b:c\\quad(\\text{三量之比})' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%">${ratioStrip([
            { v: '2', sub: '糖', color: RED }, { v: '5', sub: '水', color: BLU }, { v: '3', sub: '冰', color: '#0891b2' }
          ])}<div style="text-align:center;margin-top:16px;font-size:14px;color:#172033;font-weight:800">共 2＋5＋3 = <span style="color:${C}">10</span> 份</div></div>`;
        },
        caption: '連比把「好幾個量的比」一次寫清楚，常用在配方、分配問題。',
        example: {
          q: '甲、乙、丙三人年齡比為 \\(3:4:5\\)，最小和最大相差幾份？',
          steps: ['最小 3 份、最大 5 份。', '相差 \\(5-3=2\\) 份。'],
          ans: '差 2 份'
        }
      },

      {
        sec: '1-1', secName: '連比例',
        title: '連比的化簡',
        points: [
          '連比<b>同乘或同除</b>一個非零的數，比值不變。',
          '化簡：三個數<b>同除以最大公因數</b>，變成最簡整數連比。',
          '要放大成整數時，則同乘適當的數（如遇分數）。'
        ],
        formula: { label: '化簡', tex: 'a:b:c=\\dfrac{a}{g}:\\dfrac{b}{g}:\\dfrac{c}{g}\\quad(g=\\gcd)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%">
            ${ratioStrip([{ v: '12' }, { v: '18' }, { v: '30' }])}
            <div style="text-align:center;margin:10px 0;font-size:14px;font-weight:800;color:${RED}">↓ 同除以最大公因數 6</div>
            ${ratioStrip([{ v: '2', color: GRN }, { v: '3', color: GRN }, { v: '5', color: GRN }])}</div>`;
        },
        caption: '\\(12:18:30\\) 三數同除 6，得最簡連比 \\(2:3:5\\)。',
        example: {
          q: '化簡連比 \\(8:12:20\\)。',
          steps: ['三數的最大公因數為 4。', '同除以 4：\\(2:3:5\\)。'],
          ans: '\\(2:3:5\\)'
        }
      },

      {
        sec: '1-1', secName: '連比例',
        title: '連比的合成（橋樑法）',
        points: [
          '已知 \\(a:b\\) 與 \\(b:c\\) 兩個比，想合成 \\(a:b:c\\)。',
          '把<b>共同項 \\(b\\)</b> 化成<b>相同的數</b>（取最小公倍數），另一項跟著同步調整。',
          '共同項對齊後，就能把兩個比接成一條連比。'
        ],
        formula: { label: '對齊共同項', tex: 'A:B=2:3,\\ B:C=4:5\\ \\Rightarrow\\ A:B:C=8:12:15' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: 'A : B', tex: '2:3\\;\\xrightarrow{\\times4}\\;8:12', color: BLU, fill: '#eef4ff', border: BLU, size: 16 },
            { label: 'B : C', tex: '4:5\\;\\xrightarrow{\\times3}\\;12:15', color: AMB, border: '#f0dcc0', size: 16 },
            { label: 'B 都變 12 → 合成', tex: 'A:B:C=8:12:15', color: GRN, border: '#cfe8dd', size: 18 }
          ], { gap: 9 });
        },
        caption: '共同項 B 通分成 12（\\(3,4\\) 的最小公倍數），兩比就接成 \\(8:12:15\\)。',
        example: {
          q: '\\(A:B=3:4\\)，\\(B:C=6:5\\)，求 \\(A:B:C\\)。',
          steps: ['共同項 B：\\(4,6\\) 的最小公倍數 12。', '\\(A:B=9:12\\)，\\(B:C=12:10\\)。', '合成 \\(A:B:C=9:12:10\\)。'],
          ans: '\\(9:12:10\\)'
        }
      },

      {
        sec: '1-1', secName: '連比例',
        title: '連比例式與比例分配',
        points: [
          '兩個連比相等，就是<span class="k">連比例式</span>：\\(a:b:c=d:e:f\\)。',
          '<b>比例分配</b>：把總量按連比分配時，先算<b>總份數</b>，再算<b>每份</b>。',
          '每一項 ＝ 每份 × 該項的份數。'
        ],
        formula: { label: '按連比分配', tex: '\\text{每份}=\\dfrac{總量}{a+b+c}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%;text-align:center">
            <div style="font-size:15px;font-weight:800;color:#172033;margin-bottom:12px">300 元　按　2 : 3 : 5　分配</div>
            <div style="font-size:13px;color:#657187;margin-bottom:12px">總份數 2＋3＋5 = 10 份　→　每份 300 ÷ 10 = <b style="color:${C}">30</b> 元</div>
            ${ratioStrip([
            { v: '60', sub: '2份', color: RED }, { v: '90', sub: '3份', color: BLU }, { v: '150', sub: '5份', color: '#0891b2' }
          ], '＋')}
            <div style="margin-top:12px;font-size:13px;color:#657187">60＋90＋150 = 300 ✓</div></div>`;
        },
        caption: '先求每份（總量÷總份數），再各乘份數，就完成比例分配。',
        example: {
          q: '把 360 元按 \\(3:4:5\\) 分給三人，各得多少？',
          steps: ['總份數 \\(3+4+5=12\\)，每份 \\(360\\div12=30\\)。', '各得 \\(30\\times3,\\ 30\\times4,\\ 30\\times5\\)。'],
          ans: '90、120、150 元'
        }
      },

      /* ---------- 1-2 比例線段 ---------- */
      {
        sec: '1-2', secName: '比例線段',
        title: '比例線段與比例中項',
        points: [
          '四條線段 \\(a,b,c,d\\)，若 \\(a:b=c:d\\)，就稱它們成<span class="k">比例線段</span>。',
          '長度要用<b>同一單位</b>量再比。',
          '若 \\(a:b=b:c\\)（中項重複），\\(b\\) 為 \\(a,c\\) 的<b>比例中項</b>，則 \\(b^2=ac\\)。'
        ],
        formula: { label: '比例中項', tex: 'a:b=b:c\\;\\Rightarrow\\;b^2=ac' },
        visual: (h) => {
          const bar = (x, y, len, color, lbl) =>
            SV.seg(x, y, x + len, y, color, 7) +
            `<text x="${x + len / 2}" y="${y - 12}" text-anchor="middle" font-size="14" font-weight="800" fill="${color}">${lbl}</text>`;
          h.innerHTML = svg('0 0 420 250', `
            ${bar(40, 50, 80, BLU, 'a = 4')}
            ${bar(40, 110, 120, BLU, 'b = 6')}
            ${bar(40, 170, 120, GRN, 'c = 6')}
            ${bar(40, 230, 180, GRN, 'd = 9')}
            <text x="300" y="120" font-size="15" font-weight="800" fill="#172033">a : b = 2 : 3</text>
            <text x="300" y="200" font-size="15" font-weight="800" fill="#172033">c : d = 2 : 3</text>
            <text x="300" y="235" font-size="14" fill="${RED}" font-weight="800">兩比相等 ⇒ 成比例</text>`);
        },
        caption: '四線段長度的比若相等，就成比例線段（\\(4:6=6:9\\)）。',
        example: {
          q: '線段 \\(a=4\\)、\\(b=6\\)、\\(c=6\\)，求 \\(d\\) 使 \\(a:b=c:d\\)。',
          steps: ['\\(4:6=6:d\\)，交叉相乘 \\(4d=36\\)。', '\\(d=9\\)。'],
          ans: '\\(d=9\\)'
        }
      },

      {
        sec: '1-2', secName: '比例線段',
        title: '平行線截線段成比例',
        points: [
          '一組<b>平行線</b>被兩條截線所截，截出的線段對應成<span class="k">比例</span>。',
          '\\(L_1\\parallel L_2\\parallel L_3\\Rightarrow \\overline{AB}:\\overline{BC}=\\overline{DE}:\\overline{EF}\\)。',
          '拖滑桿移動中間的平行線，兩側的比<b>一起變、永遠相等</b>。'
        ],
        formula: { label: '平行截比例', tex: '\\overline{AB}:\\overline{BC}=\\overline{DE}:\\overline{EF}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="par"></div>
            <div class="ictrl"><label>中間線位置 <span class="ival" id="pv">140</span></label><input type="range" id="ps" min="90" max="210" value="140"></div></div>`;
          const y1 = 50, y3 = 250, xL = 40, xR = 400;
          const T1 = [90, 20], T1b = [200, 285], T2 = [300, 20], T2b = [370, 285];
          const xatL = y => T1[0] + (T1b[0] - T1[0]) * (y - T1[1]) / (T1b[1] - T1[1]);
          const xatR = y => T2[0] + (T2b[0] - T2[0]) * (y - T2[1]) / (T2b[1] - T2[1]);
          const gcd = (a, b) => b ? gcd(b, a % b) : a;
          const draw = () => {
            const y2 = +h.querySelector('#ps').value; h.querySelector('#pv').textContent = y2;
            const A = [xatL(y1), y1], B = [xatL(y2), y2], Cc = [xatL(y3), y3];
            const D = [xatR(y1), y1], E = [xatR(y2), y2], F = [xatR(y3), y3];
            const ab = Math.round(y2 - y1), bc = Math.round(y3 - y2), g = Math.max(1, gcd(ab, bc));
            let s = '';
            [y1, y2, y3].forEach((y, i) => s += SV.seg(xL, y, xR, y, '#9aa4b6', 2, i === 1 ? '6 5' : ''));
            s += SV.seg(T1[0], T1[1], T1b[0], T1b[1], '#334', 2.6) + SV.seg(T2[0], T2[1], T2b[0], T2b[1], '#334', 2.6);
            s += SV.seg(A[0], A[1], B[0], B[1], BLU, 6) + SV.seg(B[0], B[1], Cc[0], Cc[1], GRN, 6);
            s += SV.seg(D[0], D[1], E[0], E[1], BLU, 6) + SV.seg(E[0], E[1], F[0], F[1], GRN, 6);
            [[A, 'A', -20], [B, 'B', -20], [Cc, 'C', -20]].forEach(([P, n, dx]) => { s += SV.dot(P[0], P[1], '#172033', 4) + SV.vlabel(P[0] + dx, P[1] + 5, n); });
            [[D, 'D'], [E, 'E'], [F, 'F']].forEach(([P, n]) => { s += SV.dot(P[0], P[1], '#172033', 4) + SV.vlabel(P[0] + 10, P[1] + 5, n); });
            s += `<text x="150" y="20" font-size="13" font-weight="800" fill="#172033">AB:BC = ${ab / g}:${bc / g}</text>`;
            s += `<text x="150" y="278" font-size="13" font-weight="800" fill="#172033">DE:EF = ${ab / g}:${bc / g}</text>`;
            h.querySelector('#par').innerHTML = svg('0 0 440 300', s);
          };
          h.querySelector('#ps').oninput = draw; draw();
        },
        caption: '不論中間線移到哪，左邊 AB:BC 與右邊 DE:EF <b>永遠相等</b>。',
        example: {
          q: '三平行線截得左側 \\(\\overline{AB}=6,\\overline{BC}=9\\)，右側 \\(\\overline{DE}=4\\)，求 \\(\\overline{EF}\\)。',
          steps: ['\\(6:9=4:\\overline{EF}\\)，交叉相乘 \\(6\\,\\overline{EF}=36\\)。', '\\(\\overline{EF}=6\\)。'],
          ans: '\\(\\overline{EF}=6\\)'
        }
      },

      {
        sec: '1-2', secName: '比例線段',
        title: '三角形內的平行線',
        points: [
          '三角形一邊的<b>平行線</b>，截另外兩邊成<span class="k">比例</span>。',
          '\\(\\overline{DE}\\parallel\\overline{BC}\\Rightarrow \\overline{AD}:\\overline{DB}=\\overline{AE}:\\overline{EC}\\)。',
          '這也是「\\(\\triangle ADE\\sim\\triangle ABC\\)」的前奏——拖滑桿看比例。'
        ],
        formula: { label: '截比例', tex: '\\overline{AD}:\\overline{DB}=\\overline{AE}:\\overline{EC}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="tpar"></div>
            <div class="ictrl"><label>D 在 AB 上的位置 <span class="ival" id="tv">0.45</span></label><input type="range" id="ts" min="0.2" max="0.8" step="0.01" value="0.45"></div></div>`;
          const A = [210, 40], B = [60, 270], Cc = [380, 270];
          const gcd = (a, b) => b ? gcd(b, a % b) : a;
          const draw = () => {
            const t = +h.querySelector('#ts').value; h.querySelector('#tv').textContent = t.toFixed(2);
            const D = lerp(A, B, t), E = lerp(A, Cc, t);
            let s = SV.poly([A, B, Cc], 'rgba(37,99,235,0.05)', C, 2.6);
            s += SV.seg(D[0], D[1], E[0], E[1], RED, 3);
            s += SV.dot(A[0], A[1], '#172033', 4) + SV.vlabel(A[0] - 6, A[1] - 8, 'A');
            s += SV.dot(B[0], B[1], '#172033', 4) + SV.vlabel(B[0] - 18, B[1] + 8, 'B');
            s += SV.dot(Cc[0], Cc[1], '#172033', 4) + SV.vlabel(Cc[0] + 6, Cc[1] + 8, 'C');
            s += SV.dot(D[0], D[1], RED, 4.5) + SV.vlabel(D[0] - 20, D[1], 'D');
            s += SV.dot(E[0], E[1], RED, 4.5) + SV.vlabel(E[0] + 8, E[1], 'E');
            const ad = Math.round(t * 100), db = Math.round((1 - t) * 100), g = gcd(ad, db);
            s += `<text x="210" y="300" text-anchor="middle" font-size="14" font-weight="800" fill="#172033">AD:DB = AE:EC = ${ad / g}:${db / g}</text>`;
            s += `<text x="150" y="150" font-size="12" font-weight="800" fill="${RED}">DE ∥ BC</text>`;
            h.querySelector('#tpar').innerHTML = svg('0 0 440 315', s);
          };
          h.querySelector('#ts').oninput = draw; draw();
        },
        caption: '\\(\\overline{DE}\\parallel \\overline{BC}\\) 時，D、E 把兩腰切成<b>相同比例</b>。',
        example: {
          q: '\\(\\overline{DE}\\parallel\\overline{BC}\\)，\\(\\overline{AD}=4,\\overline{DB}=6,\\overline{AE}=5\\)，求 \\(\\overline{EC}\\)。',
          steps: ['\\(4:6=5:\\overline{EC}\\)，交叉相乘 \\(4\\,\\overline{EC}=30\\)。', '\\(\\overline{EC}=7.5\\)。'],
          ans: '\\(\\overline{EC}=7.5\\)'
        }
      },

      {
        sec: '1-2', secName: '比例線段',
        title: '中點連線定理',
        points: [
          '三角形<b>兩邊中點</b>的連線段，<b>平行</b>於第三邊，且長度是第三邊的<b>一半</b>。',
          '這是平行截比例線段在「\\(\\overline{AD}:\\overline{DB}=1:1\\)」時的特例。',
          '\\(D,E\\) 為 \\(\\overline{AB},\\overline{AC}\\) 中點 \\(\\Rightarrow \\overline{DE}\\parallel\\overline{BC}\\) 且 \\(\\overline{DE}=\\tfrac12\\overline{BC}\\)。'
        ],
        formula: { label: '中點連線', tex: '\\overline{DE}\\parallel\\overline{BC},\\ \\overline{DE}=\\tfrac12\\,\\overline{BC}' },
        visual: (h) => {
          const A = [210, 45], B = [60, 265], Cc = [380, 265];
          const D = mid(A, B), E = mid(A, Cc);
          function mid(P, Q) { return [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]; }
          let s = SV.poly([A, B, Cc], 'rgba(37,99,235,0.05)', C, 2.6);
          s += SV.seg(D[0], D[1], E[0], E[1], RED, 3.2);
          s += SV.ticks(A[0], A[1], D[0], D[1], 1, GRN) + SV.ticks(D[0], D[1], B[0], B[1], 1, GRN);
          s += SV.ticks(A[0], A[1], E[0], E[1], 2, VIO) + SV.ticks(E[0], E[1], Cc[0], Cc[1], 2, VIO);
          s += SV.dot(A[0], A[1], '#172033', 4) + SV.vlabel(A[0] - 6, A[1] - 8, 'A');
          s += SV.dot(B[0], B[1], '#172033', 4) + SV.vlabel(B[0] - 18, B[1] + 8, 'B');
          s += SV.dot(Cc[0], Cc[1], '#172033', 4) + SV.vlabel(Cc[0] + 6, Cc[1] + 8, 'C');
          s += SV.dot(D[0], D[1], RED, 4.5) + SV.vlabel(D[0] - 20, D[1], 'D');
          s += SV.dot(E[0], E[1], RED, 4.5) + SV.vlabel(E[0] + 8, E[1], 'E');
          s += `<text x="${(D[0] + E[0]) / 2}" y="${D[1] - 10}" text-anchor="middle" font-size="12" font-weight="800" fill="${RED}">DE = ½ BC</text>`;
          h.innerHTML = svg('0 0 440 300', s);
        },
        caption: 'D、E 是兩腰中點 ⇒ \\(\\overline{DE}\\) 平行且等於底邊 \\(\\overline{BC}\\) 的一半。',
        example: {
          q: '\\(D,E\\) 分別為 \\(\\overline{AB},\\overline{AC}\\) 中點，\\(\\overline{BC}=10\\)，求 \\(\\overline{DE}\\)。',
          steps: ['中點連線 \\(\\overline{DE}=\\tfrac12 \\overline{BC}\\)。', '\\(\\overline{DE}=\\tfrac12\\times10=5\\)。'],
          ans: '\\(\\overline{DE}=5\\)'
        }
      },

      /* ---------- 1-3 縮放與相似 ---------- */
      {
        sec: '1-3', secName: '縮放與相似',
        title: '相似：形狀相同，大小可不同',
        points: [
          '把圖形<b>等比例放大或縮小</b>，得到的新圖形與原圖<span class="k">相似</span>，記作「\\(\\sim\\)」。',
          '相似的兩圖：<b>對應角都相等</b>、<b>對應邊都成比例</b>。',
          '拖滑桿改變放大倍率 \\(k\\)，形狀不變、只有大小變。'
        ],
        formula: { label: '相似記號', tex: '\\text{圖形甲}\\sim\\text{圖形乙}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="sim"></div>
            <div class="ictrl"><label>放大倍率 k <span class="ival" id="kv">1.5</span></label><input type="range" id="ks" min="0.5" max="2" step="0.1" value="1.5"></div></div>`;
          const base = [[0, 0], [70, 0], [70, 20], [30, 20], [30, 90], [0, 90]];
          const draw = () => {
            const k = +h.querySelector('#ks').value; h.querySelector('#kv').textContent = k.toFixed(1);
            const o = base.map(p => [40 + p[0], 200 - p[1]]);
            const s2 = base.map(p => [230 + p[0] * k, 240 - p[1] * k]);
            let s = SV.poly(o, 'rgba(148,163,184,0.15)', '#94a3b8', 2.4) + SV.poly(s2, 'rgba(37,99,235,0.12)', C, 2.6);
            s += `<text x="75" y="230" text-anchor="middle" font-size="13" font-weight="800" fill="#94a3b8">原圖</text>`;
            s += `<text x="${230 + 35 * k}" y="255" text-anchor="middle" font-size="13" font-weight="800" fill="${C}">放大 ${k.toFixed(1)} 倍</text>`;
            h.querySelector('#sim').innerHTML = svg('0 0 440 270', s);
          };
          h.querySelector('#ks').oninput = draw; draw();
        },
        caption: '不管放大或縮小，角度不變、邊長同倍——這就是相似。',
        example: {
          q: '把邊長 3、4、5 的三角形放大 2 倍，新三角形三邊各多長？',
          steps: ['每邊都乘 2。'],
          ans: '6、8、10'
        }
      },

      {
        sec: '1-3', secName: '縮放與相似',
        title: '相似多邊形的兩個條件',
        points: [
          '兩多邊形相似，必須<b>同時</b>滿足：',
          '① 對應角<b>都相等</b>；　② 對應邊<b>都成比例</b>。',
          '缺一不可：只有角相等（如矩形）或只有邊成比例（如菱形與正方形），都不算相似。'
        ],
        formula: { label: '相似定義', tex: '\\text{對應角相等}\\;\\wedge\\;\\text{對應邊成比例}' },
        visual: (h) => {
          const q1 = [[40, 60], [150, 60], [175, 170], [30, 170]];
          const q2 = [[250, 70], [360, 70], [385, 180], [240, 180]];
          let s = SV.poly(q1, 'rgba(37,99,235,0.08)', C) + SV.poly(q2, 'rgba(5,150,105,0.08)', GRN);
          ['A', 'B', 'C', 'D'].forEach((n, i) => s += SV.vlabel(q1[i][0] - 4, q1[i][1] - 6, n, C, 14));
          ['E', 'F', 'G', 'H'].forEach((n, i) => s += SV.vlabel(q2[i][0] - 4, q2[i][1] - 6, n, GRN, 14));
          s += `<text x="107" y="205" text-anchor="middle" font-size="13" fill="#657187">四邊形 ABCD</text>`;
          s += `<text x="312" y="205" text-anchor="middle" font-size="13" fill="#657187">四邊形 EFGH</text>`;
          s += `<text x="220" y="120" text-anchor="middle" font-size="24" fill="${RED}">~</text>`;
          h.innerHTML = svg('0 0 430 220', s);
        },
        caption: '\\(ABCD\\sim EFGH\\)：對應角相等，且 \\(\\overline{AB}:\\overline{EF}=\\overline{BC}:\\overline{FG}=\\cdots\\)。',
        example: {
          q: '兩個長方形一定相似嗎？',
          steps: ['四個角都是 90°（角相等 ✔），但長寬比可能不同（邊未必成比例 ✘）。'],
          ans: '不一定相似'
        }
      },

      {
        sec: '1-3', secName: '縮放與相似',
        title: '相似比、周長比與對應高比',
        points: [
          '相似兩圖形，<b>對應邊長的比</b>叫<span class="k">相似比</span>（縮放比）。',
          '<b>周長比</b>＝相似比；三角形的<b>對應高之比</b>也＝相似比。',
          '每一組對應邊算出來的比都相等。'
        ],
        formula: { label: '都等於相似比 k', tex: '\\dfrac{周長_{甲}}{周長_{乙}}=\\dfrac{對應高_{甲}}{對應高_{乙}}=k' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '相似比 k', tex: 'k=\\dfrac{\\overline{AB}}{\\overline{A\'B\'}}=\\dfrac{\\overline{BC}}{\\overline{B\'C\'}}=\\cdots', color: C, fill: '#eef4ff', border: C, size: 16 },
            { label: '周長比＝對應高比＝相似比', tex: '\\dfrac{周長}{周長}=\\dfrac{高}{高}=k', color: GRN, border: '#cfe8dd', size: 16 }
          ]);
        },
        caption: '長度類（邊、周長、對應高）的比，全都等於相似比 \\(k\\)。',
        example: {
          q: '兩相似三角形相似比 \\(2:3\\)，小三角形周長 20，求大三角形周長。',
          steps: ['周長比＝相似比 \\(2:3\\)。', '\\(20:x=2:3\\Rightarrow x=30\\)。'],
          ans: '周長 30'
        }
      },

      {
        sec: '1-3', secName: '縮放與相似',
        title: '面積比 = 相似比的平方',
        points: [
          '相似比是 \\(k\\)（邊長變 \\(k\\) 倍），面積會變 <b>\\(k^2\\)</b> 倍。',
          '因為面積是「長 × 寬」，兩個方向各放大 \\(k\\) 倍。',
          '拖滑桿把邊放大 \\(k\\) 倍，數數看小方格變成幾個（\\(k^2\\) 個）。'
        ],
        formula: { label: '面積比', tex: '\\dfrac{S_{甲}}{S_{乙}}=k^2' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="area"></div>
            <div class="ictrl"><label>相似比 k <span class="ival" id="av">2</span></label><input type="range" id="as" min="1" max="4" step="1" value="2"></div></div>`;
          const u = 46, ox = 90, oy = 30;
          const draw = () => {
            const k = +h.querySelector('#as').value; h.querySelector('#av').textContent = k;
            let s = '';
            for (let r = 0; r < k; r++) for (let c = 0; c < k; c++)
              s += `<rect x="${ox + c * u}" y="${oy + r * u}" width="${u - 3}" height="${u - 3}" rx="4" fill="${C}" opacity="0.8"/>`;
            s += `<text x="${ox + k * u / 2}" y="${oy + k * u + 22}" text-anchor="middle" font-size="14" font-weight="800" fill="#172033">邊放大 ${k} 倍 → 面積 ${k}² = <tspan fill="${C}">${k * k}</tspan> 倍</text>`;
            h.querySelector('#area').innerHTML = svg(`0 0 440 ${oy + 4 * u + 40}`, s);
          };
          h.querySelector('#as').oninput = draw; draw();
        },
        caption: '邊放大 \\(k\\) 倍，格子從 1 變成 \\(k^2\\) 個——面積是相似比的平方。',
        example: {
          q: '兩相似圖形相似比 \\(2:3\\)，小圖面積 12，求大圖面積。',
          steps: ['面積比 \\(=2^2:3^2=4:9\\)。', '\\(12:x=4:9\\Rightarrow x=27\\)。'],
          ans: '面積 27'
        }
      },

      {
        sec: '1-3', secName: '縮放與相似',
        title: '判別法 ① AA：兩角對應相等',
        points: [
          '兩三角形有<b>兩組對應角相等</b>，就<span class="k">相似</span>（AA）。',
          '理由：內角和 180°，兩角定了第三角自動相等。',
          'AA 是相似三角形<b>最常用</b>的判別法。'
        ],
        formula: { label: 'AA 相似', tex: '\\angle A=\\angle D,\\ \\angle B=\\angle E\\Rightarrow\\triangle ABC\\sim\\triangle DEF' },
        visual: (h) => {
          const L = { A: [40, 40], B: [30, 180], Cc: [170, 180] };
          const R = { A: [260, 30], B: [246, 200], Cc: [410, 200] };
          let s = SV.poly([L.A, L.B, L.Cc], 'rgba(37,99,235,0.06)', C) + SV.poly([R.A, R.B, R.Cc], 'rgba(5,150,105,0.06)', GRN);
          s += SV.angle(L.B[0], L.B[1], 22, 0, 84, RED, '', { w: 3 }) + SV.angle(R.B[0], R.B[1], 26, 0, 84, RED, '', { w: 3 });
          s += SV.angle(L.Cc[0], L.Cc[1], 22, 96, 180, BLU, '', { w: 3 }) + SV.angle(R.Cc[0], R.Cc[1], 26, 96, 180, BLU, '', { w: 3 });
          s += SV.vlabel(L.A[0] - 6, L.A[1] - 6, 'A') + SV.vlabel(L.B[0] - 18, L.B[1] + 8, 'B') + SV.vlabel(L.Cc[0] + 6, L.Cc[1] + 8, 'C');
          s += SV.vlabel(R.A[0] - 6, R.A[1] - 6, 'D') + SV.vlabel(R.B[0] - 18, R.B[1] + 8, 'E') + SV.vlabel(R.Cc[0] + 6, R.Cc[1] + 8, 'F');
          h.innerHTML = svg('0 0 440 220', s);
        },
        caption: '兩組角（紅、藍）分別相等 ⇒ 兩三角形相似。',
        example: {
          q: '\\(\\angle A=\\angle D=50^\\circ\\)、\\(\\angle B=\\angle E=60^\\circ\\)，兩三角形相似嗎？',
          steps: ['兩組對應角相等，符合 AA。'],
          ans: '相似（AA）'
        }
      },

      {
        sec: '1-3', secName: '縮放與相似',
        title: '判別法 ② SAS：兩邊成比例、夾角相等',
        points: [
          '兩三角形<b>兩組對應邊成比例</b>，且<b>夾角相等</b>，則相似（SAS）。',
          '關鍵：相等的角必須是這兩邊的<b>夾角</b>。',
          '\\(\\dfrac{\\overline{AB}}{\\overline{DE}}=\\dfrac{\\overline{AC}}{\\overline{DF}}\\) 且 \\(\\angle A=\\angle D\\)。'
        ],
        formula: { label: 'SAS 相似', tex: '\\dfrac{AB}{DE}=\\dfrac{AC}{DF},\\ \\angle A=\\angle D' },
        visual: (h) => {
          const L = { A: [90, 40], B: [40, 170], Cc: [170, 150] };
          const R = { A: [330, 30], B: [250, 225], Cc: [455, 195] };
          let s = SV.poly([L.A, L.B, L.Cc], 'rgba(37,99,235,0.06)', C) + SV.poly([R.A, R.B, R.Cc], 'rgba(5,150,105,0.06)', GRN);
          s += SV.angle(L.A[0], L.A[1], 22, 250, 315, RED, '', { w: 3, fill: 1 }) + SV.angle(R.A[0], R.A[1], 26, 250, 315, RED, '', { w: 3, fill: 1 });
          s += SV.ticks(L.A[0], L.A[1], L.B[0], L.B[1], 1, AMB) + SV.ticks(R.A[0], R.A[1], R.B[0], R.B[1], 1, AMB);
          s += SV.ticks(L.A[0], L.A[1], L.Cc[0], L.Cc[1], 2, VIO) + SV.ticks(R.A[0], R.A[1], R.Cc[0], R.Cc[1], 2, VIO);
          s += SV.vlabel(L.A[0] - 4, L.A[1] - 8, 'A') + SV.vlabel(R.A[0] - 4, R.A[1] - 8, 'D');
          s += `<text x="150" y="205" font-size="12" fill="#657187">兩邊比相同、夾角 A=D 相等</text>`;
          h.innerHTML = svg('0 0 480 230', s);
        },
        caption: '夾角（紅）相等，且夾這角的兩邊（黃、紫）成比例 ⇒ 相似。',
        example: {
          q: '\\(\\angle A=\\angle D\\)，\\(\\overline{AB}=4,\\overline{AC}=6\\)，\\(\\overline{DE}=6,\\overline{DF}=9\\)，相似嗎？',
          steps: ['\\(\\dfrac46=\\dfrac69=\\dfrac23\\)，且夾角相等 ⇒ SAS。'],
          ans: '相似（SAS）'
        }
      },

      {
        sec: '1-3', secName: '縮放與相似',
        title: '判別法 ③ SSS：三邊對應成比例',
        points: [
          '兩三角形<b>三組對應邊都成比例</b>，則相似（SSS）。',
          '即 \\(\\dfrac{\\overline{AB}}{\\overline{DE}}=\\dfrac{\\overline{BC}}{\\overline{EF}}=\\dfrac{\\overline{CA}}{\\overline{FD}}\\)。',
          '和全等的 SSS 類比：全等要邊<b>相等</b>，相似只要邊<b>成比例</b>。'
        ],
        formula: { label: 'SSS 相似', tex: '\\dfrac{AB}{DE}=\\dfrac{BC}{EF}=\\dfrac{CA}{FD}' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '三邊對應成比例', tex: '\\dfrac{AB}{DE}=\\dfrac{BC}{EF}=\\dfrac{CA}{FD}=k', color: C, fill: '#eef4ff', border: C, size: 17 },
            { label: '例：3,4,5 與 6,8,10', tex: '\\dfrac36=\\dfrac48=\\dfrac{5}{10}=\\dfrac12', color: GRN, border: '#cfe8dd', note: '三比都是 ½ ⇒ 相似' }
          ]);
        },
        caption: '三組邊長比都相等，就能斷定兩三角形相似。',
        example: {
          q: '三邊 \\(6,9,12\\) 與 \\(8,12,16\\) 的兩三角形相似嗎？',
          steps: ['\\(\\dfrac68=\\dfrac{9}{12}=\\dfrac{12}{16}=\\dfrac34\\) ⇒ SSS。'],
          ans: '相似（SSS）'
        }
      },

      /* ---------- 1-4 相似三角形的應用 ---------- */
      {
        sec: '1-4', secName: '相似三角形的應用',
        title: '用相似求未知邊長',
        points: [
          '確定兩三角形相似後，<b>對應邊成比例</b>就能列式求邊。',
          '關鍵：先把<b>對應頂點</b>對好（相似記號的字母順序＝對應順序）。',
          '\\(\\triangle ABC\\sim\\triangle DEF\\Rightarrow \\dfrac{\\overline{AB}}{\\overline{DE}}=\\dfrac{\\overline{BC}}{\\overline{EF}}=\\dfrac{\\overline{CA}}{\\overline{FD}}\\)。'
        ],
        formula: { label: '對應邊成比例', tex: '\\dfrac{AB}{DE}=\\dfrac{BC}{EF}' },
        visual: (h) => {
          const L = { A: [70, 40], B: [40, 160], Cc: [150, 160] };
          const R = { A: [300, 30], B: [255, 210], Cc: [420, 210] };
          let s = SV.poly([L.A, L.B, L.Cc], 'rgba(37,99,235,0.06)', C) + SV.poly([R.A, R.B, R.Cc], 'rgba(5,150,105,0.06)', GRN);
          s += `<text x="30" y="110" font-size="12" font-weight="800" fill="${C}">6</text>`;
          s += `<text x="95" y="178" font-size="12" font-weight="800" fill="${C}">8</text>`;
          s += `<text x="248" y="130" font-size="12" font-weight="800" fill="${GRN}">9</text>`;
          s += `<text x="335" y="228" font-size="12" font-weight="800" fill="${RED}">?</text>`;
          s += SV.vlabel(L.A[0] - 4, L.A[1] - 6, 'A') + SV.vlabel(L.B[0] - 18, L.B[1] + 8, 'B') + SV.vlabel(L.Cc[0] + 6, L.Cc[1] + 8, 'C');
          s += SV.vlabel(R.A[0] - 4, R.A[1] - 6, 'D') + SV.vlabel(R.B[0] - 18, R.B[1] + 8, 'E') + SV.vlabel(R.Cc[0] + 6, R.Cc[1] + 8, 'F');
          h.innerHTML = svg('0 0 440 235', s);
        },
        caption: '\\(\\overline{AB}=6\\) 對 \\(\\overline{DE}=9\\)（比 2:3），用比例求 \\(\\overline{EF}\\)。',
        example: {
          q: '\\(\\triangle ABC\\sim\\triangle DEF\\)，\\(\\overline{AB}=6,\\overline{BC}=8,\\overline{DE}=9\\)，求 \\(\\overline{EF}\\)。',
          steps: ['\\(\\dfrac69=\\dfrac{8}{\\overline{EF}}\\Rightarrow 6\\,\\overline{EF}=72\\)。', '\\(\\overline{EF}=12\\)。'],
          ans: '\\(\\overline{EF}=12\\)'
        }
      },

      {
        sec: '1-4', secName: '相似三角形的應用',
        title: '相似的應用：測量高度',
        points: [
          '無法直接量的高度（樹、旗桿），可用<b>影子</b>配相似三角形算出。',
          '同一時刻，物體與影子構成的兩個直角三角形<b>相似</b>（太陽光平行、AA）。',
          '列比例：\\(\\dfrac{人高}{人影}=\\dfrac{樹高}{樹影}\\)。'
        ],
        formula: { label: '影子測高', tex: '\\dfrac{人高}{人影}=\\dfrac{樹高}{樹影}' },
        visual: (h) => {
          let s = SV.seg(40, 250, 420, 250, '#8a94a6', 2.4);
          s += SV.seg(70, 250, 70, 195, '#334', 5) + SV.seg(70, 250, 110, 250, '#f59e0b', 5);
          s += `<text x="52" y="225" font-size="12" font-weight="800" fill="#334">1.6</text>`;
          s += `<text x="90" y="268" font-size="11" fill="#f59e0b">影 2</text>`;
          s += SV.seg(70, 195, 110, 250, '#e11d48', 2, '4 3');
          s += SV.seg(300, 250, 300, 90, GRN, 6) + SV.seg(300, 250, 400, 250, '#f59e0b', 5);
          s += `<text x="278" y="175" font-size="13" font-weight="800" fill="${GRN}">?</text>`;
          s += `<text x="345" y="268" font-size="11" fill="#f59e0b">影 10</text>`;
          s += SV.seg(300, 90, 400, 250, '#e11d48', 2, '4 3');
          s += `<text x="230" y="60" font-size="12" fill="#657187">太陽光平行 ⇒ 兩直角三角形相似</text>`;
          h.innerHTML = svg('0 0 440 285', s);
        },
        caption: '人與樹在同一時刻的影子構成相似直角三角形。',
        example: {
          q: '身高 1.6m 的人影長 2m，同時樹影長 10m，求樹高。',
          steps: ['\\(\\dfrac{1.6}{2}=\\dfrac{h}{10}\\Rightarrow 2h=16\\)。', '\\(h=8\\)。'],
          ans: '樹高 8 公尺'
        }
      },

      {
        sec: '1-4', secName: '相似三角形的應用',
        title: '直角三角形斜邊上的高（母子相似）',
        points: [
          '直角三角形<b>斜邊上的高</b>，把大三角形切成<b>兩個小三角形</b>。',
          '這兩個小三角形和原本的大三角形<b>都相似</b>（母子相似）。',
          '常用結果：高 \\(h\\) 是斜邊兩段 \\(p,q\\) 的<b>比例中項</b>，\\(h^2=p\\,q\\)。'
        ],
        formula: { label: '高的比例中項', tex: 'h^2=p\\times q' },
        visual: (h) => {
          const A = [60, 240], H = [156, 240], B = [372, 240], Cc = [156, 96];
          let s = SV.poly([A, B, Cc], 'rgba(37,99,235,0.05)', C, 2.6);
          s += SV.seg(Cc[0], Cc[1], H[0], H[1], RED, 2.6);
          s += SV.rightAngle(Cc[0], Cc[1], SV.angleOf(Cc[0], Cc[1], A[0], A[1]), SV.angleOf(Cc[0], Cc[1], B[0], B[1]), 14, '#657187');
          s += SV.rightAngle(H[0], H[1], 90, 180, 12, RED);
          s += SV.dot(A[0], A[1], '#172033', 4) + SV.vlabel(A[0] - 16, A[1] + 8, 'A');
          s += SV.dot(B[0], B[1], '#172033', 4) + SV.vlabel(B[0] + 6, B[1] + 8, 'B');
          s += SV.dot(Cc[0], Cc[1], '#172033', 4) + SV.vlabel(Cc[0] - 6, Cc[1] - 8, 'C');
          s += SV.dot(H[0], H[1], RED, 4) + SV.vlabel(H[0] - 6, H[1] + 20, 'H');
          s += `<text x="105" y="235" font-size="12" font-weight="800" fill="#334">p=4</text>`;
          s += `<text x="255" y="235" font-size="12" font-weight="800" fill="#334">q=9</text>`;
          s += `<text x="162" y="175" font-size="12" font-weight="800" fill="${RED}">h</text>`;
          h.innerHTML = svg('0 0 440 275', s);
        },
        caption: '\\(\\triangle ACH\\sim\\triangle CBH\\sim\\triangle ABC\\)；高 \\(h\\) 滿足 \\(h^2=\\overline{AH}\\cdot \\overline{HB}\\)。',
        example: {
          q: '直角三角形斜邊上的高把斜邊分成 4 與 9，求這條高。',
          steps: ['\\(h^2=4\\times9=36\\)。', '\\(h=6\\)。'],
          ans: '高 \\(=6\\)'
        }
      },

      {
        sec: '1-4', secName: '相似三角形的應用',
        title: '特殊直角三角形的邊長比',
        points: [
          '某銳角的角度決定直角三角形三邊的<b>比值</b>，此比值<b>不因大小而改變</b>（相似）。',
          '<b>45°–45°–90°</b>（等腰直角）：\\(1:1:\\sqrt2\\)。',
          '<b>30°–60°–90°</b>：\\(1:\\sqrt3:2\\)（短股:長股:斜邊）。'
        ],
        formula: { label: '兩組黃金比', tex: '45^\\circ\\!:\\,1{:}1{:}\\sqrt2\\qquad 30^\\circ\\!:\\,1{:}\\sqrt3{:}2' },
        visual: (h) => {
          const A = [40, 200], B = [200, 200], Cc = [40, 40];
          let s = SV.poly([A, B, Cc], 'rgba(37,99,235,0.06)', C);
          s += SV.rightAngle(A[0], A[1], 0, 90, 14, '#657187');
          s += SV.angle(B[0], B[1], 26, 135, 180, RED, '45°', { w: 2.4, fs: 11 });
          s += SV.angle(Cc[0], Cc[1], 26, 270, 315, RED, '45°', { w: 2.4, fs: 11 });
          s += `<text x="26" y="125" font-size="12" font-weight="800" fill="#334">1</text>`;
          s += `<text x="120" y="218" font-size="12" font-weight="800" fill="#334">1</text>`;
          s += `<text x="128" y="112" font-size="12" font-weight="800" fill="${BLU}">√2</text>`;
          const D = [270, 200], E = [430, 200], F = [270, 40];
          s += SV.poly([D, E, F], 'rgba(5,150,105,0.06)', GRN);
          s += SV.rightAngle(D[0], D[1], 0, 90, 14, '#657187');
          s += SV.angle(E[0], E[1], 30, 150, 180, RED, '30°', { w: 2.4, fs: 11 });
          s += SV.angle(F[0], F[1], 26, 270, 330, AMB, '60°', { w: 2.4, fs: 11 });
          s += `<text x="256" y="125" font-size="12" font-weight="800" fill="#334">√3</text>`;
          s += `<text x="345" y="218" font-size="12" font-weight="800" fill="#334">1</text>`;
          s += `<text x="360" y="112" font-size="12" font-weight="800" fill="${GRN}">2</text>`;
          h.innerHTML = svg('0 0 460 220', s);
        },
        caption: '左：等腰直角 \\(1:1:\\sqrt2\\)；右：\\(30\\text{-}60\\text{-}90\\) 為 \\(1:\\sqrt3:2\\)。',
        example: {
          q: '\\(30^\\circ\\text{-}60^\\circ\\text{-}90^\\circ\\) 直角三角形斜邊 10，求兩股。',
          steps: ['比 \\(1:\\sqrt3:2\\)，斜邊 2 份 \\(=10\\Rightarrow 1\\) 份 \\(=5\\)。', '短股 \\(5\\)，長股 \\(5\\sqrt3\\)。'],
          ans: '短股 5、長股 \\(5\\sqrt3\\)'
        }
      }
    ]
  });
})();
