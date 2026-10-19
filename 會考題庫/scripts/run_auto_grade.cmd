@echo off
rem run_auto_grade.cmd - wrapper for Windows Task Scheduler (auto grading during an exam)
rem Usage: run_auto_grade.cmd "<quiz title>" <end HH:MM> <log path> [--apply]
rem Keep this file ASCII-only: cmd.exe parses .cmd in the ANSI codepage (cp950),
rem and UTF-8 Chinese comments break into bogus commands (hit on 2026-10-19).
rem Grading provider/model/key all come from data/config.json (see handoff.md).
setlocal
cd /d "%~dp0.."
set "PY=C:\Python314\python.exe"
if not exist "%PY%" set "PY=%LOCALAPPDATA%\Programs\Python\Python314\python.exe"
if not exist "%PY%" set "PY=python"
"%PY%" scripts\auto_grade_watch.py --quiz %1 --until %2 --log %3 %4
endlocal
