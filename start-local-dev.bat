@echo off
setlocal

set "ROOT=%~dp0"
set "FRONTEND=%ROOT%greymatter-frontend"
set "BACKEND=%ROOT%grey-matter-backend"

echo.
echo ============================================================
echo  GREY MATTER - Local Dev
echo ============================================================
echo.

REM Check for Windows Terminal directly by path
set "WT=%LOCALAPPDATA%\Microsoft\WindowsApps\wt.exe"

if exist "%WT%" (
    echo Launching in Windows Terminal...
    "%WT%" new-tab --title "GM Backend" --startingDirectory "%BACKEND%" cmd /k python App.py ; new-tab --title "GM Frontend" --startingDirectory "%FRONTEND%" cmd /k npm run dev
) else (
    echo Windows Terminal not found. Opening separate windows...
    start "GM Backend" cmd /k "cd /d "%BACKEND%" && python App.py"
    timeout /t 2 /nobreak >nul
    start "GM Frontend" cmd /k "cd /d "%FRONTEND%" && npm run dev"
)

echo.
echo ============================================================
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:5173
echo ============================================================
echo.
pause

endlocal
