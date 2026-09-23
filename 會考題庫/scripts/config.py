# -*- coding: utf-8 -*-
"""
集中設定：把「換人就要改」的東西收在一處。

原本 Google Apps Script 的收卷網址寫死在 8 支腳本裡，別人要重建這套系統得逐支改，
這支模組讓它只要改一個地方（或設環境變數）就好。

讀取順序（前面找到就用前面的）：
  1. 環境變數    MATH809_SUBMIT_URL / MATH809_QUIZ_PROJECT / …
  2. data/config.json（自己的設定，已 gitignore）
  3. 程式內建預設值（＝本班目前在用的值，所以現有流程行為完全不變）

要建立自己的系統：複製 data/config.example.json 成 data/config.json，填自己的值即可。

用法：
    from config import SUBMIT_URL, get
    url = SUBMIT_URL()                      # 收卷網址
    proj = get("quiz_project", "math809-quiz")
"""
from __future__ import annotations

import json
import os
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
CONFIG_FILE = BASE / "data" / "config.json"

# 內建預設值＝本班目前在用的設定。別人重建時請改 data/config.json，不要改這裡。
DEFAULTS = {
    "submit_url": ("https://script.google.com/macros/s/AKfycbw-ePEfCoTB3SpwOh4g0Ic"
                   "fwsQWanQm8bvXgOGDdIECkK2845qIoKhH9xtRNuxu29wN/exec?token=math809"),
    "quiz_project": "math809-quiz",
    "bank_project": "math809-bank",
    "quiz_site_url": "https://math809-quiz.pages.dev",
    "bank_site_url": "https://math809-bank.pages.dev",
    "openai_env_file": "~/.openai.env",
    "grade_model": "gpt-5.6-luna",
    # ── 非選 AI 批改的連線設定（同一支腳本可切 OpenAI／opencode-go／本地 llama.cpp）──
    "grade_api_base": "https://api.openai.com/v1",
    "grade_api_style": "chat",          # chat＝chat/completions；responses＝Responses API
    "grade_api_key_env": "OPENAI_API_KEY",
    "grade_api_key": "",                # 不想用金鑰檔時可直接寫這裡（config.json 已 gitignore）
    "grade_reasoning": "auto",          # auto｜true｜false：決定用 max_completion_tokens 或 max_tokens
    "grade_extra_headers": {},          # 例：opencode-go 需要 x-opencode-session
    "font_files": ["C:/Windows/Fonts/msjh.ttc", "C:/Windows/Fonts/msjhbd.ttc",
                   "C:/Windows/Fonts/msjhl.ttc", "C:/Windows/Fonts/mingliu.ttc",
                   "C:/Windows/Fonts/simsun.ttc"],
}

# 常見供應商的現成組合；用 `python scripts/config.py --preset <名稱>` 印出可直接貼進
# data/config.json 的片段（環境變數同樣可用，例如 MATH809_GRADE_API_BASE）。
LLM_PRESETS = {
    "openai": {
        "grade_api_base": "https://api.openai.com/v1",
        "grade_api_style": "chat",
        "grade_api_key_env": "OPENAI_API_KEY",
        "grade_model": "gpt-5.6-luna",
    },
    "opencode-go": {
        "grade_api_base": "https://opencode.ai/zen/go/v1",
        "grade_api_style": "chat",      # gpt-5.6-luna 要改 "responses"（見說明）
        "grade_api_key_env": "OPENCODE_API_KEY",
        "grade_model": "deepseek-v4.1-flash",
        "grade_extra_headers": {"x-opencode-session": "math809-grade"},
    },
    "local-llamacpp": {
        "grade_api_base": "http://127.0.0.1:8080/v1",
        "grade_api_style": "chat",
        "grade_api_key_env": "MATH809_LOCAL_KEY",
        "grade_api_key": "none",
        "grade_model": "qwen3.8-27b",
        "grade_reasoning": "true",
    },
}

# 這幾個值換人一定要改，還停在內建預設就代表「資料會進到原作者的試算表／站台」
MUST_CHANGE = ["submit_url", "quiz_project", "bank_project", "quiz_site_url", "bank_site_url"]

_cache: dict | None = None


def _load() -> dict:
    global _cache
    if _cache is None:
        _cache = {}
        if CONFIG_FILE.exists():
            try:
                _cache = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
            except Exception as e:
                print(f"⚠ data/config.json 讀取失敗（{e}），改用內建預設值")
    return _cache


def get(key: str, default=None):
    """環境變數 > data/config.json > DEFAULTS > 呼叫端給的 default。"""
    env = os.environ.get("MATH809_" + key.upper())
    if env:
        return env
    v = _load().get(key)
    if v not in (None, ""):
        return v
    return DEFAULTS.get(key, default)


def SUBMIT_URL() -> str:
    """Google Apps Script 的收卷網址（必須含 ?token=…，且不可用短網址）。"""
    return get("submit_url")


def unchanged_keys() -> list:
    """回傳「還停在內建預設值」的必改項目。空清單代表都設好了。"""
    out = []
    for k in MUST_CHANGE:
        if os.environ.get("MATH809_" + k.upper()):
            continue
        if _load().get(k) in (None, ""):
            out.append(k)
    return out


def warn_if_default(quiet: bool = False) -> bool:
    """沒建 config.json 就會靜默沿用原作者的設定——這是最容易踩的坑，主動提醒。"""
    miss = unchanged_keys()
    if miss and not quiet:
        print("⚠ 下列設定還停在內建預設值（＝原作者的），資料會送到別人的試算表／站台：")
        print("   " + "、".join(miss))
        print("   請複製 data/config.example.json 成 data/config.json 並填自己的值，"
              "再用 python scripts/config.py 確認。")
    return not miss


def describe() -> str:
    """印出目前生效的設定與來源，供 debug。"""
    lines = []
    for k in DEFAULTS:
        env = os.environ.get("MATH809_" + k.upper())
        src = "環境變數" if env else ("config.json" if _load().get(k) else "內建預設")
        val = get(k)
        if k == "submit_url" and val:
            val = val[:52] + "…" + val[-18:]
        if k == "grade_api_key" and val:
            val = str(val)[:6] + "…（已設定）"
        lines.append(f"  {k:<20} {val}   ← {src}")
    return "\n".join(lines)


if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    if len(sys.argv) >= 3 and sys.argv[1] == "--preset":
        name = sys.argv[2]
        if name not in LLM_PRESETS:
            print(f"沒有這個預設組合：{name}；可用：{'、'.join(LLM_PRESETS)}")
            raise SystemExit(1)
        print(f"# 把下列片段併進 data/config.json（{name}）")
        print(json.dumps(LLM_PRESETS[name], ensure_ascii=False, indent=2))
        if name == "opencode-go":
            print("# 註：opencode-go 上的 gpt-5.6-luna 走 Responses API，"
                  'grade_api_style 要改成 "responses"；\n'
                  "#     deepseek-v4.1-flash 走 chat/completions，維持 \"chat\" 即可。\n"
                  "# 註：opencode-go 的金鑰在 opencode 的 auth.json，"
                  '可設 OPENCODE_API_KEY 或把值填進 grade_api_key。')
        raise SystemExit(0)
    print(f"設定檔：{CONFIG_FILE}（{'存在' if CONFIG_FILE.exists() else '不存在，使用內建預設值'}）")
    print(describe())
    print()
    if warn_if_default():
        print("✓ 必改項目都已設定為自己的值")
