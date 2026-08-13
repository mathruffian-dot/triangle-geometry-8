# -*- coding: utf-8 -*-
"""
watch_grade.py — 交卷期間定時輪詢並增量批改（考試現場用）。

設計重點（都是為了不要卡到 Google）：
  · 每輪只打後端 **1 次 GET**（抓作答清單）＋ **最多 1 次 POST**（整批回寫級分）
    → 不管平行幾條線批改，對試算表的寫入永遠是一輪一次。
  · 平行只發生在 OpenAI 呼叫（grade_essays.py --jobs），那不碰 Google。
  · 學生交卷是 appendRow、我們回寫是 setValue 既有列，兩者不衝突（Code.gs 沒有 LockService）。
  · 沒有新卷時 grade_essays 會自己判斷「待批改 0 筆」直接結束，不會空打 OpenAI。

用法：
  python scripts/watch_grade.py --quiz "數學非選練習卷 第1~2冊（0813）｜909班" \
      --start 10:45 --end 11:05 --interval 240 --jobs 5 --votes 3

  --start 省略＝立刻開始；結束後會再補跑 --tail-passes 輪（預設 2），
  間隔 --tail-interval 秒（預設 120），用來收尾「最後一秒交卷」的人。
"""
import argparse
import subprocess
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = Path(__file__).resolve().parent
GRADER = HERE / "grade_essays.py"


def log(msg):
    print(f"[{datetime.now():%H:%M:%S}] {msg}", flush=True)


def at(hhmm):
    """把 HH:MM 解析成今天的時刻；若已過就當作明天（避免跨夜誤判）。"""
    h, m = (int(x) for x in hhmm.split(":"))
    now = datetime.now()
    t = now.replace(hour=h, minute=m, second=0, microsecond=0)
    return t + timedelta(days=1) if t < now - timedelta(hours=6) else t


def run_pass(args, n):
    """跑一輪 grade_essays（增量：只批 AI級分 還空著的）。回傳 (完成筆數, 需覆核筆數)。"""
    cmd = [sys.executable, str(GRADER), "--quiz", args.quiz,
           "--jobs", str(args.jobs), "--votes", str(args.votes)]
    if args.model:
        cmd += ["--model", args.model]
    log(f"─── 第 {n} 輪開始 ───")
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8",
                           errors="replace", timeout=args.pass_timeout)
    except subprocess.TimeoutExpired:
        log(f"！第 {n} 輪超過 {args.pass_timeout}s 未結束，本輪放棄（下一輪會重批）")
        return 0, 0
    out = (p.stdout or "") + (p.stderr or "")
    done = need = 0
    for line in out.splitlines():
        s = line.rstrip()
        if not s:
            continue
        if s.startswith("完成 "):
            try:
                done = int(s.split("完成 ")[1].split(" 筆")[0])
                need = int(s.split("需老師覆核 ")[1].split(" 筆")[0])
            except Exception:
                pass
        # 逐筆結果、回寫結果、錯誤都照原樣留在 log 裡，事後好追
        if s.startswith(("[", "取得 ", "待批改 ", "回寫試算表", "  ⚠", "  ✗", "未完成 ",
                         "完成 ", "平行批改", "！", "Traceback", "  File ")) or "Error" in s:
            print("    " + s, flush=True)
    if p.returncode != 0:
        log(f"！第 {n} 輪 grade_essays 退出碼 {p.returncode}")
    log(f"─── 第 {n} 輪結束：本輪批 {done} 筆（需覆核 {need}）───")
    return done, need


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quiz", required=True, help="卷名，一班一網址時要含「｜909班」後綴")
    ap.add_argument("--start", default="", help="開始輪詢時刻 HH:MM（省略＝立刻）")
    ap.add_argument("--end", required=True, help="停止輪詢時刻 HH:MM")
    ap.add_argument("--interval", type=int, default=240, help="輪詢間隔秒數（預設 240＝4 分鐘）")
    ap.add_argument("--jobs", type=int, default=5, help="同時批改幾筆")
    ap.add_argument("--votes", type=int, default=3, help="每筆投票次數")
    ap.add_argument("--model", default="", help="覆寫批改模型")
    ap.add_argument("--tail-passes", type=int, default=2, help="結束後再補跑幾輪")
    ap.add_argument("--tail-interval", type=int, default=120, help="補跑間隔秒數")
    ap.add_argument("--pass-timeout", type=int, default=900, help="單輪最長秒數")
    args = ap.parse_args()

    end = at(args.end)
    log(f"卷名：{args.quiz}")
    log(f"視窗：{args.start or '現在'} ~ {args.end}　輪詢每 {args.interval}s　"
        f"平行 {args.jobs}　投票 {args.votes}")

    if args.start:
        start = at(args.start)
        wait = (start - datetime.now()).total_seconds()
        if wait > 0:
            log(f"等待開始，還有 {wait/60:.1f} 分鐘（{start:%H:%M}）")
            time.sleep(wait)

    n = total = 0
    while datetime.now() < end:
        n += 1
        done, _ = run_pass(args, n)
        total += done
        left = (end - datetime.now()).total_seconds()
        if left <= 0:
            break
        nap = min(args.interval, left)
        log(f"休息 {nap/60:.1f} 分鐘（視窗剩 {left/60:.1f} 分鐘）")
        time.sleep(nap)

    for k in range(args.tail_passes):
        log(f"收尾等待 {args.tail_interval}s（第 {k+1}/{args.tail_passes} 輪補跑）")
        time.sleep(args.tail_interval)
        n += 1
        done, _ = run_pass(args, n)
        total += done

    log(f"═══ 全部結束：共 {n} 輪、批改 {total} 筆 ═══")
    log("下一步：make_redpen.py 產紅筆圖 → make_feedback_pdf.py 產回饋單 → math809-bank 覆核頁定分")


if __name__ == "__main__":
    main()
