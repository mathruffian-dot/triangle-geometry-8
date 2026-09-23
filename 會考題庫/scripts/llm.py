# -*- coding: utf-8 -*-
"""共用的 LLM 呼叫層：端點、金鑰、推理參數全部走 config.py，不寫死在腳本裡。

支援兩種 API 風格（`grade_api_style`）：
  chat      —— POST {base}/chat/completions（OpenAI 相容；openai、opencode-go 的
               deepseek/glm/kimi、本地 llama.cpp 都是這一種）
  responses —— POST {base}/responses（OpenAI Responses API；opencode-go 的
               gpt-5.6-luna 走這條，chat/completions 會回 503）

用法：
    from llm import chat_json, image_messages
    msgs = image_messages(SYS, "請看圖…", img_b64, "image/jpeg")
    data = chat_json("gpt-5.6-luna", msgs, max_tokens=5000)
"""
from __future__ import annotations

import json
import os
from pathlib import Path

import requests

from config import get

# 這些家族的模型屬於「推理型」：要給大一點的 token 額度，且多數不吃 temperature。
# grade_reasoning 設 auto 時用這份清單判斷；要強制就設 true／false。
REASONING_HINTS = ("gpt-5", "o1", "o3", "o4", "deepseek", "qwen", "kimi", "glm",
                   "grok", "minimax", "mimo", "longcat", "hy3", "hy4", "muse",
                   "ring", "ling", "nemotron")


def load_api_key() -> str:
    """金鑰來源：環境變數 → 金鑰檔 → config 的 grade_api_key。"""
    env_name = str(get("grade_api_key_env", "OPENAI_API_KEY"))
    key = os.environ.get(env_name)
    if key:
        return key.strip()
    path = Path(os.path.expanduser(str(get("openai_env_file", "~/.openai.env"))))
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith(env_name):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    inline = str(get("grade_api_key", "") or "").strip()
    if inline:
        return inline
    raise SystemExit(f"找不到 API key：請設環境變數 {env_name}、"
                     f"或寫進 {path}、或填 config.json 的 grade_api_key")


def is_reasoning(model: str) -> bool:
    v = str(get("grade_reasoning", "auto")).strip().lower()
    if v in ("true", "1", "yes", "on"):
        return True
    if v in ("false", "0", "no", "off"):
        return False
    low = model.lower()
    return any(low.startswith(p) or p in low for p in REASONING_HINTS)


def _headers() -> dict:
    h = {"Authorization": "Bearer " + load_api_key(), "Content-Type": "application/json"}
    extra = get("grade_extra_headers") or {}
    if isinstance(extra, dict):
        h.update({str(k): str(v) for k, v in extra.items()})
    # 有些 gateway（如 opencode-go）會檢查 User-Agent 是否為「用戶端」而非 SDK
    h.setdefault("User-Agent", "math809-grader/1.0")
    return h


def _base() -> str:
    return str(get("grade_api_base", "https://api.openai.com/v1")).rstrip("/")


def image_messages(system: str, text: str, img_b64: str, mime: str) -> list:
    """組出「一張圖 + 一段文字」的對話（兩種風格共用同一份結構，送出時才轉換）。"""
    msgs = []
    if system:
        msgs.append({"role": "system", "content": system})
    msgs.append({"role": "user", "content": [
        {"type": "text", "text": text},
        {"type": "image", "image": img_b64, "mime": mime},
    ]})
    return msgs


# ---------------------------------------------------------------------------
# 兩種風格的實際請求
# ---------------------------------------------------------------------------

def _to_chat_messages(messages) -> list:
    """把共用結構轉成 chat/completions 的 messages（圖片走 image_url + data URL）。"""
    out = []
    for m in messages:
        content = m["content"]
        if isinstance(content, str):
            out.append({"role": m["role"], "content": content})
            continue
        parts = []
        for c in content:
            if c.get("type") == "text":
                parts.append({"type": "text", "text": c["text"]})
            elif c.get("type") == "image":
                parts.append({"type": "image_url",
                              "image_url": {"url": f"data:{c['mime']};base64,{c['image']}"}})
        out.append({"role": m["role"], "content": parts})
    return out


def _post_chat(model, messages, max_tokens, temperature, json_mode, timeout):
    reasoning = is_reasoning(model)
    body = {"model": model, "messages": _to_chat_messages(messages)}
    if json_mode:
        body["response_format"] = {"type": "json_object"}
    if reasoning:
        body["max_completion_tokens"] = max_tokens
    else:
        body["max_tokens"] = max_tokens
        if temperature is not None:
            body["temperature"] = temperature
    url = _base() + "/chat/completions"
    r = requests.post(url, headers=_headers(), json=body, timeout=timeout)
    # 有些端點只認 max_tokens（或反之），被拒時換一個參數名再試一次
    if r.status_code in (400, 422) and reasoning:
        body.pop("max_completion_tokens", None)
        body["max_tokens"] = max_tokens
        r = requests.post(url, headers=_headers(), json=body, timeout=timeout)
    r.raise_for_status()
    j = r.json()
    ch = j["choices"][0]
    usage = j.get("usage", {}) or {}
    return ch["message"].get("content") or "", ch.get("finish_reason"), usage


def _to_responses_input(messages) -> tuple:
    """把共用結構轉成 Responses API 的 input（system 走 instructions）。"""
    instructions, items = "", []
    for m in messages:
        role = m["role"]
        content = m["content"]
        if isinstance(content, str):
            content = [{"type": "text", "text": content}]
        if role == "system":
            instructions = "".join(c.get("text", "") for c in content if c.get("type") == "text")
            continue
        out = []
        for c in content:
            if c.get("type") == "text":
                out.append({"type": "input_text", "text": c["text"]})
            elif c.get("type") == "image":
                out.append({"type": "input_image",
                            "image_url": f"data:{c['mime']};base64,{c['image']}"})
        items.append({"role": role, "content": out})
    return instructions, items


def _post_responses(model, messages, max_tokens, temperature, json_mode, timeout):
    instructions, items = _to_responses_input(messages)
    body = {"model": model, "input": items, "max_output_tokens": max_tokens}
    if instructions:
        body["instructions"] = instructions
    if json_mode:
        body["text"] = {"format": {"type": "json_object"}}
    if temperature is not None and not is_reasoning(model):
        body["temperature"] = temperature
    r = requests.post(_base() + "/responses", headers=_headers(), json=body, timeout=timeout)
    r.raise_for_status()
    j = r.json()
    text = j.get("output_text")
    if not text:
        chunks = []
        for item in j.get("output", []) or []:
            if item.get("type") != "message":
                continue
            for c in item.get("content", []) or []:
                if c.get("type") in ("output_text", "text"):
                    chunks.append(c.get("text", ""))
        text = "".join(chunks)
    usage = j.get("usage", {}) or {}
    finish = "length" if (j.get("incomplete_details") or {}).get("reason") == "max_output_tokens" else "stop"
    return text or "", finish, usage


# ---------------------------------------------------------------------------
# 對外
# ---------------------------------------------------------------------------

def chat(model, messages, max_tokens=5000, temperature=0.2, json_mode=True, timeout=300):
    """回傳 (content, finish_reason, usage)。usage 一律有 prompt_tokens/completion_tokens。"""
    style = str(get("grade_api_style", "chat")).strip().lower()
    if style == "responses":
        content, finish, usage = _post_responses(model, messages, max_tokens,
                                                 temperature, json_mode, timeout)
    else:
        content, finish, usage = _post_chat(model, messages, max_tokens,
                                            temperature, json_mode, timeout)
    if "completion_tokens" not in usage and "output_tokens" in usage:
        usage = dict(usage, prompt_tokens=usage.get("input_tokens"),
                     completion_tokens=usage.get("output_tokens"))
    return content, finish, usage


def chat_json(model, messages, max_tokens=5000, temperature=0.2, timeout=300):
    """要求 JSON 並解析。失敗時把 finish_reason／長度一起報出來，方便判斷是不是被截斷。"""
    content, finish, usage = chat(model, messages, max_tokens=max_tokens,
                                  temperature=temperature, json_mode=True, timeout=timeout)
    try:
        data = json.loads(content)
    except Exception as e:
        hint = "（疑似被截斷：推理吃光 token 額度）" if finish == "length" or not content.strip() else ""
        raise ValueError(f"模型未回傳合法 JSON{hint}：{e}；"
                         f"finish_reason={finish}、長度={len(content)}") from e
    if isinstance(data, dict):
        data["_usage"] = usage
        data["_finish"] = finish
    return data
