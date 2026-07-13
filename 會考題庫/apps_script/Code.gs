// ============================================================
// 會考題庫 — 作答紀錄收卷後端（Google Apps Script）
// 部署方式見同資料夾「試算表串接說明.md」
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

// 學生交卷 → 寫入兩張工作表
function doPost(e) {
  try {
    if ((e.parameter || {}).token !== TOKEN) {
      return _json({ ok: false, error: 'token 錯誤' });
    }
    const rec = JSON.parse(e.postData.contents);
    const ss = _ss();
    const now = new Date();
    ss.getSheetByName('作答紀錄').appendRow([
      now, rec.quiz || '', String(rec.cls || ''), String(rec.seat || ''), rec.name || '',
      rec.score, rec.total_auto, rec.dur_s, rec.ts_start || '', rec.ts_submit || '',
      JSON.stringify(rec),
    ]);
    const s2 = ss.getSheetByName('逐題明細');
    const rows = (rec.answers || []).map(a =>
      [now, rec.quiz || '', String(rec.cls || ''), String(rec.seat || ''), a.id, a.a, a.ok === null ? '' : (a.ok ? 'O' : 'X')]);
    if (rows.length) s2.getRange(s2.getLastRow() + 1, 1, rows.length, 7).setValues(rows);
    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

// 老師端讀取：
//   ?token=math809&setup=1            → 初始化並回覆試算表網址
//   ?token=math809&list=1             → 全部紀錄（JSON 陣列）
//   ?token=math809&list=1&quiz=卷名   → 只取某份卷
//   ?token=math809&list=1&cls=309     → 只取某班
function doGet(e) {
  const p = e.parameter || {};
  if (p.token !== TOKEN) return ContentService.createTextOutput('token 錯誤');
  const ss = _ss();
  if (p.setup) return ContentService.createTextOutput('✅ 試算表已就緒：' + ss.getUrl());
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
