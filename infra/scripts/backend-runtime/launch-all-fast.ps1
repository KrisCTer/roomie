# launch-all-fast.ps1 - Stable 13-service launcher

param(
    [object]$Headless = $true,
    [switch]$SkipCompile
)

$HeadlessMode = $true
if ($Headless -is [System.Management.Automation.SwitchParameter]) {
    $HeadlessMode = $Headless.IsPresent
}
elseif ($Headless -is [bool]) {
    $HeadlessMode = $Headless
}
elseif ($Headless -is [string]) {
    if ([string]::IsNullOrWhiteSpace($Headless)) {
        $HeadlessMode = $true
    }
    else {
        $parsedBool = $true
        if ([bool]::TryParse($Headless, [ref]$parsedBool)) {
            $HeadlessMode = $parsedBool
        }
        else {
            $HeadlessMode = $true
        }
    }
}

$SCRIPT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$REPO_ROOT = (Resolve-Path (Join-Path $SCRIPT_ROOT "..\..\..")).Path
$BACKEND_ROOT = Join-Path $REPO_ROOT "backend"
$ENV_FILE = Join-Path $REPO_ROOT "infra\.env"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Roomie - Fast 13 Service Launch" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (Test-Path $ENV_FILE) {
    Get-Content $ENV_FILE | Where-Object { $_ -and $_ -notmatch '^\s*#' } | ForEach-Object {
        $var = $_ -split '=', 2
        if ($var.Count -eq 2) {
            Set-Item -Path "env:$($var[0].Trim())" -Value $var[1]
        }
    }
}

$logDir = Join-Path $SCRIPT_ROOT "logs"
if ($HeadlessMode) {
    if (-not (Test-Path $logDir)) {
        New-Item -Path $logDir -ItemType Directory | Out-Null
    }
    Get-ChildItem -Path $logDir -Filter "*.log" -File -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    Get-ChildItem -Path $logDir -Filter "*.pid" -File -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
}

$SERVICES = @(
    @{ name = "api-gateway"; port = 8888; phase = 1 },
    @{ name = "identity-service"; port = 8080; phase = 1 },
    @{ name = "profile-service"; port = 8082; phase = 1 },
    @{ name = "property-service"; port = 8083; phase = 2 },
    @{ name = "booking-service"; port = 8084; phase = 2 },
    @{ name = "contract-service"; port = 8085; phase = 2 },
    @{ name = "billing-service"; port = 8086; phase = 2 },
    @{ name = "payment-service"; port = 8087; phase = 2 },
    @{ name = "file-service"; port = 8088; phase = 3 },
    @{ name = "chat-service"; port = 8089; phase = 3 },
    @{ name = "notification-service"; port = 8090; phase = 3 },
    @{ name = "admin-service"; port = 8081; phase = 3 },
    @{ name = "ai-service"; port = 8091; phase = 3 }
)

function Invoke-ServiceCompile([string]$serviceName) {
    $serviceDir = Join-Path $BACKEND_ROOT $serviceName
    $mvnw = Join-Path $serviceDir "mvnw.cmd"

    if (-not (Test-Path $mvnw)) {
        Write-Host "  [ERROR] ${serviceName}: mvnw.cmd not found" -ForegroundColor Red
        return $false
    }

    Push-Location $serviceDir
    & $mvnw -q clean compile -DskipTests
    $compileExit = $LASTEXITCODE
    Pop-Location

    if ($compileExit -ne 0) {
        Write-Host "  [ERROR] ${serviceName}: compile failed" -ForegroundColor Red
        return $false
    }

    Write-Host "  [OK] ${serviceName}: compile success" -ForegroundColor Green
    return $true
}

function Get-ServiceJar([string]$serviceName) {
    $targetDir = Join-Path $BACKEND_ROOT "$serviceName\target"
    if (-not (Test-Path $targetDir)) {
        return $null
    }

    Get-ChildItem -Path $targetDir -Filter "*-SNAPSHOT.jar" -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -notlike "*.original" } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
}

function Test-ExecutableJar([string]$jarPath) {
    try {
        $jarFile = New-Object System.IO.Compression.ZipArchive([System.IO.File]::OpenRead($jarPath), [System.IO.Compression.ZipArchiveMode]::Read)
        $manifestEntry = $jarFile.Entries | Where-Object { $_.FullName -ieq 'META-INF/MANIFEST.MF' } | Select-Object -First 1
        if (-not $manifestEntry) {
            $jarFile.Dispose()
            return $false
        }

        $reader = New-Object System.IO.StreamReader($manifestEntry.Open())
        $manifest = $reader.ReadToEnd()
        $reader.Dispose()
        $jarFile.Dispose()

        return ($manifest -match '(?m)^Main-Class:\s*.+$' -or $manifest -match '(?m)^Start-Class:\s*.+$')
    }
    catch {
        return $false
    }
}

function Ensure-ExecutableJar([string]$serviceName) {
    $jar = Get-ServiceJar $serviceName
    if (-not $jar) {
        return $null
    }

    $originalJarPath = "$($jar.FullName).original"
    if (Test-Path $originalJarPath) {
        return $jar
    }

    Write-Host "    executable jar not found, running repackage..." -ForegroundColor DarkYellow
    $serviceDir = Join-Path $BACKEND_ROOT $serviceName
    Push-Location $serviceDir
    $null = & mvn -DskipTests package spring-boot:repackage
    $repackageExit = $LASTEXITCODE
    Pop-Location

    if ($repackageExit -ne 0) {
        return $null
    }

    return (Get-ServiceJar $serviceName)
}

$missing = @($SERVICES | Where-Object { -not (Get-ServiceJar $_.name) })
if ($missing.Count -gt 0) {
    Write-Host "`n[BUILD] Missing JARs for $($missing.Count) services. Building missing services..." -ForegroundColor Yellow
    foreach ($svc in $missing) {
        if (-not (Invoke-ServiceCompile $svc.name)) {
            Write-Host "[ERROR] Build failed. Please fix compile errors then retry." -ForegroundColor Red
            exit 1
        }
    }
}

if (-not $SkipCompile.IsPresent) {
    Write-Host "`n[PRECHECK] Compiling all services to generate MapStruct mappers..." -ForegroundColor Cyan
    foreach ($svc in $SERVICES) {
        if (-not (Invoke-ServiceCompile $svc.name)) {
            Write-Host "[ERROR] Precheck compile failed. Please fix errors then retry." -ForegroundColor Red
            exit 1
        }
    }
}

function Launch-Service([hashtable]$service, [int]$delayMs) {
    $jar = Ensure-ExecutableJar $service.name
    if (-not ($jar -is [System.IO.FileInfo])) {
        Write-Host "  [SKIP] $($service.name): executable JAR not available" -ForegroundColor Red
        return
    }

    Write-Host "  [$($service.name)] launching on :$($service.port)..." -ForegroundColor Green
    $workDir = Join-Path $BACKEND_ROOT $service.name
    Write-Host "    mode: java -jar" -ForegroundColor DarkGray

    if ($HeadlessMode) {
        $outLog = Join-Path $logDir "$($service.name).out.log"
        $errLog = Join-Path $logDir "$($service.name).err.log"
        $proc = Start-Process -FilePath "java" -ArgumentList @("-jar", $jar.FullName) -WorkingDirectory $workDir -WindowStyle Hidden -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru

        $pidFile = Join-Path $logDir "$($service.name).pid"
        Set-Content -Path $pidFile -Value $proc.Id
    }
    else {
        Start-Process -FilePath "java" -ArgumentList @("-jar", $jar.FullName) -WorkingDirectory $workDir | Out-Null
    }

    Start-Sleep -Milliseconds $delayMs
}

Write-Host "`n[PHASE 1] Launching CRITICAL services..." -ForegroundColor Cyan
$SERVICES | Where-Object { $_.phase -eq 1 } | ForEach-Object { Launch-Service $_ 1500 }
Write-Host "  Waiting 8 seconds for stability..." -ForegroundColor Gray
Start-Sleep -Seconds 8

Write-Host "`n[PHASE 2] Launching DOMAIN services..." -ForegroundColor Cyan
$SERVICES | Where-Object { $_.phase -eq 2 } | ForEach-Object { Launch-Service $_ 1000 }
Write-Host "  Waiting 5 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host "`n[PHASE 3] Launching AUXILIARY services..." -ForegroundColor Cyan
$SERVICES | Where-Object { $_.phase -eq 3 } | ForEach-Object { Launch-Service $_ 800 }

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Launch command completed for 13 services" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Monitor: http://localhost:8888/actuator/health" -ForegroundColor Yellow
if ($HeadlessMode) {
    Write-Host "   Log folder: infra/scripts/backend-runtime/logs" -ForegroundColor Yellow
    Write-Host "   Example log: infra/scripts/backend-runtime/logs/api-gateway.out.log" -ForegroundColor Yellow
}
