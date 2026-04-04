@echo off
setlocal
:: Change code page to UTF-8
chcp 65001 > nul

echo ==========================================
echo   CareGrow AI (Lumitas) Startup
echo ==========================================
echo.
echo [1/3] Starting development server...
start /b npm run dev

echo [2/3] Waiting for server stability (10s)...
timeout /t 10 > nul

echo [3/3] Opening browser at http://localhost:3000
start http://localhost:3000

echo.
echo ==========================================
echo   Server is running. 
echo   Close this window to stop the server.
echo ==========================================
pause
