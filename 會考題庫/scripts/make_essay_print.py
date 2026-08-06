# -*- coding: utf-8 -*-
"""
產生「非選擇題紙本作答卷」PDF（A4，可下載列印）。
每題一頁：題目圖 + 作答區（學生在紙上寫完，可拍照／掃描上傳）。

用法：
  python scripts/make_essay_print.py                         # 全部 26 題（103-115）
  python scripts/make_essay_print.py --years 104-114         # 指定年份範圍
  python scripts/make_essay_print.py --ids 113-N1 114-N2     # 指定題目
  python scripts/make_essay_print.py --out xxx.pdf
"""
import os, sys, re, json, glob, argparse
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

# 中文字型（微軟正黑體 ttc）
FONT = "JhengHei"
sys.path.insert(0, str(HERE))
from config import get as _cfg  # noqa: E402  字型清單集中在 data/config.json
for fp, idx in [(f, 0) for f in _cfg("font_files")]:
    try:
        pdfmetrics.registerFont(TTFont(FONT, fp, subfontIndex=idx)); break
    except Exception:
        continue
else:
    FONT = "Helvetica"  # 退回（中文會缺字，但不會壞）


def load_questions():
    out = {}
    for f in sorted(glob.glob(str(ROOT / "data" / "questions_*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        qs = d if isinstance(d, list) else d.get("questions", d)
        if isinstance(qs, dict):
            qs = list(qs.values())
        for q in qs:
            out[q["id"]] = q
    return out


def clean_topic(t):
    return re.sub(r"（非選第.題）", "", t or "").strip()


def cover(c, W, H, title, url, n_choice, n_essay):
    """紙本第一頁：卷名＋QR code＋作答說明。學生寫完紙本後掃 QR 上傳。"""
    import tempfile
    m = 48
    c.setFont(FONT, 20)
    c.drawCentredString(W / 2, H - m - 24, title)
    c.setFont(FONT, 11); c.setFillGray(0.35)
    parts = []
    if n_choice: parts.append(f"選擇題 {n_choice} 題")
    if n_essay: parts.append(f"非選擇題 {n_essay} 題")
    c.drawCentredString(W / 2, H - m - 48, "　".join(parts))
    c.setFillGray(0)

    # QR code
    try:
        import qrcode
        img = qrcode.make(url)
        tf = tempfile.NamedTemporaryFile(delete=False, suffix=".png"); tf.close()
        img.save(tf.name)
        size = 190
        c.drawImage(tf.name, (W - size) / 2, H - m - 90 - size, size, size)
        os.unlink(tf.name)
        y = H - m - 105 - size
    except Exception:
        y = H - m - 110
    c.setFont(FONT, 12)
    c.drawCentredString(W / 2, y, "寫完後，用平板掃描上方 QR code 上傳作答")
    c.setFont(FONT, 9.5); c.setFillGray(0.4)
    c.drawCentredString(W / 2, y - 18, url)
    c.setFillGray(0)

    steps = [
        "作答方式",
        "一、在本紙本上作答（也可以直接用平板線上作答，題目網站上都有）。",
        "二、寫完後用平板掃描上方 QR code 進入作答網站。",
        "三、填寫班級、座號，選擇題直接點選 A / B / C / D。",
        "四、非選擇題按「拍照／上傳」把你寫的計算過程拍照上傳",
        "　　（系統會自動抓正、加強對比，變成清楚的掃描檔）。",
        "五、確認後按「交卷」。選擇題會立刻對答案；",
        "　　非選擇題由老師批改，之後可回到同一個網址按「查我的批改結果」。",
    ]
    yy = y - 56
    for i, s in enumerate(steps):
        c.setFont(FONT, 12 if i == 0 else 10.5)
        c.drawString(m + 30, yy, s)
        yy -= (22 if i == 0 else 18)

    c.setFont(FONT, 8); c.setFillGray(0.5)
    c.drawCentredString(W / 2, m - 6, "本卷僅供班級教學使用")
    c.setFillGray(0)
    c.showPage()


def build(questions, out_path, title="", url="", with_cover=False):
    W, H = A4
    m = 40
    c = canvas.Canvas(str(out_path), pagesize=A4)
    if with_cover and url:
        n_ch = sum(1 for q in questions if q.get("type") != "essay")
        n_es = sum(1 for q in questions if q.get("type") == "essay")
        cover(c, W, H, title or "作答卷", url, n_ch, n_es)
    def footer():
        c.setFont(FONT, 8); c.setFillGray(0.5)
        c.drawCentredString(W / 2, m - 2, "本卷僅供班級教學使用，請勿散布")
        c.setFillGray(0)

    def qlabel(q):
        if q.get("type") == "essay":
            return f"非選第 {q['id'].split('N')[-1]} 題"
        return f"第 {q.get('num','')} 題"

    # 選擇題：連續流排（一頁塞得下幾題就幾題）；非選題：各佔一頁並附作答框
    choices = [q for q in questions if q.get("type") != "essay"]
    essays  = [q for q in questions if q.get("type") == "essay"]

    y = H - m - 18
    if choices:
        c.setFont(FONT, 13); c.drawString(m, y, "第一部分：選擇題")
        y -= 22
    for q in choices:
        ip = ROOT / q["img"]
        if not ip.exists():
            continue
        ir = ImageReader(str(ip)); iw, ih = ir.getSize()
        sc = min((W - 2 * m) / iw, (H - 2 * m) * 0.42 / ih)
        dw, dh = iw * sc, ih * sc
        if y - dh < m + 26:                      # 這頁放不下 → 換頁
            footer(); c.showPage(); y = H - m - 18
        c.drawImage(ir, m, y - dh, dw, dh, preserveAspectRatio=True, mask="auto")
        y -= dh + 14
    if choices:
        footer(); c.showPage()

    for q in essays:
        c.setFont(FONT, 14)
        c.drawString(m, H - m - 6, qlabel(q))
        topic = clean_topic(q.get("topic", ""))
        if topic:
            c.setFont(FONT, 10.5); c.setFillGray(0.35)
            c.drawString(m, H - m - 26, topic); c.setFillGray(0)
        c.setStrokeGray(0.85); c.line(m, H - m - 34, W - m, H - m - 34)
        ip = ROOT / q["img"]
        top = H - m - 46
        if ip.exists():
            ir = ImageReader(str(ip)); iw, ih = ir.getSize()
            sc = min((W - 2 * m) / iw, (H - 2 * m) * 0.44 / ih)
            dw, dh = iw * sc, ih * sc
            c.drawImage(ir, m, top - dh, dw, dh, preserveAspectRatio=True, mask="auto")
            ya = top - dh - 22
        else:
            ya = top - 40
        c.setFont(FONT, 11)
        c.drawString(m, ya, "作答區（請寫出完整計算過程；寫完用平板拍照上傳）")
        c.setStrokeGray(0.8)
        c.rect(m, m + 16, W - 2 * m, (ya - 16) - (m + 16))
        footer(); c.showPage()

    c.save()
    print(f"written: {out_path}  ({os.path.getsize(out_path)/1024:.0f} KB, {len(questions)} 題)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--years", default="", help="年份範圍如 104-114（含）")
    ap.add_argument("--ids", nargs="*", default=[], help="指定題目ID，如 113-N1 114-N2")
    ap.add_argument("--out", default=str(ROOT / "backup" / "非選練習卷_紙本.pdf"))
    ap.add_argument("--title", default="", help="卷名（印在封面）")
    ap.add_argument("--url", default="", help="作答網址（產生 QR code 封面）")
    args = ap.parse_args()

    ess = load_questions()
    ids = list(ess.keys())
    if args.ids:
        ids = [i for i in args.ids if i in ess]
    elif args.years:
        a, b = (args.years.split("-") + [args.years])[:2]
        lo, hi = int(a), int(b)
        ids = [i for i in ids if lo <= ess[i]["year"] <= hi]
    ids.sort(key=lambda i: (str(ess[i]["year"]), i))
    build([ess[i] for i in ids], Path(args.out),
          title=args.title, url=args.url, with_cover=bool(args.url))


if __name__ == "__main__":
    main()
