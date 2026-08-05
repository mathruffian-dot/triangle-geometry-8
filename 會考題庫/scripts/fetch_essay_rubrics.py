# -*- coding: utf-8 -*-
"""
抓取國中教育會考數學科「非選擇題」官方整合 PDF（含 試題內容＋評分指引＋樣卷說明），
並抽出純文字，供建置 data/essay_rubrics.json。

來源：國立臺灣師範大學心理與教育測驗研究發展中心（心測中心）
      https://cap.rcpet.edu.tw/exam/{年}/...
檔名規則（實測 2026-07）：
  104–113 → 正式試題({年}年第{一/二}題).pdf
  114     → {年}年第{一/二}題.pdf          （少了「正式試題」前綴）
  115     → 官方評分指引尚未上架（僅有試題本＋參考答案），本腳本自動略過

輸出：
  00_非選評分規準PDF/{年}_{N1|N2}.pdf     原始 PDF（可重複執行，已存在則不重載）
  00_非選評分規準PDF/txt/{年}_{N1|N2}.txt  逐頁抽出的純文字（每次重抽）

版權：題目與樣卷屬心測中心著作，僅供校內教學使用，勿對外散布樣卷影像。
"""
import os, sys, time, urllib.parse
import requests
import fitz  # PyMuPDF

sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                      # 會考題庫/
OUT = os.path.join(ROOT, "00_非選評分規準PDF")
TXT = os.path.join(OUT, "txt")
os.makedirs(TXT, exist_ok=True)

HDR = {"User-Agent": "Mozilla/5.0"}
BASE = "https://cap.rcpet.edu.tw/exam/{y}/"

# 各年檔名模板（依實測，順序＝優先嘗試）
def url_candidates(y, cn):  # cn = "第一題" / "第二題"
    b = BASE.format(y=y)
    names = [f"正式試題({y}年{cn}).pdf", f"{y}年{cn}.pdf"]
    return [b + urllib.parse.quote(n) for n in names]

YEARS = list(range(104, 115))          # 104..114（115 官方評分指引尚未上架）
QMAP = [("第一題", "N1"), ("第二題", "N2")]


def fetch_pdf(y, cn, tag):
    pdf_path = os.path.join(OUT, f"{y}_{tag}.pdf")
    if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 50000:
        return pdf_path, open(pdf_path, "rb").read()
    for url in url_candidates(y, cn):
        try:
            r = requests.get(url, headers=HDR, timeout=60)
        except Exception as e:
            print(f"  ! {y} {cn} 連線失敗 {e!r}")
            continue
        if r.status_code == 200 and r.headers.get("content-type", "").startswith("application/pdf") and len(r.content) > 50000:
            open(pdf_path, "wb").write(r.content)
            time.sleep(0.4)   # 對官方伺服器客氣一點
            return pdf_path, r.content
    return None, None


def main():
    ok, miss = 0, []
    for y in YEARS:
        for cn, tag in QMAP:
            pdf_path, content = fetch_pdf(y, cn, tag)
            if not content:
                miss.append(f"{y}_{tag}")
                print(f"[缺] {y} {cn}")
                continue
            doc = fitz.open(stream=content, filetype="pdf")
            full = "\n".join(doc[i].get_text() for i in range(doc.page_count))
            txt_path = os.path.join(TXT, f"{y}_{tag}.txt")
            open(txt_path, "w", encoding="utf-8").write(full)
            has_guide = "評分指引" in full
            has_sample = "樣卷" in full
            ok += 1
            print(f"[OK] {y} {tag}  pages={doc.page_count:>2} "
                  f"評分指引={'✓' if has_guide else '✗'} 樣卷={'✓' if has_sample else '✗'} "
                  f"chars={len(full):>5}  → {os.path.basename(txt_path)}")
    print("-" * 60)
    print(f"完成 {ok} 份；缺 {len(miss)}：{miss or '無'}")
    print("115 年官方評分指引尚未上架，於 essay_rubrics.json 標記『官方規準待補』。")


if __name__ == "__main__":
    main()
