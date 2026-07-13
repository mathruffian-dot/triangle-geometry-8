# -*- coding: utf-8 -*-
"""探測各年題本的題號錨點位置，校準切割參數"""
import re
import fitz
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent

def probe(year):
    doc = fitz.open(BASE / f"00_原始試題PDF/{year}_數學科題本.pdf")
    anchors = []   # (page, y, x, label, part)
    part = 1
    group_headers = []
    for pno in range(doc.page_count):
        page = doc[pno]
        d = page.get_text("dict")
        for block in d["blocks"]:
            if block.get("type") != 0:
                continue
            for line in block["lines"]:
                text = "".join(s["text"] for s in line["spans"]).strip()
                x0, y0 = line["bbox"][0], line["bbox"][1]
                if "非選擇題" in text and ("第二部分" in text or "二、" in text):
                    part = 2
                m = re.match(r"^(\d{1,2})\s*[.．]", text)
                if m and x0 < 100:
                    anchors.append((pno, round(y0, 1), round(x0, 1), m.group(1), part))
                if re.search(r"回答第?\s*\d+\s*[~～至]\s*\d+\s*題", text):
                    group_headers.append((pno, round(y0, 1), text[:40]))
    doc.close()
    return anchors, group_headers

for year in range(104, 116):
    anchors, groups = probe(year)
    nums_p1 = [a[3] for a in anchors if a[4] == 1]
    nums_p2 = [a[3] for a in anchors if a[4] == 2]
    xs = sorted(set(a[2] for a in anchors))
    print(f"{year}: 選擇題錨點={len(nums_p1)} {nums_p1[:30]}")
    print(f"     非選錨點={nums_p2}  x範圍={xs[:8]}")
    if groups:
        print(f"     題組標頭: {groups}")
