/* ============ 第 1 章　數列與級數 ============ */
window.DECK = window.DECK || [];
(function () {
  const C = '#2563eb';

  // 共用：HTML 項方塊列
  function strip(items, opt = {}) {
    const col = opt.color || C;
    return `<div style="display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:2px">` +
      items.map((it, i) => {
        const arrow = it.op ? `<div style="display:flex;flex-direction:column;align-items:center;color:${it.opColor || '#e11d48'};font-weight:900;font-size:13px;padding:0 4px"><span>${it.op}</span><span style="font-size:20px;line-height:0.6">→</span></div>` : '';
        const box = `<div style="text-align:center">
          <div style="min-width:46px;padding:12px 8px;border-radius:12px;background:${it.hl ? col : '#fff'};color:${it.hl ? '#fff' : '#172033'};border:2px solid ${col};font-weight:900;font-size:19px;box-shadow:0 4px 10px rgba(37,99,235,.12)">${it.v}</div>
          ${it.sub ? `<div style="font-size:11px;color:#657187;margin-top:5px;font-weight:700">${it.sub}</div>` : ''}
        </div>`;
        return (i > 0 ? arrow : '') + box;
      }).join('') + `</div>`;
  }

  window.DECK.push({
    ch: 1,
    title: '數列與級數',
    color: C,
    sections: ['1-1 等差數列', '1-2 等差級數', '1-3 等比數列'],
    slides: [

      /* ---------- 1-1 等差數列 ---------- */
      {
        sec: '1-1', secName: '等差數列',
        title: '數列是什麼？認識「項」',
        points: [
          '把一串數依<b>順序</b>排成一列，就是<span class="k">數列</span>。',
          '每個數叫一<span class="k">項</span>：第1項記作 \\(a_1\\)、第2項 \\(a_2\\)…第 \\(n\\) 項 \\(a_n\\)。',
          '\\(a_1\\) 稱<b>首項</b>，最後一項稱<b>末項</b>。'
        ],
        formula: { label: '記法', tex: 'a_1,\\ a_2,\\ a_3,\\ \\cdots,\\ a_n' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%">${strip([
            { v: '3', sub: 'a₁ 首項' }, { v: '7', sub: 'a₂' }, { v: '11', sub: 'a₃' }, { v: '15', sub: 'a₄' }, { v: '19', sub: 'a₅ 末項' }
          ])}</div>`;
        },
        caption: '數列 3, 7, 11, 15, 19 共有 5 項，第 3 項 \\(a_3=11\\)。',
        example: {
          q: '數列 2, 5, 8, 11, 14, … 中，第 4 項 \\(a_4\\) 是多少？',
          steps: ['照順序數：a₁=2、a₂=5、a₃=8、<b>a₄=11</b>。'],
          ans: '\\(a_4 = 11\\)'
        }
      },

      {
        sec: '1-1', secName: '等差數列',
        title: '等差數列與公差 d',
        points: [
          '從第2項起，每一項都比前一項多<b>固定的數</b>，就是<span class="k">等差數列</span>。',
          '這個固定的差叫<span class="k">公差 d</span>：\\(d=a_{n}-a_{n-1}\\)。',
          '\\(d>0\\) 遞增、\\(d<0\\) 遞減、\\(d=0\\) 每項都相同。',
          '拖動下方滑桿，觀察首項與公差如何造出整條數列。'
        ],
        formula: { label: '公差', tex: 'd = a_2-a_1 = a_3-a_2 = \\cdots' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%">
            <div id="seqbox" style="min-height:120px;display:flex;align-items:center;justify-content:center"></div>
            <div class="ictrl">
              <label>首項 a₁ <span class="ival" id="v_a1">2</span></label>
              <input type="range" id="s_a1" min="-5" max="10" value="2">
              <label>公差 d <span class="ival" id="v_d">3</span></label>
              <input type="range" id="s_d" min="-5" max="6" value="3">
            </div></div>`;
          const draw = () => {
            const a1 = +h.querySelector('#s_a1').value, d = +h.querySelector('#s_d').value;
            h.querySelector('#v_a1').textContent = a1;
            h.querySelector('#v_d').textContent = (d >= 0 ? '+' : '') + d;
            const items = [];
            for (let i = 0; i < 5; i++) items.push({ v: a1 + i * d, sub: 'a' + (i + 1), op: i > 0 ? (d >= 0 ? '+' + d : '' + d) : '' });
            h.querySelector('#seqbox').innerHTML = strip(items);
          };
          h.querySelector('#s_a1').oninput = draw;
          h.querySelector('#s_d').oninput = draw;
          draw();
        },
        caption: '每兩項之間都差同一個公差 \\(d\\)，這就是等差數列的靈魂。',
        example: {
          q: '判斷 7, 4, 1, −2, … 是不是等差數列？公差是多少？',
          steps: ['算相鄰差：4−7=−3、1−4=−3、−2−1=−3。', '差都相同 ⇒ 是等差數列，公差 \\(d=-3\\)（遞減）。'],
          ans: '是，\\(d=-3\\)'
        }
      },

      {
        sec: '1-1', secName: '等差數列',
        title: '一般項公式 aₙ = a₁ + (n−1)d',
        points: [
          '要跳到第 100 項，不必一項一項加——用<span class="k">一般項公式</span>。',
          '從 \\(a_1\\) 走到 \\(a_n\\) 共加了 <b>(n−1)</b> 次公差。',
          '所以 \\(a_n=a_1+(n-1)d\\)。'
        ],
        formula: { label: '等差數列一般項', tex: 'a_n = a_1 + (n-1)\\,d' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%">${strip([
            { v: '\\(a_1\\)' }, { v: '\\(a_1+d\\)', op: '+d' }, { v: '\\(a_1+2d\\)', op: '+d' }, { v: '\\(a_1+3d\\)', op: '+d' }, { v: '\\(\\cdots\\)', op: '+d' }, { v: '\\(a_1+(n-1)d\\)', op: '+d' }
          ])}<div style="text-align:center;margin-top:16px;color:#657187;font-size:13px;font-weight:700">第 n 項共加了 <b style="color:${C}">(n−1)</b> 個 d</div></div>`;
        },
        caption: '「加幾個 d」永遠比「第幾項」少 1，這是最常錯的地方。',
        example: {
          q: '等差數列首項 5、公差 4，求第 20 項。',
          steps: ['\\(a_{20}=a_1+(20-1)d\\)', '\\(=5+19\\times4=5+76=81\\)'],
          ans: '\\(a_{20}=81\\)'
        }
      },

      {
        sec: '1-1', secName: '等差數列',
        title: '反過來求：這是第幾項？',
        points: [
          '把已知的 \\(a_n\\) 代入公式，解出 \\(n\\)，就能知道它是第幾項。',
          '若解出的 \\(n\\) <b>不是正整數</b>，代表這個數<b>不在</b>這個數列裡。'
        ],
        formula: { label: '由一般項反解', tex: 'n = \\dfrac{a_n-a_1}{d}+1' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '從一般項出發', tex: 'a_n = a_1 + (n-1)\\,d', color: C, fill: '#eef4ff', border: C, note: '已知 aₙ、a₁、d' },
            { label: '↓　反解出項數 n', tex: 'n = \\dfrac{a_n - a_1}{d} + 1', color: '#e11d48', border: '#e11d48' }
          ]);
        },
        caption: '解得 n 為正整數 ⇒ 是數列中的項；否則就不是。',
        example: {
          q: '等差數列 3, 7, 11, … 中，91 是第幾項？',
          steps: ['\\(a_1=3,\\ d=4\\)。令 \\(a_n=91\\)。', '\\(91=3+(n-1)\\times4\\Rightarrow 88=4(n-1)\\)', '\\(n-1=22\\Rightarrow n=23\\)。'],
          ans: '第 23 項'
        }
      },

      {
        sec: '1-1', secName: '等差數列',
        title: '等差中項：中間項＝兩旁的平均',
        points: [
          '若 \\(a,\\ b,\\ c\\) 三數成等差，則中間的 \\(b\\) 叫<span class="k">等差中項</span>。',
          '因為前後差相等：\\(b-a=c-b\\)，整理得 \\(2b=a+c\\)。',
          '所以中項就是兩旁的<b>平均數</b>。'
        ],
        formula: { label: '等差中項', tex: 'b=\\dfrac{a+c}{2}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%">${strip([
            { v: '8', sub: 'a' }, { v: '?', sub: 'b＝中項', hl: true, op: '+d' }, { v: '20', sub: 'c', op: '+d' }
          ])}<div style="text-align:center;margin-top:18px;font-size:16px;color:#172033;font-weight:800">b = (8 + 20) ÷ 2 = <span style="color:${C}">14</span></div></div>`;
        },
        caption: '看到「成等差」的三個數，馬上想到「中間＝平均」。',
        example: {
          q: '若 \\(x\\)、17、\\(x+10\\) 成等差數列，求 \\(x\\)。',
          steps: ['中項 17＝兩旁平均：\\(17=\\dfrac{x+(x+10)}{2}\\)', '\\(34=2x+10\\Rightarrow 2x=24\\Rightarrow x=12\\)'],
          ans: '\\(x=12\\)'
        }
      },

      /* ---------- 1-2 等差級數 ---------- */
      {
        sec: '1-2', secName: '等差級數',
        title: '級數：把各項「加起來」',
        points: [
          '數列是「排出來」，<span class="k">級數</span>是把各項<b>相加</b>。',
          '前 \\(n\\) 項的和記作 \\(S_n=a_1+a_2+\\cdots+a_n\\)。',
          '等差數列的和 → <b>等差級數</b>。'
        ],
        formula: { label: '前 n 項和', tex: 'S_n=a_1+a_2+a_3+\\cdots+a_n' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%">${strip([
            { v: '3' }, { v: '7', op: '+' , opColor:'#059669'}, { v: '11', op: '+', opColor:'#059669' }, { v: '15', op: '+', opColor:'#059669' }, { v: '19', op: '+', opColor:'#059669' }
          ])}<div style="text-align:center;margin-top:18px"><span style="display:inline-block;background:${C};color:#fff;font-weight:900;font-size:18px;padding:8px 20px;border-radius:12px">S₅ = 55</span></div></div>`;
        },
        caption: '數列談「第幾項」，級數談「加到第幾項的總和」。'
      },

      {
        sec: '1-2', secName: '等差級數',
        title: '高斯的巧思：頭尾配對',
        points: [
          '傳說高斯把 \\(1+2+\\cdots+100\\)，用<b>頭尾配對</b>秒算。',
          '把數列<b>正著寫一次、倒著寫一次</b>，上下相加每組都等於<b>(首項+末項)</b>。',
          '共有 \\(n\\) 組，總和是 \\(n(a_1+a_n)\\)，再除以 2 就是 \\(S_n\\)。',
          '點按鈕看配對演示。'
        ],
        visual: (h) => {
          h.innerHTML = `<div style="width:100%;text-align:center">
            <div id="gauss"></div>
            <div class="ictrl"><button class="ibtn" id="gstep">▶ 下一步</button><button class="ibtn" id="greset">↺ 重來</button></div>
          </div>`;
          const N = 6; // 1..6 示範
          let stage = 0;
          const render = () => {
            const top = [], bot = [], sum = [];
            for (let i = 1; i <= N; i++) { top.push(i); bot.push(N + 1 - i); sum.push(N + 1); }
            const row = (arr, color, show) => `<div style="display:flex;gap:6px;justify-content:center;margin:5px 0">` +
              arr.map(v => `<div style="width:40px;height:40px;line-height:40px;border-radius:9px;font-weight:900;background:${show ? color : '#eef2f8'};color:${show ? '#fff' : '#c3ccdb'};border:2px solid ${show ? color : '#dce3ee'}">${show ? v : '?'}</div>`).join('') + `</div>`;
            let html = `<div style="font-weight:800;color:#657187;font-size:13px;margin-bottom:4px">正著寫 1→6</div>` + row(top, C, stage >= 1);
            html += `<div style="font-weight:800;color:#657187;font-size:13px;margin:6px 0 4px">倒著寫 6→1</div>` + row(bot, '#7c3aed', stage >= 2);
            if (stage >= 3) {
              html += `<div style="font-weight:800;color:#059669;font-size:13px;margin:8px 0 4px">上下相加，每組都是 7</div>` + row(sum, '#059669', true);
            }
            if (stage >= 4) {
              html += `<div style="margin-top:12px;font-size:15px;font-weight:800;color:#172033">共 ${N} 組 × 7 = ${N * (N + 1)}，這是<b>兩倍</b>的和<br>所以 S₆ = ${N * (N + 1)} ÷ 2 = <span style="color:${C};font-size:20px">${N * (N + 1) / 2}</span></div>`;
            }
            h.querySelector('#gauss').innerHTML = html;
          };
          h.querySelector('#gstep').onclick = () => { stage = Math.min(4, stage + 1); render(); };
          h.querySelector('#greset').onclick = () => { stage = 0; render(); };
          render();
        },
        caption: '「正+倒」相加把每組都湊成 (首+末)，這就是求和公式的來源。'
      },

      {
        sec: '1-2', secName: '等差級數',
        title: '等差級數求和公式',
        points: [
          '由頭尾配對得到：\\(S_n=\\dfrac{n(a_1+a_n)}{2}\\)。',
          '若不知道末項 \\(a_n\\)，把 \\(a_n=a_1+(n-1)d\\) 代入 → 另一形式。',
          '口訣：<b>（首項＋末項）× 項數 ÷ 2</b>。'
        ],
        formula: { label: '兩個常用形式', tex: 'S_n=\\dfrac{n(a_1+a_n)}{2}=\\dfrac{n\\,[\\,2a_1+(n-1)d\\,]}{2}' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '（首項＋末項）× 項數 ÷ 2', tex: 'S_n=\\dfrac{n\\,(a_1+a_n)}{2}', color: C, fill: '#eef4ff', border: C, size: 19 },
            { label: '已知末項 aₙ 用這個', tex: 'S_n=\\dfrac{n\\,(a_1+a_n)}{2}', color: '#059669', border: '#cfe8dd', w: '92%', size: 15 },
            { label: '已知公差 d 用這個', tex: 'S_n=\\dfrac{n\\,[\\,2a_1+(n-1)d\\,]}{2}', color: '#d97706', border: '#f0dcc0', w: '92%', size: 15 }
          ], { gap: 10 });
        },
        caption: '兩式選一：看題目給的是「末項」還是「公差」。',
        example: {
          q: '求 3+7+11+…+39 之和。',
          steps: ['先找項數：\\(39=3+(n-1)\\times4\\Rightarrow n=10\\)。', '\\(S_{10}=\\dfrac{10\\,(3+39)}{2}=\\dfrac{10\\times42}{2}=210\\)'],
          ans: '210'
        }
      },

      {
        sec: '1-2', secName: '等差級數',
        title: '連續正整數和 1+2+…+n',
        points: [
          '最常用的特例：\\(1+2+3+\\cdots+n=\\dfrac{n(n+1)}{2}\\)。',
          '幾何解釋：兩個一樣的階梯拼起來，正好是 \\(n\\times(n+1)\\) 的長方形。',
          '取一半，就是階梯（三角形數）的方塊數。'
        ],
        formula: { label: '連續正整數和', tex: '1+2+\\cdots+n=\\dfrac{n(n+1)}{2}' },
        visual: (h) => {
          const n = 5, u = 30, ox = 60, oy = 20;
          let sq = '';
          for (let r = 0; r < n; r++) {
            for (let c = 0; c <= r; c++) sq += `<rect x="${ox + c * u}" y="${oy + r * u}" width="${u - 2}" height="${u - 2}" rx="4" fill="${C}" opacity="0.85"/>`;
            for (let c = r + 1; c < n + 1; c++) sq += `<rect x="${ox + c * u}" y="${oy + r * u}" width="${u - 2}" height="${u - 2}" rx="4" fill="#7c3aed" opacity="0.5"/>`;
          }
          h.innerHTML = `<div style="width:100%;text-align:center"><svg viewBox="0 0 ${ox * 2 + (n + 1) * u} ${oy * 2 + n * u}" style="max-width:100%">
            ${sq}
            <text x="${ox + (n + 1) * u / 2}" y="${oy * 2 + n * u - 2}" text-anchor="middle" font-size="13" fill="#657187">寬 n+1 ＝ 6</text>
            <text x="${ox - 14}" y="${oy + n * u / 2}" text-anchor="middle" font-size="13" fill="#657187" transform="rotate(-90 ${ox - 14} ${oy + n * u / 2})">高 n ＝ 5</text>
          </svg><div style="margin-top:8px;font-size:14px;color:#172033;font-weight:800">藍色階梯 = (5×6)÷2 = <span style="color:${C}">15</span></div></div>`;
        },
        caption: '藍色是 1+2+3+4+5，正好是 5×6 長方形的一半。',
        example: {
          q: '計算 1+2+3+…+50。',
          steps: ['套公式 \\(\\dfrac{n(n+1)}{2}\\)，\\(n=50\\)。', '\\(=\\dfrac{50\\times51}{2}=25\\times51=1275\\)'],
          ans: '1275'
        }
      },

      /* ---------- 1-3 等比數列 ---------- */
      {
        sec: '1-3', secName: '等比數列',
        title: '等比數列與公比 r',
        points: [
          '從第2項起，每項都是前一項<b>乘以固定倍數</b>，就是<span class="k">等比數列</span>。',
          '這個固定倍數叫<span class="k">公比 r</span>：\\(r=\\dfrac{a_n}{a_{n-1}}\\)。',
          '等差是「一直加 d」，等比是「一直乘 r」——拖滑桿比較看看。'
        ],
        formula: { label: '公比', tex: 'r=\\dfrac{a_2}{a_1}=\\dfrac{a_3}{a_2}=\\cdots' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%">
            <div id="geobox" style="min-height:110px;display:flex;align-items:center;justify-content:center"></div>
            <div class="ictrl">
              <label>首項 a₁ <span class="ival" id="gv_a1">2</span></label>
              <input type="range" id="gs_a1" min="1" max="5" value="2">
              <label>公比 r <span class="ival" id="gv_r">2</span></label>
              <input type="range" id="gs_r" min="2" max="4" value="2">
            </div></div>`;
          const draw = () => {
            const a1 = +h.querySelector('#gs_a1').value, r = +h.querySelector('#gs_r').value;
            h.querySelector('#gv_a1').textContent = a1;
            h.querySelector('#gv_r').textContent = '×' + r;
            const items = [];
            for (let i = 0; i < 5; i++) items.push({ v: a1 * Math.pow(r, i), sub: 'a' + (i + 1), op: i > 0 ? '×' + r : '', opColor: '#d97706' });
            h.querySelector('#geobox').innerHTML = strip(items, { color: '#d97706' });
          };
          h.querySelector('#gs_a1').oninput = draw;
          h.querySelector('#gs_r').oninput = draw;
          draw();
        },
        caption: '公比是<b>乘</b>的關係，數值會愈變愈大（或愈小），成長非常快。',
        example: {
          q: '判斷 3, 6, 12, 24, … 的公比，並寫出第 5 項。',
          steps: ['\\(r=6\\div3=2\\)（每項乘 2）。', '\\(a_5=a_4\\times2=24\\times2=48\\)。'],
          ans: '\\(r=2,\\ a_5=48\\)'
        }
      },

      {
        sec: '1-3', secName: '等比數列',
        title: '等比數列一般項 aₙ = a₁·rⁿ⁻¹',
        points: [
          '從 \\(a_1\\) 走到 \\(a_n\\)，共乘了 <b>(n−1)</b> 次公比。',
          '所以 \\(a_n=a_1\\cdot r^{\\,n-1}\\)。',
          '和等差類比：加 → 乘、\\((n-1)d\\) → \\(r^{n-1}\\)。'
        ],
        formula: { label: '等比數列一般項', tex: 'a_n=a_1\\cdot r^{\\,n-1}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%">${strip([
            { v: '\\(a_1\\)' }, { v: '\\(a_1 r\\)', op: '×r', opColor: '#d97706' }, { v: '\\(a_1 r^2\\)', op: '×r', opColor: '#d97706' }, { v: '\\(a_1 r^3\\)', op: '×r', opColor: '#d97706' }, { v: '\\(a_1 r^{n-1}\\)', op: '×r', opColor: '#d97706' }
          ], { color: '#d97706' })}<div style="text-align:center;margin-top:16px;color:#657187;font-size:13px;font-weight:700">第 n 項共乘了 <b style="color:#d97706">(n−1)</b> 個 r</div></div>`;
        },
        caption: 'r 的<b>指數</b>永遠是「項數 − 1」，和等差的 (n−1) 對應。',
        example: {
          q: '等比數列首項 5、公比 2，求第 6 項。',
          steps: ['\\(a_6=a_1\\cdot r^{6-1}=5\\times2^5\\)', '\\(=5\\times32=160\\)'],
          ans: '\\(a_6=160\\)'
        }
      }
    ]
  });
})();
