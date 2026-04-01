# ============================================================
# build-all.ps1 — Clean compile all Roomie microservices
# Usage:
#   .\build-all.ps1           → clean compile all
#   .\build-all.ps1 -Package  → clean package all (create JARs)
#   .\build-all.ps1 -SkipTests -Package → package without tests
# ============================================================

param(
    [switch]$Package,
    [switch]$SkipTests,
    [switch]$Quiet
)

$ErrorActionPreference = "Stop"
$startTime = Get-Date

# Colors
function Write-Header($msg) { Write-Host "`n$('=' * 60)" -ForegroundColor Cyan; Write-Host "  $msg" -ForegroundColor Cyan; Write-Host "$('=' * 60)" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Fail($msg)    { Write-Host "  ❌ $msg" -ForegroundColor Red }
function Write-Info($msg)    { Write-Host "  ℹ️  $msg" -ForegroundColor Yellow }

# Resolve backend root (two levels up from infra/scripts/backend-runtime/)
$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
$backendDir = (Resolve-Path "$scriptDir\..\..\..\..\backend").Path

# Verify pom.xml exists
if (-not (Test-Path "$backendDir\pom.xml")) {
    Write-Fail "pom.xml not found in $backendDir"
    exit 1
}

# Build Maven goal
$goal = if ($Package) { "package" } else { "compile" }
$mvnArgs = @("clean", $goal)

if ($SkipTests) { $mvnArgs += "-DskipTests" }
if ($Quiet)     { $mvnArgs += "-q" }

# Add thread count for parallel build
$mvnArgs += "-T", "1C"

Write-Header "Roomie — Building ALL services"
Write-Info "Directory : $backendDir"
Write-Info "Goal      : clean $goal"
Write-Info "Skip Tests: $SkipTests"
Write-Info "Threads   : 1 per CPU core"
Write-Host ""

# Execute
try {
    Push-Location $backendDir
    & mvn @mvnArgs 2>&1
    $exitCode = $LASTEXITCODE
} finally {
    Pop-Location
}

$elapsed = (Get-Date) - $startTime
$duration = "{0:mm\:ss}" -f $elapsed

Write-Host ""
if ($exitCode -eq 0) {
    Write-Header "BUILD SUCCESS"
    Write-Success "All 13 services compiled in $duration"
} else {
    Write-Header "BUILD FAILED"
    Write-Fail "Build failed after $duration (exit code: $exitCode)"
    exit $exitCode
}
