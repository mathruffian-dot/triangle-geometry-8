/* ============ 第 5 章　統計 ============
   依康軒版第二冊（七下）：5-1 統計圖表、5-2 平均數、中位數與眾數
   課綱代碼：D-7-1、D-7-2
   ============================================================ */
window.DECK = window.DECK || [];
(function () {
  const C = '#e11d48';
  const RED = '#e11d48', GRN = '#059669', BLU = '#2563eb', VIO = '#7c3aed', AMB = '#d97706';

  function svg(vb, inner) { return `<div style="width:100%;text-align:center"><svg viewBox="${vb}" style="max-width:100%">${inner}</svg></div>`; }

  // 扇形：a0 為起始方向（數學角度，90＝正上方），順時針掃 sweep 度
  function sector(cx, cy, r, a0, sweep, fill) {
    if (sweep >= 359.9) return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="#fff" stroke-width="2.5"/>`;
    const p0 = SV.pt(cx, cy, r, a0), p1 = SV.pt(cx, cy, r, a0 - sweep);
    const large = sweep > 180 ? 1 : 0;
    return `<path d="M${cx},${cy} L${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${r},${r} 0 ${large} 1 ${p1[0].toFixed(1)},${p1[1].toFixed(1)} Z" fill="${fill}" stroke="#fff" stroke-width="2.5"/>`;
  }
  // 一組直立長條（gap＝0 就是直方圖那種不留空隙）
  // edge=true 時，labels 有 n+1 個，標在「組界」上（直方圖的正確標法）；否則標在長條中央
  function barGroup(x0, yBase, totalW, vals, maxV, H, gapRatio, color, labels, edge) {
    const n = vals.length, cell = totalW / n, bw = cell * (1 - gapRatio);
    let s = '';
    vals.forEach((v, i) => {
      const bh = v / maxV * H, x = x0 + i * cell + (cell - bw) / 2;
      s += `<rect x="${x.toFixed(1)}" y="${(yBase - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${color}" opacity="0.8" stroke="#fff" stroke-width="1.4"/>`;
      if (!edge) s += `<text x="${(x0 + i * cell + cell / 2).toFixed(1)}" y="${yBase + 18}" text-anchor="middle" font-size="11" fill="#7b8598">${labels[i]}</text>`;
    });
    if (edge) labels.forEach((t, i) => {
      s += `<text x="${(x0 + i * cell).toFixed(1)}" y="${yBase + 18}" text-anchor="middle" font-size="10.5" fill="#7b8598">${t}</text>`;
    });
    return s;
  }

  window.DECK.push({
    ch: 5,
    title: '統計',
    color: C,
    sections: ['5-1 統計圖表', '5-2 平均數、中位數與眾數'],
    slides: [

      /* ---------- 5-1 統計圖表 ---------- */
      {
        sec: '5-1', secName: '統計圖表',
        title: '統計的四個動作：蒐集 → 整理 → 呈現 → 解讀',
        points: [
          '統計不是只有畫圖：<span class="k">蒐集</span>→<span class="k">整理</span>→<span class="k">呈現</span>→<span class="k">解讀</span>，四步一條龍。',
          '會考真正考的是<b>最後一步</b>：從圖表讀出「最多、最少、占幾成、上升還下降」。',
          '<b>先想清楚要回答什麼問題</b>，再決定畫哪一種圖——圖選錯，資料再多也看不出重點。'
        ],
        formula: { label: '統計流程', tex: '\\text{蒐集}\\to\\text{整理}\\to\\text{呈現}\\to\\text{解讀}' },
        visual: (h) => {
          const defs = `<defs><marker id="flow5" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#9aa4b6"/></marker></defs>`;
          const card = (i, y, ttl, sub, col, fillc) => `
            <rect x="82" y="${y}" width="278" height="52" rx="14" fill="${fillc}" stroke="${col}" stroke-width="2.2"/>
            <circle cx="82" cy="${y + 26}" r="15" fill="${col}"/>
            <text x="82" y="${y + 31}" text-anchor="middle" font-size="15" font-weight="900" fill="#fff">${i}</text>
            <text x="234" y="${y + 23}" text-anchor="middle" font-size="15.5" font-weight="900" fill="${col}">${ttl}</text>
            <text x="234" y="${y + 41}" text-anchor="middle" font-size="11.5" fill="#657187">${sub}</text>`;
          const arrow = y => `<line x1="221" y1="${y}" x2="221" y2="${y + 12}" stroke="#9aa4b6" stroke-width="3" marker-end="url(#flow5)"/>`;
          const wrap = (k, inner) => `<g opacity="${Math.max(0.08, k).toFixed(2)}">${inner}</g>`;
          SV.stepper(h, '0 0 440 300', [
            { t: '<b>蒐集</b>：先決定要問什麼，再去取得原始資料。', d: k => defs + wrap(k, card(1, 18, '蒐集資料', '問卷、量測、上網查統計資料', BLU, '#eef4ff')) },
            { t: '<b>整理</b>：分組、劃記、做成次數分配表。', d: k => wrap(k, arrow(72) + card(2, 88, '整理資料', '分組 → 劃記 → 數出各組次數', VIO, '#f3eefe')) },
            { t: '<b>呈現</b>：依資料性質選一種統計圖畫出來。', d: k => wrap(k, arrow(142) + card(3, 158, '呈現資料', '長條圖／直方圖／圓形圖／折線圖', AMB, '#fdf3e6')) },
            { t: '<b>解讀</b>：回答問題、下判斷——這才是重點。', d: k => wrap(k, arrow(212) + card(4, 228, '解讀並下判斷', '最多？占幾成？趨勢是升還是降？', C, '#fdeef2')) }
          ]);
        },
        caption: '整理與呈現只是手段，能不能<b>正確解讀</b>才是統計真正要的能力；<b>數據複雜時可用計算機輔助計算</b>。',
        example: {
          q: '「把 30 位同學的身高分成 5 組，數出每一組有幾個人」屬於哪一個步驟？',
          steps: ['取得身高數據是「蒐集」。', '分組並數出各組人數，是把原始資料變成表格。'],
          ans: '整理資料'
        }
      },

      {
        sec: '5-1', secName: '統計圖表',
        title: '次數分配表：先定組距，劃記，再數次數',
        points: [
          '把一堆數字分成幾個<span class="k">組</span>、數出每組有幾筆，就是<span class="k">次數分配表</span>。',
          '每組的寬度叫<b>組距</b>、兩端的數叫<b>組限</b>；各組<b>組距要一樣大</b>，不重疊也不遺漏。',
          '組數太少看不出分布、太多又太零碎；<b>拖滑桿改組距</b>，看同一份成績被切成什麼樣子。'
        ],
        formula: { label: '要分幾組', tex: '\\text{組數}\\approx\\dfrac{\\text{最大值}-\\text{最小值}}{\\text{組距}}\\ (\\text{不整除就進位})' },
        visual: (h) => {
          const data = [42, 55, 58, 61, 63, 65, 66, 68, 70, 71, 72, 73, 75, 76, 78, 80, 81, 83, 85, 88, 90, 92, 95, 97, 99];
          h.innerHTML = `<div style="width:100%"><div id="hist"></div>
            <div class="ictrl"><label>組距 <span class="ival" id="wv">10</span> 分</label>
            <input type="range" id="ws" min="5" max="20" step="5" value="10"></div></div>`;
          // 「正」字的五畫：依畫數 c（0~5）畫出部首，用於劃記
          const zheng = (x, y, c, col) => {
            const L = [
              [x + 1, y, x + 13, y],
              [x + 4, y, x + 4, y + 15],
              [x + 4, y + 8, x + 11, y + 8],
              [x + 11, y + 8, x + 11, y + 15],
              [x, y + 15, x + 14, y + 15]
            ];
            let o = '';
            for (let i = 0; i < c; i++)
              o += `<line x1="${L[i][0].toFixed(1)}" y1="${L[i][1]}" x2="${L[i][2].toFixed(1)}" y2="${L[i][3]}" stroke="${col}" stroke-width="2" stroke-linecap="round"/>`;
            return o;
          };
          // 以格子中心 cx 排出 ⌈c/5⌉ 個「正」字（最後一個只寫剩下的畫數）
          const tally = (cx, y, c, col) => {
            const g = Math.max(1, Math.ceil(c / 5)), U = 17;
            const sx = cx - (g * U - 3) / 2;
            let o = '';
            for (let i = 0; i < g; i++) o += zheng(sx + i * U, y, Math.min(5, c - i * 5), col);
            return o;
          };
          const draw = () => {
            const w = +h.querySelector('#ws').value;
            h.querySelector('#wv').textContent = w;
            const start = 40, n = Math.ceil((100 - start) / w);
            const cnt = new Array(n).fill(0);
            data.forEach(v => { let i = Math.floor((v - start) / w); if (i >= n) i = n - 1; if (i < 0) i = 0; cnt[i]++; });
            const maxc = Math.max.apply(null, cnt);
            const x0 = 48, xR = 424, yB = 144, bw = (xR - x0) / n, H = 98;
            let s = `<text x="222" y="17" text-anchor="middle" font-size="12.5" font-weight="800" fill="#172033">組距 ${w} 分　→　共 <tspan fill="${C}">${n}</tspan> 組（25 筆成績）</text>`;
            s += SV.seg(x0, yB, xR + 6, yB, '#5b6478', 2) + SV.seg(x0, yB, x0, 32, '#5b6478', 2);
            for (let i = 0; i < n; i++) {
              const bh = cnt[i] / maxc * H;
              s += `<rect x="${(x0 + i * bw).toFixed(1)}" y="${(yB - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${C}" opacity="0.75" stroke="#fff" stroke-width="1.5"/>`;
              if (cnt[i]) s += `<text x="${(x0 + i * bw + bw / 2).toFixed(1)}" y="${(yB - bh - 5).toFixed(1)}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#172033">${cnt[i]}</text>`;
            }
            const sk = n > 8 ? 2 : 1;
            for (let i = 0; i <= n; i += sk)
              s += `<text x="${(x0 + i * bw).toFixed(1)}" y="${yB + 15}" text-anchor="middle" font-size="10" fill="#7b8598">${start + i * w}</text>`;
            /* ---- 直方圖下方：即時重建的三欄次數分配表（組別／劃記／次數）---- */
            const y1 = 170, y2 = 192, y3 = 226, y4 = 248, cw = (xR - x0) / n;
            s += `<rect x="6" y="${y1}" width="${xR - 6}" height="${y4 - y1}" rx="6" fill="#fff" stroke="#cdd6e2" stroke-width="1.4"/>`;
            s += `<rect x="6" y="${y1}" width="42" height="${y4 - y1}" fill="#fafbfd"/>`;
            s += SV.seg(6, y2, xR, y2, '#dbe2ec', 1.2) + SV.seg(6, y3, xR, y3, '#dbe2ec', 1.2);
            s += SV.seg(x0, y1, x0, y4, '#cdd6e2', 1.4);
            for (let i = 1; i < n; i++) s += SV.seg(x0 + i * cw, y1, x0 + i * cw, y4, '#e9eef6', 1);
            s += `<text x="27" y="${y1 + 15}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#657187">組別</text>`;
            s += `<text x="27" y="${(y2 + y3) / 2 + 4}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${C}">劃記</text>`;
            s += `<text x="27" y="${y3 + 15}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#657187">次數</text>`;
            for (let i = 0; i < n; i++) {
              const cx = x0 + i * cw + cw / 2, lo = start + i * w;
              s += `<text x="${cx.toFixed(1)}" y="${y1 + 15}" text-anchor="middle" font-size="${cw >= 56 ? 10 : 9}" fill="#5b6478">${cw >= 56 ? `${lo}–${lo + w - 1}` : `${lo}~`}</text>`;
              s += tally(cx, y2 + 9, cnt[i], C);
              s += `<text x="${cx.toFixed(1)}" y="${y3 + 16}" text-anchor="middle" font-size="12" font-weight="900" fill="#172033">${cnt[i]}</text>`;
            }
            s += `<text x="222" y="267" text-anchor="middle" font-size="11" fill="#657187">劃記每 5 筆湊成一個「正」字，數完再把次數填進表（次數合計 25）</text>`;
            h.querySelector('#hist').innerHTML = svg('0 0 440 280', s);
          };
          h.querySelector('#ws').oninput = draw; draw();
        },
        caption: '拖滑桿改組距，<b>直方圖與下方的次數分配表一起重建</b>——劃記是「整理」這一步的產物。',
        example: {
          q: '25 筆成績最低 42、最高 99，組距取 10 要分成幾組？這 25 筆的<b>中位數</b>落在哪一組？',
          steps: [
            '\\(99-42=57\\)，\\(57\\div10=5.7\\)，不整除進位 → 6 組（40–49、50–59、…、90–99）。',
            '25 筆是奇數，中位數是排序後第 \\(\\dfrac{25+1}{2}=13\\) 筆。',
            '由表：各組次數 1、2、5、7、5、5；前三組共 \\(1+2+5=8\\) 筆，第 9～15 筆都在第四組。'
          ],
          ans: '共 6 組；中位數（第 13 筆）落在 <b>70–79</b> 這一組'
        }
      },

      {
        sec: '5-1', secName: '統計圖表',
        title: '長條圖比類別、直方圖看分布，差別在有沒有空隙',
        points: [
          '<b>長條圖</b>畫的是<span class="k">類別</span>（血型、社團、飲料），長條之間<b>要留空隙</b>。',
          '<b>直方圖</b>畫的是<span class="k">分組後的連續資料</span>（身高、成績），長方形<b>緊緊相連不留空隙</b>。',
          '一秒判斷：橫軸寫的是<b>名稱</b>就用長條圖，寫的是<b>數值區間</b>就用直方圖。'
        ],
        formula: { label: '一句話分辨', tex: '\\text{橫軸是名稱}\\Rightarrow\\text{長條圖};\\quad\\text{橫軸是區間}\\Rightarrow\\text{直方圖}' },
        visual: (h) => {
          const yB = 228;
          let s = '';
          s += `<text x="120" y="40" text-anchor="middle" font-size="14.5" font-weight="900" fill="${BLU}">長條圖（類別）</text>`;
          s += `<text x="340" y="40" text-anchor="middle" font-size="14.5" font-weight="900" fill="${C}">直方圖（連續）</text>`;
          s += SV.seg(28, yB, 216, yB, '#5b6478', 2) + SV.seg(28, yB, 28, 56, '#5b6478', 2);
          s += barGroup(32, yB, 180, [12, 8, 14, 4], 14, 150, 0.42, BLU, ['A', 'B', 'O', 'AB']);
          s += SV.seg(248, yB, 436, yB, '#5b6478', 2) + SV.seg(248, yB, 248, 56, '#5b6478', 2);
          s += barGroup(252, yB, 180, [4, 9, 11, 6], 14, 150, 0, C, ['150', '155', '160', '165', '170'], true);
          s += `<text x="120" y="268" text-anchor="middle" font-size="12" font-weight="800" fill="${BLU}">血型　→　長條分開站</text>`;
          s += `<text x="340" y="268" text-anchor="middle" font-size="12" font-weight="800" fill="${C}">身高（公分）　→　肩並肩</text>`;
          s += `<text x="230" y="292" text-anchor="middle" font-size="11.5" fill="#657187">類別之間沒有「中間值」，所以要留空隙；身高有，所以不留</text>`;
          h.innerHTML = svg('0 0 460 300', s);
        },
        caption: '左：血型是類別 → 有空隙；右：身高是連續數值分組 → 沒有空隙。',
        example: {
          q: '調查全班「最喜歡的手搖飲」，該畫哪一種統計圖？',
          steps: ['飲料名稱是類別，不是數值區間。'],
          ans: '長條圖（長條之間留空隙）'
        }
      },

      {
        sec: '5-1', secName: '統計圖表',
        title: '折線圖看趨勢：往上、走平還是往下',
        points: [
          '<b>折線圖</b>把每個時間點描成點再連起來，看的是<span class="k">變化的趨勢</span>。',
          '線<b>往上爬</b>＝增加、<b>走平</b>＝差不多沒變、<b>往下掉</b>＝減少。',
          '選圖一句話：比<b>類別</b>用長條圖、看<b>占比</b>用圓形圖、看<b>趨勢</b>用折線圖。'
        ],
        formula: { label: '怎麼選圖', tex: '\\text{比多少}\\to\\text{長條圖};\\ \\text{占幾成}\\to\\text{圓形圖};\\ \\text{看趨勢}\\to\\text{折線圖}' },
        visual: (h) => {
          const V = [120, 150, 180, 180, 140, 90];
          const x0 = 58, yB = 220, H = 168, maxV = 200;
          const X = i => x0 + 26 + i * 58, Y = v => yB - v / maxV * H;
          let s = '';
          for (let v = 0; v <= 200; v += 50) {
            s += SV.seg(x0, Y(v), 418, Y(v), v ? '#e9eef6' : '#5b6478', v ? 1.2 : 2);
            s += `<text x="${x0 - 8}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" font-size="10.5" fill="#96a0b3">${v}</text>`;
          }
          s += SV.seg(x0, yB, x0, 48, '#5b6478', 2);
          const segCol = [GRN, GRN, AMB, RED, RED];
          for (let i = 0; i < 5; i++) s += SV.seg(X(i), Y(V[i]), X(i + 1), Y(V[i + 1]), segCol[i], 3.4);
          V.forEach((v, i) => {
            s += SV.dot(X(i), Y(v), '#172033', 4.5);
            s += `<text x="${X(i)}" y="${(Y(v) - 13).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="800" fill="#172033">${v}</text>`;
            s += `<text x="${X(i)}" y="${yB + 20}" text-anchor="middle" font-size="11.5" fill="#7b8598">${i + 1}月</text>`;
          });
          s += `<text x="${x0}" y="42" font-size="11" fill="#7b8598">某書店銷售量（本）</text>`;
          const chip = (x, col, t) => `<text x="${x}" y="261" text-anchor="middle" font-size="11.5" font-weight="800" fill="${col}">${t}</text>`;
          s += chip(112, GRN, '1→3月 ↗ 增加') + chip(238, AMB, '3→4月 → 持平') + chip(364, RED, '4→6月 ↘ 減少');
          s += `<text x="228" y="284" text-anchor="middle" font-size="11.5" fill="#657187">橫軸是「時間」，看的是往哪個方向走</text>`;
          h.innerHTML = svg('0 0 440 296', s);
        },
        caption: '折線<b>往上</b>＝增加、<b>走平</b>＝持平、<b>往下</b>＝減少，一眼看出趨勢。',
        example: {
          q: '書店 4 月賣 180 本、6 月賣 90 本，折線是往上還是往下？共差多少本？',
          steps: ['180 掉到 90，折線往下 → 減少。', '\\(180-90=90\\)。'],
          ans: '往下，減少 90 本'
        }
      },

      {
        sec: '5-1', secName: '統計圖表',
        title: '圓形圖：圓心角 = 360° × 該項百分比',
        points: [
          '<b>圓形圖</b>看的是<span class="k">各部分占整體的比例</span>，整個圓 \\(360^\\circ\\) 代表 \\(100\\%\\)。',
          '每一塊的<b>圓心角</b>＝\\(360^\\circ\\times\\) 該項百分比；反過來也能由圓心角回推百分比。',
          '檢查用：百分比要加成 \\(100\\%\\)、圓心角要加成 \\(360^\\circ\\)。拖滑桿看扇形怎麼變。'
        ],
        formula: { label: '圓心角公式', tex: '\\text{圓心角}=360^\\circ\\times\\dfrac{\\text{該項次數}}{\\text{總次數}}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="pie"></div>
            <div class="ictrl"><label>走路上學占 <span class="ival" id="pv">40</span> %</label>
            <input type="range" id="ps" min="20" max="60" step="10" value="40"></div></div>`;
          const cx = 138, cy = 150, r = 96;
          const draw = () => {
            const p = +h.querySelector('#ps').value;
            h.querySelector('#pv').textContent = p;
            const items = [
              { n: '走路', v: p, c: C }, { n: '公車', v: 30, c: BLU }, { n: '家長接送', v: 70 - p, c: AMB }
            ];
            let a = 90, s = '';
            items.forEach(it => {
              const sw = it.v * 3.6;
              s += sector(cx, cy, r, a, sw, it.c);
              const lp = SV.pt(cx, cy, r * 0.6, a - sw / 2);
              s += `<text x="${lp[0].toFixed(1)}" y="${(lp[1] + 5).toFixed(1)}" text-anchor="middle" font-size="14" font-weight="900" fill="#fff">${it.v}%</text>`;
              a -= sw;
            });
            items.forEach((it, i) => {
              const y = 78 + i * 46;
              s += `<rect x="264" y="${y}" width="18" height="18" rx="5" fill="${it.c}"/>`;
              s += `<text x="290" y="${y + 15}" font-size="13" font-weight="800" fill="#172033">${it.n}</text>`;
              s += `<text x="264" y="${y + 36}" font-size="12" font-weight="800" fill="${it.c}">360°×${it.v}% = ${(it.v * 3.6).toFixed(0)}°</text>`;
            });
            h.querySelector('#pie').innerHTML = svg('0 0 440 280', s);
          };
          h.querySelector('#ps').oninput = draw; draw();
        },
        caption: '三塊的百分比加起來是 \\(100\\%\\)，三個圓心角加起來剛好 \\(360^\\circ\\)。',
        example: {
          q: '全班 40 人，搭公車上學的有 12 人，圓形圖中這一塊的圓心角是多少？',
          steps: ['占比 \\(12\\div40=0.3=30\\%\\)。', '圓心角 \\(=360^\\circ\\times0.3\\)。'],
          ans: '\\(108^\\circ\\)'
        }
      },

      {
        sec: '5-1', secName: '統計圖表',
        title: '列聯表：橫的直的總和要對得起來',
        points: [
          '<span class="k">列聯表</span>（雙向表）一次呈現<b>兩個變項</b>，例如「性別 × 有沒有參加社團」。',
          '每一<b>列</b>橫著加是該列總和、每一<b>行</b>直著加是該行總和，右下角是<b>總計</b>。',
          '解題技巧：<b>缺一格就用總和倒推</b>，而且橫著算、直著算都要得到同一個答案。'
        ],
        formula: { label: '檢查方式', tex: '\\text{各列總和相加}=\\text{各行總和相加}=\\text{總計}' },
        visual: (h) => {
          const td = (t, extra) => `<td style="border:1px solid #cdd6e2;padding:9px 6px;${extra || ''}">${t}</td>`;
          h.innerHTML = `<div style="width:96%;margin:0 auto">
            <table style="width:100%;border-collapse:collapse;font-size:13.5px;text-align:center">
              <tr style="background:#fdeef2">
                <th style="border:1px solid #cdd6e2;padding:9px 6px">　</th>
                <th style="border:1px solid #cdd6e2;padding:9px 6px">有參加社團</th>
                <th style="border:1px solid #cdd6e2;padding:9px 6px">沒參加</th>
                <th style="border:1px solid #cdd6e2;padding:9px 6px;color:${C}">列總和</th>
              </tr>
              <tr>${td('<b>男生</b>', 'background:#fafbfd')}${td('18')}${td('12')}${td('<b>30</b>', `color:${C}`)}</tr>
              <tr>${td('<b>女生</b>', 'background:#fafbfd')}${td('22')}${td('<b style="color:#e11d48;font-size:17px">?</b>', 'background:#fdeef2')}${td('<b>30</b>', `color:${C}`)}</tr>
              <tr style="background:#fafbfd">${td('<b style="color:' + C + '">行總和</b>')}${td('<b style="color:' + C + '">40</b>')}${td('<b style="color:' + C + '">20</b>')}${td('<b style="color:' + C + '">60</b>')}</tr>
            </table>
            <div style="margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
              <div style="background:#eef4ff;border:1.5px solid ${BLU};border-radius:12px;padding:8px 14px;font-size:12.5px;font-weight:800;color:${BLU}">橫著算：30 − 22 = <b>8</b></div>
              <div style="background:#eef7f2;border:1.5px solid ${GRN};border-radius:12px;padding:8px 14px;font-size:12.5px;font-weight:800;color:${GRN}">直著算：20 − 12 = <b>8</b></div>
            </div>
            <div style="margin-top:10px;font-size:12px;color:#657187;text-align:center">兩種算法答案相同 → 表格填對了</div>
          </div>`;
        },
        caption: '缺的那一格，用「女生列」或「沒參加行」倒推都是 <b>8</b>。',
        example: {
          q: '列聯表中「有參加社團」共 40 人、總計 60 人，占全體百分之多少？',
          steps: ['占比就是該項人數 ÷ 總計。', '\\(40\\div60\\approx0.667\\)。'],
          ans: '約 \\(66.7\\%\\)'
        }
      },

      {
        sec: '5-1', secName: '統計圖表',
        title: '易錯：縱軸沒從 0 開始，差距就被放大了',
        points: [
          '<b>✗ 只看長條高度差</b>就下結論／<b>✓ 先看縱軸從哪裡開始、刻度是否等距</b>。',
          '<b>✗ 直方圖畫成有空隙、長條圖硬要相連</b>／<b>✓ 類別留空隙、連續資料不留空隙</b>。',
          '<b>✗ 圓形圖各項百分比加起來不是 100% 還照用</b>／<b>✓ 先檢查總和</b>。',
          '拖滑桿改縱軸起點：<b>資料一個字都沒變</b>，看起來的差距卻天差地遠。'
        ],
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="mis"></div>
            <div class="ictrl"><label>縱軸從 <span class="ival" id="bv">0</span> 開始</label>
            <input type="range" id="bs" min="0" max="90" step="10" value="0"></div></div>`;
          const V = [92, 95, 98], N = ['甲', '乙', '丙'], COL = [BLU, GRN, AMB];
          const draw = () => {
            const b = +h.querySelector('#bs').value;
            h.querySelector('#bv').textContent = b;
            const top = 100, x0 = 74, yB = 212, H = 162, bw = 62, gap = 34;
            let s = SV.seg(x0, yB, 402, yB, '#5b6478', 2) + SV.seg(x0, yB, x0, 36, '#5b6478', 2);
            for (let i = 0; i <= 4; i++) {
              const val = b + (top - b) * i / 4, yy = yB - H * i / 4;
              s += SV.seg(x0 - 6, yy, x0, yy, '#5b6478', 1.6);
              s += `<text x="${x0 - 11}" y="${(yy + 4).toFixed(1)}" text-anchor="end" font-size="10.5" fill="#7b8598">${val % 1 ? val.toFixed(1) : val.toFixed(0)}</text>`;
            }
            V.forEach((v, i) => {
              const bh = (v - b) / (top - b) * H, x = x0 + 30 + i * (bw + gap);
              s += `<rect x="${x}" y="${(yB - bh).toFixed(1)}" width="${bw}" height="${bh.toFixed(1)}" rx="4" fill="${COL[i]}" opacity="0.85"/>`;
              s += `<text x="${x + bw / 2}" y="${(yB - bh - 8).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#172033">${v}</text>`;
              s += `<text x="${x + bw / 2}" y="${yB + 20}" text-anchor="middle" font-size="13" font-weight="800" fill="#5b6478">${N[i]}</text>`;
            });
            const rr = (V[2] - b) / (V[0] - b);
            s += `<text x="222" y="${yB + 46}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${b ? RED : GRN}">丙的長條看起來是甲的 ${rr.toFixed(2)} 倍</text>`;
            s += `<text x="222" y="${yB + 66}" text-anchor="middle" font-size="12" fill="#657187">實際上 98 ÷ 92 ≈ 1.07 倍${b ? '　→　被放大了！' : '　→　縱軸從 0，沒有失真'}</text>`;
            h.querySelector('#mis').innerHTML = svg('0 0 440 285', s);
          };
          h.querySelector('#bs').oninput = draw; draw();
        },
        caption: '同樣是 92、95、98，縱軸從 90 開始時，看起來就像差了好幾倍。',
        example: {
          q: '一張長條圖中，甲店的長條是乙店的 3 倍高，可以說「甲店業績是乙店的 3 倍」嗎？',
          steps: ['要先確認縱軸是否從 0 開始、刻度是否等距。', '若縱軸不從 0 開始，高度比就不等於數量比。'],
          ans: '不一定，先看縱軸'
        }
      },

      /* ---------- 5-2 平均數、中位數與眾數 ---------- */
      {
        sec: '5-2', secName: '代表值',
        title: '平均數 = 總和 ÷ 筆數，一筆極端值就把它拉走',
        points: [
          '<span class="k">平均數</span>＝<b>所有資料的總和 ÷ 資料的筆數</b>，意思是「全部平分後每人分到多少」。',
          '反過來用：<b>平均數 × 筆數 ＝ 總和</b>，算全班總分、全隊總重量時很好用。',
          '平均數<b>把每一筆都算進去</b>，所以只要出現一筆特別大或特別小的<span class="k">極端值</span>，它就被拉過去。',
          '拖滑桿把第 5 筆往右拉，看平均數（紅色虛線）怎麼跟著跑。'
        ],
        formula: { label: '平均數', tex: '\\text{平均數}=\\dfrac{\\text{資料總和}}{\\text{資料筆數}}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="mean"></div>
            <div class="ictrl"><label>第 5 筆資料 <span class="ival" id="xv">80</span></label>
            <input type="range" id="xs" min="60" max="200" step="5" value="80"></div></div>`;
          const base = [60, 65, 70, 75];
          const X = v => 34 + (v - 50) / 160 * 370;
          const draw = () => {
            const x5 = +h.querySelector('#xs').value;
            h.querySelector('#xv').textContent = x5;
            const m = (base.reduce((a, b) => a + b, 0) + x5) / 5;
            const yl = 178;
            let s = SV.seg(28, yl, 416, yl, '#5b6478', 2.2);
            for (let v = 50; v <= 200; v += 25) {
              s += SV.seg(X(v), yl - 6, X(v), yl + 6, '#5b6478', 1.6);
              s += `<text x="${X(v).toFixed(1)}" y="${yl + 24}" text-anchor="middle" font-size="10.5" fill="#7b8598">${v}</text>`;
            }
            base.forEach(v => { s += SV.dot(X(v), yl - 16, BLU, 7); });
            s += SV.dot(X(x5), yl - 16, AMB, 8);
            s += `<text x="${X(x5).toFixed(1)}" y="${yl - 32}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${AMB}">第5筆 ${x5}</text>`;
            s += SV.seg(X(m), 74, X(m), yl + 14, C, 2.6, '7 5');
            s += `<text x="${X(m).toFixed(1)}" y="64" text-anchor="middle" font-size="14" font-weight="900" fill="${C}">平均數 ${m.toFixed(1)}</text>`;
            s += `<text x="222" y="36" text-anchor="middle" font-size="12" fill="#657187">前四筆固定：60、65、70、75（藍點）</text>`;
            s += `<text x="222" y="228" text-anchor="middle" font-size="12.5" font-weight="800" fill="#172033">(60＋65＋70＋75＋${x5}) ÷ 5 = ${m.toFixed(1)}</text>`;
            s += `<text x="222" y="252" text-anchor="middle" font-size="11.5" fill="#657187">只動一筆，平均數就整條往右移</text>`;
            h.querySelector('#mean').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#xs').oninput = draw; draw();
        },
        caption: '前四筆完全沒動，只把第五筆拉大，平均數就一路往右跑——這就是極端值的影響力。',
        example: {
          q: '五次小考得分 82、78、90、85、95，平均幾分？',
          steps: ['總和 \\(82+78+90+85+95=430\\)。', '\\(430\\div5=86\\)。'],
          ans: '86 分'
        }
      },

      {
        sec: '5-2', secName: '代表值',
        title: '用計算機的 M+／Σ 鍵算平均數',
        points: [
          '<span class="k">M+</span> 把螢幕上的數<b>累加進記憶體</b>，<span class="k">MR</span> 再把總和讀出來。',
          '總和讀出後<b>再 ÷ 筆數</b>，就是平均數——不必自己在紙上加一長串。',
          '計算機顯示位數有限，<b>除不盡時只是近似值</b>，要寫 \\(\\approx\\) 不能寫 \\(=\\)。'
        ],
        formula: { label: 'M+ 求平均', tex: '\\text{平均數}=\\dfrac{\\text{MR 讀出的總和}}{\\text{資料筆數}}' },
        visual: (h) => {
          const rows = [
            ['AC', 'M+', 'MR', '÷'],
            ['7', '8', '9', '×'],
            ['4', '5', '6', '−'],
            ['1', '2', '3', '+'],
            ['0', '.', '=', '']
          ];
          const OPS = ['÷', '×', '−', '+', '='];
          const KX = i => 44 + i * 50, KY = j => 88 + j * 34, KW = 44, KH = 30;
          const fillOf = t => t === 'AC' ? '#fdeef2' : (t === 'M+' || t === 'MR') ? '#fdf3e6' : OPS.indexOf(t) >= 0 ? '#eef4ff' : '#ffffff';
          const lineOf = t => t === 'AC' ? C : (t === 'M+' || t === 'MR') ? AMB : OPS.indexOf(t) >= 0 ? BLU : '#cdd6e2';
          // 計算機本體：disp＝螢幕顯示值、mem＝記憶體值、hot＝這一步按下的鍵
          const calc = (disp, mem, hot) => {
            let o = `<rect x="28" y="18" width="228" height="246" rx="16" fill="#eef1f6" stroke="#b9c4d4" stroke-width="2"/>`;
            o += `<rect x="42" y="30" width="200" height="44" rx="8" fill="#172033"/>`;
            o += `<text x="52" y="47" font-size="11" font-weight="900" fill="${mem ? AMB : '#4a5468'}">M</text>`;
            o += `<text x="232" y="64" text-anchor="end" font-size="23" font-weight="900" fill="#ffffff">${disp}</text>`;
            rows.forEach((r, j) => r.forEach((t, i) => {
              if (!t) return;
              const on = hot.indexOf(t) >= 0;
              o += `<rect x="${KX(i)}" y="${KY(j)}" width="${KW}" height="${KH}" rx="7" fill="${on ? C : fillOf(t)}" stroke="${on ? C : lineOf(t)}" stroke-width="${on ? 2.8 : 1.4}"/>`;
              o += `<text x="${KX(i) + KW / 2}" y="${KY(j) + 20}" text-anchor="middle" font-size="14" font-weight="900" fill="${on ? '#ffffff' : '#172033'}">${t}</text>`;
            }));
            return o;
          };
          // 右側螢幕區：同時顯示「當下顯示值」與「記憶體值」
          const panel = (disp, mem, note) => {
            let o = `<rect x="272" y="40" width="156" height="62" rx="12" fill="#ffffff" stroke="#cdd6e2" stroke-width="1.6"/>`;
            o += `<text x="350" y="60" text-anchor="middle" font-size="11" font-weight="800" fill="#657187">螢幕顯示</text>`;
            o += `<text x="350" y="90" text-anchor="middle" font-size="24" font-weight="900" fill="#172033">${disp}</text>`;
            o += `<rect x="272" y="112" width="156" height="62" rx="12" fill="#fdf3e6" stroke="${AMB}" stroke-width="1.8"/>`;
            o += `<text x="350" y="132" text-anchor="middle" font-size="11" font-weight="800" fill="${AMB}">記憶體 M（總和）</text>`;
            o += `<text x="350" y="162" text-anchor="middle" font-size="24" font-weight="900" fill="${AMB}">${mem}</text>`;
            o += `<text x="350" y="196" text-anchor="middle" font-size="11.5" font-weight="800" fill="#657187">${note}</text>`;
            o += `<text x="350" y="228" text-anchor="middle" font-size="11" fill="#96a0b3">82、91、76、88、73</text>`;
            o += `<text x="350" y="248" text-anchor="middle" font-size="11" fill="#96a0b3">五次小考成績</text>`;
            return o;
          };
          const S = [
            { d: '0', m: 0, k: ['AC'], n: '記憶體歸零', t: '先按 <b>AC</b> 清空螢幕與記憶體，從乾淨的狀態開始。' },
            { d: '82', m: 82, k: ['8', '2', 'M+'], n: 'M：0＋82＝82', t: '輸入 <b>82</b> 再按 <b>M+</b>，82 被加進記憶體。' },
            { d: '91', m: 173, k: ['9', '1', 'M+'], n: 'M：82＋91＝173', t: '輸入 <b>91</b> 按 <b>M+</b>，記憶體自己累加。' },
            { d: '76', m: 249, k: ['7', '6', 'M+'], n: 'M：173＋76＝249', t: '輸入 <b>76</b> 按 <b>M+</b>，螢幕只顯示剛輸入的數。' },
            { d: '88', m: 337, k: ['8', 'M+'], n: 'M：249＋88＝337', t: '輸入 <b>88</b> 按 <b>M+</b>，總和默默存在記憶體裡。' },
            { d: '73', m: 410, k: ['7', '3', 'M+'], n: 'M：337＋73＝410', t: '輸入 <b>73</b> 按 <b>M+</b>，五筆資料都進去了。' },
            { d: '410', m: 410, k: ['MR'], n: '總和 ＝ 410', t: '按 <b>MR</b> 把記憶體讀出來 → 螢幕出現總和 <b>410</b>。' },
            { d: '82', m: 410, k: ['÷', '5', '='], n: '410 ÷ 5 ＝ 82', t: '再按 <b>÷ 5 ＝</b>，就得到平均數 <b>82</b>。' }
          ];
          SV.stepper(h, '0 0 440 288', S.map(st => ({
            t: st.t,
            d: () => calc(st.d, st.m, st.k) + panel(st.d, st.m, st.n)
          })), { acc: false });
        },
        caption: '按鍵順序：<b>AC → 82 M+ → 91 M+ → 76 M+ → 88 M+ → 73 M+ → MR → ÷ 5 ＝</b>，螢幕出現 82。',
        example: {
          q: '用計算機的 M+ 鍵求 82、91、76、88、73 這五次小考的平均數。',
          steps: [
            'AC 清空後，五個數字各按一次 M+，記憶體會自動累加。',
            'MR 讀出總和：\\(82+91+76+88+73=410\\)。',
            '再按 \\(\\div\\,5=\\)：\\(410\\div5=82\\)。'
          ],
          ans: '平均 82 分'
        }
      },

      {
        sec: '5-2', secName: '代表值',
        title: '中位數：一定要先排序，再看筆數是奇是偶',
        points: [
          '<span class="k">中位數</span>是<b>排序後站在正中間</b>的那個數：一半的資料比它小、一半比它大。',
          '<b>✗ 拿到資料直接抓中間那筆</b>／<b>✓ 先由小到大排好再抓</b>——這是最常見的失分點。',
          '\\(n\\) 是<b>奇數</b>→ 第 \\(\\tfrac{n+1}{2}\\) 筆；\\(n\\) 是<b>偶數</b>→ 中間<b>兩筆的平均</b>。',
          '拖滑桿改變資料筆數，看中位數落在第幾筆。'
        ],
        formula: { label: '中位數的位置', tex: 'n\\text{ 奇數}\\Rightarrow\\text{第}\\tfrac{n+1}{2}\\text{筆};\\quad n\\text{ 偶數}\\Rightarrow\\text{中間兩筆的平均}' },
        visual: (h) => {
          const pool = [3, 5, 8, 11, 14, 17, 20, 23, 26];
          h.innerHTML = `<div style="width:100%"><div id="med"></div>
            <div class="ictrl"><label>資料筆數 n <span class="ival" id="nv">6</span></label>
            <input type="range" id="ns" min="4" max="9" step="1" value="6"></div></div>`;
          const draw = () => {
            const n = +h.querySelector('#ns').value;
            h.querySelector('#nv').textContent = n;
            const a = pool.slice(0, n), odd = n % 2 === 1;
            const iA = odd ? (n - 1) / 2 : n / 2 - 1, iB = odd ? iA : n / 2;
            const med = odd ? a[iA] : (a[iA] + a[iB]) / 2;
            const bw = Math.min(52, 350 / n), gap = 6, tw = n * bw + (n - 1) * gap;
            const sx = (440 - tw) / 2, y = 74;
            let s = `<text x="220" y="42" text-anchor="middle" font-size="12.5" fill="#657187">已由小到大排好的 ${n} 筆資料</text>`;
            a.forEach((v, i) => {
              const hot = (i === iA || i === iB), x = sx + i * (bw + gap);
              s += `<rect x="${x.toFixed(1)}" y="${y}" width="${bw.toFixed(1)}" height="56" rx="10" fill="${hot ? '#fdeef2' : '#f2f5fa'}" stroke="${hot ? C : '#cdd6e2'}" stroke-width="${hot ? 2.8 : 1.6}"/>`;
              s += `<text x="${(x + bw / 2).toFixed(1)}" y="${y + 36}" text-anchor="middle" font-size="17" font-weight="900" fill="${hot ? C : '#172033'}">${v}</text>`;
              s += `<text x="${(x + bw / 2).toFixed(1)}" y="${y + 76}" text-anchor="middle" font-size="10.5" fill="#96a0b3">第${i + 1}筆</text>`;
            });
            s += `<text x="220" y="216" text-anchor="middle" font-size="13.5" font-weight="900" fill="${C}">${odd ? `n = ${n} 是奇數 → 正中間第 ${(n + 1) / 2} 筆` : `n = ${n} 是偶數 → (${a[iA]} ＋ ${a[iB]}) ÷ 2`}</text>`;
            s += `<text x="220" y="248" text-anchor="middle" font-size="16" font-weight="900" fill="#172033">中位數 = ${med}</text>`;
            h.querySelector('#med').innerHTML = svg('0 0 440 275', s);
          };
          h.querySelector('#ns').oninput = draw; draw();
        },
        caption: '奇數筆正中間就一個；偶數筆沒有正中間，要取中間兩筆的<b>平均</b>。',
        example: {
          q: '資料 12、7、15、9、7、20，求中位數。',
          steps: ['先排序：\\(7,7,9,12,15,20\\)。', '共 6 筆（偶數），取中間兩筆 9 與 12 的平均。'],
          ans: '\\(\\dfrac{9+12}{2}=10.5\\)'
        }
      },

      {
        sec: '5-2', secName: '代表值',
        title: '眾數是「出現最多次的那個值」，不是它出現幾次',
        points: [
          '<span class="k">眾數</span>＝資料裡<b>出現次數最多</b>的那個<b>資料值</b>。',
          '<b>✗ 答「出現了 11 次」</b>／<b>✓ 答「38 號」</b>——問的是<b>值</b>，不是次數。',
          '眾數<b>可能不只一個</b>（兩個值並列最多）；若每個值次數都一樣，就<b>沒有眾數</b>。',
          '眾數也能用在<b>非數字</b>的資料（血型、飲料口味），這是平均數與中位數做不到的。'
        ],
        formula: { label: '眾數', tex: '\\text{眾數}=\\text{出現次數最多的那個資料值}' },
        visual: (h) => {
          const sizes = [36, 37, 38, 39, 40, 41], base = [3, 6, 11, 8, 5, 2];
          h.innerHTML = `<div style="width:100%"><div id="mode"></div>
            <div class="ictrl"><label>情境 <span class="ival" id="mv">39 號賣 8 雙</span></label>
            <input type="range" id="ms" min="5" max="12" step="1" value="8"></div></div>`;
          const draw = () => {
            const v = +h.querySelector('#ms').value, flat = (v === 12);
            h.querySelector('#mv').textContent = flat ? '六款一樣多' : `39 號賣 ${v} 雙`;
            const cnt = flat ? [7, 7, 7, 7, 7, 7] : base.map((c, i) => i === 3 ? v : c);
            const mx = Math.max.apply(null, cnt);
            const hot = flat ? [] : cnt.map((c, i) => c === mx ? i : -1).filter(i => i >= 0);
            const yB = 190, x0 = 56, cell = (420 - x0) / 6, bw = cell * 0.58, H = 132;
            let s = `<text x="222" y="19" text-anchor="middle" font-size="12" fill="#657187">某鞋店一週各鞋號賣出雙數</text>`;
            s += SV.seg(x0, yB, 428, yB, '#5b6478', 2) + SV.seg(x0, yB, x0, 34, '#5b6478', 2);
            cnt.forEach((c, i) => {
              const bh = c / mx * H, x = x0 + i * cell + (cell - bw) / 2, top = yB - bh;
              const on = hot.indexOf(i) >= 0;
              s += `<rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="4" fill="${on ? C : '#9aa4b6'}" opacity="${on ? 0.9 : 0.5}"/>`;
              s += `<text x="${(x + bw / 2).toFixed(1)}" y="${(top - 7).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${on ? C : '#5b6478'}">${c}</text>`;
              s += `<text x="${(x + bw / 2).toFixed(1)}" y="${yB + 19}" text-anchor="middle" font-size="12" font-weight="800" fill="${on ? C : '#5b6478'}">${sizes[i]}</text>`;
            });
            let msg, sub, col;
            if (flat) {
              msg = '沒有眾數'; col = '#5b6478';
              sub = '六款都賣 7 雙，每個值的次數都一樣多';
            } else if (hot.length > 1) {
              msg = '眾數有兩個：38 號與 39 號'; col = C;
              sub = '兩個值並列最多 → 雙眾數，兩根一起染紅';
            } else {
              msg = '眾數是「38 號」，不是「11 雙」'; col = C;
              sub = `38 號賣 11 雙最多，39 號只賣 ${v} 雙`;
            }
            s += `<text x="222" y="236" text-anchor="middle" font-size="14" font-weight="900" fill="${col}">${msg}</text>`;
            s += `<text x="222" y="257" text-anchor="middle" font-size="11.5" fill="#657187">${sub}</text>`;
            s += `<text x="222" y="275" text-anchor="middle" font-size="11" fill="#96a0b3">橫軸：鞋號　縱軸：賣出雙數</text>`;
            h.querySelector('#mode').innerHTML = svg('0 0 440 282', s);
          };
          h.querySelector('#ms').oninput = draw; draw();
        },
        caption: '拖滑桿把 39 號拉到 11 雙 → <b>兩根同高就是雙眾數</b>；再拉一格讓六款一樣多 → <b>沒有眾數</b>。',
        example: {
          q: '資料 5、7、7、9、9、12，眾數是多少？',
          steps: ['7 出現 2 次、9 出現 2 次，其餘各 1 次。', '兩個並列最多，眾數就有兩個。'],
          ans: '眾數是 7 與 9'
        }
      },

      {
        sec: '5-2', secName: '代表值',
        title: '平均數看總量、中位數看排名、眾數看熱門',
        points: [
          '要算<b>總分、總量</b>→ 用<span class="k">平均數</span>，每一筆都算進去。',
          '資料裡<b>有極端值</b>（薪水、房價）→ 用<span class="k">中位數</span>，它不被拉走。',
          '要<b>進貨、挑最受歡迎的</b>→ 用<span class="k">眾數</span>，類別資料也能用。',
          '拖滑桿把老闆薪水 5→50 萬：<b>只有紅色的平均數在往右狂奔</b>。'
        ],
        formula: { label: '怎麼選代表值', tex: '\\text{有極端值}\\Rightarrow\\text{中位數};\\quad\\text{看熱門}\\Rightarrow\\text{眾數}' },
        visual: (h) => {
          h.innerHTML = `<div style="width:100%"><div id="rep"></div>
            <div class="ictrl"><label>老闆月薪 <span class="ival" id="bv">5</span> 萬</label>
            <input type="range" id="bs" min="5" max="50" step="1" value="5"></div></div>`;
          const emp = [3.0, 3.2, 3.5, 3.5, 3.5, 3.8, 4.0, 4.2];   // 8 名員工，總和 28.7 萬
          const yL = 196, xa = 30, xb = 420, VM = 10;
          const X = v => xa + Math.min(v, VM) / VM * (xb - xa);
          const draw = () => {
            const b = +h.querySelector('#bs').value;
            h.querySelector('#bv').textContent = b;
            const mean = (28.7 + b) / 9;      // 中位數（第 5 筆）與眾數恆為 3.5
            let s = `<text x="220" y="18" text-anchor="middle" font-size="12" fill="#657187">8 名員工（藍）＋老闆（琥珀）共 9 筆月薪（萬元）</text>`;
            s += SV.seg(xa, yL, xb + 12, yL, '#5b6478', 2.2);
            for (let v = 0; v <= VM; v++) {
              s += SV.seg(X(v), yL - 5, X(v), yL + 5, '#5b6478', 1.5);
              s += `<text x="${X(v).toFixed(1)}" y="${yL + 20}" text-anchor="middle" font-size="10.5" fill="#7b8598">${v}</text>`;
            }
            // 眾數（粗琥珀）與中位數（細藍）都釘在 3.5，兩線重疊故用粗細區分
            s += `<line x1="${X(3.5).toFixed(1)}" y1="62" x2="${X(3.5).toFixed(1)}" y2="${yL + 8}" stroke="${AMB}" stroke-width="9" opacity="0.34" stroke-linecap="round"/>`;
            s += SV.seg(X(3.5), 62, X(3.5), yL + 8, BLU, 2.6);
            s += SV.seg(X(mean), 40, X(mean), yL + 8, RED, 2.6, '7 5');
            // 相同薪水往上疊：3.5 疊了三顆 → 一眼看出眾數
            const cnts = {};
            emp.forEach(v => { cnts[v] = (cnts[v] || 0) + 1; });
            Object.keys(cnts).forEach(kk => {
              for (let i = 0; i < cnts[kk]; i++)
                s += `<circle cx="${X(+kk).toFixed(1)}" cy="${(yL - 9 - i * 11).toFixed(1)}" r="4.6" fill="${BLU}" stroke="#fff" stroke-width="1.4"/>`;
            });
            if (b <= VM) {
              s += `<circle cx="${X(b).toFixed(1)}" cy="${yL - 9}" r="6.4" fill="${AMB}" stroke="#fff" stroke-width="1.6"/>`;
              s += `<text x="${X(b).toFixed(1)}" y="${yL - 24}" text-anchor="middle" font-size="11" font-weight="800" fill="${AMB}">老闆 ${b}</text>`;
            } else {
              s += `<path d="M${xb - 4},${yL - 17} L${xb + 12},${yL - 9} L${xb - 4},${yL - 1} Z" fill="${AMB}"/>`;
              s += `<text x="${xb + 8}" y="${yL - 24}" text-anchor="end" font-size="11" font-weight="800" fill="${AMB}">老闆 ${b} 萬 →</text>`;
            }
            s += `<text x="${X(mean).toFixed(1)}" y="34" text-anchor="middle" font-size="12.5" font-weight="900" fill="${RED}">平均數 ${mean.toFixed(2)}</text>`;
            s += `<text x="${(X(3.5) - 10).toFixed(1)}" y="82" text-anchor="end" font-size="11.5" font-weight="900" fill="${BLU}">中位數 3.5</text>`;
            s += `<text x="${(X(3.5) - 10).toFixed(1)}" y="100" text-anchor="end" font-size="11.5" font-weight="900" fill="${AMB}">眾數 3.5</text>`;
            const chip = (x, col, bg, ttl, val) =>
              `<rect x="${x}" y="228" width="130" height="40" rx="11" fill="${bg}" stroke="${col}" stroke-width="1.6"/>` +
              `<text x="${x + 65}" y="244" text-anchor="middle" font-size="10.5" font-weight="800" fill="${col}">${ttl}</text>` +
              `<text x="${x + 65}" y="262" text-anchor="middle" font-size="15" font-weight="900" fill="#172033">${val}</text>`;
            s += chip(12, RED, '#fdeef2', '平均數（很怕極端值）', `${mean.toFixed(2)} 萬`);
            s += chip(155, BLU, '#eef4ff', '中位數（不怕）', '3.5 萬');
            s += chip(298, AMB, '#fdf3e6', '眾數（不怕）', '3.5 萬');
            s += `<text x="220" y="282" text-anchor="middle" font-size="11" fill="#657187">老闆薪水一路拉高，只有紅色平均數跟著跑，中位數與眾數釘在 3.5</text>`;
            h.querySelector('#rep').innerHTML = svg('0 0 440 288', s);
          };
          h.querySelector('#bs').oninput = draw; draw();
        },
        caption: '平均數＝總和÷筆數（<b>很怕</b>極端值）｜中位數＝排序後正中間（<b>不怕</b>）｜眾數＝出現最多次的值（<b>不怕</b>，類別資料也能用）。',
        example: {
          q: '8 名員工月薪 3.0、3.2、3.5、3.5、3.5、3.8、4.0、4.2 萬，老闆 50 萬。要說明「一般員工的薪水」，用哪個代表值？',
          steps: [
            '九人總和 \\(28.7+50=78.7\\)，平均 \\(78.7\\div9\\approx8.74\\) 萬。',
            '排序後第 5 筆是 3.5，中位數 \\(=3.5\\) 萬；3.5 出現 3 次最多，眾數也是 3.5 萬。',
            '\\(8.74\\) 萬比全部 8 名員工都高，是被老闆一筆拉走的結果。'
          ],
          ans: '用中位數 3.5 萬（平均 \\(\\approx8.74\\) 萬會誤導）'
        }
      },

      {
        sec: '5-2', secName: '代表值',
        title: '易錯：忘了排序、把次數當眾數、漏算 0',
        points: [
          '<b>✗ 拿到資料直接取中間</b>／<b>✓ 先由小到大排好</b>，再看筆數是奇是偶。',
          '<b>✗ 眾數答成「11 次」</b>／<b>✓ 眾數是那個「值」</b>，次數只是用來比誰最多。',
          '<b>✗ 看到 0 分就跳過</b>／<b>✓ 0 也是一筆</b>，分子加 0、分母照樣多算 1 筆。',
          '平均數<b>不一定</b>是資料裡出現過的數（像 86.4 分），這很正常。'
        ],
        visual: (h) => {
          const row = (bad, good) => `
            <div style="display:flex;gap:8px;align-items:stretch;margin-bottom:10px">
              <div style="flex:1;background:#fdeef2;border:1.5px solid ${RED};border-radius:12px;padding:8px 10px">
                <div style="font-size:11.5px;font-weight:900;color:${RED};margin-bottom:3px">✗ 錯</div>
                <div style="font-size:12.5px;color:#172033;line-height:1.55">${bad}</div>
              </div>
              <div style="flex:1;background:#eef7f2;border:1.5px solid ${GRN};border-radius:12px;padding:8px 10px">
                <div style="font-size:11.5px;font-weight:900;color:${GRN};margin-bottom:3px">✓ 對</div>
                <div style="font-size:12.5px;color:#172033;line-height:1.55">${good}</div>
              </div>
            </div>`;
          h.innerHTML = `<div style="width:97%;margin:0 auto">
            ${row('資料 12、7、15、9 沒排序<br>就取中間 <b>(7＋15)÷2 = 11</b>',
            '先排 7、9、12、15<br>中位數 <b>(9＋12)÷2 = 10.5</b>')}
            ${row('鞋號 38 賣了 11 雙最多<br>→ 眾數答 <b>11</b>', '問的是「值」<br>→ 眾數是 <b>38 號</b>')}
            ${row('分數 90、0、85、80、95<br>跳過 0：<b>350÷4 = 87.5</b>', '0 也要算<br><b>350÷5 = 70</b>')}
            <div style="background:#fdeef2;border-left:4px solid ${C};border-radius:10px;padding:8px 12px;font-size:12px;color:#172033">
              三個坑一句話：<b>先排序</b>、<b>答值不答次數</b>、<b>一筆都不能漏</b>。</div>
          </div>`;
        },
        caption: '同一組資料，少一個動作答案就整個跑掉——<b>排序、看清楚問的是什麼</b>。',
        example: {
          q: '資料 6、2、9、2、5，小明說「中位數是 9」，錯在哪？正確答案是多少？',
          steps: ['小明沒排序就抓中間。先排序：\\(2,2,5,6,9\\)。', '共 5 筆（奇數），中位數是第 3 筆。'],
          ans: '中位數 \\(=5\\)（小明錯在沒排序）'
        }
      }
    ]
  });
})();
