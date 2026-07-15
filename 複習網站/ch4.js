/* ============ 第 4 章　平行與四邊形 ============ */
window.DECK = window.DECK || [];
(function () {
  const C = '#d97706';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }

  // 平行截線幾何
  function parGeom() {
    const L1y = 95, L2y = 245, xL = 35, xR = 425, Tt = [120, 35], Tb = [355, 305];
    const dx = Tb[0] - Tt[0], dy = Tb[1] - Tt[1];
    const xat = y => Tt[0] + dx * (y - Tt[1]) / dy;
    return { L1y, L2y, xL, xR, Tt, Tb, I1: [xat(L1y), L1y], I2: [xat(L2y), L2y] };
  }
  function regionOf(I, G, r) {
    const dUp = SV.angleOf(I[0], I[1], G.Tt[0], G.Tt[1]);
    const dDn = SV.angleOf(I[0], I[1], G.Tb[0], G.Tb[1]);
    return { '1': [dUp, 180], '2': [0, dUp], '3': [180, dDn], '4': [dDn, 360] }[r];
  }
  // 畫平行截線圖；highlights=[{i:1|2, r:'1'..'4', color}]；showNums 是否標號
  // o.band：兩線之間加內部底色；o.regions：標「內側／外側」；o.sides：標截線左右側
  function parFig(highlights = [], showNums = true, o = {}) {
    const G = parGeom();
    let s = '';
    // 內部帶狀底色（兩平行線之間＝內側）
    if (o.band) {
      s += `<rect x="${G.xL}" y="${G.L1y}" width="${G.xR - G.xL}" height="${G.L2y - G.L1y}" fill="rgba(37,99,235,0.07)"/>`;
    }
    // 平行線
    s += SV.seg(G.xL, G.L1y, G.xR, G.L1y, '#334', 3) + SV.seg(G.xL, G.L2y, G.xR, G.L2y, '#334', 3);
    // 平行記號 >
    s += `<path d="M215,${G.L1y - 6} l8,6 l-8,6" fill="none" stroke="${GRN}" stroke-width="2.4"/>`;
    s += `<path d="M235,${G.L2y - 6} l8,6 l-8,6" fill="none" stroke="${GRN}" stroke-width="2.4"/>`;
    // 截線
    s += SV.seg(G.Tt[0], G.Tt[1], G.Tb[0], G.Tb[1], '#8a94a8', 2.6);
    // 高亮弧
    highlights.forEach(hl => {
      const I = hl.i === 1 ? G.I1 : G.I2;
      const [d0, d1] = regionOf(I, G, hl.r);
      s += SV.angle(I[0], I[1], 30, d0, d1, hl.color, '', { w: 5 });
    });
    // 交點
    s += SV.dot(G.I1[0], G.I1[1], '#334', 4) + SV.dot(G.I2[0], G.I2[1], '#334', 4);
    // 標號 ①..⑧
    if (showNums) {
      const nums = { 1: { '1': '1', '2': '2', '3': '3', '4': '4' }, 2: { '1': '5', '2': '6', '3': '7', '4': '8' } };
      [1, 2].forEach(ii => {
        const I = ii === 1 ? G.I1 : G.I2;
        const dUp = SV.angleOf(I[0], I[1], G.Tt[0], G.Tt[1]), dDn = SV.angleOf(I[0], I[1], G.Tb[0], G.Tb[1]);
        const mids = { '1': (dUp + 180) / 2, '2': dUp / 2, '3': (180 + dDn) / 2, '4': (dDn + 360) / 2 };
        Object.keys(mids).forEach(r => {
          const P = SV.pt(I[0], I[1], 42, mids[r]);
          s += `<circle cx="${P[0].toFixed(1)}" cy="${P[1].toFixed(1)}" r="11" fill="#fff" stroke="#c3ccdb" stroke-width="1.4"/><text x="${P[0].toFixed(1)}" y="${(P[1] + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="#657187">${nums[ii][r]}</text>`;
        });
      });
    }
    s += `<text x="${G.xR - 4}" y="${G.L1y - 8}" text-anchor="end" class="mth" font-size="14" fill="#334">L₁</text>`;
    s += `<text x="${G.xR - 4}" y="${G.L2y - 8}" text-anchor="end" class="mth" font-size="14" fill="#334">L₂</text>`;
    // 內側／外側 區域標籤
    if (o.regions) {
      s += `<text x="${G.xL + 6}" y="${(G.L1y + G.L2y) / 2 + 5}" font-size="13" font-weight="800" fill="${BLU}">內側</text>`;
      s += `<text x="${G.xL + 6}" y="${G.L1y - 12}" font-size="13" font-weight="800" fill="#8a94a8">外側</text>`;
      s += `<text x="${G.xL + 6}" y="${G.L2y + 24}" font-size="13" font-weight="800" fill="#8a94a8">外側</text>`;
    }
    return s;
  }

  // 內角弧（頂點 V、鄰點 X,Y，自動取內部小弧）
  function iang(V, X, Y, r, color, label = '', opt = {}) {
    const dA = SV.angleOf(V[0], V[1], X[0], X[1]), dB = SV.angleOf(V[0], V[1], Y[0], Y[1]);
    const diff = (dB - dA + 360) % 360; const [d0, d1] = diff <= 180 ? [dA, dB] : [dB, dA];
    return SV.angle(V[0], V[1], r, d0, d1, color, label, opt);
  }

  // 動態平行截線圖：th=截線方向角（度）；opt.tilt=L₂ 傾角（判別頁用）
  // opt.mark='corr'|'alt'|'co'；opt.showDeg 顯示度數；opt.letter 顯示 F/Z/C 字樣
  function dynPar(th, opt = {}) {
    const { mark = null, tilt = 0, showDeg = false, letter = '' } = opt;
    const L1y = 95, xL = 35, xR = 425, mid = [230, 170], L2p = [230, 245];
    const rad = Math.PI / 180;
    const dir = [Math.cos(th * rad), -Math.sin(th * rad)];
    const tAtY = y => (y - mid[1]) / dir[1];
    const Tt = [mid[0] + tAtY(35) * dir[0], 35], Tb = [mid[0] + tAtY(305) * dir[0], 305];
    const I1 = [mid[0] + tAtY(L1y) * dir[0], L1y];
    const s2 = Math.tan(tilt * rad);
    const l2At = x => L2p[1] + (x - L2p[0]) * s2;
    const t2 = (L2p[1] - mid[1] + (mid[0] - L2p[0]) * s2) / (dir[1] - dir[0] * s2);
    const I2 = [mid[0] + t2 * dir[0], mid[1] + t2 * dir[1]];
    let s = SV.seg(xL, L1y, xR, L1y, '#334', 3) + SV.seg(xL, l2At(xL), xR, l2At(xR), '#334', 3) +
      SV.seg(Tt[0], Tt[1], Tb[0], Tb[1], '#8a94a8', 2.6) +
      SV.dot(I1[0], I1[1], '#334', 4) + SV.dot(I2[0], I2[1], '#334', 4) +
      `<text x="${xR - 4}" y="${L1y - 8}" text-anchor="end" font-size="14" fill="#334">L₁</text>` +
      `<text x="${xR - 4}" y="${l2At(xR) - 8}" text-anchor="end" font-size="14" fill="#334">L₂</text>`;
    if (Math.abs(tilt) < 0.4) {
      s += `<path d="M120,${L1y - 6} l8,6 l-8,6" fill="none" stroke="${GRN}" stroke-width="2.4"/>` +
        `<path d="M120,${l2At(120) - 6} l8,6 l-8,6" fill="none" stroke="${GRN}" stroke-width="2.4"/>`;
    }
    const up = th, dn = th + 180;
    if (mark) {
      const l2r = SV.angleOf(I2[0], I2[1], xR, l2At(xR));
      const v1 = m => Math.round(m), v2 = Math.round((up - l2r + 360) % 360);
      const deg = (I, d0, d1, col, lbl) => SV.angle(I[0], I[1], 30, d0, d1, col, lbl, { w: 4.5, fs: 13, lr: 26 });
      if (mark === 'corr') s += deg(I1, 0, up, BLU, showDeg ? v1(th) + '°' : '') + deg(I2, l2r, up, BLU, showDeg ? v2 + '°' : '');
      else if (mark === 'alt') s += deg(I1, 180, dn, RED, showDeg ? v1(th) + '°' : '') + deg(I2, l2r, up, RED, showDeg ? v2 + '°' : '');
      else if (mark === 'co') s += deg(I1, dn, 360, AMB, showDeg ? v1(180 - th) + '°' : '') + deg(I2, l2r, up, AMB, showDeg ? v2 + '°' : '');
    }
    if (letter) s += `<text x="55" y="75" font-size="36" font-weight="900" fill="rgba(217,119,6,0.45)">${letter}</text>`;
    return s;
  }

  // 平行四邊形頂點（傾斜）
  const PG = { A: [70, 220], B: [280, 220], C: [340, 80], D: [130, 80] };
  const pgPoly = (fill = 'rgba(217,119,6,0.07)') => SV.poly([PG.A, PG.B, PG.C, PG.D], fill, C, 2.6);
  const pgLabels = () => SV.vlabel(PG.A[0] - 18, PG.A[1] + 6, 'A') + SV.vlabel(PG.B[0] + 8, PG.B[1] + 6, 'B') + SV.vlabel(PG.C[0] + 8, PG.C[1], 'C') + SV.vlabel(PG.D[0] - 18, PG.D[1], 'D');

  window.DECK.push({
    ch: 4,
    title: '平行與四邊形',
    color: C,
    sections: ['4-1 平行', '4-2 平行四邊形', '4-3 特殊四邊形'],
    slides: [

      /* ---------- 4-1 平行 ---------- */
      {
        sec: '4-1', secName: '平行',
        title: '平行線與「距離處處相等」',
        points: [
          '同一平面上<b>永不相交</b>的兩直線，叫<span class="k">平行線</span>（記 \\(L_1\\parallel L_2\\)）。',
          '兩平行線之間的<b>距離處處相等</b>（每一段垂直距離都一樣長）。',
          '<b>同時垂直於一直線</b>的兩直線，一定互相平行。'
        ],
        formula: { label: '記法', tex: 'L_1\\parallel L_2' },
        visual: (h) => {
          const y1 = 105, y2 = 235, xL = 40, xR = 420;
          let s = SV.seg(xL, y1, xR, y1, '#334', 3) + SV.seg(xL, y2, xR, y2, '#334', 3);
          s += `<path d="M215,${y1 - 6} l8,6 l-8,6" fill="none" stroke="${GRN}" stroke-width="2.4"/>`;
          s += `<path d="M235,${y2 - 6} l8,6 l-8,6" fill="none" stroke="${GRN}" stroke-width="2.4"/>`;
          [110, 230, 360].forEach(x => {
            s += SV.seg(x, y1, x, y2, BLU, 2.6) + SV.rightAngle(x, y2, 0, 90, 10, BLU) + SV.ticks(x, y1, x, y2, 1, RED);
          });
          s += `<text x="${xR - 6}" y="${y1 - 8}" text-anchor="end" class="mth" font-size="14" fill="#334">L₁</text>`;
          s += `<text x="${xR - 6}" y="${y2 - 8}" text-anchor="end" class="mth" font-size="14" fill="#334">L₂</text>`;
          s += `<text x="230" y="290" text-anchor="middle" font-size="13" fill="#657187">三段垂直距離（紅刻度）永遠一樣長</text>`;
          h.innerHTML = svg('0 0 460 310', s);
        },
        caption: '平行＝永不相交；兩線之間的寬度（垂直距離）從頭到尾都相同。',
        example: {
          q: '\\(L_1\\parallel L_2\\)，在 A 處兩線相距 5 公分，在另一處 B 相距多少？',
          steps: ['平行線的距離處處相等。'],
          ans: '5 公分'
        }
      },

      {
        sec: '4-1', secName: '平行',
        title: '截線與八個角',
        points: [
          '一條直線和兩條線相交，這條線叫<span class="k">截線（橫截線）</span>。',
          '兩個交點各產生 4 個角，共<b>八個角</b>，是本節所有關係的舞台。',
          '點下方按鈕，看三種重要角的關係（在 \\(L_1\\parallel L_2\\) 時）。'
        ],
        visual: (h) => {
          h.innerHTML = `<div style="width:100%">
            <div id="pf"></div>
            <div class="ictrl">
              <button class="ibtn" data-m="corr">同位角</button>
              <button class="ibtn" data-m="alt">內錯角</button>
              <button class="ibtn" data-m="co">同側內角</button>
              <button class="ibtn" data-m="">清除</button>
            </div>
            <div id="pfnote" style="text-align:center;margin-top:10px;font-size:14px;font-weight:800;color:${C};min-height:20px"></div>
          </div>`;
          const sets = {
            corr: { hl: [{ i: 1, r: '2', color: BLU }, { i: 2, r: '2', color: BLU }], note: '同位角相等：∠2 ＝ ∠6（F 形）' },
            alt: { hl: [{ i: 1, r: '3', color: RED }, { i: 2, r: '2', color: RED }], note: '內錯角相等：∠3 ＝ ∠6（Z 形）' },
            co: { hl: [{ i: 1, r: '4', color: AMB }, { i: 2, r: '2', color: AMB }], note: '同側內角互補：∠4 ＋ ∠6 ＝ 180°（C 形）' },
            '': { hl: [], note: '' }
          };
          const draw = (m) => {
            h.querySelector('#pf').innerHTML = svg('0 0 460 340', parFig(sets[m].hl));
            h.querySelector('#pfnote').textContent = sets[m].note;
            h.querySelectorAll('.ibtn').forEach(b => b.classList.toggle('active', b.dataset.m === m && m !== ''));
          };
          h.querySelectorAll('.ibtn').forEach(b => b.onclick = () => draw(b.dataset.m));
          draw('corr');
        },
        caption: '八個角只要記三種關係：同位角、內錯角、同側內角。'
      },

      {
        sec: '4-1', secName: '平行',
        title: '角的位置：內側、外側、截線兩側',
        points: [
          '兩條平行線<b>之間</b>叫<span class="k">內側</span>，之外叫<span class="k">外側</span>。',
          '落在內側的角（③④⑤⑥）叫<b>內角</b>；落在外側的（①②⑦⑧）叫<b>外角</b>。',
          '截線把平面分成<b>左、右兩側</b>；角在截線<b>同側</b>還是<b>異側</b>也決定名稱。',
          '有「<b>內／外</b>」和「<b>同側／異側</b>」兩把尺，就能命名三種角。'
        ],
        visual: (h) => {
          const G = parGeom();
          let s = `<rect x="${G.xL}" y="${G.L1y}" width="${G.xR - G.xL}" height="${G.L2y - G.L1y}" fill="rgba(37,99,235,0.09)"/>`;
          s += SV.seg(G.xL, G.L1y, G.xR, G.L1y, '#334', 3) + SV.seg(G.xL, G.L2y, G.xR, G.L2y, '#334', 3);
          s += SV.seg(G.Tt[0], G.Tt[1], G.Tb[0], G.Tb[1], '#8a94a8', 2.6);
          s += `<path d="M215,${G.L1y - 6} l8,6 l-8,6" fill="none" stroke="${GRN}" stroke-width="2.4"/>`;
          s += `<path d="M235,${G.L2y - 6} l8,6 l-8,6" fill="none" stroke="${GRN}" stroke-width="2.4"/>`;
          s += SV.dot(G.I1[0], G.I1[1], '#334', 4) + SV.dot(G.I2[0], G.I2[1], '#334', 4);
          const nums = { 1: { '1': '1', '2': '2', '3': '3', '4': '4' }, 2: { '1': '5', '2': '6', '3': '7', '4': '8' } };
          const interior = { 1: { '3': 1, '4': 1 }, 2: { '1': 1, '2': 1 } };
          [1, 2].forEach(ii => {
            const I = ii === 1 ? G.I1 : G.I2;
            const dUp = SV.angleOf(I[0], I[1], G.Tt[0], G.Tt[1]), dDn = SV.angleOf(I[0], I[1], G.Tb[0], G.Tb[1]);
            const mids = { '1': (dUp + 180) / 2, '2': dUp / 2, '3': (180 + dDn) / 2, '4': (dDn + 360) / 2 };
            Object.keys(mids).forEach(r => {
              const P = SV.pt(I[0], I[1], 42, mids[r]); const inr = interior[ii][r];
              s += `<circle cx="${P[0].toFixed(1)}" cy="${P[1].toFixed(1)}" r="12" fill="${inr ? '#dbe7ff' : '#f0f2f6'}" stroke="${inr ? BLU : '#c3ccdb'}" stroke-width="1.6"/><text x="${P[0].toFixed(1)}" y="${(P[1] + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="${inr ? BLU : '#8a94a8'}">${nums[ii][r]}</text>`;
            });
          });
          s += `<text x="${G.xL + 4}" y="${(G.L1y + G.L2y) / 2 + 5}" font-size="14" font-weight="900" fill="${BLU}">內側</text>`;
          s += `<text x="${G.xL + 4}" y="${G.L1y - 12}" font-size="12" font-weight="800" fill="#8a94a8">外側</text>`;
          s += `<text x="${G.xL + 4}" y="${G.L2y + 24}" font-size="12" font-weight="800" fill="#8a94a8">外側</text>`;
          s += `<text x="${G.xR - 4}" y="${G.L1y - 8}" text-anchor="end" class="mth" font-size="14" fill="#334">L₁</text>`;
          s += `<text x="${G.xR - 4}" y="${G.L2y - 8}" text-anchor="end" class="mth" font-size="14" fill="#334">L₂</text>`;
          h.innerHTML = svg('0 0 460 340', s);
        },
        caption: '藍圈＝內角、灰圈＝外角。先分清「內／外」與「截線哪一側」，三種角的名字就好記了。'
      },

      {
        sec: '4-1', secName: '平行',
        title: '同位角相等（F 形）',
        points: [
          '在截線<b>同一側</b>、且相對於各自的線<b>位置相同</b>的兩角，是<span class="k">同位角</span>。',
          '兩線<b>平行</b>時，同位角<b>相等</b>。',
          '圖形長得像英文字母 <b>F</b>。'
        ],
        formula: { label: '平行 ⇒', tex: '\\angle 2 = \\angle 6' },
        visual: (h) => {
          SV.stepper(h, '0 0 460 320', [
            { t: '兩條平行線被一條截線所截。', d: () => dynPar(62) },
            { t: '標出一組同位角：在截線同一側、相對位置相同（都在交點右上）。', d: () => dynPar(62, { mark: 'corr' }) },
            { t: '兩角排成 F 形；兩線平行 ⇒ 同位角相等。', d: () => dynPar(62, { mark: 'corr', showDeg: true, letter: 'F' }) },
            { t: '拖這一段轉動截線：兩個同位角一起變大變小，永遠相等。', d: (k) => dynPar(42 + 36 * k, { mark: 'corr', showDeg: true }) }
          ], { acc: false });
        },
        caption: '滑桿第 4 步轉動截線：同位角＝同側、同位置，平行時永遠相等。',
        example: {
          q: '\\(L_1\\parallel L_2\\)，一個同位角為 \\(70^\\circ\\)，另一同位角？',
          steps: ['平行 ⇒ 同位角相等。'],
          ans: '70°'
        }
      },

      {
        sec: '4-1', secName: '平行',
        title: '內錯角相等（Z 形）',
        points: [
          '在兩線<b>之間</b>（內部）、且在截線<b>兩側</b>的兩角，是<span class="k">內錯角</span>。',
          '兩線<b>平行</b>時，內錯角<b>相等</b>。',
          '圖形長得像英文字母 <b>Z</b>。'
        ],
        formula: { label: '平行 ⇒', tex: '\\angle 3 = \\angle 6' },
        visual: (h) => {
          SV.stepper(h, '0 0 460 320', [
            { t: '兩條平行線被截線所截，先看兩線「之間」的內側區。', d: () => dynPar(62) },
            { t: '標出一組內錯角：都在內側、且分居截線兩側（交錯）。', d: () => dynPar(62, { mark: 'alt' }) },
            { t: '兩角交錯成 Z 形；兩線平行 ⇒ 內錯角相等。', d: () => dynPar(62, { mark: 'alt', showDeg: true, letter: 'Z' }) },
            { t: '拖這一段轉動截線：兩個內錯角同步變化，永遠相等。', d: (k) => dynPar(42 + 36 * k, { mark: 'alt', showDeg: true }) }
          ], { acc: false });
        },
        caption: '滑桿第 4 步轉動截線：內錯角＝內側、異側，交錯成 Z，平行時相等。',
        example: {
          q: '\\(L_1\\parallel L_2\\)，一內錯角為 \\(3x\\)、另一為 \\(x+40\\)，求 \\(x\\)。',
          steps: ['內錯角相等：\\(3x=x+40\\)。', '\\(2x=40\\Rightarrow x=20\\)。'],
          ans: '\\(x=20\\)'
        }
      },

      {
        sec: '4-1', secName: '平行',
        title: '同側內角互補（C 形）',
        points: [
          '在兩線<b>之間</b>、且在截線<b>同一側</b>的兩角，是<span class="k">同側內角</span>。',
          '兩線<b>平行</b>時，同側內角<b>互補</b>（相加 \\(180^\\circ\\)）。',
          '圖形長得像 <b>C</b> 或 <b>U</b>。'
        ],
        formula: { label: '平行 ⇒', tex: '\\angle 4 + \\angle 6 = 180^\\circ' },
        visual: (h) => {
          SV.stepper(h, '0 0 460 320', [
            { t: '兩條平行線被截線所截，一樣先看內側區。', d: () => dynPar(62) },
            { t: '標出一組同側內角：都在內側、且在截線的同一側。', d: () => dynPar(62, { mark: 'co' }) },
            { t: '兩角圍成 C 形；兩線平行 ⇒ 相加＝180°（互補）。', d: () => dynPar(62, { mark: 'co', showDeg: true, letter: 'C' }) },
            { t: '拖這一段轉動截線：一個變大另一個就變小，兩角相加永遠是 180°。', d: (k) => dynPar(42 + 36 * k, { mark: 'co', showDeg: true }) }
          ], { acc: false });
        },
        caption: '滑桿第 4 步轉動截線：同側內角一增一減，和固定 180°。',
        example: {
          q: '\\(L_1\\parallel L_2\\)，一同側內角為 \\(110^\\circ\\)，另一個？',
          steps: ['同側內角互補：\\(180^\\circ-110^\\circ\\)。'],
          ans: '70°'
        }
      },

      {
        sec: '4-1', secName: '平行',
        title: '平行的判別（反過來用）',
        points: [
          '前面是「平行 ⇒ 角相等」；判別是<b>反過來</b>：由角推平行。',
          '若<b>同位角相等</b>，或<b>內錯角相等</b>，或<b>同側內角互補</b>，則兩線<b>平行</b>。',
          '也可用：<b>同垂直於一線</b>的兩線互相平行。'
        ],
        formula: { label: '判別（其一）', tex: '\\angle 2=\\angle 6 \\Rightarrow L_1\\parallel L_2' },
        visual: (h) => {
          SV.stepper(h, '0 0 460 320', [
            { t: 'L₂ 現在是歪的：量得的同位角不相等 ⇒ 兩線不平行。', d: () => dynPar(62, { tilt: 12, mark: 'corr', showDeg: true }) },
            { t: '拖這一段慢慢轉正 L₂，盯著兩個同位角的度數。', d: (k) => dynPar(62, { tilt: 12 * (1 - k), mark: 'corr', showDeg: true }) },
            { t: '同位角相等的那一刻，兩線就平行了（出現 ∥ 記號）！內錯角相等、同側內角互補同理可判別。', d: () => dynPar(62, { tilt: 0, mark: 'corr', showDeg: true }) + `<text x="230" y="315" text-anchor="middle" font-size="14" font-weight="900" fill="${GRN}">同位角相等 ⇒ L₁ ∥ L₂</text>` }
          ], { acc: false });
        },
        caption: '滑桿第 2 步轉動 L₂：角相等的瞬間＝平行的瞬間；性質與判別互為正反。',
        example: {
          q: '兩線被截，一組同位角都是 \\(65^\\circ\\)，兩線平行嗎？',
          steps: ['同位角相等 ⇒ 兩線平行（判別法）。'],
          ans: '平行'
        }
      },

      {
        sec: '4-1', secName: '平行',
        title: '平行線的尺規作圖',
        points: [
          '要過<b>線外一點 P</b> 作一條和 \\(L\\) 平行的線。',
          '① 過 P 任意畫一條<b>截線</b>交 \\(L\\) 於 Q。',
          '② 在 P <b>複製 Q 的同位角</b>（等角作圖）。',
          '③ 同位角相等 ⇒ 過 P 的新線 \\(\\parallel L\\)。'
        ],
        visual: (h) => {
          const Ly = 250, xL = 40, xR = 420;
          const Q = [160, Ly], P = [280, 120], T = [340, 55];
          const carc = (cx, cy, r, d0, d1) => `<polyline points="${SV.arcPoints(cx, cy, r, d0, d1)}" fill="none" stroke="#9aa4b6" stroke-width="1.5" stroke-dasharray="4 4"/>`;
          let s = SV.seg(xL, Ly, xR, Ly, '#334', 3);
          s += SV.seg(142, 270, T[0], T[1], '#8a94a8', 2.4); // 截線
          s += SV.seg(140, P[1], 420, P[1], VIO, 3);          // 過 P 的平行線
          const dT = SV.angleOf(Q[0], Q[1], T[0], T[1]);
          s += SV.angle(Q[0], Q[1], 34, 0, dT, GRN, '', { w: 3 });
          s += SV.angle(P[0], P[1], 34, 0, dT, GRN, '', { w: 3 });
          s += carc(Q[0], Q[1], 60, -8, dT + 12) + carc(P[0], P[1], 60, -8, dT + 12);
          s += SV.dot(Q[0], Q[1], '#334', 4) + SV.dot(P[0], P[1], VIO, 5);
          s += SV.vlabel(Q[0] - 6, Ly + 22, 'Q') + SV.vlabel(P[0] + 8, P[1] - 8, 'P', VIO) + `<text x="${xR - 6}" y="${Ly - 8}" text-anchor="end" class="mth" font-size="14" fill="#334">L</text>`;
          s += `<text x="230" y="300" text-anchor="middle" font-size="12.5" fill="#657187">在 P 複製 ∠Q（綠，同位角）⇒ 紫線 ∥ L</text>`;
          h.innerHTML = svg('0 0 460 320', s);
        },
        caption: '用「複製同位角」的等角作圖，就能作出過線外一點的平行線。'
      },

      /* ---------- 4-2 平行四邊形 ---------- */
      {
        sec: '4-2', secName: '平行四邊形',
        title: '平行四邊形的定義',
        points: [
          '<b>兩雙對邊分別平行</b>的四邊形，叫<span class="k">平行四邊形</span>。',
          '記作 \\(\\square ABCD\\)，頂點要<b>依序</b>標。',
          '「定義」只談平行；相等的性質是由定義<b>推出來</b>的。'
        ],
        formula: { label: '定義', tex: '\\overline{AB}\\parallel\\overline{DC},\\ \\overline{AD}\\parallel\\overline{BC}' },
        visual: (h) => {
          h.innerHTML = svg('0 0 420 300',
            pgPoly() + pgLabels() +
            `<path d="M170,${PG.A[1] - 6} l8,6 l-8,6" fill="none" stroke="${BLU}" stroke-width="2.4"/>` +
            `<path d="M230,${PG.D[1] - 6} l8,6 l-8,6" fill="none" stroke="${BLU}" stroke-width="2.4"/>` +
            `<path d="M95,155 l10,4 l-6,8" fill="none" stroke="${GRN}" stroke-width="2.4"/>` +
            `<path d="M305,155 l10,4 l-6,8" fill="none" stroke="${GRN}" stroke-width="2.4"/>` +
            `<text x="210" y="285" text-anchor="middle" font-size="13" fill="#657187">AB∥DC（藍）、AD∥BC（綠）</text>`);
        },
        caption: '兩組對邊都平行，就是平行四邊形。'
      },

      {
        sec: '4-2', secName: '平行四邊形',
        title: '性質：對邊相等、對角相等',
        points: [
          '平行四邊形的<b>兩雙對邊分別相等</b>。',
          '<b>兩雙對角分別相等</b>；相鄰兩角<b>互補</b>（和 180°）。',
          '這些都能用內錯角＋全等（ASA）證出來。'
        ],
        formula: { label: '性質', tex: '\\overline{AB}=\\overline{DC},\\ \\overline{AD}=\\overline{BC},\\ \\angle A=\\angle C' },
        visual: (h) => {
          const base = () => pgPoly() + pgLabels();
          const diag = () => SV.seg(PG.B[0], PG.B[1], PG.D[0], PG.D[1], VIO, 2);
          const alt1 = () => iang(PG.B, PG.A, PG.D, 26, RED, '', { w: 2.4 }) + iang(PG.D, PG.C, PG.B, 26, RED, '', { w: 2.4 });
          const alt2 = () => iang(PG.D, PG.A, PG.B, 40, BLU, '', { w: 2.4 }) + iang(PG.B, PG.C, PG.D, 40, BLU, '', { w: 2.4 });
          SV.stepper(h, '0 0 420 300', [
            { t: '平行四邊形 ABCD：先只知道「兩雙對邊平行」。', d: () => base() },
            { t: '畫對角線 BD，把它切成兩個三角形。', d: () => base() + diag() },
            { t: 'AB∥DC ⇒ 內錯角相等（紅）；AD∥BC ⇒ 內錯角相等（藍）。', d: () => base() + diag() + alt1() + alt2() },
            { t: '紅角、藍角、夾邊 BD 共用 ⇒ △ABD ≅ △CDB（ASA）！', d: (k) => base() + diag() + alt1() + alt2() + SV.poly([PG.A, PG.B, PG.D], `rgba(225,29,72,${0.10 * k})`, 'rgba(0,0,0,0)', 0) + SV.poly([PG.C, PG.D, PG.B], `rgba(37,99,235,${0.10 * k})`, 'rgba(0,0,0,0)', 0) },
            { t: '全等 ⇒ 對邊相等（刻度）、對角相等（綠弧）；鄰角互補。', d: () => base() + diag() + SV.ticks(PG.A[0], PG.A[1], PG.B[0], PG.B[1], 1, RED) + SV.ticks(PG.D[0], PG.D[1], PG.C[0], PG.C[1], 1, RED) + SV.ticks(PG.A[0], PG.A[1], PG.D[0], PG.D[1], 2, BLU) + SV.ticks(PG.B[0], PG.B[1], PG.C[0], PG.C[1], 2, BLU) + iang(PG.A, PG.B, PG.D, 22, GRN, '', { w: 2.4 }) + iang(PG.C, PG.D, PG.B, 22, GRN, '', { w: 2.4 }) }
          ], { acc: false });
        },
        caption: '拖動滑桿看證明：一條對角線＋內錯角＋ASA，對邊、對角的相等就都出來了。',
        example: {
          q: '\\(\\square ABCD\\) 中 \\(\\angle A=110^\\circ\\)，求 \\(\\angle B\\) 與 \\(\\angle C\\)。',
          steps: ['相鄰角互補：\\(\\angle B=180^\\circ-110^\\circ=70^\\circ\\)。', '對角相等：\\(\\angle C=\\angle A=110^\\circ\\)。'],
          ans: '\\(\\angle B=70^\\circ,\\ \\angle C=110^\\circ\\)'
        }
      },

      {
        sec: '4-2', secName: '平行四邊形',
        title: '性質：對角線互相平分',
        points: [
          '兩條對角線<b>互相平分</b>：交點是<b>兩對角線的中點</b>。',
          '即 \\(\\overline{OA}=\\overline{OC}\\)、\\(\\overline{OB}=\\overline{OD}\\)。',
          '注意——只是「互相平分」，一般<b>不</b>相等、<b>不</b>垂直。'
        ],
        formula: { label: '性質', tex: '\\overline{OA}=\\overline{OC},\\ \\overline{OB}=\\overline{OD}' },
        visual: (h) => {
          const O = [(PG.A[0] + PG.C[0]) / 2, (PG.A[1] + PG.C[1]) / 2];
          const base = () => pgPoly() + pgLabels();
          const diags = () => SV.seg(PG.A[0], PG.A[1], PG.C[0], PG.C[1], VIO, 2) + SV.seg(PG.B[0], PG.B[1], PG.D[0], PG.D[1], VIO, 2) + SV.dot(O[0], O[1], VIO, 5) + SV.vlabel(O[0] + 8, O[1] - 6, 'O', VIO);
          const marks = () => iang(PG.A, PG.B, PG.C, 26, RED, '', { w: 2.2 }) + iang(PG.C, PG.D, PG.A, 26, RED, '', { w: 2.2 }) + iang(PG.B, PG.A, PG.D, 40, BLU, '', { w: 2.2 }) + iang(PG.D, PG.C, PG.B, 40, BLU, '', { w: 2.2 }) + SV.ticks(PG.A[0], PG.A[1], PG.B[0], PG.B[1], 1, GRN) + SV.ticks(PG.C[0], PG.C[1], PG.D[0], PG.D[1], 1, GRN);
          SV.stepper(h, '0 0 420 300', [
            { t: '畫兩條對角線，交於一點 O。', d: () => base() + diags() },
            { t: '看 △OAB 和 △OCD：AB∥DC ⇒ 兩組內錯角相等（紅、藍）；又 AB＝DC（前頁性質，綠刻度）。', d: () => base() + diags() + marks() },
            { t: '角、邊、角 ⇒ △OAB ≅ △OCD（ASA）。', d: (k) => base() + diags() + marks() + SV.poly([O, PG.A, PG.B], `rgba(225,29,72,${0.10 * k})`, 'rgba(0,0,0,0)', 0) + SV.poly([O, PG.C, PG.D], `rgba(37,99,235,${0.10 * k})`, 'rgba(0,0,0,0)', 0) },
            { t: '全等 ⇒ OA＝OC、OB＝OD：兩條對角線在 O 互相平分！', d: () => base() + diags() + SV.ticks(PG.A[0], PG.A[1], O[0], O[1], 1, RED) + SV.ticks(O[0], O[1], PG.C[0], PG.C[1], 1, RED) + SV.ticks(PG.B[0], PG.B[1], O[0], O[1], 2, BLU) + SV.ticks(O[0], O[1], PG.D[0], PG.D[1], 2, BLU) }
          ], { acc: false });
        },
        caption: '拖動滑桿看證明：內錯角＋對邊等＋ASA ⇒ 交點 O 是兩對角線的中點。',
        example: {
          q: '\\(\\square ABCD\\) 對角線交於 \\(O\\)，\\(\\overline{AC}=12\\)，求 \\(\\overline{OA}\\)。',
          steps: ['對角線互相平分，\\(O\\) 是 \\(\\overline{AC}\\) 中點。', '\\(\\overline{OA}=12\\div2=6\\)。'],
          ans: '6'
        }
      },

      {
        sec: '4-2', secName: '平行四邊形',
        title: '平行四邊形的判別',
        points: [
          '一個四邊形，只要滿足下列<b>任一個</b>，就是平行四邊形：',
          '① 兩雙對邊分別<b>平行</b>（定義）；② 兩雙對邊分別<b>相等</b>。',
          '③ 兩雙對角分別<b>相等</b>；④ 對角線<b>互相平分</b>。',
          '⑤ <b>一組對邊</b>又平行<b>又</b>相等。'
        ],
        formula: { label: '常用判別', tex: '\\overline{AB}\\parallel\\overline{DC}\\ \\text{且}\\ \\overline{AB}=\\overline{DC}\\Rightarrow \\square ABCD' },
        visual: (h) => {
          const O = [(PG.A[0] + PG.C[0]) / 2, (PG.A[1] + PG.C[1]) / 2];
          const base = () => pgPoly() + pgLabels();
          const par = (c) => `<path d="M170,${PG.A[1] - 6} l8,6 l-8,6" fill="none" stroke="${c}" stroke-width="2.4"/><path d="M230,${PG.D[1] - 6} l8,6 l-8,6" fill="none" stroke="${c}" stroke-width="2.4"/>`;
          const par2 = (c) => `<path d="M95,155 l10,4 l-6,8" fill="none" stroke="${c}" stroke-width="2.4"/><path d="M305,155 l10,4 l-6,8" fill="none" stroke="${c}" stroke-width="2.4"/>`;
          SV.stepper(h, '0 0 420 300', [
            { t: '判別①（定義）：兩雙對邊分別平行。', d: () => base() + par(BLU) + par2(GRN) },
            { t: '判別②：兩雙對邊分別相等。', d: () => base() + SV.ticks(PG.A[0], PG.A[1], PG.B[0], PG.B[1], 1, RED) + SV.ticks(PG.D[0], PG.D[1], PG.C[0], PG.C[1], 1, RED) + SV.ticks(PG.A[0], PG.A[1], PG.D[0], PG.D[1], 2, BLU) + SV.ticks(PG.B[0], PG.B[1], PG.C[0], PG.C[1], 2, BLU) },
            { t: '判別③：兩雙對角分別相等。', d: () => base() + iang(PG.A, PG.B, PG.D, 22, GRN, '', { w: 2.4 }) + iang(PG.C, PG.D, PG.B, 22, GRN, '', { w: 2.4 }) + iang(PG.B, PG.A, PG.C, 22, VIO, '', { w: 2.4 }) + iang(PG.D, PG.C, PG.A, 22, VIO, '', { w: 2.4 }) },
            { t: '判別④：對角線互相平分。', d: () => base() + SV.seg(PG.A[0], PG.A[1], PG.C[0], PG.C[1], VIO, 2) + SV.seg(PG.B[0], PG.B[1], PG.D[0], PG.D[1], VIO, 2) + SV.dot(O[0], O[1], VIO, 5) + SV.ticks(PG.A[0], PG.A[1], O[0], O[1], 1, RED) + SV.ticks(O[0], O[1], PG.C[0], PG.C[1], 1, RED) + SV.ticks(PG.B[0], PG.B[1], O[0], O[1], 2, BLU) + SV.ticks(O[0], O[1], PG.D[0], PG.D[1], 2, BLU) },
            { t: '判別⑤（最好用）：一組對邊「又平行又相等」。', d: () => base() + par(RED) + SV.ticks(PG.A[0], PG.A[1], PG.B[0], PG.B[1], 1, RED) + SV.ticks(PG.D[0], PG.D[1], PG.C[0], PG.C[1], 1, RED) }
          ], { acc: false });
        },
        caption: '拖動滑桿逐一看五種判別法——滿足任一個就是平行四邊形。',
        example: {
          q: '四邊形中 \\(\\overline{AB}\\parallel\\overline{DC}\\) 且 \\(\\overline{AB}=\\overline{DC}\\)，它是？',
          steps: ['符合判別⑤：一組對邊又平行又相等。'],
          ans: '平行四邊形'
        }
      },

      /* ---------- 4-3 特殊四邊形 ---------- */
      {
        sec: '4-3', secName: '特殊四邊形',
        title: '矩形（長方形）',
        points: [
          '有一個角是<b>直角</b>的平行四邊形（於是四個角都是直角）。',
          '擁有平行四邊形的<b>所有性質</b>，再加上：',
          '<b>兩條對角線相等</b>（\\(\\overline{AC}=\\overline{BD}\\)）。'
        ],
        formula: { label: '特徵', tex: '\\text{四內角}=90^\\circ,\\quad \\overline{AC}=\\overline{BD}' },
        visual: (h) => {
          const shape = (sh) => { // sh=剪切量：60→平行四邊形、0→矩形
            const A = [90, 220], B = [330, 220], Cc = [330 + sh, 70], D = [90 + sh, 70];
            return { A, B, Cc, D };
          };
          const draw = (sh, extra = '') => {
            const { A, B, Cc, D } = shape(sh);
            const angA = Math.round(SV.angleOf(A[0], A[1], D[0], D[1]));
            return SV.poly([A, B, Cc, D], 'rgba(217,119,6,0.07)', C, 2.6) +
              SV.vlabel(A[0] - 18, A[1] + 6, 'A') + SV.vlabel(B[0] + 8, B[1] + 6, 'B') + SV.vlabel(Cc[0] + 8, Cc[1], 'C') + SV.vlabel(D[0] - 18, D[1], 'D') +
              (sh > 1 ? iang([...A], B, D, 30, RED, angA + '°', { w: 2.4, fs: 12 }) : '') + extra;
          };
          const rectExtra = () => {
            const { A, B, Cc, D } = shape(0);
            return SV.rightAngle(A[0], A[1], 0, 90, 13, '#657187') + SV.rightAngle(B[0], B[1], 90, 180, 13, '#657187') + SV.rightAngle(Cc[0], Cc[1], 180, 270, 13, '#657187') + SV.rightAngle(D[0], D[1], 270, 360, 13, '#657187');
          };
          const diagExtra = () => {
            const { A, B, Cc, D } = shape(0);
            return SV.seg(A[0], A[1], Cc[0], Cc[1], VIO, 2) + SV.seg(B[0], B[1], D[0], D[1], VIO, 2) +
              SV.ticks(A[0], A[1], Cc[0], Cc[1], 1, RED) + SV.ticks(B[0], B[1], D[0], D[1], 1, RED) + SV.dot(210, 145, VIO, 4);
          };
          SV.stepper(h, '0 0 420 290', [
            { t: '拖這一段把平行四邊形「扶正」：讓 ∠A 慢慢變成 90°。', d: (k) => draw(60 * (1 - k)) },
            { t: '一個角是直角的平行四邊形＝矩形 ⇒ 四個角全是直角。', d: () => draw(0, rectExtra()) },
            { t: '矩形多出的性質：兩條對角線等長（AC＝BD，紅刻度）。', d: () => draw(0, rectExtra() + diagExtra()) }
          ], { acc: false });
        },
        caption: '滑桿第 1 步把平行四邊形扶正成矩形；矩形多了「對角線相等」。',
        example: {
          q: '矩形對角線 \\(\\overline{AC}=10\\)，另一條對角線 \\(\\overline{BD}\\)？',
          steps: ['矩形兩對角線相等。'],
          ans: '10'
        }
      },

      {
        sec: '4-3', secName: '特殊四邊形',
        title: '菱形',
        points: [
          '<b>四邊等長</b>的平行四邊形。',
          '擁有平行四邊形所有性質，再加上：',
          '對角線<b>互相垂直</b>，且<b>平分兩組對角</b>。'
        ],
        formula: { label: '特徵', tex: '\\text{四邊相等},\\quad \\overline{AC}\\perp\\overline{BD}' },
        visual: (h) => {
          const A = [210, 250], B = [340, 150], Cc = [210, 50], D = [80, 150], O = [210, 150];
          const base = () => SV.poly([A, B, Cc, D], 'rgba(217,119,6,0.07)', C, 2.6) +
            SV.vlabel(A[0] - 4, A[1] + 22, 'A') + SV.vlabel(B[0] + 8, B[1] + 4, 'B') + SV.vlabel(Cc[0] - 4, Cc[1] - 8, 'C') + SV.vlabel(D[0] - 20, D[1] + 4, 'D');
          const sides = () => SV.ticks(A[0], A[1], B[0], B[1], 1, RED) + SV.ticks(B[0], B[1], Cc[0], Cc[1], 1, RED) + SV.ticks(Cc[0], Cc[1], D[0], D[1], 1, RED) + SV.ticks(D[0], D[1], A[0], A[1], 1, RED);
          const diags = () => SV.seg(A[0], A[1], Cc[0], Cc[1], VIO, 2) + SV.seg(B[0], B[1], D[0], D[1], VIO, 2) + SV.dot(O[0], O[1], VIO, 4) + SV.vlabel(O[0] + 8, O[1] + 18, 'O', VIO);
          const perp = () => SV.rightAngle(O[0], O[1], 0, 90, 12, VIO) +
            SV.ticks(A[0], A[1], O[0], O[1], 2, '#111') + SV.ticks(O[0], O[1], Cc[0], Cc[1], 2, '#111') +
            SV.ticks(B[0], B[1], O[0], O[1], 3, BLU) + SV.ticks(O[0], O[1], D[0], D[1], 3, BLU);
          const bis = () => iang(A, B, O, 34, GRN, '', { w: 2 }) + iang(A, O, D, 34, GRN, '', { w: 2 }) + iang(B, Cc, O, 30, GRN, '', { w: 2 }) + iang(B, O, A, 30, GRN, '', { w: 2 });
          SV.stepper(h, '0 0 420 300', [
            { t: '四邊等長（紅刻度）的平行四邊形＝菱形。', d: () => base() + sides() },
            { t: '畫兩條對角線，交於 O。', d: () => base() + sides() + diags() },
            { t: '對角線互相「垂直」且「平分」：AO＝OC、BO＝OD，且交角 90°。', d: () => base() + sides() + diags() + perp() },
            { t: '對角線還會平分兩組對角（綠弧）——因為每條對角線都是對稱軸。', d: () => base() + sides() + diags() + perp() + bis() }
          ], { acc: false });
        },
        caption: '拖動滑桿：菱形的對角線互相垂直平分，還平分兩組對角。',
        example: {
          q: '菱形對角線長 6 與 8，求邊長。',
          steps: ['對角線垂直平分 ⇒ 半對角線 3 與 4，構成直角三角形。', '邊長 \\(=\\sqrt{3^2+4^2}=\\sqrt{25}=5\\)。'],
          ans: '5'
        }
      },

      {
        sec: '4-3', secName: '特殊四邊形',
        title: '正方形：矩形 ∩ 菱形',
        points: [
          '<b>四邊等長</b>又<b>四角都是直角</b>——同時是矩形也是菱形。',
          '因此擁有兩者<b>全部</b>的性質。',
          '對角線：<b>相等</b>、<b>互相垂直平分</b>、且<b>平分對角（45°）</b>。'
        ],
        formula: { label: '特徵', tex: '\\text{四邊相等且四角}=90^\\circ' },
        visual: (h) => {
          const A = [120, 230], B = [300, 230], Cc = [300, 50], D = [120, 50], O = [210, 140];
          const base = () => SV.poly([A, B, Cc, D], 'rgba(217,119,6,0.08)', C, 2.6) +
            SV.vlabel(A[0] - 18, A[1] + 6, 'A') + SV.vlabel(B[0] + 8, B[1] + 6, 'B') + SV.vlabel(Cc[0] + 8, Cc[1], 'C') + SV.vlabel(D[0] - 18, D[1], 'D');
          const sides = () => [[A, B], [B, Cc], [Cc, D], [D, A]].map(([p, q]) => SV.ticks(p[0], p[1], q[0], q[1], 1, RED)).join('') +
            SV.rightAngle(A[0], A[1], 0, 90, 13, '#657187') + SV.rightAngle(B[0], B[1], 90, 180, 13, '#657187') + SV.rightAngle(Cc[0], Cc[1], 180, 270, 13, '#657187') + SV.rightAngle(D[0], D[1], 270, 360, 13, '#657187');
          const diags = () => SV.seg(A[0], A[1], Cc[0], Cc[1], VIO, 2) + SV.seg(B[0], B[1], D[0], D[1], VIO, 2) + SV.dot(O[0], O[1], VIO, 4);
          SV.stepper(h, '0 0 420 290', [
            { t: '四邊等長＋四個直角：正方形同時是「矩形」也是「菱形」。', d: () => base() + sides() },
            { t: '矩形血統 ⇒ 對角線相等（黑刻度）。', d: () => base() + sides() + diags() + SV.ticks(A[0], A[1], Cc[0], Cc[1], 2, '#111') + SV.ticks(B[0], B[1], D[0], D[1], 2, '#111') },
            { t: '菱形血統 ⇒ 對角線互相垂直平分。', d: () => base() + sides() + diags() + SV.rightAngle(O[0], O[1], 0, 90, 11, VIO) },
            { t: '對角線平分頂角：和邊的夾角都是 45°。', d: () => base() + sides() + diags() + SV.rightAngle(O[0], O[1], 0, 90, 11, VIO) + iang(A, B, Cc, 34, GRN, '45°', { w: 2, fs: 11 }) + iang(A, Cc, D, 34, GRN, '45°', { w: 2, fs: 11 }) }
          ], { acc: false });
        },
        caption: '拖動滑桿：正方形＝矩形∩菱形，兩邊的性質全繼承。'
      },

      {
        sec: '4-3', secName: '特殊四邊形',
        title: '箏形',
        points: [
          '有<b>兩雙鄰邊</b>分別相等的四邊形（像風箏）。',
          '對角線<b>互相垂直</b>，且一條（對稱軸）<b>平分</b>另一條。',
          '被對稱軸分開的<b>一組對角相等</b>。'
        ],
        formula: { label: '箏形', tex: '\\overline{AB}=\\overline{AD},\\ \\overline{CB}=\\overline{CD}' },
        visual: (h) => {
          const A = [210, 50], B = [330, 150], Cc = [210, 275], D = [90, 150], O = [210, 150];
          const base = () => SV.poly([A, B, Cc, D], 'rgba(217,119,6,0.07)', C, 2.6) +
            SV.vlabel(A[0] - 4, A[1] - 8, 'A') + SV.vlabel(B[0] + 8, B[1] + 4, 'B') + SV.vlabel(Cc[0] - 4, Cc[1] + 22, 'C') + SV.vlabel(D[0] - 20, D[1] + 4, 'D');
          const sides = () => SV.ticks(A[0], A[1], B[0], B[1], 1, RED) + SV.ticks(A[0], A[1], D[0], D[1], 1, RED) +
            SV.ticks(Cc[0], Cc[1], B[0], B[1], 2, BLU) + SV.ticks(Cc[0], Cc[1], D[0], D[1], 2, BLU);
          const ax = () => SV.seg(A[0], A[1], Cc[0], Cc[1], VIO, 2, '7 5');
          const bd = () => SV.seg(B[0], B[1], D[0], D[1], VIO, 2) + SV.dot(O[0], O[1], VIO, 4) +
            SV.rightAngle(O[0], O[1], 90, 180, 12, VIO) + SV.ticks(B[0], B[1], O[0], O[1], 3, '#111') + SV.ticks(O[0], O[1], D[0], D[1], 3, '#111');
          SV.stepper(h, '0 0 420 320', [
            { t: '箏形：兩雙「鄰邊」分別相等（上一雙紅、下一雙藍）。', d: () => base() + sides() },
            { t: 'AC 是對稱軸（虛線）：沿 AC 對摺，左右完全重合。', d: () => base() + sides() + ax() },
            { t: '對摺 ⇒ 對角線互相垂直，且對稱軸 AC 平分 BD（黑刻度）。', d: () => base() + sides() + ax() + bd() },
            { t: '對摺也讓 ∠B 疊到 ∠D ⇒ 這一組對角相等（綠弧）。', d: () => base() + sides() + ax() + bd() + iang(B, A, Cc, 26, GRN, '', { w: 2.4 }) + iang(D, A, Cc, 26, GRN, '', { w: 2.4 }) }
          ], { acc: false });
        },
        caption: '拖動滑桿：用「對摺」理解箏形——垂直、平分、對角相等全來自對稱。',
        example: {
          q: '箏形兩對角線長 6 與 8（互相垂直），面積多少？',
          steps: ['箏形面積＝兩對角線乘積 ÷ 2。', '\\(=\\dfrac{6\\times 8}{2}=24\\)。'],
          ans: '24'
        }
      },

      {
        sec: '4-3', secName: '特殊四邊形',
        title: '梯形與等腰梯形',
        points: [
          '<span class="k">梯形</span>：<b>只有一組</b>對邊平行（平行的兩邊叫上底、下底）。',
          '<span class="k">等腰梯形</span>：兩腰等長的梯形。',
          '等腰梯形：<b>同底的兩底角相等</b>、<b>兩對角線相等</b>。'
        ],
        formula: { label: '等腰梯形', tex: '\\overline{AD}=\\overline{BC},\\ \\angle A=\\angle B,\\ \\overline{AC}=\\overline{BD}' },
        visual: (h) => {
          const A = [60, 220], B = [360, 220], Cc = [290, 80], D = [130, 80];
          const base = () => SV.poly([A, B, Cc, D], 'rgba(217,119,6,0.07)', C, 2.6) +
            `<path d="M200,${A[1] - 6} l8,6 l-8,6" fill="none" stroke="${GRN}" stroke-width="2.4"/>` +
            `<path d="M205,${D[1] - 6} l8,6 l-8,6" fill="none" stroke="${GRN}" stroke-width="2.4"/>` +
            SV.vlabel(A[0] - 18, A[1] + 6, 'A') + SV.vlabel(B[0] + 8, B[1] + 6, 'B') + SV.vlabel(Cc[0] + 8, Cc[1], 'C') + SV.vlabel(D[0] - 18, D[1], 'D') +
            `<text x="210" y="66" text-anchor="middle" font-size="13" font-weight="800" fill="${GRN}">上底</text>` +
            `<text x="210" y="242" text-anchor="middle" font-size="13" font-weight="800" fill="${GRN}">下底</text>`;
          const waist = () => SV.ticks(A[0], A[1], D[0], D[1], 1, RED) + SV.ticks(B[0], B[1], Cc[0], Cc[1], 1, RED) +
            `<text x="80" y="150" text-anchor="middle" font-size="13" font-weight="800" fill="${RED}">腰</text><text x="340" y="150" text-anchor="middle" font-size="13" font-weight="800" fill="${RED}">腰</text>`;
          const bang = () => iang(A, B, D, 26, BLU, '', { w: 2.6 }) + iang(B, A, Cc, 26, BLU, '', { w: 2.6 });
          SV.stepper(h, '0 0 440 300', [
            { t: '梯形：只有一組對邊平行（上底∥下底，綠記號）。', d: () => base() },
            { t: '等腰梯形：兩腰等長（紅刻度）。', d: () => base() + waist() },
            { t: '同一個底的兩個底角相等（藍弧）。', d: () => base() + waist() + bang() },
            { t: '兩條對角線也相等（AC＝BD，黑刻度）。', d: () => base() + waist() + bang() + SV.seg(A[0], A[1], Cc[0], Cc[1], VIO, 2) + SV.seg(B[0], B[1], D[0], D[1], VIO, 2) + SV.ticks(A[0], A[1], Cc[0], Cc[1], 2, '#111') + SV.ticks(B[0], B[1], D[0], D[1], 2, '#111') }
          ], { acc: false });
        },
        caption: '拖動滑桿：等腰梯形＝腰等、同底底角等、對角線等。',
        example: {
          q: '等腰梯形一底角 \\(70^\\circ\\)，與它<b>同一底</b>的另一底角？',
          steps: ['等腰梯形同底的兩底角相等。'],
          ans: '70°'
        }
      },

      {
        sec: '4-3', secName: '特殊四邊形',
        title: '梯形的中線（兩腰中點連線）',
        points: [
          '連接梯形<b>兩腰中點</b>的線段，叫<span class="k">中線（中位線）</span>。',
          '中線<b>平行</b>上、下底。',
          '中線長 ＝ <b>(上底＋下底) ÷ 2</b>（上下底的平均）。'
        ],
        formula: { label: '梯形中線', tex: '\\overline{MN}=\\dfrac{\\text{上底}+\\text{下底}}{2}' },
        visual: (h) => {
          const A = [60, 240], B = [380, 240];
          const geo = (w) => { // w=上底寬(px)，置中於 x=220
            const D = [220 - w / 2, 90], Cc = [220 + w / 2, 90];
            const M = [(A[0] + D[0]) / 2, (A[1] + D[1]) / 2], N = [(B[0] + Cc[0]) / 2, (B[1] + Cc[1]) / 2];
            return { D, Cc, M, N };
          };
          const draw = (w, mid, nums) => {
            const { D, Cc, M, N } = geo(w);
            const u = 20, a = (w / u).toFixed(1), b = ((B[0] - A[0]) / u).toFixed(1), m = ((N[0] - M[0]) / u).toFixed(1);
            return SV.poly([A, B, Cc, D], 'rgba(217,119,6,0.07)', C, 2.6) +
              SV.vlabel(A[0] - 18, A[1] + 6, 'A') + SV.vlabel(B[0] + 8, B[1] + 6, 'B') + SV.vlabel(Cc[0] + 8, Cc[1], 'C') + SV.vlabel(D[0] - 18, D[1], 'D') +
              SV.dot(M[0], M[1], VIO, 4.5) + SV.dot(N[0], N[1], VIO, 4.5) +
              SV.vlabel(M[0] - 24, M[1] + 4, 'M', VIO) + SV.vlabel(N[0] + 8, N[1] + 4, 'N', VIO) +
              SV.ticks(A[0], A[1], M[0], M[1], 1, RED) + SV.ticks(M[0], M[1], D[0], D[1], 1, RED) +
              SV.ticks(B[0], B[1], N[0], N[1], 2, BLU) + SV.ticks(N[0], N[1], Cc[0], Cc[1], 2, BLU) +
              (mid ? SV.seg(M[0], M[1], N[0], N[1], VIO, 3) : '') +
              (nums ? `<text x="220" y="82" text-anchor="middle" font-size="13" font-weight="900" fill="${C}">上底 a＝${a}</text>` +
                `<text x="220" y="262" text-anchor="middle" font-size="13" font-weight="900" fill="${C}">下底 b＝${b}</text>` +
                `<text x="220" y="${(90 + 240) / 2 - 10}" text-anchor="middle" font-size="14" font-weight="900" fill="${VIO}">中線＝(${a}＋${b})÷2＝${m}</text>` : '');
          };
          SV.stepper(h, '0 0 440 300', [
            { t: '取兩腰的中點 M、N（紅、藍刻度：上下段等長）。', d: () => draw(160, false, false) },
            { t: '連 MN 就是中線：它和上、下底平行。', d: () => draw(160, true, false) },
            { t: '拖這一段改變上底寬度：中線長永遠是「上下底的平均」。', d: (k) => draw(60 + 180 * k, true, true) }
          ], { acc: false });
        },
        caption: '滑桿第 3 步改變上底：中線＝(上底＋下底)÷2 隨時成立。',
        example: {
          q: '梯形上底 6、下底 10，中線長多少？',
          steps: ['中線 ＝ (上底＋下底) ÷ 2 ＝ (6+10) ÷ 2。'],
          ans: '8'
        }
      },

      {
        sec: '4-3', secName: '特殊四邊形',
        title: '特殊四邊形的面積',
        points: [
          '<b>平行四邊形</b>：底 × 高。',
          '<b>梯形</b>：(上底＋下底) × 高 ÷ 2。',
          '<b>菱形、箏形</b>（對角線互相垂直）：兩對角線乘積 ÷ 2。'
        ],
        visual: (h) => {
          h.innerHTML = SV.fbox([
            { label: '平行四邊形', tex: '\\text{面積}=\\text{底}\\times\\text{高}', color: BLU, border: '#cddafc', size: 16 },
            { label: '梯形', tex: '\\text{面積}=\\dfrac{(\\text{上底}+\\text{下底})\\times\\text{高}}{2}', color: '#059669', border: '#cfe8dd', size: 15 },
            { label: '菱形、箏形（對角線垂直）', tex: '\\text{面積}=\\dfrac{d_1\\times d_2}{2}', color: '#e11d48', border: '#f3cfd6', size: 16 }
          ], { gap: 11 });
        },
        caption: '對角線互相垂直的四邊形（菱形、箏形），面積都是對角線乘積的一半。',
        example: {
          q: '菱形兩對角線長 10 與 12，面積多少？',
          steps: ['菱形面積 ＝ 兩對角線乘積 ÷ 2 ＝ \\(\\dfrac{10\\times 12}{2}\\)。'],
          ans: '60'
        }
      },

      {
        sec: '4-3', secName: '特殊四邊形',
        title: '四邊形家族關係圖',
        points: [
          '往下走條件愈來愈嚴格，性質也愈多（子類擁有父類全部性質）。',
          '<b>四邊形</b> → 梯形、平行四邊形、箏形三大分支。',
          '<b>平行四邊形</b>加「直角」→矩形；加「等邊」→菱形。',
          '矩形 ∩ 菱形 ＝ <b>正方形</b>；菱形也是特殊的箏形。'
        ],
        visual: (h) => {
          const box = (x, y, w, t, col) => `<rect x="${x}" y="${y}" width="${w}" height="38" rx="9" fill="#fff" stroke="${col}" stroke-width="2.2"/><text x="${x + w / 2}" y="${y + 24}" text-anchor="middle" font-size="13.5" font-weight="800" fill="${col}">${t}</text>`;
          const ln = (x1, y1, x2, y2, dash) => SV.seg(x1, y1, x2, y2, '#c3ccdb', 1.8, dash || '');
          h.innerHTML = svg('0 0 470 300',
            box(180, 8, 110, '四邊形', '#657187') +
            ln(235, 46, 80, 74) + ln(235, 46, 235, 74) + ln(235, 46, 395, 74) +
            box(35, 74, 90, '梯形', GRN) + box(175, 74, 120, '平行四邊形', BLU) + box(350, 74, 90, '箏形', AMB) +
            ln(235, 112, 195, 146) + ln(235, 112, 335, 146) +
            box(145, 146, 100, '矩形', VIO) + box(285, 146, 100, '菱形', RED) +
            ln(335, 146, 395, 112, '4 4') +
            ln(195, 184, 255, 220) + ln(335, 184, 295, 220) +
            box(215, 220, 110, '正方形', '#0891b2') +
            `<text x="235" y="286" text-anchor="middle" font-size="12" fill="#657187">菱形也是特殊箏形（虛線）；正方形＝矩形∩菱形</text>`);
        },
        caption: '四邊形分三大家族；正方形同時是矩形與菱形，最特別。'
      }
    ]
  });
})();
