# -*- coding: utf-8 -*-
"""
texify_solutions.py — 把題目檔裡「純文字寫的數學式」轉成 LaTeX（$...$），讓前端 KaTeX 排版。

學生反映錯題詳解的數學式不好讀（分數寫成 a/b、次方寫成「2 的 30 次方」）。
前端已加 KaTeX（build_html.py），只要詳解裡有 $...$ 就會排成真正的分數與上下標。

設計原則（這支是改既有資料，寧可少轉也不要轉錯）：
  · 只轉「整行都是算式」的行，中文敘述行一律不動 → 不會把句子弄爛
  · 看得懂的才轉：全形運算符、√、次方、分數、常見關係符號
  · 轉完立刻用 KaTeX 的語法子集自我檢查（括號配對、不產生空 $$），不過就放棄那一行
  · 預設只預覽不寫檔，要加 --write 才動資料

用法：
  python scripts/texify_solutions.py --file data/questions_HL113T3.json            # 預覽
  python scripts/texify_solutions.py --file data/questions_HL113T3.json --write    # 實際寫入
  python scripts/texify_solutions.py --file ... --fields solution steps            # 指定欄位
"""
import argparse
import json
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

# 全形／符號 → LaTeX
SYM = {
    "＝": "=", "＋": "+", "－": "-", "×": r"\times ", "÷": r"\div ",
    "≠": r"\neq ", "≦": r"\leq ", "≤": r"\leq ", "≧": r"\geq ", "≥": r"\geq ",
    "＜": "<", "＞": ">", "∠": r"\angle ", "△": r"\triangle ", "≅": r"\cong ",
    "∥": r"\parallel ", "⊥": r"\perp ", "∵": r"\because ", "∴": r"\therefore ",
    "⇒": r"\Rightarrow ", "→": r"\to ", "・": r"\cdot ", "·": r"\cdot ",
    "±": r"\pm ", "°": r"^\circ ", "％": r"\%", "%": r"\%",
    "（": "(", "）": ")", "：": ":", "，": ",",
}
SUP = {"⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5",
       "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
       "⁺": "+", "⁻": "-", "ⁿ": "n", "ᵃ": "a", "ᵇ": "b", "ᶜ": "c",
       "ᵈ": "d", "ᵏ": "k", "ᵐ": "m", "ˣ": "x", "ʸ": "y"}

# 一行「看起來整行都是算式」才轉：不含中文，且至少有一個運算符
CJK = re.compile(r"[一-鿿　-〿｜「」【】]")
HAS_OP = re.compile(r"[＝=＋\+－\-×÷≠≦≧<>√⁰¹²³⁴⁵⁶⁷⁸⁹^]")


def _supers(s):
    """x² → x^{2}；連續上標合併成一個指數。"""
    def rep(m):
        return "^{" + "".join(SUP[c] for c in m.group(0)) + "}"
    return re.sub("[" + "".join(SUP) + "]+", rep, s)


def _sqrt(s):
    """√(…) 與 √123 → \\sqrt{…}。"""
    out, i = [], 0
    while i < len(s):
        if s[i] == "√":
            j = i + 1
            if j < len(s) and s[j] == "(":
                depth, k = 1, j + 1
                while k < len(s) and depth:
                    depth += (s[k] == "(") - (s[k] == ")")
                    k += 1
                out.append(r"\sqrt{" + s[j + 1:k - 1] + "}")
                i = k
                continue
            while j < len(s) and (s[j].isdigit() or s[j] in "abcxyz"):
                j += 1
            out.append(r"\sqrt{" + s[i + 1:j] + "}")
            i = j
            continue
        out.append(s[i]); i += 1
    return "".join(out)


def _frac(s):
    """單純的 a/b（兩邊是數字或單一變數）轉成 \\frac{a}{b}；複雜的保持原樣。"""
    return re.sub(r"(?<![\w}])(\d{1,4}|[a-zA-Z])\s*/\s*(\d{1,4}|[a-zA-Z])(?![\w{])",
                  lambda m: r"\frac{" + m.group(1) + "}{" + m.group(2) + "}", s)


OPT = re.compile(r"^\s*(\([A-Da-d1-9]\)|[①②③④⑤])\s*")


def to_tex(line):
    """把一行算式轉成 LaTeX；判斷不該轉就回 None。

    行首的選項標籤 (A)／(1) 要留在數學式外面，否則會被排成斜體變數。
    """
    t = line.strip()
    m = OPT.match(t)
    head = ""
    if m:
        head, t = m.group(0), t[m.end():]
    if not t or CJK.search(t) or not HAS_OP.search(t):
        return None
    if "$" in t or chr(92) in t:          # 已經是 LaTeX 或含反斜線 → 不碰
        return None
    body = _frac(_sqrt(_supers(t)))
    for a, b in SYM.items():
        body = body.replace(a, b)
    if body.count("{") != body.count("}") or body.count("(") != body.count(")"):
        return None                        # 括號不配對 → 放棄這行，寧可不轉
    body = re.sub(r"\s+", " ", body).strip()
    return None if not body else head + "$" + body + "$"


def texify(text):
    """逐行處理：整行算式才轉，中文敘述行原樣保留。回傳 (新字串, 轉了幾行)。"""
    out, n = [], 0
    for line in str(text).split("\n"):
        tex = to_tex(line)
        if tex:
            out.append(tex); n += 1
        else:
            out.append(line)
    return "\n".join(out), n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", required=True)
    ap.add_argument("--fields", nargs="*", default=["solution", "steps"])
    ap.add_argument("--write", action="store_true", help="實際寫入（預設只預覽）")
    ap.add_argument("--limit", type=int, default=6, help="預覽顯示幾題")
    args = ap.parse_args()

    p = Path(args.file)
    qs = json.loads(p.read_text(encoding="utf-8"))
    total, shown = 0, 0
    for q in qs:
        changed = 0
        for f in args.fields:
            v = q.get(f)
            if isinstance(v, str):
                nv, n = texify(v)
                if n:
                    q[f] = nv; changed += n
            elif isinstance(v, list):
                nl = []
                for item in v:
                    ni, n = texify(item) if isinstance(item, str) else (item, 0)
                    nl.append(ni); changed += n
                q[f] = nl
        total += changed
        if changed and shown < args.limit:
            shown += 1
            print("=" * 66)
            print(q["id"], f"（本題轉了 {changed} 行）")
            print(q.get("solution", "")[:420])
    print("=" * 66)
    print(f"共轉換 {total} 行，{len(qs)} 題")
    if args.write:
        bk = Path("backup") / f"{p.stem}_備份_{datetime.now():%m%d_%H%M%S}.json"
        bk.parent.mkdir(exist_ok=True)
        shutil.copy(p, bk)
        p.write_text(json.dumps(qs, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"✓ 已寫入 {p}（原檔備份 {bk}）")
    else:
        print("（預覽模式，未寫檔；確認沒問題再加 --write）")


if __name__ == "__main__":
    main()
