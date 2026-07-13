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
        visual: (h) => { h.innerHTML = svg('0 0 460 340', parFig([{ i: 1, r: '2', color: BLU }, { i: 2, r: '2', color: BLU }])); },
        caption: '同位角：同側、同位置；平行時相等。',
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
        visual: (h) => { h.innerHTML = svg('0 0 460 340', parFig([{ i: 1, r: '3', color: RED }, { i: 2, r: '2', color: RED }], true, { band: true, regions: true })); },
        caption: '兩角都在<b>內側</b>（藍底）、且分居截線<b>兩側</b>，交錯成 Z；平行時相等。',
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
        visual: (h) => { h.innerHTML = svg('0 0 460 340', parFig([{ i: 1, r: '4', color: AMB }, { i: 2, r: '2', color: AMB }], true, { band: true, regions: true })); },
        caption: '兩角都在<b>內側</b>（藍底）、且在截線<b>同一側</b>，圍成 C；平行時相加 180°。',
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
          h.innerHTML = svg('0 0 460 340',
            parFig([{ i: 1, r: '2', color: GRN }, { i: 2, r: '2', color: GRN }], true) +
            `<text x="230" y="330" text-anchor="middle" font-size="14" fill="${C}" font-weight="800">看到相等的同位角 → 判定平行</text>`);
        },
        caption: '性質與判別互為「正反」：一個由平行得角，一個由角得平行。',
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
          h.innerHTML = svg('0 0 420 300',
            pgPoly() + pgLabels() +
            SV.ticks(PG.A[0], PG.A[1], PG.B[0], PG.B[1], 1, RED) + SV.ticks(PG.D[0], PG.D[1], PG.C[0], PG.C[1], 1, RED) +
            SV.ticks(PG.A[0], PG.A[1], PG.D[0], PG.D[1], 2, BLU) + SV.ticks(PG.B[0], PG.B[1], PG.C[0], PG.C[1], 2, BLU) +
            iangle(PG.A, PG.B, PG.D, 22, GRN, '', { w: 2.4 }) + iangle(PG.C, PG.D, PG.B, 22, GRN, '', { w: 2.4 }) +
            `<text x="175" y="242" text-anchor="middle" font-size="12" font-weight="800" fill="${RED}">對邊</text>` +
            `<text x="96" y="145" text-anchor="middle" font-size="12" font-weight="800" fill="${BLU}">對邊</text>` +
            `<text x="108" y="198" font-size="11" font-weight="800" fill="${GRN}">對角</text>` +
            `<text x="300" y="98" font-size="11" font-weight="800" fill="${GRN}">對角</text>` +
            `<text x="210" y="290" text-anchor="middle" font-size="12.5" fill="#657187">紅・藍各一組對邊（相等）；綠弧為對角（相等）</text>`);
          function iangle(V, A, B, r, color, label, opt) {
            const dA = SV.angleOf(V[0], V[1], A[0], A[1]), dB = SV.angleOf(V[0], V[1], B[0], B[1]);
            const diff = (dB - dA + 360) % 360; const [d0, d1] = diff <= 180 ? [dA, dB] : [dB, dA];
            return SV.angle(V[0], V[1], r, d0, d1, color, label, opt);
          }
        },
        caption: '對邊一樣長、對角一樣大，是平行四邊形最常用的性質。',
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
          h.innerHTML = svg('0 0 420 300',
            pgPoly() +
            SV.seg(PG.A[0], PG.A[1], PG.C[0], PG.C[1], VIO, 2) + SV.seg(PG.B[0], PG.B[1], PG.D[0], PG.D[1], VIO, 2) +
            SV.ticks(PG.A[0], PG.A[1], O[0], O[1], 1, RED) + SV.ticks(O[0], O[1], PG.C[0], PG.C[1], 1, RED) +
            SV.ticks(PG.B[0], PG.B[1], O[0], O[1], 2, BLU) + SV.ticks(O[0], O[1], PG.D[0], PG.D[1], 2, BLU) +
            SV.dot(O[0], O[1], VIO, 5) + SV.vlabel(O[0] + 8, O[1] - 6, 'O', VIO) + pgLabels() +
            `<text x="210" y="288" text-anchor="middle" font-size="13" fill="#657187">O 平分兩條對角線：OA=OC、OB=OD</text>`);
        },
        caption: '對角線交點恰是彼此的中點——這是判別平行四邊形的利器。',
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
          h.innerHTML = svg('0 0 420 300',
            pgPoly() + pgLabels() +
            SV.ticks(PG.A[0], PG.A[1], PG.B[0], PG.B[1], 1, RED) + SV.ticks(PG.D[0], PG.D[1], PG.C[0], PG.C[1], 1, RED) +
            `<path d="M170,${PG.A[1] - 6} l8,6 l-8,6" fill="none" stroke="${RED}" stroke-width="2.4"/>` +
            `<path d="M230,${PG.D[1] - 6} l8,6 l-8,6" fill="none" stroke="${RED}" stroke-width="2.4"/>` +
            `<text x="210" y="285" text-anchor="middle" font-size="13" fill="#657187">一組對邊「又平行又相等」即可判定</text>`);
        },
        caption: '判別＝性質反過來用；⑤「一組對邊平行且相等」最好用。',
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
          const A = [90, 220], B = [330, 220], Cc = [330, 70], D = [90, 70];
          const O = [210, 145];
          h.innerHTML = svg('0 0 420 290',
            SV.poly([A, B, Cc, D], 'rgba(217,119,6,0.07)', C, 2.6) +
            SV.seg(A[0], A[1], Cc[0], Cc[1], VIO, 2) + SV.seg(B[0], B[1], D[0], D[1], VIO, 2) +
            SV.rightAngle(A[0], A[1], 0, 90, 13, '#657187') + SV.rightAngle(B[0], B[1], 90, 180, 13, '#657187') + SV.rightAngle(Cc[0], Cc[1], 180, 270, 13, '#657187') + SV.rightAngle(D[0], D[1], 270, 360, 13, '#657187') +
            SV.ticks(A[0], A[1], Cc[0], Cc[1], 1, RED) + SV.ticks(B[0], B[1], D[0], D[1], 1, RED) +
            SV.dot(O[0], O[1], VIO, 4) +
            SV.vlabel(A[0] - 18, A[1] + 6, 'A') + SV.vlabel(B[0] + 8, B[1] + 6, 'B') + SV.vlabel(Cc[0] + 8, Cc[1], 'C') + SV.vlabel(D[0] - 18, D[1], 'D') +
            `<text x="210" y="278" text-anchor="middle" font-size="13" fill="#657187">四個直角＋對角線相等（紅）</text>`);
        },
        caption: '矩形＝有直角的平行四邊形，多了「對角線相等」。',
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
          h.innerHTML = svg('0 0 420 300',
            SV.poly([A, B, Cc, D], 'rgba(217,119,6,0.07)', C, 2.6) +
            SV.seg(A[0], A[1], Cc[0], Cc[1], VIO, 2) + SV.seg(B[0], B[1], D[0], D[1], VIO, 2) +
            SV.rightAngle(O[0], O[1], 0, 90, 12, VIO) +
            SV.ticks(A[0], A[1], B[0], B[1], 1, RED) + SV.ticks(B[0], B[1], Cc[0], Cc[1], 1, RED) + SV.ticks(Cc[0], Cc[1], D[0], D[1], 1, RED) + SV.ticks(D[0], D[1], A[0], A[1], 1, RED) +
            SV.dot(O[0], O[1], VIO, 4) +
            SV.vlabel(A[0] - 4, A[1] + 22, 'A') + SV.vlabel(B[0] + 8, B[1] + 4, 'B') + SV.vlabel(Cc[0] - 4, Cc[1] - 8, 'C') + SV.vlabel(D[0] - 20, D[1] + 4, 'D') +
            `<text x="210" y="292" text-anchor="middle" font-size="13" fill="#657187">四邊相等＋對角線互相垂直平分</text>`);
        },
        caption: '菱形＝四邊等長的平行四邊形，對角線垂直平分。',
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
          h.innerHTML = svg('0 0 420 290',
            SV.poly([A, B, Cc, D], 'rgba(217,119,6,0.08)', C, 2.6) +
            SV.seg(A[0], A[1], Cc[0], Cc[1], VIO, 2) + SV.seg(B[0], B[1], D[0], D[1], VIO, 2) +
            SV.rightAngle(A[0], A[1], 0, 90, 13, '#657187') + SV.rightAngle(B[0], B[1], 90, 180, 13, '#657187') + SV.rightAngle(Cc[0], Cc[1], 180, 270, 13, '#657187') + SV.rightAngle(D[0], D[1], 270, 360, 13, '#657187') +
            SV.rightAngle(O[0], O[1], 0, 90, 11, VIO) +
            [[A, B], [B, Cc], [Cc, D], [D, A]].map(([p, q]) => SV.ticks(p[0], p[1], q[0], q[1], 1, RED)).join('') +
            SV.dot(O[0], O[1], VIO, 4) +
            SV.vlabel(A[0] - 18, A[1] + 6, 'A') + SV.vlabel(B[0] + 8, B[1] + 6, 'B') + SV.vlabel(Cc[0] + 8, Cc[1], 'C') + SV.vlabel(D[0] - 18, D[1], 'D') +
            `<text x="210" y="278" text-anchor="middle" font-size="13" fill="#657187">四邊相等＋四直角＝矩形與菱形的綜合</text>`);
        },
        caption: '正方形是「最特別」的四邊形，集所有好性質於一身。'
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
          h.innerHTML = svg('0 0 420 320',
            SV.poly([A, B, Cc, D], 'rgba(217,119,6,0.07)', C, 2.6) +
            SV.seg(A[0], A[1], Cc[0], Cc[1], VIO, 2) + SV.seg(B[0], B[1], D[0], D[1], VIO, 2) +
            SV.rightAngle(O[0], O[1], 0, 90, 12, VIO) +
            SV.ticks(A[0], A[1], B[0], B[1], 1, RED) + SV.ticks(A[0], A[1], D[0], D[1], 1, RED) +
            SV.ticks(Cc[0], Cc[1], B[0], B[1], 2, BLU) + SV.ticks(Cc[0], Cc[1], D[0], D[1], 2, BLU) +
            SV.ticks(B[0], B[1], O[0], O[1], 3, '#111') + SV.ticks(O[0], O[1], D[0], D[1], 3, '#111') +
            SV.dot(O[0], O[1], VIO, 4) +
            SV.vlabel(A[0] - 4, A[1] - 8, 'A') + SV.vlabel(B[0] + 8, B[1] + 4, 'B') + SV.vlabel(Cc[0] - 4, Cc[1] + 22, 'C') + SV.vlabel(D[0] - 20, D[1] + 4, 'D') +
            `<text x="210" y="308" text-anchor="middle" font-size="12.5" fill="#657187">兩雙鄰邊相等（紅、藍）；AC ⟂ 且平分 BD（黑）</text>`);
        },
        caption: '箏形＝兩雙鄰邊等；對角線互相垂直，對稱軸平分另一條對角線。',
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
          h.innerHTML = svg('0 0 440 300',
            SV.poly([A, B, Cc, D], 'rgba(217,119,6,0.07)', C, 2.6) +
            `<path d="M200,${A[1] - 6} l8,6 l-8,6" fill="none" stroke="${GRN}" stroke-width="2.4"/>` +
            `<path d="M205,${D[1] - 6} l8,6 l-8,6" fill="none" stroke="${GRN}" stroke-width="2.4"/>` +
            SV.ticks(A[0], A[1], D[0], D[1], 1, RED) + SV.ticks(B[0], B[1], Cc[0], Cc[1], 1, RED) +
            iangle2(A, B, D, 26, BLU) + iangle2(B, A, Cc, 26, BLU) +
            SV.vlabel(A[0] - 18, A[1] + 6, 'A') + SV.vlabel(B[0] + 8, B[1] + 6, 'B') + SV.vlabel(Cc[0] + 8, Cc[1], 'C') + SV.vlabel(D[0] - 18, D[1], 'D') +
            `<text x="210" y="66" text-anchor="middle" font-size="13" font-weight="800" fill="${GRN}">上底</text>` +
            `<text x="210" y="242" text-anchor="middle" font-size="13" font-weight="800" fill="${GRN}">下底</text>` +
            `<text x="80" y="150" text-anchor="middle" font-size="13" font-weight="800" fill="${RED}">腰</text>` +
            `<text x="340" y="150" text-anchor="middle" font-size="13" font-weight="800" fill="${RED}">腰</text>` +
            `<text x="102" y="205" font-size="11" font-weight="800" fill="${BLU}">底角</text>` +
            `<text x="288" y="205" font-size="11" font-weight="800" fill="${BLU}">底角</text>` +
            `<text x="220" y="290" text-anchor="middle" font-size="12.5" fill="#657187">上底∥下底、兩腰相等、同底兩底角相等</text>`);
          function iangle2(V, X, Y, r, color) {
            const dA = SV.angleOf(V[0], V[1], X[0], X[1]), dB = SV.angleOf(V[0], V[1], Y[0], Y[1]);
            const diff = (dB - dA + 360) % 360; const [d0, d1] = diff <= 180 ? [dA, dB] : [dB, dA];
            return SV.angle(V[0], V[1], r, d0, d1, color, '', { w: 2.6 });
          }
        },
        caption: '梯形只有一組平行邊；等腰梯形再加「腰等、底角等、對角線等」。',
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
          const A = [60, 240], B = [380, 240], Cc = [300, 90], D = [140, 90];
          const M = [(A[0] + D[0]) / 2, (A[1] + D[1]) / 2], N = [(B[0] + Cc[0]) / 2, (B[1] + Cc[1]) / 2];
          h.innerHTML = svg('0 0 440 300',
            SV.poly([A, B, Cc, D], 'rgba(217,119,6,0.07)', C, 2.6) +
            SV.seg(M[0], M[1], N[0], N[1], VIO, 3) +
            SV.ticks(A[0], A[1], M[0], M[1], 1, RED) + SV.ticks(M[0], M[1], D[0], D[1], 1, RED) +
            SV.ticks(B[0], B[1], N[0], N[1], 2, BLU) + SV.ticks(N[0], N[1], Cc[0], Cc[1], 2, BLU) +
            `<path d="M210,${A[1] - 6} l8,6 l-8,6" fill="none" stroke="${GRN}" stroke-width="2.2"/>` +
            `<path d="M${(M[0] + N[0]) / 2 - 4},${M[1] - 6} l8,6 l-8,6" fill="none" stroke="${GRN}" stroke-width="2.2"/>` +
            `<path d="M215,${D[1] - 6} l8,6 l-8,6" fill="none" stroke="${GRN}" stroke-width="2.2"/>` +
            SV.vlabel(A[0] - 18, A[1] + 6, 'A') + SV.vlabel(B[0] + 8, B[1] + 6, 'B') + SV.vlabel(Cc[0] + 8, Cc[1], 'C') + SV.vlabel(D[0] - 18, D[1], 'D') +
            SV.vlabel(M[0] - 22, M[1] + 4, 'M', VIO) + SV.vlabel(N[0] + 8, N[1] + 4, 'N', VIO) +
            `<text x="220" y="286" text-anchor="middle" font-size="12.5" fill="#657187">MN ∥ 上下底，且 MN ＝ (上底＋下底) ÷ 2</text>`);
        },
        caption: '中線平行上下底，長度是上下底的平均。',
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
