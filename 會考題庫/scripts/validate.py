# -*- coding: utf-8 -*-
"""驗證題庫資料：JSON 可解析、題數、答案與官方一致、圖片存在、課綱代碼有效"""
import json
import sys

sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data"

official = json.loads((DATA / "official_answers.json").read_text(encoding="utf-8"))
curr = json.loads((DATA / "curriculum_108.json").read_text(encoding="utf-8"))
perf_codes = set(curr["學習表現"])
content_codes = set(curr["學習內容"])

expected_counts = {103: 29, 104: 27, 105: 27, 106: 28, 107: 28, 108: 28,
                   109: 28, 110: 28, 111: 27, 112: 27, 113: 27, 114: 27, 115: 27}
errors = []
total = 0
all_q = []
seen_ids = set()
for y in expected_counts:
    if not (DATA / f"questions_{y}.json").is_file():
        errors.append(f"缺少官方題庫 questions_{y}.json")
files = sorted(DATA.glob("questions_*.json"))
if not files:
    errors.append("找不到任何 questions_*.json")
for f in files:
    batch = f.stem.removeprefix("questions_")
    y = int(batch) if batch.isdigit() else None
    try:
        qs = json.loads(f.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        errors.append(f"{f.name}: 無法讀取 JSON：{exc}")
        continue
    if not isinstance(qs, list):
        errors.append(f"{f.name}: 題庫必須是陣列")
        continue
    valid = []
    for index, q in enumerate(qs, 1):
        loc = f"{f.name} 第 {index} 筆"
        if not isinstance(q, dict):
            errors.append(f"{loc}: 題目必須是物件")
            continue
        fields = {"id": str, "type": str, "img": str, "book": str,
                  "chapter": str, "codes": list, "perf": list}
        if any(not isinstance(q.get(k), typ) or not q[k] for k, typ in fields.items()):
            errors.append(f"{loc}: 缺少必要欄位或欄位型別不正確")
            continue
        if any(not isinstance(code, str) for code in q["codes"] + q["perf"]):
            errors.append(f"{loc}: 課綱代碼必須是字串")
            continue
        if q["id"] in seen_ids:
            errors.append(f"{q['id']}: 題目 ID 重複")
        seen_ids.add(q["id"])
        if q["type"] not in ("choice", "essay"):
            errors.append(f"{q['id']}: 無效題型 {q['type']}")
        answer = q.get("answer")
        if answer is None or not str(answer).strip():
            errors.append(f"{q['id']}: 答案為空")
        if q["type"] == "choice" and answer not in ("A", "B", "C", "D"):
            errors.append(f"{q['id']}: 選擇答案必須是 A/B/C/D")
        valid.append(q)
    source_count = len(qs)
    qs = valid
    all_q += qs
    total += len(qs)
    if y in expected_counts and source_count != expected_counts[y]:
        errors.append(f"{y}: 題數 {source_count} != 預期 {expected_counts[y]}")
    for q in qs:
        qid = q["id"]
        # 圖片存在
        image = (BASE / q["img"]).resolve()
        if not image.is_relative_to(BASE.resolve()) or not image.is_file():
            errors.append(f"{qid}: 圖片不存在 {q['img']}")
        # 答案比對（選擇題）
        if q["type"] == "choice" and y in expected_counts:
            off = official.get(str(y), {}).get(str(q.get("num")))
            if off != q["answer"]:
                errors.append(f"{qid}: 答案 {q.get('answer')} != 官方 {off}")
        # 課綱代碼
        for c in q["codes"]:
            if c not in content_codes:
                errors.append(f"{qid}: 學習內容代碼不存在 {c}")
        for p in q["perf"]:
            if p not in perf_codes:
                errors.append(f"{qid}: 學習表現代碼不存在 {p}")
        # 冊別章節與 curriculum 對照
        if q["book"] not in curr["冊別章節"]:
            errors.append(f"{qid}: 冊別錯誤 {q['book']}")
        elif q["chapter"] not in curr["冊別章節"][q["book"]]:
            errors.append(f"{qid}: 章節 {q['chapter']} 不在 {q['book']} 清單中")
        # 必要欄位
        for k in ["solution", "steps", "topic", "difficulty"]:
            if not q.get(k):
                errors.append(f"{qid}: 缺少 {k}")

print(f"總題數: {total}（掃描所有 questions_*.json）")
print(f"選擇題: {sum(1 for q in all_q if q['type']=='choice')}, 非選: {sum(1 for q in all_q if q['type']=='essay')}")
if errors:
    print(f"\n發現 {len(errors)} 個問題:")
    for e in errors:
        print(" -", e)
else:
    print("全部驗證通過 ✓")

sys.exit(1 if errors else 0)
