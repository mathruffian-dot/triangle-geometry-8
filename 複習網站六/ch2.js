/* ============ 第 2 章　統計與機率 ============
   依康軒版第六冊：2-1 統計數據的分布、2-2 認識機率、2-3 古典機率
   課綱代碼 D-9-1、D-9-2、D-9-3。
   ⚠ 邊界：樹狀圖「以兩層為限」（D-9-2 備註）；
     平均數／中位數／眾數屬 D-7-2（第 2 冊），本章不重教，只在比較時提及。
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#7c3aed';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }
  const TX = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" ${o.anchor ? `text-anchor="${o.anchor}"` : ''} font-size="${o.fs || 15}" font-weight="${o.fw || 800}" fill="${o.c || '#172033'}"${o.op != null ? ` opacity="${o.op}"` : ''}>${s}</text>`;
  const BOX = (x, y, w, hgt, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${hgt}" rx="${o.r || 12}" fill="${o.fill || '#fff'}" stroke="${o.stroke || '#dce3ee'}" stroke-width="${o.sw || 1.8}"/>`;

  // 四分位數（國中作法：先取中位數把資料分成前後兩半，各自再取中位數；奇數筆時中位數不列入兩半）
  function quart(arr) {
    const a = arr.slice().sort((p, q) => p - q), n = a.length;
    const med = s => { const m = s.length; return m % 2 ? s[(m - 1) / 2] : (s[m / 2 - 1] + s[m / 2]) / 2; };
    const half = n % 2 ? (n - 1) / 2 : n / 2;
    return { min: a[0], max: a[n - 1], q1: med(a.slice(0, half)), q2: med(a), q3: med(a.slice(n - half)), sorted: a };
  }

  window.DECK.push({
    ch: 2,
    title: '統計與機率',
    color: C,
    sections: ['2-1 統計數據的分布', '2-2 認識機率', '2-3 古典機率'],
    slides: [

      /* ---------- 2-1 統計數據的分布 ---------- */
      {
        sec: '2-1', secName: '統計數據的分布',
        title: '全距：資料「拉得多開」的最簡單指標',
        points: [
          '<span class="k">全距</span> ＝ <b>最大值 − 最小值</b>，描述整組資料的<b>散布範圍</b>。',
          '全距只看<b>頭尾兩筆</b>，所以很容易被<b>極端值</b>影響。',
          '拖滑桿把最右邊那筆往外拉，看全距怎麼被一個人拉大。'
        ],
        formula: { label: '全距', tex: '\\text{全距}=\\text{最大值}-\\text{最小值}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>最後一筆資料 ＝ <span class="ival" id="mv">62</span></label>
            <input type="range" id="ms" min="62" max="98" step="4" value="62"></div></div>`;
          const base = [40, 44, 48, 52, 55, 58];
          const draw = () => {
            const last = +h.querySelector('#ms').value;
            h.querySelector('#mv').textContent = last;
            const data = base.concat([last]);
            const lo = 34, hi = 102, X = v => 40 + (v - lo) / (hi - lo) * 356;
            const R = last - 40;
            let s = TX(220, 20, '七筆資料在數線上的位置', { fs: 14, c: C, anchor: 'middle' });
            s += `<line x1="40" y1="96" x2="400" y2="96" stroke="#8a94a6" stroke-width="2"/>`;
            for (let v = 40; v <= 100; v += 10) {
              s += `<line x1="${X(v).toFixed(1)}" y1="92" x2="${X(v).toFixed(1)}" y2="100" stroke="#8a94a6" stroke-width="1.6"/>`;
              s += TX(X(v), 116, `${v}`, { fs: 11, c: '#8a94a6', anchor: 'middle', fw: 700 });
            }
            data.forEach((v, i) => {
              const isLast = i === data.length - 1;
              s += `<circle cx="${X(v).toFixed(1)}" cy="96" r="${isLast ? 7 : 5.5}" fill="${isLast ? AMB : C}" opacity="0.9"/>`;
            });
            // 全距標示
            s += `<line x1="${X(40)}" y1="62" x2="${X(last)}" y2="62" stroke="${RED}" stroke-width="2.4"/>`;
            s += `<line x1="${X(40)}" y1="56" x2="${X(40)}" y2="68" stroke="${RED}" stroke-width="2.4"/>`;
            s += `<line x1="${X(last)}" y1="56" x2="${X(last)}" y2="68" stroke="${RED}" stroke-width="2.4"/>`;
            s += TX((X(40) + X(last)) / 2, 50, `全距 = ${last} − 40 = ${R}`, { fs: 14, c: RED, anchor: 'middle' });
            s += BOX(24, 140, 392, 62, { fill: R > 30 ? '#fff7ed' : '#f6f8fc', stroke: R > 30 ? '#f2d5ab' : '#dce3ee' });
            s += TX(220, 164, `資料：40, 44, 48, 52, 55, 58, ${last}`, { fs: 13.5, anchor: 'middle' });
            s += TX(220, 188, R > 30 ? '只動了一筆，全距就被拉大了 → 全距很怕極端值' : '目前資料還算集中',
              { fs: 13, c: R > 30 ? AMB : '#657187', anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 212', s);
          };
          h.querySelector('#ms').oninput = draw; draw();
        },
        caption: '全距很好算，但<b>只用到兩筆資料</b>——一個極端值就會讓它失真。',
        example: {
          q: '一組資料 \\(12,15,18,20,35\\) 的全距是多少？',
          steps: ['最大 \\(35\\)、最小 \\(12\\)。', '全距 \\(=35-12\\)。'],
          ans: '\\(23\\)'
        }
      },

      {
        sec: '2-1', secName: '統計數據的分布',
        title: '四分位數：把排序後的資料切成<b>四等份</b>',
        points: [
          '先<b>由小到大排序</b>，中位數就是 <b>\\(Q_2\\)</b>，把資料切成前後兩半。',
          '前半的中位數是 <b>\\(Q_1\\)</b>，後半的中位數是 <b>\\(Q_3\\)</b>。',
          '每一段大約各含 <b>25%</b> 的資料 ⇒ 合起來就是「四分位」。'
        ],
        formula: { label: '三個切點', tex: 'Q_1\\ (25\\%)\\;,\\quad Q_2=\\text{中位數}\\ (50\\%)\\;,\\quad Q_3\\ (75\\%)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>看第 <span class="ival" id="sv">1</span> 步</label>
            <input type="range" id="ss" min="1" max="3" step="1" value="1"></div></div>`;
          const data = [3, 5, 6, 8, 9, 11, 12, 14];   // 8 筆（偶數）
          const Q = quart(data);
          const draw = () => {
            const st = +h.querySelector('#ss').value;
            h.querySelector('#sv').textContent = st;
            const cw = 42, x0 = 220 - data.length * cw / 2;
            let s = TX(220, 20, '先排序：' + Q.sorted.join('、'), { fs: 13.5, c: C, anchor: 'middle' });
            Q.sorted.forEach((v, i) => {
              let col = '#fff', bd = '#dce3ee';
              if (st >= 1 && (i === 3 || i === 4)) { col = '#f4efff'; bd = C; }
              if (st >= 2 && i < 4) { col = i === 1 || i === 2 ? '#eef4ff' : col; bd = i === 1 || i === 2 ? BLU : bd; }
              if (st >= 3 && i >= 4) { col = i === 5 || i === 6 ? '#eef7f2' : col; bd = i === 5 || i === 6 ? GRN : bd; }
              s += BOX(x0 + i * cw, 40, cw - 6, 40, { fill: col, stroke: bd, r: 8, sw: 2 });
              s += TX(x0 + i * cw + (cw - 6) / 2, 66, `${v}`, { fs: 16, anchor: 'middle' });
            });
            const mid = x0 + 4 * cw - 3;
            if (st >= 1) {
              s += `<line x1="${mid}" y1="34" x2="${mid}" y2="88" stroke="${C}" stroke-width="2.6" stroke-dasharray="5 4"/>`;
              s += TX(mid, 104, `Q₂ = (8+9)÷2 = ${Q.q2}`, { fs: 13, c: C, anchor: 'middle' });
            }
            if (st >= 2) {
              const p = x0 + 2 * cw - 3;
              s += `<line x1="${p}" y1="34" x2="${p}" y2="88" stroke="${BLU}" stroke-width="2.4" stroke-dasharray="5 4"/>`;
              s += TX(p, 126, `Q₁ = (5+6)÷2 = ${Q.q1}`, { fs: 13, c: BLU, anchor: 'middle' });
            }
            if (st >= 3) {
              const p = x0 + 6 * cw - 3;
              s += `<line x1="${p}" y1="34" x2="${p}" y2="88" stroke="${GRN}" stroke-width="2.4" stroke-dasharray="5 4"/>`;
              s += TX(p, 148, `Q₃ = (11+12)÷2 = ${Q.q3}`, { fs: 13, c: GRN, anchor: 'middle' });
            }
            const txt = ['步驟 1｜先找中位數 Q₂，把資料切成前後兩半',
              '步驟 2｜前半 3,5,6,8 的中位數就是 Q₁',
              '步驟 3｜後半 9,11,12,14 的中位數就是 Q₃'][st - 1];
            s += BOX(24, 162, 392, 40, { fill: '#f6f8fc' });
            s += TX(220, 187, txt, { fs: 13.5, anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 212', s);
          };
          h.querySelector('#ss').oninput = draw; draw();
        },
        caption: '偶數筆時，中位數是<b>中間兩筆的平均</b>，前後兩半各自再取中位數。',
        example: {
          q: '資料 \\(3,5,6,8,9,11,12,14\\) 的 \\(Q_1,Q_2,Q_3\\)？',
          steps: ['共 8 筆，\\(Q_2=(8+9)\\div2=8.5\\)。', '前半 \\(3,5,6,8\\)：\\(Q_1=(5+6)\\div2=5.5\\)。', '後半 \\(9,11,12,14\\)：\\(Q_3=(11+12)\\div2=11.5\\)。'],
          ans: '\\(Q_1=5.5,\\;Q_2=8.5,\\;Q_3=11.5\\)'
        }
      },

      {
        sec: '2-1', secName: '統計數據的分布',
        title: '四分位距 \\(IQR=Q_3-Q_1\\)：只看<b>中間一半</b>的散布',
        points: [
          '<span class="k">四分位距</span> \\(IQR=Q_3-Q_1\\)，涵蓋<b>中間 50%</b> 的資料。',
          '因為<b>不含頭尾</b>，所以<b>不怕極端值</b>——這是它勝過全距的地方。',
          '拖滑桿把最大值往外拉：全距一直變大，\\(IQR\\) 卻紋風不動。'
        ],
        formula: { label: '四分位距', tex: 'IQR=Q_3-Q_1' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>最大值 ＝ <span class="ival" id="mv">14</span></label>
            <input type="range" id="ms" min="14" max="40" step="2" value="14"></div></div>`;
          const base = [3, 5, 6, 8, 9, 11, 12];
          const draw = () => {
            const mx = +h.querySelector('#ms').value;
            h.querySelector('#mv').textContent = mx;
            const Q = quart(base.concat([mx]));
            const lo = 0, hi = 42, X = v => 44 + (v - lo) / (hi - lo) * 352;
            const range = Q.max - Q.min, iqr = Q.q3 - Q.q1;
            let s = TX(220, 20, '灰點＝資料，只有最右邊那筆會動', { fs: 13, c: '#657187', anchor: 'middle' });
            s += `<line x1="44" y1="72" x2="396" y2="72" stroke="#8a94a6" stroke-width="2"/>`;
            Q.sorted.forEach((v, i) => {
              const last = i === Q.sorted.length - 1;
              s += `<circle cx="${X(v).toFixed(1)}" cy="72" r="${last ? 6.5 : 5}" fill="${last ? AMB : '#9aa4b6'}"/>`;
            });
            // 全距條
            s += `<line x1="${X(Q.min)}" y1="44" x2="${X(Q.max)}" y2="44" stroke="${RED}" stroke-width="3"/>`;
            s += TX((X(Q.min) + X(Q.max)) / 2, 36, `全距 ${range}`, { fs: 13, c: RED, anchor: 'middle' });
            // IQR 條
            s += `<rect x="${X(Q.q1)}" y="92" width="${(X(Q.q3) - X(Q.q1)).toFixed(1)}" height="26" rx="6" fill="rgba(5,150,105,.18)" stroke="${GRN}" stroke-width="2.2"/>`;
            s += TX((X(Q.q1) + X(Q.q3)) / 2, 110, `IQR ${iqr}`, { fs: 13.5, c: GRN, anchor: 'middle' });
            s += TX(X(Q.q1), 136, `Q₁=${Q.q1}`, { fs: 11.5, c: GRN, anchor: 'middle', fw: 700 });
            s += TX(X(Q.q3), 136, `Q₃=${Q.q3}`, { fs: 11.5, c: GRN, anchor: 'middle', fw: 700 });
            s += BOX(24, 150, 392, 54, { fill: mx > 14 ? '#eef7f2' : '#f6f8fc', stroke: mx > 14 ? '#bfe0d1' : '#dce3ee' });
            s += TX(220, 172, `全距 ${range}　vs　四分位距 ${iqr}`, { fs: 15, anchor: 'middle' });
            s += TX(220, 194, mx > 14 ? '★ 最大值一直變，IQR 完全沒變 → 不怕極端值' : '把滑桿往右拉，比較兩者的反應',
              { fs: 12.5, c: mx > 14 ? GRN : '#657187', anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 214', s);
          };
          h.querySelector('#ms').oninput = draw; draw();
        },
        caption: '要描述「大多數人集中在哪」，<b>\\(IQR\\) 比全距可靠</b>。',
        example: {
          q: '某組資料 \\(Q_1=5.5,\\;Q_3=11.5\\)，四分位距是多少？代表什麼？',
          steps: ['\\(IQR=11.5-5.5=6\\)。', '代表中間 50% 的資料落在寬度 6 的範圍內。'],
          ans: '\\(IQR=6\\)'
        }
      },

      {
        sec: '2-1', secName: '統計數據的分布',
        title: '盒狀圖：用<b>五個數</b>畫出資料的長相',
        points: [
          '盒狀圖由<b>最小值、\\(Q_1\\)、\\(Q_2\\)、\\(Q_3\\)、最大值</b>五個數決定。',
          '中間的<b>盒子</b>寬度就是 \\(IQR\\)，盒內是中間 50% 的資料。',
          '左右兩條<b>鬍鬚</b>分別延伸到最小值與最大值。'
        ],
        formula: { label: '五數綜合', tex: '\\text{最小值},\\;Q_1,\\;Q_2,\\;Q_3,\\;\\text{最大值}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>畫到第 <span class="ival" id="sv">1</span> 步</label>
            <input type="range" id="ss" min="1" max="4" step="1" value="1"></div></div>`;
          const Q = quart([3, 5, 6, 8, 9, 11, 12, 14]);
          const draw = () => {
            const st = +h.querySelector('#ss').value;
            h.querySelector('#sv').textContent = st;
            const lo = 0, hi = 18, X = v => 46 + (v - lo) / (hi - lo) * 348, cy = 108;
            let s = '';
            s += `<line x1="46" y1="168" x2="394" y2="168" stroke="#8a94a6" stroke-width="1.8"/>`;
            for (let v = 0; v <= 18; v += 3) {
              s += `<line x1="${X(v).toFixed(1)}" y1="164" x2="${X(v).toFixed(1)}" y2="172" stroke="#8a94a6" stroke-width="1.4"/>`;
              s += TX(X(v), 188, `${v}`, { fs: 11, c: '#8a94a6', anchor: 'middle', fw: 700 });
            }
            if (st >= 1) {   // 盒子
              s += `<rect x="${X(Q.q1)}" y="${cy - 26}" width="${(X(Q.q3) - X(Q.q1)).toFixed(1)}" height="52" rx="4" fill="rgba(124,58,237,.12)" stroke="${C}" stroke-width="2.6"/>`;
              s += TX(X(Q.q1), cy - 36, `Q₁=${Q.q1}`, { fs: 12, c: C, anchor: 'middle' });
              s += TX(X(Q.q3), cy - 36, `Q₃=${Q.q3}`, { fs: 12, c: C, anchor: 'middle' });
            }
            if (st >= 2) {   // 中線
              s += `<line x1="${X(Q.q2)}" y1="${cy - 26}" x2="${X(Q.q2)}" y2="${cy + 26}" stroke="${RED}" stroke-width="3"/>`;
              s += TX(X(Q.q2), cy + 44, `Q₂=${Q.q2}`, { fs: 12, c: RED, anchor: 'middle' });
            }
            if (st >= 3) {   // 鬍鬚
              s += `<line x1="${X(Q.min)}" y1="${cy}" x2="${X(Q.q1)}" y2="${cy}" stroke="${GRN}" stroke-width="2.2"/>`;
              s += `<line x1="${X(Q.q3)}" y1="${cy}" x2="${X(Q.max)}" y2="${cy}" stroke="${GRN}" stroke-width="2.2"/>`;
              s += `<line x1="${X(Q.min)}" y1="${cy - 14}" x2="${X(Q.min)}" y2="${cy + 14}" stroke="${GRN}" stroke-width="2.6"/>`;
              s += `<line x1="${X(Q.max)}" y1="${cy - 14}" x2="${X(Q.max)}" y2="${cy + 14}" stroke="${GRN}" stroke-width="2.6"/>`;
              s += TX(X(Q.min), cy - 22, `最小 ${Q.min}`, { fs: 11.5, c: GRN, anchor: 'middle' });
              s += TX(X(Q.max), cy - 22, `最大 ${Q.max}`, { fs: 11.5, c: GRN, anchor: 'middle' });
            }
            if (st >= 4) {
              s += `<rect x="${X(Q.q1)}" y="${cy - 26}" width="${(X(Q.q3) - X(Q.q1)).toFixed(1)}" height="52" rx="4" fill="rgba(5,150,105,.10)" stroke="none"/>`;
              s += TX(220, 22, `盒子寬度＝IQR＝${Q.q3}−${Q.q1}＝${Q.q3 - Q.q1}，裡面裝中間 50% 的資料`, { fs: 13, c: GRN, anchor: 'middle' });
            }
            const txt = ['步驟 1｜用 Q₁、Q₃ 畫出盒子的左右邊',
              '步驟 2｜在 Q₂（中位數）畫一條中線',
              '步驟 3｜從盒子往兩端拉鬍鬚到最小值、最大值',
              '步驟 4｜完成！盒子的寬度就是四分位距'][st - 1];
            s += BOX(24, 204, 392, 36, { fill: '#f6f8fc' });
            s += TX(220, 227, txt, { fs: 13.5, anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 250', s);
          };
          h.querySelector('#ss').oninput = draw; draw();
        },
        caption: '盒狀圖一眼看出<b>中心在哪、散得多開、有沒有偏斜</b>。',
        example: {
          q: '由盒狀圖讀出 \\(Q_1=5.5,\\;Q_2=8.5,\\;Q_3=11.5\\)，最小 \\(3\\)、最大 \\(14\\)。全距與 \\(IQR\\) 各為何？',
          steps: ['全距 \\(=14-3=11\\)。', '\\(IQR=11.5-5.5=6\\)。'],
          ans: '全距 \\(11\\)；\\(IQR=6\\)'
        }
      },

      {
        sec: '2-1', secName: '統計數據的分布',
        title: '用盒狀圖<b>比較兩組</b>：看中位數，也要看盒子寬度',
        points: [
          '<b>中線位置</b>比高低：中位數愈右，整體表現愈好。',
          '<b>盒子寬度</b>比穩定：盒子愈窄，中間一半的人愈<b>集中</b>。',
          '拖滑桿看乙班盒子變寬變窄——中位數一樣，穩定度可以差很多。'
        ],
        formula: { label: '兩個角度', tex: '\\text{中位數}\\to\\text{整體水準}\\;;\\qquad IQR\\to\\text{集中程度}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>乙班 IQR ＝ <span class="ival" id="wv">6</span></label>
            <input type="range" id="ws" min="2" max="14" step="2" value="6"></div></div>`;
          const draw = () => {
            const w = +h.querySelector('#ws').value;
            h.querySelector('#wv').textContent = w;
            const lo = 40, hi = 100, X = v => 52 + (v - lo) / (hi - lo) * 342;
            const boxRow = (cy, q1, q2, q3, mn, mx, col, name) => {
              let t = `<rect x="${X(q1)}" y="${cy - 18}" width="${(X(q3) - X(q1)).toFixed(1)}" height="36" rx="4" fill="${col}22" stroke="${col}" stroke-width="2.4"/>`;
              t += `<line x1="${X(q2)}" y1="${cy - 18}" x2="${X(q2)}" y2="${cy + 18}" stroke="${col}" stroke-width="3"/>`;
              t += `<line x1="${X(mn)}" y1="${cy}" x2="${X(q1)}" y2="${cy}" stroke="${col}" stroke-width="1.8"/>`;
              t += `<line x1="${X(q3)}" y1="${cy}" x2="${X(mx)}" y2="${cy}" stroke="${col}" stroke-width="1.8"/>`;
              t += `<line x1="${X(mn)}" y1="${cy - 10}" x2="${X(mn)}" y2="${cy + 10}" stroke="${col}" stroke-width="2.2"/>`;
              t += `<line x1="${X(mx)}" y1="${cy - 10}" x2="${X(mx)}" y2="${cy + 10}" stroke="${col}" stroke-width="2.2"/>`;
              t += TX(44, cy + 5, name, { fs: 13, c: col, anchor: 'end' });
              return t;
            };
            let s = '';
            s += boxRow(58, 66, 74, 80, 54, 92, BLU, '甲班');
            s += boxRow(124, 74 - w / 2, 74, 74 + w / 2, 74 - w / 2 - 10, 74 + w / 2 + 10, VIO, '乙班');
            s += `<line x1="52" y1="170" x2="394" y2="170" stroke="#8a94a6" stroke-width="1.8"/>`;
            for (let v = 40; v <= 100; v += 10) {
              s += `<line x1="${X(v).toFixed(1)}" y1="166" x2="${X(v).toFixed(1)}" y2="174" stroke="#8a94a6" stroke-width="1.4"/>`;
              s += TX(X(v), 190, `${v}`, { fs: 11, c: '#8a94a6', anchor: 'middle', fw: 700 });
            }
            const narrower = w < 14;
            s += BOX(24, 202, 392, 52, { fill: '#f6f8fc' });
            s += TX(220, 223, `兩班中位數都是 74，但甲班 IQR = 14、乙班 IQR = ${w}`, { fs: 13.5, anchor: 'middle' });
            s += TX(220, 244, w < 14 ? '乙班盒子較窄 ⇒ 成績比較集中、比較穩定' : (w === 14 ? '兩班一樣集中' : ''),
              { fs: 12.5, c: narrower ? VIO : '#657187', anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 264', s);
          };
          h.querySelector('#ws').oninput = draw; draw();
        },
        caption: '中位數一樣<b>不代表兩組一樣</b>——還要看盒子寬度（穩定度）。',
        example: {
          q: '甲、乙兩班中位數皆 \\(74\\)，甲班 \\(IQR=14\\)、乙班 \\(IQR=6\\)。哪一班成績較集中？',
          steps: ['\\(IQR\\) 愈小，中間 50% 的資料愈集中。', '\\(6<14\\)。'],
          ans: '乙班較集中'
        }
      },

      {
        sec: '2-1', secName: '統計數據的分布',
        title: '易錯：忘了排序、\\(Q_2\\) 不是平均數、全距不等於 \\(IQR\\)',
        points: [
          '算四分位數<b>一定要先排序</b>——沒排序的資料算出來全錯。',
          '\\(Q_2\\) 是<b>中位數</b>，不是平均數；兩者常常不相等。',
          '<b>全距用頭尾、\\(IQR\\) 用 \\(Q_1\\) 與 \\(Q_3\\)</b>，兩個是不同的東西。'
        ],
        visual: (h) => {
          const row = (bad, good) => `<div style="display:flex;gap:8px;align-items:stretch;margin-bottom:10px">
            <div style="flex:1;background:#fdeef2;border:1.5px solid #f3c4d0;border-radius:12px;padding:9px 12px">
              <div style="font-size:11.5px;font-weight:900;color:${RED};margin-bottom:3px">✗ 常見錯誤</div>
              <div style="font-size:14px;line-height:1.6">${bad}</div></div>
            <div style="flex:1;background:#eef7f2;border:1.5px solid #bfe0d1;border-radius:12px;padding:9px 12px">
              <div style="font-size:11.5px;font-weight:900;color:${GRN};margin-bottom:3px">✓ 正確</div>
              <div style="font-size:14px;line-height:1.6">${good}</div></div></div>`;
          h.innerHTML = `<div style="width:97%;margin:0 auto">
            ${row('直接照題目順序取中間那筆當 \\(Q_2\\)', '<b>先由小到大排序</b>再取中間')}
            ${row('\\(Q_2\\) 就是平均數', '\\(Q_2\\) 是<b>中位數</b>，和平均數不一定相等')}
            ${row('全距就是 \\(IQR\\)', '全距 \\(=\\) 最大 \\(-\\) 最小；\\(IQR=Q_3-Q_1\\)')}
            ${row('盒子裡是全部資料', '盒子裡只有<b>中間 50%</b>')}
          </div>`;
          MJ(h);
        },
        caption: '四個坑：<b>沒排序</b>、<b>混淆中位數與平均數</b>、<b>混淆全距與 \\(IQR\\)</b>、<b>誤以為盒子裝全部</b>。',
        example: {
          q: '資料 \\(9,3,14,6\\) 的中位數是多少？',
          steps: ['先排序：\\(3,6,9,14\\)。', '偶數筆 ⇒ 中間兩筆平均 \\((6+9)\\div2\\)。'],
          ans: '\\(7.5\\)'
        }
      },

      /* ---------- 2-2 認識機率 ---------- */
      {
        sec: '2-2', secName: '認識機率',
        title: '機率：這件事發生的<b>可能性大小</b>',
        points: [
          '機率一定介於 <b>\\(0\\) 與 \\(1\\)</b> 之間：\\(0\\) 是不可能，\\(1\\) 是必然發生。',
          '所有可能結果的機率<b>加起來等於 \\(1\\)</b>。',
          '「某事件不發生」的機率 \\(=1-\\)「它發生」的機率。'
        ],
        formula: { label: '機率的範圍', tex: '0\\le P(A)\\le 1\\;,\\qquad P(\\text{不發生})=1-P(A)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>P(A) ＝ <span class="ival" id="pv">0.3</span></label>
            <input type="range" id="ps" min="0" max="1" step="0.1" value="0.3"></div></div>`;
          const draw = () => {
            const p = +h.querySelector('#ps').value;
            h.querySelector('#pv').textContent = p.toFixed(1);
            const x0 = 44, w = 352;
            let s = TX(220, 22, '機率尺：從 0（不可能）到 1（必然）', { fs: 13.5, c: C, anchor: 'middle' });
            s += `<rect x="${x0}" y="46" width="${w}" height="30" rx="8" fill="#eef2f8" stroke="#dce3ee" stroke-width="1.6"/>`;
            s += `<rect x="${x0}" y="46" width="${(w * p).toFixed(1)}" height="30" rx="8" fill="rgba(124,58,237,.35)"/>`;
            s += `<line x1="${(x0 + w * p).toFixed(1)}" y1="40" x2="${(x0 + w * p).toFixed(1)}" y2="82" stroke="${C}" stroke-width="3"/>`;
            [0, 0.5, 1].forEach(v => {
              s += `<line x1="${x0 + w * v}" y1="76" x2="${x0 + w * v}" y2="86" stroke="#8a94a6" stroke-width="1.6"/>`;
              s += TX(x0 + w * v, 102, `${v}`, { fs: 12, c: '#8a94a6', anchor: 'middle', fw: 700 });
            });
            s += TX(x0, 118, '不可能', { fs: 11.5, c: '#8a94a6', anchor: 'start' });
            s += TX(x0 + w / 2, 118, '一半一半', { fs: 11.5, c: '#8a94a6', anchor: 'middle' });
            s += TX(x0 + w, 118, '必然', { fs: 11.5, c: '#8a94a6', anchor: 'end' });
            s += BOX(24, 134, 190, 66, { fill: '#f4efff', stroke: '#ddd0f5' });
            s += TX(119, 158, 'P(A 發生)', { fs: 13, c: C, anchor: 'middle' });
            s += TX(119, 184, p.toFixed(1), { fs: 22, c: C, anchor: 'middle' });
            s += BOX(226, 134, 190, 66, { fill: '#eef7f2', stroke: '#bfe0d1' });
            s += TX(321, 158, 'P(A 不發生)', { fs: 13, c: GRN, anchor: 'middle' });
            s += TX(321, 184, (1 - p).toFixed(1), { fs: 22, c: GRN, anchor: 'middle' });
            s += TX(220, 220, `${p.toFixed(1)} ＋ ${(1 - p).toFixed(1)} ＝ 1（兩者一定互補）`, { fs: 13.5, anchor: 'middle', c: '#657187' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 232', s);
          };
          h.querySelector('#ps').oninput = draw; draw();
        },
        caption: '機率超過 1 或小於 0 一定是<b>算錯了</b>——這是最好用的自我檢查。',
        example: {
          q: '已知抽中獎品的機率是 \\(\\dfrac{2}{7}\\)，沒抽中的機率是多少？',
          steps: ['兩者互補，相加為 \\(1\\)。', '\\(1-\\dfrac{2}{7}=\\dfrac{5}{7}\\)。'],
          ans: '\\(\\dfrac{5}{7}\\)'
        }
      },

      {
        sec: '2-2', secName: '認識機率',
        title: '樹狀圖：把<b>所有可能</b>一條一條列出來',
        points: [
          '每一層畫出一個步驟的所有結果，<b>走到底的每條路徑</b>就是一種可能。',
          '總路徑數 ＝ 各層選項<b>相乘</b>（例：\\(2\\times2=4\\)）。',
          '國中階段的樹狀圖<b>以兩層為限</b>，每個節點的分支數相同。'
        ],
        formula: { label: '總可能數', tex: '\\text{總數}=\\text{第一層分支}\\times\\text{第二層分支}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>顯示到第 <span class="ival" id="sv">1</span> 層</label>
            <input type="range" id="ss" min="1" max="3" step="1" value="1"></div></div>`;
          const draw = () => {
            const st = +h.querySelector('#ss').value;
            h.querySelector('#sv').textContent = st > 2 ? 2 : st;
            const rootX = 60, rootY = 118;
            const L1 = [[170, 68, '正', BLU], [170, 168, '反', RED]];
            const L2y = [40, 96, 140, 196];
            let s = TX(220, 20, '丟兩次銅板', { fs: 14, c: C, anchor: 'middle' });
            s += `<circle cx="${rootX}" cy="${rootY}" r="8" fill="${C}"/>`;
            s += TX(rootX, rootY + 26, '開始', { fs: 11.5, c: '#657187', anchor: 'middle' });
            if (st >= 1) L1.forEach(([x, y, t, c]) => {
              s += `<line x1="${rootX + 8}" y1="${rootY}" x2="${x - 14}" y2="${y}" stroke="${c}" stroke-width="2.2"/>`;
              s += `<circle cx="${x}" cy="${y}" r="14" fill="#fff" stroke="${c}" stroke-width="2.2"/>`;
              s += TX(x, y + 5, t, { fs: 14, c, anchor: 'middle' });
            });
            if (st >= 2) {
              const paths = [];
              L1.forEach(([x, y, t1, c], i) => {
                [['正', BLU], ['反', RED]].forEach(([t2, c2], j) => {
                  const ny = L2y[i * 2 + j];
                  s += `<line x1="${x + 14}" y1="${y}" x2="${296}" y2="${ny}" stroke="${c2}" stroke-width="2"/>`;
                  s += `<circle cx="310" cy="${ny}" r="14" fill="#fff" stroke="${c2}" stroke-width="2.2"/>`;
                  s += TX(310, ny + 5, t2, { fs: 14, c: c2, anchor: 'middle' });
                  s += TX(340, ny + 5, `(${t1},${t2})`, { fs: 12.5, c: '#172033' });
                  paths.push(t1 + t2);
                });
              });
              if (st >= 3) s += TX(220, 232, `共 2 × 2 ＝ 4 條路徑：正正、正反、反正、反反`, { fs: 13.5, c: GRN, anchor: 'middle' });
            }
            if (st < 3) s += TX(220, 232, st === 1 ? '第一層：第一次的兩種結果' : '第二層：每個結果再各分兩支', { fs: 13.5, c: '#657187', anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 244', s);
          };
          h.querySelector('#ss').oninput = draw; draw();
        },
        caption: '樹狀圖的價值是<b>不會漏、也不會重複</b>——所有可能一次攤開。',
        example: {
          q: '丟兩次銅板，恰好出現<b>一正一反</b>的機率？',
          steps: ['樹狀圖共 \\(2\\times2=4\\) 種可能。', '一正一反有「正反」「反正」共 \\(2\\) 種。', '\\(P=\\dfrac{2}{4}=\\dfrac12\\)。'],
          ans: '\\(\\dfrac{1}{2}\\)'
        }
      },

      /* ---------- 2-3 古典機率 ---------- */
      {
        sec: '2-3', secName: '古典機率',
        title: '古典機率：<b>有利結果數 ÷ 全部結果數</b>',
        points: [
          '前提是每種結果<b>出現的機會都一樣</b>（對稱性），例如公正的骰子。',
          '\\(P=\\dfrac{\\text{有利結果數}}{\\text{全部結果數}}\\)，先數清楚分母再數分子。',
          '拖滑桿換條件，看有利結果被標出來、機率跟著變。'
        ],
        formula: { label: '古典機率', tex: 'P(A)=\\dfrac{n(A)}{n(S)}=\\dfrac{\\text{有利結果數}}{\\text{全部結果數}}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>條件：<span class="ival" id="cv">大於 4</span></label>
            <input type="range" id="cs" min="0" max="3" step="1" value="0"></div></div>`;
          const conds = [
            { name: '大於 4', f: v => v > 4 },
            { name: '偶數', f: v => v % 2 === 0 },
            { name: '3 的倍數', f: v => v % 3 === 0 },
            { name: '小於 7', f: v => v < 7 }
          ];
          const pips = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]],
            4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
            6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
          const draw = () => {
            const ci = +h.querySelector('#cs').value, cond = conds[ci];
            h.querySelector('#cv').textContent = cond.name;
            let hit = 0;
            let s = TX(220, 20, `丟一顆公正骰子，出現「${cond.name}」的機率`, { fs: 14, c: C, anchor: 'middle' });
            for (let v = 1; v <= 6; v++) {
              const ok = cond.f(v); if (ok) hit++;
              const col = 60 + ((v - 1) % 3) * 108, row = 44 + Math.floor((v - 1) / 3) * 90;
              s += BOX(col, row, 78, 78, { fill: ok ? 'rgba(5,150,105,.14)' : '#f6f8fc', stroke: ok ? GRN : '#dce3ee', sw: ok ? 2.6 : 1.6, r: 14 });
              pips[v].forEach(([dx, dy]) => {
                s += `<circle cx="${col + 39 + dx * 20}" cy="${row + 39 + dy * 20}" r="6" fill="${ok ? GRN : '#8a94a6'}"/>`;
              });
            }
            s += BOX(24, 228, 392, 46, { fill: '#f4efff', stroke: '#ddd0f5' });
            const g = (a, b) => b ? g(b, a % b) : a;
            const d = g(hit, 6);
            s += TX(220, 257, `P ＝ ${hit} ÷ 6 ＝ ${hit / d}/${6 / d}`, { fs: 17, c: C, anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 284', s);
          };
          h.querySelector('#cs').oninput = draw; draw();
        },
        caption: '分母是<b>全部結果數</b>（骰子永遠是 6），分子才隨條件改變。',
        example: {
          q: '丟一顆公正骰子，出現<b>大於 4</b> 的機率？',
          steps: ['全部結果 \\(6\\) 種。', '大於 4 的有 \\(5,6\\) 共 \\(2\\) 種。', '\\(P=\\dfrac{2}{6}=\\dfrac13\\)。'],
          ans: '\\(\\dfrac{1}{3}\\)'
        }
      },

      {
        sec: '2-3', secName: '古典機率',
        title: '兩步驟問題：先用樹狀圖<b>數清總數</b>再算',
        points: [
          '兩次動作 ⇒ 總結果數 ＝ 第一次 × 第二次。',
          '兩顆骰子共 \\(6\\times6=36\\) 種；重點是<b>把符合條件的組合數清楚</b>。',
          '拖滑桿看「點數和」等於各個值時，有幾種組合。'
        ],
        formula: { label: '兩顆骰子', tex: 'n(S)=6\\times6=36' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>點數和 ＝ <span class="ival" id="tv">7</span></label>
            <input type="range" id="ts" min="2" max="12" step="1" value="7"></div></div>`;
          const draw = () => {
            const t = +h.querySelector('#ts').value;
            h.querySelector('#tv').textContent = t;
            const cw = 46, x0 = 88, y0 = 44;
            let hit = 0;
            let s = TX(220, 20, '兩顆骰子的 36 種組合（列＝第一顆、行＝第二顆）', { fs: 12.5, c: C, anchor: 'middle' });
            for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
              const ok = a + b === t; if (ok) hit++;
              const x = x0 + (b - 1) * cw, y = y0 + (a - 1) * 28;
              s += `<rect x="${x}" y="${y}" width="${cw - 4}" height="24" rx="5" fill="${ok ? 'rgba(5,150,105,.20)' : '#f6f8fc'}" stroke="${ok ? GRN : '#e6ebf3'}" stroke-width="${ok ? 2 : 1}"/>`;
              s += TX(x + (cw - 4) / 2, y + 17, `${a + b}`, { fs: 12, c: ok ? GRN : '#9aa4b6', anchor: 'middle', fw: ok ? 900 : 700 });
            }
            for (let a = 1; a <= 6; a++) s += TX(x0 - 10, y0 + (a - 1) * 28 + 17, `${a}`, { fs: 12, c: '#8a94a6', anchor: 'end', fw: 700 });
            for (let b = 1; b <= 6; b++) s += TX(x0 + (b - 1) * cw + (cw - 4) / 2, y0 - 6, `${b}`, { fs: 12, c: '#8a94a6', anchor: 'middle', fw: 700 });
            const g = (p, q) => q ? g(q, p % q) : p;
            const d = g(hit, 36);
            s += BOX(24, 222, 392, 46, { fill: '#eef7f2', stroke: '#bfe0d1' });
            s += TX(220, 251, `和為 ${t} 有 ${hit} 種 ⇒ P ＝ ${hit}/36 ＝ ${hit / d}/${36 / d}`, { fs: 16, c: GRN, anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 278', s);
          };
          h.querySelector('#ts').oninput = draw; draw();
        },
        caption: '和為 <b>7</b> 的組合最多（6 種）——這就是為什麼骰子遊戲常押 7。',
        example: {
          q: '同時丟兩顆公正骰子，點數<b>和為 5</b> 的機率？',
          steps: ['總數 \\(6\\times6=36\\)。', '和為 5：\\((1,4),(2,3),(3,2),(4,1)\\) 共 \\(4\\) 種。', '\\(P=\\dfrac{4}{36}=\\dfrac19\\)。'],
          ans: '\\(\\dfrac{1}{9}\\)'
        }
      },

      {
        sec: '2-3', secName: '古典機率',
        title: '不對稱的物體：機率要靠<b>實驗</b>去估',
        points: [
          '圖釘、爻杯、圓錐這類物體<b>各面機會不相等</b>，不能直接用「\\(1\\div\\) 面數」。',
          '作法：<b>多次實驗</b>，用 \\(\\dfrac{\\text{發生次數}}{\\text{總次數}}\\) 去<b>估計</b>機率。',
          '拖滑桿增加實驗次數，看估計值怎麼慢慢<b>穩定下來</b>。'
        ],
        formula: { label: '用相對次數估計', tex: 'P\\approx\\dfrac{\\text{發生次數}}{\\text{實驗總次數}}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="fig"></div>
            <div class="ictrl"><label>實驗次數 ＝ <span class="ival" id="nv">20</span></label>
            <input type="range" id="ns" min="0" max="6" step="1" value="1"></div></div>`;
          // 固定的模擬結果（真實機率約 0.62），次數愈多愈接近
          const trials = [10, 20, 50, 100, 200, 500, 1000];
          const ratio = [0.40, 0.55, 0.66, 0.59, 0.635, 0.616, 0.622];
          const draw = () => {
            const i = +h.querySelector('#ns').value;
            h.querySelector('#nv').textContent = trials[i];
            const x0 = 52, y0 = 34, w = 344, hh = 132;
            const X = k => x0 + k / (trials.length - 1) * w;
            const Y = r => y0 + (1 - r) * hh;
            let s = `<rect x="${x0}" y="${y0}" width="${w}" height="${hh}" fill="#fff" stroke="#e6ebf3" stroke-width="1.4"/>`;
            [0, 0.5, 1].forEach(r => {
              s += `<line x1="${x0}" y1="${Y(r)}" x2="${x0 + w}" y2="${Y(r)}" stroke="#eef2f8" stroke-width="1"/>`;
              s += TX(x0 - 8, Y(r) + 4, r.toFixed(1), { fs: 11, c: '#8a94a6', anchor: 'end', fw: 700 });
            });
            // 真實機率參考線
            s += `<line x1="${x0}" y1="${Y(0.62)}" x2="${x0 + w}" y2="${Y(0.62)}" stroke="${GRN}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
            s += TX(x0 + w - 2, Y(0.62) - 7, '真實機率 ≈ 0.62', { fs: 11, c: GRN, anchor: 'end' });
            let d = '';
            for (let k = 0; k <= i; k++) d += (k ? 'L' : 'M') + X(k).toFixed(1) + ',' + Y(ratio[k]).toFixed(1) + ' ';
            s += `<path d="${d}" fill="none" stroke="${C}" stroke-width="2.6"/>`;
            for (let k = 0; k <= i; k++) s += `<circle cx="${X(k).toFixed(1)}" cy="${Y(ratio[k]).toFixed(1)}" r="4.5" fill="${C}"/>`;
            trials.forEach((t, k) => { if (k % 2 === 0) s += TX(X(k), y0 + hh + 18, `${t}`, { fs: 10.5, c: '#8a94a6', anchor: 'middle', fw: 700 }); });
            s += TX(220, y0 + hh + 36, '實驗次數', { fs: 11.5, c: '#8a94a6', anchor: 'middle' });
            s += BOX(24, 210, 392, 48, { fill: '#f4efff', stroke: '#ddd0f5' });
            s += TX(220, 232, `丟 ${trials[i]} 次，針尖朝上 ${Math.round(trials[i] * ratio[i])} 次 ⇒ 估計 ${ratio[i].toFixed(3)}`, { fs: 13.5, c: C, anchor: 'middle' });
            s += TX(220, 251, i >= 4 ? '★ 次數夠多時，估計值就穩定在真實機率附近' : '次數太少，估計值忽高忽低',
              { fs: 12.5, c: i >= 4 ? GRN : AMB, anchor: 'middle' });
            h.querySelector('#fig').innerHTML = svg('0 0 440 268', s);
          };
          h.querySelector('#ns').oninput = draw; draw();
        },
        caption: '對稱物體用<b>算</b>的（古典機率），不對稱物體只能用<b>做實驗</b>去估。',
        example: {
          q: '把圖釘丟 \\(200\\) 次，針尖朝上 \\(127\\) 次。估計針尖朝上的機率約多少？',
          steps: ['圖釘不對稱，不能用 \\(\\dfrac12\\)。', '用相對次數估計：\\(127\\div200=0.635\\)。'],
          ans: '約 \\(0.635\\)（\\(63.5\\%\\)）'
        }
      },

      {
        sec: '2-3', secName: '古典機率',
        title: '易錯：機率不是次數、分母要數全部、不對稱不能硬算',
        points: [
          '機率是<b>比值</b>不是次數——答案要寫 \\(\\dfrac{2}{6}\\) 或 \\(\\dfrac13\\)，不是「2 次」。',
          '分母是<b>所有可能結果數</b>，兩顆骰子是 <b>36</b> 不是 12。',
          '不對稱的物體<b>不能</b>直接用「\\(1\\div\\) 面數」，要靠實驗估計。'
        ],
        visual: (h) => {
          const row = (bad, good) => `<div style="display:flex;gap:8px;align-items:stretch;margin-bottom:10px">
            <div style="flex:1;background:#fdeef2;border:1.5px solid #f3c4d0;border-radius:12px;padding:9px 12px">
              <div style="font-size:11.5px;font-weight:900;color:${RED};margin-bottom:3px">✗ 常見錯誤</div>
              <div style="font-size:14px;line-height:1.6">${bad}</div></div>
            <div style="flex:1;background:#eef7f2;border:1.5px solid #bfe0d1;border-radius:12px;padding:9px 12px">
              <div style="font-size:11.5px;font-weight:900;color:${GRN};margin-bottom:3px">✓ 正確</div>
              <div style="font-size:14px;line-height:1.6">${good}</div></div></div>`;
          h.innerHTML = `<div style="width:97%;margin:0 auto">
            ${row('骰子出現偶數的機率是「3」', '\\(P=\\dfrac{3}{6}=\\dfrac12\\)（是比值）')}
            ${row('兩顆骰子共 \\(6+6=12\\) 種', '共 \\(6\\times6=36\\) 種（相乘）')}
            ${row('圖釘針尖朝上機率 \\(=\\dfrac12\\)', '不對稱 ⇒ 要用<b>實驗</b>估計')}
            ${row('機率算出 \\(1.2\\)', '機率不可能 \\(>1\\)，一定算錯了')}
          </div>`;
          MJ(h);
        },
        caption: '寫完先自我檢查：<b>算出來有沒有介於 0 和 1 之間？</b>',
        example: {
          q: '袋中有 \\(3\\) 紅 \\(5\\) 白球，隨機抽一顆是紅球的機率？',
          steps: ['全部 \\(3+5=8\\) 顆。', '紅球 \\(3\\) 顆 ⇒ \\(P=\\dfrac{3}{8}\\)。'],
          ans: '\\(\\dfrac{3}{8}\\)'
        }
      }

    ]
  });
})();
