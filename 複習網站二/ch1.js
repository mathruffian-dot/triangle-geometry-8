/* ============ 第 1 章　二元一次聯立方程式 ============
   依康軒版第二冊課程計畫：1-1 二元一次方程式、1-2 解二元一次聯立方程式、1-3 應用問題
   課綱邊界：只處理「恰有一組解」；不畫直線圖形（屬第 2 章）；不出現函數。
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#2563eb';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  // 標準 SVG 包裝
  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }

  // SVG 文字
  const TX = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" ${o.anchor ? `text-anchor="${o.anchor}"` : ''} font-size="${o.fs || 15}" font-weight="${o.fw || 800}" fill="${o.c || '#172033'}"${o.op != null ? ` opacity="${o.op}"` : ''}>${s}</text>`;

  // SVG 圓角方塊
  const BOX = (x, y, w, hgt, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${hgt}" rx="${o.r || 12}" fill="${o.fill || '#fff'}" stroke="${o.stroke || '#dce3ee'}" stroke-width="${o.sw || 1.8}"${o.op != null ? ` opacity="${o.op}"` : ''}/>`;

  // 負數加括號，避免出現「2×-3」
  const par = (n) => (n < 0 ? `(${n})` : `${n}`);

  // ✗ 錯 / ✓ 對　對照列（HTML）
  function xoRows(rows) {
    return `<div style="width:97%;margin:0 auto;display:flex;flex-direction:column;gap:9px">` +
      rows.map(r => `<div style="display:flex;gap:8px;align-items:stretch">
        <div style="flex:1;background:#fdeef2;border:1.5px solid #f3c4d0;border-radius:12px;padding:8px 11px">
          <div style="font-size:11.5px;font-weight:900;color:${RED};margin-bottom:3px">✗ ${r.badLabel || '常見錯誤'}</div>
          <div style="font-size:14px;color:#172033;line-height:1.6">${r.bad}</div></div>
        <div style="flex:1;background:#eef7f2;border:1.5px solid #bfe0d1;border-radius:12px;padding:8px 11px">
          <div style="font-size:11.5px;font-weight:900;color:${GRN};margin-bottom:3px">✓ ${r.goodLabel || '正確寫法'}</div>
          <div style="font-size:14px;color:#172033;line-height:1.6">${r.good}</div></div>
      </div>`).join('') + `</div>`;
  }

  window.DECK.push({
    ch: 1,
    title: '二元一次聯立方程式',
    color: C,
    sections: ['1-1 二元一次方程式', '1-2 解二元一次聯立方程式', '1-3 應用問題'],
    slides: [

      /* ---------- 1-1 二元一次方程式 ---------- */
      {
        sec: '1-1', secName: '二元一次方程式',
        title: '二元一次式：兩個未知數，次數都是 1',
        points: [
          '<span class="k">二元一次式</span>要同時符合兩件事：出現<b>兩個</b>未知數，而且<b>含未知數的每一項</b>次數都是 <b>1</b>。',
          '看到 \\(xy\\)、\\(x^2\\)、\\(\\dfrac{1}{x}\\) 就直接出局——這三種最常被放過。',
          '\\(xy\\) 為什麼不行？\\(x\\) 和 \\(y\\) 乘在一起，那一項的次數是 \\(1+1=2\\)。',
          '分母是<b>數字</b>沒關係（\\(\\dfrac{x}{3}\\) 就是 \\(\\dfrac13x\\)）；分母有<b>未知數</b>才出局。'
        ],
        formula: { label: '判別條件', tex: '\\text{兩個未知數，且含未知數的每一項次數都是 }1' },
        visual: (h) => {
          h.innerHTML = `<div style="width:96%;margin:0 auto;display:flex;flex-direction:column;gap:11px">
            <div style="background:#eef7f2;border:1.6px solid #bfe0d1;border-radius:14px;padding:11px 15px">
              <div style="font-size:12px;font-weight:900;color:${GRN};margin-bottom:6px">✓ 是二元一次式</div>
              <div style="font-size:18px;color:#172033;line-height:1.9">\\(2x+3y\\)　\\(x-y+5\\)　\\(\\dfrac{x}{3}+\\dfrac{y}{4}\\)</div>
              <div style="font-size:12px;color:#657187;margin-top:5px">兩個字母、含字母的每項都是一次，分母是數字沒關係</div>
            </div>
            <div style="background:#fdeef2;border:1.6px solid #f3c4d0;border-radius:14px;padding:11px 15px">
              <div style="font-size:12px;font-weight:900;color:${RED};margin-bottom:6px">✗ 不是二元一次式</div>
              <div style="font-size:18px;color:#172033;line-height:1.9">\\(xy+1\\)　\\(x^2-y\\)　\\(\\dfrac{1}{x}+y\\)</div>
              <div style="font-size:12px;color:#657187;margin-top:5px">\\(xy\\) 次數為 2　·　\\(x^2\\) 是二次　·　\\(x\\) 跑到分母</div>
            </div></div>`;
        },
        caption: '口訣：<b>兩個字母、每項只到一次、字母不相乘也不在分母</b>。',
        example: {
          q: '下列哪些是二元一次式？\\(3x-2y\\)、\\(xy-1\\)、\\(\\dfrac{x}{3}+\\dfrac{y}{4}\\)、\\(x^2+y\\)',
          steps: ['\\(xy\\) 那一項次數為 2、\\(x^2\\) 是二次，兩個都不合。', '分母是數字不影響次數，\\(\\dfrac{x}{3}+\\dfrac{y}{4}\\) 合格。'],
          ans: '\\(3x-2y\\) 與 \\(\\dfrac{x}{3}+\\dfrac{y}{4}\\)'
        }
      },

      {
        sec: '1-1', secName: '二元一次方程式',
        title: '易錯：x 和 y 不能併，減號括號每項都要變號',
        points: [
          '✗ \\(3x+2y=5xy\\)　✓ \\(3x\\) 與 \\(2y\\) <b>不是同類項</b>，已經最簡、不能再合併。',
          '✗ \\((2x+3y)-(x-4y)=x-y\\)（只變第一項）　✓ 括號內<b>每一項</b>都變號，\\(=x+7y\\)。',
          '✗ 代 \\(y=-2\\) 寫成 \\(-3y=-3\\times2\\)　✓ 代負數<b>一定加括號</b>：\\(-3\\times(-2)=6\\)。'
        ],
        formula: { label: '減號括號', tex: '(2x+3y)-(x-4y)=2x+3y-x+4y=x+7y' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%">
            <div style="text-align:center;font-size:13px;font-weight:900;color:${C};margin-bottom:9px">同類項才能合併：x 歸 x、y 歸 y、常數歸常數</div>
            ${xoRows([
            { bad: '\\(3x+2y=5xy\\)', good: '\\(3x\\) 與 \\(2y\\) 不是同類項，<b>不能合併</b>' },
            { bad: '\\((2x+3y)-(x-4y)=x-y\\)', good: '\\((2x+3y)-(x-4y)=x+7y\\)' },
            { bad: '\\(x=1,y=-2\\) 代 \\(2x-3y\\)：\\(2-3\\times2=-4\\)', good: '\\(2\\times1-3\\times(-2)=2+6=8\\)' }
          ])}</div>`;
        },
        caption: '減號後面那個括號，是全班共同的失分點——<b>每一項</b>都要變號。',
        example: {
          q: '化簡 \\((5x-2y)-(3x-7y)\\)。',
          steps: ['去括號變號：\\(5x-2y-3x+7y\\)。', 'x 併 x、y 併 y：\\((5-3)x+(-2+7)y\\)。'],
          ans: '\\(2x+5y\\)'
        }
      },

      {
        sec: '1-1', secName: '二元一次方程式',
        title: '解不是一個數，是一組數對 (x, y)',
        points: [
          '整理成<span class="k">標準式</span> \\(ax+by=c\\)（\\(a,b\\) 不同時為 0）最好處理。',
          '它的解<b>不是一個數</b>，而是<b>一組</b> \\((x,y)\\)——兩個數要配成一對才算。',
          '檢驗方法：\\(x,y\\) <b>同時</b>代進去，算出的左式等於右式才是解。',
          '順序不能對調：\\((3,2)\\) 和 \\((2,3)\\) 是完全不同的兩組數對。'
        ],
        formula: { label: '標準式', tex: 'ax+by=c\\quad(a,b\\ \\text{不同時為 }0)' },
        visual: (h) => {
          const card = (y, pair, calc, ok) => {
            const col = ok ? GRN : RED, fill = ok ? '#eef7f2' : '#fdeef2', bd = ok ? '#bfe0d1' : '#f3c4d0';
            return BOX(28, y, 384, 88, { fill: fill, stroke: bd, sw: 1.8 }) +
              TX(52, y + 34, `代入 (x, y) = ${pair}`, { fs: 15, c: '#172033' }) +
              TX(52, y + 66, calc, { fs: 16, c: col }) +
              TX(392, y + 52, ok ? '✓' : '✗', { fs: 30, c: col, anchor: 'end' });
          };
          h.innerHTML = svg('0 0 440 290', `
            ${TX(220, 26, '檢驗：誰是 2x + 3y = 12 的解？', { fs: 16, c: C, anchor: 'middle' })}
            ${card(46, '(3, 2)', '2×3 + 3×2 = 6 + 6 = 12', true)}
            ${card(152, '(2, 3)', '2×2 + 3×3 = 4 + 9 = 13', false)}
            ${TX(220, 272, '左式算出來要「剛好等於」右邊的 12', { fs: 13, c: '#657187', anchor: 'middle' })}`);
        },
        caption: '\\((3,2)\\) 成立、\\((2,3)\\) 不成立——數對的順序絕不能對調。',
        example: {
          q: '\\((x,y)=(4,1)\\) 是 \\(3x-2y=10\\) 的解嗎？',
          steps: ['左式 \\(=3\\times4-2\\times1=12-2=10\\)。', '左式＝右式 10，等式成立。'],
          ans: '是解'
        }
      },

      {
        sec: '1-1', secName: '二元一次方程式',
        title: '一個二元一次方程式，有無限多組解',
        points: [
          '只有<b>一個</b>式子卻有<b>兩個</b>未知數 → \\(x\\) 隨便給一個值，都能解出對應的 \\(y\\)。',
          '所以解有<b>無限多組</b>；課本用<span class="k">列表法</span>列幾組出來感受一下。',
          '拖滑桿改變 \\(x\\)，看 \\(y\\) 怎麼跟著變——表格裡每一格都是一組解。'
        ],
        formula: { label: '把 y 解出來', tex: '2x+3y=12\\;\\Longrightarrow\\;y=\\dfrac{12-2x}{3}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="tbl"></div>
            <div class="ictrl"><label>取 x = <span class="ival" id="xv">3</span></label>
            <input type="range" id="xs" min="-3" max="9" step="3" value="3"></div></div>`;
          const xs = [-3, 0, 3, 6, 9];
          const yof = (x) => (12 - 2 * x) / 3;
          const draw = () => {
            const x = +h.querySelector('#xs').value;
            h.querySelector('#xv').textContent = x;
            const x0 = 46, cw = 70, hy = 44, ry = 92, ch = 44;
            let s = TX(220, 24, '2x + 3y = 12 的部分解', { fs: 15, c: C, anchor: 'middle' });
            s += TX(20, hy + 29, 'x', { fs: 16, c: '#657187' });
            s += TX(20, ry + 29, 'y', { fs: 16, c: '#657187' });
            xs.forEach((v, i) => {
              const cx = x0 + i * cw, on = v === x;
              s += BOX(cx, hy, cw - 5, ch, { r: 9, fill: on ? '#dbeafe' : '#fff', stroke: on ? C : '#dce3ee', sw: on ? 2.4 : 1.4 });
              s += BOX(cx, ry, cw - 5, ch, { r: 9, fill: on ? '#dbeafe' : '#fff', stroke: on ? C : '#dce3ee', sw: on ? 2.4 : 1.4 });
              s += TX(cx + (cw - 5) / 2, hy + 29, `${v}`, { fs: 16, c: on ? C : '#172033', anchor: 'middle' });
              s += TX(cx + (cw - 5) / 2, ry + 29, `${yof(v)}`, { fs: 16, c: on ? C : '#172033', anchor: 'middle' });
            });
            s += TX(220, 168, `代入 x = ${x}：2×${par(x)} + 3y = 12`, { fs: 14, anchor: 'middle' });
            s += TX(220, 196, `⇒ 3y = ${12 - 2 * x} ⇒ y = ${yof(x)}，得一組解 (${x}, ${yof(x)})`, { fs: 14, c: GRN, anchor: 'middle' });
            h.querySelector('#tbl').innerHTML = svg('0 0 440 212', s);
          };
          h.querySelector('#xs').oninput = draw; draw();
        },
        caption: '\\(x\\) 每換一個值就得到一組新的解——所以解有無限多組。',
        example: {
          q: '一枝筆 15 元、一本本子 25 元。買 \\(x\\) 枝筆與 \\(y\\) 本本子剛好花 100 元，列式並找一組解。',
          steps: ['依題意列式：\\(15x+25y=100\\)。', '取 \\(x=5\\)：\\(75+25y=100\\Rightarrow y=1\\)。'],
          ans: '\\(15x+25y=100\\)，例如 \\((5,1)\\)'
        }
      },

      /* ---------- 1-2 解二元一次聯立方程式 ---------- */
      {
        sec: '1-2', secName: '解二元一次聯立方程式',
        title: '聯立的解，要「兩個式子同時成立」',
        points: [
          '兩個二元一次方程式用<b>大括號</b>綁在一起、要求<b>同時成立</b>，就是<span class="k">聯立方程式</span>。',
          '各自都有無限多組解，但<b>同時滿足兩式</b>的那一組，本冊只會有<b>唯一一組</b>。',
          '拖滑桿掃過 \\(x\\)：看兩式各自算出的 \\(y\\)，什麼時候<b>剛好一樣</b>。'
        ],
        formula: { label: '聯立寫法', tex: '\\begin{cases}x+y=7\\\\ x-y=1\\end{cases}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="scan"></div>
            <div class="ictrl"><label>掃描 x = <span class="ival" id="sv">4</span></label>
            <input type="range" id="ss" min="1" max="6" step="1" value="4"></div></div>`;
          const xs = [1, 2, 3, 4, 5, 6];
          const draw = () => {
            const x = +h.querySelector('#ss').value;
            h.querySelector('#sv').textContent = x;
            const x0 = 86, cw = 52, r0 = 42, r1 = 78, r2 = 114, ch = 32;
            let s = TX(22, 22, '① x + y = 7', { fs: 13.5, c: BLU });
            s += TX(200, 22, '② x − y = 1', { fs: 13.5, c: VIO });
            s += TX(22, r0 + 22, 'x', { fs: 15, c: '#657187' });
            s += TX(22, r1 + 22, '① y', { fs: 15, c: BLU });
            s += TX(22, r2 + 22, '② y', { fs: 15, c: VIO });
            xs.forEach((v, i) => {
              const cx = x0 + i * cw, on = v === x, hit = (7 - v) === (v - 1);
              const fill = on ? (hit ? '#dcfce7' : '#dbeafe') : '#fff';
              const stk = on ? (hit ? GRN : C) : '#dce3ee';
              [r0, r1, r2].forEach(ry => { s += BOX(cx, ry, cw - 5, ch, { r: 8, fill: fill, stroke: stk, sw: on ? 2.2 : 1.3 }); });
              s += TX(cx + (cw - 5) / 2, r0 + 22, `${v}`, { fs: 15, anchor: 'middle', c: on ? C : '#172033' });
              s += TX(cx + (cw - 5) / 2, r1 + 22, `${7 - v}`, { fs: 15, anchor: 'middle', c: BLU });
              s += TX(cx + (cw - 5) / 2, r2 + 22, `${v - 1}`, { fs: 15, anchor: 'middle', c: VIO });
              if (hit && on) s += TX(cx + (cw - 5) / 2, r2 + 48, '★', { fs: 16, anchor: 'middle', c: GRN });
            });
            const y1 = 7 - x, y2 = x - 1, ok = y1 === y2;
            s += BOX(24, 178, 392, 40, { fill: ok ? '#eef7f2' : '#fff7ed', stroke: ok ? '#bfe0d1' : '#f2d5ab' });
            s += TX(220, 204, ok
              ? `x = ${x} 時兩式都得 y = ${y1} ⇒ 解為 (${x}, ${y1})`
              : `x = ${x}：① 得 y = ${y1}、② 得 y = ${y2}，不一樣`,
              { fs: 14.5, anchor: 'middle', c: ok ? GRN : AMB });
            h.querySelector('#scan').innerHTML = svg('0 0 440 228', s);
          };
          h.querySelector('#ss').oninput = draw; draw();
        },
        caption: '只有 \\(x=4\\) 時兩式算出的 \\(y\\) 一致，所以 \\((4,3)\\) 是這個聯立的解。',
        example: {
          q: '\\((x,y)=(2,5)\\) 同時滿足 \\(x+y=7\\) 與 \\(x-y=1\\) 嗎？',
          steps: ['代第一式：\\(2+5=7\\)，成立。', '代第二式：\\(2-5=-3\\neq1\\)，不成立。', '只滿足一式就不算解。'],
          ans: '不是解'
        }
      },

      {
        sec: '1-2', secName: '解二元一次聯立方程式',
        title: '代入消去法：先把一個未知數換掉',
        points: [
          '先從<b>係數是 1 或 −1</b> 的那一式，把 \\(x\\)（或 \\(y\\)）單獨解出來。',
          '再把這一整包<b>代入另一式</b>，兩個未知數立刻變成一個。',
          '解出一個數後，<b>回代到最簡單</b>的那一式求另一個。拖滑桿看完整四步。'
        ],
        formula: { label: '使用時機', tex: '\\text{某一式中 }x\\text{ 或 }y\\text{ 的係數為 }1\\text{ 或 }-1' },
        visual: (h) => {
          SV.stepper(h, '0 0 440 300', [
            {
              t: '寫好兩式，找<b>係數 1</b> 的那一個。',
              d: k => BOX(24, 18, 392, 76, { fill: '#f5f8ff', stroke: '#c9d8f5', op: k }) +
                TX(46, 50, '①　x + y = 9', { fs: 17, c: BLU, op: k }) +
                TX(46, 82, '②　2x + 3y = 24', { fs: 17, c: VIO, op: k })
            },
            {
              t: '由 ① 把 <b>x 單獨解出來</b>。',
              d: k => TX(46, 128, '由 ①：x = 9 − y', { fs: 17, c: GRN, op: k })
            },
            {
              t: '整包<b>代入 ②</b>，去括號後合併同類項。',
              d: k => TX(46, 160, '代入 ②：2(9 − y) + 3y = 24', { fs: 16, op: k }) +
                TX(46, 186, '去括號：18 − 2y + 3y = 24', { fs: 15, op: k }) +
                TX(46, 212, '18 + y = 24 ⇒ y = 6', { fs: 16, c: RED, op: k })
            },
            {
              t: '<b>回代</b> ① 求 x，寫成數對作答。',
              d: k => TX(46, 236, '回代 ①：x = 9 − 6 = 3', { fs: 16, op: k }) +
                BOX(24, 250, 392, 40, { fill: '#eef7f2', stroke: '#bfe0d1', op: k }) +
                TX(46, 277, '解　(x, y) = (3, 6)', { fs: 17, c: GRN, op: k })
            }
          ]);
        },
        caption: '代入法的關鍵：<b>先找係數 1 的那一式</b>，代進去才不會冒出分數。',
        example: {
          q: '解聯立 \\(y=x+2\\)、\\(3x+y=14\\)。',
          steps: ['把 \\(y=x+2\\) 代入第二式：\\(3x+(x+2)=14\\)。', '\\(4x=12\\Rightarrow x=3\\)。', '回代 \\(y=3+2=5\\)。'],
          ans: '\\((x,y)=(3,5)\\)'
        }
      },

      {
        sec: '1-2', secName: '解二元一次聯立方程式',
        title: '加減消去法：同號相減、異號相加',
        points: [
          '某個未知數在兩式中的<b>係數絕對值一樣</b>時，直接把兩式<b>相加或相減</b>。',
          '口訣：<b>同號相減、異號相加</b>——目的就是讓那一項變成 0。',
          '相加減時，<b>等號右邊的常數也要一起算</b>，這是最常漏掉的一步。'
        ],
        formula: { label: '消去目標', tex: '\\text{讓某一個未知數的係數變成 }0' },
        visual: (h) => {
          SV.stepper(h, '0 0 440 300', [
            {
              t: '兩式並排，先看 <b>y 的係數</b>。',
              d: k => BOX(24, 18, 392, 76, { fill: '#f5f8ff', stroke: '#c9d8f5', op: k }) +
                TX(46, 50, '①　3x + 2y = 16', { fs: 17, c: BLU, op: k }) +
                TX(46, 82, '②　5x − 2y = 16', { fs: 17, c: VIO, op: k })
            },
            {
              t: '兩個 y 的係數 ＋2 與 −2 <b>異號 ⇒ 相加</b>。',
              d: k => TX(46, 124, '＋2y 與 −2y 異號 ⇒ 兩式相加', { fs: 15, c: AMB, op: k }) +
                TX(46, 154, '① ＋ ②：8x ＋ 0 = 32', { fs: 16, op: k })
            },
            {
              t: '變成一元一次方程式，解出 x。',
              d: k => TX(46, 190, '8x = 32 ⇒ x = 4', { fs: 17, c: RED, op: k })
            },
            {
              t: '<b>回代</b> ① 求 y。',
              d: k => TX(46, 218, '回代 ①：3×4 + 2y = 16', { fs: 16, op: k }) +
                TX(46, 244, '12 + 2y = 16 ⇒ 2y = 4 ⇒ y = 2', { fs: 15, c: RED, op: k }) +
                BOX(24, 254, 392, 40, { fill: '#eef7f2', stroke: '#bfe0d1', op: k }) +
                TX(46, 281, '解　(x, y) = (4, 2)', { fs: 17, c: GRN, op: k })
            }
          ]);
        },
        caption: '\\(+2y\\) 與 \\(-2y\\) 異號，一相加就同時消失。',
        example: {
          q: '解聯立 \\(x+3y=11\\)、\\(x-y=3\\)。',
          steps: ['\\(x\\) 的係數同號 ⇒ ①－②：\\((x+3y)-(x-y)=11-3\\)。', '\\(4y=8\\Rightarrow y=2\\)，回代 \\(x-2=3\\)。'],
          ans: '\\((x,y)=(5,2)\\)'
        }
      },

      {
        sec: '1-2', secName: '解二元一次聯立方程式',
        title: '係數不一樣？先同乘倍數湊成一樣',
        points: [
          '要消 \\(y\\)，就把兩式各乘一個數，讓 \\(y\\) 的<b>係數絕對值相同</b>（取最小公倍數最省事）。',
          '同乘時<b>整式都要乘</b>：左邊每一項、右邊的常數，一個都不能漏。',
          '拖滑桿把第 ① 式乘上 \\(m\\)，看什麼時候兩式的 \\(y\\) 係數剛好對上。'
        ],
        formula: { label: '同乘倍數', tex: '2x+3y=13\\;\\xrightarrow{\\;\\times 2\\;}\\;4x+6y=26' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="mfig"></div>
            <div class="ictrl"><label>第 ① 式同乘 m = <span class="ival" id="mv">2</span></label>
            <input type="range" id="ms" min="1" max="4" step="1" value="2"></div></div>`;
          const draw = () => {
            const m = +h.querySelector('#ms').value;
            h.querySelector('#mv').textContent = m;
            const ok = 3 * m === 6;
            let s = TX(30, 32, '①　2x + 3y = 13', { fs: 16, c: BLU });
            s += BOX(24, 46, 392, 42, { fill: ok ? '#eef7f2' : '#f5f8ff', stroke: ok ? '#bfe0d1' : '#c9d8f5' });
            s += TX(30, 74, `①×${m}：${2 * m}x + ${3 * m}y = ${13 * m}`, { fs: 16, c: ok ? GRN : C });
            s += TX(30, 116, '②　5x − 6y = −8', { fs: 16, c: VIO });
            s += BOX(24, 130, 392, 44, { fill: ok ? '#eef7f2' : '#fff7ed', stroke: ok ? '#bfe0d1' : '#f2d5ab' });
            s += TX(220, 158, ok
              ? `${3 * m}y 與 −6y 絕對值相同 ⇒ 相加即可消去 y`
              : `y 係數 ${3 * m} 與 6 還沒對上，再調 m`,
              { fs: 14, anchor: 'middle', c: ok ? GRN : AMB });
            if (ok) s += TX(220, 206, '相加：9x = 18 ⇒ x = 2 ⇒ y = 3', { fs: 16, anchor: 'middle', c: RED });
            else s += TX(220, 206, '（對上之後就能直接相加）', { fs: 13, anchor: 'middle', c: '#9aa4b6' });
            h.querySelector('#mfig').innerHTML = svg('0 0 440 222', s);
          };
          h.querySelector('#ms').oninput = draw; draw();
        },
        caption: '第 ① 式乘 2 之後，\\(6y\\) 與 \\(-6y\\) 剛好抵消，\\(y\\) 就被消掉了。',
        example: {
          q: '解聯立 \\(3x+2y=16\\)、\\(4x-3y=10\\)。',
          steps: ['消 \\(y\\)：①×3 得 \\(9x+6y=48\\)；②×2 得 \\(8x-6y=20\\)。', '兩式相加：\\(17x=68\\Rightarrow x=4\\)。', '回代 ①：\\(12+2y=16\\Rightarrow y=2\\)。'],
          ans: '\\((x,y)=(4,2)\\)'
        }
      },

      {
        sec: '1-2', secName: '解二元一次聯立方程式',
        title: '易錯：先整理成 ax+by=c，最後代回兩式',
        points: [
          '有<b>分數</b>兩邊同乘分母的最小公倍數、有<b>小數</b>同乘 10 或 100，先化成整數係數。',
          '✗ 去分母時只乘左邊　✓ <b>等號兩邊每一項</b>都要乘，右邊的常數也不能漏。',
          '✗ \\(2(x-3y)=2x-3y\\)　✓ \\(2x-6y\\)，括號內<b>每一項</b>都要乘。',
          '✗ 只代回一式就交卷　✓ \\((x,y)\\) 要<b>兩式都成立</b>才算對。'
        ],
        formula: { label: '去分母', tex: '\\dfrac{x}{2}+\\dfrac{y}{3}=4\\;\\xrightarrow{\\;\\times 6\\;}\\;3x+2y=24' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%">
            <div style="text-align:center;font-size:13px;font-weight:900;color:${C};margin-bottom:9px">先整理成 ax + by = c，再消元</div>
            ${xoRows([
            { bad: '\\(\\dfrac{x}{2}+\\dfrac{y}{3}=4\\Rightarrow 3x+2y=4\\)<br><span style="color:#657187;font-size:12px">右邊忘了乘 6</span>', good: '\\(\\times6\\)：\\(3x+2y=24\\)' },
            { bad: '\\(2(x-3y)=8\\Rightarrow 2x-3y=8\\)', good: '\\(2x-6y=8\\)，括號內<b>每項</b>都乘' },
            { bad: '算出 \\((x,y)\\) 只代回第一式就交卷', good: '<b>兩式</b>都代回去，都成立才算對' }
          ])}</div>`;
        },
        caption: '去分母只乘一半、驗算只代一式——這兩個錯每次段考都有人犯。',
        example: {
          q: '解聯立 \\(\\dfrac{x}{2}+\\dfrac{y}{3}=4\\)、\\(x-y=3\\)。',
          steps: ['第一式兩邊同乘 6：\\(3x+2y=24\\)。', '由 \\(x=y+3\\) 代入：\\(3(y+3)+2y=24\\Rightarrow 5y=15\\)。', '\\(y=3,\\ x=6\\)；代回兩式都成立。'],
          ans: '\\((x,y)=(6,3)\\)'
        }
      },

      /* ---------- 1-3 應用問題 ---------- */
      {
        sec: '1-3', secName: '應用問題',
        title: '設兩個未知數，就要列兩個式子',
        points: [
          '四步驟：<b>設</b>兩個未知數 → 依題意<b>列兩式</b> → <b>解</b>聯立 → <b>驗算作答</b>（記得寫單位）。',
          '設了兩個未知數，就<b>一定要有兩個獨立的條件</b>；題目裡通常一句話對應一個式子。',
          '最直接的是<b>和差問題</b>：「兩數的和」列一式、「兩數的差」列另一式。'
        ],
        formula: { label: '和差型', tex: '\\begin{cases}x+y=\\text{和}\\\\ x-y=\\text{差}\\end{cases}' },
        visual: (h) => {
          const step = (y, tag, t1, t2, col, fill) =>
            BOX(58, y, 324, 52, { fill: fill, stroke: col, sw: 1.8 }) +
            TX(80, y + 33, tag, { fs: 19, c: col }) +
            TX(112, y + 24, t1, { fs: 14, c: '#172033' }) +
            TX(112, y + 43, t2, { fs: 12, c: '#657187', fw: 600 });
          const arrow = (y) => `<line x1="220" y1="${y}" x2="220" y2="${y + 14}" stroke="#9aa4b6" stroke-width="2.4" marker-end="url(#fa1)"/>`;
          h.innerHTML = svg('0 0 440 298', `
            <defs><marker id="fa1" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#9aa4b6"/></marker></defs>
            ${step(14, '設', '設兩個未知數 x、y', '寫清楚各代表什麼、單位是什麼', C, '#f5f8ff')}
            ${arrow(66)}
            ${step(82, '列', '依題意列出兩個方程式', '一句條件 = 一個式子', VIO, '#f7f4ff')}
            ${arrow(134)}
            ${step(150, '解', '代入消去法或加減消去法', '先求一個，再回代求另一個', AMB, '#fff8ec')}
            ${arrow(202)}
            ${step(218, '驗', '代回兩式並檢查合理性', '作答要寫單位（人、元、公里）', GRN, '#eef7f2')}`);
        },
        caption: '「設」和「列」就佔了一半分數，先把兩個未知數寫清楚再動筆算。',
        example: {
          q: '兩數的和為 50、差為 12，求這兩數。',
          steps: ['設大數 \\(x\\)、小數 \\(y\\)：\\(x+y=50\\)、\\(x-y=12\\)。', '兩式相加：\\(2x=62\\Rightarrow x=31\\)。', '\\(y=50-31=19\\)。'],
          ans: '\\(31\\) 與 \\(19\\)'
        }
      },

      {
        sec: '1-3', secName: '應用問題',
        title: '購物與分配：數量一式、金額一式',
        points: [
          '買東西題最穩的切法：<b>「幾個」列一式、「多少錢」列另一式</b>。',
          '單價要<b>乘上數量</b>才是金額，別把 \\(x+y\\) 和 \\(25x+40y\\) 混成同一式。',
          '<b>分配問題</b>同理：「每人分 5 顆剩 3 顆」與「每人分 6 顆少 4 顆」各列一式。'
        ],
        formula: { label: '購物型', tex: '\\begin{cases}x+y=\\text{總數量}\\\\ px+qy=\\text{總金額}\\end{cases}' },
        visual: (h) => {
          const item = (x, name, price, unit, col) =>
            BOX(x, 30, 160, 74, { fill: '#fff', stroke: col, sw: 2 }) +
            TX(x + 80, 60, name, { fs: 17, c: col, anchor: 'middle' }) +
            TX(x + 80, 86, `每${unit} ${price} 元`, { fs: 13, c: '#657187', anchor: 'middle', fw: 600 });
          h.innerHTML = svg('0 0 440 268', `
            ${item(30, '麵包 x 個', 25, '個', C)}
            ${item(250, '飲料 y 瓶', 40, '瓶', VIO)}
            ${BOX(30, 124, 380, 50, { fill: '#f5f8ff', stroke: '#c9d8f5' })}
            ${TX(52, 155, '數量：', { fs: 15, c: '#657187' })}
            ${TX(120, 155, 'x + y = 12', { fs: 18, c: C })}
            ${BOX(30, 184, 380, 50, { fill: '#f7f4ff', stroke: '#d9cdf7' })}
            ${TX(52, 215, '金額：', { fs: 15, c: '#657187' })}
            ${TX(120, 215, '25x + 40y = 375', { fs: 18, c: VIO })}
            ${TX(220, 256, '解得 x = 7、y = 5', { fs: 14, c: GRN, anchor: 'middle' })}`);
        },
        caption: '同一批東西可以列出兩個式子：一個算「件數」、一個算「錢」。',
        example: {
          q: '一包糖果分給小朋友：每人 5 顆剩 3 顆，每人 6 顆少 4 顆。共幾人？糖果幾顆？',
          steps: ['設人數 \\(x\\)、糖果 \\(y\\)：\\(y=5x+3\\)、\\(y=6x-4\\)。', '\\(5x+3=6x-4\\Rightarrow x=7\\)。', '\\(y=5\\times7+3=38\\)。'],
          ans: '7 人、38 顆'
        }
      },

      {
        sec: '1-3', secName: '應用問題',
        title: '速率問題：相遇距離相加，追及距離相減',
        points: [
          '公式只有一條：<b>距離 ＝ 速率 × 時間</b>，列式前先把<b>單位統一</b>。',
          '<b>相遇</b>（相向而行）：兩人走的距離<b>加起來</b>＝兩地距離；<b>追及</b>則是相減。',
          '<b>順逆流</b>：順流 ＝ 船速 ＋ 水速、逆流 ＝ 船速 − 水速，兩式聯立就求得船速與水速。',
          '拖滑桿看時間往前走，兩人的距離怎麼把 120 公里吃掉。'
        ],
        formula: { label: '順逆流型', tex: '\\begin{cases}x+y=\\text{順流速率}\\\\ x-y=\\text{逆流速率}\\end{cases}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="road"></div>
            <div class="ictrl"><label>經過時間 t = <span class="ival" id="tv">1.0</span> 小時</label>
            <input type="range" id="ts" min="0" max="2" step="0.1" value="1"></div></div>`;
          const L = 40, R = 400, TOT = 120;
          const draw = () => {
            const t = +h.querySelector('#ts').value;
            h.querySelector('#tv').textContent = t.toFixed(1);
            const dA = Math.round(40 * t * 10) / 10, dB = Math.round(20 * t * 10) / 10;
            const sum = Math.round((dA + dB) * 10) / 10;
            const xA = L + (dA / TOT) * (R - L), xB = R - (dB / TOT) * (R - L);
            const met = sum >= TOT - 0.001;
            let s = TX(220, 24, `經過 ${t.toFixed(1)} 小時`, { fs: 16, c: C, anchor: 'middle' });
            s += TX(220, 48, `甲走 ${dA} 公里　·　乙走 ${dB} 公里　·　合計 ${sum} 公里`, { fs: 13.5, c: '#657187', anchor: 'middle', fw: 600 });
            s += SV.seg(L, 120, R, 120, '#dce3ee', 9);
            s += SV.seg(L, 120, xA, 120, BLU, 9);
            s += SV.seg(xB, 120, R, 120, VIO, 9);
            s += SV.seg(L, 104, L, 136, '#9aa4b6', 2.4) + SV.seg(R, 104, R, 136, '#9aa4b6', 2.4);
            s += TX(L, 156, 'A 地', { fs: 13, c: '#657187', anchor: 'middle' });
            s += TX(R, 156, 'B 地', { fs: 13, c: '#657187', anchor: 'middle' });
            s += SV.dot(xA, 120, BLU, 8) + TX(xA, 100, '甲 →', { fs: 13, c: BLU, anchor: 'middle' });
            s += SV.dot(xB, 120, VIO, 8) + TX(xB, 148, '← 乙', { fs: 13, c: VIO, anchor: 'middle' });
            s += TX(220, 180, '兩地相距 120 公里（甲 40、乙 20 公里/小時）', { fs: 12.5, c: '#9aa4b6', anchor: 'middle', fw: 600 });
            s += BOX(24, 192, 392, 40, { fill: met ? '#eef7f2' : '#fff7ed', stroke: met ? '#bfe0d1' : '#f2d5ab' });
            s += TX(220, 218, met ? '相遇！40t + 20t = 120 ⇒ t = 2 小時' : `還差 ${Math.round((TOT - sum) * 10) / 10} 公里`,
              { fs: 15, anchor: 'middle', c: met ? GRN : AMB });
            h.querySelector('#road').innerHTML = svg('0 0 440 242', s);
          };
          h.querySelector('#ts').oninput = draw; draw();
        },
        caption: '相向而行：兩人<b>走的時間相同</b>，走的距離相加就是兩地距離。',
        example: {
          q: '一艘船順流 60 公里要 2 小時，逆流同樣距離要 3 小時，求船速與水速。',
          steps: ['順流速率 \\(=30\\)、逆流速率 \\(=20\\)（公里/小時）。', '設船速 \\(x\\)、水速 \\(y\\)：\\(x+y=30\\)、\\(x-y=20\\)。', '兩式相加 \\(2x=50\\Rightarrow x=25\\)，\\(y=5\\)。'],
          ans: '船速 25、水速 5 公里/小時'
        }
      },

      {
        sec: '1-3', secName: '應用問題',
        title: '易錯：兩位數是 10x+y，答案還要合乎題意',
        points: [
          '✗ 十位 \\(x\\)、個位 \\(y\\) 的兩位數寫成 \\(xy\\)　✓ 應該是 <b>\\(10x+y\\)</b>，對調後是 \\(10y+x\\)。',
          '✗ 年齡問題只加一個人的歲數　✓ 幾年後<b>兩個人同加</b>，而且<b>年齡差永遠不變</b>。',
          '單位要先統一（分鐘配公尺、小時配公里），不要一式用分、一式用秒。',
          '最後檢查：人數、枝數必須是<b>正整數</b>，年齡、長度不可為負——不合理就回頭找錯。'
        ],
        formula: { label: '兩位數的表示法', tex: '\\text{原數}=10x+y,\\qquad \\text{對調後}=10y+x' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%">
            ${svg('0 0 440 122', `
              ${BOX(96, 16, 100, 62, { fill: '#f5f8ff', stroke: C, sw: 2 })}
              ${TX(146, 44, '十位', { fs: 13, c: '#657187', anchor: 'middle' })}
              ${TX(146, 68, 'x', { fs: 22, c: C, anchor: 'middle' })}
              ${BOX(206, 16, 100, 62, { fill: '#f7f4ff', stroke: VIO, sw: 2 })}
              ${TX(256, 44, '個位', { fs: 13, c: '#657187', anchor: 'middle' })}
              ${TX(256, 68, 'y', { fs: 22, c: VIO, anchor: 'middle' })}
              ${TX(220, 108, 'x × 10 ＋ y × 1 ＝ 10x + y', { fs: 17, c: GRN, anchor: 'middle' })}
            `)}
            <div style="margin-top:8px">${xoRows([
            { bad: '兩位數寫成 \\(xy\\)（那是 x 乘 y）', good: '兩位數是 \\(10x+y\\)' },
            { bad: '「5 年後父親是兒子的 2 倍」列成 \\(x+5=2y\\)', good: '\\(x+5=2(y+5)\\)，<b>兩人都要加 5</b>' }
          ])}</div></div>`;
        },
        caption: '把「十位 x、個位 y」寫成 \\(10x+y\\)——這一步錯了，整題就全沒了。',
        example: {
          q: '一個兩位數的十位與個位數字和為 11，數字對調後比原數大 27，求原數。',
          steps: ['設十位 \\(x\\)、個位 \\(y\\)：\\(x+y=11\\)。', '對調後大 27：\\((10y+x)-(10x+y)=27\\Rightarrow 9y-9x=27\\Rightarrow y-x=3\\)。', '\\(x+y=11\\) 與 \\(y-x=3\\) 相加：\\(2y=14\\Rightarrow y=7,\\ x=4\\)。'],
          ans: '原數 47'
        }
      }
    ]
  });
})();
