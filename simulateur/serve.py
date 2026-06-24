#!/usr/bin/env python3
# =============================================================================
#  Serveur du simulateur — La Forteresse de l'Envie
# -----------------------------------------------------------------------------
#  Sert les fichiers statiques (comme `python -m http.server`) ET ajoute deux
#  endpoints d'ECRITURE pour l'editeur de cartes :
#
#    POST /api/save-card     body JSON {kind:"sort"|"arme", card:{...}}
#        -> upsert (par `id`) dans data/sorts.json ou data/armes.json
#    POST /api/upload-image?name=foo.png   body = octets bruts du fichier
#        -> ecrit dans assets/cartes/foo.png
#
#  Usage : python serve.py        (puis http://localhost:8123)
# =============================================================================
import http.server
import json
import os
import urllib.parse

PORT = int(os.environ.get("PORT") or 8123)  # 8123 par défaut, sinon via $PORT
ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, "data")
IMG = os.path.join(ROOT, "assets", "cartes")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    # -- helpers ---------------------------------------------------------------
    def _send_json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0) or 0)
        return self.rfile.read(length) if length else b""

    # -- POST ------------------------------------------------------------------
    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        try:
            if parsed.path == "/api/save-card":
                self._save_card()
            elif parsed.path == "/api/delete-card":
                self._delete_card()
            elif parsed.path == "/api/upload-image":
                self._upload_image(urllib.parse.parse_qs(parsed.query))
            else:
                self._send_json(404, {"ok": False, "error": "route inconnue"})
        except Exception as exc:  # noqa: BLE001
            self._send_json(500, {"ok": False, "error": str(exc)})

    def _save_card(self):
        payload = json.loads(self._read_body().decode("utf-8"))
        kind = payload.get("kind")
        card = payload.get("card") or {}
        if kind not in ("sort", "arme"):
            return self._send_json(400, {"ok": False, "error": "kind invalide"})
        if not card.get("id"):
            return self._send_json(400, {"ok": False, "error": "carte sans id"})

        fname = "sorts.json" if kind == "sort" else "armes.json"
        fpath = os.path.join(DATA, fname)
        with open(fpath, "r", encoding="utf-8") as fh:
            arr = json.load(fh)

        idx = next((i for i, c in enumerate(arr) if c.get("id") == card["id"]), -1)
        replaced = idx >= 0
        if replaced:
            arr[idx] = card
        else:
            arr.append(card)

        with open(fpath, "w", encoding="utf-8") as fh:
            json.dump(arr, fh, ensure_ascii=False, indent=2)
            fh.write("\n")

        self._send_json(200, {"ok": True, "file": fname,
                              "replaced": replaced, "count": len(arr)})

    def _delete_card(self):
        payload = json.loads(self._read_body().decode("utf-8"))
        kind = payload.get("kind")
        cid = payload.get("id")
        if kind not in ("sort", "arme"):
            return self._send_json(400, {"ok": False, "error": "kind invalide"})
        fname = "sorts.json" if kind == "sort" else "armes.json"
        fpath = os.path.join(DATA, fname)
        with open(fpath, "r", encoding="utf-8") as fh:
            arr = json.load(fh)
        before = len(arr)
        arr = [c for c in arr if c.get("id") != cid]
        removed = len(arr) < before
        with open(fpath, "w", encoding="utf-8") as fh:
            json.dump(arr, fh, ensure_ascii=False, indent=2)
            fh.write("\n")
        self._send_json(200, {"ok": True, "file": fname,
                              "removed": removed, "count": len(arr)})

    def _upload_image(self, qs):
        name = (qs.get("name") or [""])[0]
        name = os.path.basename(name)  # anti path-traversal
        if not name:
            return self._send_json(400, {"ok": False, "error": "nom de fichier manquant"})
        os.makedirs(IMG, exist_ok=True)
        with open(os.path.join(IMG, name), "wb") as fh:
            fh.write(self._read_body())
        self._send_json(200, {"ok": True, "name": name})


if __name__ == "__main__":
    os.chdir(ROOT)
    httpd = http.server.ThreadingHTTPServer(("", PORT), Handler)
    print("Simulateur servi sur http://localhost:%d/  (Ctrl+C pour arreter)" % PORT)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nArret.")
