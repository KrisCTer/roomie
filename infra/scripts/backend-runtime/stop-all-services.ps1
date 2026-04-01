# stop-all-services.ps1 - Stop all Roomie backend service JVMs

$servicePattern = 'target\\(api-gateway|identity-service|profile-service|property-service|booking-service|contract-service|billing-service|payment-service|file-service|chat-service|notification-service|admin-service|ai-service)-[^\\\s]+\.jar'

$targets = Get-CimInstance Win32_Process |
    Where-Object { $_.Name -eq 'java.exe' -and $_.CommandLine -match $servicePattern }

$logDir = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "logs"
$pidTargets = @()
if (Test-Path $logDir) {
    $pidFiles = Get-ChildItem -Path $logDir -Filter "*.pid" -File -ErrorAction SilentlyContinue
    foreach ($file in $pidFiles) {
        $pidValue = Get-Content -Path $file.FullName -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($pidValue -match '^\d+$') {
            $proc = Get-Process -Id ([int]$pidValue) -ErrorAction SilentlyContinue
            if ($proc -and $proc.ProcessName -eq 'java') {
                $pidTargets += [PSCustomObject]@{ ProcessId = [int]$pidValue }
            }
        }
    }
}

if ($pidTargets.Count -gt 0) {
    $targets = @($targets) + $pidTargets | Group-Object ProcessId | ForEach-Object { $_.Group[0] }
}

if (-not $targets) {
    Write-Host 'No Roomie service Java process found.' -ForegroundColor Yellow
    exit 0
}

Write-Host "Stopping $($targets.Count) Roomie service process(es)..." -ForegroundColor Cyan
foreach ($p in $targets) {
    try {
        Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop
        Write-Host "Stopped PID $($p.ProcessId)" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to stop PID $($p.ProcessId): $($_.Exception.Message)" -ForegroundColor Red
    }
}

if (Test-Path $logDir) {
    Get-ChildItem -Path $logDir -Filter "*.pid" -File -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
}

Write-Host 'Done.' -ForegroundColor Cyan
