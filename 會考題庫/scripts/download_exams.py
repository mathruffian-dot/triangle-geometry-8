# -*- coding: utf-8 -*-
"""下載103-115年國中教育會考數學科題本與參考答案PDF
來源：國中教育會考官網 https://cap.rcpet.edu.tw/exam/{年}/{年}exam.html
各年頁面內連結為 Google Drive 檔案，改用 drive.usercontent.google.com 直接下載
"""
import re
import sys
import time
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent / "00_原始試題PDF"
BASE.mkdir(parents=True, exist_ok=True)

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
YEARS = range(103, 116)

def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

def get_links(year):
    """回傳 {'math': drive_id, 'answer': drive_id}"""
    html = fetch(f"https://cap.rcpet.edu.tw/exam/{year}/{year}exam.html").decode("utf-8", "ignore")
    out = {}
    # 逐個 <li><a> 找「數學科」與「參考答案」
    for m in re.finditer(r'<a href="([^"]+)"[^>]*>\s*([^<]+?)\s*</a>', html):
        href, text = m.group(1), m.group(2)
        fid = re.search(r'/file/d/([\w-]+)', href)
        if not fid:
            continue
        if text == "數學科" and "math" not in out:
            out["math"] = fid.group(1)
        elif text == "參考答案" and "answer" not in out:
            out["answer"] = fid.group(1)
    return out

def download_drive(fid, dest: Path):
    url = f"https://drive.usercontent.google.com/download?id={fid}&export=download&confirm=t"
    data = fetch(url)
    if data[:5] != b"%PDF-":
        raise RuntimeError(f"非PDF內容 ({dest.name}), 前32位元組: {data[:32]!r}")
    dest.write_bytes(data)
    return len(data)

def main():
    report = []
    for y in YEARS:
        try:
            links = get_links(y)
        except Exception as e:
            report.append(f"{y}: 頁面抓取失敗 {e}")
            continue
        for key, label in [("math", "數學科題本"), ("answer", "參考答案")]:
            dest = BASE / f"{y}_{label}.pdf"
            if dest.exists() and dest.stat().st_size > 10000:
                report.append(f"{y} {label}: 已存在，略過")
                continue
            if key not in links:
                report.append(f"{y} {label}: 找不到連結!")
                continue
            try:
                size = download_drive(links[key], dest)
                report.append(f"{y} {label}: OK {size/1024:.0f} KB")
            except Exception as e:
                report.append(f"{y} {label}: 下載失敗 {e}")
            time.sleep(1)
    print("\n".join(report))

if __name__ == "__main__":
    main()
