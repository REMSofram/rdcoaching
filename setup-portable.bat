@echo off
REM === Configuration Node.js portable pour PC bureau ===

REM Chemin vers Node portable (dans le même dossier)
set "PORTABLE_NODE=%~dp0node-v18.18.2-win-x64"

REM Configuration PATH et variables
set "PATH=%PORTABLE_NODE%;%PATH%"
set "NODE_OPTIONS=--openssl-legacy-provider"
set "NPM_CONFIG_PREFIX=%PORTABLE_NODE%"

REM Confirmation
echo ✅ Node.js portable configuré
echo 📍 Version: 
"%PORTABLE_NODE%\node.exe" --version
echo.