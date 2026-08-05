/* ============ 第 1 章　整數的運算 ============
   依康軒版第一冊課程計畫：1-1 負數與數線、1-2 整數的加減、
   1-3 整數的乘除與四則運算、1-4 指數記法與科學記號
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#2563eb';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }

  // 數線：回傳 { g, X }；X(v) 把數值轉成螢幕 x 座標
  function numline(v0, v1, x0, x1, y, id, opt) {
    opt = opt || {};
    const X = v => x0 + (v - v0) * (x1 - x0) / (v1 - v0);
    const lab = opt.lab === undefined ? 1 : opt.lab;
    let g = SV.arrowDefs('#5b6478', id);
    g += `<line x1="${x0 - 20}" y1="${y}" x2="${x1 + 24}" y2="${y}" stroke="#5b6478" stroke-width="2.2" marker-end="url(#${id})"/>`;
    for (let v = v0; v <= v1; v++) {
      const px = X(v);
      g += `<line x1="${px.toFixed(1)}" y1="${y - 6}" x2="${px.toFixed(1)}" y2="${y + 6}" stroke="${v === 0 ? '#5b6478' : '#a9b2c2'}" stroke-width="${v === 0 ? 2.4 : 1.3}"/>`;
      if (v % lab === 0) g += `<text x="${px.toFixed(1)}" y="${y + 25}" text-anchor="middle" font-size="12" fill="#7a8496">${v}</text>`;
    }
    return { g, X };
  }

  // ✗ 錯 / ✓ 對　左右對照卡（HTML，交由引擎 typeset MathJax）
  function badGood(rows) {
    return `<div style="width:97%;margin:0 auto;display:flex;flex-direction:column;gap:11px">` +
      rows.map(r => {
        const note = r.note ? `<div style="font-size:12px;color:#657187;text-align:center;margin-top:5px">${r.note}</div>` : '';
        return `<div>
          <div style="display:flex;gap:9px;align-items:stretch">
            <div style="flex:1;background:#fdeef2;border:1.5px solid #f3c3ce;border-radius:12px;padding:9px 8px;text-align:center">
              <div style="font-size:11.5px;font-weight:900;color:${RED};margin-bottom:4px">✗ ${r.badLabel || '常見錯誤'}</div>
              <div style="font-size:15px;color:#172033">\\(${r.bad}\\)</div>
            </div>
            <div style="flex:1;background:#eef7f2;border:1.5px solid #bfe0d1;border-radius:12px;padding:9px 8px;text-align:center">
              <div style="font-size:11.5px;font-weight:900;color:${GRN};margin-bottom:4px">✓ ${r.goodLabel || '正確寫法'}</div>
              <div style="font-size:15px;color:#172033">\\(${r.good}\\)</div>
            </div>
          </div>${note}</div>`;
      }).join('') + `</div>`;
  }

  window.DECK.push({
    ch: 1,
    title: '整數的運算',
    color: C,
    sections: ['1-1 負數與數線', '1-2 整數的加減', '1-3 整數的乘除與四則運算', '1-4 指數記法與科學記號'],
    slides: [

      /* ---------- 1-1 負數與數線 ---------- */
      {
        sec: '1-1', secName: '負數與數線',
        title: '正負號是用來標示「相反方向」的兩個量',
        points: [
          '生活中<b>成對相反</b>的量（零上／零下、收入／支出），先講好哪邊記正，另一邊就記負。',
          '正號常省略不寫：\\(+5\\) 通常直接寫成 \\(5\\)，但負號<b>絕對不能省</b>。',
          '<span class="k">0</span> 既不是正數也不是負數，它是兩邊的<b>分界點</b>——\\(0^\\circ\\text{C}\\) 不代表「沒有溫度」。'
        ],
        formula: { label: '相對的量', tex: '\\text{零上 }5^\\circ\\text{C}=+5,\\qquad \\text{零下 }3^\\circ\\text{C}=-3' },
        visual: (h) => {
          h.innerHTML = svg('0 0 440 296', `
            <rect x="24" y="14" width="392" height="108" rx="14" fill="rgba(37,99,235,.07)" stroke="${BLU}" stroke-width="2"/>
            <text x="70" y="78" text-anchor="middle" font-size="40" font-weight="900" fill="${BLU}">＋</text>
            <text x="120" y="46" font-size="14" fill="#172033">零上 5 度　→　＋5</text>
            <text x="120" y="76" font-size="14" fill="#172033">收入 500 元　→　＋500</text>
            <text x="120" y="106" font-size="14" fill="#172033">海平面上 100 m　→　＋100</text>

            <rect x="24" y="130" width="392" height="46" rx="12" fill="#f1f4f9" stroke="#c7d0de" stroke-width="1.6"/>
            <text x="70" y="162" text-anchor="middle" font-size="30" font-weight="900" fill="#5b6478">0</text>
            <text x="120" y="159" font-size="13.5" fill="#5b6478">不是正數、也不是負數，是分界點</text>

            <rect x="24" y="184" width="392" height="106" rx="14" fill="rgba(225,29,72,.06)" stroke="${RED}" stroke-width="2"/>
            <text x="70" y="246" text-anchor="middle" font-size="40" font-weight="900" fill="${RED}">－</text>
            <text x="120" y="215" font-size="14" fill="#172033">零下 3 度　→　−3</text>
            <text x="120" y="245" font-size="14" fill="#172033">支出 500 元　→　−500</text>
            <text x="120" y="275" font-size="14" fill="#172033">海平面下 50 m　→　−50</text>`);
        },
        caption: '先約定「哪一邊算正」，相反的那一邊就記負；0 站在中間當分界。',
        example: {
          q: '存款 1200 元記為 \\(+1200\\)，那「提款 800 元」怎麼記？\\(-350\\) 又代表什麼？',
          steps: ['存款記正，方向相反的提款就記負。', '提款 800 記 \\(-800\\)；\\(-350\\) 表示提款 350 元。'],
          ans: '\\(-800\\)；提款 350 元'
        }
      },

      {
        sec: '1-1', secName: '負數與數線',
        title: '數線＝原點＋單位長＋正方向，缺一不可',
        points: [
          '畫數線要先定<span class="k">原點</span>（0 的位置），再定<b>單位長</b>（一格多少），再定<b>正方向</b>（習慣向右）。',
          '每個數在數線上都對到<b>唯一一點</b>：看它「離原點幾格、在哪一側」。',
          '常見題型是<b>反推</b>：給你數線上幾個點，先算出<b>一格代表多少</b>，再往左右數。'
        ],
        formula: { label: '數線三要素', tex: '\\text{原點}(0)\\;+\\;\\text{單位長}\\;+\\;\\text{正方向}' },
        visual: (h) => {
          const N = numline(-5, 5, 50, 390, 160, 'nl2');
          let s = N.g;
          s += SV.dot(N.X(0), 160, RED, 5);
          s += `<text x="${N.X(0)}" y="205" text-anchor="middle" font-size="13" font-weight="800" fill="${RED}">原點 O</text>`;
          s += SV.seg(N.X(1), 120, N.X(2), 120, GRN, 2.4);
          s += SV.seg(N.X(1), 114, N.X(1), 126, GRN, 2.4) + SV.seg(N.X(2), 114, N.X(2), 126, GRN, 2.4);
          s += `<text x="${(N.X(1) + N.X(2)) / 2}" y="108" text-anchor="middle" font-size="12.5" font-weight="800" fill="${GRN}">單位長</text>`;
          s += `<text x="396" y="132" font-size="12.5" font-weight="800" fill="${BLU}">正方向 →</text>`;
          s += SV.dot(N.X(-3), 160, BLU, 5.5) + `<text x="${N.X(-3)}" y="145" text-anchor="middle" font-size="13" font-weight="800" fill="${BLU}">A</text>`;
          s += SV.dot(N.X(4), 160, VIO, 5.5) + `<text x="${N.X(4)}" y="145" text-anchor="middle" font-size="13" font-weight="800" fill="${VIO}">B</text>`;
          s += `<text x="220" y="252" text-anchor="middle" font-size="13.5" fill="#172033">A 在原點左邊 3 格 → −3　　B 在右邊 4 格 → 4</text>`;
          h.innerHTML = svg('0 0 440 275', s);
        },
        caption: '定好原點、單位長、正方向，數線上的每一點就對到唯一一個數。',
        example: {
          q: '某數線上，原點右邊第 3 格是 6。求一格代表多少？原點左邊第 2 格是哪個數？',
          steps: ['右邊 3 格是 6 ⇒ 一格 \\(6\\div3=2\\)。', '左邊 2 格 ⇒ \\(-(2\\times2)=-4\\)。'],
          ans: '一格 2；該點為 \\(-4\\)'
        }
      },

      {
        sec: '1-1', secName: '負數與數線',
        title: '相反數：離原點一樣遠、方向相反',
        points: [
          '\\(a\\) 與 \\(-a\\) 在原點<b>兩側</b>、到原點<b>距離相等</b>，互稱<span class="k">相反數</span>。',
          '\\(0\\) 的相反數是 \\(0\\)（它本來就站在原點上）。',
          '連續加負號＝一直翻面：<b>數負號個數</b>，偶數個互相抵銷、奇數個留一個負號。'
        ],
        formula: { label: '相反數', tex: '-(-a)=a,\\qquad -\\left[-(-a)\\right]=-a' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>取 a ＝ <span class="ival" id="av">5</span></label>
            <input type="range" id="as" min="-7" max="7" step="1" value="5"></div></div>`;
          const draw = () => {
            const a = +h.querySelector('#as').value;
            h.querySelector('#av').textContent = a;
            const N = numline(-8, 8, 40, 400, 130, 'nl3');
            let s = N.g;
            s += SV.dot(N.X(0), 130, '#5b6478', 4);
            if (a !== 0) {
              s += SV.seg(N.X(0), 92, N.X(a), 92, BLU, 3);
              s += SV.seg(N.X(0), 92, N.X(-a), 92, RED, 3);
              s += `<text x="${(N.X(0) + N.X(a)) / 2}" y="82" text-anchor="middle" font-size="12" font-weight="800" fill="${BLU}">${Math.abs(a)} 格</text>`;
              s += `<text x="${(N.X(0) + N.X(-a)) / 2}" y="82" text-anchor="middle" font-size="12" font-weight="800" fill="${RED}">${Math.abs(a)} 格</text>`;
            }
            s += SV.dot(N.X(a), 130, BLU, 6) + `<text x="${N.X(a)}" y="118" text-anchor="middle" font-size="13" font-weight="900" fill="${BLU}">a</text>`;
            s += SV.dot(N.X(-a), 130, RED, 6) + `<text x="${N.X(-a)}" y="118" text-anchor="middle" font-size="13" font-weight="900" fill="${RED}">−a</text>`;
            s += `<text x="220" y="212" text-anchor="middle" font-size="15" font-weight="800" fill="#172033">a ＝ ${a}　的相反數是　${-a}</text>`;
            s += `<text x="220" y="244" text-anchor="middle" font-size="12.5" fill="#657187">${a === 0 ? '0 的相反數還是 0' : '兩點在原點兩側，到原點都是 ' + Math.abs(a) + ' 格'}</text>`;
            h.querySelector('#fig').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#as').oninput = draw; draw();
        },
        caption: '拖滑桿看：\\(a\\) 與 \\(-a\\) 永遠對稱地站在原點兩側。',
        example: {
          q: '化簡 \\(-\\left[-(-7)\\right]\\)。',
          steps: ['數負號：共 3 個，奇數個 ⇒ 結果為負。', '絕對值是 7，所以答案是 \\(-7\\)。'],
          ans: '\\(-7\\)'
        }
      },

      {
        sec: '1-1', secName: '負數與數線',
        title: '絕對值是「到原點的距離」，所以不可能是負的',
        points: [
          '\\(|a|\\) 讀作「\\(a\\) 的絕對值」，意思是<b>數線上 \\(a\\) 這一點到原點的距離</b>。',
          '距離不會是負的，所以 \\(|a|\\ge 0\\)，而且只有 \\(|0|=0\\)。',
          '求法很直接：<b>正數照抄、負數把負號拿掉</b>——\\(|7|=7\\)、\\(|-7|=7\\)。',
          '互為相反數的兩個數，<b>絕對值相同</b>（它們離原點一樣遠）。'
        ],
        formula: { label: '絕對值的求法', tex: 'a\\gt 0\\Rightarrow|a|=a;\\quad a\\lt 0\\Rightarrow|a|=-a;\\quad |0|=0' },
        visual: (h) => {
          const N = numline(-6, 6, 46, 394, 170, 'nl4');
          let s = N.g;
          s += SV.seg(N.X(-4), 120, N.X(0), 120, RED, 4);
          s += SV.seg(N.X(0), 120, N.X(4), 120, BLU, 4);
          s += `<text x="${(N.X(-4) + N.X(0)) / 2}" y="108" text-anchor="middle" font-size="13" font-weight="900" fill="${RED}">4 格</text>`;
          s += `<text x="${(N.X(0) + N.X(4)) / 2}" y="108" text-anchor="middle" font-size="13" font-weight="900" fill="${BLU}">4 格</text>`;
          s += SV.dot(N.X(-4), 170, RED, 5.5) + SV.dot(N.X(4), 170, BLU, 5.5) + SV.dot(N.X(0), 170, '#5b6478', 4);
          s += `<text x="${N.X(-4)}" y="72" text-anchor="middle" font-size="16" font-weight="900" fill="${RED}">|−4| = 4</text>`;
          s += `<text x="${N.X(4)}" y="72" text-anchor="middle" font-size="16" font-weight="900" fill="${BLU}">|4| = 4</text>`;
          s += `<text x="220" y="248" text-anchor="middle" font-size="13" fill="#657187">距離只看「有多遠」，不看在左邊還是右邊</text>`;
          h.innerHTML = svg('0 0 440 275', s);
        },
        caption: '\\(-4\\) 與 \\(4\\) 到原點都是 4 格，所以 \\(|-4|=|4|=4\\)。',
        example: {
          q: '計算 \\(|-6|+|3|-|-2|\\)。',
          steps: ['先把每個絕對值各自算出來：\\(6+3-2\\)。', '再做加減：\\(=7\\)。'],
          ans: '\\(7\\)'
        }
      },

      {
        sec: '1-1', secName: '負數與數線',
        title: '比大小：數線上愈右邊的數愈大',
        points: [
          '數線上<b>右邊的數一定比左邊大</b>，所以「任何正數 \\(>0>\\) 任何負數」。',
          '兩個<b>負數</b>比大小：<b>絕對值大的反而小</b>（\\(-7\\lt-3\\)，因為 \\(-7\\) 站得更左邊）。',
          '不畫數線時的口訣：<b>先看正負號，同號再比絕對值</b>。',
          '遞移性：\\(a\\lt b\\)、\\(b\\lt c\\) \\(\\Rightarrow a\\lt c\\)，可以把一整串數排成大小順序。'
        ],
        formula: { label: '兩負數比大小', tex: 'a\\lt 0,\\ b\\lt 0,\\ |a|\\gt|b|\\;\\Longrightarrow\\;a\\lt b' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>把 a 拖到 <span class="ival" id="cv">-6</span>　（另一數固定在 −3）</label>
            <input type="range" id="cs" min="-8" max="8" step="1" value="-6"></div></div>`;
          const draw = () => {
            const a = +h.querySelector('#cs').value;
            h.querySelector('#cv').textContent = a;
            const N = numline(-8, 8, 40, 400, 120, 'nl5');
            let s = N.g;
            s += SV.dot(N.X(-3), 120, '#8a94a6', 6) + `<text x="${N.X(-3)}" y="105" text-anchor="middle" font-size="13" font-weight="900" fill="#5b6478">−3</text>`;
            s += SV.dot(N.X(a), 120, BLU, 7) + `<text x="${N.X(a)}" y="${a === -3 ? 90 : 105}" text-anchor="middle" font-size="13" font-weight="900" fill="${BLU}">a</text>`;
            // 注意：不可直接寫 '<'／'>'，字串進 innerHTML 會被當成標籤起頭吞掉後面內容
            const rel = a < -3 ? '&lt;' : (a > -3 ? '&gt;' : '=');
            const col = a < -3 ? RED : (a > -3 ? GRN : '#5b6478');
            s += `<text x="220" y="205" text-anchor="middle" font-size="22" font-weight="900" fill="${col}">${a} ${rel} −3</text>`;
            const why = a === -3 ? '同一個點，兩數相等' :
              (a < -3 ? 'a 在 −3 的左邊 ⇒ a 比較小' : 'a 在 −3 的右邊 ⇒ a 比較大');
            s += `<text x="220" y="240" text-anchor="middle" font-size="13" fill="#657187">${why}</text>`;
            h.querySelector('#fig').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#cs').oninput = draw; draw();
        },
        caption: '位置決定大小：右邊永遠大。負數愈「深」，反而愈小。',
        example: {
          q: '把 \\(-5,\\ 2,\\ -1,\\ 0,\\ -8\\) 由小到大排列。',
          steps: ['三個負數先排：絕對值大的反而小 ⇒ \\(-8\\lt-5\\lt-1\\)。', '再接上 \\(0\\) 與正數 \\(2\\)。'],
          ans: '\\(-8\\lt-5\\lt-1\\lt 0\\lt 2\\)'
        }
      },

      {
        sec: '1-1', secName: '負數與數線',
        title: '易錯：負號與絕對值，這四個地方最常錯',
        points: [
          '① 看到負號就以為比較小 → ✓ 先比<b>正負號</b>，兩個都是負數時才比絕對值。',
          '② 把 \\(|-5|\\) 寫成 \\(-5\\) → ✓ 絕對值是<b>距離</b>，結果<b>不可能是負的</b>。',
          '③ 把 \\(-(-3)\\) 算成 \\(-3\\) → ✓ 兩個負號抵銷，答案是 \\(3\\)。',
          '④ 陷阱題最愛考 \\(-|-4|\\)：<b>先算絕對值、外面的負號留到最後</b>。'
        ],
        formula: { label: '最容易看錯的一組', tex: '|-4|=4\\qquad\\text{但}\\qquad -|-4|=-4' },
        visual: (h) => {
          h.innerHTML = badGood([
            { bad: '-2\\lt-9', good: '-2\\gt-9', note: '都是負數 ⇒ 絕對值大的反而小' },
            { bad: '|-5|=-5', good: '|-5|=5', note: '絕對值是距離，永遠 ≥ 0' },
            { bad: '-(-3)=-3', good: '-(-3)=3', note: '負號兩個抵銷' },
            { bad: '-|-4|=4', good: '-|-4|=-4', note: '先算 |−4|＝4，外面還有一個負號' }
          ]);
        },
        caption: '這四題全部只差一個符號，卻是段考最愛出的地方。',
        example: {
          q: '計算 \\(-|-4|+|-(-6)|\\)。',
          steps: ['\\(|-4|=4\\)，前面有負號 ⇒ \\(-4\\)。', '\\(-(-6)=6\\)，故 \\(|-(-6)|=6\\)。', '\\(-4+6=2\\)。'],
          ans: '\\(2\\)'
        }
      },

      /* ---------- 1-2 整數的加減 ---------- */
      {
        sec: '1-2', secName: '整數的加減',
        title: '加法就是在數線上走路：加正向右、加負向左',
        points: [
          '從 \\(a\\) 出發，<b>加正數往右走</b>、<b>加負數往左走</b>，停在哪裡就是答案。',
          '這個「走路模型」直接解釋了 \\((+7)+(-3)=+4\\)：先站到 7，再往左走 3 格。',
          '互為相反數的兩數相加得 \\(0\\)（走出去再走回來）；\\(a+0=a\\)（原地不動）。'
        ],
        formula: { label: '兩個基本事實', tex: 'a+(-a)=0,\\qquad a+0=a' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>從 −2 出發，加上 <span class="ival" id="bv">5</span></label>
            <input type="range" id="bs" min="-6" max="6" step="1" value="5"></div></div>`;
          const a = -2;
          const draw = () => {
            const b = +h.querySelector('#bs').value;
            h.querySelector('#bv').textContent = b;
            const N = numline(-9, 7, 34, 404, 140, 'nl7');
            let s = N.g;
            const x1 = N.X(a), x2 = N.X(a + b), col = b >= 0 ? GRN : RED;
            if (b !== 0) {
              s += `<path d="M${x1.toFixed(1)},124 Q${((x1 + x2) / 2).toFixed(1)},68 ${x2.toFixed(1)},124" fill="none" stroke="${col}" stroke-width="3"/>`;
              s += SV.dot(x2, 124, col, 5);
              s += `<text x="${((x1 + x2) / 2).toFixed(1)}" y="60" text-anchor="middle" font-size="13" font-weight="900" fill="${col}">${b > 0 ? '向右走 ' + b + ' 格' : '向左走 ' + (-b) + ' 格'}</text>`;
            }
            s += SV.dot(x1, 140, '#5b6478', 6) + `<text x="${x1.toFixed(1)}" y="172" text-anchor="middle" font-size="12.5" font-weight="800" fill="#5b6478">起點</text>`;
            s += SV.dot(x2, 140, BLU, 7) + `<text x="${x2.toFixed(1)}" y="192" text-anchor="middle" font-size="12.5" font-weight="800" fill="${BLU}">終點</text>`;
            const bs = b < 0 ? `(${b})` : `${b}`;
            s += `<text x="220" y="250" text-anchor="middle" font-size="21" font-weight="900" fill="#172033">(−2) ＋ ${bs} ＝ <tspan fill="${BLU}">${a + b}</tspan></text>`;
            h.querySelector('#fig').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#bs').oninput = draw; draw();
        },
        caption: '加法＝在數線上位移；加負數就是往回走。',
        example: {
          q: '用數線說明 \\((-2)+6\\) 的結果。',
          steps: ['從 \\(-2\\) 出發，加 6 表示向右走 6 格。', '\\(-2\\to4\\)。'],
          ans: '\\(4\\)'
        }
      },

      {
        sec: '1-2', secName: '整數的加減',
        title: '同號相加照抄符號，異號相加取「大的」符號',
        points: [
          '<b>同號</b>相加：兩段箭頭<b>同方向</b>，符號照抄、絕對值<b>相加</b>——\\((-3)+(-5)=-8\\)。',
          '<b>異號</b>相加：兩段箭頭<b>反方向</b>，短的把長的抵銷掉一截，絕對值<b>相減</b>。',
          '剩下的那一段落在哪一邊，答案就取<b>那一邊的符號</b>——\\((+7)+(-3)=+4\\)。',
          '拖 a、b 兩個滑桿，看兩段是「接力往前」還是「互相抵銷」。'
        ],
        formula: { label: '兩條規則', tex: '(-3)+(-5)=-(3+5)=-8\\qquad (+7)+(-3)=+(7-3)=+4' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl">
              <label>a ＝ <span class="ival" id="av8">7</span></label>
              <input type="range" id="as8" min="-8" max="8" step="1" value="7">
              <label>b ＝ <span class="ival" id="bv8">-3</span></label>
              <input type="range" id="bs8" min="-8" max="8" step="1" value="-3">
            </div></div>`;
          const GY = '#9aa4b5', Y1 = 146, Y2 = 92, YL = 192;
          // 純線段（無箭頭）
          const bar = (x1, x2, y, col, w) => (Math.abs(x2 - x1) < 0.5 ? '' :
            `<line x1="${x1.toFixed(1)}" y1="${y}" x2="${x2.toFixed(1)}" y2="${y}" stroke="${col}" stroke-width="${w}"/>`);
          // 有向箭頭（箭頭用多邊形畫，長度固定，不會被 stroke-width 放大）
          const arw = (x1, x2, y, col, w) => {
            if (Math.abs(x2 - x1) < 0.5) return '';
            const d = x2 > x1 ? 1 : -1, xb = (x2 - d * 11).toFixed(1);
            return bar(x1, x2 - d * 9, y, col, w) +
              `<polygon points="${x2.toFixed(1)},${y} ${xb},${y - 6.5} ${xb},${y + 6.5}" fill="${col}"/>`;
          };
          const draw = () => {
            const a = +h.querySelector('#as8').value, b = +h.querySelector('#bs8').value;
            h.querySelector('#av8').textContent = a;
            h.querySelector('#bv8').textContent = b;
            const r = a + b, A = Math.abs(a), B = Math.abs(b), opp = a * b < 0;
            const colA = a >= 0 ? GRN : RED, colB = b >= 0 ? GRN : RED;
            const colR = r > 0 ? GRN : (r < 0 ? RED : '#5b6478');
            const N = numline(-16, 16, 26, 414, YL, 'nl8', { lab: 4 });
            let s = N.g;
            s += SV.seg(N.X(a), Y2 - 16, N.X(a), YL, '#cdd5e2', 1.4, '4 4');
            s += SV.seg(N.X(r), Y2 - 16, N.X(r), YL, '#cdd5e2', 1.4, '4 4');
            if (!opp) {                       // 同號（或其中一個是 0）：兩段同向接力
              s += arw(N.X(0), N.X(a), Y1, colA, 4.5);
              s += arw(N.X(a), N.X(r), Y2, colB, 4.5);
            } else {                          // 異號：重疊的部分互相抵銷（畫灰色）
              const c = B <= A ? r : 0;       // 抵銷結束的位置
              s += bar(N.X(0), N.X(c), Y1, colA, A > B ? 7 : 4.5);
              s += arw(N.X(c), N.X(a), Y1, GY, 4.5);
              s += (B <= A ? arw(N.X(a), N.X(c), Y2, GY, 4.5) : bar(N.X(a), N.X(c), Y2, GY, 4.5));
              s += arw(N.X(c), N.X(r), Y2, colB, 7);
              s += `<text x="${((N.X(a) + N.X(c)) / 2).toFixed(1)}" y="${Y2 + 22}" text-anchor="middle" font-size="12" font-weight="800" fill="${GY}">抵銷 ${Math.min(A, B)} 格</text>`;
            }
            if (a !== 0) s += `<text x="${((N.X(0) + N.X(a)) / 2).toFixed(1)}" y="${Y1 - 13}" text-anchor="middle" font-size="12" font-weight="800" fill="${colA}">a：${a > 0 ? '向右' : '向左'} ${A} 格</text>`;
            if (b !== 0) s += `<text x="${((N.X(a) + N.X(r)) / 2).toFixed(1)}" y="${Y2 - 13}" text-anchor="middle" font-size="12" font-weight="800" fill="${colB}">b：${b > 0 ? '向右' : '向左'} ${B} 格</text>`;
            const mid = ((N.X(0) + N.X(r)) / 2).toFixed(1);
            if (opp) {
              s += r === 0
                ? `<text x="220" y="${Y1 + 24}" text-anchor="middle" font-size="13" font-weight="800" fill="#657187">兩段一樣長，剛好抵銷完</text>`
                : `<text x="${mid}" y="${Y1 + 24}" text-anchor="middle" font-size="13.5" font-weight="900" fill="${colR}">剩 ${Math.abs(r)} 格</text>`;
            } else if (a !== 0 && b !== 0) {
              s += `<text x="${mid}" y="${Y1 + 24}" text-anchor="middle" font-size="13.5" font-weight="900" fill="${colR}">長度相加 ${A}＋${B}＝${Math.abs(r)} 格</text>`;
            }
            s += SV.dot(N.X(0), YL, '#5b6478', 4) + SV.dot(N.X(r), YL, colR, 6.5);
            s += `<text x="220" y="252" text-anchor="middle" font-size="24" font-weight="900" fill="#172033">(${a}) ＋ (${b}) ＝ <tspan fill="${colR}">${r}</tspan></text>`;
            const hint = opp
              ? (r === 0 ? '兩段一樣長就完全抵銷 ⇒ 和是 0'
                : `剩 ${Math.abs(r)} 格，符號跟著比較長的那一段（${A > B ? 'a' : 'b'}）`)
              : (a === 0 || b === 0 ? '其中一個是 0 ⇒ 直接照抄另一個數'
                : '兩段同方向 ⇒ 符號照抄、長度相加');
            s += `<text x="220" y="277" text-anchor="middle" font-size="12.5" fill="#657187">${hint}</text>`;
            h.querySelector('#fig').innerHTML = svg('0 0 440 288', s);
          };
          h.querySelector('#as8').oninput = draw;
          h.querySelector('#bs8').oninput = draw;
          draw();
        },
        caption: '同向就「接力加長」，反向就「互相抵銷」；剩下的那一段決定符號與大小。',
        example: {
          q: '計算 \\((-12)+(+5)+(-3)\\)。',
          steps: ['\\((-12)+(+5)\\)：異號，取負號、\\(12-5=7\\Rightarrow-7\\)。', '\\((-7)+(-3)\\)：同號，\\(-(7+3)=-10\\)。'],
          ans: '\\(-10\\)'
        }
      },

      {
        sec: '1-2', secName: '整數的加減',
        title: '減法先變加法，才能自由搬動位置',
        points: [
          '<b>減去一個數＝加上它的相反數</b>：\\(a-b=a+(-b)\\)。',
          '因為<b>加法與乘法</b>才有交換律與結合律、<b>減法沒有</b>，所以先全部換成加法。',
          '減法真的不能搬：\\(5-3=2\\) 但 \\(3-5=-2\\)，兩邊並不相等。',
          '換成加法後，正的歸正的、負的歸負的，一次算完又快又不易錯。'
        ],
        formula: { label: '減法轉加法', tex: 'a-b=a+(-b)' },
        visual: (h) => {
          const rows = [
            {
              lab: '① 原式', e: '8 − 15 + 7 − 4', c: '#5b6478', bg: '#f4f6fa',
              t: '式子裡有加也有減，這時候<b>還不能</b>隨便搬動位置。'
            },
            {
              lab: '② 全部改寫成加法', e: '8 + (−15) + 7 + (−4)', c: BLU, bg: '#eef4ff',
              t: '每個減號都換成「加上相反數」：−15 變 +(−15)、−4 變 +(−4)。'
            },
            {
              lab: '③ 用交換律、結合律分組', e: '(8 + 7) + [(−15) + (−4)]', c: VIO, bg: '#f3eefd',
              t: '全部都是加法了才可以搬：<b>正的歸正的、負的歸負的</b>。'
            },
            {
              lab: '④ 兩個小計相加', e: '15 + (−19) = −4', c: GRN, bg: '#eef7f2',
              t: '8+7=15、(−15)+(−4)=−19，異號相加取負號 ⇒ <b>−4</b>。'
            }
          ];
          SV.stepper(h, '0 0 440 282', rows.map((r, i) => ({
            t: r.t,
            d: (k) => {
              let s = '';
              for (let j = 0; j <= i; j++) {
                const cur = j === i, op = (cur ? Math.max(0.15, k) : 0.34).toFixed(2), y = 18 + j * 64;
                s += `<rect x="20" y="${y}" width="400" height="56" rx="13" fill="${cur ? rows[j].bg : '#f7f9fc'}" stroke="${cur ? rows[j].c : '#e2e8f2'}" stroke-width="${cur ? 2.2 : 1.2}" opacity="${op}"/>`;
                s += `<text x="34" y="${y + 18}" font-size="11.5" font-weight="900" fill="${rows[j].c}" opacity="${op}">${rows[j].lab}</text>`;
                s += `<text x="220" y="${y + 44}" text-anchor="middle" font-size="${cur ? 20 : 17}" font-weight="${cur ? 900 : 700}" fill="#172033" opacity="${op}">${rows[j].e}</text>`;
              }
              return s;
            }
          })), { acc: false });
        },
        caption: '拖滑桿走四步：先換成加法，才有資格「正的歸正的、負的歸負的」。',
        example: {
          q: '計算 \\(13-25+7-5\\)。',
          steps: ['改寫：\\(13+(-25)+7+(-5)\\)。', '分組：\\((13+7)+\\left[(-25)+(-5)\\right]=20+(-30)\\)。', '\\(=-10\\)。'],
          ans: '\\(-10\\)'
        }
      },

      {
        sec: '1-2', secName: '整數的加減',
        title: '易錯：括號前是負號，裡面每一項都要變號',
        points: [
          '括號前是<b>加號</b>：直接把括號拿掉，裡面<b>照抄</b>——\\(+(a+b)=a+b\\)。',
          '括號前是<b>負號</b>：括號內<b>每一項</b>都要變號——\\(-(a+b)=-a-b\\)、\\(-(a-b)=-a+b\\)。',
          '最常見的錯：把 \\(-(5-8)\\) 寫成 \\(-5-8\\)。✓ 第二項也要變，應為 \\(-5+8=3\\)。',
          '檢查招數：拿數字代進去驗算一次，兩邊不一樣就是變號漏了。'
        ],
        formula: { label: '去括號', tex: '-(a+b)=-a-b,\\qquad -(a-b)=-a+b' },
        visual: (h) => {
          h.innerHTML = badGood([
            { bad: '-(5-8)=-5-8=-13', good: '-(5-8)=-5+8=3', note: '括號內第二項也要變號' },
            { bad: '12-(7-10)=12-7-10', good: '12-(7-10)=12-7+10=15', note: '負號要分配給括號裡的每一項' },
            { bad: '-(-2+6)=2+6', good: '-(-2+6)=2-6=-4', note: '兩項都變：−2 變 +2、+6 變 −6' }
          ]);
        },
        caption: '負號在括號前＝「全部翻面」，翻一半是最常見的失分點。',
        example: {
          q: '計算 \\(20-\\left[8-(3-11)\\right]\\)。',
          steps: ['最內層：\\(3-11=-8\\)。', '\\(20-\\left[8-(-8)\\right]=20-16\\)。', '\\(=4\\)。'],
          ans: '\\(4\\)'
        }
      },

      {
        sec: '1-2', secName: '整數的加減',
        title: '數線上兩點的距離＝\\(|a-b|\\)',
        points: [
          '數線上 \\(a\\)、\\(b\\) 兩點的<b>距離</b>寫成 \\(|a-b|\\)，也等於 \\(|b-a|\\)——距離沒有方向。',
          '實際算的時候直接<b>大的減小的</b>，答案一定是正的，不會算錯符號。',
          '含絕對值的算式要<b>先把每個絕對值算出值</b>，再做加減：\\(|-3|+|5-9|=3+4=7\\)。'
        ],
        formula: { label: '兩點距離', tex: 'a\\text{、}b\\text{ 兩點的距離}=|a-b|=|b-a|' },
        visual: (h) => {
          const N = numline(-7, 5, 44, 396, 175, 'nl11');
          let s = N.g;
          s += SV.seg(N.X(-4), 120, N.X(3), 120, VIO, 4.5);
          s += SV.seg(N.X(-4), 112, N.X(-4), 128, VIO, 2.4) + SV.seg(N.X(3), 112, N.X(3), 128, VIO, 2.4);
          s += `<text x="${(N.X(-4) + N.X(3)) / 2}" y="106" text-anchor="middle" font-size="14" font-weight="900" fill="${VIO}">7 格</text>`;
          s += SV.dot(N.X(-4), 175, RED, 6) + `<text x="${N.X(-4)}" y="160" text-anchor="middle" font-size="14" font-weight="900" fill="${RED}">A</text>`;
          s += SV.dot(N.X(3), 175, BLU, 6) + `<text x="${N.X(3)}" y="160" text-anchor="middle" font-size="14" font-weight="900" fill="${BLU}">B</text>`;
          s += `<text x="220" y="238" text-anchor="middle" font-size="17" font-weight="800" fill="#172033">|3 − (−4)| = |7| = 7</text>`;
          s += `<text x="220" y="262" text-anchor="middle" font-size="12.5" fill="#657187">反過來 |(−4) − 3| = |−7| = 7，答案一樣</text>`;
          h.innerHTML = svg('0 0 440 275', s);
        },
        caption: '不管誰減誰，套上絕對值之後都是同一段距離。',
        example: {
          q: '數線上 \\(A\\) 點在 \\(-6\\)、\\(B\\) 點在 \\(2\\)，求 \\(A\\)、\\(B\\) 兩點的距離。',
          steps: ['距離 \\(=|2-(-6)|=|8|\\)。', '\\(=8\\)。'],
          ans: '\\(8\\)'
        }
      },

      /* ---------- 1-3 整數的乘除與四則運算 ---------- */
      {
        sec: '1-3', secName: '整數的乘除與四則運算',
        title: '乘法定號：同號得正、異號得負',
        points: [
          '情境理解：水位每天<b>下降</b> 3 公分記 \\(-3\\)；<b>3 天後</b>記 \\(+3\\)、<b>3 天前</b>記 \\(-3\\)。',
          '\\((-3)\\times3=-9\\)（三天後低 9 公分）；\\((-3)\\times(-3)=+9\\)（三天前<b>高</b> 9 公分）。',
          '這就是「負負得正」；算則兩步驟：<b>先定符號，再乘絕對值</b>。',
          '特例：\\(a\\times0=0\\)、\\(a\\times1=a\\)、\\(a\\times(-1)=-a\\)（乘 \\(-1\\) 等於取相反數）。'
        ],
        formula: { label: '符號規則', tex: '(+)\\times(+)=(+),\\ (-)\\times(-)=(+),\\ (+)\\times(-)=(-)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl">
              <label>每日 d <span class="ival" id="dv3">-3</span></label>
              <input type="range" id="ds3" min="-3" max="3" step="1" value="-3">
              <label>天數 t <span class="ival" id="tv3">-3</span></label>
              <input type="range" id="ts3" min="-3" max="3" step="1" value="-3">
            </div></div>`;
          const XL = 30, XR = 146, TOP = 26, BOT = 186, BASE = 106;
          const TX = v => 315 + v * 31;
          const cellX = [272, 344], cellY = [134, 161];
          const draw = () => {
            const d = +h.querySelector('#ds3').value, t = +h.querySelector('#ts3').value;
            h.querySelector('#dv3').textContent = d;
            h.querySelector('#tv3').textContent = t;
            const p = d * t, sy = BASE - p * 8;
            const col = p > 0 ? BLU : (p < 0 ? RED : '#8a94a6');
            let s = '';
            /* ---- 左半：水槽剖面 ---- */
            s += `<rect x="${XL}" y="${TOP}" width="${XR - XL}" height="${BOT - TOP}" rx="6" fill="#f7f9fc" stroke="#5b6478" stroke-width="2.4"/>`;
            s += `<rect x="${XL + 3}" y="${sy}" width="${XR - XL - 6}" height="${BOT - sy - 3}" fill="${p >= 0 ? 'rgba(37,99,235,.20)' : 'rgba(225,29,72,.14)'}"/>`;
            s += SV.seg(XL + 3, sy, XR - 3, sy, col, 3.2);
            s += SV.seg(XL - 6, BASE, XR + 8, BASE, '#8a94a6', 1.6, '5 4');
            s += `<text x="${XR + 12}" y="${BASE + 4}" font-size="10.5" fill="#8a94a6">基準</text>`;
            if (p !== 0) {
              const dir = p > 0 ? -1 : 1, yb = (sy - dir * 11).toFixed(1);
              s += SV.seg(62, BASE, 62, sy - dir * 10, col, 3);
              s += `<polygon points="62,${sy} 56,${yb} 68,${yb}" fill="${col}"/>`;
              s += `<text x="106" y="${((BASE + sy) / 2 + 5).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="900" fill="${col}">${p > 0 ? '升' : '降'} ${Math.abs(p)} 公分</text>`;
            }
            s += `<text x="88" y="206" text-anchor="middle" font-size="11.5" font-weight="800" fill="#5b6478">水槽剖面</text>`;
            /* ---- 右上：時間軸 ---- */
            s += `<text x="315" y="34" text-anchor="middle" font-size="12" font-weight="900" fill="#5b6478">時間軸（天）</text>`;
            s += SV.seg(TX(-3) - 16, 64, TX(3) + 18, 64, '#5b6478', 2);
            s += `<polygon points="${TX(3) + 22},64 ${TX(3) + 12},59 ${TX(3) + 12},69" fill="#5b6478"/>`;
            for (let v = -3; v <= 3; v++) {
              s += SV.seg(TX(v), 58, TX(v), 70, v === 0 ? '#5b6478' : '#a9b2c2', v === 0 ? 2.2 : 1.2);
              s += `<text x="${TX(v)}" y="84" text-anchor="middle" font-size="10.5" fill="#8a94a6">${v}</text>`;
            }
            s += SV.dot(TX(t), 64, VIO, 6);
            s += `<text x="${TX(t)}" y="50" text-anchor="middle" font-size="12" font-weight="900" fill="${VIO}">${t === 0 ? '今天' : (t > 0 ? t + ' 天後' : (-t) + ' 天前')}</text>`;
            s += `<text x="315" y="102" text-anchor="middle" font-size="10.5" fill="#8a94a6">負：幾天前　　正：幾天後</text>`;
            /* ---- 右下：2×2 規則表（結論） ---- */
            s += `<text x="314" y="130" text-anchor="middle" font-size="11" font-weight="900" fill="#5b6478">× 正</text>`;
            s += `<text x="386" y="130" text-anchor="middle" font-size="11" font-weight="900" fill="#5b6478">× 負</text>`;
            s += `<text x="242" y="152" text-anchor="middle" font-size="11" font-weight="900" fill="#5b6478">正 ×</text>`;
            s += `<text x="242" y="179" text-anchor="middle" font-size="11" font-weight="900" fill="#5b6478">負 ×</text>`;
            for (let ri = 0; ri < 2; ri++) {
              for (let ci = 0; ci < 2; ci++) {
                const pos = (ri === 0) === (ci === 0);
                const on = d !== 0 && t !== 0 && (d > 0 ? 0 : 1) === ri && (t > 0 ? 0 : 1) === ci;
                s += `<rect x="${cellX[ci]}" y="${cellY[ri]}" width="72" height="27" rx="7" fill="${on ? (pos ? 'rgba(37,99,235,.18)' : 'rgba(225,29,72,.15)') : '#f4f6fa'}" stroke="${on ? (pos ? BLU : RED) : '#dce3ee'}" stroke-width="${on ? 2 : 1}"/>`;
                s += `<text x="${cellX[ci] + 36}" y="${cellY[ri] + 20}" text-anchor="middle" font-size="16" font-weight="900" fill="${pos ? BLU : RED}">${pos ? '＋' : '－'}</text>`;
              }
            }
            s += `<text x="314" y="206" text-anchor="middle" font-size="10.5" fill="#8a94a6">同號得正、異號得負</text>`;
            /* ---- 底部：算式與結論 ---- */
            const ds = d < 0 ? `(${d})` : `${d}`, ts = t < 0 ? `(${t})` : `${t}`;
            s += `<text x="220" y="238" text-anchor="middle" font-size="24" font-weight="900" fill="#172033">${ds} × ${ts} ＝ <tspan fill="${col}">${p}</tspan></text>`;
            if (d < 0 && t < 0) {
              s += `<rect x="132" y="252" width="176" height="30" rx="15" fill="rgba(37,99,235,.12)" stroke="${BLU}" stroke-width="1.8"/>`;
              s += `<text x="220" y="272" text-anchor="middle" font-size="14" font-weight="900" fill="${BLU}">負 × 負 ＝ 正</text>`;
            } else {
              s += `<text x="220" y="272" text-anchor="middle" font-size="12.5" fill="#657187">先定符號，再把絕對值相乘</text>`;
            }
            h.querySelector('#fig').innerHTML = svg('0 0 440 288', s);
          };
          h.querySelector('#ds3').oninput = draw;
          h.querySelector('#ts3').oninput = draw;
          draw();
        },
        caption: '拖 d 與 t：水位往上（藍）或往下（紅），正負就是 \\(d\\times t\\) 的符號。',
        example: {
          q: '計算 \\((-4)\\times(-6)\\times(+2)\\)。',
          steps: ['\\((-4)\\times(-6)=+24\\)（同號得正）。', '\\(24\\times2=48\\)。'],
          ans: '\\(48\\)'
        }
      },

      {
        sec: '1-3', secName: '整數的乘除與四則運算',
        title: '運算律總表：誰可以搬、誰不能搬',
        points: [
          '<b>加法與乘法</b>都有<b>交換律</b>與<b>結合律</b>，位置和分組都可以任意搬。',
          '<b>減法與除法兩個都沒有</b>：\\(5-3\\neq3-5\\)、\\(8\\div4\\neq4\\div8\\)。',
          '<b>分配律</b>是唯一把乘法和加減接起來的規律：先分給每一項再算。'
        ],
        formula: { label: '交換律', tex: 'a+b=b+a,\\quad a\\times b=b\\times a' },
        visual: (h) => {
          const cols = [{ op: '＋', ok: true }, { op: '－', ok: false }, { op: '×', ok: true }, { op: '÷', ok: false }];
          const ex = [
            [['3 + 5 = 8', '5 + 3 = 8'], ['5 − 3 = 2', '3 − 5 = −2'], ['3 × 5 = 15', '5 × 3 = 15'], ['8 ÷ 4 = 2', '4 ÷ 8 = 0.5']],
            [['(2+3)+4 = 9', '2+(3+4) = 9'], ['(9−4)−2 = 3', '9−(4−2) = 7'], ['(2×3)×4 = 24', '2×(3×4) = 24'], ['(36÷6)÷3 = 2', '36÷(6÷3) = 18']]
          ];
          const rws = [{ n: '交換律', sub: '換位置' }, { n: '結合律', sub: '換分組' }];
          const cx = [92, 176, 260, 344], cw = 84;
          let s = `<rect x="12" y="26" width="80" height="34" rx="9" fill="#f1f4f9" stroke="#dce3ee" stroke-width="1.2"/>`;
          cols.forEach((c, i) => {
            s += `<rect x="${cx[i] + 2}" y="26" width="${cw - 4}" height="34" rx="9" fill="#f1f4f9" stroke="#dce3ee" stroke-width="1.2"/>`;
            s += `<text x="${cx[i] + cw / 2}" y="52" text-anchor="middle" font-size="22" font-weight="900" fill="#5b6478">${c.op}</text>`;
          });
          rws.forEach((r, ri) => {
            const ry = 60 + ri * 92;
            s += `<text x="52" y="${ry + 42}" text-anchor="middle" font-size="14" font-weight="900" fill="#5b6478">${r.n}</text>`;
            s += `<text x="52" y="${ry + 62}" text-anchor="middle" font-size="10.5" fill="#8a94a6">${r.sub}</text>`;
            cols.forEach((c, ci) => {
              s += `<rect x="${cx[ci] + 2}" y="${ry + 3}" width="${cw - 4}" height="86" rx="11" fill="${c.ok ? 'rgba(5,150,105,.07)' : 'rgba(225,29,72,.06)'}" stroke="${c.ok ? '#bfe0d1' : '#f3c3ce'}" stroke-width="1.5"/>`;
              s += `<text x="${cx[ci] + cw / 2}" y="${ry + 36}" text-anchor="middle" font-size="26" font-weight="900" fill="${c.ok ? GRN : RED}">${c.ok ? '✓' : '✗'}</text>`;
              s += `<text x="${cx[ci] + cw / 2}" y="${ry + 60}" text-anchor="middle" font-size="10.5" fill="#172033">${ex[ri][ci][0]}</text>`;
              s += `<text x="${cx[ci] + cw / 2}" y="${ry + 78}" text-anchor="middle" font-size="10.5" font-weight="${c.ok ? 400 : 800}" fill="${c.ok ? '#657187' : RED}">${ex[ri][ci][1]}</text>`;
            });
          });
          s += `<text x="220" y="268" text-anchor="middle" font-size="14" font-weight="900" fill="#172033">加、乘可以任意搬　　減、除搬了就變答案</text>`;
          s += `<text x="220" y="290" text-anchor="middle" font-size="12" fill="#657187">分配律連接乘與加減：5 × (8 ＋ 2) ＝ 5 × 8 ＋ 5 × 2</text>`;
          h.innerHTML = svg('0 0 440 302', s);
        },
        caption: '兩個綠勾（加、乘）隨你搬；兩個紅叉（減、除）一搬答案就跑掉。',
        example: {
          q: '下列哪些等式成立？① \\(7\\times4=4\\times7\\)　② \\(9-2=2-9\\)　③ \\((12\\div6)\\div2=12\\div(6\\div2)\\)',
          steps: [
            '① 乘法有交換律：兩邊都是 \\(28\\) ⇒ 成立。',
            '② 減法沒有交換律：\\(9-2=7\\)、\\(2-9=-7\\) ⇒ 不成立。',
            '③ 除法沒有結合律：左式 \\(=1\\)、右式 \\(=4\\) ⇒ 不成立。'
          ],
          ans: '只有 ① 成立'
        }
      },

      {
        sec: '1-3', secName: '整數的乘除與四則運算',
        title: '連乘先數負號：偶數個為正、奇數個為負',
        points: [
          '好幾個數連乘時，<b>先數負號有幾個</b>，決定答案的符號，再乘絕對值。',
          '負號<b>偶數</b>個 → 兩兩抵銷 → 積為<b>正</b>；<b>奇數</b>個 → 剩一個 → 積為<b>負</b>。',
          '只要其中<b>有一個 0</b>，整個積就是 0，連負號都不用數。',
          '拖滑桿看負號兩兩配對抵銷的過程。'
        ],
        formula: { label: '連乘定號', tex: '\\text{負號偶數個}\\Rightarrow(+),\\qquad \\text{負號奇數個}\\Rightarrow(-)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>負號的個數 <span class="ival" id="nv">3</span></label>
            <input type="range" id="ns" min="0" max="6" step="1" value="3"></div></div>`;
          const draw = () => {
            const n = +h.querySelector('#ns').value;
            h.querySelector('#nv').textContent = n;
            let s = '';
            for (let i = 0; i < n; i++) {
              const x = 62 + i * 54;
              s += `<circle cx="${x}" cy="86" r="21" fill="rgba(225,29,72,.10)" stroke="${RED}" stroke-width="2.2"/>`;
              s += `<text x="${x}" y="95" text-anchor="middle" font-size="26" font-weight="900" fill="${RED}">−</text>`;
            }
            for (let i = 0; i + 1 < n; i += 2) {
              const x1 = 62 + i * 54, x2 = 62 + (i + 1) * 54;
              s += `<path d="M${x1},116 Q${(x1 + x2) / 2},152 ${x2},116" fill="none" stroke="${GRN}" stroke-width="2.6"/>`;
              s += `<text x="${(x1 + x2) / 2}" y="172" text-anchor="middle" font-size="11.5" font-weight="800" fill="${GRN}">抵銷</text>`;
            }
            if (n % 2 === 1) {
              const x = 62 + (n - 1) * 54;
              s += `<circle cx="${x}" cy="86" r="27" fill="none" stroke="${RED}" stroke-width="2.4" stroke-dasharray="5 4"/>`;
              s += `<text x="${x}" y="140" text-anchor="middle" font-size="11.5" font-weight="800" fill="${RED}">落單</text>`;
            }
            if (n === 0) s += `<text x="220" y="95" text-anchor="middle" font-size="16" fill="#8a94a6">一個負號都沒有</text>`;
            const even = n % 2 === 0;
            s += `<text x="220" y="218" text-anchor="middle" font-size="17" font-weight="800" fill="#172033">負號 ${n} 個（${even ? '偶數' : '奇數'}）</text>`;
            s += `<text x="220" y="258" text-anchor="middle" font-size="26" font-weight="900" fill="${even ? BLU : RED}">積為 ${even ? '正 ＋' : '負 －'}</text>`;
            h.querySelector('#fig').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#ns').oninput = draw; draw();
        },
        caption: '負號兩兩配對抵銷；有沒有「落單的那一個」決定積是正是負。',
        example: {
          q: '判斷 \\((-1)\\times(-2)\\times(-3)\\times(-4)\\) 的正負並求值。',
          steps: ['負號 4 個（偶數）⇒ 積為正。', '絕對值 \\(1\\times2\\times3\\times4=24\\)。'],
          ans: '\\(+24\\)'
        }
      },

      {
        sec: '1-3', secName: '整數的乘除與四則運算',
        title: '除法是乘法的逆運算，符號規則一模一樣',
        points: [
          '\\(a\\div b\\) 就是問「<b>什麼數乘 \\(b\\) 會得到 \\(a\\)</b>」，所以符號規則和乘法相同：同號得正、異號得負。',
          '\\(0\\div a=0\\)（\\(a\\ne0\\)），但 <b>\\(0\\) 絕對不能當除數</b>——\\(5\\div0\\) 沒有意義。',
          '除法<b>沒有</b>交換律、也沒有結合律：\\(8\\div4\\ne4\\div8\\)。',
          '所以只有乘除的算式一定<b>由左而右</b>算，不能自己挑順序。'
        ],
        formula: { label: '除法定號', tex: '(-24)\\div(-6)=+4,\\qquad (-24)\\div(+6)=-4' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '除法＝乘法的逆運算', tex: '(-24)\\div(-6)=4\\;\\Longleftrightarrow\\;4\\times(-6)=-24', color: C, fill: '#eef4ff', border: C, size: 16 },
            { label: '0 的兩個規則', tex: '0\\div5=0\\quad\\text{但}\\quad 5\\div0\\ \\text{無意義}', color: RED, fill: '#fdeef2', border: '#f3c3ce', size: 16, note: '0 永遠不能當除數' },
            { label: '沒有結合律 → 一律由左而右', tex: '36\\div6\\div3=6\\div3=2\\ne36\\div(6\\div3)=18', color: AMB, border: '#f0dcc0', size: 15, note: '自己改順序先算後面，答案就跑掉了' }
          ], { gap: 10 });
        },
        caption: '除法把「乘法」倒過來看；符號照舊，但順序不能亂動。',
        example: {
          q: '計算 \\((-36)\\div(-4)\\div(-3)\\)。',
          steps: ['由左而右：\\((-36)\\div(-4)=9\\)。', '\\(9\\div(-3)=-3\\)。'],
          ans: '\\(-3\\)'
        }
      },

      {
        sec: '1-3', secName: '整數的乘除與四則運算',
        title: '四則運算順序：括號 → 乘方 → 乘除 → 加減',
        points: [
          '順序是固定的：<b>括號內先算</b> → <b>乘方（與絕對值）求值</b> → <b>乘除</b> → <b>加減</b>。',
          '同一級（乘與除、加與減）一律<b>由左而右</b>，不可以看順眼就先算右邊。',
          '多層括號由<b>內而外</b>：小括號 \\((\\;)\\) → 中括號 \\([\\;]\\) → 大括號 \\(\\{\\;\\}\\)。',
          '拖滑桿一步一步看：每一步只動<b>一個</b>地方，這樣才不會亂。'
        ],
        formula: { label: '運算順序', tex: '(\\;)\\;\\to\\;\\text{乘方}\\;\\to\\;\\times\\,\\div\\;\\to\\;+\\,-' },
        visual: (h) => {
          const rows = [
            { e: '20 − [ 3 + (−2)×4 ] ÷ (−5)', t: '找最裡面的括號，先算裡面的乘法 <b>(−2)×4 = −8</b>。' },
            { e: '20 − [ 3 + (−8) ] ÷ (−5)', t: '中括號裡只剩加法：<b>3 + (−8) = −5</b>。' },
            { e: '20 − (−5) ÷ (−5)', t: '括號都清空了，換<b>乘除</b>：(−5) ÷ (−5) = <b>1</b>。' },
            { e: '20 − 1', t: '最後才做<b>加減</b>：20 − 1 = <b>19</b>。' },
            { e: '＝ 19', t: '完成。全程只有一個原則：<b>一次只動一個地方</b>。' }
          ];
          SV.stepper(h, '0 0 440 300', rows.map((r, i) => ({
            t: r.t,
            d: (k) => `<text x="24" y="${44 + i * 52}" font-size="${i === rows.length - 1 ? 22 : 18}" font-weight="${i === rows.length - 1 ? 900 : 700}" fill="${i === rows.length - 1 ? GRN : '#172033'}" opacity="${Math.max(0.15, k).toFixed(2)}">${r.e}</text>` +
              (i > 0 ? `<text x="12" y="${20 + i * 52}" font-size="15" fill="#a9b2c2" opacity="${Math.max(0.15, k).toFixed(2)}">↓</text>` : '')
          })));
        },
        caption: '每一步只處理一個運算，並把整條算式重抄一次——這是最不容易錯的寫法。',
        example: {
          q: '計算 \\(-6+(-4)\\times\\left[5-(-3)\\right]\\)。',
          steps: ['先算中括號：\\(5-(-3)=8\\)。', '再乘：\\((-4)\\times8=-32\\)。', '最後加：\\(-6+(-32)=-38\\)。'],
          ans: '\\(-38\\)'
        }
      },

      {
        sec: '1-3', secName: '整數的乘除與四則運算',
        title: '易錯：分配律要乘到括號裡的每一項',
        points: [
          '分配律 \\(a\\times(b+c)=a\\times b+a\\times c\\)：括號外的數<b>每一項都要乘到</b>，符號也要跟著走。',
          '✗ \\(25\\times(100-4)=25\\times100-4\\)；✓ 要寫 \\(25\\times100-25\\times4=2400\\)。',
          '<b>反過來用</b>也能速算：\\(37\\times25+63\\times25=(37+63)\\times25=2500\\)。',
          '拖滑桿看面積模型：大長方形被切成兩塊，總面積永遠等於兩塊面積相加。'
        ],
        formula: { label: '分配律', tex: 'a\\times(b+c)=a\\times b+a\\times c' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>右邊那一塊的寬 c ＝ <span class="ival" id="cv2">4</span>　（高 a＝5、左寬 b＝8）</label>
            <input type="range" id="cs2" min="1" max="8" step="1" value="4"></div></div>`;
          const a = 5, b = 8, u = 20, ox = 46, oy = 78;
          const draw = () => {
            const c = +h.querySelector('#cs2').value;
            h.querySelector('#cv2').textContent = c;
            const hh = a * u, wb = b * u, wc = c * u;
            let s = '';
            s += `<rect x="${ox}" y="${oy}" width="${wb}" height="${hh}" fill="rgba(37,99,235,.14)" stroke="${BLU}" stroke-width="2.2"/>`;
            s += `<rect x="${ox + wb}" y="${oy}" width="${wc}" height="${hh}" fill="rgba(5,150,105,.14)" stroke="${GRN}" stroke-width="2.2"/>`;
            s += `<text x="${ox + wb / 2}" y="${oy + hh / 2 + 6}" text-anchor="middle" font-size="16" font-weight="900" fill="${BLU}">5×8＝40</text>`;
            s += `<text x="${ox + wb + wc / 2}" y="${oy + hh / 2 + 6}" text-anchor="middle" font-size="${wc < 70 ? 12 : 16}" font-weight="900" fill="${GRN}">5×${c}＝${5 * c}</text>`;
            s += `<text x="${ox + wb / 2}" y="${oy - 12}" text-anchor="middle" font-size="13" font-weight="800" fill="${BLU}">b ＝ 8</text>`;
            s += `<text x="${ox + wb + wc / 2}" y="${oy - 12}" text-anchor="middle" font-size="13" font-weight="800" fill="${GRN}">c ＝ ${c}</text>`;
            s += SV.seg(ox, oy - 34, ox + wb + wc, oy - 34, '#5b6478', 2);
            s += `<text x="${ox + (wb + wc) / 2}" y="${oy - 42}" text-anchor="middle" font-size="13" font-weight="800" fill="#5b6478">總寬 8 ＋ ${c} ＝ ${8 + c}</text>`;
            s += `<text x="${ox - 12}" y="${oy + hh / 2 + 5}" text-anchor="end" font-size="13" font-weight="800" fill="#5b6478">a＝5</text>`;
            s += `<text x="220" y="${oy + hh + 52}" text-anchor="middle" font-size="17" font-weight="900" fill="#172033">5 × (8 ＋ ${c}) ＝ 40 ＋ ${5 * c} ＝ ${5 * (8 + c)}</text>`;
            h.querySelector('#fig').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#cs2').oninput = draw; draw();
        },
        caption: '大長方形面積＝兩塊小長方形面積之和，這就是分配律的圖形意義。',
        example: {
          q: '用分配律速算 \\((-8)\\times97\\)。',
          steps: ['把 \\(97\\) 拆成 \\(100-3\\)。', '\\((-8)\\times100+(-8)\\times(-3)=-800+24\\)。', '\\(=-776\\)。'],
          ans: '\\(-776\\)'
        }
      },

      /* ---------- 1-4 指數記法與科學記號 ---------- */
      {
        sec: '1-4', secName: '指數記法與科學記號',
        title: '乘方：\\(a^n\\) 就是 \\(n\\) 個 \\(a\\) 相乘',
        points: [
          '\\(n\\) 個 \\(a\\) 相乘記成 \\(a^n\\)：下面的 \\(a\\) 是<span class="k">底數</span>、右上角的 \\(n\\) 是<span class="k">指數</span>。',
          '讀法：\\(a^2\\) 讀「\\(a\\) 的平方」、\\(a^3\\) 讀「\\(a\\) 的立方」、\\(a^n\\) 讀「\\(a\\) 的 \\(n\\) 次方」。',
          '指數是「<b>乘幾次</b>」不是「乘幾」：\\(2^5=2\\times2\\times2\\times2\\times2=32\\)，<b>不是</b> \\(2\\times5=10\\)。',
          '負數的乘方看指數的奇偶：<b>偶數次方為正、奇數次方為負</b>。'
        ],
        formula: { label: '乘方的意義', tex: 'a^{n}=a\\times a\\times\\cdots\\times a\\quad(\\,n\\ \\text{個}\\ a\\,)' },
        visual: (h) => {
          let s = '';
          s += `<text x="180" y="118" text-anchor="middle" font-size="72" font-weight="900" fill="${C}">2<tspan font-size="40" dy="-30" fill="${RED}">5</tspan></text>`;
          s += SV.seg(150, 140, 108, 178, '#5b6478', 2);
          s += `<text x="100" y="198" text-anchor="middle" font-size="14" font-weight="800" fill="#5b6478">底數</text>`;
          s += `<text x="100" y="218" text-anchor="middle" font-size="12" fill="#8a94a6">被乘的數</text>`;
          s += SV.seg(228, 68, 292, 44, RED, 2);
          s += `<text x="336" y="42" text-anchor="middle" font-size="14" font-weight="800" fill="${RED}">指數</text>`;
          s += `<text x="336" y="62" text-anchor="middle" font-size="12" fill="#8a94a6">乘幾次</text>`;
          s += `<text x="220" y="252" text-anchor="middle" font-size="19" font-weight="800" fill="#172033">2 × 2 × 2 × 2 × 2 ＝ <tspan fill="${GRN}">32</tspan></text>`;
          s += `<text x="220" y="278" text-anchor="middle" font-size="13" fill="#657187">是「乘 5 次」，不是「乘以 5」</text>`;
          h.innerHTML = svg('0 0 440 290', s);
        },
        caption: '底數在下、指數在右上；指數告訴你「這個數要自己乘幾次」。',
        example: {
          q: '計算 \\((-3)^3\\) 與 \\(0.1^3\\)。',
          steps: ['\\((-3)^3=(-3)\\times(-3)\\times(-3)\\)，負號 3 個（奇數）⇒ 負。', '\\(=-27\\)；\\(0.1^3=0.001\\)。'],
          ans: '\\(-27\\)、\\(0.001\\)'
        }
      },

      {
        sec: '1-4', secName: '指數記法與科學記號',
        title: '易錯：\\((-2)^4\\) 與 \\(-2^4\\) 只差一個括號',
        points: [
          '\\((-2)^4\\)：底數是 \\(-2\\)，四個 \\((-2)\\) 相乘 \\(=+16\\)。',
          '\\(-2^4\\)：底數是 \\(2\\)，先算 \\(2^4=16\\)，<b>負號留到最後才加上</b> \\(=-16\\)。',
          '判斷關鍵一句話：<b>負號有沒有被括號包進去</b>。',
          '同理 \\(-3^2=-9\\)，要得到 \\(9\\) 必須寫成 \\((-3)^2\\)。'
        ],
        formula: { label: '差一個括號', tex: '(-2)^4=16\\qquad\\text{但}\\qquad -2^4=-16' },
        visual: (h) => {
          h.innerHTML = badGood([
            { badLabel: '這樣算是錯的', bad: '-2^4=16', goodLabel: '正確', good: '-2^4=-(2^4)=-16', note: '負號沒被括號包住 ⇒ 只有 2 拿去做乘方' },
            { badLabel: '這樣算是錯的', bad: '(-2)^4=-16', goodLabel: '正確', good: '(-2)^4=+16', note: '底數是 −2，負號 4 個（偶數）⇒ 正' },
            { badLabel: '這樣算是錯的', bad: '-3^2=9', goodLabel: '正確', good: '-3^2=-9', note: '要得到 9 必須寫成 (−3)²' }
          ]);
        },
        caption: '括號決定「誰是底數」；沒有括號時，負號不算在底數裡。',
        example: {
          q: '計算 \\((-1)^{99}+(-1)^{100}\\)。',
          steps: ['\\((-1)^{99}\\)：指數奇數 ⇒ \\(-1\\)。', '\\((-1)^{100}\\)：指數偶數 ⇒ \\(1\\)。', '\\(-1+1=0\\)。'],
          ans: '\\(0\\)'
        }
      },

      {
        sec: '1-4', secName: '指數記法與科學記號',
        title: '乘 \\(10^n\\) 小數點右移，乘 \\(10^{-n}\\) 小數點左移',
        points: [
          '\\(10^n\\) 就是「1 後面接 \\(n\\) 個 0」：\\(10^3=1000\\)、\\(10^6=1000000\\)。',
          '\\(\\dfrac{1}{10^n}=10^{-n}\\)，如 \\(10^{-3}=0.001\\)。（這種寫法<b>只用在底數 10</b>）',
          '乘 \\(10^{n}\\)：小數點<b>向右</b>移 \\(n\\) 位，數變大；乘 \\(10^{-n}\\)：小數點<b>向左</b>移 \\(n\\) 位，數變小。',
          '拖滑桿看小數點怎麼跑——這就是等一下科學記號互換的全部技巧。'
        ],
        formula: { label: '小數點移動', tex: '\\times10^{n}\\Rightarrow\\text{右移 }n\\ \\text{位};\\qquad \\times10^{-n}\\Rightarrow\\text{左移 }n\\ \\text{位}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>3.65 × 10 的 <span class="ival" id="ev">2</span> 次方</label>
            <input type="range" id="es" min="-4" max="4" step="1" value="2"></div></div>`;
          const D = '365';
          const fmt = (p) => {
            if (p <= 0) return '0.' + '0'.repeat(-p) + D;
            if (p >= D.length) return D + '0'.repeat(p - D.length);
            return D.slice(0, p) + '.' + D.slice(p);
          };
          const draw = () => {
            const n = +h.querySelector('#es').value;
            h.querySelector('#ev').textContent = n;
            let s = '';
            s += `<text x="220" y="54" text-anchor="middle" font-size="24" font-weight="800" fill="#5b6478">3.65 × 10<tspan font-size="16" dy="-10">${n}</tspan></text>`;
            const dir = n > 0 ? '向右移 ' + n + ' 位（變大）' : (n < 0 ? '向左移 ' + (-n) + ' 位（變小）' : '不動');
            const col = n > 0 ? GRN : (n < 0 ? RED : '#8a94a6');
            s += `<text x="220" y="104" text-anchor="middle" font-size="17" font-weight="800" fill="${col}">小數點 ${dir}</text>`;
            s += `<text x="220" y="120" text-anchor="middle" font-size="26" fill="${col}">${n > 0 ? '⟶' : (n < 0 ? '⟵' : '·')}</text>`;
            s += `<rect x="40" y="146" width="360" height="66" rx="14" fill="#eef4ff" stroke="${C}" stroke-width="2"/>`;
            s += `<text x="220" y="190" text-anchor="middle" font-size="30" font-weight="900" fill="${C}">${fmt(1 + n)}</text>`;
            s += `<text x="220" y="252" text-anchor="middle" font-size="13" fill="#657187">10 的次方是幾，小數點就跑幾位</text>`;
            h.querySelector('#fig').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#es').oninput = draw; draw();
        },
        caption: '次方是正的往右跑、是負的往左跑；跑幾位就看次方的絕對值。',
        example: {
          q: '\\(4.7\\times10^{-3}\\) 化成小數是多少？',
          steps: ['乘 \\(10^{-3}\\) ⇒ 小數點向左移 3 位。', '\\(4.7\\to0.0047\\)。'],
          ans: '\\(0.0047\\)'
        }
      },

      {
        sec: '1-4', secName: '指數記法與科學記號',
        title: '科學記號 \\(a\\times10^n\\)：\\(a\\) 只能有一位整數',
        points: [
          '標準形式 \\(a\\times10^{n}\\) 有兩個條件：<b>\\(1\\le a\\lt 10\\)</b>（整數部分只有一位）、\\(n\\) 是<b>整數</b>。',
          '很<b>大</b>的數 → \\(n\\) 為<b>正整數</b>：光速 \\(300000000=3\\times10^{8}\\)（小數點往左搬 8 位）。',
          '很<b>小</b>的數 → \\(n\\) 為<b>負整數</b>：\\(0.000001=1\\times10^{-6}\\)（小數點往右搬 6 位）。',
          '✗ \\(35\\times10^{6}\\) 不是科學記號（\\(a=35\\) 太大）→ ✓ 要改寫成 \\(3.5\\times10^{7}\\)。'
        ],
        formula: { label: '標準形式', tex: 'a\\times10^{n},\\qquad 1\\le a\\lt 10,\\ n\\ \\text{為整數}' },
        visual: (h) => {
          let s = '';
          s += `<rect x="24" y="14" width="392" height="112" rx="14" fill="rgba(37,99,235,.06)" stroke="${BLU}" stroke-width="1.8"/>`;
          s += `<text x="44" y="38" font-size="12.5" font-weight="900" fill="${BLU}">很大的數 → 次方為正</text>`;
          s += `<text x="220" y="72" text-anchor="middle" font-size="24" font-weight="800" fill="#172033">3 0 0 0 0 0 0 0 0 .</text>`;
          s += `<path d="M356,82 Q250,118 128,84" fill="none" stroke="${RED}" stroke-width="2.2"/>`;
          s += `<text x="240" y="116" text-anchor="middle" font-size="12.5" font-weight="800" fill="${RED}">小數點向左搬 8 位</text>`;
          s += `<text x="220" y="152" text-anchor="middle" font-size="24" font-weight="900" fill="${BLU}">＝ 3 × 10<tspan font-size="16" dy="-10">8</tspan></text>`;
          s += SV.seg(30, 168, 410, 168, '#dce3ee', 1.6);
          s += `<rect x="24" y="178" width="392" height="100" rx="14" fill="rgba(5,150,105,.06)" stroke="${GRN}" stroke-width="1.8"/>`;
          s += `<text x="44" y="202" font-size="12.5" font-weight="900" fill="${GRN}">很小的數 → 次方為負</text>`;
          s += `<text x="220" y="234" text-anchor="middle" font-size="24" font-weight="800" fill="#172033">0 . 0 0 0 7 2</text>`;
          s += `<path d="M148,242 Q220,276 300,244" fill="none" stroke="${RED}" stroke-width="2.2"/>`;
          s += `<text x="224" y="270" text-anchor="middle" font-size="12.5" font-weight="800" fill="${RED}">小數點向右搬 4 位</text>`;
          s += `<text x="220" y="308" text-anchor="middle" font-size="24" font-weight="900" fill="${GRN}">＝ 7.2 × 10<tspan font-size="16" dy="-10">−4</tspan></text>`;
          h.innerHTML = svg('0 0 440 322', s);
        },
        caption: '搬幾位，次方就是幾：往左搬記正次方、往右搬記負次方。',
        example: {
          q: '把 \\(0.00072\\) 寫成科學記號。',
          steps: ['小數點向右搬 4 位得 \\(7.2\\)，符合 \\(1\\le 7.2\\lt 10\\)。', '往右搬 ⇒ 次方為負：\\(7.2\\times10^{-4}\\)。'],
          ans: '\\(7.2\\times10^{-4}\\)'
        }
      },

      {
        sec: '1-4', secName: '指數記法與科學記號',
        title: '比科學記號大小：先比次方，次方一樣才比前面的數',
        points: [
          '兩數都寫成標準形式後：<b>先比 \\(n\\)</b>，\\(n\\) 大的數就大；\\(n\\) 相同時才比前面的 \\(a\\)。',
          '前提是兩個都已經是<b>標準形式</b>（\\(1\\le a\\lt 10\\)），沒整理好就直接比會出錯。',
          '生活單位背起來：\\(1\\) 奈米 \\(=10^{-9}\\) 公尺、\\(1\\) 微米 \\(=10^{-6}\\) 公尺、\\(1\\) 毫米 \\(=10^{-3}\\) 公尺。',
          '單位換算題的做法：<b>先全部換成同一個單位</b>，再比次方。'
        ],
        formula: { label: '比大小的順序', tex: 'a\\times10^{m}\\ \\text{與}\\ b\\times10^{n}:\\ \\text{先比 }m\\text{、}n\\text{，相同才比 }a\\text{、}b' },
        visual: (h) => {
          const items = [
            { p: '−9', u: '奈米', c: VIO },
            { p: '−6', u: '微米', c: BLU },
            { p: '−3', u: '毫米', c: '#0891b2' },
            { p: '−2', u: '公分', c: AMB },
            { p: '0', u: '公尺', c: GRN }
          ];
          let s = SV.arrowDefs('#5b6478', 'sciar');
          s += `<line x1="30" y1="170" x2="418" y2="170" stroke="#5b6478" stroke-width="2.2" marker-end="url(#sciar)"/>`;
          items.forEach((it, i) => {
            const x = 62 + i * 82;
            s += SV.seg(x, 160, x, 180, it.c, 2.6);
            s += SV.dot(x, 170, it.c, 5);
            s += `<text x="${x}" y="142" text-anchor="middle" font-size="14" font-weight="900" fill="${it.c}">${it.u}</text>`;
            s += `<text x="${x}" y="204" text-anchor="middle" font-size="15" font-weight="800" fill="#172033">10<tspan font-size="11" dy="-8">${it.p}</tspan></text>`;
            s += `<text x="${x}" y="226" text-anchor="middle" font-size="11.5" fill="#8a94a6">公尺</text>`;
          });
          s += `<text x="220" y="66" text-anchor="middle" font-size="15" font-weight="900" fill="#172033">次方愈大 → 數愈大</text>`;
          s += `<text x="30" y="100" font-size="12.5" fill="#8a94a6">小</text>`;
          s += `<text x="400" y="100" text-anchor="end" font-size="12.5" fill="#8a94a6">大</text>`;
          s += SV.seg(52, 92, 396, 92, '#c7d0de', 2);
          s += `<text x="220" y="268" text-anchor="middle" font-size="13.5" fill="#657187">例：3.2 × 10⁵ ＞ 9.8 × 10⁴（5 ＞ 4，不必看前面的數）</text>`;
          h.innerHTML = svg('0 0 440 282', s);
        },
        caption: '次方就是「數量級」；量級大的直接贏，同量級才比前面的係數。',
        example: {
          q: '比較 \\(3.2\\times10^{5}\\) 與 \\(9.8\\times10^{4}\\) 的大小。',
          steps: ['兩者都是標準形式，先比次方：\\(5>4\\)。', '所以次方大的比較大。'],
          ans: '\\(3.2\\times10^{5}\\) 比較大'
        }
      }
    ]
  });
})();
