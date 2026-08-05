/* ============ 第 3 章　一元一次方程式 ============
   依康軒版第1冊（七上）課程計畫：3-1 代數式的化簡、3-2 一元一次方程式、3-3 應用問題
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#059669';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }

  // 圓角方框 + 多行文字（純 SVG）
  function fbx(x, y, w, hh, fill, stroke, lines) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    lines.forEach((L, i) => {
      s += `<text x="${x + w / 2}" y="${y + (L.dy || 24) + i * 21}" text-anchor="middle" font-size="${L.fs || 14}" font-weight="${L.b === false ? 600 : 800}" fill="${L.c || '#172033'}">${L.t}</text>`;
    });
    return s;
  }
  // ✗ / ✓ 對照卡（HTML）
  function badGood(items) {
    return `<div style="width:96%;margin:0 auto;display:flex;flex-direction:column;gap:10px">` +
      items.map(it => `<div style="border:1.5px solid #dce3ee;border-radius:14px;padding:9px 13px;background:#fff;box-shadow:0 4px 14px rgba(30,42,68,.06);text-align:left">
        <div style="font-size:14.5px;font-weight:800;color:${RED}">✗ \\(${it.bad}\\)</div>
        <div style="font-size:14.5px;font-weight:800;color:${GRN};margin-top:3px">✓ \\(${it.good}\\)</div>
        <div style="font-size:12px;color:#657187;margin-top:3px">${it.tip}</div></div>`).join('') + `</div>`;
  }

  window.DECK.push({
    ch: 3,
    title: '一元一次方程式',
    color: C,
    sections: ['3-1 代數式的化簡', '3-2 一元一次方程式', '3-3 應用問題'],
    slides: [

      /* ---------- 3-1 代數式的化簡 ---------- */
      {
        sec: '3-1', secName: '符號與簡記',
        title: '代數式的簡記：乘號省略、數字寫前面',
        points: [
          '用文字符號代表數以後，<b>文字前的乘號要省略</b>：\\(3\\times a\\) 寫成 \\(3a\\)、\\(a\\times a\\) 寫成 \\(a^2\\)。',
          '<b>數字寫在文字符號前面</b>；係數 \\(1\\) 不寫（\\(1\\times a=a\\)），係數 \\(-1\\) 只留負號（\\(-a\\)）。',
          '<b>除號也要消失</b>：\\(a\\div 3\\) 一律改寫成分數 \\(\\dfrac{a}{3}\\)。'
        ],
        formula: { label: '簡記三原則', tex: '3\\times a=3a,\\qquad a\\times a=a^2,\\qquad a\\div 3=\\dfrac{a}{3}' },
        visual: (h) => {
          const row = (a, b, note, bg) => `<tr style="background:${bg || '#fff'}">
            <td style="border:1px solid #cdd6e2;padding:7px 8px;color:#657187">\\(${a}\\)</td>
            <td style="border:1px solid #cdd6e2;padding:7px 8px;font-weight:900;color:${C}">\\(${b}\\)</td>
            <td style="border:1px solid #cdd6e2;padding:7px 8px;font-size:11.5px;color:#657187">${note}</td></tr>`;
          h.innerHTML = `<div style="width:96%;margin:0 auto">
            <table style="width:100%;border-collapse:collapse;font-size:14px;text-align:center">
              <tr style="background:#eef7f2">
                <th style="border:1px solid #cdd6e2;padding:8px">原本的寫法</th>
                <th style="border:1px solid #cdd6e2;padding:8px">簡記</th>
                <th style="border:1px solid #cdd6e2;padding:8px">提醒</th></tr>
              ${row('3\\times a', '3a', '乘號省略')}
              ${row('b\\times 5', '5b', '數字寫在前面', '#fafcfb')}
              ${row('a\\times a', 'a^2', '相同文字用次方')}
              ${row('1\\times a', 'a', '係數 1 不用寫', '#fafcfb')}
              ${row('(-1)\\times a', '-a', '係數 −1 只留負號')}
              ${row('a\\div 3', '\\dfrac{a}{3}', '除法改寫成分數', '#fafcfb')}
            </table>
            <div style="margin-top:9px;font-size:12px;color:#657187;text-align:center">簡記只是「換寫法」，值完全沒變。</div>
          </div>`;
        },
        caption: '簡記是後面所有化簡、解方程式的共同語言，先寫順手再往下走。',
        example: {
          q: '把 \\(y\\times(-1)+x\\div 4\\) 用簡記法寫出來。',
          steps: ['\\(y\\times(-1)=-y\\)。', '\\(x\\div 4=\\dfrac{x}{4}\\)。'],
          ans: '\\(-y+\\dfrac{x}{4}\\)'
        }
      },

      {
        sec: '3-1', secName: '列代數式',
        title: '列式先問自己：一份多少？有幾份？',
        points: [
          '列代數式的骨架：<b>每份 × 份數</b>，最後再加減固定不變的量。',
          '打折是<b>乘法</b>：打八折＝原價 \\(\\times 0.8\\)；折價券才是減法，兩者常被混在一起。',
          '路程題也一樣：每分鐘走 60 公尺、走 \\(x\\) 分鐘就是 \\(60x\\) 公尺。'
        ],
        formula: { label: '列式骨架', tex: '\\text{總量}=\\text{每份}\\times\\text{份數}\\;\\pm\\;\\text{固定量}' },
        visual: (h) => {
          h.innerHTML = svg('0 0 440 275', `
            ${SV.arrowDefs('#8a94a6', 'fa2')}
            ${fbx(40, 10, 360, 50, '#f4f7fb', '#c3ccdb', [{ t: '情境：一枝筆 x 元，買 5 枝，付 100 元', fs: 14, dy: 31 }])}
            <line x1="220" y1="62" x2="220" y2="84" stroke="#8a94a6" stroke-width="2.4" marker-end="url(#fa2)"/>
            ${fbx(40, 88, 360, 62, '#eef4ff', BLU, [
            { t: '每份 × 份數', fs: 13, c: BLU, dy: 24 },
            { t: 'x × 5 = 5x（元）', fs: 18, c: '#172033' }
          ])}
            <line x1="220" y1="152" x2="220" y2="174" stroke="#8a94a6" stroke-width="2.4" marker-end="url(#fa2)"/>
            ${fbx(40, 178, 360, 62, '#eef7f2', C, [
            { t: '再處理固定量（付出去的 100 元）', fs: 13, c: C, dy: 24 },
            { t: '找回 100 − 5x（元）', fs: 18, c: '#172033' }
          ])}`);
        },
        caption: '把中文一句一句翻成算式，先寫「每份×份數」，固定量最後補上。',
        example: {
          q: '一件外套定價 \\(x\\) 元，打八折後再用 50 元折價券，實付多少元？',
          steps: ['打八折：\\(0.8x\\)。', '再減折價券 50 元。'],
          ans: '\\(0.8x-50\\)（元）'
        }
      },

      {
        sec: '3-1', secName: '代數式求值',
        title: '代數式求值：代入負數一定要加括號',
        points: [
          '求值就是把文字符號換成數字，<b>先加括號再算</b>，順序才不會亂。',
          '\\(x=-2\\) 時 \\(x^2=(-2)^2=4\\)；若寫成 \\(-2^2\\) 會變成 \\(-4\\)，一個括號差很多。',
          '拖滑桿改變 \\(x\\)，看 \\(2x+5\\) 與 \\(x^2\\) 的值怎麼跟著跑。'
        ],
        formula: { label: '代入要點', tex: 'x=-2\\;\\Rightarrow\\;x^2=(-2)^2=4\\quad(\\text{不是}-4)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="ev"></div>
            <div class="ictrl"><label>x 的值 <span class="ival" id="evv">-2</span></label>
            <input type="range" id="evs" min="-5" max="5" step="1" value="-2"></div></div>`;
          const card = (x, y, w, ttl, body, col) =>
            `<rect x="${x}" y="${y}" width="${w}" height="76" rx="12" fill="#fff" stroke="${col}" stroke-width="2"/>` +
            `<text x="${x + w / 2}" y="${y + 26}" text-anchor="middle" font-size="15" font-weight="900" fill="${col}">${ttl}</text>` +
            `<text x="${x + w / 2}" y="${y + 55}" text-anchor="middle" font-size="16" font-weight="800" fill="#172033">${body}</text>`;
          const X = v => 44 + (v + 5) * 35.2;
          const draw = () => {
            const x = +h.querySelector('#evs').value;
            h.querySelector('#evv').textContent = x;
            let s = SV.seg(30, 92, 412, 92, '#8a94a6', 2.4);
            for (let v = -5; v <= 5; v++) {
              s += SV.seg(X(v), 86, X(v), 98, '#8a94a6', 1.8);
              s += `<text x="${X(v)}" y="116" text-anchor="middle" font-size="11" fill="#96a0b3">${v}</text>`;
            }
            s += SV.dot(X(x), 92, RED, 6.5);
            s += `<text x="${X(x)}" y="68" text-anchor="middle" font-size="15" font-weight="900" fill="${RED}">x = ${x}</text>`;
            s += card(36, 150, 178, '2x + 5', `2×(${x})+5 = ${2 * x + 5}`, BLU);
            s += card(232, 150, 178, 'x²', `(${x})² = ${x * x}`, C);
            s += `<text x="220" y="262" text-anchor="middle" font-size="12.5" fill="#657187">代入的數字外面永遠先套一層括號</text>`;
            h.querySelector('#ev').innerHTML = svg('0 0 440 280', s);
          };
          h.querySelector('#evs').oninput = draw; draw();
        },
        caption: '把滑桿拉到負數，觀察 \\(x^2\\) 為什麼一定是正的。',
        example: {
          q: '當 \\(a=-3\\) 時，求 \\(a^2-2a\\) 的值。',
          steps: ['\\(a^2=(-3)^2=9\\)。', '\\(-2a=-2\\times(-3)=6\\)。', '\\(9+6=15\\)。'],
          ans: '\\(15\\)'
        }
      },

      {
        sec: '3-1', secName: '合併同類項',
        title: '同類項才能合併：係數相加、文字不動',
        points: [
          '<span class="k">同類項</span>＝所含<b>文字與次數完全相同</b>的項：\\(3x\\) 與 \\(-5x\\) 是，\\(3x\\) 與 \\(3x^2\\) 不是。',
          '合併時只把<b>係數相加減</b>，文字部分整個照抄：\\(3x+5x=8x\\)、\\(7a-a=6a\\)。',
          '只含<b>一次項</b>與<b>常數項</b>的式子叫<span class="k">一次式</span>，如 \\(6x-4\\)。',
          '<b>常數項自成一類</b>；拖滑桿改變 \\(x\\)，兩排長度永遠一樣。'
        ],
        formula: { label: '合併同類項', tex: '3x+5x=(3+5)x=8x' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="bar"></div>
            <div class="ictrl"><label>一個 x 代表 <span class="ival" id="bv">4</span></label>
            <input type="range" id="bs" min="2" max="6" step="1" value="4"></div></div>`;
          const draw = () => {
            const x = +h.querySelector('#bs').value;
            h.querySelector('#bv').textContent = x;
            const bw = x * 8, total = 8 * bw, x0 = (440 - total) / 2;
            let s = '';
            for (let i = 0; i < 8; i++) {
              s += `<rect x="${x0 + i * bw}" y="45" width="${bw - 1.5}" height="44" rx="4" fill="${i < 3 ? BLU : C}" opacity="0.85"/>`;
            }
            s += `<text x="${x0 + 1.5 * bw}" y="112" text-anchor="middle" font-size="13" font-weight="900" fill="${BLU}">3x = ${3 * x}</text>`;
            s += `<text x="${x0 + 5.5 * bw}" y="112" text-anchor="middle" font-size="13" font-weight="900" fill="${C}">5x = ${5 * x}</text>`;
            s += `<text x="220" y="136" text-anchor="middle" font-size="16" font-weight="900" fill="#172033">↓ 合併</text>`;
            s += `<rect x="${x0}" y="150" width="${total}" height="44" rx="6" fill="${AMB}" opacity="0.85"/>`;
            s += `<text x="220" y="216" text-anchor="middle" font-size="14" font-weight="900" fill="${AMB}">8x = ${8 * x}</text>`;
            s += `<text x="220" y="250" text-anchor="middle" font-size="13" fill="#657187">不管 x 是多少，3x + 5x 和 8x 一樣長</text>`;
            h.querySelector('#bar').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#bs').oninput = draw; draw();
        },
        caption: '\\(3x\\) 是「3 個 x」、\\(5x\\) 是「5 個 x」，合起來當然是 8 個 x。',
        example: {
          q: '化簡 \\(\\dfrac{x}{2}+\\dfrac{x}{3}-1\\)。',
          steps: [
            '係數通分 \\(\\dfrac{1}{2}+\\dfrac{1}{3}=\\dfrac{5}{6}\\)。',
            '\\(x\\) 項合併成 \\(\\dfrac{5x}{6}\\)，常數 \\(-1\\) 沒有同類項可併。'
          ],
          ans: '\\(\\dfrac{5x}{6}-1\\)'
        }
      },

      {
        sec: '3-1', secName: '去括號',
        title: '【易錯】括號前是減號，裡面每一項都要變號',
        points: [
          '✗ 最常見的錯：\\((5x+3)-(2x-4)=5x+3-2x-4\\)，只把第一項變號。',
          '✓ 正確做法：減號要<b>分配到括號裡的每一項</b>，\\(=5x+3-2x+4=3x+7\\)。',
          '分配律展開也一樣：\\(-3(x-2)=-3x+6\\)，後面那項的<b>負負得正</b>最容易漏。'
        ],
        formula: { label: '去括號', tex: '-(a-b)=-a+b,\\qquad -3(x-2)=-3x+6' },
        visual: (h) => {
          // 四個圓角色塊固定不動（5x、+3、2x、−4），只換文字與顏色；
          // 第二個括號外的大紅減號一步一步分配到括號內的每一項。
          const yb = 76, bw = 60, bh = 48;
          const XA = 50, XB = 124, XC = 254, XD = 328;
          const mid = x => x + bw / 2;
          const blk = (x, t, col, fill, ring) => {
            let s = `<rect x="${x}" y="${yb}" width="${bw}" height="${bh}" rx="12" fill="${fill}" stroke="${col}" stroke-width="2.2"/>`;
            s += `<text x="${mid(x)}" y="${yb + 32}" text-anchor="middle" font-size="20" font-weight="900" fill="${col}">${t}</text>`;
            if (ring) s += `<rect x="${x - 6}" y="${yb - 6}" width="${bw + 12}" height="${bh + 12}" rx="16" fill="none" stroke="${RED}" stroke-width="2.6" stroke-dasharray="6 4" opacity="${ring}"/>`;
            return s;
          };
          const paren = (x, t) => `<text x="${x}" y="${yb + 40}" text-anchor="middle" font-size="40" font-weight="700" fill="#8a94a6">${t}</text>`;
          // 固定框架：課綱 N-7-4 的規則橫幅 ＋ 兩組括號 ＋ 中間的大紅減號
          const frame = (hot) =>
            `<rect x="106" y="12" width="228" height="36" rx="12" fill="#fdeef2" stroke="#f3c3ce" stroke-width="1.6"/>` +
            `<text x="220" y="37" text-anchor="middle" font-size="17" font-weight="900" fill="${RED}">− ( a − b ) ＝ − a ＋ b</text>` +
            paren(38, '(') + paren(196, ')') + paren(244, '(') + paren(402, ')') +
            `<text x="220" y="${yb + 36}" text-anchor="middle" font-size="44" font-weight="900" fill="${RED}">−</text>` +
            (hot ? `<circle cx="220" cy="${yb + 24}" r="25" fill="none" stroke="${RED}" stroke-width="2.6" stroke-dasharray="5 4" opacity="${hot}"/>` : '');
          const foot = (main, col, sub) =>
            `<text x="220" y="200" text-anchor="middle" font-size="19" font-weight="900" fill="${col}">${main}</text>` +
            `<text x="220" y="232" text-anchor="middle" font-size="13" fill="#657187">${sub}</text>`;
          const A = blk(XA, '5x', BLU, '#eef4ff'), B = blk(XB, '+3', BLU, '#eef4ff');
          const op = k => (0.2 + 0.8 * k).toFixed(2);
          SV.stepper(h, '0 0 440 280', [
            {
              t: '原式 <b>(5x + 3) − (2x − 4)</b>，括號前有一個減號在等著。',
              d: k => frame(op(k)) + A + B +
                blk(XC, '2x', '#5b6478', '#f1f4f9') + blk(XD, '−4', '#5b6478', '#f1f4f9') +
                foot('(5x ＋ 3) − (2x − 4)', '#172033', '紅色減號會管到括號內的每一項，不是只有第一項')
            },
            {
              t: '減號先分配到<b>第一項</b>：2x 變成 <b>−2x</b>。',
              d: k => SV.arrowDefs(RED, 'dbr1') + frame(1) + A + B +
                blk(XC, '−2x', RED, '#fdeef2') + blk(XD, '−4', '#5b6478', '#f1f4f9') +
                `<path d="M216,128 Q250,166 280,132" fill="none" stroke="${RED}" stroke-width="2.6" marker-end="url(#dbr1)" opacity="${op(k)}"/>` +
                foot('＝ 5x ＋ 3 − 2x', RED, '第一項變號完成，但括號裡還有一項沒處理')
            },
            {
              t: '減號也要分配到<b>第二項</b>：−4 變成 <b>+4</b>，這裡最常漏。',
              d: k => SV.arrowDefs(RED, 'dbr2') + frame(1) + A + B +
                blk(XC, '−2x', RED, '#fdeef2') + blk(XD, '+4', RED, '#fdeef2', op(k)) +
                `<path d="M218,128 Q290,182 356,132" fill="none" stroke="${RED}" stroke-width="2.6" marker-end="url(#dbr2)"/>` +
                `<text x="358" y="64" text-anchor="middle" font-size="12.5" font-weight="900" fill="${RED}">最常漏這一項！</text>` +
                foot('＝ 5x ＋ 3 − 2x ＋ 4', RED, '負負得正：括號裡的 −4 變成 ＋4')
            },
            {
              t: '最後<b>合併同類項</b>：5x − 2x = 3x、3 + 4 = 7。',
              d: k => frame(0) +
                blk(XA, '5x', BLU, '#eef4ff') + blk(XC, '−2x', BLU, '#eef4ff') +
                blk(XB, '+3', GRN, '#eef7f2') + blk(XD, '+4', GRN, '#eef7f2') +
                `<path d="M80,128 Q182,166 284,128" fill="none" stroke="${BLU}" stroke-width="2.4"/>` +
                `<path d="M154,128 Q256,190 358,128" fill="none" stroke="${GRN}" stroke-width="2.4"/>` +
                `<text x="132" y="200" text-anchor="middle" font-size="16" font-weight="900" fill="${BLU}">5x − 2x ＝ 3x</text>` +
                `<text x="322" y="200" text-anchor="middle" font-size="16" font-weight="900" fill="${GRN}">3 ＋ 4 ＝ 7</text>` +
                `<rect x="140" y="216" width="160" height="48" rx="14" fill="#eef7f2" stroke="${C}" stroke-width="2.4" opacity="${op(k)}"/>` +
                `<text x="220" y="248" text-anchor="middle" font-size="25" font-weight="900" fill="${C}" opacity="${op(k)}">3x ＋ 7</text>`
            }
          ], { acc: false });
        },
        caption: '一句話記：<b>括號前是減號，裡面全部翻牌</b>——拖滑桿看它一項一項翻。',
        example: {
          q: '化簡 \\(2(3x-1)-(x-5)\\)。',
          steps: ['\\(2(3x-1)=6x-2\\)。', '\\(-(x-5)=-x+5\\)。', '合併：\\(6x-2-x+5=5x+3\\)。'],
          ans: '\\(5x+3\\)'
        }
      },

      /* ---------- 3-2 一元一次方程式 ---------- */
      {
        sec: '3-2', secName: '方程式的意義',
        title: '一元一次方程式：一個未知數、最高一次',
        points: [
          '含未知數的<b>等式</b>叫<span class="k">方程式</span>；只有<b>一個</b>未知數、次數<b>最高一次</b>，就是一元一次方程式。',
          '沒有等號的 \\(3x-1\\) 只是<b>式子</b>，不是方程式——這是判別題的第一個陷阱。',
          '未知數出現在<b>分母</b>（如 \\(\\dfrac{1}{x}=2\\)）或次數是二次，都不算一元一次方程式。'
        ],
        formula: { label: '標準式', tex: 'ax+b=0\\quad(a\\neq 0)' },
        visual: (h) => {
          const col = (ttl, color, bg, items) => `<div style="flex:1;border:2px solid ${color};background:${bg};border-radius:14px;padding:10px 8px">
            <div style="font-size:13px;font-weight:900;color:${color};text-align:center;margin-bottom:7px">${ttl}</div>` +
            items.map(it => `<div style="font-size:15px;color:#172033;text-align:center;margin:6px 0">\\(${it.t}\\)
              <div style="font-size:11px;color:#657187;margin-top:1px">${it.n}</div></div>`).join('') + `</div>`;
          h.innerHTML = `<div style="width:96%;margin:0 auto;display:flex;gap:10px;align-items:stretch">
            ${col('✓ 是一元一次方程式', C, '#eef7f2', [
            { t: '2x+3=11', n: '一個未知數、一次' },
            { t: '9=2x+1', n: '未知數在右邊也可以' },
            { t: '\\dfrac{x}{3}=4', n: '係數是分數也算' }
          ])}
            ${col('✗ 不是', RED, '#fdeef2', [
            { t: '3x-1', n: '沒有等號，只是式子' },
            { t: 'x^2=4', n: '次數是二次' },
            { t: '\\dfrac{1}{x}=2', n: '未知數在分母' }
          ])}
          </div>`;
        },
        caption: '判別三問：<b>有等號嗎？幾個未知數？最高幾次？</b>',
        example: {
          q: '下列何者是一元一次方程式？(A) \\(3x-1\\)　(B) \\(x^2=4\\)　(C) \\(5-2x=1\\)',
          steps: ['(A) 沒有等號，只是式子。', '(B) 未知數的次數是二次。'],
          ans: '(C)'
        }
      },

      {
        sec: '3-2', secName: '方程式的解',
        title: '解就是「代進去能讓左右相等」的那個數',
        points: [
          '<span class="k">解</span>（根）＝代入後能讓<b>等號左右兩邊算出同一個數</b>的值。',
          '檢驗只有一招：<b>左式算一次、右式算一次</b>，看是否相等，不要只算一邊。',
          '拖滑桿改變 \\(x\\)，只有 \\(x=4\\) 時 \\(2x+3\\) 才會等於 \\(11\\)，天平才平衡。'
        ],
        formula: { label: '檢驗解', tex: '\\text{左式}=\\text{右式}\\;\\Longleftrightarrow\\;\\text{這個數是解}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="bal"></div>
            <div class="ictrl"><label>試試看 x = <span class="ival" id="blv">2</span></label>
            <input type="range" id="bls" min="0" max="8" step="1" value="2"></div></div>`;
          const beam = (tilt, lt, rt, note, nc) => {
            const cx = 220, cy = 115, half = 134;
            const a = tilt * Math.PI / 180;
            const lx = cx - half * Math.cos(a), ly = cy + half * Math.sin(a);
            const rx = cx + half * Math.cos(a), ry = cy - half * Math.sin(a);
            let s = SV.poly([[cx, cy + 5], [cx - 32, 248], [cx + 32, 248]], '#e4e9f2', '#8a94a6', 2);
            s += SV.seg(148, 248, 292, 248, '#8a94a6', 3.4);
            s += SV.seg(lx, ly, rx, ry, '#5b6478', 6);
            s += SV.dot(cx, cy, '#5b6478', 6);
            [[lx, ly, lt, BLU], [rx, ry, rt, RED]].forEach(p => {
              const px = p[0], py = p[1];
              s += SV.seg(px, py, px, py + 32, '#8a94a6', 2);
              s += `<rect x="${px - 66}" y="${py + 32}" width="132" height="40" rx="10" fill="#fff" stroke="${p[3]}" stroke-width="2.2"/>`;
              s += `<text x="${px}" y="${py + 58}" text-anchor="middle" font-size="15" font-weight="900" fill="${p[3]}">${p[2]}</text>`;
            });
            if (note) s += `<text x="220" y="284" text-anchor="middle" font-size="14.5" font-weight="900" fill="${nc}">${note}</text>`;
            return s;
          };
          const draw = () => {
            const x = +h.querySelector('#bls').value;
            h.querySelector('#blv').textContent = x;
            const L = 2 * x + 3, R = 11, d = L - R;
            const tilt = Math.max(-13, Math.min(13, d * 1.6));
            const ok = d === 0;
            h.querySelector('#bal').innerHTML = svg('0 0 440 300',
              beam(tilt, `2x+3 = ${L}`, `${R}`, ok ? `✓ 平衡！x = ${x} 是解` : `左右不相等，x = ${x} 不是解`, ok ? C : '#657187'));
          };
          h.querySelector('#bls').oninput = draw; draw();
        },
        caption: '方程式像天平：找到讓兩邊等重的那個數，就是解。',
        example: {
          q: '\\(x=3\\) 是不是 \\(4x-5=2x+1\\) 的解？',
          steps: ['左式：\\(4\\times3-5=7\\)。', '右式：\\(2\\times3+1=7\\)。', '兩邊相等。'],
          ans: '是，\\(x=3\\) 是解'
        }
      },

      {
        sec: '3-2', secName: '等量公理',
        title: '等量公理：天平兩邊做一模一樣的事',
        points: [
          '兩邊<b>同加、同減</b>一個數，等式仍成立；兩邊<b>同乘、同除</b>同一個數（除數不為 0）也成立。',
          '解方程式就是反覆用等量公理，把 \\(x\\) <b>單獨留下來</b>，其他通通趕到另一邊。',
          '拖步驟滑桿，看 \\(2x+3=11\\) 怎麼一步步變成 \\(x=4\\)，最後別忘了<b>代回驗算</b>。'
        ],
        formula: { label: '等量公理', tex: 'a=b\\;\\Rightarrow\\;a\\pm c=b\\pm c,\\quad ac=bc,\\quad \\dfrac{a}{c}=\\dfrac{b}{c}\\;(c\\neq0)' },
        visual: (h) => {
          const beam = (lt, rt, note, nc) => {
            const cx = 220, cy = 115, half = 134;
            let s = SV.poly([[cx, cy + 5], [cx - 32, 248], [cx + 32, 248]], '#e4e9f2', '#8a94a6', 2);
            s += SV.seg(148, 248, 292, 248, '#8a94a6', 3.4);
            s += SV.seg(cx - half, cy, cx + half, cy, '#5b6478', 6);
            s += SV.dot(cx, cy, '#5b6478', 6);
            [[cx - half, lt, BLU], [cx + half, rt, RED]].forEach(p => {
              const px = p[0];
              s += SV.seg(px, cy, px, cy + 32, '#8a94a6', 2);
              s += `<rect x="${px - 66}" y="${cy + 32}" width="132" height="40" rx="10" fill="#fff" stroke="${p[2]}" stroke-width="2.2"/>`;
              s += `<text x="${px}" y="${cy + 58}" text-anchor="middle" font-size="16" font-weight="900" fill="${p[2]}">${p[1]}</text>`;
            });
            s += `<text x="220" y="284" text-anchor="middle" font-size="14.5" font-weight="900" fill="${nc || '#657187'}">${note}</text>`;
            return s;
          };
          SV.stepper(h, '0 0 440 300', [
            { t: '原式 <b>2x + 3 = 11</b>，天平兩邊一樣重。', d: () => beam('2x + 3', '11', '起點：兩邊等重') },
            { t: '兩邊<b>同減 3</b>，天平還是平的。', d: () => beam('2x', '8', '兩邊各拿掉 3', BLU) },
            { t: '兩邊<b>同除以 2</b>，各留一半。', d: () => beam('x', '4', '兩邊各除以 2', VIO) },
            { t: '得 <b>x = 4</b>；代回原式驗算。', d: () => beam('2×4 + 3', '11', '✓ 驗算成立，x = 4', C) }
          ], { acc: false });
        },
        caption: '天平不會偏掉的秘訣：<b>左邊做什麼，右邊就做什麼</b>。',
        example: {
          q: '用等量公理解 \\(3x-7=8\\)。',
          steps: ['兩邊同加 7：\\(3x=15\\)。', '兩邊同除以 3：\\(x=5\\)。', '驗算：\\(3\\times5-7=8\\) ✓。'],
          ans: '\\(x=5\\)'
        }
      },

      {
        sec: '3-2', secName: '移項法則',
        title: '移項法則：跨過等號就要變號',
        points: [
          '移項是等量公理的<b>速記版</b>：\\(+3\\) 搬過去變 \\(-3\\)、\\(-7\\) 搬過去變 \\(+7\\)。',
          '策略：<b>含 \\(x\\) 的項全部移到一邊、常數項全部移到另一邊</b>，再合併同類項。',
          '乘除也能移：\\(3x=15\\Rightarrow x=15\\div 3\\)；<b>係數是負的</b>時，除完負號要留著。'
        ],
        formula: { label: '移項', tex: 'x+a=b\\;\\Rightarrow\\;x=b-a,\\qquad 3x=15\\;\\Rightarrow\\;x=\\dfrac{15}{3}' },
        visual: (h) => {
          const T = (x, y, t, c, fs) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${fs || 22}" font-weight="900" fill="${c || '#172033'}">${t}</text>`;
          h.innerHTML = svg('0 0 440 275', `
            ${SV.arrowDefs(RED, 'mv9')}${SV.arrowDefs(VIO, 'mv9v')}
            <text x="30" y="30" font-size="12.5" font-weight="800" fill="#657187">加減的移項</text>
            ${T(120, 88, '2x')}${T(168, 88, '+ 3', RED)}${T(216, 88, '=')}${T(262, 88, '11')}
            <path d="M168,66 Q220,26 300,66" fill="none" stroke="${RED}" stroke-width="2.4" marker-end="url(#mv9)"/>
            ${T(232, 22, '搬過等號 → 變號', RED, 13)}
            ${T(220, 126, '2x = 11 − 3 = 8', C, 20)}
            <line x1="30" y1="150" x2="410" y2="150" stroke="#cdd6e2" stroke-width="1.6" stroke-dasharray="6 5"/>
            <text x="30" y="176" font-size="12.5" font-weight="800" fill="#657187">乘除的移項</text>
            ${T(150, 226, '3', VIO)}${T(172, 226, 'x')}${T(212, 226, '=')}${T(252, 226, '15')}
            <path d="M150,204 Q205,168 288,204" fill="none" stroke="${VIO}" stroke-width="2.4" marker-end="url(#mv9v)"/>
            ${T(220, 162, '× 3 搬過去 → ÷ 3', VIO, 13)}
            ${T(220, 262, 'x = 15 ÷ 3 = 5', C, 20)}`);
        },
        caption: '移項只是「兩邊同加同減」寫快一點，代價是<b>一定要記得變號</b>。',
        example: {
          q: '解 \\(5x+4=3x-6\\)。',
          steps: ['\\(x\\) 項移左、常數移右：\\(5x-3x=-6-4\\)。', '\\(2x=-10\\)。', '\\(x=-5\\)。'],
          ans: '\\(x=-5\\)'
        }
      },

      {
        sec: '3-2', secName: '解題流程',
        title: '有分數先乘掉、有括號先拆開，最後才移項',
        points: [
          '標準流程：<b>去分母 → 去括號 → 移項 → 合併同類項 → 係數化為 1</b>。',
          '去分母＝兩邊同乘<b>各分母的最小公倍數</b>，<b>每一項都要乘到</b>，包含等號右邊的常數。',
          '看到小數就同乘 10 或 100，先變成整數係數再解，錯誤率會低很多。'
        ],
        formula: { label: '去分母', tex: '\\dfrac{x}{2}+\\dfrac{x-1}{3}=3\\;\\xrightarrow{\\;\\times 6\\;}\\;3x+2(x-1)=18' },
        visual: (h) => {
          // 原式 x/2 + (x−1)/3 = 3 固定在上方（分數線自己畫），下方隨步驟演進
          const frac = (cx, num, den, hw, hi) => {
            let s = `<text x="${cx}" y="86" text-anchor="middle" font-size="20" font-weight="800" fill="#172033">${num}</text>`;
            s += `<line x1="${cx - hw}" y1="96" x2="${cx + hw}" y2="96" stroke="#172033" stroke-width="2.4"/>`;
            s += `<text x="${cx}" y="122" text-anchor="middle" font-size="20" font-weight="800" fill="${hi ? BLU : '#172033'}">${den}</text>`;
            if (hi) s += `<circle cx="${cx}" cy="115" r="17" fill="none" stroke="${BLU}" stroke-width="2.6" stroke-dasharray="5 4" opacity="${hi}"/>`;
            return s;
          };
          const eq = (hi, red3) =>
            frac(104, 'x', '2', 20, hi) +
            `<text x="154" y="104" text-anchor="middle" font-size="22" font-weight="800" fill="#172033">＋</text>` +
            frac(218, 'x − 1', '3', 36, hi) +
            `<text x="288" y="104" text-anchor="middle" font-size="22" font-weight="800" fill="#172033">＝</text>` +
            `<text x="342" y="105" text-anchor="middle" font-size="24" font-weight="900" fill="${red3 ? RED : '#172033'}">3</text>` +
            (red3 ? `<rect x="318" y="82" width="48" height="40" rx="10" fill="none" stroke="${RED}" stroke-width="2.6" stroke-dasharray="6 4" opacity="${red3}"/>` : '');
          // ×6 徽章：落在某一項的正上方
          const badge = (x, col, alert, y2) =>
            (alert ? `<circle cx="${x}" cy="38" r="25" fill="none" stroke="${RED}" stroke-width="2.4" stroke-dasharray="5 4"/>` : '') +
            `<circle cx="${x}" cy="38" r="18" fill="#fff" stroke="${col}" stroke-width="2.4"/>` +
            `<text x="${x}" y="44" text-anchor="middle" font-size="14" font-weight="900" fill="${col}">×6</text>` +
            `<line x1="${x}" y1="${alert ? 64 : 57}" x2="${x}" y2="${y2}" stroke="${col}" stroke-width="2" stroke-dasharray="4 3"/>`;
          const op = k => (0.2 + 0.8 * k).toFixed(2);
          SV.stepper(h, '0 0 440 280', [
            {
              t: '先找<b>分母的最小公倍數</b>：2 與 3 的最小公倍數是 <b>6</b>。',
              d: k => eq(op(k), 0) +
                `<rect x="100" y="168" width="240" height="52" rx="14" fill="#eef4ff" stroke="${BLU}" stroke-width="2.4" opacity="${op(k)}"/>` +
                `<text x="220" y="201" text-anchor="middle" font-size="18" font-weight="900" fill="${BLU}" opacity="${op(k)}">2、3 的最小公倍數 ＝ 6</text>` +
                `<text x="220" y="252" text-anchor="middle" font-size="13" fill="#657187">兩邊同乘 6，分母就會被約掉</text>`
            },
            {
              t: '<b>6 要乘到每一項</b>，共三項——右邊的常數 3 最常被漏乘。',
              d: k => eq(0, op(k)) +
                badge(104, BLU, 0, 70) + badge(218, BLU, 0, 70) + badge(342, RED, 1, 80) +
                `<text x="220" y="180" text-anchor="middle" font-size="18" font-weight="900" fill="#172033">左邊兩項 ＋ 右邊一項 ＝ 三項</text>` +
                `<text x="220" y="212" text-anchor="middle" font-size="15" font-weight="900" fill="${RED}">右邊的常數 3 也要乘 6 → 18</text>` +
                `<text x="220" y="248" text-anchor="middle" font-size="13" fill="#657187">只乘有分母的那兩項，是最常見的失分點</text>`
            },
            {
              t: '約分後分母都不見了：<b>3x + 2(x − 1) = 18</b>。',
              d: k => eq(0, 0) +
                `<text x="220" y="162" text-anchor="middle" font-size="18" font-weight="900" fill="#a9b2c2">↓ 約分</text>` +
                `<text x="220" y="206" text-anchor="middle" font-size="21" font-weight="900" fill="${C}" opacity="${op(k)}">3x ＋ 2(x − 1) ＝ 18</text>` +
                `<text x="220" y="246" text-anchor="middle" font-size="13" fill="#657187">6÷2＝3、6÷3＝2，係數全變成整數</text>`
            },
            {
              t: '去括號、移項、合併：<b>5x = 20</b>，所以 <b>x = 4</b>。',
              d: k => eq(0, 0) +
                `<text x="220" y="160" text-anchor="middle" font-size="17" font-weight="800" fill="#172033">3x ＋ 2x − 2 ＝ 18</text>` +
                `<text x="220" y="188" text-anchor="middle" font-size="17" font-weight="800" fill="${VIO}">5x ＝ 18 ＋ 2 ＝ 20</text>` +
                `<rect x="146" y="204" width="148" height="46" rx="14" fill="#eef7f2" stroke="${C}" stroke-width="2.4" opacity="${op(k)}"/>` +
                `<text x="220" y="236" text-anchor="middle" font-size="25" font-weight="900" fill="${C}" opacity="${op(k)}">x ＝ 4</text>` +
                `<text x="220" y="270" text-anchor="middle" font-size="12.5" fill="#657187">驗算：4÷2 ＋ (4−1)÷3 ＝ 2 ＋ 1 ＝ 3 ✓</text>`
            }
          ], { acc: false });
        },
        caption: '拖步驟滑桿，看 6 怎麼乘到<b>三個項</b>上，分母一個一個消失。',
        example: {
          q: '解 \\(\\dfrac{x+1}{2}-\\dfrac{x}{3}=1\\)。',
          steps: ['兩邊同乘 6：\\(3(x+1)-2x=6\\)。', '去括號：\\(3x+3-2x=6\\)。', '合併同類項：\\(x+3=6\\Rightarrow x=3\\)。'],
          ans: '\\(x=3\\)'
        }
      },

      {
        sec: '3-2', secName: '易錯提醒',
        title: '【易錯】解方程式最常掉的三個坑',
        points: [
          '✗ 去分母只乘有分母的項；✓ <b>等號兩邊每一項</b>都要乘，常數也不例外。',
          '✗ 移項忘記變號；✓ 只要跨過等號，<b>符號一定相反</b>。',
          '✗ \\(-2x=6\\) 直接寫 \\(x=3\\)；✓ 兩邊同除以 \\(-2\\)，答案是 \\(x=-3\\)。'
        ],
        formula: { label: '最後一步別忘了', tex: '-2x=6\\;\\Rightarrow\\;x=\\dfrac{6}{-2}=-3' },
        visual: (h) => {
          h.innerHTML = badGood([
            { bad: '\\dfrac{x}{2}+1=3\\;\\Rightarrow\\;x+1=3', good: '\\dfrac{x}{2}+1=3\\;\\Rightarrow\\;x+2=6', tip: '兩邊同乘 2 時，\\(+1\\) 與 \\(=3\\) 都要乘' },
            { bad: '2x+5=9\\;\\Rightarrow\\;2x=9+5', good: '2x+5=9\\;\\Rightarrow\\;2x=9-5', tip: '\\(+5\\) 移過等號變 \\(-5\\)' },
            { bad: '-2x=6\\;\\Rightarrow\\;x=3', good: '-2x=6\\;\\Rightarrow\\;x=-3', tip: '除以負係數，負號不會自己消失' }
          ]);
        },
        caption: '解完一定<b>代回原式</b>算一遍，這三個坑當場就會被抓出來。',
        example: {
          q: '解 \\(\\dfrac{2x-1}{3}=x+1\\)。',
          steps: ['兩邊同乘 3：\\(2x-1=3(x+1)\\)。', '\\(2x-1=3x+3\\Rightarrow -x=4\\)。', '兩邊同除以 \\(-1\\)：\\(x=-4\\)。'],
          ans: '\\(x=-4\\)'
        }
      },

      /* ---------- 3-3 應用問題 ---------- */
      {
        sec: '3-3', secName: '解題五步驟',
        title: '應用問題五步驟：設、列、解、驗、答',
        points: [
          '<b>設</b>：題目問什麼就設什麼；若量太多，就設<b>最基本（通常最小）</b>的那個為 \\(x\\)。',
          '<b>列</b>：找出題目裡表示「相等」的那句話，那句話就是等號的位置。',
          '<b>解 → 驗 → 答</b>：解完代回<b>原題意</b>檢查，作答一定要寫單位。'
        ],
        formula: { label: '列式的關鍵', tex: '\\text{找出「一樣多」的那句話}\\;\\Rightarrow\\;\\text{等號}' },
        visual: (h) => {
          const rows = [
            { t: '① 設　題目問什麼就設什麼', c: C, bg: '#eef7f2' },
            { t: '② 列　把「相等」寫成等式', c: BLU, bg: '#eef4ff' },
            { t: '③ 解　去分母、去括號、移項', c: AMB, bg: '#fdf3e6' },
            { t: '④ 驗　代回原題意檢查合理', c: VIO, bg: '#f3eeff' },
            { t: '⑤ 答　寫出單位與完整答句', c: RED, bg: '#fdeef2' }
          ];
          let s = SV.arrowDefs('#8a94a6', 'fa12');
          rows.forEach((r, i) => {
            const y = 10 + i * 56;
            s += fbx(60, y, 320, 42, r.bg, r.c, [{ t: r.t, fs: 15, c: r.c, dy: 27 }]);
            if (i < rows.length - 1) s += `<line x1="220" y1="${y + 44}" x2="220" y2="${y + 54}" stroke="#8a94a6" stroke-width="2.4" marker-end="url(#fa12)"/>`;
          });
          h.innerHTML = svg('0 0 440 300', s);
        },
        caption: '五步驟裡最容易被跳過的是<b>④ 驗</b>——會考很愛出「答案不合題意」。',
        example: {
          q: '兩數的和是 30，大數是小數的 4 倍，求這兩個數。',
          steps: ['設小數為 \\(x\\)，則大數為 \\(4x\\)。', '\\(x+4x=30\\Rightarrow 5x=30\\Rightarrow x=6\\)。'],
          ans: '小數 6、大數 24'
        }
      },

      {
        sec: '3-3', secName: '設未知數',
        title: '設誰當 x，決定式子好不好列',
        points: [
          '倍數關係：<b>設較小的量為 \\(x\\)</b>，另一個直接寫成 \\(4x\\) 或 \\(x+5\\)，全程只用一個未知數。',
          '連續整數設 \\(x,\\;x+1,\\;x+2\\)；連續<b>偶數或奇數</b>則是 \\(x,\\;x+2,\\;x+4\\)。',
          '兩位數要用<b>位值</b>拆開：十位 \\(a\\)、個位 \\(b\\) 的兩位數是 \\(10a+b\\)，<b>不是</b> \\(ab\\)。'
        ],
        formula: { label: '常見設法', tex: '\\text{連續整數}:x,\\,x+1,\\,x+2;\\qquad \\text{兩位數}:10a+b' },
        visual: (h) => {
          let s = `<text x="30" y="26" font-size="12.5" font-weight="800" fill="#657187">連續整數：一次只設一個 x</text>`;
          s += SV.seg(40, 62, 400, 62, '#8a94a6', 2.4);
          [[120, 'x'], [220, 'x+1'], [320, 'x+2']].forEach(p => {
            s += SV.dot(p[0], 62, C, 6);
            s += `<text x="${p[0]}" y="90" text-anchor="middle" font-size="15" font-weight="900" fill="${C}">${p[1]}</text>`;
          });
          s += `<text x="170" y="48" text-anchor="middle" font-size="12" font-weight="800" fill="${RED}">+1</text>`;
          s += `<text x="270" y="48" text-anchor="middle" font-size="12" font-weight="800" fill="${RED}">+1</text>`;
          s += `<line x1="30" y1="112" x2="410" y2="112" stroke="#cdd6e2" stroke-width="1.6" stroke-dasharray="6 5"/>`;
          s += `<text x="30" y="138" font-size="12.5" font-weight="800" fill="#657187">兩位數：用位值拆開</text>`;
          s += fbx(78, 152, 120, 58, '#eef4ff', BLU, [{ t: '十位 a', fs: 15, c: BLU, dy: 25 }, { t: '× 10', fs: 13, c: '#657187' }]);
          s += `<text x="220" y="188" text-anchor="middle" font-size="22" font-weight="900" fill="#172033">＋</text>`;
          s += fbx(242, 152, 120, 58, '#eef7f2', C, [{ t: '個位 b', fs: 15, c: C, dy: 25 }, { t: '× 1', fs: 13, c: '#657187' }]);
          s += `<text x="220" y="240" text-anchor="middle" font-size="19" font-weight="900" fill="#172033">兩位數 = 10a + b</text>`;
          s += `<text x="220" y="266" text-anchor="middle" font-size="13" fill="#657187">例：47 = 10×4 + 7；數字對調後為 10b + a</text>`;
          h.innerHTML = svg('0 0 440 285', s);
        },
        caption: '設得好，方程式就短；設錯了，式子會多一堆用不到的字母。',
        example: {
          q: '三個連續整數的和是 51，求最小的整數。',
          steps: ['設三數為 \\(x,\\,x+1,\\,x+2\\)。', '\\(3x+3=51\\Rightarrow 3x=48\\)。', '\\(x=16\\)。'],
          ans: '最小是 16'
        }
      },

      {
        sec: '3-3', secName: '年齡問題',
        title: '年齡問題：兩人的年齡差永遠不變',
        points: [
          '幾年後<b>兩人都要加</b>同樣的年數、幾年前<b>都要減</b>——所以<b>年齡差固定</b>，變的只有倍數。',
          '設「\\(x\\) 年後」：父 \\(40+x\\)、子 \\(10+x\\)，再把倍數關係寫成等式。',
          '拖滑桿看幾年後，父親的年齡剛好是兒子的 2 倍。'
        ],
        formula: { label: '年齡關係', tex: '40+x=2(10+x)\\;\\Rightarrow\\;x=20' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="age"></div>
            <div class="ictrl"><label>幾年後 <span class="ival" id="agv">0</span> 年</label>
            <input type="range" id="ags" min="0" max="30" step="1" value="0"></div></div>`;
          const draw = () => {
            const x = +h.querySelector('#ags').value;
            h.querySelector('#agv').textContent = x;
            const F = 40 + x, S = 10 + x, k = 4.3, x0 = 76;
            const r = (F / S).toFixed(2), ok = Math.abs(F / S - 2) < 0.001;
            let s = `<text x="30" y="34" font-size="13" font-weight="800" fill="${BLU}">父</text>`;
            s += `<rect x="${x0}" y="16" width="${F * k}" height="36" rx="8" fill="${BLU}" opacity="0.85"/>`;
            s += `<text x="${x0 + F * k + 10}" y="41" font-size="14" font-weight="900" fill="${BLU}">${F} 歲</text>`;
            s += `<text x="30" y="104" font-size="13" font-weight="800" fill="${C}">子</text>`;
            s += `<rect x="${x0}" y="86" width="${S * k}" height="36" rx="8" fill="${C}" opacity="0.85"/>`;
            s += `<text x="${x0 + S * k + 10}" y="111" font-size="14" font-weight="900" fill="${C}">${S} 歲</text>`;
            s += SV.seg(x0 + S * k, 140, x0 + F * k, 140, RED, 3);
            s += `<text x="${x0 + (S + F) * k / 2}" y="164" text-anchor="middle" font-size="13" font-weight="900" fill="${RED}">年齡差 ${F - S} 歲（永遠不變）</text>`;
            s += fbx(70, 186, 300, 54, ok ? '#eef7f2' : '#f4f7fb', ok ? C : '#c3ccdb', [
              { t: `父 ÷ 子 = ${F} ÷ ${S} = ${r}`, fs: 16, c: '#172033', dy: 24 },
              { t: ok ? `✓ 剛好 2 倍！答案是 ${x} 年後` : '還不是 2 倍，繼續拖', fs: 13, c: ok ? C : '#657187' }
            ]);
            h.querySelector('#age').innerHTML = svg('0 0 440 280', s);
          };
          h.querySelector('#ags').oninput = draw; draw();
        },
        caption: '年齡差是題目給你的<b>不變量</b>，倍數關係則隨時間改變。',
        example: {
          q: '今年母親 38 歲、女兒 8 歲，幾年後母親的年齡是女兒的 3 倍？',
          steps: ['設 \\(x\\) 年後：\\(38+x=3(8+x)\\)。', '\\(38+x=24+3x\\Rightarrow 2x=14\\)。', '\\(x=7\\)。'],
          ans: '7 年後'
        }
      },

      {
        sec: '3-3', secName: '速率問題',
        title: '相遇把距離相加、追及把距離相減',
        points: [
          '骨架永遠是 <b>距離＝速率 × 時間</b>；列式前先把<b>單位統一</b>（時與分不能混用）。',
          '<b>相遇</b>（相向而行）：兩人各自走的距離<b>相加</b>＝一開始的總距離。',
          '<b>追及</b>（同向而行）：快的距離<b>減</b>慢的距離＝一開始的差距。拖滑桿看相遇的瞬間。'
        ],
        formula: { label: '兩種模型', tex: '\\text{相遇}:\\;60t+40t=300;\\qquad \\text{追及}:\\;60t-40t=\\text{差距}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="mt"></div>
            <div class="ictrl"><label>經過 <span class="ival" id="mtv">0.0</span> 分鐘</label>
            <input type="range" id="mts" min="0" max="3" step="0.1" value="0"></div></div>`;
          const X = m => 40 + m * 1.2;
          const draw = () => {
            const t = +h.querySelector('#mts').value;
            h.querySelector('#mtv').textContent = t.toFixed(1);
            const a = 60 * t, b = 300 - 40 * t, met = Math.abs(b - a) < 0.001;
            let s = SV.seg(40, 118, 400, 118, '#dfe6f0', 8);
            s += SV.seg(40, 118, X(a), 118, BLU, 8);
            s += SV.seg(X(b), 118, 400, 118, RED, 8);
            s += `<text x="40" y="152" text-anchor="middle" font-size="11" fill="#96a0b3">0</text>`;
            s += `<text x="400" y="152" text-anchor="middle" font-size="11" fill="#96a0b3">300 公尺</text>`;
            s += SV.dot(X(a), 118, BLU, 8) + SV.dot(X(b), 118, RED, 8);
            s += `<text x="${X(a) - 11}" y="98" text-anchor="middle" font-size="13" font-weight="900" fill="${BLU}">甲</text>`;
            s += `<text x="${X(b) + 11}" y="98" text-anchor="middle" font-size="13" font-weight="900" fill="${RED}">乙</text>`;
            s += `<text x="30" y="40" font-size="13" font-weight="800" fill="${BLU}">甲：每分 60 公尺 →</text>`;
            s += `<text x="410" y="40" text-anchor="end" font-size="13" font-weight="800" fill="${RED}">← 乙：每分 40 公尺</text>`;
            s += `<text x="120" y="188" text-anchor="middle" font-size="14" font-weight="900" fill="${BLU}">甲走 ${a.toFixed(0)}</text>`;
            s += `<text x="220" y="188" text-anchor="middle" font-size="16" font-weight="900" fill="#172033">＋</text>`;
            s += `<text x="320" y="188" text-anchor="middle" font-size="14" font-weight="900" fill="${RED}">乙走 ${(40 * t).toFixed(0)}</text>`;
            s += fbx(80, 208, 280, 46, met ? '#eef7f2' : '#f4f7fb', met ? C : '#c3ccdb', [{
              t: met ? '✓ 相遇！60t + 40t = 300，t = 3' : `還差 ${(b - a).toFixed(0)} 公尺`,
              fs: 15, c: met ? C : '#657187', dy: 29
            }]);
            h.querySelector('#mt').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#mts').oninput = draw; draw();
        },
        caption: '相向而行時，兩段藍紅線段合起來剛好是全長，這就是「距離相加」。',
        example: {
          q: '兩地相距 300 公尺，甲每分鐘走 60 公尺、乙每分鐘走 40 公尺，兩人同時相向出發，幾分鐘後相遇？',
          steps: ['設 \\(t\\) 分鐘後相遇：\\(60t+40t=300\\)。', '\\(100t=300\\Rightarrow t=3\\)。'],
          ans: '3 分鐘後相遇'
        }
      },

      {
        sec: '3-3', secName: '易錯提醒',
        title: '【易錯】打折是乘不是減，答案還要合題意',
        points: [
          '✗ 打八折寫成「定價 \\(-0.8\\)」；✓ 打八折是<b>定價 \\(\\times 0.8\\)</b>，利潤＝售價 \\(-\\) 成本。',
          '✗ 速率用「每小時」、時間卻用「分」直接相乘；✓ 列式前先把<b>單位統一</b>。',
          '✗ 算出人數 \\(x=7.5\\) 就照抄；✓ 人數、天數必須是<b>正整數</b>，不合理就回頭檢查列式。'
        ],
        formula: { label: '打折與利潤', tex: '\\text{售價}=\\text{定價}\\times\\text{折數},\\qquad \\text{利潤}=\\text{售價}-\\text{成本}' },
        visual: (h) => {
          const k = 340 / 1250;
          let s = `<text x="40" y="34" font-size="13" font-weight="800" fill="${AMB}">定價 1250 元</text>`;
          s += `<rect x="50" y="44" width="${1250 * k}" height="38" rx="8" fill="${AMB}" opacity="0.85"/>`;
          s += `<text x="220" y="106" text-anchor="middle" font-size="14" font-weight="900" fill="${RED}">↓ 打八折 = × 0.8（不是 − 0.8）</text>`;
          s += `<text x="40" y="136" font-size="13" font-weight="800" fill="${BLU}">售價 1000 元</text>`;
          s += `<rect x="50" y="146" width="${1000 * k}" height="38" rx="8" fill="${BLU}" opacity="0.85"/>`;
          s += `<text x="40" y="212" font-size="13" font-weight="800" fill="#657187">售價再拆成成本與利潤</text>`;
          s += `<rect x="50" y="222" width="${800 * k}" height="38" rx="8" fill="#8a94a6" opacity="0.8"/>`;
          s += `<rect x="${50 + 800 * k}" y="222" width="${200 * k}" height="38" rx="8" fill="${C}" opacity="0.9"/>`;
          s += `<text x="${50 + 400 * k}" y="247" text-anchor="middle" font-size="13" font-weight="900" fill="#fff">成本 800</text>`;
          s += `<text x="${50 + 900 * k}" y="247" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">利潤 200</text>`;
          s += `<text x="220" y="286" text-anchor="middle" font-size="12.5" fill="#657187">列式：0.8x − 800 = 200</text>`;
          h.innerHTML = svg('0 0 440 300', s);
        },
        caption: '把定價、售價、成本、利潤四個量畫成長條，關係一眼就清楚。',
        example: {
          q: '某商品成本 800 元，定價 \\(x\\) 元，打八折賣出後仍賺 200 元，求定價。',
          steps: ['售價為 \\(0.8x\\)。', '\\(0.8x-800=200\\Rightarrow 0.8x=1000\\)。', '\\(x=1250\\)。'],
          ans: '定價 1250 元'
        }
      }
    ]
  });
})();
