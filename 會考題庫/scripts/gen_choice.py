# -*- coding: utf-8 -*-
"""
會考風格「選擇題」自動生成器。

依 data/templates_choice.json 的模板卡（一張卡＝一個題幹骨架＋一組干擾項設計），
隨機抽情境與參數 → 檢查約束 → 算出正解與三個干擾項 → 渲染題目圖 → 輸出題庫格式。

設計依據：命題模板/命題公式分析報告.md（貳）
  ・卷面藍圖：1–8 易、9–16 中、17–22 難、23–25 題組
  ・八大題幹骨架：純計算／甲乙判斷／圖形求值／生活列式／圖表判讀／對話框／敘述判斷／題組
  ・選項法則：四選項同型、每個干擾項對應一種可預測錯誤、正解字母全卷均衡

用法：
  python scripts/gen_choice.py --list                     # 看模板卡
  python scripts/gen_choice.py --n 5                      # 生 5 題
  python scripts/gen_choice.py --books B1,B2 --n 6        # 限定冊別
  python scripts/gen_choice.py --difficulty 易,中 --n 4    # 限定難度
  python scripts/gen_choice.py --paper 20 --tag M0806     # 依卷面藍圖生一份 20 題模擬卷
  python scripts/gen_choice.py --n 3 --dry                # 只印不寫檔
"""
import argparse
import collections
import json
import random
import sys
from datetime import datetime
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, str(Path(__file__).resolve().parent))

from gen_common import gen_one, render_text, eval_env, prep_figure, _num  # noqa: E402,F401
from figures import render_question_png                # noqa: E402

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data"
TPL_FILE = DATA / "templates_choice.json"
LOG_FILE = DATA / "gen_log.json"
LETTERS = ["A", "B", "C", "D"]

# 卷面藍圖：題號區段 → (難度, 佔比)。依 106–115 共 255 題統計（報告 貳-一）
BLUEPRINT = [("易", 0.32), ("中", 0.36), ("難", 0.32)]


def build_options(card, env, rnd, target_idx=None):
    """產生四個選項；回傳 (選項文字list, 正解索引, 干擾項錯誤類型list)。

    option_order：
      sorted  數值型選項照大小排（會考慣例，正解位置由「有幾個干擾項比它小」決定）
      fixed   固定順序（甲乙判斷的四種組合）
      shuffle 文字型選項，可洗牌

    模板卡的干擾項可以多於 3 個（干擾項池）。target_idx 指定希望正解落在第幾個位置時，
    會從池中挑出能達成該位置的三個干擾項——這是讓全卷 A/B/C/D 均衡的關鍵，
    且不動任何數學（每個干擾項本來就是合法的錯誤設計）。
    """
    import itertools

    raw = []
    for o in card["options"]:
        # correct_if：正解是哪一個要看參數（如「甲乙判斷」型，四種組合都可能是答案）
        correct = (bool(eval(o["correct_if"], eval_env(), dict(env)))
                   if o.get("correct_if") else bool(o.get("correct")))
        raw.append({"text": render_text(o["text"], env),
                    "correct": correct,
                    "error": render_text(o.get("error", ""), env),
                    "value": env.get(o["value"]) if o.get("value") else None})
    if sum(1 for o in raw if o["correct"]) != 1:
        return None

    order = card.get("option_order", "sorted")
    if order == "fixed":                        # 甲乙判斷型：四個選項的順序是固定寫法，不重組
        if len(raw) != 4 or len({o["text"] for o in raw}) != 4:
            return None
        idx = next(i for i, o in enumerate(raw) if o["correct"])
        return [o["text"] for o in raw], idx, [o["error"] for o in raw]

    right = [o for o in raw if o["correct"]][0]
    pool = [o for o in raw if not o["correct"]]
    if len(pool) < 3:
        return None

    combos = list(itertools.combinations(pool, 3))
    rnd.shuffle(combos)
    fallback = None
    for cb in combos:
        opts = [right] + list(cb)
        if len({o["text"] for o in opts}) != 4:      # 干擾項與正解撞在一起
            continue
        if order == "sorted" and all(o["value"] is not None for o in opts):
            opts = sorted(opts, key=lambda o: float(o["value"]))
        elif order == "shuffle":
            opts = opts[:]
            rnd.shuffle(opts)
        idx = next(i for i, o in enumerate(opts) if o["correct"])
        result = ([o["text"] for o in opts], idx, [o["error"] for o in opts])
        if target_idx is None or idx == target_idx:
            return result
        fallback = fallback or result
    return fallback


def make_question(card, env, qid, tag, num, rnd, img_rel, dry=False, target_idx=None,
                  passage=None, passage_title=None, passage_figure=None):
    built = build_options(card, env, rnd, target_idx=target_idx)
    if built is None:
        return None
    texts, idx, errors = built
    stem = render_text(card["stem"], env)
    fig = prep_figure(card.get("figure"), env)
    opts = [f"({LETTERS[i]}) {t}" for i, t in enumerate(texts)]
    if not dry:
        render_question_png(BASE / img_rel, num, stem, opts, figure=fig,
                            passage=passage, passage_title=passage_title,
                            passage_figure=passage_figure)
    return {
        "id": qid,
        "year": tag,
        "num": num,
        "type": "choice",
        "img": img_rel,
        "answer": LETTERS[idx],
        "codes": card["codes"],
        "perf": card["perf"],
        "book": card["book"],
        "chapter": card["chapter"],
        "topic": render_text(card["topic"], env),
        "difficulty": card["difficulty"],
        "solution": render_text(card["solution"], env),
        "steps": render_text(card["steps"], env),
        "trap": render_text(card.get("trap", ""), env),
        "gen": {"template": card["id"], "skeleton": card["skeleton"],
                "key_idea": render_text(card.get("key_idea", ""), env),
                "options": [{"opt": LETTERS[i], "text": t, "error": e or ("正解" if i == idx else "")}
                            for i, (t, e) in enumerate(zip(texts, errors))],
                "params": {k: str(v) for k, v in env.items() if not k.startswith("c_")}},
    }, stem, opts


def _num(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return v


def make_group(card, env, tag, start_num, rnd, targets, dry=False):
    """題組：一份共用選文 ＋ 2–3 個小題。每題的圖都會重印選文（與官方卷面一致）。"""
    items = card["items"]
    end_num = start_num + len(items) - 1
    ptitle = f"請閱讀下列選文後，回答第 {start_num}～{end_num} 題"
    passage = render_text(card["passage"], env)
    pfig = prep_figure(card.get("passage_figure"), env)

    made = []
    for i, item in enumerate(items):
        sub = {**card, **item}                      # 小題欄位覆蓋整組的共同欄位
        num = start_num + i
        qid = f"{tag}-{num:02d}"
        target = targets[num - 1] if num - 1 < len(targets) else None
        r = make_question(sub, env, qid, tag, num, rnd, f"01_題目圖片/GEN/{qid}.png",
                          dry=dry, target_idx=target, passage=passage,
                          passage_title=ptitle, passage_figure=pfig)
        if r is None:
            return None
        q, stem, opts = r
        q["gen"]["group"] = f"{tag}-{start_num:02d}~{end_num:02d}"
        made.append((q, stem, opts))
    return made


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--n", type=int, default=5)
    ap.add_argument("--paper", type=int, default=0, help="依卷面藍圖生一份 N 題的卷（難度配比自動）")
    ap.add_argument("--books", default="")
    ap.add_argument("--skeletons", default="", help="限定題幹骨架，逗號分隔")
    ap.add_argument("--difficulty", default="", help="限定難度：易,中,難")
    ap.add_argument("--template", default="")
    ap.add_argument("--tag", default="")
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()

    cards = json.loads(TPL_FILE.read_text(encoding="utf-8"))["templates"]
    if args.list:
        print(f"共 {len(cards)} 張選擇題模板卡：")
        for c in cards:
            print(f"  {c['id']:<12} {c['book']} {c['difficulty']} [{c['skeleton']:<4}] "
                  f"{c['chapter'][:14]:<16} {c['topic']}")
        return 0

    pool = cards
    if args.template:
        want = {t.strip() for t in args.template.split(",")}
        pool = [c for c in pool if c["id"] in want]
    if args.books:
        want = {b.strip().upper() for b in args.books.split(",")}
        pool = [c for c in pool if c["book"] in want]
    if args.skeletons:
        want = {s.strip() for s in args.skeletons.split(",")}
        pool = [c for c in pool if c["skeleton"] in want]
    if args.difficulty:
        want = {d.strip() for d in args.difficulty.split(",")}
        pool = [c for c in pool if c["difficulty"] in want]
    if not pool:
        print("✗ 沒有符合條件的模板卡")
        return 1

    rnd = random.Random(args.seed)
    tag = args.tag or ("C" + datetime.now().strftime("%m%d"))
    log = json.loads(LOG_FILE.read_text(encoding="utf-8")) if LOG_FILE.exists() else {"used": []}
    used = set(log.get("used", []))

    # 決定每題要用哪張卡
    n = args.paper or args.n
    plan = []
    if args.paper:
        # 依會考卷面：難度由易到難、題組固定放卷尾、同一張卡盡量少重複、冊別盡量分散
        groups = [c for c in pool if c.get("skeleton") == "題組"]
        normal = [c for c in pool if c.get("skeleton") != "題組"]
        use_group = bool(groups) and n >= 12
        gsize = len(groups[0]["items"]) if use_group else 0
        body_n = n - gsize
        want = []
        for diff, ratio in BLUEPRINT:
            want += [diff] * round(body_n * ratio)
        want = (want + ["中"] * body_n)[:body_n]
        want.sort(key=lambda d: {"易": 0, "中": 1, "難": 2}[d])
        usage, bookcnt = collections.Counter(), collections.Counter()
        for diff in want:
            cand = [c for c in normal if c["difficulty"] == diff] or normal
            # 先挑用得最少的卡，同分再挑本卷該冊題數最少的，最後才隨機
            cand = sorted(cand, key=lambda c: (usage[c["id"]], bookcnt[c["book"]], rnd.random()))
            pick = cand[0]
            usage[pick["id"]] += 1
            bookcnt[pick["book"]] += 1
            plan.append(pick)
        if use_group:
            plan.append(rnd.choice(groups))
    else:
        for i in range(n):
            fresh = [c for c in pool if c["id"] not in {x["id"] for x in plan}] or pool
            plan.append(rnd.choice(fresh))

    # 全卷正解字母目標：A/B/C/D 平均分配後洗牌（會考近10年 A59 B66 C65 D65，本來就均勻）
    targets = [i % 4 for i in range(len(plan) + 8)]
    rnd.shuffle(targets)

    questions, previews = [], []
    num = 1
    for card in plan:
        if num > n:
            break
        is_group = card.get("skeleton") == "題組"
        made = None
        for _ in range(40):                          # 選項可能撞號，重抽幾次
            env, _sig = gen_one(card, rnd, used)
            if env is None:
                break
            if is_group:
                made = make_group(card, env, tag, num, rnd, targets, dry=args.dry)
            else:
                r = make_question(card, env, f"{tag}-{num:02d}", tag, num, rnd,
                                  f"01_題目圖片/GEN/{tag}-{num:02d}.png", dry=args.dry,
                                  target_idx=targets[num - 1])
                made = [r] if r else None
            if made:
                break
        if not made:
            print(f"✗ 模板 {card['id']} 生不出合格題目（選項重複或約束太緊）")
            return 2
        for q, stem, opts in made:
            questions.append(q)
            previews.append((card, q, stem, opts))
            num += 1

    for card, q, stem, opts in previews:
        print("=" * 74)
        print(f"【{q['id']}】{card['id']}　{q['book']} {q['chapter']}　"
              f"[{card['skeleton']}]　{q['difficulty']}")
        print(f"{q['num']}. {stem}")
        print("　　" + "　".join(opts))
        print(f"－ 答案：{q['answer']}　　考點：{q['gen']['key_idea']}")
        print(f"－ 詳解：{q['solution']}")
        if q["trap"]:
            print(f"－ 陷阱：{q['trap']}")
        print("－ 干擾項：" + "；".join(f"({o['opt']}){o['error']}" for o in q["gen"]["options"]))

    dist = collections.Counter(q["answer"] for q in questions)
    print("\n正解字母分布：" + "　".join(f"{L}={dist.get(L, 0)}" for L in LETTERS))
    worst = max(dist.values()) / len(questions) if questions else 0
    if worst > 0.45 and len(questions) >= 8:
        print("⚠ 某個字母超過 45%，建議重跑（換 --seed）讓分布更接近官方的均勻")

    if args.dry:
        print("\n（--dry：未寫任何檔案）")
        return 0

    qf = DATA / f"questions_{tag}.json"
    old = json.loads(qf.read_text(encoding="utf-8")) if qf.exists() else []
    keep = [o for o in old if o["id"] not in {q["id"] for q in questions}]
    (qf).write_text(json.dumps(keep + questions, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n✓ 題目寫入 {qf.relative_to(BASE)}（本批 {len(questions)} 題，檔內共 {len(keep) + len(questions)} 題）")

    log["used"] = sorted(used)
    log["last_choice"] = {"tag": tag, "at": datetime.now().isoformat(timespec="seconds"),
                          "ids": [q["id"] for q in questions]}
    LOG_FILE.write_text(json.dumps(log, ensure_ascii=False, indent=1), encoding="utf-8")
    print("下一步：python scripts/build_html.py → 題庫可見；派卷把 id 加進 data/quizzes.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
