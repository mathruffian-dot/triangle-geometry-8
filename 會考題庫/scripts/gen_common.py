# -*- coding: utf-8 -*-
"""
命題生成器共用核心（gen_essay.py／gen_choice.py 共用）。

負責：模板卡的參數抽樣 → 受限 eval 執行 derive／constraints → 數值格式化 → 文字模板填值。
數學一律用 sympy 精確運算（分數、根式不失真），文字再轉成給國中生看的寫法。
"""
from __future__ import annotations

import json
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

import sympy as sp


# ───────────────────────────────── 受限運算環境


def _ceil_int(x):
    return int(sp.ceiling(sp.nsimplify(x)))


def _floor_int(x):
    return int(sp.floor(sp.nsimplify(x)))


def _primes_upto(n):
    return [q for q in range(2, int(n) + 1) if sp.isprime(q)]


def eval_env():
    """derive／constraints 可用的名稱空間（不開放 builtins，避免模板卡執行到危險函式）。"""
    import math

    return {
        "__builtins__": {},
        # sympy：保持精確值
        "Rational": sp.Rational, "sqrt": sp.sqrt, "Integer": sp.Integer,
        "simplify": sp.simplify, "nsimplify": sp.nsimplify, "S": sp.S,
        "Abs": sp.Abs, "gcd": sp.gcd, "lcm": sp.lcm, "factorint": sp.factorint,
        "divisors": sp.divisors, "isprime": sp.isprime, "primes_upto": _primes_upto,
        "Pow": sp.Pow, "ceil": _ceil_int, "floor": _floor_int,
        # python
        "int": int, "float": float, "str": str, "len": len, "abs": abs, "bool": bool,
        "tuple": tuple, "zip": zip, "map": map, "filter": filter, "dict": dict,
        "min": min, "max": max, "sum": sum, "round": round, "sorted": sorted,
        "range": range, "list": list, "set": set, "any": any, "all": all,
        "math": math, "pow": pow, "divmod": divmod, "enumerate": enumerate,
    }


def run_derive(lines, env):
    """逐行執行 'name = 運算式'，結果寫回 env。"""
    for ln in lines:
        ln = ln.strip()
        if not ln or ln.startswith("#"):
            continue
        if "=" not in ln:
            raise ValueError(f"derive 需為 'name = expr'：{ln}")
        name, expr = ln.split("=", 1)
        env[name.strip()] = eval(expr.strip(), eval_env(), env)
    return env


def check_constraints(cons, env):
    for c in cons:
        try:
            ok = eval(c, eval_env(), env)
        except Exception:
            return False, c
        if not bool(ok):
            return False, c
    return True, None


# ───────────────────────────────── 數值→文字


def fmt(v):
    """轉成給國中生看的寫法：分數 3/4、根式 15√3、整數不帶 .0。"""
    if isinstance(v, bool):
        return "是" if v else "否"
    if isinstance(v, (list, tuple)):
        return [fmt(x) for x in v]
    if isinstance(v, int):
        return str(v)
    if isinstance(v, float):
        return str(int(v)) if abs(v - round(v)) < 1e-9 else f"{v:g}"
    if isinstance(v, sp.Basic):
        if isinstance(v, sp.logic.boolalg.Boolean) and v in (sp.true, sp.false):
            return "是" if bool(v) else "否"
        if v.is_Integer:
            return str(int(v))
        s = sp.sstr(sp.nsimplify(v))
        s = re.sub(r"sqrt\((\d+)\)", r"√\1", s)
        return s.replace("*", "").replace(" ", "")
    return str(v)


class _F(dict):
    def __missing__(self, k):
        return "{" + k + "}"          # 缺變數時保留原樣，方便驗證器抓出來


def render_text(tmpl, env):
    """把 {變數} 換成格式化後的值；支援 str / list / dict 巢狀。"""
    if tmpl is None:
        return None
    if isinstance(tmpl, list):
        return [render_text(t, env) for t in tmpl]
    if isinstance(tmpl, dict):
        return {k: render_text(v, env) for k, v in tmpl.items()}
    if not isinstance(tmpl, str):
        return tmpl
    vals = _F({k: fmt(v) for k, v in env.items() if not k.startswith("_")})
    try:
        return tmpl.format_map(vals)
    except Exception:
        return tmpl


# ───────────────────────────────── 參數抽樣


def pick_params(spec, rnd):
    if "choices" in spec:
        return rnd.choice(spec["choices"])
    lo, hi = spec["range"]
    step = spec.get("step", 1)
    vals = list(range(lo, hi + 1, step))
    if spec.get("odd"):
        vals = [v for v in vals if v % 2 == 1]
    if spec.get("even"):
        vals = [v for v in vals if v % 2 == 0]
    return rnd.choice(vals)


def gen_one(card, rnd, used_sigs, tries=400):
    """抽一組合法的（情境, 參數）並算出所有衍生量；回傳 (env, 簽章)。

    簽章記在 data/gen_log.json，確保之後不會生出一模一樣的題。
    """
    for _ in range(tries):
        env = {}
        ctx = rnd.choice(card.get("contexts", [{}]))
        for k, v in ctx.items():
            env["c_" + k] = v
        for k, spec in card.get("params", {}).items():
            env[k] = pick_params(spec, rnd)
        sig = card["id"] + "|" + json.dumps({k: str(v) for k, v in env.items()},
                                            ensure_ascii=False, sort_keys=True)
        if sig in used_sigs:
            continue
        try:
            run_derive(card.get("derive", []), env)
        except Exception:
            continue
        ok, _bad = check_constraints(card.get("constraints", []), env)
        if not ok:
            continue
        used_sigs.add(sig)
        return env, sig
    return None, None


# ───────────────────────────────── 圖 spec 前處理


def _num(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return v


def prep_figure(spec, env):
    """把模板卡的圖 spec 變成 figures.py 吃得下的形式。

    ・"$變數名"：直接取 env 裡的原始物件（cubes、marks、labels 這種巢狀結構，
      走 render_text 會被轉成字串而失去型別）
    ・其餘字串走 render_text 代入參數；數值欄位再轉回數字
    """
    if not spec:
        return None
    fig = {k: (env.get(v[1:]) if isinstance(v, str) and v.startswith("$") else render_text(v, env))
           for k, v in spec.items()}
    fig = {k: (_num(v) if k in ("n", "r", "count", "a1", "d", "width", "h", "size",
                                "angle_a", "angle_c", "outer_px") else v)
           for k, v in fig.items()}
    if "ratio" in fig:                      # 比例要用浮點數，不能取整
        try:
            fig["ratio"] = float(fig["ratio"])
        except (TypeError, ValueError):
            pass
    if fig.get("kind") == "chart":
        fig["data"] = [_num(x) for x in fig.get("data", [])]
    return fig
