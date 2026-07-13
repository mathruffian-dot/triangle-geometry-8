# -*- coding: utf-8 -*-
"""部署題庫系統到 Netlify（math809-bank）
作法：把 index.html + 01_題目圖片 複製到暫存資料夾再部署（不在雲端硬碟內堆疊副本）
"""
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

subprocess.run(
    ["netlify", "deploy", "--dir", str(stage), "--prod", "--site", SITE_ID],
    shell=True, check=True,
)
shutil.rmtree(stage, ignore_errors=True)
print("done → https://math809-bank.netlify.app")
