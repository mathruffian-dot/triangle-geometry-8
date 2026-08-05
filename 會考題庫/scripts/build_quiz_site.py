# -*- coding: utf-8 -*-
"""
build_quiz_site.py — 建「單站 × 路徑即卷」的學生站

解決的問題：以前每派一份卷就開一個新站台 → Netlify 免費方案每次正式部署扣 15 credits
（每月僅 300，等於一個月只能部署 20 次，用完全站暫停）。改成一個站、每卷一個路徑，
所有卷一起部署 → 一次部署搞定全部，部署次數大降。

產出結構：
  quiz_site/
    index.html              學生入口（輸入卷代碼或點清單進卷）
    q/<代碼>/index.html      各份卷（自成一檔，網址永久有效）
    q/<代碼>/print.pdf       該卷紙本作答卷（若有）
    practice.html           觀念補強練習頁

卷的登錄檔：data/quizzes.json
  [{"code":"0723","title":"會考數學複習卷_非選0723","qids":["103-N1",...],
    "note":"9/1 派給 902、904","print":true, "listed":true}]
  code 建議加隨機後綴（如 0723-k7m2）讓別班猜不到。

用法：
  python scripts/build_quiz_site.py                 # 依 quizzes.json 建整站
  python scripts/build_quiz_site.py --deploy netlify
  python scripts/build_quiz_site.py --deploy cloudflare
"""
import os, sys, json, shutil, argparse, subprocess
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SITE = ROOT / "quiz_site"
REG = ROOT / "data" / "quizzes.json"

SUBMIT_URL = ("https://script.google.com/macros/s/AKfycbw-ePEfCoTB3SpwOh4g0Ic"
              "fwsQWanQm8bvXgOGDdIECkK2845qIoKhH9xtRNuxu29wN/exec?token=math809")

INDEX_TPL = """<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>會考數學 — 作答區</title>
<style>
:root{--ink:#111827;--sub:#6b7280;--line:#e2e8f0;--blue:#2563eb;
      --sh:0 1px 3px rgba(16,24,40,.07);--sh-md:0 4px 14px rgba(16,24,40,.09)}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;font-family:"Microsoft JhengHei","PingFang TC",system-ui,-apple-system,sans-serif;
     color:var(--ink);background:#f1f5f9;line-height:1.6;-webkit-font-smoothing:antialiased}
header{background:linear-gradient(135deg,#0f2942,#1e40af 55%,#2563eb);color:#fff;padding:22px 20px;box-shadow:var(--sh-md)}
header h1{margin:0;font-size:1.3rem}
header p{margin:6px 0 0;font-size:.88rem;opacity:.85}
.wrap{max-width:720px;margin:0 auto;padding:18px 14px 40px}
.panel{background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px;margin-bottom:16px;box-shadow:var(--sh)}
.code{display:flex;gap:10px;flex-wrap:wrap}
.code input{flex:1;min-width:170px;padding:14px;border:1.5px solid var(--line);border-radius:12px;font-size:1.1rem;min-height:48px;letter-spacing:.06em}
.code input:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.12)}
.btn{cursor:pointer;border:none;border-radius:14px;padding:14px 24px;font-size:1.04rem;font-weight:800;min-height:48px;
     background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;box-shadow:var(--sh-md);transition:transform .06s}
.btn:active{transform:translateY(1px)}
h2{font-size:1.02rem;margin:0 0 12px}
.qlist{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.qlist a{display:flex;justify-content:space-between;align-items:center;gap:10px;text-decoration:none;color:inherit;
         border:1px solid var(--line);border-radius:14px;padding:15px 16px;background:#fff;min-height:56px;transition:all .15s}
.qlist a:hover{border-color:var(--blue);background:#f8fbff;box-shadow:var(--sh-md);transform:translateY(-1px)}
.qname{font-weight:700}
.qnote{font-size:.82rem;color:var(--sub);margin-top:2px}
.go{color:var(--blue);font-weight:800;white-space:nowrap}
.hint{font-size:.86rem;color:var(--sub)}
</style>
</head>
<body>
<header>
  <h1>📝 會考數學 作答區</h1>
  <p>輸入老師給的卷代碼，或直接點下方清單進入</p>
</header>
<div class="wrap">
  <div class="panel">
    <h2>用卷代碼進入</h2>
    <div class="code">
      <input id="c" placeholder="例如 0723" autocapitalize="off" autocomplete="off" spellcheck="false">
      <button class="btn" onclick="go()">進入作答</button>
    </div>
    <p class="hint" style="margin:10px 0 0">代碼在老師給的網址最後面，例如 <code>/q/0723/</code> 的 <b>0723</b>。</p>
  </div>
  __LIST__
</div>
<script>
function go(){
  const v=document.getElementById('c').value.trim().replace(/^\\/+|\\/+$/g,'');
  if(!v){ alert('請輸入卷代碼'); return; }
  location.href='q/'+encodeURIComponent(v)+'/';
}
document.getElementById('c').addEventListener('keydown',e=>{ if(e.key==='Enter') go(); });
</script>
</body>
</html>"""


def build_list(quizzes):
    listed = [q for q in quizzes if q.get("listed", True)]
    if not listed:
        return ('<div class="panel"><h2>目前沒有公開列出的卷</h2>'
                '<p class="hint">請用老師給的網址或卷代碼進入。</p></div>')
    items = []
    for q in listed:
        note = q.get("note", "")
        items.append(
            f'<li><a href="q/{q["code"]}/"><span><span class="qname">{q["title"]}</span>'
            + (f'<div class="qnote">{note}</div>' if note else "")
            + f'</span><span class="go">作答 →</span></a></li>')
    return '<div class="panel"><h2>目前開放的卷</h2><ul class="qlist">' + "".join(items) + "</ul></div>"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--deploy", choices=["netlify", "cloudflare"], default="")
    ap.add_argument("--site-id", default="", help="Netlify site id")
    ap.add_argument("--project", default="math809-quiz", help="Cloudflare Pages 專案名")
    ap.add_argument("--site-url", default="https://math809-quiz.pages.dev",
                    help="站台網址（用來產生紙本封面的 QR code）")
    args = ap.parse_args()

    if not REG.exists():
        sys.exit(f"找不到卷登錄檔 {REG}\n請先建立（格式見本檔說明）")
    quizzes = json.load(open(REG, encoding="utf-8"))

    if SITE.exists():
        shutil.rmtree(SITE)
    (SITE / "q").mkdir(parents=True)

    import build_html as B   # 匯入即重建題庫；提供 make_quiz
    made = 0
    for q in quizzes:
        d = SITE / "q" / q["code"]
        d.mkdir(parents=True, exist_ok=True)
        pdf_name = "print.pdf" if q.get("print", True) else ""
        B.make_quiz(q["qids"], q["title"], d / "index.html",
                    submit_url=SUBMIT_URL, print_pdf=pdf_name)
        if pdf_name:
            # 紙本含全部題目（選擇題流排＋非選題附作答框），封面帶該卷網址的 QR code
            quiz_url = f"{args.site_url.rstrip('/')}/q/{q['code']}/" if args.site_url else ""
            subprocess.run([sys.executable, str(HERE / "make_essay_print.py"),
                            "--ids", *q["qids"],
                            "--title", q["title"], "--url", quiz_url,
                            "--out", str(d / pdf_name)], check=False,
                           capture_output=True)
        made += 1
        print(f"  ✓ /q/{q['code']}/  {q['title']}")

    (SITE / "index.html").write_text(INDEX_TPL.replace("__LIST__", build_list(quizzes)), encoding="utf-8")
    pr = ROOT / "netlify_deploy" / "practice.html"
    if pr.exists():
        shutil.copy(pr, SITE / "practice.html")

    total = sum(f.stat().st_size for f in SITE.rglob("*") if f.is_file())
    print(f"\n建置完成：{made} 份卷　總大小 {total/1024/1024:.1f} MB　→ {SITE}")
    print("學生網址： <站台網址>/q/<代碼>/")

    if args.deploy == "netlify":
        if not args.site_id:
            sys.exit("Netlify 部署需要 --site-id")
        r = subprocess.run(["netlify", "deploy", "--dir", str(SITE), "--site", args.site_id,
                            "--no-build", "--json"], capture_output=True, text=True, shell=True)
        did = json.loads(r.stdout)["deploy_id"]
        subprocess.run(["netlify", "api", "restoreSiteDeploy", "--data",
                        json.dumps({"site_id": args.site_id, "deploy_id": did})], shell=True)
        print("已發布（Netlify）")
    elif args.deploy == "cloudflare":
        subprocess.run(["npx", "wrangler", "pages", "deploy", str(SITE),
                        "--project-name", args.project], shell=True)
        print("已發布（Cloudflare Pages）")


if __name__ == "__main__":
    sys.path.insert(0, str(HERE))
    main()
