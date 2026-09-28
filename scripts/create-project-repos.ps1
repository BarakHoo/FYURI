# Creates a GitHub repo for each static project and pushes it.
# Requires: gh CLI authenticated (gh auth status).

$ErrorActionPreference = "Stop"
$base = "C:\Users\JOHNDOE\source\repos"

$repos = @(
	@{ Name = "calc3d-print-calculator"; Desc = "3D Print Cost Calculator - static web app (munkys.dev/calc3d)" },
	@{ Name = "face-detection";          Desc = "Real-time browser face detection (munkys.dev/face)" },
	@{ Name = "location-reminders";      Desc = "GPS location-based reminders (munkys.dev/gps-reminder)" },
	@{ Name = "shopping-list";           Desc = "Simple shopping list web app (munkys.dev/shopping-list)" },
	@{ Name = "face-mesh-explorer";      Desc = "Real-time face mesh visualization (munkys.dev/face-mesh)" }
)

foreach ($r in $repos) {
	$dir = Join-Path $base $r.Name
	Write-Host "`n=== $($r.Name) ===" -ForegroundColor Cyan
	Push-Location $dir
	try {
		if (-not (Test-Path ".git")) {
			git init | Out-Null
			git branch -M main
		}
		git add -A
		git commit -m "Initial commit" 2>$null | Out-Null

		# Create the remote repo (public), set as origin, and push.
		gh repo create $r.Name --public --source . --remote origin --description $r.Desc --push
		Write-Host "Pushed $($r.Name)" -ForegroundColor Green
	}
	catch {
		Write-Host "FAILED $($r.Name): $_" -ForegroundColor Red
	}
	finally {
		Pop-Location
	}
}

Write-Host "`nAll done." -ForegroundColor Green
