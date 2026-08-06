# -*- coding: utf-8 -*-
"""
驗證 data/templates_essay.json 的每張模板卡「生得出、算得對、寫得完整」。

每張卡連續生成 N 組（預設 30）不同參數，檢查：
  1. derive／constraints 可執行，且在合理次數內找得到解（不會因約束太緊卡死）
  2. 題幹／小題／答案／詳解／步驟／評分規準都沒有殘留未替換的 {變數}
  3. L3/L2/L1/L0 四級與 checkpoints 都生得出來，且級分只出現 1/2/3
  4. 答案不是空的；(1)(2) 兩小題都有問句
  5. 「判斷型」的答案至少要有兩種可能（否則答案恆定＝沒有鑑別度）
  6. 課綱代碼存在於 curriculum_108.json

用法：python scripts/validate_templates_essay.py [--n 30]
"""
import argparse
import json
import random
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, str(Path(__file__).resolve().parent))

from gen_essay import gen_one, render_text, build_rubric  # noqa: E402

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data"

errs, warns = [], []


def curriculum_codes():
    """回傳課綱檔內出現過的所有代碼（學習內容＋學習表現），用於核對模板卡標記。"""
    p = DATA / "curriculum_108.json"
    if not p.exists():
        return None
    raw = p.read_text(encoding="utf-8")
    return set(re.findall(r"[A-Za-z]-(?:IV|[0-9])-[0-9]+", raw))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=30, help="每張卡試生成幾組")
    args = ap.parse_args()

    cards = json.loads((DATA / "templates_essay.json").read_text(encoding="utf-8"))["templates"]
    codes = curriculum_codes()
    print(f"共 {len(cards)} 張模板卡，每張試生成 {args.n} 組\n")

    for card in cards:
        cid = card["id"]
        rnd = random.Random(20260805)
        used, ok_n, answers, variants = set(), 0, set(), set()
        for _ in range(args.n):
            env, _sig = gen_one(card, rnd, used)
            if env is None:
                break
            ok_n += 1
            texts = {
                "stem": render_text(card["stem"], env),
                "subs": " ".join(render_text(card["subs"], env)),
                "answer": render_text(card["answer"], env),
                "solution": render_text(card["solution"], env),
                "steps": " ".join(render_text(card["steps"], env)),
                "trap": render_text(card.get("trap", ""), env),
            }
            guide, cps = build_rubric(card, env)
            texts.update({f"guide.{k}": v for k, v in guide.items()})
            texts["checkpoints"] = " ".join(c["text"] for c in cps)

            for name, t in texts.items():
                left = re.findall(r"\{[a-zA-Z_][a-zA-Z0-9_]*\}", t or "")
                if left:
                    errs.append(f"{cid} {name} 有未替換的變數 {set(left)}")
            if not texts["answer"].strip():
                errs.append(f"{cid} 答案為空")
            if "(1)" not in texts["subs"] or "(2)" not in texts["subs"]:
                errs.append(f"{cid} 小題不是 (1)(2) 兩小題")
            if any(c["primary_level"] not in (1, 2, 3) for c in cps):
                errs.append(f"{cid} checkpoints 級分不在 1~3")
            answers.add(texts["answer"])
            variants.add(texts["stem"] + texts["answer"])

        if ok_n == 0:
            errs.append(f"{cid} 完全生不出題（約束太緊或 derive 有錯）")
        elif ok_n < args.n:
            warns.append(f"{cid} 只生出 {ok_n}/{args.n} 組（參數空間偏小，可加候選值）")

        # 判斷型：答案要有兩種以上結論，否則沒有鑑別度
        if (card["ask_type"] in ("足夠型", "一定型", "可能型", "能否型", "比較型")
                and ok_n >= 5 and not card.get("conclusion_fixed")):
            concl = set()
            for a in answers:
                m = re.search(r"\(2\)\s*([^（(]{1,6})", a)
                concl.add(m.group(1).strip() if m else a)
            if len(concl) < 2:
                warns.append(f"{cid} 第(2)小題結論恆為「{list(concl)[0]}」——答案固定，建議加參數讓兩種結論都可能")

        if codes:
            for c in card["codes"] + card["perf"]:
                if c not in codes:
                    warns.append(f"{cid} 課綱代碼 {c} 不在 curriculum_108.json")

        print(f"  {cid:<16} 生成 {ok_n:>3}/{args.n}　相異題目 {len(variants):>3}　"
              f"{card['book']} {card['ask_type']}")

    print()
    for w in warns:
        print("⚠ " + w)
    for e in errs:
        print("✗ " + e)
    print(f"\n{'✓ 全部通過' if not errs else '✗ 有 %d 項錯誤' % len(errs)}"
          f"（警告 {len(warns)} 項）")
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main())
