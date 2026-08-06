# -*- coding: utf-8 -*-
"""
會考風格「非選擇題」自動生成器。

依 data/templates_essay.json 的模板卡（一張卡＝一個數學骨架），
隨機抽情境與參數 → 檢查約束 → 算出答案 → 填出題幹／詳解／評分規準，
輸出：
  1. data/questions_<tag>.json      （與 questions_1xx.json 同格式，可直接進題庫／出卷／線上作答站）
  2. data/essay_rubrics.json        （併入生成題的 guide/checkpoints，AI 批改管線直接可用；預設會先備份）
  3. 01_題目圖片/GEN/<id>.png       （題幹渲染圖，前端一律用 <img> 顯示，故必須有圖）

用法：
  python scripts/gen_essay.py --list                       # 看有哪些模板卡
  python scripts/gen_essay.py --n 2                        # 隨機生成 1 份卷（2 題：N1+N2）
  python scripts/gen_essay.py --books B1,B4 --n 2          # 限定冊別
  python scripts/gen_essay.py --template E-B4-N1-01        # 指定模板卡
  python scripts/gen_essay.py --n 4 --tag G0806 --seed 7   # 指定批次代碼與亂數種子（可重現）
  python scripts/gen_essay.py --n 2 --dry                  # 只印出來看，不寫檔

設計依據：命題模板/命題公式分析報告.md
  非選題公式 =（生活情境）＋（題目現場定義的新規則）＋(1)單步套用＋(2)建模→推理→判斷
  評分規準 L3/L2/L1/L0 逐年同一套模子 → 由模板卡的四個錨點 A/B/C/D 自動生成
"""
import argparse
import json
import random
import re
import sys
from datetime import datetime
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, str(Path(__file__).resolve().parent))

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data"
IMGDIR = BASE / "01_題目圖片" / "GEN"
TPL_FILE = DATA / "templates_essay.json"
RUBRIC_FILE = DATA / "essay_rubrics.json"
LOG_FILE = DATA / "gen_log.json"
BACKUP = BASE / "backup"

# ---------------------------------------------------------------- 共用核心
# 參數抽樣／受限 eval／數值格式化／文字模板填值 一律走 gen_common（與選擇題生成器共用）

from gen_common import (eval_env, run_derive, check_constraints, fmt,  # noqa: F401,E402
                        render_text, pick_params, gen_one, prep_figure)



# ---------------------------------------------------------------- 評分規準自動生成
# 依 103–114 官方逐級分指引歸納的模子（見 命題公式分析報告.md 壹-四）

L0_TEXT = "1. 只有答案或與題目無關。\n2. 策略模糊不清或錯誤。"


def build_rubric(card, env):
    """由四個錨點 A/B/C/D 生成 guide(L3/L2/L1/L0) 與 checkpoints。

    模板卡可另外提供兩樣東西，讓生成的規準更貼近官方（官方靠樣卷才寫得出來的那兩層）：
      alt_paths      等價解法路徑。官方 L3 常列兩三條路（列方程式／文字說明推導／列舉檢驗），
                     只寫一條會害 AI 把換方法的學生誤判。
      common_errors  典型錯誤樣態 [{text, level}]。官方 L2 會寫「誤以 2 為調整倍率」這種
                     從真實答案歸納的具體誤答；沒有它，L2 只剩抽象的「出現計算錯誤」。
    """
    a = render_text(card["anchors"]["A"], env)  # 第(1)小題的答案
    b = render_text(card["anchors"]["B"], env)  # 第(2)小題的關鍵關係式（建模那一步）
    c = render_text(card["anchors"]["C"], env)  # 第(2)小題的關鍵轉化／推理步驟
    d = render_text(card["anchors"]["D"], env)  # 第(2)小題的最終判斷
    l1e = render_text(card.get("l1_element", "正確列出解題所需的關係式"), env)
    alts = [render_text(x, env) for x in (card.get("alt_paths") or [])]
    errs = [{"text": render_text(e["text"], env), "level": int(e.get("level", 2))}
            for e in (card.get("common_errors") or [])]
    e2 = [e["text"] for e in errs if e["level"] == 2]
    e1 = [e["text"] for e in errs if e["level"] == 1]

    l3 = (f"第一小題正確得出 {a}；第二小題{c}，並{d}，"
          "解題步驟呈現完整或大致完整的推導／推理或解釋。")
    if alts:
        l3 += ("\n另：第二小題改用下列任一等價解法並得到正確結果，推理完整者，同樣給三級分：\n"
               + "\n".join(f"（{i + 1}）{x}" for i, x in enumerate(alts)))

    l2 = ("第一小題正確得出 " + a + "，且第二小題呈現下列情形之一：\n"
          f"1. 策略適切、步驟詳細（{b}），但過程出現計算錯誤，仍依所得數值做出合理的判斷。\n"
          f"2. 已{c}，但未能做出正確判斷。\n"
          f"3. 做出正確判斷，但未呈現{c}，缺少解題過程中的關鍵步驟或其合理性說明。\n"
          "另：第一小題未正確，但第二小題解題過程達到上述三級分之要求者，亦為二級分。")
    if e2:
        l2 += "\n本題常見的二級分情形：" + "；".join(e2) + "。"

    l1 = ("未達二級分標準，但呈現下列其一：\n"
          f"1. 第一小題根據已知條件以算式推導出 {a}，或呈現答案並解釋理由。\n"
          f"2. 呈現非題目已知的解題要素，例如：{l1e}。")
    if e1:
        l1 += "\n本題常見的一級分情形：" + "；".join(e1) + "。"

    cps = [
        {"id": "c1", "text": f"第(1)小題以算式推導或說明理由，正確得出 {a}（非僅寫答案）。", "primary_level": 1},
        {"id": "c2", "text": f"第(2)小題正確建立關鍵關係式：{b}。", "primary_level": 3},
        {"id": "c3", "text": f"第(2)小題的關鍵步驟：{c}。", "primary_level": 3},
        {"id": "c4", "text": f"第(2)小題做出正確判斷：{d}。", "primary_level": 3},
        {"id": "c5", "text": "解題步驟呈現完整或大致完整的推導／推理或解釋。", "primary_level": 3},
        {"id": "c6", "text": "策略方向正確但出現計算錯誤，或缺少關鍵步驟的合理性說明，仍依所得數值做出合理判斷。",
         "primary_level": 2},
        {"id": "c7", "text": f"僅呈現非題目已知的解題要素（如：{l1e}），未達二級分標準。", "primary_level": 1},
    ]
    for i, x in enumerate(alts):
        cps.append({"id": f"a{i + 1}",
                    "text": f"（等價解法，達成 c2/c3 同等效力）以下列方式完成第(2)小題並得到正確結果：{x}",
                    "primary_level": 3})
    return {"l3": l3, "l2": l2, "l1": l1, "l0": L0_TEXT}, cps, errs


# ---------------------------------------------------------------- 題幹渲染
# 圖與題目卡排版統一交給共用元件庫 figures.py（非選／選擇題共用同一套）

from figures import render_question_png  # noqa: E402

ESSAY_LEAD = "請根據上述資訊回答下列問題，完整寫出你的解題過程並詳細解釋："



# ---------------------------------------------------------------- 生成主流程


def pick_params(spec, rnd):
    if "choices" in spec:
        return rnd.choice(spec["choices"])
    lo, hi = spec["range"]
    step = spec.get("step", 1)
    vals = list(range(lo, hi + 1, step))
    if spec.get("odd"):
        vals = [v for v in vals if v % 2 == 1]
    if spec.get("even"):
        vals = [v for v in vals if v % 2 == 0]
    return rnd.choice(vals)


def gen_one(card, rnd, used_sigs, tries=400):
    """抽一組合法的（情境, 參數）並算出所有衍生量。回傳 env 與簽章。"""
    for _ in range(tries):
        env = {}
        ctx = rnd.choice(card.get("contexts", [{}]))
        for k, v in ctx.items():
            env["c_" + k] = v
        for k, spec in card.get("params", {}).items():
            env[k] = pick_params(spec, rnd)
        sig = card["id"] + "|" + json.dumps(
            {k: (str(v)) for k, v in env.items()}, ensure_ascii=False, sort_keys=True)
        if sig in used_sigs:
            continue
        try:
            run_derive(card.get("derive", []), env)
        except Exception:
            continue
        ok, _bad = check_constraints(card.get("constraints", []), env)
        if not ok:
            continue
        used_sigs.add(sig)
        return env, sig
    return None, None


def build_question(card, env, qid, year, num, img_rel):
    q = {
        "id": qid,
        "year": year,
        "num": num,
        "type": "essay",
        "img": img_rel,
        "answer": render_text(card["answer"], env),
        "codes": card["codes"],
        "perf": card["perf"],
        "book": card["book"],
        "chapter": card["chapter"],
        "topic": render_text(card["topic"], env) + f"（非選第{num - 25}題）" if num > 25 else render_text(card["topic"], env),
        "difficulty": card["difficulty"],
        "solution": render_text(card["solution"], env),
        "steps": render_text(card["steps"], env),
        "trap": render_text(card.get("trap", ""), env),
        "gen": {"template": card["id"], "ask_type": card["ask_type"],
                "params": {k: str(v) for k, v in env.items() if not k.startswith("c_")}},
    }
    return q


def build_rubric_entry(card, env, qid, year, num, stem, subs):
    guide, cps, errs = build_rubric(card, env)
    return {
        "qid": qid,
        "year": year,
        "q": num - 25 if num > 25 else num,
        "title": render_text(card["topic"], env),
        "answer_points": render_text(card["solution"], env),
        "guide": guide,
        "checkpoints": cps,
        "confidence": "generated",
        "official_guide_available": False,
        "source_pdf": None,
        "exam_page": None,
        "notes": (f"本題由模板 {card['id']}（{card['ask_type']}）自動生成，"
                  "評分規準依 103–114 官方逐級分指引的共同結構套模生成，非官方原件；"
                  "AI 初評後仍需老師覆核。"),
        "stem": stem,
        "subs": subs,
        "alt_paths": [render_text(x, env) for x in (card.get("alt_paths") or [])],
        "common_errors": errs,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="store_true", help="列出模板卡")
    ap.add_argument("--n", type=int, default=2, help="生成幾題（預設 2＝一份卷）")
    ap.add_argument("--books", default="", help="限定冊別，逗號分隔，如 B1,B4")
    ap.add_argument("--template", default="", help="指定模板卡 id（可逗號分隔多張）")
    ap.add_argument("--roles", default="", help="限定 N1／N2，如 N1,N2")
    ap.add_argument("--tag", default="", help="批次代碼（預設 G+月日，如 G0805）")
    ap.add_argument("--seed", type=int, default=None, help="亂數種子（可重現）")
    ap.add_argument("--dry", action="store_true", help="只印出來，不寫檔")
    ap.add_argument("--no-merge", action="store_true", help="不要併入 essay_rubrics.json")
    args = ap.parse_args()

    cards = json.loads(TPL_FILE.read_text(encoding="utf-8"))["templates"]
    if args.list:
        print(f"共 {len(cards)} 張模板卡：")
        for c in cards:
            print(f"  {c['id']:<16} {c['role']}  {c['book']} {c['chapter']:<22} "
                  f"[{c['ask_type']}] {c['difficulty']}  {c['topic']}")
        return 0

    pool = cards
    if args.template:
        want = {t.strip() for t in args.template.split(",")}
        pool = [c for c in pool if c["id"] in want]
    if args.books:
        want = {b.strip().upper() for b in args.books.split(",")}
        pool = [c for c in pool if c["book"] in want]
    if args.roles:
        want = {r.strip().upper() for r in args.roles.split(",")}
        pool = [c for c in pool if c["role"] in want]
    if not pool:
        print("✗ 沒有符合條件的模板卡"); return 1

    rnd = random.Random(args.seed)
    tag = args.tag or ("G" + datetime.now().strftime("%m%d"))
    log = json.loads(LOG_FILE.read_text(encoding="utf-8")) if LOG_FILE.exists() else {"used": []}
    used = set(log.get("used", []))

    # 依模板卡的 role 排序：N1（數/代數/統計）在前、N2（幾何）在後，符合官方卷面
    chosen = []
    order = sorted(pool, key=lambda c: (c["role"] != "N1",))
    for i in range(args.n):
        cand = [c for c in order if c["role"] == ("N1" if i % 2 == 0 else "N2")] or order
        # 同一份卷內盡量不重複模板與問法型
        picked_ids = {c["id"] for c in chosen}
        picked_types = {c["ask_type"] for c in chosen}
        fresh = [c for c in cand if c["id"] not in picked_ids and c["ask_type"] not in picked_types] \
            or [c for c in cand if c["id"] not in picked_ids] or cand
        chosen.append(rnd.choice(fresh))

    questions, rubrics = [], []
    for i, card in enumerate(chosen):
        env, sig = gen_one(card, rnd, used)
        if env is None:
            print(f"✗ 模板 {card['id']} 在 400 次嘗試內找不到符合約束的參數（可能約束太緊）")
            return 2
        num = 26 + i                      # 沿用官方卷面：非選為第 26、27 題
        qid = f"{tag}-N{i + 1}"
        stem = render_text(card["stem"], env)
        subs = render_text(card["subs"], env)
        fig = prep_figure(card.get("figure"), env)   # 圖上的標註與數值都套入參數
        img_rel = f"01_題目圖片/GEN/{qid}.png"
        if not args.dry:
            render_question_png(BASE / img_rel, i + 1, stem, subs,
                                figure=fig, lead=ESSAY_LEAD)
        q = build_question(card, env, qid, tag, num, img_rel)
        questions.append(q)
        rubrics.append(build_rubric_entry(card, env, qid, tag, num, stem, subs))

        print("=" * 72)
        print(f"【{qid}】{card['id']}　{card['book']} {card['chapter']}　[{card['ask_type']}]　{card['difficulty']}")
        print(f"{i + 1}. {stem}")
        print("請根據上述資訊回答下列問題，完整寫出你的解題過程並詳細解釋：")
        for s in subs:
            print("   " + s)
        print(f"－ 參考答案：{q['answer']}")
        print(f"－ 詳解：{q['solution']}")
        print(f"－ 陷阱：{q['trap']}")
        r = rubrics[-1]
        print(f"－ L3：{r['guide']['l3']}")
        print(f"－ L1：{r['guide']['l1']}")

    if args.dry:
        print("\n（--dry：未寫任何檔案）")
        return 0

    # 1) 題目檔
    qf = DATA / f"questions_{tag}.json"
    old = json.loads(qf.read_text(encoding="utf-8")) if qf.exists() else []
    old_ids = {q["id"] for q in old}
    merged = old + [q for q in questions if q["id"] not in old_ids]
    for q in questions:                                    # 同 id 覆蓋成新的
        for j, o in enumerate(merged):
            if o["id"] == q["id"]:
                merged[j] = q
    qf.write_text(json.dumps(merged, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n✓ 題目寫入 {qf.relative_to(BASE)}（本批 {len(questions)} 題，檔內共 {len(merged)} 題）")

    # 2) 評分規準
    if not args.no_merge:
        rb = json.loads(RUBRIC_FILE.read_text(encoding="utf-8"))
        BACKUP.mkdir(exist_ok=True)
        bk = BACKUP / f"essay_rubrics_備份_{datetime.now().strftime('%m%d_%H%M%S')}.json"
        bk.write_text(json.dumps(rb, ensure_ascii=False, indent=1), encoding="utf-8")
        for r in rubrics:
            rb["questions"][r["qid"]] = r
        RUBRIC_FILE.write_text(json.dumps(rb, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"✓ 評分規準併入 data/essay_rubrics.json（原檔備份於 {bk.relative_to(BASE)}）")

    # 3) 生成紀錄（避免下次生出一模一樣的參數）
    log["used"] = sorted(used)
    log["last"] = {"tag": tag, "at": datetime.now().isoformat(timespec="seconds"),
                   "ids": [q["id"] for q in questions]}
    LOG_FILE.write_text(json.dumps(log, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"✓ 題幹圖：{IMGDIR.relative_to(BASE)}/")
    print("\n下一步：python scripts/build_html.py → 部署題庫；或把 id 加進 data/quizzes.json 派卷")
    return 0


if __name__ == "__main__":
    sys.exit(main())
