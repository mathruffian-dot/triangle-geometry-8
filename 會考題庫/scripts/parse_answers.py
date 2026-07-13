# -*- coding: utf-8 -*-
"""解析104-115年參考答案PDF中的數學科答案欄
方法：get_text("words") 取得每字座標；找「數學」標頭 x 位置，
題號(數字)在最左欄，答案字母依 x 最接近的標頭歸欄。
"""
import json
import fitz
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent

def parse_year(year):
    doc = fitz.open(BASE / f"00_原始試題PDF/{year}_參考答案.pdf")
    answers = {}
    for pno in range(doc.page_count):
        words = doc[pno].get_text("words")  # x0,y0,x1,y1,text,...
        # 表格可能上下兩張（同頁兩個表）→ 依「數學」標頭分段處理
        headers = [w for w in words if w[4] == "數學"]
        for hi, h in enumerate(headers):
            hx = (h[0] + h[2]) / 2
            hy = h[3]
            # 此表的 y 範圍：從標頭到下一個「數學」標頭（或頁尾）
            y_end = headers[hi + 1][1] - 5 if hi + 1 < len(headers) else 10**9
            # 題號：x < 標頭最左科目欄之前；先收集該表內所有數字與字母
            nums = {}   # y中心 -> 題號
            for w in words:
                x0, y0, x1, y1, t = w[:5]
                yc = (y0 + y1) / 2
                if not (hy < yc < y_end):
                    continue
                if t.isdigit() and x1 < 150:
                    nums[round(yc, 1)] = int(t)
            for w in words:
                x0, y0, x1, y1, t = w[:5]
                yc = (y0 + y1) / 2
                if not (hy < yc < y_end):
                    continue
                if t in "ABCD" and len(t) == 1 and abs((x0 + x1) / 2 - hx) < 18:
                    # 找同列題號
                    best = min(nums.items(), key=lambda kv: abs(kv[0] - yc), default=None)
                    if best and abs(best[0] - yc) < 6:
                        q = best[1]
                        if q not in answers:
                            answers[q] = t
    doc.close()
    return answers

if __name__ == "__main__":
    out = {}
    for y in range(104, 116):
        a = parse_year(y)
        qs = sorted(a)
        out[str(y)] = {str(q): a[q] for q in qs}
        seq = "".join(a[q] for q in qs)
        print(y, len(a), "題:", seq)
    (BASE / "data" / "official_answers.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
