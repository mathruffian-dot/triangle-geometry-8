# -*- coding: utf-8 -*-
"""
crop_hanlin.py — 切割翰林模擬會考題本，輸出逐題 PNG

來源為掃描 PDF（無文字層），故用視覺模型定位每題題號的 y 座標再切圖。
（純空白投影分段在此版面不可靠：選項與題幹間有大間距會誤切。）
共用題幹（如「請閱讀下列敘述，回答第24~25題」）會一併附在相關各題上。

用法：
  python scripts/crop_hanlin.py --probe     # 只印定位結果（HL1）
  python scripts/crop_hanlin.py             # 實際切圖（HL1）
  # 其他年度／場次：用 --prefix 指定題號前綴、--book 指定題本 PDF
  python scripts/crop_hanlin.py --prefix HL2 --book ".../111/01-…題本(平浮).pdf" --probe
"""
import os, sys, json, base64, argparse, time
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
import fitz, requests
from PIL import Image

SRC = Path(r"G:/我的雲端硬碟/2026會考歷屆試題/翰林模擬試題")
BOOK = SRC / "01-紙筆模擬會考／數學【第1次第1~2冊】題本(平浮).pdf"
ROOT = Path(__file__).resolve().parent.parent

MODEL = os.environ.get("KAOKAO_GRADE_MODEL", "gpt-5.6-luna")
API = "https://api.openai.com/v1/chat/completions"
DPI = 200          # 輸出解析度
PROBE_DPI = 130    # 送模型辨識用（省 token）
GAP = int(DPI * 0.5)   # 視為區塊分界的空白高度（0.5 吋；題內行距遠小於此）
FOOT = 0.89        # 頁尾（頁碼／logo／請翻頁）以下不要；實測各頁題目內容最遠僅到 0.796


def load_key():
    p = Path.home() / ".openai.env"
    for line in p.read_text(encoding="utf-8").splitlines():
        if line.strip().startswith("OPENAI_API_KEY"):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ["OPENAI_API_KEY"]


PROMPT = """這是數學試卷的一頁掃描圖。請由上而下找出頁面上的內容區塊。

要回報的項目：
1. 每個「編號題目」的起始 y 座標——題號是行首的阿拉伯數字加點（如「1.」「12.」），
   name 填該數字（純數字字串）。**非選擇題**部分的題號也是 1. 2.，若本頁屬於「第二部分：非選擇題」，
   name 請填 "N1"、"N2"。
2. 若有「請閱讀下列敘述，回答第X~Y題」這類**共用題幹**（含其附圖／表格／廣告），
   name 填 "stem:X-Y"，y 填題幹起始位置。
3. 若有「第一部分：選擇題」「第二部分：非選擇題」這類段落標題，name 填 "header"。

y 一律用相對值 0~1（頁面最上為 0、最下為 1），取該區塊**最上緣**。
由上而下排序。只輸出 JSON：{"items":[{"name":"1","y":0.12}]}"""


def trim(im, max_pad=40):
    """裁掉上下多餘空白；若尾端有被大片空白隔開的孤立區塊（試題結束、封底、頁尾），一併移除。"""
    import numpy as np
    a = np.asarray(im.convert("L"))
    dark = (a < 140).sum(axis=1)
    rows = np.flatnonzero(dark > 2)
    if rows.size == 0:
        return im
    # 依大空白帶分群
    groups, s, prev = [], rows[0], rows[0]
    for y in rows[1:]:
        if y - prev > GAP:                     # 空白帶超過 GAP 像素即視為分界
            groups.append((s, prev)); s = y
        prev = y
    groups.append((s, prev))
    # 由尾端往回丟：被大片空白（>10% 圖高）隔開的尾巴多半是「試題結束／封底／頁尾」，非本題內容
    keep = list(groups)
    while len(keep) > 1 and (keep[-1][0] - keep[-2][1]) > GAP:
        keep.pop()
    # 再丟掉尾端過矮的孤立塊（頁碼之類）
    while len(keep) > 1 and (keep[-1][1] - keep[-1][0]) < im.size[1] * 0.02:
        keep.pop()
    top, bot = keep[0][0], keep[-1][1]
    top = max(0, top - max_pad); bot = min(im.size[1], bot + max_pad)
    return im.crop((0, top, im.size[0], bot))


def probe_page(key, doc, i):
    pix = doc[i].get_pixmap(dpi=PROBE_DPI)
    b64 = base64.b64encode(pix.tobytes("png")).decode()
    body = {"model": MODEL,
            "messages": [{"role": "user", "content": [
                {"type": "text", "text": PROMPT},
                {"type": "image_url", "image_url": {"url": "data:image/png;base64," + b64}}]}],
            "max_completion_tokens": 3000,
            "response_format": {"type": "json_object"}}
    r = requests.post(API, headers={"Authorization": f"Bearer {key}",
                                    "Content-Type": "application/json"}, json=body, timeout=240)
    r.raise_for_status()
    items = json.loads(r.json()["choices"][0]["message"]["content"]).get("items", [])
    return sorted(items, key=lambda x: float(x.get("y", 0)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--probe", action="store_true")
    ap.add_argument("--pad", type=float, default=0.008)
    ap.add_argument("--prefix", default="HL1", help="題號前綴（HL1／HL2…），同時決定輸出資料夾與定位快取檔名")
    ap.add_argument("--book", default=str(BOOK), help="題本 PDF 路徑")
    args = ap.parse_args()

    PREFIX = args.prefix
    OUT = ROOT / "01_題目圖片" / PREFIX
    doc = fitz.open(args.book)
    # HL1 的定位快取沿用舊檔名，其餘走 hanlin_layout_<prefix>.json
    cache = ROOT / "data" / ("hanlin_layout.json" if PREFIX == "HL1"
                             else f"hanlin_layout_{PREFIX}.json")
    if cache.exists() and not args.probe:
        pages = {int(k): v for k, v in json.load(open(cache, encoding="utf-8")).items()}
        print(f"沿用已存的定位結果 {cache.name}（要重新辨識請加 --probe）")
    else:
        key = load_key()
        pages = {}
        for i in range(1, doc.page_count):          # 跳過封面
            try:
                items = probe_page(key, doc, i)
            except Exception as e:
                print(f"p{i+1} 失敗：{e}"); items = []
            pages[i] = items
            print(f"p{i+1}: " + "  ".join(f'{x["name"]}@{float(x["y"]):.3f}' for x in items))
            time.sleep(0.3)

    if args.probe:
        json.dump({str(k): v for k, v in pages.items()},
                  open(cache, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)
        print(f"\n定位結果已存 data/{cache.name}")
        return

    OUT.mkdir(parents=True, exist_ok=True)
    made = []
    # 判定「第二部分：非選擇題」從哪一頁開始（該頁起，數字題號一律轉 N 編號）
    essay_from = None
    for i in sorted(pages):
        names = [str(x.get("name", "")) for x in pages[i]]
        if any(n.startswith("N") for n in names):
            essay_from = i
            break
    if essay_from is not None:
        n_seen = 0
        for i in sorted(pages):
            if i < essay_from:
                continue
            for x in pages[i]:
                nm = str(x.get("name", ""))
                if nm.startswith("N"):
                    n_seen = max(n_seen, int(nm[1:] or 0))
                elif nm.isdigit():
                    n_seen += 1
                    x["name"] = f"N{n_seen}"       # 非選段落的「2.」其實是非選第2題

    for i, items in pages.items():
        if not items:
            continue
        pix = doc[i].get_pixmap(dpi=DPI)
        im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        W, H = im.size
        # 本頁的共用題幹（可能有多個）
        stems = [x for x in items if str(x["name"]).startswith("stem:")]
        qs = [x for x in items if str(x["name"])[:1].isdigit() or str(x["name"]).startswith("N")]
        for k, q in enumerate(qs):
            y0 = float(q["y"]) - args.pad
            y1 = float(qs[k + 1]["y"]) - args.pad if k + 1 < len(qs) else FOOT
            y0 = max(0.0, y0); y1 = min(FOOT, max(y1, y0 + 0.02))
            crop = im.crop((0, int(y0 * H), W, int(y1 * H)))
            # 若本題屬於某共用題幹，把題幹接在上方
            name = str(q["name"])
            for s in stems:
                rng = s["name"].split(":")[1]
                a, b = (rng.split("-") + [rng])[:2]
                if name.isdigit() and a.isdigit() and b.isdigit() and int(a) <= int(name) <= int(b):
                    sy0 = max(0.0, float(s["y"]) - args.pad)
                    sy1 = min(FOOT, min([float(x["y"]) for x in qs if float(x["y"]) > float(s["y"])] or [FOOT]))
                    stem_im = im.crop((0, int(sy0 * H), W, int(sy1 * H)))
                    merged = Image.new("RGB", (W, stem_im.size[1] + crop.size[1]), "white")
                    merged.paste(stem_im, (0, 0)); merged.paste(crop, (0, stem_im.size[1]))
                    crop = merged
                    break
            qid = f"{PREFIX}-{int(name):02d}" if name.isdigit() else f"{PREFIX}-{name}"
            trim(crop).save(OUT / f"{qid}.png")
            made.append(qid)
    print(f"\n已輸出 {len(made)} 張 → {OUT}")
    print("題號：", " ".join(sorted(set(made))))


if __name__ == "__main__":
    main()
