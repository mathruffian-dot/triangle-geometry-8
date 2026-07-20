/* ============ 第 3 章　幾何與證明 ============ */
window.DECK = window.DECK || [];
(function () {
  const C = '#059669';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }
  const dist = (P, Q) => Math.hypot(P[0] - Q[0], P[1] - Q[1]);
  const mid = (P, Q) => [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2];
  const circle = (cx, cy, r, stroke = '#334', fill = 'none', w = 2.4) =>
    `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;

  // 中垂線：以 PQ 中點為中心，往垂直方向兩側各延伸 len
  function perpBis(P, Q, len, color = '#9aa4b6') {
    const M = mid(P, Q);
    const dx = Q[0] - P[0], dy = Q[1] - P[1], L = Math.hypot(dx, dy);
    const nx = -dy / L, ny = dx / L;
    return SV.seg(M[0] - nx * len, M[1] - ny * len, M[0] + nx * len, M[1] + ny * len, color, 2, '5 4');
  }
  // 兩直線交點（P1P2 與 P3P4）
  function inter(P1, P2, P3, P4) {
    const a1 = P2[1] - P1[1], b1 = P1[0] - P2[0], c1 = a1 * P1[0] + b1 * P1[1];
    const a2 = P4[1] - P3[1], b2 = P3[0] - P4[0], c2 = a2 * P3[0] + b2 * P3[1];
    const dd = a1 * b2 - a2 * b1;
    return dd === 0 ? null : [(b2 * c1 - b1 * c2) / dd, (a1 * c2 - a2 * c1) / dd];
  }
  function circumcenter(A, B, C) {
    const [ax, ay] = A, [bx, by] = B, [cx, cy] = C;
    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
    return [ux, uy];
  }
  function incenter(A, B, C) {
    const a = dist(B, C), b = dist(C, A), c = dist(A, B), p = a + b + c;
    return [(a * A[0] + b * B[0] + c * C[0]) / p, (a * A[1] + b * B[1] + c * C[1]) / p];
  }
  const inradius = (A, B, C) => {
    const area = Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) / 2;
    return 2 * area / (dist(B, C) + dist(C, A) + dist(A, B));
  };
  const tri = (A, B, C, fill = 'rgba(5,150,105,0.05)') => SV.poly([A, B, C], fill, C, 2.6);
  const lbl3 = (A, B, C) => SV.vlabel(A[0] - 4, A[1] - 8, 'A') + SV.vlabel(B[0] - 16, B[1] + 10, 'B') + SV.vlabel(C[0] + 6, C[1] + 10, 'C');

  window.DECK.push({
    ch: 3,
    title: '幾何與證明',
    color: C,
    sections: ['3-1 幾何推理證明', '3-2 三角形的外心、內心與重心'],
    slides: [

      /* ---------- 3-1 幾何推理證明 ---------- */
      {
        sec: '3-1', secName: '命題',
        title: '命題：可以判斷真假的敘述',
        points: [
          '能明確判斷<b>真</b>或<b>假</b>的一句話，叫<span class="k">命題</span>。',
          '常寫成「<b>若 P，則 Q</b>」：\\(P\\) 是<b>假設</b>（已知的條件），\\(Q\\) 是<b>結論</b>。',
          '例：「若一四邊形是正方形，則它的四邊等長」——假設、結論一目了然。'
        ],
        formula: { label: '命題結構', tex: '\\text{若 }P\\text{（假設），則 }Q\\text{（結論）}' },
        visual: (h) => {
          h.innerHTML = svg('0 0 430 200', `
            <rect x="30" y="70" width="140" height="64" rx="14" fill="#eef7f2" stroke="${C}" stroke-width="2.2"/>
            <text x="100" y="98" text-anchor="middle" font-size="15" font-weight="900" fill="${C}">假設 P</text>
            <text x="100" y="120" text-anchor="middle" font-size="12" fill="#657187">已知條件</text>
            <line x1="180" y1="102" x2="255" y2="102" stroke="#334" stroke-width="3" marker-end="url(#pm)"/>
            <text x="217" y="90" text-anchor="middle" font-size="13" fill="#657187">推理</text>
            <rect x="262" y="70" width="140" height="64" rx="14" fill="#fdeef2" stroke="${RED}" stroke-width="2.2"/>
            <text x="332" y="98" text-anchor="middle" font-size="15" font-weight="900" fill="${RED}">結論 Q</text>
            <text x="332" y="120" text-anchor="middle" font-size="12" fill="#657187">要得到的結果</text>
            <defs><marker id="pm" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#334"/></marker></defs>
          `);
        },
        caption: '把命題拆成「假設 → 結論」，是寫證明的第一步。',
        example: {
          q: '把「等腰三角形的兩底角相等」改寫成「若…則…」，指出假設與結論。',
          steps: ['若一三角形是等腰三角形（假設），則它的兩底角相等（結論）。'],
          ans: '假設：等腰三角形；結論：兩底角相等'
        }
      },

      {
        sec: '3-1', secName: '逆命題',
        title: '逆命題與反例',
        points: [
          '把命題的<b>假設與結論對調</b>，得到的新命題叫<span class="k">逆命題</span>。',
          '原命題為真，逆命題<b>不一定</b>為真——要各自判斷。',
          '只要找到<b>一個反例</b>（符合假設卻不符合結論），就能證明某命題為<b>假</b>。'
        ],
        formula: { label: '互為逆命題', tex: '(P\\Rightarrow Q)\\ \\text{的逆命題是}\\ (Q\\Rightarrow P)' },
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '原命題（真）', tex: '\\text{若 }a=b\\text{，則 }a^2=b^2', color: C, fill: '#eef7f2', border: C, size: 16 },
            { label: '逆命題（假）', tex: '\\text{若 }a^2=b^2\\text{，則 }a=b', color: RED, border: '#f0c9d3', size: 16, note: '反例：a=2, b=−2 → a²=b² 但 a≠b' }
          ]);
        },
        caption: '逆命題把箭頭反過來；一個反例就能推翻它。',
        example: {
          q: '「若兩角是對頂角，則兩角相等」的逆命題是否為真？',
          steps: ['逆命題：「若兩角相等，則兩角是對頂角」。', '反例：等腰三角形兩底角相等，卻不是對頂角。'],
          ans: '逆命題為假'
        }
      },

      {
        sec: '3-1', secName: '幾何推理證明',
        title: '幾何證明怎麼寫',
        points: [
          '證明＝從<b>已知</b>出發，每一步都寫出<b>理由</b>，一路推到<b>求證</b>。',
          '格式：先列<b>已知</b>與<b>求證</b>，再逐步「敘述 ＋（依據的性質）」。',
          '常用依據：對頂角相等、內錯角相等、三角形內角和 180°、全等性質…'
        ],
        formula: { label: '證明骨架', tex: '\\text{已知}\\;\\longrightarrow\\;\\text{（理由）}\\;\\longrightarrow\\;\\text{求證}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:92%;margin:0 auto;text-align:left;font-size:13.5px;line-height:1.7;color:#172033">
            <div style="background:#eef7f2;border-left:4px solid ${C};padding:8px 12px;border-radius:8px;margin-bottom:8px">
              <b>例</b>：兩直線相交，求證<b>對頂角相等</b>。</div>
            <div style="padding:2px 6px"><b style="color:${C}">已知</b>：直線 AB、CD 交於 O，∠1 與 ∠2 為對頂角。</div>
            <div style="padding:2px 6px"><b style="color:${C}">求證</b>：∠1 ＝ ∠2。</div>
            <div style="padding:6px;border-top:1px dashed #cdd6e2;margin-top:4px">
              ① ∠1 ＋ ∠3 ＝ 180°　<span style="color:#657187">（平角）</span><br>
              ② ∠2 ＋ ∠3 ＝ 180°　<span style="color:#657187">（平角）</span><br>
              ③ 由①②：∠1 ＝ ∠2　<span style="color:#657187">（同減 ∠3）</span> ∎
            </div></div>`;
        },
        caption: '每一步都有依據，讀者才能「無異議」地被說服——這就是證明。',
        example: {
          q: '證明的每一個步驟後面，一定要附上什麼？',
          steps: ['要附上「這一步成立的理由（依據的定義或性質）」。'],
          ans: '理由（依據）'
        }
      },

      /* ---------- 3-2 三角形的外心、內心與重心 ---------- */
      {
        sec: '3-2', secName: '外心',
        title: '外心：三邊中垂線的交點',
        points: [
          '三角形<b>三邊中垂線</b>會交於一點，這點叫<span class="k">外心</span>（記作 O）。',
          '外心到<b>三頂點</b>距離相等：\\(\\overline{OA}=\\overline{OB}=\\overline{OC}\\)。',
          '以 O 為圓心、\\(OA\\) 為半徑可畫出通過三頂點的<b>外接圓</b>。拖滑桿逐步作圖。'
        ],
        formula: { label: '外心性質', tex: '\\overline{OA}=\\overline{OB}=\\overline{OC}=\\text{外接圓半徑}' },
        visual: (h) => {
          const A = [210, 55], B = [70, 250], Cc = [370, 250];
          const O = circumcenter(A, B, Cc), r = dist(O, A);
          const steps = [
            { t: '畫出三角形 ABC。', d: () => tri(A, B, Cc) + lbl3(A, B, Cc) },
            { t: '作 AB 的中垂線。', d: () => perpBis(A, B, 150, BLU) },
            { t: '作 BC 的中垂線。', d: () => perpBis(B, Cc, 150, VIO) },
            { t: '三中垂線交於一點 O（外心）。', d: () => perpBis(Cc, A, 150, AMB) + SV.dot(O[0], O[1], RED, 5) + SV.vlabel(O[0] + 8, O[1] + 4, 'O', RED) },
            {
              t: 'O 到三頂點等距 → 畫外接圓。', d: () => circle(O[0], O[1], r, RED, 'none', 2.4) +
                SV.ticks(O[0], O[1], A[0], A[1], 1, RED) + SV.ticks(O[0], O[1], B[0], B[1], 1, RED) + SV.ticks(O[0], O[1], Cc[0], Cc[1], 1, RED)
            }
          ];
          SV.stepper(h, '0 0 440 380', steps);
        },
        caption: '三邊中垂線交於外心 O；O 是外接圓圓心，到三頂點等距。',
        example: {
          q: '外心 \\(O\\) 到頂點 \\(A\\) 的距離為 5，則外接圓半徑多少？',
          steps: ['外接圓半徑 \\(=OA=OB=OC\\)。'],
          ans: '半徑 5'
        }
      },

      {
        sec: '3-2', secName: '外心',
        title: '外心的角度性質',
        points: [
          '外心 \\(O\\) 是外接圓圓心，所以 \\(\\angle BOC\\) 是<b>圓心角</b>、\\(\\angle A\\) 是同弧<b>圓周角</b>。',
          '由圓周角定理：\\(\\angle BOC=2\\angle A\\)。',
          '外心位置和三角形形狀有關：<b>銳角</b>三角形在內部、<b>直角</b>在斜邊中點、<b>鈍角</b>在外部。'
        ],
        formula: { label: '圓心角＝2×圓周角', tex: '\\angle BOC=2\\,\\angle A' },
        visual: (h) => {
          const A = [210, 55], B = [80, 250], Cc = [360, 250];
          const O = circumcenter(A, B, Cc), r = dist(O, A);
          let s = circle(O[0], O[1], r, '#ccd3df');
          s += tri(A, B, Cc);
          s += SV.seg(O[0], O[1], B[0], B[1], RED, 2.2) + SV.seg(O[0], O[1], Cc[0], Cc[1], RED, 2.2);
          const dB = SV.angleOf(O[0], O[1], B[0], B[1]), dC = SV.angleOf(O[0], O[1], Cc[0], Cc[1]);
          s += SV.angle(O[0], O[1], 30, dB, dC, RED, '2α', { w: 2.6, fill: 1, fs: 13 });
          const dAB = SV.angleOf(A[0], A[1], B[0], B[1]), dAC = SV.angleOf(A[0], A[1], Cc[0], Cc[1]);
          s += SV.angle(A[0], A[1], 26, Math.min(dAB, dAC), Math.max(dAB, dAC), BLU, 'α', { w: 2.6, fs: 13 });
          s += SV.dot(O[0], O[1], RED, 4) + SV.vlabel(O[0] + 8, O[1] + 4, 'O');
          s += lbl3(A, B, Cc);
          h.innerHTML = svg('0 0 440 370', s);
        },
        caption: '\\(\\angle A=\\alpha\\)（圓周角）時，\\(\\angle BOC=2\\alpha\\)（圓心角）。',
        example: {
          q: '\\(\\triangle ABC\\) 外心為 \\(O\\)，\\(\\angle A=40^\\circ\\)，求 \\(\\angle BOC\\)。',
          steps: ['\\(\\angle BOC=2\\angle A=2\\times40^\\circ\\)。'],
          ans: '\\(\\angle BOC=80^\\circ\\)'
        }
      },

      {
        sec: '3-2', secName: '內心',
        title: '內心：三內角平分線的交點',
        points: [
          '三角形<b>三內角平分線</b>會交於一點，叫<span class="k">內心</span>（記作 I）。',
          '內心到<b>三邊</b>距離相等，這距離是<b>內切圓半徑 r</b>。',
          '以 I 為圓心、\\(r\\) 為半徑的圓<b>內切</b>於三角形（和三邊各相切）。拖滑桿作圖。'
        ],
        formula: { label: '內心性質', tex: '\\text{到三邊等距}=\\text{內切圓半徑 }r' },
        visual: (h) => {
          const A = [210, 50], B = [80, 260], Cc = [370, 260];
          const I = incenter(A, B, Cc), r = inradius(A, B, Cc);
          const footBC = [I[0], 260];
          // 垂足：I 對邊 CA、AB 的垂足
          function foot(P, Q1, Q2) {
            const dx = Q2[0] - Q1[0], dy = Q2[1] - Q1[1], L2 = dx * dx + dy * dy;
            const t = ((P[0] - Q1[0]) * dx + (P[1] - Q1[1]) * dy) / L2;
            return [Q1[0] + t * dx, Q1[1] + t * dy];
          }
          const fca = foot(I, Cc, A), fab = foot(I, A, B);
          const steps = [
            { t: '畫出三角形 ABC。', d: () => tri(A, B, Cc) + lbl3(A, B, Cc) },
            { t: '作 ∠A 的角平分線。', d: () => SV.seg(A[0], A[1], footBC[0], footBC[1], BLU, 2, '5 4') },
            { t: '作 ∠B、∠C 的角平分線，交於內心 I。', d: () => SV.seg(B[0], B[1], fca[0], fca[1], VIO, 2, '5 4') + SV.seg(Cc[0], Cc[1], fab[0], fab[1], AMB, 2, '5 4') + SV.dot(I[0], I[1], RED, 5) + SV.vlabel(I[0] + 8, I[1] + 4, 'I', RED) },
            {
              t: 'I 到三邊等距 → 畫內切圓。', d: () => circle(I[0], I[1], r, RED, 'rgba(225,29,72,0.06)', 2.4) +
                SV.rightAngle(footBC[0], footBC[1], 90, 180, 9, RED) + SV.dot(footBC[0], footBC[1], RED, 3) + SV.dot(fca[0], fca[1], RED, 3) + SV.dot(fab[0], fab[1], RED, 3)
            }
          ];
          SV.stepper(h, '0 0 450 300', steps);
        },
        caption: '三內角平分線交於內心 I；I 是內切圓圓心，到三邊等距。',
        example: {
          q: '內心到三角形一邊的距離為 4，則內切圓半徑多少？',
          steps: ['內切圓半徑＝內心到各邊的距離。'],
          ans: '半徑 4'
        }
      },

      {
        sec: '3-2', secName: '內心',
        title: '內心的角度與面積關係',
        points: [
          '角度：\\(\\angle BIC=90^\\circ+\\dfrac12\\angle A\\)（由角平分線與內角和推得）。',
          '面積：把 \\(I\\) 連到三頂點，切成三個高都為 \\(r\\) 的三角形。',
          '所以三角形面積 \\(=\\dfrac12 r(a+b+c)=r\\times s\\)（\\(s\\) 為半周長）。'
        ],
        formula: { label: '面積與內切圓半徑', tex: '\\text{面積}=\\dfrac12\\,r\\,(a+b+c)' },
        visual: (h) => {
          const A = [210, 45], B = [70, 250], Cc = [360, 250];
          const I = incenter(A, B, Cc), r = inradius(A, B, Cc);
          let s = tri(A, B, Cc, 'none');
          s += SV.seg(I[0], I[1], A[0], A[1], '#9aa4b6', 1.8) + SV.seg(I[0], I[1], B[0], B[1], '#9aa4b6', 1.8) + SV.seg(I[0], I[1], Cc[0], Cc[1], '#9aa4b6', 1.8);
          s += circle(I[0], I[1], r, RED, 'rgba(225,29,72,0.05)', 2);
          const fBC = [I[0], 250];
          s += SV.seg(I[0], I[1], fBC[0], fBC[1], RED, 2) + SV.rightAngle(fBC[0], fBC[1], 90, 180, 9, RED);
          s += `<text x="${I[0] + 6}" y="${(I[1] + 250) / 2}" font-size="12" font-weight="800" fill="${RED}">r</text>`;
          s += SV.dot(I[0], I[1], RED, 4) + SV.vlabel(I[0] - 16, I[1] + 4, 'I');
          s += lbl3(A, B, Cc);
          h.innerHTML = svg('0 0 440 300', s);
        },
        caption: '三塊小三角形的高都是 \\(r\\)，面積相加就是 \\(\\dfrac12 r\\times\\)周長。',
        example: {
          q: '三角形三邊 6、8、10，面積 24，求內切圓半徑 \\(r\\)。',
          steps: ['半周長 \\(s=\\dfrac{6+8+10}{2}=12\\)。', '面積 \\(=r\\,s\\Rightarrow 24=12r\\Rightarrow r=2\\)。'],
          ans: '\\(r=2\\)'
        }
      },

      {
        sec: '3-2', secName: '重心',
        title: '重心：三中線的交點（2:1）',
        points: [
          '頂點到<b>對邊中點</b>的線段叫<b>中線</b>；三條中線交於一點，叫<span class="k">重心</span>（記作 G）。',
          '重心把每條中線分成 <b>2 : 1</b>（頂點到重心 : 重心到中點）。',
          '重心是三角形的<b>平衡點</b>。拖滑桿逐步作出三中線與 G。'
        ],
        formula: { label: '重心分中線', tex: '\\overline{AG}:\\overline{GM}=2:1' },
        visual: (h) => {
          const A = [210, 50], B = [80, 260], Cc = [360, 260];
          const G = [(A[0] + B[0] + Cc[0]) / 3, (A[1] + B[1] + Cc[1]) / 3];
          const Ma = mid(B, Cc), Mb = mid(Cc, A), Mc = mid(A, B);
          const steps = [
            { t: '畫出三角形 ABC。', d: () => tri(A, B, Cc) + lbl3(A, B, Cc) },
            { t: '作中線 A→BC 中點。', d: () => SV.seg(A[0], A[1], Ma[0], Ma[1], BLU, 2.2) + SV.dot(Ma[0], Ma[1], BLU, 3.5) },
            { t: '作中線 B→CA 中點。', d: () => SV.seg(B[0], B[1], Mb[0], Mb[1], VIO, 2.2) + SV.dot(Mb[0], Mb[1], VIO, 3.5) },
            {
              t: '三中線交於重心 G，分中線為 2:1。', d: () => SV.seg(Cc[0], Cc[1], Mc[0], Mc[1], AMB, 2.2) + SV.dot(Mc[0], Mc[1], AMB, 3.5) +
                SV.dot(G[0], G[1], RED, 5.5) + SV.vlabel(G[0] + 8, G[1] + 4, 'G', RED) +
                `<text x="${(A[0] + G[0]) / 2 - 14}" y="${(A[1] + G[1]) / 2}" font-size="12" font-weight="800" fill="${RED}">2</text>` +
                `<text x="${(G[0] + Ma[0]) / 2 + 6}" y="${(G[1] + Ma[1]) / 2}" font-size="12" font-weight="800" fill="${RED}">1</text>`
            }
          ];
          SV.stepper(h, '0 0 440 300', steps);
        },
        caption: '三中線交於重心 G；G 把每條中線切成 2:1。',
        example: {
          q: '中線 \\(\\overline{AM}=12\\)，\\(G\\) 為重心，求 \\(\\overline{AG}\\) 與 \\(\\overline{GM}\\)。',
          steps: ['\\(AG:GM=2:1\\)，全長 12 分成 3 份。', '\\(AG=\\dfrac23\\times12=8,\\ GM=\\dfrac13\\times12=4\\)。'],
          ans: '\\(AG=8,\\ GM=4\\)'
        }
      },

      {
        sec: '3-2', secName: '三心整理',
        title: '外心・內心・重心　一次比較',
        points: [
          '三個「心」都由三條特殊線的交點決定，但性質各不同：',
          '<b>外心</b>＝中垂線交點，到<b>頂點</b>等距（外接圓）。',
          '<b>內心</b>＝角平分線交點，到<b>邊</b>等距（內切圓）。',
          '<b>重心</b>＝中線交點，分中線 <b>2:1</b>（平衡點）。'
        ],
        visual: (h) => {
          h.innerHTML = `<div style="width:96%;margin:0 auto">
            <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:center">
              <tr style="background:#eef7f2">
                <th style="border:1px solid #cdd6e2;padding:8px">心</th>
                <th style="border:1px solid #cdd6e2;padding:8px">三線交點</th>
                <th style="border:1px solid #cdd6e2;padding:8px">關鍵性質</th>
                <th style="border:1px solid #cdd6e2;padding:8px">關聯圓</th>
              </tr>
              <tr>
                <td style="border:1px solid #cdd6e2;padding:8px;font-weight:900;color:${RED}">外心 O</td>
                <td style="border:1px solid #cdd6e2;padding:8px">三邊<b>中垂線</b></td>
                <td style="border:1px solid #cdd6e2;padding:8px">到三<b>頂點</b>等距<br>∠BOC＝2∠A</td>
                <td style="border:1px solid #cdd6e2;padding:8px">外接圓</td>
              </tr>
              <tr style="background:#fafcfb">
                <td style="border:1px solid #cdd6e2;padding:8px;font-weight:900;color:${BLU}">內心 I</td>
                <td style="border:1px solid #cdd6e2;padding:8px">三內角<b>平分線</b></td>
                <td style="border:1px solid #cdd6e2;padding:8px">到三<b>邊</b>等距<br>面積＝r·s</td>
                <td style="border:1px solid #cdd6e2;padding:8px">內切圓</td>
              </tr>
              <tr>
                <td style="border:1px solid #cdd6e2;padding:8px;font-weight:900;color:${AMB}">重心 G</td>
                <td style="border:1px solid #cdd6e2;padding:8px">三<b>中線</b></td>
                <td style="border:1px solid #cdd6e2;padding:8px">分中線 <b>2:1</b><br>平衡點</td>
                <td style="border:1px solid #cdd6e2;padding:8px">—</td>
              </tr>
            </table>
            <div style="margin-top:10px;font-size:12.5px;color:#657187;text-align:center">
              提醒：正三角形的外心、內心、重心會<b>重合</b>於同一點。</div>
          </div>`;
        },
        caption: '一句話記：外心找頂點、內心找邊、重心二比一。',
        example: {
          q: '哪一個心到三角形「三邊」的距離都相等？',
          steps: ['到三邊等距 ⇒ 內切圓圓心。'],
          ans: '內心'
        }
      }
    ]
  });
})();
