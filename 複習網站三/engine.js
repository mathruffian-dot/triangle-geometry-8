/* ============================================================
   engine.js — 簡報導覽與渲染引擎
   讀取 window.DECK（各章 push 進來），攤平成投影片序列。
   ============================================================ */
(function () {
  const DECK = window.DECK || [];

  // 攤平：每章先放一張章名分隔頁，再放內容頁
  const flat = [];
  DECK.forEach((chap, ci) => {
    flat.push({ type: 'divider', ch: chap.ch, color: chap.color, title: chap.title, sections: chap.sections });
    chap.slides.forEach(s => flat.push(Object.assign({ type: 'slide', ch: chap.ch, color: chap.color }, s)));
  });

  let idx = 0;

  // ---- MathJax 排版（載入前先重試，載入後自動補排版）----
  function typeset(el, tries = 0) {
    if (window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise([el]).catch(() => {});
    } else if (tries < 60) {
      setTimeout(() => typeset(el, tries + 1), 200);
    }
  }

  // ---- 自動縮放：讓整頁內容在「不捲動」的前提下盡量放大 ----
  // 量測內容自然高度，超過欄位可視高度時才等比縮小（下限 0.5，保留字級）。
  function fitEl(box, content) {
    if (!box || !content) return;
    content.style.transform = 'none';
    const avail = box.clientHeight;
    const need = content.scrollHeight;
    // 留 6px 安全邊界，吸收縮放後的次像素捨入，避免滑桿底緣被裁掉一絲
    if (avail > 0 && need > avail + 1) {
      content.style.transform = 'scale(' + Math.max(0.5, (avail - 6) / need) + ')';
    }
  }
  function fitSlide() {
    if (!slideEl || slideEl.classList.contains('divider')) return;
    const info = slideEl.querySelector('.slide-info');
    if (info) fitEl(info, info.querySelector('.col-fit'));
    const vis = slideEl.querySelector('.slide-visual');
    if (vis) {
      const host = vis.querySelector('.visual-host');
      // 視覺欄一律等比縮放：把「圖＋滑桿／按鈕」當成一整組縮到欄內，
      // 確保矮螢幕下滑桿也不會被裁掉或被推到看不見（原本只縮靜態圖，互動頁會爆版）
      if (host) fitEl(host, host);
    }
  }
  // MathJax 排版完成後才量高縮放（公式高度需排版後才確定）
  function typesetAndFit(el, tries = 0) {
    if (window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise([el]).then(fitSlide).catch(fitSlide);
    } else if (tries < 60) {
      setTimeout(() => typesetAndFit(el, tries + 1), 200);
    } else { fitSlide(); }
  }

  /* ========== 範例／圖解「放大成整頁」（方便用畫筆講解）========== */
  let zoomHost = null, zoomHostParent = null;   // 圖解模式被移入放大層的 host 及其原父節點
  function ensureZoom() {
    if (document.getElementById('zoomModal')) return;
    const m = document.createElement('div');
    m.id = 'zoomModal'; m.className = 'zoom-modal hidden';
    m.innerHTML = `<div class="zoom-body" id="zoomBody"></div>`;
    document.body.appendChild(m);
    const bar = document.createElement('div');
    bar.id = 'zoomBar'; bar.className = 'zoom-bar hidden';
    bar.innerHTML = `<div class="zoom-badge" id="zoomBadge"></div>
      <button class="zoom-btn" id="zoomSol">顯示解答</button>
      <button class="zoom-btn zoom-x" id="zoomClose">✕ 關閉</button>`;
    document.body.appendChild(bar);
    bar.querySelector('#zoomClose').onclick = closeZoom;
    bar.querySelector('#zoomSol').onclick = () => {
      const box = document.getElementById('zoomSolBox'); if (!box) return;
      box.classList.toggle('show');
      bar.querySelector('#zoomSol').textContent = box.classList.contains('show') ? '收起解答' : '顯示解答';
      typeset(box);
    };
  }
  function showZoom(s, badgeTail) {
    ensureZoom();
    document.getElementById('zoomBadge').innerHTML = `第 ${s.ch} 章 · ${s.sec} ${s.secName || ''}　${badgeTail}`;
    document.getElementById('zoomModal').style.setProperty('--ct', s.color);
    document.getElementById('zoomBar').style.setProperty('--ct', s.color);
    document.getElementById('zoomModal').classList.remove('hidden');
    document.getElementById('zoomBar').classList.remove('hidden');
  }
  function openExampleModal(s) {
    ensureZoom();
    document.getElementById('zoomSol').style.display = '';
    document.getElementById('zoomSol').textContent = '顯示解答';
    document.getElementById('zoomBody').innerHTML =
      `<div class="zoom-q">${s.example.q}</div>
       <div class="zoom-sol" id="zoomSolBox">
         ${s.example.steps ? `<ol>${s.example.steps.map(t => `<li>${t}</li>`).join('')}</ol>` : ''}
         ${s.example.ans ? `<div class="zoom-ans">答：${s.example.ans}</div>` : ''}
       </div>`;
    showZoom(s, '範例');
    typeset(document.getElementById('zoomBody'));
  }
  function openVisualModal(s, host) {
    ensureZoom();
    document.getElementById('zoomSol').style.display = 'none';   // 圖解不需要「顯示解答」
    const body = document.getElementById('zoomBody');
    body.innerHTML = '';
    zoomHost = host; zoomHostParent = host.parentNode;
    host.style.transform = 'none';   // 取消縮圖時的縮放，放大層用滿版
    body.appendChild(host);
    showZoom(s, '圖解');
    typeset(body);
  }
  function closeZoom() {
    const m = document.getElementById('zoomModal');
    if (!m || m.classList.contains('hidden')) return;
    if (zoomHost && zoomHostParent) {
      zoomHostParent.insertBefore(zoomHost, zoomHostParent.firstChild);   // 把圖放回原視覺欄
      zoomHost = null; zoomHostParent = null;
    }
    document.getElementById('zoomBody').innerHTML = '';
    m.classList.add('hidden');
    document.getElementById('zoomBar').classList.add('hidden');
    if (typeof clearPen === 'function') clearPen();   // 清掉講解時的筆跡
    fitSlide();
  }

  // ---- DOM ----
  const $ = id => document.getElementById(id);
  const slideEl = $('slide');
  const crumbEl = $('crumb');
  const tocEl = $('toc');
  const progFill = $('progressFill');
  const progText = $('progressText');
  const prevBtn = $('prevBtn');
  const nextBtn = $('nextBtn');

  // ---- 封面章節卡 ----
  (function buildCover() {
    const host = $('coverChapters');
    DECK.forEach(c => {
      const card = document.createElement('div');
      card.className = 'cover-card';
      card.style.setProperty('--ct', c.color);
      card.innerHTML = `<div class="cc-num">第 ${c.ch} 章</div>
        <div class="cc-title">${c.title}</div>
        <div class="cc-list">${c.sections.join('　')}</div>`;
      host.appendChild(card);
    });
  })();

  // ---- 目錄 ----
  function buildTOC() {
    tocEl.innerHTML = '';
    DECK.forEach(chap => {
      const wrap = document.createElement('div');
      wrap.className = 'toc-chapter open';
      wrap.style.setProperty('--ct', chap.color);
      const head = document.createElement('div');
      head.className = 'toc-chead';
      head.innerHTML = `<span class="toc-dot"></span>第 ${chap.ch} 章　${chap.title}`;
      head.onclick = () => wrap.classList.toggle('open');
      wrap.appendChild(head);
      const items = document.createElement('div');
      items.className = 'toc-items';
      flat.forEach((s, i) => {
        if (s.type !== 'slide' || s.ch !== chap.ch) return;
        const b = document.createElement('button');
        b.className = 'toc-item';
        b.dataset.i = i;
        b.innerHTML = `<span class="ti-sec">${s.sec}</span>${s.title}`;
        b.onclick = () => { go(i); if (window.innerWidth <= 1080) tocEl.classList.remove('open'); };
        items.appendChild(b);
      });
      wrap.appendChild(items);
      tocEl.appendChild(wrap);
    });
  }

  function markTOC() {
    tocEl.querySelectorAll('.toc-item').forEach(b => {
      b.classList.toggle('active', +b.dataset.i === idx);
    });
  }

  // ---- 渲染單頁 ----
  function render() {
    const s = flat[idx];
    slideEl.style.setProperty('--ct', s.color);

    if (s.type === 'divider') {
      slideEl.className = 'slide divider';
      slideEl.innerHTML = `
        <div>
          <div class="dv-num">第 ${s.ch} 章</div>
          <div class="dv-title">${s.title}</div>
          <div class="dv-list">${s.sections.map(x => `<span class="dv-chip">${x}</span>`).join('')}</div>
        </div>`;
      crumbEl.innerHTML = `第 ${s.ch} 章　<b>${s.title}</b>`;
    } else {
      slideEl.className = 'slide';
      // 左：概念欄
      const info = document.createElement('div');
      info.className = 'slide-info';
      let html = `<div class="badge">第 ${s.ch} 章 · ${s.sec} ${s.secName || ''}</div>
        <h2 class="slide-title">${s.title}</h2>`;
      if (s.formula) {
        html += `<div class="formula">${s.formula.label ? `<div class="formula-label">${s.formula.label}</div>` : ''}$$${s.formula.tex}$$</div>`;
      }
      if (s.points && s.points.length) {
        html += `<ul class="points">${s.points.map(p => `<li>${p}</li>`).join('')}</ul>`;
      }
      if (s.example) {
        html += `<div class="example">
          <div class="ex-head">範例<button class="ex-zoom" title="放大成整頁，方便用畫筆講解">🔍 放大</button></div>
          <div class="ex-q">${s.example.q}</div>
          <button class="ex-toggle">顯示解答</button>
          <div class="ex-sol">
            ${s.example.steps ? `<ol>${s.example.steps.map(t => `<li>${t}</li>`).join('')}</ol>` : ''}
            ${s.example.ans ? `<div class="ex-ans">答：${s.example.ans}</div>` : ''}
          </div>
        </div>`;
      }
      info.innerHTML = '<div class="col-fit">' + html + '</div>';

      // 右：視覺欄
      const vis = document.createElement('div');
      vis.className = 'slide-visual';
      const host = document.createElement('div');
      host.className = 'visual-host';
      vis.appendChild(host);
      if (s.caption) {
        const cap = document.createElement('div');
        cap.className = 'visual-caption';
        cap.innerHTML = s.caption;
        vis.appendChild(cap);
      }
      // 圖解「放大成整頁」按鈕（浮在視覺欄右上角）
      const visZoom = document.createElement('button');
      visZoom.className = 'vis-zoom';
      visZoom.title = '放大成整頁，方便用畫筆講解';
      visZoom.textContent = '🔍 放大';
      visZoom.onclick = () => openVisualModal(s, host);
      vis.appendChild(visZoom);

      slideEl.innerHTML = '';
      slideEl.appendChild(info);
      slideEl.appendChild(vis);

      // 視覺內容：字串 or 函式
      if (typeof s.visual === 'function') {
        try { s.visual(host); } catch (e) { host.innerHTML = '<p style="color:#e11d48">視覺載入失敗</p>'; console.error(e); }
      } else {
        host.innerHTML = s.visual || '';
      }

      // 範例展開
      const tog = info.querySelector('.ex-toggle');
      if (tog) {
        const sol = info.querySelector('.ex-sol');
        tog.onclick = () => {
          sol.classList.toggle('show');
          tog.textContent = sol.classList.contains('show') ? '收起解答' : '顯示解答';
          // 展開/收起解答會改變概念欄高度 → 排版後重新縮放
          if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([sol]).then(fitSlide).catch(fitSlide);
          else fitSlide();
        };
      }
      // 範例「放大成整頁」按鈕
      const exZoom = info.querySelector('.ex-zoom');
      if (exZoom) exZoom.onclick = () => openExampleModal(s);

      crumbEl.innerHTML = `第 ${s.ch} 章 · ${s.sec} <b>${s.title}</b>`;
    }

    // 進度
    progFill.style.width = ((idx + 1) / flat.length * 100) + '%';
    progText.textContent = `${idx + 1} / ${flat.length}`;
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === flat.length - 1;
    markTOC();

    // MathJax（若尚未載入完成，typeset 會自動重試補上）；排版後自動縮放使整頁免捲動
    typesetAndFit(slideEl);
    slideEl.scrollTop = 0;
    if (typeof clearPen === 'function') clearPen(); // 換頁清除筆跡
  }

  function go(i) {
    closeZoom();
    idx = Math.max(0, Math.min(flat.length - 1, i));
    render();
  }
  function next() { if (idx < flat.length - 1) go(idx + 1); }
  function prev() { if (idx > 0) go(idx - 1); }

  // ---- 事件 ----
  const app = $('app');
  function toggleSidebar() {
    if (window.innerWidth > 1080) app.classList.toggle('toc-collapsed');
    else tocEl.classList.toggle('open');
    // 版面寬度改變 → 重新縮放（延一格等 grid 重排完成）
    requestAnimationFrame(fitSlide);
  }
  prevBtn.onclick = prev;
  nextBtn.onclick = next;
  $('tocToggle').onclick = toggleSidebar;
  $('homeBtn').onclick = () => { app.classList.add('hidden'); $('cover').classList.remove('hidden'); };
  $('startBtn').onclick = () => { $('cover').classList.add('hidden'); app.classList.remove('hidden'); fitPen(); render(); };

  /* ================= 授課教具 ================= */
  const canvas = $('penCanvas'), penCtx = canvas.getContext('2d');
  const laserDot = $('laserDot');
  let laserOn = false, penOn = false, drawing = false, erasing = false, penColor = '#e11d48', lastPt = null;

  // 雷射拖尾：獨立畫布，畫出會隨時間淡出的紅色軌跡（不影響畫筆畫布）
  const laserCanvas = document.createElement('canvas');
  laserCanvas.className = 'laser-canvas';
  document.body.appendChild(laserCanvas);
  const lctx = laserCanvas.getContext('2d');
  let laserPts = [];           // 近期軌跡點 {x, y, t}
  let laserRAF = null;
  const LASER_LIFE = 1600;     // 每段筆跡殘留時間（毫秒）→ 之後淡出消失
  function drawLaserTrail() {
    syncLaserCanvas();
    const now = performance.now();
    laserPts = laserPts.filter(p => now - p.t < LASER_LIFE);
    lctx.clearRect(0, 0, laserCanvas.width, laserCanvas.height);
    for (let i = 1; i < laserPts.length; i++) {
      const a = laserPts[i - 1], b = laserPts[i];
      const alpha = Math.max(0, 1 - (now - b.t) / LASER_LIFE);   // 越新越濃，隨時間淡出
      lctx.strokeStyle = 'rgba(255,42,42,' + (0.6 * alpha).toFixed(3) + ')';
      lctx.lineWidth = 3 + 5 * alpha;
      lctx.beginPath(); lctx.moveTo(a.x, a.y); lctx.lineTo(b.x, b.y); lctx.stroke();
    }
    if (laserOn || laserPts.length > 1) laserRAF = requestAnimationFrame(drawLaserTrail);
    else { lctx.clearRect(0, 0, laserCanvas.width, laserCanvas.height); laserRAF = null; }
  }

  function fitPen() {
    const w = window.innerWidth, h = window.innerHeight, dpr = window.devicePixelRatio || 1;
    if (canvas._w === w && canvas._h === h) return; // 尺寸未變就不重設，避免清掉筆跡
    canvas._w = w; canvas._h = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    penCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    penCtx.lineCap = 'round'; penCtx.lineJoin = 'round';
  }
  // 雷射畫布尺寸自我校正（不受 fitPen 的 early-return 影響；尺寸相符時為 no-op）
  function syncLaserCanvas() {
    const w = window.innerWidth, h = window.innerHeight, dpr = window.devicePixelRatio || 1;
    const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
    if (laserCanvas.width === cw && laserCanvas.height === ch) return;
    laserCanvas.width = cw; laserCanvas.height = ch;
    laserCanvas.style.width = w + 'px'; laserCanvas.style.height = h + 'px';
    lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lctx.lineCap = 'round'; lctx.lineJoin = 'round';
  }
  function clearPen() { if (penCtx) penCtx.clearRect(0, 0, canvas.width, canvas.height); }

  function setLaser(on) {
    laserOn = on;
    if (on) setPen(false);
    app.classList.toggle('laser-on', on);
    laserDot.classList.toggle('hidden', !on);
    $('dkLaser').classList.toggle('active', on);
    if (on) { syncLaserCanvas(); if (!laserRAF) laserRAF = requestAnimationFrame(drawLaserTrail); }
    // 關閉時不清點：讓已畫出的拖尾自然淡出後停止
  }
  function setPen(on) {
    penOn = on;
    if (on) setLaser(false);
    app.classList.toggle('pen-on', on);
    canvas.style.pointerEvents = on ? 'auto' : 'none';
    $('dkPen').classList.toggle('active', on);
    $('dkColors').classList.toggle('hidden', !on);
  }

  // 雷射點跟隨 + 記錄拖尾軌跡
  document.addEventListener('mousemove', e => {
    if (laserOn) {
      laserDot.style.left = e.clientX + 'px'; laserDot.style.top = e.clientY + 'px';
      laserPts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (laserPts.length > 600) laserPts.shift();
    }
  });

  // 畫筆繪製（滑鼠＋觸控）
  const ptOf = e => { const t = e.touches ? e.touches[0] : e; return { x: t.clientX, y: t.clientY }; };
  function penStart(e) { if (!penOn) return; drawing = true; lastPt = ptOf(e); e.preventDefault(); }
  function penMove(e) {
    if (!penOn || !drawing) return;
    const p = ptOf(e);
    penCtx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
    penCtx.strokeStyle = penColor;
    penCtx.lineWidth = erasing ? 26 : 3.6;
    penCtx.beginPath(); penCtx.moveTo(lastPt.x, lastPt.y); penCtx.lineTo(p.x, p.y); penCtx.stroke();
    lastPt = p; e.preventDefault();
  }
  function penEnd() { drawing = false; }
  canvas.addEventListener('mousedown', penStart);
  canvas.addEventListener('mousemove', penMove);
  window.addEventListener('mouseup', penEnd);
  canvas.addEventListener('touchstart', penStart, { passive: false });
  canvas.addEventListener('touchmove', penMove, { passive: false });
  window.addEventListener('touchend', penEnd);

  // 工具列按鈕
  $('dkSidebar').onclick = toggleSidebar;
  $('dkPrev').onclick = prev;
  $('dkNext').onclick = next;
  $('dkLaser').onclick = () => setLaser(!laserOn);
  $('dkPen').onclick = () => setPen(!penOn);
  $('dkClear').onclick = clearPen;
  $('dkErase').onclick = () => {
    erasing = !erasing;
    $('dkErase').classList.toggle('active', erasing);
    if (erasing && !penOn) setPen(true);
  };
  document.querySelectorAll('.dcolor').forEach(b => {
    b.onclick = () => {
      penColor = b.dataset.c; erasing = false;
      $('dkErase').classList.remove('active');
      document.querySelectorAll('.dcolor').forEach(x => x.classList.toggle('active', x === b));
      if (!penOn) setPen(true);
    };
  });
  $('dkFull').onclick = () => {
    if (!document.fullscreenElement) (document.documentElement.requestFullscreen && document.documentElement.requestFullscreen());
    else document.exitFullscreen();
  };
  window.addEventListener('resize', () => { fitPen(); fitSlide(); });
  // 拖動滑桿／步驟器時，說明文字行數可能改變（例如步驟說明從一行變兩行），
  // 導致視覺欄需要重新量高縮放；用 rAF 去抖，避免拖曳過程重複計算
  let _refitRAF = null;
  slideEl.addEventListener('input', () => {
    if (_refitRAF) return;
    _refitRAF = requestAnimationFrame(() => { _refitRAF = null; fitSlide(); });
  });
  fitPen();

  document.addEventListener('keydown', e => {
    if ($('app').classList.contains('hidden')) {
      if (e.key === 'Enter' || e.key === ' ') { $('startBtn').click(); }
      return;
    }
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(flat.length - 1);
    else if (e.key === 'Escape') { closeZoom(); setLaser(false); setPen(false); }
    else if (e.key === 'l' || e.key === 'L') setLaser(!laserOn);
    else if (e.key === 'p' || e.key === 'P') setPen(!penOn);
    else if (e.key === 'c' || e.key === 'C') clearPen();
  });

  buildTOC();

  // 深連結：#present 直接進入簡報；#p=N 直接跳到第 N 頁
  (function bootFromHash() {
    const hash = location.hash || '';
    const m = hash.match(/#p=(\d+)/);
    if (hash === '#present' || m) {
      $('cover').classList.add('hidden');
      $('app').classList.remove('hidden');
      fitPen();
      go(m ? +m[1] : 0);
    }
  })();
  // 不自動 render，等按「開始複習」；但若直接想看也可預先 render
})();
