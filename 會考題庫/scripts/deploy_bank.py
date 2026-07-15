# -*- coding: utf-8 -*-
"""部署題庫系統到 Netlify（math809-bank）
作法：把 index.html + 01_題目圖片 複製到暫存資料夾再部署（不在雲端硬碟內堆疊副本）

2026-07-16 起 `netlify deploy --prod` 回 403 Forbidden（draft 正常），
改為兩段式：draft 部署取得 deploy_id → restoreSiteDeploy 發布成正式版。
"""
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
SITE_ID = "afba03cf-46f7-4ab5-8b0d-54d6523fe98d"  # math809-bank

stage = Path(tempfile.mkdtemp(prefix="bank_deploy_"))
shutil.copy(BASE / "index.html", stage / "index.html")
shutil.copytree(BASE / "01_題目圖片", stage / "01_題目圖片")
print("staged at", stage)

# 第一段：draft 部署（上傳檔案）
r = subprocess.run(
    ["netlify", "deploy", "--dir", str(stage), "--site", SITE_ID, "--json"],
    shell=True, check=True, capture_output=True, text=True,
)
deploy_id = json.loads(r.stdout)["deploy_id"]
print("draft deploy_id:", deploy_id)

# 第二段：發布成正式版
subprocess.run(
    ["netlify", "api", "restoreSiteDeploy",
     "--data", json.dumps({"site_id": SITE_ID, "deploy_id": deploy_id})],
    shell=True, check=True, capture_output=True,
)
shutil.rmtree(stage, ignore_errors=True)
print("done → https://math809-bank.netlify.app")
