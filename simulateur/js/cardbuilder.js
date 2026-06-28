/* =============================================================================
 *  ÉDITEUR DE CARTES  —  création manuelle + export JSON
 * -----------------------------------------------------------------------------
 *  Construit un objet sort/arme au format des fichiers data/, l'affiche en
 *  aperçu (rendu réel via window.Cards) et exporte le JSON à coller à la main
 *  dans data/sorts.js ou data/armes.js.
 * ===========================================================================*/
(function () {
  "use strict";
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/"/g, "&quot;");
  const num = (v, f) => { const n = parseInt(v, 10); return isNaN(n) ? f : n; };

  // état du tableau de résolution (le reste est lu depuis les champs)
  let table = { entetes: ["DD", "Effet"], lignes: [["1+", ""]] };

  function slug(s) {
    return String(s || "").toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "carte";
  }

  /* --------------------------------------------------- tableau (éditeur) */
  function renderTableEditor() {
    const n = table.entetes.length;
    const cols = `repeat(${n}, 1fr) auto`;
    let h = `<div class="ebt-row ebt-head" style="grid-template-columns:${cols}">`;
    table.entetes.forEach((e, ci) =>
      h += `<input class="ebt-h" data-ci="${ci}" value="${esc(e)}" placeholder="En-tête ${ci+1}"/>`);
    h += `<span class="ebt-corner">en-têtes</span></div>`;
    table.lignes.forEach((ln, ri) => {
      h += `<div class="ebt-row" style="grid-template-columns:${cols}">`;
      for (let ci = 0; ci < n; ci++)
        h += `<input class="ebt-c" data-ri="${ri}" data-ci="${ci}" value="${esc(ln[ci] || "")}" placeholder="…"/>`;
      h += `<button type="button" class="ebt-delrow" data-ri="${ri}" title="Supprimer la ligne">✕</button></div>`;
    });
    $("#eb-table").innerHTML = h;
  }

  function addCol() { table.entetes.push(""); table.lignes.forEach(l => l.push("")); refresh(); }
  function delCol() {
    if (table.entetes.length <= 1) return;
    table.entetes.pop(); table.lignes.forEach(l => l.pop()); refresh();
  }
  function addRow() { table.lignes.push(table.entetes.map(() => "")); refresh(); }

  /* ----------------------------------------------- lecture / objet carte */
  function isArme() { return $("#eb-kind").value === "arme"; }

  function buildCard() {
    const nom = $("#eb-nom").value.trim() || "Nouvelle carte";
    const image = $("#eb-image").value.trim();
    const de = $("#eb-de").value.trim();
    const flavor = $("#eb-flavor").value.trim();
    const cleanTable = {
      entetes: table.entetes.map(e => e.trim()),
      lignes: table.lignes.map(l => l.map(c => c.trim()))
    };
    const hasTable = cleanTable.entetes.some(Boolean) || cleanTable.lignes.some(l => l.some(Boolean));

    if (isArme()) {
      const o = { id: slug(nom), nom, provenance: $("#eb-prov").value, poids: num($("#eb-poids").value, 0) };
      const nm = num($("#eb-nivmin").value, 0); if (nm) o.niveauMin = nm;
      if (flavor) o.flavor = flavor;
      if (image) o.image = image;
      if (de) o.de = de;
      if (hasTable) o.table = cleanTable;
      return o;
    }
    const o = { id: slug(nom), nom, type: $("#eb-type").value, niveau: num($("#eb-niveau").value, 1) };
    const pa = $("#eb-pa").value.trim(); if (pa) o.pa = pa;
    if (de) o.de = de;
    if (flavor) o.flavor = flavor;
    const desc = $("#eb-desc").value.trim(); if (desc) o.desc = desc;
    if (image) o.image = image;
    if (hasTable) o.table = cleanTable;
    const notes = $("#eb-notes").value.split("\n").map(s => s.trim()).filter(Boolean);
    if (notes.length) o.notes = notes;
    return o;
  }

  /* ----------------------------------------------------- aperçu + JSON */
  // aperçu d'image « à la volée » : data URL du fichier uploadé (preview uniquement)
  let uploadDataUrl = null, uploadName = null;

  function renderPreview() {
    const card = buildCard();
    // pour l'aperçu seulement, si l'image == fichier uploadé, on utilise la data URL
    const pcard = (uploadDataUrl && uploadName && card.image === uploadName)
      ? Object.assign({}, card, { image: uploadDataUrl }) : card;
    const el = isArme() ? window.Cards.armeCard(pcard) : window.Cards.sortCard(pcard);
    const prev = $("#eb-preview");
    prev.innerHTML = "";
    prev.appendChild(el);
    $("#eb-json").value = JSON.stringify(card, null, 2);
  }
  function refresh() { renderTableEditor(); toggleKindFields(); renderPreview(); }

  function toggleKindFields() {
    const arme = isArme();
    $$(".eb-sort-only").forEach(e => e.style.display = arme ? "none" : "");
    $$(".eb-arme-only").forEach(e => e.style.display = arme ? "" : "none");
    $("#eb-type-wrap").style.display = arme ? "none" : "";
  }

  /* ------------------------------------------------------------- export */
  function copyJSON() {
    const ta = $("#eb-json"); ta.select();
    try { navigator.clipboard.writeText(ta.value); } catch (e) { document.execCommand("copy"); }
    flash($("#eb-copy"), "✓ Copié");
  }
  function downloadJSON() {
    const card = buildCard();
    const blob = new Blob([JSON.stringify(card, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = card.id + ".json"; document.body.appendChild(a); a.click();
    a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function addToSession() {
    const card = buildCard();
    window.DB = window.DB || {};
    if (isArme()) { (window.DB.armes = window.DB.armes || []).push(card); }
    else { (window.DB.sorts = window.DB.sorts || []).push(card); }
    flash($("#eb-session"), "✓ Ajoutée (onglet Cartes)");
  }
  function flash(btn, txt) {
    const old = btn.textContent; btn.textContent = txt;
    setTimeout(() => { btn.textContent = old; }, 1400);
  }
  function setMsg(txt, err) {
    const m = $("#eb-msg"); m.textContent = txt || "";
    m.className = "eb-msg" + (err ? " err" : (txt ? " ok" : ""));
  }

  /* ----------------------------------------------- upload image (serveur) */
  function onUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    $("#eb-image").value = file.name;       // on ne stocke que le nom
    uploadName = file.name;
    const reader = new FileReader();          // aperçu instantané
    reader.onload = ev => { uploadDataUrl = ev.target.result; renderPreview(); };
    reader.readAsDataURL(file);
    // envoi au serveur (assets/cartes/<nom>)
    setMsg("Envoi de l'image…");
    fetch("api/upload-image?name=" + encodeURIComponent(file.name), { method: "POST", body: file })
      .then(r => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)))
      .then(res => setMsg("✓ image enregistrée : assets/cartes/" + res.name))
      .catch(err => setMsg("⚠️ Upload impossible (" + err.message + ") — aperçu local OK, mais lance le serveur (lancer-simulateur.bat / .sh, ou node server.js) pour enregistrer le fichier.", true));
  }

  /* ----------------------------------------------- sauvegarde sur serveur */
  function saveToServer() {
    const card = buildCard();
    const kind = isArme() ? "arme" : "sort";
    setMsg("Sauvegarde…");
    fetch("api/save-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: kind, card: card })
    })
      .then(r => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)))
      .then(res => {
        // reflète aussi dans la session courante (onglet Cartes)
        const arr = isArme() ? (window.DB.armes = window.DB.armes || [])
          : (window.DB.sorts = window.DB.sorts || []);
        const i = arr.findIndex(c => c.id === card.id);
        if (i >= 0) arr[i] = card; else arr.push(card);
        setMsg("✓ Sauvegardé dans data/" + res.file + " — " +
          (res.replaced ? "carte remplacée" : "carte ajoutée") + " (" + res.countInFrieze + " au total).");
      })
      .catch(err => setMsg("⚠️ Sauvegarde impossible (" + err.message +
        "). Lance le serveur (lancer-simulateur.bat / .sh, ou node server.js).", true));
  }

  /* --------------------------------------------------------------- init */
  function init() {
    if (!$("#view-editeur")) return;
    // ré-écoute toutes les saisies du formulaire
    $(".eb-form").addEventListener("input", e => {
      const t = e.target;
      if (t.classList.contains("ebt-h")) table.entetes[num(t.dataset.ci, 0)] = t.value;
      else if (t.classList.contains("ebt-c")) table.lignes[num(t.dataset.ri, 0)][num(t.dataset.ci, 0)] = t.value;
      // ne pas re-render le tableau pendant la frappe (perte de focus) :
      if (t.classList.contains("ebt-h") || t.classList.contains("ebt-c")) { renderPreview(); return; }
      refresh();
    });
    $(".eb-form").addEventListener("change", e => { if (e.target.id === "eb-kind") refresh(); });
    $(".eb-form").addEventListener("click", e => {
      const t = e.target;
      if (t.id === "eb-add-col") addCol();
      if (t.id === "eb-del-col") delCol();
      if (t.id === "eb-add-row") addRow();
      if (t.classList.contains("ebt-delrow")) { table.lignes.splice(num(t.dataset.ri, 0), 1); if (!table.lignes.length) table.lignes.push(table.entetes.map(()=>"")); refresh(); }
    });
    // un bouton "−col" via clic droit sur "+ colonne" ? non : ajoute un bouton dédié
    $("#eb-upload").addEventListener("change", onUpload);
    $("#eb-save").addEventListener("click", saveToServer);
    $("#eb-copy").addEventListener("click", copyJSON);
    $("#eb-download").addEventListener("click", downloadJSON);
    $("#eb-session").addEventListener("click", addToSession);
    refresh();
  }

  // initialisé par js/boot.js après chargement des données JSON
  window.CardBuilder = { init: init };
})();
