@echo off
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo ==========================================
echo   Antigravity Agent - Startup Launcher
echo ==========================================

echo [1/4] Checking Server...
cd packages\server
if not exist node_modules (
    echo Installing Server Dependencies...
    call npm install
)
echo Building Server...
call npm run build
if %errorlevel% neq 0 (
    echo Server build failed!
    pause
    exit /b %errorlevel%
)
start "Antigravity Server" /min cmd /k "cd packages\server && npm start"
cd ..\..

echo [2/4] Starting Client (Vite)...
cd packages\client
if not exist node_modules (
    echo Installing Client Dependencies...
    call npm install
)
cd ..\..
start "Antigravity Client" /min cmd /k "cd packages\client && npm run dev"

echo Waiting 10 seconds for client to warm up...
timeout /t 10 /nobreak >nul

echo [3/4] Checking Electron...
cd packages\electron
if not exist node_modules (
    echo Installing Electron Dependencies...
    call npm install
)
echo Building Electron...
call npm run build

echo [4/4] Launching Desktop App...
call npm start
if %errorlevel% neq 0 (
    echo Electron failed to start!
    pause
)
