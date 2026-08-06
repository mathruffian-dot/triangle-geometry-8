# -*- coding: utf-8 -*-
"""
單張模板卡的試生成器（給命題者／AI 在把卡加進 templates_*.json 之前自我檢查用）。

會做的事：
  1. 掃描參數空間，統計有多少組合能通過 constraints（太少代表約束過緊）
  2. 實際生成 N 題，印出題幹／選項／答案／詳解，並檢查殘留 {變數}
  3. 檢查四個選項互異、正解唯一、干擾項都有錯誤說明
  4. 統計正解字母分布（自然傾向）
  5. 有 figure 的話，實際渲染一次確認畫得出來

用法：
  python scripts/try_card.py <卡片.json> [--n 6] [--kind choice|essay]
  卡片.json 可以是單張卡，也可以是 {"templates":[...]} 或 {"items":[...]} 的題組卡。
"""
import argparse
import collections
import itertools
import json
import random
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, str(Path(__file__).resolve().parent))

from gen_common import gen_one, run_derive, check_constraints, render_text   # noqa: E402
from figures import render_svg                                              # noqa: E402

LETTERS = ["A", "B", "C", "D"]
BASE = Path(__file__).resolve().parent.parent


def scan_space(card, limit=20000):
    """枚舉參數空間，回傳 (可用組合數, 總組合數, 各約束擋掉幾次)。"""
    P = card.get("params", {})
    keys = list(P)
    choices = []
    for k in keys:
        spec = P[k]
        if "choices" in spec:
            choices.append(spec["choices"])
        else:
            lo, hi = spec["range"]
            step = spec.get("step", 1)
            vals = list(range(lo, hi + 1, step))
            if spec.get("odd"):
                vals = [v for v in vals if v % 2]
            if spec.get("even"):
                vals = [v for v in vals if not v % 2]
            choices.append(vals)
    total = 1
    for c in choices:
        total *= len(c)
    ctxs = card.get("contexts", [{}])
    ok, fails = 0, collections.Counter()
    combos = itertools.product(*choices) if choices else [()]
    for i, combo in enumerate(combos):
        if i >= limit:
            break
        env = dict(zip(keys, combo))
        for k, v in ctxs[0].items():
            env["c_" + k] = v
        try:
            run_derive(card.get("derive", []), env)
        except Exception as e:
            fails[f"derive 例外：{type(e).__name__} {str(e)[:60]}"] += 1
            continue
        good, bad = check_constraints(card.get("constraints", []), env)
        if good:
            ok += 1
        else:
            fails[bad] += 1
    return ok, min(total, limit), fails


def check_choice(card, n, seed=20260806):
    from gen_choice import build_options, prep_figure
    rnd = random.Random(seed)
    used, letters, errs, warns = set(), collections.Counter(), [], []
    shown = 0
    for _ in range(n * 3):
        if shown >= n:
            break
        env, _ = gen_one(card, rnd, used)
        if env is None:
            break
        built = build_options(card, env, rnd)
        if built is None:
            errs.append("選項不合格（四項未互異或正解不唯一）")
            continue
        texts, idx, errors = built
        letters[LETTERS[idx]] += 1
        stem = render_text(card["stem"], env)
        sol = render_text(card["solution"], env)
        parts = {"題幹": stem, "選項": " ".join(texts), "詳解": sol,
                 "步驟": " ".join(render_text(card.get("steps", []), env)),
                 "陷阱": render_text(card.get("trap", ""), env) or "",
                 "干擾說明": " ".join(e or "" for e in errors)}
        for name, t in parts.items():
            for left in re.findall(r"\{[a-zA-Z_][a-zA-Z0-9_]*\}", t or ""):
                errs.append(f"{name} 有未替換的變數 {left}")
        for i, e in enumerate(errors):
            if i != idx and not e:
                warns.append(f"第 {LETTERS[i]} 個干擾項沒寫錯誤說明")
        shown += 1
        print(f"\n── 第 {shown} 題 ───────────────────────────────")
        print(stem)
        print("　" + "　".join(f"({LETTERS[i]}) {t}" for i, t in enumerate(texts)))
        print(f"答案：{LETTERS[idx]}")
        print(f"詳解：{sol}")
        print("干擾：" + "；".join(f"({LETTERS[i]}){e}" for i, e in enumerate(errors) if i != idx))
        if card.get("figure"):
            try:
                render_svg(prep_figure(card["figure"], env))
            except Exception as e:
                errs.append(f"圖渲染失敗：{type(e).__name__}: {e}")
    return letters, errs, warns


def check_essay(card, n, seed=20260806):
    from gen_essay import build_rubric
    rnd = random.Random(seed)
    used, errs, warns = set(), [], []
    for i in range(n):
        env, _ = gen_one(card, rnd, used)
        if env is None:
            break
        stem = render_text(card["stem"], env)
        subs = render_text(card["subs"], env)
        guide, cps = build_rubric(card, env)
        parts = {"題幹": stem, "小題": " ".join(subs), "答案": render_text(card["answer"], env),
                 "詳解": render_text(card["solution"], env),
                 "L3": guide["l3"], "L2": guide["l2"], "L1": guide["l1"]}
        for name, t in parts.items():
            for left in re.findall(r"\{[a-zA-Z_][a-zA-Z0-9_]*\}", t or ""):
                errs.append(f"{name} 有未替換的變數 {left}")
        print(f"\n── 第 {i+1} 題 ───────────────────────────────")
        print(stem)
        for s in subs:
            print("　" + s)
        print(f"答案：{parts['答案']}")
        print(f"詳解：{parts['詳解']}")
        print(f"L3：{guide['l3']}")
    return collections.Counter(), errs, warns


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("card")
    ap.add_argument("--n", type=int, default=6)
    ap.add_argument("--kind", default="choice", choices=["choice", "essay"])
    args = ap.parse_args()

    data = json.loads(Path(args.card).read_text(encoding="utf-8"))
    cards = data["templates"] if isinstance(data, dict) and "templates" in data else [data]
    rc = 0
    for card in cards:
        # 題組卡：把小題展開成獨立的虛擬卡
        subs = ([{**card, **it, "id": f"{card.get('id','?')}#{i+1}"}
                 for i, it in enumerate(card["items"])]
                if card.get("skeleton") == "題組" else [card])
        for c in subs:
            print("=" * 74)
            print(f"卡片 {c.get('id','(無 id)')}　{c.get('book','')} {c.get('difficulty','')} "
                  f"[{c.get('skeleton', c.get('ask_type',''))}] {c.get('topic','')}")
            ok, total, fails = scan_space(c)
            print(f"參數空間：{ok} / {total} 組可用" +
                  ("　⚠ 太少，約束過緊或彼此矛盾" if ok < 30 else ""))
            for k, v in fails.most_common(4):
                print(f"   擋掉 {v} 次：{k}")
            if ok == 0:
                rc = 1
                continue
            letters, errs, warns = (check_choice if args.kind == "choice" else check_essay)(c, args.n)
            if letters:
                print("\n正解字母（自然傾向）：" + " ".join(f"{L}{letters.get(L,0)}" for L in LETTERS))
            for w in dict.fromkeys(warns):
                print("⚠ " + w)
            for e in dict.fromkeys(errs):
                print("✗ " + e)
                rc = 1
            if not errs:
                print("\n✓ 這張卡通過機械檢查（多重正解仍須人工判斷）")
    return rc


if __name__ == "__main__":
    sys.exit(main())
