/* ============ 第 1 章　相似形 ============ */
window.DECK = window.DECK || [];
(function () {
  const C = '#2563eb';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }
  // 沿線段依比例取點
  const lerp = (P, Q, t) => [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t];

  window.DECK.push({
    ch: 1,
    title: '相似形',
    color: C,
    sections: ['1-1 比例線段', '1-2 相似形', '1-3 相似三角形'],
    slides: [

      /* ---------- 1-1 比例線段 ---------- */
      {
        sec: '1-1', secName: '比例線段',
        title: '比、比值與比例式',
        points: [
          '兩數相除叫<span class="k">比</span>：\\(a:b=\\dfrac{a}{b}\\)（\\(b\\neq0\\)），這個值叫<b>比值</b>。',
          '兩個相等的比排在一起，就是<span class="k">比例式</span>：\\(a:b=c:d\\)。',
          '\\(a\\)、\\(d\\) 叫<b>外項</b>，\\(b\\)、\\(c\\) 叫<b>內項</b>。'
        ],
        formula: { label: '比例式', tex: 'a:b=c:d\\quad(\\,b,d\\neq0\\,)' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '比例式', tex: '\\underbrace{a}_{外項}:\\underbrace{b}_{內項}=\\underbrace{c}_{內項}:\\underbrace{d}_{外項}', color: C, fill: '#eef4ff', border: C, size: 18 },
            { label: '同一個比值', tex: '\\dfrac{a}{b}=\\dfrac{c}{d}', color: GRN, border: '#cfe8dd' }
          ]);
        },
        caption: '比例式就是「兩個比相等」，是本冊相似形的共同語言。',
        example: {
          q: '化簡比 \\(12:18\\)，並求比值。',
          steps: ['同除以最大公因數 6：\\(12:18=2:3\\)。', '比值 \\(=\\dfrac{2}{3}\\)。'],
          ans: '\\(2:3\\)，比值 \\(\\dfrac{2}{3}\\)'
        }
      },

      {
        sec: '1-1', secName: '比例線段',
        title: '比例式的關鍵：內項外項相乘相等',
        points: [
          '比例式 \\(a:b=c:d\\) 成立 \\(\\Longleftrightarrow\\) <b>外項相乘＝內項相乘</b>。',
          '也就是 \\(a\\times d=b\\times c\\)（口訣：<b>交叉相乘</b>）。',
          '這是求比例式中未知數最常用的一步。'
        ],
        formula: { label: '交叉相乘', tex: 'a:b=c:d\\;\\Longleftrightarrow\\; ad=bc' },
        visual: (h) => {
          h.innerHTML = svg('0 0 380 210', `
            <text x="70" y="80" text-anchor="middle" class="mth" font-size="30" fill="#172033">a</text>
            <text x="150" y="80" text-anchor="middle" font-size="26" fill="#657187">:</text>
            <text x="230" y="80" text-anchor="middle" class="mth" font-size="30" fill="#172033">b</text>
            <text x="290" y="80" text-anchor="middle" font-size="24" fill="#657187">=</text>
            <text x="70" y="80" text-anchor="middle" class="mth" font-size="30" fill="#172033" opacity="0"></text>
            <text x="230" y="150" text-anchor="middle" class="mth" font-size="30" fill="#172033">c</text>
            <text x="70" y="150" text-anchor="middle" class="mth" font-size="30" fill="#172033">d</text>
            <line x1="82" y1="86" x2="222" y2="140" stroke="${RED}" stroke-width="2.6" marker-end="url(#a1)"/>
            <line x1="222" y1="86" x2="82" y2="140" stroke="${BLU}" stroke-width="2.6" marker-end="url(#a2)"/>
            <defs>
              <marker id="a1" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="${RED}"/></marker>
              <marker id="a2" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="${BLU}"/></marker>
            </defs>
            <text x="190" y="196" text-anchor="middle" font-size="15" font-weight="800" fill="#172033">外項 a·d　＝　內項 b·c</text>
          `);
        },
        caption: '把 \\(a:b=c:d\\) 想成「\\(\\dfrac{a}{b}=\\dfrac{c}{d}\\)」，兩邊交叉相乘就得 \\(ad=bc\\)。',
        example: {
          q: '若 \\(3:5=x:20\\)，求 \\(x\\)。',
          steps: ['交叉相乘：\\(5x=3\\times20=60\\)。', '\\(x=60\\div5=12\\)。'],
          ans: '\\(x=12\\)'
        }
      },

      {
        sec: '1-1', secName: '比例線段',
        title: '比例線段：四條線段成比例',
        points: [
          '四條線段 \\(a,b,c,d\\)，若 \\(a:b=c:d\\)，就稱這四條線段成<span class="k">比例線段</span>。',
          '長度都要用<b>同一單位</b>量，再比。',
          '若 \\(a:b=b:c\\)（中間重複），\\(b\\) 稱為 \\(a,c\\) 的<b>比例中項</b>，此時 \\(b^2=ac\\)。'
        ],
        formula: { label: '比例中項', tex: 'a:b=b:c\\;\\Rightarrow\\; b^2=ac' },
        visual: (h) => {
          const bar = (x, y, len, color, lbl) =>
            SV.seg(x, y, x + len, y, color, 7) +
            `<text x="${x + len / 2}" y="${y - 12}" text-anchor="middle" font-size="14" font-weight="800" fill="${color}">${lbl}</text>`;
          h.innerHTML = svg('0 0 420 250', `
            ${bar(40, 50, 80, BLU, 'a = 4')}
            ${bar(40, 110, 120, BLU, 'b = 6')}
            ${bar(40, 170, 120, GRN, 'c = 6')}
            ${bar(40, 230, 180, GRN, 'd = 9')}
            <text x="300" y="120" font-size="15" font-weight="800" fill="#172033">a : b = 4 : 6 = 2 : 3</text>
            <text x="300" y="200" font-size="15" font-weight="800" fill="#172033">c : d = 6 : 9 = 2 : 3</text>
            <text x="300" y="235" font-size="14" fill="${RED}" font-weight="800">兩比相等 ⇒ 成比例</text>
          `);
        },
        caption: '四條線段長度的比若相等，就成比例線段（\\(4:6=6:9\\)）。',
        example: {
          q: '線段 \\(a=4\\)、\\(b=6\\)、\\(c=6\\)，求 \\(d\\) 使 \\(a:b=c:d\\)。',
          steps: ['\\(4:6=6:d\\)，交叉相乘：\\(4d=36\\)。', '\\(d=9\\)。'],
          ans: '\\(d=9\\)'
        }
      },

      {
        sec: '1-1', secName: '比例線段',
        title: '平行線截線段成比例',
        points: [
          '一組<b>平行線</b>被兩條截線所截，截出的線段對應成<span class="k">比例</span>。',
          '即 \\(L_1\\parallel L_2\\parallel L_3\\) 時：\\(\\overline{AB}:\\overline{BC}=\\overline{DE}:\\overline{EF}\\)。',
          '拖滑桿移動中間那條平行線，兩側的比會<b>一起改變、永遠相等</b>。'
        ],
        formula: { label: '平行截比例', tex: '\\overline{AB}:\\overline{BC}=\\overline{DE}:\\overline{EF}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="par"></div>
            <div class="ictrl"><label>中間線位置 <span class="ival" id="pv">140</span></label><input type="range" id="ps" min="90" max="210" value="140"></div></div>`;
          const y1 = 50, y3 = 250, xL = 40, xR = 400;
          const T1 = [90, 20], T1b = [200, 285];   // 左截線
          const T2 = [300, 20], T2b = [370, 285];   // 右截線
          const xatL = y => T1[0] + (T1b[0] - T1[0]) * (y - T1[1]) / (T1b[1] - T1[1]);
          const xatR = y => T2[0] + (T2b[0] - T2[0]) * (y - T2[1]) / (T2b[1] - T2[1]);
          const draw = () => {
            const y2 = +h.querySelector('#ps').value; h.querySelector('#pv').textContent = y2;
            const A = [xatL(y1), y1], B = [xatL(y2), y2], Cc = [xatL(y3), y3];
            const D = [xatR(y1), y1], E = [xatR(y2), y2], F = [xatR(y3), y3];
            const ab = Math.round(y2 - y1), bc = Math.round(y3 - y2);
            const g = Math.max(1, (function gcd(a, b) { return b ? gcd(b, a % b) : a; })(ab, bc));
            let s = '';
            [y1, y2, y3].forEach((y, i) => s += SV.seg(xL, y, xR, y, '#9aa4b6', 2, i === 1 ? '6 5' : ''));
            s += SV.seg(T1[0], T1[1], T1b[0], T1b[1], '#334', 2.6) + SV.seg(T2[0], T2[1], T2b[0], T2b[1], '#334', 2.6);
            // 標線段
            s += SV.seg(A[0], A[1], B[0], B[1], BLU, 6) + SV.seg(B[0], B[1], Cc[0], Cc[1], GRN, 6);
            s += SV.seg(D[0], D[1], E[0], E[1], BLU, 6) + SV.seg(E[0], E[1], F[0], F[1], GRN, 6);
            [[A, 'A'], [B, 'B'], [Cc, 'C']].forEach(([P, n]) => { s += SV.dot(P[0], P[1], '#172033', 4) + SV.vlabel(P[0] - 20, P[1] + 5, n); });
            [[D, 'D'], [E, 'E'], [F, 'F']].forEach(([P, n]) => { s += SV.dot(P[0], P[1], '#172033', 4) + SV.vlabel(P[0] + 10, P[1] + 5, n); });
            s += `<text x="150" y="20" font-size="13" font-weight="800" fill="#172033">AB:BC = ${ab / g}:${bc / g}</text>`;
            s += `<text x="150" y="278" font-size="13" font-weight="800" fill="#172033">DE:EF = ${ab / g}:${bc / g}</text>`;
            h.querySelector('#par').innerHTML = svg('0 0 440 300', s);
          };
          h.querySelector('#ps').oninput = draw; draw();
        },
        caption: '不論中間線移到哪，左邊 AB:BC 與右邊 DE:EF <b>永遠相等</b>。',
        example: {
          q: '三平行線截得左側 \\(AB=6,\\ BC=9\\)，右側 \\(DE=4\\)，求 \\(EF\\)。',
          steps: ['\\(AB:BC=DE:EF\\Rightarrow 6:9=4:EF\\)。', '交叉相乘：\\(6\\,EF=36\\Rightarrow EF=6\\)。'],
          ans: '\\(EF=6\\)'
        }
      },

      {
        sec: '1-1', secName: '比例線段',
        title: '三角形內的平行線（相似的橋樑）',
        points: [
          '三角形一邊的<b>平行線</b>，截另外兩邊成<span class="k">比例</span>。',
          '\\(\\overline{DE}\\parallel\\overline{BC}\\Rightarrow \\overline{AD}:\\overline{DB}=\\overline{AE}:\\overline{EC}\\)。',
          '這其實就是「\\(\\triangle ADE\\sim\\triangle ABC\\)」的前奏——拖滑桿看比例。'
        ],
        formula: { label: '截比例', tex: '\\overline{AD}:\\overline{DB}=\\overline{AE}:\\overline{EC}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="tpar"></div>
            <div class="ictrl"><label>D 在 AB 上的位置 <span class="ival" id="tv">0.45</span></label><input type="range" id="ts" min="0.2" max="0.8" step="0.01" value="0.45"></div></div>`;
          const A = [210, 40], B = [60, 270], Cc = [380, 270];
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
            const ad = Math.round(t * 100), db = Math.round((1 - t) * 100);
            const g = (function gcd(a, b) { return b ? gcd(b, a % b) : a; })(ad, db);
            s += `<text x="210" y="300" text-anchor="middle" font-size="14" font-weight="800" fill="#172033">AD:DB = AE:EC = ${ad / g}:${db / g}</text>`;
            s += `<text x="150" y="150" font-size="12" font-weight="800" fill="${RED}">DE ∥ BC</text>`;
            h.querySelector('#tpar').innerHTML = svg('0 0 440 315', s);
          };
          h.querySelector('#ts').oninput = draw; draw();
        },
        caption: '\\(DE\\parallel BC\\) 時，D、E 把兩腰切成<b>相同比例</b>。',
        example: {
          q: '\\(\\overline{DE}\\parallel\\overline{BC}\\)，\\(AD=4,\\ DB=6,\\ AE=5\\)，求 \\(EC\\)。',
          steps: ['\\(AD:DB=AE:EC\\Rightarrow 4:6=5:EC\\)。', '交叉相乘：\\(4\\,EC=30\\Rightarrow EC=7.5\\)。'],
          ans: '\\(EC=7.5\\)'
        }
      },

      /* ---------- 1-2 相似形 ---------- */
      {
        sec: '1-2', secName: '相似形',
        title: '相似：形狀相同，大小可不同',
        points: [
          '把一個圖形<b>等比例放大或縮小</b>，得到的新圖形和原圖<span class="k">相似</span>，記作「\\(\\sim\\)」。',
          '相似的兩圖：<b>對應角都相等</b>、<b>對應邊都成比例</b>。',
          '拖滑桿改變放大倍率 \\(k\\)，觀察形狀不變、只有大小變。'
        ],
        formula: { label: '相似記號', tex: '\\text{圖形甲}\\sim\\text{圖形乙}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="sim"></div>
            <div class="ictrl"><label>放大倍率 k <span class="ival" id="kv">1.5</span></label><input type="range" id="ks" min="0.5" max="2" step="0.1" value="1.5"></div></div>`;
          // 原圖：一個「旗子」多邊形
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
          steps: ['每邊都乘 2：\\(3\\times2,\\ 4\\times2,\\ 5\\times2\\)。'],
          ans: '6、8、10'
        }
      },

      {
        sec: '1-2', secName: '相似形',
        title: '相似多邊形的兩個條件',
        points: [
          '兩多邊形相似，必須<b>同時</b>滿足：',
          '① 對應角<b>都相等</b>；　② 對應邊<b>都成比例</b>。',
          '缺一不可：只有角相等（如矩形）或只有邊成比例（如菱形與正方形），都不算相似。'
        ],
        formula: { label: '相似定義', tex: '\\text{對應角相等}\\;\\wedge\\;\\text{對應邊成比例}' },
        visual: (h) => {
          const q1 = [[40, 60], [150, 60], [175, 170], [30, 170]];
          const q2 = [[250, 70], [360, 70], [385, 180], [240, 180]].map(p => [p[0], p[1]]);
          let s = SV.poly(q1, 'rgba(37,99,235,0.08)', C) + SV.poly(q2, 'rgba(5,150,105,0.08)', GRN);
          ['A', 'B', 'C', 'D'].forEach((n, i) => s += SV.vlabel(q1[i][0] - 4, q1[i][1] - 6, n, C, 14));
          ['E', 'F', 'G', 'H'].forEach((n, i) => s += SV.vlabel(q2[i][0] - 4, q2[i][1] - 6, n, GRN, 14));
          s += `<text x="107" y="205" text-anchor="middle" font-size="13" fill="#657187">四邊形 ABCD</text>`;
          s += `<text x="312" y="205" text-anchor="middle" font-size="13" fill="#657187">四邊形 EFGH</text>`;
          s += `<text x="220" y="120" text-anchor="middle" font-size="24" fill="${RED}">~</text>`;
          h.innerHTML = svg('0 0 430 220', s);
        },
        caption: '\\(ABCD\\sim EFGH\\)：\\(\\angle A=\\angle E\\)…且 \\(\\overline{AB}:\\overline{EF}=\\overline{BC}:\\overline{FG}=\\cdots\\)。',
        example: {
          q: '兩個長方形一定相似嗎？',
          steps: ['長方形四個角都是 90°（對應角相等 ✔）。', '但長寬比可能不同（對應邊未必成比例 ✘）。'],
          ans: '不一定相似'
        }
      },

      {
        sec: '1-2', secName: '相似形',
        title: '相似比：對應邊長的比',
        points: [
          '相似兩圖形，<b>對應邊長的比</b>叫做<span class="k">相似比</span>（縮放比）。',
          '相似比 \\(=\\dfrac{\\text{甲的邊}}{\\text{對應乙的邊}}\\)，每一組對應邊算出來都一樣。',
          '<b>周長比</b>也等於相似比（周長是邊長的和，同倍放大）。'
        ],
        formula: { label: '周長比＝相似比', tex: '\\dfrac{C_{甲}}{C_{乙}}=k' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '相似比 k', tex: 'k=\\dfrac{\\overline{AB}}{\\overline{A\'B\'}}=\\dfrac{\\overline{BC}}{\\overline{B\'C\'}}=\\cdots', color: C, fill: '#eef4ff', border: C, size: 16 },
            { label: '周長比', tex: '\\dfrac{周長_{甲}}{周長_{乙}}=k', color: GRN, border: '#cfe8dd' }
          ]);
        },
        caption: '每組對應邊的比都相等，這個共同的比值就是相似比。',
        example: {
          q: '兩相似三角形相似比 \\(2:3\\)，小三角形周長 20，求大三角形周長。',
          steps: ['周長比＝相似比 \\(=2:3\\)。', '\\(20:x=2:3\\Rightarrow 2x=60\\Rightarrow x=30\\)。'],
          ans: '大三角形周長 30'
        }
      },

      {
        sec: '1-2', secName: '相似形',
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
          steps: ['面積比 \\(=2^2:3^2=4:9\\)。', '\\(12:x=4:9\\Rightarrow 4x=108\\Rightarrow x=27\\)。'],
          ans: '大圖面積 27'
        }
      },

      /* ---------- 1-3 相似三角形 ---------- */
      {
        sec: '1-3', secName: '相似三角形',
        title: '判別法 ① AA：兩角對應相等',
        points: [
          '兩三角形若有<b>兩組對應角相等</b>，就<span class="k">相似</span>（AA）。',
          '理由：三角形內角和 180°，兩角定了，第三角自動相等。',
          'AA 是相似三角形<b>最常用</b>的判別法。'
        ],
        formula: { label: 'AA 相似', tex: '\\angle A=\\angle D,\\ \\angle B=\\angle E\\Rightarrow\\triangle ABC\\sim\\triangle DEF' },
        visual: (h) => {
          const L = { A: [40, 40], B: [30, 180], Cc: [170, 180] };
          const R = { A: [260, 30], B: [246, 200], Cc: [410, 200] };
          let s = SV.poly([L.A, L.B, L.Cc], 'rgba(37,99,235,0.06)', C) + SV.poly([R.A, R.B, R.Cc], 'rgba(5,150,105,0.06)', GRN);
          s += SV.angle(L.B[0], L.B[1], 22, 0, 84, RED, '', { w: 3 });
          s += SV.angle(R.B[0], R.B[1], 26, 0, 84, RED, '', { w: 3 });
          s += SV.angle(L.Cc[0], L.Cc[1], 22, 96, 180, BLU, '', { w: 3 });
          s += SV.angle(R.Cc[0], R.Cc[1], 26, 96, 180, BLU, '', { w: 3 });
          s += SV.vlabel(L.A[0] - 6, L.A[1] - 6, 'A') + SV.vlabel(L.B[0] - 18, L.B[1] + 8, 'B') + SV.vlabel(L.Cc[0] + 6, L.Cc[1] + 8, 'C');
          s += SV.vlabel(R.A[0] - 6, R.A[1] - 6, 'D') + SV.vlabel(R.B[0] - 18, R.B[1] + 8, 'E') + SV.vlabel(R.Cc[0] + 6, R.Cc[1] + 8, 'F');
          h.innerHTML = svg('0 0 440 220', s);
        },
        caption: '兩組角（紅、藍）分別相等 ⇒ 兩三角形相似。',
        example: {
          q: '\\(\\triangle ABC\\) 中 \\(\\angle A=50^\\circ,\\angle B=60^\\circ\\)；\\(\\triangle DEF\\) 中 \\(\\angle D=50^\\circ,\\angle E=60^\\circ\\)，兩者相似嗎？',
          steps: ['兩組對應角相等（50°、60°）。', '符合 AA 判別。'],
          ans: '相似（AA）'
        }
      },

      {
        sec: '1-3', secName: '相似三角形',
        title: '判別法 ② SAS：兩邊成比例、夾角相等',
        points: [
          '兩三角形若<b>兩組對應邊成比例</b>，且<b>夾角相等</b>，則相似（SAS）。',
          '關鍵是「相等的角必須是這兩邊的<b>夾角</b>」。',
          '對應邊比 \\(=\\dfrac{AB}{DE}=\\dfrac{AC}{DF}\\)，夾角 \\(\\angle A=\\angle D\\)。'
        ],
        formula: { label: 'SAS 相似', tex: '\\dfrac{AB}{DE}=\\dfrac{AC}{DF},\\ \\angle A=\\angle D' },
        visual: (h) => {
          const L = { A: [90, 40], B: [40, 170], Cc: [170, 150] };
          const R = { A: [330, 30], B: [250, 225], Cc: [455, 195] };
          let s = SV.poly([L.A, L.B, L.Cc], 'rgba(37,99,235,0.06)', C) + SV.poly([R.A, R.B, R.Cc], 'rgba(5,150,105,0.06)', GRN);
          s += SV.angle(L.A[0], L.A[1], 22, 250, 315, RED, '', { w: 3, fill: 1 });
          s += SV.angle(R.A[0], R.A[1], 26, 250, 315, RED, '', { w: 3, fill: 1 });
          s += SV.ticks(L.A[0], L.A[1], L.B[0], L.B[1], 1, AMB) + SV.ticks(R.A[0], R.A[1], R.B[0], R.B[1], 1, AMB);
          s += SV.ticks(L.A[0], L.A[1], L.Cc[0], L.Cc[1], 2, VIO) + SV.ticks(R.A[0], R.A[1], R.Cc[0], R.Cc[1], 2, VIO);
          s += SV.vlabel(L.A[0] - 4, L.A[1] - 8, 'A') + SV.vlabel(R.A[0] - 4, R.A[1] - 8, 'D');
          s += `<text x="150" y="205" font-size="12" fill="#657187">兩邊比相同、夾角 A=D 相等</text>`;
          h.innerHTML = svg('0 0 480 230', s);
        },
        caption: '夾角（紅）相等，且夾這角的兩邊（黃、紫）成比例 ⇒ 相似。',
        example: {
          q: '\\(\\triangle ABC\\) 與 \\(\\triangle DEF\\) 中 \\(\\angle A=\\angle D\\)，\\(AB=4,AC=6\\)，\\(DE=6,DF=9\\)，相似嗎？',
          steps: ['\\(\\dfrac{AB}{DE}=\\dfrac46=\\dfrac23,\\ \\dfrac{AC}{DF}=\\dfrac69=\\dfrac23\\)。', '兩邊比相等且夾角相等 ⇒ SAS。'],
          ans: '相似（SAS）'
        }
      },

      {
        sec: '1-3', secName: '相似三角形',
        title: '判別法 ③ SSS：三邊對應成比例',
        points: [
          '兩三角形<b>三組對應邊都成比例</b>，則相似（SSS）。',
          '即 \\(\\dfrac{AB}{DE}=\\dfrac{BC}{EF}=\\dfrac{CA}{FD}\\)。',
          '和「全等的 SSS」類比：全等要邊<b>相等</b>，相似只要邊<b>成比例</b>。'
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
          steps: ['\\(\\dfrac68=\\dfrac34,\\ \\dfrac{9}{12}=\\dfrac34,\\ \\dfrac{12}{16}=\\dfrac34\\)。', '三比都是 \\(\\dfrac34\\) ⇒ SSS。'],
          ans: '相似（SSS）'
        }
      },

      {
        sec: '1-3', secName: '相似三角形',
        title: '用相似求未知邊長',
        points: [
          '確定兩三角形相似後，<b>對應邊成比例</b>就能列式求邊。',
          '關鍵：先把<b>對應頂點</b>對好（相似記號的字母順序＝對應順序）。',
          '\\(\\triangle ABC\\sim\\triangle DEF\\) ⇒ \\(\\dfrac{AB}{DE}=\\dfrac{BC}{EF}=\\dfrac{CA}{FD}\\)。'
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
        caption: '\\(AB=6\\) 對 \\(DE=9\\)（比 2:3），\\(BC=8\\) 對 \\(EF\\)，用比例求 \\(EF\\)。',
        example: {
          q: '\\(\\triangle ABC\\sim\\triangle DEF\\)，\\(AB=6,BC=8,DE=9\\)，求 \\(EF\\)。',
          steps: ['\\(\\dfrac{AB}{DE}=\\dfrac{BC}{EF}\\Rightarrow\\dfrac69=\\dfrac{8}{EF}\\)。', '交叉相乘：\\(6\\,EF=72\\Rightarrow EF=12\\)。'],
          ans: '\\(EF=12\\)'
        }
      },

      {
        sec: '1-3', secName: '相似三角形',
        title: '相似的應用：測量高度',
        points: [
          '無法直接量的高度（樹、旗桿、大樓），可用<b>影子</b>或<b>鏡子</b>配相似三角形算出。',
          '同一時刻，物體與影子構成的兩個直角三角形<b>相似</b>（太陽光平行、AA）。',
          '列比例：\\(\\dfrac{\\text{物高}}{\\text{影長}}=\\dfrac{\\text{物高}}{\\text{影長}}\\)。'
        ],
        formula: { label: '影子測高', tex: '\\dfrac{人高}{人影}=\\dfrac{樹高}{樹影}' },
        visual: (h) => {
          let s = '';
          s += SV.seg(40, 250, 420, 250, '#8a94a6', 2.4); // 地面
          // 人
          s += SV.seg(70, 250, 70, 195, '#334', 5) + SV.seg(70, 250, 110, 250, '#f59e0b', 5);
          s += `<text x="52" y="225" font-size="12" font-weight="800" fill="#334">1.6</text>`;
          s += `<text x="90" y="268" font-size="11" fill="#f59e0b">影 2</text>`;
          s += SV.seg(70, 195, 110, 250, '#e11d48', 2, '4 3');
          // 樹
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
          steps: ['\\(\\dfrac{1.6}{2}=\\dfrac{h}{10}\\)。', '\\(2h=16\\Rightarrow h=8\\)。'],
          ans: '樹高 8 公尺'
        }
      },

      {
        sec: '1-3', secName: '相似三角形',
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
        caption: '\\(\\triangle ACH\\sim\\triangle CBH\\sim\\triangle ABC\\)；高 \\(h\\) 滿足 \\(h^2=AH\\cdot HB\\)。',
        example: {
          q: '直角三角形斜邊上的高把斜邊分成 4 與 9，求這條高。',
          steps: ['\\(h^2=p\\,q=4\\times9=36\\)。', '\\(h=\\sqrt{36}=6\\)。'],
          ans: '高 \\(=6\\)'
        }
      },

      {
        sec: '1-3', secName: '相似三角形',
        title: '特殊直角三角形的邊長比',
        points: [
          '兩種常見直角三角形，三邊比是<b>固定</b>的（可由相似或畢氏得到）：',
          '<b>45°–45°–90°</b>（等腰直角）：\\(1:1:\\sqrt2\\)。',
          '<b>30°–60°–90°</b>：\\(1:\\sqrt3:2\\)（短股:長股:斜邊）。',
          '記住比，就能不用畢氏、直接寫出其他邊。'
        ],
        formula: { label: '兩組黃金比', tex: '45^\\circ\\!:\\,1{:}1{:}\\sqrt2\\qquad 30^\\circ\\!:\\,1{:}\\sqrt3{:}2' },
        visual: (h) => {
          // 45-45-90
          const A = [40, 200], B = [200, 200], Cc = [40, 40];
          let s = SV.poly([A, B, Cc], 'rgba(37,99,235,0.06)', C);
          s += SV.rightAngle(A[0], A[1], 0, 90, 14, '#657187');
          s += SV.angle(B[0], B[1], 26, 135, 180, RED, '45°', { w: 2.4, fs: 11 });
          s += SV.angle(Cc[0], Cc[1], 26, 270, 315, RED, '45°', { w: 2.4, fs: 11 });
          s += `<text x="26" y="125" font-size="12" font-weight="800" fill="#334">1</text>`;
          s += `<text x="120" y="218" font-size="12" font-weight="800" fill="#334">1</text>`;
          s += `<text x="128" y="112" font-size="12" font-weight="800" fill="${BLU}">√2</text>`;
          // 30-60-90
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
          steps: ['比為 \\(1:\\sqrt3:2\\)，斜邊 \\(2\\) 份 \\(=10\\Rightarrow 1\\) 份 \\(=5\\)。', '短股 \\(=5\\)，長股 \\(=5\\sqrt3\\)。'],
          ans: '短股 5、長股 \\(5\\sqrt3\\)'
        }
      }
    ]
  });
})();
