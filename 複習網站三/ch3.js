/* ============ 第 3 章　因式分解 ============
   依康軒版第三冊（八上）：3-1 利用提公因式與乘法公式做因式分解、3-2 利用十字交乘法做因式分解
   課綱邊界：因式限「二次多項式的一次因式」；方法只有提公因式、乘法公式、十字交乘；
             不做分組分解、不做高次連續分解、不處理二元齊次式、不進入解方程式（屬第4章）。
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#059669';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  // 一般文字（預設置中、粗體）
  const T = (x, y, t, col, fs, anchor) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor || 'middle'}" font-size="${fs || 16}" font-weight="800" fill="${col || '#172033'}">${t}</text>`;
  // 等寬字（直式運算用）
  const MN = (x, y, t, col, fs, wt) =>
    `<text x="${x}" y="${y}" font-size="${fs || 18}" font-weight="${wt || 700}" fill="${col || '#172033'}" font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace">${t}</text>`;
  // 帶正負號的數字字串
  const sg = n => (n < 0 ? '−' + Math.abs(n) : '' + n);

  window.DECK.push({
    ch: 3,
    title: '因式分解',
    color: C,
    sections: ["3-1 利用提公因式與乘法公式做因式分解", "3-2 利用十字交乘法做因式分解"],
    slides: [

      /* ---------- 3-1 利用提公因式與乘法公式做因式分解 ---------- */
      {
        sec: '3-1', secName: '因式與倍式',
        title: 'A ＝ B × C：B、C 是 A 的因式，A 是倍式',
        points: [
          '整數有因數，多項式有<span class="k">因式</span>：\\(A=B\\times C\\) 時 \\(B,C\\) 是 \\(A\\) 的因式，\\(A\\) 是它們的<b>倍式</b>。',
          '想確認某個一次式是不是因式，就<b>做長除法</b>——<b>餘式為 0</b> 才算。',
          '本章只處理<b>二次多項式的一次因式</b>，不必分解到更高次。'
        ],
        formula: { label: '因式的判準', tex: 'A\\div B\\ \\text{餘式}=0\\iff B\\ \\text{是}\\ A\\ \\text{的因式}' },
        visual: (h) => {
          h.innerHTML = svg('0 0 440 278', `
            ${MN(176, 52, 'x + 3', C, 19, 900)}
            ${SV.seg(152, 64, 402, 64, '#334', 2)}
            ${SV.seg(152, 64, 152, 104, '#334', 2)}
            ${MN(48, 92, 'x + 2', '#172033', 18)}
            ${MN(168, 92, 'x² + 5x + 6', '#172033', 18)}
            ${MN(168, 126, 'x² + 2x', '#8a94a6', 18)}
            ${SV.seg(164, 138, 304, 138, '#9aa4b6', 1.6)}
            ${MN(236, 166, '3x + 6', '#172033', 18)}
            ${MN(236, 198, '3x + 6', '#8a94a6', 18)}
            ${SV.seg(232, 210, 346, 210, '#9aa4b6', 1.6)}
            ${MN(300, 236, '0', RED, 22, 900)}
            <text x="22" y="242" font-size="13.5" font-weight="900" fill="${RED}">餘式 ＝ 0</text>
            <text x="22" y="264" font-size="12.5" fill="#657187">⇒ (x＋2) 是 x²＋5x＋6 的因式</text>
          `);
        },
        caption: '長除法算到餘式為 0，才能說 \\(x+2\\) 是 \\(x^2+5x+6\\) 的因式。',
        example: {
          q: '\\(x-1\\) 是不是 \\(x^2+2x-3\\) 的因式？',
          steps: ['做長除法：\\((x^2+2x-3)\\div(x-1)\\)，商 \\(x+3\\)。', '餘式為 \\(0\\)，所以是因式，且 \\(x^2+2x-3=(x-1)(x+3)\\)。'],
          ans: '是因式'
        }
      },

      {
        sec: '3-1', secName: '因式分解的意義',
        title: '因式分解，就是把展開「倒著走」',
        points: [
          '把多項式寫成<b>兩個以上因式的連乘積</b>，叫<span class="k">因式分解</span>。',
          '展開是「乘開來」，因式分解是「收回去」，兩者<b>互為逆運算</b>。',
          '<b>最好用的檢查法</b>：分解完把答案乘回去，能還原原式才算對。'
        ],
        formula: { label: '展開 ⇄ 因式分解', tex: 'x^2+5x+6\\;\\xrightarrow{\\text{因式分解}}\\;(x+2)(x+3)' },
        visual: (h) => {
          const ox = 78, oy = 42, a = 132, p = 66, q = 46;
          const box = (x, y, w, hh, fill, stroke) =>
            `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
          h.innerHTML = svg('0 0 440 282', `
            ${box(ox, oy, a, a, 'rgba(5,150,105,0.14)', C)}
            ${box(ox + a, oy, p, a, 'rgba(37,99,235,0.12)', BLU)}
            ${box(ox, oy + a, a, q, 'rgba(217,119,6,0.12)', AMB)}
            ${box(ox + a, oy + a, p, q, 'rgba(225,29,72,0.12)', RED)}
            ${T(ox + a / 2, oy + a / 2 + 8, 'x²', C, 22)}
            ${T(ox + a + p / 2, oy + a / 2 + 7, '3x', BLU, 19)}
            ${T(ox + a / 2, oy + a + q / 2 + 7, '2x', AMB, 19)}
            ${T(ox + a + p / 2, oy + a + q / 2 + 7, '6', RED, 19)}
            ${T(ox + a / 2, oy - 10, 'x', '#657187', 15)}
            ${T(ox + a + p / 2, oy - 10, '3', '#657187', 15)}
            ${T(ox - 12, oy + a / 2 + 5, 'x', '#657187', 15, 'end')}
            ${T(ox - 12, oy + a + q / 2 + 5, '2', '#657187', 15, 'end')}
            ${T(ox + (a + p) / 2, oy + a + q + 26, '寬 ＝ x ＋ 3', C, 14)}
            ${T(ox + a + p + 12, oy + a / 2 + 5, '高 ＝ x ＋ 2', C, 14, 'start')}
            ${T(220, 272, '面積 ＝ x² ＋ 5x ＋ 6 ＝ (x＋2)(x＋3)', '#172033', 16)}
          `);
        },
        caption: '同一塊面積的兩種寫法：拆成四塊是<b>展開</b>，合成一個長方形是<b>因式分解</b>。',
        example: {
          q: '先展開 \\((x+4)(x+1)\\)，再寫出 \\(x^2+5x+4\\) 的因式分解。',
          steps: ['展開：\\(x^2+x+4x+4=x^2+5x+4\\)。', '倒著看回去即得分解結果。'],
          ans: '\\(x^2+5x+4=(x+4)(x+1)\\)'
        }
      },

      {
        sec: '3-1', secName: '提公因式',
        title: '提公因式：係數取最大公因數、文字取最低次方',
        points: [
          '拿到任何多項式，<b>第一步永遠先找公因式</b>，把每一項都有的部分提到括號外。',
          '<b>係數</b>取各項係數的<b>最大公因數</b>；<b>文字</b>取各項都有的<b>最低次方</b>。',
          '括號內各項＝原式各項<b>除以公因式</b>，別把最後的 \\(1\\) 漏掉。',
          '數字也能提：\\(25\\times37+25\\times63=25(37+63)=2500\\)。'
        ],
        formula: { label: '提公因式', tex: 'ma+mb=m(a+b)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="gc"></div>
            <div class="ictrl"><label>第二項係數 b <span class="ival" id="gv">9</span></label>
            <input type="range" id="gs" min="2" max="18" step="1" value="9"></div></div>`;
          const u = 15, x0 = 122;
          const draw = () => {
            const b = +h.querySelector('#gs').value;
            h.querySelector('#gv').textContent = b;
            const G = gcd(12, b);
            let s = T(220, 34, `每一格 ＝ ${G}　（12 與 ${b} 的最大公因數）`, '#657187', 13);
            for (let i = 0; i < 12 / G; i++)
              s += `<rect x="${x0 + i * G * u}" y="${64}" width="${G * u - 3}" height="36" rx="5" fill="${BLU}" opacity="0.78"/>`;
            for (let i = 0; i < b / G; i++)
              s += `<rect x="${x0 + i * G * u}" y="${118}" width="${G * u - 3}" height="36" rx="5" fill="${AMB}" opacity="0.82"/>`;
            s += T(112, 88, '12x²', BLU, 16, 'end') + T(112, 142, `${b}x`, AMB, 16, 'end');
            const gp = (G === 1 ? 'x' : G + 'x');
            const t1 = ((12 / G) === 1 ? 'x' : (12 / G) + 'x');
            s += T(220, 182, `↓　提出公因式 ${gp}`, RED, 14);
            s += T(220, 216, `12x² ＋ ${b}x ＝ ${gp}( ${t1} ＋ ${b / G} )`, '#172033', 19);
            s += T(220, 250, `係數取最大公因數 ${G}；文字取最低次方 x`, '#657187', 12.5);
            h.querySelector('#gc').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#gs').oninput = draw; draw();
        },
        caption: '拖滑桿改變第二項係數，看<b>最大公因數</b>怎麼跟著變——那就是能提出來的份量。',
        example: {
          q: '因式分解 \\(4a^2b-8ab^2\\)。',
          steps: ['係數 \\(4,8\\) 的最大公因數是 \\(4\\)；文字取最低次方 \\(ab\\)。', '公因式 \\(4ab\\)，括號內為 \\(a-2b\\)。'],
          ans: '\\(4ab(a-2b)\\)'
        }
      },

      {
        sec: '3-1', secName: '提公因式',
        title: '公因式也可以是一整個括號',
        points: [
          '公因式不一定是單項式，<b>整個括號</b>也能提：\\(a(x+1)+b(x+1)=(x+1)(a+b)\\)。',
          '看到 \\((a-b)\\) 與 \\((b-a)\\) 別急著說沒公因式——它們只<b>差一個負號</b>。',
          '<b>變號技巧</b>：\\(b-a=-(a-b)\\)，把括號統一後就提得出來。'
        ],
        formula: { label: '變號技巧', tex: '(b-a)=-(a-b)' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '把括號當成一個整體', tex: 'a(x+1)+b(x+1)=(x+1)(a+b)', color: C, fill: '#eef7f2', border: C, size: 17 },
            { label: '括號相反 → 先變號', tex: 'x(a-b)+y(b-a)=x(a-b)-y(a-b)', color: AMB, border: '#f0dcc0', size: 16, note: '因為 b − a ＝ −(a − b)' },
            { label: '再提出共同括號', tex: '=(a-b)(x-y)', color: RED, border: '#f0c9d3', size: 18 }
          ], { gap: 10 });
        },
        caption: '只要把 \\((b-a)\\) 變號成 \\(-(a-b)\\)，兩項就出現<b>同一個括號</b>了。',
        example: {
          q: '因式分解 \\(3(x-2)+x(2-x)\\)。',
          steps: ['\\(2-x=-(x-2)\\)，原式 \\(=3(x-2)-x(x-2)\\)。', '提出 \\((x-2)\\)。'],
          ans: '\\((x-2)(3-x)\\)'
        }
      },

      {
        sec: '3-1', secName: '乘法公式',
        title: '看到「平方 減 平方」就用平方差',
        points: [
          '\\(a^2-b^2=(a+b)(a-b)\\)：兩項都是<b>完全平方</b>、中間是<b>減號</b>才能用。',
          '先把每一項都寫成<b>某個式子的平方</b>，\\(a\\) 和 \\(b\\) 就自動現形。',
          '<b>和不能拆</b>：\\(a^2+b^2\\) 在國中<b>無法</b>因式分解，別硬套。',
          '<b>速算</b>：\\(99^2-1=(99+1)(99-1)=100\\times98=9800\\)。'
        ],
        formula: { label: '平方差公式', tex: 'a^2-b^2=(a+b)(a-b)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="sq"></div>
            <div class="ictrl"><label>挖掉的邊長 b <span class="ival" id="bv">2</span></label>
            <input type="range" id="bs" min="1" max="4" step="1" value="2"></div></div>`;
          const u = 22, ox = 34, oy = 46, A = 5;
          const draw = () => {
            const b = +h.querySelector('#bs').value;
            h.querySelector('#bv').textContent = b;
            const S = A * u, cut = b * u, x1 = ox + S, y1 = oy + S;
            const L = [[ox, oy], [x1, oy], [x1, y1 - cut], [x1 - cut, y1 - cut], [x1 - cut, y1], [ox, y1]];
            let s = T(ox + S / 2, 24, '大正方形挖掉小正方形', '#657187', 12);
            s += SV.poly(L, 'rgba(5,150,105,0.16)', C, 2.2);
            s += `<rect x="${x1 - cut}" y="${y1 - cut}" width="${cut}" height="${cut}" fill="none" stroke="${RED}" stroke-width="2" stroke-dasharray="5 4"/>`;
            s += T(ox + S / 2, oy - 8, '5', '#657187', 14) + T(ox - 10, oy + S / 2 + 5, '5', '#657187', 14, 'end');
            s += T(x1 - cut / 2, y1 - cut / 2 + 5, `${b}²`, RED, 12);
            // 右：重排成 (5+b)×(5−b) 的長方形
            const ox2 = 200, W = (A + b) * u, H = (A - b) * u, oy2 = oy + S / 2 - H / 2;
            s += T(ox2 + W / 2, 24, '重排成長方形', '#657187', 12);
            s += `<rect x="${ox2}" y="${oy2}" width="${W}" height="${H}" rx="3" fill="rgba(37,99,235,0.16)" stroke="${BLU}" stroke-width="2.2"/>`;
            s += T(ox2 + W / 2, oy2 + H + 20, `5 ＋ ${b}`, BLU, 14);
            s += T(ox2 - 8, oy2 + H / 2 + 5, `5 − ${b}`, BLU, 14, 'end');
            s += T(220, 216, `5² − ${b}² ＝ ${25 - b * b}`, '#172033', 18);
            s += T(220, 250, `(5＋${b})(5−${b}) ＝ ${5 + b} × ${5 - b} ＝ ${25 - b * b}`, GRN, 18);
            h.querySelector('#sq').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#bs').oninput = draw; draw();
        },
        caption: '挖掉一角的 L 形面積 \\(=5^2-b^2\\)，剪開重排剛好是 \\((5+b)\\times(5-b)\\) 的長方形。',
        example: {
          q: '因式分解 \\(4x^2-25\\)。',
          steps: ['\\(4x^2=(2x)^2\\)、\\(25=5^2\\)，兩項都是完全平方。', '套平方差公式。'],
          ans: '\\((2x+5)(2x-5)\\)'
        }
      },

      {
        sec: '3-1', secName: '乘法公式',
        title: '完全平方式：中間項要剛好是「兩數乘積的 2 倍」',
        points: [
          '\\(a^2+2ab+b^2=(a+b)^2\\)、\\(a^2-2ab+b^2=(a-b)^2\\)。',
          '<b>三步驟判斷</b>：首尾都是完全平方 → 各自開平方得 \\(a,b\\) → 檢查中間項是不是 \\(2ab\\)。',
          '中間項<b>負</b>的配 \\((a-b)^2\\)；<b>尾項永遠是正的</b>，別寫成負數。'
        ],
        formula: { label: '完全平方公式', tex: 'a^2\\pm2ab+b^2=(a\\pm b)^2' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="cp"></div>
            <div class="ictrl"><label>常數 b <span class="ival" id="cv">3</span></label>
            <input type="range" id="cs" min="1" max="4" step="1" value="3"></div></div>`;
          const ox = 130, oy = 36, X = 110, u = 22;
          const draw = () => {
            const b = +h.querySelector('#cs').value;
            h.querySelector('#cv').textContent = b;
            const w = b * u;
            const box = (x, y, ww, hh, fill, stroke) =>
              `<rect x="${x}" y="${y}" width="${ww}" height="${hh}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
            let s = box(ox, oy, X, X, 'rgba(5,150,105,0.15)', C);
            s += box(ox + X, oy, w, X, 'rgba(37,99,235,0.13)', BLU);
            s += box(ox, oy + X, X, w, 'rgba(37,99,235,0.13)', BLU);
            s += box(ox + X, oy + X, w, w, 'rgba(225,29,72,0.13)', RED);
            const bx1 = (b === 1 ? 'x' : `${b}x`);   // 係數 1 不寫出來
            s += T(ox + X / 2, oy + X / 2 + 8, 'x²', C, 22);
            s += T(ox + X + w / 2, oy + X / 2 + 6, bx1, BLU, 14);
            s += T(ox + X / 2, oy + X + w / 2 + 6, bx1, BLU, 14);
            s += T(ox + X + w / 2, oy + X + w / 2 + 5, `${b * b}`, RED, 13);
            s += T(ox + X / 2, oy - 8, 'x', '#657187', 14) + T(ox + X + w / 2, oy - 8, `${b}`, '#657187', 14);
            s += T(ox - 10, oy + X / 2 + 5, 'x', '#657187', 14, 'end') + T(ox - 10, oy + X + w / 2 + 5, `${b}`, '#657187', 14, 'end');
            s += T(220, 262, `x² ＋ ${2 * b}x ＋ ${b * b} ＝ (x ＋ ${b})²`, '#172033', 19);
            s += T(220, 292, `中間項 ${2 * b}x ＝ 2 × x × ${b} ✓`, RED, 13);
            h.querySelector('#cp').innerHTML = svg('0 0 440 305', s);
          };
          h.querySelector('#cs').oninput = draw; draw();
        },
        caption: '兩塊 \\(bx\\) 就是中間項的來源，所以中間項一定是 \\(2\\times x\\times b\\)。',
        example: {
          q: '因式分解 \\(x^2-12x+36\\)。',
          steps: ['首項 \\(x^2\\)、尾項 \\(36=6^2\\)，開平方得 \\(x\\) 與 \\(6\\)。', '中間項 \\(2\\times x\\times6=12x\\) ✓，且為負號。'],
          ans: '\\((x-6)^2\\)'
        }
      },

      {
        sec: '3-1', secName: '速算應用',
        title: '倒過來用：把難算的算式先因式分解',
        points: [
          '看到「某數的平方 減 某數的平方」，先套<b>平方差</b>再乘，心算就能完成。',
          '\\(99^2-1=(99+1)(99-1)=100\\times98=9800\\)，比直接平方快得多。',
          '\\(13^2-12^2=(13+12)(13-12)=25\\times1=25\\)：差 1 時答案就是<b>兩數的和</b>。',
          '提公因數也是速算：\\(25\\times37+25\\times63=25\\times100=2500\\)。'
        ],
        formula: { label: '速算兩招', tex: 'a^2-b^2=(a+b)(a-b),\\qquad ma+mb=m(a+b)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="qk"></div>
            <div class="ictrl"><label>取一個數 n <span class="ival" id="nv">99</span></label>
            <input type="range" id="ns" min="11" max="99" step="1" value="99"></div></div>`;
          const draw = () => {
            const n = +h.querySelector('#ns').value;
            h.querySelector('#nv').textContent = n;
            let s = T(220, 30, `直接算 ${n}² 很累，先分解再乘`, '#657187', 13);
            s += `<rect x="80" y="44" width="280" height="46" rx="12" fill="#eef7f2" stroke="${C}" stroke-width="2"/>`;
            s += T(220, 75, `${n}² − 1²`, C, 22);
            s += SV.seg(220, 96, 220, 112, '#9aa4b6', 2) +
              `<polygon points="220,122 213,110 227,110" fill="#9aa4b6"/>`;
            s += T(220, 146, '套平方差 a² − b² ＝ (a＋b)(a−b)', RED, 13);
            s += `<rect x="60" y="160" width="320" height="46" rx="12" fill="#eef4ff" stroke="${BLU}" stroke-width="2"/>`;
            s += T(220, 191, `(${n} ＋ 1)(${n} − 1) ＝ ${n + 1} × ${n - 1}`, BLU, 19);
            s += T(220, 250, `＝ ${n * n - 1}`, GRN, 26);
            h.querySelector('#qk').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#ns').oninput = draw; draw();
        },
        caption: '拖滑桿換一個 \\(n\\)：\\(n^2-1\\) 永遠可以拆成 \\((n+1)(n-1)\\)，兩個好乘的整數。',
        example: {
          q: '用因式分解速算 \\(102^2-2^2\\)。',
          steps: ['套平方差：\\((102+2)(102-2)\\)。', '\\(=104\\times100=10400\\)。'],
          ans: '\\(10400\\)'
        }
      },

      {
        sec: '3-1', secName: '易錯提醒',
        title: '最常扣分：沒提乾淨、沒分到底、硬拆「和」',
        points: [
          '✗ \\(6x^2+9x=3(2x^2+3x)\\)　✓ \\(3x(2x+3)\\)：<b>文字也要一起提</b>。',
          '✗ \\(2x^2-18=2(x^2-9)\\) 就收工　✓ \\(2(x+3)(x-3)\\)：<b>括號內還能分就要分</b>。',
          '✗ \\(x^2+4=(x+2)^2\\)　✓ \\(x^2+4\\) <b>無法分解</b>：平方「和」不能拆。',
          '✗ \\(x^2+x=x\\cdot x\\)　✓ \\(x(x+1)\\)：提完別把 <b>1</b> 漏掉。'
        ],
        formula: { label: '分到底才算完成', tex: '2x^2-18=2(x^2-9)=2(x+3)(x-3)' },
        visual: (h) => {
          const item = (n, t, note) => `
            <div style="display:flex;gap:10px;align-items:flex-start;background:#fff;border:1.5px solid #dce3ee;border-left:4px solid ${C};border-radius:12px;padding:9px 12px">
              <div style="flex:0 0 22px;height:22px;border-radius:50%;background:${C};color:#fff;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center">${n}</div>
              <div style="text-align:left">
                <div style="font-size:13.5px;font-weight:900;color:#172033">${t}</div>
                <div style="font-size:12px;color:#657187;margin-top:2px">${note}</div>
              </div></div>`;
          h.innerHTML = `<div style="width:96%;margin:0 auto;display:flex;flex-direction:column;gap:9px">
            <div style="font-size:13px;font-weight:900;color:${C};text-align:center">寫完答案，一定要問自己三句話</div>
            ${item(1, '括號外提乾淨了嗎？', '括號內各項是不是還有共同的數或文字')}
            ${item(2, '括號內還能再分解嗎？', '看看是不是 a²−b² 或 a²±2ab＋b²')}
            ${item(3, '乘回去等於原式嗎？', '展開驗算是最快、最不會冤枉的檢查')}
            <div style="background:#fdeef2;border:1.5px solid #f0c9d3;border-radius:12px;padding:10px 12px;text-align:center">
              <div style="font-size:15px;color:#172033">\\(2x^2-18\\;\\to\\;2(x^2-9)\\;\\to\\;2(x+3)(x-3)\\)</div>
              <div style="font-size:12px;color:${RED};margin-top:5px;font-weight:800">停在中間那一步 ＝ 沒分到底，照樣扣分</div>
            </div></div>`;
        },
        caption: '「先提公因式，再套乘法公式」是兩步驟題的標準流程，缺一步就不完整。',
        example: {
          q: '因式分解 \\(3x^2-27\\)（要分到底）。',
          steps: ['先提公因式 \\(3\\)：\\(3(x^2-9)\\)。', '括號內是平方差：\\(x^2-9=(x+3)(x-3)\\)。'],
          ans: '\\(3(x+3)(x-3)\\)'
        }
      },

      /* ---------- 3-2 利用十字交乘法做因式分解 ---------- */
      {
        sec: '3-2', secName: '十字交乘',
        title: '十字交乘的來源：和是中間項、積是常數項',
        points: [
          '從 \\((x+p)(x+q)=x^2+(p+q)x+pq\\) 倒推：找兩數，<b>相加得一次項係數</b>、<b>相乘得常數項</b>。',
          '常數項<b>為正</b> ⇒ 兩數<b>同號</b>，且與一次項同號；<b>為負</b> ⇒ 兩數<b>異號</b>。',
          '拖兩支滑桿改變 \\(p,q\\)，觀察中間項與常數項怎麼跟著變。'
        ],
        formula: { label: '十字交乘原理', tex: '(x+p)(x+q)=x^2+(p+q)x+pq' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="cx"></div>
            <div class="ictrl">
              <label>p <span class="ival" id="pv">2</span></label><input type="range" id="ps" min="-6" max="6" step="1" value="2">
              <label>q <span class="ival" id="qv">3</span></label><input type="range" id="qs" min="-6" max="6" step="1" value="3">
            </div></div>`;
          const fac = n => (n === 0 ? 'x' : `(x ${n > 0 ? '＋' : '−'} ${Math.abs(n)})`);
          const pair = (p, q) => (p === 0 && q === 0 ? 'x · x' : fac(p) + fac(q));
          const draw = () => {
            const p = +h.querySelector('#ps').value, q = +h.querySelector('#qs').value;
            h.querySelector('#pv').textContent = p; h.querySelector('#qv').textContent = q;
            const m = p + q, c = p * q;
            let poly = 'x²';
            if (m !== 0) poly += (m > 0 ? ' ＋ ' : ' − ') + (Math.abs(m) === 1 ? '' : Math.abs(m)) + 'x';
            if (c !== 0) poly += (c > 0 ? ' ＋ ' : ' − ') + Math.abs(c);
            let s = T(220, 32, '把 x² 拆成 x·x，常數拆成 p × q', '#657187', 13);
            s += T(150, 96, 'x', BLU, 22) + T(150, 162, 'x', BLU, 22);
            s += T(288, 96, sg(p), AMB, 22) + T(288, 162, sg(q), AMB, 22);
            s += SV.seg(170, 104, 268, 156, '#9aa4b6', 2, '5 4') + SV.seg(170, 156, 268, 104, '#9aa4b6', 2, '5 4');
            s += T(330, 100, `p ＋ q ＝ ${sg(m)}`, BLU, 13, 'start');
            s += T(330, 168, `p × q ＝ ${sg(c)}`, AMB, 13, 'start');
            s += SV.seg(96, 188, 344, 188, '#cdd6e2', 1.8);
            s += T(220, 218, poly, '#172033', 20);
            s += T(220, 254, pair(p, q), GRN, 20);
            s += T(220, 286, c > 0 ? '常數項為正 ⇒ 兩數同號' : (c < 0 ? '常數項為負 ⇒ 兩數異號' : '常數項為 0 ⇒ 直接提公因式 x'), RED, 13);
            h.querySelector('#cx').innerHTML = svg('0 0 440 300', s);
          };
          h.querySelector('#ps').oninput = draw; h.querySelector('#qs').oninput = draw; draw();
        },
        caption: '一次項係數是兩數的<b>和</b>、常數項是兩數的<b>積</b>——這就是十字交乘要找的東西。',
        example: {
          q: '因式分解 \\(x^2-5x+6\\)。',
          steps: ['積為 \\(+6\\)（同號）、和為 \\(-5\\)（都取負）。', '找到 \\(-2\\) 與 \\(-3\\)。'],
          ans: '\\((x-2)(x-3)\\)'
        }
      },

      {
        sec: '3-2', secName: '十字交乘',
        title: '二次項係數不是 1：兩邊一起拆，交叉相乘再相加',
        points: [
          '左行拆<b>二次項係數</b>、右行拆<b>常數項</b>，<b>交叉</b>相乘的兩個結果相加要等於一次項係數。',
          '用<b>正負號與奇偶</b>先篩：常數項為負就一正一負，能大幅減少試誤次數。',
          '答案是<b>橫著讀</b>：上排一組括號、下排一組括號。拖滑桿看四個步驟。'
        ],
        formula: { label: '交叉相乘之和 = 一次項', tex: 'a_1a_2=a,\\quad c_1c_2=c,\\quad a_1c_2+a_2c_1=b' },
        visual: (h) => {
          const steps = [
            {
              t: '要分解 <b>6x² ＋ x − 2</b>：先把二次項 6x² 拆成 2x × 3x。',
              d: () => T(220, 40, '6x² ＋ x − 2', C, 21) + T(158, 104, '2x', BLU, 21) + T(158, 172, '3x', BLU, 21)
            },
            {
              t: '再把常數項 −2 拆成 (−1) × 2（積為負 ⇒ 一正一負）。',
              d: () => T(282, 104, '−1', AMB, 21) + T(282, 172, '2', AMB, 21)
            },
            {
              t: '<b>交叉</b>相乘再相加，看是否等於一次項係數。',
              d: () => SV.seg(180, 112, 262, 166, '#9aa4b6', 2, '5 4') + SV.seg(180, 166, 262, 112, '#9aa4b6', 2, '5 4') +
                T(318, 116, '2x × 2 ＝ 4x', BLU, 12.5, 'start') +
                T(318, 152, '3x ×(−1)＝ −3x', AMB, 12.5, 'start') +
                SV.seg(314, 164, 430, 164, '#cdd6e2', 1.6) +
                T(318, 186, '和 ＝ x ✓', RED, 14, 'start')
            },
            {
              t: '橫著讀出兩個括號，最後乘回去驗算中間項。',
              d: () => `<rect x="104" y="214" width="232" height="54" rx="14" fill="#eef7f2" stroke="${C}" stroke-width="2.2"/>` +
                T(220, 250, '(2x − 1)(3x ＋ 2)', C, 22)
            }
          ];
          SV.stepper(h, '0 0 440 290', steps);
        },
        caption: '左行 \\(2x,3x\\)、右行 \\(-1,2\\)，交叉相乘得 \\(4x\\) 與 \\(-3x\\)，相加剛好是 \\(x\\)。',
        example: {
          q: '因式分解 \\(2x^2+7x+3\\)。',
          steps: ['二次項拆 \\(2x\\times x\\)、常數項拆 \\(1\\times3\\)。', '交叉相乘：\\(2x\\times3+x\\times1=7x\\) ✓。'],
          ans: '\\((2x+1)(x+3)\\)'
        }
      },

      {
        sec: '3-2', secName: '綜合策略',
        title: '拿到題目的固定順序：公因式 → 乘法公式 → 十字交乘',
        points: [
          '<b>順序不能顛倒</b>：先提公因式，數字變小之後再判斷公式或交乘會輕鬆很多。',
          '二次項係數是<b>負</b>的，先提出 \\(-1\\)（或連同公因數一起提）再做交乘。',
          '整數對試完都湊不出來，就是<b>在整數範圍內無法因式分解</b>——這也是一種答案。'
        ],
        formula: { label: '分解流程', tex: '\\text{提公因式}\\;\\to\\;\\text{乘法公式}\\;\\to\\;\\text{十字交乘}' },
        visual: (h) => {
          const bx = (y, fill, stroke, n, t, sub) =>
            `<rect x="46" y="${y}" width="348" height="56" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/>` +
            T(74, y + 34, n, stroke, 20) +
            T(230, y + 26, t, '#172033', 15) +
            T(230, y + 45, sub, '#657187', 12);
          const arw = (y) => SV.seg(220, y, 220, y + 12, '#9aa4b6', 2) +
            `<polygon points="220,${y + 20} 214,${y + 10} 226,${y + 10}" fill="#9aa4b6"/>`;
          h.innerHTML = svg('0 0 440 330', `
            ${bx(8, '#eef7f2', C, '①', '有公因式嗎？有就先提出來', '含二次項係數為負時先提 −1')}
            ${arw(64)}
            ${bx(88, '#eef4ff', BLU, '②', '符合乘法公式嗎？', 'a² − b²　或　a² ± 2ab ＋ b²')}
            ${arw(144)}
            ${bx(168, '#fdf3e7', AMB, '③', '二次三項式 → 十字交乘', '相加得中間項、相乘得常數項')}
            ${arw(224)}
            ${bx(248, '#fdeef2', RED, '④', '都試不出來 → 無法分解', '在整數範圍內找不到符合的整數對')}
            ${T(220, 322, '順序照走，速度最快、也最不容易漏解', '#657187', 12.5)}
          `);
        },
        caption: '每一題都照 ①→②→③ 走一次，第 ④ 步「不能分解」也是合法答案。',
        example: {
          q: '因式分解 \\(-2x^2+10x-12\\)。',
          steps: ['先提出 \\(-2\\)：\\(-2(x^2-5x+6)\\)。', '括號內十字交乘：\\(x^2-5x+6=(x-2)(x-3)\\)。'],
          ans: '\\(-2(x-2)(x-3)\\)'
        }
      },

      {
        sec: '3-2', secName: '易錯提醒',
        title: '十字交乘最常見的錯：符號擺反與沒有驗算',
        points: [
          '✗ \\(x^2-5x+6=(x+2)(x+3)\\)　✓ \\((x-2)(x-3)\\)：<b>積正、和負 ⇒ 兩數都取負</b>。',
          '✗ \\(x^2+x-6=(x+3)(x+2)\\)　✓ \\((x+3)(x-2)\\)：<b>常數項為負，必為一正一負</b>。',
          '✗ 係數不為 1 時把兩數<b>同一排相乘</b>　✓ 一定要<b>交叉</b>相乘再相加。',
          '✓ 保命動作：寫完<b>乘回去檢查中間項</b>，20 秒就能抓到符號錯。'
        ],
        formula: { label: '兩數的和與積', tex: 'x^2+bx+c=(x+p)(x+q),\\quad p+q=b,\\ pq=c' },
        visual: (h) => {
          const cell = (t, w) => `<td style="border:1px solid #cdd6e2;padding:8px 6px${w ? ';font-weight:900' : ''}">${t}</td>`;
          h.innerHTML = `<div style="width:97%;margin:0 auto">
            <table style="width:100%;border-collapse:collapse;font-size:12.5px;text-align:center">
              <tr style="background:#eef7f2">
                <th style="border:1px solid #cdd6e2;padding:8px">常數項 c</th>
                <th style="border:1px solid #cdd6e2;padding:8px">一次項 b</th>
                <th style="border:1px solid #cdd6e2;padding:8px">兩數符號</th>
                <th style="border:1px solid #cdd6e2;padding:8px">例</th>
              </tr>
              <tr>
                ${cell('<span style="color:' + GRN + '">正</span>', 1)}${cell('<span style="color:' + GRN + '">正</span>', 1)}
                ${cell('<b>都是正的</b>')}${cell('x²＋5x＋6<br>＝(x＋2)(x＋3)')}
              </tr>
              <tr style="background:#fafcfb">
                ${cell('<span style="color:' + GRN + '">正</span>', 1)}${cell('<span style="color:' + RED + '">負</span>', 1)}
                ${cell('<b>都是負的</b>')}${cell('x²−5x＋6<br>＝(x−2)(x−3)')}
              </tr>
              <tr>
                ${cell('<span style="color:' + RED + '">負</span>', 1)}${cell('正或負', 1)}
                ${cell('<b>一正一負</b><br>絕對值大的跟 b 同號')}${cell('x²＋x−6<br>＝(x＋3)(x−2)')}
              </tr>
            </table>
            <div style="margin-top:10px;font-size:12.5px;color:#657187;text-align:center">
              先用這張表<b>決定符號</b>，再去湊絕對值，試誤次數馬上少一半。</div>
          </div>`;
        },
        caption: '先看常數項的正負決定「同號／異號」，再看一次項的正負決定往哪邊倒。',
        example: {
          q: '因式分解 \\(x^2-x-12\\)。',
          steps: ['常數項 \\(-12\\) 為負 ⇒ 兩數異號；和為 \\(-1\\) ⇒ 絕對值大的取負。', '找到 \\(-4\\) 與 \\(3\\)，驗算 \\(-4+3=-1\\) ✓。'],
          ans: '\\((x-4)(x+3)\\)'
        }
      }
    ]
  });
})();
