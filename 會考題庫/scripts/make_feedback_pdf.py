# -*- coding: utf-8 -*-
"""每人一張「非選作答回饋單」PDF：
   題目圖 ＋ 學生作答圖 ＋ AI 讀到的內容（對照OCR）＋ 得分 ＋ 視覺化失分說明。
用法：
   python scripts/make_feedback_pdf.py --quiz "會考數學複習卷_非選0723" [--cls 902] [--out x.pdf]
資料來源：GAS 後端 ?essays=1（已自動去重）；圖片由 Drive 下載。
"""
import os, sys, re, argparse, tempfile
from pathlib import Path
import requests

sys.stdout.reconfigure(encoding="utf-8")
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Image,
                                Table, TableStyle, PageBreak, HRFlowable)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
FONT = "JhengHei"
for fp in _cfg("font_files"):
    try:
        pdfmetrics.registerFont(TTFont(FONT, fp, subfontIndex=0)); break
    except Exception:
        continue
else:
    FONT = "Helvetica"

DEFAULT_URL = os.environ.get("KAOKAO_SUBMIT_URL", _CFG_SUBMIT_URL())
CW = A4[0] - 2 * 18 * mm   # 內容寬度
ORDER_KEY = lambda q: (str(q).split('N')[0], str(q).split('N')[-1])
LV_COLOR = {"3": colors.HexColor("#059669"), "2": colors.HexColor("#0891b2"),
            "1": colors.HexColor("#d97706"), "0": colors.HexColor("#dc2626")}


def esc(s):
    return str(s if s is not None else "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def P(text, size=10, color=colors.black, bold=False, lead=None):
    st = ParagraphStyle("x", fontName=FONT, fontSize=size, leading=lead or size * 1.5,
                        textColor=color, wordWrap="CJK")
    if bold:
        text = "<b>" + text + "</b>"
    return Paragraph(text, st)


def clean_reason(reason):
    return re.sub(r"^\[[^\]]*\]\s*", "", str(reason or "")).strip()


def pick_level(r):
    """取級分：老師覆核優先，否則 AI。注意 0 級是合法值，不可用 `or` 串接。"""
    for k in ("老師覆核級分", "AI級分"):
        v = r.get(k)
        if v == 0 or str(v or "").strip() != "":
            return str(v)
    return ""


def img_flow(path, max_w, max_h):
    ir = ImageReader(path); iw, ih = ir.getSize()
    s = min(max_w / iw, max_h / ih)
    return Image(path, width=iw * s, height=ih * s)


def split_redpen(path):
    """紅筆圖若帶「續寫解答」區，沿那條橫貫整張的紅色分隔線切成兩段。

    回傳 (作答段路徑, 續寫段路徑)；沒有續寫區則回 (原路徑, None)。
    分開擺放才能讓兩段各自用滿版寬度——整張一起縮放會把續寫的字壓到看不清。
    """
    try:
        from PIL import Image as PILImage
        import numpy as np
        im = PILImage.open(path).convert("RGB")
        a = np.asarray(im)
        # 紅筆色約 (224,49,49)：紅通道明顯高於綠藍
        red = (a[:, :, 0] > 150) & (a[:, :, 1] < 110) & (a[:, :, 2] < 110)
        rows = red.sum(axis=1)
        W, H = im.size
        # 分隔線橫跨約整個寬度，且只會出現在圖的下半部
        cand = [y for y in range(int(H * 0.35), H) if rows[y] > W * 0.80]
        if not cand:
            return path, None
        cut = min(cand)
        if cut < H * 0.35 or cut > H * 0.97:
            return path, None
        base = str(path)
        p_top = base.replace(".png", "__top.png")
        p_bot = base.replace(".png", "__sol.png")
        im.crop((0, 0, W, cut)).save(p_top)
        im.crop((0, max(0, cut - int(H * 0.004)), W, H)).save(p_bot)
        return p_top, p_bot
    except Exception:
        return path, None


def dl_img(fid, link):
    urls = ([f"https://drive.google.com/uc?export=download&id={fid}"] if fid else []) + ([link] if link else [])
    for u in urls:
        try:
            r = requests.get(u, timeout=60)
            if r.status_code == 200 and r.content[:3] in (b"\xff\xd8\xff", b"\x89PN"):
                ext = "png" if r.content[:1] == b"\x89" else "jpg"
                f = tempfile.NamedTemporaryFile(delete=False, suffix="." + ext)
                f.write(r.content); f.close(); return f.name
        except Exception:
            continue
    return None


def box(flowable_or_text, bg, border):
    """把內容包一個底色框（用單格 Table）。"""
    inner = flowable_or_text if not isinstance(flowable_or_text, str) else P(flowable_or_text, 9.5)
    t = Table([[inner]], colWidths=[CW])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.6, border),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def fetch(url, quiz, cls):
    p = {"essays": 1}
    if quiz: p["quiz"] = quiz
    if cls: p["cls"] = cls
    sep = "&" if "?" in url else "?"
    full = url + sep + "&".join(f"{k}={requests.utils.quote(str(v))}" for k, v in p.items())
    return requests.get(full, timeout=60).json()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--quiz", required=True)
    ap.add_argument("--cls", default="")
    ap.add_argument("--out", default="")
    args = ap.parse_args()

    recs = fetch(args.url, args.quiz, args.cls)
    if not recs:
        sys.exit("查無作答資料（確認卷名／班級，且學生已交卷）")
    bystu = {}
    for x in recs:
        bystu.setdefault(f"{x['班級']}-{x['座號']}", {}).setdefault("name", x.get("姓名", ""))
        bystu[f"{x['班級']}-{x['座號']}"][x["題目ID"]] = x
    order = sorted({x["題目ID"] for x in recs}, key=lambda q: (int(str(q).split("-")[0]), q))

    out = args.out or str(ROOT / "backup" / f"回饋單_{args.quiz}.pdf")
    doc = SimpleDocTemplate(out, pagesize=A4, topMargin=16 * mm, bottomMargin=14 * mm,
                            leftMargin=18 * mm, rightMargin=18 * mm, title=f"非選回饋單_{args.quiz}")
    flow, tmpfiles = [], []
    for si, stu in enumerate(sorted(bystu)):
        d = bystu[stu]
        name = d.get("name", "")
        got = sum(int(pick_level(d[q])) for q in order if q in d and pick_level(d[q]) != "")
        mx = 3 * sum(1 for q in order if q in d)
        flow.append(P(f"非選作答回饋單　{esc(stu)}　{esc(name)}", 16, bold=True))
        flow.append(P(f"{esc(args.quiz)}　合計 <b>{got}</b> / {mx}", 10, colors.HexColor("#6b7280")))
        flow.append(Spacer(1, 4))
        for q in order:
            r = d.get(q)
            if not r:
                continue
            year = str(q).split("-")[0]; num = str(q).split("N")[-1]
            topic = r.get("題目ID", "")
            lv = pick_level(r)
            lvc = LV_COLOR.get(lv, colors.HexColor("#6b7280"))
            flow.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e5e7eb"), spaceBefore=8, spaceAfter=4))
            flow.append(P(f"{year}年 非選第{num}題　—　得分 <font color='{lvc.hexval()}'><b>{esc(lv) or '批改中'}</b></font> / 3", 12.5, bold=True))
            # 題目圖
            qimg = ROOT / f"01_題目圖片/{year}/{year}_NQ{num}.png"
            if qimg.exists():
                flow.append(P("題目：", 8.5, colors.HexColor("#6b7280")))
                flow.append(img_flow(str(qimg), CW, 62 * mm))
            # 作答圖：優先用紅筆批改版（原圖＋紅筆標註，原圖像素未更動）；沒有就用原圖
            redpen = ROOT / "redpen_out" / f"{stu}_{q}.png"
            if redpen.exists():
                top, sol = split_redpen(str(redpen))
                if top != str(redpen):
                    tmpfiles.append(top)
                flow.append(Spacer(1, 3))
                flow.append(P("老師批改（紅筆為批改標註，底下為你的原始作答）：", 8.5, colors.HexColor("#b91c1c")))
                flow.append(img_flow(top, CW, 105 * mm))
                if sol:
                    # 續寫解答另外整段呈現，才有足夠寬度把分數、算式看清楚
                    tmpfiles.append(sol)
                    flow.append(Spacer(1, 4))
                    flow.append(P("✍ 老師續寫的解答（照著訂正一遍）：", 9.5, bold=True))
                    flow.append(img_flow(sol, CW, 185 * mm))
            else:
                ai = dl_img(str(r.get("檔案ID", "")), r.get("圖片連結", ""))
                if ai:
                    tmpfiles.append(ai)
                    flow.append(Spacer(1, 3))
                    flow.append(P("學生作答：", 8.5, colors.HexColor("#6b7280")))
                    flow.append(img_flow(ai, CW, 95 * mm))
            if r.get("最後答案"):
                flow.append(P("學生填的最後答案：<b>" + esc(r["最後答案"]) + "</b>", 9))
            # AI 讀到的內容
            if r.get("AI辨識內容"):
                flow.append(Spacer(1, 3))
                flow.append(P("🔎 AI 讀到的內容（對照上圖，檢查有無讀錯）", 9.5, bold=True))
                flow.append(box(esc(r["AI辨識內容"]).replace("\n", "<br/>"), colors.HexColor("#fffdf5"), colors.HexColor("#fde68a")))
            # 失分／評分說明
            if r.get("AI理由"):
                flow.append(Spacer(1, 3))
                flow.append(P("📋 評分說明（依官方規準）", 9.5, bold=True))
                flow.append(box(esc(clean_reason(r["AI理由"])).replace("\n", "<br/>"), colors.HexColor("#f0f9ff"), colors.HexColor("#bae6fd")))
            if r.get("老師備註"):
                flow.append(box("老師評語：" + esc(r["老師備註"]), colors.HexColor("#fef2f2"), colors.HexColor("#fecaca")))
        if si != len(bystu) - 1:
            flow.append(PageBreak())

    doc.build(flow)
    for f in tmpfiles:
        try: os.unlink(f)
        except Exception: pass
    print(f"written: {out}　（{len(bystu)} 位學生）")


if __name__ == "__main__":
    main()
