@echo off
title Servidor Vibra Music Backend - Maestro Mentor Guide
cd /d "%~dp0"
echo ========================================================
echo   Iniciando Servidor Local Vibra Music en Red Wi-Fi...
echo ========================================================
set PATH=C:\Users\USER\node22\node-v22.14.0-win-x64;%PATH%
call npx vite --host 0.0.0.0 --port 5173
pause
