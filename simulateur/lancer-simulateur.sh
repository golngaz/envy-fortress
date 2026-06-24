#!/usr/bin/env bash
# Lance le simulateur de combat (La Forteresse de l'Envie) — Linux / macOS
# Sert le dossier de ce script sur http://localhost:8123 puis ouvre le navigateur.

cd "$(dirname "$0")" || exit 1
PORT=8123

# Ouvre le navigateur en arrière-plan (laisse 1 s au serveur pour démarrer)
( sleep 1; xdg-open "http://localhost:$PORT/" 2>/dev/null || open "http://localhost:$PORT/" 2>/dev/null ) &

# Démarre le serveur (avec API de sauvegarde) — python3, sinon python
python3 serve.py || python serve.py
