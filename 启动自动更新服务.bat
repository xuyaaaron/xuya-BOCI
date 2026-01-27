@echo off
chcp 65001
cd /d "%~dp0backend"
title 中银策略自动更新服务 (请勿关闭)

echo ========================================================
echo   中银策略数据自动更新服务
echo ========================================================
echo.
echo   [1] 正在检查 Wind 终端状态...
echo   (请确保 Wind 金融终端已登录)
echo.
echo   [2] 正在启动服务...
echo   服务启动后，每天 18:00 将自动执行：
echo     - 获取 Wind 数据
echo     - 更新 Excel
echo     - 同步至 GitHub
echo.
echo   注意：请将此窗口最小化，但不要关闭！
echo ========================================================
echo.

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

pause
