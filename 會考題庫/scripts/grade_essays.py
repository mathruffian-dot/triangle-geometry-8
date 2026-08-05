# -*- coding: utf-8 -*-
"""
會考數學非選題 — 手寫作答 AI 初評腳本（老師本機執行）

流程：
  1. 從 GAS 後端 ?essays=1 取回學生手寫作答（圖片連結／檔案ID／題目ID／最後答案）
  2. 依 data/essay_rubrics.json 的官方評分指引＋二元判準，餵 OpenAI 視覺模型
  3. 逐條二元判準判定 → 綜合級分（0-3）＋理由＋信心；多次投票取共識、低信心標記轉老師覆核
  4. 回寫試算表「非選作答」表的 AI級分／AI理由／AI信心 欄

⚠ 定位：AI「初評」，最終級分需老師覆核（會考官方為人工雙評）。影像品質是最大誤差源。

用法：
  # 批改某卷（先確定 GAS 已重新部署、學生已交卷）
  python scripts/grade_essays.py --quiz "會考數學非選題練習卷（104-115）"
  python scripts/grade_essays.py --quiz "卷名" --cls 809 --votes 3
  python scripts/grade_essays.py --regrade           # 連已評過的也重評
  # 離線試批一張本機圖（驗證管線，不連後端、不回寫）
  python scripts/grade_essays.py --demo --qid 111-N1 --img some.jpg

需求：~/.openai.env 內含 OPENAI_API_KEY=sk-...
"""
import os, sys, json, argparse, base64, time, statistics
from collections import Counter
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
import requests

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
RUBRICS = ROOT / "data" / "essay_rubrics.json"

# 收卷／回寫後端（GAS 網頁應用程式 URL，含 ?token=）。可用 --url 或環境變數覆蓋。
DEFAULT_URL = os.environ.get(
    "KAOKAO_SUBMIT_URL",
    "https://script.google.com/macros/s/AKfycbw-ePEfCoTB3SpwOh4g0IcfwsQWanQm8bvXgOGDdIECkK2845qIoKhH9xtRNuxu29wN/exec?token=math809",
)
MODEL = os.environ.get("KAOKAO_GRADE_MODEL", "gpt-5.6-luna")   # 預設用最新推理型；可換 gpt-4o(便宜) / gpt-5.6-sol / gpt-5.6-terra / gpt-5.5 等
API = "https://api.openai.com/v1/chat/completions"
REVIEW_CONF = 0.60   # 低於此信心 → 標記需老師覆核


def load_key():
    envp = Path.home() / ".openai.env"
    if envp.exists():
        for line in envp.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith("OPENAI_API_KEY"):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    k = os.environ.get("OPENAI_API_KEY")
    if k:
        return k
    sys.exit("找不到 OPENAI_API_KEY（請確認 ~/.openai.env）")


def load_rubrics():
    return json.load(open(RUBRICS, encoding="utf-8"))["questions"]


SYS = ("你是國中教育會考數學科非選擇題的閱卷助理。依官方評分規準與評分指引評閱學生手寫作答。"
       "原則：忠實依規準；看不清或無法判定就把該判準標 uncertain，不要臆測給分或過度寬鬆；"
       "只輸出 JSON，不要多餘文字。")


def build_user_text(r, student_ans):
    L = [f"【題目主題】{r.get('title','')}",
         f"【官方參考答案要點】\n{r.get('answer_points','')}"]
    g = r.get("guide")
    if g:
        L += ["【評分規準（每題滿分3級分）】",
              f"3級分：{g['l3']}", f"2級分：{g['l2']}", f"1級分：{g['l1']}", f"0級分：{g['l0']}"]
    cps = r.get("checkpoints") or []
    if cps:
        L.append("【逐條判準（判定學生是否達成）】")
        for c in cps:
            L.append(f"- {c['id']}（對應{c['primary_level']}級）：{c['text']}")
    else:
        L.append("【注意】本題官方逐級分評分指引尚未公布，請依參考答案要點與通用規準"
                 "（3=策略適切且完整；2=策略對但有計算錯誤或缺步驟合理性；1=方向對但不足；0=只有答案或無關）評閱，並降低信心。")
    L.append(f"【學生自填最後答案】{student_ans or '（未填）'}")
    L.append("""
請依附圖的手寫作答，輸出 JSON（不要多餘文字）：
{
 "transcript": "你讀到的學生解題內容（簡述）",
 "checkpoints": [{"id":"c1","met":"yes|no|uncertain","evidence":"引用學生作答中的關鍵一行或式子","note":"簡短理由"}],
 "level": 0到3的整數,
 "reason": "綜合判定理由，引用規準與學生作答；影像看不清請明說",
 "confidence": 0到1的小數（影像模糊或難判時調低）
}""")
    return "\n".join(L)


def grade_once(key, r, img_b64, mime, student_ans, model, temperature=0.2):
    # 推理型/新世代模型（gpt-5.x、o系列）：用 max_completion_tokens、不吃 temperature、需較大 token 額度（含內部推理）
    reasoning = any(model.startswith(p) for p in ("gpt-5", "o1", "o3", "o4"))
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYS},
            {"role": "user", "content": [
                {"type": "text", "text": build_user_text(r, student_ans)},
                {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{img_b64}"}},
            ]},
        ],
        "response_format": {"type": "json_object"},
    }
    if reasoning:
        body["max_completion_tokens"] = 5000
    else:
        body["max_tokens"] = 1200
        body["temperature"] = temperature
    resp = requests.post(API, headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                         json=body, timeout=180)
    resp.raise_for_status()
    j = resp.json()
    content = j["choices"][0]["message"]["content"]
    usage = j.get("usage", {})
    data = json.loads(content)
    data["_usage"] = usage
    return data


def transcribe_once(key, img_b64, mime, model):
    """只把手寫作答忠實轉成文字（不評分），供對照 AI 是否讀錯（OCR 檢核）。"""
    reasoning = any(model.startswith(p) for p in ("gpt-5", "o1", "o3", "o4"))
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": "你是手寫數學辨識助理。把圖中手寫作答忠實逐字轉成文字，只輸出你讀到的內容，不評分、不補充。"},
            {"role": "user", "content": [
                {"type": "text", "text": "請把這張手寫數學作答忠實轉成文字（含算式；分數寫 a/b、根號寫 √、次方寫 ^、角度寫 °）。看不清的字用 ? 標記。只輸出 JSON：{\"transcript\":\"...\"}"},
                {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{img_b64}"}},
            ]},
        ],
        "response_format": {"type": "json_object"},
    }
    if reasoning:
        body["max_completion_tokens"] = 3000
    else:
        body["max_tokens"] = 1000
    resp = requests.post(API, headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                         json=body, timeout=180)
    resp.raise_for_status()
    return json.loads(resp.json()["choices"][0]["message"]["content"]).get("transcript", "")


def aggregate(runs, is_pending):
    levels = [int(x["level"]) for x in runs if isinstance(x.get("level"), (int, float))]
    if not levels:
        return {"level": "", "confidence": 0.0, "need_review": True, "reason": "AI 無法判定（未取得有效級分）"}
    cnt = Counter(levels)
    maxc = max(cnt.values())
    final = min(lv for lv, c in cnt.items() if c == maxc)   # 平手取較低（保守）
    agreement = maxc / len(levels)
    avg_conf = statistics.mean([float(x.get("confidence", 0.5)) for x in runs])
    ai_conf = round(agreement * avg_conf, 2)
    need_review = is_pending or agreement < 1.0 or avg_conf < REVIEW_CONF
    # 取一個 level==final 的 run 當代表理由
    rep = max([x for x in runs if int(x.get("level", -1)) == final],
              key=lambda x: len(x.get("reason", "")), default=runs[0])
    met = Counter(c.get("met") for c in rep.get("checkpoints", []))
    summary = f"[AI初評 {final}級｜票 {','.join(map(str,levels))}｜信心 {ai_conf}" \
              f"｜判準 達成{met.get('yes',0)}/存疑{met.get('uncertain',0)}/未達{met.get('no',0)}]"
    reason = summary + ("　⚠需覆核" if need_review else "") + "\n" + rep.get("reason", "")
    return {"level": final, "confidence": ai_conf, "need_review": need_review,
            "reason": reason, "transcript": rep.get("transcript", ""), "votes": levels}


def download_img(file_id, link):
    """從 Drive 直接下載圖片位元組，回傳 (bytes, mime)。"""
    urls = []
    if file_id:
        urls.append(f"https://drive.google.com/uc?export=download&id={file_id}")
    if link:
        urls.append(link)
    for u in urls:
        try:
            r = requests.get(u, timeout=60)
            if r.status_code == 200 and r.content[:3] in (b"\xff\xd8\xff", b"\x89PN"):
                mime = "image/png" if r.content[:1] == b"\x89" else "image/jpeg"
                return r.content, mime
        except Exception:
            continue
    return None, None


def fetch_essays(url, quiz, cls):
    p = {"essays": 1}
    if quiz: p["quiz"] = quiz
    if cls: p["cls"] = cls
    sep = "&" if "?" in url else "?"
    full = url + sep + "&".join(f"{k}={requests.utils.quote(str(v))}" for k, v in p.items())
    r = requests.get(full, timeout=60)
    r.raise_for_status()
    return r.json()


def post_grades(url, updates):
    body = {"kind": "essay_grade", "updates": updates}
    r = requests.post(url, headers={"Content-Type": "text/plain;charset=utf-8"},
                      data=json.dumps(body), timeout=120)
    return r.json()


def grade_record(key, rubrics, qid, img_bytes, mime, student_ans, votes, model):
    r = rubrics.get(qid)
    if not r:
        return {"level": "", "confidence": 0.0, "need_review": True,
                "reason": f"查無題目 {qid} 的評分規準", "votes": []}
    is_pending = not r.get("official_guide_available", False)
    img_b64 = base64.b64encode(img_bytes).decode()
    runs = []
    for i in range(votes):
        try:
            runs.append(grade_once(key, r, img_b64, mime, student_ans, model,
                                   temperature=0.2 if i == 0 else 0.4))
        except Exception as e:
            print(f"    ! 第{i+1}次批改失敗：{e}")
    agg = aggregate(runs, is_pending)
    agg["_usage"] = [x.get("_usage", {}) for x in runs]
    return agg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--quiz", default="")
    ap.add_argument("--cls", default="")
    ap.add_argument("--votes", type=int, default=3)
    ap.add_argument("--model", default=MODEL)
    ap.add_argument("--regrade", action="store_true", help="連已評過的也重評")
    ap.add_argument("--dry", action="store_true", help="只批改不回寫試算表")
    ap.add_argument("--transcribe", action="store_true", help="只補『AI辨識內容』（供對照OCR，不評分、不動級分）")
    ap.add_argument("--demo", action="store_true", help="離線試批一張本機圖")
    ap.add_argument("--qid", default="")
    ap.add_argument("--img", default="")
    args = ap.parse_args()

    key = load_key()
    rubrics = load_rubrics()

    if args.demo:
        if not (args.qid and args.img):
            sys.exit("--demo 需要 --qid 與 --img")
        data = Path(args.img).read_bytes()
        mime = "image/png" if data[:1] == b"\x89" else "image/jpeg"
        print(f"離線試批：{args.qid}　模型={args.model}　票數={args.votes}")
        agg = grade_record(key, rubrics, args.qid, data, mime, "", args.votes, args.model)
        print(json.dumps({k: v for k, v in agg.items() if k != "_usage"}, ensure_ascii=False, indent=2))
        u = agg.get("_usage", [])
        tin = sum(x.get("prompt_tokens", 0) for x in u); tout = sum(x.get("completion_tokens", 0) for x in u)
        print(f"用量：input {tin}、output {tout} tokens（{args.votes} 次）")
        return

    if args.transcribe:
        print(f"辨識模式（只補 AI辨識內容）：quiz={args.quiz or '(全部)'} cls={args.cls or '(全部)'}")
        recs = fetch_essays(args.url, args.quiz, args.cls)
        todo = [x for x in recs if args.regrade or str(x.get("AI辨識內容", "")).strip() == ""]
        print(f"取得 {len(recs)} 筆；待辨識 {len(todo)} 筆")
        updates = []
        for i, x in enumerate(todo, 1):
            fid = str(x.get("檔案ID", "")); who = f'{x.get("班級","")}-{x.get("座號","")} {x.get("題目ID","")}'
            img, mime = download_img(fid, x.get("圖片連結", ""))
            if not img:
                print(f"[{i}/{len(todo)}] {who} 取圖失敗"); continue
            try:
                t = transcribe_once(key, base64.b64encode(img).decode(), mime, args.model)
                updates.append({"fileId": fid, "transcript": t})
                print(f"[{i}/{len(todo)}] {who} ✓ {t[:36].replace(chr(10),' ')}")
            except Exception as e:
                print(f"[{i}/{len(todo)}] {who} 辨識失敗：{e}")
            time.sleep(0.3)
        if updates and not args.dry:
            print("回寫辨識內容：", post_grades(args.url, updates))
        print(f"完成 {len(updates)} 筆辨識")
        return

    print(f"抓取非選作答：{args.url}  quiz={args.quiz or '(全部)'} cls={args.cls or '(全部)'}")
    recs = fetch_essays(args.url, args.quiz, args.cls)
    print(f"取得 {len(recs)} 筆手寫作答")
    todo = [x for x in recs if args.regrade or str(x.get("AI級分", "")).strip() == ""]
    print(f"待批改 {len(todo)} 筆（--regrade 可重評已評過的）")

    updates, review = [], []
    for i, x in enumerate(todo, 1):
        qid, fid, link = x.get("題目ID", ""), str(x.get("檔案ID", "")), x.get("圖片連結", "")
        who = f'{x.get("班級","")}-{x.get("座號","")}'
        print(f"[{i}/{len(todo)}] {who} {qid} …", end=" ")
        img, mime = download_img(fid, link)
        if not img:
            print("取圖失敗，跳過"); continue
        agg = grade_record(key, rubrics, qid, img, mime, x.get("最後答案", ""), args.votes, args.model)
        flag = "⚠需覆核" if agg["need_review"] else "✓"
        print(f"{agg['level']}級 信心{agg['confidence']} {flag}")
        updates.append({"fileId": fid, "level": agg["level"], "reason": agg["reason"],
                        "confidence": agg["confidence"], "transcript": agg.get("transcript", "")})
        if agg["need_review"]:
            review.append(f"{who} {qid} → {agg['level']}級（信心{agg['confidence']}）")
        time.sleep(0.3)

    if updates and not args.dry:
        res = post_grades(args.url, updates)
        print(f"回寫試算表：{res}")
    elif args.dry:
        print("（--dry：未回寫）")

    print("-" * 60)
    print(f"完成 {len(updates)} 筆；其中需老師覆核 {len(review)} 筆：")
    for r in review:
        print("  ⚠", r)


if __name__ == "__main__":
    main()
