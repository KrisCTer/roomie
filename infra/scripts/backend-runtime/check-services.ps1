# check-services.ps1 - Verify all microservices are healthy

param(
    [object]$HostName = $env:ROOMIE_HOST,
    [object]$TimeoutSec = 2
)

$resolvedTimeoutSec = 2
if ($TimeoutSec -is [int]) {
    $resolvedTimeoutSec = $TimeoutSec
}
elseif ($TimeoutSec -is [string]) {
    $parsedTimeout = 0
    if ([int]::TryParse($TimeoutSec, [ref]$parsedTimeout) -and $parsedTimeout -gt 0) {
        $resolvedTimeoutSec = $parsedTimeout
    }
}

if ($HostName -isnot [string]) {
    $HostName = [string]$HostName
}

if ([string]::IsNullOrWhiteSpace($HostName)) {
    $HostName = "localhost"
}

$services = @(
    @{ name = "api-gateway"; port = 8888; contextPath = "" },
    @{ name = "identity-service"; port = 8080; contextPath = "/identity" },
    @{ name = "admin-service"; port = 8081; contextPath = "/admin" },
    @{ name = "profile-service"; port = 8082; contextPath = "/profile" },
    @{ name = "property-service"; port = 8083; contextPath = "/property" },
    @{ name = "booking-service"; port = 8084; contextPath = "/booking" },
    @{ name = "contract-service"; port = 8085; contextPath = "/contract" },
    @{ name = "billing-service"; port = 8086; contextPath = "/billing" },
    @{ name = "payment-service"; port = 8087; contextPath = "/payment" },
    @{ name = "file-service"; port = 8088; contextPath = "/file" },
    @{ name = "chat-service"; port = 8089; contextPath = "/chat" },
    @{ name = "notification-service"; port = 8090; contextPath = "/notification" },
    @{ name = "ai-service"; port = 8091; contextPath = "/ai" }
)

function Get-HttpStatusCode {
    param(
        [Parameter(Mandatory = $true)]
        [object]$ExceptionObject
    )

    if ($null -eq $ExceptionObject) {
        return $null
    }

    if ($ExceptionObject.Response -and $ExceptionObject.Response.StatusCode) {
        return [int]$ExceptionObject.Response.StatusCode
    }

    return $null
}

function Test-HealthUrl {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url,

        [Parameter(Mandatory = $true)]
        [int]$Timeout
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $Timeout -UseBasicParsing -ErrorAction Stop
        return @{
            Reachable = $true
            StatusCode = [int]$response.StatusCode
        }
    }
    catch {
        $statusCode = Get-HttpStatusCode -ExceptionObject $_.Exception
        if ($null -ne $statusCode) {
            return @{
                Reachable = $true
                StatusCode = $statusCode
            }
        }

        return @{
            Reachable = $false
            StatusCode = $null
        }
    }
}

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Roomie Microservices Health Check" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$healthy = 0
$degraded = 0
$unhealthy = 0

foreach ($service in $services) {
    $name = $service.name
    $port = $service.port
    $contextPath = $service.contextPath
    $primaryUrl = "http://${HostName}:$port$contextPath/actuator/health"
    $fallbackUrl = "http://${HostName}:$port/actuator/health"
    
    $primaryResult = Test-HealthUrl -Url $primaryUrl -Timeout $resolvedTimeoutSec

    if ($primaryResult.Reachable) {
        if ($primaryResult.StatusCode -eq 200) {
            $status = "✅ HEALTHY"
            $healthy++
        }
        else {
            $status = "⚠️  DEGRADED (HTTP $($primaryResult.StatusCode))"
            $degraded++
        }
    }
    else {
        $fallbackResult = Test-HealthUrl -Url $fallbackUrl -Timeout $resolvedTimeoutSec
        if ($fallbackResult.Reachable) {
            if ($fallbackResult.StatusCode -eq 200) {
                $status = "✅ HEALTHY (fallback path)"
                $healthy++
            }
            else {
                $status = "⚠️  DEGRADED (HTTP $($fallbackResult.StatusCode), fallback path)"
                $degraded++
            }
        }
        else {
            $status = "❌ OFFLINE"
            $unhealthy++
        }
    }
    
    Write-Host "[$name] (port $port): $status"
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Summary: $healthy healthy, $degraded degraded, $unhealthy offline" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
