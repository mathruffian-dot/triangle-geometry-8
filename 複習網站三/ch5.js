/* ============ 第 5 章　統計資料處理 ============
   依康軒版第三冊課程計畫：5-1 資料整理與統計圖表（課綱代碼 D-8-1）
   範圍限制：只到累積次數、相對次數、累積相對次數；不使用「百分位數」一詞；
             不混入平均數／中位數／眾數（屬第2冊 5-2）。
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#e11d48';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }

  /* 全章共用一份資料：某班 40 人的數學小考成績（分 5 組、組距 10） */
  const GNAME = ['50~60', '60~70', '70~80', '80~90', '90~100'];
  const MID = [55, 65, 75, 85, 95];
  const FRQ = [4, 8, 12, 10, 6];              // 各組次數，總和 40
  const CUM = [4, 12, 24, 34, 40];            // 累積次數
  const REL = [0.10, 0.20, 0.30, 0.25, 0.15]; // 相對次數
  const CRL = [0.10, 0.30, 0.60, 0.85, 1.00]; // 累積相對次數
  const TOT = 40;

  // 小工具：文字與長方形
  const tx = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" font-size="${o.fs || 12}" font-weight="${o.fw || 700}" fill="${o.c || '#172033'}">${s}</text>`;
  const box = (x, y, w, ht, fill, stroke, sw = 2) =>
    `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0, w).toFixed(1)}" height="${Math.max(0, ht).toFixed(1)}" fill="${fill}" stroke="${stroke || 'none'}" stroke-width="${sw}"/>`;
  const pct = v => (v * 100).toFixed(0) + '%';

  window.DECK.push({
    ch: 5,
    title: '統計資料處理',
    color: C,
    sections: ["5-1 資料整理與統計圖表"],
    slides: [

      /* ---------- 5-1 分組：組距、組界、組中點 ---------- */
      {
        sec: '5-1', secName: '分組與組中點',
        title: '先定組距，再定組界；組中點是上下界的平均',
        points: [
          '分組三步驟：算<b>全距</b>（最大－最小）→ 決定<b>組距</b> → 由組距切出<span class="k">組界</span>。',
          '<b>組數 ≈ 全距 ÷ 組距</b>（除不盡要<b>進位</b>），一般分成 5~10 組最好讀。',
          '<span class="k">組中點</span>＝(組下界＋組上界)÷2，是這一組的代表數值。',
          '「<b>以上未滿</b>」分組：剛好落在組界上的資料算<b>上面那一組</b>；拖滑桿看組距的影響。'
        ],
        formula: { label: '組數與組中點', tex: '\\text{組數}\\approx\\dfrac{\\text{全距}}{\\text{組距}}\\ (\\text{進位});\\quad \\text{組中點}=\\dfrac{\\text{下界}+\\text{上界}}{2}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="gfig"></div>
            <div class="ictrl"><label>組距 <span class="ival" id="gv">10</span></label>
            <input type="range" id="gs" min="5" max="20" step="5" value="10"></div></div>`;
          const X = v => 40 + (v - 50) * (370 / 60);
          const draw = () => {
            const c = +h.querySelector('#gs').value;
            h.querySelector('#gv').textContent = c;
            const n = Math.ceil(46 / c);
            const top = 50 + n * c;
            let s = '';
            s += tx(220, 28, '資料：全班 40 人的成績，最小 52、最大 98', { fs: 13 });
            s += tx(220, 52, `全距 ＝ 98 － 52 ＝ 46　→　46 ÷ ${c} 進位 ＝ ${n} 組`, { fs: 12.5, c: '#657187' });
            s += SV.seg(X(50), 95, X(top), 95, '#c8d0dd', 3);
            s += SV.dot(X(52), 95, AMB, 5) + tx(X(52), 82, '52', { fs: 11, c: AMB });
            s += SV.dot(X(98), 95, AMB, 5) + tx(X(98), 82, '98', { fs: 11, c: AMB });
            for (let i = 0; i < n; i++) {
              const x0 = X(50 + i * c), x1 = X(50 + (i + 1) * c);
              s += box(x0, 130, x1 - x0 - 1.5, 55, i % 2 ? 'rgba(225,29,72,.10)' : 'rgba(225,29,72,.22)', C, 1.6);
            }
            for (let i = 0; i <= n; i++) {
              const xv = X(50 + i * c);
              s += SV.seg(xv, 185, xv, 197, '#5b6478', 1.8);
              if (n <= 6 || i % 2 === 0) s += tx(xv, 213, String(50 + i * c), { fs: 11, c: '#5b6478' });
            }
            s += tx(220, 232, '↑ 這些切點就是<tspan fill="' + C + '">組界</tspan>，分組採「以上未滿」', { fs: 11.5, c: '#657187' });
            const m0 = 50 + c / 2, mx = Math.min(370, Math.max(70, X(m0)));
            s += SV.dot(X(m0), 157, GRN, 5.5);
            s += SV.seg(X(m0), 162, mx, 252, GRN, 1.5, '4 3');
            s += tx(mx, 268, `組中點 ${m0}`, { fs: 12, c: GRN });
            s += tx(220, 288, `第一組組中點 ＝ (50 ＋ ${50 + c}) ÷ 2 ＝ ${m0}`, { fs: 12, c: GRN });
            h.querySelector('#gfig').innerHTML = svg('0 0 440 300', s);
          };
          h.querySelector('#gs').oninput = draw; draw();
        },
        caption: '組距一改，組界與組中點全部跟著改——<b>先定組距</b>才有後面的一切。',
        example: {
          q: '一筆資料最小 52、最大 98，若要分成 5 組，組距至少取多少（取整十）？',
          steps: ['全距 \\(=98-52=46\\)。', '\\(46\\div5=9.2\\)，取整十後組距為 \\(10\\)。', '從 50 起分：50~60、60~70、…、90~100 共 5 組。'],
          ans: '組距 10'
        }
      },

      /* ---------- 5-1 次數分配表 → 直方圖 → 折線圖 ---------- */
      {
        sec: '5-1', secName: '次數分配圖表',
        title: '次數分配表、直方圖、折線圖，是同一份資料的三種長相',
        points: [
          '<span class="k">次數分配表</span>：每一組各有幾筆資料；先畫記再數，最不容易漏。',
          '<span class="k">直方圖</span>：橫軸放<b>組界</b>、縱軸放次數，長條<b>相鄰不留空隙</b>（和長條圖不同）。',
          '<span class="k">次數分配折線圖</span>：把<b>各組中點</b>對應的次數連起來，<b>兩端各補一組落回 0</b>。',
          '拖滑桿看它們怎麼一步一步長出來——三種圖描述的是<b>同一份</b>資料。'
        ],
        formula: { label: '三種呈現方式', tex: '\\text{次數分配表}\\;\\to\\;\\text{直方圖}\\;\\to\\;\\text{次數分配折線圖}' },
        visual: (h) => {
          const X = v => 60 + (v - 45) * 6;
          const Y = f => 270 - f * 15;
          const axis = () => {
            let s = SV.seg(44, 270, 435, 270, '#5b6478', 2) + SV.seg(50, 275, 50, 55, '#5b6478', 2);
            for (let v = 50; v <= 100; v += 10) s += SV.seg(X(v), 270, X(v), 276, '#5b6478', 1.6) + tx(X(v), 292, String(v), { fs: 11, c: '#5b6478' });
            for (let f = 4; f <= 12; f += 4) s += SV.seg(46, Y(f), 50, Y(f), '#5b6478', 1.6) + tx(40, Y(f) + 4, String(f), { fs: 11, c: '#5b6478', a: 'end' });
            s += tx(430, 308, '分數（組界）', { fs: 11, c: '#5b6478', a: 'end' }) + tx(72, 46, '次數', { fs: 11, c: '#5b6478' });
            return s;
          };
          const steps = [
            { t: '先架好座標：橫軸放<b>組界</b>、縱軸放<b>次數</b>。', d: () => axis() },
            {
              t: '每組畫一條長條，長條<b>緊鄰不留空隙</b> → 次數分配直方圖。', d: k => {
                let s = '';
                for (let i = 0; i < 5; i++) {
                  const kk = Math.max(0, Math.min(1, k * 5 - i));
                  if (kk <= 0) continue;
                  const x0 = X(50 + i * 10), x1 = X(60 + i * 10), ht = FRQ[i] * 15 * kk;
                  s += box(x0, 270 - ht, x1 - x0, ht, 'rgba(225,29,72,.20)', C, 1.8);
                  if (kk > 0.85) s += tx((x0 + x1) / 2, 270 - ht - 7, String(FRQ[i]), { fs: 12, c: C });
                }
                return s;
              }
            },
            {
              t: '在每條長條<b>頂端正中央</b>點出組中點（55、65、75、85、95）。', d: k => {
                let s = '';
                for (let i = 0; i < 5; i++) {
                  const kk = Math.max(0, Math.min(1, k * 5 - i));
                  if (kk <= 0) continue;
                  s += SV.dot(X(MID[i]), Y(FRQ[i]), BLU, 2 + 3 * kk);
                }
                s += tx(300, 46, '● 組中點', { fs: 12, c: BLU });
                return s;
              }
            },
            {
              t: '連起來，並在<b>左右各補一組</b>落回 0 → 次數分配折線圖。', d: k => {
                const P = [[X(45), Y(0)]].concat(MID.map((m, i) => [X(m), Y(FRQ[i])])).concat([[X(105), Y(0)]]);
                let s = '';
                const n = P.length - 1;
                for (let i = 0; i < n; i++) {
                  const kk = Math.max(0, Math.min(1, k * n - i));
                  if (kk <= 0) break;
                  const p = P[i], q = P[i + 1];
                  s += SV.seg(p[0], p[1], p[0] + (q[0] - p[0]) * kk, p[1] + (q[1] - p[1]) * kk, BLU, 3);
                }
                s += SV.dot(X(45), Y(0), BLU, 4) + SV.dot(X(105), Y(0), BLU, 4);
                s += tx(X(45), 292, '45', { fs: 10, c: BLU }) + tx(X(105), 292, '105', { fs: 10, c: BLU });
                s += tx(300, 66, '兩端補 0，圖形才封閉', { fs: 11, c: BLU });
                return s;
              }
            }
          ];
          SV.stepper(h, '0 0 460 316', steps);
        },
        caption: '直方圖看<b>形狀</b>、折線圖看<b>趨勢</b>；資料完全一樣，只是換一種說法。',
        example: {
          q: '成績分成 50~60、60~70、70~80、80~90、90~100 五組，次數 4、8、12、10、6，畫次數分配折線圖時最高點的橫坐標是多少？',
          steps: ['次數最多的一組是 70~80，共 12 人。', '折線圖用<b>組中點</b>描點，這組組中點 \\(=(70+80)\\div2=75\\)。'],
          ans: '橫坐標 75'
        }
      },

      /* ---------- 5-1 累積次數 ---------- */
      {
        sec: '5-1', secName: '累積次數',
        title: '累積次數＝從第一組一路加下來，最後一格必等於總次數',
        points: [
          '<span class="k">累積次數</span>：把第一組到<b>這一組為止</b>的次數全部加起來。',
          '它回答的是「<b>某個分數以下</b>共有幾個人」，不是「這一組有幾個人」。',
          '<b>自我檢查</b>：最後一組的累積次數一定 ＝ 總筆數（這裡是 40），不等就是加錯了。',
          '拖滑桿一組一組累加，看數字怎麼疊上去。'
        ],
        formula: { label: '逐組累加', tex: '\\text{某組累積次數}=\\text{第一組到該組的次數總和},\\qquad \\text{末組}=\\text{總次數}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="cfig"></div>
            <div class="ictrl"><label>累到第 <span class="ival" id="cv">3</span> 組</label>
            <input type="range" id="cs" min="1" max="5" step="1" value="3"></div></div>`;
          const X = v => 55 + (v - 50) * 6.9;
          const draw = () => {
            const k = +h.querySelector('#cs').value;
            h.querySelector('#cv').textContent = k;
            let s = SV.seg(50, 245, 420, 245, '#5b6478', 2);
            for (let i = 0; i < 5; i++) {
              const x0 = X(50 + i * 10), x1 = X(60 + i * 10), ht = FRQ[i] * 13, on = i < k;
              s += box(x0, 245 - ht, x1 - x0 - 1, ht, on ? 'rgba(225,29,72,.24)' : 'rgba(150,160,175,.10)', on ? C : '#aab3c1', 1.8);
              s += tx((x0 + x1) / 2, 245 - ht - 7, String(FRQ[i]), { fs: 12, c: on ? C : '#aab3c1' });
              s += tx((x0 + x1) / 2, 263, GNAME[i], { fs: 10.5, c: '#657187' });
            }
            s += tx(235, 32, `${FRQ.slice(0, k).join(' ＋ ')} ＝ ${CUM[k - 1]}`, { fs: 15, c: C });
            s += tx(235, 56, `→ ${50 + k * 10} 分以下共 ${CUM[k - 1]} 人`, { fs: 12.5, c: '#657187' });
            s += (k === 5)
              ? tx(235, 290, '最後一格 ＝ 總次數 40　✓ 檢查通過', { fs: 12.5, c: GRN })
              : tx(235, 290, `尚未累到的還有 ${TOT - CUM[k - 1]} 人`, { fs: 12, c: '#657187' });
            h.querySelector('#cfig').innerHTML = svg('0 0 470 300', s);
          };
          h.querySelector('#cs').oninput = draw; draw();
        },
        caption: '紅色的長條是「已經加進來的組」；累積次數只會越加越多，不會變小。',
        example: {
          q: '各組次數依序為 4、8、12、10、6，求第 4 組的累積次數。',
          steps: ['從第一組加到第四組：\\(4+8+12+10\\)。', '\\(=34\\)，代表 90 分以下共 34 人。'],
          ans: '\\(34\\) 人'
        }
      },

      /* ---------- 5-1 累積次數分配折線圖 ---------- */
      {
        sec: '5-1', secName: '累積次數折線圖',
        title: '累積次數折線圖：用「組上界」描點，圖形只會往上',
        points: [
          '描點規則：橫坐標放<b>組上界</b>（不是組中點！），縱坐標放該組的<b>累積次數</b>。',
          '左端要從「<b>第一組的下界，累積次數 0</b>」開始，右端最後一點的高度＝總次數。',
          '因為次數不會是負的，所以圖形<b>只會持平或上升</b>，絕不會往下掉。',
          '拖滑桿讀圖：由橫軸往上、再往左，就能讀出「幾分以下有幾人」。'
        ],
        formula: { label: '描點座標', tex: '(\\text{組上界},\\ \\text{累積次數})\\quad\\text{起點}=(\\text{第一組下界},\\,0)' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="ofig"></div>
            <div class="ictrl"><label>讀取分數 <span class="ival" id="ov">80</span> 分</label>
            <input type="range" id="os" min="50" max="100" step="1" value="80"></div></div>`;
          const X = v => 65 + (v - 50) * 7;
          const Y = c => 250 - c * 4.5;
          const P = [[50, 0], [60, 4], [70, 12], [80, 24], [90, 34], [100, 40]];
          const at = x => {
            for (let i = 0; i < P.length - 1; i++) {
              if (x <= P[i + 1][0]) {
                const t = (x - P[i][0]) / (P[i + 1][0] - P[i][0]);
                return P[i][1] + (P[i + 1][1] - P[i][1]) * t;
              }
            }
            return 40;
          };
          const draw = () => {
            const x = +h.querySelector('#os').value;
            h.querySelector('#ov').textContent = x;
            const y = at(x);
            let s = '';
            for (let c = 10; c <= 40; c += 10) s += SV.seg(65, Y(c), 420, Y(c), '#e9eef6', 1) + tx(58, Y(c) + 4, String(c), { fs: 11, c: '#96a0b3', a: 'end' });
            s += SV.seg(60, 250, 428, 250, '#5b6478', 2) + SV.seg(65, 256, 65, 58, '#5b6478', 2);
            for (let v = 50; v <= 100; v += 10) s += SV.seg(X(v), 250, X(v), 256, '#5b6478', 1.6) + tx(X(v), 272, String(v), { fs: 11, c: '#5b6478' });
            s += tx(424, 288, '組上界', { fs: 11, c: '#5b6478', a: 'end' }) + tx(96, 50, '累積次數', { fs: 11, c: '#5b6478' });
            const pl = P.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ');
            s += `<polyline points="${pl}" fill="none" stroke="${C}" stroke-width="3" stroke-linejoin="round"/>`;
            P.forEach(p => { s += SV.dot(X(p[0]), Y(p[1]), C, 4.5); });
            s += tx(X(100) + 4, Y(40) - 10, '最後一點 ＝ 40', { fs: 11, c: GRN, a: 'end' });
            s += SV.seg(X(x), 250, X(x), Y(y), BLU, 2, '5 4') + SV.seg(65, Y(y), X(x), Y(y), BLU, 2, '5 4');
            s += SV.dot(X(x), Y(y), BLU, 5.5);
            const yr = Math.round(y * 10) / 10;
            s += tx(240, 30, `${x} 分以下 約 ${Number.isInteger(yr) ? yr : yr.toFixed(1)} 人`, { fs: 14, c: BLU });
            h.querySelector('#ofig').innerHTML = svg('0 0 460 296', s);
          };
          h.querySelector('#os').oninput = draw; draw();
        },
        caption: '折線一路往右上爬，最後停在總次數 40——這是判斷畫對沒有的最快方法。',
        example: {
          q: '累積次數折線圖上有一點 \\((80,\\,24)\\)，另一點 \\((90,\\,34)\\)，問 80 分以上未滿 90 分有幾人？',
          steps: ['兩點的縱坐標分別是「80 分以下」與「90 分以下」的人數。', '相減：\\(34-24=10\\)。'],
          ans: '\\(10\\) 人'
        }
      },

      /* ---------- 5-1 相對次數 ---------- */
      {
        sec: '5-1', secName: '相對次數',
        title: '相對次數＝次數÷總次數，全部加起來一定是 1',
        points: [
          '<span class="k">相對次數</span>＝該組次數 ÷ 總次數，是這一組<b>占全體的比率</b>。',
          '寫成小數或百分率都可以（0.30 ＝ 30%），但同一張表要<b>統一</b>。',
          '<b>檢查點</b>：所有組的相對次數<b>總和必為 1</b>（100%）；四捨五入後也要湊回 1。',
          '相對次數把「人數」換成「比率」，才有辦法跟別的組比較。'
        ],
        formula: { label: '相對次數', tex: '\\text{相對次數}=\\dfrac{\\text{該組次數}}{\\text{總次數}},\\qquad \\text{各組相對次數總和}=1' },
        visual: (h) => {
          const cell = 'border:1px solid #e6d3d8;padding:6px 8px';
          const rows = GNAME.map((g, i) => `
            <tr${i % 2 ? ' style="background:#fdf5f7"' : ''}>
              <td style="${cell}">${g}</td>
              <td style="${cell}">${FRQ[i]}</td>
              <td style="${cell};color:${C};font-weight:900">${REL[i].toFixed(2)}</td>
              <td style="${cell}"><div style="height:11px;border-radius:6px;background:${C};opacity:.75;width:${(REL[i] / 0.30 * 100).toFixed(0)}%"></div></td>
            </tr>`).join('');
          h.innerHTML = `<div style="width:96%;margin:0 auto">
            <table style="width:100%;border-collapse:collapse;font-size:12.5px;text-align:center">
              <tr style="background:#fdeef2">
                <th style="${cell}">組別（以上未滿）</th>
                <th style="${cell}">次數</th>
                <th style="${cell}">相對次數</th>
                <th style="${cell}">占比</th>
              </tr>
              ${rows}
              <tr style="background:#eef7f2;font-weight:900">
                <td style="${cell}">合計</td>
                <td style="${cell}">40</td>
                <td style="${cell};color:${GRN}">1.00</td>
                <td style="${cell};color:${GRN}">100%</td>
              </tr>
            </table>
            <div style="margin-top:10px;font-size:12.5px;color:#657187;text-align:center;line-height:1.6">
              每一格都是「次數 ÷ 40」，例如 \\(12\\div40=0.30\\)。<br>
              <b style="color:${GRN}">合計那一列不是 1，整張表就有問題。</b></div>
          </div>`;
          if (window.MJ) MJ(h);
        },
        caption: '同一張表左邊看「幾個人」、右邊看「占幾成」，兩種語言互相翻譯。',
        example: {
          q: '全班 40 人，70 分以上未滿 80 分有 12 人，求這一組的相對次數與百分率。',
          steps: ['相對次數 \\(=\\dfrac{12}{40}=0.30\\)。', '化成百分率：\\(0.30\\times100\\%=30\\%\\)。'],
          ans: '\\(0.30\\)，即 \\(30\\%\\)'
        }
      },

      /* ---------- 5-1 相對次數的應用：比較兩組 ---------- */
      {
        sec: '5-1', secName: '相對次數的應用',
        title: '人數不同的兩班，要比相對次數才公平',
        points: [
          '人數不同時，<b>次數多不代表比例高</b>——直接比次數會被總人數騙。',
          '把兩班都換成<span class="k">相對次數</span>，等於都換算成「每 100 人有幾人」，才站在同一條起跑線。',
          '例：90 分以上，甲班 6 人、乙班 5 人；但甲班 40 人、乙班 25 人。',
          '拖滑桿從「看次數」切換到「看相對次數」，結論會<b>整個反過來</b>。'
        ],
        formula: { label: '公平比較', tex: '\\dfrac{6}{40}=15\\%\\;<\\;\\dfrac{5}{25}=20\\%' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="mfig"></div>
            <div class="ictrl"><label>顯示方式 <span class="ival" id="mv">看次數</span></label>
            <input type="range" id="ms" min="0" max="1" step="0.02" value="0"></div></div>`;
          const F2 = [2, 4, 7, 7, 5], R2 = [0.08, 0.16, 0.28, 0.28, 0.20];
          const x0 = 60, gw = 74, base = 250, H = 165;
          const draw = () => {
            const t = +h.querySelector('#ms').value;
            h.querySelector('#mv').textContent = t < 0.5 ? '看次數' : '看相對次數';
            let s = SV.seg(50, base, 440, base, '#5b6478', 2);
            for (let i = 0; i < 5; i++) {
              const cx = x0 + gw * i + gw / 2;
              const vA = (1 - t) * FRQ[i] / 12 + t * REL[i] / 0.30;
              const vB = (1 - t) * F2[i] / 12 + t * R2[i] / 0.30;
              const hA = vA * H, hB = vB * H;
              s += box(cx - 30, base - hA, 28, hA, 'rgba(225,29,72,.28)', C, 1.6);
              s += box(cx + 2, base - hB, 28, hB, 'rgba(37,99,235,.24)', BLU, 1.6);
              const lA = t < 0.5 ? String(FRQ[i]) : pct(REL[i]);
              const lB = t < 0.5 ? String(F2[i]) : pct(R2[i]);
              s += tx(cx - 16, base - hA - 6, lA, { fs: 10.5, c: C });
              s += tx(cx + 16, base - hB - 6, lB, { fs: 10.5, c: BLU });
              s += tx(cx, base + 18, GNAME[i], { fs: 10, c: '#657187' });
            }
            s += box(60, 24, 14, 14, 'rgba(225,29,72,.28)', C, 1.6) + tx(80, 36, '甲班 40 人', { fs: 11.5, c: C, a: 'start' });
            s += box(190, 24, 14, 14, 'rgba(37,99,235,.24)', BLU, 1.6) + tx(210, 36, '乙班 25 人', { fs: 11.5, c: BLU, a: 'start' });
            s += (t < 0.5)
              ? tx(245, 62, '看次數：90 分以上 甲 6 人 ＞ 乙 5 人 → 好像甲班強', { fs: 12.5, c: '#657187' })
              : tx(245, 62, '看相對次數：甲 15% ＜ 乙 20% → 其實乙班比例高', { fs: 12.5, c: GRN });
            s += tx(245, 292, t < 0.5 ? '⚠ 人數不同，這樣比不公平' : '✓ 換成比率後才可以比', { fs: 12.5, c: t < 0.5 ? C : GRN });
            h.querySelector('#mfig').innerHTML = svg('0 0 470 305', s);
          };
          h.querySelector('#ms').oninput = draw; draw();
        },
        caption: '同一組資料，換個尺度就換個結論——這就是相對次數存在的理由。',
        example: {
          q: '甲班 40 人有 6 人 90 分以上，乙班 25 人有 5 人 90 分以上，哪一班高分比例較高？',
          steps: ['甲班：\\(6\\div40=0.15=15\\%\\)。', '乙班：\\(5\\div25=0.20=20\\%\\)。', '\\(20\\%>15\\%\\)。'],
          ans: '乙班比例較高'
        }
      },

      /* ---------- 5-1 累積相對次數 ---------- */
      {
        sec: '5-1', secName: '累積相對次數',
        title: '累積相對次數折線圖：讀「某分數以下占全體幾成」',
        points: [
          '<span class="k">累積相對次數</span>＝累積次數 ÷ 總次數，也等於把相對次數逐組加起來。',
          '描點一樣用<b>組上界</b>，縱軸從 0 到 1；<b>最後一點必定是 1（100%）</b>。',
          '這張圖專門回答：「<b>某個數值以下占全體的比率</b>是多少？」反過來也能問「幾成的人在幾分以下」。',
          '拖滑桿讀圖，注意<b>折線越陡</b>的地方，代表那一段的人數越集中。'
        ],
        formula: { label: '累積相對次數', tex: '\\text{累積相對次數}=\\dfrac{\\text{累積次數}}{\\text{總次數}},\\qquad \\text{末點}=1' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="rfig"></div>
            <div class="ictrl"><label>讀取分數 <span class="ival" id="rv">80</span> 分</label>
            <input type="range" id="rs" min="50" max="100" step="1" value="80"></div></div>`;
          const X = v => 68 + (v - 50) * 6.9;
          const Y = r => 250 - r * 178;
          const P = [[50, 0], [60, 0.10], [70, 0.30], [80, 0.60], [90, 0.85], [100, 1.00]];
          const at = x => {
            for (let i = 0; i < P.length - 1; i++) {
              if (x <= P[i + 1][0]) {
                const t = (x - P[i][0]) / (P[i + 1][0] - P[i][0]);
                return P[i][1] + (P[i + 1][1] - P[i][1]) * t;
              }
            }
            return 1;
          };
          const draw = () => {
            const x = +h.querySelector('#rs').value;
            h.querySelector('#rv').textContent = x;
            const y = at(x);
            let s = '';
            [0.25, 0.5, 0.75, 1].forEach(r => {
              s += SV.seg(68, Y(r), 420, Y(r), r === 1 ? '#cfe8dd' : '#e9eef6', r === 1 ? 2 : 1);
              s += tx(60, Y(r) + 4, pct(r), { fs: 11, c: r === 1 ? GRN : '#96a0b3', a: 'end' });
            });
            s += SV.seg(62, 250, 428, 250, '#5b6478', 2) + SV.seg(68, 256, 68, 58, '#5b6478', 2);
            for (let v = 50; v <= 100; v += 10) s += SV.seg(X(v), 250, X(v), 256, '#5b6478', 1.6) + tx(X(v), 272, String(v), { fs: 11, c: '#5b6478' });
            s += tx(424, 288, '組上界', { fs: 11, c: '#5b6478', a: 'end' });
            const pl = P.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ');
            s += `<polygon points="${X(50)},${Y(0)} ${pl} ${X(100)},${Y(0)}" fill="rgba(225,29,72,.07)" stroke="none"/>`;
            s += `<polyline points="${pl}" fill="none" stroke="${C}" stroke-width="3" stroke-linejoin="round"/>`;
            P.forEach(p => { s += SV.dot(X(p[0]), Y(p[1]), C, 4.5); });
            s += tx(X(100) - 4, Y(1) - 10, '末點必為 100%', { fs: 11, c: GRN, a: 'end' });
            s += SV.seg(X(x), 250, X(x), Y(y), BLU, 2, '5 4') + SV.seg(68, Y(y), X(x), Y(y), BLU, 2, '5 4');
            s += SV.dot(X(x), Y(y), BLU, 5.5);
            const pr = Math.round(y * 1000) / 10;
            s += tx(245, 30, `${x} 分以下 約占全體 ${Number.isInteger(pr) ? pr : pr.toFixed(1)}%`, { fs: 14, c: BLU });
            h.querySelector('#rfig').innerHTML = svg('0 0 460 296', s);
          };
          h.querySelector('#rs').oninput = draw; draw();
        },
        caption: '縱軸是比率不是人數；線爬到頂端 100%，代表全部資料都被算進去了。',
        example: {
          q: '五組的相對次數依序 0.10、0.20、0.30、0.25、0.15，求 80 分以下占全體的比率。',
          steps: ['80 分以下＝前三組：\\(0.10+0.20+0.30\\)。', '\\(=0.60\\)。'],
          ans: '\\(0.60\\)，即六成'
        }
      },

      /* ---------- 5-1 易錯提醒 ---------- */
      {
        sec: '5-1', secName: '易錯提醒',
        title: '這一章最容易被扣分的四個地方',
        points: [
          '描點規則<b>不一樣</b>：次數折線圖用<span class="k">組中點</span>，累積折線圖用<span class="k">組上界</span>。',
          '累積次數是<b>加總</b>，一定大於等於該組次數，而且<b>只增不減</b>。',
          '人數不同的兩組資料，一定要先換成<b>相對次數</b>再比較。',
          '交卷前檢查<b>兩個終點</b>：累積次數末格＝總次數、累積相對次數末格＝1。'
        ],
        formula: { label: '兩個必檢查的終點', tex: '\\text{末組累積次數}=\\text{總次數},\\quad \\text{末組累積相對次數}=1' },
        visual: (h) => {
          const pair = (bad, good) => `
            <div style="display:flex;gap:8px;margin-bottom:9px">
              <div style="flex:1;background:#fdeef2;border:1.5px solid #f0c9d3;border-radius:11px;padding:8px 10px;font-size:12.5px;color:#172033;line-height:1.55">
                <b style="color:${C};font-size:14px">✗</b>　${bad}</div>
              <div style="flex:1;background:#eef7f2;border:1.5px solid #cfe8dd;border-radius:11px;padding:8px 10px;font-size:12.5px;color:#172033;line-height:1.55">
                <b style="color:${GRN};font-size:14px">✓</b>　${good}</div>
            </div>`;
          const list = [
            ['累積次數折線圖拿<b>組中點</b>描點', '累積次數用<b>組上界</b>描點'],
            ['折線圖畫成有升有降', '累積的圖只會<b>持平或上升</b>'],
            ['人數不同直接比<b>次數</b>', '換成<b>相對次數</b>再比'],
            ['相對次數總和 0.99 也算了', '總和一定要是 <b>1</b>（100%）']
          ];
          h.innerHTML = `<div style="width:96%;margin:0 auto">
            <div style="text-align:center;font-size:12px;font-weight:900;color:#657187;letter-spacing:.06em;margin-bottom:9px">錯誤寫法　vs　正確寫法</div>
            ${list.map(p => pair(p[0], p[1])).join('')}
            <div style="margin-top:4px;text-align:center;font-size:12.5px;color:#657187">
              套回本章這筆 40 人的資料：累積次數末格要是 <b style="color:${GRN}">40</b>、
              累積相對次數末格要是 <b style="color:${GRN}">1.00</b>——不是就重算。</div>
          </div>`;
        },
        caption: '一句話記：<b>次數</b>折線圖用組中點，<b>累積</b>折線圖用組上界。',
        example: {
          q: '某生畫的累積次數折線圖，最後一點的縱坐標是 36，但全班有 40 人，問題出在哪？',
          steps: ['累積次數的最後一格必須等於總次數。', '\\(36\\neq40\\)，代表有一組次數漏加或加錯。'],
          ans: '少了 4 人，累加有誤'
        }
      }
    ]
  });
})();
