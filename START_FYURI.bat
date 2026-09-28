@echo off
REM FYURI Quick Start - Double-click this file to run everything
REM This batch file starts backend and frontend, then opens your browser

setlocal enabledelayedexpansion

REM Check if npm and dotnet are installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
	echo ERROR: npm not found. Please install Node.js from https://nodejs.org/
	pause
	exit /b 1
)

where dotnet >nul 2>nul
if %errorlevel% neq 0 (
	echo ERROR: dotnet not found. Please install .NET 10 SDK
	pause
	exit /b 1
)

REM Get the repo directory
cd /d "%~dp0"

REM Start frontend in new window
echo Starting frontend...
start "FYURI Frontend" cmd /k "cd fyuri.client && npm install 2>nul & npm run dev"

REM Wait for frontend to start
timeout /t 3 /nobreak

REM Start backend in new window
echo Starting backend...
start "FYURI Backend" cmd /k "cd FYURI.Server && dotnet run"

REM Wait for backend to start
timeout /t 5 /nobreak

REM Open browser
echo Opening browser...
start https://localhost:5173

echo.
echo ========================================
echo FYURI is starting up in two new windows
echo Open https://localhost:5173 in your browser
echo ========================================
echo.
pause
