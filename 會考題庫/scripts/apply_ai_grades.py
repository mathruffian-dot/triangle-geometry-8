# -*- coding: utf-8 -*-
"""
apply_ai_grades.py — 把 AI 初評級分套用成「老師覆核級分」（AI 自動放行）

用途：老師不在現場、無法逐份人工覆核時，讓學生先看得到分數與參考解答。
學生端查成績只認「老師覆核級分」，AI 批完若不套用，學生只會看到「批改中…」。

與覆核頁的「⚡ 一鍵套用全部 AI 級分」同一件事，差別在這支可以排程自動跑。

⚠ 這是「AI 初評未經人工確認就放行」。老師事後仍可在覆核頁改分（改分會覆蓋這裡寫的值）。
   建議事後至少抽看低信心（<0.7）與 0 級分的那幾份。

設計上的兩個保護：
  1. 只寫「老師覆核級分還是空的」那些份，不會覆蓋老師已經親自定過的分數。
  2. 不寫「老師備註」——學生端只有在「老師覆核級分 == AI級分」時才會顯示評分理由，
     保持兩者一致，學生才看得到「為什麼得這個分數」。

用法：
  python scripts/apply_ai_grades.py --quiz "卷名｜科資班" --dry    # 先看會影響哪幾份
  python scripts/apply_ai_grades.py --quiz "卷名｜科資班"          # 實際套用
  python scripts/apply_ai_grades.py --quiz "…" --min-conf 0.7      # 只放行信心>=0.7 的
"""
import argparse
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from config import SUBMIT_URL as _CFG_SUBMIT_URL  # noqa: E402  集中設定

DEFAULT_URL = _CFG_SUBMIT_URL()


def fetch(url, quiz):
    sep = "&" if "?" in url else "?"
    full = url + sep + "essays=1" + (f"&quiz={urllib.parse.quote(quiz)}" if quiz else "")
    with urllib.request.urlopen(full, timeout=180) as r:
        return json.loads(r.read().decode())


def post(url, updates):
    body = json.dumps({"kind": "essay_review", "updates": updates})
    req = urllib.request.Request(url, data=body.encode("utf-8"),
                                 headers={"Content-Type": "text/plain;charset=utf-8"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.loads(r.read().decode())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quiz", required=True)
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--min-conf", type=float, default=0.0,
                    help="只放行 AI 信心 >= 此值的份數（預設 0＝全部放行）")
    ap.add_argument("--dry", action="store_true", help="只列出，不實際寫入")
    args = ap.parse_args()

    rows = [r for r in fetch(args.url, args.quiz)
            if str(r.get("試卷", "")) == args.quiz]
    if not rows:
        print("查無資料——確認卷名是否含班級後綴（如「｜科資班」）")
        return 0

    todo, skipped_done, skipped_nograde, skipped_lowconf = [], [], [], []
    for r in rows:
        who = f'{r.get("班級","")}-{r.get("座號","")} {r.get("題目ID","")}'
        ai = r.get("AI級分")
        teacher = r.get("老師覆核級分")
        # 0 是合法級分，不可用 or／strip 把它當空值
        has_teacher = teacher == 0 or str(teacher or "").strip() != ""
        has_ai = ai == 0 or str(ai or "").strip() != ""
        if has_teacher:
            skipped_done.append(who); continue
        if not has_ai:
            skipped_nograde.append(who); continue
        try:
            conf = float(str(r.get("AI信心", "")).strip())
        except (TypeError, ValueError):
            conf = None
        if args.min_conf > 0 and (conf is None or conf < args.min_conf):
            skipped_lowconf.append(f"{who}（信心 {conf}）"); continue
        todo.append({"fileId": str(r.get("檔案ID", "")), "level": str(ai),
                     "_who": who, "_conf": conf})

    print(f"該卷共 {len(rows)} 份")
    print(f"  已由老師定分，跳過：{len(skipped_done)}")
    print(f"  尚未 AI 批改，跳過：{len(skipped_nograde)}")
    if args.min_conf > 0:
        print(f"  信心低於 {args.min_conf}，跳過：{len(skipped_lowconf)}")
        for s in skipped_lowconf:
            print("    ·", s)
    print(f"  可套用 AI 級分：{len(todo)}")
    for u in sorted(todo, key=lambda x: x["_who"]):
        c = f'信心 {u["_conf"]}' if u["_conf"] is not None else "無信心值"
        print(f'    {u["_who"]} → {u["level"]} 級（{c}）')

    if not todo:
        print("\n沒有需要套用的份數。")
        return 0
    if args.dry:
        print("\n--dry：未實際寫入。")
        return 0

    res = post(args.url, [{"fileId": u["fileId"], "level": u["level"]} for u in todo])
    print(f'\n已套用 {res.get("updated")} 份 → 學生現在查成績就看得到分數與參考解答')
    low = [u for u in todo if u["_conf"] is not None and u["_conf"] < 0.7]
    if low:
        print(f'⚠ 其中 {len(low)} 份 AI 信心低於 0.7，建議老師事後抽看：')
        for u in sorted(low, key=lambda x: x["_conf"]):
            print(f'    {u["_who"]} → {u["level"]} 級（信心 {u["_conf"]}）')
    return 0


if __name__ == "__main__":
    sys.exit(main())
