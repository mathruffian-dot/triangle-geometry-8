# -*- coding: utf-8 -*-
"""
make_review_sheet.py — 產生「一頁看完」的非選覆核彙整頁（老師本機用）

覆核頁一份份點太慢，這支把一份卷的所有作答排成一頁：
每份 = 學生／級分／AI 理由與信心／官方評分指引／題目圖／紅筆批改圖（含續寫解答）。
老師捲一遍就能決定哪幾份要改分，再到 math809-bank 的「✍ 非選覆核」按 0-3 定分。

⚠ 產出含學生姓名、座號與手寫作答，**屬個資，只在本機看，不可上傳公開處**。

用法：
  python scripts/make_review_sheet.py --quiz "翰林模擬會考 111年第1次（第1~2冊）｜科資班"
  python scripts/make_review_sheet.py --quiz "…" --out review_sheet.html
"""
import argparse
import html
import json
import sys
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
RUBRICS = ROOT / "data" / "essay_rubrics.json"
DEFAULT_URL = ("https://script.google.com/macros/s/AKfycbw-ePEfCoTB3SpwOh4g0IcfwsQWanQm8bvXgOGDdIECkK2845q"
               "IoKhH9xtRNuxu29wN/exec?token=math809")
BANK_URL = "https://math809-bank.pages.dev"
LOW_CONF = 0.7


def esc(s):
    return html.escape(str(s if s is not None else ""))


def fetch(url, quiz):
    sep = "&" if "?" in url else "?"
    full = url + sep + "essays=1" + (f"&quiz={urllib.parse.quote(quiz)}" if quiz else "")
    with urllib.request.urlopen(full, timeout=180) as r:
        return json.loads(r.read().decode())


def level_of(r):
    """老師覆核優先，否則 AI。0 是合法級分，不可用 or 串接。"""
    for k in ("老師覆核級分", "AI級分"):
        v = r.get(k)
        if v == 0 or str(v or "").strip() != "":
            return str(v), (k == "老師覆核級分")
    return "", False


CSS = """
:root{--bd:#e5e7eb;--sub:#6b7280;--red:#b91c1c;--warn:#b45309}
*{box-sizing:border-box}
body{margin:0;font-family:"Microsoft JhengHei","Segoe UI",sans-serif;background:#f8fafc;color:#111827;line-height:1.6}
header{position:sticky;top:0;z-index:9;background:#1e293b;color:#fff;padding:12px 20px;box-shadow:0 2px 8px rgba(0,0,0,.2)}
header h1{margin:0 0 4px;font-size:17px}
header .meta{font-size:13px;opacity:.85}
header a{color:#93c5fd}
.jump{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.jump a{background:#334155;color:#e2e8f0;padding:3px 9px;border-radius:99px;font-size:12px;text-decoration:none}
.jump a.low{background:#7c2d12;color:#fed7aa}
.jump a.todo{background:#1e40af;color:#dbeafe}
main{padding:16px;max-width:1100px;margin:0 auto}
.card{background:#fff;border:1px solid var(--bd);border-radius:12px;padding:14px 16px;margin-bottom:18px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.hd{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;border-bottom:1px solid var(--bd);padding-bottom:8px;margin-bottom:10px}
.who{font-size:17px;font-weight:700}
.qid{color:var(--sub);font-size:13px}
.lv{font-size:20px;font-weight:800;padding:1px 12px;border-radius:8px;background:#f1f5f9}
.lv3{color:#15803d;background:#dcfce7}.lv2{color:#1d4ed8;background:#dbeafe}
.lv1{color:#b45309;background:#fef3c7}.lv0{color:#b91c1c;background:#fee2e2}
.tag{font-size:12px;padding:2px 8px;border-radius:99px;border:1px solid var(--bd);color:var(--sub)}
.tag.low{background:#fff7ed;border-color:#fdba74;color:var(--warn);font-weight:700}
.tag.todo{background:#eff6ff;border-color:#93c5fd;color:#1d4ed8;font-weight:700}
.tag.done{background:#f0fdf4;border-color:#86efac;color:#15803d}
.reason{background:#fffdf5;border:1px solid #fde68a;border-radius:8px;padding:8px 10px;font-size:14px;margin:8px 0}
details{margin:8px 0;font-size:14px}
summary{cursor:pointer;color:#1d4ed8;font-size:13px}
details .body{background:#f8fafc;border:1px solid var(--bd);border-radius:8px;padding:8px 10px;margin-top:6px;white-space:pre-wrap;font-size:13px}
img{max-width:100%;border:1px solid var(--bd);border-radius:8px;display:block;margin-top:6px;background:#fff}
.lbl{font-size:12px;color:var(--sub);margin-top:10px}
.miss{color:var(--red);font-size:13px}
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quiz", required=True)
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--out", default=str(ROOT / "review_sheet.html"))
    args = ap.parse_args()

    rows = fetch(args.url, args.quiz)
    rows = [r for r in rows if str(r.get("試卷", "")) == args.quiz] or rows
    if not rows:
        sys.exit("查無資料——確認卷名是否含班級後綴（如「｜科資班」）")
    rubrics = json.loads(RUBRICS.read_text(encoding="utf-8"))["questions"]

    rows.sort(key=lambda r: (str(r.get("座號", "")), str(r.get("題目ID", ""))))
    n_low = n_todo = 0
    cards, jumps = [], []

    for i, r in enumerate(rows):
        cls, seat = str(r.get("班級", "")), str(r.get("座號", ""))
        name, qid = str(r.get("姓名", "")), str(r.get("題目ID", ""))
        lv, by_teacher = level_of(r)
        try:
            conf = float(str(r.get("AI信心", "")).strip())
        except ValueError:
            conf = None
        low = conf is not None and conf < LOW_CONF and not by_teacher
        todo = not by_teacher
        n_low += bool(low); n_todo += bool(todo)

        anchor = f"s{i}"
        jumps.append(f'<a href="#{anchor}" class="{"low" if low else ("todo" if todo else "")}">'
                     f'{esc(seat)}·{esc(qid.split("-")[-1])}</a>')

        tags = []
        tags.append('<span class="tag done">已覆核</span>' if by_teacher
                    else '<span class="tag todo">未覆核</span>')
        if conf is not None:
            tags.append(f'<span class="tag {"low" if low else ""}">AI 信心 {conf:.2f}</span>')
        if low:
            tags.append('<span class="tag low">⚠ 建議人工確認</span>')

        reason = str(r.get("AI理由", "")).strip()
        reason = reason.split("]", 1)[-1].strip() if reason.startswith("[") else reason

        # 題目圖與紅筆圖（相對路徑，靠本機 http server 提供）
        year = qid.split("-")[0]
        qimg = ROOT / "01_題目圖片" / year / f"{qid}.png"
        redpen = ROOT / "redpen_out" / f"{cls}-{seat}_{qid}.png"

        body = [f'<div class="card" id="{anchor}">']
        body.append('<div class="hd">')
        body.append(f'<span class="who">{esc(seat)} {esc(name)}</span>')
        body.append(f'<span class="qid">{esc(qid)}</span>')
        body.append(f'<span class="lv lv{esc(lv) if lv in "0123" else ""}">{esc(lv) or "未批"} / 3</span>')
        body.extend(tags)
        body.append("</div>")

        if reason:
            body.append(f'<div class="reason"><b>AI 評分理由：</b>{esc(reason)}</div>')
        if r.get("老師備註"):
            body.append(f'<div class="reason"><b>你的備註：</b>{esc(r["老師備註"])}</div>')
        if r.get("AI辨識內容"):
            body.append('<details><summary>🔎 AI 讀到的內容（對照圖檢查有沒有讀錯）</summary>'
                        f'<div class="body">{esc(r["AI辨識內容"])}</div></details>')

        rb = rubrics.get(qid)
        if rb:
            g = rb.get("guide", {})
            gtxt = "\n".join(f"{k[1]} 級：{g.get(k, '')}" for k in ("l3", "l2", "l1", "l0") if g.get(k))
            body.append('<details><summary>📋 官方評分指引與參考答案</summary>'
                        f'<div class="body">{esc(gtxt)}\n\n【參考答案】\n{esc(rb.get("answer_points", ""))}</div></details>')
        if qimg.exists():
            body.append('<details><summary>📄 題目</summary>'
                        f'<div class="body"><img src="01_題目圖片/{esc(year)}/{esc(qid)}.png"></div></details>')

        body.append('<div class="lbl">紅筆批改（含續寫解答）：</div>')
        if redpen.exists():
            body.append(f'<img src="redpen_out/{esc(redpen.name)}">')
        else:
            body.append('<div class="miss">⚠ 找不到紅筆圖，請先跑 make_redpen.py</div>')
        body.append("</div>")
        cards.append("\n".join(body))

    people = len({str(r.get("座號")) for r in rows})
    head = (f'<header><h1>✍ 非選覆核彙整　{esc(args.quiz)}</h1>'
            f'<div class="meta">{people} 人／{len(rows)} 份　·　未覆核 {n_todo} 份　·　'
            f'低信心待確認 {n_low} 份　·　定分請到 '
            f'<a href="{BANK_URL}" target="_blank">覆核頁</a>（快捷鍵 0-3 給分、J/K 上下份）</div>'
            f'<div class="jump">{"".join(jumps)}</div></header>')

    out = Path(args.out)
    out.write_text(f'<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">'
                   f'<meta name="viewport" content="width=device-width,initial-scale=1">'
                   f'<title>非選覆核彙整 {esc(args.quiz)}</title><style>{CSS}</style></head>'
                   f'<body>{head}<main>{"".join(cards)}</main></body></html>', encoding="utf-8")
    print(f"已產生：{out}")
    print(f"  {people} 人／{len(rows)} 份　未覆核 {n_todo}　低信心待確認 {n_low}")
    print("  ⚠ 內含學生姓名與手寫作答，屬個資，只在本機看、不要上傳公開處")


if __name__ == "__main__":
    import urllib.parse  # noqa: E402  （供 fetch 的 quote 使用）
    main()
