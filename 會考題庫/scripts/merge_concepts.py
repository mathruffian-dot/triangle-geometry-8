# -*- coding: utf-8 -*-
"""把批次單元 JSON 併入 data/concepts.json（id 重複則拒絕），用法：python merge_concepts.py <batch.json>

合併時對每題做「確定性洗牌」：把正解移到隨機位置（以單元 id 為種子，可重現），
避免正解全落在同一選項。選項尾端若是「一樣大／無法比較」這類固定語，只在前兩位內換。
注意：題目的詳解與誘答文字一律引用「選項內容」而非 (A)(B) 字母，洗牌才安全。
"""
import json, sys, random
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
target = BASE / "data" / "concepts.json"
concepts = json.loads(target.read_text(encoding="utf-8"))
batch = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))

# figure 若為 "@圖形id"，從第二參數的 figs.json 帶入實際 SVG
if len(sys.argv) > 2:
    figs = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
    for u in batch:
        f = u.get("figure", "")
        if f.startswith("@"):
            u["figure"] = figs[f[1:]]
for u in batch:
    if u.get("figure", "").startswith("@"):
        print(f"❌ {u['id']} 的圖形佔位符未解析：{u['figure']}")
        sys.exit(1)

FIXED_TAIL = ("一樣大", "無法比較", "無法判斷", "以上皆是", "以上皆非")
ABCD = "ABCD"

for u in batch:
    rng = random.Random(u["id"])
    for q in u["questions"]:
        opts = q["options"]
        movable = 4
        while movable > 2 and any(k in opts[movable - 1] for k in FIXED_TAIL):
            movable -= 1
        cur = ABCD.index(q["answer"])
        if cur >= movable:  # 正解本身在固定尾端，不動
            continue
        tgt = rng.randrange(movable)
        opts[cur], opts[tgt] = opts[tgt], opts[cur]
        q["answer"] = ABCD[tgt]

existing = {u["id"] for u in concepts}
dup = [u["id"] for u in batch if u["id"] in existing]
if dup:
    print("❌ id 重複，未合併：", dup)
    sys.exit(1)
concepts += batch
target.write_text(json.dumps(concepts, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"✅ 併入 {len(batch)} 單元，共 {len(concepts)} 單元")
