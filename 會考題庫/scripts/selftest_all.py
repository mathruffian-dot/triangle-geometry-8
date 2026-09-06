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
  --quick 只跳過重建題庫；仍檢查全部題庫、評分規準、CLI 啟動與既有網頁 JS。
"""
import argparse
from html.parser import HTMLParser
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
    try:
        r = subprocess.run([PY, "-X", "utf8"] + args, capture_output=True, text=True,
                           encoding="utf-8", errors="replace", cwd=str(BASE), timeout=180)
    except (OSError, subprocess.TimeoutExpired) as exc:
        fails.append(title)
        print(f"  ✗ 無法完成：{exc}")
        return None
    out = (r.stdout or "").strip().splitlines()
    for line in (out[-show_tail:] if show_tail else []):
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


class ScriptParser(HTMLParser):
    """依 script 類型取出 JavaScript，排除 JSON 與內嵌圖片資料。"""
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.scripts = []
        self.current = None

    def handle_starttag(self, tag, attrs):
        if tag == "script":
            attrs = dict(attrs)
            typ = attrs.get("type", "").strip().lower()
            self.current = [] if "src" not in attrs and typ in (
                "", "text/javascript", "application/javascript", "module") else None

    def handle_data(self, data):
        if self.current is not None:
            self.current.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self.current is not None:
            self.scripts.append("".join(self.current))
            self.current = None


def check_js():
    print("\n── 網頁 JavaScript 語法 ─────────────────────")
    root = BASE.parent
    sources = [(root / "app.js", None)]
    for folder in sorted(root.glob("複習網站*")):
        sources.extend((p, None) for p in sorted(folder.glob("*.js")))
    html_files = [BASE / "index.html", root / "index.html"]
    html_files.extend(folder / "index.html" for folder in sorted(root.glob("複習網站*")))
    try:
        for path in html_files:
            parser = ScriptParser()
            parser.feed(path.read_text(encoding="utf-8"))
            sources.extend((path, script) for script in parser.scripts if script.strip())
        with tempfile.TemporaryDirectory() as tmp:
            for index, (path, source) in enumerate(sources):
                target = path
                if source is not None:
                    target = Path(tmp) / f"inline_{index}.js"
                    target.write_text(source, encoding="utf-8")
                r = subprocess.run(["node", "--check", str(target)], capture_output=True,
                                   text=True, encoding="utf-8", errors="replace", timeout=30)
                if r.returncode:
                    fails.append(f"JS 語法 {path}")
                    print(f"  ✗ {path}: {r.stderr[:200]}")
        print(f"  已檢查 {len(sources)} 個外部檔案／內嵌程式區塊")
    except (OSError, subprocess.TimeoutExpired) as exc:
        fails.append("JS 檢查未完成")
        print(f"  ✗ {exc}")


def check_cli():
    # 明確列出具有 argparse --help 的指令；不執行舊式腳本，以免查詢或寫入線上資料。
    names = ("grade_essays", "make_redpen", "make_feedback_pdf", "make_review_sheet",
             "reset_review", "watch_grade", "apply_ai_review")
    for name in names:
        run(f"CLI 啟動 {name}", [f"scripts/{name}.py", "--help"], show_tail=0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quick", action="store_true")
    args = ap.parse_args()

    fails.clear()
    run("完整題庫資料", ["scripts/validate.py"])
    run("非選評分規準", ["scripts/validate_essay_rubrics.py"], show_tail=3)
    run("離線回歸測試", ["-m", "unittest", "discover", "-s", "tests", "-v"], show_tail=0)
    check_cli()
    try:
        check_figures()
    except Exception as exc:
        fails.append("圖元件庫載入")
        print(f"  ✗ {type(exc).__name__}: {exc}")
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
