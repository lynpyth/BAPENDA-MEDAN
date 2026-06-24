@echo off
echo Stopping Node.js process on port 3000...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    echo Found PID %%a - terminating via wmic...
    wmic process where "ProcessId=%%a" call terminate >nul 2>&1
    if errorlevel 1 (
        taskkill /PID %%a /F >nul 2>&1
    )
)
ping -n 3 127.0.0.1 >nul
echo Starting Next.js dev server...
npm run dev
