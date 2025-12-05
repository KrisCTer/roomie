@echo off
setlocal enabledelayedexpansion

:: ==== LIST MICROSERVICES ====
set services=api-gateway identity-service property-service booking-service chat-service notification-service billing-service file-service profile-service

:: ==== ROOMIE ROOT FOLDER ====
set ROOT=C:\Users\LoiChau\Downloads\roomie\services\

echo Starting all Roomie microservices...
echo ------------------------------------

for %%s in (%services%) do (
    echo Starting %%s...
    start "%%s" cmd /k "cd /d %ROOT%\%%s && mvn spring-boot:run"
)

echo ------------------------------------
echo All services are starting in separate terminals.
pause
