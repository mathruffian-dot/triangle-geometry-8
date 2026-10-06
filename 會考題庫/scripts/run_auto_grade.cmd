@echo off
rem ──────────────────────────────────────────────────────────────
rem run_auto_grade.cmd — 給 Windows 工作排程器呼叫的包裝檔
rem
rem 為什麼需要這一層：data/config.json 目前把批改供應商設成 OpenCode
rem （grade_api_base=opencode.ai、grade_api_key_env=OPENCODE_API_KEY），
rem 但這台電腦沒有 OPENCODE_API_KEY，排程跑起來會直接「找不到 API key」。
rem 這裡用 MATH809_* 環境變數覆寫回 OpenAI（~/.openai.env 裡的 OPENAI_API_KEY 可用），
rem 不去動 data/config.json，避免蓋掉其他 agent 的設定。
rem
rem 之後若 OPENCODE_API_KEY 設好了，把下面四行註解掉即可恢復用 OpenCode。
rem
rem 用法：run_auto_grade.cmd "<卷名>" <結束時間HH:MM> <log檔路徑> [--apply]
rem ──────────────────────────────────────────────────────────────
setlocal
set MATH809_GRADE_API_KEY_ENV=OPENAI_API_KEY
set MATH809_GRADE_API_BASE=https://api.openai.com/v1
set MATH809_GRADE_MODEL=gpt-6-luna
set MATH809_GRADE_EXTRA_HEADERS={}

cd /d "%~dp0.."
C:\Python314\python.exe scripts\auto_grade_watch.py --quiz %1 --until %2 --log %3 %4
endlocal
