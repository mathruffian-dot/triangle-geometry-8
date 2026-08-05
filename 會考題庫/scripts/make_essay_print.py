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
for fp, idx in [("C:/Windows/Fonts/msjh.ttc", 0), ("C:/Windows/Fonts/msjhbd.ttc", 0),
                ("C:/Windows/Fonts/mingliu.ttc", 0)]:
    try:
        pdfmetrics.registerFont(TTFont(FONT, fp, subfontIndex=idx)); break
    except Exception:
        continue
else:
    FONT = "Helvetica"  # 退回（中文會缺字，但不會壞）


def load_essays():
    out = {}
    for f in sorted(glob.glob(str(ROOT / "data" / "questions_*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        qs = d if isinstance(d, list) else d.get("questions", d)
        if isinstance(qs, dict):
            qs = list(qs.values())
        for q in qs:
            if q.get("type") == "essay":
                out[q["id"]] = q
    return out


def clean_topic(t):
    return re.sub(r"（非選第.題）", "", t or "").strip()


def build(questions, out_path):
    W, H = A4
    m = 40
    c = canvas.Canvas(str(out_path), pagesize=A4)
    for q in questions:
        n = q["id"].split("N")[-1]
        # 標題
        c.setFont(FONT, 15)
        c.drawString(m, H - m - 6, f"{q['year']} 年國中教育會考數學　非選第 {n} 題")
        topic = clean_topic(q.get("topic", ""))
        if topic:
            c.setFont(FONT, 10.5); c.setFillGray(0.35)
            c.drawString(m, H - m - 26, topic); c.setFillGray(0)
        c.setStrokeGray(0.85); c.line(m, H - m - 34, W - m, H - m - 34)

        # 題目圖（上半，最多佔約一半頁高）
        img_path = ROOT / q["img"]
        img_top = H - m - 46
        if img_path.exists():
            ir = ImageReader(str(img_path))
            iw, ih = ir.getSize()
            avail_w = W - 2 * m
            max_h = (H - 2 * m) * 0.50
            s = min(avail_w / iw, max_h / ih)
            dw, dh = iw * s, ih * s
            c.drawImage(ir, m, img_top - dh, dw, dh, preserveAspectRatio=True, mask="auto")
            y_ans = img_top - dh - 22
        else:
            c.setFont(FONT, 11); c.drawString(m, img_top - 20, f"[缺圖：{q['img']}]")
            y_ans = img_top - 40

        # 作答區
        c.setFont(FONT, 11)
        c.drawString(m, y_ans, "作答區（請寫出完整計算過程；寫完可拍照／掃描上傳）")
        c.setStrokeGray(0.8)
        c.rect(m, m + 16, W - 2 * m, (y_ans - 16) - (m + 16))

        # 頁尾
        c.setFont(FONT, 8); c.setFillGray(0.5)
        c.drawCentredString(W / 2, m - 2, "題目版權屬國立臺灣師範大學心理與教育測驗研究發展中心，僅供教學使用")
        c.setFillGray(0)
        c.showPage()
    c.save()
    print(f"written: {out_path}  ({os.path.getsize(out_path)/1024:.0f} KB, {len(questions)} 頁)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--years", default="", help="年份範圍如 104-114（含）")
    ap.add_argument("--ids", nargs="*", default=[], help="指定題目ID，如 113-N1 114-N2")
    ap.add_argument("--out", default=str(ROOT / "backup" / "非選練習卷_紙本.pdf"))
    args = ap.parse_args()

    ess = load_essays()
    ids = list(ess.keys())
    if args.ids:
        ids = [i for i in args.ids if i in ess]
    elif args.years:
        a, b = (args.years.split("-") + [args.years])[:2]
        lo, hi = int(a), int(b)
        ids = [i for i in ids if lo <= ess[i]["year"] <= hi]
    ids.sort(key=lambda i: (ess[i]["year"], i))
    build([ess[i] for i in ids], Path(args.out))


if __name__ == "__main__":
    main()
