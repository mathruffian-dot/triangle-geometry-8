# -*- coding: utf-8 -*-
"""驗證 data/concepts.json 的結構：欄位齊全、選項/答案格式、代碼存在、SVG 可解析"""
import json, re, sys
import xml.etree.ElementTree as ET
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
concepts = json.loads((BASE / "data" / "concepts.json").read_text(encoding="utf-8"))
curr = json.loads((BASE / "data" / "curriculum_108.json").read_text(encoding="utf-8"))
PERFS = set(curr["學習表現"])
CODES = set(curr["學習內容"])

errors, warns = [], []
ids, stems = set(), {}

for u in concepts:
    uid = u.get("id", "<無id>")
    def err(msg): errors.append(f"[{uid}] {msg}")
    def warn(msg): warns.append(f"[{uid}] {msg}")

    if not re.match(r"^CU-[a-z]-IV-\d+-\d+$", uid): err("id 格式不符 CU-<表現>-<序號>")
    if uid in ids: err("id 重複")
    ids.add(uid)
    for f in ("name", "brief", "explain"):
        if not u.get(f): err(f"缺 {f}")
    if not u.get("perf"): err("缺 perf")
    for p in u.get("perf", []):
        if p not in PERFS: err(f"perf {p} 不在課綱")
    for c in u.get("codes", []):
        if c not in CODES: err(f"code {c} 不在課綱")
    fig = u.get("figure", "")
    if fig:
        if not fig.strip().startswith("<svg"): err("figure 不是 <svg> 開頭")
        try: ET.fromstring(fig)
        except ET.ParseError as e: err(f"figure SVG 解析失敗: {e}")

    qs = u.get("questions", [])
    if len(qs) < 6: err(f"題數 {len(qs)} < 6")
    lv = [q.get("level") for q in qs]
    if lv.count("基礎") < 3 or lv.count("進階") < 3: err(f"基礎/進階題數不足: {lv}")
    for i, q in enumerate(qs, 1):
        tag = f"第{i}題"
        if q.get("level") not in ("基礎", "進階"): err(f"{tag} level 錯誤")
        if not q.get("stem"): err(f"{tag} 缺題幹")
        opts = q.get("options", [])
        if len(opts) != 4: err(f"{tag} 選項數 {len(opts)} ≠ 4")
        if any(not o for o in opts): err(f"{tag} 有空選項")
        if len(set(opts)) != len(opts): err(f"{tag} 選項重複: {opts}")
        if q.get("answer") not in ("A", "B", "C", "D"): err(f"{tag} answer 不是 A-D")
        if not q.get("solution"): err(f"{tag} 缺詳解")
        st = q.get("stem", "")
        if st in stems: warn(f"{tag} 題幹與 {stems[st]} 重複")
        stems[st] = f"{uid} 第{i}題"

for w in warns: print("⚠", w)
if errors:
    for e in errors: print("❌", e)
    sys.exit(1)
print(f"✅ {len(concepts)} 單元、{sum(len(u['questions']) for u in concepts)} 題全部通過結構驗證")
