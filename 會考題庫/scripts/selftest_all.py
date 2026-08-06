# -*- coding: utf-8 -*-
"""
命題系統的端到端自測（改過模板卡、生成器或圖元件之後跑這一支就對了）。

依序檢查：
  1. 圖元件庫：每個 kind 都渲染得出來
  2. 非選模板：validate_templates_essay.py
  3. 選擇題模板：validate_templates_choice.py
  4. 實際生成：一份 25 題選擇卷 ＋ 一份 2 題非選卷（--dry，不寫檔）
  5. 題庫建置：build_html.py 跑得過，且 index.html 的 JS 通過 node --check

用法：python scripts/selftest_all.py [--quick]
  --quick 跳過第 5 步（build_html 會重建 20MB 單檔版與 PDF，較慢）
"""
import argparse
import re
import subprocess
import sys
import tempfile
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
BASE = Path(__file__).resolve().parent.parent
PY = sys.executable
fails = []


def run(title, args, expect_ok=True, show_tail=6):
    print(f"\n── {title} " + "─" * max(0, 50 - len(title)))
    r = subprocess.run([PY] + args, capture_output=True, text=True,
                       encoding="utf-8", errors="replace", cwd=str(BASE))
    out = (r.stdout or "").strip().splitlines()
    for line in out[-show_tail:]:
        print("  " + line)
    ok = (r.returncode == 0) if expect_ok else True
    if not ok:
        fails.append(title)
        err = (r.stderr or "").strip().splitlines()
        for line in err[-4:]:
            print("  ! " + line)
    return r


def check_figures():
    print("\n── 1. 圖元件庫 " + "─" * 38)
    sys.path.insert(0, str(BASE / "scripts"))
    import figures
    bad = []
    for name, spec in figures.DEMOS:
        try:
            figures.render_svg(spec)
        except Exception as e:
            bad.append(f"{name}: {type(e).__name__}: {e}")
    print(f"  {len(figures.DEMOS) - len(bad)}/{len(figures.DEMOS)} 個元件渲染成功")
    for b in bad:
        print("  ✗ " + b)
        fails.append("圖元件 " + b)


def check_js():
    print("\n── 5b. index.html 的 JS 語法 " + "─" * 24)
    h = (BASE / "index.html").read_text(encoding="utf-8")
    bad = 0
    for i, s in enumerate(re.findall(r"<script[^>]*>(.*?)</script>", h, re.S)):
        if "function" not in s and "=>" not in s:
            continue
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
            f.write(s)
            path = f.name
        r = subprocess.run(["node", "--check", path], capture_output=True, text=True,
                           encoding="utf-8", errors="replace")
        Path(path).unlink(missing_ok=True)
        if r.returncode != 0:
            bad += 1
            print("  ✗ script#%d %s" % (i, (r.stderr or "")[:160]))
    if bad:
        fails.append("index.html JS 語法")
    else:
        print("  ✓ 通過")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quick", action="store_true")
    args = ap.parse_args()

    check_figures()
    run("2. 非選模板驗證", ["scripts/validate_templates_essay.py", "--n", "20"], show_tail=4)
    run("3. 選擇題模板驗證", ["scripts/validate_templates_choice.py", "--n", "20"], show_tail=5)
    run("4a. 生成 25 題選擇卷（dry）",
        ["scripts/gen_choice.py", "--paper", "25", "--tag", "SELFTEST", "--dry"], show_tail=3)
    run("4b. 生成 2 題非選卷（dry）",
        ["scripts/gen_essay.py", "--n", "2", "--dry"], show_tail=3)
    if not args.quick:
        run("5. 題庫建置", ["scripts/build_html.py"], show_tail=3)
        check_js()

    print("\n" + "=" * 60)
    if fails:
        print("✗ 有問題的項目：")
        for f in fails:
            print("   - " + f)
    else:
        print("✓ 全部通過")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
