@echo off
setlocal enabledelayedexpansion

:: ==== LIST ALL MICROSERVICES ====
set services=api-gateway identity-service profile-service property-service booking-service contract-service billing-service payment-service file-service chat-service notification-service admin-service ai-service

:: ==== AUTO-DETECT ROOT FOLDER ====
set ROOT=%~dp0

echo ============================================
echo   Roomie - Starting All Microservices
echo ============================================
echo Root: %ROOT%
echo.

set /a count=0
for %%s in (%services%) do (
    if exist "%ROOT%%%s\pom.xml" (
        set /a count+=1
        echo [!count!] Starting %%s...
        start "%%s" cmd /k "cd /d %ROOT%%%s && mvn spring-boot:run"
    ) else (
        echo [SKIP] %%s - pom.xml not found
    )
)

echo.
echo ============================================
echo   %count% services starting in separate terminals
echo ============================================
pause
