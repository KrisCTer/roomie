@echo off
setlocal enabledelayedexpansion

:: ==== STABLE: Run from Pre-Built JARs ====
:: Auto-builds if you forgot install

set SCRIPT_ROOT=%~dp0
for %%I in ("%SCRIPT_ROOT%..\..\..") do set REPO_ROOT=%%~fI
set BACKEND_ROOT=%REPO_ROOT%\backend\
set ENV_FILE=%REPO_ROOT%\infra\.env

if not exist "%ENV_FILE%" (
    echo [ERROR] "%ENV_FILE%" not found!
    pause
    exit /b 1
)

:: Load env vars (skip comments/empty lines)
for /f "usebackq tokens=* delims=" %%A in ("%ENV_FILE%") do (
    set "line=%%A"
    if not "!line!"=="" (
        if not "!line:~0,1!"=="#" set "%%A"
    )
)

echo ============================================
echo   Roomie - JAR-Based Ultra-Fast Startup
echo ============================================
echo.
echo [PHASE 0] Checking if JAR files exist...

:: Define services with their ports
set services_critical=api-gateway:8888 identity-service:8080 profile-service:8082
set services_domain=property-service:8083 booking-service:8084 contract-service:8085 billing-service:8086 payment-service:8087
set services_aux=file-service:8088 chat-service:8089 notification-service:8090 admin-service:8081 ai-service:8091

set /a jar_missing=0

for %%s in (%services_critical% %services_domain% %services_aux%) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%s") do (
        dir /b "%BACKEND_ROOT%%%a\target\*-SNAPSHOT.jar" 2>nul | findstr /v /i "\.original$" >nul
        if errorlevel 1 (
            set /a jar_missing+=1
        )
    )
)

if %jar_missing% GTR 0 (
    echo [BUILD] %jar_missing% services are missing JARs. Building all once...
    cd /d "%BACKEND_ROOT%"
    call mvn clean install -DskipTests
    if errorlevel 1 (
        echo [ERROR] Build failed!
        pause
        exit /b 1
    )
)

echo [OK] All JARs ready. Starting services from cache...
echo.

set /a count=0

:: Launch critical services
echo [PHASE 1] Starting CRITICAL services (JAR mode)...
for %%s in (%services_critical%) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%s") do (
        set service_name=%%a
        set service_port=%%b

        for /f "delims=" %%j in ('dir /b "%BACKEND_ROOT%%%a\target\*-SNAPSHOT.jar" 2^>nul ^| findstr /v ".original"') do (
            set /a count+=1
            echo [!count!] Launching !service_name! on port !service_port!...
            start "roomie-!service_name!" cmd /k "cd /d %BACKEND_ROOT%%%a && java -jar target\%%j && pause"
        )
    )
)

ping 127.0.0.1 -n 9 >nul

:: Launch domain services
echo.
echo [PHASE 2] Starting DOMAIN services (JAR mode)...
for %%s in (%services_domain%) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%s") do (
        set service_name=%%a
        set service_port=%%b

        for /f "delims=" %%j in ('dir /b "%BACKEND_ROOT%%%a\target\*-SNAPSHOT.jar" 2^>nul ^| findstr /v ".original"') do (
            set /a count+=1
            echo [!count!] Launching !service_name! on port !service_port!...
            start "roomie-!service_name!" cmd /k "cd /d %BACKEND_ROOT%%%a && java -jar target\%%j && pause"
        )
    )
)

ping 127.0.0.1 -n 6 >nul

:: Launch auxiliary services
echo.
echo [PHASE 3] Starting AUXILIARY services (JAR mode)...
for %%s in (%services_aux%) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%s") do (
        set service_name=%%a
        set service_port=%%b

        for /f "delims=" %%j in ('dir /b "%BACKEND_ROOT%%%a\target\*-SNAPSHOT.jar" 2^>nul ^| findstr /v ".original"') do (
            set /a count+=1
            echo [!count!] Launching !service_name! on port !service_port!...
            start "roomie-!service_name!" cmd /k "cd /d %BACKEND_ROOT%%%a && java -jar target\%%j && pause"
        )
    )
)

echo.
echo ============================================
echo   [SUCCESS] %count% services launched from JAR files
echo ============================================
echo   If count is less than 13, check build logs above
echo.
echo   Check: http://localhost:8888/actuator/health
echo ============================================
pause
