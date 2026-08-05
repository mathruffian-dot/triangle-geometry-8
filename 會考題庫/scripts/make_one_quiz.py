# -*- coding: utf-8 -*-
"""重新產生單一份線上卷（用最新 QUIZ_TEMPLATE，含手寫/拍照/掃描/查成績）。
用法：python scripts/make_one_quiz.py <out_html> <title> <submit_url> <print_pdf> <qid...>
匯入 build_html（會順帶重建題庫 index.html 等），再呼叫其 make_quiz。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_html as B  # 匯入即重建題庫（含覆核頁）

out, title, url, pdf = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
qids = sys.argv[5:]
B.make_quiz(qids, title, out, submit_url=url, print_pdf=pdf)
print("ONE-QUIZ done:", out)
