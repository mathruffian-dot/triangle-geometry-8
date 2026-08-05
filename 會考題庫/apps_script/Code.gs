// ============================================================
// 會考題庫 — 作答紀錄收卷後端（Google Apps Script）
// 部署方式見同資料夾「試算表串接說明.md」
// 2026-07-23 增：非選手寫作答圖 → 存 Google Drive、寫「非選作答」表（供 AI 批改與老師覆核）
// ============================================================

// 簡易通行碼（可自行改，改了之後收卷網址的 ?token= 也要跟著改）
const TOKEN = 'math809';

// 取得（第一次自動建立）試算表
function _ss() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SHEET_ID');
  if (!id) {
    const ss = SpreadsheetApp.create('會考題庫作答紀錄');
    id = ss.getId();
    props.setProperty('SHEET_ID', id);
    const s1 = ss.getSheets()[0];
    s1.setName('作答紀錄');
    s1.appendRow(['上傳時間','試卷','班級','座號','姓名','得分','選擇題數','作答秒數','開始時間','交卷時間','紀錄JSON']);
    const s2 = ss.insertSheet('逐題明細');
    s2.appendRow(['上傳時間','試卷','班級','座號','題目ID','作答','正確']);
  }
  return SpreadsheetApp.openById(id);
}

// 取得（沒有就補建）「出題紀錄」工作表——記錄哪些題目曾出在卷上，防重複出題
function _assignSheet(ss) {
  let s = ss.getSheetByName('出題紀錄');
  if (!s) {
    s = ss.insertSheet('出題紀錄');
    s.appendRow(['紀錄時間', '試卷', '方式', '題目ID']);
  }
  return s;
}

// 取得（沒有就補建）「非選作答」工作表——一列一份手寫作答，含圖片連結與批改欄
function _essaySheet(ss) {
  let s = ss.getSheetByName('非選作答');
  if (!s) {
    s = ss.insertSheet('非選作答');
    s.appendRow(['上傳時間','試卷','班級','座號','姓名','題目ID','圖片連結','檔案ID','最後答案','AI級分','AI理由','AI信心','老師覆核級分','老師備註']);
  }
  return s;
}

// 取得（沒有就建）存手寫圖的 Drive 根資料夾
function _rootFolder() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('ESSAY_FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const f = DriveApp.createFolder('會考題庫非選作答');
  props.setProperty('ESSAY_FOLDER_ID', f.getId());
  return f;
}

// 每份試卷一個子資料夾
function _quizFolder(quiz) {
  const root = _rootFolder();
  const name = quiz || '未命名卷';
  const it = root.getFoldersByName(name);
  return it.hasNext() ? it.next() : root.createFolder(name);
}

// 把手寫圖存進 Drive、把連結寫進「非選作答」表
function _saveEssayImgs(ss, rec, imgs, now) {
  const folder = _quizFolder(rec.quiz);
  const s = _essaySheet(ss);
  const rows = [];
  imgs.forEach(function (im) {
    let link = '', fileId = '';
    try {
      const m = String(im.img || '').match(/^data:(image\/\w+);base64,(.*)$/);
      if (m) {
        const blob = Utilities.newBlob(
          Utilities.base64Decode(m[2]), m[1],
          (rec.quiz || '卷') + '_' + (rec.cls || '') + '_' + (rec.seat || '') + '_' + im.id + '.jpg');
        const file = folder.createFile(blob);
        // 以「知道連結的人可看」分享，讓老師與批改腳本能取圖（網址不可猜；學生個資請勿外流）
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileId = file.getId();
        link = file.getUrl();
      }
    } catch (err) { link = 'ERR:' + err; }
    rows.push([now, rec.quiz || '', String(rec.cls || ''), String(rec.seat || ''), rec.name || '',
               im.id, link, fileId, im.ans || '', '', '', '', '', '']);
  });
  if (rows.length) s.getRange(s.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

// 確保某欄存在（缺就補在最後一欄），回傳欄索引（0-based）
function _ensureCol(s, name) {
  const head = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0];
  let idx = head.indexOf(name);
  if (idx < 0) { s.getRange(1, s.getLastColumn() + 1).setValue(name); idx = head.length; }
  return idx;
}

// 自動去重：同 班+座+題目ID 只留「上傳時間」最新的一筆（學生重交只算最後一次）
function _dedupeLatest(rows) {
  const best = {};
  rows.forEach(r => {
    const k = String(r['班級']) + '|' + String(r['座號']) + '|' + String(r['題目ID']);
    let t = 0; try { t = new Date(r['上傳時間']).getTime() || 0; } catch (e) {}
    if (!best[k] || t >= best[k]._t) { r._t = t; best[k] = r; }
  });
  return Object.keys(best).map(k => { const r = best[k]; delete r._t; return r; });
}

// 學生交卷 → 寫入紀錄；出卷（kind:'assign'）→ 寫入出題紀錄
function doPost(e) {
  try {
    if ((e.parameter || {}).token !== TOKEN) {
      return _json({ ok: false, error: 'token 錯誤' });
    }
    const rec = JSON.parse(e.postData.contents);
    const ss = _ss();
    if (rec.kind === 'assign') {
      const s = _assignSheet(ss);
      const now = new Date();
      const rows = (rec.ids || []).map(id => [now, rec.quiz || '', rec.mode || '', String(id)]);
      if (rows.length) s.getRange(s.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
      return _json({ ok: true, n: rows.length });
    }
    if (rec.kind === 'essay_grade') {
      // 批改腳本回寫 AI 初評：依「檔案ID」對應列，部分更新 AI級分／AI理由／AI信心／AI辨識內容
      const s = ss.getSheetByName('非選作答');
      if (!s) return _json({ ok: false, error: '尚無非選作答表' });
      const tcCol = _ensureCol(s, 'AI辨識內容');  // 新欄（缺就補），存「AI 讀到的內容」供對照OCR
      const vals = s.getDataRange().getValues();
      const head = vals[0];
      const idCol = head.indexOf('檔案ID');
      const lvCol = head.indexOf('AI級分'), rsCol = head.indexOf('AI理由'), cfCol = head.indexOf('AI信心');
      const map = {};
      (rec.updates || []).forEach(u => { map[String(u.fileId)] = u; });
      let n = 0;
      for (let i = 1; i < vals.length; i++) {
        const u = map[String(vals[i][idCol])];
        if (u) {
          if ('level' in u) s.getRange(i + 1, lvCol + 1).setValue(u.level);
          if ('reason' in u) s.getRange(i + 1, rsCol + 1).setValue(u.reason || '');
          if ('confidence' in u) s.getRange(i + 1, cfCol + 1).setValue(u.confidence == null ? '' : u.confidence);
          if ('transcript' in u) s.getRange(i + 1, tcCol + 1).setValue(u.transcript || '');
          n++;
        }
      }
      return _json({ ok: true, updated: n });
    }
    if (rec.kind === 'essay_review') {
      // 老師覆核定分：依「檔案ID」回寫 老師覆核級分／老師備註（學生查成績只看這個）
      const s = ss.getSheetByName('非選作答');
      if (!s) return _json({ ok: false, error: '尚無非選作答表' });
      const vals = s.getDataRange().getValues();
      const head = vals[0];
      const idCol = head.indexOf('檔案ID');
      const lvCol = head.indexOf('老師覆核級分'), rmCol = head.indexOf('老師備註');
      const map = {};
      (rec.updates || []).forEach(u => { map[String(u.fileId)] = u; });
      let n = 0;
      for (let i = 1; i < vals.length; i++) {
        const u = map[String(vals[i][idCol])];
        if (u) {
          s.getRange(i + 1, lvCol + 1).setValue(u.level);
          if (u.comment != null) s.getRange(i + 1, rmCol + 1).setValue(u.comment);
          n++;
        }
      }
      return _json({ ok: true, updated: n });
    }
    const now = new Date();
    // 先抽出手寫圖，避免整包 base64 塞進儲存格（Sheet 單格上限約 5 萬字元）
    const essayImgs = rec.essay_imgs || [];
    delete rec.essay_imgs;
    ss.getSheetByName('作答紀錄').appendRow([
      now, rec.quiz || '', String(rec.cls || ''), String(rec.seat || ''), rec.name || '',
      rec.score, rec.total_auto, rec.dur_s, rec.ts_start || '', rec.ts_submit || '',
      JSON.stringify(rec),
    ]);
    const s2 = ss.getSheetByName('逐題明細');
    const rows = (rec.answers || []).map(a =>
      [now, rec.quiz || '', String(rec.cls || ''), String(rec.seat || ''), a.id, a.a, a.ok === null ? '' : (a.ok ? 'O' : 'X')]);
    if (rows.length) s2.getRange(s2.getLastRow() + 1, 1, rows.length, 7).setValues(rows);
    // 非選手寫圖 → Drive + 非選作答表
    if (essayImgs.length) _saveEssayImgs(ss, rec, essayImgs, now);
    return _json({ ok: true, n_essay: essayImgs.length });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

// 老師端讀取：
//   ?token=math809&setup=1            → 初始化並回覆試算表網址
//   ?token=math809&list=1             → 全部紀錄（JSON 陣列）
//   ?token=math809&list=1&quiz=卷名   → 只取某份卷
//   ?token=math809&list=1&cls=309     → 只取某班
//   ?token=math809&assigned=1         → 出題紀錄（{題目ID: [卷名, …]}）
//   ?token=math809&essays=1(&quiz=&cls=) → 非選作答（含圖片連結/檔案ID/AI批改欄，供批改腳本與覆核）
function doGet(e) {
  const p = e.parameter || {};
  if (p.token !== TOKEN) return ContentService.createTextOutput('token 錯誤');
  const ss = _ss();
  if (p.setup) return ContentService.createTextOutput('✅ 試算表已就緒：' + ss.getUrl());
  if (p.assigned) {
    const vals = _assignSheet(ss).getDataRange().getValues().slice(1);
    const m = {};
    vals.forEach(r => {
      const id = String(r[3]);
      if (!id) return;
      if (!m[id]) m[id] = [];
      if (r[1] && m[id].indexOf(r[1]) < 0) m[id].push(r[1]);
    });
    return _json(m);
  }
  if (p.essays) {
    const s = ss.getSheetByName('非選作答');
    if (!s) return _json([]);
    const vals = s.getDataRange().getValues();
    const head = vals[0];
    let out = vals.slice(1).map(r => { const o = {}; head.forEach((h, i) => o[h] = r[i]); return o; });
    if (p.quiz) out = out.filter(r => r['試卷'] === p.quiz);
    if (p.cls) out = out.filter(r => String(r['班級']) === String(p.cls));
    if (!p.dupes) out = _dedupeLatest(out);   // 預設自動去重（同班座題留最新）；&dupes=1 看全部
    return _json(out);
  }
  if (p.myresult) {
    // 學生查自己成績：必須帶 班級+座號，只回自己的（自動去重）、且只看老師覆核級分（未覆核=空=批改中）
    if (!p.cls || !p.seat) return _json([]);
    const s = ss.getSheetByName('非選作答');
    if (!s) return _json([]);
    const vals = s.getDataRange().getValues();
    const head = vals[0];
    const objs = vals.slice(1).map(r => { const o = {}; head.forEach((h, i) => o[h] = r[i]); return o; })
      .filter(r => (!p.quiz || String(r['試卷']) === String(p.quiz)) &&
                   String(r['班級']) === String(p.cls) && String(r['座號']) === String(p.seat));
    const out = _dedupeLatest(objs).map(r => ({
      qid: r['題目ID'], img: r['圖片連結'], myans: r['最後答案'],
      level: r['老師覆核級分'], comment: r['老師備註'],
      ai_level: r['AI級分'], reason: r['AI理由'], transcript: r['AI辨識內容'],
    }));
    return _json(out);
  }
  const vals = ss.getSheetByName('作答紀錄').getDataRange().getValues().slice(1);
  let recs = vals.map(r => { try { return JSON.parse(r[10]); } catch (err) { return null; } }).filter(Boolean);
  if (p.quiz) recs = recs.filter(r => r.quiz === p.quiz);
  if (p.cls) recs = recs.filter(r => String(r.cls) === String(p.cls));
  return _json(recs);
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
