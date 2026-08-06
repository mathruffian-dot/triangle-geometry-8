# -*- coding: utf-8 -*-
"""從 data/concepts.json 生成各單元審題檔（觀念補強/審題_<表現>_<名稱>.md）。
已存在的檔案不覆蓋（保留審題結果）。"""
import json, re
from pathlib import Path
import sys as _sys
_sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import get as _cfg  # 集中設定

BASE = Path(__file__).resolve().parent.parent
OUT = BASE / "觀念補強"
concepts = json.loads((BASE / "data" / "concepts.json").read_text(encoding="utf-8"))

def strip_html(s):
    s = re.sub(r"<br\s*/?>", "\n", s)
    s = re.sub(r"</p>", "\n\n", s)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\n{3,}", "\n\n", s).strip()

made = 0
for u in concepts:
    path = OUT / f"審題_{u['perf'][0]}_{u['name'].replace('/', '／')}.md"
    if path.exists():
        continue
    lines = [
        f"# 觀念補強單元審題 — {u['name']}（{' / '.join(u['perf'])} / {'、'.join(u.get('codes', []))}）",
        "",
        "> 給審題 AI／審題者：請逐項檢查下列內容，回報格式見文末。",
        f"> 資料來源：`會考題庫/data/concepts.json`（單元 id：{u['id']}）",
        f"> 線上預覽：{_cfg('bank_site_url')} →「觀念補強」分頁",
        "",
        "## 審題重點",
        "1. **數學正確性**：每題的答案、詳解計算是否正確？選項中是否誤含第二個正確答案？",
        "2. **難度定位**：對象是學習落後的國中生，基礎題是否夠簡單？進階題是否仍在「單一觀念」內（不混入其他觀念）？",
        "3. **說明白話程度**：概念說明是否一次只講一件事、無多餘術語？",
        "4. **誘答選項合理性**：錯誤選項是否對應真實的常見錯誤（而非湊數）？",
        "5. **課綱對應**：內容是否確實對應學習表現與學習內容代碼？",
        "",
        "## 概念說明（學生會看到的文字）",
        "",
        strip_html(u["explain"]),
        "",
    ]
    if u.get("figure"):
        lines.append("（本單元含 SVG 配圖，請在線上預覽確認比例與標記）")
        lines.append("")
    lines.append(f"## 題目（基礎 {sum(1 for q in u['questions'] if q['level']=='基礎')} 題＋進階 {sum(1 for q in u['questions'] if q['level']=='進階')} 題）")
    lines.append("")
    for i, q in enumerate(u["questions"], 1):
        lines.append(f"### 第 {i} 題（{q['level']}）")
        lines.append(strip_html(q["stem"]))
        opts = "　".join(
            f"({L}) {strip_html(o)}" + (" ✓" if L == q["answer"] else "")
            for L, o in zip("ABCD", q["options"])
        )
        lines.append(opts)
        sol = f"詳解:{strip_html(q['solution'])}"
        if q.get("trap"):
            sol += f"｜誘答/提醒:{strip_html(q['trap'])}"
        lines.append(sol)
        lines.append("")
    lines += [
        "## 回報格式",
        "逐題回報：`第N題：✅ 通過` 或 `第N題：❌ 問題描述＋修改建議`。",
        "說明部分若有修改建議，請直接給出替換後的文字。",
        "",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")
    made += 1

print(f"✅ 新生成 {made} 個審題檔（既有檔案不覆蓋）")
