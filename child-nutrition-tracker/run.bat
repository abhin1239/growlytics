@echo off
echo Starting GROWLYTICS...
echo.
cd /d "%~dp0"
python server/server.py
pause
