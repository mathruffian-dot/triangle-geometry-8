/* ============ 第 2 章　圓 ============
   依康軒115學年第五冊課程計畫：2-1 點、直線與圓之間的位置關係、2-2 圓心角、圓周角與弧的關係
   （課綱未含弦切角，故不列入）
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#7c3aed';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }
  const circle = (cx, cy, r, stroke = '#334', fill = 'none', w = 2.6) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
  const arc = (cx, cy, r, d0, d1, color, w = 5) =>
    `<polyline points="${SV.arcPoints(cx, cy, r, d0, d1)}" fill="none" stroke="${color}" stroke-width="${w}"/>`;

  window.DECK.push({
    ch: 2,
    title: '圓',
    color: C,
    sections: ['2-1 點、直線與圓之間的位置關係', '2-2 圓心角、圓周角與弧的關係'],
    slides: [

      /* ---------- 2-1 點、直線與圓之間的位置關係 ---------- */
      {
        sec: '2-1', secName: '圓的基本元素',
        title: '圓的基本元素',
        points: [
          '<span class="k">圓心 O</span>到圓上各點距離都相等，這距離就是<span class="k">半徑 r</span>。',
          '連接圓上兩點的線段叫<b>弦</b>；通過圓心的弦叫<b>直徑</b>（\\(=2r\\)，最長的弦）。',
          '圓上兩點間的一段曲線叫<b>弧</b>；弦與弧圍成<b>弓形</b>，兩半徑與弧圍成<b>扇形</b>。'
        ],
        formula: { label: '直徑', tex: 'd=2r' },
        visual: (h) => {
          const O = [210, 160], r = 120;
          const A = SV.pt(O[0], O[1], r, 200), B = SV.pt(O[0], O[1], r, 340);
          const P = SV.pt(O[0], O[1], r, 60), Q = SV.pt(O[0], O[1], r, 130);
          let s = circle(O[0], O[1], r, '#334');
          s += arc(O[0], O[1], r, 60, 130, C, 6);
          s += SV.seg(O[0], O[1], P[0], P[1], VIO, 2.4) + SV.seg(O[0], O[1], Q[0], Q[1], VIO, 2.4);
          const D1 = SV.pt(O[0], O[1], r, 0), D2 = SV.pt(O[0], O[1], r, 180);
          s += SV.seg(A[0], A[1], B[0], B[1], BLU, 2.6);
          s += SV.seg(D2[0], D2[1], D1[0], D1[1], GRN, 2.6);
          s += SV.dot(O[0], O[1], '#172033', 4.5) + SV.vlabel(O[0] - 6, O[1] + 20, 'O');
          s += `<text x="${(O[0] + D1[0]) / 2}" y="${O[1] - 8}" text-anchor="middle" font-size="12" font-weight="800" fill="${GRN}">直徑</text>`;
          s += `<text x="${(O[0] + P[0]) / 2 + 6}" y="${(O[1] + P[1]) / 2}" font-size="12" font-weight="800" fill="${VIO}">r</text>`;
          s += `<text x="${(A[0] + B[0]) / 2}" y="${A[1] + 20}" text-anchor="middle" font-size="12" font-weight="800" fill="${BLU}">弦</text>`;
          s += `<text x="${SV.pt(O[0], O[1], r + 18, 95)[0]}" y="${SV.pt(O[0], O[1], r + 18, 95)[1]}" text-anchor="middle" font-size="12" font-weight="800" fill="${C}">弧</text>`;
          h.innerHTML = svg('0 0 430 320', s);
        },
        caption: '半徑、直徑、弦、弧、弓形、扇形——圓的所有題目都由這些元素組成。',
        example: {
          q: '一圓的直徑為 14 公分，半徑是多少？',
          steps: ['\\(r=\\dfrac{d}{2}=7\\)。'],
          ans: '半徑 7 公分'
        }
      },

      {
        sec: '2-1', secName: '弦與弦心距',
        title: '弦心距垂直平分弦',
        points: [
          '圓心到弦的<b>垂直距離</b>叫<span class="k">弦心距</span>。',
          '弦心距一定<b>垂直平分</b>這條弦（\\(OM\\perp AB\\) 且 \\(AM=MB\\)）。',
          '半徑、半弦、弦心距構成直角三角形：\\((\\tfrac{弦}{2})^2+d^2=r^2\\)。拖滑桿看弦怎麼變。'
        ],
        formula: { label: '弦長與弦心距', tex: '\\left(\\tfrac{弦}{2}\\right)^2+d^2=r^2' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="chd"></div>
            <div class="ictrl"><label>弦心距 d <span class="ival" id="dv">50</span></label><input type="range" id="ds" min="0" max="100" value="50"></div></div>`;
          const O = [210, 150], r = 110;
          const draw = () => {
            const d = +h.querySelector('#ds').value; h.querySelector('#dv').textContent = d;
            const L = Math.sqrt(Math.max(0, r * r - d * d));
            const y = O[1] - d, A = [O[0] - L, y], B = [O[0] + L, y], M = [O[0], y];
            let s = circle(O[0], O[1], r, '#334');
            s += SV.seg(A[0], A[1], B[0], B[1], BLU, 3.4) + SV.seg(O[0], O[1], M[0], M[1], RED, 2.6);
            if (d > 6) s += SV.rightAngle(M[0], M[1], 0, 90, 11, RED);
            s += SV.ticks(A[0], A[1], M[0], M[1], 1, GRN) + SV.ticks(M[0], M[1], B[0], B[1], 1, GRN);
            s += SV.dot(O[0], O[1], '#172033', 4) + SV.vlabel(O[0] + 6, O[1] + 16, 'O');
            s += SV.dot(A[0], A[1], '#172033', 3.5) + SV.vlabel(A[0] - 16, A[1] - 6, 'A');
            s += SV.dot(B[0], B[1], '#172033', 3.5) + SV.vlabel(B[0] + 6, B[1] - 6, 'B') + SV.vlabel(M[0] + 6, M[1] - 6, 'M');
            s += `<text x="${O[0] + 8}" y="${O[1] - d / 2}" font-size="12" font-weight="800" fill="${RED}">d=${d}</text>`;
            s += `<text x="${O[0]}" y="${y - 12}" text-anchor="middle" font-size="12" font-weight="800" fill="${BLU}">弦長 = ${(2 * L).toFixed(0)}</text>`;
            h.querySelector('#chd').innerHTML = svg('0 0 430 290', s);
          };
          h.querySelector('#ds').oninput = draw; draw();
        },
        caption: '弦心距越小，弦越長；\\(d=0\\) 時弦最長（＝直徑）。',
        example: {
          q: '半徑 13，弦心距 5，求弦長。',
          steps: ['半弦 \\(=\\sqrt{13^2-5^2}=\\sqrt{144}=12\\)。', '弦長 \\(=24\\)。'],
          ans: '弦長 24'
        }
      },

      {
        sec: '2-1', secName: '點與圓',
        title: '點與圓的位置關係',
        points: [
          '比較「點到圓心的距離 \\(d\\)」與「半徑 \\(r\\)」：',
          '\\(d\\lt r\\)：<b>圓內</b>；　\\(d=r\\)：<b>圓上</b>；　\\(d\\gt r\\)：<b>圓外</b>。',
          '拖滑桿改變 \\(d\\)，看點跑進跑出圓。'
        ],
        formula: { label: '判斷準則', tex: 'd\\lessgtr r' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="pc"></div>
            <div class="ictrl"><label>點到圓心距離 d <span class="ival" id="pv">60</span></label><input type="range" id="ps" min="20" max="160" value="60"></div></div>`;
          const O = [170, 150], r = 90;
          const draw = () => {
            const d = +h.querySelector('#ps').value; h.querySelector('#pv').textContent = d;
            const P = [O[0] + d, O[1]];
            const [name, col] = d < r - 2 ? ['圓內', GRN] : d > r + 2 ? ['圓外', RED] : ['圓上', BLU];
            let s = circle(O[0], O[1], r, '#334', 'rgba(124,58,237,0.05)');
            s += SV.seg(O[0], O[1], P[0], P[1], '#8a94a6', 2, '4 3');
            s += SV.dot(O[0], O[1], '#172033', 4) + SV.vlabel(O[0] - 16, O[1] + 6, 'O');
            s += SV.dot(P[0], P[1], col, 6) + SV.vlabel(P[0] + 6, P[1] - 8, 'P');
            s += `<text x="${O[0] + d / 2}" y="${O[1] - 8}" text-anchor="middle" font-size="12" font-weight="800" fill="#657187">d=${d}</text>`;
            s += `<text x="170" y="285" text-anchor="middle" font-size="16" font-weight="900" fill="${col}">d ${d < r - 2 ? '<' : d > r + 2 ? '>' : '='} r ⇒ ${name}（r=${r}）</text>`;
            h.querySelector('#pc').innerHTML = svg('0 0 380 300', s);
          };
          h.querySelector('#ps').oninput = draw; draw();
        },
        caption: '只看 \\(d\\) 和 \\(r\\) 誰大：圓內、圓上、圓外一翻兩瞪眼。',
        example: {
          q: '圓半徑 5，點到圓心距離 5，點在哪裡？',
          steps: ['\\(d=5=r\\)。'],
          ans: '圓上'
        }
      },

      {
        sec: '2-1', secName: '直線與圓',
        title: '直線與圓的位置關係',
        points: [
          '比較「圓心到直線的距離 \\(d\\)」與半徑 \\(r\\)：',
          '\\(d\\gt r\\)：<b>不相交</b>（0 交點）；\\(d=r\\)：<b>相切</b>（1 交點，此直線為<b>切線</b>）；',
          '\\(d\\lt r\\)：<b>交於兩點</b>（割線）。拖滑桿看交點數變化。'
        ],
        formula: { label: '交點數', tex: 'd\\gt r,\\ d=r,\\ d\\lt r' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="lc"></div>
            <div class="ictrl"><label>圓心到直線距離 d <span class="ival" id="lv">50</span></label><input type="range" id="ls" min="20" max="150" value="50"></div></div>`;
          const O = [200, 140], r = 90;
          const draw = () => {
            const d = +h.querySelector('#ls').value; h.querySelector('#lv').textContent = d;
            const lx = O[0] - d;
            const [name, col, cnt] = d > r + 2 ? ['不相交', RED, 0] : d < r - 2 ? ['交於兩點（割線）', GRN, 2] : ['相切（切線）', BLU, 1];
            let s = circle(O[0], O[1], r, '#334', 'rgba(124,58,237,0.05)');
            s += SV.seg(lx, 20, lx, 260, col, 3) + SV.seg(O[0], O[1], lx, O[1], '#8a94a6', 2, '4 3');
            if (d > 6 && d < r + 30) s += SV.rightAngle(lx, O[1], 0, 90, 10, '#8a94a6');
            s += SV.dot(O[0], O[1], '#172033', 4) + SV.vlabel(O[0] + 6, O[1] + 16, 'O');
            if (cnt >= 1) { const yy = Math.sqrt(Math.max(0, r * r - d * d)); [O[1] - yy, O[1] + yy].slice(0, cnt).forEach(y => s += SV.dot(lx, y, col, 5)); }
            s += `<text x="200" y="288" text-anchor="middle" font-size="16" font-weight="900" fill="${col}">${name}　${cnt} 交點</text>`;
            h.querySelector('#lc').innerHTML = svg('0 0 400 300', s);
          };
          h.querySelector('#ls').oninput = draw; draw();
        },
        caption: '\\(d=r\\) 恰好碰到圓一點——那條直線就是切線。',
        example: {
          q: '圓半徑 6，圓心到直線距離 8，位置關係為何？',
          steps: ['\\(d=8\\gt r=6\\)。'],
          ans: '不相交'
        }
      },

      {
        sec: '2-1', secName: '切線',
        title: '切線的性質',
        points: [
          '① 切線<b>垂直</b>於過切點的半徑：\\(OT\\perp\\) 切線（切線性質）。',
          '② 從圓外一點 \\(P\\) 作兩條切線，<b>切線段等長</b>：\\(PA=PB\\)。',
          '這兩點是解切線題的萬用工具。'
        ],
        formula: { label: '切線段等長', tex: '\\overline{PA}=\\overline{PB}' },
        visual: (h) => {
          const O = [150, 150], r = 80, P = [370, 150];
          const ang = Math.atan2(P[1] - O[1], P[0] - O[0]);
          const a = Math.acos(r / Math.hypot(P[0] - O[0], P[1] - O[1]));
          const TA = [O[0] + r * Math.cos(ang - a), O[1] + r * Math.sin(ang - a)];
          const TB = [O[0] + r * Math.cos(ang + a), O[1] + r * Math.sin(ang + a)];
          let s = circle(O[0], O[1], r, '#334', 'rgba(124,58,237,0.05)');
          s += SV.seg(O[0], O[1], TA[0], TA[1], VIO, 2.2) + SV.seg(O[0], O[1], TB[0], TB[1], VIO, 2.2);
          s += SV.seg(P[0], P[1], TA[0], TA[1], GRN, 3) + SV.seg(P[0], P[1], TB[0], TB[1], GRN, 3);
          s += SV.rightAngle(TA[0], TA[1], SV.angleOf(TA[0], TA[1], O[0], O[1]), SV.angleOf(TA[0], TA[1], P[0], P[1]), 11, RED);
          s += SV.rightAngle(TB[0], TB[1], SV.angleOf(TB[0], TB[1], O[0], O[1]), SV.angleOf(TB[0], TB[1], P[0], P[1]), 11, RED);
          s += SV.dot(O[0], O[1], '#172033', 4) + SV.vlabel(O[0] - 16, O[1] + 6, 'O');
          s += SV.dot(P[0], P[1], '#172033', 4) + SV.vlabel(P[0] + 6, P[1] + 6, 'P');
          s += SV.dot(TA[0], TA[1], GRN, 4) + SV.vlabel(TA[0] - 4, TA[1] - 8, 'A');
          s += SV.dot(TB[0], TB[1], GRN, 4) + SV.vlabel(TB[0] - 4, TB[1] + 16, 'B');
          s += `<text x="270" y="90" font-size="12" font-weight="800" fill="${GRN}">PA = PB</text>`;
          h.innerHTML = svg('0 0 440 300', s);
        },
        caption: '半徑⊥切線（紅直角）；同一外點的兩切線段等長（PA＝PB）。',
        example: {
          q: '\\(P\\) 到圓心 \\(O\\) 距離 10，圓半徑 6，求切線長 \\(PA\\)。',
          steps: ['\\(OA\\perp PA\\)：\\(PA=\\sqrt{10^2-6^2}=\\sqrt{64}=8\\)。'],
          ans: '切線長 8'
        }
      },

      {
        sec: '2-1', secName: '兩圓',
        title: '兩圓的位置關係',
        points: [
          '設兩圓半徑 \\(R,r\\)，圓心距 \\(d\\)。比較 \\(d\\) 與 \\(R+r\\)、\\(R-r\\)：',
          '\\(d\\gt R+r\\) 外離；\\(d=R+r\\) 外切；\\(R-r\\lt d\\lt R+r\\) 相交；',
          '\\(d=R-r\\) 內切；\\(d\\lt R-r\\) 內含。拖滑桿移動右圓看變化。'
        ],
        formula: { label: '判斷關鍵', tex: 'd\\ \\text{vs}\\ R+r,\\ R-r' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="tc"></div>
            <div class="ictrl"><label>圓心距 d <span class="ival" id="tv">115</span></label><input type="range" id="ts" min="20" max="220" value="115"></div></div>`;
          const O1 = [150, 150], R = 70, r = 45;
          const draw = () => {
            const d = +h.querySelector('#ts').value; h.querySelector('#tv').textContent = d;
            const O2 = [O1[0] + d, O1[1]], sum = R + r, diff = R - r;
            let name, col;
            if (d > sum + 2) { name = '外離'; col = RED; }
            else if (Math.abs(d - sum) <= 2) { name = '外切'; col = AMB; }
            else if (d > diff + 2) { name = '相交'; col = GRN; }
            else if (Math.abs(d - diff) <= 2) { name = '內切'; col = BLU; }
            else { name = '內含'; col = VIO; }
            let s = circle(O1[0], O1[1], R, '#334', 'rgba(37,99,235,0.05)') + circle(O2[0], O2[1], r, '#334', 'rgba(5,150,105,0.06)');
            s += SV.seg(O1[0], O1[1], O2[0], O2[1], '#8a94a6', 2, '4 3');
            s += SV.dot(O1[0], O1[1], '#172033', 4) + SV.dot(O2[0], O2[1], '#172033', 4);
            s += `<text x="200" y="285" text-anchor="middle" font-size="16" font-weight="900" fill="${col}">${name}　(R=${R}, r=${r}, d=${d})</text>`;
            h.querySelector('#tc').innerHTML = svg('0 0 420 300', s);
          };
          h.querySelector('#ts').oninput = draw; draw();
        },
        caption: '五種關係，全靠 \\(d\\) 和 \\(R+r\\)、\\(R-r\\) 比大小決定。',
        example: {
          q: '兩圓半徑 8 與 3，圓心距 11，位置關係？',
          steps: ['\\(R+r=11=d\\)。'],
          ans: '外切'
        }
      },

      {
        sec: '2-1', secName: '弧長與扇形',
        title: '弧長公式',
        points: [
          '一段弧是整個圓周的一部分，佔比＝<b>圓心角 ÷ 360°</b>。',
          '圓周長 \\(=2\\pi r\\)，所以弧長 \\(=2\\pi r\\times\\dfrac{\\theta}{360}\\)。',
          '拖滑桿改變角度，看弧長怎麼算。'
        ],
        formula: { label: '弧長', tex: '\\ell=2\\pi r\\times\\dfrac{\\theta}{360^\\circ}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="al"></div>
            <div class="ictrl"><label>圓心角 <span class="ival" id="av">90</span>°</label><input type="range" id="as" min="30" max="330" step="10" value="90"></div></div>`;
          const O = [160, 150], rr = 100, rMath = 6;
          const draw = () => {
            const t = +h.querySelector('#as').value; h.querySelector('#av').textContent = t;
            const A = SV.pt(O[0], O[1], rr, 90), B = SV.pt(O[0], O[1], rr, 90 - t);
            let s = circle(O[0], O[1], rr, '#ccd3df');
            s += arc(O[0], O[1], rr, 90 - t, 90, C, 6);
            s += SV.seg(O[0], O[1], A[0], A[1], '#334', 2.2) + SV.seg(O[0], O[1], B[0], B[1], '#334', 2.2);
            s += SV.angle(O[0], O[1], 26, 90 - t, 90, RED, '', { w: 2.4, fill: 1 });
            s += SV.dot(O[0], O[1], '#172033', 3.5);
            const val = (2 * Math.PI * rMath * t / 360);
            s += `<text x="160" y="285" text-anchor="middle" font-size="13" font-weight="800" fill="#172033">r=${rMath}, θ=${t}° → 弧長 = ${val.toFixed(2)}</text>`;
            h.querySelector('#al').innerHTML = svg('0 0 330 300', s + `<text x="315" y="60" text-anchor="end" font-size="12" fill="${C}">ℓ = 2π·${rMath}·${t}/360</text>`);
          };
          h.querySelector('#as').oninput = draw; draw();
        },
        caption: '弧長就是「圓周長」乘上「這段弧佔整圈的比例」。',
        example: {
          q: '半徑 6、圓心角 \\(60^\\circ\\) 的弧長（用 \\(\\pi\\)）。',
          steps: ['\\(\\ell=2\\pi\\times6\\times\\dfrac{60}{360}=2\\pi\\)。'],
          ans: '\\(2\\pi\\)'
        }
      },

      {
        sec: '2-1', secName: '弧長與扇形',
        title: '扇形面積公式',
        points: [
          '扇形是圓的一塊「派」，面積也佔整圓的 \\(\\dfrac{\\theta}{360}\\)。',
          '圓面積 \\(=\\pi r^2\\)，所以扇形面積 \\(=\\pi r^2\\times\\dfrac{\\theta}{360}\\)。',
          '另一好用式子：扇形面積 \\(=\\dfrac12\\times\\)弧長\\(\\times r\\)。'
        ],
        formula: { label: '扇形面積', tex: 'A=\\pi r^2\\times\\dfrac{\\theta}{360^\\circ}=\\dfrac12\\,\\ell\\, r' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="sec"></div>
            <div class="ictrl"><label>圓心角 <span class="ival" id="sv">90</span>°</label><input type="range" id="ss" min="30" max="330" step="10" value="90"></div></div>`;
          const O = [160, 150], rr = 105, rMath = 6;
          const draw = () => {
            const t = +h.querySelector('#ss').value; h.querySelector('#sv').textContent = t;
            const d0 = 90 - t, A = SV.pt(O[0], O[1], rr, 90);
            const fanPts = `M${O[0]},${O[1]} L${A[0].toFixed(1)},${A[1].toFixed(1)} ` +
              SV.arcPoints(O[0], O[1], rr, d0, 90).split(' ').reverse().map(p => 'L' + p).join(' ') + ' Z';
            let s = circle(O[0], O[1], rr, '#ccd3df');
            s += `<path d="${fanPts}" fill="rgba(124,58,237,0.18)" stroke="${C}" stroke-width="2.4"/>`;
            s += SV.dot(O[0], O[1], '#172033', 3.5);
            const val = (Math.PI * rMath * rMath * t / 360);
            s += `<text x="160" y="285" text-anchor="middle" font-size="13" font-weight="800" fill="#172033">r=${rMath}, θ=${t}° → 面積 = ${val.toFixed(2)}</text>`;
            h.querySelector('#sec').innerHTML = svg('0 0 330 300', s + `<text x="315" y="60" text-anchor="end" font-size="12" fill="${C}">A = π·${rMath}²·${t}/360</text>`);
          };
          h.querySelector('#ss').oninput = draw; draw();
        },
        caption: '扇形面積＝整圓面積 \\(\\pi r^2\\) 的 \\(\\dfrac{\\theta}{360}\\) 倍。',
        example: {
          q: '半徑 6、圓心角 \\(60^\\circ\\) 的扇形面積（用 \\(\\pi\\)）。',
          steps: ['\\(A=\\pi\\times6^2\\times\\dfrac{60}{360}=6\\pi\\)。'],
          ans: '\\(6\\pi\\)'
        }
      },

      /* ---------- 2-2 圓心角、圓周角與弧的關係 ---------- */
      {
        sec: '2-2', secName: '圓心角與弧',
        title: '圓心角的度數 = 所對弧的度數',
        points: [
          '頂點在<b>圓心</b>的角叫<span class="k">圓心角</span>。',
          '圓心角的度數，<b>等於</b>它所對的<b>弧</b>的度數。',
          '整個圓 \\(360^\\circ\\)，半圓的弧是 \\(180^\\circ\\)。拖滑桿看角與弧一起變。'
        ],
        formula: { label: '圓心角＝弧', tex: '\\angle AOB=\\overparen{AB}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="co"></div>
            <div class="ictrl"><label>圓心角 <span class="ival" id="cv">120</span>°</label><input type="range" id="cs" min="30" max="300" step="5" value="120"></div></div>`;
          const O = [210, 160], r = 115;
          const draw = () => {
            const t = +h.querySelector('#cs').value; h.querySelector('#cv').textContent = t;
            const A = SV.pt(O[0], O[1], r, 60), B = SV.pt(O[0], O[1], r, 60 - t);
            let s = circle(O[0], O[1], r, '#334');
            s += arc(O[0], O[1], r, 60 - t, 60, C, 7);
            s += SV.seg(O[0], O[1], A[0], A[1], '#334', 2.6) + SV.seg(O[0], O[1], B[0], B[1], '#334', 2.6);
            s += SV.angle(O[0], O[1], 34, 60 - t, 60, RED, t + '°', { w: 3, fill: 1, fs: 14 });
            s += SV.dot(O[0], O[1], '#172033', 4) + SV.vlabel(O[0] - 18, O[1] + 6, 'O');
            s += SV.vlabel(A[0] + 6, A[1], 'A') + SV.vlabel(B[0] + 6, B[1] + 6, 'B');
            const lp = SV.pt(O[0], O[1], r + 22, 60 - t / 2);
            s += `<text x="${lp[0]}" y="${lp[1]}" text-anchor="middle" font-size="13" font-weight="800" fill="${C}">弧 ${t}°</text>`;
            h.querySelector('#co').innerHTML = svg('0 0 430 320', s);
          };
          h.querySelector('#cs').oninput = draw; draw();
        },
        caption: '圓心角多少度，它撐開的弧就是多少度，兩者永遠相等。',
        example: {
          q: '一段弧 \\(80^\\circ\\)，所對圓心角幾度？',
          steps: ['圓心角＝所對弧的度數。'],
          ans: '\\(80^\\circ\\)'
        }
      },

      {
        sec: '2-2', secName: '圓周角',
        title: '圓周角 = 同弧圓心角的一半',
        points: [
          '頂點在<b>圓上</b>、兩邊為弦的角，叫<span class="k">圓周角</span>。',
          '同一段弧所對的圓周角，是圓心角的<b>一半</b>：\\(\\angle APB=\\dfrac12\\angle AOB\\)。',
          '拖滑桿移動圓周上的頂點 \\(P\\)，圓周角<b>不變</b>。'
        ],
        formula: { label: '圓周角定理', tex: '\\angle APB=\\tfrac12\\,\\angle AOB' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="ins"></div>
            <div class="ictrl"><label>頂點 P 位置 <span class="ival" id="iv">100</span></label><input type="range" id="is" min="30" max="150" value="100"></div></div>`;
          const O = [210, 175], r = 120, aA = 210, aB = 330;
          const A = SV.pt(O[0], O[1], r, aA), B = SV.pt(O[0], O[1], r, aB);
          const draw = () => {
            const p = +h.querySelector('#is').value; h.querySelector('#iv').textContent = p;
            const P = SV.pt(O[0], O[1], r, p);
            let s = circle(O[0], O[1], r, '#334');
            s += arc(O[0], O[1], r, aA, aB, GRN, 6);
            s += SV.seg(O[0], O[1], A[0], A[1], '#9aa4b6', 2) + SV.seg(O[0], O[1], B[0], B[1], '#9aa4b6', 2);
            s += SV.angle(O[0], O[1], 30, aB - 360, aA - 360, RED, '120°', { w: 2.6, fill: 1, fs: 12 });
            s += SV.seg(P[0], P[1], A[0], A[1], BLU, 2.6) + SV.seg(P[0], P[1], B[0], B[1], BLU, 2.6);
            const dPA = SV.angleOf(P[0], P[1], A[0], A[1]), dPB = SV.angleOf(P[0], P[1], B[0], B[1]);
            s += SV.angle(P[0], P[1], 26, Math.min(dPA, dPB), Math.max(dPA, dPB), BLU, '60°', { w: 2.6, fs: 12 });
            s += SV.dot(O[0], O[1], '#172033', 4) + SV.vlabel(O[0] - 6, O[1] - 8, 'O');
            s += SV.dot(A[0], A[1], '#172033', 4) + SV.vlabel(A[0] - 16, A[1] + 8, 'A');
            s += SV.dot(B[0], B[1], '#172033', 4) + SV.vlabel(B[0] + 6, B[1] + 8, 'B');
            s += SV.dot(P[0], P[1], BLU, 5) + SV.vlabel(P[0] - 4, P[1] - 10, 'P');
            h.querySelector('#ins').innerHTML = svg('0 0 430 340', s);
          };
          h.querySelector('#is').oninput = draw; draw();
        },
        caption: '弧 AB 對的圓心角 120°，圓周角永遠是 60°——移動 P 也不變。',
        example: {
          q: '一段弧所對圓心角 \\(100^\\circ\\)，求所對圓周角。',
          steps: ['圓周角＝圓心角的一半 \\(=50^\\circ\\)。'],
          ans: '\\(50^\\circ\\)'
        }
      },

      {
        sec: '2-2', secName: '圓周角',
        title: '直徑所對的圓周角 = 90°',
        points: [
          '若一段弧是<b>半圓</b>（弦為<b>直徑</b>），所對圓心角 \\(=180^\\circ\\)。',
          '所以圓周角 \\(=\\dfrac{180^\\circ}{2}=90^\\circ\\)——<b>直徑所對圓周角必為直角</b>。',
          '拖滑桿移動 \\(P\\)，\\(\\angle APB\\) 永遠是直角。'
        ],
        formula: { label: '半圓的圓周角', tex: '\\overline{AB}\\ \\text{為直徑}\\Rightarrow\\angle APB=90^\\circ' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="dia"></div>
            <div class="ictrl"><label>頂點 P 位置 <span class="ival" id="dv">70</span></label><input type="range" id="ds" min="20" max="160" value="70"></div></div>`;
          const O = [210, 170], r = 120;
          const A = SV.pt(O[0], O[1], r, 180), B = SV.pt(O[0], O[1], r, 0);
          const draw = () => {
            const p = +h.querySelector('#ds').value; h.querySelector('#dv').textContent = p;
            const P = SV.pt(O[0], O[1], r, p);
            let s = circle(O[0], O[1], r, '#334');
            s += SV.seg(A[0], A[1], B[0], B[1], GRN, 3);
            s += SV.seg(P[0], P[1], A[0], A[1], BLU, 2.6) + SV.seg(P[0], P[1], B[0], B[1], BLU, 2.6);
            s += SV.rightAngle(P[0], P[1], SV.angleOf(P[0], P[1], A[0], A[1]), SV.angleOf(P[0], P[1], B[0], B[1]), 14, RED);
            s += SV.dot(O[0], O[1], '#172033', 4) + SV.vlabel(O[0] - 6, O[1] + 20, 'O');
            s += SV.dot(A[0], A[1], '#172033', 4) + SV.vlabel(A[0] - 18, A[1] + 6, 'A');
            s += SV.dot(B[0], B[1], '#172033', 4) + SV.vlabel(B[0] + 8, B[1] + 6, 'B');
            s += SV.dot(P[0], P[1], BLU, 5) + SV.vlabel(P[0] - 4, P[1] - 10, 'P');
            s += `<text x="210" y="315" text-anchor="middle" font-size="14" font-weight="800" fill="${RED}">∠APB = 90°（直徑所對）</text>`;
            h.querySelector('#dia').innerHTML = svg('0 0 430 330', s);
          };
          h.querySelector('#ds').oninput = draw; draw();
        },
        caption: '只要 AB 是直徑，圓上任一點看 AB 都是直角——超常考。',
        example: {
          q: '\\(\\overline{AB}\\) 是直徑，\\(P\\) 在圓上，\\(\\angle PAB=35^\\circ\\)，求 \\(\\angle PBA\\)。',
          steps: ['\\(\\angle APB=90^\\circ\\)。', '\\(\\angle PBA=180^\\circ-90^\\circ-35^\\circ=55^\\circ\\)。'],
          ans: '\\(55^\\circ\\)'
        }
      },

      {
        sec: '2-2', secName: '圓內接四邊形',
        title: '圓內接四邊形：對角互補',
        points: [
          '四頂點都在同一圓上的四邊形，叫<span class="k">圓內接四邊形</span>。',
          '它的<b>對角互補</b>：\\(\\angle A+\\angle C=\\angle B+\\angle D=180^\\circ\\)。',
          '理由：兩對角分別對到合成整圓的兩段弧，圓周角相加＝\\(\\dfrac{360^\\circ}{2}\\)。'
        ],
        formula: { label: '對角互補', tex: '\\angle A+\\angle C=180^\\circ' },
        visual: (h) => {
          const O = [210, 155], r = 115;
          const A = SV.pt(O[0], O[1], r, 130), B = SV.pt(O[0], O[1], r, 40), Cc = SV.pt(O[0], O[1], r, -50), D = SV.pt(O[0], O[1], r, 215);
          let s = circle(O[0], O[1], r, '#ccd3df');
          s += SV.poly([A, B, Cc, D], 'rgba(124,58,237,0.07)', C, 2.6);
          s += SV.dot(A[0], A[1], '#172033', 3.5) + SV.vlabel(A[0] - 16, A[1] - 4, 'A', RED);
          s += SV.dot(B[0], B[1], '#172033', 3.5) + SV.vlabel(B[0] + 6, B[1] - 4, 'B', BLU);
          s += SV.dot(Cc[0], Cc[1], '#172033', 3.5) + SV.vlabel(Cc[0] + 6, Cc[1] + 12, 'C', RED);
          s += SV.dot(D[0], D[1], '#172033', 3.5) + SV.vlabel(D[0] - 16, D[1] + 12, 'D', BLU);
          s += `<text x="210" y="300" text-anchor="middle" font-size="14" font-weight="800" fill="#172033">∠A + ∠C = 180°，∠B + ∠D = 180°</text>`;
          h.innerHTML = svg('0 0 430 315', s);
        },
        caption: '對角（同色）互補：知道一個角，馬上算出對角。',
        example: {
          q: '圓內接四邊形 \\(ABCD\\) 中 \\(\\angle A=95^\\circ\\)，求 \\(\\angle C\\)。',
          steps: ['對角互補：\\(\\angle C=180^\\circ-95^\\circ=85^\\circ\\)。'],
          ans: '\\(85^\\circ\\)'
        }
      }
    ]
  });
})();
