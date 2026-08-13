# -*- coding: utf-8 -*-
"""
產生「非選擇題詳解卷」PDF（A4，老師自用／檢討課發下）。
每題：題目圖 ＋ 參考答案 ＋ 詳解 ＋ 解題步驟 ＋ 陷阱提示 ＋ 0～3 級分給分標準。

⚠ 含答案與詳解，**不要**放進學生作答站；發下前先確認是檢討課用。

用法：
  python scripts/make_essay_solution.py --ids G0813-N1 G0813-N2 --title "數學非選練習卷 第1~2冊（0813）" --out xxx.pdf
  python scripts/make_essay_solution.py --ids 114-N1 114-N2      # 官方題也可以
"""
import os, sys, re, json, glob, argparse
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Image,
                                PageBreak, KeepTogether)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
from config import get as _cfg  # noqa: E402  字型清單集中在 data/config.json

FONT = "JhengHei"
for fp in _cfg("font_files"):
    try:
        pdfmetrics.registerFont(TTFont(FONT, fp, subfontIndex=0)); break
    except Exception:
        continue
else:
    FONT = "Helvetica"

# 微軟正黑體缺這幾個字（實測 cmap），直接畫會變成方框 → 換成同義且有字形的
SAFE = {"≤": "≦", "≥": "≧", "⟺": "等價於", "⇔": "等價於", "⇒": "→", "−": "-",
        "✓": "√", "✔": "√", "✗": "×", "≈": "約", "∼": "～"}


def safe(s):
    s = str(s if s is not None else "")
    for a, b in SAFE.items():
        s = s.replace(a, b)
    return s


def P(text, style, raw=False):
    """換行轉 <br/>，並跳脫 XML 保留字（規準文字裡有 < >）。raw=True 時保留自己寫的標籤。"""
    t = safe(text)
    if not raw:
        t = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return Paragraph(t.replace("\n", "<br/>"), style)


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


def styles():
    base = dict(fontName=FONT)
    return {
        "h1": ParagraphStyle("h1", **base, fontSize=15, spaceAfter=2, leading=20),
        "sub": ParagraphStyle("sub", **base, fontSize=9.5, leading=14,
                              textColor=colors.HexColor("#666"), spaceAfter=8),
        "sec": ParagraphStyle("sec", **base, fontSize=11.5, spaceBefore=9, spaceAfter=3,
                              textColor=colors.HexColor("#1a4d80")),
        "body": ParagraphStyle("body", **base, fontSize=10.5, leading=17),
        "ans": ParagraphStyle("ans", **base, fontSize=11.5, leading=18,
                              textColor=colors.HexColor("#0a6b3d")),
        "lvl": ParagraphStyle("lvl", **base, fontSize=10, leading=16, leftIndent=6),
        "note": ParagraphStyle("note", **base, fontSize=9, textColor=colors.HexColor("#8a5a00"),
                               leading=14, spaceBefore=6),
        "foot": ParagraphStyle("foot", **base, fontSize=8, textColor=colors.HexColor("#888")),
    }


def qlabel(q):
    if q.get("type") == "essay":
        return f"非選第 {q['id'].split('N')[-1]} 題"
    return f"第 {q.get('num', '')} 題"


def build(qs, rubrics, out_path, title=""):
    S = styles()
    doc = SimpleDocTemplate(str(out_path), pagesize=A4,
                            leftMargin=18 * mm, rightMargin=18 * mm,
                            topMargin=16 * mm, bottomMargin=14 * mm,
                            title=title or "非選詳解卷")
    avail = doc.width
    story = []
    if title:
        story += [P(title, S["h1"]), P("詳解與給分標準（老師用／檢討課）", S["sub"])]

    for i, q in enumerate(qs):
        if i or title:
            story.append(Spacer(1, 4))
        topic = re.sub(r"（非選第.題）", "", q.get("topic", "")).strip()
        story.append(P(qlabel(q), S["h1"]))
        meta = "　｜　".join(x for x in [
            topic, q.get("book", ""), q.get("chapter", ""),
            "／".join(q.get("codes", [])), q.get("difficulty", "")] if x)
        story.append(P(meta, S["sub"]))

        ip = ROOT / q.get("img", "")
        if ip.exists():
            from reportlab.lib.utils import ImageReader
            iw, ih = ImageReader(str(ip)).getSize()
            w = min(avail, iw * 0.62)
            story.append(Image(str(ip), width=w, height=ih * (w / iw)))
            story.append(Spacer(1, 6))

        story.append(P("參考答案", S["sec"]))
        story.append(P(q.get("answer", ""), S["ans"]))

        story.append(P("詳解", S["sec"]))
        story.append(P(q.get("solution", ""), S["body"]))

        if q.get("steps"):
            story.append(P("解題步驟", S["sec"]))
            story.append(P("\n".join(f"{n}. {s}" for n, s in enumerate(q["steps"], 1)), S["body"]))

        if q.get("trap"):
            story.append(P("易錯／陷阱", S["sec"]))
            story.append(P(q["trap"], S["body"]))

        r = rubrics.get(q["id"])
        if r:
            story.append(P("給分標準（0～3 級分）", S["sec"]))
            g = r.get("guide", {})
            for key, name in [("l3", "三級分"), ("l2", "二級分"), ("l1", "一級分"), ("l0", "零級分")]:
                if g.get(key):
                    story.append(KeepTogether([
                        P(f"<b>{name}</b>", S["lvl"], raw=True),
                        P(g[key], S["lvl"]),
                        Spacer(1, 5)]))
            if r.get("confidence") == "generated":
                story.append(P("※ 本題評分規準依官方逐級分指引的結構生成，非官方原件；"
                               "AI 初評後仍以老師覆核為準。", S["note"]))
            elif r.get("official_guide_available"):
                story.append(P("※ 評分規準取自心測中心官方逐級分指引。", S["note"]))

        if i < len(qs) - 1:
            story.append(PageBreak())

    def footer(c, d):
        c.setFont(FONT, 8); c.setFillGray(0.55)
        c.drawCentredString(A4[0] / 2, 8 * mm, "本卷僅供班級教學使用，請勿散布")
        c.drawRightString(A4[0] - 18 * mm, 8 * mm, str(c.getPageNumber()))
        c.setFillGray(0)

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(f"written: {out_path}  ({os.path.getsize(out_path)/1024:.0f} KB, {len(qs)} 題)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ids", nargs="*", required=True, help="題目ID，如 G0813-N1 G0813-N2")
    ap.add_argument("--title", default="", help="卷名（印在第一頁）")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    allq = load_questions()
    miss = [i for i in args.ids if i not in allq]
    if miss:
        sys.exit(f"✗ 找不到題目：{', '.join(miss)}")
    rubrics = json.load(open(ROOT / "data" / "essay_rubrics.json", encoding="utf-8"))["questions"]
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    build([allq[i] for i in args.ids], rubrics, out, title=args.title)


if __name__ == "__main__":
    main()
