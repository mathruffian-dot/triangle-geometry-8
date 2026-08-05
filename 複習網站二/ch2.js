/* ============ 第 2 章　直角坐標與二元一次方程式的圖形 ============
   依康軒版第 2 冊（七下）課程計畫：2-1 直角坐標平面、2-2 二元一次方程式的圖形
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#7c3aed';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  // 標準 SVG 包裝
  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }

  // 直線 ax+by=c 與矩形視窗的兩個交點（回傳數學座標）
  function clipLine(a, b, c, xmin, xmax, ymin, ymax) {
    const eps = 1e-9, cand = [];
    if (Math.abs(b) > eps) [xmin, xmax].forEach(x => { const y = (c - a * x) / b; if (y >= ymin - eps && y <= ymax + eps) cand.push([x, y]); });
    if (Math.abs(a) > eps) [ymin, ymax].forEach(y => { const x = (c - b * y) / a; if (x >= xmin - eps && x <= xmax + eps) cand.push([x, y]); });
    const out = [];
    cand.forEach(p => { if (!out.some(q => Math.abs(q[0] - p[0]) < 1e-6 && Math.abs(q[1] - p[1]) < 1e-6)) out.push(p); });
    return out.slice(0, 2);
  }
  // 在坐標平面 P（範圍 R）上畫直線 ax+by=c
  function lineOn(P, R, a, b, c, color, w, dash) {
    const e = clipLine(a, b, c, R.xmin, R.xmax, R.ymin, R.ymax);
    if (e.length < 2) return '';
    return SV.seg(P.X(e[0][0]), P.Y(e[0][1]), P.X(e[1][0]), P.Y(e[1][1]), color, w || 3, dash || '');
  }
  // 描點（數學座標）＋標籤
  function mark(P, p, color, label, dx, dy, fs) {
    let s = SV.dot(P.X(p[0]), P.Y(p[1]), color, 5);
    if (label) s += SV.vlabel(P.X(p[0]) + (dx === undefined ? 9 : dx), P.Y(p[1]) + (dy === undefined ? -9 : dy), label, color, fs || 13);
    return s;
  }
  const txt = (x, y, t, color, fs, anchor) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor || 'middle'}" font-size="${fs || 13}" font-weight="800" fill="${color || '#172033'}">${t}</text>`;
  const lerp2 = (P, Q, t) => [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t];

  window.DECK.push({
    ch: 2,
    title: '直角坐標與二元一次方程式的圖形',
    color: C,
    sections: ["2-1 直角坐標平面", "2-2 二元一次方程式的圖形"],
    slides: [

      /* ---------- 2-1 直角坐標平面 ---------- */
      {
        sec: '2-1', secName: '直角坐標平面',
        title: '平面上定位置，要用一組「有序數對」',
        points: [
          '數線上一個點只要<b>一個數</b>；平面上要<b>兩個數</b>才鎖得住位置。',
          '兩軸垂直：橫的 <span class="k">x 軸</span>（又叫<b>橫軸</b>）、直的 <span class="k">y 軸</span>（又叫<b>縱軸</b>），交點 \\(O(0,0)\\)。',
          '記法 \\((a,b)\\)：<b>先橫走 \\(a\\)、再直走 \\(b\\)</b>；順序一換就是<b>另一個點</b>。'
        ],
        formula: { label: '有序數對', tex: 'P(a,b)\\;:\\;a=x\\text{ 坐標（橫）},\\quad b=y\\text{ 坐標（縱）}' },
        visual: (h) => {
          const R = { xmin: -1, xmax: 7, ymin: -1, ymax: 7 };
          const P = SV.plane({ x0: 76, y0: 26, w: 250, h: 250, xmin: R.xmin, xmax: R.xmax, ymin: R.ymin, ymax: R.ymax });
          let g = P.defs + P.svg;
          const ox = P.X(0), oy = P.Y(0);
          // 課綱 G-7-1 術語：兩軸的別名「橫軸／縱軸」直接標在軸上
          g += txt(P.X(7) + 8, oy - 6, 'x 軸（橫軸）', C, 13, 'start');
          g += txt(ox, 18, 'y 軸（縱軸）', C, 13);
          // A(3,5) 的走法：先橫走 3、再上走 5
          g += SV.seg(ox, oy, P.X(3), oy, AMB, 4);
          g += SV.seg(P.X(3), oy, P.X(3), P.Y(5), RED, 3.2, '6 4');
          g += txt((ox + P.X(3)) / 2, oy - 8, '橫走 3', AMB, 12);
          g += txt(P.X(3) + 8, (oy + P.Y(5)) / 2, '上走 5', RED, 12, 'start');
          g += mark(P, [3, 5], RED, 'A(3,5)', 9, -9, 14);
          g += mark(P, [5, 3], BLU, 'B(5,3)', 9, -9, 14);
          g += txt(220, 294, '順序換了就是另一個點：(3,5) ≠ (5,3)', C, 13);
          h.innerHTML = svg('0 0 440 300', g);
        },
        caption: '先沿 \\(x\\) 軸橫走，再往上（下）直走，就描出 \\((a,b)\\)。',
        example: {
          q: '點 \\(P\\) 在原點右方 4 單位、上方 2 單位，寫出 \\(P\\) 的坐標；\\((2,4)\\) 又在哪裡？',
          steps: ['先橫走 4、再上走 2，所以 \\(P(4,2)\\)。', '\\((2,4)\\) 是橫走 2、上走 4，是<b>另一個</b>點。'],
          ans: '\\(P(4,2)\\)，與 \\((2,4)\\) 不同'
        }
      },

      {
        sec: '2-1', secName: '直角坐標平面',
        title: '從方位到坐標：說「東 3 北 2」也能定位',
        points: [
          '生活中常用<b>方位＋距離</b>報位置：「往東 3 公尺、往北 2 公尺」。',
          '把<b>東西</b>當橫向、<b>南北</b>當縱向，就寫成坐標 \\((3,2)\\)。',
          '向<b>西</b>、向<b>南</b>是<b>負</b>方向：西 2 北 1 就是 \\((-2,1)\\)。'
        ],
        formula: { label: '方位換坐標', tex: '\\text{東}\\to+x,\\quad\\text{西}\\to-x,\\quad\\text{北}\\to+y,\\quad\\text{南}\\to-y' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="mfig"></div>
            <div class="ictrl"><label>地標 <span class="ival" id="mv">圖書館 (3, 2)</span></label>
            <input type="range" id="ms" min="0" max="4" step="1" value="0"></div></div>`;
          const R = { xmin: -5, xmax: 5, ymin: -4, ymax: 4 };
          const P = SV.plane({ x0: 116, y0: 12, w: 260, h: 208, xmin: R.xmin, xmax: R.xmax, ymin: R.ymin, ymax: R.ymax });
          const SPOT = [
            { n: '圖書館', ew: '東 3', ns: '北 2', p: [3, 2] },
            { n: '體育館', ew: '西 2', ns: '北 1', p: [-2, 1] },
            { n: '司令台', ew: '東 4', ns: '不南不北', p: [4, 0] },
            { n: '停車場', ew: '西 3', ns: '南 2', p: [-3, -2] },
            { n: '操場', ew: '東 2', ns: '南 3', p: [2, -3] }
          ];
          // 左上角八方位羅盤（只算一次，之後每次重繪直接沿用）
          const cx = 58, cy = 62, r = 36;
          let rose = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${C}" stroke-width="1.6"/>`;
          rose += `<polygon points="${cx},${cy - r + 3} ${cx - 7},${cy} ${cx + 7},${cy}" fill="${RED}"/>`;
          rose += `<polygon points="${cx},${cy + r - 3} ${cx - 7},${cy} ${cx + 7},${cy}" fill="#c3ccdb"/>`;
          rose += `<polygon points="${cx + r - 3},${cy} ${cx},${cy - 7} ${cx},${cy + 7}" fill="${BLU}"/>`;
          rose += `<polygon points="${cx - r + 3},${cy} ${cx},${cy - 7} ${cx},${cy + 7}" fill="#c3ccdb"/>`;
          [[45, '東北'], [135, '西北'], [225, '西南'], [315, '東南']].forEach(([d, t]) => {
            const q = SV.pt(cx, cy, r + 12, d);
            rose += txt(q[0], q[1] + 4, t, '#9aa4b6', 9);
          });
          rose += txt(cx, cy - r - 8, '北', RED, 12) + txt(cx, cy + r + 16, '南', '#657187', 12);
          rose += txt(cx + r + 13, cy + 4, '東', BLU, 12) + txt(cx - r - 13, cy + 4, '西', '#657187', 12);
          rose += txt(cx, 150, '東 → x 正向', BLU, 11) + txt(cx, 168, '北 → y 正向', RED, 11);
          rose += txt(cx, 190, '西、南 → 負向', '#9aa4b6', 11);
          const draw = () => {
            const i = Math.max(0, Math.min(SPOT.length - 1, Math.round(+h.querySelector('#ms').value)));
            const it = SPOT[i], a = it.p[0], b = it.p[1];
            h.querySelector('#mv').textContent = `${it.n} (${a}, ${b})`;
            let g = P.defs + P.svg + rose;
            // 原點就是校門口
            g += SV.dot(P.X(0), P.Y(0), '#5b6478', 5);
            // 往左下讓開，避開 y 軸刻度「−1」與 x 軸刻度數字
            g += txt(P.X(0) - 26, P.Y(0) + 34, '校門口', '#5b6478', 11.5, 'end');
            // 先走東西（橫向），再走南北（縱向）
            if (a !== 0) {
              g += SV.seg(P.X(0), P.Y(0), P.X(a), P.Y(0), BLU, 4);
              g += txt((P.X(0) + P.X(a)) / 2, P.Y(0) - 8, it.ew, BLU, 11.5);
            }
            if (b !== 0) {
              g += SV.seg(P.X(a), P.Y(0), P.X(a), P.Y(b), RED, 3.2, '6 4');
              // 比中點再往下 6px，才不會壓到 x 軸的刻度數字
              g += txt(P.X(a) + (a >= 0 ? 7 : -7), (P.Y(0) + P.Y(b)) / 2 + 6, it.ns, RED, 11.5, a >= 0 ? 'start' : 'end');
            }
            g += mark(P, it.p, VIO, it.n, 9, b < 0 ? 18 : -10, 13);
            g += txt(220, 246, `${it.n}：從校門口往 ${it.ew}、${it.ns}`, C, 14);
            g += txt(220, 270, `${it.ew} → x ＝ ${a}　　${it.ns} → y ＝ ${b}　　坐標 (${a}, ${b})`, '#172033', 13);
            h.querySelector('#mfig').innerHTML = svg('0 0 440 285', g);
          };
          h.querySelector('#ms').oninput = draw; draw();
        },
        caption: '把校門口當<b>原點</b>：東西看 \\(x\\)、南北看 \\(y\\)，方位描述立刻變成坐標。',
        example: {
          q: '福利社在校門口<b>東 4 公尺、南 3 公尺</b>，坐標是多少？',
          steps: ['「東 4」是橫向的正方向 → 橫坐標 \\(4\\)。', '「南 3」是縱向的負方向 → 縱坐標 \\(-3\\)。', '合起來寫成 \\((4,-3)\\)。'],
          ans: '\\((4,-3)\\)'
        }
      },

      {
        sec: '2-1', secName: '直角坐標平面',
        title: '四象限只看正負號，逆時針數 I、II、III、IV',
        points: [
          '兩軸把平面切成四塊，從<b>右上角</b>開始<b>逆時針</b>編號 I、II、III、IV。',
          '<b>只看正負號</b>：\\((+,+)\\)→I、\\((-,+)\\)→II、\\((-,-)\\)→III、\\((+,-)\\)→IV。',
          '<b>坐標軸上的點不屬於任何象限</b>：\\(x\\) 軸上 \\(y=0\\)、\\(y\\) 軸上 \\(x=0\\)，原點兩個都是 0。'
        ],
        formula: { label: '象限符號', tex: '\\text{I}(+,+)\\quad\\text{II}(-,+)\\quad\\text{III}(-,-)\\quad\\text{IV}(+,-)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="qfig"></div>
            <div id="qinfo" style="text-align:center;font-size:14px;font-weight:900;color:#172033;margin-top:6px"></div>
            <div class="ictrl"><label>拖看不同的點 <span class="ival" id="qv">(3, 2)</span></label>
            <input type="range" id="qs" min="0" max="7" step="1" value="0"></div></div>`;
          const R = { xmin: -5, xmax: 5, ymin: -5, ymax: 5 };
          const P = SV.plane({ x0: 52, y0: 8, w: 230, h: 230, xmin: R.xmin, xmax: R.xmax, ymin: R.ymin, ymax: R.ymax });
          const LIST = [
            { p: [3, 2], q: '第一象限', c: BLU },
            { p: [0, 3], q: '在 y 軸上 → 不屬於任何象限', c: RED },
            { p: [-4, 2], q: '第二象限', c: GRN },
            { p: [-3, 0], q: '在 x 軸上 → 不屬於任何象限', c: RED },
            { p: [-2, -3], q: '第三象限', c: AMB },
            { p: [0, -2], q: '在 y 軸上 → 不屬於任何象限', c: RED },
            { p: [4, -3], q: '第四象限', c: VIO },
            { p: [0, 0], q: '原點 O → 不屬於任何象限', c: RED }
          ];
          const draw = () => {
            const i = Math.max(0, Math.min(LIST.length - 1, Math.round(+h.querySelector('#qs').value)));
            const it = LIST[i];
            h.querySelector('#qv').textContent = `(${it.p[0]}, ${it.p[1]})`;
            let g = P.defs + P.svg;
            const x0 = P.X(-5), xm = P.X(0), x1 = P.X(5);
            const y0 = P.Y(5), ym = P.Y(0), y1 = P.Y(-5);
            const cell = (x, y, w, hh, col) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="${col}" opacity="0.08"/>`;
            g += cell(xm, y0, x1 - xm, ym - y0, BLU) + cell(x0, y0, xm - x0, ym - y0, GRN);
            g += cell(x0, ym, xm - x0, y1 - ym, AMB) + cell(xm, ym, x1 - xm, y1 - ym, VIO);
            // 象限編號放在四個「外角」，避免與示範點的標籤打架
            g += txt(x1 - 24, y0 + 22, 'I', BLU, 16) + txt(x0 + 24, y0 + 22, 'II', GRN, 16);
            g += txt(x0 + 24, y1 - 12, 'III', AMB, 16) + txt(x1 - 24, y1 - 12, 'IV', VIO, 16);
            g += mark(P, it.p, RED, `(${it.p[0]}, ${it.p[1]})`, it.p[0] < 0 ? -58 : 8, -10, 13);
            h.querySelector('#qfig').innerHTML = svg('0 0 320 250', g);
            h.querySelector('#qinfo').innerHTML = `<span style="color:${it.c}">${it.q}</span>`;
          };
          h.querySelector('#qs').oninput = draw; draw();
        },
        caption: '拖滑桿換點：只要有一個坐標是 0，這個點就<b>落在軸上</b>，不算任何象限。',
        example: {
          q: '\\((-3,5)\\) 與 \\((-3,-5)\\) 各在第幾象限？',
          steps: ['\\((-3,5)\\)：橫負、縱正 → 第二象限。', '\\((-3,-5)\\)：兩個都負 → 第三象限。'],
          ans: '第二象限、第三象限'
        }
      },

      {
        sec: '2-1', secName: '直角坐標平面',
        title: '到 x 軸看縱坐標，到 y 軸看橫坐標',
        points: [
          '\\((a,b)\\) 到 <b>\\(x\\) 軸</b>距離 \\(|b|\\)、到 <b>\\(y\\) 軸</b>距離 \\(|a|\\)——<b>剛好交換</b>。',
          '距離是長度，一定<b>不為負</b>，所以要加絕對值。',
          '<b>同一水平線</b>上兩點距離 \\(=|x_1-x_2|\\)；<b>同一鉛直線</b>上則是 \\(=|y_1-y_2|\\)。'
        ],
        formula: { label: '到兩軸的距離', tex: 'd(P,\\;x\\text{ 軸})=|b|,\\qquad d(P,\\;y\\text{ 軸})=|a|' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="dfig"></div>
            <div class="ictrl"><label>點 P <span class="ival" id="dv">(3, 2)</span></label>
            <input type="range" id="ds" min="0" max="7" step="1" value="0"></div></div>`;
          const R = { xmin: -5, xmax: 6, ymin: -6, ymax: 5 };
          const P = SV.plane({ x0: 52, y0: 8, w: 242, h: 242, xmin: R.xmin, xmax: R.xmax, ymin: R.ymin, ymax: R.ymax });
          // 四個象限各走兩點，都避開坐標軸，兩段虛線才畫得出長度
          const PTS = [[3, 2], [5, 4], [-2, 4], [-4, 3], [-3, -2], [-4, -5], [2, -5], [4, -3]];
          const draw = () => {
            const i = Math.max(0, Math.min(PTS.length - 1, Math.round(+h.querySelector('#ds').value)));
            const a = PTS[i][0], b = PTS[i][1];
            h.querySelector('#dv').textContent = `(${a}, ${b})`;
            let g = P.defs + P.svg;
            const px = P.X(a), py = P.Y(b);
            g += SV.seg(px, py, px, P.Y(0), GRN, 2.6, '6 4');
            g += SV.seg(px, py, P.X(0), py, AMB, 2.6, '6 4');
            // 兩個距離標籤都往「遠離 y 軸」的一側讓開，才不會壓到刻度數字
            g += txt(px + (a > 0 ? 8 : -8), (py + P.Y(0)) / 2 + 8, `|${b}| = ${Math.abs(b)}`, GRN, 12, a > 0 ? 'start' : 'end');
            g += txt(px + (a > 0 ? -8 : 8), py + (a > 0 ? -8 : 15), `|${a}| = ${Math.abs(a)}`, AMB, 12, a > 0 ? 'end' : 'start');
            // 坐標已顯示在滑桿旁的讀數，圖上只標一個 P，左側才擠得下三個標籤
            g += mark(P, [a, b], RED, 'P', a < 0 ? -22 : 10, b < 0 ? 18 : -10, 15);
            g += txt(176, 274, '綠＝到 x 軸的距離 |b|　　橘＝到 y 軸的距離 |a|', '#657187', 12);
            h.querySelector('#dfig').innerHTML = svg('0 0 352 285', g);
          };
          h.querySelector('#ds').oninput = draw; draw();
        },
        caption: '往<b>下（上）</b>走到 \\(x\\) 軸用掉的是 \\(|b|\\)，往<b>左（右）</b>走到 \\(y\\) 軸用掉的是 \\(|a|\\)。',
        example: {
          q: '\\(A(-2,4)\\)、\\(B(5,4)\\)，求 \\(\\overline{AB}\\)，以及 \\(A\\) 到 \\(x\\) 軸的距離。',
          steps: ['兩點 \\(y\\) 都是 4，在同一水平線上：\\(\\overline{AB}=|-2-5|=7\\)。', '\\(A\\) 到 \\(x\\) 軸的距離看縱坐標：\\(|4|=4\\)。'],
          ans: '\\(\\overline{AB}=7\\)；距離 4'
        }
      },

      {
        sec: '2-1', secName: '直角坐標平面',
        title: '2-1 最常錯的四件事',
        points: [
          '✗ 把 \\((3,-2)\\) 讀成「左 3 下 2」　✓ <b>第一個數只管左右</b>、<b>第二個數只管上下</b>。',
          '✗ 說 \\((0,-4)\\) 在第四象限　✓ 它在 <b>\\(y\\) 軸上</b>，軸上的點<b>不屬於任何象限</b>。',
          '✗ 到 \\(x\\) 軸的距離寫成 \\(|a|\\)　✓ 到 \\(x\\) 軸看<b>縱</b>坐標 \\(|b|\\)，兩者<b>相反</b>。',
          '✗ 距離算出負數就交卷　✓ 距離必 \\(\\ge 0\\)，記得<b>加絕對值</b>。'
        ],
        formula: { label: '一句話記', tex: '\\text{先橫後縱；軸上不算象限；到 }x\\text{ 軸看 }|b|' },
        visual: (h) => {
          const th = (t) => `<th style="border:1px solid #d9dfe9;padding:7px 8px;font-size:12px">${t}</th>`;
          const row = (topic, bad, good, bg) => `<tr style="background:${bg}">
            <td style="border:1px solid #d9dfe9;padding:7px 8px;font-weight:900;color:${C};white-space:nowrap">${topic}</td>
            <td style="border:1px solid #d9dfe9;padding:7px 8px;color:${RED}">✗ ${bad}</td>
            <td style="border:1px solid #d9dfe9;padding:7px 8px;color:${GRN}">✓ ${good}</td></tr>`;
          h.innerHTML = `<div style="width:98%;margin:0 auto">
            <table style="width:100%;border-collapse:collapse;font-size:12.5px;line-height:1.5;text-align:left">
              <tr style="background:#f3eeff">${th('項目')}${th('常見錯誤')}${th('正確做法')}</tr>
              ${row('讀點順序', '(3, −2) 讀成「左 3 下 2」', '第一個數管左右、第二個管上下', '#fff')}
              ${row('象限', '(0, −4) 說成第四象限', 'x＝0 → 在 y 軸上，不算象限', '#fbfaff')}
              ${row('到軸距離', '到 x 軸的距離寫成 |a|', '到 x 軸看縱坐標，是 |b|', '#fff')}
              ${row('距離正負', '直接寫 −7 當距離', '距離是長度，要加絕對值', '#fbfaff')}
            </table>
            <div style="margin-top:10px;font-size:12.5px;color:#657187;text-align:center">
              考前自我檢查：<b>「先橫後縱、軸上不算、到 x 軸看 y」</b>三句唸過一次。</div>
          </div>`;
        },
        caption: '這四個錯誤幾乎每次段考都出現，考前唸一次口訣就能避開。',
        example: {
          q: '判斷：「\\(P(0,-4)\\) 在第四象限，且到 \\(y\\) 軸的距離是 4」，對嗎？',
          steps: ['\\(x=0\\)，點在 \\(y\\) 軸上，不屬於任何象限。', '到 \\(y\\) 軸的距離看橫坐標 \\(|0|=0\\)。'],
          ans: '兩句都錯'
        }
      },

      /* ---------- 2-2 二元一次方程式的圖形 ---------- */
      {
        sec: '2-2', secName: '二元一次方程式的圖形',
        title: '把所有的解描出來，剛好排成一條直線',
        points: [
          '\\(ax+by=c\\)（\\(a,b\\) 不同時為 0）有<b>無限多組</b>解，每一組解就是<b>一個點</b>。',
          '把這些點全部描出來會<b>連成一條直線</b>，這條線就叫它的<span class="k">圖形</span>。',
          '作法：<b>算兩組解 → 描兩點 → 連線並向兩端延長</b>（兩點決定一直線）。'
        ],
        formula: { label: '解與圖形', tex: 'ax+by=c\\;\\longrightarrow\\;\\text{一條直線}' },
        visual: (h) => {
          const R = { xmin: -1, xmax: 7, ymin: -1, ymax: 7 };
          const P = SV.plane({ x0: 48, y0: 10, w: 248, h: 248, xmin: R.xmin, xmax: R.xmax, ymin: R.ymin, ymax: R.ymax });
          const A = [0, 5], B = [5, 0], L = [-1, 6], Rt = [6, -1];
          const steps = [
            {
              t: '方程式 x＋y＝5 有無限多組解，每一組解就是平面上的一個點。',
              d: () => P.defs + P.svg + txt(250, 32, 'x ＋ y ＝ 5', C, 15)
            },
            {
              t: '令 x＝0 得 y＝5、令 y＝0 得 x＝5，描出 (0,5) 與 (5,0)。',
              d: () => mark(P, A, RED, '(0,5)', 10, -8, 13) + mark(P, B, RED, '(5,0)', 6, 32, 13)
            },
            {
              t: '兩點連線，再向兩端延長 —— 這條直線就是它的圖形。',
              d: (k) => {
                const s = lerp2(A, L, k), e = lerp2(B, Rt, k);
                return SV.seg(P.X(s[0]), P.Y(s[1]), P.X(e[0]), P.Y(e[1]), BLU, 3.2);
              }
            },
            {
              t: '線上任何一點都是解：檢查 (2,3)，2＋3＝5 成立。',
              d: () => mark(P, [2, 3], GRN, '(2,3)', 10, -8, 13) + txt(165, 284, '2 ＋ 3 ＝ 5 ✓　在線上就是解', GRN, 13)
            }
          ];
          SV.stepper(h, '0 0 330 292', steps);
        },
        caption: '拖步驟滑桿：解 → 點 → 線。<b>線上的點</b>與<b>方程式的解</b>是同一回事。',
        example: {
          q: '在 \\(2x+y=8\\) 中，若 \\(x=3\\)，求對應的 \\(y\\)，並說出它代表哪個點。',
          steps: ['代入：\\(2\\times3+y=8\\)，得 \\(y=2\\)。', '這組解對應圖形上的點 \\((3,2)\\)。'],
          ans: '\\(y=2\\)，點 \\((3,2)\\)'
        }
      },

      {
        sec: '2-2', secName: '二元一次方程式的圖形',
        title: '某點在不在線上？把坐標代進去算算看',
        points: [
          '<b>線上的點</b>就是<b>方程式的解</b>，所以判斷方法只有一個：<b>代入</b>。',
          '把 \\(x\\)、\\(y\\) 代進左式，算出來<b>等於右邊的數</b>就在線上。',
          '左右<b>不相等</b>就不在線上——差 1 也不算，不能用「看起來很近」判斷。'
        ],
        formula: { label: '代入檢驗', tex: '(x_0,y_0)\\text{ 在 }ax+by=c\\text{ 上}\\;\\Longleftrightarrow\\;ax_0+by_0=c' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="tfig"></div>
            <div class="ictrl"><label>候選點 <span class="ival" id="tv">(0, 6)</span></label>
            <input type="range" id="ts" min="0" max="6" step="1" value="0"></div></div>`;
          const R = { xmin: -1, xmax: 7, ymin: -1, ymax: 7 };
          const P = SV.plane({ x0: 56, y0: 12, w: 224, h: 224, xmin: R.xmin, xmax: R.xmax, ymin: R.ymin, ymax: R.ymax });
          // 在線上與不在線上刻意交錯，逼學生每次都真的代進去算
          const CAND = [[0, 6], [1, 3], [1, 4], [2, 3], [2, 2], [3, 1], [3, 0]];
          const draw = () => {
            const i = Math.max(0, Math.min(CAND.length - 1, Math.round(+h.querySelector('#ts').value)));
            const a = CAND[i][0], b = CAND[i][1], v = 2 * a + b, ok = (v === 6);
            h.querySelector('#tv').textContent = `(${a}, ${b})`;
            let g = P.defs + P.svg;
            g += lineOn(P, R, 2, 1, 6, BLU, 3.2);
            // 其他候選點畫成灰色小點，看得出這幾個點的相對位置
            CAND.forEach((q, j) => { if (j !== i) g += SV.dot(P.X(q[0]), P.Y(q[1]), '#c3ccdb', 3.4); });
            // 點落在 y 軸上時，標籤改放右下角，避開軸名「y」
            g += mark(P, [a, b], ok ? GRN : RED, `(${a}, ${b})`, 10, a === 0 ? 18 : -10, 13);
            g += txt(348, 40, '2x ＋ y ＝ 6', BLU, 15);
            g += txt(348, 66, '藍線上的點', '#657187', 12);
            g += txt(348, 84, '＝方程式的解', '#657187', 12);
            g += txt(220, 256, `代入：2 × ${a} ＋ ${b} ＝ ${v}`, '#172033', 14);
            g += txt(220, 280, ok ? '＝ 6 ✓ 在線上' : '≠ 6 ✗ 不在線上', ok ? GRN : RED, 15);
            h.querySelector('#tfig').innerHTML = svg('0 0 440 288', g);
          };
          h.querySelector('#ts').oninput = draw; draw();
        },
        caption: '拖滑桿換點：算出來<b>剛好是 6</b> 才在線上；\\((2,3)\\) 看起來很近，代進去卻是 7。',
        example: {
          q: '點 \\((4,-2)\\) 在 \\(2x+y=6\\) 的圖形上嗎？',
          steps: ['代入左式：\\(2\\times4+(-2)=8-2=6\\)。', '左式 \\(=6=\\) 右式，等式成立。'],
          ans: '在線上'
        }
      },

      {
        sec: '2-2', secName: '二元一次方程式的圖形',
        title: '畫線最快：令 x＝0、令 y＝0 抓兩個交點',
        points: [
          '取點<b>越好算越好</b>：令 \\(x=0\\) 得<b>與 \\(y\\) 軸的交點</b>；令 \\(y=0\\) 得<b>與 \\(x\\) 軸的交點</b>。',
          '這兩點通常是整數，描起來最準，連線再向兩端延長就完成。',
          '若算出來不是整數、或兩點<b>重合在原點</b>（\\(c=0\\) 時），就換一個好算的 \\(x\\) 值重取一點。'
        ],
        formula: { label: '兩個好用的點', tex: 'x=0\\Rightarrow\\left(0,\\tfrac{c}{b}\\right)\\qquad y=0\\Rightarrow\\left(\\tfrac{c}{a},0\\right)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="cfig"></div>
            <div class="ictrl"><label>2x ＋ 3y ＝ c 的 c <span class="ival" id="cv">6</span></label>
            <input type="range" id="cs" min="-6" max="12" step="6" value="6"></div></div>`;
          const R = { xmin: -5, xmax: 7, ymin: -4, ymax: 6 };
          const P = SV.plane({ x0: 52, y0: 8, w: 264, h: 220, xmin: R.xmin, xmax: R.xmax, ymin: R.ymin, ymax: R.ymax });
          const draw = () => {
            const c = +h.querySelector('#cs').value;
            h.querySelector('#cv').textContent = c;
            let g = P.defs + P.svg;
            g += lineOn(P, R, 2, 3, c, BLU, 3.2);
            if (c === 0) {
              g += mark(P, [0, 0], RED, '(0,0) 兩點重合', 10, -10, 12);
              g += mark(P, [3, -2], GRN, '另取 (3,−2)', 10, 18, 12);
            } else {
              g += mark(P, [0, c / 3], RED, `(0, ${c / 3})`, 10, -10, 13);
              // 標籤壓在 x 軸刻度數字上會看不清楚，往下讓開一排；交點偏左或偏右時再改標到左側
              const xi = c / 2;
              g += mark(P, [xi, 0], RED, `(${xi}, 0)`, (xi < 0 || xi >= 5) ? -52 : 8, 34, 13);
            }
            g += txt(258, 250, `2x ＋ 3y ＝ ${c}`, C, 14);
            h.querySelector('#cfig').innerHTML = svg('0 0 350 258', g);
          };
          h.querySelector('#cs').oninput = draw; draw();
        },
        caption: '\\(c\\) 一變，兩個交點跟著變，但「令一個變數為 0」的取點法永遠好用。',
        example: {
          q: '畫 \\(3x-2y=6\\) 的圖形，先找出兩個交點。',
          steps: ['令 \\(x=0\\)：\\(-2y=6\\Rightarrow y=-3\\)，得 \\((0,-3)\\)。', '令 \\(y=0\\)：\\(3x=6\\Rightarrow x=2\\)，得 \\((2,0)\\)。', '兩點連線並向兩端延長。'],
          ans: '過 \\((0,-3)\\)、\\((2,0)\\) 的直線'
        }
      },

      {
        sec: '2-2', secName: '二元一次方程式的圖形',
        title: 'x＝c 是鉛直線，y＝c 是水平線',
        points: [
          '\\(y=c\\)：不管 \\(x\\) 是多少，\\(y\\) 都等於 \\(c\\) → 圖形是<b>水平線</b>，通過 \\((0,c)\\)。',
          '\\(x=c\\)：不管 \\(y\\) 是多少，\\(x\\) 都等於 \\(c\\) → 圖形是<b>鉛直線</b>，通過 \\((c,0)\\)。',
          '兩個特例背起來：<b>\\(y=0\\) 就是 \\(x\\) 軸</b>、<b>\\(x=0\\) 就是 \\(y\\) 軸</b>。'
        ],
        formula: { label: '別背反了', tex: 'x=c\\;\\Rightarrow\\;\\text{鉛直線};\\qquad y=c\\;\\Rightarrow\\;\\text{水平線}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="lfig"></div>
            <div class="ictrl"><label>常數 c <span class="ival" id="lv">3</span></label>
            <input type="range" id="ls" min="-4" max="4" step="1" value="3"></div></div>`;
          const R = { xmin: -5, xmax: 5, ymin: -5, ymax: 5 };
          const P = SV.plane({ x0: 52, y0: 8, w: 230, h: 230, xmin: R.xmin, xmax: R.xmax, ymin: R.ymin, ymax: R.ymax });
          const draw = () => {
            const c = +h.querySelector('#ls').value;
            h.querySelector('#lv').textContent = c;
            let g = P.defs + P.svg;
            g += SV.seg(P.X(c), P.Y(5), P.X(c), P.Y(-5), VIO, 3.4);
            g += SV.seg(P.X(-5), P.Y(c), P.X(5), P.Y(c), GRN, 3.4);
            // 兩個標籤各自貼著自己的線：x＝c 在頂端（依 c 正負換邊避開 y 軸刻度），y＝c 靠左端
            g += txt(P.X(c) + (c > 0 ? 26 : -46), 22, `x ＝ ${c}`, VIO, 13);
            g += txt(72, P.Y(c) + (c < 0 ? 18 : -9), `y ＝ ${c}`, GRN, 13, 'start');
            g += mark(P, [c, 0], VIO, '', 0, 0) + mark(P, [0, c], GRN, '', 0, 0);
            g += (c === 0
              ? txt(160, 262, 'c ＝ 0：x ＝ 0 就是 y 軸、y ＝ 0 就是 x 軸', RED, 12.5)
              : txt(160, 262, '紫線：x 固定 → 鉛直　　綠線：y 固定 → 水平', '#657187', 12.5));
            h.querySelector('#lfig').innerHTML = svg('0 0 320 272', g);
          };
          h.querySelector('#ls').oninput = draw; draw();
        },
        caption: '拖滑桿看：<b>被固定住的那個字母</b>決定線的方向，\\(x\\) 固定就鉛直、\\(y\\) 固定就水平。',
        example: {
          q: '\\(y=-3\\) 的圖形是什麼？點 \\((7,-3)\\) 在上面嗎？',
          steps: ['所有縱坐標為 \\(-3\\) 的點連成一條水平線，在 \\(x\\) 軸下方 3 單位。', '\\((7,-3)\\) 的縱坐標正好是 \\(-3\\)，符合。'],
          ans: '水平線；\\((7,-3)\\) 在線上'
        }
      },

      {
        sec: '2-2', secName: '二元一次方程式的圖形',
        title: '兩直線的交點坐標，就是聯立方程式的解',
        points: [
          '一條直線上的點＝那個方程式的解；<b>交點</b>同時落在兩條線上，所以<b>兩個式子都滿足</b>。',
          '因此「<b>解聯立</b>」和「<b>求兩直線的交點</b>」是同一件事，只是換個說法。',
          '從圖上讀出交點後，一定要<b>代回兩式驗算</b>——圖只能看個大概，代進去才算數。'
        ],
        formula: { label: '幾何意義', tex: '\\text{兩圖形交於 }(3,2)\\;\\Longleftrightarrow\\;\\text{聯立的解 }x=3,\\;y=2' },
        visual: (h) => {
          const R = { xmin: -2, xmax: 7, ymin: -2, ymax: 7 };
          const P = SV.plane({ x0: 50, y0: 10, w: 252, h: 252, xmin: R.xmin, xmax: R.xmax, ymin: R.ymin, ymax: R.ymax });
          let g = P.defs + P.svg;
          g += lineOn(P, R, 1, 1, 5, BLU, 3.2);
          g += lineOn(P, R, 1, -1, 1, AMB, 3.2);
          g += SV.seg(P.X(3), P.Y(2), P.X(3), P.Y(0), RED, 2.2, '5 4');
          g += SV.seg(P.X(3), P.Y(2), P.X(0), P.Y(2), RED, 2.2, '5 4');
          g += mark(P, [3, 2], RED, '(3, 2)', 10, -10, 15);
          g += txt(152, 98, 'x ＋ y ＝ 5', BLU, 13);
          g += txt(246, 84, 'x − y ＝ 1', AMB, 13);
          g += txt(168, 288, '交點同時在兩條線上 → 兩式都成立', '#657187', 12.5);
          h.innerHTML = svg('0 0 335 296', g);
        },
        caption: '兩直線交於 \\((3,2)\\)，就是聯立 \\(x+y=5\\)、\\(x-y=1\\) 的解。',
        example: {
          q: '由圖讀出交點 \\((3,2)\\)，怎麼確認沒讀錯？',
          steps: ['代入 \\(x+y=5\\)：\\(3+2=5\\) 成立。', '代入 \\(x-y=1\\)：\\(3-2=1\\) 成立。', '兩式都對，交點正確。'],
          ans: '\\(x=3,\\;y=2\\)'
        }
      },

      {
        sec: '2-2', secName: '二元一次方程式的圖形',
        title: '兩方案哪個划算？看兩條直線誰比較低',
        points: [
          '把兩種收費方式各列成一個<b>二元一次方程式</b>，各畫出一條直線。',
          '<b>交點</b>就是<b>聯立的解</b>：在那個時數，兩家<b>剛好一樣貴</b>。',
          '交點<b>左邊</b>甲比較低、<b>右邊</b>乙比較低——看誰的線在下面就好。'
        ],
        formula: { label: '交點＝聯立解', tex: '2x-y=0\\;\\text{與}\\;x-y=-3\\;\\Longrightarrow\\;\\text{交於}\\;(3,6)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="pfig"></div>
            <div class="ictrl"><label>打球時數 <span class="ival" id="pv">0</span> 小時</label>
            <input type="range" id="ps" min="0" max="4" step="1" value="0"></div></div>`;
          const R = { xmin: -1, xmax: 7, ymin: -1, ymax: 9 };
          const P = SV.plane({ x0: 56, y0: 12, w: 232, h: 230, xmin: R.xmin, xmax: R.xmax, ymin: R.ymin, ymax: R.ymax });
          const draw = () => {
            const t = Math.max(0, Math.min(4, Math.round(+h.querySelector('#ps').value)));
            const ya = 2 * t, yb = t + 3;
            h.querySelector('#pv').textContent = t;
            let g = P.defs + P.svg;
            g += lineOn(P, R, 2, -1, 0, BLU, 3.2);   // 甲館：2x − y ＝ 0
            g += lineOn(P, R, 1, -1, -3, AMB, 3.2);  // 乙館：x − y ＝ −3
            g += mark(P, [3, 6], RED, '(3, 6)', -20, -14, 13);   // 標在交點正上方，避開兩條線的讀數
            g += SV.seg(P.X(t), P.Y(0), P.X(t), P.Y(Math.max(ya, yb)), '#9aa4b6', 2, '5 4');
            g += SV.dot(P.X(t), P.Y(ya), BLU, 5) + SV.dot(P.X(t), P.Y(yb), AMB, 5);
            g += txt(P.X(t) - 8, P.Y(ya) + 4, `${ya}`, BLU, 12, 'end');
            g += txt(P.X(t) + 8, P.Y(yb) + 4, `${yb}`, AMB, 12, 'start');
            g += txt(300, 44, '甲館 2x － y ＝ 0', BLU, 12.5, 'start');
            g += txt(300, 63, '（每小時 2）', '#657187', 11, 'start');
            g += txt(300, 96, '乙館 x － y ＝ −3', AMB, 12.5, 'start');
            g += txt(300, 115, '（入場 3、每小時 1）', '#657187', 11, 'start');
            g += txt(300, 152, 'x：時數', '#657187', 11, 'start');
            g += txt(300, 171, 'y：花費（百元）', '#657187', 11, 'start');
            g += txt(220, 258, `打 ${t} 小時：甲 ${ya} 百元、乙 ${yb} 百元`, '#172033', 13.5);
            g += txt(220, 278,
              ya < yb ? '甲館比較便宜' : (ya > yb ? '乙館比較便宜' : '兩館一樣貴 → 這就是交點'),
              ya === yb ? RED : (ya < yb ? BLU : AMB), 14);
            h.querySelector('#pfig').innerHTML = svg('0 0 440 286', g);
          };
          h.querySelector('#ps').oninput = draw; draw();
        },
        caption: '兩線交於 \\((3,6)\\)：打 3 小時都花 600 元；再久下去換乙館划算。',
        example: {
          q: '甲館每小時 200 元；乙館入場 300 元、每小時再 100 元。打 5 小時哪家便宜？',
          steps: ['甲館：\\(200\\times5=1000\\) 元。', '乙館：\\(300+100\\times5=800\\) 元。', '5 小時落在交點（3 小時）<b>右邊</b>，乙館較省。'],
          ans: '乙館，省 200 元'
        }
      },

      {
        sec: '2-2', secName: '二元一次方程式的圖形',
        title: '2-2 最容易掉分的四個地方',
        points: [
          '✗ 只算一組解就連線　✓ <b>至少要兩個點</b>才決定一條直線，第三點拿來檢查。',
          '✗ 把 \\(x=3\\) 畫成水平線　✓ \\(x\\) 被固定 → <b>鉛直線</b>；\\(y\\) 被固定才是水平線。',
          '✗ 令 \\(x=0\\) 卻寫成 \\((c,0)\\)　✓ 令 \\(x=0\\) 得到的是 \\(y\\) 軸上的點。',
          '✗ 交點用「看起來差不多」決定　✓ 讀完一定<b>代回兩式驗算</b>。'
        ],
        formula: { label: '口訣', tex: '\\text{兩點成線、固定誰就垂直於誰、答案代回驗算}' },
        visual: (h) => {
          const R = { xmin: -5, xmax: 5, ymin: -5, ymax: 5 };
          const P = SV.plane({ x0: 52, y0: 8, w: 220, h: 220, xmin: R.xmin, xmax: R.xmax, ymin: R.ymin, ymax: R.ymax });
          let g = P.defs + P.svg;
          g += SV.seg(P.X(3), P.Y(5), P.X(3), P.Y(-5), GRN, 3.6);
          g += SV.seg(P.X(-5), P.Y(3), P.X(5), P.Y(3), RED, 2.6, '7 5');
          g += txt(250, 20, 'x ＝ 3', GRN, 13);
          g += txt(86, 44, 'y ＝ 3', RED, 13);
          g += mark(P, [3, 0], GRN, '', 0, 0);
          g += txt(84, 250, '✓ x ＝ 3 是鉛直線', GRN, 12.5);
          g += txt(232, 250, '✗ 別畫成 y ＝ 3', RED, 12.5);
          g += txt(160, 272, '被固定的是 x → 線鉛直；被固定的是 y → 線水平', C, 12.5);
          h.innerHTML = svg('0 0 320 288', g);
        },
        caption: '\\(x=3\\) 是<b>綠色鉛直線</b>；紅色虛線那條其實是 \\(y=3\\)，別畫反了。',
        example: {
          q: '「\\(x=-2\\) 的圖形」與「\\(y=-2\\) 的圖形」，哪一條是鉛直線？',
          steps: ['\\(x=-2\\)：橫坐標被固定 → 鉛直線，在 \\(y\\) 軸左邊 2 單位。', '\\(y=-2\\)：縱坐標被固定 → 水平線。'],
          ans: '\\(x=-2\\) 是鉛直線'
        }
      }
    ]
  });
})();
