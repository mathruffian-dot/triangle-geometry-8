/* ============ 第 4 章　一元一次不等式 ============
   依康軒課程計畫：4-1 認識一元一次不等式、4-2 解一元一次不等式
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#d97706';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }

  // 數線：把數值 xmin~xmax 對到螢幕 x0~x1，回傳 {X, s}
  function nline(y, xmin, xmax, x0, x1, opt = {}) {
    const st = opt.step || 1;
    const X = v => x0 + (v - xmin) * (x1 - x0) / (xmax - xmin);
    let s = SV.seg(x0 - 18, y, x1 + 18, y, '#5b6478', 2.2);
    s += `<path d="M${x1 + 26},${y} L${x1 + 14},${y - 5} L${x1 + 14},${y + 5} Z" fill="#5b6478"/>`;
    s += `<path d="M${x0 - 26},${y} L${x0 - 14},${y - 5} L${x0 - 14},${y + 5} Z" fill="#5b6478"/>`;
    for (let v = xmin; v <= xmax + 1e-9; v += st) {
      s += SV.seg(X(v), y - 5, X(v), y + 5, '#8a94a6', 1.6);
      s += `<text x="${X(v).toFixed(1)}" y="${y + 21}" text-anchor="middle" font-size="11.5" fill="#96a0b3">${v}</text>`;
    }
    return { X, s };
  }

  // 解的射線：a 為端點、dir=1 向右／-1 向左、closed 為實心、k 為 0~1 的動畫進度
  function ray(y, X, a, dir, closed, color, xEnd, k = 1) {
    const tip = X(a) + (xEnd - X(a)) * k;
    let s = SV.seg(X(a), y, tip, y, color, 6.5);
    if (k > 0.97) s += `<path d="M${(tip + dir * 13).toFixed(1)},${y} L${tip.toFixed(1)},${y - 6.5} L${tip.toFixed(1)},${y + 6.5} Z" fill="${color}"/>`;
    s += closed ? SV.dot(X(a), y, color, 6.5)
      : `<circle cx="${X(a)}" cy="${y}" r="6" fill="#fff" stroke="${color}" stroke-width="3"/>`;
    return s;
  }

  window.DECK.push({
    ch: 4,
    title: '一元一次不等式',
    color: C,
    sections: ['4-1 認識一元一次不等式', '4-2 解一元一次不等式'],
    slides: [

      /* ---------- 4-1 認識一元一次不等式 ---------- */
      {
        sec: '4-1', secName: '認識不等式',
        title: '先把「至少、最多」翻成不等號，再列式',
        points: [
          '五個符號：\\(\\gt\\) 大於、\\(\\lt\\) 小於、\\(\\ge\\) 大於或等於、\\(\\le\\) 小於或等於、\\(\\ne\\) 不等於。',
          '<b>至少、不少於、以上</b> 用 \\(\\ge\\)；<b>至多、不超過、以下</b> 用 \\(\\le\\)。',
          '「<b>超過</b> 450」是 \\(\\gt 450\\)（不含）；「<b>不超過</b> 450」是 \\(\\le 450\\)（含）。'
        ],
        formula: { label: '翻譯口訣', tex: '\\text{至少}\\to\\ge\\,;\\qquad \\text{至多／不超過}\\to\\le' },
        visual: (h) => {
          const row = (w, sym, ex, col, bg) => `<tr style="background:${bg}">
            <td style="border:1px solid #e6dcc8;padding:7px 8px;font-weight:800;color:#172033">${w}</td>
            <td style="border:1px solid #e6dcc8;padding:7px 8px;text-align:center;font-size:19px;font-weight:900;color:${col}">${sym}</td>
            <td style="border:1px solid #e6dcc8;padding:7px 8px;font-size:12.5px;color:#657187">${ex}</td></tr>`;
          h.innerHTML = `<div style="width:97%;margin:0 auto">
            <table style="width:100%;border-collapse:collapse;font-size:13px">
              <tr style="background:#fdf2e3">
                <th style="border:1px solid #e6dcc8;padding:8px">生活語詞</th>
                <th style="border:1px solid #e6dcc8;padding:8px">符號</th>
                <th style="border:1px solid #e6dcc8;padding:8px">例句</th></tr>
              ${row('大於、超過、多於', '&gt;', '身高超過 160 → x &gt; 160', RED, '#fff')}
              ${row('小於、少於、不足', '&lt;', '不足 100 元 → x &lt; 100', RED, '#fffdf8')}
              ${row('至少、不少於、以上', '≥', '年滿 18 歲 → x ≥ 18', GRN, '#fff')}
              ${row('至多、不超過、以下', '≤', '限重 450 → x ≤ 450', GRN, '#fffdf8')}
              ${row('不等於', '≠', '不是 5 → x ≠ 5', '#657187', '#fff')}
            </table>
            <div style="margin-top:9px;font-size:12.5px;color:#657187;text-align:center">
              有「<b>滿</b>、<b>至少</b>、<b>不超過</b>、<b>以上／以下</b>」＝<b>含端點</b>，要加等號。</div></div>`;
        },
        caption: '應用題失分第一名：把「不超過」寫成 \\(\\lt\\)。<b>含不含端點</b>要先想清楚。',
        example: {
          q: '電梯限重不超過 450 公斤，裡面已有共 180 公斤的人，再進來 \\(x\\) 公斤，如何列式？',
          steps: ['總重是 \\(180+x\\)，「不超過 450」就是 \\(\\le 450\\)。', '列出 \\(180+x\\le 450\\)。'],
          ans: '\\(180+x\\le 450\\)'
        }
      },

      {
        sec: '4-1', secName: '認識不等式',
        title: '一元一次不等式：一個未知數、次數一次、用不等號連',
        points: [
          '<span class="k">一元一次不等式</span>＝只含<b>一個</b>未知數、未知數<b>次數為 1</b>、中間是不等號。',
          '看到 \\(x^2\\)、\\(xy\\)、\\(\\dfrac1x\\) 就直接出局；中間是<b>等號</b>的那是方程式，不是不等式。',
          '先<b>整理化簡</b>再判斷，別被括號和分數騙了。'
        ],
        formula: { label: '標準長相', tex: 'ax+b\\gt 0,\\;ax+b\\ge 0,\\;ax+b\\lt 0,\\;ax+b\\le 0\\quad(a\\ne 0)' },
        visual: (h) => {
          const card = (ok, tex, why) => `<div style="border:1.5px solid ${ok ? '#cfe8dd' : '#f0c9d3'};background:${ok ? '#eef7f2' : '#fdeef2'};border-radius:12px;padding:9px 8px;text-align:center">
            <div style="font-size:12.5px;font-weight:900;color:${ok ? GRN : RED};margin-bottom:2px">${ok ? '✓ 是' : '✗ 不是'}</div>
            <div style="font-size:16px;color:#172033">\\(${tex}\\)</div>
            <div style="font-size:11.5px;color:#657187;margin-top:3px">${why}</div></div>`;
          h.innerHTML = `<div style="width:97%;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:9px">
            ${card(true, '2x-1\\le 5', '一個未知數、一次')}
            ${card(true, '3-x\\gt 0', '一個未知數、一次')}
            ${card(false, 'x^2\\gt 4', '次數是 2')}
            ${card(false, '3x+y\\lt 7', '有兩個未知數')}
            ${card(false, '\\dfrac{1}{x}\\ge 2', '未知數在分母')}
            ${card(false, '5-x=2', '是等號 → 方程式')}
          </div>`;
        },
        caption: '判斷三步：<b>幾個未知數？最高次數？中間是不是不等號？</b>',
        example: {
          q: '下列哪些是一元一次不等式：\\(2x-1\\le 5\\)、\\(x^2\\gt 4\\)、\\(3x+y\\lt 7\\)、\\(5-x=2\\)？',
          steps: ['\\(x^2\\gt 4\\) 次數為 2、\\(3x+y\\lt 7\\) 有兩個未知數。', '\\(5-x=2\\) 中間是等號，屬方程式。'],
          ans: '只有 \\(2x-1\\le 5\\)'
        }
      },

      {
        sec: '4-1', secName: '認識不等式',
        title: '不等式的解不是一個數，是一整段範圍',
        points: [
          '方程式 \\(2x+1=7\\) 只有 \\(x=3\\)；不等式 \\(2x+1>7\\) 卻有<b>無限多個</b>解。',
          '檢驗某個數是不是解：<b>代進去算算看</b>，不等式成立才是解。',
          '拖滑桿代入不同的 \\(x\\)：成立時亮綠色，這些點連起來就是<b>一整段範圍</b>。'
        ],
        formula: { label: '解是一個範圍', tex: '2x+1>7\\iff x>3' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="chk"></div>
            <div class="ictrl"><label>代入 x = <span class="ival" id="xv">5</span></label>
            <input type="range" id="xs" min="-2" max="8" step="0.5" value="5"></div></div>`;
          const draw = () => {
            const x = +h.querySelector('#xs').value;
            h.querySelector('#xv').textContent = x;
            const val = 2 * x + 1, ok = val > 7;
            const col = ok ? GRN : RED;
            const A = nline(215, -2, 8, 50, 390);
            let s = A.s;
            s += `<text x="220" y="46" text-anchor="middle" font-size="20" font-weight="900" fill="#172033">2x + 1 &gt; 7</text>`;
            s += `<text x="220" y="86" text-anchor="middle" font-size="16" font-weight="800" fill="${col}">2×(${x})+1 = ${val} ${ok ? '&gt;' : '≤'} 7　${ok ? '成立 ✓' : '不成立 ✗'}</text>`;
            s += `<text x="52" y="126" font-size="12.5" font-weight="800" fill="${GRN}">解：x &gt; 3</text>`;
            s += ray(155, A.X, 3, 1, false, GRN, 400, 1);
            s += SV.seg(A.X(x), 215, A.X(x), 168, '#c3ccdb', 1.6, '4 4');
            s += SV.dot(A.X(x), 215, col, 7);
            s += `<text x="${A.X(x).toFixed(1)}" y="252" text-anchor="middle" font-size="12.5" font-weight="900" fill="${col}">x=${x}</text>`;
            h.querySelector('#chk').innerHTML = svg('0 0 440 280', s);
          };
          h.querySelector('#xs').oninput = draw; draw();
        },
        caption: '落在綠色區間內的數<b>全都是解</b>；\\(x=3\\) 剛好卡在邊界上，不算。',
        example: {
          q: '\\(x=3\\) 是 \\(2x+1>7\\) 的解嗎？',
          steps: ['代入：\\(2\\times 3+1=7\\)。', '\\(7>7\\) 不成立（等於不算大於）。'],
          ans: '不是解'
        }
      },

      {
        sec: '4-1', secName: '認識不等式',
        title: '數線畫解：空心不含端點、實心含端點',
        points: [
          '\\(\\gt\\)、\\(\\lt\\) 端點<b>不含</b>，畫<b>空心圈 ○</b>；\\(\\ge\\)、\\(\\le\\) 端點<b>含</b>，畫<b>實心點 ●</b>。',
          '\\(x\\gt a\\) 往<b>右</b>塗、\\(x\\lt a\\) 往<b>左</b>塗，口訣「<b>大右小左</b>」。',
          '反過來也要會：看到數線圖，能寫出對應的不等式。拖滑桿看完四種畫法。'
        ],
        formula: { label: '四種樣子', tex: 'x\\gt a,\\quad x\\ge a,\\quad x\\lt a,\\quad x\\le a' },
        visual: (h) => {
          const cases = [
            { txt: 'x &gt; 3', dir: 1, closed: false, tip: '○ 空心：不含 3　　向右塗' },
            { txt: 'x ≥ 3', dir: 1, closed: true, tip: '● 實心：含 3　　向右塗' },
            { txt: 'x &lt; 3', dir: -1, closed: false, tip: '○ 空心：不含 3　　向左塗' },
            { txt: 'x ≤ 3', dir: -1, closed: true, tip: '● 實心：含 3　　向左塗' }
          ];
          const steps = cases.map(c => ({
            t: `畫 <b>${c.txt}</b>：${c.closed ? '實心' : '空心'}、${c.dir > 0 ? '向右' : '向左'}塗。`,
            d: k => {
              const A = nline(195, -2, 8, 55, 385);
              let s = A.s;
              s += ray(195, A.X, 3, c.dir, c.closed, C, c.dir > 0 ? 400 : 40, k);
              s += `<text x="220" y="66" text-anchor="middle" font-size="26" font-weight="900" fill="${C}">${c.txt}</text>`;
              s += `<text x="220" y="110" text-anchor="middle" font-size="13.5" font-weight="800" fill="#657187">${c.tip}</text>`;
              return s;
            }
          }));
          SV.stepper(h, '0 0 440 280', steps, { acc: false });
        },
        caption: '端點畫錯（空心／實心）與塗錯邊，是這一節最常見的兩個扣分點。',
        example: {
          q: '數線上 \\(-1\\) 的位置是<b>實心點</b>，且往左塗滿，寫出對應的不等式。',
          steps: ['實心 ⇒ 含端點 ⇒ 要有等號。', '向左 ⇒ 小於。'],
          ans: '\\(x\\le -1\\)'
        }
      },

      {
        sec: '4-1', secName: '認識不等式',
        title: '4-1 最常錯的四件事',
        points: [
          '✗ 「不超過 450」寫成 \\(x\\lt 450\\)　✓ <b>含端點</b>，要寫 \\(x\\le 450\\)。',
          '✗ 「超過 18 歲」寫成 \\(x\\ge 18\\)　✓ <b>不含端點</b>，要寫 \\(x\\gt 18\\)。',
          '✗ 說 \\(x\\gt 3\\) 的解是 4　✓ 大於 3 的數<b>全都是</b>解，有無限多個。',
          '✗ \\(x\\le 3\\) 畫空心又往右塗　✓ <b>有等號畫實心</b>、<b>大右小左</b>。'
        ],
        formula: { label: '兩個自問', tex: '\\text{含端點嗎？}\\to\\text{加等號}\\;;\\quad \\text{有等號嗎？}\\to\\text{畫實心}' },
        visual: (h) => {
          const th = (t) => `<th style="border:1px solid #e6dcc8;padding:7px 8px;font-size:12px">${t}</th>`;
          const row = (topic, bad, good, bg) => `<tr style="background:${bg}">
            <td style="border:1px solid #e6dcc8;padding:7px 8px;font-weight:900;color:${C};white-space:nowrap">${topic}</td>
            <td style="border:1px solid #e6dcc8;padding:7px 8px;color:${RED}">✗ ${bad}</td>
            <td style="border:1px solid #e6dcc8;padding:7px 8px;color:${GRN}">✓ ${good}</td></tr>`;
          h.innerHTML = `<div style="width:98%;margin:0 auto">
            <table style="width:100%;border-collapse:collapse;font-size:12.5px;line-height:1.5;text-align:left">
              <tr style="background:#fdf2e3">${th('項目')}${th('常見錯誤')}${th('正確做法')}</tr>
              ${row('不超過', '不超過 450 → x &lt; 450', '含端點 → x ≤ 450', '#fff')}
              ${row('超過', '超過 18 → x ≥ 18', '不含端點 → x &gt; 18', '#fffdf8')}
              ${row('解的個數', 'x &gt; 3 的解就是 4', '大於 3 的數全都是解', '#fff')}
              ${row('端點畫法', 'x ≤ 3 端點畫空心 ○', '有等號 → 實心點 ●', '#fffdf8')}
              ${row('塗色方向', 'x &lt; 3 往右塗', '大右小左 → 往左塗', '#fff')}
            </table>
            <div style="margin-top:10px;font-size:12.5px;color:#657187;text-align:center">
              考前唸一次：<b>「含端點加等號、有等號畫實心、大右小左」</b>。</div>
          </div>`;
        },
        caption: '列式前先問「<b>含不含端點</b>」，畫圖前先問「<b>有沒有等號</b>」，這一節就不會掉分。',
        example: {
          q: '「這部電梯限乘 8 人」請寫成不等式，並說明數線上 8 要畫空心還是實心。',
          steps: ['「限乘 8 人」＝最多 8 人，<b>含</b> 8，所以用 \\(\\le\\)。', '寫成 \\(x\\le 8\\)；有等號 ⇒ 端點畫<b>實心</b>，再往左塗。'],
          ans: '\\(x\\le 8\\)，8 畫實心'
        }
      },

      /* ---------- 4-2 解一元一次不等式 ---------- */
      {
        sec: '4-2', secName: '解不等式',
        title: '同乘除負數，不等號一定要轉向',
        points: [
          '兩邊<b>同加、同減</b>任何數：不等號方向<b>不變</b>。',
          '兩邊<b>同乘、同除正數</b>：方向<b>不變</b>；<b>同乘、同除負數</b>：方向<b>反轉</b>。',
          '拖滑桿把 \\(2\\lt 5\\) 兩邊同乘 \\(m\\)，看兩個點在數線上怎麼左右對調。'
        ],
        formula: { label: '三個性質', tex: 'a\\lt b\\Rightarrow a+c\\lt b+c;\\quad m\\gt 0:\\ ma\\lt mb;\\quad m\\lt 0:\\ ma\\gt mb' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="mul"></div>
            <div class="ictrl"><label>兩邊同乘 m = <span class="ival" id="mv">-2</span></label>
            <input type="range" id="ms" min="-4" max="4" step="1" value="-2"></div></div>`;
          const draw = () => {
            const m = +h.querySelector('#ms').value;
            h.querySelector('#mv').textContent = m;
            const A = nline(100, -20, 20, 45, 395, { step: 5 });
            const B = nline(215, -20, 20, 45, 395, { step: 5 });
            let s = `<text x="220" y="34" text-anchor="middle" font-size="17" font-weight="900" fill="#172033">原式　2 &lt; 5　　兩邊同乘 (${m})</text>`;
            s += A.s + B.s;
            s += SV.dot(A.X(2), 100, BLU, 6.5) + `<text x="${A.X(2).toFixed(1)}" y="86" text-anchor="middle" font-size="13" font-weight="900" fill="${BLU}">2</text>`;
            s += SV.dot(A.X(5), 100, VIO, 6.5) + `<text x="${A.X(5).toFixed(1)}" y="86" text-anchor="middle" font-size="13" font-weight="900" fill="${VIO}">5</text>`;
            if (m === 0) {
              s += `<text x="220" y="170" text-anchor="middle" font-size="14" font-weight="800" fill="#96a0b3">兩邊同乘 0 會變成 0 ＝ 0，不再是不等式（不討論）</text>`;
            } else {
              const a = 2 * m, b = 5 * m, flip = m < 0;
              s += SV.seg(A.X(2), 112, B.X(a), 200, '#c3ccdb', 1.8, '5 4');
              s += SV.seg(A.X(5), 112, B.X(b), 200, '#c3ccdb', 1.8, '5 4');
              s += SV.dot(B.X(a), 215, BLU, 6.5) + `<text x="${B.X(a).toFixed(1)}" y="201" text-anchor="middle" font-size="13" font-weight="900" fill="${BLU}">${a}</text>`;
              s += SV.dot(B.X(b), 215, VIO, 6.5) + `<text x="${B.X(b).toFixed(1)}" y="201" text-anchor="middle" font-size="13" font-weight="900" fill="${VIO}">${b}</text>`;
              s += `<text x="220" y="266" text-anchor="middle" font-size="17" font-weight="900" fill="${flip ? RED : GRN}">${a} ${flip ? '&gt;' : '&lt;'} ${b}　${flip ? '方向反轉！' : '方向不變'}</text>`;
            }
            h.querySelector('#mul').innerHTML = svg('0 0 440 280', s);
          };
          h.querySelector('#ms').oninput = draw; draw();
        },
        caption: '乘負數等於把整條數線<b>左右翻面</b>，本來在左邊的點跑到右邊，所以方向要反轉。',
        example: {
          q: '由 \\(-3\\lt 2\\) 兩邊同乘 \\(-4\\)，結果應該怎麼寫？',
          steps: ['\\(-3\\times(-4)=12\\)、\\(2\\times(-4)=-8\\)。', '乘負數 ⇒ 不等號反轉。'],
          ans: '\\(12>-8\\)'
        }
      },

      {
        sec: '4-2', secName: '解不等式',
        title: '解不等式五步驟：去分母→去括號→移項→合併→係數化 1',
        points: [
          '流程和解方程式<b>幾乎一樣</b>，只多提防一件事：<b>最後除以負係數要換向</b>。',
          '去分母時同乘<b>分母的最小公倍數</b>（是正數），方向不變。',
          '拖滑桿一步一步看完整解法，注意每一步不等號有沒有動。'
        ],
        formula: { label: '標準流程', tex: '\\text{去分母}\\to\\text{去括號}\\to\\text{移項}\\to\\text{合併}\\to\\text{係數化 }1' },
        visual: (h) => {
          const row = (y, txt, col, fs) => `<text x="220" y="${y}" text-anchor="middle" font-size="${fs || 17}" font-weight="900" fill="${col || '#172033'}">${txt}</text>`;
          const note = (y, txt, col) => `<text x="220" y="${y}" text-anchor="middle" font-size="12.5" fill="${col || '#657187'}">${txt}</text>`;
          const steps = [
            { t: '看清楚原式：兩邊的分母是 2 和 6。', d: () => row(42, '(x−2) / 2　≤　(5x+4) / 6', '#172033', 18) },
            { t: '去分母：兩邊同乘 6（正數，方向不變）。', d: () => row(92, '3(x−2)　≤　5x+4', C) + note(112, '同乘 6 是正數 → 不等號方向不變') },
            { t: '去括號：用分配律把左邊展開。', d: () => row(152, '3x−6　≤　5x+4', C) },
            { t: '移項並合併同類項。', d: () => row(194, '3x−5x　≤　4+6　⟹　−2x ≤ 10', C) + note(214, '移項只把「項」變號，不等號方向不變') },
            { t: '係數化為 1：除以 −2，方向反轉！', d: () => row(256, 'x　≥　−5', RED, 22) + note(278, '同除以 −2（負數）→ ≤ 變成 ≥', RED) }
          ];
          SV.stepper(h, '0 0 440 300', steps);
        },
        caption: '整條流程只有<b>最後一步</b>動到不等號方向，前面每一步都不能亂翻。',
        example: {
          q: '解 \\(2(x+1)\\le x-3\\)。',
          steps: ['去括號：\\(2x+2\\le x-3\\)。', '移項：\\(2x-x\\le -3-2\\)。', '合併：\\(x\\le -5\\)。'],
          ans: '\\(x\\le -5\\)'
        }
      },

      {
        sec: '4-2', secName: '解不等式',
        title: '易錯專頁：移項不換向，除以負數才換向',
        points: [
          '✗ \\(-2x\\lt 6\\Rightarrow x\\lt -3\\)：除以 \\(-2\\) 卻忘記換向。',
          '✓ \\(-2x\\lt 6\\Rightarrow x\\gt -3\\)：除以<b>負數</b>，\\(\\lt\\) 要變成 \\(\\gt\\)。',
          '✗ \\(x+3\\le 7\\Rightarrow x\\ge 4\\)：移項只把 \\(+3\\) 變 \\(-3\\)，<b>不准動不等號</b>。',
          '自保招式：解完隨便代一個數回<b>原式</b>驗算，兩秒就抓到方向錯。'
        ],
        formula: { label: '一句話記住', tex: '\\text{移項：變項的正負號}\\;;\\quad \\text{乘除負數：變不等號方向}' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '✗ 錯：除以負數沒換向', tex: '-2x\\lt 6\\;\\Rightarrow\\;x\\lt -3', color: RED, fill: '#fdeef2', border: '#f0c9d3', size: 16, pad: '9px 14px' },
            { label: '✓ 對：除以 −2，方向反轉', tex: '-2x\\lt 6\\;\\Rightarrow\\;x\\gt -3', color: GRN, fill: '#eef7f2', border: '#cfe8dd', size: 16, pad: '9px 14px', note: '代 x=0 回原式：0 &lt; 6 ✓' },
            { label: '✗ 錯：移項也跟著翻', tex: 'x+3\\le 7\\;\\Rightarrow\\;x\\ge 4', color: RED, fill: '#fdeef2', border: '#f0c9d3', size: 16, pad: '9px 14px' },
            { label: '✓ 對：移項不動不等號', tex: 'x+3\\le 7\\;\\Rightarrow\\;x\\le 4', color: GRN, fill: '#eef7f2', border: '#cfe8dd', size: 16, pad: '9px 14px' }
          ], { gap: 8 });
        },
        caption: '一次只問自己一句：「我剛剛<b>乘或除了負數嗎</b>？」沒有就不准翻。',
        example: {
          q: '解 \\(-3x+1\\ge 7\\)。',
          steps: ['移項：\\(-3x\\ge 6\\)（方向不變）。', '同除以 \\(-3\\)：\\(x\\le -2\\)（方向反轉）。', '驗算 \\(x=-3\\)：\\(-3\\times(-3)+1=10\\ge 7\\) ✓。'],
          ans: '\\(x\\le -2\\)'
        }
      },

      {
        sec: '4-2', secName: '解不等式',
        title: '先解成範圍，再到數線上抓整數解',
        points: [
          '問「最大／最小整數解」時，一定要<b>先解出範圍、再畫數線</b>，用看的最不會錯。',
          '\\(x\\le 3.5\\) 的最大整數解是 <b>3</b>（3.5 本身不是整數）。',
          '端點含不含差很大：\\(x>2\\) 的最小整數解是 <b>3</b>；\\(x\\ge 2\\) 則是 <b>2</b>。'
        ],
        formula: { label: '端點決定答案', tex: 'x>2\\Rightarrow \\text{最小整數解}=3\\;;\\quad x\\ge 2\\Rightarrow 2' },
        visual: (h) => {
          const A = nline(105, -1, 6, 55, 385);
          const B = nline(235, -1, 6, 55, 385);
          let s = `<text x="60" y="52" font-size="17" font-weight="900" fill="${C}">x ≤ 3.5</text>`;
          s += A.s + ray(105, A.X, 3.5, -1, true, C, 40, 1);
          [-1, 0, 1, 2, 3].forEach(v => { s += SV.dot(A.X(v), 105, '#fff', 4.2) + SV.dot(A.X(v), 105, '#7c4a06', 3); });
          s += SV.dot(A.X(3), 105, RED, 7);
          s += `<text x="${A.X(3).toFixed(1)}" y="82" text-anchor="middle" font-size="12.5" font-weight="900" fill="${RED}">最大整數解 3</text>`;
          s += `<text x="60" y="182" font-size="17" font-weight="900" fill="${BLU}">x &gt; 2</text>`;
          s += B.s + ray(235, B.X, 2, 1, false, BLU, 400, 1);
          [3, 4, 5, 6].forEach(v => { s += SV.dot(B.X(v), 235, '#fff', 4.2) + SV.dot(B.X(v), 235, '#1e3a8a', 3); });
          s += SV.dot(B.X(3), 235, RED, 7);
          s += `<text x="${B.X(3).toFixed(1)}" y="212" text-anchor="middle" font-size="12.5" font-weight="900" fill="${RED}">最小整數解 3</text>`;
          h.innerHTML = svg('0 0 440 280', s);
        },
        caption: '上：\\(x\\le3.5\\) 往左，最大整數是 3。下：\\(x>2\\) 空心不含 2，最小整數是 3。',
        example: {
          q: '求 \\(2x-1\\le 6\\) 的最大整數解。',
          steps: ['\\(2x\\le 7\\Rightarrow x\\le \\dfrac72=3.5\\)。', '數線上不超過 3.5 的最大整數是 3。'],
          ans: '\\(x=3\\)'
        }
      },

      {
        sec: '4-2', secName: '解不等式',
        title: '應用題：列完不等式，答案還要合現實',
        points: [
          '四步驟：<b>設未知數 → 依情境列不等式 → 解 → 依現實取整數作答</b>。',
          '「最多買幾支、至少考幾分」——解出範圍後要挑<b>合乎現實的整數</b>當答案。',
          '別忘了現實限制：<b>支數、人數、天數都是正整數</b>，答案不會是 7.2 支。'
        ],
        formula: { label: '取答口訣', tex: 'x\\le 7.2\\ \\text{且 }x\\text{ 為正整數}\\;\\Rightarrow\\;x_{\\max}=7' },
        visual: (h) => {
          const box = (y, t1, t2, col, bg) => `<rect x="70" y="${y}" width="300" height="52" rx="14" fill="${bg}" stroke="${col}" stroke-width="2"/>
            <text x="220" y="${y + 22}" text-anchor="middle" font-size="13.5" font-weight="900" fill="${col}">${t1}</text>
            <text x="220" y="${y + 41}" text-anchor="middle" font-size="13" fill="#172033">${t2}</text>`;
          const arr = y => `<path d="M220,${y} L220,${y + 14}" stroke="#8a94a6" stroke-width="2.4"/>
            <path d="M220,${y + 22} L214,${y + 10} L226,${y + 10} Z" fill="#8a94a6"/>`;
          h.innerHTML = svg('0 0 440 300', `
            ${box(14, '① 設未知數', '設買 x 支筆', BLU, '#eef4ff')}
            ${arr(66)}
            ${box(90, '② 依情境列不等式', '25x + 20 ≤ 200', C, '#fdf2e3')}
            ${arr(142)}
            ${box(166, '③ 解不等式', '25x ≤ 180　⟹　x ≤ 7.2', VIO, '#f4eefe')}
            ${arr(218)}
            ${box(242, '④ 依現實取整數作答', 'x 是正整數 → 最多買 7 支', GRN, '#eef7f2')}
          `);
        },
        caption: '解出 \\(x\\le 7.2\\) 不能直接寫 7.2；<b>回頭看題目問什麼、單位是什麼</b>再作答。',
        example: {
          q: '帶 200 元去買筆，一支 25 元，另外要留 20 元車錢，最多能買幾支？',
          steps: ['設買 \\(x\\) 支：\\(25x+20\\le 200\\)。', '\\(25x\\le 180\\Rightarrow x\\le 7.2\\)。', '\\(x\\) 為正整數，取最大的 7。'],
          ans: '最多 7 支'
        }
      }
    ]
  });
})();
