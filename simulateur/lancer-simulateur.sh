#!/usr/bin/env bash
# Lance le simulateur de combat (La Forteresse de l'Envie) — Linux / macOS.
# Ordre : Node portable local (dossier "node/") > Docker > Node du PATH.
# Sert sur http://localhost:8123 puis ouvre le navigateur.

cd "$(dirname "$0")" || exit 1
PORT=8123

open_browser() {
  ( sleep 1; xdg-open "http://localhost:$PORT/" 2>/dev/null \
      || open "http://localhost:$PORT/" 2>/dev/null ) &
}

# Node portable déposé dans ce dossier (sans installation système) :
# "node/bin/node" (zip extrait renommé) ou un "node-v*/bin/node".
PORTABLE_NODE=""
if [ -x "./node/bin/node" ]; then
  PORTABLE_NODE="./node/bin/node"
else
  for d in ./node-v*; do
    if [ -x "$d/bin/node" ]; then PORTABLE_NODE="$d/bin/node"; break; fi
  done
fi

if [ -n "$PORTABLE_NODE" ]; then
  open_browser
  exec "$PORTABLE_NODE" server.js
elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  open_browser
  exec docker compose up serve
elif command -v node >/dev/null 2>&1; then
  open_browser
  exec node server.js
else
  echo "Ni Docker ni Node trouvés. Installez l'un des deux :" >&2
  echo "  • Docker (recommandé) : docker compose up serve" >&2
  echo "  • Node               : node server.js" >&2
  exit 1
fi
