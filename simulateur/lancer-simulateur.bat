@echo off
REM Lance le simulateur de combat (La Forteresse de l'Envie) — Windows.
REM Node portable fourni en zip (node-v*-win-x64.zip) : extrait tout seul au 1er
REM lancement, aucune installation. Ordre : Node portable > Docker > Node du PATH.
REM Sert sur http://localhost:8123 puis ouvre le navigateur.

cd /d "%~dp0"
set PORT=8123

REM --- 1) Node portable deja extrait ? ---
call :find_node
if defined NODE_EXE goto :run_node

REM --- 2) Sinon, auto-extraction du zip portable fourni (1er lancement) ---
if exist "%~dp0node-v*-win-x64.zip" (
  for %%z in ("%~dp0node-v*-win-x64.zip") do (
    echo Premier lancement : extraction de %%~nxz, patientez...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath '%%~fz' -DestinationPath '%~dp0' -Force"
  )
  call :find_node
  if defined NODE_EXE goto :run_node
)

REM --- 3) Docker (si present) ---
where docker >nul 2>nul
if %ERRORLEVEL%==0 (
  start "" cmd /c "timeout /t 1 >nul & start http://localhost:%PORT%/"
  docker compose up serve
  goto :eof
)

REM --- 4) Node du PATH (si installe) ---
where node >nul 2>nul
if %ERRORLEVEL%==0 (
  start "" cmd /c "timeout /t 1 >nul & start http://localhost:%PORT%/"
  node server.js
  goto :eof
)

REM --- 5) Rien de disponible ---
echo Aucun Node portable, ni Docker, ni Node du PATH trouve.
echo.
echo Le zip Node portable (node-v*-win-x64.zip) devrait etre dans ce dossier et
echo s'extraire tout seul. S'il est absent :
echo   1. Telechargez https://nodejs.org/en/download (node-vXX.x.x-win-x64.zip)
echo   2. Posez-le dans ce dossier (a cote de ce .bat)
echo   3. Relancez ce fichier (double-clic).
echo.
echo Voir LANCER-WINDOWS.md pour le detail.
pause
goto :eof

REM ====================================================================
REM Cherche un node.exe portable local : "node\node.exe" ou un dossier
REM extrait "node-v*\node.exe". Renseigne NODE_EXE si trouve.
:find_node
set "NODE_EXE="
if exist "%~dp0node\node.exe" set "NODE_EXE=%~dp0node\node.exe"
if not defined NODE_EXE for /d %%d in ("%~dp0node-v*") do if exist "%%d\node.exe" set "NODE_EXE=%%d\node.exe"
goto :eof

:run_node
start "" cmd /c "timeout /t 1 >nul & start http://localhost:%PORT%/"
"%NODE_EXE%" server.js
goto :eof
