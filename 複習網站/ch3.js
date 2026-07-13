/* ============ 第 3 章　三角形的基本性質 ============ */
window.DECK = window.DECK || [];
(function () {
  const C = '#059669';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  // 畫「內角」：頂點 V、兩鄰點 A,B，自動取內部弧
  function iangle(V, A, B, r, color, label, opt = {}) {
    const dA = SV.angleOf(V[0], V[1], A[0], A[1]);
    const dB = SV.angleOf(V[0], V[1], B[0], B[1]);
    const diff = (dB - dA + 360) % 360;
    const [d0, d1] = diff <= 180 ? [dA, dB] : [dB, dA];
    return SV.angle(V[0], V[1], r, d0, d1, color, label, opt);
  }
  // 由座標算頂點 V 的內角（度）
  function angleAt(V, P, Q) {
    const a1 = Math.atan2(P[1] - V[1], P[0] - V[0]);
    const a2 = Math.atan2(Q[1] - V[1], Q[0] - V[0]);
    let d = Math.abs(a1 - a2) * 180 / Math.PI;
    if (d > 180) d = 360 - d;
    return d;
  }
  // svg 外框
  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }
  // 弧線（compass 用）
  function carc(cx, cy, r, d0, d1, color = '#9aa4b6', dash = '4 4') {
    return `<polyline points="${SV.arcPoints(cx, cy, r, d0, d1)}" fill="none" stroke="${color}" stroke-width="1.6" stroke-dasharray="${dash}"/>`;
  }

  window.DECK.push({
    ch: 3,
    title: '三角形的基本性質',
    color: C,
    sections: ['3-1 內角與外角', '3-2 尺規作圖', '3-3 全等性質', '3-4 中垂線與角平分線', '3-5 邊角關係'],
    slides: [

      /* ---------- 3-1 角的基礎 ---------- */
      {
        sec: '3-1', secName: '角的分類',
        title: '角的分類：銳角、直角、鈍角、平角',
        points: [
          '<b>銳角</b>：\\(0^\\circ\\lt\\theta\\lt90^\\circ\\)；　<b>直角</b>：\\(=90^\\circ\\)。',
          '<b>鈍角</b>：\\(90^\\circ\\lt\\theta\\lt180^\\circ\\)；　<b>平角</b>：\\(=180^\\circ\\)。',
          '<b>優角</b>：\\(180^\\circ\\lt\\theta\\lt360^\\circ\\)；　<b>周角</b>：\\(=360^\\circ\\)。',
          '拖動滑桿改變角度，看它屬於哪一類。'
        ],
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="ang"></div>
            <div class="ictrl"><label>角度 <span class="ival" id="av">50</span>°</label><input type="range" id="as" min="10" max="360" step="5" value="50"></div></div>`;
          const V = [210, 180], R = 120;
          const classify = t => t < 90 ? ['銳角', RED] : t === 90 ? ['直角', BLU] : t < 180 ? ['鈍角', AMB] : t === 180 ? ['平角', VIO] : t < 360 ? ['優角', '#0891b2'] : ['周角', '#111827'];
          const draw = () => {
            const t = +h.querySelector('#as').value;
            h.querySelector('#av').textContent = t;
            const [name, col] = classify(t);
            const E0 = SV.pt(V[0], V[1], R, 0), E1 = SV.pt(V[0], V[1], R, t);
            let s = SV.seg(V[0], V[1], E0[0], E0[1], '#334', 3) + SV.seg(V[0], V[1], E1[0], E1[1], '#334', 3);
            s += SV.angle(V[0], V[1], 44, 0, t, col, t + '°', { w: 4, fs: 15, lr: 20 });
            s += SV.dot(V[0], V[1], '#334', 4);
            s += `<text x="210" y="295" text-anchor="middle" font-size="17" font-weight="900" fill="${col}">${name}</text>`;
            h.querySelector('#ang').innerHTML = svg('0 0 420 310', s);
          };
          h.querySelector('#as').oninput = draw; draw();
        },
        caption: '依角度大小把角分成六類，是所有角度題的共同語言。',
        example: { q: '\\(135^\\circ\\) 是哪一類角？', steps: ['\\(90^\\circ\\lt135^\\circ\\lt180^\\circ\\)。'], ans: '鈍角' }
      },

      {
        sec: '3-1', secName: '角的關係',
        title: '兩角關係：互餘、互補、對頂角',
        points: [
          '<b>互餘</b>：兩角相加 \\(=90^\\circ\\)（一角的餘角 \\(=90^\\circ-\\)該角）。',
          '<b>互補</b>：兩角相加 \\(=180^\\circ\\)（一角的補角 \\(=180^\\circ-\\)該角）。',
          '<b>對頂角</b>：兩直線相交，正對面的兩角<b>相等</b>。',
          '拖滑桿：一個角變，餘角與補角同時更新。'
        ],
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="rel"></div>
            <div class="ictrl"><label>∠α <span class="ival" id="rv">40</span>°</label><input type="range" id="rs" min="10" max="80" step="5" value="40"></div></div>`;
          const draw = () => {
            const a = +h.querySelector('#rs').value; h.querySelector('#rv').textContent = a;
            const Vc = [110, 190], Vs = [340, 190];
            let s = '';
            // 互餘（直角）
            s += SV.seg(Vc[0], Vc[1], Vc[0] + 120, Vc[1], '#334', 3) + SV.seg(Vc[0], Vc[1], Vc[0], Vc[1] - 120, '#334', 3);
            const rc = SV.pt(Vc[0], Vc[1], 120, a); s += SV.seg(Vc[0], Vc[1], rc[0], rc[1], VIO, 2.6);
            s += SV.angle(Vc[0], Vc[1], 40, 0, a, RED, a + '°', { w: 3, fs: 12, lr: 16 });
            s += SV.angle(Vc[0], Vc[1], 40, a, 90, BLU, (90 - a) + '°', { w: 3, fs: 12, lr: 16 });
            s += `<text x="110" y="235" text-anchor="middle" font-size="13" font-weight="800" fill="#657187">互餘＝90°</text>`;
            // 互補（平角）
            s += SV.seg(Vs[0] - 120, Vs[1], Vs[0] + 120, Vs[1], '#334', 3);
            const rs = SV.pt(Vs[0], Vs[1], 120, a); s += SV.seg(Vs[0], Vs[1], rs[0], rs[1], VIO, 2.6);
            s += SV.angle(Vs[0], Vs[1], 40, 0, a, RED, a + '°', { w: 3, fs: 12, lr: 16 });
            s += SV.angle(Vs[0], Vs[1], 40, a, 180, AMB, (180 - a) + '°', { w: 3, fs: 12, lr: 18 });
            s += `<text x="340" y="235" text-anchor="middle" font-size="13" font-weight="800" fill="#657187">互補＝180°</text>`;
            // 對頂角（靜態）
            const Xo = [235, 330];
            const q1 = SV.pt(Xo[0], Xo[1], 92, 25), q1b = SV.pt(Xo[0], Xo[1], 92, 205);
            const q2 = SV.pt(Xo[0], Xo[1], 92, 110), q2b = SV.pt(Xo[0], Xo[1], 92, 290);
            s += SV.seg(q1[0], q1[1], q1b[0], q1b[1], '#334', 2.6) + SV.seg(q2[0], q2[1], q2b[0], q2b[1], '#334', 2.6);
            s += SV.angle(Xo[0], Xo[1], 26, 25, 110, RED, '', { w: 3.5 }) + SV.angle(Xo[0], Xo[1], 26, 205, 290, RED, '', { w: 3.5 });
            s += SV.angle(Xo[0], Xo[1], 26, 110, 205, BLU, '', { w: 3.5 }) + SV.angle(Xo[0], Xo[1], 26, 290, 385, BLU, '', { w: 3.5 });
            s += `<text x="235" y="405" text-anchor="middle" font-size="13" font-weight="800" fill="#657187">對頂角相等（同色）</text>`;
            h.querySelector('#rel').innerHTML = svg('0 0 470 420', s);
          };
          h.querySelector('#rs').oninput = draw; draw();
        },
        caption: '互餘湊 90°、互補湊 180°；十字交叉的對頂角一定相等。',
        example: { q: '一角為 \\(35^\\circ\\)，求它的餘角與補角。', steps: ['餘角 \\(=90^\\circ-35^\\circ=55^\\circ\\)。', '補角 \\(=180^\\circ-35^\\circ=145^\\circ\\)。'], ans: '餘角 55°、補角 145°' }
      },

      /* ---------- 3-1 內角與外角 ---------- */
      {
        sec: '3-1', secName: '內角與外角',
        title: '三角形內角和 = 180°',
        points: [
          '任何三角形，三個<span class="k">內角</span>加起來都是 <b>180°</b>。',
          '把三個角撕下來拼在一起，恰好排成一個<b>平角（直線）</b>。',
          '拖滑桿移動頂點 C，三個角會變，但總和永遠是 180°。'
        ],
        formula: { label: '內角和', tex: '\\angle A+\\angle B+\\angle C=180^\\circ' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="tri"></div>
            <div class="ictrl"><label>頂點 C 左右 <span class="ival" id="cxv">250</span></label><input type="range" id="cx" min="120" max="380" value="250">
            <label>高度 <span class="ival" id="cyv">70</span></label><input type="range" id="cy" min="40" max="175" value="70"></div></div>`;
          const A = [110, 240], B = [370, 240], M = [240, 330];
          const draw = () => {
            const cx = +h.querySelector('#cx').value, cy = +h.querySelector('#cy').value;
            h.querySelector('#cxv').textContent = cx; h.querySelector('#cyv').textContent = cy;
            const C = [cx, cy];
            let angA = Math.round(angleAt(A, B, C)), angB = Math.round(angleAt(B, A, C));
            let angC = 180 - angA - angB;
            // 拼成平角的三段（依實際角度比例）
            const s1 = angA / 180 * 180, s2 = s1 + angB / 180 * 180;
            let s = SV.poly([A, B, C], 'rgba(5,150,105,0.07)', GRN, 2.6) +
              iangle(A, B, C, 26, RED, angA + '°', { w: 3, fs: 13 }) +
              iangle(B, A, C, 26, GRN, angB + '°', { w: 3, fs: 13 }) +
              iangle(C, A, B, 22, BLU, angC + '°', { w: 3, fs: 13 }) +
              SV.vlabel(A[0] - 22, A[1] + 8, 'A', RED) + SV.vlabel(B[0] + 8, B[1] + 8, 'B', GRN) + SV.vlabel(C[0] - 6, C[1] - 12, 'C', BLU) +
              SV.seg(90, M[1], 400, M[1], '#c3ccdb', 2) +
              SV.angle(M[0], M[1], 34, 0, s1, RED, '', { w: 7 }) +
              SV.angle(M[0], M[1], 34, s1, s2, GRN, '', { w: 7 }) +
              SV.angle(M[0], M[1], 34, s2, 180, BLU, '', { w: 7 }) +
              `<text x="240" y="360" text-anchor="middle" font-size="14" font-weight="800" fill="#172033">${angA}° + ${angB}° + ${angC}° = <tspan fill="${GRN}">180°</tspan></text>`;
            h.querySelector('#tri').innerHTML = svg('0 0 480 372', s);
          };
          h.querySelector('#cx').oninput = draw; h.querySelector('#cy').oninput = draw; draw();
        },
        caption: '三個內角無論大小，總和永遠鎖定在 180°。',
        example: {
          q: '三角形兩內角為 50° 與 70°，第三個角多少？',
          steps: ['三內角和 180°：\\(180^\\circ-50^\\circ-70^\\circ\\)', '\\(=60^\\circ\\)。'],
          ans: '60°'
        }
      },

      {
        sec: '3-1', secName: '內角與外角',
        title: '外角 = 兩個內對角的和',
        points: [
          '把一邊延長，和另一邊夾出的角叫<span class="k">外角</span>。',
          '一個外角 = <b>不相鄰的兩個內角</b>（內對角）之和。',
          '因為外角＋相鄰內角＝180°，而三內角也＝180°，兩式相減即得。'
        ],
        formula: { label: '外角定理', tex: '\\angle ACD=\\angle A+\\angle B' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="ext"></div>
            <div class="ictrl"><label>頂點 A 左右 <span class="ival" id="axv">180</span></label><input type="range" id="ax" min="125" max="290" value="180">
            <label>高度 <span class="ival" id="ayv">85</span></label><input type="range" id="ay" min="55" max="150" value="85"></div></div>`;
          const B = [110, 235], C = [300, 235], D = [405, 235];
          const draw = () => {
            const ax = +h.querySelector('#ax').value, ay = +h.querySelector('#ay').value;
            h.querySelector('#axv').textContent = ax; h.querySelector('#ayv').textContent = ay;
            const A = [ax, ay];
            const angA = Math.round(angleAt(A, B, C)), angB = Math.round(angleAt(B, A, C));
            const ext = angA + angB, dA = SV.angleOf(C[0], C[1], A[0], A[1]);
            let s = SV.seg(B[0], B[1], D[0], D[1], '#c3ccdb', 2) +
              SV.poly([A, B, C], 'rgba(5,150,105,0.07)', GRN, 2.6) +
              iangle(A, B, C, 24, RED, angA + '°', { w: 3, fs: 12 }) +
              iangle(B, A, C, 24, GRN, angB + '°', { w: 3, fs: 12 }) +
              SV.angle(C[0], C[1], 30, 0, dA, VIO, ext + '°', { w: 3.5, fs: 13, lr: 22 }) +
              SV.vlabel(A[0] - 6, A[1] - 12, 'A', RED) + SV.vlabel(B[0] - 20, B[1] + 8, 'B', GRN) + SV.vlabel(C[0] - 6, C[1] + 22, 'C') + SV.vlabel(D[0] + 6, D[1] + 8, 'D', '#657187') +
              `<text x="230" y="292" text-anchor="middle" font-size="14" font-weight="800" fill="#172033">外角 <tspan fill="${VIO}">${ext}°</tspan> = ${angA}° + ${angB}°</text>`;
            h.querySelector('#ext').innerHTML = svg('0 0 460 306', s);
          };
          h.querySelector('#ax').oninput = draw; h.querySelector('#ay').oninput = draw; draw();
        },
        caption: '外角（紫）把「對面兩個內角」一次打包，移動 A 兩者永遠相等。',
        example: {
          q: '三角形一外角為 120°，其中一個內對角為 45°，另一內對角？',
          steps: ['外角＝兩內對角和：\\(120^\\circ=45^\\circ+x\\)。', '\\(x=75^\\circ\\)。'],
          ans: '75°'
        }
      },

      {
        sec: '3-1', secName: '內角與外角',
        title: '多邊形內角和 = (n−2)×180°',
        points: [
          '從一個頂點拉對角線，可把 \\(n\\) 邊形切成 <b>(n−2)</b> 個三角形。',
          '每個三角形內角和 180°，所以總內角和 = \\((n-2)\\times180^\\circ\\)。',
          '拖滑桿改變邊數 n，看它被切成幾個三角形。'
        ],
        formula: { label: 'n 邊形內角和', tex: '(n-2)\\times180^\\circ' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="poly"></div>
            <div class="ictrl"><label>邊數 n <span class="ival" id="nv">5</span></label><input type="range" id="ns" min="3" max="10" value="5"></div></div>`;
          const cx = 210, cy = 160, R = 118;
          const fills = ['rgba(37,99,235,0.12)', 'rgba(5,150,105,0.12)', 'rgba(217,119,6,0.13)', 'rgba(124,58,237,0.12)', 'rgba(225,29,72,0.10)', 'rgba(8,145,178,0.12)', 'rgba(217,119,6,0.10)', 'rgba(5,150,105,0.10)'];
          const draw = () => {
            const n = +h.querySelector('#ns').value; h.querySelector('#nv').textContent = n;
            const V = [];
            for (let i = 0; i < n; i++) V.push(SV.pt(cx, cy, R, 90 + i * 360 / n));
            let tri = '';
            for (let i = 1; i < n - 1; i++) tri += SV.poly([V[0], V[i], V[i + 1]], fills[(i - 1) % fills.length], 'rgba(0,0,0,0)', 0);
            let diag = '';
            for (let i = 2; i < n - 1; i++) diag += SV.seg(V[0][0], V[0][1], V[i][0], V[i][1], C, 1.4, '5 4');
            const sum = (n - 2) * 180;
            h.querySelector('#poly').innerHTML = svg('0 0 420 320',
              tri + SV.poly(V, 'none', C, 2.6) + diag + V.map(p => SV.dot(p[0], p[1], C, 3.5)).join('') +
              `<text x="210" y="308" text-anchor="middle" font-size="14" font-weight="800" fill="#172033">${n} 邊形＝<tspan fill="${C}">${n - 2}</tspan> 個三角形＝${n - 2}×180°＝<tspan fill="${C}">${sum}°</tspan></text>`);
          };
          h.querySelector('#ns').oninput = draw; draw();
        },
        caption: '切成幾個三角形，就有幾個 180°；三角形數永遠是 n−2。',
        example: {
          q: '正八邊形每個內角是幾度？',
          steps: ['內角和 \\((8-2)\\times180^\\circ=1080^\\circ\\)。', '正八邊形 8 個角相等：\\(1080^\\circ\\div8=135^\\circ\\)。'],
          ans: '135°'
        }
      },

      {
        sec: '3-1', secName: '內角與外角',
        title: '多邊形外角和 = 360°',
        points: [
          '每個頂點取一個外角，加起來<b>不管幾邊形都是 360°</b>。',
          '想像沿著邊界走一圈回到原點，方向剛好轉了一整圈。',
          '正 \\(n\\) 邊形每個外角 = \\(360^\\circ\\div n\\)。'
        ],
        formula: { label: '外角和', tex: '\\text{任意凸多邊形外角和}=360^\\circ' },
        visual: (h) => {
          const cx = 210, cy = 160, R = 100;
          const V = [];
          for (let i = 0; i < 5; i++) V.push(SV.pt(cx, cy, R, 90 + i * 72));
          let ext = '';
          for (let i = 0; i < 5; i++) {
            const P = V[i], Nx = V[(i + 1) % 5], Pr = V[(i + 4) % 5];
            // 延長 Pr->P 到外側
            const dx = P[0] - Pr[0], dy = P[1] - Pr[1], L = Math.hypot(dx, dy);
            const E = [P[0] + dx / L * 40, P[1] + dy / L * 40];
            ext += SV.seg(P[0], P[1], E[0], E[1], '#c3ccdb', 1.6);
            ext += SV.angle(P[0], P[1], 18, SV.angleOf(P[0], P[1], E[0], E[1]), SV.angleOf(P[0], P[1], Nx[0], Nx[1]), AMB, '', { w: 2.4 });
          }
          h.innerHTML = svg('0 0 420 330',
            SV.poly(V, 'rgba(5,150,105,0.06)', C, 2.6) + ext +
            `<circle cx="${cx}" cy="${cy}" r="30" fill="none" stroke="${AMB}" stroke-width="2" stroke-dasharray="4 4"/>` +
            `<text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="15" font-weight="900" fill="${AMB}">360°</text>` +
            `<text x="210" y="316" text-anchor="middle" font-size="13" fill="#657187">五個外角（橘）繞一圈＝360°</text>`
          );
        },
        caption: '外角和是個「不變量」：與邊數無關，永遠 360°。',
        example: {
          q: '一個正多邊形每個外角 40°，它是幾邊形？',
          steps: ['外角和 360°，每個 40°：\\(360^\\circ\\div40^\\circ=9\\)。'],
          ans: '正九邊形'
        }
      },

      /* ---------- 3-2 尺規作圖 ---------- */
      {
        sec: '3-2', secName: '尺規作圖',
        title: '尺規作圖：只用直尺與圓規',
        points: [
          '<b>直尺</b>：只用來畫直線，<u>不可</u>看刻度量長度。',
          '<b>圓規</b>：用來畫圓弧、以及<b>複製長度</b>。',
          '複製線段：畫一射線，用圓規量 \\(\\overline{AB}\\) 的長，在射線上截出等長。'
        ],
        visual: (h) => {
          h.innerHTML = svg('0 0 440 260',
            `<text x="60" y="40" font-size="13" fill="#657187">原線段</text>` +
            SV.seg(60, 70, 200, 70, C, 3) + SV.dot(60, 70, C) + SV.dot(200, 70, C) + SV.vlabel(52, 62, 'A', C) + SV.vlabel(202, 62, 'B', C) +
            `<text x="60" y="140" font-size="13" fill="#657187">在射線上複製</text>` +
            SV.seg(60, 175, 400, 175, '#c3ccdb', 2) +
            carc(60, 175, 140, -30, 30, AMB) +
            SV.seg(60, 175, 200, 175, VIO, 3) + SV.dot(60, 175, VIO) + SV.dot(200, 175, VIO) +
            SV.vlabel(52, 200, "A'", VIO) + SV.vlabel(196, 200, "B'", VIO) +
            `<text x="230" y="230" text-anchor="middle" font-size="13" fill="#657187">圓規張開 = AB 長，一截即複製</text>`
          );
        },
        caption: '尺規作圖的精神：用「等半徑」保證長度、角度完全相等。'
      },

      {
        sec: '3-2', secName: '尺規作圖',
        title: '作角平分線',
        points: [
          '① 以頂點為圓心畫弧，交兩邊於 \\(P、Q\\)。',
          '② 分別以 \\(P、Q\\) 為圓心、<b>同半徑</b>畫弧，交於 \\(R\\)。',
          '③ 連頂點與 \\(R\\)，就是<span class="k">角平分線</span>。'
        ],
        visual: (h) => {
          const V = [80, 210];
          const d1 = 55, d2 = 5; // 兩邊方向
          const E1 = SV.pt(V[0], V[1], 260, d1), E2 = SV.pt(V[0], V[1], 300, d2);
          const P = SV.pt(V[0], V[1], 90, d1), Q = SV.pt(V[0], V[1], 90, d2);
          const R = SV.pt(V[0], V[1], 175, (d1 + d2) / 2);
          h.innerHTML = svg('0 0 420 250',
            SV.seg(V[0], V[1], E1[0], E1[1], '#334', 2.6) + SV.seg(V[0], V[1], E2[0], E2[1], '#334', 2.6) +
            carc(V[0], V[1], 90, d2 - 10, d1 + 10, AMB) +
            carc(P[0], P[1], 95, -50, 30, BLU) + carc(Q[0], Q[1], 95, 20, 90, BLU) +
            SV.seg(V[0], V[1], R[0], R[1], VIO, 2.8, '6 4') +
            SV.dot(P[0], P[1], AMB) + SV.dot(Q[0], Q[1], AMB) + SV.dot(R[0], R[1], VIO) +
            SV.vlabel(P[0] - 4, P[1] - 8, 'P', AMB) + SV.vlabel(Q[0] + 6, Q[1] + 4, 'Q', AMB) + SV.vlabel(R[0] + 8, R[1] + 4, 'R', VIO) + SV.vlabel(V[0] - 18, V[1] + 6, 'O') +
            SV.angle(V[0], V[1], 40, (d1 + d2) / 2, d1, GRN, '', { w: 2 }) + SV.angle(V[0], V[1], 40, d2, (d1 + d2) / 2, GRN, '', { w: 2 }) +
            `<text x="210" y="238" text-anchor="middle" font-size="13" fill="#657187">OR 把角分成相等的兩半</text>`
          );
        },
        caption: '同半徑作圖讓兩個小三角形全等，於是把角平分。'
      },

      {
        sec: '3-2', secName: '尺規作圖',
        title: '作線段的中垂線',
        points: [
          '分別以 \\(A、B\\) 為圓心、<b>大於一半 \\(\\overline{AB}\\)</b> 的同半徑畫弧。',
          '兩組弧交於上下兩點 \\(P、Q\\)。',
          '連 \\(PQ\\)，即為 \\(\\overline{AB}\\) 的<span class="k">中垂線</span>（過中點且垂直）。'
        ],
        visual: (h) => {
          const A = [130, 150], B = [310, 150], r = 120;
          const P = [220, 60], Q = [220, 240];
          h.innerHTML = svg('0 0 440 290',
            SV.seg(A[0], A[1], B[0], B[1], '#334', 3) + SV.dot(A[0], A[1], '#334') + SV.dot(B[0], B[1], '#334') +
            SV.vlabel(A[0] - 18, A[1] + 6, 'A') + SV.vlabel(B[0] + 8, B[1] + 6, 'B') +
            carc(A[0], A[1], r, 20, 80, AMB) + carc(A[0], A[1], r, -80, -20, AMB) +
            carc(B[0], B[1], r, 100, 160, BLU) + carc(B[0], B[1], r, -160, -100, BLU) +
            SV.seg(P[0], P[1], Q[0], Q[1], VIO, 2.8, '6 4') +
            SV.rightAngle(220, 150, 0, 90, 12, VIO) +
            SV.dot(P[0], P[1], VIO) + SV.dot(Q[0], Q[1], VIO) + SV.dot(220, 150, VIO) +
            SV.vlabel(P[0] + 8, P[1], 'P', VIO) + SV.vlabel(Q[0] + 8, Q[1] + 10, 'Q', VIO) + SV.vlabel(225, 168, 'M', VIO) +
            `<text x="220" y="280" text-anchor="middle" font-size="13" fill="#657187">PQ ⟂ AB 且通過中點 M</text>`
          );
        },
        caption: '「大於一半」才能讓兩弧相交；上下交點連線即中垂線。'
      },

      /* ---------- 3-3 全等 ---------- */
      {
        sec: '3-3', secName: '三角形的全等性質',
        title: '全等：完全一樣的兩個三角形',
        points: [
          '兩三角形能<b>完全疊合</b>，就是<span class="k">全等</span>，記作 \\(\\cong\\)。',
          '全等 ⇒ <b>對應邊相等、對應角相等</b>（共六組）。',
          '相同記號（刻度／弧）標示互相對應的邊與角。'
        ],
        formula: { label: '記法', tex: '\\triangle ABC\\cong\\triangle DEF' },
        visual: (h) => {
          const L = { A: [40, 150], B: [180, 150], C: [70, 45] };
          const off = 250;
          const R = { A: [40 + off, 150], B: [180 + off, 150], C: [70 + off, 45] };
          const marks = (T) => SV.ticks(T.A[0], T.A[1], T.B[0], T.B[1], 1, RED) + SV.ticks(T.B[0], T.B[1], T.C[0], T.C[1], 2, BLU) + SV.ticks(T.C[0], T.C[1], T.A[0], T.A[1], 3, AMB) +
            iangle(T.A, T.B, T.C, 20, GRN, '', { w: 2 });
          h.innerHTML = svg('0 0 520 210',
            SV.poly([L.A, L.B, L.C], 'rgba(5,150,105,0.06)', C) + marks(L) +
            SV.poly([R.A, R.B, R.C], 'rgba(5,150,105,0.06)', C) + marks(R) +
            `<text x="245" y="105" text-anchor="middle" font-size="30" fill="${C}">≅</text>` +
            SV.vlabel(L.A[0] - 16, L.A[1] + 8, 'A') + SV.vlabel(L.B[0] + 6, L.B[1] + 8, 'B') + SV.vlabel(L.C[0] - 6, L.C[1] - 8, 'C') +
            SV.vlabel(R.A[0] - 16, R.A[1] + 8, 'D') + SV.vlabel(R.B[0] + 6, R.B[1] + 8, 'E') + SV.vlabel(R.C[0] - 6, R.C[1] - 8, 'F') +
            `<text x="110" y="180" text-anchor="middle" font-size="11" font-weight="800" fill="${RED}">對應邊</text>` +
            `<text x="360" y="180" text-anchor="middle" font-size="11" font-weight="800" fill="${RED}">對應邊</text>` +
            `<text x="78" y="132" font-size="11" font-weight="800" fill="${GRN}">對應角</text>` +
            `<text x="328" y="132" font-size="11" font-weight="800" fill="${GRN}">對應角</text>`
          );
        },
        caption: '相同記號＝互相對應：對應邊（刻度數相同）、對應角（弧相同）都相等。'
      },

      {
        sec: '3-3', secName: '三角形的全等性質',
        title: '全等判別 (1)　SSS：三邊對應相等',
        points: [
          '三組<b>對應邊</b>都相等，兩三角形必全等。',
          '三邊定形：邊長一旦固定，三角形的形狀就唯一了。'
        ],
        formula: { label: 'SSS', tex: '\\overline{AB}=\\overline{DE},\\ \\overline{BC}=\\overline{EF},\\ \\overline{CA}=\\overline{FD}' },
        visual: (h) => {
          const L = { A: [40, 150], B: [190, 150], C: [80, 40] }, off = 250;
          const R = { A: [40 + off, 150], B: [190 + off, 150], C: [80 + off, 40] };
          const marks = (T) => SV.ticks(T.A[0], T.A[1], T.B[0], T.B[1], 1, RED) + SV.ticks(T.B[0], T.B[1], T.C[0], T.C[1], 2, BLU) + SV.ticks(T.C[0], T.C[1], T.A[0], T.A[1], 3, AMB);
          h.innerHTML = svg('0 0 520 200',
            SV.poly([L.A, L.B, L.C], 'rgba(5,150,105,0.06)', C) + marks(L) +
            SV.poly([R.A, R.B, R.C], 'rgba(5,150,105,0.06)', C) + marks(R) +
            `<text x="245" y="100" text-anchor="middle" font-size="28" fill="${C}">≅</text>`);
        },
        caption: '三邊（1、2、3 條刻度）分別相等 ⇒ 全等。',
        example: {
          q: '兩三角形三邊分別為 5、6、7，一定全等嗎？',
          steps: ['三組對應邊都相等，符合 SSS。'],
          ans: '一定全等（SSS）'
        }
      },

      {
        sec: '3-3', secName: '三角形的全等性質',
        title: '全等判別 (2)　SAS：兩邊夾一角',
        points: [
          '兩組<b>對應邊</b>相等，且它們<b>夾的角</b>也相等 ⇒ 全等。',
          '重點是「<b>夾角</b>」——角必須在兩已知邊的<u>中間</u>。'
        ],
        formula: { label: 'SAS', tex: '\\overline{AB}=\\overline{DE},\\ \\angle A=\\angle D,\\ \\overline{AC}=\\overline{DF}' },
        visual: (h) => {
          const L = { A: [40, 150], B: [190, 150], C: [80, 40] }, off = 250;
          const R = { A: [40 + off, 150], B: [190 + off, 150], C: [80 + off, 40] };
          const marks = (T) => SV.ticks(T.A[0], T.A[1], T.B[0], T.B[1], 1, RED) + SV.ticks(T.A[0], T.A[1], T.C[0], T.C[1], 2, BLU) + iangle(T.A, T.B, T.C, 24, GRN, '', { w: 2.6 });
          h.innerHTML = svg('0 0 520 200',
            SV.poly([L.A, L.B, L.C], 'rgba(5,150,105,0.06)', C) + marks(L) +
            SV.poly([R.A, R.B, R.C], 'rgba(5,150,105,0.06)', C) + marks(R) +
            `<text x="245" y="100" text-anchor="middle" font-size="28" fill="${C}">≅</text>`);
        },
        caption: '兩邊（紅、藍）＋夾角（綠）相等 ⇒ 全等。注意角要「夾在中間」。'
      },

      {
        sec: '3-3', secName: '三角形的全等性質',
        title: '全等判別 (3)　ASA 與 AAS：兩角一邊',
        points: [
          '<b>ASA</b>：兩角相等，且它們<b>夾的邊</b>相等。',
          '<b>AAS</b>：兩角相等，加上<b>一組對應（非夾）邊</b>相等。',
          '因為三內角和固定，知道兩角就等於知道三角，所以兩角配一邊即可。'
        ],
        formula: { label: 'ASA', tex: '\\angle A=\\angle D,\\ \\overline{AB}=\\overline{DE},\\ \\angle B=\\angle E' },
        visual: (h) => {
          const L = { A: [40, 150], B: [190, 150], C: [80, 40] }, off = 250;
          const R = { A: [40 + off, 150], B: [190 + off, 150], C: [80 + off, 40] };
          const marks = (T) => SV.ticks(T.A[0], T.A[1], T.B[0], T.B[1], 1, RED) + iangle(T.A, T.B, T.C, 24, GRN, '', { w: 2.4 }) + iangle(T.B, T.A, T.C, 24, BLU, '', { w: 2.4 });
          h.innerHTML = svg('0 0 520 200',
            SV.poly([L.A, L.B, L.C], 'rgba(5,150,105,0.06)', C) + marks(L) +
            SV.poly([R.A, R.B, R.C], 'rgba(5,150,105,0.06)', C) + marks(R) +
            `<text x="245" y="100" text-anchor="middle" font-size="28" fill="${C}">≅</text>`);
        },
        caption: '兩角（綠、藍）＋夾邊（紅）相等 ⇒ 全等（ASA）。'
      },

      {
        sec: '3-3', secName: '三角形的全等性質',
        title: '全等判別 (4)　RHS：直角三角形專用',
        points: [
          '限直角三角形：<b>直角(R)＋斜邊(H)＋一股(S)</b> 對應相等 ⇒ 全等。',
          '一般三角形「SSA」不一定全等，但有了直角就<b>可以</b>。',
          'RHS 是 SSA 在直角情況下的特例。'
        ],
        formula: { label: 'RHS', tex: '\\angle=90^\\circ,\\ \\text{斜邊相等},\\ \\text{一股相等}' },
        visual: (h) => {
          const L = { A: [50, 160], B: [50, 50], C: [200, 160] }, off = 250;
          const R = { A: [50 + off, 160], B: [50 + off, 50], C: [200 + off, 160] };
          const marks = (T) => SV.rightAngle(T.A[0], T.A[1], 0, 90, 14, '#657187') +
            SV.ticks(T.B[0], T.B[1], T.C[0], T.C[1], 1, RED) + // 斜邊
            SV.ticks(T.A[0], T.A[1], T.C[0], T.C[1], 2, BLU);  // 一股
          h.innerHTML = svg('0 0 520 210',
            SV.poly([L.A, L.B, L.C], 'rgba(5,150,105,0.06)', C) + marks(L) +
            SV.poly([R.A, R.B, R.C], 'rgba(5,150,105,0.06)', C) + marks(R) +
            `<text x="245" y="110" text-anchor="middle" font-size="28" fill="${C}">≅</text>` +
            `<text x="130" y="196" text-anchor="middle" font-size="12" fill="#657187">紅＝斜邊，藍＝一股</text>`);
        },
        caption: '直角（方框）＋斜邊（紅）＋一股（藍）相等 ⇒ 全等。'
      },

      /* ---------- 3-4 中垂線與角平分線 ---------- */
      {
        sec: '3-4', secName: '中垂線與角平分線的性質',
        title: '中垂線的性質：到兩端等距',
        points: [
          '中垂線上<b>任一點</b>，到線段<b>兩端點</b>的距離都相等。',
          '反過來：到兩端等距的點，一定在中垂線上。',
          '常用於「找到與兩點等距的位置」。'
        ],
        formula: { label: '性質', tex: 'P\\text{在}\\overline{AB}\\text{中垂線上}\\iff \\overline{PA}=\\overline{PB}' },
        visual: (h) => {
          const A = [120, 220], B = [320, 220], M = [220, 220], P = [220, 70];
          h.innerHTML = svg('0 0 440 280',
            SV.seg(A[0], A[1], B[0], B[1], '#334', 3) +
            SV.seg(P[0], 40, P[0], 250, VIO, 2, '6 4') +
            SV.rightAngle(M[0], M[1], 0, 90, 12, VIO) +
            SV.seg(P[0], P[1], A[0], A[1], RED, 2.4) + SV.seg(P[0], P[1], B[0], B[1], BLU, 2.4) +
            SV.ticks(P[0], P[1], A[0], A[1], 1, '#111') + SV.ticks(P[0], P[1], B[0], B[1], 1, '#111') +
            SV.dot(A[0], A[1], '#334') + SV.dot(B[0], B[1], '#334') + SV.dot(P[0], P[1], VIO) + SV.dot(M[0], M[1], VIO) +
            SV.vlabel(A[0] - 18, A[1] + 6, 'A') + SV.vlabel(B[0] + 8, B[1] + 6, 'B') + SV.vlabel(P[0] + 8, P[1] - 4, 'P', VIO) + SV.vlabel(M[0] + 6, M[1] + 20, 'M', VIO) +
            `<text x="160" y="150" font-size="14" fill="${RED}">PA</text><text x="270" y="150" font-size="14" fill="${BLU}">PB</text>` +
            `<text x="220" y="272" text-anchor="middle" font-size="13" fill="#657187">P 在中垂線上 ⇒ PA = PB</text>`
          );
        },
        caption: '不論 P 在中垂線的哪個高度，PA 與 PB 永遠一樣長。',
        example: {
          q: '\\(P\\) 在 \\(\\overline{AB}\\) 中垂線上，\\(\\overline{PA}=8\\)，求 \\(\\overline{PB}\\)。',
          steps: ['中垂線上的點到兩端等距。'],
          ans: '\\(\\overline{PB}=8\\)'
        }
      },

      {
        sec: '3-4', secName: '中垂線與角平分線的性質',
        title: '角平分線的性質：到兩邊等距',
        points: [
          '角平分線上<b>任一點</b>，到角的<b>兩邊</b>的（垂直）距離相等。',
          '反過來：到兩邊等距的點，一定在角平分線上。',
          '「距離」指的是<b>垂直距離</b>（點到線最短的長度）。'
        ],
        formula: { label: '性質', tex: 'P\\text{在角平分線上}\\iff d_1=d_2' },
        visual: (h) => {
          const V = [70, 230];
          const d1 = 50, d2 = 8;
          const E1 = SV.pt(V[0], V[1], 340, d1), E2 = SV.pt(V[0], V[1], 360, d2);
          const P = SV.pt(V[0], V[1], 210, (d1 + d2) / 2);
          // 垂足
          const foot = (E) => { const dx = E[0] - V[0], dy = E[1] - V[1], L = dx * dx + dy * dy; const t = ((P[0] - V[0]) * dx + (P[1] - V[1]) * dy) / L; return [V[0] + t * dx, V[1] + t * dy]; };
          const F1 = foot(E1), F2 = foot(E2);
          h.innerHTML = svg('0 0 440 280',
            SV.seg(V[0], V[1], E1[0], E1[1], '#334', 2.6) + SV.seg(V[0], V[1], E2[0], E2[1], '#334', 2.6) +
            SV.seg(V[0], V[1], P[0], P[1], VIO, 2, '6 4') +
            SV.seg(P[0], P[1], F1[0], F1[1], RED, 2.2) + SV.seg(P[0], P[1], F2[0], F2[1], BLU, 2.2) +
            SV.ticks(P[0], P[1], F1[0], F1[1], 1, '#111') + SV.ticks(P[0], P[1], F2[0], F2[1], 1, '#111') +
            SV.dot(P[0], P[1], VIO) + SV.vlabel(P[0] + 8, P[1] + 4, 'P', VIO) + SV.vlabel(V[0] - 16, V[1] + 6, 'O') +
            SV.angle(V[0], V[1], 42, (d1 + d2) / 2, d1, GRN, '', { w: 2 }) + SV.angle(V[0], V[1], 42, d2, (d1 + d2) / 2, GRN, '', { w: 2 }) +
            `<text x="220" y="272" text-anchor="middle" font-size="13" fill="#657187">P 到兩邊的垂直距離相等</text>`
          );
        },
        caption: '角平分線把角分兩半，線上的點到兩邊一樣近。',
        example: {
          q: '\\(P\\) 在 \\(\\angle O\\) 平分線上，到一邊距離 5，到另一邊距離？',
          steps: ['角平分線上的點到兩邊等距。'],
          ans: '5'
        }
      },

      {
        sec: '3-4', secName: '等腰三角形性質',
        title: '等腰三角形的性質',
        points: [
          '兩邊相等的三角形叫<span class="k">等腰三角形</span>，相等的兩邊叫<b>腰</b>。',
          '<b>兩底角相等</b>（等邊對等角）。',
          '<b>頂角平分線＝底邊中線＝底邊上的高＝底邊中垂線</b>（四線合一）。',
          '反過來：<b>有兩角相等 ⇒ 是等腰三角形</b>（等角對等邊）。'
        ],
        formula: { label: '等腰三角形', tex: '\\overline{AB}=\\overline{AC}\\iff \\angle B=\\angle C' },
        visual: (h) => {
          const A = [210, 60], B = [110, 250], Cc = [310, 250], M = [210, 250];
          h.innerHTML = svg('0 0 420 320',
            SV.poly([A, B, Cc], 'rgba(5,150,105,0.07)', C, 2.6) +
            SV.ticks(A[0], A[1], B[0], B[1], 1, RED) + SV.ticks(A[0], A[1], Cc[0], Cc[1], 1, RED) +
            SV.seg(A[0], A[1], M[0], M[1], VIO, 2, '6 4') +
            SV.rightAngle(M[0], M[1], 0, 90, 12, VIO) +
            SV.ticks(B[0], B[1], M[0], M[1], 2, '#111') + SV.ticks(M[0], M[1], Cc[0], Cc[1], 2, '#111') +
            iangle(B, A, Cc, 26, BLU, '', { w: 2.6 }) + iangle(Cc, A, B, 26, BLU, '', { w: 2.6 }) +
            SV.vlabel(A[0] - 4, A[1] - 10, 'A') + SV.vlabel(B[0] - 20, B[1] + 6, 'B') + SV.vlabel(Cc[0] + 8, Cc[1] + 6, 'C') + SV.vlabel(M[0] + 6, M[1] + 22, 'M', VIO) +
            `<text x="145" y="150" font-size="12" font-weight="800" fill="${RED}">腰</text><text x="272" y="150" font-size="12" font-weight="800" fill="${RED}">腰</text>` +
            `<text x="210" y="305" text-anchor="middle" font-size="12.5" fill="#657187">兩腰相等（紅）⇒ 兩底角相等（藍）；AM ⟂ 平分底邊</text>`
          );
        },
        caption: '等腰＝兩腰等、兩底角等；頂角平分線「四線合一」。',
        example: {
          q: '等腰三角形頂角 \\(40^\\circ\\)，兩底角各幾度？',
          steps: ['底角相等，設各 \\(x\\)：\\(40^\\circ+2x=180^\\circ\\)。', '\\(2x=140^\\circ\\Rightarrow x=70^\\circ\\)。'],
          ans: '各 70°'
        }
      },

      /* ---------- 3-5 邊角關係 ---------- */
      {
        sec: '3-5', secName: '三角形的邊角關係',
        title: '大角對大邊、大邊對大角',
        points: [
          '同一三角形中，<b>比較大的角</b>，對面就是<b>比較長的邊</b>；反之亦然。',
          '角的大小順序 ＝ 對邊的長短順序。',
          '特例：<b>等邊對等角、等角對等邊</b>（兩邊相等 ⇔ 兩角相等）。',
          '拖動頂點 C：最大角（紅）永遠對最長邊（紅）。'
        ],
        formula: { label: '對應關係', tex: '\\angle A>\\angle B>\\angle C\\iff a>b>c' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="safig"></div>
            <div class="ictrl"><label>頂點 C 左右 <span class="ival" id="sax">300</span></label><input type="range" id="saxr" min="130" max="380" value="300">
            <label>高度 <span class="ival" id="say">95</span></label><input type="range" id="sayr" min="55" max="175" value="95"></div></div>`;
          const A = [80, 245], B = [360, 245], D = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
          const draw = () => {
            const cx = +h.querySelector('#saxr').value, cy = +h.querySelector('#sayr').value;
            h.querySelector('#sax').textContent = cx; h.querySelector('#say').textContent = cy;
            const Cc = [cx, cy];
            const angA = Math.round(angleAt(A, B, Cc)), angB = Math.round(angleAt(B, A, Cc)), angC = 180 - angA - angB;
            const items = [
              { len: D(B, Cc), p: B, q: Cc, deg: angA, V: A },
              { len: D(Cc, A), p: Cc, q: A, deg: angB, V: B },
              { len: D(A, B), p: A, q: B, deg: angC, V: Cc }
            ];
            const sorted = [...items].sort((x, y) => y.len - x.len);
            const colOf = it => it === sorted[0] ? RED : it === sorted[2] ? BLU : AMB;
            let s = SV.poly([A, B, Cc], 'rgba(5,150,105,0.05)', 'rgba(0,0,0,0)', 0);
            items.forEach(it => s += SV.seg(it.p[0], it.p[1], it.q[0], it.q[1], colOf(it), it === sorted[0] ? 4.6 : (it === sorted[2] ? 2.2 : 3.2)));
            s += iangle(items[0].V, B, Cc, 22, colOf(items[0]), angA + '°', { w: 3, fs: 12 });
            s += iangle(items[1].V, Cc, A, 22, colOf(items[1]), angB + '°', { w: 3, fs: 12 });
            s += iangle(items[2].V, A, B, 20, colOf(items[2]), angC + '°', { w: 3, fs: 12 });
            s += SV.vlabel(A[0] - 20, A[1] + 8, 'A') + SV.vlabel(B[0] + 8, B[1] + 8, 'B') + SV.vlabel(Cc[0] - 6, Cc[1] - 12, 'C');
            s += `<text x="220" y="304" text-anchor="middle" font-size="13" font-weight="800" fill="#657187">紅＝最大角對最長邊、藍＝最小角對最短邊</text>`;
            h.querySelector('#safig').innerHTML = svg('0 0 440 316', s);
          };
          h.querySelector('#saxr').oninput = draw; h.querySelector('#sayr').oninput = draw; draw();
        },
        caption: '想比邊長，先看它「對面的角」誰大。',
        example: {
          q: '三角形三內角為 40°、60°、80°，最長邊對哪個角？',
          steps: ['最大角是 80°。', '大角對大邊 ⇒ 最長邊在 80° 的對面。'],
          ans: '80° 的對邊最長'
        }
      },

      {
        sec: '3-5', secName: '三角形的邊角關係',
        title: '三角形三邊關係：兩邊和 > 第三邊',
        points: [
          '任兩邊長度<b>相加</b>，一定<b>大於</b>第三邊；相減則小於第三邊。',
          '因為「兩點之間直線最短」，繞兩邊走一定比直接一邊長。',
          '判斷三線段能否組成三角形：只要<b>最短兩邊之和 > 最長邊</b>即可。',
          '拖三個滑桿改變邊長，看能不能圍成三角形。'
        ],
        formula: { label: '三邊關係', tex: '|b-c| \\lt a \\lt b+c' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="trifig"></div>
            <div class="ictrl">
              <label>a <span class="ival" id="va2">5</span></label><input type="range" id="ra" min="2" max="9" value="5">
              <label>b <span class="ival" id="vb2">6</span></label><input type="range" id="rb" min="2" max="9" value="6">
              <label>c <span class="ival" id="vc2">7</span></label><input type="range" id="rc" min="2" max="9" value="7"></div></div>`;
          const sc = 26, A = [100, 235];
          const draw = () => {
            const a = +h.querySelector('#ra').value, b = +h.querySelector('#rb').value, c = +h.querySelector('#rc').value;
            h.querySelector('#va2').textContent = a; h.querySelector('#vb2').textContent = b; h.querySelector('#vc2').textContent = c;
            const ok = (a + b > c) && (a + c > b) && (b + c > a);
            const B = [A[0] + c * sc, A[1]];
            let s = '';
            if (ok) {
              const cxr = (c * c + b * b - a * a) / (2 * c);
              const cyr = Math.sqrt(Math.max(0, b * b - cxr * cxr));
              const Cc = [A[0] + cxr * sc, A[1] - cyr * sc];
              s += SV.poly([A, B, Cc], 'rgba(5,150,105,0.08)', GRN, 3) +
                `<text x="${(A[0] + B[0]) / 2}" y="${A[1] + 20}" text-anchor="middle" font-size="13" font-weight="800" fill="${BLU}">c=${c}</text>` +
                `<text x="${(A[0] + Cc[0]) / 2 - 14}" y="${(A[1] + Cc[1]) / 2}" font-size="13" font-weight="800" fill="${RED}">b=${b}</text>` +
                `<text x="${(B[0] + Cc[0]) / 2 + 4}" y="${(B[1] + Cc[1]) / 2}" font-size="13" font-weight="800" fill="${AMB}">a=${a}</text>` +
                `<text x="230" y="300" text-anchor="middle" font-size="15" font-weight="900" fill="${GRN}">✓ 可以組成三角形</text>`;
            } else {
              const e1 = SV.pt(A[0], A[1], b * sc, 62), e2 = SV.pt(B[0], B[1], a * sc, 118);
              s += SV.seg(A[0], A[1], B[0], B[1], BLU, 5) + SV.seg(A[0], A[1], e1[0], e1[1], RED, 4) + SV.seg(B[0], B[1], e2[0], e2[1], AMB, 4) +
                `<text x="230" y="290" text-anchor="middle" font-size="15" font-weight="900" fill="${RED}">✗ 兩短邊搆不到，無法組成</text>` +
                `<text x="230" y="312" text-anchor="middle" font-size="12" fill="#657187">最短兩邊之和 ≤ 最長邊</text>`;
            }
            s += SV.dot(A[0], A[1], '#334') + SV.dot(B[0], B[1], '#334') + SV.vlabel(A[0] - 18, A[1] + 8, 'A') + SV.vlabel(B[0] + 6, B[1] + 8, 'B');
            h.querySelector('#trifig').innerHTML = svg('0 0 460 324', s);
          };
          ['#ra', '#rb', '#rc'].forEach(id => h.querySelector(id).oninput = draw);
          draw();
        },
        caption: '拖滑桿試試：3、5、9 這種「兩短邊之和 ≤ 最長邊」就圍不起來。',
        example: {
          q: '3、5、9 三線段能組成三角形嗎？',
          steps: ['取最短兩邊相加：\\(3+5=8\\)。', '\\(8 \\lt 9\\)（不大於最長邊）⇒ 無法組成。'],
          ans: '不能'
        }
      },

      {
        sec: '3-5', secName: '三角形的邊角關係',
        title: '畢氏定理逆定理：判別直角三角形',
        points: [
          '<b>畢氏定理</b>：直角三角形兩股平方和 ＝ 斜邊平方。',
          '<span class="k">逆定理</span>：若三邊滿足 \\(a^2+b^2=c^2\\)（\\(c\\) 最長），則它<b>一定是直角三角形</b>。',
          '常用來「用邊長反推有沒有直角」。'
        ],
        formula: { label: '畢氏逆定理', tex: 'a^2+b^2=c^2 \\;\\Rightarrow\\; \\text{直角三角形}' },
        visual: (h) => {
          const A = [120, 268], B = [120, 68], Cc = [270, 268];
          h.innerHTML = `<div style="width:100%">` + svg('0 0 420 300',
            SV.poly([A, B, Cc], 'rgba(5,150,105,0.07)', C, 2.8) +
            SV.rightAngle(A[0], A[1], 0, 90, 15, '#657187') +
            `<text x="${A[0] - 16}" y="${(A[1] + B[1]) / 2}" text-anchor="middle" font-size="15" font-weight="800" fill="${BLU}">4</text>` +
            `<text x="${(A[0] + Cc[0]) / 2}" y="${A[1] + 22}" text-anchor="middle" font-size="15" font-weight="800" fill="${AMB}">3</text>` +
            `<text x="${(B[0] + Cc[0]) / 2 + 8}" y="${(B[1] + Cc[1]) / 2 - 6}" font-size="15" font-weight="800" fill="${RED}">5</text>` +
            SV.vlabel(A[0] - 20, A[1] + 8, 'A') + SV.vlabel(B[0] - 20, B[1], 'B') + SV.vlabel(Cc[0] + 8, Cc[1] + 6, 'C')
          ) + SV.fbox([{ label: '檢驗', tex: '3^2+4^2=9+16=25=5^2', color: C, size: 17 }]) + `</div>`;
        },
        caption: '3²+4²=5² ⇒ 3、4、5 一定圍成直角三角形（直角對最長邊）。',
        example: {
          q: '邊長 6、8、10 的三角形是直角三角形嗎？',
          steps: ['最長邊 10。', '\\(6^2+8^2=36+64=100=10^2\\)。', '符合畢氏 ⇒ 是直角三角形。'],
          ans: '是（直角三角形）'
        }
      }
    ]
  });
})();
