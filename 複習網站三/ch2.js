/* ============ 第 2 章　平方根與畢氏定理 ============
   依康軒版第 3 冊（八上）課程計畫：2-1 平方根與近似值、2-2 根式的運算、2-3 畢氏定理
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#7c3aed';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }

  // SVG 內的文字（SVG 裡不能用 MathJax，一律用 √ 等符號直接寫）
  const txt = (x, y, s, opt = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${opt.a || 'middle'}" font-size="${opt.fs || 13}" font-weight="${opt.fw || 700}" fill="${opt.c || '#172033'}">${s}</text>`;

  // 圓角方框
  const box = (x, y, w, hh, fill, stroke, r = 12, sw = 2) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

  const ADEF = `<defs><marker id="c2ar" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#8a94a6"/></marker></defs>`;
  const arwTo = (x1, y1, x2, y2, color = '#8a94a6') =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2.4" marker-end="url(#c2ar)"/>`;

  // 把 n 拆成 k²×m（k 取最大），用於化最簡根式
  function splitSq(n) {
    let k = 1, m = n;
    for (let i = 2; i * i <= m; i++) { while (m % (i * i) === 0) { k *= i; m /= i * i; } }
    return [k, m];
  }

  // 帶格線的正方形（沿 u、v 兩個方向鋪 n×n 格），用於畢氏面積拼圖
  function gridSq(ox, oy, ux, uy, vx, vy, n, fill, stroke) {
    const P = (i, j) => [ox + i * ux + j * vx, oy + i * uy + j * vy];
    let s = SV.poly([P(0, 0), P(n, 0), P(n, n), P(0, n)], fill, stroke, 2.4);
    for (let i = 1; i < n; i++) {
      const a = P(i, 0), b = P(i, n), c2 = P(0, i), d = P(n, i);
      s += SV.seg(a[0].toFixed(1), a[1].toFixed(1), b[0].toFixed(1), b[1].toFixed(1), stroke, 0.9);
      s += SV.seg(c2[0].toFixed(1), c2[1].toFixed(1), d[0].toFixed(1), d[1].toFixed(1), stroke, 0.9);
    }
    return s;
  }

  window.DECK.push({
    ch: 2,
    title: '平方根與畢氏定理',
    color: C,
    sections: ["2-1 平方根與近似值", "2-2 根式的運算", "2-3 畢氏定理"],
    slides: [

      /* ---------- 2-1 平方根與近似值 ---------- */
      {
        sec: '2-1', secName: '平方根與近似值',
        title: '平方根：把「面積」開回「邊長」',
        points: [
          '若 \\(x^2=a\\)，就說 \\(x\\) 是 \\(a\\) 的<span class="k">平方根</span>——平方的逆向操作。',
          '<b>正數有兩個</b>平方根，互為相反數；<b>0 只有一個</b>（就是 0）；<b>負數沒有</b>平方根。',
          '符號約定：\\(\\sqrt{a}\\) 專指<b>正</b>的那一個，負的要寫 \\(-\\sqrt{a}\\)。',
          '拖滑桿改變正方形面積，邊長就是這個面積的正平方根。'
        ],
        formula: { label: '平方根的定義', tex: 'x^2=a\\;\\Longleftrightarrow\\;x=\\pm\\sqrt{a}\\quad(a>0)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="sq"></div>
            <div class="ictrl"><label>正方形面積 <span class="ival" id="av">16</span></label>
            <input type="range" id="as" min="1" max="36" step="1" value="16"></div></div>`;
          const draw = () => {
            const a = +h.querySelector('#as').value;
            h.querySelector('#av').textContent = a;
            const r0 = Math.sqrt(a), px = r0 * 32, by = 232, cx = 128;
            const x0 = cx - px / 2, y0 = by - px;
            const exact = Number.isInteger(r0);
            const disp = exact ? String(r0) : '√' + a;
            let s = box(x0.toFixed(1), y0.toFixed(1), px.toFixed(1), px.toFixed(1), 'rgba(124,58,237,.13)', C, 5, 2.6);
            s += txt(cx, (y0 + px / 2 + 6).toFixed(1), '面積 ' + a, { fs: 15, c: C, fw: 900 });
            s += SV.seg(x0.toFixed(1), by + 12, (x0 + px).toFixed(1), by + 12, '#9aa4b6', 2);
            s += txt(cx, by + 34, '邊長 = ' + (exact ? disp : '√' + a + ' ≈ ' + r0.toFixed(2)), { fs: 13 });
            s += txt(340, 80, 'x² = ' + a + ' 的解有兩個', { fs: 12.5, c: '#657187' });
            s += box(258, 96, 164, 54, '#f5f0ff', C);
            s += txt(340, 130, '+' + disp, { fs: 19, c: C, fw: 900 });
            s += box(258, 166, 164, 54, '#fff1f4', RED);
            s += txt(340, 200, '−' + disp, { fs: 19, c: RED, fw: 900 });
            s += txt(340, 244, '兩解互為相反數', { fs: 12, c: '#657187' });
            h.querySelector('#sq').innerHTML = svg('0 0 440 280', s);
          };
          h.querySelector('#as').oninput = draw; draw();
        },
        caption: '正方形邊長只取正的 \\(\\sqrt{a}\\)；但方程式 \\(x^2=a\\) 的解是 \\(\\pm\\sqrt{a}\\) 兩個。',
        example: {
          q: '\\(x^2=49\\)，求 \\(x\\)；又 \\(\\sqrt{49}\\) 是多少？',
          steps: ['\\(7^2=49\\)、\\((-7)^2=49\\)，兩個都是 49 的平方根。', '但符號 \\(\\sqrt{49}\\) 只取正的那個。'],
          ans: '\\(x=\\pm7\\)；\\(\\sqrt{49}=7\\)'
        }
      },

      {
        sec: '2-1', secName: '平方根與近似值',
        title: '哪些根號開得盡：完全平方數、分數、小數',
        points: [
          '\\(1\\sim15\\) 的平方（\\(1,4,9,\\ldots,225\\)）要背到<b>看到就認得</b>，化簡速度差很多。',
          '分數、小數也能開：先化成分數，再<b>分子分母各開</b>，如 \\(\\sqrt{0.04}=\\sqrt{\\tfrac{4}{100}}=0.2\\)。',
          '判斷是不是完全平方數：寫成<b>標準分解式</b>，每個質因數的指數<b>都是偶數</b>才是。'
        ],
        formula: { label: '用標準分解式開根號', tex: '324=2^2\\times3^4\\;\\Rightarrow\\;\\sqrt{324}=2\\times3^2=18' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            {
              label: '先背起來：1~15 的平方', tex: '1,\\;4,\\;9,\\;16,\\;25,\\;36,\\;49,\\;64,\\;81,\\;100',
              color: C, fill: '#f5f0ff', border: C, size: 15, note: '接著是 121、144、169、196、225（\\(11^2\\sim15^2\\)）'
            },
            {
              label: '分數與小數', tex: '\\sqrt{\\dfrac{9}{16}}=\\dfrac{3}{4},\\qquad \\sqrt{0.04}=\\sqrt{\\dfrac{4}{100}}=\\dfrac{2}{10}=0.2',
              color: GRN, border: '#cfe8dd', size: 16
            },
            {
              label: '標準分解式判別', tex: '324=2^{2}\\times3^{4}\\;\\Rightarrow\\;\\sqrt{324}=2^{1}\\times3^{2}=18',
              color: AMB, border: '#f0dcc0', size: 15, note: '指數各除以 2 就是答案；只要有一個奇數指數，就開不盡'
            }
          ], { gap: 10 });
        },
        caption: '開根號＝把標準分解式的<b>指數各除以 2</b>；除不盡的部分就留在根號裡。',
        example: {
          q: '\\(720\\) 是完全平方數嗎？',
          steps: ['\\(720=2^4\\times3^2\\times5\\)。', '\\(5\\) 的指數 1 是奇數。'],
          ans: '不是完全平方數'
        }
      },

      {
        sec: '2-1', secName: '平方根與近似值',
        title: '易錯：先平方再開根號，答案不會是負的',
        points: [
          '\\((\\sqrt{a})^2=a\\)：<b>先開再平方</b>，開得成的前提是 \\(a\\ge0\\)。',
          '\\(\\sqrt{a^2}=|a|\\)：<b>先平方再開</b>，不管 \\(a\\) 是正是負，結果都<b>不會是負的</b>。',
          '✗ \\(\\sqrt{(-5)^2}=-5\\)　✓ \\(\\sqrt{(-5)^2}=\\sqrt{25}=5\\)。',
          '保命訣竅：<b>看到根號先把裡面算成一個數</b>，再開，就不會被負號騙。'
        ],
        formula: { label: '兩式的差別', tex: '(\\sqrt{a}\\,)^2=a\\ (a\\ge0);\\qquad \\sqrt{a^2}=|a|' },
        visual: (h) => {
          h.innerHTML = `<div style="width:96%;margin:0 auto">
            <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:center">
              <tr style="background:#f5f0ff">
                <th style="border:1px solid #dbd2f0;padding:8px 6px">式子</th>
                <th style="border:1px solid #dbd2f0;padding:8px 6px">運算順序</th>
                <th style="border:1px solid #dbd2f0;padding:8px 6px">結果</th>
                <th style="border:1px solid #dbd2f0;padding:8px 6px">代 \\(a=-5\\)</th>
              </tr>
              <tr>
                <td style="border:1px solid #dbd2f0;padding:9px 6px;font-weight:900;color:${C}">\\((\\sqrt{a}\\,)^2\\)</td>
                <td style="border:1px solid #dbd2f0;padding:9px 6px">先開 → 再平方</td>
                <td style="border:1px solid #dbd2f0;padding:9px 6px">\\(a\\)（限 \\(a\\ge0\\)）</td>
                <td style="border:1px solid #dbd2f0;padding:9px 6px;color:#657187">不能代<br>（\\(\\sqrt{-5}\\) 沒意義）</td>
              </tr>
              <tr style="background:#fbfaff">
                <td style="border:1px solid #dbd2f0;padding:9px 6px;font-weight:900;color:${RED}">\\(\\sqrt{a^2}\\)</td>
                <td style="border:1px solid #dbd2f0;padding:9px 6px">先平方 → 再開</td>
                <td style="border:1px solid #dbd2f0;padding:9px 6px;font-weight:900">\\(|a|\\)</td>
                <td style="border:1px solid #dbd2f0;padding:9px 6px;font-weight:900;color:${GRN}">\\(\\sqrt{25}=5\\)</td>
              </tr>
            </table>
            <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
              <div style="background:#fff1f4;border-left:5px solid ${RED};border-radius:10px;padding:8px 12px;text-align:left">
                <span style="font-size:12px;font-weight:900;color:${RED}">✗ 錯</span>
                <span style="font-size:14px;margin-left:8px">\\(\\sqrt{(-5)^2}=-5\\)</span></div>
              <div style="background:#eefaf4;border-left:5px solid ${GRN};border-radius:10px;padding:8px 12px;text-align:left">
                <span style="font-size:12px;font-weight:900;color:${GRN}">✓ 對</span>
                <span style="font-size:14px;margin-left:8px">\\(\\sqrt{(-5)^2}=\\sqrt{25}=5\\)</span></div>
            </div></div>`;
        },
        caption: '根號的輸出永遠 \\(\\ge 0\\)；\\(\\sqrt{a^2}\\) 要加絕對值才對。',
        example: {
          q: '計算 \\(\\sqrt{(-7)^2}+(\\sqrt{7}\\,)^2\\)。',
          steps: ['\\(\\sqrt{(-7)^2}=\\sqrt{49}=7\\)。', '\\((\\sqrt7)^2=7\\)。'],
          ans: '\\(14\\)'
        }
      },

      {
        sec: '2-1', secName: '平方根與近似值',
        title: '估根號：先夾在兩個連續整數之間',
        points: [
          '找到整數 \\(n\\) 使 \\(n^2\\le a<(n+1)^2\\)，就得到 \\(n\\le\\sqrt{a}<n+1\\)。',
          '被開方數愈大，根號值愈大：\\(a<b\\Rightarrow\\sqrt{a}<\\sqrt{b}\\)。',
          '根號與整數比大小 → <b>兩邊都平方</b>再比：\\(30>25\\) 所以 \\(\\sqrt{30}>5\\)。',
          '拖滑桿換被開方數，看它落在哪兩個整數之間。'
        ],
        formula: { label: '夾擠法', tex: '7^2=49<50<64=8^2\\;\\Rightarrow\\;7<\\sqrt{50}<8' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="est"></div>
            <div class="ictrl"><label>被開方數 <span class="ival" id="nv">50</span></label>
            <input type="range" id="ns" min="2" max="99" step="1" value="50"></div></div>`;
          const X = v => 30 + v * 38;
          const draw = () => {
            const n = +h.querySelector('#ns').value;
            h.querySelector('#nv').textContent = n;
            const r0 = Math.sqrt(n), lo = Math.floor(r0), hi = lo + 1;
            let s = txt(220, 54, '√' + n + ' ≈ ' + r0.toFixed(3), { fs: 18, c: C, fw: 900 });
            s += txt(220, 86, lo + '² = ' + lo * lo + '　≤　' + n + '　<　' + hi * hi + ' = ' + hi + '²', { fs: 12.5, c: '#657187' });
            s += txt(220, 118, '⇒ ' + lo + ' ≤ √' + n + ' < ' + hi, { fs: 15, c: GRN, fw: 900 });
            s += `<rect x="${X(lo).toFixed(1)}" y="${(212 - 13)}" width="${(X(hi) - X(lo)).toFixed(1)}" height="26" fill="${C}" opacity="0.16"/>`;
            s += SV.seg(24, 212, 418, 212, '#8a94a6', 2.4);
            for (let v = 0; v <= 10; v++) {
              s += SV.seg(X(v), 205, X(v), 219, '#8a94a6', 1.8);
              s += txt(X(v), 236, v, { fs: 11, c: '#657187' });
            }
            s += SV.dot(X(r0).toFixed(1), 212, RED, 5.5);
            s += txt(X(r0).toFixed(1), 192, '√' + n, { fs: 12.5, c: RED, fw: 900 });
            h.querySelector('#est').innerHTML = svg('0 0 440 276', s);
          };
          h.querySelector('#ns').oninput = draw; draw();
        },
        caption: '被開方數夾在兩個完全平方數之間，根號值就夾在兩個連續整數之間。',
        example: {
          q: '\\(\\sqrt{85}\\) 的整數部分是多少？',
          steps: ['\\(9^2=81\\le 85<100=10^2\\)。', '所以 \\(9<\\sqrt{85}<10\\)。'],
          ans: '整數部分是 9'
        }
      },

      {
        sec: '2-1', secName: '平方根與近似值',
        title: '十分逼近法：一位一位試乘出來',
        points: [
          '要小數第一位，就在 \\(7.0,7.1,\\ldots\\) 之間<b>逐個平方</b>，找出「剛好夾住」的兩個。',
          '要小數第二位，再把區間切成十等分，重複同一招——這就是<b>十分逼近</b>。',
          '計算機的 \\(\\sqrt{\\;}\\) 鍵很快，但顯示位數有限，得到的<b>還是近似值</b>。',
          '拖步驟滑桿，看區間怎麼一層層縮小。'
        ],
        formula: { label: '逼近的邏輯', tex: '7.07^2=49.98<50<50.13=7.08^2' },
        visual: (h) => {
          const T = Math.sqrt(50);
          const line = (lo, hi, n, a, b, dec) => {
            const X = v => 40 + (v - lo) / (hi - lo) * 360;
            let s = `<rect x="${X(a).toFixed(1)}" y="200" width="${(X(b) - X(a)).toFixed(1)}" height="28" fill="${C}" opacity="0.18"/>`;
            s += SV.seg(34, 214, 408, 214, '#8a94a6', 2.4);
            for (let i = 0; i <= n; i++) {
              const v = lo + (hi - lo) * i / n, x = X(v);
              s += SV.seg(x.toFixed(1), 207, x.toFixed(1), 221, '#8a94a6', 1.6);
              s += txt(x.toFixed(1), 238, v.toFixed(dec), { fs: dec > 1 ? 9 : 10.5, c: '#657187' });
            }
            if (T >= lo && T <= hi) {
              s += SV.dot(X(T).toFixed(1), 214, RED, 5);
              s += txt(X(T).toFixed(1), 192, '√50', { fs: 12.5, c: RED, fw: 900 });
            }
            return s;
          };
          SV.stepper(h, '0 0 440 276', [
            {
              t: '先夾整數：7² = 49、8² = 64，所以 7 < √50 < 8。',
              d: () => txt(220, 60, '7² = 49 ＜ 50 ＜ 64 = 8²', { fs: 14 }) +
                txt(220, 100, '⇒ 7 ＜ √50 ＜ 8', { fs: 16, c: GRN, fw: 900 }) + line(6, 9, 3, 7, 8, 0)
            },
            {
              t: '試小數第一位：7.0² = 49、7.1² = 50.41 已經超過 50。',
              d: () => txt(220, 60, '7.0² = 49 ＜ 50 ＜ 50.41 = 7.1²', { fs: 14 }) +
                txt(220, 100, '⇒ 7.0 ＜ √50 ＜ 7.1', { fs: 16, c: GRN, fw: 900 }) + line(7, 8, 10, 7.0, 7.1, 1)
            },
            {
              t: '再切十等分試小數第二位：7.07² = 49.98、7.08² = 50.13。',
              d: () => txt(220, 60, '7.07² = 49.98 ＜ 50 ＜ 50.13 = 7.08²', { fs: 14 }) +
                txt(220, 100, '⇒ 7.07 ＜ √50 ＜ 7.08', { fs: 16, c: GRN, fw: 900 }) + line(7.0, 7.1, 10, 7.07, 7.08, 2)
            },
            {
              t: '所以 √50 ≈ 7.07（到小數第二位）。計算機顯示 7.0710678…，也是近似值。',
              d: () => txt(220, 58, '√50 ≈ 7.07', { fs: 20, c: C, fw: 900 }) +
                txt(220, 100, '計算機：7.0710678…（位數有限，仍是近似值）', { fs: 12, c: '#657187' }) + line(7.0, 7.1, 10, 7.07, 7.08, 2)
            }
          ], { acc: false });
        },
        caption: '每逼近一位，區間就縮小為原來的 \\(\\tfrac{1}{10}\\)；停在需要的位數即可。',
        example: {
          q: '用十分逼近法求 \\(\\sqrt{30}\\) 到小數第一位。',
          steps: ['\\(5^2=25<30<36=6^2\\)，先得 \\(5<\\sqrt{30}<6\\)。', '\\(5.4^2=29.16\\)、\\(5.5^2=30.25>30\\)。'],
          ans: '\\(\\sqrt{30}\\approx5.4\\)'
        }
      },

      /* ---------- 2-2 根式的運算 ---------- */
      {
        sec: '2-2', secName: '根式的運算',
        title: '根號可以乘進去，也可以拆出來',
        points: [
          '<b>乘法</b>：\\(\\sqrt{a}\\times\\sqrt{b}=\\sqrt{ab}\\)（\\(a,b\\ge0\\)）；反過來也能把 \\(\\sqrt{ab}\\) 拆成兩個根號。',
          '<b>除法</b>：\\(\\sqrt{a}\\div\\sqrt{b}=\\sqrt{\\dfrac{a}{b}}\\)（\\(b>0\\)）。',
          '\\(3\\sqrt{2}\\) 是 \\(3\\times\\sqrt{2}\\) 的簡寫：<b>係數在外、被開方數在內</b>，兩者不可混寫。'
        ],
        formula: { label: '根式的乘除', tex: '\\sqrt{a}\\,\\sqrt{b}=\\sqrt{ab},\\qquad \\dfrac{\\sqrt{a}}{\\sqrt{b}}=\\sqrt{\\dfrac{a}{b}}' },
        visual: (h) => {
          let s = box(70, 58, 190, 95, 'rgba(124,58,237,.10)', C, 6, 2.6);
          s += txt(165, 96, '面積 = √12 × √3', { fs: 13.5, c: '#172033' });
          s += txt(165, 122, '= √36 = 6', { fs: 16, c: C, fw: 900 });
          s += txt(165, 174, '√12', { fs: 14, c: '#334' });
          s += SV.seg(70, 163, 260, 163, '#9aa4b6', 2);
          s += txt(58, 112, '√3', { fs: 14, c: '#334', a: 'end' });
          s += SV.seg(59, 58, 59, 153, '#9aa4b6', 2);
          s += box(288, 58, 132, 95, '#eefaf4', GRN, 12, 2);
          s += txt(354, 84, '反過來拆：', { fs: 12, c: '#657187' });
          s += txt(354, 110, '√18 ÷ √2', { fs: 14, c: GRN, fw: 900 });
          s += txt(354, 136, '= √9 = 3', { fs: 15, c: GRN, fw: 900 });
          s += box(40, 206, 380, 60, '#f9f7ff', C, 14, 2);
          s += txt(230, 232, '√a × √b = √(ab)', { fs: 15, c: C, fw: 900 });
          s += txt(230, 256, '√a ÷ √b = √(a ÷ b)', { fs: 14, c: '#657187' });
          h.innerHTML = svg('0 0 440 276', s);
        },
        caption: '長 \\(\\sqrt{12}\\)、寬 \\(\\sqrt{3}\\) 的長方形，面積就是 \\(\\sqrt{36}=6\\)。',
        example: {
          q: '計算 \\(\\sqrt{8}\\times\\sqrt{2}\\) 與 \\(\\sqrt{45}\\div\\sqrt{5}\\)。',
          steps: ['\\(\\sqrt8\\times\\sqrt2=\\sqrt{16}=4\\)。', '\\(\\sqrt{45}\\div\\sqrt5=\\sqrt9=3\\)。'],
          ans: '\\(4\\)、\\(3\\)'
        }
      },

      {
        sec: '2-2', secName: '根式的運算',
        title: '化最簡根式：把平方因數搬到根號外',
        points: [
          '<span class="k">最簡根式</span>兩個條件：根號內<b>沒有平方因數</b>、根號內<b>沒有分數</b>。',
          '作法：把被開方數拆成 \\(k^2\\times m\\)，再開出來 \\(\\sqrt{k^2m}=k\\sqrt{m}\\)。',
          '反向也要會：\\(a\\sqrt{b}=\\sqrt{a^2b}\\)，用來比大小（\\(3\\sqrt2=\\sqrt{18}<\\sqrt{20}=2\\sqrt5\\)）。',
          '拖滑桿換被開方數，看它怎麼被拆開。'
        ],
        formula: { label: '化簡與還原', tex: '\\sqrt{k^2m}=k\\sqrt{m}\\;\\Longleftrightarrow\\;k\\sqrt{m}=\\sqrt{k^2m}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="sim"></div>
            <div class="ictrl"><label>被開方數 <span class="ival" id="mv">72</span></label>
            <input type="range" id="ms" min="2" max="120" step="1" value="72"></div></div>`;
          const draw = () => {
            const n = +h.querySelector('#ms').value;
            h.querySelector('#mv').textContent = n;
            const kv = splitSq(n), k = kv[0], m = kv[1];
            let s = ADEF;
            s += box(110, 32, 220, 52, '#f9f7ff', C, 12, 2);
            s += txt(220, 66, '√' + n, { fs: 21, c: C, fw: 900 });
            s += arwTo(220, 90, 220, 110);
            if (k === 1) {
              s += box(110, 114, 220, 52, '#fff', '#cdd6e2', 12, 2);
              s += txt(220, 146, n + ' 沒有平方因數', { fs: 14, c: '#657187' });
              s += arwTo(220, 172, 220, 192);
              s += box(110, 196, 220, 52, '#eefaf4', GRN, 12, 2.4);
              s += txt(220, 228, '√' + n + '　已是最簡根式', { fs: 15, c: GRN, fw: 900 });
            } else {
              s += box(110, 114, 220, 52, '#fff', '#cdd6e2', 12, 2);
              s += txt(220, 147, '√( ' + k + '² × ' + m + ' )', { fs: 18, fw: 900 });
              s += arwTo(220, 172, 220, 192);
              s += box(110, 196, 220, 52, '#eefaf4', GRN, 12, 2.4);
              s += txt(220, 229, m === 1 ? String(k) + '　（開得盡）' : k + '√' + m, { fs: 21, c: GRN, fw: 900 });
            }
            s += txt(220, 268, k === 1 ? n + ' 除了 1 以外沒有平方因數，搬不出任何東西'
              : '把 ' + n + ' 裡最大的平方因數 ' + (k * k) + ' 開出來，變成 ' + k, { fs: 12, c: '#657187' });
            h.querySelector('#sim').innerHTML = svg('0 0 440 280', s);
          };
          h.querySelector('#ms').oninput = draw; draw();
        },
        caption: '\\(\\sqrt{72}=\\sqrt{6^2\\times2}=6\\sqrt{2}\\)：拆出<b>最大</b>的平方因數，一次化到最簡。',
        example: {
          q: '化 \\(\\sqrt{300}\\) 為最簡根式，並比較 \\(3\\sqrt5\\) 與 \\(2\\sqrt{11}\\) 的大小。',
          steps: ['\\(\\sqrt{300}=\\sqrt{10^2\\times3}=10\\sqrt3\\)。', '\\(3\\sqrt5=\\sqrt{45}\\)、\\(2\\sqrt{11}=\\sqrt{44}\\)，\\(45>44\\)。'],
          ans: '\\(10\\sqrt3\\)；\\(3\\sqrt5>2\\sqrt{11}\\)'
        }
      },

      {
        sec: '2-2', secName: '根式的運算',
        title: '分母有理化：把根號趕出分母',
        points: [
          '分母是<b>單一根式</b> \\(\\sqrt{b}\\)：分子分母<b>同乘 \\(\\sqrt{b}\\)</b>，分母變成 \\(b\\)。',
          '分母是 \\(a\\pm\\sqrt{b}\\)：同乘<b>共軛式</b> \\(a\\mp\\sqrt{b}\\)，用<b>平方差</b>把根號消掉。',
          '有理化只是<b>擴分</b>，數值完全沒變；最後別忘了<b>約分</b>。'
        ],
        formula: { label: '兩種有理化', tex: '\\dfrac{3}{\\sqrt2}=\\dfrac{3\\sqrt2}{2},\\qquad \\dfrac{1}{\\sqrt5-1}=\\dfrac{\\sqrt5+1}{4}' },
        visual: (h) => {
          let s = ADEF;
          s += box(115, 12, 210, 44, '#f9f7ff', C, 12, 2.2);
          s += txt(220, 40, '分母出現根號 → 要有理化', { fs: 13.5, c: C, fw: 900 });
          s += arwTo(200, 58, 118, 92);
          s += arwTo(240, 58, 322, 92);
          s += box(14, 96, 200, 168, '#fff', BLU, 14, 2);
          s += txt(114, 120, '① 分母是單一根式 √b', { fs: 12.5, c: BLU, fw: 900 });
          s += txt(114, 143, '分子分母同乘 √b', { fs: 12, c: '#657187' });
          s += SV.seg(30, 156, 198, 156, '#e3e9f3', 1.6);
          s += txt(114, 182, '3 ÷ √2', { fs: 15, fw: 900 });
          s += txt(114, 208, '= (3×√2) ÷ (√2×√2)', { fs: 12 });
          s += txt(114, 240, '= 3√2 ÷ 2', { fs: 16, c: GRN, fw: 900 });
          s += box(226, 96, 200, 168, '#fff', AMB, 14, 2);
          s += txt(326, 120, '② 分母是 a ± √b', { fs: 12.5, c: AMB, fw: 900 });
          s += txt(326, 143, '同乘共軛式 a ∓ √b', { fs: 12, c: '#657187' });
          s += SV.seg(242, 156, 410, 156, '#f2e6d2', 1.6);
          s += txt(326, 182, '1 ÷ (√5 − 1)', { fs: 15, fw: 900 });
          s += txt(326, 208, '= (√5+1) ÷ (5−1)', { fs: 12 });
          s += txt(326, 240, '= (√5+1) ÷ 4', { fs: 16, c: GRN, fw: 900 });
          h.innerHTML = svg('0 0 440 276', s);
        },
        caption: '看分母長什麼樣，決定要乘 \\(\\sqrt{b}\\) 還是乘共軛式。',
        example: {
          q: '化簡 \\(\\dfrac{6}{\\sqrt3}\\) 與 \\(\\dfrac{2}{\\sqrt7+\\sqrt5}\\)。',
          steps: ['\\(\\dfrac{6}{\\sqrt3}=\\dfrac{6\\sqrt3}{3}=2\\sqrt3\\)。', '同乘共軛：\\(\\dfrac{2(\\sqrt7-\\sqrt5)}{7-5}=\\sqrt7-\\sqrt5\\)。'],
          ans: '\\(2\\sqrt3\\)；\\(\\sqrt7-\\sqrt5\\)'
        }
      },

      {
        sec: '2-2', secName: '根式的運算',
        title: '易錯：只有同類方根才能加減',
        points: [
          '化成最簡根式後<b>根號內的數相同</b>，才叫<span class="k">同類方根</span>，才能像同類項一樣合併。',
          '✗ \\(\\sqrt2+\\sqrt3=\\sqrt5\\)　✓ \\(\\sqrt2+\\sqrt3\\) <b>就是不能再合併</b>。',
          '口訣：<b>先化簡、再合併</b>——\\(\\sqrt8+\\sqrt{18}\\) 看起來不同類，化簡後其實都是 \\(\\sqrt2\\)。',
          '乘除沒有這個限制：\\(\\sqrt2\\times\\sqrt3=\\sqrt6\\) 是對的，加減才要同類。'
        ],
        formula: { label: '合併同類方根', tex: 'm\\sqrt{a}+n\\sqrt{a}=(m+n)\\sqrt{a}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:95%;margin:0 auto;display:flex;flex-direction:column;gap:11px">
            <div style="background:#fff1f4;border-left:5px solid ${RED};border-radius:12px;padding:10px 14px;text-align:left">
              <div style="font-size:12px;font-weight:900;color:${RED};letter-spacing:.04em">✗ 最常見的錯</div>
              <div style="font-size:18px;margin-top:5px">\\(\\sqrt2+\\sqrt3=\\sqrt5\\)</div>
              <div style="font-size:12px;color:#657187;margin-top:5px">代數字驗算：\\(1.414+1.732=3.146\\)，但 \\(\\sqrt5\\approx2.236\\)，差很多。</div>
            </div>
            <div style="background:#eefaf4;border-left:5px solid ${GRN};border-radius:12px;padding:10px 14px;text-align:left">
              <div style="font-size:12px;font-weight:900;color:${GRN};letter-spacing:.04em">✓ 同類方根才合併</div>
              <div style="font-size:18px;margin-top:5px">\\(2\\sqrt3+5\\sqrt3=7\\sqrt3\\)</div>
              <div style="font-size:12px;color:#657187;margin-top:5px">根號內都是 3，係數相加就好（和 \\(2x+5x=7x\\) 一模一樣）。</div>
            </div>
            <div style="background:#f5f0ff;border-left:5px solid ${C};border-radius:12px;padding:10px 14px;text-align:left">
              <div style="font-size:12px;font-weight:900;color:${C};letter-spacing:.04em">★ 先化簡、再合併</div>
              <div style="font-size:17px;margin-top:5px">\\(\\sqrt8+\\sqrt{18}=2\\sqrt2+3\\sqrt2=5\\sqrt2\\)</div>
            </div></div>`;
        },
        caption: '把 \\(\\sqrt{a}\\) 想成一個「單位」：單位相同才能加減，這是同類項的翻版。',
        example: {
          q: '計算 \\(\\sqrt{12}-\\sqrt{27}+\\sqrt{3}\\)。',
          steps: ['先化簡：\\(\\sqrt{12}=2\\sqrt3\\)、\\(\\sqrt{27}=3\\sqrt3\\)。', '合併：\\((2-3+1)\\sqrt3\\)。'],
          ans: '\\(0\\)'
        }
      },

      {
        sec: '2-2', secName: '根式的運算',
        title: '把根式代進乘法公式就能展開',
        points: [
          '把 \\(\\sqrt{a}\\) 當成一個數，第 1 章的乘法公式<b>原封不動照用</b>。',
          '\\((\\sqrt3+\\sqrt2)^2=3+2\\sqrt6+2=5+2\\sqrt6\\)：中間項是<b>兩數乘積的 2 倍</b>。',
          '\\((\\sqrt5+1)(\\sqrt5-1)=5-1=4\\)：平方差把根號整個消掉，這正是有理化的原理。'
        ],
        formula: { label: '和的平方（根式版）', tex: '(\\sqrt3+\\sqrt2)^2=(\\sqrt3)^2+2\\sqrt3\\sqrt2+(\\sqrt2)^2=5+2\\sqrt6' },
        visual: (h) => {
          const x0 = 62, y0 = 46, a = 98, b = 80;
          let s = box(x0, y0, a, a, 'rgba(124,58,237,.16)', C, 3, 1.6);
          s += box(x0 + a, y0, b, a, 'rgba(217,119,6,.16)', AMB, 3, 1.6);
          s += box(x0, y0 + a, a, b, 'rgba(217,119,6,.16)', AMB, 3, 1.6);
          s += box(x0 + a, y0 + a, b, b, 'rgba(5,150,105,.16)', GRN, 3, 1.6);
          s += txt(x0 + a / 2, y0 + a / 2 + 6, '3', { fs: 18, c: C, fw: 900 });
          s += txt(x0 + a + b / 2, y0 + a / 2 + 6, '√6', { fs: 15, c: AMB, fw: 900 });
          s += txt(x0 + a / 2, y0 + a + b / 2 + 6, '√6', { fs: 15, c: AMB, fw: 900 });
          s += txt(x0 + a + b / 2, y0 + a + b / 2 + 6, '2', { fs: 17, c: GRN, fw: 900 });
          s += txt(x0 + a / 2, y0 - 12, '√3', { fs: 13, c: '#657187' });
          s += txt(x0 + a + b / 2, y0 - 12, '√2', { fs: 13, c: '#657187' });
          s += txt(x0 - 10, y0 + a / 2 + 5, '√3', { fs: 13, c: '#657187', a: 'end' });
          s += txt(x0 - 10, y0 + a + b / 2 + 5, '√2', { fs: 13, c: '#657187', a: 'end' });
          s += txt(352, 100, '(√3 + √2)²', { fs: 16, c: C, fw: 900 });
          s += txt(352, 132, '= 3 + √6 + √6 + 2', { fs: 13 });
          s += txt(352, 164, '= 5 + 2√6', { fs: 17, c: GRN, fw: 900 });
          s += txt(220, 262, '四塊面積相加，就是展開後的四項', { fs: 12, c: '#657187' });
          h.innerHTML = svg('0 0 440 276', s);
        },
        caption: '邊長 \\(\\sqrt3+\\sqrt2\\) 的正方形切成四塊：\\(3,\\sqrt6,\\sqrt6,2\\)，合起來就是 \\(5+2\\sqrt6\\)。',
        example: {
          q: '展開 \\((2\\sqrt3-1)^2\\)。',
          steps: ['\\((2\\sqrt3)^2=4\\times3=12\\)。', '中間項 \\(-2\\times2\\sqrt3\\times1=-4\\sqrt3\\)，末項 \\(1\\)。'],
          ans: '\\(13-4\\sqrt3\\)'
        }
      },

      /* ---------- 2-3 畢氏定理 ---------- */
      {
        sec: '2-3', secName: '畢氏定理',
        title: '畢氏定理：兩股平方和＝斜邊平方',
        points: [
          '<b>直角</b>三角形中，兩<b>股</b>的平方和等於<b>斜邊</b>的平方：\\(a^2+b^2=c^2\\)。',
          '又叫勾股弦定理、商高定理；用<b>面積拼圖</b>就能看出它為什麼對。',
          '前提是<b>直角</b>——沒有直角就不能用這個式子。',
          '拖步驟滑桿：兩股上正方形的格子數，剛好填滿斜邊上的正方形。'
        ],
        formula: { label: '畢氏定理', tex: 'a^2+b^2=c^2\\quad(c\\ \\text{為斜邊})' },
        visual: (h) => {
          const u = 25, A = [162, 208];
          const Cv = [A[0], A[1] - 3 * u], B = [A[0] + 4 * u, A[1]];
          const ux = (B[0] - Cv[0]) / 5, uy = (B[1] - Cv[1]) / 5;
          // 斜邊正方形要往「遠離三角形」的那一側長：法向量取 (uy, -ux)
          const vx = uy, vy = -ux;
          const steps = [
            {
              t: '畫直角三角形，兩股 3 與 4、斜邊 5。',
              d: () => SV.poly([A, B, Cv], 'rgba(124,58,237,.10)', C, 2.6) +
                SV.rightAngle(A[0], A[1], 0, 90, 14, '#657187') +
                txt(A[0] + 10, 184, 'a=3', { fs: 10.5, c: '#334', a: 'start' }) +
                txt(A[0] + 70, 205, 'b=4', { fs: 10.5, c: '#334' }) +
                txt(A[0] + 54, 187, 'c=5', { fs: 10.5, c: RED, fw: 900 })
            },
            {
              t: '兩股各向外做正方形：3×3 = 9 格、4×4 = 16 格。',
              d: () => gridSq(Cv[0], Cv[1], 0, u, -u, 0, 3, 'rgba(37,99,235,.14)', BLU) +
                gridSq(A[0], A[1], u, 0, 0, u, 4, 'rgba(217,119,6,.14)', AMB) +
                txt(Cv[0] - 38, Cv[1] + 42, '9', { fs: 20, c: BLU, fw: 900 }) +
                txt(A[0] + 50, A[1] + 60, '16', { fs: 20, c: AMB, fw: 900 })
            },
            {
              t: '斜邊也向外做正方形：5×5 = 25 格。',
              d: () => gridSq(Cv[0], Cv[1], ux, uy, vx, vy, 5, 'rgba(225,29,72,.12)', RED) +
                txt(Cv[0] + 2.5 * ux + 2.5 * vx, Cv[1] + 2.5 * uy + 2.5 * vy + 7, '25', { fs: 20, c: RED, fw: 900 })
            },
            {
              t: '數格子：9 + 16 = 25，正是 a² + b² = c²。',
              d: () => txt(220, 28, '9 + 16 = 25　⇒　3² + 4² = 5²', { fs: 16, c: GRN, fw: 900 })
            }
          ];
          SV.stepper(h, '0 0 440 330', steps);
        },
        caption: '兩個小正方形的格子數加起來，剛好等於斜邊正方形的格子數。',
        example: {
          q: '直角三角形兩股長 6、8，求斜邊長。',
          steps: ['\\(c^2=6^2+8^2=36+64=100\\)。', '\\(c=\\sqrt{100}=10\\)。'],
          ans: '斜邊 \\(=10\\)'
        }
      },

      {
        sec: '2-3', secName: '畢氏定理',
        title: '求斜邊用加、求股用減',
        points: [
          '已知<b>兩股</b> → 斜邊 \\(c=\\sqrt{a^2+b^2}\\)（<b>平方相加</b>再開根號）。',
          '已知<b>斜邊與一股</b> → 另一股 \\(b=\\sqrt{c^2-a^2}\\)（<b>平方相減</b>再開根號）。',
          '背熟常見畢氏數組 \\(3,4,5\\)／\\(5,12,13\\)／\\(8,15,17\\)／\\(7,24,25\\)，看到就能直接寫答案。',
          '整組<b>同乘一個倍數</b>仍是畢氏數組：\\(6,8,10\\)、\\(9,12,15\\)、\\(10,24,26\\)。'
        ],
        formula: { label: '兩種題型', tex: 'c=\\sqrt{a^2+b^2}\\qquad b=\\sqrt{c^2-a^2}' },
        visual: (h) => {
          const chip = (x, y, w, label) => box(x, y, w, 34, '#f9f7ff', C, 10, 1.8) + txt(x + w / 2, y + 23, label, { fs: 13.5, c: C, fw: 900 });
          const T1 = [[45, 150], [150, 150], [45, 72]];
          const T2 = [[270, 150], [390, 150], [270, 100]];   // 12:5 比例，與標示的 5、12、13 相符
          let s = SV.poly(T1, 'rgba(37,99,235,.08)', BLU, 2.4);
          s += SV.rightAngle(45, 150, 0, 90, 13, '#657187');
          s += txt(97, 169, '8', { fs: 13, c: '#334' });
          s += txt(34, 115, '6', { fs: 13, c: '#334', a: 'end' });
          s += txt(115, 100, 'c = ?', { fs: 13, c: RED, fw: 900 });
          s += txt(97, 46, '已知兩股 → 求斜邊', { fs: 12.5, c: BLU, fw: 900 });
          s += txt(97, 200, 'c = √(6² + 8²) = √100 = 10', { fs: 12.5 });
          s += SV.poly(T2, 'rgba(217,119,6,.08)', AMB, 2.4);
          s += SV.rightAngle(270, 150, 0, 90, 12, '#657187');
          s += txt(330, 169, 'b = ?', { fs: 13, c: RED, fw: 900 });
          s += txt(262, 130, '5', { fs: 13, c: '#334', a: 'end' });
          s += txt(348, 116, '13', { fs: 13, c: '#334' });
          s += txt(330, 46, '已知斜邊與一股 → 求股', { fs: 12.5, c: AMB, fw: 900 });
          s += txt(330, 200, 'b = √(13² − 5²) = √144 = 12', { fs: 12.5 });
          s += txt(230, 232, '常見畢氏數組（整組 ×2、×3… 仍成立）', { fs: 12, c: '#657187' });
          s += chip(20, 244, 96, '3, 4, 5') + chip(128, 244, 100, '5, 12, 13') +
            chip(240, 244, 100, '8, 15, 17') + chip(352, 244, 100, '7, 24, 25');
          h.innerHTML = svg('0 0 460 296', s);
        },
        caption: '看清楚「未知的是斜邊還是股」，決定式子裡是加號還是減號。',
        example: {
          q: '直角三角形斜邊長 25、一股長 7，求另一股。',
          steps: ['\\(b^2=25^2-7^2=625-49=576\\)。', '\\(b=\\sqrt{576}=24\\)（就是 \\(7,24,25\\) 這組）。'],
          ans: '另一股 \\(=24\\)'
        }
      },

      {
        sec: '2-3', secName: '畢氏定理',
        title: '易錯：先找出斜邊，再決定加還是減',
        points: [
          '<b>斜邊＝直角對面那一邊＝最長邊</b>；圖形轉來轉去時，<b>直角記號</b>才是唯一依據。',
          '✗ 看到兩個數字就直接平方相加。✓ 先問一句：<b>這兩邊裡面有沒有斜邊？</b>',
          '若題目給「斜邊＋一股」，一定是<b>相減</b>：\\(b^2=c^2-a^2\\)。',
          '算完再檢查一次：<b>斜邊必須是三邊中最長的</b>，答案比斜邊還長就一定錯。'
        ],
        formula: { label: '角色先分清楚', tex: 'a^2+b^2=c^2\\;\\Longleftrightarrow\\;a^2=c^2-b^2' },
        visual: (h) => {
          const draw3 = (P, Q, R, ra) => SV.poly([P, Q, R], 'rgba(124,58,237,.07)', C, 2.4) + ra +
            SV.seg(Q[0], Q[1], R[0], R[1], RED, 3.4);
          let s = txt(230, 34, '直角記號對面的那一邊，就是斜邊', { fs: 13.5, c: C, fw: 900 });
          s += draw3([30, 180], [135, 180], [30, 95], SV.rightAngle(30, 180, 0, 90, 12, '#657187'));
          s += txt(96, 126, '斜邊', { fs: 11.5, c: RED, fw: 900 });
          s += draw3([190, 95], [190, 190], [295, 95], SV.rightAngle(190, 95, 270, 0, 12, '#657187'));
          s += txt(256, 155, '斜邊', { fs: 11.5, c: RED, fw: 900 });
          s += draw3([430, 180], [325, 180], [430, 95], SV.rightAngle(430, 180, 90, 180, 12, '#657187'));
          s += txt(364, 126, '斜邊', { fs: 11.5, c: RED, fw: 900 });
          s += box(20, 206, 420, 32, '#fff1f4', RED, 10, 1.8);
          s += txt(230, 227, '✗ 兩邊長 6、10（10 為斜邊）就算 √(6² + 10²)', { fs: 12.5, c: RED, fw: 800 });
          s += box(20, 244, 420, 32, '#eefaf4', GRN, 10, 1.8);
          s += txt(230, 265, '✓ 10 是斜邊 → 另一股 = √(10² − 6²) = √64 = 8', { fs: 12.5, c: GRN, fw: 800 });
          h.innerHTML = svg('0 0 460 288', s);
        },
        caption: '三張圖的直角位置都不同，但「直角對面＝斜邊」永遠成立。',
        example: {
          q: '直角三角形的斜邊長 10、一股長 6，求另一股。',
          steps: ['斜邊是 10，所以要相減：\\(b^2=10^2-6^2=64\\)。', '\\(b=8\\)（不是 \\(\\sqrt{136}\\)）。'],
          ans: '另一股 \\(=8\\)'
        }
      },

      {
        sec: '2-3', secName: '畢氏定理',
        title: '逆敘述：三邊符合就是直角三角形',
        points: [
          '反過來也成立：三邊長滿足 \\(a^2+b^2=c^2\\)（\\(c\\) 最長），就<b>一定是</b>直角三角形。',
          '判斷步驟：<b>先挑出最長邊</b> → 算另外兩邊的平方和 → 和最長邊的平方比一比。',
          '相等才是直角三角形；不相等就<b>只能說「不是直角三角形」</b>。',
          '拖滑桿改變第三邊，看兩個平方值什麼時候剛好相等。'
        ],
        formula: { label: '畢氏定理的逆敘述', tex: 'a^2+b^2=c^2\\;\\Rightarrow\\;\\triangle ABC\\ \\text{是直角三角形}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="inv"></div>
            <div class="ictrl"><label>第三邊 c <span class="ival" id="cv">10</span></label>
            <input type="range" id="cs" min="3" max="13" step="0.5" value="10"></div></div>`;
          const draw = () => {
            const c = +h.querySelector('#cs').value;
            h.querySelector('#cv').textContent = c.toFixed(1);
            const B = [130, 258], Cc = [290, 258], d = 160, r1 = 120, r2 = c * 20;
            const px = (d * d + r1 * r1 - r2 * r2) / (2 * d);
            const py = Math.sqrt(Math.max(0, r1 * r1 - px * px));
            const A = [B[0] + px, B[1] - py];
            const ok = Math.abs(c - 10) < 1e-9;
            let s = SV.poly([A, B, Cc], ok ? 'rgba(5,150,105,.10)' : 'rgba(124,58,237,.07)', ok ? GRN : C, 2.6);
            if (ok) s += SV.rightAngle(B[0], B[1], 0, 90, 15, GRN);
            s += SV.dot(A[0].toFixed(1), A[1].toFixed(1), '#172033', 4) + SV.vlabel(A[0] - 6, A[1] - 10, 'A');
            s += SV.dot(B[0], B[1], '#172033', 4) + SV.vlabel(B[0] - 20, B[1] + 12, 'B');
            s += SV.dot(Cc[0], Cc[1], '#172033', 4) + SV.vlabel(Cc[0] + 8, Cc[1] + 12, 'C');
            s += txt((B[0] + Cc[0]) / 2, B[1] + 20, '8', { fs: 13, c: '#334' });
            s += txt((A[0] + B[0]) / 2 - 14, (A[1] + B[1]) / 2, '6', { fs: 13, c: '#334' });
            s += txt((A[0] + Cc[0]) / 2 + 16, (A[1] + Cc[1]) / 2, 'c = ' + c.toFixed(1), { fs: 13, c: RED, fw: 900 });
            s += txt(220, 32, '6² + 8² = 100', { fs: 15, c: BLU, fw: 900 });
            s += txt(220, 56, 'c² = ' + (c * c).toFixed(2), { fs: 15, c: AMB, fw: 900 });
            s += box(70, 70, 300, 34, ok ? '#eefaf4' : '#fff1f4', ok ? GRN : RED, 10, 1.8);
            s += txt(220, 92, ok ? '100 = 100 ⇒ 是直角三角形（直角在 B）' : '兩者不相等 ⇒ 不是直角三角形',
              { fs: 13, c: ok ? GRN : RED, fw: 900 });
            h.querySelector('#inv').innerHTML = svg('0 0 440 290', s);
          };
          h.querySelector('#cs').oninput = draw; draw();
        },
        caption: '只有 \\(c=10\\) 時 \\(6^2+8^2=c^2\\)，這時 \\(\\angle B\\) 才是直角。',
        example: {
          q: '三邊長 9、12、15 的三角形是直角三角形嗎？',
          steps: ['最長邊為 15，\\(9^2+12^2=81+144=225\\)。', '\\(15^2=225\\)，兩者相等。'],
          ans: '是直角三角形'
        }
      },

      {
        sec: '2-3', secName: '畢氏定理',
        title: '三個一定要記的長度：對角線、高、斜邊上的高',
        points: [
          '正方形<b>對角線</b> \\(=\\sqrt2\\times\\)邊長（因為 \\(a^2+a^2=d^2\\)）。',
          '正三角形<b>高</b> \\(=\\dfrac{\\sqrt3}{2}\\times\\)邊長，<b>面積</b> \\(=\\dfrac{\\sqrt3}{4}\\times\\)邊長\\(^2\\)。',
          '直角三角形<b>斜邊上的高</b>：面積用兩種算法 \\(\\dfrac12ab=\\dfrac12ch\\)，得 \\(h=\\dfrac{ab}{c}\\)。',
          '複合圖形算不出來時，<b>補一條垂線</b>切出直角三角形，通常就通了。'
        ],
        formula: { label: '三個常用結果', tex: 'd=\\sqrt2\\,a;\\quad h=\\tfrac{\\sqrt3}{2}a,\\ S=\\tfrac{\\sqrt3}{4}a^2;\\quad h=\\dfrac{ab}{c}' },
        visual: (h) => {
          let s = txt(230, 32, '這三個結果全部由畢氏定理推出來', { fs: 12.5, c: '#657187' });
          // ① 正方形對角線
          s += box(30, 60, 100, 100, 'rgba(37,99,235,.08)', BLU, 4, 2.4);
          s += SV.seg(30, 160, 130, 60, RED, 2.8);
          s += txt(80, 180, 'a', { fs: 12, c: '#334' });
          s += txt(106, 106, '√2 a', { fs: 11.5, c: RED, fw: 900 });
          s += txt(80, 212, '正方形對角線', { fs: 11.5, c: BLU, fw: 900 });
          s += txt(80, 232, 'd = √2 × 邊長', { fs: 11.5, c: '#657187' });
          // ② 正三角形的高與面積（底 110、高 95 ≈ 110×√3/2）
          const P = [[175, 160], [285, 160], [230, 65]];
          s += SV.poly(P, 'rgba(217,119,6,.08)', AMB, 2.4);
          s += SV.seg(230, 65, 230, 160, RED, 2.4, '5 4');
          s += SV.rightAngle(230, 160, 0, 90, 10, RED);
          s += txt(230, 180, 'a', { fs: 12, c: '#334' });
          s += txt(245, 118, 'h', { fs: 12, c: RED, fw: 900 });
          s += txt(230, 212, '正三角形的高與面積', { fs: 11.5, c: AMB, fw: 900 });
          s += txt(230, 232, 'h = (√3/2)a，S = (√3/4)a²', { fs: 11, c: '#657187' });
          // ③ 直角三角形斜邊上的高（垂足由 (335,160) 對斜邊投影得 (373.6,109.4)）
          const Q = [[335, 160], [335, 80], [440, 160]];
          s += SV.poly(Q, 'rgba(5,150,105,.08)', GRN, 2.4);
          s += SV.rightAngle(335, 160, 0, 90, 11, '#657187');
          s += SV.seg(335, 160, 373.6, 109.4, RED, 2.4);
          s += txt(328, 124, 'a', { fs: 12, c: '#334', a: 'end' });
          s += txt(390, 180, 'b', { fs: 12, c: '#334' });
          s += txt(404, 110, 'c', { fs: 12, c: '#334' });
          s += txt(364, 140, 'h', { fs: 12, c: RED, fw: 900 });
          s += txt(388, 212, '斜邊上的高', { fs: 11.5, c: GRN, fw: 900 });
          s += txt(388, 232, 'h = ab ÷ c', { fs: 11.5, c: '#657187' });
          // 底部：說明 h = ab ÷ c 的由來（同一個面積算兩次）
          s += box(20, 250, 420, 32, '#f9f7ff', C, 10, 1.8);
          s += txt(230, 271, '面積算兩次：(1/2)ab = (1/2)ch ⇒ h = ab ÷ c', { fs: 12, c: C, fw: 800 });
          h.innerHTML = svg('0 0 460 290', s);
        },
        caption: '三個都不用死背推導：正方形切對角線、正三角形切高、直角三角形算兩次面積。',
        example: {
          q: '正三角形邊長 6，求它的高與面積。',
          steps: ['高 \\(=\\dfrac{\\sqrt3}{2}\\times6=3\\sqrt3\\)。', '面積 \\(=\\dfrac12\\times6\\times3\\sqrt3\\)。'],
          ans: '高 \\(3\\sqrt3\\)、面積 \\(9\\sqrt3\\)'
        }
      },

      {
        sec: '2-3', secName: '畢氏定理',
        title: '坐標平面上的兩點距離就是畢氏定理',
        points: [
          '同一條水平線上兩點距離 \\(=|x_1-x_2|\\)；同一條鉛直線上 \\(=|y_1-y_2|\\)。',
          '斜的就補一個<b>直角三角形</b>：水平差、鉛直差當兩股，兩點連線當斜邊。',
          '\\(\\overline{AB}=\\sqrt{(x_1-x_2)^2+(y_1-y_2)^2}\\)，先<b>平方</b>所以不必管差是正是負。',
          '拖滑桿移動 \\(B\\)，看兩股與斜邊怎麼跟著變。'
        ],
        formula: { label: '兩點距離公式', tex: '\\overline{AB}=\\sqrt{(x_1-x_2)^2+(y_1-y_2)^2}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="dst"></div>
            <div class="ictrl"><label>B 的 x 坐標 <span class="ival" id="bv">4</span></label>
            <input type="range" id="bs" min="2" max="8" step="1" value="4"></div></div>`;
          const draw = () => {
            const bx = +h.querySelector('#bs').value;
            h.querySelector('#bv').textContent = bx;
            const P = SV.plane({ x0: 44, y0: 14, w: 300, h: 270, xmin: -1, xmax: 9, ymin: -1, ymax: 8 });
            const A = [P.X(1), P.Y(2)], B = [P.X(bx), P.Y(6)], K = [P.X(bx), P.Y(2)];
            const dx = bx - 1, dy = 4, d2 = dx * dx + dy * dy, d = Math.sqrt(d2);
            let s = P.defs + P.svg;
            s += SV.seg(A[0], A[1], K[0], K[1], AMB, 3, '6 4');
            s += SV.seg(K[0], K[1], B[0], B[1], BLU, 3, '6 4');
            s += SV.rightAngle(K[0], K[1], 90, 180, 11, '#657187');
            s += SV.seg(A[0], A[1], B[0], B[1], RED, 3.2);
            s += SV.dot(A[0], A[1], '#172033', 4.5) + SV.vlabel(A[0] - 12, A[1] + 20, 'A(1,2)', C, 12);
            s += SV.dot(B[0], B[1], '#172033', 4.5) + SV.vlabel(B[0] - 6, B[1] - 10, 'B(' + bx + ',6)', C, 12);
            s += txt((A[0] + K[0]) / 2 + 6, K[1] - 10, '水平差 ' + dx, { fs: 11.5, c: AMB, fw: 900 });
            s += txt(K[0] + 28, (K[1] + B[1]) / 2, '鉛直差 4', { fs: 11.5, c: BLU, fw: 900 });
            s += txt(232, 300, 'AB = √(' + dx + '² + 4²) = √' + d2 + (Number.isInteger(d) ? ' = ' + d : ' ≈ ' + d.toFixed(2)),
              { fs: 13.5, c: RED, fw: 900 });
            h.querySelector('#dst').innerHTML = svg('0 0 370 312', s);
          };
          h.querySelector('#bs').oninput = draw; draw();
        },
        caption: '把水平差與鉛直差當兩股，兩點距離就是那條斜邊。',
        example: {
          q: '求 \\(A(1,2)\\) 與 \\(B(4,6)\\) 的距離。',
          steps: ['水平差 \\(4-1=3\\)、鉛直差 \\(6-2=4\\)。', '\\(\\overline{AB}=\\sqrt{3^2+4^2}=\\sqrt{25}\\)。'],
          ans: '\\(\\overline{AB}=5\\)'
        }
      }
    ]
  });
})();
