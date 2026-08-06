# -*- coding: utf-8 -*-
"""
fetch_grade_cutoffs.py — 抓心測中心歷年「數學科等級加標示與加權分數對照表」，算出級距標準

會考數學的等級不是看答對幾題，而是看**加權分數**（本專案的 100 分制同一個公式）：
    加權分數 = (選擇題答對/選擇題總題數)×85 + (非選級分/非選總分)×15
心測中心每年在「各科等級加標示與答對題數對照表」PDF 的備註裡，
會公布該年 A++/A+/A/B++/B+/B/C 各自對應的加權分數區間。

本腳本把歷年門檻抓下來取平均，產生 data/grade_cutoffs.json，
給模考成績換算等級用（模考不是正式會考，只能當參考基準）。

用法：
  python scripts/fetch_grade_cutoffs.py            # 抓取並更新 data/grade_cutoffs.json
  python scripts/fetch_grade_cutoffs.py --show     # 只顯示現有資料
"""
import argparse
import json
import re
import sys
import urllib.parse
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
import requests

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "grade_cutoffs.json"
BASE = "https://cap.rcpet.edu.tw"
N1 = "年國中教育會考各科等級加標示與答對題數對照表"
N2 = "年國中教育會考各科能力等級加標示與答對題數對照表"

# 各年檔名規則不一致，逐一嘗試（有找到就用）
PATTERNS = [
    f"{BASE}/exam/{{y}}/{{y}}{N1}.pdf",
    f"{BASE}/exam/{{y}}/{{y}}{N1}(MD5).pdf",
    f"{BASE}/exam/{{y}}/{{y}}{N2}.pdf",
    f"{BASE}/exam/{{y}}/{{y}}{N2}(MD5).pdf",
    f"{BASE}/{{y}}{N1}.pdf",
    f"{BASE}/{{y}}{N2}.pdf",
    # 111／112 年的等級對照收在「各科計分與閱卷結果說明」裡
    f"{BASE}/exam/{{y}}/{{y}}年國中教育會考各科計分與閱卷結果說明-公告版.pdf",
    f"{BASE}/exam/{{y}}/{{y}}年國中教育會考各科計分與閱卷結果說明(上網公告)0609.pdf",
    f"{BASE}/exam/{{y}}/{{y}}年國中教育會考各科計分與閱卷結果說明.pdf",
]
LABELS = ["A++", "A+", "A", "B++", "B+", "B", "C"]


def find_pdf(year):
    for p in PATTERNS:
        url = urllib.parse.quote(p.format(y=year), safe=":/()")
        try:
            r = requests.get(url, timeout=40)
            if r.status_code == 200 and r.content[:4] == b"%PDF":
                return url, r.content
        except Exception:
            continue
    return None, None


def parse_math_cutoffs(pdf_bytes):
    """從 PDF 取出數學科各標示的加權分數下限。取不到回 None。"""
    import fitz
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = "\n".join(page.get_text() for page in doc)
    doc.close()
    # 只看「數學科等級加標示與加權分數對照表」之後那段（英語也有同款表，不能抓錯）
    # 各年措辭略有出入：108 年是「數學科**能力**等級加標示與加權分數對照表」
    m = re.search(r"數學科(?:能力)?等級加標示與加權分數對照表(.{0,1200})", text, re.S)
    if not m:
        return None
    seg = m.group(1)
    rng = [(float(a), float(b)) for a, b in
           re.findall(r"(\d{1,3}\.\d{2})\s*[-–~]\s*(\d{1,3}\.\d{2})", seg)]
    # 期望順序：精熟整體, A++, A+, A, 基礎整體, B++, B+, B, C
    if len(rng) < 9:
        return None
    cut = {"A++": rng[1][0], "A+": rng[2][0], "A": rng[3][0],
           "B++": rng[5][0], "B+": rng[6][0], "B": rng[7][0], "C": 0.0}
    # 自我驗證：A 下限應等於「精熟」整體下限、B 下限應等於「基礎」整體下限
    if abs(cut["A"] - rng[0][0]) > 0.01 or abs(cut["B"] - rng[4][0]) > 0.01:
        return None
    # 門檻必須遞減
    vals = [cut[k] for k in LABELS]
    if any(vals[i] <= vals[i + 1] for i in range(len(vals) - 1)):
        return None
    return cut


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="y0", type=int, default=106)
    ap.add_argument("--to", dest="y1", type=int, default=115)
    ap.add_argument("--show", action="store_true")
    args = ap.parse_args()

    if args.show:
        print(OUT.read_text(encoding="utf-8"))
        return

    years, miss = {}, []
    for y in range(args.y0, args.y1 + 1):
        url, blob = find_pdf(y)
        if not blob:
            miss.append(y); print(f"{y} ✗ 找不到 PDF"); continue
        cut = parse_math_cutoffs(blob)
        if not cut:
            miss.append(y); print(f"{y} ✗ 解析不出數學加權分數表"); continue
        years[str(y)] = cut
        print(f"{y} ✓ " + "  ".join(f"{k}≥{cut[k]:.2f}" for k in LABELS if k != "C"))

    if not years:
        sys.exit("一年都沒抓到，無法產生標準")
    avg = {k: round(sum(v[k] for v in years.values()) / len(years), 2) for k in LABELS}
    data = {
        "說明": "國中教育會考數學科『等級加標示與加權分數』歷年門檻，及其平均（本專案模考換算等級用）",
        "來源": "國立臺灣師範大學心理與教育測驗研究發展中心（心測中心）https://cap.rcpet.edu.tw",
        "加權分數公式": "(選擇題答對題數/選擇題總題數)×85 + (非選擇題得分/非選擇題總分)×15",
        "注意": "模考難度與母體和正式會考不同，換算出的等級僅供參考，不等於正式會考等級。",
        "採用年份": sorted(years.keys()),
        "未取得年份": miss,
        "歷年門檻": years,
        "平均門檻": avg,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n採用 {len(years)} 個年度：{sorted(years.keys())}")
    if miss:
        print(f"未取得：{miss}")
    print("平均門檻（加權分數 ≥）：")
    for k in LABELS:
        print(f"  {k:<4} {avg[k]:.2f}")
    print(f"\n已寫入 {OUT}")


if __name__ == "__main__":
    main()
