# -*- coding: utf-8 -*-
"""
驗證 data/templates_choice.json 的每張選擇題模板卡。

每張卡連續生成 N 組（預設 30）不同參數，檢查：
  1. derive／constraints 可執行，且找得到解（不會因約束太緊卡死）
  2. 題幹／選項／詳解／步驟／陷阱／干擾項說明 都沒有殘留未替換的 {變數}
  3. 四個選項互異、恰有一個正解、每個干擾項都標了錯誤類型
  4. 有 figure 的卡，圖 spec 真的渲染得出來（實際跑一次 SVG）
  5. 正解字母分布（單一字母佔比過高會警告——可能是題型本質，也可能是設計缺陷）
  6. 課綱代碼存在於 curriculum_108.json

⚠ 驗證器**無法**判斷「多重正解」（例如干擾項其實也符合題意），這仍要人工或另一個 AI 審題。

用法：python scripts/validate_templates_choice.py [--n 30]
"""
import argparse
import collections
import json
import random
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, str(Path(__file__).resolve().parent))

from gen_common import gen_one, render_text            # noqa: E402
from gen_choice import build_options, prep_figure       # noqa: E402
from figures import render_svg                         # noqa: E402

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data"
LETTERS = ["A", "B", "C", "D"]

errs, warns = [], []


def curriculum_codes():
    p = DATA / "curriculum_108.json"
    if not p.exists():
        return None
    return set(re.findall(r"[A-Za-z]-(?:IV|[0-9])-[0-9]+", p.read_text(encoding="utf-8")))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=30)
    args = ap.parse_args()

    cards = json.loads((DATA / "templates_choice.json").read_text(encoding="utf-8"))["templates"]
    codes = curriculum_codes()
    print(f"共 {len(cards)} 張選擇題模板卡，每張試生成 {args.n} 組\n")
    all_letters = collections.Counter()

    # 題組卡：把每個小題展開成獨立的「虛擬卡」來驗（共用同一份 derive／params）
    expanded = []
    for c in cards:
        if c.get("skeleton") == "題組":
            for i, it in enumerate(c["items"]):
                sub = {**c, **it}
                sub["id"] = f"{c['id']}#{i+1}"
                expanded.append(sub)
        else:
            expanded.append(c)
    cards = expanded

    for card in cards:
        cid = card["id"]
        rnd = random.Random(20260806)
        used, ok_n, variants = set(), 0, set()
        letters = collections.Counter()
        fig_ok = None
        for _ in range(args.n):
            env, _sig = gen_one(card, rnd, used)
            if env is None:
                break
            built = build_options(card, env, rnd)
            if built is None:
                errs.append(f"{cid} 選項不合格（重複或正解不唯一）")
                continue
            ok_n += 1
            texts, idx, errors = built
            letters[LETTERS[idx]] += 1
            all_letters[LETTERS[idx]] += 1

            checks = {
                "stem": render_text(card["stem"], env),
                "options": " ".join(texts),
                "solution": render_text(card["solution"], env),
                "steps": " ".join(render_text(card["steps"], env)),
                "trap": render_text(card.get("trap", ""), env) or "",
                "干擾項說明": " ".join(e or "" for e in errors),
            }
            for name, t in checks.items():
                left = re.findall(r"\{[a-zA-Z_][a-zA-Z0-9_]*\}", t or "")
                if left:
                    errs.append(f"{cid} {name} 有未替換的變數 {set(left)}")
            for i, e in enumerate(errors):
                if i != idx and not e:
                    warns.append(f"{cid} 有干擾項沒有標錯誤類型（第 {LETTERS[i]} 項）")
            # 有些卡的變化在圖上（積木配置、展開圖標記），題幹幾乎一樣 → 圖也算進相異度
            figsig = str(prep_figure(card["figure"], env)) if card.get("figure") else ""
            variants.add(checks["stem"] + checks["options"] + figsig)

            if card.get("figure") and fig_ok is None:
                try:
                    render_svg(prep_figure(card["figure"], env))   # 與生成器走同一條路徑
                    fig_ok = True
                except Exception as e:
                    fig_ok = False
                    errs.append(f"{cid} 圖渲染失敗：{type(e).__name__}: {e}")

        if ok_n == 0:
            errs.append(f"{cid} 完全生不出題（約束太緊或 derive 有錯）")
        elif ok_n < args.n:
            warns.append(f"{cid} 只生出 {ok_n}/{args.n} 組（參數空間偏小）")

        if ok_n >= 5:
            top, cnt = letters.most_common(1)[0]
            if cnt / ok_n >= 0.9:
                warns.append(f"{cid} 正解幾乎固定在 {top}（{cnt}/{ok_n}）——"
                             "若非題型本質，建議加參數讓正解位置分散")

        if codes:
            for c in card["codes"] + card["perf"]:
                if c not in codes:
                    warns.append(f"{cid} 課綱代碼 {c} 不在 curriculum_108.json")

        ldist = " ".join(f"{L}{letters.get(L, 0)}" for L in LETTERS)
        print(f"  {cid:<10} {ok_n:>3}/{args.n}　相異 {len(variants):>3}　字母 {ldist}　"
              f"圖 {'✓' if fig_ok else ('—' if fig_ok is None else '✗')}　"
              f"{card['book']} {card['difficulty']} {card['skeleton']}")

    print("\n全部卡片合計字母分布：" + "　".join(f"{L}={all_letters.get(L, 0)}" for L in LETTERS))
    print()
    for w in dict.fromkeys(warns):
        print("⚠ " + w)
    for e in dict.fromkeys(errs):
        print("✗ " + e)
    print(f"\n{'✓ 全部通過' if not errs else '✗ 有 %d 項錯誤' % len(set(errs))}"
          f"（警告 {len(set(warns))} 項）")
    print("⚠ 提醒：多重正解無法自動檢查，新模板卡上線前請人工或請另一個 AI 逐題審過。")
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main())
