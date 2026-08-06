# -*- coding: utf-8 -*-
"""
把 命題模板/_草稿/ 底下審過的模板卡併入正式模板庫。

會做的事：
  1. 逐張跑 try_card.py 的機械檢查（參數空間、殘留變數、選項互異、圖能渲染）——不過就不併
  2. 併入前自動備份正式檔到 backup/
  3. 同 id 視為更新（覆蓋），新 id 則追加
  4. 併入後跑一次 validate_templates_*.py

用法：
  python scripts/merge_cards.py --list                 # 看草稿夾有哪些卡、各自檢查結果
  python scripts/merge_cards.py --all                  # 全部併入（僅併通過檢查的）
  python scripts/merge_cards.py C-B5-02 C-B5-03        # 只併指定的
  python scripts/merge_cards.py --all --force          # 檢查沒過也照併（不建議）
"""
import argparse
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

BASE = Path(__file__).resolve().parent.parent
DRAFT = BASE / "命題模板" / "_草稿"
CHOICE = BASE / "data" / "templates_choice.json"
ESSAY = BASE / "data" / "templates_essay.json"
BACKUP = BASE / "backup"


def check(card_path: Path, kind: str):
    r = subprocess.run([sys.executable, str(BASE / "scripts" / "try_card.py"),
                        str(card_path), "--n", "4", "--kind", kind],
                       capture_output=True, text=True, encoding="utf-8", errors="replace",
                       cwd=str(BASE))
    out = r.stdout or ""
    ok = r.returncode == 0 and "✗" not in out
    space = 0
    for line in out.splitlines():
        if line.startswith("參數空間："):
            try:
                space = int(line.split("：")[1].split("/")[0].strip())
            except Exception:
                pass
    bad = [l for l in out.splitlines() if l.startswith("✗")]
    return ok, space, bad


def kind_of(card):
    return "essay" if ("subs" in card or card.get("role") in ("N1", "N2")) else "choice"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    if not DRAFT.exists():
        print(f"✗ 找不到草稿夾 {DRAFT}")
        return 1
    files = sorted(DRAFT.glob("*.json"))
    if args.ids:
        files = [f for f in files if f.stem in set(args.ids)]
    if not files:
        print("草稿夾裡沒有符合的卡片")
        return 1

    rows = []
    for f in files:
        card = json.loads(f.read_text(encoding="utf-8"))
        kind = kind_of(card)
        ok, space, bad = check(f, kind)
        rows.append((f, card, kind, ok, space, bad))
        flag = "✓" if ok else "✗"
        print(f"{flag} {f.stem:<12} {kind:<6} 參數空間 {space:>5} 組　"
              f"{card.get('book','')} {card.get('difficulty','')} "
              f"{card.get('skeleton', card.get('ask_type',''))} {card.get('topic','')}")
        for b in bad[:3]:
            print("     " + b)

    if args.list:
        return 0
    if not (args.all or args.ids):
        print("\n（未指定要併入哪些卡；加 --all 或列出 id）")
        return 0

    todo = [r for r in rows if r[3] or args.force]
    if not todo:
        print("\n沒有通過檢查的卡可以併入")
        return 1

    BACKUP.mkdir(exist_ok=True)
    stamp = datetime.now().strftime("%m%d_%H%M%S")
    merged = {"choice": 0, "essay": 0}
    for target, kind in ((CHOICE, "choice"), (ESSAY, "essay")):
        cards = [r for r in todo if r[2] == kind]
        if not cards:
            continue
        data = json.loads(target.read_text(encoding="utf-8"))
        bk = BACKUP / f"{target.stem}_備份_{stamp}.json"
        bk.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        idx = {t["id"]: i for i, t in enumerate(data["templates"])}
        for f, card, _k, _ok, _sp, _bad in cards:
            if card["id"] in idx:
                data["templates"][idx[card["id"]]] = card
                print(f"  ↻ 更新 {card['id']}")
            else:
                data["templates"].append(card)
                print(f"  ＋ 新增 {card['id']}")
            merged[kind] += 1
        target.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"✓ {target.name} 現有 {len(data['templates'])} 張（原檔備份於 {bk.relative_to(BASE)}）")

    for kind, script in (("choice", "validate_templates_choice.py"),
                         ("essay", "validate_templates_essay.py")):
        if merged[kind]:
            print(f"\n── 併入後驗證（{kind}）──")
            r = subprocess.run([sys.executable, str(BASE / "scripts" / script), "--n", "20"],
                               capture_output=True, text=True, encoding="utf-8",
                               errors="replace", cwd=str(BASE))
            print((r.stdout or "").strip()[-1500:])
    return 0


if __name__ == "__main__":
    sys.exit(main())
