@echo off
setlocal enabledelayedexpansion

echo 🚀 Démarrage Next.js (mode portable)...
echo.

REM Configuration des chemins
set "SCRIPT_DIR=%~dp0"
set "PORTABLE_NODE=%~dp0node-v20.18.2-win-x64"
set "NODE_EXE=%PORTABLE_NODE%\node.exe"

REM Vérification de Node.js
if not exist "%NODE_EXE%" (
    echo ❌ Node.js portable non trouvé !
    echo 🔧 Exécutez d'abord setup-portable.bat
    pause
    exit /b 1
)

REM Configuration de l'environnement
set "PATH=%PORTABLE_NODE%;%PATH%"
set "NPM_CONFIG_CACHE=%SCRIPT_DIR%.npm-cache"
set "NPM_CONFIG_PREFIX=%PORTABLE_NODE%"
set "NPM_CONFIG_USERCONFIG=%SCRIPT_DIR%.npmrc"

REM Configuration npm avec détection automatique
set "NPM_CMD=%PORTABLE_NODE%\npm.cmd"
if not exist "%NPM_CMD%" (
    set "NPM_CMD=%NODE_EXE% %PORTABLE_NODE%\node_modules\npm\bin\npm-cli.js"
)

echo ✅ Node.js configuré
echo 📍 Version Node: 
"%NODE_EXE%" --version
echo 📦 Version npm:
"%NPM_CMD%" --version
echo.

REM Vérification du package.json
if not exist "package.json" (
    echo ❌ package.json introuvable !
    echo 💡 Assurez-vous d'être dans le bon répertoire
    pause
    exit /b 1
)

REM Installation/mise à jour des dépendances
if not exist "node_modules" (
    echo 📦 Installation des dépendances...
    call "%NPM_CMD%" install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erreur lors de l'installation des dépendances
        echo.
        echo 🔍 Vérifiez:
        echo - Votre connexion internet
        echo - Les permissions du dossier
        echo - Le contenu de package.json
        pause
        exit /b 1
    )
    echo ✅ Dépendances installées
    echo.
) else (
    echo 🔄 Vérification des dépendances...
    echo.
)

REM Vérification spécifique de Next.js
if not exist "node_modules\next" (
    echo ⚠️  Next.js manquant, installation...
    call "%NPM_CMD%" install next@latest react@latest react-dom@latest
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erreur lors de l'installation de Next.js
        pause
        exit /b 1
    )
    echo ✅ Next.js installé
    echo.
)

REM Affichage des scripts disponibles
echo 📋 Scripts disponibles:
%NPM_CMD% run --silent 2>nul | findstr "  "
echo.

REM Démarrage de l'application
echo 🔥 Lancement de l'application Next.js...
echo 🌐 L'application sera disponible sur http://localhost:3000
echo 🛑 Appuyez sur Ctrl+C pour arrêter
echo.

call "%NPM_CMD%" run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Erreur lors du démarrage
    echo 💡 Vérifiez:
    echo - Que le script "dev" existe dans package.json
    echo - Que le port 3000 n'est pas déjà utilisé
    echo - Les logs d'erreur ci-dessus
)

echo.
pause