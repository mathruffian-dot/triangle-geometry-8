/* ============ 第 2 章　分數的運算 ============
   依康軒版第一冊課程計畫：2-1 因數與倍數、2-2 最大公因數與最小公倍數、
   2-3 分數的四則運算、2-4 指數律
   （舊版康軒分法為「分數的加減／分數的乘除／指數律」，內容相同，僅切分不同）
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#7c3aed';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }
  const gcd = (a, b) => b ? gcd(b, a % b) : a;

  // 通用小卡（SVG 內的圓角方框＋文字）
  function chip(x, y, w, hh, text, col, fill, fs) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="9" fill="${fill}" stroke="${col}" stroke-width="1.8"/>` +
      `<text x="${x + w / 2}" y="${y + hh / 2 + 6}" text-anchor="middle" font-size="${fs || 16}" font-weight="800" fill="${col}">${text}</text>`;
  }
  // 分數長條模型：分成 parts 格，前 filled 格塗色
  function bar(x, y, w, hh, parts, filled, col) {
    const u = w / parts;
    let s = '';
    for (let i = 0; i < parts; i++) {
      s += `<rect x="${(x + i * u).toFixed(1)}" y="${y}" width="${(u - 1.5).toFixed(1)}" height="${hh}" rx="3" fill="${i < filled ? col : '#f2f4f8'}" stroke="#cdd6e2" stroke-width="1"/>`;
    }
    return s;
  }

  window.DECK.push({
    ch: 2,
    title: '分數的運算',
    color: C,
    sections: ['2-1 因數與倍數', '2-2 最大公因數與最小公倍數', '2-3 分數的四則運算', '2-4 指數律'],
    slides: [

      /* ---------- 2-1 因數與倍數 ---------- */
      {
        sec: '2-1', secName: '因數與倍數',
        title: '因數與倍數，是同一件事的兩種說法',
        points: [
          '\\(a\\div b\\) <b>整除</b>（餘數 0），就說 \\(b\\) 是 \\(a\\) 的<span class="k">因數</span>、\\(a\\) 是 \\(b\\) 的<span class="k">倍數</span>。',
          '換成乘法看更快：\\(24=4\\times6\\)，所以 4、6 都是 24 的因數。',
          '列因數要<b>成對寫</b>：從 1 開始一組一組配，配到兩數快碰在一起就停，才不會漏。'
        ],
        formula: { label: '一句話兩個方向', tex: 'a=b\\times c\\;\\Longrightarrow\\;b,c\\text{ 都是 }a\\text{ 的因數}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fac"></div>
            <div class="ictrl"><label>選一個數 n <span class="ival" id="nv">24</span></label>
            <input type="range" id="ns" min="12" max="48" step="1" value="24"></div></div>`;
          const draw = () => {
            const n = +h.querySelector('#ns').value;
            h.querySelector('#nv').textContent = n;
            const pairs = [];
            for (let d = 1; d * d <= n; d++) if (n % d === 0) pairs.push([d, n / d]);
            let s = `<text x="220" y="26" text-anchor="middle" font-size="15" font-weight="900" fill="#172033">${n} 的因數配對</text>`;
            pairs.forEach((p, i) => {
              const y = 46 + i * 36;
              s += chip(64, y, 64, 28, p[0], C, '#f4efff', 15);
              s += `<text x="146" y="${y + 20}" text-anchor="middle" font-size="15" fill="#657187">×</text>`;
              s += chip(164, y, 64, 28, p[1], C, '#f4efff', 15);
              s += `<text x="248" y="${y + 20}" text-anchor="middle" font-size="15" fill="#657187">=</text>`;
              s += `<text x="288" y="${y + 20}" text-anchor="middle" font-size="16" font-weight="900" fill="#172033">${n}</text>`;
            });
            const all = [];
            pairs.forEach(p => { all.push(p[0]); if (p[1] !== p[0]) all.push(p[1]); });
            all.sort((a, b) => a - b);
            s += `<text x="220" y="242" text-anchor="middle" font-size="13" font-weight="800" fill="${GRN}">共 ${all.length} 個正因數</text>`;
            s += `<text x="220" y="262" text-anchor="middle" font-size="13" fill="#657187">${all.join('、')}</text>`;
            h.querySelector('#fac').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#ns').oninput = draw; draw();
        },
        caption: '因數永遠<b>成對出現</b>；配到兩個數快碰在一起，就代表全部找完了。',
        example: {
          q: '列出 36 的所有正因數，共幾個？',
          steps: ['成對配：\\(1\\times36,\\;2\\times18,\\;3\\times12,\\;4\\times9,\\;6\\times6\\)。', '把配對拆開由小到大排（6 只算一次）。'],
          ans: '1、2、3、4、6、9、12、18、36，共 9 個'
        }
      },

      {
        sec: '2-1', secName: '倍數判別法',
        title: '倍數判別法：看末位，或看數字和',
        points: [
          '<b>2</b> 看末位是不是偶數；<b>5</b> 看末位 0 或 5；<b>4</b> 看<b>末兩位</b>是不是 4 的倍數。',
          '<b>3</b> 與 <b>9</b>：把<b>各位數字加起來</b>，和是 3（或 9）的倍數就是。',
          '<b>11</b>：奇數位數字和 − 偶數位數字和，是 11 的倍數（含 0）。',
          '判別法是質因數分解前的<b>試除工具</b>，省下大量嘗試。'
        ],
        formula: { label: '3 與 9 的判別', tex: '3672:\\;3+6+7+2=18\\;\\Rightarrow\\;3\\text{ 與 }9\\text{ 的倍數}' },
        visual: (h) => {
          const row = (k, rule, ex, col, bg) => `<tr style="background:${bg}">
            <td style="border:1px solid #dce3ee;padding:7px 6px;font-weight:900;color:${col};font-size:15px">${k}</td>
            <td style="border:1px solid #dce3ee;padding:7px 8px;text-align:left">${rule}</td>
            <td style="border:1px solid #dce3ee;padding:7px 6px">${ex}</td></tr>`;
          h.innerHTML = `<div style="width:97%;margin:0 auto;padding-top:16px">
            <table style="width:100%;border-collapse:collapse;font-size:12.5px;text-align:center;color:#172033">
              <tr style="background:#f4efff">
                <th style="border:1px solid #dce3ee;padding:7px">倍數</th>
                <th style="border:1px solid #dce3ee;padding:7px">怎麼看</th>
                <th style="border:1px solid #dce3ee;padding:7px">例</th></tr>
              ${row('2', '末位是<b>偶數</b>', '13<b>8</b> ✓', C, '#fff')}
              ${row('5', '末位是 <b>0</b> 或 <b>5</b>', '24<b>5</b> ✓', C, '#fbfaff')}
              ${row('4', '<b>末兩位</b>是 4 的倍數', '3<b>16</b> ✓', BLU, '#fff')}
              ${row('3', '<b>各位數字和</b>是 3 的倍數', '471 → 12 ✓', GRN, '#fbfaff')}
              ${row('9', '<b>各位數字和</b>是 9 的倍數', '4716 → 18 ✓', GRN, '#fff')}
              ${row('11', '奇位和 − 偶位和 是 11 的倍數', '2508 → 13−2=11 ✓', AMB, '#fbfaff')}
            </table>
            <div style="margin-top:10px;font-size:12.5px;color:#657187;text-align:center">
              注意：是 3 的倍數<b>不一定</b>是 9 的倍數（如 471），但是 9 的倍數<b>一定</b>是 3 的倍數。</div>
          </div>`;
        },
        caption: '「末位型」看尾巴，「數字和型」把每位數加起來——兩類分清楚就不會亂。',
        example: {
          q: '判斷 2508 是不是 4、9、11 的倍數。',
          steps: ['末兩位 08 是 4 的倍數 ⇒ 是 4 的倍數。', '數字和 \\(2+5+0+8=15\\)，是 3 的倍數但<b>不是</b> 9 的倍數。', '奇位和 \\(8+5=13\\)、偶位和 \\(0+2=2\\)，差 11 ⇒ 是 11 的倍數。'],
          ans: '是 4、11 的倍數，不是 9 的倍數'
        }
      },

      {
        sec: '2-1', secName: '質數與合數',
        title: '質數：只有 1 和自己兩個正因數',
        points: [
          '<span class="k">質數</span>：<b>恰好</b>只有 1 和它本身兩個正因數（2、3、5、7、11…）。',
          '<span class="k">合數</span>：正因數超過兩個。<b>1 既不是質數也不是合數</b>。',
          '<b>2 是唯一的偶質數</b>；其他偶數都被 2 整除，一定是合數。',
          '拖滑桿看<b>篩法</b>：把 2、3、5、7 的倍數劃掉，剩下的就是質數。'
        ],
        formula: { label: '100 以內質數共 25 個', tex: '2,3,5,7,11,13,17,19,23,\\dots,97' },
        visual: (h) => {
          const cols = 10, cw = 41, chh = 35, ox = 16, oy = 16;
          const cell = (n, st) => {
            const i = n - 1, r = Math.floor(i / cols), c = i % cols;
            const x = ox + c * cw, y = oy + r * chh, w = cw - 5, hh = chh - 6;
            const fill = st === 'p' ? '#ede9fe' : (st === 'x' ? '#f4f5f7' : '#ffffff');
            const stk = st === 'p' ? C : '#dfe4ee';
            const tc = st === 'x' ? '#b9c0cd' : (st === 'p' ? C : '#334');
            let s = `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="6" fill="${fill}" stroke="${stk}" stroke-width="${st === 'p' ? 2 : 1}"/>`;
            s += `<text x="${x + w / 2}" y="${y + hh / 2 + 5}" text-anchor="middle" font-size="13" font-weight="${st === 'p' ? 900 : 600}" fill="${tc}">${n}</text>`;
            if (st === 'x') s += SV.seg(x + 4, y + hh - 4, x + w - 4, y + 4, RED, 1.4);
            return s;
          };
          const board = (kill, mark) => {
            let s = '';
            for (let n = 1; n <= 60; n++) s += cell(n, kill.has(n) ? 'x' : (mark ? 'p' : 'n'));
            return s;
          };
          const k1 = new Set([1]);
          const k2 = new Set(k1); for (let n = 4; n <= 60; n += 2) k2.add(n);
          const k3 = new Set(k2); for (let n = 6; n <= 60; n += 3) k3.add(n);
          const k4 = new Set(k3);
          for (let n = 10; n <= 60; n += 5) k4.add(n);
          for (let n = 14; n <= 60; n += 7) k4.add(n);
          SV.stepper(h, '0 0 440 275', [
            { t: '寫下 1~60，先把 <b>1</b> 劃掉（1 不是質數）。', d: () => board(k1, false) },
            { t: '留下 <b>2</b>，把 2 的其他倍數全部劃掉。', d: () => board(k2, false) },
            { t: '留下 <b>3</b>，把 3 的其他倍數劃掉。', d: () => board(k3, false) },
            { t: '再劃掉 <b>5</b>、<b>7</b> 的倍數，剩下的<b>全是質數</b>。', d: () => board(k4, true) }
          ], { acc: false });
        },
        caption: '60 以內只要篩掉 2、3、5、7 的倍數，留下來的就一定是質數。',
        example: {
          q: '91 是質數嗎？',
          steps: ['末位不是偶數也不是 0、5；數字和 10 不是 3 的倍數。', '再試 7：\\(91\\div7=13\\)，整除。'],
          ans: '不是質數，\\(91=7\\times13\\)'
        }
      },

      {
        sec: '2-1', secName: '質因數分解',
        title: '短除法：把整數拆成質數的連乘積',
        points: [
          '<span class="k">質因數分解</span>：把一個數寫成<b>質數連乘</b>的形式。',
          '短除法每次都用<b>質數</b>去除，除到<b>商是質數</b>為止。',
          '<span class="k">標準分解式</span>：質因數<b>由小到大</b>排好，重複的用<b>指數</b>寫。'
        ],
        formula: { label: '標準分解式', tex: '360=2\\times2\\times2\\times3\\times3\\times5=2^3\\times3^2\\times5' },
        visual: (h) => {
          const nums = [360, 180, 90, 45, 15, 5], divs = [2, 2, 2, 3, 3];
          const y0 = 34, dy = 33, xd = 118, xb = 130, xn = 176;
          const rowLine = (i) => {
            const y = y0 + i * dy;
            return `<text x="${xd}" y="${y + 6}" text-anchor="end" font-size="16" font-weight="900" fill="${C}">${divs[i]}</text>` +
              `<path d="M${xb + 78},${y - 15} L${xb},${y - 15} L${xb},${y + 16}" fill="none" stroke="#334" stroke-width="2"/>`;
          };
          const numText = (i) => `<text x="${xn}" y="${y0 + i * dy + 6}" text-anchor="middle" font-size="16" font-weight="800" fill="${i === 5 ? GRN : '#172033'}">${nums[i]}</text>`;
          const drawTo = (k) => {
            let s = '';
            for (let i = 0; i < k; i++) s += rowLine(i);
            for (let i = 0; i <= k; i++) s += numText(i);
            return s;
          };
          SV.stepper(h, '0 0 440 275', [
            { t: '用最小的質數 <b>2</b> 去除：360 ÷ 2 = 180。', d: () => drawTo(1) },
            { t: '繼續除以 2，直到不能整除：180 → 90 → 45。', d: () => drawTo(3) },
            { t: '2 除不了就換 <b>3</b>：45 → 15 → 5，商 5 是質數，停。', d: () => drawTo(5) + `<text x="300" y="${34 + 5 * 33 + 6}" font-size="13" font-weight="800" fill="${GRN}">5 是質數 → 停</text>` },
            {
              t: '左側除數與最後的商全部相乘，重複的寫成指數。', d: () => drawTo(5) +
                `<text x="248" y="60" font-size="14" font-weight="800" fill="#172033">2×2×2×3×3×5</text>` +
                `<text x="248" y="92" font-size="18" font-weight="900" fill="${C}">= 2³ × 3² × 5</text>` +
                `<rect x="238" y="38" width="180" height="70" rx="12" fill="none" stroke="${C}" stroke-width="1.8" stroke-dasharray="6 5"/>`
            }
          ], { acc: false });
        },
        caption: '短除法左側的質數，加上最後的商，全部相乘就是質因數分解。',
        example: {
          q: '把 504 寫成標準分解式。',
          steps: ['連除 2 三次：504 → 252 → 126 → 63。', '再除 3 兩次：63 → 21 → 7，商 7 是質數。', '由小到大並用指數整理。'],
          ans: '\\(504=2^3\\times3^2\\times7\\)'
        }
      },

      {
        sec: '2-1', secName: '易錯提醒',
        title: '因數倍數最常錯的四件事',
        points: [
          '✗ 把 1 當質數　✓ <b>1 既不是質數也不是合數</b>，最小的質數是 <b>2</b>。',
          '✗ \\(360=8\\times45\\) 就說分解完了　✓ 要拆到<b>每個因數都是質數</b>。',
          '✗ 標準分解式亂排　✓ 質因數<b>由小到大</b>、重複的用<b>指數</b>。',
          '✗ 因數倍數講反　✓ \\(12\\div3\\) 整除 ⇒ <b>除數 3 是因數、被除數 12 是倍數</b>。'
        ],
        formula: { label: '分解完成的標準', tex: '\\text{每個因數都是質數，且由小到大排列}' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '✗ 還沒分解完', tex: '360=8\\times45', color: RED, fill: '#fdeef2', border: '#f0c9d3', size: 18, note: '8 與 45 都不是質數' },
            { label: '✓ 標準分解式', tex: '360=2^3\\times3^2\\times5', color: GRN, fill: '#eef7f2', border: '#cfe8dd', size: 18, note: '由小到大、重複用指數' },
            { label: '一定要記住', tex: '1\\ \\text{不是質數}\\;;\\;2\\ \\text{是唯一的偶質數}', color: C, fill: '#f4efff', border: C, size: 15 }
          ], { gap: 10 });
        },
        caption: '看到答案裡還有<b>合數</b>（4、6、8、9…），就代表分解還沒做完。',
        example: {
          q: '\\(84=4\\times21\\) 是 84 的質因數分解嗎？',
          steps: ['4 與 21 都不是質數，要繼續拆。', '\\(4=2^2\\)、\\(21=3\\times7\\)。'],
          ans: '不是；\\(84=2^2\\times3\\times7\\)'
        }
      },

      /* ---------- 2-2 最大公因數與最小公倍數 ---------- */
      {
        sec: '2-2', secName: '公因數與公倍數',
        title: '公因數取共同的，最大公因數取其中最大的',
        points: [
          '兩數<b>共同</b>的因數叫<span class="k">公因數</span>，其中最大的記作 \\((a,b)\\)。',
          '兩數共同的倍數叫<span class="k">公倍數</span>，其中最小的記作 \\([a,b]\\)。',
          '公倍數有無限多個、<b>沒有最大的</b>；公因數只有有限個，<b>最小的一定是 1</b>。',
          '若 \\((a,b)=1\\)，就說兩數<span class="k">互質</span>，例如 8 與 15。'
        ],
        formula: { label: '記號', tex: '(12,18)=6\\qquad [12,18]=36' },
        visual: (h) => {
          let s = `<ellipse cx="165" cy="150" rx="118" ry="92" fill="rgba(37,99,235,0.08)" stroke="${BLU}" stroke-width="2.2"/>`;
          s += `<ellipse cx="285" cy="150" rx="118" ry="92" fill="rgba(5,150,105,0.08)" stroke="${GRN}" stroke-width="2.2"/>`;
          s += `<text x="105" y="36" text-anchor="middle" font-size="14" font-weight="900" fill="${BLU}">12 的因數</text>`;
          s += `<text x="345" y="36" text-anchor="middle" font-size="14" font-weight="900" fill="${GRN}">18 的因數</text>`;
          s += `<text x="98" y="140" text-anchor="middle" font-size="19" font-weight="800" fill="${BLU}">4</text>`;
          s += `<text x="98" y="176" text-anchor="middle" font-size="19" font-weight="800" fill="${BLU}">12</text>`;
          s += `<text x="352" y="140" text-anchor="middle" font-size="19" font-weight="800" fill="${GRN}">9</text>`;
          s += `<text x="352" y="176" text-anchor="middle" font-size="19" font-weight="800" fill="${GRN}">18</text>`;
          s += `<text x="225" y="118" text-anchor="middle" font-size="12" font-weight="900" fill="#657187">公因數</text>`;
          s += `<text x="200" y="152" text-anchor="middle" font-size="19" font-weight="800" fill="#172033">1</text>`;
          s += `<text x="225" y="152" text-anchor="middle" font-size="19" font-weight="800" fill="#172033">2</text>`;
          s += `<text x="250" y="152" text-anchor="middle" font-size="19" font-weight="800" fill="#172033">3</text>`;
          s += `<circle cx="225" cy="182" r="17" fill="${C}"/>`;
          s += `<text x="225" y="189" text-anchor="middle" font-size="19" font-weight="900" fill="#fff">6</text>`;
          s += `<text x="225" y="270" text-anchor="middle" font-size="15" font-weight="900" fill="${C}">最大公因數 (12, 18) = 6</text>`;
          h.innerHTML = svg('0 0 440 285', s);
        },
        caption: '兩個因數集合的<b>重疊區</b>就是公因數，重疊區裡最大的那個就是 \\((12,18)=6\\)。',
        example: {
          q: '求 \\((16,24)\\) 與 \\([4,6]\\)。',
          steps: ['16 的因數 1,2,4,8,16；24 的因數 1,2,3,4,6,8,12,24，共同最大為 8。', '4 的倍數 4,8,12,…；6 的倍數 6,12,…，共同最小為 12。'],
          ans: '\\((16,24)=8\\)、\\([4,6]=12\\)'
        }
      },

      {
        sec: '2-2', secName: '短除法',
        title: '短除法：左邊相乘是 GCD，L 形相乘是 LCM',
        points: [
          '把兩數<b>並排</b>短除，每次除以<b>公因數</b>，除到兩個商<b>互質</b>才停。',
          '<b>左側除數全部相乘</b> ＝ 最大公因數。',
          '<b>左側 ＋ 底列</b>（走成 L 形）全部相乘 ＝ 最小公倍數。',
          '停太早會算錯：一定要確認底下兩數<b>沒有公因數</b>了。'
        ],
        formula: { label: 'L 形口訣', tex: '[a,b]=(a,b)\\times\\text{底列兩數}' },
        visual: (h) => {
          const rows = [[2, 24, 36], [2, 12, 18], [3, 6, 9]];
          const bot = [2, 3];
          const y0 = 40, dy = 38, xd = 108, xb = 120, xA = 178, xB = 250;
          const rowLine = (i) => {
            const y = y0 + i * dy;
            return `<text x="${xd}" y="${y + 6}" text-anchor="end" font-size="17" font-weight="900" fill="${C}">${rows[i][0]}</text>` +
              `<path d="M${xb + 165},${y - 17} L${xb},${y - 17} L${xb},${y + 19}" fill="none" stroke="#334" stroke-width="2"/>` +
              `<text x="${xA}" y="${y + 6}" text-anchor="middle" font-size="17" font-weight="800" fill="#172033">${rows[i][1]}</text>` +
              `<text x="${xB}" y="${y + 6}" text-anchor="middle" font-size="17" font-weight="800" fill="#172033">${rows[i][2]}</text>`;
          };
          const botLine = () => {
            const y = y0 + 3 * dy;
            return `<text x="${xA}" y="${y + 6}" text-anchor="middle" font-size="17" font-weight="900" fill="${GRN}">${bot[0]}</text>` +
              `<text x="${xB}" y="${y + 6}" text-anchor="middle" font-size="17" font-weight="900" fill="${GRN}">${bot[1]}</text>` +
              `<text x="320" y="${y + 6}" font-size="12.5" font-weight="800" fill="${GRN}">互質 → 停</text>`;
          };
          const table = (k) => { let s = ''; for (let i = 0; i < k; i++) s += rowLine(i); return s; };
          SV.stepper(h, '0 0 440 275', [
            { t: '把 24 與 36 並排，先除以公因數 <b>2</b>。', d: () => table(1) + `<text x="${xA}" y="${y0 + dy + 6}" text-anchor="middle" font-size="17" font-weight="800" fill="#172033">12</text><text x="${xB}" y="${y0 + dy + 6}" text-anchor="middle" font-size="17" font-weight="800" fill="#172033">18</text>` },
            { t: '再除 2、再除 3，直到 2 與 3 <b>互質</b>為止。', d: () => table(3) + botLine() },
            {
              t: '<b>左側</b>相乘 2×2×3 = 12，就是最大公因數。', d: () => table(3) + botLine() +
                `<rect x="72" y="${y0 - 22}" width="44" height="${3 * dy}" rx="10" fill="none" stroke="${RED}" stroke-width="2.2"/>` +
                `<text x="222" y="240" text-anchor="middle" font-size="14" font-weight="900" fill="${RED}">(24, 36) = 2×2×3 = 12</text>`
            },
            {
              t: '再乘上<b>底列</b>：12×2×3 = 72，就是最小公倍數。', d: () => table(3) + botLine() +
                `<rect x="72" y="${y0 - 22}" width="44" height="${3 * dy}" rx="10" fill="none" stroke="${RED}" stroke-width="2.2"/>` +
                `<rect x="146" y="${y0 + 3 * dy - 20}" width="140" height="34" rx="10" fill="none" stroke="${BLU}" stroke-width="2.2"/>` +
                `<text x="222" y="240" text-anchor="middle" font-size="14" font-weight="900" fill="${BLU}">[24, 36] = 12×2×3 = 72</text>`
            }
          ], { acc: false });
        },
        caption: '同一張短除法表：只讀<b>左邊</b>得 GCD，讀<b>左邊＋底下</b>（L 形）得 LCM。',
        example: {
          q: '求 \\((18,30)\\) 與 \\([18,30]\\)。',
          steps: ['短除：除 2 得 9、15；再除 3 得 3、5，互質停。', '\\((18,30)=2\\times3=6\\)。', '\\([18,30]=6\\times3\\times5=90\\)。'],
          ans: '\\((18,30)=6\\)、\\([18,30]=90\\)'
        }
      },

      {
        sec: '2-2', secName: '標準分解式',
        title: '標準分解式：GCD 取最小指數，LCM 取最大指數',
        points: [
          '先把兩數寫成<b>標準分解式</b>，把相同的質因數<b>上下對齊</b>。',
          '<b>最大公因數</b>：只取<b>兩邊都有</b>的質因數，指數取<b>比較小</b>的。',
          '<b>最小公倍數</b>：<b>出現過</b>的質因數全都要，指數取<b>比較大</b>的。',
          '沒出現的質因數，指數當作 <b>0</b>（所以 GCD 一定不會有它）。'
        ],
        formula: { label: '例：72 與 120', tex: '72=2^3\\times3^2,\\qquad 120=2^3\\times3\\times5' },
        visual: (h) => {
          const td = (t, extra) => `<td style="border:1px solid #dce3ee;padding:7px 4px;${extra || ''}">${t}</td>`;
          h.innerHTML = `<div style="width:97%;margin:0 auto;padding-top:16px">
            <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:center;color:#172033">
              <tr style="background:#f4efff">
                <th style="border:1px solid #dce3ee;padding:7px">　</th>
                <th style="border:1px solid #dce3ee;padding:7px">2 的指數</th>
                <th style="border:1px solid #dce3ee;padding:7px">3 的指數</th>
                <th style="border:1px solid #dce3ee;padding:7px">5 的指數</th></tr>
              <tr>${td('<b>72</b>＝2³×3²', 'font-weight:700')}${td('3')}${td('2')}${td('0', 'color:#b9c0cd')}</tr>
              <tr style="background:#fbfaff">${td('<b>120</b>＝2³×3×5', 'font-weight:700')}${td('3')}${td('1')}${td('1')}</tr>
              <tr style="background:#fdeef2">${td(`<b style="color:${RED}">GCD 取小</b>`)}${td(`<b style="color:${RED}">3</b>`)}${td(`<b style="color:${RED}">1</b>`)}${td(`<b style="color:${RED}">0</b>`)}</tr>
              <tr style="background:#eef4ff">${td(`<b style="color:${BLU}">LCM 取大</b>`)}${td(`<b style="color:${BLU}">3</b>`)}${td(`<b style="color:${BLU}">2</b>`)}${td(`<b style="color:${BLU}">1</b>`)}</tr>
            </table>
            <div style="margin-top:12px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
              <div style="border:1.6px solid ${RED};border-radius:12px;padding:8px 14px;background:#fdeef2;font-size:14px;font-weight:800;color:${RED}">(72,120)＝2³×3＝24</div>
              <div style="border:1.6px solid ${BLU};border-radius:12px;padding:8px 14px;background:#eef4ff;font-size:14px;font-weight:800;color:${BLU}">[72,120]＝2³×3²×5＝360</div>
            </div></div>`;
        },
        caption: '同一欄上下比指數：<b>小的給 GCD、大的給 LCM</b>，一次就能兩個都算出來。',
        example: {
          q: '\\(a=2^2\\times3\\times5\\)、\\(b=2\\times3^2\\)，求 \\((a,b)\\) 與 \\([a,b]\\)。',
          steps: ['共同質因數 2、3，指數取小：\\(2\\times3=6\\)。', '所有質因數 2、3、5，指數取大：\\(2^2\\times3^2\\times5=180\\)。'],
          ans: '\\((a,b)=6\\)、\\([a,b]=180\\)'
        }
      },

      {
        sec: '2-2', secName: 'GCD 與 LCM',
        title: '分完剛好用 GCD，再次碰面用 LCM',
        points: [
          '✓ 分裝分組不剩、切成<b>最大的正方形</b>、剪成<b>等長</b>的段 → 用 <b>GCD</b>。',
          '✓ 兩班車<b>再次同時</b>發車、燈號<b>再次同時</b>亮、兩人<b>再度同時</b>休假 → 用 <b>LCM</b>。',
          '✗ 看到「最大」就寫 GCD、看到「最少」就寫 LCM　✓ 要看的是「<b>切下去</b>」還是「<b>疊上去</b>」。',
          '拖滑桿試不同邊長：能<b>同時整除長與寬</b>才鋪得剛剛好。'
        ],
        formula: { label: '判準', tex: '\\text{分割不剩}\\to\\text{GCD}\\qquad\\text{再度重合}\\to\\text{LCM}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="tile"></div>
            <div class="ictrl"><label>正方形邊長 <span class="ival" id="sv">6</span></label>
            <input type="range" id="ss" min="2" max="12" step="1" value="6"></div></div>`;
          const W = 36, Hh = 24, sc = 7.4, ox = 84, oy = 26;
          const draw = () => {
            const s0 = +h.querySelector('#ss').value;
            h.querySelector('#sv').textContent = s0;
            const nx = Math.floor(W / s0), ny = Math.floor(Hh / s0);
            const fit = (W % s0 === 0 && Hh % s0 === 0);
            let s = `<rect x="${ox}" y="${oy}" width="${W * sc}" height="${Hh * sc}" rx="4" fill="#f6f2ff" stroke="#b9c0cd" stroke-width="1.6"/>`;
            for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
              s += `<rect x="${(ox + i * s0 * sc).toFixed(1)}" y="${(oy + j * s0 * sc).toFixed(1)}" width="${(s0 * sc - 2).toFixed(1)}" height="${(s0 * sc - 2).toFixed(1)}" rx="3" fill="${fit ? 'rgba(5,150,105,.24)' : 'rgba(124,58,237,.20)'}" stroke="${fit ? GRN : C}" stroke-width="1.4"/>`;
            }
            if (W % s0 !== 0) s += `<rect x="${(ox + nx * s0 * sc).toFixed(1)}" y="${oy}" width="${((W - nx * s0) * sc).toFixed(1)}" height="${Hh * sc}" fill="rgba(225,29,72,.16)"/>`;
            if (Hh % s0 !== 0) s += `<rect x="${ox}" y="${(oy + ny * s0 * sc).toFixed(1)}" width="${(nx * s0 * sc).toFixed(1)}" height="${((Hh - ny * s0) * sc).toFixed(1)}" fill="rgba(225,29,72,.16)"/>`;
            s += `<text x="${ox + W * sc / 2}" y="18" text-anchor="middle" font-size="13" font-weight="800" fill="#657187">長 36</text>`;
            s += `<text x="60" y="${oy + Hh * sc / 2}" text-anchor="middle" font-size="13" font-weight="800" fill="#657187">寬 24</text>`;
            const yb = oy + Hh * sc + 30;
            s += `<text x="220" y="${yb}" text-anchor="middle" font-size="13.5" font-weight="800" fill="#172033">36 ÷ ${s0} = ${(W / s0).toFixed(W % s0 ? 2 : 0)}　　24 ÷ ${s0} = ${(Hh / s0).toFixed(Hh % s0 ? 2 : 0)}</text>`;
            s += `<text x="220" y="${yb + 26}" text-anchor="middle" font-size="14.5" font-weight="900" fill="${fit ? GRN : RED}">${fit ? `✓ 剛好鋪滿，共 ${nx * ny} 張` : '✗ 邊長不是公因數，會剩下'}</text>`;
            h.querySelector('#tile').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#ss').oninput = draw; draw();
        },
        caption: '邊長要能<b>同時整除</b>長與寬（＝公因數），最大只能到 \\((24,36)=12\\)。',
        example: {
          q: '長 36、寬 24 公分的紙，要剪成一樣大的正方形且不能有剩，正方形最大邊長多少？共幾張？',
          steps: ['邊長必須是 36、24 的<b>公因數</b>，最大取 \\((36,24)=12\\)。', '張數 \\((36\\div12)\\times(24\\div12)=3\\times2\\)。'],
          ans: '邊長 12 公分，共 6 張'
        }
      },

      {
        sec: '2-2', secName: '易錯提醒',
        title: '公因數與公倍數最常錯的四件事',
        points: [
          '✗ 短除法<b>停太早</b>　✓ 底列兩數要<b>互質</b>才能停，否則 GCD 會偏小。',
          '✗ 求 LCM 只乘左側　✓ 左側還要<b>再乘底列</b>兩數，走成 L 形。',
          '✗ 指數取反　✓ <b>GCD 取小、LCM 取大</b>；沒出現的質因數指數算 0。',
          '✗ 以為兩數一定有大於 1 的公因數　✓ <b>互質</b>時 \\((8,15)=1\\)。'
        ],
        formula: { label: '短除法的停止條件', tex: '\\text{一直除到底列兩數互質為止}' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '✗ 除到 12、18 就停下來', tex: '(24,36)=2', color: RED, fill: '#fdeef2', border: '#f0c9d3', size: 18, note: '12 與 18 還有公因數 6，不可以停' },
            { label: '✓ 除到 2 與 3 互質才停', tex: '(24,36)=2\\times2\\times3=12', color: GRN, fill: '#eef7f2', border: '#cfe8dd', size: 17 },
            { label: '✓ 最小公倍數別忘了底列', tex: '[24,36]=12\\times2\\times3=72', color: C, fill: '#f4efff', border: C, size: 17, note: '左側 × 底列，走成 L 形' }
          ], { gap: 10 });
        },
        caption: '寫完先檢查：\\((a,b)\\) 一定<b>整除</b>兩數，\\([a,b]\\) 一定是兩數的<b>倍數</b>。',
        example: {
          q: '用短除法求 \\((36,48)\\) 與 \\([36,48]\\)。',
          steps: ['除 2 得 18、24；再除 2 得 9、12；再除 3 得 3、4，<b>互質才停</b>。', '左側相乘：\\((36,48)=2\\times2\\times3=12\\)。', '再乘底列：\\([36,48]=12\\times3\\times4=144\\)。'],
          ans: '\\((36,48)=12\\)、\\([36,48]=144\\)'
        }
      },

      /* ---------- 2-3 分數的四則運算 ---------- */
      {
        sec: '2-3', secName: '負分數',
        title: '負分數的三種寫法，都是同一個數',
        points: [
          '\\(-\\dfrac{3}{4}=\\dfrac{-3}{4}=\\dfrac{3}{-4}\\)，在數線上是<b>同一個點</b>。',
          '習慣把負號寫在<b>分數最前面</b>，計算時比較不會漏掉。',
          '數線上<b>越右邊越大</b>：兩個負分數，<b>絕對值大的反而小</b>。'
        ],
        formula: { label: '三種寫法同值', tex: '-\\dfrac{a}{b}=\\dfrac{-a}{b}=\\dfrac{a}{-b}\\quad(b\\neq0)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="nl"></div>
            <div class="ictrl"><label>分子 n（分母固定 4） <span class="ival" id="fv">-3</span></label>
            <input type="range" id="fs" min="-8" max="8" step="1" value="-3"></div></div>`;
          const X = v => 225 + v * 90;
          const draw = () => {
            const n = +h.querySelector('#fs').value;
            h.querySelector('#fv').textContent = n;
            let s = SV.seg(30, 110, 420, 110, '#5b6478', 2.4);
            s += `<path d="M420,110 L410,105 L410,115 Z" fill="#5b6478"/>`;
            for (let q = -8; q <= 8; q++) {
              const x = X(q / 4), big = q % 4 === 0;
              s += SV.seg(x, 110 - (big ? 10 : 5), x, 110 + (big ? 10 : 5), '#8a94a6', big ? 2.2 : 1.4);
              if (big) s += `<text x="${x}" y="${140}" text-anchor="middle" font-size="13" font-weight="700" fill="#657187">${q / 4}</text>`;
            }
            const px = X(n / 4);
            s += SV.dot(px, 110, C, 7);
            s += `<text x="${px}" y="84" text-anchor="middle" font-size="15" font-weight="900" fill="${C}">${n}/4</text>`;
            const g = Math.max(1, gcd(Math.abs(n), 4));
            const simp = n === 0 ? '0' : (4 / g === 1 ? `${n / g}` : `${n / g}/${4 / g}`);
            const note = g > 1 ? `${n}/4 約分後 = ${simp}` : `${n}/4 已經是最簡分數`;
            s += `<text x="220" y="34" text-anchor="middle" font-size="14" font-weight="800" fill="#172033">${note}</text>`;
            if (n < 0) {
              const a = -n;
              s += chip(36, 175, 116, 40, `−${a}/4`, C, '#f4efff', 17);
              s += chip(162, 175, 116, 40, `(−${a})/4`, C, '#f4efff', 17);
              s += chip(288, 175, 116, 40, `${a}/(−4)`, C, '#f4efff', 17);
              s += `<text x="220" y="258" text-anchor="middle" font-size="13" font-weight="800" fill="${GRN}">三種寫法 → 數線上同一個點</text>`;
            } else {
              s += chip(140, 175, 160, 40, `${n}/4`, '#8a94a6', '#f4f5f7', 17);
              s += `<text x="220" y="258" text-anchor="middle" font-size="13" font-weight="800" fill="#8a94a6">n ≥ 0，沒有負號要搬</text>`;
            }
            h.querySelector('#nl').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#fs').oninput = draw; draw();
        },
        caption: '拖滑桿看 \\(\\frac{n}{4}\\) 的位置：越往左越小。（暑輔講義若寫「分數的加減／分數的乘除」，是舊版分節，內容相同。）',
        example: {
          q: '比較 \\(-\\dfrac{3}{4}\\) 與 \\(-\\dfrac{2}{3}\\) 的大小。',
          steps: ['通分成 \\(-\\dfrac{9}{12}\\) 與 \\(-\\dfrac{8}{12}\\)。', '絕對值 \\(\\dfrac{9}{12}>\\dfrac{8}{12}\\)，但都是負數，大小要<b>反過來</b>。'],
          ans: '\\(-\\dfrac34<-\\dfrac23\\)'
        }
      },

      {
        sec: '2-3', secName: '約分與通分',
        title: '約分、擴分、通分，都是分子分母同乘同除',
        points: [
          '<b>擴分</b>：分子分母<b>同乘</b>同一個非零數，值不變。',
          '<b>約分</b>：分子分母<b>同除</b>公因數；一次除以<b>最大公因數</b>就到最簡分數。',
          '<b>通分</b>：把幾個分數擴分成<b>同分母</b>，分母取<b>最小公倍數</b>最省力。',
          '所以 2-1、2-2 的 GCD 與 LCM，就是為了這裡在鋪路。'
        ],
        formula: { label: '值都不變', tex: '\\dfrac{a}{b}=\\dfrac{a\\times k}{b\\times k}=\\dfrac{a\\div g}{b\\div g}\\quad(k\\neq0,\\;g\\text{ 為公因數})' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="ext"></div>
            <div class="ictrl"><label>擴分倍數 k <span class="ival" id="kv">1</span></label>
            <input type="range" id="ks" min="1" max="6" step="1" value="1"></div></div>`;
          const bx = 42, bw = 356, by = 78, bh = 68;
          const draw = () => {
            const k = +h.querySelector('#ks').value;
            h.querySelector('#kv').textContent = k;
            let s = `<text x="220" y="36" text-anchor="middle" font-size="16" font-weight="900" fill="#172033">3/4 = ${3 * k}/${4 * k}</text>`;
            s += `<text x="220" y="58" text-anchor="middle" font-size="12.5" fill="#657187">切成 ${4 * k} 格，塗 ${3 * k} 格</text>`;
            s += bar(bx, by, bw, bh, 4 * k, 3 * k, 'rgba(124,58,237,.55)');
            const cut = bx + bw * 0.75;
            s += SV.seg(cut, by - 14, cut, by + bh + 16, RED, 2.4, '6 5');
            s += `<text x="${cut}" y="${by + bh + 36}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${RED}">塗色永遠停在同一個位置</text>`;
            s += `<text x="220" y="252" text-anchor="middle" font-size="13.5" font-weight="800" fill="${GRN}">格子變細，但塗色的「比例」不變 → 值不變</text>`;
            h.querySelector('#ext').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#ks').oninput = draw; draw();
        },
        caption: '不管切成幾份，塗色長度都停在同一條紅線上——這就是擴分、約分不改變值的道理。',
        example: {
          q: '把 \\(\\dfrac{18}{24}\\) 化成最簡分數。',
          steps: ['\\((18,24)=6\\)。', '分子分母同除以 6。'],
          ans: '\\(\\dfrac{3}{4}\\)'
        }
      },

      {
        sec: '2-3', secName: '分數加減',
        title: '分數加減：先通分，分母不動只算分子',
        points: [
          '同分母：<b>分母不變</b>，分子相加減，算完記得<b>約分</b>。',
          '異分母：先<b>通分</b>（分母取最小公倍數）再加減。',
          '<b>帶分數先化成假分數</b>再運算；括號前是「−」時，括號內<b>每一項都要變號</b>。'
        ],
        formula: { label: '通分再相減', tex: '\\dfrac{5}{6}-\\dfrac{3}{4}=\\dfrac{10}{12}-\\dfrac{9}{12}=\\dfrac{1}{12}' },
        visual: (h) => {
          const bx = 60, bw = 320, h1 = 46;
          const lab = (y, t, col) => `<text x="42" y="${y}" text-anchor="end" font-size="15" font-weight="900" fill="${col}">${t}</text>`;
          SV.stepper(h, '0 0 440 275', [
            {
              t: '兩條長條的格子大小不同，<b>不能直接相減</b>。', d: () => `<text x="220" y="26" text-anchor="middle" font-size="14" font-weight="800" fill="${RED}">格子大小不同 → 不能直接減</text>` +
                bar(bx, 50, bw, h1, 6, 5, 'rgba(37,99,235,.5)') + lab(80, '5/6', BLU) +
                bar(bx, 130, bw, h1, 4, 3, 'rgba(217,119,6,.5)') + lab(160, '3/4', AMB)
            },
            {
              t: '分母 6 與 4 的最小公倍數是 <b>12</b>，兩條都切成 12 格。', d: () => `<text x="220" y="26" text-anchor="middle" font-size="14" font-weight="800" fill="${C}">[6,4] = 12 → 都切成 12 格</text>` +
                bar(bx, 50, bw, h1, 12, 10, 'rgba(37,99,235,.5)') + lab(80, '10/12', BLU) +
                bar(bx, 130, bw, h1, 12, 9, 'rgba(217,119,6,.5)') + lab(160, '9/12', AMB)
            },
            {
              t: '分母不動，分子相減：10 − 9 = <b>1</b>。', d: () => `<text x="220" y="26" text-anchor="middle" font-size="14" font-weight="800" fill="${C}">10/12 − 9/12 = 1/12</text>` +
                bar(bx, 50, bw, h1, 12, 10, 'rgba(37,99,235,.5)') + lab(80, '10/12', BLU) +
                bar(bx, 130, bw, h1, 12, 9, 'rgba(217,119,6,.5)') + lab(160, '9/12', AMB) +
                `<rect x="${bx + bw * 9 / 12}" y="44" width="${bw / 12 - 1.5}" height="${h1 + 12}" rx="4" fill="none" stroke="${RED}" stroke-width="2.6"/>` +
                `<text x="220" y="232" text-anchor="middle" font-size="15" font-weight="900" fill="${RED}">差的就是這 1 格 = 1/12</text>`
            }
          ], { acc: false });
        },
        caption: '通分就是把兩條長條切成<b>一樣細</b>的格子，切好之後只要數格子。',
        example: {
          q: '計算 \\(\\dfrac{3}{4}-\\left(\\dfrac{1}{2}-\\dfrac{5}{6}\\right)\\)。',
          steps: ['括號內先算：\\(\\dfrac36-\\dfrac56=-\\dfrac26=-\\dfrac13\\)。', '\\(\\dfrac34-\\left(-\\dfrac13\\right)=\\dfrac34+\\dfrac13\\)。', '通分成 12：\\(\\dfrac{9}{12}+\\dfrac{4}{12}\\)。'],
          ans: '\\(\\dfrac{13}{12}\\)'
        }
      },

      {
        sec: '2-3', secName: '分數乘除',
        title: '乘法先約分再乘，除法改成乘倒數',
        points: [
          '乘法：<b>分子乘分子、分母乘分母</b>；<b>先交叉約分</b>再乘，數字才不會爆掉。',
          '<span class="k">倒數</span>：兩數相乘等於 1。<b>除以一個不為 0 的數 ＝ 乘它的倒數</b>。',
          '符號：相乘的<b>負號個數</b>是奇數就是負、偶數就是正。',
          '乘法對加減也有<b>分配律</b>，遇到「同一個分數乘括號」可以拆開算。'
        ],
        formula: { label: '除法變乘法', tex: '\\dfrac{a}{b}\\div\\dfrac{c}{d}=\\dfrac{a}{b}\\times\\dfrac{d}{c}\\quad(c\\neq0)' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '① 先約分再乘', tex: '\\dfrac{8}{9}\\times\\dfrac{3}{4}=\\dfrac{2\\times1}{3\\times1}=\\dfrac{2}{3}', color: C, fill: '#f4efff', border: C, size: 17, note: '8 與 4 約掉 4；3 與 9 約掉 3' },
            { label: '② 除以分數＝乘倒數', tex: '\\dfrac{5}{6}\\div\\dfrac{10}{3}=\\dfrac{5}{6}\\times\\dfrac{3}{10}=\\dfrac{1}{4}', color: GRN, fill: '#eef7f2', border: '#cfe8dd', size: 17, note: '只把「除數」上下顛倒' },
            { label: '③ 負號個數決定正負', tex: '\\left(-\\dfrac12\\right)\\times\\left(-\\dfrac23\\right)\\times\\left(-\\dfrac34\\right)=-\\dfrac14', color: RED, fill: '#fdeef2', border: '#f0c9d3', size: 16, note: '三個負號（奇數）⇒ 結果為負' }
          ], { gap: 10 });
        },
        caption: '流程固定：<b>先把除法改成乘倒數 → 再一次把數字約乾淨 → 最後才乘</b>。',
        example: {
          q: '計算 \\(\\left(-\\dfrac{4}{9}\\right)\\div\\dfrac{8}{15}\\)。',
          steps: ['改成乘倒數：\\(-\\dfrac49\\times\\dfrac{15}{8}\\)。', '約分：4 與 8 約 4、9 與 15 約 3。', '得 \\(-\\dfrac{1\\times5}{3\\times2}\\)。'],
          ans: '\\(-\\dfrac{5}{6}\\)'
        }
      },

      {
        sec: '2-3', secName: '易錯提醒',
        title: '分數計算最常掉的四個坑',
        points: [
          '✗ \\(\\dfrac12+\\dfrac13=\\dfrac25\\)　✓ 分母<b>不能相加</b>，要通分：\\(\\dfrac36+\\dfrac26=\\dfrac56\\)。',
          '✗ \\(\\dfrac12\\div\\dfrac34=\\dfrac21\\times\\dfrac34\\)　✓ 只把<b>除數</b>倒過來：\\(\\dfrac12\\times\\dfrac43\\)。',
          '✗ \\(6\\div2\\times3=6\\div6\\)　✓ 乘除<b>同級由左而右</b>：\\(=3\\times3=9\\)。',
          '✗ \\(-(\\tfrac13-\\tfrac12)=-\\tfrac13-\\tfrac12\\)　✓ 括號內<b>每一項</b>都要變號。'
        ],
        formula: { label: '運算順序（一定要背）', tex: '\\text{括號}\\to\\text{乘方／絕對值}\\to\\text{乘除}\\to\\text{加減}' },
        visual: (h) => {
          const box = (y, t, sub, col, fill) =>
            `<rect x="86" y="${y}" width="268" height="46" rx="13" fill="${fill}" stroke="${col}" stroke-width="2"/>` +
            `<text x="220" y="${y + 22}" text-anchor="middle" font-size="15" font-weight="900" fill="${col}">${t}</text>` +
            `<text x="220" y="${y + 39}" text-anchor="middle" font-size="11.5" fill="#657187">${sub}</text>`;
          const arrow = (y) => SV.seg(220, y, 220, y + 14, '#8a94a6', 2.2) + `<path d="M220,${y + 18} L215,${y + 9} L225,${y + 9} Z" fill="#8a94a6"/>`;
          h.innerHTML = svg('0 0 440 290', `
            <text x="220" y="20" text-anchor="middle" font-size="13" font-weight="900" fill="#172033">四則運算順序</text>
            ${box(30, '① 括號內先算', '小括號 → 中括號 → 大括號', C, '#f4efff')}
            ${arrow(76)}
            ${box(94, '② 乘方、絕對值求值', '先把次方與 | | 算成一個數', BLU, '#eef4ff')}
            ${arrow(140)}
            ${box(158, '③ 乘、除', '同級由左而右', GRN, '#eef7f2')}
            ${arrow(204)}
            ${box(222, '④ 加、減', '同級由左而右', AMB, '#fdf3e6')}
          `);
        },
        caption: '順序記牢：<b>括號最優先，乘方比乘除大，同級一律由左到右</b>；有小數先化成分數。',
        example: {
          q: '計算 \\(\\dfrac{1}{2}-\\dfrac{1}{3}\\times\\left(-\\dfrac{3}{4}\\right)^{2}\\)。',
          steps: ['先算乘方：\\(\\left(-\\dfrac34\\right)^2=\\dfrac{9}{16}\\)。', '再算乘法：\\(\\dfrac13\\times\\dfrac{9}{16}=\\dfrac{3}{16}\\)。', '最後相減：\\(\\dfrac{8}{16}-\\dfrac{3}{16}\\)。'],
          ans: '\\(\\dfrac{5}{16}\\)'
        }
      },

      /* ---------- 2-4 指數律 ---------- */
      {
        sec: '2-4', secName: '乘方',
        title: '括號有沒有包住負號，答案差很多',
        points: [
          '\\(a^n\\) 是 <b>n 個 a 相乘</b>；\\(a\\) 叫<span class="k">底數</span>、\\(n\\) 叫<span class="k">指數</span>。',
          '有括號：\\((-2)^4=(-2)(-2)(-2)(-2)=16\\)；沒括號：\\(-2^4=-(2^4)=-16\\)。',
          '分數的乘方：<b>分子分母各自次方</b>，\\(\\left(\\dfrac{2}{3}\\right)^3=\\dfrac{2^3}{3^3}=\\dfrac{8}{27}\\)。',
          '負數的乘方：指數是<b>偶數</b>為正、<b>奇數</b>為負。'
        ],
        formula: { label: '分數的乘方', tex: '\\left(\\dfrac{a}{b}\\right)^{n}=\\dfrac{a^{n}}{b^{n}}\\quad(b\\neq0)' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '✓ 負號被括號包住 → 一起乘', tex: '(-2)^4=(-2)(-2)(-2)(-2)=16', color: GRN, fill: '#eef7f2', border: '#cfe8dd', size: 16 },
            { label: '✓ 負號沒被包住 → 只有 2 連乘四次', tex: '-2^4=-(2\\times2\\times2\\times2)=-16', color: RED, fill: '#fdeef2', border: '#f0c9d3', size: 16 },
            { label: '分數＋負號', tex: '\\left(-\\dfrac{2}{3}\\right)^{3}=-\\dfrac{2^3}{3^3}=-\\dfrac{8}{27}', color: C, fill: '#f4efff', border: C, size: 16, note: '指數 3（奇數）⇒ 結果為負' }
          ], { gap: 10 });
        },
        caption: '兩者只差一個括號，答案卻差一個負號——考卷上最愛考這一組。',
        example: {
          q: '計算 \\((-3)^2+(-3^2)\\)。',
          steps: ['\\((-3)^2=9\\)（負號在括號內，一起平方）。', '\\(-3^2=-9\\)（只有 3 被平方）。'],
          ans: '\\(9+(-9)=0\\)'
        }
      },

      {
        sec: '2-4', secName: '指數律',
        title: '同底數：相乘加指數，相除減指數',
        points: [
          '同底數<b>相乘</b>，指數<b>相加</b>：\\(2^3\\times2^5=2^{8}\\)。',
          '同底數<b>相除</b>，指數<b>相減</b>：\\(2^7\\div2^3=2^{4}\\)。',
          '<b>乘方的乘方</b>，指數<b>相乘</b>：\\((3^2)^4=3^{8}\\)。',
          '這三條都要<b>底數相同</b>才能用；底數不同就<b>不能</b>合併指數。'
        ],
        formula: { label: '三條指數律', tex: 'a^m\\times a^n=a^{m+n},\\quad a^m\\div a^n=a^{m-n},\\quad (a^m)^n=a^{mn}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="pow"></div>
            <div class="ictrl"><label>左邊的指數 m <span class="ival" id="mv">2</span>（右邊固定 3）</label>
            <input type="range" id="ms" min="1" max="5" step="1" value="2"></div></div>`;
          const draw = () => {
            const m = +h.querySelector('#ms').value;
            h.querySelector('#mv').textContent = m;
            const tot = m + 3, w = 34, gp = 10, all = tot * w + (tot - 1) * gp;
            const x0 = 220 - all / 2, y = 92;
            const sup = v => String(v).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('');
            let s = `<text x="220" y="34" text-anchor="middle" font-size="17" font-weight="900" fill="#172033">2${sup(m)} × 2³ ＝ ?</text>`;
            s += `<text x="220" y="58" text-anchor="middle" font-size="12.5" fill="#657187">把次方展開成「幾個 2 相乘」</text>`;
            for (let i = 0; i < tot; i++) {
              const x = x0 + i * (w + gp), left = i < m;
              s += `<rect x="${x.toFixed(1)}" y="${y}" width="${w}" height="${w}" rx="8" fill="${left ? 'rgba(124,58,237,.16)' : 'rgba(5,150,105,.16)'}" stroke="${left ? C : GRN}" stroke-width="2"/>`;
              s += `<text x="${(x + w / 2).toFixed(1)}" y="${y + 24}" text-anchor="middle" font-size="16" font-weight="900" fill="${left ? C : GRN}">2</text>`;
              if (i < tot - 1) s += `<text x="${(x + w + gp / 2).toFixed(1)}" y="${y + 24}" text-anchor="middle" font-size="12" fill="#8a94a6">×</text>`;
            }
            s += `<text x="${x0 + (m * (w + gp) - gp) / 2}" y="${y + 58}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${C}">${m} 個</text>`;
            s += `<text x="${x0 + m * (w + gp) + (3 * (w + gp) - gp) / 2}" y="${y + 58}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${GRN}">3 個</text>`;
            s += `<text x="220" y="210" text-anchor="middle" font-size="17" font-weight="900" fill="#172033">共 ${m} + 3 = ${tot} 個 2 相乘</text>`;
            s += `<text x="220" y="250" text-anchor="middle" font-size="18" font-weight="900" fill="${C}">2${sup(m)} × 2³ ＝ 2${sup(tot)} ＝ ${Math.pow(2, tot)}</text>`;
            h.querySelector('#pow').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#ms').oninput = draw; draw();
        },
        caption: '把次方展開成「一個一個 2」，指數為什麼是<b>相加</b>就一目了然。',
        example: {
          q: '計算 \\(2^3\\times2^4\\div2^5\\)。',
          steps: ['先乘：\\(2^{3+4}=2^{7}\\)。', '再除：\\(2^{7-5}=2^{2}\\)。'],
          ans: '\\(2^2=4\\)'
        }
      },

      {
        sec: '2-4', secName: '積的乘方與零次方',
        title: '積的乘方可以拆開；非零數的 0 次方是 1',
        points: [
          '積的乘方：\\((a\\times b)^n=a^n\\times b^n\\)，每個因數<b>各自</b>次方。',
          '例：\\((2\\times5)^3=2^3\\times5^3=8\\times125=1000\\)，也可以先算 \\(10^3\\)。',
          '<b>\\(a^0=1\\)（\\(a\\neq0\\)）</b>：這是為了讓 \\(a^m\\div a^n=a^{m-n}\\) 在 \\(m=n\\) 時也成立。',
          '同底數比大小：底數大於 1 時，<b>指數越大值越大</b>（\\(2^{10}>2^{7}\\)）。'
        ],
        formula: { label: '零次方', tex: 'a^{0}=1\\quad(a\\neq0)' },
        visual: (h) => {
          const card = (y, t, sub, col, fill) =>
            `<rect x="52" y="${y}" width="336" height="52" rx="14" fill="${fill}" stroke="${col}" stroke-width="2"/>` +
            `<text x="220" y="${y + 25}" text-anchor="middle" font-size="17" font-weight="900" fill="${col}">${t}</text>` +
            `<text x="220" y="${y + 44}" text-anchor="middle" font-size="12" fill="#657187">${sub}</text>`;
          SV.stepper(h, '0 0 440 275', [
            { t: '同一個數相除，答案一定是 1。', d: () => card(30, '2³ ÷ 2³ = 8 ÷ 8 = 1', '直接算出來', BLU, '#eef4ff') },
            {
              t: '換成<b>指數律</b>算：指數相減。', d: () => card(30, '2³ ÷ 2³ = 8 ÷ 8 = 1', '直接算出來', BLU, '#eef4ff') +
                card(100, '2³ ÷ 2³ = 2³⁻³ = 2⁰', '用同底數相除的指數律', C, '#f4efff')
            },
            {
              t: '兩邊都在算同一個式子 ⇒ <b>2⁰ = 1</b>。', d: () => card(30, '2³ ÷ 2³ = 8 ÷ 8 = 1', '直接算出來', BLU, '#eef4ff') +
                card(100, '2³ ÷ 2³ = 2³⁻³ = 2⁰', '用同底數相除的指數律', C, '#f4efff') +
                card(170, '所以 2⁰ = 1', '任何不為 0 的數，0 次方都是 1', GRN, '#eef7f2')
            }
          ], { acc: false });
        },
        caption: '\\(a^0=1\\) 不是硬背的規定，是讓指數律<b>前後一致</b>推出來的結果。',
        example: {
          q: '計算 \\((2\\times5)^3\\) 與 \\(7^0+3^0\\)。',
          steps: ['\\((2\\times5)^3=2^3\\times5^3=8\\times125\\)（或直接算 \\(10^3\\)）。', '\\(7^0=1\\)、\\(3^0=1\\)。'],
          ans: '\\(1000\\) 與 \\(2\\)'
        }
      },

      {
        sec: '2-4', secName: '易錯提醒',
        title: '指數律最常見的四個錯',
        points: [
          '✗ \\(2^3\\times2^5=2^{15}\\)　✓ 同底相乘是<b>加</b>指數：\\(2^{8}\\)。',
          '✗ \\((3^2)^4=3^{6}\\)　✓ 乘方的乘方是<b>乘</b>指數：\\(3^{8}\\)。',
          '✗ \\(2^3+2^3=2^{6}\\)　✓ <b>加法完全不能動指數</b>：\\(=2\\times2^3=2^{4}\\)。',
          '✗ \\(2^3\\times3^2=6^{5}\\)　✓ <b>底數不同</b>不能合併指數。'
        ],
        formula: { label: '一句話', tex: '\\text{乘法加指數，乘方乘指數，加法不能碰指數}' },
        visual: (h) => {
          const row = (bad, good, why) => `<tr>
            <td style="border:1px solid #dce3ee;padding:8px 6px;background:#fdeef2;color:${RED};font-weight:800">✗ ${bad}</td>
            <td style="border:1px solid #dce3ee;padding:8px 6px;background:#eef7f2;color:${GRN};font-weight:800">✓ ${good}</td>
            <td style="border:1px solid #dce3ee;padding:8px 6px;font-size:11.5px;color:#657187">${why}</td></tr>`;
          h.innerHTML = `<div style="width:97%;margin:0 auto;padding-top:16px">
            <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:center">
              <tr style="background:#f4efff">
                <th style="border:1px solid #dce3ee;padding:7px">常見錯誤</th>
                <th style="border:1px solid #dce3ee;padding:7px">正確</th>
                <th style="border:1px solid #dce3ee;padding:7px">為什麼</th></tr>
              ${row('2³×2⁵ = 2¹⁵', '2³×2⁵ = 2⁸', '相乘是「加」指數，不是乘')}
              ${row('(3²)⁴ = 3⁶', '(3²)⁴ = 3⁸', '乘方的乘方才是「乘」指數')}
              ${row('2³+2³ = 2⁶', '2³+2³ = 2×2³ = 2⁴', '加法只能合併「同類」，指數不動')}
              ${row('2³×3² = 6⁵', '2³×3² = 8×9 = 72', '底數不同，指數不能合併')}
            </table>
            <div style="margin-top:10px;font-size:12.5px;color:#657187;text-align:center">
              不確定時就<b>展開成數字</b>驗一次：\\(2^3\\times2^5=8\\times32=256=2^8\\)。</div>
          </div>`;
        },
        caption: '四個錯誤都出自同一個壞習慣：把「＋」和「×」在指數上搞混。',
        example: {
          q: '化簡 \\(\\dfrac{2^{5}\\times2^{3}}{2^{6}}\\)。',
          steps: ['分子同底相乘：\\(2^{5+3}=2^{8}\\)。', '再相除：\\(2^{8-6}=2^{2}\\)。'],
          ans: '\\(2^2=4\\)'
        }
      }
    ]
  });
})();
