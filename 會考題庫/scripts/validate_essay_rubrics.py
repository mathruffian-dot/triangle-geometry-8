# -*- coding: utf-8 -*-
"""
驗證 data/essay_rubrics.json 結構完整性與與題庫的一致性。
用法：python scripts/validate_essay_rubrics.py
"""
import os, sys, json

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "data")

errs, warns = [], []


def load(p):
    return json.load(open(p, encoding="utf-8"))


def bank_essay_ids(year):
    """回傳該年題庫中 type=essay 的題目 id 集合。"""
    p = os.path.join(DATA, f"questions_{year}.json")
    if not os.path.exists(p):
        return set()
    d = load(p)
    qs = d if isinstance(d, list) else d.get("questions", d)
    if isinstance(qs, dict):
        qs = list(qs.values())
    return {q.get("id") for q in qs if q.get("type") == "essay"}


def main():
    p = os.path.join(DATA, "essay_rubrics.json")
    if not os.path.exists(p):
        print("✗ 找不到 data/essay_rubrics.json（工作流組裝後才會產生）")
        return 1
    d = load(p)

    # meta 通用規準
    meta = d.get("meta", {})
    gr = meta.get("general_rubric", {})
    for k in ("3", "2", "1", "0"):
        if not gr.get(k):
            errs.append(f"meta.general_rubric 缺 {k} 級分")

    qs = d.get("questions", {})
    for year in range(104, 116):
        want = bank_essay_ids(year)
        for tag in ("N1", "N2"):
            qid = f"{year}-{tag}"
            if qid not in qs:
                errs.append(f"缺題目 {qid}")
                continue
            r = qs[qid]
            # 與題庫對照
            if want and qid not in want:
                warns.append(f"{qid} 不在題庫 {year} 的 essay id 清單（題庫用 {sorted(want)}）")
            if not r.get("answer_points"):
                errs.append(f"{qid} 缺 answer_points")
            if year <= 114:  # 官方評分指引應到位
                if not r.get("official_guide_available", False):
                    errs.append(f"{qid} 應有官方評分指引但 official_guide_available=False")
                g = r.get("guide") or {}
                for lv in ("l3", "l2", "l1", "l0"):
                    if not g.get(lv):
                        errs.append(f"{qid} guide 缺 {lv}")
                cps = r.get("checkpoints") or []
                if len(cps) < 3:
                    warns.append(f"{qid} checkpoints 只有 {len(cps)} 條（建議≥3）")
                for c in cps:
                    if c.get("primary_level") not in (1, 2, 3):
                        warns.append(f"{qid} checkpoint {c.get('id')} primary_level 異常：{c.get('primary_level')}")
            else:  # 115：官方規準待補
                if r.get("official_guide_available", False):
                    warns.append(f"{qid} 115 標為已有官方規準，請確認官方是否已上架")

    print(f"題目數：{len(qs)}（預期 24＝12年×2）")
    print(f"錯誤 {len(errs)}、警告 {len(warns)}")
    for e in errs:
        print("  ✗", e)
    for w in warns:
        print("  ⚠", w)
    print("✅ 驗證通過" if not errs else "❌ 有錯誤待修")
    return 0 if not errs else 1


if __name__ == "__main__":
    sys.exit(main())
