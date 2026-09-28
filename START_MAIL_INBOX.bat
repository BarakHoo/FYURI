@echo off
REM FYURI - Local email inbox for testing (Mailpit)
REM Double-click to start. Then every email the site sends (order confirmations,
REM contact form, status updates) shows up at http://localhost:8025 - nothing
REM is delivered to real addresses.

where docker >nul 2>nul
if %errorlevel% neq 0 (
	echo ERROR: Docker Desktop not found or not running.
	pause
	exit /b 1
)

docker start fyuri_mailpit >nul 2>nul
if %errorlevel% neq 0 (
	echo Creating Mailpit container...
	docker run -d --name fyuri_mailpit --restart unless-stopped -p 8025:8025 -p 1025:1025 axllent/mailpit
)

echo.
echo ========================================
echo Mailpit is running.
echo Open the test inbox at: http://localhost:8025
echo ========================================
echo.
start http://localhost:8025
pause
