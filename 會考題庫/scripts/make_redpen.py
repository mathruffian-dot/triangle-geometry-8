# -*- coding: utf-8 -*-
"""
make_redpen.py — 產生「老師紅筆批改版」作答圖

流程：
  後端 ?essays=1 取學生作答（含 AI 批改結果）
    → 視覺模型依批改結果產出「標註 JSON」（好的地方＋待改進，含相對座標）
    → annotate_redpen.py 把紅筆畫在原圖上層（**原圖像素逐位元不動**）
    → 存成 PNG

⚠ 為何不用生圖模型：實測 gpt-image-2 改圖會「重畫」整張圖，4 份樣本中 2 份
   竄改了學生內容（等號被改成≠、手寫字被抹除），故一律採程式化疊加。

用法：
  python scripts/make_redpen.py --quiz "會考數學複習卷_非選0723"
  python scripts/make_redpen.py --quiz "卷名" --cls 902 --outdir redpen_out
  python scripts/make_redpen.py --one <檔案ID>          # 只做一份（除錯用）
"""
import os, sys, json, argparse, base64, subprocess, tempfile, time
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
import requests

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from config import SUBMIT_URL as _CFG_SUBMIT_URL, get as _cfg  # noqa: E402  集中設定
ROOT = HERE.parent
RUBRICS = ROOT / "data" / "essay_rubrics.json"
ANNOTATOR = HERE / "annotate_redpen.py"

DEFAULT_URL = os.environ.get("KAOKAO_SUBMIT_URL", _CFG_SUBMIT_URL())
MODEL = os.environ.get("KAOKAO_GRADE_MODEL", "gpt-5.6-luna")
API = "https://api.openai.com/v1/chat/completions"


def load_key():
    p = Path.home() / ".openai.env"
    if p.exists():
        for line in p.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith("OPENAI_API_KEY"):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    k = os.environ.get("OPENAI_API_KEY")
    if k:
        return k
    sys.exit("找不到 OPENAI_API_KEY（請確認 ~/.openai.env）")


SYS = ("你是資深國中數學老師，正在用紅筆批改學生手寫作答。"
       "你要輸出「標註指令 JSON」，讓程式把紅筆畫在照片上。"
       "原則：①寫得好的地方一定要給肯定回饋（不是只挑錯）②批註寫在空白處、絕不遮住學生字跡"
       "③座標要準確對應你在圖上看到的位置 ④只輸出 JSON。")

ANNOT_SPEC = """
可用的標註類型（座標一律用相對值 0~1，左上角 0,0）：
  {"type":"score","at":[x,y],"text":"2/3","size":0.038,"angle":-9}   右上角分數印章（每份都要有一個）
  {"type":"check","at":[x,y],"size":0.030}                            紅勾（畫在做對的地方旁邊空白處）
  {"type":"note","at":[x,y],"text":"文字","size":0.023,"anchor":"lt"} 中文批註（可用 \\n 換行）
  {"type":"circle","bbox":[x1,y1,x2,y2],"shape":"rect"}               圈選（shape 可 rect 或 ellipse）
  {"type":"underline","from":[x1,y],"to":[x2,y],"style":"wave"}       底線（wave/line/double）
  {"type":"arrow","from":[x1,y1],"to":[x2,y2],"bow":0.30}             引線箭頭（把批註連到問題處）
  {"type":"solution","title":"標題","text":"續寫解答全文"}             **續寫解答**：畫在原圖下方自動延伸的白區
        （不必給座標，程式會排版；text 可用 \\n 換行，長度不限，會自動斷行）
"""


def solution_rule(lv):
    """依級分決定「續寫解答」要寫到什麼程度（0 分直接給完整解答，其餘接著學生的思路補完）。"""
    s = str(lv).strip()
    if s == "0":
        return ("   本份是 0 級分——學生沒有可用的解題方向，**直接給完整解答**：從讀題、設未知數開始，\n"
                "   一步一步寫到答案，讓他可以照著看懂並訂正。title 用「完整解答（請照著訂正一遍）」。")
    if s == "3":
        return ("   本份是滿分——**不必重寫解答**。solution 改寫「延伸提醒」：把這題的關鍵想法用兩三句總結，\n"
                "   或提醒一個常見的變化題型。title 用「做得很好！延伸提醒」。")
    if s == "1":
        return ("   本份是 1 級分——學生只做對開頭一小段。**從他做對的最後一步接下去**，把剩下的完整寫完，\n"
                "   中間他想錯的地方要用一句話點出來為什麼不行。title 用「訂正參考：接著你寫對的地方往下」。")
    return ("   本份是 2 級分——學生大方向對、卡在後半段或算錯。**從他卡住／算錯的那一步接下去**寫完，\n"
            "   並指出那一步該怎麼修正。title 用「訂正參考：接著你的算式往下寫」。")


def build_prompt(r, lv, reason, transcript):
    guide = ""
    g = (r or {}).get("guide") or {}
    if g:
        guide = f"\n【官方評分指引】\n3級：{g.get('l3','')}\n2級：{g.get('l2','')}\n1級：{g.get('l1','')}\n0級：{g.get('l0','')}"
    sol_rule = solution_rule(lv)
    return f"""這是學生手寫的數學作答照片，已批改完成。

【題目主題】{(r or {}).get('title','')}
【官方參考答案要點】{(r or {}).get('answer_points','')[:600]}{guide}

【本份批改結果】級分：{lv} / 3　（0=完全不會　3=滿分）
【評分理由】{reason}
{('【AI 先前讀到的內容】' + transcript) if transcript else ''}

請仔細看圖，判斷各個內容在圖上的位置，輸出老師紅筆批改的標註指令。
{ANNOT_SPEC}

要求：
1. **必須包含一個 score 印章**，text 為 "{lv}/3"，通常放右上角空白處（約 at:[0.87,0.08]）。
2. **寫得好的地方要給肯定**：至少 1 個 check ＋ 一句鼓勵性的 note（例如「等差和公式運用正確」「列舉完整」「答案正確」）。即使分數低，也要找出他做對的部分給肯定。
3. **失分的地方**：用 circle 圈住問題區域，配一個 note 說明「缺什麼、該怎麼補」，可用 arrow 把 note 連到問題處。note 要寫得像老師對學生講話，具體可行動，不要抄評分規準術語。
4. **座標務必準確**：note 一定要放在「完全空白、沒有手寫字」的區域（通常是紙張下半部或右側留白）；circle 的 bbox 要剛好框住目標那一行/那一區。
5. 圖上的標註（score/check/note/circle/underline/arrow）總數控制在 4~7 個，不要太雜亂。

6. **一定要有一個 solution 續寫解答**（本份級分 {lv}，規則如下）：
{sol_rule}
   寫法要求：
   - **接著學生自己的思路與符號往下寫**，不要另起一套標準解法。若他設的未知數是 x，你就繼續用 x；
     若他用列舉法而題目也能列舉解出來，就順著列舉補完，不要硬改成公式解。
   - 開頭先用一句話承接他寫到哪（例如「你已經正確算出…，方向沒錯，接著：」），讓他知道自己哪裡對。
   - 過程要**完整可抄寫**：每一步都要看得懂怎麼來的，最後一定要有「答：…」。
   - 結尾補一句「提醒：…」，講這類題目下次該注意什麼（一句話就好）。
   - 用學生看得懂的白話，不要用評分規準的術語。

7. **數學式一律用錢字號包起來寫 LaTeX**，例如：$\\frac{{3}}{{4}}$、$2^{{10}}$、$\\sqrt{{16}}$、$x\\ge 5$、$\\frac{{60a+50b}}{{a+b}}=55$。
   程式會把它排成真正的分數線與上標。**分數不要寫成 3/4、次方不要寫成 2^10 或 2**10**，那樣學生很難讀。
   純文字的部分正常寫中文即可，不要整段包在錢字號裡（中文放進去會變成亂碼）。

只輸出 JSON：{{"annotations":[ ... ]}}"""


def ask_annotations(key, img_b64, mime, r, lv, reason, transcript, model):
    reasoning = any(model.startswith(p) for p in ("gpt-5", "o1", "o3", "o4"))
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYS},
            {"role": "user", "content": [
                {"type": "text", "text": build_prompt(r, lv, reason, transcript)},
                {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{img_b64}"}},
            ]},
        ],
        "response_format": {"type": "json_object"},
    }
    if reasoning:
        body["max_completion_tokens"] = 9000      # 續寫解答是整段文字，比純標註耗 token
    else:
        body["max_tokens"] = 3500
        body["temperature"] = 0.3
    resp = requests.post(API, headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                         json=body, timeout=240)
    resp.raise_for_status()
    data = json.loads(resp.json()["choices"][0]["message"]["content"])
    return data.get("annotations", [])


def sanitize(anns, lv):
    """基本防呆：座標夾在 0~1、確保有 score、限制數量。

    solution（續寫解答）不吃座標、也不列入數量上限——它畫在原圖下方延伸的白區。
    """
    out, sols = [], []
    for a in anns or []:
        t = a.get("type")
        if t == "solution":
            if str(a.get("text", "")).strip():
                sols.append({"type": "solution",
                             "title": str(a.get("title", "訂正參考"))[:40],
                             "text": str(a["text"]),
                             "size": float(a.get("size", 0.026))})
            continue
        if t not in ("score", "check", "note", "circle", "underline", "arrow"):
            continue
        for k in ("at", "from", "to"):
            if k in a and isinstance(a[k], list) and len(a[k]) == 2:
                a[k] = [min(0.99, max(0.01, float(a[k][0]))), min(0.99, max(0.01, float(a[k][1])))]
        if "bbox" in a and isinstance(a["bbox"], list) and len(a["bbox"]) == 4:
            b = [min(0.995, max(0.005, float(v))) for v in a["bbox"]]
            if b[2] <= b[0] or b[3] <= b[1]:
                continue
            a["bbox"] = b
        out.append(a)
    if not any(a.get("type") == "score" for a in out):
        out.insert(0, {"type": "score", "at": [0.88, 0.08], "text": f"{lv}/3", "size": 0.038, "angle": -9})
    out = out[:9]
    if not sols and str(lv).strip() != "3":
        # 非滿分卻沒產出續寫解答 → 出聲，不要靜默生出一張沒有訂正內容的圖
        print("  [警告] 本份未產出續寫解答（solution），學生會少了訂正參考", file=sys.stderr)
    return out + sols[:1]


def download_img(fid, link):
    urls = ([f"https://drive.google.com/uc?export=download&id={fid}"] if fid else []) + ([link] if link else [])
    for u in urls:
        try:
            r = requests.get(u, timeout=60)
            if r.status_code == 200 and r.content[:3] in (b"\xff\xd8\xff", b"\x89PN"):
                return r.content, ("image/png" if r.content[:1] == b"\x89" else "image/jpeg")
        except Exception:
            continue
    return None, None


def fetch_essays(url, quiz, cls):
    p = {"essays": 1}
    if quiz: p["quiz"] = quiz
    if cls: p["cls"] = cls
    sep = "&" if "?" in url else "?"
    full = url + sep + "&".join(f"{k}={requests.utils.quote(str(v))}" for k, v in p.items())
    return requests.get(full, timeout=60).json()


def render(img_bytes, anns, out_path):
    """呼叫 annotate_redpen.py 畫紅筆（原圖像素不動）。"""
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    tmp.write(img_bytes); tmp.close()
    try:
        cmd = [sys.executable, str(ANNOTATOR), "--image", tmp.name,
               "--json-str", json.dumps(anns, ensure_ascii=False),
               "--out", str(out_path), "--verify"]
        r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
        ok = Path(out_path).exists()
        verified = "逐位元相同" in (r.stdout or "")
        return ok, verified, (r.stderr or "")[:200]
    finally:
        try: os.unlink(tmp.name)
        except Exception: pass


def upload_redpen(url, items):
    """把紅筆圖上傳後端（存 Drive、回寫『紅筆圖ID』），供覆核頁與學生端顯示。"""
    if not items:
        return {"ok": True, "updated": 0}
    r = requests.post(url, headers={"Content-Type": "text/plain;charset=utf-8"},
                      data=json.dumps({"kind": "essay_redpen", "items": items}), timeout=300)
    return r.json()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--quiz", default="")
    ap.add_argument("--cls", default="")
    ap.add_argument("--one", default="", help="只處理這個檔案ID")
    ap.add_argument("--model", default=MODEL)
    ap.add_argument("--outdir", default=str(ROOT / "redpen_out"))
    ap.add_argument("--jobs", type=int, default=1, help="同時處理幾份（平行只在 OpenAI 呼叫；繪圖會排隊）")
    ap.add_argument("--force", action="store_true", help="已存在也重做")
    ap.add_argument("--no-upload", action="store_true", help="只存本機，不上傳到 Drive")
    args = ap.parse_args()

    key = load_key()
    rubrics = json.load(open(RUBRICS, encoding="utf-8"))["questions"]
    outdir = Path(args.outdir); outdir.mkdir(parents=True, exist_ok=True)

    recs = fetch_essays(args.url, args.quiz, args.cls)
    if args.one:
        recs = [x for x in recs if str(x.get("檔案ID")) == args.one]
    # 只做已批改的（要有級分才知道怎麼標）
    recs = [x for x in recs if str(x.get("老師覆核級分", "")).strip() != "" or str(x.get("AI級分", "")).strip() != ""]
    print(f"取得 {len(recs)} 份已批改作答　模型={args.model}")

    done, failed, pending = 0, [], []
    import threading
    _render_lock = threading.Lock()   # matplotlib mathtext 不保證執行緒安全 → 只讓繪圖排隊
    _out_lock = threading.Lock()      # 保護 done/failed/pending 三個共用清單

    def one(i, x):
        nonlocal done
        who = f'{x.get("班級","")}-{x.get("座號","")}'
        qid = x.get("題目ID", "")
        out = outdir / f"{who}_{qid}.png"
        # 學生重新上傳會產生新的檔案ID：本機同名舊圖必須重畫，否則會把「舊圖畫的紅筆版」掛到新紀錄上。
        # 舊資料沒有 .fid 佐證檔，維持原本的補上傳行為（只提醒），避免整批無謂重畫。
        fid_now = str(x.get("檔案ID", ""))
        fid_file = outdir / f"{who}_{qid}.fid"
        fid_prev = fid_file.read_text(encoding="utf-8").strip() if fid_file.exists() else ""
        stale = bool(fid_prev) and fid_prev != fid_now
        if stale:
            print(f"[{i}/{len(recs)}] {who} {qid} 來源已更換（學生重新上傳）→ 重畫")
        if out.exists() and not args.force and not stale:
            with _out_lock:
                print(f"[{i}/{len(recs)}] {who} {qid} 已存在，略過（仍會補上傳）"); done += 1
                # 兩欄任一為空就補傳：早期版本只寫「紅筆圖ID」，「紅筆圖連結」欄是後來才加的，
                # 只看 ID 會讓那批舊資料永遠補不到連結（老師在試算表就點不開圖）
                if (not str(x.get("紅筆圖ID", "")).strip()
                        or not str(x.get("紅筆圖連結", "")).strip()):
                    pending.append({"fileId": str(x.get("檔案ID", "")),
                                    "img": "data:image/png;base64," + base64.b64encode(out.read_bytes()).decode()})
            return
        # 注意：0 級分是合法值，不可用 `or` 串接（0 在 Python 為 falsy 會被跳過）
        _t, _a = x.get("老師覆核級分"), x.get("AI級分")
        lv = str(_t) if str(_t or "").strip() != "" or _t == 0 else (str(_a) if str(_a or "").strip() != "" or _a == 0 else "")
        reason = str(x.get("AI理由", ""))
        reason = reason.split("]", 1)[-1].strip() if reason.startswith("[") else reason
        img, mime = download_img(str(x.get("檔案ID", "")), x.get("圖片連結", ""))
        if not img:
            with _out_lock:
                print(f"[{i}/{len(recs)}] {who} {qid} 取圖失敗"); failed.append(f"{who} {qid} 取圖失敗")
            return
        try:
            anns = ask_annotations(key, base64.b64encode(img).decode(), mime,
                                   rubrics.get(qid), lv, reason, str(x.get("AI辨識內容", "")), args.model)
            anns = sanitize(anns, lv)
            with _render_lock:
                ok, verified, err = render(img, anns, out)
            if ok:
                with _out_lock:
                    print(f"[{i}/{len(recs)}] {who} {qid} ✓ {lv}級　標註{len(anns)}個　原圖{'未被更動✓' if verified else '⚠未驗證'}")
                    done += 1
                    pending.append({"fileId": str(x.get("檔案ID", "")),
                                    "img": "data:image/png;base64," + base64.b64encode(out.read_bytes()).decode()})
                (outdir / f"{who}_{qid}.json").write_text(json.dumps(anns, ensure_ascii=False, indent=1), encoding="utf-8")
                fid_file.write_text(fid_now, encoding="utf-8")   # 記下這張圖是用哪個來源畫的
            else:
                with _out_lock:
                    print(f"[{i}/{len(recs)}] {who} {qid} 繪製失敗 {err}"); failed.append(f"{who} {qid} 繪製失敗")
        except Exception as e:
            with _out_lock:
                print(f"[{i}/{len(recs)}] {who} {qid} 失敗：{e}"); failed.append(f"{who} {qid} {e}")

    if args.jobs > 1 and len(recs) > 1:
        print(f"平行產圖：{args.jobs} 條線（繪圖排隊、上傳仍是最後分批一次）")
        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=args.jobs) as ex:
            list(ex.map(lambda t: one(*t), list(enumerate(recs, 1))))
    else:
        for i, x in enumerate(recs, 1):
            one(i, x)
            time.sleep(0.3)

    if pending and not args.no_upload:
        print(f"上傳紅筆圖到 Drive（{len(pending)} 份，分批）…")
        okn = 0
        for k in range(0, len(pending), 6):          # 分批避免 request 過大
            res = upload_redpen(args.url, pending[k:k + 6])
            okn += res.get("updated", 0)
            print(f"  批次 {k//6+1}: {res}")
        print(f"已上傳 {okn} 份（覆核頁與學生端即可看到紅筆版）")

    print("-" * 60)
    print(f"完成 {done} 份 → {outdir}")
    if failed:
        print(f"失敗 {len(failed)}："); [print("  ", f) for f in failed]


if __name__ == "__main__":
    main()
