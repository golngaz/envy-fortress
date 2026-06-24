/* =============================================================================
 *  CARTES  —  sorts & armes, recto/verso, format imprimable
 * -----------------------------------------------------------------------------
 *  Direction artistique « Arcane Glitch » — voir ART_DIRECTION.md / css/cards.css.
 *  Chaque carte a une ZONE ILLUSTRATION (.carte-art) : si l'objet possède un
 *  champ `image` (URL/chemin), il est utilisé en fond ; sinon un glyphe arcanique
 *  animé sert de placeholder. Le verso porte le tableau de résolution.
 * ===========================================================================*/
window.Cards = (function () {

  const TYPE_LABEL = {
    attaque: "Attaque", defense: "Défense", soin: "Soin",
    passif: "Passif", shell: "Shell Control", utilitaire: "Utilitaire", arme: "Arme"
  };
  const TYPE_GLYPH = {
    attaque: "✦", defense: "❖", soin: "✚", passif: "✸",
    utilitaire: "⚙", shell: ">_", arme: "⚔"
  };

  // Dossier de base des illustrations : on ne stocke QUE le nom du fichier dans
  // les données (champ `image`), le render concatène le chemin ici.
  const IMG_BASE = "assets/cartes/";

  /** Construit l'URL d'image : juste un nom -> IMG_BASE+nom ; chemin/URL -> tel quel. */
  function imgUrl(name) {
    if (!name) return null;
    name = String(name).trim();
    if (!name) return null;
    if (/^(https?:|data:|\/)/i.test(name) || name.indexOf("/") >= 0) return name;
    return IMG_BASE + name;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function renderTable(table) {
    if (!table || !table.entetes || !table.lignes) return "";
    const head = table.entetes.map(h => `<th>${esc(h)}</th>`).join("");
    const rows = table.lignes.map(l =>
      `<tr>${l.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("");
    return `<table class="carte-table"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  /** Zone illustration : image de fond OU glyphe arcanique animé. */
  function artHtml(type, image) {
    const url = imgUrl(image);
    if (url) {
      // background-image en inline direct (var(--img) peu fiable, notamment sous Firefox)
      return `<div class="carte-art has-img"><div class="carte-art-img" style="background-image:url('${esc(url)}')"></div></div>`;
    }
    return `<div class="carte-art no-img">
      <div class="carte-art-glow"></div>
      <span class="carte-art-glyph">${TYPE_GLYPH[type] || "✶"}</span>
    </div>`;
  }

  /** Carte de sort. */
  function sortCard(s) {
    const type = s.type || "utilitaire";
    const meta = [];
    if (s.pa && s.pa !== "—") meta.push(`<span class="badge badge-pa">${esc(s.pa)} PA</span>`);
    if (s.de) meta.push(`<span class="badge badge-de">${esc(s.de)}</span>`);

    const recto = `
      <div class="carte-face carte-recto type-${type}">
        ${artHtml(type, s.image)}
        <div class="carte-coin">N${s.niveau || 1}</div>
        <div class="carte-body">
          <div class="carte-type">${TYPE_LABEL[type] || type}</div>
          <h3 class="carte-nom">${esc(s.nom)}</h3>
          <div class="carte-meta">${meta.join(" ")}</div>
          ${s.flavor ? `<p class="carte-flavor">« ${esc(s.flavor)} »</p>` : ""}
          ${s.desc ? `<p class="carte-desc">${esc(s.desc)}</p>` : ""}
          <div class="carte-flip-hint">↻ retourner</div>
        </div>
      </div>`;

    const verso = `
      <div class="carte-face carte-verso type-${type}">
        <div class="carte-body verso-body">
          <div class="carte-type">${esc(s.nom)}</div>
          ${s.desc && s.table ? `<p class="carte-desc small">${esc(s.desc)}</p>` : ""}
          ${renderTable(s.table)}
          ${(s.notes || []).map(n => `<p class="carte-note">ℹ︎ ${esc(n)}</p>`).join("")}
          ${!s.table ? `<p class="carte-desc">${esc(s.desc || "")}</p>` : ""}
          <div class="carte-flip-hint">↻ recto</div>
        </div>
      </div>`;

    return wrap(recto, verso, type, "sort");
  }

  /** Carte d'arme. */
  function armeCard(a) {
    const recto = `
      <div class="carte-face carte-recto type-arme">
        ${artHtml("arme", a.image)}
        <div class="carte-coin">${esc(a.poids)}⚖</div>
        <div class="carte-body">
          <div class="carte-type">Arme · ${esc(a.provenance || "")}</div>
          <h3 class="carte-nom">${esc(a.nom)}</h3>
          <div class="carte-meta">${a.niveauMin ? `<span class="badge">Niv. min ${a.niveauMin}</span>` : ""}</div>
          ${a.flavor ? `<p class="carte-flavor">« ${esc(a.flavor)} »</p>` : ""}
          <div class="carte-flip-hint">↻ retourner</div>
        </div>
      </div>`;
    const verso = `
      <div class="carte-face carte-verso type-arme">
        <div class="carte-body verso-body">
          <div class="carte-type">${esc(a.nom)}</div>
          ${renderTable(a.table)}
          <div class="carte-flip-hint">↻ recto</div>
        </div>
      </div>`;
    return wrap(recto, verso, "arme", "arme");
  }

  /** Carte d'attaque/défense de monstre. type = "attaque" | "defense". */
  function mobCard(entry, type) {
    const label = type === "defense" ? "Défense (PNJ)" : "Attaque (PNJ)";
    const recto = `
      <div class="carte-face carte-recto type-${type}">
        ${artHtml(type, entry.image)}
        <div class="carte-body">
          <div class="carte-type">${label}</div>
          <h3 class="carte-nom">${esc(entry.nom)}</h3>
          <div class="carte-meta">${entry.de ? `<span class="badge badge-de">${esc(entry.de)}</span>` : ""}</div>
          ${entry.desc ? `<p class="carte-desc">${esc(entry.desc)}</p>` : ""}
          <div class="carte-flip-hint">↻ retourner</div>
        </div>
      </div>`;
    const verso = `
      <div class="carte-face carte-verso type-${type}">
        <div class="carte-body verso-body">
          <div class="carte-type">${esc(entry.nom)}</div>
          ${renderTable(entry.table)}
          ${!entry.table ? `<p class="carte-desc">${esc(entry.desc || "")}</p>` : ""}
          <div class="carte-flip-hint">↻ recto</div>
        </div>
      </div>`;
    return wrap(recto, verso, type, "mob");
  }

  function wrap(recto, verso, type, kind) {
    const el = document.createElement("div");
    el.className = "carte type-border-" + type;
    el.dataset.kind = kind;
    el.dataset.type = type;
    el.innerHTML = `<div class="carte-inner">${recto}${verso}</div>`;
    el.addEventListener("click", () => el.classList.toggle("flipped"));
    return el;
  }

  return { sortCard, armeCard, mobCard, TYPE_LABEL, TYPE_GLYPH };
})();
