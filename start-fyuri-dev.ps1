# FYURI Local Dev Startup Script
# Run this from the repo root in PowerShell to start backend + frontend

Write-Host "Starting FYURI development environment..." -ForegroundColor Green
Write-Host ""

# Install frontend dependencies if needed
Write-Host "Checking frontend dependencies..." -ForegroundColor Cyan
cd fyuri.client
if (-not (Test-Path "node_modules")) {
	Write-Host "Installing npm packages..." -ForegroundColor Yellow
	npm install
} else {
	Write-Host "npm packages already installed" -ForegroundColor Green
}

# Start frontend in background
Write-Host ""
Write-Host "Starting Vite dev server (port 5173)..." -ForegroundColor Cyan
$frontendProcess = Start-Process -NoNewWindow -PassThru -FilePath "npm" -ArgumentList "run", "dev"
Start-Sleep -Seconds 3

# Start backend in background
Write-Host "Starting .NET backend (port 5228)..." -ForegroundColor Cyan
cd ..\FYURI.Server
$backendProcess = Start-Process -NoNewWindow -PassThru -FilePath "dotnet" -ArgumentList "run"
Start-Sleep -Seconds 5

# Done
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Frontend running at:" -ForegroundColor Green
Write-Host "  https://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Backend API running at:" -ForegroundColor Green
Write-Host "  http://localhost:5228" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open https://localhost:5173 in your browser" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C in this window to stop all services" -ForegroundColor Yellow
Write-Host ""

# Keep script running until user interrupts
Wait-Process -Id $frontendProcess.Id
