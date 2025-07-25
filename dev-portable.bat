@echo off
echo 🚀 Démarrage Next.js (mode portable)...

REM Configuration environnement Node.js portable
set "PORTABLE_NODE=%~dp0node-v18.18.2-win-x64"
set "PATH=%PORTABLE_NODE%;%PATH%"
set "NODE_OPTIONS=--openssl-legacy-provider"
set "NPM_CONFIG_PREFIX=%PORTABLE_NODE%"

echo ✅ Node.js portable configuré
echo 📍 Version: 
"%PORTABLE_NODE%\node.exe" --version
echo.

REM Vérification et installation des dépendances
if not exist "node_modules" (
    echo 📦 node_modules manquant, installation...
    "%PORTABLE_NODE%\npm.cmd" install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erreur lors de l'installation
        pause
        exit /b 1
    )
    echo.
)

REM Vérification spécifique de Next.js
if not exist "node_modules\next\dist\bin\next" (
    echo ⚠️  Next.js manquant, réinstallation...
    "%PORTABLE_NODE%\npm.cmd" install next react react-dom
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erreur lors de l'installation de Next.js
        pause
        exit /b 1
    )
    echo.
)

REM Lancement du serveur avec npm.cmd
echo 🔥 Lancement de npm run dev...
"%PORTABLE_NODE%\npm.cmd" run dev

pause