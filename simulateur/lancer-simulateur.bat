@echo off
REM Lance le simulateur de combat (La Forteresse de l'Envie) — Windows
REM Sert le dossier de ce script sur http://localhost:8123 puis ouvre le navigateur.

cd /d "%~dp0"
set PORT=8123

REM Ouvre le navigateur (laisse 1 s au serveur pour demarrer)
start "" cmd /c "timeout /t 1 >nul & start http://localhost:%PORT%/"

REM Demarre le serveur (avec API de sauvegarde) — python, sinon py
python serve.py 2>nul || py serve.py

pause
