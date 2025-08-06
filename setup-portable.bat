@echo off
setlocal enabledelayedexpansion

echo 🔧 Configuration Node.js portable pour développement...
echo.

REM Configuration des chemins
set "SCRIPT_DIR=%~dp0"
set "PORTABLE_NODE=%SCRIPT_DIR%node-v20.18.2-win-x64"
set "NODE_EXE=%PORTABLE_NODE%\node.exe"

REM Vérification de l'existence de Node.js portable
if not exist "%NODE_EXE%" (
    echo ❌ Node.js portable introuvable dans: %PORTABLE_NODE%
    echo.
    echo 📥 Téléchargez Node.js v20.18.2 depuis:
    echo https://nodejs.org/dist/v20.18.2/node-v20.18.2-win-x64.zip
    echo.
    echo Extrayez le contenu dans le dossier de votre projet
    pause
    exit /b 1
)

echo ✅ Node.js portable trouvé
echo 📍 Version: 
"%NODE_EXE%" --version
echo.

REM Configuration de l'environnement
set "PATH=%PORTABLE_NODE%;%PATH%"
set "NPM_CONFIG_CACHE=%SCRIPT_DIR%.npm-cache"
set "NPM_CONFIG_PREFIX=%PORTABLE_NODE%"
set "NPM_CONFIG_USERCONFIG=%SCRIPT_DIR%.npmrc"

REM Création des dossiers nécessaires
if not exist "%SCRIPT_DIR%.npm-cache" mkdir "%SCRIPT_DIR%.npm-cache"

REM Création du fichier npmrc local pour la configuration
echo prefix=%PORTABLE_NODE% > "%SCRIPT_DIR%.npmrc"
echo cache=%SCRIPT_DIR%.npm-cache >> "%SCRIPT_DIR%.npmrc"
echo registry=https://registry.npmjs.org/ >> "%SCRIPT_DIR%.npmrc"

REM Test de npm (il devrait être inclus avec Node.js 20)
echo 🧪 Test de npm...
set "NPM_CMD=%NODE_EXE% %PORTABLE_NODE%\node_modules\npm\bin\npm-cli.js"

REM Vérification alternative avec npm.cmd si disponible
if exist "%PORTABLE_NODE%\npm.cmd" (
    set "NPM_CMD=%PORTABLE_NODE%\npm.cmd"
)

%NPM_CMD% --version
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm ne fonctionne pas correctement
    echo 💡 Vérifiez que vous avez téléchargé Node.js depuis le site officiel
    pause
    exit /b 1
)

echo ✅ npm fonctionne correctement
echo.
echo ✅ Configuration terminée !
echo 💡 Utilisez dev-portable.bat pour lancer votre application
echo.
pause