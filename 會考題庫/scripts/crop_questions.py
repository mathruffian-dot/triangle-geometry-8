# -*- coding: utf-8 -*-
"""將 104-115 年會考數學題本切割成逐題 PNG
規則：
- 題號錨點：行首「N.」且 x<70，題號需嚴格遞增（去除內文假錨點）
- 非選擇題：偵測「第二部分」標頭後題號重新編號，輸出檔名 NQ1、NQ2
- 題組：偵測「回答 a ～ b 題」標頭，題組敘述區塊前置到範圍內每一題
- 跨頁題目：自動縫接下一頁頂部內容
- 內容底界：排除頁碼頁尾，取文字/圖片/向量繪圖的最大 y
輸出：01_題目圖片/{年}/{年}_Q{nn}.png + data/text_{年}.json（逐題文字）
"""
import json
import re
import fitz
from pathlib import Path
from PIL import Image
import io

BASE = Path(__file__).resolve().parent.parent
IMG_DIR = BASE / "01_題目圖片"
DATA_DIR = BASE / "data"
DATA_DIR.mkdir(exist_ok=True)
ZOOM = 2.2
TOP_MARGIN = 42       # 內容區頂界 (pt)
PAD_TOP = 6           # 裁切上緣留白
PAD_BOT = 4


def page_layout(page):
    """回傳 (content_top, content_bottom)，排除頁尾頁碼"""
    h = page.rect.height
    footer_y = h - 55
    d = page.get_text("dict")
    ys = []
    for b in d["blocks"]:
        if b["type"] == 0:
            txt = "".join(s["text"] for l in b["lines"] for s in l["spans"]).strip()
            if re.fullmatch(r"\d{1,2}", txt) and b["bbox"][1] > h - 80:
                footer_y = min(footer_y, b["bbox"][1])
                continue
            if "請翻頁繼續作答" in txt or "請閱讀試題本封底" in txt:
                footer_y = min(footer_y, b["bbox"][1])
                continue
        ys.append(b["bbox"][3])
    for dr in page.get_drawings():
        r = dr["rect"]
        if r.y1 < h - 40 and r.height < h * 0.95:
            ys.append(r.y1)
    ys = [y for y in ys if y < footer_y - 2]
    bottom = max(ys) if ys else footer_y - 10
    return TOP_MARGIN, min(bottom + PAD_BOT, footer_y - 3)


def get_lines(page):
    """回傳 [(y0, x0, text)] 依 y 排序"""
    out = []
    d = page.get_text("dict")
    for b in d["blocks"]:
        if b["type"] != 0:
            continue
        for l in b["lines"]:
            txt = "".join(s["text"] for s in l["spans"]).strip()
            if txt:
                out.append((l["bbox"][1], l["bbox"][0], txt))
    out.sort()
    return out


def analyze(year):
    doc = fitz.open(BASE / f"00_原始試題PDF/{year}_數學科題本.pdf")
    anchors = []          # dict(page, y, num, part)
    part2_header = None   # (page, y)
    groups = []           # dict(page, y, lo, hi)
    last_num = {1: 0, 2: 0}
    part = 1
    for pno in range(1, doc.page_count):
        for (y, x, txt) in get_lines(doc[pno]):
            if part == 1 and re.match(r"^第二部分", txt) and "非選擇題" in txt:
                part = 2
                part2_header = (pno, y)
                continue
            g = re.search(r"回答\s*第?\s*(\d+)\s*[~～至]\s*(\d+)\s*題", txt)
            if g and x < 200:
                groups.append(dict(page=pno, y=y, lo=int(g.group(1)), hi=int(g.group(2))))
                continue
            m = re.match(r"^(\d{1,2})\s*[.．]", txt)
            if m and x < 70:
                n = int(m.group(1))
                if n == last_num[part] + 1:
                    anchors.append(dict(page=pno, y=y, num=n, part=part))
                    last_num[part] = n
    return doc, anchors, part2_header, groups


def render_strip(doc, pno, y0, y1, cache):
    # cache 必須由呼叫端(每年度)自行建立，避免跨年度 id(doc) 重複造成頁面污染
    if pno not in cache:
        pix = doc[pno].get_pixmap(matrix=fitz.Matrix(ZOOM, ZOOM))
        cache[pno] = Image.open(io.BytesIO(pix.tobytes("png")))
    img = cache[pno]
    w = img.width
    return img.crop((0, max(0, int(y0 * ZOOM)), w, min(img.height, int(y1 * ZOOM))))


def vconcat(imgs):
    imgs = [im for im in imgs if im.height > 4]
    w = max(im.width for im in imgs)
    h = sum(im.height for im in imgs)
    out = Image.new("RGB", (w, h), "white")
    y = 0
    for im in imgs:
        out.paste(im, (0, y))
        y += im.height
    return out


def question_segments(doc, anchors, part2_header, groups, idx):
    """回傳題 idx 的裁切片段 [(page, y0, y1)]"""
    a = anchors[idx]
    nxt = anchors[idx + 1] if idx + 1 < len(anchors) else None
    segs = []
    start_y = a["y"] - PAD_TOP
    # 題組標頭在本題正上方（本題為題組第一題）→ 由標頭開始裁
    for g in groups:
        if g["lo"] == a["num"] and a["part"] == 1 and g["page"] == a["page"] and g["y"] < a["y"]:
            start_y = g["y"] - PAD_TOP
    if nxt is None or nxt["page"] > a["page"]:
        top, bot = page_layout(doc[a["page"]])
        segs.append((a["page"], start_y, bot))
        if nxt is not None:
            # 中間整頁（罕見）
            for p in range(a["page"] + 1, nxt["page"]):
                t2, b2 = page_layout(doc[p])
                segs.append((p, t2, b2))
            # 下一題所在頁的頂部殘餘內容
            t2, b2 = page_layout(doc[nxt["page"]])
            cut = nxt["y"] - PAD_TOP
            # 若殘餘區含題組標頭或第二部分標頭 → 在標頭處截斷
            for g in groups:
                if g["page"] == nxt["page"] and g["y"] < nxt["y"]:
                    cut = min(cut, g["y"] - PAD_TOP)
            if part2_header and part2_header[0] == nxt["page"] and part2_header[1] < nxt["y"]:
                cut = min(cut, part2_header[1] - PAD_TOP)
            if cut - t2 > 8:  # 頂部確有殘餘內容
                # 確認殘餘區內真的有內容（文字或繪圖）
                has = False
                for (y, x, txt) in get_lines(doc[nxt["page"]]):
                    if t2 - 2 < y < cut - 4 and not re.match(r"^第[一二]部分", txt):
                        has = True
                        break
                if not has:
                    for dr in doc[nxt["page"]].get_drawings():
                        if t2 < dr["rect"].y0 and dr["rect"].y1 < cut:
                            has = True
                            break
                if has:
                    segs.append((nxt["page"], t2, cut))
    else:
        segs.append((a["page"], start_y, nxt["y"] - PAD_TOP))
    return segs


def group_stimulus_segments(doc, anchors, groups, num):
    """若題 num 屬於題組但非第一題，回傳題組敘述片段"""
    for g in groups:
        if g["lo"] < num <= g["hi"]:
            first = next(a for a in anchors if a["part"] == 1 and a["num"] == g["lo"])
            return [(g["page"], g["y"] - PAD_TOP, first["y"] - PAD_TOP)]
    return []


def extract_text(doc, segs):
    parts = []
    for (pno, y0, y1) in segs:
        clip = fitz.Rect(0, y0, doc[pno].rect.width, y1)
        parts.append(doc[pno].get_text(clip=clip))
    return "\n".join(parts)


def process(year):
    doc, anchors, p2h, groups = analyze(year)
    ydir = IMG_DIR / str(year)
    ydir.mkdir(parents=True, exist_ok=True)
    texts = {}
    cache = {}
    n1 = sum(1 for a in anchors if a["part"] == 1)
    n2 = sum(1 for a in anchors if a["part"] == 2)
    for i, a in enumerate(anchors):
        segs = question_segments(doc, anchors, p2h, groups, i)
        stim = group_stimulus_segments(doc, anchors, groups, a["num"]) if a["part"] == 1 else []
        imgs = [render_strip(doc, p, y0, y1, cache) for (p, y0, y1) in stim + segs]
        img = vconcat(imgs)
        name = f"{year}_Q{a['num']:02d}" if a["part"] == 1 else f"{year}_NQ{a['num']}"
        img.save(ydir / f"{name}.png", optimize=True)
        texts[name] = extract_text(doc, stim + segs)
    (DATA_DIR / f"text_{year}.json").write_text(
        json.dumps(texts, ensure_ascii=False, indent=1), encoding="utf-8")
    doc.close()
    return n1, n2, groups


if __name__ == "__main__":
    for year in range(104, 116):
        n1, n2, groups = process(year)
        gtxt = "".join(f" 題組{g['lo']}-{g['hi']}" for g in groups)
        print(f"{year}: 選擇題 {n1} 非選 {n2}{gtxt}")
