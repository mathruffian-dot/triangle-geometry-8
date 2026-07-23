/* ============ 第 1 章　乘法公式與多項式 ============
   依康軒版第三冊（八上）課程計畫：1-1 乘法公式、1-2 多項式與其加減運算、1-3 多項式的乘除運算
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#2563eb';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }

  // 通用文字（預設置中、粗體）
  const txt = (x, y, t, opt = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${opt.a || 'middle'}" font-size="${opt.fs || 14}" font-weight="${opt.fw || 800}" fill="${opt.c || '#172033'}">${t}</text>`;

  // 面積模型的小方塊（k 為 0~1 的出現進度）
  function cell(x, y, w, hh, fill, col, lbl, k, fs) {
    const op = (0.9 * k).toFixed(2);
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="${fill}" opacity="${op}" stroke="#fff" stroke-width="2"/>`;
    if (k > 0.35 && w > 30 && hh > 26) s += txt(x + w / 2, y + hh / 2 + 6, lbl, { fs: fs || 18, c: col });
    return s;
  }

  // 圓角資訊框
  const boxr = (x, y, w, hh, t, col, bg, fs) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="12" fill="${bg}" stroke="${col}" stroke-width="2"/>` +
    txt(x + w / 2, y + hh / 2 + 7, t, { fs: fs || 18, c: col });

  // 向下箭頭
  const downArrow = (x, y1, y2) =>
    SV.seg(x, y1, x, y2, '#9aa4b6', 2) +
    `<path d="M${x - 6},${y2 - 8} L${x},${y2} L${x + 6},${y2 - 8}" fill="none" stroke="#9aa4b6" stroke-width="2"/>`;

  window.DECK.push({
    ch: 1,
    title: '乘法公式與多項式',
    color: C,
    sections: ['1-1 乘法公式', '1-2 多項式與其加減運算', '1-3 多項式的乘除運算'],
    slides: [

      /* ---------- 1-1 乘法公式 ---------- */
      {
        sec: '1-1', secName: '乘法公式',
        title: '括號展開：裡面每一項都要乘到',
        points: [
          '<span class="k">分配律</span>：\\(a(c+d)=ac+ad\\)，括號外的那一項要<b>分給裡面每一項</b>。',
          '雙括號 \\((a+b)(c+d)\\)：左邊 2 項 × 右邊 2 項＝<b>4 項</b>，一項都不能漏。',
          '想成<b>長方形面積</b>：長 \\(a+b\\)、寬 \\(c+d\\)，切成四小塊加起來就是答案。',
          '後面三個乘法公式，全都是這一條的<b>特例</b>——先把這裡練熟。'
        ],
        formula: { label: '雙括號展開', tex: '(a+b)(c+d)=ac+ad+bc+bd' },
        visual: (h) => {
          const X0 = 100, XM = 280, X1 = 392, Y0 = 62, YM = 172, Y1 = 252;
          const base = () =>
            `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="#f6f8fc" stroke="#9aa4b6" stroke-width="2"/>` +
            SV.seg(XM, Y0, XM, Y1, '#c3ccdb', 1.5, '4 4') + SV.seg(X0, YM, X1, YM, '#c3ccdb', 1.5, '4 4') +
            txt((X0 + XM) / 2, Y0 - 14, 'a', { fs: 16 }) + txt((XM + X1) / 2, Y0 - 14, 'b', { fs: 16 }) +
            txt(X0 - 16, (Y0 + YM) / 2 + 6, 'c', { a: 'end', fs: 16 }) +
            txt(X0 - 16, (YM + Y1) / 2 + 6, 'd', { a: 'end', fs: 16 }) +
            txt(46, 292, '(a+b)(c+d) =', { a: 'start', fs: 15 });
          SV.stepper(h, '0 0 440 305', [
            { t: '長 <b>a＋b</b>、寬 <b>c＋d</b> 的大長方形。', d: () => base() },
            { t: '左上角這塊面積是 <b>a×c</b>。', d: k => cell(X0, Y0, XM - X0, YM - Y0, C, '#fff', 'ac', k) + txt(178, 292, 'ac', { fs: 15, c: C }) },
            { t: '左下角這塊面積是 <b>a×d</b>。', d: k => cell(X0, YM, XM - X0, Y1 - YM, VIO, '#fff', 'ad', k) + txt(232, 292, '+ ad', { fs: 15, c: VIO }) },
            { t: '右上角這塊面積是 <b>b×c</b>。', d: k => cell(XM, Y0, X1 - XM, YM - Y0, AMB, '#fff', 'bc', k) + txt(294, 292, '+ bc', { fs: 15, c: AMB }) },
            { t: '右下角 <b>b×d</b>；四塊加起來就是展開式。', d: k => cell(XM, YM, X1 - XM, Y1 - YM, GRN, '#fff', 'bd', k) + txt(356, 292, '+ bd', { fs: 15, c: GRN }) }
          ]);
        },
        caption: '大長方形被切成四塊，面積和就是 \\(ac+ad+bc+bd\\)——四項缺一不可。',
        example: {
          q: '展開 \\((x+3)(x+5)\\)。',
          steps: ['四項相乘：\\(x\\cdot x+x\\cdot5+3\\cdot x+3\\cdot5\\)。', '\\(=x^2+5x+3x+15\\)，合併中間兩項。'],
          ans: '\\(x^2+8x+15\\)'
        }
      },

      {
        sec: '1-1', secName: '和的平方',
        title: '和的平方：中間項是「兩數乘積的 2 倍」',
        points: [
          '\\((a+b)^2=a^2+2ab+b^2\\)，中間的 \\(2ab\\) 是<b>最常被漏掉</b>的一項。',
          '面積模型：邊長 \\(a+b\\) 的正方形，切成 \\(a^2\\)、兩塊 \\(ab\\)、\\(b^2\\)。',
          '兩塊 \\(ab\\) 一模一樣，所以合起來是 <b>2 倍</b>，不是 1 倍。',
          '拖滑桿改變 \\(b\\)：\\(a^2\\) 不動，但中間兩塊會跟著長大。'
        ],
        formula: { label: '和的平方', tex: '(a+b)^2=a^2+2ab+b^2' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="sqfig"></div>
            <div class="ictrl"><label>b 的值 <span class="ival" id="bv2">3</span>（a 固定為 5）</label>
            <input type="range" id="bs2" min="2" max="6" step="1" value="3"></div></div>`;
          // u 取 19：b 拉到最大 6 時 Y0=41，上方的 a／b 標籤才不會被 viewBox 上緣切掉
          const u = 19, X0 = 112, A = 5 * u, YB = 250;
          const draw = () => {
            const b = +h.querySelector('#bs2').value;
            h.querySelector('#bv2').textContent = b;
            const B = b * u, Y0 = YB - A - B;
            let s = '';
            s += cell(X0, Y0, A, A, C, '#fff', 'a² = 25', 1, 16);
            s += cell(X0 + A, Y0, B, A, AMB, '#fff', 'ab', 1, 15);
            s += cell(X0, Y0 + A, A, B, AMB, '#fff', 'ab', 1, 15);
            s += cell(X0 + A, Y0 + A, B, B, GRN, '#fff', 'b²', 1, 15);
            s += txt(X0 + A / 2, Y0 - 9, 'a = 5', { fs: 13, c: '#657187' });
            s += txt(X0 + A + B / 2, Y0 - 9, 'b = ' + b, { fs: 13, c: '#657187' });
            s += txt(X0 - 12, Y0 + A / 2, 'a', { a: 'end', fs: 13, c: '#657187' });
            s += txt(X0 - 12, Y0 + A + B / 2, 'b', { a: 'end', fs: 13, c: '#657187' });
            s += txt(220, 288, `(5 + ${b})² = 5² + 2×5×${b} + ${b}²`, { fs: 15 });
            s += txt(220, 314, `= 25 + ${10 * b} + ${b * b} = ${(5 + b) * (5 + b)}`, { fs: 16, c: C });
            h.querySelector('#sqfig').innerHTML = svg('0 0 440 330', s);
          };
          h.querySelector('#bs2').oninput = draw; draw();
        },
        caption: '黃色兩塊都是 \\(ab\\)，所以中間項是 \\(2ab\\)，絕不是只有一個 \\(ab\\)。',
        example: {
          q: '展開 \\((x+4)^2\\)。',
          steps: ['\\(a=x,\\ b=4\\)，中間項 \\(2\\times x\\times4=8x\\)。', '\\(=x^2+8x+16\\)。'],
          ans: '\\(x^2+8x+16\\)'
        }
      },

      {
        sec: '1-1', secName: '差的平方',
        title: '差的平方：只有中間項變負號',
        points: [
          '\\((a-b)^2=a^2-2ab+b^2\\)：<b>只有中間項是負的</b>，最後的 \\(b^2\\) 仍然是正的。',
          '理由看圖：從 \\(a^2\\) 扣掉兩條 \\(ab\\)，右下角那塊 \\(b^2\\) <b>被扣了兩次</b>。',
          '扣多了就要<b>加回來一次</b>，所以式子最後 \\(+b^2\\)。',
          '也可以直接把 \\((a+b)^2\\) 裡的 \\(b\\) 換成 \\(-b\\) 去記。'
        ],
        formula: { label: '差的平方', tex: '(a-b)^2=a^2-2ab+b^2' },
        visual: (h) => {
          const X0 = 66, Y0 = 42, A = 196, B = 74;
          let s = '';
          s += `<rect x="${X0}" y="${Y0}" width="${A}" height="${A}" fill="none" stroke="#8a94a6" stroke-width="2"/>`;
          s += `<rect x="${X0 + A - B}" y="${Y0}" width="${B}" height="${A}" fill="${AMB}" opacity="0.28"/>`;
          s += `<rect x="${X0}" y="${Y0 + A - B}" width="${A}" height="${B}" fill="${AMB}" opacity="0.28"/>`;
          s += `<rect x="${X0 + A - B}" y="${Y0 + A - B}" width="${B}" height="${B}" fill="${RED}" opacity="0.45"/>`;
          s += `<rect x="${X0}" y="${Y0}" width="${A - B}" height="${A - B}" fill="${C}" opacity="0.22"/>`;
          s += txt(X0 + (A - B) / 2, Y0 + (A - B) / 2 + 7, '(a−b)²', { fs: 18, c: C });
          s += txt(X0 + A - B / 2, Y0 + (A - B) / 2 + 6, 'ab', { fs: 14, c: '#8a5a00' });
          s += txt(X0 + (A - B) / 2, Y0 + A - B / 2 + 6, 'ab', { fs: 14, c: '#8a5a00' });
          s += txt(X0 + A - B / 2, Y0 + A - B / 2 + 6, 'b²', { fs: 14, c: RED });
          s += txt(X0 + A / 2, Y0 - 12, 'a', { fs: 15 });
          s += txt(X0 - 14, Y0 + A / 2 + 5, 'a', { a: 'end', fs: 15 });
          const lg = (y, col, op, t, tc) =>
            `<rect x="292" y="${y}" width="20" height="20" rx="5" fill="${col}" opacity="${op}"/>` +
            txt(320, y + 15, t, { a: 'start', fs: 12, c: tc || '#172033', fw: 700 });
          s += lg(60, C, 0.22, '剩下的 (a−b)²', C);
          s += lg(100, AMB, 0.28, '扣掉兩條 ab', '#8a5a00');
          s += lg(140, RED, 0.45, 'b² 被扣兩次', RED);
          s += txt(292, 186, '→ 所以要 +b² 補回來', { a: 'start', fs: 12, c: RED, fw: 700 });
          s += txt(220, 272, '(a−b)² = a² − ab − ab + b² = a² − 2ab + b²', { fs: 15, c: C });
          h.innerHTML = svg('0 0 440 292', s);
        },
        caption: '藍色區塊就是 \\((a-b)^2\\)；紅色角落被兩條 \\(ab\\) 重複扣掉，要加回來。',
        example: {
          q: '展開 \\((2x-3)^2\\)。',
          steps: ['\\(a=2x,\\ b=3\\)：首項 \\((2x)^2=4x^2\\)。', '中間 \\(-2\\times2x\\times3=-12x\\)，末項 \\(+9\\)。'],
          ans: '\\(4x^2-12x+9\\)'
        }
      },

      {
        sec: '1-1', secName: '平方差',
        title: '平方差：只差一個符號時才能用',
        points: [
          '\\((a+b)(a-b)=a^2-b^2\\)：兩個括號<b>只差中間的正負號</b>，其餘完全一樣才能套。',
          '展開後<b>沒有中間項</b>（\\(+ab\\) 與 \\(-ab\\) 剛好抵消）。',
          '看圖：把挖角後的 L 形剪一刀再拼，就變成 \\((a+b)\\times(a-b)\\) 的長方形。',
          '\\((a+b)(a+b)\\) <b>不能</b>用；\\((a+b)(b-a)\\) 要看成 \\(b^2-a^2\\)。'
        ],
        formula: { label: '平方差公式', tex: '(a+b)(a-b)=a^2-b^2' },
        visual: (h) => {
          const X = 62, Y = 40, A = 190, B = 68;
          const L = [[X, Y], [X + A, Y], [X + A, Y + A - B], [X + A - B, Y + A - B], [X + A - B, Y + A], [X, Y + A]];
          const topRect = `<rect x="${X}" y="${Y}" width="${A}" height="${A - B}" fill="rgba(37,99,235,0.16)" stroke="${C}" stroke-width="2.4"/>`;
          const botMoved = k =>
            `<g transform="translate(${((A + B) * k).toFixed(1)},${(-(A - B) * k).toFixed(1)}) rotate(${(90 * k).toFixed(1)},${X},${Y + A - B})">` +
            `<rect x="${X}" y="${Y + A - B}" width="${A - B}" height="${B}" fill="rgba(225,29,72,0.20)" stroke="${RED}" stroke-width="2.4"/></g>`;
          SV.stepper(h, '0 0 440 300', [
            {
              t: '邊長 a 的正方形，挖掉邊長 b 的小正方形。', d: () =>
                `<rect x="${X}" y="${Y}" width="${A}" height="${A}" fill="none" stroke="#c3ccdb" stroke-width="2" stroke-dasharray="5 4"/>` +
                SV.poly(L, 'rgba(37,99,235,0.16)', C, 2.4) +
                txt(X + A / 2, Y - 12, 'a', { fs: 15 }) + txt(X - 14, Y + A / 2 + 5, 'a', { a: 'end', fs: 15 }) +
                txt(X + A - B / 2, Y + A - B / 2 + 5, 'b', { fs: 13, c: '#8a94a6' }) +
                txt(220, 272, '剩下的面積 = a² − b²', { fs: 16, c: C })
            },
            {
              t: '沿紅色虛線把 L 形切成<b>上下兩塊</b>。', d: () =>
                SV.poly(L, 'rgba(37,99,235,0.16)', C, 2.4) +
                SV.seg(X, Y + A - B, X + A - B, Y + A - B, RED, 2.6, '6 5') +
                txt(X + A / 2, Y + (A - B) / 2 + 5, '① a × (a−b)', { fs: 13, c: C }) +
                txt(X + (A - B) / 2, Y + A - B / 2 + 5, '② (a−b) × b', { fs: 13, c: RED }) +
                txt(220, 272, '面積沒有變，只是切開', { fs: 14, c: '#657187' })
            },
            {
              t: '把 ② 轉 90°，貼到 ① 的<b>右邊</b>。', d: k =>
                topRect + botMoved(k) + txt(220, 272, '拖到底看看拼成什麼', { fs: 14, c: '#657187' })
            },
            {
              t: '拼成長 <b>a+b</b>、寬 <b>a−b</b> 的長方形。', d: () =>
                topRect + botMoved(1) +
                SV.seg(X, Y + A - B + 22, X + A + B, Y + A - B + 22, '#657187', 1.8) +
                txt(X + (A + B) / 2, Y + A - B + 44, 'a + b', { fs: 15, c: '#172033' }) +
                txt(X - 14, Y + (A - B) / 2 + 5, 'a − b', { a: 'end', fs: 13 }) +
                txt(220, 272, 'a² − b² = (a + b)(a − b)', { fs: 17, c: C })
            }
          ], { acc: false });
        },
        caption: '同一塊面積換個排法：\\(a^2-b^2\\) 就是 \\((a+b)(a-b)\\)。',
        example: {
          q: '展開 \\((3x+7)(3x-7)\\)。',
          steps: ['兩括號只差符號，可用平方差。', '\\((3x)^2-7^2=9x^2-49\\)。'],
          ans: '\\(9x^2-49\\)'
        }
      },

      {
        sec: '1-1', secName: '公式活用',
        title: '公式裡的 a、b 可以是「整包」東西',
        points: [
          '公式中的 \\(a,b\\) <b>不一定是單一個文字</b>，可以是 \\(2x\\)、\\(3y\\)，甚至是數字 100。',
          '整包代入時<b>一定要加括號</b>：\\((2x)^2=4x^2\\)，不是 \\(2x^2\\)。',
          '把數字拆成 \\(100\\pm k\\)，乘法公式立刻變成<b>心算速算法</b>。',
          '看到 \\(103^2\\)、\\(97^2\\)、\\(103\\times97\\)，先想「能不能拆成 100 加減一個小的數」。'
        ],
        formula: { label: '整包代入', tex: '(2x+3y)^2=(2x)^2+2(2x)(3y)+(3y)^2' },
        visual: (h) => {
          const chip = (t, col) => `<span style="display:inline-block;padding:5px 13px;border-radius:10px;border:2px solid ${col};background:#fff;color:${col};font-weight:900;font-size:15px">${t}</span>`;
          h.innerHTML = `<div style="width:100%">
            <div style="text-align:center;margin-bottom:12px">
              ${chip('a', C)} <span style="font-size:17px;color:#657187">→</span> ${chip('2x', C)}
              <span style="display:inline-block;width:18px"></span>
              ${chip('b', GRN)} <span style="font-size:17px;color:#657187">→</span> ${chip('3y', GRN)}
            </div>
            ${SV.fbox([
            { label: '含係數、雙變數', tex: '(2x+3y)^2=4x^2+12xy+9y^2', color: C, fill: '#eef4ff', border: C, size: 16 },
            { label: '平方差也一樣整包代', tex: '(3a-5b)(3a+5b)=9a^2-25b^2', color: VIO, border: '#ded2f7', size: 16 },
            { label: '速算：拆成 100 ± k', tex: '103^2=(100+3)^2=10000+600+9=10609', color: GRN, border: '#cfe8dd', size: 15, note: '同理 103×97=(100+3)(100−3)=10000−9=9991' }
          ], { gap: 9 })}
          </div>`;
        },
        caption: '把 \\(a,b\\) 想成「兩個袋子」，袋子裡裝什麼都能套公式。',
        example: {
          q: '用乘法公式速算 \\(98\\times102\\)。',
          steps: ['寫成 \\((100-2)(100+2)\\)。', '\\(=100^2-2^2=10000-4\\)。'],
          ans: '\\(9996\\)'
        }
      },

      {
        sec: '1-1', secName: '易錯提醒',
        title: '易錯：(a＋b)² 比 a²＋b² 整整多了 2ab',
        points: [
          '✗ 錯的寫法：\\((a+b)^2=a^2+b^2\\)、\\((a-b)^2=a^2-b^2\\)——<b>中間項不見了</b>。',
          '✓ 對的寫法：\\((a+b)^2=a^2+2ab+b^2\\)；兩者的差距<b>正好是 \\(2ab\\)</b>。',
          '不放心就<b>代數字檢查</b>：\\(a=3,b=4\\) 時 \\((3+4)^2=49\\)，但 \\(3^2+4^2=25\\)。',
          '反過來用超好用：已知 \\(a+b\\) 與 \\(ab\\)，就能求 \\(a^2+b^2=(a+b)^2-2ab\\)。'
        ],
        formula: { label: '差距就是中間項', tex: '(a+b)^2-(a^2+b^2)=2ab' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="gapfig"></div>
            <div class="ictrl"><label>b 的值 <span class="ival" id="bv6">4</span>（a 固定為 3）</label>
            <input type="range" id="bs6" min="1" max="8" step="1" value="4"></div></div>`;
          const draw = () => {
            const b = +h.querySelector('#bs6').value;
            h.querySelector('#bv6').textContent = b;
            const a = 3, v1 = (a + b) * (a + b), v2 = a * a + b * b, gap = 2 * a * b, sc = 2.45, x0 = 100;
            let s = txt(220, 32, 'a = 3，拖滑桿改變 b', { fs: 13, c: '#657187', fw: 700 });
            s += `<rect x="${x0}" y="62" width="${(v2 * sc).toFixed(1)}" height="36" rx="5" fill="#9aa4b6" opacity="0.45"/>`;
            s += `<rect x="${(x0 + v2 * sc).toFixed(1)}" y="62" width="${(gap * sc).toFixed(1)}" height="36" rx="5" fill="${RED}" opacity="0.85"/>`;
            s += txt(x0 - 10, 85, '(3+b)²', { a: 'end', fs: 13, c: C });
            s += txt(x0 + v1 * sc + 8, 85, String(v1), { a: 'start', fs: 15, c: C });
            s += `<rect x="${x0}" y="132" width="${(v2 * sc).toFixed(1)}" height="36" rx="5" fill="#9aa4b6" opacity="0.45"/>`;
            s += txt(x0 - 10, 155, '3² + b²', { a: 'end', fs: 13, c: '#657187' });
            s += txt(x0 + v2 * sc + 8, 155, String(v2), { a: 'start', fs: 15, c: '#657187' });
            s += `<rect x="${(x0 + v2 * sc).toFixed(1)}" y="192" width="${(gap * sc).toFixed(1)}" height="20" rx="4" fill="${RED}" opacity="0.85"/>`;
            s += txt(220, 246, `差 = 2ab = 2×3×${b} = ${gap}`, { fs: 16, c: RED });
            s += txt(220, 274, `${v1} − ${v2} = ${gap}　（紅色那一段）`, { fs: 13, c: '#657187', fw: 700 });
            h.querySelector('#gapfig').innerHTML = svg('0 0 440 286', s);
          };
          h.querySelector('#bs6').oninput = draw; draw();
        },
        caption: '灰色是 \\(a^2+b^2\\)，紅色那一段就是被漏掉的 \\(2ab\\)。',
        example: {
          q: '已知 \\(a+b=7\\)、\\(ab=10\\)，求 \\(a^2+b^2\\)。',
          steps: ['\\((a+b)^2=a^2+2ab+b^2=49\\)。', '\\(a^2+b^2=49-2\\times10\\)。'],
          ans: '\\(a^2+b^2=29\\)'
        }
      },

      /* ---------- 1-2 多項式與其加減運算 ---------- */
      {
        sec: '1-2', secName: '多項式',
        title: '多項式的長相，以及各部位的名字',
        points: [
          '<span class="k">多項式</span>＝由「數 × 變數的<b>非負整數次方</b>」相加而成的式子。',
          '所以 \\(\\sqrt{x}\\)、\\(\\dfrac1x\\)、\\(2^x\\) <b>都不是</b>多項式（變數不能在根號、分母或指數上）。',
          '名詞要一次認齊：<b>項數、係數、常數項、一次項、二次項、最高次項</b>。',
          '次數由大到小寫是<b>降冪</b>，由小到大寫是<b>升冪</b>；解題習慣用降冪。'
        ],
        formula: { label: '看這個式子', tex: '4x^2-3x+5' },
        visual: (h) => {
          const p1 = 118, p2 = 218, p3 = 312;
          let s = '';
          s += SV.seg(72, 44, 356, 44, '#9aa4b6', 2) + SV.seg(72, 44, 72, 54, '#9aa4b6', 2) + SV.seg(356, 44, 356, 54, '#9aa4b6', 2);
          s += txt(214, 34, '項數 3（用 ＋、－ 隔開的每一團都是一項）', { fs: 12, c: '#657187', fw: 700 });
          s += txt(p1, 92, '4x²', { fs: 28, c: C });
          s += txt(p2, 92, '− 3x', { fs: 28, c: VIO });
          s += txt(p3, 92, '+ 5', { fs: 28, c: AMB });
          s += SV.seg(p1, 102, p1, 128, C, 1.6, '4 4');
          s += SV.seg(p2, 102, p2, 178, VIO, 1.6, '4 4');
          s += SV.seg(p3, 102, p3, 228, AMB, 1.6, '4 4');
          s += txt(p1, 144, '二次項＝最高次項，係數 4', { fs: 12.5, c: C });
          s += txt(p2, 194, '一次項，係數 −3', { fs: 12.5, c: VIO });
          s += txt(p3, 244, '常數項 5', { fs: 12.5, c: AMB });
          s += txt(214, 278, '次數 2 → 1 → 0，這樣寫叫「降冪排列」', { fs: 12.5, c: '#657187', fw: 700 });
          h.innerHTML = svg('0 0 440 292', s) +
            `<div style="margin-top:6px;font-size:12.5px;color:#657187;text-align:center">
              <b style="color:${RED}">不是多項式</b>：\\(\\sqrt{x}\\)、\\(\\dfrac{1}{x}\\)、\\(2^{x}\\)</div>`;
        },
        caption: '一個 \\(4x^2-3x+5\\) 就能把課綱要的名詞全部指出來。',
        example: {
          q: '\\(-x+2x^2-7\\) 的項數、最高次項與常數項各是什麼？',
          steps: ['先改成降冪：\\(2x^2-x-7\\)。', '項數 3、最高次項 \\(2x^2\\)、常數項 \\(-7\\)。'],
          ans: '3 項；最高次項 \\(2x^2\\)；常數項 \\(-7\\)'
        }
      },

      {
        sec: '1-2', secName: '多項式的值',
        title: '求多項式的值：代負數前先補上括號',
        points: [
          '把 \\(x\\) 的值<b>代進每一個 \\(x\\)</b>，再照四則運算順序算出來。',
          '代<b>負數一定要加括號</b>：\\(x=-2\\) 時要寫 \\(2(-2)^2-3(-2)+1\\)。',
          '不加括號就會變成 \\(2\\cdot-2^2\\)，平方與負號的順序全錯。',
          '拖滑桿換 \\(x\\)：注意 \\(-3x\\) 這一項在 \\(x<0\\) 時會<b>變成正的</b>。'
        ],
        formula: { label: '代入求值', tex: '\\text{把 }x\\text{ 的值代入}\\;2x^2-3x+1' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="valfig"></div>
            <div class="ictrl"><label>代入的 x <span class="ival" id="xv8">-2</span></label>
            <input type="range" id="xs8" min="-3" max="3" step="1" value="-2"></div></div>`;
          const draw = () => {
            const x = +h.querySelector('#xs8').value;
            h.querySelector('#xv8').textContent = x;
            const t1 = 2 * x * x, t2 = -3 * x, val = t1 + t2 + 1;
            const pc = x < 0 ? RED : '#172033';
            let s = txt(220, 36, '多項式　2x² − 3x + 1', { fs: 17 });
            s += `<text x="220" y="92" text-anchor="middle" font-size="21" font-weight="900" fill="#172033">2<tspan fill="${pc}">(${x})</tspan>² − 3<tspan fill="${pc}">(${x})</tspan> + 1</text>`;
            s += txt(220, 136, `= ${t1} ${t2 < 0 ? '−' : '+'} ${Math.abs(t2)} + 1 = ${val}`, { fs: 19, c: C });
            s += SV.seg(40, 160, 400, 160, '#e4e9f2', 1.6);
            for (let i = 0; i < 7; i++) {
              const xi = -3 + i, vi = 2 * xi * xi - 3 * xi + 1, cx = 42 + i * 54, on = xi === x;
              s += `<rect x="${cx}" y="180" width="46" height="54" rx="10" fill="${on ? C : '#fff'}" stroke="${on ? C : '#cdd6e2'}" stroke-width="2"/>`;
              s += txt(cx + 23, 203, `x=${xi}`, { fs: 11, c: on ? '#fff' : '#657187', fw: 700 });
              s += txt(cx + 23, 225, String(vi), { fs: 15, c: on ? '#fff' : '#172033' });
            }
            s += txt(220, 266, x < 0
              ? `✗ 少寫括號：2×${x}² 會先算 ${-x}² 再取負，結果完全不同`
              : '把滑桿拉到負數看看：括號一定要記得寫出來',
              { fs: 12, c: x < 0 ? RED : '#657187', fw: 700 });
            h.querySelector('#valfig').innerHTML = svg('0 0 440 280', s);
          };
          h.querySelector('#xs8').oninput = draw; draw();
        },
        caption: '下排是各個 \\(x\\) 對應的值；括號標紅的地方就是最容易算錯的位置。',
        example: {
          q: '求 \\(3x^2+x-4\\) 在 \\(x=-1\\) 時的值。',
          steps: ['代入加括號：\\(3(-1)^2+(-1)-4\\)。', '\\(=3-1-4\\)。'],
          ans: '\\(-2\\)'
        }
      },

      {
        sec: '1-2', secName: '多項式加減',
        title: '多項式加減：只有同類項才能合併',
        points: [
          '<span class="k">同類項</span>＝<b>次數完全相同</b>的項；合併時<b>係數相加減、次數不變</b>。',
          '\\(3x^2+x^2=4x^2\\)（✓）；\\(3x^2+2x\\) <b>不能</b>合併（✗）。',
          '橫式：先去括號，再把同類項圈在一起合併。',
          '直式：同次項<b>上下對齊</b>，<b>缺哪一項就補 0</b>，才不會對錯欄。'
        ],
        formula: { label: '合併同類項', tex: '(3x^2+2x-5)+(x^2+1)=4x^2+2x-4' },
        visual: (h) => {
          const td = 'border:1px solid #cdd6e2;padding:8px 4px;text-align:center;font-size:16px;font-weight:900';
          const th = 'border:1px solid #cdd6e2;padding:7px 4px;text-align:center;font-size:12px;font-weight:900;color:#657187;background:#eef4ff';
          const rl = 'border:1px solid #cdd6e2;padding:8px 4px;text-align:center;font-size:12.5px;font-weight:800;color:#657187';
          h.innerHTML = `<div style="width:96%;margin:0 auto">
            <table style="width:100%;border-collapse:collapse">
              <tr><th style="${th}"></th><th style="${th}">二次項</th><th style="${th}">一次項</th><th style="${th}">常數項</th></tr>
              <tr><td style="${rl}">甲式</td><td style="${td}">3x²</td><td style="${td}">＋2x</td><td style="${td}">－5</td></tr>
              <tr><td style="${rl}">乙式</td><td style="${td}">＋x²</td><td style="${td};color:${RED}">＋0x</td><td style="${td}">＋1</td></tr>
              <tr style="background:#eef4ff"><td style="${rl};color:${C}">和</td><td style="${td};color:${C}">4x²</td><td style="${td};color:${C}">＋2x</td><td style="${td};color:${C}">－4</td></tr>
            </table>
            <div style="margin-top:12px;font-size:12.5px;color:#657187;text-align:center;line-height:1.7">
              乙式 \\(x^2+1\\) <b>缺一次項</b>，直式一定要<b style="color:${RED}">補上 0x</b>；<br>
              每一欄各自相加，欄與欄之間<b>不能混在一起</b>。</div>
          </div>`;
        },
        caption: '把同次數的項排成一欄，加減就只是「每一欄各自算」。',
        example: {
          q: '化簡 \\((4x^2-x+3)+(2x-6)\\)。',
          steps: ['二次項只有 \\(4x^2\\)；一次項 \\(-x+2x=x\\)。', '常數項 \\(3-6=-3\\)。'],
          ans: '\\(4x^2+x-3\\)'
        }
      },

      {
        sec: '1-2', secName: '易錯提醒',
        title: '易錯：減號後面「整串」都要變號',
        points: [
          '\\(-(2x^2-4x+1)\\) 代表把括號內<b>每一項</b>都乘 \\(-1\\)。',
          '✗ 最常見錯誤：只把<b>第一項</b>變號，後面照抄——一題直接全錯。',
          '✓ 正確做法：先把減號分配進去、改完所有符號，<b>再</b>合併同類項。',
          '寫題時的自保招式：<b>先把去括號後的式子完整抄一行</b>，再動手合併。'
        ],
        formula: { label: '去括號', tex: '-(a-b+c)=-a+b-c' },
        visual: (h) => {
          const bs = (bd, bg) => `border:1.6px solid ${bd};background:${bg};border-radius:13px;padding:10px 14px;margin-bottom:11px`;
          h.innerHTML = `<div style="width:96%;margin:0 auto;font-size:14.5px;line-height:1.8;color:#172033">
            <div style="text-align:center;font-size:15px;font-weight:900;margin-bottom:11px">化簡 \\((5x^2+3x-2)-(2x^2-4x+1)\\)</div>
            <div style="${bs('#f0c9d3', '#fdeef2')}">
              <div style="font-size:12px;font-weight:900;color:${RED};margin-bottom:3px">✗ 只把第一項變號</div>
              \\(=5x^2+3x-2-2x^2\\)<span style="color:${RED};font-weight:900">\\(\\,-4x+1\\)</span><br>
              \\(=3x^2-x-1\\)　<span style="color:${RED};font-weight:900">（錯）</span>
            </div>
            <div style="${bs('#cfe8dd', '#eef7f2')}">
              <div style="font-size:12px;font-weight:900;color:${GRN};margin-bottom:3px">✓ 括號內每一項都變號</div>
              \\(=5x^2+3x-2-2x^2\\)<span style="color:${GRN};font-weight:900">\\(\\,+4x-1\\)</span><br>
              \\(=3x^2+7x-3\\)　<span style="color:${GRN};font-weight:900">（對）</span>
            </div>
          </div>`;
        },
        caption: '兩個式子只差在紅／綠那一段——減法的變號漏掉一項就前功盡棄。',
        example: {
          q: '化簡 \\((3x^2-x)-(x^2+5x-2)\\)。',
          steps: ['去括號：\\(3x^2-x-x^2-5x+2\\)。', '合併：\\(2x^2-6x+2\\)。'],
          ans: '\\(2x^2-6x+2\\)'
        }
      },

      /* ---------- 1-3 多項式的乘除運算 ---------- */
      {
        sec: '1-3', secName: '單項式乘除',
        title: '單項式乘除：係數歸係數，文字歸文字',
        points: [
          '把式子拆成<b>係數部分</b>與<b>文字部分</b>，兩邊分開算完再合起來。',
          '<b>乘法</b>：係數相乘、同底數的<b>指數相加</b>（\\(x^2\\cdot x=x^3\\)）。',
          '<b>除法</b>：係數相除、同底數的<b>指數相減</b>（\\(x^3\\div x=x^2\\)）。',
          '這裡用的就是七上學過的<span class="k">指數律</span>，只是換到代數式上使用。'
        ],
        formula: { label: '單項式乘除', tex: '5x^2\\times3x=15x^3,\\qquad 12x^3\\div4x=3x^2' },
        visual: (h) => {
          let s = '';
          s += txt(115, 24, '單項式 × 單項式', { fs: 13, c: GRN });
          s += boxr(30, 36, 170, 42, '5x² × 3x', '#172033', '#fff', 19);
          s += downArrow(115, 80, 104);
          s += boxr(25, 106, 180, 46, '(5×3)·(x²·x)', GRN, '#eef7f2', 16);
          s += downArrow(115, 154, 178);
          s += boxr(45, 180, 140, 46, '15x³', GRN, '#eef7f2', 21);
          s += txt(115, 250, '係數相乘、指數相加', { fs: 13, c: GRN });
          s += SV.seg(220, 20, 220, 262, '#dce3ee', 2, '5 5');
          s += txt(325, 24, '單項式 ÷ 單項式', { fs: 13, c: VIO });
          s += boxr(240, 36, 170, 42, '12x³ ÷ 4x', '#172033', '#fff', 19);
          s += downArrow(325, 80, 104);
          s += boxr(235, 106, 180, 46, '(12÷4)·(x³÷x)', VIO, '#f4f0ff', 15);
          s += downArrow(325, 154, 178);
          s += boxr(255, 180, 140, 46, '3x²', VIO, '#f4f0ff', 21);
          s += txt(325, 250, '係數相除、指數相減', { fs: 13, c: VIO });
          s += txt(220, 286, '拆成兩包分開處理，就不會把係數和指數搞混', { fs: 12.5, c: '#657187', fw: 700 });
          h.innerHTML = svg('0 0 440 300', s);
        },
        caption: '左邊乘、右邊除；兩邊都是「係數一包、文字一包」分開算。',
        example: {
          q: '計算 \\(-6x^3\\div 2x^2\\)。',
          steps: ['係數：\\(-6\\div2=-3\\)。', '文字：\\(x^3\\div x^2=x\\)。'],
          ans: '\\(-3x\\)'
        }
      },

      {
        sec: '1-3', secName: '多項式乘法',
        title: '多項式乘法：逐項乘完，再合併同類項',
        points: [
          '每一項<b>都要乘到對方的每一項</b>，可以畫成 2×2 的表格檢查有沒有漏。',
          '乘完先<b>不要急著寫答案</b>，把四項排好再合併同類項。',
          '符號跟著項一起走：\\(x\\times(-5)=-5x\\)，負號不能掉。',
          '如果剛好長得像乘法公式（如 \\((2x-1)^2\\)），<b>直接套公式更快</b>。'
        ],
        formula: { label: '逐項相乘', tex: '(x+3)(2x-5)=2x^2+x-15' },
        visual: (h) => {
          const X0 = 142, X1 = 262, X2 = 382, Y0 = 78, Y1 = 162, Y2 = 246;
          const grid = () =>
            `<rect x="${X0}" y="${Y0}" width="${X2 - X0}" height="${Y2 - Y0}" fill="#f6f8fc" stroke="#9aa4b6" stroke-width="2"/>` +
            SV.seg(X1, Y0, X1, Y2, '#9aa4b6', 2) + SV.seg(X0, Y1, X2, Y1, '#9aa4b6', 2) +
            txt(220, 32, '(x + 3)(2x − 5)', { fs: 19, c: C }) +
            txt((X0 + X1) / 2, Y0 - 12, '2x', { fs: 17 }) + txt((X1 + X2) / 2, Y0 - 12, '− 5', { fs: 17 }) +
            txt(X0 - 14, (Y0 + Y1) / 2 + 6, 'x', { a: 'end', fs: 17 }) +
            txt(X0 - 14, (Y1 + Y2) / 2 + 6, '+ 3', { a: 'end', fs: 17 });
          SV.stepper(h, '0 0 440 306', [
            { t: '把左邊的 <b>x、3</b> 與上面的 <b>2x、−5</b> 排成表格。', d: () => grid() },
            {
              t: '第一列：<b>x×2x</b> 與 <b>x×(−5)</b>。', d: k =>
                cell(X0, Y0, X1 - X0, Y1 - Y0, C, '#fff', '2x²', k) +
                cell(X1, Y0, X2 - X1, Y1 - Y0, RED, '#fff', '−5x', k)
            },
            {
              t: '第二列：<b>3×2x</b> 與 <b>3×(−5)</b>。', d: k =>
                cell(X0, Y1, X1 - X0, Y2 - Y1, AMB, '#fff', '6x', k) +
                cell(X1, Y1, X2 - X1, Y2 - Y1, GRN, '#fff', '−15', k)
            },
            {
              t: '合併同類項：<b>−5x ＋ 6x ＝ x</b>。', d: () =>
                txt(220, 274, '−5x + 6x = x', { fs: 14, c: RED }) +
                txt(220, 298, '= 2x² + x − 15', { fs: 18, c: C })
            }
          ]);
        },
        caption: '四個格子＝四項；只有 \\(-5x\\) 與 \\(6x\\) 是同類項，可以合併。',
        example: {
          q: '展開 \\((2x-1)(x+4)\\)。',
          steps: ['四項：\\(2x^2+8x-x-4\\)。', '合併中間兩項 \\(8x-x=7x\\)。'],
          ans: '\\(2x^2+7x-4\\)'
        }
      },

      {
        sec: '1-3', secName: '多項式除法',
        title: '多項式除法：缺項先補 0，再做長除法',
        points: [
          '被除式要先<b>照降冪排好</b>，<b>缺掉的次方一律補 0</b>，欄位才對得齊。',
          '每一步都問：<b>「首項 ÷ 首項」等於多少</b>？答案寫到商的位置。',
          '把商的那一項乘回除式、對齊<b>相減</b>（記得整串變號），得到新的被除式。',
          '除到<b>餘式的次數比除式低</b>就停手，不能再除下去。'
        ],
        formula: { label: '例', tex: '(x^2-9)\\div(x+3)=x-3\\;\\cdots\\;\\text{餘 }0' },
        visual: (h) => {
          const c1 = 190, c2 = 268, c3 = 344;
          const frame = () =>
            txt(220, 28, 'x² − 9 缺一次項 → 先補成 x² + 0x − 9', { fs: 12.5, c: RED, fw: 700 }) +
            SV.seg(132, 88, 386, 88, '#334', 2) + SV.seg(132, 88, 132, 126, '#334', 2) +
            txt(96, 116, 'x + 3', { fs: 17 }) +
            txt(c1, 116, 'x²', { fs: 17 }) + txt(c2, 116, '+ 0x', { fs: 17, c: RED }) + txt(c3, 116, '− 9', { fs: 17 });
          SV.stepper(h, '0 0 440 300', [
            { t: '排好長除法：缺一次項要補 <b>0x</b>。', d: () => frame() },
            {
              t: '<b>x² ÷ x ＝ x</b> 寫在商；<b>x(x＋3)＝x²＋3x</b>，對齊相減。', d: () =>
                txt(c2, 80, 'x', { fs: 17, c: C }) +
                txt(c1, 150, 'x²', { fs: 16, c: '#657187' }) + txt(c2, 150, '+ 3x', { fs: 16, c: '#657187' }) +
                txt(150, 150, '−', { fs: 16, c: '#657187' }) +
                SV.seg(150, 160, 306, 160, '#9aa4b6', 1.6) +
                txt(c2, 186, '− 3x', { fs: 17 }) + txt(c3, 186, '− 9', { fs: 17 })
            },
            {
              t: '<b>−3x ÷ x ＝ −3</b>；<b>−3(x＋3)＝−3x−9</b>，再相減。', d: () =>
                txt(c3, 80, '− 3', { fs: 17, c: C }) +
                txt(c2, 220, '− 3x', { fs: 16, c: '#657187' }) + txt(c3, 220, '− 9', { fs: 16, c: '#657187' }) +
                txt(228, 220, '−', { fs: 16, c: '#657187' }) +
                SV.seg(228, 230, 380, 230, '#9aa4b6', 1.6) +
                txt(c3, 256, '0', { fs: 18, c: GRN })
            },
            {
              t: '餘式為 0 → 除得盡。', d: () =>
                txt(220, 290, 'x² − 9 = (x + 3)(x − 3) + 0', { fs: 15, c: C })
            }
          ]);
        },
        caption: '商是 \\(x-3\\)、餘式 0；補 \\(0x\\) 這一步不做，整題就會對錯欄。',
        example: {
          q: '\\((2x^2+5x-3)\\div(x+3)\\) 的商式與餘式各是什麼？',
          steps: ['\\(2x^2\\div x=2x\\)；\\(2x(x+3)=2x^2+6x\\)，相減得 \\(-x-3\\)。', '\\(-x\\div x=-1\\)；\\(-1(x+3)=-x-3\\)，相減得 0。'],
          ans: '商 \\(2x-1\\)，餘 \\(0\\)'
        }
      },

      {
        sec: '1-3', secName: '除法驗算',
        title: '驗算口訣：被除式＝除式×商式＋餘式',
        points: [
          '算完除法一定要回頭乘一次：<b>除式 × 商式 ＋ 餘式</b>，要能還原被除式。',
          '這條式子也能<b>反過來用</b>：知道其中三個，就能求出第四個。',
          '餘式的次數<b>必須比除式低</b>；除式是一次式時，餘式只會是常數或 0。',
          '生活題常見：已知<b>面積與一邊</b>求另一邊，就是「面積 ÷ 一邊」。'
        ],
        formula: { label: '驗算關係式', tex: '\\text{被除式}=\\text{除式}\\times\\text{商式}+\\text{餘式}' },
        visual: (h) => {
          const bx = (x, y, w, t, col, bg) =>
            `<rect x="${x}" y="${y}" width="${w}" height="44" rx="11" fill="${bg}" stroke="${col}" stroke-width="2"/>` +
            txt(x + w / 2, y + 28, t, { fs: 14, c: col });
          let s = '';
          s += bx(16, 22, 96, '被除式', C, '#eef4ff');
          s += txt(124, 52, '=', { fs: 20, c: '#657187' });
          s += bx(136, 22, 82, '除式', GRN, '#eef7f2');
          s += txt(228, 52, '×', { fs: 18, c: '#657187' });
          s += bx(238, 22, 82, '商式', AMB, '#fdf3e3');
          s += txt(330, 52, '+', { fs: 20, c: '#657187' });
          s += bx(342, 22, 82, '餘式', RED, '#fdeef2');
          s += txt(220, 96, 'x² − 9 = (x + 3)(x − 3) + 0', { fs: 15, c: '#657187' });
          s += `<rect x="112" y="124" width="216" height="104" rx="7" fill="rgba(37,99,235,0.08)" stroke="${C}" stroke-width="2.4"/>`;
          s += txt(220, 182, '面積 = x² + 5x + 6', { fs: 16, c: C });
          s += txt(220, 250, 'x + 2', { fs: 15 });
          s += txt(352, 182, '?', { fs: 22, c: RED });
          s += txt(220, 282, '另一邊 = (x² + 5x + 6) ÷ (x + 2) = x + 3', { fs: 13, c: RED });
          h.innerHTML = svg('0 0 440 294', s);
        },
        caption: '長方形面積 ÷ 一邊＝另一邊；乘回去對得上，答案才算驗證過。',
        example: {
          q: '長方形面積為 \\(x^2+7x+12\\)，一邊長 \\(x+3\\)，求另一邊長。',
          steps: ['另一邊 \\(=(x^2+7x+12)\\div(x+3)\\)。', '長除法得商 \\(x+4\\)、餘 0。', '驗算：\\((x+3)(x+4)=x^2+7x+12\\) ✓'],
          ans: '另一邊長 \\(x+4\\)'
        }
      },

      {
        sec: '1-3', secName: '易錯提醒',
        title: '易錯：長除法相減時，整串都要變號',
        points: [
          '每一步都是<b>減去</b>「商的那一項 × 除式」，括號內<b>每一項</b>都要變號。',
          '✗ 最常見錯誤：只減首項、後面照抄，餘式立刻算錯。',
          '✓ 保險做法：先把變號後的式子<b>整串寫一行</b>，再直接相加。',
          '另一個常錯點：<b>缺項沒補 0</b>，欄位一錯位後面全盤皆錯。'
        ],
        formula: { label: '減去＝加上相反數', tex: '-(x^2-2x)=-x^2+2x' },
        visual: (h) => {
          const card = (x, ok) => {
            const col = ok ? GRN : RED, bg = ok ? '#eef7f2' : '#fdeef2';
            let t = `<rect x="${x}" y="46" width="200" height="196" rx="14" fill="${bg}" stroke="${col}" stroke-width="2"/>`;
            t += txt(x + 100, 72, ok ? '✓ 兩項都變號' : '✗ 只有首項變號', { fs: 14, c: col });
            t += txt(x + 100, 108, 'x² + 2x', { fs: 17 });
            t += txt(x + 100, 138, ok ? '− x² + 2x' : '− x² − 2x', { fs: 17, c: col });
            t += SV.seg(x + 32, 152, x + 168, 152, '#9aa4b6', 1.8);
            t += txt(x + 100, 184, ok ? '= 4x' : '= 0', { fs: 22, c: col });
            t += txt(x + 100, 220, ok ? '再拉下 −8 → 4x − 8' : '往下算整題全錯', { fs: 12, c: ok ? '#3f6b58' : '#8a2440', fw: 700 });
            return t;
          };
          let s = txt(220, 28, '長除法這一步：把 x² + 2x 減掉 (x² − 2x)', { fs: 13.5, c: '#657187', fw: 700 });
          s += card(14, false) + card(226, true);
          s += txt(220, 274, '「減一個多項式」＝「加上它的相反數」，每一項都要變號', { fs: 12.5, c: '#172033', fw: 700 });
          h.innerHTML = svg('0 0 440 292', s);
        },
        caption: '要減的是 \\(x^2-2x\\)，變號後是 \\(-x^2+2x\\)；漏掉第二項的變號，整題就毀了。',
        example: {
          q: '\\((x^2+2x-8)\\div(x-2)\\) 的商式與餘式各是什麼？',
          steps: [
            '\\(x^2\\div x=x\\)；\\(x(x-2)=x^2-2x\\)，變號相加得 \\(4x\\)，拉下 \\(-8\\)。',
            '\\(4x\\div x=4\\)；\\(4(x-2)=4x-8\\)，相減得 \\(0\\)。'
          ],
          ans: '商 \\(x+4\\)，餘 \\(0\\)'
        }
      }
    ]
  });
})();
