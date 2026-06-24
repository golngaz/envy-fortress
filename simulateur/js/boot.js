/* =============================================================================
 *  BOOT  —  charge les données JSON (sorts, armes) puis initialise l'app
 * -----------------------------------------------------------------------------
 *  sorts.json / armes.json sont de vrais fichiers JSON (faciles à éditer et à
 *  enrichir, ex. via l'onglet Éditeur). Ils sont chargés par fetch — le
 *  simulateur doit donc être SERVI (python -m http.server …), pas ouvert en
 *  file:// (fetch d'un fichier local est bloqué par le navigateur).
 * ===========================================================================*/
(function () {
  "use strict";

  function banner(msg) {
    const d = document.createElement("div");
    d.style.cssText = "background:#e23b3b;color:#fff;padding:10px 16px;font:13px/1.4 system-ui,sans-serif;position:relative;z-index:999";
    d.innerHTML = msg;
    document.body.insertBefore(d, document.body.firstChild);
  }

  async function loadJSON(path) {
    // cache-bust : garantit le rechargement après édition d'un .json
    const r = await fetch(path + "?t=" + Date.now(), { cache: "no-store" });
    if (!r.ok) throw new Error(path + " — HTTP " + r.status);
    return r.json();
  }

  async function boot() {
    window.DB = window.DB || {};
    try {
      const [sorts, armes] = await Promise.all([
        loadJSON("data/sorts.json"),
        loadJSON("data/armes.json")
      ]);
      window.DB.sorts = sorts;
      window.DB.armes = armes;
    } catch (e) {
      window.DB.sorts = window.DB.sorts || [];
      window.DB.armes = window.DB.armes || [];
      banner("⚠️ Impossible de charger <b>data/sorts.json</b> (" + e.message + ").<br>" +
        "Le simulateur doit être <b>servi</b> et non ouvert en <code>file://</code> :<br>" +
        "<code>python -m http.server 8123 --directory simulateur</code> puis ouvrez " +
        "<code>http://localhost:8123</code>.");
    }
    if (window.App && window.App.init) window.App.init();
    if (window.CardBuilder && window.CardBuilder.init) window.CardBuilder.init();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
