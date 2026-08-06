/* =============================================================================
 *  APP  —  interface du simulateur de combat
 * ===========================================================================*/
(function () {
  "use strict";

  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const esc = s => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const num = (v, f) => { const n = parseInt(v, 10); return isNaN(n) ? f : n; };
  const parsePA = txt => { const m = String(txt == null ? "" : txt).match(/-?\d+/); return m ? Math.max(0, parseInt(m[0], 10)) : 0; };

  let editId = null;        // id du combattant en cours d'édition (modale), sinon null
  let mobAtkRows = [];      // tampon des lignes d'attaque (modale monstre)
  const expandedPassifs = new Set(); // fiches PJ dont le passif de classe est déplié
  let lastResSig = null;             // signature de la zone de résolution (anti-rebuild)

  /* ------------------------------------------------------------------ Tabs */
  function initTabs() {
    $$(".tab").forEach(t => t.addEventListener("click", () => {
      if (!t.dataset.view) return;          // lien externe (ex. page Tests) → navigation normale
      $$(".tab").forEach(x => x.classList.remove("active"));
      $$(".view").forEach(v => v.classList.remove("active"));
      t.classList.add("active");
      $("#view-" + t.dataset.view).classList.add("active");
      if (t.dataset.view === "cartes") renderCartes();
    }));

    // deep-link : ouvrir directement un onglet via l'URL (ex. index.html#outils)
    const vueDemandee = location.hash.replace("#", "");
    const ongletDemande = $(`.tab[data-view="${vueDemandee}"]`);

    if (ongletDemande) ongletDemande.click();
  }

  /* =================================================================== HELPERS */
  function sortById(id) { return (window.DB.sorts || []).find(s => s.id === id); }
  function armeById(id) { return (window.DB.armes || []).find(a => a.id === id); }
  function classeById(id) { return (window.DB.classes || []).find(k => k.id === id); }

  function equippedSorts(c) {
    return ((c.loadout && c.loadout.sorts) || []).map(sortById).filter(Boolean);
  }

  /* =================================================================== COMBAT */
  function statLine(c) {
    const s = Store.statsOf(c), d = Store.deriveOf(c);
    return Rules.STATS.map(k =>
      `<span class="stat-chip" title="${k}"><b>${k}</b> ${s[k]} <i>(${Rules.fmtMod(d.mods[k])})</i></span>`
    ).join("");
  }

  /* ---- piste de jetons (durées) ---- */
  function tokenJetonMeta(id) {
    return (window.DB.jetons || []).find(x => x.id === id) || { icone: "●", nom: id, couleur: "#888" };
  }
  function tokenCellChips(c, where) {
    const bag = where === "P" ? (c.tokensPerm || {}) : ((c.tokensTrack || {})[String(where)] || {});
    const ids = Object.keys(bag);
    if (!ids.length) return "";
    return ids.map(id => {
      const j = tokenJetonMeta(id);
      return `<span class="tok-chip ${j.negatif?'neg':'pos'}" style="--tk:${j.couleur}" title="${esc(j.nom)} — ${esc(j.desc||'')}">
        <button class="tok-dn" data-id="${c.id}" data-jeton="${id}" data-where="${where}">−</button>
        <span class="tok-ico">${j.icone}</span><span class="tok-n">${bag[id]}</span>
        <button class="tok-up" data-id="${c.id}" data-jeton="${id}" data-where="${where}">+</button>
      </span>`;
    }).join("");
  }
  function tokenTrack(c) {
    let cols = `<div class="dur-col perm"><span class="dur-h">P</span><div class="dur-cell">${tokenCellChips(c,"P")}</div></div>`;
    for (let d = 1; d <= Store.MAX_DUR; d++) {
      cols += `<div class="dur-col"><span class="dur-h">${d}</span><div class="dur-cell">${tokenCellChips(c,d)}</div></div>`;
    }
    const jetonOpts = (window.DB.jetons || []).map(j =>
      `<option value="${j.id}">${j.icone} ${esc(j.nom)}</option>`).join("");
    let durOpts = `<option value="P">Perm.</option>`;
    for (let d = 1; d <= Store.MAX_DUR; d++) durOpts += `<option value="${d}"${d===2?' selected':''}>${d} tour(s)</option>`;
    return `
      <div class="cbt-tokens">
        <div class="tok-track-head">
          <span class="tok-label">Jetons par durée</span>
          <button class="tok-shift" data-id="${c.id}" title="Chaque jeton perd 1 tour (ceux à 0 expirent)">⬇️ −1 tour</button>
        </div>
        <div class="dur-track">${cols}</div>
        <div class="tok-addline">
          <select class="tok-sel-jeton" data-id="${c.id}">${jetonOpts}</select>
          <select class="tok-sel-dur" data-id="${c.id}">${durOpts}</select>
          <button class="tok-place" data-id="${c.id}">+ poser</button>
        </div>
      </div>`;
  }

  /* ---- équipement / passif ---- */
  function loadoutSummary(c) {
    if (c.kind === "pj") {
      const s = equippedSorts(c).map(x => esc(x.nom)).join(", ") || "—";
      const def = c.loadout && c.loadout.defense ? (sortById(c.loadout.defense)||{}).nom : null;
      const sh = c.loadout && c.loadout.shell ? (sortById(c.loadout.shell)||{}).nom : null;
      const arme = c.armeId ? (armeById(c.armeId)||{}).nom : null;
      return `<div class="equip-sum">
        <span>🗡️ ${arme?esc(arme):'—'}</span>
        <span>✨ ${s}</span>
        <span>🛡️ ${def?esc(def):'—'}</span>
        <span>🎮 ${sh?esc(sh):'—'}</span></div>`;
    }
    const atk = (c.attaques||[]).map(a => esc(a.nom)).join(", ") || "—";
    return `<div class="equip-sum">
      <span>⚔️ ${atk}</span>
      <span>🛡️ ${c.defense?esc(c.defense.nom):'—'}</span></div>
      ${c.passif?`<div class="mob-passif">★ Passif : ${esc(c.passif)}</div>`:''}`;
  }

  /* ---- panneau de choix d'action (inline) ---- */
  function chooserPanel(c) {
    const ch = Store.get().chooser;
    if (!ch || ch.id !== c.id) return "";
    if (ch.type === "sort") {
      const list = equippedSorts(c);
      if (!list.length) return `<div class="chooser">Aucun sort équipé. <b>⚙ Équipement</b> pour en ajouter.<button class="ch-cancel">✕</button></div>`;
      return `<div class="chooser"><span class="ch-h">Choisir un sort :</span>
        ${list.map(s => `<button class="ch-sort" data-id="${c.id}" data-sort="${s.id}">${esc(s.nom)} <em>${esc(s.pa)} PA</em></button>`).join("")}
        <button class="ch-cancel">✕</button></div>`;
    }
    if (ch.type === "mob-atk") {
      const list = c.attaques || [];
      if (!list.length) return `<div class="chooser">Aucune attaque définie. <b>⚙</b> pour en ajouter.<button class="ch-cancel">✕</button></div>`;
      return `<div class="chooser"><span class="ch-h">Choisir une attaque :</span>
        ${list.map((a,i) => `<button class="ch-mobatk" data-id="${c.id}" data-i="${i}">${esc(a.nom)}</button>`).join("")}
        <button class="ch-dice" data-id="${c.id}" title="Tirage aléatoire">🎲 hasard</button>
        <button class="ch-cancel">✕</button></div>`;
    }
    return "";
  }

  function actionRow(c) {
    if (c.blocked) {
      return `<div class="cbt-actions blocked-note">⛔ Bloqué — hors combat, ne peut pas agir.</div>`;
    }

    if (c.kind === "pj") {
      return `<div class="cbt-actions">
        <button class="act" data-id="${c.id}" data-act="pa1">+1 PA</button>
        <button class="act" data-id="${c.id}" data-act="concentre">🧠 +2</button>
        <button class="act primary-act" data-id="${c.id}" data-act="sort">✨ Sort</button>
        <button class="act" data-id="${c.id}" data-act="attaque">🗡️ Attaquer</button>
        <button class="act" data-id="${c.id}" data-act="defense">🛡️ Défense</button>
        <button class="act" data-id="${c.id}" data-act="shell">🎮 Shell</button>
        <button class="act" data-id="${c.id}" data-act="potion">🧪</button>
      </div>`;
    }
    return `<div class="cbt-actions">
      <button class="act primary-act" data-id="${c.id}" data-act="mob-atk">⚔️ Attaque</button>
      <button class="act" data-id="${c.id}" data-act="mob-def">🛡️ Défense</button>
    </div>`;
  }

  function classePassifHtml(classe) {
    return `<div class="mob-passif pj">
      ${classe.desc?`<em>${esc(classe.desc)}</em><br>`:''}
      ${(classe.passifs||[]).map(p=>`★ ${esc(p)}`).join("<br>")}</div>`;
  }

  function combatantCard(c, isActive) {
    const d = Store.deriveOf(c);
    const pvPct = Math.max(0, Math.min(100, Math.round(100 * c.pv / Math.max(1, c.pvMax))));
    const low = c.pv <= 0 ? "ko" : (pvPct <= 50 ? "warn" : "");
    const isPJ = c.kind === "pj";
    const classe = isPJ ? classeById(c.classeId) : null;
    const sub = isPJ
      ? `<button class="cbt-sub cbt-class" data-id="${c.id}" title="Voir le passif de classe">${classe?esc(classe.nom):''} · niv ${c.level||1} ⓘ</button>`
      : `<span class="cbt-sub">Monstre · niv ${c.level||1}</span>`;

    const blockTitle = c.blocked
      ? "Débloquer"
      : "Bloquer : hors combat / ne peut pas agir";

    return `
    <div class="combatant ${c.kind} ${isActive?'active':''} ${c.pv<=0?'down':''} ${c.blocked?'blocked':''}" data-id="${c.id}">
      <div class="cbt-head">
        <span class="kind-badge ${c.kind}">${c.kind==='pj'?'PJ':'PNJ'}</span>
        <input class="cbt-name" data-id="${c.id}" value="${esc(c.name)}" />
        ${sub}
        <button class="icon-btn block ${c.blocked?'on':''}" data-id="${c.id}" title="${blockTitle}" aria-pressed="${c.blocked?'true':'false'}">⛔</button>
        <button class="icon-btn dup" data-id="${c.id}" title="Dupliquer">⧉</button>
        <button class="icon-btn save" data-id="${c.id}" title="Enregistrer dans la bibliothèque">💾</button>
        <button class="icon-btn edit" data-id="${c.id}" title="Éditer / équipement">⚙</button>
        <button class="icon-btn del" data-id="${c.id}" title="Retirer">✕</button>
      </div>

      <div class="cbt-stats">${statLine(c)}</div>
      <div class="cbt-move">🌀 Déplacement / tour&nbsp;: <b>${d.cases}</b> case(s) + <b>${d.tours}</b> tour(s)
        <span class="muted tiny">(soit ${d.casesABS} case${d.casesABS>1?'s':''})</span></div>
      ${isPJ && classe && expandedPassifs.has(c.id) ? classePassifHtml(classe) : ''}
      ${loadoutSummary(c)}

      <div class="cbt-resources">
        <div class="res pv ${low}">
          <label>❤️ PV</label>
          <button class="res-dn" data-id="${c.id}" data-res="pv" data-d="-1">−</button>
          <input class="res-val" data-id="${c.id}" data-res="pv" value="${c.pv}" />
          <span class="res-max">/ <input class="res-max-in" data-id="${c.id}" data-res="pvMax" value="${c.pvMax}"/></span>
          <button class="res-up" data-id="${c.id}" data-res="pv" data-d="1">+</button>
          <button class="res-heal" data-id="${c.id}" title="PV au max">⟳</button>
          <div class="pv-bar"><span style="width:${pvPct}%"></span></div>
        </div>
        ${isPJ ? `
        <div class="res pa">
          <label>⚡ PA</label>
          <button class="res-dn" data-id="${c.id}" data-res="pa" data-d="-1">−</button>
          <input class="res-val" data-id="${c.id}" data-res="pa" value="${c.pa}" />
          <button class="res-up" data-id="${c.id}" data-res="pa" data-d="1">+</button>
        </div>
        <div class="res shell">
          <label>🎮 Shell</label>
          <button class="res-dn" data-id="${c.id}" data-res="shell" data-d="-1">−</button>
          <input class="res-val" data-id="${c.id}" data-res="shell" value="${c.shell}" />
          <span class="res-max">/10</span>
          <button class="res-up" data-id="${c.id}" data-res="shell" data-d="1">+</button>
        </div>` : ``}
      </div>

      ${tokenTrack(c)}
      ${actionRow(c)}
      ${chooserPanel(c)}
    </div>`;
  }

  /* ------------------------------------------------------------- Résolution */
  function buildCardEl(owner, cardType, ref) {
    if (cardType === "sort" || cardType === "defense" || cardType === "shell") {
      const s = sortById(ref); return s ? Cards.sortCard(s) : msgCard("Aucun sort équipé");
    }
    if (cardType === "arme") { const a = armeById(ref); return a ? Cards.armeCard(a) : msgCard("Aucune arme équipée"); }
    if (cardType === "mob-atk") { const e = (owner.attaques||[])[ref]; return e ? Cards.mobCard(e, "attaque") : msgCard("—"); }
    if (cardType === "mob-def") { return owner.defense ? Cards.mobCard(owner.defense, "defense") : msgCard("Pas de défense"); }
    return msgCard("—");
  }
  function msgCard(txt) {
    const el = document.createElement("div");
    el.className = "carte-msg"; el.textContent = txt; return el;
  }
  function targetDefenseEl(t) {
    if (t.kind === "pj") {
      const id = t.loadout && t.loadout.defense;
      const s = sortById(id);
      return s ? Cards.sortCard(s) : msgCard(esc(t.name) + " : pas de défense équipée");
    }
    return t.defense ? Cards.mobCard(t.defense, "defense") : msgCard(esc(t.name) + " : pas de défense");
  }

  /** Signature de l'état de résolution : si elle n'a pas changé, on ne reconstruit
   *  pas la zone (sinon une carte retournée se remet sur le recto et les
   *  animations redémarrent à chaque clic). */
  function resSignature(r) {
    if (!r) return "none";
    const att = Store.find(r.attackerId);
    const parts = [r.attackerId, r.cardType, r.cardId, r.needTarget ? 1 : 0,
      r.aoe ? 1 : 0, (r.targets || []).join(","), att ? att.name : ""];
    if (r.needTarget) {
      parts.push(Store.get().combatants.map(c => c.id + ":" + c.name + ":" + c.kind).join("|"));
    } else {
      (r.targets || []).forEach(id => {
        const t = Store.find(id);
        if (t) {
          const def = t.kind === "pj" ? (t.loadout && t.loadout.defense) : (t.defense && t.defense.nom);
          parts.push(id + ":" + t.name + ":" + def);
        }
      });
    }
    return parts.join("§");
  }

  function renderResolution() {
    const zone = $("#reszone");
    const r = Store.get().resolution;
    const sig = resSignature(r);
    if (sig === lastResSig) return;     // inchangé → préserve flip + animations
    lastResSig = sig;
    if (!r) { zone.innerHTML = ""; zone.classList.remove("open"); return; }
    zone.classList.add("open");
    const attacker = Store.find(r.attackerId);
    if (!attacker) { Store.clearResolution(); zone.innerHTML = ""; return; }

    zone.innerHTML = `
      <div class="res-head">
        <span class="res-title">Résolution — <b>${esc(attacker.name)}</b></span>
        <button id="res-clear" class="btn ghost">✕ Effacer</button>
      </div>
      <div class="res-body">
        <div class="res-side attacker"><div class="res-cap">Attaquant · ${esc(attacker.name)}</div><div class="res-slot" id="res-atk-card"></div></div>
        <div class="res-arrow">⚔️ ➜ 🛡️</div>
        <div class="res-side target" id="res-target-side"></div>
      </div>`;

    // carte attaquant
    $("#res-atk-card").appendChild(buildCardEl(attacker, r.cardType, r.cardId));

    const tside = $("#res-target-side");
    if (r.needTarget) {
      tside.innerHTML = `<div class="res-cap">Choisir une cible :</div><div class="target-buttons" id="target-buttons"></div>`;
      const tb = $("#target-buttons");
      Store.get().combatants.forEach(t => {
        if (t.id === attacker.id) return;
        const b = document.createElement("button");
        b.className = "tgt-btn " + t.kind;
        b.textContent = t.name;
        b.dataset.target = t.id;
        tb.appendChild(b);
      });
      const oppSide = attacker.kind === "pj" ? "monstre" : "pj";
      const aoe = document.createElement("button");
      aoe.className = "tgt-btn aoe";
      aoe.textContent = "💥 AOE équipe adverse";
      aoe.dataset.aoe = oppSide;
      tb.appendChild(aoe);
      const none = document.createElement("button");
      none.className = "tgt-btn none"; none.textContent = "Sans cible"; none.dataset.none = "1";
      tb.appendChild(none);
    } else {
      const tgts = (r.targets || []).map(Store.find).filter(Boolean);
      if (!tgts.length) {
        tside.innerHTML = `<div class="res-cap">Aucune cible</div>`;
      } else {
        tside.innerHTML = `<div class="res-cap">${r.aoe?'💥 AOE — ':''}Défense de ${tgts.map(t=>esc(t.name)).join(", ")}</div><div class="res-defs" id="res-defs"></div>`;
        const dd = $("#res-defs");
        tgts.forEach(t => {
          const wrap = document.createElement("div");
          wrap.className = "res-def-item";
          const cap = document.createElement("div");
          cap.className = "res-def-name"; cap.textContent = t.name + (t.kind==='pj'?' (PJ)':' (PNJ)');
          wrap.appendChild(cap);
          wrap.appendChild(targetDefenseEl(t));
          dd.appendChild(wrap);
        });
      }
    }
  }

  /* ------------------------------------------------------------ Roue / SVG */
  /** Combattant actif = entrée courante de la frise de priorité. */
  function activeCombatantId() {
    const st = Store.get(), e = (st.frieze || [])[st.activeIdx];
    return e ? e.id : null;
  }
  /* ---- roue d'initiative (SVG persistant + pions animés) ---- */
  const SVGNS = "http://www.w3.org/2000/svg";
  const W = { cx: 130, cy: 130, R: 86, caseR: 22 };
  let wheelBuilt = false;
  let arrowAngle = 0;   // angle ACCUMULÉ de la flèche (jamais remis mod 360) :
                        // évite que l'aiguille « revienne en arrière » au passage 6→1 / 1→6.

  // Position POLAIRE animée de chaque pion (id -> { angle continu, rayon, … }).
  // Le trajet est interpolé en angle+rayon (le long de l'anneau), pas en ligne
  // droite : un pion ne coupe jamais à travers le cercle (6→1, tour multi-cases),
  // et un clic rapide re-cible depuis la position courante (plus de saccades).
  let pawnAnim = {};
  let pawnRAF = null;
  const PAWN_DUR = 650;   // durée du trajet le long de l'anneau (ms)
  const reduceMotion = typeof matchMedia === "function"
    && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Deux premières lettres du nom (espaces ignorés), en majuscules. */
  function initials(name) {
    const s = String(name || "?").replace(/\s+/g, "");
    return (s.slice(0, 2) || "?").toUpperCase();
  }
  function caseCenter(i) {
    const a = (-90 + i * 360 / Wheel.SIZE) * Math.PI / 180;
    return { x: W.cx + W.R * Math.cos(a), y: W.cy + W.R * Math.sin(a), a: a };
  }

  /* --- animation des pions LE LONG DE L'ANNEAU (trajet polaire) ------------ */

  /** Pose un pion à (angle°, rayon) en coordonnées de la roue. */
  function applyPawnTransform(g, angleDeg, radius) {
    const a = angleDeg * Math.PI / 180;
    const x = W.cx + radius * Math.cos(a);
    const y = W.cy + radius * Math.sin(a);
    g.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /** Boucle d'animation : avance chaque pion vers sa cible (angle + rayon). */
  function tickPawns() {
    pawnRAF = null;
    const now = performance.now();
    let encore = false;

    Object.keys(pawnAnim).forEach(id => {
      const p = pawnAnim[id];

      if (!p.target) {
        return;
      }

      let k = p.dur > 0 ? (now - p.t0) / p.dur : 1;

      if (k > 1) {
        k = 1;
      }

      const progres = easeInOutCubic(k);
      p.angle = p.from.angle + (p.target.angle - p.from.angle) * progres;
      p.radius = p.from.radius + (p.target.radius - p.from.radius) * progres;

      if (p.g) {
        applyPawnTransform(p.g, p.angle, p.radius);
      }

      if (k >= 1) {
        p.angle = p.target.angle;
        p.radius = p.target.radius;
        p.target = null;
      } else {
        encore = true;
      }
    });

    if (encore) {
      pawnRAF = requestAnimationFrame(tickPawns);
    }
  }

  function ensurePawnRAF() {
    if (!pawnRAF) {
      pawnRAF = requestAnimationFrame(tickPawns);
    }
  }

  function buildWheelSkeleton() {
    let cases = "";
    for (let i = 0; i < Wheel.SIZE; i++) {
      const c = caseCenter(i);
      const nx = W.cx + (W.R + 28) * Math.cos(c.a), ny = W.cy + (W.R + 28) * Math.sin(c.a);
      cases += `<circle id="wcase-${i}" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${W.caseR}" class="wcase"/>`;
      cases += `<text x="${nx.toFixed(1)}" y="${(ny+3).toFixed(1)}" class="wnum">${i+1}</text>`;
    }
    $("#wheel-svg").innerHTML = `
      <defs>
        <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#7a5cff" stop-opacity=".5"/>
          <stop offset="60%" stop-color="#4da6ff" stop-opacity=".12"/>
          <stop offset="100%" stop-color="#7a5cff" stop-opacity="0"/>
        </radialGradient>
        <filter id="wglow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx="${W.cx}" cy="${W.cy}" r="124" class="wbackglow" fill="url(#wheelGlow)"/>
      <circle cx="${W.cx}" cy="${W.cy}" r="${W.R+12}" class="wrune wrune-a"/>
      <circle cx="${W.cx}" cy="${W.cy}" r="${W.R-10}" class="wrune wrune-b"/>
      <circle cx="${W.cx}" cy="${W.cy}" r="${W.R}" class="wring"/>
      <circle cx="${W.cx}" cy="${W.cy}" r="${W.R}" class="wflourish"/>
      <g class="wheel-cases">${cases}</g>
      <g class="wheel-arrow"><path class="warrow-needle" d="M0,-70 L5,-6 L-5,-6 Z"/><circle class="warrow-hub" r="4"/></g>
      <text x="${W.cx}" y="${W.cy-5}" class="wcenter">TOUR</text>
      <text x="${W.cx}" y="${W.cy+19}" class="wcenter big" id="wheel-turn-big">1</text>
      <g class="wheel-pawns"></g>`;
    wheelBuilt = true;
  }

  function updateWheel() {
    if (!wheelBuilt) buildWheelSkeleton();
    const st = Store.get();
    const combatants = st.combatants;
    const F = Store.flechePos();                    // case de la flèche (le plus lent)

    for (let i = 0; i < Wheel.SIZE; i++) {
      const el = document.getElementById("wcase-" + i);
      if (el) el.classList.toggle("arrow", i === F && combatants.length > 0);
    }
    const am = $("#wheel-svg .wheel-arrow");
    if (am) {
      if (combatants.length) {
        // plus court chemin : on ajoute le delta normalisé dans (-180, 180] à
        // l'angle accumulé, pour que la flèche ne fasse jamais le tour complet.
        const cible = F * 60;
        const actuelNorm = ((arrowAngle % 360) + 360) % 360;
        let delta = ((cible - actuelNorm + 540) % 360) - 180;
        arrowAngle += delta;
        am.style.transform = `translate(${W.cx}px, ${W.cy}px) rotate(${arrowAngle}deg)`;
        am.style.opacity = "1";
      } else { am.style.opacity = "0"; }
    }
    const tb = document.getElementById("wheel-turn-big");
    if (tb) tb.textContent = st.turn;

    // pions : un <g> par combattant, positionné par transform (CSS transition)
    const layer = $("#wheel-svg .wheel-pawns");
    const byCase = {};
    combatants.forEach(c => { const ci = Wheel.caseOf(c); (byCase[ci] = byCase[ci] || []).push(c); });
    const seen = {};
    Object.keys(byCase).forEach(ci => {
      const arr = byCase[ci], cc = caseCenter(+ci);
      arr.forEach((c, idx) => {
        seen[c.id] = 1;
        const isPJ = c.kind === "pj";
        let g = document.getElementById("wp-" + c.id);
        const fresh = !g;
        if (fresh) {
          g = document.createElementNS(SVGNS, "g");
          g.id = "wp-" + c.id;
          g.innerHTML = `<title></title><circle r="13" class="wtok"/><text class="wtok-lbl" y="4">${esc(initials(c.name))}</text>`;
          g.addEventListener("mouseenter", () => {       // au survol : passe au-dessus
            const par = g.parentNode; if (par && g !== par.lastChild) par.appendChild(g);
          });
          layer.appendChild(g);
        } else {
          const t = g.querySelector(".wtok-lbl");
          if (t) t.textContent = initials(c.name);
        }
        g.setAttribute("class", "wpawn " + (isPJ ? "pj" : "mob") + (c.blocked ? " blocked" : ""));
        const tt = g.querySelector("title"); if (tt) tt.textContent = c.name + (c.blocked ? " (bloqué)" : "");

        // cible : angle de la case + léger étalement RADIAL si plusieurs pions empilés.
        const spread = 13, base = -(arr.length - 1) / 2;
        const radiusCible = W.R + (base + idx) * spread;
        const angleBrut = -90 + (+ci) * 360 / Wheel.SIZE;

        if (fresh || !pawnAnim[c.id]) {            // apparition : pose directe, sans trajet
          pawnAnim[c.id] = { angle: angleBrut, radius: radiusCible, target: null, g: g };
          applyPawnTransform(g, angleBrut, radiusCible);
        } else {
          const p = pawnAnim[c.id];
          p.g = g;
          // angle cible CONTINU : plus court chemin depuis l'angle courant → le pion
          // longe l'anneau (6→1 ne traverse plus le cercle), depuis sa position en cours.
          const angleContinu = p.angle + (((angleBrut - p.angle) % 360 + 540) % 360 - 180);
          const dejaArrive = Math.abs(angleContinu - p.angle) < 0.01
            && Math.abs(radiusCible - p.radius) < 0.01;

          if (!dejaArrive) {
            p.from = { angle: p.angle, radius: p.radius };
            p.target = { angle: angleContinu, radius: radiusCible };
            p.t0 = performance.now();
            p.dur = reduceMotion ? 0 : PAWN_DUR;
            ensurePawnRAF();
          }
        }
      });
    });
    Array.from(layer.children).forEach(g => {
      const id = g.id.replace("wp-", "");

      if (!seen[id]) {
        delete pawnAnim[id];
        g.remove();
      }
    });
  }

  /** Petit éclat magique quand la roue tourne (tour global). */
  function spinWheelFlourish() {
    const svg = $("#wheel-svg"); if (!svg) return;
    svg.classList.remove("spinning");
    void svg.offsetWidth;                  // relance l'animation
    svg.classList.add("spinning");
    setTimeout(() => svg.classList.remove("spinning"), 950);
  }

  function renderWheel() {
    const st = Store.get();
    updateWheel();
    renderFrieze();
    $("#turn-num").textContent = st.turn;
  }

  /** Frise de priorité : cubes colorés (ordre de jeu du tour) + liste détaillée. */
  function renderFrieze() {
    const st = Store.get();
    const frieze = st.frieze || [];
    $("#frieze").innerHTML = frieze.length ? frieze.map((e, idx) => {
      const c = Store.find(e.id); if (!c) return "";
      const cls = (c.kind === "pj" ? "pj" : "mob") + (e.bonus ? " bonus" : "") + (idx === st.activeIdx ? " active" : "") + (c.blocked ? " blocked" : "");
      return `<button class="fcube ${cls}" data-idx="${idx}" title="${esc(c.name)}${e.bonus?' — tour bonus':''}${c.blocked?' — bloqué':''}">${esc(initials(c.name))}</button>`;
    }).join("") : `<span class="muted tiny">—</span>`;
    $("#order-list").innerHTML = frieze.map((e, idx) => {
      const c = Store.find(e.id); if (!c) return "";
      const tag = e.bonus ? ` <span class="rep">★ bonus</span>` : "";
      return `<li class="${idx===st.activeIdx?'active':''} ${c.kind==='pj'?'pj':'mob'}" data-idx="${idx}">
        <span class="ord-n">${idx+1}</span> ${esc(c.name)}${tag}</li>`;
    }).join("") || `<li class="muted">Aucun combattant</li>`;
  }

  /* ------------------------------------------------------------------ Render */
  function renderCombat() {
    const st = Store.get();
    const activeId = activeCombatantId();
    const wrap = $("#combatants");
    if (!st.combatants.length) {
      wrap.innerHTML = `<div class="empty">Aucun combattant. Ajoutez un PJ ou un monstre ci-dessus.</div>`;
    } else {
      wrap.innerHTML = st.combatants.map(c => combatantCard(c, c.id === activeId)).join("");
    }
    renderResolution();
    renderWheel();
    renderLog();
  }
  function renderLog() {
    const st = Store.get();
    $("#log").innerHTML = st.log.map(l =>
      `<li><span class="log-t">T${l.t}</span> ${esc(l.m)}</li>`).join("") || `<li class="muted">—</li>`;
  }

  /* ---------------------------------------------------------------- Events */
  function clampRes(c, res, val) {
    if (res === "shell") return Math.max(0, Math.min(10, val));
    if (res === "pv") return Math.min(val, c.pvMax);
    return Math.max(0, val);
  }

  function bindCombatEvents() {
    const root = $("#view-combat");

    root.addEventListener("click", e => {
      const t = e.target;
      const id = t.dataset.id;

      if (t.classList.contains("del")) { expandedPassifs.delete(id); Store.removeCombatant(id); renderCombat(); return; }
      if (t.classList.contains("block")) {
        const bloque = Store.toggleBlocked(id);
        Store.log(`${(Store.find(id)||{}).name||''} ${bloque ? "bloqué (hors combat)" : "débloqué"}.`);
        renderCombat(); return;
      }
      if (t.classList.contains("edit")) { openEdit(id); return; }
      if (t.classList.contains("dup")) {
        const n = Store.duplicate(id);
        if (n) Store.log(`${n.name} ajouté (duplication).`);
        renderCombat(); return;
      }
      if (t.classList.contains("save")) {
        Store.saveToLibrary(id);
        Store.log(`${(Store.find(id)||{}).name||''} enregistré dans la bibliothèque.`);
        renderCombat(); return;
      }
      if (t.classList.contains("cbt-class")) {
        if (expandedPassifs.has(id)) expandedPassifs.delete(id); else expandedPassifs.add(id);
        renderCombat(); return;
      }

      if (t.classList.contains("res-up") || t.classList.contains("res-dn")) {
        const c = Store.find(id), res = t.dataset.res;
        c[res] = clampRes(c, res, (c[res]||0) + num(t.dataset.d,0)); Store.save(); renderCombat(); return;
      }
      if (t.classList.contains("res-heal")) { const c = Store.find(id); c.pv = c.pvMax; Store.save(); renderCombat(); return; }

      // jetons
      if (t.classList.contains("tok-up")) { Store.addToken(id, t.dataset.jeton, 1, t.dataset.where); renderCombat(); return; }
      if (t.classList.contains("tok-dn")) { Store.addToken(id, t.dataset.jeton, -1, t.dataset.where); renderCombat(); return; }
      if (t.classList.contains("tok-shift")) { Store.shiftTokens(id); Store.log(`${Store.find(id).name} : jetons réduits d'un tour.`); renderCombat(); return; }
      if (t.classList.contains("tok-place")) {
        const card = t.closest(".cbt-tokens");
        const jeton = card.querySelector(".tok-sel-jeton").value;
        const where = card.querySelector(".tok-sel-dur").value;
        Store.addToken(id, jeton, 1, where); renderCombat(); return;
      }

      // actions
      if (t.classList.contains("act")) { handleAction(Store.find(id), t.dataset.act); return; }

      // chooser
      if (t.classList.contains("ch-cancel")) { Store.clearChooser(); renderCombat(); return; }
      if (t.classList.contains("ch-sort")) { castSort(Store.find(t.dataset.id), t.dataset.sort); return; }
      if (t.classList.contains("ch-mobatk")) { mobAttack(Store.find(t.dataset.id), num(t.dataset.i,0)); return; }
      if (t.classList.contains("ch-dice")) {
        const c = Store.find(t.dataset.id); const n = (c.attaques||[]).length;
        if (n) mobAttack(c, Math.floor(Math.random()*n)); return;
      }

      // résolution : cibles
      if (t.id === "res-clear") { Store.clearResolution(); renderCombat(); return; }
      if (t.classList.contains("tgt-btn")) { chooseTarget(t); return; }

      // ordre / frise : sélectionner une entrée
      const fcube = t.closest(".fcube[data-idx]");
      if (fcube) { Store.get().activeIdx = num(fcube.dataset.idx,0); Store.save(); renderCombat(); return; }
      const li = t.closest("#order-list li[data-idx]");
      if (li) { Store.get().activeIdx = num(li.dataset.idx,0); Store.save(); renderCombat(); }
    });

    root.addEventListener("change", e => {
      const t = e.target, id = t.dataset.id;
      if (t.classList.contains("res-val") || t.classList.contains("res-max-in")) {
        const c = Store.find(id), res = t.dataset.res;
        c[res] = clampRes(c, res, num(t.value, c[res]||0));
        if (res === "pvMax" && c.pv > c.pvMax) c.pv = c.pvMax;
        Store.save(); renderCombat();
      }
      if (t.classList.contains("cbt-name")) { const c = Store.find(id); c.name = t.value; Store.save(); }
    });
  }

  function handleAction(c, act) {
    if (!c) return;
    switch (act) {
      case "pa1":       c.pa += 1; Store.log(`${c.name} : +1 PA → ${c.pa}`); Store.save(); renderCombat(); break;
      case "concentre": c.pa += 2; Store.log(`${c.name} se concentre : +2 PA → ${c.pa}`); Store.save(); renderCombat(); break;
      case "potion":    Store.log(`${c.name} utilise une potion.`); Store.save(); renderCombat(); break;
      case "sort":      Store.setChooser(c.id, "sort"); renderCombat(); break;
      case "mob-atk":   Store.setChooser(c.id, "mob-atk"); renderCombat(); break;
      case "attaque":
        if (!c.armeId) { Store.log(`${c.name} n'a pas d'arme équipée (⚙ pour en équiper).`); Store.save(); renderCombat(); break; }
        Store.setResolution({ attackerId: c.id, cardType: "arme", cardId: c.armeId, targets: [], needTarget: true });
        Store.log(`${c.name} attaque à l'arme (${(armeById(c.armeId)||{}).nom||''}).`); renderCombat(); break;
      case "defense":
        if (!c.loadout || !c.loadout.defense) { Store.log(`${c.name} : pas de sort de défense équipé.`); Store.save(); renderCombat(); break; }
        Store.setResolution({ attackerId: c.id, cardType: "defense", cardId: c.loadout.defense, targets: [c.id], needTarget: false });
        renderCombat(); break;
      case "shell":
        if (!c.loadout || !c.loadout.shell) { Store.log(`${c.name} : pas de sort de Shell Control équipé.`); Store.save(); renderCombat(); break; }
        if (c.shell < 10) { Store.log(`${c.name} : Shell Control indisponible (${c.shell}/10).`); Store.save(); renderCombat(); break; }
        c.shell = 0;
        Store.setResolution({ attackerId: c.id, cardType: "shell", cardId: c.loadout.shell, targets: [], needTarget: true });
        Store.log(`${c.name} active Shell Control : ${(sortById(c.loadout.shell)||{}).nom||''} (−10 points).`);
        renderCombat(); break;
      case "mob-def":
        Store.setResolution({ attackerId: c.id, cardType: "mob-def", targets: [c.id], needTarget: false });
        renderCombat(); break;
    }
  }

  function castSort(c, sortId) {
    const s = sortById(sortId); if (!c || !s) return;
    const cost = parsePA(s.pa);
    c.pa = Math.max(0, (c.pa||0) - cost);
    Store.clearChooser();
    Store.setResolution({ attackerId: c.id, cardType: "sort", cardId: sortId, targets: [], needTarget: true });
    Store.log(`${c.name} lance ${s.nom} (−${cost} PA → ${c.pa}).`);
    renderCombat();
  }

  function mobAttack(c, i) {
    if (!c) return;
    const a = (c.attaques||[])[i]; if (!a) return;
    Store.clearChooser();
    Store.setResolution({ attackerId: c.id, cardType: "mob-atk", cardId: i, targets: [], needTarget: true });
    Store.log(`${c.name} prépare : ${a.nom}.`);
    renderCombat();
  }

  function chooseTarget(btn) {
    const r = Store.get().resolution; if (!r) return;
    if (btn.dataset.none) { r.targets = []; r.aoe = false; }
    else if (btn.dataset.aoe) {
      r.targets = Store.get().combatants.filter(c => c.kind === btn.dataset.aoe).map(c => c.id);
      r.aoe = true;
    } else {
      r.targets = [btn.dataset.target]; r.aoe = false;
    }
    r.needTarget = false;
    Store.setResolution(r);
    const names = r.targets.map(id => (Store.find(id)||{}).name).filter(Boolean).join(", ");
    Store.log(`Cible(s) : ${r.aoe?'AOE — ':''}${names||'aucune'}.`);
    renderCombat();
  }

  /* --------------------------------------------------------- Turn controls */
  function bindTurnControls() {
    $("#btn-next-turn").addEventListener("click", () => { Store.nextTurn(); Store.log(`— Tour global ${Store.get().turn} —`); renderCombat(); spinWheelFlourish(); });
    $("#btn-next-actor").addEventListener("click", () => {
      const st = Store.get(), len = (st.frieze || []).length;
      if (len) st.activeIdx = (st.activeIdx + 1) % len;
      Store.save(); renderCombat();
    });
    $("#btn-reset-wheel").addEventListener("click", () => {
      if (confirm("Réinitialiser la roue (case 1, tour 1) ? PV/PA/jetons conservés.")) { Store.resetWheel(); renderCombat(); }
    });
    $("#btn-clear").addEventListener("click", () => { if (confirm("Tout effacer ?")) { Store.clearAll(); renderCombat(); } });
    $("#btn-push").addEventListener("click", () => nudgeActive(-1));
    $("#btn-pull").addEventListener("click", () => nudgeActive(1));
  }
  function nudgeActive(delta) {
    const id = activeCombatantId(); if (!id) return;
    Store.nudge(id, delta);             // déplace + détecte les dépassements de flèche
    renderCombat();
  }

  /* ============================================================ Modale add/edit */
  function fillSelectClasses() {
    $("#pj-classe").innerHTML = (window.DB.classes||[]).map(k => `<option value="${k.id}">${esc(k.nom)}</option>`).join("");
    $("#pj-arme").innerHTML = `<option value="">— aucune —</option>` +
      (window.DB.armes||[]).map(a => `<option value="${a.id}">${esc(a.nom)}</option>`).join("");
    $("#pj-defense").innerHTML = `<option value="">— aucun —</option>` +
      (window.DB.sorts||[]).filter(s=>s.type==="defense").map(s => `<option value="${s.id}">${esc(s.nom)}</option>`).join("");
    $("#pj-shell").innerHTML = `<option value="">— aucun —</option>` +
      (window.DB.sorts||[]).filter(s=>s.type==="shell").map(s => `<option value="${s.id}">${esc(s.nom)}</option>`).join("");
    $("#pj-sorts").innerHTML = (window.DB.sorts||[])
      .filter(s => ["attaque","soin","utilitaire","passif"].indexOf(s.type) >= 0)
      .map(s => `<label class="spell-check"><input type="checkbox" value="${s.id}"/> <span>${esc(s.nom)} <em>${esc(s.pa)} PA · ${Cards.TYPE_LABEL[s.type]||s.type}</em></span></label>`).join("");
    $("#mob-preset").innerHTML = `<option value="">— vierge —</option>` +
      (window.DB.monstres||[]).map(m => `<option value="${m.id}">${esc(m.nom)}</option>`).join("");
    fillDatalists();
  }

  /** Listes d'autocomplétion : sorts+armes (attaques) et défenses. */
  function fillDatalists() {
    const opt = arr => arr.map(x => `<option value="${esc(x.nom)}"></option>`).join("");
    const dlSA = $("#dl-sorts-armes"), dlDef = $("#dl-defenses");
    if (dlSA) dlSA.innerHTML = opt(window.DB.sorts||[]) + opt(window.DB.armes||[]);
    if (dlDef) dlDef.innerHTML = opt((window.DB.sorts||[]).filter(s => s.type === "defense"));
  }

  /** Cherche un sort OU une arme par nom (insensible à la casse). */
  function findByName(name) {
    const n = (name||"").trim().toLowerCase(); if (!n) return null;
    return (window.DB.sorts||[]).concat(window.DB.armes||[])
      .find(x => (x.nom||"").toLowerCase() === n) || null;
  }
  function tableSummary(t) {
    if (!t || !t.lignes) return "";
    return t.lignes.map(l => l.filter(c => c && c !== "—").join(" : ")).filter(Boolean).join(" / ");
  }

  function bindAddForms() {
    $("#btn-add-pj").addEventListener("click", () => openModal("pj"));
    $("#btn-add-mob").addEventListener("click", () => openModal("mob"));
    $$("[data-close-modal]").forEach(b => b.addEventListener("click", closeModal));
    $("#modal-backdrop").addEventListener("click", e => { if (e.target.id==="modal-backdrop") closeModal(); });

    ["pj-classe","pj-level","pj-con","pj-for","pj-vit","pj-ctrl","pj-int","pj-vol"]
      .forEach(idn => $("#"+idn).addEventListener("input", previewPJ));
    $("#pj-sorts").addEventListener("change", limitSorts);
    $("#pj-sorts-filter").addEventListener("input", filterSorts);
    $("#pj-sorts-filter").addEventListener("keydown", e => { if (e.key === "Enter") e.preventDefault(); });

    $("#mob-preset").addEventListener("change", () => loadPreset($("#mob-preset").value));
    ["mob-level","mob-con","mob-for","mob-vit","mob-ctrl","mob-int","mob-vol"]
      .forEach(idn => $("#"+idn).addEventListener("input", previewMob));
    $("#mob-add-atk").addEventListener("click", () => { mobAtkRows.push({nom:"",de:"",desc:""}); renderMobAtkRows(); });
    $("#mob-import-atk-btn").addEventListener("click", importMobAttack);
    $("#mob-import-atk").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); importMobAttack(); } });
    $("#mob-import-def-btn").addEventListener("click", importMobDefense);
    $("#mob-import-def").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); importMobDefense(); } });

    $("#form-pj").addEventListener("submit", e => { e.preventDefault(); submitPJ(); });
    $("#form-mob").addEventListener("submit", e => { e.preventDefault(); submitMob(); });
  }

  function limitSorts() {
    const checked = $$("#pj-sorts input:checked");
    if (checked.length > 6) { checked[checked.length-1].checked = false; alert("6 sorts maximum."); }
  }
  function filterSorts() {
    const q = $("#pj-sorts-filter").value.toLowerCase();
    $$("#pj-sorts .spell-check").forEach(l => {
      l.style.display = l.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
    });
  }

  /* ---- import autocomplete (monstre) ---- */
  function importMobAttack() {
    const inp = $("#mob-import-atk"), it = findByName(inp.value);
    if (!it) { alert("Sort/arme introuvable : « " + inp.value + " »"); return; }
    mobAtkRows.push({
      nom: it.nom, de: it.de || "",
      desc: it.desc || tableSummary(it.table) || "",
      table: it.table
    });
    inp.value = ""; renderMobAtkRows();
  }
  function importMobDefense() {
    const inp = $("#mob-import-def"), it = findByName(inp.value);
    if (!it) { alert("Sort introuvable : « " + inp.value + " »"); return; }
    $("#mob-def-nom").value = it.nom;
    $("#mob-def-de").value = it.de || "";
    $("#mob-def-eff").value = it.desc || tableSummary(it.table) || "";
    inp.value = ""; previewMob();
  }

  function openModal(which, prefill) {
    $("#modal-backdrop").classList.add("open");
    $("#pane-pj").classList.toggle("hidden", which !== "pj");
    $("#pane-mob").classList.toggle("hidden", which !== "mob");
    $("#form-pj").classList.toggle("hidden", which !== "pj");
    $("#form-mob").classList.toggle("hidden", which !== "mob");
    if (which === "pj") { if (!prefill) resetPJForm(); previewPJ(); }
    else { if (!prefill) resetMobForm(); previewMob(); }
  }
  function closeModal() { $("#modal-backdrop").classList.remove("open"); editId = null; $("#modal-title").textContent = ""; }

  function resetPJForm() {
    $("#pj-name").value=""; $("#pj-level").value=1; $("#pj-classe").selectedIndex=0; $("#pj-arme").value="";
    $("#pj-defense").value=""; $("#pj-shell").value="";
    ["con","for","vit","ctrl","int","vol"].forEach(s=>$("#pj-"+s).value=0);
    $$("#pj-sorts input").forEach(i=>i.checked=false);
  }
  function resetMobForm() {
    $("#mob-preset").value=""; $("#mob-name").value=""; $("#mob-level").value=1;
    ["con","for","vit","ctrl","int","vol"].forEach(s=>$("#mob-"+s).value=0);
    $("#mob-passif").value=""; $("#mob-def-nom").value=""; $("#mob-def-de").value=""; $("#mob-def-eff").value="";
    mobAtkRows = []; renderMobAtkRows();
  }

  function loadPreset(id) {
    const m = (window.DB.monstres||[]).find(x => x.id === id); if (!m) return;
    $("#mob-name").value = m.nom; $("#mob-level").value = m.level||1;
    Rules.STATS.forEach(s => $("#mob-"+s.toLowerCase()).value = m.stats[s]||0);
    $("#mob-passif").value = m.passif || "";
    const def = m.defense || {};
    $("#mob-def-nom").value = def.nom||""; $("#mob-def-de").value = def.de||"";
    $("#mob-def-eff").value = def.desc || (def.table ? "(voir fiche wiki)" : "");
    mobAtkRows = (m.attaques||[]).map(a => ({ nom:a.nom||"", de:a.de||"", desc:a.desc||(a.table?"(voir fiche)":""), table:a.table }));
    renderMobAtkRows(); previewMob();
  }

  function renderMobAtkRows() {
    $("#mob-atks").innerHTML = mobAtkRows.map((a,i) => `
      <div class="atk-row" data-i="${i}">
        <input class="atk-nom" data-i="${i}" placeholder="Nom" value="${esc(a.nom)}"/>
        <input class="atk-de" data-i="${i}" placeholder="Dé (1D20…)" value="${esc(a.de)}"/>
        <input class="atk-desc" data-i="${i}" placeholder="Effet" value="${esc(a.desc)}"/>
        <button type="button" class="atk-del" data-i="${i}">✕</button>
      </div>`).join("");
    $$("#mob-atks .atk-del").forEach(b => b.addEventListener("click", () => { mobAtkRows.splice(num(b.dataset.i,0),1); renderMobAtkRows(); }));
    $$("#mob-atks input").forEach(inp => inp.addEventListener("input", () => {
      const i = num(inp.dataset.i,0);
      if (inp.classList.contains("atk-nom")) mobAtkRows[i].nom = inp.value;
      if (inp.classList.contains("atk-de")) mobAtkRows[i].de = inp.value;
      if (inp.classList.contains("atk-desc")) mobAtkRows[i].desc = inp.value;
    }));
  }

  function readPJ() {
    const sorts = $$("#pj-sorts input:checked").map(i => i.value);
    return {
      kind: "pj",
      name: $("#pj-name").value.trim() || "Nouveau PJ",
      classeId: $("#pj-classe").value, level: num($("#pj-level").value,1),
      bonus: { CON:num($("#pj-con").value,0), FOR:num($("#pj-for").value,0), VIT:num($("#pj-vit").value,0),
        CTRL:num($("#pj-ctrl").value,0), INT:num($("#pj-int").value,0), VOL:num($("#pj-vol").value,0) },
      armeId: $("#pj-arme").value || null,
      loadout: { sorts: sorts, defense: $("#pj-defense").value || null, shell: $("#pj-shell").value || null }
    };
  }
  function renderClasseInfo() {
    const k = classeById($("#pj-classe").value);
    $("#pj-classe-info").innerHTML = k ? `
      <div class="class-info-box">
        <em>${esc(k.desc||"")}</em>
        ${(k.passifs||[]).map(p=>`<div class="ci-passif">★ ${esc(p)}</div>`).join("")}
      </div>` : "";
  }

  function previewPJ() {
    const c = readPJ(), s = Store.statsOf(c), d = Rules.derive(s, c.level);
    renderClasseInfo();
    const total = Rules.STATS.reduce((a,k)=>a+(c.bonus[k]||0),0);
    $("#pj-preview").innerHTML = `
      <div class="prev-stats">${Rules.STATS.map(k=>`<span class="stat-chip"><b>${k}</b> ${s[k]} <i>(${Rules.fmtMod(d.mods[k])})</i></span>`).join("")}</div>
      <div class="prev-der">❤️ PV <b>${d.PV}</b> · 🎯 ${d.cases} cases + ${d.tours}t (abs ${d.casesABS}) · ⚖ ${d.poids}</div>
      <div class="prev-note ${total!==12?'warn':''}">Bonus perso : <b>${total}</b> / 12</div>`;
  }

  function readMob() {
    return {
      kind: "monstre",
      name: $("#mob-name").value.trim() || "Monstre",
      level: num($("#mob-level").value,1),
      stats: { CON:num($("#mob-con").value,0), FOR:num($("#mob-for").value,0), VIT:num($("#mob-vit").value,0),
        CTRL:num($("#mob-ctrl").value,0), INT:num($("#mob-int").value,0), VOL:num($("#mob-vol").value,0) },
      passif: $("#mob-passif").value.trim(),
      attaques: mobAtkRows.filter(a => a.nom.trim()).map(a => {
        const o = { nom:a.nom.trim(), de:a.de.trim(), desc:a.desc.trim() };
        if (a.table) o.table = a.table; return o;
      }),
      defense: ($("#mob-def-nom").value.trim() || $("#mob-def-eff").value.trim())
        ? { nom:$("#mob-def-nom").value.trim()||"Défense", de:$("#mob-def-de").value.trim(), desc:$("#mob-def-eff").value.trim() }
        : null
    };
  }
  function previewMob() {
    const c = readMob(), d = Rules.derive(c.stats, c.level);
    $("#mob-preview").innerHTML = `
      <div class="prev-stats">${Rules.STATS.map(k=>`<span class="stat-chip"><b>${k}</b> ${c.stats[k]} <i>(${Rules.fmtMod(d.mods[k])})</i></span>`).join("")}</div>
      <div class="prev-der">❤️ PV <b>${d.PV}</b> · 🎯 ${d.cases} cases + ${d.tours}t (abs ${d.casesABS}) · ⚖ ${d.poids}</div>`;
  }

  function submitPJ() {
    const data = readPJ();
    if (editId) { Store.updateCombatant(editId, data); Store.log(`${data.name} mis à jour.`); }
    else { Store.addCombatant(data); Store.log(`${data.name} rejoint le combat.`); }
    closeModal(); renderCombat();
  }
  function submitMob() {
    const data = readMob();
    if (editId) { Store.updateCombatant(editId, data); Store.log(`${data.name} mis à jour.`); }
    else { Store.addCombatant(data); Store.log(`${data.name} rejoint le combat.`); }
    closeModal(); renderCombat();
  }

  /* ---- édition d'un combattant existant ---- */
  function openEdit(id) {
    const c = Store.find(id); if (!c) return;
    editId = id;
    $("#modal-title").textContent = "Édition";
    if (c.kind === "pj") {
      openModal("pj", true);
      $("#pj-name").value = c.name; $("#pj-level").value = c.level||1;
      $("#pj-classe").value = c.classeId; $("#pj-arme").value = c.armeId||"";
      Rules.STATS.forEach(s => $("#pj-"+s.toLowerCase()).value = (c.bonus||{})[s]||0);
      const lo = c.loadout||{};
      $("#pj-defense").value = lo.defense||""; $("#pj-shell").value = lo.shell||"";
      $$("#pj-sorts input").forEach(i => i.checked = (lo.sorts||[]).indexOf(i.value) >= 0);
      previewPJ();
    } else {
      openModal("mob", true);
      $("#mob-preset").value = "";
      $("#mob-name").value = c.name; $("#mob-level").value = c.level||1;
      Rules.STATS.forEach(s => $("#mob-"+s.toLowerCase()).value = (c.stats||{})[s]||0);
      $("#mob-passif").value = c.passif||"";
      const def = c.defense||{};
      $("#mob-def-nom").value = def.nom||""; $("#mob-def-de").value = def.de||""; $("#mob-def-eff").value = def.desc||"";
      mobAtkRows = (c.attaques||[]).map(a => ({ nom:a.nom||"", de:a.de||"", desc:a.desc||"", table:a.table }));
      renderMobAtkRows(); previewMob();
    }
  }

  /* =================================================================== CARTES */
  function withDelete(el, kind, id) {
    const b = document.createElement("button");
    b.className = "carte-del"; b.title = "Supprimer cette carte"; b.textContent = "🗑";
    b.addEventListener("click", ev => { ev.stopPropagation(); deleteCard(kind, id); });
    el.appendChild(b);
    return el;
  }
  function renderCartes() {
    const filter = $("#carte-filter").value, gal = $("#cartes-gallery");
    gal.innerHTML = "";
    if (filter === "all" || filter === "arme")
      (window.DB.armes||[]).forEach(a => gal.appendChild(withDelete(Cards.armeCard(a), "arme", a.id)));
    (window.DB.sorts||[]).forEach(s => {
      if (filter === "all" || filter === s.type) gal.appendChild(withDelete(Cards.sortCard(s), "sort", s.id));
    });
  }
  function deleteCard(kind, id) {
    if (!confirm("Supprimer définitivement cette carte des données ?\n(l'image éventuelle n'est pas supprimée)")) return;
    fetch("api/delete-card", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: kind, id: id })
    })
      .then(r => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)))
      .then(() => {
        const arr = kind === "arme" ? (window.DB.armes||[]) : (window.DB.sorts||[]);
        const i = arr.findIndex(c => c.id === id);
        if (i >= 0) arr.splice(i, 1);
        renderCartes();
      })
      .catch(err => alert("Suppression impossible (" + err.message + ").\nLance le serveur (lancer-simulateur.bat / .sh, ou node server.js)."));
  }
  function bindCartes() {
    $("#carte-filter").addEventListener("change", renderCartes);
    $("#btn-print").addEventListener("click", () => window.print());
  }

  /* =============================================================== BIBLIOTHÈQUE */
  function renderLibrary() {
    const items = Store.getLibrary();
    const list = $("#lib-list");
    if (!items.length) { list.innerHTML = `<div class="empty">Bibliothèque vide. Cliquez 💾 sur une fiche pour l'enregistrer.</div>`; return; }
    list.innerHTML = items.map((t, i) => {
      const cl = t.kind === "pj" ? (classeById(t.classeId)||{}).nom : "Monstre";
      return `<div class="lib-item">
        <span class="kind-badge ${t.kind}">${t.kind==='pj'?'PJ':'PNJ'}</span>
        <span class="lib-name">${esc(t.name)}</span>
        <span class="lib-meta">${esc(cl||'')} · niv ${t.level||1}</span>
        <button class="btn primary mini lib-add" data-i="${i}">+ Combat</button>
        <button class="icon-btn lib-del" data-i="${i}" title="Supprimer">✕</button>
      </div>`;
    }).join("");
  }

  function bindLibrary() {
    $("#btn-library").addEventListener("click", () => { renderLibrary(); $("#lib-backdrop").classList.add("open"); });
    $$("[data-close-lib]").forEach(b => b.addEventListener("click", () => $("#lib-backdrop").classList.remove("open")));
    $("#lib-backdrop").addEventListener("click", e => { if (e.target.id === "lib-backdrop") $("#lib-backdrop").classList.remove("open"); });
    $("#lib-list").addEventListener("click", e => {
      const t = e.target;
      if (t.classList.contains("lib-add")) {
        const c = Store.addFromLibrary(num(t.dataset.i,0));
        if (c) Store.log(`${c.name} ajouté depuis la bibliothèque.`);
        renderCombat();
      }
      if (t.classList.contains("lib-del")) {
        if (confirm("Supprimer ce modèle de la bibliothèque ?")) { Store.removeFromLibrary(num(t.dataset.i,0)); renderLibrary(); }
      }
    });
  }

  /* =============================================================== EXPORT / IMPORT */
  function download(filename, text) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function bindExportImport() {
    $("#btn-export").addEventListener("click", () => {
      download(`combat-forteresse-T${Store.get().turn}.json`, Store.exportJSON());
    });
    $("#btn-import").addEventListener("click", () => $("#import-file").click());
    $("#import-file").addEventListener("change", e => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          Store.importJSON(ev.target.result);
          expandedPassifs.clear();
          renderCombat();
          Store.log(`Combat importé (${Store.get().combatants.length} combattant(s)).`); Store.save();
        } catch (err) { alert("Import impossible : " + err.message); }
        $("#import-file").value = "";
      };
      reader.readAsText(f);
    });
  }

  /* ------------------------------------------------------------------- Init */
  function init() {
    Store.load();
    initTabs(); fillSelectClasses(); bindAddForms(); bindCombatEvents();
    bindTurnControls(); bindCartes(); bindLibrary(); bindExportImport(); renderCombat();
  }

  // initialisé par js/boot.js après chargement des données JSON
  window.App = { init: init, render: renderCombat };
})();
