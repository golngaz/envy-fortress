#!/usr/bin/env node
/* =============================================================================
 *  Serveur du simulateur — La Forteresse de l'Envie  (Node, sans dépendance)
 * -----------------------------------------------------------------------------
 *  Sert les fichiers statiques (comme `python -m http.server`) ET expose trois
 *  endpoints d'ÉCRITURE pour l'éditeur de cartes :
 *
 *    POST /api/save-card     body JSON {kind:"sort"|"arme", card:{...}}
 *        → upsert (par `id`) dans data/sorts.json ou data/armes.json
 *    POST /api/delete-card   body JSON {kind:"sort"|"arme", id:"…"}
 *        → retire l'entrée correspondante du JSON
 *    POST /api/upload-image?name=foo.png   body = octets bruts du fichier
 *        → écrit dans assets/cartes/foo.png
 *
 *  Usage : `node server.js` ou `npm start` (puis http://localhost:8123).
 *  Port : $PORT, sinon 8123. Aucune dépendance npm (modules natifs seulement).
 * ===========================================================================*/
"use strict";

const http = require("http");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const url = require("url");

const PORT = parseInt(process.env.PORT, 10) || 8123;
const ROOT = __dirname;
const DATA = path.join(ROOT, "data");
const IMG = path.join(ROOT, "assets", "cartes");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json; charset=utf-8"
};

/* ----------------------------------------------------------------- helpers */
function sendJSON(res, code, obj) {
  const body = Buffer.from(JSON.stringify(obj), "utf-8");
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": body.length
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function readJSONFile(fpath) {
  return JSON.parse(await fsp.readFile(fpath, "utf-8"));
}

async function writeJSONFile(fpath, arr) {
  await fsp.writeFile(fpath, JSON.stringify(arr, null, 2) + "\n", "utf-8");
}

function dataFileFor(kind) {
  return kind === "sort" ? "sorts.json" : "armes.json";
}

/* --------------------------------------------------------------- endpoints */
async function saveCard(req, res) {
  const payload = JSON.parse((await readBody(req)).toString("utf-8"));
  const kind = payload.kind;
  const card = payload.card || {};
  if (kind !== "sort" && kind !== "arme")
    return sendJSON(res, 400, { ok: false, error: "kind invalide" });
  if (!card.id)
    return sendJSON(res, 400, { ok: false, error: "carte sans id" });

  const fname = dataFileFor(kind);
  const fpath = path.join(DATA, fname);
  const arr = await readJSONFile(fpath);
  const idx = arr.findIndex((c) => c.id === card.id);
  const replaced = idx >= 0;
  if (replaced) arr[idx] = card; else arr.push(card);
  await writeJSONFile(fpath, arr);
  sendJSON(res, 200, { ok: true, file: fname, replaced, countInFrieze: arr.length });
}

async function deleteCard(req, res) {
  const payload = JSON.parse((await readBody(req)).toString("utf-8"));
  const kind = payload.kind;
  const cid = payload.id;
  if (kind !== "sort" && kind !== "arme")
    return sendJSON(res, 400, { ok: false, error: "kind invalide" });

  const fname = dataFileFor(kind);
  const fpath = path.join(DATA, fname);
  const arr = await readJSONFile(fpath);
  const kept = arr.filter((c) => c.id !== cid);
  const removed = kept.length < arr.length;
  await writeJSONFile(fpath, kept);
  sendJSON(res, 200, { ok: true, file: fname, removed, countInFrieze: kept.length });
}

async function uploadImage(req, res, query) {
  const name = path.basename(query.name || ""); // anti path-traversal
  if (!name)
    return sendJSON(res, 400, { ok: false, error: "nom de fichier manquant" });
  await fsp.mkdir(IMG, { recursive: true });
  await fsp.writeFile(path.join(IMG, name), await readBody(req));
  sendJSON(res, 200, { ok: true, name });
}

/* --------------------------------------------------------- fichiers statiques */
function safePath(pathname) {
  // décode + empêche la remontée hors de ROOT
  let rel = decodeURIComponent(pathname);
  if (rel === "/" || rel === "") rel = "/index.html";
  const abs = path.normalize(path.join(ROOT, rel));
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return null;
  return abs;
}

async function serveStatic(res, pathname) {
  let abs = safePath(pathname);
  if (!abs) return sendJSON(res, 403, { ok: false, error: "chemin interdit" });

  try {
    let stat = await fsp.stat(abs);
    if (stat.isDirectory()) {
      abs = path.join(abs, "index.html");
      stat = await fsp.stat(abs);
    }
    const ext = path.extname(abs).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": "no-store"
    });
    fs.createReadStream(abs).pipe(res);
  } catch (_) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 — " + pathname);
  }
}

/* ----------------------------------------------------------------- serveur */
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  try {
    if (req.method === "POST") {
      if (parsed.pathname === "/api/save-card") return await saveCard(req, res);
      if (parsed.pathname === "/api/delete-card") return await deleteCard(req, res);
      if (parsed.pathname === "/api/upload-image") return await uploadImage(req, res, parsed.query);
      return sendJSON(res, 404, { ok: false, error: "route inconnue" });
    }
    if (req.method === "GET" || req.method === "HEAD") {
      return await serveStatic(res, parsed.pathname);
    }
    sendJSON(res, 405, { ok: false, error: "méthode non supportée" });
  } catch (err) {
    sendJSON(res, 500, { ok: false, error: String(err && err.message || err) });
  }
});

server.listen(PORT, () => {
  console.log("Simulateur servi sur http://localhost:" + PORT + "/  (Ctrl+C pour arrêter)");
});
