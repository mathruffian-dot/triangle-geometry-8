# -*- coding: utf-8 -*-
"""
reset_review.py — 把某卷的「老師覆核級分」清空，讓那些份回到覆核頁的「未覆核」清單

用途：按了「一鍵套用全部 AI 級分」之後想重新逐份人工確認時，先用這支把覆核狀態歸零。
AI 級分／AI 理由／紅筆圖都不會動，只清掉「老師覆核級分」這一欄，隨時可以再定分。

⚠ 清空期間學生查成績會顯示「批改中…」（學生端只認老師覆核級分），覆核完就會恢復。

用法：
  python scripts/reset_review.py --quiz "翰林模擬會考 111年第1次（第1~2冊）｜科資班"
  python scripts/reset_review.py --quiz "…" --seat 90813        # 只重置某位學生
  python scripts/reset_review.py --quiz "…" --dry               # 只列出會影響哪幾份
"""
import argparse
import json
import sys
import urllib.parse
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")

DEFAULT_URL = ("https://script.google.com/macros/s/AKfycbw-ePEfCoTB3SpwOh4g0IcfwsQWanQm8bvXgOGDdIECkK2845q"
               "IoKhH9xtRNuxu29wN/exec?token=math809")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quiz", required=True)
    ap.add_argument("--seat", default="")
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--dry", action="store_true", help="只列出，不實際清空")
    args = ap.parse_args()

    sep = "&" if "?" in args.url else "?"
    full = args.url + sep + "essays=1&quiz=" + urllib.parse.quote(args.quiz)
    with urllib.request.urlopen(full, timeout=180) as r:
        rows = json.loads(r.read().decode())
    rows = [x for x in rows if str(x.get("試卷", "")) == args.quiz]
    if args.seat:
        rows = [x for x in rows if str(x.get("座號", "")) == str(args.seat)]
    if not rows:
        sys.exit("查無資料——確認卷名是否含班級後綴（如「｜科資班」）")

    done = [x for x in rows if str(x.get("老師覆核級分", "")).strip() != "" or x.get("老師覆核級分") == 0]
    print(f"該卷 {len(rows)} 份，其中已覆核 {len(done)} 份：")
    for x in sorted(done, key=lambda r: (str(r.get("座號")), str(r.get("題目ID")))):
        print(f"  {x.get('班級')}-{x.get('座號')} {x.get('題目ID')}  "
              f"目前覆核級分 {x.get('老師覆核級分')}（AI 為 {x.get('AI級分')}）")
    if not done:
        print("沒有已覆核的份數，不需重置。")
        return
    if args.dry:
        print("\n--dry：未實際清空。")
        return

    updates = [{"fileId": str(x.get("檔案ID", "")), "level": ""} for x in done]
    body = json.dumps({"kind": "essay_review", "updates": updates})
    req = urllib.request.Request(args.url, data=body.encode("utf-8"),
                                 headers={"Content-Type": "text/plain;charset=utf-8"})
    with urllib.request.urlopen(req, timeout=300) as r:
        res = json.loads(r.read().decode())
    print(f"\n已清空 {res.get('updated')} 份的老師覆核級分 → 回到覆核頁的「未覆核」清單")
    print("（AI 級分與紅筆圖都還在；學生查成績在你重新定分前會顯示「批改中…」）")


if __name__ == "__main__":
    main()
