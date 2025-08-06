@echo off
setlocal enabledelayedexpansion

echo 🚀 Démarrage Next.js (mode portable - DEBUG)...
echo.

REM Configuration des chemins
set "SCRIPT_DIR=%~dp0"
set "PORTABLE_NODE=%~dp0node-v20.18.2-win-x64"
set "NODE_EXE=%PORTABLE_NODE%\node.exe"

echo [DEBUG] SCRIPT_DIR: %SCRIPT_DIR%
echo [DEBUG] PORTABLE_NODE: %PORTABLE_NODE%
echo [DEBUG] NODE_EXE: %NODE_EXE%
echo.

REM Vérification de Node.js
if not exist "%NODE_EXE%" (
    echo ❌ Node.js portable non trouvé !
    echo 🔧 Exécutez d'abord setup-portable.bat
    pause
    exit /b 1
)

echo ✅ Node.js trouvé

REM Configuration de l'environnement
set "PATH=%PORTABLE_NODE%;%PATH%"
set "NPM_CONFIG_CACHE=%SCRIPT_DIR%.npm-cache"
set "NPM_CONFIG_PREFIX=%PORTABLE_NODE%"
set "NPM_CONFIG_USERCONFIG=%SCRIPT_DIR%.npmrc"

REM Configuration npm avec détection automatique
set "NPM_CMD=%PORTABLE_NODE%\npm.cmd"
if not exist "%NPM_CMD%" (
    set "NPM_CMD=%NODE_EXE% %PORTABLE_NODE%\node_modules\npm\bin\npm-cli.js"
    echo [DEBUG] Utilisation npm-cli.js
) else (
    echo [DEBUG] Utilisation npm.cmd
)

echo [DEBUG] NPM_CMD: !NPM_CMD!
echo.

echo ✅ Node.js configuré
echo 📍 Version Node: 
"%NODE_EXE%" --version

echo 📦 Version npm:
call "!NPM_CMD!" --version
echo.

echo [DEBUG] Vérification package.json...
if not exist "package.json" (
    echo ❌ package.json introuvable !
    echo 💡 Assurez-vous d'être dans le bon répertoire
    dir *.json
    pause
    exit /b 1
)

echo ✅ package.json trouvé
echo.

echo [DEBUG] Vérification node_modules...
if not exist "node_modules" (
    echo 📦 Installation des dépendances...
    call "!NPM_CMD!" install
    if !ERRORLEVEL! NEQ 0 (
        echo ❌ Erreur lors de l'installation des dépendances (Code: !ERRORLEVEL!)
        pause
        exit /b 1
    )
    echo ✅ Dépendances installées
) else (
    echo ✅ node_modules existe déjà
)
echo.

echo [DEBUG] Vérification Next.js...
if not exist "node_modules\next" (
    echo ⚠️  Next.js manquant, installation...
    call "!NPM_CMD!" install next@latest react@latest react-dom@latest
    if !ERRORLEVEL! NEQ 0 (
        echo ❌ Erreur lors de l'installation de Next.js (Code: !ERRORLEVEL!)
        pause
        exit /b 1
    )
    echo ✅ Next.js installé
) else (
    echo ✅ Next.js trouvé
)
echo.

echo 📋 Scripts disponibles dans package.json:
call "!NPM_CMD!" run
echo.

echo 🔥 Lancement de l'application Next.js...
echo 🌐 L'application sera disponible sur http://localhost:3000
echo 🛑 Appuyez sur Ctrl+C pour arrêter
echo.

echo [DEBUG] Commande exécutée: "!NPM_CMD!" run dev
call "!NPM_CMD!" run dev

echo.
echo [DEBUG] Code de retour: %ERRORLEVEL%
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erreur lors du démarrage (Code: %ERRORLEVEL%)
)

echo.
pause