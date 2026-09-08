# -*- coding: utf-8 -*-
"""
auto_grade_watch.py — 考試中自動輪詢批改（可排程，不需要有人看著）

每隔一段時間查一次「還沒批的份數」，有就依序做：
    AI 批改 → 產紅筆圖（含續寫解答）→ 套用 AI 級分為老師覆核級分
最後一步是關鍵：學生查成績只認「老師覆核級分」，不套用的話學生只看得到「批改中…」。

平行度依待批份數自動調整（見 AGENTS.md）；批改腳本本身是增量的，重複跑很安全。

⚠ 加了 --apply 就等於「AI 初評未經人工確認直接放行」。老師事後仍可在覆核頁改分
   （改分會覆蓋這裡寫的值，本腳本也不會再去覆蓋老師定過的份）。

用法：
  # 跑一輪就結束（測試用）
  python scripts/auto_grade_watch.py --quiz "卷名｜科資班" --once --apply
  # 輪詢到 15:00 為止，每 2 分鐘一次，批完自動放行
  python scripts/auto_grade_watch.py --quiz "卷名｜科資班" --until 15:00 --apply
"""
import argparse
import datetime as dt
import json
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
from config import SUBMIT_URL as _CFG_SUBMIT_URL  # noqa: E402

DEFAULT_URL = _CFG_SUBMIT_URL()
PY = sys.executable


LOGFILE = None


def log(msg):
    line = f"[{dt.datetime.now():%H:%M:%S}] {msg}"
    print(line, flush=True)
    # 自己用 UTF-8 寫檔：交給 PowerShell 管道轉存會把中文變成亂碼
    if LOGFILE:
        try:
            with open(LOGFILE, "a", encoding="utf-8") as f:
                f.write(line + "\n")
        except Exception:
            pass


def probe(url, quiz):
    """回傳 (已交份數, 未批份數)；讀取失敗回 (-1, -1)。"""
    try:
        sep = "&" if "?" in url else "?"
        full = url + sep + "essays=1&quiz=" + urllib.parse.quote(quiz)
        with urllib.request.urlopen(full, timeout=120) as r:
            rows = json.loads(r.read().decode())
        rows = [x for x in rows if str(x.get("試卷", "")) == quiz]
        un = [x for x in rows
              if not (x.get("AI級分") == 0 or str(x.get("AI級分") or "").strip() != "")]
        return len(rows), len(un)
    except Exception as e:
        log(f"讀取後端失敗（大量交卷時常見，下一輪再試）：{e}")
        return -1, -1


def jobs_for(n):
    """依待批份數決定平行度（上限 8，避免撞 OpenAI 速率限制）。"""
    if n >= 24:
        return 8, 5
    if n >= 12:
        return 6, 4
    if n >= 5:
        return 4, 3
    return 2, 2


def run(script, *args):
    """執行子腳本，回傳輸出的最後幾行（失敗不中斷整個輪詢）。"""
    cmd = [PY, str(HERE / script), *args]
    try:
        p = subprocess.run(cmd, capture_output=True, text=True,
                           encoding="utf-8", errors="replace", timeout=3600)
        tail = [l for l in (p.stdout or "").splitlines() if l.strip()][-6:]
        if p.returncode != 0:
            log(f"  ！{script} 結束碼 {p.returncode}")
            for l in (p.stderr or "").splitlines()[-4:]:
                log(f"    {l}")
        return tail
    except subprocess.TimeoutExpired:
        log(f"  ！{script} 逾時（超過 1 小時）")
        return []


def one_round(url, quiz, apply_ai):
    total, un = probe(url, quiz)
    if total < 0:
        return False
    if un == 0:
        log(f"已交 {total} 份，全部批改完成")
        if apply_ai and total > 0:
            for l in run("apply_ai_grades.py", "--quiz", quiz, "--url", url):
                log(f"  {l}")
        return False

    jg, jr = jobs_for(un)
    log(f"偵測到 {un} 份未批（已交 {total} 份），以 {jg} 條線批改…")
    for l in run("grade_essays.py", "--quiz", quiz, "--url", url, "--jobs", str(jg)):
        log(f"  {l}")
    log(f"產紅筆圖（{jr} 條線）…")
    for l in run("make_redpen.py", "--quiz", quiz, "--url", url, "--jobs", str(jr)):
        log(f"  {l}")
    if apply_ai:
        log("套用 AI 級分（讓學生看得到分數）…")
        for l in run("apply_ai_grades.py", "--quiz", quiz, "--url", url):
            log(f"  {l}")
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quiz", required=True)
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--until", default="", help="結束時間 HH:MM（不給就只跑一輪）")
    ap.add_argument("--interval", type=int, default=120, help="沒新卷時的檢查間隔（秒）")
    ap.add_argument("--once", action="store_true", help="只跑一輪就結束")
    ap.add_argument("--apply", action="store_true",
                    help="批完自動把 AI 級分套用為老師覆核級分（學生才看得到分數）")
    ap.add_argument("--log", default="", help="同時把訊息寫進這個檔（UTF-8）")
    args = ap.parse_args()

    global LOGFILE
    LOGFILE = args.log or None

    log(f"開始：{args.quiz}")
    log(f"  結束時間 {args.until or '（只跑一輪）'}　檢查間隔 {args.interval}s　"
        f"自動放行 {'是' if args.apply else '否'}")

    if args.once or not args.until:
        one_round(args.url, args.quiz, args.apply)
        log("單輪執行結束")
        return 0

    hh, mm = (int(x) for x in args.until.split(":"))
    end = dt.datetime.now().replace(hour=hh, minute=mm, second=0, microsecond=0)
    if end <= dt.datetime.now():          # 結束時間已過就當成隔天
        end += dt.timedelta(days=1)

    while dt.datetime.now() < end:
        did = one_round(args.url, args.quiz, args.apply)
        if dt.datetime.now() >= end:
            break
        # 剛批完就立刻再查一次，接住批改期間新交的卷；沒事做才睡
        if not did:
            time.sleep(min(args.interval, max(1, (end - dt.datetime.now()).total_seconds())))

    log(f"已到 {args.until}，輪詢結束。最後再確認一次全部放行：")
    for l in run("apply_ai_grades.py", "--quiz", args.quiz, "--url", args.url):
        log(f"  {l}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
