# -*- coding: utf-8 -*-
"""
apply_ai_review.py — 把 AI 初評級分整批套用成「老師覆核級分」（＝覆核頁那顆「⚡ 一鍵套用全部 AI 級分」的命令列版）。

用途：老師信任 AI 初評、想先讓學生看得到成績時，一次放行；之後仍可在覆核頁逐份改分。

安全設計：
  · 預設**只處理「已有 AI 級分」且「老師覆核級分還空著」**的份數 → 不會蓋掉老師已經改過的分數（要蓋要加 --force）
  · 一次 POST 帶全部更新（後端 essay_review 依檔案ID 逐列回寫），對試算表只有一次寫入
  · 0 級是合法級分：判斷空值一律用字串比對，不用 Python 的真假值（`0 or ""` 會把 0 當空的）

用法：
  python scripts/apply_ai_review.py --quiz "數學非選練習卷 第1~2冊（0813）｜909班" --dry
  python scripts/apply_ai_review.py --quiz "數學非選練習卷 第1~2冊（0813）｜909班"
"""
import argparse
import json
import sys
from pathlib import Path

import requests

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from config import SUBMIT_URL as _CFG_SUBMIT_URL  # noqa: E402  集中設定

DEFAULT_URL = _CFG_SUBMIT_URL()


def blank(v):
    """0 要算「有值」，只有 None/空字串才算空。"""
    return v is None or str(v).strip() == ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--quiz", default="", help="卷名（一班一網址要含「｜909班」後綴）")
    ap.add_argument("--cls", default="")
    ap.add_argument("--force", action="store_true", help="連老師已覆核過的也用 AI 級分覆蓋")
    ap.add_argument("--dry", action="store_true", help="只列出要套用哪些，不回寫")
    args = ap.parse_args()

    p = {"essays": 1}
    if args.quiz: p["quiz"] = args.quiz
    if args.cls: p["cls"] = args.cls
    sep = "&" if "?" in args.url else "?"
    url = args.url + sep + "&".join(f"{k}={requests.utils.quote(str(v))}" for k, v in p.items())
    recs = requests.get(url, timeout=120).json()
    print(f"取得 {len(recs)} 筆非選作答")

    todo, no_ai, already = [], 0, 0
    for x in recs:
        ai = x.get("AI級分")
        if blank(ai):
            no_ai += 1; continue
        if not blank(x.get("老師覆核級分")) and not args.force:
            already += 1; continue
        todo.append({"fileId": str(x.get("檔案ID", "")), "level": int(float(ai)),
                     "_who": f'{x.get("班級","")}-{x.get("座號","")} {x.get("題目ID","")}',
                     "_conf": x.get("AI信心", "")})
    print(f"可套用 {len(todo)} 筆；尚無 AI 級分 {no_ai} 筆；老師已覆核（跳過）{already} 筆")
    for t in sorted(todo, key=lambda t: (str(t["_conf"]) or "9")):
        print(f"  {t['_who']:<24} → {t['level']} 級（AI 信心 {t['_conf']}）")

    if not todo:
        print("沒有要套用的，結束。"); return
    if args.dry:
        print("（--dry：未回寫）"); return

    body = {"kind": "essay_review",
            "updates": [{"fileId": t["fileId"], "level": t["level"]} for t in todo]}
    r = requests.post(args.url, headers={"Content-Type": "text/plain;charset=utf-8"},
                      data=json.dumps(body), timeout=300)
    print("回寫結果：", r.json())
    print("學生現在到作答頁按「🔍 查我的非選批改結果」就看得到分數了。")
    print("⚠ 之後仍可到覆核頁逐份改分；改完學生看到的就是新分數。")


if __name__ == "__main__":
    main()
