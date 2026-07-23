/* ============ 第 3 章　比與比例式 ============
   依康軒版第二冊（七下）課程計畫：3-1 比例式、3-2 正比與反比
   課綱代碼 N-7-9。本章只處理兩量的比 a:b，不涉連比、比例線段、相似形。
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#059669';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }
  const gcd = (a, b) => b ? gcd(b, a % b) : a;

  // 錯／對對照卡：rows = [{wl, w, rl, r}]
  function xvbox(rows) {
    return `<div style="width:96%;margin:0 auto;display:flex;flex-direction:column;gap:10px">` +
      rows.map(r => `<div style="display:flex;gap:8px;align-items:stretch">
        <div style="flex:1;background:#fdeef2;border:1.5px solid #f0c9d3;border-radius:12px;padding:9px 10px;text-align:center">
          <div style="font-size:12px;font-weight:900;color:${RED};margin-bottom:3px">✗ ${r.wl}</div>
          <div style="font-size:13.5px;color:#172033;line-height:1.5">${r.w}</div></div>
        <div style="flex:1;background:#eefaf5;border:1.5px solid #bfe3d4;border-radius:12px;padding:9px 10px;text-align:center">
          <div style="font-size:12px;font-weight:900;color:${C};margin-bottom:3px">✓ ${r.rl}</div>
          <div style="font-size:13.5px;color:#172033;line-height:1.5">${r.r}</div></div>
      </div>`).join('') + `</div>`;
  }

  // 通用小表格（HTML）
  function tableHTML(rows, opt = {}) {
    return `<table style="width:${opt.w || '96%'};margin:0 auto;border-collapse:collapse;font-size:${opt.fs || 13.5}px;text-align:center">` +
      rows.map((r, i) => `<tr${i === 0 ? ` style="background:#eefaf5"` : (i % 2 === 0 ? ` style="background:#fafcfb"` : '')}>` +
        r.map(c => `<td style="border:1px solid #cdd6e2;padding:7px 6px;${i === 0 ? 'font-weight:900' : ''}">${c}</td>`).join('') +
        `</tr>`).join('') + `</table>`;
  }

  window.DECK.push({
    ch: 3,
    title: '比與比例式',
    color: C,
    sections: ["3-1 比例式", "3-2 正比與反比"],
    slides: [

      /* ---------- 3-1 比例式 ---------- */
      {
        sec: '3-1', secName: '比例式',
        title: '比值：把 a : b 壓成一個數',
        points: [
          '\\(a:b\\) 讀作「a 比 b」，\\(a\\) 是<b>前項</b>、\\(b\\) 是<b>後項</b>，順序不能對調。',
          '<span class="k">比值</span>＝前項 ÷ 後項＝\\(\\dfrac{a}{b}\\)（\\(b\\neq0\\)）——比是「兩個數」，比值是「一個數」。',
          '比之前<b>單位一定要先化成一樣</b>；單位不同就直接比，是本節最常見的失分點。'
        ],
        formula: { label: '比值', tex: 'a:b\\ \\text{的比值}=a\\div b=\\dfrac{a}{b}\\quad(b\\neq0)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="rb"></div>
            <div class="ictrl"><label>前項 a <span class="ival" id="rv">6</span>　（後項 b 固定 = 8）</label>
            <input type="range" id="rs" min="1" max="12" step="1" value="6"></div></div>`;
          const draw = () => {
            const a = +h.querySelector('#rs').value, b = 8;
            h.querySelector('#rv').textContent = a;
            const u = 26, x0 = 62;
            let s = '';
            for (let i = 0; i < a; i++) s += `<rect x="${x0 + i * u}" y="52" width="${u - 4}" height="40" rx="5" fill="${C}" opacity="0.85"/>`;
            for (let i = 0; i < b; i++) s += `<rect x="${x0 + i * u}" y="118" width="${u - 4}" height="40" rx="5" fill="#94a3b8" opacity="0.8"/>`;
            s += `<text x="50" y="79" text-anchor="end" font-size="16" font-weight="900" fill="${C}">a</text>`;
            s += `<text x="50" y="145" text-anchor="end" font-size="16" font-weight="900" fill="#64748b">b</text>`;
            const g = gcd(a, b);
            s += `<text x="220" y="212" text-anchor="middle" font-size="18" font-weight="900" fill="#172033">a : b = ${a} : ${b} = ${a / g} : ${b / g}</text>`;
            // 比值一律寫成精確值（a/8 最多三位小數），不可四捨五入後仍寫等號
            const val = (b / g === 1) ? `${a / g}` : `${a / g}/${b / g} = ${+(a / b).toFixed(3)}`;
            s += `<text x="220" y="250" text-anchor="middle" font-size="16" font-weight="800" fill="${RED}">比值 = ${a} ÷ ${b} = ${val}</text>`;
            h.querySelector('#rb').innerHTML = svg('0 0 440 278', s);
          };
          h.querySelector('#rs').oninput = draw; draw();
        },
        caption: '拖滑桿改前項：<b>比會跟著變，化簡後的最簡比與比值也一起變</b>。',
        example: {
          q: '甲繩長 \\(150\\) 公分、乙繩長 \\(2\\) 公尺，求甲比乙的比值。',
          steps: ['先統一單位：乙 \\(2\\) 公尺 \\(=200\\) 公分。', '甲:乙 \\(=150:200=3:4\\)，比值 \\(=\\dfrac34\\)。'],
          ans: '比值 \\(=\\dfrac34\\)'
        }
      },

      {
        sec: '3-1', secName: '比例式',
        title: '化簡比：前後項同乘同除，比值不變',
        points: [
          '前項與後項<b>同乘</b>或<b>同除</b>同一個<b>非零</b>的數，比值<b>完全不變</b>。',
          '整數比 → 兩項<b>同除最大公因數</b>，就得最簡整數比。',
          '分數比 → 同乘<b>分母的最小公倍數</b>；小數比 → 同乘 \\(10\\)、\\(100\\) 先變整數，再化簡。'
        ],
        formula: { label: '化簡的依據', tex: 'a:b=(a\\times m):(b\\times m)=(a\\div m):(b\\div m)\\quad(m\\neq0)' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '整數比：同除最大公因數', tex: '12:18\\;\\xrightarrow{\\ \\div\\,6\\ }\\;2:3', color: C, fill: '#eefaf5', border: C, size: 18 },
            { label: '分數比：同乘分母最小公倍數', tex: '\\tfrac23:\\tfrac35\\;\\xrightarrow{\\ \\times\\,15\\ }\\;10:9', color: BLU, border: '#cfe0f8', size: 18 },
            { label: '小數比：同乘 10 或 100', tex: '0.4:1.5\\;\\xrightarrow{\\ \\times\\,10\\ }\\;4:15', color: AMB, border: '#f0dcc0', size: 18 }
          ], { gap: 11 });
        },
        caption: '三種長相、同一招：<b>先變成整數，再同除最大公因數</b>。',
        example: {
          q: '把 \\(\\dfrac23:\\dfrac35\\) 化成最簡整數比。',
          steps: ['分母 \\(3\\) 與 \\(5\\) 的最小公倍數是 \\(15\\)，兩項同乘 \\(15\\)。', '得 \\(10:9\\)；\\(10\\) 與 \\(9\\) 互質，已最簡。'],
          ans: '\\(10:9\\)'
        }
      },

      {
        sec: '3-1', secName: '比例式',
        title: '比例式的基本性質：外項積＝內項積',
        points: [
          '兩個<b>比值相同</b>的比用等號連起來，就是<span class="k">比例式</span> \\(a:b=c:d\\)。',
          '頭尾兩個 \\(a,d\\) 叫<b>外項</b>，中間兩個 \\(b,c\\) 叫<b>內項</b>。',
          '基本性質：<b>外項相乘＝內項相乘</b>，\\(ad=bc\\)。比例式一出現，先交叉相乘變成一元一次方程式。'
        ],
        formula: { label: '交叉相乘', tex: 'a:b=c:d\\;\\Longleftrightarrow\\;a\\times d=b\\times c' },
        visual: (h) => {
          const bx = (cx, t, col) =>
            `<rect x="${cx - 30}" y="95" width="60" height="52" rx="12" fill="#fff" stroke="${col}" stroke-width="2.4"/>` +
            `<text x="${cx}" y="130" text-anchor="middle" font-size="23" font-weight="900" fill="${col}">${t}</text>`;
          let s = bx(65, 'a', RED) + bx(170, 'b', BLU) + bx(290, 'c', BLU) + bx(395, 'd', RED);
          s += `<text x="117" y="132" text-anchor="middle" font-size="24" font-weight="900" fill="#657187">:</text>`;
          s += `<text x="342" y="132" text-anchor="middle" font-size="24" font-weight="900" fill="#657187">:</text>`;
          s += `<text x="230" y="132" text-anchor="middle" font-size="26" font-weight="900" fill="#172033">=</text>`;
          s += `<path d="M65,88 Q230,16 395,88" fill="none" stroke="${RED}" stroke-width="2.4"/>`;
          s += `<text x="230" y="44" text-anchor="middle" font-size="14" font-weight="900" fill="${RED}">外項積　a × d</text>`;
          s += `<path d="M170,154 Q230,230 290,154" fill="none" stroke="${BLU}" stroke-width="2.4"/>`;
          s += `<text x="230" y="212" text-anchor="middle" font-size="14" font-weight="900" fill="${BLU}">內項積　b × c</text>`;
          s += `<text x="230" y="262" text-anchor="middle" font-size="19" font-weight="900" fill="#172033">a × d = b × c</text>`;
          h.innerHTML = svg('0 0 440 280', s);
        },
        caption: '紅線是外項、藍線是內項；<b>兩條線的乘積相等</b>就是比例式的基本性質。',
        example: {
          q: '地圖比例尺為 \\(1:25000\\)，圖上量得 \\(4\\) 公分，實際距離是幾公里？',
          steps: ['設實際 \\(x\\) 公分，列 \\(1:25000=4:x\\)。', '交叉相乘：\\(x=25000\\times4=100000\\)（公分）。', '\\(100000\\) 公分 \\(=1000\\) 公尺 \\(=1\\) 公里。'],
          ans: '\\(1\\) 公里'
        }
      },

      {
        sec: '3-1', secName: '比例式',
        title: '變形性質：(a＋b) : b＝(c＋d) : d',
        points: [
          '若 \\(a:b=c:d\\)，把<b>前項加上後項</b>當新前項，比仍然相等：\\((a+b):b=(c+d):d\\)。',
          '這條性質的白話版：\\(a:b=3:5\\) 就是把整體切成 \\(3+5=8\\) 份，<b>總量 : 後項</b> \\(=8:5\\)。',
          '看到題目給「<b>總共</b>多少」而不是給某一項時，這條就是切入點。'
        ],
        formula: { label: '變形性質', tex: 'a:b=c:d\\;\\Longrightarrow\\;(a+b):b=(c+d):d' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="ab"></div>
            <div class="ictrl"><label>前項 a <span class="ival" id="av">3</span>　（後項 b 固定 = 4）</label>
            <input type="range" id="as" min="1" max="8" step="1" value="3"></div></div>`;
          const u = 22, x0 = 54, gp = 16, b = 4;
          const cell = (x, y, col) => `<rect x="${x}" y="${y}" width="${u - 3}" height="40" rx="4" fill="${col}" opacity="0.85"/>`;
          const draw = () => {
            const a = +h.querySelector('#as').value;
            h.querySelector('#av').textContent = a;
            let s = '', px = x0;
            s += `<text x="46" y="32" text-anchor="start" font-size="13" font-weight="900" fill="#657187">原本的比　a : b</text>`;
            for (let i = 0; i < a; i++) { s += cell(px, 44, C); px += u; }
            px += gp;
            for (let i = 0; i < b; i++) { s += cell(px, 44, '#94a3b8'); px += u; }
            const g1 = gcd(a, b);
            s += `<text x="220" y="118" text-anchor="middle" font-size="17" font-weight="900" fill="#172033">${a} : ${b} = ${a / g1} : ${b / g1}</text>`;
            s += `<text x="46" y="156" text-anchor="start" font-size="13" font-weight="900" fill="#657187">前項換成總量　(a＋b) : b</text>`;
            px = x0;
            for (let i = 0; i < a; i++) { s += cell(px, 168, C); px += u; }
            for (let i = 0; i < b; i++) { s += cell(px, 168, '#94a3b8'); px += u; }
            s += `<rect x="${x0 - 4}" y="164" width="${(a + b) * u + 3}" height="48" rx="8" fill="none" stroke="${RED}" stroke-width="2" stroke-dasharray="5 4"/>`;
            px += gp;
            for (let i = 0; i < b; i++) { s += cell(px, 168, '#94a3b8'); px += u; }
            const t = a + b, g2 = gcd(t, b);
            s += `<text x="220" y="248" text-anchor="middle" font-size="17" font-weight="900" fill="${RED}">${t} : ${b} = ${t / g2} : ${b / g2}</text>`;
            h.querySelector('#ab').innerHTML = svg('0 0 440 276', s);
          };
          h.querySelector('#as').oninput = draw; draw();
        },
        caption: '紅框把「\\(a\\) 份＋\\(b\\) 份」框成<b>總量</b>——這就是比例分配裡的「總份數」。',
        example: {
          q: '把 \\(480\\) 元按 \\(3:5\\) 分給甲、乙，兩人各得多少？',
          steps: ['總份數 \\(3+5=8\\)，每份 \\(480\\div8=60\\) 元。', '甲 \\(60\\times3=180\\)，乙 \\(60\\times5=300\\)。'],
          ans: '甲 \\(180\\) 元、乙 \\(300\\) 元'
        }
      },

      {
        sec: '3-1', secName: '比例式',
        title: '易錯：比的三個經典陷阱',
        points: [
          '<b>單位</b>沒統一就開比——長度、時間、重量都要先換成同一單位。',
          '<b>比</b>和<b>比值</b>不是同一件事：\\(3:4\\) 是比，\\(\\dfrac34\\) 才是比值，答案問哪個要看清楚。',
          '交叉相乘<b>配錯位置</b>：\\(a:b=c:d\\) 是<b>頭尾乘＝中間乘</b>（\\(ad=bc\\)），不是 \\(ac=bd\\)。',
          '「多幾分之幾」不等於比：甲比乙多 \\(\\dfrac13\\)，是乙 \\(3\\) 份、甲 \\(4\\) 份。'
        ],
        visual: (h) => {
          h.innerHTML = xvbox([
            { wl: '單位沒統一', w: '\\(150\\,\\text{公分}:2\\,\\text{公尺}=150:2\\)', rl: '先化成同單位', r: '\\(150:200=3:4\\)' },
            { wl: '交叉相乘配錯', w: '\\(a:b=c:d\\Rightarrow ac=bd\\)', rl: '頭尾乘＝中間乘', r: '\\(a:b=c:d\\Rightarrow ad=bc\\)' },
            { wl: '把「多幾分之幾」當比', w: '甲比乙多 \\(\\dfrac13\\)　⇒　甲:乙\\(=1:3\\)', rl: '乙 3 份、甲多出 1 份', r: '甲比乙多 \\(\\dfrac13\\)　⇒　甲:乙\\(=4:3\\)' }
          ]);
        },
        caption: '這三個坑幾乎每次段考都出現，考前把左紅右綠再看一遍。',
        example: {
          q: '解 \\(x:6=8:12\\) 時，小明列出 \\(8x=72\\)，哪裡錯了？',
          steps: ['外項是 \\(x\\) 與 \\(12\\)、內項是 \\(6\\) 與 \\(8\\)。', '正確式子為 \\(12x=6\\times8=48\\)。', '\\(x=4\\)；小明把外項與內項配錯了。'],
          ans: '\\(x=4\\)（小明配錯項）'
        }
      },

      /* ---------- 3-2 正比與反比 ---------- */
      {
        sec: '3-2', secName: '正比與反比',
        title: '正比：兩量相除永遠是同一個數',
        points: [
          '\\(x\\) 變成原來的 \\(n\\) 倍時，\\(y\\) 也變成原來的 \\(n\\) 倍，就說 \\(y\\) 與 \\(x\\) 成<span class="k">正比</span>。',
          '判別法只有一招：把每一組 \\(y\\div x\\) 都算出來，<b>恆為同一個定值 \\(k\\)</b> 才是正比。',
          '關係式 \\(y=kx\\)（\\(k\\neq0\\)），\\(k\\) 叫<b>比例常數</b>——它就是那個算出來的定值。'
        ],
        formula: { label: '正比', tex: '\\dfrac{y}{x}=k\\ (\\text{定值})\\;\\Longleftrightarrow\\;y=kx' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="pt"></div>
            <div class="ictrl"><label>比例常數 k <span class="ival" id="pv">3</span></label>
            <input type="range" id="ps" min="2" max="9" step="1" value="3"></div></div>`;
          const xs = [1, 2, 3, 4, 5];
          const draw = () => {
            const k = +h.querySelector('#ps').value;
            h.querySelector('#pv').textContent = k;
            h.querySelector('#pt').innerHTML =
              tableHTML([
                ['x', ...xs],
                ['y', ...xs.map(x => k * x)],
                ['y ÷ x', ...xs.map(() => `<b style="color:${RED}">${k}</b>`)]
              ], { fs: 14 }) +
              `<div style="text-align:center;margin-top:14px;font-size:15px;font-weight:800;color:#172033">
                 每一組 y ÷ x 都是 <span style="color:${C};font-size:18px">${k}</span>　⇒　y = ${k}x</div>`;
          };
          h.querySelector('#ps').oninput = draw; draw();
        },
        caption: '拖滑桿換 \\(k\\)：不管 \\(k\\) 是多少，<b>整列 \\(y\\div x\\) 一定同一個數</b>，這就是正比。',
        example: {
          q: '蘋果每公斤 \\(45\\) 元，買 \\(x\\) 公斤付 \\(y\\) 元。\\(y\\) 與 \\(x\\) 成正比嗎？\\(k\\) 是多少？',
          steps: ['\\(y=45x\\)，每一組 \\(y\\div x\\) 都等於 \\(45\\)。', '商固定 ⇒ 成正比。'],
          ans: '成正比，\\(k=45\\)'
        }
      },

      {
        sec: '3-2', secName: '正比與反比',
        title: '正比題三步驟：設 y＝kx → 求 k → 代回',
        points: [
          '題目通常給<b>一組</b>對應值，要你算<b>另一組</b>——別急著硬湊倍數。',
          '標準三步驟：① 設 \\(y=kx\\)　② 代入已知那組求出 \\(k\\)　③ 把 \\(k\\) 代回，求未知的那個。',
          '也可以列比例式 \\(x_1:x_2=y_1:y_2\\)；<b>數字不整除時，求 \\(k\\) 比較不會亂</b>。'
        ],
        formula: { label: '兩種寫法', tex: 'y=kx\\qquad\\text{或}\\qquad x_1:x_2=y_1:y_2' },
        visual: (h) => {
          const grid = () => {
            let s = `<rect x="70" y="46" width="310" height="92" rx="10" fill="#fff" stroke="#cdd6e2" stroke-width="2"/>`;
            s += SV.seg(70, 92, 380, 92, '#cdd6e2', 1.6) + SV.seg(170, 46, 170, 138, '#cdd6e2', 1.6) + SV.seg(275, 46, 275, 138, '#cdd6e2', 1.6);
            s += `<text x="120" y="78" text-anchor="middle" font-size="18" font-weight="900" fill="#657187">x</text>`;
            s += `<text x="120" y="124" text-anchor="middle" font-size="18" font-weight="900" fill="#657187">y</text>`;
            s += `<text x="222" y="78" text-anchor="middle" font-size="18" font-weight="900" fill="#172033">4</text>`;
            s += `<text x="327" y="78" text-anchor="middle" font-size="18" font-weight="900" fill="#172033">10</text>`;
            s += `<text x="222" y="124" text-anchor="middle" font-size="18" font-weight="900" fill="#172033">12</text>`;
            s += `<text x="327" y="124" text-anchor="middle" font-size="20" font-weight="900" fill="${RED}">?</text>`;
            return s;
          };
          SV.stepper(h, '0 0 440 300', [
            { t: '讀題：x = 4 時 y = 12，要求 x = 10 時的 y。', d: () => grid() },
            {
              t: '設 y = kx，把已知那組代進去求出 k。',
              d: () => `<text x="225" y="180" text-anchor="middle" font-size="18" font-weight="800" fill="#172033">設　y = k x</text>` +
                `<text x="225" y="212" text-anchor="middle" font-size="18" font-weight="800" fill="${BLU}">12 = k × 4</text>` +
                `<text x="225" y="246" text-anchor="middle" font-size="20" font-weight="900" fill="${RED}">k = 3</text>`
            },
            {
              t: '把 k = 3 代回 y = 3x，算出未知的 y。',
              d: () => `<rect x="277" y="95" width="101" height="41" fill="#fff"/>` +
                `<text x="327" y="124" text-anchor="middle" font-size="19" font-weight="900" fill="${C}">30</text>` +
                `<text x="225" y="284" text-anchor="middle" font-size="19" font-weight="900" fill="${C}">y = 3 × 10 = 30</text>`
            }
          ]);
        },
        caption: '拖滑桿看三步驟：<b>先把 \\(k\\) 挖出來</b>，剩下的都只是代數字。',
        example: {
          q: '\\(y\\) 與 \\(x\\) 成正比，\\(x=4\\) 時 \\(y=12\\)。求 \\(x=10\\) 時的 \\(y\\)。',
          steps: ['設 \\(y=kx\\)：\\(12=k\\times4\\Rightarrow k=3\\)。', '代回：\\(y=3\\times10=30\\)。'],
          ans: '\\(y=30\\)'
        }
      },

      {
        sec: '3-2', secName: '正比與反比',
        title: '反比：兩量相乘永遠是同一個數',
        points: [
          '\\(x\\) 變成原來的 \\(n\\) 倍時，\\(y\\) 變成原來的 \\(\\dfrac1n\\) 倍，就說 \\(y\\) 與 \\(x\\) 成<span class="k">反比</span>。',
          '判別法：把每一組 \\(x\\times y\\) 算出來，<b>恆為同一個定值 \\(k\\)</b> 才是反比。',
          '關係式 \\(xy=k\\)，也可以寫成 \\(y=\\dfrac{k}{x}\\)（\\(k\\neq0,\\ x\\neq0\\)）。'
        ],
        formula: { label: '反比', tex: 'x\\times y=k\\ (\\text{定值})\\;\\Longleftrightarrow\\;y=\\dfrac{k}{x}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="iv"></div>
            <div class="ictrl"><label>長 x <span class="ival" id="ivv">6</span>　（面積固定 36）</label>
            <input type="range" id="ivs" min="0" max="4" step="1" value="2"></div></div>`;
          const divs = [3, 4, 6, 9, 12], s0 = 16;
          const draw = () => {
            const i = +h.querySelector('#ivs').value;
            const x = divs[i], y = 36 / x;
            h.querySelector('#ivv').textContent = x;
            const ox = 220 - x * s0 / 2, oy = 36 + (192 - y * s0) / 2;
            let s = '';
            for (let r = 0; r < y; r++) for (let c2 = 0; c2 < x; c2++)
              s += `<rect x="${ox + c2 * s0}" y="${oy + r * s0}" width="${s0 - 2}" height="${s0 - 2}" rx="2" fill="${C}" opacity="0.75"/>`;
            s += `<rect x="${ox - 4}" y="${oy - 4}" width="${x * s0 + 6}" height="${y * s0 + 6}" rx="6" fill="none" stroke="${RED}" stroke-width="2"/>`;
            s += `<text x="${ox + x * s0 / 2}" y="${oy + y * s0 + 26}" text-anchor="middle" font-size="14" font-weight="900" fill="#172033">長 x = ${x}</text>`;
            s += `<text x="${ox - 14}" y="${oy + y * s0 / 2 + 5}" text-anchor="end" font-size="14" font-weight="900" fill="#172033">寬 y = ${y}</text>`;
            s += `<text x="220" y="272" text-anchor="middle" font-size="18" font-weight="900" fill="${RED}">x × y = ${x} × ${y} = 36（乘積固定）</text>`;
            h.querySelector('#iv').innerHTML = svg('0 0 440 288', s);
          };
          h.querySelector('#ivs').oninput = draw; draw();
        },
        caption: '面積固定的長方形：<b>長變 \\(2\\) 倍、寬就變一半</b>，格子數（乘積）永遠是 \\(36\\)。',
        example: {
          q: '\\(6\\) 個工人 \\(10\\) 天可完工，改請 \\(15\\) 個工人（效率相同），要幾天？',
          steps: ['人數與天數成反比：\\(xy=k=6\\times10=60\\)。', '\\(15\\times y=60\\Rightarrow y=4\\)。'],
          ans: '\\(4\\) 天'
        }
      },

      {
        sec: '3-2', secName: '正比與反比',
        title: '看表格分辨：商固定是正比，積固定是反比',
        points: [
          '拿到一張表別用猜的，<b>兩個都算一次</b>：先算 \\(y\\div x\\)，再算 \\(x\\times y\\)。',
          '<b>商</b>全部相同 → 正比；<b>積</b>全部相同 → 反比；兩個都不固定 → <b>都不是</b>。',
          '「一個變大、另一個變小」<b>不一定</b>是反比（例如 \\(x+y=10\\)），一定要驗乘積。'
        ],
        formula: { label: '一句話分辨', tex: '\\dfrac{y}{x}=k\\ (\\text{正比})\\qquad x\\,y=k\\ (\\text{反比})' },
        visual: (h) => {
          h.innerHTML = tableHTML([
            ['資料（x = 1, 2, 3）', 'y ÷ x', 'x × y', '結論'],
            ['y : 5, 10, 15', `<b style="color:${C}">5, 5, 5</b><br><span style="font-size:11.5px;color:#657187">商固定</span>`, '5, 20, 45', `<b style="color:${C}">正比</b>`],
            ['y : 12, 6, 4', '12, 3, 4/3', `<b style="color:${BLU}">12, 12, 12</b><br><span style="font-size:11.5px;color:#657187">積固定</span>`, `<b style="color:${BLU}">反比</b>`],
            ['y : 9, 8, 7', '9, 4, 7/3', '9, 16, 21', `<b style="color:${RED}">都不是</b>`]
          ], { fs: 13 }) +
            `<div style="margin-top:12px;font-size:12.5px;color:#657187;text-align:center">
               第三列 \\(x+y=10\\)：\\(y\\) 明明變小了，卻既不是正比也不是反比。</div>`;
        },
        caption: '兩欄都算完再下結論，是這一節最不會出錯的作法。',
        example: {
          q: '\\(x:1,2,3,4\\) 對應 \\(y:24,12,8,6\\)。成正比還是反比？',
          steps: ['\\(y\\div x\\)：\\(24,6,\\dfrac83,\\dfrac32\\) 不固定。', '\\(x\\times y\\)：\\(24,24,24,24\\) 固定。'],
          ans: '成反比，\\(k=24\\)'
        }
      },

      {
        sec: '3-2', secName: '正比與反比',
        title: '易錯：正比反比最常掉的三個坑',
        points: [
          '<b>只看變化方向</b>就下判斷——「一大一小」必須驗過乘積才算數。',
          '<b>公式寫反</b>：正比是 \\(y=kx\\)（除法固定），反比是 \\(xy=k\\)（乘法固定）。',
          '<b>求出 \\(k\\) 就收工</b>——\\(k\\) 一定要代回關係式，把題目真正問的那個量算出來。',
          '別忘了限制：\\(k\\neq0\\)；反比中 \\(x\\neq0\\)、\\(y\\neq0\\)。'
        ],
        visual: (h) => {
          h.innerHTML = xvbox([
            { wl: '看方向就判斷', w: '\\(x\\) 變大、\\(y\\) 變小　⇒　反比', rl: '一定要驗乘積', r: '算 \\(x\\times y\\) 是否恆為定值' },
            { wl: '公式寫反', w: '反比寫成 \\(y=kx\\)', rl: '反比是乘積固定', r: '\\(xy=k\\)，即 \\(y=\\dfrac{k}{x}\\)' },
            { wl: '求完 k 就交卷', w: '算出 \\(k=3\\) 就寫答案', rl: 'k 要代回再算', r: '\\(y=3x\\Rightarrow\\) 代入 \\(x\\) 求 \\(y\\)' }
          ]);
        },
        caption: '正比看「除」、反比看「乘」；\\(k\\) 求出來只是半場，代回去才算完。',
        example: {
          q: '\\(x+y=10\\) 中 \\(x\\) 變大時 \\(y\\) 變小，這是反比嗎？',
          steps: ['取 \\((x,y)=(2,8)\\)：乘積 \\(16\\)。', '取 \\((x,y)=(4,6)\\)：乘積 \\(24\\)。', '乘積不固定 ⇒ 不是反比。'],
          ans: '不是反比'
        }
      }
    ]
  });
})();
