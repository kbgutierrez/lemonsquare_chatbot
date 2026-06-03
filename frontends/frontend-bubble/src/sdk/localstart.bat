@echo off

echo ========================================
echo LemonSquare SDK Test Environment
echo ========================================

start "Test SDK" cmd /k ^
"cd /d C:\CS-OJT\a3\lemonsquare_chatbot && python -m http.server 5500"

timeout /t 2 >nul

start http://localhost:5500/test-sdk.html

echo.
echo Test page running:
echo http://localhost:5500/test-sdk.html
echo.

pause