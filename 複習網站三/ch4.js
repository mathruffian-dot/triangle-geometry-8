/* ============ 第 4 章　一元二次方程式 ============
   依康軒版第三冊（八上）課程計畫：4-1 因式分解解一元二次方程式、4-2 配方法與公式解、4-3 應用問題
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#d97706';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }

  // 水平數線：回傳 {s, X}；X(v) 把數值轉成螢幕 x 座標
  function axis(ox, oy, w, lo, hi, tickColor) {
    const X = v => ox + (v - lo) / (hi - lo) * w;
    let s = SV.seg(ox - 14, oy, ox + w + 14, oy, '#8a94a6', 2.4);
    for (let v = lo; v <= hi; v++) {
      s += SV.seg(X(v), oy - 5, X(v), oy + 5, tickColor || '#c3ccdb', 1.6);
      s += `<text x="${X(v)}" y="${oy + 21}" text-anchor="middle" font-size="11" fill="#96a0b3">${v}</text>`;
    }
    return { s, X };
  }

  // 圓角方框＋置中文字
  function box(x, y, w, h, text, col, bg, fs) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13" fill="${bg}" stroke="${col}" stroke-width="2"/>` +
      `<text x="${x + w / 2}" y="${y + h / 2 + 6}" text-anchor="middle" font-size="${fs || 15}" font-weight="900" fill="${col}">${text}</text>`;
  }

  // ✗／✓ 對照表（易錯頁專用）
  function badGood(rows) {
    return `<div style="width:96%;margin:0 auto">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr style="background:#fdf3e3">
          <th style="border:1px solid #e8d9bf;padding:7px;width:46%">✗ 常見錯誤</th>
          <th style="border:1px solid #e8d9bf;padding:7px;width:54%">✓ 正確做法</th>
        </tr>
        ${rows.map((r, i) => `<tr style="background:${i % 2 ? '#fffdf8' : '#fff'}">
          <td style="border:1px solid #e8d9bf;padding:8px;color:${RED};font-weight:700">${r[0]}</td>
          <td style="border:1px solid #e8d9bf;padding:8px;color:${GRN};font-weight:700">${r[1]}</td></tr>`).join('')}
      </table></div>`;
  }

  window.DECK.push({
    ch: 4,
    title: '一元二次方程式',
    color: C,
    sections: ['4-1 因式分解解一元二次方程式', '4-2 配方法與公式解', '4-3 應用問題'],
    slides: [

      /* ---------- 4-1 因式分解解一元二次方程式 ---------- */
      {
        sec: '4-1', secName: '認識方程式',
        title: '先整理成標準式，再看二次項還在不在',
        points: [
          '化簡後能寫成 \\(ax^2+bx+c=0\\)（\\(a\\neq0\\)）的等式，才叫<span class="k">一元二次方程式</span>。',
          '判斷前<b>一定要先移項、先展開</b>，不能只看原式長相。',
          '最大的陷阱：兩邊都有 \\(x^2\\)，整理後<b>二次項互相抵消</b>就降成一次式了。',
          '分母有 \\(x\\)（如 \\(\\frac1x+x=2\\)）不是多項式方程式，不算。'
        ],
        formula: { label: '標準式', tex: 'ax^2+bx+c=0\\quad(a\\neq0)' },
        visual: (h) => {
          const row = (a, b, c, ok) => `<tr>
            <td style="border:1px solid #e8d9bf;padding:8px;text-align:center">\\(${a}\\)</td>
            <td style="border:1px solid #e8d9bf;padding:8px;text-align:center">\\(${b}\\)</td>
            <td style="border:1px solid #e8d9bf;padding:8px;text-align:center;font-weight:800;color:${ok ? GRN : RED}">${c}</td></tr>`;
          h.innerHTML = `<div style="width:97%;margin:0 auto">
            <table style="width:100%;border-collapse:collapse;font-size:13px">
              <tr style="background:#fdf3e3">
                <th style="border:1px solid #e8d9bf;padding:7px">原式</th>
                <th style="border:1px solid #e8d9bf;padding:7px">整理後</th>
                <th style="border:1px solid #e8d9bf;padding:7px">是否合格</th>
              </tr>
              ${row('x^2+3x=5', 'x^2+3x-5=0', '✓ \\(a=1\\)', 1)}
              ${row('x(x-3)=0', 'x^2-3x=0', '✓ \\(a=1\\)', 1)}
              ${row('(x+2)^2=x^2+7', '4x-3=0', '✗ 二次項抵消', 0)}
              ${row('\\tfrac1x+x=2', '\\text{分母有 }x', '✗ 不是多項式', 0)}
            </table>
            <div style="margin-top:10px;font-size:12.5px;color:#657187;text-align:center">
              判斷口訣：<b>先整理 → 再看 \\(x^2\\) 的係數是不是 0</b>。</div></div>`;
        },
        caption: '同樣有 \\(x^2\\)，整理完卻可能不是二次——第三列就是最常被騙的那一型。',
        example: {
          q: '\\((x+1)^2=x^2+2x+k\\) 是一元二次方程式嗎？',
          steps: ['左邊展開：\\(x^2+2x+1=x^2+2x+k\\)。', '兩邊的 \\(x^2\\) 與 \\(2x\\) 都抵消，剩 \\(1=k\\)。'],
          ans: '不是（連未知數都消失了）'
        }
      },

      {
        sec: '4-1', secName: '零乘積性質',
        title: '零乘積性質：右邊是 0 才能拆',
        points: [
          '方程式的<span class="k">解（根）</span>：代進去能讓等號左右<b>真的相等</b>的數。',
          '<b>零乘積性質</b>：兩數相乘等於 0，其中<b>至少一個必為 0</b>。',
          '這是「因式分解解方程式」唯一的理論靠山——<b>先分解、右邊必須是 0</b>。',
          '一元二次方程式最多<b>兩個</b>解，別只寫一個就收工。'
        ],
        formula: { label: '零乘積性質', tex: 'A\\times B=0\\;\\Longrightarrow\\;A=0\\ \\text{或}\\ B=0' },
        visual: (h) => {
          let s = box(140, 26, 160, 52, 'A × B = 0', C, '#fdf3e3', 17);
          s += SV.seg(220, 78, 220, 112, '#8a94a6', 2.4);
          s += SV.seg(110, 112, 330, 112, '#8a94a6', 2.4);
          s += SV.seg(110, 112, 110, 144, '#8a94a6', 2.4);
          s += SV.seg(330, 112, 330, 144, '#8a94a6', 2.4);
          s += box(40, 144, 140, 50, 'A = 0', BLU, '#eef4ff', 17);
          s += box(260, 144, 140, 50, 'B = 0', GRN, '#eef7f2', 17);
          s += `<text x="220" y="176" text-anchor="middle" font-size="15" font-weight="900" fill="${RED}">或</text>`;
          s += `<text x="220" y="228" text-anchor="middle" font-size="13" font-weight="800" fill="#172033">(x−2)(x+5) = 0 → x = 2 或 x = −5</text>`;
          s += `<text x="220" y="250" text-anchor="middle" font-size="12" fill="#657187">右邊若不是 0（如 = 6），這條性質完全不能用</text>`;
          h.innerHTML = svg('0 0 440 275', s);
        },
        caption: '把「＝0」當通行證：分解完右邊是 0，才准把每個括號各自設為 0。',
        example: {
          q: '已知 \\(x=2\\) 是 \\(x^2+kx-6=0\\) 的一個根，求 \\(k\\)。',
          steps: ['把 \\(x=2\\) 代回：\\(4+2k-6=0\\)。', '\\(2k=2\\)，得 \\(k=1\\)。'],
          ans: '\\(k=1\\)'
        }
      },

      {
        sec: '4-1', secName: '提公因式',
        title: '缺常數項就提公因式，千萬別兩邊除以 x',
        points: [
          '沒有常數項時（\\(ax^2+bx=0\\)），直接提出公因式 \\(x\\) 最快。',
          '\\(x^2-kx=0\\Rightarrow x(x-k)=0\\Rightarrow x=0\\) 或 \\(x=k\\)，<b>0 也是一個根</b>。',
          '✗ 兩邊同除以 \\(x\\)：因為 \\(x\\) 可能是 0，<b>除掉就弄丟 \\(x=0\\)</b> 這個根。',
          '拖滑桿改變 \\(k\\)，看兩個根在數線上怎麼跑。'
        ],
        formula: { label: '提公因式', tex: 'x^2-kx=0\\iff x(x-k)=0' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="pf"></div>
            <div class="ictrl"><label>係數 k <span class="ival" id="pv">5</span></label>
            <input type="range" id="ps" min="1" max="9" step="1" value="5"></div></div>`;
          const draw = () => {
            const k = +h.querySelector('#ps').value;
            h.querySelector('#pv').textContent = k;
            const kc = k === 1 ? '' : k;   // 係數 1 不寫出來，避免出現「1x」
            const A = axis(46, 190, 350, -1, 10);
            let s = A.s;
            s += `<text x="220" y="46" text-anchor="middle" font-size="17" font-weight="900" fill="#172033">x² − ${kc}x = 0</text>`;
            s += `<text x="220" y="82" text-anchor="middle" font-size="17" font-weight="900" fill="${C}">x ( x − ${k} ) = 0</text>`;
            s += `<text x="220" y="118" text-anchor="middle" font-size="16" font-weight="900" fill="${GRN}">x = 0　或　x = ${k}</text>`;
            s += SV.dot(A.X(0), 190, RED, 6.5) + SV.dot(A.X(k), 190, GRN, 6.5);
            s += `<text x="${A.X(0)}" y="171" text-anchor="middle" font-size="12" font-weight="900" fill="${RED}">x=0</text>`;
            s += `<text x="${A.X(k)}" y="171" text-anchor="middle" font-size="12" font-weight="900" fill="${GRN}">x=${k}</text>`;
            s += `<text x="220" y="242" text-anchor="middle" font-size="12" fill="${RED}">兩邊除以 x → 紅點那個根就不見了</text>`;
            h.querySelector('#pf').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#ps').oninput = draw; draw();
        },
        caption: '不論 \\(k\\) 多大，\\(x=0\\) 這個根<b>永遠都在</b>——所以絕不能拿 \\(x\\) 去除。',
        example: {
          q: '解 \\(3x^2=12x\\)。',
          steps: ['移項：\\(3x^2-12x=0\\)。', '提公因式：\\(3x(x-4)=0\\)。'],
          ans: '\\(x=0\\) 或 \\(x=4\\)'
        }
      },

      {
        sec: '4-1', secName: '乘法公式',
        title: '看得出公式就直接套：平方差與完全平方',
        points: [
          '<b>平方差型</b> \\(x^2-a^2=0\\)：分解成 \\((x+a)(x-a)=0\\)，兩根<b>互為相反數</b>。',
          '<b>完全平方型</b> \\(x^2\\pm2ax+a^2=0\\)：分解成 \\((x\\pm a)^2=0\\)，只得到<b>一個</b>根。',
          '兩根重合成同一個數，叫做<span class="k">重根</span>；答案只寫一個，但它是<b>兩根相同</b>。',
          '判斷完全平方式：<b>頭尾都是平方、中間是頭尾根號乘積的 2 倍</b>。'
        ],
        formula: { label: '兩個常用型', tex: 'x^2-a^2=0\\Rightarrow x=\\pm a;\\quad (x-a)^2=0\\Rightarrow x=a\\ (\\text{重根})' },
        visual: (h) => {
          const A1 = axis(60, 110, 320, -5, 5);
          const A2 = axis(60, 250, 320, -5, 5);
          let s = `<text x="220" y="42" text-anchor="middle" font-size="15" font-weight="900" fill="${BLU}">x² − 9 = 0 → (x+3)(x−3) = 0</text>`;
          s += A1.s;
          s += SV.dot(A1.X(-3), 110, BLU, 6.5) + SV.dot(A1.X(3), 110, BLU, 6.5);
          s += `<text x="${A1.X(-3)}" y="92" text-anchor="middle" font-size="12" font-weight="900" fill="${BLU}">−3</text>`;
          s += `<text x="${A1.X(3)}" y="92" text-anchor="middle" font-size="12" font-weight="900" fill="${BLU}">3</text>`;
          s += `<text x="220" y="182" text-anchor="middle" font-size="15" font-weight="900" fill="${RED}">x² − 6x + 9 = 0 → (x−3)² = 0</text>`;
          s += A2.s;
          // 重根＝兩點疊在一起：實心點外再加一圈（不用空心圈，以免與不等式的「不含端點」混淆）
          s += `<circle cx="${A2.X(3)}" cy="250" r="9.5" fill="none" stroke="${RED}" stroke-width="2"/>`;
          s += SV.dot(A2.X(3), 250, RED, 6);
          s += `<text x="${A2.X(3)}" y="232" text-anchor="middle" font-size="12" font-weight="900" fill="${RED}">3（重根）</text>`;
          h.innerHTML = svg('0 0 440 285', s);
        },
        caption: '上排兩根對稱分開；下排兩根疊在同一點，就是重根。',
        example: {
          q: '解 \\(4x^2-25=0\\)。',
          steps: ['視為平方差：\\((2x+5)(2x-5)=0\\)。', '\\(2x=-5\\) 或 \\(2x=5\\)。'],
          ans: '\\(x=\\pm\\dfrac52\\)'
        }
      },

      {
        sec: '4-1', secName: '十字交乘',
        title: '先移項化成標準式，再十字交乘',
        points: [
          '\\(x^2+bx+c=0\\)：找兩個數<b>相乘得 \\(c\\)、相加得 \\(b\\)</b>，就能分解。',
          '常數項為<b>正</b> → 兩數同號；為<b>負</b> → 兩數異號，絕對值相減得 \\(b\\)。',
          '右邊不是 0 時<b>絕對不能</b>把括號各自設為那個數，一定要先展開移項。',
          '係數含分數或小數，先乘最小公倍數化成整係數再分解。拖滑桿看完整流程。'
        ],
        formula: { label: '十字交乘原理', tex: '(x+p)(x+q)=x^2+(p+q)x+pq' },
        visual: (h) => {
          const T = (x, y, t, col, fs, w) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${fs || 15}" font-weight="${w || 900}" fill="${col || '#172033'}">${t}</text>`;
          const steps = [
            {
              t: '右邊不是 0，<b>先把左邊展開</b>。',
              d: k => T(220, 46, '(x − 2)(x − 3) = 12', '#172033', 18) +
                `<g opacity="${k.toFixed(2)}">${T(220, 88, 'x² − 5x + 6 = 12', C, 18)}</g>`
            },
            {
              t: '移項，整理成標準式 <b>ax² ＋ bx ＋ c ＝ 0</b>。',
              d: k => `<g opacity="${k.toFixed(2)}">${T(220, 130, 'x² − 5x − 6 = 0', BLU, 18)}</g>`
            },
            {
              t: '找兩數：<b>相乘 −6、相加 −5</b> → −6 與 +1。',
              d: k => `<g opacity="${k.toFixed(2)}">` +
                SV.seg(210, 158, 210, 232, '#c3ccdb', 2) +
                T(160, 182, 'x', '#172033', 17) + T(160, 222, 'x', '#172033', 17) +
                T(264, 182, '−6', RED, 17) + T(264, 222, '+1', GRN, 17) +
                SV.seg(176, 187, 246, 217, '#9aa4b6', 1.8) + SV.seg(176, 217, 246, 187, '#9aa4b6', 1.8) +
                T(330, 205, '−6x + x', '#657187', 13) + T(330, 224, '= −5x ✓', GRN, 13) + `</g>`
            },
            {
              t: '寫成兩括號相乘＝0，再用零乘積性質。',
              d: k => `<g opacity="${k.toFixed(2)}">${T(220, 264, '(x − 6)(x + 1) = 0 → x = 6 或 x = −1', GRN, 16)}</g>`
            }
          ];
          SV.stepper(h, '0 0 440 280', steps);
        },
        caption: '\\((x-2)(x-3)=12\\) 不可以直接拆成 \\(x-2=12\\)；展開移項後才輪到十字交乘上場。',
        example: {
          q: '解 \\(x^2-x-6=0\\)。',
          steps: ['找兩數相乘 \\(-6\\)、相加 \\(-1\\)：\\(-3\\) 與 \\(2\\)。', '\\((x-3)(x+2)=0\\)。'],
          ans: '\\(x=3\\) 或 \\(x=-2\\)'
        }
      },

      {
        sec: '4-1', secName: '易錯提醒',
        title: '這一節的三個地雷：右邊不是 0、除掉 x、漏根',
        points: [
          '✗ \\((x-2)(x-3)=6\\Rightarrow x-2=6\\)。✓ 右邊<b>不是 0 不能拆</b>，先展開移項。',
          '✗ \\(x^2=5x\\) 兩邊除以 \\(x\\) 得 \\(x=5\\)。✓ 移項提公因式，<b>\\(x=0\\) 也是根</b>。',
          '✗ 只寫一個根就結束。✓ 二次方程式<b>先假設有兩根</b>，重根才只寫一個。',
          '✓ 求完一定<b>代回原式</b>驗算，尤其是係數含分數的題目。'
        ],
        formula: { label: '通關條件', tex: '\\text{因式分解} + \\text{右邊}=0\\;\\Rightarrow\\;\\text{才能各自設為 }0' },
        visual: (h) => {
          h.innerHTML = badGood([
            ['\\((x-1)(x+2)=4\\)<br>→ \\(x-1=4\\) 或 \\(x+2=4\\)', '展開移項 \\(x^2+x-6=0\\)<br>→ \\((x+3)(x-2)=0\\)'],
            ['\\(x^2=7x\\) 兩邊除以 \\(x\\)<br>→ \\(x=7\\)（少一根）', '\\(x^2-7x=0\\rightarrow x(x-7)=0\\)<br>→ \\(x=0\\) 或 \\(7\\)'],
            ['\\(\\dfrac{x^2}{2}-x=0\\) 直接分解<br>係數卡分數很容易算錯', '兩邊先乘 2：\\(x^2-2x=0\\)<br>→ \\(x(x-2)=0\\)']
          ]);
        },
        caption: '三種錯法的共同點：<b>沒有先把式子整理乾淨</b>就急著拆括號。',
        example: {
          q: '解 \\((x+1)(x+4)=10\\)。',
          steps: ['展開：\\(x^2+5x+4=10\\)。', '移項：\\(x^2+5x-6=0\\Rightarrow(x+6)(x-1)=0\\)。'],
          ans: '\\(x=-6\\) 或 \\(x=1\\)'
        }
      },

      /* ---------- 4-2 配方法與公式解 ---------- */
      {
        sec: '4-2', secName: '開平方解法',
        title: '看到 \\((x+h)^2=k\\) 就開平方，正負都要寫',
        points: [
          '\\(x^2=k\\)：\\(k>0\\) 有兩解 \\(\\pm\\sqrt k\\)；\\(k=0\\) 只有重根 0；\\(k<0\\) <b>無實數解</b>。',
          '\\((x+h)^2=k\\) 一樣：<b>先開平方</b>得 \\(x+h=\\pm\\sqrt k\\)，<b>再移項</b>。',
          '最常見的失分：只寫 \\(+\\sqrt k\\)，把負的那個根整個忘掉。',
          '拖滑桿改變 \\(k\\)，看解的個數怎麼從 2 個變 1 個再變 0 個。'
        ],
        formula: { label: '開平方', tex: '(x+h)^2=k\\;(k\\ge0)\\;\\Rightarrow\\;x=-h\\pm\\sqrt{k}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="sq"></div>
            <div class="ictrl"><label>k 的值 <span class="ival" id="kv">4</span></label>
            <input type="range" id="ks" min="-4" max="9" step="1" value="4"></div></div>`;
          const draw = () => {
            const k = +h.querySelector('#ks').value;
            h.querySelector('#kv').textContent = k;
            const A = axis(56, 180, 330, -4, 4);
            let s = `<text x="220" y="44" text-anchor="middle" font-size="18" font-weight="900" fill="#172033">x² = ${k}</text>`;
            s += A.s;
            if (k > 0) {
              const r = Math.sqrt(k), txt = Number.isInteger(r) ? r : '√' + k;
              s += `<text x="220" y="84" text-anchor="middle" font-size="16" font-weight="900" fill="${GRN}">x = ± ${txt}　（兩個解）</text>`;
              s += SV.dot(A.X(-r), 180, GRN, 6.5) + SV.dot(A.X(r), 180, GRN, 6.5);
              s += `<text x="${A.X(-r).toFixed(1)}" y="161" text-anchor="middle" font-size="12" font-weight="900" fill="${GRN}">−${txt}</text>`;
              s += `<text x="${A.X(r).toFixed(1)}" y="161" text-anchor="middle" font-size="12" font-weight="900" fill="${GRN}">${txt}</text>`;
            } else if (k === 0) {
              s += `<text x="220" y="84" text-anchor="middle" font-size="16" font-weight="900" fill="${C}">x = 0　（重根，一個解）</text>`;
              s += `<circle cx="${A.X(0)}" cy="180" r="9.5" fill="none" stroke="${C}" stroke-width="2"/>` + SV.dot(A.X(0), 180, C, 6);
              s += `<text x="${A.X(0)}" y="161" text-anchor="middle" font-size="12" font-weight="900" fill="${C}">0</text>`;
            } else {
              s += `<text x="220" y="84" text-anchor="middle" font-size="16" font-weight="900" fill="${RED}">無實數解（平方不會是負的）</text>`;
              s += `<text x="220" y="161" text-anchor="middle" font-size="13" font-weight="800" fill="${RED}">數線上一個點都沒有</text>`;
            }
            s += `<text x="220" y="238" text-anchor="middle" font-size="12" fill="#657187">k 由正變 0 再變負：解從 2 個 → 1 個 → 0 個</text>`;
            h.querySelector('#sq').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#ks').oninput = draw; draw();
        },
        caption: '解的個數完全由<b>右邊 \\(k\\) 的正負</b>決定，這個直覺在 4-2 後面還會用到。',
        example: {
          q: '解 \\((x-3)^2=5\\)。',
          steps: ['開平方：\\(x-3=\\pm\\sqrt5\\)。', '移項：\\(x=3\\pm\\sqrt5\\)。'],
          ans: '\\(x=3\\pm\\sqrt5\\)'
        }
      },

      {
        sec: '4-2', secName: '配方法',
        title: '配方法：補上一次項係數一半的平方',
        points: [
          '目標：把 \\(x^2+bx\\) 補成完全平方，缺的正是 <b>\\((\\frac b2)^2\\)</b> 那一小塊。',
          '步驟：常數移到右邊 → <b>兩邊同加 \\((\\frac b2)^2\\)</b> → 左邊寫成 \\((x+\\frac b2)^2\\) → 開平方。',
          '二次項係數不是 1 時，<b>先把兩邊同除以 \\(a\\)</b> 再開始配方。',
          '拖滑桿改變 \\(b\\)，看右下角那塊「缺角」要補多大。'
        ],
        formula: { label: '配方公式', tex: 'x^2+bx+\\left(\\dfrac{b}{2}\\right)^2=\\left(x+\\dfrac{b}{2}\\right)^2' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="cp"></div>
            <div class="ictrl"><label>一次項係數 b <span class="ival" id="bv">4</span></label>
            <input type="range" id="bs" min="2" max="8" step="2" value="4"></div></div>`;
          const S = 108, ox = 66, oy = 34, u = 13;
          const draw = () => {
            const b = +h.querySelector('#bs').value;
            h.querySelector('#bv').textContent = b;
            const hb = b / 2, hbx = (hb === 1 ? '' : hb) + 'x';   // 係數 1 不寫出來
            const w = hb * u;
            let s = `<rect x="${ox}" y="${oy}" width="${S}" height="${S}" fill="rgba(217,119,6,.16)" stroke="${C}" stroke-width="2"/>`;
            s += `<text x="${ox + S / 2}" y="${oy + S / 2 + 7}" text-anchor="middle" font-size="20" font-weight="900" fill="${C}">x²</text>`;
            s += `<rect x="${ox + S}" y="${oy}" width="${w}" height="${S}" fill="rgba(37,99,235,.14)" stroke="${BLU}" stroke-width="2"/>`;
            s += `<rect x="${ox}" y="${oy + S}" width="${S}" height="${w}" fill="rgba(37,99,235,.14)" stroke="${BLU}" stroke-width="2"/>`;
            s += `<text x="${ox + S + w / 2}" y="${oy + S / 2 + 5}" text-anchor="middle" font-size="12" font-weight="900" fill="${BLU}">${hbx}</text>`;
            s += `<text x="${ox + S / 2}" y="${oy + S + w / 2 + 5}" text-anchor="middle" font-size="12" font-weight="900" fill="${BLU}">${hbx}</text>`;
            s += `<rect x="${ox + S}" y="${oy + S}" width="${w}" height="${w}" fill="rgba(225,29,72,.14)" stroke="${RED}" stroke-width="2.2" stroke-dasharray="5 4"/>`;
            s += `<text x="${ox + S + w + 12}" y="${oy + S + w / 2 + 5}" font-size="13" font-weight="900" fill="${RED}">缺這塊 = ${hb * hb}</text>`;
            s += `<text x="220" y="${oy + S + w + 34}" text-anchor="middle" font-size="16" font-weight="900" fill="#172033">x² + ${b}x + ${hb * hb} = ( x + ${hb} )²</text>`;
            s += `<text x="220" y="${oy + S + w + 56}" text-anchor="middle" font-size="12" fill="#657187">補的那塊永遠是「一次項係數的一半，再平方」</text>`;
            h.querySelector('#cp').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#bs').oninput = draw; draw();
        },
        caption: '兩條長方形各是 \\(\\frac b2 x\\)，把右下角補齊就變成邊長 \\(x+\\frac b2\\) 的大正方形。',
        example: {
          q: '用配方法解 \\(2x^2+8x-10=0\\)。',
          steps: ['兩邊除以 2：\\(x^2+4x-5=0\\)。', '移項並補 \\((\\tfrac42)^2=4\\)：\\((x+2)^2=9\\)。', '開平方：\\(x+2=\\pm3\\)。'],
          ans: '\\(x=1\\) 或 \\(x=-5\\)'
        }
      },

      {
        sec: '4-2', secName: '公式解',
        title: '公式解：把 a、b、c 抄清楚再代進去',
        points: [
          '任何 \\(ax^2+bx+c=0\\)（\\(a\\neq0\\)）都可以用<span class="k">公式解</span>直接算。',
          '代入前先<b>白紙黑字寫下 \\(a,b,c\\) 各是多少</b>，<b>負號要一起抄</b>。',
          '常錯：\\(b=-4\\) 時 \\(-b\\) 是 \\(+4\\) 不是 \\(-4\\)；分母 \\(2a\\) 別忘了乘 2。',
          '算出來的根式要<b>化成最簡根式再約分</b>；需要小數時再用計算機求近似值。'
        ],
        formula: { label: '公式解', tex: 'x=\\dfrac{-b\\pm\\sqrt{b^2-4ac}}{2a}' },
        visual: (h) => {
          const T = (x, y, t, col, fs) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${fs || 16}" font-weight="900" fill="${col || '#172033'}">${t}</text>`;
          const steps = [
            {
              t: '對照標準式，寫下 a、b、c。',
              d: k => T(220, 42, 'x² − 4x + 1 = 0', '#172033', 19) +
                `<g opacity="${k.toFixed(2)}">` +
                box(66, 62, 92, 46, 'a = 1', C, '#fdf3e3', 16) +
                box(174, 62, 92, 46, 'b = −4', BLU, '#eef4ff', 16) +
                box(282, 62, 92, 46, 'c = 1', GRN, '#eef7f2', 16) + `</g>`
            },
            {
              t: '先算<b>根號內</b>的 b² − 4ac。',
              d: k => `<g opacity="${k.toFixed(2)}">${T(220, 142, 'b² − 4ac = (−4)² − 4·1·1 = 12', VIO, 16)}</g>`
            },
            {
              t: '代入公式，注意 <b>−b ＝ ＋4</b>、分母是 2a ＝ 2。',
              d: k => `<g opacity="${k.toFixed(2)}">${T(220, 186, 'x = ( 4 ± √12 ) ÷ 2', C, 17)}</g>`
            },
            {
              t: '化最簡根式再約分，答案才算寫完。',
              d: k => `<g opacity="${k.toFixed(2)}">` + T(220, 224, '√12 = 2√3 → x = ( 4 ± 2√3 ) ÷ 2', '#657187', 14) +
                T(220, 256, 'x = 2 + √3　或　x = 2 − √3', GRN, 17) + `</g>`
            }
          ];
          SV.stepper(h, '0 0 440 275', steps);
        },
        caption: '把 \\(a,b,c\\) 先框起來，代錯符號的機率會少一半。',
        example: {
          q: '用公式解解 \\(2x^2-3x-2=0\\)。',
          steps: ['\\(a=2,\\ b=-3,\\ c=-2\\)，根號內 \\(9+16=25\\)。', '\\(x=\\dfrac{3\\pm5}{4}\\)。'],
          ans: '\\(x=2\\) 或 \\(x=-\\dfrac12\\)'
        }
      },

      {
        sec: '4-2', secName: '解的情形',
        title: '根號內的正負，決定這題有幾個解',
        points: [
          '公式解的關鍵在根號內的 \\(b^2-4ac\\)：它<b>只決定「有幾個解」</b>。',
          '\\(b^2-4ac>0\\)：<b>兩個相異實數解</b>；\\(=0\\)：<b>重根（只有一個解）</b>。',
          '\\(b^2-4ac<0\\)：根號開不出來，<b>沒有實數解</b>。',
          '被問「有幾個解」時，<b>不必真的解完</b>，算根號內那一坨就夠了。'
        ],
        formula: { label: '看根號內', tex: 'b^2-4ac>0,\\;=0,\\;<0\\;\\Rightarrow\\;\\text{兩解、重根、無實數解}' },
        visual: (h) => {
          const rows = [
            { cond: 'b² − 4ac > 0', col: GRN, bg: '#eef7f2', dots: [-1, 1], txt: '兩個相異實數解' },
            { cond: 'b² − 4ac = 0', col: C, bg: '#fdf3e3', dots: [0], txt: '重根（一個解）' },
            { cond: 'b² − 4ac < 0', col: RED, bg: '#fdeef2', dots: [], txt: '沒有實數解' }
          ];
          let s = '';
          rows.forEach((r, i) => {
            const y = 62 + i * 84;
            s += `<rect x="18" y="${y - 30}" width="404" height="60" rx="14" fill="${r.bg}" stroke="${r.col}" stroke-width="1.8"/>`;
            s += `<text x="36" y="${y + 6}" font-size="15" font-weight="900" fill="${r.col}">${r.cond}</text>`;
            s += SV.seg(186, y, 268, y, '#8a94a6', 2);
            if (r.dots.length === 0) {
              s += `<text x="227" y="${y - 8}" text-anchor="middle" font-size="11" fill="${RED}">✗</text>`;
            }
            r.dots.forEach(d => { s += SV.dot(227 + d * 26, y, r.col, 6); });
            s += `<text x="288" y="${y + 6}" font-size="13.5" font-weight="800" fill="#172033">${r.txt}</text>`;
          });
          h.innerHTML = svg('0 0 440 275', s);
        },
        caption: '數線上有幾個點，就是有幾個實數解——根號內的正負一眼決定。',
        example: {
          q: '\\(x^2-6x+9=0\\) 有幾個實數解？',
          steps: ['\\(b^2-4ac=36-4\\times1\\times9=0\\)。', '根號內為 0 ⇒ 重根。'],
          ans: '一個解（重根 \\(x=3\\)）'
        }
      },

      {
        sec: '4-2', secName: '易錯提醒',
        title: '公式解四大失分點：±、係數、負號、約分',
        points: [
          '✗ \\(x^2=9\\Rightarrow x=3\\)。✓ 開平方一定寫 <b>\\(x=\\pm3\\)</b>。',
          '✗ \\(2x^2+8x-6=0\\) 直接配方。✓ <b>先兩邊除以 2</b> 再開始配。',
          '✗ \\(b=-5\\) 時把 \\(-b\\) 寫成 \\(-5\\)。✓ \\(-b=-(-5)=+5\\)，<b>先抄再變號</b>。',
          '✗ \\(\\dfrac{4\\pm2\\sqrt3}{2}=4\\pm\\sqrt3\\)。✓ <b>每一項都要除</b>：\\(2\\pm\\sqrt3\\)。'
        ],
        formula: { label: '約分要整串一起', tex: '\\dfrac{4\\pm2\\sqrt3}{2}=\\dfrac{4}{2}\\pm\\dfrac{2\\sqrt3}{2}=2\\pm\\sqrt3' },
        visual: (h) => {
          h.innerHTML = badGood([
            ['\\((x-1)^2=16\\Rightarrow x-1=4\\)<br>只寫一個根', '\\(x-1=\\pm4\\)<br>\\(x=5\\) 或 \\(x=-3\\)'],
            ['\\(3x^2+6x-9=0\\)<br>直接補 \\((\\tfrac62)^2\\)', '先除以 3：\\(x^2+2x-3=0\\)<br>再補 \\((\\tfrac22)^2=1\\)'],
            ['\\(\\dfrac{6\\pm3\\sqrt2}{3}=6\\pm\\sqrt2\\)', '\\(\\dfrac{6}{3}\\pm\\dfrac{3\\sqrt2}{3}=2\\pm\\sqrt2\\)']
          ]);
        },
        caption: '這四種錯每次段考都出現；寫完先回頭檢查「\\(\\pm\\) 有沒有、除乾淨了沒」。',
        example: {
          q: '解 \\(x^2-2x-4=0\\)，答案化到最簡。',
          steps: ['\\(b^2-4ac=4+16=20\\)，\\(\\sqrt{20}=2\\sqrt5\\)。', '\\(x=\\dfrac{2\\pm2\\sqrt5}{2}\\)，兩項都除以 2。'],
          ans: '\\(x=1\\pm\\sqrt5\\)'
        }
      },

      /* ---------- 4-3 應用問題 ---------- */
      {
        sec: '4-3', secName: '列式四步驟',
        title: '應用題流程：設 → 列 → 解 → 檢驗',
        points: [
          '第一步<b>設未知數</b>：題目問什麼就設什麼，或設其中<b>最基本</b>的那個量。',
          '第二步<b>列式</b>：把「相差」「相乘」「總和」翻成算式，寫出一元二次方程式。',
          '第三步<b>解</b>：先試因式分解，分解不了再用公式解。',
          '第四步<b>檢驗</b>：解出兩根後，<b>一個一個代回題意</b>，不合理的要捨掉。'
        ],
        formula: { label: '常見列式', tex: '\\text{兩數相差 }d:\\;x(x+d)=S' },
        visual: (h) => {
          const items = [
            ['① 設未知數', '設較小的邊長為 x', BLU, '#eef4ff'],
            ['② 依題意列式', 'x(x+3) = 40', C, '#fdf3e3'],
            ['③ 解方程式', 'x² + 3x − 40 = 0', VIO, '#f3edfd'],
            ['④ 檢驗並作答', '負根捨去，記得寫單位', RED, '#fdeef2']
          ];
          let s = '';
          items.forEach((it, i) => {
            const y = 16 + i * 62;
            s += `<rect x="62" y="${y}" width="316" height="46" rx="13" fill="${it[3]}" stroke="${it[2]}" stroke-width="2"/>`;
            s += `<text x="86" y="${y + 29}" font-size="14.5" font-weight="900" fill="${it[2]}">${it[0]}</text>`;
            s += `<text x="366" y="${y + 29}" text-anchor="end" font-size="12.5" fill="#657187">${it[1]}</text>`;
            if (i < 3) s += SV.seg(220, y + 46, 220, y + 62, '#8a94a6', 2.2);
          });
          s += `<text x="220" y="278" text-anchor="middle" font-size="12" fill="${RED}">最容易被扣分的是第 ④ 步：只算不檢驗</text>`;
          h.innerHTML = svg('0 0 440 290', s);
        },
        caption: '四步驟缺一不可；很多同學方程式解對了，卻死在沒檢驗、沒寫單位。',
        example: {
          q: '兩個連續正整數的乘積是 156，求這兩數。',
          steps: ['設較小的為 \\(x\\)，列式 \\(x(x+1)=156\\)。', '\\(x^2+x-156=0\\Rightarrow(x-12)(x+13)=0\\)。', '\\(x=-13\\) 不是正整數，捨去。'],
          ans: '12 與 13'
        }
      },

      {
        sec: '4-3', secName: '面積與道路',
        title: '道路問題：把小路推到邊，剩下就是一塊長方形',
        points: [
          '長方形土地中間開<b>等寬的十字小路</b>，剩下的草地面積怎麼算？',
          '技巧：把小路<b>平移到最右邊與最下面</b>，剩下的草地會併成<b>一整塊長方形</b>。',
          '若地為 \\(a\\times b\\)、路寬 \\(x\\)，草地面積 \\(=(a-x)(b-x)\\)。',
          '拖滑桿改變路寬，看兩張圖的綠色面積<b>始終一樣大</b>。'
        ],
        formula: { label: '平移合併', tex: '(a-x)(b-x)=\\text{草地面積}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="rd"></div>
            <div class="ictrl"><label>小路寬 x（公尺） <span class="ival" id="rv">2</span></label>
            <input type="range" id="rs" min="1" max="5" step="1" value="2"></div></div>`;
          const u = 9, W = 20, H = 16, lx = 22, ly = 58, rx = 232;
          const draw = () => {
            const x = +h.querySelector('#rs').value;
            h.querySelector('#rv').textContent = x;
            let s = `<rect x="${lx}" y="${ly}" width="${W * u}" height="${H * u}" fill="rgba(5,150,105,.18)" stroke="${GRN}" stroke-width="2"/>`;
            s += `<rect x="${lx + 7 * u}" y="${ly}" width="${x * u}" height="${H * u}" fill="#c9ced8" stroke="#8a94a6" stroke-width="1.4"/>`;
            s += `<rect x="${lx}" y="${ly + 6 * u}" width="${W * u}" height="${x * u}" fill="#c9ced8" stroke="#8a94a6" stroke-width="1.4"/>`;
            s += `<text x="${lx + W * u / 2}" y="${ly - 12}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#172033">原圖：20 × 16，路寬 ${x}</text>`;
            s += `<rect x="${rx}" y="${ly}" width="${(W - x) * u}" height="${(H - x) * u}" fill="rgba(5,150,105,.28)" stroke="${GRN}" stroke-width="2.2"/>`;
            s += `<text x="${rx + (W - x) * u / 2}" y="${ly - 12}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${GRN}">平移後：${W - x} × ${H - x}</text>`;
            s += `<text x="${rx + (W - x) * u / 2}" y="${ly + (H - x) * u / 2 + 6}" text-anchor="middle" font-size="15" font-weight="900" fill="${GRN}">${(W - x) * (H - x)}</text>`;
            s += `<text x="220" y="${ly + H * u + 26}" text-anchor="middle" font-size="13.5" font-weight="900" fill="#172033">草地面積 = (20 − ${x})(16 − ${x}) = ${(W - x) * (H - x)} 平方公尺</text>`;
            s += `<text x="220" y="${ly + H * u + 46}" text-anchor="middle" font-size="12" fill="#657187">小路怎麼擺都不影響答案，只看「寬度」</text>`;
            h.querySelector('#rd').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#rs').oninput = draw; draw();
        },
        caption: '灰色小路推到邊緣後，綠色草地併成一塊 \\((20-x)\\times(16-x)\\) 的長方形。',
        example: {
          q: '長 20、寬 16 的長方形地，中間有等寬十字小路，草地 192 平方公尺，求路寬。',
          steps: ['列式 \\((20-x)(16-x)=192\\)。', '展開移項：\\(x^2-36x+128=0\\Rightarrow(x-4)(x-32)=0\\)。', '\\(x=32\\) 比土地還寬，捨去。'],
          ans: '路寬 4 公尺'
        }
      },

      {
        sec: '4-3', secName: '增長率與分配',
        title: '兩個必背模型：連續兩期成長、兩兩配對',
        points: [
          '<b>增長率型</b>：原量 \\(a\\)，連續兩期都成長 \\(x\\)，則 \\(a(1+x)^2=b\\)；衰退就換成 \\((1-x)^2\\)。',
          '解出的 \\(x\\) 是<b>小數（成長率）</b>，負的那個通常不合題意要捨去。',
          '<b>兩兩配對型</b>：\\(n\\) 人握手共 \\(\\dfrac{n(n-1)}{2}\\) 次；<b>互送卡片</b>有去有回，是 \\(n(n-1)\\) 次。',
          '判斷關鍵：<b>會不會重複算</b>——握手兩人只算一次要除以 2，送卡片來回各一次不用除。'
        ],
        formula: { label: '兩個模型', tex: 'a(1\\pm x)^2=b\\qquad \\dfrac{n(n-1)}{2}=\\text{握手次數}' },
        visual: (h) => {
          const cx = 112, cy = 148, R = 62, n = 5;
          const P = [];
          for (let i = 0; i < n; i++) {
            const d = 90 + i * 360 / n;
            P.push(SV.pt(cx, cy, R, d));
          }
          let s = '';
          for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++)
            s += SV.seg(P[i][0], P[i][1], P[j][0], P[j][1], '#c3ccdb', 1.6);
          P.forEach(p => { s += SV.dot(p[0], p[1], BLU, 6); });
          s += `<text x="${cx}" y="46" text-anchor="middle" font-size="13.5" font-weight="900" fill="${BLU}">5 人互相握手</text>`;
          s += `<text x="${cx}" y="238" text-anchor="middle" font-size="13" font-weight="900" fill="#172033">5×4÷2 = 10 次</text>`;
          s += SV.seg(228, 60, 228, 240, '#e3e8f0', 1.6);
          s += `<text x="334" y="46" text-anchor="middle" font-size="13.5" font-weight="900" fill="${C}">連續兩期成長 x</text>`;
          s += box(258, 74, 66, 40, 'a', '#657187', '#f4f6fa', 15);
          s += box(258, 138, 66, 40, 'a(1+x)', C, '#fdf3e3', 12);
          s += box(258, 202, 66, 40, 'b', GRN, '#eef7f2', 15);
          s += SV.seg(291, 114, 291, 136, '#8a94a6', 2);
          s += SV.seg(291, 178, 291, 200, '#8a94a6', 2);
          s += `<text x="336" y="130" font-size="12.5" font-weight="800" fill="${C}">×(1+x)</text>`;
          s += `<text x="336" y="194" font-size="12.5" font-weight="800" fill="${C}">×(1+x)</text>`;
          s += `<text x="334" y="262" text-anchor="middle" font-size="13" font-weight="900" fill="#172033">a(1+x)² = b</text>`;
          h.innerHTML = svg('0 0 440 275', s);
        },
        caption: '左：兩兩連線共 10 條，就是 \\(\\frac{5\\times4}{2}\\)；右：成長兩次就乘兩個 \\((1+x)\\)。',
        example: {
          q: '某校社團人數由 100 人連續兩年成長相同比率，變成 144 人，求年成長率。',
          steps: ['列式 \\(100(1+x)^2=144\\Rightarrow(1+x)^2=1.44\\)。', '\\(1+x=\\pm1.2\\)，取 \\(1+x=1.2\\)（負值不合）。'],
          ans: '成長率 20%'
        }
      },

      {
        sec: '4-3', secName: '檢驗與捨根',
        title: '解完不是結束：兩個根都要回頭檢驗',
        points: [
          '✗ 解出兩根就照抄當答案。✓ <b>每個根都代回題意</b>檢查合不合理。',
          '✗ 邊長寫成 \\(x=-8\\)。✓ 長度、人數、天數、金額<b>不能是負數</b>，要捨去。',
          '✗ 人數算出 \\(4.5\\) 照寫。✓ 人數、件數必須是<b>正整數</b>，不合就捨。',
          '⚠ <b>兩根都合理時要兩個都答</b>（例如兩種售價都能達標），不要亂捨。'
        ],
        formula: { label: '檢驗準則', tex: '\\text{長度、人數、時間}>0\\;\\text{且合乎情境，才是答案}' },
        visual: (h) => {
          let s = `<text x="220" y="30" text-anchor="middle" font-size="13" fill="#657187">長比寬多 3、面積 40 的長方形，求寬</text>`;
          s += box(120, 44, 200, 44, 'x(x+3) = 40', C, '#fdf3e3', 16);
          s += box(120, 100, 200, 40, 'x² + 3x − 40 = 0', VIO, '#f3edfd', 15);
          s += SV.seg(220, 88, 220, 100, '#8a94a6', 2.2);
          s += SV.seg(220, 140, 220, 158, '#8a94a6', 2.2);
          s += SV.seg(112, 158, 328, 158, '#8a94a6', 2.2);
          s += SV.seg(112, 158, 112, 178, '#8a94a6', 2.2);
          s += SV.seg(328, 158, 328, 178, '#8a94a6', 2.2);
          s += box(42, 178, 140, 46, 'x = −8', RED, '#fdeef2', 16);
          s += box(258, 178, 140, 46, 'x = 5', GRN, '#eef7f2', 16);
          s += `<text x="112" y="244" text-anchor="middle" font-size="12.5" font-weight="900" fill="${RED}">✗ 寬不可能是負數</text>`;
          s += `<text x="112" y="262" text-anchor="middle" font-size="12" fill="#657187">捨去</text>`;
          s += `<text x="328" y="244" text-anchor="middle" font-size="12.5" font-weight="900" fill="${GRN}">✓ 寬 5、長 8</text>`;
          s += `<text x="328" y="262" text-anchor="middle" font-size="12" fill="#657187">面積 40 ✓ 合題意</text>`;
          h.innerHTML = svg('0 0 440 275', s);
        },
        caption: '方程式有兩根，<b>題目不一定有兩個答案</b>——檢驗那一步就是在做取捨。',
        example: {
          q: '直角三角形兩股相差 7、斜邊 13，求較短的股。',
          steps: ['設較短股 \\(x\\)，畢氏定理 \\(x^2+(x+7)^2=13^2\\)。', '整理 \\(2x^2+14x-120=0\\Rightarrow x^2+7x-60=0\\)。', '\\((x+12)(x-5)=0\\)，\\(x=-12\\) 為負，捨去。'],
          ans: '較短股 5'
        }
      }
    ]
  });
})();
