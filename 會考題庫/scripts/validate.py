# -*- coding: utf-8 -*-
"""驗證題庫資料：JSON 可解析、題數、答案與官方一致、圖片存在、課綱代碼有效"""
import json
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
for y in range(103, 116):
    f = DATA / f"questions_{y}.json"
    qs = json.loads(f.read_text(encoding="utf-8"))
    all_q += qs
    total += len(qs)
    if len(qs) != expected_counts[y]:
        errors.append(f"{y}: 題數 {len(qs)} != 預期 {expected_counts[y]}")
    for q in qs:
        qid = q["id"]
        # 圖片存在
        if not (BASE / q["img"]).exists():
            errors.append(f"{qid}: 圖片不存在 {q['img']}")
        # 答案比對（選擇題）
        if q["type"] == "choice":
            off = official[str(y)].get(str(q["num"]))
            if off != q["answer"]:
                errors.append(f"{qid}: 答案 {q['answer']} != 官方 {off}")
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

# 模擬卷（翰林等非歷屆來源）：官方答案表只涵蓋歷屆，故不比對 official_answers，
# 改為檢查 answer 欄不得為空；其餘（圖片、課綱代碼、冊章、必要欄位）比照歷屆。
for extra in ["HL1", "HL2"]:
    f = DATA / f"questions_{extra}.json"
    if not f.exists():
        continue
    qs = json.loads(f.read_text(encoding="utf-8"))
    all_q += qs
    total += len(qs)
    for q in qs:
        qid = q["id"]
        if not (BASE / q["img"]).exists():
            errors.append(f"{qid}: 圖片不存在 {q['img']}")
        if not str(q.get("answer", "")).strip():
            errors.append(f"{qid}: 答案為空")
        for c in q["codes"]:
            if c not in content_codes:
                errors.append(f"{qid}: 學習內容代碼不存在 {c}")
        for p in q["perf"]:
            if p not in perf_codes:
                errors.append(f"{qid}: 學習表現代碼不存在 {p}")
        if q["book"] not in curr["冊別章節"]:
            errors.append(f"{qid}: 冊別錯誤 {q['book']}")
        elif q["chapter"] not in curr["冊別章節"][q["book"]]:
            errors.append(f"{qid}: 章節 {q['chapter']} 不在 {q['book']} 清單中")
        for k in ["solution", "steps", "topic", "difficulty"]:
            if not q.get(k):
                errors.append(f"{qid}: 缺少 {k}")

print(f"總題數: {total}")
print(f"選擇題: {sum(1 for q in all_q if q['type']=='choice')}, 非選: {sum(1 for q in all_q if q['type']=='essay')}")
if errors:
    print(f"\n發現 {len(errors)} 個問題:")
    for e in errors:
        print(" -", e)
else:
    print("全部驗證通過 ✓")
