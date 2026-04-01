param(
    [string]$HostIp = "100.96.78.62",
    [int[]]$Ports = @(3306, 27017, 6379, 7687, 9092, 9200)
)

$ErrorActionPreference = "Stop"

Write-Host "Roomie partner connectivity check" -ForegroundColor Cyan
Write-Host "Target host: $HostIp"
Write-Host ""

$results = @()
foreach ($port in $Ports) {
    $ok = Test-NetConnection -ComputerName $HostIp -Port $port -InformationLevel Quiet
    $status = if ($ok) { "PASS" } else { "FAIL" }

    $results += [PSCustomObject]@{
        Port = $port
        Status = $status
    }
}

$results | Format-Table -AutoSize

$failed = $results | Where-Object { $_.Status -eq "FAIL" }
if ($failed.Count -gt 0) {
    Write-Host ""
    Write-Host "Some ports are not reachable. Check host firewall/portproxy and container status." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "All required ports are reachable." -ForegroundColor Green
exit 0
