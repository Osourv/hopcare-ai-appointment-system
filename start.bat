@echo off
echo ========================================
echo    HopCare Full-Stack Application
echo    Starting Backend and Frontend...
echo ========================================
echo.

echo [1/2] Starting Backend Server (Port 5000)...
start "HopCare Backend" cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server (Port 3000)...
start "HopCare Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo.
echo ✅ Backend: http://localhost:5000
echo ✅ Frontend: http://localhost:3000
echo.
echo Both servers are starting in separate windows.
echo Close those windows to stop the servers.
echo ========================================
echo.
pause
